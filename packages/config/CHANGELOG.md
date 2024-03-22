# @tokenami/config

## 0.0.36

### Patch Changes

- 5f9b38c: Add support for multiple theme modes

## 0.0.36-next.0

### Patch Changes

- 5f9b38c: Add support for multiple theme modes

## 0.0.35

### Patch Changes

- bec6ed6: Update with explicit type import for some housekeeping

## 0.0.35-next.0

### Patch Changes

- bec6ed6: Update with explicit type import for some housekeeping

## 0.0.34

### Patch Changes

- afe4609: Restructure files for some house keeping

## 0.0.34-next.0

### Patch Changes

- afe4609: Restructure files for some house keeping

## 0.0.33

### Patch Changes

- c44063a: Reduce css package bundle size
- afafaf6: Merge configs in `createConfig`

## 0.0.33-next.0

### Patch Changes

- c44063a: Reduce css package bundle size
- afafaf6: Merge configs in `createConfig`

## 0.0.32

### Patch Changes

- 77b437e: Add design system support

## 0.0.32-next.0

### Patch Changes

- 77b437e: Add design system support

## 0.0.31

### Patch Changes

- 34ced9d: Override longhands when shorthand is last in base styles
- bb0c2bb: Add layers for shorthands that are also longhands
- 51cdcc1: Allow all CSS properties to be inheritable properties
- 79f5490: Add tokenami layer around all tokenami styles

## 0.0.31-next.3

### Patch Changes

- 34ced9d: Override longhands when shorthand is last in base styles

## 0.0.31-next.2

### Patch Changes

- 51cdcc1: Allow all CSS properties to be inheritable properties

## 0.0.31-next.1

### Patch Changes

- 79f5490: Add tokenami layer around all tokenami styles

## 0.0.31-next.0

### Patch Changes

- bb0c2bb: Add layers for shorthands that are also longhands

## 0.0.30

### Patch Changes

- 8727c2d: Fix TS errors for invalid responsive + selector properties
- c0f0e32: Add `TokenamiStyle` type to allow `css` utility in `style` prop

## 0.0.30-next.1

### Patch Changes

- 8727c2d: Fix TS errors for invalid responsive + selector properties

## 0.0.30-next.0

### Patch Changes

- c0f0e32: Add `TokenamiStyle` type to allow `css` utility in `style` prop

## 0.0.29

### Patch Changes

- 6681912: Remove supported properties from css bundle to reduce its bundle size

## 0.0.29-next.0

### Patch Changes

- 6681912: Remove supported properties from css bundle to reduce its bundle size

## 0.0.28

### Patch Changes

- ad0a323: Remove `csstype` from `css` util

## 0.0.28-next.0

### Patch Changes

- ad0a323: Remove `csstype` from `css` util

## 0.0.27

### Patch Changes

- f952a2f: Remove redundant fallbacks from styleasheet

## 0.0.27-next.0

### Patch Changes

- f952a2f: Remove redundant fallbacks from styleasheet

## 0.0.26

### Patch Changes

- fafdccb: Remove aliases from style output to ensure a consistent output across projects
- b08def7: Allow `props.style` to be passed to `css` overrides

## 0.0.26-next.1

### Patch Changes

- b08def7: Allow `props.style` to be passed to `css` overrides

## 0.0.26-next.0

### Patch Changes

- fafdccb: Remove aliases from style output to ensure a consistent output across projects

## 0.0.25

### Patch Changes

- 1ffb09f: Remove `all` from shorthands to prevent max callstack error

## 0.0.25-next.0

### Patch Changes

- 1ffb09f: Remove `all` from shorthands to prevent max callstack error

## 0.0.24

### Patch Changes

- fac6fb8: Remove valibot to reduce `css` bundle size

## 0.0.24-next.0

### Patch Changes

- fac6fb8: Remove valibot to reduce `css` bundle size

## 0.0.23

### Patch Changes

- ad995c1: Improve variants/responsive variants API

## 0.0.23-next.0

