// Collects every Markdown post in src/pages/posts/.
// category: 'journey' (Learning log), 'explainer' or 'lesson'. Leave empty for all posts.
export function getPosts(category) {
  const modules = import.meta.glob('../pages/posts/*.md', { eager: true });
  const posts = Object.values(modules)
    .map((m) => ({ url: m.url, ...m.frontmatter }))
    .filter((p) => !p.draft)
    .filter((p) => !category || p.category === category);
  if (category === 'lesson') return posts.sort((a, b) => (a.lesson ?? 0) - (b.lesson ?? 0));
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function lessonLabel(p) {
  if (p.category !== 'lesson') return null;
  return p.lesson ? `Lesson ${p.lesson}` : 'Roadmap';
}
