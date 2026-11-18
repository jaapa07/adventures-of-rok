/**
 * Efeitos de impacto e movimento: POEIRA, FAÍSCA, ESTRELAS de tonto, FUMAÇA de derrota (com latas),
 * LASCAS (cabaça/madeira/pedra) e ÁGUA (respingo e bolhas).
 */
import { Rig, blob, tube, slab, lathe, mat, wobble, star, sparkle, THREE, track, life, eo, arc3, hide, puff, fxDef, Z, type V3, type Key } from './lib';
import { wedge } from '../props/kit';

/* ------------------------------ POEIRA ------------------------------ */
// [x0,y0,z0, x1,y1,z1, raio, t0, t1]
const DUST: Record<string, number[][]> = {
  corrida: [[0, 0.06, 0.02, -0.34, 0.16, 0.04, 0.09, 0, 0.85], [0.04, 0.04, -0.03, -0.24, 0.1, -0.05, 0.07, 0.1, 0.95], [0.06, 0.03, 0.06, -0.18, 0.22, 0.08, 0.055, 0.2, 1], [-0.02, 0.03, 0.0, -0.44, 0.06, 0.0, 0.05, 0.05, 0.75]],
  pulo: [[0.0, 0.03, 0.05, 0.3, 0.07, 0.08, 0.075, 0, 0.9], [0.0, 0.03, 0.05, -0.3, 0.07, 0.08, 0.075, 0, 0.9], [0.0, 0.03, -0.05, 0.18, 0.14, -0.05, 0.06, 0.08, 1], [0.0, 0.03, -0.05, -0.18, 0.14, -0.05, 0.06, 0.08, 1]],
  aterrissar: [[0.05, 0.03, 0.06, 0.48, 0.07, 0.1, 0.09, 0, 0.9], [-0.05, 0.03, 0.06, -0.48, 0.07, 0.1, 0.09, 0, 0.9], [0.05, 0.03, -0.05, 0.32, 0.12, -0.06, 0.08, 0.05, 1], [-0.05, 0.03, -0.05, -0.32, 0.12, -0.06, 0.08, 0.05, 1], [0.0, 0.03, 0.08, 0.16, 0.18, 0.12, 0.06, 0.1, 0.95], [0.0, 0.03, 0.08, -0.16, 0.18, 0.12, 0.06, 0.1, 0.95]],
};
function buildPoeira() {
  const r = new Rig('root');
  const mats = [mat('cloth', 0xe0ccaa, { opacity: 0.88, rough: 1 }), mat('cloth', 0xcab490, { opacity: 0.85, rough: 1 }), mat('cloth', 0xf0e2c8, { opacity: 0.8, rough: 1 })];
  for (const [name, list] of Object.entries(DUST)) list.forEach((d, i) => {
    r.bone(`${name}${i}`, 'root');
    r.add(`${name}${i}`, puff(d[6], mats[i % 3], i));
  });
  // pedrinhas que pulam
  r.bone('pebbles', 'root');
  r.add('pebbles', ...[[-0.15, 0.08, 0.05], [0.12, 0.1, 0.06], [0.0, 0.14, 0.02]].map((p, i) => blob([0.014, 0.012, 0.012], mat('rock', 0x8a7a62), { pos: p as V3, deform: [wobble(0.003, 60)], seg: 10, castShadow: false, rot: [0, i * 40, i * 30] })));
  return r;
}
const dustAnim = (name: string) => {
  const keys: Record<string, Key[]> = hide(Object.entries(DUST).filter(([n]) => n !== name).flatMap(([n, l]) => l.map((_, i) => `${n}${i}`)));
  DUST[name].forEach((d, i) => {
    keys[`${name}${i}`] = track(d[7], d[8], (u) => { const k = eo(u); return [d[0] + (d[3] - d[0]) * k, d[1] + (d[4] - d[1]) * k, d[2] + (d[5] - d[2]) * k]; }, (u) => life(1.15, 0.3, 0.45)(u) * (0.7 + u * 0.6), (u) => [0, u * 40 * (i % 2 ? 1 : -1), u * 90 * (i % 2 ? -1 : 1)], 8);
  });
  keys.pebbles = name === 'aterrissar' ? [{ t: 0, s: Z, p: [0, 0, 0] }, { t: 0.15, s: 1, p: [0, 0.03, 0] }, { t: 0.6, s: 1, p: [0, 0.1, 0], e: 'out' }, { t: 1, s: Z, p: [0, -0.05, 0], e: 'in' }] : [{ t: 0, s: Z }];
  return { frames: 6, loop: false, keys };
};
export const fxPoeira = fxDef('fx-poeira', buildPoeira, { corrida: dustAnim('corrida'), pulo: dustAnim('pulo'), aterrissar: dustAnim('aterrissar') }, [128, 64], [64, 56]);

