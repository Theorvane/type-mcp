import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";

describe("@type-mcp/core package contract", () => {
	it("exports createMcpServer as the compiler entry point", () => {
		expect(core).toHaveProperty("createMcpServer");
		expect(core.createMcpServer).toBeTypeOf("function");
	});
});
