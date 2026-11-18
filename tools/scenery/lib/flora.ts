/**
 * Flora e elementos naturais autorais (copas, sumaúmas, palmeiras, samambaias, helicônias,
 * bromélias, moitas, troncos, pedras, cipós, cachoeiras). Cada construtor adiciona geometria
 * a um Batch, transformada pela matriz base `T` (posição/escala do objeto).
 */
import * as THREE from 'three';
import { Batch, hash, hr, mix, vmat, M, TAU, type V3 } from './core';
import { leafGeo, tubeGeo, rockGeo, trunkGeo, frondGeo, bladeGeo, latheGeo, placeM } from './kit';

const DS = THREE.DoubleSide;
export const MAT = {
  leaf: () => vmat('leaf', 0xffffff, { side: DS }),
  leafSolid: () => vmat('leaf', 0xffffff, { side: DS, rim: 0.2 }),
  bark: () => vmat('bark', 0xffffff, { repeat: 1 }),
  wood: () => vmat('wood', 0xffffff),
  rock: () => vmat('rock', 0xffffff),
  soft: () => vmat('rubber', 0xffffff, { rough: 0.9, rim: 0.15 }),
  plastic: () => vmat('plastic', 0xffffff, { rough: 0.5 }),
  crown: () => vmat('leaf', 0xffffff, { rim: 0.45, rough: 0.8 }),
};

const mul = (T: THREE.Matrix4, m: THREE.Matrix4) => T.clone().multiply(m);

/** Copa arredondada: aglomerado de "nuvens" de folhagem deformadas, claras em cima e escuras embaixo. */
export function crown(b: Batch, T: THREE.Matrix4, r: number, cols: [number, number, number], seed = 0, o: { lobes?: number; flat?: number; detail?: number } = {}) {
  const n = o.lobes ?? 7;
  const m = MAT.crown();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + seed;
    const rr = i === 0 ? 0 : r * hr(0.45, 0.75, i, seed);
    const y = i === 0 ? r * 0.15 : hr(-0.25, 0.45, i, seed + 1) * r;
    const s = i === 0 ? r * 0.75 : r * hr(0.38, 0.58, i, seed + 2);
    const g = rockGeo([s, s * (o.flat ?? 0.72), s * 0.9], seed * 7 + i, o.detail ?? 2, { rough: 0.32 });
    // claridade por altura (luz de cima) feita por cor de vértice
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const c = new Float32Array(pos.count * 3);
    const top = new THREE.Color(cols[2]), mid = new THREE.Color(cols[1]), low = new THREE.Color(cols[0]);
    for (let k = 0; k < pos.count; k++) {
      const t = (pos.getY(k) / s + 1) / 2 + (y / r) * 0.3;
      const cc = t < 0.5 ? low.clone().lerp(mid, t * 2) : mid.clone().lerp(top, (t - 0.5) * 2);
      c[k * 3] = cc.r; c[k * 3 + 1] = cc.g; c[k * 3 + 2] = cc.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    b.add(g, m, mul(T, M([Math.cos(a) * rr, y, Math.sin(a) * rr * 0.7], [0, i * 37, 0])));
  }
}

