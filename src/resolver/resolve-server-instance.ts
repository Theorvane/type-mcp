import type { McpServerConstructor } from "../types.js";
import { defaultInstanceResolver } from "./default-instance-resolver.js";
import type { InstanceResolver } from "./instance-resolver.js";

export async function resolveMcpServerInstance<T extends object>(
	serverClass: McpServerConstructor<T>,
	resolver: InstanceResolver = defaultInstanceResolver,
): Promise<T> {
	return resolver.resolve(serverClass);
}
