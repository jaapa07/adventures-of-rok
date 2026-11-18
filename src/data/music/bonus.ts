/** Sala bônus — jingle brincalhão em Dó maior, rápido e em laço curto. */
import type { Faixa } from './types';

export const bonus: Faixa = {
  id: 'bonus', nome: 'Câmara de Cristal', bpm: 140, tom: 'Dó maior', loop: true, reverb: 'cristal', envio: 0.25,
  inst: { melodia: 'marimba', contra: 'pizz', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.7, baixo: 0.75, harmonia: 0.25, bateria: 0.7 },
  bateria: {
    J1: { bumbo: 'X...X...X...X...', caixa: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', agogoA: '..x.....x.x.....' },
    J2: { bumbo: 'X...X...X...X...', caixa: '....x.......x...', palmas: '....x.......x.x.', tamborim: 'x.xx.xx.x.xx.x.x' },
    JF: { bumbo: 'X...............', tom: '........x.x.xxxx', caixa: '....x...xxxx....' },
  },
  secoes: {
    A: {
      bateria: 'J1 J1 J1 J2 J1 J1 J1 JF', acordes: 'C | C | F | G | C | Am | D7 | G',
      melodia: `c5:2 e5:2 g5:2 e5:2 c6:2 r:2 g5:4 | a5:2 g5:2 e5:2 c5:2 d5:2 r:2 e5:4 | f5:2 a5:2 c6:2 a5:2 f6:2 r:2 c6:4 | b5:2 a5:2 g5:2 f5:2 d5:4 g4:4 |
                c5:2 r:2 e5:2 r:2 g5:2 r:2 c6:4 | a5:2 c6:2 e6:4 c6:4 a5:4 | f#5:2 a5:2 c6:2 a5:2 d6:4 c6:4 | b5:2 g5:2 d5:2 b4:2 g4:8`,
      contra: `r:4 g4:2 r:2 r:4 g4:2 r:2 | r:4 e4:2 r:2 r:4 g4:2 r:2 | r:4 a4:2 r:2 r:4 c5:2 r:2 | r:4 b4:2 r:2 r:4 d5:2 r:2 |
               r:4 g4:2 r:2 r:4 e4:2 r:2 | r:4 c5:2 r:2 r:4 a4:2 r:2 | r:4 c5:2 r:2 r:4 f#4:2 r:2 | r:4 d5:2 r:2 r:4 b4:2 r:2`,
      baixo: 'c2:4 g1:4 c2:4 g1:4 | c2:4 e2:4 g2:4 e2:4 | f1:4 c2:4 f2:4 c2:4 | g1:4 d2:4 g2:4 d2:4 | c2:4 g1:4 e1:4 g1:4 | a1:4 e2:4 a2:4 e2:4 | d2:4 a1:4 f#1:4 a1:4 | g1:4 d2:4 g1:4 b1:4',
    },
    B: {
      bateria: 'J2 J2 J2 J1 J2 J2 J2 JF', acordes: 'F | G | Em | Am | Dm | G | C | G7', inst: { melodia: 'metais', contra: 'marimba' },
      melodia: `a5:3 a5:1 r:2 g5:2 f5:4 c5:4 | b5:3 b5:1 r:2 a5:2 g5:4 d5:4 | g5:2 e5:2 b4:2 e5:2 g5:2 b5:2 e6:4 | c6:2 a5:2 e5:2 a5:2 c6:2 e6:2 a6:4 |
                f6:2 d6:2 a5:2 f5:2 d5:4 f5:4 | g5:2 b5:2 d6:2 f6:2 g6:8 | e6:2 c6:2 g5:2 e5:2 c5:4 e5:4 | d5:2 f5:2 g5:2 b5:2 d6:4 b5:4`,
      contra: `c5:2 a4:2 c5:2 f5:2 c5:2 a4:2 f4:4 | d5:2 b4:2 d5:2 g5:2 d5:2 b4:2 g4:4 | e5:2 b4:2 g4:2 b4:2 e5:8 | e5:2 c5:2 a4:2 c5:2 e5:8 |
               d5:2 a4:2 f4:2 a4:2 d5:8 | d5:2 b4:2 g4:2 b4:2 d5:8 | c5:2 g4:2 e4:2 g4:2 c5:8 | b4:2 g4:2 f4:2 d4:2 b3:8`,
      baixo: 'f1:4 c2:4 f2:4 c2:4 | g1:4 d2:4 g2:4 d2:4 | e2:4 b1:4 e2:4 g2:4 | a1:4 e2:4 a2:4 e2:4 | d2:4 a1:4 d2:4 f2:4 | g1:4 d2:4 g2:4 f2:4 | c2:4 g1:4 c2:4 e2:4 | g1:4 b1:4 d2:4 f2:4',
    },
  },
  ordem: ['A', 'B'],
};
