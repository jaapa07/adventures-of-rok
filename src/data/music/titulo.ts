/** Título — tema heroico em Ré menor: berimbau em ostinato e cordas cantando o tema. */
import type { Faixa } from './types';

// Tema principal (reaproveitado na versão épica do chefe final)
export const TEMA_A = `
  a4:3 d5:1 _:4 e5:2 f5:2 e5:2 d5:2 |
  f5:6 d5:2 bb4:4 d5:4 |
  c5:3 f5:1 _:4 g5:2 a5:2 g5:2 f5:2 |
  e5:8 r:2 c5:2 d5:2 e5:2 |
  f5:3 a5:1 _:4 g5:2 f5:2 e5:2 d5:2 |
  d5:6 f5:2 bb5:4 a5:2 g5:2 |
  g5:4 f5:2 e5:2 d5:4 bb4:4 |
  a4:4 c#5:4 e5:4 a5:4`;
export const TEMA_A_ACORDES = 'Dm | Bb | F | C | Dm | Bb | Gm | A';

export const TEMA_B = `
  d6:4 bb5:2 a5:2 g5:6 f5:2 |
  e5:2 f5:2 g5:4 c6:6 bb5:2 |
  a5:8 g5:2 f5:2 e5:2 f5:2 |
  d5:12 r:4 |
  f5:2 g5:2 a5:4 bb5:4 d6:4 |
  c6:6 bb5:2 a5:4 g5:4 |
  a5:4 g5:2 f5:2 e5:4 c#5:4 |
  e5:12 a4:4`;
export const TEMA_B_ACORDES = 'Gm | C | F | Dm | Bb | C | A | A';

export const TEMA_D = `
  d5:2 d5:1 d5:1 e5:2 f5:2 a5:4 f5:2 e5:2 |
  e5:2 e5:1 e5:1 g5:2 e5:2 c5:4 d5:2 e5:2 |
  f5:2 f5:1 f5:1 d5:2 bb4:2 d5:4 f5:2 g5:2 |
  a5:4 g5:2 e5:2 c#5:4 a4:4 |
  d5:1 f5:1 a5:2 d6:4 c6:2 a5:2 f5:2 d5:2 |
  c5:1 e5:1 g5:2 c6:4 bb5:2 g5:2 e5:2 c5:2 |
  bb4:1 d5:1 f5:2 bb5:4 a5:2 f5:2 d5:2 f5:2 |
  e5:4 c#5:2 e5:2 a5:8`;
export const TEMA_D_ACORDES = 'Dm | C | Bb | A | Dm | C | Bb | A';

const R1 = 'd4:2 d4:1 d4:1 e4:2 r:2 d4:2 d4:1 d4:1 e4:4';
const R2 = 'd4:2 d4:1 d4:1 e4:2 r:2 d4:2 e4:2 d4:4';
const R3 = 'd4:2 d4:1 d4:1 e4:2 e4:2 e4:2 e4:2 e4:4';
const R4 = 'd4:1 d4:1 e4:2 d4:2 r:2 d4:1 d4:1 e4:2 e4:2 d4:2';

