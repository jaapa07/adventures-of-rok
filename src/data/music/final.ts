/** Final — o tema da Semente-Mãe renasce em Ré maior; cadência grandiosa (não repete). */
import type { Faixa } from './types';

const R1 = 'd4:2 d4:1 d4:1 e4:2 r:2 d4:2 d4:1 d4:1 e4:4';
const R2 = 'd4:2 d4:1 d4:1 e4:2 r:2 d4:2 e4:2 d4:4';
const R3 = 'd4:2 d4:1 d4:1 e4:2 e4:2 e4:2 e4:2 e4:4';
const R4 = 'd4:1 d4:1 e4:2 d4:2 r:2 d4:1 d4:1 e4:2 e4:2 d4:2';

export const final: Faixa = {
  id: 'final', nome: 'A Árvore Floresce', bpm: 88, tom: 'Ré maior', loop: false, reverb: 'copa', envio: 0.4,
  inst: { melodia: 'cordas', contra: 'berimbau', baixo: 'baixo', harmonia: 'padBrilho' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.65, harmonia: 0.5, bateria: 0.75 },
  bateria: {
    A: { bumbo: 'X.....x.X.......', surdo: '....X.......X...', caxixi: 'x.xxx.xxx.xxx.xx', pandeiro: '..x...x...x...x.' },
    AC: { bumbo: 'X.....x.X.......', surdo: '....X.......X...', caxixi: 'x.xxx.xxx.xxx.xx', prato: 'X...............' },
    B: { bumbo: 'X.......X.......', surdo: '....X.......X...', caixa: 'o..xo.o.o..xo.oo', pandeiro: 'x.x.x.x.x.x.x.x.' },
    C: { surdo: 'X.......X.......', prato: 'o...............' },
    F: { surdo: 'X...X...X...X...', tom: '........x.x.xxxx', prato: '............X...' },
  },
  secoes: {
    A: {
      bateria: 'AC A A A A A A F', acordes: 'D | A/C# | Bm | G | D | A | G | A',
      melodia: `a4:3 d5:1 _:4 e5:2 f#5:2 e5:2 d5:2 | e5:6 c#5:2 a4:8 | b4:3 d5:1 _:4 f#5:2 b5:2 a5:2 f#5:2 | g5:8 d5:8 |
                f#5:3 a5:1 _:4 b5:2 a5:2 f#5:2 d5:2 | e5:6 a5:2 c#6:8 | b5:4 a5:2 g5:2 d5:4 b4:4 | a4:4 c#5:4 e5:4 a5:4`,
      contra: `${R1} | ${R2} | ${R1} | ${R4} | ${R1} | ${R2} | ${R4} | ${R3}`,
      baixo: `d2:6 d2:2 a1:4 f#2:4 | c#2:6 c#2:2 a1:4 e2:4 | b1:6 b1:2 f#2:4 d2:4 | g1:6 g1:2 d2:4 b1:4 |
              d2:6 d2:2 a2:4 f#2:4 | a1:6 a1:2 e2:4 c#2:4 | g1:6 g1:2 d2:4 b1:4 | a1:6 a1:2 e2:4 c#2:4`,
    },
    B: {
      bateria: 'AC B B B B B B F', acordes: 'G | D/F# | Em | A | G | D | Em7 | A', inst: { melodia: 'metais', contra: 'cordas' },
      melodia: 'd6:4 b5:2 a5:2 g5:6 f#5:2 | f#5:8 a5:8 | g5:4 e5:4 b5:4 g5:4 | a5:12 r:4 | b5:4 d6:4 g6:4 f#6:2 e6:2 | f#6:8 d6:8 | e6:4 d6:2 b5:2 g5:4 b5:4 | a5:16',
      contra: 'b4:8 d5:8 | a4:8 d5:8 | g4:8 b4:8 | c#5:8 e5:8 | d5:8 g5:8 | f#5:8 a5:8 | g5:8 e5:8 | e5:8 c#5:8',
      baixo: 'g1:8 d2:8 | f#1:8 a1:8 | e2:8 b1:8 | a1:8 e2:8 | g1:8 b1:8 | d2:8 f#2:8 | e2:8 g2:8 | a1:8 a1:4 c#2:4',
    },
    C: {
      bateria: 'C C C C C C F C', acordes: 'Bm | G | D | A | Bm | G | A | D', inst: { contra: 'metais' },
      melodia: 'f#5:8 b5:8 | b5:6 a5:2 g5:8 | f#5:8 a5:8 | e5:16 | d5:4 f#5:4 b5:8 | d6:4 b5:4 g5:8 | a5:4 c#6:4 e6:8 | d6:16',
      contra: 'd5:16 | d5:16 | a4:16 | c#5:16 | f#4:16 | b4:16 | c#5:8 e5:8 | f#5:16',
      baixo: 'b1:16 | g1:16 | d2:16 | a1:16 | b1:8 f#1:8 | g1:8 d2:8 | a1:8 e2:8 | d2:16',
    },
  },
  ordem: ['A', 'B', 'C'],
};
