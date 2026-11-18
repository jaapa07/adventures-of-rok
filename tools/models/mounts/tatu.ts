/**
 * TATU-CANASTRA — montaria das cavernas (~1.6 u de comprimento com a cauda).
 * Casco segmentado: escudo dianteiro e traseiro (cada um num osso, para fechar em bola)
 * e cintas móveis no meio, com fileiras de placas e a faixa clara na borda inferior.
 * Cabeça com capacete de placas, focinho cônico comprido, orelhinhas, olhos pequenos
 * e espertos; patas curtas e grossas com garras enormes de cavar; cauda anelada.
 * Sela: pelego de lã preso ao casco por correias de couro.
 */
import { Rig, blob, limb, lathe, tube, slab, spike, eye, mat, taper, pull, wobble, flattenBelow, THREE, D2R, type V3 } from '../../render/sculpt';
import { tatuAnims } from '../../anims/mounts';
import type { ModelDef } from '../../render/types';

const C = {
  shell: 0x5a4a3c,
  shellDark: 0x4a3c30,
  band: 0x7a6650,
  plate: 0x6e5c4a,
  rim: 0xc8b488,
  skin: 0xc8a888,
  skinDark: 0x9a7a62,
  snout: 0xb8927a,
  nose: 0x3a2622,
  claw: 0xe8dcc0,
  saddle: 0xe8dcc8,
  strap: 0x6a3a1e,
  buckle: 0xd9b24a,
};

const vcCache = new Map<THREE.Material, THREE.Material>();
/** Clone dupla-face com cor por vértice (os sulcos entre os escudos escurecem o casco). */
function vc(m: THREE.Material) {
  const hit = vcCache.get(m);
  if (hit) return hit;
  const c = m.clone();
  c.side = THREE.DoubleSide;
  c.vertexColors = true;
  c.onBeforeCompile = m.onBeforeCompile;
  c.customProgramCacheKey = m.customProgramCacheKey;
  vcCache.set(m, c);
  return c;
}

/** Relevo de um ponto do casco: [altura sobre a superfície, tom 0..1 da cor]. */
type Relief = (u: number, v: number) => [number, number];
const smooth = (a: number, b: number, x: number) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/**
 * Escudos em fileiras desencontradas (leitura hexagonal): `su` fileiras ao longo de u, `sv` escudos ao longo de v.
 * Cada escudo é uma almofada de topo abaulado separada das vizinhas por um sulco escuro.
 */
function scutes(su: number, sv: number, h: number, lift: (u: number) => number = () => 0): Relief {
  return (u, v) => {
    const cu = u * su, row = Math.min(Math.floor(cu), su - 1);
    const fu = cu - row;
    const cv = v * sv + (row % 2) * 0.5, col = Math.floor(cv);
    const fv = cv - col;
    const a = Math.abs(2 * fu - 1), b = Math.abs(2 * fv - 1);
    const d = (a ** 4 + b ** 4) ** 0.25;
    const g = smooth(0.6, 0.96, d);
    const tone = (row * 3 + col * 5) % 4 === 0 ? 0.9 : (row + col) % 3 === 0 ? 1.08 : 1;
    return [h * (1 - g) * (1 - 0.25 * d * d) + lift(u), (1 - 0.55 * g) * tone];
  };
}

/** Malha paramétrica (u, v em 0..1) com relevo ao longo da normal e cor por vértice. */
function patch(nu: number, nv: number, surf: (u: number, v: number, p: THREE.Vector3, n: THREE.Vector3) => void, relief: Relief, m: THREE.Material) {
  const pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = [];
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
    const u = i / nu, v = j / nv;
    surf(u, v, p, n);
    const [h, tone] = relief(u, v);
    p.addScaledVector(n, h);
    pos.push(p.x, p.y, p.z); col.push(tone, tone, tone); uv.push(u, v);
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, vc(m));
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

