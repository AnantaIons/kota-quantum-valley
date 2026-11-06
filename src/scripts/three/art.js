// The site's signature 3D objects. Each one mounts into an element with data-3d="…" and keeps
// its SVG drawing as the fallback underneath.
import {
  Scene, Group, Mesh, PlaneGeometry, Vector3, Color, Curve, TubeGeometry, MeshPhysicalMaterial, DoubleSide, Points,
  TetrahedronGeometry, OctahedronGeometry, IcosahedronGeometry, DodecahedronGeometry, BoxGeometry, EdgesGeometry,
  Float32BufferAttribute, DirectionalLight, AmbientLight, CylinderGeometry, ConeGeometry, Quaternion, TorusGeometry,
  CatmullRomCurve3, SphereGeometry, ShaderMaterial, NormalBlending, FrontSide, Matrix4,
} from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { createView, PAL, rgb, mix3, spectrum, gold, pointsGeometry, setPoint, fitDistance, small, still } from './engine.js';

const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
const lights = (scene, k = 1) => {
  scene.add(new AmbientLight(0xffffff, 0.12 * k));
  const a = new DirectionalLight(0xffffff, 1.7 * k); a.position.set(-2, 3, 4); scene.add(a);
  const b = new DirectionalLight(PAL.violet, 1.3 * k); b.position.set(-4, -1, 1); scene.add(b);
  const c = new DirectionalLight(PAL.orange, 1.1 * k); c.position.set(4, 0.5, 2); scene.add(c);
};
const backGlow = (ctx, color, size, alpha, z = -1.4, falloff = 1.8) => {
  const m = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color, alpha, falloff }));
  m.scale.setScalar(size); m.position.z = z; m.renderOrder = -2; return m;
};
// rad is the object's radius inside its box; v.k scales for the canvas bleeding past the box
const fitCam = (camera, rad) => (v) => { camera.position.set(0, 0, fitDistance(camera, rad * (v?.k || 1))); camera.lookAt(0, 0, 0); };

// Neon edges: a bright core line with a wide soft halo, both coloured per vertex.
// Colours come in display space; line materials expect linear, hence lin().
const lin = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
function neon(ctx, segs, cols, { core = 1.6, halo = 8, haloA = 0.22, white = 0.35 } = {}) {
  const g = new Group();
  const coreOf = (c) => c.map((x) => lin(x + (1 - x) * white));
  const gc = new LineSegmentsGeometry(); gc.setPositions(segs); gc.setColors(coreOf(cols));
  const gh = new LineSegmentsGeometry(); gh.setPositions(segs); gh.setColors(cols.map(lin));
  const mc = ctx.line({ width: core, vertexColors: true }), mh = ctx.line({ width: halo, vertexColors: true, opacity: haloA });
  mc.toneMapped = mh.toneMapped = false;
  const lc = new LineSegments2(gc, mc), lh = new LineSegments2(gh, mh);
  lc.frustumCulled = lh.frustumCulled = false; lh.renderOrder = 1; lc.renderOrder = 2;
  g.add(lh, lc);
  g.userData.set = (p, c) => {
    for (const geo of [gc, gh]) { const d = geo.attributes.instanceStart.data; d.array.set(p); d.needsUpdate = true; }
    if (c) {
      const h = gh.attributes.instanceColorStart.data, cc = gc.attributes.instanceColorStart.data;
      for (let i = 0; i < c.length; i++) { h.array[i] = lin(c[i]); cc.array[i] = lin(c[i] + (1 - c[i]) * white); }
      h.needsUpdate = cc.needsUpdate = true;
    }
  };
  return g;
}
const edgesOf = (geo) => Array.from(new EdgesGeometry(geo, 1).attributes.position.array);
const uniqVerts = (arr) => {
  const out = [];
  for (let i = 0; i < arr.length; i += 3) {
    const v = new Vector3(arr[i], arr[i + 1], arr[i + 2]);
    if (!out.some((o) => o.distanceTo(v) < 1e-4)) out.push(v);
  }
  return out;
};

