![image](https://github.com/user-attachments/assets/73712e13-2af9-46c4-a3df-48590cbb4c8a)

<div align="center">
  <h3>CSS-in-JS Reinvented for Scalable, Typesafe Design Systems</h3>
  <p>
    A modern approach to <a href="https://css-tricks.com/just-in-time-css/">just-in-time</a> atomic CSS using CSS variables—<strong>no bundler required</strong>.
  </p>

  <img src="https://github.com/tokenami/tokenami/assets/175330/8cdfcdf8-05da-4096-8e0b-5645e1b329e5" alt="React support" width="40" />
  <img src="https://github.com/tokenami/tokenami/assets/175330/141f3cda-905c-4789-be1e-15bbe6f7f77e" alt="Vue support" width="40" />
  <img src="https://github.com/tokenami/tokenami/assets/175330/0669ee2e-d02e-4c6e-b75b-8760e9b4cfb4" alt="SolidJS support" width="40" />
</div>

> [!Warning]
> This is a pre-alpha version of tokenami so there will be bugs, breaking changes, and missing features. Please check the [existing issues](https://github.com/tokenami/tokenami/issues) for planned features/known bugs before creating new ones.

## Demo

If you prefer to get stuck straight in, give the [vite starter](https://github.com/tokenami/tokenami-vite) a try and remember to choose the workspace version of TypeScript.

## Contents

- [Why another CSS library?](#user-content-why-another-css-library)
- [Getting started](#user-content-getting-started)
  - [Installation](#user-content-installation)
  - [Configure TypeScript](#user-content-configure-typescript)
  - [Start CLI watch script](#user-content-start-the-cli-watch-script)
  - [Use Tokenami](#user-content-use-tokenami)
- [Core concepts](#user-content-core-concepts)
  - [Theming](#user-content-theming)
  - [Styling](#user-content-styling)
  - [Responsive styles](#user-content-responsive-styles)
  - [Global styles](#user-content-global-styles)
  - [Animation](#user-content-animation)
- [CSS utility](#user-content-css-utility)
  - [Usage](#user-content-usage)
  - [Overrides](#user-content-overrides)
- [CSS compose](#user-content-css-compose)
  - [Variants](#user-variants)
  - [Responsive variants](#user-responsive-variants)
- [TypeScript](#user-content-typescript)
  - [Variants](#user-content-variants-1)
  - [TokenamiStyle](#user-content-tokenami-style)
  - [Continuous Integration](#user-content-continuous-integration)
- [Design systems](#user-content-design-systems)
  - [Official design system](#user-content-official-design-system)
- [Advanced](#user-content-advanced)
  - [Selectors](#user-content-selectors)
  - [Aliases](#user-content-aliases)
  - [Map properties to theme](#user-content-map-properties-to-theme)
  - [Map custom properties to theme](#user-content-map-custom-properties-to-theme)
  - [Browserslist](#user-content-browserslist)
- [Support](#user-content-support)
  - [Why the double-dash prefix?](#user-content-why-the-double-dash-prefix)
  - [VSCode intellisense configuration](#user-content-vscode-intellisense-configuration)
  - [Supported frameworks](#user-content-supported-frameworks)
  - [Supported browsers](#user-content-supported-browsers)
  - [HMR not working as expected in Remix](#user-content-hmr-not-working-as-expected-in-remix)
- [Contributors](#user-contributors)
- [Credits](#user-content-credits)

## Why another CSS library?

CSS-in-JS solutions that rely on style injection [were no longer recommended by the React team](https://github.com/reactwg/react-18/discussions/110), and instead they suggested:

> Our preferred solution is to use [`<link rel="stylesheet">`](https://github.com/reactwg/react-18/discussions/108) for statically extracted styles and plain inline styles for dynamic values. E.g. `<div style={{...}}>`

In other words—_write CSS like we used to_. But what about the benefits that CSS-in-JS gave us?

There are CSS-in-JS solutions that extract static rules from your template files into external `.css` files, however, these approaches often require [bundler integration](https://vanilla-extract.style/documentation/integrations/next/) and come with [build-time limitations](https://panda-css.com/docs/guides/dynamic-styling).

The learning curve can be intimidating but developers invest regardless so they can have type errors and intellisense for their design system tokens as well as style deduping, critical path CSS, scoping, and composition.

<details>
<summary>Read more</summary>
<br/>

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
- A tiny `css` utility with variants, and responsive variants support
- Seamless composition across component boundaries using the `css` utility
- Runtime style support e.g. `style={css({ '--color': props.color })}`
- Aliasable properties e.g. `style={css({ '--p': 4 })}` for padding
- Custom selector support enabling descendant selectors
- Improved debugging experience in dev tools (coming soon)
- Statically generated styles
- No bundler integration
</details>

## Getting started

Tokenami offers a CLI tool for generating static styles, a [~2kb](https://bundlephobia.com/package/@tokenami/css) CSS utility for authoring your styles, and a TypeScript plugin to enhance the developer experience.

### Installation

Install using your package manager of choice. For example:

```sh
npm install -D @tokenami/dev && npm install @tokenami/css
```

And then initialise your tokenami project:

```sh
npx tokenami init
```

### Configure TypeScript

Add Tokenami to `include` and `plugins` in your `tsconfig.json` or `jsconfig.json`.

```json
{
  "include": [".tokenami/tokenami.env.d.ts", "src"],
  "compilerOptions": {
    "plugins": [{ "name": "@tokenami/dev" }]
  }
}
```

Ensure your editor is configured to use the project's TypeScript version. Instructions can be found in your editor's documentation, such as [VSCode's guide](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). VSCode users should also [enable `editor.quickSuggestions` for strings](#user-content-vscode-intellisense-configuration).

### Start the CLI watch script

Run the CLI tool to scan your template files for tokenami properties and build your CSS. This would usually exist as a script in your `package.json`.

```sh
npx tokenami --output ./public/styles.css --watch
```

Make sure to adjust the output path to your desired location for styles. It will use `./public/tokenami.css` by default if omitted.

### Use Tokenami

Reference your output CSS file in the `<head>` of your document, and start styling inline with Tokenami properties:

```tsx
import { css } from '@tokenami/css';

function Page() {
  return <h1 style={css({ '--margin-top': 0, '--margin-bottom': 5 })}>Hello, World!</h1>;
}
```

## Core concepts

### Theming

Tokenami relies on your theme to provide design system constraints. There isn't a predefined theme so you must add your own to the `.tokenami/tokenami.config`.

> [!Note]
> If you'd prefer to use a pre-built theme, you can use the [offical design system](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) and [skip this section](#user-content-styling).

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

#### Multiple themes

Use the `modes` key to define multiple themes if desired.

You can choose any names for your modes. Tokens that are shared across themes should be placed alongisde your modes in the `root` object:

```ts
module.exports = createConfig({
  theme: {
    modes: {
      light: {
        color: {
          primary: '#f1f5f9',
          secondary: '#334155',
        },
      },
      dark: {
        color: {
          primary: '#0ea5e9',
          secondary: '#f1f5f9',
        },
      },
    },
    root: {
      radii: {
        rounded: '10px',
        circle: '9999px',
        none: 'none',
      },
    },
  },
});
```

By default this will apply the CSS variables to `.theme-${mode}` classes. Add the classes to an element on your page to apply the relevant theme.

#### Custom theme selector

To customise the theme selector, update the `themeSelector` config.

```ts
module.exports = createConfig({
  themeSelector: (mode) => (mode === 'root' ? ':root' : `.theme-${mode}`),
});
```

### Styling

With your theme set up, there are only a few rules to remember:

1. A Tokenami **property** is any CSS property prefixed with double dash, e.g. `--font-size` ([why?](#user-content-why-the-double-dash-prefix)). Use `---` (triple dash) to add custom CSS variables to an element.
1. A Tokenami **token** is any theme key followed by a value identifier, and separated by an underscore. For example, a `color` object in theme with a `red-100` entry maps to `var(--color_red-100)`.
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

#### Arbitrary selectors

Use arbitrary selectors to prototype quickly:

```tsx
<div
  style={css({
    '--{&:hover}_color': 'var(--color_primary)',
    '--{&:has(:focus)}_border-color': 'var(--color_highlight)',
    '--{&[data-state=open]}_border-color': 'var(--color_primary)',
    '--{&_p}_color': 'var(--color_primary)',
  })}
/>
```

They can be used to style the **current element, and its descendants** only.

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
<div style={css({ '--medium_padding': 4 })} />
```

Responsive rules can also be combined with [selectors](#user-content-selectors):

```tsx
<div style={css({ '--medium_hover_padding': 4 })} />
```

For documentation on responsive variants, refer to the [CSS compose](#user-content-css-compose) section.

### Global styles

Tokenami supports global styles in your `tokenami.config`. It can be useful for including them as part of a design system.

```ts
module.exports = createConfig({
  // ...
  globalStyles: {
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    body: {
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.5,
      margin: 0,
      padding: 0,
    },
  },
});
```

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
<div style={css({ '--animation': 'var(--anim_wiggle)' })} />
```

## CSS utility

Tokenami provides a CSS utility to author your styles and correctly merge them across component boundaries.

### Usage

The `css` utility accepts your base styles as the first parameter, and then any number of overrides as additional parameters.

```tsx
function Button({ size, style, ...props }) {
  return <button {...props} style={css({ '--padding': 4 }, props.style)} />;
}
```

In the above example we're passing `props.style` as an override to ensure composed styles will merge correctly across component boundaries.

### Overrides

Overrides can be applied conditionally and last override wins. They are applied as additional parameters to the `css` utility.

```tsx
function Button({ style, ...props }) {
  const disabled = props.disabled && { '--opacity': 0.5 };
  return <button {...props} style={css({ '--p': 4 }, disabled, style)} />;
}
```

## CSS compose

Use the `css.compose` API to author variants.

### Variants

```tsx
const button = css.compose({
  '--padding': 4,

  variants: {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
});

function Button({ size, style, ...props }) {
  return <button {...props} style={button({ size }, style)} />;
}
```

The function returned by `css.compose` accepts your chosen variants as the first parameter, and then any number of overrides as additional parameters.

### Responsive variants

Responsive variants allow you to prefix the variant name with a responsive key from your configuration. For example, the following button will apply the large `size` variant at the medium breakpoint:

```tsx
function Button() {
  return <button style={button({ medium_size: 'large' })} />;
}
```

To enable it, rename the `variants` property to `responsiveVariants`. This will generate the atomic CSS for the responsive variants regardless of whether they're used, so it is purposefully opt-in to allow greater control.

```diff
const button = css.compose({
  '--padding': 4,

-  variants: {
+  responsiveVariants: {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
});
```

## TypeScript

### Variants

Use the `Variants` type to extend your component prop types:

```tsx
import { type Variants } from '@tokenami/css';

type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends ButtonElementProps, Variants<typeof button> {}
```

### TokenamiStyle

The `TokenamiStyle` type allows you to extend the `style` prop of your component with Tokenami-specific properties.

```tsx
import { type TokenamiStyle, css } from '@tokenami/css';

interface ButtonProps extends TokenamiStyle<React.ComponentProps<'button'>> {}

function Button(props: ButtonProps) {
  return <button {...props} style={css({}, props.style)} />;
}
```

You can then use the component as usual, overriding styles as needed. Since the component is already typed and integrates the `css` utility internally, you no longer need to use the utility to apply styles:

```tsx
<Button style={{ '--padding': 4 }} />
```

### Continuous Integration

To improve performance during development, Tokenami widens its types and uses the TypeScript plugin for completions. Using `tsc` in the command line defaults to these widened types so it will not highlight errors for your properties or tokens. To get accurate types for CI, do the following:

- Create a file named `tsconfig.ci.json` or `jsconfig.ci.json`. It should extend your original config and include the CI-specific Tokenami types

  ```json
  {
    "extends": "./tsconfig.json",
    "include": [".tokenami/tokenami.env.ci.d.ts", "src"]
  }
  ```

- Use `tsc` with your new configuration

  ```sh
  tsc --noEmit --project tsconfig.ci.json
  ```

## Design systems

Integrating a design system built with Tokenami is straightforward. Include its `tokenami.config.js` file and corresponding stylesheet (where applicable) in your project:

```tsx
import designSystemConfig from '@acme/design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: ['./app/**/*.{ts,tsx}', 'node_modules/@acme/design-system/tokenami.css'],
});
```

Tokenami will automatically generate styles and merge them correctly across component boundaries.

**Note**: It is only necessary to include the design system stylesheet if the design system provides components that you'd like to use in your project.

### Official design system

Tokenami has an [official design system package](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) you can use as a starting point for your project.

It features:

- Global reset based on [Preflight from Tailwind](https://github.com/tailwindlabs/tailwindcss/blob/next/packages/tailwindcss/preflight.css)
- [Radix UI colours](https://www.radix-ui.com/colors) enabling dark mode by default
- [Fluid spacing and font sizes](https://utopia.fyi/) for responsive design
- Right-to-left support out of the box (`padding-left` becomes `padding-inline-start` etc.)
- Custom aliases for common properties, such as `--p` for `padding` and `--px` for `padding-left` and `padding-right`

Follow the package docs to [get started](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md).

## Advanced

### Selectors

Tokenami provides some [common default selectors](https://github.com/tokenami/tokenami/blob/main/packages/dev/stubs/tokenami.config.ts#L27) in your project for you, but you can define your own or override the defaults.

Use the ampersand (`&`) to specify where the current element's selector should be injected:

```ts
const { createConfig } = require('@tokenami/css');

module.exports = createConfig({
  // ...
  selectors: {
    //...
    'parent-hover': '.parent:hover > &',
  },
});
```

Use by following the [property spec](#user-content-styling):

```tsx
<div className="parent">
  <img src="..." alt="" />
  <button style={css({ '--parent-hover_font-weight': 'bold' })} />
</div>
```

Selectors can also be combined with [responsive rules](#user-content-responsive-styles):

```tsx
<button style={css({ '--medium_parent-hover_font-weight': 'bold' })} />
```

#### Nested selectors

Use an array value for custom selectors to generate nested rules:

```tsx
module.exports = createConfig({
  // ...
  selectors: {
    // ...
    hover: ['@media (hover: hover) and (pointer: fine)', '&:hover'],
  },
});
```

This example will apply hover styles for users with a precise pointing device, such as a mouse, when `--hover_{property}` is used.

### Aliases

Aliases allow you to create shorthand names for properties. When using custom aliases, the `css` utility must be configured to ensure aliased properties are merged correctly across component boundaries.

#### Configure utility

Create a file in your project to configure the utility. You can name this file however you like, e.g. `css.ts`:

```ts
// css.ts
import { createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config';

export const css = createCss(config);
```

Use the `css` utility exported from the file you created and it will handle aliases correctly.

#### Create aliases

The configuration expects the name of your new alias followed by an array of properties it maps to.

```ts
module.exports = createConfig({
  // ...
  aliases: {
    p: ['padding'],
    px: ['padding-left', 'padding-right'],
    py: ['padding-top', 'padding-bottom'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],
    size: ['width', 'height'],
  },
});
```

With the above config, `px` is shorthand for `padding-left` and `padding-right`. This allows the `css` utility to apply padding on the left and right when `--px` is used.

### Map properties to theme

Tokenami provides sensible defaults to restrict which values can be passed to properties based on your theme. For instance, `--border-color` will only accept tokens from your `color` object in theme, `--padding` allows multiples of your grid, and `--height` expects tokens from a `size` key or multiples of your grid.

You can customise [the default configuration](https://github.com/tokenami/tokenami/blob/main/packages/dev/stubs/tokenami.config.ts#L42) generated in your project by updating the `properties` object:

```ts
const { createConfig } = require('@tokenami/css');

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
    // ...
    width: ['grid', 'container'],
    height: ['grid', 'container'],
    content: ['pet'],
  },
});
```

With this configuration, passing `var(--container_half)` to a `content` property would error because `container` does not exist in its property config, but `var(--pet_dog)` would be allowed:

```tsx
<div
  style={css({
    '--width': 75 /*  300px with a 4px grid */,
    '--height': 'var(--container_half)',
    '--after_content': 'var(--pet_cat)',
  })}
/>
```

### Map custom properties to theme

Tokenami allows custom properties in the `properties` config. This helps to create a configurable design system. For example, you can create `--gradient-from` and `--gradient-to` properties that accept color tokens to make reusable gradients:

```tsx
module.exports = createConfig({
  // ...
  properties: {
    // ...
    'gradient-from': ['color'],
    'gradient-to': ['color'],
  },
});
```

And use the properties in your theme:

```tsx
module.exports = createConfig({
  theme: {
    color: {
      primary: '#f1f5f9',
      secondary: '#334155',
    },
    surface: {
      'radial-gradient':
        'radial-gradient(circle at top, var(--gradient-from), var(--gradient-to) 80%)',
    },
  },
  // ...
});
```

Now you can set different gradient stops when applying the gradient, and intellisense will suggest colours from your theme.

```tsx
<div
  style={css({
    '--gradient-from': 'var(--color_primary)',
    '--gradient-to': 'var(--color_secondary)',
    '--background': 'var(--surface_radial-gradient)',
  })}
/>
```

### Browserslist

You can use [browserslist](https://browsersl.ist/) to add autoprefixing to your CSS properties in the generated CSS file. However, Tokenami currently doesn't support vendor-prefixed **values**, which is being tracked in [this issue](https://github.com/tokenami/tokenami/issues/103).

> [!Note]
> Tokenami does not support browsers below the listed [supported browser versions](#user-content-supported-browsers).

## Support

Before raising a bug, please double-check that it isn't [already in my todo list](https://github.com/tokenami/tokenami/issues). Some common pitfalls are listed below. If you need additional support or encounter any issues, please don't hesitate to join the [Tokenami discord server](https://discord.gg/CAU4HNR4XK).

### Why the double-dash prefix?

To minimise runtime style calculations, Tokenami directly applies your styles to the `style` attribute. Since the `style` attribute doesn't support media queries or pseudo-selectors, Tokenami uses CSS variables to enable them, and simplifies the learning curve by making all properties CSS variables.

> [!Note]
> Don't worry about the extra characters! Simply type `bord` (without quotes), and Tokenami's Intellisense will automatically complete it for you, including hyphens and quotes.

Additionaly, CSS properties applied to the `style` attribute have highest specificity making them hard to override. By using CSS variables instead, you can easily override Tokeanami's styles by adding a stylesheet after Tokenami's to your document.

### VSCode intellisense configuration

By default, VSCode will not trigger intellisense for strings which can hinder the developer experience if you've chosen an incomplete suggestion from the suggestion list. To fix this, add the following to your `.vscode/settings.json`:

```json
"editor.quickSuggestions": {
  "strings": true
}
```

| BEFORE                                                                                                               | AFTER                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ![CleanShot 2024-09-08 at 14 10 10](https://github.com/user-attachments/assets/9b99edb4-dec0-402e-99c9-671525332ccf) | ![CleanShot 2024-09-08 at 14 09 43](https://github.com/user-attachments/assets/ad2ed719-c2ca-4929-902d-5fdf5142468b) |

### Supported frameworks

Tokenami is in early stages of development and currently only supports applications built using React (NextJS, Remix, etc.), Vue, or SolidJS.

### Supported browsers

Tokenami relies on [cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers) so only supports [browsers with `@layer` support](https://caniuse.com/?search=%40layer).

| <img src="https://github.com/tokenami/tokenami/assets/175330/8588dacd-a77f-44ee-9111-cea6601ebc35" alt="Edge" width="24px" height="24px" /><br/>Edge | <img src="https://github.com/tokenami/tokenami/assets/175330/b2b38574-5290-44ba-bb28-87e139f8efb8" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://github.com/tokenami/tokenami/assets/175330/ae970301-390d-426e-9ea7-974267917df6" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="Safari" width="24px" height="24px" /><br/>Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="iOS Safari" width="24px" height="24px" /><br/>iOS Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/e9eaad5e-ef39-4423-ad4b-2e61c0bcc873" alt="Opera" width="24px" height="24px" /><br/>Opera |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 99+                                                                                                                                                  | 97+                                                                                                                                                        | 99+                                                                                                                                                      | 15.4+                                                                                                                                                    | 15.4+                                                                                                                                                            | 86+                                                                                                                                                    |

## Contributors

- Paweł Błaszczyk ([@pawelblaszczyk\_](https://twitter.com/pawelblaszczyk_))

## Credits

A big thanks to:

- [Tailwind CSS](https://tailwindcss.com/) for inspiring most of the features in Tokenami
- [Stitches](https://stitches.dev/) for variants and responsive variants inspiration
- [CSS Hooks](https://css-hooks.com/) for custom selectors inspiration
- [Lightning CSS](https://lightningcss.dev/) for generating the Tokenami stylesheet

Please do take the time to check these projects out if you feel Tokenami isn't quite right for you.