/* Casco aberto (andando): uma única cúpula superelíptica contínua, fatiada ao longo de X. */
const DOME = { cx: -0.02, len: 0.52, ry: 0.335, rz: 0.3 };
/** Fatia da cúpula entre x0..x1 (coordenadas do corpo) e ângulos a0..a1 (0° = flanco +Z, 90° = lombo, 180° = flanco -Z). */
function domeSlice(x0: number, x1: number, a0: number, a1: number, relief: Relief, m: THREE.Material, off: V3 = [0, 0, 0]) {
  const span = Math.abs(a1 - a0), nu = Math.max(10, Math.round(Math.abs(x1 - x0) * 170)), nv = Math.max(8, Math.round(span * 0.75));
  return patch(nu, nv, (u, v, p, n) => {
    const x = x0 + (x1 - x0) * u, a = (a0 + (a1 - a0) * v) * D2R;
    const X = THREE.MathUtils.clamp((x - DOME.cx) / DOME.len, -0.999, 0.999);
    const sec = (1 - Math.abs(X) ** 2.4) ** 0.5;
    p.set(x - off[0], DOME.ry * sec * Math.sin(a) - off[1], DOME.rz * sec * Math.cos(a) - off[2]);
    n.set((X * Math.abs(X) ** 0.4) / DOME.len * 0.6, (sec * Math.sin(a)) / DOME.ry, (sec * Math.cos(a)) / DOME.rz).normalize();
  }, relief, m);
}

/* Casco fechado (bola): o dorso enrola em torno do eixo Z; cada peça é um gomo entre dois ângulos. */
const BALL_R = 0.35;
/** Gomo da bola entre th0..th1 (graus em torno de Z, 0° = +X, 90° = topo) e latitude ±lat. */
function ballSlice(th0: number, th1: number, lat0: number, lat1: number, relief: Relief, m: THREE.Material, rad = BALL_R) {
  const nu = Math.max(8, Math.round(Math.abs(th1 - th0) * 0.7)), nv = Math.max(6, Math.round(Math.abs(lat1 - lat0) * 0.7));
  return patch(nu, nv, (u, v, p, n) => {
    const th = (th0 + (th1 - th0) * u) * D2R, la = (lat0 + (lat1 - lat0) * v) * D2R;
    n.set(Math.cos(th) * Math.cos(la), Math.sin(th) * Math.cos(la), Math.sin(la));
    p.copy(n).multiplyScalar(rad);
  }, relief, m);
}