// ---------- gem: a faceted crystal for each learning path ----------
const TONES = {
  violet: { body: '#7A4DFF', edge: '#DCCBFF', glow: PAL.violet, metal: 0.35 },
  gold: { body: '#F2AE40', edge: '#FFEDB8', glow: PAL.orange, metal: 0.5 },
  cobalt: { body: '#1E63EA', edge: '#B4CEFF', glow: PAL.electric, metal: 0.35 },
};
function gem(el) {
  const tone = TONES[el.dataset.tone] || TONES.gold;
  const shape = el.dataset.shape || 'octa';
  return createView(el, (ctx) => {
    const scene = new Scene(); scene.environment = ctx.env; lights(scene);
    const camera = ctx.camera();
    const geo = { tetra: () => new TetrahedronGeometry(0.95), octa: () => new OctahedronGeometry(0.95), icosa: () => new IcosahedronGeometry(0.95), dodeca: () => new DodecahedronGeometry(0.95) }[shape]();
    const body = new Mesh(geo, new MeshPhysicalMaterial({
      color: new Color(tone.body), metalness: tone.metal, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05,
      flatShading: true, iridescence: 0.55, iridescenceIOR: 1.5, iridescenceThicknessRange: [180, 520], envMapIntensity: 1.35,
    }));
    const obj = new Group(); obj.add(body);
    const e = edgesOf(geo), cols = [];
    const ec = rgb(tone.edge);
    for (let i = 0; i < e.length / 3; i++) cols.push(ec.x, ec.y, ec.z);
    obj.add(neon(ctx, e, cols, { core: 1.1, halo: 5, haloA: 0.25, white: 0.2 }));
    scene.add(backGlow(ctx, tone.glow, 3.4, 0.5), obj);
    const rot = 0.35 + Math.random() * 0.2, ph = Math.random() * 6;
    const update = (t) => { obj.rotation.set(0.45 + 0.18 * Math.sin(t * 0.6 + ph), t * rot + ph, 0.12); };
    return { scene, camera, update, fit: fitCam(camera, 1.12), t0: 1.3 };
  });
}

// ---------- the hydrogen 3d orbital, sampled from |ψ|² ----------
// ψ(3,2,0) ∝ r² e^(−r/3) (3cos²θ − 1), in Bohr radii. The radial part r²·R² ∝ r⁶e^(−2r/3) is a
// gamma distribution (shape 7, scale 1.5); the angular part is drawn by rejection.
function orbital(el) {
  return createView(el, (ctx) => {
    const scene = new Scene(); const camera = ctx.camera();
    const N = small ? 3200 : 5600, rnd = rng(20260601);
    const g = pointsGeometry(N + 2), S = 1 / 16;
    const lobe = [rgb(PAL.orange), rgb(PAL.paleGold)], ring = [rgb(PAL.electric), rgb(PAL.violet)];
    let k = 0;
    while (k < N) {
      let r = 0; for (let i = 0; i < 7; i++) r -= Math.log(1 - rnd()); r *= 1.5;
      if (r > 24) continue;
      const c = rnd() * 2 - 1;
      const ang = (3 * c * c - 1) ** 2 / 4;
      if (rnd() > ang) continue;
      const s = Math.sqrt(1 - c * c), ph = rnd() * Math.PI * 2;
      const p = new Vector3(r * s * Math.cos(ph), r * c, r * s * Math.sin(ph)).multiplyScalar(S);
      const pos = 3 * c * c - 1 > 0;
      const pal = pos ? lobe : ring;
      const col = mix3(pal[0], pal[1], rnd() * (pos ? 0.6 : 0.8));
      setPoint(g, k++, p, 0.03 + rnd() * 0.024, col, pos ? 0.55 : 0.7);
    }
    setPoint(g, k++, new Vector3(), 0.16, rgb(PAL.white), 1);
    setPoint(g, k++, new Vector3(), 0.32, rgb(PAL.amber), 0.5);
    const fade = new Vector3(-5, 1, 0.45);
    const cloud = new Points(g, ctx.glowPoints({ twinkle: 0.25, fade }));
    const obj = new Group(); obj.add(cloud); obj.rotation.z = 0.42;
    const spin = new Group(); spin.add(obj); spin.rotation.x = 0.2;
    scene.add(backGlow(ctx, PAL.cobalt, 3.2, 0.45), spin);
    const update = (t) => { spin.rotation.y = t * 0.22; };
    const fit = (v) => { fitCam(camera, 1.05)(v); fade.x = -camera.position.z; };
    return { scene, camera, update, fit, t0: 0.8 };
  });
}

