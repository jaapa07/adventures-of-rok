/**
 * BARÃO JAVARDO — chefe final (Mundo 4).
 * Robô-escavadeira gigante (~5 u) sobre esteiras, pintado de vermelho-industrial com faixas de perigo,
 * faróis-olhos, para-choque em forma de BIGODE, grade-boca, chaminés gêmeas, braço de caçamba (perto)
 * e braço-broca (longe). No topo, a cabine de vidro aberta em cima — a cartola do Barão não cabe.
 * Barão: javali gordo de fraque, gravata-borboleta, corrente de relógio, monóculo e bigode enorme.
 * Extras: disfarce (fantasia de árvore muito mal feita, bigode aparecendo), revelar,
 * estagio2 (sem o braço de caçamba, faíscas), estagio3 (só a cabine, pulando num pula-pula de mola).
 */
import { Rig, blob, tube, slab, lathe, ring, roundBox, spike, eye, mat, taper, pull, bulge, wobble, flattenBelow, THREE, type V3, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import type { Anim, Key } from '../../render/anim';
import { boarHead } from './javali';
import { rivets, sparks, puff } from './parts';
import { k, rz, rx, ry, pk, sk, blink, wave, waveP, waveS, jitter, show, HIDDEN, SHOW } from '../../anims/bosses/kit';

const C = {
  red: 0xb8382a, redDark: 0x7a2018, yellow: 0xf0b428, steel: 0x8e969c, steelDark: 0x4a5056, rubber: 0x1e1e20,
  fur: 0x8a6250, furDark: 0x4e3428, snout: 0xd09080, coat: 0x2a2234, shirt: 0xf2eee4, gold: 0xe0b445,
  bark: 0x7a5232, leaf: 0x3e8a2e, leafDark: 0x2a6a22,
};

function build() {
  const r = new Rig('root');
  const red = mat('paint', C.red, { rough: 0.5 });
  const redDark = mat('paint', C.redDark, { rough: 0.55 });
  const yellow = mat('paint', C.yellow, { rough: 0.45 });
  const black = mat('paint', 0x18181a, { rough: 0.5 });
  const steel = mat('metal', C.steel, { metal: 0.5, rough: 0.35 });
  const steelDark = mat('metal', C.steelDark, { metal: 0.5, rough: 0.45 });
  const rust = mat('rust', 0x7a4024);
  const rubber = mat('rubber', C.rubber);
  const glass = mat('glass', 0xc8ecff, { opacity: 0.28 });
  const glassRim = mat('glass', 0xffffff, { opacity: 0.6 });
  const gold = mat('metal', C.gold, { metal: 0.5, rough: 0.25 });

  /* ---------- esqueleto ---------- */
  r.bone('mech', 'root', [0, 0, 0]);
  r.bone('treads', 'mech', [0, 0, 0]);
  r.bone('cleatsTop', 'treads', [0, 0, 0]);
  r.bone('cleatsBot', 'treads', [0, 0, 0]);
  r.bone('waist', 'mech', [0, 0.85, 0], [0, -32, 0]);
  r.bone('waistGeo', 'waist', [0, 0, 0]);
  r.bone('torso', 'waist', [0, 0.25, 0]);
  r.bone('torsoGeo', 'torso', [0, 0, 0]);
  r.bone('grill', 'torsoGeo', [0.98, 0.5, 0]);
  r.bone('stack1', 'torsoGeo', [-0.75, 1.75, 0.4]);
  r.bone('stack2', 'torsoGeo', [-0.75, 1.75, -0.4]);
  r.bone('smoke1', 'stack1', [-0.05, 0.75, 0]);
  r.bone('smoke2', 'stack2', [-0.05, 0.75, 0]);
  r.bone('armR_up', 'torso', [0.3, 1.3, 1.05], [0, 0, 72]);
  r.bone('armR_lo', 'armR_up', [0, -1.35, 0], [0, 0, -84]);
  r.bone('bucket', 'armR_lo', [0, -1.15, 0], [0, 0, 10]);
  r.bone('armL_up', 'torso', [0.3, 1.3, -1.05], [0, 0, 58]);
  r.bone('armL_lo', 'armL_up', [0, -1.35, 0], [0, 0, -68]);
  r.bone('drill', 'armL_lo', [0, -1.1, 0], [0, 0, 0]);
  r.bone('drillBit', 'drill', [0, -0.2, 0]);
  r.bone('stump', 'torso', [0.3, 1.3, 1.05]);
  r.bone('cabin', 'torso', [0.05, 1.72, 0]);
  r.bone('pogo', 'cabin', [0, 0, 0]);
  r.bone('baron', 'cabin', [-0.05, 0.22, 0]);
  r.bone('bChest', 'baron', [0, 0.32, 0]);
  boarHead(r, 'bChest', { prefix: 'b', scale: 0.95, pos: [0.08, 0.5, 0], rot: [0, 0, 4], fur: C.fur, furDark: C.furDark, snout: C.snout, mustache: 'barao', mustacheColor: 0x3a2a22, angry: 14, lid: 0.3, tusks: 0.8, iris: 0x2a5a2a, look: [0.7, -0.1] });
  r.bone('hat', 'bhead', [-0.04, 0.27, 0], [0, 0, 6]);
  r.bone('bArmR', 'bChest', [0.05, 0.18, 0.36], [0, 0, 30]);
  r.bone('bArmL', 'bChest', [0.05, 0.18, -0.36], [0, 0, 30]);
  r.bone('bHandR', 'bArmR', [0, -0.34, 0]);
  r.bone('bHandL', 'bArmL', [0, -0.34, 0]);
  r.bone('sweat', 'bhead', [0.0, 0.25, 0.25]);
  r.bone('costume', 'torso', [0, 0, 0]);
  r.bone('cLidR', 'costume', [0, 0, 0]);
  r.bone('cMust', 'costume', [1.17, 2.05, 0]);
  r.bone('boom', 'torso', [0, 0.9, 0]);
  r.anchor('head', 'bhead', [0, 0.85, 0]);
  r.anchor('hand', 'bucket', [0.5, -0.4, 0]);
  r.anchor('handL', 'drillBit', [0, -0.6, 0]);
  for (const b of ['costume', 'stump', 'pogo', 'boom', 'sweat', 'smoke1', 'smoke2']) r.bones[b].scale.setScalar(HIDDEN);
  // fantasia larga o bastante para engolir o robô (só o bigode e a cartola escapam)
  r.bones.costume.scale.set(HIDDEN * 1.22, HIDDEN * 1.05, HIDDEN * 1.22);

  /* ---------- esteiras ---------- */
  for (const z of [0.82, -0.82]) {
    const loop: V3[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      let x: number, y: number;
      if (t < 0.35) { x = -1.25 + (t / 0.35) * 2.5; y = 0.8; }
      else if (t < 0.5) { const a = Math.PI / 2 - ((t - 0.35) / 0.15) * Math.PI; x = 1.25 + Math.cos(a) * 0.38; y = 0.42 + Math.sin(a) * 0.38; }
      else if (t < 0.85) { x = 1.25 - ((t - 0.5) / 0.35) * 2.5; y = 0.04; }
      else { const a = -Math.PI / 2 - ((t - 0.85) / 0.15) * Math.PI; x = -1.25 + Math.cos(a) * 0.38; y = 0.42 + Math.sin(a) * 0.38; }
      loop.push([x, y, z]);
    }
    r.add('treads',
      tube(loop, 0.06, rubber, { seg: 120, radial: 10, closed: true, scale: [1, 1, 1], deform: [] }),
      ...[0.14, 0, -0.14].map((dz) => tube(loop.map(([x, y]) => [x, y, z + dz] as V3), 0.045, rubber, { seg: 120, radial: 8, closed: true })),
      // rodas
      ...[-1.25, -0.42, 0.42, 1.25].map((x, i) => lathe([[0.001, -0.18], [i % 3 === 0 ? 0.32 : 0.26, -0.18], [i % 3 === 0 ? 0.34 : 0.28, -0.12], [i % 3 === 0 ? 0.34 : 0.28, 0.12], [i % 3 === 0 ? 0.32 : 0.26, 0.18], [0.001, 0.18]], steelDark, { pos: [x, 0.42, z], rot: [90, 0, 0] })),
      ...[-1.25, -0.42, 0.42, 1.25].map((x) => blob([0.1, 0.1, 0.06], yellow, { pos: [x, 0.42, z + Math.sign(z) * 0.2] })),
      // chapa lateral
      slab([[-1.0, 0.3], [1.0, 0.3], [1.15, 0.55], [1.0, 0.72], [-1.0, 0.72], [-1.15, 0.55]], 0.06, red, { pos: [0, 0, z + Math.sign(z) * 0.24], smooth: false, bevel: 0.03 }),
      slab([[-0.6, 0.0], [0.6, 0.0], [0.55, 0.06], [-0.55, 0.06]], 0.02, yellow, { pos: [0, 0.6, z + Math.sign(z) * 0.29], smooth: false, bevel: 0.01 }),
      ...rivets([-0.9, -0.45, 0, 0.45, 0.9].map((x) => [x, 0.4, z + Math.sign(z) * 0.29] as V3), 0.03),
    );
    for (const [b, y, d] of [['cleatsTop', 0.86, 1], ['cleatsBot', -0.02, -1]] as const) {
      r.add(b, ...Array.from({ length: 13 }, (_, i) => roundBox([0.08, 0.05, 0.5], 0.02, mat('metal', 0x3a3e42, { metal: 0.5, rough: 0.5 }), { pos: [-1.2 + i * 0.2, y, z] })));
      void d;
    }
  }
  r.add('treads', roundBox([2.4, 0.3, 1.3], 0.08, steelDark, { pos: [0, 0.55, 0] }));

  /* ---------- cintura giratória ---------- */
  r.add('waistGeo',
    lathe([[0.001, 0], [0.85, 0], [0.9, 0.06], [0.85, 0.2], [0.75, 0.25], [0.001, 0.25]], steelDark, {}),
    ...rivets(Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [Math.cos(a) * 0.86, 0.12, Math.sin(a) * 0.86] as V3; }), 0.03),
  );

  /* ---------- tronco do robô (barrigudo, como o dono) ---------- */
  r.add('torsoGeo',
    roundBox([1.9, 1.75, 1.6], 0.32, red, { pos: [0, 0.88, 0], deform: [bulge([0.6, 0.4, 0], 0.9, 0.18), taper('y', 0, 1.75, 1.04, 0.92)] }),
    // faixa de perigo diagonal
    ...Array.from({ length: 7 }, (_, i) => slab([[-0.08, -0.13], [0.04, -0.13], [0.08, 0.13], [-0.04, 0.13]], 0.02, i % 2 ? black : yellow, { pos: [-0.75 + i * 0.16, 0.2, 0.83], smooth: false, bevel: 0.006 })),
    // chapas parafusadas e ferrugem
    roundBox([0.7, 0.55, 0.06], 0.05, redDark, { pos: [-0.35, 1.05, 0.81] }),
    ...rivets([[-0.65, 1.28, 0.85], [-0.05, 1.28, 0.85], [-0.65, 0.82, 0.85], [-0.05, 0.82, 0.85]], 0.035),
    blob([0.22, 0.16, 0.05], rust, { pos: [0.35, 1.4, 0.8], deform: [wobble(0.02, 9)] }),
    blob([0.14, 0.08, 0.04], rust, { pos: [-0.6, 0.5, 0.82], deform: [wobble(0.02, 9)] }),
    // emblema: javali dourado (focinho + presas)
    blob([0.16, 0.16, 0.04], gold, { pos: [0.2, 0.65, 0.83] }),
    blob([0.07, 0.05, 0.03], gold, { pos: [0.3, 0.6, 0.86] }),
    // ombreiras
    blob([0.4, 0.34, 0.34], redDark, { pos: [0.3, 1.32, 0.86] }),
    blob([0.4, 0.34, 0.34], redDark, { pos: [0.3, 1.32, -0.86] }),
    // para-choque-bigode de aço
    tube([[1.0, 0.92, 0], [1.08, 0.85, 0.25], [1.03, 0.92, 0.55], [0.92, 1.1, 0.7], [0.9, 1.2, 0.62]], (t) => 0.1 * Math.sin(Math.min(t * 1.2 + 0.2, 1) * Math.PI * 0.95) + 0.02, steel, { seg: 30 }),
    tube([[1.0, 0.92, 0], [1.08, 0.85, -0.25], [1.03, 0.92, -0.55], [0.92, 1.1, -0.7], [0.9, 1.2, -0.62]], (t) => 0.1 * Math.sin(Math.min(t * 1.2 + 0.2, 1) * Math.PI * 0.95) + 0.02, steel, { seg: 30 }),
    // moldura da grade-boca
    roundBox([0.12, 0.5, 1.0], 0.06, steelDark, { pos: [0.98, 0.5, 0] }),
  );
  // faróis-olhos
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 1 : -1;
    const g = new THREE.Group();
    g.position.set(0.98, 1.32, 0.4 * z);
    g.rotation.y = z > 0 ? 1.15 : 0.5;
    g.add(ring(0.21, 0.05, steel, {}));
    const e = eye({ r: 0.2, iris: 0xff3010, irisScale: 0.5, look: [0.5, -0.2], lid: 0.42, lidColor: 0x6a7076, angry: 26 });
    (e.children[1] as THREE.Mesh).material = mat('glow', 0xff4020, { emissive: 0xff2000, emissiveIntensity: 1.2 });
    g.add(e);
    g.add(roundBox([0.5, 0.09, 0.1], 0.04, steelDark, { pos: [0, 0.25, 0.08], rot: [0, 0, z > 0 ? -18 : 18] }));
    r.add('torsoGeo', g);
    r.bones[`lid${s}`] = e.getObjectByName('lid')!;
  }
  // grade-boca (mandíbula)
  r.add('grill',
    roundBox([0.1, 0.38, 0.86], 0.04, black, { pos: [0.02, 0, 0] }),
    ...Array.from({ length: 7 }, (_, i) => roundBox([0.06, 0.34, 0.05], 0.02, steel, { pos: [0.07, 0, -0.36 + i * 0.12] })),
    ...Array.from({ length: 6 }, (_, i) => spike(0.1, 0.035, steel, { pos: [0.09, -0.18, -0.3 + i * 0.12], rot: [0, 0, 180] })),
  );
  // chaminés gêmeas
  for (const b of ['stack1', 'stack2']) {
    r.add(b,
      lathe([[0.16, -0.2], [0.14, 0.0], [0.13, 0.55], [0.17, 0.62], [0.18, 0.72], [0.15, 0.72]], steelDark, {}),
      ring(0.14, 0.025, rust, { pos: [0, 0.3, 0], rot: [90, 0, 0] }),
    );
  }
  r.add('smoke1', puff(0.45, 0x5a5452));
  r.add('smoke2', puff(0.4, 0x6a6462));

  /* ---------- braço de caçamba (perto) ---------- */
  const boom = (len: number, w: number) => [
    roundBox([w, len, w * 0.85], w * 0.25, yellow, { pos: [0, -len / 2, 0], deform: [bulge([0, -len * 0.25, 0], len * 0.35, 0.05)] }),
    blob([w * 0.62, w * 0.62, w * 0.62], steelDark, {}),
    // pistão hidráulico
    tube([[w * 0.55, -0.15, 0], [w * 0.62, -len * 0.55, 0]], 0.07, steelDark, { seg: 6, radial: 10 }),
    tube([[w * 0.62, -len * 0.55, 0], [w * 0.55, -len * 0.92, 0]], 0.045, mat('metal', 0xd8dde2, { metal: 0.5, rough: 0.2 }), { seg: 6, radial: 10 }),
    // mangueiras
    tube([[-w * 0.5, -0.1, 0.1], [-w * 0.7, -len * 0.5, 0.12], [-w * 0.5, -len * 0.95, 0.1]], 0.03, rubber, { seg: 16, radial: 6 }),
    slab([[-0.04, -0.15], [0.04, -0.15], [0.04, 0.15], [-0.04, 0.15]], 0.01, black, { pos: [0, -len * 0.45, w * 0.44], smooth: false, bevel: 0.005 }),
  ];
  r.add('armR_up', ...boom(1.35, 0.42));
  r.add('armR_lo', ...boom(1.15, 0.34));
  const sideD: V2[] = [[-0.05, 0.12], [0.38, 0.12], [0.66, -0.12], [0.74, -0.45], [0.66, -0.7], [0.12, -0.62], [-0.08, -0.25]];
  r.add('bucket',
    slab(sideD, 0.05, yellow, { pos: [-0.1, 0, 0.36], smooth: true, bevel: 0.02 }),
    slab(sideD, 0.05, yellow, { pos: [-0.1, 0, -0.36], smooth: true, bevel: 0.02 }),
    // fundo curvo e interior escuro
    tube([[-0.12, 0.08, 0], [0.3, 0.1, 0], [0.6, -0.1, 0], [0.66, -0.45, 0], [0.58, -0.66, 0]], 0.04, yellow, { seg: 24, scale: [1, 1, 1] }),
    slab([[0.0, 0.06], [0.35, 0.06], [0.58, -0.12], [0.64, -0.45], [0.56, -0.62], [0.16, -0.56], [0.0, -0.25]], 0.66, mat('paint', 0x2a2a2c, { rough: 0.7 }), { pos: [-0.1, 0, 0], bevel: 0.01 }),
    roundBox([0.12, 0.08, 0.82], 0.03, steel, { pos: [0.3, -0.68, 0], rot: [0, 0, -8] }),
    ...[-0.3, -0.1, 0.1, 0.3].map((z) => spike(0.2, 0.06, steel, { pos: [0.32, -0.72, z], rot: [0, 0, 160], curve: -0.2 })),
    blob([0.15, 0.15, 0.46], steelDark, { pos: [0, 0, 0] }),
  );
  /* ---------- braço-broca (longe) ---------- */
  r.add('armL_up', ...boom(1.35, 0.42));
  r.add('armL_lo', ...boom(1.1, 0.34));
  r.add('drill',
    lathe([[0.3, 0.05], [0.34, -0.05], [0.32, -0.2], [0.2, -0.24]], yellow, {}),
  );
  r.add('drillBit',
    lathe([[0.26, 0], [0.22, -0.2], [0.15, -0.45], [0.07, -0.7], [0.001, -0.85]], steel, {}),
    tube(Array.from({ length: 25 }, (_, i) => { const t = i / 24; const a = t * Math.PI * 7; const rr = 0.26 * (1 - t) + 0.02; return [Math.cos(a) * rr, -t * 0.82, Math.sin(a) * rr] as V3; }), (t) => 0.035 * (1 - t) + 0.008, steelDark, { seg: 120, radial: 6 }),
  );
  /* ---------- toco do braço arrancado (estágio 2) ---------- */
  r.add('stump',
    blob([0.3, 0.3, 0.3], steelDark, { deform: [wobble(0.04, 7)] }),
    ...[[0.3, -0.5, 0.1, 0xd02020], [0.1, -0.6, 0.2, 0x2050d0], [-0.15, -0.45, 0.05, 0xf0c020]].map(([x, y, z, c]) => tube([[0, 0, 0.1], [x * 0.5, y * 0.4, z], [x, y, z * 0.6]], 0.03, mat('rubber', c), { seg: 12, radial: 6 })),
    sparks(0.5, { pos: [0.25, -0.5, 0.15] }),
    sparks(0.35, { pos: [0.0, -0.1, 0.3], rot: [0, 0, 60] }),
  );

  /* ---------- cabine (aberta em cima: a cartola não cabe) ---------- */
  r.add('cabin',
    lathe([[0.001, -0.05], [0.72, -0.05], [0.8, 0.05], [0.8, 0.22], [0.76, 0.28], [0.001, 0.28]], steelDark, {}),
    ring(0.77, 0.05, yellow, { pos: [0, 0.25, 0], rot: [90, 0, 0] }),
    lathe([[0.76, 0.26], [0.76, 0.5], [0.72, 0.8], [0.6, 1.05], [0.42, 1.18], [0.4, 1.2]], glass, { seg: 40 }),
    ring(0.41, 0.035, steel, { pos: [0, 1.2, 0], rot: [90, 0, 0] }),
    tube([[0.55, 0.6, 0.45], [0.62, 0.85, 0.3], [0.55, 1.0, 0.15]], 0.025, glassRim, { seg: 10, radial: 6, castShadow: false }),
    ...rivets(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return [Math.cos(a) * 0.8, 0.14, Math.sin(a) * 0.8] as V3; }), 0.028),
    // painel de alavancas
    roundBox([0.2, 0.3, 0.6], 0.05, steelDark, { pos: [0.5, 0.42, 0], rot: [0, 0, 18] }),
    blob([0.03, 0.03, 0.02], mat('glow', 0xff3030), { pos: [0.6, 0.55, 0.15] }),
    blob([0.03, 0.03, 0.02], mat('glow', 0x40ff60), { pos: [0.6, 0.55, -0.1] }),
  );
  // pula-pula de mola (estágio 3)
  const coil: V3[] = Array.from({ length: 49 }, (_, i) => { const t = i / 48; const a = t * Math.PI * 12; return [Math.cos(a) * 0.3, -t * 0.7, Math.sin(a) * 0.3] as V3; });
  r.add('pogo',
    tube(coil, 0.04, steel, { seg: 200, radial: 6 }),
    lathe([[0.001, -0.82], [0.45, -0.82], [0.5, -0.76], [0.42, -0.7], [0.001, -0.7]], rubber, {}),
  );

  /* ---------- o Barão ---------- */
  const coat = mat('cloth', C.coat, { repeat: 3 });
  const shirt = mat('cloth', C.shirt, { repeat: 3 });
  const fur = mat('fur', C.fur, { repeat: 2 });
  r.add('baron', blob([0.42, 0.3, 0.42], coat, { pos: [0, 0.15, 0], deform: [flattenBelow(-0.1, 0.8)] }));
  r.add('bChest',
    blob([0.44, 0.42, 0.44], coat, { pos: [0, 0.1, 0], deform: [bulge([0.35, -0.05, 0], 0.35, 0.08), taper('y', -0.42, 0.42, 1.08, 0.8)] }),
    blob([0.26, 0.34, 0.3], shirt, { pos: [0.24, 0.1, 0], deform: [pull([0.2, -0.1, 0], 0.25, [0.06, 0, 0])] }),
    // colete dourado e botões
    ...[0.22, 0.08, -0.06].map((y) => blob([0.03, 0.03, 0.02], gold, { pos: [0.48, y, 0.0] })),
    // gravata-borboleta
    slab([[0, 0], [0.1, 0.07], [0.1, -0.07]], 0.04, mat('cloth', 0xc02030), { pos: [0.38, 0.38, 0.03], rot: [0, 90, 0] }),
    slab([[0, 0], [0.1, 0.07], [0.1, -0.07]], 0.04, mat('cloth', 0xc02030), { pos: [0.38, 0.38, -0.03], rot: [0, -90, 0] }),
    blob([0.04, 0.04, 0.04], mat('cloth', 0x901020), { pos: [0.4, 0.38, 0] }),
    // corrente do relógio
    tube([[0.42, 0.05, 0.12], [0.47, -0.05, 0.2], [0.4, -0.1, 0.32]], 0.012, gold, { seg: 10, radial: 5 }),
    blob([0.05, 0.05, 0.02], gold, { pos: [0.38, -0.12, 0.35], rot: [0, 40, 0] }),
    // lapelas
    slab([[0, 0.3], [0.12, 0.25], [0.04, -0.1]], 0.02, coat, { pos: [0.3, 0.05, 0.2], rot: [0, 40, 0] }),
    slab([[0, 0.3], [0.12, 0.25], [0.04, -0.1]], 0.02, coat, { pos: [0.3, 0.05, -0.2], rot: [0, -40, 0] }),
  );
  // monóculo no olho direito (perto da câmera)
  r.add('bhead',
    ring(0.1, 0.014, gold, { pos: [0.24, 0.07, 0.16], rot: [0, 32, 0] }),
    blob([0.095, 0.095, 0.01], mat('glass', 0xe8f8ff, { opacity: 0.35 }), { pos: [0.245, 0.07, 0.165], rot: [0, 32, 0], castShadow: false }),
    tube([[0.2, -0.02, 0.24], [0.15, -0.2, 0.3], [0.05, -0.35, 0.3]], 0.006, gold, { seg: 12, radial: 4 }),
  );
  r.add('hat',
    lathe([[0.001, 0.0], [0.34, 0.0], [0.36, 0.02], [0.3, 0.04], [0.22, 0.04], [0.21, 0.1], [0.22, 0.45], [0.23, 0.5], [0.001, 0.5]], mat('cloth', 0x141418, { rough: 0.6 }), { scale: [1, 1, 0.92] }),
    lathe([[0.215, 0.06], [0.22, 0.06], [0.225, 0.16], [0.218, 0.16]], mat('cloth', 0x8a1a2a), { scale: [1.02, 1, 0.94] }),
  );
  r.add('sweat', ...[[0, 0, 0], [0.1, -0.06, 0.04]].map((p) => lathe([[0.001, 0.05], [0.025, 0.0], [0.03, -0.03], [0.02, -0.05], [0.001, -0.055]], mat('glass', 0xa8e0ff, { opacity: 0.8 }), { pos: p as V3 })));
  for (const s of ['L', 'R'] as const) {
    r.add(`bArm${s}`, tube([[0, 0, 0], [0.02, -0.18, 0], [0, -0.34, 0]], (t) => 0.1 - t * 0.02, coat, { seg: 10 }), ring(0.085, 0.025, shirt, { pos: [0, -0.33, 0], rot: [90, 0, 0] }));
    r.add(`bHand${s}`,
      blob([0.09, 0.08, 0.08], mat('cloth', 0xf6f2ea), { pos: [0.02, -0.04, 0] }),
      blob([0.04, 0.05, 0.035], mat('cloth', 0xf6f2ea), { pos: [0.06, 0.03, s === 'R' ? 0.05 : -0.05] }),
    );
  }

  /* ---------- fantasia de árvore (disfarce) ---------- */
  const bark = mat('bark', C.bark);
  const leaf = mat('leaf', C.leaf);
  const leafDark = mat('leaf', C.leafDark);
  r.add('costume',
    lathe([[1.45, -1.0], [1.35, -0.7], [1.28, 0.2], [1.25, 1.2], [1.18, 2.0], [1.05, 2.6], [0.9, 2.9], [0.001, 3.0]], bark, { seg: 36, deform: [wobble(0.03, 4)] }),
    // costura grosseira e remendo
    tube([[1.3, -0.2, 0.3], [1.28, 0.6, 0.35], [1.25, 1.4, 0.3]], 0.025, mat('cloth', 0xe8d8a0), { seg: 20, radial: 5 }),
    ...[-0.1, 0.25, 0.6, 0.95, 1.3].map((y) => tube([[1.29, y, 0.26], [1.31, y + 0.04, 0.34]], 0.012, mat('cloth', 0xe8d8a0), { seg: 4, radial: 4 })),
    roundBox([0.5, 0.4, 0.04], 0.06, mat('cloth', 0x8a6a3a, { repeat: 2 }), { pos: [-0.2, 0.4, 1.3], rot: [0, 0, 8] }),
    // copa de folhas
    ...[[0, 3.3, 0, 1.1], [0.7, 3.0, 0.5, 0.75], [-0.75, 3.05, 0.4, 0.8], [0.3, 3.0, -0.7, 0.8], [-0.4, 3.75, 0.1, 0.75], [0.5, 3.65, 0.1, 0.7]].map(([x, y, z, s]) => blob([s, s * 0.78, s * 0.9], s > 0.9 ? leafDark : leaf, { pos: [x, y, z], deform: [wobble(0.06, 5)] })),
    // galhos-braços com tufinhos
    tube([[0.6, 1.6, 1.0], [1.1, 1.9, 1.3], [1.5, 2.3, 1.3]], (t) => 0.14 * (1 - t * 0.5), bark, { seg: 16 }),
    blob([0.35, 0.28, 0.3], leaf, { pos: [1.55, 2.4, 1.3], deform: [wobble(0.04, 6)] }),
    tube([[-0.5, 1.4, -1.0], [-1.0, 1.8, -1.2], [-1.4, 2.0, -1.0]], (t) => 0.12 * (1 - t * 0.5), bark, { seg: 16 }),
    // buraco de nó por onde o Barão espia
    ring(0.2, 0.06, mat('bark', 0x5a3a20), { pos: [1.15, 2.2, 0.42], rot: [0, 72, 0] }),
    blob([0.18, 0.18, 0.04], black, { pos: [1.14, 2.2, 0.41], rot: [0, 72, 0] }),
    // folha colada torta (não engana ninguém)
    slab([[0, 0], [0.2, 0.12], [0.35, 0], [0.2, -0.12]], 0.02, leaf, { pos: [0.9, 1.2, 0.95], rot: [0, 40, 30] }),
  );
  const peep = eye({ r: 0.1, iris: 0x2a5a2a, look: [0.3, -0.2], lid: 0.45, lidColor: C.furDark });
  peep.position.set(1.16, 2.22, 0.44); peep.rotation.y = 1.25;
  r.add('costume', peep);
  r.bones.cLid = peep.getObjectByName('lid')!;
  // bigode do Barão escapando por um rasgo na casca
  const mustM = mat('fur', 0x3a2a22, { repeat: 1.5 });
  r.add('cMust',
    blob([0.12, 0.06, 0.32], black, {}),
    tube([[0.05, 0, 0.05], [0.12, -0.03, 0.3], [0.08, 0.02, 0.55], [0.02, 0.16, 0.62], [0.08, 0.2, 0.56]], (t) => 0.06 * Math.sin(Math.min(t * 1.3 + 0.25, 1) * Math.PI * 0.95) + 0.01, mustM, { seg: 30 }),
    tube([[0.05, 0, -0.05], [0.12, -0.03, -0.3], [0.08, 0.02, -0.55], [0.02, 0.16, -0.62], [0.08, 0.2, -0.56]], (t) => 0.06 * Math.sin(Math.min(t * 1.3 + 0.25, 1) * Math.PI * 0.95) + 0.01, mustM, { seg: 30 }),
  );
  /* ---------- explosão (derrota) ---------- */
  r.add('boom', puff(2.2, 0x4a4442), sparks(1.4, { pos: [0.4, 0.4, 0.6] }), sparks(1.1, { pos: [-0.5, 0.8, 0.5], rot: [0, 0, 90] }));
  void pull; void bulge;
  return r;
}

