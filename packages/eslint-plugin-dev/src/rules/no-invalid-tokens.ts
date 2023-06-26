import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as pathe from 'pathe';
import * as fs from 'fs';
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
    // TODO: move config related stuff to a config package which we can reuse here and in cli pkg
    const path = pathe.join(cwd, 'tokenami.config.js');
    const config = fs.existsSync(path) ? require(path) : {};
    const theme = config.theme;

    return {
      ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        const colors = getTokens(theme?.colors, 'color');
        const radii = getTokens(theme?.radii, 'radii');
        const valid = [...colors, ...radii];
        // TODO: check if key is a tokenami token e.g. `--border-radius` before validating value
        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;
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

function getTokens(themeProperty: Record<string, string> = {}, prefix: string) {
  return Object.keys(themeProperty).map((key) => `var(--${prefix}-${key})`);
}
