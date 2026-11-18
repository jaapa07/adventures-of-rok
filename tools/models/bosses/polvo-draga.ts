/**
 * POLVO-DRAGA — chefe do Mundo 3.
 * Draga mecânica submarina em forma de polvo (~4 u): manto de aço amarelo-draga rebitado e enferrujado,
 * olhos-farol com venezianas, cabine de vidro na frente com um javali piloto (quepe de marinheiro,
 * bigodinho, manches), 6 tentáculos de mangueira corrugada (4 ossos cada) com bocais de sucção,
 * válvulas vermelhas nos flancos (o ponto fraco) e um snorkel que solta bolhas.
 */
import { Rig, blob, limb, tube, slab, lathe, ring, roundBox, eye, mat, taper, pull, wobble, flattenBelow, THREE, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim, Key } from '../../render/anim';
import { boarHead } from './javali';
import { rivets, valveWheel, puff } from './parts';
import { k, rz, rx, pk, sk, blink, wave, waveP, jitter, show, HIDDEN } from '../../anims/bosses/kit';

const C = {
  hull: 0xe2a72a, hullDark: 0xa8741a, rust: 0x8a4a22, steel: 0x8a9298, hose: 0x46524c, hoseBand: 0xe2a72a,
  valve: 0xd0281e, glass: 0xbfe8ff, pilotFur: 0x6a5446, pilotDark: 0x3e3028, snout: 0xb07a6a,
};

/** Ângulos (graus em torno de Y, 0 = frente) dos 6 tentáculos. */
const TENT = [28, 80, 135, -28, -80, -135];
const SEG = 4;

