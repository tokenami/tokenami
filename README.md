![image](https://github.com/jjenzz/pretty-cache-header/assets/175330/18df3dab-ba82-4fd6-a74b-ec1c4aecc4ab)

<div align="center">
  <h3>Tokenami</h3>
  <p align="center">
    Atomic CSS in the style attribute.
  </p>
  <p align="center">
    Type-safe static styles with theming, responsive variant support, and no bundler integration.
  </p>
</div>

<details>
<summary align="center"><h2 id="user-content-why-another-css-library">Why another CSS library?</h2></summary>

CSS-in-JS solutions that rely on style injection [won't be recommended by the React team](https://github.com/reactwg/react-18/discussions/110) going forward, and instead they suggest the following:

> Our preferred solution is to use [`<link rel="stylesheet">`](https://github.com/reactwg/react-18/discussions/108) for statically extracted styles and plain inline styles for dynamic values. E.g. `<div style={{...}}>`

In other words—_write css like we used to_. But what about the benefits that CSS-in-JS gave us?

There are CSS-in-JS solutions that extract static rules from your template files into external `.css` files, however, these approaches often require [bundler integration](https://vanilla-extract.style/documentation/integrations/next/) and come with [build-time limitations](https://panda-css.com/docs/guides/dynamic-styling).

The learning curve can be intimidating but developers invest regardless so they can have type errors and intellisense for their design system tokens as well as style deduping, critical path CSS, scoping, and composition.

Tailwind CSS adopts a different strategy to achieve these goals:

- We can style inline to prototype quickly
- Editor extensions for intellisense based on your theme
- Statically generated styles with a simple CLI script, no bundler integration
- Atomic CSS so styles have a cap on how large they can grow

On the flip side:

- Removing values from your theme won't flag redundant references
- We must memorise Tailwind's custom class names which spawns things like the [Tailwind Cheatsheet](https://tailwindcomponents.com/cheatsheet/)
- Specificity issues when composing unless we use third-party packages like [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)
- Styling inline can be unpleasant to maintain, resulting in third-party packages like [cva](https://cva.style/docs)
- Classes must exist as [complete unbroken strings](https://tailwindcss.com/docs/content-configuration#dynamic-class-names)
- Debugging in dev tools is tricky because styles are spread across atomic classes

### Introducing Tokenami

Tokenami aims to improve some of these areas by using CSS variables instead of CSS properties in the `style` attribute, and bringing all necessary tools under one roof. It features:

- Simple naming convention—use the CSS properties you already know, prefixed with double-dash
- Smaller stylesheet made possible by atomic CSS variables
- Config file for defining your theme
- Feature-rich intellisense when authoring styles
- Fully typed `style` attribute for ad-hoc styles, including media queries and pseudo-classes/selectors
- A tiny `css` utility with variants, and responsive variants support
- Seamless composition across component boundaries using the `css` utility
- Runtime style support e.g. `style={{ '--color': props.color }}`
- Aliasable properties e.g. `style={{ '--p': 4 }}` for padding
- Custom selector support enabling sibling or descendant selectors
- Improved debugging experience in dev tools
- Statically generated styles
- No bundler integration
</details>

> [!Warning]
> This is a pre-alpha version of tokenami so there will be bugs and missing features. Please check the [existing issues](https://github.com/tokenami/tokenami/issues) for planned features/known bugs before creating new ones.

## Contents

- [Getting started](#user-content-getting-started)
  - [Prerequisite](#user-content-prerequisite)
  - [Installation](#user-content-installation)
  - [Configure TypeScript](#user-content-configure-typescript)
  - [Configure template paths](#user-content-configure-template-paths)
  - [Start CLI watch script](#user-content-start-the-cli-watch-script)
  - [Use Tokenami](#user-content-use-tokenami)
- [Core concepts](#user-content-core-concepts)
  - [Theming](#user-content-theming)
  - [Styling](#user-content-styling)
  - [Responsive styles](#user-content-responsive-styles)
- [CSS utility](#user-content-css-utility)
  - [Installation](#user-contenty-installation-1)
  - [Usage](#user-content-usage)
  - [Overrides](#user-content-overrides)
- [Advanced](#user-content-advanced)
  - [Selectors](#user-content-selectors)
  - [Aliases](#user-content-aliases)
  - [Mapping properties to theme](#user-content-mapping-properties-to-theme)
  - [Browserslist](#user-content-browserslist)
- [Support](#user-content-support)
  - [Unable to authenticate with GitHub registry](#user-content-unable-to-authenticate-with-github-registry)
  - [Intellisense not working for tokens](#user-content-intellisense-not-working-for-tokens)
- [Credits](#user-content-credits)

## Getting started

The set up is a little complex during pre-alpha. This [will be simplified](https://github.com/tokenami/tokenami/issues/82) before version one.

### Prerequisite

The packages exist on the GitHub registry for now. To access them, add the following to an `.npmrc` file in your project root:

```
@tokenami:registry=https://npm.pkg.github.com/:_authToken=$TOKENAMI_TOKEN
```

Create a [Personal Access Token](https://github.com/settings/tokens/new) for your GitHub account with `read:packages` rights and replace the `$TOKENAMI_TOKEN` or store it in an `.env` file.

### Installation

Install and initialise using your package manager of choice. For example:

```sh
npm install @tokenami/dev@next @tokenami/typescript-plugin@next -D
npx tokenami init
```

### Configure TypeScript

Ensure that your editor is configured to use the project's version of TypeScript. You can find instructions for various editors in their documentation, such as for VSCode [here](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). Then add Tokenami to your tsconfig `include` and `plugins`:

```json
{
  "include": [".tokenami/tokenami.d.ts"],
  "compilerOptions": {
    "plugins": [{ "name": "@tokenami/typescript-plugin" }]
  }
}
```

### Configure template paths

Update `.tokenami/tokenami.config` with a glob matching your template files. The watch script will search these files for Tokenami properties to generate necessary styles.

```ts
const { createConfig } = require('@tokenami/dev');

module.exports = createConfig({
  include: ['./app/**/*.{js,tsx,ts,tsx}'],
  //...
});
```

### Start the CLI watch script

```sh
npx tokenami --output ./public/styles.css --watch
```

Make sure to adjust the output path to your desired location for styles. It will use `./public/tokenami.css` by default if omitted.

### Use Tokenami

Reference your output CSS file in the `<head>` of your document and start styling with Tokenami properties:

```tsx
<h1 style={{ '--padding': 10 }}>Hello, World!</h1>
```

<video src="https://private-user-images.githubusercontent.com/175330/289219715-8d00bf07-f5c4-436a-b4b0-a640211e7969.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDIyMTQxMzQsIm5iZiI6MTcwMjIxMzgzNCwicGF0aCI6Ii8xNzUzMzAvMjg5MjE5NzE1LThkMDBiZjA3LWY1YzQtNDM2YS1iNGIwLWE2NDAyMTFlNzk2OS5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMxMjEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMTIxMFQxMzEwMzRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNDdhY2I1MzM0ZDVmYTNkZTNmM2IwYmVjYWUzODYwMjc3ZjcxZTViNmI2ZjYxNmNiYjFiNDM0MDYzYmJhNDY2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9._k5EY0WOWKOcBmTAUNTY63uQTriqlxawcBrBJnvuJuA" data-canonical-src="https://private-user-images.githubusercontent.com/175330/289219715-8d00bf07-f5c4-436a-b4b0-a640211e7969.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDIyMTQxMzQsIm5iZiI6MTcwMjIxMzgzNCwicGF0aCI6Ii8xNzUzMzAvMjg5MjE5NzE1LThkMDBiZjA3LWY1YzQtNDM2YS1iNGIwLWE2NDAyMTFlNzk2OS5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBSVdOSllBWDRDU1ZFSDUzQSUyRjIwMjMxMjEwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDIzMTIxMFQxMzEwMzRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNDdhY2I1MzM0ZDVmYTNkZTNmM2IwYmVjYWUzODYwMjc3ZjcxZTViNmI2ZjYxNmNiYjFiNDM0MDYzYmJhNDY2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9._k5EY0WOWKOcBmTAUNTY63uQTriqlxawcBrBJnvuJuA" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>

## Core concepts

### Theming

Tokenami relies on your theme to provide design system constraints. Since there's no predefined theme, you need to add your own to the `.tokenami/tokenami.config` for the best Tokenami experience. For example:

```ts
module.exports = createConfig({
  // ...
  responsive: {
    medium: '@media (min-width: 700px)',
    large: '@media (min-width: 1024px)',
  },
  theme: {
    color: {
      'slate-100': '#f1f5f9',
      'slate-700': '#334155',
      'sky-500': '#0ea5e9',
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
      none: 'none',
    },
  },
});
```

The keys in your `responsive` and `theme` objects can be anything you wish. These keys will be used to name your tokens (more on this later).

### Styling

With your theme set up, there are only a few rules to remember:

1. A Tokenami **property** is any CSS property prefixed with double dash, e.g. `--font-size`. Use `---` (triple dash) to add custom CSS variables to an element.
1. A Tokenami **token** is any theme key followed by a value identifier. For example, a `color` object in theme with a `red-100` entry maps to `var(--color-red-100)`.
1. Properties can include selectors like media queries, pseudo-classes, and pseudo-elements separated with an underscore. For instance, `--hover_background-color`, `--md_hover_background-color`.

#### Grid values

Tokenami uses a grid value for spacing. Properties like padding and margin are multiples of this when passed a numeric value. For example, with a grid set to `4px`, using `--padding: 2` adds `8px` of padding to your element.

By default, Tokenami sets the grid to `0.25rem` but you can override it:

```ts
module.exports = createConfig({
  // ...
  grid: '10px',
});
```

#### Arbitrary values

Silencing TypeScript errors for custom inline values is possible using a triple dash fallback. For instance, `--padding: var(---, 20px)` will silence errors and add `20px` padding.

Tokenami purposefully adds friction to the developer experience here to promote adhering to your theme constraints, and so you can easily identify values in your codebase that don't.

### Responsive styles

Define responsive rules in the `responsive` object in your config. This can include `@container` queries:

```ts
module.exports = createConfig({
  // ...
  responsive: {
    medium: '@media (min-width: 1024px)',
    'medium-self': '@container (min-width: 400px)',
  },
});
```

Use by following the [Tokenami property spec](#user-content-styling):

```tsx
<div style={{ '--medium_padding': 4 }} />
```

For documentation on responsive variants, refer to the [CSS utility](#user-content-css-utility) section.

### Animation

Add keyframes to your config and reference them in your theme:

```ts
module.exports = createConfig({
  // ...
  keyframes: {
    wiggle: {
      '0%, 100%': { transform: 'rotate(-3deg)' },
      '50%': { transform: 'rotate(3deg)' },
    },
  },
  theme: {
    anim: {
      wiggle: 'wiggle 1s ease-in-out infinite',
    },
  },
});
```

Use by following the [Tokenami token spec](#user-content-styling):

```tsx
<div style={{ '--animation': 'var(--anim-wiggle)' }} />
```

## CSS utility

Tokenami provides a CSS utility to abstract styles from your views and correctly merge styles across component boundaries. It also provides a variants API.

### Installation

Install using your package manager of choice. For example:

```sh
npm install @tokenami/css@next
```

### Usage

Import and use the utility directly:

```tsx
import { css } from '@tokenami/css';

const button = css(
  { '---padding': 4 },
  {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
  { responsive: true }
);

function Button({ size, style, ...props }) {
  return <button {...props} style={button({ size }, style)} />;
}
```

The first parameter passed to the `css` utility represents your base styles, the second is for optional variants, and the third enables responsive variants.

Responsive variants allow you to prefix the variant name with a responsive key from your configuration. For example, the following button will apply the large `size` variant at the medium breakpoint:

```tsx
function Button() {
  return <button style={button({ medium_size: 'large' })} />;
}
```

Adding `responsive: true` will generate the atomic CSS for the responsive variants regardless of whether they're used so this is purposefully opt-in to allow greater control.

### Overrides

The function returned by the `css` utility accepts your chosen variants as the first parameter, and then any number of overrides as additional parameters. Overrides can be applied conditionally and last override wins.

```tsx
function Button({ size, style, ...props }) {
  const disabled = props.disabled && { '--opacity': 0.5 };
  return <button {...props} style={button({ size }, disabled, style)} />;
}
```

Overrides can also be used for compounding variants:

```tsx
function Button({ variant = 'primary', outline = true, style, ...props }) {
  const isPrimary = variant === 'primary';
  const primaryOutlined = isPrimary && outline && { '--background-color': 'transparent' };
  return <button {...props} style={button({ size, outline }, primaryOutlined, style)} />;
}
```

## Advanced

### Selectors

Tokenami provides some [common default selectors](https://github.com/tokenami/tokenami/blob/main/packages/config/stubs/config.default.ts#L26) for you but you can define your own custom selectors in the `selectors` object of your config.

Use the ampersand (`&`) to specify where the current element's selector should be injected:

```ts
const { createConfig, defaultConfig } = require('@tokenami/dev');

module.exports = createConfig({
  // ...
  selectors: {
    ...defaultConfig.selectors,
    'parent-hover': '.parent:hover > &',
  },
});
```

Use by following the [Tokenami property spec](#user-content-styling):

```tsx
<div className="parent">
  <img src="..." alt="" />
  <button style={{ '--parent-hover_font-weight': 'bold' }} />
</div>
```

### Aliases

You can define aliases for Tokenami properties in your config. Aliases allow you to create shorthand names for properties or other aliases. The array should be in longhand to shorthand order.

For instance, the `p` alias below is defined as a shorthand for `px`, `pl`, and `pr` aliases. Since `px` is shorthand for `pr` and `pl` it must come after them in the array.

```ts
module.exports = createConfig({
  // ...
  aliases: {
    p: ['pt', 'pr', 'pb', 'pl', 'px', 'py', 'padding'],
    px: ['pl', 'pr', 'padding-left', 'padding-right'],
    py: ['pt', 'pb', 'padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
  },
});
```

When using custom aliases, it's recommended to use the CSS utility to ensure that `--p` correctly overrides the properties declared in its array when passed as an override. There are some extra steps to ensure the utility is aware of your aliases.

#### Configure utility

Create a file in your project to configure the utility. You can name this file however you like, e.g. `css.ts`:

```ts
// css.ts
import { createCss } from '@tokenami/css';
import config from '~/.tokenami/tokenami.config';

const css = createCss(config);

export { css };
```

Now you can use the utility from the file you created instead and it will handle aliases correctly.

```tsx
import { css } from './css';
```

### Mapping properties to theme

Tokenami provides sensible defaults to map properties to theme keys. For instance, `--border-color` accepts tokens from your `color` object in theme, `--padding` allows multiples of your grid, and `--height` accepts tokens from a `size` key or multiples of your grid.

You can customise [the default configuration](https://github.com/tokenami/tokenami/blob/main/packages/config/stubs/config.default.ts#L85) by overriding the `properties` object in your configuration:

```ts
const { createConfig, defaultConfig } = require('@tokenami/dev');

module.exports = createConfig({
  theme: {
    container: {
      half: '50%',
    },
    pet: {
      cat: '"🐱"',
      dog: '"🐶"',
    },
  },
  properties: {
    ...defaultConfig.properties,
    width: ['grid', 'container'],
    height: ['grid', 'container'],
    content: ['pet'],
  },
});
```

Use by following the [Tokenami property and token specs](#user-content-styling):

```tsx
<div
  style={{
    '--width': 75 /*  300px with a 4px grid */,
    '--height': 'var(--container-half)',
    '--after_content': 'var(--pet-cat)',
  }}
/>
```

### Browserslist

Tokenami only supports [browserslist](https://browsersl.ist/) in your `package.json`. You can use it to add autoprefixing to your CSS properties in the generated CSS file. However, it currently doesn't support vendor-prefixed **values**, which is being tracked in [this issue](https://github.com/tokenami/tokenami/issues/103).

## Support

Before raising a bug, please double-check that it isn't [already in my todo list](https://github.com/tokenami/tokenami/issues). Some common pitfalls are listed below.

If you need additional support or encounter any issues, please don't hesitate to join the [Tokenami discord server](https://discord.gg/CAU4HNR4XK).

### Unable to authenticate with GitHub registry

If you did not set up an [SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) for working with git locally, you may come across this issue. You can set one up or run the following command using the Personal Access Token from earlier as your password:

```
npm login --scope=@tokenami --auth-type=legacy --registry=https://npm.pkg.github.com
```

### Intellisense not working for tokens

Tokenami creates a `tokenami.config.js` file by default. If you do not get the correct types/intellisense for your project after [configuring the TypeScript plugin](#user-content-configure-typescript), you might have `moduleResolution: "Bundler"` in your tsconfig. Rename your config to `tokenami.config.ts` and update imports in `tokenami.d.ts` if you hit this issue.

## Credits

A big thanks to:

- [Tailwind CSS](https://tailwindcss.com/) for inspiring most of the features in Tokenami
- [Stitches](https://stitches.dev/) for variants and responsive variants inspiration
- [CSS Hooks](https://css-hooks.com/) for custom selectors inspiration

Please do take the time to check these libraries out if you feel Tokenami isn't quite right for you.
