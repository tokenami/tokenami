import type { TokenamiProperties, TokenamiFinalConfig } from '@tokenami/dev';
import * as Tokenami from '@tokenami/config';

const _TOKENAMI_CSS = Symbol.for('@tokenami/css');

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: 'TokenamiCSS' };
type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof TokenamiFinalConfig['responsive'], string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;
type Override = TokenamiProperties | TokenamiCSS | false | undefined;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = undefined extends C
  ? {}
  : { [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> } }[keyof C];

type Compose<T extends ComposeStyleConfig<any, any>> = {
  [K in keyof T]: GenerateCSS<T[K]['variants'], T[K]['responsiveVariants']>;
};

type ComposeStyleConfig<V, R> = {
  [key: string]: TokenamiProperties & {
    variants?: V & VariantsConfig;
    responsiveVariants?: R & VariantsConfig;
  };
};

type GenerateCSS<V, R> = (
  selectedVariants?: Variants<V> & Variants<R> & ResponsiveVariants<R>,
  ...overrides: Override[]
) => TokenamiCSS;

const cache = {
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
  set(key: string, value: TokenamiCSS) {
    // ensure inserts are most recent
    this.cache.delete(key);
    // remove oldest entry
    if (this.cache.size === this.limit) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, value);
  },
};

/* -------------------------------------------------------------------------------------------------
 * createCss
 * -----------------------------------------------------------------------------------------------*/

type CreateCssOptions = {
  /**
   * When using arbitrary values, Tokenami will escape special characters. Some frameworks
   * automatically escape so this would result in double-escaping. In that case, switch this
   * off to hand-off to your framework.
   *
   * @default true
   */
  escapeSpecialChars?: boolean;
};

function createCss(config: Tokenami.Config, options?: CreateCssOptions) {
  (globalThis as any)[_TOKENAMI_CSS] = options || {};
  const globalOptions: CreateCssOptions = (globalThis as any)[_TOKENAMI_CSS];

  function css(baseStyles: TokenamiProperties, ...overrides: Override[]): TokenamiCSS {
    let overriddenStyles = {} as TokenamiCSS;
    const cacheId = JSON.stringify({ baseStyles, overrides });
    const cached = cache.get(cacheId);

    if (cached) return cached;
    const allStyles = [baseStyles, ...overrides];

    for (const originalStyles of allStyles) {
      if (!originalStyles) continue;

      for (let [key, value] of Object.entries(originalStyles)) {
        if (!key.startsWith('--')) {
          overriddenStyles[key as any] = value;
          continue;
        }

        const tokenProperty = key as Tokenami.TokenProperty;
        const parts = Tokenami.getTokenPropertySplit(tokenProperty);
        const cssProperties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);

        // most the time this will only be one property
        for (const cssProperty of cssProperties) {
          const longProperty = createLonghandProperty(tokenProperty, cssProperty);
          const isNumber = typeof value === 'number' && value > 0;
          const parsedProperty = Tokenami.parseProperty(longProperty, globalOptions);

          overrideLonghands(overriddenStyles, parsedProperty);
          // this must happen each iteration so that each override applies to the
          // mutated css object from the previous override iteration
          overriddenStyles[parsedProperty as any] = value;
          // add grid toggle to enable grid calc for grid properties. set it to
          // undefined to remove the toggle if it was added by a previous iteration.
          // it cannot be an empty string because some fws strip it (e.g. vite)
          // @ts-ignore
          overriddenStyles[calcProperty(parsedProperty)] = isNumber ? '/*on*/' : undefined;
        }
      }
    }

    cache.set(cacheId, overriddenStyles);
    return overriddenStyles;
  }

  css.compose = <T extends ComposeStyleConfig<any, any>>(configs: T): Compose<T> => {
    const result = {} as Compose<T>;

    const generate = <V, R>(
      styleConfig: ComposeStyleConfig<V, R>[string],
      selectedVariants: Variants<V> & Variants<R> & ResponsiveVariants<R> = {},
      ...overrides: Override[]
    ): TokenamiCSS => {
      const cacheId = JSON.stringify({ styleConfig, selectedVariants, overrides });
      const cached = cache.get(cacheId);
      if (cached) return cached;

      const { variants, responsiveVariants, ...baseStyles } = styleConfig;
      let variantStyles: Override[] = [];

      for (const [key, variant] of Object.entries(selectedVariants)) {
        if (!variant) continue;
        const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
        const responsive = responsiveVariants?.[type]?.[variant as any];
        if (bp && responsive) {
          variantStyles.push(convertToMediaStyles(bp, responsive));
        } else {
          variantStyles.push(variants?.[type]?.[variant as any] ?? responsive);
        }
      }

      const styles = css(baseStyles, ...variantStyles, ...overrides);
      cache.set(cacheId, styles);
      return styles;
    };

    for (const [key, styleConfig] of Object.entries(configs)) {
      result[key as keyof T] = generate.bind(null, styleConfig) as GenerateCSS<any, any>;
    }

    return result;
  };

  return css;
}

/* -------------------------------------------------------------------------------------------------
 * overrideLonghands
 * -----------------------------------------------------------------------------------------------*/

function overrideLonghands(style: Record<string, any>, tokenProperty: Tokenami.TokenProperty) {
  const parts = Tokenami.getTokenPropertySplit(tokenProperty);
  const longhands: string[] = Tokenami.mapShorthandToLonghands.get(parts.alias as any) || [];
  longhands.forEach((longhand) => {
    const tokenPropertyLong = createLonghandProperty(tokenProperty, longhand);
    if (style[tokenPropertyLong]) {
      delete style[tokenPropertyLong];
      delete style[calcProperty(tokenPropertyLong)];
    }
    overrideLonghands(style, tokenPropertyLong);
  });
}

/* -------------------------------------------------------------------------------------------------
 * calcProperty
 * -----------------------------------------------------------------------------------------------*/

const calcProperty = (property: string) => property + '__calc';

/* -------------------------------------------------------------------------------------------------
 * createLonghandProperty
 * -----------------------------------------------------------------------------------------------*/

function createLonghandProperty(tokenProperty: Tokenami.TokenProperty, cssProperty: string) {
  const parts = Tokenami.getTokenPropertySplit(tokenProperty);
  const aliasRegex = new RegExp(`${parts.alias}$`);
  return tokenProperty.replace(aliasRegex, cssProperty) as Tokenami.TokenProperty;
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

const css = createCss({ include: [], theme: {} }, { escapeSpecialChars: true });

export type { TokenamiCSS };
export { createCss, css, convertToMediaStyles };