function build() {
  const r = new Rig('root');
  const hull = mat('paint', C.hull, { rough: 0.45 });
  const hullDark = mat('paint', C.hullDark, { rough: 0.5 });
  const rust = mat('rust', C.rust);
  const steel = mat('metal', C.steel, { metal: 0.5, rough: 0.35 });
  const steelDark = mat('metal', 0x50585e, { metal: 0.5, rough: 0.45 });
  const black = mat('paint', 0x1c1c1e, { rough: 0.5 });
  const hose = mat('rubber', C.hose);
  const hoseRib = mat('rubber', 0x34403a);
  const band = mat('paint', C.hoseBand, { rough: 0.45 });
  const glass = mat('glass', C.glass, { opacity: 0.3 });
  const glassRim = mat('glass', 0xe8f8ff, { opacity: 0.55 });
  const bubbleM = mat('glass', 0xdff6ff, { opacity: 0.45 });

  /* ---------- esqueleto ---------- */
  r.bone('hull', 'root', [0, 2.45, 0]);
  r.bone('mantle', 'hull', [-0.1, 0.0, 0], [0, 0, 22]);
  r.bone('cabin', 'hull', [0.98, -0.28, 0]);
  r.bones.cabin.scale.setScalar(1.3);
  r.bone('hatch', 'cabin', [-0.32, 0.12, 0]);
  r.bone('pilot', 'cabin', [0.0, -0.36, 0]);
  r.bone('pChest', 'pilot', [0, 0.2, 0]);
  boarHead(r, 'pChest', { prefix: 'p', scale: 0.62, pos: [0.06, 0.28, 0], fur: C.pilotFur, furDark: C.pilotDark, snout: C.snout, mustache: 'piloto', mustacheColor: 0x2a1c14, angry: 10, lid: 0.2, tusks: 0.6, iris: 0x3a2a1a });
  r.bone('pHat', 'phead', [-0.02, 0.26, 0], [0, 0, 8]);
  r.bone('pArmR', 'pChest', [0.04, 0.12, 0.17], [0, 0, 40]);
  r.bone('pArmL', 'pChest', [0.04, 0.12, -0.17], [0, 0, 40]);
  r.bone('leverR', 'cabin', [0.2, -0.3, 0.12], [0, 0, -20]);
  r.bone('leverL', 'cabin', [0.2, -0.3, -0.12], [0, 0, -20]);
  r.bone('eyes', 'mantle', [0.84, 0.32, 0], [0, 0, -14]);
  r.bone('prop', 'mantle', [-1.0, 0.1, 0], [0, 0, 0]);
  r.bone('snorkel', 'mantle', [-0.1, 1.1, 0.2]);
  r.bone('bubbles', 'snorkel', [-0.3, 0.75, 0]);
  r.bone('steam', 'hull', [-0.1, 0.4, 0.9]);
  for (let v = 1; v <= 3; v++) r.bone(`valve${v}`, 'mantle', [[0.1, -0.4, -0.55][v - 1], [0.2, -0.25, -0.2][v - 1], 0.86], [0, 0, 0]);
  TENT.forEach((deg, i) => {
    const a = deg * Math.PI / 180;
    r.bone(`t${i}_0`, 'hull', [Math.cos(a) * 0.62, -0.5, -Math.sin(a) * 0.62], [0, deg, 0]);
    r.bone(`t${i}_1`, `t${i}_0`, [0, 0, 0], [0, 0, -52]);
    for (let j = 2; j <= SEG; j++) r.bone(`t${i}_${j}`, `t${i}_${j - 1}`, [0.52, 0, 0], [0, 0, [0, 0, -24, -12, 32][j]]);
  });
  r.anchor('head', 'mantle', [0, 1.3, 0]);
  r.anchor('hand', 't0_4', [0.5, 0, 0]);
  r.bone('flag', 'pArmR', [0, -0.26, 0], [0, 0, 180]);
  r.bones.steam.scale.setScalar(HIDDEN);
  r.bones.flag.scale.setScalar(HIDDEN);

  /* ---------- manto (casco de draga) ---------- */
  r.add('mantle',
    blob([1.0, 1.0, 0.92], hull, { pos: [0, 0.22, 0], seg: 48, deform: [pull([0, 0.9, 0], 0.7, [-0.05, 0.18, 0]), flattenBelow(-0.75, 0.7), wobble(0.006, 3)] }),
    // faixa de perigo (zebrada) no equador
    lathe([[0.985, -0.12], [1.0, -0.06], [1.0, 0.06], [0.985, 0.12]], black, { scale: [1.05, 1, 0.92] }),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return slab([[-0.07, -0.12], [0.03, -0.12], [0.09, 0.12], [-0.01, 0.12]], 0.02, band, { pos: [Math.cos(a) * 1.05 * 1.0, 0, Math.sin(a) * 0.93], rot: [0, -a * 180 / Math.PI + 90, 0], smooth: false, bevel: 0.006 });
    }),
    // fileiras de rebites
    ...rivets(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return [Math.cos(a) * 0.98, 0.5 * 0 + 0.3, Math.sin(a) * 0.86] as V3; }).map(([x, , z]) => [x * 0.98, 0.42, z * 0.98] as V3), 0.03),
    ...rivets(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2 + 0.2; return [Math.cos(a) * 0.93, -0.42, Math.sin(a) * 0.82] as V3; }), 0.03),
    // manchas de ferrugem e amassados
    blob([0.25, 0.18, 0.06], rust, { pos: [0.2, 0.75, 0.62], rot: [0, 30, 20], deform: [wobble(0.02, 9)] }),
    blob([0.2, 0.14, 0.05], rust, { pos: [-0.6, -0.2, 0.62], rot: [0, -40, 0], deform: [wobble(0.02, 9)] }),
    blob([0.16, 0.12, 0.05], rust, { pos: [-0.2, 0.95, -0.4], deform: [wobble(0.02, 9)] }),
    // escotilha de inspeção com parafusos
    ring(0.16, 0.025, steelDark, { pos: [-0.35, 0.55, 0.72], rot: [0, -25, 0] }),
    blob([0.15, 0.15, 0.03], hullDark, { pos: [-0.35, 0.55, 0.71], rot: [0, -25, 0] }),
  );
  // hélice traseira com aro
  r.add('mantle',
    lathe([[0.2, -0.05], [0.24, 0.0], [0.22, 0.25], [0.12, 0.32]], hullDark, { pos: [-0.86, 0.1, 0], rot: [0, 0, 90] }),
    ring(0.4, 0.05, steelDark, { pos: [-1.12, 0.1, 0], rot: [0, 90, 0] }),
  );
  r.add('prop',
    blob([0.08, 0.08, 0.08], steelDark, { pos: [-0.12, 0, 0] }),
    ...[0, 1, 2].map((i) => slab([[0, 0], [0.1, 0.06], [0.08, 0.34], [-0.04, 0.3]], 0.025, steel, { pos: [-0.12, 0, 0], rot: [i * 120, 90, 0] })),
  );
  // olhos-farol com carcaça (voltados meio de lado, para a câmera ler a expressão)
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const g = new THREE.Group();
    g.position.set(z > 0 ? -0.08 : 0.06, 0.0, 0.42 * z);
    g.rotation.y = z > 0 ? 0.95 : -0.15;
    g.add(ring(0.235, 0.05, steel, {}));
    g.add(lathe([[0.25, -0.2], [0.26, -0.05], [0.24, 0.0]], steelDark, { rot: [90, 0, 0] }));
    const e = eye({ r: 0.22, iris: 0xffcc20, irisScale: 0.55, look: [0.5, -0.15], lid: 0.38, lidColor: 0x8a9298, angry: 22 });
    (e.children[1] as THREE.Mesh).material = mat('glow', 0xffc020, { emissive: 0xffa000, emissiveIntensity: 1.1 });
    g.add(e);
    // sobrancelha de chapa parafusada
    g.add(roundBox([0.5, 0.08, 0.1], 0.035, steelDark, { pos: [0.0, 0.27, 0.08], rot: [0, 0, z > 0 ? -16 : 16] }));
    g.add(...rivets([[-0.16, 0.25, 0.14], [0.16, 0.3, 0.14]], 0.022));
    r.add('eyes', g);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  // snorkel/chaminé
  r.add('snorkel',
    tube([[0, -0.1, 0], [0, 0.4, 0], [-0.1, 0.65, 0], [-0.3, 0.72, 0]], 0.09, steel, { seg: 24 }),
    ...[0.1, 0.3].map((y) => ring(0.1, 0.025, steelDark, { pos: [0, y, 0], rot: [90, 0, 0] })),
    lathe([[0.1, 0], [0.15, 0.08], [0.16, 0.14], [0.13, 0.14]], steelDark, { pos: [-0.3, 0.72, 0], rot: [0, 0, 90] }),
  );
  r.add('bubbles', ...[[0, 0, 0, 0.07], [-0.05, 0.22, 0.04, 0.05], [0.04, 0.42, -0.02, 0.06], [-0.02, 0.62, 0.03, 0.04]].map(([x, y, z, rr]) => blob([rr, rr, rr], bubbleM, { pos: [x, y, z], seg: 14, castShadow: false })));
  r.add('steam', puff(0.4, 0xeaf6ff));

  /* ---------- casco inferior / base dos tentáculos ---------- */
  r.add('hull',
    lathe([[0.001, -0.62], [0.55, -0.6], [0.8, -0.45], [0.86, -0.25], [0.8, -0.1]], hullDark, { scale: [1.1, 1, 1] }),
    ring(0.82, 0.05, steelDark, { pos: [0, -0.32, 0], rot: [90, 0, 0], scale: [1.1, 1, 1] }),
  );

  /* ---------- válvulas vermelhas ---------- */
  for (let v = 1; v <= 3; v++) {
    r.add(`valve${v}`,
      lathe([[0.1, 0], [0.12, 0.06], [0.08, 0.1]], steelDark, { rot: [90, 0, 0] }),
      valveWheel(0.17 - v * 0.015, C.valve, { pos: [0, 0, 0.12] }),
    );
  }

  /* ---------- cabine de vidro e piloto ---------- */
  r.add('cabin',
    lathe([[0.001, -0.5], [0.4, -0.46], [0.52, -0.3], [0.54, -0.12], [0.5, -0.06]], steel, {}),
    ring(0.52, 0.045, hullDark, { pos: [0, -0.08, 0], rot: [90, 0, 0] }),
    ...rivets(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 0.53, -0.04, Math.sin(a) * 0.53] as V3; }), 0.022),
    // painel de controle
    roundBox([0.16, 0.18, 0.5], 0.04, steelDark, { pos: [0.3, -0.26, 0], rot: [0, 0, 20] }),
    blob([0.025, 0.025, 0.02], mat('glow', 0x40ff60), { pos: [0.38, -0.2, 0.12] }),
    blob([0.025, 0.025, 0.02], mat('glow', 0xff3030), { pos: [0.38, -0.2, -0.05] }),
    // dobradiça do domo
    roundBox([0.1, 0.08, 0.3], 0.03, steelDark, { pos: [-0.36, 0.0, 0] }),
  );
  r.add('hatch',
    lathe([[0.5, -0.12], [0.5, 0.05], [0.44, 0.28], [0.3, 0.44], [0.12, 0.52], [0.001, 0.53]], glass, { pos: [0.32, -0.04, 0] }),
    // reflexo do vidro
    tube([[0.55, 0.2, 0.3], [0.65, 0.3, 0.2], [0.7, 0.36, 0.05]], 0.022, glassRim, { seg: 10, radial: 6, castShadow: false }),
    blob([0.04, 0.04, 0.02], mat('glow', 0xffffff, { opacity: 0.8 }), { pos: [0.5, 0.36, 0.34], castShadow: false }),
    ring(0.5, 0.035, hullDark, { pos: [0.32, -0.08, 0], rot: [90, 0, 0] }),
  );
  // piloto: javali de camiseta listrada de marinheiro
  const stripe = mat('cloth', 0xf2f2f2, { repeat: 2 });
  const stripeB = mat('cloth', 0x2a4a9a, { repeat: 2 });
  r.add('pilot', blob([0.24, 0.2, 0.22], stripeB, { pos: [0, 0.08, 0] }));
  r.add('pChest',
    blob([0.22, 0.2, 0.22], stripe, { pos: [0, 0.06, 0], deform: [taper('y', -0.2, 0.2, 1.05, 0.85)] }),
    ...[-0.08, 0.02, 0.12].map((y) => lathe([[0.2, y - 0.012], [0.215, y], [0.2, y + 0.012]], stripeB, { pos: [0, 0.0, 0], scale: [1, 1, 1.02] })),
    // lenço de marinheiro
    slab([[0, 0], [0.12, -0.02], [0.05, -0.12]], 0.02, mat('cloth', 0xd02a2a), { pos: [0.18, 0.16, 0.0], rot: [0, 90, 0] }),
  );
  r.add('pHat',
    lathe([[0.001, 0.12], [0.16, 0.12], [0.2, 0.08], [0.17, 0.0], [0.001, 0.0]], mat('cloth', 0xf6f6f6, { repeat: 3 }), {}),
    lathe([[0.172, -0.005], [0.18, 0.04], [0.172, 0.05]], mat('cloth', 0x1a1a3a), {}),
    slab([[0, -0.11], [0.12, -0.08], [0.15, 0], [0.12, 0.08], [0, 0.11]], 0.015, black, { pos: [0.13, 0.0, 0], rot: [90, 0, -10] }),
  );
  for (const s of ['L', 'R'] as const) {
    r.add(`pArm${s}`, limb(0.22, 0.06, 0.05, stripe), blob([0.06, 0.05, 0.05], mat('fur', C.pilotDark), { pos: [0, -0.25, 0] }));
    r.add(`lever${s}`,
      tube([[0, 0, 0], [0, 0.18, 0]], 0.018, steel, { seg: 4, radial: 8 }),
      blob([0.04, 0.04, 0.04], mat('plastic', s === 'R' ? 0xd02a2a : 0x202020), { pos: [0, 0.2, 0] }),
    );
  }

  r.add('flag',
    tube([[0, 0, 0], [0, 0.42, 0]], 0.012, mat('wood', 0x8a6a40), { seg: 4, radial: 6 }),
    slab([[0, 0.42], [0.24, 0.4], [0.22, 0.3], [0.25, 0.22], [0, 0.24]], 0.012, mat('cloth', 0xf8f8f8), {}),
  );

  /* ---------- tentáculos de mangueira ---------- */
  TENT.forEach((_, i) => {
    r.add(`t${i}_0`, blob([0.2, 0.16, 0.2], steelDark, { pos: [0, 0.05, 0] }), ring(0.17, 0.04, hullDark, { rot: [90, 0, 0], pos: [0, 0.0, 0] }));
    for (let j = 1; j <= SEG; j++) {
      const r0 = 0.15 - (j - 1) * 0.022, r1 = 0.15 - j * 0.022;
      const L = 0.52;
      const parts: THREE.Object3D[] = [
        tube([[0, 0, 0], [L * 0.5, -0.01, 0], [L, 0, 0]], (t) => r0 + (r1 - r0) * t, hose, { seg: 12, radial: 14 }),
        // nervuras corrugadas
        ...[0.12, 0.26, 0.4].map((x) => ring(r0 + (r1 - r0) * (x / L) + 0.006, 0.014, hoseRib, { pos: [x, 0, 0], rot: [0, 90, 0] })),
      ];
      // abraçadeira amarela em cada junta
      parts.push(ring(r0 + 0.012, 0.022, band, { pos: [0.02, 0, 0], rot: [0, 90, 0] }));
      if (j === SEG) {
        // bocal de sucção na ponta
        parts.push(lathe([[r1 * 0.9, 0], [r1 * 1.3, 0.08], [r1 * 1.9, 0.18], [r1 * 1.7, 0.2], [r1 * 1.1, 0.12], [r1 * 0.6, 0.12]], steel, { pos: [L - 0.02, 0, 0], rot: [0, 0, -90] }));
        parts.push(blob([r1 * 1.4, 0.02, r1 * 1.4], black, { pos: [L + 0.15, 0, 0], rot: [0, 0, 90], castShadow: false }));
      }
      r.add(`t${i}_${j}`, ...parts);
    }
  });
  void pull; void limb; void k;
  return r;
}

