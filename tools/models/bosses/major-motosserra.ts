/**
 * MAJOR MOTOSSERRA — chefe do Mundo 1.
 * Javali enorme e corcunda (~3 u), armadura de placas de serra (ombreiras-serra, serra circular
 * gigante nas costas, peitoral com borda dentada), braço direito que termina numa motosserra,
 * quepe militar torto, bigode-escovão e medalhas de lata no peito. Ruge muito, pensa pouco.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, roundBox, mat, taper, pull, bulge, wobble, flattenBelow, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim } from '../../render/anim';
import { boarHead } from './javali';
import { sawBlade, rivets, puff, sparks } from './parts';
import { k, rz, rx, pk, sk, blink, wave, waveP, jitter, show, HIDDEN } from '../../anims/bosses/kit';

const C = {
  fur: 0x5b4a3e, furDark: 0x33281f, belly: 0x8a7462, snout: 0x9a6a5e,
  olive: 0x56653a, oliveDark: 0x3a4628, steel: 0x9aa0a8, steelDark: 0x5a6068,
  orange: 0xe0731e, boot: 0x241a14, gold: 0xd9b040, red: 0xb8302a,
};

function build() {
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 2.5 });
  const furDark = mat('fur', C.furDark, { repeat: 2.5 });
  const belly = mat('shortFur', C.belly, { repeat: 2 });
  const steel = mat('metal', C.steel, { metal: 0.5, rough: 0.3 });
  const plate = mat('metal', 0xb4bac2, { metal: 0.25, rough: 0.45 });
  const steelDark = mat('metal', C.steelDark, { metal: 0.5, rough: 0.45 });
  const rust = mat('rust', 0x8a5a3a);
  const olive = mat('cloth', C.olive, { repeat: 3 });
  const oliveDark = mat('cloth', C.oliveDark, { repeat: 3 });
  const leather = mat('leather', 0x3a2618);
  const boot = mat('leather', C.boot, { rough: 0.35 });
  const gold = mat('metal', C.gold, { metal: 0.5, rough: 0.25 });
  const orange = mat('paint', C.orange, { rough: 0.4 });
  const blackPlastic = mat('plastic', 0x1a1a1c);

  /* ---------- esqueleto ---------- */
  r.bone('body', 'root', [0, 0, 0]);
  r.bone('hips', 'body', [0, 1.02, 0]);
  r.bone('spine', 'hips', [0.02, 0.32, 0], [0, 0, -8]);
  r.bone('chest', 'spine', [0.06, 0.5, 0], [0, 0, -6]);
  r.bone('neck', 'chest', [0.42, 0.28, 0], [0, 0, 4]);
  boarHead(r, 'neck', { scale: 1.6, pos: [0.16, 0.2, 0], rot: [0, 0, 6], fur: C.fur, furDark: C.furDark, snout: C.snout, mustache: 'militar', angry: 22, lid: 0.32, tusks: 1.3, iris: 0xc2401c });
  r.bone('cap', 'head', [-0.02, 0.27, 0], [0, 0, 10]);
  r.bone('backSaw', 'chest', [-0.55, 0.08, 0], [0, 0, 0]);
  r.bone('steamL', 'head', [-0.12, 0.32, -0.2]);
  r.bone('steamR', 'head', [-0.12, 0.32, 0.2]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    r.bone(`arm${s}_up`, 'chest', [0.12, 0.2, 0.72 * z], [z * 8, 0, s === 'R' ? 14 : 4]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.62, 0], [0, 0, s === 'R' ? 76 : 26]);
    r.bone(`leg${s}_up`, 'hips', [0.02, -0.08, 0.36 * z], [0, 0, 4]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.46, 0], [0, 0, -10]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.42, 0], [0, 0, 6]);
  }
  r.bone('handL', 'armL_lo', [0, -0.56, 0]);
  r.bone('saw', 'armR_lo', [0, -0.5, 0], [0, 0, -90]);
  r.bone('chainTop', 'saw', [0, 0, 0]);
  r.bone('chainBot', 'saw', [0, 0, 0]);
  r.bone('exhaust', 'saw', [-0.05, 0.3, -0.1]);
  r.bone('thrown', 'handL', [0.08, -0.12, 0]);
  r.bone('sparks', 'saw', [1.5, -0.05, 0]);
  r.bone('tail', 'hips', [-0.62, 0.12, 0], [0, 0, 30]);
  r.anchor('hand', 'saw', [1.2, 0, 0]);
  r.anchor('handL', 'handL', [0.06, -0.1, 0]);
  r.anchor('head', 'head', [0, 0.5, 0]);
  for (const b of ['thrown', 'sparks', 'steamL', 'steamR']) r.bones[b].scale.setScalar(HIDDEN);

  /* ---------- quadril, barriga, tronco ---------- */
  r.add('hips',
    blob([0.62, 0.44, 0.58], olive, { pos: [-0.04, 0.0, 0], deform: [flattenBelow(-0.34, 0.6), bulge([-0.5, 0, 0], 0.4, 0.06)] }),
    // cinturão de couro com fivela e coldre de óleo
    lathe([[0.001, -0.1], [0.62, -0.1], [0.64, -0.02], [0.64, 0.06], [0.62, 0.12], [0.001, 0.12]], leather, { pos: [-0.02, 0.14, 0], scale: [1, 1, 0.93] }),
    roundBox([0.06, 0.2, 0.24], 0.03, gold, { pos: [0.63, 0.15, 0] }),
    roundBox([0.22, 0.26, 0.12], 0.04, leather, { pos: [-0.15, 0.0, 0.6], rot: [0, 0, 6] }),
    lathe([[0.05, 0], [0.07, 0.04], [0.07, 0.2], [0.03, 0.26], [0.001, 0.27]], mat('paint', 0x2e5a2a), { pos: [-0.15, 0.06, 0.62] }),
  );
  r.add('spine',
    blob([0.72, 0.6, 0.64], fur, { pos: [0.04, 0.16, 0], deform: [taper('y', -0.6, 0.6, 1.02, 0.92), wobble(0.01)] }),
    // barrigão clara aparecendo sob o peitoral
    blob([0.46, 0.42, 0.5], belly, { pos: [0.3, 0.02, 0], scale: [0.9, 1, 1] }),
    // camisa de uniforme rasgada no lombo
    blob([0.66, 0.36, 0.62], olive, { pos: [-0.16, 0.3, 0], deform: [wobble(0.012, 5)] }),
  );
  r.add('chest',
    blob([0.7, 0.56, 0.72], fur, { pos: [0.02, 0.06, 0], deform: [pull([-0.4, 0.35, 0], 0.4, [-0.08, 0.14, 0]), wobble(0.01)] }),
    // peitoral de aço com borda dentada de serra
    blob([0.45, 0.5, 0.64], plate, { pos: [0.3, 0.02, 0], deform: [taper('x', -0.45, 0.45, 1.1, 0.95)] }),
    ...Array.from({ length: 9 }, (_, i) => {
      const a = -60 + i * 15;
      const z = Math.sin(a * Math.PI / 180) * 0.6;
      const x = 0.3 + Math.cos(a * Math.PI / 180) * 0.4;
      return spike(0.14, 0.06, steel, { pos: [x, -0.4, z], rot: [0, 0, 180], curve: 0.2 });
    }),
    ...rivets([[0.72, 0.25, 0.25], [0.74, 0.0, 0.3], [0.7, -0.25, 0.3], [0.72, 0.25, -0.25], [0.6, 0.35, 0.42], [0.55, -0.2, 0.52]], 0.035),
    // medalhas de lata
    tube([[0.62, 0.28, 0.42], [0.66, 0.16, 0.44]], 0.035, mat('cloth', C.red), { seg: 4, radial: 6 }),
    slab([[-0.05, -0.05], [0.05, -0.05], [0.06, 0.05], [0, 0.08], [-0.06, 0.05]], 0.02, gold, { pos: [0.66, 0.09, 0.46], rot: [0, 40, 0] }),
    tube([[0.66, 0.3, 0.3], [0.7, 0.18, 0.33]], 0.035, mat('cloth', 0x2a5ab0), { seg: 4, radial: 6 }),
    ring(0.05, 0.016, gold, { pos: [0.71, 0.12, 0.35], rot: [0, 40, 0] }),
    // gola de pelo eriçado
    ...[0, 1, 2, 3, 4, 5].map((i) => spike(0.3, 0.09, furDark, { pos: [-0.1 - i * 0.1, 0.42 - i * 0.03, (i % 2 ? 0.12 : -0.12)], rot: [0, 0, 40 + i * 10], curve: -0.3 })),
  );
  // serra gigante nas costas (o "casco" do Major)
  r.add('backSaw', sawBlade(0.62, 0.08, { teeth: 22, rot: [0, 0, 0] }));
  r.add('backSaw', roundBox([0.5, 0.1, 0.1], 0.03, leather, { pos: [0.4, 0.2, 0.06], rot: [0, 0, -30] }));

  /* ---------- quepe militar ---------- */
  r.add('cap',
    lathe([[0.001, 0.32], [0.24, 0.32], [0.34, 0.27], [0.33, 0.2], [0.24, 0.12], [0.24, 0.0], [0.001, 0.0]], olive, { scale: [1.05, 1, 0.95], deform: [pull([0.3, 0.3, 0], 0.25, [0.05, 0.05, 0])] }),
    lathe([[0.245, 0.0], [0.255, 0.02], [0.255, 0.1], [0.245, 0.12]], mat('cloth', C.red), { scale: [1.05, 1, 0.95] }),
    slab([[0, -0.15], [0.22, -0.12], [0.26, 0], [0.22, 0.12], [0, 0.15]], 0.02, blackPlastic, { pos: [0.22, 0.01, 0], rot: [90, 0, -14] }),
    slab([[0, 0.07], [0.02, 0.02], [0.07, 0.02], [0.03, -0.01], [0.05, -0.06], [0, -0.03], [-0.05, -0.06], [-0.03, -0.01], [-0.07, 0.02], [-0.02, 0.02]], 0.02, gold, { pos: [0.27, 0.07, 0], rot: [0, 90, 0], smooth: false }),
    tube([[0.25, 0.02, -0.18], [0.3, 0.0, 0], [0.25, 0.02, 0.18]], 0.012, gold),
  );
  // vapor de raiva (escondido)
  r.add('steamL', puff(0.3, 0xf4f4f4));
  r.add('steamR', puff(0.3, 0xf4f4f4));

  /* ---------- braço esquerdo: punhão ---------- */
  r.add('armL_up',
    limb(0.62, 0.26, 0.2, fur, { deform: [bulge([0.08, -0.15, 0], 0.2, 0.05)] }),
    sawBlade(0.34, 0.05, { pos: [0, 0.02, -0.12], rot: [0, 180, 0], teeth: 14 }),
  );
  r.add('armL_lo',
    limb(0.56, 0.2, 0.17, fur),
    lathe([[0.2, -0.16], [0.215, -0.12], [0.215, 0.02], [0.2, 0.05]], steelDark, { pos: [0, -0.4, 0] }),
  );
  r.add('handL',
    blob([0.19, 0.17, 0.17], furDark, { pos: [0.04, -0.08, 0], deform: [wobble(0.01)] }),
    ...[0, 1, 2].map((i) => blob([0.07, 0.06, 0.05], furDark, { pos: [0.18, -0.08 - i * 0.0, -0.09 + i * 0.09] })),
    blob([0.06, 0.08, 0.05], furDark, { pos: [0.12, -0.0, 0.14] }),
  );
  r.add('thrown', sawBlade(0.3, 0.05, { teeth: 14 }));

  /* ---------- braço direito: motosserra ---------- */
  r.add('armR_up',
    limb(0.62, 0.27, 0.21, fur, { deform: [bulge([0.08, -0.15, 0], 0.2, 0.05)] }),
    sawBlade(0.36, 0.05, { pos: [0, 0.02, 0.14], teeth: 14 }),
  );
  r.add('armR_lo',
    limb(0.42, 0.21, 0.19, fur),
    // luva-adaptador de metal parafusada no antebraço
    lathe([[0.2, -0.5], [0.26, -0.46], [0.26, -0.22], [0.22, -0.16]], steelDark, {}),
    ...rivets([[0.0, -0.3, 0.26], [0.13, -0.38, 0.22], [-0.13, -0.38, 0.22]], 0.03),
  );
  const barOutline: [number, number][] = [[0.0, -0.13], [1.25, -0.11], [1.36, -0.06], [1.39, 0], [1.36, 0.06], [1.25, 0.11], [0.0, 0.13]];
  r.add('saw',
    roundBox([0.5, 0.42, 0.42], 0.1, orange, { pos: [0.1, 0.0, 0], deform: [bulge([0.1, 0.15, 0], 0.25, 0.04)] }),
    roundBox([0.3, 0.2, 0.44], 0.05, mat('paint', 0x2a2a2c), { pos: [0.18, -0.08, 0] }),
    // aletas de refrigeração
    ...[0, 1, 2, 3].map((i) => roundBox([0.03, 0.22, 0.46], 0.012, steelDark, { pos: [-0.06 + i * 0.07, 0.08, 0] })),
    // alça superior
    tube([[-0.05, 0.2, 0], [0.05, 0.36, 0], [0.3, 0.34, 0], [0.38, 0.2, 0]], 0.035, blackPlastic),
    // cordão de partida com puxador
    tube([[-0.12, 0.05, 0.2], [-0.22, -0.05, 0.24], [-0.24, -0.18, 0.22]], 0.012, mat('cloth', 0xe8d8a0)),
    roundBox([0.1, 0.04, 0.04], 0.015, mat('plastic', C.red), { pos: [-0.24, -0.2, 0.22] }),
    // sabre (barra) da motosserra
    slab(barOutline, 0.05, steel, { pos: [0.32, -0.02, 0], smooth: false, bevel: 0.012 }),
    tube([[0.4, -0.02, 0.035], [1.5, -0.02, 0.035]], 0.008, steelDark, { seg: 4, radial: 6 }),
    // corrente (contorno)
    tube([[0.35, 0.115, 0], [1.0, 0.115, 0], [1.57, 0.115, 0], [1.71, -0.02, 0], [1.57, -0.15, 0], [1.0, -0.15, 0], [0.35, -0.15, 0]], 0.022, mat('metal', 0x3a3a3e, { metal: 0.5, rough: 0.5 }), { seg: 64, radial: 8 }),
    // escapamento
    lathe([[0.05, 0], [0.05, 0.12], [0.065, 0.14], [0.065, 0.16], [0.04, 0.16]], steelDark, { pos: [-0.05, 0.2, -0.1] }),
  );
  for (const [b, y, dir] of [['chainTop', 0.14, 1], ['chainBot', -0.175, -1]] as const) {
    r.add(b, ...Array.from({ length: 12 }, (_, i) =>
      slab([[0, 0], [0.07, 0], [0.02, 0.07 * dir]], 0.03, mat('metal', 0xd0d4da, { metal: 0.5, rough: 0.25 }), { pos: [0.38 + i * 0.1, y, 0], smooth: false, bevel: 0.006 })));
  }
  r.add('exhaust', puff(0.16, 0x707074));
  r.bones.exhaust.scale.setScalar(0.6);
  r.add('sparks', sparks(0.5));

  /* ---------- pernas curtas e botas ---------- */
  for (const s of ['L', 'R'] as const) {
    r.add(`leg${s}_up`, limb(0.46, 0.27, 0.22, olive, { deform: [bulge([0.1, -0.1, 0], 0.2, 0.04)] }), lathe([[0.235, -0.48], [0.25, -0.44], [0.24, -0.36], [0.22, -0.34]], oliveDark, {}));
    r.add(`leg${s}_lo`, limb(0.4, 0.2, 0.17, fur), lathe([[0.18, -0.42], [0.21, -0.36], [0.2, -0.16], [0.17, -0.12]], boot, {}));
    r.add(`foot${s}`,
      blob([0.32, 0.13, 0.2], boot, { pos: [0.1, -0.02, 0], deform: [flattenBelow(-0.08, 1), pull([0.3, 0.05, 0], 0.2, [0.04, 0.03, 0])] }),
      roundBox([0.62, 0.05, 0.38], 0.02, mat('rubber', 0x111111), { pos: [0.1, -0.1, 0] }),
      // casco aparecendo na ponta rasgada da bota
      blob([0.08, 0.06, 0.07], mat('shell', 0x2a2420), { pos: [0.4, -0.06, 0.06] }),
      blob([0.08, 0.06, 0.07], mat('shell', 0x2a2420), { pos: [0.4, -0.06, -0.06] }),
    );
  }
  r.add('tail', tube([[0, 0, 0], [-0.1, 0.1, 0], [-0.08, 0.22, 0.04], [0.0, 0.25, 0.0]], (t) => 0.05 * (1 - t * 0.6), fur, { seg: 20 }), blob([0.07, 0.1, 0.07], furDark, { pos: [0.02, 0.28, 0] }));
  void rust;
  return r;
}

