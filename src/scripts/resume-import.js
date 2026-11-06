// Reads an existing resume (PDF, Word .docx or plain text) in the browser and turns it into the
// resume maker's fields. Nothing is uploaded: the file is read with the File API, PDFs are parsed by
// pdf.js (loaded only when needed, from this site), and .docx files are unzipped with the browser's
// own DecompressionStream. The field guesses are heuristics, so the page asks the user to check them.

// ---------- reading files ----------
export async function readResumeFile(file) {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return readPdf(await file.arrayBuffer());
  if (name.endsWith('.docx')) return readDocx(await file.arrayBuffer());
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) return file.text();
  throw new Error('unsupported');
}

async function readPdf(buf) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
  const out = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const { items } = await page.getTextContent();
    // 1. Group text pieces into rows by their baseline
    const rows = [];
    for (const it of items) {
      if (!('str' in it) || !it.str || !it.str.trim()) continue;
      const x = it.transform[4], y = it.transform[5], h = Math.abs(it.transform[3]) || 10;
      let row = rows.find((r) => Math.abs(r.y - y) < Math.max(2, h * 0.35));
      if (!row) { row = { y, parts: [] }; rows.push(row); }
      row.parts.push({ x, w: it.width || 0, s: it.str, h });
    }
    rows.sort((a, b) => b.y - a.y);
    rows.forEach((r) => r.parts.sort((a, b) => a.x - b.x));
    // 2. Two-column layouts: find an x where many rows lie wholly to the left and many wholly to the right,
    //    and almost no text runs across it. Rows that cross it (a full-width header) are read first.
    const ends = (r) => r.parts[r.parts.length - 1].x + r.parts[r.parts.length - 1].w;
    const cands = [...new Set(rows.flatMap((r) => r.parts.map((pt) => Math.round(pt.x))).filter((x) => x > width * 0.2 && x < width * 0.65))];
    let split = null, best = 0;
    for (const sx of cands) {
      let L = 0, R = 0, cross = 0;
      for (const r of rows) {
        if (ends(r) <= sx + 1) L++;
        else if (r.parts[0].x >= sx - 1) R++;
        else if (r.parts.some((pt) => pt.x < sx - 1 && pt.x + pt.w > sx + 1)) cross++;
      }
      if (L >= 4 && R >= 4 && cross <= rows.length * 0.2 && Math.min(L, R) > best) { best = Math.min(L, R); split = sx - 1; }
    }
    let blocks = [rows];
    if (split !== null) {
      const spans = (r) => r.parts.some((pt) => pt.x < split && pt.x + pt.w > split + 2);
      const top = rows.filter(spans);
      const rest = rows.filter((r) => !spans(r));
      blocks = [top,
        rest.map((r) => ({ ...r, parts: r.parts.filter((pt) => pt.x < split) })).filter((r) => r.parts.length),
        rest.map((r) => ({ ...r, parts: r.parts.filter((pt) => pt.x >= split) })).filter((r) => r.parts.length)];
    }
    for (const col of blocks) {
      // 3. Join each row into a line. A row indented 6-30 pt from the last un-indented row is a bullet point;
      //    an indented row that starts in lower case or with a digit continues the bullet above it.
      let anchor = null, prevBullet = false;
      for (const r of col) {
        let line = '', end = null;
        for (const pt of r.parts) {
          if (end !== null && pt.x - end > pt.h * 0.18 && !line.endsWith(' ') && !pt.s.startsWith(' ')) line += ' ';
          line += pt.s;
          end = pt.x + pt.w;
        }
        line = line.trim();
        const x0 = r.parts[0].x;
        const ind = anchor === null ? 0 : x0 - anchor;
        const bullet = ind > 6 && ind < 30;
        if (!bullet) anchor = x0;
        if (bullet && prevBullet && /^[a-z0-9(]/.test(line) && out.length) out[out.length - 1] += ' ' + line;
        else out.push(bullet && !BULLET.test(line) ? '• ' + line : line);
        prevBullet = bullet;
      }
      out.push('');
    }
  }
  return out.join('\n');
}

async function readDocx(buf) {
  const xml = await unzipEntry(buf, 'word/document.xml');
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const lines = [];
  for (const p of dom.getElementsByTagNameNS(W, 'p')) {
    let s = '';
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (c.nodeType !== 1) continue;
        if (c.namespaceURI === W && c.localName === 't') s += c.textContent;
        else if (c.namespaceURI === W && c.localName === 'tab') s += '\t';
        else if (c.namespaceURI === W && (c.localName === 'br' || c.localName === 'cr')) s += '\n';
        else if (!(c.namespaceURI === W && c.localName === 'pPr')) walk(c);
      }
    };
    walk(p);
    const style = p.getElementsByTagNameNS(W, 'pStyle')[0]?.getAttributeNS(W, 'val') || '';
    const bullet = p.getElementsByTagNameNS(W, 'numPr').length > 0 || /list|bullet/i.test(style);
    lines.push((bullet && s.trim() ? '• ' : '') + s);
  }
  return lines.join('\n');
}

