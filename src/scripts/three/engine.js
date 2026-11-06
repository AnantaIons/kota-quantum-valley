// Shared real-time 3D for the site's signature objects.
// One WebGL renderer draws every visible view in turn and copies the pixels into that view's own
// canvas, so the page holds a single graphics context however many objects it shows, and each
// canvas scrolls with the page like an image. Views pause off screen; readers who prefer reduced
// motion get a still frame that only redraws when they interact.
import {
  WebGLRenderer, NeutralToneMapping, PMREMGenerator, Scene, Mesh, BoxGeometry, PlaneGeometry, MeshBasicMaterial,
  BackSide, DoubleSide, Color, ShaderMaterial, AdditiveBlending, NormalBlending, Vector2, Vector3,
  MeshPhysicalMaterial, PerspectiveCamera, BufferGeometry, Float32BufferAttribute,
} from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const small = window.matchMedia('(max-width: 700px)').matches;
export const DPR = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);

// The palette: orange-gold, purple and cobalt, with their shades.
export const PAL = {
  gold: '#E6C36A', orange: '#F2A541', amber: '#FFD27F', paleGold: '#F8E3A3', deepGold: '#B8862F',
  violet: '#8957FF', lilac: '#BFA3FF', purple: '#5A2BD6',
  cobalt: '#0047AB', electric: '#2979FF', sky: '#7AAEFF', sci: '#00D4FF', white: '#F4F7FF',
};
// Raw display-space colour (custom shaders here work in display space)
export const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
export const mix3 = (a, b, t) => a.clone().lerp(b, t);
// Gold → violet → cobalt along t in [0, 1]
export const spectrum = (t) => {
  const g = rgb(PAL.amber), v = rgb(PAL.violet), c = rgb(PAL.electric);
  return t < 0.5 ? mix3(c, v, t * 2) : mix3(v, g, (t - 0.5) * 2);
};

let renderer = null, glCanvas = null, envTex = null, dead = false;
const views = new Set();

function getRenderer() {
  if (renderer) return renderer;
  glCanvas = document.createElement('canvas');
  renderer = new WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'default' });
  renderer.setPixelRatio(1);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  glCanvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); dead = true;
    for (const v of views) v.host.classList.remove('is-3d');
  });
  return renderer;
}

// A small photo studio, reflected in every glossy surface: a broad soft key light above,
// a violet wall on the left, a warm orange-gold wall on the right, cobalt in front, purple below.
function studio() {
  const s = new Scene();
  s.add(new Mesh(new BoxGeometry(12, 12, 12), new MeshBasicMaterial({ color: new Color('#0d1433'), side: BackSide })));
  const panel = (w, h, hex, k, pos) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(hex).multiplyScalar(k), side: DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(8, 5, '#ffffff', 2.4, [0, 5.6, 0.5]);           // key light above
  panel(3.2, 9, PAL.violet, 2.6, [-5.6, 0.3, 0.8]);     // violet wall
  panel(3.2, 9, '#FFB24D', 2.8, [5.6, 0.2, 0.4]);       // warm orange-gold wall
  panel(8, 3, PAL.electric, 1.7, [0.4, -0.8, 5.6]);     // cobalt in front
  panel(3.5, 1.6, '#ffffff', 2.4, [-1.8, 2.6, 5.2]);    // small front key for crisp highlights
  panel(9, 4, PAL.purple, 1.4, [0, -5.6, 0]);           // purple floor
  panel(6, 4, '#FFD27F', 1.1, [0, 1, -5.6]);            // warm back wall
  return s;
}
function getEnv() {
  if (!envTex) {
    const pm = new PMREMGenerator(getRenderer());
    envTex = pm.fromScene(studio(), 0.03).texture;
    pm.dispose();
  }
  return envTex;
}

// ---------- materials ----------
// Physical metals and glossy coatings that reflect the studio
export function gold({ color = '#F5C46A', roughness = 0.2, clearcoat = 0.45, env = 1.35, glow = 0.18 } = {}) {
  return new MeshPhysicalMaterial({
    color: new Color(color), metalness: 1, roughness, clearcoat, clearcoatRoughness: 0.08, envMapIntensity: env,
    emissive: new Color('#7a4a0c'), emissiveIntensity: glow,
  });
}

