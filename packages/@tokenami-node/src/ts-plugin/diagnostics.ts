import ts from 'typescript/lib/tsserverlibrary.js';
import * as TokenamiConfig from '@tokenami/config';
import * as pathe from 'pathe';
import * as tokenami from '../utils';
import * as ERROR_CODES from './error-codes';
import { Logger } from './logger';

/* -------------------------------------------------------------------------------------------------
 * TokenamiDiagnostics
 * -----------------------------------------------------------------------------------------------*/

interface TokenamiDiagnosticContext {
  logger?: Logger;
  configPath?: string;
}

type ConfigReferenceDiagnostic = {
  path: readonly string[];
  messageText: string;
  code: number;
};

class TokenamiDiagnostics {
  #config: TokenamiConfig.Config;
  #configPath?: string;
  #configDiagnostics: ConfigReferenceDiagnostic[];

  constructor(config: TokenamiConfig.Config, context: TokenamiDiagnosticContext = {}) {
    this.#config = config;
    this.#configPath = context.configPath;
    this.#configDiagnostics = getConfigReferenceDiagnostics(config);
    context.logger?.log('Setting up diagnostics');
  }

  getSemanticDiagnostics(sourceFile: ts.SourceFile) {
    const diagnostics: ts.Diagnostic[] = [];

    if (sourceFile) {
      if (this.#configDiagnostics) {
        const configDiagnostics = this.#validateConfig(sourceFile, this.#configDiagnostics);
        if (configDiagnostics) diagnostics.push(...configDiagnostics);
      }

      const processNode = this.#processNode.bind(this);
      ts.forEachChild(sourceFile, function nextNode(node: ts.Node): void {
        const nodeDiagnostics = processNode(node, sourceFile);
        if (nodeDiagnostics) diagnostics.push(...nodeDiagnostics);
        ts.forEachChild(node, nextNode);
      });
    }

    return diagnostics;
  }

