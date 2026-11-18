/**
 * BAIACU-BOMBA — baiacu de bochechas fofas, dorso amarelo-mostarda com pintas marrons e
 * barriga branca. Infla até virar uma bola de espinhos (com cara de "prendi a respiração")
 * e desinfla soltando o ar num ciclo.
 * Truque: os espinhos ficam num osso próprio ('spines') dentro do corpo; ao inflar, o corpo
 * e o osso dos espinhos crescem em proporções diferentes e os espinhos "brotam".
 */
import { Rig, blob, tube, slab, spike, eye, mat, taper, pull, bulge, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, waveAxis, bob } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = new Rig('root');
  const back = mat('shortFur', 0xd8b046, { repeat: 3, rough: 0.5 });
  const belly = mat('skin', 0xf6f0e0, { rough: 0.45 });
  const spot = mat('skin', 0x6a4a2a);
  const fin = mat('skin', 0xe8c060, { opacity: 0.9, rough: 0.4 });
  const spineM = mat('shell', 0xf2e6c0, { rough: 0.35 });
  const lipM = mat('skin', 0xe88a6a, { rough: 0.35 });

  r.bone('body', 'root', [0, 0.42, 0]);
  r.bone('puff', 'body', [0, 0, 0]);
  r.bone('spines', 'puff', [0, 0, 0]);
  r.bone('mouth', 'puff', [0.21, -0.03, 0]);
  r.bone('tail', 'body', [-0.2, 0.0, 0]);
  r.bone('finR', 'puff', [0.04, -0.02, 0.17], [0, -20, 0]);
  r.bone('finL', 'puff', [0.04, -0.02, -0.17], [0, 20, 0]);
  r.bone('dorsal', 'puff', [-0.1, 0.14, 0]);

  /* corpo gordinho */
  r.add('puff',
    blob([0.24, 0.19, 0.18], back, { deform: [pull([0.2, 0, 0], 0.14, [0.03, 0, 0]), pull([-0.2, 0, 0], 0.14, [-0.03, 0, 0]), wobble(0.003)] }),
    blob([0.22, 0.14, 0.17], belly, { pos: [0.01, -0.06, 0], deform: [pull([0.15, -0.1, 0], 0.12, [0.0, -0.02, 0])] }),
    // pintas
    ...([[0.0, 0.15, 0.08], [-0.1, 0.12, 0.1], [0.08, 0.13, 0.1], [-0.05, 0.08, 0.15], [0.1, 0.06, 0.15], [-0.15, 0.05, 0.12], [0.02, 0.17, -0.04]] as V3[]).map((p, i) => blob([0.022 - (i % 3) * 0.003, 0.02 - (i % 3) * 0.003, 0.008], spot, { pos: p, rot: [Math.atan2(p[1], p[2]) / D2R * -1 + 90, 0, 0], seg: 10 })),
    // bochechas rosadas
    blob([0.05, 0.035, 0.02], mat('skin', 0xf0a090), { pos: [0.13, -0.04, 0.14], rot: [0, 40, 0] }),
  );
  const eR = eye({ r: 0.065, iris: 0x2a8a3a, irisScale: 0.55, look: [0.7, 0.1], lid: 0.22, lidColor: 0xc8a040, angry: 10 });
  eR.position.set(0.14, 0.08, 0.11); eR.rotation.y = 0.65;
  const eL = eye({ r: 0.06, iris: 0x2a8a3a, irisScale: 0.55, look: [0.7, 0.1], lid: 0.22, lidColor: 0xc8a040, angry: -10 });
  eL.position.set(0.15, 0.08, -0.1); eL.rotation.y = 0.0;
  r.add('puff', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // sobrancelhas
  r.add('puff', slab([[-0.04, 0], [0.04, 0.01], [0.045, 0.022], [-0.035, 0.016]], 0.012, spot, { pos: [0.15, 0.16, 0.11], rot: [0, 35, -14] }));
  // boquinha em bico com dentes de "bico de papagaio"
  r.add('mouth',
    blob([0.04, 0.035, 0.045], lipM, {}),
    blob([0.02, 0.012, 0.03], mat('skin', 0x5a1a1a), { pos: [0.035, 0, 0] }),
    blob([0.012, 0.01, 0.026], mat('shell', 0xfaf6ea), { pos: [0.036, 0.012, 0] }),
    blob([0.012, 0.01, 0.026], mat('shell', 0xfaf6ea), { pos: [0.036, -0.012, 0] }),
  );
  /* espinhos distribuídos numa esfera (latitudes/longitudes fixas) */
  const spines: number[][] = [];
  for (const lat of [-55, -25, 5, 35, 65]) {
    const n = lat === 65 || lat === -55 ? 6 : 10;
    for (let i = 0; i < n; i++) spines.push([lat, (i / n) * 360 + (lat % 20)]);
  }
  for (const [lat, lon] of spines) {
    const la = lat * D2R, lo = lon * D2R;
    const dir: V3 = [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
    if (dir[0] > 0.8 && Math.abs(dir[1]) < 0.4) continue; // não espeta a cara
    const p: V3 = [dir[0] * 0.2, dir[1] * 0.16, dir[2] * 0.15];
    // orienta o espinho (eixo +Y) ao longo de dir
    const rotZ = -Math.asin(dir[0]) / D2R;
    const rotX = Math.atan2(dir[2], dir[1]) / D2R;
    r.add('spines', spike(0.07, 0.016, spineM, { pos: p, rot: [rotX, 0, rotZ] }));
  }
  r.bones.spines.scale.setScalar(0.9);
  /* nadadeiras */
  for (const s of ['R', 'L'] as const) r.add(`fin${s}`, slab([[0, 0], [-0.08, 0.05], [-0.1, 0.0], [-0.07, -0.04]], 0.008, fin));
  r.add('dorsal', slab([[0, 0], [-0.08, 0.06], [-0.1, 0.02], [-0.06, -0.01]], 0.008, fin));
  r.add('tail',
    blob([0.06, 0.05, 0.04], back, { pos: [-0.02, 0, 0] }),
    slab([[0, 0], [-0.1, 0.09], [-0.08, 0.0], [-0.1, -0.09]], 0.01, fin, { pos: [-0.05, 0, 0], deform: [bulge([-0.09, 0, 0], 0.04, -0.01)] }),
  );
  r.anchor('head', 'body', [0, 0.3, 0]);
  r.root.scale.setScalar(1.3);
  return r;
}

// fator de inflado: corpo 1 → 1.75; espinhos 0.9 → 1.95 (relativo ao repouso 0.9 → s 2.17)
const INF = 1.75, SPN = 1.25;
const swim = (amp = 1): Record<string, Key[]> => ({
  tail: waveAxis(1, 30 * amp, 0), finR: waveAxis(1, 30, 0.2), finL: waveAxis(1, -30, 0.2), dorsal: wave(10, 0.4),
});

function anims(): AnimSet {
  const nadar = anim(16, true, {
    ...swim(),
    body: bob(0.03, 0, 8),
    mouth: [sc(0, 1), sc(0.25, [1, 1.2, 1]), sc(0.5, 1), sc(0.75, [1, 1.2, 1]), sc(1, 1)],
    lidR: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)],
  });
  const andar = anim(12, true, { ...swim(1.4), body: bob(0.03, 0, 8).map((x) => ({ ...x, r: [0, 0, -6] as V3 })) });
  const inflar = anim(10, false, {
    puff: [sc(0, 1), sc(0.6, INF * 1.06, 'out'), sc(0.8, INF * 0.97), sc(1, INF)],
    spines: [sc(0, 1), sc(0.4, 1.02), sc(0.7, SPN * 1.08, 'back'), sc(1, SPN)],
    body: [ps(0, [0, 0, 0]), ps(1, [0, 0.2, 0])],
    mouth: [sc(0, 1), sc(0.3, [1, 0.4, 1]), sc(1, [0.7, 0.3, 0.7])],
    lidR: [rx(0, 0), rx(0.3, 40), rx(0.7, -20), rx(1, -20)], lidL: [rx(0, 0), rx(0.3, 40), rx(0.7, -20), rx(1, -20)],
    tail: [ry(0, 0), ry(0.5, 30), ry(1, 0)],
  });
  const inflado = anim(16, true, {
    puff: [sc(0, INF), sc(0.5, [INF * 1.02, INF * 0.98, INF * 1.02]), sc(1, INF)],
    spines: [sc(0, SPN), sc(1, SPN)],
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [0, 0, 6 * Math.sin((i / 8) * Math.PI * 2)], [0, 0.2 + 0.03 * Math.sin((i / 8) * Math.PI * 2), 0], 'linear')),
    mouth: [sc(0, [0.7, 0.3, 0.7]), sc(1, [0.7, 0.3, 0.7])],
    lidR: [rx(0, -20), rx(1, -20)], lidL: [rx(0, -20), rx(1, -20)],
    tail: waveAxis(1, 50, 0, 8, 2), finR: waveAxis(1, 40, 0, 8, 2), finL: waveAxis(1, -40, 0, 8, 2),
  });
  // desinflar: solta o ar "pffff" e sai rodopiando
  const desinflar = anim(14, false, {
    puff: [sc(0, INF), sc(0.15, INF * 1.05), sc(0.8, 0.92, 'out'), sc(1, 1)],
    spines: [sc(0, SPN), sc(0.6, 0.95), sc(1, 1)],
    body: [k(0, [0, 0, 0], [0, 0.2, 0]), k(0.5, [0, 0, 200], [-0.06, 0.12, 0], 'out'), k(0.8, [0, 0, 340], [-0.08, 0.04, 0]), k(1, [0, 0, 360], [-0.08, 0, 0])],
    mouth: [sc(0, [0.7, 0.3, 0.7]), sc(0.15, [1.6, 1.6, 1.6]), sc(0.8, [1.4, 1.4, 1.4]), sc(1, 1)],
    lidR: [rx(0, -20), rx(0.15, 60), rx(0.8, 60), rx(1, 0)], lidL: [rx(0, -20), rx(0.15, 60), rx(0.8, 60), rx(1, 0)],
  });
  const ataque = anim(10, false, {
    ...swim(1.6),
    root: [ps(0, [0, 0, 0]), ps(0.3, [-0.05, 0, 0]), ps(0.55, [0.14, 0, 0], 'in'), ps(1, [0, 0, 0])],
    puff: [sc(0, 1), sc(0.3, 1.1), sc(0.55, 1.25, 'in'), sc(1, 1)],
    spines: [sc(0, 1), sc(0.55, 1.25), sc(1, 1)],
    mouth: [sc(0, 1), sc(0.3, [1.4, 1.8, 1.4]), sc(0.55, [0.8, 0.6, 0.8]), sc(1, 1)],
    lidR: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)],
  });
  const dano = anim(10, false, {
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [20, 0, 40], [-0.14, 0.06, 0], 'out'), k(1, [0, 0, 10], [-0.12, 0, 0])],
    puff: [sc(0, 1), sc(0.15, [1.2, 0.8, 1.2]), sc(0.4, [0.9, 1.1, 0.9]), sc(1, 1)],
    mouth: [sc(0, 1), sc(0.2, 1.6), sc(1, 1.3)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  const morte = anim(24, false, {
    puff: [sc(0, 1), sc(0.3, 1.3), sc(0.45, 0.85), sc(1, [1.1, 0.8, 1.1])],
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 30], [0, 0.06, 0]), k(0.6, [180, 0, 0], [0, 0.1, 0]), k(1, [180, 0, 0], [0, 0.45, 0])],
    mouth: [sc(0, 1), sc(0.45, 1.6), sc(1, 1.3)],
    lidR: [rx(0, 0), rx(0.3, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, 80), rx(1, 80)],
    tail: [ry(0, 0), ry(0.6, 20), ry(1, 0)],
  });
  const tonto = anim(16, true, {
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [16 * Math.sin((i / 8) * Math.PI * 2), 0, 16 * Math.cos((i / 8) * Math.PI * 2)], [0.03 * Math.cos((i / 8) * Math.PI * 2), 0.02 * Math.sin((i / 8) * Math.PI * 2), 0], 'linear')),
    ...swim(0.5),
    mouth: [sc(0, [1.2, 1.4, 1.2]), sc(1, [1.2, 1.4, 1.2])],
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: nadar, nadar, andar, ataque, dano, morte, tonto, inflar, inflado, desinflar };
}

export const baiacu: ModelDef = {
  id: 'baiacu',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [288, 256],
  pivot: [140, 232],
  height: 256 / 104,
  presets: ['recife', 'neutro'],
};