/* ---------------- animações ---------------- */
type KeyMap = Record<string, Key[]>;
const treadRun = (cycles: number, dir = 1): KeyMap => {
  const top: Key[] = [], bot: Key[] = [];
  for (let i = 0; i < cycles; i++) {
    top.push(pk(i / cycles, [0, 0, 0], 'step'), pk((i + 0.999) / cycles, [0.2 * dir, 0, 0], 'linear'));
    bot.push(pk(i / cycles, [0, 0, 0], 'step'), pk((i + 0.999) / cycles, [-0.2 * dir, 0, 0], 'linear'));
  }
  top.push(pk(1, [0, 0, 0], 'step')); bot.push(pk(1, [0, 0, 0], 'step'));
  return { cleatsTop: top, cleatsBot: bot };
};
const lids = (t: number): KeyMap => ({ lidR: blink(t, 50), lidL: blink(t, 50), blidR: blink(t + 0.2, 60), blidL: blink(t + 0.2, 60) });
const smoke = (ranges: [number, number][], b = 'smoke1'): KeyMap => ({ [b]: [...show(ranges, 0.01), ...ranges.flatMap(([a, z]) => [pk(a, [0, 0, 0], 'step'), pk(z, [-0.3, 0.8, 0], 'out')])] });
const hideAll = (bones: string[]): KeyMap => Object.fromEntries(bones.map((b) => [b, [sk(0, HIDDEN), sk(1, HIDDEN)]]));
/** Gestos do Barão: torcer o bigode. */
const twirl = (cycles: number): KeyMap => ({
  bArmR: wave([0, 0, 14], cycles, 0, [0, 0, 120]),
  bHandR: wave([30, 0, 0], cycles * 2, 0),
  bmustR: wave([14, 0, 0], cycles, 0.1),
});

