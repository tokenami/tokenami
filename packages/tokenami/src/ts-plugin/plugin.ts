import ts from 'typescript/lib/tsserverlibrary';
import * as culori from 'culori';
import * as TokenamiConfig from '@tokenami/config';
import * as tokenami from '../utils';
import * as supports from '../supports';
import * as ERROR_CODES from './error-codes';
import { isColorThemeEntry, replaceCssVarsWithFallback } from './common';
import { LanguageServiceLogger } from './logger';
import { TokenamiDiagnostics } from './diagnostics';
import { TrieCompletions } from './trie';

type ModeValues = Record<string, string>;

/* -------------------------------------------------------------------------------------------------
 * TokenamiPlugin
 * -----------------------------------------------------------------------------------------------*/

type TokenamiPluginContext = {
  ts: typeof ts;
  info: ts.server.PluginCreateInfo;
  logger: LanguageServiceLogger;
  checker: ts.TypeChecker;
};

class TokenamiPlugin {
  #diagnostics: TokenamiDiagnostics;
  #config: TokenamiConfig.Config;
  #ctx: TokenamiPluginContext;
  #trieCompletions: TrieCompletions;
  #quotedTrieCompletions: TrieCompletions;

  constructor(configPath: string, context: TokenamiPluginContext) {
    this.#config = tokenami.getConfigAtPath(configPath);
    this.#ctx = context;
    this.#diagnostics = new TokenamiDiagnostics(this.#config, this.#ctx);
    this.#trieCompletions = new TrieCompletions(this.#config);
    this.#quotedTrieCompletions = new TrieCompletions(this.#config, (name) => `"${name}"`);
    this.#ctx.logger.log(`Watching config at ${configPath}`);
    this.#watchConfig(configPath);

    try {
      updateEnvFile(configPath, this.#config);
    } catch (e) {
      this.#ctx.logger.error(`Error updating typedefs: ${e}`);
    }
  }

  #watchConfig(configPath: string) {
    this.#ctx.ts.sys.watchFile?.(configPath, (_fileName, eventKind) => {
      if (eventKind !== this.#ctx.ts.FileWatcherEventKind.Changed) return;
      try {
        this.#ctx.logger.log(`Config changed at ${configPath}`);
        this.#config = tokenami.getReloadedConfigAtPath(configPath);
        this.#trieCompletions = new TrieCompletions(this.#config);
        this.#quotedTrieCompletions = new TrieCompletions(this.#config, (name) => `"${name}"`);
        this.#ctx.info.project.refreshDiagnostics();
        updateEnvFile(configPath, this.#config);
      } catch (e) {
        this.#ctx.logger.error(`Error processing config at ${configPath}: ${e}`);
      }
    });

    this.#ctx.logger.log(`Watching config at ${configPath}`);
  }

  getSemanticDiagnostics(fileName: string) {
    const original = this.#ctx.info.languageService.getSemanticDiagnostics(fileName);
    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) return original;
    return [...this.#diagnostics.getSemanticDiagnostics(sourceFile), ...original];
  }

  getCompletionsAtPosition = (
    fileName: string,
    position: number,
    options: ts.GetCompletionsAtPositionOptions
  ) => {
    const original = this.#ctx.info.languageService.getCompletionsAtPosition(
      fileName,
      position,
      options
    );
    const program = this.#ctx.info.languageService.getProgram();
    const sourceFile = program?.getSourceFile(fileName);
    if (!original || !sourceFile) return original;

    const isTokenPropertyEntries = original.entries.some(
      (entry) => TokenamiConfig.TokenProperty.safeParse(entry.name).success
    );
    const isTokenValueEntries = original.entries.some(
      (entry) => TokenamiConfig.TokenValue.safeParse(entry.name).success
    );

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return original;

    if (isTokenValueEntries) {
      const input = getValueAtPosition(node, position);
      const needsQuotes = !input.startsWith('"') && !input.startsWith("'");
      const trie = needsQuotes ? this.#quotedTrieCompletions : this.#trieCompletions;
      const values = trie.valueSearch(getUnquotedString(input));
      original.entries = original.entries.flatMap((entry) => {
        const result = values.find((result) => {
          const name = getUnquotedString(result.insertText ?? result.name);
          return name === getUnquotedString(entry.name);
        });
        return result ? [result] : [];
      });
    } else if (isTokenPropertyEntries) {
      const input = getPropertyAtPosition(node, position);
      const needsQuotes = !input.startsWith('"') && !input.startsWith("'");
      const trie = needsQuotes ? this.#quotedTrieCompletions : this.#trieCompletions;
      original.entries = trie.propertySearch(getUnquotedString(input));
      return { ...original, isIncomplete: true };
    }

