import type * as CSS from "csstype";

// in specificity order
const properties = [
	"-webkit-line-clamp",
	"accent-color",
	"align-tracks",
	"all",

	"animation",
	"animation-composition",
	"animation-delay",
	"animation-direction",
	"animation-duration",
	"animation-fill-mode",
	"animation-iteration-count",
	"animation-name",
	"animation-play-state",
	"animation-timeline",
	"animation-timing-function",

	"appearance",
	"aspect-ratio",
	"backdrop-filter",
	"backface-visibility",

	"background",
	"background-attachment",
	"background-blend-mode",
	"background-clip",
	"background-color",
	"background-image",
	"background-origin",
	"background-position",
	"background-position-x",
	"background-position-y",
	"background-repeat",
	"background-size",

	"block-overflow",
	"block-size",

	"border",
	"border-style",
	"border-color",
	"border-width",

	"border-top",
	"border-top-color",
	"border-top-style",
	"border-top-width",

	"border-right",
	"border-right-color",
	"border-right-style",
	"border-right-width",

	"border-bottom",
	"border-bottom-color",
	"border-bottom-style",
	"border-bottom-width",

	"border-left",
	"border-left-color",
	"border-left-style",
	"border-left-width",

	"border-block",
	"border-block-width",
	"border-block-style",
	"border-block-color",
	"border-block-start",
	"border-block-end",
	"border-block-start-color",
	"border-block-start-style",
	"border-block-start-width",
	"border-block-end-color",
	"border-block-end-style",
	"border-block-end-width",

	"border-image",
	"border-image-outset",
	"border-image-repeat",
	"border-image-slice",
	"border-image-source",
	"border-image-width",

	"border-inline",
	"border-inline-color",
	"border-inline-style",
	"border-inline-width",
	"border-inline-start",
	"border-inline-end",
	"border-inline-start-color",
	"border-inline-start-style",
	"border-inline-start-width",
	"border-inline-end-color",
	"border-inline-end-style",
	"border-inline-end-width",

	"border-radius",
	"border-top-left-radius",
	"border-top-right-radius",
	"border-bottom-left-radius",
	"border-bottom-right-radius",
	"border-start-end-radius",
	"border-start-start-radius",
	"border-end-end-radius",
	"border-end-start-radius",

	"border-collapse",
	"border-spacing",

	"box-decoration-break",
	"box-shadow",
	"box-sizing",
	"break-after",
	"break-before",
	"break-inside",
	"caption-side",
	"caret",
	"caret-color",
	"caret-shape",
	"clear",
	"clip",
	"clip-path",
	"color",
	"color-scheme",

	"column-fill",
	"column-span",

	"column-rule",
	"column-rule-color",
	"column-rule-style",
	"column-rule-width",

	"columns",
	"column-count",
	"column-width",

	"contain",
	"contain-intrinsic-block-size",
	"contain-intrinsic-height",
	"contain-intrinsic-inline-size",
	"contain-intrinsic-size",
	"contain-intrinsic-width",

	"container",
	"container-name",
	"container-type",

	"content",
	"content-visibility",
	"counter-increment",
	"counter-reset",
	"counter-set",
	"cursor",
	"direction",
	"display",
	"empty-cells",
	"filter",

	"flex",
	"flex-basis",
	"flex-direction",
	"flex-flow",
	"flex-grow",
	"flex-shrink",
	"flex-wrap",

	"float",

	"font",
	"font-family",
	"font-feature-settings",
	"font-kerning",
	"font-language-override",
	"font-optical-sizing",
	"font-palette",
	"font-size",
	"font-size-adjust",
	"font-stretch",
	"font-style",
	"font-synthesis",

	"font-variant",
	"font-variant-alternates",
	"font-variant-caps",
	"font-variant-east-asian",
	"font-variant-emoji",
	"font-variant-ligatures",
	"font-variant-numeric",
	"font-variant-position",
	"font-variation-settings",

	"font-weight",
	"forced-color-adjust",

	"gap",
	"row-gap",
	"column-gap",

	"grid",
	"grid-area",
	"grid-auto-rows",
	"grid-auto-columns",
	"grid-auto-flow",

	"grid-column",
	"grid-column-end",
	"grid-column-start",

	"grid-row",
	"grid-row-end",
	"grid-row-start",

	"grid-template",
	"grid-template-rows",
	"grid-template-columns",
	"grid-template-areas",

	"hanging-punctuation",
	"height",
	"hyphenate-character",
	"hyphenate-limit-chars",
	"hyphens",
	"image-orientation",
	"image-rendering",
	"image-resolution",
	"initial-letter",
	"inline-size",
	"input-security",

	"inset",
	"top",
	"right",
	"bottom",
	"left",

	"inset-block",
	"inset-block-end",
	"inset-block-start",

	"inset-inline",
	"inset-inline-end",
	"inset-inline-start",

	"isolation",
	"justify-tracks",
	"letter-spacing",
	"line-break",
	"line-clamp",

	"line-height",
	"line-height-step",

	"list-style",
	"list-style-image",
	"list-style-position",
	"list-style-type",

	"margin",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",

	"margin-block",
	"margin-block-end",
	"margin-block-start",

	"margin-inline",
	"margin-inline-end",
	"margin-inline-start",

	"margin-trim",

	"mask",

	"mask-border",
	"mask-border-mode",
	"mask-border-outset",
	"mask-border-repeat",
	"mask-border-slice",
	"mask-border-source",
	"mask-border-width",

	"mask-clip",
	"mask-composite",
	"mask-image",
	"mask-mode",
	"mask-origin",
	"mask-position",
	"mask-repeat",
	"mask-size",
	"mask-type",

	"math-depth",
	"math-shift",
	"math-style",
	"max-block-size",
	"max-height",
	"max-inline-size",
	"max-lines",
	"max-width",
	"min-block-size",
	"min-height",
	"min-inline-size",
	"min-width",
	"mix-blend-mode",
	"object-fit",
	"object-position",

	"offset",
	"offset-anchor",
	"offset-distance",
	"offset-path",
	"offset-position",
	"offset-rotate",

	"opacity",
	"order",
	"orphans",

	"outline",
	"outline-color",
	"outline-offset",
	"outline-style",
	"outline-width",

	"overflow",
	"overflow-anchor",
	"overflow-block",
	"overflow-clip-margin",
	"overflow-inline",
	"overflow-wrap",
	"overflow-x",
	"overflow-y",

	"overscroll-behavior",
	"overscroll-behavior-block",
	"overscroll-behavior-inline",
	"overscroll-behavior-x",
	"overscroll-behavior-y",

	"padding",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",

	"padding-block",
	"padding-block-end",
	"padding-block-start",

	"padding-inline",
	"padding-inline-end",
	"padding-inline-start",

	"page",
	"page-break-after",
	"page-break-before",
	"page-break-inside",

	"paint-order",
	"perspective",
	"perspective-origin",

	"place-content",
	"align-content",
	"justify-content",

	"place-items",
	"align-items",
	"justify-items",

	"place-self",
	"align-self",
	"justify-self",

	"pointer-events",
	"position",
	"print-color-adjust",
	"quotes",
	"resize",
	"rotate",

	"ruby-align",
	"ruby-merge",
	"ruby-position",
	"scale",
	"scroll-behavior",

	"scroll-margin",
	"scroll-margin-top",
	"scroll-margin-right",
	"scroll-margin-bottom",
	"scroll-margin-left",

	"scroll-margin-block",
	"scroll-margin-block-end",
	"scroll-margin-block-start",

	"scroll-margin-inline",
	"scroll-margin-inline-end",
	"scroll-margin-inline-start",

	"scroll-padding",
	"scroll-padding-top",
	"scroll-padding-right",
	"scroll-padding-bottom",
	"scroll-padding-left",

	"scroll-padding-block",
	"scroll-padding-block-end",
	"scroll-padding-block-start",

	"scroll-padding-inline",
	"scroll-padding-inline-end",
	"scroll-padding-inline-start",

	"scroll-snap-align",
	"scroll-snap-stop",
	"scroll-snap-type",

	"scroll-timeline",
	"scroll-timeline-axis",
	"scroll-timeline-name",

	"scrollbar-color",
	"scrollbar-gutter",
	"scrollbar-width",

	"shape-image-threshold",
	"shape-margin",
	"shape-outside",
	"tab-size",
	"table-layout",
	"text-align",
	"text-align-last",
	"text-combine-upright",

	"text-decoration",
	"text-decoration-color",
	"text-decoration-line",
	"text-decoration-style",
	"text-decoration-thickness",

	"text-decoration-skip-ink",

	"text-emphasis",
	"text-emphasis-color",
	"text-emphasis-position",
	"text-emphasis-style",
	"text-indent",
	"text-justify",
	"text-orientation",
	"text-overflow",
	"text-rendering",
	"text-shadow",
	"text-size-adjust",
	"text-transform",
	"text-underline-offset",
	"text-underline-position",
	"touch-action",
	"transform",
	"transform-box",
	"transform-origin",
	"transform-style",
	"transition",
	"transition-delay",
	"transition-duration",
	"transition-property",
	"transition-timing-function",
	"translate",
	"unicode-bidi",
	"user-select",
	"vertical-align",
	"view-transition-name",
	"visibility",
	"white-space",
	"widows",
	"width",
	"will-change",
	"word-break",
	"word-spacing",
	"word-wrap",
	"writing-mode",
	"z-index",
	"zoom",
] as const satisfies readonly (keyof CSS.PropertiesHyphen)[];

/* ---------------------------------------------------------------------------------------------- */

export type CSSProperty = (typeof properties)[number];

export { properties };
