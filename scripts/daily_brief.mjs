#!/usr/bin/env node
// Bridge 2: daily email bulletin.
// Builds a scannable status brief from today's runlog.jsonl, saves it to briefs/YYYY-MM-DD.md,
// and asks the owner's Apps Script web app to email it (MailApp, delivered to the sheet owner only).
// Without SHEET_WEBHOOK_URL it still writes the brief file, and Code.gs sendDailyBrief() (time trigger)
// emails the same bulletin from the sheet itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postAction } from './sheet_bridge.mjs';
import { timestamp } from './runlog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED = ['hr-chief-of-staff', 'talent-sourcer', 'resume-parser', 'jd-outreach-writer', 'pipeline-manager', 'onboarding-coordinator', 'hr-analyst', 'compliance-auditor'];

export function readToday() {
  const f = path.join(ROOT, 'runlog.jsonl');
  if (!fs.existsSync(f)) return [];
  const today = timestamp().slice(0, 10);
  return fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.timestamp.startsWith(today));
}

export function buildBrief(rows) {
  const today = timestamp().slice(0, 10);
  const latest = new Map();
  rows.forEach((r) => latest.set(r.agent, r));
  const missing = EXPECTED.filter((a) => a !== 'hr-chief-of-staff' && !latest.has(a));
  const attention = [...latest.values()].filter((r) => r.status !== 'ok' && r.agent !== 'hr-chief-of-staff');
  const icon = (s) => ({ ok: 'OK     ', partial: 'PARTIAL', failed: 'FAILED ' }[s] || s);
  let t = `HR AGENCY DAILY BRIEF - ${today}\n${'='.repeat(40)}\n`;
  t += `Agents reported: ${latest.size}/8 | Runs today: ${rows.length}\n\n`;
  t += `NEEDS ATTENTION\n`;
  if (!attention.length && !missing.length) t += `  Nothing - all agents ok.\n`;
  attention.forEach((r) => (t += `  [${icon(r.status)}] ${r.agent}: ${r.task}\n`));
  missing.forEach((a) => (t += `  [MISSING] ${a}: no run recorded today\n`));
  t += `\nAGENT STATUS\n`;
  EXPECTED.forEach((a) => {
    const r = latest.get(a);
    const line = a === 'hr-chief-of-staff' ? 'OK       Compiled this brief and updated the sheet ledger' : r ? icon(r.status) + '  ' + r.task : 'no run today';
    t += `  ${a.padEnd(24)} ${line}\n`;
  });
  t += `\nFull ledger: Google Sheet "HR Agency Ledger" (tab: Ledger)\n`;
  return t;
}

export async function sendBrief() {
  const text = buildBrief(readToday());
  const date = timestamp().slice(0, 10);
  fs.mkdirSync(path.join(ROOT, 'briefs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'briefs', `${date}.md`), '```\n' + text + '```\n');
  const html = `<pre style="font-family:Consolas,monospace;font-size:13px">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;
  const r = await postAction({ action: 'email', subject: `[HR Agency] Daily brief ${date}`, text, html });
  return { text, emailed: r.ok, detail: r.reason };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = await sendBrief();
  console.log(r.text);
  console.log(r.emailed ? 'EMAIL SENT via Apps Script' : `Email not sent (${r.detail}). Brief saved to briefs/ ; Apps Script time trigger will send it.`);
}
