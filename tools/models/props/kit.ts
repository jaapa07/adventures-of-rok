/**
 * Kit de escultura compartilhado por objetos, armas, coletáveis e efeitos.
 * Funções pequenas que repetem padrões: cascas em gomos (para quebrar), cordas, pregos,
 * estrelas de brilho, chaves de quebra e giro. Tudo determinístico (sem aleatoriedade).
 */
import { THREE, blob, tube, slab, lathe, spike, mat, D2R, type V3, type V2, type PartOpts, type Deformer, applyDeform } from '../../render/sculpt';
import type { Key, Anim } from '../../render/anim';

const dblCache = new Map<THREE.Material, THREE.Material>();
/** Versão dupla-face de um material (cascas abertas, lascas, folhas finas). */
export function dbl<M extends THREE.Material>(m: M): M {
  const hit = dblCache.get(m);
  if (hit) return hit as M;
  const c = m.clone();
  c.side = THREE.DoubleSide;
  // o clone perde o onBeforeCompile? Não: clone() copia a referência da função.
  (c as THREE.Material).onBeforeCompile = m.onBeforeCompile;
  (c as THREE.Material).customProgramCacheKey = m.customProgramCacheKey;
  dblCache.set(m, c);
  return c as M;
}

/** Gomo de torno (fatia angular) — usado para cascas que se partem em pedaços. phi em graus. */
export function wedge(profile: V2[], material: THREE.Material, phi0: number, phiLen: number, o: PartOpts & { seg?: number } = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), o.seg ?? 10, phi0 * D2R, phiLen * D2R);
  applyDeform(g, o.deform ?? []);
  const m = new THREE.Mesh(g, dbl(material));
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R);
  if (o.scale !== undefined) typeof o.scale === 'number' ? m.scale.setScalar(o.scale) : m.scale.set(...o.scale);
  if (o.name) m.name = o.name;
  m.castShadow = o.castShadow ?? true;
  m.receiveShadow = true;
  return m;
}

/** Estrela de N pontas (brilhos, faíscas). Deitada no plano XY, espessura `depth`. */
export function star(n: number, rOut: number, rIn: number, depth: number, material: THREE.Material, o: PartOpts & { bevel?: number } = {}) {
  const pts: V2[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? rOut : rIn;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return slab(pts, depth, material, { smooth: false, bevel: o.bevel ?? depth * 0.4, ...o });
}

/** Cintilação de 4 pontas fina (reflexo/brilho). */
export function sparkle(size: number, material: THREE.Material, o: PartOpts = {}) {
  const s = size, k = size * 0.16;
  return slab([[0, s], [k, k], [s, 0], [k, -k], [0, -s], [-k, -k], [-s, 0], [-k, k]], size * 0.05, material, { smooth: false, bevel: size * 0.03, castShadow: false, ...o });
}

/** Corda torcida: dois fios entrelaçados ao longo de uma curva. */
export function rope(points: V3[], r: number, material: THREE.Material, o: PartOpts & { twists?: number } = {}) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const tw = o.twists ?? Math.max(4, Math.round(curve.getLength() / (r * 5)));
  for (let k = 0; k < 2; k++) {
    const pts: V3[] = [];
    const N = Math.max(12, tw * 6);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3(0, 0, 1).cross(tan);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      const up = tan.clone().cross(side).normalize();
      const a = t * tw * Math.PI * 2 + k * Math.PI;
      p.addScaledVector(side, Math.cos(a) * r * 0.45).addScaledVector(up, Math.sin(a) * r * 0.45);
      pts.push([p.x, p.y, p.z]);
    }
    g.add(tube(pts, r * 0.62, material, { seg: N * 2, radial: 8 }));
  }
  if (o.pos) g.position.set(...o.pos);
  if (o.rot) g.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R);
  return g;
}