const idle: Anim = {
  frames: 24, loop: true,
  keys: {
    torso: waveP([0, 0.04, 0], 2, 0.25),
    treads: jitter([0, 0.01, 0], 0, 1, 12),
    armR_up: wave([0, 0, 3], 1, 0.2), armL_up: wave([0, 0, 3], 1, 0.5),
    bucket: wave([0, 0, 6], 1, 0.4),
    drillBit: [ry(0, 0), ry(1, 360, 'linear')],
    ...smoke([[0.1, 0.55]]), ...smoke([[0.5, 0.95]], 'smoke2'),
    ...twirl(1),
    bChest: wave([0, 0, 3], 1, 0.3),
    bhead: wave([0, 0, 4], 1, 0.6, [0, 0, 6]),
    bjaw: wave([0, 0, -5], 2, 0, [0, 0, -4]),
    ...lids(0.7),
  },
};

const entrada: Anim = {
  // entra rolando, para com um tranco, flexiona os braços e o Barão gargalha
  frames: 36, loop: false,
  keys: {
    mech: [pk(0, [-2.6, 0, 0]), pk(0.35, [0, 0, 0], 'out'), pk(1, [0, 0, 0])],
    ...treadRun(5),
    torso: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, 0]), k(0.42, [0, 0, -6], [0.1, 0, 0], 'out'), k(0.5, [0, 0, 2], [0, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    armR_up: [rz(0, 0), rz(0.45, 0), rz(0.6, 70, 'back'), rz(0.8, 70), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.45, 0), rz(0.6, -40), rz(0.8, -40), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.5, 0), rz(0.65, 70, 'back'), rz(0.85, 70), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.5, 0), rz(0.65, -40), rz(0.85, -40), rz(1, 0)],
    drillBit: [ry(0, 0), ry(0.6, 0), ry(1, 1080, 'in')],
    grill: [k(0, [0, 0, 0], [0, 0, 0]), k(0.6, [0, 0, 0], [0, 0, 0]), k(0.66, [0, 0, 0], [0, -0.16, 0]), k(0.9, [0, 0, 0], [0, -0.16, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    bChest: [rz(0, 0), rz(0.6, 0), rz(0.65, 14), rz(0.7, 6), rz(0.75, 14), rz(0.8, 6), rz(0.85, 14), rz(1, 0)],
    bjaw: [rz(0, 0), rz(0.6, 0), rz(0.65, -30), rz(0.9, -30), rz(1, 0)],
    bArmR: [rz(0, 0), rz(0.6, 0), rz(0.66, 150), rz(0.9, 150), rz(1, 0)],
    bArmL: [rz(0, 0), rz(0.6, 0), rz(0.66, 150), rz(0.9, 150), rz(1, 0)],
    blidR: [rx(0, 0), rx(0.62, 0), rx(0.66, 60), rx(0.9, 60), rx(1, 0)], blidL: [rx(0, 0), rx(0.62, 0), rx(0.66, 60), rx(0.9, 60), rx(1, 0)],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.65, [0, 0, 0], [0, 0, 0]), k(0.7, [0, 0, -10], [0, 0.12, 0], 'out'), k(0.8, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0], [0, 0, 0])],
    ...smoke([[0.1, 0.45], [0.6, 0.95]]),
  },
};

