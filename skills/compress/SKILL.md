---
name: compress
description: "Book bulky evidence (logs, traces, diffs) into the vault and file a condensed incident report."
allowed-tools:
  - mcp__token-vault__vault_store
  - mcp__token-vault__vault_retrieve
argument-hint: "<text to compress>"
---

Apprehend verbose content, book the original into the vault, and file a tight incident report.

## Usage
`/token-5-0:compress <paste your content>`

## Instructions

1. Take the provided text from $ARGUMENTS.
2. Call `vault_store` with the raw text as payload and metadata: { "type": "compressed", "source": "user-paste" }.
3. Analyze the booked content and produce a structured incident report:

**Output format:**
### Incident Report
- **Key Facts:** Bullet list of the most important information
- **Error Signatures:** (if applicable) Unique error patterns found
- **Critical Lines:** Line numbers of the most important content
- **Open Questions:** Things that need clarification or further investigation
- **Evidence Tag:** `{handle}` — use `vault_retrieve` to pull the full evidence

Always keep the report under 500 characters. The goal is maximum information density.
