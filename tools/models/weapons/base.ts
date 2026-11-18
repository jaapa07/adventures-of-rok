/**
 * Fábrica das armas de mão. Cada arma é esculpida no "espaço da mão": empunhadura na origem, objeto apontando +X,
 * frente para +Z. A fábrica cria a hierarquia root → spin → w → peças e gera as animações do contrato:
 *  - mundo   (1 quadro, deitada no chão, centrada no pivot)
 *  - mao     (1 quadro, pose de repouso: pivot = empunhadura)
 *  - voando  (8 quadros girando em torno do centro, loop)
 *  - quebrar (8 quadros, peças se separando)
 */
import { Rig, THREE, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { AnimSet, Key } from '../../render/anim';
import { breakKeys, type Piece } from '../props/kit';

export interface WeaponCtx {
  r: Rig;
  /** Cria (ou reaproveita) uma peça quebrável e anexa as malhas. */
  piece(name: string, ...objs: THREE.Object3D[]): void;
}

export interface WeaponSpec {
  id: string;
  build(ctx: WeaponCtx): void;
  /** Animações extras (ou sobrescritas). Recebe a geometria medida. */
  extra?(m: Measure): AnimSet;
  /** Chaves somadas a todas as animações padrão (ex.: esconder o guarda-chuva aberto). */
  baseKeys?: Record<string, Key[]>;
  /** Inclinação no chão (graus em Z) para a pose `mundo`. */
  restTilt?: number;
  presets?: ModelDef['presets'];
  /** Força as peças a girar menos/mais na quebra. */
  spin?: number;
  /** Escala geral da arma (proporção com a mão da Tamá). Padrão 1.5. */
  scale?: number;
}

export interface Measure { cx: number; cy: number; minY: number; maxY: number; minX: number; maxX: number; radius: number; centers: Record<string, V3> }

function makeRig(spec: WeaponSpec) {
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bone('w', 'spin');
  const names: string[] = [];
  const ctx: WeaponCtx = {
    r,
    piece(name, ...objs) {
      const b = `pc_${name}`;
      if (!r.bones[b]) { r.bone(b, 'w'); names.push(name); }
      r.add(b, ...objs);
    },
  };
  spec.build(ctx);
  return { r, names };
}

/** Rig final: a escala vai no osso raiz (não animado), então as medidas sem escala continuam válidas no espaço de `w`. */
function scaledRig(spec: WeaponSpec) {
  const { r } = makeRig(spec);
  r.root.scale.setScalar(spec.scale ?? 1.5);
  return r;
}

function measure(spec: WeaponSpec): Measure & { names: string[] } {
  const { r, names } = makeRig(spec);
  r.root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const centers: Record<string, V3> = {};
  for (const n of names) {
    const b = new THREE.Box3().setFromObject(r.bones[`pc_${n}`]);
    const c = b.getCenter(new THREE.Vector3());
    centers[n] = [c.x, c.y, c.z];
    box.union(b);
  }
  const c = box.getCenter(new THREE.Vector3());
  const s = box.getSize(new THREE.Vector3());
  return { cx: c.x, cy: c.y, minY: box.min.y, maxY: box.max.y, minX: box.min.x, maxX: box.max.x, radius: Math.hypot(s.x, s.y) / 2, centers, names };
}

function compute(spec: WeaponSpec) {
  const m = measure(spec);
  const base = spec.baseKeys ?? {};
  const pieces: Piece[] = m.names.map((n, i) => {
    const [x, y, z] = m.centers[n];
    const dx = x - m.cx, dy = y - m.cy;
    const len = Math.hypot(dx, dy) || 1;
    const k = 0.35 + (i % 3) * 0.08;
    const sp = spec.spin ?? 1;
    return {
      bone: `pc_${n}`,
      dir: [(dx / len) * k + (i % 2 ? 0.06 : -0.06), (dy / len) * k * 0.4, z * 0.5 + (i % 2 ? 0.12 : -0.08)],
      spin: [(i % 2 ? 90 : -70) * sp, (i * 47 % 90 - 45) * sp, (dx >= 0 ? -1 : 1) * (160 + i * 40) * sp],
      up: 0.18 + (i % 3) * 0.07,
      fall: -0.35,
      shrink: 0.55,
      delay: (i % 3) * 0.03,
    };
  });
  const centerP: V3 = [-m.cx, -m.cy, 0];
  const tilt = spec.restTilt ?? 0;
  const anims: AnimSet = {
    mundo: { frames: 1, loop: false, keys: { ...base, w: [{ t: 0, p: [-m.cx, -m.minY + 0.005, 0], r: [0, 0, tilt] }] } },
    mao: { frames: 1, loop: false, keys: { ...base } },
    voando: { frames: 8, loop: true, keys: { ...base, w: [{ t: 0, p: centerP }], spin: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, 0, -360], e: 'linear' }] } },
    quebrar: { frames: 8, loop: false, keys: { ...base, w: [{ t: 0, p: centerP }], ...breakKeys(pieces, { pop: 0.06 }) } },
    ...(spec.extra?.(m) ?? {}),
  };
  const k = spec.scale ?? 1.5;
  const reach = Math.max(m.radius + 0.12, m.maxX + 0.06, -m.minX + 0.06, m.maxY + 0.06, -m.minY + 0.06, 0.55) * k;
  const W = Math.ceil((reach * 2 * 104) / 16) * 16;
  return { anims, W };
}

/** As animações e a célula dependem de medir a malha; calculadas sob demanda (depois das texturas carregadas). */
export function makeWeapon(spec: WeaponSpec): ModelDef {
  let c: ReturnType<typeof compute> | null = null;
  const get = () => (c ??= compute(spec));
  const def = {
    id: `arma-${spec.id}`,
    kind: 'weapon' as const,
    build: () => scaledRig(spec),
    ss: 3,
    presets: spec.presets ?? (['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'] as ModelDef['presets']),
    shadow: false,
  };
  Object.defineProperties(def, {
    anims: { get: () => get().anims, enumerable: true },
    cell: { get: () => [get().W, get().W], enumerable: true },
    pivot: { get: () => [get().W / 2, get().W / 2], enumerable: true },
    height: { get: () => get().W / 104, enumerable: true },
  });
  return def as unknown as ModelDef;
}
