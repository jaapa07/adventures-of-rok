/**
 * 2-1 GRUTA DAS LAMPARINAS — primeira caverna das Grutas Âmbar, quase toda no escuro.
 * Ideia própria: A LUZ QUE ACABA. A caverna é escura (regions escuro) e a dupla só enxerga com a Lamparina na
 * mão (dura 20 s) ou perto de fogueiras acesas. O ritmo é fogueira → corrida no escuro → fogueira; os
 * Morcegos-Lanterna mergulham e apagam as luzes. Lamparina + teia queima a teia e revela passagem (17.3).
 * Gag: gag_eco — no Salão do Eco, gritar (segurar a troca) faz o eco revelar as plataformas por 2 s.
 * Montaria: Tatu-Canastra (caixa em S6) cava a terra mole que esconde o túnel da Moeda-Folha e da sala bônus 1.
 * Rotas: alta (Lili, plataformas do alto do salão — letra I) e baixa (Tamá, degraus baixos) que se reencontram
 * na gruta do Totem.
 * Segmentos (coluna inicial): S1 0 · S2 22 · S3 46 · S4 72 · S5 100 · S6 122 · S7 148 · S8 174 · S9 200 · S10 226
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (n: number, linha: string) => Array.from({ length: n }, () => linha);

// S1 — a boca da gruta (ainda clara): fogueira acesa e a primeira Lamparina
const S1 = [...R(5, '..........############'), '.............#########', ...V(22, 8), ...C(22, 4)];
// S2 — o primeiro corredor escuro: morcegos nos nichos do teto; saliência com a letra C
const S2 = [
  ...C(24, 6),
  '####....######....######',
  ...V(24, 3),
  '..........====..........',
  ...V(24, 3),
  ...C(24, 4),
];
// S3 — estalagmites (espinhos) no chão e a lagoa subterrânea
const S3 = [
  ...C(26, 5),
  '######....######....######',
  ...V(26, 5),
  '...........====...........',
  ...V(26, 2),
  '###^^^^###########~~~~~###',
  ...R(2, '##################~~~~~###'),
  cheio(26),
];
// S4 — o Salão do Eco (gag_eco): plataformas soltas sobre o abismo; as altas são da Lili (letra I)
const S4 = [
  ...C(28, 2),
  ...V(28, 5),
  '..........====..............',
  vazio(28),
  '.....====...........====....',
  vazio(28),
  '...............====.........',
  vazio(28),
  '.......====..........====...',
  ...R(4, '###......................###'),
];
// S5 — a gruta do Totem de Cipó: fogueira acesa, Quati vendendo luz
const S5 = [...C(22, 6), '#######........#######', ...V(22, 7), ...C(22, 4)];
// S6 — a caixa do Tatu; a terra mole no chão esconde o túnel (Moeda-Folha e sala bônus 1)
const S6 = [
  ...C(26, 5),
  '########.....##########...',
  ...V(26, 8),
  '######..##################',
  ...R(2, '######.............#######'),
  cheio(26),
];
// S7 — o paredão: sobe pelo cipó até o topo da rocha; o nicho com teia esconde a sala bônus 2
const S7 = [
  ...C(26, 3),
  '######....####....########',
  ...R(4, '.....|....................'),
  ...R(4, '.....|####################'),
  ...R(2, '.....|...#################'),
  ...C(26, 4),
];
// S8 — o campo de estalagmites: descida por tábuas sobre o chão de espinhos
const S8 = [
  ...C(26, 3),
  '..........######..........',
  ...V(26, 4),
  ...R(2, '####......................'),
  '####....=====.............',
  ...R(2, '####......................'),
  '####..........====....====',
  '####^^^^^^^^^^^^^^^^^^^^##',
  ...C(26, 3),
];
// S9 — clímax: a corrida das fogueiras apagadas, com Teiús no encalço e dois poços sem fundo
const S9 = [
  ...C(26, 8),
  '###....#######....########',
  ...V(26, 5),
  ...R(4, '##########...#######...###'),
];
// S10 — a saída para a luz do dia
const S10 = [...R(5, '#######.......'), '####..........', ...V(14, 8), ...C(14, 4)];

const nivel: LevelDef = {
  id: '2-1',
  nome: 'Gruta das Lamparinas',
  mundo: 2,
  tipo: 'normal',
  tileset: 'gruta',
  parallax: 'gruta',
  preset: 'caverna',
  music: 'gruta',
  ambience: 'amb-gruta',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9, S10),
  start: [3, 14],
  checkpoint: [107, 14],
  exit: [234, 14],
  letras: [[33.5, 10], [83.5, 7], [156.5, 6], [221.5, 11.5]],
  moedaFolha: [134, 17],
  bonusRooms: ['2-1-b1', '2-1-b2'],
  targetTime: 185,
  gags: ['gag_eco', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'parafusos:10', 'castanhas:20', 'vida:1', 'ficha'],
  regions: [
    { x0: 16, x1: 226, escuro: true },
  ],
  entities: [
    { t: 'npc', id: 'tucano', x: 5, y: 14, falas: ['Eu não entro aí. Tucano no escuro bate o bico em tudo.', 'Leve a Lamparina! Ela dura pouco: reacenda nas fogueiras.', 'Morcego-Lanterna odeia luz. E adora apagar a sua.'] },
    { t: 'fogueira', x: 12, y: 14, acesa: true },
    { t: 'arma', id: 'lamparina', x: 15, y: 14 },
    // S2
    { t: 'javalim', x: 28, y: 14, patrulha: [24, 33] },
    { t: 'morcego', x: 27.5, y: 9 },
    { t: 'morcego', x: 37.5, y: 9 },
    { t: 'arma', id: 'panela', x: 41, y: 14 },
    // S3
    { t: 'javalao', x: 59, y: 14, patrulha: [55, 63] },
    { t: 'cascavel', x: 69, y: 14 },
    { t: 'morcego', x: 54, y: 8 },
    // S4: Salão do Eco
    { t: 'gag', id: 'gag_eco', x: 85, y: 13, x0: 72, x1: 99, pontos: [[80.5, 13], [78.5, 9], [83.5, 7], [88.5, 11], [93.5, 9], [94.5, 13]] },
    { t: 'morcego', x: 86, y: 5 },
    { t: 'marimbondo', x: 90, y: 7, rota: 'oito', raio: 1.6 },
    // S5: gruta do Totem
    { t: 'fogueira', x: 104, y: 14, acesa: true },
    { t: 'arma', id: 'lamparina', x: 111, y: 14 },
    { t: 'npc', id: 'quati', x: 114, y: 14, falas: ['Lamparina nova, só uma castanha! Usada, duas. É vintage.', 'Grita no salão de trás? O eco mostra o caminho. E assusta a minha avó.', 'Viu aquela caixa com cara de tatu? Tatu cava terra mole. Terra mole esconde coisa.'] },
    { t: 'javalim-escudo', x: 118, y: 14, patrulha: [115, 121], dir: -1 },
    // S6: o Tatu
    { t: 'caixa-montaria', x: 124.5, y: 14, m: 'tatu' },
    { t: 'terra-mole', x: 129, y: 15, w: 2 },
    { t: 'porta-bonus', x: 139.5, y: 17, room: '2-1-b1' },
    { t: 'lagarto', x: 137, y: 14, patrulha: [131, 145] },
    { t: 'javalim', x: 143, y: 14, patrulha: [139, 147] },
    // S7: paredão e nicho da teia
    { t: 'teia', x: 154.5, y: 14, h: 2 },
    { t: 'porta-bonus', x: 156, y: 14, room: '2-1-b2' },
    { t: 'morcego', x: 160, y: 8 },
    { t: 'morcego', x: 166, y: 8 },
    { t: 'javalao', x: 168, y: 8, patrulha: [163, 172] },
    // S8: campo de estalagmites
    { t: 'arma', id: 'lamparina', x: 175.5, y: 8 },
    { t: 'ninho', x: 184.5, y: 10 },
    { t: 'morcego', x: 190, y: 7 },
    { t: 'lagarto', x: 197, y: 13, patrulha: [196, 199] },
    // S9: clímax — corrida das fogueiras
    { t: 'arma', id: 'estilingue', x: 201.5, y: 14 },
    { t: 'fogueira', x: 203, y: 14 },
    { t: 'fogueira', x: 208, y: 14 },
    { t: 'fogueira', x: 216, y: 14 },
    { t: 'fogueira', x: 224, y: 14 },
    { t: 'lagarto', x: 206, y: 14, patrulha: [201, 209] },
    { t: 'javalim', x: 215, y: 14, patrulha: [213, 219] },
    { t: 'morcego', x: 204.5, y: 10 },
    { t: 'morcego', x: 215.5, y: 10 },
    { t: 'javalim', x: 230, y: 14, patrulha: [227, 233] },
  ],
  coins: [
    { path: [[7, 13], [10, 13]] },
    { path: [[17, 12], [20, 11], [23, 12]] },
    { path: [[25.5, 7.4], [28.5, 7.4]] },
    { path: [[35.5, 7.4], [38.5, 7.4]], cacho: true },
    { path: [[32, 9.4], [35, 9.4]] },
    { path: [[48.5, 12], [50, 11.4], [51.5, 12]] },
    { path: [[57, 10.4], [60, 10.4]] },
    { path: [[63.5, 13], [64.5, 12], [65.5, 13]] },
    { path: [[65, 15.5], [67, 15.5]] },
    { path: [[75, 12], [77, 11], [79, 12.4]] },
    { path: [[82, 6.4], [85, 6.4]] },
    { path: [[88, 10.4], [90, 10.4]] },
    { path: [[93, 12.4], [96, 12.4]] },
    { path: [[101, 13], [104, 12], [107, 13]] },
    { path: [[127.5, 13], [130.5, 13]] },
    { path: [[130, 16.4], [138, 16.4]], step: 1 },
    { path: [[149, 12.5], [153, 7.5]], step: 1 },
    { path: [[155, 15.4], [157, 15.4]] },
    { path: [[160, 7.4], [170, 7.4]], step: 1.25 },
    { path: [[177, 6.5], [180, 7.5], [183, 9.4]] },
    { path: [[188, 12.4], [191, 12.4]] },
    { path: [[196, 12.4], [199, 12.4]] },
    { path: [[209.5, 13], [211, 11.5], [212.5, 13]] },
    { path: [[219.5, 13], [221.5, 11], [223.5, 13]] },
    { path: [[228, 13], [232, 13]] },
  ],
  cameraZones: [
    { x0: 73, x1: 99, zoom: 0.86 },
    { x0: 148, x1: 160, zoom: 0.94, lockY: 9 },
    { x0: 201, x1: 226, zoom: 1.05, tiltY: -2 },
  ],
  decor: [
    { d: 'gruta/estalagmite-g', x: 3, y: 14 },
    { d: 'gruta/lamparina-parede', x: 13, y: 7 },
    { d: 'gruta/estalactite', x: 16, y: 6 },
    { d: 'gruta/coluna', x: 20, y: 14 },
    { d: 'gruta/estalactite', x: 24, y: 7 },
    { d: 'gruta/cogumelo-brilho', x: 30, y: 14 },
    { d: 'gruta/estalagmite-p', x: 39, y: 14, front: true },
    { d: 'gruta/cristal-ambar', x: 44, y: 14 },
    { d: 'gruta/estalactite', x: 52, y: 6, flip: true },
    { d: 'gruta/estalagmite-p', x: 47, y: 14 },
    { d: 'gruta/cogumelo-brilho', x: 66, y: 14 },
    { d: 'gruta/cristal-ambar', x: 71, y: 14, front: true },
    { d: 'gruta/estalactite', x: 78, y: 2 },
    { d: 'gruta/estalactite', x: 91, y: 2, flip: true },
    { d: 'gruta/coluna', x: 98.5, y: 14 },
    { d: 'gruta/lamparina-parede', x: 102, y: 9 },
    { d: 'gruta/cogumelo-brilho', x: 109, y: 14 },
    { d: 'gruta/cristal-ambar', x: 120, y: 14 },
    { d: 'gruta/estalagmite-g', x: 126.5, y: 14, front: true },
    { d: 'gruta/cogumelo-brilho', x: 136, y: 17 },
    { d: 'gruta/cristal-ambar', x: 134.5, y: 17, front: true },
    { d: 'gruta/estalactite', x: 140, y: 6 },
    { d: 'gruta/viga-mina', x: 151, y: 14 },
    { d: 'gruta/cogumelo-brilho', x: 153, y: 14, front: true },
    { d: 'gruta/estalagmite-p', x: 163, y: 8 },
    { d: 'gruta/cristal-ambar', x: 171, y: 8 },
    { d: 'gruta/estalactite', x: 182, y: 5 },
    { d: 'gruta/estalagmite-g', x: 186.5, y: 14, front: true },
    { d: 'gruta/cogumelo-brilho', x: 194, y: 13 },
    { d: 'gruta/lamparina-parede', x: 202, y: 10 },
    { d: 'gruta/estalactite', x: 211, y: 9 },
    { d: 'gruta/coluna', x: 218, y: 14 },
    { d: 'gruta/estalactite', x: 225, y: 9, flip: true },
    { d: 'gruta/estalagmite-p', x: 229, y: 14 },
    { d: 'mata/samambaia', x: 237, y: 14, front: true },
    { d: 'mata/heliconia', x: 238.5, y: 14 },
  ],
};
export default nivel;
