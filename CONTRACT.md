# Contract

## Roster (8 employees)
| # | Employee | Role | Routine |
|---|---|---|---|
| 1 | hr-chief-of-staff | Project Manager (Chief of Staff) | hr-daily-audit-and-brief |
| 2 | talent-sourcer | Lead Researcher / Candidate Sourcer | sourcing-sweep |
| 3 | resume-parser | Data Parser (Resume Intake) | resume-intake |
| 4 | jd-outreach-writer | Content Writer (JDs and Outreach) | draft-jd-and-outreach |
| 5 | pipeline-manager | Campaign Builder / Pipeline Manager | pipeline-update |
| 6 | onboarding-coordinator | Onboarding Tracks | onboarding-tracks |
| 7 | hr-analyst | Performance Analyst | funnel-metrics |
| 8 | compliance-auditor | Technical Auditor / Data Quality | data-and-bias-audit |

## Who writes what
- Each worker writes only its own files under data/out/ and one line to runlog.jsonl.
- Only the Chief of Staff writes briefs/ and sends the daily email.
- Only scripts/runlog.mjs writes to the Google Sheet ledger (columns: Timestamp | Agent Name | Task Performed | Output Status).

## The two guardrails
1. Outbound actions (send, post, submit, publish, spend) are held for the owner.
2. Credentials are never created, entered or stored, and candidate data stays on this machine.

## Statuses
ok, partial, failed, skipped-already-ran, blocked-login
