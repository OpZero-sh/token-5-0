#!/usr/bin/env bash
# Advisory hook: reminds to vault before context compaction
# Never blocks (always exits 0)

cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PreCompact","message":"[token-5-0] Compaction incoming — the precinct is about to clear the blotter. Use /token-5-0:pack to assemble a case briefing from vault evidence before anything gets swept."}}
EOF

exit 0
