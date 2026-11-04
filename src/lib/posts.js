// Collects Markdown posts. English: src/pages/posts/. Hindi lessons: src/pages/hi/lessons/.
// category: 'journey' (Learning log), 'explainer' or 'lesson'. Leave empty for all posts.
// Lesson numbers come from the order in src/data/course.js, so re-ordering the course is one edit there.
import { t } from '../i18n.js';
import { lessonNumber } from '../data/course.js';

export const slugOf = (url = '') => url.replace(/\/$/, '').split('/').pop();

export function getPosts(category, lang = 'en') {
  const modules = lang === 'hi'
    ? { ...import.meta.glob('../pages/hi/lessons/*.md', { eager: true }), ...import.meta.glob('../pages/hi/posts/*.md', { eager: true }) }
    : import.meta.glob('../pages/posts/*.md', { eager: true });
  const posts = Object.values(modules)
    .map((m) => {
      const slug = slugOf(m.url);
      const p = { url: m.url, slug, ...m.frontmatter };
      if (p.category === 'lesson') p.lesson = lessonNumber(slug) ?? p.lesson ?? 99;
      return p;
    })
    .filter((p) => !p.draft)
    .filter((p) => !category || p.category === category);
  if (category === 'lesson') return posts.sort((a, b) => a.lesson - b.lesson);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatDate(d, lang = 'en') {
  return new Date(d).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function lessonLabel(p, lang = 'en') {
  if (p.category && p.category !== 'lesson') return null;
  return p.lesson ? t[lang].lesson(p.lesson) : t[lang].roadmapLabel;
}
