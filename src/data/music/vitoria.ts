/** Vitória — fanfarra curta de fim de fase (não repete). */
import type { Faixa } from './types';

export const vitoria: Faixa = {
  id: 'vitoria', nome: 'Totem Alcançado', bpm: 132, tom: 'Dó maior', loop: false, reverb: 'copa', envio: 0.35,
  inst: { melodia: 'metais', contra: 'marimba', baixo: 'baixo', harmonia: 'cordas' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.7, harmonia: 0.35 },
  bateria: {
    V1: { bumbo: 'X.......X.......', caixa: '....x.......x.xx', prato: 'X...............' },
    VF: { bumbo: 'X...............', prato: 'X...............', caixa: 'XXXX............' },
  },
  secoes: {
    A: {
      bateria: 'V1 V1 V1 VF', acordes: 'C | F | G | C',
      melodia: 'g4:2 c5:2 e5:2 g5:2 c6:4 g5:2 c6:2 | a5:2 c6:2 f6:4 e6:2 d6:2 c6:4 | b5:2 d6:2 g6:4 f6:2 d6:2 b5:4 | c6:16',
      contra: 'e5:2 g5:2 c6:2 e6:2 g5:4 e5:4 | f5:2 a5:2 c6:2 f6:2 c6:4 a5:4 | g5:2 b5:2 d6:2 g6:2 d6:4 b5:4 | c6:2 e6:2 g6:2 c7:2 r:8',
      baixo: 'c2:4 g1:4 c2:4 e2:4 | f1:4 c2:4 f2:4 a1:4 | g1:4 d2:4 g2:4 b1:4 | c2:8 r:8',
    },
  },
  ordem: ['A'],
};
