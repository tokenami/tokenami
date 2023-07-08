import type { Config, TokenamiProperty } from '@tokenami/config';
import type { Alias } from '~/utils';
import { PROPERTY_TO_TYPE, ALL_PROPERTIES, ALL_PSEUDO } from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import { getTokens, findProperties } from '~/utils';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(usedTokens: string[], output: string, config: Config) {
  const variantStyles: Record<'pseudo' | string, any> = {};
  const resetStyles: Record<string, any> = {};
  const baseStyles: { aliases: Set<Alias>; styles: Record<string, any> }[] = [];

  if (!usedTokens.length) return '';

  const root = {
    ':root': {
      '--space': config.theme.space,
      ...getTokens(config.theme.colors, 'color'),
      ...getTokens(config.theme.radii, 'radii'),
    },
  };

  for (const usedToken of usedTokens) {
    const usedTokenName = usedToken.replace(/^--/, '');
    const [alias, variant] = usedTokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    for (const [prop, aliases] of properties) {
      const propertyConfig = PROPERTY_TO_TYPE[prop];
      const isSpace = propertyConfig.themeKey === 'space';
      const baseSelectorOrder = ALL_PROPERTIES.indexOf(prop);

      resetStyles['*'] = {
        ...resetStyles['*'],
        [usedToken]: 'var(--_tk-i)',
      };

      resetStyles['[style*="--"]'] = {
        ...resetStyles['[style*="--"]'],
        [`--_tk-i_${prop}`]: createResetTokens(prop, aliases),
      };

      baseStyles[baseSelectorOrder] = baseStyles[baseSelectorOrder] || {
        aliases: new Set(),
        styles: {
          [`--_tk-${prop}`]: `var(--_tk-i_${prop})`,
          [prop]: isSpace ? `calc(var(--space) * var(--_tk-${prop}))` : `var(--_tk-${prop})`,
        },
      };
      baseStyles[baseSelectorOrder]?.aliases.add(alias);

      if (variant) {
        const [bpOrPseudo, maybePseudo] = variant.split('-') as [string, string?];
        const pseudo = maybePseudo || bpOrPseudo;
        const variantSelector = selector(usedTokenName);
        const pseudoSelector = variantSelector + ':' + pseudo;
        const breakpoint = config.theme.breakpoints[bpOrPseudo];
        const key = breakpoint ? `@media ${breakpoint}` : 'pseudo';
        const keySelector = ALL_PSEUDO.includes(pseudo) ? pseudoSelector : variantSelector;
        const value = `var(${usedToken}, var(--_tk-i_${prop}))`;

        variantStyles[key] = variantStyles[key] || {};
        variantStyles[key][keySelector] = {
          ...variantStyles[key][keySelector],
          // we fallback to initital in case the variant is deselected in dev tools
          // it will fall back to any non-variant values applied to the same element
          [prop]: isSpace ? `calc(var(--space) * ${value})` : value,
        };
      }
    }
  }

  const { pseudo, ...bpStyles } = variantStyles;

  const sheet = stringify({
    ...root,
    ...resetStyles,
    ...baseStyles.reduce((acc, { aliases, styles }) => {
      const selector = createBaseSelector([...aliases]);
      return { ...acc, [selector]: { ...(acc as any)[selector], ...styles } };
    }, {}),
    ...pseudo,
    ...bpStyles,
  });

  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify: false });
  return transformed.code.toString();
}

/* ---------------------------------------------------------------------------------------------- */

function selector(alias: Alias) {
  return `[style*="--${alias}:"]`;
}

function createBaseSelector(aliases: Alias[]) {
  const selectors = aliases.map((alias) => selector(alias));
  return selectors.join(', ');
}

function createResetTokens(property: TokenamiProperty, aliases: Alias[]): string {
  const propertyConfig = PROPERTY_TO_TYPE[property];
  const initial = 'initial' in propertyConfig ? propertyConfig.initial : '';
  return aliases.reduceRight((fallback, alias) => `var(--${alias}, ${fallback}) `, initial);
}

export { generate };
