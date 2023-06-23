import type { Config } from './config';
import { PROPERTIES, ALIASES } from './constants';

type Theme = Config['theme'];

function privateVar(property: string) {
  return `--_tk-${property}`;
}

function initialVar(property: string) {
  return privateVar(`i_${property}`);
}

function getVars(themeProperty: Theme[keyof Theme], prefix: string) {
  return Object.entries(themeProperty).map(([name, value]) => `--${prefix}-${name}: ${value};`);
}

function getPropertyInitialVars(property: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const initial = PROPERTIES.space.includes(property) ? '0' : 'initial';
  return `${initialVar(property)}: ${propertyAliases.reduce(
    (fallback, alias) => `var(--${alias},${fallback})`,
    initial
  )};`;
}

function getPropertyVars(property: string) {
  const variable = privateVar(property);
  const initial = initialVar(property);
  if (PROPERTIES.space.includes(property)) {
    return `${variable}: var(${initial}); ${property}: calc(var(--space) * var(${variable}));`;
  } else {
    return `${variable}: var(${initial}); ${property}: var(${variable});`;
  }
}

function getVariantVars(property: string, variant: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const initial = initialVar(property);
  return `${privateVar(property)}: ${propertyAliases.reduce(
    (fallback, alias) => `var(--${variant}_${alias},${fallback})`,
    // we fallback to initital in case the variant is deselected in dev tools
    // it will fall back to any non-variant values applied to the same element
    `var(${initial})`
  )};`;
}

function getPropertyStyles(property: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const selector = propertyAliases.map((alias) => `[style*="--${alias}:"]`).join(',');
  return `${selector} { ${getPropertyVars(property)} }`;
}

function getVariantStyles(property: string, variant: string, reducer = (s: string) => s) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const selector = propertyAliases
    .map((alias) => reducer(`[style*="--${variant}_${alias}:"]`))
    .join(',');
  return `${selector} { ${getVariantVars(property, variant)} }`;
}

/* ---------------------------------------------------------------------------------------------- */

export {
  getVars,
  getPropertyInitialVars,
  getPropertyVars,
  getVariantVars,
  getPropertyStyles,
  getVariantStyles,
};
