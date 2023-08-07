import * as Tokenami from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(config: Tokenami.Config, path = './dev.d.ts') {
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const tokenProperties = Tokenami.getAvailableTokenPropertiesWithVariants(config);
  const outputProperties: Record<string, string[]> = {};
  const outFile = pathe.join(outDir, path);
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace(
    'interface Config extends Tokenami.Config {}',
    `interface Config extends Tokenami.Config ${JSON.stringify(config)}`
  );

  tokenProperties.forEach((tokenProperty) => {
    const tokenPropertyName = Tokenami.getTokenPropertyName(tokenProperty);
    const [alias] = tokenPropertyName.split('_').reverse() as [string, string?];
    const cssProperties = Tokenami.getCSSPropertiesForAlias(alias, config);

    cssProperties.forEach((cssProperty: Tokenami.CSSProperty) => {
      const cssPropertyConfig = config.properties?.[cssProperty];
      let schema: string[] = outputProperties[tokenProperty] || [];

      if (cssPropertyConfig?.length) {
        schema = [`TokenValue<'${cssProperty}'>`, 'Tokenami.AnyValue'];
        if (cssPropertyConfig.includes('grid')) schema.push('Tokenami.GridValue');
      }

      if (schema.length) {
        outputProperties[tokenProperty] = schema;
      }
    });
  });

  const outputPropertiesStrings = Object.entries(outputProperties).map(
    ([tokenProperty, schema]) => `'${tokenProperty}'?: ${schema.join(' | ')};`
  );

  output = output.replace(
    /\/\/ TOKENAMI_TOKENS_START(.*)\/\/ TOKENAMI_TOKENS_END/s,
    `// TOKENAMI_TOKENS_START\n${outputPropertiesStrings.join('\n')}\n// TOKENAMI_TOKENS_END`
  );

  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
