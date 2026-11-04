// One illustrated cover per lesson. Pure SVG, so it's crisp at any size and weighs almost nothing.
import { G, V, M, mono, head } from './art/kit.js';
import { art as a0 } from './art/existing.js';
import { art as aA } from './art/part-a.js';
import { art as aB } from './art/part-b.js';
import { art as aC } from './art/part-c.js';
import { art as aE } from './art/part-e.js';
import { art as aG } from './art/part-g.js';

const art = { ...a0, ...aA, ...aB, ...aC, ...aE, ...aG };

export function coverSvg(slug, n = 0, { label = '' } = {}) {
  const num = n === 0 ? 'START' : String(n).padStart(2, '0');
  const id = String(slug).replace(/[^a-z0-9]/g, '').slice(0, 24) + n;
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <radialGradient id='cg${id}a' cx='85%' cy='10%' r='70%'><stop offset='0' stop-color='${G}' stop-opacity='.22'/><stop offset='1' stop-color='${G}' stop-opacity='0'/></radialGradient>
    <radialGradient id='cg${id}b' cx='0%' cy='100%' r='80%'><stop offset='0' stop-color='${V}' stop-opacity='.5'/><stop offset='1' stop-color='${V}' stop-opacity='0'/></radialGradient>
    <pattern id='cgrid${id}' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M20 0H0V20' fill='none' stroke='#8CA0FF' stroke-opacity='.07'/></pattern>
  </defs>
  <rect width='400' height='250' fill='#0A0F2A'/><rect width='400' height='250' fill='url(#cgrid${id})'/>
  <rect width='400' height='250' fill='url(#cg${id}b)'/><rect width='400' height='250' fill='url(#cg${id}a)'/>
  <g>${art[slug] ?? ''}</g>
  <text x='384' y='238' text-anchor='end' ${head} font-size='${n === 0 ? 16 : 22}' font-weight='700' fill='${G}' fill-opacity='.9'>${num}</text>
  ${label ? `<text x='16' y='238' ${mono} font-size='12' fill='${M}'>${label}</text>` : ''}
</svg>`;
}
