/**
 * Efeitos de brilho, ambiente e gags: BRILHO, FOLHAS (6 tipos), VAGA-LUME, GOTA, RAIOS DE LUZ, RASTRO,
 * EXPLOSÃO, CUPINS, ONDAS DE SOM, POÇA DE JACA, CHUVA, ECO, NOTAS, BOLHAS S.O.S. e CORAÇÃO.
 */
import { Rig, blob, tube, slab, lathe, mat, wobble, star, sparkle, additive, THREE, track, life, eo, arc3, hide, puff, fxDef, Z, type V3, type Anim } from './lib';
import { leaf, wave, dbl } from '../props/kit';

const glowM = (c: number, i = 1.4) => mat('glow', c, { emissiveIntensity: i });

/* ------------------------------ BRILHO (castanha / letra / totem) ------------------------------ */
function buildBrilho() {
  const r = new Rig('root');
  const gold = glowM(0xffd23a, 1.2), white = glowM(0xffffff, 2), green = glowM(0xb8ff6a, 1.2), pink = glowM(0xff9ad0, 1.1);
  // castanha: cintilação grande de 4 pontas + 4 pontinhos
  r.bone('cBig', 'root'); r.add('cBig', sparkle(0.16, gold), sparkle(0.09, white, { pos: [0, 0, 0.01], rot: [0, 0, 45] }));
  for (let i = 0; i < 4; i++) { r.bone(`cDot${i}`, 'root'); r.add(`cDot${i}`, sparkle(0.04, i % 2 ? white : gold)); }
  // letra: clarão + anel de 10 estrelas que se abre
  r.bone('lFlash', 'root'); r.add('lFlash', star(10, 0.24, 0.1, 0.02, gold, { castShadow: false }), star(10, 0.15, 0.07, 0.03, white, { pos: [0, 0, 0.01], rot: [0, 0, 18], castShadow: false }));
  r.bone('lRing', 'root'); r.add('lRing', lathe([[0.2, -0.008], [0.22, 0], [0.2, 0.008]], gold, { rot: [90, 0, 0], seg: 40, castShadow: false }));
  for (let i = 0; i < 10; i++) { r.bone(`lS${i}`, 'root'); r.add(`lS${i}`, star(5, 0.05, 0.022, 0.015, [gold, pink, white][i % 3], { castShadow: false })); }
  // totem: fagulhas verdes e douradas que sobem em espiral
  for (let i = 0; i < 8; i++) { r.bone(`t${i}`, 'root'); r.add(`t${i}`, sparkle(0.05 + (i % 3) * 0.012, i % 2 ? green : gold), blob([0.015, 0.015, 0.015], white, { castShadow: false })); }
  return r;
}
const C_B = ['cBig', 'cDot0', 'cDot1', 'cDot2', 'cDot3'];
const L_B = ['lFlash', 'lRing', ...Array.from({ length: 10 }, (_, i) => `lS${i}`)];
const T_B = Array.from({ length: 8 }, (_, i) => `t${i}`);
export const fxBrilho = fxDef('fx-brilho', buildBrilho, {
  castanha: {
    frames: 6, loop: false, keys: {
      ...hide([...L_B, ...T_B]),
      cBig: [{ t: 0, s: 0.2, r: [0, 0, 0] }, { t: 0.35, s: 1.2, r: [0, 0, 30], e: 'out' }, { t: 1, s: Z, r: [0, 0, 70], e: 'in' }],
      ...Object.fromEntries([0, 1, 2, 3].map((i) => { const a = i * 1.57 + 0.78; return [`cDot${i}`, track(0.1, 1, (u) => [Math.cos(a) * eo(u) * 0.2, Math.sin(a) * eo(u) * 0.2, 0.02], life(1, 0.3, 0.5), (u) => [0, 0, u * 90], 5)]; })),
    },
  },
  letra: {
    frames: 10, loop: false, keys: {
      ...hide([...C_B, ...T_B]),
      lFlash: [{ t: 0, s: 0.3, r: [0, 0, 0] }, { t: 0.2, s: 1.3, r: [0, 0, 10], e: 'out' }, { t: 0.5, s: 0.5, r: [0, 0, 25] }, { t: 0.7, s: Z, r: [0, 0, 30] }],
      lRing: [{ t: 0, s: 0.2 }, { t: 0.5, s: 1.5, e: 'out' }, { t: 0.8, s: 1.8 }, { t: 0.85, s: Z }],
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [`lS${i}`, track(0.05, 1, (u) => [Math.cos(a) * eo(u) * 0.42, Math.sin(a) * eo(u) * 0.42 - u * u * 0.08, 0.02], life(1.1, 0.2, 0.6), (u) => [0, 0, u * 200 * (i % 2 ? 1 : -1)], 8)]; })),
    },
  },
  totem: {
    frames: 8, loop: false, keys: {
      ...hide([...C_B, ...L_B]),
      ...Object.fromEntries(T_B.map((b, i) => { const a = (i / 8) * Math.PI * 2; return [b, track((i % 4) * 0.08, 0.7 + (i % 4) * 0.08, (u) => [Math.cos(a + u * 3) * 0.12 * (1 - u * 0.4), -0.15 + u * 0.4, Math.sin(a + u * 3) * 0.08], life(1, 0.25, 0.55), (u) => [0, 0, u * 120], 7)]; })),
    },
  },
}, [128, 128], [64, 64], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ FOLHAS (6 tipos) ------------------------------ */
function buildFolhas() {
  const r = new Rig('root');
  const mk = (i: number, ...objs: THREE.Object3D[]) => { r.bone(`f${i}`, 'root'); r.bone(`f${i}g`, `f${i}`); for (const o of objs) { o.position.y -= 0.08; r.add(`f${i}g`, o); } };
  const vein = (len: number, c: number) => tube([[0, 0, 0.004], [0, len * 0.5, 0.008], [0, len * 0.95, 0.004]], 0.0035, mat('leaf', c), { seg: 8, radial: 4, castShadow: false });
  // 1: verde lanceolada
  mk(1, leaf(0.17, 0.07, mat('leaf', 0x4a9a30), { curl: 0.35 }), vein(0.17, 0x8ad05a), tube([[0, -0.02, 0], [0, 0.0, 0]], 0.004, mat('leaf', 0x3a6a20)));
  // 2: amarela arredondada
  mk(2, slab([[0, 0], [0.06, 0.03], [0.075, 0.08], [0.05, 0.13], [0, 0.15], [-0.05, 0.13], [-0.075, 0.08], [-0.06, 0.03]], 0.006, dbl(mat('leaf', 0xf0c030)), { deform: [(p) => { p.z += Math.abs(p.x) * 0.5; }] }), vein(0.15, 0xc89010));
  // 3: vermelha em coração
  mk(3, slab([[0, 0], [0.07, 0.05], [0.08, 0.1], [0.05, 0.14], [0.0, 0.12], [-0.05, 0.14], [-0.08, 0.1], [-0.07, 0.05]], 0.006, dbl(mat('leaf', 0xd8402a)), { deform: [(p) => { p.z += Math.sin(p.y * 20) * 0.01; }] }), vein(0.12, 0x8a1a10));
  // 4: seca enrolada, marrom
  mk(4, leaf(0.16, 0.08, mat('leaf', 0x9a6a32, { rough: 0.8 }), { curl: 0.9 }), vein(0.15, 0x6a4420));
  // 5: folíolos (folha composta de ingá)
  mk(5, tube([[0, 0, 0], [0, 0.16, 0.01]], 0.004, mat('leaf', 0x3a6a20), { castShadow: false }), ...[0, 1, 2].flatMap((k) => [leaf(0.06, 0.03, mat('leaf', 0x5ab040), { pos: [0, 0.04 + k * 0.045, 0], rot: [0, 0, -55] }), leaf(0.06, 0.03, mat('leaf', 0x5ab040), { pos: [0, 0.04 + k * 0.045, 0], rot: [0, 0, 55] })]), leaf(0.055, 0.03, mat('leaf', 0x6ac048), { pos: [0, 0.16, 0.01] }));
  // 6: laranja oval com pintas
  mk(6, slab([[0, 0], [0.045, 0.03], [0.055, 0.09], [0.03, 0.15], [0, 0.17], [-0.03, 0.15], [-0.055, 0.09], [-0.045, 0.03]], 0.006, dbl(mat('leaf', 0xff8a2a)), { deform: [(p) => { p.z += p.y * p.y * 1.4; }] }), vein(0.17, 0xc85a10), blob([0.012, 0.01, 0.004], mat('leaf', 0x8a3a10), { pos: [0.02, 0.08, 0.005] }), blob([0.008, 0.007, 0.004], mat('leaf', 0x8a3a10), { pos: [-0.018, 0.11, 0.005] }));
  return r;
}
const leafAnim = (i: number) => ({
  frames: 8, loop: true, keys: {
    ...hide([1, 2, 3, 4, 5, 6].filter((k) => k !== i).map((k) => `f${k}`)),
    [`f${i}`]: wave(8, (t) => ({ r: [Math.sin(t * Math.PI * 2) * 50, Math.sin(t * Math.PI * 2 + i) * 30, Math.sin(t * Math.PI * 2 + 1.2) * 40 + i * 20], p: [Math.sin(t * Math.PI * 2) * 0.03, Math.abs(Math.cos(t * Math.PI * 2)) * 0.01, 0] })),
  },
});
export const fxFolhas = fxDef('fx-folhas', buildFolhas, Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`folha${i}`, leafAnim(i)])), [64, 64], [32, 32]);

