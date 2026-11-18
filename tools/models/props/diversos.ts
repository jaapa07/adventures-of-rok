/**
 * Objetos diversos: FOGUEIRA, TEIA, PAINEL DE MÁQUINA, GARRAFA DE CAFÉ, CELULAR, CANOA, GAIOLA,
 * SEMENTE-MÃE, PLACA DO TRILHO e SERRA GIGANTE.
 */
import { Rig, blob, tube, slab, lathe, roundBox, ring, spike, mat, wobble, taper, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, nail, rope, leaf, still, wave, sparkle, additive, star } from './kit';

/** Língua de fogo: gota alongada, deformada em S. */
export function flame(h: number, r: number, material: ReturnType<typeof mat>, o: { pos?: V3; rot?: V3; twist?: number } = {}) {
  const tw = o.twist ?? 0.3;
  return lathe([[0.001, 0], [r * 0.7, h * 0.06], [r, h * 0.2], [r * 0.85, h * 0.42], [r * 0.45, h * 0.7], [r * 0.12, h * 0.92], [0.001, h]], material, {
    pos: o.pos, rot: o.rot, seg: 18, castShadow: false,
    deform: [(p) => { const t = p.y / h; p.x += Math.sin(t * Math.PI * 1.6) * r * tw * t; p.z += Math.cos(t * Math.PI * 1.3) * r * tw * 0.5 * t; }],
  });
}

/* ------------------------------ FOGUEIRA ------------------------------ */
function buildFogueira() {
  const r = new Rig('root');
  const stone = mat('stone', 0x8a8478);
  const stone2 = mat('rock', 0x6a645c);
  const log = mat('bark', 0x5a3a22, { repeat: 2 });
  const charM = mat('bark', 0x2a1e18, { repeat: 2 });
  const cut = mat('wood', 0xc8985a);
  const ember = mat('glow', 0xff5a1a, { emissiveIntensity: 1.2 });
  const ash = mat('sand', 0x6a6460);
  const f1 = mat('glow', 0xff4a0a, { emissiveIntensity: 0.9, opacity: 0.92 });
  const f2 = mat('glow', 0xff9a10, { emissiveIntensity: 0.9, opacity: 0.95 });
  const f3 = mat('glow', 0xffe060, { emissiveIntensity: 1.2 });
  r.bone('base', 'root');
  r.add('base', blob([0.32, 0.03, 0.24], ash, { pos: [0, 0.01, 0], deform: [wobble(0.01, 12)] }));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    r.add('base', blob([0.075, 0.06, 0.07], i % 2 ? stone : stone2, { pos: [Math.cos(a) * 0.34, 0.04, Math.sin(a) * 0.26], rot: [0, i * 37, 0], deform: [wobble(0.012, 11)], seg: 16 }));
  }
  // toras em pirâmide
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 360 + 15;
    r.add('base', grp([
      tube([[0, 0, 0], [0.3, 0, 0]], 0.04, i % 2 ? log : charM, { seg: 8, radial: 10 }),
      blob([0.004, 0.038, 0.038], cut, { pos: [0.3, 0, 0], seg: 12 }),
    ], [0, 0.05, 0], [0, a, 0]).rotateZ(0));
    r.add('base', grp([tube([[0, 0, 0], [0.27, 0, 0]], 0.035, i % 2 ? charM : log, { seg: 8, radial: 10 })], [0, 0.04, 0], [0, a + 36, 30]));
  }
  // brasas
  r.bone('embers', 'base', [0, 0.06, 0]);
  r.add('embers', ...[[0.05, 0, 0.03], [-0.06, 0.01, -0.02], [0.0, 0.02, -0.06], [-0.03, 0, 0.07], [0.08, 0.01, -0.05]].map(([x, y, z], i) => blob([0.03, 0.02, 0.025], i % 2 ? ember : mat('glow', 0xff8a2a, { emissiveIntensity: 1 }), { pos: [x, y, z], deform: [wobble(0.005, 20)], seg: 12 })));
  // chamas (cada língua num osso)
  const tongues: [number, number, number, number, ReturnType<typeof mat>][] = [
    [0, 0, 0.48, 0.12, f1], [0.08, 0.03, 0.34, 0.09, f1], [-0.08, -0.02, 0.36, 0.09, f1], [0.02, 0.06, 0.3, 0.08, f2],
    [0, -0.02, 0.36, 0.085, f2], [-0.04, 0.05, 0.24, 0.06, f2], [0.0, 0.01, 0.24, 0.05, f3], [0.05, -0.03, 0.18, 0.04, f3],
  ];
  tongues.forEach(([x, z, h, rr, m], i) => {
    r.bone(`f${i}`, 'base', [x, 0.08, z]);
    r.add(`f${i}`, flame(h, rr, m, { twist: 0.4 * (i % 2 ? 1 : -1) }));
  });
  r.bone('glow', 'base');
  r.add('glow', blob([0.24, 0.24, 0.24], additive(mat('glow', 0xff7a1a, { emissiveIntensity: 0.4, opacity: 0.16 })), { pos: [0, 0.22, 0], castShadow: false }));
  // fumaça apagada
  r.bone('smoke', 'base', [0, 0.1, 0]);
  r.add('smoke', ...[0, 1, 2].map((i) => blob([0.04 + i * 0.015, 0.04 + i * 0.015, 0.04 + i * 0.015], mat('cloth', 0x9a9a9a, { opacity: 0.45 - i * 0.1 }), { pos: [Math.sin(i * 1.7) * 0.03, 0.05 + i * 0.1, 0], castShadow: false })));
  return r;
}
const FL = Array.from({ length: 8 }, (_, i) => `f${i}`);
export const fogueira: ModelDef = {
  id: 'fogueira',
  kind: 'prop',
  build: buildFogueira,
  anims: {
    apagada: still({ ...Object.fromEntries(FL.map((f) => [f, [{ t: 0, s: 0.001 }]])), embers: [{ t: 0, s: [0.6, 0.5, 0.6] }], glow: [{ t: 0, s: 0.001 }] }),
    acesa: {
      frames: 8, loop: true, keys: {
        ...Object.fromEntries(FL.map((f, i) => [f, wave(8, (t) => ({ s: [1 + Math.sin(t * Math.PI * 2 * 2 + i) * 0.12, 1 + Math.sin(t * Math.PI * 2 + i * 1.7) * 0.22, 1 + Math.cos(t * Math.PI * 2 * 2 + i) * 0.12], r: [Math.sin(t * Math.PI * 2 + i) * 6, t * 360 * (i % 2 ? 1 : -1) * 0.25, Math.cos(t * Math.PI * 2 + i * 0.7) * 8] }))])),
        smoke: [{ t: 0, s: 0.001 }],
        embers: wave(8, (t) => ({ s: 1 + Math.sin(t * Math.PI * 4) * 0.08 })),
      },
    },
  },
  cell: [128, 128],
  pivot: [64, 112],
  height: 128 / 104,
  presets: ['caverna', 'selva', 'neutro'],
};

