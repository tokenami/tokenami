import type { TokenamiProperties } from 'tokenami';
import * as Tokenami from '@tokenami/config';

let _TOKENAMI_CSS = Symbol.for('@tokenami/css');

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: TokenamiProperties };
type TokenamiCSSResult = Record<string, any>;
type TokenamiOverride = TokenamiProperties | TokenamiCSS | false | undefined;
type VariantsConfig<T> = { [K in keyof T]: { [V in keyof T[K]]: TokenamiProperties } };
type VariantNumber<T> = T extends `${infer N extends number}` ? N : T;
type VariantBoolean<T> = T extends 'true' | 'false' ? boolean : T;
type VariantValue<T> = VariantNumber<VariantBoolean<T>>;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };
type LonghandOverride = [longProp: Tokenami.TokenProperty, calcProp: Tokenami.TokenProperty];
type ParsedProperty = [property: Tokenami.TokenProperty, overrides: LonghandOverride[]];
type PropertyConfig = ParsedProperty[] | 0;
type ClassName = string | undefined | null | false;

type TokenamiComposeInput<T> = TokenamiProperties & {
  includes?: (TokenamiComposeOutput<any> | TokenamiCSS)[];
  variants?: VariantsConfig<T>;
};

type TokenamiComposeOutput<T> = (
  selectedVariants?: Variants<T>
) => [
  cn: (...classNames: ClassName[]) => string,
  style: (...overrides: TokenamiOverride[]) => TokenamiCSS
];

/* -------------------------------------------------------------------------------------------------
 * createCss
 * -----------------------------------------------------------------------------------------------*/

type CreateCssOptions = {
  /**
   * When using arbitrary values, Tokenami will escape special characters. Some frameworks
   * automatically escape so this would result in double-escaping. In that case, switch this
   * off to hand over to your framework.
   *
   * @default true
   */
  escapeSpecialChars?: boolean;
};