/* ------------------------------ VAGA-LUME ------------------------------ */
function buildVagalume() {
  const r = new Rig('root');
  r.bone('bug', 'root', [0, 0, 0], [0, 20, 0]);
  r.bone('light', 'bug', [-0.035, -0.01, 0]);
  r.bone('wingL', 'bug', [0.005, 0.015, -0.01]);
  r.bone('wingR', 'bug', [0.005, 0.015, 0.01]);
  r.add('bug', blob([0.02, 0.014, 0.014], mat('shell', 0x3a2a1a), { pos: [0.005, 0, 0] }), blob([0.012, 0.011, 0.011], mat('skin', 0xd8402a), { pos: [0.03, 0.002, 0] }),
    tube([[0.038, 0.008, 0.005], [0.05, 0.022, 0.012]], 0.0015, mat('shell', 0x2a1a10), { seg: 4, radial: 3 }), tube([[0.038, 0.008, -0.005], [0.05, 0.022, -0.012]], 0.0015, mat('shell', 0x2a1a10), { seg: 4, radial: 3 }));
  r.add('light', blob([0.022, 0.018, 0.018], glowM(0xd8ff6a, 1.8), { castShadow: false }), blob([0.07, 0.07, 0.07], additive(mat('glow', 0xc8ff4a, { emissiveIntensity: 0.5, opacity: 0.3 })), { castShadow: false }));
  const wing = mat('glass', 0xe0f0ff, { opacity: 0.55 });
  r.add('wingL', slab([[0, 0], [-0.03, 0.01], [-0.045, 0.0], [-0.03, -0.008]], 0.002, wing, { rot: [-60, 0, 10] }));
  r.add('wingR', slab([[0, 0], [-0.03, 0.01], [-0.045, 0.0], [-0.03, -0.008]], 0.002, wing, { rot: [60, 0, 10] }));
  return r;
}
export const fxVagalume = fxDef('fx-vagalume', buildVagalume, {
  idle: {
    frames: 4, loop: true, keys: {
      light: wave(4, (t) => ({ s: 0.75 + Math.sin(t * Math.PI * 2) * 0.3 })),
      wingL: wave(4, (t) => ({ r: [Math.sin(t * Math.PI * 4) * 40, 0, 0] })),
      wingR: wave(4, (t) => ({ r: [-Math.sin(t * Math.PI * 4) * 40, 0, 0] })),
      bug: wave(4, (t) => ({ p: [0, Math.sin(t * Math.PI * 2) * 0.01, 0] })),
    },
  },
}, [32, 32], [16, 16], { ss: 3 });

