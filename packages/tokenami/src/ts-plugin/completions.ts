import ts from 'typescript/lib/tsserverlibrary.js';
import * as TokenamiConfig from '@tokenami/config';
import * as tokenami from '../utils';
import { isColorThemeEntry } from './common';
import { Logger } from './logger';

type ModeValues = Record<string, string>;

interface CompletionEntry extends ts.CompletionEntry {
  insertText: string;
}

interface SelectorCompletionEntry extends CompletionEntry {
  details: { selector: string | string[] };
}

interface ValueCompletionEntry extends CompletionEntry {
  details: { modeValues: ModeValues; themeKey: string };
}

type CompletionEntries = { [entryName: string]: CompletionEntry };
type SelectorCompletionEntries = { [entryName: string]: SelectorCompletionEntry };
type ValueCompletionEntries = {
  [originalEntryName: string]: {
    [entryName: string]: ValueCompletionEntry;
  };
};

/* -------------------------------------------------------------------------------------------------
 * TokenamiCompletions
 * -----------------------------------------------------------------------------------------------*/

type TokenamiCompletionsContext = {
  insertFormatter?: (name: string) => string;
  logger: Logger;
};

class TokenamiCompletions {
  #ctx: Required<TokenamiCompletionsContext>;
  #config: TokenamiConfig.Config;
  #selectorEntries: [string, TokenamiConfig.Selector][];
  #responsiveEntries: [string, string][];

  // lazily instantiate and cache these
  #_base?: CompletionEntries;
  #_values?: ValueCompletionEntries;
  #_selectorSnippets?: SelectorCompletionEntries;
  #_responsiveSelectorSnippets?: SelectorCompletionEntries;
  #_responsiveArbitrarySelectorSnippets?: SelectorCompletionEntries;
  #_validProperties: string[];
  #_validTokenValues: (readonly [string, string])[];

  constructor(config: TokenamiConfig.Config, context: TokenamiCompletionsContext) {
    this.#config = config;
    this.#ctx = { ...context, insertFormatter: context.insertFormatter ?? ((name) => name) };
    this.#_validProperties = Array.from(tokenami.getValidProperties(this.#config));
    this.#_validTokenValues = tokenami.getValidValues(this.#config);
    this.#selectorEntries = Object.entries(this.#config.selectors || {});
    this.#responsiveEntries = Object.entries(this.#config.responsive || {});
  }

  get #base() {
    return (this.#_base ??= this.#getBaseCompletions());
  }

  get #values() {
    return (this.#_values ??= this.#getValueCompletions());
  }

  get #selectorSnippets() {
    return (this.#_selectorSnippets ??= this.#getSelectorSnippetCompletions());
  }

  get #responsiveSelectorSnippets() {
    if (this.#_responsiveSelectorSnippets) return this.#_responsiveSelectorSnippets;
    const selectorConfig = this.#getSelectorConfigEntries();
    const completions = this.#getResponsiveSelectorSnippetCompletions(selectorConfig);
    this.#_responsiveSelectorSnippets = completions;
    return completions;
  }

  get #responsiveArbitrarySelectorSnippets() {
    if (this.#_responsiveArbitrarySelectorSnippets)
      return this.#_responsiveArbitrarySelectorSnippets;
    const selectorConfig = [[`{}`, '']] as [string, string][];
    const completions = this.#getResponsiveSelectorSnippetCompletions(selectorConfig);
    this.#_responsiveArbitrarySelectorSnippets = completions;
    return completions;
  }