/* ------------------------------ TEIA ------------------------------ */
function buildTeia() {
  const r = new Rig('root');
  const silk = mat('glass', 0xf4f8ff, { opacity: 0.85, emissive: 0x8a9aaa, emissiveIntensity: 0.3 });
  const dew = mat('water', 0xcfefff, { opacity: 0.8 });
  const fire = mat('glow', 0xff4a0a, { emissiveIntensity: 0.9, opacity: 0.9 });
  const fire2 = mat('glow', 0xffb020, { emissiveIntensity: 1 });
  const W = 0.62, H = 1.22, CY = 0.62;
  r.bone('web', 'root', [0, CY, 0]);
  const N = 10;
  const rad = (a: number) => {
    // raio até a borda do retângulo (teia presa nas bordas do vão)
    const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    return Math.min((W / 2) / Math.max(c, 1e-3), (H / 2) / Math.max(s, 1e-3));
  };
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2 + 0.15;
    const a1 = ((i + 1) / N) * Math.PI * 2 + 0.15;
    const b = `w${i}`;
    r.bone(b, 'web');
    const R0 = rad(a0);
    // fio radial (com leve barriga)
    r.add(b, tube([[0, 0, 0], [Math.cos(a0) * R0 * 0.5, Math.sin(a0) * R0 * 0.5 - 0.02, 0.01], [Math.cos(a0) * R0, Math.sin(a0) * R0, 0]], 0.006, silk, { seg: 12, radial: 5 }));
    // espiral: arcos entre radiais, cedendo levemente para o centro
    for (let k = 1; k <= 7; k++) {
      const f = k / 7.6;
      const p0: V3 = [Math.cos(a0) * rad(a0) * f, Math.sin(a0) * rad(a0) * f, 0];
      const p1: V3 = [Math.cos(a1) * rad(a1) * f, Math.sin(a1) * rad(a1) * f, 0];
      const m: V3 = [(p0[0] + p1[0]) * 0.46, (p0[1] + p1[1]) * 0.46 - 0.01, 0.005];
      r.add(b, tube([p0, m, p1], 0.004, silk, { seg: 8, radial: 4 }));
      if ((k + i) % 4 === 0) r.add(b, blob([0.012, 0.014, 0.012], dew, { pos: [m[0], m[1] - 0.008, 0.01], seg: 10, castShadow: false }));
    }
  }
  // pequeno casulo pendurado
  r.add('w3', tube([[0.1, 0.25, 0], [0.1, 0.16, 0.02]], 0.003, silk), blob([0.025, 0.045, 0.025], mat('cloth', 0xe8e4d8), { pos: [0.1, 0.13, 0.02], deform: [taper('y', -0.045, 0.045, 0.7, 1)] }));
  // fogo (só na queima)
  r.bone('fire', 'web');
  r.add('fire', flame(0.3, 0.1, fire, { pos: [0, -0.1, 0.02] }), flame(0.2, 0.06, fire2, { pos: [0.02, -0.08, 0.04] }), flame(0.22, 0.07, fire, { pos: [-0.1, -0.2, 0.03], twist: -0.5 }), flame(0.2, 0.06, fire, { pos: [0.12, 0.05, 0.03] }));
  return r;
}
const WEB = Array.from({ length: 10 }, (_, i) => `w${i}`);
export const teia: ModelDef = {
  id: 'teia',
  kind: 'prop',
  build: buildTeia,
  anims: {
    idle: { frames: 24, loop: true, keys: { fire: [{ t: 0, s: 0.001 }], web: wave(12, (t) => ({ s: [1, 1, 1], r: [0, Math.sin(t * Math.PI * 2) * 8, 0] })) } },
    queimar: {
      frames: 14, loop: false, keys: {
        fire: [{ t: 0, s: 0.001 }, { t: 0.15, s: 0.8, e: 'out' }, { t: 0.45, s: [1.3, 1.5, 1.2] }, { t: 0.75, s: [1, 1.2, 1] }, { t: 1, s: 0.001, e: 'in' }],
        ...Object.fromEntries(WEB.map((w, i) => [w, [{ t: 0, s: 1, r: [0, 0, 0] as V3 }, { t: 0.2 + (i % 5) * 0.06, s: 1, r: [0, 0, 0] as V3 }, { t: 0.55 + (i % 5) * 0.06, s: 0.25, r: [0, 0, (i % 2 ? 40 : -40)] as V3, e: 'in' as const }, { t: 0.7 + (i % 5) * 0.06, s: 0.001 }]])),
      },
    },
  },
  cell: [128, 160],
  pivot: [64, 148],
  height: 160 / 104,
  presets: ['caverna', 'selva', 'neutro'],
  camera: { yaw: 6 },
};

