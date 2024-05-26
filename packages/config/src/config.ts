import type * as CSS from 'csstype';

// CSS.PropertiesHyphen without vendor and obsolete properties
interface CSSProperties<TLength = (string & {}) | 0, TTime = string & {}>
  extends CSS.StandardPropertiesHyphen<TLength, TTime>,
    CSS.SvgPropertiesHyphen<TLength, TTime> {}

type CSSProperty = keyof CSSProperties;

type DeepReadonly<T> = T extends Function | any[]
  ? T
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };

type ThemeKey =
  | 'alpha'
  | 'border'
  | 'color'
  | 'ease'
  | 'font-size'
  | 'leading'
  | 'line-style'
  | 'radii'
  | 'size'
  | 'shadow'
  | 'tracking'
  | 'transition'
  | 'weight'
  | 'z'
  | (string & {});

type ThemeValues = Record<string, string>;
type Theme = { [themeKey in ThemeKey]?: ThemeValues };
type ThemeMode<T = Theme> = { [mode: string]: T };
type ThemeModes<T = Theme> = { modes?: ThemeMode<T> };
type ThemeConfig = Theme | ThemeModes;
type Aliases = Record<string, readonly CSSProperty[]>;
type PropertiesOptions = readonly ('grid' | ThemeKey)[];

interface Config {
  include: string[];
  exclude?: string[];
  grid?: string;
  globalStyles?: Record<string, CSS.Properties>;
  responsive?: { [atRule: string]: string };
  selectors?: { [name: string]: string | string[] };
  keyframes?: { [name: string]: { [step: string]: CSS.Properties } };
  aliases?: Aliases;
  themeSelector?: (mode: string) => string;
  theme: ThemeConfig;
  properties?: Partial<Record<CSSProperty, PropertiesOptions>>;
}

