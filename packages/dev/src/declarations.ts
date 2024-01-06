import type * as CSS from 'csstype';
import type * as Tokenami from '@tokenami/config';

// consumer will override this interface
interface TokenamiConfig {}

type Merge<A, B> = B extends never ? A : Omit<A, keyof B> & B;
type ExtractKeys<T> = keyof T extends `${infer P}` ? P : never;

type DefaultConfig = Tokenami.DefaultConfig & { CI: false };
interface TokenamiFinalConfig extends Merge<DefaultConfig, TokenamiConfig> {}

type ThemeConfig = TokenamiFinalConfig['theme'];
type PropertyConfig = TokenamiFinalConfig['properties'];
type SelectorKey = ExtractKeys<TokenamiFinalConfig['selectors']>;
type ResponsiveKey = ExtractKeys<TokenamiFinalConfig['responsive']>;
type AliasConfig = TokenamiFinalConfig['aliases'];
type AliasKey = ExtractKeys<AliasConfig>;
type ResponsiveSelectorKey = ResponsiveKey extends never
  ? never
  : SelectorKey extends never
  ? never
  : `${ResponsiveKey}_${SelectorKey}`;

type TokenName<ThemeKey> = ThemeKey extends keyof ThemeConfig ? keyof ThemeConfig[ThemeKey] : never;

type TokenVar<ThemeKey> = ThemeKey extends string
  ? TokenName<ThemeKey> extends `${infer Token}`
    ? Tokenami.TokenValue<ThemeKey, Token>
    : never
  : never;

type CSSPropertyValue<P> = P extends keyof CSS.PropertiesHyphen ? CSS.PropertiesHyphen[P] : never;

type ThemePropertyValue<ThemeKey> = ThemeKey extends 'grid'
  ? TokenVar<ThemeKey> | Tokenami.ArbitraryValue | Tokenami.GridValue
  : TokenVar<ThemeKey> | Tokenami.ArbitraryValue;

type PropertyValue<P> = P extends keyof PropertyConfig
  ? PropertyConfig[P][number] extends infer ThemeKey
    ? ThemeKey extends never
      ? CSSPropertyValue<P>
      : ThemePropertyValue<ThemeKey>
    : never
  : CSSPropertyValue<P>;

type PropertyValues = {
  [P in Tokenami.CSSProperty]: PropertyValue<P>;
};

type PropertyAliases = {
  [A in AliasKey]: {
    [P in Tokenami.CSSProperty]: P extends AliasConfig[A][number] ? A : never;
  };
}[AliasKey];

type VariantProperty<P extends string, K> = TokenamiFinalConfig['CI'] extends true
  ? K extends string
    ? Tokenami.VariantProperty<P, K>
    : never
  : Tokenami.VariantProperty<P, string>;

type PropertyWithVariants<P extends string, V> = { [K in Tokenami.TokenProperty<P>]?: V } & {
  [K in VariantProperty<P, ResponsiveKey | SelectorKey | ResponsiveSelectorKey>]?: V;
};

type Property = {
  [P in keyof PropertyValues]: PropertyWithVariants<P, PropertyValues[P]> &
    (P extends keyof PropertyAliases
      ? PropertyWithVariants<PropertyAliases[P], PropertyValues[P]>
      : {});
};

