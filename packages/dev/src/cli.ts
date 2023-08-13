import * as Tokenami from '@tokenami/config';
import cac from 'cac';
import glob from 'fast-glob';
import * as fs from 'fs';
import { createRequire } from 'module';
import * as chokidar from 'chokidar';
import * as pathe from 'pathe';
import * as sheet from '~/sheet';
import * as intellisense from '~/intellisense';
import * as log from '~/log';
import pkgJson from '~/../package.json';

const require = createRequire(import.meta.url);

const run = () => {
  const cli = cac('✨ tokenami');
  const cwd = process.cwd();

  cli
    .command('[files]', 'Include file glob')
    .option('-c, --config [path]', 'Path to a custom config file')
    .option('-o, --output [path]', 'Output file', { default: 'public/tokenami.css' })
    .option('-w, --watch', 'Watch for changes and rebuild as needed')
    .option('--minify', 'Minify CSS output')
    .action(async (_, flags) => {
      const startTime = startTimer();
      const config = getConfig(cwd, { path: flags.config, include: flags.files });

      if (!config.include.length) log.error('Provide a glob pattern to include files');

      async function regenerateStylesheet(file: string, config: Tokenami.Config) {
        const generateTime = startTimer();
        const usedTokenProps = await findUsedTokenProperties(cwd, config.include, config.exclude);
        generateStyles(cwd, flags.output, usedTokenProps, config, flags.minify);
        log.debug(`Generated styles from ${file} in ${generateTime()}ms.`);
      }

      if (flags.watch) {
        const configWatcher = watch(cwd, [Tokenami.getConfigPath(cwd, flags.config)]);
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
      generateStyles(cwd, flags.output, usedTokens, config, flags.minify);
      intellisense.generate(config);
      log.debug(`Ready in ${startTime()}ms.`);
    });

  cli.help();
  cli.version(pkgJson.version);
  cli.parse();
};

/* -------------------------------------------------------------------------------------------------
 * generateStyles
 * -----------------------------------------------------------------------------------------------*/

function generateStyles(
  cwd: string,
  out: string,
  usedTokens: Tokenami.TokenProperty[],
  config: Tokenami.Config,
  minify?: boolean
) {
  const outDir = pathe.join(cwd, pathe.dirname(out));
  const outPath = pathe.join(cwd, out);
  const output = sheet.generate(usedTokens, outPath, config, minify);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, output, { flag: 'w' });
}

/* -------------------------------------------------------------------------------------------------
 * watch
 * -----------------------------------------------------------------------------------------------*/

function watch(cwd: string, include: string[], exclude?: string[]) {
  return chokidar.watch(include, {
    cwd,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: exclude,
  });
}

/* -------------------------------------------------------------------------------------------------
 * findUsedCssVariables
 * -----------------------------------------------------------------------------------------------*/

async function findUsedCssVariables(cwd: string, include: string[], ignore?: string[]) {
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore });
  const allCssVariables = entries.flatMap((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const matches = fileContent.matchAll(/(?<cssVar>--[a-z-_]+)("|')?\:/g);
    return Array.from(matches, (match) => match.groups?.cssVar);
  });
  const unique = new Set(allCssVariables);
  return Array.from(unique);
}

/* -------------------------------------------------------------------------------------------------
 * findUsedTokenProperties
 * -----------------------------------------------------------------------------------------------*/

async function findUsedTokenProperties(cwd: string, include: string[], ignore?: string[]) {
  const cssVariables = await findUsedCssVariables(cwd, include, ignore);
  const tokenamiProperties = cssVariables.map((variable) => {
    const validated = Tokenami.TokenProperty.safeParse(variable);
    return validated.success ? [validated.data] : [];
  });
  return tokenamiProperties.flat() as Tokenami.TokenProperty[];
}

/* -------------------------------------------------------------------------------------------------
 * getConfig
 * -----------------------------------------------------------------------------------------------*/

interface GetConfigOptions {
  path?: string;
  include?: string[];
}

function getConfig(cwd: string, opts: GetConfigOptions = {}): Tokenami.Config {
  const configPath = Tokenami.getConfigPath(cwd, opts.path);
  const theirs = fs.existsSync(configPath) ? reloadModule(configPath) : {};
  return Tokenami.mergedConfigs({ ...theirs, include: opts.include || theirs.include });
}

/* -------------------------------------------------------------------------------------------------
 * reloadModule
 * -----------------------------------------------------------------------------------------------*/

function reloadModule(moduleName: string) {
  delete require.cache[require.resolve(moduleName)];
  return require(moduleName);
}

/* -------------------------------------------------------------------------------------------------
 * startTimer
 * -----------------------------------------------------------------------------------------------*/

function startTimer() {
  const start = performance.now();
  return () => {
    const stop = performance.now();
    return Math.round(stop - start);
  };
}

/* ---------------------------------------------------------------------------------------------- */

try {
  run();
} catch (e) {
  log.error(e instanceof Error ? e.message : 'Unknown error occurred.');
}
