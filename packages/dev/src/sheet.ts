import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';
import deepmerge from 'deepmerge';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

type Styles = { [key: string]: string | Styles };
type TokenEntry = [Tokenami.TokenProperty, string];

function generate(params: {
  atomicEntries: TokenEntry[];
  composeBlockEntries: TokenEntry[][];
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
    composeStyles: [{}] as [Record<string, Styles>],
    responsiveStyles: {} as Record<string, [Styles]>,
    varResponsiveStyles: {} as Record<string, [Styles]>,
  } satisfies Record<string, Styles | [Styles] | Record<string, [Styles]>>;

  if (!params.atomicEntries.length && !params.composeBlockEntries.length) return '';

  const composeTokenEntries = params.composeBlockEntries.flat();
  const tokenValues = [...params.atomicEntries, ...composeTokenEntries].flatMap(([, value]) => {
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

  // TODO: this is a bit of a mess now 😅 do some house keeping when you have time!
  const pushAtomicStyles = (entry: TokenEntry, className?: string) => {
    const [usedTokenProperty, usedTokenValue] = entry;
    const parts = Tokenami.getTokenPropertyParts(usedTokenProperty, config);
    if (!parts) return;

    const longhands = utils.getLonghandsForAlias(parts.alias, config);
    const configResponsive = parts.responsive && config?.responsive?.[parts.responsive];
    const configSelector = parts.selector && config?.selectors?.[parts.selector];
    const hasVariants = configResponsive || configSelector;

    for (let property of longhands) {
      if (!isSupportedProperty(property)) continue;
      const id = `${property}${usedTokenProperty}`;
      const specificity = utils.getSpecifictyOrderForCSSProperty(property);
      const propertyConfig = config.properties?.[property];
      const isGridProperty = propertyConfig?.includes('grid') || false;
      const isGridValue = Tokenami.GridValue.safeParse(usedTokenValue).success;
      const isVarLayer = isGridProperty && !isGridValue;
      const selector = `/*${id}*/${createSelector({ name: parts.name, className })}`;
      const valueVar = `var(${Tokenami.tokenProperty(property)})`;
      // variants fallback to initital in case the variant is deselected in dev tools.
      // it will fall back to any non-variant values applied to the same element
      const variantValueVar = `var(${usedTokenProperty}, ${valueVar})`;
      const getStyles = (value: string): Styles => ({ [property]: value });
      const getVariantStyles = (value: string) => {
        const baseStyles = getStyles(value);
        return [configResponsive].concat(configSelector).reduceRight((styles, template) => {
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
          const varSelector = `/*${id}*/${createVarSelector({ name: parts.name, className })}`;
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
  };

  params.atomicEntries.forEach((entry) => pushAtomicStyles(entry));
  params.composeBlockEntries.forEach((blockEntries) => {
    const className = Tokenami.generateClassName(blockEntries);
    blockEntries.forEach((entry) => {
      const [usedTokenProperty, usedTokenValue] = entry;
      const parts = Tokenami.getTokenPropertyParts(usedTokenProperty, config);
      if (!parts) return;
      pushAtomicStyles(entry, className);
      const longhands = utils.getLonghandsForAlias(parts.alias, config);
      for (let property of longhands) {
        if (!isSupportedProperty(property)) continue;
        const id = `${usedTokenProperty}${usedTokenValue}`;
        const specificity = utils.getSpecifictyOrderForCSSProperty(property);
        const layer = (layers.composeStyles[specificity] ??= {});
        layer[id] = { ...layer[id], [`/*${id}*/.${className}`]: Object.fromEntries([entry]) };
      }
    });
  });

  const responsiveStyles = deepmerge(layers.responsiveStyles, layers.varResponsiveStyles);
  const sheet = Object.assign(
    layers.atRules,
    layers.root,
    layers.reset,
    ...layers.styles,
    ...layers.varStyles,
    ...layers.composeStyles.flatMap(Object.values),
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

function createSelector(params: {
  name: string;
  className?: string;
  value?: string;
  template?: string;
}) {
  const { template = '&', name, value = '' } = params || {};
  const tokenProperty = Tokenami.tokenProperty(name);
  const styleSelector = `[style*="${tokenProperty}:${value}"]`;
  const selector = params.className ? `.${params.className}` : styleSelector;
  return template.replace('&', selector);
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
