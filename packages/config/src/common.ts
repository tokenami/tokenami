import { type Config } from './config';

/* -------------------------------------------------------------------------------------------------
 * GridProperty
 * -----------------------------------------------------------------------------------------------*/

type GridProperty = '--_grid';
const gridPropertyRegex = /--_grid/;

const GridProperty = {
  safeParse: (input: unknown) => validate<GridProperty>(gridPropertyRegex, input),
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
  safeParse: (input: unknown) => validate<GridValue>(gridValueRegex, input),
};

/* -------------------------------------------------------------------------------------------------
 * TokenProperty
 * -----------------------------------------------------------------------------------------------*/

const charClass = `A-Za-z0-9!#$%&()*+,./:;<=>?@[\\]^_{|}~`;
type TokenProperty<P extends string = string> = `--${P}`;
const tokenPropertyRegex = new RegExp(`(?<!var\\()--[${charClass}]([${charClass}-]+)?`);

const TokenProperty = {
  safeParse: (input: unknown) => validate<TokenProperty>(tokenPropertyRegex, input),
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
  safeParse: (input: unknown) => validate<VariantProperty>(variantPropertyRegex, input),
};

function variantProperty(variant: string, name: string): VariantProperty {
  return `--${variant}_${name}`;
}

/* -------------------------------------------------------------------------------------------------
 * TokenValue
 * -----------------------------------------------------------------------------------------------*/

type TokenValue<TK extends string = string, V extends string = string> = `var(--${TK}_${V})`;
const tokenValueRegex = /var\((--([\w-]+)_([\w-]+))\)/;

const TokenValue = {
  safeParse: (input: unknown) => validate<TokenValue>(tokenValueRegex, input),
};

function tokenValue<TK extends string, N extends string>(themeKey: TK, name: N): TokenValue<TK, N> {
  return `var(--${themeKey}_${name})`;
}

/* -------------------------------------------------------------------------------------------------
 * ArbitraryValue
 * -----------------------------------------------------------------------------------------------*/

type ArbitraryValue = `var(---,${string})`;
const arbitraryValueRegex = /var\(---,(.+)\)/;

const ArbitraryValue = {
  safeParse: (input: unknown) => validate<ArbitraryValue>(arbitraryValueRegex, input),
};

function arbitraryValue(value: string): ArbitraryValue {
  return `var(---, ${value})`;
}

/* -------------------------------------------------------------------------------------------------
 * Validate
 * -----------------------------------------------------------------------------------------------*/

type Validated<T> = { success: true; output: T } | { success: false };

function validate<T>(regex: RegExp, input: unknown): Validated<T> {
  try {
    const [match] = String(input).match(regex) || [];
    if (match) {
      return { success: true, output: match as T };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertyName
 * -----------------------------------------------------------------------------------------------*/

function getTokenPropertyName(property: TokenProperty) {
  const propertyPrefix = tokenProperty('');
  return property.replace(propertyPrefix, '');
}

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertySplit
 * -----------------------------------------------------------------------------------------------*/

function getTokenPropertySplit(property: TokenProperty) {
  const name = getTokenPropertyName(property);
  const [alias, ...variants] = name.split('_').reverse() as [string, ...string[]];
  return { alias, variants: variants.reverse() };
}

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertyParts
 * -----------------------------------------------------------------------------------------------*/

type PropertyParts = {
  alias: string;
  responsive?: string;
  selector?: string;
  variant?: string;
};

function getTokenPropertyParts(tokenProperty: TokenProperty, config: Config): PropertyParts | null {
  const { alias, variants } = getTokenPropertySplit(tokenProperty);
  const [firstVariant, secondVariant] = variants;
  const firstSelector = config.selectors?.[firstVariant!] && firstVariant;
  const secondSelector = config.selectors?.[secondVariant!] && secondVariant;
  const responsive = config.responsive?.[firstVariant!] && firstVariant;
  const selector = firstSelector || secondSelector;
  const validVariant = [responsive, selector].filter(Boolean).join('_');
  if (firstVariant && variantProperty(validVariant, alias) !== tokenProperty) return null;
  return { alias, responsive, selector, variant: validVariant };
}

/* -------------------------------------------------------------------------------------------------
 * getTokenValueParts
 * -----------------------------------------------------------------------------------------------*/

function getTokenValueParts(tokenValue: TokenValue) {
  type Parts = [string, string, string, string];
  const [, property, themeKey, token] = tokenValue.split(tokenValueRegex) as Parts;
  return { property, themeKey, token };
}

/* -------------------------------------------------------------------------------------------------
 * getCSSPropertiesForAlias
 * -------------------------------------------------------------------------------------------------
 * an alias can be used for multiple CSS properties e.g. `px` can apply to `padding-left`
 * and `padding-right`, so this gets an array of CSS properties for a given alias.
 * -----------------------------------------------------------------------------------------------*/

function getCSSPropertiesForAlias(alias: string, aliases: Config['aliases']): string[] {
  return (aliases as any)?.[alias] || [alias];
}

/* ---------------------------------------------------------------------------------------------- */

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
  getTokenPropertySplit,
  getTokenPropertyParts,
  getTokenValueParts,
  getCSSPropertiesForAlias,
};
