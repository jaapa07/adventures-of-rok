/**
 * ÁGUA-VIVA-NÉON — sino translúcido cor-de-rosa néon com miolo brilhante, babado na borda,
 * quatro braços orais em fita e oito tentáculos ondulantes com pontinhas acesas.
 * Flutua em linha vertical e é intocável sem montaria (dá choque).
 */
import { Rig, blob, tube, lathe, ring, eye, mat, wobble, bulge, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, waveAxis } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const NT = 8;

function build() {
  const r = new Rig('root');
  const bell = mat('crystal', 0xff5ad0, { opacity: 0.62, emissive: 0xc020a0, emissiveIntensity: 0.45 });
  const bellIn = mat('glow', 0xffa0f0, { emissiveIntensity: 1.1 });
  const frill = mat('crystal', 0x9af6ff, { opacity: 0.7, emissive: 0x40c0e0, emissiveIntensity: 0.6 });
  const arm = mat('crystal', 0xd080ff, { opacity: 0.6, emissive: 0x8040d0, emissiveIntensity: 0.5 });
  const tent = mat('glow', 0x8af0ff, { emissiveIntensity: 0.8, opacity: 0.85 });
  const tip = mat('glow', 0xfff6a0, { emissiveIntensity: 1.6 });

  r.bone('body', 'root', [0, 0.78, 0]);
  r.bone('bell', 'body', [0, 0, 0]);
  r.bone('zap', 'body', [0, -0.1, 0]);
  /* sino */
  r.add('bell',
    lathe([[0.3, -0.02], [0.31, 0.02], [0.29, 0.1], [0.24, 0.2], [0.16, 0.27], [0.08, 0.3], [0.001, 0.31]], bell, { deform: [wobble(0.006, 9)] }),
    // miolo luminoso (gônadas em trevo)
    ...[0, 90, 180, 270].map((a) => blob([0.06, 0.04, 0.06], bellIn, { pos: [Math.cos(a * D2R) * 0.07, 0.14, Math.sin(a * D2R) * 0.07], seg: 16 })),
    blob([0.1, 0.06, 0.1], mat('glow', 0xff7ae0, { emissiveIntensity: 0.9, opacity: 0.8 }), { pos: [0, 0.1, 0] }),
    // babado da borda
    ring(0.3, 0.025, frill, { pos: [0, -0.015, 0], rot: [90, 0, 0], deform: [wobble(0.012, 30)] }),
    // pintinhas néon no topo
    ...[0, 60, 120, 180, 240, 300].map((a) => blob([0.018, 0.012, 0.018], tip, { pos: [Math.cos(a * D2R) * 0.2, 0.22, Math.sin(a * D2R) * 0.2], seg: 10 })),
  );
  // carinha: olhos sapecas no sino
  const eR = eye({ r: 0.06, iris: 0x7a2ad0, irisScale: 0.62, look: [0.6, -0.2], lid: 0.3, lidColor: 0xd04ab0, angry: 6 });
  eR.position.set(0.15, 0.12, 0.17); eR.rotation.y = 0.5;
  const eL = eye({ r: 0.055, iris: 0x7a2ad0, irisScale: 0.62, look: [0.6, -0.2], lid: 0.3, lidColor: 0xd04ab0, angry: -6 });
  eL.position.set(0.22, 0.12, 0.02); eL.rotation.y = 1.1;
  r.add('bell', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // sorrisinho travesso
  r.add('bell', tube([[0.2, 0.04, 0.17], [0.23, 0.02, 0.12], [0.26, 0.04, 0.06]], 0.008, mat('skin', 0x6a1050), { seg: 10, radial: 5 }));
  /* braços orais em fita (4) */
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 360 + 45;
    const ca = Math.cos(a * D2R) * 0.06, sa = Math.sin(a * D2R) * 0.06;
    r.bone(`arm${i}`, 'body', [ca, -0.02, sa]);
    const pts: V3[] = Array.from({ length: 7 }, (_, j) => [ca * (1 + j * 0.3) + Math.sin(j * 1.4 + i) * 0.03, -j * 0.06, sa * (1 + j * 0.3) + Math.cos(j * 1.4 + i) * 0.03]);
    r.add(`arm${i}`, tube(pts.map(([x, y, z]) => [x - ca, y, z - sa] as V3), (t) => 0.03 * (1 - t * 0.6), arm, { seg: 24, radial: 8, deform: [wobble(0.008, 20)] }));
  }
  /* tentáculos (3 juntas cada) */
  for (let i = 0; i < NT; i++) {
    const a = (i / NT) * 360;
    const x = Math.cos(a * D2R) * 0.26, z = Math.sin(a * D2R) * 0.26;
    r.bone(`t${i}a`, 'body', [x, -0.02, z]);
    r.bone(`t${i}b`, `t${i}a`, [0, -0.16, 0]);
    r.bone(`t${i}c`, `t${i}b`, [0, -0.16, 0]);
    r.add(`t${i}a`, tube([[0, 0, 0], [0.01, -0.08, 0], [0, -0.16, 0]], 0.012, tent, { seg: 8, radial: 6 }));
    r.add(`t${i}b`, tube([[0, 0, 0], [-0.01, -0.08, 0], [0, -0.16, 0]], 0.009, tent, { seg: 8, radial: 6 }));
    r.add(`t${i}c`, tube([[0, 0, 0], [0.01, -0.07, 0], [0, -0.14, 0]], (t) => 0.007 * (1 - t * 0.5), tent, { seg: 8, radial: 6 }), blob([0.016, 0.016, 0.016], tip, { pos: [0, -0.15, 0], seg: 10 }));
  }
  /* faíscas do choque (escondidas no repouso) */
  const spark = mat('glow', 0xfffad0, { emissiveIntensity: 2 });
  r.add('zap', ...[0, 72, 144, 216, 288].map((a, i) => tube([[0, 0, 0], [Math.cos(a * D2R) * 0.12, -0.05 - i * 0.02, Math.sin(a * D2R) * 0.12], [Math.cos((a + 20) * D2R) * 0.2, -0.02, Math.sin((a + 20) * D2R) * 0.2], [Math.cos((a + 5) * D2R) * 0.3, -0.12, Math.sin((a + 5) * D2R) * 0.3]], 0.008, spark, { seg: 12, radial: 4 })));
  r.bones.zap.scale.setScalar(0.001);
  r.anchor('head', 'body', [0, 0.36, 0]);
  return r;
}

