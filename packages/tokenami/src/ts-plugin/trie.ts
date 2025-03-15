import ts from 'typescript/lib/tsserverlibrary.js';
import TrieSearch from 'trie-search';
import * as TokenamiConfig from '@tokenami/config';
import * as tokenami from '../utils';
import { getSortText, isColorThemeEntry } from './common';

type ModeValues = Record<string, string>;

type ValueCompletionEntry = ts.CompletionEntry & {
  details: { modeValues: ModeValues; themeKey: string };
};

type SelectorCompletionEntry = ts.CompletionEntry & {
  details: { selector: string | string[] };
};

/* -------------------------------------------------------------------------------------------------
 * TrieCompletions
 * -----------------------------------------------------------------------------------------------*/

class TrieCompletions {
  #config: TokenamiConfig.Config;
  #insertFormatter: (name: string) => string;

  // lazily instantiate these to avoid unnecessary memory usage
  #_base?: TrieSearch<ts.CompletionEntry>;
  #_baseCompletions?: ts.CompletionEntry[];
  #_selectors?: TrieSearch<SelectorCompletionEntry>;
  #_selectorSnippets?: TrieSearch<SelectorCompletionEntry>;
  #_selectorSnippetsCompletions?: SelectorCompletionEntry[];
  #_responsiveSelectors?: TrieSearch<SelectorCompletionEntry>;
  #_responsiveSelectorSnippets?: TrieSearch<SelectorCompletionEntry>;
  #_values?: TrieSearch<ValueCompletionEntry>;
  #_valueCompletions?: ValueCompletionEntry[];

  #arbSelectors: Record<string, TrieSearch<SelectorCompletionEntry>> = {};
  #arbResponsiveSelectors: Record<string, TrieSearch<SelectorCompletionEntry>> = {};

  constructor(config: TokenamiConfig.Config, insertFormatter = (name: string) => name) {
    this.#config = config;
    this.#insertFormatter = insertFormatter;
  }

  get #base() {
    return (this.#_base ??= this.#createCompletionEntriesTrie(this.#baseCompletions));
  }

  get #selectors() {
    return (this.#_selectors ??= this.#createCompletionEntriesTrie(this.#getSelectorCompletions()));
  }

