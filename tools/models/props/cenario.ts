/**
 * Objetos de cenário: TRONCO flutuante, CARRINHO de mina, PAREDE RACHADA (4 mundos), TERRA MOLE e BLOCO DE MADEIRA.
 */
import { Rig, THREE, blob, tube, slab, lathe, roundBox, ring, spike, mat, wobble, applyDeform, type V3 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { grp, nail, rope, leaf, breakKeys, still, wave, type Piece, lazyAnims } from './kit';

/* ------------------------------ TRONCO ------------------------------ */
function buildTronco() {
  const r = new Rig('root');
  const bark = mat('bark', 0x6a4a2e, { repeat: 2.5 });
  const barkDark = mat('bark', 0x4a3220, { repeat: 2.5 });
  const cut = mat('wood', 0xd8b07a);
  const ringM = mat('wood', 0xa8804a);
  const moss = mat('grass', 0x5a8a2a, { repeat: 3 });
  const cap = mat('skin', 0xe8783a, { rough: 0.5 });
  const stem = mat('skin', 0xf4e8d0, { rough: 0.6 });
  const leafM = mat('leaf', 0x5aa83a);
  const L = 1.8, R = 0.2;
  r.bone('log', 'root', [0, R * 0.7, 0]);
  // corpo (torno deitado ao longo de X)
  r.add('log', lathe([[R * 0.92, -L / 2], [R, -L / 2 + 0.06], [R * 0.97, -0.3], [R * 1.03, 0.1], [R * 0.95, L / 2 - 0.06], [R * 0.9, L / 2]], bark, { rot: [0, 0, -90], deform: [wobble(0.008, 5)], seg: 28 }));
  // tampos cortados com anéis de crescimento
  for (const sx of [-1, 1]) {
    const g = grp([
      blob([R * 0.9, R * 0.9, 0.02], cut, { seg: 24 }),
      ...[0.25, 0.45, 0.65, 0.82].map((k) => ring(R * k, 0.005, ringM, { pos: [0.01, 0, 0.015] })),
      blob([0.015, 0.015, 0.01], ringM, { pos: [0.01, 0, 0.022] }),
      // rachadura radial
      slab([[0, 0], [0.12, 0.01], [0.12, 0.018]], 0.006, barkDark, { pos: [0, 0, 0.02], smooth: false }),
    ], [sx * (L / 2 - 0.005), 0, 0], [0, sx * 90, 0]);
    r.add('log', g);
  }
  // tocos de galho e musgo
  r.add('log',
    tube([[0.3, R * 0.8, 0.05], [0.36, R + 0.12, 0.08], [0.42, R + 0.16, 0.1]], (t) => 0.045 - t * 0.02, bark),
    blob([0.03, 0.03, 0.01], cut, { pos: [0.42, R + 0.17, 0.1], rot: [70, 0, -40] }),
    tube([[-0.5, R * 0.6, R * 0.7], [-0.56, R * 0.7, R + 0.1]], 0.035, bark),
    ...[[-0.4, 0.06, 0.05, 0.1], [-0.28, 0.04, 0.1, 0.08], [-0.16, 0.08, 0.02, 0.11], [-0.05, 0.03, 0.12, 0.07], [0.5, 0.05, 0.0, 0.09], [0.6, 0.02, 0.1, 0.07]].map(([x, z, dz, rr]) =>
      blob([rr, rr * 0.45, rr * 0.9], moss, { pos: [x, R * 0.93 - Math.abs(dz) * 0.4, z + dz * 0.5], deform: [wobble(0.012, 18)], seg: 16 })),
    ...[[-0.3, 0.17], [0.0, 0.18], [0.45, 0.17]].map(([x, z]) => blob([0.06, 0.03, 0.04], moss, { pos: [x, R * 0.55, z], rot: [60, 0, 0], deform: [wobble(0.01, 18)], seg: 14 })),
    // cogumelos laranja
    ...[[-0.65, 0.04, 1.0], [-0.58, 0.02, 0.8], [0.12, 0.05, 0.9]].flatMap(([x, z, k]) => [
      tube([[x, R * 0.85, z + R * 0.5], [x + 0.01, R * 0.85 + 0.06 * k, z + R * 0.5 + 0.02]], 0.012 * k, stem),
      blob([0.04 * k, 0.022 * k, 0.04 * k], cap, { pos: [x + 0.01, R * 0.85 + 0.07 * k, z + R * 0.5 + 0.02], deform: [(p) => { if (p.y < 0) p.y *= 0.3; }] }),
    ]),
    // broto com duas folhas
    tube([[0.75, R * 0.9, 0.0], [0.77, R + 0.1, 0.02]], 0.008, leafM),
    leaf(0.1, 0.05, leafM, { pos: [0.77, R + 0.1, 0.02], rot: [0, 0, -50] }),
    leaf(0.09, 0.05, leafM, { pos: [0.77, R + 0.1, 0.02], rot: [0, 0, 60] }),
  );
  // anel d'água em volta (linha de flutuação)
  r.bone('ripple', 'root', [0, 0.02, 0]);
  r.add('ripple', ...[-0.6, 0, 0.6].map((x, i) => ring(0.32 - i * 0.03, 0.012, mat('water', 0xcfefff, { opacity: 0.55 }), { pos: [x, 0, 0], rot: [90, 0, 0], scale: [1.4, 1, 1], castShadow: false })));
  return r;
}

export const tronco: ModelDef = {
  id: 'tronco',
  kind: 'prop',
  build: buildTronco,
  anims: {
    idle: {
      frames: 24, loop: true, keys: {
        log: wave(12, (t) => ({ p: [0, Math.sin(t * Math.PI * 2) * 0.025, 0], r: [Math.sin(t * Math.PI * 2 + 1) * 2, 0, Math.sin(t * Math.PI * 2) * 1.5] })),
        ripple: wave(12, (t) => ({ s: [1 + t * 0.15, 1, 1 + t * 0.15] })),
      },
    },
    afundar: {
      frames: 16, loop: false, keys: {
        log: [{ t: 0, p: [0, 0, 0], r: [0, 0, 0] }, { t: 0.15, p: [0, -0.06, 0], r: [0, 0, -3] }, { t: 0.35, p: [0, -0.02, 0], r: [0, 0, 2] }, { t: 1, p: [0, -0.32, 0], r: [0, 0, -4], e: 'in' }],
        ripple: [{ t: 0, s: 1 }, { t: 0.15, s: [1.3, 1, 1.3] }, { t: 1, s: [1.6, 1, 1.6] }],
      },
    },
  },
  cell: [256, 96],
  pivot: [128, 64],
  height: 96 / 104,
  presets: ['selva', 'caverna', 'recife', 'neutro'],
};

/* ------------------------------ CARRINHO ------------------------------ */
function buildCarrinho() {
  const r = new Rig('root');
  const plank = mat('wood', 0x9a6a3a, { repeat: 1.2 });
  const plank2 = mat('wood', 0x7a4e2a, { repeat: 1.2 });
  const iron = mat('rust', 0x6a5448, { metal: 0.55 });
  const steel = mat('metal', 0x8a8a8e, { metal: 0.55, rough: 0.35 });
  const brass = mat('metal', 0xd8a840, { metal: 0.55, rough: 0.3 });
  const flame = mat('glow', 0xffb040, { emissiveIntensity: 1.6 });
  const glass = mat('glass', 0xfff0c0, { opacity: 0.45 });
  const red = mat('paint', 0xb83a2a, { rough: 0.55 });
  r.bone('body', 'root', [0, 0.3, 0]);
  const W = 1.1, D = 0.6, Hh = 0.5;
  // caçamba de tábuas (trapézio: mais larga em cima)
  for (let i = 0; i < 4; i++) {
    const y = 0.07 + i * 0.12;
    const k = 1 + i * 0.05;
    r.add('body',
      roundBox([W * k, 0.11, 0.05], 0.015, i % 2 ? plank : plank2, { pos: [0, y, (D / 2) * k], deform: [wobble(0.003, 13)] }),
      roundBox([W * k, 0.11, 0.05], 0.015, i % 2 ? plank2 : plank, { pos: [0, y, (-D / 2) * k] }),
      roundBox([0.05, 0.11, D * k], 0.015, i % 2 ? plank : plank2, { pos: [(W / 2) * k, y, 0] }),
      roundBox([0.05, 0.11, D * k], 0.015, i % 2 ? plank2 : plank, { pos: [(-W / 2) * k, y, 0] }),
    );
  }
  r.add('body', roundBox([W, 0.04, D], 0.01, plank2, { pos: [0, 0.02, 0] }));
  // cintas de ferro com rebites
  for (const x of [-0.38, 0.38]) {
    r.add('body', roundBox([0.07, Hh + 0.02, 0.02], 0.006, iron, { pos: [x * 1.08, 0.25, D / 2 + 0.06], rot: [-5, 0, x > 0 ? -3 : 3] }));
    for (let i = 0; i < 4; i++) r.add('body', nail(0.013, brass, { pos: [x * 1.08 + (x > 0 ? -0.002 : 0.002) * i, 0.06 + i * 0.13, D / 2 + 0.075] }));
  }
  r.add('body',
    roundBox([W * 1.18, 0.05, 0.06], 0.02, iron, { pos: [0, Hh + 0.02, D * 0.59] }),
    roundBox([W * 1.18, 0.05, 0.06], 0.02, iron, { pos: [0, Hh + 0.02, -D * 0.59] }),
    roundBox([0.06, 0.05, D * 1.18], 0.02, iron, { pos: [W * 0.59, Hh + 0.02, 0] }),
    roundBox([0.06, 0.05, D * 1.18], 0.02, iron, { pos: [-W * 0.59, Hh + 0.02, 0] }),
  );
  // faixa vermelha pintada e número em placa (sem letras: losango)
  r.add('body',
    roundBox([0.26, 0.16, 0.02], 0.01, red, { pos: [0, 0.27, D / 2 + 0.06] }),
    slab([[0, 0.05], [0.05, 0], [0, -0.05], [-0.05, 0]], 0.01, brass, { pos: [0, 0.27, D / 2 + 0.075], smooth: false }),
  );
  // eixo, mancais e lamparina pendurada na frente
  r.add('body',
    tube([[W / 2 + 0.02, Hh - 0.02, 0], [W / 2 + 0.14, Hh + 0.06, 0], [W / 2 + 0.2, Hh + 0.02, 0]], 0.014, steel),
    tube([[W / 2 + 0.2, Hh + 0.02, 0], [W / 2 + 0.2, Hh - 0.08, 0]], 0.005, steel),
    lathe([[0.001, -0.2], [0.04, -0.19], [0.045, -0.12], [0.03, -0.1], [0.001, -0.1]], brass, { pos: [W / 2 + 0.2, Hh + 0.02, 0] }),
    lathe([[0.04, -0.19], [0.05, -0.15], [0.04, -0.11]], glass, { pos: [W / 2 + 0.2, Hh + 0.02 - 0.0, 0] }),
    blob([0.018, 0.03, 0.018], flame, { pos: [W / 2 + 0.2, Hh - 0.14, 0], castShadow: false }),
    // corda e saco de carga
    rope([[-W / 2, Hh + 0.04, D / 2], [-W / 2 - 0.05, Hh - 0.1, D / 2 + 0.06], [-W / 2 + 0.02, Hh - 0.25, D / 2 + 0.07]], 0.012, mat('cloth', 0xc8a868), { twists: 5 }),
    // carga: pedras e um cristal
    blob([0.2, 0.08, 0.16], mat('rock', 0x6a6460), { pos: [-0.2, Hh + 0.02, 0], deform: [wobble(0.02)] }),
    blob([0.14, 0.07, 0.12], mat('rock', 0x5a5450), { pos: [0.15, Hh + 0.03, 0.05], deform: [wobble(0.02)] }),
    slab([[-0.03, 0], [0.03, 0], [0.02, 0.12], [0, 0.15], [-0.02, 0.12]], 0.03, mat('crystal', 0x8ad8ff, { emissive: 0x3a8aff, emissiveIntensity: 0.4 }), { pos: [0.02, Hh + 0.04, 0], rot: [10, 20, -15], smooth: false }),
  );
  // rodas
  for (const [i, x] of [-0.36, 0.36].entries()) for (const z of [-D / 2 - 0.05, D / 2 + 0.05]) {
    const b = `w${i}${z > 0 ? 'f' : 'b'}`;
    r.bone(b, 'root', [x, 0.13, z]);
    r.add(b,
      lathe([[0.001, -0.025], [0.13, -0.025], [0.14, -0.015], [0.15, 0.02], [0.13, 0.025], [0.001, 0.025]], steel, { rot: [90, 0, 0], seg: 28 }),
      ring(0.1, 0.012, iron, { pos: [0, 0, 0.03 * Math.sign(z)] }),
      blob([0.035, 0.035, 0.03], brass, { pos: [0, 0, 0.03 * Math.sign(z)] }),
      ...[0, 60, 120].map((a) => roundBox([0.2, 0.02, 0.012], 0.005, iron, { pos: [0, 0, 0.03 * Math.sign(z)], rot: [0, 0, a] })),
    );
  }
  return r;
}
const WHEELS = ['w0f', 'w0b', 'w1f', 'w1b'];
export const carrinho: ModelDef = {
  id: 'carrinho',
  kind: 'prop',
  build: buildCarrinho,
  anims: {
    idle: still(),
    andar: {
      frames: 8, loop: true, keys: {
        ...Object.fromEntries(WHEELS.map((w) => [w, [{ t: 0, r: [0, 0, 0] as V3 }, { t: 1, r: [0, 0, -360] as V3, e: 'linear' as const }]])),
        body: wave(8, (t) => ({ p: [0, Math.abs(Math.sin(t * Math.PI * 2)) * 0.015, 0], r: [0, 0, Math.sin(t * Math.PI * 4) * 1.2] })),
      },
    },
  },
  cell: [192, 128],
  pivot: [96, 116],
  height: 128 / 104,
  presets: ['caverna', 'selva', 'neutro'],
};

/* ------------------------------ PAREDE RACHADA ------------------------------ */
const WW = 64 / 104, WH = 192 / 104, WD = 0.5;

/** Ruído determinístico 0..1 a partir da posição (mesma posição → mesmo valor, então as faces não se descolam). */
const hash = (x: number, y: number, z: number, k: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + k * 19.19) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Pedra talhada: caixa de poucas faces com quinas chanfradas de forma irregular, facetas planas (sombreado chapado)
 * e, opcionalmente, cantos da frente lascados. `chips` = cantos da face frontal a arrancar: [sinalX, sinalY, tamanho].
 */
function hewn(size: V3, m: THREE.Material, seed: number, o: { pos?: V3; rot?: V3; rough?: number; chips?: [number, number, number][] } = {}) {
  const [w, h, d] = size;
  const g = new THREE.BoxGeometry(w, h, d, Math.max(2, Math.round(w / 0.1)), Math.max(2, Math.round(h / 0.1)), Math.max(2, Math.round(d / 0.16)));
  const rough = o.rough ?? 1;
  const cham = Math.min(w, h, d) * 0.05;
  applyDeform(g, [(p) => {
    const ex = Math.abs(Math.abs(p.x) - w / 2) < 1e-4, ey = Math.abs(Math.abs(p.y) - h / 2) < 1e-4, ez = Math.abs(Math.abs(p.z) - d / 2) < 1e-4;
    const k0 = hash(p.x, p.y, p.z, seed), k1 = hash(p.y, p.z, p.x, seed + 3), k2 = hash(p.z, p.x, p.y, seed + 7);
    const sx = Math.sign(p.x), sy = Math.sign(p.y), sz = Math.sign(p.z);
    const front = p.z > d / 2 - 1e-4;
    // chanfro irregular nas arestas e cantos (quinas quebradas, nunca arredondadas)
    const edges = (ex ? 1 : 0) + (ey ? 1 : 0) + (ez ? 1 : 0);
    if (edges >= 2) {
      const c = cham * (0.45 + k0 * 1.1) * (edges === 3 ? 1.25 : 1);
      if (ex) p.x -= sx * c;
      if (ey) p.y -= sy * c;
      if (ez) p.z -= sz * c * 0.8;
    }
    // facetas: cada vértice sai do plano, mais forte na face da frente
    p.x += (k0 - 0.5) * 0.012 * rough * (ex ? 0.5 : 1);
    p.y += (k1 - 0.5) * 0.012 * rough * (ey ? 0.5 : 1);
    p.z += (k2 - 0.5) * (front ? 0.05 : 0.02) * rough;
    // lascas: canto da frente arrancado em cunha
    if (front) for (const [cx, cy, sz2] of o.chips ?? []) {
      const dx = Math.abs(p.x - cx * w / 2), dy = Math.abs(p.y - cy * h / 2);
      const f = Math.max(0, 1 - Math.max(dx, dy) / sz2);
      if (f > 0) { p.z -= f * sz2 * 0.9; p.x -= cx * f * sz2 * 0.25; p.y -= cy * f * sz2 * 0.25; }
    }
  }]);
  const mesh = new THREE.Mesh(g.toNonIndexed(), m);
  mesh.geometry.computeVertexNormals();
  if (o.pos) mesh.position.set(...o.pos);
  if (o.rot) mesh.rotation.set(o.rot[0] * Math.PI / 180, o.rot[1] * Math.PI / 180, o.rot[2] * Math.PI / 180);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function buildParede(variant: string) {
  const r = new Rig('root');
  const v = ['mata', 'gruta', 'recife', 'fabrica'].includes(variant) ? variant : 'mata';
  const P = {
    mata: { kind: 'earth', cols: [0x7a5232, 0x6a4628, 0x8a6040], c: 0x6e6658, crack: 0x1a0e06, back: 0x2a1a0e },
    gruta: { kind: 'rock', cols: [0x7a6e62, 0x6a6056, 0x887a6a], c: 0x5e564c, crack: 0x120c08, back: 0x1a1410 },
    recife: { kind: 'sand', cols: [0xd8c090, 0xc8ac80, 0xe0cca0], c: 0xc89a7a, crack: 0x2a1a10, back: 0x3a2a1a },
    fabrica: { kind: 'rust', cols: [0x8a4a36, 0x7a5a4a, 0x6a4a3e], c: 0x5a504a, crack: 0x100806, back: 0x1a0e0a },
  }[v as 'mata'];
  const metalWall = v === 'fabrica';
  const M = {
    a: mat(P.kind as 'earth', P.cols[0], { repeat: 0.7, flat: !metalWall }), b: mat(P.kind as 'earth', P.cols[1], { repeat: 0.7, flat: !metalWall }), c: mat(metalWall ? 'metal' : 'rock', P.c, metalWall ? { metal: 0.6, rough: 0.5 } : { repeat: 0.8, flat: true }),
    d: mat(P.kind as 'earth', P.cols[2], { repeat: 0.7, flat: !metalWall }), crack: mat('skin', P.crack, { rough: 1, rim: 0 }), back: mat('rock', P.back),
    // aresta iluminada da rachadura (o lado que pega luz) e luz que vaza lá de dentro
    lip: mat('paint', P.cols[2], { rough: 0.9, rim: 0 }),
    leak: mat('glow', 0xffd890, { emissiveIntensity: 0.9 }),
  };
  r.bone('wall', 'root');
  r.bone('back', 'wall');
  r.add('back', roundBox([WW - 0.04, WH - 0.04, WD * 0.8], 0.02, M.back, { pos: [0, WH / 2, -0.04] }));
  const pieces: Piece[] = [];
  const ROWS = 5;
  const rowH = WH / ROWS;
  let n = 0;
  for (let j = 0; j < ROWS; j++) {
    const off = j % 2 ? 0.5 : 0;
    const cols = j % 2 ? [[-WW / 2, -WW * 0.05], [-WW * 0.05, WW / 2]] : [[-WW / 2, WW * 0.12], [WW * 0.12, WW / 2]];
    for (const [ci, [x0, x1]] of cols.entries()) {
      const b = `c${n}`;
      r.bone(b, 'wall', [(x0 + x1) / 2, rowH * (j + 0.5), 0]);
      const w = x1 - x0 - (metalWall ? 0.012 : 0.014), h = rowH - (metalWall ? 0.012 : 0.014);
      const m = [M.a, M.b, M.d, M.c][(n * 3 + j) % 4];
      if (v === 'fabrica') {
        r.add(b, roundBox([w, h, WD], 0.02, m, { deform: [wobble(0.004, 9)] }));
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) r.add(b, nail(0.018, mat('metal', 0x8a8480, { metal: 0.55, rough: 0.4 }), { pos: [sx * (w / 2 - 0.04), sy * (h / 2 - 0.04), WD / 2 + 0.005] }));
      } else {
        // pedra talhada de arestas vivas; um ou dois cantos da frente lascados por bloco
        const chips: [number, number, number][] = [[ci ? -1 : 1, n % 2 ? 1 : -1, 0.07 + (n % 3) * 0.02]];
        if (n % 3 === 1) chips.push([ci ? 1 : -1, n % 2 ? -1 : 1, 0.06]);
        r.add(b, hewn([w, h, WD], m, n * 5 + 1 + off, { chips }));
        // lasca solta encostada na junta de baixo
        if (n % 2 === 0) r.add(b, hewn([0.07 + (n % 3) * 0.015, 0.035, 0.05], [M.d, M.a, M.c][n % 3], n + 40, { pos: [(ci ? -1 : 1) * w * 0.22, -h / 2 + 0.012, WD / 2 + 0.02], rot: [20, n * 23 % 60 - 30, n * 17 % 40 - 20], rough: 0.5 }));
      }
      const dirx = (x0 + x1) / 2 > 0 ? 1 : -1;
      pieces.push({ bone: b, dir: [dirx * (0.35 + j * 0.06) + 0.3, -rowH * (j + 0.5) + 0.12, 0.25 + (n % 3) * 0.1], spin: [n * 37 % 120 - 60, n * 53 % 160 - 80, dirx * -(120 + j * 40)], up: 0.2 + (n % 3) * 0.12, fall: 0, shrink: 0.75, delay: (ROWS - j) * 0.012 });
      n++;
    }
  }
  // rachadura principal em zigue-zague: fenda larga e escura afundada entre os blocos, com a borda de um lado
  // iluminada (profundidade), ramificações e um fio de luz vazando só no miolo
  // a fenda mora num osso próprio: some no estouro em vez de voar grudada nos blocos
  r.bone('cracks', 'wall');
  const CZ = WD / 2 + 0.012;
  const crack: [number, number][] = [[-0.06, WH * 0.97], [0.07, WH * 0.8], [-0.07, WH * 0.63], [0.09, WH * 0.47], [-0.04, WH * 0.3], [0.07, WH * 0.14], [0.0, WH * 0.02]];
  for (let k = 0; k < crack.length - 1; k++) {
    const [ax, ay] = crack[k], [bx, by] = crack[k + 1];
    const loc = (x: number, y: number, z = 0): V3 => [x, y, z];
    // fenda achatada contra a face da pedra (escala em Z em torno do plano da frente)
    const flatOn = (...o: THREE.Object3D[]) => grp(o, [0, 0, CZ], [0, 0, 0], [1, 1, 0.4]);
    // meio do trecho levemente quebrado para a fenda não parecer régua
    const mx = (ax + bx) / 2 + (k % 2 ? 0.022 : -0.022), my = (ay + by) / 2 + 0.012;
    const wide = (t: number) => 0.016 + 0.024 * Math.sin(t * Math.PI) ** 0.7;
    r.add('cracks', flatOn(
      tube([loc(ax + 0.01, ay, -0.02), loc(mx + 0.011, my, -0.02), loc(bx + 0.01, by, -0.02)], (t) => wide(t) + 0.002, M.lip, { seg: 10, radial: 6, castShadow: false }),
      tube([loc(ax, ay), loc(mx, my), loc(bx, by)], wide, M.crack, { seg: 10, radial: 6, castShadow: false }),
      // ramificações finas saindo do vértice e do meio
      tube([loc(ax, ay), loc(ax + (k % 2 ? 0.07 : -0.07), ay - 0.035), loc(ax + (k % 2 ? 0.13 : -0.12), ay - 0.03 - (k % 3) * 0.02)], (t) => 0.014 * (1 - t) + 0.002, M.crack, { seg: 8, radial: 5, castShadow: false }),
      tube([loc(mx, my), loc(mx + (k % 2 ? -0.05 : 0.06), my + 0.03), loc(mx + (k % 2 ? -0.09 : 0.1), my + 0.075)], (t) => 0.01 * (1 - t) + 0.002, M.crack, { seg: 8, radial: 5, castShadow: false }),
    ));
    if (k >= 1 && k <= 4) r.add('cracks', tube([loc(ax, ay, CZ + 0.014), loc(mx, my, CZ + 0.014), loc(bx, by, CZ + 0.014)], (t) => 0.005 * Math.sin(t * Math.PI), M.leak, { seg: 8, radial: 5, castShadow: false }));
  }
  if (!metalWall) {
    // entulho ao pé da parede (cai junto com os blocos de baixo)
    const rubble: [number, number, number, number][] = [[-0.2, 0.09, 0.07, 0], [-0.07, 0.06, 0.12, 1], [0.1, 0.1, 0.09, 0], [0.22, 0.07, 0.05, 1], [0.02, 0.045, 0.17, 0]];
    rubble.forEach(([x, sz, dz, side], i) => {
      const b = `c${x > WW * 0.12 ? 1 : 0}`;
      const base = r.bones[b].position;
      r.add(b, hewn([sz, sz * 0.62, sz * 0.8], [M.a, M.d, M.c, M.b][i % 4], i + 60, { pos: [x - base.x, sz * 0.26 - base.y, WD / 2 + dz], rot: [side * 14, i * 37 % 70 - 35, i * 29 % 30 - 15], rough: 0.6 }));
    });
  }
  // decoração por mundo
  if (v === 'mata') {
    r.add('c8', tube([[-0.2, 0.1, WD / 2], [-0.1, -0.05, WD / 2 + 0.03], [0.05, -0.12, WD / 2 + 0.02], [0.15, -0.3, WD / 2 + 0.04]], (t) => 0.025 - t * 0.015, mat('bark', 0x5a3e24)));
    r.add('c3', leaf(0.14, 0.07, mat('leaf', 0x4a8a2e), { pos: [0.1, 0.1, WD / 2 + 0.02], rot: [0, 0, -40] }));
    r.add('c5', blob([0.18, 0.05, 0.12], mat('grass', 0x5a8a2a), { pos: [0, rowH / 2 - 0.02, WD / 2 - 0.05] }));
  } else if (v === 'gruta') {
    r.add('c6', slab([[-0.03, 0], [0.03, 0], [0.02, 0.1], [0, 0.13], [-0.02, 0.1]], 0.03, mat('crystal', 0xb08aff, { emissive: 0x6a3aff, emissiveIntensity: 0.5 }), { pos: [0.1, 0.1, WD / 2], rot: [30, 0, -20], smooth: false }));
    r.add('c1', blob([0.05, 0.03, 0.04], mat('glow', 0x6affc0, { emissiveIntensity: 0.8 }), { pos: [-0.1, -0.1, WD / 2 + 0.02] }));
  } else if (v === 'recife') {
    r.add('c4', ...[0, 1, 2, 3, 4].map((i) => spike(0.08, 0.02, mat('coral', 0xff7a8a), { pos: [-0.1 + i * 0.04, rowH / 2 - 0.03, WD / 2 - 0.05], rot: [0, 0, (i - 2) * 20] })));
    r.add('c7', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.03], [0.02, 0.06], [0.001, 0.07]], mat('shell', 0xf4d8c0), { pos: [0.05, 0.0, WD / 2 + 0.01], rot: [80, 0, 30] }));
  } else {
    r.add('c2', roundBox([0.3, 0.05, 0.03], 0.01, mat('paint', 0xe8c030), { pos: [0, 0.05, WD / 2 + 0.01], rot: [0, 0, 30] }), roundBox([0.3, 0.05, 0.03], 0.01, mat('paint', 0x1a1a1a), { pos: [0, -0.04, WD / 2 + 0.01], rot: [0, 0, 30] }));
  }
  return { r, pieces };
}
export const paredeRachada: ModelDef = lazyAnims({
  id: 'parede-rachada',
  kind: 'prop',
  build: (v) => buildParede(v).r,
  cell: [192, 224],
  pivot: [64, 208],
  height: 224 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'],
  variants: ['base', 'mata', 'gruta', 'recife', 'fabrica'],
  camera: { yaw: 8 },
} as Omit<ModelDef, 'anims'>, () => {
  const pw = buildParede('mata').pieces;
  return {
    idle: still(),
    quebrar: { frames: 12, loop: false, keys: { ...breakKeys(pw, { shake: 'wall', pop: 0.1 }), back: [{ t: 0, s: 1 }, { t: 0.12, s: 1 }, { t: 0.3, s: [0.01, 0.01, 0.01] }], cracks: [{ t: 0, s: 1 }, { t: 0.09, s: 1 }, { t: 0.14, s: [0.001, 0.001, 0.001] }] } },
  };
}) as ModelDef;

