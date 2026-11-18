/**
 * QUATI — mascate da selva. Anda em pé com uma mochila-armação gigante de mercadorias
 * (panelas, esteira enrolada, lamparina, cabaça, garrafinhas, saco de castanhas), chapéu de palha
 * com pena, colete de retalhos, focinho comprido e arrebitado e cauda anelada sempre em pé.
 * Sorriso de vendedor e olhar de quem vai te fazer uma "promoção imperdível".
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, roundBox, eye, mat, taper, pull, bulge, wobble, flattenBelow, THREE, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim } from '../../render/anim';
import { k, rz, rx, ry, pk, sk, blink, wave, waveP, show, HIDDEN } from '../../anims/bosses/kit';

const C = { fur: 0xa8683a, furDark: 0x5a3820, belly: 0xe2c08e, face: 0x3a2618, white: 0xf2ead8, nose: 0x1a1212 };

/** Comprimento dos quatro segmentos da cauda (da raiz à ponta). */
const TAIL = [0.26, 0.2, 0.3, 0.3];

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 3 });
  const furDark = mat('fur', C.furDark, { repeat: 3 });
  const belly = mat('shortFur', C.belly, { repeat: 3 });
  const face = mat('shortFur', C.face, { repeat: 3 });
  const white = mat('shortFur', C.white, { repeat: 3 });
  const straw = mat('cloth', 0xdcbc6a, { repeat: 5 });
  const vest = mat('cloth', 0x2a7a8a, { repeat: 3 });
  const patch = mat('cloth', 0xd8502a, { repeat: 3 });
  const wood = mat('wood', 0x8a5a30);
  const rope = mat('cloth', 0xc8a868, { repeat: 6 });

  /* ---------- esqueleto ---------- */
  r.bone('hips', 'root', [0, 0.36, 0]);
  r.bone('spine', 'hips', [0, 0.12, 0], [0, 0, -6]);
  r.bone('chest', 'spine', [0.02, 0.2, 0]);
  r.bone('neck', 'chest', [0.06, 0.16, 0], [0, 0, -6]);
  r.bone('head', 'neck', [0.04, 0.1, 0]);
  r.bone('snout', 'head', [0.1, -0.02, 0], [0, 0, -8]);
  r.bone('jaw', 'head', [0.1, -0.07, 0]);
  r.bone('earL', 'head', [-0.04, 0.1, -0.08]);
  r.bone('earR', 'head', [-0.04, 0.1, 0.08]);
  r.bone('hat', 'head', [-0.02, 0.1, 0], [0, 0, 10]);
  r.bone('pack', 'chest', [-0.2, 0.0, 0]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`arm${s}_up`, 'chest', [0.04, 0.1, 0.15 * z], [z * 6, 0, 14]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.2, 0], [0, 0, 40]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.18, 0]);
    r.bone(`leg${s}_up`, 'hips', [0.02, -0.04, 0.1 * z], [0, 0, 8]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.17, 0], [0, 0, -16]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.15, 0], [0, 0, 8]);
  }
  r.bone('item', 'handR', [0.06, -0.06, 0.04]);
  // cauda erguida (marca do quati): sai para trás por baixo da mochila e sobe reta atrás dela, como um mastro anelado
  r.bone('tail1', 'hips', [-0.13, 0.0, 0], [0, 0, 10]);
  r.bone('tail2', 'tail1', [-TAIL[0], 0, 0], [0, 0, -62]);
  r.bone('tail3', 'tail2', [-TAIL[1], 0, 0], [0, 0, -40]);
  r.bone('tail4', 'tail3', [-TAIL[2], 0, 0], [0, 0, -8]);
  r.anchor('hand', 'handR', [0.03, -0.05, 0.02]);
  r.anchor('head', 'hat', [0, 0.12, 0]);
  r.bones.item.scale.setScalar(HIDDEN);

  /* ---------- corpo e colete ---------- */
  r.add('hips', blob([0.16, 0.13, 0.14], fur, { pos: [-0.01, 0.03, 0], deform: [wobble(0.005)] }));
  r.add('spine',
    blob([0.15, 0.15, 0.14], fur, { pos: [0, 0.07, 0] }),
    blob([0.1, 0.13, 0.11], belly, { pos: [0.07, 0.05, 0] }),
  );
  r.add('chest',
    blob([0.15, 0.14, 0.15], vest, { pos: [0, 0.04, 0], deform: [wobble(0.006, 8)] }),
    blob([0.06, 0.12, 0.08], belly, { pos: [0.12, 0.04, 0] }),
    // remendos e botões do colete
    slab([[-0.04, -0.03], [0.04, -0.03], [0.04, 0.03], [-0.04, 0.03]], 0.008, patch, { pos: [-0.02, 0.0, 0.15], rot: [0, 0, 12], smooth: false, bevel: 0.004 }),
    ...[0.08, 0.02, -0.04].map((y) => blob([0.012, 0.012, 0.008], mat('wood', 0xf0d080), { pos: [0.135, y, 0.04] })),
    // alças da mochila
    tube([[0.1, 0.12, 0.1], [0.14, 0.0, 0.11], [0.06, -0.12, 0.12], [-0.12, -0.1, 0.12]], 0.015, mat('leather', 0x5a3418), { seg: 14, radial: 6 }),
    tube([[0.1, 0.12, -0.1], [0.14, 0.0, -0.11], [0.06, -0.12, -0.12], [-0.12, -0.1, -0.12]], 0.015, mat('leather', 0x5a3418), { seg: 14, radial: 6 }),
  );
  /* ---------- cabeça: focinho comprido arrebitado, máscara de quati ---------- */
  r.add('neck', blob([0.08, 0.08, 0.08], fur, {}));
  r.add('head',
    blob([0.12, 0.11, 0.11], fur, { pos: [0, 0.01, 0], deform: [pull([0.1, -0.02, 0], 0.1, [0.03, -0.01, 0])] }),
    blob([0.07, 0.06, 0.08], face, { pos: [0.06, 0.02, 0] }),
    // manchas brancas acima dos olhos e nas bochechas
    blob([0.03, 0.015, 0.025], white, { pos: [0.09, 0.07, 0.055], rot: [0, 0, -10] }),
    blob([0.03, 0.015, 0.025], white, { pos: [0.09, 0.07, -0.055], rot: [0, 0, -10] }),
    blob([0.04, 0.03, 0.03], white, { pos: [0.08, -0.04, 0.07] }),
    blob([0.04, 0.03, 0.03], white, { pos: [0.08, -0.04, -0.07] }),
  );
  r.add('snout',
    lathe([[0.05, -0.01], [0.045, 0.05], [0.035, 0.11], [0.028, 0.15], [0.001, 0.16]], face, { rot: [0, 0, -90], deform: [pull([0.15, 0, 0], 0.06, [0, 0.025, 0])] }),
    blob([0.025, 0.02, 0.026], mat('skin', C.nose, { rough: 0.25 }), { pos: [0.16, 0.022, 0], rot: [0, 0, 30] }),
    blob([0.03, 0.012, 0.04], white, { pos: [0.04, -0.03, 0] }),
  );
  r.add('jaw',
    blob([0.06, 0.018, 0.035], face, { pos: [0.05, -0.005, 0] }),
    blob([0.04, 0.008, 0.025], mat('skin', 0x8a2a3a, { rough: 0.35 }), { pos: [0.05, 0.01, 0] }),
  );
  // sorriso de vendedor
  r.add('head', tube([[0.1, -0.04, 0.045], [0.13, -0.055, 0.03], [0.15, -0.05, 0.01]], 0.006, mat('skin', 0x120a08), { seg: 10, radial: 5 }));
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const e = eye({ r: 0.032, iris: 0x2a1a0e, irisScale: 0.72, look: [0.5, 0.05], lid: 0.32, lidColor: C.face, angry: z * -4 });
    e.position.set(0.1, 0.035, 0.055 * z); e.rotation.y = z > 0 ? 0.55 : -0.15;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
    r.add(`ear${s}`,
      blob([0.035, 0.035, 0.012], fur, { rot: [z * 30, 0, 0] }),
      blob([0.022, 0.022, 0.006], white, { pos: [0.008, 0, z * 0.006], rot: [z * 30, 0, 0] }),
    );
  }
  /* ---------- chapéu de palha com pena ---------- */
  r.add('hat',
    lathe([[0.001, 0.09], [0.07, 0.09], [0.09, 0.06], [0.085, 0.0], [0.17, -0.005], [0.18, -0.02], [0.001, 0.0]], straw, { deform: [wobble(0.004, 12)] }),
    lathe([[0.087, 0.0], [0.09, 0.02], [0.088, 0.035], [0.085, 0.035]], mat('cloth', 0xc02a2a), {}),
    tube([[-0.05, 0.03, 0.07], [-0.1, 0.12, 0.08], [-0.12, 0.2, 0.06]], (t) => 0.012 * (1 - t) + 0.003, mat('cloth', 0x2a8ad8), { seg: 12, radial: 6 }),
    slab([[0, 0], [0.02, 0.04], [0.0, 0.14], [-0.02, 0.04]], 0.006, mat('cloth', 0x3ab0e8), { pos: [-0.06, 0.05, 0.075], rot: [0, 0, 30] }),
  );
  /* ---------- mochila-armação de mercadorias ---------- */
  const pot = mat('metal', 0x6a6a6a, { metal: 0.5, rough: 0.4 });
  const copper = mat('metal', 0xc0743a, { metal: 0.5, rough: 0.3 });
  r.add('pack',
    // armação de madeira
    tube([[0, -0.2, 0.13], [0, 0.42, 0.13]], 0.015, wood, { seg: 4, radial: 6 }),
    tube([[0, -0.2, -0.13], [0, 0.42, -0.13]], 0.015, wood, { seg: 4, radial: 6 }),
    ...[-0.15, 0.1, 0.36].map((y) => tube([[0, y, 0.14], [0, y, -0.14]], 0.012, wood, { seg: 4, radial: 6 })),
    // saco de lona principal
    blob([0.14, 0.2, 0.15], mat('cloth', 0xb89a62, { repeat: 4 }), { pos: [-0.12, 0.06, 0], deform: [wobble(0.01, 7), flattenBelow(-0.15, 0.6)] }),
    tube([[-0.02, 0.2, 0.15], [-0.15, 0.24, 0.16], [-0.25, 0.12, 0.15]], 0.01, rope, { seg: 10, radial: 5 }),
    // esteira enrolada em cima
    tube([[-0.1, 0.32, 0.2], [-0.1, 0.32, -0.2]], 0.07, mat('cloth', 0xd8b050, { repeat: 6 }), { seg: 6, radial: 16 }),
    ring(0.072, 0.008, mat('cloth', 0xc02a2a), { pos: [-0.1, 0.32, 0.1], rot: [0, 0, 0] }),
    ring(0.072, 0.008, mat('cloth', 0xc02a2a), { pos: [-0.1, 0.32, -0.1], rot: [0, 0, 0] }),
    // panelas penduradas
    lathe([[0.001, 0], [0.07, 0.0], [0.08, 0.06], [0.085, 0.07]], pot, { pos: [-0.2, -0.05, 0.17], rot: [70, 0, 0] }),
    lathe([[0.001, 0], [0.05, 0.0], [0.06, 0.05], [0.065, 0.055]], copper, { pos: [-0.27, 0.12, 0.16], rot: [80, 0, 10] }),
    tube([[-0.2, -0.05, 0.25], [-0.2, -0.02, 0.35]], 0.01, wood, { seg: 4, radial: 6 }),
    // lamparina pendurada
    tube([[-0.02, 0.4, 0.0], [0.05, 0.47, 0], [0.1, 0.44, 0]], 0.006, pot, { seg: 8, radial: 4 }),
    lathe([[0.001, 0], [0.03, 0.0], [0.035, 0.05], [0.025, 0.07], [0.001, 0.075]], mat('glass', 0xfff0a0, { opacity: 0.6 }), { pos: [0.1, 0.34, 0] }),
    blob([0.015, 0.02, 0.015], mat('glow', 0xffc040), { pos: [0.1, 0.37, 0] }),
    // cabaça e garrafinhas
    lathe([[0.001, 0], [0.05, 0.02], [0.06, 0.06], [0.04, 0.1], [0.025, 0.13], [0.03, 0.17], [0.001, 0.18]], mat('gourd', 0xc8a040), { pos: [-0.24, 0.24, -0.12], rot: [0, 0, 20] }),
    ...[[0xd84a6a, 0.0], [0x4ad08a, 0.05], [0x4a8ae0, 0.1]].map(([c, dz]) => lathe([[0.001, 0], [0.018, 0], [0.02, 0.04], [0.01, 0.06], [0.01, 0.08], [0.001, 0.08]], mat('glass', c, { opacity: 0.75 }), { pos: [-0.28, -0.08, -0.08 + dz] })),
    // saquinho de castanhas
    blob([0.06, 0.07, 0.06], mat('cloth', 0x8a6a3a, { repeat: 5 }), { pos: [-0.04, -0.18, 0.16], deform: [pull([0, 0.07, 0], 0.04, [0, 0.02, 0])] }),
    ...[[-0.02, -0.12, 0.2], [-0.06, -0.12, 0.19]].map((p) => blob([0.02, 0.016, 0.016], mat('wood', 0x6a3a1a), { pos: p as V3 })),
  );
  /* ---------- braços, pernas e cauda anelada ---------- */
  for (const s of ['L', 'R'] as const) {
    r.add(`arm${s}_up`, limb(0.2, 0.05, 0.04, fur));
    r.add(`arm${s}_lo`, limb(0.18, 0.04, 0.035, fur));
    r.add(`hand${s}`,
      blob([0.04, 0.035, 0.035], furDark, { pos: [0.01, -0.03, 0] }),
      ...[-0.02, 0, 0.02].map((z) => spike(0.03, 0.008, mat('shell', 0x2a2420), { pos: [0.04, -0.05, z], rot: [0, 0, -140] })),
    );
    r.add(`leg${s}_up`, limb(0.17, 0.065, 0.05, fur));
    r.add(`leg${s}_lo`, limb(0.15, 0.045, 0.035, furDark));
    r.add(`foot${s}`, blob([0.07, 0.025, 0.04], furDark, { pos: [0.04, -0.01, 0], deform: [flattenBelow(-0.01, 0.8)] }));
  }
  // cauda grossa e felpuda, com anéis escuros largos alternados (dois por segmento) e ponta escura enrolada
  const tailR = (d: number) => 0.066 - d * 0.03; // raio pela distância (em u) ao longo da cauda
  let dist = 0;
  for (let i = 1; i <= 4; i++) {
    const L = TAIL[i - 1], d0 = dist;
    const parts: THREE.Object3D[] = [tube([[0, 0, 0], [-L * 0.5, 0, 0], [-L, 0, 0]], (t) => tailR(d0 + t * L), fur, { seg: 10, radial: 16 })];
    for (const c of [0.28, 0.78]) {
      const x = -L * c, rr = tailR(d0 + L * c) + 0.006, w = L * 0.13;
      parts.push(lathe([[rr - 0.008, -w], [rr, -w * 0.6], [rr + 0.002, 0], [rr, w * 0.6], [rr - 0.008, w]], furDark, { pos: [x, 0, 0], rot: [0, 0, 90], seg: 20 }));
    }
    r.add(`tail${i}`, ...parts);
    dist += L;
  }
  r.add('tail4',
    blob([0.05, 0.04, 0.04], furDark, { pos: [-TAIL[3] - 0.01, 0, 0] }),
    tube([[-TAIL[3], 0, 0], [-TAIL[3] - 0.05, -0.015, 0], [-TAIL[3] - 0.075, -0.05, 0], [-TAIL[3] - 0.06, -0.08, 0]], (t) => 0.034 - t * 0.02, furDark, { seg: 10, radial: 10 }),
  );
  /* ---------- mercadoria da vez (aparece ao vender) ---------- */
  r.add('item',
    lathe([[0.001, 0], [0.035, 0.0], [0.04, 0.05], [0.02, 0.08], [0.015, 0.11], [0.02, 0.12], [0.001, 0.12]], mat('glass', 0xc060f0, { opacity: 0.7 }), {}),
    blob([0.025, 0.03, 0.025], mat('glow', 0xe090ff), { pos: [0, 0.035, 0] }),
    lathe([[0.017, 0.11], [0.02, 0.13], [0.001, 0.14]], wood, {}),
    ...[0, 1, 2, 3].map((i) => spike(0.05, 0.006, mat('glow', 0xfff0a0), { pos: [0, 0.06, 0], rot: [0, i * 45, 50], castShadow: false })),
  );
  void taper; void bulge;
  return r;
}

