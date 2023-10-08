/// <reference types="@tokenami/dev" />
import type * as CSS from 'csstype';
import * as ConfigUtils from '@tokenami/config';

type SupportedProperty = (typeof ConfigUtils.properties)[number];

// TODO: solve shorthand/longhand problem when using property aliases

const mapShorthandToLonghands: Partial<Record<SupportedProperty, SupportedProperty[]>> = {
  animation: [
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
    'animation-play-state',
    'animation-timeline',
  ],
  background: [
    'background-attachment',
    'background-clip',
    'background-color',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
  ],
  border: ['border-style', 'border-color', 'border-width'],
  'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
  'border-right': ['border-right-width', 'border-right-style', 'border-right-color'],
  'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
  'border-left': ['border-left-width', 'border-left-style', 'border-left-color'],
  'border-color': [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
  ],
  'border-style': [
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
  ],
  'border-width': [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
  ],
  'border-image': [
    'border-image-source',
    'border-image-slice',
    'border-image-width',
    'border-image-outset',
    'border-image-repeat',
  ],
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
  'border-block': ['border-block-width', 'border-block-style', 'border-block-color'],
  'border-block-width': ['border-block-start-width', 'border-block-end-width'],
  'border-block-style': ['border-block-start-style', 'border-block-end-style'],
  'border-block-color': ['border-block-start-color', 'border-block-end-color'],
  'border-block-start': [
    'border-block-start-width',
    'border-block-start-style',
    'border-block-start-color',
  ],
  'border-block-end': [
    'border-block-end-width',
    'border-block-end-style',
    'border-block-end-color',
  ],
  'border-inline': ['border-inline-width', 'border-inline-style', 'border-inline-color'],
  'border-inline-width': ['border-inline-start-width', 'border-inline-end-width'],
  'border-inline-style': ['border-inline-start-style', 'border-inline-end-style'],
  'border-inline-color': ['border-inline-start-color', 'border-inline-end-color'],
  'border-inline-start': [
    'border-inline-start-width',
    'border-inline-start-style',
    'border-inline-start-color',
  ],
  'border-inline-end': [
    'border-inline-end-width',
    'border-inline-end-style',
    'border-inline-end-color',
  ],
  'column-rule': ['column-rule-width', 'column-rule-style', 'column-rule-color'],
  columns: ['column-width', 'column-count'],
  container: ['container-name', 'container-type'],
  'contain-intrinsic-size': ['contain-intrinsic-width', 'contain-intrinsic-height'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  'flex-flow': ['flex-direction', 'flex-wrap'],
  font: [
    'font-style',
    'font-variant',
    'font-weight',
    'font-stretch',
    'font-size',
    'line-height',
    'font-family',
  ],
  'font-variant': [
    'font-variant-ligatures',
    'font-variant-caps',
    'font-variant-numeric',
    'font-variant-east-asian',
  ],
  gap: ['row-gap', 'column-gap'],
  grid: [
    'grid-template-rows',
    'grid-template-columns',
    'grid-template-areas',
    'grid-auto-rows',
    'grid-auto-columns',
    'grid-auto-flow',
  ],
  'grid-area': ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end'],
  'grid-column': ['grid-column-start', 'grid-column-end'],
  'grid-row': ['grid-row-start', 'grid-row-end'],
  'grid-template': ['grid-template-rows', 'grid-template-columns', 'grid-template-areas'],
  inset: ['top', 'right', 'bottom', 'left'],
  'list-style': ['list-style-type', 'list-style-position', 'list-style-image'],
  'inset-block': ['inset-block-start', 'inset-block-end'],
  'inset-inline': ['inset-inline-start', 'inset-inline-end'],
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  'margin-block': ['margin-block-start', 'margin-block-end'],
  'margin-inline': ['margin-inline-start', 'margin-inline-end'],
  mask: [
    'mask-image',
    'mask-mode',
    'mask-position',
    'mask-size',
    'mask-repeat',
    'mask-origin',
    'mask-clip',
    'mask-composite',
    'mask-type',
  ],
  'mask-border': [
    'mask-border-mode',
    'mask-border-outset',
    'mask-border-repeat',
    'mask-border-slice',
    'mask-border-source',
    'mask-border-width',
  ],
  offset: ['offset-position', 'offset-path', 'offset-distance', 'offset-anchor', 'offset-rotate'],
  outline: ['outline-color', 'outline-style', 'outline-width'],
  overflow: ['overflow-x', 'overflow-y'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  'padding-block': ['padding-block-start', 'padding-block-end'],
  'padding-inline': ['padding-inline-start', 'padding-inline-end'],
  'place-content': ['align-content', 'justify-content'],
  'place-items': ['align-items', 'justify-items'],
  'place-self': ['align-self', 'justify-self'],
  'scroll-margin': [
    'scroll-margin-top',
    'scroll-margin-right',
    'scroll-margin-bottom',
    'scroll-margin-left',
  ],
  'scroll-margin-block': ['scroll-margin-block-start', 'scroll-margin-block-end'],
  'scroll-margin-inline': ['scroll-margin-inline-start', 'scroll-margin-inline-end'],
  'scroll-padding': [
    'scroll-padding-top',
    'scroll-padding-right',
    'scroll-padding-bottom',
    'scroll-padding-left',
  ],
  'scroll-padding-block': ['scroll-padding-block-start', 'scroll-padding-block-end'],
  'scroll-padding-inline': ['scroll-padding-inline-start', 'scroll-padding-inline-end'],
  'scroll-timeline': ['scroll-timeline-name', 'scroll-timeline-axis'],
  'text-decoration': [
    'text-decoration-line',
    'text-decoration-style',
    'text-decoration-color',
    'text-decoration-thickness',
  ],
  'text-emphasis': ['text-emphasis-style', 'text-emphasis-color'],
  transition: [
    'transition-property',
    'transition-duration',
    'transition-timing-function',
    'transition-delay',
  ],
};

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
    const variantStyles = input
      ? Object.entries(input).flatMap(([key, variant]) => {
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
    let css = Object.assign({}, baseStyles);

    for (let overrideStyle of overrideStyles) {
      if (!overrideStyle) continue;
      for (let tokenProperty in overrideStyle) {
        const property = ConfigUtils.getTokenPropertyName(tokenProperty as any);
        override(css, property);
      }
      Object.assign(css, overrideStyle);
    }

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