    return original;
  };

  getCompletionEntryDetails(
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: ts.FormatCodeSettings,
    source: string,
    preferences: ts.UserPreferences,
    data: ts.CompletionEntryData
  ) {
    const isTokenamiProperty = TokenamiConfig.TokenProperty.safeParse(entryName).success;
    const original = this.#ctx.info.languageService.getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data
    );

    const search = getUnquotedString(entryName);

    if (isTokenamiProperty) {
      const [entry] = this.#trieCompletions.variantSearch(search);
      return entry ? createEntryDetails(original, entry, String(entry.details.selector)) : original;
    }

    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) return original;

    const node = findNodeAtPosition(sourceFile, position);
    if (!node || !ts.isPropertyAssignment(node.parent)) return original;

    const parentProperty = node.parent.name.getText();
    const isTokenamiValue = TokenamiConfig.TokenProperty.safeParse(parentProperty).success;
    if (!isTokenamiValue) return original;

    const [entry] = this.#trieCompletions.valueSearch(search);
    if (!entry) return original;

    const themeEntries = Object.entries(entry.details.modeValues);
    const [mode, firstValue] = themeEntries[0] || [];
    if (!firstValue) return original;

    if (isColorThemeEntry(entry.details.modeValues)) {
      const colorDescription = createColorTokenDescription(entry.details.modeValues);
      const rgb = convertToRgb(replaceCssVarsWithFallback(firstValue), mode);
      return createEntryDetails(original, entry, `${rgb}\n\n${colorDescription}`);
    } else {
      const description = createTokenDescription(entry.details.modeValues);
      return createEntryDetails(original, entry, `${firstValue}\n\n${description}`);
    }
  }

  getQuickInfoAtPosition(fileName: string, position: number) {
    const original = this.#ctx.info.languageService.getQuickInfoAtPosition(fileName, position);
    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);

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
    const propertyParts = TokenamiConfig.getTokenPropertyParts(tokenProperty.output, this.#config);
    if (!propertyParts && variants.length) return;

    const modeValues = tokenami.getThemeValuesByThemeMode(tokenValue.output, this.#config.theme);
    const text = isColorThemeEntry(modeValues)
      ? createColorTokenDescription(modeValues)
      : createTokenDescription(modeValues);

    return { ...original, documentation: [{ text, kind: 'markdown' }] };
  }

  getCodeFixesAtPosition(
    fileName: string,
    start: number,
    end: number,
    errorCodes: readonly number[],
    formatOptions: ts.FormatCodeSettings,
    preferences: ts.UserPreferences
  ) {
    const original = this.#ctx.info.languageService.getCodeFixesAtPosition(
      fileName,
      start,
      end,
      errorCodes,
      formatOptions,
      preferences
    );

    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile || !errorCodes.includes(ERROR_CODES.INVALID_VALUE)) return original;

    const node = findNodeAtPosition(sourceFile, start);
    if (!node?.parent || !ts.isPropertyAssignment(node.parent)) return original;

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
  }
}

/* -------------------------------------------------------------------------------------------------
 * updateEnvFile
 * -----------------------------------------------------------------------------------------------*/

function updateEnvFile(configPath: string, config: TokenamiConfig.Config) {
  const envFilePath = tokenami.getTypeDefsPath(configPath);
  const ciEnvFilePath = tokenami.getCiTypeDefsPath(configPath);
  const envFileContent = ts.sys.readFile(envFilePath, 'utf-8');

  if (!envFileContent) throw new Error('Cannot read tokenami.env.d.ts file');

  const properties = Object.keys(config.properties || {});
  const customProperties = Object.keys(config.customProperties || {});
  const experimentalProperties = properties.flatMap((property) => {
    if (supports.supportedProperties.has(property as any)) return [];
    return [property];
  });

  const customPropertyTypes = [...experimentalProperties, ...customProperties].map((property) => {
    return [`TokenProperties<'${property}'>`];
  });

  const updatedEnvFileContent = !customProperties.length
    ? tokenami.generateTypeDefs(configPath, '../stubs/tokenami.env.d.ts')
    : tokenami
        .generateTypeDefs(configPath, '../stubs/tokenami.env-custom.d.ts')
        .replace(
          'interface TokenamiProperties {',
          `interface TokenamiProperties extends ${customPropertyTypes.join(', ')} {`
        );

  ts.sys.writeFile(envFilePath, updatedEnvFileContent);

  if (ts.sys.readFile(ciEnvFilePath, 'utf-8')) {
    ts.sys.writeFile(ciEnvFilePath, tokenami.generateCiTypeDefs(configPath));
  }
}

