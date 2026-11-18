/**
 * COLETÁVEIS — castanha-dourada, cacho (ouriço aberto cheio de castanhas), letras C-I-P-Ó de madeira dourada,
 * moeda-folha, fichas de montaria, parafuso, balão-tucano (1/2/3 vidas) e pena (vida extra do HUD).
 */
import { Rig, THREE, blob, tube, slab, lathe, ring, mat, wobble, taper, bend, applyDeform, D2R, type V3, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, sparkle, still, wave, leaf, additive } from '../props/kit';
import { relief } from '../props/caixa';

const ALL: ModelDef['presets'] = ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'];
const FRONT = { yaw: 0, pitch: 0 };

const gold = () => mat('metal', 0xffc23a, { metal: 0.6, rough: 0.22, emissive: 0xc07000, emissiveIntensity: 0.32, rim: 0.9 });
const goldLight = () => mat('metal', 0xffe08a, { metal: 0.5, rough: 0.18, emissive: 0xd09020, emissiveIntensity: 0.4, rim: 1 });
const goldDark = () => mat('metal', 0xc88a1a, { metal: 0.6, rough: 0.3, emissive: 0x6a3a00, emissiveIntensity: 0.25 });
const glint = () => mat('glow', 0xffffff, { emissiveIntensity: 2.2 });

/**
 * Castanha-do-pará: gomo de três faces (seção triangular arredondada), curvo como gomo de laranja.
 * A quina interna (lado côncavo, +X) é afiada; a face externa (dorso) é larga e abaulada.
 * A casca tem rugas transversais e sulcos; as três quinas ganham um filete em relevo.
 */
function nutShape(h: number) {
  const bendD = bend(34, h);
  return (p: THREE.Vector3) => {
    const v = THREE.MathUtils.clamp(p.y / (h * 0.5), -1, 1);
    const phi = Math.atan2(p.z, p.x); // 0 = quina interna (+X)
    // distância angular até o centro da face mais próxima (faces em 60°, 180°, 300°)
    const d = ((((phi + Math.PI / 3) % (Math.PI * 2 / 3)) + Math.PI * 2 / 3) % (Math.PI * 2 / 3)) - Math.PI / 3;
    const triR = 0.5 / Math.cos(d * 0.94);
    const dorso = Math.max(0, -Math.cos(phi)) ** 2; // 1 no meio da face externa
    const k = 1 + (triR - 1) * (0.92 - dorso * 0.4);
    // pontas mais agudas, base (v<0) mais gorda que o bico
    const prof = Math.max(1 - v * v, 0.02) ** -0.13 * (1 - v * 0.1);
    // rugas transversais da casca + sulcos longitudinais suaves
    const face = Math.cos(d * 1.5); // 0 nas quinas, 1 no meio das faces (as rugas não serrilham as quinas)
    const rug = 1 + (Math.sin(v * 17 + Math.sin(phi * 3) * 1.6) * 0.05 + Math.sin(v * 41 + phi * 5) * 0.015) * (1 - v * v) * face;
    const s = k * prof * rug * 1.22;
    p.x *= s; p.z *= s;
    p.x += h * 0.05 * (1 - v * v); // desloca o miolo para o dorso não ficar magro
    p.x = -p.x; // quina interna para o lado côncavo da curvatura
    bendD(p);
  };
}
function nut(h: number, m: THREE.Material, edge: THREE.Material, o: { pos?: V3; rot?: V3; tip?: THREE.Material } = {}) {
  const shape = nutShape(h);
  const rx = h * 0.34, rz = h * 0.33;
  const body = blob([rx, h * 0.5, rz], m, { deform: [shape], seg: 48 });
  const edges = [0, 120, 240].map((a) => {
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const v = -Math.PI / 2 + 0.2 + (i / 10) * (Math.PI - 0.4);
      const p = new THREE.Vector3(Math.cos(a * D2R) * Math.cos(v) * rx * 1.015, Math.sin(v) * h * 0.5, Math.sin(a * D2R) * Math.cos(v) * rz * 1.015);
      shape(p);
      pts.push([p.x, p.y, p.z]);
    }
    return tube(pts, (t) => h * (0.006 + Math.sin(t * Math.PI) * (a === 0 ? 0.012 : 0.009)), edge, { seg: 28, radial: 6 });
  });
  // bico (ponta de cima, mais clara) e cicatriz (base, mais escura)
  const top = new THREE.Vector3(0, h * 0.485, 0), bot = new THREE.Vector3(0, -h * 0.485, 0);
  shape(top); shape(bot);
  const tips = [
    blob([h * 0.045, h * 0.04, h * 0.045], edge, { pos: [top.x, top.y, top.z], seg: 12 }),
    blob([h * 0.045, h * 0.03, h * 0.045], o.tip ?? edge, { pos: [bot.x, bot.y, bot.z], seg: 12 }),
  ];
  return grp([body, ...edges, ...tips], o.pos, o.rot);
}

