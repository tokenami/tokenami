import * as Tokenami from '@tokenami/config';
import { stringify } from '@stitches/stringify';
import * as lightning from 'lightningcss';
import * as utils from './utils';
import deepmerge from 'deepmerge';

type PropertyConfig = ReturnType<typeof Tokenami.getTokenPropertyParts> & {
  order: number;
  value: string;
};

const TOGGLE_OFF = 'initial';

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

type Styles = { [key: string]: string | Styles };
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

  let styles = {
    reset: [] as Styles[],
    atomic: [] as Styles[],
    selectors: new Map<string, Styles[]>(selectorKeys.map((key) => [key, []])),
    responsive: new Map<string, Styles[]>(responsiveKeys.map((key) => [key, []])),
  };

  propertyConfigs.forEach(([property, configs]) => {
    const reset = getResetTokenValue(property, params.config);
    const tokenProperty = Tokenami.tokenProperty(property);
    const sortedConfigs = configs.sort((a, b) => a.order - b.order);
    const variants = sortedConfigs.flatMap((config) => (config.variant ? [config.variant] : []));
    const uniqueVariants = Array.from(new Set(variants));

    const toggles = uniqueVariants.map((toggle) => {
      const variantProperty = Tokenami.variantProperty(toggle, property);
      const value = `var(${variantProperty})`;
      styles.reset.push({ [variantProperty]: TOGGLE_OFF });
      return { [hashVariantProperty(toggle, property)]: `var(--${toggle}) ${value}` };
    });

    const propertyValue = uniqueVariants.reduce(
      (fallback, variant) => `var(${hashVariantProperty(variant, property)}, ${fallback})`,
      `var(${tokenProperty}, revert)`
    );

    styles.reset.push({ [`${tokenProperty}`]: reset || TOGGLE_OFF });

    sortedConfigs.forEach((config) => {
      const responsive = config.responsive && params.config.responsive?.[config.responsive];
      const selector = config.selector && params.config.selectors?.[config.selector];
      const selectors = Array.isArray(selector) ? selector : selector ? [selector] : ['&'];
      const nestedSelectors = [responsive, ...selectors].filter(Boolean) as string[];

      styles.atomic.push(Object.assign({}, ...toggles, { [property]: propertyValue }));

      if (config.responsive || config.selector) {
        styles.reset.push({ [`--${config.variant}`]: TOGGLE_OFF });

        const toggles = config.responsive
          ? styles.responsive.get(config.responsive)
          : styles.selectors.get(config.selector!);

        const toggle = nestedSelectors.reduceRight(
          (declaration, template) => ({ [template.replace('&', '[style]')]: declaration }),
          { [`--${config.variant}`]: '' } as Styles
        );

        toggles?.push(toggle);
      }
    });
  });

  const sheet = Object.assign(
    generateKeyframeRules(tokenValues, params.config),
    { ':root': generateRootStyles(tokenValues, params.config) },
    { '[style]': Object.assign({}, ...styles.reset, ...styles.atomic) },
    deepMergeGroups(styles.selectors),
    deepMergeGroups(styles.responsive)
  );

  const transformed = lightning.transform({
    code: Buffer.from(stringify(sheet)),
    filename: params.output,
    minify: params.minify,
    targets: params.targets,
  });

  return transformed.code.toString();
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

  tokenEntries.forEach(([tokenProperty, tokenValue]) => {
    const parts = Tokenami.getTokenPropertyParts(tokenProperty, config);
    const properties = parts?.alias && utils.getLonghandsForAlias(parts.alias, config);
    if (!properties || !properties.length) return;

    properties.forEach((property) => {
      const specificity = utils.getSpecifictyOrderForCSSProperty(property);
      if (specificity > -1) {
        const responsiveOrder = parts.responsive ? 1 : 0;
        const selectorOrder = parts.selector ? 2 : 0;
        const order = responsiveOrder + selectorOrder;
        propertyConfigs[specificity] ??= [property, []];
        propertyConfigs[specificity]![1].push({ ...parts, order, value: tokenValue });
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
  const entries = Object.entries(config.keyframes || {}).flatMap(([name, styles]) => {
    const nameRegex = new RegExp(`\\b${name}\\b`);
    const isUsingKeyframeName = themeValues.some((value) => nameRegex.test(value));
    if (!isUsingKeyframeName) return [];
    return [[`@keyframes ${name}`, styles] as const];
  });
  return Object.fromEntries(entries);
}

/* -------------------------------------------------------------------------------------------------
 * generateRootStyles
 * -----------------------------------------------------------------------------------------------*/

function generateRootStyles(tokenValues: Tokenami.TokenValue[], config: Tokenami.Config) {
  return {
    [Tokenami.tokenProperty('grid')]: config.grid,
    ...utils.getThemeValuesByTokenValues(tokenValues, config.theme),
  };
}

/* -------------------------------------------------------------------------------------------------
 * getResetTokenValueVarForAliases
 * -----------------------------------------------------------------------------------------------*/

function getResetTokenValue(cssProperty: Tokenami.CSSProperty, config: Tokenami.Config) {
  const aliasEntries = Object.entries(config.aliases || {});
  return aliasEntries
    .flatMap(([alias, properties]) => (properties?.includes(cssProperty) ? [alias] : []))
    .reduce((fallback, alias) => `var(${Tokenami.tokenProperty(alias)}, ${fallback})`, '')
    .replace(', )', ')');
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
 * hashVariant
 * -----------------------------------------------------------------------------------------------*/

function hashVariantProperty(variant: string, property: string) {
  return `--_${hash(variant + property)}`;
}

/* -------------------------------------------------------------------------------------------------
 * deepMergeGroups
 * -----------------------------------------------------------------------------------------------*/

function deepMergeGroups(styles: Map<string, Styles[]>) {
  const flattened = Array.from(styles.values()).flat();
  return flattened.reduce((a, b) => deepmerge(a, b));
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
