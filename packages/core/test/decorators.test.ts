import { z } from "zod";
import { describe, expect, it } from "vitest";
import {
  getMcpServerDefinition,
  McpPrompt,
  McpResource,
  McpServer,
  McpTool,
} from "../src/index.js";

function methodContext(
  name: string,
  metadata: DecoratorMetadata,
): ClassMethodDecoratorContext {
  return {
    kind: "method",
    name,
    static: false,
    private: false,
    access: {
      has: () => true,
      get: () => () => undefined,
    },
    metadata,
    addInitializer: () => undefined,
  };
}

function classContext(metadata: DecoratorMetadata): ClassDecoratorContext {
  return {
    kind: "class",
    name: "TestServer",
    metadata,
    addInitializer: () => undefined,
  };
}

function decorateServer(
  serverClass: new () => object,
  metadata: DecoratorMetadata,
): void {
  McpServer({ name: "calculator", version: "1.0.0" })(
    serverClass,
    classContext(metadata),
  );
}

describe("MCP decorators", () => {
  it("records server and component definitions with default method names", () => {
    class CalculatorServer {}
    const metadata: DecoratorMetadata = {};
    const input = z.object({ left: z.number(), right: z.number() });

    McpTool({ description: "Adds two numbers.", input })(
      () => "not executed",
      methodContext("add", metadata),
    );
    McpResource({ uri: "config://calculator", mimeType: "application/json" })(
      () => ({}),
      methodContext("config", metadata),
    );
    McpPrompt({ description: "Creates a greeting." })(
      () => "not executed",
      methodContext("greeting", metadata),
    );
    decorateServer(CalculatorServer, metadata);

    expect(getMcpServerDefinition(CalculatorServer)).toEqual({
      name: "calculator",
      version: "1.0.0",
      tools: [
        {
          name: "add",
          methodName: "add",
          description: "Adds two numbers.",
          input,
        },
      ],
      resources: [
        {
          name: "config",
          methodName: "config",
          uri: "config://calculator",
          mimeType: "application/json",
        },
      ],
      prompts: [
        {
          name: "greeting",
          methodName: "greeting",
          description: "Creates a greeting.",
        },
      ],
    });
  });

  it("preserves explicit component names", () => {
    class NamedServer {}
    const metadata: DecoratorMetadata = {};

    McpTool({ name: "calculate", input: z.object({ value: z.number() }) })(
      () => undefined,
      methodContext("internalCalculation", metadata),
    );
    McpPrompt({ name: "welcome" })(
      () => undefined,
      methodContext("buildWelcomePrompt", metadata),
    );
    decorateServer(NamedServer, metadata);

    const definition = getMcpServerDefinition(NamedServer);

    expect(definition?.tools[0]).toMatchObject({
      name: "calculate",
      methodName: "internalCalculation",
    });
    expect(definition?.prompts[0]).toMatchObject({
      name: "welcome",
      methodName: "buildWelcomePrompt",
    });
  });

  it("isolates definitions between classes", () => {
    class FirstServer {}
    class SecondServer {}
    const firstMetadata: DecoratorMetadata = {};
    const secondMetadata: DecoratorMetadata = {};

    McpTool({ input: z.object({}) })(
      () => undefined,
      methodContext("first", firstMetadata),
    );
    McpTool({ input: z.object({}) })(
      () => undefined,
      methodContext("second", secondMetadata),
    );
    decorateServer(FirstServer, firstMetadata);
    McpServer({ name: "second", version: "1.0.0" })(
      SecondServer,
      classContext(secondMetadata),
    );

    expect(getMcpServerDefinition(FirstServer)?.tools[0]?.name).toBe("first");
    expect(getMcpServerDefinition(SecondServer)?.tools[0]?.name).toBe("second");
  });

  it("does not inherit a parent class's component metadata", () => {
    class ParentServer {}
    class ChildServer extends ParentServer {}
    const parentMetadata: DecoratorMetadata = {};
    const childMetadata = Object.create(parentMetadata) as DecoratorMetadata;

    McpTool({ input: z.object({}) })(
      () => undefined,
      methodContext("parentTool", parentMetadata),
    );
    McpTool({ input: z.object({}) })(
      () => undefined,
      methodContext("childTool", childMetadata),
    );
    decorateServer(ParentServer, parentMetadata);
    decorateServer(ChildServer, childMetadata);

    expect(getMcpServerDefinition(ParentServer)?.tools.map((tool) => tool.name)).toEqual([
      "parentTool",
    ]);
    expect(getMcpServerDefinition(ChildServer)?.tools.map((tool) => tool.name)).toEqual([
      "childTool",
    ]);
  });

  it("returns frozen copied containers while preserving Zod schema identity", () => {
    class CopiedServer {}
    const metadata: DecoratorMetadata = {};
    const input = z.object({});

    McpTool({ description: "Original", input })(
      () => undefined,
      methodContext("tool", metadata),
    );
    decorateServer(CopiedServer, metadata);

    const firstRead = getMcpServerDefinition(CopiedServer);
    expect(firstRead).toBeDefined();
    if (firstRead === undefined) {
      throw new Error("Expected server definition");
    }

    expect(Object.isFrozen(firstRead)).toBe(true);
    expect(Object.isFrozen(firstRead.tools)).toBe(true);
    expect(Object.isFrozen(firstRead.tools[0])).toBe(true);
    expect(firstRead.tools[0]?.input).toBe(input);
    expect(getMcpServerDefinition(CopiedServer)).not.toBe(firstRead);
  });
});
