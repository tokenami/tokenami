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
const UNUSED_LAYERS_REGEX = /[\n]?@layer[a-z-,\s]+;[\n]?/g;

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  order: number;
  tokenProperty: Tokenami.TokenProperty;
  cssProperty: Tokenami.CSSProperty;
};

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(params: {
  tokens: { properties: Tokenami.TokenProperty[]; values: Tokenami.TokenValue[] };
  output: string;
  config: Tokenami.Config;
  minify?: boolean;
  targets?: lightning.Targets;
}) {
  if (!params.tokens.properties.length) return '';

  const tokenProperties = params.tokens.properties;
  const tokenValues = params.tokens.values;
  const propertyConfigs = getPropertyConfigs(tokenProperties, params.config);

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Set<string>(),
  };

  propertyConfigs.forEach(([cssProperty, configs]) => {
    const sortedConfigs = configs.sort((a, b) => a.order - b.order);
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const uniqueVariants = utils.unique(variants);

    uniqueVariants.forEach((toggle) => {
      const variantProperty = Tokenami.variantProperty(toggle, cssProperty);
      const value = `var(${variantProperty})`;
      styles.reset.add(`${hashVariantProperty(toggle, cssProperty)}: var(--${toggle}) ${value};`);
      styles.reset.add(`${variantProperty}: initial;`);
    });

    sortedConfigs.forEach((config) => {
      const responsive = config.responsive && params.config.responsive?.[config.responsive];
      const selector = config.selector && params.config.selectors?.[config.selector];
      const selectors = Array.isArray(selector) ? selector : selector ? [selector] : ['&'];
      const nestedSelectors = [responsive, ...selectors].filter(Boolean) as string[];
      const isShortProperty = Boolean((Tokenami.mapShorthandToLonghands as any)[cssProperty]);
      const isLogicalProperty = Tokenami.logicalProperties.includes(cssProperty as any);
      const shortLayer = isLogicalProperty ? LAYER.SHORT_LOGICAL : LAYER.SHORT;
      const longLayer = isLogicalProperty ? LAYER.LONG_LOGICAL : LAYER.LONG;
      const propertyValue = `var(${config.tokenProperty}, revert-layer)`;
      const propertyLayer = isShortProperty ? shortLayer : longLayer;

      styles.reset.add(`${config.tokenProperty}: initial;`);

      if (config.variant) {
        const variantValue = uniqueVariants.reduce(
          (fallback, variant) => `var(${hashVariantProperty(variant, cssProperty)}, ${fallback})`,
          propertyValue
        );

        const toggleProperty = Tokenami.tokenProperty(config.variant);
        const toggle = nestedSelectors.reduceRight(
          (declaration, template) => `${template.replace('&', '[style]')} { ${declaration} }`,
          `${toggleProperty}: ;`
        );

        const declaration = `[style] { ${cssProperty}: ${variantValue}; }`;
        styles.selectors.add(`@layer tk-selector-${propertyLayer} { ${declaration} }`);
        styles.reset.add(`${toggleProperty}: initial;`);
        styles.selectors.add(toggle);
      } else {
        const declaration = `[style] { ${cssProperty}: ${propertyValue}; }`;
        styles.atomic.add(`@layer tk-${propertyLayer} { ${declaration} }`);
      }
    });
  });

  const sheet = `
    ${generateKeyframeRules(tokenValues, params.config)}
    :root { ${generateRootStyles(tokenValues, params.config)} }
    [style] { ${Array.from(styles.reset).join(' ')} }

    @layer ${LAYERS.map((layer) => `tk-${layer}`).join(', ')};
    @layer ${LAYERS.map((layer) => `tk-selector-${layer}`).join(', ')};

    ${Array.from(styles.atomic).join(' ')}
    ${Array.from(styles.selectors).join(' ')}
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
 * getPropertyConfigs
 * -----------------------------------------------------------------------------------------------*/

function getPropertyConfigs(tokenProperties: Tokenami.TokenProperty[], config: Tokenami.Config) {
  let propertyConfigs: [Tokenami.CSSProperty, PropertyConfig[]][] = [];

  tokenProperties.forEach((tokenProperty) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    if (!parts) return;
    const properties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);

    properties.forEach((cssProperty) => {
      const specificity = utils.getSpecifictyOrderForCSSProperty(cssProperty);
      const tokenProperty = Tokenami.tokenProperty(cssProperty);

      if (specificity > -1) {
        const responsiveOrder = parts.responsive ? 1 : 0;
        const selectorOrder = parts.selector ? 2 : 0;
        const order = responsiveOrder + selectorOrder;

        propertyConfigs[specificity] ??= [cssProperty, []];
        propertyConfigs[specificity]![1].push({ ...parts, tokenProperty, cssProperty, order });
      }
    });
  });

  return propertyConfigs;
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
    [Tokenami.gridProperty()]: config.grid,
    ...utils.getThemeValuesByTokenValues(tokenValues, config.theme),
  });
}

/* -------------------------------------------------------------------------------------------------
 * hash
 * -----------------------------------------------------------------------------------------------*/

function hash(str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(32);
}

/* -------------------------------------------------------------------------------------------------
 * hashVariantProperty
 * -----------------------------------------------------------------------------------------------*/

function hashVariantProperty(variant: string, property: string) {
  return `--_${hash(variant + property)}`;
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
