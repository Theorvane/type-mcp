# Getting started with `@theorvane/type-mcp@0.2.0`

This guide creates and inspects an MCP **declaration** using the `0.2.0` repository release target. That source also validates and compiles decorated definitions through `createMcpServer()`; the [HTTP guide](http-and-nextjs.md) and [LangChain guide](langchain-langgraph.md) cover their focused adapter boundaries.

## Install the package and configure TypeScript

After `npm view @theorvane/type-mcp@0.2.0 version` succeeds, install the package and import Zod directly in the application that owns its schemas:

```bash
npm install @theorvane/type-mcp zod
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
} from "@theorvane/type-mcp";

@McpServer({ name: "notes", version: "0.2.0" })
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

The public component name defaults to the method name when `name` is omitted. TypeMCP records these options as metadata and `0.2.0` validates the decorated definition before compilation; use application tests for domain-specific naming conventions.

## Inspect metadata at an application boundary

Call `getMcpServerDefinition()` to retrieve the declaration associated with a decorated class:

```ts
// src/inspect-notes-server.ts
import { getMcpServerDefinition } from "@theorvane/type-mcp";
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

## Continue through the runtime boundary

The `0.2.0` release target contains `createMcpServer()`, `startStdioServer()`, `@theorvane/type-mcp/http`, and `@theorvane/type-mcp/langchain`; verify the installed package before relying on them. TypeMCP validates and compiles decorated definitions through an explicit `InstanceResolver`; it does not choose a web host, authorization model, session store, LangGraph topology, model, or persistence policy for the application.

The declaration created above remains useful for application-owned inspection. Consult the [configuration guide](configuration.md), [HTTP guide](http-and-nextjs.md), [LangChain guide](langchain-langgraph.md), and [agent guide](agent-integration.md) before automating a change.
