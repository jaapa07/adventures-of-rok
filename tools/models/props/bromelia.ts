/**
 * BROMÉLIA-MOLA — roseta de folhas rígidas em calha (verde com pontas vinho), brácteas vermelhas no miolo,
 * copo d'água no centro e espiga de flores amarelas. Na animação `mola` a planta afunda e devolve com tudo.
 */
import { Rig, blob, tube, lathe, spike, mat } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, strap, still } from './kit';

function build() {
  const r = new Rig('root');
  const green = mat('leaf', 0x4f8d2e, { rough: 0.45 });
  const green2 = mat('leaf', 0x6aa83a, { rough: 0.45 });
  const wine = mat('leaf', 0x8a2a3a, { rough: 0.45 });
  const red = mat('leaf', 0xe0362c, { rough: 0.35 });
  const orange = mat('leaf', 0xff7a2a, { rough: 0.35 });
  const yellow = mat('skin', 0xffd23a, { rough: 0.4, emissive: 0xffb000, emissiveIntensity: 0.15 });
  const water = mat('water', 0x7ad0ff);
  const soil = mat('earth', 0x4a3220);
  const root = mat('bark', 0x5a3e24);

  r.bone('base', 'root', [0, 0, 0]);
  r.bone('outer', 'base', [0, 0.04, 0]);
  r.bone('inner', 'base', [0, 0.06, 0]);
  r.bone('spikeB', 'inner', [0, 0.08, 0]);

  // torrão e raízes aéreas
  r.add('base',
    blob([0.15, 0.045, 0.13], soil, { pos: [0, 0.01, 0], seg: 20 }),
    tube([[0.12, 0.03, 0.08], [0.2, 0.0, 0.12], [0.26, -0.01, 0.1]], (t) => 0.014 * (1 - t) + 0.004, root),
    tube([[-0.12, 0.03, 0.06], [-0.2, 0.0, 0.1], [-0.27, -0.01, 0.06]], (t) => 0.014 * (1 - t) + 0.004, root),
    tube([[0.02, 0.03, 0.12], [0.05, 0.0, 0.2], [0.02, -0.01, 0.25]], (t) => 0.012 * (1 - t) + 0.004, root),
  );
  // anel externo: 9 folhas largas arqueadas
  const outer = 9;
  for (let i = 0; i < outer; i++) {
    const phi = (i / outer) * 360 + 10;
    const len = 0.38 + (i % 3) * 0.04;
    r.add('outer', grp([
      strap(len, 0.15, i % 3 === 1 ? wine : i % 2 ? green : green2, { arch: 0.26 }),
    ], [0, 0, 0], [38, phi, 0]));
  }
  // anel interno: brácteas vermelhas e laranja, mais curtas e eretas
  const inner = 7;
  for (let i = 0; i < inner; i++) {
    const phi = (i / inner) * 360 + 35;
    r.add('inner', grp([strap(0.24 + (i % 2) * 0.04, 0.085, i % 3 === 0 ? orange : red, { arch: 0.12 })], [0, 0, 0], [12, phi, 0]));
  }
  // copo d'água no miolo
  r.add('inner',
    lathe([[0.001, 0.02], [0.06, 0.03], [0.075, 0.07], [0.07, 0.075], [0.001, 0.07]], mat('leaf', 0x3a6a22), { seg: 20 }),
    blob([0.06, 0.008, 0.06], water, { pos: [0, 0.07, 0], seg: 18, castShadow: false }),
  );
  // espiga de flores
  r.add('spikeB',
    tube([[0, -0.02, 0], [0.01, 0.08, 0], [0.0, 0.16, 0.01]], 0.018, mat('skin', 0xd85020)),
  );
  for (let i = 0; i < 9; i++) {
    const y = 0.04 + i * 0.016;
    const a = i * 137;
    r.add('spikeB', spike(0.045 - i * 0.003, 0.012, yellow, { pos: [Math.cos(a * Math.PI / 180) * 0.012, y, Math.sin(a * Math.PI / 180) * 0.012], rot: [Math.sin(a * Math.PI / 180) * 70, 0, -Math.cos(a * Math.PI / 180) * 70] }));
  }
  r.add('spikeB', blob([0.02, 0.026, 0.02], yellow, { pos: [0, 0.19, 0.01], seg: 12 }));
  return r;
}

export const bromelia: ModelDef = {
  id: 'bromelia',
  kind: 'prop',
  build,
  anims: {
    idle: still(),
    mola: {
      frames: 12, loop: false, keys: {
        base: [
          { t: 0, s: 1 },
          { t: 0.18, s: [1.25, 0.5, 1.25], e: 'out' },
          { t: 0.36, s: [0.82, 1.45, 0.82], e: 'out' },
          { t: 0.55, s: [1.1, 0.88, 1.1] },
          { t: 0.75, s: [0.96, 1.06, 0.96] },
          { t: 1, s: 1 },
        ],
        inner: [{ t: 0, s: 1 }, { t: 0.18, s: [1, 0.7, 1] }, { t: 0.36, s: [0.9, 1.35, 0.9], e: 'out' }, { t: 0.7, s: 1 }],
        spikeB: [{ t: 0, r: [0, 0, 0] }, { t: 0.36, r: [0, 0, 18] }, { t: 0.55, r: [0, 0, -12] }, { t: 0.8, r: [0, 0, 5] }, { t: 1, r: [0, 0, 0] }],
        outer: [{ t: 0, r: [0, 0, 0] }, { t: 0.18, r: [0, 25, 0] }, { t: 0.5, r: [0, -8, 0] }, { t: 1, r: [0, 0, 0] }],
      },
    },
  },
  cell: [128, 112],
  pivot: [64, 96],
  height: 112 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
  camera: { pitch: -16 },
};