  get #selectorSnippets() {
    return (this.#_selectorSnippets ??= this.#createCompletionEntriesTrie(
      this.#selectorSnippetsCompletions
    ));
  }

  get #responsiveSelectors() {
    return (this.#_responsiveSelectors ??= this.#createCompletionEntriesTrie(
      this.#getResponsiveSelectorCompletions()
    ));
  }

  get #responsiveSelectorSnippets() {
    return (this.#_responsiveSelectorSnippets ??= this.#createCompletionEntriesTrie(
      this.#getResponsiveSelectorSnippetCompletions()
    ));
  }

  get #values() {
    return (this.#_values ??= this.#createCompletionEntriesTrie(this.#valueCompletions));
  }

  get #baseCompletions() {
    return (this.#_baseCompletions ??= this.#getBaseCompletions());
  }

  get #selectorSnippetsCompletions() {
    return (this.#_selectorSnippetsCompletions ??= this.#getSelectorSnippetCompletions());
  }

  get #valueCompletions() {
    return (this.#_valueCompletions ??= this.#getValueCompletions());
  }

  propertySearch(search: string) {
    const input = this.#createTrieInput(search);

    if (input.length > 0) {
      const baseEntries = this.#base.search(input);
      const variantEntries = this.variantSearch(search);
      return [...baseEntries, ...variantEntries];
    } else {
      return [...this.#baseCompletions, ...this.#selectorSnippetsCompletions];
    }
  }

  variantSearch(search: string) {
    const input = this.#createTrieInput(search);
    const parts = TokenamiConfig.getTokenPropertySplit(search as any);

    if (!parts.variants.length) return this.#selectorSnippets.search(input);
    if (parts.variants.length > 1) return this.#responsiveSelectorsSearch(input, parts.variants);

    const selectors = this.#selectorsSearch(input, parts.variants);
    const snippets = this.#responsiveSelectorSnippets.search(input);
    return [...selectors, ...snippets];
  }

  valueSearch(search: string) {
    const input = this.#createTrieInput(search);

    // we kill these to avoid having lots of tries in memory
    this.#arbSelectors = {};
    this.#arbResponsiveSelectors = {};

    if (input.length > 0) {
      return this.#values.search(input);
    } else {
      return this.#valueCompletions;
    }
  }

  #selectorsSearch(input: string, variants: string[]) {
    const [_, arbSelector] = input.match(/\{(.*)\}/) ?? [];
    if (!arbSelector) return this.#selectors.search(input);

    const key = String(variants);
    this.#arbSelectors[key] ??= this.#createCompletionEntriesTrie(
      this.#getSelectorCompletions(arbSelector)
    );

    return this.#arbSelectors[key]!.search(input);
  }

  #responsiveSelectorsSearch(input: string, variants: string[]) {
    const [_, arbSelector] = input.match(/\{(.*)\}/) ?? [];
    if (!arbSelector) return this.#responsiveSelectors.search(input);

    const key = String(variants);
    this.#arbResponsiveSelectors[key] ??= this.#createCompletionEntriesTrie(
      this.#getResponsiveSelectorCompletions(arbSelector)
    );

    return this.#arbResponsiveSelectors[key]!.search(input);
  }

  #createTrieInput(search: string) {
    return getSortText(search).replace('$', '');
  }

  #createCompletionEntriesTrie<T extends ts.CompletionEntry | SelectorCompletionEntry>(
    entries: T[]
  ) {
    const trie = new TrieSearch<T>('sortText', { splitOnRegEx: /\$/g, expandRegexes: [] });
    trie.addAll(entries);
    return trie;
  }

  #getBaseCompletions(): ts.CompletionEntry[] {
    const properties = this.#getAllProperties();
    return properties.map((property) => {
      const name = TokenamiConfig.tokenProperty(property);
      return this.#createPropertyEntry(name, getSortText(`$${name}`));
    });
  }

  #getSelectorCompletions(arbSelector?: string): SelectorCompletionEntry[] {
    const entries = this.#getSelectorEntries(arbSelector).concat(this.#getResponsiveEntries());
    const properties = this.#getAllProperties();
    return properties.flatMap((property) => {
      const create = this.#createVariantPropertyEntry(property);
      return entries.map(create);
    });
  }

  #getSelectorSnippetCompletions(): SelectorCompletionEntry[] {
    const entries = this.#getSelectorEntries().concat(this.#getResponsiveEntries());
    const create = this.#createVariantPropertyEntry('');
    return entries.map(create);
  }

  #getResponsiveSelectorCompletions(arbSelector?: string): SelectorCompletionEntry[] {
    const entries = this.#getResponsiveSelectorEntries(arbSelector);
    const properties = this.#getAllProperties();
    return properties.flatMap((property) => {
      const create = this.#createVariantPropertyEntry(property);
      return entries.map(create);
    });
  }

  #getResponsiveSelectorSnippetCompletions(): SelectorCompletionEntry[] {
    const entries = this.#getResponsiveSelectorEntries();
    const create = this.#createVariantPropertyEntry('');
    return entries.map(create);
  }

  #getValueCompletions(): ValueCompletionEntry[] {
    const entries = tokenami.getValidValues(this.#config);

    return entries.map(([themeKey, token], tokenIndex) => {
      const entryName = TokenamiConfig.tokenValue(themeKey, token);
      const parts = TokenamiConfig.getTokenValueParts(entryName);
      const modeValues = tokenami.getThemeValuesByThemeMode(entryName, this.#config.theme);
      const name = `$${parts.token}`;
      return {
        name,
        kind: ts.ScriptElementKind.string,
        kindModifiers: isColorThemeEntry(modeValues) ? 'color' : parts.themeKey,
        sortText: getSortText(`${tokenIndex}${name}`),
        insertText: this.#insertFormatter(entryName),
        labelDetails: { detail: '', description: entryName },
        details: { modeValues, themeKey: parts.themeKey },
      };
    });
  }

  #getResponsiveEntries() {
    return Object.entries(this.#config.responsive || {});
  }

  #getResponsiveSelectorEntries(arbSelector?: string) {
    const selectorEntries = this.#getSelectorEntries(arbSelector);
    const responsiveEntries = this.#getResponsiveEntries();
    const responsiveSelectorEntries = responsiveEntries.flatMap(
      ([responsiveSelector, responsiveValue]) => {
        return selectorEntries.map(([selector, value]) => {
          const combinedSelector = `${responsiveSelector}_${selector}`;
          const combinedValue = [responsiveValue].concat(value);
          return [combinedSelector, combinedValue] as [string, string | string[]];
        });
      }
    );
    return responsiveSelectorEntries;
  }

  #getSelectorEntries(arbSelector = '') {
    const configSelectorEntries = Object.entries(this.#config.selectors || {});
    return configSelectorEntries.concat([[`{${arbSelector}}`, '']]);
  }

  #getAllProperties() {
    return Array.from(tokenami.getValidProperties(this.#config));
  }

  #createVariantPropertyEntry(property: string) {
    return ([selectorName, selector]: [string, string | string[]]): SelectorCompletionEntry => {
      const name = TokenamiConfig.variantProperty(selectorName, property);
      const isSnippet = name.includes('{}');
      const entry = isSnippet
        ? this.#createPropertySnippetEntry(name)
        : this.#createPropertyEntry(name);
      return { ...entry, details: { selector } };
    };
  }

  #createPropertySnippetEntry(name: string, sortText = getSortText(name)) {
    const entry = this.#createPropertyEntry(name, sortText);
    const insertText = entry.name.replace('{}', '{${1}}');
    return { ...entry, insertText, isSnippet: true };
  }

  #createPropertyEntry(name: string, sortText = getSortText(name)) {
    const kind = ts.ScriptElementKind.memberVariableElement;
    const kindModifiers = ts.ScriptElementKindModifier.optionalModifier;
    return { name, kind, kindModifiers, sortText, insertText: this.#insertFormatter(name) };
  }
}

/* ---------------------------------------------------------------------------------------------- */

export { TrieCompletions };
