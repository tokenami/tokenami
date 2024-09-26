import { type TokenamiProperties } from '@tokenami/css';
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
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import pkgJson from './../package.json';

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
      const typeDefs = utils.generateTypeDefs(configPath);

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
      const minify = flags.minify;
      const configPath = utils.getConfigPath(cwd, flags.config);
      const browsers = browserslist(null, { env: process.env.NODE_ENV || 'development' });
      const targets = browserslistToTargets(browsers);

      let config: Writeable<Tokenami.Config> = utils.getConfigAtPath(configPath);
      config.include = flags.files || config.include;
      if (!config.include.length) log.error('Provide a glob pattern to include files');

      async function regenerateStylesheet(file: string, config: Tokenami.Config) {
        const generateTime = startTimer();
        const tokens = await findUsedTokens(cwd, config);
        generateStyles({ tokens, cwd, out: flags.output, config, minify, targets });
        log.debug(`Generated styles from ${file} in ${generateTime()}ms.`);
      }

      if (flags.watch) {
        const configWatcher = watch(cwd, [configPath]);
        const tokenWatcher = watch(cwd, config.include, config.exclude);
        log.debug(`Watching for changes to ${config.include}.`);

        tokenWatcher.on('all', (_, file) => regenerateStylesheet(file, config));

        configWatcher.on('all', async (_, file) => {
          try {
            config = utils.getReloadedConfigAtPath(configPath);
            config.include = flags.files || config.include;
            regenerateStylesheet(file, config);
          } catch (e) {
            log.debug(`Skipped change to ${file} with ${e}`);
          }
        });

        process.once('SIGINT', async () => {
          await tokenWatcher.close();
          await configWatcher.close();
        });
      }

      const tokens = await findUsedTokens(cwd, config);
      generateStyles({ tokens, cwd, out: flags.output, config, minify, targets });
      log.debug(`Ready in ${startTime()}ms.`);
    });

  cli.help();
  cli.version(pkgJson.version);
  cli.parse();
};

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

interface UsedTokens {
  properties: Tokenami.TokenProperty[];
  values: Tokenami.TokenValue[];
  composeBlocks: Record<string, TokenamiProperties>;
}

async function findUsedTokens(cwd: string, config: Tokenami.Config): Promise<UsedTokens> {
  const include = config.include as Writeable<typeof config.include>;
  const exclude = config.exclude as Writeable<typeof config.exclude>;
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });
  let tokenProperties: Tokenami.TokenProperty[] = [];
  let tokenValues: Tokenami.TokenValue[] = [];
  let composeBlocks: Record<string, TokenamiProperties> = {};

  entries.forEach((entry) => {
    const fileContent = fs.readFileSync(entry, 'utf8');
    const tokens = matchTokens(fileContent, config.theme);
    const responsiveProperties = matchResponsiveComposeVariants(fileContent, config);
    tokenProperties = [...tokenProperties, ...tokens.properties, ...responsiveProperties];
    tokenValues = [...tokenValues, ...tokens.values];
    composeBlocks = { ...composeBlocks, ...findComposeBlocks(fileContent) };
  });
  return { properties: tokenProperties, values: tokenValues, composeBlocks };
}

/* -------------------------------------------------------------------------------------------------
 * findComposeBlocks
 * -----------------------------------------------------------------------------------------------*/

function findComposeBlocks(fileContent: string) {
  const composeBlocks = fileContent.match(COMPOSE_BLOCKS_REGEX);
  let result: Record<string, TokenamiProperties> | undefined = undefined;

  if (!composeBlocks) return;

  for (const block of composeBlocks) {
    const ast = acorn.parse(block, { ecmaVersion: 'latest' });

    acornWalk.simple(ast, {
      CallExpression(node) {
        const arg = node.arguments[0];
        if (arg?.type !== 'ObjectExpression') return;

        for (const block of arg.properties) {
          if (
            block.type !== 'Property' ||
            block.key.type !== 'Identifier' ||
            block.value.type !== 'ObjectExpression'
          ) {
            continue;
          }

          for (const tokenProperty of block.value.properties) {
            if (
              tokenProperty.type !== 'Property' ||
              tokenProperty.key.type !== 'Literal' ||
              tokenProperty.value.type !== 'Literal'
            ) {
              continue;
            }

            const property = tokenProperty.key.value;
            const value = tokenProperty.value.value;

            result ??= {};
            result[block.key.name] ??= {};
            result![block.key.name]![property as any] = value as any;
          }
        }
      },
    });
  }

  return result as Record<string, TokenamiProperties> | undefined;
}

/* -------------------------------------------------------------------------------------------------
 * matchTokens
 * -----------------------------------------------------------------------------------------------*/

// we match all css variable looking things (including special chars within curly brackets
// for arbitrary selectors) and determine whether they're a tokenami value/property
// based on tokenami config. we purposefully don't match `var(...)` for values because we want
// consumers to be able to pass a generated stylesheet to `includes` to support external design
// system packages (thanks chat gpt for the regex).
const CSS_VARIABLE_REGEX = /--(?:[\w-]+|\{[^\{\}]*\})+/g;

function matchTokens(content: string, theme: Tokenami.Config['theme']) {
  const matches = Array.from(content.replace(/\\/g, '').match(CSS_VARIABLE_REGEX) || []);
  const uniqueMatches = utils.unique(matches);
  const variableMatches = uniqueMatches.filter((match) => match !== Tokenami.gridProperty());

  const values = variableMatches.flatMap((match) => {
    const valueProperty = Tokenami.TokenValue.safeParse(`var(${match})`);
    if (!valueProperty.success) return [];
    const themeValues = utils.getThemeValuesByThemeMode(valueProperty.output, theme);
    return Object.entries(themeValues).length ? [valueProperty.output] : [];
  });

  const properties = variableMatches.flatMap((match) => {
    const tokenProperty = Tokenami.TokenProperty.safeParse(match);
    const isValue = (values as string[]).includes(`var(${match})`);
    if (isValue || !tokenProperty.success) return [];
    return tokenProperty.output;
  });

  return { properties, values };
}

/* -------------------------------------------------------------------------------------------------
 * matchResponsiveComposeVariants
 * -----------------------------------------------------------------------------------------------*/

const COMPOSE_BLOCKS_REGEX = /css\.compose\(\{([\s\S]*?)\}\)/g;

function matchResponsiveComposeVariants(fileContent: string, config: Tokenami.Config) {
  const composeBlocks = fileContent.match(COMPOSE_BLOCKS_REGEX);
  if (!composeBlocks) return [];

  return composeBlocks.flatMap((block) => {
    if (!block.match('responsiveVariants')) return [];
    const ast = acorn.parse(block, { ecmaVersion: 'latest' });
    const responsiveVariants = findResponsiveVariants(ast);
    const tokens = matchTokens(JSON.stringify(responsiveVariants), config.theme);
    return tokens.properties.flatMap((tokenProperty) => {
      return utils.getResponsivePropertyVariants(tokenProperty, config.responsive);
    });
  });
}

/* -------------------------------------------------------------------------------------------------
 * findResponsiveVariants
 * -----------------------------------------------------------------------------------------------*/

function findResponsiveVariants(node: acorn.AnyNode): acorn.Property | null {
  let responsiveVariantsNode = null;

  acornWalk.simple(node, {
    Property(node) {
      if (node.key.type === 'Identifier' && node.key.name === 'responsiveVariants') {
        responsiveVariantsNode = node;
      }
    },
  });

  return responsiveVariantsNode;
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
