import { describe, beforeEach, it, expect } from 'vitest';
import { generateClassName } from '@tokenami/config';
import { hasStyles, hasSomeStyles } from './utils';
import { css, _COMPOSE, convertToMediaStyles } from '../css';

/* -------------------------------------------------------------------------------------------------
 * setup
 * -----------------------------------------------------------------------------------------------*/

// freeze configs to ensure tests fail if `css` mutates them
const baseStyles = Object.freeze({
  '--padding': '10px',
  '--md_padding': 2,
  '--border': '1px solid',
  '--margin-left': 2,
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

const linkStyles = Object.freeze({
  '--border': '5px solid',
  '--border-color': 'red',
  '--margin': 4,
  '--text-decoration': 'none',
}) as {};

const button = css.compose({
  ...baseStyles,
  responsiveVariants: {
    disabled: { true: disabledStyles, false: enabledStyles },
    type: { primary: primaryStyles, secondary: secondaryStyles },
  },
});

const link = css.compose({
  ...linkStyles,
  variants: {
    disabled: {
      true: { '--opacity': '0.5' } as {},
      false: { '--opacity': '1' } as {},
    },
  },
});

const buttonIncludes = css.compose({
  includes: [link, css({ '--color': 'red' } as {})],
  ...baseStyles,
  variants: {
    disabled: { true: disabledStyles, false: enabledStyles },
    type: { primary: primaryStyles, secondary: secondaryStyles },
  },
});

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  button: typeof button;
  link: typeof link;
  buttonIncludes: typeof buttonIncludes;
  className: string;
  output: ReturnType<ReturnType<typeof button>[1]>;
}

describe('css compose', () => {
  beforeEach<TestContext>((context) => {
    context.button = button;
    context.link = link;
    context.buttonIncludes = buttonIncludes;
  });

  describe('when invoked without a config', () => {
    beforeEach<TestContext>((context) => {
      const [cn, style] = context.button();
      const result = style();
      const { [_COMPOSE]: _, ...styles } = result;
      context.output = styles;
      context.className = cn();
    });

    it<TestContext>('should create button class', (context) => {
      expect(context.className).toEqual(generateClassName(baseStyles));
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

  describe('when invoked with style overrides', () => {
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

  describe('when invoked with compose override', () => {
    beforeEach<TestContext>((context) => {
      const [buttonClassName, buttonStyle] = context.button();
      const [linkClassName, linkStyle] = context.link();
      const result = buttonStyle(
        css({ '--color': 'red' } as any),
        linkStyle(css({ '--border-color': 'green' } as any))
      );
      const { [_COMPOSE]: _, ...styles } = result;
      context.output = styles;
      context.className = buttonClassName(linkClassName());
    });

    it<TestContext>('should chain classes', (context) => {
      const buttonClassName = generateClassName(baseStyles);
      const linkClassName = generateClassName(linkStyles);
      expect(context.className).toBe(`${buttonClassName} ${linkClassName}`);
    });

    it<TestContext>('should override longhands and base style', (context) => {
      expect(context.output).toEqual({
        '--color': 'red',
        '--border': '5px solid',
        '--border-color': 'green',
        '--margin-left': 'initial',
        '--margin-left__calc': 'initial',
      });
    });
  });

  describe('when providing includes', () => {
    beforeEach<TestContext>((context) => {
      const [cn, style] = context.buttonIncludes({ disabled: true });
      const { [_COMPOSE]: composed, ...styles } = style();
      context.output = styles;
      context.className = cn();
    });

    it<TestContext>('should chain classes', (context) => {
      const buttonClassName = generateClassName(baseStyles);
      const linkClassName = generateClassName(linkStyles);
      expect(context.className).toBe(`${linkClassName} ${buttonClassName}`);
    });

    it<TestContext>('should compose includes', (context) => {
      expect(context.output).toEqual({
        '--opacity': '0.5', // inline because it's a link variant
        '--color': 'red', // inline because it's a css util include
        '--border': '1px solid', // inline because it overrides link base style
        '--border-color': 'initial', // inline because it overrides link base style
        '--font-weight': 'normal', // inline because it's a button variant
      });
    });
  });
});
