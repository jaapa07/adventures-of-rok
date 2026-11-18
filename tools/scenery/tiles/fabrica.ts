/** Tileset FÁBRICA: chapas de aço rebitadas e enferrujadas, crosta de ferrugem no topo, vigas, pregos, correntes e esteira. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, M } from '../lib/core';
import { tubeGeo, placeM, bladeGeo, latheGeo } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { grassTop, waterFrame } from './deco';
import { topPoint, bottomPoint } from '../lib/terrain';

const STEEL = 0x8a9098, RUST = 0x7a4228, RUST_L = 0xa8682e, YELLOW = 0xe0a820;

function seam(v: number) { return Math.abs(v - Math.round(v * 2) / 2); }

export const fabricaTheme: TileTheme = {
  id: 'fabrica',
  preset: 'fabrica',
  light: { hemi: { i: 0.8, sky: 0x9a8a80 }, key: { color: 0xffd0b0, i: 2.2 }, rim: { i: 1.6 }, fres: { color: 0xffa080, strength: 0.6 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.07, amp: 0.012, seed: 41, base: 4, oct: 5, uv: 2,
    extra: (p) => {
      const gx = seam(p.x), gy = seam(p.y);
      let d = -0.022 * (1 - smooth(0.005, 0.02, Math.min(gx, gy)));
      // rebites perto dos cantos de cada chapa (posições em módulo 0.5)
      const fx = ((p.x % 0.5) + 0.5) % 0.5, fy = ((p.y % 0.5) + 0.5) % 0.5;
      for (const rx of [0.07, 0.43]) for (const ry of [0.07, 0.43]) {
        const r = Math.hypot(fx - rx, fy - ry);
        d += 0.022 * Math.sqrt(Math.max(0, 1 - (r / 0.028) ** 2));
      }
      // amassados suaves
      d += 0.012 * pfbm(p.x, p.y, p.z, 44, 2, 2);
      return d;
    },
    turf: { depth: 0.07, vary: 0.035, thick: 0.012, seed: 6 },
    color: (p, n, nz, tf, depth) => {
      const r = smooth(0.0, 0.6, pfbm(p.x, p.y, p.z, 48, 3, 3) + 0.15);
      const runs = smooth(0.2, 0.9, pfbm(p.x * 2, p.y * 0.5, 0, 3, 4, 2)) * smooth(0.0, 0.4, 0.5 - seam(p.y));
      const c = mix(STEEL, RUST, Math.max(r * 0.8, runs * 0.6));
      c.multiplyScalar(0.7 + 0.5 * smooth(-1, 1, nz));
      // fuligem e respingos (detalhe fino)
      c.multiplyScalar(0.82 + 0.3 * smooth(-0.6, 0.6, pfbm(p.x, p.y, p.z, 77, 8, 3)));
      c.lerp(new THREE.Color(0xc87a34), smooth(0.35, 0.75, pfbm(p.x, p.y, 0, 79, 6, 2)) * 0.7);
      // número de série pintado e escorridos de óleo (período 1)
      c.lerp(new THREE.Color(0x1a1612), smooth(0.6, 0.9, pfbm(p.x, p.y * 0.5, 0, 83, 10, 2)) * 0.5);
      if (depth < 0.3) c.multiplyScalar(0.8 + 0.2 * smooth(0.05, 0.3, depth));
      return c.lerp(mix(0x4a3020, 0x7a4a26, 0.5 + 0.5 * nz), tf);
    },
  },
  bodyMat: () => vmat('rust', 0xffffff, { repeat: 1, metal: 0.45, rough: 0.6 }),
  top(c) {
    // a selva resiste: capim ralo e uma florzinha entre a ferrugem
    grassTop(c, { n: 10, len: [0.05, 0.12], w: 0.025, colors: [0x6a8a2a, 0x8a9a3a, 0x5a6a2a], seed: 80 + c.mask, droop: 0.3, lip: 3 });
    const mm = vmat('metal', 0xffffff, { rough: 0.4 });
    for (let i = 0; i < 3; i++) {
      const tp = topPoint(c.sh, c.st, (i + 0.2 + 0.6 * hash(i, c.mask + 3)) / 3, 0.2 + 0.6 * hash(i, c.mask + 4));
      if (i === 0) c.b.add(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), mm, placeM(tp.pos, tp.n, i * 20), 0x6a6a6a);
      else if (i === 1) c.b.add(latheGeo([[0.012, 0], [0.012, 0.03], [0.02, 0.032], [0.02, 0.04], [0.001, 0.04]], 6), mm, placeM(tp.pos, [0.6, 1, 0.2], 0), 0x8a8a8a);
      else c.b.add(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mm, placeM(tp.pos.clone().add(new THREE.Vector3(0, 0.006, 0)), [0, 0, 1], 0).multiply(M([0, 0, 0], [90, 0, 0])), 0x7a5a3a);
    }
    // faixa de alerta pintada na beira da frente
    const pm = vmat('paint', 0xffffff, { rough: 0.6 });
    if (c.sh.kind === 'box') for (let i = 0; i < 4; i++) {
      const tp = topPoint(c.sh, c.st, (i + 0.5) / 4, 0.0);
      c.b.add(new THREE.BoxGeometry(0.1, 0.012, 0.04), pm, M([tp.pos.x, tp.pos.y - 0.002, tp.pos.z - 0.02], [0, 0, 30]), i % 2 ? 0x1a1a1a : 0xe8b020);
    }
  },
  bottom(c) {
    const m = vmat('rust', 0xffffff);
    for (let i = 0; i < 3; i++) {
      const bp = bottomPoint(c.sh, c.st, (i + 0.3 + 0.4 * hash(i, c.mask)) / 3, 0.2);
      const L = hr(0.04, 0.1, i, c.mask + 1);
      c.b.add(latheGeo([[0.012, 0], [0.009, L * 0.6], [0.006, L], [0.001, L + 0.01]], 8), m, placeM(bp.pos, [0, -1, 0], 0), mix(RUST, 0x3a2a20, 0.4));
    }
  },
  interior(c) {
    const mm = vmat('metal', 0xffffff, { rough: 0.4 });
    // conduíte vertical com abraçadeiras (contínuo entre tiles empilhados)
    const yTop = c.sh.e.u ? 0.3 : 0.56, yBot = c.sh.e.d ? -0.4 : -0.56;
    if (c.sh.kind === 'box') {
      c.b.add(new THREE.CylinderGeometry(0.03, 0.03, yTop - yBot, 12), mm, M([0.32, (yTop + yBot) / 2, 0.19]), 0x8a8a7a);
      for (const y of [-0.25, 0.25]) if (y < yTop && y > yBot) c.b.add(new THREE.BoxGeometry(0.1, 0.03, 0.05), mm, M([0.32, y, 0.2]), 0x4a4a4a);
      // plaquinha de inspeção com faixas
      c.b.add(new THREE.BoxGeometry(0.16, 0.1, 0.008), vmat('paint', 0xffffff), M([-0.22, -0.3, 0.17]), 0xe8e0c8);
      for (let i = 0; i < 3; i++) c.b.add(new THREE.BoxGeometry(0.12, 0.012, 0.004), vmat('paint', 0xffffff), M([-0.22, -0.27 - i * 0.025, 0.175]), i === 0 ? 0xc02a1a : 0x2a2a2a);
    }
    if (c.variant === 'b') {
      // grade de ventilação
      for (let i = 0; i < 5; i++) c.b.add(new THREE.BoxGeometry(0.28, 0.018, 0.02), mm, M([0, -0.17 + i * 0.045, 0.165]), 0x2a2420);
      c.b.add(new THREE.BoxGeometry(0.32, 0.24, 0.01), mm, M([0, -0.08, 0.153]), 0x141010);
    } else if (c.variant === 'c') {
      // placa remendada com solda
      c.b.add(new THREE.BoxGeometry(0.2, 0.16, 0.015), vmat('rust', 0xffffff), M([0.1, 0.12, 0.165], [0, 0, 4]), 0x7a3a1e);
      for (let i = 0; i < 8; i++) c.b.add(new THREE.SphereGeometry(0.012, 6, 4), mm, M([0.0 + i * 0.028, 0.035, 0.17]), 0x9a8a7a);
    }
  },
  platform(c, part) { beamPlatform(c, part); },
  spike(c) {
    const mm = vmat('metal', 0xffffff, { rough: 0.35 });
    c.b.add(new THREE.BoxGeometry(0.96, 0.06, 0.4), vmat('wood', 0xffffff), M([0, -0.47, -0.04]), 0x5a3a24);
    for (let i = 0; i < 9; i++) for (let k = 0; k < 2; k++) {
      const x = -0.42 + i * 0.105 + k * 0.05, z = 0.08 - k * 0.2;
      const h = hr(0.3, 0.42, i, k);
      c.b.add(latheGeo([[0.012, 0], [0.012, h * 0.85], [0.001, h]], 6), mm, M([x, -0.44, z], [hr(-8, 8, i, k + 2), 0, hr(-8, 8, i, k + 4)]), mix(0xa0a0a0, RUST, hash(i, k + 6) * 0.6));
      c.b.add(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), mm, M([x, -0.44, z]), 0x7a7a7a);
    }
  },
  vine(c, part) { chain(c, part === 'bottom' ? -0.2 : -0.62, part === 'top' ? 0.45 : 0.62, true, part === 'bottom'); },
  rope(c) { chain(c, -0.62, 0.62, false, false); },
  extra: { belt: (c) => belt(c) },
  water: { color: WATER_COLOR.fabrica, build: (root, t, W) => waterFrame(root, t, W, { body: 0x6a6040, foam: 0xc8b890, deep: 0x2a2418, crest: 0xe0d0a0 }) },
};

/** Corrente de elos (vertical ou horizontal). */
function chain(c: TileCtx, a: number, b: number, vertical: boolean, hook: boolean) {
  const mm = vmat('metal', 0xffffff, { rough: 0.45, metal: 0.8 });
  const step = 0.125;
  let k = 0;
  for (let t = a; t <= b + 1e-6; t += step, k++) {
    const g = new THREE.TorusGeometry(0.05, 0.018, 8, 18);
    g.scale(1, 1.5, 1);
    const pos: [number, number, number] = vertical ? [0, t, 0] : [t, 0.3, 0];
    const rot: [number, number, number] = vertical ? [0, k % 2 ? 90 : 0, 0] : [k % 2 ? 90 : 0, 0, 90];
    c.b.add(g, mm, M(pos, rot), mix(0x8a8a8a, RUST, 0.3 * hash(k, 2)));
  }
  // fiapos de ferrugem e lacre nos elos
  for (let t = a + 0.06, k2 = 0; t <= b; t += 0.25, k2++) c.b.add(new THREE.BoxGeometry(0.05, 0.02, 0.02), vmat('rust', 0xffffff), M(vertical ? [0.04, t, 0.02] : [t, 0.34, 0.02], [0, 0, k2 * 37]), mix(RUST_L, 0x4a2010, hash(k2, 9)));
  // plaqueta de aviso presa no elo do meio
  const mid = (a + b) / 2;
  c.b.add(new THREE.BoxGeometry(0.11, 0.08, 0.008), vmat('paint', 0xffffff), M(vertical ? [0.07, mid - 0.06, 0.04] : [mid + 0.04, 0.2, 0.04], [0, 0, 12]), YELLOW);
  c.b.add(new THREE.BoxGeometry(0.07, 0.012, 0.004), vmat('paint', 0xffffff), M(vertical ? [0.07, mid - 0.06, 0.046] : [mid + 0.04, 0.2, 0.046], [0, 0, 12]), 0x1a1a1a);
  const cab: [number, number, number][] = [];
  for (let i = 0; i <= 24; i++) { const t = a + (b - a) * (i / 24); const ph = t * Math.PI * 4; cab.push(vertical ? [0.07 * Math.cos(ph), t, 0.07 * Math.sin(ph)] : [t, 0.3 + 0.07 * Math.cos(ph), 0.07 * Math.sin(ph)]); }
  c.b.add(tubeGeo(cab, 0.008, 80, 4), mm, undefined, 0xc8b070);
  // saco de carga pendurado no gancho
  if (hook) {
    c.b.add(latheGeo([[0.001, -0.62], [0.1, -0.58], [0.14, -0.5], [0.13, -0.44], [0.06, -0.39], [0.02, -0.37]], 14, (p) => { p.x *= 1 + 0.06 * Math.sin(p.y * 40); }), vmat('cloth', 0xffffff, { repeat: 4 }), M([0.09, 0, 0]), 0xb8a070);
    c.b.add(new THREE.TorusGeometry(0.03, 0.008, 6, 12), vmat('cloth', 0xffffff), M([0.09, -0.37, 0], [90, 0, 0]), 0x6a5030);
    c.b.add(new THREE.BoxGeometry(0.1, 0.05, 0.004), vmat('paint', 0xffffff), M([0.09, -0.5, 0.135]), 0xc02a1a);
  }
  if (hook) c.b.add(new THREE.BoxGeometry(0.1, 0.07, 0.06), vmat('rust', 0xffffff), M([0, -0.19, 0]), 0x6a4a34);
  if (hook) c.b.add(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 12), mm, M([0, -0.19, 0.035], [90, 0, 0]), 0x9a9a9a);
  if (hook) c.b.add(tubeGeo([[0, -0.2, 0], [0, -0.32, 0], [0.06, -0.38, 0], [0.09, -0.3, 0]], 0.018, 16, 6), mm, undefined, 0x9a9a9a);
  if (vertical && b < 0.6) {
    c.b.add(new THREE.BoxGeometry(0.22, 0.06, 0.12), mm, M([0, 0.5, 0]), 0x5a5050);
  }
}

