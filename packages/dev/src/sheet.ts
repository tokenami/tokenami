import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

type Styles = { [key: string]: string | Styles };

function generate(
  usedTokenProperties: Tokenami.TokenProperty[],
  output: string,
  config: Tokenami.Config,
  minify?: boolean,
  targets?: lightning.Targets
) {
  // TODO: use `@layers` when lightningcss adds browserslist support for layers
  // https://github.com/parcel-bundler/lightningcss/issues/423#issuecomment-1850055070
  const layers = {
    atRules: {} as any,
    root: { ':root': {} },
    reset: { '*': {} },
    styles: [{}],
    responsive: {} as Record<string, [Styles]>,
  } satisfies Record<string, Styles | [Styles] | Record<string, [Styles]>>;

  if (!usedTokenProperties.length) return '';

  layers.root[':root'] = {
    [Tokenami.tokenProperty('grid')]: config.grid,
    ...Tokenami.getValuesByTokenValueProperty(config.theme),
  };

  Object.entries(config.keyframes || {}).forEach(([name, config]) => {
    layers.atRules[`@keyframes ${name}`] = config;
  });

  usedTokenProperties.forEach((usedTokenProperty) => {
    const parts = Tokenami.getTokenPropertyParts(usedTokenProperty, config);
    if (!parts) return;

    const longhands = Tokenami.getLonghandsForAlias(parts.alias, config);
    const responsive = parts.responsive && config?.responsive?.[parts.responsive];
    const selector = parts.selector && config?.selectors?.[parts.selector];
    const hasVariants = responsive || selector;

    for (let property of longhands) {
      if (!isSupportedProperty(property)) continue;
      const specificity = Tokenami.getSpecifictyOrderForCSSProperty(property);
      const propertyConfig = config.properties?.[property];
      const isGridProperty = propertyConfig?.includes('grid') || false;
      const valueVar = `var(${Tokenami.tokenProperty(property)})`;
      // variants fallback to initital in case the variant is deselected in dev tools.
      // it will fall back to any non-variant values applied to the same element
      const variantValueVar = `var(${usedTokenProperty}, ${valueVar})`;
      const getStyles = (value: string): Styles => ({ [property]: value });

      function getVariantStyles(value: string) {
        const baseStyles = getStyles(value);
        return [responsive].concat(selector).reduce((styles, template) => {
          return template ? { [template]: styles } : styles;
        }, baseStyles);
      }

      // we use property to create a unique key for the selector because an alias
      // selector can apply to multiple properties
      const styles = {
        [`/*${property}*/${createSelector({ name: parts.name })}`]: hasVariants
          ? getVariantStyles(isGridProperty ? getGridValue(variantValueVar) : variantValueVar)
          : getStyles(isGridProperty ? getGridValue(valueVar) : valueVar),
        ...(isGridProperty && {
          [`/*${property}*/${createGridSelector({ name: parts.name })}`]: hasVariants
            ? getVariantStyles(variantValueVar)
            : getStyles(valueVar),
        }),
      };

      layers.reset['*'] = {
        ...layers.reset['*'],
        [Tokenami.tokenProperty(property)]: getResetTokenValue(property, config),
      };

      if (responsive) {
        const responsiveLayer = (layers.responsive[responsive] ??= [{}]);
        responsiveLayer[specificity] = { ...responsiveLayer[specificity], ...styles };
      } else {
        layers.styles[specificity] = { ...layers.styles[specificity], ...styles };
      }
    }
  });

  const sheet = stringify({
    ...layers.atRules,
    ...layers.root,
    ...layers.reset,
    ...Object.assign({}, ...layers.styles),
    ...Object.assign({}, ...Object.values(layers.responsive).flat()),
  });

  const code = Buffer.from(sheet);
  const transformed = lightning.transform({ filename: output, code, minify, targets });
  return transformed.code.toString();
}

function getGridValue(value: string) {
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
 * createGridSelector
 * -----------------------------------------------------------------------------------------------*/

function createGridSelector(params: Parameters<typeof createSelector>[0]) {
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