// ---------- the tesseract: a 4D cube turning in the x–w and y–z planes ----------
function tesseract(el) {
  return createView(el, (ctx) => {
    const scene = new Scene(); const camera = ctx.camera();
    const V = []; for (let m = 0; m < 16; m++) V.push([0, 1, 2, 3].map((b) => ((m >> b) & 1 ? 1 : -1)));
    const E = []; for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) if (V[i].filter((x, k) => x !== V[j][k]).length === 1) E.push([i, j]);
    const segs = new Float32Array(E.length * 6), cols = new Float32Array(E.length * 6);
    const lines = neon(ctx, Array.from(segs), Array.from(cols), { core: 1.6, halo: 8, haloA: 0.16, white: 0.12 });
    const pg = pointsGeometry(16);
    const obj = new Group(); obj.add(lines, new Points(pg, ctx.glowPoints()));
    obj.rotation.set(0.42, 0.5, 0);
    scene.add(backGlow(ctx, PAL.purple, 3.4, 0.4), obj);
    const P3 = V.map(() => new Vector3()), C3 = V.map(() => new Vector3());
    const update = (t) => {
      const a = t * 0.45, b = t * 0.21;
      V.forEach((v, i) => {
        let [x, y, z, w] = v;
        [x, w] = [x * Math.cos(a) - w * Math.sin(a), x * Math.sin(a) + w * Math.cos(a)];
        [y, z] = [y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)];
        const k = 1.25 / (3 - w);
        P3[i].set(x * k, y * k, z * k);
        C3[i] = spectrum(Math.min(1, Math.max(0, (w / Math.SQRT2 + 1) / 2)));
        setPoint(pg, i, P3[i], 0.065, C3[i], 0.75);
      });
      E.forEach(([i, j], n) => {
        segs.set([P3[i].x, P3[i].y, P3[i].z, P3[j].x, P3[j].y, P3[j].z], n * 6);
        cols.set([C3[i].x, C3[i].y, C3[i].z, C3[j].x, C3[j].y, C3[j].z], n * 6);
      });
      lines.userData.set(segs, cols);
      pg.attributes.position.needsUpdate = pg.attributes.tint.needsUpdate = pg.attributes.size.needsUpdate = true;
      obj.rotation.y = 0.5 + t * 0.12;
    };
    return { scene, camera, update, fit: fitCam(camera, 1.1), t0: 2.2 };
  });
}

