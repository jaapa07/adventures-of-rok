/**
 * PIRARUCU — montaria aquática gigante (~2.4 u de comprimento).
 * Corpo cilíndrico verde-oliva que vai ficando vermelho na traseira, com escamas grandes
 * de borda escura; cabeça achatada e ossuda, boca larga voltada para cima, olho dourado
 * brilhante, nadadeiras dorsal e anal recuadas junto da cauda arredondada.
 * Sela: almofada de folha de sororoca presa por cipó trançado.
 */
import { Rig, blob, tube, slab, ring, eye, mat, taper, pull, bulge, wobble, THREE, type V3 } from '../../render/sculpt';
import { pirarucuAnims } from '../../anims/mounts';
import type { ModelDef } from '../../render/types';

const C = {
  back: 0x4c5a48,
  side: 0x7a8466,
  belly: 0xc9c2a2,
  head: 0x45503f,
  headPlate: 0x5a6450,
  red: 0xc8402a,
  redDark: 0x7a1e14,
  scaleOlive: 0x6a7656,
  scaleEdge: 0x2e3428,
  fin: 0x3a3a30,
  mouth: 0x7a2a28,
  lip: 0x2a2a22,
  leaf: 0x3a8a3a,
  vine: 0x6a5a2a,
};

/** Achata a parte de cima (y > y0) — cabeça "chata" do pirarucu. */
const flatTop = (y0: number, k: number) => (p: THREE.Vector3) => { if (p.y > y0) p.y = y0 + (p.y - y0) * k; };

/**
 * Escama grande assentada sobre um elipsoide de semi-eixos `abc` centrado em `c`,
 * no ponto de coordenadas normalizadas (u = x/a, v = y/b) do lado +Z (o lado da câmera).
 */
function scaleAt(c: V3, abc: V3, u: number, v: number, size: number, m: THREE.Material, edge?: THREE.Material) {
  const [a, b, cz] = abc;
  const w = Math.max(0.02, 1 - u * u - v * v);
  const p = new THREE.Vector3(c[0] + u * a, c[1] + v * b, c[2] + Math.sqrt(w) * cz);
  const n = new THREE.Vector3(u / a, v / b, Math.sqrt(w) / cz).normalize();
  const g = new THREE.Group();
  g.position.copy(p).addScaledVector(n, -size * 0.02);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  // escama arredondada, levemente bombeada; a borda escura fica atrás e aparece no contorno
  if (edge) g.add(blob([size * 1.1, size * 0.98, size * 0.07], edge, { pos: [-size * 0.08, 0, -0.006], seg: 16 }));
  g.add(blob([size, size * 0.88, size * 0.1], m, { seg: 16, deform: [pull([-size, 0, 0], size * 0.8, [0, 0, size * 0.05])] }));
  return g;
}

