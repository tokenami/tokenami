import type { Config } from '@tokenami/config';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as fs from 'fs';
import {
  getConfigPath,
  mergedConfigs,
  getTokenValues,
  getAvailableTokenPropertiesWithVariants,
} from '@tokenami/config';
import pkgJson from '../../package.json';

interface PluginSettings {
  projectRoot?: string;
}

export const MESSAGE_INVALID_TOKEN = 'INVALID_TOKEN';

export const rule: TSESLint.RuleModule<typeof MESSAGE_INVALID_TOKEN> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'Disallow invalid token values based on theme',
      recommended: 'error',
    },
    messages: {
      [MESSAGE_INVALID_TOKEN]: `Token value '{{value}}' does not exist in theme.`,
    },
  },
  create(context) {
    const settings = getSettings(context.settings);
    const cwd = settings.projectRoot || context.getCwd?.() || process.cwd();
    const configPath = getConfigPath(cwd);
    const config = mergedConfigs(fs.existsSync(configPath) ? require(configPath) : {});

    return {
      async ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        const tokenValues = getTokenValues(config.theme);
        const valid = Object.keys(tokenValues).map((token) => `var(${token})`);

        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;
          if (isTokenamiToken(key, config) && isVariableValue(value) && !valid.includes(value)) {
            context.report({ node: node.value, messageId: MESSAGE_INVALID_TOKEN, data: { value } });
          }
        }
      },
    };
  },
};

function getSettings(settings: TSESLint.SharedConfigurationSettings): PluginSettings {
  return settings[pkgJson.name.replace('eslint-plugin-', '')] || {};
}

type Token = `--${string})`;
type TokenValue = `var(---${string})`;

function isTokenamiToken(value: TSESTree.Literal['value'], config: Config): value is Token {
  const availableTokens = getAvailableTokenPropertiesWithVariants(config);
  if (typeof value !== 'string') return false;
  return availableTokens.includes(value);
}

function isVariableValue(value: TSESTree.Literal['value']): value is TokenValue {
  return typeof value === 'string' && /var\(---[a-z-_].+\)/i.test(value);
}

function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}
