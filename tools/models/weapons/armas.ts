/**
 * ARSENAL IMPROVISADO — as 14 armas de mão (seção 17 da spec), esculpidas no espaço da mão:
 * empunhadura na origem, objeto apontando para +X, frente (+Z) virada para a câmera.
 */
import { blob, tube, slab, lathe, roundBox, ring, spike, mat, wobble, taper, bulge, type V3, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, wedge, rope, leaf, nail, sparkle, additive, star, dbl } from '../props/kit';
import { flame } from '../props/diversos';
import { makeWeapon } from './base';

const D = Math.PI / 180;

/* ------------------------------ GALHO TORTO ------------------------------ */
const galho = makeWeapon({
  id: 'galho',
  scale: 1.25,
  restTilt: 4,
  build({ piece }) {
    const bark = mat('bark', 0x6e4c2c, { repeat: 3 });
    const barkL = mat('bark', 0x8a6238, { repeat: 3 });
    const cut = mat('wood', 0xd8b07a);
    const vine = mat('bark', 0x4a6a24, { repeat: 4 });
    const leafM = mat('leaf', 0x5aa83a);
    const leafM2 = mat('leaf', 0x7ab83a);
    const R = (t: number) => 0.042 - t * 0.022;
    piece('base',
      tube([[-0.08, -0.01, 0], [0.08, 0.02, 0], [0.22, 0.0, 0.01], [0.34, 0.05, 0]], (t) => R(t * 0.35), bark, { seg: 24, radial: 12, deform: [wobble(0.003, 30)] }),
      blob([0.03, 0.044, 0.044], cut, { pos: [-0.09, -0.012, 0], rot: [0, 0, 8], seg: 14 }),
      // cipó enrolado na empunhadura
      tube(Array.from({ length: 22 }, (_, i) => { const a = i * 0.9; return [-0.04 + i * 0.0075, Math.sin(a) * 0.045, Math.cos(a) * 0.045] as V3; }), 0.008, vine, { seg: 60, radial: 6 }),
    );
    piece('mid',
      tube([[0.34, 0.05, 0], [0.46, 0.02, -0.01], [0.6, 0.08, 0], [0.66, 0.06, 0]], (t) => R(0.35 + t * 0.35), barkL, { seg: 24, radial: 12, deform: [wobble(0.003, 30)] }),
      blob([0.03, 0.025, 0.03], bark, { pos: [0.46, 0.03, 0.02], seg: 12 }),
      blob([0.012, 0.01, 0.006], mat('wood', 0x2a1808), { pos: [0.46, 0.032, 0.046], seg: 10 }),
    );
    piece('tip',
      tube([[0.66, 0.06, 0], [0.78, 0.12, 0.01], [0.9, 0.1, 0]], (t) => R(0.7 + t * 0.3), bark, { seg: 18, radial: 10 }),
      leaf(0.12, 0.06, leafM, { pos: [0.9, 0.1, 0], rot: [0, 0, -70] }),
      leaf(0.1, 0.05, leafM2, { pos: [0.88, 0.1, 0], rot: [20, 0, -20] }),
    );
    piece('twig',
      tube([[0.42, 0.03, 0], [0.48, 0.12, 0.01], [0.5, 0.2, 0.02]], (t) => 0.016 - t * 0.008, barkL, { seg: 12, radial: 8 }),
      leaf(0.11, 0.055, leafM, { pos: [0.5, 0.2, 0.02], rot: [0, 0, 10] }),
      leaf(0.09, 0.05, leafM2, { pos: [0.49, 0.17, 0.02], rot: [10, 0, 60] }),
      leaf(0.08, 0.045, leafM, { pos: [0.49, 0.15, 0.0], rot: [-20, 0, -50] }),
    );
  },
});

/* ------------------------------ COCO VERDE ------------------------------ */
const COCO: V2[] = [[0.001, -0.15], [0.07, -0.135], [0.118, -0.08], [0.13, 0.0], [0.12, 0.07], [0.085, 0.12], [0.035, 0.15], [0.001, 0.158]];
const coco = makeWeapon({
  id: 'coco',
  build({ piece }) {
    const green = mat('gourd', 0x5a9a2a);
    const green2 = mat('gourd', 0x7ab03a);
    const flesh = mat('skin', 0xf8f4e8, { rough: 0.5 });
    const water = mat('water', 0xd8f0ff);
    const brown = mat('bark', 0x6a4a2a);
    const C = 0.14;
    for (let i = 0; i < 4; i++) {
      const ph = i * 90 + 10;
      piece(`g${i}`,
        wedge(COCO, i % 2 ? green : green2, ph, 90, { rot: [0, 0, -90], pos: [C, 0, 0], seg: 10 }),
        wedge(COCO.map(([r, y]) => [r * 0.86, y * 0.9] as V2), flesh, ph, 90, { rot: [0, 0, -90], pos: [C, 0, 0], seg: 10 }),
      );
    }
    // coroa (topo com os 3 "olhos") e base do cabinho
    piece('top',
      blob([0.035, 0.05, 0.05], brown, { pos: [C + 0.15, 0, 0], seg: 14 }),
      ...[0, 120, 240].map((a) => blob([0.01, 0.012, 0.012], mat('bark', 0x2a1a0e), { pos: [C + 0.183, Math.sin(a * D) * 0.02, Math.cos(a * D) * 0.02], seg: 10 })),
    );
    piece('stem',
      lathe([[0.001, 0], [0.045, 0], [0.05, 0.02], [0.03, 0.05], [0.001, 0.05]], brown, { rot: [0, 0, 90], pos: [C - 0.14, 0, 0] }),
      tube([[C - 0.18, 0, 0], [-0.01, 0.01, 0]], 0.012, brown),
    );
    piece('water', blob([0.08, 0.08, 0.08], water, { pos: [C, 0, 0], castShadow: false }));
    // furo aberto a facão com canudo listrado espetado
    piece('top',
      ring(0.03, 0.008, mat('skin', 0xf8f4e8), { pos: [C + 0.12, 0.08, 0.0], rot: [0, 90, 50] }),
      tube([[C + 0.12, 0.08, 0], [C + 0.2, 0.2, 0.02], [C + 0.22, 0.26, 0.02]], 0.011, mat('plastic', 0xf4f0e8), { seg: 16 }),
      ...[0, 1, 2, 3].map((k) => lathe([[0.0118, -0.008], [0.0122, 0], [0.0118, 0.008]], mat('plastic', 0xe83a5a), { pos: [C + 0.135 + k * 0.02, 0.1 + k * 0.03, 0.005], rot: [0, 0, -34] })),
    );
  },
});

