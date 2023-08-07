import * as pathe from 'pathe';
import defaultConfig from '~/config.default';
import * as Tokenami from '~/config';
import * as Supports from '~/supports';

/* -------------------------------------------------------------------------------------------------
 * getConfigPath
 * -----------------------------------------------------------------------------------------------*/

function getConfigPath(cwd: string, path = './tokenami.config.js') {
  return pathe.join(cwd, path);
}

/* -------------------------------------------------------------------------------------------------
 * getValuesByTokenValueProperty
 * -----------------------------------------------------------------------------------------------*/

function getValuesByTokenValueProperty(theme: Tokenami.Theme) {
  const entries = Object.entries(theme).flatMap(([themeKey, values = []]) => {
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
 * getSpecifictyOrderForCSSProperty
 * -----------------------------------------------------------------------------------------------*/

function getSpecifictyOrderForCSSProperty(cssProperty: Supports.CSSProperty) {
  return Supports.properties.indexOf(cssProperty);
}

/* -------------------------------------------------------------------------------------------------
 * getAvailableTokenPropertiesWithVariants
 * -----------------------------------------------------------------------------------------------*/

function getAvailableTokenPropertiesWithVariants(config: Tokenami.Config) {
  const configMedia = Object.keys(config.media || {});
  const allTokenAliases = Object.values(config.aliases || {}).flat();
  const allTokenProperties = unique([...Supports.properties, ...allTokenAliases]);
  let tokenProperties = [];

  for (const tokenProperty of allTokenProperties) {
    tokenProperties.push(Tokenami.tokenProperty(tokenProperty));
    for (const pseudo of Supports.pseudoClasses) {
      const rawPseudo = pseudo.replace(':', '');
      tokenProperties.push(Tokenami.tokenProperty(`${rawPseudo}_${tokenProperty}`));
    }
    for (const media of configMedia) {
      tokenProperties.push(Tokenami.tokenProperty(`${media}_${tokenProperty}`));
    }
  }
  return unique(tokenProperties);
}

/* ---------------------------------------------------------------------------------------------- */

function unique<T>(array: T[]) {
  return Array.from(new Set(array)) as T[];
}

export {
  mergedConfigs,
  getConfigPath,
  getValuesByTokenValueProperty,
  getCSSPropertiesForAlias,
  getSpecifictyOrderForCSSProperty,
  getAvailableTokenPropertiesWithVariants,
};