/* ------------------------------ FAÍSCA ------------------------------ */
function buildFaisca() {
  const r = new Rig('root');
  const core = mat('glow', 0xfff6c0, { emissiveIntensity: 1.8 });
  const yel = mat('glow', 0xffd23a, { emissiveIntensity: 1.3 });
  const ora = mat('glow', 0xff8a1a, { emissiveIntensity: 1.1 });
  r.bone('flash', 'root');
  r.add('flash', star(8, 0.2, 0.07, 0.02, yel, { castShadow: false }), star(8, 0.12, 0.05, 0.03, core, { pos: [0, 0, 0.01], rot: [0, 0, 22], castShadow: false }));
  r.bone('ring', 'root');
  r.add('ring', lathe([[0.14, -0.006], [0.16, 0], [0.14, 0.006]], mat('glow', 0xfff0a0, { emissiveIntensity: 1.2 }), { rot: [90, 0, 0], seg: 36, castShadow: false }));
  for (let i = 0; i < 7; i++) {
    r.bone(`s${i}`, 'root', [0, 0, 0], [0, 0, i * (360 / 7) + 12]);
    r.bone(`s${i}m`, `s${i}`);
    r.add(`s${i}m`, tube([[0, 0, 0], [0.09, 0, 0]], (t) => 0.022 * (1 - t) + 0.004, i % 2 ? yel : ora, { seg: 6, radial: 6, castShadow: false }));
  }
  return r;
}
const sparkKeys: Record<string, Key[]> = {
  flash: [{ t: 0, s: 0.4, r: [0, 0, 0] }, { t: 0.2, s: 1.3, r: [0, 0, 15], e: 'out' }, { t: 0.6, s: 0.6, r: [0, 0, 30] }, { t: 1, s: Z, r: [0, 0, 40], e: 'in' }],
  ring: [{ t: 0, s: 0.3 }, { t: 0.4, s: 1.6, e: 'out' }, { t: 0.8, s: 2 }, { t: 1, s: Z }],
  ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`s${i}m`, track(0, 0.9 + (i % 3) * 0.033, (u) => [0.06 + eo(u) * (0.22 + (i % 3) * 0.05), 0, 0], (u) => (u < 0.2 ? u / 0.2 : (1 - u) / 0.8 + 0.1) * 1.2 as number, undefined, 6)])),
};
export const fxFaisca = fxDef('fx-faisca', buildFaisca, { impacto: { frames: 6, loop: false, keys: sparkKeys } }, [96, 96], [48, 48], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ ESTRELAS (tonto) ------------------------------ */
function buildEstrelas() {
  const r = new Rig('root');
  const yel = mat('glow', 0xffd23a, { emissiveIntensity: 0.7, rim: 0.6 });
  const pink = mat('glow', 0xff8ab0, { emissiveIntensity: 0.6 });
  const blue = mat('glow', 0x8ad8ff, { emissiveIntensity: 0.6 });
  r.bone('orbit', 'root', [0, 0.06, 0]);
  const cols = [yel, pink, blue];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    r.bone(`st${i}`, 'orbit', [Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22]);
    r.bone(`st${i}s`, `st${i}`);
    r.add(`st${i}s`, star(5, 0.065, 0.03, 0.022, cols[i], { castShadow: false }), sparkle(0.03, mat('glow', 0xffffff, { emissiveIntensity: 2 }), { pos: [0.05, 0.05, 0.02] }));
  }
  // anel de "passarinhos" (trilha pontilhada da órbita)
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3;
    r.add('orbit', blob([0.008, 0.008, 0.008], mat('glow', 0xfff0c0, { emissiveIntensity: 1 }), { pos: [Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22], castShadow: false }));
  }
  return r;
}
export const fxEstrelas = fxDef('fx-estrelas', buildEstrelas, {
  tonto: {
    frames: 8, loop: true, keys: {
      orbit: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, -360, 0], e: 'linear' }],
      ...Object.fromEntries([0, 1, 2].map((i) => [`st${i}s`, [{ t: 0, r: [0, 0, 0] as V3 }, { t: 1, r: [0, 360, -360] as V3, e: 'linear' as const }]])),
    },
  },
}, [96, 64], [48, 40], { camera: { yaw: 0, pitch: -22 } });

