/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'plugin:@tokenami/css/recommended',
  ],
  settings: {
    '@tokenami/css': {
      projectRoot: __dirname,
    },
  },
};
