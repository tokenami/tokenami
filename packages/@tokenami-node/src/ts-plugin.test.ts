import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript/lib/tsserverlibrary.js';
import type { Config } from '@tokenami/config';
import { TokenamiDiagnostics } from './ts-plugin/diagnostics';
import { TokenamiCompletions } from './ts-plugin/completions';
import { createTSPlugin } from './ts-plugin/plugin';

const testConfig: Config = {
  include: [],
  themeSelector: () => '',
  theme: { color: { accent: '#ff0000' } },
  responsive: {
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
  },
  selectors: {
    hover: '&:hover',
    before: '&::before',
  },
};

function createPluginTestContext(code = '', fileName = 'test.tsx') {
  const cwd = createTokenamiProject(testConfig);
  const languageService = createLanguageService(fileName, code);
  const plugin = createTSPlugin({ typescript: ts }).create({
    languageService,
    config: { configPath: './.tokenami/tokenami.config.cjs' },
    project: {
      getCurrentDirectory: () => cwd,
      projectService: { logger: { info: () => {} } },
      refreshDiagnostics: () => {},
    },
  } as unknown as ts.server.PluginCreateInfo);
  const diagnostics = new TokenamiDiagnostics(testConfig);

  return {
    diagnostics(input: string) {
      const sourceFile = createSourceFile(input);
      return diagnostics.getSemanticDiagnostics(sourceFile);
    },
    quickInfoDocs(search: string) {
      const position = code.indexOf('--color', code.indexOf(search)) + 2;
      const quickInfo = plugin.getQuickInfoAtPosition(fileName, position);
      return quickInfo?.documentation?.map((part) => part.text).join('\n');
    },
  };
}

function createLanguageService(fileName: string, code: string) {
  const files = new Map([[fileName, code]]);
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
  };

  const host: ts.LanguageServiceHost = {
    getCompilationSettings: () => compilerOptions,
    getCurrentDirectory: () => process.cwd(),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    getScriptFileNames: () => Array.from(files.keys()),
    getScriptSnapshot: (name) => {
      const text = files.get(name) ?? ts.sys.readFile(name);
      return text == null ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getScriptVersion: () => '1',
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  };

  return ts.createLanguageService(host);
}

function createTokenamiProject(config: Config) {
  const cwd = mkdtempSync(join(tmpdir(), 'tokenami-ts-plugin-'));
  const configDir = join(cwd, '.tokenami');
  const configPath = join(configDir, 'tokenami.config.cjs');

  mkdirSync(configDir);
  writeFileSync(join(configDir, 'tokenami.env.d.ts'), '');
  writeFileSync(configPath, `module.exports = ${JSON.stringify(config)}`);

  return cwd;
}

function createSourceFile(code: string) {
  return ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

describe('ts plugin', () => {
  it('sorts token value completions by theme config order', () => {
    const completions = new TokenamiCompletions(
      {
        ...testConfig,
        theme: {
          color: {
            zebra: '#000',
            apple: '#111',
            mango: '#222',
          },
        },
      },
      { logger: { log: () => {}, error: () => {} } }
    );

    const result = completions.valueSearch([
      { name: "'var(--color_mango)'", kind: ts.ScriptElementKind.string, sortText: '11' },
      { name: "'var(--color_zebra)'", kind: ts.ScriptElementKind.string, sortText: '11' },
      { name: "'var(--color_apple)'", kind: ts.ScriptElementKind.string, sortText: '11' },
    ]);

    expect(Object.values(result).map((entry) => [entry.name, entry.sortText])).toEqual([
      ['$mango', '$color000002'],
      ['$zebra', '$color000000'],
      ['$apple', '$color000001'],
    ]);
  });

  it('adds quick info documentation for quoted token values in tokenami objects only', () => {
    const fileName = 'test.ts';
    const code = `
      interface TokenamiProperties {
        '--color'?: 'var(--color_accent)';
      }

      declare const css: {
        (styles: TokenamiProperties): void;
        compose(styles: TokenamiProperties): void;
      };

      const plain = { '--color': 'var(--color_accent)' };
      css({ '--color': 'var(--color_accent)' });
      css.compose({ '--color': 'var(--color_accent)' });
    `;
    const ctx = createPluginTestContext(code, fileName);

    expect(ctx.quickInfoDocs('plain =')).not.toContain('#ff0000');
    expect(ctx.quickInfoDocs('css({')).toContain('#ff0000');
    expect(ctx.quickInfoDocs('compose({')).toContain('#ff0000');
  });

  describe('diagnostics', () => {
    const ctx = createPluginTestContext();

    describe('valid usages', () => {
      it('accepts valid base properties', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--padding': 10 });
        `);
        expect(diagnostics).toHaveLength(0);
      });

      it('accepts valid responsive variants', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--md_padding': 10, '--lg_color': 'red' });
        `);
        expect(diagnostics).toHaveLength(0);
      });

      it('accepts valid selectors', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--hover_background-color': 'red', '--before_content': '""' });
        `);
        expect(diagnostics).toHaveLength(0);
      });

      it('accepts valid responsive + selector combinations', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--md_hover_color': 'white' });
        `);
        expect(diagnostics).toHaveLength(0);
      });

      it('accepts arbitrary selectors', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--{&:focus:hover}_background-color': 'red' });
        `);
        expect(diagnostics).toHaveLength(0);
      });
    });

    describe('invalid usages', () => {
      it('errors on invalid responsive variant', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--invalidbp_padding': 10 });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain("Selector 'invalidbp' does not exist");
      });

      it('errors on invalid selector', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--notasel_color': 'red' });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain("Selector 'notasel' does not exist");
      });

      it('errors on invalid combined responsive + selector', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--badbp_hover_color': 'red' });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain('does not exist');
      });

      it('errors on empty arbitrary selector', () => {
        const diagnostics = ctx.diagnostics(`
          css({ '--{}_color': 'red' });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain('Add an arbitrary selector or remove');
      });
    });

    describe('css.compose validation', () => {
      it('errors on spread assignments in compose', () => {
        const diagnostics = ctx.diagnostics(`
          const base = { '--color': 'red' };
          css.compose({ ...base });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain('statically extractable');
      });

      it('errors on computed property names in compose', () => {
        const diagnostics = ctx.diagnostics(`
          const key = '--color';
          css.compose({ [key]: 'red' });
        `);
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain('statically extractable');
      });
    });
  });
});
