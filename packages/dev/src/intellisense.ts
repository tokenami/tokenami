import type { Config } from '@tokenami/config';
import type { Alias } from '~/utils';
import { SHEET_CONFIG, THEME_CONFIG } from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';
import { findProperties } from '~/utils';

function generate(config: Config, path = './dev.d.ts') {
  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const availableTokens = getAvailableTokenamiProperties(config);
  const outputProperties = new Set<string>();
  const outFile = pathe.join(outDir, path);
  let output = fs.readFileSync(outFile, 'utf8');

  output = output.replace('interface Theme {}', `interface Theme ${JSON.stringify(config.theme)}`);

  for (const token of availableTokens) {
    const tokenName = token.replace(/^--/, '');
    const [alias] = tokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    for (const [prop] of properties) {
      const themeKey = SHEET_CONFIG.themeConfig[prop]?.themeKey;
      const prefix = themeKey ? (THEME_CONFIG as any)[themeKey]?.prefix : undefined;
      const values = themeKey ? Boolean((config.theme as any)[themeKey]) : undefined;
      if (themeKey === 'space') {
        outputProperties.add(`'--${prop}'?: number;`);
      } else if (prefix && values) {
        outputProperties.add(`'--${prop}'?: ThemeValue<'${prop}'>;`);
      } else {
        outputProperties.add(`'--${prop}'?: GenericValue<'${prop}'>;`);
      }
    }
  }

  output = output.replace(
    /\/\/ TOKENAMI_TOKENS_START(.*)\/\/ TOKENAMI_TOKENS_END/s,
    `// TOKENAMI_TOKENS_START\n${Array.from(outputProperties).join('\n')}\n// TOKENAMI_TOKENS_END`
  );
  fs.writeFileSync(outFile, output, { flag: 'w' });
}

/* ---------------------------------------------------------------------------------------------- */

function getAvailableTokenamiProperties(config: Config) {
  const { properties, pseudoClasses } = SHEET_CONFIG;
  const configBreakpoints = Object.keys(config.theme.breakpoints || {});
  const allAliases = Object.values(config.aliases || {}).flat();
  const allProperties = [...properties, ...allAliases] as string[];
  let tokens = [];

  for (const prop of allProperties) {
    tokens.push(`--${prop}`);
    for (const pseudo of pseudoClasses) {
      tokens.push(`--${pseudo.replace(':', '')}_${prop}`);
    }
    for (const breakpoint of configBreakpoints) {
      tokens.push(`--${breakpoint}_${prop}`);
    }
  }
  return tokens;
}

export { generate };