const ataque1: Anim = {
  // caçambada: ergue o braço de caçamba e esmaga à frente
  frames: 24, loop: false,
  keys: {
    armR_up: [rz(0, 0), rz(0.35, 70, 'out'), rz(0.5, -10, 'in'), rz(0.75, -10), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.35, -30), rz(0.5, 30, 'in'), rz(0.75, 30), rz(1, 0)],
    bucket: [rz(0, 0), rz(0.35, -40), rz(0.5, 30), rz(0.75, 30), rz(1, 0)],
    torso: [k(0, [0, 0, 0], [0, 0, 0]), k(0.35, [0, 0, 8], [0, 0.05, 0]), k(0.5, [0, 0, -10], [0.1, -0.05, 0], 'in'), k(0.75, [0, 0, -10], [0.1, -0.05, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    mech: jitter([0.02, 0.03, 0], 0.5, 0.65, 6),
    bArmR: [rz(0, 0), rz(0.35, -30), rz(0.5, 40), rz(1, 0)], bArmL: [rz(0, 0), rz(0.35, -30), rz(0.5, 40), rz(1, 0)],
    bjaw: [rz(0, 0), rz(0.45, -24), rz(0.8, -24), rz(1, 0)],
    grill: [k(0, [0, 0, 0], [0, 0, 0]), k(0.4, [0, 0, 0], [0, -0.12, 0]), k(0.8, [0, 0, 0], [0, -0.12, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.5, [0, 0, 0], [0, 0, 0]), k(0.55, [0, 0, 16], [0, 0.1, 0]), k(0.7, [0, 0, 0], [0, 0, 0], 'bounce')],
  },
};

const ataque2: Anim = {
  // soco-broca: o braço de trás estica para a frente girando a broca
  frames: 24, loop: false,
  keys: {
    armL_up: [rz(0, 0), rz(0.3, -20), rz(0.45, 30, 'in'), rz(0.8, 30), rz(1, 0)],
    armL_lo: [rz(0, 0), rz(0.3, -40), rz(0.45, 30, 'in'), rz(0.8, 30), rz(1, 0)],
    drillBit: [ry(0, 0), ry(1, 2160, 'linear')],
    torso: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 20, 0], [-0.1, 0, 0]), k(0.45, [0, -25, -6], [0.25, 0, 0], 'in'), k(0.8, [0, -25, -6], [0.25, 0, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    armR_up: [rz(0, 0), rz(0.45, -20), rz(0.8, -20), rz(1, 0)],
    mech: [pk(0, [0, 0, 0]), pk(0.45, [0.3, 0, 0], 'in'), pk(0.8, [0.3, 0, 0]), pk(1, [0, 0, 0])],
    ...treadRun(3),
    ...twirl(2),
    bjaw: [rz(0, 0), rz(0.45, -20), rz(0.8, -20), rz(1, 0)],
  },
};

const ataque3: Anim = {
  // furacão: gira a cintura com os braços abertos
  frames: 24, loop: false,
  keys: {
    waist: [ry(0, 0), ry(0.2, 20), ry(0.85, -720, 'inOut'), ry(1, -720)],
    armR_up: [rz(0, 0), rz(0.2, 40), rz(0.85, 40), rz(1, 0)], armR_lo: [rz(0, 0), rz(0.2, 50), rz(0.85, 50), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.2, 40), rz(0.85, 40), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.2, 50), rz(0.85, 50), rz(1, 0)],
    drillBit: [ry(0, 0), ry(1, 1440, 'linear')],
    bChest: [rz(0, 0), rz(0.3, -20), rz(0.85, -20), rz(1, 0)],
    bhead: [k(0, [0, 0, 0]), k(0.3, [20, 0, -10]), k(0.5, [-20, 0, -10]), k(0.7, [20, 0, -10]), k(0.85, [0, 0, 0]), k(1, [0, 0, 0])],
    blidR: [rx(0, 0), rx(0.3, 80), rx(0.85, 80), rx(1, 0)], blidL: [rx(0, 0), rx(0.3, 80), rx(0.85, 80), rx(1, 0)],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 30], [0, 0.06, 0]), k(0.85, [0, 0, 30], [0, 0.06, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    ...smoke([[0.3, 0.9]]), ...smoke([[0.35, 0.95]], 'smoke2'),
  },
};

const vulneravel: Anim = {
  // superaquecido: tomba para a frente expondo a cabine; Barão aperta botões, suando
  frames: 24, loop: true,
  keys: {
    torso: [k(0, [0, 0, -16], [0.15, -0.2, 0]), k(0.5, [0, 0, -17], [0.15, -0.22, 0]), k(1, [0, 0, -16], [0.15, -0.2, 0])],
    armR_up: wave([0, 0, 3], 1, 0, [0, 0, -35]), armR_lo: [rz(0, 30), rz(1, 30)],
    armL_up: wave([0, 0, 3], 1, 0.4, [0, 0, -30]), armL_lo: [rz(0, 30), rz(1, 30)],
    lidR: [rx(0, 50), rx(0.3, 60), rx(0.35, 30), rx(0.4, 60), rx(1, 50)], lidL: [rx(0, 55), rx(1, 55)],
    grill: [k(0, [0, 0, 0], [0, -0.1, 0]), k(1, [0, 0, 0], [0, -0.1, 0])],
    ...smoke([[0.0, 0.45], [0.5, 0.95]]), ...smoke([[0.25, 0.7]], 'smoke2'),
    bArmR: wave([0, 0, 40], 4, 0, [0, 0, 40]), bArmL: wave([0, 0, 40], 4, 0.5, [0, 0, 40]),
    bChest: [rz(0, 16), rz(1, 16)],
    bhead: wave([0, 0, 6], 2, 0, [0, 0, -6]),
    bjaw: wave([0, 0, -10], 4, 0, [0, 0, -14]),
    sweat: [...show([[0, 1]], 0), ...waveP([0, -0.04, 0], 2)],
    blidR: [rx(0, -20), rx(1, -20)], blidL: [rx(0, -20), rx(1, -20)],
    mech: jitter([0.015, 0.01, 0], 0, 1, 12),
  },
};

const dano: Anim = {
  frames: 10, loop: false,
  keys: {
    torso: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 12], [-0.2, 0.05, 0], 'out'), k(1, [0, 0, 2], [-0.05, 0, 0])],
    mech: jitter([0.04, 0.03, 0], 0, 0.6, 6),
    armR_up: [rz(0, 0), rz(0.2, 30), rz(1, 0)], armL_up: [rz(0, 0), rz(0.2, 30), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.15, 80), rx(0.6, 80), rx(1, 0)], lidL: [rx(0, 0), rx(0.15, 80), rx(0.6, 80), rx(1, 0)],
    baron: [pk(0, [0, 0, 0]), pk(0.2, [0.05, 0.12, 0], 'out'), pk(0.6, [0, 0, 0], 'bounce')],
    bhead: [rz(0, 0), rz(0.2, 20), rz(1, 0)],
    blidR: [rx(0, 0), rx(0.15, 80), rx(0.7, 80), rx(1, 0)], blidL: [rx(0, 0), rx(0.15, 80), rx(0.7, 80), rx(1, 0)],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 25], [0, 0.25, 0], 'out'), k(0.75, [0, 0, 0], [0, 0, 0], 'bounce'), k(1, [0, 0, 0], [0, 0, 0])],
    bmustR: [rx(0, 0), rx(0.2, 30), rx(1, 0)], bmustL: [rx(0, 0), rx(0.2, -30), rx(1, 0)],
  },
};

