---
name: draft-jd-and-outreach
description: Scheduled routine of jd-outreach-writer. Write inclusive job descriptions and personalised outreach drafts, held for human approval.
metadata:
  internal: true
---

# draft-jd-and-outreach

Fires weekdays at 10:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Write one job description per requisition with an equal-opportunity statement.
4. Write one short outreach draft per candidate that mentions their real top skills.
5. Mark every outreach draft HELD. Nothing is sent.
6. Log the run.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent jd-outreach-writer --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
