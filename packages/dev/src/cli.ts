import * as Tokenami from '@tokenami/config';
import browserslist from 'browserslist';
import { type Targets, browserslistToTargets } from 'lightningcss';
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
import { require } from './require';

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
    name: 'include',
    message: 'Which file paths should Tokenami watch for its properties?',
    default: './app/**/*.{js,jsx,ts,tsx}',
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
      const include = `'${answers.include}'`;
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
      let config: Writeable<Tokenami.Config> = utils.getConfigAtPath(configPath);

      config.include = flags.files || config.include;
      if (!config.include.length) log.error('Provide a glob pattern to include files');

      async function regenerateStylesheet(file: string, config: Tokenami.Config) {
        const generateTime = startTimer();
        const usedTokens = await findUsedTokenProperties(cwd, config);
        const minify = flags.minify;
        generateStyles({ cwd, out: flags.output, usedTokens, config, minify, targets });
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

      const usedTokens = await findUsedTokenProperties(cwd, config);
      generateStyles({ cwd, out: flags.output, usedTokens, config, minify: flags.minify, targets });
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

function generateStyles(params: {
  cwd: string;
  out: string;
  usedTokens: Tokenami.TokenProperty[];
  config: Tokenami.Config;
  minify?: boolean;
  targets?: Targets;
}) {
  const outDir = pathe.join(params.cwd, pathe.dirname(params.out));
  const outPath = pathe.join(params.cwd, params.out);
  const output = sheet.generate(
    params.usedTokens,
    outPath,
    params.config,
    params.minify,
    params.targets
  );
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

async function findUsedTokenProperties(cwd: string, config: Tokenami.Config) {
  const cssVariables = await findUsedCssVariables(cwd, config);
  const tokenamiProperties = cssVariables.flatMap((variable) => {
    const validated = Tokenami.TokenProperty.safeParse(variable);
    return validated.success ? [validated.data] : [];
  });
  return tokenamiProperties as Tokenami.TokenProperty[];
}

/* -------------------------------------------------------------------------------------------------
 * findUsedCssVariables
 * -----------------------------------------------------------------------------------------------*/

async function findUsedCssVariables(cwd: string, config: Tokenami.Config) {
  const include = config.include as string[];
  const exclude = config.exclude as string[];
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });
  const tokenPropertyRegex = /(?<cssVar>-+[a-z-_]+)("|')?\:/g;
  const allCssVariables = entries.flatMap((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const matches = fileContent.matchAll(tokenPropertyRegex);
    const responsiveVariants = findResponsiveCSSUtilityVariables(fileContent, config.responsive);
    return Array.from(matches, (match) => match.groups?.cssVar).concat(responsiveVariants);
  });
  const unique = new Set(allCssVariables);
  return Array.from(unique);
}

/* -------------------------------------------------------------------------------------------------
 * findResponsiveCSSUtilityVariables
 * -----------------------------------------------------------------------------------------------*/

function findResponsiveCSSUtilityVariables(
  fileContent: string,
  responsiveConfig: Tokenami.Config['responsive']
) {
  const responsiveCssBlockRegex = /css\(([\s\S]*?)\{([\s\S]*?)responsive:\strue([\s\S]*?)\}/g;
  const responsiveCssBlocks = fileContent.match(responsiveCssBlockRegex);
  const tokenPropertyRegex = /(-+[a-z-_]+)('|")/g;
  if (!responsiveCssBlocks) return [];
  return responsiveCssBlocks.flatMap((block) => {
    const matches = block.match(tokenPropertyRegex) || [];
    const matchesWithoutQuoteMark = matches.map((match) => match.slice(0, -1));
    const reponsiveVariants = matchesWithoutQuoteMark.flatMap((tokenProperty) => {
      return utils.getResponsivePropertyVariants(tokenProperty as any, responsiveConfig);
    });
    return reponsiveVariants || [];
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
