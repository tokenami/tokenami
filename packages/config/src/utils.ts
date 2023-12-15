import jitiFactory from 'jiti';
import { transform } from 'sucrase';
import * as pathe from 'pathe';
import * as Tokenami from '~/config';
import * as Supports from '~/supports';
import defaultConfig from '../stubs/config.default';
import fs from 'fs';

const DEFAULT_PATHS = [
  './.tokenami/tokenami.config.js',
  './.tokenami/tokenami.config.ts',
  './.tokenami/tokenami.config.cjs',
  './.tokenami/tokenami.config.mjs',
] as const;

/* -------------------------------------------------------------------------------------------------
 * getConfigPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigPath(cwd: string, path: string = getConfigDefaultPath(cwd)) {
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

function getConfigDefaultPath(cwd: string) {
  return DEFAULT_PATHS.find((path) => fs.existsSync(pathe.join(cwd, path))) || DEFAULT_PATHS[0];
}

/* -------------------------------------------------------------------------------------------------
 * getTypeDefsPath
 * -----------------------------------------------------------------------------------------------*/

function getTypeDefsPath(configPath: string) {
  const dirname = pathe.dirname(configPath);
  return `${dirname}/tokenami.d.ts`;
}

/* -------------------------------------------------------------------------------------------------
 * getValuesByTokenValueProperty
 * -----------------------------------------------------------------------------------------------*/

function getValuesByTokenValueProperty(theme: Tokenami.Theme, themeKeys?: string[]) {
  const plucked = themeKeys ? Object.fromEntries(themeKeys.map((key) => [key, theme[key]])) : theme;
  const entries = Object.entries(plucked).flatMap(([themeKey, values = []]) => {
    return Object.entries(values).map(([token, value]) => {
      const tokenValueProperty = Tokenami.tokenValue(themeKey, token).replace(/var\((.+)\)/, '$1');
      return [tokenValueProperty, value];
    });
  });
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * getLonghandsForAlias
 * -------------------------------------------------------------------------------------------------
 * an alias can be used for multiple CSS properties e.g. `px` can apply to `padding-left`
 * and `padding-right`, so this gets an array of longhand properties for a given alias.
 * -----------------------------------------------------------------------------------------------*/

function getLonghandsForAlias(alias: string, config: Tokenami.Config): string[] {
  const longhands: string[] = (config.aliases as any)?.[alias];
  return longhands || (Supports.properties.includes(alias as any) ? [alias] : []);
}

/* -------------------------------------------------------------------------------------------------
 * generateConfig
 * -----------------------------------------------------------------------------------------------*/

function generateConfig() {
  const initConfigStubPath = pathe.resolve(__dirname, '../stubs/config.init.cjs');
  return fs.readFileSync(initConfigStubPath, 'utf8');
}

/* -------------------------------------------------------------------------------------------------
 * mergedConfigs
 * -----------------------------------------------------------------------------------------------*/

function mergedConfigs(theirs: Tokenami.Config): Tokenami.Config {
  return { ...defaultConfig, ...theirs };
}

/* -------------------------------------------------------------------------------------------------
 * generateTypeDefs
 * -----------------------------------------------------------------------------------------------*/

function generateTypeDefs(configPath: string) {
  const parsed = pathe.parse(configPath);
  const typeDefStubPath = pathe.resolve(__dirname, '../stubs/typedefs.txt');
  const typeDefStub = fs.readFileSync(typeDefStubPath, 'utf8');
  const configFileName = parsed.name;
  return typeDefStub.replace('CONFIG_FILE_NAME', configFileName);
}

/* -------------------------------------------------------------------------------------------------
 * getSpecifictyOrderForCSSProperty
 * -----------------------------------------------------------------------------------------------*/

function getSpecifictyOrderForCSSProperty(cssProperty: Supports.CSSProperty) {
  return Supports.properties.indexOf(cssProperty);
}

/* -------------------------------------------------------------------------------------------------
 * getTokenPropertyParts
 * -----------------------------------------------------------------------------------------------*/

type Parts = {
  name: string;
  alias: string;
  responsive?: string;
  selector?: string;
};

function getTokenPropertyParts(
  tokenProperty: Tokenami.TokenProperty,
  config: Tokenami.Config
): Parts | null {
  const name = Tokenami.getTokenPropertyName(tokenProperty);
  const [alias, ...variants] = name.split('_').reverse() as [string, ...string[]];
  const responsiveVariants = variants.filter((variant) => config.responsive?.[variant]);
  const selectorVariants = variants.filter((variant) => config.selectors?.[variant]);
  const validVariants = responsiveVariants.concat(selectorVariants);
  const isValidResponsive = responsiveVariants.length <= 1;
  // we only allow 1 selector to enforce custom selectors for chained selectors
  const isValidSelector = selectorVariants.length <= 1;
  const isValidVariants = variants.length === validVariants.length;
  const isValid = isValidResponsive && isValidSelector && isValidVariants;
  const [responsive] = responsiveVariants;
  const [selector] = selectorVariants;
  return isValid ? { name, alias, responsive, selector } : null;
}

/* -------------------------------------------------------------------------------------------------
 * getResponsivePropertyVariants
 * -----------------------------------------------------------------------------------------------*/

function getResponsivePropertyVariants(
  tokenProperty: Tokenami.TokenProperty,
  responsive: Tokenami.Config['responsive']
): string[] {
  return Object.keys(responsive || {}).map((query) => {
    const name = Tokenami.getTokenPropertyName(tokenProperty);
    return Tokenami.variantProperty(query, name);
  });
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
  generateConfig,
  generateTypeDefs,
  getValuesByTokenValueProperty,
  getLonghandsForAlias,
  getTokenPropertyParts,
  getResponsivePropertyVariants,
  getSpecifictyOrderForCSSProperty,
};
