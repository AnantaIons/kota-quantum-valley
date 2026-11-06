// The Bloch sphere as a real 3D object: a glass globe with cobalt and violet rings, a polished
// gold state arrow with a light trail, and a gold-to-violet network of points around it
// (the network is decoration). Same API as the SVG version in ../bloch.js.
import {
  Scene, Group, Mesh, SphereGeometry, TorusGeometry, CylinderGeometry, ConeGeometry, ShaderMaterial, BackSide, FrontSide,
  NormalBlending, AdditiveBlending, Vector3, Quaternion, BufferGeometry, Float32BufferAttribute, LineSegments, Points, PlaneGeometry, AmbientLight, DirectionalLight,
} from 'three';
import { createView, PAL, rgb, spectrum, gold, pointsGeometry, setPoint, fitDistance, small, still } from './engine.js';

// Bloch (x, y, z) → scene (right, up, toward the viewer) = (y, z, x)
const B = (x, y, z) => new Vector3(y, z, x);

function glass(u, side, k) {
  return new ShaderMaterial({
    uniforms: { uA: { value: rgb(PAL.electric) }, uB: { value: rgb(PAL.violet) }, uG: { value: rgb(PAL.amber) }, uK: { value: k } },
    vertexShader: /* glsl */`
      varying vec3 vN, vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vN, vV; uniform vec3 uA, uB, uG; uniform float uK;
      void main() {
        vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(vV);
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float f = pow(1.0 - ndv, 3.0);
        float g = clamp(0.5 + 0.55 * dot(n, normalize(vec3(0.75, 0.6, 0.0))), 0.0, 1.0);
        vec3 rim = mix(uA, uB, smoothstep(0.15, 0.95, g));
        vec3 r = reflect(-v, n);
        float key = pow(smoothstep(0.8, 1.0, dot(r, normalize(vec3(-0.45, 0.75, 0.48)))), 2.0);
        float warm = smoothstep(0.8, 1.0, dot(r, normalize(vec3(0.85, -0.25, 0.45))));
        float spot = pow(max(dot(r, normalize(vec3(-0.35, 0.5, 0.79))), 0.0), 220.0);
        vec3 c = rim * f * 1.25 + vec3(0.86, 0.92, 1.0) * key * 0.3 + uG * warm * 0.28 + vec3(1.0) * spot * 1.2;
        c *= uK;
        float a = clamp(max(c.r, max(c.g, c.b)) * 1.1, 0.0, 1.0);
        gl_FragColor = vec4(min(c, vec3(a)), a);
      }`,
    side, transparent: true, depthWrite: false, blending: NormalBlending, premultipliedAlpha: true,
  });
}

