import ts from 'typescript/lib/tsserverlibrary';
import * as ConfigUtils from '@tokenami/config';

function init(modules: { typescript: typeof ts }) {
  function create(info: ts.server.PluginCreateInfo) {
    // Set up decorator object
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const program = info.languageService.getProgram();
    if (!program) throw new Error('Missing program');

    const cwd = program.getCompilerOptions().baseUrl || '.';
    const configPath = ConfigUtils.getConfigPath(cwd, info.config.configPath);
    const config: ConfigUtils.Config = require(configPath);
    const tokenConfigMap = new Map<string, { themeKey: string; tokenValue: string | number }>();

    // info.project.projectService.logger.info(`DEBUG::);

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const original = info.languageService.getCompletionsAtPosition(fileName, position, options);
      if (!original) return original;

      original.entries = original.entries.map((entry) => {
        const entryName = entry.name;
        entry.sortText = entryName;

        if (entryName.startsWith('---')) {
          const variant = ConfigUtils.getTokenPropertyVariant(entryName as any);
          const mediaValue = variant ? config.media?.[variant] : undefined;
          // token properties win in sort order
          entry.sortText = `$${entryName}`;
          if (mediaValue) {
            entry.labelDetails = { detail: '', description: mediaValue };
          }
        }

        if (entryName.startsWith('var(---')) {
          const parts = ConfigUtils.getTokenValueParts(entryName as any);
          const tokenValue = parts ? config.theme[parts.themeKey]?.[parts.token] : undefined;
          if (parts && tokenValue) {
            tokenConfigMap.set(parts.token, { themeKey: parts.themeKey, tokenValue });
            entry.name = `$${parts.token}`;
            entry.kindModifiers = parts.themeKey;
            entry.insertText = entryName;
            entry.labelDetails = {
              detail: '',
              description: entryName,
            };
          }
        }

        return entry;
      });

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
        kind: modules.typescript.ScriptElementKind.string,
        kindModifiers: entryConfig.themeKey,
        displayParts: [{ text: String(entryConfig.tokenValue), kind: 'markdown' }],
      };
    };

    return proxy;
  }

  return { create };
}

export = init;