/* ------------------------------ CASTANHA ------------------------------ */
function buildCastanha() {
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bone('fx', 'root');
  // casca rugosa marrom-dourada polida: relevo de casca + metal dourado com brilho próprio
  const casca = mat('paint', 0xf2a52e, { metal: 0.6, rough: 0.24, emissive: 0xa85a00, emissiveIntensity: 0.42, rim: 1 });
  r.add('spin', nut(0.47, casca, goldLight(), { rot: [0, 20, -14], tip: mat('paint', 0xa8691c, { metal: 0.4, rough: 0.4 }) }));
  // reflexos (não giram): estrela grande + pontinho
  r.add('fx', sparkle(0.09, glint(), { pos: [0.1, 0.12, 0.2] }), sparkle(0.045, glint(), { pos: [-0.1, -0.1, 0.2], rot: [0, 0, 45] }));
  r.bone('halo', 'root');
  r.add('halo', blob([0.2, 0.25, 0.05], additive(mat('glow', 0xffb020, { emissiveIntensity: 0.5, opacity: 0.2 })), { pos: [0, 0, -0.15], castShadow: false }));
  return r;
}
export const castanha: ModelDef = {
  id: 'castanha',
  kind: 'pickup',
  build: buildCastanha,
  anims: {
    girar: {
      frames: 8, loop: true, keys: {
        spin: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, 360, 0], e: 'linear' }],
        fx: wave(8, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35), r: [0, 0, t * 90] })),
        halo: wave(8, (t) => ({ s: 1 + Math.sin(t * Math.PI * 2) * 0.12 })),
      },
    },
  },
  cell: [64, 64],
  pivot: [32, 32],
  height: 64 / 104,
  presets: ALL,
  camera: FRONT,
  ss: 3,
};

