import type * as Tokenami from '@tokenami/config';
import {
  createSheet,
  findUsedTokens,
  removeUnusedLayers,
  TokenStore,
  type UsedTokens,
  utils,
} from '@tokenami/node';
import * as fs from 'node:fs';
import * as pathe from 'pathe';
import { createUnplugin } from 'unplugin';
import { createFilter, normalizePath, type ResolveFn } from 'vite';

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
    const configPath = utils.getConfigPath(cwd, opts.config);
    const resolvedOutputId = `\0${output}`;
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
      return sourceFilter(normalizePath(file));
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
      },

      resolveId(id) {
        if (getOutputId(id) !== output) return null;
        return resolvedOutputId;
      },

      async load(id) {
        if (id !== resolvedOutputId) return null;
        const tokens = await getTokens();
        return removeUnusedLayers(createSheet({ tokens, config }));
      },

      transform(code, id) {
        if (id === resolvedOutputId) return null;

        const file = getFileFromId(id);
        if (!file || !shouldScanFile(file)) return null;

        updateFile(file, code);
        return null;
      },

      watchChange(id, change) {
        if (change.event !== 'delete') return;
        if (!externalStylesheetFiles.has(id) && !shouldScanFile(id)) return;
        removeFile(id);
      },

      vite: {
        config(userConfig) {
          const cssMinify = userConfig.build?.minify === false ? false : 'lightningcss';
          return {
            css: { ...userConfig.css, transformer: 'lightningcss' },
            build: { ...userConfig.build, cssMinify },
          };
        },

        configResolved(viteConfig) {
          command = viteConfig.command;
          resolveExternalStylesheet = viteConfig.createResolver();
        },

        generateBundle: {
          order: 'post',
          handler(_, bundle) {
            removeBundleUnusedLayers(bundle);
          },
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

          const cssModule = ctx.server.moduleGraph.getModuleById(resolvedOutputId);
          if (!cssModule) return;

          ctx.server.moduleGraph.invalidateModule(cssModule);
          return [...ctx.modules, cssModule];
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
  return getOutputId(id).split('?')[0];
}

function getOutputId(id: string) {
  return id.replace(/^\0/, '');
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

function removeBundleUnusedLayers(bundle: Record<string, any>) {
  for (const asset of Object.values(bundle)) {
    if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue;
    if (typeof asset.source === 'string') asset.source = removeUnusedLayers(asset.source);
    else asset.source = Buffer.from(removeUnusedLayers(asset.source.toString()));
  }
}

const vite = tokenami.vite;

export type { TokenamiUnpluginOptions };
export { vite };