/* ------------------------------ JACA MADURA ------------------------------ */
const JACA: V2[] = Array.from({ length: 41 }, (_, i) => { const v = -Math.PI / 2 + (i / 40) * Math.PI; return [Math.cos(v) * 0.18 * (1 + Math.sin(v) * 0.06), Math.sin(v) * 0.29] as V2; });
const spiky = (p: { x: number; y: number; z: number }) => {
  const r = Math.hypot(p.x, p.z);
  if (r < 1e-4) return;
  const phi = Math.atan2(p.x, p.z);
  const b = Math.abs(Math.sin(phi * 11) * Math.sin(p.y * 62 + (Math.sin(phi * 11) > 0 ? 0 : 1.57)));
  const k = 1 + (b ** 3) * 0.12;
  p.x *= k; p.z *= k;
};
const jaca = makeWeapon({
  id: 'jaca',
  scale: 1.3,
  restTilt: -3,
  build({ piece }) {
    const skin = mat('skin', 0x9aaa3a, { rough: 0.7 });
    const skin2 = mat('skin', 0xb0aa40, { rough: 0.7 });
    const pulp = mat('skin', 0xffc83a, { rough: 0.35, emissive: 0xc08000, emissiveIntensity: 0.15 });
    const white = mat('skin', 0xf0e4b0, { rough: 0.6 });
    const stem = mat('bark', 0x5a3e24);
    const C = 0.36;
    for (let i = 0; i < 4; i++) {
      const ph = i * 90;
      const m = i % 2 ? skin : skin2;
      piece(`g${i}`,
        wedge(JACA, m, ph, 90, { rot: [0, 0, -90], pos: [C, 0, 0], seg: 22, deform: [spiky] }),
        wedge(JACA.map(([r, y]) => [r * 0.88, y * 0.94] as V2), white, ph, 90, { rot: [0, 0, -90], pos: [C, 0, 0], seg: 10 }),
        // gomos amarelos dentro
        ...[-0.12, 0.0, 0.12].map((y, k) => blob([0.05, 0.035, 0.035], pulp, { pos: [C + y, Math.sin((ph + 45) * D) * 0.08 * (k === 1 ? 1.1 : 0.9), Math.cos((ph + 45) * D) * 0.08], seg: 14 })),
      );
    }
    // manchas marrons de madura
    piece('g1', blob([0.06, 0.04, 0.015], mat('skin', 0x6a5a20), { pos: [C + 0.08, 0.04, 0.19], rot: [0, 0, 20] }));
    piece('g0', blob([0.045, 0.03, 0.015], mat('skin', 0x6a5a20), { pos: [C - 0.1, -0.06, 0.18] }));
    piece('stem',
      tube([[-0.02, 0, 0], [0.04, 0.01, 0], [0.08, 0, 0]], 0.022, stem),
      lathe([[0.001, 0], [0.05, 0.0], [0.04, 0.03], [0.001, 0.035]], stem, { rot: [0, 0, -90], pos: [0.075, 0, 0] }),
      // gota de visgo grudento
      blob([0.012, 0.02, 0.012], mat('glass', 0xfff8d0, { opacity: 0.8 }), { pos: [0.09, -0.04, 0.03] }),
    );
  },
});

/* ------------------------------ REMO ------------------------------ */
const remo = makeWeapon({
  id: 'remo',
  scale: 1.15,
  restTilt: 2,
  build({ piece }) {
    const wood = mat('wood', 0xb07a42, { repeat: 1.5 });
    const dark = mat('wood', 0x7a4e26);
    const red = mat('paint', 0xc8402a);
    const white = mat('paint', 0xf4ecd8);
    const blue = mat('paint', 0x2a6ab0);
    const ropeM = mat('cloth', 0xc8a868, { repeat: 6 });
    piece('grip',
      tube([[-0.22, 0, 0], [0.2, 0, 0]], 0.026, wood, { seg: 10 }),
      tube([[-0.22, -0.07, 0], [-0.24, 0, 0], [-0.22, 0.07, 0]], 0.03, dark, { seg: 10 }),
      tube(Array.from({ length: 16 }, (_, i) => { const a = i * 1.3; return [-0.06 + i * 0.008, Math.sin(a) * 0.029, Math.cos(a) * 0.029] as V3; }), 0.007, ropeM, { seg: 50, radial: 6 }),
    );
    piece('shaft', tube([[0.2, 0, 0], [0.56, 0, 0]], 0.025, wood, { seg: 10 }), lathe([[0.03, -0.02], [0.034, 0], [0.03, 0.02]], red, { rot: [0, 0, -90], pos: [0.3, 0, 0] }));
    const bladeO: V2[] = [[0.54, 0], [0.62, 0.07], [0.8, 0.1], [0.98, 0.085], [1.06, 0.0], [0.98, -0.085], [0.8, -0.1], [0.62, -0.07]];
    piece('blade',
      slab(bladeO, 0.022, wood, { bevel: 0.008, deform: [(p) => { p.z *= 1 - Math.abs(p.y) * 3; }] }),
      // pintura: faixa vermelha, peixinho branco e olho azul
      slab([[0.62, 0.06], [0.68, 0.085], [0.68, -0.085], [0.62, -0.06]], 0.004, red, { pos: [0, 0, 0.022], smooth: false }),
      slab([[0.78, 0], [0.84, 0.035], [0.93, 0.025], [0.96, 0], [0.93, -0.025], [0.84, -0.035]], 0.004, white, { pos: [0, 0, 0.022] }),
      slab([[0.74, 0.0], [0.78, 0.03], [0.78, -0.03]], 0.004, white, { pos: [0, 0, 0.022], smooth: false }),
      blob([0.008, 0.008, 0.003], blue, { pos: [0.92, 0.006, 0.017] }),
    );
  },
});

