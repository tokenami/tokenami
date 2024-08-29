import type * as CSS from 'csstype';
import type * as Tokenami from '@tokenami/config';

type Merge<A, B> = B extends never ? A : Omit<A, keyof B> & B;
type DefaultConfig = Tokenami.Config & { CI: false };

// consumer will override this interface
interface TokenamiConfig {}
interface TokenamiFinalConfig extends Merge<DefaultConfig, TokenamiConfig> {}

type ThemeConfig = TokenamiFinalConfig['theme'];
type AliasConfig = Omit<TokenamiFinalConfig['aliases'], Tokenami.CSSProperty>;
type PropertyConfig = TokenamiFinalConfig['properties'];
type SelectorKey = keyof TokenamiFinalConfig['selectors'];
type ResponsiveKey = keyof TokenamiFinalConfig['responsive'];
type ResponsiveSelectorKey = `${ResponsiveKey}_${SelectorKey}`;
type ResponsiveArbitrarySelectorKey = `${ResponsiveKey}_{${string}}`;
type ArbitrarySelectorKey = `{${string}}`;
type VariantKey =
  | ResponsiveKey
  | SelectorKey
  | ResponsiveSelectorKey
  | ArbitrarySelectorKey
  | ResponsiveArbitrarySelectorKey;

type ThemeWithoutModes = Omit<ThemeConfig, 'modes'>;
type Theme = ThemeConfig extends Tokenami.ThemeModes<infer T>
  ? Omit<T, keyof ThemeWithoutModes> & ThemeWithoutModes
  : ThemeWithoutModes;

type TokenProperties<P> = {
  [K in TokenProperty<P>]?: TokenValue<P> extends never
    ? P extends keyof Tokenami.CSSProperties
      ? Tokenami.CSSProperties[P]
      : never
    : TokenValue<P>;
};

type TokenProperty<P> = P extends string
  ? AliasedProperty<P> extends never
    ? VariantProperty<P>
    : AliasedProperty<P> | VariantProperty<P>
  : never;

type AliasedProperty<P> = {
  [A in keyof AliasConfig]: P extends AliasConfig[A][number] ? VariantProperty<A> : never;
}[keyof AliasConfig];

type VariantProperty<P extends string> =
  | Tokenami.TokenProperty<P>
  | (TokenamiFinalConfig['CI'] extends true
      ? Tokenami.VariantProperty<P, VariantKey>
      : Tokenami.VariantProperty<P, string>);

type TokenValue<P> = P extends string
  ? P extends keyof PropertyConfig
    ? PropertyConfig[P][number] extends `${infer ThemeKey}`
      ? PropertyThemeValue<ThemeKey>
      : never
    : never
  : never;

type PropertyThemeValue<ThemeKey extends string> =
  | Tokenami.ArbitraryValue
  | CSS.Globals
  | TokensByThemeKey[ThemeKey]
  | (ThemeKey extends 'grid' | 'number' ? Tokenami.GridValue : never);

type TokensByThemeKey = { [key: string]: never } & {
  [K in keyof Theme]: keyof Theme[K] extends `${infer Token}`
    ? Tokenami.TokenValue<K, Token>
    : never;
};

/**
 * -------------------------------------------------------------------------
 * we purposefully list these manually for performance.
 * using inference here would cripple intellisense performance.
 * -------------------------------------------------------------------------
 * generated from the following snippet in console. KISS for now.

  // copy(`
  // export interface Properties {${properties.map(prop => `
  //   '${prop}': TokenProperties<'${prop}'>;`).join(' ')}
  // }
  // `)
 * -------------------------------------------------------------------------
 */