/* ---------------- animações ---------------- */
type KeyMap = Record<string, Key[]>;
/** Ondulação dos 6 tentáculos (cada um com fase própria). */
function tentWave(amp: number, cycles: number, extra: (i: number, j: number) => number = () => 0): KeyMap {
  const m: KeyMap = {};
  TENT.forEach((_, i) => {
    for (let j = 1; j <= SEG; j++) m[`t${i}_${j}`] = wave([0, 0, amp * (0.6 + j * 0.25)], cycles, i * 0.17 + j * 0.12, [0, 0, extra(i, j)]);
  });
  return m;
}
/** Pose fixa de tentáculos com transição: segs = [t, ângulo por segmento] para tentáculos selecionados. */
function tentPose(ids: number[], keys: [number, number[], import('../../render/anim').Ease?][]): KeyMap {
  const m: KeyMap = {};
  for (const i of ids) for (let j = 1; j <= SEG; j++) m[`t${i}_${j}`] = keys.map(([t, a, e]) => rz(t, a[j - 1] ?? 0, e));
  return m;
}
const lids = (t: number) => ({ lidR: blink(t, 55), lidL: blink(t, 55), plidR: blink(t + 0.12, 60), plidL: blink(t + 0.12, 60) });
const bubbleRise = (cycles: number): KeyMap => {
  const p: Key[] = [];
  for (let c = 0; c < cycles; c++) { p.push(pk(c / cycles, [0, 0, 0], 'step'), pk((c + 0.999) / cycles, [-0.05, 0.6, 0], 'linear')); }
  p.push(pk(1, [0, 0, 0], 'step'));
  return { bubbles: p };
};

