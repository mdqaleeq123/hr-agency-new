// Worker logic for the 8 HR employees. Each function does real work on the local data folder
// and returns { task, status }. Candidate data never leaves this machine; only the one-line
// task description and status go to the ledger (runlog.mjs refuses anything containing PII).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = (...p) => path.join(ROOT, 'data', ...p);
const OUT = D('out');
fs.mkdirSync(OUT, { recursive: true });

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeOut = (name, text) => fs.writeFileSync(path.join(OUT, name), text);
const THIS_YEAR = 2026;

const reqs = () => readJson(D('job_requisitions.json'));
const candidates = () => readJson(path.join(OUT, 'candidates.json'));

// ---------- 2. Talent Sourcer (Lead Researcher) ----------
export function talentSourcer() {
  let md = '# Sourcing plan\n\n';
  for (const r of reqs()) {
    const must = r.required_skills.map((s) => `"${s}"`).join(' AND ');
    const nice = r.nice_to_have.map((s) => `"${s}"`).join(' OR ');
    md += `## ${r.id} - ${r.title} (${r.location}, ${r.openings} opening${r.openings > 1 ? 's' : ''})\n`;
    md += `- Boolean string: \`("${r.title}" OR "${r.title.replace('Engineer', 'Developer')}") AND (${must}) AND (${nice})\`\n`;
    md += `- Channels: LinkedIn search (manual review), Rozee.pk, GitHub topic search, university alumni groups\n`;
    md += `- Target experience: ${r.min_years}+ years. Outreach cap: 25 prospects/week, all drafts held for human approval\n\n`;
  }
  writeOut('sourcing_plan.md', md);
  return { task: `Built sourcing plan with boolean search strings for ${reqs().length} open requisitions`, status: 'ok' };
}

// ---------- 3. Resume Parser ----------
function parseResume(text, file) {
  const line = (re) => (text.match(re) || [])[1]?.trim();
  const name = text.split('\n')[0].trim();
  const email = line(/Email:\s*([^\s|]+)/i);
  const phone = line(/Phone:\s*([^|\n]+)/i);
  const location = line(/Location:\s*(.+)/i);
  const skillsLine = line(/SKILLS\s*\n(.+)/i) || '';
  const skills = skillsLine.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const education = line(/EDUCATION\s*\n(.+)/i);
  let years = 0;
  for (const m of text.matchAll(/\((\d{4})\s*-\s*(Present|\d{4})\)/g)) {
    const end = m[2] === 'Present' ? THIS_YEAR : Number(m[2]);
    years += Math.max(0, end - Number(m[1]));
  }
  const claimed = Number((text.match(/(\d+)\s+years?\b/i) || [])[1]) || null;
  return { name, email, phone, location, skills, education, years_computed: years, years_claimed: claimed, source_file: file };
}

export function resumeParser() {
  const dir = D('resumes');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt'));
  const parsed = files.map((f) => parseResume(fs.readFileSync(path.join(dir, f), 'utf8'), f));
  writeOut('candidates.json', JSON.stringify(parsed, null, 2));
  return { task: `Parsed ${parsed.length} resumes into structured candidate records`, status: 'ok' };
}

// ---------- 4. JD & Outreach Writer ----------
export function jdWriter() {
  for (const r of reqs()) {
    const jd = `# ${r.title}\n\n**Location:** ${r.location}  \n**Openings:** ${r.openings}\n\n` +
      `## About the role\nYou will join our team as a ${r.title} and work on problems that matter to our customers.\n\n` +
      `## What you bring\n${r.required_skills.map((s) => `- Hands-on experience with ${s}`).join('\n')}\n- ${r.min_years}+ years of relevant experience\n\n` +
      `## Nice to have\n${r.nice_to_have.map((s) => `- ${s}`).join('\n')}\n\n` +
      `## Equal opportunity\nWe welcome applicants of every background and evaluate all candidates on skills and experience.\n`;
    writeOut(`jd_${r.id}.md`, jd);
  }
  const drafts = candidates().map((c) =>
    `### Draft for ${c.name}  (HELD - not sent)\nSubject: Opportunity at our company\n\nHi ${c.name.split(' ')[0]},\n\nYour background in ${c.skills.slice(0, 3).join(', ')} stood out. We have an open role that could be a good fit and would like to share details. Would you be open to a short call this week?\n\nBest regards,\nHR Team\n`).join('\n---\n');
  writeOut('outreach_drafts.md', '# Outreach drafts (all held for human approval)\n\n' + drafts);
  return { task: `Drafted ${reqs().length} job descriptions and ${candidates().length} held outreach emails`, status: 'ok' };
}

// ---------- 5. Pipeline Manager ----------
export function scoreCandidate(c, r) {
  const have = new Set(c.skills);
  const req = r.required_skills.filter((s) => have.has(s));
  const nice = r.nice_to_have.filter((s) => have.has(s));
  const reqPct = req.length / r.required_skills.length;
  const score = Math.round(reqPct * 70 + (nice.length / Math.max(1, r.nice_to_have.length)) * 20 + (c.years_computed >= r.min_years ? 10 : 0));
  return { score, missing: r.required_skills.filter((s) => !have.has(s)) };
}

