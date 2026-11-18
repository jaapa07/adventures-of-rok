/**
 * EMA — montaria terrestre, ave alta (~2 u) e desengonçada.
 * Corpo ovalado coberto de penas cinza-acastanhadas em camadas caídas, pescoço longo
 * com "gola" escura na base, cabeça pequena de bico achatado e olhos enormes de olhar
 * meio vesgo (o lado engraçado dela), coxas emplumadas e pernas fortes de três dedos.
 * Sela: manta de tecido listrado amarrada com cordão.
 */
import { Rig, blob, limb, tube, slab, ring, spike, eye, mat, taper, pull, wobble, THREE, D2R, type V3 } from '../../render/sculpt';
import { grp } from '../props/kit';
import { emaAnims } from '../../anims/mounts';
import type { ModelDef } from '../../render/types';

const C = {
  plume: 0x8f8170,
  plumeDark: 0x6a5e50,
  plumeLight: 0xb8ab96,
  neck: 0x9a9184,
  neckLight: 0xb0a898,
  collar: 0x3a3430,
  head: 0x8a8174,
  beak: 0xc8b49a,
  beakDark: 0x7a6a58,
  leg: 0xb8a68a,
  legDark: 0x8a785e,
  claw: 0x3a3028,
  blanket: 0xd8542a,
  blanketB: 0xf2c23a,
  cord: 0x5a3a20,
};

/** Pena caída: lâmina estreita com ponta arredondada, curvada para baixo. */
function feather(len: number, wid: number, m: THREE.Material, o: { pos: V3; rot: V3 }) {
  return slab([[0, wid * 0.5], [len * 0.35, wid], [len * 0.75, wid * 0.75], [len * 0.92, wid * 0.35], [len, 0.0], [len * 0.9, -wid * 0.2], [len * 0.7, -wid * 0.8], [len * 0.35, -wid], [0, -wid * 0.5]], 0.01, m, {
    pos: o.pos, rot: o.rot, bevel: 0.005, deform: [(p) => { p.z -= (p.x * p.x) * 0.5; p.y += Math.sin(p.x * 18) * 0.004; }],
  });
}

/** Vértebras do pescoço: [osso, rotação de repouso em Z]. A soma dá −2° (a cabeça fecha em 0°). */
const NECK: [string, number][] = [['neck1', -40], ['neck1b', 18], ['neck1c', 20], ['neck2', 16], ['neck2b', -2], ['neck2c', -14]];
const NECK_SEG = 0.11;

