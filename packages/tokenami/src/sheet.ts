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
  const allPropertyConfigs = Array.from(propertyConfigsByCSSProperty.values()).flat();
  const baseSelectors = getPropertyBaseSelectors(composeBlocks, allPropertyConfigs, params.config);

  const styles = {
    reset: new Set<string>(),
    atomic: {} as Record<string, Set<string>>,
    selectors: {} as Record<string, Set<string>>,
    components: {} as Record<string, Set<string>>,
    toggles: {} as Record<string, Set<string>>,
  };

  for (const [cssProperty, configs] of propertyConfigsByCSSProperty) {
    const isLogical = Supports.supportedLogicalProperties.has(cssProperty as any);
    const isInheritable = Supports.inheritedProperties.has(cssProperty);

    // sort configs to ensure property value orders fallbacks correctly
    const sortedConfigs = [...configs].sort((a, b) => a.order - b.order);
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const variantValue = utils.unique(variants).reduce((fallback, variant) => {
      const hashedProperty = hashVariantProperty(variant, cssProperty);
      return `var(${hashedProperty}, ${fallback})`;
    }, 'revert-layer');

    for (const prop of configs) {
      const layerIndex = getAtomicLayerIndex(cssProperty, params.config);
      const toggleKey = prop.responsive || prop.selector;
      const propertyPrefix = prop.isCustom ? CUSTOM_PROP_PREFIX : '';

      if (layerIndex === -1) continue;

      if (prop.variant && toggleKey) {
        const responsive = getResponsiveSelectorFromConfig(prop.responsive, params.config);
        const selectorConfig = getPropertyConfigSelector(prop.selector, params.config);
        const hasCombinator = selectorConfig.some(isCombinatorSelector);
        const hashedProperty = hashVariantProperty(prop.variant, cssProperty);
        const basePropertyValue = getBasePropertyValue(prop.tokenProperty, prop, false);
        const toggleProperty = Tokenami.parsedTokenProperty(prop.variant);
        const toggleDeclaration = `${hashedProperty}: var(${toggleProperty}) ${basePropertyValue};`;
        const layer = `${isLogical ? LAYERS.SELECTORS_LOGICAL : LAYERS.SELECTORS}${layerIndex}`;
        // revert-layer doesn't work for custom properties in Safari so we explicitly set the fallback
        // to the base custom property value for variants
        const customPropertyFallback = `var(${Tokenami.tokenProperty(cssProperty)})`;
        const customPropertyValue = variantValue.replace('revert-layer', customPropertyFallback);
        const declaration = `${propertyPrefix}${cssProperty}: ${
          prop.isCustom ? customPropertyValue : variantValue
        };`;

        styles.reset.add(`${toggleProperty}: initial;`);
        if (!isInheritable && !hasCombinator) styles.reset.add(`${prop.tokenProperty}: initial;`);

        styles.selectors[layer] ??= new Set<string>();
        styles.selectors[layer]!.add(declaration);
        styles.selectors[layer]!.add(toggleDeclaration);

        if (prop.isGrid) {
          const gridToggle = getGridPropertyToggle(prop.tokenProperty);
          styles.selectors[layer]!.add(gridToggle);
        }

        const selectors = getPropertySelectors(
          composeBlocks,
          prop.selector,
          prop.tokenProperty,
          params.config
        );

        for (const selector of selectors) {
          const responsiveSelectors = [responsive, ...selector].filter(Boolean) as string[];
          const toggle = responsiveSelectors.reduceRight(
            (declaration, selector) => `${selector} { ${declaration} }`,
            `${toggleProperty}: ;`
          );
          styles.toggles[toggleKey] ??= new Set<string>();
          styles.toggles[toggleKey]!.add(toggle);
        }
      } else {
        const propertyValue = getBasePropertyValue(prop.tokenProperty, prop);
        const declaration = `${propertyPrefix}${cssProperty}: ${propertyValue};`;
        const layer = `${isLogical ? LAYERS.LOGICAL : LAYERS.BASE}${layerIndex}`;

        if (!isInheritable) styles.reset.add(`${prop.tokenProperty}: initial;`);
        styles.atomic[layer] ??= new Set<string>();
        styles.atomic[layer]!.add(declaration);

        if (prop.isGrid) {
          const gridToggle = getGridPropertyToggle(prop.tokenProperty);
          styles.atomic[layer]!.add(gridToggle);
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
      ${generateThemeTokens(tokenValues, baseSelectors, params.config)}
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
    ${generateLayerStyles(styles.atomic, baseSelectors)}
    ${generateLayerStyles(styles.selectors, baseSelectors)}

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
 * getPropertyBaseSelectors
 * -----------------------------------------------------------------------------------------------*/

function getPropertyBaseSelectors(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  propertyConfigs: PropertyConfig[],
  config: Tokenami.Config
): string[] {
  let basePropertySelectors: string[] = [];

  for (const prop of propertyConfigs) {
    const selectorConfig = getPropertyConfigSelector(prop.selector, config);
    const baseSelectors = getBaseSelectors(composeBlocks, prop.tokenProperty);
    const elemSelector = selectorConfig.find(isElementSelector);
    if (!elemSelector) {
      basePropertySelectors.push(...baseSelectors);
    } else {
      const parsedSelectors = getParsedSelectors(prop.selector, [elemSelector], baseSelectors);
      basePropertySelectors.push(...parsedSelectors.flat());
    }
  }

  return utils.unique(basePropertySelectors);
}

/* -------------------------------------------------------------------------------------------------
 * getPropertySelectors
 * -----------------------------------------------------------------------------------------------*/

function getPropertySelectors(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  propertySelector: PropertyConfig['selector'],
  property: Tokenami.TokenProperty,
  config: Tokenami.Config
): string[][] {
  const selectorConfig = getPropertyConfigSelector(propertySelector, config);
  const baseSelectors = getBaseSelectors(composeBlocks, property);
  return getParsedSelectors(propertySelector, selectorConfig, baseSelectors);
}

/* -------------------------------------------------------------------------------------------------
 * getBaseSelectors
 * -----------------------------------------------------------------------------------------------*/

function getBaseSelectors(
  composeBlocks: Record<`.${string}`, TokenamiProperties>,
  property: Tokenami.TokenProperty
): string[] {
  const composeSelectors = Object.entries(composeBlocks).flatMap(([selector, styles]) => {
    return styles[property] ? [selector] : [];
  });
  return [DEFAULT_SELECTOR, ...composeSelectors];
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

function generateLayerStyles(styles: Record<string, Set<string>>, baseSelectors: string[]) {
  const layerStyles = Object.entries(styles).map(([layer, declarations]) => {
    return `@layer ${layer} { ${baseSelectors} { ${Array.from(declarations).join(' ')} } }`;
  });
  return layerStyles.join(' ');
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

  for (const property of tokenProperties) {
    const parts = Tokenami.getTokenPropertyParts(property, config);
    if (!parts) continue;

    const properties = Tokenami.getCSSPropertiesForAlias(parts.alias, config.aliases);
    const responsiveOrder = parts.responsive ? 1 : 0;
    const selectorOrder = parts.selector ? 2 : 0;
    const order = responsiveOrder + selectorOrder;

    for (const cssProperty of properties) {
      const longhandProperty = Tokenami.createLonghandProperty(property, cssProperty);
      const tokenProperty = Tokenami.parseProperty(longhandProperty);
      const currentConfigs = propertyConfigs.get(cssProperty as any) || [];
      const isCustom = customProperties.includes(cssProperty);
      const isGrid = config.properties?.[cssProperty]?.includes('grid') ?? false;
      const nextConfig = { ...parts, tokenProperty, order, isCustom, isGrid };
      propertyConfigs.set(cssProperty, [...currentConfigs, nextConfig]);
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
  const rootSelector = ':root';
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
  return isCombinatorSelector(selector) || /::/.test(selector) || selector === '&';
}

/* -------------------------------------------------------------------------------------------------
 * isCombinatorSelector
 * -----------------------------------------------------------------------------------------------*/

function isCombinatorSelector(selector = '') {
  return /(.+)\s\&|&\s(.+)/.test(selector);
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
