/**
 * RAINHA MORCEGA-LÂMPADA — chefe do Mundo 2.
 * Morcega gigante (~3.5 u de envergadura), vaidosíssima: coroa de lâmpadas acesas, capa de veludo
 * com gola alta, colar com pingente de lâmpada, asas membranosas com veias, olhos que brilham no escuro.
 * Paira de frente para a câmera (girada para +X o suficiente para ler a direção).
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, eye, mat, taper, pull, bulge, wobble, THREE, type V3, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim } from '../../render/anim';
import { k, rz, rx, ry, pk, sk, blink, wave, waveP, waveS, jitter, show, HIDDEN, SHOW } from '../../anims/bosses/kit';

const C = {
  fur: 0x4a3550, furDark: 0x2c1f33, furLight: 0x8a6a8e, skin: 0x5a3a52, membrane: 0x6a3a5a, vein: 0x3a1a32,
  inner: 0xd88aa0, cape: 0x7a1a3a, capeIn: 0x3a0a5a, gold: 0xe0b445, bulb: 0xfff3b0,
};

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 2.5 });
  const furDark = mat('fur', C.furDark, { repeat: 2.5 });
  const furLight = mat('shortFur', C.furLight, { repeat: 2 });
  const skin = mat('skin', C.skin, { rough: 0.5 });
  const membrane = mat('leather', C.membrane, { rough: 0.55, rim: 0.9 });
  const vein = mat('skin', C.vein, { rough: 0.4 });
  const inner = mat('skin', C.inner, { rough: 0.5 });
  const cape = mat('cloth', C.cape, { repeat: 2 });
  const capeIn = mat('cloth', C.capeIn, { repeat: 2 });
  const gold = mat('metal', C.gold, { metal: 0.5, rough: 0.25 });
  const claw = mat('shell', 0xe8dcc8, { rough: 0.35, repeat: 3 });
  const glass = mat('glass', 0xfff4c0, { opacity: 0.5 });
  const filament = mat('glow', 0xffe070, { emissive: 0xffb830, emissiveIntensity: 2.2 });
  const fang = mat('shell', 0xfaf4e6, { rough: 0.3 });

  /* ---------- esqueleto ---------- */
  r.bone('body', 'root', [0, 1.62, 0], [0, -70, 0]);
  r.bone('chest', 'body', [0, 0.1, 0]);
  r.bone('head', 'chest', [0.05, 0.56, 0]);
  r.bones.head.scale.setScalar(1.3);
  r.bone('jaw', 'head', [0.24, -0.12, 0]);
  r.bone('earL', 'head', [0.0, 0.18, -0.22], [-34, 0, 0]);
  r.bone('earR', 'head', [0.0, 0.18, 0.22], [34, 0, 0]);
  r.bone('crown', 'head', [-0.02, 0.27, 0], [0, 0, 8]);
  r.bone('lamps', 'crown', [0, 0, 0]);
  r.bone('cape', 'chest', [-0.2, 0.32, 0]);
  r.bone('cape2', 'cape', [-0.05, -0.65, 0]);
  r.bone('pendant', 'chest', [0.33, 0.12, 0]);
  r.bone('shout', 'head', [0.42, -0.1, 0]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`wing${s}_up`, 'chest', [-0.02, 0.28, 0.26 * z], [0, z * -90, 18]);
    r.bone(`wing${s}_lo`, `wing${s}_up`, [0.58, 0.16, 0], [0, 0, -14]);
    r.bone(`leg${s}`, 'body', [-0.05, -0.38, 0.14 * z], [0, 0, -10]);
    r.bone(`foot${s}`, `leg${s}`, [0, -0.3, 0], [0, 0, 20]);
  }
  r.anchor('head', 'head', [0, 0.65, 0]);
  r.anchor('hand', 'footR', [0.05, -0.1, 0]);
  r.bones.shout.scale.setScalar(HIDDEN);

  /* ---------- corpo ---------- */
  r.add('body',
    blob([0.3, 0.42, 0.32], fur, { pos: [0, -0.08, 0], deform: [taper('y', -0.5, 0.4, 0.6, 1.05), wobble(0.008)] }),
    blob([0.18, 0.26, 0.2], furLight, { pos: [0.2, -0.04, 0], deform: [wobble(0.006)] }),
  );
  r.add('chest',
    blob([0.38, 0.32, 0.4], fur, { pos: [0, 0.22, 0], deform: [wobble(0.01, 6)] }),
    // gola de rufos real (renda branca franzida)
    ring(0.31, 0.085, mat('cloth', 0xf4ecf4, { repeat: 4 }), { pos: [0.02, 0.44, 0], rot: [90, 0, 0], deform: [wobble(0.02, 22)] }),
    ring(0.21, 0.05, mat('cloth', 0xe0d0e8, { repeat: 4 }), { pos: [0.02, 0.5, 0], rot: [90, 0, 0], deform: [wobble(0.016, 26)] }),
    blob([0.2, 0.2, 0.24], furLight, { pos: [0.18, 0.18, 0], deform: [wobble(0.012, 9)] }),
    // colar de ouro
    tube([[0.12, 0.4, 0.3], [0.33, 0.3, 0.16], [0.37, 0.26, 0], [0.33, 0.3, -0.16], [0.12, 0.4, -0.3]], 0.022, gold, { seg: 24 }),
  );
  // pingente de lâmpada
  r.add('pendant',
    lathe([[0.04, 0.04], [0.045, -0.02], [0.03, -0.03]], gold, { pos: [0.04, 0, 0] }),
    lathe([[0.03, -0.03], [0.06, -0.08], [0.065, -0.13], [0.05, -0.17], [0.001, -0.19]], glass, { pos: [0.04, 0, 0] }),
    blob([0.03, 0.04, 0.03], filament, { pos: [0.04, -0.12, 0] }),
  );

  /* ---------- capa e gola alta ---------- */
  // capa: painel em leque atrás do corpo (plano YZ, voltado para a frente da rainha), barra recortada
  const capeOut: V2[] = [[-0.36, 0.05], [0.36, 0.05], [0.5, -0.4], [0.62, -0.95], [0.4, -0.88], [0.2, -1.0], [0.0, -0.9], [-0.2, -1.0], [-0.4, -0.88], [-0.62, -0.95], [-0.5, -0.4]];
  r.add('cape',
    slab(capeOut, 0.04, cape, { pos: [-0.12, 0, 0], rot: [0, 90, 0] }),
    slab(capeOut.map(([x, y]) => [x * 0.96, y * 0.97 - 0.01] as V2), 0.02, capeIn, { pos: [-0.16, 0, 0], rot: [0, 90, 0] }),
    tube(capeOut.slice(2).map(([x, y]) => [-0.1, y, -x] as V3), 0.018, gold, { seg: 40 }),
    // gola alta em leque atrás da cabeça
    slab([[-0.42, 0], [-0.5, 0.3], [-0.38, 0.55], [-0.15, 0.68], [0.15, 0.68], [0.38, 0.55], [0.5, 0.3], [0.42, 0]], 0.03, capeIn, { pos: [-0.1, 0.12, 0], rot: [0, 90, 0] }),
    tube([[-0.08, 0.12, 0.42], [-0.08, 0.42, 0.5], [-0.08, 0.67, 0.38], [-0.08, 0.8, 0.15], [-0.08, 0.8, -0.15], [-0.08, 0.67, -0.38], [-0.08, 0.42, -0.5], [-0.08, 0.12, -0.42]], 0.02, gold, { seg: 40 }),
    // fecho no ombro (broches de ouro com pedra)
    blob([0.06, 0.06, 0.03], gold, { pos: [0.05, 0.02, 0.36], rot: [0, 90, 0] }),
    blob([0.035, 0.035, 0.02], mat('crystal', 0xd02a5a), { pos: [0.05, 0.02, 0.39] }),
    blob([0.06, 0.06, 0.03], gold, { pos: [0.05, 0.02, -0.36], rot: [0, 90, 0] }),
  );
  r.add('cape2',
    slab([[-0.6, 0.3], [0.6, 0.3], [0.7, -0.15], [0.45, -0.08], [0.25, -0.22], [0.0, -0.1], [-0.25, -0.22], [-0.45, -0.08], [-0.7, -0.15]], 0.035, cape, { pos: [-0.14, -0.12, 0], rot: [0, 90, 0] }),
  );

  /* ---------- cabeça ---------- */
  r.add('head',
    blob([0.32, 0.29, 0.31], fur, { pos: [0.02, 0.04, 0], deform: [pull([0.28, -0.08, 0], 0.2, [0.06, -0.03, 0]), wobble(0.008)] }),
    // focinho curto com folha nasal
    blob([0.1, 0.09, 0.13], skin, { pos: [0.26, -0.08, 0] }),
    slab([[0, 0], [0.04, 0.05], [0.0, 0.11], [-0.04, 0.05]], 0.02, skin, { pos: [0.34, -0.05, 0], rot: [0, 90, -20] }),
    blob([0.02, 0.016, 0.016], mat('skin', 0x1a0a14), { pos: [0.35, -0.07, 0.035] }),
    blob([0.02, 0.016, 0.016], mat('skin', 0x1a0a14), { pos: [0.35, -0.07, -0.035] }),
    // topete de pelo
    ...[0, 1, 2].map((i) => spike(0.12, 0.05, furDark, { pos: [0.12 - i * 0.07, 0.28, (i - 1) * 0.06], rot: [(i - 1) * 20, 0, 30], curve: -0.5 })),
    // cílios longos de rainha
    ...[[0.25, 0.1, 0.18, 1], [0.25, 0.1, -0.18, -1]].flatMap(([x, y, z, s]) => [0, 1, 2].map((i) => tube([[0, 0, 0], [0.02, 0.04, 0.02 * s], [0.0, 0.07, 0.05 * s]], 0.008, mat('skin', 0x0a0508), { pos: [x - i * 0.035, y + 0.06, z + s * 0.03], seg: 6, radial: 5, rot: [0, 0, 20 - i * 15] }))),
  );
  // olhos que brilham (globo emissivo)
  const glowWhite = mat('glow', 0xfff0a0, { emissive: 0xffd040, emissiveIntensity: 1.6 });
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const e = eye({ r: 0.11, iris: 0xd0201a, irisScale: 0.5, look: [0.4, -0.1], lid: 0.32, lidColor: C.furDark, angry: z * 18 });
    (e.children[0] as THREE.Mesh).material = glowWhite;
    (e.children[1] as THREE.Mesh).material = mat('glow', 0xff4a1a, { emissive: 0xff3010, emissiveIntensity: 1.3 });
    e.position.set(0.22, 0.1, 0.14 * z);
    e.rotation.y = z > 0 ? 0.45 : -0.1;
    r.add('head', e);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
    // auréola de brilho
    r.add('head', blob([0.14, 0.14, 0.03], mat('glow', 0xffe080, { emissive: 0xffc040, emissiveIntensity: 0.9, opacity: 0.25 }), { pos: [0.26, 0.09, 0.17 * z], rot: [0, z > 0 ? 32 : -14, 0], castShadow: false }));
    // sobrancelha arqueada
    r.add('head', slab([[-0.07, 0], [0.07, 0.02], [0.08, 0.035], [-0.06, 0.03]], 0.02, furDark, { pos: [0.24, 0.2, 0.15 * z], rot: [z * 10, z * 30, -18] }));
  }
  // boca e presas
  r.add('jaw',
    blob([0.12, 0.05, 0.13], skin, { pos: [0.04, -0.03, 0] }),
    blob([0.08, 0.025, 0.09], mat('skin', 0x8a2040, { rough: 0.35 }), { pos: [0.05, 0.0, 0] }),
  );
  r.add('head',
    spike(0.07, 0.022, fang, { pos: [0.33, -0.12, 0.05], rot: [0, 0, 180] }),
    spike(0.07, 0.022, fang, { pos: [0.33, -0.12, -0.05], rot: [0, 0, 180] }),
  );
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const earOut: V2[] = [[-0.14, 0], [0.14, 0], [0.16, 0.25], [0.08, 0.55], [0.02, 0.66], [-0.07, 0.48], [-0.15, 0.2]];
    r.add(`ear${s}`,
      slab(earOut, 0.04, fur, { rot: [0, z * 70, 0] }),
      slab(earOut.map(([x, y]) => [x * 0.7, y * 0.8 + 0.03] as V2), 0.015, inner, { pos: [0.035, 0, 0.0], rot: [0, z * 70, 0] }),
      // brinquinho de ouro
      ring(0.03, 0.008, gold, { pos: [0.02, 0.08, z * 0.06], rot: [0, z * 70, 0] }),
    );
  }

  /* ---------- coroa de lâmpadas ---------- */
  r.add('crown',
    lathe([[0.19, 0], [0.205, 0.02], [0.2, 0.08], [0.22, 0.1], [0.205, 0.115]], gold, { scale: [1.05, 1, 1.12] }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      return blob([0.024, 0.024, 0.024], mat('crystal', i % 2 ? 0x2a6ae0 : 0xd02040), { pos: [Math.cos(a) * 0.205, 0.05, Math.sin(a) * 0.23] });
    }),
  );
  const bulbAngles: [number, number][] = [[0, 1.25], [38, 1.0], [-38, 1.0], [80, 0.85], [-80, 0.85]];
  for (const [deg, sc] of bulbAngles) {
    const a = deg * Math.PI / 180;
    const dir = new THREE.Vector3(Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    for (const layer of ['crown', 'lamps'] as const) {
      const g = new THREE.Group();
      g.position.set(Math.cos(a) * 0.19, 0.1, Math.sin(a) * 0.21);
      g.quaternion.copy(q);
      g.scale.setScalar(sc * 1.35);
      if (layer === 'crown') {
        // soquete rosqueado + bulbo de vidro
        g.add(lathe([[0.035, 0], [0.04, 0.015], [0.035, 0.03], [0.04, 0.045], [0.035, 0.06], [0.045, 0.07]], gold));
        g.add(lathe([[0.04, 0.07], [0.07, 0.12], [0.085, 0.18], [0.075, 0.24], [0.04, 0.27], [0.001, 0.275]], glass));
      } else {
        // núcleo incandescente (escala anima o brilho)
        const core = new THREE.Group();
        core.position.set(0, 0.17, 0);
        core.add(blob([0.06, 0.075, 0.06], filament, { castShadow: false }));
        core.add(tube([[-0.02, -0.09, 0], [-0.02, 0.0, 0], [0.0, 0.03, 0], [0.02, 0.0, 0], [0.02, -0.09, 0]], 0.006, filament, { seg: 10, radial: 5, castShadow: false }));
        g.add(core);
      }
      r.add(layer, g);
    }
  }

  /* ---------- asas membranosas ---------- */
  for (const s of ['L', 'R'] as const) {
    const vz = s === 'R' ? -0.026 : 0.026; // lado das veias voltado para a câmera
    r.add(`wing${s}_up`,
      limb(0.58, 0.075, 0.05, furDark, { rot: [0, 0, 105] }),
      slab([[0.0, 0.06], [0.55, 0.05], [0.58, -0.25], [0.52, -0.55], [0.3, -0.42], [0.1, -0.5], [-0.05, -0.55], [-0.1, -0.2]], 0.025, membrane, {}),
      tube([[0.05, 0.02, vz], [0.2, -0.15, vz], [0.28, -0.38, vz]], 0.008, vein, { seg: 10, radial: 5 }),
      tube([[0.3, 0.02, vz], [0.38, -0.2, vz], [0.48, -0.42, vz]], 0.008, vein, { seg: 10, radial: 5 }),
      tube([[0.2, -0.15, vz], [0.08, -0.3, vz]], 0.006, vein, { seg: 6, radial: 5 }),
    );
    const tips: V3[] = [[0.92, 0.48, 0], [1.24, 0.08, 0], [1.05, -0.5, 0], [0.62, -0.78, 0]];
    const wrist: V3 = [0.6, 0.0, 0];
    r.add(`wing${s}_lo`,
      limb(0.6, 0.055, 0.045, furDark, { rot: [0, 0, 90] }),
      slab([[-0.05, 0.05], [0.6, 0.04], [0.92, 0.48], [0.9, 0.2], [1.24, 0.08], [0.98, -0.12], [1.05, -0.5], [0.8, -0.38], [0.62, -0.78], [0.42, -0.45], [0.05, -0.55], [-0.08, -0.25]], 0.022, membrane, {}),
      ...tips.map((t) => tube([wrist, [(wrist[0] + t[0]) / 2 + 0.02, (wrist[1] + t[1]) / 2 + 0.03, 0], t], (u) => 0.03 * (1 - u * 0.6), furDark, { seg: 14, radial: 8 })),
      // veias ramificadas
      ...tips.flatMap((t, i) => [
        tube([[wrist[0] + (t[0] - wrist[0]) * 0.4, wrist[1] + (t[1] - wrist[1]) * 0.4, vz], [wrist[0] + (t[0] - wrist[0]) * 0.55 + 0.1, wrist[1] + (t[1] - wrist[1]) * 0.55 - 0.12, vz], [wrist[0] + (t[0] - wrist[0]) * 0.7 + 0.12 - i * 0.05, wrist[1] + (t[1] - wrist[1]) * 0.7 - 0.24, vz]], 0.007, vein, { seg: 10, radial: 5 }),
      ]),
      tube([[0.1, 0.0, vz], [0.25, -0.2, vz], [0.3, -0.42, vz]], 0.007, vein, { seg: 10, radial: 5 }),
      // garra do polegar
      spike(0.12, 0.03, claw, { pos: [0.62, 0.06, 0], rot: [0, 0, 20], curve: -0.5 }),
      blob([0.05, 0.045, 0.045], furDark, { pos: [0.6, 0.0, 0] }),
    );
  }
  /* ---------- perninhas com garras ---------- */
  for (const s of ['L', 'R'] as const) {
    r.add(`leg${s}`, limb(0.3, 0.09, 0.06, fur));
    r.add(`foot${s}`,
      blob([0.07, 0.05, 0.06], skin, { pos: [0.02, -0.02, 0] }),
      ...[-1, 0, 1].map((i) => spike(0.1, 0.018, claw, { pos: [0.05, -0.04, i * 0.035], rot: [i * 10, 0, -140], curve: 0.6 })),
    );
  }
  // ondas do grito (aparecem no ataque2)
  const waveM = mat('glow', 0xffe8a0, { emissive: 0xffd060, emissiveIntensity: 1.4, opacity: 0.55 });
  r.add('shout', ...[0, 1, 2].map((i) => ring(0.16 + i * 0.13, 0.018 - i * 0.003, waveM, { pos: [-i * 0.05, 0, 0], rot: [0, 90, 0], castShadow: false })));
  void bulge; void ry;
  return r;
}

