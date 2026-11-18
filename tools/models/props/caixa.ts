/**
 * CAIXA DA MONTARIA — caixote de tábuas pregadas, cantoneiras de ferro, corda de amarração e um painel frontal
 * com o rosto da montaria entalhado em relevo e tingido (pirarucu, ema ou tatu). Quebrar: as tábuas voam.
 */
import { Rig, blob, tube, slab, roundBox, ring, mat, wobble, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, nail, rope, breakKeys, still, type Piece, lazyAnims } from './kit';

const S = 0.9; // aresta
const H = S / 2;

function plankFace(woodA: THREE_M, woodB: THREE_M, iron: THREE_M, nailM: THREE_M, brace: boolean) {
  const rows: THREE_O[][] = [[], [], []];
  for (let i = 0; i < 3; i++) {
    const y = -S / 3 + i * (S / 3);
    const parts = rows[i];
    parts.push(roundBox([S - 0.02, S / 3 - 0.02, 0.06], 0.018, i % 2 ? woodA : woodB, { pos: [0, y, 0], rot: [0, 0, (i - 1) * 0.6], deform: [wobble(0.004, 11)] }));
    for (const x of [-H + 0.06, H - 0.06]) parts.push(nail(0.014, nailM, { pos: [x, y, 0.035] }));
  }
  if (brace) rows[1].push(roundBox([S * 1.3, 0.09, 0.04], 0.012, woodB, { pos: [0, 0, 0.045], rot: [0, 0, 45] }));
  // cantoneiras de ferro
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const parts = rows[y < 0 ? 0 : 2];
    parts.push(slab([[0, 0], [0.13, 0], [0.13, 0.035], [0.035, 0.035], [0.035, 0.13], [0, 0.13]].map(([a, b]) => [a * -x, b * -y] as [number, number]), 0.012, iron, { pos: [x * (H - 0.005), y * (H - 0.005), 0.04], smooth: false, bevel: 0.004 }));
    parts.push(nail(0.012, nailM, { pos: [x * (H - 0.06), y * (H - 0.03), 0.052] }));
  }
  return rows;
}
type THREE_M = ReturnType<typeof mat>;
type THREE_O = ReturnType<typeof blob> | ReturnType<typeof grp>;

