import type * as CSS from 'csstype';
import type * as ConfigUtils from '@tokenami/config';

type Merge<A, B> = Omit<A, keyof B> & B;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// consumer will override this interface
interface TokenamiConfig {}
interface TokenamiFinalConfig extends Merge<ConfigUtils.DefaultConfig, TokenamiConfig> {}

type PropertyConfig = NonNullable<TokenamiFinalConfig['properties']>;
type ResponsiveConfig = NonNullable<TokenamiFinalConfig['responsive']>;
type AliasesConfig = NonNullable<TokenamiFinalConfig['aliases']>;
type ThemeConfig = NonNullable<TokenamiFinalConfig['theme']>;
type ResponsiveKey = Extract<keyof ResponsiveConfig, string>;
type AliasKey = Extract<keyof AliasesConfig, string>;

type Style<P extends string, V> = { [key in ConfigUtils.TokenProperty<P>]?: V };

type VariantStyle<P extends string, V = Value<P>> = Style<P, V> &
  Style<`${ResponsiveKey}_${P}`, V> &
  Style<`${string}_${P}`, V>;

type ThemeKey<P> = P extends keyof PropertyConfig
  ? Exclude<NonNullable<PropertyConfig[P]>[number], 'grid'>
  : never;

type ThemeValue<TK> = TK extends keyof ThemeConfig ? keyof ThemeConfig[TK] : never;

type TokenValue<P> = ThemeKey<P> extends infer TK
  ? TK extends string
    ? ThemeValue<TK> extends infer TV
      ? TV extends string
        ? ConfigUtils.TokenValue<TK, TV>
        : never
      : never
    : never
  : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;

type Value<P> = P extends keyof PropertyConfig
  ? PropertyConfig[P][number] extends infer ThemeKey
    ? ThemeKey extends 'grid'
      ? TokenValue<P> | ConfigUtils.ArbitraryValue | ConfigUtils.GridValue
      : TokenValue<P> | ConfigUtils.ArbitraryValue
    : never
  : CSSPropertyValue<P>;

