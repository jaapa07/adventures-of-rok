/** Recife Bromélia — aquático e etéreo em Ré lídio: arpejos lentos com eco e pads brilhantes. */
import type { Faixa } from './types';

export const recife: Faixa = {
  id: 'recife', nome: 'Jardim de Bromélias', bpm: 76, tom: 'Ré lídio', loop: true, reverb: 'recife', envio: 0.5,
  eco: { passos: 6, fb: 0.45, mix: 0.35 },
  inst: { melodia: 'flauta', contra: 'padBrilho', baixo: 'baixoSub', harmonia: 'kalimba' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1, 2, 4], passo: 2, oitava: 4 },
  vol: { melodia: 0.8, contra: 0.55, baixo: 0.75, harmonia: 0.35, bateria: 0.45 },
  bateria: {
    W1: { ganza: 'o.o.o.o.o.o.o.o.' },
    W2: { ganza: 'o.o.o.o.o.o.o.o.', gota: '......x.......o.' },
    W3: { aro: '....o.......o...', ganza: 'oxo.oxo.oxo.oxo.', bumbo: 'o.......o.......' },
    W4: { bumbo: 'x.......o.......', aro: '....o.......o...', ganza: 'oxo.oxo.oxo.oxo.', gota: '..o.......x.....' },
  },
  secoes: {
    A: {
      bateria: 'W1 W1 W2 W1 W1 W2 W1 W2', acordes: 'Dmaj7 | E/D | Dmaj7 | E | Bm7 | A | Gmaj7 | A',
      melodia: 'f#5:8 a5:8 | g#5:12 e5:4 | a5:6 c#6:2 _:8 | b5:16 | d6:8 c#6:4 b5:4 | a5:12 e5:4 | f#5:8 b5:8 | a5:16',
      contra: 'a4:16 | b4:16 | c#5:16 | g#4:16 | f#4:16 | e4:16 | d4:16 | c#4:16',
      baixo: 'd2:16 | d2:16 | d2:16 | e2:16 | b1:16 | a1:16 | g1:16 | a1:16',
    },
    B: {
      bateria: 'W2', acordes: 'Gmaj7 | A | F#m7 | Bm7 | Em7 | A | Dmaj7 | E',
      melodia: 'b5:4 a5:4 f#5:8 | e5:4 c#6:4 a5:8 | c#6:6 a5:2 f#5:8 | d6:4 c#6:4 b5:8 | g5:6 b5:2 d6:8 | c#6:16 | a5:4 c#6:4 f#6:8 | e6:8 g#5:8',
      contra: 'd5:16 | c#5:16 | a4:16 | f#4:16 | e4:8 g4:8 | e4:16 | f#4:16 | e4:8 b4:8',
      baixo: 'g1:16 | a1:16 | f#1:16 | b1:16 | e1:16 | a1:16 | d2:16 | e2:16',
    },
    C: {
      bateria: 'W1', acordes: 'Bm | Bm | G | G | D | D | A | A', inst: { melodia: 'sino' },
      melodia: 'f#5:4 r:4 b5:4 d6:4 | c#6:12 r:4 | b5:4 r:4 g5:4 d6:4 | f#6:12 r:4 | e6:4 r:4 d6:4 a5:4 | f#5:12 r:4 | e5:4 r:4 a5:4 c#6:4 | e6:12 r:4',
      contra: 'b3:16 | d4:16 | g3:16 | b3:16 | d4:16 | f#4:16 | a3:16 | c#4:16',
      baixo: 'b1:16 | b1:8 f#1:8 | g1:16 | g1:8 d2:8 | d2:16 | d2:8 a1:8 | a1:16 | a1:8 e1:8',
    },
    D: {
      bateria: 'W3 W4', acordes: 'Dmaj7 | Bm7 | Gmaj7 | A | Dmaj7 | Bm7 | Em7 | A',
      melodia: `a5:2 f#5:2 d5:2 f#5:2 a5:4 c#6:4 | d6:2 b5:2 f#5:2 d5:2 b4:8 | b4:2 d5:2 f#5:2 a5:2 b5:8 | c#6:2 b5:2 a5:2 e5:2 c#5:8 |
                d5:2 f#5:2 a5:2 c#6:2 e6:8 | d6:2 c#6:2 b5:2 f#5:2 d5:8 | e5:2 g5:2 b5:2 d6:2 e6:8 | c#6:8 a5:8`,
      contra: 'f#4:16 | d4:16 | b3:16 | c#4:16 | a4:16 | f#4:16 | g4:16 | e4:16',
      baixo: 'd2:8 a1:8 | b1:8 f#1:8 | g1:8 d2:8 | a1:8 e2:8 | d2:8 f#2:8 | b1:8 d2:8 | e2:8 b1:8 | a1:8 c#2:8',
    },
    E: {
      bateria: 'W2 W1', acordes: 'D | E/D | D | E/D | Bm | C#m | D | E', inst: { melodia: 'sino' },
      melodia: 'd6:8 a5:8 | g#5:8 b5:8 | f#5:8 d6:8 | e6:16 | d6:8 b5:8 | g#5:8 c#6:8 | a5:8 f#5:8 | g#5:8 b5:8',
      contra: 'a4:16 | g#4:16 | a4:8 f#4:8 | g#4:8 b4:8 | f#4:16 | e4:16 | f#4:16 | g#4:16',
      baixo: 'd2:16 | d2:8 a1:8 | d2:8 f#1:8 | d2:8 e1:8 | b1:16 | c#2:16 | d2:16 | e2:16',
    },
    F: {
      bateria: 'W3 W4 W3 W4 W2 W2 W1 W1', acordes: 'Gmaj7 | Gmaj7 | F#m7 | F#m7 | Em7 | Em7 | A | A',
      melodia: 'd6:6 b5:2 f#5:8 | g5:4 a5:4 b5:8 | c#6:6 a5:2 e5:8 | f#5:4 g#5:4 a5:8 | b5:6 g5:2 e5:8 | d5:4 e5:4 g5:8 | a5:16 | _:8 r:8',
      contra: 'b4:16 | d5:16 | a4:16 | c#5:16 | g4:16 | b4:16 | e4:8 g4:8 | c#4:16',
      baixo: 'g1:16 | g1:8 d2:8 | f#1:16 | f#1:8 c#2:8 | e1:16 | e1:8 b1:8 | a1:16 | a1:8 e1:8',
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E', 'F'],
};