function createCss(
  config: Pick<Tokenami.Config, 'aliases'>,
  options: CreateCssOptions = { escapeSpecialChars: true }
) {
  (globalThis as any)[_TOKENAMI_CSS] = options;
  let cssCache = Tokenami.createLRUCache();
  let propCache = Tokenami.createLRUCache<PropertyConfig>();
  let composeMap = new WeakMap<object, Record<string, any>>();
  // Tracks properties that have emitted numeric grid toggles during this runtime so inherited
  // values can inherit matching parent `__calc` without requiring the user config.
  let calcStore = new Set<Tokenami.TokenProperty>();

  /* -------------------------------------------------------------------------------------------------
   * css
   * -----------------------------------------------------------------------------------------------*/

  function css(...allStyles: [TokenamiProperties, ...TokenamiOverride[]]): TokenamiCSS {
    let id = generateSxId(allStyles);
    let cached = cssCache.get(id);
    if (cached) return cached;

    let opts = (globalThis as any)[_TOKENAMI_CSS];
    let result: TokenamiCSSResult = {};
    let composeResult: TokenamiCSSResult = {};
    composeMap.set(result, composeResult);

    function add(key: string, value: any, composed: boolean) {
      let config = getProperty(key, opts);

      if (!config) {
        result[key] = value;
        return;
      }

      for (let [prop, overrides] of config) {
        if (overrides.length) overrideLonghands(result, overrides);
        let prop__calc = Tokenami.calcProperty(prop);
        let target = composed && composeResult[prop] == null ? composeResult : result;

        // this must happen each iteration so that each override applies to the
        // mutated css object from the previous override iteration
        target[prop] = value;
        if (composed) continue;

        if (typeof value === 'number' && value !== 0) {
          result[prop__calc] = '/*on*/';
          calcStore.add(prop);
        } else if (value === 'inherit' && calcStore.has(prop)) {
          result[prop__calc] = 'inherit';
        } else {
          delete result[prop__calc];
        }
      }
    }

    for (let styles of allStyles) {
      if (!styles) continue;
      let composeSx = composeMap.get(styles) ?? {};
      for (let key in composeSx) add(key, composeSx[key], true);
      for (let key in styles) add(key, (styles as any)[key], composeSx[key] != null);
    }

    cssCache.set(id, result);
    return result as any as TokenamiCSS;
  }

  /* -------------------------------------------------------------------------------------------------
   * compose
   * -----------------------------------------------------------------------------------------------*/

  css.compose = <T>(input: TokenamiComposeInput<T>): TokenamiComposeOutput<T> => {
    let { includes = [], variants, ...composeSx } = input;
    let cn = Tokenami.generateClassName(composeSx);
    let cache = Tokenami.createLRUCache<ReturnType<TokenamiComposeOutput<T>>>();

    return function generate(currVariants = {}) {
      let id = stringId(currVariants);
      let cached = cache.get(id);
      if (cached) return cached;

      let baseSx = {} as TokenamiProperties;
      let variantSx: TokenamiProperties[] = [];
      let includeSx: TokenamiCSS[] = [];
      let includeCn: string[] = [];

      for (let incl of includes) {
        if (typeof incl === 'function') {
          let [cn, sx] = incl(currVariants);
          includeCn.push(cn());
          includeSx.push(sx());
        } else {
          includeSx.push(incl);
        }
      }

      for (const key in currVariants) {
        const variant = currVariants[key as keyof typeof currVariants];
        const group = variants?.[key as keyof typeof variants];
        const value = group?.[variant as keyof typeof group];
        if (value) variantSx.push(value);
      }

      let result: ReturnType<TokenamiComposeOutput<T>> = [
        (...cns: ClassName[]) => [...includeCn, cn, ...cns].filter(Boolean).join(' '),
        // @ts-ignore
        (...sx) => css(...includeSx, baseSx, ...variantSx, ...sx),
      ];

      composeMap.set(baseSx, composeSx);
      cache.set(id, result);
      return result;
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * getProperty
   * -----------------------------------------------------------------------------------------------*/

  function getProperty(key: string, opts: CreateCssOptions): PropertyConfig | void {
    let cached = propCache.get(key);
    if (cached !== undefined) return cached;

    let tokenProperty = Tokenami.TokenProperty.safeParse(key);
    if (!tokenProperty.success) return propCache.set(key, 0);

    let parts = Tokenami.getTokenPropertySplit(tokenProperty.output);
    let cssProperties = (config.aliases as any)?.[parts.alias] || [parts.alias];
    let properties: Exclude<PropertyConfig, 0> = [];

    for (let cssProperty of cssProperties) {
      let longProperty = Tokenami.createLonghandProperty(tokenProperty.output, cssProperty);
      let parsedProperty = Tokenami.parseProperty(longProperty, opts);
      properties.push([parsedProperty, getLonghandOverrides(parsedProperty)]);
    }

    propCache.set(key, properties);
    return properties;
  }

  /* -------------------------------------------------------------------------------------------------
   * generateSxId
   * -----------------------------------------------------------------------------------------------*/

  function generateSxId(objs: readonly (object | false | undefined)[]) {
    let id = '';

    for (let obj of objs) {
      if (!obj) continue;
      let composeSx = composeMap.get(obj);
      if (composeSx) id += stringId(composeSx);
      id += stringId(obj);
    }

    return id;
  }

  /* -------------------------------------------------------------------------------------------------
   * stringId
   * -----------------------------------------------------------------------------------------------*/

  function stringId(obj: object) {
    let id = '';
    for (let key in obj) id += key + ':' + String((obj as any)[key]) + ';';
    return id;
  }

  /* -------------------------------------------------------------------------------------------------
   * overrideLonghands
   * -----------------------------------------------------------------------------------------------*/

  function overrideLonghands(result: TokenamiCSSResult, overrides: LonghandOverride[]) {
    let composeSx = composeMap.get(result);

    for (let [longProp, calcProp] of overrides) {
      let composeValue = composeSx?.[longProp];

      if (composeValue) {
        let value = composeValue ?? result[longProp];
        if (typeof value === 'number') result[calcProp] = 'initial';
        result[longProp] = 'initial';
      } else {
        delete result[longProp];
        delete result[calcProp];
      }
    }
  }

  /* -------------------------------------------------------------------------------------------------
   * getLonghandOverrides
   * -----------------------------------------------------------------------------------------------*/

  function getLonghandOverrides(tokenProperty: Tokenami.TokenProperty) {
    let parts = Tokenami.getTokenPropertySplit(tokenProperty);
    let longhands = Tokenami.mapShorthandToLonghands.get(parts.alias as any) || [];
    let overrides: LonghandOverride[] = [];

    for (let long of longhands) {
      let longProp = Tokenami.createLonghandProperty(tokenProperty, long);
      let calcProp = Tokenami.calcProperty(longProp);
      overrides.push([longProp, calcProp], ...getLonghandOverrides(longProp));
    }

    return overrides;
  }

  return css;
}

/* ---------------------------------------------------------------------------------------------- */

export let css = createCss({});
export type { TokenamiCSS, TokenamiComposeOutput, Variants };
export { createCss };
