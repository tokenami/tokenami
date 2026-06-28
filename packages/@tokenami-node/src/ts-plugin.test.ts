import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import ts from 'typescript/lib/tsserverlibrary.js';
import type { Config } from '@tokenami/config';
import { TokenamiDiagnostics } from './ts-plugin/diagnostics';
import { TokenamiCompletions } from './ts-plugin/completions';
import { createTSPlugin } from './ts-plugin/plugin';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageDir = join(currentDir, '..');

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

function getDiagnosticsWithConfig(input: string, config: Config) {
  const sourceFile = createSourceFile(input);
  const diagnostics = new TokenamiDiagnostics(config);
  return diagnostics.getSemanticDiagnostics(sourceFile);
}

function getTypeDiagnosticsWithConfig(input: string, config: string) {
  const fileName = join(currentDir, '__tokenami-plugin-type-test.ts');
  const files = new Map([[fileName, `${config}\n${input}`]]);
  const compilerOptions: ts.CompilerOptions = {
    allowSyntheticDefaultImports: true,
    baseUrl: packageDir,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmit: true,
    paths: {
      '@tokenami/config': ['../@tokenami-config/src'],
    },
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const originalReadFile = host.readFile.bind(host);
  const originalFileExists = host.fileExists.bind(host);

  host.readFile = (name) => files.get(name) ?? originalReadFile(name);
  host.fileExists = (name) => files.has(name) || originalFileExists(name);

  const program = ts.createProgram([fileName], compilerOptions, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.file === program.getSourceFile(fileName))
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
}

function getTypeDiagnostics(input: string, config = '') {
  return getTypeDiagnosticsWithConfig(
    input,
    `
      import './declarations';

      declare module './declarations' {
        interface TokenamiConfig {
          ${config}
          theme: {
            space: { sm: '4px' };
            color: { accent: '#ff0000' };
          };
          properties: {
            padding: ['space'];
            color: ['color'];
          };
          customProperties: {};
          aliases: {};
        }
      }
    `
  );
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

      it('errors on missing theme values referenced by config theme values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                color: {
                  primary: 'red',
                },
                surface: {
                  gradient: 'linear-gradient(var(--color_missing), transparent)',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: { gradient: 'linear-gradient(var(--color_missing), transparent)' },
            },
          }
        );

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain(
          "Config value 'theme.surface.gradient' references 'var(--color_missing)'"
        );
      });

      it('errors on missing theme values resolved from config template literals', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            const color = 'var(--color_missing)';

            createConfig({
              theme: {
                color: {
                  primary: 'red',
                },
                surface: {
                  gradient: \`linear-gradient(\${color}, transparent)\`,
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: { gradient: 'linear-gradient(var(--color_missing), transparent)' },
            },
          }
        );

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain(
          "Config value 'theme.surface.gradient' references 'var(--color_missing)'"
        );
      });

      it('errors on missing tokenami properties referenced by config values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                surface: {
                  gradient: 'linear-gradient(var(--gradient-from), transparent)',
                },
              },
              customProperties: {
                'gradient-to': ['color'],
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              surface: { gradient: 'linear-gradient(var(--gradient-from), transparent)' },
            },
            customProperties: {
              'gradient-to': ['color'],
            },
          }
        );

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain(
          "Config value 'theme.surface.gradient' references '--gradient-from'"
        );
      });

      it('errors on missing config values loaded from spreads', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            const externalTheme = {
              surface: {
                gradient: 'linear-gradient(var(--color_missing), transparent)',
              },
            };

            createConfig({
              theme: {
                ...externalTheme,
                color: {
                  primary: 'red',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: { gradient: 'linear-gradient(var(--color_missing), transparent)' },
            },
          }
        );

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.messageText).toContain(
          "Config value 'theme.surface.gradient' references 'var(--color_missing)'"
        );
      });

      it('reports every missing reference in a config value', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                surface: {
                  gradient: 'linear-gradient(var(--color_missing), var(--space_missing))',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              surface: {
                gradient: 'linear-gradient(var(--color_missing), var(--space_missing))',
              },
            },
          }
        );

        expect(diagnostics).toHaveLength(2);
        expect(diagnostics.map((diagnostic) => diagnostic.messageText)).toEqual([
          expect.stringContaining("references 'var(--color_missing)'"),
          expect.stringContaining("references 'var(--space_missing)'"),
        ]);
      });
    });

    describe('strict type validation', () => {
      it('treats config as loose by default when strict is not defined', () => {
        const diagnostics = getTypeDiagnostics(`
          import type { TokenamiProperties } from './declarations';

          const styles: TokenamiProperties = {
            '--padding': '20px',
          };
        `);

        expect(diagnostics).toEqual([]);
      });

      it('allows arbitrary CSS property values when strict is false', () => {
        const diagnostics = getTypeDiagnostics(
          `
            import type { TokenamiProperties } from './declarations';

            const styles: TokenamiProperties = {
              '--padding': '20px',
              '--color': 'red',
            };
          `,
          'strict: false;'
        );

        expect(diagnostics).toEqual([]);
      });

      it('rejects CSS property values for configured properties when strict is true', () => {
        const diagnostics = getTypeDiagnostics(
          `
            import type { TokenamiProperties } from './declarations';

            const styles: TokenamiProperties = {
              '--padding': '20px',
            };
          `,
          'strict: true;'
        );

        expect(diagnostics).toEqual([expect.stringContaining('Type \'"20px"\' is not assignable')]);
      });

      it('allows CSS property values for unconfigured properties when strict is true', () => {
        const diagnostics = getTypeDiagnostics(
          `
            import type { TokenamiProperties } from './declarations';

            const styles: TokenamiProperties = {
              '--margin': '20px',
            };
          `,
          'strict: true;'
        );

        expect(diagnostics).toEqual([]);
      });
    });

    describe('theme value validation', () => {
      it('accepts existing theme values referenced by config theme values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                color: {
                  primary: 'red',
                },
                surface: {
                  gradient: 'linear-gradient(var(--color_primary), transparent)',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: { gradient: 'linear-gradient(var(--color_primary), transparent)' },
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('accepts references with var fallbacks', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                color: {
                  primary: 'red',
                },
                surface: {
                  gradient: 'linear-gradient(var(--color_primary, red), var(--gradient-from, red))',
                },
              },
              customProperties: {
                'gradient-from': ['color'],
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: {
                gradient: 'linear-gradient(var(--color_primary, red), var(--gradient-from, red))',
              },
            },
            customProperties: {
              'gradient-from': ['color'],
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('accepts existing tokenami properties referenced by config values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                surface: {
                  gradient: 'linear-gradient(var(--gradient-from), transparent)',
                },
              },
              customProperties: {
                'gradient-from': ['color'],
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              surface: { gradient: 'linear-gradient(var(--gradient-from), transparent)' },
            },
            customProperties: {
              'gradient-from': ['color'],
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('ignores non-css config strings', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              include: ['src/--missing.ts'],
              selectors: {
                hover: '&:hover --missing',
              },
              theme: {
                color: {
                  primary: 'red',
                },
              },
            });
          `,
          {
            ...testConfig,
            include: ['src/--missing.ts'],
            selectors: {
              hover: '&:hover --missing',
            },
            theme: {
              color: { primary: 'red' },
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('ignores custom css variables referenced by config values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                surface: {
                  gradient: 'linear-gradient(var(---, red), var(---custom-color), transparent)',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              surface: {
                gradient: 'linear-gradient(var(---, red), var(---custom-color), transparent)',
              },
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('accepts references to theme values loaded from spreads', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            const externalTheme = {
              color: {
                primary: 'red',
              },
            };

            createConfig({
              theme: {
                ...externalTheme,
                surface: {
                  gradient: 'linear-gradient(var(--color_primary), transparent)',
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              color: { primary: 'red' },
              surface: {
                gradient: 'linear-gradient(var(--color_primary), transparent)',
              },
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
      });

      it('accepts mode theme values that reference root theme values', () => {
        const diagnostics = getDiagnosticsWithConfig(
          `
            createConfig({
              theme: {
                root: {
                  color: {
                    primary: 'red',
                  },
                },
                modes: {
                  dark: {
                    surface: {
                      gradient: 'linear-gradient(var(--color_primary), transparent)',
                    },
                  },
                },
              },
            });
          `,
          {
            ...testConfig,
            theme: {
              root: {
                color: { primary: 'red' },
              },
              modes: {
                dark: {
                  surface: { gradient: 'linear-gradient(var(--color_primary), transparent)' },
                },
              },
            },
          }
        );

        expect(diagnostics).toHaveLength(0);
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
