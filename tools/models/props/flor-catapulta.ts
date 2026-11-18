/**
 * FLOR-CATAPULTA — planta carnívora gigante. Vagem-boca roxa com nervuras verdes e cílios de néctar (como uma drósera),
 * coroa de pétalas, caule grosso segmentado e folhas-pá no chão. Engole o herói e o dispara.
 */
import { Rig, blob, tube, spike, lathe, mat, flattenBelow, wobble } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, strap, wave, leaf } from './kit';

/** Metade da vagem-boca: casca roxa com nervuras verdes, lábio lima e cílios com gotas de néctar (como uma drósera). */
function jaw(top: boolean) {
  const sgn = top ? 1 : -1;
  const skin = mat('skin', 0x6a3a9a, { rough: 0.5 });
  const vein = mat('skin', 0x8ac83a, { rough: 0.55 });
  const lip = mat('skin', 0xc8e05a, { rough: 0.45 });
  const mouth = mat('skin', 0xe8607a, { rough: 0.3 });
  const nectar = mat('glow', 0xffe070, { emissiveIntensity: 0.6 });
  const cilia = mat('skin', 0x9ad04a, { rough: 0.5 });
  const pod = (p: { x: number; y: number; z: number }) => {
    // vagem: ponta afilada para a frente e base mais cheia
    const t = (p.x + 0.44) / 0.88;
    const k = 1 - Math.max(0, t - 0.55) * 1.1;
    p.y *= k; p.z *= k;
  };
  const parts = [
    blob([0.44, 0.3, 0.34], skin, { pos: [0.36, 0, 0], deform: [(p) => { p.y *= sgn; }, flattenBelow(0.0), (p) => { p.y *= sgn; }, pod, wobble(0.006)], seg: 40 }),
    blob([0.43, 0.035, 0.33], lip, { pos: [0.36, sgn * 0.008, 0], deform: [pod], seg: 36 }),
    blob([0.4, 0.012, 0.3], mouth, { pos: [0.36, sgn * -0.03, 0], deform: [pod], seg: 30, castShadow: false }),
  ];
  // nervuras: arcos que descem da crista até o lábio
  for (let i = 0; i < 7; i++) {
    const ur = ((22 + i * 22) * Math.PI) / 180;
    const pts: [number, number, number][] = [];
    for (let k = 0; k <= 8; k++) {
      const vr = ((10 + k * 9.5) * Math.PI) / 180;
      const p = { x: Math.cos(ur) * Math.cos(vr) * 0.445, y: Math.sin(vr) * 0.302 * sgn, z: Math.sin(ur) * Math.cos(vr) * 0.345 };
      pod(p);
      pts.push([p.x + 0.36, p.y, p.z]);
    }
    parts.push(tube(pts, (t) => 0.012 * (1 - t * 0.6), vein, { seg: 20, radial: 6 }));
  }
  // cílios com gotas de néctar ao redor do lábio
  for (let i = 0; i < 13; i++) {
    const ar = ((-84 + i * 14) * Math.PI) / 180;
    const p = { x: Math.cos(ar) * 0.43, y: 0, z: Math.sin(ar) * 0.33 };
    pod(p);
    const x = p.x + 0.36, z = p.z;
    const ox = Math.cos(ar) * 0.05, oz = Math.sin(ar) * 0.05;
    const len = 0.07 + (i % 3) * 0.025;
    parts.push(tube([[x, 0, z], [x + ox, sgn * len * 0.6, z + oz], [x + ox * 1.6, sgn * len, z + oz * 1.6]], 0.008, cilia, { seg: 10, radial: 6 }));
    parts.push(blob([0.018, 0.018, 0.018], nectar, { pos: [x + ox * 1.6, sgn * len, z + oz * 1.6], seg: 10, castShadow: false }));
  }
  if (!top) parts.push(tube([[0.1, -0.02, 0], [0.3, 0.02, 0], [0.45, 0.0, 0.0]], (t) => 0.08 * (1 - t * 0.5), mat('skin', 0xc04060, { rough: 0.3 }), { scale: [1, 0.5, 1.3] }));
  return parts;
}

