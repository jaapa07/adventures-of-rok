/**
 * JAVALIM ESCUDEIRO — o mesmo soldado-operário, mas atrás de um escudo improvisado com a
 * tampa de um tambor de óleo (amassada, com faixa de perigo pintada e alça de cinto).
 * Só cai com pulo em cima ou arremesso por trás.
 */
import { buildBoar } from './boar';
import { JAVALIM_COLORS } from './javalim';
import { boarAnims, pick } from '../../anims/enemies/boar';
import { k, rz, ry, ps, rx, anim } from '../../anims/enemies/common';
import { lathe, ring, blob, slab, tube, mat, bulge, wobble, D2R } from '../../render/sculpt';
import type { AnimSet } from '../../render/anim';
import type { ModelDef } from '../../render/types';

function build() {
  const r = buildBoar({ ...JAVALIM_COLORS, cloth: 0xa84a2a, helmet: 'lata', outfit: 'uniforme' });
  // braço de longe estendido à frente segurando o escudo
  r.bones.armL_up.rotation.z = 62 * D2R;
  r.bones.armL_lo.rotation.z = 50 * D2R;
  const handRot = 62 + 50; // giro acumulado do antebraço/mão no plano da tela
  r.bone('shield', 'handL', [0.0, -0.04, 0.2], [0, 0, 0]);
  r.bones.shield.rotation.z = (-handRot - 90 + 4) * D2R;
  const lid = mat('metal', 0x8f9a8c, { metal: 0.4, rough: 0.45 });
  const lidDark = mat('metal', 0x66705f, { metal: 0.4, rough: 0.5 });
  const paint = mat('paint', 0xe6b52e);
  const paintRed = mat('paint', 0xb8322a);
  const rivet = mat('metal', 0xc8c8c0, { metal: 0.5, rough: 0.3 });
  r.add('shield',
    // tampa levemente abaulada (eixo do torno -> +X depois do giro)
    lathe([[0.001, -0.02], [0.3, -0.02], [0.31, 0.0], [0.3, 0.025], [0.24, 0.045], [0.12, 0.06], [0.001, 0.065]], lid, { deform: [bulge([0.1, 0.06, 0.12], 0.12, -0.03), bulge([-0.14, 0.05, -0.08], 0.08, -0.02), wobble(0.004, 9)] }),
    // aro dobrado da tampa
    ring(0.3, 0.022, lidDark, { pos: [0, 0.0, 0], rot: [90, 0, 0] }),
    // nervuras concêntricas
    ring(0.22, 0.01, lidDark, { pos: [0, 0.042, 0], rot: [90, 0, 0] }),
    ring(0.13, 0.009, lidDark, { pos: [0, 0.055, 0], rot: [90, 0, 0] }),
    // faixa de perigo pintada (amarela com listras vermelhas)
    ...[-0.12, -0.04, 0.04, 0.12].map((x, i) => slab([[-0.035, -0.11], [0.035, -0.11], [0.035, 0.11], [-0.035, 0.11]], 0.006, i % 2 ? paintRed : paint, { pos: [x, 0.058 - Math.abs(x) * 0.08, 0], rot: [90, 0, 30], smooth: false, bevel: 0.002 })),
    // bujão do tambor
    lathe([[0.001, 0.05], [0.04, 0.05], [0.042, 0.07], [0.03, 0.08], [0.001, 0.082]], rivet, { pos: [0.16, 0.0, -0.1] }),
    ...[0, 60, 120, 180, 240, 300].map((a) => blob([0.014, 0.012, 0.014], rivet, { pos: [Math.cos(a * D2R) * 0.27, 0.03, Math.sin(a * D2R) * 0.27], seg: 10 })),
    // alça de cinto por trás
    tube([[0, -0.03, -0.1], [0, -0.08, -0.05], [0, -0.08, 0.05], [0, -0.03, 0.1]], 0.016, mat('leather', 0x3a2618), { seg: 12, radial: 6 }),
  );
  return r;
}