// Minimal ZIP reader: find one file through the central directory and inflate it.
async function unzipEntry(buf, wanted) {
  const v = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip');
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  for (let k = 0; k < count; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true);
    const nlen = v.getUint16(p + 28, true), elen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf, p + 46, nlen));
    if (name === wanted) {
      const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
      const data = new Uint8Array(buf, start, csize);
      if (method === 0) return dec.decode(data);
      if (method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('cannot inflate');
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return await new Response(stream).text();
    }
    p += 46 + nlen + elen + clen;
  }
  throw new Error('no document');
}

// ---------- turning text into fields ----------
const BULLET = /^\s*(?:[•●▪◦‣∙·*➢➤►▶✓✔-]|–|—|\d+[.)])\s+/;
const PRIVATE = /[-�]/g;
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const POINT = `(?:${MONTH}\\s*'?\\d{2,4}|\\d{1,2}[/.-]\\d{4}|\\d{4})`;
const DATE_RANGE = new RegExp(`(${POINT})(?:\\s*[-–—−‐]\\s*|\\s+(?:to|till)\\s+|\\s+)(${POINT}|present|current|now|ongoing|till date|today)`, 'i');
const LONE_YEAR = /(?:^|[\s(,|])((?:19|20)\d{2})(?:\)|$|[\s,|])/;
const SCORE = /((?:c?gpa|sgpa|cpi|percentage|score|marks)\s*[:\-–]?\s*\d+(?:\.\d+)?\s*(?:\/\s*\d+(?:\.\d+)?)?\s*%?|\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*\/\s*10(?:\.0)?\b)/i;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[\w-]+(?:\.[\w-]+)+(?:\/[^\s|,]*)?/i;

const HEADINGS = [
  ['summary', /^(?:professional |career |personal )?(?:summary|profile|objective|about me|about|overview)$/i],
  ['education', /^(?:education(?:al)?(?: qualifications?| background| details)?|academic(?:s| qualifications?| background| details)?|qualifications?)$/i],
  ['experience', /^(?:(?:work|professional|relevant|industry|internship)\s+)?(?:experience|employment(?: history)?|internships?|work history)$/i],
  ['projects', /^(?:(?:academic|personal|key|selected|technical|major|relevant)\s+)?projects?$/i],
  ['skills', /^(?:(?:technical|key|core|relevant)\s+)?(?:skills?|competencies|technologies|skills? (?:and|&) (?:tools|technologies|interests)|tools(?: and| &) technologies)$/i],
  ['achievements', /^(?:achievements?|awards?(?: (?:and|&) achievements?)?|honou?rs(?: (?:and|&) awards)?|certifications?|certificates?|courses? (?:and|&) certifications?|extra[- ]?curricular(?: activities)?|activities|positions? of responsibility|accomplishments|achievements? (?:and|&) certifications?|certifications? (?:and|&) achievements?)$/i],
];
const SQUASHED = HEADINGS.map(([k, rx]) => [k, new RegExp(rx.source.replace(/\\s\+|\\s\*| /g, ''), 'i')]);
const headingOf = (line) => {
  const t = line.replace(/[:：]\s*$/, '').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 60) return null;
  for (const [k, rx] of HEADINGS) if (rx.test(t)) return k;
  const sq = t.replace(/\s+/g, '');           // letter-spaced headings: "a c h i e v e m e n t s"
  for (const [k, rx] of SQUASHED) if (rx.test(sq)) return k;
  return null;
};

// Letter-spaced headings ("S U M M A R Y") lose their spaces
const clean = (s) => { const t = s.replace(PRIVATE, '').replace(/\t+/g, '  ').replace(/\s+$/, ''); return /^\s*(?:\S ){3,}\S\s*$/.test(t) ? t.replace(/ /g, '') : t; };
const strip = (s) => s.replace(BULLET, '').trim();
const trimSep = (s) => s.replace(/^[\s|,–—:;-]+|[\s|,–—:;-]+$/g, '').trim();

function takeDates(text) {
  const m = text.match(DATE_RANGE);
  if (m) return { start: m[1].trim(), end: m[2].trim().replace(/^./, (c) => c.toUpperCase()), rest: trimSep(text.replace(m[0], ' ').replace(/\(\s*\)/, '')) };
  return null;
}

