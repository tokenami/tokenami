import pkgJson from '../package.json';
import * as NoInvalidTokens from './rules/no-invalid-tokens';
import * as ExplicitArbitraryValues from './rules/explicit-arbitrary-values';

const meta = {
  name: 'eslint-plugin-dev',
  varsion: pkgJson.version,
};

const rules = {
  'no-invalid-tokens': NoInvalidTokens.rule,
  'explicit-arbitrary-values': ExplicitArbitraryValues.rule,
};

const configs = {
  recommended: {
    plugins: ['@tokenami/dev'],
    rules: {
      [`@tokenami/dev/no-invalid-tokens`]: 'error',
      [`@tokenami/dev/explicit-arbitrary-values`]: 'error',
    },
  },
};

export { meta, rules, configs };