/** Relevos entalhados por montaria (no plano XY, frente +Z). */
export function relief(kind: string) {
  const carve = mat('wood', 0xd8a868, { rough: 0.6 });
  const dark = mat('wood', 0x3a2210);
  const white = mat('paint', 0xf4ecd8);
  const parts = [];
  // medalhão oval de fundo
  parts.push(slab(Array.from({ length: 16 }, (_, i) => [Math.cos((i / 16) * Math.PI * 2) * 0.34, Math.sin((i / 16) * Math.PI * 2) * 0.3] as [number, number]), 0.03, mat('wood', 0x6a4220), { smooth: true, bevel: 0.012 }));
  parts.push(ring(0.32, 0.012, mat('paint', 0xe8b040, { rough: 0.4 }), { scale: [1.04, 0.93, 1], pos: [0, 0, 0.02] }));
  if (kind === 'pirarucu') {
    const red = mat('paint', 0xc8402a, { rough: 0.5 });
    const fish = mat('paint', 0x6a8a6a, { rough: 0.55 });
    parts.push(slab([[-0.24, 0.0], [-0.12, 0.09], [0.08, 0.1], [0.2, 0.06], [0.25, 0.0], [0.2, -0.05], [0.08, -0.08], [-0.12, -0.07]], 0.03, fish, { pos: [0.02, 0, 0.03] }));
    parts.push(slab([[-0.2, 0], [-0.3, 0.1], [-0.28, 0], [-0.3, -0.1]], 0.025, red, { pos: [0, 0, 0.03], smooth: false }));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) parts.push(ring(0.025, 0.007, red, { pos: [-0.14 + i * 0.06, -0.025 + j * 0.05, 0.055], arc: 180, rot: [0, 0, -90] }));
    parts.push(blob([0.025, 0.025, 0.012], white, { pos: [0.17, 0.025, 0.06] }), blob([0.012, 0.012, 0.01], dark, { pos: [0.175, 0.025, 0.07] }));
    parts.push(tube([[0.24, -0.02, 0.055], [0.2, -0.035, 0.06], [0.15, -0.03, 0.055]], 0.006, dark));
  } else if (kind === 'ema') {
    const body = mat('paint', 0x9a8a72, { rough: 0.55 });
    const beak = mat('paint', 0xe8b040, { rough: 0.45 });
    parts.push(tube([[-0.1, -0.24, 0.04], [-0.06, -0.08, 0.04], [-0.06, 0.06, 0.04], [0.0, 0.14, 0.04]], (t) => 0.06 - t * 0.025, body));
    parts.push(blob([0.08, 0.06, 0.035], body, { pos: [0.04, 0.16, 0.045] }));
    parts.push(slab([[0, 0.015], [0.14, 0.0], [0, -0.02]], 0.02, beak, { pos: [0.1, 0.15, 0.05], smooth: false }));
    parts.push(blob([0.022, 0.022, 0.012], white, { pos: [0.06, 0.18, 0.08] }), blob([0.011, 0.011, 0.01], dark, { pos: [0.066, 0.18, 0.09] }));
    for (let i = 0; i < 3; i++) parts.push(slab([[0, 0], [0.03, 0.06], [-0.01, 0.1]], 0.012, body, { pos: [-0.02 - i * 0.03, 0.2, 0.04], rot: [0, 0, 30 + i * 15] }));
    parts.push(slab([[0, 0], [0.06, 0.02], [0.03, 0.06]], 0.012, mat('paint', 0x4a3a2a), { pos: [-0.08, -0.12, 0.06] }));
  } else {
    const shell = mat('paint', 0xb08a62, { rough: 0.55 });
    const band = mat('paint', 0x6a4a2a, { rough: 0.6 });
    parts.push(blob([0.2, 0.14, 0.04], shell, { pos: [-0.04, -0.04, 0.035], deform: [(p) => { if (p.y < -0.06) p.y = -0.06; }] }));
    for (let i = 0; i < 5; i++) parts.push(ring(0.14, 0.01, band, { pos: [-0.16 + i * 0.06, -0.06, 0.06], arc: 180, scale: [0.35, 0.9, 1] }));
    parts.push(blob([0.09, 0.05, 0.035], shell, { pos: [0.18, -0.03, 0.04], rot: [0, 0, -15], deform: [(p) => { if (p.x > 0) p.y *= 1 - p.x * 5; }] }));
    parts.push(slab([[0, 0], [0.025, 0.06], [-0.02, 0.05]], 0.012, shell, { pos: [0.13, 0.01, 0.05] }));
    parts.push(blob([0.014, 0.014, 0.01], dark, { pos: [0.17, -0.01, 0.075] }));
    parts.push(tube([[-0.24, -0.06, 0.04], [-0.3, -0.08, 0.04], [-0.32, -0.04, 0.04]], (t) => 0.025 - t * 0.015, band));
  }
  return parts;
}

