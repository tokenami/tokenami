import type { Config, TokenamiProperty } from '@tokenami/config';
import type { Alias } from '~/utils';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import { SHEET_CONFIG, THEME_CONFIG } from '@tokenami/config';
import { getRootTokens, findProperties } from '~/utils';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(usedTokens: string[], output: string, config: Config) {
  const variantStyles: Record<'pseudo' | string, any> = {};
  const resetStyles: Record<string, any> = {};
  const baseStyles: { aliases: Set<Alias>; styles: Record<string, any> }[] = [];

  if (!usedTokens.length) return '';

  const rootTokens = Object.entries(THEME_CONFIG).map(([key, { prefix }]) => {
    return getRootTokens(config.theme[key as keyof typeof THEME_CONFIG], prefix);
  });

  const root = {
    ':root': {
      '--space': config.theme.space,
      ...Object.assign({}, ...rootTokens),
    },
  };

  for (const usedToken of usedTokens) {
    const usedTokenName = usedToken.replace(/^--/, '');
    const [alias, variant] = usedTokenName.split('_').reverse() as [Alias, string?];
    const properties = findProperties(alias, config);

    for (const [prop, aliases] of properties) {
      const { themeKey } = SHEET_CONFIG.themeConfig[prop] || {};
      const baseSelectorOrder = SHEET_CONFIG.properties.indexOf(prop);
      const isSpace = themeKey === 'space';

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
          [prop]: isSpace ? `calc(var(--space) * var(--_tk-i_${prop}))` : `var(--_tk-i_${prop})`,
        },
      };
      baseStyles[baseSelectorOrder]?.aliases.add(alias);

      if (variant) {
        const [bpOrPseudo, maybePseudo] = variant.split('-') as [string, string?];
        const pseudo = maybePseudo || bpOrPseudo;
        const variantSelector = selector(usedTokenName);
        const pseudoSelector = variantSelector + ':' + pseudo;
        const breakpoint = config.theme.breakpoints?.[bpOrPseudo];
        const value = `var(${usedToken}, var(--_tk-i_${prop}))`;
        const key = breakpoint ? `@media ${breakpoint}` : 'pseudo';
        const keySelector = (SHEET_CONFIG.pseudoClasses as any).includes(':' + pseudo)
          ? pseudoSelector
          : variantSelector;

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
      const selector = createBaseSelector(Array.from(aliases));
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
  const { initial = '' } = SHEET_CONFIG.themeConfig[property] || {};
  return aliases.reduceRight((fallback, alias) => `var(--${alias}, ${fallback}) `, initial);
}

export { generate };