/* ------------------------------ CACHO (ouriço aberto) ------------------------------ */
const POD: V2[] = [[0.001, -0.2], [0.12, -0.19], [0.2, -0.13], [0.23, -0.03], [0.22, 0.06], [0.2, 0.1], [0.17, 0.1], [0.18, 0.04], [0.18, -0.06], [0.13, -0.14], [0.001, -0.16]];
function buildCacho() {
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bones.spin.scale.setScalar(1.35);
  r.bone('fx', 'root');
  const vine = mat('bark', 0x4a7a24, { repeat: 3 });
  const leafM = mat('leaf', 0x4aa83a, { rough: 0.4 });
  const g = gold(), e = goldLight();
  // dez castanhas em leque (buquê), amarradas na base por um cipó com laço e duas folhas
  const fan: [number, number, number, number][] = [
    [0, 0.0, 0.0, 0.0], [-30, 0, 0.02, 0.03], [30, 0, 0.02, 0.03], [-58, 0, 0.0, 0.06], [58, 0, 0.0, 0.06],
    [-15, 1, 0.04, -0.03], [15, 1, 0.04, -0.03], [-44, 1, 0.03, -0.02], [44, 1, 0.03, -0.02], [0, 1, 0.07, -0.05],
  ];
  for (const [a, back, dy, dz] of fan) {
    const len = back ? 0.17 : 0.2;
    const ar = a * D2R;
    r.add('spin', nut(len, back ? goldDark() : g, e, { pos: [Math.sin(ar) * len * 0.5, -0.06 + Math.cos(ar) * len * 0.5 + dy, dz], rot: [0, back ? 160 : 20, -a] }));
  }
  r.add('spin',
    ring(0.04, 0.014, vine, { pos: [0, -0.07, 0.0], rot: [90, 0, 0], scale: [1, 1, 1] }),
    tube([[0, -0.07, 0.04], [0.06, -0.04, 0.07], [0.09, -0.09, 0.06], [0.04, -0.1, 0.05]], 0.01, vine, { seg: 20 }),
    tube([[0, -0.07, 0.04], [-0.06, -0.04, 0.07], [-0.09, -0.09, 0.06], [-0.04, -0.1, 0.05]], 0.01, vine, { seg: 20 }),
    tube([[0, -0.08, 0.04], [0.02, -0.16, 0.05], [0.05, -0.2, 0.04]], 0.009, vine, { seg: 12 }),
    tube([[0, -0.08, 0.04], [-0.03, -0.15, 0.05], [-0.02, -0.21, 0.04]], 0.009, vine, { seg: 12 }),
    leaf(0.13, 0.07, leafM, { pos: [0.02, -0.08, 0.02], rot: [10, 0, -120] }),
    leaf(0.12, 0.065, leafM, { pos: [-0.02, -0.08, 0.02], rot: [10, 0, 125] }),
  );
  r.add('fx', sparkle(0.09, glint(), { pos: [0.14, 0.2, 0.25] }), sparkle(0.05, glint(), { pos: [-0.16, 0.06, 0.25], rot: [0, 0, 45] }));
  return r;
}
export const cacho: ModelDef = {
  id: 'cacho',
  kind: 'pickup',
  build: buildCacho,
  anims: {
    girar: {
      frames: 12, loop: true, keys: {
        spin: wave(12, (t) => ({ r: [0, Math.sin(t * Math.PI * 2) * 35, Math.sin(t * Math.PI * 2 + 1) * 5] })),
        fx: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35), r: [0, 0, t * 90] })),
      },
    },
  },
  cell: [96, 96],
  pivot: [48, 52],
  height: 96 / 104,
  presets: ALL,
  camera: FRONT,
  ss: 3,
};

