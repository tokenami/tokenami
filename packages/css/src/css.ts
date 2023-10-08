/// <reference types="@tokenami/dev" />
import type * as CSS from 'csstype';
import * as ConfigUtils from '@tokenami/config';
import { mapShorthandToLonghands } from './shorthands';

// TODO: solve shorthand/longhand problem when using property aliases

/* -------------------------------------------------------------------------------------------------
 * css
 * -----------------------------------------------------------------------------------------------*/

type Media<T> = T extends string ? `${keyof TokenamiFinalConfig['media']}_${T}` : never;
type VariantValue<T> = T extends 'true' | 'false' ? boolean : T;
type VariantsConfig = Record<string, Record<VariantValue<any>, CSS.Properties>>;
type OverrideStyles = (CSS.Properties | false | undefined)[];

type GenerateInput<C extends VariantsConfig> = {
  [V in keyof C]?: VariantValue<keyof C[V]>;
};

type GenerateResponsiveInput<C extends VariantsConfig> = {
  [V in keyof C]: { [T in V]?: VariantValue<keyof C[V]> } & {
    [M in Media<V>]?: VariantValue<keyof C[V]>;
  };
}[keyof C];

function css<C extends VariantsConfig, R>(
  baseStyles: CSS.Properties,
  variants?: C,
  options?: { responsive?: R }
) {
  const cache: Record<string, CSS.Properties> = {};

  return function generate(
    selectedVariants?: R extends true ? GenerateResponsiveInput<C> : GenerateInput<C>,
    ...overrides: OverrideStyles
  ): CSS.Properties {
    const cacheId = JSON.stringify({ selectedVariants, overrides });
    const cached = cache[cacheId];

    if (cached) return cached;

    const variantStyles = selectedVariants
      ? Object.entries(selectedVariants).flatMap(([key, variant]) => {
          if (!variant) return [];
          const [type, bp] = key.split('_').reverse() as [keyof C, string?];
          const styles = variants?.[type]?.[variant];
          const responsive = options?.responsive;
          const updated = responsive && bp && styles ? convertToMediaStyles(bp, styles) : styles;
          return updated ? [updated] : [];
        })
      : [];

    const overrideStyles = variantStyles.concat(overrides);
    // we mutate this object, so we need to make a copy
    let css = Object.assign({}, baseStyles, ...overrideStyles);

    for (let overrideStyle of overrideStyles) {
      if (!overrideStyle) continue;
      for (let tokenProperty in overrideStyle) {
        const property = ConfigUtils.getTokenPropertyName(tokenProperty as any);
        override(css, property);
      }
    }

    cache[cacheId] = css;
    return css;
  };
}

function override(css: Record<string, any>, property: string) {
  const longhands = (mapShorthandToLonghands as any)[property];
  if (!longhands) return;
  for (let longhand of longhands) {
    const tokenProperty = ConfigUtils.tokenProperty(longhand);
    if (css[tokenProperty]) {
      delete css[tokenProperty];
    }
    override(css, longhand);
  }
}

function convertToMediaStyles(bp: string, styles: CSS.Properties) {
  const updatedEntries = Object.entries(styles).map(([property, value]) => {
    const bpProperty = property.replace(
      ConfigUtils.tokenProperty(''),
      ConfigUtils.variantProperty(bp, '')
    );
    return [bpProperty, value];
  });
  return Object.fromEntries(updatedEntries);
}

/* ---------------------------------------------------------------------------------------------- */

export { css, convertToMediaStyles };
