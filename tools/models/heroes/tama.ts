/**
 * TAMÁ — tamanduá-bandeira, a força da dupla.
 * Bípede robusta, focinho tubular longo, faixa preta diagonal com bordas brancas no ombro,
 * antebraços claros com bracelete preto, garras enormes, cauda-bandeira peluda.
 * Acessórios: bandana verde-folha amarrada no pescoço e bolsa de couro a tiracolo.
 */
import { Rig, blob, limb, tube, slab, lathe, spike, eye, mat, taper, pull, bulge, wobble, type V3 } from '../../render/sculpt';
import { bipedAnims } from '../../anims/biped';
import type { ModelDef } from '../../render/types';

const C = {
  fur: 0x8c7a66,
  furDark: 0x6e5d4c,
  furLight: 0xcfc3ae,
  band: 0x231d1a,
  white: 0xefe6d2,
  snout: 0x5e4f43,
  nose: 0x1b1515,
  claw: 0xeadfc4,
  bandana: 0x2e8b3e,
  bandanaDark: 0x1e5d2a,
  bag: 0x6e4527,
  strap: 0x4a2d18,
  buckle: 0xd9b24a,
};

export interface Costume { bandana: number; bandanaDark: number; extra?: (r: Rig) => void }

export const TAMA_COSTUMES: Record<string, Costume> = {
  base: { bandana: C.bandana, bandanaDark: C.bandanaDark },
  pescador: {
    bandana: 0x2a5aa8, bandanaDark: 0x1a3a70,
    extra: (r) => {
      // chapéu de pescador de palha com fita azul
      const straw = mat('cloth', 0xd8b86a, { repeat: 4 });
      r.add('head',
        lathe([[0.001, 0.2], [0.13, 0.19], [0.16, 0.12], [0.17, 0.06], [0.3, 0.04], [0.32, 0.02], [0.001, 0.02]], straw, { pos: [-0.02, 0.12, 0], rot: [0, 0, 8] }),
        lathe([[0.168, 0.06], [0.172, 0.1], [0.165, 0.1], [0.16, 0.06]], mat('cloth', 0x2a5aa8), { pos: [-0.02, 0.12, 0], rot: [0, 0, 8] }),
        // anzol pendurado
        tube([[0.12, 0.2, 0.1], [0.16, 0.12, 0.12], [0.15, 0.08, 0.12]], 0.006, mat('metal', 0xc8c8c8), { pos: [-0.02, 0.0, 0] }),
      );
    },
  },
  bombeira: {
    bandana: 0xd23a2a, bandanaDark: 0x8a2018,
    extra: (r) => {
      const red = mat('plastic', 0xd23a2a);
      r.add('head',
        lathe([[0.001, 0.24], [0.12, 0.23], [0.17, 0.15], [0.19, 0.06], [0.28, 0.02], [0.3, -0.02], [0.001, 0.02]], red, { pos: [-0.04, 0.1, 0], rot: [0, 0, 10] }),
        slab([[-0.05, 0], [0.05, 0], [0.06, 0.1], [0, 0.13], [-0.06, 0.1]], 0.02, mat('metal', 0xe8c040, { metal: 0.9, rough: 0.25 }), { pos: [0.12, 0.2, 0], rot: [0, 90, 10] }),
      );
    },
  },
  capoeira: {
    bandana: 0xf2b530, bandanaDark: 0xb07a10,
    extra: (r) => {
      // abadá branco com cordão amarelo na cintura
      const cord = mat('cloth', 0xf2b530);
      r.add('hips',
        tube([[0.1, 0.1, -0.33], [0.36, 0.08, -0.12], [0.38, 0.06, 0.12], [0.12, 0.08, 0.33], [-0.18, 0.08, 0.3]], 0.025, cord),
        tube([[0.3, 0.06, 0.18], [0.34, -0.12, 0.2], [0.33, -0.24, 0.2]], 0.018, cord),
        tube([[0.28, 0.06, 0.2], [0.27, -0.1, 0.24], [0.25, -0.2, 0.25]], 0.018, cord),
      );
    },
  },
};

