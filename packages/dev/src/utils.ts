import type { Theme, TokenamiProperty, Config } from '@tokenami/config';

/* -------------------------------------------------------------------------------------------------
 * getTokens
 * -----------------------------------------------------------------------------------------------*/

function getTokens(themeProperty: Theme[keyof Theme], prefix: string) {
  return Object.entries(themeProperty).reduce(
    (acc, [name, value]) => ({ ...acc, [`--${prefix}-${name}`]: value }),
    {} as Record<string, string>
  );
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
export { getTokens, findProperties };