const furia: Anim = {
  // fumaça preta pelas chaminés, braços socando o ar; Barão sacode o punho
  frames: 24, loop: false,
  keys: {
    mech: jitter([0.04, 0.04, 0], 0.1, 0.9, 16),
    armR_up: [rz(0, 0), rz(0.2, 90), rz(0.35, 50), rz(0.5, 95), rz(0.65, 50), rz(0.8, 90), rz(1, 0)],
    armL_up: [rz(0, 0), rz(0.25, 50), rz(0.4, 95), rz(0.55, 50), rz(0.7, 95), rz(1, 0)],
    armR_lo: [rz(0, 0), rz(0.2, -30), rz(0.8, -30), rz(1, 0)], armL_lo: [rz(0, 0), rz(0.2, -30), rz(0.8, -30), rz(1, 0)],
    drillBit: [ry(0, 0), ry(1, 2160, 'linear')],
    grill: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 0], [0, -0.16, 0]), k(0.85, [0, 0, 0], [0, -0.16, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    lidR: [rx(0, 0), rx(0.15, 20), rx(0.85, 20), rx(1, 0)], lidL: [rx(0, 0), rx(0.15, 20), rx(0.85, 20), rx(1, 0)],
    ...smoke([[0.1, 0.5], [0.5, 0.9]]), ...smoke([[0.2, 0.6], [0.6, 0.95]], 'smoke2'),
    bArmR: [rz(0, 0), rz(0.15, 150), rz(0.85, 150), rz(1, 0)],
    bHandR: wave([0, 0, 30], 6, 0),
    bjaw: [rz(0, 0), rz(0.15, -30), rz(0.85, -30), rz(1, 0)],
    bChest: wave([0, 0, 6], 6, 0),
    bmustR: wave([30, 0, 0], 6), bmustL: wave([-30, 0, 0], 6),
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.2, [0, 0, 0], [0, 0.14, 0]), k(0.3, [0, 0, 0], [0, 0, 0]), k(0.45, [0, 0, 0], [0, 0.14, 0]), k(0.55, [0, 0, 0], [0, 0, 0]), k(0.7, [0, 0, 0], [0, 0.14, 0]), k(0.8, [0, 0, 0], [0, 0, 0])],
  },
};