/** Viga I de aço com grade por cima. */
function beamPlatform(c: TileCtx, part: 's' | 'l' | 'm' | 'r') {
  const mm = vmat('metal', 0xffffff, { rough: 0.45, metal: 0.7 });
  const rm = vmat('rust', 0xffffff);
  const x0 = part === 'l' || part === 's' ? -0.46 : -0.5, x1 = part === 'r' || part === 's' ? 0.46 : 0.5;
  const w = x1 - x0, cx = (x0 + x1) / 2;
  c.b.add(new THREE.BoxGeometry(w, 0.03, 0.4), rm, M([cx, 0.485, -0.04]), 0x6a5048);
  c.b.add(new THREE.BoxGeometry(w, 0.13, 0.03), rm, M([cx, 0.405, -0.04]), 0x4a4044);
  c.b.add(new THREE.BoxGeometry(w, 0.025, 0.24), rm, M([cx, 0.33, -0.04]), 0x5a4a44);
  // grade (barras) por cima
  for (let i = 0; i < 9; i++) {
    const x = -0.5 + (i + 0.5) / 9;
    if (x < x0 + 0.02 || x > x1 - 0.02) continue;
    c.b.add(new THREE.BoxGeometry(0.018, 0.018, 0.38), mm, M([x, 0.508, -0.04]), 0x5a5a5a);
  }
  for (const z of [0.14, -0.22]) c.b.add(new THREE.BoxGeometry(w, 0.022, 0.022), mm, M([cx, 0.51, z]), 0x6a6a6a);
  for (let i = 0; i < 12; i++) {
    const x = -0.5 + (i + 0.5) / 12;
    if (x < x0 + 0.02 || x > x1 - 0.02) continue;
    c.b.add(new THREE.BoxGeometry(0.04, 0.1, 0.006), vmat('paint', 0xffffff), M([x, 0.405, 0.115], [0, 0, 35]), i % 2 ? 0x1a1a1a : YELLOW);
  }
  // rebites na alma
  for (let i = 0; i < 4; i++) {
    const x = -0.5 + (i + 0.5) / 4;
    if (x < x0 || x > x1) continue;
    c.b.add(new THREE.SphereGeometry(0.014, 6, 4), mm, M([x, 0.405, -0.02]), 0x9a8a7a);
  }
  if (part !== 'm') {
    for (const s of part === 's' ? [-1, 1] : part === 'l' ? [-1] : [1]) {
      const x = s < 0 ? x0 : x1;
      c.b.add(new THREE.BoxGeometry(0.02, 0.2, 0.42), mm, M([x, 0.41, -0.04]), 0xc89a20);
      // faixas de alerta na testa
      for (let k = 0; k < 3; k++) c.b.add(new THREE.BoxGeometry(0.022, 0.05, 0.06), vmat('paint', 0xffffff), M([x + s * 0.002, 0.42, 0.06 - k * 0.12], [45, 0, 0]), 0x1a1a1a);
    }
  }
  // manchas de ferrugem, parafusos na mesa e cabo pendurado
  for (let i = 0; i < 6; i++) {
    const x = -0.5 + (i + 0.5) / 6;
    if (x < x0 + 0.03 || x > x1 - 0.03) continue;
    c.b.add(new THREE.CircleGeometry(hr(0.03, 0.05, i, 21), 10), rm, M([x + 0.02, 0.38 + 0.04 * Math.sin(i * 2.1), -0.02], [0, 0, 0]), mix(RUST_L, 0x3a2010, hash(i, 22)));
    c.b.add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), mm, M([x, 0.497, 0.1], [0, i * 20, 0]), 0xb0a090);
    c.b.add(latheGeo([[0.008, 0], [0.005, 0.03], [0.001, 0.05]], 5), rm, M([x + 0.03, 0.32, -0.02], [180, 0, 0]), 0x6a3018);
  }
  // corrente curta com gancho pendurada da viga
  {
    const hx = part === 'l' ? x0 + 0.2 : part === 'r' ? x1 - 0.2 : cx + 0.18;
    for (let k = 0; k < 4; k++) { const g = new THREE.TorusGeometry(0.03, 0.01, 6, 14); g.scale(1, 1.5, 1); c.b.add(g, mm, M([hx, 0.28 - k * 0.075, 0.02], [0, k % 2 ? 90 : 0, 0]), mix(0x8a8a8a, RUST, 0.3 * k)); }
    c.b.add(tubeGeo([[hx, -0.02, 0.02], [hx, -0.08, 0.02], [hx + 0.05, -0.12, 0.02], [hx + 0.07, -0.07, 0.02]], 0.012, 12, 6), mm, undefined, 0xa0a0a0);
  }
  // luminária industrial de grade sob a viga
  if (part === 'm') {
    const lx = cx - 0.22;
    c.b.add(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 4), mm, M([lx, 0.28, 0.0]), 0x2a2a2a);
    c.b.add(latheGeo([[0.001, 0.0], [0.08, -0.05], [0.09, -0.07]], 12), mm, M([lx, 0.24, 0.0]), 0x3a5a3a);
    c.b.add(new THREE.SphereGeometry(0.035, 10, 8), vmat('glow', 0xffffff, { emissive: 0xffd080, emissiveIntensity: 1.2 }), M([lx, 0.18, 0.0]), 0xffffff);
    for (let k = 0; k < 4; k++) c.b.add(new THREE.TorusGeometry(0.045, 0.004, 4, 12, Math.PI), mm, M([lx, 0.18, 0.0], [0, k * 45, 180]), 0x2a2a2a);
  }
  // contraventamento em X sob a viga
  for (let i = 0; i < 2; i++) {
    const xa = -0.5 + i * 0.5, xb = xa + 0.5;
    if (xa < x0 - 0.01 || xb > x1 + 0.01) continue;
    c.b.add(tubeGeo([[xa + 0.03, 0.32, -0.12], [xb - 0.03, 0.2, -0.12]], 0.01, 4, 5), mm, undefined, 0x5a5a60);
    c.b.add(tubeGeo([[xa + 0.03, 0.2, -0.12], [xb - 0.03, 0.32, -0.12]], 0.01, 4, 5), mm, undefined, 0x5a5a60);
    c.b.add(new THREE.BoxGeometry(0.5, 0.016, 0.03), mm, M([(xa + xb) / 2, 0.2, -0.12]), 0x4a4a50);
  }
  const cab: [number, number, number][] = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; const x = x0 + 0.08 + (x1 - x0 - 0.16) * t; cab.push([x, 0.32 - 0.12 * Math.sin(Math.PI * t), 0.1]); }
  c.b.add(tubeGeo(cab, 0.012, 30, 5), vmat('rubber', 0xffffff), undefined, 0x1a1a1a);
  // gotejamento de ferrugem e trapo pendurado
  const lm = vmat('cloth', 0xffffff, { side: THREE.DoubleSide });
  c.b.add(bladeGeo(0.14, 0.06, 0.1, 0.5, 4), lm, placeM([cx + 0.15, 0.33, 0.08], [0, -1, 0.1], 0), 0x8a7a5a);
}

