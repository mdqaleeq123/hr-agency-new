#!/usr/bin/env node
// Shared run logger. Every agent calls this once per run.
// Appends one JSON line to runlog.jsonl and, via sheet_bridge, one row to the Google Sheet ledger.
// Columns: Timestamp | Agent Name | Task Performed | Output Status
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pushRow } from './sheet_bridge.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOG = path.join(ROOT, 'runlog.jsonl');
const STATUSES = new Set(['ok', 'partial', 'failed', 'skipped-already-ran', 'blocked-login']);

// Refuse records that carry secrets or candidate PII (emails, phone numbers, URLs).
const PII = [/[\w.+-]+@[\w-]+\.[\w.]+/, /\+?\d[\d\s().-]{8,}\d/, /https?:\/\//i, /(api[_-]?key|password|token)\s*[:=]/i];

export function timestamp(d = new Date()) {
  // Local-style ISO string with the Asia/Karachi offset for readability in the sheet.
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Karachi', dateStyle: 'short', timeStyle: 'medium' });
  return fmt.format(d).replace(' ', 'T') + '+05:00';
}

export async function logRun({ agent, task, status }) {
  if (!STATUSES.has(status)) throw new Error(`bad status: ${status}`);
  for (const field of [agent, task]) {
    if (PII.some((re) => re.test(field))) throw new Error('runlog refused: record contains PII or a secret');
  }
  const row = { timestamp: timestamp(), agent, task, status };
  fs.appendFileSync(LOG, JSON.stringify(row) + '\n');
  const sheet = await pushRow(row); // never throws; falls back to local CSV queue
  return { row, sheet };
}

// CLI: node scripts/runlog.mjs --agent X --task "Y" --status ok
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  if (a.includes('--selftest')) {
    let refused = false;
    try { await logRun({ agent: 'x', task: 'mail bob@example.com', status: 'ok' }); } catch { refused = true; }
    let badStatus = false;
    try { await logRun({ agent: 'x', task: 'ok task', status: 'nope' }); } catch { badStatus = true; }
    console.log(refused && badStatus ? 'PASS runlog selftest' : 'FAIL runlog selftest');
    process.exit(refused && badStatus ? 0 : 1);
  }
  const out = await logRun({ agent: get('--agent'), task: get('--task'), status: get('--status') });
  console.log(JSON.stringify(out));
}
