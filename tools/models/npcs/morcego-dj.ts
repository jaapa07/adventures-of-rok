/**
 * MORCEGO DJ — morceguinho que comanda a festa na caverna (gag_morcego_dj).
 * Orelhonas atravessando um fone de ouvido enorme, óculos escuros na testa, corrente com pingente de coco,
 * atrás de um caixote com dois toca-discos de casca de coco e um mixer de botões luminosos.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, roundBox, eye, mat, taper, pull, wobble, flattenBelow, type V3, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim } from '../../render/anim';
import { k, rz, rx, ry, pk, sk, blink, wave, waveP } from '../../anims/bosses/kit';

const C = { fur: 0x5a4a6a, furDark: 0x3a2e48, skin: 0x7a5a7a, membrane: 0x6a4a6e, inner: 0xd890a8 };

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 3 });
  const furDark = mat('fur', C.furDark, { repeat: 3 });
  const skin = mat('skin', C.skin, { rough: 0.5 });
  const membrane = mat('leather', C.membrane, { rough: 0.55, rim: 0.8 });
  const inner = mat('skin', C.inner, { rough: 0.5 });
  const black = mat('plastic', 0x16161a, { rough: 0.3 });
  const red = mat('plastic', 0xe02a3a, { rough: 0.3 });
  const coco = mat('fur', 0x6a4426, { repeat: 4 });
  const cocoIn = mat('shortFur', 0xf2ead6, { repeat: 3 });
  const crate = mat('wood', 0x9a6a3a);
  const gold = mat('metal', 0xe0b445, { metal: 0.5, rough: 0.25 });

  /* ---------- esqueleto ---------- */
  r.bone('body', 'root', [-0.12, 0.3, 0]);
  r.bone('chest', 'body', [0, 0.14, 0]);
  r.bone('head', 'chest', [0.03, 0.22, 0]);
  r.bones.head.scale.setScalar(1.18);
  r.bone('jaw', 'head', [0.13, -0.08, 0]);
  r.bone('earL', 'head', [-0.03, 0.13, -0.08], [-14, 0, 0]);
  r.bone('earR', 'head', [-0.03, 0.13, 0.08], [14, 0, 0]);
  r.bone('phones', 'head', [-0.01, 0.0, 0]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`arm${s}_up`, 'chest', [0.02, 0.08, 0.14 * z], [z * 10, 0, 40]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.18, 0], [0, 0, 60]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.18, 0]);
    r.bone(`leg${s}`, 'body', [-0.02, -0.1, 0.07 * z]);
  }
  r.bone('deck', 'root', [0.3, 0, 0]);
  r.bone('discR', 'deck', [0.0, 0.43, 0.19]);
  r.bone('discL', 'deck', [0.0, 0.43, -0.19]);
  r.bone('knob', 'deck', [0.02, 0.44, 0]);
  r.anchor('head', 'head', [0, 0.32, 0]);
  r.anchor('hand', 'handR', [0.02, -0.04, 0]);

  /* ---------- corpo ---------- */
  r.add('body',
    blob([0.15, 0.17, 0.15], fur, { deform: [taper('y', -0.17, 0.17, 0.85, 1.05), wobble(0.006)] }),
    blob([0.1, 0.12, 0.11], mat('shortFur', 0x8a7a9a), { pos: [0.06, 0.0, 0] }),
  );
  r.add('chest',
    blob([0.14, 0.12, 0.15], fur, { pos: [0, 0.03, 0], deform: [wobble(0.008, 8)] }),
    // camiseta regata vermelha
    blob([0.145, 0.1, 0.152], red, { pos: [0, -0.02, 0], deform: [flattenBelow(-0.08, 1)] }),
    // corrente com pingente de coco
    tube([[0.04, 0.09, 0.11], [0.13, 0.03, 0.06], [0.15, 0.0, 0], [0.13, 0.03, -0.06], [0.04, 0.09, -0.11]], 0.008, gold, { seg: 20, radial: 5 }),
    lathe([[0.001, -0.025], [0.02, -0.02], [0.025, 0.0], [0.02, 0.02], [0.001, 0.025]], coco, { pos: [0.155, -0.02, 0], rot: [0, 0, 90] }),
  );
  /* ---------- cabeça ---------- */
  r.add('head',
    blob([0.15, 0.13, 0.14], fur, { deform: [pull([0.12, -0.05, 0], 0.1, [0.03, -0.01, 0]), wobble(0.006)] }),
    blob([0.06, 0.05, 0.07], skin, { pos: [0.12, -0.04, 0] }),
    slab([[0, 0], [0.02, 0.025], [0, 0.05], [-0.02, 0.025]], 0.01, skin, { pos: [0.17, -0.02, 0], rot: [0, 90, -15] }),
    blob([0.01, 0.007, 0.007], mat('skin', 0x1a0a14), { pos: [0.175, -0.04, 0.016] }),
    blob([0.01, 0.007, 0.007], mat('skin', 0x1a0a14), { pos: [0.175, -0.04, -0.016] }),
    // topete
    ...[0, 1, 2].map((i) => spike(0.06, 0.025, furDark, { pos: [0.06 - i * 0.03, 0.12, (i - 1) * 0.03], rot: [(i - 1) * 25, 0, -20], curve: 0.6 })),
    // óculos escuros na testa
    blob([0.03, 0.022, 0.012], black, { pos: [0.12, 0.08, 0.04], rot: [0, 40, -20] }),
    blob([0.03, 0.022, 0.012], black, { pos: [0.12, 0.08, -0.04], rot: [0, -20, -20] }),
    tube([[0.12, 0.085, 0.015], [0.125, 0.09, -0.015]], 0.005, gold, { seg: 4, radial: 4 }),
    // sorrisão com presinha
    tube([[0.1, -0.075, 0.05], [0.14, -0.085, 0.025], [0.155, -0.075, 0.0]], 0.006, mat('skin', 0x1a0a14), { seg: 10, radial: 5 }),
    spike(0.02, 0.007, mat('shell', 0xffffff), { pos: [0.145, -0.082, 0.02], rot: [0, 0, 180] }),
  );
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const e = eye({ r: 0.042, iris: 0xe0a020, irisScale: 0.65, look: [0.4, 0.05], lid: 0.3, lidColor: C.furDark });
    e.position.set(0.1, 0.025, 0.062 * z); e.rotation.y = z > 0 ? 0.6 : -0.2;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
    const earOut: V2[] = [[-0.05, 0], [0.05, 0], [0.06, 0.1], [0.025, 0.2], [0.0, 0.23], [-0.03, 0.16], [-0.06, 0.06]];
    r.add(`ear${s}`,
      slab(earOut, 0.018, fur, { rot: [0, z * 60, 0] }),
      slab(earOut.map(([x, y]) => [x * 0.7, y * 0.8 + 0.015] as V2), 0.008, inner, { pos: [0.014, 0, 0], rot: [0, z * 60, 0] }),
      ring(0.015, 0.004, gold, { pos: [0.03, 0.05, z * 0.02], rot: [0, z * 60, 0] }),
    );
  }
  /* ---------- fones de ouvido ---------- */
  r.add('phones',
    ring(0.16, 0.014, black, { pos: [0, 0.03, 0], rot: [90, 0, 0], arc: 180, scale: [1, 1, 1] }),
    ...[1, -1].flatMap((z) => [
      lathe([[0.001, -0.03], [0.055, -0.03], [0.06, 0.0], [0.05, 0.03], [0.001, 0.03]], black, { pos: [0, 0.0, 0.16 * z], rot: [90, 0, 0] }),
      lathe([[0.001, 0.0], [0.04, 0.0], [0.042, 0.006], [0.001, 0.006]], red, { pos: [0, 0.0, 0.19 * z], rot: [90, 0, 0] }),
    ]),
  );
  r.bones.phones.rotation.z = 0.25;
  /* ---------- braços-asa ---------- */
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.add(`arm${s}_up`, limb(0.18, 0.035, 0.03, furDark), slab([[0, 0], [-0.02, -0.18], [-0.12, -0.14], [-0.1, -0.04]], 0.01, membrane, { pos: [0, 0, z * 0.005] }));
    r.add(`arm${s}_lo`, limb(0.18, 0.03, 0.025, furDark), slab([[0, 0], [0.0, -0.18], [-0.1, -0.22], [-0.16, -0.12], [-0.1, -0.02]], 0.01, membrane, { pos: [0, 0, z * 0.005] }),
      tube([[0, -0.02, z * 0.01], [-0.08, -0.12, z * 0.01], [-0.14, -0.13, z * 0.01]], 0.006, mat('skin', 0x3a2440), { seg: 8, radial: 4 }));
    r.add(`hand${s}`, blob([0.03, 0.025, 0.025], skin, { pos: [0.01, -0.02, 0] }), spike(0.035, 0.008, mat('shell', 0xe8dcc8), { pos: [0.02, 0.0, 0], rot: [0, 0, -30], curve: -0.3 }));
    r.add(`leg${s}`, limb(0.12, 0.03, 0.025, furDark), blob([0.04, 0.015, 0.025], skin, { pos: [0.02, -0.14, 0] }));
  }
  /* ---------- caixote com toca-discos de coco e mixer ---------- */
  r.add('deck',
    roundBox([0.36, 0.38, 0.7], 0.02, crate, { pos: [0, 0.19, 0] }),
    ...[0.08, 0.3].map((y) => roundBox([0.37, 0.03, 0.71], 0.01, mat('wood', 0x7a4a24), { pos: [0, y, 0] })),
    roundBox([0.03, 0.38, 0.03], 0.01, mat('wood', 0x7a4a24), { pos: [0.17, 0.19, 0.34] }),
    roundBox([0.03, 0.38, 0.03], 0.01, mat('wood', 0x7a4a24), { pos: [0.17, 0.19, -0.34] }),
    // caixa de som de cabaça na frente
    lathe([[0.001, -0.07], [0.06, -0.06], [0.075, 0.0], [0.06, 0.06], [0.001, 0.07]], mat('gourd', 0xc8a040), { pos: [0.19, 0.19, 0], rot: [0, 0, 90] }),
    ring(0.04, 0.008, black, { pos: [0.255, 0.19, 0], rot: [0, 90, 0] }),
    // mixer
    roundBox([0.18, 0.04, 0.12], 0.012, mat('plastic', 0x2a2a30), { pos: [0.0, 0.4, 0] }),
    ...[[0.04, 0.04, 0x40ff80], [0.04, -0.04, 0xff4060], [-0.04, 0.04, 0x40c0ff], [-0.04, -0.04, 0xffd040]].map(([x, z, c]) => blob([0.012, 0.008, 0.012], mat('glow', c), { pos: [x, 0.425, z] })),
    // cascas de coco (bases dos pratos)
    ...[0.19, -0.19].map((z) => lathe([[0.001, -0.05], [0.09, -0.04], [0.13, 0.0], [0.135, 0.02], [0.125, 0.02]], coco, { pos: [0, 0.405, z] })),
    ...[0.19, -0.19].map((z) => lathe([[0.125, 0.02], [0.12, 0.01], [0.001, 0.01]], cocoIn, { pos: [0, 0.405, z] })),
    // braço da agulha
    tube([[0.1, 0.44, 0.27], [0.06, 0.45, 0.22], [0.04, 0.44, 0.2]], 0.006, gold, { seg: 8, radial: 4 }),
  );
  for (const d of ['discR', 'discL']) {
    r.add(d,
      lathe([[0.001, 0], [0.105, 0], [0.105, 0.012], [0.001, 0.012]], black, {}),
      ...[0.08, 0.06].map((rr) => ring(rr, 0.002, mat('plastic', 0x34343a), { pos: [0, 0.013, 0], rot: [90, 0, 0] })),
      lathe([[0.001, 0.0], [0.035, 0.0], [0.035, 0.015], [0.001, 0.015]], mat('paint', d === 'discR' ? 0xf0c020 : 0x30b0e0), {}),
      blob([0.012, 0.006, 0.006], mat('paint', 0xffffff), { pos: [0.02, 0.016, 0] }),
    );
  }
  r.add('knob', blob([0.015, 0.015, 0.015], mat('plastic', 0xf0f0f0), { pos: [0.0, 0.03, 0.0] }));
  void k; void ry; void rx;
  return r;
}