/* ---------------- animações ---------------- */
const chainRun = (cycles: number): Record<string, ReturnType<typeof waveP>> => {
  const top: ReturnType<typeof waveP> = [], bot: ReturnType<typeof waveP> = [];
  for (let i = 0; i <= cycles; i++) {
    const t = i / cycles;
    top.push(pk(t, [0, 0, 0], 'step')); bot.push(pk(t, [0, 0, 0], 'step'));
    if (i < cycles) {
      const t2 = (i + 0.999) / cycles;
      top.push(pk(t2, [0.1, 0, 0], 'linear')); bot.push(pk(t2, [-0.1, 0, 0], 'linear'));
    }
  }
  return { chainTop: top, chainBot: bot };
};
const blinkBoth = (t: number) => ({ lidR: blink(t, 60), lidL: blink(t, 60) });

const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    hips: waveP([0, 0.025, 0], 1, 0.25),
    spine: wave([0, 0, 1.5], 1, 0.25, [0, 0, 0]),
    chest: [sk(0, 1), sk(0.5, [1.02, 1.03, 1.02]), sk(1, 1)],
    head: wave([0, 0, 3], 1, 0.5),
    jaw: wave([0, 0, -3], 2, 0, [0, 0, -3]),
    armR_up: wave([0, 0, 2], 1, 0.4), armL_up: wave([0, 0, -3], 1, 0.4),
    saw: [...jitter([0.008, 0.01, 0], 0, 1, 23)],
    exhaust: [sk(0, 1), sk(0.3, 1.6), sk(0.32, 1), sk(0.62, 1.6), sk(0.64, 1), sk(1, 1)],
    mustR: wave([8, 0, 0], 2), mustL: wave([-8, 0, 0], 2),
    earR: wave([0, 0, 8], 1, 0.7), earL: wave([0, 0, 8], 1, 0.7),
    tail: wave([0, 0, 20], 2),
    ...chainRun(6),
    ...blinkBoth(0.72),
  },
};

