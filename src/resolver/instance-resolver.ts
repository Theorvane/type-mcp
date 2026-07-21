import type { McpServerConstructor } from "../types.js";

export interface InstanceResolver<T extends object = object> {
	resolve<Arguments extends readonly unknown[]>(
		serverClass: McpServerConstructor<T, Arguments>,
	): T | Promise<T>;
}
