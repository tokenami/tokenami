import type * as CSS from 'csstype';
import type * as Tokenami from '@tokenami/config';

type Merge<A, B> = Omit<A, keyof B> & B;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// consumer will override this interface
interface TokenamiConfig {}
interface TokenamiFinalConfig extends Merge<Tokenami.DefaultConfig, TokenamiConfig> {}

type PropertyConfig = NonNullable<TokenamiFinalConfig['properties']>;
type ResponsiveConfig = NonNullable<TokenamiFinalConfig['responsive']>;
type AliasesConfig = NonNullable<TokenamiFinalConfig['aliases']>;
type ThemeConfig = NonNullable<TokenamiFinalConfig['theme']>;
type ResponsiveKey = Extract<keyof ResponsiveConfig, string>;
type AliasKey = Extract<keyof AliasesConfig, string>;

type Style<P extends string, V> = { [key in Tokenami.TokenProperty<P>]?: V };
type TokenamiStyle<P extends string, V = Value<P>> = Style<P, V> &
  Style<`${ResponsiveKey}_${P}`, V> &
  Style<`${string}_${P}`, V>;

type ThemeKey<P> = P extends keyof PropertyConfig
  ? Exclude<NonNullable<PropertyConfig[P]>[number], 'grid'>
  : never;

type ThemeValue<TK> = TK extends keyof ThemeConfig ? keyof ThemeConfig[TK] : never;

type TokenValue<P> = ThemeKey<P> extends `${infer TK}`
  ? ThemeValue<TK> extends `${infer TV}`
    ? Tokenami.TokenValue<TK, TV>
    : never
  : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;

type Value<P> = P extends keyof PropertyConfig
  ? PropertyConfig[P][number] extends infer ThemeKey
    ? ThemeKey extends 'grid'
      ? TokenValue<P> | Tokenami.ArbitraryValue | Tokenami.GridValue
      : TokenValue<P> | Tokenami.ArbitraryValue
    : never
  : CSSPropertyValue<P>;