/* -----------------------------------------------------------------------------------------------
 * findNodeAtPosition
 * ---------------------------------------------------------------------------------------------*/

function findNodeAtPosition(sourceFile: ts.SourceFile, position: number) {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart(sourceFile) && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node;
    }
  }
  return find(sourceFile);
}

/* -----------------------------------------------------------------------------------------------
 * createTextSpanFromNode
 * ---------------------------------------------------------------------------------------------*/

function createTextSpanFromNode(node: ts.Node): ts.TextSpan {
  return { start: node.getStart(), length: node.getEnd() - node.getStart() };
}

/* ---------------------------------------------------------------------------------------------
 * createEntryDetails
 * -------------------------------------------------------------------------------------------*/

const createEntryDetails = (
  original: ts.CompletionEntryDetails | undefined,
  entryConfig: ts.CompletionEntry,
  documentation: string
) => ({
  ...original,
  ...entryConfig,
  displayParts: original?.displayParts || [],
  documentation: [{ text: documentation, kind: 'markdown' }, ...(original?.documentation ?? [])],
});

/* -------------------------------------------------------------------------------------------------
 * getPropertyAtPosition
 * -----------------------------------------------------------------------------------------------*/

const getPropertyAtPosition = (node: ts.Node, position: number) => {
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

  return input;
};

/* -------------------------------------------------------------------------------------------------
 * getValueAtPosition
 * -----------------------------------------------------------------------------------------------*/

function getValueAtPosition(node: ts.Node, position: number) {
  let input = node.getText();

  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const value = property.initializer;
      const start = value.getStart();
      const end = value.getEnd();
      if (start <= position && position <= end) {
        input = value.getText();
      }
    }
  }

  return input;
}

/* -------------------------------------------------------------------------------------------------
 * getUnquotedString
 * -----------------------------------------------------------------------------------------------*/

function getUnquotedString(name: string) {
  return name.replace(/'|"/g, '');
}

/* ---------------------------------------------------------------------------------------------
 * createColorTokenDescription
 * -------------------------------------------------------------------------------------------*/

function createColorTokenDescription(modeValues: ModeValues) {
  return createDescription(modeValues, (mode, value) => [createSquare(value, mode), mode, value]);
}

/* ---------------------------------------------------------------------------------------------
 * createTokenDescription
 * -------------------------------------------------------------------------------------------*/

function createTokenDescription(modeValues: ModeValues) {
  return createDescription(modeValues, (mode, value) => [mode, value]);
}

/* ---------------------------------------------------------------------------------------------
 * createDescription
 * -------------------------------------------------------------------------------------------*/

function createDescription(
  modeValues: ModeValues,
  builder: (mode: string, value: string) => string[]
) {
  const entries = Object.entries(modeValues);
  const rows = entries.map(([mode, value]) => createRow(builder(mode, value)));
  return rows.join(`\n\n`);
}

/* ---------------------------------------------------------------------------------------------
 * createSquare
 * -------------------------------------------------------------------------------------------*/

function createSquare(color: string, mode?: string) {
  const fill = convertToRgb(replaceCssVarsWithFallback(color), mode);
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${fill}" /></svg>`;
  return `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
}

/* ---------------------------------------------------------------------------------------------
 * createRow
 * -------------------------------------------------------------------------------------------*/

function createRow(row: string[]) {
  return row.join(createSquare('transparent') + createSquare('transparent'));
}

/* ---------------------------------------------------------------------------------------------
 * convertToRgb
 * -------------------------------------------------------------------------------------------*/

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

/* ---------------------------------------------------------------------------------------------- */

const createTSPlugin = (mod: { typescript: typeof ts }) => ({
  create(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info);
    const cwd = info.project.getCurrentDirectory();
    const configPath = tokenami.getConfigPath(cwd, info.config.configPath);
    const configExists = mod.typescript.sys.fileExists(configPath);
    const checker = info.languageService.getProgram()?.getTypeChecker();

    if (!configExists) {
      logger.log(`Config not found at ${configPath}`);
      return info.languageService;
    }

    if (!checker) {
      logger.error(`Error getting type checker`);
      return info.languageService;
    }

    const ctx = { ts: mod.typescript, info, logger, checker };
    return new TokenamiPlugin(configPath, ctx);
  },
});

/* ---------------------------------------------------------------------------------------------- */

export { createTSPlugin };
