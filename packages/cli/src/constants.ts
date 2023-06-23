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

/* ---------------------------------------------------------------------------------------------- */

export { PROPERTIES, ALL_PROPERTIES, PSEUDO, ALIASES };
