import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { TokenamiDiagnostics } from 'tokenami';
import type { Config } from '@tokenami/config';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

// Minimal config for testing diagnostics (doesn't need full design system)
const testConfig: Config = {
  include: [],
  themeSelector: () => '',
  theme: {},
  responsive: {
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
  },
  selectors: {
    hover: '&:hover',
    before: '&::before',
  },
};

function getDiagnosticsForCode(code: string) {
  const sourceFile = ts.createSourceFile(
    'test.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const diagnostics = new TokenamiDiagnostics(testConfig);
  return diagnostics.getSemanticDiagnostics(sourceFile);
}

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

describe('tokenami diagnostics', () => {
  describe('valid usages (should not error)', () => {
    it('accepts valid base properties', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--padding': 10 });
      `);
      expect(diagnostics).toHaveLength(0);
    });

    it('accepts valid responsive variants', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--md_padding': 10, '--lg_color': 'red' });
      `);
      expect(diagnostics).toHaveLength(0);
    });

    it('accepts valid selectors', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--hover_background-color': 'red', '--before_content': '""' });
      `);
      expect(diagnostics).toHaveLength(0);
    });

    it('accepts valid responsive + selector combinations', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--md_hover_color': 'white' });
      `);
      expect(diagnostics).toHaveLength(0);
    });

    it('accepts arbitrary selectors', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--{&:focus:hover}_background-color': 'red' });
      `);
      expect(diagnostics).toHaveLength(0);
    });
  });

  describe('invalid usages (should error)', () => {
    it('errors on invalid responsive variant', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--invalidbp_padding': 10 });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain("Selector 'invalidbp' does not exist");
    });

    it('errors on invalid selector', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--notasel_color': 'red' });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain("Selector 'notasel' does not exist");
    });

    it('errors on invalid combined responsive + selector', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--badbp_hover_color': 'red' });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain('does not exist');
    });

    it('errors on empty arbitrary selector', () => {
      const diagnostics = getDiagnosticsForCode(`
        css({ '--{}_color': 'red' });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain('Add an arbitrary selector or remove');
    });
  });

  describe('css.compose validation', () => {
    it('errors on spread assignments in compose', () => {
      const diagnostics = getDiagnosticsForCode(`
        const base = { '--color': 'red' };
        css.compose({ ...base });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain('statically extractable');
    });

    it('errors on computed property names in compose', () => {
      const diagnostics = getDiagnosticsForCode(`
        const key = '--color';
        css.compose({ [key]: 'red' });
      `);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].messageText).toContain('statically extractable');
    });
  });
});
