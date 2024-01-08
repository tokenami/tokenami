import * as Tokenami from '@tokenami/config';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import cac from 'cac';
import glob from 'fast-glob';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as pathe from 'pathe';
import * as sheet from './sheet';
import * as log from './log';
import * as utils from './utils';
import pkgJson from './../package.json';
import { require } from './utils/require';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

const questions = [
  {
    type: 'list',
    name: 'type',
    message: 'TypeScript or JavaScript?',
    choices: [
      { name: 'TypeScript', value: 'ts' },
      { name: 'JavaScript', value: 'js' },
    ],
  },
  {
    type: 'input',
    name: 'folder',
    message: 'What folder should Tokenami watch for token properties?',
    default: './app',
  },
];

const run = () => {
  const cli = cac('tokenami');
  const cwd = process.cwd();

  cli
    .command('init')
    .option('-c, --config [path]', 'Path to a custom config file')
    .action(async (_, flags) => {
      const projectPkgJsonPath = pathe.join(cwd, 'package.json');
      const projectPkgJson = fs.readFileSync(projectPkgJsonPath, 'utf-8');
      const tsconfigPath = pathe.join(cwd, 'tsconfig.json');
      const jsconfigPath = pathe.join(cwd, 'jsconfig.json');
      const hasTsConfig = fs.existsSync(tsconfigPath);
      const hasJsConfig = fs.existsSync(jsconfigPath);
      const hasProjectConfig = hasTsConfig || hasJsConfig;

      if (hasProjectConfig) questions.shift();

      const answers = await inquirer.prompt(questions);
      const type = hasTsConfig ? 'ts' : hasJsConfig ? 'js' : answers.type;
      const extensions = type === 'ts' ? 'ts,tsx' : 'js,jsx';
      const include = `'${answers.folder}/**/*.{${extensions}}'`;
      const configPath = utils.getConfigPath(cwd, flags?.config, type);
      const outDir = pathe.dirname(configPath);
      const initialConfig = utils.generateConfig(include, configPath);
      const ciTypeDefs = utils.generateCiTypeDefs(configPath);
      const typeDefs = projectPkgJson.match('solid-js')
        ? utils.generateSolidJsTypeDefs(configPath)
        : utils.generateTypeDefs(configPath);

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(configPath, initialConfig, { flag: 'w' });
      fs.writeFileSync(utils.getTypeDefsPath(configPath), typeDefs, { flag: 'w' });
      fs.writeFileSync(utils.getCiTypeDefsPath(configPath), ciTypeDefs, { flag: 'w' });
      log.debug(`Project successfully configured in './tokenami'`);
    });

  cli
    .command('[files]', 'Include file glob')
    .option('-c, --config [path]', 'Path to a custom config file')
    .option('-o, --output [path]', 'Output file', { default: 'public/tokenami.css' })
    .option('-w, --watch', 'Watch for changes and rebuild as needed')
    .option('--minify', 'Minify CSS output')
    .action(async (_, flags) => {
      const startTime = startTimer();
      const configPath = utils.getConfigPath(cwd, flags.config);
      const projectPkgJson = require(pathe.join(cwd, 'package.json'));
      const targets = browserslistToTargets(getBrowsersList(projectPkgJson.browserslist));
      const minify = flags.minify;
      let config: Writeable<Tokenami.Config> = utils.getConfigAtPath(configPath);

      config.include = flags.files || config.include;
      if (!config.include.length) log.error('Provide a glob pattern to include files');

      async function regenerateStylesheet(file: string, config: Tokenami.Config) {
        const generateTime = startTimer();
        const usedTokens = await findUsedTokens(cwd, config);
        generateStyles({ ...usedTokens, cwd, out: flags.output, config, minify, targets });
        log.debug(`Generated styles from ${file} in ${generateTime()}ms.`);
      }

      if (flags.watch) {
        const configWatcher = watch(cwd, [configPath]);
        const tokenWatcher = watch(cwd, config.include, config.exclude);
        log.debug(`Watching for changes to ${config.include}.`);

        tokenWatcher.on('all', (_, file) => regenerateStylesheet(file, config));

        configWatcher.on('all', async (_, file) => {
          config = utils.getReloadedConfigAtPath(configPath);
          config.include = flags.files || config.include;
          regenerateStylesheet(file, config);
        });

        process.once('SIGINT', async () => {
          await tokenWatcher.close();
          await configWatcher.close();
        });
      }

      const usedTokens = await findUsedTokens(cwd, config);
      generateStyles({ ...usedTokens, cwd, out: flags.output, config, minify, targets });
      log.debug(`Ready in ${startTime()}ms.`);
    });

  cli.help();
  cli.version(pkgJson.version);
  cli.parse();
};

