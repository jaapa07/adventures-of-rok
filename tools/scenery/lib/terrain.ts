/**
 * Corpo de terreno esculpido para tiles: caixa (ou prisma de rampa) com cantos arredondados só nos
 * lados expostos, relevo por ruído PERIÓDICO (encaixe perfeito entre vizinhos), normais por
 * diferenças finitas (sem costura de sombreamento) e "turfa" (grama/musgo/coral) que engrossa o topo.
 */
import * as THREE from 'three';
import { clamp, pfbm, pnoise1, smooth } from './core';

export type Expose = { u: boolean; r: boolean; d: boolean; l: boolean };
export type ShapeKind = 'box' | 'slope-r' | 'slope-l';

export interface BodyStyle {
  /** Profundidades da face frontal (z>0, perto da câmera) e do fundo. */
  zf: number;
  zb: number;
  /** Raio do arredondamento das arestas expostas. */
  R: number;
  /** Amplitude do relevo e "dureza" (0 = orgânico, 1 = facetado/rochoso). */
  amp: number;
  hard?: number;
  /** Células da 1ª oitava e número de oitavas do fBm periódico. */
  base?: number;
  oct?: number;
  seed?: number;
  /** Turfa no topo exposto. */
  turf?: { depth: number; vary: number; thick: number; seed?: number };
  /** Relevo adicional (protuberâncias autorais) — deve ser zero perto das bordas não expostas. */
  extra?: (p: THREE.Vector3) => number;
  /** Cor por vértice: posição projetada, normal, ruído, fator de turfa, profundidade abaixo do topo. */
  color: (p: THREE.Vector3, n: THREE.Vector3, nz: number, turf: number, depth: number) => THREE.Color;
  /** Escala do UV (inteiro para manter o período). */
  uv?: number;
  seg?: number;
}

export interface Shape { kind: ShapeKind; e: Expose }

const BIG = 1e4;

function frame(kind: ShapeKind) {
  const th = kind === 'slope-r' ? Math.PI / 4 : kind === 'slope-l' ? -Math.PI / 4 : 0;
  return { ax: new THREE.Vector2(Math.cos(th), Math.sin(th)), bx: new THREE.Vector2(-Math.sin(th), Math.cos(th)) };
}

/** Projeta um ponto qualquer na superfície arredondada (sem relevo). */
export function project(sh: Shape, st: BodyStyle, p: THREE.Vector3) {
  const { ax, bx } = frame(sh.kind);
  const R = st.R;
  const a = p.x * ax.x + p.y * ax.y;
  const b = p.x * bx.x + p.y * bx.y;
  let aLo = -BIG, aHi = BIG, bLo = -BIG, bHi = BIG;
  if (sh.kind === 'box') {
    if (sh.e.l) aLo = -0.5 + R;
    if (sh.e.r) aHi = 0.5 - R;
    if (sh.e.d) bLo = -0.5 + R;
    if (sh.e.u) bHi = 0.5 - R;
  } else {
    bHi = -R; // topo diagonal (passa pelo centro do tile)
  }
  const qa = clamp(a, aLo, aHi), qb = clamp(b, bLo, bHi), qz = clamp(p.z, st.zb + R, st.zf - R);
  const da = a - qa, db = b - qb, dz = p.z - qz;
  const L = Math.hypot(da, db, dz) || 1e-9;
  const na = da / L, nb = db / L, nz = dz / L;
  const n = new THREE.Vector3(na * ax.x + nb * bx.x, na * ax.y + nb * bx.y, nz);
  const qx = qa * ax.x + qb * bx.x, qy = qa * ax.y + qb * bx.y;
  const pos = new THREE.Vector3(qx + n.x * R, qy + n.y * R, qz + n.z * R);
  // profundidade abaixo do topo exposto (para a turfa)
  let depth = BIG;
  if (sh.kind === 'box') { if (sh.e.u) depth = 0.5 - pos.y; }
  else depth = -(pos.x * bx.x + pos.y * bx.y);
  return { pos, n, depth };
}

