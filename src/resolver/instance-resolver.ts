import type { McpServerConstructor } from "../types.js";

export interface InstanceResolver {
	resolve<T extends object>(
		serverClass: McpServerConstructor<T>,
	): T | Promise<T>;
}
