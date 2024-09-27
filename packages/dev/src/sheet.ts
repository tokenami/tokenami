import * as Tokenami from '@tokenami/config';
import { type TokenamiProperties, createCss } from '@tokenami/css';
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

function generate(params: {
  output: string;
  config: Tokenami.Config;
  minify?: boolean;
  targets?: lightning.Targets;
  tokens: {
    properties: Tokenami.TokenProperty[];
    values: Tokenami.TokenValue[];
    composeBlocks: Record<string, TokenamiProperties> | undefined;
  };
}) {
  if (!params.tokens.properties.length) return '';

  const tokenProperties = params.tokens.properties;
  const tokenValues = params.tokens.values;
  const configProperties = Object.keys(params.config.properties || {});
  const composeBlocks = params.tokens.composeBlocks || {};
  const propertyConfigsByCSSProperty = getPropertyConfigs(tokenProperties, params.config);
  const allPropertyConfigs = Array.from(propertyConfigsByCSSProperty.values()).flat();
  const styleSelector = createBaseSelector(Object.keys(composeBlocks));

  const elemSelectors = utils.unique(
    allPropertyConfigs.map((config) => {
      const selectors = getSelectorsFromConfig(config.selector, params.config);
      return selectors.find(isElementSelector) || styleSelector;
    })
  );

  const styles = {
    reset: new Set<string>(),
    atomic: new Set<string>(),
    selectors: new Set<string>(),
    components: {} as Record<string, Set<string>>,
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
      const layerIndex = getAtomicLayerIndex(cssProperty, configProperties);
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
        const declaration = `${styleSelector} { ${propertyPrefix}${cssProperty}: ${propertyValue}; }`;
        const layer = `${isLogical ? LAYERS.LOGICAL : LAYERS.BASE}${layerIndex}`;

        if (!isInheritable) styles.reset.add(`${config.tokenProperty}: initial;`);
        styles.atomic.add(`@layer ${layer} { ${declaration} }`);
        if (config.isGrid) {
          const gridToggle = getGridPropertyToggle(config.tokenProperty);
          styles.atomic.add(`@layer ${layer} { ${styleSelector} { ${gridToggle} } }`);
        }
      }
    });
  });

  const css = createCss(params.config);

  for (const [block, tokenamiProperties] of Object.entries(composeBlocks)) {
    const parsed = css(tokenamiProperties);
    for (const [property, value] of Object.entries(parsed)) {
      const atomicPair = `${property}: ${value};`;
      styles.components[atomicPair] ??= new Set<string>();
      styles.components[atomicPair]!.add(`.${block}`);
    }
  }

  const composeStyles = Object.entries(styles.components).map(([atomicPair, blocks]) => {
    return `@layer ${LAYERS.COMPONENTS} { ${Array.from(blocks)} { ${atomicPair} } }`;
  });

  const sheet = `
    @layer global {
      ${params.config.globalStyles ? stringify(params.config.globalStyles) : ''}
    }

    @layer tkb {
      ${generateKeyframeRules(tokenValues, params.config)}
      ${generateThemeTokens(tokenValues, styleSelector, params.config)}
      ${styleSelector} { ${Array.from(styles.reset).join(' ')} }
      ${Object.values(styles.toggles)
        .flatMap((set) => Array.from(set))
        .join(' ')}
    }

    ${generatePlaceholderLayers(LAYERS.BASE)}
    ${generatePlaceholderLayers(LAYERS.LOGICAL)}
    ${generatePlaceholderLayers(LAYERS.SELECTORS)}
    ${generatePlaceholderLayers(LAYERS.SELECTORS_LOGICAL)}
    ${generatePlaceholderLayers(LAYERS.COMPONENTS)}

    ${Array.from(styles.atomic).join(' ')}
    ${Array.from(styles.selectors).join(' ')}
    ${composeStyles.join(' ')}
  `;

  try {
    const transformed = lightning.transform({
      code: Buffer.from(sheet),
      filename: params.output,
      minify: params.minify,
      targets: params.targets,
    });

    return transformed.code.toString().replace(UNUSED_LAYERS_REGEX, '');
  } catch (e) {
    log.debug(`Skipped style generation with ${e}`);
    return `${e}`;
  }
}

/* -------------------------------------------------------------------------------------------------
 * createBaseSelector
 * -----------------------------------------------------------------------------------------------*/