/* ------------------------------ VASSOURA DE PIAÇAVA ------------------------------ */
const vassoura = makeWeapon({
  id: 'vassoura',
  scale: 1.25,
  build({ piece }) {
    const wood = mat('wood', 0xc89a5a, { repeat: 1.5 });
    const fiber = mat('wood', 0x8a5a2a);
    const fiber2 = mat('wood', 0x6a4220);
    const wire = mat('metal', 0xb0a898, { metal: 0.5, rough: 0.35 });
    const red = mat('paint', 0xc83a2a);
    piece('stickA', tube([[-0.2, 0, 0], [0.2, 0, 0]], 0.022, wood, { seg: 8 }), lathe([[0.001, 0], [0.024, 0], [0.028, 0.015], [0.001, 0.02]], red, { rot: [0, 0, 90], pos: [-0.2, 0, 0] }), ring(0.012, 0.004, wire, { pos: [-0.235, 0, 0], rot: [0, 90, 0] }));
    piece('stickB', tube([[0.2, 0, 0], [0.56, 0, 0]], 0.022, wood, { seg: 8 }));
    // cabeça amarrada com arame
    piece('head',
      lathe([[0.03, -0.06], [0.05, -0.03], [0.055, 0.03], [0.06, 0.06]], fiber2, { rot: [0, 0, -90], pos: [0.6, 0, 0] }),
      ...[0.57, 0.6, 0.63].map((x) => ring(0.055, 0.006, wire, { pos: [x, 0, 0], rot: [0, 90, 0] })),
    );
    // fios de piaçava em leque (duas metades para a quebra)
    for (const half of [0, 1]) {
      const fibers = [];
      for (let i = 0; i < 16; i++) {
        const a = ((i / 15) - 0.5) * 1.0;
        const zz = ((i * 7) % 5 - 2) * 0.016;
        if ((i % 2) !== half) continue;
        fibers.push(tube([[0.64, Math.sin(a) * 0.04, zz], [0.78, Math.sin(a) * 0.1, zz * 1.4], [0.95 + (i % 3) * 0.02, Math.sin(a) * 0.17, zz * 2]], 0.006, i % 3 ? fiber : fiber2, { seg: 10, radial: 5 }));
      }
      piece(`fib${half}`, ...fibers);
    }
  },
});

/* ------------------------------ PANELA DE BARRO ------------------------------ */
const POT: V2[] = [[0.001, -0.1], [0.11, -0.1], [0.15, -0.07], [0.17, -0.01], [0.16, 0.05], [0.14, 0.085], [0.145, 0.1], [0.155, 0.105], [0.14, 0.11], [0.125, 0.09], [0.12, 0.0], [0.12, -0.08], [0.001, -0.085]];
const panela = makeWeapon({
  id: 'panela',
  restTilt: 0,
  build({ piece }) {
    const clay = mat('earth', 0xb8603a, { repeat: 1, rough: 0.85 });
    const clay2 = mat('earth', 0xa85232, { repeat: 1, rough: 0.85 });
    const soot = mat('earth', 0x3a2418);
    const white = mat('paint', 0xf0e0c0, { rough: 0.7 });
    const C = 0.24;
    const N = 5;
    for (let i = 0; i < N; i++) {
      const ph = i * 72 - 20;
      const parts = [
        wedge(POT, i % 2 ? clay : clay2, ph, 72, { pos: [C, 0, 0], seg: 10, deform: [
          // bico puxado no lado +X (phi ≈ 90°)
          (p) => { const phi = Math.atan2(p.x, p.z); const d = Math.abs(phi - Math.PI / 2); if (p.y > 0.06 && d < 0.5) { const f = (1 - d / 0.5) * ((p.y - 0.06) / 0.05); p.x += f * 0.05; p.y += f * 0.012; } },
        ] }),
        // faixa ondulada pintada
        wedge([[0.168, 0.0], [0.171, 0.012], [0.169, 0.024]], white, ph, 72, { pos: [C, 0, 0], seg: 10, deform: [(p) => { const phi = Math.atan2(p.x, p.z); p.y += Math.sin(phi * 10) * 0.008; }] }),
        // fuligem no fundo
        wedge([[0.112, -0.102], [0.152, -0.072], [0.166, -0.04]], soot, ph, 72, { pos: [C, 0, 0], seg: 10 }),
      ];
      piece(`s${i}`, ...parts);
    }
    // cordão de embira amarrado abaixo da borda, com nó e pontas
    piece('s1', ring(0.163, 0.007, mat('cloth', 0xc8a868, { repeat: 6 }), { pos: [C, 0.065, 0], rot: [90, 0, 0] }));
    piece('s0', blob([0.016, 0.014, 0.012], mat('cloth', 0xc8a868), { pos: [C + 0.02, 0.065, 0.165] }),
      tube([[C + 0.02, 0.06, 0.168], [C + 0.03, 0.02, 0.172], [C + 0.025, -0.01, 0.17]], 0.005, mat('cloth', 0xc8a868)),
      tube([[C + 0.02, 0.06, 0.168], [C + 0.0, 0.025, 0.172], [C - 0.01, 0.0, 0.168]], 0.005, mat('cloth', 0xc8a868)));
    // rachadura na frente
    piece('s0', tube([[C + 0.02, 0.09, 0.15], [C + 0.04, 0.05, 0.165], [C + 0.02, 0.02, 0.17], [C + 0.05, -0.03, 0.163]], 0.005, soot, { seg: 12, radial: 5 }));
    // alças em orelha (a da esquerda é a empunhadura)
    piece('handle',
      tube([[0.0, 0.03, -0.06], [-0.04, 0.035, 0], [0.0, 0.03, 0.06]], 0.02, clay, { seg: 14, radial: 8 }),
      tube([[0.09, 0.04, -0.05], [0.0, 0.03, -0.06]], 0.02, clay, { seg: 6 }),
      tube([[0.09, 0.04, 0.05], [0.0, 0.03, 0.06]], 0.02, clay, { seg: 6 }),
      // fitinha de pano amarrada
      tube([[-0.035, 0.035, -0.02], [-0.06, 0.0, 0.0], [-0.08, -0.05, 0.02]], 0.008, mat('cloth', 0x3a8a4a)),
    );
  },
  extra: () => ({
    capacete: { frames: 1, loop: false, keys: { w: [{ t: 0, r: [0, 0, 180], p: [0.24, 0.02, 0] }] } },
  }),
});

