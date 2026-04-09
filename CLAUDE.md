# Token 5-0 — The Token Police

Token 5-0 patrols your context window so bloat doesn't get away with it. Oversized outputs, runaway logs, and heavyweight diffs are apprehended on sight, booked into the vault, and replaced with compact summaries. Think of it as law enforcement for your token budget.

## Build & run

```bash
npm install                      # install deps
npm run build                    # tsc → dist/
npm run start                    # start MCP server (stdio)
npx tsx src/server.ts            # dev mode (no build step)
```

## MCP configuration

Add to your Claude Code config (`.mcp.json` or settings):

```json
{
  "mcpServers": {
    "token-vault": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "VAULT_DB_PATH": "${HOME}/.token-5-0/vault.db"
      }
    }
  }
}
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VAULT_DB_PATH` | No | `~/.token-5-0/vault.db` | SQLite database location |

No Vercel/cloud env vars — this runs locally as a stdio MCP server.

## Tools (6)

| Tool | Purpose |
|------|---------|
| `vault_store` | Store content + metadata, get a handle (`v_xxxxxxxxxxxx`) |
| `vault_retrieve` | Fetch by handle with optional query/line filtering |
| `vault_search` | Full-text search across vault entries |
| `vault_diff` | Side-by-side comparison of two entries |
| `vault_pack` | Create compact working context summary |
| `vault_stats` | Vault metadata and usage statistics |

## Database

SQLite via `better-sqlite3` with WAL journaling.

**Table**: `vault_entries` (id, handle, content, metadata, checksum, summary, size_bytes, created_at)
**FTS**: `vault_fts` virtual table with triggers for full-text search

## Testing

```bash
# Build and verify server starts
npm run build && node dist/server.js --help

# Test vault operations manually via MCP inspector or Claude Code:
# 1. Store a test entry
#    vault_store with content="test content" metadata={"source":"test","type":"log"}
# 2. Retrieve it
#    vault_retrieve with handle="v_xxxx"
# 3. Search
#    vault_search with query="test"
# 4. Check stats
#    vault_stats

# Verify SQLite database was created
ls -la ~/.token-5-0/vault.db
```

## Context Management Guidelines

- **Large outputs**: When tool output exceeds ~500 characters, book it into the vault using `vault_store` and work with the summary + handle. No free-roaming payloads.
- **Logs & traces**: Always vault raw logs and stack traces. Keep only error signatures and key lines in context — the rest goes into evidence lockup.
- **File diffs**: Vault large diffs. Keep a structural summary (files changed, key modifications) in context. Bulk evidence stays in the vault.
- **Retrieval**: Use `vault_retrieve` with query or line ranges to pull specific details from evidence — never dump entire vault entries into context.
- **Context packing**: Use `vault_pack` to create a compact working context when resuming work or switching tasks.

## Source structure

```
src/
  server.ts              # MCP server entry (stdio transport)
  vault.ts               # Vault logic (store, retrieve, search, diff, pack, stats)
  db.ts                  # SQLite setup, schema, FTS triggers
dist/                    # Compiled output (tsc)
```
