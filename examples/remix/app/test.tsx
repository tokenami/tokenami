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
  // @ts-ignore
  '--selector_color': 'var(--color_sky1)',
});

export const expectInvalidResponsiveSelectorsToError = css({
  // @ts-ignore
  '--responsive_selector_color': 'var(--color_sky1)',
});

export const expectInvalidResponsiveWithValidSelectorToError = css({
  // @ts-ignore
  '--responsive_hover_color': 'var(--color_sky1)',
});

export const expectValidResponsiveWithInvalidSelectorToError = css({
  // @ts-ignore
  '--md_selector_color': 'var(--color_sky1)',
});

export const expectValidResponsiveAndValidSelectorWithInvalidPropertyToError = css({
  // @ts-ignore
  '--md_hover_boop': 'var(--color_sky1)',
});

export const expectValidSelectorsWithSpecialCharactersToError = css({
  // @ts-ignore
  '--@md_$hover_color': 'var(--color_sky1)',
});

export const expectValidSelectorsWithArbitrarySelectorToPass = css({
  '--md_{&:hover}_color': 'var(--color_sky1)',
});

export const expectValidPropertiesToPass = css({
  '--display': 'block',
});

export const expectValidThemeValuesToPass = css({
  '--color': 'var(--color_sky1)',
});

export const expectValidSelectorToPass = css({
  '--hover_color': 'var(--color_sky1)',
});

export const expectValidResponsiveSelectorToPass = css({
  '--md_hover_color': 'var(--color_sky1)',
});
