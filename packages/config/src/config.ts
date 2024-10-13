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

type ThemeValues = Record<string, string | number>;
type Theme = { [themeKey in ThemeKey]?: ThemeValues };
type ThemeMode<T = Theme> = { [mode: string]: T };
type ThemeModes<T = Theme> = { modes?: ThemeMode<T> };
type ThemeConfig = Theme | ThemeModes;
type Aliases = Record<string, readonly CSSProperty[]>;
type PropertiesOptions = readonly ('grid' | ThemeKey)[];
type Selector = string | string[];

interface Config {
  include: string[];
  exclude?: string[];
  grid?: string;
  globalStyles?: Record<string, CSS.Properties>;
  responsive?: { [atRule: string]: string };
  selectors?: { [name: string]: Selector };
  keyframes?: { [name: string]: { [step: string]: CSS.Properties } };
  aliases?: Aliases;
  themeSelector?: (mode: string) => Selector;
  theme: ThemeConfig;
  properties?: Partial<Record<CSSProperty | (string & {}), PropertiesOptions>>;
}

/* -------------------------------------------------------------------------------------------------
 * createConfig
 * -----------------------------------------------------------------------------------------------*/

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type ExactConfig<Shape, T> = T extends Shape
  ? keyof T extends keyof Shape
    ? keyof Shape extends keyof T
      ? T
      : Shape
    : Shape
  : Shape;

type MatchingThemeModes<M> = M extends ThemeMode
  ? { theme: ThemeModes<UnionToIntersection<M[keyof M]>> }
  : {};

function createConfig<T>(
  obj: ExactConfig<Config, T> & (T extends Config ? MatchingThemeModes<T['theme']['modes']> : {})
): DeepReadonly<T> {
  return obj as any as DeepReadonly<T>;
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config, DeepReadonly };
export type { Theme, ThemeModes, Aliases };
export type { CSSProperties, CSSProperty };
export { createConfig };
