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
  order: number;
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

  const tokenProperties = Array.from(new Map(params.tokenEntries).keys());
  const tokenValues = getTokenValues(params.tokenEntries);
  const propertyConfigs = getPropertyConfigs(params.tokenEntries, params.config);

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Set<string>(),
  };

  propertyConfigs.forEach(([cssProperty, configs]) => {
    const tokenProperty = Tokenami.tokenProperty(cssProperty);
    const sortedConfigs = configs.sort((a, b) => a.order - b.order);
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const uniqueVariants = Array.from(new Set(variants));

    uniqueVariants.forEach((toggle) => {
      const variantProperty = Tokenami.variantProperty(toggle, cssProperty);
      const variantFallback = getVariantFallback(
        tokenProperties,
        cssProperty,
        toggle,
        params.config
      );
      const value = `var(${variantProperty}, ${variantFallback})`.replace(', )', ')');
      styles.reset.add(`${hashVariantProperty(toggle, cssProperty)}: var(--${toggle}) ${value};`);
      styles.reset.add(`${variantProperty}: initial;`);
    });

    sortedConfigs.forEach((config) => {
      const fallbackValue = getPropertyFallback(tokenProperties, cssProperty, params.config);
      const responsive = config.responsive && params.config.responsive?.[config.responsive];
      const selector = config.selector && params.config.selectors?.[config.selector];
      const selectors = Array.isArray(selector) ? selector : selector ? [selector] : ['&'];
      const nestedSelectors = [responsive, ...selectors].filter(Boolean) as string[];
      const isShortProperty = Boolean((Tokenami.mapShorthandToLonghands as any)[cssProperty]);
      const isLogicalProperty = Tokenami.logicalProperties.includes(cssProperty as any);
      const shortLayer = isLogicalProperty ? LAYER.SHORT_LOGICAL : LAYER.SHORT;
      const longLayer = isLogicalProperty ? LAYER.LONG_LOGICAL : LAYER.LONG;
      const propertyLayer = isShortProperty ? shortLayer : longLayer;
      const propertyValue = `var(${tokenProperty}, ${fallbackValue})`;

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
  let propertyConfigs: [Tokenami.CSSProperty, PropertyConfig[]][] = [];

  tokenEntries.forEach(([tokenProperty, value]) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    const properties = parts?.alias && utils.getLonghandsForAlias(parts.alias, config);
    if (!properties || !properties.length) return;

    properties.forEach((cssProperty) => {
      const specificity = utils.getSpecifictyOrderForCSSProperty(cssProperty);

      if (specificity > -1) {
        const responsiveOrder = parts.responsive ? 1 : 0;
        const selectorOrder = parts.selector ? 2 : 0;
        const order = responsiveOrder + selectorOrder;

        propertyConfigs[specificity] ??= [cssProperty, []];
        propertyConfigs[specificity]![1].push({
          ...parts,
          tokenProperty,
          cssProperty,
          order,
          value,
        });
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
    [Tokenami.tokenProperty('grid')]: config.grid,
    ...utils.getThemeValuesByTokenValues(tokenValues, config.theme),
  });
}

/* -------------------------------------------------------------------------------------------------
 * getPropertyFallback
 * -----------------------------------------------------------------------------------------------*/

function getPropertyFallback(
  usedTokenProperties: Tokenami.TokenProperty[],
  cssProperty: Tokenami.CSSProperty,
  config: Tokenami.Config
) {
  const aliases = Object.entries(config.aliases || {}).flatMap(([alias, properties = []]) => {
    if (!properties.includes(cssProperty)) return [];
    const tokenProperty = Tokenami.tokenProperty(alias);
    return usedTokenProperties.includes(tokenProperty) ? [tokenProperty] : [];
  });

  return aliases.reduce((fallback, alias) => `var(${alias}, ${fallback})`, 'revert-layer');
}

/* -------------------------------------------------------------------------------------------------
 * getVariantFallback
 * -----------------------------------------------------------------------------------------------*/

function getVariantFallback(
  usedTokenProperties: Tokenami.TokenProperty[],
  cssProperty: Tokenami.CSSProperty,
  variant: string,
  config: Tokenami.Config
) {
  const aliases = Object.entries(config.aliases || {}).flatMap(([alias, properties = []]) => {
    if (!properties.includes(cssProperty)) return [];
    const tokenProperty = Tokenami.variantProperty(variant, alias);
    return usedTokenProperties.includes(tokenProperty) ? [tokenProperty] : [];
  });
  return aliases.reduce((fallback, alias) => `var(${alias}, ${fallback})`, '');
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
