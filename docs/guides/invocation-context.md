# Invocation context, cancellation, and progress

**Availability:** current `dev` source; not included in published `0.3.2`.

Every decorated tool, resource, and prompt handler may opt into a final `McpInvocationContext` argument. Existing handlers remain valid because JavaScript ignores arguments they do not declare.

```ts
import {
  type McpInvocationContext,
  McpServer,
  McpTool,
} from "@theorvane/type-mcp";
import { z } from "zod";

@McpServer({ name: "reports", version: "1.0.0" })
class ReportsServer {
  @McpTool({ input: z.object({ reportId: z.string() }) })
  async generate(
    { reportId }: { readonly reportId: string },
    context: McpInvocationContext,
  ) {
    context.signal.throwIfAborted();

    await context.reportProgress(1, 3, "Loading source data");
    const result = await generateReport(reportId, context.signal);
    await context.reportProgress(3, 3, "Complete");

    return result;
  }
}
```

The context exposes only:

- `requestId`: the request's MCP JSON-RPC identifier.
- `sessionId`: the transport session identifier when one exists.
- `signal`: the SDK's original `AbortSignal`; pass it to cancellable application work.
- `reportProgress(progress, total?, message?)`: sends a progress notification related to the current request.

`reportProgress` is intentionally a no-op when the client did not attach a progress token. A handler therefore does not need to branch on client support.

Tools and URI-template resources receive `(input, context)`. Static resources and zero-argument prompts receive `(context)`. Prompts with explicit arguments receive `(input, context)`.

The context is frozen and does not expose raw SDK notification/request methods, authentication, sampling, elicitation, roots, logging, or application state. Keep authorization and other host policy at the application boundary.

## HTTP progress

Mid-call progress requires a streaming response. The SDK v2 modern HTTP handler defaults to JSON responses, which cannot deliver notifications while the call is running. Configure the HTTP adapter with `enableJsonResponse: false` when the client needs SSE progress delivery. Cancellation still uses the request-scoped SDK signal in either response mode.
