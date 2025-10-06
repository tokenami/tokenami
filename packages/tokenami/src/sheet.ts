import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import { type TokenamiProperties } from './declarations';
import * as utils from './utils';
import * as Supports from './supports';
import * as log from './log';

const UNUSED_LAYERS_REGEX = /[\n\s]*@layer[^;{]+;/g;
const DEFAULT_SELECTOR = '[style]';
const CUSTOM_PROP_PREFIX = '--_';
const SELECTOR_TAG = '<selector>';

const LAYERS = {
  BASE: 'tk',
  LOGICAL: 'tkl',
  SELECTORS: 'tks',
  SELECTORS_LOGICAL: 'tksl',
  COMPONENTS: 'tkc',
};

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  order: number;
  tokenProperty: Tokenami.TokenProperty;
  layer: string;
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

/* -------------------------------------------------------------------------------------------------
 * createSheet
 * -----------------------------------------------------------------------------------------------*/

function createSheet(params: {
  output: string;
  config: Tokenami.Config;
  minify?: boolean;
  targets?: lightning.Targets;
  tokens: {
    properties: Tokenami.TokenProperty[];
    values: Tokenami.TokenValue[];
    composeBlocks: Record<`.${string}`, TokenamiProperties>;
  };
}): string {
  if (!params.tokens.properties.length) return '';

  const tokenProperties = params.tokens.properties;
  const tokenValues = params.tokens.values;
  const composeBlocks = parseComposeBlocks(params.tokens.composeBlocks, params.config);
  const propertyConfigsByCSSProperty = getPropertyConfigs(tokenProperties, params.config);
  let themeTokenSelectors: string[] = [];

  const styles = {
    reset: new Set<string>(),
    atomic: {} as Record<string, Set<string>>,
    selectors: {} as Record<string, Set<string>>,
    components: {} as Record<string, Set<string>>,
    toggles: {} as Record<string, Set<string>>,
  };

  for (const [cssProperty, configs] of propertyConfigsByCSSProperty) {
    const isInheritable = Supports.inheritedProperties.has(cssProperty);
    const elementConfigs = configs.filter((c) => {
      const selectorConfig = getPropertyConfigSelector(c.selector, params.config);
      return !selectorConfig.some(isPseudoElementSelector);
    });

    for (const prop of configs) {
      const toggleKey = prop.responsive || prop.selector;
      const propertyPrefix = prop.isCustom ? CUSTOM_PROP_PREFIX : '';
      const gridToggle = prop.isGrid ? getGridPropertyToggle(prop.tokenProperty) : '';
      const selectors = getPropertySelectors(composeBlocks, prop, params.config);

      themeTokenSelectors.push(...selectors.base.map(removePseudoElementSelector));

      if (prop.variant && toggleKey) {
        const responsive = getResponsiveSelectorFromConfig(prop.responsive, params.config);
        const selectorConfig = getPropertyConfigSelector(prop.selector, params.config);
        const hasChildSelector = selectorConfig.some(isChildSelector);

        const propertyConfigs = selectorConfig.some(isPseudoElementSelector)
          ? configs.filter((c) => c.selector === prop.selector)
          : elementConfigs;

        const declarationValue = createVariantValue(cssProperty, prop, propertyConfigs);
        const hashedProperty = hashVariantProperty(prop.variant, cssProperty);
        const basePropertyValue = getBasePropertyValue(prop.tokenProperty, prop, false);
        const toggleProperty = Tokenami.parsedTokenProperty(prop.variant);
        const declaration = `${propertyPrefix}${cssProperty}: ${declarationValue};`;
        const toggleDeclaration = `${hashedProperty}: var(${toggleProperty}) ${basePropertyValue};`;
        const toggleTemplate = `@layer ${prop.layer} {${SELECTOR_TAG} { ${toggleDeclaration} }}`;
        const gridToggleTemplate = `@layer ${prop.layer} {${SELECTOR_TAG} { ${gridToggle} }}`;
        const template = `@layer ${prop.layer} {${SELECTOR_TAG} { ${declaration} }}`;

        styles.reset.add(`${toggleProperty}: initial;`);
        styles.reset.add(`${hashedProperty}: initial;`);
        if (!isInheritable && !hasChildSelector) {
          styles.reset.add(`${prop.tokenProperty}: initial;`);
        }

        styles.selectors[template] ??= new Set<string>();
        styles.selectors[toggleTemplate] ??= new Set<string>();
        styles.selectors[gridToggleTemplate] ??= new Set<string>();

        for (const selector of selectors.base) {
          const elemSelector = removePseudoElementSelector(selector);
          styles.selectors[template]!.add(prop.isCustom ? elemSelector : selector);
          styles.selectors[toggleTemplate]!.add(elemSelector);
          styles.selectors[gridToggleTemplate]!.add(elemSelector);
        }

        for (const selector of selectors.all) {
          const toggle = createToggleDeclaration(responsive, selector, toggleProperty);
          styles.toggles[toggleKey] ??= new Set<string>();
          styles.toggles[toggleKey]!.add(toggle);
        }
      } else {
        const propertyValue = getBasePropertyValue(prop.tokenProperty, prop);
        const declaration = `${propertyPrefix}${cssProperty}: ${propertyValue};`;
        const template = `@layer ${prop.layer} {${SELECTOR_TAG} { ${declaration} ${gridToggle} }}`;

        if (!isInheritable) styles.reset.add(`${prop.tokenProperty}: initial;`);
        styles.atomic[template] ??= new Set<string>();

        for (const selector of selectors.base) {
          styles.atomic[template]!.add(selector);
        }
      }
    }
  }

  for (const [selector, tokenamiProperties] of Object.entries(composeBlocks)) {
    for (let [key, value] of Object.entries(tokenamiProperties)) {
      const atomicPair = `${key}: ${value};`;
      styles.components[atomicPair] ??= new Set<string>();
      styles.components[atomicPair]!.add(selector);
    }
  }

  const composeStyles = Object.entries(styles.components).map(([atomicPair, blocks]) => {
    return `@layer ${LAYERS.COMPONENTS} { ${Array.from(blocks)} { ${atomicPair} } }`;
  });

  return `
    @layer global {
      ${params.config.globalStyles ? stringify(params.config.globalStyles) : ''}
    }

    @layer tkb {
      ${generateKeyframeRules(tokenValues, params.config)}
      ${generateThemeTokens(tokenValues, utils.unique(themeTokenSelectors), params.config)}
      * { ${Array.from(styles.reset).join(' ')} }

      ${Object.values(styles.toggles)
        .flatMap((set) => Array.from(set))
        .join(' ')}
    }

    ${generatePlaceholderLayers(LAYERS.BASE)}
    ${generatePlaceholderLayers(LAYERS.LOGICAL)}
    ${generatePlaceholderLayers(LAYERS.SELECTORS)}
    ${generatePlaceholderLayers(LAYERS.SELECTORS_LOGICAL)}
    ${generatePlaceholderLayers(LAYERS.COMPONENTS)}
    ${generateLayerStyles(styles.atomic)}
    ${generateLayerStyles(styles.selectors)}

    ${composeStyles.join(' ')}
  `;
}

/* -------------------------------------------------------------------------------------------------
 * parseComposeBlocks
 * -----------------------------------------------------------------------------------------------*/

function parseComposeBlocks(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  config: Tokenami.Config
) {
  let parsedComposeBlocks: Record<`.${string}`, TokenamiProperties> = {};

  for (const [selector, tokenamiProperties] of Object.entries(composeBlocks)) {
    const entries = Object.entries(tokenamiProperties);
    const aliasProperties = Tokenami.iterateAliasProperties(entries, config);
    let styles: TokenamiProperties = {};

    for (let [key, value, propertyConfig] of aliasProperties) {
      const tokenProperty = key as Tokenami.TokenProperty;

      for (const cssProperty of propertyConfig.cssProperties) {
        const longProperty = Tokenami.createLonghandProperty(tokenProperty, cssProperty);
        const parsedProperty = Tokenami.parseProperty(longProperty);
        const calcToggle = Tokenami.calcProperty(parsedProperty);

        styles[parsedProperty] = value;
        if (propertyConfig.isCalc) (styles as any)[calcToggle] = '/**/';
      }
    }

    parsedComposeBlocks[selector as any] = styles;
  }

  return parsedComposeBlocks;
}

/* -------------------------------------------------------------------------------------------------
 * getPropertySelectors
 * -----------------------------------------------------------------------------------------------*/

function getPropertySelectors(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  prop: PropertyConfig,
  config: Tokenami.Config
) {
  let selectors: string[] = [];
  const selectorConfig = getPropertyConfigSelector(prop.selector, config);
  const baseSelectors = getBaseSelectors(composeBlocks, prop.tokenProperty);
  const elemSelector = selectorConfig.find(isElementSelector);

  if (elemSelector) {
    const parsedSelectors = getParsedSelectors(prop.selector, [elemSelector], baseSelectors);
    if (elemSelector === '&') selectors.push(...parsedSelectors.flat());
    selectors.push(...parsedSelectors.flat());
  } else {
    selectors.push(...baseSelectors);
  }

  return {
    base: utils.unique(selectors),
    all: getParsedSelectors(prop.selector, selectorConfig, baseSelectors),
  };
}

/* -------------------------------------------------------------------------------------------------
 * getBaseSelectors
 * -----------------------------------------------------------------------------------------------*/

function getBaseSelectors(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  property: Tokenami.TokenProperty
): string[] {
  const composeSelectors = Object.entries(composeBlocks).flatMap(([selector, styles]) => {
    return styles[property] !== undefined ? [selector] : [];
  });
  return [DEFAULT_SELECTOR, ...composeSelectors];
}

/* -------------------------------------------------------------------------------------------------
 * createVariantValue
 * -----------------------------------------------------------------------------------------------*/

function createVariantValue(
  cssProperty: string,
  prop: PropertyConfig,
  propertyConfigs: PropertyConfig[]
) {
  let variantValue = 'revert-layer';
  const seen = new Set<string>();

  for (const propertyConfig of propertyConfigs) {
    if (!propertyConfig.variant) continue;
    if (seen.has(propertyConfig.variant)) continue;

    const hashedProperty = hashVariantProperty(propertyConfig.variant, cssProperty);
    variantValue = `var(${hashedProperty}, ${variantValue})`;
    seen.add(propertyConfig.variant);
  }

  // revert-layer doesn't work for custom properties in Safari so we explicitly set the fallback
  // to the base custom property value for variants
  const customPropertyFallback = `var(${Tokenami.tokenProperty(cssProperty)})`;
  const customPropertyValue = variantValue.replace('revert-layer', customPropertyFallback);
  return prop.isCustom ? customPropertyValue : variantValue;
}

/* -------------------------------------------------------------------------------------------------
 * createToggleDeclaration
 * -----------------------------------------------------------------------------------------------*/

function createToggleDeclaration(
  responsiveSelector: string | undefined,
  selector: string[],
  toggleProperty: string
) {
  let toggle = `${toggleProperty}: ;`;
  const responsiveSelectors = [responsiveSelector, ...selector].reverse();

  for (const selector of responsiveSelectors) {
    if (!selector) continue;
    const elemSelector = removePseudoElementSelector(selector);
    toggle = `${elemSelector} { ${toggle} }`;
  }

  return toggle;
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
 * generateLayerStyles
 * -----------------------------------------------------------------------------------------------*/

function generateLayerStyles(styles: Record<string, Set<string>>) {
  const groupedBySelectors = new Map<string, string>();

  for (const [template, selectors] of Object.entries(styles)) {
    // separate pseudo elements from other selectors
    const { pseudoElements, otherSelectors } = separateSelectors(selectors);

    // group other selectors (comma-separated) and add their styles
    if (otherSelectors.length > 0) {
      const groupedSelector = otherSelectors.sort().join(',');
      const existingStyles = groupedBySelectors.get(groupedSelector) || '';
      const newStyles = template.replace(SELECTOR_TAG, groupedSelector);
      groupedBySelectors.set(groupedSelector, existingStyles + ' ' + newStyles);
    }

    // add pseudo element styles individually (NOT grouped) to avoid breaking
    // unchainable selectors like ::selection
    for (const pseudoElement of pseudoElements) {
      const existingStyles = groupedBySelectors.get(pseudoElement) || '';
      const newStyles = template.replace(SELECTOR_TAG, pseudoElement);
      groupedBySelectors.set(pseudoElement, existingStyles + ' ' + newStyles);
    }
  }

  return Array.from(groupedBySelectors.values()).join(' ');
}

/* -------------------------------------------------------------------------------------------------
 * separateSelectors
 * -----------------------------------------------------------------------------------------------*/

function separateSelectors(selectors: Set<string>) {
  const pseudoElements: string[] = [];
  const otherSelectors: string[] = [];

  for (const selector of selectors) {
    if (isPseudoElementSelector(selector)) {
      pseudoElements.push(selector);
    } else {
      otherSelectors.push(selector);
    }
  }

  return { pseudoElements, otherSelectors };
}

/* -------------------------------------------------------------------------------------------------
 * getPropertyConfigs
 * -----------------------------------------------------------------------------------------------*/

function getPropertyConfigs(
  tokenProperties: Tokenami.TokenProperty[],
  config: Tokenami.Config
): Map<string, PropertyConfig[]> {
  let propertyConfigs: Map<string, PropertyConfig[]> = new Map();

  for (const property of tokenProperties) {
    const parts = Tokenami.getTokenPropertyParts(property, config);
    if (!parts) continue;

    const properties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);
    const responsiveOrder = parts.responsive ? 1 : 0;
    const selectorOrder = parts.selector ? 2 : 0;
    const order = responsiveOrder + selectorOrder;

    for (const cssProperty of properties) {
      const layerIndex = getAtomicLayerIndex(cssProperty, config);
      if (layerIndex === -1) continue;

      const longhandProperty = Tokenami.createLonghandProperty(property, cssProperty);
      const tokenProperty = Tokenami.parseProperty(longhandProperty);
      const currentConfigs = propertyConfigs.get(cssProperty as any) || [];
      const customConfig = config.customProperties?.[cssProperty];
      const propertyConfig = config.properties?.[cssProperty];

      const isLogical = Supports.supportedLogicalProperties.has(cssProperty as any);
      const isGrid = customConfig?.includes('grid') ?? propertyConfig?.includes('grid') ?? false;
      const isCustom = Boolean(customConfig);

      const layer = parts.variant
        ? `${isLogical ? LAYERS.SELECTORS_LOGICAL : LAYERS.SELECTORS}${layerIndex}`
        : `${isLogical ? LAYERS.LOGICAL : LAYERS.BASE}${layerIndex}`;

      const nextConfig = { ...parts, tokenProperty, order, layer, isCustom, isGrid };
      const sortedConfigs = [...currentConfigs, nextConfig].sort((a, b) => a.order - b.order);
      propertyConfigs.set(cssProperty, sortedConfigs);
    }
  }

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

function generateThemeTokens(
  tokenValues: Tokenami.TokenValue[],
  styleSelector: string | string[],
  config: Tokenami.Config
) {
  const theme = utils.getThemeFromConfig(config.theme);
  const rootSelector = config.themeSelector('root');
  const gridStyles = `${rootSelector} { ${Tokenami.gridProperty()}: ${config.grid}; }`;
  const rootStyles = getThemeStyles(styleSelector, rootSelector, tokenValues, theme.root, config);
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
    return getThemeStyles(styleSelector, selector, tokenValues, JSON.parse(theme), config);
  });

  const themeTokens = [gridStyles, rootStyles, modeStyles.join(' ')];
  return themeTokens.join(' ');
}