function build() {
  const r = new Rig('root');
  const stem = mat('skin', 0x3e8a3a, { rough: 0.55 });
  const stemDark = mat('skin', 0x2a5e28, { rough: 0.6 });
  const leafM = mat('leaf', 0x4a9a34);
  const leafM2 = mat('leaf', 0x3a7a2a);
  const petal = mat('leaf', 0xff8a3a, { rough: 0.45 });
  const petal2 = mat('leaf', 0xffc040, { rough: 0.45 });
  const soil = mat('earth', 0x4a3220);

  r.bone('stem1', 'root', [0, 0.1, 0]);
  r.bone('stem2', 'stem1', [0.05, 0.42, 0], [0, 0, 8]);
  r.bone('head', 'stem2', [-0.03, 0.42, 0], [0, 0, -14]);
  r.bone('jawTop', 'head', [-0.18, 0.02, 0]);
  r.bone('jawBot', 'head', [-0.18, -0.02, 0]);
  r.bone('leaves', 'root', [0, 0.02, 0]);

  // base: torrão, raízes e folhas-pá
  r.add('root', blob([0.32, 0.08, 0.26], soil, { pos: [0, 0.02, 0], deform: [wobble(0.01)] }));
  for (let i = 0; i < 6; i++) {
    const phi = i * 60 + 20;
    r.add('leaves', grp([strap(0.5 + (i % 2) * 0.1, 0.22, i % 2 ? leafM : leafM2, { arch: 0.42 })], [0, 0.02, 0], [55, phi, 0]));
  }
  // caule em gomos (anéis) e espinhos
  r.add('stem1',
    lathe([[0.13, -0.05], [0.12, 0.1], [0.1, 0.3], [0.1, 0.44]], stem, { deform: [wobble(0.006)] }),
    lathe([[0.13, 0.0], [0.125, 0.02], [0.13, 0.04]], stemDark, { pos: [0, 0.2, 0] }),
    leaf(0.28, 0.14, leafM, { pos: [0.06, 0.28, 0.05], rot: [20, 0, -60] }),
    leaf(0.24, 0.12, leafM2, { pos: [-0.06, 0.22, -0.04], rot: [-20, 0, 60] }),
  );
  r.add('stem2',
    lathe([[0.1, -0.03], [0.09, 0.15], [0.085, 0.3], [0.1, 0.42]], stem, { deform: [wobble(0.006)] }),
    lathe([[0.11, 0.0], [0.105, 0.02], [0.11, 0.04]], stemDark, { pos: [0, 0.16, 0] }),
    spike(0.08, 0.02, stemDark, { pos: [0.08, 0.1, 0.03], rot: [0, 0, -80] }),
    spike(0.07, 0.02, stemDark, { pos: [-0.08, 0.25, 0.02], rot: [0, 0, 80] }),
  );
  // coroa de pétalas atrás da boca
  for (let i = 0; i < 8; i++) {
    const phi = i * 45;
    r.add('head', grp([strap(0.3, 0.16, i % 2 ? petal : petal2, { arch: 0.15 })], [-0.2, 0, 0], [0, 0, 0]).rotateX((phi * Math.PI) / 180).rotateZ(Math.PI / 2 + 0.5));
  }
  r.add('head', blob([0.16, 0.16, 0.16], stemDark, { pos: [-0.17, 0, 0], seg: 20 }));
  r.add('jawTop', ...jaw(true));
  r.add('jawBot', ...jaw(false));
  r.root.scale.setScalar(1.4);
  return r;
}

const breathe = wave(16, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2) * 3] }));
export const florCatapulta: ModelDef = {
  id: 'flor-catapulta',
  kind: 'prop',
  build,
  anims: {
    idle: {
      frames: 24, loop: true, keys: {
        stem2: breathe,
        head: wave(24, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2 + 1) * 4], s: [1, 1 + Math.sin(t * Math.PI * 4) * 0.02, 1] })),
        jawTop: wave(24, (t) => ({ r: [0, 0, 6 + Math.sin(t * Math.PI * 2) * 4] })),
        jawBot: wave(24, (t) => ({ r: [0, 0, -4 - Math.sin(t * Math.PI * 2) * 3] })),
      },
    },
    engolir: {
      frames: 14, loop: false, keys: {
        jawTop: [{ t: 0, r: [0, 0, 6] }, { t: 0.25, r: [0, 0, 42], e: 'out' }, { t: 0.45, r: [0, 0, -2], e: 'in' }, { t: 1, r: [0, 0, 0] }],
        jawBot: [{ t: 0, r: [0, 0, -4] }, { t: 0.25, r: [0, 0, -30], e: 'out' }, { t: 0.45, r: [0, 0, 2], e: 'in' }, { t: 1, r: [0, 0, 0] }],
        head: [{ t: 0, r: [0, 0, 0], s: 1 }, { t: 0.25, r: [0, 0, -14], s: 1 }, { t: 0.5, r: [0, 0, 6], s: [1.2, 1.18, 1.2] }, { t: 0.7, s: [0.94, 1.06, 0.94] }, { t: 1, r: [0, 0, 0], s: [1.08, 1.06, 1.08] }],
        stem2: [{ t: 0, r: [0, 0, 0] }, { t: 0.5, r: [0, 0, -8] }, { t: 1, r: [0, 0, 0] }],
        stem1: [{ t: 0, s: 1 }, { t: 0.5, s: [1.1, 0.92, 1.1] }, { t: 1, s: 1 }],
      },
    },
    mirar: {
      frames: 24, loop: true, keys: {
        stem1: wave(24, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2) * 14] })),
        stem2: wave(24, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2 - 0.4) * 18] })),
        head: wave(24, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2 - 0.8) * 16], s: [1.08, 1.06, 1.08] })),
      },
    },
    disparar: {
      frames: 12, loop: false, keys: {
        stem1: [{ t: 0, s: 1 }, { t: 0.25, s: [1.15, 0.8, 1.15] }, { t: 0.45, s: [0.9, 1.18, 0.9], e: 'out' }, { t: 0.75, s: [1.04, 0.97, 1.04] }, { t: 1, s: 1 }],
        stem2: [{ t: 0, r: [0, 0, 0] }, { t: 0.25, r: [0, 0, -16] }, { t: 0.45, r: [0, 0, 10], e: 'out' }, { t: 1, r: [0, 0, 0] }],
        head: [{ t: 0, s: [1.08, 1.06, 1.08] }, { t: 0.25, s: [1.25, 0.85, 1.25] }, { t: 0.45, s: [0.9, 1.1, 0.9], e: 'out' }, { t: 1, s: 1 }],
        jawTop: [{ t: 0, r: [0, 0, 0] }, { t: 0.3, r: [0, 0, 0] }, { t: 0.42, r: [0, 0, 50], e: 'out' }, { t: 0.75, r: [0, 0, 20] }, { t: 1, r: [0, 0, 6] }],
        jawBot: [{ t: 0, r: [0, 0, 0] }, { t: 0.3, r: [0, 0, 0] }, { t: 0.42, r: [0, 0, -36], e: 'out' }, { t: 0.75, r: [0, 0, -14] }, { t: 1, r: [0, 0, -4] }],
      },
    },
  },
  cell: [288, 256],
  pivot: [120, 240],
  height: 256 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
};