type Properties = Property['-webkit-line-clamp'] &
  Property['accent-color'] &
  Property['align-tracks'] &
  Property['all'] &
  Property['animation'] &
  Property['animation-composition'] &
  Property['animation-delay'] &
  Property['animation-direction'] &
  Property['animation-duration'] &
  Property['animation-fill-mode'] &
  Property['animation-iteration-count'] &
  Property['animation-name'] &
  Property['animation-play-state'] &
  Property['animation-timeline'] &
  Property['animation-timing-function'] &
  Property['appearance'] &
  Property['aspect-ratio'] &
  Property['backdrop-filter'] &
  Property['backface-visibility'] &
  Property['background'] &
  Property['background-attachment'] &
  Property['background-blend-mode'] &
  Property['background-clip'] &
  Property['background-color'] &
  Property['background-image'] &
  Property['background-origin'] &
  Property['background-position'] &
  Property['background-position-x'] &
  Property['background-position-y'] &
  Property['background-repeat'] &
  Property['background-size'] &
  Property['block-overflow'] &
  Property['block-size'] &
  Property['border'] &
  Property['border-style'] &
  Property['border-color'] &
  Property['border-width'] &
  Property['border-top'] &
  Property['border-top-color'] &
  Property['border-top-style'] &
  Property['border-top-width'] &
  Property['border-right'] &
  Property['border-right-color'] &
  Property['border-right-style'] &
  Property['border-right-width'] &
  Property['border-bottom'] &
  Property['border-bottom-color'] &
  Property['border-bottom-style'] &
  Property['border-bottom-width'] &
  Property['border-left'] &
  Property['border-left-color'] &
  Property['border-left-style'] &
  Property['border-left-width'] &
  Property['border-block'] &
  Property['border-block-width'] &
  Property['border-block-style'] &
  Property['border-block-color'] &
  Property['border-block-start'] &
  Property['border-block-end'] &
  Property['border-block-start-color'] &
  Property['border-block-start-style'] &
  Property['border-block-start-width'] &
  Property['border-block-end-color'] &
  Property['border-block-end-style'] &
  Property['border-block-end-width'] &
  Property['border-image'] &
  Property['border-image-outset'] &
  Property['border-image-repeat'] &
  Property['border-image-slice'] &
  Property['border-image-source'] &
  Property['border-image-width'] &
  Property['border-inline'] &
  Property['border-inline-color'] &
  Property['border-inline-style'] &
  Property['border-inline-width'] &
  Property['border-inline-start'] &
  Property['border-inline-end'] &
  Property['border-inline-start-color'] &
  Property['border-inline-start-style'] &
  Property['border-inline-start-width'] &
  Property['border-inline-end-color'] &
  Property['border-inline-end-style'] &
  Property['border-inline-end-width'] &
  Property['border-radius'] &
  Property['border-top-left-radius'] &
  Property['border-top-right-radius'] &
  Property['border-bottom-left-radius'] &
  Property['border-bottom-right-radius'] &
  Property['border-start-end-radius'] &
  Property['border-start-start-radius'] &
  Property['border-end-end-radius'] &
  Property['border-end-start-radius'] &
  Property['border-collapse'] &
  Property['border-spacing'] &
  Property['box-decoration-break'] &
  Property['box-shadow'] &
  Property['box-sizing'] &
  Property['break-after'] &
  Property['break-before'] &
  Property['break-inside'] &
  Property['caption-side'] &
  Property['caret'] &
  Property['caret-color'] &
  Property['caret-shape'] &
  Property['clear'] &
  Property['clip'] &
  Property['clip-path'] &
  Property['color'] &
  Property['color-scheme'] &
  Property['column-fill'] &
  Property['column-span'] &
  Property['column-rule'] &
  Property['column-rule-color'] &
  Property['column-rule-style'] &
  Property['column-rule-width'] &
  Property['columns'] &
  Property['column-count'] &
  Property['column-width'] &
  Property['contain'] &
  Property['contain-intrinsic-block-size'] &
  Property['contain-intrinsic-height'] &
  Property['contain-intrinsic-inline-size'] &
  Property['contain-intrinsic-size'] &
  Property['contain-intrinsic-width'] &
  Property['container'] &
  Property['container-name'] &
  Property['container-type'] &
  Property['content'] &
  Property['content-visibility'] &
  Property['counter-increment'] &
  Property['counter-reset'] &
  Property['counter-set'] &
  Property['cursor'] &
  Property['direction'] &
  Property['display'] &
  Property['empty-cells'] &
  Property['filter'] &
  Property['flex'] &
  Property['flex-basis'] &
  Property['flex-direction'] &
  Property['flex-flow'] &
  Property['flex-grow'] &
  Property['flex-shrink'] &
  Property['flex-wrap'] &
  Property['float'] &
  Property['font'] &
  Property['font-family'] &
  Property['font-feature-settings'] &
  Property['font-kerning'] &
  Property['font-language-override'] &
  Property['font-optical-sizing'] &
  Property['font-palette'] &
  Property['font-size'] &
  Property['font-size-adjust'] &
  Property['font-stretch'] &
  Property['font-style'] &
  Property['font-synthesis'] &
  Property['font-variant'] &
  Property['font-variant-alternates'] &
  Property['font-variant-caps'] &
  Property['font-variant-east-asian'] &
  Property['font-variant-emoji'] &
  Property['font-variant-ligatures'] &
  Property['font-variant-numeric'] &
  Property['font-variant-position'] &
  Property['font-variation-settings'] &
  Property['font-weight'] &
  Property['forced-color-adjust'] &
  Property['gap'] &
  Property['row-gap'] &
  Property['column-gap'] &
  Property['grid'] &
  Property['grid-area'] &
  Property['grid-auto-rows'] &
  Property['grid-auto-columns'] &
  Property['grid-auto-flow'] &
  Property['grid-column'] &
  Property['grid-column-end'] &
  Property['grid-column-start'] &
  Property['grid-row'] &
  Property['grid-row-end'] &
  Property['grid-row-start'] &
  Property['grid-template'] &
  Property['grid-template-rows'] &
  Property['grid-template-columns'] &
  Property['grid-template-areas'] &
  Property['hanging-punctuation'] &
  Property['height'] &
  Property['hyphenate-character'] &
  Property['hyphenate-limit-chars'] &
  Property['hyphens'] &
  Property['image-orientation'] &
  Property['image-rendering'] &
  Property['image-resolution'] &
  Property['initial-letter'] &
  Property['inline-size'] &
  Property['input-security'] &
  Property['inset'] &
  Property['top'] &
  Property['right'] &
  Property['bottom'] &
  Property['left'] &
  Property['inset-block'] &
  Property['inset-block-end'] &
  Property['inset-block-start'] &
  Property['inset-inline'] &
  Property['inset-inline-end'] &
  Property['inset-inline-start'] &
  Property['isolation'] &
  Property['justify-tracks'] &
  Property['letter-spacing'] &
  Property['line-break'] &
  Property['line-clamp'] &
  Property['line-height'] &
  Property['line-height-step'] &
  Property['list-style'] &
  Property['list-style-image'] &
  Property['list-style-position'] &
  Property['list-style-type'] &
  Property['margin'] &
  Property['margin-top'] &
  Property['margin-right'] &
  Property['margin-bottom'] &
  Property['margin-left'] &
  Property['margin-block'] &
  Property['margin-block-end'] &
  Property['margin-block-start'] &
  Property['margin-inline'] &
  Property['margin-inline-end'] &
  Property['margin-inline-start'] &
  Property['margin-trim'] &
  Property['mask'] &
  Property['mask-border'] &
  Property['mask-border-mode'] &
  Property['mask-border-outset'] &
  Property['mask-border-repeat'] &
  Property['mask-border-slice'] &
  Property['mask-border-source'] &
  Property['mask-border-width'] &
  Property['mask-clip'] &
  Property['mask-composite'] &
  Property['mask-image'] &
  Property['mask-mode'] &
  Property['mask-origin'] &
  Property['mask-position'] &
  Property['mask-repeat'] &
  Property['mask-size'] &
  Property['mask-type'] &
  Property['math-depth'] &
  Property['math-shift'] &
  Property['math-style'] &
  Property['max-block-size'] &
  Property['max-height'] &
  Property['max-inline-size'] &
  Property['max-lines'] &
  Property['max-width'] &
  Property['min-block-size'] &
  Property['min-height'] &
  Property['min-inline-size'] &
  Property['min-width'] &
  Property['mix-blend-mode'] &
  Property['object-fit'] &
  Property['object-position'] &
  Property['offset'] &
  Property['offset-anchor'] &
  Property['offset-distance'] &
  Property['offset-path'] &
  Property['offset-position'] &
  Property['offset-rotate'] &
  Property['opacity'] &
  Property['order'] &
  Property['orphans'] &
  Property['outline'] &
  Property['outline-color'] &
  Property['outline-offset'] &
  Property['outline-style'] &
  Property['outline-width'] &
  Property['overflow'] &
  Property['overflow-anchor'] &
  Property['overflow-block'] &
  Property['overflow-clip-margin'] &
  Property['overflow-inline'] &
  Property['overflow-wrap'] &
  Property['overflow-x'] &
  Property['overflow-y'] &
  Property['overscroll-behavior'] &
  Property['overscroll-behavior-block'] &
  Property['overscroll-behavior-inline'] &
  Property['overscroll-behavior-x'] &
  Property['overscroll-behavior-y'] &
  Property['padding'] &
  Property['padding-top'] &
  Property['padding-right'] &
  Property['padding-bottom'] &
  Property['padding-left'] &
  Property['padding-block'] &
  Property['padding-block-end'] &
  Property['padding-block-start'] &
  Property['padding-inline'] &
  Property['padding-inline-end'] &
  Property['padding-inline-start'] &
  Property['page'] &
  Property['page-break-after'] &
  Property['page-break-before'] &
  Property['page-break-inside'] &
  Property['paint-order'] &
  Property['perspective'] &
  Property['perspective-origin'] &
  Property['place-content'] &
  Property['align-content'] &
  Property['justify-content'] &
  Property['place-items'] &
  Property['align-items'] &
  Property['justify-items'] &
  Property['place-self'] &
  Property['align-self'] &
  Property['justify-self'] &
  Property['pointer-events'] &
  Property['position'] &
  Property['print-color-adjust'] &
  Property['quotes'] &
  Property['resize'] &
  Property['rotate'] &
  Property['ruby-align'] &
  Property['ruby-merge'] &
  Property['ruby-position'] &
  Property['scale'] &
  Property['scroll-behavior'] &
  Property['scroll-margin'] &
  Property['scroll-margin-top'] &
  Property['scroll-margin-right'] &
  Property['scroll-margin-bottom'] &
  Property['scroll-margin-left'] &
  Property['scroll-margin-block'] &
  Property['scroll-margin-block-end'] &
  Property['scroll-margin-block-start'] &
  Property['scroll-margin-inline'] &
  Property['scroll-margin-inline-end'] &
  Property['scroll-margin-inline-start'] &
  Property['scroll-padding'] &
  Property['scroll-padding-top'] &
  Property['scroll-padding-right'] &
  Property['scroll-padding-bottom'] &
  Property['scroll-padding-left'] &
  Property['scroll-padding-block'] &
  Property['scroll-padding-block-end'] &
  Property['scroll-padding-block-start'] &
  Property['scroll-padding-inline'] &
  Property['scroll-padding-inline-end'] &
  Property['scroll-padding-inline-start'] &
  Property['scroll-snap-align'] &
  Property['scroll-snap-stop'] &
  Property['scroll-snap-type'] &
  Property['scroll-timeline'] &
  Property['scroll-timeline-axis'] &
  Property['scroll-timeline-name'] &
  Property['scrollbar-color'] &
  Property['scrollbar-gutter'] &
  Property['scrollbar-width'] &
  Property['shape-image-threshold'] &
  Property['shape-margin'] &
  Property['shape-outside'] &
  Property['tab-size'] &
  Property['table-layout'] &
  Property['text-align'] &
  Property['text-align-last'] &
  Property['text-combine-upright'] &
  Property['text-decoration'] &
  Property['text-decoration-color'] &
  Property['text-decoration-line'] &
  Property['text-decoration-style'] &
  Property['text-decoration-thickness'] &
  Property['text-decoration-skip-ink'] &
  Property['text-emphasis'] &
  Property['text-emphasis-color'] &
  Property['text-emphasis-position'] &
  Property['text-emphasis-style'] &
  Property['text-indent'] &
  Property['text-justify'] &
  Property['text-orientation'] &
  Property['text-overflow'] &
  Property['text-rendering'] &
  Property['text-shadow'] &
  Property['text-size-adjust'] &
  Property['text-transform'] &
  Property['text-underline-offset'] &
  Property['text-underline-position'] &
  Property['touch-action'] &
  Property['transform'] &
  Property['transform-box'] &
  Property['transform-origin'] &
  Property['transform-style'] &
  Property['transition'] &
  Property['transition-delay'] &
  Property['transition-duration'] &
  Property['transition-property'] &
  Property['transition-timing-function'] &
  Property['translate'] &
  Property['unicode-bidi'] &
  Property['user-select'] &
  Property['vertical-align'] &
  Property['view-transition-name'] &
  Property['visibility'] &
  Property['white-space'] &
  Property['widows'] &
  Property['width'] &
  Property['will-change'] &
  Property['word-break'] &
  Property['word-spacing'] &
  Property['word-wrap'] &
  Property['writing-mode'] &
  Property['z-index'] &
  Property['zoom'];

interface TokenamiProperties extends Properties {
  [customProperty: `---${string}`]: string | number | undefined;
}

export type { TokenamiConfig, TokenamiFinalConfig, TokenamiProperties };
