/**
 * MARIMBONDO-DE-LATA — vespa mecânica feita de latas de conserva: abdômen listrado de
 * amarelo e preto pintado à mão, asas de celofane iridescente, ferrão de agulha de costura,
 * pernas de arame, antenas de mola e uma chave de corda nas costas.
 */
import { Rig, blob, tube, slab, lathe, ring, spike, eye, mat, taper, pull, bulge, D2R, type V3 } from '../../render/sculpt';
import { k, rz, rx, ry, sc, bob, spin, anim, wave, waveAxis } from '../../anims/enemies/common';
import type { AnimSet } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = new Rig('root');
  const tin = mat('metal', 0xd8b23a, { metal: 0.45, rough: 0.35 });
  const tinBlack = mat('metal', 0x2a2622, { metal: 0.4, rough: 0.4 });
  const tinSilver = mat('metal', 0xc8ccd0, { metal: 0.5, rough: 0.3 });
  const wire = mat('metal', 0x4a4644, { metal: 0.5, rough: 0.45 });
  const cello = mat('glass', 0xd8f4ff, { opacity: 0.55, rough: 0.05, emissive: 0x5aa8c8, emissiveIntensity: 0.25 });
  const celloEdge = mat('plastic', 0x8ad0e8, { rough: 0.3 });
  const needle = mat('metal', 0xe8eef2, { metal: 0.6, rough: 0.15 });

  r.bone('body', 'root', [0, 0.55, 0]);
  r.bone('head', 'body', [0.2, 0.04, 0]);
  r.bone('abdomen', 'body', [-0.12, -0.02, 0], [0, 0, 20]);
  r.bone('sting', 'abdomen', [-0.34, -0.02, 0]);
  r.bone('wingR', 'body', [0.02, 0.1, 0.06], [-20, 0, 0]);
  r.bone('wingL', 'body', [0.02, 0.1, -0.06], [20, 0, 0]);
  r.bone('wingR2', 'body', [-0.04, 0.09, 0.05], [-30, 0, -10]);
  r.bone('wingL2', 'body', [-0.04, 0.09, -0.05], [30, 0, -10]);
  r.bone('key', 'body', [-0.02, 0.12, 0]);
  r.bone('antR', 'head', [0.08, 0.08, 0.04]);
  r.bone('antL', 'head', [0.08, 0.08, -0.04]);
  for (const [i, x] of [0.08, 0.0, -0.08].entries()) {
    r.bone(`legR${i}`, 'body', [x, -0.08, 0.06], [30, 0, 0]);
    r.bone(`legL${i}`, 'body', [x, -0.08, -0.06], [-30, 0, 0]);
  }

  /* tórax: lata de sardinha arredondada */
  r.add('body',
    blob([0.14, 0.12, 0.12], tinBlack, { deform: [bulge([0, 0.1, 0], 0.1, 0.02)] }),
    ring(0.12, 0.012, tinSilver, { rot: [0, 90, 0] }),
    ...([[0.06, 0.06, 0.1], [-0.06, 0.06, 0.1], [0.06, -0.04, 0.11], [-0.06, -0.04, 0.11]] as V3[]).map((p) => blob([0.012, 0.012, 0.008], tinSilver, { pos: p, seg: 8 })),
  );
  /* cabeça de lata com olhões e mandíbulas de tesoura */
  r.add('head',
    blob([0.12, 0.11, 0.11], tin, { deform: [pull([0.1, -0.04, 0], 0.08, [0.03, -0.02, 0])] }),
    // mandíbulas
    slab([[0, 0], [0.07, -0.01], [0.09, -0.04], [0.05, -0.03], [0, -0.02]], 0.012, tinSilver, { pos: [0.08, -0.07, 0.03], rot: [0, -10, -10] }),
    slab([[0, 0], [0.07, -0.01], [0.09, -0.04], [0.05, -0.03], [0, -0.02]], 0.012, tinSilver, { pos: [0.08, -0.07, -0.03], rot: [0, 10, -10] }),
    // listra preta na testa
    lathe([[0.112, -0.015], [0.116, 0], [0.112, 0.015]], tinBlack, { pos: [0.0, 0.02, 0], rot: [0, 0, 70] }),
  );
  const eR = eye({ r: 0.07, iris: 0xd8261a, irisScale: 0.62, look: [0.8, -0.2], lid: 0.32, lidColor: 0x2a2622, angry: 18 });
  eR.position.set(0.06, 0.03, 0.075); eR.rotation.y = 0.7;
  const eL = eye({ r: 0.065, iris: 0xd8261a, irisScale: 0.62, look: [0.8, -0.2], lid: 0.32, lidColor: 0x2a2622, angry: -18 });
  eL.position.set(0.07, 0.03, -0.07); eL.rotation.y = 0.1;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // antenas de mola
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    const pts: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, a = t * Math.PI * 10;
      pts.push([t * 0.12 + Math.cos(a) * 0.012, t * 0.14 + Math.sin(a) * 0.012, zs * t * 0.04]);
    }
    r.add(`ant${s}`, tube(pts, 0.005, wire, { seg: 72, radial: 5 }), blob([0.02, 0.02, 0.02], mat('plastic', 0xd8261a), { pos: [0.12, 0.145, zs * 0.04] }));
  }

  /* abdômen: latas listradas encaixadas, afinando para o ferrão */
  r.add('abdomen',
    lathe([[0.001, 0.0], [0.1, 0.02], [0.13, 0.1], [0.12, 0.2], [0.08, 0.28], [0.03, 0.33], [0.001, 0.34]], tin, { rot: [0, 0, 90], deform: [taper('x', -0.34, 0, 0.9, 1)] }),
    ...[0.08, 0.16, 0.24].map((x, i) => lathe([[0.001, -0.022], [[0.128, 0.124, 0.094][i], -0.022], [[0.132, 0.126, 0.096][i], 0], [[0.128, 0.124, 0.094][i], 0.022], [0.001, 0.022]], tinBlack, { pos: [-x - 0.02, 0, 0], rot: [0, 0, 90] })),
    // rebites nas emendas
    ...[0.04, 0.12, 0.2].map((x) => blob([0.01, 0.01, 0.008], tinSilver, { pos: [-x, 0.02, 0.12 - x * 0.18], seg: 8 })),
  );
  r.add('sting',
    spike(0.16, 0.014, needle, { rot: [0, 0, 100] }),
    ring(0.012, 0.004, needle, { pos: [-0.12, -0.02, 0], rot: [0, 0, 10] }),
  );
  /* asas de celofane com nervuras */
  const wing = (len: number, w: number): [number, number][] => [[0, 0], [len * 0.3, w * 0.5], [len * 0.8, w * 0.55], [len, w * 0.1], [len * 0.7, -w * 0.3], [len * 0.2, -w * 0.2]];
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`wing${s}`,
      slab(wing(0.42, 0.2), 0.004, cello, { rot: [90 * zs, 0, 120], bevel: 0.001 }),
      tube([[0, 0, 0], [-0.12 * 0.5, 0.0, 0.16 * zs], [-0.18 * 0.5, 0, 0.3 * zs]], 0.004, celloEdge, { seg: 8, radial: 4 }),
      tube([[0, 0, 0], [0.0, 0, 0.14 * zs], [0.04, 0, 0.26 * zs]], 0.003, celloEdge, { seg: 8, radial: 4 }),
    );
    r.add(`wing${s}2`, slab(wing(0.24, 0.12), 0.004, cello, { rot: [90 * zs, 0, 130], bevel: 0.001 }));
    // pernas de arame com pezinhos de botão
    for (let i = 0; i < 3; i++) {
      r.add(`leg${s}${i}`,
        tube([[0, 0, 0], [0.03 - i * 0.02, -0.08, 0.02 * zs], [0.05 - i * 0.04, -0.16, 0.0]], 0.008, wire, { seg: 10, radial: 5 }),
        blob([0.018, 0.012, 0.018], tinBlack, { pos: [0.05 - i * 0.04, -0.165, 0] }),
      );
    }
  }
  /* chave de corda nas costas */
  r.add('key',
    tube([[0, 0, 0], [0, 0.06, 0]], 0.012, tinSilver, { seg: 4, radial: 8 }),
    slab([[-0.06, 0], [-0.02, -0.02], [0.02, -0.02], [0.06, 0], [0.02, 0.02], [-0.02, 0.02]], 0.012, tinSilver, { pos: [0, 0.09, 0], rot: [90, 0, 0] }),
    ring(0.03, 0.008, tinSilver, { pos: [0.05, 0.09, 0], rot: [90, 0, 0] }),
    ring(0.03, 0.008, tinSilver, { pos: [-0.05, 0.09, 0], rot: [90, 0, 0] }),
  );
  r.bones.key.rotation.x = -14 * D2R;
  r.anchor('head', 'body', [0, 0.3, 0]);
  r.root.scale.setScalar(1.3);
  return r;
}

