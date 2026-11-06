// Renders a maths chapter (Markdown with $...$ and $$...$$ equations) to HTML at build time.
// Used only by Course 2, so Course 1's Markdown (where "$" means dollars) is untouched.
// Shared by the site pages and scripts/validate-maths.mjs.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// Minimal front matter reader: one "key: value" per line, quotes optional.
export function splitFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    data[kv[1]] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

const textOf = (node) => (node.type === 'text' ? node.value : (node.children || []).map(textOf).join(''));
// "0.3 · Three problems" → "s0-3"; other headings → a plain slug
const idFor = (text) => {
  const sec = text.match(/^(\d+(?:\.\d+)*)\s*·/);
  if (sec) return 's' + sec[1].replace(/\./g, '-');
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 60) || 'section';
};

// Give h2/h3 ids and collect them for the table of contents
function headingIds(out) {
  return () => (tree) => {
    const seen = new Set();
    const walk = (node) => {
      if (node.type === 'element' && /^h[23]$/.test(node.tagName)) {
        const text = textOf(node).trim();
        let id = idFor(text), k = 2;
        while (seen.has(id)) id = `${idFor(text)}-${k++}`;
        seen.add(id);
        node.properties = { ...(node.properties || {}), id };
        out.push({ depth: Number(node.tagName[1]), id, text });
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

// ![Caption](diagram:name) on its own line becomes a numbered figure with the SVG inlined,
// so diagrams take the page's fonts and colours. diagrams maps name -> SVG text.
function figures(html, diagrams, chapterNo, missing) {
  let k = 0;
  return html.replace(/<p><img src="diagram:([\w-]+)" alt="([^"]*)"\s*\/?><\/p>/g, (_, name, alt) => {
    const svg = diagrams[name];
    if (!svg) { missing.push(name); return ''; }
    k += 1;
    return `<figure class="mdia" id="fig-${name}"><div class="mdia-art">${svg.trim()}</div><figcaption><strong>Figure ${chapterNo}.${k}.</strong> ${alt}</figcaption></figure>`;
  });
}

export async function renderChapter(src, diagrams = {}) {
  const { data, body } = splitFrontmatter(src);
  const md = body.replace(/^\s*#\s+[^\n]*\n/, '');            // the page template prints the title
  const headings = [];
  const file = await unified()
    .use(remarkParse).use(remarkGfm).use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex, { throwOnError: false, strict: 'ignore' })
    .use(headingIds(headings))
    .use(rehypeStringify)
    .process(md);
  let html = String(file);
  // Wide tables and long display equations scroll inside their own box on phones
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  // Reference list items get anchors; [F1]-style markers in the text link to them
  html = html.replace(/<li><strong>\[([A-Z]\d+)\]<\/strong>/g, '<li id="ref-$1"><strong>[$1]</strong>');
  html = html.replace(/(?<!<strong>)\[([A-Z]\d+)\](?!<\/strong>)/g, '<a class="cite" href="#ref-$1">[$1]</a>');
  html = html.replace(/\[([A-Z]\d+(?:,\s*[A-Z]\d+)+)\]/g, (_, list) =>
    '[' + list.split(/,\s*/).map((r) => `<a class="cite" href="#ref-${r}">${r}</a>`).join(', ') + ']');
  // "Answers" sections stay folded until the learner has tried the questions
  html = html.replace(/(<h3 id="[^"]+">(Answers[^<]*)<\/h3>)([\s\S]*?)(?=<h[23][\s>]|$)/g,
    (_, h, label, rest) => `<details class="answers"><summary>${label}</summary>${rest}</details>`);
  const missing = [];
  html = figures(html, diagrams, data.chapter_number ?? '', missing);
  const errors = (html.match(/class="katex-error"[^>]*>[^<]*/g) || []).map((s) => s.replace(/.*>/, ''));
  missing.forEach((n) => errors.push(`missing diagram ${n}`));
  return { data, html, headings, errors };
}