/** Sumaúma (árvore gigante): tronco claro e reto com sapopemas (raízes-tabulares) e copa em guarda-chuva. */
export function kapok(b: Batch, T: THREE.Matrix4, h: number, cols: { bark: number; leaf: [number, number, number] }, seed = 0, o: { crown?: boolean; branches?: number; r0?: number } = {}) {
  const r0 = o.r0 ?? h * 0.045;
  b.add(trunkGeo(h, r0, r0 * 0.55, seed, { flare: 0.4, seg: 18, rings: 18 }), MAT.bark(), T, cols.bark);
  // sapopemas: lâminas largas saindo da base
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 360 + seed * 20;
    const L = Math.min(h * hr(0.12, 0.18, i, seed), r0 * hr(3.2, 4.2, i, seed));
    const sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.quadraticCurveTo(L * 0.25, L * 0.1, L, 0); sh.lineTo(L * 0.9, 0.02); sh.quadraticCurveTo(L * 0.3, L * 0.35, 0, L * 1.2); sh.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: r0 * 0.25, bevelEnabled: true, bevelThickness: r0 * 0.12, bevelSize: r0 * 0.1, bevelSegments: 2, curveSegments: 10 });
    g.translate(r0 * 0.6, 0, -r0 * 0.12);
    b.add(g, MAT.soft(), mul(T, M([0, 0, 0], [0, a, 0])), mix(cols.bark, 0x000000, 0.15));
  }
  if (o.crown === false) return;
  // galhos em leque no topo e copa achatada
  const nb = o.branches ?? 5;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * TAU + seed;
    const L = h * hr(0.22, 0.32, i, seed + 3);
    const pts: V3[] = [[0, h * 0.92, 0], [Math.cos(a) * L * 0.4, h * 0.98, Math.sin(a) * L * 0.25], [Math.cos(a) * L, h * 1.04, Math.sin(a) * L * 0.6]];
    b.add(tubeGeo(pts, (t) => r0 * 0.45 * (1 - t * 0.6), 12, 6), MAT.bark(), T, cols.bark);
    crown(b, mul(T, M([Math.cos(a) * L, h * 1.06, Math.sin(a) * L * 0.6])), h * 0.13, cols.leaf, seed + i * 3, { flat: 0.5, lobes: 6 });
  }
  crown(b, mul(T, M([0, h * 1.07, 0])), h * 0.16, cols.leaf, seed + 40, { flat: 0.45, lobes: 7 });
}

/** Árvore comum de mata: tronco fino e copa redonda. */
export function tree(b: Batch, T: THREE.Matrix4, h: number, cols: { bark: number; leaf: [number, number, number] }, seed = 0) {
  const r0 = h * 0.035;
  b.add(trunkGeo(h * 0.8, r0, r0 * 0.6, seed, { flare: 0.3, seg: 10, rings: 8, lean: hr(-0.1, 0.1, seed) }), MAT.bark(), T, cols.bark);
  crown(b, mul(T, M([0, h * 0.82, 0])), h * 0.26, cols.leaf, seed + 5, { lobes: 6 });
}

/** Palmeira: estipe curvo em anéis e leque de folhas pinadas. */
export function palm(b: Batch, T: THREE.Matrix4, h: number, cols: { trunk: number; leaf: number }, seed = 0, o: { lean?: number; fronds?: number; coconuts?: boolean } = {}) {
  const lean = o.lean ?? hr(-0.25, 0.25, seed);
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([lean * h * t * t, h * t, 0]); }
  b.add(tubeGeo(pts, (t) => h * 0.03 * (1.25 - t * 0.45), 24, 8), MAT.bark(), T, cols.trunk);
  // anéis do estipe
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  for (let i = 1; i < 9; i++) {
    const p = curve.getPointAt(i / 9);
    b.add(new THREE.TorusGeometry(h * 0.03 * (1.25 - (i / 9) * 0.45), h * 0.005, 4, 12), MAT.bark(), mul(T, M([p.x, p.y, p.z], [90, 0, 0])), mix(cols.trunk, 0x000000, 0.25));
  }
  const top = new THREE.Vector3(...pts[6]);
  const nf = o.fronds ?? 9;
  for (let i = 0; i < nf; i++) {
    const a = (i / nf) * 360 + seed * 13;
    const droop = hr(0.4, 1.1, i, seed + 2);
    const len = h * hr(0.32, 0.42, i, seed + 3);
    // ráquis
    const fp: V3[] = [];
    for (let k = 0; k <= 6; k++) { const t = k / 6; fp.push([len * t, len * (0.35 * t - droop * t * t * 0.7), 0]); }
    const R = M([top.x, top.y, top.z], [0, a, 0]);
    b.add(tubeGeo(fp, (t) => h * 0.008 * (1 - t * 0.8), 14, 4), MAT.leaf(), mul(T, R), cols.leaf);
    const fc = new THREE.CatmullRomCurve3(fp.map((p) => new THREE.Vector3(...p)));
    for (let k = 2; k < 16; k++) {
      const t = k / 16;
      const p = fc.getPointAt(t);
      for (const s of [-1, 1]) {
        const L = len * 0.28 * Math.sin(Math.PI * (0.1 + t * 0.85));
        const g = leafGeo(L, L * 0.16, { curl: 0.6, nu: 4, nv: 1 });
        b.add(g, MAT.leaf(), mul(T, mul(R, placeM(p, new THREE.Vector3(0.3, -0.5, s).normalize(), 0))), mix(cols.leaf, 0xffffff, 0.08 * (k % 3)));
      }
    }
  }
  if (o.coconuts) for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + seed;
    b.add(new THREE.SphereGeometry(h * 0.028, 10, 8), MAT.plastic(), mul(T, M([top.x + Math.cos(a) * h * 0.035, top.y - h * 0.03, top.z + Math.sin(a) * h * 0.035])), i % 2 ? 0x6a4a1a : 0x5a7a2a);
  }
}