/* ---------------- animações ---------------- */
const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    hips: waveP([0, -0.006, 0], 1, 0.25),
    chest: [sk(0, 1), sk(0.5, [1.02, 1.03, 1.02]), sk(1, 1)],
    head: [rz(0, 0), rz(0.3, 6), rz(0.6, -4), rz(1, 0)],
    snout: [rz(0, 0), rz(0.15, 8), rz(0.2, 0), rz(0.25, 8), rz(0.3, 0), rz(1, 0)],
    // esfrega as mãos (negócio à vista)
    armR_up: wave([0, 0, 4], 2, 0, [0, 0, 20]), armL_up: wave([0, 0, 4], 2, 0.5, [0, 0, 20]),
    armR_lo: [rz(0, 50), rz(1, 50)], armL_lo: [rz(0, 50), rz(1, 50)],
    tail1: wave([0, 0, 6], 1), tail2: wave([0, 0, 8], 1, 0.1), tail3: wave([0, 0, 10], 1, 0.2), tail4: wave([0, 0, 12], 1, 0.3),
    pack: wave([0, 0, 2], 1, 0.4),
    earR: wave([0, 0, 10], 1, 0.6), earL: wave([0, 0, 10], 1, 0.6),
    lidR: blink(0.7, 60), lidL: blink(0.7, 60),
  },
};

