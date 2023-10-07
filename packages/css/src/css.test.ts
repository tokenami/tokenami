import { describe, beforeEach, it, expect } from 'vitest';
import { css, convertToMediaStyles } from './css';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

// freeze configs to ensure tests fail if `css` mutates them

const baseStyles = Object.freeze({
  '---padding': '10px',
  '---md_padding': 2,
  '---border': '1px solid',
}) as any;

const disabledStyles = Object.freeze({
  '---font-weight': 'normal',
}) as any;

const enabledStyles = Object.freeze({
  '---font-weight': 'bold',
}) as any;

const primaryStyles = Object.freeze({
  '---color': 'violet',
  '---border-color': 'darkviolet',
}) as any;

const secondaryStyles = Object.freeze({
  '---color': 'gray',
  '---border-color': 'lightgray',
  '---font-family': 'serif',
}) as any;

const button = css(
  baseStyles,
  {
    disabled: { true: disabledStyles, false: enabledStyles },
    type: { primary: primaryStyles, secondary: secondaryStyles },
  },
  { responsive: true }
);

function hasStyles(output: TestContext['output'], expected: Record<string, string | number>) {
  return Object.entries(expected).every(([key, value]) => (output as any)?.[key] === value);
}

function hasSomeStyles(output: TestContext['output'], expected: Record<string, string | number>) {
  return Object.entries(expected).some(([key, value]) => (output as any)?.[key] === value);
}

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof button;
  output?: ReturnType<typeof button>;
}

describe('css', () => {
  beforeEach<TestContext>((context) => {
    context.button = button;
  });

  describe('when invoked without a config', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button();
    });

    it<TestContext>('should output base styles only', (context) => {
      expect(context.output).toEqual(baseStyles);
    });
  });

  describe('when invoked with a variant', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button({ type: 'primary' });
    });

    it<TestContext>('should include base styles', (context) => {
      expect(hasStyles(context.output, baseStyles)).toBe(true);
    });

    it<TestContext>('should include variant styles', (context) => {
      expect(hasStyles(context.output, primaryStyles)).toBe(true);
    });

    it<TestContext>('should not include other variant styles', (context) => {
      expect(hasStyles(context.output, disabledStyles)).toBe(false);
    });
  });

  describe('when invoked with a responsive variant', () => {
    beforeEach<TestContext>((context) => {
      // @ts-expect-error because we haven't declared a theme with `md` breakpoint but
      // that's fine for now because we're testing functionality not types here
      context.output = context.button({ md_type: 'secondary' });
    });

    it<TestContext>('should include base styles', (context) => {
      expect(hasStyles(context.output, baseStyles)).toBe(true);
    });

    it<TestContext>('should not include other variant styles', (context) => {
      expect(hasStyles(context.output, primaryStyles)).toBe(false);
    });

    it<TestContext>('should include responsive variant styles', (context) => {
      expect(hasStyles(context.output, convertToMediaStyles('md', secondaryStyles))).toBe(true);
    });
  });

  describe('when invoked with overrides', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button(
        { type: 'secondary' },
        { '---color': 'red' },
        { '---border-color': 'red' }
      );
    });

    it<TestContext>('should include base styles', (context) => {
      expect(hasStyles(context.output, baseStyles)).toBe(true);
    });

    it<TestContext>('should include override styles', (context) => {
      const expected = { '---color': 'red', '---border-color': 'red', '---font-family': 'serif' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });

  describe('when invoked with shorthand override', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button(
        { type: 'secondary' },
        { '---padding-left': 10, '---border': '1px dashed' },
        { '---font': 'arial', '---padding': 30 }
      );
    });

    it<TestContext>('should remove longhand styles', (context) => {
      const unexpected = {
        '---border-color': 'lightgray',
        '---font-family': 'serif',
        '---padding-left': 10,
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should add shorthand styles', (context) => {
      const expected = { '---font': 'arial', '---padding': 30, '---border': '1px dashed' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });
});