/* ------------------------------ LAMPARINA ------------------------------ */
const lamparina = makeWeapon({
  id: 'lamparina',
  presets: ['caverna', 'selva', 'neutro'],
  build({ piece }) {
    const tin = mat('metal', 0xc8c0a8, { metal: 0.5, rough: 0.35 });
    const tinDark = mat('metal', 0x8a8070, { metal: 0.5, rough: 0.45 });
    const wire = mat('metal', 0x6a6460, { metal: 0.5, rough: 0.5 });
    const label = mat('paint', 0x2a7a4a);
    const yellow = mat('paint', 0xf4c030);
    const f1 = mat('glow', 0xff7a1a, { emissiveIntensity: 1 });
    const f2 = mat('glow', 0xffe070, { emissiveIntensity: 1.4 });
    const X = 0.14, Y = -0.2;
    piece('body',
      lathe([[0.001, 0], [0.075, 0], [0.08, 0.01], [0.08, 0.12], [0.075, 0.13], [0.03, 0.16], [0.001, 0.165]], tin, { pos: [X, Y, 0], seg: 28 }),
      lathe([[0.081, 0.03], [0.082, 0.045], [0.082, 0.09], [0.081, 0.105]], label, { pos: [X, Y, 0], seg: 28 }),
      star(5, 0.022, 0.01, 0.004, yellow, { pos: [X, Y + 0.068, 0.082] }),
      ...[0.01, 0.12].map((y) => lathe([[0.081, -0.004], [0.085, 0], [0.081, 0.004]], tinDark, { pos: [X, Y + y, 0], seg: 28 })),
      tube([[X, Y + 0.16, 0], [X, Y + 0.2, 0]], 0.012, tinDark),
      // costura vertical rebitada e fuligem no ombro
      tube([[X - 0.081, Y + 0.012, 0.0], [X - 0.081, Y + 0.12, 0.0]], 0.004, tinDark),
      ...[0.03, 0.06, 0.09].map((y) => blob([0.006, 0.006, 0.004], tinDark, { pos: [X - 0.082, Y + y, 0.006] })),
      blob([0.05, 0.012, 0.04], mat('paint', 0x2a2420, { rough: 0.9 }), { pos: [X + 0.01, Y + 0.145, 0.02], rot: [20, 0, -25] }),
    );
    piece('flame',
      tube([[X, Y + 0.2, 0], [X, Y + 0.215, 0]], 0.006, mat('cloth', 0x2a2a2a)),
      flame(0.1, 0.03, f1, { pos: [X, Y + 0.205, 0] }),
      flame(0.06, 0.017, f2, { pos: [X, Y + 0.21, 0.005] }),
      blob([0.12, 0.12, 0.12], additive(mat('glow', 0xffa040, { emissiveIntensity: 0.4, opacity: 0.16 })), { pos: [X, Y + 0.24, 0], castShadow: false }),
    );
    piece('bail',
      tube([[X - 0.085, Y + 0.08, 0], [X - 0.1, Y + 0.17, 0], [-0.02, -0.01, 0], [0.0, 0.0, 0], [0.04, 0.0, 0], [X + 0.1, Y + 0.17, 0.0], [X + 0.085, Y + 0.08, 0]], 0.006, wire, { seg: 40, radial: 6 }),
      ring(0.012, 0.004, wire, { pos: [X - 0.085, Y + 0.08, 0], rot: [0, 90, 0] }),
      ring(0.012, 0.004, wire, { pos: [X + 0.085, Y + 0.08, 0], rot: [0, 90, 0] }),
      tube([[-0.015, 0.0, 0], [0.035, 0.0, 0]], 0.014, mat('wood', 0x8a5a2a)),
    );
  },
});