const ROBOT = ['treads', 'waistGeo', 'torsoGeo', 'armR_up', 'armL_up'];
const derrota: Anim = {
  // pane geral, explosão: sobra a cabine, que cai no chão; Barão tonto com a cartola amassada
  frames: 36, loop: false,
  keys: {
    mech: jitter([0.05, 0.04, 0], 0, 0.3, 8),
    boom: [sk(0, 1), sk(0.28, 1, 'step'), sk(0.3, SHOW * 0.4, 'step'), sk(0.45, SHOW * 1.1, 'out'), sk(0.55, 1, 'step'), sk(1, 1)],
    ...Object.fromEntries(ROBOT.map((b) => [b, [sk(0, 1), sk(0.36, 1, 'step'), sk(0.38, HIDDEN, 'step'), sk(1, HIDDEN)]])),
    cabin: [k(0, [0, 0, 0], [0, 0, 0]), k(0.36, [0, 0, 0], [0, 0.6, 0], 'out'), k(0.6, [0, 0, -20], [0.3, -2.82, 0], 'in'), k(0.7, [0, 0, -10], [0.35, -2.5, 0], 'out'), k(0.8, [0, 0, -16], [0.4, -2.82, 0], 'in'), k(1, [0, 0, -16], [0.4, -2.82, 0])],
    bhead: [k(0, [0, 0, 0]), k(0.6, [0, 0, 0]), k(0.7, [0, 0, 10]), k(0.8, [12, 0, -6]), k(0.9, [-12, 0, -6]), k(1, [8, 0, -8])],
    blidR: [rx(0, 0), rx(0.3, 60), rx(0.6, 20), rx(1, 45)], blidL: [rx(0, 0), rx(0.3, 60), rx(0.6, 20), rx(1, 30)],
    bjaw: [rz(0, 0), rz(0.3, -30), rz(1, -12)],
    bArmR: [rz(0, 0), rz(0.3, 160), rz(0.6, 160), rz(0.8, 20), rz(1, 10)], bArmL: [rz(0, 0), rz(0.3, 160), rz(0.6, 160), rz(0.8, 10), rz(1, 0)],
    hat: [k(0, [0, 0, 0], [0, 0, 0], undefined, 1), k(0.3, [0, 0, 0], [0, 0.3, 0], undefined, 1), k(0.6, [0, 0, -30], [0.1, 0.5, 0], undefined, 1), k(0.78, [0, 0, -10], [0.02, -0.08, 0], 'in', [1.15, 0.45, 1.15]), k(1, [0, 0, -12], [0.02, -0.08, 0], undefined, [1.15, 0.45, 1.15])],
    bmustR: [rx(0, 0), rx(0.8, -40), rx(1, -40)], bmustL: [rx(0, 0), rx(0.8, 40), rx(1, 40)],
  },
};