/* -------------------------------------------------------------------------------------------------
 * getThemeStyles
 * -----------------------------------------------------------------------------------------------*/

const getThemeStyles = (
  styleSelector: string | string[],
  selector: string | string[],
  tokenValues: Tokenami.TokenValue[],
  theme: Tokenami.Theme,
  config: Tokenami.Config
) => {
  const themeValues = utils.getThemeValuesByTokenValues(tokenValues, theme);
  const customPropertyThemeValues = getCustomPropertyThemeValues(themeValues, config);
  const selectors = [selector].flat();

  for (const customKey of Object.keys(customPropertyThemeValues)) {
    delete themeValues[customKey];
  }

  const themeStyles = selectors.reduceRight((declaration, selector) => {
    return `${selector} { ${declaration} }`;
  }, stringify(themeValues));

  const elementSelector = selectors.at(-1)!;
  const elementThemeStyles = getElementThemeStyles(
    styleSelector,
    elementSelector,
    customPropertyThemeValues
  );
  const customPropertyThemeStyles = selectors.slice(0, -1).reduceRight((declaration, selector) => {
    return `${selector} { ${declaration} }`;
  }, elementThemeStyles);

  return themeStyles + ' ' + customPropertyThemeStyles;
};

/* -------------------------------------------------------------------------------------------------
 * getElementThemeStyles
 * -----------------------------------------------------------------------------------------------*/

