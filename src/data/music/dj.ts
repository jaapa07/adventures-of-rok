/** Morcego DJ — batida 4/4 marcada a 120 BPM (a gag rítmica escuta `onBeat`), em Lá menor. */
import type { Faixa } from './types';

export const dj: Faixa = {
  id: 'dj', nome: 'Baile do Morcego', bpm: 120, tom: 'Lá menor', loop: true, reverb: 'gruta', envio: 0.2,
  inst: { melodia: 'lead', contra: 'sino', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.7, contra: 0.45, baixo: 0.95, harmonia: 0.35, bateria: 1 },
  bateria: {
    DJ1: { bumboDj: 'X...X...X...X...', palmas: '....x.......x...', chimbal: '..x...x...x...x.' },
    DJ2: { bumboDj: 'X...X...X...X...', palmas: '....x.......x...', chimbal: 'o.x.o.x.o.x.o.x.', aberto: '..x...x...x...x.' },
    DJS: { bumboDj: 'X...X...X...X...', scratch: '..x.....x.x.....', palmas: '....x.......x...' },
    DJB: { scratch: 'x.......x...x...', palmas: '....x.......x...' },
    DJF: { bumboDj: 'X...X...X...X...', palmas: '....x...x.x.xxxx', scratch: '............x...' },
  },
  secoes: {
    A: {
      bateria: 'DJ1 DJ1 DJ1 DJS DJ1 DJ1 DJ1 DJF', acordes: 'Am | Am | F | G | Am | Am | F | E',
      melodia: `- | - | - | - | a4:2 r:2 c5:2 r:2 e5:2 d5:2 c5:2 r:2 | a4:2 r:2 c5:2 r:2 g5:4 e5:4 |
                f5:2 r:2 a5:2 r:2 c6:2 a5:2 f5:2 r:2 | e5:2 r:2 g#5:2 r:2 b5:4 e5:4`,
      contra: 'r:12 e6:4 | - | r:12 c6:4 | r:12 d6:4 | r:12 e6:4 | - | r:12 a5:4 | r:12 b5:4',
      baixo: `r:2 a1:2 r:2 a1:2 r:2 a1:2 r:2 a2:2 | r:2 a1:2 r:2 a1:2 r:2 c2:2 r:2 e2:2 | r:2 f1:2 r:2 f1:2 r:2 f1:2 r:2 f2:2 | r:2 g1:2 r:2 g1:2 r:2 g1:2 r:2 b1:2 |
              r:2 a1:2 r:2 a2:2 r:2 a1:2 r:2 g1:2 | r:2 a1:2 r:2 a1:2 r:2 e2:2 r:2 a2:2 | r:2 f1:2 r:2 f2:2 r:2 f1:2 r:2 a1:2 | r:2 e1:2 r:2 e2:2 r:2 e1:2 r:2 g#1:2`,
    },
    B: {
      bateria: 'DJ2 DJ2 DJ2 DJS DJ2 DJ2 DJ2 DJF', acordes: 'Dm | Am | Dm | E | Dm | Am | F | E',
      melodia: `d5:2 f5:2 a5:2 f5:2 d6:4 a5:4 | c6:2 b5:2 a5:2 e5:2 c5:8 | d5:2 f5:2 a5:2 c6:2 d6:4 f6:4 | e6:4 d6:2 b5:2 g#5:8 |
                f5:2 a5:2 d6:2 a5:2 f5:4 d5:4 | e5:2 a5:2 c6:2 a5:2 e5:4 c5:4 | a5:2 c6:2 f6:2 c6:2 a5:4 f5:4 | g#5:2 b5:2 e6:2 b5:2 g#5:4 e5:4`,
      contra: 'f5:16 | e5:16 | f5:16 | g#5:16 | a5:16 | c6:16 | c6:16 | b5:16',
      baixo: `r:2 d2:2 r:2 d2:2 r:2 d2:2 r:2 f2:2 | r:2 a1:2 r:2 a1:2 r:2 a1:2 r:2 c2:2 | r:2 d2:2 r:2 d2:2 r:2 f2:2 r:2 a2:2 | r:2 e2:2 r:2 e2:2 r:2 g#1:2 r:2 b1:2 |
              r:2 d2:2 r:2 d3:2 r:2 d2:2 r:2 c2:2 | r:2 a1:2 r:2 a2:2 r:2 a1:2 r:2 g1:2 | r:2 f1:2 r:2 f2:2 r:2 f1:2 r:2 e1:2 | r:2 e1:2 r:2 e2:2 r:2 b1:2 r:2 g#1:2`,
    },
    C: {
      bateria: 'DJB DJB DJB DJF DJB DJB DJS DJF', acordes: 'Am | Am | Am | Am | F | F | E | E',
      melodia: 'r:8 e5:2 e5:2 a5:4 | - | r:8 g5:2 g5:2 c6:4 | - | r:8 f5:2 f5:2 a5:4 | - | r:8 e5:2 e5:2 g#5:4 | b5:4 g#5:4 e5:4 b4:4',
      contra: 'a5:16 | c6:16 | e6:16 | c6:16 | a5:16 | c6:16 | b5:16 | g#5:16',
      baixo: 'a1:4 r:12 | a1:4 r:12 | a1:4 r:4 a1:4 r:4 | a1:4 a1:4 a1:4 a1:4 | f1:4 r:12 | f1:4 r:4 f1:4 r:4 | e1:4 r:12 | e1:4 e1:4 e2:4 e1:4',
    },
    D: {
      bateria: 'DJ2 DJ2 DJ2 DJS DJ2 DJ2 DJS DJF', acordes: 'Am | F | C | G | Am | F | G | E',
      melodia: `a5:2 a5:2 r:2 c6:2 r:2 b5:2 a5:2 g5:2 | a5:2 a5:2 r:2 f5:2 r:2 a5:2 c6:4 | g5:2 g5:2 r:2 e5:2 r:2 g5:2 c6:2 e6:2 | d6:2 d6:2 r:2 b5:2 r:2 g5:2 d5:4 |
                a5:2 a5:2 r:2 c6:2 r:2 e6:2 d6:2 c6:2 | c6:2 c6:2 r:2 a5:2 r:2 f5:2 a5:4 | b5:2 b5:2 r:2 d6:2 r:2 b5:2 g5:4 | g#5:4 b5:4 e6:8`,
      contra: 'e6:8 c6:8 | c6:8 a5:8 | e6:8 g6:8 | d6:8 b5:8 | e6:8 a6:8 | f6:8 c6:8 | d6:8 g6:8 | e6:16',
      baixo: `a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 a1:2 a2:2 | f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 f1:2 f2:2 | c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 c2:2 c3:2 | g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 g1:2 g2:2 |
              a1:2 a2:2 a1:2 a2:2 c2:2 c3:2 e2:2 e3:2 | f1:2 f2:2 f1:2 f2:2 a1:2 a2:2 c2:2 c3:2 | g1:2 g2:2 g1:2 g2:2 b1:2 b2:2 d2:2 d3:2 | e1:2 e2:2 e1:2 e2:2 g#1:2 g#2:2 b1:2 b2:2`,
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};