/* ------------------------------ CHAVE INGLESA GIGANTE ------------------------------ */
const chave = makeWeapon({
  id: 'chave',
  build({ piece }) {
    const steel = mat('metal', 0xc8ccd4, { metal: 0.5, rough: 0.28 });
    const steelD = mat('metal', 0x8a9098, { metal: 0.5, rough: 0.35 });
    const rubber = mat('rubber', 0xc8302a);
    const rubberD = mat('rubber', 0x8a1a12);
    const oil = mat('paint', 0x2a2420, { rough: 0.3 });
    piece('handle',
      slab([[-0.12, -0.04], [0.5, -0.032], [0.6, -0.04], [0.6, 0.04], [0.5, 0.032], [-0.12, 0.04], [-0.15, 0.0]], 0.04, steel, { bevel: 0.012 }),
      roundBox([0.3, 0.1, 0.07], 0.035, rubber, { pos: [0.02, 0, 0] }),
      ...[-0.08, -0.02, 0.04, 0.1].map((x) => roundBox([0.012, 0.104, 0.074], 0.006, rubberD, { pos: [x, 0, 0] })),
      ring(0.022, 0.008, steelD, { pos: [-0.135, 0, 0.0] }),
      // régua gravada no cabo e estrela estampada
      ...[0.2, 0.24, 0.28, 0.32, 0.36, 0.4, 0.44].map((x, k) => roundBox([0.004, k % 2 ? 0.02 : 0.035, 0.004], 0.001, steelD, { pos: [x, 0.012, 0.03] })),
      star(5, 0.018, 0.008, 0.004, steelD, { pos: [0.52, 0.0, 0.031] }),
    );
    piece('head',
      slab([[0.58, -0.07], [0.74, -0.08], [0.82, -0.04], [0.86, 0.02], [0.86, 0.06], [0.78, 0.06], [0.76, 0.02], [0.66, 0.02], [0.66, 0.06], [0.58, 0.06]], 0.05, steel, { smooth: false, bevel: 0.014 }),
      blob([0.025, 0.012, 0.004], oil, { pos: [0.72, -0.04, 0.035] }),
      nail(0.012, steelD, { pos: [0.62, -0.03, 0.035] }),
    );
    piece('jaw',
      slab([[0.62, 0.08], [0.66, 0.08], [0.66, 0.12], [0.8, 0.13], [0.86, 0.11], [0.86, 0.15], [0.78, 0.2], [0.62, 0.18]], 0.05, steelD, { smooth: false, bevel: 0.014 }),
    );
    piece('screw',
      ...Array.from({ length: 6 }, (_, i) => ring(0.022, 0.01, steel, { pos: [0.64 + i * 0.016, 0.06, 0], rot: [0, 90, 0] })),
    );
  },
});

/* ------------------------------ PEIXE SECO ------------------------------ */
const peixe = makeWeapon({
  id: 'peixe',
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
  build({ piece }) {
    const skin = mat('scale', 0xc8a058, { repeat: 1.5 });
    const skinD = mat('scale', 0x9a7838, { repeat: 1.5 });
    const fin = mat('skin', 0xa8803a, { rough: 0.6 });
    const salt = mat('crystal', 0xffffff, { opacity: 0.9 });
    const string = mat('cloth', 0xe8dcc0, { repeat: 6 });
    const dark = mat('paint', 0x2a1a10);
    const flat = (p: { z: number; y: number }) => { p.z *= 0.6; };
    piece('tail',
      slab([[0.0, 0.0], [-0.05, 0.08], [-0.03, 0.0], [-0.05, -0.08]], 0.016, fin, { pos: [0.05, 0, 0] }),
      tube([[0.05, 0, 0], [0.12, 0.0, 0]], 0.025, skinD, { scale: [1, 1, 0.6] }),
      ring(0.03, 0.006, string, { pos: [0.08, 0, 0], rot: [0, 90, 0], scale: [1, 1, 0.7] }),
      tube([[0.08, 0.03, 0], [0.04, 0.05, 0.0], [0.0, 0.0, 0]], 0.005, string),
    );
    piece('rear', blob([0.13, 0.065, 0.04], skin, { pos: [0.22, 0.0, 0], deform: [taper('x', -0.13, 0.13, 0.5, 1), flat] }),
      slab([[0.15, 0.05], [0.24, 0.1], [0.3, 0.06]], 0.01, fin, {}),
      slab([[0.17, -0.04], [0.23, -0.08], [0.27, -0.05]], 0.01, fin, {}));
    piece('front', blob([0.12, 0.075, 0.042], skinD, { pos: [0.4, 0.0, 0], deform: [flat] }),
      slab([[0.33, 0.065], [0.42, 0.11], [0.46, 0.07]], 0.01, fin, {}),
      // cristais de sal
      ...[[0.36, 0.03], [0.42, -0.02], [0.3, -0.01], [0.24, 0.03], [0.45, 0.04]].map(([x, y], i) => blob([0.008, 0.008, 0.006], salt, { pos: [x, y, 0.025 + (i % 2) * 0.002], rot: [0, 0, i * 30] })),
    );
    piece('head',
      blob([0.08, 0.068, 0.04], skin, { pos: [0.55, 0.0, 0], deform: [taper('x', -0.08, 0.08, 1, 0.55)] }),
      // olho em X (peixe seco)
      tube([[0.565, 0.035, 0.035], [0.59, 0.01, 0.035]], 0.004, dark), tube([[0.565, 0.01, 0.035], [0.59, 0.035, 0.035]], 0.004, dark),
      tube([[0.6, -0.025, 0.02], [0.625, -0.02, 0.012]], 0.004, dark),
      slab([[0.5, 0.0], [0.53, 0.06], [0.52, -0.05]], 0.006, skinD, { pos: [0, 0, 0.03] }),
    );
  },
});