/** Samambaia: roseta de frondes arqueadas. */
export function fern(b: Batch, T: THREE.Matrix4, size: number, col: number, seed = 0, n = 9) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360 + seed * 31;
    const parts = frondGeo(size * hr(0.75, 1.1, i, seed), size * 0.32, hr(0.4, 0.7, i, seed + 1), seed + i);
    const R = mul(T, M([0, 0, 0], [0, a, 0]).multiply(M([0, 0, 0], [hr(25, 55, i, seed + 2), 0, 0])));
    for (const g of parts) b.add(g, MAT.leaf(), R, mix(col, 0xffffff, 0.1 * ((i * 3) % 4) - 0.05));
  }
}

/** Folha larga (bananeira/helicônia): pecíolo + lâmina recortada. */
export function bigLeaf(b: Batch, T: THREE.Matrix4, len: number, w: number, col: number, seed = 0, o: { droop?: number; stem?: number } = {}) {
  const st = o.stem ?? len * 0.4;
  b.add(tubeGeo([[0, 0, 0], [0, st * 0.6, 0.02], [0, st, 0.04]], len * 0.02, 8, 5), MAT.leaf(), T, mix(col, 0x000000, 0.15));
  const g = leafGeo(len, w, { curl: o.droop ?? 1.2, fold: 0.25, nu: 14, nv: 4, notch: 0.5, seed, shape: (t) => Math.sin(Math.PI * Math.min(1, t * 1.02)) ** 0.6 });
  b.add(g, MAT.leaf(), mul(T, M([0, st, 0.04], [-20, 0, 0])), col);
}

/** Helicônia: touceira de folhas eretas e brácteas vermelho-amarelas em zigue-zague. */
export function heliconia(b: Batch, T: THREE.Matrix4, h: number, leafCol: number, seed = 0) {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 360 + seed * 40;
    bigLeaf(b, mul(T, M([0, 0, 0], [hr(-20, -8, i, seed), a, 0])), h * hr(0.55, 0.75, i, seed + 1), h * 0.2, mix(leafCol, 0xffffff, 0.06 * (i % 3)).getHex(), seed + i, { droop: 0.8, stem: h * 0.35 });
  }
  for (let k = 0; k < 2; k++) {
    const base = new THREE.Vector3(k ? 0.08 * h : -0.06 * h, h * (0.55 + 0.1 * k), 0.05 * h);
    b.add(tubeGeo([[base.x, 0, 0], [base.x, base.y * 0.6, 0.02], [base.x, base.y, base.z]], h * 0.012, 8, 5), MAT.leaf(), T, 0x3a6a24);
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1;
      const g = latheGeo([[0.001, 0], [h * 0.025, h * 0.02], [h * 0.03, h * 0.08], [0.001, h * 0.14]], 8);
      b.add(g, MAT.plastic(), mul(T, M([base.x + s * h * 0.02, base.y - i * h * 0.055, base.z], [0, 0, s * 70])), i % 2 ? 0xe83a2a : 0xf2a020);
    }
  }
}