/* ---------------- animações ---------------- */
const flap = (cycles: number, amp = 1, base = 0): Record<string, ReturnType<typeof wave>> => ({
  wingR_up: wave([0, 0, 38 * amp], cycles, 0, [0, 0, base]),
  wingL_up: wave([0, 0, 38 * amp], cycles, 0, [0, 0, base]),
  wingR_lo: wave([0, 0, 26 * amp], cycles, -0.12, [0, 0, base * 0.5]),
  wingL_lo: wave([0, 0, 26 * amp], cycles, -0.12, [0, 0, base * 0.5]),
  body: waveP([0, -0.1 * amp, 0], cycles, 0),
});
const blinkBoth = (t: number) => ({ lidR: blink(t, 60), lidL: blink(t, 60) });
const flicker = (on: number[]): ReturnType<typeof sk>[] => on.map((v, i) => sk(i / (on.length - 1), v, 'step'));

const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    ...flap(2),
    head: wave([0, 0, 4], 1, 0.3),
    chest: wave([0, 0, -3], 2, 0.2),
    cape: wave([0, 0, 6], 2, 0.4), cape2: wave([0, 0, 8], 2, 0.6),
    legR: wave([0, 0, 10], 2, 0.5), legL: wave([0, 0, 10], 2, 0.6),
    earR: wave([10, 0, 0], 1, 0.2), earL: wave([-10, 0, 0], 1, 0.2),
    lamps: waveS([0.06, 0.06, 0.06], 3),
    pendant: wave([0, 0, 10], 2, 0.5),
    ...blinkBoth(0.6),
  },
};

