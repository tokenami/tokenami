import * as ConfigUtils from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(config: ConfigUtils.Config, path = './tokenami.d.ts') {
  const properties = getExtendedProperties(config);
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const outFile = pathe.join(outDir, path);
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace(/{} \/\* TOKENAMI_STYLES \*\//, properties.join(' & \n'));
  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

function getExtendedProperties(config: ConfigUtils.Config) {
  const extendsProperties = new Set<string>();
  const extendedAliases = new Set<string>();

  ConfigUtils.properties.forEach((cssProperty) => {
    const themeKeys = config.properties?.[cssProperty] || [];
    const value = themeKeys.length
      ? themeKeys.includes('grid')
        ? `ThemedGridValue<'${cssProperty}'>`
        : `ThemedValue<'${cssProperty}'>`
      : `CSSPropertyValue<'${cssProperty}'>`;

    extendsProperties.add(`ConfigUtils.VariantDeclaration<'${cssProperty}', Media, ${value}>`);

    if (config.aliases) {
      Object.entries(config.aliases).forEach(([alias, properties]) => {
        if (!extendedAliases.has(alias) && properties?.includes(cssProperty)) {
          extendsProperties.add(`ConfigUtils.VariantDeclaration<'${alias}', Media, ${value}>`);
          extendedAliases.add(alias);
        }
      });
    }
  });

  return Array.from(extendsProperties);
}

export { generate };
