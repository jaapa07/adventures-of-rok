/** Peças mecânicas reutilizadas pelos chefes (serras, rebites, parafusos, válvulas). */
import * as THREE from 'three';
import { slab, blob, ring, lathe, tube, mat, type V2, type V3, type PartOpts } from '../../render/sculpt';

/** Contorno de lâmina de serra circular com dentes inclinados. */
export function sawOutline(R: number, teeth: number, depth = 0.16): V2[] {
  const pts: V2[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push([Math.cos(a) * R, Math.sin(a) * R]);
    pts.push([Math.cos(a + step * 0.78) * R * (1 - depth), Math.sin(a + step * 0.78) * R * (1 - depth)]);
  }
  return pts;
}

/** Lâmina de serra circular completa (disco dentado + cubo + furos), voltada para +Z. */
export function sawBlade(R: number, thick: number, o: PartOpts & { teeth?: number; color?: number } = {}) {
  const g = new THREE.Group();
  const steel = mat('metal', o.color ?? 0xc8ced6, { rough: 0.3, metal: 0.5 });
  g.add(slab(sawOutline(R, o.teeth ?? 18), thick, steel, { smooth: false, bevel: thick * 0.3 }));
  g.add(ring(R * 0.62, thick * 0.6, mat('metal', 0x8a9098, { metal: 0.5, rough: 0.4 }), { scale: [1, 1, 0.6] }));
  g.add(blob([R * 0.2, R * 0.2, thick * 1.6], mat('metal', 0x4a4e54, { metal: 0.5, rough: 0.4 }), { seg: 20 }));
  g.add(blob([R * 0.08, R * 0.08, thick * 2.2], mat('metal', 0xd8a840, { metal: 0.5, rough: 0.3 }), { seg: 14 }));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    g.add(blob([R * 0.09, R * 0.09, thick * 0.9], mat('metal', 0x2a2c30, { metal: 0.5 }), { pos: [Math.cos(a) * R * 0.4, Math.sin(a) * R * 0.4, 0], seg: 12, castShadow: false }));
  }
  if (o.pos) g.position.set(...o.pos);
  if (o.rot) g.rotation.set(o.rot[0] * Math.PI / 180, o.rot[1] * Math.PI / 180, o.rot[2] * Math.PI / 180);
  if (o.scale !== undefined) typeof o.scale === 'number' ? g.scale.setScalar(o.scale) : g.scale.set(...o.scale);
  return g;
}

/** Fileira de rebites ao longo de pontos. */
export function rivets(points: V3[], r: number, color = 0x6a6e74) {
  const m = mat('metal', color, { metal: 0.5, rough: 0.35 });
  return points.map((p) => blob([r, r, r * 0.7], m, { pos: p, seg: 10, castShadow: false }));
}

/** Volante de válvula (roda com raios), voltado para +Z. */
export function valveWheel(R: number, color: number, o: PartOpts = {}) {
  const g = new THREE.Group();
  const red = mat('paint', color, { rough: 0.35 });
  g.add(ring(R, R * 0.14, red));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    g.add(tube([[-Math.cos(a) * R, -Math.sin(a) * R, 0], [Math.cos(a) * R, Math.sin(a) * R, 0]], R * 0.08, red, { seg: 6, radial: 8 }));
  }
  g.add(blob([R * 0.25, R * 0.25, R * 0.2], mat('metal', 0x9a9a9a, { metal: 0.5 }), { seg: 14 }));
  g.add(lathe([[R * 0.18, -R * 0.9], [R * 0.18, 0], [0.001, 0]], mat('metal', 0x6a6a6a, { metal: 0.5 }), { rot: [-90, 0, 0], pos: [0, 0, -0.01] }));
  if (o.pos) g.position.set(...o.pos);
  if (o.rot) g.rotation.set(o.rot[0] * Math.PI / 180, o.rot[1] * Math.PI / 180, o.rot[2] * Math.PI / 180);
  if (o.scale !== undefined) typeof o.scale === 'number' ? g.scale.setScalar(o.scale) : g.scale.set(...o.scale);
  return g;
}

/** Estrela de faíscas (lascas incandescentes em leque). */
export function sparks(size: number, o: PartOpts = {}) {
  const g = new THREE.Group();
  const hot = mat('glow', 0xffd060, { emissive: 0xffb020, emissiveIntensity: 2.2 });
  const white = mat('glow', 0xfff6d0, { emissive: 0xfff0c0, emissiveIntensity: 2.6 });
  const dirs: V3[] = [[1, 0.6, 0.2], [0.7, 1, -0.2], [-0.3, 1, 0.3], [-0.9, 0.5, -0.1], [0.3, 0.9, 0.5], [1, 0.1, -0.4], [-0.6, 0.8, -0.5], [0.1, 1.1, -0.1]];
  dirs.forEach((d, i) => {
    const L = size * (0.6 + (i % 3) * 0.25);
    const n = Math.hypot(d[0], d[1], d[2]);
    g.add(tube([[0, 0, 0], [d[0] / n * L * 0.5, d[1] / n * L * 0.5 + L * 0.05, d[2] / n * L * 0.5], [d[0] / n * L, d[1] / n * L - L * 0.1, d[2] / n * L]], (t) => size * 0.05 * (1 - t) + 0.004, i % 2 ? hot : white, { seg: 8, radial: 6, castShadow: false }));
  });
  g.add(blob([size * 0.16, size * 0.16, size * 0.16], white, { seg: 12, castShadow: false }));
  if (o.pos) g.position.set(...o.pos);
  if (o.rot) g.rotation.set(o.rot[0] * Math.PI / 180, o.rot[1] * Math.PI / 180, o.rot[2] * Math.PI / 180);
  return g;
}

/** Nuvem de fumaça/vapor feita de bolotas. */
export function puff(size: number, color: number, o: PartOpts = {}) {
  const g = new THREE.Group();
  const m = mat('cloth', color, { rough: 1, rim: 0.6, opacity: 0.92 });
  const pts: [number, number, number, number][] = [[0, 0, 0, 1], [0.6, 0.3, 0.1, 0.75], [-0.55, 0.25, -0.1, 0.7], [0.1, 0.65, 0, 0.8], [0.45, 0.85, 0.15, 0.55], [-0.35, 0.8, 0.1, 0.6]];
  for (const [x, y, z, s] of pts) g.add(blob([size * 0.5 * s, size * 0.45 * s, size * 0.45 * s], m, { pos: [x * size * 0.5, y * size * 0.5, z * size * 0.5], seg: 16, castShadow: false }));
  if (o.pos) g.position.set(...o.pos);
  return g;
}
