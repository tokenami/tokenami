import * as Tokenami from '@tokenami/config';
import type { TokenamiProperties, TokenamiFinalConfig } from '@tokenami/dev';

const _LONGHANDS = Symbol();

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof TokenamiFinalConfig['responsive'], string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;

type Override = TokenamiProperties | Record<string, any> | false | undefined;
type Variants<C> = { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = {
  [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> };
}[keyof C];

type SelectedVariants<V, R> =
  | null
  | (undefined extends V ? null : Variants<V> & (R extends true ? ResponsiveVariants<V> : {}));

interface CSS {
  [_LONGHANDS]?: typeof Tokenami.mapShorthandToLonghands;

  // return type is purposfully `{}` to support `style` attribute type for different frameworks.
  // returning `TokenamiProperties` is not enough here bcos that type can create circular refs
  // in frameworks like SolidJS that use `CSS.PropertiesHyphen` as style attr type. i'm unsure
  // what usecases requires an accurate return type here, so open to investigating further if we
  // discover usecases later.
  (baseStyles: TokenamiProperties, ...overrides: Override[]): {};

  compose: <V extends VariantsConfig | undefined, R>(
    baseStyles: TokenamiProperties,
    variantsConfig?: V & VariantsConfig,
    options?: undefined extends V ? never : { responsive: R & boolean }
  ) => (variants?: SelectedVariants<V, R>, ...overrides: Override[]) => {};
}

const cache: Record<string, TokenamiProperties> = {};

const css: CSS = (baseStyles, ...overrides) => {
  const cacheId = JSON.stringify({ baseStyles, overrides });
  const cached = cache[cacheId];

  if (cached) return cached;

  // we mutate this object, so we need to make a copy
  let overriddenStyles = Object.assign({}, baseStyles);

  overrides.forEach((overrideStyle) => {
    if (!overrideStyle) return;
    for (let key in overrideStyle) {
      const tokenProperty = key as keyof TokenamiProperties;
      const property = Tokenami.getTokenPropertyName(tokenProperty);
      override(overriddenStyles, property);
    }
    // this must happen each iteration so that each override applies to the
    // mutated css object from the previous override iteration
    Object.assign(overriddenStyles, overrideStyle);
  });

  Object.entries(overriddenStyles).forEach(([property, value]) => {
    const tokenProperty = Tokenami.TokenProperty.safeParse(property);
    if (tokenProperty.success && typeof value === 'number' && value > 0) {
      const gridVar = Tokenami.tokenProperty('grid');
      (overriddenStyles as any)[tokenProperty.output] = `calc(var(${gridVar}) * ${value})`;
    }
  });

  cache[cacheId] = overriddenStyles;
  return overriddenStyles;
};

css[_LONGHANDS] = Tokenami.mapShorthandToLonghands;

/* -------------------------------------------------------------------------------------------------
 * compose
 * -----------------------------------------------------------------------------------------------*/

css.compose = (baseStyles, variantsConfig, options) => {
  const cache: Record<string, TokenamiProperties> = {};

  return function generate(variants, ...overrides) {
    const cacheId = JSON.stringify({ baseStyles, variants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles: TokenamiProperties[] = variants
      ? Object.entries(variants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
          const styles = variantsConfig?.[type]?.[variant as any];
          const responsive = options?.responsive;
          const updated = responsive && bp && styles ? convertToMediaStyles(bp, styles) : styles;
          return updated ? [updated] : [];
        })
      : [];

    const styles = css(baseStyles, ...variantStyles, ...overrides);
    cache[cacheId] = styles;
    return styles;
  };
};

css[_LONGHANDS] = Tokenami.mapShorthandToLonghands;

/* -------------------------------------------------------------------------------------------------
 * createCss
 * -----------------------------------------------------------------------------------------------*/

function createCss(config: Tokenami.Config) {
  if (!config.aliases) return css;
  css[_LONGHANDS] = Object.assign({}, css[_LONGHANDS], config.aliases);
  return css;
}

/* ---------------------------------------------------------------------------------------------- */

function override(style: Record<string, any>, property: string) {
  const longhands = (css[_LONGHANDS] as any)[property];
  if (!longhands) return;
  for (let longhand of longhands) {
    const tokenProperty = Tokenami.tokenProperty(longhand);
    if (style[tokenProperty]) {
      delete style[tokenProperty];
    }
    override(style, longhand);
  }
}

function convertToMediaStyles(bp: string, styles: TokenamiProperties): TokenamiProperties {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const tokenPrefix = Tokenami.tokenProperty('');
    const bpPrefix = Tokenami.variantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

export { createCss, css, convertToMediaStyles };
