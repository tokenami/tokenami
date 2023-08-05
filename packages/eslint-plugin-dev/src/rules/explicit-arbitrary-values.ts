import type { Config } from '@tokenami/config';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as fs from 'fs';
import {
  getConfigPath,
  mergedConfigs,
  getAvailableTokenPropertiesWithVariants,
} from '@tokenami/config';
import pkgJson from '../../package.json';

interface PluginSettings {
  projectRoot?: string;
}

export const MESSAGE_HAS_ARBITRARY_VALUE = 'ARBITRARY_VALUE';
const MESSAGE_REMOVE_ARBITRARY_VALUE = 'REMOVE_ARBITRARY_VALUE';

export const rule: TSESLint.RuleModule<
  typeof MESSAGE_HAS_ARBITRARY_VALUE | typeof MESSAGE_REMOVE_ARBITRARY_VALUE
> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    schema: [],
    hasSuggestions: true,
    docs: {
      description: 'Disallow arbitrary values',
      recommended: 'warn',
    },
    messages: {
      [MESSAGE_HAS_ARBITRARY_VALUE]: `Update theme or use "var(---,{{value}})" to mark as arbitrary.`,
      [MESSAGE_REMOVE_ARBITRARY_VALUE]: `Use "var(---,{{value}})" to mark as arbitrary.`,
    },
  },
  create(context) {
    const settings = getSettings(context.settings);
    const cwd = settings.projectRoot || context.getCwd?.() || process.cwd();
    const configPath = getConfigPath(cwd);
    const config = mergedConfigs(fs.existsSync(configPath) ? require(configPath) : {});

    return {
      async ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;
          if (isTokenamiToken(key, config) && !isArbitraryValue(value) && !isVariableValue(value)) {
            context.report({
              node: node.value,
              messageId: MESSAGE_HAS_ARBITRARY_VALUE,
              data: { value },
              suggest: [
                {
                  messageId: MESSAGE_REMOVE_ARBITRARY_VALUE,
                  data: { value },
                  fix: (fixer) => fixer.replaceText(node.value, `"var(---,${value})"`),
                },
              ],
            });
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

function isTokenamiToken(key: TSESTree.Literal['value'], config: Config): key is Token {
  const availableTokens = getAvailableTokenPropertiesWithVariants(config);
  if (typeof key !== 'string') return false;
  return availableTokens.includes(key);
}

function isArbitraryValue(value: TSESTree.Literal['value']): value is string {
  return typeof value === 'string' && /var\(---,.+\)/.test(value);
}

function isVariableValue(value: TSESTree.Literal['value']): value is TokenValue {
  return typeof value === 'string' && /var\(---[a-z-_].+\)/i.test(value);
}

function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}
