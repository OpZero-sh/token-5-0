import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleStore } from "./tools/store.js";
import { handleRetrieve } from "./tools/retrieve.js";
import { handleSearch } from "./tools/search.js";
import { handleDiff } from "./tools/diff.js";
import { handlePack } from "./tools/pack.js";
import { handleStats } from "./tools/stats.js";

const server = new McpServer({
  name: "token-vault",
  version: "1.0.0",
});

server.tool(
  "vault_store",
  "Store content in the vault and receive a compact handle for later retrieval",
  {
    payload: z.string(),
    metadata: z
      .object({
        source: z.string().optional(),
        type: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  },
  async (args) => {
    const result = handleStore(args.payload, args.metadata);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "vault_retrieve",
  "Retrieve stored content by handle, with optional filtering and line range",
  {
    handle: z.string(),
    query: z.string().optional(),
    line_start: z.number().optional(),
    line_end: z.number().optional(),
    max_lines: z.number().default(50).optional(),
  },
  async (args) => {
    const result = handleRetrieve(
      args.handle,
      args.query,
      args.line_start,
      args.line_end,
      args.max_lines,
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "vault_search",
  "Full-text search across all stored vault entries",
  {
    query: z.string(),
    limit: z.number().default(10).optional(),
  },
  async (args) => {
    const result = handleSearch(args.query, args.limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "vault_diff",
  "Compare two vault entries and show line-by-line differences",
  {
    handle_a: z.string(),
    handle_b: z.string(),
    context_lines: z.number().default(3).optional(),
  },
  async (args) => {
    const result = handleDiff(args.handle_a, args.handle_b, args.context_lines);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "vault_pack",
  "Pack multiple vault entries into a budget-constrained context string",
  {
    handles: z.array(z.string()),
    budget_chars: z.number().default(4000).optional(),
    strategy: z
      .enum(["recency", "relevance", "balanced"])
      .default("balanced")
      .optional(),
  },
  async (args) => {
    const result = handlePack(
      args.handles,
      args.budget_chars,
      args.strategy as "recency" | "relevance" | "balanced",
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "vault_stats",
  "Get aggregate statistics about the vault",
  async () => {
    const result = handleStats();
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
