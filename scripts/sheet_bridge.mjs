#!/usr/bin/env node
// Bridge 1: Google Sheet ledger.
// Posts one row [Timestamp | Agent Name | Task Performed | Output Status] to the owner's own
// Google Apps Script web app (apps-script/Code.gs), which appends it to the sheet.
// If SHEET_WEBHOOK_URL is not set (or the call fails) the row is queued in data/ledger-queue.csv
// so nothing is lost, and `node scripts/sheet_bridge.mjs --flush` retries the queue later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = path.join(ROOT, 'data', 'ledger-queue.csv');
const HEADER = 'Timestamp,Agent Name,Task Performed,Output Status\n';

const csv = (v) => `"${String(v).replace(/"/g, '""')}"`;
const toCsvLine = (r) => [r.timestamp, r.agent, r.task, r.status].map(csv).join(',') + '\n';

function queue(row) {
  fs.mkdirSync(path.dirname(QUEUE), { recursive: true });
  if (!fs.existsSync(QUEUE)) fs.writeFileSync(QUEUE, HEADER);
  fs.appendFileSync(QUEUE, toCsvLine(row));
}

async function post(payload) {
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.WEBHOOK_SECRET || '';
  if (!url) return { ok: false, reason: 'SHEET_WEBHOOK_URL not set' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
      body: JSON.stringify({ secret, ...payload }),
    });
    const text = await res.text();
    return { ok: res.ok && text.includes('"ok":true'), reason: res.ok ? text.slice(0, 120) : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, reason: String(e.message || e) };
  }
}

export async function pushRow(row) {
  const r = await post({ action: 'log', row: [row.timestamp, row.agent, row.task, row.status] });
  if (!r.ok) queue(row);
  return { delivered: r.ok, detail: r.reason };
}

export async function postAction(payload) { return post(payload); }

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes('--flush')) {
  if (!fs.existsSync(QUEUE)) { console.log('queue empty'); process.exit(0); }
  const lines = fs.readFileSync(QUEUE, 'utf8').trim().split('\n').slice(1);
  const rest = [];
  let sent = 0;
  for (const line of lines) {
    const cells = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((m) => m[1].replace(/""/g, '"'));
    const r = await post({ action: 'log', row: cells });
    if (r.ok) sent++; else rest.push(line);
  }
  fs.writeFileSync(QUEUE, HEADER + rest.join('\n') + (rest.length ? '\n' : ''));
  console.log(`flushed ${sent}, still queued ${rest.length}`);
}