function build(_variant: string) {
  const r = new Rig('root');
  const backM = mat('scale', C.back, { repeat: 3 });
  const sideM = mat('scale', C.side, { repeat: 3 });
  const bellyM = mat('skin', C.belly, { rough: 0.5 });
  const headM = mat('skin', C.head, { rough: 0.5 });
  const plateM = mat('stone', C.headPlate, { rough: 0.6, repeat: 2 });
  const redM = mat('scale', C.red, { repeat: 2 });
  const redDarkM = mat('skin', C.redDark, { rough: 0.5 });
  const oliveM = mat('scale', C.scaleOlive, { repeat: 1 });
  const edgeM = mat('skin', C.scaleEdge, { rough: 0.6 });
  const finM = mat('skin', C.fin, { rough: 0.5 });
  const finRedM = mat('skin', C.red, { rough: 0.5 });
  const mouthM = mat('skin', C.mouth, { rough: 0.35 });
  const lipM = mat('skin', C.lip, { rough: 0.4 });
  const leafM = mat('leaf', C.leaf);
  const vineM = mat('bark', C.vine, { repeat: 3 });

  /* ---------- esqueleto ---------- */
  r.bone('body', 'root', [0, 0.42, 0]);
  r.bone('head', 'body', [0.42, 0.0, 0]);
  r.bone('jaw', 'head', [0.26, -0.08, 0], [0, 0, 6]);
  r.bone('tail1', 'body', [-0.5, 0.02, 0]);
  r.bone('tail2', 'tail1', [-0.4, 0.0, 0]);
  r.bone('tailFin', 'tail2', [-0.3, 0.0, 0]);
  r.bone('dorsal', 'tail1', [-0.02, 0.15, 0]);
  r.bone('anal', 'tail1', [-0.02, -0.13, 0]);
  r.bone('pecR', 'body', [0.36, -0.12, 0.16], [0, 0, -20]);
  r.bone('pecL', 'body', [0.36, -0.12, -0.16], [0, 0, -20]);
  r.anchor('sela', 'body', [0.06, 0.3, 0]);

  /* ---------- corpo ---------- */
  const bodyABC: V3 = [0.56, 0.27, 0.2];
  r.add('body',
    blob(bodyABC, sideM, { pos: [-0.05, 0, 0], deform: [taper('x', -0.56, 0.56, 0.78, 1.0), wobble(0.004)] }),
    // dorso escuro e barriga clara
    blob([0.52, 0.16, 0.17], backM, { pos: [-0.05, 0.12, 0], deform: [taper('x', -0.52, 0.52, 0.75, 1.0)] }),
    blob([0.48, 0.12, 0.165], bellyM, { pos: [-0.02, -0.14, 0], deform: [taper('x', -0.48, 0.48, 0.75, 1.0)] }),
    // nadadeiras pélvicas
    slab([[0, 0], [-0.08, -0.03], [-0.14, -0.08], [-0.06, -0.06]], 0.012, finM, { pos: [-0.05, -0.22, 0.09], rot: [-20, 0, 0] }),
  );
  // escamas: oliva na frente, avermelhando para trás
  const rows = [0.45, 0.1, -0.25];
  [0.55, 0.3, 0.05, -0.2, -0.45, -0.68].forEach((u, i) => {
    rows.forEach((v, j) => {
      const reddish = i >= 4 && j > 0;
      r.add('body', scaleAt([-0.05, 0, 0], [0.56 * (0.92 - i * 0.02), 0.27, 0.2], u, v + (i % 2) * 0.12, 0.075, reddish ? redM : oliveM, edgeM));
    });
  });
  // sela: almofada de folha + cipó trançado
  r.add('body',
    slab([[-0.2, 0], [-0.1, -0.06], [0.12, -0.07], [0.24, 0], [0.12, 0.07], [-0.1, 0.06]], 0.025, leafM, { pos: [0.05, 0.255, 0], rot: [90, 0, 0], deform: [bulge([0, 0, 0], 0.25, 0.0)] }),
    blob([0.15, 0.04, 0.12], mat('cloth', 0xc8a050, { repeat: 4 }), { pos: [0.05, 0.285, 0] }),
    ring(0.205, 0.018, vineM, { pos: [0.06, 0.0, 0], rot: [0, 90, 0], scale: [1, 1.36, 1] }),
    tube([[0.06, 0.27, 0.04], [0.1, 0.29, 0.13], [0.06, 0.24, 0.19]], 0.012, vineM),
  );

  /* ---------- cabeça achatada, boca larga ---------- */
  const headDef = [flatTop(0.04, 0.6), pull([0.3, -0.04, 0], 0.2, [0.05, -0.02, 0]), taper('x', -0.3, 0.35, 1.0, 0.62)];
  r.add('head',
    blob([0.34, 0.24, 0.2], headM, { pos: [0.12, 0, 0], deform: headDef }),
    // placa óssea no topo e opérculo (tampa da guelra)
    blob([0.26, 0.06, 0.15], plateM, { pos: [0.12, 0.13, 0], deform: [taper('x', -0.26, 0.26, 1, 0.55), wobble(0.004, 20)] }),
    blob([0.12, 0.15, 0.04], plateM, { pos: [-0.03, -0.01, 0.165], rot: [0, 18, 0], deform: [pull([-0.1, 0, 0], 0.1, [-0.02, 0, 0])] }),
    tube([[0.04, 0.12, 0.15], [0.07, 0.0, 0.18], [0.04, -0.13, 0.15]], 0.01, redDarkM),
    // lábio superior largo
    tube([[0.42, -0.03, 0.0], [0.38, -0.05, 0.1], [0.27, -0.08, 0.15], [0.16, -0.09, 0.15]], 0.016, lipM),
    tube([[0.42, -0.03, 0.0], [0.38, -0.05, -0.1], [0.27, -0.08, -0.15], [0.16, -0.09, -0.15]], 0.016, lipM),
    // interior da boca (aparece quando a mandíbula abre)
    blob([0.17, 0.05, 0.12], mouthM, { pos: [0.27, -0.08, 0] }),
    blob([0.06, 0.02, 0.05], mat('skin', 0xd06a6a, { rough: 0.3 }), { pos: [0.24, -0.1, 0] }),
    // narinas
    blob([0.012, 0.008, 0.01], lipM, { pos: [0.43, 0.02, 0.05] }),
  );
  r.add('jaw',
    blob([0.17, 0.05, 0.14], headM, { pos: [0.02, -0.0, 0], deform: [pull([0.16, 0, 0], 0.1, [0.03, 0.025, 0]), taper('x', -0.17, 0.17, 1.05, 0.7)] }),
    blob([0.15, 0.03, 0.12], bellyM, { pos: [0.0, -0.025, 0], deform: [taper('x', -0.15, 0.15, 1.0, 0.7)] }),
    tube([[0.18, 0.03, 0.0], [0.14, 0.03, 0.1], [-0.04, 0.02, 0.135]], 0.012, lipM),
  );
  const eR = eye({ r: 0.06, iris: 0xe0a020, irisScale: 0.66, look: [0.6, 0.2], lid: 0.2, lidColor: C.head });
  eR.position.set(0.28, 0.035, 0.125); eR.rotation.y = 0.55;
  const eL = eye({ r: 0.06, iris: 0xe0a020, irisScale: 0.66, look: [0.6, 0.2], lid: 0.2, lidColor: C.head });
  eL.position.set(0.28, 0.035, -0.125); eL.rotation.y = Math.PI - 0.55;
  r.add('head', eR, eL,
    // arco sobre o olho (expressão de "peixe grandão")
    blob([0.06, 0.018, 0.03], plateM, { pos: [0.28, 0.09, 0.12], rot: [0, 30, -6] }),
  );
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;

  /* ---------- cauda com escamas vermelhas ---------- */
  const t1: V3 = [0.3, 0.21, 0.15];
  r.add('tail1', blob(t1, sideM, { pos: [-0.17, 0, 0], deform: [taper('x', -0.3, 0.3, 0.72, 1.0)] }));
  [0.6, 0.15, -0.3, -0.7].forEach((u, i) => [0.45, 0.0, -0.4].forEach((v, j) => {
    r.add('tail1', scaleAt([-0.17, 0, 0], [0.3 * (0.95 - i * 0.04), 0.21, 0.15], u, v + (i % 2) * 0.15 - 0.05, 0.068, i === 0 && j === 0 ? oliveM : redM, redDarkM));
  }));
  r.add('tail2', blob([0.22, 0.15, 0.1], redM, { pos: [-0.13, 0, 0], deform: [taper('x', -0.22, 0.22, 0.75, 1.0)] }));
  [0.45, -0.1, -0.6].forEach((u, i) => [0.35, -0.3].forEach((v) => {
    r.add('tail2', scaleAt([-0.13, 0, 0], [0.22 * (0.95 - i * 0.05), 0.15 * (1 - i * 0.08), 0.1], u, v + (i % 2) * 0.15, 0.055, redM, redDarkM));
  }));
  // nadadeira caudal arredondada em leque, com raios
  r.add('tailFin',
    slab([[0.02, 0.07], [-0.12, 0.16], [-0.3, 0.17], [-0.4, 0.06], [-0.4, -0.06], [-0.3, -0.16], [-0.12, -0.15], [0.02, -0.06]], 0.025, finRedM),
    slab([[0.0, 0.05], [-0.12, 0.12], [-0.26, 0.12], [-0.32, 0.04], [-0.32, -0.04], [-0.26, -0.11], [-0.12, -0.11], [0.0, -0.04]], 0.035, finM),
    ...[-0.1, -0.05, 0, 0.05, 0.1].map((y) => tube([[-0.02, y * 0.5, 0.02], [-0.18, y * 1.2, 0.024], [-0.34, y * 1.4, 0.016]], 0.006, redDarkM, { seg: 10, radial: 6 })),
    blob([0.06, 0.08, 0.06], redM, { pos: [0.01, 0, 0] }),
  );
  // dorsal e anal: longas, baixas e recuadas
  r.add('dorsal',
    slab([[0.12, 0], [0.0, 0.09], [-0.18, 0.16], [-0.38, 0.12], [-0.42, 0.0]], 0.022, finRedM),
    slab([[0.1, 0], [0.0, 0.07], [-0.18, 0.12], [-0.34, 0.08], [-0.36, 0.0]], 0.03, finM),
  );
  r.add('anal',
    slab([[0.12, 0], [0.0, -0.08], [-0.18, -0.14], [-0.38, -0.1], [-0.42, 0.0]], 0.022, finRedM),
    slab([[0.1, 0], [0.0, -0.06], [-0.18, -0.1], [-0.34, -0.06], [-0.36, 0.0]], 0.03, finM),
  );
  for (const s of ['R', 'L'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`pec${s}`,
      slab([[0, 0.02], [-0.1, 0.03], [-0.2, -0.02], [-0.22, -0.06], [-0.1, -0.05], [0, -0.02]], 0.014, finM, { rot: [zs * 30, 0, 0] }),
      tube([[-0.01, 0.0, 0.0], [-0.1, 0.0, 0.005 * zs], [-0.19, -0.035, 0.005 * zs]], 0.005, finRedM, { rot: [zs * 30, 0, 0], seg: 8, radial: 6 }),
    );
  }
  return r;
}

export const pirarucu: ModelDef = {
  id: 'pirarucu',
  kind: 'mount',
  build,
  anims: pirarucuAnims(),
  cell: [384, 224],
  pivot: [200, 196],
  height: 224 / 104,
  presets: ['recife', 'neutro'],
};
