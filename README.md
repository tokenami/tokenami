# tokenami

Tailwind CSS, but tokens.

## Description

A mobile-first CSS authoring experience to replace CSS-in-JS, with plain ol' CSS variables.

### Why is it needed?

CSS-in-JS solutions that rely on style injection [won't be recommended by the React team](https://github.com/reactwg/react-18/discussions/110) going forward, so instead they have suggested the following:

> Our preferred solution is to use [`<link rel="stylesheet">`](https://github.com/reactwg/react-18/discussions/108) for statically extracted styles and plain inline styles for dynamic values. E.g. `<div style={{...}}>`

In other words—_write css like we used to_. But what about all the benefits we lose that CSS-in-JS gave us?

Solutions do exist that feel like CSS-in-JS and extract static rules from your template files into external `.css` files, however, these approaches require [integration into your chosen metaframework](https://vanilla-extract.style/documentation/integrations/next/) along with their own [build-time limitations](https://panda-css.com/docs/guides/dynamic-styling) and custom APIs you need to learn to style things.

The set up required to get all of this is sometimes intimidating and time consuming due to lengthy docs on new terminology (e.g "[recipes](https://panda-css.com/docs/concepts/recipes)" or "[sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/)") and/or lib [dos and don'ts](https://tailwindcss.com/docs/content-configuration).

Regardless, developers jump through these hoops so they can have type errors and intellisense for their design system tokens, as well as style deduping, critical path CSS, scoping, and composition.

Tailwind CSS simplifies much of this:

- DX is simple
- We can style inline to prototype quickly
- Editor extensions for intellisense based on your theme
- Styles are statically generated so we can use `<link />`
- Only requires a simple CLI script to get up and running
- Atomic so styles have a cap on how large they can grow

On the flip side, their atomic classes come with the following inconveniences:

- Removing tokens in your theme won't flag redundant references throughout your codebase
- Specificity issues so component composition requires third-party packages like [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)
- Developers must learn Tailwind's custom class names which spawns things like the [Tailwind Cheatsheet](https://tailwindcomponents.com/cheatsheet/)
- Styling inline all the time can sometimes be unpleasant to maintain, resulting in third-party packages like [cva](https://cva.style/docs)
- Classes must exist as complete strings so `className={'bg-slate-' + isDark ? 200 : 100}` will not work

### How tokenami helps

The CSS landscape has improved significantly with the introduction of CSS custom properties (variables) and they have made room for a tool that solves the same problems CSS-in-JS did for us, but without all the setup overhead and complex custom APIs.

Some of us just want to spin up a project and get styling without having to worry about compilation steps / build tooling / custom CSS APIs / SSR docs etc.

**Tokenami achieves all of this by moving consumers from the `class` attribute to the `style` attribute and using CSS variables in place of CSS properties**.

With a strong focus on simplicity for ease of use, it gives consumers:

- A `tokenami.config.js` for defining their theme
- A CLI tool (like Tailwind) for JIT compilation of styles
- Ability to style inline in `style` attribute to prototype quickly, including media queries (`--md_background-color: 'red'`) and pseudo-classes (`--hover_background-color: 'red'`)
- An API similar to [stitches core](https://stitches.dev/docs/framework-agnostic) e.g. `style={button({ variant: 'large' })}`
- A VS Code extension for token intellisense and flagging redundant references. Aimed at HTML/CSS purists that don't want to use the JS `style` API.
- Scoped styles (`style` always has highest specificity)
- Built-in composability. Last CSS var wins e.g. `<div style="--color:blue;--color:red;" />` will be red
- Built-in style deduping thanks to object merging and token-based atomic CSS e.g passing color through style prop will overwrite internal declaration: `style={{ '--color': 'red', ...props.style }}`
- Styles can be dynamic so `style={{ '--margin-top': size === 'lg' ? '22px' : '17px' }}` works
- Styles can be shorthand with custom aliases if preferred e.g. `style={{ '--c': 'red' }}` for color
- Smaller stylesheet thanks to token-based atomic CSS

![CleanShot 2023-06-19 at 15 31 01](https://github.com/jjenzz/tokenami/assets/175330/59286ddf-19e3-41a8-aeb7-7726c48a6775)

### How do we create it?

- See [here](https://codepen.io/jjenzz/pen/vYaeYKR) for an initial proof of concept
- See [here](https://github.com/jjenzz/tokenami/issues) for first-steps issues