const entrada: Anim = {
  // desce enrolada nas asas (casulo), abre de uma vez acendendo a coroa
  frames: 36, loop: false,
  keys: {
    root: [pk(0, [0, 1.6, 0]), pk(0.35, [0, 0, 0], 'out'), pk(1, [0, 0, 0])],
    wingR_up: [rz(0, -80), rz(0.5, -80), rz(0.62, 60, 'back'), rz(0.75, 50), rz(0.88, -10), rz(1, 0)],
    wingL_up: [rz(0, -80), rz(0.5, -80), rz(0.62, 60, 'back'), rz(0.75, 50), rz(0.88, -10), rz(1, 0)],
    wingR_lo: [rz(0, -150), rz(0.5, -150), rz(0.62, 10, 'back'), rz(1, 0)],
    wingL_lo: [rz(0, -150), rz(0.5, -150), rz(0.62, 10, 'back'), rz(1, 0)],
    lamps: [sk(0, 0.2), sk(0.5, 0.2), sk(0.55, 1, 'step'), sk(0.58, 0.3, 'step'), sk(0.62, 1.5, 'step'), sk(0.8, 1.3), sk(1, 1)],
    head: [rz(0, -20), rz(0.5, -20), rz(0.62, 14), rz(0.8, 10), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.6, 0), rz(0.66, -30, 'out'), rz(0.85, -30), rz(1, 0)],
    lidR: [rx(0, 80), rx(0.5, 80), rx(0.56, 0), rx(1, 0)], lidL: [rx(0, 80), rx(0.5, 80), rx(0.56, 0), rx(1, 0)],
    cape: [rz(0, -10), rz(0.62, 20), rz(1, 0)],
    cape2: [rz(0, -10), rz(0.62, 25), rz(1, 0)],
    crown: [k(0, [0, 0, 0], [0, 0, 0]), k(0.62, [0, 0, 0], [0, 0, 0]), k(0.7, [0, 0, -10], [0, 0.04, 0]), k(0.85, [0, 0, 0], [0, 0, 0], 'bounce')],
  },
};

