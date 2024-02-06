import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';

const LAYER = {
  SHORT: 'short',
  LONG: 'long',
  SHORT_LOGICAL: 'short-logical',
  LONG_LOGICAL: 'long-logical',
};

const LAYERS = Object.values(LAYER);
const UNUSED_LAYERS_REGEX = /[\n]?@layer .+;[\n]?/g;

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  tokenProperty: Tokenami.TokenProperty;
  cssProperty: Tokenami.CSSProperty;
  value: string;
};

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

type TokenEntry = readonly [Tokenami.TokenProperty, string];

function generate(params: {
  tokenEntries: TokenEntry[];
  output: string;
  config: Tokenami.Config;
  minify?: boolean;
  targets?: lightning.Targets;
}) {
  if (!params.tokenEntries.length) return '';

  const tokenValues = getTokenValues(params.tokenEntries);
  const propertyConfigs = getPropertyConfigs(params.tokenEntries, params.config);
  const selectorKeys = Object.keys(params.config.selectors || {});
  const responsiveKeys = Object.keys(params.config.responsive || {});

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Map<string, Set<string>>(selectorKeys.map((key) => [key, new Set()])),
    responsive: new Map<string, Set<string>>(responsiveKeys.map((key) => [key, new Set()])),
  };

  propertyConfigs.forEach((config) => {
    const tokenProperty = Tokenami.tokenProperty(config.cssProperty);
    const fallbackValue = getPropertyFallbacks(config, params.config);
    const responsive = config.responsive && params.config.responsive?.[config.responsive];
    const selector = config.selector && params.config.selectors?.[config.selector];
    const selectors = Array.isArray(selector) ? selector : selector ? [selector] : ['&'];
    const nestedSelectors = [responsive, ...selectors].filter(Boolean) as string[];

    const isShortProperty = Boolean((Tokenami.mapShorthandToLonghands as any)[config.cssProperty]);
    const isLogicalProperty = Tokenami.logicalProperties.includes(config.cssProperty as any);
    const shortLayer = isLogicalProperty ? LAYER.SHORT_LOGICAL : LAYER.SHORT;
    const longLayer = isLogicalProperty ? LAYER.LONG_LOGICAL : LAYER.LONG;
    const propertyLayer = isShortProperty ? shortLayer : longLayer;

    styles.reset.add(`${config.tokenProperty}: initial;`);

    if (config.variant) {
      const variantProperty = Tokenami.variantProperty(config.variant, config.cssProperty);
      const variantGroup = config.selector
        ? styles.selectors.get(config.selector)
        : styles.responsive.get(config.responsive!);

      const variantLayer =
        config.selector && config.responsive
          ? `${config.selector}-${config.responsive}`
          : config.selector || config.responsive;

      const declaration = nestedSelectors.reduceRight(
        (declaration, template) => `${template.replace('&', '[style]')} { ${declaration} }`,
        `${config.cssProperty}: var(${variantProperty}, ${fallbackValue});`
      );

      variantGroup?.add(`@layer tk-${variantLayer}-${propertyLayer} { ${declaration} }`);
    } else {
      const declaration = `[style] { ${config.cssProperty}: var(${tokenProperty}, ${fallbackValue});`;
      styles.atomic.add(`@layer tk-${propertyLayer} { ${declaration} } }`);
    }
  });

  const sheet = `
    ${generateKeyframeRules(tokenValues, params.config)}
    :root { ${generateRootStyles(tokenValues, params.config)} }
    [style] { ${Array.from(styles.reset).join(' ')} }

    @layer ${LAYERS.map((layer) => `tk-${layer}`).join(', ')};

    @layer ${responsiveKeys.map((responsive) => {
      return LAYERS.map((layer) => `tk-${responsive}-${layer}`).join(', ');
    })};

    @layer ${selectorKeys.map((selector) => {
      return LAYERS.map((layer) => `tk-${selector}-${layer}`).join(', ');
    })};

    @layer ${selectorKeys.map((selector) => {
      return responsiveKeys.map((responsive) => {
        return LAYERS.map((layer) => `tk-${selector}-${responsive}-${layer}`).join(', ');
      });
    })};

    ${Array.from(styles.atomic).join(' ')}

    ${Array.from(styles.selectors.values())
      .flatMap((set) => Array.from(set))
      .join(' ')}

    ${Array.from(styles.responsive.values())
      .flatMap((set) => Array.from(set))
      .join(' ')}
  `;

  const transformed = lightning.transform({
    code: Buffer.from(sheet),
    filename: params.output,
    minify: params.minify,
    targets: params.targets,
  });

  return transformed.code.toString().replace(UNUSED_LAYERS_REGEX, '');
}

