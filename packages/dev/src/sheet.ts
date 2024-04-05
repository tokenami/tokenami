import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';
import { supportedProperties, supportedLogicalProperties } from './supports';

const UNUSED_LAYERS_REGEX = /\n\s*@layer[-\w\s,]+;/g;
const DEFAULT_SELECTOR = '[style]';
const LAYERS = {
  BASE: 'tk',
  LOGICAL: 'tkl',
  SELECTORS: 'tks',
  SELECTORS_LOGICAL: 'tksl',
};

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  order: number;
  tokenProperty: Tokenami.TokenProperty;
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
  const propertyConfigsByCSSProperty = getPropertyConfigs(tokenProperties, params.config);
  const allPropertyConfigs = Array.from(propertyConfigsByCSSProperty.values()).flat();

  const elemSelectors = utils.unique(
    allPropertyConfigs.map((config) => {
      const selectors = getSelectorsFromConfig(config.selector, params.config);
      return selectors.find(isPseudoElementSelector) || DEFAULT_SELECTOR;
    })
  );

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Set<string>(),
    toggles: {} as Record<string, Set<string>>,
  };

  propertyConfigsByCSSProperty.forEach((configs, cssProperty) => {
    const isLogical = supportedLogicalProperties.includes(cssProperty as any);
    const sortedConfigs = [...configs].sort((a, b) => a.order - b.order);
    // sort configs to ensure property value orders fallbacks correctly
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const variantValue = utils.unique(variants).reduce((fallback, variant) => {
      const hashedProperty = hashVariantProperty(variant, cssProperty);
      return `var(${hashedProperty}, ${fallback})`;
    }, 'revert-layer');

    configs.forEach((config) => {
      const layerCount = getAtomicLayer(cssProperty);
      const toggleKey = config.responsive || config.selector;

      if (layerCount === -1) return;

      if (config.variant && toggleKey) {
        const responsive = getResponsiveSelectorFromConfig(config.responsive, params.config);
        const selectors = getSelectorsFromConfig(config.selector, params.config);
        const responsiveSelectors = [responsive, ...selectors].filter(Boolean) as string[];
        const variantProperty = Tokenami.variantProperty(config.variant, cssProperty);
        const hashedProperty = hashVariantProperty(config.variant, cssProperty);
        const toggleProperty = Tokenami.tokenProperty(config.variant);
        const toggleDeclaration = `${hashedProperty}: var(${toggleProperty}) var(${variantProperty});`;
        const layer = `${isLogical ? LAYERS.SELECTORS_LOGICAL : LAYERS.SELECTORS}${layerCount}`;
        const declaration = `${cssProperty}: ${variantValue};`;

        const toggle = responsiveSelectors.reduceRight(
          (declaration, selector) => `${selector} { ${declaration} }`,
          `${toggleProperty}: ;`
        );

        styles.reset.add(`${toggleProperty}: initial;`);
        styles.reset.add(`${variantProperty}: initial;`);
        styles.selectors.add(`@layer ${layer} { ${elemSelectors} { ${declaration} } }`);
        styles.selectors.add(`@layer ${layer} { ${elemSelectors} { ${toggleDeclaration} } }`);
        styles.toggles[toggleKey] ??= new Set<string>();
        styles.toggles[toggleKey]!.add(toggle);
      } else {
        const propertyValue = `var(${config.tokenProperty}, revert-layer)`;
        const declaration = `${DEFAULT_SELECTOR} { ${cssProperty}: ${propertyValue}; }`;
        const layer = `${isLogical ? LAYERS.LOGICAL : LAYERS.BASE}${layerCount}`;
        styles.reset.add(`${config.tokenProperty}: initial;`);
        styles.atomic.add(`@layer ${layer} { ${declaration} }`);
      }
    });
  });

  const sheet = `
    @layer tokenami {
      ${generateKeyframeRules(tokenValues, params.config)}
      ${generateThemeTokens(tokenValues, params.config)}

      ${DEFAULT_SELECTOR} { ${Array.from(styles.reset).join(' ')} }

      ${generatePlaceholderLayers(LAYERS.BASE)}
      ${generatePlaceholderLayers(LAYERS.LOGICAL)}
      ${generatePlaceholderLayers(LAYERS.SELECTORS)}
      ${generatePlaceholderLayers(LAYERS.SELECTORS_LOGICAL)}

      ${Array.from(styles.atomic).join(' ')}
      ${Array.from(styles.selectors).join(' ')}

      ${Object.values(styles.toggles)
        .flatMap((set) => Array.from(set))
        .join(' ')}
    }
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
 * generatePlaceholderLayers
 * -----------------------------------------------------------------------------------------------*/

function generatePlaceholderLayers(prefix: string) {
  // this 20 is arbitrary for now, will make this more correct later.
  return `@layer ${Array.from({ length: 20 })
    .map((_, layer) => `${prefix}${layer}`)
    .join(', ')};`;
}

/* -------------------------------------------------------------------------------------------------
 * getPropertyConfigs
 * -----------------------------------------------------------------------------------------------*/

function getPropertyConfigs(
  tokenProperties: Tokenami.TokenProperty[],
  config: Tokenami.Config
): Map<string, PropertyConfig[]> {
  let propertyConfigs: Map<string, PropertyConfig[]> = new Map();

  tokenProperties.forEach((tokenProperty) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    if (!parts) return;
    const properties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);
    const responsiveOrder = parts.responsive ? 1 : 0;
    const selectorOrder = parts.selector ? 2 : 0;
    const order = responsiveOrder + selectorOrder;

    properties.forEach((cssProperty) => {
      const tokenProperty = Tokenami.tokenProperty(cssProperty);
      const currentConfigs = propertyConfigs.get(cssProperty as any) || [];
      const nextConfig = { ...parts, tokenProperty, order };
      propertyConfigs.set(cssProperty, [...currentConfigs, nextConfig]);
    });
  });

  return propertyConfigs;
}

/* -------------------------------------------------------------------------------------------------
 * getAtomicLayer
 * -----------------------------------------------------------------------------------------------*/

const SHORTHAND_TO_LONGHAND_ENTRIES = Object.entries(Tokenami.mapShorthandToLonghands);

function getAtomicLayer(cssProperty: string): number {
  const isSupported = (supportedProperties as string[]).includes(cssProperty);
  const initialDepth = isSupported ? 1 : -1;

  if (cssProperty === 'all') return 0;

  return SHORTHAND_TO_LONGHAND_ENTRIES.reduce((depth, [shorthand, longhands]) => {
    const isLonghand = (longhands as string[]).includes(cssProperty);
    return isLonghand ? depth + getAtomicLayer(shorthand) : depth;
  }, initialDepth);
}

/* -------------------------------------------------------------------------------------------------
 * generateKeyframeRules
 * -----------------------------------------------------------------------------------------------*/

function generateKeyframeRules(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
  const themeValues = tokenValues.flatMap((tokenValue) => {
    return Object.values(utils.getThemeValuesByThemeMode(tokenValue, config.theme));
  });

  const rules = Object.entries(config.keyframes || {}).flatMap(([name, styles]) => {
    const nameRegex = new RegExp(`\\b${name}\\b`);
    const isUsingKeyframeName = themeValues.some((value) => nameRegex.test(value));
    if (!isUsingKeyframeName) return [];
    return [[`@keyframes ${name} { ${stringify(styles)} }`]];
  });

  return rules.join(' ');
}

/* -------------------------------------------------------------------------------------------------
 * generateThemeTokens
 * -----------------------------------------------------------------------------------------------*/

function generateThemeTokens(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
  const { modes, ...rootTheme } = config.theme;
  const gridValue = { [Tokenami.gridProperty()]: config.grid };
  const rootSelector = ':root';

  if (modes) {
    const modeThemeEntries = Object.entries(modes).map(([mode, theme]) => {
      const modeThemeSelector = config.themeSelector ? config.themeSelector(mode) : rootSelector;
      const modeThemeValues = utils.getThemeValuesByTokenValues(tokenValues, theme);
      return [modeThemeSelector, { ...gridValue, ...modeThemeValues }];
    });

    return stringify(Object.fromEntries(modeThemeEntries));
  }

  const rootThemeValues = utils.getThemeValuesByTokenValues(tokenValues, rootTheme);
  return stringify({ [rootSelector]: { ...gridValue, ...rootThemeValues } });
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

/* -------------------------------------------------------------------------------------------------
 * isPseudoElementSelector
 * -----------------------------------------------------------------------------------------------*/

function isPseudoElementSelector(selector = '') {
  return selector.includes('::');
}

/* -------------------------------------------------------------------------------------------------
 * getResponsiveSelectorFromConfig
 * -----------------------------------------------------------------------------------------------*/

function getResponsiveSelectorFromConfig(
  responsiveSelector: PropertyConfig['responsive'],
  tokenamiConfig: Tokenami.Config
) {
  return responsiveSelector && tokenamiConfig.responsive?.[responsiveSelector];
}

/* -------------------------------------------------------------------------------------------------
 * getSelectorsFromConfig
 * -----------------------------------------------------------------------------------------------*/

function getSelectorsFromConfig(
  propertySelector: PropertyConfig['selector'],
  tokenamiConfig: Tokenami.Config
) {
  const selector = propertySelector && tokenamiConfig.selectors?.[propertySelector];
  const selectors = Array.isArray(selector) ? selector : selector ? [selector] : ['&'];
  const isSelectionVariant = selectors.includes('&::selection');
  return selectors.map((selector) => {
    // revert-layer for ::selection doesn't work: https://codepen.io/jjenzz/pen/LYvOydB
    // we use a substring selector for now to ensure selection styles aren't inadvertently
    // removed. we can use container style queries to improve this when support improves
    // https://codepen.io/jjenzz/pen/BaEmRpg
    const tkSelector = isSelectionVariant ? `[style*="${propertySelector}_"]` : DEFAULT_SELECTOR;
    return selector.replace('&', tkSelector);
  });
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