function createBaseSelector(blockNames: string[]) {
  const classNames = blockNames.map((block) => `.${block}`);
  return [...classNames, DEFAULT_SELECTOR];
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
  const customProperties = Object.keys(config.properties || {}).filter((property) => {
    return !Supports.supportedProperties.has(property as any);
  });

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

function getAtomicLayerIndex(cssProperty: string, configProperties: string[]): number {
  const validProperties = new Set([...Supports.supportedProperties, ...configProperties]);
  const isSupported = validProperties.has(cssProperty as any);
  const initialDepth = isSupported ? 1 : -1;

  if (cssProperty === 'all') return 0;

  return SHORTHAND_TO_LONGHAND_ENTRIES.reduce((depth, [shorthand, longhands]) => {
    const isLonghand = (longhands as string[]).includes(cssProperty);
    return isLonghand ? depth + getAtomicLayerIndex(shorthand, configProperties) : depth;
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
  const { modes, ...rootTheme } = config.theme;
  const rootSelector = ':root';
  const rootEntries = getThemeEntries(
    styleSelector,
    rootSelector,
    tokenValues,
    rootTheme,
    config.properties
  );
  const modeThemeEntries = Object.entries(modes || {}).flatMap(([mode, theme]) => {
    if (!config.themeSelector) return [];
    const selector = config.themeSelector(mode);
    // prefix mode selectors with comment to group them in stylesheet
    return getThemeEntries(
      styleSelector,
      `/*mode*/${selector}`,
      tokenValues,
      theme,
      config.properties
    );
  });

  const gridStyles = { [rootSelector]: { [Tokenami.gridProperty()]: config.grid } };
  const rootStyles = Object.fromEntries(rootEntries);
  const modeStyles = Object.fromEntries(modeThemeEntries);

  return stringify(mergeStyles(mergeStyles(gridStyles, rootStyles), modeStyles));
}

/* -------------------------------------------------------------------------------------------------
 * getThemeEntries
 * -----------------------------------------------------------------------------------------------*/

const getThemeEntries = (
  styleSelector: string | string[],
  selector: string,
  tokenValues: Tokenami.TokenValue[],
  theme: Tokenami.Theme,
  properties: Tokenami.Config['properties']
) => {
  const themeValues = utils.getThemeValuesByTokenValues(tokenValues, theme);
  const customPropertyThemeValues = getCustomPropertyThemeValues(themeValues, properties);
  const baseSelectors = [styleSelector].flat().map((s) => `${selector} ${s}`);

  for (const customKey of Object.keys(customPropertyThemeValues)) {
    delete themeValues[customKey];
  }

  return [
    [selector, themeValues],
    [`${selector}, ${baseSelectors}`, customPropertyThemeValues],
  ] as const;
};

/* -------------------------------------------------------------------------------------------------
 * getCustomPropertyThemeValues
 * -----------------------------------------------------------------------------------------------*/

function getCustomPropertyThemeValues(
  themeValues: { [key: string]: string },
  properties?: Tokenami.Config['properties']
) {
  const entries = Object.entries(themeValues).flatMap(([key, value]) => {
    const valueWithCustomPrefixes = getPrefixedCustomPropertyValues(value, properties);
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
  properties?: Tokenami.Config['properties']
) => {
  const variables = themeValue.match(CUSTOM_PROP_REGEX);
  if (!variables) return null;

  return themeValue.replace(CUSTOM_PROP_REGEX, (m) => {
    const match = m.replace('(', '');
    const tokenProperty = Tokenami.TokenProperty.safeParse(match);
    if (!tokenProperty.success) return m;

    const parts = Tokenami.getTokenPropertySplit(tokenProperty.output);
    const isSupported = Supports.supportedProperties.has(parts.alias as any);
    const isAlias = properties?.[parts.alias];
    if (isSupported || !isAlias) return m;

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

function mergeStyles(target: Record<string, any>, source: Record<string, any>) {
  const result = { ...target, ...source };
  for (const key of Object.keys(result)) {
    result[key] =
      typeof target[key] == 'object' && typeof source[key] == 'object'
        ? mergeStyles(target[key], source[key])
        : // we're only dealing with objects/strings for now, so this is safe
          JSON.parse(JSON.stringify(result[key]));
  }
  return result;
}

export { generate, LAYERS };
