# ADR 0006: Add server-level component visibility

- **Status:** Accepted
- **Date:** 2026-08-27
- **Issue:** [#184](https://github.com/Theorvane/type-mcp/issues/184)

## Context

FastMCP supports static and dynamic visibility by component identity and tags. The official TypeScript SDK v2 registered handles already implement enabled state, list filtering, call blocking, and list_changed notifications. TypeMCP needs a metadata and filtering layer without treating visibility as authorization.

## Decision

Tool, resource/template, and prompt options gain enabled and tags. Tags are validated, copied, and frozen but remain TypeMCP-local metadata. The compiler tracks SDK registered handles in a WeakMap keyed by the compiled server and applies initial disabled state through native handles.

enableMcpComponents and disableMcpComponents match server components by generated key, public name or URI, tag, or kind. Empty filters are rejected unless matchAll is explicit. Enable supports only mode to establish an allowlist. Native SDK handle transitions preserve protocol listing, dispatch, and change notifications.

## Consequences

Visibility changes are process-local and server-wide. They are useful for feature flags and surface shaping, but are not an authentication or authorization boundary. Per-session policy, providers, version constraints, and persistence remain excluded.
