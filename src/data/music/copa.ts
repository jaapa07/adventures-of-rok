/** Copa das Árvores — épico luminoso em Dó (com cor lídia): cordas, metais e sinos sobre surdos. */
import type { Faixa } from './types';

const COPA_A = `
  e5:4 g5:4 c6:6 b5:2 | d6:8 b5:4 g5:4 | a5:4 c6:4 e6:6 d6:2 | c6:8 a5:4 f5:4 |
  g5:4 c6:4 e6:4 g6:4 | f6:6 e6:2 d6:8 | c6:4 a5:4 f5:4 a5:4 | g5:16`;
const ACORDES_A = 'C | G/B | Am | F | C | G | F | G';

export const copa: Faixa = {
  id: 'copa', nome: 'Acima das Nuvens', bpm: 92, tom: 'Dó maior', loop: true, reverb: 'copa', envio: 0.35,
  inst: { melodia: 'cordas', contra: 'metais', baixo: 'baixo', harmonia: 'padBrilho' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.55, baixo: 0.8, harmonia: 0.5, bateria: 0.8 },
  bateria: {
    E0: { surdo: 'X.......X.......', prato: 'o...............' },
    E1: { bumbo: 'X.......X.......', surdo: '....X.......X...', caixa: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', tom: '..............x.' },
    E1C: { bumbo: 'X.......X.......', surdo: '....X.......X...', caixa: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', prato: 'X...............' },
    E2: { bumbo: 'X.....x.X.......', surdo: '....X.......X...', caixa: 'o...x..oo...x.oo', aberto: '..x...x...x...x.', tom: '..........x.x...' },
    E3: { surdo: 'X.......X.......', ganza: 'xoxoxoxoxoxoxoxo', aro: '....x.......x...' },
    E4: { bumbo: 'X.x.X.x.X.x.X.x.', surdo: '....X.......X...', caixa: 'o.o.X.o.o.o.X.oo', aberto: 'x.x.x.x.x.x.x.x.', prato: 'X...............' },
    EF: { bumbo: 'X.......X.......', tom: '........x.xxxxXX', caixa: '....x.......xxxx' },
  },
  secoes: {
    I: {
      bateria: 'E0 E0 E0 EF', acordes: 'C | D/C | C | D/C', melodia: '- | - | - | r:8 g5:4 b5:4',
      contra: 'g4:16 | a4:16 | g4:8 e4:8 | f#4:16', baixo: 'c2:16 | c2:16 | c2:8 g1:8 | c2:16',
    },
    A: {
      bateria: 'E1C E1 E1 E1 E1 E1 E1 EF', acordes: ACORDES_A, melodia: COPA_A,
      contra: 'c5:8 e5:8 | d5:8 g5:8 | e5:8 c5:8 | a4:8 c5:8 | e5:8 g5:8 | b4:8 d5:8 | a4:8 f4:8 | b4:8 d5:8',
      baixo: 'c2:8 c2:4 g1:4 | b1:8 b1:4 g1:4 | a1:8 a1:4 e2:4 | f1:8 f1:4 c2:4 | c2:8 e2:4 g2:4 | g1:8 b1:4 d2:4 | f1:8 a1:4 c2:4 | g1:8 g1:4 d2:4',
    },
    B: {
      bateria: 'E2', acordes: 'Am | Em | F | C | Dm | Am | Bb | G',
      melodia: 'a5:6 b5:2 c6:8 | b5:6 g5:2 e5:8 | f5:4 a5:4 c6:4 f6:4 | e6:8 c6:8 | d6:6 e6:2 f6:8 | e6:4 c6:4 a5:8 | bb5:4 d6:4 f6:4 d6:4 | d6:16',
      contra: 'e5:16 | g5:16 | a5:16 | g5:16 | a5:16 | e5:16 | f5:16 | b4:8 d5:8',
      baixo: `a1:4 a1:4 a1:4 e2:4 | e2:4 e2:4 e2:4 b1:4 | f1:4 f1:4 f1:4 c2:4 | c2:4 c2:4 c2:4 g1:4 |
              d2:4 d2:4 d2:4 a1:4 | a1:4 a1:4 a1:4 e2:4 | bb1:4 bb1:4 bb1:4 f2:4 | g1:4 g1:4 g1:4 d2:4`,
    },
    C: {
      bateria: 'E3', acordes: 'F | G | Em | Am | F | G | C | C', inst: { melodia: 'sino', contra: 'cordas' },
      melodia: `a5:2 c6:2 f6:4 e6:4 c6:4 | b5:2 d6:2 g6:4 f6:4 d6:4 | g5:2 b5:2 e6:4 d6:4 b5:4 | c6:2 e6:2 a6:4 g6:4 e6:4 |
                f6:4 e6:4 c6:4 a5:4 | g5:4 b5:4 d6:4 f6:4 | e6:16 | g6:8 e6:8`,
      contra: 'f4:16 | g4:16 | e4:16 | a4:16 | c5:16 | d5:16 | e5:16 | c5:16',
      baixo: 'f1:16 | g1:16 | e1:16 | a1:16 | f1:8 a1:8 | g1:8 b1:8 | c2:16 | c2:8 g1:8',
    },
    A2: {
      bateria: 'E1C E2', acordes: ACORDES_A, inst: { melodia: 'metais', contra: 'cordas' },
      melodia: COPA_A.replace('g5:16', 'g5:8 a5:4 b5:4'),
      contra: 'g4:4 c5:4 e5:8 | g4:4 b4:4 d5:8 | a4:4 c5:4 e5:8 | f4:4 a4:4 c5:8 | g4:4 c5:4 e5:8 | g4:4 b4:4 d5:8 | f4:4 a4:4 c5:8 | b4:4 d5:4 f5:8',
      baixo: `c2:4 c3:4 c2:4 g1:4 | b1:4 b2:4 b1:4 g1:4 | a1:4 a2:4 a1:4 e1:4 | f1:4 f2:4 f1:4 c2:4 |
              c2:4 c3:4 e2:4 g2:4 | g1:4 g2:4 b1:4 d2:4 | f1:4 f2:4 a1:4 c2:4 | g1:4 g2:4 g1:4 g1:4`,
    },
    D: {
      bateria: 'E4', acordes: 'Am | F | C | G | Am | F | D | G',
      melodia: `a5:2 b5:2 c6:2 e6:2 a6:4 e6:4 | f6:2 e6:2 c6:2 a5:2 f5:4 a5:4 | g5:2 a5:2 c6:2 e6:2 g6:4 e6:4 | d6:2 b5:2 g5:2 b5:2 d6:8 |
                e6:2 d6:2 c6:2 b5:2 a5:4 c6:4 | f6:2 e6:2 d6:2 c6:2 a5:4 c6:4 | f#6:2 e6:2 d6:2 a5:2 f#5:4 a5:4 | g5:4 b5:4 d6:4 g6:4`,
      contra: 'c5:16 | a4:16 | e5:16 | d5:16 | c5:8 e5:8 | a4:8 c5:8 | d5:8 f#5:8 | g5:16',
      baixo: `a1:2 a1:2 a2:2 a1:2 a1:2 a1:2 a2:2 a1:2 | f1:2 f1:2 f2:2 f1:2 f1:2 f1:2 f2:2 f1:2 | c2:2 c2:2 c3:2 c2:2 c2:2 c2:2 c3:2 c2:2 | g1:2 g1:2 g2:2 g1:2 g1:2 g1:2 g2:2 g1:2 |
              a1:4 a2:4 a1:4 a2:4 | f1:4 f2:4 f1:4 f2:4 | d2:4 d3:4 d2:4 d3:4 | g1:4 g2:4 g1:4 b1:4`,
    },
    E: {
      bateria: 'E2 E2 E1C EF', acordes: 'F | G | C | C',
      melodia: 'a5:4 c6:4 f6:8 | g6:4 f6:4 d6:8 | e6:16 | _:8 r:8', contra: 'c5:16 | d5:16 | e5:16 | c5:8 r:8',
      baixo: 'f1:4 f1:4 f1:4 f1:4 | g1:4 g1:4 g1:4 g1:4 | c2:16 | c2:4 g1:4 c2:8',
    },
  },
  ordem: ['I', 'A', 'B', 'C', 'A2', 'D', 'E'],
};
