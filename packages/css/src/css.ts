import type { TokenamiProperties, TokenamiFinalConfig } from '@tokenami/dev';
import * as Tokenami from '@tokenami/config';

const _ALIASES = Symbol();

// return type purposfully isn't `TokenamiProperties` bcos frameworks limit the `style`
// types to `CSS.PropertiesHyphen` or `CSS.Properties` which doesn't include `--custom-properties`
type TokenamiCSS = { [_: symbol]: 'TokenamiCSS' };

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof TokenamiFinalConfig['responsive'], string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;
type Override = TokenamiProperties | TokenamiCSS | false | undefined;
type Variants<C> = undefined extends C ? {} : { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = undefined extends C
  ? {}
  : { [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> } }[keyof C];

type ComposeCSS<V, R> = TokenamiProperties & {
  variants?: V & VariantsConfig;
  responsiveVariants?: R & VariantsConfig;
};

interface CSS {
  [_ALIASES]?: Tokenami.Aliases;

  // return type is purposfully `{}` to support `style` attribute type for different frameworks.
  // returning `TokenamiProperties` is not enough here bcos that type can create circular refs
  // in frameworks like SolidJS that use `CSS.PropertiesHyphen` as style attr type. i'm unsure
  // what usecases requires an accurate return type here, so open to investigating further if we
  // discover usecases later.
  (baseStyles: TokenamiProperties, ...overrides: Override[]): TokenamiCSS;

  compose: <V extends VariantsConfig | undefined, R extends VariantsConfig | undefined>(
    config: ComposeCSS<V, R>
  ) => (
    selectedVariants?: Variants<V> & Variants<R> & ResponsiveVariants<R>,
    ...overrides: Override[]
  ) => TokenamiCSS;
}

const cache: Record<string, TokenamiCSS> = {};

const css: CSS = (baseStyles, ...overrides) => {
  let overriddenStyles = {} as TokenamiCSS;
  const cacheId = JSON.stringify({ baseStyles, overrides });
  const cached = cache[cacheId];

  if (cached) return cached;

  [baseStyles, ...overrides].forEach((overrideStyle) => {
    if (!overrideStyle) return;

    Object.entries(overrideStyle).forEach(([key, value]) => {
      if (!Tokenami.TokenProperty.safeParse(key).success) return;
      const tokenProperty = key as keyof TokenamiProperties;
      const parts = Tokenami.getTokenPropertySplit(tokenProperty);
      const cssProperties = Tokenami.getCSSPropertiesForAlias(parts.alias, css[_ALIASES]);

      cssProperties.forEach((cssProperty) => {
        const tokenPropertyLong = createTokenProperty(tokenProperty, cssProperty);
        overrideLonghands(overriddenStyles, tokenPropertyLong);

        if (typeof value === 'number' && value > 0) {
          const gridVar = Tokenami.gridProperty();
          (overriddenStyles as any)[tokenPropertyLong] = `calc(var(${gridVar}) * ${value})`;
        } else {
          (overriddenStyles as any)[tokenPropertyLong] = value;
        }
      });
    });
  });

  cache[cacheId] = overriddenStyles;
  return overriddenStyles;
};

css[_ALIASES] = {};

/* -------------------------------------------------------------------------------------------------
 * compose
 * -----------------------------------------------------------------------------------------------*/

css.compose = (config) => {
  const { variants, responsiveVariants, ...baseStyles } = config;

  return function generate(selectedVariants, ...overrides) {
    const cacheId = JSON.stringify({
      baseStyles,
      variants,
      responsiveVariants,
      selectedVariants,
      overrides,
    });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles: TokenamiProperties[] = selectedVariants
      ? Object.entries(selectedVariants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
          if (bp) {
            const styles = responsiveVariants?.[type]?.[variant as any];
            return styles ? [convertToMediaStyles(bp, styles)] : [];
          } else {
            const styles = (variants || responsiveVariants)?.[type]?.[variant as any];
            return styles ? [styles] : [];
          }
        })
      : [];

    const styles = css(baseStyles, ...variantStyles, ...overrides);
    cache[cacheId] = styles;
    return styles;
  };
};

/* -------------------------------------------------------------------------------------------------
 * createCss
 * -----------------------------------------------------------------------------------------------*/

function createCss(config: Tokenami.Config) {
  if (!config.aliases) return css;
  css[_ALIASES] = config.aliases;
  return css;
}

/* -------------------------------------------------------------------------------------------------
 * overrideLonghands
 * -----------------------------------------------------------------------------------------------*/

function overrideLonghands(style: Record<string, any>, tokenProperty: Tokenami.TokenProperty) {
  const parts = Tokenami.getTokenPropertySplit(tokenProperty);
  const longhands: string[] = (Tokenami.mapShorthandToLonghands as any)[parts.alias] || [];
  longhands.forEach((longhand) => {
    const tokenPropertyLong = createTokenProperty(tokenProperty, longhand);
    if (style[tokenPropertyLong]) delete style[tokenPropertyLong];
    overrideLonghands(style, tokenPropertyLong);
  });
}

/* -------------------------------------------------------------------------------------------------
 * createTokenProperty
 * -----------------------------------------------------------------------------------------------*/

function createTokenProperty(tokenProperty: Tokenami.TokenProperty, cssProperty: string) {
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
    const bpPrefix = Tokenami.variantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

/* ---------------------------------------------------------------------------------------------- */

export type { TokenamiCSS };
export { createCss, css, convertToMediaStyles };
