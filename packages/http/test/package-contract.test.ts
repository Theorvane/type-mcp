import { describe, expect, it } from "vitest";
import * as http from "../src/index.js";

describe("@type-mcp/http package contract", () => {
  it("exports createMcpHandler as the Fetch adapter entry point", () => {
    expect(http).toHaveProperty("createMcpHandler");
    expect(http.createMcpHandler).toBeTypeOf("function");
  });
});
