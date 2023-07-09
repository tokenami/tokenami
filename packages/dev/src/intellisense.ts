import type { Config } from '@tokenami/config';
import type { Alias } from '~/utils';
import { SHEET_CONFIG } from '@tokenami/config';
import * as fs from 'fs';
import * as url from 'url';
import * as pathe from 'pathe';
import { findProperties } from '~/utils';

const template = `
import * as CSS from 'csstype';

type Color = {{COLORS}};
type Radii = {{RADII}};

declare module 'csstype' {
  interface Properties {
    {{PROPERTIES}}
  }
}
`;

function generate(config: Config, path = './dev.d.ts') {
  const availableTokens = getAvailableTokenamiProperties(config);
  const outputProperties = {} as Record<string, string | number>;
  const outputColors = createUnion(config.theme.colors || {});
  const outputRadii = createUnion(config.theme.radii || {});
  let output = template;

  for (const token of availableTokens) {
    const tokenName = token.replace(/^--/, '');
    const [alias] = tokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    for (const [prop] of properties) {
      const { themeKey } = SHEET_CONFIG.themeConfig[prop] || {};
      if (themeKey === 'colors') {
        outputProperties[token] = '`var(--color-${Color})`';
      } else if (themeKey === 'radii') {
        outputProperties[token] = "`var(--radii-${Radii})` | 'none'";
      } else if (themeKey === 'space') {
        outputProperties[token] = 'number';
      } else {
        outputProperties[token] = `CSS.PropertiesHyphen['${prop}']`;
      }
    }
  }

  output = output.replace('{{COLORS}}', outputColors);
  output = output.replace('{{RADII}}', outputRadii);
  output = output.replace(
    '{{PROPERTIES}}',
    Object.entries(outputProperties).reduce(
      (acc, [key, value]) => `${acc}\n'${key}'?: ${value};`,
      '[index: `--${string}`]: string | number;'
    )
  );

  const outDir = pathe.dirname(url.fileURLToPath(import.meta.url));
  const filePath = pathe.join(outDir, path);
  fs.writeFileSync(filePath, output, { flag: 'w' });
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

function createUnion(values: Record<string, string>) {
  const valueStrings = Object.keys(values).map((value) => `'${value}'`);
  return valueStrings.join(' | ');
}

export { generate };
