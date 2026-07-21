<div align="center">
  <img src="docs/assets/type-mcp-hero.png" alt="Abstract decorator tiles flowing through a modular core toward web and dependency integrations" width="100%" />

  <h1>TypeMCP</h1>

  **Decorator-first MCP servers for TypeScript.**

  [![MVP status](https://img.shields.io/badge/status-MVP%20in%20development-5B5BD6?style=flat-square)](docs/product/mvp-scope.md)
  [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.base.json)
  [![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-SDK%20first-7C3AED?style=flat-square)](https://modelcontextprotocol.io/)
  [![License](https://img.shields.io/badge/license-MIT-111827?style=flat-square)](LICENSE)
</div>

TypeMCP is a decorator-first TypeScript framework for defining [Model Context Protocol](https://modelcontextprotocol.io/) servers. It keeps declarations close to application code while preserving a framework-neutral core that can later support Fetch-based HTTP and NestJS dependency injection without making either a core dependency.

> **Current status:** Decorator metadata storage is implemented and verified. MCP SDK compilation, instance resolution, stdio, and HTTP transport are planned MVP work.

## Define MCP components where they belong

Decorate a class with the server, tool, resource, and prompt declarations that describe its MCP surface. TypeMCP records an immutable definition that later compiler work will turn into an MCP SDK server.

```ts
import { z } from "zod";
import { McpServer, McpTool } from "@type-mcp/core";

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
```

The declarations above are available today. Calling `createMcpServer()`, connecting stdio, or serving Streamable HTTP is intentionally not available until their focused implementation issues land.

## What exists today

| Surface | Status | Details |
| --- | --- | --- |
| `@McpServer` | Available | Records immutable server identity metadata. |
| `@McpTool` | Available | Records a method name, optional public name/description, and Zod object schema. |
| `@McpResource` | Available | Records a static resource declaration. |
| `@McpPrompt` | Available | Records a named prompt declaration. |
| `getMcpServerDefinition()` | Available | Reads a newly allocated frozen definition container. |
| `createMcpServer()` | Planned | Will validate declarations, resolve instances, and register them with the official MCP SDK. |
| `@type-mcp/http` | Planned | Will expose a Fetch `Request` → `Response` Streamable HTTP adapter. |
| `@type-mcp/nestjs` | Deferred | Will bridge Nest discovery and DI through the core resolver seam. |

## Design principles

**Decorators describe; compilers execute.** Decorators are declaration-only. They do not instantiate application classes, start transports, or perform runtime protocol registration.

**Framework neutrality is a boundary.** `@type-mcp/core` has no NestJS, Next.js, or web-server dependency. A future adapter can implement DI behavior without pulling framework concerns into the core package.

**The MCP SDK remains authoritative.** TypeMCP is an ergonomic definition and compilation layer, not a replacement protocol implementation.

**Runtime boundaries must stay explicit.** Planned compiler work will validate raw tool input with Zod and convert handler failures into safe MCP-visible errors without exposing application stacks.

## Package roadmap

| Package | Role | Status |
| --- | --- | --- |
| `@type-mcp/core` | Decorators, metadata, validation/compiler, resolver seam, stdio helper | Metadata available; compiler and transport planned |
| `@type-mcp/http` | Fetch-compatible Streamable HTTP adapter | Planned |
| `@type-mcp/nestjs` | NestJS discovery and DI integration | Deferred |

## Explore the project

- [Product vision](docs/product/vision.md) — the problem, users, and target outcomes.
- [MVP scope](docs/product/mvp-scope.md) — included boundaries and explicitly deferred work.
- [Architecture overview](docs/architecture/overview.md) — package layers, target runtime flow, and NestJS boundary.
- [Decorator API contract](docs/api/decorator-api.md) — available metadata behavior and planned compiler contracts.
- [Implementation plan](docs/planning/2026-07-21-mvp-implementation-plan.md) — TDD task order and acceptance criteria.
- [Contributing guide](CONTRIBUTING.md) — issue → branch → PR workflow and local checks.
- [npm release readiness](docs/guides/npm-release.md) — scope ownership and release safeguards.

## Develop locally

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:packages
```

Every repository change follows a focused **GitHub Issue → issue-numbered branch → pull request → review and CI → squash merge** flow. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor workflow.

## License

[MIT](LICENSE)
