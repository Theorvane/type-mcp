# OpenAI-compatible provider API

> **Status:** Repository-development contract for issue [#91](https://github.com/Theorvane/type-mcp/issues/91). It is not included in published `@theorvane/type-mcp@0.2.0`.

The `@theorvane/type-mcp/openai` subpath is an opt-in Fetch client for the OpenAI Responses API. It is not a TypeMCP server compiler, transport, model registry, or agent runtime.

```ts
import { createOpenAiResponsesProvider } from "@theorvane/type-mcp/openai";

const provider = createOpenAiResponsesProvider();
const result = await provider.generate({
  model: "gpt-4.1-mini",
  input: "Write a concise release note.",
});

if (result.ok) {
  console.log(result.text);
}
```

## Contracts

```ts
interface OpenAiResponsesRequest {
  readonly model: string;
  readonly input: string;
  readonly instructions?: string | undefined;
}

type OpenAiResponsesResult =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly error: OpenAiProviderFailure };
```

| A/E/X case | Behavior |
| --- | --- |
| Accept | `model` and `input` must be non-empty strings. Optional `instructions`, when defined, must also be a non-empty string and is sent only then. |
| Accept | The provider sends one JSON `POST` request to `{baseUrl}/responses` with `Authorization: Bearer <apiKey>`. |
| Accept | `output[].content[]` values with `type: "output_text"` are joined in order into `text`. |
| Error | A blank/missing key, malformed base URL, or invalid request returns `ok: false` with code `configuration`; Fetch is not called. |
| Error | A network rejection, abort, or non-2xx HTTP response returns the fixed `request` failure. |
| Error | Invalid JSON or a successful payload without non-empty output text returns the fixed `response` failure. |
| Excluded | Streaming, retries, model discovery, tool-calling orchestration, provider selection, and application authentication policy. |

Returned failures deliberately exclude API keys, provider response bodies, status text, and thrown error messages.
