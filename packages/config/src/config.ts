import type * as CSS from 'csstype';

// CSS.PropertiesHyphen without vendor and obsolete properties
interface CSSProperties<TLength = (string & {}) | 0, TTime = string & {}>
  extends CSS.StandardPropertiesHyphen<TLength, TTime>,
    CSS.SvgPropertiesHyphen<TLength, TTime> {}

type CSSProperty = keyof CSSProperties;

type Theme = { [themeKey: string]: { [themeToken: string]: string | number } };
type ThemeMode<T = Theme> = { [mode: string]: T };
type ThemeModes<T = Theme> = { root: Theme; modes: ThemeMode<T> };
type ThemeConfig = Theme | ThemeModes;
type Responsive = { [atRule: string]: string };
type Selector = string | string[];
type Selectors = { [name: string]: Selector };
type Aliases = Record<string, readonly CSSProperty[]>;

type Property = CSSProperty | string;
type Properties<K extends Property = Property, T = ThemeConfig> = Record<
  K,
  Array<'grid' | 'number' | ThemeKey<T>>
>;

type ThemeKey<T = ThemeConfig> = T extends ThemeModes
  ? keyof T['modes'][keyof T['modes']] | keyof T['root']
  : keyof T;

type ThemeError = "Move root theme inside 'root' object when using modes";
type ExactTheme<T> = T extends ThemeModes
  ? { [K in keyof T]: K extends 'root' | 'modes' ? T[K] : ThemeError }
  : {};

interface Config<
  T extends ThemeConfig = ThemeConfig,
  R extends Responsive = Responsive,
  S extends Selectors = Selectors,
  A extends Aliases = Aliases,
  P extends Properties = Properties
> {
  include: string[];
  exclude?: string[];
  grid?: string;
  globalStyles?: Record<string, CSS.Properties>;
  keyframes?: { [name: string]: { [step: string]: CSS.Properties } };
  themeSelector: (mode: string) => Selector;
  theme: T & ExactTheme<T>;
  responsive?: R;
  selectors?: S;
  aliases?: A;
  properties?: P & (keyof P extends string ? Properties<keyof P, T> : never);
}
/* -------------------------------------------------------------------------------------------------
 * createConfig
 * -----------------------------------------------------------------------------------------------*/

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type MatchThemeModes<M> = M extends ThemeMode
  ? { theme: ThemeModes<UnionToIntersection<M[keyof M]>> }
  : {};

function createConfig<
  T extends ThemeConfig,
  R extends Responsive,
  S extends Selectors,
  A extends Aliases,
  P extends Properties
>(
  config: Config<T, R, S, A, P> & MatchThemeModes<Config<T, R, S, A, P>['theme']['modes']>
): Config<T, R, S, A, P> {
  return config;
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config };
export type { Theme, ThemeModes, Aliases };
export type { CSSProperties, CSSProperty };
export { createConfig };