const ataque1: Anim = {
  // mergulho rasante: recolhe as asas, cai em diagonal e sobe
  frames: 20, loop: false,
  keys: {
    root: [pk(0, [0, 0, 0]), pk(0.2, [-0.2, 0.25, 0], 'out'), pk(0.5, [1.2, -1.05, 0], 'in'), pk(0.7, [1.8, -0.9, 0], 'out'), pk(1, [0, 0, 0])],
    body: [k(0, [0, 0, 0]), k(0.2, [0, 0, 20]), k(0.5, [0, 0, -40]), k(0.7, [0, 0, -10]), k(1, [0, 0, 0])],
    wingR_up: [rz(0, 0), rz(0.2, 50), rz(0.5, -50), rz(0.7, 40), rz(1, 0)], wingL_up: [rz(0, 0), rz(0.2, 50), rz(0.5, -50), rz(0.7, 40), rz(1, 0)],
    wingR_lo: [rz(0, 0), rz(0.2, 20), rz(0.5, -60), rz(0.7, 20), rz(1, 0)], wingL_lo: [rz(0, 0), rz(0.2, 20), rz(0.5, -60), rz(0.7, 20), rz(1, 0)],
    legR: [rz(0, 0), rz(0.45, 60), rz(0.7, 60), rz(1, 0)], legL: [rz(0, 0), rz(0.45, 50), rz(0.7, 50), rz(1, 0)],
    footR: [rz(0, 0), rz(0.45, -40), rz(0.55, 20), rz(1, 0)], footL: [rz(0, 0), rz(0.45, -40), rz(0.55, 20), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.4, -26), rz(0.7, -26), rz(1, 0)],
    cape: [rz(0, 0), rz(0.5, 40), rz(1, 0)], cape2: [rz(0, 0), rz(0.55, 40), rz(1, 0)],
    earR: [rx(0, 0), rx(0.5, -30), rx(1, 0)], earL: [rx(0, 0), rx(0.5, 30), rx(1, 0)],
  },
};