const entrada: Anim = {
  frames: 36, loop: false,
  keys: {
    // chega marchando, bate continência, ergue a motosserra e ruge
    body: [pk(0, [-1.2, 0, 0]), pk(0.12, [-0.8, 0.06, 0]), pk(0.24, [-0.4, 0, 0]), pk(0.34, [0, 0, 0], 'out'), pk(1, [0, 0, 0])],
    legR_up: [rz(0, 30), rz(0.12, -24), rz(0.24, 30), rz(0.34, 0), rz(1, 0)],
    legL_up: [rz(0, -24), rz(0.12, 30), rz(0.24, -24), rz(0.34, 0), rz(1, 0)],
    legR_lo: [rz(0, -10), rz(0.06, -40), rz(0.12, -5), rz(0.24, -10), rz(0.34, 0)],
    legL_lo: [rz(0, -5), rz(0.12, -10), rz(0.18, -40), rz(0.24, -5), rz(0.34, 0)],
    armL_up: [rz(0, 0), rz(0.34, 0), rz(0.42, 160, 'back'), rz(0.6, 160), rz(0.68, 10), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.34, 0), rz(0.42, 80), rz(0.6, 80), rz(0.68, 10), rz(1, 0)],
    head: [rz(0, 0), rz(0.42, 6), rz(0.6, 6), rz(0.72, 14), rz(0.85, 18), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.68, 0), rz(0.74, -28, 'out'), rz(0.92, -28), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.6, 0), rz(0.72, 70, 'back'), rz(0.92, 70), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.6, 0), rz(0.72, 20), rz(0.92, 20), rz(1, 0)],
    chest: [rz(0, 0), rz(0.7, 0), rz(0.76, 10), rz(0.92, 10), rz(1, 0)],
    saw: jitter([0.02, 0.03, 0], 0.7, 0.95, 12),
    exhaust: [sk(0, 1), sk(0.7, 1), sk(0.76, 2.4), sk(0.95, 2.6), sk(1, 1)],
    mustR: [rx(0, 0), rx(0.74, 20), rx(0.92, 24), rx(1, 0)], mustL: [rx(0, 0), rx(0.74, -20), rx(0.92, -24), rx(1, 0)],
    cap: [k(0, [0, 0, 0], [0, 0, 0]), k(0.74, [0, 0, 0], [0, 0, 0]), k(0.78, [0, 0, -12], [0, 0.08, 0], 'out'), k(0.86, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0])],
    ...chainRun(9),
    ...blinkBoth(0.3),
  },
};

