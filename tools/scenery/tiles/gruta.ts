/** Tileset GRUTA: rocha âmbar em blocos, musgo escuro no topo, estalactites douradas, andaimes de tábua e trilho de mina. */
import * as THREE from 'three';
import { hash, hr, mix, smooth, vmat, pfbm, M, type V3 } from '../lib/core';
import { tubeGeo, rockGeo, placeM, leafGeo, bladeGeo, coneGeo, latheGeo } from '../lib/kit';
import { WATER_COLOR } from '../data';
import type { TileTheme, TileCtx } from './common';
import { grassTop, hangingRoots, embeddedStones, sideTufts, vineCol, ropeRow, waterFrame } from './deco';
import { topPoint, bottomPoint, frontPoint } from '../lib/terrain';
import { mushrooms } from '../lib/flora';

const ROCK_A = 0x6e5e4a, ROCK_B = 0x2c2420, ROCK_C = 0xb0905a, MOSS_A = 0x5a6a2a, MOSS_B = 0x3a4a1e;

export const grutaTheme: TileTheme = {
  id: 'gruta',
  preset: 'caverna',
  light: { hemi: { i: 1.0 }, key: { i: 2.9 } },
  body: {
    zf: 0.14, zb: -0.26, R: 0.1, amp: 0.06, seed: 11, hard: 0.6, base: 2, oct: 5, uv: 2,
    extra: (p) => -0.045 * (1 - smooth(0, 0.1, Math.abs(pfbm(p.x, p.y, p.z, 23, 1, 2)))) + 0.025 * smooth(0.2, 0.6, pfbm(p.x, p.y, p.z, 29, 2, 1)),
    turf: { depth: 0.08, vary: 0.04, thick: 0.02, seed: 4 },
    color: (p, n, nz, tf, depth) => {
      const band = 0.5 + 0.5 * Math.sin((p.y * 2 + 0.2 * pfbm(p.x, 0, 0, 3, 2, 2)) * Math.PI * 2);
      const rock = mix(ROCK_B, ROCK_A, band * 0.7 + 0.3 * smooth(-0.3, 0.5, nz)).lerp(new THREE.Color(ROCK_C), smooth(0.35, 0.8, nz) * 0.6);
      rock.multiplyScalar(0.6 + 0.55 * smooth(-0.6, 0.5, nz));
      rock.multiplyScalar(0.85 + 0.25 * smooth(-0.5, 0.5, pfbm(p.x, p.y, p.z, 17, 8, 2)));
      rock.lerp(new THREE.Color(0xe0b060), smooth(0.55, 0.85, pfbm(p.x, p.y, 0, 19, 6, 2)) * 0.6);
      if (depth < 0.3) rock.multiplyScalar(0.75 + 0.25 * smooth(0.06, 0.3, depth));
      return rock.lerp(mix(MOSS_B, MOSS_A, 0.5 + 0.5 * nz), tf);
    },
  },
  bodyMat: () => vmat('rubber', 0xffffff, { rough: 0.85, rim: 0.2 }),
  top(c) {
    grassTop(c, { n: 34, len: [0.03, 0.08], w: 0.035, colors: [MOSS_A, MOSS_B, 0x7a7a34, 0x6a5a2a], seed: 40 + c.mask, droop: 0.8, lip: 14 });
    const rm = vmat('rock', 0xffffff);
    for (let i = 0; i < 3; i++) {
      const tp = topPoint(c.sh, c.st, (i + 0.3 + 0.4 * hash(i, c.mask)) / 3, 0.3 + 0.5 * hash(i, c.mask + 1));
      c.b.add(rockGeo([0.04, 0.03, 0.04], i + c.mask, 1, { flat: 0.3 }), rm, placeM(tp.pos, tp.n, i * 40), mix(ROCK_C, ROCK_B, hash(i, 3)));
    }
    if (hash(c.mask, 77) > 0.55) {
      const tp = topPoint(c.sh, c.st, 0.3 + 0.4 * hash(c.mask, 78), 0.6);
      mushrooms(c.b, placeM(tp.pos, [0, 1, 0], 0, 0.5), 0.2, 0x60e0ff, 0xd8e0c0, c.mask, 3, 0x40c8ff);
    }
  },
  bottom(c) {
    const m = vmat('rock', 0xffffff, { rough: 0.5 });
    for (let i = 0; i < 4; i++) {
      const bp = bottomPoint(c.sh, c.st, (i + 0.25 + 0.5 * hash(i, c.mask + 5)) / 4, 0.15 + 0.3 * hash(i, 6));
      const h = hr(0.12, 0.3, i, c.mask + 7);
      c.b.add(coneGeo(hr(0.035, 0.06, i, 8), h, i), m, placeM(bp.pos.clone().add(new THREE.Vector3(0, 0.02, 0)), [0, -1, 0], i * 50), mix(0xd8a040, ROCK_A, 0.3 * hash(i, 9)));
    }
    hangingRoots(c, 2, 0x4a3a1a, [0.06, 0.12], 0.008, 7 + c.mask);
  },
  side(c, s) { sideTufts(c, s, [MOSS_A, MOSS_B], 30 + c.mask, 2); },
  interior(c) {
    // pepitas douradas cintilando na rocha
    const gm = vmat('metal', 0xffffff, { rough: 0.25, metal: 0.9, emissive: 0x6a4010, emissiveIntensity: 0.4 });
    for (let i = 0; i < 6; i++) {
      const fp = frontPoint(c.sh, c.st, hr(-0.4, 0.4, i, 200 + c.mask * 3 + c.variant.charCodeAt(0)), hr(-0.4, 0.3, i, 300 + c.mask));
      if (fp.tf > 0.1) continue;
      c.b.add(rockGeo([0.018, 0.014, 0.012], i, 0, { facet: true }), gm, placeM(fp.pos, fp.n, i * 60), 0xffd060);
    }
    if (c.variant === 'a') embeddedStones(c, 2, 0xa07040, [0.05, 0.09], 50 + c.mask);
    else if (c.variant === 'b') {
      // veio de âmbar cristalizado
      const am = vmat('crystal', 0xffffff, { emissive: 0xffa020, emissiveIntensity: 0.6, opacity: 0.9 });
      for (let i = 0; i < 3; i++) c.b.add(rockGeo([0.05, 0.035, 0.03], i + 3, 1, { facet: true }), am, placeM([-0.15 + i * 0.13, -0.1 + 0.08 * Math.sin(i * 2), 0.17], [0.2, 1, 0], i * 30), 0xffc060);
    } else { embeddedStones(c, 5, 0xc08a50, [0.03, 0.06], 90); embeddedStones(c, 1, 0x8a6a48, [0.1, 0.12], 95); }
  },
  platform(c, part) { plankPlatform(c, part, 0x5a3c22, 0x2a1e14); },
  spike(c) {
    const m = vmat('rock', 0xffffff, { rough: 0.6 });
    const xs = [-0.36, -0.18, 0.0, 0.17, 0.35];
    xs.forEach((x, i) => {
      const h = [0.42, 0.62, 0.5, 0.7, 0.4][i];
      c.b.add(coneGeo(0.09, h, i, hr(-0.05, 0.05, i, 3)), m, M([x, -0.5, hr(-0.08, 0.08, i, 4)]), mix(0xc8903a, 0xf0c060, i % 2 ? 0.6 : 0.1));
    });
    c.b.add(rockGeo([0.52, 0.09, 0.22], 8, 2, { flat: 0.1 }), m, M([0, -0.5, 0]), ROCK_B);
  },
  vine(c, part) {
    vineCol(c, part, { color: 0xc09a62, matKind: 'cloth', r: 0.046 });
    if (part === 'top') ropeAnchor(c);
    // fiapos soltos da corda
    const cm = vmat('cloth', 0xffffff, { side: THREE.DoubleSide });
    for (let i = 0; i < 9; i++) c.b.add(bladeGeo(0.06, 0.008, 0.6, 0, 3), cm, placeM([i % 2 ? 0.04 : -0.04, (part === 'bottom' ? -0.2 : -0.45) + i * 0.1, 0.03], [i % 2 ? 1 : -1, -0.3, 0.3], 0), 0xd8b880);
    // pegador de madeira atravessado na corda
    const wm2 = vmat('wood', 0xffffff);
    c.b.add(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 10), wm2, M([0, part === 'bottom' ? -0.12 : 0.0, 0.03], [0, 0, 90]), 0x7a5232);
    for (const s2 of [-1, 1]) c.b.add(new THREE.SphereGeometry(0.026, 8, 6), wm2, M([s2 * 0.12, part === 'bottom' ? -0.12 : 0.0, 0.03]), 0x5a3a22);
    if (part === 'bottom') c.b.add(latheGeo([[0.001, -0.06], [0.06, -0.03], [0.07, 0], [0.06, 0.03], [0.001, 0.06]], 12), vmat('cloth', 0xffffff), M([0, -0.24, 0.02]), 0xa88a5a);
    if (part === 'bottom') for (let i = 0; i < 7; i++) c.b.add(bladeGeo(0.08, 0.01, 0.3, 0, 3), cm, placeM([0, -0.26, 0.02], [Math.cos(i) * 0.4, -1, Math.sin(i) * 0.4], 0), 0xc8a070);
  },
  rope(c) {
    ropeRow(c, 0.3, { color: 0xc09a62, matKind: 'cloth', r: 0.046 });
    // lampião pendurado num gancho
    c.b.add(tubeGeo([[-0.3, 0.27, 0.03], [-0.3, 0.2, 0.04], [-0.3, 0.14, 0.04]], 0.006, 6, 4), vmat('metal', 0xffffff), undefined, 0x3a3a3a);
    c.b.add(latheGeo([[0.04, 0], [0.05, 0.06], [0.05, 0.1], [0.035, 0.12]], 10), vmat('glass', 0xffffff, { emissive: 0xffa030, emissiveIntensity: 1.2, opacity: 0.85 }), M([-0.3, 0.02, 0.04]), 0xffd080);
    c.b.add(latheGeo([[0.001, 0.14], [0.045, 0.12], [0.05, 0.11]], 10), vmat('metal', 0xffffff), M([-0.3, 0.0, 0.04]), 0x2a2a2a);
  },
  extra: {
    rail(c) { railTile(c); },
  },
  water: { color: WATER_COLOR.gruta, build: (root, t, W) => waterFrame(root, t, W, { body: 0x4a6a5a, foam: 0xffd890, deep: 0x1a2620, crest: 0xffe0a0 }) },
};