/* ------------------------------ LETRAS C-I-P-Ó ------------------------------ */
function shapeFrom(pts: V2[], holes: V2[][] = []) {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of holes) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  return s;
}
function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 24): V2[] {
  return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + ((a1 - a0) * i) / n) * D2R; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as V2; });
}
function glyph(shape: THREE.Shape, depth: number, m: THREE.Material, bevel = 0.02) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 32 });
  g.translate(0, 0, -depth / 2);
  applyDeform(g, [wobble(0.002, 40)]);
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  return mesh;
}
const LETTERS: Record<string, () => THREE.Shape[]> = {
  c: () => [shapeFrom([...arc(0, 0, 0.22, 40, 320, 40), ...arc(0, 0, 0.12, 320, 40, 40)])],
  i: () => [shapeFrom([[-0.11, -0.24], [0.11, -0.24], [0.11, -0.17], [0.05, -0.17], [0.05, 0.17], [0.11, 0.17], [0.11, 0.24], [-0.11, 0.24], [-0.11, 0.17], [-0.05, 0.17], [-0.05, -0.17], [-0.11, -0.17]])],
  p: () => [shapeFrom([[-0.15, -0.24], [-0.04, -0.24], [-0.04, -0.04], [0.04, -0.04], ...arc(0.04, 0.1, 0.14, -90, 90, 24), [-0.15, 0.24]], [([...arc(0.03, 0.1, 0.06, 90, -90, 18), [-0.04, 0.04], [-0.04, 0.16]] as V2[]).reverse()])],
  o: () => [shapeFrom(arc(0, -0.03, 0.2, 0, 360, 48).slice(0, -1), [arc(0, -0.03, 0.105, 360, 0, 40).slice(0, -1)]), shapeFrom([[-0.02, 0.21], [0.03, 0.21], [0.12, 0.31], [0.04, 0.31]])],
};
function buildLetter(ch: string) {
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bone('fx', 'root');
  // madeira dourada: miolo de madeira clara com verniz dourado e filete escuro entalhado
  const wood = mat('wood', 0xf0b848, { metal: 0.35, rough: 0.3, emissive: 0x9a5a00, emissiveIntensity: 0.3, rim: 0.9, repeat: 3 });
  const inlay = mat('wood', 0x8a4a12, { rough: 0.5, repeat: 3 });
  for (const s of LETTERS[ch]()) {
    r.add('spin', glyph(s, 0.08, wood, 0.022));
    // filete entalhado: mesma forma, menor, mais escura e rente às faces
    const inner = glyph(s, 0.122, inlay, 0.0);
    inner.scale.set(0.82, 0.82, 1);
    r.add('spin', inner);
    const inner2 = glyph(s, 0.126, wood, 0.0);
    inner2.scale.set(0.74, 0.74, 1);
    r.add('spin', inner2);
  }
  r.add('fx', sparkle(0.09, glint(), { pos: [0.16, 0.2, 0.2] }), sparkle(0.05, glint(), { pos: [-0.15, -0.18, 0.2], rot: [0, 0, 45] }));
  return r;
}
function letter(ch: string): ModelDef {
  return {
    id: `letra-${ch}`,
    kind: 'pickup',
    build: () => buildLetter(ch),
    anims: {
      girar: {
        frames: 12, loop: true, keys: {
          spin: wave(12, (t) => ({ r: [0, t * 360, 0], p: [0, Math.sin(t * Math.PI * 2) * 0.02, 0] })),
          fx: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35), r: [0, 0, t * 90] })),
        },
      },
    },
    cell: [80, 96],
    pivot: [40, 50],
    height: 96 / 104,
    presets: ALL,
    camera: FRONT,
    ss: 3,
  };
}

/* ------------------------------ MOEDA-FOLHA ------------------------------ */
function buildMoeda() {
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bone('fx', 'root');
  const face = mat('metal', 0x8ad04a, { metal: 0.45, rough: 0.25, emissive: 0x2a6a10, emissiveIntensity: 0.35, rim: 0.9 });
  const rim = goldLight();
  const leafM = mat('leaf', 0x3aa040, { rough: 0.35, emissive: 0x1a5a10, emissiveIntensity: 0.2 });
  const vein = mat('metal', 0xfff0a0, { metal: 0.4, rough: 0.25, emissive: 0xc09020, emissiveIntensity: 0.4 });
  r.add('spin',
    lathe([[0.001, -0.035], [0.2, -0.035], [0.22, -0.02], [0.22, 0.02], [0.2, 0.035], [0.001, 0.035]], face, { rot: [90, 0, 0], seg: 48 }),
    ring(0.205, 0.022, rim, { scale: [1, 1, 1.3] }),
    // contas na borda
    ...Array.from({ length: 20 }, (_, i) => blob([0.012, 0.012, 0.01], rim, { pos: [Math.cos(i * 0.314) * 0.17, Math.sin(i * 0.314) * 0.17, 0.034] })),
    ...Array.from({ length: 20 }, (_, i) => blob([0.012, 0.012, 0.01], rim, { pos: [Math.cos(i * 0.314) * 0.17, Math.sin(i * 0.314) * 0.17, -0.034] })),
  );
  for (const z of [1, -1]) {
    r.add('spin', grp([
      leaf(0.26, 0.15, leafM, { pos: [0, -0.13, 0], curl: 0.1 }),
      tube([[0, -0.15, 0.012], [0.0, 0.0, 0.016], [0.0, 0.12, 0.012]], 0.007, vein),
      ...[-0.06, -0.01, 0.04].flatMap((y, k) => [tube([[0, y, 0.012], [0.045 - k * 0.008, y + 0.04, 0.012]], 0.004, vein), tube([[0, y, 0.012], [-0.045 + k * 0.008, y + 0.04, 0.012]], 0.004, vein)]),
    ], [0, 0, z * 0.03], [0, z > 0 ? 0 : 180, z > 0 ? -20 : 20]));
  }
  r.add('fx', sparkle(0.08, glint(), { pos: [0.14, 0.16, 0.2] }), sparkle(0.05, glint(), { pos: [-0.16, -0.12, 0.2], rot: [0, 0, 45] }));
  return r;
}
export const moedaFolha: ModelDef = {
  id: 'moeda-folha',
  kind: 'pickup',
  build: buildMoeda,
  anims: {
    girar: {
      frames: 12, loop: true, keys: {
        spin: wave(12, (t) => ({ r: [0, t * 360, 0], p: [0, Math.sin(t * Math.PI * 2) * 0.02, 0] })),
        fx: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2 + 1) * 0.7 + 0.35), r: [0, 0, t * 90] })),
      },
    },
  },
  cell: [80, 80],
  pivot: [40, 40],
  height: 80 / 104,
  presets: ALL,
  camera: FRONT,
  ss: 3,
};

