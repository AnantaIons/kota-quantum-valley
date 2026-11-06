// Checks Course 2 content before every build. Any error stops the build, so a chapter with a
// broken equation, a missing review record or a bad prerequisite can't reach the live site.
//   node scripts/validate-maths.mjs
import fs from 'node:fs';
import path from 'node:path';
import { renderChapter } from '../src/lib/maths-render.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../content/mathematics');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const errors = [], notes = [];
const err = (m) => errors.push(m);

// ---- course map ----
const course = read('course.json');
const dIds = course.domains.map((d) => d.id);
if (course.domains.length !== 18) err(`course.json: expected 18 domains, found ${course.domains.length}`);
if (new Set(dIds).size !== dIds.length) err('course.json: duplicate domain IDs');
const total = course.domains.reduce((n, d) => n + d.planned, 0);
if (total !== 1100) err(`course.json: planned chapters add up to ${total}, not 1,100`);

// ---- ledgers ----
const known = new Map();            // id -> prerequisites
for (const d of course.domains.filter((x) => x.ledger)) {
  const L = read(d.ledger);
  const rows = L.chapters;
  if (rows.length !== d.planned) err(`${d.ledger}: ${rows.length} chapters, planned ${d.planned}`);
  rows.forEach((r, i) => {
    const want = `KQV-MATH-${d.id}-C${String(i + 1).padStart(3, '0')}`;
    if (r.id !== want) err(`${d.ledger}: row ${i + 1} has id ${r.id}, expected ${want}`);
    for (const k of ['title', 'entry_level', 'ceiling', 'objective', 'toughest', 'status']) if (!r[k]) err(`${r.id}: empty ${k}`);
    if (!Array.isArray(r.tiers) || !r.tiers.length) err(`${r.id}: no problem tiers`);
    else {
      r.tiers.forEach((t) => { if (!course.tiers[t]) err(`${r.id}: unknown tier ${t}`); });
      if (!r.tiers.includes(r.ceiling)) err(`${r.id}: ceiling ${r.ceiling} is not one of its tiers`);
    }
    if (!course.statuses.includes(r.status)) err(`${r.id}: unknown status ${r.status}`);
    if (known.has(r.id)) err(`duplicate chapter id ${r.id}`);
    known.set(r.id, r.prerequisites);
  });
  const titles = rows.map((r) => r.title.toLowerCase());
  if (new Set(titles).size !== titles.length) err(`${d.ledger}: duplicate titles`);
  notes.push(`${d.id}: ${rows.length} chapters in the ledger`);
}

// ---- chapters ----
const dir = path.join(ROOT, 'chapters');
const slugs = new Set();
for (const id of fs.readdirSync(dir)) {
  const base = path.join(dir, id);
  for (const f of ['chapter.md', 'metadata.json', 'review.json']) if (!fs.existsSync(path.join(base, f))) err(`${id}: missing ${f}`);
  if (errors.length) continue;
  const meta = read(`chapters/${id}/metadata.json`), review = read(`chapters/${id}/review.json`);
  const { data, errors: texErr } = await renderChapter(fs.readFileSync(path.join(base, 'chapter.md'), 'utf8'));
  if (meta.id !== id) err(`${id}: metadata id is ${meta.id}`);
  if (data.id !== id) err(`${id}: chapter.md front matter id is ${data.id}`);
  if (data.status !== meta.status) err(`${id}: status differs (chapter.md ${data.status}, metadata ${meta.status})`);
  if (String(data.version) !== String(meta.version) || review.version !== meta.version) err(`${id}: version differs between chapter.md, metadata and review`);
  if (!course.statuses.includes(meta.status)) err(`${id}: unknown status ${meta.status}`);
  if (slugs.has(meta.slug)) err(`${id}: duplicate slug ${meta.slug}`);
  slugs.add(meta.slug);
  texErr.forEach((e) => err(`${id}: equation does not render: ${e}`));
  if (course.public_statuses.includes(meta.status) && review.checks.some((c) => c.result === 'FAIL')) err(`${id}: has a FAIL in review.json but is marked ${meta.status}`);
  known.set(id, meta.prerequisites);
  notes.push(`${id}: ${meta.status}, equations OK`);
}

// ---- prerequisites exist and form no cycle ----
for (const [id, pre] of known) for (const p of pre) if (!known.has(p)) err(`${id}: prerequisite ${p} does not exist`);
const state = new Map();
const visit = (id, trail) => {
  if (state.get(id) === 2) return;
  if (state.get(id) === 1) { err(`prerequisite cycle: ${[...trail, id].join(' -> ')}`); return; }
  state.set(id, 1);
  for (const p of known.get(id) || []) visit(p, [...trail, id]);
  state.set(id, 2);
};
for (const id of known.keys()) visit(id, []);

notes.forEach((n) => console.log('  ' + n));
if (errors.length) { console.error(`\nCourse 2 content check failed:\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log('Course 2 content check passed.');
