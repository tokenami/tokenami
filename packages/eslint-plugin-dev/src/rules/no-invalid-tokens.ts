import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'no-invalid-tokens';
export const MESSAGE_INVALID_TOKEN = 'invalidToken';

export const rule = ESLintUtils.RuleCreator(() => RULE_NAME)({
  name: RULE_NAME,
  defaultOptions: [],
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'Disallow invalid token values based on theme',
      recommended: 'error',
    },
    messages: { [MESSAGE_INVALID_TOKEN]: `Token value does not exist in theme.` },
  },
  create(context) {
    const valid = [4, 'var(--color-red)'];
    return {
      ['Property:matches([key.value=/^--/])'](node: TSESTree.Property) {
        if ('type' in node.value && node.value.type === 'Literal') {
          if (Boolean(node.value.value) && !valid.includes(node.value.value as any)) {
            context.report({ node: node, messageId: MESSAGE_INVALID_TOKEN });
          }
        }
      },
    };
  },
});
