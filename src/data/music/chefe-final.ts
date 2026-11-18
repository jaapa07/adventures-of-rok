/** Chefe final — versão épica do tema do título, em Mi menor e mais rápida, contra o Barão Javardo. */
import { transpor, type Faixa } from './types';
import { TEMA_A, TEMA_B, TEMA_D } from './titulo';

const A_ACORDES = 'Em | C | G | D | Em | C | Am | B';

export const chefeFinal: Faixa = {
  id: 'chefe-final', nome: 'O Barão e a Semente', bpm: 132, tom: 'Mi menor', loop: true, reverb: 'fabrica', envio: 0.25,
  inst: { melodia: 'metais', contra: 'cordas', baixo: 'baixoDist', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.6, baixo: 0.75, harmonia: 0.4, bateria: 0.95 },
  bateria: {
    Y0: { surdo: 'X.......X.......', tom: '............x.x.' },
    Y1: { bumbo: 'X.....x.X.....x.', surdo: '....X.......X...', caixa: '....X.......X...', chimbal: 'x.x.x.x.x.x.x.x.', prato: 'X...............' },
    Y2: { bumbo: 'X.....x.X.....x.', surdo: '....X.......X...', caixa: 'o...X..oo...X.oo', chimbal: 'x.x.x.x.x.x.x.x.' },
    Y3: { bumbo: 'X.X.X.X.X.X.X.X.', caixa: '....X.......X.xx', aberto: 'x.x.x.x.x.x.x.x.', surdo: 'X.......X.......' },
    YF: { bumbo: 'X.......X.......', tom: '....xx.xxx.xxxXX', caixa: '............XXXX', surdo: 'X...............' },
  },
  secoes: {
    I: {
      bateria: 'Y0 Y0 Y0 YF', acordes: 'Em | Em | C | B', melodia: '- | - | - | r:8 f#5:2 e5:2 d#5:2 f#5:2',
      contra: `e5:2 b4:2 e5:2 b4:2 e5:2 b4:2 e5:2 b4:2 | e5:2 b4:2 g5:2 b4:2 e5:2 b4:2 g5:2 b4:2 |
               e5:2 c5:2 g5:2 c5:2 e5:2 c5:2 g5:2 c5:2 | d#5:2 b4:2 f#5:2 b4:2 d#5:2 b4:2 f#5:2 a5:2`,
      baixo: 'e2:4 e2:4 e2:4 e2:4 | e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 | c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 | b1:2 b1:2 b1:2 b1:2 b1:2 b1:2 b2:2 b1:2',
    },
    A: {
      bateria: 'Y1 Y2 Y2 Y2 Y2 Y2 Y2 YF', acordes: A_ACORDES, melodia: transpor(TEMA_A, 2),
      contra: `e5:2 b4:2 g5:2 b4:2 e5:2 b4:2 g5:2 b4:2 | e5:2 c5:2 g5:2 c5:2 e5:2 c5:2 g5:2 c5:2 |
               d5:2 b4:2 g5:2 b4:2 d5:2 b4:2 g5:2 b4:2 | d5:2 a4:2 f#5:2 a4:2 d5:2 a4:2 f#5:2 a4:2 |
               e5:2 b4:2 g5:2 b4:2 e5:2 b4:2 b5:2 b4:2 | e5:2 c5:2 g5:2 c5:2 e5:2 c5:2 c6:2 c5:2 |
               e5:2 c5:2 a5:2 c5:2 e5:2 c5:2 a5:2 c5:2 | d#5:2 b4:2 f#5:2 b4:2 d#5:2 b4:2 a5:2 b4:2`,
      baixo: `e2:2 e2:2 e3:2 e2:2 e2:2 e2:2 e3:2 e2:2 | c2:2 c2:2 c3:2 c2:2 c2:2 c2:2 c3:2 c2:2 |
              g1:2 g1:2 g2:2 g1:2 g1:2 g1:2 g2:2 g1:2 | d2:2 d2:2 d3:2 d2:2 d2:2 d2:2 d3:2 d2:2 |
              e2:2 e2:2 e3:2 e2:2 b1:2 b1:2 d2:2 e2:2 | c2:2 c2:2 c3:2 c2:2 g1:2 g1:2 b1:2 c2:2 |
              a1:2 a1:2 a2:2 a1:2 a1:2 a1:2 c2:2 e2:2 | b1:2 b1:2 b2:2 b1:2 f#1:2 b1:2 d#2:2 f#2:2`,
    },
    B: {
      bateria: 'Y1 Y2', acordes: 'Am | D | G | Em | C | D | B | B', melodia: transpor(TEMA_B, 2), inst: { melodia: 'cordas', contra: 'metais' },
      contra: 'c5:8 e5:8 | d5:8 f#5:8 | d5:16 | b4:8 g4:8 | e5:8 g5:8 | f#5:8 a5:8 | d#5:8 f#5:8 | b4:4 d#5:4 f#5:4 a5:4',
      baixo: `a1:6 a1:2 e2:4 c2:4 | d2:6 d2:2 a2:4 f#2:4 | g1:6 g1:2 d2:4 b1:4 | e2:6 e2:2 b1:4 d2:4 |
              c2:6 c2:2 g2:4 c3:4 | d2:6 d2:2 a2:4 d3:4 | b1:6 b1:2 f#2:4 a2:4 | b1:4 b1:4 f#2:2 f#2:2 b2:4`,
    },
    X: {
      bateria: 'Y3', acordes: 'Em | F | Em | F | C | B | C | B',
      melodia: `e4:2 r:2 e4:2 f4:2 e4:4 b3:4 | f4:2 r:2 f4:2 g4:2 f4:4 c4:4 | e4:2 r:2 e4:2 g4:2 b4:4 e5:4 | f5:2 r:2 e5:2 c5:2 a4:4 f4:4 |
                g4:4 c5:4 e5:4 g5:4 | f#5:8 d#5:4 b4:4 | c5:4 e5:4 g5:4 c6:4 | b5:16`,
      contra: `e5:2 f5:2 e5:2 f5:2 e5:2 f5:2 e5:2 f5:2 | f5:2 e5:2 f5:2 e5:2 f5:2 g5:2 f5:2 e5:2 |
               b5:2 c6:2 b5:2 c6:2 b5:2 c6:2 b5:2 g5:2 | c6:2 b5:2 c6:2 b5:2 a5:2 f5:2 a5:2 c6:2 |
               e5:2 g5:2 c6:2 g5:2 e5:2 g5:2 c6:2 g5:2 | d#5:2 f#5:2 b5:2 f#5:2 d#5:2 f#5:2 b5:2 f#5:2 |
               e5:2 g5:2 c6:2 e6:2 c6:2 g5:2 e5:2 g5:2 | d#5:2 f#5:2 b5:2 d#6:2 b5:2 f#5:2 d#5:2 b4:2`,
      baixo: `e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 | f2:2 f2:2 f2:2 f2:2 f2:2 f2:2 f2:2 f2:2 |
              e2:2 e2:2 e2:2 e2:2 e2:2 e2:2 g2:2 e2:2 | f2:2 f2:2 f2:2 f2:2 f2:2 f2:2 a2:2 f2:2 |
              c2:4 c3:4 c2:4 c3:4 | b1:4 b2:4 b1:4 b2:4 | c2:2 c2:2 c3:2 c2:2 c2:2 c2:2 c3:2 c2:2 | b1:2 b1:2 b2:2 b1:2 f#2:2 b1:2 a2:2 b1:2`,
    },
    A2: {
      bateria: 'Y1 Y2 Y2 Y2 Y2 Y2 Y2 YF', acordes: A_ACORDES, melodia: transpor(TEMA_A, -10),
      contra: 'b5:8 g5:8 | e5:8 g5:8 | d6:8 b5:8 | a5:8 f#5:8 | b5:8 e6:8 | c6:8 g5:8 | a5:8 c6:8 | d#6:8 f#6:8',
      baixo: `e2:3 e2:3 e2:2 b2:4 e3:4 | c2:3 c2:3 c2:2 g2:4 c3:4 | g1:3 g1:3 g1:2 d2:4 g2:4 | d2:3 d2:3 d2:2 a2:4 d3:4 |
              e2:3 e2:3 e2:2 b2:4 g2:4 | c2:3 c2:3 c2:2 g2:4 e2:4 | a1:3 a1:3 a1:2 e2:4 a2:4 | b1:3 b1:3 b1:2 f#2:4 b2:4`,
    },
    D: {
      bateria: 'Y2', acordes: 'Em | D | C | B | Em | D | C | B', melodia: transpor(TEMA_D, 2), inst: { melodia: 'cordas', contra: 'metais' },
      contra: 'b4:16 | a4:16 | g4:16 | f#4:16 | g4:8 b4:8 | f#4:8 a4:8 | e4:8 g4:8 | d#4:8 f#4:8',
      baixo: `e2:2 r:2 e2:2 b1:2 e2:4 g2:4 | d2:2 r:2 d2:2 a1:2 d2:4 f#2:4 | c2:2 r:2 c2:2 g1:2 c2:4 e2:4 | b1:2 r:2 b1:2 f#2:2 b1:4 d#2:4 |
              e2:2 e2:2 e3:2 e2:2 b1:4 d2:4 | d2:2 d2:2 d3:2 d2:2 a1:4 c2:4 | c2:2 c2:2 c3:2 c2:2 g2:4 b1:4 | b1:2 b1:2 b2:2 b1:2 f#2:4 a2:4`,
    },
    E: {
      bateria: 'Y1 Y2 Y1 YF', acordes: 'C | D | B | B',
      melodia: 'g5:4 a5:4 b5:4 c6:4 | d6:4 c6:4 b5:4 a5:4 | b5:16 | _:8 r:8', contra: 'e5:16 | f#5:16 | d#5:16 | f#5:8 r:8',
      baixo: 'c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 | d2:2 d2:2 d2:2 d2:2 d2:2 d2:2 d2:2 d2:2 | b1:16 | b1:4 b1:4 b1:2 b1:2 b1:4',
    },
  },
  ordem: ['I', 'A', 'B', 'X', 'A2', 'D', 'E'],
};