const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    hull: waveP([0, 0.06, 0], 1, 0.25),
    mantle: wave([0, 0, 2], 1, 0.5),
    ...tentWave(7, 1),
    pilot: waveP([0, 0.015, 0], 2),
    phead: wave([0, 0, 4], 1, 0.3),
    pArmR: wave([0, 0, 10], 2, 0), pArmL: wave([0, 0, 10], 2, 0.5),
    leverR: wave([0, 0, 10], 2, 0), leverL: wave([0, 0, 10], 2, 0.5),
    ...bubbleRise(2),
    prop: [rx(0, 0), rx(1, 360, 'linear')],
    ...lids(0.66),
  },
};

const entrada: Anim = {
  // emerge do fundo de areia, acende os faróis, piloto buzina na alavanca
  frames: 36, loop: false,
  keys: {
    root: [pk(0, [0, -3.2, 0]), pk(0.4, [0, 0.15, 0], 'out'), pk(0.5, [0, 0, 0], 'inOut'), pk(1, [0, 0, 0])],
    ...tentPose([0, 1, 2, 3, 4, 5], [[0, [40, 10, 10, 10]], [0.4, [40, 10, 10, 10]], [0.55, [-20, -20, -20, 20], 'out'], [0.7, [0, 0, 0, 0]], [1, [0, 0, 0, 0]]]),
    lidR: [rx(0, 90), rx(0.55, 90), rx(0.6, -10), rx(0.66, 70), rx(0.72, 0), rx(1, 0)],
    lidL: [rx(0, 90), rx(0.55, 90), rx(0.6, -10), rx(0.66, 70), rx(0.72, 0), rx(1, 0)],
    pArmR: [rz(0, 40), rz(0.7, 40), rz(0.76, 120, 'back'), rz(0.9, 120), rz(1, 0)],
    pChest: [rz(0, 0), rz(0.7, 0), rz(0.76, -10), rz(0.9, -10), rz(1, 0)],
    pjaw: [rz(0, 0), rz(0.72, 0), rz(0.78, -30), rz(0.92, -30), rz(1, 0)],
    pHat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.76, [0, 0, 0], [0, 0, 0]), k(0.8, [0, 0, -15], [0, 0.06, 0]), k(0.9, [0, 0, 0], [0, 0, 0], 'bounce')],
    mantle: [rz(0, 0), rz(0.5, -6), rz(0.6, 4), rz(0.75, -2), rz(1, 0)],
    ...bubbleRise(3),
  },
};