const falar: Anim = {
  frames: 16, loop: true,
  keys: {
    jaw: [rz(0, 0), rz(0.12, -20), rz(0.25, -4), rz(0.37, -18), rz(0.5, 0), rz(0.62, -22), rz(0.75, -6), rz(0.87, -16), rz(1, 0)],
    head: wave([0, 0, 5], 2, 0, [0, 0, 4]),
    snout: wave([0, 0, 6], 2, 0.2),
    armR_up: wave([0, 0, 20], 1, 0, [0, 0, 50]), armR_lo: wave([0, 0, 20], 1, 0.2, [0, 0, 40]),
    handR: wave([0, 0, 25], 2, 0.4),
    armL_up: [rz(0, 10), rz(1, 10)],
    tail3: wave([0, 0, 10], 2), tail4: wave([0, 0, 14], 2, 0.2),
    lidR: blink(0.45, 60), lidL: blink(0.45, 60),
  },
};

const vender: Anim = {
  // tira um frasco brilhante de trás das costas, apresenta com as duas mãos e pisca o olho
  frames: 32, loop: false,
  keys: {
    armR_up: [rz(0, 0), rz(0.2, -60, 'inOut'), rz(0.3, -60), rz(0.45, 70, 'back'), rz(0.85, 70), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.2, 60), rz(0.45, 30), rz(0.85, 30), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.4, 0), rz(0.5, 60), rz(0.85, 60), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.5, 50), rz(0.85, 50), rz(1, 0)],
    item: [...show([[0.3, 0.9]], 0.01)],
    chest: [rz(0, 0), rz(0.2, 10), rz(0.45, -8), rz(0.85, -8), rz(1, 0)],
    head: [rz(0, 0), rz(0.45, 10), rz(0.6, 6), rz(0.85, 10), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.45, -16), rz(0.55, -6), rz(0.85, -10), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.55, 0), rx(0.6, 60), rx(0.72, 60), rx(0.77, 0), rx(1, 0)],
    lidL: [rx(0, 0), rx(1, 0)],
    tail1: [rz(0, 0), rz(0.45, 10), rz(1, 0)], tail4: [rz(0, 0), rz(0.45, 30), rz(0.6, 10), rz(0.75, 30), rz(1, 0)],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.45, [0, 0, -8], [0, 0.02, 0]), k(0.6, [0, 0, 0], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
  },
};

export const quati: ModelDef = {
  id: 'quati',
  kind: 'npc',
  build,
  anims: { idle, falar, vender },
  cell: [240, 200],
  pivot: [116, 186],
  height: 200 / 104,
  presets: ['selva', 'neutro'],
};
void ry; void roundBox;
