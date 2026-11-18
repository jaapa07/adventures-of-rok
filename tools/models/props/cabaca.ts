/**
 * CABAÇA ROLANTE e CABAÇA DE PEDRA.
 * Cabaça redonda de pescoço curto, pintada com faixa de triângulos, tampa de sabugo e alça de corda trançada.
 * A casca é feita de 6 gomos de torno (cada um num osso) para estourar em lascas na animação `quebrar`.
 * A versão de pedra é a mesma silhueta petrificada: rocha cinza, rachaduras, musgo e cristais de quartzo.
 */
import { Rig, blob, tube, slab, mat, type V2 } from '../../render/sculpt';
import type { ModelDef } from '../../render/types';
import { wedge, rope, breakKeys, still, lazyAnims, type Piece } from './kit';

const PROFILE: V2[] = [
  [0.001, 0], [0.1, 0.008], [0.19, 0.045], [0.25, 0.11], [0.275, 0.19], [0.272, 0.27], [0.245, 0.34], [0.19, 0.395],
  [0.12, 0.43], [0.085, 0.46], [0.075, 0.5], [0.078, 0.53], [0.06, 0.545], [0.001, 0.548],
];
const CY = 0.25; // centro de rolagem
const N = 6;

function build(stone: boolean) {
  const r = new Rig('root');
  const shell = stone ? mat('rock', 0x8b877e, { repeat: 1.2 }) : mat('gourd', 0xcf9b48);
  const shellDark = stone ? mat('rock', 0x5e5a54) : mat('gourd', 0x9a6a2c);
  const paint = stone ? mat('stone', 0x4a4844, { rough: 1 }) : mat('paint', 0x5a2412, { rough: 0.7 });
  const crystal = mat('crystal', 0xcfe8ff, { emissive: 0x6aa8ff, emissiveIntensity: 0.25 });
  const paint2 = stone ? mat('rock', 0x6a665e) : mat('paint', 0xb8401e, { rough: 0.6 });
  const pulp = stone ? mat('rock', 0x6a665e) : mat('skin', 0xd9c48e, { rough: 0.9 });
  const seed = stone ? mat('stone', 0x3e3c38) : mat('wood', 0x3a2414, { rough: 0.4 });
  const cork = stone ? mat('rock', 0x6e6a62) : mat('wood', 0x7a4a24);
  const cordM = stone ? mat('cloth', 0x6a6a52) : mat('cloth', 0xb89a5e, { repeat: 6 });
  const moss = mat('grass', 0x4e7a2a, { repeat: 3 });

  r.bone('body', 'root', [0, CY, 0]);
  r.bone('neck', 'body', [0, 0, 0]);
  const pieces: Piece[] = [];
  for (let i = 0; i < N; i++) {
    const phi0 = i * (360 / N) + (i % 2 ? 4 : -3);
    const len = 360 / N + (i % 2 ? -4 : 3) + (i === N - 1 ? 0 : 0);
    const b = `g${i}`;
    r.bone(b, 'body', [0, 0, 0]);
    const lower = PROFILE.filter(([, y]) => y <= 0.43);
    r.add(b, wedge(lower, shell, phi0, len, { pos: [0, -CY, 0], seg: 8 }));
    // faixa pintada (anel externo fino) e linhas de acabamento
    r.add(b,
      wedge([[0.274, 0.215], [0.279, 0.23], [0.279, 0.29], [0.272, 0.305]], paint, phi0, len, { pos: [0, -CY, 0], seg: 8 }),
      wedge([[0.262, 0.115], [0.268, 0.125], [0.266, 0.14], [0.258, 0.15]], paint, phi0, len, { pos: [0, -CY, 0], seg: 8 }),
    );
    // triângulos da faixa (dois por gomo), vermelho sobre a faixa escura
    for (const k of [0.25, 0.75]) {
      const a = (phi0 + len * k) * (Math.PI / 180);
      const rr = 0.281;
      r.add(b, slab([[-0.035, -0.03], [0.035, -0.03], [0, 0.03]], 0.006, paint2, { pos: [Math.sin(a) * rr, 0.26 - CY, Math.cos(a) * rr], rot: [0, a * 57.2958, k === 0.25 ? 0 : 180], bevel: 0.003, smooth: false }));
      // pontinhos abaixo da faixa
      r.add(b, blob([0.012, 0.012, 0.006], paint, { pos: [Math.sin(a) * 0.272, 0.18 - CY, Math.cos(a) * 0.272], rot: [0, a * 57.2958, 0], seg: 10 }));
    }
    // musgo na versão de pedra / mancha mais escura na natural
    if (stone && i % 2 === 0) {
      const a = (phi0 + len * 0.5) * (Math.PI / 180);
      r.add(b, blob([0.07, 0.035, 0.05], moss, { pos: [Math.sin(a) * 0.2, 0.39 - CY, Math.cos(a) * 0.2], rot: [0, a * 57.2958, 20], seg: 14 }));
    }
    // sementes que ficam escondidas dentro e voam junto do gomo
    const a = (phi0 + len * 0.5) * (Math.PI / 180);
    r.add(b,
      blob([0.035, 0.022, 0.018], seed, { pos: [Math.sin(a) * 0.12, 0.03, Math.cos(a) * 0.12], rot: [0, a * 57.2958, 30], seg: 10 }),
      blob([0.06, 0.05, 0.05], pulp, { pos: [Math.sin(a) * 0.17, -0.02, Math.cos(a) * 0.17], seg: 12 }),
    );
    const dx = Math.sin(a), dz = Math.cos(a);
    pieces.push({ bone: b, dir: [dx * 0.85 + (i % 3 - 1) * 0.1, -0.05, dz * 0.3], spin: [dz * 160, (i - 2.5) * 50, -dx * 200], up: 0.22 + (i % 3) * 0.08, fall: -CY + 0.04, shrink: 0.75, delay: (i % 3) * 0.02 });
  }
  // pescoço (peça própria) com tampa de sabugo e alça de corda
  const top = PROFILE.filter(([, y]) => y >= 0.395);
  r.add('neck',
    wedge(top, shell, 0, 360, { pos: [0, -CY, 0], seg: 24 }),
    wedge([[0.088, 0.455], [0.094, 0.47], [0.088, 0.485]], shellDark, 0, 360, { pos: [0, -CY, 0], seg: 24 }),
    // tampa: sabugo de milho entalhado
    blob([0.05, 0.06, 0.05], cork, { pos: [0, 0.56 - CY, 0], seg: 16 }),
    tube([[0, 0.6 - CY, 0], [0.02, 0.64 - CY, 0.01], [0.05, 0.655 - CY, 0]], 0.012, shellDark),
    // amarração no pescoço
    rope([[0.082, 0.495 - CY, 0], [0, 0.495 - CY, 0.082], [-0.082, 0.495 - CY, 0], [0, 0.495 - CY, -0.082], [0.082, 0.495 - CY, 0]], 0.014, cordM, { twists: 10 }),
    rope([[0.07, 0.49 - CY, 0.05], [0.13, 0.42 - CY, 0.13], [0.16, 0.36 - CY, 0.2]], 0.012, cordM, { twists: 4 }),
    rope([[0.06, 0.49 - CY, 0.06], [0.08, 0.42 - CY, 0.17], [0.1, 0.36 - CY, 0.24]], 0.012, cordM, { twists: 4 }),
    blob([0.022, 0.03, 0.022], cordM, { pos: [0.13, 0.35 - CY, 0.22], seg: 12 }),
  );
  if (stone) {
    // cristais brotando de uma rachadura no ombro
    r.add('g0',
      slab([[-0.02, 0], [0.02, 0], [0.012, 0.07], [0, 0.09], [-0.012, 0.07]], 0.02, crystal, { pos: [0.05, 0.35 - CY, 0.22], rot: [30, 10, -20], smooth: false }),
      slab([[-0.015, 0], [0.015, 0], [0.01, 0.05], [0, 0.065], [-0.01, 0.05]], 0.016, crystal, { pos: [0.1, 0.33 - CY, 0.22], rot: [30, 20, -50], smooth: false }),
    );
    // rachaduras escuras
    r.add('g1', tube([[0.2, 0.3 - CY, 0.15], [0.23, 0.22 - CY, 0.14], [0.25, 0.16 - CY, 0.1], [0.24, 0.08 - CY, 0.08]], 0.006, shellDark));
  }
  pieces.push({ bone: 'neck', dir: [0.05, 0.1, 0.05], spin: [40, 120, 260], up: 0.4, fall: -0.5, shrink: 0.8, delay: 0.02 });
  return { r, pieces };
}

function make(id: string, stone: boolean): ModelDef {
  return lazyAnims({
    id,
    kind: 'prop' as const,
    build: () => build(stone).r,
    cell: [192, 128] as [number, number],
    pivot: [96, 112] as [number, number],
    height: 128 / 104,
    presets: ['selva', 'caverna', 'recife', 'fabrica', 'bonus', 'neutro'] as ModelDef['presets'],
    camera: { pitch: -12 },
  }, () => {
    const { pieces } = build(stone);
    return {
      idle: still(),
      rolar: { frames: 12, loop: true, keys: { body: [{ t: 0, r: [0, 0, 0] }, { t: 1, r: [0, 0, -360], e: 'linear' }] } },
      quebrar: { frames: 10, loop: false, fps: 24, keys: breakKeys(pieces, { shake: 'body', pop: 0.12 }) },
    };
  });
}

export const cabaca = make('cabaca', false);
export const cabacaPedra = make('cabaca-pedra', true);
