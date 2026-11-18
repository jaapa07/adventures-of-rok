/** Grutas Âmbar — ambiente atmosférico em Mi menor: pads longos, gotas em ritmo e baixo profundo. */
import type { Faixa } from './types';

export const gruta: Faixa = {
  id: 'gruta', nome: 'Lamparinas no Escuro', bpm: 66, tom: 'Mi menor', loop: true, reverb: 'gruta', envio: 0.55,
  eco: { passos: 6, fb: 0.35, mix: 0.3 },
  inst: { melodia: 'sino', contra: 'cordas', baixo: 'baixoSub', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 3 },
  vol: { melodia: 0.75, contra: 0.4, baixo: 0.9, harmonia: 0.6, bateria: 0.7 },
  bateria: {
    D1: { gota: 'x.....o...x.....' },
    D2: { gota: 'x.....o...x...o.', surdo: 'o...............' },
    D3: { gota: 'x..o..o...x..o..', chimbal: '....o.......o...' },
    D4: { gota: 'X.o...o.x.o...o.', surdo: 'x.......o.......', aro: '....o.......o...' },
  },
  secoes: {
    A: {
      bateria: 'D1 D1 D2 D1 D2 D1 D2 D3', acordes: 'Em | Em | Cmaj7 | Cmaj7 | Am7 | Am7 | Bsus4 | B',
      melodia: 'r:8 b4:8 | g5:12 r:4 | r:4 e5:4 b5:8 | g5:16 | r:8 c6:4 a5:4 | e5:16 | r:4 f#5:4 e5:8 | d#5:16',
      contra: 'e4:16 | f#4:16 | g4:16 | e4:16 | a4:16 | c5:16 | b4:16 | a4:8 f#4:8',
      baixo: 'e1:16 | e1:16 | c2:16 | c2:16 | a1:16 | a1:16 | b1:16 | b1:16',
    },
    B: {
      bateria: 'D3 D2 D3 D2 D3 D2 D3 D4', acordes: 'Em | D | Cmaj7 | B7 | Em | D | Am7 | B7',
      melodia: 'e5:4 g5:4 b5:8 | a5:4 f#5:4 d5:8 | e5:4 g5:4 b5:4 c6:4 | b5:8 a5:4 f#5:4 | g5:4 b5:4 e6:8 | d6:8 a5:8 | c6:4 b5:4 a5:4 e5:4 | d#5:8 f#5:8',
      contra: 'b3:16 | a3:16 | g3:16 | f#3:16 | b3:16 | a3:16 | c4:16 | d#4:16',
      baixo: 'e1:8 e2:8 | d2:8 a1:8 | c2:8 g1:8 | b1:8 f#1:8 | e1:8 b1:8 | d2:8 a1:8 | a1:8 e1:8 | b1:12 f#1:4',
    },
    C: {
      bateria: 'D1 D1 D1 D2 D1 D1 D1 D2', acordes: 'Am | Am | Em | Em | F | F | B | B', inst: { melodia: 'flauta', contra: 'sino' },
      melodia: 'a4:8 c5:8 | e5:12 d5:4 | b4:16 | r:8 g4:4 b4:4 | c5:8 a4:8 | f4:16 | f#4:8 a4:8 | b4:16',
      contra: 'r:12 e6:4 | - | r:12 b5:4 | - | r:12 c6:4 | - | r:12 d#6:4 | -',
      baixo: 'a1:16 | a1:8 e1:8 | e1:16 | e1:8 b1:8 | f1:16 | f1:8 c2:8 | b1:16 | b1:8 f#1:8',
    },
    D: {
      bateria: 'D4 D3 D4 D3 D4 D3 D4 D4', acordes: 'Em | Em | G | G | C | C | D | B7',
      melodia: 'e5:2 r:6 b5:2 r:6 | g5:2 r:6 e6:2 r:6 | d5:2 r:6 b5:2 r:6 | g5:2 r:6 d6:2 r:6 | e5:2 r:6 c6:2 r:6 | g5:2 r:6 e6:2 r:6 | f#5:2 r:6 d6:2 r:6 | d#6:2 r:6 b5:2 r:6',
      contra: 'g4:16 | b4:16 | b4:16 | d5:16 | c5:16 | e5:16 | a4:16 | f#4:16',
      baixo: `e1:4 r:4 e1:2 g1:2 b1:4 | e1:4 r:4 e1:2 b1:2 e2:4 | g1:4 r:4 g1:2 b1:2 d2:4 | g1:4 r:4 g1:2 d2:2 g2:4 |
              c2:4 r:4 c2:2 e2:2 g2:4 | c2:4 r:4 c2:2 g1:2 e1:4 | d2:4 r:4 d2:2 f#2:4 a1:2 | b1:4 r:4 b1:2 d#2:2 f#2:4`,
    },
    E: {
      bateria: 'D3', acordes: 'Cmaj7 | G | D | Em | Cmaj7 | G | Am7 | B', inst: { contra: 'flauta' },
      melodia: 'e5:6 g5:2 b5:8 | d6:6 b5:2 g5:8 | f#5:6 a5:2 d6:8 | b5:16 | c6:6 b5:2 g5:8 | d5:6 g5:2 b5:8 | c6:4 e6:4 g5:8 | f#5:8 d#5:8',
      contra: 'g4:16 | g4:8 b4:8 | a4:16 | g4:8 e4:8 | e4:16 | d4:8 g4:8 | e4:8 a4:8 | b4:16',
      baixo: 'c2:16 | g1:16 | d2:16 | e1:16 | c2:8 g1:8 | g1:8 d2:8 | a1:8 e1:8 | b1:8 f#1:8',
    },
    F: {
      bateria: 'D2 D1 D2 D1 D2 D1 D3 D4', acordes: 'Em | Cmaj7 | Am7 | B7 | Em | Cmaj7 | Bsus4 | B',
      melodia: 'r:4 b5:4 g5:4 e5:4 | r:4 b5:4 g5:4 c6:4 | r:4 a5:4 e5:4 c5:4 | b4:4 d#5:4 f#5:4 a5:4 | g5:16 | e5:16 | e5:8 f#5:8 | d#5:16',
      contra: 'e4:16 | e4:16 | e4:16 | d#4:16 | b3:16 | c4:16 | b3:16 | b3:8 a3:8',
      baixo: 'e1:16 | c2:16 | a1:16 | b1:16 | e1:16 | c2:16 | b1:16 | b1:16',
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E', 'F'],
};
