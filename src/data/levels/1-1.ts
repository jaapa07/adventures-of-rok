/**
 * 1-1 TRILHA DA SUMAÚMA — fase de abertura. Ideia própria: a PREGUIÇA-PONTE (gag_preguica).
 * Ensina: andar/correr, pulo, pisão, primeira arma (galho), cabaça rolante, cipó, corda, bromélia-mola,
 * troca de parceiro, ninho do reencontro e flor-catapulta no clímax.
 * Segmentos (coluna inicial): S1 0 · S2 24 · S3 46 · S4 68 · S5 94 · S6 116 · S7 136 · S8 160 · S9 182 · S10 202 · S11 228
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));

// S1 — clareira inicial, galho de troca no chão
const S1 = [...V(24, 11), '..............======....', ...V(24, 2), ...C(24, 4)];
// S2 — primeiro buraco com galhos atravessáveis
const S2 = [...V(22, 12), '.......===..===.......', vazio(22), ...Array.from({ length: 4 }, () => '#####............#####')];
// S3 — subida em rampa até o platô das cabaças
const S3 = [...V(22, 11), '...../################', '..../#################', '.../##################', ...C(22, 4)];
// S4 — o abismo da preguiça (ponte viva) com a corda do alto como rota alternativa
const S4 = [...V(26, 6), '......______________......', ...V(26, 4), ...Array.from({ length: 7 }, () => '####..................####')];
// S5 — paredão com cipó; a bromélia leva à borda alta (letra I)
const S5 = [...V(22, 4), '.........|............', '.........|..##########', '.........|..##########', '.........|............', '.........|............', '.........|............', '.........|............', ...C(22, 7)];
// S6 — clareira do Totem de Cipó
const S6 = [...V(20, 11), ...C(20, 7)];
// S7 — copas: rota alta (Lili, letra P) e rota baixa (Tamá, parede rachada → sala bônus 1)
const S7 = [...V(24, 4), '................====....', vazio(24), vazio(24), '..........=====.........', vazio(24), '...====.................', vazio(24), ...C(24, 7)];
// S8 — descida em rampa com a cascavel
const S8 = [...V(22, 11), '#####\\................', '######\\...............', '#######\\..............', ...C(22, 4)];
// S9 — o Ninho do Reencontro e a letra Ó escondida atrás da moita
const S9 = [...V(20, 11), '......======........', vazio(20), vazio(20), ...C(20, 4)];
// S10 — clímax: flor-catapulta sobre o grande vão; saliência secreta lá embaixo (Moeda-Folha + sala bônus 2)
const S10 = [...V(26, 10), ...Array.from({ length: 4 }, () => '......................####'), '######................####', '######................####', '######......====......####', '######................####'];
// S11 — Totem de Saída
const S11 = [...V(16, 10), ...C(16, 8)];

const nivel: LevelDef = {
  id: '1-1',
  nome: 'Trilha da Sumaúma',
  mundo: 1,
  tipo: 'normal',
  tileset: 'mata',
  parallax: 'mata',
  preset: 'selva',
  music: 'mata',
  ambience: 'amb-mata',
  tilemap: stitch(S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11),
  start: [3, 14],
  checkpoint: [122, 11],
  exit: [236, 10],
  letras: [[80, 8.2], [108, 5], [153.5, 4], [195.5, 14]],
  moedaFolha: [215.5, 15.2],
  bonusRooms: ['1-1-b1', '1-1-b2'],
  targetTime: 150,
  gags: ['gag_preguica', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['castanhas:10', 'parafusos:5', 'vida:1', 'castanhas:20', 'ficha'],
  entities: [
    { t: 'npc', id: 'tucano', x: 6.5, y: 14, falas: ['Ei, dupla! O Barão roubou a Semente-Mãe!', 'Segure SHIFT ou J para correr. Pule em cima dos Javalins!', 'Pegue coisas do chão com J — e desça o galho na cabeça deles!'] },
    { t: 'arma', id: 'galho', x: 9, y: 14 },
    { t: 'javalim', x: 17, y: 14, patrulha: [12, 22] },
    { t: 'javalim', x: 37, y: 12, patrulha: [36, 38] },
    { t: 'cabaca', x: 57, y: 11 },
    { t: 'javalim', x: 61, y: 11, patrulha: [58, 66] },
    { t: 'javalim', x: 65, y: 11, patrulha: [60, 67], dir: -1 },
    { t: 'gag', id: 'gag_preguica', x: 81, y: 11, de: 72, ate: 90 },
    { t: 'bromelia', x: 98.5, y: 11 },
    { t: 'marimbondo', x: 110, y: 8.5, rota: 'vaivem', raio: 2.5 },
    { t: 'arma', id: 'panela', x: 126, y: 11 },
    { t: 'javalim-escudo', x: 131, y: 11, patrulha: [127, 135] },
    { t: 'marimbondo', x: 148, y: 6, rota: 'circulo', raio: 1.6 },
    { t: 'javalim', x: 150, y: 11, patrulha: [145, 156], arma: 'galho' },
    { t: 'parede-rachada', x: 158.5, y: 11, variante: 'mata' },
    { t: 'porta-bonus', x: 158.5, y: 11, room: '1-1-b1', oculta: true },
    { t: 'cascavel', x: 172, y: 14 },
    { t: 'ninho', x: 186.5, y: 14 },
    { t: 'arma', id: 'coco', x: 190, y: 11 },
    { t: 'javalao', x: 198, y: 14, patrulha: [193, 201] },
    { t: 'flor-catapulta', x: 205, y: 14, ang: -45, forca: 1350 },
    { t: 'bromelia', x: 217, y: 16, forca: 1700 },
    { t: 'porta-bonus', x: 214, y: 16, room: '1-1-b2' },
    { t: 'javalim', x: 225, y: 10, patrulha: [223, 227] },
    { t: 'javalim-escudo', x: 233, y: 10, patrulha: [229, 235], dir: -1 },
    { t: 'balao', x: 152, y: 2.5, n: 1 },
    { t: 'marimbondo', x: 42, y: 9.5, rota: 'oito', raio: 1.4 },
    { t: 'cascavel', x: 112.5, y: 11, dir: -1 },
    { t: 'javalim', x: 191, y: 11, patrulha: [188, 193] },
    { t: 'marimbondo', x: 214, y: 9, rota: 'vaivem', raio: 3 },
  ],
  coins: [
    { path: [[5.5, 12.5], [8, 11], [10.5, 12.5]] },
    { path: [[14.5, 10.2], [19.5, 10.2]] },
    { path: [[26, 12.5], [29, 10.4], [31.5, 11.3]] },
    { path: [[34, 10.8], [35, 10], [36, 10.8]] },
    { path: [[39.5, 11.3], [42, 10.4], [44.5, 12.5]] },
    { path: [[49.5, 12.2], [51.5, 10]] },
    { path: [[74, 7.8], [88, 7.8]], step: 1 },
    { path: [[103.5, 9], [103.5, 4.5]], cacho: true },
    { path: [[112, 4.2], [119, 4.2]] },
    { path: [[139.5, 8.2], [142.5, 8.2]] },
    { path: [[146.5, 6.2], [150, 6.2]] },
    { path: [[161, 10.5], [164, 12.4], [168, 13.4]] },
    { path: [[188.5, 10.2], [193, 10.2]] },
    { path: [[208.5, 8.9], [213, 6.4], [217.5, 5.6], [222, 6.5]], step: 0.9 },
    { path: [[213.5, 15.4], [216, 15.4]] },
  ],
  cameraZones: [
    { x0: 70, x1: 92, zoom: 0.92 },
    { x0: 203, x1: 224, zoom: 0.88, tiltY: -3 },
  ],
  decor: [
    { d: 'mata/palmeira-jovem', x: 1.5, y: 14 },
    { d: 'mata/samambaia', x: 4.5, y: 14, front: true },
    { d: 'mata/placa-javali', x: 11, y: 14 },
    { d: 'mata/arbusto', x: 22.5, y: 14 },
    { d: 'mata/heliconia', x: 2.5, y: 14 },
    { d: 'mata/raiz', x: 46, y: 14 },
    { d: 'mata/cogumelos', x: 54, y: 11 },
    { d: 'mata/tronco-caido', x: 63, y: 11 },
    { d: 'mata/pedra-musgo', x: 69.5, y: 11 },
    { d: 'mata/cipo-pendente', x: 74, y: 0 },
    { d: 'mata/cipo-pendente', x: 87, y: 0, flip: true },
    { d: 'mata/pedra-musgo', x: 92, y: 11, flip: true },
    { d: 'mata/samambaia', x: 96, y: 11 },
    { d: 'mata/bromelia-deco', x: 114, y: 5 },
    { d: 'mata/heliconia', x: 118, y: 11 },
    { d: 'mata/toco', x: 128.5, y: 11 },
    { d: 'mata/arbusto', x: 137, y: 11, front: true },
    { d: 'mata/samambaia', x: 157, y: 11, front: true },
    { d: 'mata/raiz', x: 166, y: 14 },
    { d: 'mata/cogumelos', x: 176, y: 14 },
    { d: 'mata/arbusto', x: 195.5, y: 14, front: true, s: 1.2 },
    { d: 'mata/samambaia', x: 200, y: 14 },
    { d: 'mata/tronco-caido', x: 203.5, y: 14 },
    { d: 'mata/cipo-pendente', x: 212, y: 0 },
    { d: 'mata/palmeira-jovem', x: 230, y: 10 },
    { d: 'mata/heliconia', x: 239, y: 10, front: true },
    { d: 'mata/placa-javali', x: 242, y: 10, flip: true },
  ],
};
export default nivel;
