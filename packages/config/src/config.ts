import type { Theme } from '~/theme';
import type { TokenamiProperty } from '~/sheet';
import * as pathe from 'pathe';
import { SHEET_CONFIG } from '~/sheet';

type Validator = (value: unknown, values: string[]) => boolean;

interface Config {
  include: string[];
  exclude?: string[];
  aliases?: Partial<Record<TokenamiProperty, string[]>>;
  theme: Theme;
}

const DEFAULT_PATH = './tokenami.config.js';
const DEFAULT_CONFIG = {
  include: [],
  aliases: {
    'background-color': ['background-color', 'bg-color'],
    'column-gap': ['column-gap', 'gap'],
    'row-gap': ['row-gap', 'gap'],
    'margin-left': ['margin-left', 'ml', 'mx', 'm'],
    'margin-right': ['margin-right', 'mr', 'mx', 'm'],
    'margin-top': ['margin-top', 'mt', 'my', 'm'],
    'margin-bottom': ['margin-bottom', 'mb', 'my', 'm'],
    'padding-left': ['padding-left', 'pl', 'px', 'p'],
    'padding-right': ['padding-right', 'pr', 'px', 'p'],
    'padding-top': ['padding-top', 'pt', 'py', 'p'],
    'padding-bottom': ['padding-bottom', 'pb', 'py', 'p'],
  },
  theme: {
    grid: '1px',
    breakpoints: {},
    colors: {},
    radii: {},
  },
} satisfies Config;

/* -------------------------------------------------------------------------------------------------
 * getConfigPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigPath(cwd: string, path = DEFAULT_PATH) {
  return pathe.join(cwd, path);
}

/* -------------------------------------------------------------------------------------------------
 * getMergedConfig
 * -----------------------------------------------------------------------------------------------*/

interface GetConfigOptions {
  path?: string;
  include?: string[];
}

function mergedConfigs(theirs: Config, opts: GetConfigOptions = {}): Config {
  return {
    ...DEFAULT_CONFIG,
    ...theirs,
    include: opts.include || theirs.include || DEFAULT_CONFIG.include,
    theme: { ...DEFAULT_CONFIG.theme, ...theirs.theme },
  };
}

/* -------------------------------------------------------------------------------------------------
 * getConfigPropertiesForAlias
 * -----------------------------------------------------------------------------------------------*/

// an alias can be used for multiple properties
function getConfigPropertiesForAlias(alias: string, config: Config) {
  const aliases = config.aliases || {};
  const result = Object.entries(aliases).filter(([_, aliases]) => aliases.includes(alias));
  return (result.length ? result : [[alias, [alias]]]) as [TokenamiProperty, string[]][];
}

/* -------------------------------------------------------------------------------------------------
 * getAvailableTokenPropertiesWithVariants
 * -----------------------------------------------------------------------------------------------*/

function getAvailableTokenPropertiesWithVariants(config: Config) {
  const { properties, pseudoClasses } = SHEET_CONFIG;
  const configBreakpoints = Object.keys(config.theme.breakpoints || {});
  const allAliases = Object.values(config.aliases || {}).flat();
  const allProperties = [...properties, ...allAliases] as string[];
  let availableProperties = [];

  for (const prop of allProperties) {
    availableProperties.push(`--${prop}`);
    for (const pseudo of pseudoClasses) {
      availableProperties.push(`--${pseudo.replace(':', '')}_${prop}`);
    }
    for (const breakpoint of configBreakpoints) {
      availableProperties.push(`--${breakpoint}_${prop}`);
    }
  }
  return availableProperties;
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config };
export {
  DEFAULT_PATH,
  getConfigPath,
  mergedConfigs,
  getConfigPropertiesForAlias,
  getAvailableTokenPropertiesWithVariants,
};