function escudoAnims(): AnimSet {
  const base = pick(boarAnims(1), ['idle', 'andar', 'ataque', 'dano', 'morte', 'tonto']);
  // o braço do escudo fica firme em todas as animações normais
  for (const a of Object.values(base)) for (const b of ['armL_up', 'armL_lo']) delete a.keys[b];
  base.morte.keys.armL_up = [rz(0, 0), rz(0.22, 60), rz(1, 40)];
  base.tonto.keys.armL_up = [rz(0, -20), rz(0.5, -30), rz(1, -20)];
  base.tonto.keys.shield = [rz(0, 0), rz(0.5, 10), rz(1, 0)];
  // ataque com escudo: empurrão de tampa
  base.ataque.keys.armL_up = [rz(0, 0), rz(0.3, -20), rz(0.55, 20, 'in'), rz(1, 0)];
  base.ataque.keys.armL_lo = [rz(0, 0), rz(0.3, 30), rz(0.55, -40, 'in'), rz(1, 0)];
  const escudo = anim(12, true, {
    hips: [ps(0, [-0.02, -0.07, 0]), ps(0.5, [-0.02, -0.08, 0]), ps(1, [-0.02, -0.07, 0])],
    spine: [rz(0, -14), rz(1, -14)],
    head: [rz(0, -6), rz(0.5, -2), rz(1, -6)],
    legR_up: [rz(0, 30), rz(1, 30)], legL_up: [rz(0, -10), rz(1, -10)],
    legR_lo: [rz(0, -50), rz(1, -50)], legL_lo: [rz(0, -30), rz(1, -30)],
    footR: [rz(0, 20), rz(1, 20)], footL: [rz(0, 30), rz(1, 30)],
    armL_up: [rz(0, 6), rz(1, 6)], armL_lo: [rz(0, -10), rz(1, -10)],
    armR_up: [rz(0, 70), rz(1, 70)], armR_lo: [rz(0, 60), rz(1, 60)],
    shield: [rz(0, 0), rz(0.25, 1.5), rz(0.5, 0), rz(0.75, -1.5), rz(1, 0)],
    lidR: [rx(0, 30), rx(1, 30)], lidL: [rx(0, 30), rx(1, 30)],
    browR: [ps(0, [0, -0.02, 0]), ps(1, [0, -0.02, 0])], browL: [ps(0, [0, -0.02, 0]), ps(1, [0, -0.02, 0])],
    tail1: [ry(0, -20), ry(0.5, 20), ry(1, -20)],
  });
  // virar: pulinho de meia-volta (180°) com o escudo balançando
  const virar = anim(12, false, {
    root: [ry(0, 0), ry(0.15, 0), ry(0.7, 180, 'inOut'), ry(1, 180)],
    hips: [ps(0, [0, 0, 0]), ps(0.15, [0, -0.05, 0]), ps(0.45, [0, 0.1, 0], 'out'), ps(0.75, [0, -0.04, 0], 'in'), ps(1, [0, 0, 0])],
    legR_up: [rz(0, 0), rz(0.45, 30), rz(0.75, 0)], legL_up: [rz(0, 0), rz(0.45, 20), rz(0.75, 0)],
    legR_lo: [rz(0, 0), rz(0.45, -50), rz(0.75, 0)], legL_lo: [rz(0, 0), rz(0.45, -40), rz(0.75, 0)],
    shield: [rz(0, 0), rz(0.45, 14), rz(0.8, -8), rz(1, 0)],
    head: [rz(0, 0), rz(0.45, 10), rz(1, 0)],
    lidR: [rx(0, 0), rx(0.45, -20), rx(1, 0)], lidL: [rx(0, 0), rx(0.45, -20), rx(1, 0)],
  });
  return { ...base, escudo, virar };
}

export const javalimEscudo: ModelDef = {
  id: 'javalim-escudo',
  kind: 'enemy',
  build,
  anims: escudoAnims(),
  cell: [256, 224],
  pivot: [116, 200],
  height: 224 / 104,
  presets: ['selva', 'recife', 'neutro'],
};
