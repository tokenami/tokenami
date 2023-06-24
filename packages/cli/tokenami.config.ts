import type { Config } from './src/config';

const config: Config = {
  include: [],
  aliases: {
    'background-color': ['background-color', 'bg-color'],
    'column-gap': ['column-gap', 'gap'],
    'row-gap': ['row-gap', 'gap'],
    'margin-left': ['margin-left', 'ml', 'mx'],
    'margin-right': ['margin-right', 'mr', 'mx'],
    'margin-top': ['margin-top', 'mt', 'my'],
    'margin-bottom': ['margin-bottom', 'mb', 'my'],
    margin: ['margin', 'm'],
    'padding-left': ['padding-left', 'pl', 'px'],
    'padding-right': ['padding-right', 'pr', 'px'],
    'padding-top': ['padding-top', 'pt', 'py'],
    'padding-bottom': ['padding-bottom', 'pb', 'py'],
    padding: ['padding', 'p'],
  },
  theme: {
    space: '1px',
    breakpoints: {},
    colors: {},
    radii: {},
  },
};

export default config;
