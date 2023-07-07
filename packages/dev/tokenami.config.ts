import type { Config } from './src/config';

const config: Config = {
  include: [],
  aliases: {
    'background-color': ['background-color', 'bg-color'],
    'column-gap': ['column-gap', 'gap'],
    'row-gap': ['row-gap', 'gap'],
    'margin-left': ['margin-left', 'ml', 'mx', 'm'],
    'margin-right': ['margin-right', 'mr', 'mx', 'm'],
    'margin-top': ['margin-top', 'mt', 'my', 'm'],
    'margin-bottom': ['margin-bottom', 'mb', 'my', 'm'],
    'padding-left': ['padding-left', 'pl', 'px', 'p'],
    'padding-right': ['padding-right', 'pr', 'px', 'p'],
    'padding-top': ['padding-top', 'pt', 'py', 'p'],
    'padding-bottom': ['padding-bottom', 'pb', 'py', 'p'],
  },
  theme: {
    space: '1px',
    breakpoints: {},
    colors: {},
    radii: {},
  },
};

export default config;
