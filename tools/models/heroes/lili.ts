/**
 * LILI — mico-leão-dourada, a agilidade da dupla.
 * Bípede esguia (~1.3 u), juba dourado-alaranjada volumosa em tufos esculpidos ao redor do
 * rosto escuro sem pelo, olhos grandes e brilhantes, braços e pernas longos e finos com dedos
 * compridos, cauda longa que termina num pincel mais escuro.
 * Acessórios: lenço de cabeça vermelho-pitanga (com nó e pontas soltas) e pochete na cintura.
 */
import { Rig, blob, limb, tube, slab, lathe, ring, roundBox, eye, mat, taper, pull, bulge, wobble, THREE, D2R, type V3 } from '../../render/sculpt';
import { bipedAnims } from '../../anims/biped';
import type { AnimSet, Key } from '../../render/anim';
import type { ModelDef } from '../../render/types';

const C = {
  fur: 0xe99a2c,
  furDeep: 0xd0741a,
  furLight: 0xf7c35a,
  mane: 0xf0a030,
  maneDeep: 0xc8641a,
  face: 0x3a2620,
  faceDark: 0x24160f,
  muzzle: 0x4a3128,
  lip: 0x1a0f0b,
  pitanga: 0xd8352a,
  pitangaDark: 0x8e1e18,
  pack: 0x2f8a78,
  packDark: 0x1f5e52,
  zip: 0xd9b24a,
};

export interface LiliCostume { band: number; bandDark: number; pack: number; packDark: number; extra?: (r: Rig) => void }

/* ---------- figurinos ---------- */
/** Tecido visto dos dois lados (abas de chapéu, saia). */
function twoSided<T extends THREE.Material>(m: T): T {
  m.side = THREE.DoubleSide;
  return m;
}
/** Osso de chapéu: a juba é volumosa, então o chapéu é ampliado para assentar por cima dela. */
function hatBone(r: Rig, scale: number) {
  r.bone('hat', 'head', [0.0, 0.0, 0]);
  r.bones.hat.scale.setScalar(scale);
}

function exploradora(r: Rig) {
  const khaki = twoSided(mat('cloth', 0xc9b27a, { repeat: 4 }));
  const khakiDark = mat('cloth', 0x8a7448, { repeat: 4 });
  const leather = mat('leather', 0x6e4527);
  // chapéu safári: copa arredondada, aba larga levemente caída, fita e presilha lateral
  hatBone(r, 1.35);
  r.add('hat',
    lathe([[0.001, 0.2], [0.07, 0.195], [0.12, 0.17], [0.15, 0.12], [0.16, 0.07], [0.17, 0.05], [0.001, 0.05]], khaki, { pos: [-0.02, 0.12, 0], rot: [0, 0, 6] }),
    lathe([[0.16, 0.06], [0.26, 0.035], [0.3, 0.005], [0.295, -0.005], [0.25, 0.02], [0.16, 0.045]], khaki, { pos: [-0.02, 0.12, 0], rot: [0, 0, 6] }),
    lathe([[0.167, 0.06], [0.164, 0.1], [0.156, 0.1], [0.16, 0.06]], khakiDark, { pos: [-0.02, 0.12, 0], rot: [0, 0, 6] }),
    slab([[-0.03, -0.03], [0.03, -0.03], [0.035, 0.03], [-0.03, 0.035]], 0.012, leather, { pos: [-0.015, 0.2, 0.165], rot: [0, 0, 6] }),
  );
  // mochila de lona com aba de couro, rolo de corda e alças
  r.bone('pack', 'chest', [-0.17, 0.0, 0]);
  r.add('pack',
    roundBox([0.13, 0.26, 0.22], 0.05, khaki, { pos: [-0.02, 0, 0] }),
    roundBox([0.06, 0.13, 0.18], 0.025, khakiDark, { pos: [-0.09, -0.04, 0] }),
    slab([[-0.1, 0], [0.1, 0], [0.09, 0.09], [-0.09, 0.09]], 0.02, leather, { pos: [-0.08, 0.06, 0], rot: [0, 90, 0], smooth: false, bevel: 0.01 }),
    ring(0.05, 0.022, mat('cloth', 0xa88a52, { repeat: 6 }), { pos: [-0.02, 0.15, 0], rot: [0, 0, 0], scale: [1, 0.8, 1.8] }),
    tube([[0.02, 0.1, 0.1], [0.12, 0.08, 0.13], [0.16, -0.05, 0.12], [0.08, -0.14, 0.11]], 0.014, leather),
    tube([[0.02, 0.1, -0.1], [0.12, 0.08, -0.13], [0.16, -0.05, -0.12], [0.08, -0.14, -0.11]], 0.014, leather),
  );
}

