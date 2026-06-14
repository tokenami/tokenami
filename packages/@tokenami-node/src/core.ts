import * as Tokenami from '@tokenami/config';
import glob from 'fast-glob';
import * as fs from 'fs';
import * as csstree from 'css-tree';
import ts from 'typescript/lib/tsserverlibrary.js';
import * as pathe from 'pathe';
import * as sheet from './sheet';
import * as utils from './utils';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type ComposeBlock = Record<string, string | number>;
type ComposeBlocks = Record<`.${string}`, ComposeBlock>;

interface UsedTokens {
  properties: Tokenami.TokenProperty[];
  values: Tokenami.TokenValue[];
  composeBlocks: ComposeBlocks;
}

interface FileTokens {
  prevComposeBlocks: ComposeBlocks[];
  current: UsedTokens;
}

const HMR_COMPOSE_BLOCK_HISTORY_LIMIT = 3;

class TokenStore {
  #config: Tokenami.Config;
  #tokensByFile = new Map<string, FileTokens>();

  constructor(config: Tokenami.Config) {
    this.#config = config;
  }

  updateConfig(config: Tokenami.Config) {
    this.#config = config;
  }

  getConfig() {
    return this.#config;
  }

  updateFile(filePath: string, content: string, options?: { mode?: 'hmr' | 'build' }) {
    const tokens = scanFileContent(content, this.#config.theme);
    const fileTokens = this.#tokensByFile.get(filePath);
    const isHmr = options?.mode === 'hmr';
    const prevComposeBlocks = isHmr && fileTokens ? this.#mergePrevComposeBlocks(fileTokens) : [];
    this.#tokensByFile.set(filePath, { prevComposeBlocks, current: tokens });
  }

  removeFile(filePath: string) {
    this.#tokensByFile.delete(filePath);
  }

  hasFile(filePath: string) {
    return this.#tokensByFile.has(filePath);
  }

  clear() {
    this.#tokensByFile.clear();
  }

  getFileCount() {
    return this.#tokensByFile.size;
  }

  getTokens(): UsedTokens {
    let properties: Tokenami.TokenProperty[] = [];
    let values: Tokenami.TokenValue[] = [];
    let composeBlocks: ComposeBlocks = {};

    for (const fileTokens of this.#tokensByFile.values()) {
      properties = [...properties, ...fileTokens.current.properties];
      values = [...values, ...fileTokens.current.values];
      composeBlocks = Object.assign(
        {},
        composeBlocks,
        ...fileTokens.prevComposeBlocks,
        fileTokens.current.composeBlocks
      );
    }

    return { properties, values, composeBlocks };
  }

  #mergePrevComposeBlocks(fileTokens: FileTokens) {
    const merged = [fileTokens.current.composeBlocks, ...fileTokens.prevComposeBlocks];
    return merged.slice(0, HMR_COMPOSE_BLOCK_HISTORY_LIMIT);
  }
}

function scanFileContent(content: string, theme: Tokenami.Config['theme']): UsedTokens {
  const tokens = matchTokens(content, theme);
  let composeBlocks = findComposeBlocks(content);

  if (content.includes(sheet.LAYERS.COMPONENTS)) {
    const sheetComposeBlocks = findSheetComposeBlocks(content);
    composeBlocks = { ...composeBlocks, ...sheetComposeBlocks };
  }

  return { properties: tokens.properties, values: tokens.values, composeBlocks };
}

async function findUsedTokens(cwd: string, config: Tokenami.Config): Promise<UsedTokens> {
  const include = config.include as Writeable<typeof config.include>;
  const exclude = config.exclude as Writeable<typeof config.exclude>;
  const entries = await glob(include, { cwd, onlyFiles: true, stats: false, ignore: exclude });
  const store = new TokenStore(config);

  entries.forEach((entry) => {
    const fileContent = fs.readFileSync(pathe.join(cwd, entry), 'utf8');
    store.updateFile(entry, fileContent);
  });

  return store.getTokens();
}

function findComposeBlocks(content: string): ComposeBlocks {
  const sourceFile = ts.createSourceFile('tokenami.tsx', content, ts.ScriptTarget.Latest, true);
  let result: ComposeBlocks = {};

  function visit(node: ts.Node) {
    if (
      isComposeCall(node) &&
      node.arguments[0] &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      const styles = getComposeBlockStyles(node.arguments[0]);

      if (styles) {
        const className = Tokenami.generateClassName(styles);
        result[`.${className}`] = styles;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}

function isComposeCall(node: ts.Node): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) return false;
  if (!ts.isPropertyAccessExpression(node.expression)) return false;

  return (
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === 'css' &&
    node.expression.name.text === 'compose'
  );
}

function getComposeBlockStyles(node: ts.ObjectLiteralExpression): ComposeBlock | undefined {
  let styles: ComposeBlock | undefined;

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (!ts.isStringLiteral(property.name) && !ts.isNumericLiteral(property.name)) continue;

    const value = getLiteralValue(property.initializer);
    if (value === undefined) continue;

    styles ??= {};
    styles[property.name.text] = value;
  }

  return styles;
}

function getLiteralValue(node: ts.Expression) {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);

  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }
}

function matchTokens(content: string, theme: Tokenami.Config['theme']) {
  const variableMatches = utils
    .findUniqueTokens(content)
    .filter((match) => match !== Tokenami.gridProperty());

  const values = variableMatches.flatMap((match) => {
    const valueProperty = Tokenami.TokenValue.safeParse(`var(${match})`);
    if (!valueProperty.success) return [];
    const themeValues = utils.getThemeValuesByThemeMode(valueProperty.output, theme);
    return Object.entries(themeValues).length ? [valueProperty.output] : [];
  });

  const properties = variableMatches.flatMap((match) => {
    const tokenProperty = Tokenami.TokenProperty.safeParse(match);
    const isValue = (values as string[]).includes(`var(${match})`);
    if (isValue || !tokenProperty.success) return [];
    return tokenProperty.output;
  });

  return { properties, values };
}

function findSheetComposeBlocks(fileContents: string) {
  const ast = csstree.parse(fileContents);
  let stylesObject: ComposeBlocks | undefined;

  csstree.walk(ast, {
    visit: 'Atrule',
    enter(node) {
      if (
        node.name === 'layer' &&
        node.prelude &&
        csstree.generate(node.prelude) === sheet.LAYERS.COMPONENTS
      ) {
        csstree.walk(node, {
          visit: 'Rule',
          enter(ruleNode) {
            if (!ruleNode.prelude || !ruleNode.block) return;
            const selector = csstree.generate(ruleNode.prelude).trim();
            let styles: ComposeBlock = {};

            csstree.walk(ruleNode.block, {
              visit: 'Declaration',
              enter(declNode) {
                const escapedProperty = declNode.property.trim();
                const property = Tokenami.stringifyProperty(escapedProperty);
                const value = csstree.generate(declNode.value).trim();
                styles[property as any] = value as any;
              },
            });

            stylesObject ??= {};
            stylesObject[selector as `.${string}`] = styles;
          },
        });
      }
    },
  });

  return stylesObject;
}

export { TokenStore, findUsedTokens };
export type { UsedTokens, ComposeBlocks };
