import { createMcpServer } from "@theorvane/type-mcp";
import { createMcpHandler } from "@theorvane/type-mcp/http";

import { CatalogServer } from "./catalog-server.js";

/**
 * Framework-neutral Fetch handler. A web framework can pass its Web `Request`
 * to this function and return the resulting `Response`.
 */
export const handler = createMcpHandler(() => createMcpServer(CatalogServer));
