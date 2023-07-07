/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:@tokenami/dev/recommended',
  ],
  settings: {
    '@tokenami/dev': {
      projectRoot: __dirname,
    },
  },
};