/* ------------------------------ FICHA DE MONTARIA ------------------------------ */
function buildFicha(variant: string) {
  const kind = ['pirarucu', 'ema', 'tatu'].includes(variant) ? variant : 'pirarucu';
  const r = new Rig('root');
  r.bone('spin', 'root');
  r.bone('fx', 'root');
  const bronze = mat('metal', { pirarucu: 0xe07a4a, ema: 0xd8b05a, tatu: 0xb88a6a }[kind as 'ema'], { metal: 0.5, rough: 0.3, emissive: 0x5a2a00, emissiveIntensity: 0.25, rim: 0.9 });
  const edge = goldLight();
  // ficha em forma de flor de 8 pétalas (recortada), com o relevo da montaria nas duas faces
  const out: V2[] = [];
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const rr = 0.21 + Math.cos(a * 8) * 0.015; out.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  r.add('spin', slab(out, 0.05, bronze, { smooth: false, bevel: 0.015 }), ring(0.175, 0.01, edge, { pos: [0, 0, 0.033] }), ring(0.175, 0.01, edge, { pos: [0, 0, -0.033] }));
  r.add('spin', grp(relief(kind).slice(2), [0, 0, 0.02], [0, 0, 0], 0.55));
  r.add('spin', grp(relief(kind).slice(2), [0, 0, -0.02], [0, 180, 0], 0.55));
  r.add('fx', sparkle(0.07, glint(), { pos: [0.15, 0.15, 0.2] }));
  return r;
}
export const ficha: ModelDef = {
  id: 'ficha',
  kind: 'pickup',
  build: buildFicha,
  anims: {
    idle: still(),
    girar: {
      frames: 12, loop: true, keys: {
        spin: wave(12, (t) => ({ r: [0, t * 360, 0], p: [0, Math.sin(t * Math.PI * 2) * 0.02, 0] })),
        fx: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35), r: [0, 0, t * 90] })),
      },
    },
  },
  cell: [80, 80],
  pivot: [40, 40],
  height: 80 / 104,
  presets: ALL,
  camera: FRONT,
  variants: ['base', 'pirarucu', 'ema', 'tatu'],
  ss: 3,
};

