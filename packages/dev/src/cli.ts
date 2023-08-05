import type { Config } from '@tokenami/config';
import { getConfigPath, mergedConfigs } from '@tokenami/config';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as pathe from 'pathe';
import glob from 'fast-glob';
import cac from 'cac';
import * as chokidar from 'chokidar';
import * as sheet from '~/sheet';
import * as intellisense from '~/intellisense';
import * as log from './log';
import pkgJson from '~/../package.json';

const require = createRequire(import.meta.url);

const run = () => {
  const cli = cac('✨ tokenami');
  const cwd = process.cwd();

  cli
    .command('[files]', 'Include file glob')
    .option('-c, --config [path]', 'Path to a custom config file')
    .option('-c, --config [path]', 'Path to a custom config file')
    .option('-o, --output [path]', 'Output file', { default: 'public/tokenami.css' })
    .option('-w, --watch', 'Watch for changes and rebuild as needed')
    .action(async (_, flags) => {
      const startTime = startTimer();
      const config = getConfig(cwd, { path: flags.config, include: flags.files });

      if (!config.include.length) log.error('Provide a glob pattern to include files');

      async function regenerateStylesheet(file: string, config: Config) {
        const generateTime = startTimer();
        const usedTokens = await findUsedTokenProperties(cwd, config.include, config.exclude);
        generateStyles(cwd, flags.output, usedTokens, config);
        log.debug(`Generated styles from ${file} in ${generateTime()}ms.`);
      }

      if (flags.watch) {
        const configWatcher = watch(cwd, [getConfigPath(cwd, flags.config)]);
        const tokenWatcher = watch(cwd, config.include, config.exclude);
        log.debug(`Watching for changes to ${config.include}.`);

        tokenWatcher.on('all', (_, file) => regenerateStylesheet(file, config));

        configWatcher.on('all', async (_, file) => {
          const updatedConfig = getConfig(cwd, { path: file, include: flags.files });
          regenerateStylesheet(file, updatedConfig);
          intellisense.generate(updatedConfig);
        });

        process.once('SIGINT', async () => {
          await tokenWatcher.close();
          await configWatcher.close();
        });
      }

      const usedTokens = await findUsedTokenProperties(cwd, config.include, config.exclude);
      generateStyles(cwd, flags.output, usedTokens, config);
      intellisense.generate(config);
      log.debug(`Ready in ${startTime()}ms.`);
    });

  cli.help();
  cli.version(pkgJson.version);
  cli.parse();
};

try {
  run();
} catch (e) {
  log.error(e instanceof Error ? e.message : 'Unknown error occurred.');
}

/* ---------------------------------------------------------------------------------------------- */

function startTimer() {
  const start = performance.now();
  return () => {
    const stop = performance.now();
    return Math.round(stop - start);
  };
}

function generateStyles(cwd: string, out: string, usedTokens: string[], config: Config) {
  const outDir = pathe.join(cwd, pathe.dirname(out));
  const outPath = pathe.join(cwd, out);
  const output = sheet.generate(usedTokens, outPath, config);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, output, { flag: 'w' });
}

function watch(cwd: string, include: string[], exclude?: string[]) {
  return chokidar.watch(include, {
    cwd,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: exclude,
  });
}

async function findUsedTokenProperties(dir: string, include: string[], ignore?: string[]) {
  const entries = await glob(include, { cwd: dir, onlyFiles: true, stats: false, ignore });
  const matches = entries.flatMap((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const matches = fileContent.matchAll(/(?<token>--[a-z-_]+)("|')?\:/g);
    return Array.from(matches).map((match) => match.groups!.token!);
  });
  const uniqueMatches = new Set(matches);
  return Array.from(uniqueMatches);
}

interface GetConfigOptions {
  path?: string;
  include?: string[];
}

function reloadModule(moduleName: string) {
  if (require.cache) {
    delete require.cache[require.resolve(moduleName)];
  }
  return require(moduleName);
}

function getConfig(cwd: string, opts: GetConfigOptions = {}): Config {
  const configPath = getConfigPath(cwd, opts.path);
  const theirs = fs.existsSync(configPath) ? reloadModule(configPath) : {};
  return mergedConfigs(theirs);
}
