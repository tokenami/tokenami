import type { Config } from '~/config';
import * as fs from 'fs';
import * as pathe from 'pathe';
import glob from 'fast-glob';
import cac from 'cac';
import deepmerge from 'deepmerge';
import * as chokidar from 'chokidar';
import * as sheet from '~/sheet';
import * as log from './log';
import pkgJson from '~/../package.json';
import defaultConfig from '~/../tokenami.config';

const cli = cac('✨ tokenami');
const cwd = process.cwd();

cli
  .command('[files]', 'Include file glob')
  .option('-c, --config [path]', 'Path to a custom config file', { default: 'tokenami.config.js' })
  .option('-o, --output [path]', 'Output file', { default: 'public/tokenami.css' })
  .option('-w, --watch', 'Watch for changes and rebuild as needed')
  .action(async (_, flags) => {
    const configPath = pathe.join(cwd, flags.config);
    const config = await getConfig(configPath, flags.files);
    const tokens = sheet.configTokens(config);

    if (!config.include.length) log.error('Provide a glob pattern to include files');

    generate(flags.output, tokens, config);

    if (flags.watch) {
      const watcher = watch(config.include, config.exclude);

      watcher.on('all', (_, file) => {
        log.debug(`Generated styles from: ${file}`);
        generate(flags.output, tokens, config);
      });

      process.once('SIGINT', async () => {
        await watcher.close();
      });
    }
  });

cli.help();
cli.version(pkgJson.version);
cli.parse();

/* ---------------------------------------------------------------------------------------------- */

async function generate(out: string, tokens: string[], config: Config) {
  const usedTokens = await findUsedTokens(tokens, cwd, config.include, config.exclude);
  const outDir = pathe.join(cwd, pathe.dirname(out));
  const outPath = pathe.join(cwd, out);
  const output = sheet.generate(usedTokens, outPath, config);

  try {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, output, { flag: 'w' });
  } catch (err) {
    console.log(err);
  }
}

async function getConfig(path: string, include: string[]) {
  const ours = { ...defaultConfig, include: include || defaultConfig.include };
  const theirs = fs.existsSync(path) ? await import(path).then((m) => m.default) : {};
  return deepmerge(ours, theirs) as Config;
}

function watch(include: string[], exclude?: string[]) {
  log.debug(`Watching for changes to: ${include}`);
  const watcher = chokidar.watch(include, {
    cwd,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: exclude,
  });
  return watcher;
}

async function findUsedTokens(
  properties: string[],
  dir: string,
  include: string[],
  ignore?: string[]
) {
  const entries = await glob(include, { cwd: dir, onlyFiles: true, stats: false, ignore });
  const regex = new RegExp(properties.join('\\b|'), 'g');
  const matches = entries.reduce((acc, entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const matchingProperties = fileContent.match(regex);
    if (matchingProperties) return new Set([...acc, ...matchingProperties]);
    return acc;
  }, new Set<string>());

  return Array.from(matches);
}