/* ------------------------------ PARAFUSO ------------------------------ */
function buildParafuso() {
  const r = new Rig('root');
  r.bone('spin', 'root', [0, 0, 0], [0, 0, -25]);
  r.bone('fx', 'root');
  const steel = mat('metal', 0xd8dde4, { metal: 0.5, rough: 0.22, rim: 0.9 });
  const steelD = mat('metal', 0x8a929c, { metal: 0.5, rough: 0.3 });
  const brass = mat('metal', 0xe8b84a, { metal: 0.5, rough: 0.25, emissive: 0x6a4000, emissiveIntensity: 0.2 });
  r.add('spin',
    lathe([[0.001, 0.12], [0.1, 0.12], [0.1, 0.18], [0.09, 0.19], [0.001, 0.19]], steel, { seg: 6 }),
    lathe([[0.07, 0.19], [0.075, 0.195], [0.001, 0.2]], steelD, { seg: 24 }),
    lathe([[0.04, -0.18], [0.04, 0.12]], steelD, { seg: 16 }),
    // rosca: hélice
    tube(Array.from({ length: 60 }, (_, i) => { const a = i * 0.55; return [Math.cos(a) * 0.042, -0.17 + i * 0.0045, Math.sin(a) * 0.042] as V3; }), 0.012, steel, { seg: 200, radial: 6 }),
    // porca de latão
    lathe([[0.04, -0.04], [0.085, -0.04], [0.085, 0.02], [0.04, 0.02]], brass, { seg: 6, pos: [0, -0.04, 0] }),
    lathe([[0.001, -0.18], [0.04, -0.18], [0.03, -0.2], [0.001, -0.205]], steelD, { seg: 16 }),
  );
  r.add('fx', sparkle(0.06, glint(), { pos: [0.08, 0.18, 0.2] }));
  return r;
}
export const parafuso: ModelDef = {
  id: 'parafuso',
  kind: 'pickup',
  build: buildParafuso,
  anims: {
    girar: {
      frames: 8, loop: true, keys: {
        spin: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, 360, 0], e: 'linear' }],
        fx: wave(8, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35) })),
      },
    },
  },
  cell: [64, 64],
  pivot: [32, 32],
  height: 64 / 104,
  presets: ALL,
  camera: { yaw: 0, pitch: -10 },
  ss: 3,
};

