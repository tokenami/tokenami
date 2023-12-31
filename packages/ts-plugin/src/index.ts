import tslib from 'typescript/lib/tsserverlibrary';
import * as TokenamiConfig from '@tokenami/config';
import * as Tokenami from '@tokenami/dev';

const INVALID_SELECTOR_ERROR_CODE = 50000;
const INVALID_VALUE_ERROR_CODE = 2322;

// this is in module scope because precomputed selector completions reference this object, but
// we mutate the reference when completions open to ensure the correct config.
let selectorReplacementConfig = { quote: "'", span: { start: 0, length: 1 } };

// we pre-compute selector entries to improve performance
function getSelectorCompletions(config: TokenamiConfig.Config): tslib.CompletionEntry[] {
  const responsiveEntries = Object.entries(config.responsive || {});
  const selectorsEntries = Object.entries(config.selectors || {});
  return TokenamiConfig.properties.flatMap((entryName) => {
    return [...responsiveEntries, ...selectorsEntries].map(([selector, description]) => {
      const name = TokenamiConfig.variantProperty(selector, entryName);
      return {
        name,
        kind: tslib.ScriptElementKind.memberVariableElement,
        kindModifiers: tslib.ScriptElementKindModifier.optionalModifier,
        sortText: name,
        insertText: name + selectorReplacementConfig.quote,
        labelDetails: { detail: '', description: String(description) },
        replacementSpan: selectorReplacementConfig.span,
      };
    });
  });
}

function init(modules: { typescript: typeof tslib }) {
  const ts = modules.typescript;

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
    const tokenConfigMap = new Map<string, { themeKey: string; tokenValue: string | number }>();

    ts.sys.watchFile?.(configPath, (_, eventKind: tslib.FileWatcherEventKind) => {
      if (eventKind === modules.typescript.FileWatcherEventKind.Changed) {
        config = Tokenami.getReloadedConfigAtPath(configPath);
        selectorCompletions = getSelectorCompletions(config);
        info.project.refreshDiagnostics();
      }
    });

    // info.project.projectService.logger.info(`DEBUG:: ${JSON.stringify(config)}`);

    proxy.getSemanticDiagnostics = (fileName) => {
      const original = info.languageService.getSemanticDiagnostics(fileName);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);

      if (sourceFile) {
        ts.forEachChild(sourceFile, function visit(node) {
          if (ts.isPropertyAssignment(node)) {
            const property = ts.isStringLiteral(node.name) ? node.name.text : null;
            const textValue = ts.isStringLiteral(node.initializer) ? node.initializer.text : null;

            if (TokenamiConfig.TokenProperty.safeParse(property).success) {
              const parts = Tokenami.getTokenPropertyParts(property as any, config);

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

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const original = info.languageService.getCompletionsAtPosition(fileName, position, options);
      const program = info.languageService.getProgram();
      const sourceFile = program?.getSourceFile(fileName);

      if (!original || !sourceFile) return original;
      const node = findNodeAtPosition(sourceFile, position);
      if (!node || !ts.isStringLiteral(node)) return original;

      const quoteMark = node.getText().slice(-1);
      const isTokenValueEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenValue.safeParse(entry.name).success
      );
      const isTokenPropertyEntries = original.entries.some(
        (entry) => TokenamiConfig.TokenProperty.safeParse(entry.name).success
      );

      if (isTokenValueEntries) {
        info.project.projectService.logger.info(`TOKENAMI: value`);
        original.entries = original.entries.map((entry) => {
          const entryName = entry.name;
          const parts = TokenamiConfig.getTokenValueParts(entryName as any);
          const tokenValue = parts ? config.theme[parts.themeKey]?.[parts.token] : undefined;

          if (parts && tokenValue) {
            tokenConfigMap.set(parts.token, { themeKey: parts.themeKey, tokenValue });
            entry.name = `$${parts.token}`;
            entry.sortText = entryName;
            entry.kindModifiers = parts.themeKey;
            entry.insertText = `${entryName}${quoteMark}`;
            entry.replacementSpan = { start: position, length: node.text.length + 1 };
            entry.labelDetails = { detail: '', description: entryName };
          }
          return entry;
        });
      } else if (isTokenPropertyEntries) {
        original.entries = original.entries.flatMap((entry) => {
          const isProperty = TokenamiConfig.TokenProperty.safeParse(entry.name).success;
          // filter any suggestions that aren't tokenami properties (e.g. backgroundColor)
          if (!isProperty) return [];
          entry.insertText = `${entry.name}${quoteMark}`;
          entry.replacementSpan = { start: position, length: node.text.length + 1 };
          return [entry];
        });

        selectorReplacementConfig.quote = quoteMark;
        selectorReplacementConfig.span.start = position;
        original.entries = original.entries.concat(selectorCompletions);
      }

      return original;
    };

    proxy.getCompletionEntryDetails = (
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data
    ) => {
      const [, token] = entryName.split('$');
      const entryConfig = token ? tokenConfigMap.get(token) : undefined;
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

      return {
        name: entryName,
        kind: ts.ScriptElementKind.string,
        kindModifiers: entryConfig.themeKey,
        displayParts: [{ text: String(entryConfig.tokenValue), kind: 'markdown' }],
      };
    };

    return proxy;
  }

  return { create };

  function findNodeAtPosition(
    sourceFile: tslib.SourceFile,
    position: number
  ): tslib.Node | undefined {
    function find(node: tslib.Node): tslib.Node | undefined {
      if (position >= node.getStart(sourceFile) && position < node.getEnd()) {
        return ts.forEachChild(node, find) || node;
      }
    }
    return find(sourceFile);
  }

  function createTextSpanFromNode(node: tslib.Node): tslib.TextSpan {
    return {
      start: node.getStart(),
      length: node.getEnd() - node.getStart(),
    };
  }
}

export = init;
