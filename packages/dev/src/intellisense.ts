import type { Config } from '@tokenami/config';
import type { Alias } from '~/utils';
import { PROPERTY_TO_TYPE } from '@tokenami/config';
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

function generate(availableTokens: string[], config: Config, path = './dev.d.ts') {
  const outputProperties = {} as Record<string, string | number>;
  const outputColors = createUnion(config.theme.colors);
  const outputRadii = createUnion(config.theme.radii);
  let output = template;

  for (const token of availableTokens) {
    const tokenName = token.replace(/^--/, '');
    const [alias] = tokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    for (const [prop] of properties) {
      if (PROPERTY_TO_TYPE[prop].themeKey === 'colors') {
        outputProperties[token] = '`var(--color-${Color})`';
      } else if (PROPERTY_TO_TYPE[prop].themeKey === 'radii') {
        outputProperties[token] = "`var(--radii-${Radii})` | 'none'";
      } else if (PROPERTY_TO_TYPE[prop].themeKey === 'space') {
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

function createUnion(values: Record<string, string>) {
  return Object.keys(values)
    .map((value) => `'${value}'`)
    .join(' | ');
}

export { generate };