/* ------------------------------ GOTA (caverna) ------------------------------ */
function buildGota() {
  const r = new Rig('root');
  const water = mat('water', 0x9ae0ff, { opacity: 0.85, emissive: 0x3a8aba, emissiveIntensity: 0.35 });
  r.bone('drop', 'root', [0, 0.7, 0]);
  r.add('drop', blob([0.025, 0.035, 0.025], water, { deform: [(p) => { if (p.y > 0) { p.x *= 1 - p.y * 18; p.z *= 1 - p.y * 18; } }], seg: 16, castShadow: false }), blob([0.006, 0.01, 0.004], glowM(0xffffff, 1.5), { pos: [-0.008, 0.005, 0.022], castShadow: false }));
  r.bone('splash', 'root');
  r.add('splash', lathe([[0.03, 0], [0.04, 0.02], [0.055, 0.04], [0.045, 0.02], [0.025, 0]], water, { seg: 20, castShadow: false, deform: [(p) => { const a = Math.atan2(p.x, p.z); if (p.y > 0.02) p.y += Math.max(0, Math.cos(a * 5)) * 0.02; }] }));
  for (let i = 0; i < 4; i++) { r.bone(`sd${i}`, 'root'); r.add(`sd${i}`, blob([0.01, 0.012, 0.01], water, { castShadow: false })); }
  return r;
}
export const fxGota = fxDef('fx-gota', buildGota, {
  idle: {
    frames: 5, loop: false, keys: {
      drop: [{ t: 0, p: [0, 0, 0], s: [1, 1, 1] }, { t: 0.5, p: [0, -0.68, 0], s: [0.8, 1.5, 0.8], e: 'in' }, { t: 0.55, p: [0, -0.7, 0], s: Z }],
      splash: [{ t: 0, s: Z }, { t: 0.5, s: Z }, { t: 0.75, s: [1, 1.2, 1], e: 'out' }, { t: 1, s: [1.4, Z, 1.4] }],
      ...Object.fromEntries([0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + 0.4; return [`sd${i}`, track(0.5, 1, arc3([0, 0.02, 0], [Math.cos(a) * 0.12, 0, Math.sin(a) * 0.08], 0.1), (u) => (u < 0.2 ? u * 5 : 1 - (u - 0.2) * 1.1), undefined, 5)]; })),
    },
  },
}, [48, 96], [24, 88]);