/** Prego/rebite de cabeça abaulada (aponta para +Z por padrão). */
export function nail(r: number, material: THREE.Material, o: PartOpts = {}) {
  return blob([r, r, r * 0.5], material, { seg: 14, ...o });
}

/** Folha simples com nervura (contorno lanceolado). Base na origem, ponta em +Y. */
export function leaf(len: number, wid: number, material: THREE.Material, o: PartOpts & { curl?: number } = {}) {
  const w = wid / 2;
  const curl = o.curl ?? 0.25;
  const deform: Deformer[] = [(p) => { const t = p.y / len; p.z += Math.sin(t * Math.PI) * curl * wid * 0.6 - Math.abs(p.x) * curl * 1.2; }, ...(o.deform ?? [])];
  return slab([[0, 0], [w * 0.8, len * 0.2], [w, len * 0.5], [w * 0.55, len * 0.82], [0, len], [-w * 0.55, len * 0.82], [-w, len * 0.5], [-w * 0.8, len * 0.2]], Math.max(0.004, wid * 0.04), dbl(material), { ...o, deform, bevel: Math.max(0.002, wid * 0.02) });
}

/* ------------------------- animação ------------------------- */

/** Animação de 1 quadro sem movimento (pose de repouso) ou com uma pose fixa. */
export function still(keys: Record<string, Key[]> = {}): Anim {
  return { frames: 1, loop: false, keys };
}

export interface Piece { bone: string; dir: V3; spin: V3; up?: number; fall?: number; shrink?: number; delay?: number }

/**
 * Chaves de "quebrar": cada pedaço sai na direção `dir`, sobe (`up`), cai (`fall`), gira (`spin`) e encolhe.
 * Trajetória em arco: 0 → pico (t≈0.35) → chão. `pre` = tremida antes de estourar (osso opcional).
 */
export function breakKeys(pieces: Piece[], o: { shake?: string; pop?: number } = {}): Record<string, Key[]> {
  const out: Record<string, Key[]> = {};
  const pop = o.pop ?? 0.12;
  for (const pc of pieces) {
    const d = pc.delay ?? 0;
    const t0 = pop + d;
    const up = pc.up ?? 0.25;
    const fall = pc.fall ?? -0.15;
    const sh = pc.shrink ?? 0.15;
    // trajetória balística amostrada: x/z lineares, y = subida parabólica + queda final
    const keys: Key[] = [{ t: 0, p: [0, 0, 0], r: [0, 0, 0], s: 1 }, { t: t0, p: [0, 0, 0], r: [0, 0, 0], s: 1 }];
    const M = 8;
    for (let i = 1; i <= M; i++) {
      const u = i / M;
      const t = t0 + (1 - t0) * u;
      const y = pc.dir[1] * u + up * 4 * u * (1 - u) + fall * u * u;
      const su = u < 0.7 ? 1 : 1 + (sh - 1) * ((u - 0.7) / 0.3);
      keys.push({ t, e: 'linear', p: [pc.dir[0] * (1 - (1 - u) ** 1.6), y, pc.dir[2] * (1 - (1 - u) ** 1.6)], r: pc.spin.map((v) => v * u) as V3, s: su });
    }
    out[pc.bone] = keys;
  }
  if (o.shake) {
    out[o.shake] = [
      { t: 0, r: [0, 0, 0], s: 1 },
      { t: pop * 0.35, r: [0, 0, 6], s: [1.06, 0.94, 1.06] },
      { t: pop * 0.7, r: [0, 0, -6], s: [0.96, 1.05, 0.96] },
      { t: pop, r: [0, 0, 0], s: [1.08, 0.92, 1.08] },
      { t: Math.min(1, pop + 0.08), r: [0, 0, 0], s: 1 },
    ];
  }
  return out;
}

/** Giro contínuo em Y (coletáveis). */
export function spinKeys(bone: string, axis: 'x' | 'y' | 'z' = 'y', deg = 360): Key[] {
  const r = (v: number): V3 => (axis === 'x' ? [v, 0, 0] : axis === 'y' ? [0, v, 0] : [0, 0, v]);
  return [{ t: 0, r: r(0) }, { t: 1, r: r(deg), e: 'linear' }];
}