// ---------- nested polyhedra: a cube inside a dodecahedron (they share 8 vertices), an icosahedron within ----------
function nested(el) {
  return createView(el, (ctx) => {
    const scene = new Scene(); const camera = ctx.camera();
    const shell = (geo, hex, opts) => {
      const e = edgesOf(geo), c = rgb(hex), cols = [];
      for (let i = 0; i < e.length / 3; i++) cols.push(c.x, c.y, c.z);
      const g = new Group(); g.add(neon(ctx, e, cols, opts));
      const vs = uniqVerts(e), pg = pointsGeometry(vs.length);
      vs.forEach((v, i) => setPoint(pg, i, v, 0.055, c, 0.7));
      g.add(new Points(pg, ctx.glowPoints()));
      return g;
    };
    const R = 1;
    const outer = new Group();
    outer.add(shell(new DodecahedronGeometry(R), PAL.amber, { core: 1.6, halo: 8, haloA: 0.18, white: 0.1 }));
    outer.add(shell(new BoxGeometry((2 * R) / Math.sqrt(3), (2 * R) / Math.sqrt(3), (2 * R) / Math.sqrt(3)), PAL.violet, { core: 1.3, halo: 6, haloA: 0.16, white: 0.15 }));
    const inner = shell(new IcosahedronGeometry(0.5), PAL.electric, { core: 1.3, halo: 5, haloA: 0.14, white: 0.15 });
    const obj = new Group(); obj.add(outer, inner);
    scene.add(backGlow(ctx, PAL.violet, 3.3, 0.35), obj);
    const update = (t) => { outer.rotation.set(0.35, t * 0.25, 0.1); inner.rotation.set(-t * 0.4, -t * 0.3, 0); };
    return { scene, camera, update, fit: fitCam(camera, 1.08), t0: 1.0 };
  });
}

