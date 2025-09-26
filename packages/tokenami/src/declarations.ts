import type * as CSS from 'csstype';
import type * as Tokenami from '@tokenami/config';

type Merge<A, B> = B extends never ? A : Omit<A, keyof B> & B;

// consumer will override this interface
interface TokenamiConfig {}
interface TokenamiFinalConfig extends Merge<Tokenami.Config, TokenamiConfig> {}

type ThemeConfig = TokenamiFinalConfig['theme'];
type AliasConfig = Omit<NonNullable<TokenamiFinalConfig['aliases']>, Tokenami.CSSProperty>;
type NativePropertyConfig = NonNullable<TokenamiFinalConfig['properties']>;
type CustomPropertyConfig = NonNullable<TokenamiFinalConfig['customProperties']>;
type ExperimentalProperty = Exclude<keyof NativePropertyConfig, keyof SupportedTokenPropertiesMap>;
type PropertyConfig = NativePropertyConfig & CustomPropertyConfig;

type Theme = ThemeConfig extends Tokenami.ThemeModes<infer T>
  ? T & ThemeConfig['root']
  : Omit<ThemeConfig, 'modes' | 'root'>;

type SupportedPropertyValue<P> = P extends keyof Tokenami.CSSProperties
  ? PropertyValue<P> extends never
    ? Tokenami.CSSProperties[P]
    : PropertyValue<P>
  : never;

type SupportedTokenProperties<P> = { [K in TokenProperty<P>]?: SupportedPropertyValue<P> };