const ataque2: Anim = {
  // grito ultrassônico: estica o pescoço, abre a boca e solta ondas de luz; lâmpadas piscam
  frames: 24, loop: false,
  keys: {
    ...flap(2, 0.5),
    head: [rz(0, 0), rz(0.25, 20), rz(0.35, -14, 'out'), rz(0.85, -14), rz(1, 0)],
    chest: [rz(0, 0), rz(0.25, 12), rz(0.35, -10), rz(0.85, -10), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.25, 0), rz(0.35, -40, 'out'), rz(0.85, -40), rz(1, 0)],
    shout: [sk(0, 1), sk(0.34, 1, 'step'), sk(0.36, SHOW * 0.4, 'step'), sk(0.6, SHOW * 1.3), sk(0.61, SHOW * 0.4, 'step'), sk(0.86, SHOW * 1.3), sk(0.88, 1, 'step'), sk(1, 1)],
    lamps: flicker([1, 1, 1, 1.4, 0.3, 1.5, 0.3, 1.5, 0.3, 1.5, 1, 1]),
    lidR: [rx(0, 0), rx(0.35, -20), rx(0.85, -20), rx(1, 0)], lidL: [rx(0, 0), rx(0.35, -20), rx(0.85, -20), rx(1, 0)],
    earR: [rx(0, 0), rx(0.35, 20), rx(0.85, 20), rx(1, 0)], earL: [rx(0, 0), rx(0.35, -20), rx(0.85, -20), rx(1, 0)],
    crown: jitter([0.01, 0.015, 0], 0.36, 0.86, 10),
  },
};

