# type-mcp

<p align="center">
  <img src="docs/assets/type-mcp-hero.png" alt="Abstract decorator tiles flowing through a modular core toward web and dependency integrations" width="100%" />
</p>

> **MVP in development.** Decorator metadata storage is implemented and verified. MCP SDK compilation, instance resolution, stdio, and HTTP transport remain planned work.

A decorator-first TypeScript framework for building [Model Context Protocol](https://modelcontextprotocol.io/) servers. `type-mcp` combines declarative class APIs with the official MCP SDK, while keeping the core independent of HTTP frameworks and NestJS.

## Why type-mcp?

- **Declarative:** Describe a server, tools, resources, and prompts on a class.
- **Type-safe:** strict TypeScript and Zod runtime boundaries.
- **Portable:** core does not depend on NestJS, Next.js, or a specific web server.
- **Web-ready:** a Fetch-first Streamable HTTP adapter is planned for Next.js and other Web Standard runtimes.
- **Nest-ready:** an `InstanceResolver` seam will let a future `@type-mcp/nestjs` package use Nest DI without coupling the core to Nest.

## Planned package layout

| Package | Responsibility | Status |
| --- | --- | --- |
| `@type-mcp/core` | Decorators, metadata, compilation to the official MCP SDK, stdio helper | planned MVP |
| `@type-mcp/http` | Fetch `Request → Response` Streamable HTTP adapter | planned MVP |
| `@type-mcp/nestjs` | NestJS discovery, DI, and module integration | deferred |

## Target developer experience

```ts
import { z } from "zod";
import { McpServer, McpTool, createMcpServer } from "@type-mcp/core";

@McpServer({ name: "calculator", version: "0.1.0" })
class CalculatorServer {
  @McpTool({
    description: "Add two numbers.",
    input: z.object({ left: z.number(), right: z.number() }),
  })
  add({ left, right }: { left: number; right: number }) {
    return String(left + right);
  }
}

const server = await createMcpServer(CalculatorServer);
```

The snippet represents the approved API direction, not a currently released package contract.

## Documentation

- [Documentation index](docs/README.md)
- [Product vision](docs/product/vision.md)
- [MVP scope](docs/product/mvp-scope.md)
- [Architecture overview](docs/architecture/overview.md)
- [Decorator API contract](docs/api/decorator-api.md)
- [Approved design](docs/superpowers/specs/2026-07-21-type-mcp-design.md)
- [MVP implementation plan](docs/planning/2026-07-21-mvp-implementation-plan.md)

## Development status

The current repository contains approved product/design documents and the contributor-agent harness. Implementation begins with a strict npm workspace and test baseline; follow the [MVP implementation plan](docs/planning/2026-07-21-mvp-implementation-plan.md).

## License

Planned: MIT. The license file is added alongside the package scaffold before publication.