const ataque1: Anim = {
  // pancada: os dois tentáculos da frente sobem e esmagam à frente
  frames: 22, loop: false,
  keys: {
    ...tentWave(4, 1),
    ...tentPose([0, 3], [[0, [0, 0, 0, 0]], [0.35, [90, 30, 10, -20], 'out'], [0.5, [-30, -20, -10, 10], 'in'], [0.7, [-30, -20, -10, 10]], [1, [0, 0, 0, 0]]]),
    hull: [pk(0, [0, 0, 0]), pk(0.35, [-0.1, 0.25, 0], 'out'), pk(0.5, [0.25, -0.15, 0], 'in'), pk(0.7, [0.25, -0.15, 0]), pk(1, [0, 0, 0])],
    mantle: [rz(0, 0), rz(0.35, 8), rz(0.5, -12), rz(0.7, -12), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.3, 20), rx(0.7, 20), rx(1, 0)], lidL: [rx(0, 0), rx(0.3, 20), rx(0.7, 20), rx(1, 0)],
    leverR: [rz(0, 0), rz(0.35, -40), rz(0.5, 40), rz(1, 0)], pArmR: [rz(0, 0), rz(0.35, -30), rz(0.5, 30), rz(1, 0)],
    pjaw: [rz(0, 0), rz(0.45, -24), rz(0.75, -24), rz(1, 0)],
  },
};

