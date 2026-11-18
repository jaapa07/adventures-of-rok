/**
 * Kit de geometrias autorais para cenário (folhas, lâminas de grama, frondes, rochas, troncos,
 * tubos). Tudo devolve BufferGeometry para ser mesclado em lote (Batch).
 */
import * as THREE from 'three';
import { hash, hr, vnoise, TAU, type V3 } from './core';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Lâmina de grama/capim: tira afunilada e curvada. */
export function bladeGeo(len: number, w: number, bend = 0.3, twist = 0, seg = 4) {
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const x = bend * len * t * t;
    const y = len * t * (1 - 0.15 * bend * t);
    const hw = (w / 2) * (1 - t) ** 0.9 + 0.0005;
    const a = twist * t;
    const cx = Math.cos(a) * hw, cz = Math.sin(a) * hw;
    pos.push(x - cx, y, -cz, x + cx, y, cz);
    const n = new THREE.Vector3(-0.3 * bend, 0.6, 0.75).normalize();
    nor.push(n.x, n.y, n.z, n.x, n.y, n.z);
    if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/**
 * Folha: comprimento ao longo de +Y, largura em X, perfil de largura `shape(t)`, dobra na nervura
 * (`fold`, eleva as bordas em +Z) e curvatura ao longo do comprimento (`curl`, para +Z).
 */
export function leafGeo(len: number, w: number, o: { curl?: number; fold?: number; shape?: (t: number) => number; nu?: number; nv?: number; droop?: number; notch?: number; seed?: number } = {}) {
  const nu = o.nu ?? 10, nv = o.nv ?? 4;
  const shape = o.shape ?? ((t: number) => Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.8);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= nu; i++) {
    const t = i / nu;
    const ang = (o.curl ?? 0) * t;
    const droop = (o.droop ?? 0) * t * t * len;
    for (let j = 0; j <= nv * 2; j++) {
      const s = j / nv - 1; // -1..1
      let hw = (w / 2) * shape(t);
      if (o.notch) hw *= 1 - o.notch * (0.5 + 0.5 * Math.sin(t * 40 + (o.seed ?? 0))) * Math.abs(s) ** 4;
      const x = s * hw;
      const zf = (o.fold ?? 0) * Math.abs(s) * hw;
      const y = len * t;
      // curvatura: gira (y,z) em torno do eixo X
      const yy = y * Math.cos(ang * 0.5) - zf * Math.sin(ang * 0.5);
      const zz = y * Math.sin(ang * 0.5) + zf * Math.cos(ang * 0.5) - droop;
      pos.push(x, yy, zz);
      uv.push(s * 0.5 + 0.5, t);
    }
  }
  const W = nv * 2 + 1;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv * 2; j++) {
    const a = i * W + j, b = a + 1, c = a + W, d = c + 1;
    idx.push(a, c, d, a, d, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Tubo por spline com raio variável. */
export function tubeGeo(points: V3[], radius: number | ((t: number) => number), seg = 24, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const rf = typeof radius === 'number' ? () => radius : radius;
  const v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const c = curve.getPointAt(i / seg);
    const r = rf(i / seg);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}

/** Rocha: icosaedro subdividido e deformado por ruído determinístico, base achatada. */
export function rockGeo(r: V3, seed = 0, detail = 2, o: { flat?: number; rough?: number; facet?: boolean } = {}) {
  const ico = new THREE.IcosahedronGeometry(1, detail);
  ico.deleteAttribute('normal'); ico.deleteAttribute('uv');
  let g: THREE.BufferGeometry = mergeVertices(ico, 1e-4);
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const rough = o.rough ?? 0.18;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = vnoise(v.x * 2.1 + seed, v.y * 2.3 - seed * 0.7, seed) * rough + vnoise(v.z * 4.3 + v.x, v.y * 3.9, seed + 3) * rough * 0.4;
    v.multiplyScalar(1 + n);
    v.set(v.x * r[0], v.y * r[1], v.z * r[2]);
    if (o.flat !== undefined && v.y < -r[1] * o.flat) v.y = -r[1] * o.flat;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  if (o.facet) { g = g.toNonIndexed(); }
  g.computeVertexNormals();
  return g;
}

/** Torno a partir de perfil [raio, altura]. */
export function latheGeo(profile: [number, number][], seg = 16, deform?: (p: THREE.Vector3) => void) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), seg);
  if (deform) {
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); deform(v); pos.setXYZ(i, v.x, v.y, v.z); }
  }
  g.computeVertexNormals();
  return g;
}

/** Tronco orgânico (eixo Y), raiz alargada e casca irregular. */
export function trunkGeo(h: number, r0: number, r1: number, seed = 0, o: { flare?: number; seg?: number; rings?: number; lean?: number } = {}) {
  const rings = o.rings ?? 14;
  const prof: [number, number][] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const fl = (o.flare ?? 0.6) * Math.max(0, 1 - t * 5) ** 2;
    prof.push([r0 + (r1 - r0) * t + r0 * fl, h * t]);
  }
  return latheGeo(prof, o.seg ?? 14, (p) => {
    const a = Math.atan2(p.z, p.x);
    const t = p.y / h;
    // sulcos de raízes-tabulares perto da base e sinuosidade
    const butt = Math.max(0, 1 - t * 4) * (0.5 + 0.5 * Math.cos(a * 5 + seed)) * r0 * (o.flare ?? 0.6) * 0.9;
    const k = 1 + 0.06 * Math.sin(a * 7 + p.y * 3 + seed) + butt / Math.max(0.01, Math.hypot(p.x, p.z));
    p.x *= k; p.z *= k;
    p.x += (o.lean ?? 0) * p.y * p.y / h + 0.04 * h * Math.sin(t * 3 + seed) * t;
  });
}

