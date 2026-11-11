---
name: funnel-metrics
description: Scheduled routine of hr-analyst. Measure the hiring funnel and flag bottlenecks before they slow hiring.
metadata:
  internal: true
---

# funnel-metrics

Fires weekdays at 15:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Count candidates per stage and compute the shortlist rate.
4. Compare shortlisted candidates with open headcount.
5. Flag a bottleneck when shortlisted is below openings, or when over 40 percent fall in the Talent pool.
6. Write data/out/funnel_metrics.json and log the run.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent hr-analyst --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
