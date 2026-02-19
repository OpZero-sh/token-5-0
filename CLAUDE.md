# Token 5-0 — The Token Police

Token 5-0 patrols your context window so bloat doesn't get away with it. Oversized outputs, runaway logs, and heavyweight diffs are apprehended on sight, booked into the vault, and replaced with compact summaries. Think of it as law enforcement for your token budget.

## Context Management Guidelines

- **Large outputs**: When tool output exceeds ~500 characters, book it into the vault using `vault_store` and work with the summary + handle. No free-roaming payloads.
- **Logs & traces**: Always vault raw logs and stack traces. Keep only error signatures and key lines in context — the rest goes into evidence lockup.
- **File diffs**: Vault large diffs. Keep a structural summary (files changed, key modifications) in context. Bulk evidence stays in the vault.
- **Retrieval**: Use `vault_retrieve` with query or line ranges to pull specific details from evidence — never dump entire vault entries into context.
- **Context packing**: Use `/token-5-0:pack` or `vault_pack` to create a compact working context when resuming work or switching tasks.
- **Triage**: Dispatch the `context-warden` agent when you receive large artifacts or when context is growing quickly — call for backup before things get out of hand.

## Vault Handles (Evidence Tags)

Vault handles look like `v_xxxxxxxxxxxx` — each one is an evidence tag for a booked item. When you see one, you can:
- `vault_retrieve` with the handle to pull content from evidence (with optional query/line filtering)
- `vault_search` to find related entries across the case files
- `vault_diff` to compare two pieces of evidence side by side
