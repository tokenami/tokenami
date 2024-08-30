import type { CSSProperty } from '@tokenami/config';

type AllProperties = Record<CSSProperty, number>;

/**
 * we use objects to ensure thry contain all properties that exist in the csstype interface
 */

const supportedLogical = {
  'block-overflow': 1,
  'block-size': 1,
  'border-block': 1,
  'border-block-end': 1,
  'border-block-start': 1,
  'border-block-color': 1,
  'border-block-end-color': 1,
  'border-block-end-style': 1,
  'border-block-end-width': 1,
  'border-block-start-color': 1,
  'border-block-start-style': 1,
  'border-block-start-width': 1,
  'border-block-style': 1,
  'border-block-width': 1,
  'border-inline': 1,
  'border-inline-end': 1,
  'border-inline-start': 1,
  'border-inline-color': 1,
  'border-inline-end-color': 1,
  'border-inline-end-style': 1,
  'border-inline-end-width': 1,
  'border-inline-start-color': 1,
  'border-inline-start-style': 1,
  'border-inline-start-width': 1,
  'border-inline-style': 1,
  'border-inline-width': 1,
  'contain-intrinsic-block-size': 1,
  'contain-intrinsic-inline-size': 1,
  'inline-size': 1,
  'inset-block': 1,
  'inset-block-end': 1,
  'inset-block-start': 1,
  'inset-inline': 1,
  'inset-inline-end': 1,
  'inset-inline-start': 1,
  'margin-block': 1,
  'margin-block-end': 1,
  'margin-block-start': 1,
  'margin-inline': 1,
  'margin-inline-end': 1,
  'margin-inline-start': 1,
  'max-block-size': 1,
  'max-inline-size': 1,
  'min-block-size': 1,
  'min-inline-size': 1,
  'overflow-block': 1,
  'overflow-inline': 1,
  'overscroll-behavior-block': 1,
  'overscroll-behavior-inline': 1,
  'padding-block': 1,
  'padding-block-end': 1,
  'padding-block-start': 1,
  'padding-inline': 1,
  'padding-inline-end': 1,
  'padding-inline-start': 1,
  'scroll-margin-block': 1,
  'scroll-margin-block-end': 1,
  'scroll-margin-block-start': 1,
  'scroll-margin-inline': 1,
  'scroll-margin-inline-end': 1,
  'scroll-margin-inline-start': 1,
  'scroll-padding-block': 1,
  'scroll-padding-block-end': 1,
  'scroll-padding-block-start': 1,
  'scroll-padding-inline': 1,
  'scroll-padding-inline-end': 1,
  'scroll-padding-inline-start': 1,
} as const satisfies Partial<AllProperties>;

