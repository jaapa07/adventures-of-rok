/** Fábrica Javarda — industrial em Mi frígio: percussão de metal, bigorna, vapor e baixo distorcido. */
import type { Faixa } from './types';

const FAB_A_BAIXO = `
  e1:2 e1:2 e2:2 e1:2 r:2 e1:2 f1:2 e1:2 | e1:2 e1:2 e2:2 e1:2 r:2 e1:2 g1:2 e1:2 |
  f1:2 f1:2 f2:2 f1:2 r:2 f1:2 g1:2 f1:2 | e1:2 e1:2 e2:2 e1:2 r:2 e1:2 d2:2 e2:2 |
  g1:2 g1:2 g2:2 g1:2 r:2 g1:2 a1:2 g1:2 | f1:2 f1:2 f2:2 f1:2 r:2 f1:2 e1:2 f1:2 |
  e1:2 e1:2 e2:2 e1:2 r:2 e1:2 f1:2 g1:2 | bb1:2 bb1:2 bb2:2 bb1:2 a1:2 a1:2 a2:2 a1:2`;
const FAB_A = `
  e4:4 r:2 e4:1 f4:1 g4:4 r:4 | e4:4 r:2 b4:2 a4:2 g4:2 f4:4 | f4:4 r:2 f4:1 g4:1 a4:4 c5:4 | b4:6 a4:2 g4:4 f4:4 |
  g4:4 r:2 g4:1 a4:1 b4:4 d5:4 | c5:6 b4:2 a4:4 f4:4 | e4:4 r:2 e5:2 d5:2 b4:2 g4:4 | bb4:8 a4:4 f4:4`;
const ACORDES_A = 'E5 | E5 | F5 | E5 | G5 | F5 | E5 | Bb5';