/** Esteira transportadora: lona com travessas sobre rolos, chassi com parafusos. */
export function belt(c: TileCtx) {
  const mm = vmat('metal', 0xffffff, { rough: 0.4, metal: 0.8 });
  const bm = vmat('rubber', 0xffffff, { rough: 0.85 });
  // lona superior
  c.b.add(new THREE.BoxGeometry(1.06, 0.035, 0.42), bm, M([0, 0.48, -0.04]), 0x2a2626);
  for (let i = 0; i < 12; i++) c.b.add(new THREE.BoxGeometry(0.025, 0.02, 0.4), bm, M([-0.5 + (i + 0.5) / 12, 0.505, -0.04]), i % 2 ? 0x3a3434 : 0x4a4440);
  // faixa de alerta no chassi e parafusos
  for (let i = 0; i < 8; i++) c.b.add(new THREE.BoxGeometry(0.07, 0.09, 0.005), vmat('paint', 0xffffff), M([-0.47 + i * 0.135, 0.36, 0.207], [0, 0, 35]), i % 2 ? 0x1a1a1a : 0xe0a820);
  for (let i = 0; i < 6; i++) c.b.add(new THREE.SphereGeometry(0.012, 6, 4), mm, M([-0.45 + i * 0.18, 0.2, -0.02]), 0x9a9a9a);
  c.b.add(new THREE.CircleGeometry(0.06, 12), vmat('glass', 0xffffff), M([0.2, 0.05, -0.02]), 0x14100c);
  // rolos (vistos pela frente) e chassi
  for (let i = 0; i < 4; i++) {
    const x = -0.5 + (i + 0.5) / 4;
    c.b.add(new THREE.CylinderGeometry(0.055, 0.055, 0.46, 16), mm, M([x, 0.4, -0.04], [90, 0, 0]), 0x8a8a90);
    c.b.add(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 8), mm, M([x, 0.4, 0.2], [90, 0, 0]), 0xc8a030);
  }
  c.b.add(new THREE.BoxGeometry(1.06, 0.1, 0.03), mm, M([0, 0.36, 0.19]), 0x6a4a2a);
  c.b.add(new THREE.BoxGeometry(1.06, 0.6, 0.06), vmat('rust', 0xffffff), M([0, 0.0, -0.06]), 0x4a3a34);
  // pernas de apoio e reforço em X
  for (const x of [-0.25, 0.25]) c.b.add(new THREE.BoxGeometry(0.06, 0.8, 0.06), mm, M([x, -0.1, 0.12]), 0x5a5050);
  c.b.add(new THREE.BoxGeometry(0.62, 0.025, 0.025), mm, M([0, -0.05, 0.14], [0, 0, 38]), 0x6a6060);
  c.b.add(new THREE.BoxGeometry(0.62, 0.025, 0.025), mm, M([0, -0.05, 0.14], [0, 0, -38]), 0x6a6060);
  // lona inferior de retorno
  c.b.add(new THREE.BoxGeometry(1.06, 0.03, 0.4), bm, M([0, 0.32, -0.08]), 0x1e1a1a);
}
