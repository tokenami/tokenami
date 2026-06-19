import * as lightning from 'lightningcss';
import * as log from './log';
import { createSheet, type CreateSheetParams } from './sheet';

type GenerateSheetParams = CreateSheetParams & {
  output: string;
  minify?: boolean;
  targets?: lightning.Targets;
};

/* -------------------------------------------------------------------------------------------------
 * generate
 * -----------------------------------------------------------------------------------------------*/

function generate(params: GenerateSheetParams) {
  try {
    const sheet = createSheet(params);
    const transformed = lightning.transform({
      code: Buffer.from(sheet),
      filename: params.output,
      minify: params.minify,
      targets: params.targets,
    });

    return transformed.code.toString();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const escapedMessage = message.replace(/(['"])/g, '\\$1');
    log.debug(`Error generating stylesheet: ${message}`);
    return `body::after { content: 'Error generating stylesheet: ${escapedMessage}'; position: fixed; inset: 0; background: #ec6142; color: white; padding: 20px; font-family: sans-serif; z-index: 9999; }`;
  }
}

/* ---------------------------------------------------------------------------------------------- */

export { generate };
