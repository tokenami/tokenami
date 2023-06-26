import pkgJson from '../package.json';
import * as NoInvalidTokens from './rules/no-invalid-tokens';

const meta = {
  name: 'eslint-plugin-dev',
  varsion: pkgJson.version,
};

const rules = {
  'no-invalid-tokens': NoInvalidTokens.rule,
};

const configs = {
  recommended: {
    plugins: ['@tokenami/dev'],
    rules: {
      [`@tokenami/dev/no-invalid-tokens`]: 'error',
    },
  },
};

export { meta, rules, configs };
