/**
 * PREGUIÇA — preguiça gigante (~2.5 u) que dorme pendurada num galho e serve de ponte (gag_preguica).
 * Pelagem desgrenhada com tufos de algas verdes, máscara escura nos olhos, sorriso permanente,
 * garras longas enganchadas no galho e uma bolsinha de palha cheia de castanhas.
 * Pivot = ponto de agarre, no topo do galho.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, eye, mat, taper, pull, bulge, wobble, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim, Key } from '../../render/anim';
import { k, rz, rx, ry, pk, sk, blink, wave, waveP, waveS, show, HIDDEN, SHOW } from '../../anims/bosses/kit';

const C = { fur: 0x9a8a6c, furDark: 0x6e6048, furLight: 0xd8ccae, algae: 0x6a8a3e, algaeDark: 0x4a6a2a, mask: 0x3a2c20, claw: 0x3a3028, bark: 0x6a4a2e };

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 2.5 });
  const furDark = mat('fur', C.furDark, { repeat: 2.5 });
  const furLight = mat('shortFur', C.furLight, { repeat: 2 });
  const algae = mat('fur', C.algae, { repeat: 3 });
  const algaeDark = mat('fur', C.algaeDark, { repeat: 3 });
  const mask = mat('shortFur', C.mask);
  const claw = mat('shell', C.claw, { rough: 0.35, repeat: 3 });
  const bark = mat('bark', C.bark);
  const leaf = mat('leaf', 0x3e8a32);
  const nose = mat('skin', 0x2a1e18, { rough: 0.3 });

  /* ---------- esqueleto ---------- */
  r.bone('branch', 'root', [0, -0.12, 0]);
  r.bone('body', 'root', [-0.6, -0.08, 0]);
  r.bone('torso', 'body', [0.65, -0.94, 0]);
  r.bone('neck', 'torso', [0.62, -0.02, 0], [0, 0, 10]);
  r.bone('head', 'neck', [0.2, 0.02, 0], [0, -38, 0]);
  r.bones.head.scale.setScalar(1.3);
  r.bone('jaw', 'head', [0.16, -0.1, 0]);
  r.bone('bubble', 'head', [0.3, -0.03, 0.06]);
  r.bone('armR_up', 'torso', [0.48, 0.12, 0.3], [0, 0, 172]);
  r.bone('armR_lo', 'armR_up', [0, -0.42, 0], [0, 0, -8]);
  r.bone('handR', 'armR_lo', [0, -0.36, 0], [0, 0, -164]);
  r.bone('armL_up', 'torso', [0.48, 0.12, -0.3], [0, 0, 176]);
  r.bone('armL_lo', 'armL_up', [0, -0.42, 0], [0, 0, -4]);
  r.bone('handL', 'armL_lo', [0, -0.36, 0], [0, 0, -172]);
  r.bone('legR', 'torso', [-0.5, 0.1, 0.26], [0, 0, 172]);
  r.bone('footR', 'legR', [0, -0.62, 0], [0, 0, -172]);
  r.bone('legL', 'torso', [-0.5, 0.1, -0.26], [0, 0, 176]);
  r.bone('footL', 'legL', [0, -0.62, 0], [0, 0, -176]);
  r.bone('pouch', 'torso', [0.1, -0.32, 0.36]);
  r.bone('nuts', 'pouch', [0, -0.12, 0.05]);
  r.anchor('head', 'head', [0, 0.32, 0]);
  r.anchor('hand', 'handR', [0.05, -0.05, 0]);
  r.bones.bubble.scale.setScalar(HIDDEN);
  r.bones.nuts.scale.setScalar(HIDDEN);

  /* ---------- galho ---------- */
  r.add('branch',
    tube([[-1.3, 0.02, 0], [-0.6, 0.0, 0.02], [0.2, 0.01, -0.02], [0.9, -0.01, 0.0], [1.5, 0.03, 0.02]], (t) => 0.12 - t * 0.03, bark, { seg: 40, radial: 16 }),
    tube([[1.0, 0.0, 0], [1.25, 0.18, -0.08], [1.4, 0.36, -0.1]], (t) => 0.05 * (1 - t) + 0.01, bark, { seg: 12 }),
    slab([[0, 0], [0.12, 0.08], [0.28, 0.02], [0.12, -0.06]], 0.015, leaf, { pos: [1.38, 0.36, -0.1], rot: [20, 0, 30] }),
    slab([[0, 0], [0.12, 0.08], [0.26, 0.0], [0.12, -0.06]], 0.015, leaf, { pos: [-1.1, 0.06, 0.1], rot: [70, 0, 150] }),
    // musgo pendurado
    tube([[-0.9, -0.08, 0.06], [-0.92, -0.25, 0.08], [-0.88, -0.4, 0.07]], (t) => 0.03 * (1 - t) + 0.005, algaeDark, { seg: 10, radial: 6 }),
  );

  /* ---------- corpo desgrenhado (barriga para cima, costas para baixo) ---------- */
  r.add('torso',
    blob([0.72, 0.4, 0.42], fur, { deform: [pull([0, -0.35, 0], 0.5, [0, -0.08, 0]), bulge([-0.3, -0.1, 0], 0.4, 0.05), wobble(0.025, 6)] }),
    blob([0.5, 0.2, 0.3], furLight, { pos: [0.05, 0.22, 0], deform: [wobble(0.012, 7)] }),
    // tufos pendurados (pelo cai para baixo) com algas
    ...[-0.6, -0.45, -0.3, -0.15, 0.0, 0.15, 0.3, 0.45, 0.58].flatMap((x, i) => [
      spike(0.17 + (i % 3) * 0.05, 0.11, i === 3 || i === 6 ? algae : i % 2 ? furDark : fur, { pos: [x, -0.28, 0.2], rot: [-25, 0, 180 + (i % 2 ? 12 : -10)], curve: 0.3 }),
      spike(0.15 + (i % 2) * 0.06, 0.11, i === 4 ? algaeDark : i % 2 ? fur : furDark, { pos: [x + 0.06, -0.32, -0.12], rot: [12, 0, 180 - (i % 2 ? 8 : -12)], curve: -0.25 }),
    ]),
    // manchas de alga no pelo
    blob([0.24, 0.12, 0.06], algae, { pos: [-0.25, -0.1, 0.37], rot: [-20, 0, 0], deform: [wobble(0.03, 10)] }),
    blob([0.18, 0.1, 0.06], algae, { pos: [0.3, -0.16, 0.35], rot: [-30, 0, 0], deform: [wobble(0.03, 10)] }),
    blob([0.2, 0.1, 0.1], algaeDark, { pos: [-0.45, -0.2, -0.28], deform: [wobble(0.03, 10)] }),
    // alça da bolsinha
    tube([[0.45, 0.25, 0.3], [0.25, 0.0, 0.4], [0.1, -0.3, 0.38]], 0.02, mat('cloth', 0xc8a860), { seg: 12, radial: 6 }),
  );
  r.add('pouch',
    blob([0.14, 0.12, 0.06], mat('cloth', 0xc8a860, { repeat: 5 }), { deform: [pull([0, -0.1, 0], 0.12, [0, -0.03, 0])] }),
    blob([0.04, 0.035, 0.035], mat('wood', 0x7a4a24), { pos: [0.02, 0.1, 0.02] }),
    blob([0.04, 0.035, 0.035], mat('wood', 0x8a5a2a), { pos: [-0.05, 0.1, -0.01] }),
  );
  r.add('nuts', ...[[0, 0, 0], [0.05, -0.2, 0.02], [-0.04, -0.42, 0.0]].map((p) => blob([0.05, 0.04, 0.04], mat('wood', 0x7a4a24), { pos: p as V3, rot: [0, 0, 30] })));

  /* ---------- pescoço e cabeça ---------- */
  r.add('neck', blob([0.22, 0.2, 0.22], fur, { pos: [0.06, 0, 0], deform: [wobble(0.015, 7)] }));
  r.add('head',
    blob([0.26, 0.24, 0.27], fur, { pos: [0, 0.02, 0], deform: [wobble(0.012, 8), pull([0, 0.2, 0], 0.18, [-0.02, 0.05, 0])] }),
    // máscara facial clara com as listras escuras dos olhos
    blob([0.17, 0.18, 0.2], furLight, { pos: [0.13, 0.0, 0], deform: [pull([0.1, -0.1, 0], 0.15, [0.03, -0.02, 0])] }),
    slab([[-0.02, 0.02], [0.12, 0.02], [0.16, -0.04], [0.06, -0.05]], 0.03, mask, { pos: [0.24, 0.05, 0.06], rot: [0, -50, -12] }),
    slab([[-0.02, 0.02], [0.12, 0.02], [0.16, -0.04], [0.06, -0.05]], 0.03, mask, { pos: [0.24, 0.05, -0.06], rot: [0, 50, -12] }),
    blob([0.05, 0.04, 0.06], nose, { pos: [0.3, -0.04, 0] }),
    // franja desgrenhada
    ...[0, 1, 2, 3].map((i) => spike(0.14, 0.05, i % 2 ? furDark : fur, { pos: [0.1 - i * 0.05, 0.22, -0.1 + i * 0.07], rot: [0, 0, -20 - i * 12], curve: 0.5 })),
    spike(0.1, 0.035, algae, { pos: [0.0, 0.24, 0.02], rot: [0, 0, 10], curve: 0.6 }),
  );
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const e = eye({ r: 0.05, iris: 0x4a3018, irisScale: 0.7, look: [0.3, 0.1], lid: 0.45, lidColor: C.mask });
    e.position.set(0.27, 0.05, 0.075 * z);
    e.rotation.y = z > 0 ? 0.25 : -0.25;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  r.add('jaw',
    blob([0.1, 0.045, 0.11], furLight, { pos: [0.06, -0.02, 0] }),
    blob([0.07, 0.02, 0.08], mat('skin', 0x7a3030, { rough: 0.4 }), { pos: [0.08, 0.02, 0] }),
  );
  // sorriso largo (fica na cabeça, a mandíbula abre por baixo)
  r.add('head', tube([[0.26, -0.06, 0.12], [0.31, -0.11, 0.05], [0.32, -0.12, 0], [0.31, -0.11, -0.05], [0.26, -0.06, -0.12]], 0.011, mat('skin', 0x2a1810), { seg: 20, radial: 6 }));
  r.add('bubble', blob([0.08, 0.08, 0.08], mat('glass', 0xd8f4ff, { opacity: 0.5 }), { castShadow: false }));

  /* ---------- membros longos e garras enganchadas ---------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`arm${s}_up`, limb(0.42, 0.11, 0.09, fur, { deform: [wobble(0.012, 9)] }), spike(0.18, 0.06, furDark, { pos: [0.05, -0.2, 0.04 * zs], rot: [0, 0, 150], curve: 0.3 }));
    r.add(`arm${s}_lo`, limb(0.36, 0.09, 0.075, fur, { deform: [wobble(0.01, 9)] }), spike(0.16, 0.05, algae, { pos: [0.05, -0.18, 0], rot: [0, 0, 160], curve: 0.3 }));
    r.add(`hand${s}`,
      blob([0.08, 0.07, 0.08], furDark, { pos: [0, 0.03, 0] }),
      ...[-0.045, 0, 0.045].map((z) => tube([[0.0, 0.05, z], [0.05, 0.17, z], [0.16, 0.2, z], [0.22, 0.12, z], [0.2, 0.04, z]], (t) => 0.024 * (1 - t * 0.8), claw, { seg: 16, radial: 8 })),
    );
    r.add(`leg${s}`, limb(0.62, 0.13, 0.09, fur, { deform: [wobble(0.012, 9)] }), spike(0.2, 0.06, furDark, { pos: [-0.05, -0.3, 0], rot: [0, 0, 200], curve: 0.3 }));
    r.add(`foot${s}`,
      blob([0.08, 0.07, 0.08], furDark, { pos: [0, 0.03, 0] }),
      ...[-0.035, 0.035].map((z) => tube([[0.0, 0.05, z], [-0.04, 0.16, z], [-0.15, 0.2, z], [-0.21, 0.12, z], [-0.19, 0.05, z]], (t) => 0.022 * (1 - t * 0.8), claw, { seg: 16, radial: 8 })),
    );
  }
  void ry; void lathe; void taper;
  return r;
}

/* ---------------- animações ---------------- */
type KeyMap = Record<string, Key[]>;
const lids = (base: number, t?: number): KeyMap => ({
  lidR: t === undefined ? [rx(0, base), rx(1, base)] : [rx(0, base), rx(t, base), rx(t + 0.04, 60), rx(t + 0.1, base), rx(1, base)],
  lidL: t === undefined ? [rx(0, base), rx(1, base)] : [rx(0, base), rx(t, base), rx(t + 0.04, 60), rx(t + 0.1, base), rx(1, base)],
});
const sway = (amp: number, cycles = 1): KeyMap => ({ body: wave([0, 0, amp], cycles, 0), torso: waveS([0.015, 0.03, 0.015], cycles * 2, 0.25) });

