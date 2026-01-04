import * as culori from 'culori';

/* -----------------------------------------------------------------------------------------------
 * isColorValue
 * ---------------------------------------------------------------------------------------------*/

function isColorValue(value: string | undefined): boolean {
  if (!value) return false;
  try {
    // culori parses number strings as colours e.g. "300" becomes `{ mode: 'rgb', r: 0,2, g: 0, b: 0 }`
    // so we make sure value cannot coerce to a number before parsing
    const isString = isNaN(Number(value));
    return isString ? Boolean(culori.parse(replaceCssVarsWithFallback(value))) : false;
  } catch {
    return false;
  }
}

/* -----------------------------------------------------------------------------------------------
 * isColorThemeEntry
 * ---------------------------------------------------------------------------------------------*/

function isColorThemeEntry(modeValues: Record<string, string>) {
  const firstValue = Object.values(modeValues || {})?.[0];
  return isColorValue(firstValue);
}

/* -----------------------------------------------------------------------------------------------
 * replaceCssVarsWithFallback
 * ---------------------------------------------------------------------------------------------*/

function replaceCssVarsWithFallback(value: string) {
  // regular expression to find CSS variables with fallback values
  const regex = /var\([\w-_]+,\s*([\w-_]+)\)/g;
  // replace the CSS variables with their fallback values
  return value.replace(regex, (_, fallback) => fallback);
}

/* ---------------------------------------------------------------------------------------------- */

export { isColorValue, isColorThemeEntry, replaceCssVarsWithFallback };