/* ------------------------------ FUMAÇA de derrota + latas ------------------------------ */
const SMOKE: number[][] = [[0, 0, 0, 0, 0.12, 0, 0.13, 0, 0.9], [0.05, 0.02, 0.05, 0.26, 0.18, 0.06, 0.1, 0.02, 0.85], [-0.05, 0.02, 0.05, -0.26, 0.2, 0.06, 0.1, 0.02, 0.85], [0.04, 0, -0.05, 0.18, 0.34, -0.05, 0.09, 0.08, 1], [-0.04, 0, -0.05, -0.16, 0.36, -0.05, 0.085, 0.08, 1], [0, 0, 0.08, 0.02, 0.3, 0.1, 0.075, 0.12, 1]];
function buildFumaca() {
  const r = new Rig('root');
  const sm = [mat('cloth', 0xd8d4e0, { opacity: 0.9, rough: 1 }), mat('cloth', 0xb8b4c8, { opacity: 0.88, rough: 1 }), mat('cloth', 0xf0eef4, { opacity: 0.85, rough: 1 })];
  SMOKE.forEach((d, i) => { r.bone(`p${i}`, 'root'); r.add(`p${i}`, puff(d[6], sm[i % 3], i)); });
  r.bone('flash', 'root');
  r.add('flash', star(6, 0.16, 0.07, 0.02, mat('glow', 0xfff4c0, { emissiveIntensity: 1.6 }), { castShadow: false }));
  // pedaços de lata: chapa amassada, parafuso, mola, tampinha
  const tin = mat('metal', 0xb8bcc4, { metal: 0.5, rough: 0.3 });
  const rust = mat('rust', 0x9a5a3a, { metal: 0.4 });
  const red = mat('paint', 0xc8402a);
  r.bone('j0', 'root'); r.add('j0', slab([[-0.05, -0.03], [0.05, -0.04], [0.06, 0.03], [-0.04, 0.04]], 0.008, tin, { deform: [(p) => { p.z += Math.sin(p.x * 40) * 0.01; }] }), slab([[-0.03, -0.01], [0.03, -0.012], [0.03, 0.012], [-0.03, 0.01]], 0.004, red, { pos: [0, 0, 0.006] }));
  r.bone('j1', 'root'); r.add('j1', lathe([[0.012, -0.03], [0.012, 0.02], [0.025, 0.02], [0.025, 0.035], [0.001, 0.035]], tin, { seg: 6 }));
  r.bone('j2', 'root'); r.add('j2', tube(Array.from({ length: 30 }, (_, i) => [Math.cos(i * 0.8) * 0.022, -0.04 + i * 0.0027, Math.sin(i * 0.8) * 0.022] as V3), 0.005, tin, { seg: 90, radial: 5 }));
  r.bone('j3', 'root'); r.add('j3', lathe([[0.001, 0], [0.035, 0], [0.04, 0.008], [0.03, 0.012], [0.001, 0.012]], rust, { rot: [80, 0, 0] }));
  r.bone('j4', 'root'); r.add('j4', slab([[-0.04, -0.02], [0.04, -0.03], [0.03, 0.03], [-0.03, 0.02]], 0.006, rust, { deform: [(p) => { p.z += p.x * p.x * 6; }] }));
  return r;
}
const JUNK: [V3, number, V3][] = [[[0.34, -0.1, 0.1], 0.32, [200, 90, 400]], [[-0.3, -0.12, 0.08], 0.28, [-160, 60, -500]], [[0.18, -0.18, 0.12], 0.42, [100, 300, 260]], [[-0.16, -0.16, -0.05], 0.36, [300, -120, 200]], [[0.04, -0.2, 0.14], 0.46, [-200, 160, -300]]];
export const fxFumaca = fxDef('fx-fumaca', buildFumaca, {
  derrota: {
    frames: 10, loop: false, keys: {
      flash: [{ t: 0, s: 0.6, r: [0, 0, 0] }, { t: 0.12, s: 1.4, r: [0, 0, 12], e: 'out' }, { t: 0.3, s: Z, r: [0, 0, 20] }],
      ...Object.fromEntries(SMOKE.map((d, i) => [`p${i}`, track(d[7], d[8], (u) => { const k = eo(u); return [d[0] + (d[3] - d[0]) * k, d[1] + (d[4] - d[1]) * k, d[2] + (d[5] - d[2]) * k]; }, life(1.2, 0.25, 0.5), (u) => [0, u * 50, u * 60 * (i % 2 ? 1 : -1)], 9)])),
      ...Object.fromEntries(JUNK.map(([end, h, spin], i) => [`j${i}`, track(0.02, 1, arc3([0, 0.02, 0], end, h), (u) => (u < 0.1 ? u / 0.1 : 1), (u) => [spin[0] * u, spin[1] * u, spin[2] * u], 9)])),
    },
  },
}, [192, 160], [96, 96]);