const DANGLING = new RegExp(`^(${POINT})\\s*[-–—−‐]\\s+(.*)$`, 'i');
const DATE_HEAD = new RegExp(`^(${POINT}|present|current|now|ongoing|till date)\\b\\s*(.*)$`, 'i');
function entries(input, kind) {
  // Dates in a narrow left column often wrap: "May 2025 – Title ..." then "Jul 2025 ...". Rejoin them.
  const lines = input.slice();
  for (let k = 0; k + 1 < lines.length; k++) {
    const a = lines[k].trim().match(DANGLING), b = lines[k + 1].trim().match(DATE_HEAD);
    if (a && b && !DATE_RANGE.test(lines[k])) { lines[k] = `${a[2]} ${a[1]} – ${b[1]}`; lines[k + 1] = b[2] ? (BULLET.test(b[2]) ? b[2] : '• ' + b[2]) : ''; }
  }
  const out = [];
  let cur = null;
  const start = () => { cur = { head: [], points: [], start: '', end: '' }; out.push(cur); };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = BULLET.test(raw);
    const d = takeDates(line);
    const titleLike = !bullet && line.length < 90 && !/[.;]$/.test(line) && !/^[a-z]/.test(line);
    if (!cur) start();
    if (bullet) { cur.points.push(strip(line)); continue; }
    const yearLine = kind === 'education' && LONE_YEAR.test(line);
    if ((cur.points.length && titleLike) || (d && cur.start && cur.head.length) || (cur.head.length >= 2 && titleLike && ((d && cur.start) || (yearLine && !d && (cur.end || cur.head.some((h) => LONE_YEAR.test(h))))))) start();
    if (d && !cur.start) { cur.start = d.start; cur.end = d.end; if (d.rest) cur.head.push(d.rest); continue; }
    if (!cur.head.length || (cur.head.length < 2 && titleLike)) cur.head.push(line);
    else cur.points.push(line);
  }
  return out.map((e) => {
    const all = [...e.head, ...e.points].join(' ');
    if (kind === 'education') {
      let score = '';
      const heads = e.head.map((h) => { const m = h.match(SCORE); if (m && !score) { score = m[1].trim(); return trimSep(h.replace(m[0], ' ')); } return h; });
      const pts = e.points.filter((p) => { const m = p.match(SCORE); if (m && !score && p.length < 40) { score = m[1].trim(); return false; } return true; });
      let end = e.end, startY = e.start;
      if (!end) { const y = all.match(LONE_YEAR); if (y) { end = y[1]; heads.forEach((h, i) => { heads[i] = trimSep(h.replace(y[1], ' ')); }); } }
      return { degree: heads[0] || '', school: heads[1] || '', start: startY, end: end || '', score, points: pts.join('\n') };
    }
    if (kind === 'experience') {
      let role = e.head[0] || '', org = '', location = '';
      const at = role.match(/^(.*?)\s+(?:at|@)\s+(.*)$/i);
      if (at) { role = at[1]; org = at[2]; }
      else {
        const parts = role.split(/\s*(?:\||,|–|—|\s-\s)\s*/).filter(Boolean);
        if (parts.length > 1) { role = parts[0]; org = parts[1]; location = parts.slice(2).join(', '); }
      }
      if (e.head[1]) {
        const parts = e.head[1].split(/\s*(?:\||,(?=\s*[A-Z]))\s*/).filter(Boolean);
        if (!org) { org = parts[0]; location = location || parts.slice(1).join(', '); }
        else if (!location && e.head[1].length < 40) location = e.head[1];
        else e.points.unshift(e.head[1]);
      }
      return { role: trimSep(role), org: trimSep(org), location: trimSep(location), start: e.start, end: e.end, points: e.points.join('\n') };
    }
    // projects
    let name = e.head[0] || '', tools = '', link = '';
    const lk = all.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|gitlab\.com|[\w-]+\.(?:vercel|netlify|github)\.(?:app|io))\/?[^\s|,)]*/i);
    if (lk) link = lk[0];
    const tm = name.match(/^(.*?)\s*(?:\||–|—|\s-\s|\()\s*(.*?)\)?$/);
    if (tm && tm[2] && !/^https?:/i.test(tm[2])) { name = tm[1]; tools = tm[2]; }
    const pts = [];
    for (const p of [...e.head.slice(1), ...e.points]) {
      const tl = p.match(/^(?:tech(?:nologies| stack)?|tools(?: used)?|stack|built with)\s*[:\-–]\s*(.*)$/i);
      if (tl) { tools = tools || tl[1]; continue; }
      if (link && p.replace(/^link\s*[:\-]\s*/i, '').trim() === link) continue;
      pts.push(p);
    }
    if (link) { name = trimSep(name.replace(link, ' ')); tools = trimSep(tools.replace(link, ' ')); }
    return { name: trimSep(name), tools: trimSep(tools), link, points: pts.join('\n') };
  }).filter((x) => Object.values(x).some((v) => String(v).trim()));
}