/* ------------------------------ BALÃO-TUCANO ------------------------------ */
function buildBalao(variant: string) {
  const n = Math.max(1, Math.min(3, parseInt(variant, 10) || 1));
  const r = new Rig('root');
  r.bone('float', 'root', [0, 0.0, 0]);
  r.bone('balloon', 'float', [0, 0.36, 0]);
  r.bone('tag', 'float', [0, -0.08, 0]);
  const tint = [0x1e1a22, 0x1e5a34, 0x1e3a8a][n - 1];
  const body = mat('plastic', tint, { rough: 0.2, rim: 0.8 });
  const bib = mat('plastic', 0xfff0b0, { rough: 0.25 });
  const beakO = mat('plastic', 0xff8a1a, { rough: 0.25 });
  const beakY = mat('plastic', 0xffd23a, { rough: 0.25 });
  const beakR = mat('plastic', 0xe8302a, { rough: 0.25 });
  const eyeRing = mat('plastic', 0x7ad0ff, { rough: 0.3 });
  const string = mat('cloth', 0xf4ecd8, { repeat: 6 });
  // balão redondo (cabeça do tucano) com nó
  r.add('balloon',
    blob([0.26, 0.29, 0.24], body, { deform: [taper('y', -0.29, 0.29, 0.82, 1), wobble(0.003)], seg: 40 }),
    blob([0.17, 0.17, 0.12], bib, { pos: [0.08, -0.05, 0.13], seg: 30 }),
    lathe([[0.001, 0], [0.04, 0.02], [0.03, 0.04], [0.001, 0.05]], body, { pos: [0, -0.33, 0], rot: [180, 0, 0] }),
    // bicão
    blob([0.26, 0.13, 0.1], beakO, { pos: [0.33, 0.0, 0.05], deform: [taper('x', -0.26, 0.26, 1, 0.3), (p) => { p.y -= (p.x / 0.26) ** 2 * 0.05; }], seg: 36 }),
    blob([0.22, 0.07, 0.095], beakY, { pos: [0.3, 0.07, 0.052], deform: [taper('x', -0.22, 0.22, 1, 0.3), (p) => { p.y -= (p.x / 0.22) ** 2 * 0.05; }], seg: 30 }),
    blob([0.05, 0.04, 0.05], mat('plastic', 0x1a1a1a, { rough: 0.25 }), { pos: [0.56, -0.05, 0.05], seg: 16 }),
    blob([0.03, 0.06, 0.08], beakR, { pos: [0.1, 0.0, 0.06], seg: 16 }),
    tube([[0.12, -0.01, 0.13], [0.33, -0.03, 0.135], [0.52, -0.06, 0.09]], 0.007, mat('plastic', 0x6a2a0a)),
    // olho com anel azul
    blob([0.075, 0.07, 0.025], eyeRing, { pos: [0.08, 0.1, 0.2] }),
    // brilho do plástico
    blob([0.05, 0.025, 0.01], mat('glow', 0xffffff, { emissiveIntensity: 1, opacity: 0.85 }), { pos: [-0.1, 0.16, 0.2], rot: [0, 0, 35] }),
  );
  const e = new THREE.Group();
  e.position.set(0.09, 0.1, 0.225);
  e.add(blob([0.03, 0.03, 0.012], mat('pupil', 0x0d0a12)), blob([0.01, 0.01, 0.005], mat('glint', 0xffffff), { pos: [-0.008, 0.01, 0.01] }));
  r.add('balloon', e);
  // barbante com etiqueta de penas (uma pena por vida)
  r.add('float', tube([[0, 0.03, 0], [0.02, -0.02, 0], [-0.015, -0.06, 0], [0, -0.1, 0]], 0.004, string, { seg: 20, radial: 4 }));
  const fcol = [mat('skin', 0xe8302a, { rough: 0.5 }), mat('skin', 0xffc030, { rough: 0.5 }), mat('skin', 0x2a7ad8, { rough: 0.5 })];
  for (let i = 0; i < n; i++) {
    const a = (i - (n - 1) / 2) * 24;
    r.add('tag', grp([featherMesh(0.15, fcol[i])], [0, 0, 0.01 * i], [0, 0, 180 + a]));
  }
  r.add('tag', blob([0.018, 0.018, 0.018], string));
  return r;
}
function featherMesh(len: number, m: THREE.Material) {
  return grp([
    slab([[0, 0], [len * 0.22, len * 0.25], [len * 0.25, len * 0.6], [len * 0.1, len * 0.95], [0, len], [-len * 0.15, len * 0.7], [-len * 0.2, len * 0.3]], len * 0.06, m, { deform: [(p) => { p.z += Math.sin((p.y / len) * Math.PI) * len * 0.1; }] }),
    tube([[0, -len * 0.1, len * 0.03], [0, len * 0.5, len * 0.05], [0, len * 0.95, len * 0.03]], len * 0.02, mat('shell', 0xf4ecd8)),
  ]);
}
export const balaoTucano: ModelDef = {
  id: 'balao-tucano',
  kind: 'pickup',
  build: buildBalao,
  anims: {
    flutuar: {
      frames: 24, loop: true, keys: {
        float: wave(12, (t) => ({ p: [0, Math.sin(t * Math.PI * 2) * 0.05, 0], r: [0, 0, Math.sin(t * Math.PI * 2 + 0.6) * 4] })),
        balloon: wave(12, (t) => ({ r: [0, Math.sin(t * Math.PI * 2) * 10, Math.sin(t * Math.PI * 2) * 3], s: [1 + Math.sin(t * Math.PI * 4) * 0.015, 1 - Math.sin(t * Math.PI * 4) * 0.015, 1] })),
        tag: wave(12, (t) => ({ r: [0, Math.sin(t * Math.PI * 2 + 1) * 25, Math.sin(t * Math.PI * 2 + 1) * 10] })),
      },
    },
  },
  cell: [128, 128],
  pivot: [52, 96],
  height: 128 / 104,
  presets: ALL,
  variants: ['base', '1', '2', '3'],
  ss: 2,
};

