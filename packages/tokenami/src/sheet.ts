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

  const sheet = new Sheet(params.tokens.values, params.config);
  const composeBlocks = parseComposeBlocks(params.tokens.composeBlocks, params.config);
  const propertyConfigsByCSSProperty = getPropertyConfigs(params.tokens.properties, params.config);

  for (const [cssProperty, propertyConfigs] of propertyConfigsByCSSProperty) {
    const isInheritable = Supports.inheritedProperties.has(cssProperty);
    const elementConfigs = propertyConfigs.filter((c) => {
      const selectorConfig = getSelectorFromConfig(c.selector, params.config);
      return !selectorConfig.some(isPseudoElementSelector);
    });

    for (const prop of propertyConfigs) {
      const baseProperty = prop.isCustom ? CUSTOM_PROP_PREFIX + cssProperty : cssProperty;
      const gridProperty = hashVariantProperty('grid', prop.tokenProperty);
      const gridToggleValue = createGridToggleValue(prop.tokenProperty);
      const selectorConfig = getSelectorFromConfig(prop.selector, params.config);
      const parsedSelectors = getPropertySelectors(composeBlocks, prop, selectorConfig);
      const configs = selectorConfig.some(isPseudoElementSelector)
        ? propertyConfigs.filter((c) => c.selector === prop.selector)
        : elementConfigs;

      sheet.addThemeTokenSelectors(parsedSelectors.elements);

      if (!isInheritable && !selectorConfig.some(isChildSelector)) {
        sheet.addReset(prop.tokenProperty);
      }

      if (prop.variant) {
        const responsiveConfig = getResponsiveSelectorFromConfig(prop.responsive, params.config);
        const hashedProperty = hashVariantProperty(prop.variant, cssProperty);
        const toggleProperty = Tokenami.parsedTokenProperty(prop.variant);
        const variantValue = createVariantValue(cssProperty, prop, configs);
        const variantToggleValue = prop.isGrid
          ? createGridVariantToggleValue(toggleProperty, prop.tokenProperty)
          : createVariantToggleValue(toggleProperty, prop.tokenProperty);

        sheet.addReset(toggleProperty);
        sheet.addReset(hashedProperty);

        for (const selector of parsedSelectors.all) {
          sheet.addToggleFlagDeclaration(responsiveConfig, selector, toggleProperty);
        }

        for (const selector of parsedSelectors.elements) {
          const pseudoOwnerSelector = removePseudoElementSelector(selector);
          const baseSelector = prop.isCustom ? pseudoOwnerSelector : selector;
          sheet.addDeclaration(prop.layer, baseSelector, baseProperty, variantValue);
          sheet.addDeclaration(prop.layer, pseudoOwnerSelector, hashedProperty, variantToggleValue);
          if (prop.isGrid) {
            sheet.addDeclaration(prop.layer, pseudoOwnerSelector, gridProperty, gridToggleValue);
          }
        }
      } else {
        const propertyValue = prop.isGrid
          ? createGridPropertyValue(prop.tokenProperty, 'revert-layer')
          : createBasePropertyValue(prop.tokenProperty, 'revert-layer');

        for (const selector of parsedSelectors.elements) {
          sheet.addDeclaration(prop.layer, selector, baseProperty, propertyValue);
          if (prop.isGrid) {
            sheet.addDeclaration(prop.layer, selector, gridProperty, gridToggleValue);
          }
        }
      }
    }
  }

  const composeEntries = Object.entries(composeBlocks);
  for (const [selector, tokenamiProperties] of composeEntries) {
    const propertyEntries = Object.entries(tokenamiProperties);
    for (let [key, value] of propertyEntries) {
      sheet.addDeclaration(LAYERS.COMPONENTS, selector, key, value);
    }
  }

  return sheet.toString();
}

/* -------------------------------------------------------------------------------------------------
 * Sheet
 * -----------------------------------------------------------------------------------------------*/

