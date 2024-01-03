export { createConfig, defaultConfig } from "@tokenami/config";
export { createCss, css } from "./css";
export type Variants<T extends () => {}> = Parameters<T>[0] extends
	| undefined
	| null
	? {}
	: NonNullable<Parameters<T>[0]>;
