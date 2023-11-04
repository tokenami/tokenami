import { describe, beforeEach, it, expect } from 'vitest';
import { hasStyles, hasSomeStyles } from './utils';
import { createCss } from '../css';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

const css = createCss({
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

const cssReorderedAliases = createCss({
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

const button = css({
  '---color': 'red',
  '---padding': '10px',
  '---padding-left': '30px',
});

const buttonReorderedAliases = cssReorderedAliases({
  '---color': 'red',
  '---padding': '10px',
  '---padding-left': '30px',
});

const overrides = [{ '---pl': 10 }, { '---px': 20 }, { '---p': 40 }];

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof button;
  buttonReorderedAliases: typeof buttonReorderedAliases;
  output: ReturnType<typeof button>;
  outputReorderedAliases: ReturnType<typeof buttonReorderedAliases>;
}

describe('css returned from createCss', () => {
  beforeEach<TestContext>((context) => {
    context.button = button;
    context.buttonReorderedAliases = buttonReorderedAliases;
  });

  describe('when invoked with alias override', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button({}, ...overrides);
    });

    it<TestContext>('should remove longhand styles', (context) => {
      const unexpected = { '---pl': 10, '---px': 20, '---padding-left': '30px' };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should keep shorthand styles', (context) => {
      const expected = { '---p': 40 };
      expect(hasStyles(context.output, expected)).toBe(true);
    });

    describe('when invoked with reordered aliases', () => {
      beforeEach<TestContext>((context) => {
        context.outputReorderedAliases = context.buttonReorderedAliases({}, ...overrides);
      });

      it<TestContext>('should not change output', (context) => {
        expect(context.outputReorderedAliases).toStrictEqual(context.output);
      });
    });
  });
});
