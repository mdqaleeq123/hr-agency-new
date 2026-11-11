// Usage: node scripts/build_dashboard.mjs
// Works for any agency kit: reads runlog.jsonl, .installed.json, data/out/** and briefs/*
// and writes dashboard/data.json
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p, fallback = "") => { try { return fs.readFileSync(path.join(root, p), "utf8"); } catch { return fallback; } };
const walk = (d) => {
  const out = [];
  const go = (rel) => {
    let items = [];
    try { items = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      if (it.name.startsWith(".")) continue;
      const r = path.posix.join(rel, it.name);
      it.isDirectory() ? go(r) : out.push(r);
    }
  };
  go(d); return out;
};

let installed = {};
try { installed = JSON.parse(read(".installed.json", read("_installed.json", "{}"))); } catch {}

const runs = read("runlog.jsonl").split("\n").filter(Boolean).map((l) => {
  try { return JSON.parse(l); } catch { return null; }
}).filter(Boolean).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));

const employees = (installed.employees || []).map((e) => {
  const last = runs.find((r) => r.agent === e.id);
  return { id: e.id, role: e.role, routine: e.routine, schedule: e.schedule,
    isProjectManager: !!e.isProjectManager,
    status: last ? last.status : "pending", task: last ? last.task : "Has not run yet",
    lastRun: last ? last.timestamp : null };
});

// guess the owner of an output file from its name (first match wins)
const rules = [
  [/market_brief/, "market-researcher"], [/ad_copy|social_posts/, "content-writer"],
  [/content_calendar|campaign_plan/, "campaign-builder"], [/target_accounts|account_profiles/, "outbound-strategist"],
  [/triage/, "social-triage"], [/audit_report|metrics_clean/, "technical-auditor"], [/performance_report/, "performance-analyst"],
  [/sourcing/, "talent-sourcer"], [/candidates|resume/, "resume-parser"], [/jd|job_desc|outreach/, "jd-outreach-writer"],
  [/pipeline/, "pipeline-manager"], [/onboard|checklist|30.?60.?90/, "onboarding-coordinator"],
  [/funnel/, "hr-analyst"], [/audit|bias|compliance/, "compliance-auditor"],
];
const known = new Set(employees.map((e) => e.id));
const ownerOf = (f) => { const hit = rules.find(([re, id]) => re.test(f.toLowerCase()) && (known.size === 0 || known.has(id))); return hit ? hit[1] : "other"; };

const MAX = 20000;
const outputs = walk("data/out").map((rel) => {
  const text = read(rel);
  const name = rel.replace(/^data\/out\//, "");
  return { file: name, agent: ownerOf(name), size: text.length, truncated: text.length > MAX, content: text.slice(0, MAX) };
});

const briefFiles = walk("briefs").filter((f) => /\.(md|txt)$/.test(f)).sort();
const latest = briefFiles.at(-1);
const brief = latest ? { file: path.posix.basename(latest), content: read(latest) } : null;

const counts = runs.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {});
const data = { generatedAt: new Date().toISOString(), agency: installed.agency || "Agency",
  brand: installed.brand || "", timezone: installed.timezone || "", employees, runs, outputs, brief, counts };

fs.mkdirSync(path.join(root, "dashboard"), { recursive: true });
fs.writeFileSync(path.join(root, "dashboard/data.json"), JSON.stringify(data, null, 2));
console.log(`dashboard/data.json written: ${employees.length} employees, ${runs.length} runs, ${outputs.length} outputs`);