/* -------------------------------------------------------------------------------------------------
 * getTokenValues
 * -----------------------------------------------------------------------------------------------*/

function getTokenValues(tokenEntries: TokenEntry[]) {
  return tokenEntries.flatMap(([, value]) => {
    const tokenValue = Tokenami.TokenValue.safeParse(value);
    return tokenValue.success ? [tokenValue.output] : [];
  });
}

/* -------------------------------------------------------------------------------------------------
 * getPropertyConfigs
 * -----------------------------------------------------------------------------------------------*/

function getPropertyConfigs(tokenEntries: TokenEntry[], config: Tokenami.Config) {
  let propertyConfigs: PropertyConfig[][] = [];

  tokenEntries.forEach(([tokenProperty, value]) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    const properties = parts?.alias && utils.getLonghandsForAlias(parts.alias, config);
    if (!properties || !properties.length) return;

    properties.forEach((cssProperty) => {
      const specificity = utils.getSpecifictyOrderForCSSProperty(cssProperty);

      if (specificity > -1) {
        propertyConfigs[specificity] ??= [];
        propertyConfigs[specificity]!.push({ ...parts, tokenProperty, cssProperty, value });
      }
    });
  });

  return propertyConfigs.flat();
}

/* -------------------------------------------------------------------------------------------------
 * generateKeyframeRules
 * -----------------------------------------------------------------------------------------------*/

function generateKeyframeRules(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
  const themeValues = tokenValues.flatMap((tokenValue) => {
    const parts = Tokenami.getTokenValueParts(tokenValue);
    const value = config.theme[parts.themeKey]?.[parts.token];
    return value == null ? [] : [value];
  });
  return Object.entries(config.keyframes || {}).flatMap(([name, styles]) => {
    const nameRegex = new RegExp(`\\b${name}\\b`);
    const isUsingKeyframeName = themeValues.some((value) => nameRegex.test(value));
    if (!isUsingKeyframeName) return [];
    return [[`@keyframes ${name} { ${stringify(styles)} }`]];
  });
}

/* -------------------------------------------------------------------------------------------------
 * generateRootStyles
 * -----------------------------------------------------------------------------------------------*/

function generateRootStyles(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
  return stringify({
    [Tokenami.tokenProperty('grid')]: config.grid,
    ...utils.getThemeValuesByTokenValues(tokenValues, config.theme),
  });
}

/* -------------------------------------------------------------------------------------------------
 * getPropertyFallbacks
 * -----------------------------------------------------------------------------------------------*/

// TODO: Only return the fallbacks that are actually used
function getPropertyFallbacks(propertyConfig: PropertyConfig, config: Tokenami.Config) {
  const aliasEntries = Object.entries(config.aliases || {});
  const matchEntries = aliasEntries.flatMap(([alias, properties]) => {
    return properties?.includes(propertyConfig.cssProperty) ? [alias] : [];
  });
  return matchEntries.reduce((fallback, alias) => {
    const property = propertyConfig.variant
      ? Tokenami.variantProperty(propertyConfig.variant, alias)
      : Tokenami.tokenProperty(alias);
    return `var(${property}, ${fallback})`;
  }, 'revert-layer');
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
