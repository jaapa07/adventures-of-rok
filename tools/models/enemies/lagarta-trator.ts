/**
 * LAGARTA-TRATOR — máquina de desmatamento do Barão Javardo em forma de lagarta gigante:
 * quatro gomos-tambor amarelos de perigo (com ferrugem e foles de borracha), cada um sobre
 * uma esteira com rodas, cabeça-cabine com faróis-olhos raivosos, grade de dentes,
 * duas mandíbulas-serra circulares e uma chaminé cuspindo fumaça.
 * Avança derrubando árvores e só para com 3 cabaças.
 */
import { Rig, blob, tube, slab, lathe, ring, roundBox, spike, eye, mat, taper, pull, bulge, wobble, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, ps, sc, anim, wave, spin } from '../../anims/enemies/common';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const SEGS = [-2.75, -1.75, -0.75, 0.25];

function build() {
  const r = new Rig('root');
  const yellow = mat('paint', 0xf0b822, { rough: 0.45 });
  const yellowDark = mat('paint', 0xc88a10, { rough: 0.5 });
  const rustM = mat('rust', 0x9a5a32, { metal: 0.3 });
  const black = mat('paint', 0x26221e, { rough: 0.5 });
  const rubber = mat('rubber', 0x2a2826);
  const steel = mat('metal', 0xb8bec2, { metal: 0.5, rough: 0.3 });
  const steelDark = mat('metal', 0x5a6064, { metal: 0.5, rough: 0.45 });
  const smokeM = mat('cloth', 0x5a5654, { opacity: 0.8, rough: 1 });
  const smokeL = mat('cloth', 0x8a8684, { opacity: 0.65, rough: 1 });
  const glowM = mat('glow', 0xfff0a0, { emissiveIntensity: 1.4 });
  const gold = mat('metal', 0xd8aa3c, { metal: 0.5, rough: 0.3 });

  r.bone('body', 'root', [0, 0, 0]);
  /* ---------- gomos com esteiras ---------- */
  for (const [i, x] of SEGS.entries()) {
    r.bone(`seg${i}`, 'body', [x, 1.12, 0]);
    r.bone(`trk${i}`, 'body', [x, 0.32, 0]);
    const s = 1 - (3 - i) * 0.06; // gomos de trás um pouco menores
    r.add(`seg${i}`,
      // tambor (eixo Z) com rebordo
      lathe([[0.001, -0.62], [0.6, -0.62], [0.7 * s, -0.5], [0.74 * s, 0], [0.7 * s, 0.5], [0.6, 0.62], [0.001, 0.62]], yellow, { rot: [90, 0, 0], deform: [wobble(0.008, 3)] }),
      ring(0.62, 0.05, yellowDark, { pos: [0, 0, 0.62], deform: [] }),
      ring(0.62, 0.05, yellowDark, { pos: [0, 0, -0.62] }),
      // tampa lateral com parafusos e listras de perigo
      lathe([[0.001, 0.0], [0.45, 0.0], [0.47, 0.03], [0.001, 0.05]], steelDark, { pos: [0, 0, 0.62], rot: [90, 0, 0] }),
      ...[0, 60, 120, 180, 240, 300].map((a) => blob([0.035, 0.035, 0.02], steel, { pos: [Math.cos(a * D2R) * 0.38, Math.sin(a * D2R) * 0.38, 0.68], seg: 10 })),
      ...[-0.24, 0, 0.24].map((x2, j) => slab([[-0.07, -0.18], [0.07, -0.18], [0.07, 0.18], [-0.07, 0.18]], 0.01, j % 2 ? yellow : black, { pos: [x2, 0, 0.675], rot: [0, 0, 35], smooth: false, bevel: 0.004 })),
      // manchas de ferrugem e amassados
      blob([0.22, 0.12, 0.04], rustM, { pos: [-0.1 * i + 0.1, 0.55 * s, 0.4], rot: [-60, 0, 10] }),
      blob([0.14, 0.1, 0.04], rustM, { pos: [0.3, -0.35, 0.55], rot: [-20, 30, 0] }),
      // espinhos de lagarta (cerdas metálicas no dorso)
      ...[-0.3, 0, 0.3].map((z) => spike(0.28, 0.06, steelDark, { pos: [0, 0.7 * s, z], rot: [0, 0, 10 - z * 30], curve: -0.3 })),
      // fole de borracha que liga ao próximo gomo
      ...(i < 3 ? [lathe([[0.48, 0], [0.54, 0.08], [0.48, 0.16], [0.54, 0.24], [0.48, 0.32], [0.54, 0.4], [0.48, 0.48]], rubber, { pos: [0.26, 0, 0], rot: [0, 0, -90], scale: [1, 1, 1.2] })] : []),
    );
    // esteira: estádio de borracha + garras + 3 rodas
    const trackShape: [number, number][] = [];
    for (let j = 0; j <= 10; j++) { const a = -90 + j * 18; trackShape.push([0.32 + Math.cos(a * D2R) * 0.3, Math.sin(a * D2R) * 0.3]); }
    for (let j = 0; j <= 10; j++) { const a = 90 + j * 18; trackShape.push([-0.32 + Math.cos(a * D2R) * 0.3, Math.sin(a * D2R) * 0.3]); }
    r.add(`trk${i}`,
      slab(trackShape, 0.4, rubber, { pos: [0, 0, 0.5], smooth: false, bevel: 0.04 }),
      slab(trackShape, 0.4, rubber, { pos: [0, 0, -0.5], smooth: false, bevel: 0.04 }),
      ...[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((x2) => roundBox([0.08, 0.06, 0.48], 0.02, steelDark, { pos: [x2, -0.32, 0.5] })),
      ...[-0.5, -0.3, -0.1, 0.1, 0.3, 0.5].map((x2) => roundBox([0.08, 0.06, 0.48], 0.02, steelDark, { pos: [x2, 0.32, 0.5] })),
      // gravetos e folhas presos na esteira
      tube([[0.1, 0.3, 0.74], [0.25, 0.38, 0.76], [0.35, 0.36, 0.7]], 0.02, mat('wood', 0x7a5a3a), { seg: 8, radial: 5 }),
      slab([[0, 0], [0.08, 0.04], [0.12, 0.0], [0.06, -0.03]], 0.01, mat('leaf', 0x4a8a2a), { pos: [-0.3, 0.34, 0.74], rot: [0, 0, 30] }),
    );
    for (const [j, x2] of [-0.32, 0, 0.32].entries()) {
      r.bone(`wh${i}${j}`, `trk${i}`, [x2, 0, 0.72]);
      r.add(`wh${i}${j}`,
        lathe([[0.001, -0.04], [0.22, -0.04], [0.24, 0.0], [0.22, 0.04], [0.001, 0.05]], steelDark, { rot: [90, 0, 0] }),
        lathe([[0.001, 0.0], [0.09, 0.0], [0.08, 0.06], [0.001, 0.08]], yellowDark, { rot: [90, 0, 0] }),
        ...[0, 90, 180, 270].map((a) => roundBox([0.2, 0.04, 0.03], 0.012, steel, { pos: [Math.cos(a * D2R) * 0.11, Math.sin(a * D2R) * 0.11, 0.05], rot: [0, 0, a] })),
      );
    }
  }
  /* ---------- cabeça-cabine ---------- */
  r.bone('head', 'body', [1.55, 1.35, 0]);
  r.add('head',
    blob([0.95, 0.9, 0.82], yellow, { deform: [pull([0.8, -0.3, 0], 0.6, [0.15, -0.1, 0]), taper('y', -0.9, 0.9, 1.0, 0.82), wobble(0.01, 3)] }),
    // faixa escura da "testa" e para-brisa da cabine
    blob([0.5, 0.2, 0.6], black, { pos: [0.1, 0.62, 0], rot: [0, 0, -12] }),
    roundBox([0.5, 0.32, 1.0], 0.08, mat('glass', 0x7ab0c8, { opacity: 0.6 }), { pos: [-0.3, 0.78, 0], rot: [0, 0, 10] }),
    // grade-boca com dentes de aço
    roundBox([0.2, 0.42, 1.0], 0.06, steelDark, { pos: [0.92, -0.42, 0] }),
    ...[-0.38, -0.19, 0, 0.19, 0.38].map((z) => spike(0.22, 0.07, steel, { pos: [1.0, -0.2, z], rot: [0, 0, 180] })),
    ...[-0.28, -0.09, 0.09, 0.28].map((z) => spike(0.2, 0.065, steel, { pos: [1.0, -0.64, z], rot: [0, 0, 0] })),
    // placa do Barão: cabeça de javali dourada
    blob([0.2, 0.16, 0.04], gold, { pos: [0.3, 0.05, 0.8], rot: [0, 20, 0] }),
    spike(0.12, 0.025, gold, { pos: [0.4, -0.04, 0.82], rot: [0, 0, -40], curve: -0.4 }),
    spike(0.12, 0.025, gold, { pos: [0.2, -0.04, 0.84], rot: [0, 0, 40], curve: 0.4 }),
    // pistões hidráulicos para as mandíbulas
    tube([[0.4, -0.2, 0.75], [0.75, -0.45, 0.85]], 0.05, steel, { seg: 4, radial: 10 }),
    tube([[0.4, -0.2, -0.75], [0.75, -0.45, -0.85]], 0.05, steel, { seg: 4, radial: 10 }),
    // antenas de lagarta (com lâmpadas giratórias)
    tube([[-0.2, 0.85, 0.3], [-0.05, 1.2, 0.4], [0.2, 1.4, 0.42]], 0.035, steelDark, { seg: 12, radial: 6 }),
    tube([[-0.2, 0.85, -0.3], [-0.05, 1.2, -0.4], [0.2, 1.4, -0.42]], 0.035, steelDark, { seg: 12, radial: 6 }),
    blob([0.09, 0.09, 0.09], mat('glow', 0xff7a1a, { emissiveIntensity: 1.3 }), { pos: [0.2, 1.42, 0.42] }),
    blob([0.09, 0.09, 0.09], mat('glow', 0xff7a1a, { emissiveIntensity: 1.3 }), { pos: [0.2, 1.42, -0.42] }),
  );
  // faróis-olhos raivosos (com aro de farol e sobrancelha de chapa)
  const eR = eye({ r: 0.26, iris: 0xe8a010, irisScale: 0.55, look: [0.8, -0.2], lid: 0.4, lidColor: 0x26221e, angry: 24 });
  eR.position.set(0.66, 0.22, 0.42); eR.rotation.y = 0.75;
  const eL = eye({ r: 0.24, iris: 0xe8a010, irisScale: 0.55, look: [0.8, -0.2], lid: 0.4, lidColor: 0x26221e, angry: -24 });
  eL.position.set(0.74, 0.22, -0.32); eL.rotation.y = 0.35;
  r.add('head', eR, eL,
    ring(0.27, 0.045, steel, { pos: [0.69, 0.22, 0.45], rot: [0, 43, 0] }),
    ring(0.25, 0.045, steel, { pos: [0.78, 0.22, -0.3], rot: [0, 20, 0] }),
    slab([[-0.3, 0], [0.28, 0.08], [0.3, 0.16], [-0.28, 0.12]], 0.06, black, { pos: [0.72, 0.5, 0.42], rot: [0, 43, -18] }),
    slab([[-0.3, 0], [0.28, 0.08], [0.3, 0.16], [-0.28, 0.12]], 0.06, black, { pos: [0.8, 0.48, -0.3], rot: [0, 20, -18] }),
  );
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  /* ---------- mandíbulas-serra ---------- */
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.bone(`jaw${s}`, 'head', [0.6, -0.45, 0.82 * zs], [0, zs * -10, 0]);
    r.bone(`saw${s}`, `jaw${s}`, [0.75, -0.05, 0.08 * zs]);
    r.add(`jaw${s}`,
      roundBox([0.85, 0.16, 0.12], 0.05, yellowDark, { pos: [0.38, 0, 0] }),
      lathe([[0.001, -0.1], [0.1, -0.1], [0.1, 0.1], [0.001, 0.1]], steelDark, { rot: [90, 0, 0] }),
      // capa da serra
      ring(0.47, 0.06, yellowDark, { pos: [0.75, -0.05, 0.0], arc: 160, rot: [0, 0, 10] }),
    );
    const teeth = Array.from({ length: 20 }, (_, j) => {
      const a = (j / 20) * 360;
      return spike(0.11, 0.05, steel, { pos: [Math.cos(a * D2R) * 0.42, Math.sin(a * D2R) * 0.42, 0], rot: [0, 0, a - 90 - 30], curve: 0.25 });
    });
    r.add(`saw${s}`,
      lathe([[0.001, -0.015], [0.42, -0.015], [0.43, 0], [0.42, 0.015], [0.001, 0.015]], steel, { rot: [90, 0, 0], seg: 48 }),
      ring(0.3, 0.012, steelDark),
      lathe([[0.001, -0.05], [0.1, -0.05], [0.1, 0.05], [0.001, 0.06]], yellowDark, { rot: [90, 0, 0] }),
      ...[0, 120, 240].map((a) => blob([0.06, 0.06, 0.02], black, { pos: [Math.cos(a * D2R) * 0.2, Math.sin(a * D2R) * 0.2, 0.016], seg: 12 })),
      ...teeth,
    );
  }
  /* ---------- chaminé e fumaça ---------- */
  r.bone('chimney', 'seg3', [-0.1, 0.62, 0.2]);
  r.add('chimney',
    lathe([[0.16, 0], [0.15, 0.5], [0.17, 0.85], [0.24, 0.95], [0.24, 1.0], [0.18, 1.0]], rustM, { deform: [] }),
    ring(0.16, 0.03, steelDark, { pos: [0, 0.3, 0], rot: [90, 0, 0] }),
    ring(0.17, 0.03, steelDark, { pos: [0, 0.65, 0], rot: [90, 0, 0] }),
    blob([0.15, 0.03, 0.15], black, { pos: [0, 0.98, 0] }),
  );
  for (let i = 0; i < 3; i++) {
    r.bone(`smoke${i}`, 'chimney', [0, 0.95, 0]);
    r.add(`smoke${i}`,
      blob([0.2, 0.17, 0.2], i % 2 ? smokeL : smokeM, { deform: [wobble(0.02, 12)] }),
      blob([0.13, 0.12, 0.13], smokeL, { pos: [0.12, 0.08, 0.06], deform: [wobble(0.015, 14)] }),
    );
  }
  // farol de teto
  r.add('seg3', blob([0.1, 0.07, 0.1], glowM, { pos: [0.3, 0.7, -0.2] }));
  r.anchor('head', 'head', [0, 1.3, 0]);
  r.root.scale.setScalar(0.88);
  return r;
}

