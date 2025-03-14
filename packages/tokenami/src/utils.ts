import * as Tokenami from '@tokenami/config';
import createJiti from 'jiti';
import { transform } from 'sucrase';
import * as pathe from 'pathe';
import * as fs from 'fs';
import { supportedProperties } from './supports';

const DEFAULT_PATHS = {
  js: './.tokenami/tokenami.config.js',
  ts: './.tokenami/tokenami.config.ts',
  cjs: './.tokenami/tokenami.config.cjs',
  mjs: './.tokenami/tokenami.config.mjs',
};

type ProjectType = keyof typeof DEFAULT_PATHS;

/* -------------------------------------------------------------------------------------------------
 * getConfigPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigPath(cwd: string, path?: string, type?: ProjectType) {
  path = path || getConfigDefaultPath(cwd, type);
  return pathe.join(cwd, path);
}

/* -------------------------------------------------------------------------------------------------
 * getConfigAtPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigAtPath(
  path: string,
  opts: { cache: boolean } = { cache: true }
): Tokenami.Config {
  const config = (() => {
    try {
      if (!opts.cache) delete require.cache[require.resolve(path)];
      return require(path);
    } catch {
      return lazyJiti({ cache: opts.cache })(path);
    }
  })();

  return mergedConfigs(config.default ?? config);
}

/* -------------------------------------------------------------------------------------------------
 * getConfigDefaultPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigDefaultPath(cwd: string, type?: ProjectType) {
  const existingConfig = Object.values(DEFAULT_PATHS).find((path) => {
    return fs.existsSync(pathe.join(cwd, path));
  });
  return existingConfig || DEFAULT_PATHS[type || 'js'];
}

/* -------------------------------------------------------------------------------------------------
 * getTypeDefsPath
 * -----------------------------------------------------------------------------------------------*/

function getTypeDefsPath(configPath: string) {
  const dirname = pathe.dirname(configPath);
  return `${dirname}/tokenami.env.d.ts`;
}

/* -------------------------------------------------------------------------------------------------
 * getThemeValuesByTokenValues
 * -----------------------------------------------------------------------------------------------*/

