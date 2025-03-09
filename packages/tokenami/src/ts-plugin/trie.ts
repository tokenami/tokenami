import ts from 'typescript/lib/tsserverlibrary';
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
  #base: TrieSearch<ts.CompletionEntry>;
  #baseCompletions: ts.CompletionEntry[];
  #selectors: TrieSearch<SelectorCompletionEntry>;
  #selectorSnippets: TrieSearch<SelectorCompletionEntry>;
  #selectorSnippetsCompletions: SelectorCompletionEntry[];
  #responsiveSelectors: TrieSearch<SelectorCompletionEntry>;
  #responsiveSelectorSnippets: TrieSearch<SelectorCompletionEntry>;
  #values: TrieSearch<ValueCompletionEntry>;
  #valueCompletions: ValueCompletionEntry[];
  #insertFormatter: (name: string) => string;

  constructor(config: TokenamiConfig.Config, insertFormatter = (name: string) => name) {
    this.#config = config;
    this.#insertFormatter = insertFormatter;

    const baseCompletions = this.#getBaseCompletions();
    this.#base = this.#createCompletionEntriesTrie(baseCompletions);
    this.#baseCompletions = baseCompletions;

    const selectorCompletions = this.#getSelectorCompletions();
    this.#selectors = this.#createCompletionEntriesTrie(selectorCompletions);

    const selectorSnippetCompletions = this.#getSelectorSnippetCompletions();
    this.#selectorSnippets = this.#createCompletionEntriesTrie(selectorSnippetCompletions);
    this.#selectorSnippetsCompletions = selectorSnippetCompletions;

    const responsiveSelectorCompletions = this.#getResponsiveSelectorCompletions();
    this.#responsiveSelectors = this.#createCompletionEntriesTrie(responsiveSelectorCompletions);

    const responsiveSelectorSnippetCompletions = this.#getResponsiveSelectorSnippetCompletions();
    this.#responsiveSelectorSnippets = this.#createCompletionEntriesTrie(
      responsiveSelectorSnippetCompletions
    );

    const valueCompletions = this.#getValueCompletions();
    this.#values = this.#createCompletionEntriesTrie(valueCompletions);
    this.#valueCompletions = valueCompletions;
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
    if (parts.variants.length > 1) return this.#responsiveSelectors.search(input);

    const selectors = this.#selectors.search(input);
    const snippets = this.#responsiveSelectorSnippets.search(input);
    return [...selectors, ...snippets];
  }

  valueSearch(search: string) {
    const input = this.#createTrieInput(search);

    if (input.length > 0) {
      return this.#values.search(input);
    } else {
      return this.#valueCompletions;
    }
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
      return this.#createPropertyEntry(name);
    });
  }

  #getSelectorCompletions(): SelectorCompletionEntry[] {
    const entries = this.#getSelectorEntries().concat(this.#getResponsiveEntries());
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

  #getResponsiveSelectorCompletions(): SelectorCompletionEntry[] {
    const entries = this.#getResponsiveSelectorEntries();
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

  #getResponsiveSelectorEntries() {
    const selectorEntries = this.#getSelectorEntries();
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

  #getSelectorEntries() {
    const configSelectorEntries = Object.entries(this.#config.selectors || {});
    return configSelectorEntries.concat([['{}', '']]);
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