const getElementThemeStyles = (
  styleSelector: string | string[],
  selector: string,
  themeValues: Record<string, string>
) => {
  const splitChained = selector.split(',');
  const themeStyles = splitChained.map((selector) => {
    const elemSelector = [styleSelector].flat().map((s) => `${selector} ${s}`);
    return `${selector}, ${elemSelector} { ${stringify(themeValues)} }`;
  });
  return themeStyles.join(' ');
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
 * hashVariantProperty
 * -----------------------------------------------------------------------------------------------*/

function hashVariantProperty(variant: string, property: string) {
  return `--_${Tokenami.hash(variant + property)}`;
}

/* -------------------------------------------------------------------------------------------------
 * isElementSelector
 * -----------------------------------------------------------------------------------------------*/

function isElementSelector(selector = '') {
  return isCombinatorSelector(selector) || isPseudoElementSelector(selector) || selector === '&';
}

/* -------------------------------------------------------------------------------------------------
 * isCombinatorSelector
 * -----------------------------------------------------------------------------------------------*/

function isCombinatorSelector(selector = '') {
  return isChildSelector(selector) || /(.+)\s\&/.test(selector);
}

/* -------------------------------------------------------------------------------------------------
 * isPseudoElementSelector
 * -----------------------------------------------------------------------------------------------*/

function isPseudoElementSelector(selector = '') {
  return /::/.test(selector);
}

/* -------------------------------------------------------------------------------------------------
 * removePseudoElementSelector
 * -----------------------------------------------------------------------------------------------*/

function removePseudoElementSelector(selector = '') {
  return selector.replace(/::[a-z-]+$/, '');
}

/* -------------------------------------------------------------------------------------------------
 * isChildSelector
 * -----------------------------------------------------------------------------------------------*/

function isChildSelector(selector = '') {
  return /&\s(.+)/.test(selector);
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
 * getPropertyConfigSelector
 * -----------------------------------------------------------------------------------------------*/

function getPropertyConfigSelector(
  propertySelector: PropertyConfig['selector'],
  tokenamiConfig: Tokenami.Config
): string[] {
  const arbitrarySelector = Tokenami.getArbitrarySelector(propertySelector);
  const configSelector = propertySelector && tokenamiConfig.selectors?.[propertySelector];
  const selector = arbitrarySelector?.replace(/_/g, ' ') || configSelector;
  return selector ? (Array.isArray(selector) ? selector : [selector]) : ['&'];
}

/* -------------------------------------------------------------------------------------------------
 * getParsedSelectors
 * -----------------------------------------------------------------------------------------------*/

function getParsedSelectors(
  propertySelector: PropertyConfig['selector'],
  selectorConfig: string[],
  elementSelectors: string[]
): string[][] {
  if (selectorConfig.toString().indexOf('&') === -1) {
    throw new Error(`Selector '${propertySelector}' must include '&'`);
  }

  const isSelectionVariant = selectorConfig.includes('&::selection');
  return elementSelectors.map((elementSelector) => {
    // revert-layer for ::selection doesn't work: https://codepen.io/jjenzz/pen/LYvOydB
    // we use a substring selector for now to ensure selection styles aren't inadvertently
    // removed. we can use container style queries to improve this when support improves
    // https://codepen.io/jjenzz/pen/BaEmRpg
    const isSelectionSelector = isSelectionVariant && elementSelector === DEFAULT_SELECTOR;
    const tkSelector = isSelectionSelector ? `[style*="${propertySelector}_"]` : elementSelector;
    return selectorConfig.map((selector) => selector.replace(/&/g, tkSelector));
  });
}

/* ---------------------------------------------------------------------------------------------- */

export { generate, LAYERS };
