import * as ConfigUtils from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

// TODO: this can be part of build process now bcos we no
// longer generate based on consumer theme

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

  ConfigUtils.properties.forEach((cssProperty) => {
    const themeKeys = config.properties?.[cssProperty] || [];
    const value = themeKeys.length
      ? themeKeys.includes('grid')
        ? `ThemedGridValue<'${cssProperty}'>`
        : `ThemedValue<'${cssProperty}'>`
      : `CSSPropertyValue<'${cssProperty}'>`;

    extendsProperties.add(`VariantStyle<'${cssProperty}', Responsive, ${value}>`);
  });

  return Array.from(extendsProperties);
}

export { generate };