function getThemeValuesByTokenValues(tokenValues: Tokenami.TokenValue[], theme: Tokenami.Theme) {
  const entries = getThemeValueByTokenValueEntries(tokenValues, theme);
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * getThemeValueByTokenValueEntries
 * -----------------------------------------------------------------------------------------------*/

function getThemeValueByTokenValueEntries(
  tokenValues: Tokenami.TokenValue[],
  theme: Tokenami.Theme
): [string, string][] {
  // make entries a deterministic order instead of usage order
  const sorted = [...tokenValues].sort();
  return sorted.flatMap((tokenValue) => {
    const parts = Tokenami.getTokenValueParts(tokenValue);
    const value = theme[parts.themeKey]?.[parts.token];
    if (value == null) return [];
    const valueString = String(value);
    const tokenValues = findTokenValuesInThemeValue(valueString);
    const themeValuesEntries = getThemeValueByTokenValueEntries(tokenValues, theme);
    return [[parts.property, valueString], ...themeValuesEntries];
  });
}

/* -------------------------------------------------------------------------------------------------
 * findTokenValuesInThemeValue
 * -----------------------------------------------------------------------------------------------*/

function findTokenValuesInThemeValue(themeValue: string) {
  const cssVariables = themeValue.match(/var\([\w-_]+\)/g) || [];
  const tokenValues = cssVariables.filter((v) => Tokenami.TokenValue.safeParse(v).success);
  return tokenValues as Tokenami.TokenValue[];
}

/* -------------------------------------------------------------------------------------------------
 * getThemeFromConfig
 * -----------------------------------------------------------------------------------------------*/

function getThemeFromConfig(themeConfig: Tokenami.Config['theme']): {
  modes: Tokenami.ThemeModes['modes'];
  root: Tokenami.Theme;
} {
  const { modes = {}, root, ...base } = themeConfig;
  if ('modes' in themeConfig) {
    const config = themeConfig as Tokenami.ThemeModes;
    return { modes: config.modes, root: config.root };
  }
  return { modes: {}, root: base };
}

/* -------------------------------------------------------------------------------------------------
 * getThemeValuesByThemeMode
 * -----------------------------------------------------------------------------------------------*/

type Mode = string & {};
type ThemeValue = string & {};

function getThemeValuesByThemeMode(
  tokenValue: Tokenami.TokenValue,
  themeConfig: Tokenami.Config['theme']
): Record<Mode, ThemeValue> {
  const theme = getThemeFromConfig(themeConfig);
  const parts = Tokenami.getTokenValueParts(tokenValue);
  const modeThemeEntries: [string, Tokenami.Theme][] = Object.entries(theme.modes);
  const modeValues = modeThemeEntries.concat([['root', theme.root]]).flatMap(([mode, theme]) => {
    const value = theme[parts.themeKey]?.[parts.token];
    return value == null ? [] : [[mode, String(value)] as const];
  });
  return Object.fromEntries(modeValues);
}

/* -------------------------------------------------------------------------------------------------
 * generateConfig
 * -----------------------------------------------------------------------------------------------*/

function generateConfig(include: string, configPath: string) {
  const filename = pathe.basename(configPath);
  const configStubPath = pathe.resolve(__dirname, `../stubs/${filename}`);
  const configStub = fs.readFileSync(configStubPath, 'utf8');
  return configStub.replace('include: []', `include: [${include}]`);
}

/* -------------------------------------------------------------------------------------------------
 * mergedConfigs
 * -----------------------------------------------------------------------------------------------*/

function mergedConfigs(theirs: Tokenami.Config): Tokenami.Config {
  return theirs;
}

/* -------------------------------------------------------------------------------------------------
 * generateTypeDefs
 * -----------------------------------------------------------------------------------------------*/

function generateTypeDefs(configPath: string, stubPath = '../stubs/tokenami.env.d.ts') {
  const parsed = pathe.parse(configPath);
  const typeDefStubPath = pathe.resolve(__dirname, stubPath);
  const typeDefStub = fs.readFileSync(typeDefStubPath, 'utf8');
  return typeDefStub.replace('tokenami.config', parsed.name);
}

/* -------------------------------------------------------------------------------------------------
 * getResponsivePropertyVariants
 * -----------------------------------------------------------------------------------------------*/

function getResponsivePropertyVariants(
  tokenProperty: Tokenami.TokenProperty,
  responsive: Tokenami.Config['responsive']
): Tokenami.VariantProperty[] {
  return Object.keys(responsive || {}).map((query) => {
    const name = Tokenami.getTokenPropertyName(tokenProperty);
    return Tokenami.variantProperty(query, name);
  });
}

/* -------------------------------------------------------------------------------------------------
 * getValidProperties
 * -----------------------------------------------------------------------------------------------*/

function getValidProperties(config: Tokenami.Config) {
  return new Set([
    ...supportedProperties,
    ...Object.keys(config.properties || {}),
    ...Object.keys(config.customProperties || {}),
    ...Object.keys(config.aliases || {}),
  ]);
}

/* -------------------------------------------------------------------------------------------------
 * getValidValues
 * -----------------------------------------------------------------------------------------------*/

function getValidValues(config: Tokenami.Config) {
  const configTheme = getThemeFromConfig(config.theme);
  // pluck first mode because modes should have the same keys
  const mode = Object.values(configTheme.modes)[0];
  const themes = [...(mode ? [mode] : []), configTheme.root];
  return themes.flatMap((theme) => {
    return Object.entries(theme).flatMap(([themeKey, values]) => {
      return Object.keys(values).map((token) => [themeKey, token] as const);
    });
  });
}

/* -------------------------------------------------------------------------------------------------
 * unique
 * -----------------------------------------------------------------------------------------------*/

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

/* ---------------------------------------------------------------------------------------------- */

type Options = { cache?: boolean };
type Jiti = ReturnType<typeof createJiti>;
const jitiCache: Record<string, Jiti> = {};

function lazyJiti(options: Options = {}) {
  const cacheId = JSON.stringify(options);
  return (jitiCache[cacheId] ??= createJiti(__filename, {
    transform: (opts) => transform(opts.source, { transforms: ['typescript', 'imports'] }),
    interopDefault: true,
    requireCache: options.cache,
  }));
}

export {
  mergedConfigs,
  getConfigPath,
  getConfigAtPath,
  getTypeDefsPath,
  generateConfig,
  generateTypeDefs,
  getValidProperties,
  getValidValues,
  getThemeValuesByTokenValues,
  getThemeFromConfig,
  getThemeValuesByThemeMode,
  getResponsivePropertyVariants,
  unique,
};