/* ------------------------------ ESTILINGUE DE FORQUILHA ------------------------------ */
const estilingue = makeWeapon({
  id: 'estilingue',
  build({ piece }) {
    const wood = mat('wood', 0x9a6a3a, { repeat: 1.5 });
    const leather = mat('leather', 0x6a3a1e);
    // elástico vermelho vivo e bolsinha de couro cru: contraste forte com a forquilha marrom
    const band = mat('rubber', 0xe23a2a, { rough: 0.55, rim: 0.7 });
    const bandDark = mat('rubber', 0x9a1e18, { rough: 0.6 });
    const pouchM = mat('leather', 0xf2deb0, { rim: 0.7 });
    const stitch = mat('cloth', 0x5a2e16, { repeat: 6 });
    const nut = mat('paint', 0xe0982c, { metal: 0.4, rough: 0.3, emissive: 0x7a4200, emissiveIntensity: 0.25 });
    piece('handle',
      tube([[-0.08, 0, 0], [0.06, 0, 0], [0.15, 0.0, 0]], (t) => 0.03 - t * 0.004, wood, { seg: 14 }),
      tube(Array.from({ length: 14 }, (_, i) => { const a = i * 1.4; return [-0.06 + i * 0.009, Math.sin(a) * 0.032, Math.cos(a) * 0.032] as V3; }), 0.007, leather, { seg: 40, radial: 6 }),
    );
    for (const [name, sy] of [['armU', 1], ['armD', -1]] as const) {
      piece(name,
        tube([[0.14, 0.0, 0], [0.22, 0.06 * sy, 0], [0.29, 0.14 * sy, 0], [0.34, 0.17 * sy, 0]], (t) => 0.025 - t * 0.007, wood, { seg: 16 }),
        // amarração do elástico: três voltas grossas e o nó
        ...[0, 1, 2].map((i) => ring(0.021 - i * 0.001, 0.009, i === 1 ? bandDark : band, { pos: [0.305 + i * 0.014, (0.148 + i * 0.008) * sy, 0], rot: [0, 90, 32 * sy] })),
        blob([0.016, 0.016, 0.016], band, { pos: [0.325, 0.158 * sy, 0.026] }),
      );
    }
    // tiras largas de borracha descendo das pontas até a bolsinha, que fica solta à frente do cabo
    const strip = (sy: number) => tube([[0.32, 0.158 * sy, 0.02], [0.24, 0.115 * sy, 0.07], [0.15, 0.06 * sy, 0.105], [0.1, 0.036 * sy, 0.11]], (t) => 0.017 - Math.sin(t * Math.PI) * 0.004, band, { seg: 16, radial: 10 });
    piece('pouch',
      strip(1), strip(-1),
      // bolsinha: couro claro dobrado em concha, com pesponto escuro na borda e ilhoses onde o elástico prende
      blob([0.05, 0.062, 0.02], pouchM, { pos: [0.085, 0, 0.11], deform: [(p) => { p.z -= (p.y * p.y) * 3 + (p.x * p.x) * 2; }] }),
      ring(0.05, 0.0045, stitch, { pos: [0.085, 0, 0.113], scale: [0.86, 1.07, 1], deform: [(p) => { p.z -= (p.y * p.y) * 3 + (p.x * p.x) * 2; }] }),
      blob([0.012, 0.012, 0.008], bandDark, { pos: [0.1, 0.042, 0.112] }),
      blob([0.012, 0.012, 0.008], bandDark, { pos: [0.1, -0.042, 0.112] }),
      // munição: uma castanha dourada já encaixada
      blob([0.026, 0.036, 0.022], nut, { pos: [0.082, 0, 0.128], deform: [taper('y', -0.036, 0.036, 1.15, 0.7)] }),
    );
  },
});

/* ------------------------------ PEDAÇO DE CUPINZEIRO ------------------------------ */
const cupinzeiro = makeWeapon({
  id: 'cupinzeiro',
  spin: 0.7,
  build({ piece }) {
    const clay = [mat('earth', 0xc8844a), mat('earth', 0xb06e3a), mat('earth', 0xd8985a)];
    const hole = mat('earth', 0x2a1408);
    const ant = mat('skin', 0xe8d8b0, { rough: 0.4 });
    const head = mat('skin', 0x8a3a1a, { rough: 0.35 });
    // pedaço de torre de cupinzeiro: coluna canelada que afina, base partida, cada gomo num osso para quebrar
    const prof: V2[] = [[0.001, -0.13], [0.15, -0.13], [0.155, -0.06], [0.135, 0.04], [0.11, 0.13], [0.08, 0.2], [0.05, 0.25], [0.02, 0.27], [0.001, 0.27]];
    const flute = (q: { x: number; y: number; z: number }) => {
      const phi = Math.atan2(q.x, q.z);
      const k = 1 + Math.sin(phi * 7 + q.y * 6) * 0.07 + Math.sin(phi * 3 - q.y * 11) * 0.04;
      q.x *= k; q.z *= k;
      if (q.y > 0.2) { q.x += 0.02 * (q.y - 0.2) / 0.07; }
    };
    for (let i = 0; i < 4; i++) {
      const ph = i * 90 + 20;
      const parts: import('three').Object3D[] = [
        wedge(prof, clay[i % 3], ph, 90, { pos: [0.2, 0, 0], seg: 12, deform: [flute, wobble(0.006, 17)] }),
        wedge(prof.map(([r, y]) => [r * 0.8, y] as V2), mat('earth', 0x6a3a1c), ph, 90, { pos: [0.2, 0, 0], seg: 8 }),
      ];
      for (let k = 0; k < 3; k++) {
        const a = (ph + 20 + k * 25) * D, y = -0.06 + k * 0.09 + (i % 2) * 0.03;
        const rr = (0.15 - (y + 0.06) * 0.25) * 1.06;
        parts.push(blob([0.016, 0.02, 0.01], hole, { pos: [0.2 + Math.sin(a) * rr, y, Math.cos(a) * rr], rot: [0, a / D, 0] }));
      }
      piece(`c${i}`, ...parts);
    }
    // torrinha lateral
    piece('c4', lathe([[0.001, 0], [0.04, 0.0], [0.03, 0.08], [0.015, 0.13], [0.001, 0.14]], clay[2], { pos: [0.33, 0.0, 0.04], rot: [0, 0, -25], deform: [wobble(0.005, 23)] }));
    // cupins passeando
    const termite = (x: number, y: number, z: number, a: number) => grp([
      blob([0.012, 0.008, 0.008], ant, { pos: [-0.012, 0, 0] }), blob([0.008, 0.007, 0.007], ant), blob([0.008, 0.007, 0.007], head, { pos: [0.012, 0, 0] }),
      tube([[0.016, 0.004, 0], [0.024, 0.01, 0.005]], 0.0015, head, { seg: 4, radial: 3 }),
    ], [x, y, z], [0, 0, a]);
    piece('c0', termite(0.24, 0.06, 0.14, 30), termite(0.16, -0.02, 0.15, -20));
    piece('c1', termite(0.24, 0.16, 0.1, 70));
    piece('c3', termite(0.1, -0.08, 0.1, 160));
  },
});

