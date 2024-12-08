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

type ComposeCSS<V, R> = TokenamiProperties & {
  variants?: V & VariantsConfig;
  responsiveVariants?: R & VariantsConfig;
};

type GenerateCSS<V, R> = (
  selectedVariants?: Variants<V> & Variants<R> & ResponsiveVariants<R>
) => [
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
  config: Pick<Tokenami.Config, 'aliases'>,
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

    const overriddenStyles: any = { [_COMPOSE]: {} };
    const overriddenComposedStyles = overriddenStyles[_COMPOSE]!;
    const globalOptions = (globalThis as any)[_TOKENAMI_CSS];

    for (const styles of flattenedStyles) {
      if (!styles) continue;
      const isComposed = composedStyles.has(styles);
      const aliasProperties = Tokenami.iterateAliasProperties(styles, config);

      for (let [key, value, isCalc, cssProperties] of aliasProperties) {
        if (!key.startsWith('--')) {
          overriddenStyles[key as any] = value;
          continue;
        }

        const tokenProperty = key as Tokenami.TokenProperty;
        // most the time this will only be one property
        const parsedProperties = Tokenami.iterateParsedProperties(
          tokenProperty,
          cssProperties,
          globalOptions
        );

        for (const [parsedProperty, calcToggle] of parsedProperties) {
          overrideLonghands(overriddenStyles, parsedProperty);

          const target = isComposed
            ? overriddenComposedStyles[parsedProperty]
              ? overriddenStyles
              : overriddenComposedStyles
            : overriddenStyles;

          // this must happen each iteration so that each override applies to the
          // mutated css object from the previous override iteration
          target[parsedProperty as any] = value;

          if (!isComposed) {
            if (isCalc) {
              overriddenStyles[calcToggle as any] = '/*on*/';
            } else {
              delete overriddenStyles[calcToggle];
            }
          }
        }
      }
    }

    lruCache.set(cacheId, overriddenStyles);
    return overriddenStyles;
  }

  css.compose = <V extends VariantsConfig | undefined, R extends VariantsConfig | undefined>(
    styleConfig: ComposeCSS<V, R>
  ): GenerateCSS<V, R> => {
    const { variants, responsiveVariants, ...baseStyles } = styleConfig;
    const className = Tokenami.generateClassName(baseStyles);

    return function generate(selectedVariants = {}) {
      const cacheId = JSON.stringify({ styleConfig, selectedVariants });
      const cached = lruCache.get(cacheId);
      if (cached) return cached;

      const variantEntries = Object.entries(selectedVariants);
      let variantStyles: TokenamiProperties[] = [];

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

      const result: ReturnType<GenerateCSS<V, R>> = [
        (...classNames) => [className, ...classNames].filter(Boolean).join(' '),
        (...overrides) => css({ [_COMPOSE]: baseStyles }, ...variantStyles, ...overrides),
      ];

      lruCache.set(cacheId, result);
      return result;
    };
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
    const tokenPropertyLong = Tokenami.createLonghandProperty(tokenProperty, longhand);
    const calcProp = Tokenami.calcProperty(tokenPropertyLong);
    const composedValue = cssObj[_COMPOSE]?.[tokenPropertyLong];
    const value = composedValue ?? cssObj[tokenPropertyLong];
    const isNumber = typeof value === 'number';

    composedValue ? (cssObj[tokenPropertyLong] = 'initial') : delete cssObj[tokenPropertyLong];
    if (isNumber) composedValue ? (cssObj[calcProp] = 'initial') : delete cssObj[calcProp];
    overrideLonghands(cssObj, tokenPropertyLong);
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

const css = createCss({});

export type { TokenamiCSS };
export { createCss, css, convertToMediaStyles, _COMPOSE };
