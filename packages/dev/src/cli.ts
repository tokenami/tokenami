import * as ConfigUtils from '@tokenami/config';
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
    .command('init')
    .option('-c, --config [path]', 'Path to a custom config file')
    .action((_, flags) => {
      const configPath = ConfigUtils.getConfigPath(cwd, flags?.config);
      const typeDefsPath = ConfigUtils.getTypeDefsPath(configPath);
      const outDir = pathe.dirname(configPath);
      const initialConfig = ConfigUtils.generateConfig();
      const typeDefs = ConfigUtils.generateTypeDefs(configPath);

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(configPath, initialConfig, { flag: 'w' });
      fs.writeFileSync(typeDefsPath, typeDefs, { flag: 'w' });
    });

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

      async function regenerateStylesheet(file: string, config: ConfigUtils.Config) {
        const generateTime = startTimer();
        const usedTokenProps = await findUsedTokenProperties(cwd, config);
        generateStyles(cwd, flags.output, usedTokenProps, config, flags.minify);
        log.debug(`Generated styles from ${file} in ${generateTime()}ms.`);
      }

      if (flags.watch) {
        const configWatcher = watch(cwd, [ConfigUtils.getConfigPath(cwd, flags.config)]);
        const tokenWatcher = watch(cwd, config.include, config.exclude);
        log.debug(`Watching for changes to ${config.include}.`);

        tokenWatcher.on('all', (_, file) => regenerateStylesheet(file, config));

        configWatcher.on('all', async (_, file) => {
          const updatedConfig = getConfig(cwd, { path: file, include: flags.files });
          regenerateStylesheet(file, updatedConfig);
          intellisense.generate();
        });

        process.once('SIGINT', async () => {
          await tokenWatcher.close();
          await configWatcher.close();
        });
      }

      const usedTokens = await findUsedTokenProperties(cwd, config);
      generateStyles(cwd, flags.output, usedTokens, config, flags.minify);
      intellisense.generate();
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
  usedTokens: ConfigUtils.TokenProperty[],
  config: ConfigUtils.Config,
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

function watch(cwd: string, include: readonly string[], exclude?: readonly string[]) {
  return chokidar.watch(include, {
    cwd,
    persistent: true,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored: exclude as string[],
  });
}

/* -------------------------------------------------------------------------------------------------
 * findUsedTokenProperties
 * -----------------------------------------------------------------------------------------------*/

async function findUsedTokenProperties(cwd: string, config: ConfigUtils.Config) {
  const cssVariables = await findUsedCssVariables(cwd, config);
  const tokenamiProperties = cssVariables.flatMap((variable) => {
    const validated = ConfigUtils.TokenProperty.safeParse(variable);
    return validated.success ? [validated.data] : [];
  });
  return tokenamiProperties as ConfigUtils.TokenProperty[];
}

/* -------------------------------------------------------------------------------------------------
 * findUsedCssVariables
 * -----------------------------------------------------------------------------------------------*/

async function findUsedCssVariables(cwd: string, config: ConfigUtils.Config) {
  const include = config.include as string[];
  const exclude = config.exclude as string[];
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });
  const tokenPropertyRegex = /(?<cssVar>--[a-z-_]+)("|')?\:/g;
  const allCssVariables = entries.flatMap((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const matches = fileContent.matchAll(tokenPropertyRegex);
    const responsiveVariants = findResponsiveCSSUtilityVariables(fileContent, config);
    return Array.from(matches, (match) => match.groups?.cssVar).concat(responsiveVariants);
  });
  const unique = new Set(allCssVariables);
  return Array.from(unique);
}

/* -------------------------------------------------------------------------------------------------
 * findResponsiveCSSUtilityVariables
 * -----------------------------------------------------------------------------------------------*/

function findResponsiveCSSUtilityVariables(fileContent: string, config: ConfigUtils.Config) {
  const responsiveCssBlockRegex = /css\(([\s\S]*?)\{([\s\S]*?)responsive:\strue([\s\S]*?)\}/g;
  const responsiveCssBlocks = fileContent.match(responsiveCssBlockRegex);
  const tokenPropertyRegex = /(--[a-z-_]+)('|")/g;
  if (!responsiveCssBlocks) return [];
  return responsiveCssBlocks.flatMap((block) => {
    const matches = block.match(tokenPropertyRegex) || [];
    const matchesWithoutQuoteMark = matches.map((match) => match.slice(0, -1));
    const reponsiveVariants = matchesWithoutQuoteMark.flatMap((tokenProperty) => {
      return ConfigUtils.getResponsivePropertyVariants(tokenProperty, config);
    });
    return reponsiveVariants || [];
  });
}

/* -------------------------------------------------------------------------------------------------
 * getConfig
 * -----------------------------------------------------------------------------------------------*/

interface GetConfigOptions {
  path?: string;
  include?: string[];
}

function getConfig(cwd: string, opts: GetConfigOptions = {}): ConfigUtils.Config {
  const configPath = ConfigUtils.getConfigPath(cwd, opts.path);
  const theirs = fs.existsSync(configPath) ? reloadModule(configPath) : {};
  const include = opts.include || theirs.include;
  return ConfigUtils.mergedConfigs({ ...theirs, ...(include && { include }) });
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