  propertySearch(input: string): CompletionEntries {
    const variantResults = this.variantSearch(input);
    if (input.includes('_')) return variantResults;
    return { ...this.#base, ...variantResults };
  }

  valueSearch(original: ts.CompletionEntry[]): ValueCompletionEntries[string] {
    let result: ValueCompletionEntries[string] = {};

    for (const entry of original) {
      const valueByEntryName = this.#values[entry.name.replace(/['"]/g, '')];
      if (valueByEntryName) Object.assign(result, valueByEntryName);
    }

    return result;
  }

  variantSearch(input: string): SelectorCompletionEntries {
    const parts = TokenamiConfig.getTokenPropertySplit(input as any);

    if (!parts.variants.length) {
      return { ...this.#selectorSnippets, ...this.#responsiveArbitrarySelectorSnippets };
    }

    if (parts.variants.length === 1) {
      const search = this.#selectorsSearch(input, parts.alias, parts.variants);
      return Object.assign(search, this.#responsiveSelectorSnippets);
    }

    return this.#responsiveSelectorsSearch(input, parts.alias, parts.variants);
  }

  #arbitrarySelectorRegex = /\{(.*)\}/;
  #getArbitrarySelector(input: string) {
    return input.match(this.#arbitrarySelectorRegex)?.[1];
  }

  #selectorsSearch(input: string, alias: string, variants: string[]) {
    const arbSelector = this.#getArbitrarySelector(input);
    return this.#getSelectorCompletions(alias, variants, arbSelector);
  }

  #responsiveSelectorsSearch(input: string, alias: string, variants: string[]) {
    const arbSelector = this.#getArbitrarySelector(input);
    const selectorConfig = this.#getSelectorConfigEntries(variants, arbSelector);
    return this.#getResponsiveSelectorCompletions(alias, variants, selectorConfig);
  }

  #matchSearch(input: string, entryName: string): boolean {
    const searchEntryName = entryName.replaceAll('-', '');
    const searchInput = input.replaceAll('-', '');
    if (searchEntryName.startsWith(searchInput)) return true;
    const index = searchEntryName.indexOf(searchInput);
    return index > 0 && entryName[index] === '-';
  }

