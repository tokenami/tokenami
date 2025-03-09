import ts from 'typescript/lib/tsserverlibrary';
import * as TokenamiConfig from '@tokenami/config';
import * as ERROR_CODES from './error-codes';

/* -------------------------------------------------------------------------------------------------
 * TokenamiDiagnostics
 * -----------------------------------------------------------------------------------------------*/

type TokenamiDiagnosticsContext = {
  ts: typeof ts;
  info: ts.server.PluginCreateInfo;
  checker: ts.TypeChecker;
};

class TokenamiDiagnostics {
  #config: TokenamiConfig.Config;
  #ctx: TokenamiDiagnosticsContext;

  constructor(config: TokenamiConfig.Config, context: TokenamiDiagnosticsContext) {
    this.#config = config;
    this.#ctx = context;
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
    if (isDiagnosticPrevented || !ts.isPropertyAssignment(node)) return;

    const nodeProperty = ts.isStringLiteral(node.name) ? node.name.text : null;
    const property = TokenamiConfig.TokenProperty.safeParse(nodeProperty);
    if (!property.success) return;

    const propertyDiagnostics = this.#validateTokenamiProperty(property.output, node, sourceFile);
    const valueDiagnostics = this.#validateTokenamiValue(property.output, node, sourceFile);

    return [...(propertyDiagnostics ?? []), ...(valueDiagnostics ?? [])];
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
        start: node.getStart(),
        length: node.name.getWidth(),
        messageText: `Tokenami properties may only specify known selectors, and '${selector}' does not exist.${arbSuffix}`,
        category: ts.DiagnosticCategory.Error,
        code: ERROR_CODES.INVALID_PROPERTY,
      },
    ];
  }

  #validateTokenamiValue(
    property: TokenamiConfig.TokenProperty,
    node: ts.PropertyAssignment,
    sourceFile: ts.SourceFile
  ): ts.Diagnostic[] | undefined {
    const valueType = this.#ctx.checker.getTypeAtLocation(node.initializer);
    const propertyType = this.#ctx.checker.getTypeAtLocation(node);

    if (this.#ctx.checker.isTypeAssignableTo(valueType, propertyType)) return;

    const diagnostic = {
      file: sourceFile,
      start: node.initializer.getStart(),
      length: node.initializer.getWidth(),
      category: ts.DiagnosticCategory.Error,
      code: ERROR_CODES.INVALID_VALUE,
    };

    if (ts.isStringLiteral(node.initializer)) {
      const value = node.initializer.text;
      const arbitraryValue = TokenamiConfig.arbitraryValue(value);
      const message = `Value '${value}' is not assignable to Tokenami property '${property}'. Use value from theme or mark arbitrary with '${arbitraryValue}'.`;
      return [{ ...diagnostic, messageText: message }];
    } else if (ts.isNumericLiteral(node.initializer)) {
      const message = `Tokenami grid values are not assignable to '${property}'.`;
      return [{ ...diagnostic, messageText: message }];
    }
  }

  #shouldSuppressDiagnosticForNode(node: ts.Node, sourceFile: ts.SourceFile) {
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
