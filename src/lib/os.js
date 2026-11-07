// Course 4 content (operating systems and embedded Linux): chapters live in content/os.
// A chapter gets a page once its programs have passed the code check (see course.json public_statuses).
import course from '../../content/os/course.json';
import plan from '../../content/os/plan.json';
import { loadChapters } from './code-course.js';

const sources = import.meta.glob('/content/os/chapters/*/chapter.md', { query: '?raw', import: 'default', eager: true });
const metas = import.meta.glob('/content/os/chapters/*/metadata.json', { import: 'default', eager: true });
const reviews = import.meta.glob('/content/os/chapters/*/review.json', { import: 'default', eager: true });
const svgs = import.meta.glob('/content/os/chapters/*/diagrams/*.svg', { query: '?raw', import: 'default', eager: true });

export { course, plan };

let cache;
export async function getOsChapters() {
  cache ??= await loadChapters({ course, root: '/content/os/chapters', sources, metas, reviews, svgs });
  return cache;
}
