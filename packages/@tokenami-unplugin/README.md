# @tokenami/unplugin

Vite plugin for Tokenami built with unplugin.

## Usage

```ts
import * as tokenami from '@tokenami/unplugin';

export default {
  plugins: [tokenami.vite({ output: './src/style.css' })],
};
```

Import the generated stylesheet in your app root:

```ts
import './style.css';
```

Only Vite is supported for now. For other bundlers and frameworks, use the Tokenami CLI instead,
and feel free to open a GitHub issue if plugin support for another tool is something you need.

## Options

```ts
vite({
  cwd: process.cwd(),
  config: './.tokenami/tokenami.config.ts',
  output: './src/style.css',
});
```
