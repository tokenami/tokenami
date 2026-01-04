import type * as CSS from 'csstype';

// CSS.PropertiesHyphen without vendor and obsolete properties
interface CSSProperties<TLength = (string & {}) | 0, TTime = string & {}>
  extends CSS.StandardPropertiesHyphen<TLength, TTime>,
    CSS.SvgPropertiesHyphen<TLength, TTime> {}

interface CSSPropertiesWithVendor<TLength = (string & {}) | 0, TTime = string & {}>
  extends CSSProperties<TLength, TTime>,
    CSS.VendorPropertiesHyphen<TLength, TTime> {}

type CSSProperty = keyof CSSProperties;

type Theme = { [themeKey: string]: { [themeToken: string]: string | number } };
type ThemeMode<T = Theme> = { [mode: string]: T };
type ThemeModes<T = Theme> = { root: Theme; modes: ThemeMode<T> };
type ThemeConfig = Theme | ThemeModes;
type Responsive = { [atRule: string]: string };
type Selector = string | string[];
type Selectors = { [name: string]: Selector };
type Aliases = Record<string, (keyof CSSPropertiesWithVendor)[]>;
type Properties = Partial<Record<CSSProperty | (string & {}), string[]>>;
type CustomProperties = Record<string, string[]>;

type ExactTheme<T> = T extends ThemeModes
  ? { [K in keyof T]: K extends 'root' | 'modes' ? T[K] : never }
  : {};

type ExactThemeKey<T> =
  | ('grid' | 'number')
  | (T extends ThemeModes
      ? keyof T['modes'][keyof T['modes']] | keyof T['root']
      : T extends Theme
      ? keyof T
      : string);

type ExactThemeModes<M> = M extends ThemeMode ? ThemeModes<UnionToIntersection<M[keyof M]>> : {};

type ExactProperties<P, T> = Partial<Record<keyof P, ExactThemeKey<T>[]>>;

interface Config<
  T extends ThemeConfig = ThemeConfig,
  P extends Properties = Properties,
  C extends CustomProperties = CustomProperties
> {
  include: string[];
  exclude?: string[];
  grid?: string;
  globalStyles?: Record<string, CSS.Properties>;
  keyframes?: { [name: string]: { [step: string]: CSS.Properties } };
  themeSelector: (mode: string) => Selector;
  theme: T & ExactTheme<T> & ExactThemeModes<T['modes']>;
  responsive?: Responsive;
  selectors?: Selectors;
  aliases?: Aliases;
  properties?: P & ExactProperties<P, T>;
  customProperties?: C & ExactProperties<C, T>;
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

function createConfig<
  C extends Config,
  T extends ThemeConfig,
  P extends Properties,
  CP extends CustomProperties
>(config: ExactConfig<Config, C> & Config<T, P, CP>): C {
  return config as any;
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config };
export type { Theme, ThemeModes, Aliases, Selector };
export type { CSSProperties, CSSProperty };
export { createConfig };
