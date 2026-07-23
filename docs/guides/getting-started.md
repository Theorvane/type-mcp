# Getting started with `type-mcp@0.1.0`

This guide creates and inspects an MCP **declaration** using the published package. Version `0.1.0` does not validate declarations, compile declarations to an SDK server, invoke decorated methods through MCP, or expose a transport. The last step is deliberately metadata inspection.

## Install the package and configure TypeScript

Install the package and import Zod directly in the application that owns its schemas:

```bash
npm install type-mcp zod
```

Run on Node.js 20 or later. Use standard TypeScript decorators with Node-aware ESM settings. A minimal `tsconfig.json` is:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "ESNext.Decorators"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

These examples use the current standard decorator proposal. Do not turn on legacy `experimentalDecorators` for them. See [configuration and compatibility](configuration.md) if the project is CommonJS or has an existing decorator framework.

## Declare one server class

Put the declaration near the application capability it describes. `@McpServer` decorates the class; `@McpTool`, `@McpResource`, and `@McpPrompt` decorate instance methods.

```ts
// src/notes-server.ts
import { z } from "zod";
import {
  McpPrompt,
  McpResource,
  McpServer,
  McpTool,
} from "type-mcp";

@McpServer({ name: "notes", version: "0.1.0" })
export class NotesServer {
  @McpTool({
    name: "find-note",
    description: "Describe the note lookup operation.",
    input: z.object({ id: z.string().min(1) }),
  })
  findNote({ id }: { id: string }) {
    return { id, title: "Example note" };
  }

  @McpResource({
    name: "notes-config",
    uri: "config://notes",
    mimeType: "application/json",
  })
  readConfig() {
    return { locale: "en" };
  }

  @McpPrompt({
    name: "summarize-note",
    description: "Describe a note-summary prompt.",
  })
  summarizeNote() {
    return "Summarize the supplied note in three bullets.";
  }
}
```

The public component name defaults to the method name when `name` is omitted. TypeMCP records these options as metadata. In `0.1.0`, it does not reject duplicate names or validate declarations; use your own application test and naming convention until a released validation API is available.

## Inspect metadata at an application boundary

Call `getMcpServerDefinition()` to retrieve the declaration associated with a decorated class:

```ts
// src/inspect-notes-server.ts
import { getMcpServerDefinition } from "type-mcp";
import { NotesServer } from "./notes-server.js";

const definition = getMcpServerDefinition(NotesServer);

if (definition === undefined) {
  throw new Error("NotesServer is missing @McpServer metadata.");
}

console.log({
  server: definition.name,
  tools: definition.tools.map((tool) => tool.name),
  resources: definition.resources.map((resource) => resource.uri),
  prompts: definition.prompts.map((prompt) => prompt.name),
});
```

The function returns `undefined` for a class without `@McpServer`. For a decorated class it returns a newly allocated frozen container. Tool input schemas keep their original Zod object identity, because executable schemas cannot safely be cloned or frozen. Do not mutate a schema after passing it to `@McpTool`.

## Stop at the published version boundary

At `0.1.0`, do not call `createMcpServer()` or import `createMcpHandler()` from `type-mcp/http`. Both entry points deliberately throw because they reserve the future public API shape; they are not a runnable server workflow. TypeMCP also has no published instance resolver, tool invocation, SDK registration, stdio, HTTP, or LangChain adapter in this release.

The declaration created above is useful for application-owned inspection and for preparing a later migration. Consult the [configuration guide](configuration.md) and [agent guide](agent-integration.md) before automating a change.
