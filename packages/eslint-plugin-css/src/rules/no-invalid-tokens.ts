import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as Tokenami from '@tokenami/config';
import * as fs from 'fs';
import pkgJson from '../../package.json';

interface PluginSettings {
  projectRoot?: string;
}

export const MESSAGE_INVALID_TOKEN = 'INVALID_TOKEN';
const MESSAGE_UNKNOWN_PROPERTY = 'UNKNOWN_PROPERTY';
const MESSAGE_MARK_ARBITRARY = 'MARK_ARBITRARY_VALUE';

export const rule: TSESLint.RuleModule<
  typeof MESSAGE_INVALID_TOKEN | typeof MESSAGE_UNKNOWN_PROPERTY | typeof MESSAGE_MARK_ARBITRARY
> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    schema: [],
    hasSuggestions: true,
    docs: {
      description: 'Disallow invalid token values based on theme',
      recommended: 'error',
    },
    messages: {
      [MESSAGE_INVALID_TOKEN]: `Use theme value from {{keys}} or mark arbitrary with "var(---,{{value}})".`,
      [MESSAGE_UNKNOWN_PROPERTY]: `Invalid token value "{{value}}" for property`,
      [MESSAGE_MARK_ARBITRARY]: `Use "var(---,{{value}})"`,
    },
  },
  create(context) {
    const settings = getSettings(context.settings);
    const cwd = settings.projectRoot || context.getCwd?.() || process.cwd();
    const configPath = Tokenami.getConfigPath(cwd);
    const config = Tokenami.mergedConfigs(fs.existsSync(configPath) ? require(configPath) : {});

    return {
      async ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;

          if (!isTokenProperty(key)) return;

          const tokenPropertyName = Tokenami.getTokenPropertyName(key);
          const tokenPropertyParts = Tokenami.getTokenPropertyParts(tokenPropertyName, config);

          for (let cssProperty of tokenPropertyParts.properties) {
            const themeKeys = config.properties?.[cssProperty] || [];
            const isThemedGridValue = themeKeys.includes('grid') && isGridValue(value);

            // if the property isn't declared as themeable in theme `properties` then
            // we allow any values e.g. `display: flex`
            if (!isTokenValue(value) && !isThemedGridValue && !themeKeys.length) continue;

            // otherwise we expect a value from theme or an arbitrary value e.g. `var(---, 4px)`
            const tokenValues = Tokenami.getValuesByTokenValueProperty(config.theme, themeKeys);
            const validTokenValues = Object.keys(tokenValues).map((token) => `var(${token})`);
            const isValidTokenValue = isTokenValue(value) && validTokenValues.includes(value);

            if (!isArbitraryValue(value) && !isValidTokenValue && !isThemedGridValue) {
              const keys = themeKeys.join(', ') + ',';
              context.report({
                node: node.value,
                messageId: themeKeys.length ? MESSAGE_INVALID_TOKEN : MESSAGE_UNKNOWN_PROPERTY,
                data: { value, keys },
                suggest: [
                  {
                    messageId: MESSAGE_MARK_ARBITRARY,
                    data: { value, keys },
                    fix: (fixer) => fixer.replaceText(node.value, `"var(---,${value})"`),
                  },
                ],
              });
              // we only want to report once per node
              break;
            }
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

function isArbitraryValue(value: TSESTree.Literal['value']): value is Tokenami.ArbitraryValue {
  return Tokenami.ArbitraryValue.safeParse(value).success;
}

function isTokenValue(value: TSESTree.Literal['value']): value is Tokenami.TokenValue {
  return Tokenami.TokenValue.safeParse(value).success;
}

function isGridValue(value: TSESTree.Literal['value']): value is Tokenami.GridValue {
  return Tokenami.GridValue.safeParse(value).success;
}

function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}
