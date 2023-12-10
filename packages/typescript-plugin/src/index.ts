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

    const cwd = info.project.getCurrentDirectory();
    const configPath = ConfigUtils.getConfigPath(cwd, info.config.configPath);
    const configExists = modules.typescript.sys.fileExists(configPath);

    if (!configExists) {
      info.project.projectService.logger.info(`TOKENAMI: Cannot find config`);
      return proxy;
    }

    const config = ConfigUtils.getConfigAtPath(configPath);
    const tokenConfigMap = new Map<string, { themeKey: string; tokenValue: string | number }>();

    // info.project.projectService.logger.info(`DEBUG:: ${JSON.stringify(config)}`);

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const original = info.languageService.getCompletionsAtPosition(fileName, position, options);
      if (!original) return original;

      original.entries = original.entries.map((entry) => {
        const entryName = entry.name;
        entry.sortText = entryName;

        if (ConfigUtils.TokenProperty.safeParse(entryName).success) {
          const { variants } = ConfigUtils.getTokenPropertyParts(entryName as any);
          const responsive = config.responsive;
          // token properties win in sort order
          entry.sortText = `$${entryName}`;
          if (responsive) {
            const key = variants.find((variant) => responsive[variant]);
            if (key) {
              entry.labelDetails = { detail: '', description: config.responsive?.[key] };
            }
          }
        }

        if (ConfigUtils.TokenValue.safeParse(entryName).success) {
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
