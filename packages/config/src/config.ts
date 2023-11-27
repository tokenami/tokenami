import { z } from 'zod';
import * as Supports from './supports';

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

const tokenPropertyRegex = /---([\w-]+)/;
const variantPropertyRegex = /---([\w]+)_[\w-]+/;
const tokenValueRegex = /var\(---([\w]+)-([\w-]+)\)/;
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

type ArbitraryValue = `var(---,${string})`;
const ArbitraryValue = z.string().refine((value) => {
  return aritraryValueRegex.test(value);
});

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
type Aliases = Record<string, readonly (Supports.CSSProperty | (string & {}))[]>;
type PropertiesOptions = readonly ('grid' | ThemeKey)[];

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

interface Config
  extends DeepReadonly<{
    include: string[];
    exclude?: string[];
    media?: { [name: string]: string };
    keyframes?: { [name: string]: { [step: string]: { [cssProperty: string]: string } } };
    aliases?: Aliases;
    grid: string;
    theme: Theme;
    properties?: Partial<Record<Supports.CSSProperty, PropertiesOptions>>;
  }> {}

const createTokenamiConfig = <T extends Config>(obj: T): DeepReadonly<T> => {
  return obj as DeepReadonly<T>;
};

/* ---------------------------------------------------------------------------------------------- */

function getTokenPropertyName(tokenProperty: TokenProperty) {
  return tokenProperty.replace(tokenPropertyRegex, '$1');
}

function getTokenPropertyVariant(tokenProperty: TokenProperty) {
  const [, variant] = tokenProperty.split(variantPropertyRegex);
  return variant;
}

function getTokenValueParts(tokenValue: TokenValue) {
  const [, key, token] = tokenValue.split(tokenValueRegex);
  return key && token ? { themeKey: key, token } : undefined;
}

export type { Config, Theme, Aliases };
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
  getTokenPropertyVariant,
  getTokenValueParts,
  createTokenamiConfig,
};
