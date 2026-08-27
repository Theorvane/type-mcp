# ADR 0005: Add protocol-backed testing and byte media helpers

- **Status:** Accepted
- **Date:** 2026-08-27
- **Issue:** [#182](https://github.com/Theorvane/type-mcp/issues/182)

## Context

FastMCP makes in-memory protocol testing and image/audio returns convenient. TypeMCP consumers currently repeat official SDK client wiring and manually construct base64 content blocks. Pulling filesystem access into the root package would weaken its framework-neutral, Fetch-compatible boundary.

## Decision

TypeMCP adds an isolated testing subpath that connects the official SDK v2 Client and McpServer through InMemoryTransport. It returns a session with explicit close ownership.

The root exports immutable McpImage and McpAudio byte helpers. They require an explicit image/* or audio/* MIME type, defensively copy bytes and annotations, and produce standard SDK content blocks. Tool normalization converts direct helpers and mixed helper/string lists.

## Consequences

The testing entrypoint adds the split SDK client as a production dependency because packed consumers resolve it at runtime. Media helpers remain browser-neutral and do not read files. Filesystem loading, mocks, snapshots, network transports, and file-resource helpers remain consumer responsibilities.