### Patch Changes

- ad995c1: Improve variants/responsive variants API

## 0.0.22

### Patch Changes

- c5eeac1: Replace `[style*=""]` selectors with cascade layers [#192](https://github.com/tokenami/tokenami/pull/192)
- c9bde91: Remove wide record type from css util
- d2a8eda: Fix `getTokenPropertyParts` when there is an invalid/valid selector combination
- d739220: Allow external stylesheet to be used in `includes` to generate styles for external packages
- b42133e: Remove redundant type import in stubs
- 207931f: Fix the unused layers regex for production builds
- 8a7c373: Fix `getTokenPropertyParts` when there is an invalid/valid selector combination

## 0.0.22-next.6

### Patch Changes

- d2a8eda: Fix `getTokenPropertyParts` when there is an invalid/valid selector combination

## 0.0.22-next.5

### Patch Changes

- b42133e: Remove redundant type import in stubs

## 0.0.22-next.4

### Patch Changes

- d739220: Allow external stylesheet to be used in `includes` to generate styles for external packages

## 0.0.22-next.3

### Patch Changes

- 8a7c373: Fix `getTokenPropertyParts` when there is an invalid/valid selector combination

## 0.0.22-next.2

### Patch Changes

- c9bde91: Remove wide record type from css util

## 0.0.22-next.1

### Patch Changes

- 207931f: Fix the unused layers regex for production builds

## 0.0.22-next.0

### Patch Changes

- c5eeac1: Replace `[style*=""]` selectors with cascade layers [#192](https://github.com/tokenami/tokenami/pull/192)

## 0.0.21

### Patch Changes

- 9370aeb: Fix selector specificity order

## 0.0.21-next.0

### Patch Changes

- 9370aeb: Fix selector specificity order

## 0.0.20

### Patch Changes

- ee3b40a: Add `Pick` and `Omit` utility types for `TokenamiProperties`

## 0.0.20-next.0

### Patch Changes

- ee3b40a: Add `Pick` and `Omit` utility types for `TokenamiProperties`

## 0.0.19

### Patch Changes

- 270c30a: Only generate `var` selectors when used
- dff653f: Remove default `grid` config for border properties

## 0.0.19-next.1

### Patch Changes

- dff653f: Remove default `grid` config for border properties

## 0.0.19-next.0

### Patch Changes

- 270c30a: Only generate `var` selectors when used

## 0.0.18

### Patch Changes

- bf967a5: Remove styles associated with token values if they're unused

## 0.0.18-next.0

### Patch Changes

- bf967a5: Remove styles associated with token values if they're unused

## 0.0.17

### Patch Changes

- 93831ba: Improve `tokenami init` DX by asking for folder instead of glob

## 0.0.17-next.0

### Patch Changes

- 93831ba: Improve `tokenami init` DX by asking for folder instead of glob

## 0.0.16

### Patch Changes

- 0754d7e: Add lookup types to try help with performance

## 0.0.16-next.0

### Patch Changes

- 0754d7e: Add lookup types to try help with performance

## 0.0.15

### Patch Changes

- 6c8c318: Allow selectors that begin with a number
- 637d4bb: Add aliases to resets to prevent alias inheritence

## 0.0.15-next.1

### Patch Changes

- 637d4bb: Add aliases to resets to prevent alias inheritence

## 0.0.15-next.0

### Patch Changes

- 6c8c318: Allow selectors that begin with a number

## 0.0.14

### Patch Changes

- 68dd5c3: Improve selectore defaults for better performance

## 0.0.14-next.0

### Patch Changes

- 68dd5c3: Improve selectore defaults for better performance

## 0.0.13

### Patch Changes

- c5479fd: Add intellisense for responsive selectors

## 0.0.13-next.0

### Patch Changes

- c5479fd: Add intellisense for responsive selectors

## 0.0.12

### Patch Changes

- f704276: Add responsive+selector types for CI

## 0.0.12-next.0

### Patch Changes

- f704276: Add responsive+selector types for CI