function anims(): AnimSet {
  // bater de asas: 1 ciclo a cada 2 quadros (zumbido)
  const flap = (n: number) => {
    const cyc = n / 2;
    return {
      wingR: waveAxis(0, 50, 0, n, cyc).map((x) => ({ ...x, e: 'linear' as const })),
      wingL: waveAxis(0, -50, 0, n, cyc),
      wingR2: waveAxis(0, 40, 0.15, n, cyc),
      wingL2: waveAxis(0, -40, 0.15, n, cyc),
    };
  };
  const legsDangle = (ph: number) => Object.fromEntries([0, 1, 2].flatMap((i) => [[`legR${i}`, wave(8, ph + i * 0.2)], [`legL${i}`, wave(8, ph + i * 0.2 + 0.5)]]));
  const voar = anim(16, true, {
    ...flap(16), ...legsDangle(0),
    body: bob(0.05, 0, 8).map((x, i) => ({ ...x, r: [0, 0, 4 * Math.sin((i / 8) * Math.PI * 2 + 1)] as V3 })),
    abdomen: wave(6, 0.3),
    antR: wave(8, 0.1), antL: wave(8, 0.4),
    key: spin(1, 1),
    lidR: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)], lidL: [rx(0, 0), rx(0.7, 0), rx(0.74, 60), rx(0.8, 0), rx(1, 0)],
  });
  const andar = anim(16, true, { ...voar.keys, body: bob(0.03, 0, 8).map((x) => ({ ...x, r: [0, 0, -14] as V3 })) });
  // ataque: recua e enfia o ferrão para a frente por baixo do corpo
  const ataque = anim(14, false, {
    ...flap(14), key: spin(1, 2),
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, 30], [-0.1, 0.1, 0], 'out'), k(0.6, [0, 0, -10], [0.18, -0.08, 0], 'in'), k(1, [0, 0, 0], [0, 0, 0])],
    abdomen: [rz(0, 0), rz(0.35, 60), rz(0.6, 130, 'in'), rz(0.75, 120), rz(1, 0)],
    head: [rz(0, 0), rz(0.35, -10), rz(0.6, -20), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 25), rx(0.8, 25), rx(1, 0)],
  });
  const dano = anim(10, false, {
    ...flap(10),
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [30, 0, 40], [-0.14, 0.08, 0], 'out'), k(1, [0, 0, 10], [-0.1, 0, 0])],
    abdomen: [rz(0, 0), rz(0.2, -30), rz(1, -10)],
    antR: [rz(0, 0), rz(0.2, 50), rz(1, 20)], antL: [rz(0, 0), rz(0.2, 40), rz(1, 20)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(1, 45)], lidL: [rx(0, 0), rx(0.15, 70), rx(1, 45)],
  });
  // morte: a corda acaba, as asas param e ele cai de costas, pernas para cima
  const morte = anim(24, false, {
    wingR: [rx(0, 0), rx(0.1, 40), rx(0.2, -30), rx(0.3, 20), rx(0.5, 0)], wingL: [rx(0, 0), rx(0.1, -40), rx(0.2, 30), rx(0.3, -20), rx(0.5, 0)],
    key: [ry(0, 0), ry(0.4, 200, 'out'), ry(1, 220)],
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 10], [0, 0.06, 0], 'out'), k(0.7, [0, 0, 180], [0, -0.4, 0], 'in'), k(0.8, [0, 0, 170], [0, -0.34, 0], 'out'), k(1, [0, 0, 180], [0, -0.4, 0], 'in')],
    ...Object.fromEntries([0, 1, 2].flatMap((i) => [[`legR${i}`, [rz(0, 0), rz(0.7, 0), rz(0.8, 30 - i * 10), rz(0.9, -20), rz(1, 10)]], [`legL${i}`, [rz(0, 0), rz(0.7, 0), rz(0.85, -20), rz(1, 20 - i * 10)]]])),
    lidR: [rx(0, 0), rx(0.25, -30), rx(0.7, 80), rx(1, 80)], lidL: [rx(0, 0), rx(0.25, -30), rx(0.7, 80), rx(1, 80)],
    antR: [rz(0, 0), rz(0.7, -40), rz(1, -60)], antL: [rz(0, 0), rz(0.7, -30), rz(1, -50)],
  });
  const tonto = anim(16, true, {
    ...flap(16), ...legsDangle(0.2),
    body: Array.from({ length: 9 }, (_, i) => k(i / 8, [16 * Math.sin((i / 8) * Math.PI * 2), 0, 12 * Math.cos((i / 8) * Math.PI * 2)], [0.04 * Math.cos((i / 8) * Math.PI * 2), -0.06, 0.03 * Math.sin((i / 8) * Math.PI * 2)], 'linear')),
    antR: wave(30, 0), antL: wave(30, 0.5),
    abdomen: wave(14, 0.25, -10),
    key: [ry(0, 0), ry(1, 90)],
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 15), rx(1, 15)],
  });
  return { idle: voar, voar, andar, ataque, dano, morte, tonto };
}

export const marimbondo: ModelDef = {
  id: 'marimbondo',
  kind: 'enemy',
  build,
  anims: anims(),
  cell: [224, 200],
  pivot: [112, 176],
  height: 200 / 104,
  presets: ['selva', 'caverna', 'neutro'],
};
