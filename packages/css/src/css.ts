import type * as CSS from 'csstype';
import * as Tokenami from '@tokenami/config';
import { TokenamiStyles, ResponsiveKey } from '@tokenami/dev';
import { mapShorthandToLonghands } from './shorthands';

const SHORTHANDS_TO_LONGHANDS = Symbol.for('tokenamiShorthandToLonghands');

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type VariantsConfig = Record<string, Record<string, TokenamiStyles>>;
type Responsive<T> = T extends string ? `${ResponsiveKey}_${T}` : never;
type Overrides = (TokenamiStyles | false | undefined)[];

type Variants<C> = {
  [V in keyof C]?: VariantValue<keyof C[V]>;
};

type ResponsiveVariants<C> = {
  [V in keyof C]: { [T in V]?: VariantValue<keyof C[V]> } & {
    [M in Responsive<V>]?: VariantValue<keyof C[V]>;
  };
}[keyof C];

function css<S extends TokenamiStyles>(
  baseStyles: S
): (selectedVariants?: null, ...overrides: Overrides) => CSS.Properties;

function css<S extends TokenamiStyles, V extends VariantsConfig>(
  baseStyles: S,
  variants: V
): (selectedVariants?: Variants<V>, ...overrides: Overrides) => CSS.Properties;

function css<S extends TokenamiStyles, V extends VariantsConfig>(
  baseStyles: S,
  variants: V,
  options: { responsive: true }
): (selectedVariants?: ResponsiveVariants<V>, ...overrides: Overrides) => CSS.Properties;

function css<S extends TokenamiStyles, V extends VariantsConfig>(
  baseStyles: S,
  variants?: V,
  options?: { responsive: true }
) {
  const cache: Record<string, Record<string, any>> = {};

  return function generate(
    selectedVariants?: ResponsiveVariants<V> | Variants<V> | null,
    ...overrides: Overrides
  ) {
    const cacheId = JSON.stringify({ selectedVariants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles = selectedVariants
      ? Object.entries(selectedVariants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof VariantsConfig, string?];
          const styles = variants?.[type]?.[variant as any];
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
    return css as CSS.Properties;
  };
}

css[SHORTHANDS_TO_LONGHANDS] = mapShorthandToLonghands;

/* -------------------------------------------------------------------------------------------------
 * create
 * -----------------------------------------------------------------------------------------------*/

function createCss(config: Tokenami.Config) {
  if (!config.aliases) return css;
  css[SHORTHANDS_TO_LONGHANDS] = { ...css[SHORTHANDS_TO_LONGHANDS], ...config.aliases };
  return css;
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

export { createCss, css, convertToMediaStyles };
