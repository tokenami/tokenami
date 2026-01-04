import ts from 'typescript/lib/tsserverlibrary.js';
import * as findUp from 'find-up';
import * as pathe from 'pathe';
import * as culori from 'culori';
import * as TokenamiConfig from '@tokenami/config';
import * as tokenami from '../utils';
import * as ERROR_CODES from './error-codes';
import { isColorThemeEntry, isColorValue, replaceCssVarsWithFallback } from './common';
import { LanguageServiceLogger } from './logger';
import { TokenamiDiagnostics } from './diagnostics';
import { TokenamiCompletions } from './completions';

type ModeValues = Record<string, string>;

/* -------------------------------------------------------------------------------------------------
 * createTSPlugin
 * -----------------------------------------------------------------------------------------------*/

const createTSPlugin = (mod: { typescript: typeof ts }) => ({
  create(info: ts.server.PluginCreateInfo) {
    const logger = new LanguageServiceLogger(info);
    const cwd = info.project.getCurrentDirectory();
    const configPath = tokenami.getConfigPath(cwd, info.config.configPath);
    const configExists = mod.typescript.sys.fileExists(configPath);

    if (!configExists) {
      logger.log(`Config not found at ${configPath}`);
      return info.languageService;
    }

    const ctx = { ts: mod.typescript, info, logger };
    const plugin = new TokenamiPlugin(configPath, ctx);
    return createServiceProxy(info.languageService, plugin);
  },
});

/* -------------------------------------------------------------------------------------------------
 * TokenamiPlugin
 * -----------------------------------------------------------------------------------------------*/

type TokenamiPluginContext = {
  ts: typeof ts;
  info: ts.server.PluginCreateInfo;
  logger: LanguageServiceLogger;
};

class TokenamiPlugin {
  #diagnostics: TokenamiDiagnostics;
  #config: TokenamiConfig.Config;
  #ctx: TokenamiPluginContext;
  #completions: TokenamiCompletions;
  #quotedCompletions: TokenamiCompletions;
  #completionsForPosition: { [entryName: string]: ts.CompletionEntry } | null = null;
  #isIncompleteCompletions = true;

