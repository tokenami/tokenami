import * as Tokenami from '@tokenami/config';
import glob from 'fast-glob';
import * as fs from 'fs';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
import * as csstree from 'css-tree';
import { type TokenamiProperties } from './declarations';
import * as sheet from './sheet';
import * as utils from './utils';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

// - ^.* captures any characters from the start of the line up until css.compose
// - [\s\S]*? non-greedily captures everything within the braces, including line breaks
// - the m (multiline) flag allows ^ to match the start of each line, not just the start
//   of the file contents
const COMPOSE_BLOCKS_REGEX = /(const|let|var)\s+(.+)\s*=\s*css\.compose\(\{[\s\S]*?\}\)/gm;

// we match all css variable looking things (including special chars within curly brackets
// for arbitrary selectors) and determine whether they're a tokenami value/property
// based on tokenami config. we purposefully don't match `var(...)` for values because we want
// consumers to be able to pass a generated stylesheet to `includes` to support external design
// system packages (thanks chat gpt for the regex).
const CSS_VARIABLE_REGEX = /--(?:[\w-]+|\{[^\{\}]*\})+/g;

interface UsedTokens {
  properties: Tokenami.TokenProperty[];
  values: Tokenami.TokenValue[];
  composeBlocks: Record<`.${string}`, TokenamiProperties>;
}

interface FileTokens extends UsedTokens {}

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

  updateFile(filePath: string, content: string) {
    this.#tokensByFile.set(filePath, scanFileContent(content, this.#config.theme));
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
    let composeBlocks: Record<`.${string}`, TokenamiProperties> = {};

    for (const fileTokens of this.#tokensByFile.values()) {
      properties = [...properties, ...fileTokens.properties];
      values = [...values, ...fileTokens.values];
      composeBlocks = { ...composeBlocks, ...fileTokens.composeBlocks };
    }

    return { properties, values, composeBlocks };
  }
}

function scanFileContent(content: string, theme: Tokenami.Config['theme']): FileTokens {
  const tokens = matchTokens(content, theme);
  const composeBlocksContents = content.match(COMPOSE_BLOCKS_REGEX) ?? [];
  let composeBlocks: Record<`.${string}`, TokenamiProperties> = {};

  for (const composeBlock of composeBlocksContents) {
    try {
      const ast = acorn.parse(composeBlock, { ecmaVersion: 'latest' });
      const composeBlockStyles = matchBaseComposeBlocks(ast);
      composeBlocks = { ...composeBlocks, ...composeBlockStyles };
    } catch {}
  }

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
    const fileContent = fs.readFileSync(entry, 'utf8');
    store.updateFile(entry, fileContent);
  });

  return store.getTokens();
}

function matchBaseComposeBlocks(ast: acorn.AnyNode): Record<`.${string}`, TokenamiProperties> {
  const composeBlocks = findComposeBlocks(ast);
  let result: Record<`.${string}`, TokenamiProperties> = {};

  if (!composeBlocks) return result;

  for (const node of composeBlocks) {
    let styles: TokenamiProperties | undefined;

    for (const tokenProperty of node.properties) {
      if (tokenProperty.type === 'Property' && tokenProperty.key.type === 'Literal') {
        let valueExpression = tokenProperty.value;
        let value: acorn.Literal['value'];

        if (
          valueExpression.type === 'UnaryExpression' &&
          valueExpression.operator === '-' &&
          valueExpression.argument.type === 'Literal' &&
          valueExpression.argument.value
        ) {
          value = -valueExpression.argument.value;
        } else if (valueExpression.type === 'Literal') {
          value = valueExpression.value;
        } else {
          continue;
        }

        styles ??= {};
        styles[tokenProperty.key.value as any] = value;
      }
    }

    if (styles) {
      const className = Tokenami.generateClassName(styles);
      result[`.${className}`] = styles;
    }
  }

  return result;
}

function matchTokens(content: string, theme: Tokenami.Config['theme']) {
  const matches = content.match(CSS_VARIABLE_REGEX) || [];
  const stringMatches = Array.from(matches).map(Tokenami.stringifyProperty);
  const uniqueMatches = utils.unique(stringMatches);
  const variableMatches = uniqueMatches.filter((match) => match !== Tokenami.gridProperty());

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

function findComposeBlocks(node: acorn.AnyNode): acorn.ObjectExpression[] | undefined {
  let result: acorn.ObjectExpression[] | undefined;

  acornWalk.simple(node, {
    CallExpression(node) {
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'css' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'compose' &&
        node.arguments?.[0]?.type === 'ObjectExpression'
      ) {
        result ??= [];
        result.push(node.arguments[0]);
      }
    },
  });

  return result;
}

function findSheetComposeBlocks(fileContents: string) {
  const ast = csstree.parse(fileContents);
  let stylesObject: Record<`.${string}`, TokenamiProperties> | undefined;

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
            let styles: TokenamiProperties = {};

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

export { findUsedTokens };
export type { UsedTokens };
