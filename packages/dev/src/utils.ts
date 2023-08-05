import type { TokenamiProperty, Config } from '@tokenami/config';

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
export { findProperties };