function surfista(r: Rig) {
  // óculos escuros: armação laranja com lentes espelhadas
  const frame = mat('plastic', 0xff7a1a);
  const lens = mat('glass', 0x1a3a5a, { opacity: 0.95, rough: 0.05, metal: 0.4 });
  r.add('head',
    blob([0.036, 0.03, 0.012], lens, { pos: [0.14, 0.045, 0.06], rot: [0, 50, 0] }),
    blob([0.034, 0.03, 0.012], lens, { pos: [0.155, 0.045, -0.035], rot: [0, 70, 0] }),
    ring(0.033, 0.006, frame, { pos: [0.14, 0.045, 0.06], rot: [0, 50, 0], scale: [1.1, 0.95, 1] }),
    ring(0.033, 0.006, frame, { pos: [0.155, 0.045, -0.035], rot: [0, 70, 0], scale: [1.05, 0.95, 1] }),
    tube([[0.155, 0.05, 0.03], [0.165, 0.058, 0.012], [0.163, 0.05, -0.005]], 0.006, frame),
    tube([[0.12, 0.05, 0.085], [0.05, 0.06, 0.11], [-0.02, 0.05, 0.11]], 0.005, frame),
  );
  // prancha nas costas presa por uma correia diagonal
  const board = mat('paint', 0x3ab0d8);
  r.bone('board', 'chest', [-0.16, -0.05, 0], [0, 0, -18]);
  r.add('board',
    slab([[0, -0.42], [0.06, -0.38], [0.085, -0.15], [0.085, 0.2], [0.05, 0.42], [0, 0.48], [-0.05, 0.42], [-0.085, 0.2], [-0.085, -0.15], [-0.06, -0.38]], 0.035, board, { rot: [0, 90, 0] }),
    slab([[0, -0.4], [0.012, -0.1], [0.012, 0.3], [0, 0.44], [-0.012, 0.3], [-0.012, -0.1]], 0.04, mat('paint', 0xfff2d0), { rot: [0, 90, 0] }),
    slab([[0, 0], [0.06, -0.02], [0.02, 0.08]], 0.012, mat('paint', 0xff7a1a), { pos: [-0.04, -0.34, 0], rot: [0, 0, 180] }),
    slab([[-0.06, 0.06], [0.06, 0.06], [0.04, 0.1], [-0.04, 0.1]], 0.04, mat('paint', 0xffd23a), { pos: [0, 0.1, 0], rot: [0, 90, 0], smooth: false, bevel: 0.01 }),
  );
  r.add('chest', tube([[0.14, 0.12, 0.12], [0.06, -0.02, 0.15], [-0.08, -0.14, 0.12], [-0.16, -0.2, 0.06]], 0.016, mat('rubber', 0x222a33)));
}