interface SupportedTokenPropertiesMap {
  all: SupportedTokenProperties<'all'>;
  animation: SupportedTokenProperties<'animation'>;
  'animation-range': SupportedTokenProperties<'animation-range'>;
  background: SupportedTokenProperties<'background'>;
  'background-position': SupportedTokenProperties<'background-position'>;
  border: SupportedTokenProperties<'border'>;
  'border-bottom': SupportedTokenProperties<'border-bottom'>;
  'border-color': SupportedTokenProperties<'border-color'>;
  'border-image': SupportedTokenProperties<'border-image'>;
  'border-left': SupportedTokenProperties<'border-left'>;
  'border-radius': SupportedTokenProperties<'border-radius'>;
  'border-right': SupportedTokenProperties<'border-right'>;
  'border-style': SupportedTokenProperties<'border-style'>;
  'border-top': SupportedTokenProperties<'border-top'>;
  'border-width': SupportedTokenProperties<'border-width'>;
  caret: SupportedTokenProperties<'caret'>;
  'column-rule': SupportedTokenProperties<'column-rule'>;
  columns: SupportedTokenProperties<'columns'>;
  'contain-intrinsic-size': SupportedTokenProperties<'contain-intrinsic-size'>;
  container: SupportedTokenProperties<'container'>;
  flex: SupportedTokenProperties<'flex'>;
  'flex-flow': SupportedTokenProperties<'flex-flow'>;
  font: SupportedTokenProperties<'font'>;
  gap: SupportedTokenProperties<'gap'>;
  grid: SupportedTokenProperties<'grid'>;
  'grid-area': SupportedTokenProperties<'grid-area'>;
  'grid-column': SupportedTokenProperties<'grid-column'>;
  'grid-row': SupportedTokenProperties<'grid-row'>;
  'grid-template': SupportedTokenProperties<'grid-template'>;
  inset: SupportedTokenProperties<'inset'>;
  'line-clamp': SupportedTokenProperties<'line-clamp'>;
  'list-style': SupportedTokenProperties<'list-style'>;
  margin: SupportedTokenProperties<'margin'>;
  mask: SupportedTokenProperties<'mask'>;
  'mask-border': SupportedTokenProperties<'mask-border'>;
  motion: SupportedTokenProperties<'motion'>;
  offset: SupportedTokenProperties<'offset'>;
  outline: SupportedTokenProperties<'outline'>;
  overflow: SupportedTokenProperties<'overflow'>;
  'overscroll-behavior': SupportedTokenProperties<'overscroll-behavior'>;
  padding: SupportedTokenProperties<'padding'>;
  'place-content': SupportedTokenProperties<'place-content'>;
  'place-items': SupportedTokenProperties<'place-items'>;
  'place-self': SupportedTokenProperties<'place-self'>;
  'scroll-margin': SupportedTokenProperties<'scroll-margin'>;
  'scroll-padding': SupportedTokenProperties<'scroll-padding'>;
  'scroll-snap-margin': SupportedTokenProperties<'scroll-snap-margin'>;
  'scroll-timeline': SupportedTokenProperties<'scroll-timeline'>;
  'text-decoration': SupportedTokenProperties<'text-decoration'>;
  'text-emphasis': SupportedTokenProperties<'text-emphasis'>;
  transition: SupportedTokenProperties<'transition'>;
  'view-timeline': SupportedTokenProperties<'view-timeline'>;
  'accent-color': SupportedTokenProperties<'accent-color'>;
  'align-content': SupportedTokenProperties<'align-content'>;
  'align-items': SupportedTokenProperties<'align-items'>;
  'align-self': SupportedTokenProperties<'align-self'>;
  'align-tracks': SupportedTokenProperties<'align-tracks'>;
  'animation-composition': SupportedTokenProperties<'animation-composition'>;
  'animation-delay': SupportedTokenProperties<'animation-delay'>;
  'animation-direction': SupportedTokenProperties<'animation-direction'>;
  'animation-duration': SupportedTokenProperties<'animation-duration'>;
  'animation-fill-mode': SupportedTokenProperties<'animation-fill-mode'>;
  'animation-iteration-count': SupportedTokenProperties<'animation-iteration-count'>;
  'animation-name': SupportedTokenProperties<'animation-name'>;
  'animation-play-state': SupportedTokenProperties<'animation-play-state'>;
  'animation-range-end': SupportedTokenProperties<'animation-range-end'>;
  'animation-range-start': SupportedTokenProperties<'animation-range-start'>;
  'animation-timeline': SupportedTokenProperties<'animation-timeline'>;
  'animation-timing-function': SupportedTokenProperties<'animation-timing-function'>;
  appearance: SupportedTokenProperties<'appearance'>;
  'aspect-ratio': SupportedTokenProperties<'aspect-ratio'>;
  'backdrop-filter': SupportedTokenProperties<'backdrop-filter'>;
  'backface-visibility': SupportedTokenProperties<'backface-visibility'>;
  'background-attachment': SupportedTokenProperties<'background-attachment'>;
  'background-blend-mode': SupportedTokenProperties<'background-blend-mode'>;
  'background-clip': SupportedTokenProperties<'background-clip'>;
  'background-color': SupportedTokenProperties<'background-color'>;
  'background-image': SupportedTokenProperties<'background-image'>;
  'background-origin': SupportedTokenProperties<'background-origin'>;
  'background-position-x': SupportedTokenProperties<'background-position-x'>;
  'background-position-y': SupportedTokenProperties<'background-position-y'>;
  'background-repeat': SupportedTokenProperties<'background-repeat'>;
  'background-size': SupportedTokenProperties<'background-size'>;
  'border-bottom-color': SupportedTokenProperties<'border-bottom-color'>;
  'border-bottom-left-radius': SupportedTokenProperties<'border-bottom-left-radius'>;
  'border-bottom-right-radius': SupportedTokenProperties<'border-bottom-right-radius'>;
  'border-bottom-style': SupportedTokenProperties<'border-bottom-style'>;
  'border-bottom-width': SupportedTokenProperties<'border-bottom-width'>;
  'border-collapse': SupportedTokenProperties<'border-collapse'>;
  'border-end-end-radius': SupportedTokenProperties<'border-end-end-radius'>;
  'border-end-start-radius': SupportedTokenProperties<'border-end-start-radius'>;
  'border-image-outset': SupportedTokenProperties<'border-image-outset'>;
  'border-image-repeat': SupportedTokenProperties<'border-image-repeat'>;
  'border-image-slice': SupportedTokenProperties<'border-image-slice'>;
  'border-image-source': SupportedTokenProperties<'border-image-source'>;
  'border-image-width': SupportedTokenProperties<'border-image-width'>;
  'border-left-color': SupportedTokenProperties<'border-left-color'>;
  'border-left-style': SupportedTokenProperties<'border-left-style'>;
  'border-left-width': SupportedTokenProperties<'border-left-width'>;
  'border-right-color': SupportedTokenProperties<'border-right-color'>;
  'border-right-style': SupportedTokenProperties<'border-right-style'>;
  'border-right-width': SupportedTokenProperties<'border-right-width'>;
  'border-spacing': SupportedTokenProperties<'border-spacing'>;
  'border-start-end-radius': SupportedTokenProperties<'border-start-end-radius'>;
  'border-start-start-radius': SupportedTokenProperties<'border-start-start-radius'>;
  'border-top-color': SupportedTokenProperties<'border-top-color'>;
  'border-top-left-radius': SupportedTokenProperties<'border-top-left-radius'>;
  'border-top-right-radius': SupportedTokenProperties<'border-top-right-radius'>;
  'border-top-style': SupportedTokenProperties<'border-top-style'>;
  'border-top-width': SupportedTokenProperties<'border-top-width'>;
  bottom: SupportedTokenProperties<'bottom'>;
  'box-decoration-break': SupportedTokenProperties<'box-decoration-break'>;
  'box-shadow': SupportedTokenProperties<'box-shadow'>;
  'box-sizing': SupportedTokenProperties<'box-sizing'>;
  'break-after': SupportedTokenProperties<'break-after'>;
  'break-before': SupportedTokenProperties<'break-before'>;
  'break-inside': SupportedTokenProperties<'break-inside'>;
  'caption-side': SupportedTokenProperties<'caption-side'>;
  'caret-color': SupportedTokenProperties<'caret-color'>;
  'caret-shape': SupportedTokenProperties<'caret-shape'>;
  clear: SupportedTokenProperties<'clear'>;
  'clip-path': SupportedTokenProperties<'clip-path'>;
  color: SupportedTokenProperties<'color'>;
  'color-adjust': SupportedTokenProperties<'color-adjust'>;
  'color-scheme': SupportedTokenProperties<'color-scheme'>;
  'column-count': SupportedTokenProperties<'column-count'>;
  'column-fill': SupportedTokenProperties<'column-fill'>;
  'column-gap': SupportedTokenProperties<'column-gap'>;
  'column-rule-color': SupportedTokenProperties<'column-rule-color'>;
  'column-rule-style': SupportedTokenProperties<'column-rule-style'>;
  'column-rule-width': SupportedTokenProperties<'column-rule-width'>;
  'column-span': SupportedTokenProperties<'column-span'>;
  'column-width': SupportedTokenProperties<'column-width'>;
  contain: SupportedTokenProperties<'contain'>;
  'contain-intrinsic-height': SupportedTokenProperties<'contain-intrinsic-height'>;
  'contain-intrinsic-width': SupportedTokenProperties<'contain-intrinsic-width'>;
  'container-name': SupportedTokenProperties<'container-name'>;
  'container-type': SupportedTokenProperties<'container-type'>;
  content: SupportedTokenProperties<'content'>;
  'content-visibility': SupportedTokenProperties<'content-visibility'>;
  'counter-increment': SupportedTokenProperties<'counter-increment'>;
  'counter-reset': SupportedTokenProperties<'counter-reset'>;
  'counter-set': SupportedTokenProperties<'counter-set'>;
  cursor: SupportedTokenProperties<'cursor'>;
  direction: SupportedTokenProperties<'direction'>;
  display: SupportedTokenProperties<'display'>;
  'empty-cells': SupportedTokenProperties<'empty-cells'>;
  filter: SupportedTokenProperties<'filter'>;
  'flex-basis': SupportedTokenProperties<'flex-basis'>;
  'flex-direction': SupportedTokenProperties<'flex-direction'>;
  'flex-grow': SupportedTokenProperties<'flex-grow'>;
  'flex-shrink': SupportedTokenProperties<'flex-shrink'>;
  'flex-wrap': SupportedTokenProperties<'flex-wrap'>;
  float: SupportedTokenProperties<'float'>;
  'font-family': SupportedTokenProperties<'font-family'>;
  'font-feature-settings': SupportedTokenProperties<'font-feature-settings'>;
  'font-kerning': SupportedTokenProperties<'font-kerning'>;
  'font-language-override': SupportedTokenProperties<'font-language-override'>;
  'font-optical-sizing': SupportedTokenProperties<'font-optical-sizing'>;
  'font-palette': SupportedTokenProperties<'font-palette'>;
  'font-size': SupportedTokenProperties<'font-size'>;
  'font-size-adjust': SupportedTokenProperties<'font-size-adjust'>;
  'font-smooth': SupportedTokenProperties<'font-smooth'>;
  'font-stretch': SupportedTokenProperties<'font-stretch'>;
  'font-style': SupportedTokenProperties<'font-style'>;
  'font-synthesis': SupportedTokenProperties<'font-synthesis'>;
  'font-synthesis-position': SupportedTokenProperties<'font-synthesis-position'>;
  'font-synthesis-small-caps': SupportedTokenProperties<'font-synthesis-small-caps'>;
  'font-synthesis-style': SupportedTokenProperties<'font-synthesis-style'>;
  'font-synthesis-weight': SupportedTokenProperties<'font-synthesis-weight'>;
  'font-variant': SupportedTokenProperties<'font-variant'>;
  'font-variant-alternates': SupportedTokenProperties<'font-variant-alternates'>;
  'font-variant-caps': SupportedTokenProperties<'font-variant-caps'>;
  'font-variant-east-asian': SupportedTokenProperties<'font-variant-east-asian'>;
  'font-variant-emoji': SupportedTokenProperties<'font-variant-emoji'>;
  'font-variant-ligatures': SupportedTokenProperties<'font-variant-ligatures'>;
  'font-variant-numeric': SupportedTokenProperties<'font-variant-numeric'>;
  'font-variant-position': SupportedTokenProperties<'font-variant-position'>;
  'font-variation-settings': SupportedTokenProperties<'font-variation-settings'>;
  'font-weight': SupportedTokenProperties<'font-weight'>;
  'forced-color-adjust': SupportedTokenProperties<'forced-color-adjust'>;
  'grid-auto-columns': SupportedTokenProperties<'grid-auto-columns'>;
  'grid-auto-flow': SupportedTokenProperties<'grid-auto-flow'>;
  'grid-auto-rows': SupportedTokenProperties<'grid-auto-rows'>;
  'grid-column-end': SupportedTokenProperties<'grid-column-end'>;
  'grid-column-start': SupportedTokenProperties<'grid-column-start'>;
  'grid-row-end': SupportedTokenProperties<'grid-row-end'>;
  'grid-row-start': SupportedTokenProperties<'grid-row-start'>;
  'grid-template-areas': SupportedTokenProperties<'grid-template-areas'>;
  'grid-template-columns': SupportedTokenProperties<'grid-template-columns'>;
  'grid-template-rows': SupportedTokenProperties<'grid-template-rows'>;
  'hanging-punctuation': SupportedTokenProperties<'hanging-punctuation'>;
  height: SupportedTokenProperties<'height'>;
  'hyphenate-character': SupportedTokenProperties<'hyphenate-character'>;
  'hyphenate-limit-chars': SupportedTokenProperties<'hyphenate-limit-chars'>;
  hyphens: SupportedTokenProperties<'hyphens'>;
  'image-orientation': SupportedTokenProperties<'image-orientation'>;
  'image-rendering': SupportedTokenProperties<'image-rendering'>;
  'image-resolution': SupportedTokenProperties<'image-resolution'>;
  'initial-letter': SupportedTokenProperties<'initial-letter'>;
  'input-security': SupportedTokenProperties<'input-security'>;
  isolation: SupportedTokenProperties<'isolation'>;
  'justify-content': SupportedTokenProperties<'justify-content'>;
  'justify-items': SupportedTokenProperties<'justify-items'>;
  'justify-self': SupportedTokenProperties<'justify-self'>;
  'justify-tracks': SupportedTokenProperties<'justify-tracks'>;
  left: SupportedTokenProperties<'left'>;
  'letter-spacing': SupportedTokenProperties<'letter-spacing'>;
  'line-break': SupportedTokenProperties<'line-break'>;
  'line-height': SupportedTokenProperties<'line-height'>;
  'line-height-step': SupportedTokenProperties<'line-height-step'>;
  'list-style-image': SupportedTokenProperties<'list-style-image'>;
  'list-style-position': SupportedTokenProperties<'list-style-position'>;
  'list-style-type': SupportedTokenProperties<'list-style-type'>;
  'margin-bottom': SupportedTokenProperties<'margin-bottom'>;
  'margin-left': SupportedTokenProperties<'margin-left'>;
  'margin-right': SupportedTokenProperties<'margin-right'>;
  'margin-top': SupportedTokenProperties<'margin-top'>;
  'margin-trim': SupportedTokenProperties<'margin-trim'>;
  'mask-border-mode': SupportedTokenProperties<'mask-border-mode'>;
  'mask-border-outset': SupportedTokenProperties<'mask-border-outset'>;
  'mask-border-repeat': SupportedTokenProperties<'mask-border-repeat'>;
  'mask-border-slice': SupportedTokenProperties<'mask-border-slice'>;
  'mask-border-source': SupportedTokenProperties<'mask-border-source'>;
  'mask-border-width': SupportedTokenProperties<'mask-border-width'>;
  'mask-clip': SupportedTokenProperties<'mask-clip'>;
  'mask-composite': SupportedTokenProperties<'mask-composite'>;
  'mask-image': SupportedTokenProperties<'mask-image'>;
  'mask-mode': SupportedTokenProperties<'mask-mode'>;
  'mask-origin': SupportedTokenProperties<'mask-origin'>;
  'mask-position': SupportedTokenProperties<'mask-position'>;
  'mask-repeat': SupportedTokenProperties<'mask-repeat'>;
  'mask-size': SupportedTokenProperties<'mask-size'>;
  'mask-type': SupportedTokenProperties<'mask-type'>;
  'masonry-auto-flow': SupportedTokenProperties<'masonry-auto-flow'>;
  'math-depth': SupportedTokenProperties<'math-depth'>;
  'math-shift': SupportedTokenProperties<'math-shift'>;
  'math-style': SupportedTokenProperties<'math-style'>;
  'max-height': SupportedTokenProperties<'max-height'>;
  'max-lines': SupportedTokenProperties<'max-lines'>;
  'max-width': SupportedTokenProperties<'max-width'>;
  'min-height': SupportedTokenProperties<'min-height'>;
  'min-width': SupportedTokenProperties<'min-width'>;
  'mix-blend-mode': SupportedTokenProperties<'mix-blend-mode'>;
  'motion-distance': SupportedTokenProperties<'motion-distance'>;
  'motion-path': SupportedTokenProperties<'motion-path'>;
  'motion-rotation': SupportedTokenProperties<'motion-rotation'>;
  'object-fit': SupportedTokenProperties<'object-fit'>;
  'object-position': SupportedTokenProperties<'object-position'>;
  'offset-anchor': SupportedTokenProperties<'offset-anchor'>;
  'offset-distance': SupportedTokenProperties<'offset-distance'>;
  'offset-path': SupportedTokenProperties<'offset-path'>;
  'offset-position': SupportedTokenProperties<'offset-position'>;
  'offset-rotate': SupportedTokenProperties<'offset-rotate'>;
  'offset-rotation': SupportedTokenProperties<'offset-rotation'>;
  opacity: SupportedTokenProperties<'opacity'>;
  order: SupportedTokenProperties<'order'>;
  orphans: SupportedTokenProperties<'orphans'>;
  'outline-color': SupportedTokenProperties<'outline-color'>;
  'outline-offset': SupportedTokenProperties<'outline-offset'>;
  'outline-style': SupportedTokenProperties<'outline-style'>;
  'outline-width': SupportedTokenProperties<'outline-width'>;
  'overflow-anchor': SupportedTokenProperties<'overflow-anchor'>;
  'overflow-clip-box': SupportedTokenProperties<'overflow-clip-box'>;
  'overflow-clip-margin': SupportedTokenProperties<'overflow-clip-margin'>;
  'overflow-wrap': SupportedTokenProperties<'overflow-wrap'>;
  'overflow-x': SupportedTokenProperties<'overflow-x'>;
  'overflow-y': SupportedTokenProperties<'overflow-y'>;
  overlay: SupportedTokenProperties<'overlay'>;
  'overscroll-behavior-x': SupportedTokenProperties<'overscroll-behavior-x'>;
  'overscroll-behavior-y': SupportedTokenProperties<'overscroll-behavior-y'>;
  'padding-bottom': SupportedTokenProperties<'padding-bottom'>;
  'padding-left': SupportedTokenProperties<'padding-left'>;
  'padding-right': SupportedTokenProperties<'padding-right'>;
  'padding-top': SupportedTokenProperties<'padding-top'>;
  page: SupportedTokenProperties<'page'>;
  'page-break-after': SupportedTokenProperties<'page-break-after'>;
  'page-break-before': SupportedTokenProperties<'page-break-before'>;
  'page-break-inside': SupportedTokenProperties<'page-break-inside'>;
  'paint-order': SupportedTokenProperties<'paint-order'>;
  perspective: SupportedTokenProperties<'perspective'>;
  'perspective-origin': SupportedTokenProperties<'perspective-origin'>;
  'pointer-events': SupportedTokenProperties<'pointer-events'>;
  position: SupportedTokenProperties<'position'>;
  'print-color-adjust': SupportedTokenProperties<'print-color-adjust'>;
  quotes: SupportedTokenProperties<'quotes'>;
  resize: SupportedTokenProperties<'resize'>;
  right: SupportedTokenProperties<'right'>;
  rotate: SupportedTokenProperties<'rotate'>;
  'row-gap': SupportedTokenProperties<'row-gap'>;
  'ruby-align': SupportedTokenProperties<'ruby-align'>;
  'ruby-merge': SupportedTokenProperties<'ruby-merge'>;
  'ruby-position': SupportedTokenProperties<'ruby-position'>;
  scale: SupportedTokenProperties<'scale'>;
  'scroll-behavior': SupportedTokenProperties<'scroll-behavior'>;
  'scroll-margin-bottom': SupportedTokenProperties<'scroll-margin-bottom'>;
  'scroll-margin-left': SupportedTokenProperties<'scroll-margin-left'>;
  'scroll-margin-right': SupportedTokenProperties<'scroll-margin-right'>;
  'scroll-margin-top': SupportedTokenProperties<'scroll-margin-top'>;
  'scroll-padding-bottom': SupportedTokenProperties<'scroll-padding-bottom'>;
  'scroll-padding-left': SupportedTokenProperties<'scroll-padding-left'>;
  'scroll-padding-right': SupportedTokenProperties<'scroll-padding-right'>;
  'scroll-padding-top': SupportedTokenProperties<'scroll-padding-top'>;
  'scroll-snap-align': SupportedTokenProperties<'scroll-snap-align'>;
  'scroll-snap-margin-bottom': SupportedTokenProperties<'scroll-snap-margin-bottom'>;
  'scroll-snap-margin-left': SupportedTokenProperties<'scroll-snap-margin-left'>;
  'scroll-snap-margin-right': SupportedTokenProperties<'scroll-snap-margin-right'>;
  'scroll-snap-margin-top': SupportedTokenProperties<'scroll-snap-margin-top'>;
  'scroll-snap-stop': SupportedTokenProperties<'scroll-snap-stop'>;
  'scroll-snap-type': SupportedTokenProperties<'scroll-snap-type'>;
  'scroll-timeline-axis': SupportedTokenProperties<'scroll-timeline-axis'>;
  'scroll-timeline-name': SupportedTokenProperties<'scroll-timeline-name'>;
  'scrollbar-color': SupportedTokenProperties<'scrollbar-color'>;
  'scrollbar-gutter': SupportedTokenProperties<'scrollbar-gutter'>;
  'scrollbar-width': SupportedTokenProperties<'scrollbar-width'>;
  'shape-image-threshold': SupportedTokenProperties<'shape-image-threshold'>;
  'shape-margin': SupportedTokenProperties<'shape-margin'>;
  'shape-outside': SupportedTokenProperties<'shape-outside'>;
  'tab-size': SupportedTokenProperties<'tab-size'>;
  'table-layout': SupportedTokenProperties<'table-layout'>;
  'text-align': SupportedTokenProperties<'text-align'>;
  'text-align-last': SupportedTokenProperties<'text-align-last'>;
  'text-combine-upright': SupportedTokenProperties<'text-combine-upright'>;
  'text-decoration-color': SupportedTokenProperties<'text-decoration-color'>;
  'text-decoration-line': SupportedTokenProperties<'text-decoration-line'>;
  'text-decoration-skip': SupportedTokenProperties<'text-decoration-skip'>;
  'text-decoration-skip-ink': SupportedTokenProperties<'text-decoration-skip-ink'>;
  'text-decoration-style': SupportedTokenProperties<'text-decoration-style'>;
  'text-decoration-thickness': SupportedTokenProperties<'text-decoration-thickness'>;
  'text-emphasis-color': SupportedTokenProperties<'text-emphasis-color'>;
  'text-emphasis-position': SupportedTokenProperties<'text-emphasis-position'>;
  'text-emphasis-style': SupportedTokenProperties<'text-emphasis-style'>;
  'text-indent': SupportedTokenProperties<'text-indent'>;
  'text-justify': SupportedTokenProperties<'text-justify'>;
  'text-orientation': SupportedTokenProperties<'text-orientation'>;
  'text-overflow': SupportedTokenProperties<'text-overflow'>;
  'text-rendering': SupportedTokenProperties<'text-rendering'>;
  'text-shadow': SupportedTokenProperties<'text-shadow'>;
  'text-size-adjust': SupportedTokenProperties<'text-size-adjust'>;
  'text-transform': SupportedTokenProperties<'text-transform'>;
  'text-underline-offset': SupportedTokenProperties<'text-underline-offset'>;
  'text-underline-position': SupportedTokenProperties<'text-underline-position'>;
  'text-wrap': SupportedTokenProperties<'text-wrap'>;
  'timeline-scope': SupportedTokenProperties<'timeline-scope'>;
  top: SupportedTokenProperties<'top'>;
  'touch-action': SupportedTokenProperties<'touch-action'>;
  transform: SupportedTokenProperties<'transform'>;
  'transform-box': SupportedTokenProperties<'transform-box'>;
  'transform-origin': SupportedTokenProperties<'transform-origin'>;
  'transform-style': SupportedTokenProperties<'transform-style'>;
  'transition-behavior': SupportedTokenProperties<'transition-behavior'>;
  'transition-delay': SupportedTokenProperties<'transition-delay'>;
  'transition-duration': SupportedTokenProperties<'transition-duration'>;
  'transition-property': SupportedTokenProperties<'transition-property'>;
  'transition-timing-function': SupportedTokenProperties<'transition-timing-function'>;
  translate: SupportedTokenProperties<'translate'>;
  'unicode-bidi': SupportedTokenProperties<'unicode-bidi'>;
  'user-select': SupportedTokenProperties<'user-select'>;
  'vertical-align': SupportedTokenProperties<'vertical-align'>;
  'view-timeline-axis': SupportedTokenProperties<'view-timeline-axis'>;
  'view-timeline-inset': SupportedTokenProperties<'view-timeline-inset'>;
  'view-timeline-name': SupportedTokenProperties<'view-timeline-name'>;
  'view-transition-name': SupportedTokenProperties<'view-transition-name'>;
  visibility: SupportedTokenProperties<'visibility'>;
  'white-space': SupportedTokenProperties<'white-space'>;
  'white-space-collapse': SupportedTokenProperties<'white-space-collapse'>;
  'white-space-trim': SupportedTokenProperties<'white-space-trim'>;
  widows: SupportedTokenProperties<'widows'>;
  width: SupportedTokenProperties<'width'>;
  'will-change': SupportedTokenProperties<'will-change'>;
  'word-break': SupportedTokenProperties<'word-break'>;
  'word-spacing': SupportedTokenProperties<'word-spacing'>;
  'word-wrap': SupportedTokenProperties<'word-wrap'>;
  'writing-mode': SupportedTokenProperties<'writing-mode'>;
  'z-index': SupportedTokenProperties<'z-index'>;
  zoom: SupportedTokenProperties<'zoom'>;
  'alignment-baseline': SupportedTokenProperties<'alignment-baseline'>;
  'baseline-shift': SupportedTokenProperties<'baseline-shift'>;
  clip: SupportedTokenProperties<'clip'>;
  'clip-rule': SupportedTokenProperties<'clip-rule'>;
  'color-interpolation': SupportedTokenProperties<'color-interpolation'>;
  'color-rendering': SupportedTokenProperties<'color-rendering'>;
  'dominant-baseline': SupportedTokenProperties<'dominant-baseline'>;
  fill: SupportedTokenProperties<'fill'>;
  'fill-opacity': SupportedTokenProperties<'fill-opacity'>;
  'fill-rule': SupportedTokenProperties<'fill-rule'>;
  'flood-color': SupportedTokenProperties<'flood-color'>;
  'flood-opacity': SupportedTokenProperties<'flood-opacity'>;
  'glyph-orientation-vertical': SupportedTokenProperties<'glyph-orientation-vertical'>;
  'lighting-color': SupportedTokenProperties<'lighting-color'>;
  marker: SupportedTokenProperties<'marker'>;
  'marker-end': SupportedTokenProperties<'marker-end'>;
  'marker-mid': SupportedTokenProperties<'marker-mid'>;
  'marker-start': SupportedTokenProperties<'marker-start'>;
  'shape-rendering': SupportedTokenProperties<'shape-rendering'>;
  'stop-color': SupportedTokenProperties<'stop-color'>;
  'stop-opacity': SupportedTokenProperties<'stop-opacity'>;
  stroke: SupportedTokenProperties<'stroke'>;
  'stroke-dasharray': SupportedTokenProperties<'stroke-dasharray'>;
  'stroke-dashoffset': SupportedTokenProperties<'stroke-dashoffset'>;
  'stroke-linecap': SupportedTokenProperties<'stroke-linecap'>;
  'stroke-linejoin': SupportedTokenProperties<'stroke-linejoin'>;
  'stroke-miterlimit': SupportedTokenProperties<'stroke-miterlimit'>;
  'stroke-opacity': SupportedTokenProperties<'stroke-opacity'>;
  'stroke-width': SupportedTokenProperties<'stroke-width'>;
  'text-anchor': SupportedTokenProperties<'text-anchor'>;
  'vector-effect': SupportedTokenProperties<'vector-effect'>;
  'block-overflow': SupportedTokenProperties<'block-overflow'>;
  'block-size': SupportedTokenProperties<'block-size'>;
  'border-block': SupportedTokenProperties<'border-block'>;
  'border-block-end': SupportedTokenProperties<'border-block-end'>;
  'border-block-start': SupportedTokenProperties<'border-block-start'>;
  'border-block-color': SupportedTokenProperties<'border-block-color'>;
  'border-block-end-color': SupportedTokenProperties<'border-block-end-color'>;
  'border-block-end-style': SupportedTokenProperties<'border-block-end-style'>;
  'border-block-end-width': SupportedTokenProperties<'border-block-end-width'>;
  'border-block-start-color': SupportedTokenProperties<'border-block-start-color'>;
  'border-block-start-style': SupportedTokenProperties<'border-block-start-style'>;
  'border-block-start-width': SupportedTokenProperties<'border-block-start-width'>;
  'border-block-style': SupportedTokenProperties<'border-block-style'>;
  'border-block-width': SupportedTokenProperties<'border-block-width'>;
  'border-inline': SupportedTokenProperties<'border-inline'>;
  'border-inline-end': SupportedTokenProperties<'border-inline-end'>;
  'border-inline-start': SupportedTokenProperties<'border-inline-start'>;
  'border-inline-color': SupportedTokenProperties<'border-inline-color'>;
  'border-inline-end-color': SupportedTokenProperties<'border-inline-end-color'>;
  'border-inline-end-style': SupportedTokenProperties<'border-inline-end-style'>;
  'border-inline-end-width': SupportedTokenProperties<'border-inline-end-width'>;
  'border-inline-start-color': SupportedTokenProperties<'border-inline-start-color'>;
  'border-inline-start-style': SupportedTokenProperties<'border-inline-start-style'>;
  'border-inline-start-width': SupportedTokenProperties<'border-inline-start-width'>;
  'border-inline-style': SupportedTokenProperties<'border-inline-style'>;
  'border-inline-width': SupportedTokenProperties<'border-inline-width'>;
  'contain-intrinsic-block-size': SupportedTokenProperties<'contain-intrinsic-block-size'>;
  'contain-intrinsic-inline-size': SupportedTokenProperties<'contain-intrinsic-inline-size'>;
  'inline-size': SupportedTokenProperties<'inline-size'>;
  'inset-block': SupportedTokenProperties<'inset-block'>;
  'inset-block-end': SupportedTokenProperties<'inset-block-end'>;
  'inset-block-start': SupportedTokenProperties<'inset-block-start'>;
  'inset-inline': SupportedTokenProperties<'inset-inline'>;
  'inset-inline-end': SupportedTokenProperties<'inset-inline-end'>;
  'inset-inline-start': SupportedTokenProperties<'inset-inline-start'>;
  'margin-block': SupportedTokenProperties<'margin-block'>;
  'margin-block-end': SupportedTokenProperties<'margin-block-end'>;
  'margin-block-start': SupportedTokenProperties<'margin-block-start'>;
  'margin-inline': SupportedTokenProperties<'margin-inline'>;
  'margin-inline-end': SupportedTokenProperties<'margin-inline-end'>;
  'margin-inline-start': SupportedTokenProperties<'margin-inline-start'>;
  'max-block-size': SupportedTokenProperties<'max-block-size'>;
  'max-inline-size': SupportedTokenProperties<'max-inline-size'>;
  'min-block-size': SupportedTokenProperties<'min-block-size'>;
  'min-inline-size': SupportedTokenProperties<'min-inline-size'>;
  'overflow-block': SupportedTokenProperties<'overflow-block'>;
  'overflow-inline': SupportedTokenProperties<'overflow-inline'>;
  'overscroll-behavior-block': SupportedTokenProperties<'overscroll-behavior-block'>;
  'overscroll-behavior-inline': SupportedTokenProperties<'overscroll-behavior-inline'>;
  'padding-block': SupportedTokenProperties<'padding-block'>;
  'padding-block-end': SupportedTokenProperties<'padding-block-end'>;
  'padding-block-start': SupportedTokenProperties<'padding-block-start'>;
  'padding-inline': SupportedTokenProperties<'padding-inline'>;
  'padding-inline-end': SupportedTokenProperties<'padding-inline-end'>;
  'padding-inline-start': SupportedTokenProperties<'padding-inline-start'>;
  'scroll-margin-block': SupportedTokenProperties<'scroll-margin-block'>;
  'scroll-margin-block-end': SupportedTokenProperties<'scroll-margin-block-end'>;
  'scroll-margin-block-start': SupportedTokenProperties<'scroll-margin-block-start'>;
  'scroll-margin-inline': SupportedTokenProperties<'scroll-margin-inline'>;
  'scroll-margin-inline-end': SupportedTokenProperties<'scroll-margin-inline-end'>;
  'scroll-margin-inline-start': SupportedTokenProperties<'scroll-margin-inline-start'>;
  'scroll-padding-block': SupportedTokenProperties<'scroll-padding-block'>;
  'scroll-padding-block-end': SupportedTokenProperties<'scroll-padding-block-end'>;
  'scroll-padding-block-start': SupportedTokenProperties<'scroll-padding-block-start'>;
  'scroll-padding-inline': SupportedTokenProperties<'scroll-padding-inline'>;
  'scroll-padding-inline-end': SupportedTokenProperties<'scroll-padding-inline-end'>;
  'scroll-padding-inline-start': SupportedTokenProperties<'scroll-padding-inline-start'>;
}