const ataque1: Anim = {
  // investida com a motosserra apontada
  frames: 20, loop: false,
  keys: {
    body: [pk(0, [0, 0, 0]), pk(0.25, [-0.2, -0.08, 0], 'out'), pk(0.45, [0.9, 0.05, 0], 'in'), pk(0.65, [1.4, 0, 0], 'out'), pk(1, [0, 0, 0])],
    spine: [rz(0, 0), rz(0.25, 8), rz(0.45, -22), rz(0.7, -22), rz(1, 0)],
    head: [rz(0, 0), rz(0.25, -6), rz(0.45, 14), rz(0.7, 14), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.25, -20), rz(0.45, 34), rz(0.7, 34), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.25, 10), rz(0.45, 6), rz(0.7, 6), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.25, 30), rz(0.45, -50), rz(0.7, -40), rz(1, 0)],
    legR_up: [rz(0, 0), rz(0.25, 30), rz(0.4, -40), rz(0.55, 40), rz(0.7, -30), rz(1, 0)],
    legL_up: [rz(0, 0), rz(0.25, -20), rz(0.4, 40), rz(0.55, -40), rz(0.7, 30), rz(1, 0)],
    legR_lo: [rz(0, 0), rz(0.25, -40), rz(0.4, -10), rz(0.47, -60), rz(0.55, -10), rz(1, 0)],
    legL_lo: [rz(0, 0), rz(0.25, -40), rz(0.32, -60), rz(0.4, -10), rz(0.62, -60), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.4, -26), rz(0.75, -26), rz(1, 0)],
    saw: jitter([0.025, 0.035, 0], 0.3, 0.8, 12),
    sparks: show([[0.6, 0.75]]),
    exhaust: [sk(0, 1), sk(0.4, 2.4), sk(0.8, 2.2), sk(1, 1)],
    mustR: [rx(0, 0), rx(0.45, -25), rx(0.8, -25), rx(1, 0)], mustL: [rx(0, 0), rx(0.45, 25), rx(0.8, 25), rx(1, 0)],
    cap: [rz(0, 0), rz(0.5, -16), rz(0.8, -16), rz(1, 0)],
    ...chainRun(10),
  },
};