/* ------------------------------ PAINEL DE MÁQUINA ------------------------------ */
function buildPainel() {
  const r = new Rig('root');
  const body = mat('metal', 0x5a6a62, { metal: 0.6, rough: 0.45 });
  const dark = mat('metal', 0x2a2e2c, { metal: 0.5, rough: 0.5 });
  const rust = mat('rust', 0x7a4a32, { metal: 0.4 });
  const steel = mat('metal', 0xb0b0b0, { metal: 0.55, rough: 0.3 });
  const yellow = mat('paint', 0xe8b020);
  const red = mat('glow', 0xff3a2a, { emissiveIntensity: 1.4 });
  const green = mat('glow', 0x4aff6a, { emissiveIntensity: 1.4 });
  const amber = mat('glow', 0xffb02a, { emissiveIntensity: 1.4 });
  const off = mat('plastic', 0x3a2a2a);
  const screen = mat('glow', 0x3affc0, { emissiveIntensity: 0.9 });
  const dial = mat('paint', 0xf4ecd8);
  r.bone('box', 'root', [0, 0, 0]);
  r.add('box',
    roundBox([0.12, 0.6, 0.12], 0.02, dark, { pos: [0, 0.3, 0] }),
    roundBox([0.3, 0.04, 0.24], 0.01, dark, { pos: [0, 0.02, 0] }),
    roundBox([0.7, 0.55, 0.22], 0.04, body, { pos: [0, 0.82, 0], deform: [wobble(0.003, 8)] }),
    roundBox([0.62, 0.47, 0.03], 0.02, dark, { pos: [0, 0.82, 0.1] }),
    roundBox([0.72, 0.05, 0.25], 0.02, rust, { pos: [0, 1.11, 0] }),
    // faixa de alerta
    ...[0, 1, 2, 3, 4, 5].map((i) => slab([[0, 0], [0.05, 0], [0.09, 0.05], [0.04, 0.05]], 0.008, i % 2 ? yellow : dark, { pos: [-0.33 + i * 0.1, 0.56, 0.115], smooth: false })),
    ...[[-0.32, 1.06], [0.32, 1.06], [-0.32, 0.6], [0.32, 0.6]].map(([x, y]) => nail(0.016, steel, { pos: [x, y, 0.115] })),
    // tela
    roundBox([0.24, 0.15, 0.02], 0.01, mat('plastic', 0x0a1a14), { pos: [-0.14, 0.95, 0.115] }),
    // manômetro
    lathe([[0.001, 0], [0.085, 0], [0.09, 0.02], [0.08, 0.03], [0.001, 0.03]], steel, { pos: [0.16, 0.95, 0.11], rot: [90, 0, 0] }),
    blob([0.075, 0.075, 0.006], dial, { pos: [0.16, 0.95, 0.142] }),
    ...[-60, -30, 0, 30, 60].map((a) => roundBox([0.004, 0.018, 0.004], 0.001, dark, { pos: [0.16 + Math.sin(a * Math.PI / 180) * 0.055, 0.95 + Math.cos(a * Math.PI / 180) * 0.055, 0.148], rot: [0, 0, -a] })),
    slab([[0.02, 0.0], [0.06, 0.0], [0.06, 0.004], [0.02, 0.004]], 0.004, red, { pos: [0.16 + 0.035, 0.95 - 0.04, 0.148], rot: [0, 0, 45], smooth: false }),
  );
  // tela com onda
  r.bone('wave', 'box', [-0.14, 0.95, 0.128]);
  r.add('wave', tube(Array.from({ length: 9 }, (_, i) => [-0.1 + i * 0.025, Math.sin(i * 1.3) * 0.035, 0] as V3), 0.006, screen, { seg: 30, radial: 5, castShadow: false }));
  r.bone('needle', 'box', [0.16, 0.95, 0.15]);
  r.add('needle', slab([[-0.006, 0], [0.006, 0], [0.002, 0.06], [-0.002, 0.06]], 0.004, mat('paint', 0xc8201a), { smooth: false }), blob([0.012, 0.012, 0.008], dark));
  // botões (aceso e apagado sobrepostos — osso escala o aceso)
  const btn: [number, ReturnType<typeof mat>][] = [[-0.22, red], [-0.12, amber], [-0.02, green]];
  btn.forEach(([x, m], i) => {
    r.add('box', lathe([[0.001, 0], [0.035, 0], [0.035, 0.015], [0.001, 0.015]], dark, { pos: [x, 0.7, 0.11], rot: [90, 0, 0] }), blob([0.026, 0.026, 0.016], off, { pos: [x, 0.7, 0.13] }));
    r.bone(`b${i}`, 'box', [x, 0.7, 0.132]);
    r.add(`b${i}`, blob([0.027, 0.027, 0.018], m, { castShadow: false }));
  });
  // alavanca
  r.bone('lever', 'box', [0.2, 0.7, 0.12]);
  r.add('box', roundBox([0.08, 0.12, 0.03], 0.01, dark, { pos: [0.2, 0.7, 0.115] }));
  r.add('lever', tube([[0, 0, 0.02], [0, 0.14, 0.04]], 0.012, steel), blob([0.03, 0.03, 0.03], mat('plastic', 0xd83a2a), { pos: [0, 0.15, 0.04] }));
  // cabos
  r.add('box', tube([[0.3, 0.6, -0.05], [0.42, 0.4, -0.05], [0.45, 0.1, -0.02], [0.6, 0.02, 0.0]], 0.022, mat('rubber', 0x1a1a1a)), tube([[0.28, 0.6, -0.08], [0.36, 0.3, -0.1], [0.5, 0.02, -0.1]], 0.016, mat('rubber', 0xa82a1a)));
  // fumaça quando desligado
  r.bone('smoke', 'box', [0.0, 1.15, 0]);
  r.add('smoke', ...[0, 1, 2].map((i) => blob([0.05 + i * 0.02, 0.05 + i * 0.02, 0.05 + i * 0.02], mat('cloth', 0x6a6a6a, { opacity: 0.5 - i * 0.12 }), { pos: [Math.sin(i * 2) * 0.04, 0.04 + i * 0.1, 0], castShadow: false })));
  // faísca quando desligado
  r.add('smoke', sparkle(0.05, mat('glow', 0xfff0a0, { emissiveIntensity: 2 }), { pos: [0.25, -0.15, 0.15] }));
  return r;
}
export const painelMaquina: ModelDef = {
  id: 'painel-maquina',
  kind: 'prop',
  build: buildPainel,
  anims: {
    ligado: {
      frames: 12, loop: true, keys: {
        smoke: [{ t: 0, s: 0.001 }],
        b0: wave(12, (t) => ({ s: t < 0.5 ? 1 : 0.001 })),
        b1: wave(12, (t) => ({ s: (t * 4) % 1 < 0.5 ? 1 : 0.001 })),
        b2: [{ t: 0, s: 1 }],
        needle: wave(12, (t) => ({ r: [0, 0, -20 + Math.sin(t * Math.PI * 2) * 25 + Math.sin(t * Math.PI * 6) * 6] })),
        wave: wave(12, (t) => ({ p: [0, 0, 0], s: [1, 1 + Math.sin(t * Math.PI * 2) * 0.4, 1] })),
        lever: [{ t: 0, r: [0, 0, 25] }],
      },
    },
    desligado: {
      frames: 12, loop: false, keys: {
        b0: [{ t: 0, s: 1 }, { t: 0.15, s: 0.001 }], b1: [{ t: 0, s: 1 }, { t: 0.2, s: 0.001 }], b2: [{ t: 0, s: 1 }, { t: 0.25, s: 0.001 }],
        needle: [{ t: 0, r: [0, 0, -10] }, { t: 0.4, r: [0, 0, 70], e: 'bounce' }, { t: 1, r: [0, 0, 70] }],
        wave: [{ t: 0, s: 1 }, { t: 0.2, s: [1, 0.05, 1] }],
        lever: [{ t: 0, r: [0, 0, 25] }, { t: 0.2, r: [0, 0, -30], e: 'back' }, { t: 1, r: [0, 0, -30] }],
        box: [{ t: 0, r: [0, 0, 0] }, { t: 0.1, r: [0, 0, 3] }, { t: 0.2, r: [0, 0, -2] }, { t: 0.3, r: [0, 0, 0] }],
        smoke: [{ t: 0, s: 0.001, p: [0, 0, 0] }, { t: 0.2, s: 0.4 }, { t: 1, s: 1.2, p: [0.02, 0.12, 0] }],
      },
    },
  },
  cell: [128, 160],
  pivot: [64, 148],
  height: 160 / 104,
  presets: ['fabrica', 'neutro'],
};

