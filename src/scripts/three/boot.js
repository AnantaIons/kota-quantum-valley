// Decides whether to show the live 3D objects, and loads the 3D code only when one is about to
// come on screen. Without WebGL, or with Data Saver on, the SVG drawings stay in place.
export const can3d = () => {
  if (!('WebGLRenderingContext' in window)) return false;
  const c = navigator.connection;
  return !(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
};

let art;
const load = () => (art ||= import('./art.js'));

export function boot3d(root = document) {
  const els = [...root.querySelectorAll('[data-3d]')];
  if (!els.length || !can3d()) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      load().then((m) => m.mount(e.target)).catch(() => {});
    }
  }, { rootMargin: '500px 0px' });
  els.forEach((el) => io.observe(el));
}