/* ------------------------------ LASCAS ------------------------------ */
type Shard = { end: V3; h: number; spin: V3; t0: number };
const SHARDS: Shard[] = [
  { end: [0.42, -0.2, 0.1], h: 0.3, spin: [120, 60, -540], t0: 0 }, { end: [-0.4, -0.22, 0.08], h: 0.34, spin: [-90, 40, 500], t0: 0 },
  { end: [0.24, -0.26, -0.08], h: 0.44, spin: [200, -60, -300], t0: 0.03 }, { end: [-0.22, -0.24, -0.06], h: 0.42, spin: [-160, 80, 360], t0: 0.03 },
  { end: [0.1, -0.3, 0.14], h: 0.52, spin: [60, 200, -200], t0: 0.06 }, { end: [-0.08, -0.28, 0.12], h: 0.5, spin: [-60, -160, 220], t0: 0.06 },
  { end: [0.5, -0.1, 0.0], h: 0.18, spin: [0, 0, -720], t0: 0.0 },
];
function buildLascas() {
  const r = new Rig('root');
  const gourd = [mat('gourd', 0xcf9b48), mat('gourd', 0xb8843a)];
  const gourdIn = mat('skin', 0xd9c48e, { rough: 0.9 });
  const seed = mat('wood', 0x3a2414, { rough: 0.4 });
  const wood = [mat('wood', 0xc89a5a), mat('wood', 0x9a6a3a)];
  const dust = mat('cloth', 0xd8c09a, { opacity: 0.85 });
  const rock = [mat('rock', 0x8a857a), mat('rock', 0x6a665e)];
  const rockDust = mat('cloth', 0xb8b4ac, { opacity: 0.85 });
  SHARDS.forEach((_, i) => {
    r.bone(`c${i}`, 'root');
    r.add(`c${i}`, i === 6 ? blob([0.03, 0.02, 0.016], seed, { seg: 10 }) : grp2([wedge([[0.06, -0.05], [0.075, 0], [0.06, 0.05]], gourd[i % 2], 0, 70, { seg: 6 }), wedge([[0.055, -0.045], [0.068, 0], [0.055, 0.045]], gourdIn, 0, 70, { seg: 6 })], [-0.05, 0, 0]));
    r.bone(`m${i}`, 'root');
    r.add(`m${i}`, i === 6 ? puff(0.05, dust, 3) : slab([[-0.07, -0.01], [0.0, -0.016], [0.08, -0.004], [0.09, 0.0], [0.07, 0.012], [-0.05, 0.014]], 0.016, wood[i % 2], { smooth: false, bevel: 0.004 }));
    r.bone(`s${i}`, 'root');
    r.add(`s${i}`, i === 6 ? puff(0.055, rockDust, 4) : blob([0.04 - (i % 3) * 0.006, 0.032, 0.035], rock[i % 2], { deform: [wobble(0.008, 40), (p) => { p.x = Math.round(p.x * 60) / 60; }], seg: 8 }));
  });
  return r;
}
function grp2(children: THREE.Object3D[], pos: V3) { const g = new THREE.Group(); g.position.set(...pos); for (const c of children) g.add(c); return g; }
const lascaAnim = (pre: string) => {
  const others = ['c', 'm', 's'].filter((x) => x !== pre).flatMap((x) => SHARDS.map((_, i) => `${x}${i}`));
  return {
    frames: 8, loop: false, keys: {
      ...hide(others),
      ...Object.fromEntries(SHARDS.map((d, i) => [`${pre}${i}`, i === 6 && pre !== 'c'
        ? track(0, 1, (u) => [eo(u) * 0.1, eo(u) * 0.15, 0], life(1.6, 0.2, 0.4), undefined, 7)
        : track(d.t0, 1, arc3([0, 0, 0], d.end, d.h), (u) => (u < 0.08 ? 0.3 + u * 8 : u > 0.8 ? 1 - (u - 0.8) * 3 : 1), (u) => [d.spin[0] * u, d.spin[1] * u, d.spin[2] * u], 7)])),
    },
  };
};
export const fxLascas = fxDef('fx-lascas', buildLascas, { cabaca: lascaAnim('c'), madeira: lascaAnim('m'), pedra: lascaAnim('s') }, [160, 128], [80, 72]);