/** Bromélia: roseta de folhas largas e duras, centro colorido. */
export function bromeliad(b: Batch, T: THREE.Matrix4, s: number, leafCol: number, heart: number, seed = 0) {
  for (let ring = 0; ring < 3; ring++) {
    const n = 7 - ring;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + ring * 25 + seed * 10;
      const L = s * (1 - ring * 0.22);
      const g = leafGeo(L, L * 0.26, { curl: 1.6 - ring * 0.3, fold: 0.5, nu: 8, nv: 2, shape: (t) => (1 - t) ** 0.7 * Math.min(1, t * 6) });
      b.add(g, MAT.leaf(), mul(T, M([0, 0.02 * s, 0], [0, a, 0]).multiply(M([0, 0, 0], [-(55 - ring * 18), 0, 0]))), mix(leafCol, heart, ring * 0.3));
    }
  }
  b.add(latheGeo([[0.001, 0], [s * 0.08, s * 0.05], [s * 0.05, s * 0.25], [0.001, s * 0.3]], 10), MAT.plastic(), T, heart);
}

/** Moita: copa baixa irregular com folhas soltas por cima. */
export function bush(b: Batch, T: THREE.Matrix4, r: number, cols: [number, number, number], seed = 0) {
  crown(b, mul(T, M([0, r * 0.55, 0], [0, 0, 0], [1.3, 0.85, 1])), r, cols, seed, { lobes: 6 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU + seed;
    const g = leafGeo(r * 0.45, r * 0.2, { curl: 0.9, fold: 0.3, nu: 6, nv: 2 });
    b.add(g, MAT.leaf(), mul(T, placeM([Math.cos(a) * r * 1.1, r * hr(0.3, 1.1, i, seed), Math.sin(a) * r * 0.7 + r * 0.2], new THREE.Vector3(Math.cos(a), 0.7, Math.sin(a) * 0.6 + 0.3), 0)), mix(cols[1], cols[2], hash(i, seed)));
  }
}

/** Tufo de capim. */
export function grassTuft(b: Batch, T: THREE.Matrix4, h: number, cols: number[], seed = 0, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = hr(0, 360, i, seed);
    const g = bladeGeo(h * hr(0.6, 1.1, i, seed + 1), h * 0.08, hr(0.2, 0.7, i, seed + 2), 0.5, 4);
    b.add(g, MAT.leaf(), mul(T, placeM([hr(-0.1, 0.1, i, seed + 3) * h, 0, hr(-0.1, 0.1, i, seed + 4) * h], new THREE.Vector3(hr(-0.4, 0.4, i, seed + 5), 1, hr(-0.4, 0.4, i, seed + 6)), a)), cols[i % cols.length]);
  }
}