/* ------------------------------ TERRA MOLE ------------------------------ */
function buildTerra() {
  const r = new Rig('root');
  const dirt = mat('earth', 0x6a4426);
  const dirt2 = mat('earth', 0x5a3820);
  const dirt3 = mat('earth', 0x8a5a32);
  const sprout = mat('leaf', 0x6ab03a);
  const worm = mat('skin', 0xd88a8a, { rough: 0.4 });
  r.bone('mound', 'root');
  r.add('mound', blob([0.34, 0.15, 0.24], dirt, { deform: [(p) => { if (p.y < 0) p.y = 0; }, wobble(0.015, 9)], seg: 30 }));
  r.add('mound', tube([[-0.1, 0.12, 0.05], [-0.05, 0.16, 0.1], [0.0, 0.14, 0.14]], 0.012, worm), blob([0.006, 0.006, 0.006], mat('pupil', 0x000000), { pos: [0.005, 0.15, 0.152] }));
  const pieces: Piece[] = [];
  const clods: [number, number, number, number][] = [[-0.2, 0.06, 0.15, 0.07], [0.18, 0.08, 0.12, 0.06], [0.0, 0.14, 0.0, 0.08], [-0.1, 0.11, -0.08, 0.06], [0.24, 0.04, -0.08, 0.05], [0.08, 0.12, 0.16, 0.05], [-0.28, 0.03, -0.04, 0.05]];
  clods.forEach(([x, y, z, s], i) => {
    const b = `k${i}`;
    r.bone(b, 'root', [x, y, z]);
    r.add(b, blob([s, s * 0.75, s * 0.9], [dirt2, dirt3, dirt][i % 3], { deform: [wobble(0.01, 14)], seg: 14 }));
    if (i === 2) r.add(b, tube([[0, s * 0.6, 0], [0.01, s + 0.06, 0]], 0.006, sprout), leaf(0.06, 0.035, sprout, { pos: [0.01, s + 0.06, 0], rot: [0, 0, -50] }), leaf(0.055, 0.03, sprout, { pos: [0.01, s + 0.06, 0], rot: [0, 0, 55] }));
    pieces.push({ bone: b, dir: [x * 2.2 + (i % 2 ? 0.1 : -0.1), -y + 0.03, z * 1.5], spin: [i * 70, i * 40, -x * 600], up: 0.35 + (i % 3) * 0.12, fall: 0, shrink: 0.5, delay: i * 0.02 });
  });
  return { r, pieces };
}
export const terraMole: ModelDef = lazyAnims({
  id: 'terra-mole',
  kind: 'prop',
  build: () => buildTerra().r,
  cell: [160, 112],
  pivot: [80, 92],
  height: 112 / 104,
  presets: ['selva', 'caverna', 'recife', 'neutro'],
  camera: { pitch: -18 },
} as Omit<ModelDef, 'anims'>, () => {
  const tp = buildTerra().pieces;
  return {
    idle: still(),
    cavar: { frames: 10, loop: false, keys: { ...breakKeys(tp, { pop: 0.05 }), mound: [{ t: 0, s: 1 }, { t: 0.2, s: [1.15, 0.6, 1.15] }, { t: 1, s: [1.2, 0.12, 1.2], e: 'out' }] } },
  };
}) as ModelDef;