/* ------------------------------ GARRAFA DE CAFÉ ------------------------------ */
function buildGarrafa() {
  const r = new Rig('root');
  const red = mat('plastic', 0xc8302a, { rough: 0.3 });
  const white = mat('plastic', 0xf4ecd8, { rough: 0.35 });
  const chrome = mat('metal', 0xe8e8ec, { metal: 0.5, rough: 0.2 });
  const black = mat('plastic', 0x1e1a18, { rough: 0.4 });
  const flower = mat('paint', 0xffd23a);
  const steam = mat('cloth', 0xf4f4f4, { opacity: 0.4 });
  const juice = mat('glow', 0xffc02a, { emissiveIntensity: 0.6 });
  r.bone('bottle', 'root');
  r.add('bottle',
    lathe([[0.001, 0], [0.1, 0], [0.11, 0.02], [0.11, 0.3], [0.1, 0.33], [0.08, 0.35], [0.001, 0.35]], red, { seg: 32 }),
    lathe([[0.112, 0.0], [0.116, 0.01], [0.116, 0.04], [0.112, 0.05]], chrome, { seg: 32 }),
    lathe([[0.112, 0.26], [0.116, 0.27], [0.116, 0.3], [0.112, 0.31]], chrome, { seg: 32 }),
    // estampa de flores
    ...[[0, 0.15], [60, 0.2], [120, 0.12], [-60, 0.18], [30, 0.08]].flatMap(([a, y]) => {
      const ar = (a * Math.PI) / 180;
      return [star(5, 0.028, 0.012, 0.005, white, { pos: [Math.sin(ar) * 0.111, y, Math.cos(ar) * 0.111], rot: [0, a, 0] }), blob([0.008, 0.008, 0.004], flower, { pos: [Math.sin(ar) * 0.116, y, Math.cos(ar) * 0.116], rot: [0, a, 0] })];
    }),
    // alça
    tube([[-0.1, 0.28, 0], [-0.17, 0.25, 0], [-0.18, 0.12, 0], [-0.1, 0.08, 0]], 0.018, black),
    // bico
    lathe([[0.001, 0.35], [0.06, 0.35], [0.055, 0.39], [0.001, 0.39]], black),
    tube([[0.05, 0.37, 0], [0.09, 0.38, 0], [0.11, 0.36, 0]], 0.012, black),
  );
  r.bone('lid', 'bottle', [-0.04, 0.39, 0]);
  r.add('lid', lathe([[0.001, 0], [0.065, 0], [0.068, 0.02], [0.05, 0.05], [0.001, 0.06]], black, { pos: [0.04, 0, 0] }), blob([0.03, 0.02, 0.03], chrome, { pos: [0.04, 0.06, 0] }));
  r.bone('steam', 'bottle', [0.11, 0.38, 0]);
  r.add('steam', ...[0, 1, 2].map((i) => blob([0.025 + i * 0.008, 0.035 + i * 0.01, 0.025], steam, { pos: [Math.sin(i * 2.2) * 0.02, 0.04 + i * 0.07, 0], castShadow: false })));
  r.bone('juice', 'bottle', [0, 0.42, 0]);
  r.add('juice', ...[[0, 0], [0.05, 0.06], [-0.04, 0.09], [0.02, 0.14]].map(([x, y], i) => blob([0.022 - i * 0.003, 0.03 - i * 0.003, 0.022], juice, { pos: [x, y, 0.01], castShadow: false })));
  r.add('juice', sparkle(0.04, mat('glow', 0xfff4c0, { emissiveIntensity: 1.6 }), { pos: [0.06, 0.16, 0.05] }));
  return r;
}
export const garrafaCafe: ModelDef = {
  id: 'garrafa-cafe',
  kind: 'prop',
  build: buildGarrafa,
  anims: {
    idle: { frames: 16, loop: true, keys: { juice: [{ t: 0, s: 0.001 }], steam: wave(8, (t) => ({ p: [0, t * 0.04, 0], s: [1 + t * 0.3, 1 + t * 0.3, 1] })) } },
    trocar: {
      frames: 16, loop: false, keys: {
        steam: [{ t: 0, s: 1 }, { t: 0.1, s: 0.001 }],
        lid: [{ t: 0, r: [0, 0, 0] }, { t: 0.2, r: [0, 0, 110], e: 'back' }, { t: 0.7, r: [0, 0, 110] }, { t: 0.85, r: [0, 0, 0], e: 'bounce' }],
        juice: [{ t: 0, s: 0.001, p: [0, 0, 0] }, { t: 0.25, s: 0.001 }, { t: 0.45, s: 1, p: [0, 0.05, 0], e: 'out' }, { t: 0.7, s: 0.6, p: [0, -0.05, 0] }, { t: 0.8, s: 0.001 }],
        bottle: [{ t: 0, r: [0, 0, 0], s: 1 }, { t: 0.1, s: [1.05, 0.92, 1.05] }, { t: 0.2, s: [0.95, 1.08, 0.95], r: [0, 0, 6] }, { t: 0.35, r: [0, 0, -6], s: 1 }, { t: 0.5, r: [0, 0, 4] }, { t: 0.85, r: [0, 0, 0], s: [1.04, 0.95, 1.04] }, { t: 1, s: 1 }],
      },
    },
  },
  cell: [96, 96],
  pivot: [48, 88],
  height: 96 / 104,
  presets: ['fabrica', 'neutro'],
};