function build(variant: string) {
  const kind = ['pirarucu', 'ema', 'tatu'].includes(variant) ? variant : 'pirarucu';
  const r = new Rig('root');
  const woodA = mat('wood', 0xa8743e, { repeat: 1.2 });
  const woodB = mat('wood', 0x8a5a2e, { repeat: 1.2 });
  const iron = mat('rust', 0x5a4a40, { metal: 0.5 });
  const nailM = mat('metal', 0x9a948a, { metal: 0.55, rough: 0.35 });
  const ropeM = mat('cloth', 0xc8a868, { repeat: 6 });
  const straw = mat('grass', 0xd8b860);

  r.bone('box', 'root', [0, H, 0]);
  r.bone('inner', 'box');
  r.add('inner', blob([H * 0.9, H * 0.9, H * 0.9], straw, { deform: [wobble(0.03, 9)], seg: 16 }));
  const faces: [string, V3, V3][] = [
    ['front', [0, 0, H], [0, 0, 0]],
    ['back', [0, 0, -H], [0, 180, 0]],
    ['right', [H, 0, 0], [0, 90, 0]],
    ['left', [-H, 0, 0], [0, -90, 0]],
    ['top', [0, H, 0], [-90, 0, 0]],
  ];
  const pieces: Piece[] = [];
  let k = 0;
  for (const [name, pos, rot] of faces) {
    const rows = plankFace(woodA, woodB, iron, nailM, name !== 'front' && name !== 'top');
    rows.forEach((row, i) => {
      const b = `${name}${i}`;
      r.bone(b, 'box');
      r.add(b, grp(row, pos, rot));
      const yy = (i - 1) * 0.3;
      const d: V3 = [pos[0] * 1.8 + (name === 'front' ? 0.3 : 0) + (i - 1) * 0.15, pos[1] * 0.6 + yy * 0.3, pos[2] * 0.8];
      pieces.push({ bone: b, dir: d, spin: [pos[2] * 300 + 40 * (i - 1), pos[0] * 160 - 60 + i * 40, -pos[0] * 300 + pos[2] * (120 - i * 90)], up: name === 'top' ? 0.3 : 0.12 + i * 0.1, fall: -H - yy + 0.05, shrink: 0.7, delay: (k++ % 4) * 0.012 });
    });
  }
  // painel entalhado na frente
  r.bone('face', 'box');
  r.add('face', grp(relief(kind), [0, 0, H + 0.065]));
  pieces.push({ bone: 'face', dir: [0.35, 0.05, 0.5], spin: [-80, 30, -250], up: 0.3, fall: -H + 0.05, shrink: 0.7, delay: 0.03 });
  // corda amarrando a caixa (no topo) com nó
  r.add('top1',
    rope([[-H - 0.01, H + 0.02, 0.0], [-0.2, H + 0.04, 0.0], [0.2, H + 0.04, 0.0], [H + 0.01, H + 0.02, 0]], 0.022, ropeM, { twists: 12 }),
    blob([0.045, 0.035, 0.045], ropeM, { pos: [0.08, H + 0.05, 0.0] }),
    rope([[0.08, H + 0.05, 0.03], [0.14, H + 0.02, 0.12], [0.16, H - 0.06, 0.2]], 0.016, ropeM, { twists: 4 }),
    // palha escapando
    ...[0, 1, 2, 3].map((i) => tube([[-0.2 + i * 0.1, H, 0.3 - i * 0.05], [-0.22 + i * 0.1, H + 0.06, 0.34 - i * 0.04], [-0.26 + i * 0.12, H + 0.09, 0.36 - i * 0.05]], 0.006, straw, { seg: 8, radial: 5 })),
  );
  return { r, pieces };
}

export const caixaMontaria: ModelDef = lazyAnims({
  id: 'caixa-montaria',
  kind: 'prop',
  build: (v) => build(v).r,
  cell: [288, 192],
  pivot: [144, 176],
  height: 192 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
  variants: ['base', 'pirarucu', 'ema', 'tatu'],
} as Omit<ModelDef, 'anims'>, () => {
  const { pieces } = build('pirarucu');
  return {
    idle: {
      frames: 24, loop: true, keys: {
        box: [{ t: 0, r: [0, 0, 0], s: 1 }, { t: 0.7, r: [0, 0, 0], s: 1 }, { t: 0.76, r: [0, 0, 3], s: [1.02, 0.97, 1.02] }, { t: 0.82, r: [0, 0, -2] }, { t: 0.88, r: [0, 0, 1], s: 1 }, { t: 1, r: [0, 0, 0] }],
      },
    },
    quebrar: { frames: 12, loop: false, keys: { ...breakKeys(pieces, { shake: 'box', pop: 0.1 }), inner: [{ t: 0, s: 1, p: [0, 0, 0] }, { t: 0.1, s: 1 }, { t: 0.35, s: [1.2, 0.5, 1.2], p: [0, -0.2, 0] }, { t: 1, s: [1.3, 0.18, 1.3], p: [0, -H + 0.04, 0] }] } },
  };
}) as ModelDef;