export const titulo: Faixa = {
  id: 'titulo', nome: 'Semente-Mãe', bpm: 104, tom: 'Ré menor', loop: true, reverb: 'copa', envio: 0.35,
  inst: { melodia: 'cordas', contra: 'berimbau', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.75, harmonia: 0.5 },
  bateria: {
    I: { caxixi: 'x.xxx.xxx.xxx.xx', surdo: 'X...............' },
    IF: { caxixi: 'x.xxx.xxx.xxx.xx', surdo: 'X.......X...X.X.', tom: '............x.xx' },
    A: { bumbo: 'X.....x.X.......', surdo: '....X.......X...', caxixi: 'x.xxx.xxx.xxx.xx', pandeiro: '..x...x...x...x.' },
    AC: { bumbo: 'X.....x.X.......', surdo: '....X.......X...', caxixi: 'x.xxx.xxx.xxx.xx', pandeiro: '..x...x...x...x.', prato: 'X...............' },
    A2: { bumbo: 'X.....x.X.....x.', surdo: '....X.......X..x', caixa: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', pandeiro: '..x...x...x...x.' },
    B: { bumbo: 'X.......X.......', surdo: '....X.......X...', caixa: 'o..xo.o.o..xo.oo', pandeiro: 'x.x.x.x.x.x.x.x.' },
    BC: { bumbo: 'X.......X.......', surdo: '....X.......X...', caixa: 'o..xo.o.o..xo.oo', pandeiro: 'x.x.x.x.x.x.x.x.', prato: 'X...............' },
    F: { bumbo: 'X.....x.X.......', tom: '........x.x.xxxx', caixa: '....x.x.....xxXX' },
    C: { surdo: 'X.......X.......', ganza: 'xoxoxoxoxoxoxoxo', aro: '....x.......x...' },
    D: { bumbo: 'X..x..x.X..x..x.', surdo: '....X.......X...', caxixi: 'Xxx.Xxx.Xxx.Xxx.', agogoA: 'x.x...x.x.x...x.', agogoB: '....x.......x...' },
    E: { bumbo: 'X...X...X...X...', caixa: '..x...x...x...xx', prato: 'X...............' },
  },
  secoes: {
    I: {
      bateria: 'I I I IF', acordes: 'Dm | Dm | Bb | A',
      melodia: '- | - | - | r:8 e5:2 d5:2 c#5:2 e5:2',
      contra: `${R1} | ${R2} | ${R1} | ${R3}`,
      baixo: 'd2:16 | d2:16 | bb1:16 | a1:16',
    },
    A: {
      bateria: 'AC A A A A A A F', acordes: TEMA_A_ACORDES, melodia: TEMA_A,
      contra: `${R1} | ${R2} | ${R1} | ${R4} | ${R1} | ${R2} | ${R4} | ${R3}`,
      baixo: `d2:6 d2:2 a2:4 f2:4 | bb1:6 bb1:2 f2:4 d2:4 | f2:6 f2:2 c3:4 a2:4 | c2:6 c2:2 g2:4 e2:4 |
              d2:6 d2:2 a2:4 c3:4 | bb1:6 bb1:2 d2:4 f2:4 | g2:6 g2:2 d2:4 bb1:4 | a1:6 a1:2 e2:4 c#2:4`,
    },
    B: {
      bateria: 'BC B B B B B B F', acordes: TEMA_B_ACORDES, melodia: TEMA_B, inst: { contra: 'metais' },
      contra: 'bb4:8 d5:8 | c5:8 e5:8 | c5:16 | a4:8 f4:8 | d5:8 f5:8 | e5:8 g5:8 | c#5:8 e5:8 | a4:4 c#5:4 e5:4 g5:4',
      baixo: `g2:6 g2:2 d2:4 bb1:4 | c2:6 c2:2 g2:4 e2:4 | f2:6 f2:2 c2:4 a1:4 | d2:6 d2:2 a1:4 c2:4 |
              bb1:6 bb1:2 f2:4 bb2:4 | c2:6 c2:2 g2:4 c3:4 | a1:6 a1:2 e2:4 g2:4 | a1:4 a1:4 e2:2 e2:2 a2:4`,
    },
    C: {
      bateria: 'C', acordes: 'F | Am | Bb | F | Dm | Am | Bb | C', inst: { melodia: 'flauta', contra: 'pizz' },
      melodia: `c5:4 f5:4 a5:6 g5:2 | e5:8 c5:4 e5:4 | d5:4 f5:4 bb5:6 a5:2 | a5:12 r:4 |
                a5:2 g5:2 f5:4 d5:4 f5:4 | e5:6 c5:2 a4:8 | bb4:4 d5:4 f5:4 bb5:4 | g5:8 e5:4 c5:4`,
      contra: `f4:2 a4:2 c5:2 a4:2 f4:2 a4:2 c5:2 a4:2 | e4:2 a4:2 c5:2 a4:2 e4:2 a4:2 c5:2 e5:2 |
               d4:2 f4:2 bb4:2 f4:2 d4:2 f4:2 bb4:2 d5:2 | c4:2 f4:2 a4:2 c5:2 f5:4 r:4 |
               d4:2 f4:2 a4:2 f4:2 d4:2 f4:2 a4:2 d5:2 | c4:2 e4:2 a4:2 e4:2 c4:2 e4:2 a4:2 c5:2 |
               bb3:2 d4:2 f4:2 d4:2 bb3:2 d4:2 f4:2 bb4:2 | c4:2 e4:2 g4:2 c5:2 e5:2 g5:2 e5:2 c5:2`,
      baixo: 'f2:8 c2:8 | a1:8 e2:8 | bb1:8 f2:8 | f2:8 a2:8 | d2:8 a1:8 | a1:8 c2:8 | bb1:8 d2:8 | c2:8 g1:4 c2:4',
    },
    A2: {
      bateria: 'AC A2 A2 A2 A2 A2 A2 F', acordes: TEMA_A_ACORDES, inst: { melodia: 'metais', contra: 'cordas' },
      melodia: TEMA_A.replace('a4:4 c#5:4 e5:4 a5:4', 'a4:4 c#5:4 e5:4 g5:2 a5:2'),
      contra: 'f4:8 e4:8 | d4:8 f4:8 | a4:8 c5:8 | g4:8 e4:4 g4:4 | a4:8 c5:8 | bb4:8 d5:4 c5:4 | bb4:8 g4:8 | c#5:8 e5:8',
      baixo: `d2:3 d2:3 d2:2 a2:4 d3:4 | bb1:3 bb1:3 bb1:2 f2:4 bb2:4 | f2:3 f2:3 f2:2 c3:4 f2:4 | c2:3 c2:3 c2:2 g2:4 c3:4 |
              d2:3 d2:3 d2:2 a2:4 f2:4 | bb1:3 bb1:3 bb1:2 f2:4 d2:4 | g1:3 g1:3 g1:2 d2:4 g2:4 | a1:3 a1:3 a1:2 e2:4 a2:4`,
    },
    D: {
      bateria: 'D', acordes: TEMA_D_ACORDES, melodia: TEMA_D, inst: { melodia: 'berimbau', contra: 'cordas' },
      contra: 'a5:16 | g5:16 | f5:16 | e5:16 | f5:8 a5:8 | e5:8 g5:8 | d5:8 f5:8 | c#5:8 e5:8',
      baixo: `d2:2 r:2 d2:2 a1:2 d2:4 f2:4 | c2:2 r:2 c2:2 g1:2 c2:4 e2:4 | bb1:2 r:2 bb1:2 f1:2 bb1:4 d2:4 | a1:2 r:2 a1:2 e2:2 a1:4 c#2:4 |
              d2:2 d2:2 d3:2 d2:2 a1:4 c2:4 | c2:2 c2:2 c3:2 c2:2 g1:4 bb1:4 | bb1:2 bb1:2 bb2:2 bb1:2 f2:4 a1:4 | a1:2 a1:2 a2:2 a1:2 e2:4 g2:4`,
    },
    E: {
      bateria: 'E', acordes: 'Bb | C | A | A', inst: { melodia: 'metais', contra: 'cordas' },
      melodia: 'f5:4 g5:4 a5:4 bb5:4 | c6:4 bb5:4 a5:4 g5:4 | a5:16 | _:8 r:8',
      contra: 'd5:16 | e5:16 | c#5:16 | e5:8 r:8',
      baixo: 'bb1:4 bb1:4 bb1:4 bb1:4 | c2:4 c2:4 c2:4 c2:4 | a1:16 | a1:4 a1:4 a1:2 a1:2 a1:4',
    },
  },
  ordem: ['I', 'A', 'B', 'C', 'A2', 'D', 'E'],
};
