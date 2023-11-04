import { z } from 'zod';
import * as Supports from './supports';

const tokenPropertyRegex = /---([a-z]+)/;
const tokenValueRegex = /var\(---([\w-]+)-([\w-]+)\)/;
const aritraryValueRegex = /var\(---,(.+)\)/;

type GridValue = z.infer<typeof GridValue>;
const GridValue = z.number();

type TokenProperty<P extends string = string> = `---${P}`;
const TokenProperty = z.string().refine((value) => {
  return tokenPropertyRegex.test(value);
});

type TokenValue<TK extends string = string, V extends string = string> = `var(---${TK}-${V})`;
const TokenValue = z.string().refine((value) => {
  return tokenValueRegex.test(value);
});

type ArbitraryValue = string & {};
const ArbitraryValue = z.string().refine((value) => {
  return aritraryValueRegex.test(value);
});

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

type Declaration<P extends string, V> = { [key in `${P}`]?: V };
type VariantDeclaration<P extends string, M extends string, V> = Declaration<`---${P}`, V> &
  Declaration<`---${M}_${P}`, V> &
  Declaration<`---${string}_${P}`, V>;

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
type Aliases = Record<string, (Supports.CSSProperty | (string & {}))[]>;
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

export type { Config, Theme, Aliases, VariantDeclaration };
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
