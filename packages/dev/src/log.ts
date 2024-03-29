import chalk from 'chalk';

/* -------------------------------------------------------------------------------------------------
 * error
 * -----------------------------------------------------------------------------------------------*/

function error(str: string): never {
  console.error(`${chalk.bgRed(' tokenami ')} ${chalk.red(str)}`);
  process.exit(1);
}

/* -------------------------------------------------------------------------------------------------
 * debug
 * -----------------------------------------------------------------------------------------------*/

function debug(str: string) {
  console.debug(`${chalk.bgYellow(' tokenami ')} ${chalk.yellow(str)}`);
}

/* ---------------------------------------------------------------------------------------------- */

export { error, debug };