const supported: AllProperties = {
  all: 1,
  animation: 1,
  'animation-range': 1,
  background: 1,
  'background-position': 1,
  border: 1,
  'border-bottom': 1,
  'border-color': 1,
  'border-image': 1,
  'border-left': 1,
  'border-radius': 1,
  'border-right': 1,
  'border-style': 1,
  'border-top': 1,
  'border-width': 1,
  caret: 1,
  'column-rule': 1,
  columns: 1,
  'contain-intrinsic-size': 1,
  container: 1,
  flex: 1,
  'flex-flow': 1,
  font: 1,
  gap: 1,
  grid: 1,
  'grid-area': 1,
  'grid-column': 1,
  'grid-row': 1,
  'grid-template': 1,
  inset: 1,
  'line-clamp': 1,
  'list-style': 1,
  margin: 1,
  mask: 1,
  'mask-border': 1,
  motion: 1,
  offset: 1,
  outline: 1,
  overflow: 1,
  'overscroll-behavior': 1,
  padding: 1,
  'place-content': 1,
  'place-items': 1,
  'place-self': 1,
  'scroll-margin': 1,
  'scroll-padding': 1,
  'scroll-snap-margin': 1,
  'scroll-timeline': 1,
  'text-decoration': 1,
  'text-emphasis': 1,
  transition: 1,
  'view-timeline': 1,
  'accent-color': 1,
  'align-content': 1,
  'align-items': 1,
  'align-self': 1,
  'align-tracks': 1,
  'animation-composition': 1,
  'animation-delay': 1,
  'animation-direction': 1,
  'animation-duration': 1,
  'animation-fill-mode': 1,
  'animation-iteration-count': 1,
  'animation-name': 1,
  'animation-play-state': 1,
  'animation-range-end': 1,
  'animation-range-start': 1,
  'animation-timeline': 1,
  'animation-timing-function': 1,
  appearance: 1,
  'aspect-ratio': 1,
  'backdrop-filter': 1,
  'backface-visibility': 1,
  'background-attachment': 1,
  'background-blend-mode': 1,
  'background-clip': 1,
  'background-color': 1,
  'background-image': 1,
  'background-origin': 1,
  'background-position-x': 1,
  'background-position-y': 1,
  'background-repeat': 1,
  'background-size': 1,
  'border-bottom-color': 1,
  'border-bottom-left-radius': 1,
  'border-bottom-right-radius': 1,
  'border-bottom-style': 1,
  'border-bottom-width': 1,
  'border-collapse': 1,
  'border-end-end-radius': 1,
  'border-end-start-radius': 1,
  'border-image-outset': 1,
  'border-image-repeat': 1,
  'border-image-slice': 1,
  'border-image-source': 1,
  'border-image-width': 1,
  'border-left-color': 1,
  'border-left-style': 1,
  'border-left-width': 1,
  'border-right-color': 1,
  'border-right-style': 1,
  'border-right-width': 1,
  'border-spacing': 1,
  'border-start-end-radius': 1,
  'border-start-start-radius': 1,
  'border-top-color': 1,
  'border-top-left-radius': 1,
  'border-top-right-radius': 1,
  'border-top-style': 1,
  'border-top-width': 1,
  bottom: 1,
  'box-decoration-break': 1,
  'box-shadow': 1,
  'box-sizing': 1,
  'break-after': 1,
  'break-before': 1,
  'break-inside': 1,
  'caption-side': 1,
  'caret-color': 1,
  'caret-shape': 1,
  clear: 1,
  'clip-path': 1,
  color: 1,
  'color-adjust': 1,
  'color-scheme': 1,
  'column-count': 1,
  'column-fill': 1,
  'column-gap': 1,
  'column-rule-color': 1,
  'column-rule-style': 1,
  'column-rule-width': 1,
  'column-span': 1,
  'column-width': 1,
  contain: 1,
  'contain-intrinsic-height': 1,
  'contain-intrinsic-width': 1,
  'container-name': 1,
  'container-type': 1,
  content: 1,
  'content-visibility': 1,
  'counter-increment': 1,
  'counter-reset': 1,
  'counter-set': 1,
  cursor: 1,
  direction: 1,
  display: 1,
  'empty-cells': 1,
  filter: 1,
  'flex-basis': 1,
  'flex-direction': 1,
  'flex-grow': 1,
  'flex-shrink': 1,
  'flex-wrap': 1,
  float: 1,
  'font-family': 1,
  'font-feature-settings': 1,
  'font-kerning': 1,
  'font-language-override': 1,
  'font-optical-sizing': 1,
  'font-palette': 1,
  'font-size': 1,
  'font-size-adjust': 1,
  'font-smooth': 1,
  'font-stretch': 1,
  'font-style': 1,
  'font-synthesis': 1,
  'font-synthesis-position': 1,
  'font-synthesis-small-caps': 1,
  'font-synthesis-style': 1,
  'font-synthesis-weight': 1,
  'font-variant': 1,
  'font-variant-alternates': 1,
  'font-variant-caps': 1,
  'font-variant-east-asian': 1,
  'font-variant-emoji': 1,
  'font-variant-ligatures': 1,
  'font-variant-numeric': 1,
  'font-variant-position': 1,
  'font-variation-settings': 1,
  'font-weight': 1,
  'forced-color-adjust': 1,
  'grid-auto-columns': 1,
  'grid-auto-flow': 1,
  'grid-auto-rows': 1,
  'grid-column-end': 1,
  'grid-column-start': 1,
  'grid-row-end': 1,
  'grid-row-start': 1,
  'grid-template-areas': 1,
  'grid-template-columns': 1,
  'grid-template-rows': 1,
  'hanging-punctuation': 1,
  height: 1,
  'hyphenate-character': 1,
  'hyphenate-limit-chars': 1,
  hyphens: 1,
  'image-orientation': 1,
  'image-rendering': 1,
  'image-resolution': 1,
  'initial-letter': 1,
  'input-security': 1,
  isolation: 1,
  'justify-content': 1,
  'justify-items': 1,
  'justify-self': 1,
  'justify-tracks': 1,
  left: 1,
  'letter-spacing': 1,
  'line-break': 1,
  'line-height': 1,
  'line-height-step': 1,
  'list-style-image': 1,
  'list-style-position': 1,
  'list-style-type': 1,
  'margin-bottom': 1,
  'margin-left': 1,
  'margin-right': 1,
  'margin-top': 1,
  'margin-trim': 1,
  'mask-border-mode': 1,
  'mask-border-outset': 1,
  'mask-border-repeat': 1,
  'mask-border-slice': 1,
  'mask-border-source': 1,
  'mask-border-width': 1,
  'mask-clip': 1,
  'mask-composite': 1,
  'mask-image': 1,
  'mask-mode': 1,
  'mask-origin': 1,
  'mask-position': 1,
  'mask-repeat': 1,
  'mask-size': 1,
  'mask-type': 1,
  'masonry-auto-flow': 1,
  'math-depth': 1,
  'math-shift': 1,
  'math-style': 1,
  'max-height': 1,
  'max-lines': 1,
  'max-width': 1,
  'min-height': 1,
  'min-width': 1,
  'mix-blend-mode': 1,
  'motion-distance': 1,
  'motion-path': 1,
  'motion-rotation': 1,
  'object-fit': 1,
  'object-position': 1,
  'offset-anchor': 1,
  'offset-distance': 1,
  'offset-path': 1,
  'offset-position': 1,
  'offset-rotate': 1,
  'offset-rotation': 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  'outline-color': 1,
  'outline-offset': 1,
  'outline-style': 1,
  'outline-width': 1,
  'overflow-anchor': 1,
  'overflow-clip-box': 1,
  'overflow-clip-margin': 1,
  'overflow-wrap': 1,
  'overflow-x': 1,
  'overflow-y': 1,
  overlay: 1,
  'overscroll-behavior-x': 1,
  'overscroll-behavior-y': 1,
  'padding-bottom': 1,
  'padding-left': 1,
  'padding-right': 1,
  'padding-top': 1,
  page: 1,
  'page-break-after': 1,
  'page-break-before': 1,
  'page-break-inside': 1,
  'paint-order': 1,
  perspective: 1,
  'perspective-origin': 1,
  'pointer-events': 1,
  position: 1,
  'print-color-adjust': 1,
  quotes: 1,
  resize: 1,
  right: 1,
  rotate: 1,
  'row-gap': 1,
  'ruby-align': 1,
  'ruby-merge': 1,
  'ruby-position': 1,
  scale: 1,
  'scroll-behavior': 1,
  'scroll-margin-bottom': 1,
  'scroll-margin-left': 1,
  'scroll-margin-right': 1,
  'scroll-margin-top': 1,
  'scroll-padding-bottom': 1,
  'scroll-padding-left': 1,
  'scroll-padding-right': 1,
  'scroll-padding-top': 1,
  'scroll-snap-align': 1,
  'scroll-snap-margin-bottom': 1,
  'scroll-snap-margin-left': 1,
  'scroll-snap-margin-right': 1,
  'scroll-snap-margin-top': 1,
  'scroll-snap-stop': 1,
  'scroll-snap-type': 1,
  'scroll-timeline-axis': 1,
  'scroll-timeline-name': 1,
  'scrollbar-color': 1,
  'scrollbar-gutter': 1,
  'scrollbar-width': 1,
  'shape-image-threshold': 1,
  'shape-margin': 1,
  'shape-outside': 1,
  'tab-size': 1,
  'table-layout': 1,
  'text-align': 1,
  'text-align-last': 1,
  'text-combine-upright': 1,
  'text-decoration-color': 1,
  'text-decoration-line': 1,
  'text-decoration-skip': 1,
  'text-decoration-skip-ink': 1,
  'text-decoration-style': 1,
  'text-decoration-thickness': 1,
  'text-emphasis-color': 1,
  'text-emphasis-position': 1,
  'text-emphasis-style': 1,
  'text-indent': 1,
  'text-justify': 1,
  'text-orientation': 1,
  'text-overflow': 1,
  'text-rendering': 1,
  'text-shadow': 1,
  'text-size-adjust': 1,
  'text-transform': 1,
  'text-underline-offset': 1,
  'text-underline-position': 1,
  'text-wrap': 1,
  'timeline-scope': 1,
  top: 1,
  'touch-action': 1,
  transform: 1,
  'transform-box': 1,
  'transform-origin': 1,
  'transform-style': 1,
  'transition-behavior': 1,
  'transition-delay': 1,
  'transition-duration': 1,
  'transition-property': 1,
  'transition-timing-function': 1,
  translate: 1,
  'unicode-bidi': 1,
  'user-select': 1,
  'vertical-align': 1,
  'view-timeline-axis': 1,
  'view-timeline-inset': 1,
  'view-timeline-name': 1,
  'view-transition-name': 1,
  visibility: 1,
  'white-space': 1,
  'white-space-collapse': 1,
  'white-space-trim': 1,
  widows: 1,
  width: 1,
  'will-change': 1,
  'word-break': 1,
  'word-spacing': 1,
  'word-wrap': 1,
  'writing-mode': 1,
  'z-index': 1,
  zoom: 1,
  'alignment-baseline': 1,
  'baseline-shift': 1,
  clip: 1,
  'clip-rule': 1,
  'color-interpolation': 1,
  'color-rendering': 1,
  'dominant-baseline': 1,
  fill: 1,
  'fill-opacity': 1,
  'fill-rule': 1,
  'flood-color': 1,
  'flood-opacity': 1,
  'glyph-orientation-vertical': 1,
  'lighting-color': 1,
  marker: 1,
  'marker-end': 1,
  'marker-mid': 1,
  'marker-start': 1,
  'shape-rendering': 1,
  'stop-color': 1,
  'stop-opacity': 1,
  stroke: 1,
  'stroke-dasharray': 1,
  'stroke-dashoffset': 1,
  'stroke-linecap': 1,
  'stroke-linejoin': 1,
  'stroke-miterlimit': 1,
  'stroke-opacity': 1,
  'stroke-width': 1,
  'text-anchor': 1,
  'vector-effect': 1,
  ...supportedLogical,
};

const inheritedProperties = new Set([
  'azimuth',
  'border-collapse',
  'border-spacing',
  'caption-side',
  'color',
  'cursor',
  'direction',
  'empty-cells',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'font-stretch',
  'font',
  'letter-spacing',
  'line-height',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'list-style',
  'orphans',
  'quotes',
  'text-align',
  'text-indent',
  'text-transform',
  'visibility',
  'white-space',
  'widows',
  'word-spacing',
]);

type LogicalProperties = keyof typeof supportedLogical;
const supportedProperties = new Set(Object.keys(supported)) as Set<CSSProperty>;
const supportedLogicalProperties = new Set(Object.keys(supportedLogical)) as Set<LogicalProperties>;

export type { CSSProperty };
export { supportedProperties, supportedLogicalProperties, inheritedProperties };