const ataque2: Anim = {
  // sucção: aponta os bocais para frente e puxa tudo (bocais pulsam)
  frames: 24, loop: false,
  keys: {
    ...tentPose([0, 1, 3, 4], [[0, [0, 0, 0, 0]], [0.25, [55, 15, 10, -30]], [0.85, [55, 15, 10, -30]], [1, [0, 0, 0, 0]]]),
    ...tentPose([2, 5], [[0, [0, 0, 0, 0]], [0.25, [-10, -10, 0, 0]], [1, [0, 0, 0, 0]]]),
    ...Object.fromEntries([0, 1, 3, 4].map((i) => [`t${i}_4`, [sk(0, 1), sk(0.25, 1), sk(0.35, [1, 1.4, 1.4]), sk(0.45, 1), sk(0.55, [1, 1.4, 1.4]), sk(0.65, 1), sk(0.75, [1, 1.4, 1.4]), sk(0.85, 1), sk(1, 1)].map((kk) => kk).concat([rz(0, 0), rz(0.25, -30), rz(0.85, -30), rz(1, 0)])])),
    mantle: [rz(0, 0), rz(0.25, -10), rz(0.85, -10), rz(1, 0)],
    hull: jitter([0.02, 0.02, 0], 0.25, 0.85, 12),
    leverR: [rz(0, 0), rz(0.25, -50), rz(0.85, -50), rz(1, 0)], leverL: [rz(0, 0), rz(0.25, -50), rz(0.85, -50), rz(1, 0)],
    pArmR: [rz(0, 0), rz(0.25, -40), rz(0.85, -40), rz(1, 0)], pArmL: [rz(0, 0), rz(0.25, -40), rz(0.85, -40), rz(1, 0)],
    pChest: [rz(0, 0), rz(0.25, 14), rz(0.85, 14), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.25, -15), rx(0.85, -15), rx(1, 0)], lidL: [rx(0, 0), rx(0.25, -15), rx(0.85, -15), rx(1, 0)],
  },
};