const defaultConfig = {
  include: [],
  grid: '0.25rem',
  responsive: {},
  themeSelector: (mode) => (mode === 'root' ? ':root' : `.theme-${mode}`),
  theme: {},
  aliases: {},
  selectors: {
    after: '&::after',
    before: '&::before',
    even: '&:nth-child(even)',
    odd: '&:nth-child(odd)',
    'first-child': '&:first-child',
    'last-child': '&:last-child',
    placeholder: '&::placeholder',
    hover: '&:hover',
    focus: '&:focus',
    'focus-visible': '&:focus-visible',
    'focus-within': '&:focus-within',
    active: '&:active',
    disabled: '&:disabled',
  },
  properties: {
    'accent-color': ['color'],
    animation: ['anim'],
    'animation-timing-function': ['ease'],
    background: ['color', 'surface'],
    'background-color': ['color'],
    'background-image': ['surface'],
    'background-position': ['grid'],
    'background-position-x': ['grid'],
    'background-position-y': ['grid'],
    'block-size': ['grid', 'size'],
    border: ['border'],
    'border-block': ['border'],
    'border-block-color': ['color'],
    'border-block-end': ['border'],
    'border-block-end-color': ['color'],
    'border-block-end-style': ['line-style'],
    'border-block-start': ['border'],
    'border-block-start-color': ['color'],
    'border-block-start-style': ['line-style'],
    'border-block-style': ['line-style'],
    'border-bottom': ['border'],
    'border-bottom-color': ['color'],
    'border-bottom-left-radius': ['radii'],
    'border-bottom-right-radius': ['radii'],
    'border-bottom-style': ['line-style'],
    'border-color': ['color'],
    'border-end-end-radius': ['radii'],
    'border-end-start-radius': ['radii'],
    'border-inline': ['border'],
    'border-inline-color': ['color'],
    'border-inline-end': ['border'],
    'border-inline-end-color': ['color'],
    'border-inline-end-style': ['line-style'],
    'border-inline-start': ['border'],
    'border-inline-start-color': ['color'],
    'border-inline-start-style': ['line-style'],
    'border-inline-style': ['line-style'],
    'border-left': ['border'],
    'border-left-color': ['color'],
    'border-left-style': ['line-style'],
    'border-radius': ['radii'],
    'border-right': ['border'],
    'border-right-color': ['color'],
    'border-right-style': ['line-style'],
    'border-start-end-radius': ['radii'],
    'border-start-start-radius': ['radii'],
    'border-style': ['line-style'],
    'border-top': ['border'],
    'border-top-color': ['color'],
    'border-top-left-radius': ['radii'],
    'border-top-right-radius': ['radii'],
    'border-top-style': ['line-style'],
    bottom: ['grid'],
    'box-shadow': ['shadow'],
    'caret-color': ['color'],
    color: ['color'],
    'column-gap': ['grid'],
    'column-rule-color': ['color'],
    'column-rule-width': ['grid'],
    'column-width': ['grid', 'size'],
    fill: ['color'],
    'flex-basis': ['grid', 'size'],
    'font-family': ['font'],
    'font-size': ['font-size'],
    'font-weight': ['weight'],
    gap: ['grid'],
    height: ['grid', 'size'],
    'inline-size': ['grid', 'size'],
    inset: ['grid'],
    'inset-block': ['grid'],
    'inset-block-end': ['grid'],
    'inset-block-start': ['grid'],
    'inset-inline': ['grid'],
    'inset-inline-end': ['grid'],
    'inset-inline-start': ['grid'],
    left: ['grid'],
    'letter-spacing': ['tracking'],
    'line-height': ['leading'],
    margin: ['grid'],
    'margin-block': ['grid'],
    'margin-block-end': ['grid'],
    'margin-block-start': ['grid'],
    'margin-bottom': ['grid'],
    'margin-inline': ['grid'],
    'margin-inline-end': ['grid'],
    'margin-inline-start': ['grid'],
    'margin-left': ['grid'],
    'margin-right': ['grid'],
    'margin-top': ['grid'],
    'max-block-size': ['grid', 'size'],
    'max-height': ['grid', 'size'],
    'max-inline-size': ['grid', 'size'],
    'max-width': ['grid', 'size'],
    'min-block-size': ['grid', 'size'],
    'min-height': ['grid', 'size'],
    'min-inline-size': ['grid', 'size'],
    'min-width': ['grid', 'size'],
    opacity: ['alpha'],
    'outline-color': ['color'],
    padding: ['grid'],
    'padding-block': ['grid'],
    'padding-block-end': ['grid'],
    'padding-block-start': ['grid'],
    'padding-bottom': ['grid'],
    'padding-inline': ['grid'],
    'padding-inline-end': ['grid'],
    'padding-inline-start': ['grid'],
    'padding-left': ['grid'],
    'padding-right': ['grid'],
    'padding-top': ['grid'],
    right: ['grid'],
    'row-gap': ['grid'],
    'scroll-margin': ['grid'],
    'scroll-margin-bottom': ['grid'],
    'scroll-margin-left': ['grid'],
    'scroll-margin-right': ['grid'],
    'scroll-margin-top': ['grid'],
    'scroll-padding': ['grid'],
    'scroll-padding-bottom': ['grid'],
    'scroll-padding-left': ['grid'],
    'scroll-padding-right': ['grid'],
    'scroll-padding-top': ['grid'],
    stroke: ['color'],
    'text-decoration-color': ['color'],
    'text-shadow': ['shadow'],
    top: ['grid'],
    transition: ['transition'],
    'transition-timing-function': ['ease'],
    width: ['grid', 'size'],
    'z-index': ['z'],
  },
} satisfies Config;

type DefaultConfig = typeof defaultConfig;

/* -------------------------------------------------------------------------------------------------
 * createConfig
 * -----------------------------------------------------------------------------------------------*/

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type Exact<T, V extends T> = Exclude<keyof V, keyof T> extends never ? V : T;
type MatchingThemeModes<M> = M extends ThemeMode
  ? { theme: ThemeModes<UnionToIntersection<M[keyof M]>> }
  : {};

function createConfig<T extends Config>(
  obj: Exact<Config, T> & MatchingThemeModes<T['theme']['modes']>
): Omit<DefaultConfig, keyof DeepReadonly<T>> & DeepReadonly<T> {
  const readonlyConfig = obj as any as DeepReadonly<T>;
  return { ...defaultConfig, ...readonlyConfig };
}

/* ---------------------------------------------------------------------------------------------- */

export type { DefaultConfig, Config, DeepReadonly };
export type { Theme, ThemeModes, Aliases };
export type { CSSProperties, CSSProperty };
export { defaultConfig, createConfig };
