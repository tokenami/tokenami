import { css } from '~/css';

/* -------------------------------------------------------------------------------------------------
 * test cases
 * -----------------------------------------------------------------------------------------------*/

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

/* -------------------------------------------------------------------------------------------------
 * test cases with aliases
 * -----------------------------------------------------------------------------------------------*/

export const expectInvalidAliasesToError = css({
  // @ts-expect-error
  '--s': 2,
});

export const expectInvalidAliasValuesToError = css({
  // @ts-expect-error
  '--p': '2',
});

export const expectValidAliasesToPass = css({
  '--p': 2,
});

export const expectValidAliasesWithResponsiveToPass = css({
  '--md_p': 2,
});

export const expectValidAliasesWithSelectorToPass = css({
  '--hover_p': 2,
});

export const expectValidAliasesWithResponsiveAndSelectorToPass = css({
  '--md_hover_p': 2,
});
