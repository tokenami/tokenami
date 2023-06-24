import type { Config } from './config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import { PROPERTY_TO_TYPE, ALL_PSEUDO } from './config';

type Theme = Config['theme'];

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(usedTokens: string[], output: string, config: Config) {
  const variantStyles: Record<'pseudo' | string, any> = {};
  const resetStyles: Record<string, any> = {};
  const baseStyles: Record<string, any> = {};

  if (!usedTokens.length) return '';

  const root = {
    ':root': {
      '--space': config.theme.space,
      ...getTokens(config.theme.colors, 'color'),
      ...getTokens(config.theme.radii, 'radii'),
    },
  };

  for (const token of usedTokens) {
    const tokenName = token.replace(/^--/, '');
    const [alias, variant] = tokenName.split('_').reverse() as [string, string?];
    const properties = findProperties(alias, config);

    for (const [prop, aliases] of properties) {
      const isSpace = (PROPERTY_TO_TYPE as any)[prop]?.themeKey === 'space';
      const baseSelector = aliases
        .map((alias: string) => [selector(alias), _selector(alias)])
        .flat()
        .join(', ');

      resetStyles['*'] = {
        ...resetStyles['*'],
        [`--_tk-i_${prop}`]: createResetTokens(prop, aliases),
      };

      baseStyles[baseSelector] = baseStyles[baseSelector] || {
        [`--_tk-${prop}`]: `var(--_tk-i_${prop})`,
        [prop]: isSpace ? `calc(var(--space) * var(--_tk-${prop}))` : `var(--_tk-${prop}, revert)`,
      };

      if (variant) {
        const [bpOrPseudo, maybePseudo] = variant.split('-') as [string, string?];
        const pseudo = maybePseudo || bpOrPseudo;
        const variantSelector = selector(tokenName);
        const pseudoSelector = variantSelector + ':' + pseudo;
        const breakpoint = config.theme.breakpoints[bpOrPseudo];
        const key = breakpoint ? `@media ${breakpoint}` : 'pseudo';
        const keySelector = ALL_PSEUDO.includes(pseudo) ? pseudoSelector : variantSelector;

        variantStyles[key] = variantStyles[key] || {};
        variantStyles[key][keySelector] = {
          ...variantStyles[key][keySelector],
          // we fallback to initital in case the variant is deselected in dev tools
          // it will fall back to any non-variant values applied to the same element
          [`--_tk-${prop}`]: `var(--${tokenName}, var(--_tk-i_${prop}))`,
        };
      }
    }
  }

  const { pseudo, ...bpStyles } = variantStyles;
  const sheet = stringify({ ...root, ...resetStyles, ...baseStyles, ...pseudo, ...bpStyles });
  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify: false });
  return transformed.code.toString();
}

/* -------------------------------------------------------------------------------------------------
 * configTokens
 * -----------------------------------------------------------------------------------------------*/

function configTokens(config: Config) {
  const configBreakpoints = Object.keys(config.theme.breakpoints);
  const allAliases = Object.values(config.aliases || {}).flat();
  const allProperties = [...Object.keys(PROPERTY_TO_TYPE), ...allAliases];
  const tokens = allProperties.map((prop) => {
    const pseudoTokens = ALL_PSEUDO.map((pseudo) => `--${pseudo}_${prop}`);
    const bpTokens = configBreakpoints.map((breakpoint) => `--${breakpoint}_${prop}`);
    return [`--${prop}`, ...pseudoTokens, ...bpTokens];
  });
  return tokens.flat();
}

/* ---------------------------------------------------------------------------------------------- */

function selector(prop: string) {
  return `[style*="--${prop}:"]`;
}

function _selector(prop: string) {
  return `[style*="_${prop}:"]`;
}

function getTokens(themeProperty: Theme[keyof Theme], prefix: string) {
  return Object.entries(themeProperty).reduce(
    (acc, [name, value]) => ({ ...acc, [`--${prefix}-${name}`]: value }),
    {} as Record<string, string>
  );
}

function findProperties(alias: string, config: Config): [string, string[]][] {
  const result = Object.entries(config.aliases || {}).filter(([_, value]) => value.includes(alias));
  return result.length ? result : [[alias, [alias]]];
}

function createResetTokens(property: string, aliases: string[]) {
  const initial = (PROPERTY_TO_TYPE as any)[property]?.initialValue || 'revert';
  return aliases.reduceRight((fallback, alias) => `var(--${alias},${fallback})`, initial as string);
}

export { configTokens, generate };