const ataque2: Anim = {
  // arranca uma serra das costas e arremessa como bumerangue
  frames: 22, loop: false,
  keys: {
    armL_up: [rz(0, 0), rz(0.3, 200, 'out'), rz(0.45, 210), rz(0.6, 40, 'in'), rz(0.75, -10), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.3, 60), rz(0.45, 100), rz(0.6, 0), rz(1, 0)],
    chest: [k(0, [0, 0, 0]), k(0.45, [0, 30, 10]), k(0.62, [0, -30, -14], undefined, 'in'), k(1, [0, 0, 0])],
    spine: [rz(0, 0), rz(0.45, 10), rz(0.62, -14), rz(1, 0)],
    head: [rz(0, 0), rz(0.45, -4), rz(0.62, 10), rz(1, 0)],
    thrown: [...show([[0.3, 0.6]]), k(0.3, [0, 0, 0]), k(0.6, [0, 0, -720], undefined, 'in')],
    legL_up: [rz(0, 0), rz(0.45, -16), rz(0.62, 20), rz(1, 0)],
    legR_up: [rz(0, 0), rz(0.45, 14), rz(0.62, -14), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.55, 0), rz(0.62, -30, 'out'), rz(0.85, -20), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.4, 20), rx(0.6, 20), rx(1, 0)], lidL: [rx(0, 0), rx(0.4, 20), rx(0.6, 20), rx(1, 0)],
    ...chainRun(7),
  },
};