type TokenamiBaseStyles = VariantStyle<'-webkit-line-clamp'> &
  VariantStyle<'accent-color'> &
  VariantStyle<'align-tracks'> &
  VariantStyle<'all'> &
  VariantStyle<'animation'> &
  VariantStyle<'animation-composition'> &
  VariantStyle<'animation-delay'> &
  VariantStyle<'animation-direction'> &
  VariantStyle<'animation-duration'> &
  VariantStyle<'animation-fill-mode'> &
  VariantStyle<'animation-iteration-count'> &
  VariantStyle<'animation-name'> &
  VariantStyle<'animation-play-state'> &
  VariantStyle<'animation-timeline'> &
  VariantStyle<'animation-timing-function'> &
  VariantStyle<'appearance'> &
  VariantStyle<'aspect-ratio'> &
  VariantStyle<'backdrop-filter'> &
  VariantStyle<'backface-visibility'> &
  VariantStyle<'background'> &
  VariantStyle<'background-attachment'> &
  VariantStyle<'background-blend-mode'> &
  VariantStyle<'background-clip'> &
  VariantStyle<'background-color'> &
  VariantStyle<'background-image'> &
  VariantStyle<'background-origin'> &
  VariantStyle<'background-position'> &
  VariantStyle<'background-position-x'> &
  VariantStyle<'background-position-y'> &
  VariantStyle<'background-repeat'> &
  VariantStyle<'background-size'> &
  VariantStyle<'block-overflow'> &
  VariantStyle<'block-size'> &
  VariantStyle<'border'> &
  VariantStyle<'border-style'> &
  VariantStyle<'border-color'> &
  VariantStyle<'border-width'> &
  VariantStyle<'border-top'> &
  VariantStyle<'border-top-color'> &
  VariantStyle<'border-top-style'> &
  VariantStyle<'border-top-width'> &
  VariantStyle<'border-right'> &
  VariantStyle<'border-right-color'> &
  VariantStyle<'border-right-style'> &
  VariantStyle<'border-right-width'> &
  VariantStyle<'border-bottom'> &
  VariantStyle<'border-bottom-color'> &
  VariantStyle<'border-bottom-style'> &
  VariantStyle<'border-bottom-width'> &
  VariantStyle<'border-left'> &
  VariantStyle<'border-left-color'> &
  VariantStyle<'border-left-style'> &
  VariantStyle<'border-left-width'> &
  VariantStyle<'border-block'> &
  VariantStyle<'border-block-width'> &
  VariantStyle<'border-block-style'> &
  VariantStyle<'border-block-color'> &
  VariantStyle<'border-block-start'> &
  VariantStyle<'border-block-end'> &
  VariantStyle<'border-block-start-color'> &
  VariantStyle<'border-block-start-style'> &
  VariantStyle<'border-block-start-width'> &
  VariantStyle<'border-block-end-color'> &
  VariantStyle<'border-block-end-style'> &
  VariantStyle<'border-block-end-width'> &
  VariantStyle<'border-image'> &
  VariantStyle<'border-image-outset'> &
  VariantStyle<'border-image-repeat'> &
  VariantStyle<'border-image-slice'> &
  VariantStyle<'border-image-source'> &
  VariantStyle<'border-image-width'> &
  VariantStyle<'border-inline'> &
  VariantStyle<'border-inline-color'> &
  VariantStyle<'border-inline-style'> &
  VariantStyle<'border-inline-width'> &
  VariantStyle<'border-inline-start'> &
  VariantStyle<'border-inline-end'> &
  VariantStyle<'border-inline-start-color'> &
  VariantStyle<'border-inline-start-style'> &
  VariantStyle<'border-inline-start-width'> &
  VariantStyle<'border-inline-end-color'> &
  VariantStyle<'border-inline-end-style'> &
  VariantStyle<'border-inline-end-width'> &
  VariantStyle<'border-radius'> &
  VariantStyle<'border-top-left-radius'> &
  VariantStyle<'border-top-right-radius'> &
  VariantStyle<'border-bottom-left-radius'> &
  VariantStyle<'border-bottom-right-radius'> &
  VariantStyle<'border-start-end-radius'> &
  VariantStyle<'border-start-start-radius'> &
  VariantStyle<'border-end-end-radius'> &
  VariantStyle<'border-end-start-radius'> &
  VariantStyle<'border-collapse'> &
  VariantStyle<'border-spacing'> &
  VariantStyle<'box-decoration-break'> &
  VariantStyle<'box-shadow'> &
  VariantStyle<'box-sizing'> &
  VariantStyle<'break-after'> &
  VariantStyle<'break-before'> &
  VariantStyle<'break-inside'> &
  VariantStyle<'caption-side'> &
  VariantStyle<'caret'> &
  VariantStyle<'caret-color'> &
  VariantStyle<'caret-shape'> &
  VariantStyle<'clear'> &
  VariantStyle<'clip'> &
  VariantStyle<'clip-path'> &
  VariantStyle<'color'> &
  VariantStyle<'color-scheme'> &
  VariantStyle<'column-fill'> &
  VariantStyle<'column-span'> &
  VariantStyle<'column-rule'> &
  VariantStyle<'column-rule-color'> &
  VariantStyle<'column-rule-style'> &
  VariantStyle<'column-rule-width'> &
  VariantStyle<'columns'> &
  VariantStyle<'column-count'> &
  VariantStyle<'column-width'> &
  VariantStyle<'contain'> &
  VariantStyle<'contain-intrinsic-block-size'> &
  VariantStyle<'contain-intrinsic-height'> &
  VariantStyle<'contain-intrinsic-inline-size'> &
  VariantStyle<'contain-intrinsic-size'> &
  VariantStyle<'contain-intrinsic-width'> &
  VariantStyle<'container'> &
  VariantStyle<'container-name'> &
  VariantStyle<'container-type'> &
  VariantStyle<'content'> &
  VariantStyle<'content-visibility'> &
  VariantStyle<'counter-increment'> &
  VariantStyle<'counter-reset'> &
  VariantStyle<'counter-set'> &
  VariantStyle<'cursor'> &
  VariantStyle<'direction'> &
  VariantStyle<'display'> &
  VariantStyle<'empty-cells'> &
  VariantStyle<'filter'> &
  VariantStyle<'flex'> &
  VariantStyle<'flex-basis'> &
  VariantStyle<'flex-direction'> &
  VariantStyle<'flex-flow'> &
  VariantStyle<'flex-grow'> &
  VariantStyle<'flex-shrink'> &
  VariantStyle<'flex-wrap'> &
  VariantStyle<'float'> &
  VariantStyle<'font'> &
  VariantStyle<'font-family'> &
  VariantStyle<'font-feature-settings'> &
  VariantStyle<'font-kerning'> &
  VariantStyle<'font-language-override'> &
  VariantStyle<'font-optical-sizing'> &
  VariantStyle<'font-palette'> &
  VariantStyle<'font-size'> &
  VariantStyle<'font-size-adjust'> &
  VariantStyle<'font-stretch'> &
  VariantStyle<'font-style'> &
  VariantStyle<'font-synthesis'> &
  VariantStyle<'font-variant'> &
  VariantStyle<'font-variant-alternates'> &
  VariantStyle<'font-variant-caps'> &
  VariantStyle<'font-variant-east-asian'> &
  VariantStyle<'font-variant-emoji'> &
  VariantStyle<'font-variant-ligatures'> &
  VariantStyle<'font-variant-numeric'> &
  VariantStyle<'font-variant-position'> &
  VariantStyle<'font-variation-settings'> &
  VariantStyle<'font-weight'> &
  VariantStyle<'forced-color-adjust'> &
  VariantStyle<'gap'> &
  VariantStyle<'row-gap'> &
  VariantStyle<'column-gap'> &
  VariantStyle<'grid'> &
  VariantStyle<'grid-area'> &
  VariantStyle<'grid-auto-rows'> &
  VariantStyle<'grid-auto-columns'> &
  VariantStyle<'grid-auto-flow'> &
  VariantStyle<'grid-column'> &
  VariantStyle<'grid-column-end'> &
  VariantStyle<'grid-column-start'> &
  VariantStyle<'grid-row'> &
  VariantStyle<'grid-row-end'> &
  VariantStyle<'grid-row-start'> &
  VariantStyle<'grid-template'> &
  VariantStyle<'grid-template-rows'> &
  VariantStyle<'grid-template-columns'> &
  VariantStyle<'grid-template-areas'> &
  VariantStyle<'hanging-punctuation'> &
  VariantStyle<'height'> &
  VariantStyle<'hyphenate-character'> &
  VariantStyle<'hyphenate-limit-chars'> &
  VariantStyle<'hyphens'> &
  VariantStyle<'image-orientation'> &
  VariantStyle<'image-rendering'> &
  VariantStyle<'image-resolution'> &
  VariantStyle<'initial-letter'> &
  VariantStyle<'inline-size'> &
  VariantStyle<'input-security'> &
  VariantStyle<'inset'> &
  VariantStyle<'top'> &
  VariantStyle<'right'> &
  VariantStyle<'bottom'> &
  VariantStyle<'left'> &
  VariantStyle<'inset-block'> &
  VariantStyle<'inset-block-end'> &
  VariantStyle<'inset-block-start'> &
  VariantStyle<'inset-inline'> &
  VariantStyle<'inset-inline-end'> &
  VariantStyle<'inset-inline-start'> &
  VariantStyle<'isolation'> &
  VariantStyle<'justify-tracks'> &
  VariantStyle<'letter-spacing'> &
  VariantStyle<'line-break'> &
  VariantStyle<'line-clamp'> &
  VariantStyle<'line-height'> &
  VariantStyle<'line-height-step'> &
  VariantStyle<'list-style'> &
  VariantStyle<'list-style-image'> &
  VariantStyle<'list-style-position'> &
  VariantStyle<'list-style-type'> &
  VariantStyle<'margin'> &
  VariantStyle<'margin-top'> &
  VariantStyle<'margin-right'> &
  VariantStyle<'margin-bottom'> &
  VariantStyle<'margin-left'> &
  VariantStyle<'margin-block'> &
  VariantStyle<'margin-block-end'> &
  VariantStyle<'margin-block-start'> &
  VariantStyle<'margin-inline'> &
  VariantStyle<'margin-inline-end'> &
  VariantStyle<'margin-inline-start'> &
  VariantStyle<'margin-trim'> &
  VariantStyle<'mask'> &
  VariantStyle<'mask-border'> &
  VariantStyle<'mask-border-mode'> &
  VariantStyle<'mask-border-outset'> &
  VariantStyle<'mask-border-repeat'> &
  VariantStyle<'mask-border-slice'> &
  VariantStyle<'mask-border-source'> &
  VariantStyle<'mask-border-width'> &
  VariantStyle<'mask-clip'> &
  VariantStyle<'mask-composite'> &
  VariantStyle<'mask-image'> &
  VariantStyle<'mask-mode'> &
  VariantStyle<'mask-origin'> &
  VariantStyle<'mask-position'> &
  VariantStyle<'mask-repeat'> &
  VariantStyle<'mask-size'> &
  VariantStyle<'mask-type'> &
  VariantStyle<'math-depth'> &
  VariantStyle<'math-shift'> &
  VariantStyle<'math-style'> &
  VariantStyle<'max-block-size'> &
  VariantStyle<'max-height'> &
  VariantStyle<'max-inline-size'> &
  VariantStyle<'max-lines'> &
  VariantStyle<'max-width'> &
  VariantStyle<'min-block-size'> &
  VariantStyle<'min-height'> &
  VariantStyle<'min-inline-size'> &
  VariantStyle<'min-width'> &
  VariantStyle<'mix-blend-mode'> &
  VariantStyle<'object-fit'> &
  VariantStyle<'object-position'> &
  VariantStyle<'offset'> &
  VariantStyle<'offset-anchor'> &
  VariantStyle<'offset-distance'> &
  VariantStyle<'offset-path'> &
  VariantStyle<'offset-position'> &
  VariantStyle<'offset-rotate'> &
  VariantStyle<'opacity'> &
  VariantStyle<'order'> &
  VariantStyle<'orphans'> &
  VariantStyle<'outline'> &
  VariantStyle<'outline-color'> &
  VariantStyle<'outline-offset'> &
  VariantStyle<'outline-style'> &
  VariantStyle<'outline-width'> &
  VariantStyle<'overflow'> &
  VariantStyle<'overflow-anchor'> &
  VariantStyle<'overflow-block'> &
  VariantStyle<'overflow-clip-margin'> &
  VariantStyle<'overflow-inline'> &
  VariantStyle<'overflow-wrap'> &
  VariantStyle<'overflow-x'> &
  VariantStyle<'overflow-y'> &
  VariantStyle<'overscroll-behavior'> &
  VariantStyle<'overscroll-behavior-block'> &
  VariantStyle<'overscroll-behavior-inline'> &
  VariantStyle<'overscroll-behavior-x'> &
  VariantStyle<'overscroll-behavior-y'> &
  VariantStyle<'padding'> &
  VariantStyle<'padding-top'> &
  VariantStyle<'padding-right'> &
  VariantStyle<'padding-bottom'> &
  VariantStyle<'padding-left'> &
  VariantStyle<'padding-block'> &
  VariantStyle<'padding-block-end'> &
  VariantStyle<'padding-block-start'> &
  VariantStyle<'padding-inline'> &
  VariantStyle<'padding-inline-end'> &
  VariantStyle<'padding-inline-start'> &
  VariantStyle<'page'> &
  VariantStyle<'page-break-after'> &
  VariantStyle<'page-break-before'> &
  VariantStyle<'page-break-inside'> &
  VariantStyle<'paint-order'> &
  VariantStyle<'perspective'> &
  VariantStyle<'perspective-origin'> &
  VariantStyle<'place-content'> &
  VariantStyle<'align-content'> &
  VariantStyle<'justify-content'> &
  VariantStyle<'place-items'> &
  VariantStyle<'align-items'> &
  VariantStyle<'justify-items'> &
  VariantStyle<'place-self'> &
  VariantStyle<'align-self'> &
  VariantStyle<'justify-self'> &
  VariantStyle<'pointer-events'> &
  VariantStyle<'position'> &
  VariantStyle<'print-color-adjust'> &
  VariantStyle<'quotes'> &
  VariantStyle<'resize'> &
  VariantStyle<'rotate'> &
  VariantStyle<'ruby-align'> &
  VariantStyle<'ruby-merge'> &
  VariantStyle<'ruby-position'> &
  VariantStyle<'scale'> &
  VariantStyle<'scroll-behavior'> &
  VariantStyle<'scroll-margin'> &
  VariantStyle<'scroll-margin-top'> &
  VariantStyle<'scroll-margin-right'> &
  VariantStyle<'scroll-margin-bottom'> &
  VariantStyle<'scroll-margin-left'> &
  VariantStyle<'scroll-margin-block'> &
  VariantStyle<'scroll-margin-block-end'> &
  VariantStyle<'scroll-margin-block-start'> &
  VariantStyle<'scroll-margin-inline'> &
  VariantStyle<'scroll-margin-inline-end'> &
  VariantStyle<'scroll-margin-inline-start'> &
  VariantStyle<'scroll-padding'> &
  VariantStyle<'scroll-padding-top'> &
  VariantStyle<'scroll-padding-right'> &
  VariantStyle<'scroll-padding-bottom'> &
  VariantStyle<'scroll-padding-left'> &
  VariantStyle<'scroll-padding-block'> &
  VariantStyle<'scroll-padding-block-end'> &
  VariantStyle<'scroll-padding-block-start'> &
  VariantStyle<'scroll-padding-inline'> &
  VariantStyle<'scroll-padding-inline-end'> &
  VariantStyle<'scroll-padding-inline-start'> &
  VariantStyle<'scroll-snap-align'> &
  VariantStyle<'scroll-snap-stop'> &
  VariantStyle<'scroll-snap-type'> &
  VariantStyle<'scroll-timeline'> &
  VariantStyle<'scroll-timeline-axis'> &
  VariantStyle<'scroll-timeline-name'> &
  VariantStyle<'scrollbar-color'> &
  VariantStyle<'scrollbar-gutter'> &
  VariantStyle<'scrollbar-width'> &
  VariantStyle<'shape-image-threshold'> &
  VariantStyle<'shape-margin'> &
  VariantStyle<'shape-outside'> &
  VariantStyle<'tab-size'> &
  VariantStyle<'table-layout'> &
  VariantStyle<'text-align'> &
  VariantStyle<'text-align-last'> &
  VariantStyle<'text-combine-upright'> &
  VariantStyle<'text-decoration'> &
  VariantStyle<'text-decoration-color'> &
  VariantStyle<'text-decoration-line'> &
  VariantStyle<'text-decoration-style'> &
  VariantStyle<'text-decoration-thickness'> &
  VariantStyle<'text-decoration-skip-ink'> &
  VariantStyle<'text-emphasis'> &
  VariantStyle<'text-emphasis-color'> &
  VariantStyle<'text-emphasis-position'> &
  VariantStyle<'text-emphasis-style'> &
  VariantStyle<'text-indent'> &
  VariantStyle<'text-justify'> &
  VariantStyle<'text-orientation'> &
  VariantStyle<'text-overflow'> &
  VariantStyle<'text-rendering'> &
  VariantStyle<'text-shadow'> &
  VariantStyle<'text-size-adjust'> &
  VariantStyle<'text-transform'> &
  VariantStyle<'text-underline-offset'> &
  VariantStyle<'text-underline-position'> &
  VariantStyle<'touch-action'> &
  VariantStyle<'transform'> &
  VariantStyle<'transform-box'> &
  VariantStyle<'transform-origin'> &
  VariantStyle<'transform-style'> &
  VariantStyle<'transition'> &
  VariantStyle<'transition-delay'> &
  VariantStyle<'transition-duration'> &
  VariantStyle<'transition-property'> &
  VariantStyle<'transition-timing-function'> &
  VariantStyle<'translate'> &
  VariantStyle<'unicode-bidi'> &
  VariantStyle<'user-select'> &
  VariantStyle<'vertical-align'> &
  VariantStyle<'view-transition-name'> &
  VariantStyle<'visibility'> &
  VariantStyle<'white-space'> &
  VariantStyle<'widows'> &
  VariantStyle<'width'> &
  VariantStyle<'will-change'> &
  VariantStyle<'word-break'> &
  VariantStyle<'word-spacing'> &
  VariantStyle<'word-wrap'> &
  VariantStyle<'writing-mode'> &
  VariantStyle<'z-index'> &
  VariantStyle<'zoom'>;

type TokenamiAliasStyles = {
  [K in AliasKey]: AliasesConfig[K][number] extends infer L
    ? L extends ConfigUtils.CSSProperty
      ? VariantStyle<K, TokenamiBaseStyles[ConfigUtils.TokenProperty<L>]>
      : never
    : never;
}[AliasKey];

interface TokenamiStyles extends TokenamiBaseStyles, UnionToIntersection<TokenamiAliasStyles> {}

export type { TokenamiConfig, TokenamiFinalConfig, TokenamiStyles, ResponsiveKey };