/** Rocha com musgo no topo (cor por vértice). */
export function mossRock(b: Batch, T: THREE.Matrix4, r: V3, rock: number, moss: number | null, seed = 0, detail = 2) {
  const g = rockGeo(r, seed, detail, { flat: 0.55, rough: 0.22 });
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nor = g.getAttribute('normal') as THREE.BufferAttribute;
  const c = new Float32Array(pos.count * 3);
  const cr = new THREE.Color(rock), cm = new THREE.Color(moss ?? rock);
  for (let k = 0; k < pos.count; k++) {
    const up = nor.getY(k);
    const t = moss === null ? 0 : THREE.MathUtils.smoothstep(up + 0.15 * Math.sin(pos.getX(k) * 9 + seed), 0.45, 0.75);
    const cc = cr.clone().multiplyScalar(0.75 + 0.35 * (pos.getY(k) / r[1] * 0.5 + 0.5)).lerp(cm, t);
    c[k * 3] = cc.r; c[k * 3 + 1] = cc.g; c[k * 3 + 2] = cc.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  b.add(g, MAT.rock(), T);
}

/** Tronco caído (horizontal ao longo de X) com cascas, musgo e ponta quebrada. */
export function log(b: Batch, T: THREE.Matrix4, len: number, r: number, bark: number, moss: number, seed = 0) {
  const g = trunkGeo(len, r, r * 0.85, seed, { flare: 0.15, seg: 16, rings: 16 });
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const c = new Float32Array(pos.count * 3);
  for (let k = 0; k < pos.count; k++) {
    // após girar, +X local vira +Y: musgo no lado que ficará para cima
    const up = pos.getX(k) / r;
    const t = THREE.MathUtils.smoothstep(up + 0.2 * Math.sin(pos.getY(k) * 5 + seed), 0.45, 0.85);
    const cc = new THREE.Color(bark).lerp(new THREE.Color(moss), t);
    c[k * 3] = cc.r; c[k * 3 + 1] = cc.g; c[k * 3 + 2] = cc.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  b.add(g, MAT.bark(), mul(T, M([-len / 2, r * 0.85, 0], [0, 0, -90])));
  // tampa cortada com anéis
  b.add(new THREE.CircleGeometry(r * 0.83, 20), MAT.wood(), mul(T, M([-len / 2 - 0.001, r * 0.85, 0], [0, -90, 0])), 0xc8a070);
  for (let k = 1; k < 4; k++) b.add(new THREE.TorusGeometry(r * 0.2 * k, r * 0.02, 4, 24), MAT.wood(), mul(T, M([-len / 2 - 0.004, r * 0.85, 0], [0, -90, 0])), 0x8a6040);
}

/** Toco cortado (anéis no topo, sapopemas curtas). */
export function stump(b: Batch, T: THREE.Matrix4, h: number, r: number, bark: number, seed = 0, cut = 0xd0a46a) {
  b.add(trunkGeo(h, r, r * 0.92, seed, { flare: 0.7, seg: 16, rings: 6 }), MAT.bark(), T, bark);
  b.add(new THREE.CircleGeometry(r * 0.93, 24), MAT.wood(), mul(T, M([0, h + 0.002, 0], [-90, 0, 0])), cut);
  for (let k = 1; k < 5; k++) b.add(new THREE.TorusGeometry(r * 0.18 * k, r * 0.015, 4, 28), MAT.wood(), mul(T, M([0, h + 0.004, 0], [-90, 0, 0])), mix(cut, 0x000000, 0.3));
}

/** Cipó pendurado (do alto para baixo), com folhas. */
export function hangingVine(b: Batch, T: THREE.Matrix4, len: number, col: number, leaf: number | null, seed = 0, r = 0.03) {
  const pts: V3[] = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([0.15 * len * Math.sin(t * 3 + seed) * t, -len * t, 0.05 * Math.sin(t * 5 + seed)]); }
  b.add(tubeGeo(pts, (t) => r * (1 - t * 0.5), 24, 6), MAT.bark(), T, col);
  if (leaf === null) return;
  const cv = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const n = Math.max(3, Math.round(len * 4));
  for (let i = 1; i < n; i++) {
    const p = cv.getPointAt(i / n);
    const g = leafGeo(r * 6, r * 4, { curl: 0.6, fold: 0.3, nu: 5, nv: 2 });
    b.add(g, MAT.leaf(), mul(T, placeM(p, new THREE.Vector3(i % 2 ? 1 : -1, -0.3, 0.4), 0)), mix(leaf, 0xffffff, 0.08 * (i % 3)));
  }
}

/** Montanha/morro distante (corpo arredondado com cumes). */
export function hill(b: Batch, T: THREE.Matrix4, w: number, h: number, col: number, seed = 0) {
  const g = rockGeo([w / 2, h, w * 0.25], seed, 3, { flat: 0, rough: 0.12 });
  b.add(g, MAT.soft(), T, col);
}

/** Cachoeira: faixa de água caindo com espuma na base (material emissivo suave). */
export function waterfall(root: THREE.Object3D, pos: V3, w: number, h: number, col = 0xe8f6ff, opacity = 0.85) {
  const g = new THREE.PlaneGeometry(w, h, 6, 20);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), x = p.getX(i);
    p.setX(i, x * (1 + (0.5 - y / h) * 0.3) + 0.04 * w * Math.sin(y * 3));
    p.setZ(i, -((y / h - 0.5) ** 2) * w * 0.5);
  }
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(255,255,255,0.55)';
  x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 18; i++) {
    x.fillStyle = `rgba(255,255,255,${0.35 + 0.6 * hash(i, 3)})`;
    x.fillRect(Math.floor(hash(i, 1) * 60), 0, 2 + Math.floor(hash(i, 2) * 4), 256);
  }
  const grad = x.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.15, 'rgba(0,0,0,0)'); grad.addColorStop(0.85, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,1)');
  x.globalCompositeOperation = 'destination-out';
  x.fillStyle = grad; x.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c);
  const m = new THREE.MeshBasicMaterial({ color: col, map: t, transparent: true, opacity, depthWrite: false });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(pos[0], pos[1] + h / 2, pos[2]);
  root.add(mesh);
  // névoa na base
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(w * 3, w * 1.4), new THREE.MeshBasicMaterial({ color: 0xffffff, map: radial(), transparent: true, opacity: 0.6, depthWrite: false }));
  mist.position.set(pos[0], pos[1] + w * 0.2, pos[2] + 0.2);
  root.add(mist);
}