const ataque3: Anim = {
  // golpe por cima, cravando a motosserra no chão (faíscas)
  frames: 24, loop: false,
  keys: {
    body: [pk(0, [0, 0, 0]), pk(0.3, [0, 0.12, 0], 'out'), pk(0.45, [0.2, -0.12, 0], 'in'), pk(0.7, [0.2, -0.12, 0]), pk(1, [0, 0, 0])],
    spine: [rz(0, 0), rz(0.3, 22, 'out'), rz(0.45, -26, 'in'), rz(0.7, -24), rz(1, 0)],
    chest: [rz(0, 0), rz(0.3, 10), rz(0.45, -10, 'in'), rz(0.7, -8), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.3, 150, 'out'), rz(0.45, 20, 'in'), rz(0.7, 20), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.3, -30), rz(0.45, -30), rz(0.7, -30), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.3, 60), rz(0.45, -30), rz(1, 0)],
    head: [rz(0, 0), rz(0.3, 16), rz(0.45, -8), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -30), rz(0.6, -30), rz(1, 0)],
    legR_up: [rz(0, 0), rz(0.45, 30), rz(0.7, 30), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.45, -40), rz(0.7, -40), rz(1, 0)],
    legL_up: [rz(0, 0), rz(0.45, -20), rz(0.7, -20), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.45, -20), rz(0.7, -20), rz(1, 0)],
    sparks: show([[0.45, 0.72]]),
    saw: jitter([0.02, 0.04, 0], 0.45, 0.72, 8),
    cap: [k(0, [0, 0, 0], [0, 0, 0]), k(0.45, [0, 0, 0], [0, 0, 0]), k(0.52, [0, 0, 20], [0, 0.1, 0], 'out'), k(0.62, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0])],
    mustR: [rx(0, 0), rx(0.3, 15), rx(0.5, -20), rx(1, 0)], mustL: [rx(0, 0), rx(0.3, -15), rx(0.5, 20), rx(1, 0)],
    ...chainRun(8),
  },
};

