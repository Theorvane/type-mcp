import {
  MCP_PROMPTS_METADATA_KEY,
  MCP_RESOURCES_METADATA_KEY,
  MCP_TOOLS_METADATA_KEY,
} from "./keys.js";
import type {
  McpPromptDefinition,
  McpResourceDefinition,
  McpToolDefinition,
} from "../types.js";

function appendDefinition<T>(
  metadata: DecoratorMetadata,
  key: symbol,
  definition: T,
): void {
  const existing = metadata[key];
  const definitions = Array.isArray(existing) ? existing : [];

  Object.defineProperty(metadata, key, {
    configurable: true,
    enumerable: false,
    value: [...definitions, definition],
    writable: true,
  });
}

function readDefinitions<T>(metadata: DecoratorMetadata, key: symbol): readonly T[] {
  const definitions = metadata[key];
  return Array.isArray(definitions) ? [...definitions] as readonly T[] : [];
}

export function appendToolDefinition(
  metadata: DecoratorMetadata,
  definition: McpToolDefinition,
): void {
  appendDefinition(metadata, MCP_TOOLS_METADATA_KEY, definition);
}

export function appendResourceDefinition(
  metadata: DecoratorMetadata,
  definition: McpResourceDefinition,
): void {
  appendDefinition(metadata, MCP_RESOURCES_METADATA_KEY, definition);
}

export function appendPromptDefinition(
  metadata: DecoratorMetadata,
  definition: McpPromptDefinition,
): void {
  appendDefinition(metadata, MCP_PROMPTS_METADATA_KEY, definition);
}

export function readToolDefinitions(
  metadata: DecoratorMetadata,
): readonly McpToolDefinition[] {
  return readDefinitions<McpToolDefinition>(metadata, MCP_TOOLS_METADATA_KEY);
}

export function readResourceDefinitions(
  metadata: DecoratorMetadata,
): readonly McpResourceDefinition[] {
  return readDefinitions<McpResourceDefinition>(metadata, MCP_RESOURCES_METADATA_KEY);
}

export function readPromptDefinitions(
  metadata: DecoratorMetadata,
): readonly McpPromptDefinition[] {
  return readDefinitions<McpPromptDefinition>(metadata, MCP_PROMPTS_METADATA_KEY);
}