/** Fronde de samambaia: ráquis curvada com folíolos alternados. */
export function frondGeo(len: number, w: number, arch = 0.6, seed = 0) {
  const parts: THREE.BufferGeometry[] = [];
  const n = 14;
  const pts: V3[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push([0, len * Math.sin(t * Math.PI * 0.5 * (1 + arch * 0.3)) * (1 - arch * 0.2), len * arch * t * t * 0.9]);
  }
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  parts.push(tubeGeo(pts, (t) => 0.012 * (1 - t) + 0.003, 12, 4));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const L = w * Math.sin(Math.PI * (0.15 + t * 0.85)) * (1 - t * 0.4);
    for (const side of [-1, 1]) {
      const g = leafGeo(L, L * 0.32, { curl: 0.4, fold: 0.3, nu: 4, nv: 1 });
      const m = new THREE.Matrix4();
      const up = tan.clone();
      const out = new THREE.Vector3(side, 0, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), out.clone().multiplyScalar(0.9).add(up.clone().multiplyScalar(0.45)).normalize());
      m.compose(p, q, new THREE.Vector3(1, 1, 1));
      g.applyMatrix4(m);
      parts.push(g);
    }
  }
  return parts;
}

/** Disco irregular (base de musgo, poças). */
export function patchGeo(rx: number, rz: number, seed = 0, seg = 18) {
  const s = new THREE.Shape();
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * TAU;
    const k = 0.8 + 0.2 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 5 + seed * 2);
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * rz * k;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  const g = new THREE.ShapeGeometry(s);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Quaternion que leva +Y para `dir`. */
export function alignY(dir: THREE.Vector3) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
}

/** Matriz a partir de posição, direção "para cima" do objeto, giro em torno dela (graus) e escala. */
export function placeM(pos: THREE.Vector3 | V3, up: THREE.Vector3 | V3, spinDeg = 0, s: number | V3 = 1) {
  const P = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
  const U = Array.isArray(up) ? new THREE.Vector3(...up) : up;
  const q = alignY(U).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spinDeg * Math.PI / 180));
  const S = typeof s === 'number' ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s);
  return new THREE.Matrix4().compose(P, q, S);
}

/** Sequência determinística de amostras (u, w) bem espalhadas (golden ratio). */
export function scatter(n: number, seed = 0) {
  const out: [number, number, number][] = [];
  const g = 0.6180339887;
  for (let i = 0; i < n; i++) {
    const u = (i / n + hash(i, seed) * (0.6 / n) + seed * 0.137) % 1;
    const w = (i * g + seed * 0.31 + hash(i, seed + 9) * 0.2) % 1;
    out.push([u, w, hr(0, 1, i, seed + 17)]);
  }
  return out;
}

/** Cristal hexagonal facetado com ponta (eixo Y, base na origem). */
export function crystalGeo(r: number, h: number, sides = 6) {
  const g = new THREE.LatheGeometry([new THREE.Vector2(0.0001, -h * 0.05), new THREE.Vector2(r * 0.85, 0), new THREE.Vector2(r, h * 0.7), new THREE.Vector2(0.0001, h)], sides);
  const ng = g.toNonIndexed();
  ng.computeVertexNormals();
  return ng;
}
/** Cone orgânico (estalactite/estalagmite/espinho). */
export function coneGeo(r: number, h: number, seed = 0, bend = 0) {
  return latheGeo([[r, 0], [r * 0.8, h * 0.25], [r * 0.5, h * 0.6], [r * 0.15, h * 0.9], [0.0005, h]], 10, (p) => {
    const t = p.y / h;
    const k = 1 + 0.12 * Math.sin(Math.atan2(p.z, p.x) * 3 + seed + t * 4);
    p.x = p.x * k + bend * h * t * t;
    p.z *= k;
  });
}
/** Ouriço-do-mar: corpo achatado com espinhos radiais. */
export function urchinParts(r: number, n = 40) {
  const parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
  const body = new THREE.SphereGeometry(r, 16, 12);
  body.scale(1, 0.7, 1);
  parts.push({ g: body, m: new THREE.Matrix4() });
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + 0.5) / n * 1.4;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * 2.39996;
    const d = new THREE.Vector3(Math.cos(a) * rr, Math.max(-0.2, y), Math.sin(a) * rr).normalize();
    const L = r * (1.6 + 0.6 * hash(i, 7));
    const g = latheGeo([[r * 0.08, 0], [r * 0.04, L * 0.6], [0.0005, L]], 5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    parts.push({ g, m: new THREE.Matrix4().compose(d.clone().multiplyScalar(r * 0.8).multiply(new THREE.Vector3(1, 0.7, 1)), q, new THREE.Vector3(1, 1, 1)) });
  }
  return parts;
}
