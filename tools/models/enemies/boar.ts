/**
 * Corpo-base da tropa de javalis do Barão Javardo (Javalim, Javalim Escudeiro, Javalão).
 * Bípede barrigudo, focinho de porco com disco rosado, presas curvas, crina eriçada,
 * uniforme de operário com remendos e cinto com fivela de cabeça de javali.
 *
 * Ossos: root, hips, spine, chest, neck, head, helmet, snout, jaw, earL/R, lidL/R, browL/R,
 * armL/R_up, armL/R_lo, handL/R, legL/R_up, legL/R_lo, footL/R, tail1, tail2,
 * e props escondidos (escala ~0 no repouso): phone, lunch, domino, paddle, sweat.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, ring, eye, mat, taper, pull, bulge, wobble, flattenBelow, THREE, type V3 } from '../../render/sculpt';

export interface BoarOpts {
  /** cores do uniforme */
  cloth: number;
  clothDark: number;
  fur: number;
  furDark: number;
  /** 'lata' = capacete de lata amassado; 'chifre' = capacete de ferro com chifre */
  helmet: 'lata' | 'chifre';
  /** 'uniforme' = macacão de operário; 'colete' = colete de couro sobre camiseta */
  outfit: 'uniforme' | 'colete';
  /** multiplicador da grossura dos braços */
  arms?: number;
  /** multiplicador do tamanho da barriga */
  belly?: number;
  /** cria os props escondidos das gags (celular, marmita, dominó, remo) */
  gagProps?: boolean;
}

const HIDE = 0.001;