export function parseResume(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n').map(clean);
  // Split into the header (before the first section heading) and sections
  const sections = { summary: [], education: [], experience: [], projects: [], skills: [], achievements: [] };
  const header = [];
  let cur = null;
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    if (/made with kotaquantumvalley\.in/i.test(l)) continue;
    let h = headingOf(strip(l));
    if (!h && lines[k + 1] !== undefined && l.trim() && l.trim().length < 30) {   // a heading wrapped over two lines
      h = headingOf(strip(l) + ' ' + strip(lines[k + 1]));
      if (h) k++;
    }
    if (h) { cur = h; continue; }
    if (cur) sections[cur].push(l); else header.push(l);
  }
  const basics = { name: '', headline: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' };
  const leftover = [];
  for (const raw of header) {
    let line = raw.trim().replace(/\b(?:e-?mail(?: id)?|mobile(?: no\.?)?|phone(?: no\.?)?|ph|tel|contact(?: no\.?)?|address)\s*[:\-–]\s*/gi, ' ');
    if (!line) continue;
    const take = (re) => { const m = line.match(re); if (m) { line = line.replace(m[0], ' '); return m[0].trim(); } return ''; };
    let found = false;
    const em = take(EMAIL); if (em) { basics.email ||= em; found = true; }
    for (let k = 0; k < 4; k++) {
      const u = line.match(URL_RE);
      if (!u || EMAIL.test(u[0])) break;
      const url = u[0].replace(/[.,;]$/, '');
      if (/linkedin\.com/i.test(url)) basics.linkedin ||= url;
      else if (/github\.com/i.test(url)) basics.github ||= url;
      else if (/^(?:https?:\/\/|www\.)/i.test(url) || /\.(?:com|in|org|net|io|dev|me|co|ai|app|edu|xyz|site|info|page)(?:\/|$)/.test(url)) basics.website ||= url;
      else break;
      line = line.replace(u[0], ' '); found = true;
    }
    const ph = line.match(PHONE);
    if (ph && ph[0].replace(/\D/g, '').length >= 10) { basics.phone ||= ph[0].trim(); line = line.replace(ph[0], ' '); found = true; }
    line = trimSep(line.replace(/\s*[|•·]\s*/g, ' | ').replace(/(\s\|\s)+/g, ' | '));
    if (!line) continue;
    const loc = line.match(/(?:^|\|\s*)([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?,\s*[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)(?:\s*\||$)/);
    if (found && loc) { basics.location ||= loc[1]; line = trimSep(line.replace(loc[1], ' ')); }
    if (!line) continue;
    if (!basics.name && /^[A-Za-z][A-Za-z.' -]{1,40}$/.test(line) && line.split(/\s+/).length <= 5) { basics.name = line.replace(/\s+/g, ' '); continue; }
    if (!found && loc && !basics.location && line === loc[1]) { basics.location = loc[1]; continue; }
    if (basics.name && !basics.headline && line.length <= 110 && !/[.]$/.test(line)) { basics.headline = line; continue; }
    leftover.push(line);
  }
  const para = (xs) => xs.map((x) => x.trim()).filter(Boolean).map(strip).join(' ').replace(/\s+/g, ' ').trim();
  const summary = para(sections.summary.length ? sections.summary : leftover);
  const skills = [];
  let label = '';
  for (const l of sections.skills) {
    const t = strip(l.trim());
    if (!t) continue;
    if (!/[,:;|•·]/.test(t) && t.split(/\s+/).length <= 3 && t.length < 28 && /^[A-Z]/.test(t) && !label) { label = t; continue; }
    if (label) { skills.push({ group: label, items: t.split(/\s*[,;|•·]\s*/).filter(Boolean).join(', ') }); label = ''; continue; }
    const m = t.match(/^([^:]{2,40}):\s*(.+)$/);
    if (m) skills.push({ group: m[1].trim(), items: m[2].split(/\s*[,;|•·]\s*/).filter(Boolean).join(', ') });
    else if (skills.length && !skills[skills.length - 1].group) skills[skills.length - 1].items += ', ' + t.split(/\s*[,;|•·]\s*/).filter(Boolean).join(', ');
    else skills.push({ group: '', items: t.split(/\s*[,;|•·]\s*/).filter(Boolean).join(', ') });
  }
  const achievements = sections.achievements.map((l) => strip(l.trim())).filter(Boolean).join('\n');
  return {
    basics, summary,
    education: entries(sections.education, 'education'),
    experience: entries(sections.experience, 'experience'),
    projects: entries(sections.projects, 'projects'),
    skills, achievements,
  };
}
