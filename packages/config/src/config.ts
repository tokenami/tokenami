import * as v from 'valibot';
import * as Supports from './supports';

/* -------------------------------------------------------------------------------------------------
 * GridProperty
 * -----------------------------------------------------------------------------------------------*/

type GridProperty = '--_grid';
const gridPropertyRegex = /--_grid/;

const GridProperty = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(gridPropertyRegex)]);
    v.safeParse(schema, input);
  },
};

function gridProperty(): GridProperty {
  return `--_grid`;
}

/* -------------------------------------------------------------------------------------------------
 * GridValue
 * -----------------------------------------------------------------------------------------------*/

type GridValue = number;
const gridValueRegex = /^\d+/;

const GridValue = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(gridValueRegex)]);
    v.safeParse(schema, input);
  },
};

/* -------------------------------------------------------------------------------------------------
 * TokenProperty
 * -----------------------------------------------------------------------------------------------*/

type TokenProperty<P extends string = string> = `--${P}`;
const tokenPropertyRegex = /(?<!var\()--(\w([\w-]+)?)/;

const TokenProperty = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(tokenPropertyRegex)]) as v.StringSchema<TokenProperty>;
    return v.safeParse(schema, input);
  },
};

function tokenProperty(name: string): TokenProperty {
  return `--${name}`;
}

/* -------------------------------------------------------------------------------------------------
 * VariantProperty
 * -----------------------------------------------------------------------------------------------*/

type VariantProperty<P extends string = string, V extends string = string> = `--${V}_${P}`;
const variantPropertyRegex = /(?<!var\()--((\w)([\w-]+)_([\w-]+))/;

const VariantProperty = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(variantPropertyRegex)]) as v.StringSchema<VariantProperty>;
    return v.safeParse(schema, input);
  },
};

function variantProperty(variant: string, name: string): TokenProperty {
  return `--${variant}_${name}`;
}

/* -------------------------------------------------------------------------------------------------
 * TokenValue
 * -----------------------------------------------------------------------------------------------*/

type TokenValue<TK extends string = string, V extends string = string> = `var(--${TK}_${V})`;
const tokenValueRegex = /var\((--([\w-]+)_([\w-]+))\)/;

const TokenValue = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(tokenValueRegex)]) as v.StringSchema<TokenValue>;
    return v.safeParse(schema, input);
  },
};

function tokenValue<TK extends string, N extends string>(themeKey: TK, name: N): TokenValue<TK, N> {
  return `var(--${themeKey}_${name})`;
}

/* -------------------------------------------------------------------------------------------------
 * ArbitraryValue
 * -----------------------------------------------------------------------------------------------*/

type ArbitraryValue = `var(---,${string})`;
const aritraryValueRegex = /var\(---,(.+)\)/;

const ArbitraryValue = {
  safeParse: (input: unknown) => {
    const schema = v.string([v.regex(aritraryValueRegex)]) as v.StringSchema<ArbitraryValue>;
    return v.safeParse(schema, input);
  },
};

function arbitraryValue(value: string): ArbitraryValue {
  return `var(---,${value})`;
}

/* -------------------------------------------------------------------------------------------------
 * Config
 * -----------------------------------------------------------------------------------------------*/

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
  const selectorVariant1 = config.selectors?.[v1!] && !v2 ? v1 : undefined;
  const selectorVariant2 = responsive && config.selectors?.[v2!] && v2;
  const selector = selectorVariant1 || selectorVariant2;
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
  GridProperty,
  TokenProperty,
  VariantProperty,
  TokenValue,
  GridValue,
  ArbitraryValue,
  //
  gridProperty,
  tokenProperty,
  variantProperty,
  tokenValue,
  arbitraryValue,
  getTokenPropertyName,
  getTokenPropertyParts,
  getTokenValueParts,
  createConfig,
};
