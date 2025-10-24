![image](https://github.com/user-attachments/assets/73712e13-2af9-46c4-a3df-48590cbb4c8a)

<div align="center">
  <h3>CSS-in-JS Reinvented for Portable, Type-Safe Design Systems</h3>
  <p>
    A modern approach to <a href="https://css-tricks.com/just-in-time-css/">just-in-time</a> CSS using atomic CSS variables—<strong>no bundler required</strong>.
  </p>

  <img src="https://github.com/tokenami/tokenami/assets/175330/8cdfcdf8-05da-4096-8e0b-5645e1b329e5" alt="React support" width="40" />
  <img src="https://github.com/preactjs.png" alt="Preact support" width="40" />
  <img src="https://github.com/vuejs.png" alt="Vue support" width="40" />
  <img src="https://github.com/solidjs.png" alt="SolidJS support" width="40" />
  <img src="https://github.com/qwikdev.png" alt="Qwik support" width="40" />

</div>

> [!Warning]
> Tokenami is still in early development. You might find bugs or missing features. Before reporting issues, please check our [existing issues](https://github.com/tokenami/tokenami/issues) first.

## Contents

- [Quick start](#user-content-quick-start)
  - [Installation](#user-content-installation)
  - [Basic setup](#user-content-basic-setup)
- [Introduction](#user-content-introduction)
  - [Why Tokenami?](#user-content-why-tokenami)
  - [Why the CSS variable syntax?](#user-content-why-the-css-variable-syntax)
- [Core concepts](#user-content-core-concepts)
  - [Theming](#user-content-theming)
  - [Grid values](#user-content-grid-values)
  - [Arbitrary selectors](#user-content-arbitrary-selectors)
  - [Arbitrary values](#user-content-arbitrary-values)
- [Styling](#user-content-styling)
  - [CSS utility](#user-content-css-utility)
  - [CSS compose](#user-content-css-compose)
    - [Variants](#user-content-variants)
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
  - [Enable string completions](#user-content-enable-string-completions)
  - [Improve autocomplete speed and accuracy](#user-content-improve-autocomplete-speed-and-accuracy)
  - [Supported libraries](#user-content-supported-libraries)
  - [Supported browsers](#user-content-supported-browsers)
  - [Supported editors](#user-content-supported-editors)
  - [Browserslist](#user-content-browserslist)
- [Community](#user-content-community)
  - [Contributing](#user-content-contributing)
  - [Contributors](#user-content-contributors)
  - [Credits](#user-content-credits)

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

#### 1. Configure TypeScript (`tsconfig.json` or `jsconfig.json`):

```json
{
  "include": [".tokenami/tokenami.env.d.ts", "src"],
  "compilerOptions": {
    "plugins": [{ "name": "tokenami" }]
  }
}
```

- Make sure your editor uses the workspace TypeScript version (see [VS Code docs](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)).
- For VS Code–based editors, [enable string suggestions](#user-content-enable-string-completions) and check our [autocomplete tuning guide](#user-content-improve-autocomplete-speed-and-accuracy).

#### 2. Run the watcher to build your CSS:

```sh
npx tokenami --output ./public/styles.css --watch
```

#### 3. Reference the CSS file in the `<head>` of your document, and start styling with Tokenami:

```tsx
import { css } from '@tokenami/css';

function Page() {
  return <h1 style={css({ '--margin-top': 0, '--margin-bottom': 5 })}>Hello, World!</h1>;
}
```

## Introduction

Tokenami isn't another design system. It's a toolkit for building your own. By replacing atomic classes with **atomic CSS variables** and providing a unified set of tools, Tokenami makes it simple to create portable, type-safe design systems with tokens at the heart of your CSS.

Benefits include:

- 🏷️ **Simple naming convention** — turn any CSS property into a variable (`padding` → `--padding`)
- 📦 **Smaller stylesheet** — one variable-driven rule instead of dozens of utility classes
- ✨ **Streamlined markup** — one class name for your reusable components, keeping HTML clean and DRY
- 🎯 **Single source of truth** — a config file defines and enforces your design tokens
- 💡 **Smart authoring** — autocomplete + type safety built into your workflow
- 🔓 **Extensible by design** — atomic CSS variables give your consumers control to override
- ☮️ **No specificity wars** — a tiny first-class `css` utility handles safe composition
- ⚡ **Dynamic by default** — pass props directly into tokens (`--color: props.color`)
- ✍️ **Shorthand tokens** — define aliases like `--p` for padding
- 🎨 **Expressive selectors** — custom selectors for nesting and descendant rules
- 🚀 **Zero bundler friction** — static styles with no bundler integration

### Why Tokenami?

The React team [no longer recommends](https://github.com/reactwg/react-18/discussions/110) CSS-in-JS solutions that inject styles at runtime. Instead, they suggest:

> [...] use [`<link rel="stylesheet">`](https://github.com/reactwg/react-18/discussions/108) for static styles and plain inline styles for dynamic values. E.g. `<div style={{...}}>`

In other words—write CSS like we used to. But what about the benefits CSS-in-JS gave us?

<details>
<summary>Read more</summary>
<br/>

Some CSS-in-JS tools already extract static styles into `.css` files, but they often need [bundler setup](https://vanilla-extract.style/documentation/integrations/next/) and have [build-time limitations](https://panda-css.com/docs/guides/dynamic-styling).

Developers use them for their design systems despite the learning curve, because they want:

- Type-checked tokens with autocomplete
- Enforced theme constraints to ensure consistency
- Style deduplication and critical path CSS
- Scoped, conflict-free styles
- Composable building blocks

Tailwind CSS offers a different approach:

- Atomic utility classes to limit stylesheet growth
- Editor extensions that suggest theme values
- Statically generated styles with a simple CLI, no bundler needed
- Quick prototyping using inline classes

But when building a design system, Tailwind has drawbacks:

- Removing a token in the theme does not show redundant usage in code
- Reused components bloat markup with repetitive utility classes
- Developers must memorise many class names (see [Tailwind Cheatsheet](https://tailwindcomponents.com/cheatsheet/))
- Style composition can create specificity conflicts (solved with third-party tools like [tailwind-merge](https://www.npmjs.com/package/tailwind-merge))
- Styling inline is not always ideal, leading to third-party tools like [cva](https://cva.style/docs)
- Classes must be written as [complete unbroken strings](https://tailwindcss.com/docs/content-configuration#dynamic-class-names) making dynamic styling trickier
- Debugging is harder because styles are spread across many atomic classes
</details>

Tokenami bridges the gap between CSS-in-JS and utility-first frameworks. You get the type safety, composability, and design token discipline of CSS-in-JS, with the performance and simplicity of plain CSS. No build plugins, no runtime injection, no class soup—just clean, predictable styling powered by tokens.

### Why the CSS variable syntax?

To keep things fast, Tokenami applies styles directly to the `style` attribute when needed instead of injecting runtime CSS. Since inline styles can't handle media queries or pseudo-selectors, Tokenami expresses everything as CSS variables.

This approach not only enables responsive and state-based styling—it also keeps specificity low, so others can easily integrate your design system and override its styles when needed. You're never locked into Tokenami.

And don’t worry about typing all those dashes—just type `bord`, and Tokenami's IntelliSense completes the variable for you.

## Core concepts

Tokenami is built around a few key ideas:

- Turn any CSS property into a variable by adding `--` (e.g. `--padding`)
- Add selectors with underscores (e.g. `--hover_padding`)
- Add breakpoints the same way (e.g. `--md_padding`)
- Combine selectors and breakpoints (e.g. `--md_hover_padding`)
- Use `---` (triple dash) for custom CSS variables

### Theming

> [!Tip]
> Want to skip theme setup? Use our [official design system](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) which comes with dark mode, fluid typography, RTL support, and more.

Tokenami relies on your theme to provide design system constraints. Create one in `.tokenami/tokenami.config`:

```ts
export default createConfig({
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
export default createConfig({
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
export default createConfig({
  themeSelector: (mode) => (mode === 'root' ? ':root' : `[data-theme=${mode}]`),
});
```

### Grid values

Tokenami uses a grid system for spacing. When you pass a number to properties like padding and margin, it multiplies that number by your grid value. For example, with a grid of `4px`, using `--padding: 2` adds `8px` of padding.

By default, the grid is set to `0.25rem`. You can change it in your config:

```ts
export default createConfig({
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
    // use underscore for spaces in your selector
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
});

function Button(props) {
  const [cn, css] = button();
  return <button {...props} className={cn(props.className)} style={css(props.style)} />;
}
```

Output:

```html
<button class="tk-abc">click me</button>
```

#### Variants

The `variants` object lets you define different style variations:

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

Variants are treated like overrides, so appear inline:

```html
<div class="tk-abc" style="--background-color: var(--color_blue); --padding: 6;">boop</div>
```

#### Extending styles

Use `includes` to combine styles from multiple components or `css` utilities.

```tsx
// Reusable focus styles (will appear inline)
const focusable = css({
  '--focus_outline': 'var(--outline_sm)',
  '--outline-offset': 'var(--outline-offset_sm)',
});

// Base button styles (composed so will be extracted into stylesheet)
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

Conflicting styles (e.g. `--background`) are moved inline to override:

```html
<button
  class="tk-abc"
  style="--focus_outline: var(--outline_sm); --outline-offset: var(--outline-offset_sm); --background: var(--color_tomato);"
>
  click me
</button>
```

## Design systems

Tokenami eases the friction of creating portable design systems, whether you're building your own or using our official one.

### Using the official system

Our [official design system](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) comes with:

- Global reset based on [Preflight from Tailwind](https://github.com/tailwindlabs/tailwindcss/blob/next/packages/tailwindcss/preflight.css)
- [Radix UI colours](https://www.radix-ui.com/colors) with automatic dark mode
- [Fluid spacing and font sizes](https://utopia.fyi/) for responsive design
- Right-to-left support built in (`padding-left` becomes `padding-inline-start` etc.)
- Short aliases for common properties (e.g. `--p` for padding)

Follow [the `@tokenami/ds` docs](https://github.com/tokenami/tokenami/blob/main/packages/ds/README.md) to get started.

### Building your own system

Create a shared Tokenami config + stylesheet package, and publish it for projects to consume. If consumer is using Tokenami also, they should include your design system in their config:

```tsx
import designSystemConfig from '@acme/design-system';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: ['./app/**/*.{ts,tsx}', 'node_modules/@acme/design-system/tokenami.css'],
});
```

Projects that consume a Tokenami design system do not need to be using Tokenami themselves though. If they're not using Tokenami, they can reference their stylesheet _after_ the design system stylesheet and their styles will override accordingly.

### Global styles

Provide global styles in your config to include them as part of your design system.

```ts
export default createConfig({
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
export default createConfig({
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
export default createConfig({
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

Some [common selectors](https://github.com/tokenami/tokenami/blob/main/packages/tokenami/stubs/tokenami.config.ts#L28) are included, but you can configure your own. Use the ampersand (`&`) to mark where the current element's selector should be injected:

```ts
export default createConfig({
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
export default createConfig({
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
export default createConfig({
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

Create your own properties for design system features. For example, make gradient properties that use your colour tokens by adding them to the `customProperties` key:

```ts
export default createConfig({
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

Components styled with the `css` utility can use `TokenamiStyle` to type their style prop if you want it to accept Tokenami properties.

```tsx
import { type TokenamiStyle, css } from '@tokenami/css';

interface ButtonProps extends TokenamiStyle<React.ComponentProps<'button'>> {}

function Button(props: ButtonProps) {
  return <button {...props} style={css({}, props.style)} />;
}
```

Now you can pass Tokenami properties with type checking:

```tsx
<Button style={{ '--padding': 4 }} />
```

#### TokenValue

Use `TokenValue` to get a union of CSS variable tokens based on your theme.

Given this theme:

```ts
export default createConfig({
  theme: {
    color: {
      'slate-100': '#f1f5f9',
      'slate-700': '#334155',
    },
    radii: {
      rounded: '10px',
      circle: '9999px',
    },
  },
});
```

It will output the following types:

```ts
import { type TokenValue } from '@tokenami/css';

type Color = TokenValue<'color'>; // var(--color_slate-100) | var(--color_slate-700)
type Radii = TokenValue<'radii'>; // var(--radii_rounded) | var(--radii_circle)
```

### CI setup

Tokenami uses widened types during development for better performance. When you run `tsc` in the command line, it uses these widened types and won't show Tokenami type errors.

For accurate type checking in CI, run both commands:

```sh
tokenami check; tsc --noEmit
```

## Troubleshooting

Common questions and how to solve them. If you need additional support or encounter any issues, please don't hesitate to join the [discord server](https://discord.gg/CAU4HNR4XK).

### Enable string completions

VS Code won't suggest completions for partial strings by default. This prevents Tokenami from updating its suggestions. To fix, add the following to `.vscode/settings.json`:

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

### Improve autocomplete speed and accuracy

Some editors that Tokenami integrates with (such as VS Code and Cursor) support VS Code–style configuration settings. If you feel Tokenami's completions are slow or match on irrelevant suggestions, you can refine IntelliSense behaviour by adding the following settings to your workspace `.vscode/settings.json`:

```json
{
  "editor.suggest.filterGraceful": false,
  "editor.suggest.matchOnWordStartOnly": true
}
```

- **"editor.suggest.filterGraceful": false**: Filters out loosely related suggestions so closer matches are shown.
- **"editor.suggest.matchOnWordStartOnly": true**: Redcues noise by prioritising suggestions that begin with your typed characters.

### Supported libraries

Tokenami currently works with:

| <img src="https://github.com/tokenami/tokenami/assets/175330/8cdfcdf8-05da-4096-8e0b-5645e1b329e5" alt="" width="24" /><br/>React | <img src="https://github.com/preactjs.png" alt="" width="24" /><br />Preact | <img src="https://github.com/vuejs.png" alt="" width="24" /><br />Vue | <img src="https://github.com/solidjs.png" alt="" width="24" /><br />SolidJS | <img src="https://github.com/qwikdev.png" alt="" width="24" /><br />Qwik |
| :-------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :-------------------------------------------------------------------: | :-------------------------------------------------------------------------: | :----------------------------------------------------------------------: |
|                                                                ✅                                                                 |                                     ✅                                      |                                  ✅                                   |                                     ✅                                      |                                    ✅                                    |

We're still in early development and plan to support more libraries in the future.

### Supported browsers

Tokenami relies on [cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers), so it works in browsers that support `@layer`:

| <img src="https://github.com/tokenami/tokenami/assets/175330/8588dacd-a77f-44ee-9111-cea6601ebc35" alt="Edge" width="24px" height="24px" /><br/>Edge | <img src="https://github.com/tokenami/tokenami/assets/175330/b2b38574-5290-44ba-bb28-87e139f8efb8" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://github.com/tokenami/tokenami/assets/175330/ae970301-390d-426e-9ea7-974267917df6" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="Safari" width="24px" height="24px" /><br/>Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/16c7374c-a466-4fbe-9459-44c3b30bb688" alt="iOS Safari" width="24px" height="24px" /><br/>iOS Safari | <img src="https://github.com/tokenami/tokenami/assets/175330/e9eaad5e-ef39-4423-ad4b-2e61c0bcc873" alt="Opera" width="24px" height="24px" /><br/>Opera |
| :--------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                         99+                                                                          |                                                                            97+                                                                             |                                                                           99+                                                                            |                                                                          15.4+                                                                           |                                                                              15.4+                                                                               |                                                                          86+                                                                           |

### Supported editors

Tokenami is officially supported in the following editors:

- [VSCode](https://code.visualstudio.com/)
- [Cursor](https://www.cursor.com/)
- [Windsurf](https://windsurf.com/)
- [Zed](https://zed.dev/)

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
- [Stitches](https://stitches.dev/) for variants inspiration
- [CSS Hooks](https://css-hooks.com/) for custom selectors inspiration
- [Lightning CSS](https://lightningcss.dev/) for generating the Tokenami stylesheet

Please do check out these projects if Tokenami isn't quite what you're looking for.