/** Grampo de ferro cravado no teto segurando a corda. */
function ropeAnchor(c: TileCtx) {
  const m = vmat('metal', 0xffffff, { rough: 0.5 });
  c.b.add(new THREE.TorusGeometry(0.06, 0.016, 8, 20), m, M([0, 0.45, 0.02]), 0x8a8a8a);
  c.b.add(rockGeo([0.14, 0.06, 0.1], 4, 1), vmat('rock', 0xffffff), M([0, 0.55, 0]), ROCK_A);
}

/** Andaime de tábuas pregadas sobre travessas, com amarração de corda. */
export function plankPlatform(c: TileCtx, part: 's' | 'l' | 'm' | 'r', wood: number, dark: number) {
  const wm = vmat('wood', 0xffffff);
  const mm = vmat('metal', 0xffffff, { rough: 0.4 });
  const x0 = part === 'l' || part === 's' ? -0.44 : -0.5, x1 = part === 'r' || part === 's' ? 0.44 : 0.5;
  // tábuas no sentido da profundidade (lado a lado ao longo de x)
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = -0.5 + i / n, b = a + 1 / n;
    const xa = Math.max(a, x0) + 0.014, xb = Math.min(b, x1) - 0.014;
    if (xb <= xa) continue;
    const h = 0.07, d = 0.42;
    const tilt = hr(-2, 2, i, 3 + (part.charCodeAt(0) % 5));
    c.b.add(new THREE.BoxGeometry(xb - xa, h, d, 3, 1, 3), wm, M([(xa + xb) / 2, 0.5 - h / 2 + 0.005 * Math.sin(i * 2.3), -0.04], [0, 0, tilt]), mix(wood, i % 3 === 0 ? 0x2a1a10 : 0xa07a4a, 0.25 * hash(i, 7)));
    for (const z of [0.1, -0.18]) c.b.add(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), mm, M([(xa + xb) / 2, 0.506, z]), 0x5a5a5a);
  }
  // travessas por baixo
  const bm = vmat('wood', 0xffffff);
  c.b.add(new THREE.BoxGeometry(x1 - x0, 0.06, 0.07), bm, M([(x0 + x1) / 2, 0.4, 0.12]), mix(wood, dark, 0.45));
  c.b.add(new THREE.BoxGeometry(x1 - x0, 0.06, 0.07), bm, M([(x0 + x1) / 2, 0.4, -0.2]), mix(wood, dark, 0.6));
  // amarração com corda nas pontas e escora diagonal
  const cm = vmat('cloth', 0xffffff, { repeat: 4 });
  const ends = part === 's' ? [x0 + 0.06, x1 - 0.06] : part === 'l' ? [x0 + 0.06] : part === 'r' ? [x1 - 0.06] : [0.0];
  for (const x of ends) {
    for (let k = 0; k < 3; k++) c.b.add(new THREE.TorusGeometry(0.05, 0.008, 6, 16), cm, M([x + (k - 1) * 0.014, 0.44, 0.12], [0, 90, 0]), 0xc8a070);
  }
  if (part !== 'm') {
    const x = part === 'r' ? x1 - 0.1 : x0 + 0.1;
    c.b.add(tubeGeo([[x, 0.38, 0.05], [x + (part === 'r' ? -0.12 : 0.12), 0.05, 0.05], [x + (part === 'r' ? -0.16 : 0.16), -0.2, 0.05]], 0.025, 8, 6), bm, undefined, mix(wood, dark, 0.5));
  }
  // escoras verticais do andaime descendo até o chão
  const posts = part === 's' ? [x0 + 0.1, x1 - 0.1] : part === 'l' ? [x0 + 0.1] : part === 'r' ? [x1 - 0.1] : [];
  for (const px of posts) {
    c.b.add(new THREE.BoxGeometry(0.07, 0.95, 0.07, 1, 4, 1), bm, M([px, -0.08, 0.05], [0, 0, hr(-3, 3, px * 10, 2)]), mix(wood, dark, 0.35));
    for (let k = 0; k < 3; k++) c.b.add(new THREE.TorusGeometry(0.045, 0.007, 6, 14), cm, M([px, 0.3 - k * 0.012, 0.05], [90, 0, 0]), 0xc8a070);
  }
  // rolo de corda e lanterna sob as tábuas
  if (part === 'm') {
    c.b.add(tubeGeo([[-0.2, 0.37, 0.12], [-0.2, 0.25, 0.13], [-0.2, 0.15, 0.13]], 0.006, 6, 4), mm, undefined, 0x3a3a3a);
    c.b.add(latheGeo([[0.04, 0], [0.05, 0.06], [0.05, 0.1], [0.035, 0.12]], 10), vmat('glass', 0xffffff, { emissive: 0xffa030, emissiveIntensity: 1.2, opacity: 0.85 }), M([-0.2, 0.03, 0.13]), 0xffd080);
    for (let k = 0; k < 4; k++) c.b.add(new THREE.TorusGeometry(0.07 - k * 0.012, 0.012, 6, 18), cm, M([0.22, 0.515 + k * 0.012, -0.15], [90, 0, 0]), mix(0xc8a070, 0x8a6a40, k / 4));
  }
  // nós da madeira e veios escuros
  for (let i = 0; i < 4; i++) {
    const x = -0.5 + (i + 0.5) / 4;
    if (x < x0 || x > x1) continue;
    c.b.add(new THREE.CircleGeometry(0.018, 10), wm, M([x + 0.03, 0.512, -0.1 + 0.08 * Math.sin(i * 3)], [-90, 0, 0]), dark);
    for (let k = 0; k < 3; k++) c.b.add(new THREE.BoxGeometry(0.004, 0.004, 0.3), wm, M([x - 0.06 + k * 0.05, 0.511, -0.04]), mix(wood, dark, 0.6));
  }
  // lascas e um prego torto
  const lm = vmat('leaf', 0xffffff, { side: THREE.DoubleSide });
  c.b.add(bladeGeo(0.06, 0.02, 0.4, 0.2, 3), lm, placeM([x0 + 0.2, 0.5, 0.15], [0.3, 1, 0.5], 0), mix(wood, 0xffffff, 0.3));
  c.b.add(tubeGeo([[0, 0, 0], [0, 0.03, 0], [0.02, 0.045, 0]], 0.006, 4, 5), mm, M([x1 - 0.18, 0.5, 0.05]), 0x707070);
}

