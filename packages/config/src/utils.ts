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

function getTokenPropertyParts(tokenProperty: Tokenami.TokenProperty) {
  const name = Tokenami.getTokenPropertyName(tokenProperty);
  const [alias, ...variants] = name.split('_').reverse() as [string] & string[];
  return { name, alias, variants };
}

/* -------------------------------------------------------------------------------------------------
 * getResponsivePropertyVariants
 * -----------------------------------------------------------------------------------------------*/

function getResponsivePropertyVariants(
  tokenProperty: Tokenami.TokenProperty,
  config: Tokenami.Config
): string[] {
  return Object.keys(config.responsive || {}).map((query) => {
    const name = Tokenami.getTokenPropertyName(tokenProperty);
    return Tokenami.variantProperty(query, name);
  });
}

/* ---------------------------------------------------------------------------------------------- */

export {
  mergedConfigs,
  getConfigPath,
  getTypeDefsPath,
  generateConfig,
  generateTypeDefs,
  getValuesByTokenValueProperty,
  getLonghandsForAlias,
  getTokenPropertyParts,
  getResponsivePropertyVariants,
  getSpecifictyOrderForCSSProperty,
};
