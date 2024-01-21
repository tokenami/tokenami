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

const tokenPropertyRegex = /(?<!var\()--([a-z]([a-z-]+)?)/;
const variantPropertyRegex = /(?<!var\()--((\w)([\w-]+)_([\w-]+))/;
const tokenValueRegex = /var\((--([\w-]+)_([\w-]+))\)/;
const aritraryValueRegex = /var\(---,(.+)\)/;
const gridValueRegex = /^\d+/;

type GridValue = number;
const gridValueRegexSchema = v.regex(gridValueRegex);
const gridValueSchema = v.string([gridValueRegexSchema]);
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
const arbitraryValueRegexSchema = v.regex(aritraryValueRegex);
const arbitraryValueSchema = v.string([
  arbitraryValueRegexSchema,
]) as v.StringSchema<ArbitraryValue>;
const ArbitraryValue = { safeParse: (input: unknown) => v.safeParse(arbitraryValueSchema, input) };

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

type PropertyParts = {
  name: string;
  alias: string;
  responsive?: string;
  selector?: string;
  variant?: string;
};

function getTokenPropertyParts(tokenProperty: TokenProperty, config: Config): PropertyParts | null {
  const name = getTokenPropertyName(tokenProperty);
  const [alias, ...variants] = name.split('_').reverse() as [string, ...(string | undefined)[]];
  const [v1, v2, ...invalidVariants] = variants.reverse();
  const responsive = config.responsive?.[v1!] && v1;
  const selector = (config.selectors?.[v1!] && v1) || (config.selectors?.[v2!] && v2);
  const hasInvalidVariant = v1 && !responsive && !selector;
  const variant = [responsive, selector].filter(Boolean).join('_');
  if (invalidVariants.length || hasInvalidVariant) return null;
  return { name, alias, responsive, selector, variant };
}

/* -------------------------------------------------------------------------------------------------
 * getTokenValueParts
 * -----------------------------------------------------------------------------------------------*/

function getTokenValueParts(tokenValue: TokenValue) {
  type Parts = [string, string, string, string];
  const [, property, themeKey, token] = tokenValue.split(tokenValueRegex) as Parts;
  return { property, themeKey, token };
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