/* ---------------- animações ---------------- */
const spin = (turns: number) => ({ discR: [ry(0, 0), ry(1, -360 * turns, 'linear')], discL: [ry(0, 0), ry(1, -360 * turns, 'linear')] });

const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    ...spin(1),
    body: waveP([0, 0.006, 0], 1),
    head: wave([0, 0, 4], 1, 0.25),
    earR: wave([10, 0, 0], 1, 0.4), earL: wave([-10, 0, 0], 1, 0.4),
    armR_up: wave([0, 0, 3], 1), armL_up: wave([0, 0, 3], 1, 0.5),
    lidR: blink(0.6, 60), lidL: blink(0.6, 60),
  },
};

const falar: Anim = {
  // "E aí, galera da caverna!" — aponta com a asa e fala gingando
  frames: 16, loop: true,
  keys: {
    ...spin(0.6),
    jaw: [rz(0, 0), rz(0.12, -22), rz(0.25, -5), rz(0.37, -18), rz(0.5, 0), rz(0.62, -24), rz(0.75, -4), rz(0.87, -16), rz(1, 0)],
    head: wave([0, 0, 6], 2, 0, [0, 0, 6]),
    armR_up: wave([0, 0, 15], 1, 0, [0, 0, 70]), armR_lo: wave([0, 0, 15], 1, 0.2, [0, 0, -30]),
    chest: wave([0, 0, 4], 2, 0.2),
    lidR: blink(0.45, 60), lidL: blink(0.45, 60),
  },
};