// Glowing points: a white-hot core in a coloured halo. Sizes are in world units.
function glowPointsMaterial(u, { twinkle = 0, fade = null } = {}) {
  return new ShaderMaterial({
    uniforms: { uScale: u.scale, uTime: u.time, uTwinkle: { value: twinkle }, uFade: { value: fade || new Vector3(0, 0, 1) }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float size; attribute vec4 tint;
      uniform float uScale, uTime, uTwinkle; uniform vec3 uFade;
      varying vec4 vTint;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.5, size * uScale / -mv.z);
        float f = uFade.y > 0.0 ? mix(uFade.z, 1.0, smoothstep(-uFade.y, uFade.y, mv.z - uFade.x)) : 1.0;
        float tw = 1.0 - uTwinkle * (0.5 + 0.5 * sin(uTime * 2.3 + dot(position, vec3(41.3, 17.9, 29.7))));
        vTint = vec4(tint.rgb, tint.a * f * tw);
      }`,
    fragmentShader: /* glsl */`
      varying vec4 vTint; uniform float uOpacity;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0; float r2 = dot(p, p);
        if (r2 > 1.0) discard;
        float core = exp(-r2 * 16.0), halo = exp(-r2 * 3.2) * 0.5 * (1.0 - r2);
        float a = (core + halo) * vTint.a * uOpacity;
        vec3 c = mix(vTint.rgb, vec3(1.0), core * 0.5);
        gl_FragColor = vec4(c * a, a);
      }`,
    transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true,
  });
}

// A big soft billboard glow (for light that should feel like it fills the air)
function glowSpriteMaterial({ color, alpha = 1, falloff = 2.2, depthTest = true }) {
  return new ShaderMaterial({
    uniforms: { uColor: { value: rgb(color) }, uAlpha: { value: alpha }, uFall: { value: falloff } },
    vertexShader: /* glsl */`
      varying vec2 vP;
      void main() {
        vP = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float s = length(modelMatrix[0].xyz);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec2 vP; uniform vec3 uColor; uniform float uAlpha, uFall;
      void main() {
        float r = length(vP);
        float a = pow(max(1.0 - r, 0.0), uFall) * uAlpha;
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true, depthWrite: false, depthTest, blending: AdditiveBlending, premultipliedAlpha: true,
  });
}

// Geometry for glow points: positions, sizes (world units) and tints (rgb + alpha)
export function pointsGeometry(n) {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('size', new Float32BufferAttribute(new Float32Array(n), 1));
  g.setAttribute('tint', new Float32BufferAttribute(new Float32Array(n * 4), 4));
  return g;
}
export function setPoint(g, i, p, size, col, a) {
  const P = g.attributes.position.array, S = g.attributes.size.array, T = g.attributes.tint.array;
  P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z; S[i] = size;
  T[i * 4] = col.x; T[i * 4 + 1] = col.y; T[i * 4 + 2] = col.z; T[i * 4 + 3] = a;
}

// Thin glowing tubes (rings, axes): brighter on the near side, soft edged when "soft".
function tubeMaterial({ color, alpha = 1, soft = 0, dash = 0, fade = new Vector3(-5.6, 1, 0.35) }) {
  return new ShaderMaterial({
    uniforms: { uColor: { value: rgb(color) }, uAlpha: { value: alpha }, uSoft: { value: soft }, uDash: { value: dash }, uFade: { value: fade } },
    vertexShader: /* glsl */`
      varying float vF, vRim; varying vec2 vUv;
      uniform vec3 uFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vRim = abs(dot(n, normalize(-mv.xyz)));
        vF = mix(uFade.z, 1.0, smoothstep(-uFade.y, uFade.y, mv.z - uFade.x));
        vUv = uv;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vF, vRim; varying vec2 vUv;
      uniform vec3 uColor; uniform float uAlpha, uSoft, uDash;
      void main() {
        float a = uAlpha * vF * mix(1.0, pow(vRim, 2.0), uSoft);
        if (uDash > 0.0) a *= step(0.42, fract(vUv.x * uDash));
        vec3 c = mix(uColor, vec3(1.0), (1.0 - uSoft) * 0.25);
        gl_FragColor = vec4(c * a, a);
      }`,
    transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true,
  });
}