/* ------------------------------ ÁGUA ------------------------------ */
function buildAgua() {
  const r = new Rig('root');
  const water = mat('water', 0x8ad8ff, { opacity: 0.8, emissive: 0x2a6a9a, emissiveIntensity: 0.25 });
  const foam = mat('cloth', 0xf4fcff, { opacity: 0.9 });
  const glass = mat('glass', 0xcff4ff, { opacity: 0.38 });
  const hl = mat('glow', 0xffffff, { emissiveIntensity: 1.6 });
  // coluna central e coroa de gotas
  r.bone('col', 'root');
  r.add('col', lathe([[0.06, 0], [0.04, 0.06], [0.025, 0.14], [0.03, 0.18], [0.001, 0.2]], water, { seg: 18, castShadow: false }));
  r.bone('crown', 'root');
  r.add('crown', lathe([[0.1, 0], [0.12, 0.03], [0.15, 0.07], [0.16, 0.075], [0.13, 0.04], [0.09, 0.0]], dbl2(water), { seg: 28, castShadow: false, deform: [(p) => { const a = Math.atan2(p.x, p.z); if (p.y > 0.04) p.y += Math.max(0, Math.cos(a * 7)) * 0.04; }] }));
  for (let i = 0; i < 8; i++) {
    r.bone(`d${i}`, 'root');
    r.add(`d${i}`, blob([0.022, 0.03, 0.022], water, { seg: 12, castShadow: false, deform: [(p) => { if (p.y > 0) { p.x *= 1 - p.y * 15; p.z *= 1 - p.y * 15; } }] }));
  }
  r.bone('ripple', 'root');
  r.add('ripple', lathe([[0.16, 0], [0.18, 0.008], [0.2, 0]], foam, { seg: 32, castShadow: false }));
  // bolhas p/m/g
  for (const [n, rr] of [['bp', 0.035], ['bm', 0.06], ['bg', 0.095]] as [string, number][]) {
    r.bone(n, 'root', [0, 0.12, 0]);
    r.add(n, blob([rr, rr, rr], glass, { seg: 24, castShadow: false }), blob([rr * 0.3, rr * 0.18, rr * 0.1], hl, { pos: [-rr * 0.4, rr * 0.45, rr * 0.8], rot: [0, 0, 35], castShadow: false }), blob([rr * 0.1, rr * 0.1, rr * 0.05], hl, { pos: [rr * 0.45, -rr * 0.35, rr * 0.85], castShadow: false }));
    r.add(n, lathe([[rr * 0.99, -0.004], [rr * 1.01, 0], [rr * 0.99, 0.004]], mat('glow', 0xbff0ff, { emissiveIntensity: 0.5 }), { rot: [90, 0, 0], castShadow: false }));
  }
  return r;
}
function dbl2(m: THREE.Material) { const c = m.clone(); c.side = THREE.DoubleSide; c.onBeforeCompile = m.onBeforeCompile; return c; }
const SPLASH_BONES = ['col', 'crown', 'ripple', ...Array.from({ length: 8 }, (_, i) => `d${i}`)];
const bubble = (n: string) => ({
  frames: 4, loop: true, keys: {
    ...hide([...SPLASH_BONES, ...['bp', 'bm', 'bg'].filter((x) => x !== n)]),
    [n]: [{ t: 0, s: [1, 1, 1] as V3, p: [0, 0, 0] as V3 }, { t: 0.25, s: [1.08, 0.93, 1.05] as V3, p: [0.004, 0.01, 0] as V3 }, { t: 0.5, s: [0.95, 1.07, 0.97] as V3, p: [0, 0.02, 0] as V3 }, { t: 0.75, s: [1.05, 0.96, 1.02] as V3, p: [-0.004, 0.01, 0] as V3 }, { t: 1, s: [1, 1, 1] as V3, p: [0, 0, 0] as V3 }],
  },
});
export const fxAgua = fxDef('fx-agua', buildAgua, {
  respingo: {
    frames: 8, loop: false, keys: {
      ...hide(['bp', 'bm', 'bg']),
      col: [{ t: 0, s: [0.5, 0.2, 0.5] }, { t: 0.3, s: [1, 1.6, 1], e: 'out' }, { t: 0.6, s: [0.8, 1.1, 0.8] }, { t: 1, s: [0.3, Z, 0.3], e: 'in' }],
      crown: [{ t: 0, s: [0.4, 0.3, 0.4] }, { t: 0.3, s: [1.1, 1.5, 1.1], e: 'out' }, { t: 0.7, s: [1.5, 0.8, 1.5] }, { t: 1, s: [1.8, Z, 1.8] }],
      ripple: [{ t: 0, s: [0.3, 1, 0.3] }, { t: 1, s: [2.4, 1, 2.4], e: 'out' }],
      ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        const end: V3 = [Math.cos(a) * (0.32 + (i % 3) * 0.06), -0.02, Math.sin(a) * 0.2];
        return [`d${i}`, track(0.04 * (i % 3), 1, arc3([Math.cos(a) * 0.08, 0.1, Math.sin(a) * 0.05], end, 0.28 + (i % 2) * 0.1), (u) => (u < 0.1 ? u * 10 : u > 0.85 ? (1 - u) / 0.15 : 1), (u) => [0, 0, -Math.cos(a) * 60 * u], 7)];
      })),
    },
  },
  'bolha-p': bubble('bp'),
  'bolha-m': bubble('bm'),
  'bolha-g': bubble('bg'),
}, [128, 96], [64, 72]);

