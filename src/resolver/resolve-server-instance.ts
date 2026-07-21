import type {
	McpServerConstructor,
	ZeroArgumentMcpServerConstructor,
} from "../types.js";
import { defaultInstanceResolver } from "./default-instance-resolver.js";
import type { InstanceResolver } from "./instance-resolver.js";

export function resolveMcpServerInstance<T extends object>(
	serverClass: ZeroArgumentMcpServerConstructor<T>,
): Promise<T>;
export function resolveMcpServerInstance<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	resolver: InstanceResolver<T>,
): Promise<T>;
export async function resolveMcpServerInstance<
	T extends object,
	Arguments extends readonly unknown[],
>(
	serverClass: McpServerConstructor<T, Arguments>,
	resolver?: InstanceResolver<T>,
): Promise<T> {
	if (resolver) {
		return resolver.resolve(serverClass);
	}

	return defaultInstanceResolver.resolve(
		serverClass as ZeroArgumentMcpServerConstructor<T>,
	);
}