/* -------------------------------------------------------------------------------------------------
 * getBrowsersList
 * -----------------------------------------------------------------------------------------------*/

function getBrowsersList(config: any) {
  const environment = process.env.NODE_ENV || 'development';
  const isValid = Array.isArray(config) || typeof config === 'string';
  const narrowedConfig = isValid ? config : typeof config === 'object' ? config[environment] : [];
  return browserslist(narrowedConfig);
}

/* -------------------------------------------------------------------------------------------------
 * generateStyles
 * -----------------------------------------------------------------------------------------------*/

type GenerateSheetParams = Parameters<typeof sheet.generate>[0];

function generateStyles(
  params: Omit<GenerateSheetParams, 'output'> & { cwd: string; out: string }
) {
  const { cwd, out, ...generateParams } = params;
  const outDir = pathe.join(cwd, pathe.dirname(out));
  const outPath = pathe.join(cwd, out);
  const output = sheet.generate({ ...generateParams, output: outPath });
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
 * findUsedTokens
 * -----------------------------------------------------------------------------------------------*/

async function findUsedTokens(cwd: string, config: Tokenami.Config) {
  const include = config.include as string[];
  const exclude = config.exclude as string[];
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });
  let allTokenProperties: Tokenami.TokenProperty[] = [];
  let allTokenValues: Tokenami.TokenValue[] = [];

  entries.forEach((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const tokenProperties = matchTokenProperties(fileContent);
    const responsiveProperties = matchResponsiveCssUtilProperties(fileContent, config.responsive);
    const tokenValues = matchTokenValues(fileContent);
    allTokenProperties = [...allTokenProperties, ...tokenProperties, ...responsiveProperties];
    allTokenValues = [...allTokenValues, ...tokenValues];
  });

  return {
    tokenProperties: Array.from(new Set(allTokenProperties)),
    tokenValues: Array.from(new Set(allTokenValues)),
  };
}

/* -------------------------------------------------------------------------------------------------
 * matchTokenProperties
 * -----------------------------------------------------------------------------------------------*/

const CSS_PROPERTY_VAR_REGEX = /(?<!var\()--[\w-]+/g;

function matchTokenProperties(fileContent: string) {
  const matches = fileContent.match(CSS_PROPERTY_VAR_REGEX) || [];
  return matches.flatMap((match) => {
    const tokenProperty = Tokenami.TokenProperty.safeParse(match);
    return tokenProperty.success ? [tokenProperty.output] : [];
  });
}

/* -------------------------------------------------------------------------------------------------
 * matchTokenValues
 * -----------------------------------------------------------------------------------------------*/

const CSS_VALUE_VAR_REGEX = /var\(--[\w-]+\)/g;

function matchTokenValues(fileContent: string) {
  const matches = Array.from(fileContent.matchAll(CSS_VALUE_VAR_REGEX));
  return matches.flatMap(([value]) => {
    const tokenValue = Tokenami.TokenValue.safeParse(value);
    return tokenValue.success ? [tokenValue.output] : [];
  });
}

/* -------------------------------------------------------------------------------------------------
 * matchResponsiveCssUtilProperties
 * -----------------------------------------------------------------------------------------------*/

const RESPONSIVE_TRUE_REGEX = /css\(([\s\S]*?)\{([\s\S]*?)responsive:\strue([\s\S]*?)\}/;

function matchResponsiveCssUtilProperties(
  fileContent: string,
  responsiveConfig: Tokenami.Config['responsive']
) {
  const responsiveCssBlocks = fileContent.match(RESPONSIVE_TRUE_REGEX);
  if (!responsiveCssBlocks) return [];
  return responsiveCssBlocks.flatMap((block) => {
    const matches = matchTokenProperties(block);
    return matches.flatMap((tokenProperty) => {
      return utils.getResponsivePropertyVariants(tokenProperty, responsiveConfig);
    });
  });
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
