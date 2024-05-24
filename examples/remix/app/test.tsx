import { css } from './css';

export const expectInvalidPropertiesToError = css({
  // @ts-expect-error
  '--boop': 'boop',
});

export const expectInvalidValuesToError = css({
  // @ts-expect-error
  '--border-color': 'red',
});

export const expectInvalidSelectorToError = css({
  // @ts-expect-error
  '--selector_color': 'var(--color_sky-500)',
});

export const expectInvalidResponsiveSelectorsToError = css({
  // @ts-expect-error
  '--responsive_selector_color': 'var(--color_sky-500)',
});

export const expectInvalidResponsiveWithValidSelectorToError = css({
  // @ts-expect-error
  '--responsive_hover_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveWithInvalidSelectorToError = css({
  // @ts-expect-error
  '--md_selector_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveAndValidSelectorWithInvalidPropertyToError = css({
  // @ts-expect-error
  '--md_hover_boop': 'var(--color_sky-500)',
});

export const expectValidPropertiesToPass = css({
  '--display': 'block',
});

export const expectValidThemeValuesToPass = css({
  '--color': 'var(--color_sky-500)',
});

export const expectValidSelectorToPass = css({
  '--hover_color': 'var(--color_sky-500)',
});

export const expectValidResponsiveSelectorToPass = css({
  '--md_hover_color': 'var(--color_sky-500)',
});
