import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as Tokenami from '@tokenami/config';

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
      [MESSAGE_HAS_ARBITRARY_VALUE]: `Use theme token or mark arbitrary with "var(---,{{value}})".`,
      [MESSAGE_REMOVE_ARBITRARY_VALUE]: `Use "var(---,{{value}})"`,
    },
  },
  create(context) {
    return {
      async ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        if (isLiteral(node.key) && isLiteral(node.value)) {
          const key = node.key.value;
          const value = node.value.value;

          if (
            isTokenProperty(key) &&
            !isTokenValue(value) &&
            !isArbitraryValue(value) &&
            !isGridValue(value)
          ) {
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

function isTokenProperty(key: TSESTree.Literal['value']): key is Tokenami.TokenProperty {
  return Tokenami.TokenProperty.safeParse(key).success;
}

function isArbitraryValue(value: TSESTree.Literal['value']): value is Tokenami.AnyValue {
  return Tokenami.AnyValue.safeParse(value).success;
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
