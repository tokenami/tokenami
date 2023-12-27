import * as Tokenami from '@tokenami/config';
import type { TokenamiStyles, ResponsiveKey } from '@tokenami/dev';
import { mapShorthandToLonghands } from './shorthands';

const SHORTHANDS_TO_LONGHANDS = Symbol.for('tokenamiShorthandToLonghands');

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type VariantsConfig = Record<string, Record<string, TokenamiStyles>>;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type ResponsiveValue<T> = T extends string
  ? ResponsiveKey extends `${infer R}`
    ? `${R}_${T}`
    : never
  : never;

type Override = TokenamiStyles | false | undefined;
type Variants<C> = { [V in keyof C]?: VariantValue<keyof C[V]> };
type ResponsiveVariants<C> = {
  [V in keyof C]: { [M in ResponsiveValue<V>]?: VariantValue<keyof C[V]> };
}[keyof C];

type SelectedVariants<V, R> = undefined extends V
  ? null
  : Variants<V> & (R extends true ? ResponsiveVariants<V> : {});

function css<S extends TokenamiStyles, V extends VariantsConfig | undefined, R>(
  baseStyles: S,
  variantsConfig?: V,
  options?: undefined extends V ? never : { responsive: R & boolean }
) {
  const cache: Record<string, Record<string, any>> = {};

  // TODO: return type is `{}` to support both react and solidjs. figure out if this can be improved.
  return function generate(variants?: SelectedVariants<V, R>, ...overrides: Override[]): {} {
    const cacheId = JSON.stringify({ variants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles = variants
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
    // we mutate this object, so we need to make a copy
    let css = Object.assign({}, baseStyles);

    overrideStyles.forEach((overrideStyle) => {
      if (overrideStyle) {
        for (let tokenProperty in overrideStyle) {
          const property = Tokenami.getTokenPropertyName(tokenProperty as any);
          override(css, property);
        }
      }
      // this must happen each iteration so that each override applies to the
      // mutated css object from the previous override iteration
      Object.assign(css, overrideStyle);
    });

    cache[cacheId] = css;
    return css;
  };
}

css[SHORTHANDS_TO_LONGHANDS] = mapShorthandToLonghands;

/* -------------------------------------------------------------------------------------------------
 * createConfig
 * -----------------------------------------------------------------------------------------------*/

function createConfig<T extends Tokenami.Config>(config: Tokenami.Exact<Tokenami.Config, T>) {
  css[SHORTHANDS_TO_LONGHANDS] = { ...css[SHORTHANDS_TO_LONGHANDS], ...config.aliases };
  return Tokenami.createConfig(config);
}

/* ---------------------------------------------------------------------------------------------- */

function override(style: Record<string, any>, property: string) {
  const longhands = (css[SHORTHANDS_TO_LONGHANDS] as any)[property];
  if (!longhands) return;
  for (let longhand of longhands) {
    const tokenProperty = Tokenami.tokenProperty(longhand);
    if (style[tokenProperty]) {
      delete style[tokenProperty];
    }
    override(style, longhand);
  }
}

function convertToMediaStyles(bp: string, styles: TokenamiStyles): TokenamiStyles {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const tokenPrefix = Tokenami.tokenProperty('');
    const bpPrefix = Tokenami.variantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

export { createConfig, css, convertToMediaStyles };