const ataque3: Anim = {
  // salto esmagador: encolhe, pula e cai abrindo os tentáculos
  frames: 24, loop: false,
  keys: {
    root: [pk(0, [0, 0, 0]), pk(0.2, [0, -0.25, 0], 'out'), pk(0.5, [0.3, 1.4, 0], 'out'), pk(0.7, [0.5, 0, 0], 'in'), pk(0.78, [0.5, -0.15, 0], 'out'), pk(1, [0, 0, 0])],
    ...tentPose([0, 1, 2, 3, 4, 5], [[0, [0, 0, 0, 0]], [0.2, [30, 20, 20, -20]], [0.5, [60, 30, 20, 0]], [0.7, [-30, -10, 0, 40], 'in'], [0.8, [-40, -10, 10, 50]], [1, [0, 0, 0, 0]]]),
    mantle: [rz(0, 0), rz(0.2, 6), rz(0.5, -6), rz(0.75, 4), rz(1, 0)],
    pilot: [pk(0, [0, 0, 0]), pk(0.5, [0, -0.06, 0]), pk(0.72, [0, 0.1, 0], 'out'), pk(0.85, [0, 0, 0], 'bounce')],
    pHat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.72, [0, 0, 0], [0, 0, 0]), k(0.78, [0, 0, 25], [0, 0.1, 0]), k(0.92, [0, 0, 0], [0, 0, 0], 'bounce')],
    lidR: [rx(0, 0), rx(0.5, -20), rx(0.75, 60), rx(1, 0)], lidL: [rx(0, 0), rx(0.5, -20), rx(0.75, 60), rx(1, 0)],
    plidR: [rx(0, 0), rx(0.5, -30), rx(0.75, 70), rx(1, 0)], plidL: [rx(0, 0), rx(0.5, -30), rx(0.75, 70), rx(1, 0)],
  },
};

const vulneravel: Anim = {
  // pane: tentáculos moles, vapor vazando, válvulas girando, piloto apertando botões em pânico
  frames: 24, loop: true,
  keys: {
    hull: [pk(0, [0, -0.35, 0]), pk(1, [0, -0.35, 0])],
    mantle: wave([0, 0, 3], 2, 0, [0, 0, 10]),
    ...tentWave(3, 1, (i, j) => [0, 26, 14, 8, -20][j]),
    valve1: wave([0, 0, 30], 1, 0, [0, 0, 0]), valve2: wave([0, 0, 40], 1, 0.3), valve3: wave([0, 0, 35], 1, 0.6),
    steam: [...show([[0, 1]], 0), ...waveS3()],
    lidR: [rx(0, 50), rx(0.4, 35), rx(0.5, 60), rx(1, 50)], lidL: [rx(0, 40), rx(1, 40)],
    pArmR: wave([0, 0, 50], 4, 0, [0, 0, 0]), pArmL: wave([0, 0, 50], 4, 0.5, [0, 0, 0]),
    phead: wave([0, 0, 8], 2, 0.2),
    pjaw: wave([0, 0, -10], 4, 0, [0, 0, -16]),
    pChest: jitter([0.01, 0.01, 0], 0, 1, 12),
  },
};
function waveS3(): Key[] { return [sk(0, 1000), sk(0.5, 1150), sk(1, 1000)]; }

const dano: Anim = {
  frames: 10, loop: false,
  keys: {
    hull: [pk(0, [0, 0, 0]), pk(0.2, [-0.3, 0.1, 0], 'out'), pk(1, [-0.08, 0, 0])],
    mantle: [rz(0, 0), rz(0.2, 14), rz(1, 3)],
    ...tentPose([0, 1, 2, 3, 4, 5], [[0, [0, 0, 0, 0]], [0.2, [30, 20, 20, 20]], [1, [0, 0, 0, 0]]]),
    pilot: [pk(0, [0, 0, 0]), pk(0.2, [0.12, 0.05, 0], 'out'), pk(1, [0, 0, 0])],
    phead: [rz(0, 0), rz(0.2, -20), rz(0.6, 10), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.15, 80), rx(0.6, 80), rx(1, 0)], lidL: [rx(0, 0), rx(0.15, 80), rx(0.6, 80), rx(1, 0)],
    plidR: [rx(0, 0), rx(0.15, 80), rx(0.7, 80), rx(1, 0)], plidL: [rx(0, 0), rx(0.15, 80), rx(0.7, 80), rx(1, 0)],
    pHat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 30], [0, 0.08, 0]), k(0.8, [0, 0, 0], [0, 0, 0], 'bounce')],
  },
};

