#!/usr/bin/env bash
# Advisory hook: warns Claude when tool output is large
# Runs after every tool use; never blocks (always exits 0)

input=$(cat)
tool_name=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null)
tool_output=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_output',''))" 2>/dev/null)

if [ -z "$tool_output" ]; then
  exit 0
fi

size=${#tool_output}

if [ "$size" -gt 2000 ]; then
  cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PostToolUse","message":"[token-5-0] Suspect payload detected from ${tool_name} (${size} chars). Book it into the vault with vault_store and keep only the summary on the beat. Call the context-warden for backup on large hauls."}}
EOF
fi

exit 0
