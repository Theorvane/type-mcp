# OpenAI-compatible provider guide

> **Status:** Repository-development guide for issue [#91](https://github.com/Theorvane/type-mcp/issues/91). This subpath is not in published `@theorvane/type-mcp@0.2.0`.

Use `@theorvane/type-mcp/openai` when an application already owns its model lifecycle and needs one direct, non-streaming OpenAI Responses request. It does not turn a decorated MCP server into an agent and it does not execute MCP tools automatically.

## Credentials

The default credential source is `OPENAI_API_KEY`:

```bash
export OPENAI_API_KEY='...'
```

An explicit `apiKey` option has precedence over the environment value. Do not log either value, pass it through browser bundles, or put it in a public repository.

## Basic call

```ts
import { createOpenAiResponsesProvider } from "@theorvane/type-mcp/openai";

const provider = createOpenAiResponsesProvider();
const result = await provider.generate({
  model: "gpt-4.1-mini",
  input: "Summarize this catalog in two sentences.",
  instructions: "Use plain English.",
});

if (!result.ok) {
  console.error(result.error.code, result.error.message);
  process.exitCode = 1;
} else {
  console.log(result.text);
}
```

## Compatible endpoints

Set `baseUrl` only for an endpoint that supports the OpenAI Responses API request and response subset. HTTPS URLs are accepted; HTTP is restricted to loopback hosts for local development.

```ts
const provider = createOpenAiResponsesProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
});
```

## Boundaries

The adapter has no streaming, automatic retry, tool loop, model discovery, authorization, persistence, or deployment behavior. The host owns those policies and should use its own observability system; public provider results intentionally contain no raw provider error details.
