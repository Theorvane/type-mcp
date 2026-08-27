# Dynamic prompts and resources

Current `dev` source adds explicit prompt arguments and resource URI templates. These APIs are unreleased until the next reviewed package promotion.

## Prompt arguments and completion

`@McpPrompt({ args })` accepts a Zod object. Required/optional fields and descriptions become MCP prompt arguments, and the SDK validates values before TypeMCP invokes the method. Wrap a field with `McpCompletable` to provide suggestions:

```ts
@McpPrompt({
  args: z.object({
    topic: McpCompletable(z.string().describe("Topic"), (value) =>
      topics.filter((topic) => topic.startsWith(value)),
    ),
  }),
})
draft(input: { readonly topic: string }) {
  return "Write about " + input.topic + ".";
}
```

## Resource templates

A resource URI containing template expressions must declare an `input` schema with exactly the same field names. Use Zod coercion explicitly when a handler needs numbers or other domain values because URI variables arrive as strings.

```ts
@McpResource({
  uri: "repo://{owner}/{repo}",
  input: z.object({ owner: z.string(), repo: z.string() }),
  complete: {
    repo: (value, context) =>
      repositoriesFor(context?.arguments?.owner).filter((repo) =>
        repo.startsWith(value),
      ),
  },
})
readRepository(input: { readonly owner: string; readonly repo: string }) {
  return input;
}
```

Template/schema mismatches fail during definition validation. Invalid runtime variables and application exceptions return generic resource failures. Completion exceptions become empty suggestions, and SDK v2 limits one completion response to 100 values.
