import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as fs from 'fs';
import * as Tokenami from '@tokenami/config';
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
    const configPath = Tokenami.getConfigPath(cwd);
    const config = Tokenami.mergedConfigs(fs.existsSync(configPath) ? require(configPath) : {});

    return {
      async ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        const tokenValues = Tokenami.getValuesByTokenValueProperty(config.theme);
        const valid = Object.keys(tokenValues).map((token) => `var(${token})`);

        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;
          if (isTokenProperty(key) && isTokenValue(value) && !valid.includes(value)) {
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

function isTokenProperty(key: TSESTree.Literal['value']): key is Tokenami.TokenProperty {
  return Tokenami.TokenProperty.safeParse(key).success;
}

function isTokenValue(value: TSESTree.Literal['value']): value is Tokenami.TokenValue {
  return Tokenami.TokenValue.safeParse(value).success;
}

function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}
