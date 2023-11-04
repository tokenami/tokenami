/// <reference types="@tokenami/dev" />
import type { TokenamiStyles } from '@tokenami/dev';
import * as ConfigUtils from '@tokenami/config';
import { mapShorthandToLonghands } from './shorthands';

const SHORTHANDS_TO_LONGHANDS = Symbol.for('tokenamiShorthandToLonghands');

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type Media<T> = T extends string ? `${keyof TokenamiFinalConfig['media']}_${T}` : never;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type VariantsConfig = Record<string, Record<string, TokenamiStyles>>;

type Variants<C extends VariantsConfig> = {
  [V in keyof C]?: VariantValue<keyof C[V]>;
};

type ResponsiveVariants<C extends VariantsConfig> = {
  [V in keyof C]: { [T in V]?: VariantValue<keyof C[V]> } & {
    [M in Media<V>]?: VariantValue<keyof C[V]>;
  };
}[keyof C];

function css<S extends TokenamiStyles, V extends VariantsConfig, R extends boolean>(
  baseStyles: S,
  variants?: V,
  options?: { responsive?: R }
) {
  const cache: Record<string, Record<string, any>> = {};

  return function generate(
    selectedVariants?: R extends true ? ResponsiveVariants<V> : Variants<V>,
    ...overrides: (TokenamiStyles | false | undefined)[]
  ): TokenamiStyles {
    const cacheId = JSON.stringify({ selectedVariants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles = selectedVariants
      ? Object.entries(selectedVariants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof V, string?];
          const styles = variants?.[type]?.[variant];
          const responsive = options?.responsive;
          const updated = responsive && bp && styles ? convertToMediaStyles(bp, styles) : styles;
          return updated ? [updated] : [];
        })
      : [];

    const overrideStyles = variantStyles.concat(overrides);
    // we mutate this object, so we need to make a copy
    let css = Object.assign({}, baseStyles);

    overrideStyles.forEach((overrideStyle) => {
      if (overrideStyle) {
        for (let tokenProperty in overrideStyle) {
          const property = ConfigUtils.getTokenPropertyName(tokenProperty as any);
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
 * create
 * -----------------------------------------------------------------------------------------------*/

function createCss(config: ConfigUtils.Config) {
  if (!config.aliases) return css;
  css[SHORTHANDS_TO_LONGHANDS] = { ...css[SHORTHANDS_TO_LONGHANDS], ...config.aliases };
  return css;
}

/* ---------------------------------------------------------------------------------------------- */

function override(style: Record<string, any>, property: string) {
  const longhands = (css[SHORTHANDS_TO_LONGHANDS] as any)[property];
  if (!longhands) return;
  for (let longhand of longhands) {
    const tokenProperty = ConfigUtils.tokenProperty(longhand);
    if (style[tokenProperty]) {
      delete style[tokenProperty];
    }
    override(style, longhand);
  }
}

function convertToMediaStyles(bp: string, styles: TokenamiStyles): TokenamiStyles {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const tokenPrefix = ConfigUtils.tokenProperty('');
    const bpPrefix = ConfigUtils.variantProperty(bp, '');
    const bpProperty = property.replace(tokenPrefix, bpPrefix);
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

export { createCss, css, convertToMediaStyles };