const vulneravel: Anim = {
  // serra presa na árvore: puxa, puxa, e nada
  frames: 16, loop: true,
  keys: {
    body: waveP([-0.08, 0, 0], 1, 0, [0, -0.04, 0]),
    spine: wave([0, 0, 6], 1, 0.25, [0, 0, 14]),
    head: wave([0, 0, -5], 2, 0, [0, 0, 8]),
    armR_up: wave([0, 0, 4], 1, 0, [0, 0, 22]),
    armR_lo: [rz(0, -16), rz(1, -16)],
    armL_up: wave([0, 0, 10], 1, 0.25, [0, 0, 70]),
    armL_lo: [rz(0, 40), rz(1, 40)],
    legR_up: [rz(0, 30), rz(1, 30)], legR_lo: [rz(0, -30), rz(1, -30)],
    legL_up: [rz(0, -26), rz(1, -26)], legL_lo: [rz(0, -10), rz(1, -10)],
    jaw: wave([0, 0, -10], 2, 0, [0, 0, -14]),
    lidR: [rx(0, -30), rx(1, -30)], lidL: [rx(0, -30), rx(1, -30)],
    saw: waveP([0.015, 0.015, 0], 4),
    cap: wave([0, 0, 8], 1, 0.5, [0, 0, -10]),
    mustR: wave([10, 0, 0], 2), mustL: wave([-10, 0, 0], 2),
    earR: wave([0, 0, 14], 2, 0.3, [0, 0, -20]), earL: wave([0, 0, 14], 2, 0.3, [0, 0, -20]),
    tail: wave([0, 0, 30], 4),
  },
};

const dano: Anim = {
  frames: 10, loop: false,
  keys: {
    body: [pk(0, [0, 0, 0]), pk(0.2, [-0.25, 0.05, 0], 'out'), pk(1, [-0.1, 0, 0])],
    spine: [rz(0, 0), rz(0.2, 20), rz(1, 6)],
    head: [rz(0, 0), rz(0.2, 24), rz(1, 6)],
    jaw: [rz(0, 0), rz(0.2, -20), rz(1, -4)],
    armL_up: [rz(0, 0), rz(0.2, 60), rz(1, 10)], armR_up: [rz(0, 0), rz(0.2, 30), rz(1, 6)],
    lidR: [rx(0, 0), rx(0.15, 70), rx(0.6, 70), rx(1, 10)], lidL: [rx(0, 0), rx(0.15, 70), rx(0.6, 70), rx(1, 10)],
    cap: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 30], [0, 0.18, 0], 'out'), k(0.7, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0])],
    earR: [rz(0, 0), rz(0.2, 40), rz(1, 0)], earL: [rz(0, 0), rz(0.2, 40), rz(1, 0)],
    mustR: [rx(0, 0), rx(0.2, 30), rx(1, 0)], mustL: [rx(0, 0), rx(0.2, -30), rx(1, 0)],
  },
};

const furia: Anim = {
  // pisoteia, sapateia de raiva com vapor saindo das orelhas
  frames: 24, loop: false,
  keys: {
    body: [pk(0, [0, 0, 0]), pk(0.15, [0, 0.15, 0], 'out'), pk(0.25, [0, -0.05, 0], 'in'), pk(0.4, [0, 0.15, 0], 'out'), pk(0.5, [0, -0.05, 0], 'in'), pk(0.7, [0, 0, 0]), pk(1, [0, 0, 0])],
    legR_up: [rz(0, 0), rz(0.15, 40), rz(0.25, 0), rz(1, 0)], legR_lo: [rz(0, 0), rz(0.15, -60), rz(0.25, 0), rz(1, 0)],
    legL_up: [rz(0, 0), rz(0.4, 40), rz(0.5, 0), rz(1, 0)], legL_lo: [rz(0, 0), rz(0.4, -60), rz(0.5, 0), rz(1, 0)],
    armR_up: [rz(0, 0), rz(0.2, 130), rz(0.5, 150), rz(0.8, 130), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.2, -40), rz(0.8, -40), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.2, 150), rz(0.35, 120), rz(0.5, 160), rz(0.65, 120), rz(0.8, 150), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.2, 50), rz(0.8, 50), rz(1, 0)],
    chest: [rz(0, 0), rz(0.2, 14), rz(0.8, 14), rz(1, 0)],
    head: [rz(0, 0), rz(0.2, 24), rz(0.8, 24), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.2, -34), rz(0.85, -34), rz(1, 0)],
    steamL: [...show([[0.25, 0.85]], 0.01), pk(0.25, [0, 0, 0]), pk(0.85, [-0.1, 0.5, 0], 'out')], steamR: [...show([[0.3, 0.85]], 0.01), pk(0.3, [0, 0, 0]), pk(0.85, [-0.1, 0.5, 0], 'out')],
    saw: jitter([0.03, 0.04, 0], 0.15, 0.85, 14),
    exhaust: [sk(0, 1), sk(0.2, 2.6), sk(0.85, 2.8), sk(1, 1)],
    cap: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, -20], [0, 0.12, 0]), k(0.5, [0, 0, 20], [0, 0.16, 0]), k(0.75, [0, 0, -10], [0, 0.08, 0]), k(0.9, [0, 0, 0], [0, 0, 0], 'bounce')],
    mustR: wave([30, 0, 0], 4), mustL: wave([-30, 0, 0], 4),
    earR: wave([0, 0, 20], 4, 0, [0, 0, -10]), earL: wave([0, 0, 20], 4, 0.5, [0, 0, -10]),
    ...chainRun(12),
  },
};