export interface Properties {
  all: TokenProperties<'all'>;
  animation: TokenProperties<'animation'>;
  'animation-range': TokenProperties<'animation-range'>;
  background: TokenProperties<'background'>;
  'background-position': TokenProperties<'background-position'>;
  border: TokenProperties<'border'>;
  'border-bottom': TokenProperties<'border-bottom'>;
  'border-color': TokenProperties<'border-color'>;
  'border-image': TokenProperties<'border-image'>;
  'border-left': TokenProperties<'border-left'>;
  'border-radius': TokenProperties<'border-radius'>;
  'border-right': TokenProperties<'border-right'>;
  'border-style': TokenProperties<'border-style'>;
  'border-top': TokenProperties<'border-top'>;
  'border-width': TokenProperties<'border-width'>;
  caret: TokenProperties<'caret'>;
  'column-rule': TokenProperties<'column-rule'>;
  columns: TokenProperties<'columns'>;
  'contain-intrinsic-size': TokenProperties<'contain-intrinsic-size'>;
  container: TokenProperties<'container'>;
  flex: TokenProperties<'flex'>;
  'flex-flow': TokenProperties<'flex-flow'>;
  font: TokenProperties<'font'>;
  gap: TokenProperties<'gap'>;
  grid: TokenProperties<'grid'>;
  'grid-area': TokenProperties<'grid-area'>;
  'grid-column': TokenProperties<'grid-column'>;
  'grid-row': TokenProperties<'grid-row'>;
  'grid-template': TokenProperties<'grid-template'>;
  inset: TokenProperties<'inset'>;
  'line-clamp': TokenProperties<'line-clamp'>;
  'list-style': TokenProperties<'list-style'>;
  margin: TokenProperties<'margin'>;
  mask: TokenProperties<'mask'>;
  'mask-border': TokenProperties<'mask-border'>;
  motion: TokenProperties<'motion'>;
  offset: TokenProperties<'offset'>;
  outline: TokenProperties<'outline'>;
  overflow: TokenProperties<'overflow'>;
  'overscroll-behavior': TokenProperties<'overscroll-behavior'>;
  padding: TokenProperties<'padding'>;
  'place-content': TokenProperties<'place-content'>;
  'place-items': TokenProperties<'place-items'>;
  'place-self': TokenProperties<'place-self'>;
  'scroll-margin': TokenProperties<'scroll-margin'>;
  'scroll-padding': TokenProperties<'scroll-padding'>;
  'scroll-snap-margin': TokenProperties<'scroll-snap-margin'>;
  'scroll-timeline': TokenProperties<'scroll-timeline'>;
  'text-decoration': TokenProperties<'text-decoration'>;
  'text-emphasis': TokenProperties<'text-emphasis'>;
  transition: TokenProperties<'transition'>;
  'view-timeline': TokenProperties<'view-timeline'>;
  'accent-color': TokenProperties<'accent-color'>;
  'align-content': TokenProperties<'align-content'>;
  'align-items': TokenProperties<'align-items'>;
  'align-self': TokenProperties<'align-self'>;
  'align-tracks': TokenProperties<'align-tracks'>;
  'animation-composition': TokenProperties<'animation-composition'>;
  'animation-delay': TokenProperties<'animation-delay'>;
  'animation-direction': TokenProperties<'animation-direction'>;
  'animation-duration': TokenProperties<'animation-duration'>;
  'animation-fill-mode': TokenProperties<'animation-fill-mode'>;
  'animation-iteration-count': TokenProperties<'animation-iteration-count'>;
  'animation-name': TokenProperties<'animation-name'>;
  'animation-play-state': TokenProperties<'animation-play-state'>;
  'animation-range-end': TokenProperties<'animation-range-end'>;
  'animation-range-start': TokenProperties<'animation-range-start'>;
  'animation-timeline': TokenProperties<'animation-timeline'>;
  'animation-timing-function': TokenProperties<'animation-timing-function'>;
  appearance: TokenProperties<'appearance'>;
  'aspect-ratio': TokenProperties<'aspect-ratio'>;
  'backdrop-filter': TokenProperties<'backdrop-filter'>;
  'backface-visibility': TokenProperties<'backface-visibility'>;
  'background-attachment': TokenProperties<'background-attachment'>;
  'background-blend-mode': TokenProperties<'background-blend-mode'>;
  'background-clip': TokenProperties<'background-clip'>;
  'background-color': TokenProperties<'background-color'>;
  'background-image': TokenProperties<'background-image'>;
  'background-origin': TokenProperties<'background-origin'>;
  'background-position-x': TokenProperties<'background-position-x'>;
  'background-position-y': TokenProperties<'background-position-y'>;
  'background-repeat': TokenProperties<'background-repeat'>;
  'background-size': TokenProperties<'background-size'>;
  'border-bottom-color': TokenProperties<'border-bottom-color'>;
  'border-bottom-left-radius': TokenProperties<'border-bottom-left-radius'>;
  'border-bottom-right-radius': TokenProperties<'border-bottom-right-radius'>;
  'border-bottom-style': TokenProperties<'border-bottom-style'>;
  'border-bottom-width': TokenProperties<'border-bottom-width'>;
  'border-collapse': TokenProperties<'border-collapse'>;
  'border-end-end-radius': TokenProperties<'border-end-end-radius'>;
  'border-end-start-radius': TokenProperties<'border-end-start-radius'>;
  'border-image-outset': TokenProperties<'border-image-outset'>;
  'border-image-repeat': TokenProperties<'border-image-repeat'>;
  'border-image-slice': TokenProperties<'border-image-slice'>;
  'border-image-source': TokenProperties<'border-image-source'>;
  'border-image-width': TokenProperties<'border-image-width'>;
  'border-left-color': TokenProperties<'border-left-color'>;
  'border-left-style': TokenProperties<'border-left-style'>;
  'border-left-width': TokenProperties<'border-left-width'>;
  'border-right-color': TokenProperties<'border-right-color'>;
  'border-right-style': TokenProperties<'border-right-style'>;
  'border-right-width': TokenProperties<'border-right-width'>;
  'border-spacing': TokenProperties<'border-spacing'>;
  'border-start-end-radius': TokenProperties<'border-start-end-radius'>;
  'border-start-start-radius': TokenProperties<'border-start-start-radius'>;
  'border-top-color': TokenProperties<'border-top-color'>;
  'border-top-left-radius': TokenProperties<'border-top-left-radius'>;
  'border-top-right-radius': TokenProperties<'border-top-right-radius'>;
  'border-top-style': TokenProperties<'border-top-style'>;
  'border-top-width': TokenProperties<'border-top-width'>;
  bottom: TokenProperties<'bottom'>;
  'box-decoration-break': TokenProperties<'box-decoration-break'>;
  'box-shadow': TokenProperties<'box-shadow'>;
  'box-sizing': TokenProperties<'box-sizing'>;
  'break-after': TokenProperties<'break-after'>;
  'break-before': TokenProperties<'break-before'>;
  'break-inside': TokenProperties<'break-inside'>;
  'caption-side': TokenProperties<'caption-side'>;
  'caret-color': TokenProperties<'caret-color'>;
  'caret-shape': TokenProperties<'caret-shape'>;
  clear: TokenProperties<'clear'>;
  'clip-path': TokenProperties<'clip-path'>;
  color: TokenProperties<'color'>;
  'color-adjust': TokenProperties<'color-adjust'>;
  'color-scheme': TokenProperties<'color-scheme'>;
  'column-count': TokenProperties<'column-count'>;
  'column-fill': TokenProperties<'column-fill'>;
  'column-gap': TokenProperties<'column-gap'>;
  'column-rule-color': TokenProperties<'column-rule-color'>;
  'column-rule-style': TokenProperties<'column-rule-style'>;
  'column-rule-width': TokenProperties<'column-rule-width'>;
  'column-span': TokenProperties<'column-span'>;
  'column-width': TokenProperties<'column-width'>;
  contain: TokenProperties<'contain'>;
  'contain-intrinsic-height': TokenProperties<'contain-intrinsic-height'>;
  'contain-intrinsic-width': TokenProperties<'contain-intrinsic-width'>;
  'container-name': TokenProperties<'container-name'>;
  'container-type': TokenProperties<'container-type'>;
  content: TokenProperties<'content'>;
  'content-visibility': TokenProperties<'content-visibility'>;
  'counter-increment': TokenProperties<'counter-increment'>;
  'counter-reset': TokenProperties<'counter-reset'>;
  'counter-set': TokenProperties<'counter-set'>;
  cursor: TokenProperties<'cursor'>;
  direction: TokenProperties<'direction'>;
  display: TokenProperties<'display'>;
  'empty-cells': TokenProperties<'empty-cells'>;
  filter: TokenProperties<'filter'>;
  'flex-basis': TokenProperties<'flex-basis'>;
  'flex-direction': TokenProperties<'flex-direction'>;
  'flex-grow': TokenProperties<'flex-grow'>;
  'flex-shrink': TokenProperties<'flex-shrink'>;
  'flex-wrap': TokenProperties<'flex-wrap'>;
  float: TokenProperties<'float'>;
  'font-family': TokenProperties<'font-family'>;
  'font-feature-settings': TokenProperties<'font-feature-settings'>;
  'font-kerning': TokenProperties<'font-kerning'>;
  'font-language-override': TokenProperties<'font-language-override'>;
  'font-optical-sizing': TokenProperties<'font-optical-sizing'>;
  'font-palette': TokenProperties<'font-palette'>;
  'font-size': TokenProperties<'font-size'>;
  'font-size-adjust': TokenProperties<'font-size-adjust'>;
  'font-smooth': TokenProperties<'font-smooth'>;
  'font-stretch': TokenProperties<'font-stretch'>;
  'font-style': TokenProperties<'font-style'>;
  'font-synthesis': TokenProperties<'font-synthesis'>;
  'font-synthesis-position': TokenProperties<'font-synthesis-position'>;
  'font-synthesis-small-caps': TokenProperties<'font-synthesis-small-caps'>;
  'font-synthesis-style': TokenProperties<'font-synthesis-style'>;
  'font-synthesis-weight': TokenProperties<'font-synthesis-weight'>;
  'font-variant': TokenProperties<'font-variant'>;
  'font-variant-alternates': TokenProperties<'font-variant-alternates'>;
  'font-variant-caps': TokenProperties<'font-variant-caps'>;
  'font-variant-east-asian': TokenProperties<'font-variant-east-asian'>;
  'font-variant-emoji': TokenProperties<'font-variant-emoji'>;
  'font-variant-ligatures': TokenProperties<'font-variant-ligatures'>;
  'font-variant-numeric': TokenProperties<'font-variant-numeric'>;
  'font-variant-position': TokenProperties<'font-variant-position'>;
  'font-variation-settings': TokenProperties<'font-variation-settings'>;
  'font-weight': TokenProperties<'font-weight'>;
  'forced-color-adjust': TokenProperties<'forced-color-adjust'>;
  'grid-auto-columns': TokenProperties<'grid-auto-columns'>;
  'grid-auto-flow': TokenProperties<'grid-auto-flow'>;
  'grid-auto-rows': TokenProperties<'grid-auto-rows'>;
  'grid-column-end': TokenProperties<'grid-column-end'>;
  'grid-column-start': TokenProperties<'grid-column-start'>;
  'grid-row-end': TokenProperties<'grid-row-end'>;
  'grid-row-start': TokenProperties<'grid-row-start'>;
  'grid-template-areas': TokenProperties<'grid-template-areas'>;
  'grid-template-columns': TokenProperties<'grid-template-columns'>;
  'grid-template-rows': TokenProperties<'grid-template-rows'>;
  'hanging-punctuation': TokenProperties<'hanging-punctuation'>;
  height: TokenProperties<'height'>;
  'hyphenate-character': TokenProperties<'hyphenate-character'>;
  'hyphenate-limit-chars': TokenProperties<'hyphenate-limit-chars'>;
  hyphens: TokenProperties<'hyphens'>;
  'image-orientation': TokenProperties<'image-orientation'>;
  'image-rendering': TokenProperties<'image-rendering'>;
  'image-resolution': TokenProperties<'image-resolution'>;
  'initial-letter': TokenProperties<'initial-letter'>;
  'input-security': TokenProperties<'input-security'>;
  isolation: TokenProperties<'isolation'>;
  'justify-content': TokenProperties<'justify-content'>;
  'justify-items': TokenProperties<'justify-items'>;
  'justify-self': TokenProperties<'justify-self'>;
  'justify-tracks': TokenProperties<'justify-tracks'>;
  left: TokenProperties<'left'>;
  'letter-spacing': TokenProperties<'letter-spacing'>;
  'line-break': TokenProperties<'line-break'>;
  'line-height': TokenProperties<'line-height'>;
  'line-height-step': TokenProperties<'line-height-step'>;
  'list-style-image': TokenProperties<'list-style-image'>;
  'list-style-position': TokenProperties<'list-style-position'>;
  'list-style-type': TokenProperties<'list-style-type'>;
  'margin-bottom': TokenProperties<'margin-bottom'>;
  'margin-left': TokenProperties<'margin-left'>;
  'margin-right': TokenProperties<'margin-right'>;
  'margin-top': TokenProperties<'margin-top'>;
  'margin-trim': TokenProperties<'margin-trim'>;
  'mask-border-mode': TokenProperties<'mask-border-mode'>;
  'mask-border-outset': TokenProperties<'mask-border-outset'>;
  'mask-border-repeat': TokenProperties<'mask-border-repeat'>;
  'mask-border-slice': TokenProperties<'mask-border-slice'>;
  'mask-border-source': TokenProperties<'mask-border-source'>;
  'mask-border-width': TokenProperties<'mask-border-width'>;
  'mask-clip': TokenProperties<'mask-clip'>;
  'mask-composite': TokenProperties<'mask-composite'>;
  'mask-image': TokenProperties<'mask-image'>;
  'mask-mode': TokenProperties<'mask-mode'>;
  'mask-origin': TokenProperties<'mask-origin'>;
  'mask-position': TokenProperties<'mask-position'>;
  'mask-repeat': TokenProperties<'mask-repeat'>;
  'mask-size': TokenProperties<'mask-size'>;
  'mask-type': TokenProperties<'mask-type'>;
  'masonry-auto-flow': TokenProperties<'masonry-auto-flow'>;
  'math-depth': TokenProperties<'math-depth'>;
  'math-shift': TokenProperties<'math-shift'>;
  'math-style': TokenProperties<'math-style'>;
  'max-height': TokenProperties<'max-height'>;
  'max-lines': TokenProperties<'max-lines'>;
  'max-width': TokenProperties<'max-width'>;
  'min-height': TokenProperties<'min-height'>;
  'min-width': TokenProperties<'min-width'>;
  'mix-blend-mode': TokenProperties<'mix-blend-mode'>;
  'motion-distance': TokenProperties<'motion-distance'>;
  'motion-path': TokenProperties<'motion-path'>;
  'motion-rotation': TokenProperties<'motion-rotation'>;
  'object-fit': TokenProperties<'object-fit'>;
  'object-position': TokenProperties<'object-position'>;
  'offset-anchor': TokenProperties<'offset-anchor'>;
  'offset-distance': TokenProperties<'offset-distance'>;
  'offset-path': TokenProperties<'offset-path'>;
  'offset-position': TokenProperties<'offset-position'>;
  'offset-rotate': TokenProperties<'offset-rotate'>;
  'offset-rotation': TokenProperties<'offset-rotation'>;
  opacity: TokenProperties<'opacity'>;
  order: TokenProperties<'order'>;
  orphans: TokenProperties<'orphans'>;
  'outline-color': TokenProperties<'outline-color'>;
  'outline-offset': TokenProperties<'outline-offset'>;
  'outline-style': TokenProperties<'outline-style'>;
  'outline-width': TokenProperties<'outline-width'>;
  'overflow-anchor': TokenProperties<'overflow-anchor'>;
  'overflow-clip-box': TokenProperties<'overflow-clip-box'>;
  'overflow-clip-margin': TokenProperties<'overflow-clip-margin'>;
  'overflow-wrap': TokenProperties<'overflow-wrap'>;
  'overflow-x': TokenProperties<'overflow-x'>;
  'overflow-y': TokenProperties<'overflow-y'>;
  overlay: TokenProperties<'overlay'>;
  'overscroll-behavior-x': TokenProperties<'overscroll-behavior-x'>;
  'overscroll-behavior-y': TokenProperties<'overscroll-behavior-y'>;
  'padding-bottom': TokenProperties<'padding-bottom'>;
  'padding-left': TokenProperties<'padding-left'>;
  'padding-right': TokenProperties<'padding-right'>;
  'padding-top': TokenProperties<'padding-top'>;
  page: TokenProperties<'page'>;
  'page-break-after': TokenProperties<'page-break-after'>;
  'page-break-before': TokenProperties<'page-break-before'>;
  'page-break-inside': TokenProperties<'page-break-inside'>;
  'paint-order': TokenProperties<'paint-order'>;
  perspective: TokenProperties<'perspective'>;
  'perspective-origin': TokenProperties<'perspective-origin'>;
  'pointer-events': TokenProperties<'pointer-events'>;
  position: TokenProperties<'position'>;
  'print-color-adjust': TokenProperties<'print-color-adjust'>;
  quotes: TokenProperties<'quotes'>;
  resize: TokenProperties<'resize'>;
  right: TokenProperties<'right'>;
  rotate: TokenProperties<'rotate'>;
  'row-gap': TokenProperties<'row-gap'>;
  'ruby-align': TokenProperties<'ruby-align'>;
  'ruby-merge': TokenProperties<'ruby-merge'>;
  'ruby-position': TokenProperties<'ruby-position'>;
  scale: TokenProperties<'scale'>;
  'scroll-behavior': TokenProperties<'scroll-behavior'>;
  'scroll-margin-bottom': TokenProperties<'scroll-margin-bottom'>;
  'scroll-margin-left': TokenProperties<'scroll-margin-left'>;
  'scroll-margin-right': TokenProperties<'scroll-margin-right'>;
  'scroll-margin-top': TokenProperties<'scroll-margin-top'>;
  'scroll-padding-bottom': TokenProperties<'scroll-padding-bottom'>;
  'scroll-padding-left': TokenProperties<'scroll-padding-left'>;
  'scroll-padding-right': TokenProperties<'scroll-padding-right'>;
  'scroll-padding-top': TokenProperties<'scroll-padding-top'>;
  'scroll-snap-align': TokenProperties<'scroll-snap-align'>;
  'scroll-snap-margin-bottom': TokenProperties<'scroll-snap-margin-bottom'>;
  'scroll-snap-margin-left': TokenProperties<'scroll-snap-margin-left'>;
  'scroll-snap-margin-right': TokenProperties<'scroll-snap-margin-right'>;
  'scroll-snap-margin-top': TokenProperties<'scroll-snap-margin-top'>;
  'scroll-snap-stop': TokenProperties<'scroll-snap-stop'>;
  'scroll-snap-type': TokenProperties<'scroll-snap-type'>;
  'scroll-timeline-axis': TokenProperties<'scroll-timeline-axis'>;
  'scroll-timeline-name': TokenProperties<'scroll-timeline-name'>;
  'scrollbar-color': TokenProperties<'scrollbar-color'>;
  'scrollbar-gutter': TokenProperties<'scrollbar-gutter'>;
  'scrollbar-width': TokenProperties<'scrollbar-width'>;
  'shape-image-threshold': TokenProperties<'shape-image-threshold'>;
  'shape-margin': TokenProperties<'shape-margin'>;
  'shape-outside': TokenProperties<'shape-outside'>;
  'tab-size': TokenProperties<'tab-size'>;
  'table-layout': TokenProperties<'table-layout'>;
  'text-align': TokenProperties<'text-align'>;
  'text-align-last': TokenProperties<'text-align-last'>;
  'text-combine-upright': TokenProperties<'text-combine-upright'>;
  'text-decoration-color': TokenProperties<'text-decoration-color'>;
  'text-decoration-line': TokenProperties<'text-decoration-line'>;
  'text-decoration-skip': TokenProperties<'text-decoration-skip'>;
  'text-decoration-skip-ink': TokenProperties<'text-decoration-skip-ink'>;
  'text-decoration-style': TokenProperties<'text-decoration-style'>;
  'text-decoration-thickness': TokenProperties<'text-decoration-thickness'>;
  'text-emphasis-color': TokenProperties<'text-emphasis-color'>;
  'text-emphasis-position': TokenProperties<'text-emphasis-position'>;
  'text-emphasis-style': TokenProperties<'text-emphasis-style'>;
  'text-indent': TokenProperties<'text-indent'>;
  'text-justify': TokenProperties<'text-justify'>;
  'text-orientation': TokenProperties<'text-orientation'>;
  'text-overflow': TokenProperties<'text-overflow'>;
  'text-rendering': TokenProperties<'text-rendering'>;
  'text-shadow': TokenProperties<'text-shadow'>;
  'text-size-adjust': TokenProperties<'text-size-adjust'>;
  'text-transform': TokenProperties<'text-transform'>;
  'text-underline-offset': TokenProperties<'text-underline-offset'>;
  'text-underline-position': TokenProperties<'text-underline-position'>;
  'text-wrap': TokenProperties<'text-wrap'>;
  'timeline-scope': TokenProperties<'timeline-scope'>;
  top: TokenProperties<'top'>;
  'touch-action': TokenProperties<'touch-action'>;
  transform: TokenProperties<'transform'>;
  'transform-box': TokenProperties<'transform-box'>;
  'transform-origin': TokenProperties<'transform-origin'>;
  'transform-style': TokenProperties<'transform-style'>;
  'transition-behavior': TokenProperties<'transition-behavior'>;
  'transition-delay': TokenProperties<'transition-delay'>;
  'transition-duration': TokenProperties<'transition-duration'>;
  'transition-property': TokenProperties<'transition-property'>;
  'transition-timing-function': TokenProperties<'transition-timing-function'>;
  translate: TokenProperties<'translate'>;
  'unicode-bidi': TokenProperties<'unicode-bidi'>;
  'user-select': TokenProperties<'user-select'>;
  'vertical-align': TokenProperties<'vertical-align'>;
  'view-timeline-axis': TokenProperties<'view-timeline-axis'>;
  'view-timeline-inset': TokenProperties<'view-timeline-inset'>;
  'view-timeline-name': TokenProperties<'view-timeline-name'>;
  'view-transition-name': TokenProperties<'view-transition-name'>;
  visibility: TokenProperties<'visibility'>;
  'white-space': TokenProperties<'white-space'>;
  'white-space-collapse': TokenProperties<'white-space-collapse'>;
  'white-space-trim': TokenProperties<'white-space-trim'>;
  widows: TokenProperties<'widows'>;
  width: TokenProperties<'width'>;
  'will-change': TokenProperties<'will-change'>;
  'word-break': TokenProperties<'word-break'>;
  'word-spacing': TokenProperties<'word-spacing'>;
  'word-wrap': TokenProperties<'word-wrap'>;
  'writing-mode': TokenProperties<'writing-mode'>;
  'z-index': TokenProperties<'z-index'>;
  zoom: TokenProperties<'zoom'>;
  'alignment-baseline': TokenProperties<'alignment-baseline'>;
  'baseline-shift': TokenProperties<'baseline-shift'>;
  clip: TokenProperties<'clip'>;
  'clip-rule': TokenProperties<'clip-rule'>;
  'color-interpolation': TokenProperties<'color-interpolation'>;
  'color-rendering': TokenProperties<'color-rendering'>;
  'dominant-baseline': TokenProperties<'dominant-baseline'>;
  fill: TokenProperties<'fill'>;
  'fill-opacity': TokenProperties<'fill-opacity'>;
  'fill-rule': TokenProperties<'fill-rule'>;
  'flood-color': TokenProperties<'flood-color'>;
  'flood-opacity': TokenProperties<'flood-opacity'>;
  'glyph-orientation-vertical': TokenProperties<'glyph-orientation-vertical'>;
  'lighting-color': TokenProperties<'lighting-color'>;
  marker: TokenProperties<'marker'>;
  'marker-end': TokenProperties<'marker-end'>;
  'marker-mid': TokenProperties<'marker-mid'>;
  'marker-start': TokenProperties<'marker-start'>;
  'shape-rendering': TokenProperties<'shape-rendering'>;
  'stop-color': TokenProperties<'stop-color'>;
  'stop-opacity': TokenProperties<'stop-opacity'>;
  stroke: TokenProperties<'stroke'>;
  'stroke-dasharray': TokenProperties<'stroke-dasharray'>;
  'stroke-dashoffset': TokenProperties<'stroke-dashoffset'>;
  'stroke-linecap': TokenProperties<'stroke-linecap'>;
  'stroke-linejoin': TokenProperties<'stroke-linejoin'>;
  'stroke-miterlimit': TokenProperties<'stroke-miterlimit'>;
  'stroke-opacity': TokenProperties<'stroke-opacity'>;
  'stroke-width': TokenProperties<'stroke-width'>;
  'text-anchor': TokenProperties<'text-anchor'>;
  'vector-effect': TokenProperties<'vector-effect'>;
  'block-overflow': TokenProperties<'block-overflow'>;
  'block-size': TokenProperties<'block-size'>;
  'border-block': TokenProperties<'border-block'>;
  'border-block-end': TokenProperties<'border-block-end'>;
  'border-block-start': TokenProperties<'border-block-start'>;
  'border-block-color': TokenProperties<'border-block-color'>;
  'border-block-end-color': TokenProperties<'border-block-end-color'>;
  'border-block-end-style': TokenProperties<'border-block-end-style'>;
  'border-block-end-width': TokenProperties<'border-block-end-width'>;
  'border-block-start-color': TokenProperties<'border-block-start-color'>;
  'border-block-start-style': TokenProperties<'border-block-start-style'>;
  'border-block-start-width': TokenProperties<'border-block-start-width'>;
  'border-block-style': TokenProperties<'border-block-style'>;
  'border-block-width': TokenProperties<'border-block-width'>;
  'border-inline': TokenProperties<'border-inline'>;
  'border-inline-end': TokenProperties<'border-inline-end'>;
  'border-inline-start': TokenProperties<'border-inline-start'>;
  'border-inline-color': TokenProperties<'border-inline-color'>;
  'border-inline-end-color': TokenProperties<'border-inline-end-color'>;
  'border-inline-end-style': TokenProperties<'border-inline-end-style'>;
  'border-inline-end-width': TokenProperties<'border-inline-end-width'>;
  'border-inline-start-color': TokenProperties<'border-inline-start-color'>;
  'border-inline-start-style': TokenProperties<'border-inline-start-style'>;
  'border-inline-start-width': TokenProperties<'border-inline-start-width'>;
  'border-inline-style': TokenProperties<'border-inline-style'>;
  'border-inline-width': TokenProperties<'border-inline-width'>;
  'contain-intrinsic-block-size': TokenProperties<'contain-intrinsic-block-size'>;
  'contain-intrinsic-inline-size': TokenProperties<'contain-intrinsic-inline-size'>;
  'inline-size': TokenProperties<'inline-size'>;
  'inset-block': TokenProperties<'inset-block'>;
  'inset-block-end': TokenProperties<'inset-block-end'>;
  'inset-block-start': TokenProperties<'inset-block-start'>;
  'inset-inline': TokenProperties<'inset-inline'>;
  'inset-inline-end': TokenProperties<'inset-inline-end'>;
  'inset-inline-start': TokenProperties<'inset-inline-start'>;
  'margin-block': TokenProperties<'margin-block'>;
  'margin-block-end': TokenProperties<'margin-block-end'>;
  'margin-block-start': TokenProperties<'margin-block-start'>;
  'margin-inline': TokenProperties<'margin-inline'>;
  'margin-inline-end': TokenProperties<'margin-inline-end'>;
  'margin-inline-start': TokenProperties<'margin-inline-start'>;
  'max-block-size': TokenProperties<'max-block-size'>;
  'max-inline-size': TokenProperties<'max-inline-size'>;
  'min-block-size': TokenProperties<'min-block-size'>;
  'min-inline-size': TokenProperties<'min-inline-size'>;
  'overflow-block': TokenProperties<'overflow-block'>;
  'overflow-inline': TokenProperties<'overflow-inline'>;
  'overscroll-behavior-block': TokenProperties<'overscroll-behavior-block'>;
  'overscroll-behavior-inline': TokenProperties<'overscroll-behavior-inline'>;
  'padding-block': TokenProperties<'padding-block'>;
  'padding-block-end': TokenProperties<'padding-block-end'>;
  'padding-block-start': TokenProperties<'padding-block-start'>;
  'padding-inline': TokenProperties<'padding-inline'>;
  'padding-inline-end': TokenProperties<'padding-inline-end'>;
  'padding-inline-start': TokenProperties<'padding-inline-start'>;
  'scroll-margin-block': TokenProperties<'scroll-margin-block'>;
  'scroll-margin-block-end': TokenProperties<'scroll-margin-block-end'>;
  'scroll-margin-block-start': TokenProperties<'scroll-margin-block-start'>;
  'scroll-margin-inline': TokenProperties<'scroll-margin-inline'>;
  'scroll-margin-inline-end': TokenProperties<'scroll-margin-inline-end'>;
  'scroll-margin-inline-start': TokenProperties<'scroll-margin-inline-start'>;
  'scroll-padding-block': TokenProperties<'scroll-padding-block'>;
  'scroll-padding-block-end': TokenProperties<'scroll-padding-block-end'>;
  'scroll-padding-block-start': TokenProperties<'scroll-padding-block-start'>;
  'scroll-padding-inline': TokenProperties<'scroll-padding-inline'>;
  'scroll-padding-inline-end': TokenProperties<'scroll-padding-inline-end'>;
  'scroll-padding-inline-start': TokenProperties<'scroll-padding-inline-start'>;
}

