/* -------------------------------------------------------------------------------------------------
 * hasStyles
 * -----------------------------------------------------------------------------------------------*/

function hasStyles<O extends Record<string, any>>(output: O, expected: Record<string, any>) {
  return Object.entries(expected).every(([key, value]) => output[key] === value);
}

/* -------------------------------------------------------------------------------------------------
 * hasSomeStyles
 * -----------------------------------------------------------------------------------------------*/

function hasSomeStyles<O extends Record<string, any>>(output: O, expected: Record<string, any>) {
  return Object.entries(expected).some(([key, value]) => output[key] === value);
}

/* ---------------------------------------------------------------------------------------------- */
export { hasSomeStyles, hasStyles };