/* ------------------------------ BLOCO DE MADEIRA ------------------------------ */
function buildBloco() {
  const r = new Rig('root');
  const woodA = mat('wood', 0xb07a42, { repeat: 1.2 });
  const woodB = mat('wood', 0x8e5c30, { repeat: 1.2 });
  const iron = mat('metal', 0x7a746c, { metal: 0.55, rough: 0.4 });
  const dust = mat('sand', 0xd8b07a);
  const S = 64 / 104;
  r.bone('block', 'root', [0, S / 2, 0]);
  for (let i = 0; i < 3; i++) {
    const b = `pl${i}`;
    r.bone(b, 'block', [0, -S / 3 + i * (S / 3), 0]);
    r.add(b, roundBox([S - 0.01, S / 3 - 0.012, S - 0.02], 0.025, i % 2 ? woodA : woodB, { deform: [wobble(0.003, 12)] }));
    for (const x of [-S / 2 + 0.06, S / 2 - 0.06]) r.add(b, nail(0.014, iron, { pos: [x, 0, S / 2 - 0.005] }));
    // furinhos de cupim (já começando)
    r.add(b, ...[[0.1, 0.04], [-0.12, -0.03], [0.02, -0.04]].map(([x, y], k) => blob([0.012, 0.012, 0.006], mat('wood', 0x2a1808), { pos: [x + i * 0.02 - k * 0.01, y, S / 2 - 0.006] })));
  }
  // travessas laterais em X
  r.add('pl0', roundBox([0.06, S * 1.02, 0.06], 0.015, woodB, { pos: [-S / 2 + 0.04, S / 3, S / 2 - 0.02] }), roundBox([0.06, S * 1.02, 0.06], 0.015, woodB, { pos: [S / 2 - 0.04, S / 3, S / 2 - 0.02] }));
  r.bone('dust', 'root', [0, 0.0, 0]);
  r.add('dust', blob([0.28, 0.08, 0.22], dust, { deform: [(p) => { if (p.y < 0) p.y = 0; }, wobble(0.01, 15)], seg: 24 }));
  for (let k = 0; k < 6; k++) r.add('dust', blob([0.03, 0.015, 0.02], mat('wood', 0xc89a62), { pos: [-0.2 + k * 0.08, 0.02, 0.1 + (k % 2) * 0.06], rot: [0, k * 40, 0] }));
  return r;
}
export const blocoMadeira: ModelDef = {
  id: 'bloco-madeira',
  kind: 'prop',
  build: buildBloco,
  anims: {
    idle: still({ dust: [{ t: 0, s: 0.001 }] }),
    comido: {
      frames: 14, loop: false, keys: {
        block: wave(10, (t) => ({ r: [0, 0, t < 0.7 ? Math.sin(t * 40) * 2.5 : 0] })),
        pl2: [{ t: 0, s: 1, p: [0, 0, 0] }, { t: 0.15, s: [0.8, 0.85, 0.75] }, { t: 0.35, s: [0.3, 0.4, 0.3], p: [0.03, -0.05, 0] }, { t: 0.45, s: 0.001, p: [0, -0.2, 0] }],
        pl1: [{ t: 0, s: 1, p: [0, 0, 0] }, { t: 0.3, s: [0.85, 0.85, 0.8] }, { t: 0.55, s: [0.3, 0.4, 0.3], p: [-0.03, -0.04, 0] }, { t: 0.65, s: 0.001, p: [0, -0.15, 0] }],
        pl0: [{ t: 0, s: 1, p: [0, 0, 0] }, { t: 0.5, s: [0.85, 0.85, 0.8] }, { t: 0.75, s: [0.3, 0.4, 0.3] }, { t: 0.85, s: 0.001 }],
        dust: [{ t: 0, s: 0.001 }, { t: 0.2, s: [0.4, 0.3, 0.4] }, { t: 0.6, s: [0.8, 0.8, 0.8] }, { t: 1, s: 1 }],
      },
    },
  },
  cell: [128, 96],
  pivot: [64, 84],
  height: 96 / 104,
  presets: ['selva', 'caverna', 'recife', 'fabrica', 'neutro'],
};
