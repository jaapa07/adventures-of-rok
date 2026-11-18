/** Chefe — tensão em Dó menor com ostinato rápido de cordas, metais graves e bateria em marcha. */
import type { Faixa } from './types';

export const chefe: Faixa = {
  id: 'chefe', nome: 'Máquina de Desmatar', bpm: 150, tom: 'Dó menor', loop: true, reverb: 'seco', envio: 0.2,
  inst: { melodia: 'metais', contra: 'cordas', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 3 },
  vol: { melodia: 1, contra: 0.6, baixo: 0.9, harmonia: 0.35, bateria: 0.9 },
  bateria: {
    X1: { bumbo: 'X.x...x.X.x...x.', caixa: '....X.......X...', chimbal: 'x.x.x.x.x.x.x.x.', tom: '..............xx' },
    X2: { bumbo: 'X.x.x.x.X.x.x.x.', caixa: '....X..x....X...', chimbal: 'xxxxxxxxxxxxxxxx', prato: 'X...............' },
    X3: { bumbo: 'X.........x.....', caixa: '........X.......', surdo: 'x...x...x...x...', aberto: '..x...x...x...x.' },
    X4: { bumbo: 'X.X.X.X.X.X.X.X.', caixa: '....X.......X.xx', metal: 'x...x...x...x...', chimbal: 'xxxxxxxxxxxxxxxx' },
    XF: { bumbo: 'X.......X.......', tom: '....xx.xxx.xxxXX', caixa: '............XXXX' },
  },
  secoes: {
    A: {
      bateria: 'X1 X1 X1 X1 X1 X1 X1 XF', acordes: 'Cm | Cm | Ab | Ab | Fm | Fm | G | G',
      melodia: 'c4:8 r:4 g4:4 | eb4:6 d4:2 c4:8 | ab3:8 r:4 eb4:4 | c4:6 db4:2 eb4:8 | f4:8 r:4 ab4:4 | g4:6 f4:2 eb4:8 | d4:8 g4:8 | b4:12 r:4',
      contra: `c5:2 g4:2 eb5:2 g4:2 c5:2 g4:2 eb5:2 g4:2 | c5:2 g4:2 eb5:2 g4:2 d5:2 g4:2 f5:2 g4:2 |
               c5:2 ab4:2 eb5:2 ab4:2 c5:2 ab4:2 eb5:2 ab4:2 | c5:2 ab4:2 eb5:2 ab4:2 f5:2 ab4:2 eb5:2 ab4:2 |
               c5:2 f4:2 ab4:2 f4:2 c5:2 f4:2 ab4:2 f4:2 | c5:2 f4:2 ab4:2 f4:2 db5:2 f4:2 ab4:2 f4:2 |
               b4:2 g4:2 d5:2 g4:2 b4:2 g4:2 d5:2 g4:2 | b4:2 g4:2 d5:2 g4:2 f5:2 d5:2 b4:2 g4:2`,
      baixo: `c2:2 c2:2 r:2 c2:2 c2:2 r:2 c2:2 eb2:2 | c2:2 c2:2 r:2 c2:2 c2:2 r:2 g1:2 bb1:2 |
              ab1:2 ab1:2 r:2 ab1:2 ab1:2 r:2 ab1:2 c2:2 | ab1:2 ab1:2 r:2 ab1:2 ab1:2 r:2 eb2:2 c2:2 |
              f1:2 f1:2 r:2 f1:2 f1:2 r:2 f1:2 ab1:2 | f1:2 f1:2 r:2 f1:2 f1:2 r:2 c2:2 ab1:2 |
              g1:2 g1:2 r:2 g1:2 g1:2 r:2 g1:2 b1:2 | g1:2 g1:2 r:2 g1:2 d2:2 g1:2 b1:2 d2:2`,
    },
    B: {
      bateria: 'X2 X1 X1 X1 X2 X1 X1 XF', acordes: 'Cm | Bb | Ab | G | Cm | Bb | Ab | G',
      melodia: `g4:4 c5:4 eb5:4 d5:4 | d5:4 bb4:4 f4:8 | eb5:4 c5:4 ab4:4 c5:4 | b4:8 d5:4 g4:4 |
                c5:2 d5:2 eb5:4 g5:4 f5:2 eb5:2 | d5:2 c5:2 bb4:4 d5:4 f5:4 | eb5:2 d5:2 c5:4 ab4:4 c5:4 | b4:4 g4:4 d5:4 f5:4`,
      contra: `c5:2 eb5:2 g5:2 eb5:2 c5:2 eb5:2 g5:2 eb5:2 | bb4:2 d5:2 f5:2 d5:2 bb4:2 d5:2 f5:2 d5:2 |
               ab4:2 c5:2 eb5:2 c5:2 ab4:2 c5:2 eb5:2 c5:2 | g4:2 b4:2 d5:2 b4:2 g4:2 b4:2 d5:2 f5:2 |
               c5:2 eb5:2 g5:2 c6:2 g5:2 eb5:2 c5:2 eb5:2 | bb4:2 d5:2 f5:2 bb5:2 f5:2 d5:2 bb4:2 d5:2 |
               ab4:2 c5:2 eb5:2 ab5:2 eb5:2 c5:2 ab4:2 c5:2 | g4:2 b4:2 d5:2 g5:2 f5:2 d5:2 b4:2 g4:2`,
      baixo: `c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 |
              ab1:2 ab2:2 ab1:2 ab2:2 ab1:2 ab2:2 ab1:2 ab2:2 | g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 |
              c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 | bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 bb1:2 bb2:2 |
              ab1:2 ab2:2 ab1:2 ab2:2 ab1:2 ab2:2 ab1:2 ab2:2 | g1:2 g2:2 g1:2 g2:2 b1:2 b2:2 d2:2 d3:2`,
    },
    C: {
      bateria: 'X3 X3 X3 X3 X3 X3 X3 XF', acordes: 'Fm | Fm | Cm | Cm | Db | Db | G | G', inst: { melodia: 'cordas', contra: 'metais' },
      melodia: 'f5:8 ab5:8 | g5:6 f5:2 eb5:8 | eb5:8 g5:8 | f5:6 eb5:2 d5:8 | db5:8 f5:8 | ab5:6 g5:2 f5:8 | g5:8 b5:8 | d6:8 b5:8',
      contra: `f4:2 r:6 f4:2 r:2 f4:2 r:2 | f4:2 r:6 ab4:2 r:2 c5:2 r:2 | eb4:2 r:6 eb4:2 r:2 eb4:2 r:2 | eb4:2 r:6 g4:2 r:2 c5:2 r:2 |
               db4:2 r:6 db4:2 r:2 db4:2 r:2 | db4:2 r:6 f4:2 r:2 ab4:2 r:2 | d4:2 r:6 d4:2 r:2 d4:2 r:2 | d4:2 r:6 g4:2 r:2 b4:2 r:2`,
      baixo: 'f1:8 f1:4 f1:4 | f1:8 c2:4 ab1:4 | c2:8 c2:4 c2:4 | c2:8 g1:4 eb1:4 | db2:8 db2:4 db2:4 | db2:8 ab1:4 f1:4 | g1:8 g1:4 g1:4 | g1:8 d2:4 b1:4',
    },
    D: {
      bateria: 'X4 X4 X4 X4 X4 X4 X4 XF', acordes: 'Cm | Cm | Db | Db | Bb | Bb | G | G',
      melodia: `c5:2 r:2 c5:2 r:2 eb5:4 g5:4 | f5:2 r:2 eb5:2 r:2 d5:4 c5:4 | db5:2 r:2 db5:2 r:2 f5:4 ab5:4 | g5:2 r:2 f5:2 r:2 eb5:4 db5:4 |
                bb4:2 r:2 bb4:2 r:2 d5:4 f5:4 | eb5:2 r:2 d5:2 r:2 c5:4 bb4:4 | b4:2 r:2 b4:2 r:2 d5:4 f5:4 | g5:8 f5:4 d5:4`,
      contra: `c5:2 b4:2 c5:2 b4:2 c5:2 b4:2 c5:2 d5:2 | eb5:2 d5:2 eb5:2 d5:2 c5:2 b4:2 c5:2 g4:2 |
               db5:2 c5:2 db5:2 c5:2 db5:2 c5:2 db5:2 eb5:2 | f5:2 eb5:2 f5:2 eb5:2 db5:2 c5:2 db5:2 ab4:2 |
               bb4:2 a4:2 bb4:2 a4:2 bb4:2 a4:2 bb4:2 c5:2 | d5:2 c5:2 d5:2 c5:2 bb4:2 a4:2 bb4:2 f4:2 |
               b4:2 bb4:2 b4:2 bb4:2 b4:2 c5:2 d5:2 f5:2 | g5:2 f5:2 d5:2 b4:2 g4:2 f4:2 d4:2 b3:2`,
      baixo: `c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 c2:2 | c2:2 c2:2 c2:2 c2:2 g1:2 g1:2 g1:2 g1:2 |
              db2:2 db2:2 db2:2 db2:2 db2:2 db2:2 db2:2 db2:2 | db2:2 db2:2 db2:2 db2:2 ab1:2 ab1:2 ab1:2 ab1:2 |
              bb1:2 bb1:2 bb1:2 bb1:2 bb1:2 bb1:2 bb1:2 bb1:2 | bb1:2 bb1:2 bb1:2 bb1:2 f1:2 f1:2 f1:2 f1:2 |
              g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 | g1:2 g1:2 g1:2 g1:2 d2:2 d2:2 b1:2 b1:2`,
    },
    E: {
      bateria: 'X2 X1', acordes: 'Ab | Fm | Cm | G | Ab | Fm | Db | G', inst: { melodia: 'cordas', contra: 'metais' },
      melodia: 'c6:6 bb5:2 ab5:8 | ab5:6 g5:2 f5:8 | g5:4 eb5:4 c5:8 | d5:4 b4:4 g4:8 | c5:4 eb5:4 ab5:8 | g5:4 f5:4 c6:8 | db6:4 c6:4 ab5:8 | b5:8 d6:8',
      contra: 'eb4:16 | c4:16 | eb4:16 | d4:16 | ab4:16 | f4:16 | f4:16 | g4:8 f4:8',
      baixo: `ab1:2 ab1:2 ab2:2 ab1:2 ab1:2 ab1:2 ab2:2 ab1:2 | f1:2 f1:2 f2:2 f1:2 f1:2 f1:2 f2:2 f1:2 |
              c2:2 c2:2 c3:2 c2:2 c2:2 c2:2 c3:2 c2:2 | g1:2 g1:2 g2:2 g1:2 g1:2 g1:2 g2:2 g1:2 |
              ab1:2 ab1:2 ab2:2 ab1:2 ab1:2 ab1:2 ab2:2 ab1:2 | f1:2 f1:2 f2:2 f1:2 f1:2 f1:2 f2:2 f1:2 |
              db2:2 db2:2 db3:2 db2:2 db2:2 db2:2 db3:2 db2:2 | g1:2 g1:2 g2:2 g1:2 d2:2 g1:2 b1:2 d2:2`,
    },
    F: {
      bateria: 'X1 X1 X1 X1 X2 X2 XF XF', acordes: 'Cm | G | Cm | G | Ab | Bb | G | G',
      melodia: 'c5:4 eb5:4 g5:4 c6:4 | b5:4 g5:4 d5:4 b4:4 | c5:4 g5:4 eb5:4 c5:4 | d5:4 f5:4 b4:4 g4:4 | ab4:4 c5:4 eb5:4 ab5:4 | bb5:4 f5:4 d5:4 bb4:4 | b4:16 | _:8 r:8',
      contra: `c5:2 g4:2 c5:2 g4:2 eb5:2 g4:2 c5:2 g4:2 | d5:2 g4:2 d5:2 g4:2 f5:2 g4:2 d5:2 g4:2 |
               eb5:2 c5:2 g4:2 c5:2 eb5:2 c5:2 g4:2 c5:2 | f5:2 d5:2 b4:2 d5:2 f5:2 d5:2 b4:2 d5:2 |
               eb5:2 c5:2 ab4:2 c5:2 eb5:2 c5:2 ab4:2 c5:2 | f5:2 d5:2 bb4:2 d5:2 f5:2 d5:2 bb4:2 d5:2 |
               g5:2 d5:2 b4:2 g4:2 g5:2 d5:2 b4:2 g4:2 | f5:2 d5:2 b4:2 g4:2 f4:2 d4:2 b3:2 g3:2`,
      baixo: `c2:4 c2:4 c2:4 c2:4 | g1:4 g1:4 g1:4 g1:4 | c2:4 c3:4 c2:4 c3:4 | g1:4 g2:4 g1:4 g2:4 |
              ab1:4 ab2:4 ab1:4 ab2:4 | bb1:4 bb2:4 bb1:4 bb2:4 | g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 g1:2 | g1:4 r:4 g1:2 g1:2 g1:4`,
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E', 'F'],
};
