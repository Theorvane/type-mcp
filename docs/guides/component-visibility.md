# Component visibility

**Availability:** current `dev` source; not included in published `0.3.2`.

Tools, resources/templates, and prompts accept `enabled` and `tags`. Components are enabled by default.

```ts
@McpTool({
  input: z.object({}),
  enabled: false,
  tags: ["admin", "dangerous"],
})
deleteEverything() {
  return "deleted";
}
```

A disabled component remains registered, but the official SDK omits it from listings and rejects dispatch as unknown. Tags are TypeMCP-local metadata and must be unique non-empty strings. Definition reads return copied, frozen tag arrays.

## Runtime controls

```ts
import {
  disableMcpComponents,
  enableMcpComponents,
} from "@theorvane/type-mcp";

const server = await createMcpServer(AdminServer);

enableMcpComponents(server, { tags: ["admin"] });
disableMcpComponents(server, { keys: ["tool:deleteEverything"] });
enableMcpComponents(server, { tags: ["safe"], only: true });
```

Filters combine additively: a component matches when any key, name/URI, tag, or kind matches. Supported kinds are `tool`, `resource`, `template`, and `prompt`. Use `matchAll: true` for an explicit all-components operation; an empty filter is rejected.

Keys are deterministic:

- `tool:{name}`
- `resource:{uri}`
- `template:{uriTemplate}`
- `prompt:{name}`

`only: true` establishes an allowlist: matches are enabled and every other tracked component is disabled. Later calls override current state. Functions return the number of matched components.

TypeMCP calls native SDK registered handles, preserving listing, dispatch blocking, and `list_changed` notifications.

## Security boundary

Visibility is process-local surface shaping for feature flags and maintenance. It is not authentication or authorization. Authorize every operation at the host or handler boundary even when hidden. Per-session visibility and persistent policies are outside this API.
