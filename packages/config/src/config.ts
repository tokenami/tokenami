import type { Theme } from '~/theme';
import type { TokenamiProperty } from '~/sheet';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as pathe from 'pathe';

const require = createRequire(import.meta.url);

function reloadModule(moduleName: string) {
  delete require.cache[require.resolve(moduleName)];
  return require(moduleName);
}

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
 * getConfig
 * -----------------------------------------------------------------------------------------------*/

interface GetConfigOptions {
  path?: string;
  include?: string[];
}

async function getConfig(cwd: string, opts: GetConfigOptions = {}): Promise<Config> {
  const configPath = getConfigPath(cwd, opts.path);
  const theirs = fs.existsSync(configPath) ? await reloadModule(configPath) : {};
  return {
    ...DEFAULT_CONFIG,
    ...theirs,
    include: opts.include || theirs.include || DEFAULT_CONFIG.include,
    theme: { ...DEFAULT_CONFIG.theme, ...theirs.theme },
  };
}

/* ---------------------------------------------------------------------------------------------- */

export type { Config };
export { DEFAULT_PATH, getConfigPath, getConfig };