/* ------------------------------ RAIOS DE LUZ ------------------------------ */
const RAY_COLS: Record<string, number> = { mata: 0xfff0a0, mar: 0x8af0ff, gruta: 0xffb860 };
function buildRaio() {
  const r = new Rig('root');
  for (const [k, c] of Object.entries(RAY_COLS)) {
    r.bone(k, 'root');
    const m = additive(mat('glow', c, { emissiveIntensity: 0.45, opacity: 0.22 }));
    const m2 = additive(mat('glow', c, { emissiveIntensity: 0.6, opacity: 0.32 }));
    const beams: [number, number, number, number][] = [[-0.6, 0.35, 3.0, -16], [-0.1, 0.22, 3.3, -14], [0.35, 0.5, 2.8, -18], [0.8, 0.18, 3.1, -15]];
    beams.forEach(([x, w, len, rot], i) => {
      r.bone(`${k}b${i}`, k, [x, 0, -0.1], [0, 0, rot]);
      r.add(`${k}b${i}`, slab([[-w * 0.4, 0], [w * 0.4, 0], [w * 0.6, -len], [-w * 0.6, -len]], 0.01, i % 2 ? m : m2, { smooth: false, bevel: 0.002, castShadow: false }));
    });
    // partículas de poeira/plâncton flutuando na luz
    for (let i = 0; i < 8; i++) {
      r.bone(`${k}m${i}`, k, [-0.7 + i * 0.22, -0.6 - (i * 0.37 % 1.8), 0]);
      r.add(`${k}m${i}`, blob([0.012, 0.012, 0.012], mat('glow', c, { emissiveIntensity: 1.4 }), { castShadow: false }));
    }
  }
  return r;
}
const rayAnim = (k: string) => ({
  frames: 16, loop: true, keys: {
    ...hide(Object.keys(RAY_COLS).filter((x) => x !== k)),
    ...Object.fromEntries([0, 1, 2, 3].map((i) => [`${k}b${i}`, wave(16, (t) => ({ s: [1 + Math.sin(t * Math.PI * 2 + i * 1.7) * 0.25, 1, 1], r: [0, 0, Math.sin(t * Math.PI * 2 + i) * 1.5] }))])),
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`${k}m${i}`, wave(16, (t) => ({ p: [Math.sin(t * Math.PI * 2 + i) * 0.05, Math.cos(t * Math.PI * 2 + i * 0.7) * 0.06 + (k === 'mar' ? t * 0.0 : 0), 0], s: 0.6 + Math.abs(Math.sin(t * Math.PI * 2 + i)) * 0.6 }))])),
  },
});
export const fxRaioLuz = fxDef('fx-raio-luz', buildRaio, { mata: rayAnim('mata'), mar: rayAnim('mar'), gruta: rayAnim('gruta') }, [256, 352], [128, 8], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ RASTRO de velocidade ------------------------------ */
function buildRastro() {
  const r = new Rig('root');
  const cols = [0xffffff, 0xbff0ff, 0xfff4c0, 0xffffff, 0xbff0ff];
  [[0.0, 0.08], [0.1, -0.06], [-0.05, 0.22], [0.05, -0.2], [-0.1, 0.0]].forEach(([dx, y], i) => {
    r.bone(`l${i}`, 'root', [0.2 + dx, y, 0.02 * i]);
    r.add(`l${i}`, tube([[0, 0, 0], [-0.2, 0.004, 0], [-0.45, 0, 0]], (t) => 0.022 * (1 - t) ** 1.3 + 0.002, mat('glow', cols[i], { emissiveIntensity: 1.1, opacity: 0.85 }), { seg: 16, radial: 8, castShadow: false }));
  });
  return r;
}
export const fxRastro = fxDef('fx-rastro', buildRastro, {
  idle: {
    frames: 6, loop: false, keys: Object.fromEntries([0, 1, 2, 3, 4].map((i) => [`l${i}`, track((i % 3) * 0.08, 1, (u) => [-eo(u) * 0.25, 0, 0], (u) => [u < 0.2 ? 0.4 + u * 3 : 1 - (u - 0.2) * 1.1, u < 0.2 ? 1 : 1 - (u - 0.2) * 0.9, 1], undefined, 6)])),
  },
}, [192, 96], [96, 48], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ EXPLOSÃO ------------------------------ */
const FIRE: [V3, number][] = [[[0, 0, 0], 0.32], [[0.3, 0.1, 0.1], 0.24], [[-0.3, 0.12, 0.08], 0.24], [[0.15, 0.32, 0.0], 0.22], [[-0.16, 0.3, -0.05], 0.2], [[0.05, -0.2, 0.12], 0.2], [[0.34, -0.15, -0.05], 0.16], [[-0.32, -0.16, 0.0], 0.17]];
function buildExplosao() {
  const r = new Rig('root');
  r.bone('all', 'root');
  r.bone('core', 'all');
  r.add('core', blob([0.3, 0.3, 0.3], glowM(0xfff8d0, 2.4), { castShadow: false }), star(12, 0.6, 0.3, 0.02, glowM(0xffe070, 1.8), { castShadow: false }));
  const fire = [glowM(0xff8a1a, 1.1), glowM(0xffc030, 1.3), glowM(0xff5a10, 1)];
  FIRE.forEach(([p, rr], i) => { r.bone(`f${i}`, 'all', p); r.add(`f${i}`, puff(rr, fire[i % 3], i)); });
  const smoke = [mat('cloth', 0x5a5258, { opacity: 0.9 }), mat('cloth', 0x7a7078, { opacity: 0.88 }), mat('cloth', 0x3a3438, { opacity: 0.9 })];
  FIRE.forEach(([p, rr], i) => { r.bone(`k${i}`, 'all', [p[0] * 1.2, p[1] * 1.2 + 0.1, p[2] - 0.05]); r.add(`k${i}`, puff(rr * 1.1, smoke[i % 3], i + 3)); });
  for (let i = 0; i < 10; i++) {
    r.bone(`e${i}`, 'all', [0, 0, 0], [0, 0, i * 36 + 10]);
    r.bone(`e${i}m`, `e${i}`);
    r.add(`e${i}m`, tube([[0, 0, 0], [0.12, 0, 0]], (t) => 0.03 * (1 - t) + 0.004, i % 2 ? glowM(0xffd23a, 1.6) : glowM(0xff8a1a, 1.4), { seg: 6, radial: 6, castShadow: false }));
  }
  r.bone('shock', 'all');
  r.add('shock', lathe([[0.5, -0.01], [0.55, 0], [0.5, 0.01]], glowM(0xfff0c0, 1.2), { rot: [90, 0, 0], seg: 48, castShadow: false }));
  return r;
}
const explAnim = (frames: number, scale: number): Anim => ({
  frames, loop: false, keys: {
    all: [{ t: 0, s: scale }],
    core: [{ t: 0, s: 0.3, r: [0, 0, 0] }, { t: 0.1, s: 1.2, r: [0, 0, 10], e: 'out' }, { t: 0.3, s: 0.6, r: [0, 0, 20] }, { t: 0.42, s: Z }],
    shock: [{ t: 0, s: 0.2 }, { t: 0.35, s: 1.4, e: 'out' }, { t: 0.45, s: Z }],
    ...Object.fromEntries(FIRE.map(([p], i) => [`f${i}`, track(0.03 + (i % 3) * 0.03, 0.62 + (i % 4) * 0.05, (u) => [p[0] * eo(u) * 0.8, p[1] * eo(u) * 0.8 + u * 0.1, p[2]], life(1.2, 0.2, 0.45), (u) => [0, u * 40, u * 50 * (i % 2 ? 1 : -1)], 9)])),
    ...Object.fromEntries(FIRE.map(([p], i) => [`k${i}`, track(0.25 + (i % 3) * 0.04, 1, (u) => [p[0] * eo(u) * 0.9, p[1] * eo(u) + u * 0.35, p[2]], life(1.1, 0.25, 0.5), (u) => [0, u * 30, -u * 40], 9)])),
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`e${i}m`, track(0.02, 0.55 + (i % 3) * 0.08, (u) => [0.2 + eo(u) * (0.6 + (i % 3) * 0.12), -u * u * 0.1, 0], (u) => (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85 * 0.9) * 1.3, undefined, 8)])),
  },
});
export const fxExplosao = fxDef('fx-explosao', buildExplosao, { grande: explAnim(16, 1), pequena: explAnim(8, 0.5) }, [288, 288], [144, 144]);

