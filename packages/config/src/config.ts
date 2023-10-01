import { z } from 'zod';
import * as CSS from 'csstype';
import * as Supports from './supports';

const tokenPropertyRegex = /---([a-z]+)/;
const tokenValueRegex = /var\(---([\w-]+)-([\w-]+)\)/;
const aritraryValueRegex = /var\(---,(.+)\)/;

const GridValue = z.number();

const TokenProperty = z.string().refine((value) => {
  return tokenPropertyRegex.test(value);
});

const TokenValue = z.string().refine((value) => {
  return tokenValueRegex.test(value);
});

const ArbitraryValue = z.string().refine((value) => {
  return aritraryValueRegex.test(value);
});

type GridValue = z.infer<typeof GridValue>;
type TokenProperty<P extends string = string> = `---${P}`;
type TokenValue<TK extends string = string, V extends string = string> = `var(---${TK}-${V})`;
type ArbitraryValue = string & {};

function tokenProperty(name: string): TokenProperty {
  return `---${name}`;
}

function variantProperty(variant: string, name: string): TokenProperty {
  return `---${variant}_${name}`;
}

function tokenValue<TK extends string, N extends string>(themeKey: TK, name: N): TokenValue<TK, N> {
  return `var(---${themeKey}-${name})`;
}

function arbitraryValue(value: string): ArbitraryValue {
  return `var(---,${value})`;
}

type S<P extends string, V> = { [key in `${P}`]?: V };
type Selector<P extends string, M extends string, V> = S<`---${P}`, V> &
  S<`---${M}_${P}`, V> &
  S<`---${string}_${P}`, V>;

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
type Theme = Partial<Record<ThemeKey, ThemeValues>>;
type Aliases = Partial<Record<keyof CSS.StandardLonghandPropertiesHyphen, string[]>>;
type PropertiesOptions = readonly ('grid' | ThemeKey)[];

interface Config {
  include: string[];
  exclude?: string[];
  media?: { [name: string]: string | number };
  keyframes?: { [name: string]: { [step: string]: { [cssProperty: string]: string } } };
  aliases?: Aliases;
  grid: string;
  theme: Theme;
  properties?: Partial<Record<Supports.CSSProperty, PropertiesOptions>>;
}

/* ---------------------------------------------------------------------------------------------- */

function getTokenPropertyName(tokenProperty: TokenProperty) {
  return tokenProperty.replace(tokenPropertyRegex, '$1');
}

export type { Config, Theme, Aliases, Selector };
export {
  TokenProperty,
  TokenValue,
  GridValue,
  ArbitraryValue,
  //
  tokenProperty,
  variantProperty,
  tokenValue,
  arbitraryValue,
  getTokenPropertyName,
};