/* ------------------------------ CELULAR ------------------------------ */
function buildCelular() {
  const r = new Rig('root');
  const caseM = mat('plastic', 0x2a8a8a, { rough: 0.3 });
  const glassM = mat('glow', 0x8ac8ff, { emissiveIntensity: 0.55 });
  const black = mat('plastic', 0x101418, { rough: 0.2 });
  const sticker = mat('paint', 0xffc02a);
  r.bone('phone', 'root', [0, 0.04, 0]);
  r.bones.phone.scale.setScalar(1.4);
  const g = grp([
    roundBox([0.36, 0.035, 0.18], 0.02, caseM),
    roundBox([0.33, 0.006, 0.155], 0.003, black, { pos: [0, 0.019, 0] }),
    roundBox([0.29, 0.004, 0.135], 0.002, glassM, { pos: [0.01, 0.023, 0] }),
    // "foto" na tela: duas silhuetas (tamanduá e macaquinha) contra o céu
    blob([0.04, 0.003, 0.03], mat('glow', 0x8a6a4a, { emissiveIntensity: 0.4 }), { pos: [0.03, 0.026, -0.02] }),
    tube([[0.06, 0.026, -0.02], [0.11, 0.026, -0.025]], 0.008, mat('glow', 0x6a5040, { emissiveIntensity: 0.4 }), { scale: [1, 0.3, 1] }),
    blob([0.025, 0.003, 0.025], mat('glow', 0xd89a5a, { emissiveIntensity: 0.4 }), { pos: [-0.06, 0.026, 0.03] }),
    blob([0.03, 0.003, 0.03], mat('glow', 0xffe070, { emissiveIntensity: 0.8 }), { pos: [-0.1, 0.026, -0.04] }),
    // rachadura na tela
    tube([[0.08, 0.027, 0.06], [0.04, 0.027, 0.03], [0.05, 0.027, 0.0], [0.0, 0.027, -0.03]], 0.0025, mat('paint', 0xffffff), { seg: 10, radial: 4 }),
    // câmera e adesivo
    blob([0.012, 0.004, 0.012], black, { pos: [-0.155, 0.02, 0.05] }),
    star(5, 0.025, 0.011, 0.004, sticker, { pos: [0.1, -0.02, 0.0], rot: [90, 0, 0] }),
  ], [0, 0, 0], [0, -20, 8]);
  r.add('phone', g);
  r.bone('spark', 'phone', [0.12, 0.08, 0.05]);
  r.add('spark', sparkle(0.07, mat('glow', 0xffffff, { emissiveIntensity: 2 })), sparkle(0.035, mat('glow', 0xbfe8ff, { emissiveIntensity: 2 }), { pos: [-0.25, 0.02, -0.05], rot: [0, 0, 45] }));
  r.add('phone', blob([0.2, 0.06, 0.1], additive(mat('glow', 0x6ab0ff, { emissiveIntensity: 0.3, opacity: 0.25 })), { pos: [0, 0.03, 0], castShadow: false }));
  return r;
}
export const celular: ModelDef = {
  id: 'celular',
  kind: 'prop',
  build: buildCelular,
  anims: {
    idle: { frames: 12, loop: true, keys: { spark: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.6 + 0.5), r: [0, 0, t * 90] })) } },
  },
  cell: [96, 64],
  pivot: [48, 52],
  height: 64 / 104,
  presets: ['selva', 'neutro'],
  camera: { pitch: -24 },
};

/* ------------------------------ CANOA ------------------------------ */
function buildCanoa() {
  const r = new Rig('root');
  const wood = mat('wood', 0x8a5228, { repeat: 2 });
  const inner = mat('wood', 0x5e381c, { repeat: 2 });
  const paintW = mat('paint', 0xf4ecd8);
  const paintR = mat('paint', 0xc8402a);
  const ropeM = mat('cloth', 0xc8a868, { repeat: 6 });
  const L = 2.3;
  r.bone('boat', 'root', [0, 0.1, 0]);
  // casco: torno deitado e escavado (metade de cima removida)
  const hull = (rad: number, m: ReturnType<typeof mat>) => lathe([[0.02, -L / 2], [rad * 0.55, -L / 2 + 0.15], [rad * 0.9, -L / 2 + 0.45], [rad, 0], [rad * 0.9, L / 2 - 0.45], [rad * 0.55, L / 2 - 0.15], [0.02, L / 2]], m, {
    rot: [0, 0, -90], seg: 32,
    deform: [(p) => { if (p.x < 0) p.x = 0; }, (p) => { const t = Math.abs(p.y) / (L / 2); p.x -= t * t * 0.12; }],
  });
  r.add('boat', hull(0.3, wood), grp([hull(0.27, inner)], [0, 0.012, 0], [0, 0, 0], [0.98, 0.93, 0.92]));
  // amurada (borda) com faixa pintada de triângulos
  r.add('boat',
    tube(Array.from({ length: 13 }, (_, i) => { const x = -L / 2 + 0.1 + (i / 12) * (L - 0.2); const t = Math.abs(x) / (L / 2); return [x, t * t * 0.12 + 0.005, Math.sqrt(Math.max(0, 1 - t ** 2.2)) * 0.29] as V3; }), 0.022, wood, { seg: 60, radial: 8 }),
    tube(Array.from({ length: 13 }, (_, i) => { const x = -L / 2 + 0.1 + (i / 12) * (L - 0.2); const t = Math.abs(x) / (L / 2); return [x, t * t * 0.12 + 0.005, -Math.sqrt(Math.max(0, 1 - t ** 2.2)) * 0.29] as V3; }), 0.022, wood, { seg: 60, radial: 8 }),
  );
  for (let i = 0; i < 11; i++) {
    const x = -0.75 + i * 0.15;
    const t = Math.abs(x) / (L / 2);
    const z = Math.sqrt(Math.max(0, 1 - t ** 2.2)) * 0.3 * 0.97;
    r.add('boat', slab([[-0.05, 0], [0.05, 0], [0, -0.07]], 0.006, i % 2 ? paintR : paintW, { pos: [x, -0.04 + t * t * 0.1, z], rot: [-15, 0, 0], smooth: false }));
  }
  // bancos e amarrações
  for (const x of [-0.5, 0.45]) r.add('boat', roundBox([0.12, 0.03, 0.54], 0.01, wood, { pos: [x, -0.04, 0] }), rope([[x - 0.07, -0.02, 0.27], [x, 0.0, 0.29], [x + 0.07, -0.02, 0.27]], 0.01, ropeM, { twists: 4 }));
  // proa com olho pintado (tradição ribeirinha)
  r.add('boat',
    blob([0.04, 0.03, 0.006], paintW, { pos: [0.95, 0.03, 0.155], rot: [0, 20, 0] }),
    blob([0.02, 0.02, 0.006], mat('paint', 0x1a1a1a), { pos: [0.955, 0.03, 0.16], rot: [0, 20, 0] }),
    tube([[1.12, 0.12, 0], [1.2, 0.18, 0], [1.24, 0.17, 0]], 0.02, wood),
    rope([[1.18, 0.16, 0], [1.25, 0.05, 0.05], [1.3, -0.08, 0.08]], 0.012, ropeM, { twists: 5 }),
    // cesto de peixe e cuia
    lathe([[0.001, 0], [0.08, 0.005], [0.1, 0.06], [0.09, 0.08]], mat('cloth', 0xb89a5e, { repeat: 4 }), { pos: [-0.15, -0.2, 0.05] }),
    lathe([[0.001, 0], [0.06, 0.01], [0.075, 0.05]], mat('gourd', 0xc89a48), { pos: [0.2, -0.2, -0.08], rot: [20, 0, 10] }),
  );
  r.bone('ripple', 'root', [0, 0.04, 0]);
  r.add('ripple', ring(0.36, 0.014, mat('water', 0xcfefff, { opacity: 0.5 }), { rot: [90, 0, 0], scale: [3.4, 1, 1], castShadow: false }));
  return r;
}
export const canoa: ModelDef = {
  id: 'canoa',
  kind: 'prop',
  build: buildCanoa,
  anims: {
    idle: { frames: 24, loop: true, keys: { boat: wave(12, (t) => ({ p: [0, Math.sin(t * Math.PI * 2) * 0.02, 0], r: [Math.sin(t * Math.PI * 2 + 1) * 2.5, 0, Math.sin(t * Math.PI * 2) * 1] })) } },
    remar: {
      frames: 16, loop: true, keys: {
        boat: wave(8, (t) => ({ p: [Math.sin(t * Math.PI * 2) * 0.03, Math.sin(t * Math.PI * 4) * 0.015, 0], r: [Math.sin(t * Math.PI * 2) * 2, 0, Math.cos(t * Math.PI * 2) * 2.5] })),
        ripple: wave(8, (t) => ({ s: [1 + Math.sin(t * Math.PI * 2) * 0.05, 1, 1 + Math.sin(t * Math.PI * 2) * 0.15] })),
      },
    },
  },
  cell: [288, 96],
  pivot: [144, 72],
  height: 96 / 104,
  presets: ['selva', 'recife', 'neutro'],
};

