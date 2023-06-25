import type * as CSS from 'csstype';
import type { Config } from '~/config';

type PropertyDef = { themeKey: keyof Config['theme'] | 'unknown'; initialValue: string };

const ALL_PSEUDO = ['hover', 'focus', 'active', 'disabled'];

const PROPERTY_TO_TYPE: Partial<Record<keyof CSS.PropertiesHyphen, PropertyDef>> = {
  color: { themeKey: 'colors', initialValue: '' },
  'background-color': { themeKey: 'colors', initialValue: '' },
  padding: { themeKey: 'space', initialValue: '0' },
  'padding-top': { themeKey: 'space', initialValue: '0' },
  'padding-left': { themeKey: 'space', initialValue: '0' },
  'padding-right': { themeKey: 'space', initialValue: '0' },
  'padding-bottom': { themeKey: 'space', initialValue: '0' },
  margin: { themeKey: 'space', initialValue: '0' },
  'margin-top': { themeKey: 'space', initialValue: '0' },
  'margin-bottom': { themeKey: 'space', initialValue: '0' },
  'margin-left': { themeKey: 'space', initialValue: '0' },
  'margin-right': { themeKey: 'space', initialValue: '0' },
  'column-gap': { themeKey: 'space', initialValue: '0' },
  'row-gap': { themeKey: 'space', initialValue: '0' },
  'border-radius': { themeKey: 'radii', initialValue: '0' },
  width: { themeKey: 'unknown', initialValue: '' },
  'min-width': { themeKey: 'unknown', initialValue: '' },
  height: { themeKey: 'unknown', initialValue: '' },
  'min-height': { themeKey: 'unknown', initialValue: '' },
  display: { themeKey: 'unknown', initialValue: '' },
  'flex-direction': { themeKey: 'unknown', initialValue: '' },
  'grid-template-columns': { themeKey: 'unknown', initialValue: '' },
  'grid-template-areas': { themeKey: 'unknown', initialValue: '' },
  'grid-template-rows': { themeKey: 'unknown', initialValue: '' },
  'font-size': { themeKey: 'unknown', initialValue: '' },
  'font-weight': { themeKey: 'unknown', initialValue: '' },
  'line-height': { themeKey: 'unknown', initialValue: '' },
  border: { themeKey: 'unknown', initialValue: '' },
  'border-width': { themeKey: 'unknown', initialValue: '' },
  'border-style': { themeKey: 'unknown', initialValue: '' },
  'text-align': { themeKey: 'unknown', initialValue: '' },
  'object-fit': { themeKey: 'unknown', initialValue: '' },
  overflow: { themeKey: 'unknown', initialValue: '' },
};

/* ---------------------------------------------------------------------------------------------- */

export { PROPERTY_TO_TYPE, ALL_PSEUDO };
