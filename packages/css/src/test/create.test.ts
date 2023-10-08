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

const button = css({
  '---padding': '10px',
  '---padding-left': '30px',
});

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof button;
  output: ReturnType<typeof button>;
}

describe('css returned from createCss', () => {
  beforeEach<TestContext>((context) => {
    context.button = button;
  });

  describe('when invoked with alias override', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button({}, { '---pl': 10 }, { '---px': 20 }, { '---p': 40 });
    });

    it<TestContext>('should remove longhand styles', (context) => {
      const unexpected = {
        '---pl': 10,
        '---px': 20,
        '---padding-left': '30px',
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should add shorthand styles', (context) => {
      const expected = { '---p': 40 };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });
});
