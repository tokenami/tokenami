import type * as CSS from 'csstype';
import type { Theme } from '~/theme';

type PropertyConfig = { themeKey: keyof Theme | 'unknown'; initial?: string };

const PROPERTY_TO_TYPE = {
  color: { themeKey: 'colors' },
  'background-color': { themeKey: 'colors' },
  'padding-top': { themeKey: 'space', initial: '0' },
  'padding-left': { themeKey: 'space', initial: '0' },
  'padding-right': { themeKey: 'space', initial: '0' },
  'padding-bottom': { themeKey: 'space', initial: '0' },
  'margin-top': { themeKey: 'space', initial: '0' },
  'margin-bottom': { themeKey: 'space', initial: '0' },
  'margin-left': { themeKey: 'space', initial: '0' },
  'margin-right': { themeKey: 'space', initial: '0' },
  'column-gap': { themeKey: 'space', initial: '0' },
  'row-gap': { themeKey: 'space', initial: '0' },
  'border-radius': { themeKey: 'radii' },
  width: { themeKey: 'unknown' },
  'min-width': { themeKey: 'unknown' },
  height: { themeKey: 'unknown' },
  'min-height': { themeKey: 'unknown' },
  display: { themeKey: 'unknown' },
  'flex-direction': { themeKey: 'unknown' },
  'align-items': { themeKey: 'unknown' },
  'justify-content': { themeKey: 'unknown' },
  'grid-template-columns': { themeKey: 'unknown' },
  'grid-template-areas': { themeKey: 'unknown' },
  'grid-template-rows': { themeKey: 'unknown' },
  'font-size': { themeKey: 'unknown' },
  'font-weight': { themeKey: 'unknown' },
  'font-family': { themeKey: 'unknown' },
  'line-height': { themeKey: 'unknown' },
  border: { themeKey: 'unknown' },
  'border-width': { themeKey: 'unknown' },
  'border-style': { themeKey: 'unknown' },
  'text-align': { themeKey: 'unknown' },
  'object-fit': { themeKey: 'unknown' },
  overflow: { themeKey: 'unknown' },
} satisfies Partial<Record<keyof CSS.PropertiesHyphen, PropertyConfig>>;

type TokenamiProperty = keyof typeof PROPERTY_TO_TYPE & {};
const ALL_PROPERTIES = Object.keys(PROPERTY_TO_TYPE) as TokenamiProperty[];
const ALL_PSEUDO = ['hover', 'focus', 'active', 'disabled'];

/* ---------------------------------------------------------------------------------------------- */

export type { TokenamiProperty, Theme };
export { PROPERTY_TO_TYPE, ALL_PROPERTIES, ALL_PSEUDO };