export function pipelineManager() {
  const rows = [['candidate', 'best_req', 'score', 'stage', 'missing_required_skills']];
  for (const c of candidates()) {
    const best = reqs().map((r) => ({ r, ...scoreCandidate(c, r) })).sort((a, b) => b.score - a.score)[0];
    const stage = best.score >= 75 ? 'Shortlisted' : best.score >= 50 ? 'Screening' : 'Talent pool';
    rows.push([c.name, best.r.id, best.score, stage, best.missing.join('; ')]);
  }
  fs.writeFileSync(path.join(OUT, 'pipeline.csv'), rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n') + '\n');
  const counts = rows.slice(1).reduce((m, r) => ((m[r[3]] = (m[r[3]] || 0) + 1), m), {});
  return { task: `Scored and staged ${rows.length - 1} candidates (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')})`, status: 'ok' };
}

// ---------- 6. Onboarding Coordinator ----------
export function onboardingCoordinator() {
  const hires = readJson(D('hires.json'));
  for (const h of hires) {
    const md = `# Onboarding track - ${h.name} (${h.role})\nStart: ${h.start_date} | Manager: ${h.manager}\n\n` +
      `## Before day 1\n- [ ] Offer letter signed\n- [ ] Laptop and accounts requested\n- [ ] Buddy assigned\n- [ ] Welcome email drafted (HELD)\n\n` +
      `## First 30 days\n- [ ] Orientation and policy walkthrough\n- [ ] Dev environment working\n- [ ] First small task shipped\n- [ ] Week-4 check-in with manager\n\n` +
      `## Days 31-60\n- [ ] Own a feature end to end\n- [ ] Cross-team intro meetings\n- [ ] 60-day feedback survey\n\n` +
      `## Days 61-90\n- [ ] Independent on-call shadowing\n- [ ] 90-day review and goal setting\n`;
    writeOut(`onboarding_${h.name.replace(/\s+/g, '_')}.md`, md);
  }
  return { task: `Generated 30/60/90 onboarding tracks for ${hires.length} new hire(s)`, status: 'ok' };
}

// ---------- 7. HR Analyst ----------
export function hrAnalyst() {
  const lines = fs.readFileSync(path.join(OUT, 'pipeline.csv'), 'utf8').trim().split('\n').slice(1);
  const stages = lines.map((l) => l.split('","')[3]);
  const total = stages.length;
  const count = (s) => stages.filter((x) => x === s).length;
  const m = { candidates: total, shortlisted: count('Shortlisted'), screening: count('Screening'), talent_pool: count('Talent pool'),
    shortlist_rate_pct: Math.round((count('Shortlisted') / total) * 100) };
  const openings = reqs().reduce((n, r) => n + r.openings, 0);
  const flags = [];
  if (m.shortlisted < openings) flags.push(`Bottleneck: only ${m.shortlisted} shortlisted for ${openings} openings - widen sourcing`);
  if (m.talent_pool / total > 0.4) flags.push('Bottleneck: over 40% of candidates fall below the fit threshold - review sourcing channels');
  writeOut('funnel_metrics.json', JSON.stringify({ metrics: m, flags }, null, 2));
  return { task: `Computed funnel metrics, flagged ${flags.length} bottleneck(s)`, status: 'ok' };
}

// ---------- 8. Compliance & Data Auditor ----------
const BIASED = ['young', 'rockstar', 'ninja', 'digital native', 'recent graduate', 'he/she', 'manpower'];
export function complianceAuditor() {
  const issues = [];
  const seen = new Map();
  for (const c of candidates()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email || '')) issues.push(`${c.name}: invalid or missing email`);
    if (!c.phone) issues.push(`${c.name}: missing phone`);
    if (c.years_claimed && Math.abs(c.years_claimed - c.years_computed) >= 2)
      issues.push(`${c.name}: claims ${c.years_claimed} yrs but dates add up to ${c.years_computed} (verify at screening)`);
    const key = (c.email || c.name).toLowerCase();
    if (seen.has(key)) issues.push(`${c.name}: possible duplicate of ${seen.get(key)}`);
    seen.set(key, c.name);
  }
  for (const r of reqs()) {
    const jd = fs.readFileSync(path.join(OUT, `jd_${r.id}.md`), 'utf8').toLowerCase();
    for (const w of BIASED) if (jd.includes(w)) issues.push(`${r.id}: JD contains potentially biased term "${w}"`);
  }
  writeOut('audit_report.md', `# Audit report\n\n${issues.length ? issues.map((i) => `- ${i}`).join('\n') : 'No issues found.'}\n`);
  return { task: `Audited candidate data and JDs, found ${issues.length} issue(s) for review`, status: issues.length ? 'partial' : 'ok' };
}