/* ------------------------------ PENA ------------------------------ */
function buildPena() {
  const r = new Rig('root');
  r.bone('feather', 'root', [0, -0.26, 0], [0, 0, -18]);
  r.bones.feather.scale.setScalar(1.3);
  r.bone('fx', 'root');
  const red = mat('skin', 0xe02a22, { rough: 0.5, rim: 0.8 });
  const yellow = mat('skin', 0xffc02a, { rough: 0.5 });
  const blue = mat('skin', 0x2a6ad8, { rough: 0.5 });
  const quill = mat('shell', 0xf8f0dc, { rough: 0.3 });
  const L = 0.42;
  // vexilo em camadas: vermelho, faixa amarela e ponta azul (arara)
  const vane = (w: number, y0: number, y1: number, m: THREE.Material, z: number) => slab([[0, y0], [w, y0 + (y1 - y0) * 0.2], [w * 1.05, y0 + (y1 - y0) * 0.6], [w * 0.4, y1], [0, y1 + 0.01], [-w * 0.35, y1 - 0.01], [-w * 0.9, y0 + (y1 - y0) * 0.6], [-w * 0.8, y0 + (y1 - y0) * 0.2]], 0.012, m, { pos: [0, 0, z], deform: [(p) => { p.z += Math.sin((p.y / L) * Math.PI) * 0.03 - Math.abs(p.x) * 0.15; }] });
  r.add('feather',
    vane(0.07, 0.06, L, red, 0),
    vane(0.068, 0.26, L * 0.97, yellow, 0.004),
    vane(0.06, 0.32, L * 0.99, blue, 0.008),
    tube([[0, -0.04, 0.012], [0.003, 0.2, 0.02], [0, L, 0.014]], (t) => 0.01 * (1 - t * 0.7), quill, { seg: 20 }),
    // barbas soltas na base
    ...[0, 1, 2].map((i) => tube([[0, 0.03 + i * 0.02, 0.01], [0.04 + i * 0.01, 0.0 + i * 0.03, 0.01], [0.06 + i * 0.01, -0.02 + i * 0.03, 0.0]], 0.004, red, { seg: 8, radial: 4 })),
    // fendas no vexilo
    slab([[0.04, 0.18], [0.075, 0.17], [0.075, 0.175]], 0.014, mat('skin', 0xb01a12), { pos: [0, 0, 0.006], smooth: false }),
  );
  r.add('fx', sparkle(0.06, glint(), { pos: [0.1, 0.15, 0.15] }));
  return r;
}
export const pena: ModelDef = {
  id: 'pena',
  kind: 'pickup',
  build: buildPena,
  anims: {
    idle: still({ fx: [{ t: 0, s: 0.6 }] }),
    girar: {
      frames: 12, loop: true, keys: {
        feather: wave(12, (t) => ({ r: [0, Math.sin(t * Math.PI * 2) * 35, Math.sin(t * Math.PI * 2) * 8], p: [0, Math.sin(t * Math.PI * 2) * 0.02, 0] })),
        fx: wave(12, (t) => ({ s: Math.max(0.001, Math.sin(t * Math.PI * 2) * 0.7 + 0.35), r: [0, 0, t * 90] })),
      },
    },
  },
  cell: [80, 80],
  pivot: [40, 40],
  height: 80 / 104,
  presets: ALL,
  camera: FRONT,
  ss: 3,
};

export const COLETAVEIS: ModelDef[] = [castanha, cacho, letter('c'), letter('i'), letter('p'), letter('o'), moedaFolha, ficha, parafuso, balaoTucano, pena];