function build(_variant: string) {
  const r = new Rig('root');
  const plumeM = mat('fur', C.plume, { repeat: 2 });
  const plumeDarkM = mat('fur', C.plumeDark, { repeat: 2 });
  const plumeLightM = mat('fur', C.plumeLight, { repeat: 2 });
  const neckM = mat('shortFur', C.neck, { repeat: 3 });
  const collarM = mat('fur', C.collar, { repeat: 3 });
  const neckLightM = mat('shortFur', C.neckLight, { repeat: 3 });
  const headM = mat('shortFur', C.head, { repeat: 4 });
  const beakM = mat('shell', C.beak, { rough: 0.45 });
  const beakDarkM = mat('skin', C.beakDark, { rough: 0.4 });
  const legM = mat('scale', C.leg, { repeat: 3 });
  const legDarkM = mat('scale', C.legDark, { repeat: 3 });
  const clawM = mat('shell', C.claw, { rough: 0.35 });
  const blanketM = mat('cloth', C.blanket, { repeat: 3 });
  const blanketBM = mat('cloth', C.blanketB, { repeat: 3 });
  const cordM = mat('cloth', C.cord, { repeat: 6 });

  /* ---------- esqueleto ---------- */
  r.bone('hips', 'root', [0, 1.0, 0]);
  // pescoço em "S" com seis vértebras: sai para a frente, sobe, recua e volta a avançar na nuca
  NECK.forEach(([name, rot], i) => r.bone(name, i ? NECK[i - 1][0] : 'hips', i ? [0, NECK_SEG, 0] : [0.33, 0.1, 0], [0, 0, rot]));
  r.bone('head', 'neck2c', [0, NECK_SEG, 0], [0, 0, 2]);
  r.bone('jaw', 'head', [0.06, -0.035, 0]);
  r.bone('wingR', 'hips', [0.12, 0.08, 0.26], [0, 0, 0]);
  r.bone('wingL', 'hips', [0.12, 0.08, -0.26], [0, 0, 0]);
  r.bone('plume', 'hips', [-0.36, 0.08, 0]);
  for (const s of ['L', 'R'] as const) {
    // pernas afastadas em Z e desencontradas em X (a de trás da câmera adiantada, somando com a guinada de 12°)
    const z = s === 'R' ? 0.17 : -0.17;
    r.bone(`leg${s}_up`, 'hips', [s === 'R' ? -0.07 : 0.08, -0.14, z], [0, 0, 22]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.36, 0], [0, 0, -44]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.5, 0], [0, 0, 22]);
  }
  r.anchor('sela', 'hips', [-0.02, 0.32, 0]);

  /* ---------- corpo emplumado ---------- */
  r.add('hips',
    blob([0.42, 0.3, 0.28], plumeM, { pos: [-0.02, 0.02, 0], deform: [pull([0.3, 0.1, 0], 0.25, [0.04, 0.04, 0]), pull([-0.35, -0.05, 0], 0.25, [-0.04, -0.06, 0]), wobble(0.01, 9)] }),
    blob([0.3, 0.18, 0.24], plumeLightM, { pos: [0.08, -0.12, 0], deform: [wobble(0.008, 11)] }),
  );
  // camadas de penas caídas nos flancos, assentadas sobre a superfície do corpo, formando uma "saia" desgrenhada
  const rowsF: [number, number, number][] = [[0.17, 0.3, -88], [0.03, 0.36, -94], [-0.11, 0.42, -100]];
  rowsF.forEach(([y, len, ang], ri) => {
    [0.24, 0.1, -0.04, -0.18, -0.32].forEach((x0, ci) => {
      const x = x0 + (ri % 2) * 0.07;
      const w = 1 - (x / 0.44) ** 2 - (y / 0.32) ** 2;
      if (w <= 0.05) return;
      const z = 0.28 * Math.sqrt(w) + 0.012;
      const m = (ri + ci) % 3 === 0 ? plumeDarkM : (ri + ci) % 3 === 1 ? plumeM : plumeLightM;
      const a = ang - ci * 3 + ri * 2;
      r.add('hips', feather(len, 0.048, m, { pos: [x, y, z], rot: [0, 0, a] }));
      if ((ri + ci) % 2 === 0) r.add('hips', feather(len, 0.048, m, { pos: [x, y, -z], rot: [0, 180, 180 - a] }));
    });
  });
  // penas do dorso, deitadas para trás sobre o lombo
  [[0.18, 0.27, 0.06], [0.0, 0.3, -0.05], [-0.2, 0.27, 0.04]].forEach(([x, y, z], i) => {
    r.add('hips', feather(0.34, 0.075, i % 2 ? plumeDarkM : plumeM, { pos: [x, y, z], rot: [55, 0, 186] }));
  });
  // sela: manta listrada e cordão
  r.add('hips',
    blob([0.22, 0.06, 0.24], blanketM, { pos: [-0.02, 0.28, 0], deform: [pull([0, 0, 0.24], 0.15, [0, -0.08, 0]), pull([0, 0, -0.24], 0.15, [0, -0.08, 0])] }),
    ring(0.215, 0.018, blanketBM, { pos: [-0.02, 0.27, 0], rot: [90, 0, 0], scale: [1, 1.12, 1], deform: [pull([0, 0.21, 0], 0.15, [0, 0, 0.06]), pull([0, -0.21, 0], 0.15, [0, 0, 0.06])] }),
    tube([[0.06, 0.3, 0.2], [0.1, 0.12, 0.29], [0.1, -0.1, 0.27], [0.08, -0.26, 0.12]], 0.013, cordM),
    tube([[0.06, 0.3, -0.2], [0.1, 0.12, -0.29], [0.1, -0.1, -0.27], [0.08, -0.26, -0.12]], 0.013, cordM),
  );

  /* ---------- pescoço longo, curvo e emplumado ---------- */
  const neckMats = [collarM, plumeDarkM, plumeM, neckM, neckM, neckLightM];
  const featherMats: [THREE.Material, THREE.Material][] = [[collarM, plumeDarkM], [plumeDarkM, plumeM], [plumeM, plumeLightM], [plumeM, neckM], [neckM, neckLightM], [neckLightM, neckM]];
  const neckR = (i: number) => 0.122 - 0.058 * (i / NECK.length) ** 0.75; // raio na base da vértebra i
  NECK.forEach(([name], i) => {
    const r0 = neckR(i), r1 = neckR(i + 1);
    // miolo: cápsula afilada que se funde com as vizinhas (as dobras ficam suaves)
    r.add(name, limb(NECK_SEG, r1, r0, neckMats[i], { pos: [0, NECK_SEG, 0] }));
    // coroa de penas em telha: nascem no alto da vértebra e caem sobre a de baixo
    const n = i < 2 ? 8 : i < 4 ? 7 : 6;
    const len = NECK_SEG * (i < 2 ? 1.9 : i < 4 ? 1.55 : 1.2);
    const wid = r0 * (i < 4 ? 0.42 : 0.36);
    for (let j = 0; j < n; j++) {
      const a = (j / n) * 360 + (i % 2) * (180 / n);
      const m = featherMats[i][j % 2];
      r.add(name, grp([feather(len * (j % 2 ? 0.88 : 1), wid, m, { pos: [0, 0, 0], rot: [0, 0, -90] })],
        [Math.cos(a * D2R) * (r1 + 0.004), NECK_SEG * 0.95, Math.sin(a * D2R) * (r1 + 0.004)], [i < 2 ? -16 : -9, 90 - a, 0]));
    }
  });
  // gola escura e fofa na base do pescoço
  r.add('neck1',
    blob([0.16, 0.13, 0.17], collarM, { pos: [-0.01, 0.0, 0], deform: [wobble(0.012, 13)] }),
    ...[20, 80, 140, 220, 280, 340].map((a) => grp([feather(0.15, 0.05, collarM, { pos: [0, 0, 0], rot: [0, 0, -90] })], [Math.cos(a * D2R) * 0.14, 0.02, Math.sin(a * D2R) * 0.15], [-24, 90 - a, 0])),
  );

  /* ---------- cabeça: bico chato, olhos enormes e meio vesgos ---------- */
  r.add('head',
    blob([0.095, 0.085, 0.08], headM, { pos: [0.01, 0.02, 0], deform: [pull([0.07, 0.0, 0], 0.07, [0.02, -0.01, 0])] }),
    // topete arrepiado
    ...[[-0.02, 0.09, -20], [0.01, 0.095, 10], [-0.05, 0.08, -40]].map(([x, y, a]) => feather(0.07, 0.018, plumeDarkM, { pos: [x, y, 0], rot: [90, 0, 90 + a] })),
    // bico superior largo e achatado
    blob([0.1, 0.028, 0.05], beakM, { pos: [0.15, -0.012, 0], deform: [pull([0.1, 0, 0], 0.06, [0.015, -0.012, 0]), taper('x', -0.1, 0.1, 1.0, 0.55)] }),
    tube([[0.06, -0.03, 0.045], [0.16, -0.035, 0.035], [0.24, -0.035, 0.0]], 0.006, beakDarkM),
    blob([0.01, 0.005, 0.006], beakDarkM, { pos: [0.19, 0.006, 0.02] }),
    blob([0.01, 0.005, 0.006], beakDarkM, { pos: [0.19, 0.006, -0.02] }),
  );
  r.add('jaw',
    blob([0.085, 0.016, 0.042], beakDarkM, { pos: [0.08, -0.008, 0], deform: [taper('x', -0.085, 0.085, 1.0, 0.5)] }),
  );
  // olhos: grandes, um olhando para a frente e o outro meio para cima (cara de pateta)
  const eR = eye({ r: 0.05, iris: 0x2a1a10, irisScale: 0.46, look: [0.9, -0.2], lid: 0.32, lidColor: C.head });
  eR.position.set(0.05, 0.05, 0.06); eR.rotation.y = 0.45;
  const eL = eye({ r: 0.046, iris: 0x2a1a10, irisScale: 0.46, look: [-0.2, 0.9], lid: 0.3, lidColor: C.head });
  eL.position.set(0.05, 0.085, -0.035); eL.rotation.y = 0.9;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;

  /* ---------- asas curtas e desgrenhadas ---------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    const wing: THREE.Object3D[] = [blob([0.16, 0.08, 0.04], plumeDarkM, { pos: [-0.06, -0.02, 0.0] })];
    [[-0.04, 0.3, -95], [-0.1, 0.34, -105], [-0.16, 0.32, -115], [0.02, 0.26, -85]].forEach(([x, len, a], i) => {
      wing.push(feather(len, 0.05, i % 2 ? plumeM : plumeLightM, { pos: [x, 0.0, 0.03 * zs], rot: [zs > 0 ? 0 : 180, 0, zs > 0 ? a : 180 - a] }));
    });
    r.add(`wing${s}`, ...wing);
  }
  // penacho traseiro (ema não tem cauda: só um tufo caído)
  r.add('plume',
    ...[[0.0, 0.34, -100, 0.0], [0.0, 0.3, -120, 0.08], [0.0, 0.3, -120, -0.08], [0.04, 0.26, -80, 0.04], [-0.02, 0.32, -140, 0.0]].map(([x, len, a, z]) =>
      feather(len, 0.07, z === 0 ? plumeDarkM : plumeM, { pos: [x, 0, z], rot: [0, 0, a] })),
  );

  /* ---------- pernas fortes de três dedos ---------- */
  for (const s of ['L', 'R'] as const) {
    r.add(`leg${s}_up`,
      // coxa emplumada ("calça" de penas)
      blob([0.11, 0.2, 0.1], plumeM, { pos: [0.0, -0.12, 0], deform: [taper('y', -0.2, 0.2, 0.6, 1.0), wobble(0.008, 12)] }),
      limb(0.36, 0.06, 0.045, legM),
      blob([0.05, 0.05, 0.05], legDarkM, { pos: [0, -0.36, 0] }),
    );
    r.add(`leg${s}_lo`,
      limb(0.5, 0.045, 0.035, legM),
      // escudos (escamas grandes) na frente do tarso
      ...[0.08, 0.2, 0.32, 0.43].map((y) => blob([0.03, 0.045, 0.04], legDarkM, { pos: [0.022, -y, 0], deform: [wobble(0.003, 30)] })),
    );
    const toes: THREE.Object3D[] = [blob([0.05, 0.03, 0.05], legDarkM, { pos: [0.01, -0.0, 0] })];
    ([[0.0, 0.18], [0.5, 0.15], [-0.5, 0.15]] as const).forEach(([a, len]) => {
      const z = Math.sin(a) * len, x = Math.cos(a) * len;
      toes.push(tube([[0.0, -0.01, 0], [x * 0.55, -0.04, z * 0.55], [x, -0.05, z]], (t) => 0.026 - t * 0.008, legM, { seg: 12, radial: 10 }));
      toes.push(spike(0.05, 0.016, clawM, { pos: [x * 0.98, -0.05, z * 0.98], rot: [0, -a / D2R, -100], curve: 0.4 }));
    });
    r.add(`foot${s}`, ...toes);
  }
  return r;
}

export const ema: ModelDef = {
  id: 'ema',
  kind: 'mount',
  build,
  anims: emaAnims(),
  cell: [320, 320],
  pivot: [160, 290],
  height: 320 / 104,
  presets: ['selva', 'por-do-sol', 'neutro'],
};
