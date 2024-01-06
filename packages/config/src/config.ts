import * as v from 'valibot';
import * as Supports from './supports';

function tokenProperty(name: string): TokenProperty {
  return `--${name}`;
}

function variantProperty(variant: string, name: string): TokenProperty {
  return `--${variant}_${name}`;
}

function tokenValue<TK extends string, N extends string>(themeKey: TK, name: N): TokenValue<TK, N> {
  return `var(--${themeKey}_${name})`;
}

function arbitraryValue(value: string): ArbitraryValue {
  return `var(---,${value})`;
}

const tokenPropertyRegex = /(?<!var\()--((\w)([\w-]+)?)/;
const variantPropertyRegex = /(?<!var\()--((\w)([\w-]+)_([\w-]+))/;
const tokenValueRegex = /var\(--([\w-]+)_([\w-]+)\)/;
const aritraryValueRegex = /var\(---,(.+)\)/;

type GridValue = v.Output<typeof gridValueSchema>;
const gridValueSchema = v.number();
const GridValue = { safeParse: (input: unknown) => v.safeParse(gridValueSchema, input) };

type TokenProperty<P extends string = string> = `--${P}`;
const tokenPropertyRegexSchema = v.regex(tokenPropertyRegex);
const tokenPropertySchema = v.string([tokenPropertyRegexSchema]) as v.StringSchema<TokenProperty>;
const TokenProperty = { safeParse: (input: unknown) => v.safeParse(tokenPropertySchema, input) };

type VariantProperty<P extends string = string, V extends string = string> = `--${V}_${P}`;
const variantPropertyRegexSchema = v.regex(variantPropertyRegex);
const variantPropertySchema = v.string([
  variantPropertyRegexSchema,
]) as v.StringSchema<VariantProperty>;
const VariantProperty = {
  safeParse: (input: unknown) => v.safeParse(variantPropertySchema, input),
};

type TokenValue<TK extends string = string, V extends string = string> = `var(--${TK}_${V})`;
const tokenValueRegexSchema = v.regex(tokenValueRegex);
const tokenValueSchema = v.string([tokenValueRegexSchema]) as v.StringSchema<TokenValue>;
const TokenValue = { safeParse: (input: unknown) => v.safeParse(tokenValueSchema, input) };

type ArbitraryValue = `var(---,${string})`;
const ArbitraryValue = v.string([v.regex(aritraryValueRegex)]);

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

type Exact<T, V extends T> = Exclude<keyof V, keyof T> extends never ? V : T;

interface Config
  extends DeepReadonly<{
    include: string[];
    exclude?: string[];
    grid?: string;
    responsive?: { [atRule: string]: string };
    selectors?: { [name: string]: string | string[] };
    keyframes?: { [name: string]: { [step: string]: { [cssProperty: string]: string } } };
    aliases?: Aliases;
    theme: Theme;
    properties?: Partial<Record<Supports.CSSProperty, PropertiesOptions>>;
  }> {}

/* -------------------------------------------------------------------------------------------------
 * createConfig
 * -----------------------------------------------------------------------------------------------*/

const createConfig = <T extends Config>(obj: Exact<Config, T>): DeepReadonly<T> => {
  return obj as DeepReadonly<T>;
};

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertyName
 * -----------------------------------------------------------------------------------------------*/

function getTokenPropertyName(tokenProperty: TokenProperty) {
  return tokenProperty.replace(tokenPropertyRegex, '$1');
}

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertyParts
 * -----------------------------------------------------------------------------------------------*/

type Parts = {
  name: string;
  alias: string;
  responsive?: string;
  selector?: string;
};

function getTokenPropertyParts(tokenProperty: TokenProperty, config: Config): Parts | null {
  const name = getTokenPropertyName(tokenProperty);
  const [alias, ...variants] = name.split('_').reverse() as [string, ...string[]];
  const responsiveVariants = variants.filter((variant) => config.responsive?.[variant]);
  const selectorVariants = variants.filter((variant) => config.selectors?.[variant]);
  const validVariants = responsiveVariants.concat(selectorVariants);
  const isValidResponsive = responsiveVariants.length <= 1;
  // we only allow 1 selector to enforce custom selectors for chained selectors
  const isValidSelector = selectorVariants.length <= 1;
  const isValidVariants = variants.length === validVariants.length;
  const isValid = isValidResponsive && isValidSelector && isValidVariants;
  const [responsive] = responsiveVariants;
  const [selector] = selectorVariants;
  return isValid ? { name, alias, responsive, selector } : null;
}

/* -------------------------------------------------------------------------------------------------
 * getTokenValueParts
 * -----------------------------------------------------------------------------------------------*/

function getTokenValueParts(tokenValue: TokenValue) {
  const [, key, token] = tokenValue.split(tokenValueRegex) as [string, string, string];
  return { themeKey: key, token };
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config, Theme, Aliases };
export {
  TokenProperty,
  VariantProperty,
  TokenValue,
  GridValue,
  ArbitraryValue,
  //
  tokenProperty,
  variantProperty,
  tokenValue,
  arbitraryValue,
  getTokenPropertyName,
  getTokenPropertyParts,
  getTokenValueParts,
  createConfig,
};