function turfAt(st: BodyStyle, pos: THREE.Vector3, depth: number, kind: ShapeKind) {
  if (!st.turf || depth > 5) return 0;
  const t = st.turf;
  const ux = kind === 'box' ? pos.x : pos.x; // franja periódica em x
  const f = t.depth + t.vary * pnoise1(ux, t.seed ?? 0) + t.vary * 0.4 * pnoise1(ux * 3, (t.seed ?? 0) + 2);
  return 1 - smooth(f - 0.025, f + 0.015, depth);
}

/** Superfície final (com relevo) e dados auxiliares. */
export function surf(sh: Shape, st: BodyStyle, p0: THREE.Vector3) {
  const pr = project(sh, st, p0);
  let nz = pfbm(pr.pos.x, pr.pos.y, pr.pos.z, st.seed ?? 0, st.base ?? 3, st.oct ?? 4);
  if (st.hard) nz = (1 - st.hard) * nz + st.hard * (Math.sign(nz) * Math.abs(nz) ** 0.55 * 0.8);
  const tf = turfAt(st, pr.pos, pr.depth, sh.kind);
  let d = st.amp * nz + (st.extra ? st.extra(pr.pos) : 0);
  const nzEff = d / Math.max(1e-6, st.amp);
  if (st.turf) d = d * (1 - tf * 0.6) + tf * st.turf.thick;
  const pos = pr.pos.clone().addScaledVector(pr.n, d);
  return { pos, n0: pr.n, nz: nzEff, tf, depth: pr.depth };
}