const idle: Anim = {
  frames: 32, loop: true,
  keys: {
    ...sway(2.5),
    neck: wave([0, 0, 4], 1, 0.3),
    head: wave([0, 6, 3], 1, 0.5),
    jaw: [rz(0, 0), rz(1, 0)],
    ...lids(10, 0.6),
  },
};

const falar: Anim = {
  // fala devagaaar, inclinando a cabeça
  frames: 24, loop: true,
  keys: {
    ...sway(2),
    head: wave([0, 8, 6], 1, 0.2, [0, 0, 6]),
    jaw: [rz(0, 0), rz(0.15, -18), rz(0.3, -4), rz(0.5, -22), rz(0.65, -6), rz(0.8, -16), rz(1, 0)],
    neck: wave([0, 0, 4], 1, 0.4),
    ...lids(0, 0.85),
  },
};

const dormir: Anim = {
  // ronca: respiração lenta e bolha de ranho enchendo e estourando
  frames: 36, loop: true,
  keys: {
    body: wave([0, 0, 1.5], 1, 0),
    torso: [sk(0, 1), sk(0.5, [1.03, 1.08, 1.03]), sk(1, 1)],
    neck: [rz(0, -22), rz(1, -22)],
    head: [k(0, [0, 0, 18]), k(0.5, [0, 0, 22]), k(1, [0, 0, 18])],
    jaw: [rz(0, -2), rz(0.5, -8), rz(1, -2)],
    lidR: [rx(0, 52), rx(1, 52)], lidL: [rx(0, 52), rx(1, 52)],
    bubble: [sk(0, SHOW * 0.2), sk(0.5, SHOW * 1.4), sk(0.8, SHOW * 0.5), sk(1, SHOW * 0.2)],
  },
};