export function buildBoar(o: BoarOpts) {
  const r = new Rig('root');
  const A = o.arms ?? 1;
  const B = o.belly ?? 1;
  const fur = mat('fur', o.fur, { repeat: 4 });
  const furDark = mat('fur', o.furDark, { repeat: 4 });
  const bristle = mat('shortFur', 0x2e211b);
  const snoutM = mat('skin', 0xc78a7a, { rough: 0.5 });
  const noseM = mat('skin', 0xe7a39a, { rough: 0.35 });
  const nostrilM = mat('skin', 0x3a1d1d, { rough: 0.3 });
  const tuskM = mat('shell', 0xf4ead0, { rough: 0.35, repeat: 3 });
  const hoofM = mat('shell', 0x2b2220, { rough: 0.45, repeat: 4 });
  const mouthM = mat('skin', 0x5a1f22, { rough: 0.4 });
  const tongueM = mat('skin', 0xd8687a, { rough: 0.3 });
  const clothM = mat('cloth', o.cloth, { repeat: 4 });
  const clothDarkM = mat('cloth', o.clothDark, { repeat: 4 });
  const patchA = mat('cloth', 0x6f7d3a, { repeat: 6 });
  const patchB = mat('cloth', 0xd4a548, { repeat: 6 });
  const thread = mat('cloth', 0xf2e6c6);
  const beltM = mat('leather', 0x3a2618);
  const goldM = mat('metal', 0xd8aa3c, { metal: 0.55, rough: 0.3 });
  const tinM = mat('rust', 0xc4c8c6, { metal: 0.3, rough: 0.42 });
  const tinDark = mat('metal', 0x9aa09e, { metal: 0.35, rough: 0.45 });
  const ironM = mat('rust', 0x7a706a, { metal: 0.35, rough: 0.55 });
  const hornM = mat('metal', 0xb4b6b8, { metal: 0.45, rough: 0.3 });
  const vestM = mat('leather', 0x7a4a26);
  const vestDark = mat('leather', 0x55321a);

  /* ---------------- esqueleto ---------------- */
  r.bone('hips', 'root', [0, 0.4, 0]);
  r.bone('spine', 'hips', [0, 0.1, 0]);
  r.bone('chest', 'spine', [0.0, 0.24, 0]);
  r.bone('neck', 'chest', [0.07, 0.16, 0]);
  r.bone('head', 'neck', [0.05, 0.08, 0]);
  r.bone('helmet', 'head', [-0.02, 0.13, 0], [0, 0, 10]);
  r.bone('snout', 'head', [0.16, -0.03, 0], [0, 0, -6]);
  r.bone('jaw', 'head', [0.06, -0.1, 0]);
  r.bone('earL', 'head', [-0.03, 0.07, -0.16], [-70, 0, 10]);
  r.bone('earR', 'head', [-0.03, 0.07, 0.16], [70, 0, 10]);
  r.bone('browL', 'head', [0.16, 0.15, -0.08]);
  r.bone('browR', 'head', [0.16, 0.15, 0.08]);
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.bone(`arm${s}_up`, 'chest', [0.0, 0.08, 0.27 * zs * (1 + (B - 1) * 0.5)], [zs * 8, 0, 6]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.2, 0], [0, 0, 22]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.17 * (0.9 + A * 0.1), 0]);
    r.bone(`leg${s}_up`, 'hips', [0, -0.02, 0.12 * zs]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.17, 0], [0, 0, -4]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.16, 0], [0, 0, 4]);
  }
  r.bone('tail1', 'hips', [-0.26, 0.06, 0], [0, 0, 30]);
  r.bone('tail2', 'tail1', [-0.06, 0.04, 0]);
  r.anchor('hand', 'handR', [0.03, -0.07, 0.02]);
  r.anchor('handL', 'handL', [0.03, -0.07, -0.02]);
  r.anchor('head', 'head', [0, 0.3, 0]);

  /* ---------------- quadril (calça) ---------------- */
  r.add('hips',
    blob([0.25, 0.17, 0.23 * (0.9 + B * 0.1)], o.outfit === 'uniforme' ? clothDarkM : mat('cloth', 0x4a4e5a, { repeat: 4 }), { pos: [-0.01, 0.03, 0], deform: [bulge([-0.2, 0, 0], 0.2, 0.03), wobble(0.003)] }),
    // costura central da calça
    tube([[0.2, 0.12, 0], [0.24, 0.0, 0], [0.18, -0.12, 0]], 0.006, thread, { seg: 12, radial: 6 }),
  );
  /* ---------------- barriga ---------------- */
  const bellyR: V3 = [0.29 * B, 0.27 * B, 0.27 * (0.85 + B * 0.15)];
  if (o.outfit === 'uniforme') {
    r.add('spine',
      blob(bellyR, clothM, { pos: [0.04, 0.1, 0], deform: [pull([0.25, -0.05, 0], 0.3, [0.06 * B, -0.02, 0]), taper('y', -0.27, 0.27, 1.02, 0.9), wobble(0.004)] }),
      // remendo verde-oliva costurado na barriga (lado da câmera)
      slab([[-0.06, -0.05], [0.06, -0.055], [0.065, 0.05], [-0.055, 0.06]], 0.012, patchA, { pos: [0.1 * B, 0.02, 0.24 * B], rot: [0, 22, 6], smooth: false, bevel: 0.006 }),
      ...[-0.05, -0.02, 0.01, 0.04].map((y) => tube([[0.04 * B, y, 0.253 * B], [0.055 * B, y + 0.012, 0.257 * B]], 0.004, thread, { seg: 4, radial: 5, pos: [0, 0.02, 0] })),
      // bolso costurado no flanco
      slab([[-0.05, -0.04], [0.05, -0.04], [0.05, 0.04], [-0.05, 0.04]], 0.01, clothDarkM, { pos: [-0.12, 0.08, 0.245 * B], rot: [0, -20, 0], smooth: false, bevel: 0.005 }),
      // botões do macacão
      ...[0.02, 0.13, 0.23].map((y) => blob([0.018, 0.018, 0.01], mat('plastic', 0x3a2a1e), { pos: [0.3 * B + (y > 0.2 ? -0.06 : 0) + 0.02, y, 0.02], rot: [0, 80, 0], seg: 12 })),
    );
  } else {
    r.add('spine',
      // camiseta listrada por baixo
      blob(bellyR, mat('cloth', 0xd8cfb8, { repeat: 4 }), { pos: [0.04, 0.1, 0], deform: [pull([0.25, -0.05, 0], 0.3, [0.06 * B, -0.02, 0]), taper('y', -0.27, 0.27, 1.02, 0.9), wobble(0.004)] }),
      ...[-0.1, 0.0, 0.1, 0.2].map((y) => ring(1, 0.018, mat('cloth', 0x8a2a24), { pos: [0.04, 0.1 + y, 0], rot: [90, 0, 0], scale: [bellyR[0] * Math.cos(Math.asin(Math.min(0.95, y / bellyR[1]))) * 1.02 + 0.03, bellyR[2] * Math.cos(Math.asin(Math.min(0.95, y / bellyR[1]))) * 1.02, 1] })),
      // colete de couro aberto na frente (duas abas)
      blob([bellyR[0] * 0.9, bellyR[1] * 1.04, bellyR[2] * 1.06], vestM, { pos: [-0.04, 0.12, 0], deform: [pull([0.25, 0, 0], 0.18, [-0.12, 0, 0]), wobble(0.004)] }),
      ...[0.02, 0.12, 0.22].map((y) => blob([0.02, 0.02, 0.012], goldM, { pos: [0.16, y, 0.24 * B], rot: [0, 40, 0], seg: 12 })),
    );
  }
  /* ---------------- cinto com fivela de javali ---------------- */
  r.add('spine',
    ring(1, 0.035, beltM, { pos: [0.04, -0.06, 0], rot: [90, 0, 0], scale: [bellyR[0] * 0.98, bellyR[2] * 0.98, 1] }),
  );
  const buckle = new THREE.Group();
  buckle.position.set(0.04 + bellyR[0] * 0.98, -0.06, 0);
  buckle.rotation.y = Math.PI / 2;
  buckle.add(
    blob([0.07, 0.06, 0.02], goldM, { deform: [pull([0, -0.06, 0], 0.06, [0, -0.02, 0])] }),
    blob([0.03, 0.022, 0.015], goldM, { pos: [0, -0.03, 0.018] }),
    spike(0.05, 0.01, mat('metal', 0xf3e2a0, { metal: 0.55, rough: 0.25 }), { pos: [0.03, -0.02, 0.02], rot: [0, 0, -20], curve: -0.3 }),
    spike(0.05, 0.01, mat('metal', 0xf3e2a0, { metal: 0.55, rough: 0.25 }), { pos: [-0.03, -0.02, 0.02], rot: [0, 0, 20], curve: 0.3 }),
    blob([0.012, 0.012, 0.008], mat('metal', 0x5a3a10, { metal: 0.6 }), { pos: [0.022, 0.018, 0.02] }),
    blob([0.012, 0.012, 0.008], mat('metal', 0x5a3a10, { metal: 0.6 }), { pos: [-0.022, 0.018, 0.02] }),
  );
  r.add('spine', buckle);

  /* ---------------- peito, gola e ombros ---------------- */
  r.add('chest',
    blob([0.24 * B, 0.17, 0.27 * (0.9 + B * 0.1)], o.outfit === 'uniforme' ? clothM : vestM, { pos: [0.0, 0.04, 0], deform: [wobble(0.003)] }),
    // crina eriçada saindo da gola, nas costas
    blob([0.17, 0.08, 0.2], bristle, { pos: [-0.06, 0.15, 0], rot: [0, 0, 20] }),
  );
  if (o.outfit === 'uniforme') {
    r.add('chest',
      // gola do macacão
      ring(0.15, 0.03, clothDarkM, { pos: [0.04, 0.15, 0], rot: [90, 0, -16], scale: [1, 1.15, 1] }),
      // remendo amarelo no ombro
      slab([[-0.05, -0.04], [0.05, -0.045], [0.045, 0.05], [-0.05, 0.04]], 0.01, patchB, { pos: [-0.03, 0.08, 0.27], rot: [-8, -6, 12], smooth: false, bevel: 0.005 }),
      ...[-0.03, 0.0, 0.03].map((x) => tube([[x - 0.06, 0.09, 0.282], [x - 0.054, 0.11, 0.281]], 0.004, thread, { seg: 4, radial: 5 })),
    );
  } else {
    r.add('chest',
      // ombreiras de couro rebitadas
      blob([0.12, 0.06, 0.1], vestDark, { pos: [0, 0.12, 0.25], rot: [20, 0, 0] }),
      blob([0.12, 0.06, 0.1], vestDark, { pos: [0, 0.12, -0.25], rot: [-20, 0, 0] }),
      ...[-0.05, 0.0, 0.05].map((x) => blob([0.013, 0.013, 0.01], goldM, { pos: [x, 0.17, 0.29], seg: 10 })),
      ring(0.15, 0.03, vestDark, { pos: [0.04, 0.15, 0], rot: [90, 0, -16], scale: [1, 1.15, 1] }),
    );
  }

  /* ---------------- pescoço e cabeça ---------------- */
  r.add('neck', blob([0.15, 0.12, 0.16], fur, { pos: [0.02, 0.0, 0] }));
  r.add('head',
    blob([0.2, 0.18, 0.18], fur, { pos: [0.0, 0.02, 0], deform: [pull([0.18, -0.02, 0], 0.16, [0.05, -0.02, 0]), pull([-0.16, 0.1, 0], 0.14, [-0.03, 0.02, 0]), bulge([0.05, -0.12, 0.12], 0.1, 0.02), bulge([0.05, -0.12, -0.12], 0.1, 0.02), wobble(0.004)] }),
    // bochechas gordas
    blob([0.09, 0.08, 0.07], fur, { pos: [0.08, -0.07, 0.12] }),
    blob([0.09, 0.08, 0.07], fur, { pos: [0.08, -0.07, -0.12] }),
    // costeletas/barba eriçada
    ...[-1, 1].map((zs) => tube([[0.02, -0.02, 0.15 * zs], [-0.02, -0.1, 0.16 * zs], [0.02, -0.16, 0.13 * zs]], (t) => 0.03 * (1 - t) + 0.006, bristle, { seg: 10, radial: 6 })),
  );
  // crina: cerdas em fila pela nuca até as costas
  const maneSpots: [V3, number][] = [[[-0.06, 0.17, 0], 30], [[-0.12, 0.13, 0], 50], [[-0.17, 0.07, 0], 70], [[-0.19, 0.0, 0], 90]];
  for (const [i, [p, a]] of maneSpots.entries()) {
    r.add('head', spike(0.09 - i * 0.008, 0.03, bristle, { pos: p, rot: [0, 0, a], curve: -0.25 }));
    r.add('head', spike(0.07, 0.022, bristle, { pos: [p[0], p[1], 0.04], rot: [20, 0, a + 10], curve: -0.2 }));
  }
  r.add('chest', ...[[-0.08, 0.2, 110], [-0.13, 0.15, 125]].map(([x, y, a]) => spike(0.08, 0.026, bristle, { pos: [x, y, 0], rot: [0, 0, a], curve: -0.2 })));

  // olhos expressivos (um pouco diferentes: o perto arregalado, o longe meio desconfiado)
  const eR = eye({ r: 0.068, iris: 0x8a5a1a, irisScale: 0.55, look: [0.7, 0.05], lid: 0.22, lidColor: o.furDark, angry: 10 });
  eR.position.set(0.14, 0.075, 0.085); eR.rotation.y = 0.75;
  const eL = eye({ r: 0.06, iris: 0x8a5a1a, irisScale: 0.55, look: [0.8, 0.05], lid: 0.32, lidColor: o.furDark, angry: -10 });
  eL.position.set(0.14, 0.075, -0.085); eL.rotation.y = 0.25;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // sobrancelhas grossas e peludas
  r.add('browR', slab([[-0.06, 0], [0.04, 0.015], [0.06, 0.035], [-0.05, 0.03]], 0.022, bristle, { rot: [0, 30, -14] }));
  r.add('browL', slab([[-0.06, 0], [0.04, 0.015], [0.06, 0.035], [-0.05, 0.03]], 0.022, bristle, { rot: [0, -20, -14] }));

  // focinho de porco: tubo largo terminando em disco rosado com narinas
  r.add('snout',
    lathe([[0.1, -0.02], [0.105, 0.04], [0.098, 0.1], [0.092, 0.15], [0.09, 0.17], [0.08, 0.18], [0.001, 0.185]], snoutM, { rot: [0, 0, -90], scale: [1, 1, 1.1], deform: [pull([0, 0.1, 0.08], 0.08, [0, 0, 0.01])] }),
    // rugas do focinho
    ring(0.1, 0.008, mat('skin', 0xae7466), { pos: [0.07, 0, 0], rot: [0, 90, 0], scale: [1.08, 1, 1] }),
    ring(0.095, 0.007, mat('skin', 0xae7466), { pos: [0.11, 0.0, 0], rot: [0, 90, 0], scale: [1.08, 1, 1] }),
    blob([0.03, 0.088, 0.1], noseM, { pos: [0.185, 0.0, 0], deform: [flattenBelow(-0.08, 0.5)] }),
    blob([0.012, 0.024, 0.016], nostrilM, { pos: [0.212, 0.0, 0.035] }),
    blob([0.012, 0.024, 0.016], nostrilM, { pos: [0.212, 0.0, -0.035] }),
    // manchinha de sujeira no focinho
    blob([0.03, 0.02, 0.01], mat('skin', 0x8e5c4c), { pos: [0.08, 0.06, 0.085], rot: [-30, 20, 0] }),
  );
  // mandíbula com boca, língua e PRESAS curvas
  r.add('jaw',
    blob([0.15, 0.06, 0.12], fur, { pos: [0.08, -0.01, 0], deform: [pull([0.15, 0, 0], 0.1, [0.03, 0.01, 0])] }),
    blob([0.1, 0.025, 0.08], mouthM, { pos: [0.11, 0.035, 0] }),
    blob([0.06, 0.02, 0.05], tongueM, { pos: [0.12, 0.045, 0], name: 'tongue' }),
    spike(0.2, 0.038, tuskM, { pos: [0.16, 0.02, 0.1], rot: [24, 0, 26], curve: -0.6 }),
    spike(0.18, 0.034, tuskM, { pos: [0.16, 0.02, -0.1], rot: [-24, 0, 26], curve: -0.6 }),
    // dentinho de baixo
    spike(0.035, 0.012, tuskM, { pos: [0.18, 0.03, 0.03], rot: [0, 0, -6] }),
  );
  // orelhas pontudas (a de perto meio dobrada, cômica)
  const earShape: [number, number][] = [[0, 0], [0.07, 0.02], [0.06, 0.1], [0.02, 0.16], [-0.04, 0.08]];
  r.add('earR',
    slab(earShape, 0.025, furDark, { deform: [bulge([0.02, 0.16, 0], 0.05, 0.01)] }),
    slab([[0.01, 0.02], [0.05, 0.03], [0.04, 0.1], [0.01, 0.12], [-0.02, 0.07]], 0.008, mat('skin', 0xb97a70), { pos: [0, 0, 0.017] }),
  );
  r.add('earL',
    slab(earShape, 0.025, furDark),
    slab([[0.01, 0.02], [0.05, 0.03], [0.04, 0.1], [0.01, 0.12], [-0.02, 0.07]], 0.008, mat('skin', 0xb97a70), { pos: [0, 0, -0.017] }),
  );
  r.bones.earR.children[0].rotation.x = 0.4; // ponta caída
  r.bones.tongue = r.bones.jaw.getObjectByName('tongue')!;

  /* ---------------- capacete ---------------- */
  if (o.helmet === 'lata') {
    r.add('helmet',
      // cúpula amassada (afundada à frente e no lado)
      lathe([[0.001, -0.012], [0.19, -0.012], [0.2, -0.01], [0.195, 0.05], [0.17, 0.11], [0.13, 0.16], [0.07, 0.185], [0.001, 0.19]], tinM, { deform: [bulge([0.1, 0.15, 0.07], 0.09, -0.035), bulge([-0.05, 0.12, -0.08], 0.07, -0.018), wobble(0.003, 11)] }),
      // aba de lata
      ring(0.2, 0.02, tinDark, { pos: [0, -0.008, 0], rot: [90, 0, 0], scale: [1.08, 1.04, 0.7], deform: [bulge([0.21, 0, 0], 0.08, -0.01)] }),
      // faixa e rebites
      lathe([[0.197, 0.015], [0.2, 0.04], [0.19, 0.045], [0.186, 0.02]], tinDark),
      ...[0, 50, 100, 140, -50, -100].map((a) => blob([0.012, 0.012, 0.012], tinDark, { pos: [Math.cos(a * Math.PI / 180) * 0.203, 0.03, Math.sin(a * Math.PI / 180) * 0.203], seg: 10 })),
      // pino no topo
      lathe([[0.025, 0], [0.022, 0.03], [0.012, 0.04], [0.001, 0.045]], tinDark, { pos: [0, 0.18, 0] }),
      // remendo de lata parafusado
      slab([[-0.04, -0.03], [0.04, -0.035], [0.035, 0.03], [-0.04, 0.03]], 0.006, mat('metal', 0xb87a3a, { metal: 0.7, rough: 0.45 }), { pos: [-0.05, 0.12, 0.14], rot: [-45, -20, 0], smooth: false, bevel: 0.003 }),
    );
    // jugular (tira de couro sob o queixo)
    r.add('head', tube([[0.0, 0.12, 0.17], [0.06, -0.02, 0.17], [0.12, -0.13, 0.12], [0.14, -0.16, 0], [0.12, -0.13, -0.12], [0.06, -0.02, -0.17], [0.0, 0.12, -0.17]], 0.012, beltM, { seg: 30, radial: 6 }));
  } else {
    r.add('helmet',
      lathe([[0.001, -0.025], [0.215, -0.025], [0.23, -0.02], [0.225, 0.02], [0.2, 0.08], [0.15, 0.13], [0.08, 0.155], [0.001, 0.16]], ironM, { scale: [1.05, 1, 1.05], deform: [bulge([0.12, 0.1, -0.08], 0.08, -0.02), wobble(0.003, 9)] }),
      ring(0.235, 0.028, mat('metal', 0x4a4442, { metal: 0.5, rough: 0.5 }), { pos: [0, -0.015, 0], rot: [90, 0, 0], scale: [1.05, 1.05, 0.8] }),
      // nasal de ferro descendo sobre o focinho
      slab([[-0.025, 0], [0.025, 0], [0.018, -0.12], [-0.018, -0.12]], 0.015, ironM, { pos: [0.235, 0.02, 0], rot: [0, 90, 8], smooth: false, bevel: 0.006 }),
      // CHIFRE de ferro no topo, curvado para a frente
      spike(0.26, 0.06, hornM, { pos: [0.02, 0.14, 0], rot: [0, 0, -18], curve: -0.5 }),
      lathe([[0.07, 0], [0.072, 0.02], [0.05, 0.04], [0.001, 0.045]], mat('metal', 0x4a4442, { metal: 0.5, rough: 0.5 }), { pos: [0.01, 0.13, 0] }),
      ...[30, 90, 150, -30, -90, -150].map((a) => blob([0.016, 0.016, 0.016], hornM, { pos: [Math.cos(a * Math.PI / 180) * 0.228, 0.02, Math.sin(a * Math.PI / 180) * 0.228], seg: 10 })),
    );
  }

  /* ---------------- braços e mãos (cascos com dedos gordos) ---------------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    const sleeve = o.outfit === 'uniforme' ? clothM : fur;
    r.add(`arm${s}_up`,
      limb(0.2, 0.08 * A, 0.065 * A, sleeve, { deform: [bulge([0.03, -0.08, 0], 0.08, 0.012 * A)] }),
      ...(o.outfit === 'uniforme' ? [ring(0.068 * A, 0.016, clothDarkM, { pos: [0, -0.17, 0], rot: [90, 0, 0] })] : [ring(0.075 * A, 0.018, beltM, { pos: [0, -0.06, 0], rot: [90, 0, 0] })]),
    );
    r.add(`arm${s}_lo`,
      limb(0.17 * (0.9 + A * 0.1), 0.065 * A, 0.055 * A, fur, { deform: [wobble(0.003)] }),
      ...(A > 1.2 ? [lathe([[0.062 * A, -0.14], [0.068 * A, -0.1], [0.064 * A, -0.06], [0.06 * A, -0.06]], vestDark)] : []),
    );
    r.add(`hand${s}`,
      blob([0.065 * A, 0.06 * A, 0.06 * A], fur, { pos: [0.01, -0.035, 0] }),
      // três dedos-casco gordinhos e um polegar
      ...[-0.032, 0, 0.032].map((z, i) => blob([0.028 * A, 0.04 * A, 0.026 * A], hoofM, { pos: [0.05 * A, -0.07 * A - (i === 1 ? 0.008 : 0), z * A * zs], rot: [0, 0, 30], deform: [taper('y', -0.04, 0.04, 0.7, 1)] })),
      blob([0.024 * A, 0.032 * A, 0.024 * A], hoofM, { pos: [0.0, -0.06 * A, 0.05 * A * zs], rot: [zs * 30, 0, 10] }),
    );
  }

  /* ---------------- pernas curtas e cascos ---------------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    const pants = o.outfit === 'uniforme' ? clothDarkM : mat('cloth', 0x4a4e5a, { repeat: 4 });
    r.add(`leg${s}_up`, limb(0.17, 0.1, 0.085, pants, { deform: [bulge([0, -0.06, 0], 0.1, 0.012)] }));
    r.add(`leg${s}_lo`,
      limb(0.15, 0.085, 0.06, pants),
      // barra da calça dobrada
      lathe([[0.07, -0.16], [0.078, -0.13], [0.075, -0.1], [0.066, -0.1]], pants),
    );
    if (s === 'R' && o.outfit === 'uniforme') {
      r.add('legR_lo', slab([[-0.04, -0.035], [0.04, -0.03], [0.035, 0.04], [-0.04, 0.035]], 0.008, patchA, { pos: [0.035, -0.03, 0.065], rot: [0, 25, 0], smooth: false, bevel: 0.004 }));
    }
    r.add(`foot${s}`,
      // casco fendido (duas unhas)
      blob([0.07, 0.05, 0.035], hoofM, { pos: [0.05, -0.012, 0.03], deform: [flattenBelow(-0.035), taper('x', -0.07, 0.07, 1.1, 0.75)] }),
      blob([0.07, 0.05, 0.035], hoofM, { pos: [0.05, -0.012, -0.03], deform: [flattenBelow(-0.035), taper('x', -0.07, 0.07, 1.1, 0.75)] }),
      blob([0.06, 0.04, 0.06], furDark, { pos: [0.0, 0.03, 0] }),
      blob([0.025, 0.03, 0.02], hoofM, { pos: [-0.05, 0.0, 0.03 * zs], rot: [0, 0, -30] }),
    );
  }

  /* ---------------- rabinho enrolado ---------------- */
  const curl: V3[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = t * Math.PI * 3.2;
    const rr = 0.05 * (1 - t * 0.55);
    curl.push([-t * 0.08 - Math.sin(a) * rr * 0.4, Math.sin(a) * rr + t * 0.04, Math.cos(a) * rr - rr]);
  }
  r.add('tail1', tube(curl, (t) => 0.018 * (1 - t * 0.5), mat('skin', 0xc78a7a), { seg: 40, radial: 8 }));
  r.add('tail2', blob([0.025, 0.035, 0.02], bristle, { pos: [-0.03, 0.02, -0.02], rot: [0, 0, 30] }));

  /* ---------------- props das gags (escondidos no repouso) ---------------- */
  if (o.gagProps) {
    r.bone('phone', 'handR', [0.05, -0.06, 0.02], [0, -70, 0]);
    r.add('phone',
      slab([[-0.035, -0.06], [0.035, -0.06], [0.035, 0.06], [-0.035, 0.06]], 0.012, mat('plastic', 0x2a7ad8), { smooth: false, bevel: 0.008 }),
      slab([[-0.028, -0.048], [0.028, -0.048], [0.028, 0.05], [-0.028, 0.05]], 0.003, mat('glow', 0x9fe6ff, { emissiveIntensity: 0.6 }), { pos: [0, 0, -0.012], smooth: false, bevel: 0.001 }),
      blob([0.008, 0.008, 0.004], mat('glass', 0x101010), { pos: [0.015, 0.045, 0.012] }),
    );
    r.bone('lunch', 'handR', [0.03, -0.12, 0.02]);
    r.add('lunch',
      roundTin(),
      tube([[-0.06, 0.07, 0], [-0.04, 0.12, 0], [0.04, 0.12, 0], [0.06, 0.07, 0]], 0.008, mat('metal', 0x555555, { metal: 0.5 }), { seg: 12, radial: 6 }),
      slab([[-0.09, -0.01], [0.09, -0.01], [0.09, 0.01], [-0.09, 0.01]], 0.13, mat('cloth', 0xc8302c, { repeat: 2 }), { pos: [0, 0.03, 0], smooth: false, bevel: 0.004 }),
    );
    r.bone('domino', 'handR', [0.06, -0.07, 0.02], [0, 0, 20]);
    r.add('domino',
      slab([[-0.025, -0.05], [0.025, -0.05], [0.025, 0.05], [-0.025, 0.05]], 0.016, mat('plastic', 0xf3efe4), { smooth: false, bevel: 0.006 }),
      ...([[0, 0.025], [0.012, 0.03], [-0.012, 0.02], [0, -0.025], [0.012, -0.035], [-0.012, -0.015]] as [number, number][]).map(([x, y]) => blob([0.006, 0.006, 0.003], mat('plastic', 0x1a1a1a), { pos: [x, y, 0.016], seg: 8 })),
      slab([[-0.02, -0.002], [0.02, -0.002], [0.02, 0.002], [-0.02, 0.002]], 0.004, mat('plastic', 0x1a1a1a), { pos: [0, 0, 0.012], smooth: false, bevel: 0.001 }),
    );
    r.bone('paddle', 'handR', [0.03, -0.06, 0], [0, 0, -95]);
    r.add('paddle',
      tube([[0, 0.3, 0], [0, -0.2, 0], [0, -0.45, 0]], 0.018, mat('wood', 0x9a6a3a), { seg: 16, radial: 8 }),
      slab([[-0.05, 0], [0.05, 0], [0.06, -0.18], [0, -0.24], [-0.06, -0.18]], 0.02, mat('wood', 0xb07a44), { pos: [0, -0.42, 0], rot: [0, 90, 0] }),
      lathe([[0.03, -0.02], [0.034, 0], [0.03, 0.03], [0.001, 0.035]], mat('wood', 0x7a4a2a), { pos: [0, 0.3, 0] }),
    );
    // gotas de suor (correr-banheiro)
    r.bone('sweat', 'head', [0.02, 0.14, 0.16]);
    r.add('sweat',
      lathe([[0.001, -0.03], [0.018, -0.012], [0.014, 0.008], [0.001, 0.03]], mat('water', 0x9ad8ff, { opacity: 0.8 }), { pos: [0, 0, 0] }),
      lathe([[0.001, -0.025], [0.014, -0.01], [0.011, 0.006], [0.001, 0.024]], mat('water', 0x9ad8ff, { opacity: 0.8 }), { pos: [0.08, -0.05, 0.03], rot: [0, 0, -20] }),
    );
    for (const b of ['phone', 'lunch', 'domino', 'paddle', 'sweat']) r.bones[b].scale.setScalar(HIDE);
  }
  return r;
}

/** Marmita de alumínio (caixinha com tampa). */
function roundTin() {
  const g = new THREE.Group();
  const al = mat('metal', 0xc8ccd0, { metal: 0.5, rough: 0.35 });
  g.add(
    lathe([[0.001, -0.06], [0.07, -0.06], [0.075, -0.05], [0.075, 0.04], [0.07, 0.045], [0.001, 0.045]], al, { scale: [1.3, 1, 0.8] }),
    lathe([[0.001, 0.04], [0.078, 0.04], [0.08, 0.055], [0.07, 0.065], [0.001, 0.068]], mat('metal', 0xa8acb0, { metal: 0.5, rough: 0.35 }), { scale: [1.3, 1, 0.8] }),
  );
  return g;
}


