/** Mata Alta — groove tribal de surdos, agogôs e palmas com marimba em Lá dórico. */
import type { Faixa } from './types';

const MATA_A = `
  a4:2 c5:1 e5:1 r:2 e5:2 g5:2 e5:2 d5:2 c5:2 |
  d5:3 b4:1 _:2 g4:2 b4:2 d5:2 g5:4 |
  a5:2 g5:1 f5:1 r:2 c5:2 f5:2 a5:2 c6:4 |
  b5:3 a5:1 _:2 g5:2 d5:4 r:4 |
  e5:2 a5:1 c6:1 r:2 c6:2 b5:2 a5:2 g5:2 e5:2 |
  d5:3 g5:1 _:2 b5:2 a5:2 g5:2 d5:4 |
  c5:2 e5:2 a5:2 c6:2 e6:4 c6:4 |
  b5:4 g#5:4 e5:4 d5:2 b4:2`;
const ACORDES_A = 'Am7 | G | F | G | Am7 | G | Fmaj7 | E7';

export const mata: Faixa = {
  id: 'mata', nome: 'Trilha da Sumaúma', bpm: 112, tom: 'Lá dórico', loop: true, reverb: 'mata', envio: 0.25,
  inst: { melodia: 'marimba', contra: 'flauta', baixo: 'baixo', harmonia: 'kalimba' },
  estilo: { tipo: 'arpejo', padrao: [0, 2, 1, 2, 3, 2, 1, 2], passo: 2, oitava: 4 },
  vol: { melodia: 1, contra: 0.5, baixo: 0.8, harmonia: 0.3, bateria: 0.85 },
  bateria: {
    T1: { surdo: 'X.....x...X.....', tom: '....x.......x.x.', ganza: 'xoxoxoxoxoxoxoxo', agogoA: 'x...x.x.....x...', agogoB: '..x.....x.x...x.' },
    T2: { surdo: 'X.....x...X...x.', tom: '....x.....x.x...', ganza: 'xoxoxoxoxoxoxoxo', palmas: '....x.......x...' },
    TF: { surdo: 'X.....x...X.....', tom: '........x.x.xxxx', palmas: '....x.......x.xx' },
    G1: { bumbo: 'X.....x...X.....', surdo: '....X.......X...', tom: '..........x...x.', ganza: 'xoxoxoxoxoxoxoxo', agogoA: 'x...x.x.....x...', agogoB: '..x.....x.x...x.', palmas: '....x.......x...' },
    G2: { bumbo: 'X.....x...X.....', surdo: '....X.......X...', tom: '..........x...x.', caxixi: 'x.xxx.xxx.xxx.xx', tamborim: 'x.xx.x.xx.x.x.x.', palmas: '....x.......x...' },
    GC: { bumbo: 'X.....x...X.....', surdo: '....X.......X...', ganza: 'xoxoxoxoxoxoxoxo', agogoA: 'x...x.x.....x...', agogoB: '..x.....x.x...x.', prato: 'X...............' },
    GB: { surdo: 'X.......X.......', tom: '..x.x.......x.x.', caxixi: 'x.x.x.x.x.x.x.x.', palmas: '........x.x.x...' },
    GBR: { surdo: 'X..X..X...X..X..', tom: '..x..x..x...x..x', tamborim: 'x.xx.xx.x.xx.xx.', ganza: 'xxxxxxxxxxxxxxxx' },
    GD: { bumbo: 'X.......X.......', surdo: '....X.......X..x', caixa: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', agogoA: 'x..x..x...x..x..' },
    F: { surdo: 'X.......X.......', tom: '........xxx.xXXX', caixa: '............xxxx' },
  },
  secoes: {
    I: {
      bateria: 'T1 T2 T1 TF', acordes: 'Am7 | Am7 | G | E7', melodia: '- | - | - | -', contra: '- | - | - | r:8 e5:4 g#5:4',
      baixo: 'a1:3 a1:3 a2:2 r:8 | a1:3 a1:3 a2:2 r:4 g1:2 e1:2 | g1:3 g1:3 g2:2 r:8 | e1:3 e1:3 e2:2 r:2 e2:2 e2:2 e2:2',
    },
    A: {
      bateria: 'GC G1 G1 G2 G1 G1 G2 F', acordes: ACORDES_A, melodia: MATA_A,
      contra: 'r:8 e6:8 | d6:16 | c6:8 a5:8 | b5:16 | r:8 c6:8 | b5:8 d6:8 | e6:16 | d6:8 b5:8',
      baixo: `a1:3 a1:3 a2:2 r:2 a1:2 g1:2 e1:2 | g1:3 g1:3 g2:2 r:2 g1:2 d2:2 b1:2 | f1:3 f1:3 f2:2 r:2 f1:2 c2:2 a1:2 | g1:3 g1:3 g2:2 r:2 g1:2 b1:2 d2:2 |
              a1:3 a1:3 a2:2 r:2 a1:2 c2:2 e2:2 | g1:3 g1:3 g2:2 r:2 d2:2 b1:2 g1:2 | f1:3 f1:3 f2:2 r:2 f1:2 a1:2 c2:2 | e1:3 e1:3 e2:2 r:2 e1:2 g#1:2 b1:2`,
    },
    B: {
      bateria: 'GB GB GB GB GB GB GB F', acordes: 'Dm7 | Am7 | Dm7 | Am7 | F | G | Am7 | Am7',
      melodia: `d5:2 f5:2 a5:2 r:10 | c5:2 e5:2 a5:2 r:10 | f5:2 a5:2 c6:2 d6:2 r:8 | e6:2 d6:2 c6:2 a5:2 r:8 |
                a5:3 c6:1 _:4 a5:2 g5:2 f5:4 | g5:3 b5:1 _:4 d6:2 b5:2 g5:4 | a5:2 g5:2 e5:2 d5:2 c5:2 d5:2 e5:2 g5:2 | a5:8 r:8`,
      contra: 'r:8 c6:2 a5:2 f5:4 | r:8 g5:2 e5:2 c5:4 | r:8 d6:4 c6:4 | r:8 g5:4 a5:4 | c5:16 | d5:16 | e5:8 g5:8 | a5:4 c6:4 e6:8',
      baixo: `d2:4 r:2 d2:2 a1:4 c2:4 | a1:4 r:2 a1:2 e2:4 g1:4 | d2:4 r:2 d2:2 f2:4 a2:4 | a1:4 r:2 a1:2 c2:4 e2:4 |
              f1:6 f1:2 c2:4 f2:4 | g1:6 g1:2 d2:4 g2:4 | a1:3 a1:3 e2:2 a1:3 a1:3 g1:2 | a1:3 a1:3 e2:2 a2:4 e2:4`,
    },
    C: {
      bateria: 'GBR GBR GBR GBR GBR GBR GBR F', acordes: 'Am | Am | C | C | Dm | Dm | E7 | E7',
      melodia: `a4:2 e5:2 a5:2 e5:2 c5:2 e5:2 a5:2 e5:2 | a4:2 e5:2 b5:2 e5:2 c6:2 e5:2 b5:2 e5:2 |
                c5:2 g5:2 c6:2 g5:2 e5:2 g5:2 c6:2 g5:2 | c5:2 g5:2 d6:2 g5:2 e6:2 g5:2 d6:2 g5:2 |
                d5:2 a5:2 d6:2 a5:2 f5:2 a5:2 d6:2 a5:2 | d5:2 a5:2 e6:2 a5:2 f6:2 a5:2 e6:2 a5:2 |
                e5:2 b5:2 e6:2 b5:2 g#5:2 b5:2 d6:2 b5:2 | e5:2 g#5:2 b5:2 d6:2 e6:4 r:4`,
      contra: 'e5:8 a5:8 | b5:12 a5:4 | g5:8 e5:8 | d5:4 e5:4 g5:8 | f5:8 a5:8 | d6:12 c6:4 | b5:8 g#5:8 | e5:16',
      baixo: 'a1:8 a1:8 | a1:4 a1:4 e2:4 a1:4 | c2:8 c2:8 | c2:4 c2:4 g2:4 c2:4 | d2:8 d2:8 | d2:4 d2:4 a2:4 d2:4 | e2:8 e2:8 | e2:4 e2:4 b1:4 g#1:4',
    },
    A2: {
      bateria: 'GC G2 G1 G2 G1 G2 G1 F', acordes: ACORDES_A, melodia: MATA_A, inst: { melodia: 'flauta', contra: 'marimba' },
      contra: `c5:2 a4:1 c5:1 r:2 c5:2 e5:2 c5:2 b4:2 a4:2 | b4:3 g4:1 _:2 d4:2 g4:2 b4:2 d5:4 |
               f5:2 e5:1 c5:1 r:2 a4:2 c5:2 f5:2 a5:4 | g5:3 f5:1 _:2 d5:2 b4:4 r:4 |
               c5:2 e5:1 a5:1 r:2 a5:2 g5:2 e5:2 d5:2 c5:2 | b4:3 d5:1 _:2 g5:2 f5:2 d5:2 b4:4 |
               a4:2 c5:2 e5:2 a5:2 c6:4 a5:4 | g#5:4 e5:4 b4:4 g#4:2 e4:2`,
      baixo: `a1:2 a2:2 r:2 a1:2 e2:2 a2:2 g2:2 e2:2 | g1:2 g2:2 r:2 g1:2 d2:2 g2:2 f2:2 d2:2 | f1:2 f2:2 r:2 f1:2 c2:2 f2:2 e2:2 c2:2 | g1:2 g2:2 r:2 g1:2 d2:2 g2:2 a2:2 b2:2 |
              a1:2 a2:2 r:2 a1:2 e2:2 a2:2 c3:2 a2:2 | g1:2 g2:2 r:2 g1:2 b1:2 d2:2 g2:2 d2:2 | f1:2 f2:2 r:2 f1:2 a1:2 c2:2 f2:2 c2:2 | e1:2 e2:2 r:2 e1:2 g#1:2 b1:2 e2:2 d2:2`,
    },
    D: {
      bateria: 'GD GD GD GD GD GD GD F', acordes: 'C | G | Am | Em | F | C | Dm7 | E7',
      melodia: `g5:2 e5:2 c5:2 e5:2 g5:4 c6:4 | b5:2 g5:2 d5:2 g5:2 b5:4 d6:4 | c6:3 b5:1 a5:4 e5:4 c5:4 | b4:2 e5:2 g5:2 b5:2 e6:8 |
                f6:2 e6:2 c6:2 a5:2 f5:4 a5:4 | g5:2 e5:2 c5:2 g4:2 c5:8 | d5:2 f5:2 a5:2 c6:2 d6:4 c6:4 | b5:4 g#5:2 e5:2 d5:4 b4:4`,
      contra: 'e5:16 | d5:16 | e5:8 c5:8 | b4:16 | a5:8 c6:8 | g5:16 | f5:8 a5:8 | g#5:16',
      baixo: `c2:6 c2:2 g1:4 c2:4 | g1:6 g1:2 d2:4 g1:4 | a1:6 a1:2 e2:4 a1:4 | e1:6 e1:2 b1:4 e2:4 |
              f1:6 f1:2 c2:4 f2:4 | c2:6 c2:2 g1:4 e1:4 | d2:6 d2:2 a1:4 c2:4 | e1:6 e1:2 b1:4 g#1:4`,
    },
    E: {
      bateria: 'G1 G1 G2 F', acordes: 'Am7 | G | F | E7',
      melodia: 'a5:2 g5:2 e5:2 d5:2 c5:2 a4:2 c5:2 d5:2 | e5:2 d5:2 b4:2 g4:2 b4:2 d5:2 g5:4 | a5:2 f5:2 c5:2 a4:2 c5:2 f5:2 a5:4 | g#5:4 b5:4 e6:8',
      contra: 'e6:16 | d6:16 | c6:16 | b5:16',
      baixo: 'a1:4 a1:4 a1:4 a1:4 | g1:4 g1:4 g1:4 g1:4 | f1:4 f1:4 f1:4 f1:4 | e1:4 e1:4 e2:4 e1:4',
    },
  },
  ordem: ['I', 'A', 'B', 'C', 'A2', 'D', 'E'],
};
