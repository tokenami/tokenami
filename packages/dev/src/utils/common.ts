import * as Tokenami from '@tokenami/config';
import jitiFactory from 'jiti';
import { transform } from 'sucrase';
import * as pathe from 'pathe';
import * as fs from 'fs';
import { require } from './require';

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

function getConfigAtPath(path: string): Tokenami.Config {
  const config = (function () {
    try {
      return require(path);
    } catch {
      return lazyJiti()(path);
    }
  })();

  return mergedConfigs(config.default ?? config);
}

/* -------------------------------------------------------------------------------------------------
 * getReloadedConfigAtPath
 * -----------------------------------------------------------------------------------------------*/

function getReloadedConfigAtPath(path: string): Tokenami.Config {
  const config = (function () {
    try {
      delete require.cache[require.resolve(path)];
      return require(path);
    } catch {
      return lazyJiti({ cache: false })(path);
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
 * getCiTypeDefsPath
 * -----------------------------------------------------------------------------------------------*/

function getCiTypeDefsPath(configPath: string) {
  const dirname = pathe.dirname(configPath);
  return `${dirname}/tokenami.env.ci.d.ts`;
}

/* -------------------------------------------------------------------------------------------------
 * getThemeValuesByTokenValues
 * -----------------------------------------------------------------------------------------------*/

function getThemeValuesByTokenValues(tokenValues: Tokenami.TokenValue[], theme: Tokenami.Theme) {
  // make entries a deterministic order instead of usage order
  const sorted = [...tokenValues].sort();
  const entries = sorted.flatMap((tokenValue) => {
    const parts = Tokenami.getTokenValueParts(tokenValue);
    const value = theme[parts.themeKey]?.[parts.token];
    if (value == null) return [];
    return [[parts.property, value]] as const;
  });
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * getThemeValuesForTokenValue
 * -----------------------------------------------------------------------------------------------*/

function getThemeValuesForTokenValue(
  tokenValue: Tokenami.TokenValue,
  themeConfig: Tokenami.Config['theme']
): string[] {
  const { modes = {}, ...rootTheme } = themeConfig;
  const parts = Tokenami.getTokenValueParts(tokenValue);
  const modeThemes: Tokenami.Theme[] = Object.values(modes);
  return modeThemes.concat(rootTheme).flatMap((theme) => {
    const value = theme[parts.themeKey]?.[parts.token];
    return value ? [value] : [];
  });
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
  return { ...Tokenami.defaultConfig, ...theirs };
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
 * generateCiTypeDefs
 * -----------------------------------------------------------------------------------------------*/

function generateCiTypeDefs(configPath: string) {
  return generateTypeDefs(configPath, '../stubs/tokenami.env.ci.d.ts');
}

/* -------------------------------------------------------------------------------------------------
 * getSpecifictyOrderForCSSProperty
 * -----------------------------------------------------------------------------------------------*/

function getSpecifictyOrderForCSSProperty(cssProperty: Tokenami.CSSProperty) {
  return Tokenami.properties.indexOf(cssProperty);
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
 * unique
 * -----------------------------------------------------------------------------------------------*/

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

/* ---------------------------------------------------------------------------------------------- */

let jiti: ReturnType<typeof jitiFactory> | null = null;
function lazyJiti({ cache = true } = {}) {
  return (jiti ??= jitiFactory(__filename, {
    transform: (opts) => transform(opts.source, { transforms: ['typescript', 'imports'] }),
    interopDefault: true,
    requireCache: cache,
  }));
}

export {
  mergedConfigs,
  getConfigPath,
  getConfigAtPath,
  getReloadedConfigAtPath,
  getTypeDefsPath,
  getCiTypeDefsPath,
  generateConfig,
  generateTypeDefs,
  generateCiTypeDefs,
  getThemeValuesByTokenValues,
  getThemeValuesForTokenValue,
  getResponsivePropertyVariants,
  getSpecifictyOrderForCSSProperty,
  unique,
};