/* ----- extras do chefe final ----- */
const disfarce: Anim = {
  // árvore "inocente" balançando; o olho espia, o bigode treme, e a cartola fura a copa
  frames: 32, loop: true,
  keys: {
    costume: [sk(0, SHOW), sk(1, SHOW)],
    ...hideAll(['armR_up', 'armL_up']),
    torso: wave([0, 0, 2.5], 1, 0, [0, 0, 0]),
    cMust: wave([14, 0, 0], 2, 0.1),
    cLid: [rx(0, 0), rx(0.4, 0), rx(0.43, 50), rx(0.47, 0), rx(0.8, 0), rx(0.83, 50), rx(0.87, 0), rx(1, 0)],
    baron: [pk(0, [0, 0.05, 0]), pk(1, [0, 0.05, 0])],
    // a cartola fura a copa da árvore
    hat: [...wave([0, 0, 6], 1, 0.2, [0, 0, 0]), pk(0, [0, 1.12, 0]), pk(1, [0, 1.12, 0])],
    bmustR: wave([14, 0, 0], 2, 0.1), bmustL: wave([-14, 0, 0], 2, 0.1),
  },
};

const revelar: Anim = {
  // arranca a fantasia (voa para cima), os braços saltam para fora e ele gargalha
  frames: 24, loop: false,
  keys: {
    costume: [k(0, [0, 0, 0], [0, 0, 0], undefined, SHOW), k(0.15, [0, 0, 4], [0, -0.2, 0], undefined, SHOW), k(0.5, [0, 0, -40], [-1.2, 4.0, 0], 'out', SHOW * 0.8), k(0.52, [0, 0, -40], [-1.2, 4.0, 0], 'step', 1), k(1, [0, 0, 0], [0, 0, 0], undefined, 1)],
    armR_up: [k(0, [0, 0, 0], undefined, undefined, HIDDEN), k(0.2, [0, 0, 0], undefined, 'step', HIDDEN), k(0.3, [0, 0, 60], undefined, 'back', 1), k(0.6, [0, 0, 60], undefined, undefined, 1), k(1, [0, 0, 0], undefined, undefined, 1)],
    armL_up: [k(0, [0, 0, 0], undefined, undefined, HIDDEN), k(0.24, [0, 0, 0], undefined, 'step', HIDDEN), k(0.34, [0, 0, 60], undefined, 'back', 1), k(0.64, [0, 0, 60], undefined, undefined, 1), k(1, [0, 0, 0], undefined, undefined, 1)],
    torso: [k(0, [0, 0, 0], [0, 0, 0]), k(0.15, [0, 0, 4], [0, -0.15, 0]), k(0.3, [0, 0, -4], [0, 0.2, 0], 'out'), k(0.5, [0, 0, 0], [0, 0, 0])],
    bjaw: [rz(0, 0), rz(0.3, -32), rz(0.9, -32), rz(1, 0)],
    bChest: [rz(0, 0), rz(0.3, 12), rz(0.4, 4), rz(0.5, 12), rz(0.6, 4), rz(0.7, 12), rz(1, 0)],
    bArmR: [rz(0, 0), rz(0.3, 150), rz(0.9, 150), rz(1, 0)], bArmL: [rz(0, 0), rz(0.3, 150), rz(0.9, 150), rz(1, 0)],
    blidR: [rx(0, 0), rx(0.3, 55), rx(0.9, 55), rx(1, 0)], blidL: [rx(0, 0), rx(0.3, 55), rx(0.9, 55), rx(1, 0)],
    grill: [k(0, [0, 0, 0], [0, 0, 0]), k(0.3, [0, 0, 0], [0, -0.16, 0]), k(0.9, [0, 0, 0], [0, -0.16, 0]), k(1, [0, 0, 0], [0, 0, 0])],
    hat: [k(0, [0, 0, 0], [0, 1.12, 0]), k(0.15, [0, 0, 0], [0, 1.12, 0]), k(0.3, [0, 0, -14], [0, 0.18, 0], 'out'), k(0.45, [0, 0, 0], [0, 0, 0], 'bounce')],
  },
};

