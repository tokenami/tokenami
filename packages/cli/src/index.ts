#!/usr/bin/env node
import * as fs from 'fs';

const palette = {
  red100: '#c00',
  blue100: 'blue',
  green100: 'green',
  white: 'white',
};

const theme = {
  space: '0.23rem',
  breakpoints: {
    md: '(min-width: 500px)',
    lg: '(min-width: 800px)',
  },
  colors: {
    ...palette,
    primary: palette.red100,
    secondary: palette.blue100,
  },
  radii: {
    rounded: '10px',
    circle: '9999px',
  },
};

const PROPERTIES = {
  color: ['color', 'background-color'],
  space: [
    'padding-top',
    'padding-left',
    'padding-right',
    'padding-bottom',
    'margin-top',
    'margin-bottom',
    'margin-left',
    'column-gap',
    'row-gap',
  ],
  other: [
    'border-radius',
    'width',
    'height',
    'display',
    'flex-direction',
    'grid-template-columns',
    'grid-template-areas',
    'grid-template-rows',
    'font-size',
    'font-weight',
    'line-height',
  ],
};

const ALL_PROPERTIES = Object.values(PROPERTIES).reduce((a, b) => a.concat(b));
const PSEUDO = ['hover', 'focus', 'active', 'disabled'];
const ALIASES = {
  'background-color': ['bg-color', 'background-color'],
  'column-gap': ['gap', 'column-gap'],
  'row-gap': ['gap', 'row-gap'],
  'margin-left': ['margin', 'm', 'mx', 'ml', 'margin-left'],
  'margin-right': ['margin', 'm', 'mx', 'mr', 'margin-right'],
  'margin-top': ['margin', 'm', 'my', 'mt', 'margin-top'],
  'margin-bottom': ['margin', 'm', 'my', 'mb', 'margin-bottom'],
  'padding-left': ['padding', 'p', 'px', 'pl', 'padding-left'],
  'padding-right': ['padding', 'p', 'px', 'pr', 'padding-right'],
  'padding-top': ['padding', 'p', 'py', 'pt', 'padding-top'],
  'padding-bottom': ['padding', 'p', 'py', 'pb', 'padding-bottom'],
};

type Theme = typeof theme;

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

const sheet = `
  :root {
    --space: ${theme.space};
    ${getVars(theme.colors, 'color').join('\n')}
    ${getVars(theme.radii, 'radii').join('\n')}
  }

  * {
    ${ALL_PROPERTIES.map((property) => getPropertyInitialVars(property)).join('\n')}
  }

  ${ALL_PROPERTIES.map((property) => getPropertyStyles(property)).join('\n')}

  ${PSEUDO.map((pseudo) => {
    return ALL_PROPERTIES.map((property) => {
      const appendPseudo = (selector: string) => `${selector}:${pseudo}`;
      return getVariantStyles(property, pseudo, appendPseudo);
    }).join('\n');
  }).join('\n')}

  ${Object.entries(theme.breakpoints)
    .map(([name, breakpoint]) => {
      return `@media ${breakpoint} {
        ${ALL_PROPERTIES.map((property) => getVariantStyles(property, name)).join('\n')}
      }`;
    })
    .join('\n')}
`;

try {
  fs.mkdirSync('public/styles', { recursive: true });
  fs.writeFileSync('public/styles/tokenami.css', sheet, { flag: 'w' });
} catch (err) {
  console.log(err);
}
