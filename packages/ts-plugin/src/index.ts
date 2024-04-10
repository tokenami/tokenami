import tslib from 'typescript/lib/tsserverlibrary';
import * as TokenamiConfig from '@tokenami/config';
import * as Tokenami from '@tokenami/dev';

const INVALID_SELECTOR_ERROR_CODE = 50000;
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

  function getSelectorCompletions(config: TokenamiConfig.Config): tslib.CompletionEntry[] {
    const responsiveEntries = Object.entries(config.responsive || {});
    const selectorsEntries = Object.entries(config.selectors || {});
    const aliasProperties = Object.keys(config.aliases || {});

    return [...Tokenami.supportedProperties, ...aliasProperties].flatMap((property) => {
      const createCompletionEntry = createVariantPropertyEntry(property);
      const entries = responsiveEntries.flatMap((entry) => {
        const responsiveEntry = createCompletionEntry(entry);
        const [responsiveSelector, responsiveValue] = entry;
        const combinedEntries = selectorsEntries.map(([selector, value]) => {
          const combinedSelector = `${responsiveSelector}_${selector}`;
          const combinedValue = [responsiveValue].concat(value);
          return createCompletionEntry([combinedSelector, combinedValue]);
        });
        return [responsiveEntry, ...combinedEntries];
      });
      return [...entries, ...selectorsEntries.map(createVariantPropertyEntry(property))];
    });
  }

  /* ---------------------------------------------------------------------------------------------
   * createVariantPropertyEntry
   * -------------------------------------------------------------------------------------------*/

  const createVariantPropertyEntry = (property: string) => {
    return ([selector, value]: [string, string | string[]]) => {
      const name = TokenamiConfig.variantProperty(selector, property);
      const kind = tslib.ScriptElementKind.memberVariableElement;
      const kindModifiers = tslib.ScriptElementKindModifier.optionalModifier;
      updateEntryDetailsConfig({ name, kind, kindModifiers, value });
      return { name, kind, kindModifiers, sortText: name, insertText: name };
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

    const cwd = info.project.getCurrentDirectory();
    const configPath = Tokenami.getConfigPath(cwd, info.config.configPath);
    const configExists = ts.sys.fileExists(configPath);

    if (!configExists) {
      info.project.projectService.logger.info(`TOKENAMI: Cannot find config`);
      return proxy;
    }

    let config = Tokenami.getConfigAtPath(configPath);
    let selectorCompletions = getSelectorCompletions(config);

    ts.sys.watchFile?.(configPath, (_, eventKind: tslib.FileWatcherEventKind) => {
      if (eventKind === modules.typescript.FileWatcherEventKind.Changed) {
        config = Tokenami.getReloadedConfigAtPath(configPath);
        selectorCompletions = getSelectorCompletions(config);
        info.project.refreshDiagnostics();
      }
    });

    /* ---------------------------------------------------------------------------------------------
     * getSemanticDiagnostics
     * ------------------------------------------------------------------
     * -------------------------*/

    proxy.getSemanticDiagnostics = (fileName) => {
      const original = info.languageService.getSemanticDiagnostics(fileName);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);

      if (sourceFile) {
        ts.forEachChild(sourceFile, function visit(node) {
          const isDiagnosticPrevented = shouldSuppressDiagnosticForNode(node, sourceFile);

          if (!isDiagnosticPrevented && ts.isPropertyAssignment(node)) {
            const property = ts.isStringLiteral(node.name) ? node.name.text : null;
            const textValue = ts.isStringLiteral(node.initializer) ? node.initializer.text : null;
            const parsedProperty = TokenamiConfig.TokenProperty.safeParse(property);

            if (parsedProperty.success) {
              const parts = TokenamiConfig.getTokenPropertyParts(parsedProperty.output, config);

              if (!parts) {
                original.push({
                  file: sourceFile,
                  start: node.getStart(),
                  length: node.getWidth(),
                  messageText: `Invalid property '${property}'. Selector not found in theme.`,
                  category: ts.DiagnosticCategory.Error,
                  code: INVALID_SELECTOR_ERROR_CODE,
                });
              }

              const invalidValueIndex = original.findIndex((diagnostic) => {
                const isCodeMatch = diagnostic.code === INVALID_VALUE_ERROR_CODE;
                const isCurrentNode = diagnostic.start === node.getStart();
                return isCodeMatch && isCurrentNode;
              });

              if (invalidValueIndex > -1) {
                let messageText = `Grid values are not assignable to '${property}'.`;

                if (textValue) {
                  const arbitraryValue = TokenamiConfig.arbitraryValue(textValue);
                  messageText = `Value '${textValue}' is not assignable to '${property}'. Use theme value or mark arbitrary with '${arbitraryValue}'`;
                }

                // @ts-ignore
                original[invalidValueIndex] = {
                  ...original[invalidValueIndex],
                  messageText,
                };
              }
            }
          }

          ts.forEachChild(node, visit);
        });
      }

      return original;
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

      if (errorCodes.includes(INVALID_VALUE_ERROR_CODE)) {
        const program = info.languageService.getProgram();
        const sourceFile = program?.getSourceFile(fileName);

        if (sourceFile) {
          const node = findNodeAtPosition(sourceFile, start);

          if (node?.parent && tslib.isPropertyAssignment(node.parent)) {
            const assignment = node.parent;
            const valueSpan = createTextSpanFromNode(assignment.initializer);
            const value = ts.isStringLiteral(assignment.initializer) && assignment.initializer.text;

            if (value) {
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
            }
          }
        }
      }

      return original;
    };

    /* ---------------------------------------------------------------------------------------------
     * getCompletionsAtPosition
     * -------------------------------------------------------------------------------------------*/

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const original = info.languageService.getCompletionsAtPosition(fileName, position, options);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);

      if (!original || !sourceFile) return original;
      const node = findNodeAtPosition(sourceFile, position);
      if (!node || !ts.isStringLiteral(node)) return original;

      const isTokenValueEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenValue.safeParse(entry.name).success
      );
      const isTokenPropertyEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenProperty.safeParse(entry.name).success
      );

      if (isTokenValueEntries) {
        original.entries = original.entries.map((entry) => {
          const entryName = entry.name;
          const property = TokenamiConfig.TokenValue.safeParse(entryName);
          entry.sortText = entryName;

          if (property.success) {
            const parts = TokenamiConfig.getTokenValueParts(property.output);
            const modeValues = Tokenami.getThemeValuesByThemeMode(property.output, config.theme);

            if (Object.entries(modeValues).length) {
              const name = `$${parts.token}`;
              const kindModifiers = parts.themeKey;
              entry.name = name;
              entry.sortText = '$' + entryName;
              entry.kindModifiers = kindModifiers;
              entry.insertText = entryName;
              entry.labelDetails = { detail: '', description: entryName };
              updateEntryDetailsConfig({
                name,
                kind: entry.kind,
                kindModifiers,
                themeKey: parts.themeKey,
                modeValues,
              });
            }
          }

          return entry;
        });
      } else if (isTokenPropertyEntries) {
        original.entries = original.entries.flatMap((entry) => {
          const property = TokenamiConfig.TokenProperty.safeParse(entry.name);
          entry.sortText = entry.name;
          // filter any suggestions that aren't tokenami properties (e.g. backgroundColor)
          if (!property.success) return [];
          entry.sortText = '$' + property.output;
          entry.insertText = property.output;
          return [entry];
        });

        original.entries = original.entries.concat(selectorCompletions);
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
        const text = isColor
          ? createColorTokenDescription(entryConfig.modeValues)
          : createTokenDescription(entryConfig.modeValues);
        const docs = { text, kind: 'markdown' };
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
  const [, firstValue] = entries[0] || [];
  const rows = entries.flatMap(([mode, value]) => {
    return value !== firstValue ? [createRow(builder(mode, value))] : [];
  });
  return `${firstValue}\n\n${rows.join(`\n\n`)}`;
}

function createRow(row: string[]) {
  return row.join(createSquare('transparent') + createSquare('transparent'));
}

const createSquare = (color: string) => {
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${color}" /></svg>`;
  return `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
};

export = init;
