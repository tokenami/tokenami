import tslib from 'typescript/lib/tsserverlibrary';
import TrieSearch from 'trie-search';
import * as culori from 'culori';
import * as TokenamiConfig from '@tokenami/config';
import * as Tokenami from '@tokenami/dev';

const INVALID_PROPERTY_ERROR_CODE = 2353;
const INVALID_VALUE_ERROR_CODE = 2322;

type EntryConfigItem = {
  kind: tslib.ScriptElementKind;
  kindModifiers: string;
  value?: string | string[];
  modeValues?: Record<string, string>;
  themeKey?: string;
};

type CompletionEntry = Omit<tslib.CompletionEntry, 'kindModifiers'> & { kindModifiers: string };

function init(modules: { typescript: typeof tslib }) {
  const ts = modules.typescript;
  let entryConfigMap = new Map<string, EntryConfigItem>();

  /* -------------------------------------------------------------------------------------------------
   * getAllProperties
   * -----------------------------------------------------------------------------------------------*/

  function getAllProperties(config: TokenamiConfig.Config) {
    const properties = new Set([
      ...Tokenami.supportedProperties,
      ...Object.keys(config.properties || {}),
      ...Object.keys(config.aliases || {}),
    ]);
    return Array.from(properties);
  }

  /* -------------------------------------------------------------------------------------------------
   * getSelectorEntries
   * -----------------------------------------------------------------------------------------------*/

  function getSelectorEntries(config: TokenamiConfig.Config) {
    const configSelectorEntries = Object.entries(config.selectors || {});
    return configSelectorEntries.concat([['{}', '']]);
  }

  /* -------------------------------------------------------------------------------------------------
   * getResponsiveEntries
   * -----------------------------------------------------------------------------------------------*/

  function getResponsiveEntries(config: TokenamiConfig.Config) {
    return Object.entries(config.responsive || {});
  }

  /* -------------------------------------------------------------------------------------------------
   * getResponsiveSelectorEntries
   * -----------------------------------------------------------------------------------------------*/

  function getResponsiveSelectorEntries(config: TokenamiConfig.Config) {
    const selectorEntries = getSelectorEntries(config);
    const responsiveEntries = getResponsiveEntries(config);
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

  /* -------------------------------------------------------------------------------------------------
   * getSelectorCompletions
   * -----------------------------------------------------------------------------------------------*/

  function getSelectorCompletions(
    config: TokenamiConfig.Config,
    quote?: string
  ): CompletionEntry[] {
    const entries = getSelectorEntries(config).concat(getResponsiveEntries(config));
    const properties = getAllProperties(config);
    return properties.flatMap((property) => {
      const create = createVariantPropertyEntry(property, quote);
      return entries.map(create);
    });
  }

  /* -------------------------------------------------------------------------------------------------
   * getResponsiveSelectorCompletions
   * -----------------------------------------------------------------------------------------------*/

  function getResponsiveSelectorCompletions(
    config: TokenamiConfig.Config,
    quote?: string
  ): CompletionEntry[] {
    const entries = getResponsiveSelectorEntries(config);
    const properties = getAllProperties(config);
    return properties.flatMap((property) => {
      const create = createVariantPropertyEntry(property, quote);
      return entries.map(create);
    });
  }

  /* -------------------------------------------------------------------------------------------------
   * getSelectorSnippetCompletions
   * -----------------------------------------------------------------------------------------------*/

  function getSelectorSnippetCompletions(
    config: TokenamiConfig.Config,
    quote?: string
  ): CompletionEntry[] {
    const entries = getSelectorEntries(config).concat(getResponsiveEntries(config));
    const create = createVariantPropertyEntry('', quote);
    return entries.map(create);
  }

  /* -------------------------------------------------------------------------------------------------
   * getResponsiveSelectorSnippetCompletions
   * -----------------------------------------------------------------------------------------------*/

  function getResponsiveSelectorSnippetCompletions(
    config: TokenamiConfig.Config,
    quote?: string
  ): CompletionEntry[] {
    const entries = getResponsiveSelectorEntries(config);
    const create = createVariantPropertyEntry('', quote);
    return entries.map(create);
  }

  /* -------------------------------------------------------------------------------------------------
   * createSelectorSnippetTrie
   * -----------------------------------------------------------------------------------------------*/

  const createSelectorSnippetTrie = (config: TokenamiConfig.Config) => {
    const completions = getSelectorSnippetCompletions(config);
    const quotedCompletions = getSelectorSnippetCompletions(config, '"');
    return {
      unquoted: createCompletionEntriesTrie(completions),
      quoted: createCompletionEntriesTrie(quotedCompletions),
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * createResponsiveSelectorSnippetTrie
   * -----------------------------------------------------------------------------------------------*/

  const createResponsiveSelectorSnippetTrie = (config: TokenamiConfig.Config) => {
    const completions = getResponsiveSelectorSnippetCompletions(config);
    const quotedCompletions = getResponsiveSelectorSnippetCompletions(config, '"');
    return {
      unquoted: createCompletionEntriesTrie(completions),
      quoted: createCompletionEntriesTrie(quotedCompletions),
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * createSelectorTrie
   * -----------------------------------------------------------------------------------------------*/

  const createSelectorTrie = (config: TokenamiConfig.Config) => {
    const completions = getSelectorCompletions(config);
    const quotedCompletions = getSelectorCompletions(config, '"');
    return {
      unquoted: createCompletionEntriesTrie(completions),
      quoted: createCompletionEntriesTrie(quotedCompletions),
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * createResponsiveSelectorTrie
   * -----------------------------------------------------------------------------------------------*/

  const createResponsiveSelectorTrie = (config: TokenamiConfig.Config) => {
    const completions = getResponsiveSelectorCompletions(config);
    const quotedCompletions = getResponsiveSelectorCompletions(config, '"');
    return {
      unquoted: createCompletionEntriesTrie(completions),
      quoted: createCompletionEntriesTrie(quotedCompletions),
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * createCompletionEntriesTrie
   * -----------------------------------------------------------------------------------------------*/

  const createCompletionEntriesTrie = (
    items: tslib.CompletionEntry[]
  ): TrieSearch<tslib.CompletionEntry> => {
    const trie = new TrieSearch<tslib.CompletionEntry>('sortText', {
      splitOnRegEx: /\$/g,
      expandRegexes: [],
    });

    trie.addAll(items);
    return trie;
  };

  /* ---------------------------------------------------------------------------------------------
   * createVariantPropertyEntry
   * -------------------------------------------------------------------------------------------*/

  const createVariantPropertyEntry = (property: string, quote = '') => {
    return ([selector, value]: [string, string | string[]]): CompletionEntry => {
      const tokenProperty = TokenamiConfig.variantProperty(selector, property);
      const name = `${quote}${tokenProperty}${quote}`;
      const isSnippet = name.includes('{}');
      const entry = isSnippet ? createPropertySnippetEntry(name) : createPropertyEntry(name);
      updateEntryDetailsConfig({ ...entry, value });
      return entry;
    };
  };

  /* -------------------------------------------------------------------------------------------------
   * createPropertyEntry
   * -----------------------------------------------------------------------------------------------*/

  const createPropertyEntry = (name: string, sortText = getSortText(name)): CompletionEntry => {
    const kind = tslib.ScriptElementKind.memberVariableElement;
    const kindModifiers = tslib.ScriptElementKindModifier.optionalModifier;
    return { name, kind, kindModifiers, sortText, insertText: name };
  };

  /* -------------------------------------------------------------------------------------------------
   * createPropertySnippetEntry
   * -----------------------------------------------------------------------------------------------*/

  const createPropertySnippetEntry = (
    name: string,
    sortText = getSortText(name)
  ): CompletionEntry => {
    const entry = createPropertyEntry(name, sortText);
    const insertText = entry.name.replace('{}', '{${1}}');
    return { ...entry, insertText, isSnippet: true };
  };

  /* -------------------------------------------------------------------------------------------------
   * getSortText
   * -----------------------------------------------------------------------------------------------*/

  const getSortText = (name: string): `$${string}` => {
    const regex = new RegExp(`['"-]|${TokenamiConfig.tokenProperty('')}`, 'g');
    name = name.replace(regex, '').replace(/[0-9]+/g, (m) => m.padStart(6, '0'));
    return `$${name}`;
  };

  /* -----------------------------------------------------------------------------------------------
   * updateEntryDetailsConfig
   * ---------------------------------------------------------------------------------------------*/

  function updateEntryDetailsConfig(params: EntryConfigItem & { name: string }) {
    const { name, ...config } = params;
    entryConfigMap.set(params.name, config);
  }

  /* -----------------------------------------------------------------------------------------------
   * getEntryDetailsConfig
   * ---------------------------------------------------------------------------------------------*/

  function getEntryDetailsConfig(name: string) {
    return entryConfigMap.get(name);
  }

  /* -------------------------------------------------------------------------------------------------
   * getBaseResults
   * -----------------------------------------------------------------------------------------------*/

  function getBaseResults(entries: tslib.CompletionEntry[], search: string) {
    const baseTrie = createCompletionEntriesTrie(entries);
    return baseTrie.search(search);
  }

  /* -------------------------------------------------------------------------------------------------
   * isQuoted
   * -----------------------------------------------------------------------------------------------*/

  function isQuoted(node: tslib.Node) {
    return ts.isStringLiteral(node);
  }

  /* -----------------------------------------------------------------------------------------------
   * findNodeAtPosition
   * ---------------------------------------------------------------------------------------------*/

  function findNodeAtPosition(sourceFile: tslib.SourceFile, position: number) {
    function find(node: tslib.Node): tslib.Node | undefined {
      if (position >= node.getStart(sourceFile) && position < node.getEnd()) {
        return ts.forEachChild(node, find) || node;
      }
    }
    return find(sourceFile);
  }

  /* -------------------------------------------------------------------------------------------------
   * getInputAtPosition
   * -----------------------------------------------------------------------------------------------*/

  const getInputAtPosition = (node: tslib.Node, position: number) => {
    let input = node.getText();

    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        const start = property.getStart();
        const end = property.getEnd();
        if (start <= position && position <= end) {
          input = property.getText();
        }
      }
    }

    return input.replace(/'|"/g, '');
  };

  /* -----------------------------------------------------------------------------------------------
   * createTextSpanFromNode
   * ---------------------------------------------------------------------------------------------*/

  function createTextSpanFromNode(node: tslib.Node): tslib.TextSpan {
    return { start: node.getStart(), length: node.getEnd() - node.getStart() };
  }

  /* ---------------------------------------------------------------------------------------------
   * shouldSuppressDiagnosticForNode
   * -------------------------------------------------------------------------------------------*/

  function shouldSuppressDiagnosticForNode(
    node: tslib.Node,
    sourceFile: tslib.SourceFile
  ): boolean {
    const lineStarts = sourceFile.getLineStarts();
    const nodeStartPos = node.getStart(sourceFile);
    const nodeStartLine = sourceFile.getLineAndCharacterOfPosition(nodeStartPos).line;
    if (nodeStartLine > 0) {
      const previousLineStartPos = lineStarts[nodeStartLine - 1] || 0;
      const previousLineEndPos = lineStarts[nodeStartLine] || 0;
      const previousLineText = sourceFile.text.substring(previousLineStartPos, previousLineEndPos);
      return /\/\/ @ts-ignore/.test(previousLineText);
    }
    return false;
  }

  /* ---------------------------------------------------------------------------------------------
   * transformBasePropertyEntry
   * -------------------------------------------------------------------------------------------*/

  function transformBasePropertyEntry(entry: tslib.CompletionEntry): tslib.CompletionEntry | null {
    const property = TokenamiConfig.TokenProperty.safeParse(entry.name);
    if (!property.success) return null;
    const sortText = `$${getSortText(entry.name)}`;
    return { ...entry, sortText, insertText: entry.name };
  }

  /* ---------------------------------------------------------------------------------------------
   * transformTokenValueEntry
   * -------------------------------------------------------------------------------------------*/

  function transformTokenValueEntry(
    entry: tslib.CompletionEntry,
    config: TokenamiConfig.Config
  ): tslib.CompletionEntry {
    const entryName = entry.name;
    const property = TokenamiConfig.TokenValue.safeParse(entryName);
    if (!property.success) return entry;

    const parts = TokenamiConfig.getTokenValueParts(property.output);
    const modeValues = Tokenami.getThemeValuesByThemeMode(property.output, config.theme);
    if (!Object.entries(modeValues).length) return entry;

    const name = `$${parts.token}`;
    const kindModifiers = isColorThemeEntry(modeValues) ? 'color' : parts.themeKey;
    const sortText = getSortText(entryName);
    const labelDetails = { detail: '', description: entryName };
    const insertText = entryName;
    const nextEntry = { ...entry, name, sortText, kindModifiers, insertText, labelDetails };
    updateEntryDetailsConfig({ ...nextEntry, themeKey: parts.themeKey, modeValues });
    return nextEntry;
  }

  /* -------------------------------------------------------------------------------------------------
   * updateEnvFile
   * -----------------------------------------------------------------------------------------------*/

  function updateEnvFile(configPath: string, config: TokenamiConfig.Config) {
    const envFilePath = Tokenami.getTypeDefsPath(configPath);
    const envFileContent = ts.sys.readFile(envFilePath, 'utf-8');
    if (!envFileContent) throw new Error('Cannot read tokenami.env.d.ts file');

    const properties = Object.keys(config.properties || {});
    const customProperties = properties.flatMap((property) => {
      const supported = Tokenami.supportedProperties.has(property as any);
      return supported ? [] : [`TokenProperties<'${property}'>`];
    });

    const updatedEnvFileContent = !customProperties.length
      ? Tokenami.generateTypeDefs(configPath, '../stubs/tokenami.env.d.ts')
      : Tokenami.generateTypeDefs(configPath, '../stubs/tokenami.env-custom.d.ts').replace(
          'interface TokenamiProperties {',
          `interface TokenamiProperties extends ${customProperties.join(', ')} {`
        );

    ts.sys.writeFile(envFilePath, updatedEnvFileContent);
  }

  /* -----------------------------------------------------------------------------------------------
   * create
   * ---------------------------------------------------------------------------------------------*/

  function create(info: tslib.server.PluginCreateInfo) {
    // Set up decorator object
    const proxy: tslib.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof tslib.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const logger = info.project.projectService.logger;
    const cwd = info.project.getCurrentDirectory();
    const configPath = Tokenami.getConfigPath(cwd, info.config.configPath);
    const configExists = ts.sys.fileExists(configPath);

    if (!configExists) {
      logger.info(`Tokenami:: Cannot find config at ${configPath}`);
      return proxy;
    }

    let config = Tokenami.getConfigAtPath(configPath);
    // pre-compute variant entries to improve performance
    let selectorCompletions = createSelectorTrie(config);
    let selectorSnippetCompletions = createSelectorSnippetTrie(config);
    let responsiveSelectorCompletions = createResponsiveSelectorTrie(config);
    let responsiveSelectorSnippetCompletions = createResponsiveSelectorSnippetTrie(config);

    try {
      updateEnvFile(configPath, config);
    } catch (e) {
      logger.info(`Tokenami:: Skipped typedefs update with ${e}`);
    }

    logger.info(`Tokenami:: Watching config at ${configPath}`);
    ts.sys.watchFile?.(configPath, (_, eventKind: tslib.FileWatcherEventKind) => {
      if (eventKind === modules.typescript.FileWatcherEventKind.Changed) {
        logger.info(`Tokenami:: Config changed at ${configPath}`);
        try {
          config = Tokenami.getReloadedConfigAtPath(configPath);
          info.project.refreshDiagnostics();
          selectorCompletions = createSelectorTrie(config);
          selectorSnippetCompletions = createSelectorSnippetTrie(config);
          responsiveSelectorCompletions = createResponsiveSelectorTrie(config);
          responsiveSelectorSnippetCompletions = createResponsiveSelectorSnippetTrie(config);
          updateEnvFile(configPath, config);
        } catch (e) {
          logger.info(`Tokenami:: Skipped change to ${configPath} with ${e}`);
        }
      }
    });

    const getVariantResults = (input: string, search: string, node: tslib.Node) => {
      const parts = TokenamiConfig.getTokenPropertySplit(input as any);
      const type = isQuoted(node) ? 'unquoted' : 'quoted';

      if (parts.variants.length) {
        if (parts.variants.length > 1) {
          return responsiveSelectorCompletions[type].search(search);
        }

        const selectors = selectorCompletions[type].search(search);
        const snippets = responsiveSelectorSnippetCompletions[type].search(search);
        return [...selectors, ...snippets];
      }

      return selectorSnippetCompletions[type].search(search);
    };

    /* ---------------------------------------------------------------------------------------------
     * getSemanticDiagnostics
     * ------------------------------------------------------------------
     * -------------------------*/

    proxy.getSemanticDiagnostics = (fileName) => {
      const diagnostics = info.languageService.getSemanticDiagnostics(fileName);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);

      const findDiagnosticIndex = (code: number, node: tslib.Node): number => {
        return diagnostics.findIndex((diagnostic) => {
          const isCodeMatch = diagnostic.code === code;
          const isCurrentNode = diagnostic.start === node.getStart();
          return isCodeMatch && isCurrentNode;
        });
      };

      const updateDiagnosticMessage = (index: number, messageText: string): void => {
        if (index === -1) return;
        diagnostics[index] = { ...diagnostics[index], messageText } as tslib.Diagnostic;
      };

      const processNode = (node: tslib.Node): void => {
        const isDiagnosticPrevented = shouldSuppressDiagnosticForNode(node, sourceFile!);
        if (isDiagnosticPrevented || !ts.isPropertyAssignment(node)) return;
        const nodeProperty = ts.isStringLiteral(node.name) ? node.name.text : null;
        const property = TokenamiConfig.TokenProperty.safeParse(nodeProperty);
        if (!property.success) return;

        const { variants } = TokenamiConfig.getTokenPropertySplit(property.output);
        const parts = TokenamiConfig.getTokenPropertyParts(property.output, config);
        const invalidValueIndex = findDiagnosticIndex(INVALID_VALUE_ERROR_CODE, node);
        const isArbitrarySelector = variants.some(TokenamiConfig.getArbitrarySelector);

        if (variants.length && !parts && !isArbitrarySelector) {
          const selector = variants.join('_');
          const isEmptyArbitrarySelector = variants.includes('{}');
          const message = `Tokenami properties may only specify known selectors, and '${selector}' does not exist.${
            isEmptyArbitrarySelector ? ` Add an arbitrary selector or remove '${selector}'.` : ''
          }`;
          diagnostics.push({
            file: sourceFile,
            start: node.getStart(),
            length: node.name.getWidth(),
            messageText: message,
            category: ts.DiagnosticCategory.Error,
            code: INVALID_PROPERTY_ERROR_CODE,
          });
        }

        if (invalidValueIndex > -1 && ts.isStringLiteral(node.initializer)) {
          const value = node.initializer.text;
          const arbitraryValue = TokenamiConfig.arbitraryValue(value);
          const message = `Value '${value}' is not assignable to Tokenami property '${property.output}'. Use value from theme or mark arbitrary with '${arbitraryValue}'.`;
          updateDiagnosticMessage(invalidValueIndex, message);
        }

        if (invalidValueIndex > -1 && ts.isNumericLiteral(node.initializer)) {
          const message = `Tokenami grid values are not assignable to '${property.output}'.`;
          updateDiagnosticMessage(invalidValueIndex, message);
        }
      };

      if (sourceFile) {
        ts.forEachChild(sourceFile, function nextNode(node: tslib.Node): void {
          processNode(node);
          ts.forEachChild(node, nextNode);
        });
      }

      return diagnostics;
    };

    /* ---------------------------------------------------------------------------------------------
     * getCodeFixesAtPosition
     * -------------------------------------------------------------------------------------------*/

    proxy.getCodeFixesAtPosition = (
      fileName,
      start,
      end,
      errorCodes,
      formatOptions,
      preferences
    ) => {
      const original = info.languageService.getCodeFixesAtPosition(
        fileName,
        start,
        end,
        errorCodes,
        formatOptions,
        preferences
      );

      if (!errorCodes.includes(INVALID_VALUE_ERROR_CODE)) return original;

      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);
      if (!sourceFile) return original;

      const node = findNodeAtPosition(sourceFile, start);
      if (!node?.parent || !tslib.isPropertyAssignment(node.parent)) return original;

      const assignment = node.parent;
      const valueSpan = createTextSpanFromNode(assignment.initializer);
      const value = ts.isStringLiteral(assignment.initializer) && assignment.initializer.text;
      if (!value) return original;

      const quoteMark = assignment.initializer.getText().slice(-1);
      const arbitraryValue = TokenamiConfig.arbitraryValue(value);
      const arbitraryText = `${quoteMark}${arbitraryValue}${quoteMark}`;

      return [
        {
          description: `Use ${arbitraryText} to mark as arbitrary`,
          fixName: 'replaceWithArbitrary',
          changes: [
            {
              fileName,
              textChanges: [{ span: valueSpan, newText: arbitraryText }],
            },
          ],
        },
      ];
    };

    /* ---------------------------------------------------------------------------------------------
     * getCompletionsAtPosition
     * -------------------------------------------------------------------------------------------*/

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const original = info.languageService.getCompletionsAtPosition(fileName, position, options);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);
      if (!original || !sourceFile) return;

      const isTokenPropertyEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenProperty.safeParse(entry.name).success
      );
      const isTokenValueEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenValue.safeParse(entry.name).success
      );

      if (isTokenValueEntries) {
        original.entries = original.entries.map((entry) => transformTokenValueEntry(entry, config));
      } else if (isTokenPropertyEntries) {
        const node = findNodeAtPosition(sourceFile, position);
        if (!node) return;

        const input = getInputAtPosition(node, position);
        const search = getSortText(input).replace('$', '');
        const entries = original.entries.flatMap((entry) => {
          const transformedEntry = transformBasePropertyEntry(entry);
          return transformedEntry ? [transformedEntry] : [];
        });

        if (search) {
          const baseResults = getBaseResults(entries, search);
          const variantResults = getVariantResults(input, search, node);
          original.entries = [...baseResults, ...variantResults];
        } else {
          const snippetEntries = isQuoted(node)
            ? getSelectorSnippetCompletions(config)
            : getSelectorSnippetCompletions(config, '"');
          original.entries = [...entries, ...snippetEntries];
        }

        return { ...original, isIncomplete: true };
      }

      return original;
    };

    /* ---------------------------------------------------------------------------------------------
     * getCompletionEntryDetails
     * -------------------------------------------------------------------------------------------*/

    proxy.getCompletionEntryDetails = (
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data
    ) => {
      const entryConfig = getEntryDetailsConfig(entryName);
      const original = info.languageService.getCompletionEntryDetails(
        fileName,
        position,
        entryName,
        formatOptions,
        source,
        preferences,
        data
      );

      if (!entryConfig) return original;

      const common = {
        ...original,
        name: entryName,
        kind: entryConfig.kind,
        kindModifiers: entryConfig.kindModifiers,
        displayParts: original?.displayParts || [],
      };

      const originalDocumentation = original?.documentation || [];

      if (entryConfig.modeValues) {
        const entries = Object.entries(entryConfig.modeValues);
        const [mode, firstValue] = entries[0] || [];

        if (isColorThemeEntry(entryConfig.modeValues)) {
          const description = createColorTokenDescription(entryConfig.modeValues);
          const rgb = firstValue
            ? convertToRgb(replaceCssVarsWithFallback(firstValue), mode)
            : firstValue;
          const docs = { text: `${rgb}\n\n${description}`, kind: 'markdown' };
          return { ...common, documentation: [docs, ...originalDocumentation] };
        } else {
          const description = createTokenDescription(entryConfig.modeValues);
          const docs = { text: `${firstValue}\n\n${description}`, kind: 'markdown' };
          return { ...common, documentation: [docs, ...originalDocumentation] };
        }
      }

      if (entryConfig.value) {
        const docs = { kind: 'markdown', text: String(entryConfig.value) };
        const documentation = [docs, ...originalDocumentation];
        return { ...common, documentation };
      }

      return common;
    };

    /* ---------------------------------------------------------------------------------------------
     * getQuickInfoAtPosition
     * -------------------------------------------------------------------------------------------*/

    proxy.getQuickInfoAtPosition = (fileName, position) => {
      const original = info.languageService.getQuickInfoAtPosition(fileName, position);
      const sourceFile = info.languageService.getProgram()?.getSourceFile(fileName);

      if (!original || !sourceFile) return original;
      const node = findNodeAtPosition(sourceFile, position);
      if (!node || !node.parent || !ts.isPropertyAssignment(node.parent)) return original;

      const property = node.parent;
      const propertyName = property.name.getText(sourceFile);
      const propertyValue = property.initializer.getText();
      const tokenProperty = TokenamiConfig.TokenProperty.safeParse(propertyName);
      const tokenValue = TokenamiConfig.TokenValue.safeParse(propertyValue);

      if (!tokenProperty.success || !tokenValue.success) return original;
      const { variants } = TokenamiConfig.getTokenPropertySplit(tokenProperty.output);
      const propertyParts = TokenamiConfig.getTokenPropertyParts(tokenProperty.output, config);
      if (!propertyParts && variants.length) return;

      const modeValues = Tokenami.getThemeValuesByThemeMode(tokenValue.output, config.theme);
      const text = isColorThemeEntry(modeValues)
        ? createColorTokenDescription(modeValues)
        : createTokenDescription(modeValues);

      return { ...original, documentation: [{ text, kind: 'markdown' }] };
    };

    return proxy;
  }

  return { create };
}

/* ---------------------------------------------------------------------------------------------- */

// we have to use RBG for alpha channel support because the vscode suggestion
// widget renderer doesn't support 8-digit hex codes
// https://github.com/microsoft/vscode/blob/9aa46099e12c6b45f41b0451e19389d91990d0ed/src/vs/editor/contrib/suggest/browser/suggestWidgetRenderer.ts#L36
function convertToRgb(fill: string, mode?: string) {
  try {
    const parsed = culori.parse(fill);
    const color = culori.rgb(parsed);
    const modeColor = culori.rgb(mode == 'dark' ? '#000' : '#fff');
    const bgColor = fill === 'transparent' ? undefined : modeColor;

    if (!color) return fill;
    if (!bgColor || parsed?.alpha === undefined || parsed.alpha === 1) {
      return culori.formatRgb(color);
    }

    const alpha = parsed.alpha;
    color.r = color.r * alpha + bgColor.r * (1 - alpha);
    color.g = color.g * alpha + bgColor.g * (1 - alpha);
    color.b = color.b * alpha + bgColor.b * (1 - alpha);
    color.alpha = 1;

    return culori.formatRgb(color);
  } catch {
    return fill;
  }
}

function createColorTokenDescription(modeValues: NonNullable<EntryConfigItem['modeValues']>) {
  return createDescription(modeValues, (mode, value) => [createSquare(value, mode), mode, value]);
}

function createTokenDescription(modeValues: NonNullable<EntryConfigItem['modeValues']>) {
  return createDescription(modeValues, (mode, value) => [mode, value]);
}

function createDescription(
  modeValues: NonNullable<EntryConfigItem['modeValues']>,
  builder: (mode: string, value: string) => string[]
) {
  const entries = Object.entries(modeValues);
  const rows = entries.map(([mode, value]) => createRow(builder(mode, value)));
  return rows.join(`\n\n`);
}

function createRow(row: string[]) {
  return row.join(createSquare('transparent') + createSquare('transparent'));
}

const createSquare = (color: string, mode?: string) => {
  const fill = convertToRgb(replaceCssVarsWithFallback(color), mode);
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${fill}" /></svg>`;
  return `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
};

function replaceCssVarsWithFallback(value: string) {
  // regular expression to find CSS variables with fallback values
  const regex = /var\([\w-_]+,\s*([\w-_]+)\)/g;
  // replace the CSS variables with their fallback values
  return value.replace(regex, (_, fallback) => fallback);
}

function isColorThemeEntry(modeValues: Record<string, string>) {
  try {
    const firstValue = Object.values(modeValues || {})?.[0];
    // culori parses number strings as colours e.g. "300" becomes `{ mode: 'rgb', r: 0,2, g: 0, b: 0 }`
    // so we make sure value cannot coerce to a number before parsing
    const isString = isNaN(Number(firstValue));
    return isString ? Boolean(culori.parse(replaceCssVarsWithFallback(firstValue || ''))) : false;
  } catch {
    return false;
  }
}

export = init;
