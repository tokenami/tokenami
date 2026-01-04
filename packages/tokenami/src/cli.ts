import ts from 'typescript/lib/tsserverlibrary.js';
import type * as Tokenami from '@tokenami/config';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import cac from 'cac';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as pathe from 'pathe';
import * as sheet from './sheet';
import * as log from './log';
import * as utils from './utils';
import pkgJson from './../package.json';
import { TokenamiDiagnostics } from './ts-plugin';
import { findUsedTokens } from './core';

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
      const projectConfig = getProjectConfig(cwd);

      if (projectConfig) questions.shift();

      const answers = await inquirer.prompt(questions);
      const type = projectConfig?.type ?? answers.type;
      const extensions = projectConfig?.type === 'ts' ? 'ts,tsx' : 'js,jsx';
      const include = `'${answers.folder}/**/*.{${extensions}}'`;
      const configPath = utils.getConfigPath(cwd, flags?.config, type);
      const outDir = pathe.dirname(configPath);
      const initialConfig = utils.generateConfig(include, configPath);
      const typeDefs = utils.generateTypeDefs(configPath);

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(configPath, initialConfig, { flag: 'w' });
      fs.writeFileSync(utils.getTypeDefsPath(configPath), typeDefs, { flag: 'w' });
      log.debug(`Project successfully configured in './tokenami'`);
    });

  cli
    .command('check')
    .option('-c, --config [path]', 'Path to a custom config file')
    .action((_, flags) => {
      const projectConfig = getProjectConfig(cwd);

      if (!projectConfig) {
        log.error('Could not find a valid tsconfig.json.');
      }

      if (projectConfig.error) {
        log.error(`Error reading tsconfig.json: ${projectConfig.error.messageText}`);
      }

      const parsedConfig = ts.parseJsonConfigFileContent(
        projectConfig.config,
        ts.sys,
        process.cwd()
      );
      const program = ts.createProgram({
        rootNames: parsedConfig.fileNames,
        options: parsedConfig.options,
      });

      const configPath = utils.getConfigPath(cwd, flags?.config, projectConfig.type);
      const config: Writeable<Tokenami.Config> = utils.getConfigAtPath(configPath);
      const plugin = new TokenamiDiagnostics(config);
      const formatHost: ts.FormatDiagnosticsHost = {
        getCanonicalFileName: (path) => path,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      };

      for (const sourceFile of program.getSourceFiles()) {
        if (sourceFile.isDeclarationFile || sourceFile.fileName.includes('node_modules')) {
          continue;
        }

        const diagnostics = plugin.getSemanticDiagnostics(sourceFile);
        if (diagnostics.length > 0) {
          console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
          process.exit(1);
        }
      }

      process.exit(0);
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
      const browsersConfig = browserslist(null, { env: process.env.NODE_ENV || 'development' });
      const browsers = browsersConfig.length ? browsersConfig : ['supports css-cascade-layers'];
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
            config = utils.getConfigAtPath(configPath, { cache: false });
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
 * getProjectConfig
 * -----------------------------------------------------------------------------------------------*/

function getProjectConfig(cwd: string) {
  const tsconfigPath = ts.findConfigFile(cwd, ts.sys.fileExists, 'tsconfig.json');

  if (tsconfigPath) {
    const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (config.error) return null;
    return { type: 'ts', ...config } as const;
  }

  const jsconfigPath = ts.findConfigFile(cwd, ts.sys.fileExists, 'jsconfig.json');
  if (jsconfigPath) {
    const config = ts.readConfigFile(jsconfigPath, ts.sys.readFile);
    if (config.error) return null;
    return { type: 'js', ...config } as const;
  }

  return null;
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
