import type { TokenamiProperties } from 'tokenami';
import * as Tokenami from '@tokenami/config';

const _TOKENAMI_CSS = Symbol.for('@tokenami/css');

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: TokenamiProperties };
type TokenamiCSSResult = Record<string, any>;
type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type Override = TokenamiProperties | TokenamiCSS | false | undefined;
type ClassName = string | undefined | null | false;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };

type TokenamiComposeInput<V, R> = TokenamiProperties & {
  includes?: (TokenamiComposeResult<any> | TokenamiCSS)[];
  variants?: V & VariantsConfig;
};

type TokenamiComposeResult<V> = (
  selectedVariants?: Variants<V>
) => [cn: (...classNames: ClassName[]) => string, style: (...overrides: Override[]) => TokenamiCSS];

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

  function css(...allStyles: [TokenamiProperties, ...Override[]]): TokenamiCSS {
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

  css.compose = <V extends VariantsConfig | undefined, R extends VariantsConfig | undefined>(
    styleConfig: TokenamiComposeInput<V, R>
  ): TokenamiComposeResult<V> => {
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
        const variantValue = variants?.[key]?.[variant as any];
        if (variantValue) variantStyles.push(variantValue);
      }

      const result: ReturnType<TokenamiComposeResult<V>> = [
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

function generateCacheId(objs: (object | Override)[]) {
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

const lruCache = {
  limit: 1_500,
  cache: new Map(),
  get(key: string) {
    const value = this.cache.get(key);
    if (!value) return;
    // re-insert as most recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  },
  set(key: string, value: any) {
    // ensure inserts are most recent
    this.cache.delete(key);
    // remove oldest entry
    if (this.cache.size === this.limit) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, value);
  },
};

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
export type { TokenamiCSS };
export { createCss };
