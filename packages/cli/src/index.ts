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
  'margin-left': ['m', 'mx', 'ml', 'margin-left'],
  'margin-right': ['m', 'mx', 'mr', 'margin-right'],
  'margin-top': ['m', 'my', 'mt', 'margin-top'],
  'margin-bottom': ['m', 'my', 'mb', 'margin-bottom'],
  'padding-left': ['p', 'px', 'pl', 'padding-left'],
  'padding-right': ['p', 'px', 'pr', 'padding-right'],
  'padding-top': ['p', 'py', 'pt', 'padding-top'],
  'padding-bottom': ['p', 'py', 'pb', 'padding-bottom'],
};

type Theme = typeof theme;

function privateVar(property: string) {
  return `--_${property}`;
}

function getVars(themeProperty: Theme[keyof Theme], prefix: string) {
  return Object.entries(themeProperty).map(([name, value]) => `--${prefix}-${name}: ${value};`);
}

function getPropertyInitialVars(property: string, initial: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  return propertyAliases.reduce((fallback, alias) => `var(--${alias},${fallback})`, initial);
}

function getVariantVars(property: string, variant: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  return propertyAliases.reduce((fallback, alias) => `var(--${variant}_${alias},${fallback})`, '');
}

function getPropertyVars(property: string) {
  // prevent inheriting from parent elements
  const propertyAliases: string[] = ALIASES[property] || [property];
  const lastAlias = propertyAliases[propertyAliases.length - 1];
  const variable = privateVar(property);

  if (PROPERTIES.space.includes(property)) {
    const value = getPropertyInitialVars(property, '0');
    return `--${lastAlias}: initial; ${variable}: ${value}; ${property}: calc(var(--space) * var(${variable}));`;
  } else {
    const value = getPropertyInitialVars(property, 'initial');
    return `--${lastAlias}: initial; ${variable}: ${value}; ${property}: var(${variable});`;
  }
}

function getPropertyStyles(property: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const selector = propertyAliases.map((alias) => `[style*="--${alias}:"]`).join(',');
  return `${selector} { ${getPropertyVars(property)} }`;
}

function getPseudoStyles(property: string, pseudo: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const selector = propertyAliases
    .map((alias) => `[style*="--${pseudo}_${alias}:"]:${pseudo}`)
    .join(',');

  return `${selector} { ${privateVar(property)}: ${getVariantVars(property, pseudo)} }`;
}

function getBreakpointStyles(property: string, name: string) {
  const propertyAliases: string[] = ALIASES[property] || [property];
  const selector = propertyAliases.map((alias) => `[style*="--${name}_${alias}:"]`).join(',');
  return `${selector} { ${privateVar(property)}: ${getVariantVars(property, name)} }`;
}

const sheet = `
  :root {
    --space: ${theme.space};
    ${getVars(theme.colors, 'color').join('\n')}
    ${getVars(theme.radii, 'radii').join('\n')}
  }

  ${ALL_PROPERTIES.map((property) => getPropertyStyles(property)).join('\n')}

  ${PSEUDO.map((pseudo) => {
    return ALL_PROPERTIES.map((property) => getPseudoStyles(property, pseudo)).join('\n');
  }).join('\n')}

  ${Object.entries(theme.breakpoints)
    .map(([name, breakpoint]) => {
      return `@media ${breakpoint} {
        ${ALL_PROPERTIES.map((property) => getBreakpointStyles(property, name)).join('\n')}
      } `;
    })
    .join('\n')}
`;

try {
  fs.mkdirSync('public/styles', { recursive: true });
  fs.writeFileSync('public/styles/tokenami.css', sheet, { flag: 'w' });
} catch (err) {
  console.log(err);
}
