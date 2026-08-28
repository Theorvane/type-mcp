import type { RequestId, ServerContext } from "@modelcontextprotocol/server";

export interface McpInvocationContext {
	readonly requestId: RequestId;
	readonly sessionId?: string;
	readonly signal: AbortSignal;
	reportProgress(
		progress: number,
		total?: number,
		message?: string,
	): Promise<void>;
}

export function createMcpInvocationContext(
	context: ServerContext,
): McpInvocationContext {
	const progressToken = context.mcpReq._meta?.progressToken;
	return Object.freeze({
		requestId: context.mcpReq.id,
		...(context.sessionId === undefined
			? {}
			: { sessionId: context.sessionId }),
		signal: context.mcpReq.signal,
		async reportProgress(
			progress: number,
			total?: number,
			message?: string,
		): Promise<void> {
			if (progressToken === undefined) {
				return;
			}
			await context.mcpReq.notify({
				method: "notifications/progress",
				params: {
					progressToken,
					progress,
					...(total === undefined ? {} : { total }),
					...(message === undefined ? {} : { message }),
				},
			});
		},
	});
}