  constructor(configPath: string, context: TokenamiPluginContext) {
    const projectCwd = context.info.project.getCurrentDirectory();
    const projectRoot = findProjectRoot(projectCwd);
    const settingsPath = pathe.join(projectRoot, '.vscode', 'settings.json');

    this.#config = tokenami.getConfigAtPath(configPath);
    this.#diagnostics = new TokenamiDiagnostics(this.#config, context);
    this.#completions = new TokenamiCompletions(this.#config, context);
    this.#isIncompleteCompletions = getIsIncompleteCompletionsSetting(context.ts, settingsPath);
    this.#ctx = context;

    this.#quotedCompletions = new TokenamiCompletions(this.#config, {
      insertFormatter: quotedInsertFormatter,
      logger: context.logger,
    });

    this.#watchConfig(configPath);
    context.logger.log(`Watching config at ${configPath}`);

    try {
      updateEnvFile(configPath, this.#config);
    } catch (e) {
      context.logger.error(`Error updating typedefs: ${e}`);
    }
  }

  #watchConfig(configPath: string) {
    this.#ctx.ts.sys.watchFile?.(configPath, (_fileName, eventKind) => {
      if (eventKind !== this.#ctx.ts.FileWatcherEventKind.Changed) return;
      try {
        const reloadedConfig = tokenami.getConfigAtPath(configPath, { cache: false });
        updateEnvFile(configPath, reloadedConfig);

        this.#ctx.logger.log(`Config changed at ${configPath}}`);
        this.#completions = new TokenamiCompletions(reloadedConfig, this.#ctx);
        this.#quotedCompletions = new TokenamiCompletions(reloadedConfig, {
          insertFormatter: quotedInsertFormatter,
          logger: this.#ctx.logger,
        });
        this.#diagnostics = new TokenamiDiagnostics(reloadedConfig, this.#ctx);
        this.#ctx.info.project.refreshDiagnostics();
        this.#config = reloadedConfig;
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

  getCompletionsAtPosition(
    fileName: string,
    position: number,
    options?: ts.GetCompletionsAtPositionOptions
  ): ReturnType<ts.LanguageService['getCompletionsAtPosition']> {
    const languageService = this.#ctx.info.languageService;
    const original = () => languageService.getCompletionsAtPosition(fileName, position, options);

    const program = languageService.getProgram();
    const sourceFile = program?.getSourceFile(fileName);
    if (!sourceFile) return original();

    const node = findNodeAtPosition(sourceFile, position);
    if (!node) return original();

    const input = this.#parseCompletionsInput(node, fileName, position);
    if (!input) return original();

    if (input.isTokenamiProperty) {
      const rawInput = removeQuotes(input.value);
      const hasQuotes = input.value.startsWith('"') || input.value.startsWith("'");
      const completions = hasQuotes ? this.#completions : this.#quotedCompletions;
      const results = completions.propertySearch(rawInput);
      this.#completionsForPosition = results;

      return {
        entries: Object.values(results),
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        ...(this.#isIncompleteCompletions && { isIncomplete: true }),
        optionalReplacementSpan: {
          start: position - rawInput.length,
          length: rawInput.length,
        },
      };
    } else {
      const result = original();
      const isTokenValue = result?.entries?.some((entry) => {
        return TokenamiConfig.TokenValue.safeParse(entry.name).success;
      });

      if (!isTokenValue) return result;

      const rawInput = removeQuotes(input.value);
      const hasQuotes = input.value.startsWith('"') || input.value.startsWith("'");
      const completions = hasQuotes ? this.#completions : this.#quotedCompletions;
      const results = completions.valueSearch(result?.entries ?? []);
      this.#completionsForPosition = results;

      return {
        entries: Object.values(results),
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        optionalReplacementSpan: {
          start: position - rawInput.length,
          length: rawInput.length,
        },
      };
    }
  }

  getCompletionEntryDetails(
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: ts.FormatCodeSettings,
    source: string,
    preferences: ts.UserPreferences,
    data: ts.CompletionEntryData
  ) {
    const original = this.#ctx.info.languageService.getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data
    );

    const entry = this.#completionsForPosition?.[entryName];
    if (!entry) return original;

    const selector: string | undefined = (entry as any).details?.selector;
    if (selector) return createEntryDetails(original, entry, selector);

    const themeKey: string | undefined = (entry as any).details?.themeKey;
    const token: string | undefined = (entry as any).details?.token;
    if (!themeKey || !token) return original;

    const tokenValue = TokenamiConfig.tokenValue(themeKey, token);
    const modeValues = tokenami.getThemeValuesByThemeMode(tokenValue, this.#config.theme);
    const themeEntries = Object.entries(modeValues);
    const [mode, firstValue] = themeEntries[0] || [];
    if (!firstValue) return original;

    if (isColorValue(firstValue)) {
      const colorDescription = createColorTokenDescription(modeValues);
      const rgb = convertToRgb(replaceCssVarsWithFallback(firstValue), mode);
      return createEntryDetails(original, entry, `${rgb}\n\n${colorDescription}`);
    } else {
      const description = createTokenDescription(modeValues);
      return createEntryDetails(original, entry, description);
    }
  }

  getQuickInfoAtPosition(fileName: string, position: number) {
    const original = this.#ctx.info.languageService.getQuickInfoAtPosition(fileName, position);
    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);

    if (!original || !sourceFile) return;
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
        changes: [{ fileName, textChanges: [{ span: valueSpan, newText: arbitraryText }] }],
      },
    ];
  }

  #parseCompletionsInput(
    node: ts.Node,
    fileName: string,
    position: number
  ): { value: string; isTokenamiProperty: boolean } | null {
    const objLit = ts.findAncestor(node, ts.isObjectLiteralExpression);

    if (!objLit) {
      const text = node.getText();
      return ts.isStringLiteral(node) ? { isTokenamiProperty: false, value: text } : null;
    }

    const isTokenami = this.#isTokenamiObject(objLit, fileName);
    if (!isTokenami) return null;

    const assignmentAtPosition = objLit.properties.find((prop) => {
      const start = prop.getStart();
      const end = prop.getEnd();
      return start <= position && position <= end;
    });

    if (!assignmentAtPosition) return null;
    const assignmentText = assignmentAtPosition.getText();

    if (!ts.isPropertyAssignment(assignmentAtPosition)) {
      return { isTokenamiProperty: true, value: assignmentText };
    }

    const propertyStart = assignmentAtPosition.getStart();
    const relativePosition = position - propertyStart;
    const key = assignmentAtPosition.name.getText();
    const value = assignmentAtPosition.initializer.getText();
    const isTokenamiProperty = !!(key && relativePosition < key.length);

    return { isTokenamiProperty, value: isTokenamiProperty ? key : value };
  }

  #isTokenamiObjectCache = TokenamiConfig.createLRUCache();
  #isTokenamiObject(objLit: ts.ObjectLiteralExpression, fileName: string): boolean {
    const sourceFile = this.#ctx.info.languageService.getProgram()?.getSourceFile(fileName);
    if (!sourceFile) return false;

    // get the text before the opening brace (up to 10 characters)
    const startPos = objLit.getStart(sourceFile);
    const textBeforeBrace = sourceFile.text.substring(Math.max(0, startPos - 10), startPos);

    const cacheKey = `${fileName}:${objLit.pos}:${textBeforeBrace}`;
    if (this.#isTokenamiObjectCache.get(cacheKey)) return true;

    const checker = this.#ctx.info.languageService.getProgram()?.getTypeChecker();
    if (!checker) return false;

    const contextual = checker.getContextualType(objLit);
    if (!contextual) return false;

    const isTokenami = this.#hasTokenamiType(contextual);
    if (isTokenami) this.#isTokenamiObjectCache.set(cacheKey, true);
    return isTokenami;
  }

  #hasTokenamiType(type: ts.Type): boolean {
    const symbol = type.getSymbol();
    const name = symbol?.getName();

    if (name?.startsWith('Tokenami')) return true;

    const aliasSymbol = type.aliasSymbol;
    const aliasName = aliasSymbol?.getName();

    if (aliasName?.startsWith('Tokenami')) return true;

    if (type.isUnion() || type.isIntersection()) {
      return type.types.some((t) => this.#hasTokenamiType(t));
    }

    return false;
  }
}

