---
name: hr-daily-audit-and-brief
description: Scheduled routine of hr-chief-of-staff. Audit all 7 other employees, keep the Google Sheet ledger current, and email the owner one scannable brief every weekday.
metadata:
  internal: true
---

# hr-daily-audit-and-brief

Fires weekdays at 18:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Read today's lines in runlog.jsonl and match them against the roster of 7 employees.
4. Mark any employee with no run today as MISSING, and any non-ok status as NEEDS ATTENTION.
5. Confirm each run produced a row in the Google Sheet; flush data/ledger-queue.csv if rows are queued (node scripts/sheet_bridge.mjs --flush).
6. Build the brief (node scripts/daily_brief.mjs): agents reported, attention list, one line per agent.
7. Email the brief through the Apps Script bridge. The email goes to the owner's own address only.
8. Log own run through scripts/runlog.mjs.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent hr-chief-of-staff --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
