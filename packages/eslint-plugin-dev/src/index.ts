import pkgJson from '../package.json';
import * as NoInvalidTokens from './rules/no-invalid-tokens';

const meta = {
  name: 'eslint-plugin-dev',
  varsion: pkgJson.version,
};

const rules = {
  [NoInvalidTokens.RULE_NAME]: NoInvalidTokens.rule,
};

const configs = {
  recommended: {
    plugins: ['@tokenami/dev'],
    rules: {
      [`@tokenami/dev/${NoInvalidTokens.RULE_NAME}`]: 'error',
    },
  },
};

export { meta, rules, configs };
