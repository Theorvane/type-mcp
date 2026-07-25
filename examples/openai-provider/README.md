# OpenAI-compatible provider example

> **Repository development:** this example targets issue [#91](https://github.com/Theorvane/type-mcp/issues/91) and is not installable from published `@theorvane/type-mcp@0.2.0`.

This is the smallest direct OpenAI Responses API call. It does not start an MCP server, create a LangGraph graph, invoke decorated tools, or select providers dynamically.

```ts
import { createOpenAiResponsesProvider } from "@theorvane/type-mcp/openai";

const provider = createOpenAiResponsesProvider();
const result = await provider.generate({
  model: "gpt-4.1-mini",
  input: "Write a concise release note for a fixed validation bug.",
});

if (!result.ok) {
  console.error(result.error.code, result.error.message);
  process.exitCode = 1;
} else {
  console.log(result.text);
}
```

Set the credential in the process environment before running an application:

```bash
export OPENAI_API_KEY='...'
```

For a local compatible endpoint, pass a loopback `baseUrl`, such as `http://127.0.0.1:8080/v1`. The adapter intentionally returns a fixed safe error instead of a raw provider payload; use host-owned logs/observability to diagnose failed live requests.
