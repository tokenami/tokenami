import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';
import deepmerge from 'deepmerge';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

type Styles = { [key: string]: string | Styles };

function generate(params: {
  tokenEntries: (readonly [Tokenami.TokenProperty, string])[];
  output: string;
  config: Tokenami.Config;
  minify?: boolean;
  targets?: lightning.Targets;
}) {
  const { config, minify, output, targets } = params;
  // TODO: use `@layers` when lightningcss adds browserslist support for layers
  // https://github.com/parcel-bundler/lightningcss/issues/423#issuecomment-1850055070
  const layers = {
    atRules: {} as any,
    root: { ':root': {} },
    reset: { '*': {} },
    styles: [{}],
    varStyles: [{}],
    responsiveStyles: {} as Record<string, [Styles]>,
    varResponsiveStyles: {} as Record<string, [Styles]>,
  } satisfies Record<string, Styles | [Styles] | Record<string, [Styles]>>;

  if (!params.tokenEntries.length) return '';

  const tokenValues = params.tokenEntries.flatMap(([, value]) => {
    const tokenValue = Tokenami.TokenValue.safeParse(value);
    return tokenValue.success ? [tokenValue.output] : [];
  });

  layers.root[':root'] = {
    [Tokenami.tokenProperty('grid')]: config.grid,
    ...utils.getValuesByTokenValueProperty(tokenValues, params.config.theme),
  };

  const themeValues = tokenValues.flatMap((tokenValue) => {
    const parts = Tokenami.getTokenValueParts(tokenValue);
    const value = config.theme[parts.themeKey]?.[parts.token];
    return value == null ? [] : [value];
  });

  Object.entries(params.config.keyframes || {}).forEach(([name, styles]) => {
    const nameRegex = new RegExp(`\\b${name}\\b`);
    const isUsingKeyframeName = themeValues.some((value) => nameRegex.test(String(value)));
    if (isUsingKeyframeName) {
      layers.atRules[`@keyframes ${name}`] = styles;
    }
  });

  params.tokenEntries.forEach(([usedTokenProperty, usedTokenValue]) => {
    const parts = Tokenami.getTokenPropertyParts(usedTokenProperty, config);
    if (!parts) return;

    const longhands = utils.getLonghandsForAlias(parts.alias, config);
    const configResponsive = parts.responsive && config?.responsive?.[parts.responsive];
    const configSelector = parts.selector && config?.selectors?.[parts.selector];
    const hasVariants = configResponsive || configSelector;

    for (let property of longhands) {
      if (!isSupportedProperty(property)) continue;
      const specificity = utils.getSpecifictyOrderForCSSProperty(property);
      const propertyConfig = config.properties?.[property];
      const isGridProperty = propertyConfig?.includes('grid') || false;
      const isGridValue = Tokenami.GridValue.safeParse(usedTokenValue).success;
      const isVarLayer = isGridProperty && !isGridValue;
      const selector = `/*${property}*/${createSelector({ name: parts.name })}`;
      const valueVar = `var(${Tokenami.tokenProperty(property)})`;
      // variants fallback to initital in case the variant is deselected in dev tools.
      // it will fall back to any non-variant values applied to the same element
      const variantValueVar = `var(${usedTokenProperty}, ${valueVar})`;
      const getStyles = (value: string): Styles => ({ [property]: value });
      const getVariantStyles = (value: string) => {
        const baseStyles = getStyles(value);
        return [configResponsive].concat(configSelector).reduce((styles, template) => {
          return template ? { [template]: styles } : styles;
        }, baseStyles);
      };

      const declaration = hasVariants ? getVariantStyles(variantValueVar) : getStyles(valueVar);
      let styles = { [selector]: declaration };

      if (isGridProperty) {
        if (isGridValue) {
          const gridCalcDeclaration = hasVariants
            ? getVariantStyles(getGridCalcValue(variantValueVar))
            : getStyles(getGridCalcValue(valueVar));
          styles = { [selector]: gridCalcDeclaration };
        } else {
          const varSelector = `/*${property}*/${createVarSelector({ name: parts.name })}`;
          styles = { [varSelector]: declaration };
        }
      }

      layers.reset['*'] = {
        ...layers.reset['*'],
        // we set to `var(---)` to activate property fallbacks that reference this alias
        // https://codepen.io/jjenzz/pen/wvOGdrY
        [Tokenami.tokenProperty(parts.alias)]: 'var(---)',
        [Tokenami.tokenProperty(property)]: getResetTokenValue(property, config),
      };

      if (configResponsive) {
        const layer = isVarLayer ? layers.varResponsiveStyles : layers.responsiveStyles;
        const entry = (layer[configResponsive] ??= [{}]);
        entry[specificity] = Object.assign({}, entry[specificity], styles);
      } else {
        const layer = isVarLayer ? layers.varStyles : layers.styles;
        layer[specificity] = Object.assign({}, layer[specificity], styles);
      }
    }
  });

  const responsiveStyles = deepmerge(layers.responsiveStyles, layers.varResponsiveStyles);
  const sheet = Object.assign(
    layers.atRules,
    layers.root,
    layers.reset,
    ...layers.styles,
    ...layers.varStyles,
    ...Object.values(responsiveStyles).flat()
  );

  const code = Buffer.from(stringify(sheet));
  const transformed = lightning.transform({ filename: output, code, minify, targets });
  return transformed.code.toString();
}

function getGridCalcValue(value: string) {
  const gridVar = `var(${Tokenami.tokenProperty('grid')})`;
  return `calc(${gridVar} * ${value})`;
}

/* -------------------------------------------------------------------------------------------------
 * createSelector
 * -----------------------------------------------------------------------------------------------*/

function createSelector(params: { name: string; value?: string; template?: string }) {
  const { template = '&', name, value = '' } = params || {};
  const tokenProperty = Tokenami.tokenProperty(name);
  return template.replace('&', `[style*="${tokenProperty}:${value}"]`);
}

/* -------------------------------------------------------------------------------------------------
 * createVarSelector
 * -----------------------------------------------------------------------------------------------*/

function createVarSelector(params: Parameters<typeof createSelector>[0]) {
  const noSpace = createSelector({ ...params, value: 'var' });
  const withSpace = createSelector({ ...params, value: ' var' });
  return `${noSpace}, ${withSpace}`;
}

/* -------------------------------------------------------------------------------------------------
 * getResetTokenValueVarForAliases
 * -----------------------------------------------------------------------------------------------*/

function getResetTokenValue(cssProperty: Tokenami.CSSProperty, config: Tokenami.Config) {
  const aliased = Object.entries(config.aliases || {}).flatMap(([alias, properties]) => {
    return properties?.includes(cssProperty) ? [alias] : [];
  });
  return aliased.reduce(
    (fallback, alias) => `var(${Tokenami.tokenProperty(alias)}, ${fallback})`,
    ''
  );
}

/* -------------------------------------------------------------------------------------------------
 * isSupportedProperty
 * -----------------------------------------------------------------------------------------------*/

function isSupportedProperty(property: string): property is Tokenami.CSSProperty {
  return Tokenami.properties.includes(property as any);
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
