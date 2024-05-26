import { type Config } from './config';

const SPECIAL_CHAR = '!#$%&()*+,./:;<=>?@[\\]^{|}~';
const REGULAR_CHAR = 'A-Za-z0-9_';

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

type TokenProperty<P extends string = string> = `--${P}`;
const tokenPropertyRegex = new RegExp(
  `(?<!var\\()--[${REGULAR_CHAR}${SPECIAL_CHAR}]([${REGULAR_CHAR}${SPECIAL_CHAR}-]+)?`
);

const TokenProperty = {
  safeParse: (input: unknown) => validate<TokenProperty>(tokenPropertyRegex, input),
};

function tokenProperty(name: string): TokenProperty {
  return escapeSpecialChars(`--${name}`);
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
  return escapeSpecialChars(`--${variant}_${name}`);
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

// split on underscores that aren't inside square brackets (arbitrary selectors)
const propertySplitRegex = /_(?![^\[]*\])/;

function getTokenPropertySplit(property: TokenProperty) {
  const name = getTokenPropertyName(property);
  const [alias, ...variants] = name.split(propertySplitRegex).reverse() as [string, ...string[]];
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
  const firstSelector = getValidSelector(firstVariant, config);
  const secondSelector = getValidSelector(secondVariant, config);
  const responsive = config.responsive?.[firstVariant!] && firstVariant;
  const selector = firstSelector || secondSelector;
  const validVariant = [responsive, selector].filter(Boolean).join('_');
  const variantProp = variantProperty(validVariant, alias);
  if (firstVariant && variantProp !== escapeSpecialChars(tokenProperty)) return null;
  return { alias, responsive, selector, variant: validVariant };
}

/* -------------------------------------------------------------------------------------------------
 * getValidSelector
 * -----------------------------------------------------------------------------------------------*/

function getValidSelector(selector: string | undefined, config: Config) {
  if (!selector) return;
  return (getArbitrarySelector(selector) || config.selectors?.[selector!]) && selector;
}

/* -------------------------------------------------------------------------------------------------
 * getArbitrarySelector
 * -----------------------------------------------------------------------------------------------*/

function getArbitrarySelector(selector: string | undefined) {
  const [, arbitrarySelector] = selector?.match(/^\[(.+)\]$/) || [];
  return arbitrarySelector;
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

/* -------------------------------------------------------------------------------------------------
 * escapeSpecialChars
 * -----------------------------------------------------------------------------------------------*/

const escapeSpecialCharsRegex = new RegExp(`[${SPECIAL_CHAR}]`, 'g');

function escapeSpecialChars<T extends string>(str: T) {
  // escape and replace colons with hypens for improved dev tooling exp
  // - there is a bug here https://issues.chromium.org/u/1/issues/342857961 but;
  // - var name colons in `style` attribute can be confusing because colons usually
  //   delimit property/value pairs there
  return str.replace(escapeSpecialCharsRegex, (match) => `\\${match}`).replace(/:/g, '-') as T;
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
  getArbitrarySelector,
  getCSSPropertiesForAlias,
  escapeSpecialChars,
};
