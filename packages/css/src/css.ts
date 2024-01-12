import * as Tokenami from '@tokenami/config';
import type { TokenamiProperties, TokenamiFinalConfig } from '@tokenami/dev';
import { mapShorthandToLonghands } from './shorthands';

const _LONGHANDS = Symbol();
const _COMPOSE = Symbol();

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type VariantsConfig = Record<string, Record<string, TokenamiProperties>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ReponsiveKey = Extract<keyof TokenamiFinalConfig['responsive'], string>;
type ResponsiveValue<T> = T extends string ? `${ReponsiveKey}_${T}` : never;

type TokenamiStyle = TokenamiProperties & { [_COMPOSE]?: TokenamiProperties };
type Override = TokenamiStyle | false | undefined;
type Variants<C> = { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = {
  [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> };
}[keyof C];

type SelectedVariants<V, R> =
  | null
  | (undefined extends V ? null : Variants<V> & (R extends true ? ResponsiveVariants<V> : {}));

// return type is purposfully `{}` to support `style` attribute type for different frameworks.
// returning `TokenamiProperties` is not enough here bcos that type can create circular refs
// in frameworks like SolidJS that use `CSS.PropertiesHyphen` as style attr type. i'm unsure
// what usecases requires an accurate return type here, so open to investigating further if we
// discover usecases later.
interface Generate<V, R> {
  (variants?: SelectedVariants<V, R>, ...overrides: Override[]): {};
}

const css = <V extends VariantsConfig | undefined, R, C>(
  baseStyles: TokenamiStyle,
  variantsConfig?: V & VariantsConfig,
  options?: undefined extends V ? never : { responsive: R & boolean }
): Generate<V, R> => {
  const cache: Record<string, Record<string, any>> = {};

  const generate: Generate<V, R> = (variants, ...overrides) => {
    const cacheId = JSON.stringify({ baseStyles, variants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles: TokenamiStyle[] = variants
      ? Object.entries(variants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
          const styles = variantsConfig?.[type]?.[variant as any];
          const responsive = options?.responsive;
          const updated = responsive && bp && styles ? convertToMediaStyles(bp, styles) : styles;
          return updated ? [updated] : [];
        })
      : [];

    const overrideStyles = [...variantStyles, ...overrides];
    // we mutate this object, so need to make a copy
    let overriddenStyles = Object.assign({}, baseStyles);

    overrideStyles.forEach((overrideStyle) => {
      if (overrideStyle) {
        const originalStyles = baseStyles[_COMPOSE] || baseStyles;
        const styles = overrideStyle[_COMPOSE] || overrideStyle;
        for (let tokenProperty in styles) {
          const property = tokenProperty as keyof TokenamiProperties;
          if (originalStyles[property] === styles[property]) {
            delete styles[property];
          } else {
            const name = Tokenami.getTokenPropertyName(tokenProperty as keyof TokenamiProperties);
            override(overriddenStyles, name);
          }
        }
        // this must happen each iteration so that each override applies to the
        // mutated css object from the previous override iteration
        Object.assign(overriddenStyles, styles);
      }
    });

    cache[cacheId] = overriddenStyles;
    return overriddenStyles;
  };

  return generate;
};

css[_LONGHANDS] = mapShorthandToLonghands;

/* -------------------------------------------------------------------------------------------------
 * compose
 * -----------------------------------------------------------------------------------------------*/

type ClassMethod = (...classNames: (string | undefined)[]) => string;

css.compose = <V extends VariantsConfig | undefined, R>(
  baseStyles: TokenamiStyle,
  variantsConfig?: V & VariantsConfig,
  options?: undefined extends V ? never : { responsive: R & boolean }
) => {
  const entries = Object.entries(baseStyles) as [Tokenami.TokenProperty, string][];
  const className = Tokenami.generateClassName(entries);
  const generate = css({ [_COMPOSE]: baseStyles }, variantsConfig, options);

  (generate as any).class = ((...classNames) => {
    return classNames.concat(className).filter(Boolean).join(' ');
  }) as ClassMethod;

  return generate as Generate<V, R> & { class: ClassMethod };
};

/* -------------------------------------------------------------------------------------------------
 * createCss
 * -----------------------------------------------------------------------------------------------*/

function createCss(config: Tokenami.Config) {
  if (!config.aliases) return css;
  css[_LONGHANDS] = { ...css[_LONGHANDS], ...config.aliases };
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

function convertToMediaStyles(bp: string, styles: TokenamiStyle): TokenamiStyle {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const tokenPrefix = Tokenami.tokenProperty('');
    const bpPrefix = Tokenami.variantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

export { createCss, css, convertToMediaStyles };
