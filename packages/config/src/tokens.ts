import type { Config } from '~/config';
import { ALL_PROPERTIES, ALL_PSEUDO } from '~/sheet';

/* -------------------------------------------------------------------------------------------------
 * getValidTokensFromConfig
 * -----------------------------------------------------------------------------------------------*/

function getAvailableTokenamiTokens(config: Config) {
  const configBreakpoints = Object.keys(config.theme.breakpoints);
  const allAliases = Object.values(config.aliases || {}).flat();
  const allProperties = [...ALL_PROPERTIES, ...allAliases];
  const tokens = allProperties.map((prop) => {
    const pseudoTokens = ALL_PSEUDO.map((pseudo) => `--${pseudo}_${prop}`);
    const bpTokens = configBreakpoints.map((breakpoint) => `--${breakpoint}_${prop}`);
    return [`--${prop}`, ...pseudoTokens, ...bpTokens];
  });
  return tokens.flat();
}

/* ---------------------------------------------------------------------------------------------- */

export { getAvailableTokenamiTokens };
