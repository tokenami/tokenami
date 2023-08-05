import type { Config } from '@tokenami/config';
import {
  SHEET_CONFIG,
  THEME_CONFIG,
  getConfigPropertiesForAlias,
  getAvailableTokenPropertiesWithVariants,
} from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';

function generate(config: Config, path = './dev.d.ts') {
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const availableTokens = getAvailableTokenPropertiesWithVariants(config);
  const outputProperties = new Set<string>();
  const outFile = pathe.join(outDir, path);
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace('interface Theme {}', `interface Theme ${JSON.stringify(config.theme)}`);

  for (const token of availableTokens) {
    const tokenName = token.replace(/^--/, '');
    const [alias] = tokenName.split('_').reverse() as [string, string?];
    const properties = getConfigPropertiesForAlias(alias, config);

    for (const [prop] of properties) {
      const themeKey = SHEET_CONFIG.themeConfig[prop]?.themeKey;
      const prefix = themeKey ? (THEME_CONFIG as any)[themeKey]?.prefix : undefined;
      const values = themeKey ? Boolean((config.theme as any)[themeKey]) : undefined;
      let value: string;

      if (themeKey === 'grid') {
        value = `ArbitraryValue | number`;
      } else if (themeKey === 'sizes') {
        value = `ArbitraryValue | number | ThemeValue<'${prop}'>`;
      } else if (themeKey && prefix && values) {
        value = `ArbitraryValue | ThemeValue<'${prop}'>`;
      } else {
        value = `ArbitraryValue`;
      }
      outputProperties.add(`'--${tokenName}'?: ${value};`);
    }
  }

  output = output.replace(
    /\/\/ TOKENAMI_TOKENS_START(.*)\/\/ TOKENAMI_TOKENS_END/s,
    `// TOKENAMI_TOKENS_START\n${Array.from(outputProperties).join('\n')}\n// TOKENAMI_TOKENS_END`
  );

  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