/* ------------------------------ GUARDA-CHUVA DE FOLHA ------------------------------ */
const guardaChuva = makeWeapon({
  id: 'guarda-chuva',
  scale: 1.2,
  baseKeys: { pc_open: [{ t: 0, s: 0.001 }] },
  build({ piece }) {
    const bamboo = mat('wood', 0xc8a858, { repeat: 1.5 });
    const node = mat('wood', 0x8a6a30);
    const vine = mat('bark', 0x4a6a24, { repeat: 3 });
    const leafM = mat('leaf', 0x3a9a3a, { rough: 0.5 });
    const leafD = mat('leaf', 0x2a7a2e, { rough: 0.5 });
    const vein = mat('leaf', 0x9ad06a);
    const tie = mat('cloth', 0xd83a2a);
    piece('handle',
      tube([[0.05, 0, 0], [-0.04, 0, 0], [-0.1, -0.03, 0], [-0.11, -0.09, 0], [-0.07, -0.11, 0]], 0.018, vine, { seg: 24, radial: 8 }),
    );
    piece('shaft',
      tube([[0.04, 0, 0], [0.8, 0, 0]], 0.016, bamboo, { seg: 10 }),
      ...[0.2, 0.4, 0.6].map((x) => lathe([[0.017, -0.006], [0.02, 0], [0.017, 0.006]], node, { rot: [0, 0, -90], pos: [x, 0, 0] })),
    );
    // folha enrolada (fechado): cone espiralado em volta da haste
    piece('closed',
      lathe([[0.001, 0.0], [0.05, 0.04], [0.075, 0.16], [0.07, 0.3], [0.045, 0.46], [0.012, 0.56], [0.001, 0.58]], dbl(leafM), { rot: [0, 0, -90], pos: [0.24, 0, 0], seg: 24, deform: [(p) => { const phi = Math.atan2(p.x, p.z); const k = 1 + Math.sin(phi * 0.5 + p.y * 9) * 0.06; p.x *= k; p.z *= k; }] }),
      tube(Array.from({ length: 14 }, (_, i) => { const t = i / 13; const a = t * 9; const rr = 0.07 * Math.sin(Math.min(1, t * 1.2 + 0.05) * Math.PI) + 0.01; return [0.27 + t * 0.52, Math.sin(a) * rr, Math.cos(a) * rr] as V3; }), 0.005, leafD, { seg: 60, radial: 5 }),
      ring(0.06, 0.009, tie, { pos: [0.5, 0, 0], rot: [0, 90, 0] }),
      slab([[0, 0], [0.04, -0.06], [0.02, -0.08]], 0.006, tie, { pos: [0.5, -0.05, 0.03] }),
    );
    // folha aberta (taioba): copa em domo com bordas recortadas e nervuras
    const N = 7;
    const opened = [];
    for (let i = 0; i < N; i++) {
      const ph = (i / N) * 360;
      opened.push(wedge([[0.001, 0.12], [0.12, 0.1], [0.26, 0.05], [0.38, -0.03], [0.44, -0.1]], i % 2 ? leafM : leafD, ph, 360 / N, { rot: [0, 0, -90], pos: [0.78, 0, 0], seg: 10, deform: [(p) => { const phi = Math.atan2(p.x, p.z) - ph * D; const f = Math.sin(((phi % (2 * Math.PI / N)) + 2 * Math.PI) % (2 * Math.PI / N) * N / 2); const rr = Math.hypot(p.x, p.z); p.y += (1 - f) * 0.05 * (rr / 0.44); }] }));
      const a = (ph + 360 / N / 2) * D;
      opened.push(tube([[0.78 + 0.12, 0, 0], [0.78 + 0.07, Math.sin(a) * 0.2, Math.cos(a) * 0.2], [0.78 - 0.08, Math.sin(a) * 0.42, Math.cos(a) * 0.42]], 0.007, vein, { seg: 12, radial: 5 }));
    }
    opened.push(blob([0.03, 0.03, 0.03], node, { pos: [0.9, 0, 0] }));
    piece('open', ...opened);
  },
  extra: () => ({
    aberto: { frames: 1, loop: false, keys: { pc_closed: [{ t: 0, s: 0.001 }], w: [{ t: 0, r: [0, 0, 90] }] } },
  }),
});