function festaJunina(r: Rig) {
  // chapéu de palha desfiado com remendos coloridos
  const straw = twoSided(mat('cloth', 0xe0c070, { repeat: 6 }));
  const strawDark = mat('cloth', 0xb89040, { repeat: 6 });
  hatBone(r, 1.3);
  r.add('hat',
    lathe([[0.001, 0.2], [0.09, 0.195], [0.13, 0.15], [0.15, 0.08], [0.32, 0.03], [0.34, 0.0], [0.31, -0.01], [0.15, 0.04], [0.001, 0.04]], straw, { pos: [-0.02, 0.12, 0], rot: [0, 0, 5], deform: [wobble(0.006, 11)] }),
    lathe([[0.152, 0.07], [0.15, 0.11], [0.145, 0.11], [0.146, 0.07]], strawDark, { pos: [-0.02, 0.12, 0], rot: [0, 0, 5] }),
    slab([[-0.03, -0.025], [0.035, -0.02], [0.03, 0.03], [-0.035, 0.028]], 0.006, mat('cloth', 0xd8352a, { repeat: 8 }), { pos: [0.06, 0.25, 0.1], rot: [-40, 20, -20] }),
    slab([[-0.025, -0.025], [0.03, -0.028], [0.028, 0.025], [-0.03, 0.022]], 0.006, mat('cloth', 0x2a6ac8, { repeat: 8 }), { pos: [-0.12, 0.23, 0.08], rot: [-30, -20, 30] }),
    slab([[-0.02, -0.02], [0.025, -0.022], [0.022, 0.02], [-0.025, 0.02]], 0.006, mat('cloth', 0x3aa04a, { repeat: 8 }), { pos: [0.18, 0.17, -0.1], rot: [30, 0, -10] }),
    // pontos de costura dos remendos
    tube([[0.035, 0.27, 0.12], [0.06, 0.275, 0.115], [0.085, 0.27, 0.105]], 0.003, mat('cloth', 0x3a2a1a)),
    // fitinhas coloridas pendendo da aba
    tube([[-0.22, 0.14, 0.18], [-0.26, 0.04, 0.2], [-0.24, -0.06, 0.22]], 0.008, mat('cloth', 0xffd23a)),
    tube([[-0.24, 0.14, 0.15], [-0.29, 0.03, 0.16], [-0.3, -0.08, 0.18]], 0.008, mat('cloth', 0x2a6ac8)),
  );
  // vestido xadrez: saia em gomos alternados (xadrez feito de faixas e colunas), corpete e babado
  const red = twoSided(mat('cloth', 0xd23a3a, { repeat: 6 }));
  const white = twoSided(mat('cloth', 0xf4ecda, { repeat: 6 }));
  const pink = twoSided(mat('cloth', 0xe86a6a, { repeat: 6 }));
  const cols = 14;
  const bands: [number, number, number, number][] = [[0.165, 0.2, 0.08, -0.04], [0.2, 0.235, -0.04, -0.15], [0.235, 0.27, -0.15, -0.25]];
  bands.forEach(([r0, r1, y0, y1], bi) => {
    for (let c = 0; c < cols; c++) {
      const g = new THREE.LatheGeometry([new THREE.Vector2(r0, y0), new THREE.Vector2((r0 + r1) / 2 + 0.006, (y0 + y1) / 2), new THREE.Vector2(r1, y1)], 4, (c * 2 * Math.PI) / cols, (2 * Math.PI) / cols);
      const m = (bi + c) % 2 === 0 ? red : (bi % 2 ? pink : white);
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(0.0, 0.04, 0);
      r.add('hips', mesh);
    }
  });
  r.add('hips', ring(0.27, 0.016, white, { pos: [0, -0.21, 0], rot: [90, 0, 0], deform: [wobble(0.004, 30)] }));
  r.add('spine',
    blob([0.13, 0.14, 0.125], red, { pos: [0.02, 0.07, 0], deform: [taper('y', -0.14, 0.14, 1.05, 0.9)] }),
    tube([[0.15, 0.04, -0.06], [0.16, 0.0, 0.0], [0.15, 0.04, 0.06]], 0.012, white),
    blob([0.03, 0.025, 0.03], mat('cloth', 0xffd23a), { pos: [0.15, 0.0, 0.0] }),
  );
}

export const LILI_COSTUMES: Record<string, LiliCostume> = {
  base: { band: C.pitanga, bandDark: C.pitangaDark, pack: C.pack, packDark: C.packDark },
  exploradora: { band: C.pitanga, bandDark: C.pitangaDark, pack: 0x7a6a3a, packDark: 0x52462a, extra: exploradora },
  surfista: { band: 0xff5a8a, bandDark: 0xb03060, pack: 0x2a6ac8, packDark: 0x1a4488, extra: surfista },
  'festa-junina': { band: C.pitanga, bandDark: C.pitangaDark, pack: 0xc89a4a, packDark: 0x8a6a2a, extra: festaJunina },
};