const acordar: Anim = {
  // abre um olho, depois o outro, estica o pescoço e sorri
  frames: 24, loop: false,
  keys: {
    neck: [rz(0, -22), rz(0.5, -10), rz(1, 0)],
    head: [k(0, [0, 0, 18]), k(0.5, [0, 0, 8]), k(0.75, [0, 10, -6]), k(1, [0, 0, 0])],
    lidR: [rx(0, 52), rx(0.2, 52), rx(0.35, 25), rx(0.45, 40), rx(0.7, 10), rx(1, 10)],
    lidL: [rx(0, 52), rx(0.4, 52), rx(0.55, 30), rx(0.7, 10), rx(1, 10)],
    bubble: [sk(0, SHOW * 1.2), sk(0.08, SHOW * 1.6), sk(0.1, 1, 'step'), sk(1, 1)],
    torso: [sk(0, 1), sk(0.6, [1.04, 1.06, 1.04]), sk(1, 1)],
    jaw: [rz(0, 0), rz(0.7, 0), rz(0.8, -6), rz(1, 0)],
  },
};

const bocejar: Anim = {
  // bocejo enorme e demorado, solta uma mão do galho para tapar a boca
  frames: 32, loop: false,
  keys: {
    jaw: [rz(0, 0), rz(0.15, -10), rz(0.35, -42, 'out'), rz(0.65, -44), rz(0.8, -8), rz(1, 0)],
    head: [rz(0, 0), rz(0.35, 22), rz(0.65, 24), rz(0.85, 0), rz(1, 0)],
    neck: [rz(0, 0), rz(0.35, 10), rz(0.65, 12), rz(1, 0)],
    lidR: [rx(0, 10), rx(0.3, 62), rx(0.7, 62), rx(0.9, 20), rx(1, 10)],
    lidL: [rx(0, 10), rx(0.3, 62), rx(0.7, 62), rx(0.9, 20), rx(1, 10)],
    armR_up: [rz(0, 0), rz(0.3, 0), rz(0.5, -110), rz(0.7, -110), rz(0.9, 0), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.5, -40), rz(0.7, -40), rz(1, 0)],
    handR: [rz(0, 0), rz(0.4, 120), rz(0.8, 120), rz(1, 0)],
    torso: [sk(0, 1), sk(0.4, [1.04, 1.1, 1.04]), sk(0.7, [1.04, 1.1, 1.04]), sk(1, 1)],
    body: [rz(0, 0), rz(0.5, -3), rz(1, 0)],
  },
};

