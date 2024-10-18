# @tokenami/ds

The official design system for Tokenami. You can use it as a starting point for your project or as a reference for building your own.

## Getting started

Install using your package manager of choice:

```sh
npm install @tokenami/ds
```

Then include the design system config in your `tokenami.config.js` file:

```tsx
import designSystemConfig from '@tokenami/ds';
import { createConfig } from '@tokenami/css';

export default createConfig({
  ...designSystemConfig,
  include: ['./app/**/*.{ts,tsx}'],
});
```

The design system includes custom aliases for common properties, such as `--p` for `padding` and `--px` for `padding-left` and `padding-right`. Please follow the [aliases guide](https://github.com/tokenami/tokenami?tab=readme-ov-file#aliases) on [configuring the `css` utility](https://github.com/tokenami/tokenami?tab=readme-ov-file#configure-utility) to ensure the aliases merge correctly across component boundaries.

## Theme selector

Use a `data-theme` attribute to apply the appropriate light or dark theme to your elements. Otherwise, it will apply the `light` theme by default to the `:root` selector.

## Grid

Spacing is based on a 4px grid using `rem` units. The `rem` value is calculated based on a `16px` base font size.

Using numeric values for grid properties such as `padding` and `margin` will result in multiples of this grid being applied. For instance, `--padding: 2` will add `8px` (`0.5rem`) padding to your element.

## Fluid spacing and font sizes

Use the fluid spacing and font size tokens to create responsive designs without micromanaging breakpoints. The [utopia guide](https://utopia.fyi/) is a great resource for understanding the concepts behind these tokens.

### Spacing

The following example will apply `8px` (`0.5rem`) padding to your element at the smallest breakpoint, and `16px` (`1rem`) padding at the largest breakpoint.

```tsx
css({
  '--padding': 'var(--fluid-p-clamp_min-max)',
  '--fluid-p-min': 2,
  '--fluid-p-max': 4,
});
```

You can adjust the breakpoints the fluid spacings apply to by changing the `--padding` clamp value:

```diff
css({
- '--padding': 'var(--fluid-p-clamp_min-max)',
+ '--padding': 'var(--fluid-p-clamp_sm-md)',
  '--fluid-p-min': 2,
  '--fluid-p-max': 4,
});
```

This will clamp the minimum padding at the small breakpoint, and the maximum padding at the medium breakpoint.

### Font sizes

Fluid font sizes accept fluid tokens:

```tsx
css({
  '--font-size': 'var(--fluid-text-size-clamp_min-max)',
  '--fluid-text-size-min': 'var(--fluid-text-size_xs)',
  '--fluid-text-size-max': 'var(--fluid-text-size_lg)',
});
```

This will mean a font size that scales between `12px` (`0.75rem`) and `18px` (`1.125rem`) from smallest to largest breakpoints.

## Radix UI Colours

The design system uses [Radix UI P3 colours](https://www.radix-ui.com/colors) and includes fallbacks for browsers/displays that don't support P3 colours.

A powerful feature of this palette is dark mode by default when applying the appropriate steps in the scale to each use case. Find out more about [how to use the Radix palette](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) on their website.

### Gradients

Use the `--gradient_to-[t|r|b|l|tr|tl|br|bl]` tokens along with the `--gradient-from` and `--gradient-to` custom properties to apply gradients.

```tsx
css({
  '--background-image': 'var(--gradient_to-b)',
  '--gradient-from': 'var(--color_crimson9)',
  '--gradient-to': 'var(--color_green10)',
});
```

The base gradients use the sRGB colour space to match the behaviour of design tools, but you can use the `--gradient_hd-to-[t|r|b|l|tr|tl|br|bl]` tokens to apply gradients using the OKLCH colour space for a more accurate representation of colour.

```tsx
css({
  '--background-image': 'var(--gradient_hd-to-b)',
  '--gradient-from': 'var(--color_crimson9)',
  '--gradient-to': 'var(--color_green10)',
});
```

## Right-to-left support

The design system includes right-to-left support out of the box. This means that directional properties like `padding-left` become `padding-inline-start`, and `padding-right` becomes `padding-inline-end`. If you'd like to disable this, remove the respective aliases from your config.
