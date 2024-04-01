import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';

const UNUSED_LAYERS_REGEX = /\n\s*@layer[-\w\s,]+;/g;
const DEFAULT_SELECTOR = '[style]';

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
    const variants = configs.flatMap((config) => (config.variant ? [config.variant] : []));
    const variantValue = utils.unique(variants).reduce((fallback, variant) => {
      const hashedProperty = hashVariantProperty(variant, cssProperty);
      return `var(${hashedProperty}, ${fallback})`;
    }, 'revert-layer');

    configs.forEach((config) => {
      const propertyLayer = getAtomicLayer(cssProperty);
      const toggleKey = config.responsive || config.selector;

      if (config.variant && toggleKey) {
        const responsive = getResponsiveSelectorFromConfig(config.responsive, params.config);
        const selectors = getSelectorsFromConfig(config.selector, params.config);
        const responsiveSelectors = [responsive, ...selectors].filter(Boolean) as string[];
        const selectorLayer = `@layer tk-selector-${propertyLayer}`;
        const variantProperty = Tokenami.variantProperty(config.variant, cssProperty);
        const hashedProperty = hashVariantProperty(config.variant, cssProperty);
        const toggleProperty = Tokenami.tokenProperty(config.variant);
        const toggleDeclaration = `${hashedProperty}: var(${toggleProperty}) var(${variantProperty});`;
        const declaration = `${cssProperty}: ${variantValue};`;

        const toggle = responsiveSelectors.reduceRight(
          (declaration, selector) => `${selector} { ${declaration} }`,
          `${toggleProperty}: ;`
        );

        styles.reset.add(`${toggleProperty}: initial;`);
        styles.reset.add(`${variantProperty}: initial;`);
        styles.selectors.add(`${selectorLayer} { ${elemSelectors} { ${declaration} } }`);
        styles.selectors.add(`${selectorLayer} { ${elemSelectors} { ${toggleDeclaration} } }`);
        styles.toggles[toggleKey] ??= new Set<string>();
        styles.toggles[toggleKey]!.add(toggle);
      } else {
        const propertyValue = `var(${config.tokenProperty}, revert-layer)`;
        const declaration = `${DEFAULT_SELECTOR} { ${cssProperty}: ${propertyValue}; }`;
        styles.reset.add(`${config.tokenProperty}: initial;`);
        styles.atomic.add(`@layer tk-${propertyLayer} { ${declaration} }`);
      }
    });
  });

  const sheet = `
    @layer tokenami {
      ${generateKeyframeRules(tokenValues, params.config)}
      ${generateThemeTokens(tokenValues, params.config)}

      ${DEFAULT_SELECTOR} { ${Array.from(styles.reset).join(' ')} }
      @layer ${Tokenami.layers.map((_, layer) => `tk-${layer}`).join(', ')};
      @layer ${Tokenami.layers.map((_, layer) => `tk-selector-${layer}`).join(', ')};

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

  const entries = propertyConfigs.flatMap((entry) => {
    if (!entry) return [];
    const [cssProperty, configs] = entry;
    const sortedConfigs = configs.sort((a, b) => a.order - b.order);
    return [[cssProperty, sortedConfigs] as const];
  });

  return new Map(entries);
}

/* -------------------------------------------------------------------------------------------------
 * getAtomicLayer
 * -----------------------------------------------------------------------------------------------*/

function getAtomicLayer(cssProperty: string) {
  return Tokenami.layers.findIndex((layer: string[]) => layer.includes(cssProperty));
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