/* -------------------------------------------------------------------------------------------------
 * updateEnvFile
 * -----------------------------------------------------------------------------------------------*/

function updateEnvFile(configPath: string, _config: TokenamiConfig.Config) {
  const envFilePath = tokenami.getTypeDefsPath(configPath);
  const envFileContent = ts.sys.readFile(envFilePath, 'utf-8');

  if (!envFileContent) throw new Error('Cannot read tokenami.env.d.ts file');
  const updatedEnvFileContent = tokenami.generateTypeDefs(configPath, '../stubs/tokenami.env.d.ts');
  ts.sys.writeFile(envFilePath, updatedEnvFileContent);
}

/* -----------------------------------------------------------------------------------------------
 * quotedInsertFormatter
 * ---------------------------------------------------------------------------------------------*/

function quotedInsertFormatter(name: string, options?: { type: 'value' | 'property' }) {
  if (options?.type === 'value') return `"${name}"`;
  if (name.slice(-1) === '_') return `"${name}\${1}": \${2}`;
  return `"${name}": \${1}`;
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
 * removeQuotes
 * -----------------------------------------------------------------------------------------------*/

function removeQuotes(name: string) {
  return name.replace(/'|"/g, '');
}

/* ---------------------------------------------------------------------------------------------
 * createColorTokenDescription
 * -------------------------------------------------------------------------------------------*/

function createColorTokenDescription(modeValues: ModeValues) {
  const entries = Object.entries(modeValues);
  const rows = entries.map(([mode, value]) => {
    const swatch = createSquare(value, mode);
    return `${swatch}&nbsp;&nbsp;${mode}&nbsp;&nbsp;&nbsp;&nbsp;${value}`;
  });
  return rows.join('\n\n');
}

/* ---------------------------------------------------------------------------------------------
 * createTokenDescription
 * -------------------------------------------------------------------------------------------*/

function createTokenDescription(modeValues: ModeValues) {
  const entries = Object.entries(modeValues);
  return entries.map(([mode, value]) => `${mode}&nbsp;&nbsp;&nbsp;&nbsp;${value}`).join('\n\n');
}

/* ---------------------------------------------------------------------------------------------
 * createSquare
 * -------------------------------------------------------------------------------------------*/

function createSquare(color: string, mode?: string) {
  const fill = convertToRgb(replaceCssVarsWithFallback(color), mode);
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${fill}" /></svg>`;
  return `![](data:image/svg+xml;base64,${btoa(svg)})`;
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

/* -------------------------------------------------------------------------------------------------
 * getIsIncompleteCompletionsSetting
 * -----------------------------------------------------------------------------------------------*/

function getIsIncompleteCompletionsSetting(tsserver: typeof ts, settingsPath: string): boolean {
  if (!tsserver.sys.fileExists(settingsPath)) return true;

  const text = tsserver.sys.readFile(settingsPath, 'utf8');
  if (!text) return true;

  const parsed = tsserver.parseConfigFileTextToJson(settingsPath, text);
  const json = parsed.config as Record<string, any> | undefined;
  if (!json) return true;

  const matchOnWordStartOnly = json['editor.suggest.matchOnWordStartOnly'];
  const filterGraceful = json['editor.suggest.filterGraceful'];

  return matchOnWordStartOnly !== true && filterGraceful !== false;
}

/* -------------------------------------------------------------------------------------------------
 * findProjectRoot
 * -----------------------------------------------------------------------------------------------*/

const workspaceFiles = ['pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json'];

function findProjectRoot(cwd: string): string {
  try {
    const wsMarker = findUp.sync(workspaceFiles, { cwd });
    if (wsMarker) return pathe.dirname(wsMarker);

    const gitDir = findUp.sync('.git', { cwd, type: 'directory' as const });
    if (gitDir) return pathe.dirname(gitDir);

    const pkg = findUp.sync('package.json', { cwd });
    if (pkg) return pathe.dirname(pkg);

    return cwd;
  } catch {
    return cwd;
  }
}

/* ---------------------------------------------------------------------------------------------- */

const createServiceProxy = (
  service: ts.LanguageService,
  plugin: TokenamiPlugin
): ts.LanguageService => {
  const proxy = Object.create(null) as ts.LanguageService;

  for (const key of Object.keys(service) as Array<keyof ts.LanguageService>) {
    const originalMethod = service[key]!;

    proxy[key] = (...args: unknown[]) => {
      if (key in plugin) {
        return (plugin[key as keyof TokenamiPlugin] as Function).apply(plugin, args);
      }
      // from the ts plugin docs:
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      return originalMethod.apply(service, args);
    };
  }

  return proxy;
};

/* ---------------------------------------------------------------------------------------------- */

export { createTSPlugin };
