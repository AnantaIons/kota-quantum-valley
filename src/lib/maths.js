// Course 2 content: chapter sources, metadata and review records live in content/mathematics,
// separate from the pages that present them. A chapter gets a page only once its status has
// passed at least the mathematics check (see content/mathematics/README.md).
import course from '../../content/mathematics/course.json';
import d06 from '../../content/mathematics/ledger/D06-complex-numbers.json';
import { renderChapter } from './maths-render.mjs';

const sources = import.meta.glob('/content/mathematics/chapters/*/chapter.md', { query: '?raw', import: 'default', eager: true });
const metas = import.meta.glob('/content/mathematics/chapters/*/metadata.json', { import: 'default', eager: true });
const reviews = import.meta.glob('/content/mathematics/chapters/*/review.json', { import: 'default', eager: true });

const dirOf = (p) => p.split('/').slice(-2, -1)[0];
export const ledgers = { D06: d06 };
export { course };

let cache;
export async function getChapters() {
  if (cache) return cache;
  const list = [];
  for (const [p, meta] of Object.entries(metas)) {
    const dir = dirOf(p);
    const src = sources[`/content/mathematics/chapters/${dir}/chapter.md`];
    const review = reviews[`/content/mathematics/chapters/${dir}/review.json`];
    const r = await renderChapter(src);
    list.push({ meta, review, ...r, public: course.public_statuses.includes(meta.status) });
  }
  cache = list.sort((a, b) => a.meta.chapter_number - b.meta.chapter_number);
  return cache;
}

// How a chapter's checks read to a learner
export function checkSummary(review, hi = false) {
  const n = (r) => review.checks.filter((c) => c.result === r).length;
  return {
    pass: n('PASS') + n('FIXED'), total: review.checks.length, pending: n('NEEDS HUMAN REVIEW') + n('NEEDS FOUNDER DECISION'),
    human: false,
  };
}