// Neon lines in screen pixels
function lineMaterial(u, { width = 1.5, color = '#ffffff', opacity = 1, vertexColors = false, additive = true }) {
  const m = new LineMaterial({ linewidth: width * DPR, color: new Color(color), transparent: true, opacity, vertexColors, depthWrite: false, blending: additive ? AdditiveBlending : NormalBlending });
  m.uniforms.resolution = u.res;
  return m;
}

// ---------- views ----------
// build(ctx) returns { scene, camera, update(t, dt, view) }. Returns null if 3D is unavailable.
export function createView(host, build, { fov = 30 } = {}) {
  if (dead) return null;
  let r;
  try { r = getRenderer(); } catch { return null; }
  const u = { scale: { value: 300 }, time: { value: 0 }, res: { value: new Vector2(1, 1) } };
  const ctx = {
    env: getEnv(), u,
    glowPoints: (opts) => glowPointsMaterial(u, opts),
    glowSprite: glowSpriteMaterial,
    tube: tubeMaterial,
    line: (opts) => lineMaterial(u, opts),
    camera: () => new PerspectiveCamera(fov, 1, 0.1, 100),
  };
  const built = build(ctx);
  const canvas = document.createElement('canvas');
  canvas.className = 'v3d';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const v = {
    host, canvas, c2d: canvas.getContext('2d'), u, ...built,
    w: 0, h: 0, cssW: 0, cssH: 0, visible: false, dirty: true, t: built.t0 ?? 0, ready: false,
  };
  const measure = () => {
    const rect = canvas.getBoundingClientRect();
    v.cssW = rect.width; v.cssH = rect.height;
    v.k = rect.width / (host.getBoundingClientRect().width || rect.width);
    const w = Math.max(1, Math.round(rect.width * DPR)), h = Math.max(1, Math.round(rect.height * DPR));
    if (w === v.w && h === v.h) return;
    v.w = w; v.h = h; canvas.width = w; canvas.height = h;
    v.camera.aspect = w / h; v.camera.updateProjectionMatrix();
    v.fit?.(v);
    u.scale.value = h / (2 * Math.tan((v.camera.fov * Math.PI) / 360));
    u.res.value.set(w, h);
    v.dirty = true; kick();
  };
  new ResizeObserver(measure).observe(canvas);
  new IntersectionObserver(([e]) => { v.visible = e.isIntersecting; if (v.visible) { v.dirty = true; kick(); } }, { rootMargin: '80px 0px' }).observe(host);
  measure();
  views.add(v);
  return {
    invalidate() { v.dirty = true; kick(); },
    get view() { return v; },
  };
}

let raf = 0, last = 0;
const MIN_DT = small ? 1 / 32 : 0;
function kick() { if (!raf && !dead) raf = requestAnimationFrame(frame); }
function frame(now) {
  raf = 0;
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
  if (MIN_DT && dt < MIN_DT && last) { raf = requestAnimationFrame(frame); return; }
  last = now;
  let live = false;
  for (const v of views) {
    if (!v.visible || !v.w) continue;
    const anim = !still && v.animate !== false;
    if (anim) { v.t += dt; live = true; }
    if (anim || v.dirty) { v.u.time.value = v.t; v.update?.(v.t, anim ? dt : 0, v); draw(v); v.dirty = false; }
  }
  if (live) kick(); else last = 0;
}

let glW = 0, glH = 0;
function draw(v) {
  const r = renderer;
  if (v.w > glW || v.h > glH) { glW = Math.max(glW, v.w); glH = Math.max(glH, v.h); r.setSize(glW, glH, false); }
  r.setViewport(0, 0, v.w, v.h); r.setScissor(0, 0, v.w, v.h); r.setScissorTest(true);
  r.clear(true, true, true);
  r.render(v.scene, v.camera);
  v.c2d.clearRect(0, 0, v.w, v.h);
  v.c2d.drawImage(glCanvas, 0, glH - v.h, v.w, v.h, 0, 0, v.w, v.h);
  if (!v.ready) { v.ready = true; v.host.classList.add('is-3d'); v.onReady?.(); }
}

// Distance at which a sphere of radius rad fills the shorter side of the view
export function fitDistance(camera, rad) {
  const vf = (camera.fov * Math.PI) / 360;
  const hf = Math.atan(Math.tan(vf) * camera.aspect);
  return rad / Math.sin(Math.min(vf, hf));
}

export { Vector3 };
