import { TokenamiProperties } from "@tokenami/dev";
import config from "./tokenami.config";

export type Config = typeof config;

declare module "@tokenami/dev" {
	type TokenamiConfig = Config;
}

declare module "react" {
	type CSSProperties = TokenamiProperties;
}
