import tslib from 'typescript/lib/tsserverlibrary';
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

function init(modules: { typescript: typeof tslib }) {
  const ts = modules.typescript;
  let entryConfigMap = new Map<string, EntryConfigItem>();

  /* ---------------------------------------------------------------------------------------------
   * getSelectorCompletions
   * ---------------------------------------------------------------------------------------------
   * we pre-compute selector entries to improve performance
   * -------------------------------------------------------------------------------------------*/

  function getSelectorCompletions(
    config: TokenamiConfig.Config,
    quote?: string
  ): tslib.CompletionEntry[] {
    const configResponsiveEntries = Object.entries(config.responsive || {});
    const configSelectorEntries = Object.entries(config.selectors || {});
    const allSelectorEntries = configSelectorEntries.concat([['[]', '']]);
    const configAliasProperties = Object.keys(config.aliases || {});

    return [...Tokenami.supportedProperties, ...configAliasProperties].flatMap((property) => {
      const createCompletionEntry = createVariantPropertyEntry(property, quote);
      const responsiveEntries = configResponsiveEntries.flatMap(
        ([responsiveSelector, responsiveValue]) => {
          const responsiveEntry = createCompletionEntry([responsiveSelector, responsiveValue]);
          const combinedEntries = allSelectorEntries.map(([selector, value]) => {
            const combinedSelector = `${responsiveSelector}_${selector}`;
            const combinedValue = [responsiveValue].concat(value);
            return createCompletionEntry([combinedSelector, combinedValue]);
          });
          return [responsiveEntry, ...combinedEntries];
        }
      );
      const selectorEntries = allSelectorEntries.map(createCompletionEntry);
      return [...responsiveEntries, ...selectorEntries];
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * createVariantPropertyEntry
   * -------------------------------------------------------------------------------------------*/

  const createVariantPropertyEntry = (property: string, quote = '') => {
    return ([selector, value]: [string, string | string[]]): tslib.CompletionEntry => {
      const tokenProperty = TokenamiConfig.variantProperty(selector, property);
      const name = removeSpecialCharEscaping(`${quote}${tokenProperty}${quote}`);
      const kind = tslib.ScriptElementKind.memberVariableElement;
      const kindModifiers = tslib.ScriptElementKindModifier.optionalModifier;
      const isArbitrary = name.includes('[]');
      updateEntryDetailsConfig({ name, kind, kindModifiers, value });

      if (isArbitrary) {
        // we prepend 1 to sort arbitrary values after non-arbitrary ones
        const sortText = `1${name}`;
        const insertText = name.replace('[]', '[${1}]');
        return { name, kind, kindModifiers, sortText, insertText, isSnippet: true };
      }

      return { name, kind, kindModifiers, sortText: `0${name}`, insertText: name };
    };
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
   * transformTokenPropertyEntry
   * -------------------------------------------------------------------------------------------*/

  function transformTokenPropertyEntry(entry: tslib.CompletionEntry): tslib.CompletionEntry | null {
    const property = TokenamiConfig.TokenProperty.safeParse(entry.name);
    if (!property.success) return null;
    const sortText = '$' + entry.name;
    const name = removeSpecialCharEscaping(entry.name);
    return { ...entry, name, sortText, insertText: name };
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

    const name = removeSpecialCharEscaping(`$${parts.token}`);
    const kindModifiers = parts.themeKey;
    const sortText = '$' + entryName;
    const labelDetails = { detail: '', description: entryName };
    const insertText = entryName;
    const nextEntry = { ...entry, name, sortText, kindModifiers, insertText, labelDetails };
    updateEntryDetailsConfig({ ...nextEntry, themeKey: parts.themeKey, modeValues });
    return nextEntry;
  }

  /* ---------------------------------------------------------------------------------------------
   * removeSpecialCharEscaping
   * -------------------------------------------------------------------------------------------*/

  function removeSpecialCharEscaping(name: string) {
    return name.replace(/\\/g, '');
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
    let selectorCompletions = {
      unquoted: getSelectorCompletions(config),
      quoted: getSelectorCompletions(config, '"'),
    };

    logger.info(`Tokenami:: Watching config at ${configPath}`);
    ts.sys.watchFile?.(configPath, (_, eventKind: tslib.FileWatcherEventKind) => {
      if (eventKind === modules.typescript.FileWatcherEventKind.Changed) {
        logger.info(`Tokenami:: Config changed at ${configPath}`);
        try {
          config = Tokenami.getReloadedConfigAtPath(configPath);
          info.project.refreshDiagnostics();
          selectorCompletions = {
            unquoted: getSelectorCompletions(config),
            quoted: getSelectorCompletions(config, '"'),
          };
        } catch (e) {
          logger.info(`Tokenami:: Skipped change to ${configPath} with ${e}`);
        }
      }
    });

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
          const message = `Tokenami properties may only specify known selectors, and '${selector}' does not exist.`;
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
      if (!original || !sourceFile) return original;

      const isTokenPropertyEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenProperty.safeParse(entry.name).success
      );
      const isTokenValueEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenValue.safeParse(entry.name).success
      );

      if (isTokenValueEntries) {
        original.entries = original.entries.map((entry) => {
          return transformTokenValueEntry(entry, config);
        });
      } else if (isTokenPropertyEntries) {
        const isQuoted = Boolean(original.entries[0]?.name.match(/^"/));
        original.entries = [
          ...original.entries.flatMap((entry) => {
            const transformedEntry = transformTokenPropertyEntry(entry);
            return transformedEntry ? [transformedEntry] : [];
          }),
          ...(isQuoted ? selectorCompletions.quoted : selectorCompletions.unquoted),
        ];
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
        const isColor = entryConfig.themeKey === 'color';
        const entries = Object.entries(entryConfig.modeValues);
        const [, firstValue] = entries[0] || [];
        const description = isColor
          ? createColorTokenDescription(entryConfig.modeValues)
          : createTokenDescription(entryConfig.modeValues);
        const docs = { text: `${firstValue}\n\n${description}`, kind: 'markdown' };
        const documentation = [docs, ...originalDocumentation];
        return { ...common, documentation };
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

      const parts = TokenamiConfig.getTokenValueParts(tokenValue.output);
      const modeValues = Tokenami.getThemeValuesByThemeMode(tokenValue.output, config.theme);
      const isColor = parts.themeKey === 'color';
      const text = isColor
        ? createColorTokenDescription(modeValues)
        : createTokenDescription(modeValues);

      return { ...original, documentation: [{ text, kind: 'markdown' }] };
    };

    return proxy;
  }

  return { create };
}

/* ---------------------------------------------------------------------------------------------- */

function createColorTokenDescription(modeValues: NonNullable<EntryConfigItem['modeValues']>) {
  return createDescription(modeValues, (mode, value) => [createSquare(value), mode, value]);
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

const createSquare = (color: string) => {
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${color}" /></svg>`;
  return `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
};

export = init;