function build(_variant: string) {
  const r = new Rig('root');
  // casco esculpido (o relevo dos escudos vem da geometria, por isso o material é liso)
  const shellM = mat('paint', C.shell, { rough: 0.5, rim: 0.6 });
  const bandM = mat('paint', C.band, { rough: 0.46, rim: 0.6 });
  const shellDarkM = mat('shell', C.shellDark, { repeat: 2 });
  const plateM = mat('shell', C.plate, { repeat: 1, rough: 0.5 });
  const rimM = mat('paint', C.rim, { rough: 0.5, rim: 0.6 });
  const skinM = mat('skin', C.skin, { rough: 0.6 });
  const skinDarkM = mat('skin', C.skinDark, { rough: 0.6 });
  const snoutM = mat('skin', C.snout, { rough: 0.5 });
  const noseM = mat('skin', C.nose, { rough: 0.25 });
  const clawM = mat('shell', C.claw, { rough: 0.35, repeat: 3 });
  const saddleM = mat('fur', C.saddle, { repeat: 3 });
  const strapM = mat('leather', C.strap);
  const buckleM = mat('metal', C.buckle, { metal: 0.9, rough: 0.3 });

  /* ---------- esqueleto ---------- */
  // 'roll' é o centro do giro quando o tatu vira bola; 'body' é o corpo em si
  r.bone('roll', 'root', [0, 0.35, 0]);
  r.bone('body', 'roll', [0, 0, 0]);
  // 'casco' = miolo, barriga e cintas do casco aberto; 'ball' = casco fechado em bola (só aparece em `rolar`)
  r.bone('casco', 'body', [0, 0, 0]);
  r.bone('ball', 'body', [0, 0, 0]);
  r.bones.ball.scale.setScalar(0.001);
  r.bone('shellF', 'body', [0.2, 0.0, 0]);
  r.bone('shellR', 'body', [-0.2, 0.0, 0]);
  r.bone('head', 'shellF', [0.3, -0.06, 0], [0, 0, -8]);
  r.bone('snout', 'head', [0.12, -0.02, 0], [0, 0, -10]);
  r.bone('earR', 'head', [-0.04, 0.08, 0.07]);
  r.bone('earL', 'head', [-0.04, 0.08, -0.07]);
  for (const [s, z] of [['R', 0.16], ['L', -0.16]] as const) {
    r.bone(`legF${s}_up`, 'shellF', [0.1, -0.1, z]);
    r.bone(`legF${s}_lo`, `legF${s}_up`, [0, -0.1, 0]);
    r.bone(`legB${s}_up`, 'shellR', [-0.12, -0.1, z]);
    r.bone(`legB${s}_lo`, `legB${s}_up`, [0, -0.1, 0]);
  }
  r.bone('tail1', 'shellR', [-0.33, -0.08, 0], [0, 0, 26]);
  r.bone('tail2', 'tail1', [-0.22, 0, 0], [0, 0, 6]);
  r.anchor('sela', 'body', [0.0, 0.36, 0]);

  /* ---------- casco aberto: escudo escapular, cintas móveis, escudo pélvico ---------- */
  const A0 = -22, A1 = 202; // a cúpula desce um pouco abaixo do "equador" dos flancos
  const MID_F = 0.14, MID_B = -0.16, BAND_W = 0.05;
  // miolo escuro (o que aparece se uma peça abrir) e barriga clara
  r.add('casco',
    blob([0.47, 0.3, 0.265], skinDarkM, { pos: [DOME.cx, 0, 0], deform: [flattenBelow(-0.13, 0.85)] }),
    blob([0.4, 0.12, 0.22], skinDarkM, { pos: [0, -0.16, 0] }),
  );
  // seis cintas móveis: placas contínuas de flanco a flanco, cada uma encaixada sob a da frente (em telha)
  for (let i = 0; i < 6; i++) {
    const xf = MID_F - i * BAND_W, xb = xf - BAND_W;
    // u = 0 na borda de trás (por cima da cinta seguinte), u = 1 na frente (por baixo da anterior)
    const tile = (u: number) => 0.02 - u * 0.022;
    r.add('casco', domeSlice(xb, xf + 0.014, A0 + 9, A1 - 9, scutes(1, 26, 0.007, tile), bandM));
    r.add('casco', domeSlice(xb, xf + 0.014, A0, A0 + 9, scutes(1, 1, 0.004, (u) => tile(u) + 0.003), rimM));
    r.add('casco', domeSlice(xb, xf + 0.014, A1 - 9, A1, scutes(1, 1, 0.004, (u) => tile(u) + 0.003), rimM));
  }
  // escudos da frente e de trás: mosaico de escudos hexagonais; borda inferior clara
  const shieldLift = () => 0.016;
  r.add('shellF',
    domeSlice(MID_F - 0.012, DOME.cx + DOME.len, A0 + 9, A1 - 9, scutes(7, 21, 0.013, shieldLift), shellM, [0.2, 0, 0]),
    domeSlice(MID_F - 0.012, DOME.cx + DOME.len, A0, A0 + 9, scutes(7, 1, 0.006, () => 0.019), rimM, [0.2, 0, 0]),
    domeSlice(MID_F - 0.012, DOME.cx + DOME.len, A1 - 9, A1, scutes(7, 1, 0.006, () => 0.019), rimM, [0.2, 0, 0]),
  );
  r.add('shellR',
    domeSlice(DOME.cx - DOME.len, MID_B + 0.012, A0 + 9, A1 - 9, scutes(7, 21, 0.013, shieldLift), shellM, [-0.2, 0, 0]),
    domeSlice(DOME.cx - DOME.len, MID_B + 0.012, A0, A0 + 9, scutes(7, 1, 0.006, () => 0.019), rimM, [-0.2, 0, 0]),
    domeSlice(DOME.cx - DOME.len, MID_B + 0.012, A1 - 9, A1, scutes(7, 1, 0.006, () => 0.019), rimM, [-0.2, 0, 0]),
  );

  /* ---------- casco fechado em bola (aparece só em `rolar`): nem barriga nem patas à vista ---------- */
  const LAT = 84;
  r.add('ball',
    // forro: fecha qualquer fresta entre as peças
    blob([BALL_R * 0.972, BALL_R * 0.972, BALL_R * 0.972], shellDarkM, { seg: 40 }),
    // escudo escapular (frente) e pélvico (trás)
    ballSlice(-52, 56, -LAT, LAT, scutes(9, 13, 0.013, () => 0.012), shellM),
    ballSlice(124, 232, -LAT, LAT, scutes(9, 13, 0.013, () => 0.012), shellM),
    // capacete da cabeça e placa da cauda fecham o vão entre os dois escudos
    ballSlice(266, 310, -LAT, LAT, scutes(4, 9, 0.012, () => 0.02), plateM),
    ballSlice(230, 268, -LAT, LAT, scutes(5, 5, 0.01, (u) => 0.022 - u * 0.012), bandM),
    // friso claro (margem do casco) onde o capacete encosta nos escudos
    ballSlice(308, 313, -LAT + 20, LAT - 20, scutes(1, 9, 0.005, () => 0.024), rimM),
    ballSlice(227, 232, -LAT + 20, LAT - 20, scutes(1, 9, 0.005, () => 0.024), rimM),
    // botão de casco em cada lado, onde todas as peças se encontram
    blob([0.06, 0.06, 0.022], shellM, { pos: [0, 0, BALL_R + 0.004], seg: 16 }),
    blob([0.06, 0.06, 0.022], shellM, { pos: [0, 0, -BALL_R - 0.004], seg: 16 }),
  );
  // seis cintas no alto (sob o pelego), em telha como no casco aberto
  for (let i = 0; i < 6; i++) {
    const t0 = 54 + i * 12;
    r.add('ball', ballSlice(t0 - 3, t0 + 12, -LAT, LAT, scutes(1, 20, 0.007, (u) => -0.004 + u * 0.02), bandM));
  }

  /* ---------- sela: pelego + correias ---------- */
  r.add('body',
    blob([0.2, 0.05, 0.2], saddleM, { pos: [0, 0.335, 0], deform: [pull([0, 0, 0.2], 0.12, [0, -0.06, 0]), pull([0, 0, -0.2], 0.12, [0, -0.06, 0]), wobble(0.01, 20)] }),
    tube([[0.08, 0.33, 0.14], [0.08, 0.22, 0.27], [0.08, 0.0, 0.31], [0.08, -0.14, 0.28]], 0.013, strapM),
    tube([[-0.08, 0.33, 0.14], [-0.08, 0.22, 0.27], [-0.08, 0.0, 0.31], [-0.08, -0.14, 0.28]], 0.013, strapM),
    slab([[-0.02, -0.02], [0.02, -0.02], [0.02, 0.02], [-0.02, 0.02]], 0.01, buckleM, { pos: [0.08, 0.12, 0.3], rot: [0, 0, 0], smooth: false, bevel: 0.004 }),
  );

  /* ---------- cabeça: capacete de placas e focinho cônico ---------- */
  r.add('head',
    blob([0.13, 0.1, 0.1], skinM, { pos: [0.0, 0.0, 0], deform: [pull([0.1, -0.02, 0], 0.1, [0.03, -0.01, 0])] }),
    blob([0.12, 0.05, 0.085], plateM, { pos: [0.0, 0.07, 0], deform: [taper('x', -0.12, 0.12, 1.0, 0.6), wobble(0.004, 30)] }),
    blob([0.07, 0.06, 0.08], skinDarkM, { pos: [-0.04, -0.05, 0] }),
  );
  r.add('snout',
    lathe([[0.065, -0.02], [0.062, 0.05], [0.05, 0.12], [0.036, 0.19], [0.026, 0.23], [0.001, 0.235]], snoutM, { rot: [0, 0, -90], scale: [1, 1, 0.85] }),
    blob([0.022, 0.02, 0.026], noseM, { pos: [0.235, 0.0, 0] }),
    // dobrinhas e sorriso de canto
    tube([[0.06, -0.04, 0.05], [0.12, -0.04, 0.035], [0.15, -0.03, 0.03]], 0.005, skinDarkM),
    lathe([[0.056, -0.01], [0.06, 0], [0.056, 0.01]], skinDarkM, { rot: [0, 0, -90], pos: [0.08, 0, 0], scale: [1, 1, 0.85] }),
  );
  const eR = eye({ r: 0.028, iris: 0x2a1a10, irisScale: 0.7, look: [0.8, 0.0], lid: 0.3, lidColor: C.skinDark });
  eR.position.set(0.07, 0.03, 0.075); eR.rotation.y = 0.6;
  const eL = eye({ r: 0.028, iris: 0x2a1a10, irisScale: 0.7, look: [0.8, 0.0], lid: 0.3, lidColor: C.skinDark });
  eL.position.set(0.07, 0.03, -0.075); eL.rotation.y = Math.PI - 0.6;
  r.add('head', eR, eL);
  r.bones.lidR = eR.getObjectByName('lid')!;
  r.bones.lidL = eL.getObjectByName('lid')!;
  for (const s of ['L', 'R'] as const) {
    const zs = s === 'R' ? 1 : -1;
    r.add(`ear${s}`,
      slab([[0, 0], [0.04, 0.02], [0.03, 0.07], [-0.01, 0.06], [-0.03, 0.02]], 0.014, skinDarkM, { rot: [zs * 25, 0, 15] }),
      slab([[0.0, 0.012], [0.025, 0.025], [0.018, 0.055], [-0.005, 0.045]], 0.006, mat('skin', 0xd89a8a), { pos: [0, 0, zs * 0.008], rot: [zs * 25, 0, 15] }),
    );
  }

  /* ---------- patas curtas e garras gigantes ---------- */
  for (const s of ['R', 'L'] as const) {
    for (const fb of ['F', 'B'] as const) {
      const front = fb === 'F';
      r.add(`leg${fb}${s}_up`, limb(0.1, front ? 0.09 : 0.095, 0.075, skinM, { deform: [wobble(0.004, 20)] }));
      const paw: THREE.Object3D[] = [
        limb(0.08, 0.075, 0.065, skinDarkM),
        blob([0.08, 0.04, 0.07], skinDarkM, { pos: [0.03, -0.1, 0] }),
      ];
      // dedos com garras: a do meio da mão é enorme (marca registrada do tatu-canastra)
      const claws: [number, number, number][] = front
        ? [[0.034, 0.22, 0.026], [0.0, 0.3, 0.034], [-0.034, 0.16, 0.022]]
        : [[0.03, 0.09, 0.018], [0.0, 0.11, 0.02], [-0.03, 0.09, 0.018]];
      for (const [z, len, rad] of claws) paw.push(spike(len, rad, clawM, { pos: [0.075, -0.11, z], rot: [0, 0, -100], curve: front ? 0.35 : 0.25 }));
      r.add(`leg${fb}${s}_lo`, ...paw);
    }
  }

  /* ---------- cauda anelada ---------- */
  r.add('tail1',
    tube([[0, 0, 0], [-0.11, 0.0, 0], [-0.23, 0, 0]] as V3[], (t) => 0.07 - t * 0.02, shellDarkM, { seg: 16 }),
    ...[-0.04, -0.1, -0.16].map((x) => lathe([[0.066, -0.015], [0.072, 0], [0.066, 0.015]], plateM, { pos: [x, 0, 0], rot: [0, 0, 90] })),
  );
  r.add('tail2',
    tube([[0, 0, 0], [-0.11, 0.0, 0], [-0.22, -0.01, 0]] as V3[], (t) => 0.05 - t * 0.04, shellDarkM, { seg: 16 }),
    ...[-0.04, -0.1].map((x, i) => lathe([[0.046 - i * 0.008, -0.012], [0.052 - i * 0.008, 0], [0.046 - i * 0.008, 0.012]], plateM, { pos: [x, 0, 0], rot: [0, 0, 90] })),
  );
  return r;
}

export const tatu: ModelDef = {
  id: 'tatu',
  kind: 'mount',
  build,
  anims: tatuAnims(),
  cell: [320, 224],
  pivot: [160, 196],
  height: 224 / 104,
  presets: ['caverna', 'selva', 'neutro'],
};
