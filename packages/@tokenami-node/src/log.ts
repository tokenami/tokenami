const ANSI = {
  red: '\x1b[31m',
  bgRed: '\x1b[41m',
  yellow: '\x1b[33m',
  bgYellow: '\x1b[43m',
  reset: '\x1b[0m',
};

function color(code: string, str: string) {
  return `${code}${str}${ANSI.reset}`;
}

/* -------------------------------------------------------------------------------------------------
 * error
 * -----------------------------------------------------------------------------------------------*/

function error(str: string): never {
  console.error(`${color(ANSI.bgRed, ' tokenami ')} ${color(ANSI.red, str)}`);
  process.exit(1);
}

/* -------------------------------------------------------------------------------------------------
 * debug
 * -----------------------------------------------------------------------------------------------*/

function debug(str: string) {
  console.debug(`${color(ANSI.bgYellow, ' tokenami ')} ${color(ANSI.yellow, str)}`);
}

/* ---------------------------------------------------------------------------------------------- */

export { error, debug };