const wheels = (turns: number): Record<string, Key[]> => Object.fromEntries(SEGS.flatMap((_, i) => [0, 1, 2].map((j) => [`wh${i}${j}`, spin(2, -turns)])));
const smoke = (speed = 1): Record<string, Key[]> => Object.fromEntries([0, 1, 2].map((i) => {
  const keys: Key[] = [];
  for (let j = 0; j <= 6; j++) {
    const t = j / 6;
    const u = (t * speed + i / 3) % 1;
    keys.push(k(t, [0, 0, 0], [-u * 1.6, u * 0.42, 0], 'linear', 0.4 + u * 1.0));
  }
  return [`smoke${i}`, keys];
}));
const segWave = (amp: number, n = 8): Record<string, Key[]> => Object.fromEntries(SEGS.map((_, i) => [`seg${i}`, Array.from({ length: n + 1 }, (_, j) => k(j / n, [0, 0, 3 * Math.sin((j / n - i * 0.22) * Math.PI * 2)], [0, amp * Math.sin((j / n - i * 0.22) * Math.PI * 2), 0], 'linear'))]));

function anims(): AnimSet {
  const avancar = anim(16, true, {
    ...wheels(1), ...smoke(1), ...segWave(0.06),
    head: Array.from({ length: 9 }, (_, j) => k(j / 8, [0, 0, 3 * Math.sin((j / 8 + 0.25) * Math.PI * 2)], [0, 0.05 * Math.sin((j / 8 + 0.25) * Math.PI * 2), 0], 'linear')),
    sawR: spin(2, -2), sawL: spin(2, -2),
    jawR: wave(6, 0, 0, 8, 2), jawL: wave(6, 0.5, 0, 8, 2),
    body: [ps(0, [0, 0, 0]), ps(0.25, [0, 0.015, 0]), ps(0.5, [0, 0, 0]), ps(0.75, [0, 0.015, 0]), ps(1, [0, 0, 0])],
    lidR: [rx(0, 0), rx(0.8, 0), rx(0.84, 50), rx(0.9, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.8, 0), rx(0.84, 50), rx(0.9, 0), rx(1, 0)],
  });
  // parar: freio brusco, tranco para a frente e a fumaça engasga
  const parar = anim(16, false, {
    ...Object.fromEntries(SEGS.flatMap((_, i) => [0, 1, 2].map((j) => [`wh${i}${j}`, [rz(0, 0, 'linear'), rz(0.4, -150, 'out'), rz(1, -160)]]))),
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, -4], [0.12, 0, 0], 'out'), k(0.55, [0, 0, 2], [0.06, 0, 0]), k(1, [0, 0, 0], [0.08, 0, 0], 'bounce')],
    head: [rz(0, 0), rz(0.3, -10), rz(0.55, 6), rz(1, 0, 'bounce')],
    ...Object.fromEntries(SEGS.map((_, i) => [`seg${i}`, [ps(0, [0, 0, 0]), ps(0.3 + i * 0.04, [0.06 * (4 - i), 0.04, 0]), ps(1, [0, 0, 0], 'bounce')]])),
    sawR: [rz(0, 0), rz(0.6, -300, 'out'), rz(1, -320)], sawL: [rz(0, 0), rz(0.6, -300, 'out'), rz(1, -320)],
    smoke0: [k(0, undefined, [0, 0, 0], 'linear', 0.5), k(0.4, undefined, [0, 0.3, 0], 'out', 1.8), k(1, undefined, [-0.4, 1.2, 0], 'linear', 2.4)],
    smoke1: [k(0, undefined, [0, 0, 0], 'linear', 0.01), k(1, undefined, [0, 0, 0], 'linear', 0.01)],
    smoke2: [k(0, undefined, [0, 0, 0], 'linear', 0.01), k(1, undefined, [0, 0, 0], 'linear', 0.01)],
    lidR: [rx(0, 0), rx(0.3, -30), rx(0.6, 20), rx(1, 20)], lidL: [rx(0, 0), rx(0.3, -30), rx(0.6, 20), rx(1, 20)],
  });
  const ataque = anim(16, false, {
    ...wheels(1), ...smoke(2),
    head: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, 12], [-0.15, 0.1, 0], 'out'), k(0.55, [0, 0, -14], [0.35, -0.1, 0], 'in'), k(0.75, [0, 0, -12], [0.3, -0.08, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    jawR: [ry(0, 0), ry(0.35, -26), ry(0.55, 18, 'in'), ry(0.65, -10), ry(0.75, 18), ry(1, 0)],
    jawL: [ry(0, 0), ry(0.35, 26), ry(0.55, -18, 'in'), ry(0.65, 10), ry(0.75, -18), ry(1, 0)],
    sawR: spin(2, -4), sawL: spin(2, -4),
    lidR: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 30), rx(0.8, 30), rx(1, 0)],
  });
  const dano = anim(12, false, {
    ...smoke(3),
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 4], [-0.1, 0.05, 0], 'out'), k(0.3, [0, 0, -2], [0.04, 0, 0]), k(0.45, [0, 0, 2], [-0.03, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    head: [rz(0, 0), rz(0.15, 16), rz(0.4, -6), rz(1, 0)],
    chimney: [rz(0, 0), rz(0.15, -20), rz(0.4, 10), rz(1, 0, 'bounce')],
    lidR: [rx(0, 0), rx(0.12, 70), rx(1, 40)], lidL: [rx(0, 0), rx(0.12, 70), rx(1, 40)],
  });
  // morte: os gomos desabam um a um, a cabeça tomba e a chaminé solta um cogumelo de fumaça
  const morte = anim(32, false, {
    ...Object.fromEntries(SEGS.map((_, i) => [`seg${i}`, [k(0, [0, 0, 0], [0, 0, 0]), k(0.2 + i * 0.1, [0, 0, 0], [0, 0.1, 0], 'out'), k(0.35 + i * 0.1, [i % 2 ? 12 : -12, 0, i % 2 ? 8 : -8], [0, -0.42, 0], 'in'), k(1, [i % 2 ? 10 : -10, 0, i % 2 ? 6 : -6], [0, -0.4, 0], 'bounce')]])),
    head: [k(0, [0, 0, 0], [0, 0, 0]), k(0.5, [0, 0, 6], [0, 0.1, 0]), k(0.75, [14, 0, -30], [0.2, -0.65, 0], 'in'), k(1, [12, 0, -26], [0.2, -0.6, 0], 'bounce')],
    jawR: [ry(0, 0), ry(0.75, 30), ry(1, 40)], jawL: [ry(0, 0), ry(0.75, -20), ry(1, -30)],
    chimney: [rz(0, 0), rz(0.6, 0), rz(0.8, 50, 'in'), rz(1, 40, 'bounce')],
    smoke0: [k(0, undefined, [0, 0, 0], 'linear', 0.5), k(1, undefined, [0, 0.6, 0], 'out', 2.6)],
    smoke1: [k(0, undefined, [0, 0, 0], 'linear', 0.5), k(1, undefined, [0.5, 0.7, 0], 'out', 2.6)],
    smoke2: [k(0, undefined, [0, 0, 0], 'linear', 0.5), k(1, undefined, [-0.5, 0.7, 0], 'out', 2.6)],
    sawR: [rz(0, 0), rz(0.5, -400, 'out'), rz(1, -420)], sawL: [rz(0, 0), rz(0.5, -400, 'out'), rz(1, -420)],
    lidR: [rx(0, 0), rx(0.3, -30), rx(0.75, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.3, -30), rx(0.75, 80), rx(1, 80)],
  });
  const tonto = anim(16, true, {
    ...smoke(0.5),
    head: Array.from({ length: 9 }, (_, j) => k(j / 8, [8 * Math.sin((j / 8) * Math.PI * 2), 0, 6 * Math.cos((j / 8) * Math.PI * 2)], undefined, 'linear')),
    ...segWave(0.03),
    jawR: wave(14, 0), jawL: wave(14, 0.5),
    sawR: spin(2, -0.5), sawL: spin(2, 0.5),
    chimney: wave(8, 0.25),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: avancar, avancar, andar: avancar, parar, ataque, dano, morte, tonto };
}

export const lagartaTrator: ModelDef = {
  id: 'lagarta-trator',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [720, 420],
  pivot: [350, 410],
  height: 420 / 104,
  presets: ['fabrica', 'neutro'],
};
