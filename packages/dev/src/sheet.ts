import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import deepmerge from 'deepmerge';
import * as lightning from 'lightningcss';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(
  usedTokenProperties: Tokenami.TokenProperty[],
  output: string,
  config: Tokenami.Config,
  minify?: boolean
) {
  if (!usedTokenProperties.length) return '';
  // styles are split into these groups so we can control order in stylesheet
  const resetGroup: Record<string, any> = {};
  const initialGroup: Record<string, any> = {};
  const keyframesGroup: Record<string, any> = {};
  const atomicList: Record<string, any>[] = [];
  const atomicArbitraryList: Record<string, any>[] = [];
  const breakpointGroup: Record<string, Record<string, any>[]> = {};
  const breakpointArbitraryGroup: Record<string, Record<string, any>[]> = {};
  const pseudoList: Record<string, any>[] = [];
  const pseudoArbitraryList: Record<string, any>[] = [];

  const root = {
    ':root': {
      [Tokenami.tokenProperty('grid')]: config.grid,
      ...Tokenami.getValuesByTokenValueProperty(config.theme),
    },
  };

  Object.entries(config.keyframes || {}).forEach(([name, config]) => {
    keyframesGroup[`@keyframes ${name}`] = config;
  });

  usedTokenProperties.forEach((tokenProperty) => {
    const tokenPropertyName = Tokenami.getTokenPropertyName(tokenProperty);
    const [alias, variant] = tokenPropertyName.split('_').reverse() as [string, string?];
    const cssProperties = Tokenami.getCSSPropertiesForAlias(alias, config);

    const resetSelector = uniqueSelector(tokenProperty);
    resetGroup[resetSelector('*')] = { [tokenProperty]: 'var(--_tk-i)' };

    cssProperties.forEach((cssProperty: Tokenami.CSSProperty) => {
      const specificity = Tokenami.getSpecifictyOrderForCSSProperty(cssProperty);
      const cssPropertySelector = uniqueSelector(cssProperty);
      const cssPropertyConfig = config.properties?.[cssProperty];
      const isGridProperty = cssPropertyConfig?.includes('grid');
      const gridVar = `var(${Tokenami.tokenProperty('grid')})`;
      const valueVar = `var(--_tk-i_${cssProperty})`;

      initialGroup[cssPropertySelector(selector())] = {
        [`--_tk-i_${cssProperty}`]: getInitialTokenValueVars(cssProperty, config),
      };

      atomicList[specificity] = {
        ...atomicList[specificity],
        [cssPropertySelector(selector(alias))]: {
          [cssProperty]: isGridProperty ? `calc(${gridVar} * ${valueVar})` : valueVar,
        },
      };

      if (isGridProperty) {
        atomicArbitraryList[specificity] = {
          ...atomicArbitraryList[specificity],
          [cssPropertySelector(arbitraryVarSelector(alias))]: { [cssProperty]: valueVar },
        };
      }

      if (variant) {
        const [bpOrPseudo, maybePseudo] = variant.split('-') as [string, string?];
        // we fallback to initital in case the variant is deselected in dev tools.
        // it will fall back to any non-variant values applied to the same element
        const valueVar = `var(${tokenProperty}, var(--_tk-i_${cssProperty}))`;
        const maybeGridValueVar = isGridProperty ? `calc(${gridVar} * ${valueVar})` : valueVar;
        const media = config.media?.[bpOrPseudo];

        if (media) {
          const breakpointKey = `@media ${media}`;
          breakpointGroup[breakpointKey] = breakpointGroup[breakpointKey] || [];
          breakpointGroup[breakpointKey]![specificity] = {
            ...breakpointGroup[breakpointKey]![specificity],
            [cssPropertySelector(selector(tokenPropertyName))]: {
              [cssProperty]: maybeGridValueVar,
            },
          };

          if (isGridProperty) {
            breakpointArbitraryGroup[breakpointKey] = breakpointArbitraryGroup[breakpointKey] || [];
            breakpointArbitraryGroup[breakpointKey]![specificity] = {
              ...breakpointArbitraryGroup[breakpointKey]![specificity],
              [cssPropertySelector(arbitraryVarSelector(tokenPropertyName))]: {
                [cssProperty]: valueVar,
              },
            };
          }
        } else {
          const searchPseudo = maybePseudo || bpOrPseudo;
          const pseudo = Tokenami.pseudoClasses.find((item) => item === `:${searchPseudo}`);
          if (pseudo) {
            pseudoList[specificity] = {
              ...pseudoList[specificity],
              [cssPropertySelector(selector(tokenPropertyName, pseudo))]: {
                [cssProperty]: maybeGridValueVar,
              },
            };

            if (isGridProperty) {
              pseudoArbitraryList[specificity] = {
                ...pseudoArbitraryList[specificity],
                [cssPropertySelector(arbitraryVarSelector(tokenPropertyName, pseudo))]: {
                  [cssProperty]: valueVar,
                },
              };
            }
          }
        }
      }
    });
  });

  const mediaStyles = Object.entries(breakpointGroup).map(([media, styles]) => [
    media,
    Object.assign({}, ...styles),
  ]);

  const mediaArbitraryStyles = Object.entries(breakpointArbitraryGroup).map(([media, styles]) => [
    media,
    Object.assign({}, ...styles),
  ]);

  const sheet = stringify({
    ...root,
    ...resetGroup,
    ...initialGroup,
    ...keyframesGroup,
    ...Object.assign({}, ...atomicList),
    ...Object.assign({}, ...atomicArbitraryList),
    ...Object.assign({}, ...pseudoList),
    ...Object.assign({}, ...pseudoArbitraryList),
    ...deepmerge(Object.fromEntries(mediaStyles), Object.fromEntries(mediaArbitraryStyles)),
  });

  // return sheet;

  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify });
  return transformed.code.toString();
}

/* -------------------------------------------------------------------------------------------------
 * selector
 * -----------------------------------------------------------------------------------------------*/

function selector(alias?: string, pseudo?: string) {
  const tokenProperty = Tokenami.tokenProperty(alias ? `${alias}:` : '');
  return `[style*="${tokenProperty}"]${pseudo || ''}`;
}

/* -------------------------------------------------------------------------------------------------
 * arbitraryVarSelector
 * -----------------------------------------------------------------------------------------------*/

function arbitraryVarSelector(alias: string, pseudo?: string) {
  const tokenProperty = Tokenami.tokenProperty(alias ? `${alias}` : '');
  const noSpace = `[style*="${tokenProperty}:var"]${pseudo || ''}`;
  const withSpace = `[style*="${tokenProperty}: var"]${pseudo || ''}`;
  return `${noSpace}, ${withSpace}`;
}

/* -------------------------------------------------------------------------------------------------
 * uniqueSelector
 * -----------------------------------------------------------------------------------------------*/

function uniqueSelector(cssProperty: string) {
  return (selector: string) => `/*${cssProperty}*/ ${selector}`;
}

/* -------------------------------------------------------------------------------------------------
 * getResetTokenValueVarForAliases
 * -----------------------------------------------------------------------------------------------*/

function getInitialTokenValueVars(cssProperty: Tokenami.CSSProperty, config: Tokenami.Config) {
  const aliased = (config.aliases as any)?.[cssProperty] as string[] | undefined;
  const aliases = aliased || [cssProperty];
  return aliases.reduceRight(
    (fallback, alias) => `var(${Tokenami.tokenProperty(alias)}, ${fallback})`,
    ''
  );
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