export const fabrica: Faixa = {
  id: 'fabrica', nome: 'Engrenagens do Barão', bpm: 126, tom: 'Mi frígio', loop: true, reverb: 'fabrica', envio: 0.3,
  inst: { melodia: 'lead', contra: 'metais', baixo: 'baixoDist', harmonia: 'guitarra' },
  estilo: { tipo: 'stab', grade: 'x.....x.....x...', oitava: 3 },
  vol: { melodia: 0.75, contra: 0.6, baixo: 0.85, harmonia: 0.4, bateria: 0.9 },
  bateria: {
    K1: { bumbo: 'X.......X.......', metal: '....x.......x...', vapor: '..o.......o.....', chimbal: 'x.x.x.x.x.x.x.x.' },
    K2: { bumbo: 'X.....x.X.......', caixa: '....X.......X...', metal: '..x...x...x...x.', bigorna: 'x...............', chimbal: 'xxxxxxxxxxxxxxxx' },
    K3: { bumbo: 'X..x..x.X..x....', caixa: '....X.......X..x', metal: 'x.x.x.x.x.x.x.x.', vapor: '........x.......', bigorna: '............x...' },
    KB: { metal: 'x..x..x...x..x..', bigorna: 'x...............', vapor: '........x.......', bumbo: 'X.........X.....' },
    KD: { bumbo: 'X.x.X.x.X.x.X.x.', caixa: '....X.......X...', metal: 'xoxoxoxoxoxoxoxo', chimbal: 'x.x.x.x.x.x.x.x.' },
    KF: { bumbo: 'X.......X.......', caixa: '........x.x.XXXX', metal: 'x...x...x.......', prato: 'X...............' },
  },
  secoes: {
    I: {
      bateria: 'K1 K1 K1 KF', acordes: 'E5 | E5 | F5 | E5', melodia: '- | - | - | -', contra: '- | - | - | r:8 b4:4 bb4:4',
      baixo: `e1:2 e1:2 e2:2 e1:2 r:2 e1:2 f1:2 e1:2 | e1:2 e1:2 e2:2 e1:2 r:2 e1:2 g1:2 f1:2 |
              f1:2 f1:2 f2:2 f1:2 r:2 f1:2 e1:2 f1:2 | e1:2 e1:2 e2:2 e1:2 bb1:2 a1:2 g1:2 f1:2`,
    },
    A: {
      bateria: 'K2 K2 K2 K3 K2 K2 K3 KF', acordes: ACORDES_A, melodia: FAB_A, baixo: FAB_A_BAIXO,
      contra: 'r:12 b4:4 | r:12 b4:2 b4:2 | r:12 c5:4 | r:12 b4:2 a4:2 | r:12 d5:4 | r:12 c5:2 a4:2 | r:12 b4:4 | f5:4 r:4 e5:4 r:4',
    },
    B: {
      bateria: 'K3', acordes: 'C5 | C5 | Bb5 | Bb5 | A5 | A5 | Bb5 | B5',
      melodia: `g5:2 g5:2 r:2 g5:2 c6:4 bb5:2 g5:2 | e5:4 d5:2 c5:2 d5:4 g4:4 | f5:2 f5:2 r:2 f5:2 bb5:4 a5:2 f5:2 | d5:4 c5:2 bb4:2 c5:4 f4:4 |
                e5:2 e5:2 r:2 e5:2 a5:4 g5:2 e5:2 | c5:4 b4:2 a4:2 b4:4 e4:4 | f5:2 g5:2 bb5:2 a5:2 g5:2 f5:2 d5:2 bb4:2 | b4:8 f#5:8`,
      contra: 'c4:16 | e4:16 | bb3:16 | d4:16 | a3:16 | c4:16 | bb3:16 | b3:16',
      baixo: `c2:2 c2:2 c3:2 c2:2 r:2 c2:2 g1:2 c2:2 | c2:2 c2:2 c3:2 c2:2 r:2 c2:2 bb1:2 g1:2 |
              bb1:2 bb1:2 bb2:2 bb1:2 r:2 bb1:2 f1:2 bb1:2 | bb1:2 bb1:2 bb2:2 bb1:2 r:2 bb1:2 a1:2 f1:2 |
              a1:2 a1:2 a2:2 a1:2 r:2 a1:2 e1:2 a1:2 | a1:2 a1:2 a2:2 a1:2 r:2 a1:2 g1:2 e1:2 |
              bb1:2 bb1:2 bb2:2 bb1:2 f1:2 bb1:2 c2:2 d2:2 | b1:2 b1:2 b2:2 b1:2 f#1:2 b1:2 c2:2 c#2:2`,
    },
    C: {
      bateria: 'KB KB KB KB KB KB KB KF', acordes: 'E5 | E5 | E5 | E5 | F5 | F5 | G5 | F5', inst: { melodia: 'sino' },
      melodia: 'e5:4 r:12 | r:8 f5:4 r:4 | e5:4 r:4 b4:4 r:4 | r:8 c5:4 b4:4 | f5:4 r:12 | r:8 e5:4 r:4 | g5:4 r:4 d5:4 r:4 | f5:8 e5:8',
      contra: `r:6 b3:2 r:6 b3:2 | r:6 c4:2 r:6 b3:2 | r:6 b3:2 r:4 b3:2 c4:2 | r:6 d4:2 r:6 c4:2 |
               r:6 c4:2 r:6 c4:2 | r:6 c4:2 r:4 d4:2 c4:2 | r:6 d4:2 r:6 d4:2 | r:6 c4:2 r:2 c4:2 b3:2 a3:2`,
      baixo: `e1:4 r:4 e1:4 r:4 | e1:4 r:4 e1:2 e1:2 r:4 | e1:4 r:2 e1:2 e2:4 r:4 | e1:4 r:4 e1:2 f1:2 g1:4 |
              f1:4 r:4 f1:4 r:4 | f1:4 r:4 f1:2 f1:2 r:4 | g1:4 r:4 g1:2 g1:2 r:4 | f1:4 f1:4 e1:4 e1:4`,
    },
    D: {
      bateria: 'KD KD KD KD KD KD KD KF', acordes: 'E5 | F5 | F#5 | G5 | Ab5 | A5 | Bb5 | B5',
      melodia: `e5:2 b4:2 e5:2 g5:2 f5:2 e5:2 b4:2 g4:2 | f5:2 c5:2 f5:2 ab5:2 g5:2 f5:2 c5:2 ab4:2 |
                f#5:2 c#5:2 f#5:2 a5:2 g#5:2 f#5:2 c#5:2 a4:2 | g5:2 d5:2 g5:2 bb5:2 a5:2 g5:2 d5:2 bb4:2 |
                ab5:2 eb5:2 ab5:2 b5:2 bb5:2 ab5:2 eb5:2 b4:2 | a5:2 e5:2 a5:2 c6:2 b5:2 a5:2 e5:2 c5:2 |
                bb5:2 f5:2 bb5:2 db6:2 c6:2 bb5:2 f5:2 db5:2 | b5:4 f#5:4 b5:4 c6:4`,
      contra: 'e4:16 | f4:16 | f#4:16 | g4:16 | ab4:16 | a4:16 | bb4:16 | b4:8 c5:8',
      baixo: `e1:2 e1:2 e2:2 e1:2 e1:2 e1:2 e2:2 e1:2 | f1:2 f1:2 f2:2 f1:2 f1:2 f1:2 f2:2 f1:2 |
              f#1:2 f#1:2 f#2:2 f#1:2 f#1:2 f#1:2 f#2:2 f#1:2 | g1:2 g1:2 g2:2 g1:2 g1:2 g1:2 g2:2 g1:2 |
              ab1:2 ab1:2 ab2:2 ab1:2 ab1:2 ab1:2 ab2:2 ab1:2 | a1:2 a1:2 a2:2 a1:2 a1:2 a1:2 a2:2 a1:2 |
              bb1:2 bb1:2 bb2:2 bb1:2 bb1:2 bb1:2 bb2:2 bb1:2 | b1:2 b1:2 b2:2 b1:2 b1:4 c2:4`,
    },
    A2: {
      bateria: 'K3 K2', acordes: ACORDES_A, melodia: FAB_A, baixo: FAB_A_BAIXO,
      contra: `b4:4 r:2 b4:1 c5:1 d5:4 r:4 | b4:4 r:2 g5:2 f5:2 e5:2 d5:4 | c5:4 r:2 c5:1 d5:1 e5:4 g5:4 | g5:6 f5:2 e5:4 d5:4 |
               d5:4 r:2 d5:1 e5:1 f5:4 a5:4 | a5:6 g5:2 f5:4 c5:4 | b4:4 r:2 b5:2 a5:2 g5:2 e5:4 | f5:8 e5:4 c5:4`,
    },
    E: {
      bateria: 'K2 K2 K3 KF', acordes: 'E5 | F5 | E5 | Bb5',
      melodia: 'e5:2 e5:2 r:4 e5:2 f5:2 r:4 | f5:2 f5:2 r:4 f5:2 g5:2 r:4 | e5:16 | bb4:8 a4:8',
      contra: 'b4:16 | c5:16 | b4:16 | f4:8 e4:8',
      baixo: 'e1:2 e1:2 e1:2 e1:2 e1:2 e1:2 e1:2 e1:2 | f1:2 f1:2 f1:2 f1:2 f1:2 f1:2 f1:2 f1:2 | e1:4 e2:4 e1:4 e2:4 | bb1:4 bb1:4 a1:4 a1:4',
    },
  },
  ordem: ['I', 'A', 'B', 'C', 'D', 'A2', 'E'],
};
