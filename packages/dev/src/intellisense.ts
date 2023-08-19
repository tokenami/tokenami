import * as Tokenami from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(config: Tokenami.Config, path = './dev.d.ts') {
  const properties = getExtendedProperties(config);
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const outFile = pathe.join(outDir, path);
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace(
    /interface Config extends Tokenami\.Config {(.+)?}/,
    `interface Config extends Tokenami.Config ${JSON.stringify(config)}`
  );

  output = output.replace(
    /interface Properties \/\*EXTENDS\*\/(.+)?{/,
    `interface Properties /*EXTENDS*/ extends ${properties.join(',\n')} {`
  );

  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

function getExtendedProperties(config: Tokenami.Config) {
  const extendsProperties: Set<string> = new Set();

  Tokenami.properties.forEach((cssProperty) => {
    const themeKeys = config.properties?.[cssProperty] || [];
    const aliases: string[] = (config.aliases as any)?.[cssProperty] || [];
    const value = themeKeys.length
      ? themeKeys.includes('grid')
        ? `ThemedGridValue<'${cssProperty}'>`
        : `ThemedValue<'${cssProperty}'>`
      : `CSSPropertyValue<'${cssProperty}'>`;

    extendsProperties.add(`Tokenami.Selector<'${cssProperty}', Media, ${value}>`);
    aliases.forEach((alias) => {
      extendsProperties.add(`Tokenami.Selector<'${alias}', Media, ${value}>`);
    });
  });

  return Array.from(extendsProperties);
}

export { generate };
