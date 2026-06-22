import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build as viteBuild } from 'vite';
import * as tokenami from './index';

const timeout = 60_000;

describe('@tokenami/unplugin', () => {
  it('exposes the Vite adapter as a named export', () => {
    expect(tokenami.vite).toBeTypeOf('function');
  });

  it(
    'allows the stylesheet import path to be customized',
    async () => {
      const fixture = await createFixture({
        importStyles: true,
        output: 'src/styles/theme.css',
        styleImport: './styles/theme.css',
      });

      try {
        await viteBuild({
          root: fixture.root,
          configFile: false,
          logLevel: 'silent',
          plugins: [tokenami.vite({ cwd: fixture.root, output: fixture.output })],
          build: {
            emptyOutDir: true,
            outDir: fixture.dist,
          },
        });

        const cssFile = await findCssFile(fixture.dist, '--color_red');
        expect(await readCssFile(fixture.dist, cssFile)).toContain('--color_red');
      } finally {
        await fixture.remove();
      }
    },
    timeout
  );

  it('transforms the generated stylesheet with Lightning CSS', async () => {
    const fixture = await createFixture({ importStyles: true });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      const css = await readFile(fixture.stylesheet, 'utf8');

      expect(css).toContain('--color_red: red');
      expect(css).toContain('color: var(--color, revert-layer)');
      expect(css).not.toContain('color: var(--color,revert-layer)');
    } finally {
      await fixture.remove();
    }
  });

  it(
    'processes external Tokenami stylesheets',
    async () => {
      const fixture = await createFixture({
        externalStylesheet: '@layer tkc { .acme-button { --color: var(--color_blue); } }',
        importStyles: true,
      });

      try {
        await viteBuild({
          root: fixture.root,
          configFile: false,
          logLevel: 'silent',
          plugins: [tokenami.vite({ cwd: fixture.root, output: fixture.output })],
          build: {
            emptyOutDir: true,
            outDir: fixture.dist,
          },
        });

        const cssFile = await findCssFile(fixture.dist, '.acme-button');
        const css = await readCssFile(fixture.dist, cssFile);

        expect(css).toContain('.acme-button,[style]{color:var(--color, revert-layer)}');
        expect(css).toContain('.acme-button{--color: var(--color_blue)}');
      } finally {
        await fixture.remove();
      }
    },
    timeout
  );

  it(
    'emits tokenami.css during Vite builds',
    async () => {
      const fixture = await createFixture({ importStyles: true });

      try {
        await viteBuild({
          root: fixture.root,
          configFile: false,
          logLevel: 'silent',
          plugins: [tokenami.vite({ cwd: fixture.root, output: fixture.output })],
          build: {
            emptyOutDir: true,
            outDir: fixture.dist,
          },
        });

        const cssFile = await findCssFile(fixture.dist, '--color_red');
        expect(await readCssFile(fixture.dist, cssFile)).toMatchSnapshot();
        expect(await readFile(join(fixture.dist, 'index.html'), 'utf8')).toContain(`/${cssFile}`);
      } finally {
        await fixture.remove();
      }
    },
    timeout
  );

  it(
    'scans Tokenami config includes before emitting CSS during Vite builds',
    async () => {
      const fixture = await createFixture();

      try {
        await writeFile(
          fixture.entry,
          ['import "./style.css";', 'import "./button.js";', 'export {};'].join('\n')
        );
        await writeFile(
          join(fixture.root, 'src/button.js'),
          ['const css = { compose() {} };', 'css.compose({ "--color": "var(--color_red)" });'].join(
            '\n'
          )
        );

        await viteBuild({
          root: fixture.root,
          configFile: false,
          logLevel: 'silent',
          plugins: [tokenami.vite({ cwd: fixture.root, output: fixture.output })],
          build: {
            emptyOutDir: true,
            outDir: fixture.dist,
          },
        });

        const cssFile = await findCssFile(fixture.dist, '--color_red');
        const css = await readCssFile(fixture.dist, cssFile);

        expect(css).toContain('@layer tkc{.');
        expect(css).toContain('--color: var(--color_red)');
      } finally {
        await fixture.remove();
      }
    },
    timeout
  );

  it('updates generated CSS during Vite hot updates', async () => {
    const fixture = await createFixture({ importStyles: true });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      expect(await readFile(fixture.stylesheet, 'utf8')).not.toContain('margin');

      const updatedEntry = [
        'import "./style.css";',
        'document.body.innerHTML = \'<button style="--color: var(--color_red); --background-color: var(--color_blue); --padding: var(--space_sm); --margin: var(--space_sm)">Button</button>\';',
        'export {};',
      ].join('\n');

      const sourceModule = { id: fixture.entry };
      const cssModule = { id: fixture.stylesheet };
      const invalidated: unknown[] = [];
      const modules = await plugin.handleHotUpdate({
        file: fixture.entry,
        read: async () => updatedEntry,
        modules: [sourceModule],
        server: {
          moduleGraph: {
            getModulesByFile(file: string) {
              return file === fixture.stylesheet ? new Set([cssModule]) : undefined;
            },
            getModuleById(id: string) {
              return id === fixture.stylesheet ? cssModule : undefined;
            },
            invalidateModule(module: unknown) {
              invalidated.push(module);
            },
          },
          ws: {
            send() {},
          },
        },
      });

      expect(modules).toEqual([sourceModule, cssModule]);
      expect(invalidated).toEqual([cssModule]);
      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('margin');
    } finally {
      await fixture.remove();
    }
  });

  it('updates generated CSS during Tokenami config hot updates', async () => {
    const fixture = await createFixture({ importStyles: true });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.configResolved({
        build: { minify: false },
        command: 'serve',
        createResolver: () => async () => undefined,
      });
      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('--color_red: red');

      const cssModule = { id: fixture.stylesheet };
      const invalidated: unknown[] = [];
      const reloads: unknown[] = [];
      const config = await readFile(fixture.configPath, 'utf8');
      await writeFile(fixture.configPath, config.replace("'#f00'", "'#123456'"));

      const modules = await plugin.handleHotUpdate({
        file: fixture.configPath,
        read: async () => readFile(fixture.configPath, 'utf8'),
        modules: [],
        server: {
          moduleGraph: {
            getModulesByFile(file: string) {
              return file === fixture.stylesheet ? new Set([cssModule]) : undefined;
            },
            getModuleById(id: string) {
              return id === fixture.stylesheet ? cssModule : undefined;
            },
            invalidateModule(module: unknown) {
              invalidated.push(module);
            },
          },
          ws: {
            send(message: unknown) {
              reloads.push(message);
            },
          },
        },
      });

      expect(modules).toEqual([cssModule]);
      expect(invalidated).toEqual([cssModule]);
      expect(reloads).toEqual([]);
      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('--color_red: #123456');
    } finally {
      await fixture.remove();
    }
  });

  it('pre-scans includes before loading dev CSS', async () => {
    const fixture = await createFixture();

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await writeFile(
        fixture.entry,
        [
          'import "./style.css";',
          'const css = { compose() {} };',
          'css.compose({ "--color": "var(--color_red)" });',
        ].join('\n')
      );

      await plugin.configResolved({
        build: { minify: false },
        command: 'serve',
        createResolver: () => async () => undefined,
      });
      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('var(--color_red)');
    } finally {
      await fixture.remove();
    }
  });

  it('removes unused placeholder layers from dev CSS', async () => {
    const fixture = await createFixture({ importStyles: true });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.configResolved({
        build: { minify: false },
        command: 'serve',
        createResolver: () => async () => undefined,
      });
      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      const css = await readFile(fixture.stylesheet, 'utf8');

      expect(css).toContain('@layer tkb');
      expect(css).not.toMatch(/@layer\s+tks\d/);
      expect(css).not.toMatch(/@layer\s+tkc\d/);
    } finally {
      await fixture.remove();
    }
  });

  it('keeps stale compose classes in dev stylesheets during Vite hot updates', async () => {
    const fixture = await createFixture();

    try {
      const initialEntry = [
        'import "./style.css";',
        'const css = { compose() {} };',
        'css.compose({ "--color": "var(--color_red)" });',
        'export {};',
      ].join('\n');
      const updatedEntry = [
        'import "./style.css";',
        'const css = { compose() {} };',
        'css.compose({ "--color": "var(--color_blue)" });',
        'export {};',
      ].join('\n');
      const nextEntry = [
        'import "./style.css";',
        'const css = { compose() {} };',
        'css.compose({ "--color": "var(--space_sm)" });',
        'export {};',
      ].join('\n');

      await writeFile(fixture.entry, initialEntry);

      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });
      await plugin.transform(initialEntry, fixture.entry);

      const initialCss = await readFile(fixture.stylesheet, 'utf8');
      expect(initialCss).toContain('var(--color_red)');
      expect(initialCss).not.toContain('var(--color_blue)');

      const cssModule = { id: fixture.stylesheet };
      await writeFile(fixture.entry, updatedEntry);
      await plugin.handleHotUpdate({
        file: fixture.entry,
        read: async () => updatedEntry,
        modules: [{ id: fixture.entry }],
        server: {
          moduleGraph: {
            getModulesByFile(file: string) {
              return file === fixture.stylesheet ? new Set([cssModule]) : undefined;
            },
            getModuleById(id: string) {
              return id === fixture.stylesheet ? cssModule : undefined;
            },
            invalidateModule() {},
          },
          ws: {
            send() {},
          },
        },
      });

      const updatedCss = await readFile(fixture.stylesheet, 'utf8');
      expect(updatedCss).toContain('var(--color_red)');
      expect(updatedCss).toContain('var(--color_blue)');

      await writeFile(fixture.entry, nextEntry);
      await plugin.handleHotUpdate({
        file: fixture.entry,
        read: async () => nextEntry,
        modules: [{ id: fixture.entry }],
        server: {
          moduleGraph: {
            getModulesByFile(file: string) {
              return file === fixture.stylesheet ? new Set([cssModule]) : undefined;
            },
            getModuleById(id: string) {
              return id === fixture.stylesheet ? cssModule : undefined;
            },
            invalidateModule() {},
          },
          ws: {
            send() {},
          },
        },
      });

      const nextCss = await readFile(fixture.stylesheet, 'utf8');
      expect(nextCss).toContain('var(--color_red)');
      expect(nextCss).toContain('var(--color_blue)');
      expect(nextCss).toContain('var(--space_sm)');
    } finally {
      await fixture.remove();
    }
  });

  it('removes tokens for deleted files', async () => {
    const fixture = await createFixture();

    try {
      const entry = [
        'import "./style.css";',
        'const css = { compose() {} };',
        'css.compose({ "--color": "var(--color_red)" });',
        'export {};',
      ].join('\n');

      await writeFile(fixture.entry, entry);

      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.configResolved({
        build: { minify: false },
        command: 'serve',
        createResolver: () => async () => undefined,
      });
      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });
      await plugin.transform(entry, fixture.entry);

      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('var(--color_red)');

      await rm(fixture.entry);
      await plugin.watchChange(fixture.entry, { event: 'delete' });

      expect(await readFile(fixture.stylesheet, 'utf8')).not.toContain('var(--color_red)');
    } finally {
      await fixture.remove();
    }
  });

  it('ignores Vite hot updates outside Tokenami config includes', async () => {
    const fixture = await createFixture({ importStyles: true });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });

      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      expect(await readFile(fixture.stylesheet, 'utf8')).not.toContain('margin');

      const ignoredFile = join(fixture.root, 'scripts/ignored.js');
      const modules = await plugin.handleHotUpdate({
        file: ignoredFile,
        read: async () => 'document.body.style = "--margin: var(--space_sm)";',
        modules: [{ id: ignoredFile }],
        server: {
          moduleGraph: {
            getModulesByFile() {
              return new Set([{ id: fixture.stylesheet }]);
            },
            getModuleById() {
              return { id: fixture.stylesheet };
            },
            invalidateModule() {},
          },
          ws: {
            send() {},
          },
        },
      });

      expect(modules).toBeUndefined();
      expect(await readFile(fixture.stylesheet, 'utf8')).not.toContain('margin');
    } finally {
      await fixture.remove();
    }
  });

  it('updates generated CSS during external stylesheet hot updates', async () => {
    const fixture = await createFixture({
      externalStylesheet: '@layer tkc { .acme-initial { --color: var(--color_red); } }',
      importStyles: true,
    });

    try {
      const plugin = createTestPlugin({ cwd: fixture.root, output: fixture.output });
      const externalStylesheet = join(
        fixture.root,
        'node_modules/@acme/design-system/tokenami.css'
      );

      await plugin.configResolved({
        build: { minify: false },
        command: 'serve',
        createResolver: () => async () => externalStylesheet,
      });

      await plugin.buildStart.call({
        addWatchFile() {},
        emitFile() {},
      });

      expect(await readFile(fixture.stylesheet, 'utf8')).not.toContain('.acme-button');

      const invalidated: unknown[] = [];
      const cssModule = { id: fixture.stylesheet };
      const modules = await plugin.handleHotUpdate({
        file: externalStylesheet,
        read: async () => '@layer tkc { .acme-button { --color: var(--color_blue); } }',
        modules: [{ id: externalStylesheet }],
        server: {
          moduleGraph: {
            getModulesByFile(file: string) {
              return file === fixture.stylesheet ? new Set([cssModule]) : undefined;
            },
            getModuleById(id: string) {
              return id === fixture.stylesheet ? cssModule : undefined;
            },
            invalidateModule(module: unknown) {
              invalidated.push(module);
            },
          },
          ws: {
            send() {},
          },
        },
      });

      expect(modules).toEqual([{ id: externalStylesheet }, cssModule]);
      expect(invalidated).toEqual([cssModule]);
      expect(await readFile(fixture.stylesheet, 'utf8')).toContain('.acme-button');
    } finally {
      await fixture.remove();
    }
  });
});

