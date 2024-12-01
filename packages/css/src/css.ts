import type { TokenamiProperties, TokenamiFinalConfig } from 'tokenami';
import * as Tokenami from '@tokenami/config';

const _TOKENAMI_CSS = Symbol.for('@tokenami/css');
const _COMPOSE = Symbol();

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: TokenamiProperties };
type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof NonNullable<TokenamiFinalConfig['responsive']>, string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;
type Styles = TokenamiProperties | TokenamiCSS;
type Override = Styles | false | undefined;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = undefined extends C
  ? {}
  : { [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> } }[keyof C];

type Compose<T extends ComposeStyleConfig> = {
  [K in keyof T]: GenerateCSS<T[K]['variants'], T[K]['responsiveVariants']>;
};

type GenerateCSS<V, R> = (
  selectedVariants?: Variants<V> & Variants<R> & ResponsiveVariants<R>
) => StyleFns;

type ComposeStyleConfig = { [key: string]: ComposeStyle };
type ComposeStyle = TokenamiProperties & {
  variants?: VariantsConfig;
  responsiveVariants?: VariantsConfig;
};

type StyleFns = [
  cn: (...classNames: (string | undefined | null | false)[]) => string,
  style: (...overrides: Override[]) => TokenamiCSS
];

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
  config: Pick<Tokenami.Config, 'aliases' | 'composeSelector'>,
  options: CreateCssOptions = { escapeSpecialChars: true }
) {
  (globalThis as any)[_TOKENAMI_CSS] = options;

  function css(...allStyles: [Styles, ...Override[]]): TokenamiCSS {
    const composedStyles = new Set();
    const flattenedStyles = [];

    for (const style of allStyles) {
      if (!style) continue;
      const { [_COMPOSE]: composed, ...override } = style as any;
      composedStyles.add(composed);
      flattenedStyles.push(composed, override);
    }

    const cacheId = JSON.stringify(flattenedStyles);
    const cached = lruCache.get(cacheId);
    if (cached) return cached;

    const overriddenStyles: TokenamiProperties & TokenamiCSS = { [_COMPOSE]: {} };
    const overriddenComposedStyles = overriddenStyles[_COMPOSE]!;
    const globalOptions = (globalThis as any)[_TOKENAMI_CSS];

    for (const styles of flattenedStyles) {
      if (!styles) continue;
      const isComposed = composedStyles.has(styles);

      for (let [key, value] of Object.entries(styles)) {
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
          const isNumber = typeof value === 'number' && value !== 0;
          const parsedProperty = Tokenami.parseProperty(longProperty, globalOptions);
          const calcToggle = calcProperty(parsedProperty);

          overrideLonghands(overriddenStyles, parsedProperty);

          const target = isComposed
            ? overriddenComposedStyles[parsedProperty as any]
              ? overriddenStyles
              : overriddenComposedStyles
            : overriddenStyles;

          // this must happen each iteration so that each override applies to the
          // mutated css object from the previous override iteration
          target[parsedProperty as any] = value;

          if (!isComposed) {
            if (isNumber) {
              overriddenStyles[calcToggle as any] = '/*on*/';
            } else {
              delete overriddenStyles[calcToggle as any];
            }
          }
        }
      }
    }

    lruCache.set(cacheId, overriddenStyles);
    return overriddenStyles;
  }

  css.compose = <T extends ComposeStyleConfig>(configs: T): Compose<T> => {
    const result = {} as Compose<T>;

    const generate = (block: string, styleConfig: ComposeStyle, selectedVariants = {}) => {
      const cacheId = JSON.stringify({ block, selectedVariants });
      const cached = lruCache.get(cacheId);
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

      const cn: StyleFns[0] = (...classNames) => {
        const selector = Tokenami.getComposeSelector(block, config.composeSelector);
        const part = Tokenami.getBlockFromComposeSelector(selector, config.composeSelector);
        return [part.selectorName, ...classNames].filter(Boolean).join(' ');
      };
      const style: StyleFns[1] = (...overrides) => {
        return css({ [_COMPOSE]: baseStyles }, ...variantStyles, ...overrides);
      };

      const result: StyleFns = [cn, style];
      lruCache.set(cacheId, result);
      return result;
    };

    for (const [block, styleConfig] of Object.entries(configs)) {
      result[block as keyof T] = generate.bind(null, block, styleConfig);
    }

    return result;
  };

  return css;
}

/* -------------------------------------------------------------------------------------------------
 * overrideLonghands
 * -----------------------------------------------------------------------------------------------*/

function overrideLonghands(style: Styles, tokenProperty: Tokenami.TokenProperty) {
  const parts = Tokenami.getTokenPropertySplit(tokenProperty);
  const longhands = Tokenami.mapShorthandToLonghands.get(parts.alias as any) || [];
  const cssObj = style as any;
  for (const longhand of longhands) {
    const tokenPropertyLong = createLonghandProperty(tokenProperty, longhand);
    const calcProp = calcProperty(tokenPropertyLong);
    const composedValue = cssObj[_COMPOSE]?.[tokenPropertyLong];
    const value = composedValue ?? cssObj[tokenPropertyLong];
    const isNumber = typeof value === 'number';

    composedValue ? (cssObj[tokenPropertyLong] = 'initial') : delete cssObj[tokenPropertyLong];
    if (isNumber) composedValue ? (cssObj[calcProp] = 'initial') : delete cssObj[calcProp];
    overrideLonghands(cssObj, tokenPropertyLong);
  }
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

const css = createCss({});

export type { TokenamiCSS };
export { createCss, css, convertToMediaStyles, _COMPOSE };
