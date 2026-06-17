# token-5-0 Roadmap

**token-5-0 is the token police** — context-discipline tooling that keeps agent sessions from drowning in their own output. Oversized tool results, runaway logs, and heavyweight diffs get booked into a local **vault** and replaced with compact summaries + a handle, so the working context stays lean while the full evidence is recoverable. Today it ships as a single stdio MCP server (`token-vault`, 6 tools) backed by SQLite + FTS5. On the platform, its job is **context vaulting**: preserve session context uniformly across agents and feed observability. See the [OpZero platform roadmap](https://github.com/OpZero-sh/.github/blob/main/ROADMAP.md) for how this fits the whole.

> Status legend: ✅ shipped · 🟡 in progress · ⚪ planned
> **Maturity: early.** Two commits, no README, local-only, single-user. The vault primitives work; nothing is wired to the hub or the session layer yet.

---

## Near-term

- ✅ **Vault primitives.** `vault_store` / `vault_retrieve` / `vault_search` / `vault_diff` / `vault_pack` / `vault_stats` — store-and-summarize, handle-based retrieval with line/query filtering, FTS5 search, budget-constrained packing (recency / relevance / balanced).
- ✅ **Local persistence.** `better-sqlite3` with WAL, `vault_entries` + `vault_fts` virtual table and sync triggers; DB at `$VAULT_DB_PATH` (default `~/.token-5-0/vault.db`).
- 🟡 **Context-discipline guidelines as policy.** CLAUDE.md documents the "book large outputs into the vault" discipline; this is convention, not yet enforced anywhere.
- ⚪ **Consume the unified session event/transcript schema (Phase 4).** Normalize ingestion against the cross-agent event schema so vaulting works identically for Claude Code, Codex, and future adapters — not bespoke per-agent parsing.
- ⚪ **Auto-vault hook.** Intercept oversized tool outputs at the session boundary (vs. relying on the agent to call `vault_store` by hand).
- ⚪ **Per-user / per-session scoping.** Today the vault is a single local DB with no `user_id` or session keys. Align with the hub's per-user model so entries are scoped and shareable.

## Later

- ⚪ **Feed Phase 5 observability.** Surface vault stats (bytes saved, entries booked, top sources) and context-discipline signals into the platform audit/observability layer alongside uat verification.
- ⚪ **Hosted / shared vault.** Move beyond local SQLite toward a per-user store that survives across machines, so context vaulting is uniform across the hub (Phase 2/4 alignment).
- ⚪ **Cross-session context packing.** Use `vault_pack` to rehydrate working context when resuming or forking sessions across machines.
- ⚪ **Retention & eviction policy.** TTL, size caps, and pruning so the vault doesn't grow unbounded.

---

token-5-0 shares a near-term lane with **uat**: both plug into the unified session event schema (uat for verification, token-5-0 for context discipline / vaulting). The org board tracks these as Phase 4 + Phase 5 items.
