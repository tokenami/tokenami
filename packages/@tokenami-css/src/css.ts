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
type ParsedProperty = [
  property: Tokenami.TokenProperty,
  baseProperty: Tokenami.TokenProperty,
  overrides: Tokenami.TokenProperty[]
];

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
   * off to hand over to your framework. It configures every Tokenami css instance in the
   * current runtime.
   *
   * @default true
   */
  escapeSpecialChars?: boolean;
};

function createCss(config: Pick<Tokenami.Config, 'aliases'>, options?: CreateCssOptions) {
  let runtimeOptions: CreateCssOptions = ((globalThis as any)[_TOKENAMI_CSS] ??= {
    escapeSpecialChars: true,
  });

  // Mutate the shared object so css instances from other package copies observe explicit options.
  if (options) Object.assign(runtimeOptions, options);

  let propertyCache = new Map<string, ParsedProperty[] | null>();
  let composedStyles = new WeakMap<object, TokenamiCSSResult>();
  let resultCache = Tokenami.createLRUCache<TokenamiCSS>();
  let lastId: string | undefined;
  let lastResult: TokenamiCSS | undefined;

  /* -------------------------------------------------------------------------------------------------
   * css
   * -----------------------------------------------------------------------------------------------*/

  function css(...styles: TokenamiOverride[]): TokenamiCSS {
    let id = styleId(styles);
    if (id === lastId) return lastResult!;

    let result = resultCache.get(id);
    if (!result) {
      result = flatten(styles);
      resultCache.set(id, result);
    }

    lastId = id;
    lastResult = result;
    return result;
  }

  function flatten(styles: TokenamiOverride[], seed?: TokenamiCSS): TokenamiCSS {
    let result: TokenamiCSSResult = { ...seed };
    let seedComposed = seed && composedStyles.get(seed);
    let composed = seedComposed;

    function setProperty(key: string, value: any, isComposed: boolean) {
      let properties = getProperties(key);
      if (!properties) {
        result[key] = value;
        return;
      }

      for (let [property, baseProperty, overrides] of properties) {
        for (let longhand of overrides) {
          if (composed?.[longhand] !== undefined) {
            result[longhand] = 'initial';
          } else if (longhand in result) {
            delete result[longhand];
          }
        }

        let keepComposed = isComposed && composed?.[property] === undefined;
        let target = keepComposed ? composed! : result;
        target[property] = keepComposed ? value : Tokenami.parseValue(value, baseProperty);
      }
    }

    for (let style of styles) {
      if (!style) continue;
      let composeStyle = composedStyles.get(style);

      if (composeStyle) {
        if (composed === seedComposed) composed = { ...composed };
        for (let key in composeStyle) {
          setProperty(key, composeStyle[key], true);
        }
      }

      for (let key in style) {
        setProperty(key, style[key as keyof typeof style], composeStyle?.[key] !== undefined);
      }
    }

    if (composed) composedStyles.set(result, composed);
    return result as TokenamiCSS;
  }

  /* -------------------------------------------------------------------------------------------------
   * compose
   * -----------------------------------------------------------------------------------------------*/

  css.compose = <T>(input: TokenamiComposeInput<T>): TokenamiComposeOutput<T> => {
    let { includes = [], variants, ...composeStyle } = input;
    let ownClassName = Tokenami.generateClassName(composeStyle);
    let variantCache = new Map<string, ReturnType<TokenamiComposeOutput<T>>>();

    return function generate(selectedVariants) {
      let id = objectId(selectedVariants);
      let cached = variantCache.get(id);
      if (cached) return cached;

      let internalStyles: TokenamiOverride[] = [];
      let baseStyle = {} as TokenamiProperties;
      let className = '';

      composedStyles.set(baseStyle, composeStyle);

      for (let include of includes) {
        if (typeof include === 'function') {
          let [cn, sx] = include(selectedVariants);
          className += cn() + ' ';
          internalStyles.push(sx());
        } else {
          internalStyles.push(include);
        }
      }

      className += ownClassName;
      internalStyles.push(baseStyle);

      for (let key in selectedVariants) {
        let variant = selectedVariants[key as keyof typeof selectedVariants];
        let group = variants?.[key as keyof typeof variants];
        let value = group?.[variant as keyof typeof group];
        if (value) internalStyles.push(value);
      }

      let resolvedStyle: TokenamiCSS | undefined;
      let overrideCache = Tokenami.createLRUCache<TokenamiCSS>();

      let result: ReturnType<TokenamiComposeOutput<T>> = [
        (...classNames) => {
          let value = className;

          for (let className of classNames) {
            if (className) value += ' ' + className;
          }

          return value;
        },

        (...overrides) => {
          resolvedStyle ??= flatten(internalStyles);
          if (!overrides.length) return resolvedStyle;
          let id = styleId(overrides);
          if (!id) return resolvedStyle;
          let cached = overrideCache.get(id);
          if (cached) return cached;

          let result = flatten(overrides, resolvedStyle);
          overrideCache.set(id, result);

          return result;
        },
      ];

      variantCache.set(id, result);
      return result;
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * getProperties
   * -----------------------------------------------------------------------------------------------*/

  function getProperties(key: string): ParsedProperty[] | null {
    let cached = propertyCache.get(key);
    if (cached !== undefined) return cached;

    if (!isCSSVariable(key)) {
      propertyCache.set(key, null);
      return null;
    }

    let { alias } = Tokenami.getTokenPropertySplit(key);
    let cssProperties = (config.aliases as any)?.[alias] || [alias];
    let prefix = key.slice(0, -alias.length);
    let properties: ParsedProperty[] = [];

    for (let cssProperty of cssProperties) {
      let expandedProperty = (prefix + cssProperty) as Tokenami.TokenProperty;
      let property = Tokenami.parseProperty(expandedProperty, runtimeOptions);
      let baseProperty = Tokenami.parseProperty(
        Tokenami.tokenProperty(cssProperty),
        runtimeOptions
      );
      properties.push([property, baseProperty, getLonghandOverrides(property, cssProperty)]);
    }

    propertyCache.set(key, properties);
    return properties;
  }

  /* -------------------------------------------------------------------------------------------------
   * getLonghandOverrides
   * -----------------------------------------------------------------------------------------------*/

  function getLonghandOverrides(
    tokenProperty: Tokenami.TokenProperty,
    cssProperty: string
  ): Tokenami.TokenProperty[] {
    let longhands = Tokenami.mapShorthandToLonghands.get(cssProperty as any);
    if (!longhands) return [];

    let prefix = tokenProperty.slice(0, -cssProperty.length);
    let overrides = new Set<Tokenami.TokenProperty>();

    for (let longhand of longhands) {
      let property = (prefix + longhand) as Tokenami.TokenProperty;
      overrides.add(property);

      for (let longhandProperty of getLonghandOverrides(property, longhand)) {
        overrides.add(longhandProperty);
      }
    }

    return [...overrides];
  }

  /* -------------------------------------------------------------------------------------------------
   * styleId
   * -----------------------------------------------------------------------------------------------*/

  function styleId(styles: TokenamiOverride[]) {
    let id = '';

    for (let style of styles) {
      if (!style) continue;
      let composed = composedStyles.get(style);
      if (composed) id += '\0c' + objectId(composed) + '\0;';
      id += objectId(style);
    }

    return id;
  }

  return css;
}

/* -------------------------------------------------------------------------------------------------
 * objectId
 * -----------------------------------------------------------------------------------------------*/

function objectId(style?: TokenamiCSSResult) {
  let id = '';

  for (let key in style) {
    let value = style[key];
    id += key + ':' + (typeof value === 'number' ? '\0' + value : value) + ';}';
  }

  return id;
}

/* -------------------------------------------------------------------------------------------------
 * isCSSVariable
 * -----------------------------------------------------------------------------------------------*/

function isCSSVariable(property: string): property is Tokenami.TokenProperty {
  return property.length > 2 && property[0] === '-' && property[1] === '-' && property[2] !== '-';
}

/* ---------------------------------------------------------------------------------------------- */

export let css = createCss({});

export type { TokenamiCSS, TokenamiComposeOutput, Variants };
export { createCss };