const estagio2: Anim = {
  // sem o braço de caçamba: toco soltando faíscas, robô mancando e fumegando
  frames: 24, loop: true,
  keys: {
    armR_up: [sk(0, HIDDEN), sk(1, HIDDEN)],
    stump: [sk(0, SHOW), sk(0.12, SHOW * 0.6, 'step'), sk(0.2, SHOW, 'step'), sk(0.45, SHOW * 0.7, 'step'), sk(0.55, SHOW, 'step'), sk(0.8, SHOW * 0.5, 'step'), sk(0.88, SHOW, 'step'), sk(1, SHOW)],
    torso: [k(0, [0, 0, -4], [0, 0, 0]), k(0.25, [0, 0, -7], [0, -0.06, 0]), k(0.5, [0, 0, -4], [0, 0, 0]), k(0.75, [0, 0, -7], [0, -0.06, 0]), k(1, [0, 0, -4], [0, 0, 0])],
    armL_up: wave([0, 0, 6], 1, 0.3, [0, 0, 6]),
    drillBit: [ry(0, 0), ry(1, 720, 'linear')],
    lidR: [rx(0, 30), rx(0.6, 30), rx(0.63, 70), rx(0.67, 30), rx(1, 30)], lidL: [rx(0, 10), rx(1, 10)],
    ...smoke([[0.0, 0.45], [0.5, 0.95]]),
    mech: jitter([0.012, 0.008, 0], 0, 1, 12),
    bArmR: wave([0, 0, 20], 2, 0, [0, 0, 60]), bArmL: wave([0, 0, 20], 2, 0.5, [0, 0, 60]),
    bjaw: [rz(0, -8), rz(1, -8)],
    blidR: [rx(0, 0), rx(1, 0)],
    bhead: wave([0, 0, 4], 2, 0, [0, 0, 6]),
    bmustR: wave([10, 0, 0], 2), bmustL: wave([-10, 0, 0], 2),
  },
};

const estagio3: Anim = {
  // só a cabine, quicando num pula-pula de mola; Barão desesperado de braços para cima
  frames: 24, loop: true,
  keys: {
    ...hideAll(ROBOT),
    // mola comprime quando a cabine encosta no chão
    pogo: [sk(0, [SHOW, SHOW * 0.55, SHOW]), sk(0.25, SHOW, 'out'), sk(0.5, [SHOW, SHOW * 0.55, SHOW], 'in'), sk(0.75, SHOW, 'out'), sk(1, [SHOW, SHOW * 0.55, SHOW], 'in')],
    cabin: [k(0, [0, 0, 0], [0, -1.98, 0]), k(0.25, [0, 0, -6], [0.04, -1.3, 0], 'out'), k(0.5, [0, 0, 0], [0, -1.98, 0], 'in'), k(0.75, [0, 0, 6], [-0.04, -1.3, 0], 'out'), k(1, [0, 0, 0], [0, -1.98, 0], 'in')],
    bArmR: wave([0, 0, 25], 4, 0, [0, 0, 150]), bArmL: wave([0, 0, 25], 4, 0.5, [0, 0, 150]),
    bHandR: wave([0, 0, 30], 4, 0.2), bHandL: wave([0, 0, 30], 4, 0.7),
    bjaw: wave([0, 0, -8], 4, 0, [0, 0, -28]),
    bhead: wave([0, 0, 8], 2, 0, [0, 0, 8]),
    blidR: [rx(0, -25), rx(1, -25)], blidL: [rx(0, -25), rx(1, -25)],
    sweat: [...show([[0, 1]], 0), ...waveP([0.02, 0.08, 0], 2)],
    hat: [k(0, [0, 0, 0], [0, 0, 0]), k(0.25, [0, 0, 0], [0, 0.04, 0]), k(0.5, [0, 0, 0], [0, 0.14, 0]), k(0.55, [0, 0, 0], [0, 0, 0]), k(0.75, [0, 0, 0], [0, 0.04, 0]), k(1, [0, 0, 0], [0, 0.14, 0])],
    bmustR: wave([20, 0, 0], 4), bmustL: wave([-20, 0, 0], 4),
  },
};

export const baraoJavardo: ModelDef = {
  id: 'barao-javardo',
  kind: 'boss',
  build,
  anims: { idle, entrada, ataque1, ataque2, ataque3, vulneravel, dano, furia, derrota, disfarce, revelar, estagio2, estagio3 },
  cell: [900, 700],
  pivot: [420, 660],
  height: 700 / 104,
  presets: ['fabrica', 'neutro'],
};
void waveS; void ry; void k;