/** Trilho de mina: dormentes de madeira, dois trilhos de aço com fixações, cascalho. */
function railTile(c: TileCtx) {
  const wm = vmat('wood', 0xffffff);
  const sm = vmat('metal', 0xffffff, { rough: 0.35, metal: 0.8 });
  const rm = vmat('rock', 0xffffff);
  for (let i = 0; i < 2; i++) {
    const x = -0.25 + i * 0.5;
    c.b.add(new THREE.BoxGeometry(0.16, 0.07, 0.5, 2, 1, 2), wm, M([x, 0.42, -0.06], [0, hr(-4, 4, i, 2), 0]), mix(0x4a3420, 0x5a4028, i * 0.5));
  }
  for (const z of [0.1, -0.22]) {
    // perfil do trilho (boleto + alma + patim) em extrusão ao longo de x
    const s = new THREE.Shape();
    s.moveTo(-0.03, 0); s.lineTo(0.03, 0); s.lineTo(0.03, 0.01); s.lineTo(0.008, 0.02); s.lineTo(0.008, 0.055); s.lineTo(0.02, 0.06); s.lineTo(0.02, 0.08); s.lineTo(-0.02, 0.08); s.lineTo(-0.02, 0.06); s.lineTo(-0.008, 0.055); s.lineTo(-0.008, 0.02); s.lineTo(-0.03, 0.01); s.lineTo(-0.03, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.06, bevelEnabled: false });
    g.translate(0, 0, -0.53);
    c.b.add(g, sm, M([0, 0.42, z], [0, 90, 0]), z > 0 ? 0x9a9aa0 : 0x7a7a80);
    for (let i = 0; i < 2; i++) c.b.add(new THREE.BoxGeometry(0.04, 0.018, 0.08), sm, M([-0.25 + i * 0.5, 0.465, z]), 0x4a4a4a);
  }
  // parafusos de fixação e ferrugem nos trilhos
  for (const z of [0.1, -0.22]) for (let i = 0; i < 4; i++) c.b.add(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6), sm, M([-0.3 + i * 0.2, 0.47, z + 0.035]), i % 2 ? 0x8a5a3a : 0x5a5a5a);
  // cascalho entre os dormentes
  for (let i = 0; i < 22; i++) c.b.add(rockGeo([0.03, 0.02, 0.03], i, 0), rm, M([-0.48 + i * 0.046, 0.4, hr(-0.25, 0.15, i, 5)]), mix(0x7a6a5a, 0xa08a6a, hash(i, 6)));
  // brilho no topo do trilho
  void latheGeo; void leafGeo; void tubeGeo;
}
export type { V3 };
