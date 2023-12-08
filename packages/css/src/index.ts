export { createCss, css } from './css';
export type VariantProps<T extends () => {}> = Parameters<T>[0] extends undefined | null
  ? {}
  : NonNullable<Parameters<T>[0]>;