function surfNormal(sh: Shape, st: BodyStyle, p0: THREE.Vector3, n0: THREE.Vector3) {
  const e = 0.004;
  const t1 = Math.abs(n0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  t1.sub(n0.clone().multiplyScalar(t1.dot(n0))).normalize();
  const t2 = new THREE.Vector3().crossVectors(n0, t1).normalize();
  const a = surf(sh, st, p0.clone().addScaledVector(t1, e)).pos;
  const b = surf(sh, st, p0.clone().addScaledVector(t1, -e)).pos;
  const c = surf(sh, st, p0.clone().addScaledVector(t2, e)).pos;
  const d = surf(sh, st, p0.clone().addScaledVector(t2, -e)).pos;
  const n = new THREE.Vector3().crossVectors(a.sub(b), c.sub(d)).normalize();
  if (n.dot(n0) < 0) n.negate();
  return n;
}

type Patch = { f: (u: number, v: number) => THREE.Vector3; nu: number; nv: number };

/** Constrói a malha do corpo (sem as faces encostadas em vizinhos sólidos). */
export function bodyGeometry(sh: Shape, st: BodyStyle) {
  const seg = st.seg ?? 44;
  const { zf, zb } = st;
  const patches: Patch[] = [];
  const nz = 8;
  // bordas encostadas em vizinhos sólidos avançam um pouco (sobreposição esconde a costura do antisserrilhado)
  const E = 0.03;
  if (sh.kind === 'box') {
    const xl = sh.e.l ? -0.5 : -0.5 - E, xr = sh.e.r ? 0.5 : 0.5 + E;
    const yd = sh.e.d ? -0.5 : -0.5 - E, yu = sh.e.u ? 0.5 : 0.5 + E;
    const X = (u: number) => xl + (xr - xl) * u, Y = (v: number) => yd + (yu - yd) * v;
    patches.push({ f: (u, v) => new THREE.Vector3(X(u), Y(v), zf), nu: seg, nv: seg });
    if (sh.e.u) patches.push({ f: (u, v) => new THREE.Vector3(X(u), 0.5, zf + (zb - zf) * v), nu: seg, nv: nz });
    if (sh.e.d) patches.push({ f: (u, v) => new THREE.Vector3(X(u), -0.5, zb + (zf - zb) * v), nu: seg, nv: nz });
    if (sh.e.r) patches.push({ f: (u, v) => new THREE.Vector3(0.5, Y(u), zf + (zb - zf) * v), nu: seg, nv: nz });
    if (sh.e.l) patches.push({ f: (u, v) => new THREE.Vector3(-0.5, Y(u), zb + (zf - zb) * v), nu: seg, nv: nz });
  } else {
    const r = sh.kind === 'slope-r';
    // triângulo abaixo da diagonal; u percorre x, v vai da base até a diagonal
    patches.push({
      f: (u, v) => {
        const x = -0.5 - (r ? 0 : E) + u * (1 + E);
        const top = r ? x : -x;
        return new THREE.Vector3(x, -0.5 - E + (top + 0.5 + E) * v, zf);
      },
      nu: seg, nv: seg,
    });
    patches.push({ f: (u, v) => { const x = -0.5 - (r ? 0 : E) + u * (1 + E); return new THREE.Vector3(x, r ? x : -x, zf + (zb - zf) * v); }, nu: seg, nv: nz });
  }
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], colr: number[] = [], idx: number[] = [];
  const uvs = st.uv ?? 2;
  for (const P of patches) {
    const base = pos.length / 3;
    for (let j = 0; j <= P.nv; j++) for (let i = 0; i <= P.nu; i++) {
      const p0 = P.f(i / P.nu, j / P.nv);
      const s = surf(sh, st, p0);
      const n = surfNormal(sh, st, p0, s.n0);
      pos.push(s.pos.x, s.pos.y, s.pos.z);
      nor.push(n.x, n.y, n.z);
      const upish = Math.abs(s.n0.y) > 0.7;
      uv.push((s.pos.x + 0.5) * uvs, upish ? (s.pos.z + 0.5) * uvs : (s.pos.y + 0.5) * uvs);
      const c = st.color(s.pos, n, s.nz, s.tf, s.depth);
      colr.push(c.r, c.g, c.b);
    }
    const W = P.nu + 1;
    for (let j = 0; j < P.nv; j++) for (let i = 0; i < P.nu; i++) {
      const a = base + j * W + i, b = a + 1, c = a + W, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  g.setIndex(idx);
  // garante orientação para fora: triângulos cuja normal geométrica discorda da normal do vértice são invertidos
  fixWinding(g);
  return g;
}

function fixWinding(g: THREE.BufferGeometry) {
  const idx = g.getIndex()!;
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const n = g.getAttribute('normal') as THREE.BufferAttribute;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    const a = idx.getX(t), b = idx.getX(t + 1), c = idx.getX(t + 2);
    A.fromBufferAttribute(p, a); B.fromBufferAttribute(p, b); C.fromBufferAttribute(p, c);
    const fn = B.sub(A).cross(C.sub(A));
    N.fromBufferAttribute(n, a);
    if (fn.dot(N) < 0) { idx.setX(t + 1, c); idx.setX(t + 2, b); }
  }
}

/** Ponto na superfície do topo (para plantar grama/coral). u ∈ [0,1) ao longo do tile, w ∈ [0,1] da frente ao fundo. */
export function topPoint(sh: Shape, st: BodyStyle, u: number, w: number) {
  const x = -0.5 + u;
  const z = st.zf + (st.zb - st.zf) * w;
  const y = sh.kind === 'box' ? 0.5 : sh.kind === 'slope-r' ? x : -x;
  const p0 = new THREE.Vector3(x, y, z);
  const s = surf(sh, st, p0);
  return { pos: s.pos, n: surfNormal(sh, st, p0, s.n0) };
}
/** Ponto na face frontal (x,y em coordenadas do tile). */
export function frontPoint(sh: Shape, st: BodyStyle, x: number, y: number) {
  const p0 = new THREE.Vector3(x, y, st.zf);
  const s = surf(sh, st, p0);
  return { pos: s.pos, n: surfNormal(sh, st, p0, s.n0), tf: s.tf };
}
/** Ponto na face de baixo (teto). */
export function bottomPoint(sh: Shape, st: BodyStyle, u: number, w: number) {
  const p0 = new THREE.Vector3(-0.5 + u, -0.5, st.zf + (st.zb - st.zf) * w);
  const s = surf(sh, st, p0);
  return { pos: s.pos, n: surfNormal(sh, st, p0, s.n0) };
}
/** Ponto numa face lateral exposta. side = 1 direita, -1 esquerda. */
export function sidePoint(sh: Shape, st: BodyStyle, side: 1 | -1, v: number, w: number) {
  const p0 = new THREE.Vector3(0.5 * side, -0.5 + v, st.zf + (st.zb - st.zf) * w);
  const s = surf(sh, st, p0);
  return { pos: s.pos, n: surfNormal(sh, st, p0, s.n0) };
}
