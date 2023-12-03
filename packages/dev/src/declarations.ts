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

type VariantStyle<P extends string, K extends string, V> = Style<P, V> &
  Style<`${K}_${P}`, V> &
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

type Value<P extends keyof CSS.PropertiesHyphen> = P extends keyof PropertyConfig
  ? PropertyConfig[P][number] extends infer ThemeKey
    ? ThemeKey extends 'grid'
      ? TokenValue<P> | ConfigUtils.ArbitraryValue | ConfigUtils.GridValue
      : TokenValue<P> | ConfigUtils.ArbitraryValue
    : never
  : CSSPropertyValue<P>;

type TokenamiBaseStyles = VariantStyle<
  '-webkit-line-clamp',
  ResponsiveKey,
  Value<'-webkit-line-clamp'>
> &
  VariantStyle<'accent-color', ResponsiveKey, Value<'accent-color'>> &
  VariantStyle<'align-tracks', ResponsiveKey, Value<'align-tracks'>> &
  VariantStyle<'all', ResponsiveKey, Value<'all'>> &
  VariantStyle<'animation', ResponsiveKey, Value<'animation'>> &
  VariantStyle<'animation-composition', ResponsiveKey, Value<'animation-composition'>> &
  VariantStyle<'animation-delay', ResponsiveKey, Value<'animation-delay'>> &
  VariantStyle<'animation-direction', ResponsiveKey, Value<'animation-direction'>> &
  VariantStyle<'animation-duration', ResponsiveKey, Value<'animation-duration'>> &
  VariantStyle<'animation-fill-mode', ResponsiveKey, Value<'animation-fill-mode'>> &
  VariantStyle<'animation-iteration-count', ResponsiveKey, Value<'animation-iteration-count'>> &
  VariantStyle<'animation-name', ResponsiveKey, Value<'animation-name'>> &
  VariantStyle<'animation-play-state', ResponsiveKey, Value<'animation-play-state'>> &
  VariantStyle<'animation-timeline', ResponsiveKey, Value<'animation-timeline'>> &
  VariantStyle<'animation-timing-function', ResponsiveKey, Value<'animation-timing-function'>> &
  VariantStyle<'appearance', ResponsiveKey, Value<'appearance'>> &
  VariantStyle<'aspect-ratio', ResponsiveKey, Value<'aspect-ratio'>> &
  VariantStyle<'backdrop-filter', ResponsiveKey, Value<'backdrop-filter'>> &
  VariantStyle<'backface-visibility', ResponsiveKey, Value<'backface-visibility'>> &
  VariantStyle<'background', ResponsiveKey, Value<'background'>> &
  VariantStyle<'background-attachment', ResponsiveKey, Value<'background-attachment'>> &
  VariantStyle<'background-blend-mode', ResponsiveKey, Value<'background-blend-mode'>> &
  VariantStyle<'background-clip', ResponsiveKey, Value<'background-clip'>> &
  VariantStyle<'background-color', ResponsiveKey, Value<'background-color'>> &
  VariantStyle<'background-image', ResponsiveKey, Value<'background-image'>> &
  VariantStyle<'background-origin', ResponsiveKey, Value<'background-origin'>> &
  VariantStyle<'background-position', ResponsiveKey, Value<'background-position'>> &
  VariantStyle<'background-position-x', ResponsiveKey, Value<'background-position-x'>> &
  VariantStyle<'background-position-y', ResponsiveKey, Value<'background-position-y'>> &
  VariantStyle<'background-repeat', ResponsiveKey, Value<'background-repeat'>> &
  VariantStyle<'background-size', ResponsiveKey, Value<'background-size'>> &
  VariantStyle<'block-overflow', ResponsiveKey, Value<'block-overflow'>> &
  VariantStyle<'block-size', ResponsiveKey, Value<'block-size'>> &
  VariantStyle<'border', ResponsiveKey, Value<'border'>> &
  VariantStyle<'border-style', ResponsiveKey, Value<'border-style'>> &
  VariantStyle<'border-color', ResponsiveKey, Value<'border-color'>> &
  VariantStyle<'border-width', ResponsiveKey, Value<'border-width'>> &
  VariantStyle<'border-top', ResponsiveKey, Value<'border-top'>> &
  VariantStyle<'border-top-color', ResponsiveKey, Value<'border-top-color'>> &
  VariantStyle<'border-top-style', ResponsiveKey, Value<'border-top-style'>> &
  VariantStyle<'border-top-width', ResponsiveKey, Value<'border-top-width'>> &
  VariantStyle<'border-right', ResponsiveKey, Value<'border-right'>> &
  VariantStyle<'border-right-color', ResponsiveKey, Value<'border-right-color'>> &
  VariantStyle<'border-right-style', ResponsiveKey, Value<'border-right-style'>> &
  VariantStyle<'border-right-width', ResponsiveKey, Value<'border-right-width'>> &
  VariantStyle<'border-bottom', ResponsiveKey, Value<'border-bottom'>> &
  VariantStyle<'border-bottom-color', ResponsiveKey, Value<'border-bottom-color'>> &
  VariantStyle<'border-bottom-style', ResponsiveKey, Value<'border-bottom-style'>> &
  VariantStyle<'border-bottom-width', ResponsiveKey, Value<'border-bottom-width'>> &
  VariantStyle<'border-left', ResponsiveKey, Value<'border-left'>> &
  VariantStyle<'border-left-color', ResponsiveKey, Value<'border-left-color'>> &
  VariantStyle<'border-left-style', ResponsiveKey, Value<'border-left-style'>> &
  VariantStyle<'border-left-width', ResponsiveKey, Value<'border-left-width'>> &
  VariantStyle<'border-block', ResponsiveKey, Value<'border-block'>> &
  VariantStyle<'border-block-width', ResponsiveKey, Value<'border-block-width'>> &
  VariantStyle<'border-block-style', ResponsiveKey, Value<'border-block-style'>> &
  VariantStyle<'border-block-color', ResponsiveKey, Value<'border-block-color'>> &
  VariantStyle<'border-block-start', ResponsiveKey, Value<'border-block-start'>> &
  VariantStyle<'border-block-end', ResponsiveKey, Value<'border-block-end'>> &
  VariantStyle<'border-block-start-color', ResponsiveKey, Value<'border-block-start-color'>> &
  VariantStyle<'border-block-start-style', ResponsiveKey, Value<'border-block-start-style'>> &
  VariantStyle<'border-block-start-width', ResponsiveKey, Value<'border-block-start-width'>> &
  VariantStyle<'border-block-end-color', ResponsiveKey, Value<'border-block-end-color'>> &
  VariantStyle<'border-block-end-style', ResponsiveKey, Value<'border-block-end-style'>> &
  VariantStyle<'border-block-end-width', ResponsiveKey, Value<'border-block-end-width'>> &
  VariantStyle<'border-image', ResponsiveKey, Value<'border-image'>> &
  VariantStyle<'border-image-outset', ResponsiveKey, Value<'border-image-outset'>> &
  VariantStyle<'border-image-repeat', ResponsiveKey, Value<'border-image-repeat'>> &
  VariantStyle<'border-image-slice', ResponsiveKey, Value<'border-image-slice'>> &
  VariantStyle<'border-image-source', ResponsiveKey, Value<'border-image-source'>> &
  VariantStyle<'border-image-width', ResponsiveKey, Value<'border-image-width'>> &
  VariantStyle<'border-inline', ResponsiveKey, Value<'border-inline'>> &
  VariantStyle<'border-inline-color', ResponsiveKey, Value<'border-inline-color'>> &
  VariantStyle<'border-inline-style', ResponsiveKey, Value<'border-inline-style'>> &
  VariantStyle<'border-inline-width', ResponsiveKey, Value<'border-inline-width'>> &
  VariantStyle<'border-inline-start', ResponsiveKey, Value<'border-inline-start'>> &
  VariantStyle<'border-inline-end', ResponsiveKey, Value<'border-inline-end'>> &
  VariantStyle<'border-inline-start-color', ResponsiveKey, Value<'border-inline-start-color'>> &
  VariantStyle<'border-inline-start-style', ResponsiveKey, Value<'border-inline-start-style'>> &
  VariantStyle<'border-inline-start-width', ResponsiveKey, Value<'border-inline-start-width'>> &
  VariantStyle<'border-inline-end-color', ResponsiveKey, Value<'border-inline-end-color'>> &
  VariantStyle<'border-inline-end-style', ResponsiveKey, Value<'border-inline-end-style'>> &
  VariantStyle<'border-inline-end-width', ResponsiveKey, Value<'border-inline-end-width'>> &
  VariantStyle<'border-radius', ResponsiveKey, Value<'border-radius'>> &
  VariantStyle<'border-top-left-radius', ResponsiveKey, Value<'border-top-left-radius'>> &
  VariantStyle<'border-top-right-radius', ResponsiveKey, Value<'border-top-right-radius'>> &
  VariantStyle<'border-bottom-left-radius', ResponsiveKey, Value<'border-bottom-left-radius'>> &
  VariantStyle<'border-bottom-right-radius', ResponsiveKey, Value<'border-bottom-right-radius'>> &
  VariantStyle<'border-start-end-radius', ResponsiveKey, Value<'border-start-end-radius'>> &
  VariantStyle<'border-start-start-radius', ResponsiveKey, Value<'border-start-start-radius'>> &
  VariantStyle<'border-end-end-radius', ResponsiveKey, Value<'border-end-end-radius'>> &
  VariantStyle<'border-end-start-radius', ResponsiveKey, Value<'border-end-start-radius'>> &
  VariantStyle<'border-collapse', ResponsiveKey, Value<'border-collapse'>> &
  VariantStyle<'border-spacing', ResponsiveKey, Value<'border-spacing'>> &
  VariantStyle<'box-decoration-break', ResponsiveKey, Value<'box-decoration-break'>> &
  VariantStyle<'box-shadow', ResponsiveKey, Value<'box-shadow'>> &
  VariantStyle<'box-sizing', ResponsiveKey, Value<'box-sizing'>> &
  VariantStyle<'break-after', ResponsiveKey, Value<'break-after'>> &
  VariantStyle<'break-before', ResponsiveKey, Value<'break-before'>> &
  VariantStyle<'break-inside', ResponsiveKey, Value<'break-inside'>> &
  VariantStyle<'caption-side', ResponsiveKey, Value<'caption-side'>> &
  VariantStyle<'caret', ResponsiveKey, Value<'caret'>> &
  VariantStyle<'caret-color', ResponsiveKey, Value<'caret-color'>> &
  VariantStyle<'caret-shape', ResponsiveKey, Value<'caret-shape'>> &
  VariantStyle<'clear', ResponsiveKey, Value<'clear'>> &
  VariantStyle<'clip', ResponsiveKey, Value<'clip'>> &
  VariantStyle<'clip-path', ResponsiveKey, Value<'clip-path'>> &
  VariantStyle<'color', ResponsiveKey, Value<'color'>> &
  VariantStyle<'color-scheme', ResponsiveKey, Value<'color-scheme'>> &
  VariantStyle<'column-fill', ResponsiveKey, Value<'column-fill'>> &
  VariantStyle<'column-span', ResponsiveKey, Value<'column-span'>> &
  VariantStyle<'column-rule', ResponsiveKey, Value<'column-rule'>> &
  VariantStyle<'column-rule-color', ResponsiveKey, Value<'column-rule-color'>> &
  VariantStyle<'column-rule-style', ResponsiveKey, Value<'column-rule-style'>> &
  VariantStyle<'column-rule-width', ResponsiveKey, Value<'column-rule-width'>> &
  VariantStyle<'columns', ResponsiveKey, Value<'columns'>> &
  VariantStyle<'column-count', ResponsiveKey, Value<'column-count'>> &
  VariantStyle<'column-width', ResponsiveKey, Value<'column-width'>> &
  VariantStyle<'contain', ResponsiveKey, Value<'contain'>> &
  VariantStyle<
    'contain-intrinsic-block-size',
    ResponsiveKey,
    Value<'contain-intrinsic-block-size'>
  > &
  VariantStyle<'contain-intrinsic-height', ResponsiveKey, Value<'contain-intrinsic-height'>> &
  VariantStyle<
    'contain-intrinsic-inline-size',
    ResponsiveKey,
    Value<'contain-intrinsic-inline-size'>
  > &
  VariantStyle<'contain-intrinsic-size', ResponsiveKey, Value<'contain-intrinsic-size'>> &
  VariantStyle<'contain-intrinsic-width', ResponsiveKey, Value<'contain-intrinsic-width'>> &
  VariantStyle<'container', ResponsiveKey, Value<'container'>> &
  VariantStyle<'container-name', ResponsiveKey, Value<'container-name'>> &
  VariantStyle<'container-type', ResponsiveKey, Value<'container-type'>> &
  VariantStyle<'content', ResponsiveKey, Value<'content'>> &
  VariantStyle<'content-visibility', ResponsiveKey, Value<'content-visibility'>> &
  VariantStyle<'counter-increment', ResponsiveKey, Value<'counter-increment'>> &
  VariantStyle<'counter-reset', ResponsiveKey, Value<'counter-reset'>> &
  VariantStyle<'counter-set', ResponsiveKey, Value<'counter-set'>> &
  VariantStyle<'cursor', ResponsiveKey, Value<'cursor'>> &
  VariantStyle<'direction', ResponsiveKey, Value<'direction'>> &
  VariantStyle<'display', ResponsiveKey, Value<'display'>> &
  VariantStyle<'empty-cells', ResponsiveKey, Value<'empty-cells'>> &
  VariantStyle<'filter', ResponsiveKey, Value<'filter'>> &
  VariantStyle<'flex', ResponsiveKey, Value<'flex'>> &
  VariantStyle<'flex-basis', ResponsiveKey, Value<'flex-basis'>> &
  VariantStyle<'flex-direction', ResponsiveKey, Value<'flex-direction'>> &
  VariantStyle<'flex-flow', ResponsiveKey, Value<'flex-flow'>> &
  VariantStyle<'flex-grow', ResponsiveKey, Value<'flex-grow'>> &
  VariantStyle<'flex-shrink', ResponsiveKey, Value<'flex-shrink'>> &
  VariantStyle<'flex-wrap', ResponsiveKey, Value<'flex-wrap'>> &
  VariantStyle<'float', ResponsiveKey, Value<'float'>> &
  VariantStyle<'font', ResponsiveKey, Value<'font'>> &
  VariantStyle<'font-family', ResponsiveKey, Value<'font-family'>> &
  VariantStyle<'font-feature-settings', ResponsiveKey, Value<'font-feature-settings'>> &
  VariantStyle<'font-kerning', ResponsiveKey, Value<'font-kerning'>> &
  VariantStyle<'font-language-override', ResponsiveKey, Value<'font-language-override'>> &
  VariantStyle<'font-optical-sizing', ResponsiveKey, Value<'font-optical-sizing'>> &
  VariantStyle<'font-palette', ResponsiveKey, Value<'font-palette'>> &
  VariantStyle<'font-size', ResponsiveKey, Value<'font-size'>> &
  VariantStyle<'font-size-adjust', ResponsiveKey, Value<'font-size-adjust'>> &
  VariantStyle<'font-stretch', ResponsiveKey, Value<'font-stretch'>> &
  VariantStyle<'font-style', ResponsiveKey, Value<'font-style'>> &
  VariantStyle<'font-synthesis', ResponsiveKey, Value<'font-synthesis'>> &
  VariantStyle<'font-variant', ResponsiveKey, Value<'font-variant'>> &
  VariantStyle<'font-variant-alternates', ResponsiveKey, Value<'font-variant-alternates'>> &
  VariantStyle<'font-variant-caps', ResponsiveKey, Value<'font-variant-caps'>> &
  VariantStyle<'font-variant-east-asian', ResponsiveKey, Value<'font-variant-east-asian'>> &
  VariantStyle<'font-variant-emoji', ResponsiveKey, Value<'font-variant-emoji'>> &
  VariantStyle<'font-variant-ligatures', ResponsiveKey, Value<'font-variant-ligatures'>> &
  VariantStyle<'font-variant-numeric', ResponsiveKey, Value<'font-variant-numeric'>> &
  VariantStyle<'font-variant-position', ResponsiveKey, Value<'font-variant-position'>> &
  VariantStyle<'font-variation-settings', ResponsiveKey, Value<'font-variation-settings'>> &
  VariantStyle<'font-weight', ResponsiveKey, Value<'font-weight'>> &
  VariantStyle<'forced-color-adjust', ResponsiveKey, Value<'forced-color-adjust'>> &
  VariantStyle<'gap', ResponsiveKey, Value<'gap'>> &
  VariantStyle<'row-gap', ResponsiveKey, Value<'row-gap'>> &
  VariantStyle<'column-gap', ResponsiveKey, Value<'column-gap'>> &
  VariantStyle<'grid', ResponsiveKey, Value<'grid'>> &
  VariantStyle<'grid-area', ResponsiveKey, Value<'grid-area'>> &
  VariantStyle<'grid-auto-rows', ResponsiveKey, Value<'grid-auto-rows'>> &
  VariantStyle<'grid-auto-columns', ResponsiveKey, Value<'grid-auto-columns'>> &
  VariantStyle<'grid-auto-flow', ResponsiveKey, Value<'grid-auto-flow'>> &
  VariantStyle<'grid-column', ResponsiveKey, Value<'grid-column'>> &
  VariantStyle<'grid-column-end', ResponsiveKey, Value<'grid-column-end'>> &
  VariantStyle<'grid-column-start', ResponsiveKey, Value<'grid-column-start'>> &
  VariantStyle<'grid-row', ResponsiveKey, Value<'grid-row'>> &
  VariantStyle<'grid-row-end', ResponsiveKey, Value<'grid-row-end'>> &
  VariantStyle<'grid-row-start', ResponsiveKey, Value<'grid-row-start'>> &
  VariantStyle<'grid-template', ResponsiveKey, Value<'grid-template'>> &
  VariantStyle<'grid-template-rows', ResponsiveKey, Value<'grid-template-rows'>> &
  VariantStyle<'grid-template-columns', ResponsiveKey, Value<'grid-template-columns'>> &
  VariantStyle<'grid-template-areas', ResponsiveKey, Value<'grid-template-areas'>> &
  VariantStyle<'hanging-punctuation', ResponsiveKey, Value<'hanging-punctuation'>> &
  VariantStyle<'height', ResponsiveKey, Value<'height'>> &
  VariantStyle<'hyphenate-character', ResponsiveKey, Value<'hyphenate-character'>> &
  VariantStyle<'hyphenate-limit-chars', ResponsiveKey, Value<'hyphenate-limit-chars'>> &
  VariantStyle<'hyphens', ResponsiveKey, Value<'hyphens'>> &
  VariantStyle<'image-orientation', ResponsiveKey, Value<'image-orientation'>> &
  VariantStyle<'image-rendering', ResponsiveKey, Value<'image-rendering'>> &
  VariantStyle<'image-resolution', ResponsiveKey, Value<'image-resolution'>> &
  VariantStyle<'initial-letter', ResponsiveKey, Value<'initial-letter'>> &
  VariantStyle<'inline-size', ResponsiveKey, Value<'inline-size'>> &
  VariantStyle<'input-security', ResponsiveKey, Value<'input-security'>> &
  VariantStyle<'inset', ResponsiveKey, Value<'inset'>> &
  VariantStyle<'top', ResponsiveKey, Value<'top'>> &
  VariantStyle<'right', ResponsiveKey, Value<'right'>> &
  VariantStyle<'bottom', ResponsiveKey, Value<'bottom'>> &
  VariantStyle<'left', ResponsiveKey, Value<'left'>> &
  VariantStyle<'inset-block', ResponsiveKey, Value<'inset-block'>> &
  VariantStyle<'inset-block-end', ResponsiveKey, Value<'inset-block-end'>> &
  VariantStyle<'inset-block-start', ResponsiveKey, Value<'inset-block-start'>> &
  VariantStyle<'inset-inline', ResponsiveKey, Value<'inset-inline'>> &
  VariantStyle<'inset-inline-end', ResponsiveKey, Value<'inset-inline-end'>> &
  VariantStyle<'inset-inline-start', ResponsiveKey, Value<'inset-inline-start'>> &
  VariantStyle<'isolation', ResponsiveKey, Value<'isolation'>> &
  VariantStyle<'justify-tracks', ResponsiveKey, Value<'justify-tracks'>> &
  VariantStyle<'letter-spacing', ResponsiveKey, Value<'letter-spacing'>> &
  VariantStyle<'line-break', ResponsiveKey, Value<'line-break'>> &
  VariantStyle<'line-clamp', ResponsiveKey, Value<'line-clamp'>> &
  VariantStyle<'line-height', ResponsiveKey, Value<'line-height'>> &
  VariantStyle<'line-height-step', ResponsiveKey, Value<'line-height-step'>> &
  VariantStyle<'list-style', ResponsiveKey, Value<'list-style'>> &
  VariantStyle<'list-style-image', ResponsiveKey, Value<'list-style-image'>> &
  VariantStyle<'list-style-position', ResponsiveKey, Value<'list-style-position'>> &
  VariantStyle<'list-style-type', ResponsiveKey, Value<'list-style-type'>> &
  VariantStyle<'margin', ResponsiveKey, Value<'margin'>> &
  VariantStyle<'margin-top', ResponsiveKey, Value<'margin-top'>> &
  VariantStyle<'margin-right', ResponsiveKey, Value<'margin-right'>> &
  VariantStyle<'margin-bottom', ResponsiveKey, Value<'margin-bottom'>> &
  VariantStyle<'margin-left', ResponsiveKey, Value<'margin-left'>> &
  VariantStyle<'margin-block', ResponsiveKey, Value<'margin-block'>> &
  VariantStyle<'margin-block-end', ResponsiveKey, Value<'margin-block-end'>> &
  VariantStyle<'margin-block-start', ResponsiveKey, Value<'margin-block-start'>> &
  VariantStyle<'margin-inline', ResponsiveKey, Value<'margin-inline'>> &
  VariantStyle<'margin-inline-end', ResponsiveKey, Value<'margin-inline-end'>> &
  VariantStyle<'margin-inline-start', ResponsiveKey, Value<'margin-inline-start'>> &
  VariantStyle<'margin-trim', ResponsiveKey, Value<'margin-trim'>> &
  VariantStyle<'mask', ResponsiveKey, Value<'mask'>> &
  VariantStyle<'mask-border', ResponsiveKey, Value<'mask-border'>> &
  VariantStyle<'mask-border-mode', ResponsiveKey, Value<'mask-border-mode'>> &
  VariantStyle<'mask-border-outset', ResponsiveKey, Value<'mask-border-outset'>> &
  VariantStyle<'mask-border-repeat', ResponsiveKey, Value<'mask-border-repeat'>> &
  VariantStyle<'mask-border-slice', ResponsiveKey, Value<'mask-border-slice'>> &
  VariantStyle<'mask-border-source', ResponsiveKey, Value<'mask-border-source'>> &
  VariantStyle<'mask-border-width', ResponsiveKey, Value<'mask-border-width'>> &
  VariantStyle<'mask-clip', ResponsiveKey, Value<'mask-clip'>> &
  VariantStyle<'mask-composite', ResponsiveKey, Value<'mask-composite'>> &
  VariantStyle<'mask-image', ResponsiveKey, Value<'mask-image'>> &
  VariantStyle<'mask-mode', ResponsiveKey, Value<'mask-mode'>> &
  VariantStyle<'mask-origin', ResponsiveKey, Value<'mask-origin'>> &
  VariantStyle<'mask-position', ResponsiveKey, Value<'mask-position'>> &
  VariantStyle<'mask-repeat', ResponsiveKey, Value<'mask-repeat'>> &
  VariantStyle<'mask-size', ResponsiveKey, Value<'mask-size'>> &
  VariantStyle<'mask-type', ResponsiveKey, Value<'mask-type'>> &
  VariantStyle<'math-depth', ResponsiveKey, Value<'math-depth'>> &
  VariantStyle<'math-shift', ResponsiveKey, Value<'math-shift'>> &
  VariantStyle<'math-style', ResponsiveKey, Value<'math-style'>> &
  VariantStyle<'max-block-size', ResponsiveKey, Value<'max-block-size'>> &
  VariantStyle<'max-height', ResponsiveKey, Value<'max-height'>> &
  VariantStyle<'max-inline-size', ResponsiveKey, Value<'max-inline-size'>> &
  VariantStyle<'max-lines', ResponsiveKey, Value<'max-lines'>> &
  VariantStyle<'max-width', ResponsiveKey, Value<'max-width'>> &
  VariantStyle<'min-block-size', ResponsiveKey, Value<'min-block-size'>> &
  VariantStyle<'min-height', ResponsiveKey, Value<'min-height'>> &
  VariantStyle<'min-inline-size', ResponsiveKey, Value<'min-inline-size'>> &
  VariantStyle<'min-width', ResponsiveKey, Value<'min-width'>> &
  VariantStyle<'mix-blend-mode', ResponsiveKey, Value<'mix-blend-mode'>> &
  VariantStyle<'object-fit', ResponsiveKey, Value<'object-fit'>> &
  VariantStyle<'object-position', ResponsiveKey, Value<'object-position'>> &
  VariantStyle<'offset', ResponsiveKey, Value<'offset'>> &
  VariantStyle<'offset-anchor', ResponsiveKey, Value<'offset-anchor'>> &
  VariantStyle<'offset-distance', ResponsiveKey, Value<'offset-distance'>> &
  VariantStyle<'offset-path', ResponsiveKey, Value<'offset-path'>> &
  VariantStyle<'offset-position', ResponsiveKey, Value<'offset-position'>> &
  VariantStyle<'offset-rotate', ResponsiveKey, Value<'offset-rotate'>> &
  VariantStyle<'opacity', ResponsiveKey, Value<'opacity'>> &
  VariantStyle<'order', ResponsiveKey, Value<'order'>> &
  VariantStyle<'orphans', ResponsiveKey, Value<'orphans'>> &
  VariantStyle<'outline', ResponsiveKey, Value<'outline'>> &
  VariantStyle<'outline-color', ResponsiveKey, Value<'outline-color'>> &
  VariantStyle<'outline-offset', ResponsiveKey, Value<'outline-offset'>> &
  VariantStyle<'outline-style', ResponsiveKey, Value<'outline-style'>> &
  VariantStyle<'outline-width', ResponsiveKey, Value<'outline-width'>> &
  VariantStyle<'overflow', ResponsiveKey, Value<'overflow'>> &
  VariantStyle<'overflow-anchor', ResponsiveKey, Value<'overflow-anchor'>> &
  VariantStyle<'overflow-block', ResponsiveKey, Value<'overflow-block'>> &
  VariantStyle<'overflow-clip-margin', ResponsiveKey, Value<'overflow-clip-margin'>> &
  VariantStyle<'overflow-inline', ResponsiveKey, Value<'overflow-inline'>> &
  VariantStyle<'overflow-wrap', ResponsiveKey, Value<'overflow-wrap'>> &
  VariantStyle<'overflow-x', ResponsiveKey, Value<'overflow-x'>> &
  VariantStyle<'overflow-y', ResponsiveKey, Value<'overflow-y'>> &
  VariantStyle<'overscroll-behavior', ResponsiveKey, Value<'overscroll-behavior'>> &
  VariantStyle<'overscroll-behavior-block', ResponsiveKey, Value<'overscroll-behavior-block'>> &
  VariantStyle<'overscroll-behavior-inline', ResponsiveKey, Value<'overscroll-behavior-inline'>> &
  VariantStyle<'overscroll-behavior-x', ResponsiveKey, Value<'overscroll-behavior-x'>> &
  VariantStyle<'overscroll-behavior-y', ResponsiveKey, Value<'overscroll-behavior-y'>> &
  VariantStyle<'padding', ResponsiveKey, Value<'padding'>> &
  VariantStyle<'padding-top', ResponsiveKey, Value<'padding-top'>> &
  VariantStyle<'padding-right', ResponsiveKey, Value<'padding-right'>> &
  VariantStyle<'padding-bottom', ResponsiveKey, Value<'padding-bottom'>> &
  VariantStyle<'padding-left', ResponsiveKey, Value<'padding-left'>> &
  VariantStyle<'padding-block', ResponsiveKey, Value<'padding-block'>> &
  VariantStyle<'padding-block-end', ResponsiveKey, Value<'padding-block-end'>> &
  VariantStyle<'padding-block-start', ResponsiveKey, Value<'padding-block-start'>> &
  VariantStyle<'padding-inline', ResponsiveKey, Value<'padding-inline'>> &
  VariantStyle<'padding-inline-end', ResponsiveKey, Value<'padding-inline-end'>> &
  VariantStyle<'padding-inline-start', ResponsiveKey, Value<'padding-inline-start'>> &
  VariantStyle<'page', ResponsiveKey, Value<'page'>> &
  VariantStyle<'page-break-after', ResponsiveKey, Value<'page-break-after'>> &
  VariantStyle<'page-break-before', ResponsiveKey, Value<'page-break-before'>> &
  VariantStyle<'page-break-inside', ResponsiveKey, Value<'page-break-inside'>> &
  VariantStyle<'paint-order', ResponsiveKey, Value<'paint-order'>> &
  VariantStyle<'perspective', ResponsiveKey, Value<'perspective'>> &
  VariantStyle<'perspective-origin', ResponsiveKey, Value<'perspective-origin'>> &
  VariantStyle<'place-content', ResponsiveKey, Value<'place-content'>> &
  VariantStyle<'align-content', ResponsiveKey, Value<'align-content'>> &
  VariantStyle<'justify-content', ResponsiveKey, Value<'justify-content'>> &
  VariantStyle<'place-items', ResponsiveKey, Value<'place-items'>> &
  VariantStyle<'align-items', ResponsiveKey, Value<'align-items'>> &
  VariantStyle<'justify-items', ResponsiveKey, Value<'justify-items'>> &
  VariantStyle<'place-self', ResponsiveKey, Value<'place-self'>> &
  VariantStyle<'align-self', ResponsiveKey, Value<'align-self'>> &
  VariantStyle<'justify-self', ResponsiveKey, Value<'justify-self'>> &
  VariantStyle<'pointer-events', ResponsiveKey, Value<'pointer-events'>> &
  VariantStyle<'position', ResponsiveKey, Value<'position'>> &
  VariantStyle<'print-color-adjust', ResponsiveKey, Value<'print-color-adjust'>> &
  VariantStyle<'quotes', ResponsiveKey, Value<'quotes'>> &
  VariantStyle<'resize', ResponsiveKey, Value<'resize'>> &
  VariantStyle<'rotate', ResponsiveKey, Value<'rotate'>> &
  VariantStyle<'ruby-align', ResponsiveKey, Value<'ruby-align'>> &
  VariantStyle<'ruby-merge', ResponsiveKey, Value<'ruby-merge'>> &
  VariantStyle<'ruby-position', ResponsiveKey, Value<'ruby-position'>> &
  VariantStyle<'scale', ResponsiveKey, Value<'scale'>> &
  VariantStyle<'scroll-behavior', ResponsiveKey, Value<'scroll-behavior'>> &
  VariantStyle<'scroll-margin', ResponsiveKey, Value<'scroll-margin'>> &
  VariantStyle<'scroll-margin-top', ResponsiveKey, Value<'scroll-margin-top'>> &
  VariantStyle<'scroll-margin-right', ResponsiveKey, Value<'scroll-margin-right'>> &
  VariantStyle<'scroll-margin-bottom', ResponsiveKey, Value<'scroll-margin-bottom'>> &
  VariantStyle<'scroll-margin-left', ResponsiveKey, Value<'scroll-margin-left'>> &
  VariantStyle<'scroll-margin-block', ResponsiveKey, Value<'scroll-margin-block'>> &
  VariantStyle<'scroll-margin-block-end', ResponsiveKey, Value<'scroll-margin-block-end'>> &
  VariantStyle<'scroll-margin-block-start', ResponsiveKey, Value<'scroll-margin-block-start'>> &
  VariantStyle<'scroll-margin-inline', ResponsiveKey, Value<'scroll-margin-inline'>> &
  VariantStyle<'scroll-margin-inline-end', ResponsiveKey, Value<'scroll-margin-inline-end'>> &
  VariantStyle<'scroll-margin-inline-start', ResponsiveKey, Value<'scroll-margin-inline-start'>> &
  VariantStyle<'scroll-padding', ResponsiveKey, Value<'scroll-padding'>> &
  VariantStyle<'scroll-padding-top', ResponsiveKey, Value<'scroll-padding-top'>> &
  VariantStyle<'scroll-padding-right', ResponsiveKey, Value<'scroll-padding-right'>> &
  VariantStyle<'scroll-padding-bottom', ResponsiveKey, Value<'scroll-padding-bottom'>> &
  VariantStyle<'scroll-padding-left', ResponsiveKey, Value<'scroll-padding-left'>> &
  VariantStyle<'scroll-padding-block', ResponsiveKey, Value<'scroll-padding-block'>> &
  VariantStyle<'scroll-padding-block-end', ResponsiveKey, Value<'scroll-padding-block-end'>> &
  VariantStyle<'scroll-padding-block-start', ResponsiveKey, Value<'scroll-padding-block-start'>> &
  VariantStyle<'scroll-padding-inline', ResponsiveKey, Value<'scroll-padding-inline'>> &
  VariantStyle<'scroll-padding-inline-end', ResponsiveKey, Value<'scroll-padding-inline-end'>> &
  VariantStyle<'scroll-padding-inline-start', ResponsiveKey, Value<'scroll-padding-inline-start'>> &
  VariantStyle<'scroll-snap-align', ResponsiveKey, Value<'scroll-snap-align'>> &
  VariantStyle<'scroll-snap-stop', ResponsiveKey, Value<'scroll-snap-stop'>> &
  VariantStyle<'scroll-snap-type', ResponsiveKey, Value<'scroll-snap-type'>> &
  VariantStyle<'scroll-timeline', ResponsiveKey, Value<'scroll-timeline'>> &
  VariantStyle<'scroll-timeline-axis', ResponsiveKey, Value<'scroll-timeline-axis'>> &
  VariantStyle<'scroll-timeline-name', ResponsiveKey, Value<'scroll-timeline-name'>> &
  VariantStyle<'scrollbar-color', ResponsiveKey, Value<'scrollbar-color'>> &
  VariantStyle<'scrollbar-gutter', ResponsiveKey, Value<'scrollbar-gutter'>> &
  VariantStyle<'scrollbar-width', ResponsiveKey, Value<'scrollbar-width'>> &
  VariantStyle<'shape-image-threshold', ResponsiveKey, Value<'shape-image-threshold'>> &
  VariantStyle<'shape-margin', ResponsiveKey, Value<'shape-margin'>> &
  VariantStyle<'shape-outside', ResponsiveKey, Value<'shape-outside'>> &
  VariantStyle<'tab-size', ResponsiveKey, Value<'tab-size'>> &
  VariantStyle<'table-layout', ResponsiveKey, Value<'table-layout'>> &
  VariantStyle<'text-align', ResponsiveKey, Value<'text-align'>> &
  VariantStyle<'text-align-last', ResponsiveKey, Value<'text-align-last'>> &
  VariantStyle<'text-combine-upright', ResponsiveKey, Value<'text-combine-upright'>> &
  VariantStyle<'text-decoration', ResponsiveKey, Value<'text-decoration'>> &
  VariantStyle<'text-decoration-color', ResponsiveKey, Value<'text-decoration-color'>> &
  VariantStyle<'text-decoration-line', ResponsiveKey, Value<'text-decoration-line'>> &
  VariantStyle<'text-decoration-style', ResponsiveKey, Value<'text-decoration-style'>> &
  VariantStyle<'text-decoration-thickness', ResponsiveKey, Value<'text-decoration-thickness'>> &
  VariantStyle<'text-decoration-skip-ink', ResponsiveKey, Value<'text-decoration-skip-ink'>> &
  VariantStyle<'text-emphasis', ResponsiveKey, Value<'text-emphasis'>> &
  VariantStyle<'text-emphasis-color', ResponsiveKey, Value<'text-emphasis-color'>> &
  VariantStyle<'text-emphasis-position', ResponsiveKey, Value<'text-emphasis-position'>> &
  VariantStyle<'text-emphasis-style', ResponsiveKey, Value<'text-emphasis-style'>> &
  VariantStyle<'text-indent', ResponsiveKey, Value<'text-indent'>> &
  VariantStyle<'text-justify', ResponsiveKey, Value<'text-justify'>> &
  VariantStyle<'text-orientation', ResponsiveKey, Value<'text-orientation'>> &
  VariantStyle<'text-overflow', ResponsiveKey, Value<'text-overflow'>> &
  VariantStyle<'text-rendering', ResponsiveKey, Value<'text-rendering'>> &
  VariantStyle<'text-shadow', ResponsiveKey, Value<'text-shadow'>> &
  VariantStyle<'text-size-adjust', ResponsiveKey, Value<'text-size-adjust'>> &
  VariantStyle<'text-transform', ResponsiveKey, Value<'text-transform'>> &
  VariantStyle<'text-underline-offset', ResponsiveKey, Value<'text-underline-offset'>> &
  VariantStyle<'text-underline-position', ResponsiveKey, Value<'text-underline-position'>> &
  VariantStyle<'touch-action', ResponsiveKey, Value<'touch-action'>> &
  VariantStyle<'transform', ResponsiveKey, Value<'transform'>> &
  VariantStyle<'transform-box', ResponsiveKey, Value<'transform-box'>> &
  VariantStyle<'transform-origin', ResponsiveKey, Value<'transform-origin'>> &
  VariantStyle<'transform-style', ResponsiveKey, Value<'transform-style'>> &
  VariantStyle<'transition', ResponsiveKey, Value<'transition'>> &
  VariantStyle<'transition-delay', ResponsiveKey, Value<'transition-delay'>> &
  VariantStyle<'transition-duration', ResponsiveKey, Value<'transition-duration'>> &
  VariantStyle<'transition-property', ResponsiveKey, Value<'transition-property'>> &
  VariantStyle<'transition-timing-function', ResponsiveKey, Value<'transition-timing-function'>> &
  VariantStyle<'translate', ResponsiveKey, Value<'translate'>> &
  VariantStyle<'unicode-bidi', ResponsiveKey, Value<'unicode-bidi'>> &
  VariantStyle<'user-select', ResponsiveKey, Value<'user-select'>> &
  VariantStyle<'vertical-align', ResponsiveKey, Value<'vertical-align'>> &
  VariantStyle<'view-transition-name', ResponsiveKey, Value<'view-transition-name'>> &
  VariantStyle<'visibility', ResponsiveKey, Value<'visibility'>> &
  VariantStyle<'white-space', ResponsiveKey, Value<'white-space'>> &
  VariantStyle<'widows', ResponsiveKey, Value<'widows'>> &
  VariantStyle<'width', ResponsiveKey, Value<'width'>> &
  VariantStyle<'will-change', ResponsiveKey, Value<'will-change'>> &
  VariantStyle<'word-break', ResponsiveKey, Value<'word-break'>> &
  VariantStyle<'word-spacing', ResponsiveKey, Value<'word-spacing'>> &
  VariantStyle<'word-wrap', ResponsiveKey, Value<'word-wrap'>> &
  VariantStyle<'writing-mode', ResponsiveKey, Value<'writing-mode'>> &
  VariantStyle<'z-index', ResponsiveKey, Value<'z-index'>> &
  VariantStyle<'zoom', ResponsiveKey, Value<'zoom'>>;

type TokenamiAliasStyles = {
  [K in AliasKey]: AliasesConfig[K][number] extends infer L
    ? L extends ConfigUtils.CSSProperty
      ? VariantStyle<K, ResponsiveKey, TokenamiBaseStyles[ConfigUtils.TokenProperty<L>]>
      : never
    : never;
}[AliasKey];

interface TokenamiStyles extends TokenamiBaseStyles, UnionToIntersection<TokenamiAliasStyles> {}

export type { TokenamiConfig, TokenamiFinalConfig, TokenamiStyles };