async function createFixture(
  options: {
    externalStylesheet?: string;
    importStyles?: boolean;
    output?: string;
    styleImport?: string;
  } = {}
) {
  const root = join(process.cwd(), '.tmp', `tokenami-unplugin-${randomUUID()}`);
  const src = join(root, 'src');
  const tokenamiDir = join(root, '.tokenami');
  const dist = join(root, 'dist');
  const entry = join(src, 'main.js');
  const configPath = join(tokenamiDir, 'tokenami.config.mjs');
  const output = options.output ?? 'src/style.css';
  const stylesheet = join(root, output);

  await mkdir(src, { recursive: true });
  await mkdir(tokenamiDir, { recursive: true });
  if (options.externalStylesheet) {
    const externalPackagePath = join(root, 'node_modules/@acme/design-system');
    const externalCssPath = join(externalPackagePath, 'tokenami.css');
    await mkdir(externalPackagePath, { recursive: true });
    await writeFile(
      join(externalPackagePath, 'package.json'),
      JSON.stringify({
        name: '@acme/design-system',
        exports: { './tokenami.css': './tokenami.css' },
      })
    );
    await writeFile(externalCssPath, options.externalStylesheet);
  }
  await writeFile(
    join(root, 'index.html'),
    '<!doctype html><html><head></head><body><script type="module" src="/src/main.js"></script></body></html>'
  );
  await writeFile(
    entry,
    [
      options.importStyles ? `import ${JSON.stringify(options.styleImport ?? './style.css')};` : '',
      'document.body.innerHTML = \'<button style="--color: var(--color_red); --background-color: var(--color_blue); --padding: var(--space_sm)">Button</button>\';',
      'export {};',
    ]
      .filter(Boolean)
      .join('\n')
  );
  await writeFile(
    configPath,
    [
      'export default {',
      `  include: ${JSON.stringify(
        [
          './src/**/*.{js,ts,tsx}',
          options.externalStylesheet ? '@acme/design-system/tokenami.css' : undefined,
        ].filter(Boolean)
      )},`,
      "  themeSelector: (mode) => mode === 'root' ? ':root' : `[data-theme=${mode}]`,",
      '  theme: {',
      "    color: { red: '#f00', blue: '#00f' },",
      "    space: { sm: '4px' },",
      '  },',
      '  properties: {',
      "    color: ['color'],",
      "    'background-color': ['color'],",
      "    padding: ['space'],",
      "    margin: ['space'],",
      '  },',
      '};',
    ].join('\n')
  );

  return {
    root,
    dist,
    entry,
    configPath,
    output,
    stylesheet,
    async remove() {
      if (existsSync(root)) await rm(root, { recursive: true, force: true });
    },
  };
}

