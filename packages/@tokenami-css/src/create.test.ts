import { describe, beforeEach, it, expect } from 'vitest';
import { createCss } from './css';
import { hasStyles, hasSomeStyles } from './test-utils';

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
  it('uses each expanded property multiplier for mixed aliases and variants', () => {
    const css = createCss({ aliases: { mixed: ['padding', 'z-index'] } });
    expect(css({ '--hover_mixed': 4 } as any)).toEqual({
      '--hover_padding': 'calc(4 * var(--padding__calc, 1))',
      '--hover_z-index': 'calc(4 * var(--z-index__calc, 1))',
    });
  });

  describe('when invoked with alias override', () => {
    beforeEach<TestContext>((context) => {
      const css = createCss({
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
      const unexpected = { '--padding-left': 'calc(10 * var(--padding-left__calc, 1))' };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should remove second override padding styles', (context) => {
      const unexpected = {
        '--padding-left': 'calc(20 * var(--padding-left__calc, 1))',
        '--padding-right': 'calc(20 * var(--padding-right__calc, 1))',
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should keep final override style', (context) => {
      const expected = { '--padding': 'calc(40 * var(--padding__calc, 1))' };
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
        '--padding-left': 'calc(20 * var(--padding-left__calc, 1))',
        '--padding-right': 'calc(20 * var(--padding-right__calc, 1))',
      });
    });
  });
});
