import { type Config } from './config';
import hash from '@emotion/hash';

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
// will match css variable names that start with `--` and optionally include curly brackets
// (for arbitrary values), while excluding those prefixed with `var(`
const tokenPropertyRegex = /(?<!var\()--(?:[^'":{}]+|{[^}]*})+/g;

const TokenProperty = {
  safeParse: (input: unknown) => validate<TokenProperty>(tokenPropertyRegex, input),
};

function tokenProperty(name: string): TokenProperty {
  return `--${name}`;
}

function parsedTokenProperty(name: string): TokenProperty {
  return parseProperty(tokenProperty(name));
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

function parsedVariantProperty(variant: string, name: string): VariantProperty {
  return parseProperty(variantProperty(variant, name));
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

// split on underscores that aren't inside curly brackets (arbitrary selectors)
const propertySplitRegex = /_(?![^{}]*})/;

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
  const responsive = getValidResponsive(firstVariant, config);
  const selector = firstSelector || secondSelector;
  const validVariant = [responsive, selector].filter(Boolean).join('_');
  const variantProp = variantProperty(validVariant, alias);
  if (firstVariant && variantProp !== tokenProperty) return null;
  return { alias, responsive, selector, variant: validVariant };
}

/* -------------------------------------------------------------------------------------------------
 * getValidSelector
 * -----------------------------------------------------------------------------------------------*/

function getValidSelector(selector: string | undefined, config: Config) {
  if (!selector) return;
  const configSelector = config.selectors?.[selector!];
  return (getArbitrarySelector(selector) || configSelector) && selector;
}

/* -------------------------------------------------------------------------------------------------
 * getValidResponsive
 * -----------------------------------------------------------------------------------------------*/

function getValidResponsive(responsive: string | undefined, config: Config) {
  if (!responsive) return;
  const configResponsive = config.responsive?.[responsive!];
  return configResponsive && responsive;
}

/* -------------------------------------------------------------------------------------------------
 * getArbitrarySelector
 * -----------------------------------------------------------------------------------------------*/

function getArbitrarySelector(selector: string | undefined) {
  const [, arbitrarySelector] = selector?.match(/^{(.+)}$/) || [];
  return arbitrarySelector ? decodeColon(arbitrarySelector) : undefined;
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
 * generateClassName
 * -----------------------------------------------------------------------------------------------*/

function generateClassName(properties: Record<string, any>) {
  const entries = Object.entries(properties)
    .map(([property, value]) => [property, String(value)] as const)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  const str = JSON.stringify(entries);
  return `tk-${hash(str)}`;
}

/* -------------------------------------------------------------------------------------------------
 * createLonghandProperty
 * -----------------------------------------------------------------------------------------------*/

function createLonghandProperty(tokenProperty: TokenProperty, cssProperty: string) {
  const parts = getTokenPropertySplit(tokenProperty);
  const aliasRegex = new RegExp(`${parts.alias}$`);
  return tokenProperty.replace(aliasRegex, cssProperty) as TokenProperty;
}

/* -------------------------------------------------------------------------------------------------
 * parseProperty
 * -------------------------------------------------------------------------------------------------
 * escape special chars and replace colons with semi colons:
 * - https://issues.chromium.org/u/1/issues/342857961
 * - colons also break in solidjs
 * -----------------------------------------------------------------------------------------------*/

const escapeSpecialCharsRegex = /[&#.:;>~*[\]=,"'()+{}]/g;

function parseProperty<T extends string>(str: T, options?: { escapeSpecialChars?: boolean }) {
  const { escapeSpecialChars = true } = options || {};
  const noColon = encodeColon(str);
  if (!escapeSpecialChars) return noColon as T;
  return noColon.replace(escapeSpecialCharsRegex, (match) => `\\${match}`) as T;
}

/* -------------------------------------------------------------------------------------------------
 * stringifyProperty
 * -------------------------------------------------------------------------------------------------
 * undo parseProperty
 * -----------------------------------------------------------------------------------------------*/

function stringifyProperty<T extends string>(property: T) {
  return decodeColon(property).replace(/\\/g, '') as T;
}

/* ---------------------------------------------------------------------------------------------- */

const encodeColon = (str: string) => str.replace(/:/g, ';');
const decodeColon = (str: string) => str.replace(/;/g, ':');

/* -------------------------------------------------------------------------------------------------
 * iterateAliasProperties
 * -----------------------------------------------------------------------------------------------*/

function* iterateAliasProperties(
  styles: Record<string, any>,
  config: Pick<Config, 'aliases'>
): Generator<[string, any, { isCalc: boolean; cssProperties: string[] }]> {
  for (const [key, value] of Object.entries(styles)) {
    const tokenProperty = key as TokenProperty;
    const parts = getTokenPropertySplit(tokenProperty);
    const cssProperties = getCSSPropertiesForAlias(parts.alias, config.aliases);
    const isCalc = typeof value === 'number' && value !== 0;
    yield [key, value, { isCalc, cssProperties }];
  }
}

/* -------------------------------------------------------------------------------------------------
 * calcProperty
 * -----------------------------------------------------------------------------------------------*/

const calcProperty = (property: string) => (property + '__calc') as TokenProperty;

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
  parsedTokenProperty,
  parsedVariantProperty,
  createLonghandProperty,
  calcProperty,
  parseProperty,
  stringifyProperty,
  getTokenPropertyName,
  getTokenPropertySplit,
  getTokenPropertyParts,
  getTokenValueParts,
  getArbitrarySelector,
  getCSSPropertiesForAlias,
  generateClassName,
  iterateAliasProperties,
};
