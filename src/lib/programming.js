// Course 3 content: chapters live in content/programming, like Course 2's in content/mathematics.
// A chapter gets a page once its programs have passed the code check (see course.json public_statuses).
import course from '../../content/programming/course.json';
import plan from '../../content/programming/plan.json';
import { loadChapters, renderCodeChapter } from './code-course.js';

const sources = import.meta.glob('/content/programming/chapters/*/chapter.md', { query: '?raw', import: 'default', eager: true });
const metas = import.meta.glob('/content/programming/chapters/*/metadata.json', { import: 'default', eager: true });
const reviews = import.meta.glob('/content/programming/chapters/*/review.json', { import: 'default', eager: true });
const svgs = import.meta.glob('/content/programming/chapters/*/diagrams/*.svg', { query: '?raw', import: 'default', eager: true });

export { course, plan };
export const renderProgChapter = renderCodeChapter;

let cache;
export async function getProgChapters() {
  cache ??= await loadChapters({ course, root: '/content/programming/chapters', sources, metas, reviews, svgs });
  return cache;
}
