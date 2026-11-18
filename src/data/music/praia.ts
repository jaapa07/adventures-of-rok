/** Praia dos Caranguejos — alegre, em Sol maior, com violão em batida de baião e percussão leve. */
import type { Faixa } from './types';

const PRAIA_A = `
  b4:3 d5:3 g5:2 r:2 g5:2 a5:2 b5:2 |
  c6:3 b5:3 a5:2 r:2 g5:2 e5:2 c5:2 |
  d5:3 f#5:3 a5:2 r:2 a5:2 b5:2 c6:2 |
  b5:6 g5:2 d5:8 |
  e5:3 g5:3 b5:2 r:2 b5:2 c6:2 d6:2 |
  e6:3 d6:3 c6:2 r:2 g5:2 a5:2 c6:2 |
  c#6:3 a5:3 e5:2 g5:4 e5:4 |
  f#5:4 a5:4 c6:4 d6:4`;
const ACORDES_A = 'G | C | D | G | Em | C | A7 | D7';

export const praia: Faixa = {
  id: 'praia', nome: 'Baile dos Caranguejos', bpm: 116, tom: 'Sol maior', swing: 0.12, loop: true, reverb: 'copa', envio: 0.25,
  inst: { melodia: 'violao', contra: 'flauta', baixo: 'baixo', harmonia: 'violao' },
  estilo: { tipo: 'batida', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.5, baixo: 0.8, harmonia: 0.45, bateria: 0.7 },
  bateria: {
    P1: { bumbo: 'X.....x.X.......', pandeiro: 'x.xxx.xxx.xxx.xx', aro: '....x.......x...', tamborim: '..x...x...x.x...' },
    P2: { bumbo: 'X.....x.X.....x.', pandeiro: 'x.xxx.xxx.xxx.xx', palmas: '....x.......x...', agogoA: 'x.....x.....x...', agogoB: '...x.....x......' },
    PF: { pandeiro: 'x.xxx.xxx.xxXXXX', bumbo: 'X.....x.X.......', tom: '............x.xx' },
  },
  secoes: {
    A: {
      bateria: 'P1 P1 P1 P2 P1 P1 P1 PF', acordes: ACORDES_A, melodia: PRAIA_A,
      contra: 'r:12 d6:4 | e6:8 r:8 | r:12 f#6:4 | g6:8 r:8 | r:12 b5:4 | c6:8 r:8 | r:8 a5:4 c#6:4 | d6:8 c6:8',
      baixo: `g1:6 d2:2 g1:4 d2:4 | c2:6 g1:2 c2:4 g1:4 | d2:6 a1:2 d2:4 a1:4 | g1:6 d2:2 g2:4 d2:4 |
              e2:6 b1:2 e2:4 b1:4 | c2:6 g1:2 c2:4 e2:4 | a1:6 e2:2 a1:4 c#2:4 | d2:6 a1:2 d2:4 c2:4`,
    },
    B: {
      bateria: 'P2', acordes: 'C | D | Bm | Em | Am | D | G | G7',
      melodia: `e5:2 g5:2 c6:4 b5:2 a5:2 g5:4 | f#5:2 a5:2 d6:4 c6:2 b5:2 a5:4 | b5:4 a5:2 f#5:2 d5:4 f#5:4 | e5:8 g5:4 b5:4 |
                c6:4 b5:2 a5:2 e5:4 a5:4 | f#5:2 g5:2 a5:2 b5:2 c6:4 a5:4 | g5:12 r:4 | d5:2 e5:2 f5:2 g5:2 b5:4 f5:4`,
      contra: 'g5:16 | a5:16 | f#5:16 | g5:16 | e5:16 | d5:16 | b5:8 d6:8 | f5:16',
      baixo: `c2:6 g1:2 c2:4 g1:4 | d2:6 a1:2 d2:4 a1:4 | b1:6 f#1:2 b1:4 f#1:4 | e2:6 b1:2 e2:4 g2:4 |
              a1:6 e2:2 a1:4 e2:4 | d2:6 a1:2 d2:4 f#2:4 | g1:6 d2:2 g1:4 b1:4 | g1:4 b1:4 d2:4 f2:4`,
    },
    A2: {
      bateria: 'P1 P2', acordes: ACORDES_A, melodia: PRAIA_A, inst: { melodia: 'marimba' },
      contra: 'd5:8 b4:8 | e5:8 c5:8 | f#5:8 d5:8 | g5:8 d5:8 | g5:8 e5:8 | g5:8 e5:8 | e5:8 c#5:8 | c5:8 a4:8',
      baixo: `g1:4 b1:4 d2:4 b1:4 | c2:4 e2:4 g2:4 e2:4 | d2:4 f#2:4 a2:4 f#2:4 | g1:4 d2:4 g2:4 f#2:4 |
              e2:4 g2:4 b2:4 g2:4 | c2:4 e2:4 g2:4 c3:4 | a1:4 c#2:4 e2:4 g2:4 | d2:4 f#2:4 a2:4 c3:4`,
    },
    C: {
      bateria: 'P2 P2 P2 P2 P2 P2 P2 PF', acordes: 'Em | Em | Am | Am | D | D | G | G', inst: { melodia: 'guitarra' },
      melodia: `e5:2 e5:2 g5:2 e5:2 b5:4 r:4 | a5:2 g5:2 e5:2 d5:2 e5:8 | a5:2 a5:2 c6:2 a5:2 e6:4 r:4 | d6:2 c6:2 a5:2 g5:2 a5:8 |
                f#5:2 f#5:2 a5:2 f#5:2 d6:4 r:4 | c6:2 b5:2 a5:2 f#5:2 d5:8 | g5:2 b5:2 d6:2 g6:2 f#6:2 d6:2 b5:2 a5:2 | g5:8 r:8`,
      contra: 'r:12 b5:2 a5:2 | r:8 g5:4 b5:4 | r:12 e6:2 d6:2 | r:8 c6:4 e6:4 | r:12 a5:2 g5:2 | r:8 f#5:4 a5:4 | b4:16 | d5:4 b4:4 g4:8',
      baixo: `e2:3 e2:3 b1:2 e2:8 | e2:3 e2:3 b1:2 g1:4 b1:4 | a1:3 a1:3 e2:2 a1:8 | a1:3 a1:3 e2:2 c2:4 e2:4 |
              d2:3 d2:3 a1:2 d2:8 | d2:3 d2:3 a1:2 f#1:4 a1:4 | g1:3 g1:3 d2:2 g1:8 | g1:3 g1:3 d2:2 g2:4 d2:4`,
    },
    D: {
      bateria: 'P1', acordes: 'C | Am | F | G | C | Am | Dm | G7', inst: { melodia: 'flauta', contra: 'marimba' },
      melodia: 'g5:4 e5:4 c5:4 e5:4 | a5:8 e5:8 | f5:4 a5:4 c6:4 a5:4 | g5:8 d5:8 | e5:4 g5:4 c6:4 e6:4 | d6:4 c6:4 a5:8 | f5:4 a5:4 d6:4 c6:4 | b5:8 g5:4 f5:4',
      contra: `c4:2 e4:2 g4:2 c5:2 e5:4 c5:4 | a3:2 c4:2 e4:2 a4:2 c5:4 a4:4 | f3:2 a3:2 c4:2 f4:2 a4:4 f4:4 | g3:2 b3:2 d4:2 g4:2 b4:4 g4:4 |
               c4:2 g4:2 c5:2 g4:2 e4:4 g4:4 | a3:2 e4:2 a4:2 e4:2 c4:4 e4:4 | d4:2 f4:2 a4:2 d5:2 f5:4 d5:4 | g3:2 b3:2 d4:2 f4:2 b4:4 g4:4`,
      baixo: 'c2:8 g1:8 | a1:8 e2:8 | f1:8 c2:8 | g1:8 d2:8 | c2:8 e2:8 | a1:8 c2:8 | d2:8 a1:8 | g1:8 b1:8',
    },
    E: {
      bateria: 'P2 P2 P2 P2 P1 P1 P1 PF', acordes: 'G | Em | C | D | G | Em | C D | G',
      melodia: `g5:2 a5:2 b5:2 d6:2 b5:4 g5:4 | e5:2 f#5:2 g5:2 b5:2 g5:4 e5:4 | c5:2 d5:2 e5:2 g5:2 c6:4 e6:4 | d6:4 c6:2 b5:2 a5:8 |
                b5:2 d6:2 g6:4 d6:4 b5:4 | g5:2 b5:2 e6:4 b5:4 g5:4 | e5:4 g5:4 f#5:4 a5:4 | g5:8 r:4 d5:4`,
      contra: 'd6:16 | b5:16 | g5:16 | f#5:16 | d6:8 b5:8 | e6:8 b5:8 | c6:8 a5:8 | b5:8 r:8',
      baixo: `g1:4 g1:2 d2:2 g1:4 d2:4 | e2:4 e2:2 b1:2 e2:4 b1:4 | c2:4 c2:2 g1:2 c2:4 g1:4 | d2:4 d2:2 a1:2 d2:4 f#2:4 |
              g1:4 b1:4 d2:4 g2:4 | e2:4 g2:4 b2:4 e2:4 | c2:4 e2:4 d2:4 f#2:4 | g1:4 d2:4 g1:8`,
    },
  },
  ordem: ['A', 'B', 'A2', 'C', 'D', 'E'],
};