const furia: Anim = {
  // alerta vermelho: chacoalha, tentáculos se debatem, bolhas em rajada
  frames: 24, loop: false,
  keys: {
    hull: jitter([0.04, 0.04, 0], 0.1, 0.9, 16),
    mantle: [rz(0, 0), rz(0.15, -8), rz(0.85, -8), rz(1, 0)],
    ...tentWave(28, 3),
    prop: [rx(0, 0), rx(1, 1080, 'linear')],
    lidR: [rx(0, 0), rx(0.15, 25), rx(0.85, 25), rx(1, 0)], lidL: [rx(0, 0), rx(0.15, 25), rx(0.85, 25), rx(1, 0)],
    eyes: [sk(0, 1), sk(0.15, 1.15), sk(0.85, 1.15), sk(1, 1)],
    leverR: wave([0, 0, 45], 4), leverL: wave([0, 0, 45], 4, 0.5),
    pArmR: wave([0, 0, 40], 4), pArmL: wave([0, 0, 40], 4, 0.5),
    pjaw: [rz(0, 0), rz(0.15, -30), rz(0.85, -30), rz(1, 0)],
    pmustR: wave([25, 0, 0], 4), pmustL: wave([-25, 0, 0], 4),
    ...bubbleRise(6),
  },
};

const derrota: Anim = {
  // tentáculos murcham, casco tomba e afunda; o domo abre e o piloto acena bandeira branca
  frames: 36, loop: false,
  keys: {
    hull: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, -12], [0, -0.9, 0], 'in'), k(0.45, [0, 0, -8], [0, -0.75, 0], 'out'), k(0.55, [0, 0, -14], [0, -1.3, 0], 'in'), k(1, [0, 0, -14], [0, -1.3, 0])],
    ...tentPose([0, 1, 2, 3, 4, 5], [[0, [0, 0, 0, 0]], [0.35, [8, 30, 20, -20], 'in'], [0.55, [12, 44, 32, -32]], [1, [12, 44, 32, -32]]]),
    lidR: [rx(0, 0), rx(0.3, 50), rx(0.5, 90), rx(1, 90)], lidL: [rx(0, 0), rx(0.3, 50), rx(0.5, 90), rx(1, 90)],
    hatch: [rz(0, 0), rz(0.55, 0), rz(0.68, 75, 'back'), rz(1, 70)],
    pilot: [pk(0, [0, 0, 0]), pk(0.6, [0, 0, 0]), pk(0.72, [0, 0.38, 0], 'out'), pk(1, [0, 0.34, 0])],
    pArmR: [rz(0, 0), rz(0.68, 0), rz(0.75, 150), rz(0.8, 130), rz(0.85, 160), rz(0.9, 130), rz(0.95, 160), rz(1, 140)],
    pjaw: [rz(0, 0), rz(0.7, -12), rz(1, -12)],
    plidR: [rx(0, 0), rx(0.7, 30), rx(1, 30)], plidL: [rx(0, 0), rx(0.7, 30), rx(1, 30)],
    pmustR: [rx(0, 0), rx(0.7, -30), rx(1, -30)], pmustL: [rx(0, 0), rx(0.7, 30), rx(1, 30)],
    steam: show([[0.2, 0.6]]),
    flag: show([[0.72, 1]], 0.01),
    ...bubbleRise(3),
  },
};

export const polvoDraga: ModelDef = {
  id: 'polvo-draga',
  kind: 'boss',
  build,
  anims: { idle, entrada, ataque1, ataque2, ataque3, vulneravel, dano, furia, derrota },
  cell: [680, 560],
  pivot: [320, 520],
  height: 560 / 104,
  presets: ['recife', 'neutro'],
};
