import { ESLintUtils } from '@typescript-eslint/utils';
import * as NoInvalidTokens from './no-invalid-tokens';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaFeatures: { jsx: true } },
});

const validStatements = [
  `const foo = { '--padding': 4, '--bg-color': 'var(--color-red)' };`,
  `
  function Component() {
    return (
      <div style={{ '--padding': 4, '--bg-color': 'var(--color-red)' }} />
    );
  }
  `,
];

const invalidStatments = [
  `const foo = { '--bg-color': 'var(--color-blue)' };`,
  `
  function Component() {
    return (
      <div style={{ '--bg-color': 'var(--color-blue)' }} />
    );
  }
  `,
];

ruleTester.run(NoInvalidTokens.RULE_NAME, NoInvalidTokens.rule, {
  valid: validStatements,
  invalid: [
    { code: invalidStatments[0], errors: [{ messageId: NoInvalidTokens.MESSAGE_INVALID_TOKEN }] },
    { code: invalidStatments[1], errors: [{ messageId: NoInvalidTokens.MESSAGE_INVALID_TOKEN }] },
  ],
});
