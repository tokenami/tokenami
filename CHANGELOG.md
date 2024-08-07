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
