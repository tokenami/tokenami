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
    const { name, alias, variants } = Tokenami.getTokenPropertyParts(usedTokenProperty);
    const longhands = Tokenami.getLonghandsForAlias(alias, config);

    for (let property of longhands) {
      if (!isSupportedProperty(property)) continue;
      const specificity = Tokenami.getSpecifictyOrderForCSSProperty(property);
      const propertyConfig = config.properties?.[property];
      const isGridProperty = propertyConfig?.includes('grid') || false;
      const [tkResponsive, ...extraResponsive] = variants.flatMap((v) => [config.responsive?.[v]]);
      const [tkSelector, ...extraSelectors] = variants.flatMap((v) => [config.selectors?.[v]]);
      const valueVar = `var(${Tokenami.tokenProperty(property)})`;
      // variants fallback to initital in case the variant is deselected in dev tools.
      // it will fall back to any non-variant values applied to the same element
      const variantValueVar = `var(${usedTokenProperty}, ${valueVar})`;
      const getStyles = (value: string): Styles => ({ [property]: value });

      function getVariantStyles(value: string) {
        const baseStyle = getStyles(value);
        // we only allow 1 of each to enforce custom selectors for chained variants.
        if (extraResponsive.length || extraSelectors.length) return {};
        return [tkResponsive, tkSelector].reduce((styles, template) => {
          return template ? { [template]: styles } : styles;
        }, baseStyle);
      }

      layers.reset['*'] = {
        ...layers.reset['*'],
        [Tokenami.tokenProperty(property)]: getResetTokenValue(property, config),
      };

      const styles = {
        [selector({ name })]: variants.length
          ? getVariantStyles(isGridProperty ? getGridValue(variantValueVar) : variantValueVar)
          : getStyles(isGridProperty ? getGridValue(valueVar) : valueVar),
      };

      const gridStyles = {
        [arbitraryGridSelector({ name })]: variants.length
          ? getVariantStyles(variantValueVar)
          : getStyles(valueVar),
      };

      if (tkResponsive) {
        const responsiveLayer = (layers.responsive[tkResponsive] ??= [{}]);
        responsiveLayer[specificity] = { ...responsiveLayer[specificity], ...styles };
        if (isGridProperty) {
          responsiveLayer[specificity] = { ...responsiveLayer[specificity], ...gridStyles };
        }
      } else {
        layers.styles[specificity] = { ...layers.styles[specificity], ...styles };
        if (isGridProperty) {
          layers.styles[specificity] = { ...layers.styles[specificity], ...gridStyles };
        }
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
 * selector
 * -----------------------------------------------------------------------------------------------*/

function selector(params: { name: string; value?: string; template?: string }) {
  const { template = '&', name, value = '' } = params || {};
  const tokenProperty = Tokenami.tokenProperty(name);
  return template.replace('&', `[style*="${tokenProperty}:${value}"]`);
}

/* -------------------------------------------------------------------------------------------------
 * arbitraryGridSelector
 * -----------------------------------------------------------------------------------------------*/

function arbitraryGridSelector(params: Parameters<typeof selector>[0]) {
  const noSpace = selector({ ...params, value: 'var' });
  const withSpace = selector({ ...params, value: ' var' });
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
