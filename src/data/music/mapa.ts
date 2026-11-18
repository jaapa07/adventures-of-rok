/** Mapa da Ilha — valsa calma em Sol maior: flauta de bambu, kalimba em cânone e baixo suave. */
import type { Faixa } from './types';

export const mapa: Faixa = {
  id: 'mapa', nome: 'Trilhas da Ilha', bpm: 84, tom: 'Sol maior', passos: 12, loop: true, reverb: 'mata', envio: 0.4,
  inst: { melodia: 'flauta', contra: 'kalimba', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.95, contra: 0.7, baixo: 0.6, harmonia: 0.35, bateria: 0.5 },
  bateria: {
    S: { ganza: 'x.o.x.o.x.o.' },
    S2: { ganza: 'x.o.x.o.x.o.', aro: '....o.......', bumbo: 'o...........' },
    S3: { ganza: 'x.o.x.o.x.o.', bumbo: 'o...........', caxixi: '....x...x...' },
  },
  secoes: {
    A: {
      bateria: 'S S S S2', acordes: 'G | Em | C | D | G | Em | Am | D',
      melodia: 'd5:4 g5:4 a5:4 | b5:8 a5:2 g5:2 | e5:4 g5:4 e5:4 | d5:12 | d5:4 g5:4 b5:4 | d6:8 b5:2 a5:2 | c6:4 b5:2 a5:2 e5:4 | a5:8 r:4',
      contra: `g3:4 d4:2 b4:2 d4:4 | e3:4 b3:2 g4:2 b3:4 | c4:4 g4:2 e4:2 g4:4 | d4:4 a4:2 f#4:2 a4:2 d5:2 |
               g3:4 b3:2 d4:2 g4:4 | e4:4 g4:2 b4:2 e5:4 | a3:4 e4:2 a4:2 c5:4 | d4:2 f#4:2 a4:2 c5:2 a4:2 f#4:2`,
      baixo: 'g2:12 | e2:12 | c2:12 | d2:12 | g2:8 b1:4 | e2:8 d2:4 | a1:12 | d2:8 f#2:4',
    },
    B: {
      bateria: 'S2 S S2 S S2 S S2 S3', acordes: 'C | D | Bm | Em | Am | D | G | G',
      melodia: 'e6:6 d6:2 c6:4 | d6:4 a5:4 f#5:4 | b5:6 a5:2 f#5:4 | e5:12 | e5:4 a5:4 c6:4 | b5:4 a5:4 f#5:4 | g5:12 | _:8 d5:4',
      contra: `c4:2 g4:2 e5:4 g4:4 | d4:2 a4:2 f#5:4 a4:4 | b3:2 f#4:2 d5:4 f#4:4 | e4:2 b4:2 g5:4 b4:4 |
               a3:2 e4:2 c5:4 e4:4 | d4:2 a4:2 c5:4 a4:4 | g3:2 d4:2 b4:4 d4:4 | g4:2 b4:2 d5:2 g5:2 d5:2 b4:2`,
      baixo: 'c2:12 | d2:12 | b1:12 | e2:12 | a1:12 | d2:12 | g1:8 d2:4 | g1:8 b1:4',
    },
    A2: {
      bateria: 'S3 S S2 S S3 S S2 S3', acordes: 'G | Em | C | D | G | Em | Am7 | D',
      melodia: 'd5:2 e5:2 g5:4 a5:4 | b5:4 d6:4 b5:2 a5:2 | g5:4 e5:4 c5:4 | d5:8 e5:2 f#5:2 | g5:4 b5:4 d6:4 | e6:6 d6:2 b5:4 | c6:4 a5:4 e5:2 g5:2 | a5:8 b5:2 a5:2',
      contra: 'b4:12 | g4:12 | e4:8 g4:4 | f#4:12 | b4:8 d5:4 | g4:12 | e4:8 c5:4 | f#4:8 d4:4',
      baixo: 'g2:4 d2:4 g2:4 | e2:4 b1:4 e2:4 | c2:4 g1:4 c2:4 | d2:4 a1:4 d2:4 | g2:4 d2:4 b1:4 | e2:4 b1:4 g1:4 | a1:4 e2:4 a2:4 | d2:4 a1:4 f#1:4',
    },
    C: {
      bateria: 'S', acordes: 'Am | F | C | G | F | C | Dm | D',
      melodia: 'a4:4 c5:4 e5:4 | f5:8 e5:2 d5:2 | e5:4 c5:4 g4:4 | d5:12 | c5:4 f5:4 a5:4 | g5:8 e5:4 | f5:4 e5:4 d5:4 | f#5:8 a5:4',
      contra: 'a3:4 e4:4 a4:4 | f3:4 c4:4 a4:4 | c4:4 g4:4 c5:4 | g3:4 d4:4 b4:4 | f3:4 a3:4 c4:4 | c4:4 e4:4 g4:4 | d4:4 f4:4 a4:4 | d4:4 f#4:4 a4:4',
      baixo: 'a1:12 | f1:12 | c2:12 | g1:12 | f1:12 | c2:12 | d2:12 | d2:8 c2:4',
    },
    D: {
      bateria: 'S2 S S2 S S2 S S2 S3', acordes: 'G | C | G | D | Em | C | Am | D',
      melodia: 'g5:2 a5:2 b5:2 a5:2 g5:4 | e5:2 g5:2 c6:4 b5:4 | d6:2 b5:2 g5:4 d5:4 | f#5:2 g5:2 a5:8 | b5:2 a5:2 g5:2 e5:2 b4:4 | c5:2 e5:2 g5:4 c6:4 | b5:2 a5:2 e5:4 c5:4 | d5:12',
      // cânone: a kalimba repete a frase da flauta um compasso depois, uma oitava abaixo
      contra: 'd5:4 r:8 | g4:2 a4:2 b4:2 a4:2 g4:4 | e4:2 g4:2 c5:4 b4:4 | d5:2 b4:2 g4:4 d4:4 | f#4:2 g4:2 a4:8 | b4:2 a4:2 g4:2 e4:2 b3:4 | c4:2 e4:2 g4:4 c5:4 | b4:2 a4:2 e4:4 c4:4',
      baixo: 'g2:8 d2:4 | c2:8 g1:4 | g2:8 b1:4 | d2:8 a1:4 | e2:8 b1:4 | c2:8 e2:4 | a1:8 c2:4 | d2:8 f#2:4',
    },
    E: {
      bateria: 'S S S S2 S S S2 S3', acordes: 'C | G/B | Am | Em | F | C | D | D',
      melodia: 'e5:4 g5:4 c6:4 | b5:8 g5:4 | a5:4 c6:4 e6:4 | b5:12 | a5:4 f5:4 c5:4 | e5:4 g5:4 c6:4 | a5:8 f#5:4 | d5:8 r:4',
      contra: 'c4:12 | b3:12 | a3:12 | g3:12 | f3:12 | e3:12 | d4:6 f#4:6 | a4:6 d5:6',
      baixo: 'c2:12 | b1:12 | a1:12 | e2:12 | f1:12 | c2:12 | d2:12 | d2:4 a1:4 d2:4',
    },
  },
  ordem: ['A', 'B', 'A2', 'C', 'D', 'E'],
};
