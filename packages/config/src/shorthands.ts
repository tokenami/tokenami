import { type CSSProperty } from './config';

// prettier-ignore
const shorthandsToLonghands = [
  ['all', []],
  ['animation', ['&-name', '&-duration', '&-timing-function', '&-delay', '&-iteration-count', '&-direction', '&-fill-mode', '&-play-state', '&-timeline']],
  ['background', ['&-attachment', '&-clip', '&-color', '&-image', '&-position', '&-repeat', '&-size']],
  ['background-position', ['&-x', '&-y']],
  ['border', ['&-top', '&-right', '&-bottom', '&-left', '&-color', '&-style', '&-width', '&-image', '&-block', '&-inline']],
  ['border-top', ['&-width', '&-style', '&-color']],
  ['border-right', ['&-width', '&-style', '&-color']],
  ['border-bottom', ['&-width', '&-style', '&-color']],
  ['border-left', ['&-width', '&-style', '&-color']],
  ['border-color', ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color']],
  ['border-style', ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style']],
  ['border-width',['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width']],
  ['border-image', ['&-source', '&-slice', '&-width', '&-outset', '&-repeat']],
  ['border-radius', ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius']],
  ['border-block', ['&-width', '&-style', '&-color', '&-start', '&-end']],
  ['border-block-width', ['border-block-start-width', 'border-block-end-width']],
  ['border-block-style', ['border-block-start-style', 'border-block-end-style']],
  ['border-block-color', ['border-block-start-color', 'border-block-end-color']],
  ['border-block-start', ['&-width', '&-style', '&-color']],
  ['border-block-end', ['&-width', '&-style', '&-color']],
  ['border-inline', ['&-width', '&-style', '&-color', '&-start', '&-end']],
  ['border-inline-width', ['border-inline-start-width', 'border-inline-end-width']],
  ['border-inline-style', ['border-inline-start-style', 'border-inline-end-style']],
  ['border-inline-color', ['border-inline-start-color', 'border-inline-end-color']],
  ['border-inline-start', ['&-width', '&-style', '&-color']],
  ['border-inline-end', ['&-width', '&-style', '&-color']],
  ['column-rule', ['&-width', '&-style', '&-color']],
  ['columns', ['column-width', 'column-count']],
  ['container', ['&-name', '&-type']],
  ['contain-intrinsic-size', ['contain-intrinsic-width', 'contain-intrinsic-height']],
  ['flex', ['&-grow', '&-shrink', '&-basis']],
  ['flex-flow', ['flex-direction', 'flex-wrap']],
  ['font', ['&-style', '&-variant', '&-weight', '&-stretch', '&-size', 'line-height', '&-family']],
  ['font-variant', ['&-alternates', '&-caps', '&-east-asian', '&-emoji', '&-ligatures', '&-numeric', '&-position']],
  ['gap', ['row-gap', 'column-gap']],
  ['grid', ['&-auto-columns', '&-auto-flow', '&-auto-rows', '&-template-areas', '&-template-columns', '&-template-rows']],
  ['grid-area', ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end']],
  ['grid-column', ['&-start', '&-end']],
  ['grid-row', ['&-start', '&-end']],
  ['grid-template', ['&-rows', '&-columns', '&-areas']],
  ['inset', ['top', 'right', 'bottom', 'left']],
  ['list-style', ['&-type', '&-position', '&-image']],
  ['inset-block', ['&-start', '&-end']],
  ['inset-inline', ['&-start', '&-end']],
  ['margin', ['&-top', '&-right', '&-bottom', '&-left']],
  ['margin-block', ['&-start', '&-end']],
  ['margin-inline', ['&-start', '&-end']],
  ['mask', ['&-image', '&-mode', '&-position', '&-size', '&-repeat', '&-origin', '&-clip', '&-composite', '&-type']],
  ['mask-border', ['&-mode', '&-outset', '&-repeat', '&-slice', '&-source', '&-width']],
  ['offset', ['&-position', '&-path', '&-distance', '&-anchor', '&-rotate']],
  ['outline', ['&-color', '&-style', '&-width']],
  ['overflow', ['&-x', '&-y']],
  ['overscroll-behavior', ['&-x', '&-y']],
  ['padding', ['&-top', '&-right', '&-bottom', '&-left']],
  ['padding-block', ['&-start', '&-end']],
  ['padding-inline', ['&-start', '&-end']],
  ['place-content', ['align-content', 'justify-content']],
  ['place-items', ['align-items', 'justify-items']],
  ['place-self', ['align-self', 'justify-self']],
  ['scroll-margin', ['&-top', '&-right', '&-bottom', '&-left']],
  ['scroll-margin-block', ['&-start', '&-end']],
  ['scroll-margin-inline', ['&-start', '&-end']],
  ['scroll-padding', ['&-top', '&-right', '&-bottom', '&-left']],
  ['scroll-padding-block', ['&-start', '&-end']],
  ['scroll-padding-inline', ['&-start', '&-end']],
  ['scroll-timeline', ['&-name', '&-axis']],
  ['text-decoration', ['&-line', '&-style', '&-color', '&-thickness']],
  ['text-emphasis', ['&-style', '&-color']],
  ['transition', ['&-delay', '&-duration', '&-property', '&-timing-function']],
] satisfies [CSSProperty, string[]][];

/* ---------------------------------------------------------------------------------------------- */

const replacedAmpersands = shorthandsToLonghands.map(
  ([key, values]) => [key, values.map((value) => value.replace('&', key))] as const
);
const mapShorthandToLonghands = new Map(replacedAmpersands);
export { mapShorthandToLonghands };