/**
 * -------------------------------------------------------------------------
 * we purposefully use an interface and list these manually for performance.
 * using intersection types or inference wld cripple intellisense perf.
 * -------------------------------------------------------------------------
 * generated from the following snippet in console. KISS for now.

  // copy(`
  // interface TokenamiProperties extends ${properties.map(prop => `TokenProperties<'${prop}'>`).join(', ')} {
  //   [customProperty: \`---\${string}\`]: string | number | undefined;
  // }
  // `)
 * -------------------------------------------------------------------------
 */

interface TokenamiProperties
  extends TokenProperties<'all'>,
    TokenProperties<'animation'>,
    TokenProperties<'animation-range'>,
    TokenProperties<'background'>,
    TokenProperties<'background-position'>,
    TokenProperties<'border'>,
    TokenProperties<'border-bottom'>,
    TokenProperties<'border-color'>,
    TokenProperties<'border-image'>,
    TokenProperties<'border-left'>,
    TokenProperties<'border-radius'>,
    TokenProperties<'border-right'>,
    TokenProperties<'border-style'>,
    TokenProperties<'border-top'>,
    TokenProperties<'border-width'>,
    TokenProperties<'caret'>,
    TokenProperties<'column-rule'>,
    TokenProperties<'columns'>,
    TokenProperties<'contain-intrinsic-size'>,
    TokenProperties<'container'>,
    TokenProperties<'flex'>,
    TokenProperties<'flex-flow'>,
    TokenProperties<'font'>,
    TokenProperties<'gap'>,
    TokenProperties<'grid'>,
    TokenProperties<'grid-area'>,
    TokenProperties<'grid-column'>,
    TokenProperties<'grid-row'>,
    TokenProperties<'grid-template'>,
    TokenProperties<'inset'>,
    TokenProperties<'line-clamp'>,
    TokenProperties<'list-style'>,
    TokenProperties<'margin'>,
    TokenProperties<'mask'>,
    TokenProperties<'mask-border'>,
    TokenProperties<'motion'>,
    TokenProperties<'offset'>,
    TokenProperties<'outline'>,
    TokenProperties<'overflow'>,
    TokenProperties<'overscroll-behavior'>,
    TokenProperties<'padding'>,
    TokenProperties<'place-content'>,
    TokenProperties<'place-items'>,
    TokenProperties<'place-self'>,
    TokenProperties<'scroll-margin'>,
    TokenProperties<'scroll-padding'>,
    TokenProperties<'scroll-snap-margin'>,
    TokenProperties<'scroll-timeline'>,
    TokenProperties<'text-decoration'>,
    TokenProperties<'text-emphasis'>,
    TokenProperties<'transition'>,
    TokenProperties<'view-timeline'>,
    TokenProperties<'accent-color'>,
    TokenProperties<'align-content'>,
    TokenProperties<'align-items'>,
    TokenProperties<'align-self'>,
    TokenProperties<'align-tracks'>,
    TokenProperties<'animation-composition'>,
    TokenProperties<'animation-delay'>,
    TokenProperties<'animation-direction'>,
    TokenProperties<'animation-duration'>,
    TokenProperties<'animation-fill-mode'>,
    TokenProperties<'animation-iteration-count'>,
    TokenProperties<'animation-name'>,
    TokenProperties<'animation-play-state'>,
    TokenProperties<'animation-range-end'>,
    TokenProperties<'animation-range-start'>,
    TokenProperties<'animation-timeline'>,
    TokenProperties<'animation-timing-function'>,
    TokenProperties<'appearance'>,
    TokenProperties<'aspect-ratio'>,
    TokenProperties<'backdrop-filter'>,
    TokenProperties<'backface-visibility'>,
    TokenProperties<'background-attachment'>,
    TokenProperties<'background-blend-mode'>,
    TokenProperties<'background-clip'>,
    TokenProperties<'background-color'>,
    TokenProperties<'background-image'>,
    TokenProperties<'background-origin'>,
    TokenProperties<'background-position-x'>,
    TokenProperties<'background-position-y'>,
    TokenProperties<'background-repeat'>,
    TokenProperties<'background-size'>,
    TokenProperties<'border-bottom-color'>,
    TokenProperties<'border-bottom-left-radius'>,
    TokenProperties<'border-bottom-right-radius'>,
    TokenProperties<'border-bottom-style'>,
    TokenProperties<'border-bottom-width'>,
    TokenProperties<'border-collapse'>,
    TokenProperties<'border-end-end-radius'>,
    TokenProperties<'border-end-start-radius'>,
    TokenProperties<'border-image-outset'>,
    TokenProperties<'border-image-repeat'>,
    TokenProperties<'border-image-slice'>,
    TokenProperties<'border-image-source'>,
    TokenProperties<'border-image-width'>,
    TokenProperties<'border-left-color'>,
    TokenProperties<'border-left-style'>,
    TokenProperties<'border-left-width'>,
    TokenProperties<'border-right-color'>,
    TokenProperties<'border-right-style'>,
    TokenProperties<'border-right-width'>,
    TokenProperties<'border-spacing'>,
    TokenProperties<'border-start-end-radius'>,
    TokenProperties<'border-start-start-radius'>,
    TokenProperties<'border-top-color'>,
    TokenProperties<'border-top-left-radius'>,
    TokenProperties<'border-top-right-radius'>,
    TokenProperties<'border-top-style'>,
    TokenProperties<'border-top-width'>,
    TokenProperties<'bottom'>,
    TokenProperties<'box-decoration-break'>,
    TokenProperties<'box-shadow'>,
    TokenProperties<'box-sizing'>,
    TokenProperties<'break-after'>,
    TokenProperties<'break-before'>,
    TokenProperties<'break-inside'>,
    TokenProperties<'caption-side'>,
    TokenProperties<'caret-color'>,
    TokenProperties<'caret-shape'>,
    TokenProperties<'clear'>,
    TokenProperties<'clip-path'>,
    TokenProperties<'color'>,
    TokenProperties<'color-adjust'>,
    TokenProperties<'color-scheme'>,
    TokenProperties<'column-count'>,
    TokenProperties<'column-fill'>,
    TokenProperties<'column-gap'>,
    TokenProperties<'column-rule-color'>,
    TokenProperties<'column-rule-style'>,
    TokenProperties<'column-rule-width'>,
    TokenProperties<'column-span'>,
    TokenProperties<'column-width'>,
    TokenProperties<'contain'>,
    TokenProperties<'contain-intrinsic-height'>,
    TokenProperties<'contain-intrinsic-width'>,
    TokenProperties<'container-name'>,
    TokenProperties<'container-type'>,
    TokenProperties<'content'>,
    TokenProperties<'content-visibility'>,
    TokenProperties<'counter-increment'>,
    TokenProperties<'counter-reset'>,
    TokenProperties<'counter-set'>,
    TokenProperties<'cursor'>,
    TokenProperties<'direction'>,
    TokenProperties<'display'>,
    TokenProperties<'empty-cells'>,
    TokenProperties<'filter'>,
    TokenProperties<'flex-basis'>,
    TokenProperties<'flex-direction'>,
    TokenProperties<'flex-grow'>,
    TokenProperties<'flex-shrink'>,
    TokenProperties<'flex-wrap'>,
    TokenProperties<'float'>,
    TokenProperties<'font-family'>,
    TokenProperties<'font-feature-settings'>,
    TokenProperties<'font-kerning'>,
    TokenProperties<'font-language-override'>,
    TokenProperties<'font-optical-sizing'>,
    TokenProperties<'font-palette'>,
    TokenProperties<'font-size'>,
    TokenProperties<'font-size-adjust'>,
    TokenProperties<'font-smooth'>,
    TokenProperties<'font-stretch'>,
    TokenProperties<'font-style'>,
    TokenProperties<'font-synthesis'>,
    TokenProperties<'font-synthesis-position'>,
    TokenProperties<'font-synthesis-small-caps'>,
    TokenProperties<'font-synthesis-style'>,
    TokenProperties<'font-synthesis-weight'>,
    TokenProperties<'font-variant'>,
    TokenProperties<'font-variant-alternates'>,
    TokenProperties<'font-variant-caps'>,
    TokenProperties<'font-variant-east-asian'>,
    TokenProperties<'font-variant-emoji'>,
    TokenProperties<'font-variant-ligatures'>,
    TokenProperties<'font-variant-numeric'>,
    TokenProperties<'font-variant-position'>,
    TokenProperties<'font-variation-settings'>,
    TokenProperties<'font-weight'>,
    TokenProperties<'forced-color-adjust'>,
    TokenProperties<'grid-auto-columns'>,
    TokenProperties<'grid-auto-flow'>,
    TokenProperties<'grid-auto-rows'>,
    TokenProperties<'grid-column-end'>,
    TokenProperties<'grid-column-start'>,
    TokenProperties<'grid-row-end'>,
    TokenProperties<'grid-row-start'>,
    TokenProperties<'grid-template-areas'>,
    TokenProperties<'grid-template-columns'>,
    TokenProperties<'grid-template-rows'>,
    TokenProperties<'hanging-punctuation'>,
    TokenProperties<'height'>,
    TokenProperties<'hyphenate-character'>,
    TokenProperties<'hyphenate-limit-chars'>,
    TokenProperties<'hyphens'>,
    TokenProperties<'image-orientation'>,
    TokenProperties<'image-rendering'>,
    TokenProperties<'image-resolution'>,
    TokenProperties<'initial-letter'>,
    TokenProperties<'input-security'>,
    TokenProperties<'isolation'>,
    TokenProperties<'justify-content'>,
    TokenProperties<'justify-items'>,
    TokenProperties<'justify-self'>,
    TokenProperties<'justify-tracks'>,
    TokenProperties<'left'>,
    TokenProperties<'letter-spacing'>,
    TokenProperties<'line-break'>,
    TokenProperties<'line-height'>,
    TokenProperties<'line-height-step'>,
    TokenProperties<'list-style-image'>,
    TokenProperties<'list-style-position'>,
    TokenProperties<'list-style-type'>,
    TokenProperties<'margin-bottom'>,
    TokenProperties<'margin-left'>,
    TokenProperties<'margin-right'>,
    TokenProperties<'margin-top'>,
    TokenProperties<'margin-trim'>,
    TokenProperties<'mask-border-mode'>,
    TokenProperties<'mask-border-outset'>,
    TokenProperties<'mask-border-repeat'>,
    TokenProperties<'mask-border-slice'>,
    TokenProperties<'mask-border-source'>,
    TokenProperties<'mask-border-width'>,
    TokenProperties<'mask-clip'>,
    TokenProperties<'mask-composite'>,
    TokenProperties<'mask-image'>,
    TokenProperties<'mask-mode'>,
    TokenProperties<'mask-origin'>,
    TokenProperties<'mask-position'>,
    TokenProperties<'mask-repeat'>,
    TokenProperties<'mask-size'>,
    TokenProperties<'mask-type'>,
    TokenProperties<'masonry-auto-flow'>,
    TokenProperties<'math-depth'>,
    TokenProperties<'math-shift'>,
    TokenProperties<'math-style'>,
    TokenProperties<'max-height'>,
    TokenProperties<'max-lines'>,
    TokenProperties<'max-width'>,
    TokenProperties<'min-height'>,
    TokenProperties<'min-width'>,
    TokenProperties<'mix-blend-mode'>,
    TokenProperties<'motion-distance'>,
    TokenProperties<'motion-path'>,
    TokenProperties<'motion-rotation'>,
    TokenProperties<'object-fit'>,
    TokenProperties<'object-position'>,
    TokenProperties<'offset-anchor'>,
    TokenProperties<'offset-distance'>,
    TokenProperties<'offset-path'>,
    TokenProperties<'offset-position'>,
    TokenProperties<'offset-rotate'>,
    TokenProperties<'offset-rotation'>,
    TokenProperties<'opacity'>,
    TokenProperties<'order'>,
    TokenProperties<'orphans'>,
    TokenProperties<'outline-color'>,
    TokenProperties<'outline-offset'>,
    TokenProperties<'outline-style'>,
    TokenProperties<'outline-width'>,
    TokenProperties<'overflow-anchor'>,
    TokenProperties<'overflow-clip-box'>,
    TokenProperties<'overflow-clip-margin'>,
    TokenProperties<'overflow-wrap'>,
    TokenProperties<'overflow-x'>,
    TokenProperties<'overflow-y'>,
    TokenProperties<'overlay'>,
    TokenProperties<'overscroll-behavior-x'>,
    TokenProperties<'overscroll-behavior-y'>,
    TokenProperties<'padding-bottom'>,
    TokenProperties<'padding-left'>,
    TokenProperties<'padding-right'>,
    TokenProperties<'padding-top'>,
    TokenProperties<'page'>,
    TokenProperties<'page-break-after'>,
    TokenProperties<'page-break-before'>,
    TokenProperties<'page-break-inside'>,
    TokenProperties<'paint-order'>,
    TokenProperties<'perspective'>,
    TokenProperties<'perspective-origin'>,
    TokenProperties<'pointer-events'>,
    TokenProperties<'position'>,
    TokenProperties<'print-color-adjust'>,
    TokenProperties<'quotes'>,
    TokenProperties<'resize'>,
    TokenProperties<'right'>,
    TokenProperties<'rotate'>,
    TokenProperties<'row-gap'>,
    TokenProperties<'ruby-align'>,
    TokenProperties<'ruby-merge'>,
    TokenProperties<'ruby-position'>,
    TokenProperties<'scale'>,
    TokenProperties<'scroll-behavior'>,
    TokenProperties<'scroll-margin-bottom'>,
    TokenProperties<'scroll-margin-left'>,
    TokenProperties<'scroll-margin-right'>,
    TokenProperties<'scroll-margin-top'>,
    TokenProperties<'scroll-padding-bottom'>,
    TokenProperties<'scroll-padding-left'>,
    TokenProperties<'scroll-padding-right'>,
    TokenProperties<'scroll-padding-top'>,
    TokenProperties<'scroll-snap-align'>,
    TokenProperties<'scroll-snap-margin-bottom'>,
    TokenProperties<'scroll-snap-margin-left'>,
    TokenProperties<'scroll-snap-margin-right'>,
    TokenProperties<'scroll-snap-margin-top'>,
    TokenProperties<'scroll-snap-stop'>,
    TokenProperties<'scroll-snap-type'>,
    TokenProperties<'scroll-timeline-axis'>,
    TokenProperties<'scroll-timeline-name'>,
    TokenProperties<'scrollbar-color'>,
    TokenProperties<'scrollbar-gutter'>,
    TokenProperties<'scrollbar-width'>,
    TokenProperties<'shape-image-threshold'>,
    TokenProperties<'shape-margin'>,
    TokenProperties<'shape-outside'>,
    TokenProperties<'tab-size'>,
    TokenProperties<'table-layout'>,
    TokenProperties<'text-align'>,
    TokenProperties<'text-align-last'>,
    TokenProperties<'text-combine-upright'>,
    TokenProperties<'text-decoration-color'>,
    TokenProperties<'text-decoration-line'>,
    TokenProperties<'text-decoration-skip'>,
    TokenProperties<'text-decoration-skip-ink'>,
    TokenProperties<'text-decoration-style'>,
    TokenProperties<'text-decoration-thickness'>,
    TokenProperties<'text-emphasis-color'>,
    TokenProperties<'text-emphasis-position'>,
    TokenProperties<'text-emphasis-style'>,
    TokenProperties<'text-indent'>,
    TokenProperties<'text-justify'>,
    TokenProperties<'text-orientation'>,
    TokenProperties<'text-overflow'>,
    TokenProperties<'text-rendering'>,
    TokenProperties<'text-shadow'>,
    TokenProperties<'text-size-adjust'>,
    TokenProperties<'text-transform'>,
    TokenProperties<'text-underline-offset'>,
    TokenProperties<'text-underline-position'>,
    TokenProperties<'text-wrap'>,
    TokenProperties<'timeline-scope'>,
    TokenProperties<'top'>,
    TokenProperties<'touch-action'>,
    TokenProperties<'transform'>,
    TokenProperties<'transform-box'>,
    TokenProperties<'transform-origin'>,
    TokenProperties<'transform-style'>,
    TokenProperties<'transition-behavior'>,
    TokenProperties<'transition-delay'>,
    TokenProperties<'transition-duration'>,
    TokenProperties<'transition-property'>,
    TokenProperties<'transition-timing-function'>,
    TokenProperties<'translate'>,
    TokenProperties<'unicode-bidi'>,
    TokenProperties<'user-select'>,
    TokenProperties<'vertical-align'>,
    TokenProperties<'view-timeline-axis'>,
    TokenProperties<'view-timeline-inset'>,
    TokenProperties<'view-timeline-name'>,
    TokenProperties<'view-transition-name'>,
    TokenProperties<'visibility'>,
    TokenProperties<'white-space'>,
    TokenProperties<'white-space-collapse'>,
    TokenProperties<'white-space-trim'>,
    TokenProperties<'widows'>,
    TokenProperties<'width'>,
    TokenProperties<'will-change'>,
    TokenProperties<'word-break'>,
    TokenProperties<'word-spacing'>,
    TokenProperties<'word-wrap'>,
    TokenProperties<'writing-mode'>,
    TokenProperties<'z-index'>,
    TokenProperties<'zoom'>,
    TokenProperties<'alignment-baseline'>,
    TokenProperties<'baseline-shift'>,
    TokenProperties<'clip'>,
    TokenProperties<'clip-rule'>,
    TokenProperties<'color-interpolation'>,
    TokenProperties<'color-rendering'>,
    TokenProperties<'dominant-baseline'>,
    TokenProperties<'fill'>,
    TokenProperties<'fill-opacity'>,
    TokenProperties<'fill-rule'>,
    TokenProperties<'flood-color'>,
    TokenProperties<'flood-opacity'>,
    TokenProperties<'glyph-orientation-vertical'>,
    TokenProperties<'lighting-color'>,
    TokenProperties<'marker'>,
    TokenProperties<'marker-end'>,
    TokenProperties<'marker-mid'>,
    TokenProperties<'marker-start'>,
    TokenProperties<'shape-rendering'>,
    TokenProperties<'stop-color'>,
    TokenProperties<'stop-opacity'>,
    TokenProperties<'stroke'>,
    TokenProperties<'stroke-dasharray'>,
    TokenProperties<'stroke-dashoffset'>,
    TokenProperties<'stroke-linecap'>,
    TokenProperties<'stroke-linejoin'>,
    TokenProperties<'stroke-miterlimit'>,
    TokenProperties<'stroke-opacity'>,
    TokenProperties<'stroke-width'>,
    TokenProperties<'text-anchor'>,
    TokenProperties<'vector-effect'>,
    TokenProperties<'block-overflow'>,
    TokenProperties<'block-size'>,
    TokenProperties<'border-block'>,
    TokenProperties<'border-block-end'>,
    TokenProperties<'border-block-start'>,
    TokenProperties<'border-block-color'>,
    TokenProperties<'border-block-end-color'>,
    TokenProperties<'border-block-end-style'>,
    TokenProperties<'border-block-end-width'>,
    TokenProperties<'border-block-start-color'>,
    TokenProperties<'border-block-start-style'>,
    TokenProperties<'border-block-start-width'>,
    TokenProperties<'border-block-style'>,
    TokenProperties<'border-block-width'>,
    TokenProperties<'border-inline'>,
    TokenProperties<'border-inline-end'>,
    TokenProperties<'border-inline-start'>,
    TokenProperties<'border-inline-color'>,
    TokenProperties<'border-inline-end-color'>,
    TokenProperties<'border-inline-end-style'>,
    TokenProperties<'border-inline-end-width'>,
    TokenProperties<'border-inline-start-color'>,
    TokenProperties<'border-inline-start-style'>,
    TokenProperties<'border-inline-start-width'>,
    TokenProperties<'border-inline-style'>,
    TokenProperties<'border-inline-width'>,
    TokenProperties<'contain-intrinsic-block-size'>,
    TokenProperties<'contain-intrinsic-inline-size'>,
    TokenProperties<'inline-size'>,
    TokenProperties<'inset-block'>,
    TokenProperties<'inset-block-end'>,
    TokenProperties<'inset-block-start'>,
    TokenProperties<'inset-inline'>,
    TokenProperties<'inset-inline-end'>,
    TokenProperties<'inset-inline-start'>,
    TokenProperties<'margin-block'>,
    TokenProperties<'margin-block-end'>,
    TokenProperties<'margin-block-start'>,
    TokenProperties<'margin-inline'>,
    TokenProperties<'margin-inline-end'>,
    TokenProperties<'margin-inline-start'>,
    TokenProperties<'max-block-size'>,
    TokenProperties<'max-inline-size'>,
    TokenProperties<'min-block-size'>,
    TokenProperties<'min-inline-size'>,
    TokenProperties<'overflow-block'>,
    TokenProperties<'overflow-inline'>,
    TokenProperties<'overscroll-behavior-block'>,
    TokenProperties<'overscroll-behavior-inline'>,
    TokenProperties<'padding-block'>,
    TokenProperties<'padding-block-end'>,
    TokenProperties<'padding-block-start'>,
    TokenProperties<'padding-inline'>,
    TokenProperties<'padding-inline-end'>,
    TokenProperties<'padding-inline-start'>,
    TokenProperties<'scroll-margin-block'>,
    TokenProperties<'scroll-margin-block-end'>,
    TokenProperties<'scroll-margin-block-start'>,
    TokenProperties<'scroll-margin-inline'>,
    TokenProperties<'scroll-margin-inline-end'>,
    TokenProperties<'scroll-margin-inline-start'>,
    TokenProperties<'scroll-padding-block'>,
    TokenProperties<'scroll-padding-block-end'>,
    TokenProperties<'scroll-padding-block-start'>,
    TokenProperties<'scroll-padding-inline'>,
    TokenProperties<'scroll-padding-inline-end'>,
    TokenProperties<'scroll-padding-inline-start'> {
  [customProperty: `---${string}`]: string | number | undefined;
}

type TokenamiPropertiesPick<P extends keyof Properties> = Pick<Properties, P> extends infer T
  ? T[keyof T]
  : never;

type TokenamiPropertiesOmit<P extends keyof Properties> = Omit<Properties, P> extends infer T
  ? T[keyof T]
  : never;

export type {
  TokenamiConfig,
  TokenamiFinalConfig,
  TokenamiProperties,
  TokenamiPropertiesPick,
  TokenamiPropertiesOmit,
  TokenProperties,
};
