---
name: pipeline-update
description: Scheduled routine of pipeline-manager. Match candidates to requisitions, score them and keep every candidate in the right pipeline stage.
metadata:
  internal: true
---

# pipeline-update

Fires weekdays at 11:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Score each candidate against each requisition: 70 points required skills, 20 nice-to-have, 10 years of experience.
4. Keep the best match per candidate.
5. Assign a stage: 75 or more is Shortlisted, 50 to 74 is Screening, below 50 is Talent pool.
6. Write data/out/pipeline.csv with the missing required skills for each candidate and log the run.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent pipeline-manager --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
