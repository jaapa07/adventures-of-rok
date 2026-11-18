/**
 * NINHO DO REENCONTRO — bola de gravetos trançados à mão (anéis e meridianos), com folhas presas,
 * uma pena vermelha, fitas de embira e um medalhão de coração entalhado e dourado na frente.
 * Quebrar: gravetos se espalham em 8 setores, a tampa salta e o miolo escuro some.
 */
import { Rig, blob, tube, slab, mat, wobble, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { breakKeys, still, leaf, rope, type Piece, lazyAnims } from './kit';

const A = 0.52, B = 0.44, CY = 0.44, SECT = 8;

function ell(u: number, v: number, k = 1): V3 {
  // u = ângulo em torno de Y (graus), v = latitude (graus)
  const ur = (u * Math.PI) / 180, vr = (v * Math.PI) / 180;
  const wob = 1 + Math.sin(u * 0.21 + v * 0.13) * 0.025;
  return [Math.sin(ur) * Math.cos(vr) * A * k * wob, Math.sin(vr) * B * k * wob, Math.cos(ur) * Math.cos(vr) * A * k * wob];
}

function build() {
  const r = new Rig('root');
  const twigs = [mat('bark', 0x7a5432, { repeat: 4 }), mat('bark', 0x9a7046, { repeat: 4 }), mat('bark', 0x5e3e22, { repeat: 4 }), mat('wood', 0xb08a58)];
  const core = mat('earth', 0x2a1a10);
  const leafM = mat('leaf', 0x4a8a2e);
  const leafM2 = mat('leaf', 0x7aa83a);
  const gold = mat('metal', 0xf0b83a, { metal: 0.55, rough: 0.3, emissive: 0xff9a20, emissiveIntensity: 0.2 });
  const feather = mat('skin', 0xd8302a, { rough: 0.5 });
  const fiber = mat('cloth', 0xd8c088, { repeat: 6 });

  r.bone('body', 'root', [0, CY, 0]);
  r.bone('core', 'body');
  r.bone('lid', 'body', [0, B * 0.82, 0]);
  r.add('core', blob([A * 0.9, B * 0.88, A * 0.9], core, { deform: [wobble(0.01)], seg: 28 }));

  const pieces: Piece[] = [];
  for (let s = 0; s < SECT; s++) {
    const b = `s${s}`;
    r.bone(b, 'body');
    const u0 = s * (360 / SECT), u1 = u0 + 360 / SECT + 6;
    // anéis horizontais (latitudes), cada um com leve ondulação de trançado
    for (let j = 0; j < 7; j++) {
      const v = -62 + j * 18;
      const pts: V3[] = [];
      for (let k = 0; k <= 6; k++) {
        const u = u0 + ((u1 - u0) * k) / 6;
        const pr = ell(u, v + Math.sin(k * 1.6 + j) * 3, 1 + ((k + j) % 2) * 0.02);
        pts.push(pr);
      }
      r.add(b, tube(pts, 0.022 - (j % 3) * 0.003, twigs[(j + s) % 4], { seg: 18, radial: 7 }));
    }
    // meridiano diagonal
    const md: V3[] = [];
    for (let k = 0; k <= 6; k++) md.push(ell(u0 + k * 6, -70 + k * 22, 1.03));
    r.add(b, tube(md, 0.016, twigs[(s + 2) % 4], { seg: 18, radial: 7 }));
    // graveto solto espetado
    if (s % 2 === 0) {
      const p0 = ell(u0 + 20, 10 + (s % 3) * 15, 1.02);
      const p1 = ell(u0 + 35, 25 + (s % 3) * 15, 1.25);
      r.add(b, tube([p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 0.02, (p0[2] + p1[2]) / 2], p1], (t) => 0.014 * (1 - t * 0.6), twigs[s % 4], { seg: 10, radial: 6 }));
    }
    // folhas presas
    if (s % 3 !== 1) {
      const p = ell(u0 + 25, -20 + (s % 4) * 12, 1.02);
      r.add(b, leaf(0.16, 0.08, s % 2 ? leafM : leafM2, { pos: p, rot: [0, u0 + 25, 40 - s * 20] }));
    }
    const um = ((u0 + 22) * Math.PI) / 180;
    pieces.push({ bone: b, dir: [Math.sin(um) * 0.9, -0.1, Math.cos(um) * 0.4], spin: [Math.cos(um) * 120, 80 - s * 20, -Math.sin(um) * 160], up: 0.25 + (s % 3) * 0.1, fall: -CY + 0.05, shrink: 0.6, delay: (s % 4) * 0.015 });
  }
  // tampa trançada em espiral
  const spiral: V3[] = [];
  for (let k = 0; k <= 40; k++) {
    const a = k * 0.62, rr = 0.03 + k * 0.0068;
    spiral.push([Math.sin(a) * rr, 0.07 - k * 0.0018 + Math.sin(k * 1.3) * 0.005, Math.cos(a) * rr]);
  }
  r.add('lid', tube(spiral, 0.02, twigs[1], { seg: 140, radial: 7 }), blob([0.05, 0.035, 0.05], twigs[2], { pos: [0, 0.08, 0], seg: 14 }));
  // pena vermelha espetada na tampa
  r.add('lid',
    tube([[0.05, 0.05, 0], [0.1, 0.2, 0.02], [0.12, 0.34, 0.03]], 0.006, mat('shell', 0xf4e4c4)),
    slab([[0, 0], [0.04, 0.06], [0.05, 0.16], [0.03, 0.26], [0, 0.3], [-0.02, 0.2], [-0.025, 0.08]], 0.012, feather, { pos: [0.06, 0.05, 0.02], rot: [0, 10, -18] }),
  );
  // medalhão de coração na frente, preso por embira
  const heart = slab([[0, -0.1], [0.07, -0.03], [0.1, 0.03], [0.08, 0.08], [0.04, 0.09], [0, 0.05], [-0.04, 0.09], [-0.08, 0.08], [-0.1, 0.03], [-0.07, -0.03]], 0.03, gold, { pos: [0.1, 0.02, A + 0.02], rot: [0, 12, 0] });
  r.add('s0', heart,
    rope([[-0.05, 0.16, A - 0.06], [0.04, 0.12, A + 0.01], [0.1, 0.09, A + 0.02]], 0.01, fiber, { twists: 5 }),
    rope([[0.25, 0.16, A - 0.1], [0.17, 0.12, A + 0.0], [0.1, 0.09, A + 0.02]], 0.01, fiber, { twists: 5 }),
    blob([0.03, 0.03, 0.012], mat('glow', 0xfff0a0), { pos: [0.08, 0.04, A + 0.045], castShadow: false }),
  );
  pieces.push({ bone: 'lid', dir: [0.1, 0.5, 0.05], spin: [30, 200, 120], up: 0.3, fall: -0.7, shrink: 0.7 });
  return { r, pieces };
}

export const ninho: ModelDef = lazyAnims({
  id: 'ninho',
  kind: 'prop',
  build: () => build().r,
  cell: [256, 192],
  pivot: [128, 176],
  height: 192 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
} as Omit<ModelDef, 'anims'>, () => {
  const { pieces } = build();
  return {
    idle: {
      frames: 24, loop: true, keys: {
        body: [{ t: 0, r: [0, 0, 0], s: 1 }, { t: 0.08, r: [0, 0, 3], s: [1.02, 0.98, 1.02] }, { t: 0.16, r: [0, 0, -3] }, { t: 0.24, r: [0, 0, 2] }, { t: 0.32, r: [0, 0, 0], s: 1 }, { t: 1, r: [0, 0, 0], s: 1 }],
      },
    },
    quebrar: { frames: 12, loop: false, keys: { ...breakKeys(pieces, { shake: 'body', pop: 0.12 }), core: [{ t: 0, s: 1 }, { t: 0.12, s: 1 }, { t: 0.3, s: 0.01, e: 'in' }] } },
  };
}) as ModelDef;
