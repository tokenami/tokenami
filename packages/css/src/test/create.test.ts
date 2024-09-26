import { describe, beforeEach, it, expect } from 'vitest';
import { createCss } from '@tokenami/css';
import { hasStyles, hasSomeStyles } from './utils';

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
      const css = createCss({
        include: [],
        theme: {},
        aliases: {
          p: ['padding'],
          px: ['padding-left', 'padding-right'],
          py: ['padding-top', 'padding-bottom'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      });

      context.output = css(
        {
          '--color': 'var(---, red)',
          '--padding': 'var(---, 10px)',
          '--padding-left': 'var(---, 30px)',
        },
        ...overrides
      );
    });

    it<TestContext>('should remove base padding styles', (context) => {
      const unexpected = {
        '--padding': 'var(---, 10px)',
        '--padding-left': 'var(---, 30px)',
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should remove first override padding styles', (context) => {
      const unexpected = { '--padding-left': 10 };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should remove second override padding styles', (context) => {
      const unexpected = {
        '--padding-left': 20,
        '--padding-right': 20,
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should keep final override style', (context) => {
      const expected = { '--padding': 40, '--padding__calc': '/*on*/' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });

    describe('when invoked with reordered aliases', () => {
      beforeEach<TestContext>((context) => {
        const css = createCss({
          include: [],
          theme: {},
          aliases: {
            pt: ['padding-top'],
            pr: ['padding-right'],
            pb: ['padding-bottom'],
            pl: ['padding-left'],
            p: ['padding'],
            px: ['padding-left', 'padding-right'],
            py: ['padding-top', 'padding-bottom'],
          },
        });

        context.outputReorderedAliases = css(
          {
            '--color': 'var(---, red)',
            '--padding': 'var(---, 10px)',
            '--padding-left': 'var(---, 30px)',
          },
          ...overrides
        );
      });

      it<TestContext>('should not change output', (context) => {
        expect(context.outputReorderedAliases).toStrictEqual(context.output);
      });
    });
  });

  describe('when invoked with reordered alias longhands', () => {
    beforeEach<TestContext>((context) => {
      const css = createCss({
        include: [],
        theme: {},
        aliases: {
          p: ['padding'],
          px: ['padding-left', 'padding-right'],
          py: ['padding-top', 'padding-bottom'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      });

      // @ts-expect-error tests don't have `tokenami.d.ts` so aliases will error here.
      context.output = css({ '--pr': '10px', '--pl': '30px' }, { '--px': 20 });
    });

    it<TestContext>('should override correctly', (context) => {
      expect(context.output).toStrictEqual({
        '--padding-left': 20,
        '--padding-right': 20,
        '--padding-left__calc': '/*on*/',
        '--padding-right__calc': '/*on*/',
      });
    });
  });
});
