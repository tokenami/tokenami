import type { TokenamiProperties, TokenamiFinalConfig } from 'tokenami';
import * as Tokenami from '@tokenami/config';

const _TOKENAMI_CSS = Symbol.for('@tokenami/css');
const _COMPOSE = Symbol('TOKENAMI_COMPOSE');

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: TokenamiProperties };
type TokenamiCSSResult = Record<string, any> & { [_COMPOSE]: Record<Tokenami.TokenProperty, any> };
type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof NonNullable<TokenamiFinalConfig['responsive']>, string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;
type Override = TokenamiProperties | TokenamiCSS | false | undefined;
type ClassName = string | undefined | null | false;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = undefined extends C
  ? {}
  : { [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> } }[keyof C];

type TokenamiComposeInput<V, R> = TokenamiProperties & {
  includes?: (TokenamiComposeResult<any, any> | TokenamiCSS)[];
  variants?: V & VariantsConfig;
  responsiveVariants?: R & VariantsConfig;
};

type TokenamiComposeResult<V, R> = (
  selectedVariants?: Variants<V> & Variants<R> & ResponsiveVariants<R>
) => [cn: (...classNames: ClassName[]) => string, style: (...overrides: Override[]) => TokenamiCSS];

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
    const overriddenStyles: TokenamiCSSResult = { [_COMPOSE]: {} };

    for (const styles of allStyles) {
      if (!styles) continue;
      const composeEntries = Object.entries((styles as any)[_COMPOSE] ?? {});
      const entries = [...composeEntries, ...Object.entries(styles)];
      const aliasProperties = Tokenami.iterateAliasProperties(entries, config);

      for (const [key, value, propertyConfig] of aliasProperties) {
        const tokenProperty = Tokenami.TokenProperty.safeParse(key);
        const isComposedProperty = (styles as any)[_COMPOSE]?.[key] != null;

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
            isComposedProperty && !overriddenStyles[_COMPOSE][parsedProperty]
              ? overriddenStyles[_COMPOSE]
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
  ): TokenamiComposeResult<V, R> => {
    const { includes = [], variants, responsiveVariants, ...baseStyles } = styleConfig;
    const className = Tokenami.generateClassName(baseStyles);

    return function generate(selectedVariants = {}) {
      const cacheId = generateCacheId({ styleConfig, selectedVariants });
      const cached = lruCache.get(cacheId);
      if (cached) return cached;

      const variantEntries = Object.entries(selectedVariants);
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

      for (const [key, variant] of variantEntries) {
        if (!variant) continue;
        const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
        const responsive = responsiveVariants?.[type]?.[variant as any];
        const variantValue = variants?.[type]?.[variant as any] ?? responsive;

        if (bp && responsive) {
          variantStyles.push(convertToMediaStyles(bp, responsive));
        } else if (variantValue) {
          variantStyles.push(variantValue);
        }
      }

      const result: ReturnType<TokenamiComposeResult<V, R>> = [
        cn.bind(null, ...includeClassNames, className),
        (...overrides) => {
          const styles = { [_COMPOSE]: baseStyles } as any;
          const base: Override = css(styles, ...variantStyles, ...overrides);
          return css.apply(null, [...includeStyles, base] as any);
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

function generateCacheId(obj: object) {
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      const newValue = { ...value };
      const symbols = Object.getOwnPropertySymbols(value);
      for (const sym of symbols) {
        newValue[sym.toString()] = value[sym];
      }
      return newValue;
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
    const composedValue = style[_COMPOSE]?.[tokenPropertyLong];

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

/* -------------------------------------------------------------------------------------------------
 * convertToMediaStyles
 * -----------------------------------------------------------------------------------------------*/

function convertToMediaStyles(bp: string, styles: TokenamiProperties): TokenamiProperties {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const tokenPrefix = Tokenami.tokenProperty('');
    const bpPrefix = Tokenami.parsedVariantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

/* ---------------------------------------------------------------------------------------------- */

export const css = createCss({});
export type { TokenamiCSS };
export { createCss, convertToMediaStyles, _COMPOSE };
