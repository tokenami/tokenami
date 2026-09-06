import { describe, beforeEach, it, expect } from 'vitest';
import { TokenamiCSS, createCss, css } from './css';

/* -------------------------------------------------------------------------------------------------
 * tests
 * -----------------------------------------------------------------------------------------------*/

interface TestContext {
  output: TokenamiCSS;
}

describe('css utility', () => {
  describe('when called with a grid value', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding-left': 10 });
    });

    it<TestContext>('should convert value to calc', (context) => {
      expect(context.output).toEqual({
        '--padding-left': 'calc(10 * var(--padding-left__calc, 1))',
      });
    });
  });

  describe('when called with a shorthand after a longhand in base styles', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding-left': 10, '--padding': 20 });
    });

    it<TestContext>('should keep the shorthand styles only', (context) => {
      expect(context.output).toEqual({ '--padding': 'calc(20 * var(--padding__calc, 1))' });
    });
  });

  describe('when called with a non-numeric override', () => {
    beforeEach<TestContext>((context) => {
      context.output = css({ '--padding': 20 }, { '--padding': 'var(---, 30px)' });
    });

    it<TestContext>('should replace the numeric calculation', (context) => {
      expect(context.output).toEqual({ '--padding': 'var(---, 30px)' });
    });
  });

  it('should scale explicit numbers and preserve numeric strings', () => {
    const localCss = createCss({});

    expect(localCss({ '--padding': '4' } as any)).toEqual({
      '--padding': '4',
    });
    expect(localCss({ '--padding': 4 })).toEqual({
      '--padding': 'calc(4 * var(--padding__calc, 1))',
    });
  });

  it('should preserve cached inheritance when numeric values are evaluated', () => {
    const localCss = createCss({});
    const inherited = localCss({ '--padding': 'inherit' });
    expect(inherited).toEqual({ '--padding': 'inherit' });
    localCss({ '--padding': 4 });
    expect(localCss({ '--padding': 'inherit' })).toBe(inherited);
  });

  it('should use the app escape configuration for an existing library instance', () => {
    const designSystemCss = createCss({}, { escapeSpecialChars: true });
    createCss({}, { escapeSpecialChars: false });

    expect(designSystemCss({ '--{&:hover}_color': 'red' } as any)).toEqual({
      '--{&;hover}_color': 'red',
    });

    createCss({}, { escapeSpecialChars: true });
  });

  it.each([
    [true, '--\\{\\&\\;hover\\}_padding'],
    [false, '--{&;hover}_padding'],
  ] as const)(
    'should inherit arbitrary-selector calc values with escaping %s',
    (escapeSpecialChars, property) => {
      const localCss = createCss({}, { escapeSpecialChars });

      try {
        expect(localCss({ '--{&:hover}_padding': 'inherit' } as any)).toEqual({
          [property]: 'inherit',
        });
        expect(localCss({ '--{&:hover}_padding': 4 } as any)).toEqual({
          [property]: 'calc(4 * var(--padding__calc, 1))',
        });
        expect(localCss({ '--{&:hover}_padding': 'inherit' } as any)).toEqual({
          [property]: 'inherit',
        });
      } finally {
        createCss({}, { escapeSpecialChars: true });
      }
    }
  );

  it.each([0, -2, 0.5])('should wrap the explicit numeric value %s', (value) => {
    const localCss = createCss({});
    expect(localCss({ '--padding': value } as any)).toEqual({
      '--padding': `calc(${value} * var(--padding__calc, 1))`,
    });
  });

  it.each([
    '0',
    '-2',
    '.5',
    '+4',
    '1e2',
    ' 4 ',
    'var(--space_large)',
    'var(---, 4)',
    'auto',
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
    '10px',
    '10px 20px',
    '50%',
    'calc(2 * 1rem)',
    '',
    ' ',
    '0x10',
    'Infinity',
  ])('should pass through %s without numeric conversion', (value) => {
    const localCss = createCss({});
    expect(localCss({ '--width': value } as any)).toEqual({ '--width': value });
  });

  it('should leave ordinary CSS properties unchanged', () => {
    const localCss = createCss({});
    expect(localCss({ opacity: 0.5, zIndex: 4 } as any)).toEqual({ opacity: 0.5, zIndex: 4 });
  });

  it('should observe input mutations after a cache hit', () => {
    const localCss = createCss({});
    const input = { '--padding': 4 };
    const first = localCss(input);
    expect(localCss(input)).toBe(first);

    input['--padding'] = 5;
    expect(localCss(input)).toEqual({ '--padding': 'calc(5 * var(--padding__calc, 1))' });

    input['--padding'] = 4;
    expect(localCss(input)).toBe(first);
  });

  it.each(['--', '---', '---custom', 'prefix--padding'])(
    'should leave %s unchanged across cache misses',
    (property) => {
      const localCss = createCss({});
      expect(localCss({ [property]: 4 } as any)).toEqual({ [property]: 4 });
      expect(localCss({ [property]: 5 } as any)).toEqual({ [property]: 5 });
    }
  );

  it('should not wrap values again when reusing css output', () => {
    const localCss = createCss({});
    const style = localCss({ '--padding': 4, '--z-index': 2 } as any);
    expect(localCss({}, style)).toEqual(style);
  });
});