/* ------------------------------ CUPINS (nuvem) ------------------------------ */
function buildCupins() {
  const r = new Rig('root');
  const body = mat('skin', 0xe8d8b0, { rough: 0.4 });
  const head = mat('skin', 0x9a4a1a, { rough: 0.35 });
  const wing = mat('glass', 0xf0f4ff, { opacity: 0.6 });
  r.bone('haze', 'root');
  r.add('haze', puff(0.14, mat('cloth', 0xc8a070, { opacity: 0.35 }), 2));
  for (let i = 0; i < 12; i++) {
    r.bone(`c${i}`, 'root');
    r.add(`c${i}`, blob([0.016, 0.01, 0.01], body, { pos: [-0.016, 0, 0], castShadow: false }), blob([0.01, 0.009, 0.009], body, { castShadow: false }), blob([0.01, 0.009, 0.009], head, { pos: [0.016, 0, 0], castShadow: false }),
      slab([[0, 0], [-0.04, 0.012], [-0.045, 0.004]], 0.002, wing, { pos: [0, 0.008, 0.006], castShadow: false }), slab([[0, 0], [-0.04, 0.012], [-0.045, 0.004]], 0.002, wing, { pos: [0, 0.008, -0.006], rot: [0, 0, 18], castShadow: false }));
  }
  return r;
}
export const fxCupins = fxDef('fx-cupins', buildCupins, {
  nuvem: {
    frames: 8, loop: true, keys: {
      haze: wave(8, (t) => ({ s: 1 + Math.sin(t * Math.PI * 2) * 0.1, r: [0, t * 90, 0] })),
      ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => {
        const rr = 0.12 + (i % 4) * 0.05, ph = i * 0.52, ky = 1 + (i % 3);
        return [`c${i}`, wave(8, (t) => { const a = t * Math.PI * 2 * (i % 2 ? 1 : -1) + ph; return { p: [Math.cos(a) * rr, Math.sin(a * ky) * rr * 0.6, Math.sin(a) * rr * 0.5], r: [0, 0, (a * 180) / Math.PI + 90 * (i % 2 ? 1 : -1)] }; })];
      })),
    },
  },
}, [128, 112], [64, 56]);

