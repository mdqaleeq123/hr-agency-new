---
name: onboarding-tracks
description: Scheduled routine of onboarding-coordinator. Give every accepted hire a dated 30/60/90-day onboarding checklist.
metadata:
  internal: true
---

# onboarding-tracks

Fires weekdays at 12:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Read accepted hires with start date, role and manager.
4. Generate a checklist: before day 1, first 30 days, days 31 to 60, days 61 to 90.
5. Mark the welcome email as HELD.
6. Write one file per hire and log the run.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent onboarding-coordinator --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
