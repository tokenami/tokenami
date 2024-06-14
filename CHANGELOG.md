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
