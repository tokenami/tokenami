import { describe, beforeEach, it, expect } from 'vitest';
import { hasStyles, hasSomeStyles } from './utils';
import { css, convertToMediaStyles } from '../css';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

// freeze configs to ensure tests fail if `css` mutates them
const baseStyles = Object.freeze({
  '--padding': '10px',
  '--md_padding': 2,
  '--border': '1px solid',
}) as {};

const baseStylesOutput = Object.freeze({
  ...baseStyles,
  '--md_padding': 'calc(var(--_grid) * 2)',
}) as {};

const disabledStyles = Object.freeze({
  '--font-weight': 'normal',
}) as {};

const enabledStyles = Object.freeze({
  '--font-weight': 'bold',
}) as {};

const primaryStyles = Object.freeze({
  '--color': 'violet',
  '--border-color': 'darkviolet',
}) as {};

const secondaryStyles = Object.freeze({
  '--color': 'gray',
  '--border-color': 'lightgray',
  '--font-family': 'serif',
}) as {};

const button = css.compose({
  ...baseStyles,
  responsiveVariants: {
    disabled: { true: disabledStyles, false: enabledStyles },
    type: { primary: primaryStyles, secondary: secondaryStyles },
  },
});

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof button;
  output: ReturnType<typeof button>;
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
      expect(context.output).toEqual(baseStylesOutput);
    });
  });

  describe('when invoked with a variant', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button({ type: 'primary' });
    });

    it<TestContext>('should include base styles', (context) => {
      expect(hasStyles(context.output, baseStylesOutput)).toBe(true);
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
      expect(hasStyles(context.output, baseStylesOutput)).toBe(true);
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
        { '--color': 'red' } as any,
        { '--border-color': 'red' } as any
      );
    });

    it<TestContext>('should include base styles', (context) => {
      expect(hasStyles(context.output, baseStylesOutput)).toBe(true);
    });

    it<TestContext>('should include override styles', (context) => {
      const expected = { '--color': 'red', '--border-color': 'red', '--font-family': 'serif' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });

  describe('when invoked with shorthand override', () => {
    beforeEach<TestContext>((context) => {
      context.output = context.button(
        { type: 'secondary' },
        { '--padding-left': 10, '--border': '1px dashed' } as any,
        { '--font': 'arial', '--padding': 30 } as any
      );
    });

    it<TestContext>('should remove longhand styles', (context) => {
      const unexpected = {
        '--border-color': 'lightgray',
        '--font-family': 'serif',
        '--padding-left': 10,
      };
      expect(hasSomeStyles(context.output, unexpected)).toBe(false);
    });

    it<TestContext>('should add shorthand styles', (context) => {
      const expected = {
        '--font': 'arial',
        '--padding': 'calc(var(--_grid) * 30)',
        '--border': '1px dashed',
      };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });
});