  #validateConfig(
    sourceFile: ts.SourceFile,
    configDiagnostics: ConfigReferenceDiagnostic[]
  ): ts.Diagnostic[] | undefined {
    if (this.#configPath && !isSamePath(sourceFile.fileName, this.#configPath)) return;

    const config = getCreateConfigObject(sourceFile);
    if (!config) return;

    const initializers = getConfigInitializerMap(config);
    const diagnostics = configDiagnostics.map((diagnostic) => {
      const pathKey = getConfigPathLabel(diagnostic.path);
      const initializer = initializers.get(pathKey) ?? config;

      return {
        file: sourceFile,
        start: initializer.getStart(sourceFile),
        length: initializer.getWidth(sourceFile),
        messageText: diagnostic.messageText,
        category: ts.DiagnosticCategory.Error,
        code: diagnostic.code,
      };
    });

    return diagnostics.length ? diagnostics : undefined;
  }

  #processNode(node: ts.Node, sourceFile: ts.SourceFile) {
    const isDiagnosticPrevented = this.#shouldSuppressDiagnosticForNode(node, sourceFile);
    if (isDiagnosticPrevented) return;

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'css' &&
      node.expression.name.text === 'compose' &&
      node.arguments[0] &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      return this.#validateComposeConfig(node.arguments[0], sourceFile);
    }

    if (ts.isPropertyAssignment(node)) {
      const nodeProperty = ts.isStringLiteral(node.name) ? node.name.text : null;
      const property = TokenamiConfig.TokenProperty.safeParse(nodeProperty);
      if (!property.success) return;
      return this.#validateTokenamiProperty(property.output, node, sourceFile);
    }
  }

  #validateTokenamiProperty(
    property: TokenamiConfig.TokenProperty,
    node: ts.PropertyAssignment,
    sourceFile: ts.SourceFile
  ): ts.Diagnostic[] | undefined {
    const { variants } = TokenamiConfig.getTokenPropertySplit(property);
    const parts = TokenamiConfig.getTokenPropertyParts(property, this.#config);

    const isArbitrarySelector = variants.some(TokenamiConfig.getArbitrarySelector);
    if (!variants.length || parts || isArbitrarySelector) return;

    const selector = variants.join('_');
    const isEmptyArbSelector = variants.includes('{}');
    const arbSuffix = isEmptyArbSelector
      ? ` Add an arbitrary selector or remove '${selector}'.`
      : '';

    return [
      {
        file: sourceFile,
        start: node.getStart(sourceFile),
        length: node.name.getWidth(sourceFile),
        messageText: `Selector '${selector}' does not exist in the Tokenami config.${arbSuffix}`,
        category: ts.DiagnosticCategory.Error,
        code: ERROR_CODES.INVALID_PROPERTY,
      },
    ];
  }

  #validateComposeConfig(
    config: ts.ObjectLiteralExpression,
    sourceFile: ts.SourceFile
  ): ts.Diagnostic[] | undefined {
    const diagnostic = {
      file: sourceFile,
      messageText: `Compose styles must be statically extractable. Use 'includes' to reuse shared styles.`,
      category: ts.DiagnosticCategory.Error,
      code: ERROR_CODES.EXPECT_EXTRACTABLE_COMPOSE,
    };

    for (const prop of config.properties) {
      if (ts.isSpreadAssignment(prop)) {
        const start = prop.getStart(sourceFile);
        const length = prop.getWidth(sourceFile);
        return [{ ...diagnostic, start, length }];
      }

      if (!ts.isPropertyAssignment(prop)) continue;

      const key = prop.name;
      const value = prop.initializer;

      if (ts.isComputedPropertyName(key)) {
        const start = key.getStart(sourceFile);
        const length = key.getWidth(sourceFile);
        return [{ ...diagnostic, start, length }];
      }

      if (ts.isObjectLiteralExpression(value)) {
        return this.#validateComposeConfig(value, sourceFile);
      } else if (
        value.getText(sourceFile).length > 0 &&
        !ts.isIdentifier(key) &&
        !ts.isStringLiteral(value) &&
        !ts.isNumericLiteral(value) &&
        !(
          ts.isPrefixUnaryExpression(value) &&
          value.operator === ts.SyntaxKind.MinusToken &&
          ts.isNumericLiteral(value.operand)
        )
      ) {
        const start = value.getStart(sourceFile);
        const length = value.getWidth(sourceFile);
        return [{ ...diagnostic, start, length }];
      }
    }
  }

  #shouldSuppressDiagnosticForNode(node: ts.Node, sourceFile: ts.SourceFile) {
    if (!sourceFile) return false;
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
}

function getConfigReferenceDiagnostics(config: TokenamiConfig.Config) {
  const diagnostics: ConfigReferenceDiagnostic[] = [];
  const validProperties = tokenami.getValidProperties(config);
  const referenceTheme = getReferenceTheme(config.theme);

  for (const { path, value } of getConfigStringValues(config)) {
    for (const reference of findConfigReferences(value)) {
      const pathLabel = getConfigPathLabel(path);

      if (reference.kind === 'token-value') {
        const { themeKey, token } = TokenamiConfig.getTokenValueParts(reference.value);
        const hasToken = referenceTheme[themeKey]?.[token] != null;
        if (hasToken) continue;

        diagnostics.push({
          path,
          code: ERROR_CODES.INVALID_VALUE,
          messageText: `Config value '${pathLabel}' references '${reference.value}', but '${themeKey}.${token}' does not exist in the Tokenami config.`,
        });
        continue;
      }

      const invalidProperty = getInvalidTokenProperty(reference.value, config, validProperties);
      if (!invalidProperty) continue;

      diagnostics.push({
        path,
        code: ERROR_CODES.INVALID_PROPERTY,
        messageText: `Config value '${pathLabel}' references '${reference.value}', but ${invalidProperty}.`,
      });
    }
  }

  return diagnostics;
}

function getConfigStringValues(config: TokenamiConfig.Config) {
  return [
    ...walkConfigStringValues(config.theme, ['theme']),
    ...walkConfigStringValues(config.globalStyles, ['globalStyles']),
    ...walkConfigStringValues(config.keyframes, ['keyframes']),
  ];
}

