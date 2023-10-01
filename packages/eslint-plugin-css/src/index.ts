import pkgJson from '../package.json';
import * as NoInvalidTokens from './rules/no-invalid-tokens';

const meta = {
  name: 'eslint-plugin-css',
  varsion: pkgJson.version,
};

const rules = {
  'no-invalid-tokens': NoInvalidTokens.rule,
};

const configs = {
  recommended: {
    plugins: ['@tokenami/css'],
    rules: {
      [`@tokenami/css/no-invalid-tokens`]: 'error',
    },
  },
};

export { meta, rules, configs };
