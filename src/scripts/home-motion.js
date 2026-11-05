// Home page motion. Every effect here shows something (a count, a measurement, progress)
// rather than decorating, and everything is skipped when the reader prefers reduced motion.
import { animate } from 'motion/mini';
import { inView } from 'motion';

window.__kqvMotion = true;
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = [0.22, 1, 0.36, 1];
const stagger = (step, { startDelay = 0 } = {}) => (i) => startDelay + i * step;
const up = (px) => [`translateY(${px}px)`, 'translateY(0)'];
const done = () => document.documentElement.classList.add('motion-done');

// ---------- hero: one orchestrated entrance ----------
function hero() {
  const h = document.querySelector('.hero-nexus');
  if (!h) return;
  const each = (els, keyframes, opts, delayFn) => [...els].forEach((el, i) => animate(el, keyframes, { ...opts, delay: delayFn(i) }));
  animate(h.querySelector('.pill'), { opacity: [0, 1], transform: up(8) }, { duration: 0.5, ease });
  each(h.querySelectorAll('h1 .w > span'), { transform: ['translateY(105%)', 'translateY(0)'] }, { duration: 0.8, ease }, stagger(0.07, { startDelay: 0.1 }));
  animate(h.querySelector('.h1b'), { opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.9, delay: 0.45, ease });
  each(h.querySelectorAll('.lead, .btn-row, .hero-place, .stats'), { opacity: [0, 1], transform: up(14) }, { duration: 0.7, ease }, stagger(0.08, { startDelay: 0.6 }));
  animate(h.querySelector('.qviz'), { opacity: [0, 1], transform: ['scale(0.94)', 'scale(1)'] }, { duration: 1.1, delay: 0.25, ease });
  h.querySelectorAll('[data-count]').forEach((el, i) => countUp(el, +el.dataset.count, 1400, 750 + i * 80));
  setTimeout(done, 1600);
}

// Count a number up from zero with an ease-out curve
function countUp(el, to, dur, delay) {
  const t0 = performance.now() + delay;
  const step = (now) => {
    const p = Math.max(0, Math.min(1, (now - t0) / dur));
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- lab teaser: a real 1,000-shot measurement fills the histogram ----------
function labShots() {
  const scr = document.querySelector('[data-shots]');
  if (!scr) return;
  const bars = scr.querySelectorAll('[data-bar]'), nums = scr.querySelectorAll('[data-bar] span'), total = scr.querySelector('[data-total]');
  const run = () => {
    const counts = [0, 0];
    let n = 0, last = performance.now();
    const step = (now) => {
      const add = Math.min(1000 - n, Math.max(1, Math.round((now - last) / 1.6)));
      last = now;
      for (let k = 0; k < add; k++) counts[Math.random() < 0.5 ? 0 : 1]++;
      n += add;
      counts.forEach((c, i) => { bars[i].style.height = `${Math.max(2, (c / 1000) * 160)}%`; nums[i].textContent = c; });
      total.textContent = `× ${n}`;
      if (n < 1000) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  inView(scr, () => { run(); }, { amount: 0.6 });
}

// ---------- course progress bars grow into place ----------
function courseBars() {
  const list = document.querySelector('.cm-parts');
  if (!list) return;
  const bars = [...list.querySelectorAll('.cm-bar i')];
  bars.forEach((b) => { b.dataset.w = b.style.width; b.style.width = '0%'; });
  inView(list, () => {
    bars.forEach((b, i) => animate(b, { width: ['0%', b.dataset.w] }, { duration: 0.9, delay: 0.06 * i, ease }).finished.then(() => { b.style.width = b.dataset.w; }));
  }, { amount: 0.3 });
}

// ---------- technology icons draw themselves once, then play on hover ----------
function techIcons() {
  document.querySelectorAll('.tech-card').forEach((card) => {
    inView(card, () => {
      card.classList.add('drawn');
      card.classList.add('play');
      setTimeout(() => card.classList.remove('play'), 1800);
    }, { amount: 0.5 });
  });
}

// ---------- a soft spotlight that follows the pointer on cards ----------
function spotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.path, .tech-card, .course-soon').forEach((card) => {
    card.classList.add('spot');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

if (still) {
  done();
  document.querySelectorAll('.tech-card').forEach((c) => c.classList.add('drawn'));
} else {
  hero();
  labShots();
  courseBars();
  techIcons();
  spotlight();
}
