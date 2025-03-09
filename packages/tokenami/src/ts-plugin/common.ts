import * as culori from 'culori';
import * as TokenamiConfig from '@tokenami/config';

/* -------------------------------------------------------------------------------------------------
 * getSortText
 * -----------------------------------------------------------------------------------------------*/

function getSortText(name: string) {
  const regex = new RegExp(`['"-]|${TokenamiConfig.tokenProperty('')}`, 'g');
  name = name.replace(regex, '').replace(/[0-9]+/g, (m) => m.padStart(6, '0'));
  return `$${name}`;
}

/* -----------------------------------------------------------------------------------------------
 * isColorThemeEntry
 * ---------------------------------------------------------------------------------------------*/

function isColorThemeEntry(modeValues: Record<string, string>) {
  try {
    const firstValue = Object.values(modeValues || {})?.[0];
    // culori parses number strings as colours e.g. "300" becomes `{ mode: 'rgb', r: 0,2, g: 0, b: 0 }`
    // so we make sure value cannot coerce to a number before parsing
    const isString = isNaN(Number(firstValue));
    return isString ? Boolean(culori.parse(replaceCssVarsWithFallback(firstValue || ''))) : false;
  } catch {
    return false;
  }
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

export { getSortText, isColorThemeEntry, replaceCssVarsWithFallback };
