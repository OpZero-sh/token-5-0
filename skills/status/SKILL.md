---
name: status
description: "Precinct report — vault statistics and recent bookings at a glance."
allowed-tools:
  - mcp__token-vault__vault_stats
  - mcp__token-vault__vault_search
---

Pull up the precinct blotter: vault health and recent booking activity.

## Usage
`/token-5-0:status`

## Instructions

1. Call `vault_stats` to get totals.
2. Call `vault_search` with query "*" and limit 5 to get recent bookings.
3. Format as a precinct report:

### Precinct Report
| Metric | Value |
|--------|-------|
| Total Bookings | {count} |
| Evidence Locker Size | {bytes formatted} |
| Oldest Booking | {date} |
| Latest Booking | {date} |

### Recent Bookings
| Evidence Tag | Summary | Booked |
|--------------|---------|--------|
| ... | ... | ... |
