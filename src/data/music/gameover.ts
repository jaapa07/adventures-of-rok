/** Game Over — lamento curto em Ré menor (não repete). */
import type { Faixa } from './types';

export const gameover: Faixa = {
  id: 'gameover', nome: 'A Selva Espera', bpm: 72, tom: 'Ré menor', loop: false, reverb: 'gruta', envio: 0.45,
  inst: { melodia: 'flauta', contra: 'cordas', baixo: 'baixoSub', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 3 },
  vol: { melodia: 0.9, contra: 0.5, harmonia: 0.5, bateria: 0.6 },
  bateria: { G1: { surdo: 'X...............' }, G2: { surdo: 'X.......o.......' } },
  secoes: {
    A: {
      bateria: 'G1 G1 G2 G1 G1', acordes: 'Dm | Bb | Gm | A | Dm',
      melodia: 'a5:4 f5:4 d5:4 a4:4 | bb4:6 a4:2 g4:8 | g4:4 f4:4 e4:4 d4:4 | c#4:4 e4:4 a4:8 | d4:16',
      contra: 'd5:16 | f4:16 | d4:16 | e4:16 | a3:16',
      baixo: 'd2:16 | bb1:16 | g1:16 | a1:16 | d1:16',
    },
  },
  ordem: ['A'],
};