const ataque3: Anim = {
  // pião de asas: enrola-se na capa e gira, soltando lufadas
  frames: 24, loop: false,
  keys: {
    body: [k(0, [0, 0, 0]), k(0.2, [0, 0, 0]), k(0.8, [0, -720, 0], undefined, 'inOut'), k(1, [0, -720, 0])],
    root: [pk(0, [0, 0, 0]), pk(0.2, [0, 0.2, 0]), pk(0.5, [0.6, -0.4, 0]), pk(0.8, [0.1, 0.1, 0]), pk(1, [0, 0, 0])],
    wingR_up: [rz(0, 0), rz(0.2, -70), rz(0.8, -70), rz(0.9, 20), rz(1, 0)], wingL_up: [rz(0, 0), rz(0.2, -70), rz(0.8, -70), rz(0.9, 20), rz(1, 0)],
    wingR_lo: [rz(0, 0), rz(0.2, -110), rz(0.8, -110), rz(1, 0)], wingL_lo: [rz(0, 0), rz(0.2, -110), rz(0.8, -110), rz(1, 0)],
    cape: [rz(0, 0), rz(0.3, 50), rz(0.8, 50), rz(1, 0)], cape2: [rz(0, 0), rz(0.3, 30), rz(0.8, 30), rz(1, 0)],
    lamps: flicker([1, 1.3, 0.6, 1.3, 0.6, 1.3, 0.6, 1.3, 1]),
    jaw: [rz(0, 0), rz(0.2, -20), rz(0.8, -20), rz(1, 0)],
  },
};