const SELECTOR_TAG = '<selector>';
const CUSTOM_PROP_REGEX = /\(--[^-][\w-]+/g;

class Sheet {
  config: Tokenami.Config;
  tokenValues: Tokenami.TokenValue[];
  themeTokenSelectors: string[] = [];
  reset = new Set<string>();
  toggles: Record<string, Set<string>> = {};
  layers: Record<string, Set<string>> = {};

  constructor(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
    this.tokenValues = tokenValues;
    this.config = config;
  }

  addReset(property: string) {
    this.reset.add(`${property}: initial;`);
  }

  addThemeTokenSelectors(baseSelectors: string[]) {
    this.themeTokenSelectors.push(...baseSelectors.map(removePseudoElementSelector));
  }

  addDeclaration(layer: string, selector: string, property: string, value: string) {
    const declaration = `${property}: ${value}`;
    const template = `@layer ${layer} { ${SELECTOR_TAG} { ${declaration} } }`;
    this.layers[template] ??= new Set<string>();
    this.layers[template]!.add(selector);
  }

  addToggleFlagDeclaration(
    responsiveConfig: string | undefined,
    selector: string[],
    toggleProperty: string
  ) {
    let toggle = `${toggleProperty}: ;`;
    const toggleKey = responsiveConfig || selector.join();
    const responsiveSelectors = [responsiveConfig, ...selector].reverse();

    for (const selector of responsiveSelectors) {
      if (!selector) continue;
      const elemSelector = removePseudoElementSelector(selector);
      toggle = `${elemSelector} { ${toggle} }`;
    }

    this.toggles[toggleKey] ??= new Set<string>();
    this.toggles[toggleKey]!.add(toggle);
  }

  #generateGlobalStyles() {
    if (!this.config.globalStyles) return '';
    return `@layer global { ${stringify(this.config.globalStyles)} }`;
  }

  #generateTokenamiResets() {
    const themeTokenSelectors = utils.unique(this.themeTokenSelectors);
    return `
      @layer tkb {
        ${this.#generateKeyframeRules()}
        ${this.#generateThemeTokens(themeTokenSelectors)}
        * { ${Array.from(this.reset).join(' ')} }
        ${Object.values(this.toggles)
          .flatMap((set) => Array.from(set))
          .join(' ')}
      }
    `;
  }

  #generatePlaceholderLayers(prefix: string) {
    // this 20 is arbitrary for now, will make this more correct later.
    return `@layer ${Array.from({ length: 20 })
      .map((_, layer) => `${prefix}${layer}`)
      .join(', ')};`;
  }

  #generateLayerStyles() {
    const entries = Object.entries(this.layers);
    const groupedBySelectors = new Map<string, string>();

    for (const [template, selectors] of entries) {
      // separate pseudo elements from other selectors
      const { pseudoElements, otherSelectors } = this.#separateSelectors(selectors);

      // group other selectors (comma-separated) and add their styles
      if (otherSelectors.length > 0) {
        const groupedSelector = otherSelectors.sort().join(',');
        const existingStyles = groupedBySelectors.get(groupedSelector) || '';
        const newStyles = template.replace(SELECTOR_TAG, groupedSelector);
        groupedBySelectors.set(groupedSelector, existingStyles + ' ' + newStyles);
      }

      // add pseudo element styles individually (NOT grouped) to avoid breaking
      // ungroupable selectors like ::selection
      for (const pseudoElement of pseudoElements) {
        const existingStyles = groupedBySelectors.get(pseudoElement) || '';
        const newStyles = template.replace(SELECTOR_TAG, pseudoElement);
        groupedBySelectors.set(pseudoElement, existingStyles + ' ' + newStyles);
      }
    }

    return Array.from(groupedBySelectors.values()).join(' ');
  }

  #separateSelectors(selectors: Set<string>) {
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

  #generateKeyframeRules() {
    const themeValues = this.tokenValues.flatMap((tokenValue) => {
      return Object.values(utils.getThemeValuesByThemeMode(tokenValue, this.config.theme));
    });

    const rules = Object.entries(this.config.keyframes || {}).flatMap(([name, styles]) => {
      const nameRegex = new RegExp(`\\b${name}\\b`);
      const isUsingKeyframeName = themeValues.some((value) => nameRegex.test(value));
      if (!isUsingKeyframeName) return [];
      return [[`@keyframes ${name} { ${stringify(styles)} }`]];
    });

    return rules.join(' ');
  }

  #generateThemeTokens(styleSelector: string | string[]) {
    const theme = utils.getThemeFromConfig(this.config.theme);
    const rootSelector = this.config.themeSelector('root');
    const gridStyles = `${rootSelector} { ${Tokenami.gridProperty()}: ${this.config.grid}; }`;
    const rootStyles = this.#getThemeStyles(styleSelector, rootSelector, theme.root);
    const themeToModes: Record<string, string[]> = {};
    const modeEntries = Object.entries(theme.modes || {});

    // working around this for now https://github.com/parcel-bundler/lightningcss/issues/841
    for (const [mode, theme] of modeEntries) {
      const themeKey = JSON.stringify(theme);
      if (themeKey in themeToModes) themeToModes[themeKey]!.push(mode);
      else themeToModes[themeKey] = [mode];
    }

    const modeStyles = Object.entries(themeToModes).map(([theme, modes]) => {
      const selector = modes.map(this.config.themeSelector).join(', ');
      return this.#getThemeStyles(styleSelector, selector, JSON.parse(theme));
    });

    const themeTokens = [gridStyles, rootStyles, modeStyles.join(' ')];
    return themeTokens.join(' ');
  }

  #getThemeStyles(
    styleSelector: string | string[],
    selector: string | string[],
    theme: Tokenami.Theme
  ) {
    const themeValues = utils.getThemeValuesByTokenValues(this.tokenValues, theme);
    const customPropertyThemeValues = this.#getCustomPropertyThemeValues(themeValues);
    const customPropertyThemeKeys = Object.keys(customPropertyThemeValues);
    const selectors = [selector].flat();
    const elementSelector = selectors.at(-1)!;
    const parentSelectors = selectors.slice(0, -1);
    const elementThemeStyles = this.#getElementThemeStyles(
      styleSelector,
      elementSelector,
      customPropertyThemeValues
    );

    for (const customKey of customPropertyThemeKeys) {
      delete themeValues[customKey];
    }

    const themeStyles = selectors.reduceRight(
      (declaration, selector) => `${selector} { ${declaration} }`,
      stringify(themeValues)
    );

    const customPropertyThemeStyles = parentSelectors.reduceRight(
      (declaration, selector) => `${selector} { ${declaration} }`,
      elementThemeStyles
    );

    return themeStyles + ' ' + customPropertyThemeStyles;
  }

  #getCustomPropertyThemeValues(themeValues: { [key: string]: string }) {
    const entries = Object.entries(themeValues).flatMap(([key, value]) => {
      const valueWithCustomPrefixes = this.#getPrefixedCustomPropertyValues(value);
      return valueWithCustomPrefixes ? [[key, valueWithCustomPrefixes] as const] : [];
    });
    return Object.fromEntries(entries);
  }

  #getPrefixedCustomPropertyValues(themeValue: string) {
    const variables = themeValue.match(CUSTOM_PROP_REGEX);
    if (!variables) return null;

    return themeValue.replace(CUSTOM_PROP_REGEX, (m) => {
      const match = m.replace('(', '');
      const tokenProperty = Tokenami.TokenProperty.safeParse(match);
      if (!tokenProperty.success) return m;

      const parts = Tokenami.getTokenPropertySplit(tokenProperty.output);
      const isCustom = Boolean(this.config.customProperties?.[parts.alias]);
      if (!isCustom) return m;

      const tokenPrefix = Tokenami.tokenProperty('');
      const customPrefixTokenValue = tokenProperty.output.replace(tokenPrefix, CUSTOM_PROP_PREFIX);
      return '(' + customPrefixTokenValue;
    });
  }

  #getElementThemeStyles(
    styleSelector: string | string[],
    selector: string,
    themeValues: Record<string, string>
  ) {
    const splitGroups = selector.split(',');
    const themeStyles = splitGroups.map((selector) => {
      const elemSelector = [styleSelector].flat().map((s) => `${selector} ${s}`);
      return `${selector}, ${elemSelector} { ${stringify(themeValues)} }`;
    });
    return themeStyles.join(' ');
  }

  toString() {
    return `
      ${this.#generateGlobalStyles()}
      ${this.#generateTokenamiResets()}
      ${this.#generatePlaceholderLayers(LAYERS.BASE)}
      ${this.#generatePlaceholderLayers(LAYERS.LOGICAL)}
      ${this.#generatePlaceholderLayers(LAYERS.SELECTORS)}
      ${this.#generatePlaceholderLayers(LAYERS.SELECTORS_LOGICAL)}
      ${this.#generatePlaceholderLayers(LAYERS.COMPONENTS)}
      ${this.#generateLayerStyles()}
    `;
  }
}