const tocar: Anim = {
  // discotecando: cabeça no tempo (2 batidas), arranha o disco direito, segura o fone com a esquerda
  frames: 24, loop: true,
  keys: {
    discL: [ry(0, 0), ry(1, -720, 'linear')],
    discR: [ry(0, 0), ry(0.2, -60), ry(0.3, 20), ry(0.45, -90), ry(0.55, -30), ry(0.7, -150), ry(0.8, -100), ry(1, -360)],
    armR_up: [rz(0, 0), rz(0.2, 6), rz(0.3, -6), rz(0.45, 8), rz(0.55, -6), rz(0.7, 8), rz(0.8, -6), rz(1, 0)],
    handR: [rz(0, 0), rz(0.2, 14), rz(0.3, -14), rz(0.45, 16), rz(0.55, -12), rz(0.7, 14), rz(0.8, -12), rz(1, 0)],
    armL_up: [rz(0, 120), rz(1, 120)], armL_lo: [rz(0, 70), rz(1, 70)],
    head: [rz(0, 0), rz(0.12, -14, 'out'), rz(0.25, 4), rz(0.5, 0), rz(0.62, -14, 'out'), rz(0.75, 4), rz(1, 0)],
    body: [pk(0, [0, 0, 0]), pk(0.12, [0, -0.02, 0], 'out'), pk(0.25, [0, 0.01, 0]), pk(0.5, [0, 0, 0]), pk(0.62, [0, -0.02, 0], 'out'), pk(0.75, [0, 0.01, 0]), pk(1, [0, 0, 0])],
    chest: wave([0, 8, 0], 1, 0),
    earR: wave([16, 0, 0], 2, 0.2), earL: wave([-16, 0, 0], 2, 0.2),
    jaw: [rz(0, 0), rz(0.12, -10), rz(0.3, 0), rz(0.62, -10), rz(0.8, 0), rz(1, 0)],
    lidR: [rx(0, 30), rx(1, 30)], lidL: [rx(0, 30), rx(1, 30)],
    knob: [rz(0, 0), rz(0.5, 40), rz(1, 0)],
    legR: [rz(0, 0), rz(0.12, 10), rz(0.25, 0), rz(1, 0)], legL: [rz(0, 0), rz(0.62, 10), rz(0.75, 0), rz(1, 0)],
  },
};

export const morcegoDj: ModelDef = {
  id: 'morcego-dj',
  kind: 'npc',
  build,
  anims: { idle, falar, tocar },
  cell: [240, 200],
  pivot: [110, 186],
  height: 200 / 104,
  presets: ['caverna', 'neutro'],
};
void sk; void pull; void ([] as V3[]);