const vulneravel: Anim = {
  // caída no chão, tonta, coroa torta e lâmpadas falhando
  frames: 24, loop: true,
  keys: {
    root: [pk(0, [0, -1.0, 0]), pk(1, [0, -1.0, 0])],
    body: [k(0, [0, 0, -10]), k(0.5, [0, 0, -14]), k(1, [0, 0, -10])],
    wingR_up: wave([0, 0, 6], 1, 0, [0, 0, -50]), wingL_up: wave([0, 0, 6], 1, 0.5, [0, 0, -45]),
    wingR_lo: [rz(0, -40), rz(1, -40)], wingL_lo: [rz(0, -50), rz(1, -50)],
    legR: [rz(0, 70), rz(1, 70)], legL: [rz(0, 60), rz(1, 60)],
    head: [k(0, [10, 0, -10]), k(0.25, [-10, 0, -14]), k(0.5, [-10, 0, -10]), k(0.75, [10, 0, -14]), k(1, [10, 0, -10])],
    crown: [k(0, [0, 0, 30], [0.04, -0.03, 0]), k(1, [0, 0, 30], [0.04, -0.03, 0])],
    lamps: flicker([0.6, 0.6, 0.15, 0.7, 0.7, 0.1, 0.1, 0.6, 0.15, 0.6, 0.6, 0.6, 0.6]),
    lidR: [rx(0, 45), rx(1, 45)], lidL: [rx(0, 30), rx(1, 30)],
    jaw: wave([0, 0, -6], 1, 0, [0, 0, -10]),
    earR: [rx(0, -30), rx(1, -30)], earL: [rx(0, 40), rx(1, 40)],
    cape: [rz(0, 20), rz(1, 20)], cape2: [rz(0, 10), rz(1, 10)],
  },
};

const dano: Anim = {
  frames: 10, loop: false,
  keys: {
    root: [pk(0, [0, 0, 0]), pk(0.2, [-0.3, 0.15, 0], 'out'), pk(1, [-0.1, 0, 0])],
    body: [k(0, [0, 0, 0]), k(0.2, [0, 0, 18]), k(1, [0, 0, 4])],
    wingR_up: [rz(0, 0), rz(0.2, 70), rz(1, 10)], wingL_up: [rz(0, 0), rz(0.2, 70), rz(1, 10)],
    wingR_lo: [rz(0, 0), rz(0.2, 40), rz(1, 0)], wingL_lo: [rz(0, 0), rz(0.2, 40), rz(1, 0)],
    head: [rz(0, 0), rz(0.2, 20), rz(1, 4)],
    jaw: [rz(0, 0), rz(0.2, -24), rz(1, -4)],
    lidR: [rx(0, 0), rx(0.15, 75), rx(0.6, 75), rx(1, 0)], lidL: [rx(0, 0), rx(0.15, 75), rx(0.6, 75), rx(1, 0)],
    lamps: flicker([1, 0.1, 1, 0.1, 1, 1]),
    crown: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 20], [0, 0.1, 0], 'out'), k(0.7, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0])],
    earR: [rx(0, 0), rx(0.2, 30), rx(1, 0)], earL: [rx(0, 0), rx(0.2, -30), rx(1, 0)],
  },
};

