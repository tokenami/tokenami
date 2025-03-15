# v0.0.78 (Sat Mar 15 2025)

### Release Notes

#### move compose styles to stylesheet and generate class names ([#391](https://github.com/tokenami/tokenami/pull/391))

styles in compose blocks are now extracted into your stylesheet for reuse, reducing redundancy in HTML by replacing repetitive component styles with a class name. as a result, the `css.compose` return type has been updated:

```tsx
const Button = ({ size = 'small', ...props }) => {
  const [cn, css] = button({ size });
  return <button {...props} className={cn(props.className)} style={css(props.style)} />;
};

const button = css.compose({
  '--color': 'var(--color_white)',

  variants: {
    size: {
      small: { '--padding': 2 },
      large: { '--padding': 3 },
    },
  },
});
```

#### remove `tokenami.ev.ci.d.ts` requirement in favour of running `tokenami check` during CI ([#413](https://github.com/tokenami/tokenami/pull/413))

if your project is set up for continuous integration, remove the `.tokenami/tokenami.env.ci.d.ts` and `tsconfig.ci.json` files, and add `tokenami check` to your typechecking step to validate tokenami properties instead. 

```sh
tokenami check && tsc --noEmit
```

---

#### 💥 Breaking Change

- move compose styles to stylesheet and generate class names [#391](https://github.com/tokenami/tokenami/pull/391) ([@jjenzz](https://github.com/jjenzz))
- remove `tokenami.ev.ci.d.ts` requirement in favour of running `tokenami check` during CI [#413](https://github.com/tokenami/tokenami/pull/413) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- fix ast parsing for compose blocks [#410](https://github.com/tokenami/tokenami/pull/410) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- fix discord notification json error [#408](https://github.com/tokenami/tokenami/pull/408) ([@jjenzz](https://github.com/jjenzz))

#### 📝 Documentation

- update docs for custom properties [#409](https://github.com/tokenami/tokenami/pull/409) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.77 (Sun Feb 09 2025)

### Release Notes

#### move ts-plugin and dev package into new `tokenami` package ([#400](https://github.com/tokenami/tokenami/pull/400))

the `@tokenami/dev` and `@tokenami/ts-plugin` packages have been deprecated and merged into a new `tokenami` package. please install `tokenami` instead and update your `tsconfig.json` plugin name to "tokenami".

---

#### 💥 Breaking Change

- move ts-plugin and dev package into new `tokenami` package [#400](https://github.com/tokenami/tokenami/pull/400) ([@jjenzz](https://github.com/jjenzz))
- fix canary builds [#405](https://github.com/tokenami/tokenami/pull/405) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- publish canary releases to npm registry [#407](https://github.com/tokenami/tokenami/pull/407) ([@jjenzz](https://github.com/jjenzz))
- update labels to represent changes in changelog [#406](https://github.com/tokenami/tokenami/pull/406) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.76 (Fri Feb 07 2025)

### Release Notes

#### [dev] remove redundant `createConfig` export ([#401](https://github.com/tokenami/tokenami/pull/401))

older versions of tokenami  (<= 0.0.7) depended on a `createConfig` export from `@tokenami/dev`. if you're upgrading from any of those versions, you'll need to import from `@tokenami/css` instead, as documented in more recent versions of the readme.

---

#### 💥 Breaking Change

- [dev] remove redundant `createConfig` export [#401](https://github.com/tokenami/tokenami/pull/401) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- fix canary builds [#405](https://github.com/tokenami/tokenami/pull/405) ([@jjenzz](https://github.com/jjenzz))
- use pr code for canary builds [#404](https://github.com/tokenami/tokenami/pull/404) ([@jjenzz](https://github.com/jjenzz))
- update discord release workflow to use github api for manual release notifications [#403](https://github.com/tokenami/tokenami/pull/403) ([@jjenzz](https://github.com/jjenzz))
- add workflow inputs for manual discord releases [#402](https://github.com/tokenami/tokenami/pull/402) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.75 (Tue Dec 10 2024)

### Release Notes

#### [ds] replace alpha tokens with number type ([#396](https://github.com/tokenami/tokenami/pull/396))

the `--opacity` property now only accepts number values so you aren't restricted to alpha token steps. if you were using the alpha tokens, update them with number values between `0` and `1`.

#### [ds] add `color-space` property for configuring `srgb`, `oklch`, or `oklab` ([#394](https://github.com/tokenami/tokenami/pull/394))

the `--gradient_hd-to-[t|r|b|l|tr|tl|br|bl]` tokens have been removed from the official design system in favour of setting the `--color-space` custom property on a root element.

---

#### 💥 Breaking Change

- [ds] replace alpha tokens with number type [#396](https://github.com/tokenami/tokenami/pull/396) ([@jjenzz](https://github.com/jjenzz))
- [ds] add `color-space` property for configuring `srgb`, `oklch`, or `oklab` [#394](https://github.com/tokenami/tokenami/pull/394) ([@jjenzz](https://github.com/jjenzz))

#### 🚀 Enhancement

- [ds] add `mix-{}-color` and `mix-{}-percent` properties for color opacity, tint, and shade [#395](https://github.com/tokenami/tokenami/pull/395) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- [ds] fix `webkit-search-decoration` pseudo-element selector [#397](https://github.com/tokenami/tokenami/pull/397) ([@pawelblaszczyk5](https://github.com/pawelblaszczyk5))

#### 🏠 Housekeeping

- allow forked prs to run approved canary builds [#398](https://github.com/tokenami/tokenami/pull/398) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 2

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))
- Paweł Błaszczyk ([@pawelblaszczyk5](https://github.com/pawelblaszczyk5))

---

# v0.0.74 (Fri Nov 29 2024)

### Release Notes

#### add support for experimental CSS properties ([#389](https://github.com/tokenami/tokenami/pull/389))

please move any custom properties defined in your `properties` config to the more explicit `customProperties` object in your theme.

---

#### 💥 Breaking Change

- add support for experimental CSS properties [#389](https://github.com/tokenami/tokenami/pull/389) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- fix escaping override in consumer codebases [#390](https://github.com/tokenami/tokenami/pull/390) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.73 (Fri Nov 15 2024)

### Release Notes

#### improve `tokenami.config` type safety ([#383](https://github.com/tokenami/tokenami/pull/383))

any root tokens declared alongside `modes` in your theme object need to be moved inside a `root` object:

```diff
export default createConfig({
  theme: {
    modes: {
      color: {
        'slate-100': '#f1f5f9',
        'slate-700': '#334155',
        'sky-500': '#0ea5e9',
      },
    },
+   root: {
      radii: {
        rounded: '10px',
        circle: '9999px',
        none: 'none',
      },
+   }
  },
});
```

---

#### 💥 Breaking Change

- improve `tokenami.config` type safety [#383](https://github.com/tokenami/tokenami/pull/383) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- fix ast parser error when compose blocks are commented out [#382](https://github.com/tokenami/tokenami/pull/382) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.72 (Sat Nov 09 2024)

#### 🐛 Bug Fix

- apply resets to universal selector [#381](https://github.com/tokenami/tokenami/pull/381) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.71 (Sat Nov 09 2024)

#### 🐛 Bug Fix

- use .js imports in generated env file to support nodenext envs [#379](https://github.com/tokenami/tokenami/pull/379) ([@jjenzz](https://github.com/jjenzz))
- fix arbitrary selectors for descendant elements [#378](https://github.com/tokenami/tokenami/pull/378) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.70 (Sun Oct 20 2024)

#### 🚀 Enhancement

- match theme order for intellisense tokens [#373](https://github.com/tokenami/tokenami/pull/373) ([@jjenzz](https://github.com/jjenzz))
- import `TokenamiProperties` in env file only when used [#372](https://github.com/tokenami/tokenami/pull/372) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- prevent duplicate arbitrary selector styles when including third-party stylesheet [#374](https://github.com/tokenami/tokenami/pull/374) ([@jjenzz](https://github.com/jjenzz))
- fix arbitrary attribute selectors [#371](https://github.com/tokenami/tokenami/pull/371) ([@jjenzz](https://github.com/jjenzz))
- fix negative grid calcs [#370](https://github.com/tokenami/tokenami/pull/370) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- remove redundant custom property [#369](https://github.com/tokenami/tokenami/pull/369) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.69 (Fri Oct 18 2024)

#### 🚀 Enhancement

- [ds] add high definition gradients with oklch [#363](https://github.com/tokenami/tokenami/pull/363) ([@jjenzz](https://github.com/jjenzz))
- [ds] use srgb colour hint for linear gradients [#362](https://github.com/tokenami/tokenami/pull/362) ([@jjenzz](https://github.com/jjenzz))
- [ds] use lightningcss for P3 fallbacks [#361](https://github.com/tokenami/tokenami/pull/361) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- [ds] fix missing clamp types [#364](https://github.com/tokenami/tokenami/pull/364) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.68 (Sun Oct 13 2024)

#### 🐛 Bug Fix

- fix autogenerated `TokenamiProperties` type in `tokenami.env.d.ts` [#359](https://github.com/tokenami/tokenami/pull/359) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.67 (Sun Oct 13 2024)

### Release Notes

#### [ds] limit fluid font sizes to theme tokens ([#354](https://github.com/tokenami/tokenami/pull/354))

If you're using the `--fluid-text-size_*` tokens and related custom properties, the properties accept theme tokens only now. to support this change, the fluid breakpoint tokens have all been renamed with a `-clamp` suffix.

```diff
css({
-  '--font-size': 'var(--fluid-text-size_min-max)',
-  '--fluid-text-size-min': 0.75,
-  '--fluid-text-size-max': 1.125,
+  '--font-size': 'var(--fluid-text-size-clamp_min-max)',
+  '--fluid-text-size-min': 'var(--fluid-text-size_xs)',
+  '--fluid-text-size-max': 'var(--fluid-text-size_lg)',
});
```

---

#### 💥 Breaking Change

- [ds] limit fluid font sizes to theme tokens [#354](https://github.com/tokenami/tokenami/pull/354) ([@jjenzz](https://github.com/jjenzz))

#### 🚀 Enhancement

- add radix p3 colours to design system [#357](https://github.com/tokenami/tokenami/pull/357) ([@jjenzz](https://github.com/jjenzz))
- add nested theme selector support [#356](https://github.com/tokenami/tokenami/pull/356) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.66 (Fri Sep 13 2024)

#### 🚀 Enhancement

- make `css` utility behave more like `tailwind-merge` [#350](https://github.com/tokenami/tokenami/pull/350) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- [ds] add logical aliases for `border-{color|width|style}` [#351](https://github.com/tokenami/tokenami/pull/351) ([@jjenzz](https://github.com/jjenzz))
- make ts plugin error for invalid special chars [#349](https://github.com/tokenami/tokenami/pull/349) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- css util updates [#352](https://github.com/tokenami/tokenami/pull/352) ([@jjenzz](https://github.com/jjenzz))

#### 📝 Documentation

- remove stackblitz from readme [#347](https://github.com/tokenami/tokenami/pull/347) ([@jjenzz](https://github.com/jjenzz))
- add instructions for vscode intellisense settings [#346](https://github.com/tokenami/tokenami/pull/346) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.65 (Sat Sep 07 2024)

#### 🚀 Enhancement

- prevent esm warning in node 22 projects [#345](https://github.com/tokenami/tokenami/pull/345) ([@jjenzz](https://github.com/jjenzz))
- remove unused layers from minified stylesheet [#344](https://github.com/tokenami/tokenami/pull/344) ([@jjenzz](https://github.com/jjenzz))
- [ts-plugin] match detail panel swatch in intellisense for alpha colours [#342](https://github.com/tokenami/tokenami/pull/342) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- fix shorthand overrides for logical properties [#343](https://github.com/tokenami/tokenami/pull/343) ([@jjenzz](https://github.com/jjenzz))
- [ds] fix `border-*` mappings, overrides, and global reset rule [#341](https://github.com/tokenami/tokenami/pull/341) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.64 (Fri Aug 30 2024)

### Release Notes

#### keep radix naming convention for alpha colours ([#338](https://github.com/tokenami/tokenami/pull/338))

if you're using any alpha colours from the new tokenami design system, rename them from `var(--color_{name}{n}a)` to `var(--color_{name}A{n})`.

---

#### 💥 Breaking Change

- keep radix naming convention for alpha colours [#338](https://github.com/tokenami/tokenami/pull/338) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.63 (Fri Aug 30 2024)

#### 🚀 Enhancement

- add light/dark bg color to translucent swatches in intellisense detail [#337](https://github.com/tokenami/tokenami/pull/337) ([@jjenzz](https://github.com/jjenzz))
- make CSS vars inherited by default when equivalent CSS property is inheritable [#335](https://github.com/tokenami/tokenami/pull/335) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- prevent colour swatches in intellisense for number strings (e.g. font-weights) [#336](https://github.com/tokenami/tokenami/pull/336) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.62 (Thu Aug 29 2024)

### Release Notes

#### add official tokenami design system package (`@tokenami/ds`) ([#331](https://github.com/tokenami/tokenami/pull/331))

Tokenami now has a prebuilt design system/theme to help you get up and running quickly 🎉  it features:

- Global reset based on [Preflight from Tailwind](https://unpkg.com/tailwindcss@3.4.4/src/css/preflight.css)
- [Radix UI colours](https://www.radix-ui.com/colors/docs/palette-composition/scales) enabling dark mode by default
- [Fluid spacing and font sizes](https://utopia.fyi/) for responsive design
- Right-to-left support out of the box (`padding-left` becomes `padding-inline-start` etc.)
- Custom aliases for common properties, such as `--p` for `padding` and `--px` for `padding-left` and `padding-right`

Follow the [migration guide](https://github.com/tokenami/tokenami/pull/331) in the PR description to resolve breaking changes in your project.

---

#### 💥 Breaking Change

- add official tokenami design system package (`@tokenami/ds`) [#331](https://github.com/tokenami/tokenami/pull/331) ([@jjenzz](https://github.com/jjenzz))

#### 🚀 Enhancement

- add grid toggle to stylesheet to preserve number property values [#330](https://github.com/tokenami/tokenami/pull/330) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- add `publishConfig` to public packages [#334](https://github.com/tokenami/tokenami/pull/334) ([@jjenzz](https://github.com/jjenzz))
- fix ds package version [#333](https://github.com/tokenami/tokenami/pull/333) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.61 (Sun Aug 18 2024)

#### 🚀 Enhancement

- add support for mixed custom properties and hardcoded values in theme modes [#327](https://github.com/tokenami/tokenami/pull/327) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.60 (Sun Aug 18 2024)

### Release Notes

#### improve ts plugin performance with trie search ([#326](https://github.com/tokenami/tokenami/pull/326))

intellisense behaviour has changed significantly which may seem a little jarring at first. results are chunked so they will update with more specific matches when you type an underscore, similar to typing colon in tailwind. this was necessary to improve intellisense performance for projects with larger themes. 

if you select a result suffixed with underscore, press `CTRL+SPACE` to reopen intellisense with matches at that position.

https://github.com/user-attachments/assets/9c64f791-8480-4a22-9b26-4979851682aa

---

#### 🚀 Enhancement

- improve ts plugin performance with trie search [#326](https://github.com/tokenami/tokenami/pull/326) ([@jjenzz](https://github.com/jjenzz))
- allow partial theme in modes [#325](https://github.com/tokenami/tokenami/pull/325) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- selector support for all custom properties in theme values [#324](https://github.com/tokenami/tokenami/pull/324) ([@jjenzz](https://github.com/jjenzz))
- add global layer [#323](https://github.com/tokenami/tokenami/pull/323) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.59 (Sun Jul 07 2024)

#### 🚀 Enhancement

- add ts plugin colour swatches for custom colour theme keys [#321](https://github.com/tokenami/tokenami/pull/321) ([@jjenzz](https://github.com/jjenzz))
- replace css vars in colors with fallbacks for ts plugin swatches [#320](https://github.com/tokenami/tokenami/pull/320) ([@jjenzz](https://github.com/jjenzz))

#### 📝 Documentation

- shorter demo video [#316](https://github.com/tokenami/tokenami/pull/316) ([@jjenzz](https://github.com/jjenzz))
- comprehensive demo vid [#314](https://github.com/tokenami/tokenami/pull/314) ([@jjenzz](https://github.com/jjenzz))
- add double-dash specificity info [#313](https://github.com/tokenami/tokenami/pull/313) ([@jjenzz](https://github.com/jjenzz))
- improve why double-dash [#312](https://github.com/tokenami/tokenami/pull/312) ([@jjenzz](https://github.com/jjenzz))
- why double-dash section [#311](https://github.com/tokenami/tokenami/pull/311) ([@jjenzz](https://github.com/jjenzz))
- fully typed and static clarity [#310](https://github.com/tokenami/tokenami/pull/310) ([@jjenzz](https://github.com/jjenzz))
- move why section [#308](https://github.com/tokenami/tokenami/pull/308) ([@jjenzz](https://github.com/jjenzz))
- add stackblitz demo to readme [#307](https://github.com/tokenami/tokenami/pull/307) ([@jjenzz](https://github.com/jjenzz))
- fix readme heading [#306](https://github.com/tokenami/tokenami/pull/306) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.58 (Sun Jun 30 2024)

### Release Notes

#### add selector support to custom properties ([#305](https://github.com/tokenami/tokenami/pull/305))

please remove the triple-dash prefix for any custom properties you have defined in the `properties` object of your `tokenami.config` and update usage with a double-dash prefix. custom properties now behave like regular properties to enable selector support.

---

#### 💥 Breaking Change

- add selector support to custom properties [#305](https://github.com/tokenami/tokenami/pull/305) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- recursively generate theme in stylesheet [#304](https://github.com/tokenami/tokenami/pull/304) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.57 (Sat Jun 15 2024)

### Release Notes

#### revert breaking change to known properties config shape ([#302](https://github.com/tokenami/tokenami/pull/302))

this reverts the breaking change in [v0.0.54](https://github.com/tokenami/tokenami/releases/tag/v0.0.54), so it can be ignored. sorry for the messing around today. hoping i've switched this back quickly enough before it impacted anyone 🙈

---

#### 🐛 Bug Fix

- revert breaking change to known properties config shape [#302](https://github.com/tokenami/tokenami/pull/302) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.56 (Fri Jun 14 2024)

#### 🚀 Enhancement

- inherit custom property values [#300](https://github.com/tokenami/tokenami/pull/300) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.55 (Fri Jun 14 2024)

#### 🐛 Bug Fix

- downgrade lightningcss to fix style generation [#299](https://github.com/tokenami/tokenami/pull/299) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.54 (Fri Jun 14 2024)

### Release Notes

#### allow typed custom properties ([#297](https://github.com/tokenami/tokenami/pull/297))

if you are configuring your own `properties` in your `tokenami.config`, please update each property with a double-dash prefix to avoid breaking changes.

---

#### 💥 Breaking Change

- allow typed custom properties [#297](https://github.com/tokenami/tokenami/pull/297) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- intellisense color previews for all color formats [#296](https://github.com/tokenami/tokenami/pull/296) ([@jjenzz](https://github.com/jjenzz))
- fix css package transitive dep [#292](https://github.com/tokenami/tokenami/pull/292) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- upgrade turbo [#295](https://github.com/tokenami/tokenami/pull/295) ([@jjenzz](https://github.com/jjenzz))
- remove redundant `removeSpecialCharEscaping` from ts-plugin [#288](https://github.com/tokenami/tokenami/pull/288) ([@jjenzz](https://github.com/jjenzz))

#### 📝 Documentation

- move typescript CI instructions to typescript section [#298](https://github.com/tokenami/tokenami/pull/298) ([@jjenzz](https://github.com/jjenzz))
- add vue support to readme [#290](https://github.com/tokenami/tokenami/pull/290) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.53 (Sat Jun 01 2024)

#### 🚀 Enhancement

- arbitrary selector support [#283](https://github.com/tokenami/tokenami/pull/283) ([@jjenzz](https://github.com/jjenzz))
- css package size and monorepo improvements [#285](https://github.com/tokenami/tokenami/pull/285) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- add missing `d.cts` type exports [#286](https://github.com/tokenami/tokenami/pull/286) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- improve dev mode orchestration/perf with turborepo [#287](https://github.com/tokenami/tokenami/pull/287) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.52 (Mon May 27 2024)

#### 🚀 Enhancement

- descendant selector support [#284](https://github.com/tokenami/tokenami/pull/284) ([@jjenzz](https://github.com/jjenzz))

#### 📝 Documentation

- add global styles to docs [#278](https://github.com/tokenami/tokenami/pull/278) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.51 (Sun May 26 2024)

#### 🚀 Enhancement

- global styles support in `tokenami.config` [#277](https://github.com/tokenami/tokenami/pull/277) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.50 (Sun May 26 2024)

#### 🚀 Enhancement

- prevent watch mode from exiting on config syntax errors [#275](https://github.com/tokenami/tokenami/pull/275) ([@jjenzz](https://github.com/jjenzz))
- support all browserslist config formats [#276](https://github.com/tokenami/tokenami/pull/276) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.49 (Sat May 25 2024)

#### 🐛 Bug Fix

- loosen `@tokenami/dev` peerDependencies [#274](https://github.com/tokenami/tokenami/pull/274) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.48 (Sat May 25 2024)

#### 🚀 Enhancement

- provide ts errors for invalid selectors with special chars [#273](https://github.com/tokenami/tokenami/pull/273) ([@jjenzz](https://github.com/jjenzz))

#### 🐛 Bug Fix

- include missing quotes in property insert text [#270](https://github.com/tokenami/tokenami/pull/270) ([@jjenzz](https://github.com/jjenzz))
- add support for multiple ampersands in selectors [#269](https://github.com/tokenami/tokenami/pull/269) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- insignificant repo tlc that was bugging me [#271](https://github.com/tokenami/tokenami/pull/271) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.47 (Fri May 17 2024)

#### 🐛 Bug Fix

- allow grid properties to also accept grid values from theme [#267](https://github.com/tokenami/tokenami/pull/267) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.46 (Fri May 10 2024)

#### 🐛 Bug Fix

- add exports to package.json for `@tokenami/config`, `@tokenami/css`, and `@tokenami/dev` [#265](https://github.com/tokenami/tokenami/pull/265) ([@jjenzz](https://github.com/jjenzz))

#### 🏠 Housekeeping

- add `size-limit` action [#264](https://github.com/tokenami/tokenami/pull/264) ([@jjenzz](https://github.com/jjenzz))
- add `size-limit` package [#263](https://github.com/tokenami/tokenami/pull/263) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))

---

# v0.0.45 (Mon Apr 22 2024)

#### 🚀 Enhancement

- replace changesets with auto [#261](https://github.com/tokenami/tokenami/pull/261) ([@jjenzz](https://github.com/jjenzz))

#### Authors: 1

- Jenna Smith ([@jjenzz](https://github.com/jjenzz))
