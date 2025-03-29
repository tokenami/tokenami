import ts from 'typescript/lib/tsserverlibrary.js';
import * as TokenamiConfig from '@tokenami/config';
import * as ERROR_CODES from './error-codes';
import { Logger } from './logger';

/* -------------------------------------------------------------------------------------------------
 * TokenamiDiagnostics
 * -----------------------------------------------------------------------------------------------*/

interface TokenamiDiagnosticContext {
  logger?: Logger;
}

class TokenamiDiagnostics {
  #config: TokenamiConfig.Config;

  constructor(config: TokenamiConfig.Config, context: TokenamiDiagnosticContext = {}) {
    this.#config = config;
    context.logger?.log('Setting up diagnostics');
  }

  getSemanticDiagnostics(sourceFile: ts.SourceFile) {
    let diagnostics: ts.Diagnostic[] = [];

    if (sourceFile) {
      const processNode = this.#processNode.bind(this);
      ts.forEachChild(sourceFile, function nextNode(node: ts.Node): void {
        const nodeDiagnostics = processNode(node, sourceFile);
        if (nodeDiagnostics) diagnostics.push(...nodeDiagnostics);
        ts.forEachChild(node, nextNode);
      });
    }

    return diagnostics;
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

/* ---------------------------------------------------------------------------------------------- */

export { TokenamiDiagnostics };