/** Tufo de juba: tubo curvo afinando, do ponto `a` saindo em direção a `b` com leve curva `c`. */
function tuft(a: V3, b: V3, c: V3, r0: number, m: THREE.Material) {
  const mid: V3 = [(a[0] + b[0]) / 2 + c[0], (a[1] + b[1]) / 2 + c[1], (a[2] + b[2]) / 2 + c[2]];
  return tube([a, mid, b], (t) => r0 * (1 - t) ** 0.75 + 0.006, m, { seg: 18, radial: 10 });
}

/** Mecha fofa: elipsoide alongada de `a` até `b`, afinando na ponta e levemente ondulada. */
function lock(a: V3, b: V3, th: number, m: THREE.Material, tipScale = 0.42) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const L = dir.length();
  const mesh = blob([L / 2, th, th * 0.82], m, { seg: 24, deform: [taper('x', -L / 2, L / 2, 1, tipScale), pull([L / 2, 0, 0], L * 0.5, [0, -th * 0.25, 0]), wobble(0.004, 18)] });
  mesh.position.copy(va.clone().add(vb).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.normalize());
  return mesh;
}

function build(variant: string) {
  const cos = LILI_COSTUMES[variant] ?? LILI_COSTUMES.base;
  const r = new Rig('root');
  const fur = mat('fur', C.fur, { repeat: 4 });
  const furDeep = mat('fur', C.furDeep, { repeat: 4 });
  const furLight = mat('shortFur', C.furLight, { repeat: 4 });
  const maneM = mat('fur', C.mane, { repeat: 3 });
  const maneDeep = mat('fur', C.maneDeep, { repeat: 3 });
  const faceM = mat('skin', C.face, { rough: 0.5 });
  const faceDark = mat('skin', C.faceDark, { rough: 0.45 });
  const muzzleM = mat('skin', C.muzzle, { rough: 0.45 });
  const lipM = mat('skin', C.lip, { rough: 0.3 });
  const handM = mat('skin', 0x5a3a26, { rough: 0.55 });
  const nailM = mat('shell', 0x2a1a12, { rough: 0.35 });
  const bandM = mat('cloth', cos.band, { repeat: 4 });
  const bandDarkM = mat('cloth', cos.bandDark, { repeat: 4 });
  const packM = mat('cloth', cos.pack, { repeat: 3 });
  const packDarkM = mat('cloth', cos.packDark, { repeat: 3 });
  const zipM = mat('metal', C.zip, { metal: 0.9, rough: 0.3 });

  /* ---------- esqueleto ---------- */
  r.bone('hips', 'root', [0, 0.46, 0]);
  r.bone('spine', 'hips', [0, 0.12, 0]);
  r.bone('chest', 'spine', [0.02, 0.17, 0]);
  r.bone('neck', 'chest', [0.04, 0.12, 0]);
  r.bone('head', 'neck', [0.03, 0.08, 0], [0, -22, 0]);
  r.bones.head.scale.setScalar(1.3);
  r.bone('mane', 'head', [-0.03, 0.0, 0]);
  r.bone('earL', 'head', [-0.02, 0.0, -0.15]);
  r.bone('earR', 'head', [-0.02, 0.0, 0.15]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 0.13 : -0.13;
    r.bone(`arm${s}_up`, 'chest', [0.0, 0.08, z], [0, 0, 14]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.24, 0], [0, 0, 26]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.22, 0]);
    const lz = s === 'R' ? 0.075 : -0.075;
    r.bone(`leg${s}_up`, 'hips', [0, -0.03, lz]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.21, 0], [0, 0, -4]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.2, 0]);
  }
  r.bone('tail1', 'hips', [-0.11, -0.02, 0], [0, 0, 48]);
  r.bone('tail2', 'tail1', [-0.28, 0, 0], [0, 0, -18]);
  r.bone('tail3', 'tail2', [-0.27, 0, 0], [0, 0, -34]);
  r.bone('tailTip', 'tail3', [-0.25, 0, 0], [0, 0, -30]);
  r.bone('pochete', 'hips', [0.105, -0.01, 0.085], [0, 18, 0]);
  r.anchor('hand', 'handR', [0.03, -0.07, 0.02]);
  r.anchor('handL', 'handL', [0.03, -0.07, -0.02]);
  r.anchor('head', 'head', [0, 0.25, 0]);

  /* ---------- quadril, tronco, peito ---------- */
  r.add('hips',
    blob([0.155, 0.13, 0.145], fur, { pos: [-0.01, 0.03, 0], deform: [bulge([-0.1, -0.02, 0], 0.12, 0.02), wobble(0.003)] }),
    blob([0.1, 0.09, 0.1], furLight, { pos: [0.065, 0.04, 0] }),
  );
  r.add('spine',
    blob([0.14, 0.15, 0.14], fur, { pos: [0.0, 0.07, 0], deform: [taper('y', -0.15, 0.15, 1.0, 0.9), wobble(0.003)] }),
    blob([0.09, 0.13, 0.1], furLight, { pos: [0.06, 0.05, 0] }),
  );
  r.add('chest',
    blob([0.145, 0.14, 0.16], fur, { pos: [0.0, 0.03, 0], deform: [pull([0.1, 0.05, 0], 0.12, [0.015, 0.01, 0]), wobble(0.003)] }),
    blob([0.07, 0.09, 0.09], furLight, { pos: [0.06, 0.02, 0] }),
    // gola de pelo que liga a juba ao peito
    blob([0.11, 0.08, 0.14], maneDeep, { pos: [-0.03, 0.12, 0], deform: [wobble(0.008, 14)] }),
  );
  /* ---------- pochete na cintura ---------- */
  r.add('hips', ring(0.15, 0.016, packDarkM, { pos: [0.0, 0.0, 0], rot: [90, 0, 6], scale: [1.05, 1, 1] }));
  r.add('pochete',
    blob([0.088, 0.065, 0.05], packM, { deform: [flatBack(), taper('y', -0.05, 0.05, 1.05, 0.85)], rot: [0, 30, 0] }),
    tube([[-0.05, 0.015, 0.03], [0, 0.025, 0.045], [0.05, 0.015, 0.03]], 0.004, zipM, { rot: [0, 30, 0] }),
    blob([0.008, 0.012, 0.005], zipM, { pos: [0.026, 0.005, 0.03], rot: [0, 30, 0] }),
    blob([0.04, 0.02, 0.03], packDarkM, { pos: [0.0, -0.03, 0.01], rot: [0, 30, 0] }),
  );

  /* ---------- pescoço e cabeça ---------- */
  r.add('neck', blob([0.06, 0.08, 0.065], fur, { pos: [0, 0.03, 0] }));
  // crânio coberto de pelo curto + rosto escuro sem pelo
  r.add('head',
    blob([0.1, 0.105, 0.1], fur, { pos: [-0.01, 0.05, 0], deform: [wobble(0.004)] }),
    blob([0.085, 0.1, 0.095], faceM, { pos: [0.07, 0.03, 0], deform: [pull([0.07, -0.06, 0], 0.08, [0.02, -0.01, 0]), pull([0.06, 0.06, 0], 0.06, [0.0, 0.01, 0])] }),
    // testa / arcos das sobrancelhas
    blob([0.04, 0.02, 0.04], faceDark, { pos: [0.11, 0.075, 0.035], rot: [0, 0, -8] }),
    blob([0.04, 0.02, 0.04], faceDark, { pos: [0.115, 0.075, -0.035], rot: [0, 0, -8] }),
    // focinho curto com narinas e boca sorridente
    blob([0.05, 0.04, 0.055], muzzleM, { pos: [0.12, -0.03, 0], deform: [pull([0.04, -0.01, 0], 0.05, [0.012, -0.004, 0])] }),
    blob([0.022, 0.014, 0.03], faceDark, { pos: [0.165, -0.012, 0] }),
    blob([0.006, 0.005, 0.006], lipM, { pos: [0.18, -0.012, 0.012] }),
    blob([0.006, 0.005, 0.006], lipM, { pos: [0.18, -0.012, -0.012] }),
    tube([[0.15, -0.05, 0.04], [0.168, -0.058, 0.018], [0.172, -0.056, 0], [0.168, -0.058, -0.018], [0.15, -0.05, -0.04]], 0.0055, lipM, { name: 'mouth' }),
    // bochechas e queixo
    blob([0.03, 0.025, 0.02], faceM, { pos: [0.11, -0.025, 0.055] }),
    blob([0.03, 0.022, 0.035], faceM, { pos: [0.13, -0.075, 0] }),
  );
  const eR = eye({ r: 0.038, iris: 0x6a3a12, irisScale: 0.56, look: [0.75, 0.1], lid: 0.12, lidColor: C.faceDark });
  eR.position.set(0.122, 0.04, 0.04); eR.rotation.y = 0.75;
  const eL = eye({ r: 0.036, iris: 0x6a3a12, irisScale: 0.56, look: [0.8, 0.1], lid: 0.12, lidColor: C.faceDark });
  eL.position.set(0.13, 0.04, -0.035); eL.rotation.y = 1.35;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;

  /* ---------- juba: núcleo + coroa de tufos esculpidos ---------- */
  r.add('mane',
    blob([0.16, 0.19, 0.19], maneM, { pos: [-0.06, 0.04, 0], deform: [bulge([-0.1, 0.08, 0], 0.12, 0.03), wobble(0.01, 12)] }),
    blob([0.12, 0.12, 0.14], maneDeep, { pos: [-0.1, -0.06, 0], deform: [wobble(0.008, 14)] }),
  );
  // coroa: duas camadas de tufos em leque ao redor do rosto (ângulos fixos, plano YZ, puxados para trás)
  const crown: [number, number, number][] = [
    // [ângulo°, comprimento, espessura]
    [90, 0.12, 0.075], [64, 0.13, 0.075], [116, 0.12, 0.075], [38, 0.13, 0.072], [142, 0.12, 0.072],
    [12, 0.12, 0.07], [168, 0.12, 0.07], [-14, 0.11, 0.066], [194, 0.11, 0.066], [-40, 0.09, 0.06], [220, 0.09, 0.06],
  ];
  crown.forEach(([deg, len, th], i) => {
    const a = deg * D2R;
    const sy = Math.sin(a), sz = Math.cos(a);
    const base: V3 = [0.01, 0.04 + sy * 0.1, sz * 0.11];
    const tip: V3 = [-0.06 - (i % 3) * 0.015, 0.04 + sy * (0.1 + len), sz * (0.11 + len * 0.95)];
    r.add('mane', lock(base, tip, th, i % 2 ? maneM : fur, 0.6));
  });
  // segunda camada, intercalada e mais para trás (dá profundidade de juba de leão)
  [77, 103, 51, 129, 25, 155, -2, 182, -27, 207].forEach((deg, i) => {
    const a = deg * D2R;
    const sy = Math.sin(a), sz = Math.cos(a);
    const len = 0.14 - Math.abs(deg - 90) * 0.0003;
    r.add('mane', lock([-0.06, 0.04 + sy * 0.08, sz * 0.09], [-0.17, 0.04 + sy * (0.08 + len), sz * (0.09 + len * 0.9)], 0.085, i % 2 ? maneDeep : maneM, 0.6));
  });
  // tufos de trás, escorrendo pela nuca
  const back: [V3, V3][] = [
    [[-0.1, 0.12, 0.0], [-0.32, 0.06, 0.0]], [[-0.1, 0.1, 0.08], [-0.3, 0.0, 0.12]], [[-0.1, 0.1, -0.08], [-0.3, 0.0, -0.12]],
    [[-0.12, 0.0, 0.0], [-0.3, -0.14, 0.0]], [[-0.1, 0.18, 0.04], [-0.28, 0.2, 0.05]],
  ];
  back.forEach(([a, b], i) => r.add('mane', lock(a, b, 0.07, i % 2 ? maneDeep : maneM)));
  // franjinha caindo na testa
  r.add('mane',
    lock([0.03, 0.13, 0.02], [0.13, 0.13, 0.035], 0.035, maneM),
    lock([0.03, 0.14, -0.03], [0.12, 0.14, -0.05], 0.032, fur),
  );
  // "orelhas" escondidas na juba: tufos laterais que balançam nas animações
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`ear${s}`,
      lock([0, 0, 0], [-0.12, -0.1, 0.1 * zs], 0.06, maneM),
      lock([0, 0.04, 0], [-0.1, 0.04, 0.14 * zs], 0.055, fur),
    );
  }
  /* ---------- lenço vermelho-pitanga ---------- */
  r.add('head',
    ring(0.135, 0.024, bandM, { pos: [-0.02, 0.1, 0], rot: [90, 18, 0], scale: [1.0, 1.08, 1.4], deform: [wobble(0.003, 20)] }),
    blob([0.035, 0.03, 0.04], bandDarkM, { pos: [-0.16, 0.135, 0.0] }),
    slab([[0, 0], [-0.09, 0.03], [-0.17, -0.02], [-0.14, -0.05], [-0.06, -0.03]], 0.014, bandM, { pos: [-0.16, 0.13, 0.03], rot: [10, 0, 10] }),
    slab([[0, 0], [-0.08, -0.03], [-0.13, -0.11], [-0.1, -0.12], [-0.04, -0.06]], 0.014, bandDarkM, { pos: [-0.16, 0.13, -0.02], rot: [-15, 0, 0] }),
  );

  /* ---------- braços longos e finos, mãos com dedos ---------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`arm${s}_up`,
      limb(0.24, 0.062, 0.046, fur, { deform: [bulge([0.02, -0.08, 0], 0.06, 0.008)] }),
      tuft([0, -0.02, 0], [-0.06, -0.12, 0.0], [-0.02, 0, 0], 0.03, furDeep),
    );
    r.add(`arm${s}_lo`,
      limb(0.22, 0.048, 0.036, fur, { deform: [bulge([0.0, -0.05, 0], 0.07, 0.006)] }),
      lock([0.0, -0.03, 0], [-0.05, -0.16, 0], 0.03, furDeep),
    );
    const hand: THREE.Object3D[] = [blob([0.035, 0.04, 0.03], handM, { pos: [0.005, -0.03, 0] })];
    for (let f = 0; f < 4; f++) {
      const z = (f - 1.5) * 0.016 * zs;
      const l = [0.075, 0.085, 0.08, 0.065][f];
      hand.push(tube([[0.01, -0.05, z], [0.025, -0.05 - l * 0.6, z * 1.1], [0.035, -0.05 - l, z * 1.15]], (t) => 0.0105 - t * 0.003, handM, { seg: 10, radial: 8 }));
      hand.push(blob([0.007, 0.006, 0.007], nailM, { pos: [0.037, -0.05 - l, z * 1.15] }));
    }
    hand.push(tube([[0.025, -0.03, 0.02 * zs], [0.05, -0.06, 0.03 * zs], [0.06, -0.08, 0.025 * zs]], 0.01, handM, { seg: 10, radial: 8 }));
    r.add(`hand${s}`, ...hand);
    /* ---------- pernas finas, pés compridos ---------- */
    r.add(`leg${s}_up`, limb(0.21, 0.088, 0.052, fur, { deform: [bulge([-0.02, -0.05, 0], 0.07, 0.012)] }));
    r.add(`leg${s}_lo`, limb(0.2, 0.052, 0.036, fur));
    const foot: THREE.Object3D[] = [
      blob([0.065, 0.026, 0.035], handM, { pos: [0.04, -0.006, 0], deform: [taper('x', -0.06, 0.06, 0.9, 1.15)] }),
      blob([0.04, 0.03, 0.035], fur, { pos: [0.0, 0.01, 0] }),
    ];
    for (let f = 0; f < 3; f++) {
      const z = (f - 1) * 0.02;
      foot.push(tube([[0.09, -0.012, z], [0.12, -0.016, z * 1.1], [0.135, -0.022, z * 1.15]], 0.009, handM, { seg: 8, radial: 8 }));
    }
    r.add(`foot${s}`, ...foot);
  }

  /* ---------- cauda longa com pincel ---------- */
  r.add('tail1', tube([[0, 0, 0], [-0.14, 0.01, 0], [-0.29, 0, 0]], (t) => 0.058 - t * 0.008, fur, { seg: 20, deform: [wobble(0.003, 30)] }));
  r.add('tail2', tube([[0, 0, 0], [-0.14, 0.008, 0], [-0.28, 0, 0]], (t) => 0.05 - t * 0.006, fur, { seg: 20, deform: [wobble(0.003, 30)] }));
  r.add('tail3', tube([[0, 0, 0], [-0.13, 0.006, 0], [-0.26, 0, 0]], (t) => 0.044 - t * 0.002, furDeep, { seg: 20, deform: [wobble(0.003, 30)] }));
  r.add('tailTip',
    lock([0.02, 0, 0], [-0.3, 0.0, 0], 0.075, furDeep, 0.35),
    lock([-0.02, 0.012, 0.012], [-0.27, 0.008, 0.01], 0.07, maneM, 0.4),
  );
  cos.extra?.(r);
  return r;
}

