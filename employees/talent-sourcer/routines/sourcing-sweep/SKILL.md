---
name: sourcing-sweep
description: Scheduled routine of talent-sourcer. Turn each open requisition into a concrete sourcing plan: boolean searches, channels and weekly outreach caps.
metadata:
  internal: true
---

# sourcing-sweep

Fires weekdays at 09:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Read each open requisition (title, location, required and nice-to-have skills, years).
4. Generate a boolean search string with required skills as AND and nice-to-haves as OR.
5. List sourcing channels per role (job boards, GitHub, alumni groups) and cap outreach at 25 prospects a week.
6. Write data/out/sourcing_plan.md and log the run.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent talent-sourcer --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