function build(variant: string) {
  const cos = TAMA_COSTUMES[variant] ?? TAMA_COSTUMES.base;
  const r = new Rig('root');
  const fur = mat('fur', C.fur);
  const furDark = mat('fur', C.furDark);
  const furLight = mat('shortFur', C.furLight);
  const band = mat('shortFur', C.band);
  const white = mat('shortFur', C.white);
  const snoutM = mat('skin', C.snout, { rough: 0.55 });
  const noseM = mat('skin', C.nose, { rough: 0.25 });
  const clawM = mat('shell', C.claw, { rough: 0.4, repeat: 4 });
  const bandM = mat('cloth', cos.bandana);
  const bandDarkM = mat('cloth', cos.bandanaDark);
  const bagM = mat('leather', C.bag);
  const strapM = mat('leather', C.strap);
  const buckleM = mat('metal', C.buckle, { metal: 0.9, rough: 0.3 });

  /* ---------- esqueleto ---------- */
  r.bone('hips', 'root', [0, 0.66, 0]);
  r.bone('spine', 'hips', [0, 0.18, 0]);
  r.bone('chest', 'spine', [0.02, 0.26, 0]);
  r.bone('neck', 'chest', [0.08, 0.22, 0]);
  r.bone('head', 'neck', [0.06, 0.12, 0]);
  r.bone('snout', 'head', [0.14, -0.02, 0], [0, 0, -14]);
  r.bone('snoutTip', 'snout', [0.5, 0, 0]);
  r.bone('earL', 'head', [-0.06, 0.13, -0.1]);
  r.bone('earR', 'head', [-0.06, 0.13, 0.1]);
  for (const s of ['L', 'R'] as const) {
    const z = s === 'R' ? 0.27 : -0.27;
    r.bone(`arm${s}_up`, 'chest', [0.02, 0.12, z], [0, 0, 6]);
    r.bone(`arm${s}_lo`, `arm${s}_up`, [0, -0.3, 0], [0, 0, 18]);
    r.bone(`hand${s}`, `arm${s}_lo`, [0, -0.28, 0]);
    const lz = s === 'R' ? 0.14 : -0.14;
    r.bone(`leg${s}_up`, 'hips', [0, -0.04, lz]);
    r.bone(`leg${s}_lo`, `leg${s}_up`, [0, -0.28, 0], [0, 0, -4]);
    r.bone(`foot${s}`, `leg${s}_lo`, [0, -0.27, 0]);
  }
  r.bone('tail1', 'hips', [-0.3, 0.02, 0], [0, 0, 28]);
  r.bone('tail2', 'tail1', [-0.3, 0.06, 0], [0, 0, 22]);
  r.bone('tail3', 'tail2', [-0.28, 0.04, 0], [0, 0, 18]);
  r.bone('bag', 'hips', [-0.02, 0.06, 0.3]);
  r.anchor('hand', 'handR', [0.05, -0.08, 0.04]);
  r.anchor('handL', 'handL', [0.05, -0.08, -0.04]);
  r.anchor('head', 'head', [0, 0.22, 0]);

  /* ---------- quadril e barriga ---------- */
  r.add('hips',
    blob([0.33, 0.25, 0.3], fur, { pos: [-0.02, 0.06, 0], deform: [bulge([-0.2, 0.0, 0], 0.25, 0.05), wobble(0.004)] }),
    // barriga clara
    blob([0.24, 0.22, 0.22], furLight, { pos: [0.1, 0.12, 0], scale: [0.85, 1, 1] }),
  );
  /* ---------- tronco ---------- */
  r.add('spine',
    blob([0.31, 0.3, 0.29], fur, { pos: [0.02, 0.1, 0], deform: [taper('y', -0.3, 0.3, 1.05, 0.92), wobble(0.004)] }),
    blob([0.2, 0.24, 0.2], furLight, { pos: [0.14, 0.06, 0] }),
  );
  r.add('chest',
    blob([0.3, 0.24, 0.31], fur, { pos: [0.04, 0.04, 0], deform: [pull([0.25, 0.1, 0], 0.25, [0.03, 0.02, 0])] }),
    // faixa preta diagonal do tamanduá-bandeira, com bordas brancas
    blob([0.12, 0.3, 0.34], band, { pos: [-0.02, 0.04, 0], rot: [0, 0, -38], scale: [1, 1.05, 1] }),
    blob([0.03, 0.3, 0.345], white, { pos: [0.1, 0.07, 0], rot: [0, 0, -38] }),
    blob([0.03, 0.28, 0.345], white, { pos: [-0.13, 0.0, 0], rot: [0, 0, -38] }),
    // bandana amarrada no pescoço com nó e pontas
    blob([0.24, 0.07, 0.25], bandM, { pos: [0.08, 0.2, 0], rot: [0, 0, -10] }),
    slab([[0, 0], [0.16, -0.02], [0.08, -0.2]], 0.02, bandM, { pos: [0.18, 0.18, 0.06], rot: [0, 10, -8] }),
    blob([0.05, 0.045, 0.05], bandDarkM, { pos: [-0.12, 0.22, 0.12] }),
    slab([[0, 0], [-0.12, -0.04], [-0.16, -0.12], [-0.06, -0.06]], 0.015, bandDarkM, { pos: [-0.14, 0.22, 0.14], rot: [0, 0, -10] }),
    slab([[0, 0], [-0.1, 0.02], [-0.18, -0.06], [-0.08, -0.04]], 0.015, bandDarkM, { pos: [-0.14, 0.2, 0.12], rot: [10, 0, 10] }),
    // alça da bolsa atravessando o peito
    tube([[0.2, 0.22, -0.22], [0.3, 0.05, 0.05], [0.18, -0.2, 0.28], [0, -0.42, 0.33]], 0.024, strapM),
  );
  /* ---------- bolsa de couro ---------- */
  r.add('bag',
    slab([[-0.11, -0.08], [0.11, -0.08], [0.12, 0.08], [-0.12, 0.08]], 0.08, bagM, { smooth: false, bevel: 0.025 }),
    slab([[-0.12, 0.0], [0.12, 0.0], [0.11, 0.09], [-0.11, 0.09]], 0.02, mat('leather', 0x5a3820), { pos: [0, 0.0, 0.06], smooth: false, bevel: 0.012 }),
    blob([0.025, 0.02, 0.012], buckleM, { pos: [0, 0.01, 0.085] }),
  );
  /* ---------- pescoço e cabeça ---------- */
  r.add('neck', blob([0.15, 0.16, 0.15], fur, { pos: [0.02, 0.04, 0], deform: [taper('y', -0.16, 0.16, 1.1, 0.8)] }));
  r.add('head',
    blob([0.19, 0.16, 0.16], fur, { pos: [0.02, 0.04, 0], deform: [pull([0.18, 0, 0], 0.18, [0.06, -0.02, 0]), pull([-0.15, 0.08, 0], 0.12, [-0.02, 0.03, 0])] }),
    // bochechas claras
    blob([0.1, 0.07, 0.1], furLight, { pos: [0.1, -0.04, 0.07] }),
    blob([0.1, 0.07, 0.1], furLight, { pos: [0.1, -0.04, -0.07] }),
    // sobrancelhas grossas (expressão determinada)
    slab([[-0.05, 0], [0.05, 0.01], [0.06, 0.025], [-0.05, 0.02]], 0.015, mat('shortFur', 0x3a2e24), { pos: [0.11, 0.11, 0.1], rot: [0, 18, -12] }),
    slab([[-0.05, 0], [0.05, 0.01], [0.06, 0.025], [-0.05, 0.02]], 0.015, mat('shortFur', 0x3a2e24), { pos: [0.11, 0.11, -0.1], rot: [0, -18, -12] }),
  );
  const eR = eye({ r: 0.052, iris: 0x5a3a1a, look: [0.7, 0.1], lid: 0.28, lidColor: C.furDark, angry: 6 });
  eR.position.set(0.12, 0.06, 0.1); eR.rotation.y = 0.5;
  const eL = eye({ r: 0.05, iris: 0x5a3a1a, look: [0.7, 0.1], lid: 0.28, lidColor: C.furDark, angry: -6 });
  eL.position.set(0.12, 0.06, -0.1); eL.rotation.y = -0.2;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  // focinho tubular
  r.add('snout',
    lathe([[0.1, -0.02], [0.095, 0.1], [0.08, 0.25], [0.062, 0.4], [0.05, 0.5], [0.04, 0.52], [0.001, 0.53]], snoutM, { rot: [0, 0, -90], deform: [pull([0.25, 0.0, 0], 0.4, [0, 0.015, 0])] }),
    // dobras do focinho
    lathe([[0.083, -0.012], [0.088, 0], [0.083, 0.012]], mat('skin', 0x4e4137), { rot: [0, 0, -90], pos: [0.2, 0, 0] }),
    lathe([[0.073, -0.01], [0.078, 0], [0.073, 0.01]], mat('skin', 0x4e4137), { rot: [0, 0, -90], pos: [0.32, 0, 0] }),
  );
  r.add('snoutTip',
    blob([0.045, 0.04, 0.042], noseM, { pos: [0.02, 0, 0] }),
    blob([0.01, 0.008, 0.008], mat('skin', 0x000000), { pos: [0.06, 0.01, 0.015] }),
    blob([0.01, 0.008, 0.008], mat('skin', 0x000000), { pos: [0.06, 0.01, -0.015] }),
    // língua (aparece no tédio/vitória ao rotacionar 'snoutTip')
    tube([[0.0, -0.02, 0], [0.03, -0.03, 0], [0.05, -0.03, 0]], (t) => 0.01 * (1 - t * 0.6), mat('skin', 0xd8607a, { rough: 0.3 }), { name: 'tongue' }),
  );
  for (const s of ['L', 'R'] as const) {
    r.add(`ear${s}`,
      slab([[0, 0], [0.05, 0.02], [0.06, 0.07], [0.02, 0.09], [-0.02, 0.05]], 0.025, furDark, { rot: [s === 'R' ? 20 : -20, 0, 10] }),
      slab([[0.01, 0.015], [0.04, 0.025], [0.045, 0.06], [0.02, 0.07]], 0.01, mat('skin', 0xc89a8a), { pos: [0, 0, s === 'R' ? 0.012 : -0.012], rot: [s === 'R' ? 20 : -20, 0, 10] }),
    );
  }
  /* ---------- braços: fortes, antebraço claro com bracelete preto, 3 garras ---------- */
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`arm${s}_up`,
      limb(0.3, 0.12, 0.1, fur, { deform: [bulge([0.04, -0.1, 0], 0.12, 0.02)] }),
    );
    r.add(`arm${s}_lo`,
      limb(0.27, 0.11, 0.1, white),
      lathe([[0.112, -0.03], [0.118, 0], [0.112, 0.03]], band, { pos: [0, -0.2, 0] }),
    );
    r.add(`hand${s}`,
      blob([0.1, 0.08, 0.09], white, { pos: [0.02, -0.04, 0] }),
      spike(0.17, 0.028, clawM, { pos: [0.06, -0.06, 0.04 * zs], rot: [0, 0, -150], curve: 0.4 }),
      spike(0.2, 0.032, clawM, { pos: [0.07, -0.07, 0.0], rot: [0, 0, -150], curve: 0.45 }),
      spike(0.14, 0.024, clawM, { pos: [0.06, -0.05, -0.045 * zs], rot: [0, 0, -150], curve: 0.4 }),
    );
    r.add(`leg${s}_up`, limb(0.28, 0.13, 0.1, fur));
    r.add(`leg${s}_lo`, limb(0.25, 0.1, 0.075, furDark));
    r.add(`foot${s}`,
      blob([0.13, 0.06, 0.08], furDark, { pos: [0.06, -0.01, 0], deform: [taper('x', -0.13, 0.13, 1.1, 0.8)] }),
      spike(0.06, 0.016, clawM, { pos: [0.17, -0.03, 0.035], rot: [0, 0, -90], curve: 0.3 }),
      spike(0.06, 0.016, clawM, { pos: [0.18, -0.03, 0], rot: [0, 0, -90], curve: 0.3 }),
      spike(0.06, 0.016, clawM, { pos: [0.17, -0.03, -0.035], rot: [0, 0, -90], curve: 0.3 }),
    );
  }
  /* ---------- cauda-bandeira (leque de pelos longos) ---------- */
  const tailFur = mat('fur', 0x5e4e40, { repeat: 2 });
  const strands = (n: number, len: number, spread: number): V3[][] =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i / (n - 1)) - 0.5) * spread;
      return [[0, 0, 0], [-len * 0.5, Math.sin(a) * len * 0.35 + 0.02, Math.cos(a) * 0.02], [-len, Math.sin(a) * len * 0.6, 0]] as V3[];
    });
  r.add('tail1', blob([0.26, 0.15, 0.13], tailFur, { pos: [-0.12, 0.02, 0], deform: [wobble(0.006)] }));
  r.add('tail2', blob([0.28, 0.21, 0.11], tailFur, { pos: [-0.14, 0.03, 0] }));
  r.add('tail3', blob([0.26, 0.25, 0.09], tailFur, { pos: [-0.12, 0.02, 0], deform: [taper('x', -0.3, 0.1, 0.6, 1)] }));
  for (const [i, pts] of strands(5, 0.36, 1.6).entries()) {
    r.add('tail3', tube(pts.map(([x, y, z]) => [x - 0.08, y + 0.02, z + (i - 2) * 0.012] as V3), (t) => 0.045 * (1 - t) + 0.008, i % 2 ? tailFur : furDark, { seg: 16, radial: 8 }));
  }
  for (const [i, pts] of strands(4, 0.28, 1.4).entries()) {
    r.add('tail2', tube(pts.map(([x, y, z]) => [x - 0.08, y + 0.08, z + (i - 1.5) * 0.015] as V3), (t) => 0.04 * (1 - t) + 0.008, furDark, { seg: 16, radial: 8 }));
  }
  cos.extra?.(r);
  return r;
}

export const tama: ModelDef = {
  id: 'tama',
  kind: 'hero',
  build,
  anims: bipedAnims('heavy'),
  cell: [320, 288],
  pivot: [160, 250],
  height: 288 / 104, // ~104 px por unidade → Tamá (~1.6u) ≈ 165 px de altura
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro', 'por-do-sol'],
  variants: ['base', 'pescador', 'bombeira', 'capoeira'],
};