/* ------------------------------ GAIOLA ------------------------------ */
function buildGaiola() {
  const r = new Rig('root');
  const bamboo = mat('wood', 0xc8a858, { repeat: 1.5 });
  const node = mat('wood', 0x8a6a30);
  const lash = mat('cloth', 0x6a4a2a, { repeat: 6 });
  const iron = mat('metal', 0x5a5650, { metal: 0.55, rough: 0.45 });
  const brass = mat('metal', 0xd8a840, { metal: 0.55, rough: 0.3 });
  const W = 0.9, H = 1.0, D = 0.6;
  r.bone('cage', 'root');
  r.bone('hang', 'cage', [0, H + 0.1, 0]);
  // base e teto de bambu
  for (const y of [0.04, H]) {
    for (const z of [-D / 2, D / 2]) r.add('cage', tube([[-W / 2 - 0.05, y, z], [W / 2 + 0.05, y, z]], 0.035, bamboo, { seg: 10, radial: 10 }));
    for (const x of [-W / 2, W / 2]) r.add('cage', tube([[x, y, -D / 2 - 0.05], [x, y, D / 2 + 0.05]], 0.035, bamboo, { seg: 10, radial: 10 }));
  }
  r.add('cage', roundBox([W, 0.03, D], 0.01, mat('wood', 0x7a5a2a), { pos: [0, 0.03, 0] }));
  // grades verticais (frente e trás), com nós de bambu e amarrações cruzadas
  const nb = 7;
  for (let i = 0; i < nb; i++) {
    const x = -W / 2 + (i / (nb - 1)) * W;
    for (const z of [-D / 2, D / 2]) {
      r.add('cage', tube([[x, 0.02, z], [x + Math.sin(i * 1.9) * 0.01, H / 2, z], [x, H + 0.02, z]], 0.022, bamboo, { seg: 10, radial: 8 }));
      for (const y of [0.35, 0.7]) r.add('cage', lathe([[0.023, -0.01], [0.027, 0], [0.023, 0.01]], node, { pos: [x, y + (i % 2) * 0.05, z] }));
      if (z > 0) for (const y of [0.04, H]) r.add('cage', ring(0.04, 0.008, lash, { pos: [x, y, z], rot: [0, 0, 45] }));
    }
  }
  for (const x of [-W / 2, W / 2]) for (let k = 1; k < 4; k++) r.add('cage', tube([[x, 0.02, -D / 2 + (k / 4) * D], [x, H + 0.02, -D / 2 + (k / 4) * D]], 0.02, bamboo, { seg: 8, radial: 8 }));
  // cadeado e corrente
  r.add('cage',
    roundBox([0.09, 0.08, 0.04], 0.012, brass, { pos: [0.1, 0.45, D / 2 + 0.05] }),
    ring(0.03, 0.008, iron, { pos: [0.1, 0.51, D / 2 + 0.05] }),
    blob([0.01, 0.016, 0.005], mat('paint', 0x1a1a1a), { pos: [0.1, 0.44, D / 2 + 0.072] }),
    ...[0, 1, 2, 3].map((k) => ring(0.025, 0.007, iron, { pos: [0.1 - 0.05 - k * 0.04, 0.52 + (k % 2) * 0.01, D / 2 + 0.04], rot: [0, k % 2 ? 90 : 0, 90] })),
  );
  // gancho de carregar
  r.add('hang',
    tube([[-W / 2 + 0.05, -0.1, 0], [-0.1, 0.12, 0], [0.1, 0.12, 0], [W / 2 - 0.05, -0.1, 0]], 0.02, mat('cloth', 0xb89a5e, { repeat: 6 })),
    ring(0.07, 0.016, iron, { pos: [0, 0.18, 0] }),
  );
  // folha caída no teto
  r.add('cage', leaf(0.18, 0.09, mat('leaf', 0x5a9a3a), { pos: [0.2, H + 0.04, 0.1], rot: [-80, 0, -60] }));
  return r;
}
export const gaiola: ModelDef = {
  id: 'gaiola',
  kind: 'prop',
  build: buildGaiola,
  anims: {
    idle: { frames: 24, loop: true, keys: { cage: wave(12, (t) => ({ r: [0, 0, Math.sin(t * Math.PI * 2) * 2] })) } },
  },
  cell: [160, 160],
  pivot: [80, 144],
  height: 160 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'neutro'],
};

