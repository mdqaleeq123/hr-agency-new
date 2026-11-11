---
name: resume-intake
description: Scheduled routine of resume-parser. Convert raw resumes into structured candidate records the rest of the agency can use.
metadata:
  internal: true
---

# resume-intake

Fires weekdays at 09:30 Asia/Karachi.

1. If a file named PAUSED exists in the agency folder, record `skipped-paused` and stop.
2. If the run already happened for today's date, record `skipped-already-ran` and stop.
3. Read every new resume file in data/resumes.
4. Extract name, email, phone, location, skills, education, years of experience (computed from date ranges) and any years the candidate claims.
5. Write one structured record per candidate to data/out/candidates.json.
6. Log the run with a count only, never candidate details.

Log line (one per run, no names, emails, phone numbers or URLs):
`node scripts/runlog.mjs --agent resume-parser --task "<one-line summary>" --status <ok|partial|failed>`

## Corrections