/** Ciclo senoidal amostrado (loops suaves): gera chaves com f(t) para p/r/s. */
export function wave(n: number, f: (t: number) => Partial<Pick<Key, 'p' | 'r' | 's'>>): Key[] {
  return Array.from({ length: n + 1 }, (_, i) => ({ t: i / n, e: 'linear' as const, ...f(i / n) }));
}

export { blob, tube, slab, lathe, spike, mat, THREE };
export type { V3, V2 };

/** Agrupa objetos com posição/rotação (graus) — útil para orientar peças em leque. */
export function grp(children: THREE.Object3D[], pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], scale?: number | V3) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.rotation.set(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R, 'YXZ');
  if (scale !== undefined) typeof scale === 'number' ? g.scale.setScalar(scale) : g.scale.set(...scale);
  for (const c of children) g.add(c);
  return g;
}

/**
 * Folha em fita que arqueia para fora (bromélias, coroas, capim). Base na origem, cresce em +Y e cai para +Z.
 * `arch` = quanto a ponta tomba (em unidades).
 */
export function strap(len: number, wid: number, material: THREE.Material, o: PartOpts & { arch?: number; tip?: number } = {}) {
  const w = wid / 2, tip = o.tip ?? 0.12;
  const arch = o.arch ?? len * 0.4;
  const deform: Deformer[] = [(p) => {
    const t = Math.max(0, p.y / len);
    // calha (seção em V) + arco
    p.z += -Math.abs(p.x) * 0.5 + arch * t * t;
    p.y -= arch * 0.35 * t * t * t;
  }, ...(o.deform ?? [])];
  return slab([[-w, 0], [w, 0], [w * 0.95, len * 0.45], [w * 0.6, len * (1 - tip * 2)], [0, len], [-w * 0.6, len * (1 - tip * 2)], [-w * 0.95, len * 0.45]], Math.max(0.006, wid * 0.08), dbl(material), { ...o, deform, bevel: Math.max(0.003, wid * 0.03) });
}

/** Ciclo de respiração genérico para objetos vivos. */
export function sway(bone: string, n: number, amp: number, axis: 0 | 1 | 2 = 2, sc = 0): Key[] {
  return wave(n, (t) => {
    const r: V3 = [0, 0, 0];
    r[axis] = Math.sin(t * Math.PI * 2) * amp;
    const k: Partial<Key> = { r };
    if (sc) k.s = [1 + Math.sin(t * Math.PI * 2) * sc * 0.5, 1 + Math.sin(t * Math.PI * 2 + Math.PI) * sc, 1 + Math.sin(t * Math.PI * 2) * sc * 0.5];
    return k;
  });
}

const addCache = new Map<THREE.Material, THREE.Material>();
/** Versão aditiva (halos, clarões, raios de luz): soma luz sem escurecer o fundo. */
export function additive<M extends THREE.Material>(m: M): M {
  const hit = addCache.get(m);
  if (hit) return hit as M;
  const c = m.clone();
  c.blending = THREE.AdditiveBlending;
  c.transparent = true;
  c.depthWrite = false;
  addCache.set(m, c);
  return c as M;
}

/**
 * Animações calculadas sob demanda. Necessário quando as chaves dependem de construir o modelo (peças de quebra):
 * construir no carregamento do módulo criaria materiais antes das texturas existirem.
 */
export function lazyAnims<T extends object>(def: T, f: () => import('../../render/anim').AnimSet): T & { anims: import('../../render/anim').AnimSet } {
  let cache: import('../../render/anim').AnimSet | null = null;
  Object.defineProperty(def, 'anims', { get: () => (cache ??= f()), enumerable: true, configurable: true });
  return def as T & { anims: import('../../render/anim').AnimSet };
}