/** Achata a face de trás (lado -Z local) para encostar a pochete no corpo. */
function flatBack() {
  return (p: THREE.Vector3) => { if (p.z < -0.012) p.z = -0.012 + (p.z + 0.012) * 0.3; };
}

/* ---------- animações: biblioteca 'light' + juba e ponta da cauda ---------- */
const rz = (t: number, z: number): Key => ({ t, r: [0, 0, z] });
function liliAnims(): AnimSet {
  const a = bipedAnims('light');
  const add = (name: string, keys: Record<string, Key[]>) => { if (a[name]) a[name] = { ...a[name], keys: { ...a[name].keys, ...keys } }; };
  add('idle', { '?mane': [rz(0, 0), rz(0.5, -2), rz(1, 0)], '?tailTip': [rz(0, 0), rz(0.4, -14), rz(0.75, 6), rz(1, 0)] });
  add('andar', { '?mane': [rz(0, 0), rz(0.25, 3), rz(0.5, 0), rz(0.75, 3), rz(1, 0)], '?tailTip': [rz(0, 10), rz(0.5, -10), rz(1, 10)] });
  add('correr', {
    '?mane': [rz(0, -4), rz(0.25, 4), rz(0.5, -4), rz(0.75, 4), rz(1, -4)], '?tailTip': [rz(0, -16), rz(0.5, 12), rz(1, -16)],
    // braços longos: dobram menos que os da Tamá para não cobrir o rosto
    armR_lo: [rz(0, 40), rz(0.5, 62), rz(1, 40)], armL_lo: [rz(0, 62), rz(0.5, 40), rz(1, 62)],
  });
  add('pulo', { '?mane': [rz(0, -6), rz(0.4, 8), rz(1, 10)], '?tailTip': [rz(0, -10), rz(1, -30)] });
  add('apice', { '?mane': [rz(0, 6), rz(0.5, 2), rz(1, 6)], '?tailTip': [rz(0, -20), rz(0.5, -10), rz(1, -20)] });
  add('queda', { '?mane': [rz(0, 12), rz(0.5, 16), rz(1, 12)], '?tailTip': [rz(0, 20), rz(0.5, 30), rz(1, 20)] });
  add('dano', { '?mane': [rz(0, 0), rz(0.2, 14), rz(0.5, -8), rz(1, 0)] });
  add('vitoria', { '?tailTip': [rz(0, 0), rz(0.25, -30), rz(0.5, 10), rz(0.75, -30), rz(1, 0)] });
  add('planar', { '?tailTip': [rz(0, -40), rz(0.5, -50), rz(1, -40)] });
  return a;
}

export const lili: ModelDef = {
  id: 'lili',
  kind: 'hero',
  build,
  anims: liliAnims(),
  cell: [288, 256],
  pivot: [144, 222],
  height: 256 / 104, // 104 px por unidade → Lili (~1.3u) ≈ 135 px de altura
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro', 'por-do-sol'],
  variants: ['base', 'exploradora', 'surfista', 'festa-junina'],
};
