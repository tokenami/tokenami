import * as pathe from 'pathe';
import * as Tokenami from '~/config';
import * as Supports from '~/supports';
import defaultConfig from 'stubs/config.default';
import path from 'path';
import fs from 'fs';

/* -------------------------------------------------------------------------------------------------
 * getConfigPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigPath(cwd: string, path = './.tokenami/tokenami.config.js') {
  return pathe.join(cwd, path);
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
 * getCSSPropertiesForAlias
 * -------------------------------------------------------------------------------------------------
 * an alias can be used for multiple CSS properties e.g. `px` can apply to `padding-left`
 * and `padding-right`, so this gets an array of CSS properties for a given alias.
 * -----------------------------------------------------------------------------------------------*/

function getCSSPropertiesForAlias(alias: string, config: Tokenami.Config): Supports.CSSProperty[] {
  const aliases = (config.aliases || {}) as Tokenami.Aliases;
  const matchingEntries = Object.entries(aliases).filter(([_, aliases]) => aliases.includes(alias));
  if (matchingEntries.length) {
    return matchingEntries.map(([cssProperty]) => cssProperty as Supports.CSSProperty);
  } else {
    return Supports.properties.includes(alias as any) ? [alias as Supports.CSSProperty] : [];
  }
}

/* -------------------------------------------------------------------------------------------------
 * generateConfig
 * -----------------------------------------------------------------------------------------------*/

function generateConfig() {
  const initConfigStubPath = path.resolve(__dirname, '../stubs/config.init.cjs');
  return fs.readFileSync(initConfigStubPath, 'utf8');
}

/* -------------------------------------------------------------------------------------------------
 * mergedConfigs
 * -----------------------------------------------------------------------------------------------*/

function mergedConfigs(theirs: Tokenami.Config): Tokenami.Config {
  return {
    ...defaultConfig,
    ...theirs,
    theme: { ...defaultConfig.theme, ...theirs.theme },
    aliases: { ...defaultConfig.aliases, ...theirs.aliases },
    properties: { ...defaultConfig.properties, ...theirs.properties },
  };
}

/* -------------------------------------------------------------------------------------------------
 * generateTypeDefs
 * -----------------------------------------------------------------------------------------------*/

function generateTypeDefs(configPath: string) {
  const parsed = pathe.parse(configPath);
  const typeDefStubPath = path.resolve(__dirname, '../stubs/typedefs.txt');
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

function getTokenPropertyParts(tokenProperty: string, config: Tokenami.Config) {
  const [alias, ...tokenVariants] = tokenProperty.split('_').reverse() as [string] & string[];
  const properties = getCSSPropertiesForAlias(alias, config);
  let media: string | undefined;
  let pseudoClass: string | undefined;
  let pseudoElement: string | undefined;
  let variants: string[] = [];

  tokenVariants.forEach((variant) => {
    if (config.media?.[variant]) {
      media = variant;
    } else if (Supports.pseudoClasses.includes(variant as any)) {
      pseudoClass = variant;
    } else if (Supports.pseudoElements.includes(variant as any)) {
      pseudoElement = variant;
    } else {
      variants.push(variant);
    }
  });

  return { alias, properties, media, pseudoClass, pseudoElement, variants };
}

/* -------------------------------------------------------------------------------------------------
 * getResponsivePropertyVariants
 * -----------------------------------------------------------------------------------------------*/

function getResponsivePropertyVariants(
  tokenProperty: Tokenami.TokenProperty,
  config: Tokenami.Config
): string[] {
  return Object.keys(config.media || {}).map((media) => {
    const name = Tokenami.getTokenPropertyName(tokenProperty);
    return Tokenami.variantProperty(media, name);
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
  getTokenPropertyParts,
  getResponsivePropertyVariants,
  getCSSPropertiesForAlias,
  getSpecifictyOrderForCSSProperty,
};
