# HR Agency - 8 autonomous AI employees

An AI HR agency built on the [markfulton/ai-employees](https://github.com/markfulton/ai-employees) kit format
(ROLE.md, SCHEDULE.md, `routines/<id>/SKILL.md`, a shared run log). It covers candidate sourcing, resume parsing,
onboarding tracks and pipeline management. One employee is the Project Manager: it audits the other seven,
logs every run to a Google Sheet and emails a daily brief.

> The upstream repo ships 8 non-HR roles (GTM, SEO, Sales, Chief of Staff and others). The 8 HR employees here are
> new kits written in the same folder format, with a custom Google Sheet bridge and email bridge.

## The team

| # | Employee | Role | Output |
|---|---|---|---|
| 1 | hr-chief-of-staff | Project Manager | Sheet ledger rows + daily email brief |
| 2 | talent-sourcer | Lead Researcher | `sourcing_plan.md` |
| 3 | resume-parser | Data Parser | `candidates.json` |
| 4 | jd-outreach-writer | Content Writer | job descriptions, held outreach drafts |
| 5 | pipeline-manager | Campaign Builder | `pipeline.csv` with scores and stages |
| 6 | onboarding-coordinator | Onboarding Tracks | 30/60/90 checklists |
| 7 | hr-analyst | Performance Analyst | `funnel_metrics.json` with bottleneck flags |
| 8 | compliance-auditor | Technical Auditor | `audit_report.md` |

## Architecture

```
employees/*  (ROLE.md + routines)  ->  scripts/agents.mjs  ->  data/out/*
                                         |
                                   scripts/runlog.mjs  -> runlog.jsonl
                                         |
                              scripts/sheet_bridge.mjs  -> Apps Script web app -> Google Sheet "Ledger"
                                                                  [Timestamp | Agent Name | Task Performed | Output Status]
hr-chief-of-staff -> scripts/daily_brief.mjs -> Apps Script MailApp -> your inbox
```

## Quick start

```bash
node scripts/runlog.mjs --selftest      # expect: PASS runlog selftest
node scripts/run_all.mjs                # runs all 8 employees, logs, builds the brief
```

To connect the Google Sheet and email, follow `docs/RUNBOOK.md` (about 10 minutes), then:

```bash
export SHEET_WEBHOOK_URL="https://script.google.com/macros/s/XXXX/exec"
export WEBHOOK_SECRET="<value printed by setup() in Apps Script>"
node scripts/run_all.mjs
```

Rows that could not be delivered are kept in `data/ledger-queue.csv`; send them later with
`node scripts/sheet_bridge.mjs --flush`.

## Running with Claude Code (the ai-employees way)

Open Claude Code in this folder and say: *"Install the HR Agency from this folder."* Each employee's routine is a
scheduled job with the prompt `Read employees/<id>/routines/<routine>/SKILL.md and follow it.` Fire times are in
`SCHEDULE.md`. `.installed.json` records the installed roster.

## Safety

- Candidate data is fake sample data and stays on this machine.
- Outreach drafts are held, nothing is sent to candidates.
- The email bridge sends only to the Google account that owns the script.
- The run logger refuses any record that contains an email, phone number, URL or secret.
