import * as ConfigUtils from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import deepmerge from 'deepmerge';
import * as lightning from 'lightningcss';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(
  usedTokenProperties: ConfigUtils.TokenProperty[],
  output: string,
  config: ConfigUtils.Config,
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
  const variantsList: Record<string, any>[] = [];
  const variantsArbitraryList: Record<string, any>[] = [];

  const root = {
    ':root': {
      [ConfigUtils.tokenProperty('grid')]: config.grid,
      ...ConfigUtils.getValuesByTokenValueProperty(config.theme),
    },
  };

  Object.entries(config.keyframes || {}).forEach(([name, config]) => {
    keyframesGroup[`@keyframes ${name}`] = config;
  });

  usedTokenProperties.forEach((tokenProperty) => {
    const tokenPropertyName = ConfigUtils.getTokenPropertyName(tokenProperty);
    const tokenPropertyParts = ConfigUtils.getTokenPropertyParts(tokenPropertyName, config);
    const { alias, properties, media, pseudoClass, pseudoElement, variants } = tokenPropertyParts;
    const hasVariants = variants?.length || !!pseudoClass || !!pseudoElement;

    const resetSelector = uniqueSelector(tokenProperty);
    resetGroup[resetSelector('*')] = { [tokenProperty]: 'var(--_tk-i)' };

    properties.forEach((cssProperty: ConfigUtils.CSSProperty) => {
      const specificity = ConfigUtils.getSpecifictyOrderForCSSProperty(cssProperty);
      const cssPropertySelector = uniqueSelector(cssProperty);
      const cssPropertyConfig = config.properties?.[cssProperty];
      const isGridProperty = cssPropertyConfig?.includes('grid');
      const gridVar = `var(${ConfigUtils.tokenProperty('grid')})`;
      const valueVar = `var(--_tk-i_${cssProperty})`;
      // variants fallback to initital in case the variant is deselected in dev tools.
      // it will fall back to any non-variant values applied to the same element
      const variantValueVar = `var(${tokenProperty}, ${valueVar})`;
      const variantMaybeGridValue = isGridProperty
        ? `calc(${gridVar} * ${variantValueVar})`
        : variantValueVar;

      initialGroup[cssPropertySelector(selector())] = {
        [`--_tk-i_${cssProperty}`]: getInitialTokenValueVars(cssProperty, config),
      };

      atomicList[specificity] = {
        ...atomicList[specificity],
        [cssPropertySelector(selector({ name: alias }))]: {
          [cssProperty]: isGridProperty ? `calc(${gridVar} * ${valueVar})` : valueVar,
        },
      };

      if (isGridProperty) {
        atomicArbitraryList[specificity] = {
          ...atomicArbitraryList[specificity],
          [cssPropertySelector(arbitraryVarSelector({ name: alias }))]: {
            [cssProperty]: valueVar,
          },
        };
      }

      if (hasVariants) {
        const variantSelector = { ...tokenPropertyParts, name: tokenPropertyName };
        variantsList[specificity] = {
          ...variantsList[specificity],
          [cssPropertySelector(selector(variantSelector))]: {
            [cssProperty]: variantMaybeGridValue,
          },
        };

        if (isGridProperty) {
          variantsArbitraryList[specificity] = {
            ...variantsArbitraryList[specificity],
            [cssPropertySelector(arbitraryVarSelector(variantSelector))]: {
              [cssProperty]: variantValueVar,
            },
          };
        }
      }

      if (media && config.media?.[media]) {
        const breakpointKey = `@media ${config.media[media]}`;
        const mediaSelector = { ...tokenPropertyParts, name: tokenPropertyName };
        breakpointGroup[breakpointKey] = breakpointGroup[breakpointKey] || [];
        breakpointGroup[breakpointKey]![specificity] = {
          ...breakpointGroup[breakpointKey]![specificity],
          [cssPropertySelector(selector(mediaSelector))]: {
            [cssProperty]: variantMaybeGridValue,
          },
        };

        if (isGridProperty) {
          breakpointArbitraryGroup[breakpointKey] = breakpointArbitraryGroup[breakpointKey] || [];
          breakpointArbitraryGroup[breakpointKey]![specificity] = {
            ...breakpointArbitraryGroup[breakpointKey]![specificity],
            [cssPropertySelector(arbitraryVarSelector(mediaSelector))]: {
              [cssProperty]: variantValueVar,
            },
          };
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
    ...Object.assign({}, ...variantsList),
    ...Object.assign({}, ...variantsArbitraryList),
    ...deepmerge(Object.fromEntries(mediaStyles), Object.fromEntries(mediaArbitraryStyles)),
  });

  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify });
  return transformed.code.toString();
}

/* -------------------------------------------------------------------------------------------------
 * selector
 * -----------------------------------------------------------------------------------------------*/

function selector(params?: {
  name?: string;
  value?: string;
  pseudoClass?: string;
  pseudoElement?: string;
  variants?: string[];
}) {
  const { name = '', value = '' } = params || {};
  const tokenProperty = ConfigUtils.tokenProperty(name) + (name ? ':' : '');
  const variants = params?.variants?.length ? '.' + params?.variants.join('.') : '';
  const pseudoElement = params?.pseudoElement ? `::${params.pseudoElement}` : '';
  const pseudoClass = params?.pseudoClass ? `:${params.pseudoClass}` : '';
  return `[style*="${tokenProperty}${value}"]${variants}${pseudoElement}${pseudoClass}`;
}

/* -------------------------------------------------------------------------------------------------
 * arbitraryVarSelector
 * -----------------------------------------------------------------------------------------------*/

function arbitraryVarSelector(params: Parameters<typeof selector>[0]) {
  const noSpace = selector({ ...params, value: 'var' });
  const withSpace = selector({ ...params, value: ' var' });
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

function getInitialTokenValueVars(
  cssProperty: ConfigUtils.CSSProperty,
  config: ConfigUtils.Config
) {
  const aliased = (config.aliases as any)?.[cssProperty] as string[] | undefined;
  const aliases = aliased || [cssProperty];
  return aliases.reduceRight(
    (fallback, alias) => `var(${ConfigUtils.tokenProperty(alias)}, ${fallback})`,
    ''
  );
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