const derrota: Anim = {
  // cambaleia tonto, cai sentado, quepe cobre os olhos, motosserra engasga
  frames: 36, loop: false,
  keys: {
    body: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 6], [-0.1, 0, 0]), k(0.3, [0, 0, -6], [0.1, 0, 0]), k(0.45, [0, 0, 8], [-0.2, 0, 0]), k(0.6, [0, 0, 14], [-0.4, -0.5, 0], 'in'), k(0.68, [0, 0, 10], [-0.4, -0.42, 0], 'out'), k(0.76, [0, 0, 14], [-0.4, -0.5, 0], 'in'), k(1, [0, 0, 14], [-0.4, -0.5, 0])],
    legR_up: [rz(0, 0), rz(0.45, 0), rz(0.6, 80), rz(1, 80)], legL_up: [rz(0, 0), rz(0.45, 0), rz(0.6, 70), rz(1, 70)],
    legR_lo: [rz(0, 0), rz(0.6, -10), rz(1, -10)], legL_lo: [rz(0, 0), rz(0.6, -20), rz(1, -20)],
    spine: [rz(0, 0), rz(0.6, 10), rz(1, 16)],
    head: [k(0, [0, 0, 0]), k(0.15, [16, 0, 8]), k(0.3, [-16, 0, -4]), k(0.45, [12, 0, 6]), k(0.7, [0, 0, -20]), k(1, [6, 0, -24])],
    armR_up: [rz(0, 0), rz(0.6, -10), rz(1, -20)], armR_lo: [rz(0, 0), rz(0.6, -50), rz(1, -60)],
    armL_up: [rz(0, 0), rz(0.6, -20), rz(1, -25)], armL_lo: [rz(0, 0), rz(1, 0)],
    jaw: [rz(0, 0), rz(0.3, -16), rz(1, -12)],
    lidR: [rx(0, 0), rx(0.2, 40), rx(1, 40)], lidL: [rx(0, 0), rx(0.2, 40), rx(1, 40)],
    cap: [k(0, [0, 0, 0], [0, 0, 0]), k(0.6, [0, 0, 0], [0, 0, 0]), k(0.7, [0, 0, -30], [0.04, 0.1, 0], 'out'), k(0.8, [0, 0, -36], [0.08, -0.06, 0], 'bounce'), k(1, [0, 0, -36], [0.08, -0.06, 0])],
    mustR: [rx(0, 0), rx(0.6, 0), rx(0.8, -30), rx(1, -30)], mustL: [rx(0, 0), rx(0.6, 0), rx(0.8, 30), rx(1, 30)],
    earR: [rz(0, 0), rz(0.6, -50), rz(1, -50)], earL: [rz(0, 0), rz(0.6, -50), rz(1, -50)],
    saw: jitter([0.03, 0.04, 0], 0.62, 0.95, 10),
    exhaust: [sk(0, 1), sk(0.62, 2.5), sk(0.7, 1), sk(0.78, 2.8), sk(0.86, 1), sk(0.92, 3), sk(1, 3)],
    tail: [rz(0, 0), rz(0.6, 0), rz(1, -40)],
  },
};

export const majorMotosserra: ModelDef = {
  id: 'major-motosserra',
  kind: 'boss',
  build,
  anims: { idle, entrada, ataque1, ataque2, ataque3, vulneravel, dano, furia, derrota },
  cell: [720, 440],
  pivot: [300, 410],
  height: 440 / 104,
  presets: ['selva', 'neutro'],
};