const abracar: Anim = {
  // solta a frente do galho, desce de cabeça para baixo e abraça (o herói é desenhado no meio); castanhas caem do bolso
  frames: 24, loop: true,
  keys: {
    body: [rz(0, -36), rz(0.5, -40), rz(1, -36)],
    neck: wave([0, 0, 6], 1, 0, [0, 0, 60]),
    head: wave([0, 10, 0], 1, 0.25, [0, 20, 0]),
    armR_up: wave([0, 0, 8], 2, 0, [0, 0, -150]),
    armL_up: wave([0, 0, 8], 2, 0, [0, 0, -150]),
    armR_lo: wave([0, 0, 6], 2, 0.1, [0, 0, 80]),
    armL_lo: wave([0, 0, 6], 2, 0.1, [0, 0, 80]),
    handR: [rz(0, 150), rz(1, 150)], handL: [rz(0, 150), rz(1, 150)],
    torso: waveS([0.04, -0.03, 0.04], 2),
    jaw: [rz(0, -10), rz(1, -10)],
    lidR: [rx(0, 50), rx(1, 50)], lidL: [rx(0, 50), rx(1, 50)],
    nuts: [...show([[0.0, 1]], 0), pk(0, [0, 0, 0], 'step'), pk(0.999, [0.4, -0.9, 0], 'in')],
  },
};

export const preguica: ModelDef = {
  id: 'preguica',
  kind: 'npc',
  build,
  anims: { idle, falar, dormir, acordar, bocejar, abracar },
  cell: [420, 320],
  pivot: [170, 52],
  height: 320 / 104,
  presets: ['selva', 'neutro'],
};
void pk; void waveP; void ry;