type TokenamiBaseStyles = TokenamiStyle<'-webkit-line-clamp'> &
  TokenamiStyle<'accent-color'> &
  TokenamiStyle<'align-tracks'> &
  TokenamiStyle<'all'> &
  TokenamiStyle<'animation'> &
  TokenamiStyle<'animation-composition'> &
  TokenamiStyle<'animation-delay'> &
  TokenamiStyle<'animation-direction'> &
  TokenamiStyle<'animation-duration'> &
  TokenamiStyle<'animation-fill-mode'> &
  TokenamiStyle<'animation-iteration-count'> &
  TokenamiStyle<'animation-name'> &
  TokenamiStyle<'animation-play-state'> &
  TokenamiStyle<'animation-timeline'> &
  TokenamiStyle<'animation-timing-function'> &
  TokenamiStyle<'appearance'> &
  TokenamiStyle<'aspect-ratio'> &
  TokenamiStyle<'backdrop-filter'> &
  TokenamiStyle<'backface-visibility'> &
  TokenamiStyle<'background'> &
  TokenamiStyle<'background-attachment'> &
  TokenamiStyle<'background-blend-mode'> &
  TokenamiStyle<'background-clip'> &
  TokenamiStyle<'background-color'> &
  TokenamiStyle<'background-image'> &
  TokenamiStyle<'background-origin'> &
  TokenamiStyle<'background-position'> &
  TokenamiStyle<'background-position-x'> &
  TokenamiStyle<'background-position-y'> &
  TokenamiStyle<'background-repeat'> &
  TokenamiStyle<'background-size'> &
  TokenamiStyle<'block-overflow'> &
  TokenamiStyle<'block-size'> &
  TokenamiStyle<'border'> &
  TokenamiStyle<'border-style'> &
  TokenamiStyle<'border-color'> &
  TokenamiStyle<'border-width'> &
  TokenamiStyle<'border-top'> &
  TokenamiStyle<'border-top-color'> &
  TokenamiStyle<'border-top-style'> &
  TokenamiStyle<'border-top-width'> &
  TokenamiStyle<'border-right'> &
  TokenamiStyle<'border-right-color'> &
  TokenamiStyle<'border-right-style'> &
  TokenamiStyle<'border-right-width'> &
  TokenamiStyle<'border-bottom'> &
  TokenamiStyle<'border-bottom-color'> &
  TokenamiStyle<'border-bottom-style'> &
  TokenamiStyle<'border-bottom-width'> &
  TokenamiStyle<'border-left'> &
  TokenamiStyle<'border-left-color'> &
  TokenamiStyle<'border-left-style'> &
  TokenamiStyle<'border-left-width'> &
  TokenamiStyle<'border-block'> &
  TokenamiStyle<'border-block-width'> &
  TokenamiStyle<'border-block-style'> &
  TokenamiStyle<'border-block-color'> &
  TokenamiStyle<'border-block-start'> &
  TokenamiStyle<'border-block-end'> &
  TokenamiStyle<'border-block-start-color'> &
  TokenamiStyle<'border-block-start-style'> &
  TokenamiStyle<'border-block-start-width'> &
  TokenamiStyle<'border-block-end-color'> &
  TokenamiStyle<'border-block-end-style'> &
  TokenamiStyle<'border-block-end-width'> &
  TokenamiStyle<'border-image'> &
  TokenamiStyle<'border-image-outset'> &
  TokenamiStyle<'border-image-repeat'> &
  TokenamiStyle<'border-image-slice'> &
  TokenamiStyle<'border-image-source'> &
  TokenamiStyle<'border-image-width'> &
  TokenamiStyle<'border-inline'> &
  TokenamiStyle<'border-inline-color'> &
  TokenamiStyle<'border-inline-style'> &
  TokenamiStyle<'border-inline-width'> &
  TokenamiStyle<'border-inline-start'> &
  TokenamiStyle<'border-inline-end'> &
  TokenamiStyle<'border-inline-start-color'> &
  TokenamiStyle<'border-inline-start-style'> &
  TokenamiStyle<'border-inline-start-width'> &
  TokenamiStyle<'border-inline-end-color'> &
  TokenamiStyle<'border-inline-end-style'> &
  TokenamiStyle<'border-inline-end-width'> &
  TokenamiStyle<'border-radius'> &
  TokenamiStyle<'border-top-left-radius'> &
  TokenamiStyle<'border-top-right-radius'> &
  TokenamiStyle<'border-bottom-left-radius'> &
  TokenamiStyle<'border-bottom-right-radius'> &
  TokenamiStyle<'border-start-end-radius'> &
  TokenamiStyle<'border-start-start-radius'> &
  TokenamiStyle<'border-end-end-radius'> &
  TokenamiStyle<'border-end-start-radius'> &
  TokenamiStyle<'border-collapse'> &
  TokenamiStyle<'border-spacing'> &
  TokenamiStyle<'box-decoration-break'> &
  TokenamiStyle<'box-shadow'> &
  TokenamiStyle<'box-sizing'> &
  TokenamiStyle<'break-after'> &
  TokenamiStyle<'break-before'> &
  TokenamiStyle<'break-inside'> &
  TokenamiStyle<'caption-side'> &
  TokenamiStyle<'caret'> &
  TokenamiStyle<'caret-color'> &
  TokenamiStyle<'caret-shape'> &
  TokenamiStyle<'clear'> &
  TokenamiStyle<'clip'> &
  TokenamiStyle<'clip-path'> &
  TokenamiStyle<'color'> &
  TokenamiStyle<'color-scheme'> &
  TokenamiStyle<'column-fill'> &
  TokenamiStyle<'column-span'> &
  TokenamiStyle<'column-rule'> &
  TokenamiStyle<'column-rule-color'> &
  TokenamiStyle<'column-rule-style'> &
  TokenamiStyle<'column-rule-width'> &
  TokenamiStyle<'columns'> &
  TokenamiStyle<'column-count'> &
  TokenamiStyle<'column-width'> &
  TokenamiStyle<'contain'> &
  TokenamiStyle<'contain-intrinsic-block-size'> &
  TokenamiStyle<'contain-intrinsic-height'> &
  TokenamiStyle<'contain-intrinsic-inline-size'> &
  TokenamiStyle<'contain-intrinsic-size'> &
  TokenamiStyle<'contain-intrinsic-width'> &
  TokenamiStyle<'container'> &
  TokenamiStyle<'container-name'> &
  TokenamiStyle<'container-type'> &
  TokenamiStyle<'content'> &
  TokenamiStyle<'content-visibility'> &
  TokenamiStyle<'counter-increment'> &
  TokenamiStyle<'counter-reset'> &
  TokenamiStyle<'counter-set'> &
  TokenamiStyle<'cursor'> &
  TokenamiStyle<'direction'> &
  TokenamiStyle<'display'> &
  TokenamiStyle<'empty-cells'> &
  TokenamiStyle<'filter'> &
  TokenamiStyle<'flex'> &
  TokenamiStyle<'flex-basis'> &
  TokenamiStyle<'flex-direction'> &
  TokenamiStyle<'flex-flow'> &
  TokenamiStyle<'flex-grow'> &
  TokenamiStyle<'flex-shrink'> &
  TokenamiStyle<'flex-wrap'> &
  TokenamiStyle<'float'> &
  TokenamiStyle<'font'> &
  TokenamiStyle<'font-family'> &
  TokenamiStyle<'font-feature-settings'> &
  TokenamiStyle<'font-kerning'> &
  TokenamiStyle<'font-language-override'> &
  TokenamiStyle<'font-optical-sizing'> &
  TokenamiStyle<'font-palette'> &
  TokenamiStyle<'font-size'> &
  TokenamiStyle<'font-size-adjust'> &
  TokenamiStyle<'font-stretch'> &
  TokenamiStyle<'font-style'> &
  TokenamiStyle<'font-synthesis'> &
  TokenamiStyle<'font-variant'> &
  TokenamiStyle<'font-variant-alternates'> &
  TokenamiStyle<'font-variant-caps'> &
  TokenamiStyle<'font-variant-east-asian'> &
  TokenamiStyle<'font-variant-emoji'> &
  TokenamiStyle<'font-variant-ligatures'> &
  TokenamiStyle<'font-variant-numeric'> &
  TokenamiStyle<'font-variant-position'> &
  TokenamiStyle<'font-variation-settings'> &
  TokenamiStyle<'font-weight'> &
  TokenamiStyle<'forced-color-adjust'> &
  TokenamiStyle<'gap'> &
  TokenamiStyle<'row-gap'> &
  TokenamiStyle<'column-gap'> &
  TokenamiStyle<'grid'> &
  TokenamiStyle<'grid-area'> &
  TokenamiStyle<'grid-auto-rows'> &
  TokenamiStyle<'grid-auto-columns'> &
  TokenamiStyle<'grid-auto-flow'> &
  TokenamiStyle<'grid-column'> &
  TokenamiStyle<'grid-column-end'> &
  TokenamiStyle<'grid-column-start'> &
  TokenamiStyle<'grid-row'> &
  TokenamiStyle<'grid-row-end'> &
  TokenamiStyle<'grid-row-start'> &
  TokenamiStyle<'grid-template'> &
  TokenamiStyle<'grid-template-rows'> &
  TokenamiStyle<'grid-template-columns'> &
  TokenamiStyle<'grid-template-areas'> &
  TokenamiStyle<'hanging-punctuation'> &
  TokenamiStyle<'height'> &
  TokenamiStyle<'hyphenate-character'> &
  TokenamiStyle<'hyphenate-limit-chars'> &
  TokenamiStyle<'hyphens'> &
  TokenamiStyle<'image-orientation'> &
  TokenamiStyle<'image-rendering'> &
  TokenamiStyle<'image-resolution'> &
  TokenamiStyle<'initial-letter'> &
  TokenamiStyle<'inline-size'> &
  TokenamiStyle<'input-security'> &
  TokenamiStyle<'inset'> &
  TokenamiStyle<'top'> &
  TokenamiStyle<'right'> &
  TokenamiStyle<'bottom'> &
  TokenamiStyle<'left'> &
  TokenamiStyle<'inset-block'> &
  TokenamiStyle<'inset-block-end'> &
  TokenamiStyle<'inset-block-start'> &
  TokenamiStyle<'inset-inline'> &
  TokenamiStyle<'inset-inline-end'> &
  TokenamiStyle<'inset-inline-start'> &
  TokenamiStyle<'isolation'> &
  TokenamiStyle<'justify-tracks'> &
  TokenamiStyle<'letter-spacing'> &
  TokenamiStyle<'line-break'> &
  TokenamiStyle<'line-clamp'> &
  TokenamiStyle<'line-height'> &
  TokenamiStyle<'line-height-step'> &
  TokenamiStyle<'list-style'> &
  TokenamiStyle<'list-style-image'> &
  TokenamiStyle<'list-style-position'> &
  TokenamiStyle<'list-style-type'> &
  TokenamiStyle<'margin'> &
  TokenamiStyle<'margin-top'> &
  TokenamiStyle<'margin-right'> &
  TokenamiStyle<'margin-bottom'> &
  TokenamiStyle<'margin-left'> &
  TokenamiStyle<'margin-block'> &
  TokenamiStyle<'margin-block-end'> &
  TokenamiStyle<'margin-block-start'> &
  TokenamiStyle<'margin-inline'> &
  TokenamiStyle<'margin-inline-end'> &
  TokenamiStyle<'margin-inline-start'> &
  TokenamiStyle<'margin-trim'> &
  TokenamiStyle<'mask'> &
  TokenamiStyle<'mask-border'> &
  TokenamiStyle<'mask-border-mode'> &
  TokenamiStyle<'mask-border-outset'> &
  TokenamiStyle<'mask-border-repeat'> &
  TokenamiStyle<'mask-border-slice'> &
  TokenamiStyle<'mask-border-source'> &
  TokenamiStyle<'mask-border-width'> &
  TokenamiStyle<'mask-clip'> &
  TokenamiStyle<'mask-composite'> &
  TokenamiStyle<'mask-image'> &
  TokenamiStyle<'mask-mode'> &
  TokenamiStyle<'mask-origin'> &
  TokenamiStyle<'mask-position'> &
  TokenamiStyle<'mask-repeat'> &
  TokenamiStyle<'mask-size'> &
  TokenamiStyle<'mask-type'> &
  TokenamiStyle<'math-depth'> &
  TokenamiStyle<'math-shift'> &
  TokenamiStyle<'math-style'> &
  TokenamiStyle<'max-block-size'> &
  TokenamiStyle<'max-height'> &
  TokenamiStyle<'max-inline-size'> &
  TokenamiStyle<'max-lines'> &
  TokenamiStyle<'max-width'> &
  TokenamiStyle<'min-block-size'> &
  TokenamiStyle<'min-height'> &
  TokenamiStyle<'min-inline-size'> &
  TokenamiStyle<'min-width'> &
  TokenamiStyle<'mix-blend-mode'> &
  TokenamiStyle<'object-fit'> &
  TokenamiStyle<'object-position'> &
  TokenamiStyle<'offset'> &
  TokenamiStyle<'offset-anchor'> &
  TokenamiStyle<'offset-distance'> &
  TokenamiStyle<'offset-path'> &
  TokenamiStyle<'offset-position'> &
  TokenamiStyle<'offset-rotate'> &
  TokenamiStyle<'opacity'> &
  TokenamiStyle<'order'> &
  TokenamiStyle<'orphans'> &
  TokenamiStyle<'outline'> &
  TokenamiStyle<'outline-color'> &
  TokenamiStyle<'outline-offset'> &
  TokenamiStyle<'outline-style'> &
  TokenamiStyle<'outline-width'> &
  TokenamiStyle<'overflow'> &
  TokenamiStyle<'overflow-anchor'> &
  TokenamiStyle<'overflow-block'> &
  TokenamiStyle<'overflow-clip-margin'> &
  TokenamiStyle<'overflow-inline'> &
  TokenamiStyle<'overflow-wrap'> &
  TokenamiStyle<'overflow-x'> &
  TokenamiStyle<'overflow-y'> &
  TokenamiStyle<'overscroll-behavior'> &
  TokenamiStyle<'overscroll-behavior-block'> &
  TokenamiStyle<'overscroll-behavior-inline'> &
  TokenamiStyle<'overscroll-behavior-x'> &
  TokenamiStyle<'overscroll-behavior-y'> &
  TokenamiStyle<'padding'> &
  TokenamiStyle<'padding-top'> &
  TokenamiStyle<'padding-right'> &
  TokenamiStyle<'padding-bottom'> &
  TokenamiStyle<'padding-left'> &
  TokenamiStyle<'padding-block'> &
  TokenamiStyle<'padding-block-end'> &
  TokenamiStyle<'padding-block-start'> &
  TokenamiStyle<'padding-inline'> &
  TokenamiStyle<'padding-inline-end'> &
  TokenamiStyle<'padding-inline-start'> &
  TokenamiStyle<'page'> &
  TokenamiStyle<'page-break-after'> &
  TokenamiStyle<'page-break-before'> &
  TokenamiStyle<'page-break-inside'> &
  TokenamiStyle<'paint-order'> &
  TokenamiStyle<'perspective'> &
  TokenamiStyle<'perspective-origin'> &
  TokenamiStyle<'place-content'> &
  TokenamiStyle<'align-content'> &
  TokenamiStyle<'justify-content'> &
  TokenamiStyle<'place-items'> &
  TokenamiStyle<'align-items'> &
  TokenamiStyle<'justify-items'> &
  TokenamiStyle<'place-self'> &
  TokenamiStyle<'align-self'> &
  TokenamiStyle<'justify-self'> &
  TokenamiStyle<'pointer-events'> &
  TokenamiStyle<'position'> &
  TokenamiStyle<'print-color-adjust'> &
  TokenamiStyle<'quotes'> &
  TokenamiStyle<'resize'> &
  TokenamiStyle<'rotate'> &
  TokenamiStyle<'ruby-align'> &
  TokenamiStyle<'ruby-merge'> &
  TokenamiStyle<'ruby-position'> &
  TokenamiStyle<'scale'> &
  TokenamiStyle<'scroll-behavior'> &
  TokenamiStyle<'scroll-margin'> &
  TokenamiStyle<'scroll-margin-top'> &
  TokenamiStyle<'scroll-margin-right'> &
  TokenamiStyle<'scroll-margin-bottom'> &
  TokenamiStyle<'scroll-margin-left'> &
  TokenamiStyle<'scroll-margin-block'> &
  TokenamiStyle<'scroll-margin-block-end'> &
  TokenamiStyle<'scroll-margin-block-start'> &
  TokenamiStyle<'scroll-margin-inline'> &
  TokenamiStyle<'scroll-margin-inline-end'> &
  TokenamiStyle<'scroll-margin-inline-start'> &
  TokenamiStyle<'scroll-padding'> &
  TokenamiStyle<'scroll-padding-top'> &
  TokenamiStyle<'scroll-padding-right'> &
  TokenamiStyle<'scroll-padding-bottom'> &
  TokenamiStyle<'scroll-padding-left'> &
  TokenamiStyle<'scroll-padding-block'> &
  TokenamiStyle<'scroll-padding-block-end'> &
  TokenamiStyle<'scroll-padding-block-start'> &
  TokenamiStyle<'scroll-padding-inline'> &
  TokenamiStyle<'scroll-padding-inline-end'> &
  TokenamiStyle<'scroll-padding-inline-start'> &
  TokenamiStyle<'scroll-snap-align'> &
  TokenamiStyle<'scroll-snap-stop'> &
  TokenamiStyle<'scroll-snap-type'> &
  TokenamiStyle<'scroll-timeline'> &
  TokenamiStyle<'scroll-timeline-axis'> &
  TokenamiStyle<'scroll-timeline-name'> &
  TokenamiStyle<'scrollbar-color'> &
  TokenamiStyle<'scrollbar-gutter'> &
  TokenamiStyle<'scrollbar-width'> &
  TokenamiStyle<'shape-image-threshold'> &
  TokenamiStyle<'shape-margin'> &
  TokenamiStyle<'shape-outside'> &
  TokenamiStyle<'tab-size'> &
  TokenamiStyle<'table-layout'> &
  TokenamiStyle<'text-align'> &
  TokenamiStyle<'text-align-last'> &
  TokenamiStyle<'text-combine-upright'> &
  TokenamiStyle<'text-decoration'> &
  TokenamiStyle<'text-decoration-color'> &
  TokenamiStyle<'text-decoration-line'> &
  TokenamiStyle<'text-decoration-style'> &
  TokenamiStyle<'text-decoration-thickness'> &
  TokenamiStyle<'text-decoration-skip-ink'> &
  TokenamiStyle<'text-emphasis'> &
  TokenamiStyle<'text-emphasis-color'> &
  TokenamiStyle<'text-emphasis-position'> &
  TokenamiStyle<'text-emphasis-style'> &
  TokenamiStyle<'text-indent'> &
  TokenamiStyle<'text-justify'> &
  TokenamiStyle<'text-orientation'> &
  TokenamiStyle<'text-overflow'> &
  TokenamiStyle<'text-rendering'> &
  TokenamiStyle<'text-shadow'> &
  TokenamiStyle<'text-size-adjust'> &
  TokenamiStyle<'text-transform'> &
  TokenamiStyle<'text-underline-offset'> &
  TokenamiStyle<'text-underline-position'> &
  TokenamiStyle<'touch-action'> &
  TokenamiStyle<'transform'> &
  TokenamiStyle<'transform-box'> &
  TokenamiStyle<'transform-origin'> &
  TokenamiStyle<'transform-style'> &
  TokenamiStyle<'transition'> &
  TokenamiStyle<'transition-delay'> &
  TokenamiStyle<'transition-duration'> &
  TokenamiStyle<'transition-property'> &
  TokenamiStyle<'transition-timing-function'> &
  TokenamiStyle<'translate'> &
  TokenamiStyle<'unicode-bidi'> &
  TokenamiStyle<'user-select'> &
  TokenamiStyle<'vertical-align'> &
  TokenamiStyle<'view-transition-name'> &
  TokenamiStyle<'visibility'> &
  TokenamiStyle<'white-space'> &
  TokenamiStyle<'widows'> &
  TokenamiStyle<'width'> &
  TokenamiStyle<'will-change'> &
  TokenamiStyle<'word-break'> &
  TokenamiStyle<'word-spacing'> &
  TokenamiStyle<'word-wrap'> &
  TokenamiStyle<'writing-mode'> &
  TokenamiStyle<'z-index'> &
  TokenamiStyle<'zoom'>;

type TokenamiAliasStyles = {
  [K in AliasKey]: AliasesConfig[K][number] extends infer L
    ? L extends Tokenami.CSSProperty
      ? TokenamiStyle<K, TokenamiBaseStyles[Tokenami.TokenProperty<L>]>
      : never
    : never;
}[AliasKey];

interface TokenamiProperties extends TokenamiBaseStyles, UnionToIntersection<TokenamiAliasStyles> {
  [customProperty: `---${string}`]: string | number | undefined;
}

export type { TokenamiConfig, TokenamiFinalConfig, TokenamiProperties, ResponsiveKey };