export function createBloch3D(host, opts = {}) {
  const view = { yaw: opts.yaw ?? -0.62, pitch: opts.pitch ?? 0.32 };
  let vec = [0, 0, 1], trace = null, extraYaw = 0, extraPitch = 0, handle = null;
  const labels = {};
  let frame, arrow, shaft, cone, tipGlow, tipPts, trail, traceRing, plexus, hist = [], lastPush = 0;
  const N_TRAIL = 34;

  const built = createView(host, (ctx) => {
    const scene = new Scene();
    scene.environment = ctx.env;
    scene.add(new AmbientLight(0xffffff, 0.15));
    const key = new DirectionalLight(0xffffff, 1.6); key.position.set(-2, 3, 4); scene.add(key);
    const warm = new DirectionalLight(PAL.orange, 1.2); warm.position.set(4, -1, 2); scene.add(warm);
    const camera = ctx.camera();
    const fade = new Vector3(-5.6, 1, 0.28);

    // soft volume of light inside the globe
    const bloom = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.cobalt, alpha: 0.3, falloff: 2.0 }));
    bloom.scale.setScalar(3.1); bloom.renderOrder = -2; scene.add(bloom);
    const bloom2 = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.purple, alpha: 0.22, falloff: 2.2 }));
    bloom2.scale.setScalar(2.4); bloom2.position.set(0.35, 0.3, -0.6); bloom2.renderOrder = -2; scene.add(bloom2);

    frame = new Group(); scene.add(frame);
    const back = new Mesh(new SphereGeometry(1, 96, 64), glass(ctx.u, BackSide, 0.3)); back.renderOrder = 0; frame.add(back);
    const front = new Mesh(new SphereGeometry(1, 96, 64), glass(ctx.u, FrontSide, 1)); front.renderOrder = 5; frame.add(front);

    // rings: the equator in electric cobalt, the two meridians in violet; each has a soft glow twin
    const ring = (color, rot, a) => {
      const g = new Group();
      const core = new Mesh(new TorusGeometry(1, 0.0055, 6, 200), ctx.tube({ color, alpha: a, fade }));
      const glow = new Mesh(new TorusGeometry(1, 0.03, 8, 200), ctx.tube({ color, alpha: a * 0.35, soft: 1, fade }));
      g.add(core, glow); g.rotation.set(...rot); g.children.forEach((m) => (m.renderOrder = 2)); frame.add(g);
      return g;
    };
    ring(PAL.sky, [Math.PI / 2, 0, 0], 0.95);          // Bloch equator (z = 0)
    ring(PAL.lilac, [0, Math.PI / 2, 0], 0.6);          // the x–z great circle
    ring(PAL.violet, [0, 0, 0], 0.55);                  // the y–z great circle

    // axes in scientific cyan
    const axis = (dir) => {
      const m = new Mesh(new CylinderGeometry(0.0045, 0.0045, 2.36, 6, 1, true), ctx.tube({ color: PAL.sci, alpha: 0.6, fade }));
      m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir); m.renderOrder = 2; frame.add(m);
    };
    axis(B(1, 0, 0)); axis(B(0, 1, 0)); axis(B(0, 0, 1));

    // latitude the arrow is circling (dashed gold)
    traceRing = new Mesh(new TorusGeometry(1, 0.006, 6, 220), ctx.tube({ color: PAL.amber, alpha: 0.8, dash: 90, fade }));
    traceRing.renderOrder = 2; traceRing.visible = false; frame.add(traceRing);

    // the gold state arrow
    arrow = new Group();
    shaft = new Mesh(new CylinderGeometry(0.026, 0.026, 1, 24), gold({ roughness: 0.16, glow: 0.3 }));
    cone = new Mesh(new ConeGeometry(0.074, 0.18, 32), gold({ roughness: 0.14, glow: 0.3 }));
    shaft.position.y = 0.41; shaft.scale.y = 0.82; cone.position.y = 0.91;
    arrow.add(shaft, cone); frame.add(arrow);
    tipGlow = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.orange, alpha: 0.9, falloff: 2.4 }));
    tipGlow.scale.setScalar(0.62); tipGlow.renderOrder = 4; frame.add(tipGlow);

    // nucleus at the centre, the tip spark and its trail
    tipPts = pointsGeometry(2);
    setPoint(tipPts, 0, new Vector3(), 0.09, rgb(PAL.white), 0.9);
    frame.add(Object.assign(new Points(tipPts, ctx.glowPoints()), { renderOrder: 6 }));
    trail = pointsGeometry(N_TRAIL);
    frame.add(Object.assign(new Points(trail, ctx.glowPoints()), { renderOrder: 4 }));

    // decorative network of points around the globe: gold at the top, violet, cobalt below
    plexus = new Group(); if (opts.plexus !== false) frame.add(plexus);
    const n = small ? 64 : 96, R = 1.3, pts = [];
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      const rr = R * (1 + (rnd() - 0.5) * 0.09);
      pts.push(new Vector3(Math.cos(th) * r * rr, y * rr, Math.sin(th) * r * rr));
    }
    const colOf = (p) => spectrum(Math.min(1, Math.max(0, 0.5 + 0.42 * (p.y * 0.8 + p.x * 0.35) / R)));
    const pg = pointsGeometry(n);
    pts.forEach((p, i) => setPoint(pg, i, p, (rnd() < 0.14 ? 0.12 : 0.07), colOf(p), rnd() < 0.14 ? 1 : 0.85));
    plexus.add(Object.assign(new Points(pg, ctx.glowPoints({ fade, twinkle: 0.35 })), { renderOrder: 3 }));
    const lp = [], lc = [], lim = small ? 0.7 : 0.6;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (pts[i].distanceTo(pts[j]) < lim) {
        lp.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        const a = colOf(pts[i]), b = colOf(pts[j]); lc.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const lg = new BufferGeometry();
    lg.setAttribute('position', new Float32BufferAttribute(lp, 3));
    lg.setAttribute('color', new Float32BufferAttribute(lc, 3));
    const lm = new ShaderMaterial({
      uniforms: { uFade: { value: fade } },
      vertexShader: /* glsl */`
        attribute vec3 color; varying vec3 vC; varying float vF; uniform vec3 uFade;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vC = color; vF = mix(0.12, 1.0, smoothstep(-1.2, 1.2, mv.z - uFade.x)); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */`
        varying vec3 vC; varying float vF;
        void main() { float a = 0.5 * vF; gl_FragColor = vec4(vC * a, a); }`,
      transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true,
    });
    plexus.add(Object.assign(new LineSegments(lg, lm), { renderOrder: 3 }));

    // HTML labels follow their 3D anchors
    const mk = (k, text, cls = '') => { const s = document.createElement('span'); s.className = `b3l ${cls}`; s.textContent = text; host.appendChild(s); labels[k] = { el: s }; };
    mk('k0', '|0⟩'); mk('k1', '|1⟩'); mk('kp', '|+⟩'); mk('x', 'x', 'ax'); mk('y', 'y', 'ax'); mk('psi', '|ψ⟩', 'live');
    labels.k0.at = B(0, 0, 1.2); labels.k0.off = [16, -2];
    labels.k1.at = B(0, 0, -1.2); labels.k1.off = [16, 4];
    labels.kp.at = B(1.24, 0, 0); labels.kp.off = [-6, 14];
    labels.x.at = B(1.14, 0, 0); labels.x.off = [0, 0];
    labels.y.at = B(0, 1.15, 0); labels.y.off = [0, 0];
    labels.psi.off = [18, -14];

    const tmp = new Vector3(), up = new Vector3(0, 1, 0), q = new Quaternion();
    const update = (t, dt, v) => {
      frame.rotation.set(view.pitch + extraPitch, view.yaw + extraYaw, 0, 'XYZ');
      plexus.rotation.y = t * 0.05;
      const dir = B(...vec);
      const len = dir.length() || 1;
      q.setFromUnitVectors(up, tmp.copy(dir).divideScalar(len));
      arrow.quaternion.copy(q); arrow.scale.setScalar(len);
      tipGlow.position.copy(dir);
      setPoint(tipPts, 1, dir, 0.11, rgb(PAL.paleGold), 1);
      tipPts.attributes.position.needsUpdate = true; tipPts.attributes.size.needsUpdate = true; tipPts.attributes.tint.needsUpdate = true;
      if (trace != null) {
        const z = trace, rr = Math.sqrt(Math.max(0, 1 - z * z));
        traceRing.visible = true; traceRing.scale.set(rr, rr, rr); traceRing.position.set(0, z, 0); traceRing.rotation.set(Math.PI / 2, 0, 0);
      } else traceRing.visible = false;
      // light trail: recent tip positions, newest brightest
      const now = performance.now();
      if (now - lastPush > 28 || !hist.length) { hist.unshift(dir.clone()); lastPush = now; if (hist.length > N_TRAIL) hist.pop(); }
      const gcol = rgb(PAL.amber);
      for (let i = 0; i < N_TRAIL; i++) {
        const p = hist[Math.min(i, hist.length - 1)], k = 1 - i / N_TRAIL;
        setPoint(trail, i, p, 0.05 + 0.05 * k, gcol, still ? 0 : 0.5 * k * k);
      }
      trail.attributes.position.needsUpdate = true; trail.attributes.size.needsUpdate = true; trail.attributes.tint.needsUpdate = true;
      // labels
      scene.updateMatrixWorld();
      labels.psi.at = dir.clone().multiplyScalar(1.0);
      const cz = -camera.position.z;
      for (const k in labels) {
        const L = labels[k];
        tmp.copy(L.at).applyMatrix4(frame.matrixWorld);
        const vz = tmp.clone().applyMatrix4(camera.matrixWorldInverse).z;
        tmp.project(camera);
        const x = ((tmp.x + 1) / 2) * v.cssW + L.off[0], y = ((1 - tmp.y) / 2) * v.cssH + L.off[1];
        L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        L.el.style.opacity = k === 'psi' ? (vz < cz - 0.2 ? 0.6 : 1) : (vz < cz - 0.3 ? 0.45 : 1);
      }
    };
    const fit = (v) => { camera.position.set(0, 0, fitDistance(camera, 1.42)); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(); fade.x = -camera.position.z; };
    return { scene, camera, update, fit };
  });
  if (!built) return null;
  handle = built;

  // drag to rotate the view, tap to open the explainer
  let drag = null;
  const target = opts.dragTarget || host;
  const down = (e) => { drag = { x: e.clientX, y: e.clientY, moved: false }; target.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    view.yaw += dx * 0.01; view.pitch = Math.max(-1.3, Math.min(1.3, view.pitch + dy * 0.01));
    drag.x = e.clientX; drag.y = e.clientY; handle.invalidate();
  };
  const end = () => { const m = drag?.moved; drag = null; return m; };
  const upH = (e) => { if (!end() && opts.onClick) opts.onClick(e); };
  target.addEventListener('pointerdown', down);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', upH);
  target.addEventListener('pointercancel', end);

  return {
    setVec(v) { vec = v; handle.invalidate(); },
    setTrace(z) { trace = z; handle.invalidate(); },
    tilt(dx, dy) { extraYaw = dx; extraPitch = dy; handle.invalidate(); },
    get vec() { return vec; },
    onReady(fn) { handle.view.onReady = fn; if (handle.view.ready) fn(); },
  };
}
