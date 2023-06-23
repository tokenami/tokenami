import cac from 'cac';
import * as fs from 'fs';
import * as pathe from 'pathe';
import * as utils from './utils';
import { ALL_PROPERTIES, PSEUDO } from './constants';
import { defaultConfig } from './config';

const cli = cac('tokenami');
const cwd = process.cwd();
const pkgPath = pathe.join(__dirname, '../package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

cli
  .command('[...files]', 'Include file glob')
  .option('-c, --config [path]', 'Path to a custom config file', { default: 'tokenami.config.js' })
  .option('-o, --output [path]', 'Output file', { default: 'public/tokenami.css' })
  .action(async (_, options) => {
    const config = await import(pathe.join(cwd, options.config));
    const outDir = pathe.join(cwd, pathe.dirname(options.output));
    const outPath = pathe.join(cwd, options.output);
    const theme = { ...defaultConfig.theme, ...config.default.theme };

    const sheet = `
      :root {
        --space: ${theme.space};
        ${utils.getVars(theme.colors, 'color').join('\n')}
        ${utils.getVars(theme.radii, 'radii').join('\n')}
      }

      * {
        ${ALL_PROPERTIES.map((property) => utils.getPropertyInitialVars(property)).join('\n')}
      }

      ${ALL_PROPERTIES.map((property) => utils.getPropertyStyles(property)).join('\n')}

      ${PSEUDO.map((pseudo) => {
        return ALL_PROPERTIES.map((property) => {
          const appendPseudo = (selector: string) => `${selector}:${pseudo}`;
          return utils.getVariantStyles(property, pseudo, appendPseudo);
        }).join('\n');
      }).join('\n')}

      ${Object.entries(theme.breakpoints)
        .map(([name, breakpoint]) => {
          return `@media ${breakpoint} {
            ${ALL_PROPERTIES.map((property) => utils.getVariantStyles(property, name)).join('\n')}
          }`;
        })
        .join('\n')}
    `;

    try {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, sheet, { flag: 'w' });
    } catch (err) {
      console.log(err);
    }
  });

cli.help();
cli.version(pkgJson.version);
cli.parse(process.argv, { run: false });
await cli.runMatchedCommand();