/* ------------------------------ ONDAS DE SOM (buzina) ------------------------------ */
function buildOndas() {
  const r = new Rig('root');
  const cols = [glowM(0xfff4c0, 1.4), glowM(0xffd870, 1.2), glowM(0xffffff, 1.6)];
  for (let i = 0; i < 3; i++) {
    r.bone(`w${i}`, 'root');
    // arco frontal de 100° (onda que sai da boca da buzina para +X)
    const g = new THREE.TorusGeometry(0.32, 0.03, 10, 30, (100 * Math.PI) / 180);
    g.rotateZ((-50 * Math.PI) / 180);
    const m = new THREE.Mesh(g, cols[i]);
    r.add(`w${i}`, m);
    // traços de vibração
    for (let k = 0; k < 3; k++) r.add(`w${i}`, tube([[0.36, (k - 1) * 0.12, 0], [0.42, (k - 1) * 0.15, 0]], 0.01, cols[(i + 1) % 3], { seg: 4, radial: 5, castShadow: false }));
  }
  return r;
}
export const fxOndasSom = fxDef('fx-ondas-som', buildOndas, {
  buzina: {
    frames: 8, loop: false, keys: Object.fromEntries([0, 1, 2].map((i) => [`w${i}`, track(i * 0.15, 0.7 + i * 0.15, (u) => [eo(u) * 0.9, 0, 0], (u) => [0.3 + eo(u) * 1.6, 0.3 + eo(u) * 1.6, 1].map((v, k) => (k < 2 ? v * (u > 0.7 ? 1 - (u - 0.7) / 0.3 * 0.6 : 1) : 1)) as V3, undefined, 8)])),
  },
}, [256, 160], [32, 80], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ POÇA DE JACA ------------------------------ */
function buildPoca() {
  const r = new Rig('root');
  const goo = mat('skin', 0xf4c030, { rough: 0.15, emissive: 0x8a5a00, emissiveIntensity: 0.15 });
  const goo2 = mat('skin', 0xffe070, { rough: 0.1 });
  r.bone('pool', 'root');
  r.add('pool', blob([0.42, 0.03, 0.2], goo, { deform: [(p) => { if (p.y < 0) p.y *= 0.2; const a = Math.atan2(p.z, p.x); const k = 1 + Math.sin(a * 5) * 0.08 + Math.sin(a * 3 + 1) * 0.06; p.x *= k; p.z *= k; }], seg: 36, castShadow: false }));
  // gomos e caroços
  r.add('pool', ...[[-0.2, 0.02, 0.05], [0.16, 0.02, -0.04], [0.02, 0.025, 0.1]].map(([x, y, z], i) => blob([0.045, 0.025, 0.035], goo2, { pos: [x, y, z], rot: [0, i * 50, 0], castShadow: false })), blob([0.02, 0.015, 0.015], mat('wood', 0x8a5a2a), { pos: [0.22, 0.03, 0.06] }));
  for (let i = 0; i < 4; i++) { r.bone(`b${i}`, 'root', [-0.25 + i * 0.17, 0.02, 0.02 * (i % 2)]); r.add(`b${i}`, blob([0.03, 0.03, 0.03], goo2, { castShadow: false }), blob([0.008, 0.006, 0.004], glowM(0xffffff, 1.5), { pos: [-0.01, 0.015, 0.025], castShadow: false })); }
  // fio de visgo
  r.bone('str', 'root');
  r.add('str', tube([[-0.1, 0.02, 0.1], [-0.08, 0.12, 0.1], [-0.06, 0.02, 0.1]], 0.005, goo2, { seg: 10, radial: 5, castShadow: false }));
  return r;
}
export const fxPoca = fxDef('fx-poca', buildPoca, {
  jaca: {
    frames: 6, loop: true, keys: {
      pool: wave(6, (t) => ({ s: [1 + Math.sin(t * Math.PI * 2) * 0.03, 1, 1 - Math.sin(t * Math.PI * 2) * 0.03] })),
      ...Object.fromEntries([0, 1, 2, 3].map((i) => [`b${i}`, wave(6, (t) => { const u = (t + i * 0.25) % 1; return { s: u < 0.7 ? 0.2 + u * 1.2 : Z, p: [0, u * 0.02, 0] }; })])),
      str: wave(6, (t) => ({ s: [1, 0.5 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.8, 1] })),
    },
  },
}, [128, 48], [64, 36], { camera: { pitch: -24 } });

/* ------------------------------ CHUVA (gota caindo) ------------------------------ */
function buildChuva() {
  const r = new Rig('root');
  r.bone('d', 'root');
  r.add('d', blob([0.018, 0.09, 0.018], mat('water', 0xc8ecff, { opacity: 0.75, emissive: 0x5a8aaa, emissiveIntensity: 0.4 }), { deform: [(p) => { if (p.y > 0) { p.x *= 1 - p.y * 9; p.z *= 1 - p.y * 9; } }], seg: 14, castShadow: false }));
  return r;
}
export const fxChuva = fxDef('fx-chuva', buildChuva, {
  gota: { frames: 4, loop: true, keys: { d: [{ t: 0, p: [0, 0.2, 0] }, { t: 1, p: [-0.08, -0.25, 0], e: 'linear' }] } },
}, [32, 96], [16, 48], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ ECO (onda de luz) ------------------------------ */
function buildEco() {
  const r = new Rig('root');
  const c1 = glowM(0x8af0ff, 1.4), c2 = glowM(0xd0f8ff, 1.8);
  for (let i = 0; i < 3; i++) {
    r.bone(`r${i}`, 'root');
    r.add(`r${i}`, lathe([[0.2, -0.012], [0.22, 0], [0.2, 0.012]], i === 1 ? c2 : c1, { rot: [90, 0, 0], seg: 48, castShadow: false }));
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + i * 0.2; r.add(`r${i}`, sparkle(0.03, c2, { pos: [Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0.01] })); }
  }
  return r;
}
export const fxEco = fxDef('fx-eco', buildEco, {
  onda: { frames: 10, loop: false, keys: Object.fromEntries([0, 1, 2].map((i) => [`r${i}`, track(i * 0.18, 0.64 + i * 0.18, () => [0, 0, 0], (u) => { const s = 0.2 + eo(u) * 1.8; const f = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1; return [s, s, f]; }, (u) => [0, 0, u * 30], 8)])) },
}, [192, 192], [96, 96], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ NOTAS MUSICAIS ------------------------------ */
function note(m: THREE.Material, double: boolean) {
  const g = new THREE.Group();
  g.add(blob([0.035, 0.026, 0.018], m, { rot: [0, 0, 25], castShadow: false }), tube([[0.03, 0.0, 0], [0.03, 0.14, 0]], 0.007, m, { seg: 6, radial: 6, castShadow: false }));
  if (double) {
    g.add(blob([0.035, 0.026, 0.018], m, { pos: [0.09, 0.02, 0], rot: [0, 0, 25], castShadow: false }), tube([[0.12, 0.02, 0], [0.12, 0.16, 0]], 0.007, m, { seg: 6, radial: 6, castShadow: false }), slab([[0.03, 0.12], [0.12, 0.14], [0.12, 0.17], [0.03, 0.15]], 0.012, m, { smooth: false, castShadow: false }));
  } else g.add(tube([[0.03, 0.14, 0], [0.06, 0.11, 0], [0.07, 0.07, 0]], 0.009, m, { seg: 10, radial: 6, castShadow: false }));
  return g;
}
function buildNotas() {
  const r = new Rig('root');
  const cols = [glowM(0xff6ab0, 0.8), glowM(0x6ad8ff, 0.8), glowM(0xffd23a, 0.8), glowM(0xb08aff, 0.8)];
  for (let i = 0; i < 4; i++) { r.bone(`n${i}`, 'root'); r.add(`n${i}`, note(cols[i], i % 2 === 1)); }
  return r;
}
export const fxNotas = fxDef('fx-notas', buildNotas, {
  notas: {
    frames: 8, loop: true, keys: Object.fromEntries([0, 1, 2, 3].map((i) => [`n${i}`, wave(8, (t) => { const u = (t + i * 0.25) % 1; return { p: [(i - 1.5) * 0.08 + Math.sin(u * Math.PI * 2) * 0.05, u * 0.5, 0], s: u < 0.15 ? Math.max(Z, u / 0.15) : u > 0.8 ? Math.max(Z, (1 - u) / 0.2) : 1, r: [0, 0, Math.sin(u * Math.PI * 2 + i) * 20] }; })])),
  },
}, [96, 128], [48, 112], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ BOLHAS S.O.S. ------------------------------ */
const S_PTS: [number, number][] = [[0.06, 0.1], [0.0, 0.12], [-0.05, 0.08], [-0.02, 0.03], [0.04, -0.02], [0.05, -0.08], [0.0, -0.11], [-0.06, -0.09]];
const O_PTS: [number, number][] = Array.from({ length: 9 }, (_, i) => [Math.cos((i / 9) * Math.PI * 2) * 0.07, Math.sin((i / 9) * Math.PI * 2) * 0.11] as [number, number]);
function buildSOS() {
  const r = new Rig('root');
  const glass = mat('glass', 0xcff4ff, { opacity: 0.45 });
  const hl = glowM(0xffffff, 1.6);
  const all: [number, number][] = [...S_PTS.map(([x, y]) => [x - 0.24, y] as [number, number]), ...O_PTS, ...S_PTS.map(([x, y]) => [x + 0.24, y] as [number, number])];
  all.forEach(([x, y], i) => {
    r.bone(`b${i}`, 'root', [x, y + 0.2, 0]);
    const rr = 0.022 + (i % 3) * 0.005;
    r.add(`b${i}`, blob([rr, rr, rr], glass, { seg: 14, castShadow: false }), blob([rr * 0.3, rr * 0.2, rr * 0.1], hl, { pos: [-rr * 0.4, rr * 0.45, rr * 0.8], castShadow: false }));
  });
  return r;
}
const N_SOS = S_PTS.length * 2 + O_PTS.length;
export const fxBolhasSos = fxDef('fx-bolhas-sos', buildSOS, {
  idle: {
    frames: 8, loop: false, keys: Object.fromEntries(Array.from({ length: N_SOS }, (_, i) => [`b${i}`, track((i / N_SOS) * 0.45, 1, (u) => [Math.sin(u * 6 + i) * 0.006, -0.15 * (1 - eo(Math.min(1, u * 2.5))) + u * 0.08, 0], (u) => (u < 0.15 ? u / 0.15 : u > 0.85 ? (1 - u) / 0.15 * 0.6 + 0.4 : 1), undefined, 8)])),
  },
}, [192, 128], [96, 112], { camera: { yaw: 0, pitch: 0 } });

/* ------------------------------ CORAÇÃO (abraço) ------------------------------ */
function heart(sz: number, m: THREE.Material) {
  const pts: [number, number][] = [];
  for (let i = 0; i < 32; i++) { const t = (i / 32) * Math.PI * 2; pts.push([16 * Math.sin(t) ** 3 * sz / 16, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * sz / 16]); }
  return slab(pts, sz * 0.4, m, { smooth: false, bevel: sz * 0.25, castShadow: false });
}
function buildCoracao() {
  const r = new Rig('root');
  const red = mat('skin', 0xe8304a, { rough: 0.3, emissive: 0xa01020, emissiveIntensity: 0.4, rim: 0.8 });
  const pink = mat('skin', 0xff8ab0, { rough: 0.3, emissive: 0xc04070, emissiveIntensity: 0.4 });
  r.bone('big', 'root', [0, 0.18, 0]);
  r.add('big', heart(0.12, red), sparkle(0.04, glowM(0xffffff, 2), { pos: [-0.06, 0.06, 0.06] }));
  for (let i = 0; i < 4; i++) { r.bone(`h${i}`, 'root'); r.add(`h${i}`, heart(0.05, i % 2 ? pink : red)); }
  return r;
}
export const fxCoracao = fxDef('fx-coracao', buildCoracao, {
  abraco: {
    frames: 8, loop: false, keys: {
      big: [{ t: 0, s: Z, p: [0, 0, 0] }, { t: 0.25, s: 1.25, e: 'back' }, { t: 0.4, s: 0.95 }, { t: 0.55, s: 1.12 }, { t: 0.75, s: 1, p: [0, 0.06, 0] }, { t: 1, s: Z, p: [0, 0.14, 0], e: 'in' }],
      ...Object.fromEntries([0, 1, 2, 3].map((i) => [`h${i}`, track(0.1 + i * 0.08, 1, (u) => [(i - 1.5) * 0.08 * (1 + u), 0.1 + eo(u) * 0.3, 0.05], life(1, 0.2, 0.6), (u) => [0, 0, Math.sin(u * 6 + i) * 20], 7)])),
    },
  },
}, [96, 112], [48, 96], { camera: { yaw: 0, pitch: 0 } });

