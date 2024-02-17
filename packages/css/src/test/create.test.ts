import { describe, beforeEach, it, expect } from 'vitest';
import { hasStyles, hasSomeStyles } from './utils';
import { createCss } from '../css';

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
        aliases: {
          p: ['padding'],
          px: ['padding-left', 'padding-right', 'invalid'],
          py: ['padding-top', 'padding-bottom', 'invalid'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      } as any);

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
      const unexpected = { '--padding-left': 'calc(var(--_grid) * 10)' };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should remove second override padding styles', (context) => {
      const unexpected = {
        '--padding-left': 'calc(var(--_grid) * 20)',
        '--padding-right': 'calc(var(--_grid) * 20)',
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should keep final override style', (context) => {
      const expected = { '--padding': 'calc(var(--_grid) * 40)' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });

    describe('when invoked with reordered aliases', () => {
      beforeEach<TestContext>((context) => {
        const css = createCss({
          aliases: {
            pt: ['padding-top'],
            pr: ['padding-right'],
            pb: ['padding-bottom'],
            pl: ['padding-left'],
            p: ['invalid', 'padding'],
            px: ['padding-left', 'padding-right'],
            py: ['padding-top', 'padding-bottom'],
          },
        } as any);

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
        aliases: {
          p: ['padding'],
          px: ['invalid', 'padding-left', 'padding-right'],
          py: ['invalid', 'padding-top', 'padding-bottom'],
          pt: ['padding-top'],
          pr: ['padding-right'],
          pb: ['padding-bottom'],
          pl: ['padding-left'],
        },
      } as any);

      // @ts-expect-error tests don't have `tokenami.d.ts` so aliases will error here.
      context.output = css({ '--pr': '10px', '--pl': '30px' }, { '--px': 20 });
    });

    it<TestContext>('should override correctly', (context) => {
      expect(context.output).toStrictEqual({
        '--padding-left': 'calc(var(--_grid) * 20)',
        '--padding-right': 'calc(var(--_grid) * 20)',
      });
    });
  });
});