// ---------- golden infinity: a polished gold lemniscate with light running along it ----------
class Lemniscate extends Curve {
  getPoint(t, out = new Vector3()) {
    const a = t * Math.PI * 2, d = 1 + Math.sin(a) ** 2;
    return out.set(Math.cos(a) / d, (Math.sin(a) * Math.cos(a)) / d * 1.05, 0.2 * Math.sin(a));
  }
}
function infinity(el) {
  return createView(el, (ctx) => {
    const scene = new Scene(); scene.environment = ctx.env; lights(scene, 0.8);
    const camera = ctx.camera();
    const curve = new Lemniscate();
    const mat = gold({ color: '#E8B455', roughness: 0.16, clearcoat: 0.6, env: 1.4 });
    const glint = { value: 0 };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uGlint = glint;
      sh.vertexShader = 'varying float vAlong;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvAlong = uv.x;');
      sh.fragmentShader = 'varying float vAlong;\nuniform float uGlint;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float gx = fract(vAlong - uGlint + 0.5) - 0.5, gy = fract(vAlong - uGlint) - 0.5;
        totalEmissiveRadiance += vec3(1.0, 0.86, 0.62) * (exp(-gx * gx * 1400.0) * 2.4 + exp(-gy * gy * 900.0) * 0.6);`);
    };
    const tube = new Mesh(new TubeGeometry(curve, small ? 260 : 400, 0.072, small ? 14 : 22, true), mat);
    const spark = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.amber, alpha: 0.75, falloff: 2.6 }));
    spark.scale.setScalar(0.5); spark.renderOrder = 3;
    const obj = new Group(); obj.add(tube, spark);
    scene.add(backGlow(ctx, PAL.orange, 2.6, 0.18, -0.8), backGlow(ctx, PAL.violet, 1.8, 0.16, -0.9), obj);
    const update = (t) => {
      const u = (t * 0.085) % 1; glint.value = u;
      curve.getPointAt((u + 1) % 1, spark.position); spark.position.z += 0.08;
      obj.rotation.set(0.32 + 0.1 * Math.sin(t * 0.33), 0.38 * Math.sin(t * 0.27), 0);
    };
    const fit = fitCam(camera, 0.5);
    return { scene, camera, update, fit, t0: 4.2 };
  });
}

// ---------- Möbius strip: glossy cobalt → violet → gold, gold-edged, with the 720° arrow ----------
function mobius(el) {
  const W = 0.4;
  const P = (u, s, out = new Vector3()) => { const r = 1 + s * Math.cos(u / 2); return out.set(r * Math.cos(u), r * Math.sin(u), s * Math.sin(u / 2)); };
  const normal = (u) => {
    const e = 1e-4, a = P(u, 0), tu = P(u + e, 0).sub(a), ts = P(u, e).sub(a);
    return tu.cross(ts).normalize();
  };
  return createView(el, (ctx) => {
    const scene = new Scene(); scene.environment = ctx.env; lights(scene, 0.9);
    const camera = ctx.camera();
    const geo = new ParametricGeometry((u, v, out) => P(u * Math.PI * 2, (v * 2 - 1) * W, out), small ? 160 : 260, small ? 10 : 16);
    const uv = geo.attributes.uv.array, cols = [];
    const stops = [rgb('#1D5CE6'), rgb('#7A4DFF'), rgb('#EE9F30'), rgb('#1D5CE6')];
    for (let i = 0; i < uv.length; i += 2) {
      const x = uv[i] * 3, k = Math.min(2, Math.floor(x)), c = mix3(stops[k], stops[k + 1], x - k);
      // stored in display space; three expects linear vertex colours
      const lin = new Color().setRGB(c.x, c.y, c.z, 'srgb');
      cols.push(lin.r, lin.g, lin.b);
    }
    geo.setAttribute('color', new Float32BufferAttribute(cols, 3));
    const strip = new Mesh(geo, new MeshPhysicalMaterial({
      vertexColors: true, metalness: 0.45, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04,
      side: DoubleSide, envMapIntensity: 1.2, iridescence: 0.2, iridescenceThicknessRange: [200, 500],
    }));
    class Edge extends Curve { getPoint(t, out = new Vector3()) { return P(t * Math.PI * 4, W, out); } }
    const edge = new Mesh(new TubeGeometry(new Edge(), small ? 320 : 520, 0.018, 10, true), gold({ roughness: 0.2 }));
    // the arrow
    const arrow = new Group();
    const shaft = new Mesh(new CylinderGeometry(0.03, 0.03, 0.36, 20), gold({ color: '#FBE6B4', roughness: 0.14, glow: 0.7 }));
    const head = new Mesh(new ConeGeometry(0.08, 0.16, 28), gold({ color: '#FBE6B4', roughness: 0.12, glow: 0.7 }));
    shaft.position.y = 0.18; head.position.y = 0.44; arrow.add(shaft, head);
    const tip = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.amber, alpha: 0.9, falloff: 2.4 }));
    tip.scale.setScalar(0.6); tip.renderOrder = 4;
    const base = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: '#ffffff', alpha: 0.45, falloff: 3 }));
    base.scale.setScalar(0.24); base.renderOrder = 4;

    const spinG = new Group(); spinG.add(strip, edge, arrow, tip, base);
    const tiltG = new Group(); tiltG.add(spinG); tiltG.rotation.x = -1.02;
    scene.add(backGlow(ctx, PAL.cobalt, 4.4, 0.5, -1.2, 1.5), backGlow(ctx, PAL.purple, 3, 0.25, -1.3), tiltG);
    const q = new Quaternion(), up = new Vector3(0, 1, 0), tmp = new Vector3();
    const tipGold = rgb(PAL.amber), tipViolet = rgb('#B58CFF');
    const update = (t) => {
      const phase = el.closest('[data-mobius]')?.mbPhase ?? 0.5;
      spinG.rotation.z = 0.3 + t * 0.18;
      const um = phase * Math.PI * 4, n = normal(um);
      P(um, 0, arrow.position); q.setFromUnitVectors(up, n); arrow.quaternion.copy(q);
      base.position.copy(arrow.position);
      tip.position.copy(arrow.position).add(tmp.copy(n).multiplyScalar(0.5));
      const flipped = phase >= 0.5;
      tip.material.uniforms.uColor.value.copy(flipped ? tipViolet : tipGold);
    };
    return { scene, camera, update, fit: fitCam(camera, 1.42), t0: 0 };
  });
}


// ---------- the dilution refrigerator: gold plates stepping down to ~10 mK ----------
// The active stage comes from the Fridge component (root.frActive); plates at and above it turn cold.
function fridge(el) {
  const root = el.closest('[data-fridge]');
  const names = JSON.parse(el.dataset.labels || '[]');
  return createView(el, (ctx) => {
    const scene = new Scene(); scene.environment = ctx.env; lights(scene, 0.9);
    const camera = ctx.camera();
    const PL = [[1, 1.31, 0.08], [0.884, 0.77, 0.064], [0.779, 0.22, 0.064], [0.686, -0.3, 0.058], [0.605, -0.78, 0.058], [0.535, -1.23, 0.07]];
    const rig = new Group(); scene.add(rig);
    const rnd = rng(42);
    const plates = PL.map(([r, y, t], i) => {
      const m = gold({ color: '#F0BE62', roughness: 0.3, clearcoat: 0.3, env: 1.3, glow: 0.12 });
      const g = new Group(); g.position.y = y;
      const disc = new Mesh(new CylinderGeometry(r, r, t, 120), m);
      const lip = new Mesh(new TorusGeometry(r, t * 0.32, 10, 120), gold({ roughness: 0.14, glow: 0.15 }));
      lip.rotation.x = Math.PI / 2; lip.position.y = t / 2;
      g.add(disc, lip);
      // a few components bolted to each plate
      for (let k = 0; k < 4; k++) {
        const a = rnd() * Math.PI * 2, rr = r * (0.25 + rnd() * 0.45), h = 0.05 + rnd() * 0.08;
        const c = new Mesh(new CylinderGeometry(0.035 + rnd() * 0.04, 0.05, h, 24), gold({ color: '#D9A84E', roughness: 0.35, glow: 0.05 }));
        c.position.set(Math.cos(a) * rr, t / 2 + h / 2, Math.sin(a) * rr); g.add(c);
      }
      const frost = new Mesh(new TorusGeometry(r * 1.006, 0.02, 8, 140), ctx.tube({ color: '#A9C6FF', alpha: 0, fade: new Vector3(0, 100, 1) }));
      frost.rotation.x = Math.PI / 2; frost.position.y = t / 2 + 0.004; g.add(frost);
      const halo = new Mesh(new PlaneGeometry(1, 1), ctx.glowSprite({ color: PAL.electric, alpha: 0, falloff: 1.6 }));
      halo.scale.setScalar(r * 2.9); halo.renderOrder = -1; g.add(halo);
      rig.add(g);
      return { r, y, t, m, frost, halo, cold: 0, here: 0 };
    });
    // pulse-tube head and flange above the top plate
    const head = new Mesh(new CylinderGeometry(0.16, 0.18, 0.3, 48), gold({ color: '#C99A4A', roughness: 0.35 }));
    head.position.y = 1.31 + 0.19; rig.add(head);
    [[-0.42, 0.1, 0.07, 0.22], [0.38, -0.2, 0.06, 0.18]].forEach(([x, z, r, h]) => {
      const c = new Mesh(new CylinderGeometry(r, r, h, 32), gold({ color: '#C99A4A', roughness: 0.35 }));
      c.position.set(x, 1.31 + 0.04 + h / 2, z); rig.add(c);
    });
    // support rods
    for (let i = 0; i < PL.length - 1; i++) {
      const [ra, ya, ta] = PL[i], [rb, yb, tb] = PL[i + 1];
      for (let k = 0; k < 4; k++) {
        const a = Math.PI / 4 + (k * Math.PI) / 2, rr = rb * 0.8;
        const len = ya - ta / 2 - (yb + tb / 2);
        const rod = new Mesh(new CylinderGeometry(0.02, 0.02, len, 16), gold({ color: '#E0B35A', roughness: 0.22 }));
        rod.position.set(Math.cos(a) * rr, (ya - ta / 2 + yb + tb / 2) / 2, Math.sin(a) * rr); rig.add(rod);
      }
    }
    // coaxial lines: copper-silver going in, cobalt readout lines coming back up
    const CAB = [-0.62, -0.42, -0.2, 0.02, 0.24, 0.44, 0.64];
    const cables = CAB.map((k, j) => {
      const up = j === 1 || j === 5;
      const ang = Math.PI * 0.5 + k * 1.9;                 // spread across the front of the rig
      const pts = [new Vector3(Math.cos(ang) * 0.3, 1.31 + 0.25, Math.sin(ang) * 0.3)];
      PL.forEach(([r, y, t], i) => {
        const rr = r * 0.62, sw = (j % 2 ? 1 : -1) * (i % 2 ? 0.05 : -0.04);
        if (i > 0) pts.push(new Vector3(Math.cos(ang + sw) * (rr + 0.03), (y + PL[i - 1][1]) / 2, Math.sin(ang + sw) * (rr + 0.03)));
        pts.push(new Vector3(Math.cos(ang) * rr, y, Math.sin(ang) * rr));
      });
      pts.push(new Vector3(Math.cos(ang) * 0.12, -1.42, Math.sin(ang) * 0.12));
      const curve = new CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
      const mat = up
        ? new MeshPhysicalMaterial({ color: new Color('#5d8cff'), metalness: 0.8, roughness: 0.3, envMapIntensity: 1.2, emissive: new Color('#0a2a7a'), emissiveIntensity: 0.4 })
        : new MeshPhysicalMaterial({ color: new Color('#d8b98e'), metalness: 1, roughness: 0.28, envMapIntensity: 1.2 });
      rig.add(new Mesh(new TubeGeometry(curve, small ? 120 : 220, 0.012, 8, false), mat));
      return { curve, up, off: j * 0.43 };
    });
    // attenuators on the input lines below the 4 K and cold plates
    cables.forEach((cb) => {
      if (cb.up) return;
      [2, 4].forEach((i) => {
        const y = PL[i][1] - PL[i][2] / 2 - 0.1;
        let best = 0, bd = 9;
        for (let u = 0; u <= 1; u += 0.005) { const d = Math.abs(cb.curve.getPointAt(u).y - y); if (d < bd) { bd = d; best = u; } }
        const a = new Mesh(new CylinderGeometry(0.026, 0.026, 0.09, 20), new MeshPhysicalMaterial({ color: new Color('#5b6488'), metalness: 0.9, roughness: 0.35, envMapIntensity: 1.1 }));
        a.position.copy(cb.curve.getPointAt(best)); rig.add(a);
      });
    });
    // signal pulses travelling along the lines
    const pulses = pointsGeometry(cables.length * 2);
    rig.add(Object.assign(new Points(pulses, ctx.glowPoints()), { renderOrder: 4 }));
    // the shielded sample can, with the qubit chip inside
    const canMat = new ShaderMaterial({
      uniforms: { uC: { value: rgb(PAL.sky) } },
      vertexShader: 'varying vec3 vN, vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'varying vec3 vN, vV; uniform vec3 uC; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2); vec3 c = uC * (f * 0.9 + 0.05); float a = clamp(max(c.r, max(c.g, c.b)), 0., 1.); gl_FragColor = vec4(c, a); }',
      transparent: true, depthWrite: false, blending: NormalBlending, premultipliedAlpha: true, side: FrontSide,
    });
    const can = new Group(); can.position.y = -1.23 - 0.035 - 0.27;
    const body = new Mesh(new CylinderGeometry(0.22, 0.22, 0.42, 64, 1, true), canMat);
    const cap = new Mesh(new SphereGeometry(0.22, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), canMat);
    cap.position.y = -0.21; body.renderOrder = cap.renderOrder = 6;
    const chip = new Mesh(new BoxGeometry(0.17, 0.012, 0.17), new MeshPhysicalMaterial({ color: new Color('#1d2b4f'), metalness: 0.5, roughness: 0.25, clearcoat: 1, envMapIntensity: 1.2 }));
    chip.position.y = -0.06;
    const chipRim = new Mesh(new BoxGeometry(0.19, 0.008, 0.19), gold({ roughness: 0.2 })); chipRim.position.y = -0.068;
    const finger = new Mesh(new CylinderGeometry(0.03, 0.03, 0.2, 16), gold({ roughness: 0.25 })); finger.position.y = 0.06;
    const qb = pointsGeometry(4);
    can.add(body, cap, chipRim, chip, finger, Object.assign(new Points(qb, ctx.glowPoints()), { renderOrder: 7 }));
    rig.add(can);
    const qpos = [[-0.04, -0.04], [0.04, -0.04], [-0.04, 0.04], [0.04, 0.04]].map(([x, z]) => new Vector3(x, -0.05, z));

    // temperature labels beside each plate (they stay on the right while the rig turns)
    const labels = PL.map(([r, y], i) => {
      const s = document.createElement('span'); s.className = 'b3l fr3l'; s.textContent = names[i] || ''; el.appendChild(s);
      return { el: s, at: new Vector3(r + 0.1, y, 0) };
    });
    scene.add(backGlow(ctx, PAL.cobalt, 5.2, 0.35, -1.5, 1.6));
    const lookAt = new Vector3(0.38, 0.02, 0), tmp = new Vector3();
    const gc = rgb('#FFF1C2'), sc = rgb(PAL.sci), qc = rgb(PAL.amber);
    let shown = -1;
    const update = (t, dt) => {
      const act = root?.frActive ?? 0;
      rig.rotation.y = 0.5 + t * 0.12;
      const k = still ? 1 : Math.min(1, dt * 4);
      plates.forEach((p, i) => {
        p.cold += ((i <= act && act > 0 ? 1 : 0) - p.cold) * k;
        p.here += ((i === act ? 1 : 0) - p.here) * k;
        p.frost.material.uniforms.uAlpha.value = p.cold * 0.6 + p.here * 0.4;
        p.halo.material.uniforms.uAlpha.value = p.here * (act > 0 ? 0.6 : 0.3) + p.cold * 0.12;
      });
      cables.forEach((cb, j) => {
        for (let n = 0; n < 2; n++) {
          let u = ((t / (cb.up ? 3.4 : 2.8) + cb.off + n * 0.5) % 1);
          if (cb.up) u = 1 - u;
          setPoint(pulses, j * 2 + n, cb.curve.getPointAt(u, tmp), 0.14, cb.up ? sc : gc, still ? 0 : 0.95);
        }
      });
      pulses.attributes.position.needsUpdate = pulses.attributes.tint.needsUpdate = pulses.attributes.size.needsUpdate = true;
      const atChip = act === PL.length - 1;
      qpos.forEach((q, i) => setPoint(qb, i, q, 0.07, qc, atChip ? 0.65 + 0.35 * Math.sin(t * 3.5 + i * 1.6) : 0.35));
      qb.attributes.position.needsUpdate = qb.attributes.tint.needsUpdate = qb.attributes.size.needsUpdate = true;
      if (act !== shown) { labels.forEach((L, i) => L.el.classList.toggle('here', i === act)); shown = act; }
    };
    const fit = (v) => {
      const vf = (camera.fov * Math.PI) / 360, hf = Math.atan(Math.tan(vf) * camera.aspect);
      const d = Math.max(2.2 / Math.tan(vf), 1.55 / Math.tan(hf)) + 0.6;
      camera.position.set(lookAt.x, lookAt.y + d * 0.2, d); camera.lookAt(lookAt); camera.updateMatrixWorld();
    };
    const place = (v) => {
      for (const L of labels) {
        tmp.copy(L.at).project(camera);
        L.el.style.transform = `translate(${(((tmp.x + 1) / 2) * v.cssW).toFixed(1)}px, ${(((1 - tmp.y) / 2) * v.cssH).toFixed(1)}px) translate(0, -50%)`;
      }
    };
    return { scene, camera, update: (t, dt, v) => { update(t, dt); place(v); }, fit, t0: 0 };
  });
}

const MAKERS = { gem, orbital, tesseract, nested, infinity, mobius, fridge };
export function mount(el) {
  const make = MAKERS[el.dataset['3d']];
  if (!make || el.dataset.mounted) return;
  el.dataset.mounted = '1';
  try { make(el); } catch (e) { console.warn('3D unavailable', e); }
}
