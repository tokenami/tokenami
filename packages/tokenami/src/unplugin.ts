import type * as Tokenami from '@tokenami/config';
import { createUnplugin, type UnpluginFactory, type UnpluginInstance } from 'unplugin';
import browserslist from 'browserslist';
import { browserslistToTargets, type Targets } from 'lightningcss';
import glob from 'fast-glob';
import micromatch from 'micromatch';
import * as fs from 'fs';
import * as pathe from 'pathe';
import * as sheet from './sheet';
import * as utils from './utils';
import { TokenStore } from './core';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

interface TokenamiPluginOptions {
  config?: string;
  minify?: boolean;
  cwd?: string;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/

const VIRTUAL_MODULE_ID = 'tokenami.css';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

/* -------------------------------------------------------------------------------------------------
 * unpluginFactory
 * -----------------------------------------------------------------------------------------------*/

const unpluginFactory: UnpluginFactory<TokenamiPluginOptions | undefined> = (options = {}) => {
  const cwd = options.cwd || process.cwd();
  const configPath = utils.getConfigPath(cwd, options.config);
  const browsersConfig = browserslist(null, { env: process.env.NODE_ENV || 'development' });
  const browsers = browsersConfig.length ? browsersConfig : ['supports css-cascade-layers'];
  const targets: Targets = browserslistToTargets(browsers);
  const minify = options.minify ?? process.env.NODE_ENV === 'production';

  let config: Writeable<Tokenami.Config> = utils.getConfigAtPath(configPath);
  const store = new TokenStore(config);

  // Create matchers for include/exclude patterns using micromatch (already a fast-glob dependency)
  const createMatcher = () => {
    const include = config.include as Writeable<typeof config.include>;
    const exclude = config.exclude as Writeable<typeof config.exclude>;
    return (id: string) => {
      const relativePath = pathe.relative(cwd, id);
      const isIncluded = micromatch.isMatch(relativePath, include);
      const isExcluded = exclude?.length ? micromatch.isMatch(relativePath, exclude) : false;
      return isIncluded && !isExcluded;
    };
  };

  let shouldInclude = createMatcher();

  // Generate CSS from current token store
  const generateCSS = (): string => {
    const tokens = store.getAggregatedTokens();
    if (!tokens.properties.length) return '/* No tokenami styles found */';

    return sheet.generate({
      tokens,
      config: store.getConfig(),
      minify,
      targets,
      output: 'tokenami.css',
    });
  };

  // Initial scan of all files
  const scanAllFiles = async () => {
    const include = config.include as Writeable<typeof config.include>;
    const exclude = config.exclude as Writeable<typeof config.exclude>;
    const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });

    store.clear();
    for (const entry of entries) {
      const fullPath = pathe.join(cwd, entry);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        store.updateFile(fullPath, content);
      } catch {}
    }
  };

  return {
    name: 'unplugin-tokenami',
    enforce: 'pre',

    async buildStart() {
      await scanAllFiles();
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return generateCSS();
      }
    },

    transformInclude(id) {
      // Only process files that match the include pattern
      return shouldInclude(id);
    },

    transform(code, id) {
      // Update the token store for this file
      store.updateFile(id, code);
      // Don't modify the source code
      return null;
    },

    // Vite-specific hooks
    vite: {
      configResolved(viteConfig) {
        // Update minify based on Vite's mode if not explicitly set
        if (options.minify === undefined && viteConfig.command === 'build') {
          // minify is already set based on NODE_ENV
        }
      },

      async handleHotUpdate({ file, server, read, modules }) {
        // Check if the changed file is the tokenami config
        if (file === configPath) {
          try {
            config = utils.getConfigAtPath(configPath, { cache: false });
            store.updateConfig(config);
            shouldInclude = createMatcher();
            await scanAllFiles();
          } catch {}
          server.ws.send({ type: 'full-reload' });
          return [];
        }

        // Check if changed file matches include pattern
        if (shouldInclude(file)) {
          try {
            // Use Vite's read() for reliable HMR content
            const content = await read();
            store.updateFile(file, content);
          } catch {
            // File might have been deleted
            store.removeFile(file);
          }

          // Invalidate the CSS module so it regenerates
          const cssMod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
          if (cssMod) {
            server.moduleGraph.invalidateModule(cssMod);
            // Return both the changed file's modules AND the CSS module
            // This ensures the CSS is reloaded alongside the component
            return [...modules, cssMod];
          }
        }
      },

      configureServer(server) {
        // Watch the config file for changes
        server.watcher.add(configPath);
      },
    },

    // webpack-specific hooks
    webpack(compiler) {
      // Watch config file in webpack
      compiler.hooks.afterCompile.tap(
        'unplugin-tokenami',
        (compilation: { fileDependencies: Set<string> }) => {
          compilation.fileDependencies.add(configPath);
        }
      );

      // Handle file changes in watch mode
      compiler.hooks.watchRun.tapAsync(
        'unplugin-tokenami',
        async (_compiler: unknown, callback: () => void) => {
          // Reload config
          try {
            config = utils.getConfigAtPath(configPath, { cache: false });
            store.updateConfig(config);
            shouldInclude = createMatcher();
          } catch {}
          callback();
        }
      );
    },

    // Rollup-specific hooks (also used by Vite in build mode)
    rollup: {
      watchChange(id) {
        if (id === configPath) {
          try {
            config = utils.getConfigAtPath(configPath, { cache: false });
            store.updateConfig(config);
            shouldInclude = createMatcher();
          } catch {}
        } else if (shouldInclude(id)) {
          try {
            const content = fs.readFileSync(id, 'utf8');
            store.updateFile(id, content);
          } catch {
            store.removeFile(id);
          }
        }
      },
    },
  };
};

/* -------------------------------------------------------------------------------------------------
 * unplugin
 * -----------------------------------------------------------------------------------------------*/

const unplugin: UnpluginInstance<TokenamiPluginOptions | undefined, boolean> =
  createUnplugin(unpluginFactory);

/* ---------------------------------------------------------------------------------------------- */

export { unplugin, unpluginFactory, VIRTUAL_MODULE_ID };
export type { TokenamiPluginOptions };

// Default export for convenience
export default unplugin;