/* ------------------------------ BUZINA DE CAMINHÃO ------------------------------ */
const buzina = makeWeapon({
  id: 'buzina',
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
  build({ piece }) {
    const chrome = mat('metal', 0xeef2f8, { metal: 0.55, rough: 0.12, rim: 0.9 });
    const chromeD = mat('metal', 0xa8b0bc, { metal: 0.55, rough: 0.2 });
    const rubber = mat('rubber', 0xc82a22, { rough: 0.6 });
    const rubberD = mat('rubber', 0x8a1a12);
    const brass = mat('metal', 0xe0b04a, { metal: 0.55, rough: 0.25 });
    piece('bulb',
      blob([0.09, 0.075, 0.075], rubber, { pos: [-0.02, 0, 0], deform: [taper('x', -0.09, 0.09, 1, 0.55)], seg: 28 }),
      ...[-0.06, -0.02, 0.02].map((x) => lathe([[0.07, -0.006], [0.074, 0], [0.07, 0.006]], rubberD, { rot: [0, 0, -90], pos: [x, 0, 0], scale: [1 - (x + 0.06) * 2, 1, 1 - (x + 0.06) * 2] })),
      lathe([[0.03, 0], [0.032, 0.03], [0.02, 0.04]], brass, { rot: [0, 0, -90], pos: [0.06, 0, 0] }),
    );
    piece('neck',
      tube([[0.09, 0, 0], [0.2, 0, 0], [0.26, 0.04, 0.02], [0.24, 0.1, 0.03], [0.17, 0.11, 0.02], [0.14, 0.06, 0.0], [0.2, 0.02, -0.01], [0.32, 0.03, 0]], 0.016, chromeD, { seg: 60 }),
    );
    piece('bell',
      lathe([[0.02, 0.0], [0.024, 0.15], [0.035, 0.26], [0.06, 0.33], [0.1, 0.37], [0.13, 0.385], [0.125, 0.395], [0.09, 0.38], [0.05, 0.34]], dbl(chrome), { rot: [0, 0, -90], pos: [0.3, 0.03, 0], seg: 36 }),
      ...[0.06, 0.2].map((y) => lathe([[0.03, -0.008], [0.034, 0], [0.03, 0.008]], brass, { rot: [0, 0, -90], pos: [0.3 + y, 0.03, 0] })),
      blob([0.02, 0.012, 0.004], mat('glow', 0xffffff, { emissiveIntensity: 1.5 }), { pos: [0.6, 0.12, 0.08], rot: [0, 0, 30] }),
    );
    piece('bracket',
      roundBox([0.12, 0.025, 0.05], 0.01, chromeD, { pos: [0.4, -0.02, 0] }),
      nail(0.01, brass, { pos: [0.36, -0.02, 0.028] }), nail(0.01, brass, { pos: [0.44, -0.02, 0.028] }),
    );
    piece('bell', sparkle(0.05, mat('glow', 0xffffff, { emissiveIntensity: 2 }), { pos: [0.66, 0.15, 0.1] }));
  },
});

/* ------------------------------ CAPACETE DE JAVALIM ------------------------------ */
const HELM: V2[] = [[0.001, 0.2], [0.06, 0.195], [0.11, 0.17], [0.145, 0.12], [0.16, 0.06], [0.165, 0.0]];
const capacete = makeWeapon({
  id: 'capacete',
  build({ piece }) {
    const shell = mat('plastic', 0xe8922a, { rough: 0.35 });
    const shellD = mat('plastic', 0xb86a1a, { rough: 0.4 });
    const tusk = mat('shell', 0xf4ecd8, { rough: 0.35 });
    const strap = mat('leather', 0x3a2a1e);
    const metal = mat('metal', 0x9a9a9a, { metal: 0.5, rough: 0.35 });
    const scuff = mat('paint', 0x6a4a2a, { rough: 0.8 });
    const C = 0.2;
    piece('left',
      wedge(HELM, shell, 180, 180, { pos: [C, -0.06, 0], seg: 18 }),
      wedge([[0.002, 0.205], [0.03, 0.205], [0.03, 0.18]], shellD, 180, 180, { pos: [C, -0.06, 0], seg: 18 }),
    );
    piece('right',
      wedge(HELM, shell, 0, 180, { pos: [C, -0.06, 0], seg: 18, deform: [(p) => { const d = Math.hypot(p.x - 0.1, p.y - 0.12, p.z - 0.06); if (d < 0.05) { const f = (1 - d / 0.05) * 0.015; p.x -= f; p.z -= f; } }] }),
      // crista central
      tube(Array.from({ length: 9 }, (_, i) => { const a = (-80 + i * 20) * D; return [Math.sin(a) * 0.2 * 0.83, 0.0 + Math.cos(a) * 0.2, 0] as V3; }).map(([x, y]) => [C + x * 0.9, y - 0.06 + 0.005, 0] as V3), 0.018, shellD, { seg: 30, radial: 8 }),
      blob([0.03, 0.012, 0.004], scuff, { pos: [C - 0.05, 0.06, 0.13], rot: [0, 20, 30] }),
    );
    piece('brim',
      lathe([[0.16, 0.0], [0.2, -0.005], [0.22, -0.012], [0.215, -0.02], [0.16, -0.012]], shellD, { pos: [C, -0.06, 0], seg: 32, deform: [(p) => { if (p.x > 0) p.x *= 1.25; }] }),
    );
    piece('emblem',
      blob([0.04, 0.035, 0.008], metal, { pos: [C + 0.02, 0.0, 0.158], rot: [0, 10, 0] }),
      spike(0.06, 0.012, tusk, { pos: [C + 0.0, -0.015, 0.162], rot: [0, 0, 130], curve: 0.5 }),
      spike(0.06, 0.012, tusk, { pos: [C + 0.04, -0.015, 0.162], rot: [0, 0, -130], curve: -0.5 }),
      blob([0.006, 0.006, 0.004], mat('paint', 0x1a1a1a), { pos: [C + 0.01, 0.01, 0.166] }), blob([0.006, 0.006, 0.004], mat('paint', 0x1a1a1a), { pos: [C + 0.03, 0.01, 0.166] }),
    );
    piece('strap',
      tube([[C - 0.13, -0.07, 0.08], [C - 0.08, -0.16, 0.06], [-0.0, -0.06, 0.0], [C - 0.14, -0.07, -0.08]], 0.008, strap, { seg: 24, radial: 6 }),
      roundBox([0.03, 0.022, 0.01], 0.004, metal, { pos: [C - 0.08, -0.15, 0.065] }),
    );
  },
});

export const ARMAS: ModelDef[] = [galho, coco, jaca, remo, vassoura, panela, lamparina, chave, peixe, estilingue, cupinzeiro, guardaChuva, buzina, capacete];
