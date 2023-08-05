import type { Config, TokenamiProperty } from '@tokenami/config';
import type { Alias } from '~/utils';
import deepmerge from 'deepmerge';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import { SHEET_CONFIG, getTokenValues } from '@tokenami/config';
import { findProperties } from '~/utils';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(usedTokens: string[], output: string, config: Config) {
  const resetStyles: Record<string, any> = {};
  const initialStyles: Record<string, any> = {};
  const atomicStyles: Record<string, any>[] = [];
  const atomicVarStyles: Record<string, any>[] = [];
  const breakpointStyles: Record<string, Record<string, any>[]> = {};
  const breakpointVarStyles: Record<string, Record<string, any>[]> = {};
  const pseudoStyles: Record<string, any>[] = [];
  const pseudoVarStyles: Record<string, any>[] = [];

  if (!usedTokens.length) return '';

  const root = {
    ':root': {
      '--_': '/**/',
      '---grid': config.theme.grid,
      ...getTokenValues(config.theme),
    },
  };

  for (const usedToken of usedTokens) {
    const usedTokenName = usedToken.replace(/^--/, '');
    const [alias, variant] = usedTokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    resetStyles[`/*${usedToken}*/ *`] = { [usedToken]: 'var(--_tk-i)' };

    for (const [prop, aliases] of properties) {
      const { themeKey } = SHEET_CONFIG.themeConfig[prop] || {};
      const specificityOrder = SHEET_CONFIG.properties.indexOf(prop);
      const isNumericProp = ['sizes', 'grid'].includes(themeKey);
      const value = `var(--_tk-i_${prop})`;

      initialStyles[`/*${prop}*/[style*="--"]`] = {
        [`--_tk-i_${prop}`]: createResetTokens(prop, aliases),
      };

      atomicStyles[specificityOrder] = {
        ...atomicStyles[specificityOrder],
        [`/*${prop}*/${selector(alias)}`]: {
          [prop]: isNumericProp ? `calc(var(---grid) * ${value})` : value,
        },
      };

      if (isNumericProp) {
        atomicVarStyles[specificityOrder] = {
          ...atomicVarStyles[specificityOrder],
          [`/*${prop}*/${arbitraryNumericSelector(alias)}`]: { [prop]: value },
        };
      }

      if (variant) {
        const [bpOrPseudo, maybePseudo] = variant.split('-') as [string, string?];
        const breakpoint = config.theme.breakpoints?.[bpOrPseudo];
        // we fallback to initital in case the variant is deselected in dev tools.
        // it will fall back to any non-variant values applied to the same element
        const value = `var(${usedToken}, var(--_tk-i_${prop}))`;
        const gridValue = isNumericProp ? `calc(var(---grid) * ${value})` : value;

        if (breakpoint) {
          const breakpointKey = `@media ${breakpoint}`;
          breakpointStyles[breakpointKey] = breakpointStyles[breakpointKey] || [];
          breakpointStyles[breakpointKey]![specificityOrder] = {
            ...breakpointStyles[breakpointKey]![specificityOrder],
            [`/*${prop}*/${selector(usedTokenName)}`]: { [prop]: gridValue },
          };

          if (isNumericProp) {
            breakpointVarStyles[breakpointKey] = breakpointVarStyles[breakpointKey] || [];
            breakpointVarStyles[breakpointKey]![specificityOrder] = {
              ...breakpointVarStyles[breakpointKey]![specificityOrder],
              [`/*${prop}*/${arbitraryNumericSelector(usedTokenName)}`]: { [prop]: value },
            };
          }
        } else {
          const pseudo = maybePseudo || bpOrPseudo;
          pseudoStyles[specificityOrder] = {
            ...pseudoStyles[specificityOrder],
            [`/*${prop}*/${selector(usedTokenName, pseudo)}`]: { [prop]: gridValue },
          };

          if (isNumericProp) {
            pseudoVarStyles[specificityOrder] = {
              ...pseudoVarStyles[specificityOrder],
              [`/*${prop}*/${arbitraryNumericSelector(usedTokenName, pseudo)}`]: { [prop]: value },
            };
          }
        }
      }
    }
  }

  const flattenedBpStyles = Object.entries(breakpointStyles).map(([breakpoint, styles]) => [
    breakpoint,
    Object.assign({}, ...styles),
  ]);

  const flattenedBpVarStyles = Object.entries(breakpointVarStyles).map(([breakpoint, styles]) => [
    breakpoint,
    Object.assign({}, ...styles),
  ]);

  const sheet = stringify({
    ...root,
    ...resetStyles,
    ...initialStyles,
    ...Object.assign({}, ...atomicStyles),
    ...Object.assign({}, ...atomicVarStyles),
    ...Object.assign({}, ...pseudoStyles),
    ...Object.assign({}, ...pseudoVarStyles),
    ...deepmerge(Object.fromEntries(flattenedBpStyles), Object.fromEntries(flattenedBpVarStyles)),
  });

  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify: false });
  return transformed.code.toString();
}

/* ---------------------------------------------------------------------------------------------- */

function selector(alias: Alias, pseudo?: string) {
  const pseudoSelector = pseudo ? `:${pseudo}` : '';
  return `[style*="--${alias}:"]${pseudoSelector}`;
}

function arbitraryNumericSelector(alias: Alias, pseudo?: string) {
  const pseudoSelector = pseudo ? `:${pseudo}` : '';
  return `[style*="--${alias}:var"]${pseudoSelector}, [style*="--${alias}: var"]${pseudoSelector}`;
}

function createResetTokens(property: TokenamiProperty, aliases: Alias[]): string {
  const { initial = '' } = SHEET_CONFIG.themeConfig[property] || {};
  return aliases.reduceRight((fallback, alias) => `var(--${alias}, ${fallback}) `, initial);
}

export { generate };
