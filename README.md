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

In other words—_write CSS like we used to_. But what about the benefits that CSS-in-JS gave us?

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
  - [TypeScript](#user-content-typescript)
- [Advanced](#user-content-advanced)
  - [Selectors](#user-content-selectors)
  - [Aliases](#user-content-aliases)
  - [Mapping properties to theme](#user-content-mapping-properties-to-theme)
  - [Browserslist](#user-content-browserslist)
- [Support](#user-content-support)
  - [Unable to install packages from GitHub registry](#user-content-unable-to-install-packages-from-github-registry)
  - [HMR not working as expected in Remix](#user-content-hmr-not-working-as-expected-in-remix)
  - [Efficiency of Tokenami's attribute substring selectors](#user-content-efficiency-of-tokenamis-attribute-substring-selectors)
- [Credits](#user-content-credits)

## Getting started

The set up is a little complex during pre-alpha. This [will be simplified](https://github.com/tokenami/tokenami/issues/82) before version one.

### Prerequisite

The packages exist on the GitHub registry for now. To access them, add the following to an `.npmrc` file in your project root:

```
//npm.pkg.github.com/:_authToken=${TOKENAMI_TOKEN}
@tokenami:registry=https://npm.pkg.github.com
```

Create a GitHub [Personal Access Token (classic)](https://github.com/settings/tokens/new) with `read:packages` rights and replace the `TOKENAMI_TOKEN`, or store it in an `.env` file.

### Installation

Install and initialise using your package manager of choice. For example:

```sh
npm install @tokenami/dev @tokenami/ts-plugin -D
npx tokenami init
```

### Configure TypeScript

Add Tokenami to `include` and `plugins` in your `tsconfig.json` or `jsconfig.json`.

```json
{
  "include": [".tokenami/tokenami.d.ts", "**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "plugins": [{ "name": "@tokenami/ts-plugin" }]
  }
}
```

Make sure your editor is configured to use the project's version of TypeScript. You can find instructions for various editors in their documentation, such as for VSCode [here](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript).

### Start the CLI watch script

```sh
npx tokenami --output ./public/styles.css --watch
```

Make sure to adjust the output path to your desired location for styles. It will use `./public/tokenami.css` by default if omitted.

### Use Tokenami

Reference your output CSS file in the `<head>` of your document and start styling inline with Tokenami properties:

```tsx
<h1 style={{ '--margin-top': 0, '--margin-bottom': 5 }}>Hello, World!</h1>
```

## Core concepts

### Theming

Tokenami relies on your theme to provide design system constraints. Since there's no predefined theme, you need to add your own to the `.tokenami/tokenami.config`. For example:

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
1. A Tokenami **token** is any theme key followed by a value identifier, separated by an underscore. For example, a `color` object in theme with a `red-100` entry maps to `var(--color_red-100)`.
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

You can avoid TypeScript errors for one-off inline values by using a triple dash fallback. For instance, `--padding: var(---, 20px)` prevents errors and sets padding to `20px`.

Tokenami intentionally adds friction to the developer experience here. This is to encourage sticking to your theme guidelines and to help you quickly spot values in your code that don't.

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

Use by following the [property spec](#user-content-styling):

```tsx
<div style={{ '--medium_padding': 4 }} />
```

Responsive rules can also be combined with [selectors](#user-content-selectors):

```tsx
<div style={{ '--medium_hover_padding': 4 }} />
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

Use by following the [token spec](#user-content-styling):

```tsx
<div style={{ '--animation': 'var(--anim_wiggle)' }} />
```

## CSS utility

Tokenami provides a CSS utility to abstract styles from your views and correctly merge styles across component boundaries. It also provides a variants API.

### Installation

Install using your package manager of choice. For example:

```sh
npm install @tokenami/css
```

### Usage

Import and use the utility directly:

```tsx
import { css } from '@tokenami/css';

function Button({ size, style, ...props }) {
  return <button {...props} style={button({ size }, style)} />;
}

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
function Button(props) {
  const { size, style, ...buttonProps } = props;
  const disabled = props.disabled && { '--opacity': 0.5 };
  return <button {...buttonProps} style={button({ size }, disabled, style)} />;
}
```

Overrides can also be used for compounding variants:

```tsx
function Button(props) {
  const { variant = 'primary', outline = true, style, ...buttonProps } = props;
  const isPrimary = variant === 'primary';
  const primaryOutlined = isPrimary && outline && { '--background-color': 'transparent' };

  return <button {...buttonProps} style={button({ size, outline }, primaryOutlined, style)} />;
}
```

### TypeScript

Use the `Variants` type to extend your component prop types:

```tsx
import { type Variants, css } from '@tokenami/css';

type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends ButtonElementProps, Variants<typeof button> {}

function Button(props: ButtonProps) {
  const { size = 'small', style, ...buttonProps } = props;
  return <button {...buttonProps} style={button({ size }, style)} />;
}

const button = css(
  { '---padding': 4 },
  {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  }
);
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

Use by following the [property spec](#user-content-styling):

```tsx
<div className="parent">
  <img src="..." alt="" />
  <button style={{ '--parent-hover_font-weight': 'bold' }} />
</div>
```

Selectors can also be combined with [responsive rules](#user-content-responsive-styles):

```tsx
<button style={{ '--medium_parent-hover_font-weight': 'bold' }} />
```

#### Nested selectors

Use an array value for custom selectors to generate nested rules:

```tsx
module.exports = createConfig({
  // ...
  selectors: {
    ...defaultConfig.selectors,
    hover: ['@media (hover: hover) and (pointer: fine)', '&:hover'],
  },
});
```

This example will apply hover styles for users with a precise pointing device, such as a mouse, when `--hover_{property}` is used.

### Aliases

Aliases allow you to create shorthand names for properties or other aliases. When using custom aliases, the `css` utility is recommended. It ensures properties are merged correctly across component boundaries.

#### Configure utility

In your `.tokenami/tokenami.config` file, change the `@tokenami/dev` import to `@tokenami/css`:

```diff
- const { createConfig } = require('@tokenami/dev');
+ const { createConfig } = require('@tokenami/css');
```

That's it 🎉. We can now create some aliases.

#### Create aliases

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

The configuration expects the name of your new alias followed by an array of properties or aliases that it should replace when passed as an override to the `css` utility.

For instance, in the example above `p` is shorthand for `pt`, `pr`, `pb`, `pl`, `px`, `py`, and `padding`. This allows the `css` utility to remove those properties when `--p` is passed as an override:

```tsx
const button = css({ '--pr': 4 });

function Button(props) {
  return <button style={button(null, props.style)} />;
}

function App() {
  return <Button style={{ '--p': 10 }} />;
}
```

In this example `Button` will have `10` padding on all sides because we configured `--p` to take precendence over `--pr` when passed as an override. Without this config, the button would have `4` padding on the right because longhand properties have higher specificity in the atomic stylesheet.

### Mapping properties to theme

Tokenami provides sensible defaults to restrict which values can be passed to properties based on your theme. For instance, `--border-color` will only accept tokens from your `color` object in theme, `--padding` allows multiples of your grid, and `--height` expects tokens from a `size` key or multiples of your grid.

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

With this configuration, using `'--content': 'var(--container_half)'` would error because `container` does not exist in the property config for `content`, but `'--content': 'var(--pet_dog)'` would be allowed:

```tsx
<div
  style={{
    '--width': 75 /*  300px with a 4px grid */,
    '--height': 'var(--container_half)',
    '--after_content': 'var(--pet_cat)',
  }}
/>
```

### Browserslist

Tokenami only supports [browserslist](https://browsersl.ist/) in your `package.json`. You can use it to add autoprefixing to your CSS properties in the generated CSS file. However, it currently doesn't support vendor-prefixed **values**, which is being tracked in [this issue](https://github.com/tokenami/tokenami/issues/103).

## Support

Before raising a bug, please double-check that it isn't [already in my todo list](https://github.com/tokenami/tokenami/issues). Some common pitfalls are listed below. If you need additional support or encounter any issues, please don't hesitate to join the [Tokenami discord server](https://discord.gg/CAU4HNR4XK).

### Unable to install packages from GitHub registry

If you are having trouble installing packages, remove `/:_authToken=$TOKENAMI_TOKEN` from `.npmrc` and run the following command:

```
npm login --scope=@tokenami --auth-type=legacy --registry=https://npm.pkg.github.com
```

The Personal Access Token you created earlier should be your password.

### HMR not working as expected in Remix

Update `remix.config.js` to include your stylesheet in [`watchPaths`](https://remix.run/docs/en/main/file-conventions/remix-config#watchpaths). Then, import your stylesheet and add it to your `links` export:

```tsx
import styles from '~/../public/tokenami.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];
```

### Efficiency of Tokenami's attribute substring selectors

Attribute substring selectors are known for being less efficient than other simpler selectors, however, they are unlikely to significantly impact performance in most cases. Despite being relatively less efficient, modern browsers handle these selectors well enough that the performance impact would be minimal for typical applications.

Comparatively, historical CSS-in-JS solutions involved style injection, which significantly hindered performance. In this context, attribute substring selectors will offer a considerable improvement.

## Credits

A big thanks to:

- [Tailwind CSS](https://tailwindcss.com/) for inspiring most of the features in Tokenami
- [Stitches](https://stitches.dev/) for variants and responsive variants inspiration
- [CSS Hooks](https://css-hooks.com/) for custom selectors inspiration

Please do take the time to check these libraries out if you feel Tokenami isn't quite right for you.
