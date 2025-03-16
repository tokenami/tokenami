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
> Tokenami is still in early development. You might find bugs or missing features. Before reporting issues, please check our [existing issues](https://github.com/tokenami/tokenami/issues) first.

## Contents

- [Why Tokenami?](#user-content-why-tokenami)
- [Quick start](#user-content-quick-start)
  - [Installation](#user-content-installation)
  - [Basic setup](#user-content-basic-setup)
- [Core concepts](#user-content-core-concepts)
  - [Theming](#user-content-theming)
  - [Grid values](#user-content-grid-values)
  - [Arbitrary selectors](#user-content-arbitrary-selectors)
  - [Arbitrary values](#user-content-arbitrary-values)
- [Styling](#user-content-styling)
  - [CSS utility](#user-content-css-utility)
  - [CSS compose](#user-content-css-compose)
    - [Variants](#user-content-variants)
    - [Responsive variants](#user-content-responsive-variants)
    - [Extending styles](#user-content-extending-styles)
- [Design systems](#user-content-design-systems)
  - [Using the official system](#user-content-using-the-official-system)
  - [Building your own system](#user-content-building-your-own-system)
  - [Global styles](#user-content-global-styles)
  - [Breakpoints](#user-content-breakpoints)
  - [Animation](#user-content-animation)
- [Advanced usage](#user-content-advanced-usage)
  - [Custom selectors](#user-content-custom-selectors)
  - [Property aliases](#user-content-property-aliases)
  - [Theming properties](#user-content-theming-properties)
  - [Custom properties](#user-content-custom-properties)
- [TypeScript integration](#user-content-typescript-integration)
  - [Utility types](#user-content-utility-types)
  - [CI setup](#user-content-ci-setup)
- [Troubleshooting](#user-content-troubleshooting)
  - [Why the double-dash prefix?](#user-content-why-the-double-dash-prefix)
  - [VSCode setup](#user-content-vscode-setup)
  - [Framework support](#user-content-framework-support)
  - [Browser support](#user-content-browser-support)
  - [Browserslist](#user-content-browserslist)
- [Community](#user-content-community)
  - [Contributing](#user-content-contributing)
  - [Contributors](#user-content-contributors)
  - [Credits](#user-content-credits)

## Why Tokenami?

The React team [no longer recommends](https://github.com/reactwg/react-18/discussions/110) CSS-in-JS solutions that inject styles. Instead, they suggest:

> [...] use [`<link rel="stylesheet">`](https://github.com/reactwg/react-18/discussions/108) for static styles and plain inline styles for dynamic values. E.g. `<div style={{...}}>`

In other words—write CSS like we used to. But what about the benefits CSS-in-JS gave us? Some CSS-in-JS tools extract static styles into `.css` files, but they often need [bundler setup](https://vanilla-extract.style/documentation/integrations/next/) and have [build-time limitations](https://panda-css.com/docs/guides/dynamic-styling).

<details>
<summary>Read more</summary>
<br/>

Developers use these tools despite the learning curve because they want:

- Type checking and suggestions for design system tokens
- Style deduplication
- Critical path CSS
- Style scoping
- Composition without specificity conflicts

Tailwind CSS adopts a different strategy:

- Atomic CSS so styles have a cap on how large they can grow
- Statically generated styles with a simple CLI script, no bundler integration needed
- Quick prototyping with inline styles
- Editor tools suggest classes from your theme

On the flip side:

- Removing values from your theme won't flag redundant references
- We must memorise Tailwind's custom class names which spawns things like the [Tailwind Cheatsheet](https://tailwindcomponents.com/cheatsheet/)
- Specificity issues when composing unless we use third-party packages like [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)
- Styling inline can be unpleasant to maintain, resulting in third-party packages like [cva](https://cva.style/docs)
- Classes must exist as [complete unbroken strings](https://tailwindcss.com/docs/content-configuration#dynamic-class-names)
- Debugging in dev tools is tricky because styles are spread across atomic classes

### Introducing Tokenami

Tokenami aims to improve some of these areas by using atomic CSS variables instead of atomic classes, and bringing all necessary tools under one roof. It features:

- Simple naming convention—convert any CSS property to a CSS variable (e.g. `padding` becomes `--padding`)
- Smaller stylesheet using atomic CSS variables (e.g. one `padding: var(--padding)` rule vs. many `.p-1`, `.p-2` classes)
- Config file for providing design system constraints
- Feature-rich intellisense when authoring styles
- Tiny `css` utility for variant support and composition without specificity conflicts
- Dynamic style support (e.g. `style={css({ '--color': props.color })}`)
- Aliasable properties (e.g. `style={css({ '--p': 4 })}` for padding)
- Custom selector support enabling descendant selectors
- Improved debugging experience in dev tools (coming soon)
- Static style generation
- No bundler integration needed
</details>

| Tokenami DX                                                                               | HTML output                                                                                |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ![Input](https://github.com/user-attachments/assets/2a675b7e-5415-4b8c-b801-6735a504bf47) | ![Output](https://github.com/user-attachments/assets/3537d155-22f5-4f98-afff-ee05b092972d) |

## Quick start

Jump right in with our [vite starter](https://github.com/tokenami/tokenami-vite), or configure your own project. Tokenami offers a CLI tool for generating static styles, a [~2.5kb](https://bundlephobia.com/package/@tokenami/css) CSS utility for authoring your styles, and a TypeScript plugin to enhance the developer experience.

### Installation

Install using your package manager of choice:

```sh
npm install -D tokenami && npm install @tokenami/css
```

Then initialise your project:

```sh
npx tokenami init
```

### Basic setup

#### 1. Add Tokenami to your TypeScript config (`tsconfig.json` or `jsconfig.json`):

```json
{
  "include": [".tokenami/tokenami.env.d.ts", "src"],
  "compilerOptions": {
    "plugins": [{ "name": "tokenami" }]
  }
}
```

#### 2. Run the CLI script to watch files and build your CSS:

```sh
npx tokenami --output ./public/styles.css --watch
```

You can change where the CSS file is generated by changing the `--output` flag. By default, it uses `./public/tokenami.css`.

#### 3. Reference the CSS file in the `<head>` of your document, and start styling with Tokenami properties:

```tsx
import { css } from '@tokenami/css';

function Page() {
  return <h1 style={css({ '--margin-top': 0, '--margin-bottom': 5 })}>Hello, World!</h1>;
}
```

> [!Note]
> Make sure your editor uses the workspace version of TypeScript. Check your editor's docs, like [VSCode's guide](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript). VSCode users should also [enable suggestions for strings](#user-content-vscode-setup).

## Core concepts

Tokenami is built around a few key ideas that make styling easy to remember and maintain:

- Turn any CSS property into a variable by adding `--` (e.g. `--padding`)
- Use `---` (triple dash) for custom CSS variables
- Add selectors with underscores (e.g. `--hover_padding`)
- Add breakpoints the same way (e.g. `--md_padding`)
- Combine selectors and breakpoints (e.g. `--md_hover_padding`)

### Theming

> [!Tip]
> Want to skip theme setup? Use our [official design system](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) which comes with dark mode, fluid typography, RTL support, and more. Jump to [using the official system](#user-content-using-the-official-system).

Tokenami relies on your theme to provide design system constraints. Create one in `.tokenami/tokenami.config`:

```ts
module.exports = createConfig({
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

Name your theme groups and tokens however you like. These names become part of your CSS variables.

#### Multiple themes

Use the `modes` key to define multiple themes. Choose any names for your modes. Tokens that are shared across themes should be placed in a `root` object:

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

This creates `.theme-light` and `.theme-dark` classes. Add them to your page to switch themes.

Customise the theme selector using the `themeSelector` config:

```ts
module.exports = createConfig({
  themeSelector: (mode) => (mode === 'root' ? ':root' : `[data-theme=${mode}]`),
});
```

### Grid values

Tokenami uses a grid system for spacing. When you pass a number to properties like padding and margin, it multiplies that number by your grid value. For example, with a grid of `4px`, using `--padding: 2` adds `8px` of padding.

By default, the grid is set to `0.25rem`. You can change it in your config:

```ts
module.exports = createConfig({
  grid: '10px',
  // ... rest of your config
});
```

### Arbitrary selectors

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

### Arbitrary values

You can avoid TypeScript errors for one-off inline values by using a triple-dash fallback.

```tsx
<div style={css({ '--padding': 'var(---, 20px)' })} />
```

This prevents TypeScript errors and sets padding to `20px`. Tokenami intentionally adds friction to the developer experience here. This is to encourage sticking to your theme guidelines and to help you quickly spot values in your code that don't.

## Styling

### CSS utility

The `css` utility is used to author your styles and helps with overrides and avoiding specificity issues. Use `css` for inline styles.

#### Usage

Pass your base styles as the first parameter, then any overrides:

```tsx
function Button(props) {
  return (
    <button
      {...props}
      style={css(
        { '--padding': 4 }, // Base styles
        props.style // Overrides
      )}
    />
  );
}
```

#### Overrides

Add conditional styles as extra parameters. The last override wins:

```tsx
function Button(props) {
  const disabled = props.disabled && {
    '--opacity': 0.5,
    '--pointer-events': 'none',
  };

  return (
    <button
      {...props}
      style={css(
        { '--padding': 4 }, // Base styles
        disabled, // Conditional styles
        props.style // Props override
      )}
    />
  );
}
```

### CSS compose

The `css.compose` API helps you build reusable components with variants. Styles in the compose block are extracted into your stylesheet and replaced with a class name to reduce repetition in your markup.

Here's a basic example:

```tsx
const button = css.compose({
  '--background': 'var(--color_primary)',
  '--hover_background': 'var(--color_primary-dark)',

  variants: {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
});

function Button({ size = 'small', ...props }) {
  const [cn, css] = button({ size });
  return <button {...props} className={cn(props.className)} style={css(props.style)} />;
}
```

#### Variants

The `variants` object lets you define different style variations. Each variant can modify any property:

```tsx
const card = css.compose({
  '--border-radius': 'var(--radii_rounded)',
  '--color': 'var(--color_white)',
  '--font-size': 'var(--text-size_sm)',

  variants: {
    color: {
      blue: { '--background-color': 'var(--color_blue)' },
      green: { '--background-color': 'var(--color_green)' },
    },
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
});
```

Use multiple variants together:

```tsx
function Card(props) {
  const [cn, css] = card({ color: 'blue', size: 'large' });
  return <div {...props} className={cn(props.className)} style={css(props.style)} />;
}
```

Variants are treated as overrides, so appear inline:

```html
<button class="tk-abc" style="--background-color: var(--color_blue); --padding: 6;">
  click me
</button>
```

#### Responsive variants

Want to swap variants at different breakpoints? Use the `responsiveVariants` key instead of `variants`:

```tsx
const button = css.compose({
  '--padding': 4,

  responsiveVariants: {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 6 },
    },
  },
});

function Button(props) {
  const [cn, css] = button({
    size: 'small', // Default size
    medium_size: 'large', // Large at medium breakpoint
  });
  return <button {...props} className={cn(props.className)} style={css(props.style)} />;
}
```

#### Extending styles

Use `includes` to combine styles from multiple components or `css` utilities. Conflicting styles (e.g. `--background`) are moved inline to ensure correct overrides:

```tsx
// Reusable focus styles (will appear inline)
const focusable = css({
  '--focus_outline': 'var(--outline_sm)',
  '--outline-offset': 'var(--outline-offset_sm)',
});

// Base button styles (will be extracted into stylesheet)
const button = css.compose({
  '--background': 'var(--color_primary)',
  '--color': 'var(--color_white)',
  '--padding': 4,
});

// New button that includes both
const tomatoButton = css.compose({
  includes: [button, focusable],
  '--background': 'var(--color_tomato)',
});
```

Output:

```html
<button
  class="tk-abc"
  style="--focus_outline: var(--outline_sm); --outline-offset: var(--outline-offset_sm); --background: var(--color_tomato);"
>
  click me
</button>
```

## Design systems

Design systems help teams build consistent interfaces. Tokenami makes it easy to create and use design systems, whether you're building your own or using our official one.

### Using the official system

Our [official design system](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) comes with:

- Global reset based on [Preflight from Tailwind](https://github.com/tailwindlabs/tailwindcss/blob/next/packages/tailwindcss/preflight.css)
- [Radix UI colors](https://www.radix-ui.com/colors) with automatic dark mode
- [Fluid spacing and font sizes](https://utopia.fyi/) for Breakpoints
- Right-to-left support built in
- Short aliases for common properties (e.g. `--p` for padding)

Follow the `@tokenami/ds` docs to [get started](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md).

### Building your own system

Want to create your own portable design system? Create a shared tokenami config and stylesheet package that projects can consume:

```tsx
import designSystemConfig from '@acme/design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: ['./app/**/*.{ts,tsx}', 'node_modules/@acme/design-system/tokenami.css'],
});
```

### Global styles

Provide global styles in your config to include them as part of your design system.

```ts
module.exports = createConfig({
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

### Breakpoints

Define your breakpoints in the `responsive` config:

```ts
module.exports = createConfig({
  responsive: {
    md: '@media (min-width: 700px)',
    lg: '@media (min-width: 1024px)',
    'md-self': '@container (min-width: 400px)', // Container queries work too!
  },
});
```

Use them by adding the breakpoint name before any property:

```tsx
<div
  style={css({
    '--padding': 2, // Base padding
    '--md_padding': 4, // Padding at medium breakpoint
    '--lg_padding': 6, // Padding at large breakpoint
    '--md-self_padding': 8, // Padding when container is medium
  })}
/>
```

### Animation

Add keyframes to your config and reference them in your theme:

```ts
module.exports = createConfig({
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

Apply the animation to an element:

```tsx
<div style={css({ '--animation': 'var(--anim_wiggle)' })} />
```

## Advanced usage

Tokenami has some advanced features that can help you build more powerful design systems.

### Custom selectors

Some [common selectors](https://github.com/tokenami/tokenami/blob/main/packages/tokenami/stubs/tokenami.config.ts#L28) are built in, but you can add your own. Use the ampersand (`&`) to mark where the current element's selector should be injected:

```ts
module.exports = createConfig({
  selectors: {
    'parent-hover': '.parent:hover > &',
    // Nested selectors work too
    hover: ['@media (hover: hover) and (pointer: fine)', '&:hover'],
  },
});
```

Use them in your components:

```tsx
<div className="parent">
  <img src="..." alt="" />
  <button style={css({ '--parent-hover_color': 'var(--color_primary)' })} />
</div>
```

### Property aliases

Aliases allow you to create shorthand names for properties. When using custom aliases, the `css` utility must be configured to ensure conflicts are resolved correctly across component boundaries.

#### 1. Create a file in your project to configure the utility. You can name this file however you like:

```ts
// css.ts
import { createCss } from '@tokenami/css';
import config from '../.tokenami/tokenami.config';

export const css = createCss(config);
```

#### 2. Configure the aliases in your config file:

```ts
module.exports = createConfig({
  aliases: {
    p: ['padding'],
    px: ['padding-inline'],
    py: ['padding-block'],
    size: ['width', 'height'],
  },
});
```

#### 3. Use the aliases:

```tsx
<div style={css({ '--p': 4, '--px': 2, '--size': '100%' })} />
```

### Theming properties

Tokenami maps your properties to some [default theme keys](https://github.com/tokenami/tokenami/blob/main/packages/tokenami/stubs/tokenami.config.ts#L43) out of the box. For example, `--border-color` accepts tokens from your `color` theme object, while `--padding` works with your grid system. You can customise these mappings in the `properties` key:

```ts
module.exports = createConfig({
  theme: {
    container: {
      half: '50%',
      full: '100%',
    },
    pet: {
      cat: '"🐱"',
      dog: '"🐶"',
    },
  },
  properties: {
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
    '--width': 'var(--container_half)', // Works ✅
    '--content': 'var(--pet_cat)', // Works ✅
    '--content': 'var(--container_half)', // Error ❌
  })}
/>
```

### Custom properties

Create your own properties for design system features. For example, make gradient properties that use your color tokens by adding them to the `customProperties` key:

```ts
module.exports = createConfig({
  theme: {
    color: {
      primary: '#f1f5f9',
      secondary: '#334155',
    },
    gradient: {
      // use your custom properties to configure the gradient
      radial: 'radial-gradient(circle at top, var(--gradient-from), var(--gradient-to) 80%)',
    },
  },
  properties: {
    'background-image': ['gradient'],
  },
  customProperties: {
    'gradient-from': ['color'],
    'gradient-to': ['color'],
  },
});
```

Then use them as follows:

```tsx
<div
  style={css({
    '--background-image': 'var(--gradient_radial)',
    '--gradient-from': 'var(--color_primary)',
    '--gradient-to': 'var(--color_secondary)',
  })}
/>
```

## TypeScript integration

### Utility types

#### Variants

Use the `Variants` type to extend your component props with the available variants:

```tsx
import { type Variants } from '@tokenami/css';

type ButtonElementProps = React.ComponentPropsWithoutRef<'button'>;
interface ButtonProps extends ButtonElementProps, Variants<typeof button> {}
```

#### TokenamiStyle

For components using the `css` utility, use `TokenamiStyle` to type its style prop:

```tsx
import { type TokenamiStyle, css } from '@tokenami/css';

interface ButtonProps extends TokenamiStyle<React.ComponentProps<'button'>> {}

function Button(props: ButtonProps) {
  return <button {...props} style={css({}, props.style)} />;
}
```

Now you can pass tokenami properties directly with proper type checking:

```tsx
<Button style={{ '--padding': 4 }} />
```

### CI setup

Tokenami uses widened types during development for better performance. When you run `tsc` in the command line, it uses these widened types and won't show custom Tokenami errors.

For accurate type checking in CI, run both commands:

```sh
tokenami check && tsc --noEmit
```

## Troubleshooting

Common questions and how to solve them. If you need additional support or encounter any issues, please don't hesitate to join the [discord server](https://discord.gg/CAU4HNR4XK).

### Why the double-dash prefix?

Tokenami applies your styles directly to the `style` attribute for better performance. Since the `style` attribute doesn't support media queries or pseudo-selectors, we use CSS variables to enable them. Making everything a CSS variable simplifies the learning curve.

> [!Tip]
> Don't worry about typing extra dashes! Just type `bord` and Tokenami's intellisense will help autocomplete it in the right format.

Using CSS variables has another benefit—they have lower specificity than CSS properties in the `style` attribute. This means you can easily override Tokenami's styles by adding a stylesheet after Tokenami's if necessary.

### VSCode setup

VSCode won't suggest completions for partial strings by default. This can make it harder to use Tokenami's suggestions. To fix this, add to your `.vscode/settings.json`:

```json
{
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

| BEFORE                                                                                                               | AFTER                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ![CleanShot 2024-09-08 at 14 10 10](https://github.com/user-attachments/assets/9b99edb4-dec0-402e-99c9-671525332ccf) | ![CleanShot 2024-09-08 at 14 09 43](https://github.com/user-attachments/assets/ad2ed719-c2ca-4929-902d-5fdf5142468b) |

### Framework support

Tokenami currently works with:

- React (including Next.js and Remix)
- Vue
- SolidJS

We're still in early development and plan to support more frameworks in the future.

### Browser support

Tokenami relies on [cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers), so it works in browsers that support `@layer`:

| <img src="https://github.com/tokenami/tokenami/assets/175330/8588dacd-a77f-44ee-9111-cea6601ebc35" alt="Edge" width="24px" height="24px" /><br/>Edge | <img src="https://github.com/tokenami/tokenami/assets/175330/b2b38574-5290-44ba-bb28-87e139f8efb8" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://github.com/tokenami/tokenami/assets/175330/ae970301-390d-426e-9ea7-974267917df6" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="Safari" width="24px" height="24px" /><br/>Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="iOS Safari" width="24px" height="24px" /><br/>iOS Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/e9eaad5e-ef39-4423-ad4b-2e61c0bcc873" alt="Opera" width="24px" height="24px" /><br/>Opera |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 99+                                                                                                                                                  | 97+                                                                                                                                                        | 99+                                                                                                                                                      | 15.4+                                                                                                                                                    | 15.4+                                                                                                                                                            | 86+                                                                                                                                                    |

### Browserslist

You can use [browserslist](https://browsersl.ist/) to add autoprefixing to your CSS properties in the generated CSS file. However, Tokenami currently doesn't support vendor-prefixed **values**, which is being tracked in [this issue](https://github.com/tokenami/tokenami/issues/103).

> [!Important]
> Tokenami does not support browsers below the listed [supported browser versions](#user-content-browser-support). We recommend using `"browserslist": ["supports css-cascade-layers"]` if you're unsure.

## Community

### Contributing

Before raising a bug, please check if it's [already in our todo list](https://github.com/tokenami/tokenami/issues). Need help? Join our [Discord server](https://discord.gg/CAU4HNR4XK).

### Contributors

- Paweł Błaszczyk ([@pawelblaszczyk\_](https://twitter.com/pawelblaszczyk_))

### Credits

A big thanks to:

- [Tailwind V3](https://v3.tailwindcss.com/) for inspiring many of Tokenami's features
- [Stitches](https://stitches.dev/) for variants and responsive variants inspiration
- [CSS Hooks](https://css-hooks.com/) for custom selectors inspiration
- [Lightning CSS](https://lightningcss.dev/) for generating the Tokenami stylesheet

Please do check out these projects if Tokenami isn't quite what you're looking for.
