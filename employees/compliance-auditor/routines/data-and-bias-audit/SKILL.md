---
name: data-and-bias-audit
description: Scheduled routine of compliance-auditor. Catch data mismatches and biased wording before they reach a candidate or a decision.
metadata:
  internal: true
---

# data-and-bias-audit

Fires weekdays at 16:00 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Check every candidate for a valid email, a phone number and duplicates.
4. Compare claimed years of experience with the years computed from the dates.
5. Scan job descriptions for biased terms.
6. Write data/out/audit_report.md. Log status partial when issues exist, ok when clean.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent compliance-auditor --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