const furia: Anim = {
  // abre tudo, lâmpadas incham e estouram de luz, berra tremendo
  frames: 24, loop: false,
  keys: {
    wingR_up: [rz(0, 0), rz(0.2, 40), rz(0.85, 40), rz(1, 0)], wingL_up: [rz(0, 0), rz(0.2, 40), rz(0.85, 40), rz(1, 0)],
    wingR_lo: [rz(0, 0), rz(0.2, 10), rz(0.85, 10), rz(1, 0)], wingL_lo: [rz(0, 0), rz(0.2, 10), rz(0.85, 10), rz(1, 0)],
    body: jitter([0.03, 0.03, 0], 0.2, 0.85, 14),
    head: [rz(0, 0), rz(0.2, -18), rz(0.85, -18), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.2, -42), rz(0.85, -42), rz(1, 0)],
    lamps: [sk(0, 1), sk(0.2, 1.8, 'back'), sk(0.4, 1.5), sk(0.5, 1.9), sk(0.6, 1.5), sk(0.7, 1.9), sk(0.85, 1.6), sk(1, 1)],
    crown: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 0], [0, 0.05, 0]), k(0.85, [0, 0, 0], [0, 0.05, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    lidR: [rx(0, 0), rx(0.2, -25), rx(0.85, -25), rx(1, 0)], lidL: [rx(0, 0), rx(0.2, -25), rx(0.85, -25), rx(1, 0)],
    earR: [rx(0, 0), rx(0.2, 25), rx(0.85, 25), rx(1, 0)], earL: [rx(0, 0), rx(0.2, -25), rx(0.85, -25), rx(1, 0)],
    cape: wave([0, 0, 14], 4, 0, [0, 0, 20]), cape2: wave([0, 0, 18], 4, 0.3, [0, 0, 20]),
    shout: [sk(0, 1), sk(0.23, 1, 'step'), sk(0.25, SHOW * 0.4, 'step'), sk(0.55, SHOW * 1.4), sk(0.56, SHOW * 0.4, 'step'), sk(0.85, SHOW * 1.4), sk(0.87, 1, 'step'), sk(1, 1)],
  },
};

const derrota: Anim = {
  // lâmpadas apagam uma a uma, ela gira em parafuso e cai de cara, coroa rola
  frames: 36, loop: false,
  keys: {
    lamps: [sk(0, 1), sk(0.1, 0.2, 'step'), sk(0.13, 1, 'step'), sk(0.2, 0.15, 'step'), sk(0.24, 0.8, 'step'), sk(0.3, 0.05), sk(1, 0.05)],
    root: [pk(0, [0, 0, 0]), pk(0.3, [0, 0.2, 0], 'out'), pk(0.7, [0.3, -1.25, 0], 'in'), pk(0.78, [0.35, -1.05, 0], 'out'), pk(0.86, [0.4, -1.25, 0], 'in'), pk(1, [0.4, -1.25, 0])],
    body: [k(0, [0, 0, 0]), k(0.3, [0, 0, 0]), k(0.7, [0, -540, -20], undefined, 'in'), k(0.86, [0, -540, -70], undefined, 'in'), k(1, [0, -540, -85])],
    wingR_up: [rz(0, 0), rz(0.3, 50), rz(0.7, 60), rz(0.86, -30), rz(1, -35)], wingL_up: [rz(0, 0), rz(0.3, 50), rz(0.7, 60), rz(0.86, -30), rz(1, -40)],
    wingR_lo: [rz(0, 0), rz(0.7, 20), rz(1, -50)], wingL_lo: [rz(0, 0), rz(0.7, 20), rz(1, -40)],
    head: [rz(0, 0), rz(0.3, 10), rz(1, -10)],
    jaw: [rz(0, 0), rz(0.3, -20), rz(1, -14)],
    lidR: [rx(0, 0), rx(0.3, 30), rx(0.86, 90), rx(1, 90)], lidL: [rx(0, 0), rx(0.3, 30), rx(0.86, 90), rx(1, 90)],
    crown: [k(0, [0, 0, 0], [0, 0, 0]), k(0.7, [0, 0, 0], [0, 0, 0]), k(0.8, [0, 0, 40], [0.15, 0.2, 0], 'out'), k(0.9, [0, 0, 90], [0.3, -0.05, 0], 'in'), k(1, [0, 0, 100], [0.32, -0.05, 0])],
    legR: [rz(0, 0), rz(1, 60)], legL: [rz(0, 0), rz(1, 40)],
    earR: [rx(0, 0), rx(1, -40)], earL: [rx(0, 0), rx(1, 40)],
  },
};

export const rainhaMorcega: ModelDef = {
  id: 'rainha-morcega',
  kind: 'boss',
  build,
  anims: { idle, entrada, ataque1, ataque2, ataque3, vulneravel, dano, furia, derrota },
  cell: [600, 460],
  pivot: [280, 440],
  height: 460 / 104,
  presets: ['caverna', 'neutro'],
};
