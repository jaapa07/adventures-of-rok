/** Créditos — bossa leve em Fá maior; cada seção apresenta um instrumento da trilha. */
import type { Faixa } from './types';

export const creditos: Faixa = {
  id: 'creditos', nome: 'Obrigado, Selva', bpm: 100, tom: 'Fá maior', swing: 0.1, loop: true, reverb: 'mata', envio: 0.3,
  inst: { melodia: 'marimba', contra: 'flauta', baixo: 'baixo', harmonia: 'violao' },
  estilo: { tipo: 'batida', grade: 'x..x..x...x..x..', oitava: 4 },
  vol: { melodia: 1, contra: 0.5, baixo: 0.75, harmonia: 0.4, bateria: 0.55 },
  bateria: {
    Q1: { bumbo: 'X......xX.......', aro: '...x..x...x..x..', chimbal: 'x.x.x.x.x.x.x.x.' },
    Q2: { bumbo: 'X......xX......x', aro: '...x..x....x..x.', ganza: 'xoxoxoxoxoxoxoxo' },
    QF: { bumbo: 'X.......X.......', aro: '...x..x...x.....', tom: '............x.xx' },
  },
  secoes: {
    A: {
      bateria: 'Q1 Q1 Q1 Q1 Q1 Q1 Q1 QF', acordes: 'Fmaj7 | Gm7 | Am7 | Bbmaj7 | Fmaj7 | Dm7 | Gm7 | C7',
      melodia: `a5:4 c6:4 a5:2 g5:2 f5:4 | g5:4 bb5:4 g5:2 f5:2 d5:4 | e5:4 g5:4 c6:4 e5:4 | f5:6 d5:2 bb4:8 |
                c5:2 f5:2 a5:2 c6:2 e6:4 c6:4 | d6:4 a5:4 f5:4 d5:4 | f5:4 e5:2 d5:2 bb4:4 d5:4 | e5:8 g5:4 bb5:4`,
      contra: 'c5:16 | d5:16 | c5:16 | d5:16 | e5:16 | c5:16 | bb4:16 | bb4:8 g4:8',
      baixo: `f2:6 c2:2 f2:4 c2:4 | g1:6 d2:2 g1:4 d2:4 | a1:6 e2:2 a1:4 e2:4 | bb1:6 f2:2 bb1:4 f2:4 |
              f2:6 c2:2 f2:4 a1:4 | d2:6 a1:2 d2:4 a1:4 | g1:6 d2:2 g1:4 bb1:4 | c2:6 g1:2 c2:4 e2:4`,
    },
    B: {
      bateria: 'Q2', acordes: 'Bbmaj7 | Am7 | Gm7 | C7 | Am7 | D7 | Gm7 | C7', inst: { melodia: 'flauta', contra: 'kalimba' },
      melodia: 'd6:6 c6:2 a5:8 | c6:6 a5:2 e5:8 | bb5:4 a5:4 g5:4 f5:4 | e5:8 c5:8 | e5:4 a5:4 c6:4 e6:4 | d6:4 c6:2 a5:2 f#5:8 | g5:4 bb5:4 d6:4 f6:4 | e6:8 c6:8',
      contra: `f4:4 a4:4 d5:4 a4:4 | e4:4 g4:4 c5:4 g4:4 | d4:4 f4:4 bb4:4 f4:4 | e4:4 g4:4 bb4:4 g4:4 |
               c4:4 e4:4 a4:4 e4:4 | d4:4 f#4:4 c5:4 f#4:4 | d4:4 g4:4 bb4:4 g4:4 | c4:4 e4:4 bb4:4 e4:4`,
      baixo: 'bb1:8 f2:8 | a1:8 e2:8 | g1:8 d2:8 | c2:8 g1:8 | a1:8 e2:8 | d2:8 a1:8 | g1:8 d2:8 | c2:8 c2:4 e2:4',
    },
    C: {
      bateria: 'Q1', acordes: 'Dm | Bb | F | C | Dm | Bb | Gm | A7', inst: { melodia: 'sino', contra: 'cordas' },
      melodia: `a5:3 d6:1 _:4 e6:2 f6:2 e6:2 d6:2 | f6:6 d6:2 bb5:8 | c6:3 f6:1 _:4 g6:2 a6:2 g6:2 f6:2 | e6:12 r:4 |
                d6:4 a5:4 f5:4 d5:4 | bb5:4 f5:4 d5:4 bb4:4 | g5:4 bb5:4 d6:4 g6:4 | e6:8 c#6:8`,
      contra: 'f4:16 | f4:16 | a4:16 | g4:16 | f4:8 a4:8 | d4:8 f4:8 | d4:8 g4:8 | c#4:8 e4:8',
      baixo: 'd2:8 a1:8 | bb1:8 f2:8 | f2:8 c2:8 | c2:8 g1:8 | d2:4 d2:4 a1:4 a1:4 | bb1:4 bb1:4 f1:4 f1:4 | g1:4 g1:4 d2:4 d2:4 | a1:4 a1:4 e2:4 c#2:4',
    },
    D: {
      bateria: 'Q2 Q2 Q2 Q2 Q2 Q2 Q2 QF', acordes: 'Fmaj7 | F7 | Bbmaj7 | Bbm6 | Am7 | D7 | Gm7 | C7', inst: { melodia: 'guitarra', contra: 'metais' },
      melodia: `c5:2 f5:2 a5:2 c6:2 a5:4 f5:4 | eb5:2 f5:2 a5:2 c6:2 eb6:8 | d6:4 c6:4 a5:4 f5:4 | db6:4 bb5:4 g5:4 f5:4 |
                e5:2 g5:2 c6:2 e6:2 c6:8 | c6:2 a5:2 f#5:2 d5:2 a5:8 | bb5:4 a5:4 g5:4 d5:4 | e5:4 g5:4 c6:8`,
      contra: 'a4:16 | a4:16 | f4:16 | f4:16 | e4:16 | f#4:16 | f4:16 | e4:16',
      baixo: `f1:6 c2:2 f1:4 a1:4 | f1:6 c2:2 eb2:4 a1:4 | bb1:6 f2:2 bb1:4 d2:4 | bb1:6 f2:2 db2:4 g1:4 |
              a1:6 e2:2 a1:4 c2:4 | d2:6 a1:2 d2:4 f#2:4 | g1:6 d2:2 g1:4 bb1:4 | c2:6 g1:2 c2:4 bb1:4`,
    },
    E: {
      bateria: 'Q1 Q2', acordes: 'Fmaj7 | Gm7 | Am7 | Bbmaj7 | Gm7 | Am7 | Bbmaj7 | C7', inst: { melodia: 'metais', contra: 'cordas' },
      melodia: 'f5:4 a5:4 c6:8 | d6:4 bb5:4 g5:8 | e5:4 g5:4 c6:8 | d6:6 c6:2 bb5:8 | a5:4 g5:4 f5:4 d5:4 | c5:4 e5:4 a5:4 c6:4 | d6:4 f6:4 d6:4 bb5:4 | c6:8 bb5:4 g5:4',
      contra: 'c5:8 e5:8 | d5:8 f5:8 | c5:8 e5:8 | d5:8 f5:8 | bb4:8 d5:8 | c5:8 e5:8 | d5:8 f5:8 | e5:8 g5:8',
      baixo: `f2:4 a2:4 c3:4 a2:4 | g1:4 bb1:4 d2:4 f2:4 | a1:4 c2:4 e2:4 g2:4 | bb1:4 d2:4 f2:4 a2:4 |
              g1:4 d2:4 g2:4 d2:4 | a1:4 e2:4 a2:4 e2:4 | bb1:4 f2:4 bb2:4 f2:4 | c2:4 g2:4 c3:4 bb2:4`,
    },
    F: {
      bateria: 'Q2 Q2 Q2 Q2 Q1 Q1 Q1 QF', acordes: 'Dm7 | Gm7 | C7 | Fmaj7 | Dm7 | Gm7 | C7 | C7',
      melodia: `a5:2 f5:2 d5:2 f5:2 a5:4 c6:4 | bb5:2 g5:2 d5:2 g5:2 bb5:4 d6:4 | c6:2 bb5:2 g5:2 e5:2 c5:8 | a5:16 |
                f5:2 a5:2 d6:2 a5:2 f5:4 a5:4 | g5:2 bb5:2 d6:2 bb5:2 g5:4 bb5:4 | e5:4 g5:4 bb5:4 c6:4 | e6:8 r:8`,
      contra: 'c5:16 | d5:16 | e5:16 | c5:8 a4:8 | f5:16 | f5:16 | e5:16 | g5:8 r:8',
      baixo: 'd2:8 a1:8 | g1:8 d2:8 | c2:8 g1:8 | f1:8 c2:8 | d2:6 a1:2 d2:8 | g1:6 d2:2 g1:8 | c2:6 g1:2 c2:8 | c2:4 e2:4 g2:4 bb2:4',
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E', 'F'],
};
