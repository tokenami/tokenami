/// <reference path="./tokenami.d.ts" />
import type * as CSS from 'csstype';
import * as ConfigUtils from '@tokenami/config';

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
  return function generate(
    input?: R extends true ? GenerateResponsiveInput<C> : GenerateInput<C>,
    ...overrides: OverrideStyles
  ): CSS.Properties {
    if (!input) return baseStyles;

    const variantStyles = Object.entries(input).flatMap(([key, variant]) => {
      if (!variant) return [];
      const [type, bp] = key.split('_').reverse() as [keyof C, string?];
      const value = variants?.[type]?.[variant];
      const styles = options?.responsive && bp && value ? toMediaStyles(bp, value) : value;
      return styles ? [styles] : [];
    });

    return Object.assign({}, baseStyles, ...variantStyles, ...overrides);
  };
}

function toMediaStyles(bp: string, styles: CSS.Properties) {
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

export { css, toMediaStyles };