function tentWave(amp: number, speed = 1): Record<string, Key[]> {
  const out: Record<string, Key[]> = {};
  for (let i = 0; i < NT; i++) {
    const ph = i * 0.13;
    out[`t${i}a`] = waveAxis(2, amp * 0.5, ph, 8, speed).map((x, j) => ({ ...x, r: [amp * 0.4 * Math.sin(((j / 8) * speed + ph + 0.3) * Math.PI * 2), 0, x.r![2]] as V3 }));
    out[`t${i}b`] = waveAxis(2, amp, ph - 0.15, 8, speed);
    out[`t${i}c`] = waveAxis(2, amp * 1.4, ph - 0.3, 8, speed);
  }
  for (let i = 0; i < 4; i++) out[`arm${i}`] = waveAxis(i % 2 ? 0 : 2, amp * 0.6, i * 0.25, 8, speed);
  return out;
}
const pulse = (n = 8): Key[] => Array.from({ length: n + 1 }, (_, i) => { const c = Math.sin((i / n) * Math.PI * 2); return sc(i / n, [1 + 0.08 * c, 1 - 0.1 * c, 1 + 0.08 * c], 'linear'); });

function anims(): AnimSet {
  const nadar = anim(24, true, {
    bell: pulse(),
    body: Array.from({ length: 9 }, (_, i) => ps(i / 8, [0, 0.05 * Math.sin((i / 8) * Math.PI * 2 - 1.2), 0], 'linear')),
    ...tentWave(14),
    lidR: [rx(0, 0), rx(0.6, 0), rx(0.64, 60), rx(0.7, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.6, 0), rx(0.64, 60), rx(0.7, 0), rx(1, 0)],
  });
  const andar = anim(16, true, { ...nadar.keys, ...tentWave(20), body: Array.from({ length: 9 }, (_, i) => k(i / 8, [0, 0, -10], [0, 0.06 * Math.sin((i / 8) * Math.PI * 2 - 1.2), 0], 'linear')) });
  // ataque: choque! tentáculos abrem e faíscas estalam
  const ataque = anim(12, false, {
    bell: [sc(0, 1), sc(0.25, [0.85, 1.2, 0.85]), sc(0.45, [1.25, 0.8, 1.25], 'out'), sc(1, 1)],
    zap: [sc(0, 1), sc(0.35, 1), sc(0.4, 1000), sc(0.5, 700), sc(0.55, 1100), sc(0.65, 800), sc(0.75, 1000), sc(0.85, 1)],
    ...Object.fromEntries(Array.from({ length: NT }, (_, i) => [`t${i}a`, [rx(0, 0), rx(0.45, 40 * Math.cos((i / NT) * Math.PI * 2)), rx(1, 0)]])),
    lidR: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)],
  });
  const dano = anim(10, false, {
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [20, 0, 30], [-0.12, 0.06, 0], 'out'), k(1, [0, 0, 8], [-0.1, 0, 0])],
    bell: [sc(0, 1), sc(0.2, [1.2, 0.75, 1.2]), sc(0.5, [0.9, 1.1, 0.9]), sc(1, 1)],
    ...tentWave(30, 2),
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  // morte: murcha como bexiga e afunda
  const morte = anim(24, false, {
    bell: [sc(0, 1), sc(0.3, [1.2, 0.7, 1.2]), sc(1, [1.3, 0.35, 1.3])],
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 20], [0, 0.04, 0]), k(1, [0, 0, 40], [0, -0.6, 0], 'in')],
    ...Object.fromEntries(Array.from({ length: NT }, (_, i) => [`t${i}b`, [rz(0, 0), rz(1, 30 + (i % 3) * 20)]])),
    lidR: [rx(0, 0), rx(0.3, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [14 * Math.sin((i / 8) * Math.PI * 2), 0, 14 * Math.cos((i / 8) * Math.PI * 2)], [0, -0.04, 0], 'linear')),
    bell: pulse(),
    ...tentWave(24),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: nadar, nadar, andar, ataque, dano, morte, tonto };
}

export const aguaViva: ModelDef = {
  id: 'agua-viva',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [192, 240],
  pivot: [96, 216],
  height: 240 / 104,
  presets: ['recife', 'bonus', 'neutro'],
};
