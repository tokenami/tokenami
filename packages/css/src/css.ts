import type { TokenamiProperties } from 'tokenami';
import * as Tokenami from '@tokenami/config';

const _TOKENAMI_CSS = Symbol.for('@tokenami/css');

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: TokenamiProperties };
type TokenamiCSSResult = Record<string, any>;
type TokenamiOverride = TokenamiProperties | TokenamiCSS | false | undefined;
type VariantsConfig<T> = { [K in keyof T]: { [V in keyof T[K]]: TokenamiProperties } };
type VariantNumber<T> = T extends `${infer N extends number}` ? N : T;
type VariantBoolean<T> = T extends 'true' | 'false' ? boolean : T;
type VariantValue<T> = VariantNumber<VariantBoolean<T>>;
type ClassName = string | undefined | null | false;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };

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

const composeStylesMap = new WeakMap<object, Record<string, any>>();

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

  function css(...allStyles: [TokenamiProperties, ...TokenamiOverride[]]): TokenamiCSS {
    const cacheId = generateCacheId(allStyles);
    const cached = lruCache.get(cacheId);
    if (cached) return cached;

    const opts = (globalThis as any)[_TOKENAMI_CSS];
    const overriddenStyles: TokenamiCSSResult = {};
    const overriddenComposeStyles: TokenamiCSSResult = {};
    composeStylesMap.set(overriddenStyles, overriddenComposeStyles);

    for (const styles of allStyles) {
      if (!styles) continue;
      const composeStyles = composeStylesMap.get(styles) ?? {};
      const composeEntries = Object.entries(composeStyles);
      const entries = [...composeEntries, ...Object.entries(styles)];
      const aliasProperties = Tokenami.iterateAliasProperties(entries, config);

      for (const [key, value, propertyConfig] of aliasProperties) {
        const tokenProperty = Tokenami.TokenProperty.safeParse(key);
        const isComposedProperty = composeStyles[key] != null;

        if (!tokenProperty.success) {
          overriddenStyles[key] = value;
          continue;
        }

        // this will most likely be one property only
        for (const cssProperty of propertyConfig.cssProperties) {
          const longProperty = Tokenami.createLonghandProperty(tokenProperty.output, cssProperty);
          const parsedProperty = Tokenami.parseProperty(longProperty, opts);
          const calcToggle = Tokenami.calcProperty(parsedProperty);

          overrideLonghands(overriddenStyles, parsedProperty);

          const target =
            isComposedProperty && overriddenComposeStyles[parsedProperty] == null
              ? overriddenComposeStyles
              : overriddenStyles;

          // this must happen each iteration so that each override applies to the
          // mutated css object from the previous override iteration
          target[parsedProperty] = value;

          if (isComposedProperty) continue;
          if (propertyConfig.isCalc) overriddenStyles[calcToggle] = '/*on*/';
          else delete overriddenStyles[calcToggle];
        }
      }
    }

    lruCache.set(cacheId, overriddenStyles);
    return overriddenStyles as any as TokenamiCSS;
  }

  css.compose = <T>(styleConfig: TokenamiComposeInput<T>): TokenamiComposeOutput<T> => {
    const { includes = [], variants, ...baseStyles } = styleConfig;
    const className = Tokenami.generateClassName(baseStyles);

    return function generate(selectedVariants = {}) {
      const cacheId = generateCacheId([baseStyles, variants, selectedVariants, ...includes]);
      const cached = lruCache.get(cacheId);
      if (cached) return cached;

      const selectedVariantsEntries = Object.entries(selectedVariants);
      let variantStyles: TokenamiProperties[] = [];
      let includeStyles: TokenamiCSS[] = [];
      let includeClassNames: string[] = [];

      for (const include of includes) {
        if (typeof include === 'function') {
          const [cn, styles] = include(selectedVariants);
          includeClassNames.push(cn());
          includeStyles.push(styles());
        } else {
          includeStyles.push(include);
        }
      }

      for (const [key, variant] of selectedVariantsEntries) {
        const variantGroup = variants?.[key as keyof typeof variants];
        const variantValue = variantGroup?.[variant as keyof typeof variantGroup];
        if (variantValue) variantStyles.push(variantValue);
      }

      const result: ReturnType<TokenamiComposeOutput<T>> = [
        cn.bind(null, ...includeClassNames, className),
        (...overrides) => {
          const styles = {};
          composeStylesMap.set(styles, baseStyles);
          return css.apply(null, [...includeStyles, styles, ...variantStyles, ...overrides] as any);
        },
      ];

      lruCache.set(cacheId, result);
      return result;
    };
  };

  return css;
}

/* -------------------------------------------------------------------------------------------------
 * generateCacheId
 * -----------------------------------------------------------------------------------------------*/

function generateCacheId(objs: (object | TokenamiOverride)[]) {
  return JSON.stringify(objs, (_, value) => {
    if (typeof value === 'object' && value !== null && composeStylesMap.has(value)) {
      return { ...value, ...composeStylesMap.get(value) };
    }
    return value;
  });
}

/* -------------------------------------------------------------------------------------------------
 * lruCache
 * -----------------------------------------------------------------------------------------------*/

const lruCache = Tokenami.createLRUCache(1_500);

/* -------------------------------------------------------------------------------------------------
 * cn
 * -----------------------------------------------------------------------------------------------*/

function cn(...classNames: ClassName[]) {
  return classNames.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------------------------------
 * overrideLonghands
 * -----------------------------------------------------------------------------------------------*/

function overrideLonghands(style: TokenamiCSSResult, tokenProperty: Tokenami.TokenProperty) {
  const parts = Tokenami.getTokenPropertySplit(tokenProperty);
  const longhands = Tokenami.mapShorthandToLonghands.get(parts.alias as any) || [];
  for (const longhand of longhands) {
    const tokenPropertyLong = Tokenami.createLonghandProperty(tokenProperty, longhand);
    const calcProp = Tokenami.calcProperty(tokenPropertyLong);
    const composeStyles = composeStylesMap.get(style);
    const composedValue = composeStyles?.[tokenPropertyLong];

    if (composedValue) {
      const value = composedValue ?? style[tokenPropertyLong];
      if (typeof value === 'number') style[calcProp] = 'initial';
      style[tokenPropertyLong] = 'initial';
    } else {
      delete style[tokenPropertyLong];
      delete style[calcProp];
    }

    overrideLonghands(style, tokenPropertyLong);
  }
}

/* ---------------------------------------------------------------------------------------------- */

export const css = createCss({});
export type { TokenamiCSS, TokenamiComposeOutput, Variants };
export { createCss };