type CustomPropertyValueMap = {
  [K in keyof CustomPropertyConfig | ExperimentalProperty]: PropertyValue<K>;
};

type TokenProperties<P> = {
  [K in TokenProperty<P>]?: P extends keyof CustomPropertyValueMap
    ? CustomPropertyValueMap[P]
    : never;
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
  | Tokenami.VariantProperty<P, string>;

type PropertyValue<P> = P extends string
  ? P extends keyof PropertyConfig
    ? NonNullable<PropertyConfig[P]>[number] extends `${infer ThemeKey}`
      ? PropertyThemeValue<ThemeKey>
      : never
    : never
  : never;

type PropertyThemeValue<ThemeKey extends string> =
  | Tokenami.ArbitraryValue
  | CSS.Globals
  | TokenValue<ThemeKey>;

type TokenValue<ThemeKey extends string> =
  | TokensByThemeKey[ThemeKey]
  | (ThemeKey extends 'grid' | 'number' ? Tokenami.GridValue : never);

type TokensByThemeKey = { [key: string]: never } & {
  [K in keyof Theme]: keyof Theme[K] extends `${infer Token}`
    ? Tokenami.TokenValue<K, Token>
    : never;
};

// -------------------------------------------------------------------------
// we purposefully use an interface and list these manually for performance.
// using intersection types or inference wld cripple intellisense perf.
// -------------------------------------------------------------------------

interface TokenamiProperties
  extends SupportedTokenProperties<'all'>,
    SupportedTokenProperties<'animation'>,
    SupportedTokenProperties<'animation-range'>,
    SupportedTokenProperties<'background'>,
    SupportedTokenProperties<'background-position'>,
    SupportedTokenProperties<'border'>,
    SupportedTokenProperties<'border-bottom'>,
    SupportedTokenProperties<'border-color'>,
    SupportedTokenProperties<'border-image'>,
    SupportedTokenProperties<'border-left'>,
    SupportedTokenProperties<'border-radius'>,
    SupportedTokenProperties<'border-right'>,
    SupportedTokenProperties<'border-style'>,
    SupportedTokenProperties<'border-top'>,
    SupportedTokenProperties<'border-width'>,
    SupportedTokenProperties<'caret'>,
    SupportedTokenProperties<'column-rule'>,
    SupportedTokenProperties<'columns'>,
    SupportedTokenProperties<'contain-intrinsic-size'>,
    SupportedTokenProperties<'container'>,
    SupportedTokenProperties<'flex'>,
    SupportedTokenProperties<'flex-flow'>,
    SupportedTokenProperties<'font'>,
    SupportedTokenProperties<'gap'>,
    SupportedTokenProperties<'grid'>,
    SupportedTokenProperties<'grid-area'>,
    SupportedTokenProperties<'grid-column'>,
    SupportedTokenProperties<'grid-row'>,
    SupportedTokenProperties<'grid-template'>,
    SupportedTokenProperties<'inset'>,
    SupportedTokenProperties<'line-clamp'>,
    SupportedTokenProperties<'list-style'>,
    SupportedTokenProperties<'margin'>,
    SupportedTokenProperties<'mask'>,
    SupportedTokenProperties<'mask-border'>,
    SupportedTokenProperties<'motion'>,
    SupportedTokenProperties<'offset'>,
    SupportedTokenProperties<'outline'>,
    SupportedTokenProperties<'overflow'>,
    SupportedTokenProperties<'overscroll-behavior'>,
    SupportedTokenProperties<'padding'>,
    SupportedTokenProperties<'place-content'>,
    SupportedTokenProperties<'place-items'>,
    SupportedTokenProperties<'place-self'>,
    SupportedTokenProperties<'scroll-margin'>,
    SupportedTokenProperties<'scroll-padding'>,
    SupportedTokenProperties<'scroll-snap-margin'>,
    SupportedTokenProperties<'scroll-timeline'>,
    SupportedTokenProperties<'text-decoration'>,
    SupportedTokenProperties<'text-emphasis'>,
    SupportedTokenProperties<'transition'>,
    SupportedTokenProperties<'view-timeline'>,
    SupportedTokenProperties<'accent-color'>,
    SupportedTokenProperties<'align-content'>,
    SupportedTokenProperties<'align-items'>,
    SupportedTokenProperties<'align-self'>,
    SupportedTokenProperties<'align-tracks'>,
    SupportedTokenProperties<'animation-composition'>,
    SupportedTokenProperties<'animation-delay'>,
    SupportedTokenProperties<'animation-direction'>,
    SupportedTokenProperties<'animation-duration'>,
    SupportedTokenProperties<'animation-fill-mode'>,
    SupportedTokenProperties<'animation-iteration-count'>,
    SupportedTokenProperties<'animation-name'>,
    SupportedTokenProperties<'animation-play-state'>,
    SupportedTokenProperties<'animation-range-end'>,
    SupportedTokenProperties<'animation-range-start'>,
    SupportedTokenProperties<'animation-timeline'>,
    SupportedTokenProperties<'animation-timing-function'>,
    SupportedTokenProperties<'appearance'>,
    SupportedTokenProperties<'aspect-ratio'>,
    SupportedTokenProperties<'backdrop-filter'>,
    SupportedTokenProperties<'backface-visibility'>,
    SupportedTokenProperties<'background-attachment'>,
    SupportedTokenProperties<'background-blend-mode'>,
    SupportedTokenProperties<'background-clip'>,
    SupportedTokenProperties<'background-color'>,
    SupportedTokenProperties<'background-image'>,
    SupportedTokenProperties<'background-origin'>,
    SupportedTokenProperties<'background-position-x'>,
    SupportedTokenProperties<'background-position-y'>,
    SupportedTokenProperties<'background-repeat'>,
    SupportedTokenProperties<'background-size'>,
    SupportedTokenProperties<'border-bottom-color'>,
    SupportedTokenProperties<'border-bottom-left-radius'>,
    SupportedTokenProperties<'border-bottom-right-radius'>,
    SupportedTokenProperties<'border-bottom-style'>,
    SupportedTokenProperties<'border-bottom-width'>,
    SupportedTokenProperties<'border-collapse'>,
    SupportedTokenProperties<'border-end-end-radius'>,
    SupportedTokenProperties<'border-end-start-radius'>,
    SupportedTokenProperties<'border-image-outset'>,
    SupportedTokenProperties<'border-image-repeat'>,
    SupportedTokenProperties<'border-image-slice'>,
    SupportedTokenProperties<'border-image-source'>,
    SupportedTokenProperties<'border-image-width'>,
    SupportedTokenProperties<'border-left-color'>,
    SupportedTokenProperties<'border-left-style'>,
    SupportedTokenProperties<'border-left-width'>,
    SupportedTokenProperties<'border-right-color'>,
    SupportedTokenProperties<'border-right-style'>,
    SupportedTokenProperties<'border-right-width'>,
    SupportedTokenProperties<'border-spacing'>,
    SupportedTokenProperties<'border-start-end-radius'>,
    SupportedTokenProperties<'border-start-start-radius'>,
    SupportedTokenProperties<'border-top-color'>,
    SupportedTokenProperties<'border-top-left-radius'>,
    SupportedTokenProperties<'border-top-right-radius'>,
    SupportedTokenProperties<'border-top-style'>,
    SupportedTokenProperties<'border-top-width'>,
    SupportedTokenProperties<'bottom'>,
    SupportedTokenProperties<'box-decoration-break'>,
    SupportedTokenProperties<'box-shadow'>,
    SupportedTokenProperties<'box-sizing'>,
    SupportedTokenProperties<'break-after'>,
    SupportedTokenProperties<'break-before'>,
    SupportedTokenProperties<'break-inside'>,
    SupportedTokenProperties<'caption-side'>,
    SupportedTokenProperties<'caret-color'>,
    SupportedTokenProperties<'caret-shape'>,
    SupportedTokenProperties<'clear'>,
    SupportedTokenProperties<'clip-path'>,
    SupportedTokenProperties<'color'>,
    SupportedTokenProperties<'color-adjust'>,
    SupportedTokenProperties<'color-scheme'>,
    SupportedTokenProperties<'column-count'>,
    SupportedTokenProperties<'column-fill'>,
    SupportedTokenProperties<'column-gap'>,
    SupportedTokenProperties<'column-rule-color'>,
    SupportedTokenProperties<'column-rule-style'>,
    SupportedTokenProperties<'column-rule-width'>,
    SupportedTokenProperties<'column-span'>,
    SupportedTokenProperties<'column-width'>,
    SupportedTokenProperties<'contain'>,
    SupportedTokenProperties<'contain-intrinsic-height'>,
    SupportedTokenProperties<'contain-intrinsic-width'>,
    SupportedTokenProperties<'container-name'>,
    SupportedTokenProperties<'container-type'>,
    SupportedTokenProperties<'content'>,
    SupportedTokenProperties<'content-visibility'>,
    SupportedTokenProperties<'counter-increment'>,
    SupportedTokenProperties<'counter-reset'>,
    SupportedTokenProperties<'counter-set'>,
    SupportedTokenProperties<'cursor'>,
    SupportedTokenProperties<'direction'>,
    SupportedTokenProperties<'display'>,
    SupportedTokenProperties<'empty-cells'>,
    SupportedTokenProperties<'filter'>,
    SupportedTokenProperties<'flex-basis'>,
    SupportedTokenProperties<'flex-direction'>,
    SupportedTokenProperties<'flex-grow'>,
    SupportedTokenProperties<'flex-shrink'>,
    SupportedTokenProperties<'flex-wrap'>,
    SupportedTokenProperties<'float'>,
    SupportedTokenProperties<'font-family'>,
    SupportedTokenProperties<'font-feature-settings'>,
    SupportedTokenProperties<'font-kerning'>,
    SupportedTokenProperties<'font-language-override'>,
    SupportedTokenProperties<'font-optical-sizing'>,
    SupportedTokenProperties<'font-palette'>,
    SupportedTokenProperties<'font-size'>,
    SupportedTokenProperties<'font-size-adjust'>,
    SupportedTokenProperties<'font-smooth'>,
    SupportedTokenProperties<'font-stretch'>,
    SupportedTokenProperties<'font-style'>,
    SupportedTokenProperties<'font-synthesis'>,
    SupportedTokenProperties<'font-synthesis-position'>,
    SupportedTokenProperties<'font-synthesis-small-caps'>,
    SupportedTokenProperties<'font-synthesis-style'>,
    SupportedTokenProperties<'font-synthesis-weight'>,
    SupportedTokenProperties<'font-variant'>,
    SupportedTokenProperties<'font-variant-alternates'>,
    SupportedTokenProperties<'font-variant-caps'>,
    SupportedTokenProperties<'font-variant-east-asian'>,
    SupportedTokenProperties<'font-variant-emoji'>,
    SupportedTokenProperties<'font-variant-ligatures'>,
    SupportedTokenProperties<'font-variant-numeric'>,
    SupportedTokenProperties<'font-variant-position'>,
    SupportedTokenProperties<'font-variation-settings'>,
    SupportedTokenProperties<'font-weight'>,
    SupportedTokenProperties<'forced-color-adjust'>,
    SupportedTokenProperties<'grid-auto-columns'>,
    SupportedTokenProperties<'grid-auto-flow'>,
    SupportedTokenProperties<'grid-auto-rows'>,
    SupportedTokenProperties<'grid-column-end'>,
    SupportedTokenProperties<'grid-column-start'>,
    SupportedTokenProperties<'grid-row-end'>,
    SupportedTokenProperties<'grid-row-start'>,
    SupportedTokenProperties<'grid-template-areas'>,
    SupportedTokenProperties<'grid-template-columns'>,
    SupportedTokenProperties<'grid-template-rows'>,
    SupportedTokenProperties<'hanging-punctuation'>,
    SupportedTokenProperties<'height'>,
    SupportedTokenProperties<'hyphenate-character'>,
    SupportedTokenProperties<'hyphenate-limit-chars'>,
    SupportedTokenProperties<'hyphens'>,
    SupportedTokenProperties<'image-orientation'>,
    SupportedTokenProperties<'image-rendering'>,
    SupportedTokenProperties<'image-resolution'>,
    SupportedTokenProperties<'initial-letter'>,
    SupportedTokenProperties<'input-security'>,
    SupportedTokenProperties<'isolation'>,
    SupportedTokenProperties<'justify-content'>,
    SupportedTokenProperties<'justify-items'>,
    SupportedTokenProperties<'justify-self'>,
    SupportedTokenProperties<'justify-tracks'>,
    SupportedTokenProperties<'left'>,
    SupportedTokenProperties<'letter-spacing'>,
    SupportedTokenProperties<'line-break'>,
    SupportedTokenProperties<'line-height'>,
    SupportedTokenProperties<'line-height-step'>,
    SupportedTokenProperties<'list-style-image'>,
    SupportedTokenProperties<'list-style-position'>,
    SupportedTokenProperties<'list-style-type'>,
    SupportedTokenProperties<'margin-bottom'>,
    SupportedTokenProperties<'margin-left'>,
    SupportedTokenProperties<'margin-right'>,
    SupportedTokenProperties<'margin-top'>,
    SupportedTokenProperties<'margin-trim'>,
    SupportedTokenProperties<'mask-border-mode'>,
    SupportedTokenProperties<'mask-border-outset'>,
    SupportedTokenProperties<'mask-border-repeat'>,
    SupportedTokenProperties<'mask-border-slice'>,
    SupportedTokenProperties<'mask-border-source'>,
    SupportedTokenProperties<'mask-border-width'>,
    SupportedTokenProperties<'mask-clip'>,
    SupportedTokenProperties<'mask-composite'>,
    SupportedTokenProperties<'mask-image'>,
    SupportedTokenProperties<'mask-mode'>,
    SupportedTokenProperties<'mask-origin'>,
    SupportedTokenProperties<'mask-position'>,
    SupportedTokenProperties<'mask-repeat'>,
    SupportedTokenProperties<'mask-size'>,
    SupportedTokenProperties<'mask-type'>,
    SupportedTokenProperties<'masonry-auto-flow'>,
    SupportedTokenProperties<'math-depth'>,
    SupportedTokenProperties<'math-shift'>,
    SupportedTokenProperties<'math-style'>,
    SupportedTokenProperties<'max-height'>,
    SupportedTokenProperties<'max-lines'>,
    SupportedTokenProperties<'max-width'>,
    SupportedTokenProperties<'min-height'>,
    SupportedTokenProperties<'min-width'>,
    SupportedTokenProperties<'mix-blend-mode'>,
    SupportedTokenProperties<'motion-distance'>,
    SupportedTokenProperties<'motion-path'>,
    SupportedTokenProperties<'motion-rotation'>,
    SupportedTokenProperties<'object-fit'>,
    SupportedTokenProperties<'object-position'>,
    SupportedTokenProperties<'offset-anchor'>,
    SupportedTokenProperties<'offset-distance'>,
    SupportedTokenProperties<'offset-path'>,
    SupportedTokenProperties<'offset-position'>,
    SupportedTokenProperties<'offset-rotate'>,
    SupportedTokenProperties<'offset-rotation'>,
    SupportedTokenProperties<'opacity'>,
    SupportedTokenProperties<'order'>,
    SupportedTokenProperties<'orphans'>,
    SupportedTokenProperties<'outline-color'>,
    SupportedTokenProperties<'outline-offset'>,
    SupportedTokenProperties<'outline-style'>,
    SupportedTokenProperties<'outline-width'>,
    SupportedTokenProperties<'overflow-anchor'>,
    SupportedTokenProperties<'overflow-clip-box'>,
    SupportedTokenProperties<'overflow-clip-margin'>,
    SupportedTokenProperties<'overflow-wrap'>,
    SupportedTokenProperties<'overflow-x'>,
    SupportedTokenProperties<'overflow-y'>,
    SupportedTokenProperties<'overlay'>,
    SupportedTokenProperties<'overscroll-behavior-x'>,
    SupportedTokenProperties<'overscroll-behavior-y'>,
    SupportedTokenProperties<'padding-bottom'>,
    SupportedTokenProperties<'padding-left'>,
    SupportedTokenProperties<'padding-right'>,
    SupportedTokenProperties<'padding-top'>,
    SupportedTokenProperties<'page'>,
    SupportedTokenProperties<'page-break-after'>,
    SupportedTokenProperties<'page-break-before'>,
    SupportedTokenProperties<'page-break-inside'>,
    SupportedTokenProperties<'paint-order'>,
    SupportedTokenProperties<'perspective'>,
    SupportedTokenProperties<'perspective-origin'>,
    SupportedTokenProperties<'pointer-events'>,
    SupportedTokenProperties<'position'>,
    SupportedTokenProperties<'print-color-adjust'>,
    SupportedTokenProperties<'quotes'>,
    SupportedTokenProperties<'resize'>,
    SupportedTokenProperties<'right'>,
    SupportedTokenProperties<'rotate'>,
    SupportedTokenProperties<'row-gap'>,
    SupportedTokenProperties<'ruby-align'>,
    SupportedTokenProperties<'ruby-merge'>,
    SupportedTokenProperties<'ruby-position'>,
    SupportedTokenProperties<'scale'>,
    SupportedTokenProperties<'scroll-behavior'>,
    SupportedTokenProperties<'scroll-margin-bottom'>,
    SupportedTokenProperties<'scroll-margin-left'>,
    SupportedTokenProperties<'scroll-margin-right'>,
    SupportedTokenProperties<'scroll-margin-top'>,
    SupportedTokenProperties<'scroll-padding-bottom'>,
    SupportedTokenProperties<'scroll-padding-left'>,
    SupportedTokenProperties<'scroll-padding-right'>,
    SupportedTokenProperties<'scroll-padding-top'>,
    SupportedTokenProperties<'scroll-snap-align'>,
    SupportedTokenProperties<'scroll-snap-margin-bottom'>,
    SupportedTokenProperties<'scroll-snap-margin-left'>,
    SupportedTokenProperties<'scroll-snap-margin-right'>,
    SupportedTokenProperties<'scroll-snap-margin-top'>,
    SupportedTokenProperties<'scroll-snap-stop'>,
    SupportedTokenProperties<'scroll-snap-type'>,
    SupportedTokenProperties<'scroll-timeline-axis'>,
    SupportedTokenProperties<'scroll-timeline-name'>,
    SupportedTokenProperties<'scrollbar-color'>,
    SupportedTokenProperties<'scrollbar-gutter'>,
    SupportedTokenProperties<'scrollbar-width'>,
    SupportedTokenProperties<'shape-image-threshold'>,
    SupportedTokenProperties<'shape-margin'>,
    SupportedTokenProperties<'shape-outside'>,
    SupportedTokenProperties<'tab-size'>,
    SupportedTokenProperties<'table-layout'>,
    SupportedTokenProperties<'text-align'>,
    SupportedTokenProperties<'text-align-last'>,
    SupportedTokenProperties<'text-combine-upright'>,
    SupportedTokenProperties<'text-decoration-color'>,
    SupportedTokenProperties<'text-decoration-line'>,
    SupportedTokenProperties<'text-decoration-skip'>,
    SupportedTokenProperties<'text-decoration-skip-ink'>,
    SupportedTokenProperties<'text-decoration-style'>,
    SupportedTokenProperties<'text-decoration-thickness'>,
    SupportedTokenProperties<'text-emphasis-color'>,
    SupportedTokenProperties<'text-emphasis-position'>,
    SupportedTokenProperties<'text-emphasis-style'>,
    SupportedTokenProperties<'text-indent'>,
    SupportedTokenProperties<'text-justify'>,
    SupportedTokenProperties<'text-orientation'>,
    SupportedTokenProperties<'text-overflow'>,
    SupportedTokenProperties<'text-rendering'>,
    SupportedTokenProperties<'text-shadow'>,
    SupportedTokenProperties<'text-size-adjust'>,
    SupportedTokenProperties<'text-transform'>,
    SupportedTokenProperties<'text-underline-offset'>,
    SupportedTokenProperties<'text-underline-position'>,
    SupportedTokenProperties<'text-wrap'>,
    SupportedTokenProperties<'timeline-scope'>,
    SupportedTokenProperties<'top'>,
    SupportedTokenProperties<'touch-action'>,
    SupportedTokenProperties<'transform'>,
    SupportedTokenProperties<'transform-box'>,
    SupportedTokenProperties<'transform-origin'>,
    SupportedTokenProperties<'transform-style'>,
    SupportedTokenProperties<'transition-behavior'>,
    SupportedTokenProperties<'transition-delay'>,
    SupportedTokenProperties<'transition-duration'>,
    SupportedTokenProperties<'transition-property'>,
    SupportedTokenProperties<'transition-timing-function'>,
    SupportedTokenProperties<'translate'>,
    SupportedTokenProperties<'unicode-bidi'>,
    SupportedTokenProperties<'user-select'>,
    SupportedTokenProperties<'vertical-align'>,
    SupportedTokenProperties<'view-timeline-axis'>,
    SupportedTokenProperties<'view-timeline-inset'>,
    SupportedTokenProperties<'view-timeline-name'>,
    SupportedTokenProperties<'view-transition-name'>,
    SupportedTokenProperties<'visibility'>,
    SupportedTokenProperties<'white-space'>,
    SupportedTokenProperties<'white-space-collapse'>,
    SupportedTokenProperties<'white-space-trim'>,
    SupportedTokenProperties<'widows'>,
    SupportedTokenProperties<'width'>,
    SupportedTokenProperties<'will-change'>,
    SupportedTokenProperties<'word-break'>,
    SupportedTokenProperties<'word-spacing'>,
    SupportedTokenProperties<'word-wrap'>,
    SupportedTokenProperties<'writing-mode'>,
    SupportedTokenProperties<'z-index'>,
    SupportedTokenProperties<'zoom'>,
    SupportedTokenProperties<'alignment-baseline'>,
    SupportedTokenProperties<'baseline-shift'>,
    SupportedTokenProperties<'clip'>,
    SupportedTokenProperties<'clip-rule'>,
    SupportedTokenProperties<'color-interpolation'>,
    SupportedTokenProperties<'color-rendering'>,
    SupportedTokenProperties<'dominant-baseline'>,
    SupportedTokenProperties<'fill'>,
    SupportedTokenProperties<'fill-opacity'>,
    SupportedTokenProperties<'fill-rule'>,
    SupportedTokenProperties<'flood-color'>,
    SupportedTokenProperties<'flood-opacity'>,
    SupportedTokenProperties<'glyph-orientation-vertical'>,
    SupportedTokenProperties<'lighting-color'>,
    SupportedTokenProperties<'marker'>,
    SupportedTokenProperties<'marker-end'>,
    SupportedTokenProperties<'marker-mid'>,
    SupportedTokenProperties<'marker-start'>,
    SupportedTokenProperties<'shape-rendering'>,
    SupportedTokenProperties<'stop-color'>,
    SupportedTokenProperties<'stop-opacity'>,
    SupportedTokenProperties<'stroke'>,
    SupportedTokenProperties<'stroke-dasharray'>,
    SupportedTokenProperties<'stroke-dashoffset'>,
    SupportedTokenProperties<'stroke-linecap'>,
    SupportedTokenProperties<'stroke-linejoin'>,
    SupportedTokenProperties<'stroke-miterlimit'>,
    SupportedTokenProperties<'stroke-opacity'>,
    SupportedTokenProperties<'stroke-width'>,
    SupportedTokenProperties<'text-anchor'>,
    SupportedTokenProperties<'vector-effect'>,
    SupportedTokenProperties<'block-overflow'>,
    SupportedTokenProperties<'block-size'>,
    SupportedTokenProperties<'border-block'>,
    SupportedTokenProperties<'border-block-end'>,
    SupportedTokenProperties<'border-block-start'>,
    SupportedTokenProperties<'border-block-color'>,
    SupportedTokenProperties<'border-block-end-color'>,
    SupportedTokenProperties<'border-block-end-style'>,
    SupportedTokenProperties<'border-block-end-width'>,
    SupportedTokenProperties<'border-block-start-color'>,
    SupportedTokenProperties<'border-block-start-style'>,
    SupportedTokenProperties<'border-block-start-width'>,
    SupportedTokenProperties<'border-block-style'>,
    SupportedTokenProperties<'border-block-width'>,
    SupportedTokenProperties<'border-inline'>,
    SupportedTokenProperties<'border-inline-end'>,
    SupportedTokenProperties<'border-inline-start'>,
    SupportedTokenProperties<'border-inline-color'>,
    SupportedTokenProperties<'border-inline-end-color'>,
    SupportedTokenProperties<'border-inline-end-style'>,
    SupportedTokenProperties<'border-inline-end-width'>,
    SupportedTokenProperties<'border-inline-start-color'>,
    SupportedTokenProperties<'border-inline-start-style'>,
    SupportedTokenProperties<'border-inline-start-width'>,
    SupportedTokenProperties<'border-inline-style'>,
    SupportedTokenProperties<'border-inline-width'>,
    SupportedTokenProperties<'contain-intrinsic-block-size'>,
    SupportedTokenProperties<'contain-intrinsic-inline-size'>,
    SupportedTokenProperties<'inline-size'>,
    SupportedTokenProperties<'inset-block'>,
    SupportedTokenProperties<'inset-block-end'>,
    SupportedTokenProperties<'inset-block-start'>,
    SupportedTokenProperties<'inset-inline'>,
    SupportedTokenProperties<'inset-inline-end'>,
    SupportedTokenProperties<'inset-inline-start'>,
    SupportedTokenProperties<'margin-block'>,
    SupportedTokenProperties<'margin-block-end'>,
    SupportedTokenProperties<'margin-block-start'>,
    SupportedTokenProperties<'margin-inline'>,
    SupportedTokenProperties<'margin-inline-end'>,
    SupportedTokenProperties<'margin-inline-start'>,
    SupportedTokenProperties<'max-block-size'>,
    SupportedTokenProperties<'max-inline-size'>,
    SupportedTokenProperties<'min-block-size'>,
    SupportedTokenProperties<'min-inline-size'>,
    SupportedTokenProperties<'overflow-block'>,
    SupportedTokenProperties<'overflow-inline'>,
    SupportedTokenProperties<'overscroll-behavior-block'>,
    SupportedTokenProperties<'overscroll-behavior-inline'>,
    SupportedTokenProperties<'padding-block'>,
    SupportedTokenProperties<'padding-block-end'>,
    SupportedTokenProperties<'padding-block-start'>,
    SupportedTokenProperties<'padding-inline'>,
    SupportedTokenProperties<'padding-inline-end'>,
    SupportedTokenProperties<'padding-inline-start'>,
    SupportedTokenProperties<'scroll-margin-block'>,
    SupportedTokenProperties<'scroll-margin-block-end'>,
    SupportedTokenProperties<'scroll-margin-block-start'>,
    SupportedTokenProperties<'scroll-margin-inline'>,
    SupportedTokenProperties<'scroll-margin-inline-end'>,
    SupportedTokenProperties<'scroll-margin-inline-start'>,
    SupportedTokenProperties<'scroll-padding-block'>,
    SupportedTokenProperties<'scroll-padding-block-end'>,
    SupportedTokenProperties<'scroll-padding-block-start'>,
    SupportedTokenProperties<'scroll-padding-inline'>,
    SupportedTokenProperties<'scroll-padding-inline-end'>,
    SupportedTokenProperties<'scroll-padding-inline-start'> {
  __tokenami__?: true;
  [customProperty: `---${string}`]: any;
}

type TokenamiPropertiesPick<P extends keyof SupportedTokenPropertiesMap> = Pick<
  SupportedTokenPropertiesMap,
  P
> extends infer T
  ? T[keyof T]
  : never;

type TokenamiPropertiesOmit<P extends keyof SupportedTokenPropertiesMap> = Omit<
  SupportedTokenPropertiesMap,
  P
> extends infer T
  ? T[keyof T]
  : never;

export type {
  TokenamiConfig,
  TokenamiFinalConfig,
  TokenamiProperties,
  TokenamiPropertiesPick,
  TokenamiPropertiesOmit,
  TokenProperties,
  TokenValue,
};
