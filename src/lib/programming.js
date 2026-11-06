// Course 3 content: chapters live in content/programming, like Course 2's in content/mathematics.
// A chapter gets a page once its programs have passed the code check (see course.json public_statuses).
// Rendering reuses the Course 2 Markdown pipeline, then adds syntax highlighting and puts a C block
// and the Python block right after it side by side, so the two languages can be compared line by line.
import course from '../../content/programming/course.json';
import plan from '../../content/programming/plan.json';
import { renderChapter } from './maths-render.mjs';
import { createHighlighter } from 'shiki';

const sources = import.meta.glob('/content/programming/chapters/*/chapter.md', { query: '?raw', import: 'default', eager: true });
const metas = import.meta.glob('/content/programming/chapters/*/metadata.json', { import: 'default', eager: true });
const reviews = import.meta.glob('/content/programming/chapters/*/review.json', { import: 'default', eager: true });
const svgs = import.meta.glob('/content/programming/chapters/*/diagrams/*.svg', { query: '?raw', import: 'default', eager: true });

const dirOf = (p) => p.split('/').slice(-2, -1)[0];
export { course, plan };

const LANGS = { c: 'C', python: 'Python', bash: 'Terminal', console: 'Terminal', text: 'Text', output: 'Output', asm: 'Assembly' };
// A terminal session: "$ command" lines stand out from the output under them; "..." marks output that varies by machine.
const consoleHtml = (code) => `<pre class="pcode pcon"><code>${code.split('\n').map((l) => l.startsWith('$ ') ? `<span class="pc-cmd"><span class="pc-dollar">$</span> ${escape(l.slice(2))}</span>` : l.trim() === '...' ? '<span class="pc-skip">...</span>' : escape(l)).join('\n')}</code></pre>`;
const unescape = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let hl;
async function highlighter() {
  hl ??= await createHighlighter({ themes: ['github-dark'], langs: ['c', 'python', 'bash', 'asm'] });
  return hl;
}

// One code block → a labelled figure. The first line of a program may name its file ("// hello.c", "# hello.py").
async function block(lang, raw) {
  const code = unescape(raw).replace(/\n$/, '');
  const h = await highlighter();
  const first = code.split('\n')[0];
  const file = (lang === 'c' && first.match(/^\/\/\s*([\w.-]+\.[ch])\b/)) || (lang === 'python' && first.match(/^#\s*([\w.-]+\.py)\b/));
  const label = `${LANGS[lang] ?? lang}${file ? ` · ${file[1]}` : ''}`;
  const body = ['c', 'python', 'bash', 'asm'].includes(lang)
    ? h.codeToHtml(code, { lang, theme: 'github-dark' }).replace('<pre class="shiki', '<pre class="pcode shiki')
    : lang === 'console' ? consoleHtml(code)
    : `<pre class="pcode ${lang === 'output' ? 'pout' : 'ptext'}"><code>${escape(code)}</code></pre>`;
  return `<figure class="pblock pblock-${lang}"><figcaption>${label}</figcaption>${body}</figure>`;
}

export async function renderProgChapter(src, diagrams = {}) {
  const r = await renderChapter(src, diagrams);
  let html = r.html;
  // Highlight every fenced block
  const parts = [];
  let last = 0;
  const re = /<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g;
  for (const m of html.matchAll(re)) {
    parts.push(html.slice(last, m.index));
    parts.push({ lang: m[1], html: await block(m[1], m[2]) });
    last = m.index + m[0].length;
  }
  parts.push(html.slice(last));
  // A C block followed directly by a Python block becomes a side-by-side pair
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (typeof p === 'string') { out += p; continue; }
    const gap = parts[i + 1], q = parts[i + 2];
    if (p.lang === 'c' && typeof gap === 'string' && !gap.trim() && q && q.lang === 'python') {
      out += `<div class="pair">${p.html}${q.html}</div>`;
      i += 2;
    } else out += p.html;
  }
  return { ...r, html: out };
}

let cache;
export async function getProgChapters() {
  if (cache) return cache;
  const list = [];
  for (const [p, meta] of Object.entries(metas)) {
    const dir = dirOf(p);
    const src = sources[`/content/programming/chapters/${dir}/chapter.md`];
    const review = reviews[`/content/programming/chapters/${dir}/review.json`];
    const diagrams = Object.fromEntries(Object.entries(svgs).filter(([k]) => k.includes(`/chapters/${dir}/`)).map(([k, v]) => [k.split('/').pop().replace(/\.svg$/, ''), v]));
    const r = await renderProgChapter(src, diagrams);
    list.push({ meta, review, ...r, public: course.public_statuses.includes(meta.status) });
  }
  cache = list.sort((a, b) => a.meta.chapter_number - b.meta.chapter_number);
  return cache;
}