/* ------------------------------ SEMENTE-MÃE ------------------------------ */
function buildSemente() {
  const r = new Rig('root');
  const root = mat('bark', 0x5a3e24, { repeat: 2 });
  const seed = mat('skin', 0xb8d84a, { rough: 0.3, emissive: 0x7ab020, emissiveIntensity: 0.5 });
  const vein = mat('glow', 0xfff4a0, { emissiveIntensity: 1.3 });
  const halo = additive(mat('glow', 0xc8ff6a, { emissiveIntensity: 0.3, opacity: 0.12 }));
  const fluff = mat('cloth', 0xfaf6ec, { opacity: 0.85 });
  const leafM = mat('leaf', 0x4a9a30);
  r.bone('base', 'root');
  // raízes formando um berço
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    r.add('base', tube([[Math.cos(a) * 0.45, 0.0, Math.sin(a) * 0.3], [Math.cos(a) * 0.3, 0.12, Math.sin(a) * 0.2], [Math.cos(a) * 0.16, 0.3, Math.sin(a) * 0.12], [Math.cos(a + 0.5) * 0.1, 0.42, Math.sin(a + 0.5) * 0.07]], (t) => 0.05 * (1 - t * 0.7), root, { seg: 24, radial: 10 }));
  }
  r.add('base', leaf(0.22, 0.12, leafM, { pos: [0.3, 0.08, 0.15], rot: [0, 30, -60] }), leaf(0.2, 0.1, leafM, { pos: [-0.3, 0.08, 0.12], rot: [0, -20, 60] }));
  r.bone('seed', 'base', [0, 0.62, 0]);
  r.add('seed',
    blob([0.17, 0.24, 0.17], seed, { deform: [taper('y', -0.24, 0.24, 1.05, 0.55)], seg: 36 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2;
      return tube(Array.from({ length: 7 }, (_, k) => { const v = -0.85 + k * 0.28; const rr = Math.cos(v) * 0.172 * (1 - (Math.sin(v) * 0.24 + 0.24) / 0.48 * 0.45); return [Math.sin(a + k * 0.08) * rr, Math.sin(v) * 0.24, Math.cos(a + k * 0.08) * rr] as V3; }), 0.008, vein, { seg: 24, radial: 5, castShadow: false });
    }),
    blob([0.04, 0.03, 0.04], mat('bark', 0x6a4a2a), { pos: [0, 0.23, 0] }),
  );
  r.bone('halo', 'seed');
  r.add('halo', blob([0.36, 0.42, 0.36], halo, { castShadow: false }));
  // fiapos de paina (sumaúma) flutuando
  r.bone('fluff', 'base', [0, 0.62, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = grp([
      blob([0.008, 0.008, 0.008], mat('wood', 0x5a3a1a)),
      ...[0, 1, 2, 3, 4].map((k) => tube([[0, 0, 0], [Math.cos(k * 1.25) * 0.03, 0.05, Math.sin(k * 1.25) * 0.03], [Math.cos(k * 1.25) * 0.05, 0.08, Math.sin(k * 1.25) * 0.05]], 0.003, fluff, { seg: 6, radial: 4, castShadow: false })),
    ], [Math.cos(a) * 0.4, Math.sin(i * 2.1) * 0.2, Math.sin(a) * 0.3]);
    r.add('fluff', g);
  }
  r.bone('sparks', 'seed');
  r.add('sparks', ...[[0.25, 0.2], [-0.28, 0.05], [0.18, -0.22], [-0.12, 0.3]].map(([x, y], i) => sparkle(0.04 + (i % 2) * 0.02, mat('glow', 0xffffc0, { emissiveIntensity: 2 }), { pos: [x, y, 0.2] })));
  return r;
}
export const sementeMae: ModelDef = {
  id: 'semente-mae',
  kind: 'prop',
  build: buildSemente,
  anims: {
    idle: {
      frames: 24, loop: true, keys: {
        seed: wave(12, (t) => ({ p: [0, Math.sin(t * Math.PI * 2) * 0.04, 0], r: [0, t * 30, Math.sin(t * Math.PI * 2) * 3] })),
        halo: wave(12, (t) => ({ s: 1 + Math.sin(t * Math.PI * 2) * 0.12 })),
        fluff: wave(12, (t) => ({ r: [0, t * 60, 0], p: [0, Math.sin(t * Math.PI * 2) * 0.03, 0] })),
        sparks: wave(12, (t) => ({ s: 0.6 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.6, r: [0, 0, t * 90] })),
      },
    },
  },
  cell: [160, 160],
  pivot: [80, 148],
  height: 160 / 104,
  presets: ['selva', 'bonus', 'neutro', 'por-do-sol'],
};

