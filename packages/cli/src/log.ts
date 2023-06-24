import { Chalk } from 'chalk';

const chalk = new Chalk({ level: 1 });

/* -------------------------------------------------------------------------------------------------
 * error
 * -----------------------------------------------------------------------------------------------*/

function error(str: string) {
  console.error(`${chalk.bgRed(' TOKENAMI ')} ${chalk.red(str)}`);
  process.exit(1);
}

/* -------------------------------------------------------------------------------------------------
 * debug
 * -----------------------------------------------------------------------------------------------*/

function debug(str: string) {
  console.debug(`${chalk.bgYellow(' TOKENAMI ')} ${chalk.yellow(str)}`);
}

/* ---------------------------------------------------------------------------------------------- */

export { error, debug };