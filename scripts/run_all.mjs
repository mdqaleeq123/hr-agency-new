#!/usr/bin/env node
// Orchestrator: runs the 7 worker employees in dependency order, logs each run,
// then the Project Manager (Chief of Staff) audits the log, writes the brief and emails it.
// Usage: node scripts/run_all.mjs            (all agents)
//        node scripts/run_all.mjs --only resume-parser
import * as A from './agents.mjs';
import { logRun } from './runlog.mjs';
import { sendBrief } from './daily_brief.mjs';

const PIPELINE = [
  ['resume-parser', A.resumeParser],          // must run before agents that read candidates.json
  ['talent-sourcer', A.talentSourcer],
  ['jd-outreach-writer', A.jdWriter],
  ['pipeline-manager', A.pipelineManager],
  ['onboarding-coordinator', A.onboardingCoordinator],
  ['hr-analyst', A.hrAnalyst],
  ['compliance-auditor', A.complianceAuditor],
];

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const say = (s) => console.log(s);

say('== HR Agency run ==');
for (const [agent, fn] of PIPELINE) {
  if (only && only !== agent && only !== 'hr-chief-of-staff') continue;
  let res;
  try { res = fn(); } catch (e) { res = { task: `Run crashed: ${String(e.message).replace(/https?:\/\/\S+/g, '')}`.slice(0, 120), status: 'failed' }; }
  const out = await logRun({ agent, task: res.task, status: res.status });
  say(`[${res.status.padEnd(7)}] ${agent.padEnd(24)} ${res.task}  | sheet: ${out.sheet.delivered ? 'row added' : 'queued locally'}`);
}

// Project Manager: audits the other 7 agents, logs itself, then emails the brief.
const brief = await sendBrief();
const missing = (brief.text.match(/\[MISSING\]/g) || []).length;
const pmStatus = missing ? 'partial' : 'ok';
const pmTask = `Audited all 7 agents (${missing} missing) and ${brief.emailed ? 'emailed' : 'saved'} the daily brief`;
const out = await logRun({ agent: 'hr-chief-of-staff', task: pmTask, status: pmStatus });
say(`[${pmStatus.padEnd(7)}] ${'hr-chief-of-staff'.padEnd(24)} ${pmTask}  | sheet: ${out.sheet.delivered ? 'row added' : 'queued locally'}`);
say('\n' + brief.text);
say(brief.emailed ? 'EMAIL: sent via Apps Script' : `EMAIL: not sent from this machine (${brief.detail})`);