/* ------------------------------ PLACA DO TRILHO ------------------------------ */
function buildPlaca() {
  const r = new Rig('root');
  const wood = mat('wood', 0x9a6a3a);
  const dark = mat('wood', 0x5a3618);
  const iron = mat('rust', 0x5a4a40, { metal: 0.5 });
  const red = mat('paint', 0xd83a2a);
  const yellow = mat('paint', 0xf4c030);
  const white = mat('paint', 0xf4ecd8);
  r.bone('post', 'root');
  r.add('post',
    roundBox([0.3, 0.06, 0.2], 0.02, iron, { pos: [0, 0.03, 0] }),
    tube([[0, 0.05, 0], [0.01, 0.6, 0], [0, 1.0, 0]], 0.04, wood, { seg: 12 }),
    ...[0.3, 0.7].map((y) => lathe([[0.042, -0.02], [0.046, 0], [0.042, 0.02]], iron, { pos: [0, y, 0] })),
  );
  // placa-seta giratória
  r.bone('sign', 'post', [0, 1.0, 0]);
  r.add('sign',
    slab([[-0.28, -0.1], [0.12, -0.1], [0.12, -0.18], [0.32, 0], [0.12, 0.18], [0.12, 0.1], [-0.28, 0.1]], 0.04, yellow, { smooth: false, bevel: 0.012 }),
    slab([[-0.22, -0.05], [0.12, -0.05], [0.12, -0.11], [0.24, 0], [0.12, 0.11], [0.12, 0.05], [-0.22, 0.05]], 0.01, red, { pos: [0, 0, 0.028], smooth: false, bevel: 0.004 }),
    slab([[-0.22, -0.05], [0.12, -0.05], [0.12, -0.11], [0.24, 0], [0.12, 0.11], [0.12, 0.05], [-0.22, 0.05]], 0.01, red, { pos: [0, 0, -0.028], smooth: false, bevel: 0.004 }),
    blob([0.03, 0.03, 0.035], iron),
    ...[[-0.24, 0.06], [-0.24, -0.06]].map(([x, y]) => nail(0.012, white, { pos: [x, y, 0.03] })),
  );
  // alavanca de manobra
  r.bone('lever', 'post', [0.12, 0.08, 0.06]);
  r.add('post', roundBox([0.1, 0.06, 0.08], 0.01, dark, { pos: [0.12, 0.08, 0.06] }));
  r.add('lever', tube([[0, 0, 0], [0, 0.32, 0]], 0.014, iron), blob([0.035, 0.05, 0.035], red, { pos: [0, 0.34, 0] }));
  return r;
}
export const placaTrilho: ModelDef = {
  id: 'placa-trilho',
  kind: 'prop',
  build: buildPlaca,
  anims: {
    esquerda: { frames: 8, loop: false, keys: { sign: [{ t: 0, r: [0, 0, 0] }, { t: 0.7, r: [0, 180, 0], e: 'back' }, { t: 1, r: [0, 180, 0] }], lever: [{ t: 0, r: [0, 0, -35] }, { t: 0.4, r: [0, 0, 35], e: 'out' }, { t: 1, r: [0, 0, 35] }], post: [{ t: 0, r: [0, 0, 0] }, { t: 0.5, r: [0, 0, 3] }, { t: 0.75, r: [0, 0, -2] }, { t: 1, r: [0, 0, 0] }] } },
    direita: { frames: 8, loop: false, keys: { sign: [{ t: 0, r: [0, 180, 0] }, { t: 0.7, r: [0, 360, 0], e: 'back' }, { t: 1, r: [0, 360, 0] }], lever: [{ t: 0, r: [0, 0, 35] }, { t: 0.4, r: [0, 0, -35], e: 'out' }, { t: 1, r: [0, 0, -35] }], post: [{ t: 0, r: [0, 0, 0] }, { t: 0.5, r: [0, 0, -3] }, { t: 0.75, r: [0, 0, 2] }, { t: 1, r: [0, 0, 0] }] } },
  },
  cell: [128, 160],
  pivot: [64, 148],
  height: 160 / 104,
  presets: ['caverna', 'neutro'],
};

/* ------------------------------ SERRA GIGANTE ------------------------------ */
function buildSerra() {
  const r = new Rig('root');
  const steel = mat('metal', 0xd8dce2, { metal: 0.45, rough: 0.3 });
  const steelDark = mat('metal', 0x8a8e94, { metal: 0.45, rough: 0.4 });
  const rust = mat('rust', 0x8a4a2a, { metal: 0.4 });
  const yellow = mat('paint', 0xe8b020);
  const black = mat('paint', 0x1a1a1a);
  const R = 0.8;
  r.bone('blade', 'root', [0, R + 0.1, 0]);
  const teeth = 24;
  const outline: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.62) / teeth) * Math.PI * 2;
    const a2 = ((i + 0.7) / teeth) * Math.PI * 2;
    outline.push([Math.cos(a0) * R * 0.9, Math.sin(a0) * R * 0.9], [Math.cos(a1) * R, Math.sin(a1) * R], [Math.cos(a2) * R * 0.88, Math.sin(a2) * R * 0.88]);
  }
  r.add('blade',
    slab(outline, 0.03, steel, { smooth: false, bevel: 0.008 }),
    ring(R * 0.6, 0.012, steelDark, { pos: [0, 0, 0.022] }),
    lathe([[0.001, -0.06], [0.2, -0.06], [0.22, -0.03], [0.22, 0.03], [0.2, 0.06], [0.001, 0.06]], steelDark, { rot: [90, 0, 0], seg: 32 }),
    lathe([[0.001, 0.06], [0.08, 0.06], [0.07, 0.09], [0.001, 0.09]], yellow, { rot: [90, 0, 0] }),
    ...[0, 1, 2, 3, 4, 5].map((i) => blob([0.025, 0.025, 0.02], steel, { pos: [Math.cos(i * 1.047) * 0.15, Math.sin(i * 1.047) * 0.15, 0.065] })),
    // furos de alívio e manchas de ferrugem
    ...[0, 1, 2].map((i) => ring(0.06, 0.012, steelDark, { pos: [Math.cos(i * 2.094 + 0.5) * 0.42, Math.sin(i * 2.094 + 0.5) * 0.42, 0.018] })),
    ...[0, 1, 2].map((i) => blob([0.06, 0.04, 0.004], rust, { pos: [Math.cos(i * 2.094 + 1.5) * 0.5, Math.sin(i * 2.094 + 1.5) * 0.5, 0.017], rot: [0, 0, i * 50] })),
    // borrão de giro (disco translúcido)
    blob([R * 0.98, R * 0.98, 0.005], additive(mat('glow', 0xbfc8d0, { emissiveIntensity: 0.2, opacity: 0.12 })), { pos: [0, 0, 0.03], castShadow: false }),
  );
  // suporte com faixas de alerta
  r.bone('arm', 'root');
  r.add('arm',
    roundBox([0.5, 0.12, 0.4], 0.03, steelDark, { pos: [0, 0.06, -0.15] }),
    roundBox([0.16, R + 0.15, 0.1], 0.03, yellow, { pos: [0, (R + 0.15) / 2, -0.12] }),
    ...[0, 1, 2, 3].map((i) => slab([[-0.08, 0], [0.08, 0.1], [0.08, 0.16], [-0.08, 0.06]], 0.006, black, { pos: [0, 0.12 + i * 0.2, -0.065], smooth: false })),
  );
  // fagulhas
  r.bone('sparks', 'root', [R * 0.7, 0.2, 0.2]);
  r.add('sparks', ...[0, 1, 2, 3].map((i) => spike(0.12 - i * 0.02, 0.012, mat('glow', 0xffc040, { emissiveIntensity: 2 }), { pos: [0, 0, i * 0.02], rot: [0, 0, -30 - i * 18], castShadow: false })));
  return r;
}
export const serraGigante: ModelDef = {
  id: 'serra-gigante',
  kind: 'prop',
  build: buildSerra,
  anims: {
    girar: {
      frames: 6, loop: true, keys: {
        blade: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, 0, -120], e: 'linear' }],
        sparks: wave(6, (t) => ({ s: 0.5 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.7 })),
      },
    },
  },
  cell: [224, 224],
  pivot: [112, 212],
  height: 224 / 104,
  presets: ['fabrica', 'selva', 'neutro'],
  camera: { yaw: 10, pitch: -6 },
};
