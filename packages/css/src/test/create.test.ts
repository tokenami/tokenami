import { describe, beforeEach, it, expect } from 'vitest';
import { hasStyles, hasSomeStyles } from './utils';
import { createConfig, css } from '../css';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

const overrides = [{ '--pl': 10 }, { '--px': 20 }, { '--p': 40 }];

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  output: {};
  outputReorderedAliases: {};
}

describe('css returned from createCss', () => {
  describe('when invoked with alias override', () => {
    beforeEach<TestContext>((context) => {
      createConfig({
        aliases: {
          p: ['padding', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
          px: ['padding-left', 'padding-right', 'pl', 'pr'],
          py: ['padding-top', 'padding-bottom', 'pt', 'pb'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      } as any);

      context.output = css({
        '--color': 'var(---, red)',
        '--padding': 'var(---, 10px)',
        '--padding-left': 'var(---, 30px)',
      })(null, ...overrides);
    });

    it<TestContext>('should remove longhand styles', (context) => {
      const unexpected = {
        '--pl': 10,
        '--px': 20,
        '--padding-left': 'var(---, 30px)',
        '--padding': 'var(---, 30px)',
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should keep shorthand styles', (context) => {
      const expected = { '--p': 40 };
      expect(hasStyles(context.output, expected)).toBe(true);
    });

    describe('when invoked with reordered aliases', () => {
      beforeEach<TestContext>((context) => {
        createConfig({
          aliases: {
            pt: ['padding-top'],
            pr: ['padding-right'],
            pb: ['padding-bottom'],
            pl: ['padding-left'],
            p: ['pt', 'pr', 'pb', 'padding', 'pl', 'px', 'py'],
            px: ['pl', 'padding-left', 'pr', 'padding-right'],
            py: ['padding-top', 'pt', 'pb', 'padding-bottom'],
          },
        } as any);

        context.outputReorderedAliases = css({
          '--color': 'var(---, red)',
          '--padding': 'var(---, 10px)',
          '--padding-left': 'var(---, 30px)',
        })(null, ...overrides);
      });

      it<TestContext>('should not change output', (context) => {
        expect(context.outputReorderedAliases).toStrictEqual(context.output);
      });
    });
  });

  describe('when invoked with reordered alias longhands', () => {
    beforeEach<TestContext>((context) => {
      createConfig({
        aliases: {
          p: ['padding', 'pt', 'pr', 'px', 'pl', 'py'],
          px: ['pl', 'pr', 'padding-left', 'padding-right'],
          py: ['pt', 'pb', 'padding-top', 'padding-bottom'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      } as any);

      context.output = css({
        '--pr': '10px',
        '--pl': '30px',
      })(null, { '--px': 20 });
    });

    it<TestContext>('should override correctly', (context) => {
      expect(context.output).toStrictEqual({ '--px': 20 });
    });
  });
});
