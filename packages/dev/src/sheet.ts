import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';
import * as Supports from './supports';
import * as log from './log';

const UNUSED_LAYERS_REGEX = /[\n\s]*@layer[^;{]+;/g;
const DEFAULT_SELECTOR = '[style]';
const CUSTOM_PROP_PREFIX = '--_';
const LAYERS = {
  BASE: 'tk',
  LOGICAL: 'tkl',
  SELECTORS: 'tks',
  SELECTORS_LOGICAL: 'tksl',
};

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  order: number;
  tokenProperty: Tokenami.TokenProperty;
  isCustom: boolean;
  isGrid: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(params: Parameters<typeof createSheet>[0]) {
  try {
    const sheet = createSheet(params);
    const transformed = lightning.transform({
      code: Buffer.from(sheet),
      filename: params.output,
      minify: params.minify,
      targets: params.targets,
    });

    return transformed.code.toString().replace(UNUSED_LAYERS_REGEX, '');
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const escapedMessage = message.replace(/(['"])/g, '\\$1');
    log.debug(`Error generating stylesheet: ${message}`);
    return `body::after { content: 'Error generating stylesheet: ${escapedMessage}'; position: fixed; inset: 0; background: #ec6142; color: white; padding: 20px; font-family: sans-serif; z-index: 9999; }`;
  }
}

function createSheet(params: {
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
      return selectors.find(isElementSelector) || DEFAULT_SELECTOR;
    })
  );

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Set<string>(),
    toggles: {} as Record<string, Set<string>>,
  };

  propertyConfigsByCSSProperty.forEach((configs, cssProperty) => {
    const isLogical = Supports.supportedLogicalProperties.has(cssProperty as any);
    const isInheritable = Supports.inheritedProperties.has(cssProperty);
    // sort configs to ensure property value orders fallbacks correctly
    const sortedConfigs = [...configs].sort((a, b) => a.order - b.order);
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const variantValue = utils.unique(variants).reduce((fallback, variant) => {
      const hashedProperty = hashVariantProperty(variant, cssProperty);
      return `var(${hashedProperty}, ${fallback})`;
    }, 'revert-layer');

    configs.forEach((config) => {
      const layerIndex = getAtomicLayerIndex(cssProperty, params.config);
      const toggleKey = config.responsive || config.selector;
      const propertyPrefix = config.isCustom ? CUSTOM_PROP_PREFIX : '';

      if (layerIndex === -1) return;

      if (config.variant && toggleKey) {
        const responsive = getResponsiveSelectorFromConfig(config.responsive, params.config);
        const selectors = getSelectorsFromConfig(config.selector, params.config);
        const hasCombinator = selectors.some(isCombinatorSelector);
        const responsiveSelectors = [responsive, ...selectors].filter(Boolean) as string[];
        const hashedProperty = hashVariantProperty(config.variant, cssProperty);
        const variantProperty = Tokenami.parsedVariantProperty(config.variant, cssProperty);
        const basePropertyValue = getBasePropertyValue(variantProperty, config, false);
        const toggleProperty = Tokenami.parsedTokenProperty(config.variant);
        const toggleDeclaration = `${hashedProperty}: var(${toggleProperty}) ${basePropertyValue};`;
        const layer = `${isLogical ? LAYERS.SELECTORS_LOGICAL : LAYERS.SELECTORS}${layerIndex}`;
        // revert-layer doesn't work for custom properties in Safari so we explicitly set the fallback
        // to the base custom property value for variants
        const customPropertyFallback = `var(${Tokenami.tokenProperty(cssProperty)})`;
        const customPropertyValue = variantValue.replace('revert-layer', customPropertyFallback);
        const declaration = `${propertyPrefix}${cssProperty}: ${
          config.isCustom ? customPropertyValue : variantValue
        };`;

        const toggle = responsiveSelectors.reduceRight(
          (declaration, selector) => `${selector} { ${declaration} }`,
          `${toggleProperty}: ;`
        );

        styles.reset.add(`${toggleProperty}: initial;`);
        if (!isInheritable && !hasCombinator) styles.reset.add(`${variantProperty}: initial;`);
        styles.selectors.add(`@layer ${layer} { ${elemSelectors} { ${declaration} } }`);
        styles.selectors.add(`@layer ${layer} { ${elemSelectors} { ${toggleDeclaration} } }`);
        styles.toggles[toggleKey] ??= new Set<string>();
        styles.toggles[toggleKey]!.add(toggle);
        if (config.isGrid) {
          const gridToggle = getGridPropertyToggle(variantProperty);
          styles.selectors.add(`@layer ${layer} { ${elemSelectors} { ${gridToggle} } }`);
        }
      } else {
        const propertyValue = getBasePropertyValue(config.tokenProperty, config);
        const declaration = `${DEFAULT_SELECTOR} { ${propertyPrefix}${cssProperty}: ${propertyValue}; }`;
        const layer = `${isLogical ? LAYERS.LOGICAL : LAYERS.BASE}${layerIndex}`;

        if (!isInheritable) styles.reset.add(`${config.tokenProperty}: initial;`);
        styles.atomic.add(`@layer ${layer} { ${declaration} }`);
        if (config.isGrid) {
          const gridToggle = getGridPropertyToggle(config.tokenProperty);
          styles.atomic.add(`@layer ${layer} { ${DEFAULT_SELECTOR} { ${gridToggle} } }`);
        }
      }
    });
  });

  return `
    @layer global {
      ${params.config.globalStyles ? stringify(params.config.globalStyles) : ''}
    }

    @layer tokenami {
      ${generateKeyframeRules(tokenValues, params.config)}
      ${generateThemeTokens(tokenValues, params.config)}

      * { ${Array.from(styles.reset).join(' ')} }

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
}

/* -------------------------------------------------------------------------------------------------
 * getGridPropertyToggle
 * -----------------------------------------------------------------------------------------------*/

function getGridPropertyToggle(property: string) {
  const hashGridProperty = hashVariantProperty('grid', property);
  const gridProperty = Tokenami.gridProperty();
  return `${hashGridProperty}: var(${property}__calc) calc(var(${property}) * var(${gridProperty}));`;
}

/* -------------------------------------------------------------------------------------------------
 * getBasePropertyValue
 * -----------------------------------------------------------------------------------------------*/

function getBasePropertyValue(property: string, config: PropertyConfig, revert = true) {
  const hashGridProperty = hashVariantProperty('grid', property);
  const baseProperty = `var(${property}${revert ? ', revert-layer' : ''})`;
  return config.isGrid ? `var(${hashGridProperty}, ${baseProperty})` : baseProperty;
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
  const customProperties = Object.keys(config.customProperties || {});

  tokenProperties.forEach((tokenProperty) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    if (!parts) return;
    const properties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);
    const responsiveOrder = parts.responsive ? 1 : 0;
    const selectorOrder = parts.selector ? 2 : 0;
    const order = responsiveOrder + selectorOrder;

    properties.forEach((cssProperty) => {
      const tokenProperty = Tokenami.parsedTokenProperty(cssProperty);
      const currentConfigs = propertyConfigs.get(cssProperty as any) || [];
      const isCustom = customProperties.includes(cssProperty);
      const isGrid = config.properties?.[cssProperty]?.includes('grid') ?? false;
      const nextConfig = { ...parts, tokenProperty, order, isCustom, isGrid };
      propertyConfigs.set(cssProperty, [...currentConfigs, nextConfig]);
    });
  });

  return propertyConfigs;
}

/* -------------------------------------------------------------------------------------------------
 * getAtomicLayerIndex
 * -----------------------------------------------------------------------------------------------*/

const SHORTHAND_TO_LONGHAND_ENTRIES = [...Tokenami.mapShorthandToLonghands.entries()];

function getAtomicLayerIndex(cssProperty: string, config: Tokenami.Config): number {
  const validProperties = utils.getValidProperties(config);
  const isSupported = validProperties.has(cssProperty as any);
  const initialDepth = isSupported ? 1 : -1;

  if (cssProperty === 'all') return 0;

  return SHORTHAND_TO_LONGHAND_ENTRIES.reduce((depth, [shorthand, longhands]) => {
    const isLonghand = (longhands as string[]).includes(cssProperty);
    return isLonghand ? depth + getAtomicLayerIndex(shorthand, config) : depth;
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
  const theme = utils.getThemeFromConfig(config.theme);
  const rootSelector = ':root';
  const gridStyles = `${rootSelector} { ${Tokenami.gridProperty()}: ${config.grid}; }`;
  const rootStyles = getThemeStyles(rootSelector, tokenValues, theme.root, config);
  const themeToModes: Record<string, string[]> = {};
  const modeEntries = Object.entries(theme.modes || {});

  // working around this for now https://github.com/parcel-bundler/lightningcss/issues/841
  for (const [mode, theme] of modeEntries) {
    const themeKey = JSON.stringify(theme);
    if (themeKey in themeToModes) themeToModes[themeKey]!.push(mode);
    else themeToModes[themeKey] = [mode];
  }

  const modeStyles = Object.entries(themeToModes).map(([theme, modes]) => {
    const selector = modes.map(config.themeSelector).join(', ');
    return getThemeStyles(selector, tokenValues, JSON.parse(theme), config);
  });

  const themeTokens = [gridStyles, rootStyles, modeStyles.join(' ')];
  return themeTokens.join(' ');
}

/* -------------------------------------------------------------------------------------------------
 * getThemeStyles
 * -----------------------------------------------------------------------------------------------*/

const getThemeStyles = (
  selector: string | string[],
  tokenValues: Tokenami.TokenValue[],
  theme: Tokenami.Theme,
  config: Tokenami.Config
) => {
  const themeValues = utils.getThemeValuesByTokenValues(tokenValues, theme);
  const customPropertyThemeValues = getCustomPropertyThemeValues(themeValues, config);
  const selectors = Array.isArray(selector) ? selector : [selector];

  for (const customKey of Object.keys(customPropertyThemeValues)) {
    delete themeValues[customKey];
  }

  const themeStyles = selectors.reduceRight(
    (declaration, selector) => `${selector} { ${declaration} }`,
    stringify(themeValues)
  );

  const elementSelector = selectors.at(-1)!;
  const elementThemeStyles = getElementThemeStyles(elementSelector, customPropertyThemeValues);
  const customPropertyThemeStyles = selectors.slice(0, -1).reduceRight((declaration, selector) => {
    return `${selector} { ${declaration} }`;
  }, elementThemeStyles);

  return themeStyles + ' ' + customPropertyThemeStyles;
};

/* -------------------------------------------------------------------------------------------------
 * getElementThemeStyles
 * -----------------------------------------------------------------------------------------------*/

const getElementThemeStyles = (selector: string, themeValues: Record<string, string>) => {
  const splitChained = selector.split(',');
  return splitChained
    .map((selector) => `${selector}, ${selector} ${DEFAULT_SELECTOR} { ${stringify(themeValues)} }`)
    .join(' ');
};

/* -------------------------------------------------------------------------------------------------
 * getCustomPropertyThemeValues
 * -----------------------------------------------------------------------------------------------*/

function getCustomPropertyThemeValues(
  themeValues: { [key: string]: string },
  config: Tokenami.Config
) {
  const entries = Object.entries(themeValues).flatMap(([key, value]) => {
    const valueWithCustomPrefixes = getPrefixedCustomPropertyValues(value, config.customProperties);
    return valueWithCustomPrefixes ? [[key, valueWithCustomPrefixes] as const] : [];
  });
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * getPrefixedCustomPropertyValues
 * -----------------------------------------------------------------------------------------------*/

const CUSTOM_PROP_REGEX = /\(--[^-][\w-]+/g;

const getPrefixedCustomPropertyValues = (
  themeValue: string,
  customProperties?: Tokenami.Config['customProperties']
) => {
  const variables = themeValue.match(CUSTOM_PROP_REGEX);
  if (!variables) return null;

  return themeValue.replace(CUSTOM_PROP_REGEX, (m) => {
    const match = m.replace('(', '');
    const tokenProperty = Tokenami.TokenProperty.safeParse(match);
    if (!tokenProperty.success) return m;

    const parts = Tokenami.getTokenPropertySplit(tokenProperty.output);
    const isCustom = Boolean(customProperties?.[parts.alias]);
    if (!isCustom) return m;

    const tokenPrefix = Tokenami.tokenProperty('');
    const customPrefixTokenValue = tokenProperty.output.replace(tokenPrefix, CUSTOM_PROP_PREFIX);
    return '(' + customPrefixTokenValue;
  });
};

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
 * isElementSelector
 * -----------------------------------------------------------------------------------------------*/

const PSEUDO_REGEX = /::/;

function isElementSelector(selector = '') {
  return isCombinatorSelector(selector) || PSEUDO_REGEX.test(selector);
}

/* -------------------------------------------------------------------------------------------------
 * isCombinatorSelector
 * -----------------------------------------------------------------------------------------------*/

const COMBINATOR_REGEX = /(.+)\s\[style|style\]\s(.+)/;

function isCombinatorSelector(selector = '') {
  return COMBINATOR_REGEX.test(selector);
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
  const arbitrarySelector = Tokenami.getArbitrarySelector(propertySelector);
  const configSelector = propertySelector && tokenamiConfig.selectors?.[propertySelector];
  const selector = arbitrarySelector?.replace(/_/g, ' ') || configSelector;
  const selectors = selector ? (Array.isArray(selector) ? selector : [selector]) : ['&'];
  const isSelectionVariant = selectors.includes('&::selection');

  if (selectors.toString().indexOf('&') === -1) {
    throw new Error(`Selector '${selector}' must include '&'`);
  }

  return selectors.map((selector) => {
    // revert-layer for ::selection doesn't work: https://codepen.io/jjenzz/pen/LYvOydB
    // we use a substring selector for now to ensure selection styles aren't inadvertently
    // removed. we can use container style queries to improve this when support improves
    // https://codepen.io/jjenzz/pen/BaEmRpg
    const tkSelector = isSelectionVariant ? `[style*="${propertySelector}_"]` : DEFAULT_SELECTOR;
    return selector.replace(/&/g, tkSelector);
  });
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