function* walkConfigStringValues(
  input: unknown,
  path: readonly string[] = []
): Generator<{
  path: readonly string[];
  value: string;
}> {
  if (typeof input === 'string') {
    yield { path, value: input };
    return;
  }

  if (Array.isArray(input)) {
    for (const [index, item] of input.entries()) {
      yield* walkConfigStringValues(item, [...path, String(index)]);
    }
    return;
  }

  if (!input || typeof input !== 'object') return;

  for (const [key, value] of Object.entries(input)) {
    yield* walkConfigStringValues(value, [...path, key]);
  }
}

type ConfigReference =
  | { kind: 'token-value'; value: TokenamiConfig.TokenValue }
  | { kind: 'token-property'; value: TokenamiConfig.TokenProperty };

function findConfigReferences(input: string) {
  const references: ConfigReference[] = [];

  for (const value of tokenami.findTokens(input)) {
    if (value.startsWith('---')) continue;

    const tokenValue = TokenamiConfig.TokenValue.safeParse(`var(${value})`);
    if (tokenValue.success) {
      references.push({ kind: 'token-value', value: tokenValue.output });
      continue;
    }

    const tokenProperty = TokenamiConfig.TokenProperty.safeParse(value);
    if (tokenProperty.success) {
      references.push({ kind: 'token-property', value: tokenProperty.output });
    }
  }

  return references;
}

function getInvalidTokenProperty(
  property: TokenamiConfig.TokenProperty,
  config: TokenamiConfig.Config,
  validProperties: ReadonlySet<string>
) {
  const { alias, variants } = TokenamiConfig.getTokenPropertySplit(property);
  const isArbitrarySelector = variants.some(TokenamiConfig.getArbitrarySelector);
  const parts = TokenamiConfig.getTokenPropertyParts(property, config);

  if (!validProperties.has(alias)) {
    return `property '${alias}' does not exist in the Tokenami config`;
  }

  if (isArbitrarySelector || !variants.length || parts) return;

  return `selector '${variants.join('_')}' does not exist in the Tokenami config`;
}

function getReferenceTheme(themeConfig: TokenamiConfig.Config['theme']) {
  const theme = tokenami.getThemeFromConfig(themeConfig);
  const modes = Object.values(theme.modes);
  return Object.assign({}, theme.root, ...modes) as TokenamiConfig.Theme;
}

function getCreateConfigObject(sourceFile: ts.SourceFile) {
  let config: ts.ObjectLiteralExpression | undefined;

  function visit(node: ts.Node) {
    if (config) return;

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'createConfig' &&
      node.arguments[0] &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      config = node.arguments[0];
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return config;
}

function getConfigInitializerMap(config: ts.ObjectLiteralExpression) {
  const initializers = new Map<string, ts.Expression>();

  for (const { path, initializer } of getConfigValueInitializerEntries(config)) {
    initializers.set(path, initializer);
  }

  return initializers;
}

function* getConfigValueInitializerEntries(
  node: ts.Expression,
  pathPrefix: readonly string[] = []
): Generator<{ path: string; initializer: ts.Expression }> {
  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = getPropertyName(property.name);
      if (!name) continue;
      yield* getConfigValueInitializerEntries(property.initializer, [...pathPrefix, name]);
    }
    return;
  }

  if (ts.isArrayLiteralExpression(node)) {
    for (const [index, element] of node.elements.entries()) {
      yield* getConfigValueInitializerEntries(element, [...pathPrefix, String(index)]);
    }
    return;
  }

  yield { path: getConfigPathLabel(pathPrefix), initializer: node };
}

function getPropertyName(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
}

function isSamePath(left: string, right: string) {
  return pathe.normalize(left) === pathe.normalize(right);
}

function getConfigPathLabel(path: readonly string[]) {
  return path.join('.');
}

/* ---------------------------------------------------------------------------------------------- */

export { TokenamiDiagnostics };
