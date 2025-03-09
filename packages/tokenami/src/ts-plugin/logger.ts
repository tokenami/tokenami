import ts from 'typescript/lib/tsserverlibrary';

/* -------------------------------------------------------------------------------------------------
 * LanguageServiceLogger
 * -----------------------------------------------------------------------------------------------*/

class LanguageServiceLogger implements Logger {
  #info: ts.server.PluginCreateInfo;

  constructor(info: ts.server.PluginCreateInfo) {
    this.#info = info;
  }

  log(message: string) {
    this.#info.project.projectService.logger.info(`Tokenami:: ${message}`);
  }

  error(message: string) {
    this.#info.project.projectService.logger.info(`Tokenami:: ${message}`);
  }
}

/* -------------------------------------------------------------------------------------------------
 * Logger
 * -----------------------------------------------------------------------------------------------*/

class Logger {
  log(_message: string) {
    throw new Error('Not implemented');
  }
  error(_message: string) {
    throw new Error('Not implemented');
  }
}

/* ---------------------------------------------------------------------------------------------- */

export { LanguageServiceLogger, Logger };