  #createSortText(name: string) {
    const sortText = name.replace(/[0-9]+/g, (m) => m.padStart(6, '0')).replaceAll('-', '');
    return `$${sortText}`;
  }

  #getBaseCompletions(): CompletionEntries {
    const result: CompletionEntries = {};
    for (const property of this.#_validProperties) {
      const name = TokenamiConfig.tokenProperty(property);
      const entry = this.#createPropertyEntry(name, this.#createSortText(`$${name}`));
      result[entry.name] = entry;
    }
    return result;
  }

  #getSelectorCompletions(
    alias: string,
    variants: string[],
    arbSelector?: string
  ): SelectorCompletionEntries {
    const responsiveConfig = this.#getResponsiveConfigEntries(variants);
    const selectorConfig = this.#getSelectorConfigEntries(variants, arbSelector);
    const result: SelectorCompletionEntries = {};

    for (const property of this.#_validProperties) {
      if (!this.#matchSearch(alias, property)) continue;
      const create = this.#createVariantPropertyEntry(property);

      for (const [selector, value] of selectorConfig) {
        const entry = create([selector, value]);
        result[entry.name] = entry;
      }

      for (const [selector, value] of responsiveConfig) {
        const entry = create([selector, value]);
        result[entry.name] = entry;
      }
    }

    return result;
  }

  #getResponsiveSelectorCompletions(
    alias: string,
    variants: string[],
    selectorConfig: [string, string | string[]][]
  ): SelectorCompletionEntries {
    const responsiveSelectors = this.#getResponsiveSelectorConfigEntries(selectorConfig, variants);
    const result: SelectorCompletionEntries = {};

    for (const property of this.#_validProperties) {
      if (!this.#matchSearch(alias, property)) continue;
      const create = this.#createVariantPropertyEntry(property);

      for (const [selector, value] of responsiveSelectors) {
        const entry = create([selector, value]);
        result[entry.name] = entry;
      }
    }

    return result;
  }

  #getSelectorSnippetCompletions(): SelectorCompletionEntries {
    const responsiveConfig = this.#getResponsiveConfigEntries();
    const selectorConfig = this.#getSelectorConfigEntries();
    const create = this.#createVariantPropertyEntry(null);
    const result: SelectorCompletionEntries = {};

    for (const [selector, value] of selectorConfig) {
      const entry = create([selector, value]);
      result[entry.name] = entry;
    }

    for (const [selector, value] of responsiveConfig) {
      const entry = create([selector, value]);
      result[entry.name] = entry;
    }

    return result;
  }

  #getResponsiveSelectorSnippetCompletions(
    selectorConfig: [string, string | string[]][]
  ): SelectorCompletionEntries {
    const entries = this.#getResponsiveSelectorConfigEntries(selectorConfig);
    const create = this.#createVariantPropertyEntry(null);
    const result: SelectorCompletionEntries = {};

    for (const [selector, value] of entries) {
      const entry = create([selector, value]);
      result[entry.name] = entry;
    }

    return result;
  }

  #getValueCompletions(): ValueCompletionEntries {
    const result: ValueCompletionEntries = {};

    for (const [index, value] of this.#_validTokenValues.entries()) {
      const [themeKey, token] = value;
      const entryName = TokenamiConfig.tokenValue(themeKey, token);
      const parts = TokenamiConfig.getTokenValueParts(entryName);
      const modeValues = tokenami.getThemeValuesByThemeMode(entryName, this.#config.theme);
      const name = `$${parts.token}`;

      result[entryName] ??= {};
      result[entryName]![name] = {
        name,
        kind: ts.ScriptElementKind.string,
        kindModifiers: isColorThemeEntry(modeValues) ? 'color' : parts.themeKey,
        sortText: this.#createSortText(`${index}${entryName}`),
        insertText: this.#ctx.insertFormatter(entryName),
        labelDetails: { detail: '', description: entryName },
        details: { modeValues, themeKey: parts.themeKey },
      };
    }

    return result;
  }

  #getSelectorConfigEntries(variants?: string[], arbSelector = '') {
    const selectorConfig = this.#selectorEntries.concat([[`{${arbSelector}}`, '']]);
    if (!variants) return selectorConfig;
    const variantSet = new Set(variants);
    return selectorConfig.filter(([k]) => variantSet.has(k));
  }

  #getResponsiveConfigEntries(variants?: string[]) {
    if (!variants) return this.#responsiveEntries;
    const variantSet = new Set(variants);
    return this.#responsiveEntries.filter(([k]) => variantSet.has(k));
  }

  #getResponsiveSelectorConfigEntries(
    selectorConfig: [string, TokenamiConfig.Selector][],
    variants?: string[]
  ) {
    const responsiveConfig = this.#getResponsiveConfigEntries(variants);
    const result: [string, TokenamiConfig.Selector][] = [];

    for (const [responsiveSelector, responsiveValue] of responsiveConfig) {
      for (const [selector, value] of selectorConfig) {
        result.push([`${responsiveSelector}_${selector}`, [responsiveValue].concat(value)]);
      }
    }

    return result;
  }

  #createVariantPropertyEntry(property: string | null) {
    return ([selectorName, selector]: [
      string,
      TokenamiConfig.Selector
    ]): SelectorCompletionEntry => {
      const name = TokenamiConfig.variantProperty(selectorName, property ?? '');
      const isArbitrary = name.includes('{}');
      const propertyEntry = isArbitrary
        ? this.#createAribitraryPropertyEntry(name)
        : this.#createPropertyEntry(name);
      return { ...propertyEntry, details: { selector } };
    };
  }

  #createAribitraryPropertyEntry(
    name: string,
    sortText = this.#createSortText(name)
  ): CompletionEntry {
    const entry = this.#createPropertyEntry(name, sortText);
    const insertText = entry.name.replace('{}', '{${1}}');
    return { ...entry, insertText, isSnippet: true };
  }

  #createPropertyEntry(name: string, sortText = this.#createSortText(name)): CompletionEntry {
    const kind = ts.ScriptElementKind.memberVariableElement;
    const kindModifiers = ts.ScriptElementKindModifier.optionalModifier;
    return {
      name,
      kind,
      kindModifiers,
      sortText,
      insertText: this.#ctx.insertFormatter(name),
    };
  }
}

/* ---------------------------------------------------------------------------------------------- */

export { TokenamiCompletions };
