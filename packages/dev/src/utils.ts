import type { Theme, TokenamiProperty, Config } from '@tokenami/config';

/* -------------------------------------------------------------------------------------------------
 * getTokens
 * -----------------------------------------------------------------------------------------------*/

type ThemeValues = Exclude<Theme[keyof Theme], string>;

function getRootTokens(values: ThemeValues, prefix: string): Record<string, string> {
  if (!values) return {};
  const entries = Object.entries(values).map(([name, value]) => [`--${prefix}-${name}`, value]);
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * findProperties
 * -----------------------------------------------------------------------------------------------*/

type Alias = string & {};

// an alias can be used for multiple properties
function findProperties(alias: Alias, config: Config) {
  const result = Object.entries(config.aliases || {}).filter(([_, value]) => value.includes(alias));
  return (result.length ? result : [[alias, [alias]]]) as [TokenamiProperty, Alias[]][];
}

/* ---------------------------------------------------------------------------------------------- */

export type { Alias };
export { getRootTokens, findProperties };
