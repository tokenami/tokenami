import { getConfigPath, mergedConfigs, getTokenValues } from '@tokenami/config';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import pkgJson from '../../package.json';
import * as fs from 'fs';

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
          // TODO: check if key is a tokenami token e.g. `--border-radius` before validating value
          if (isToken(key) && isTokenValue(value) && !valid.includes(value)) {
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
type TokenValue = `var(${string})`;

function isToken(value: TSESTree.Literal['value']): value is Token {
  return typeof value === 'string' && /--.*/.test(value);
}

function isTokenValue(value: TSESTree.Literal['value']): value is TokenValue {
  return typeof value === 'string' && /var\(.*\)/.test(value);
}

function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}
