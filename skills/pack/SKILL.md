---
name: pack
description: "Assemble a case briefing from vault evidence, fitted to a target character budget."
allowed-tools:
  - mcp__token-vault__vault_pack
  - mcp__token-vault__vault_search
  - mcp__token-vault__vault_stats
argument-hint: "[budget_chars] [strategy: recency|relevance|balanced]"
---

Assemble a case briefing from vault evidence, packed within budget.

## Usage
`/token-5-0:pack [budget] [strategy]`

## Instructions

1. Call `vault_stats` to survey the evidence locker.
2. Call `vault_search` with a broad query (or "*") to identify relevant case files.
3. Parse arguments: first arg is budget in chars (default 4000), second is strategy (default "balanced").
4. Call `vault_pack` with the discovered handles, the budget, and the strategy.
5. Present the case briefing to the user with clear section headers and the evidence tags for each included item.

If $ARGUMENTS is empty, use defaults: 4000 chars, balanced strategy.

Budget from args: $ARGUMENTS[0] or 4000
Strategy from args: $ARGUMENTS[1] or "balanced"