let radialT: THREE.Texture | null = null;
function radial() {
  if (radialT) return radialT;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  radialT = new THREE.CanvasTexture(c);
  return radialT;
}

/** Cogumelos em grupo. */
export function mushrooms(b: Batch, T: THREE.Matrix4, s: number, cap: number, stem: number, seed = 0, n = 4, glow?: number) {
  const capM = glow !== undefined ? vmat('glow', 0xffffff, { emissive: glow, emissiveIntensity: 0.9 }) : MAT.plastic();
  for (let i = 0; i < n; i++) {
    const h = s * hr(0.45, 1, i, seed);
    const x = (i - (n - 1) / 2) * s * 0.45 + hr(-0.08, 0.08, i, seed + 1) * s;
    const z = hr(-0.2, 0.2, i, seed + 2) * s;
    const lean = hr(-12, 12, i, seed + 3);
    const R = mul(T, M([x, 0, z], [0, 0, lean]));
    b.add(latheGeo([[h * 0.12, 0], [h * 0.1, h * 0.5], [h * 0.08, h * 0.95], [0.001, h]], 10), MAT.soft(), R, stem);
    b.add(latheGeo([[0.001, h * 0.9], [h * 0.38, h * 0.88], [h * 0.4, h * 0.95], [h * 0.3, h * 1.1], [0.001, h * 1.18]], 14), capM, R, cap);
    // pintas
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + i;
      b.add(new THREE.SphereGeometry(h * 0.04, 6, 4), MAT.soft(), mul(R, M([Math.cos(a) * h * 0.2, h * 1.1, Math.sin(a) * h * 0.2])), 0xfff4e0);
    }
  }
}

/** Raiz exposta arqueada (sai do chão e volta). */
export function rootArch(b: Batch, T: THREE.Matrix4, len: number, h: number, r: number, col: number, seed = 0) {
  for (let k = 0; k < 4; k++) {
    const s = [1, 0.7, 0.55, 0.45][k];
    const x0 = [-0.5, -0.1, 0.05, -0.35][k] * len, dir = k % 2 ? -1 : 1;
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const x = x0 + dir * len * s * t * (k === 0 ? 1 : 0.8);
      pts.push([x, h * s * Math.sin(Math.PI * t) ** 0.7 * (1 - 0.3 * t) - r * 0.4 + 0.06 * Math.sin(t * 9 + seed + k), (k - 1.5) * r * 1.2 + 0.12 * Math.sin(t * 5 + seed + k * 2)]);
    }
    b.add(tubeGeo(pts, (t) => r * s * (1.5 - t * 0.9) * (1 + 0.15 * Math.sin(t * 20 + k)), 40, 9), MAT.bark(), T, mix(col, 0x000000, k * 0.1));
  }
}
