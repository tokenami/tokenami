import type * as Tokenami from '@tokenami/config';
import { findUsedTokens, generateSheet, TokenStore, type UsedTokens, utils } from '@tokenami/node';
import * as fs from 'node:fs';
import * as pathe from 'pathe';
import { createUnplugin } from 'unplugin';
import { createFilter, normalizePath, type ResolveFn, type ViteDevServer } from 'vite';

const PLUGIN_NAME = 'tokenami';

/* -------------------------------------------------------------------------------------------------
 * tokenami
 * -----------------------------------------------------------------------------------------------*/

interface TokenamiUnpluginOptions {
  /**
   * Project root used to resolve the Tokenami config.
   *
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Path to the Tokenami config file, relative to `cwd` unless absolute.
   */
  config?: string;
  /**
   * Stylesheet output path (hashed in production).
   *
   * @default "tokenami.css"
   */
  output?: string;
}

const tokenami = /* #__PURE__ */ createUnplugin<TokenamiUnpluginOptions | undefined, false>(
  (opts = {}) => {
    const cwd = pathe.resolve(opts.cwd ?? process.cwd());
    const output = opts.output ?? 'tokenami.css';
    const outputPath = pathe.resolve(cwd, output);
    const configPath = utils.getConfigPath(cwd, opts.config);
    const initialConfig = utils.getConfigAtPath(configPath, { cache: false });
    const store = new TokenStore(initialConfig);
    let config = initialConfig;
    let externalStylesheetFiles = new Set<string>();
    let resolveExternalStylesheet: ResolveFn | undefined;
    let command: 'build' | 'serve' = 'serve';
    let sourceFilter = createSourceFilter(cwd, config);

    async function getTokens() {
      return mergeTokens(await findUsedTokens(cwd, config), store.getTokens());
    }

    async function writeStylesheet() {
      const tokens = await getTokens();
      const stylesheet = generateSheet({ tokens, config, output });

      fs.mkdirSync(pathe.dirname(outputPath), { recursive: true });

      try {
        if (fs.readFileSync(outputPath, 'utf8') === stylesheet) return;
      } catch {}

      fs.writeFileSync(outputPath, stylesheet);
    }

    function updateFile(file: string, content: string) {
      store.updateFile(pathe.relative(cwd, file), content, {
        mode: command === 'serve' ? 'hmr' : 'build',
      });
    }

    function removeFile(file: string) {
      const filePath = pathe.relative(cwd, file);
      store.removeFile(filePath);
    }

    function shouldScanFile(file: string) {
      if (pathe.resolve(file) === outputPath) return false;
      return sourceFilter(normalizePath(file));
    }

    async function getStylesheetModules(server: ViteDevServer) {
      await writeStylesheet();

      const modules = server.moduleGraph.getModulesByFile(outputPath);
      if (modules) return Array.from(modules);

      const module = server.moduleGraph.getModuleById(outputPath);
      return module ? [module] : [];
    }

    async function invalidateStylesheetModules(server: ViteDevServer) {
      const modules = await getStylesheetModules(server);

      for (const module of modules) {
        server.moduleGraph.invalidateModule(module);
      }

      return modules;
    }

    async function* scanExternalStylesheets() {
      const externalStylesheets = config.include.filter(isExternalStylesheet);
      if (!externalStylesheets.length) return;
      if (!resolveExternalStylesheet) throw new Error('Vite resolver is not ready.');

      externalStylesheetFiles = new Set();

      for (const stylesheet of externalStylesheets) {
        const file = await resolveExternalStylesheet(stylesheet);
        if (!file) throw new Error(`Could not resolve external stylesheet: ${stylesheet}`);

        externalStylesheetFiles.add(file);
        updateFile(file, fs.readFileSync(file, 'utf8'));
        yield file;
      }
    }

    return {
      name: PLUGIN_NAME,

      async buildStart() {
        config = utils.getConfigAtPath(configPath, { cache: false });
        store.updateConfig(config);
        sourceFilter = createSourceFilter(cwd, config);

        this.addWatchFile(configPath);
        for await (const file of scanExternalStylesheets()) {
          this.addWatchFile(file);
        }

        await writeStylesheet();
      },

      transform(code, id) {
        const file = getFileFromId(id);
        if (!file || !shouldScanFile(file)) return null;

        updateFile(file, code);
        return null;
      },

      async watchChange(id, change) {
        if (change.event !== 'delete') return;
        if (!externalStylesheetFiles.has(id) && !shouldScanFile(id)) return;
        removeFile(id);
        await writeStylesheet();
      },

      vite: {
        configResolved(viteConfig) {
          command = viteConfig.command;
          resolveExternalStylesheet = viteConfig.createResolver();
        },

        async handleHotUpdate(ctx) {
          if (ctx.file === configPath) {
            config = utils.getConfigAtPath(configPath, { cache: false });
            store.updateConfig(config);
            sourceFilter = createSourceFilter(cwd, config);
            store.clear();

            for await (const file of scanExternalStylesheets()) {
              ctx.server.watcher.add(file);
            }

            const modules = await invalidateStylesheetModules(ctx.server);
            if (modules.length) return modules;

            ctx.server.ws.send({ type: 'full-reload' });
            return [];
          }

          if (externalStylesheetFiles.has(ctx.file) || shouldScanFile(ctx.file)) {
            try {
              updateFile(ctx.file, await ctx.read());
            } catch {
              removeFile(ctx.file);
            }
          } else {
            return;
          }

          const cssModules = await invalidateStylesheetModules(ctx.server);
          if (!cssModules.length) return;

          return [...ctx.modules, ...cssModules];
        },
      },
    };
  }
);

/* ---------------------------------------------------------------------------------------------- */

function isExternalStylesheet(pattern: string) {
  return pattern.startsWith('@') || pattern.startsWith('node_modules/');
}

function getFileFromId(id: string) {
  return id.split('?')[0];
}

function createSourceFilter(cwd: string, config: Tokenami.Config) {
  const resolvePath = (pattern: string) => normalizePath(pathe.resolve(cwd, pattern));
  const include = config.include.filter((p) => !isExternalStylesheet(p)).map(resolvePath);
  const exclude = (config.exclude ?? []).map(resolvePath);
  return createFilter(include, exclude);
}

function mergeTokens(a: UsedTokens, b: UsedTokens): UsedTokens {
  return {
    properties: Array.from(new Set([...a.properties, ...b.properties])),
    values: Array.from(new Set([...a.values, ...b.values])),
    composeBlocks: { ...a.composeBlocks, ...b.composeBlocks },
  };
}

const vite = tokenami.vite;

export type { TokenamiUnpluginOptions };
export { vite };
