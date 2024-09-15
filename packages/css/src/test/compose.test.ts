import { describe, beforeEach, it, expect } from 'vitest';
import { css } from '@tokenami/css';
import { hasStyles, hasSomeStyles } from './utils';
import { convertToMediaStyles } from '../css';

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
  '--md_padding__calc': '/*on*/',
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

const styles = css.compose({
  button: {
    ...baseStyles,
    responsiveVariants: {
      disabled: { true: disabledStyles, false: enabledStyles },
      type: { primary: primaryStyles, secondary: secondaryStyles },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof styles.button;
  className: string;
  output: ReturnType<ReturnType<typeof styles.button>[1]>;
}

describe('css compose', () => {
  beforeEach<TestContext>((context) => {
    context.button = styles.button;
  });

  describe('when invoked without a config', () => {
    beforeEach<TestContext>((context) => {
      const [cn, style] = context.button();
      context.className = cn();
      context.output = style();
    });

    it<TestContext>('should create button class', (context) => {
      expect(context.className).toEqual('button');
    });

    it<TestContext>('should output no styles', (context) => {
      expect(context.output).toEqual({});
    });
  });

  describe('when invoked with a variant', () => {
    beforeEach<TestContext>((context) => {
      const [, style] = context.button({ type: 'primary' });
      context.output = style();
    });

    it<TestContext>('should not include base styles', (context) => {
      expect(hasStyles(context.output, baseStylesOutput)).toBe(false);
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
      const [, style] = context.button({ md_type: 'secondary' });
      context.output = style();
    });

    it<TestContext>('should not include base styles', (context) => {
      expect(hasStyles(context.output, baseStylesOutput)).toBe(false);
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
      const [, style] = context.button({ type: 'secondary' });
      context.output = style({ '--color': 'red' } as any, { '--border-color': 'red' } as any);
    });

    it<TestContext>('should not include base styles', (context) => {
      expect(hasStyles(context.output, baseStylesOutput)).toBe(false);
    });

    it<TestContext>('should include override styles', (context) => {
      const expected = { '--color': 'red', '--border-color': 'red', '--font-family': 'serif' };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });

  describe('when invoked with shorthand override', () => {
    beforeEach<TestContext>((context) => {
      const [, style] = context.button({ type: 'secondary' });
      context.output = style(
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
        '--padding': 30,
        '--padding__calc': '/*on*/',
        '--border': '1px dashed',
      };
      expect(hasStyles(context.output, expected)).toBe(true);
    });
  });
});