async function findCssFile(dist: string, content: string) {
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(dist, { recursive: true });
  for (const file of files) {
    const fileName = file.toString();
    if (!fileName.endsWith('.css')) continue;
    const css = await readFile(join(dist, fileName), 'utf8');
    if (css.includes(content)) return fileName;
  }

  throw new Error(`Could not find Tokenami CSS asset in ${dist}`);
}

async function readCssFile(dist: string, file: string) {
  return readFile(join(dist, file), 'utf8');
}

interface TestPlugin {
  buildStart: (this: TestBuildContext) => Promise<void> | void;
  config: (config: Record<string, any>, env: { command: 'build'; mode: string }) => unknown;
  configResolved: (config: TestResolvedConfig) => Promise<void> | void;
  handleHotUpdate: (ctx: TestHmrContext) => Promise<unknown[] | void> | unknown[] | void;
  transform: (code: string, id: string) => Promise<null> | null;
  watchChange: (
    id: string,
    change: { event: 'create' | 'update' | 'delete' }
  ) => Promise<void> | void;
}

interface TestBuildContext {
  addWatchFile: (file: string) => void;
  emitFile: () => void;
}

interface TestResolvedConfig {
  build: { minify: boolean };
  command: 'serve';
  createResolver: () => (id: string) => Promise<string | undefined>;
}

interface TestHmrContext {
  file: string;
  read: () => Promise<string>;
  modules: unknown[];
  server: {
    moduleGraph: {
      getModulesByFile: (file: string) => Set<unknown> | undefined;
      getModuleById: (id: string) => unknown;
      invalidateModule: (module: unknown) => void;
    };
    ws: {
      send: (message?: unknown) => void;
    };
  };
}

function createTestPlugin(options: tokenami.TokenamiUnpluginOptions) {
  const plugin = tokenami.vite(options);
  return plugin as unknown as TestPlugin;
}
