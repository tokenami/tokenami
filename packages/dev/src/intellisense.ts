import * as ConfigUtils from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

// TODO: this can be part of build process now bcos we no
// longer generate based on consumer theme

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate() {
  const properties = getExtendedProperties();
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const outFile = pathe.join(outDir, './tokenami.d.ts');
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace(/{} \/\* TOKENAMI_STYLES \*\//, properties.join(' & \n'));
  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

function getExtendedProperties() {
  const extendsProperties = new Set<string>();

  ConfigUtils.properties.forEach((cssProperty) => {
    extendsProperties.add(`VariantStyle<'${cssProperty}', Responsive, Value<'${cssProperty}'>>`);
  });

  return Array.from(extendsProperties);
}

export { generate };