/* -------------------------------------------------------------------------------------------------
 * parseComposeBlocks
 * -----------------------------------------------------------------------------------------------*/

function parseComposeBlocks(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  config: Tokenami.Config
) {
  let parsedComposeBlocks: Record<`.${string}`, TokenamiProperties> = {};
  const entries = Object.entries(composeBlocks);

  for (const [selector, tokenamiProperties] of entries) {
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
  selectorConfig: string[]
) {
  let selectors: string[] = [];
  const baseSelectors = getBaseSelectors(composeBlocks, prop.tokenProperty);
  const elemSelector = selectorConfig.find(isElementSelector);

  if (elemSelector) {
    const parsedSelectors = getParsedSelectors(prop.selector, [elemSelector], baseSelectors);
    selectors.push(...parsedSelectors.flat());
  } else {
    selectors.push(...baseSelectors);
  }

  const elementSelectors = utils.unique(selectors).map((selector) => {
    return isPseudoElementSelector(selector) ? selector : selector.replace(/:.+$/, '');
  });

  return {
    all: getParsedSelectors(prop.selector, selectorConfig, baseSelectors),
    elements: elementSelectors,
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
 * createBasePropertyValue
 * -----------------------------------------------------------------------------------------------*/

function createBasePropertyValue(property: string, fallback?: string) {
  return `var(${property}${fallback ? ', ' + fallback : ''})`;
}

/* -------------------------------------------------------------------------------------------------
 * createGridPropertyValue
 * -----------------------------------------------------------------------------------------------*/

function createGridPropertyValue(property: string, fallback?: string) {
  const hashGridProperty = hashVariantProperty('grid', property);
  const baseProperty = createBasePropertyValue(property, fallback);
  return `var(${hashGridProperty}, ${baseProperty})`;
}

/* -------------------------------------------------------------------------------------------------
 * createVariantValue
 * -----------------------------------------------------------------------------------------------*/

function createVariantValue(
  cssProperty: string,
  prop: PropertyConfig,
  propertyConfigs: PropertyConfig[]
) {
  // revert-layer doesn't work for custom properties in Safari so we explicitly set the fallback
  // to the base custom property value for variants
  const customPropertyFallback = `var(${Tokenami.tokenProperty(cssProperty)})`;
  let variantValue = prop.isCustom ? customPropertyFallback : 'revert-layer';
  const seen = new Set<string>();

  for (const propertyConfig of propertyConfigs) {
    if (!propertyConfig.variant) continue;
    if (seen.has(propertyConfig.variant)) continue;

    const hashedProperty = hashVariantProperty(propertyConfig.variant, cssProperty);
    variantValue = `var(${hashedProperty}, ${variantValue})`;
    seen.add(propertyConfig.variant);
  }

  return variantValue;
}

/* -------------------------------------------------------------------------------------------------
 * createGridToggleValue
 * -----------------------------------------------------------------------------------------------*/

function createGridToggleValue(property: string) {
  const gridProperty = Tokenami.gridProperty();
  return `var(${property}__calc) calc(var(${property}) * var(${gridProperty}))`;
}

/* -------------------------------------------------------------------------------------------------
 * createVariantToggleValue
 * -----------------------------------------------------------------------------------------------*/

function createVariantToggleValue(toggleProperty: string, tokenProperty: string) {
  const basePropertyValue = createBasePropertyValue(tokenProperty);
  return `var(${toggleProperty}) ${basePropertyValue};`;
}

/* -------------------------------------------------------------------------------------------------
 * createGridVariantToggleValue
 * -----------------------------------------------------------------------------------------------*/

function createGridVariantToggleValue(toggleProperty: string, tokenProperty: string) {
  const basePropertyValue = createGridPropertyValue(tokenProperty);
  return `var(${toggleProperty}) ${basePropertyValue};`;
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
      const layerIndex = getPropertyLayerIndex(cssProperty, config);
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
 * getPropertyLayerIndex
 * -----------------------------------------------------------------------------------------------*/

const SHORTHAND_TO_LONGHAND_ENTRIES = Array.from(Tokenami.mapShorthandToLonghands.entries());

function getPropertyLayerIndex(cssProperty: string, config: Tokenami.Config): number {
  const validProperties = utils.getValidProperties(config);
  const isSupported = validProperties.has(cssProperty as any);
  const initialDepth = isSupported ? 1 : -1;

  if (cssProperty === 'all') return 0;

  return SHORTHAND_TO_LONGHAND_ENTRIES.reduce((depth, [shorthand, longhands]) => {
    const isLonghand = (longhands as string[]).includes(cssProperty);
    return isLonghand ? depth + getPropertyLayerIndex(shorthand, config) : depth;
  }, initialDepth);
}

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
 * getSelectorFromConfig
 * -----------------------------------------------------------------------------------------------*/

function getSelectorFromConfig(
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
  const selectors = [];

  for (const elementSelector of elementSelectors) {
    // revert-layer for ::selection doesn't work: https://codepen.io/jjenzz/pen/LYvOydB
    // we use a substring selector for now to ensure selection styles aren't inadvertently
    // removed. we can use container style queries to improve this when support improves
    // https://codepen.io/jjenzz/pen/BaEmRpg
    const isSelectionSelector = isSelectionVariant && elementSelector === DEFAULT_SELECTOR;
    const tkSelector = isSelectionSelector ? `[style*="${propertySelector}_"]` : elementSelector;
    const selectorConfigs = expandSelectorConfigs(selectorConfig);

    for (const selectorConfig of selectorConfigs) {
      const selector = selectorConfig.map((selector) => selector.replace(/&/g, tkSelector));
      selectors.push(selector);
    }
  }

  return selectors;
}

/* -------------------------------------------------------------------------------------------------
 * expandSelectorConfigs
 * -----------------------------------------------------------------------------------------------*/

function expandSelectorConfigs(selectorConfig: string[]) {
  const parts = selectorConfig.map(parseSelectorList);
  let results: string[][] = [[]];

  for (const group of parts) {
    const res = [];
    for (const existing of results) {
      for (const value of group) {
        res.push([...existing, value]);
      }
    }
    results = res;
  }

  return results;
}

function parseSelectorList(selector: string) {
  const selectors: string[] = [];
  let currentSelector = '';
  let depth = 0;

  for (const [index, char] of selector.split('').entries()) {
    if (char === '(') depth++;
    if (char === '[') depth++;
    if (char === ')') depth--;
    if (char === ']') depth--;

    const nextChar = selector[index + 1];

    if (!nextChar) {
      currentSelector += char;
      selectors.push(currentSelector.trim());
      currentSelector = '';
    } else if (char === ',' && depth === 0) {
      selectors.push(currentSelector.trim());
      currentSelector = '';
    } else {
      currentSelector += char;
    }
  }

  return selectors;
}

/* ---------------------------------------------------------------------------------------------- */

export { generate, LAYERS };
