// Collects Markdown posts. English: src/pages/posts/. Hindi lessons: src/pages/hi/lessons/.
// category: 'journey' (Learning log), 'explainer' or 'lesson'. Leave empty for all posts.
import { t } from '../i18n.js';

export function getPosts(category, lang = 'en') {
  const modules = lang === 'hi'
    ? import.meta.glob('../pages/hi/lessons/*.md', { eager: true })
    : import.meta.glob('../pages/posts/*.md', { eager: true });
  const posts = Object.values(modules)
    .map((m) => ({ url: m.url, ...m.frontmatter }))
    .filter((p) => !p.draft)
    .filter((p) => !category || p.category === category);
  if (category === 'lesson') return posts.sort((a, b) => (a.lesson ?? 0) - (b.lesson ?? 0));
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatDate(d, lang = 'en') {
  return new Date(d).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function lessonLabel(p, lang = 'en') {
  if (p.category !== 'lesson') return null;
  return p.lesson ? t[lang].lesson(p.lesson) : t[lang].roadmapLabel;
}
