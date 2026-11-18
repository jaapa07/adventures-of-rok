/**
 * 4-1 ESTEIRAS — abertura do Mundo 4. Ideia própria: A LINHA DE MONTAGEM.
 * O chão da fábrica é feito de ESTEIRAS: as que andam a favor esticam o pulo sobre os fossos de pregos,
 * as que andam contra seguram a dupla. A CHAVE INGLESA fala com os PAINÉIS DE MÁQUINA (17.3): um golpe
 * desliga as esteiras de um trecho e para as serras com a mesma etiqueta. No meio do caminho, a sala de
 * descanso dos Javalins (gag_cafe): troque o café da garrafa térmica por suco de jaca e eles correm para
 * o banheiro. Rota alta: elevador de esteiras e o telhado do salão das serras. Clímax: a linha de montagem
 * final, esteiras rápidas sobre fossos com serras que sobem e descem; o último painel antes dela é o
 * "modo fácil" para quem chegou com a chave inteira.
 * Segmentos (coluna inicial): F1 0 · F2 24 · F3 50 · F4 78 · F5 104 · F6 128 · F7 156 · F8 182 · F9 210
 * Altura 20; chão na linha 15.
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);

// F1 — pátio de entrada; a Chave Inglesa está encostada no portão
const F1 = [...V(24, 11), '..............=====.....', ...V(24, 3), ...C(24, 5)];
// F2 — primeira esteira A FAVOR para pular o fosso de pregos; no fundo do fosso, o nicho da Moeda-Folha
const F2 = [
  ...V(26, 11),
  '..........=====...........',
  ...V(26, 3),
  '>>>>>>>>>>>>>>.....#######',
  ...R('##############.......#####', 2),
  '##############...#########',
  '##############^^^#########',
];
// F3 — a esteira CONTRA: o painel do começo desliga; passarelas por cima (rota alta)
const F3 = [
  ...V(28, 9),
  '.......======.......======..',
  ...V(28, 2),
  '...====...........====......',
  ...V(28, 2),
  '##<<<<<<<<<<<<<<<<<<<<<<<<##',
  ...C(28, 4),
];
// F4 — a sala de descanso dos Javalins (gag_cafe): o prédio inteiro fecha o caminho por cima
const F4 = [...C(26, 11), ...V(26, 4), ...C(26, 5)];
// F5 — Totem de Cipó e o ELEVADOR DE ESTEIRAS (zigue-zague até o telhado do salão das serras)
const F5 = [
  ...V(24, 6),
  '..............>>>>>>>>..',
  ...V(24, 2),
  '......<<<<<<............',
  ...V(24, 2),
  '..........>>>>>>........',
  ...V(24, 2),
  ...C(24, 5),
];
// F6 — o salão das serras: três serras gigantes sobem e descem; o painel da entrada as desliga.
// Por cima, o telhado (rota alta) com a porta escondida da sala bônus 1
const F6 = [...V(28, 6), ...C(28, 4), ...V(28, 5), ...C(28, 5)];
// F7 — esteiras alternadas sobre fossos de pregos; o painel no fim desliga a linha de montagem final
const F7 = [
  ...V(26, 6),
  ...R('######....................', 4),
  ...V(26, 2),
  '..........====............',
  ...V(26, 2),
  '>>>>>....<<<<....>>>>>####',
  ...R('#####....####....#########', 3),
  '#####^^^^####^^^^#########',
];
// F8 — clímax: a LINHA DE MONTAGEM FINAL (esteiras rápidas, fossos e serras que sobem e descem)
const F8 = [
  ...V(28, 9),
  '.............====...........',
  ...V(28, 2),
  '......====..........====....',
  ...V(28, 2),
  '>>>>>>...>>>>>>...>>>>>>####',
  ...R('######...######...##########', 3),
  '######^^^######^^^##########',
];
// F9 — pátio de expedição com o Totem de Saída
const F9 = [...V(24, 15), ...C(24, 5)];

const nivel: LevelDef = {
  id: '4-1',
  nome: 'Esteiras',
  mundo: 4,
  tipo: 'normal',
  tileset: 'fabrica',
  parallax: 'fabrica',
  preset: 'fabrica',
  music: 'fabrica',
  ambience: 'amb-fabrica',
  tilemap: stitch(F1, F2, F3, F4, F5, F6, F7, F8, F9),
  start: [3, 15],
  checkpoint: [107, 15],
  exit: [226, 15],
  letras: [[36.5, 10], [121, 5.2], [141.5, 12], [197.5, 8]],
  moedaFolha: [44.5, 17.6],
  bonusRooms: ['4-1-b1', '4-1-b2'],
  targetTime: 185,
  gags: ['gag_cafe', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['parafusos:15', 'castanhas:20', 'parafusos:25', 'vida:1', 'ficha'],
  entities: [
    { t: 'npc', id: 'tucano', x: 1.5, y: 15, falas: ['Bem-vindos à Fábrica Javarda. Tudo aqui anda sozinho, até o chão.', 'Viu a Chave Inglesa? Um golpe num painel de máquina e CLUNK: esteira parada, serra dormindo.', 'Se a esteira andar a favor, corra e pule no fim dela: vai longe!'] },
    { t: 'arma', id: 'chave', x: 8, y: 15 },
    { t: 'javalim', x: 17, y: 15, patrulha: [12, 22] },
    { t: 'javalim', x: 27, y: 15, patrulha: [25, 36], arma: 'chave' },
    { t: 'marimbondo', x: 35, y: 9, rota: 'vaivem', raio: 3 },
    { t: 'javalim', x: 46, y: 15, patrulha: [43, 49], dir: -1 },
    { t: 'painel-maquina', x: 50.5, y: 15, alvo: 'esteira-f3', esteiras: [52, 75] },
    { t: 'serrote', x: 60, y: 11, amp: 1.2, freq: 0.6, alcance: 5 },
    { t: 'serrote', x: 70, y: 10, amp: 1.5, freq: 0.45, alcance: 4 },
    { t: 'javalim', x: 66, y: 15, patrulha: [56, 74] },
    { t: 'arma', id: 'buzina', x: 72, y: 9 },
    { t: 'marimbondo', x: 66, y: 6.5, rota: 'oito', raio: 2.5 },
    // a sala de descanso: três Javalins tomando café; o banheiro fica no fundo, à direita
    { t: 'gag', id: 'gag_cafe', x: 87, y: 15, javalins: [[92, 15], [94.5, 15], [97, 15]], porta: [101.5, 15], alerta: 2.5 },
    { t: 'npc', id: 'vo-bugio', x: 105, y: 15, falas: ['Suco de jaca no lugar do café? Eu nunca ensinei isso. Ensinei, sim.', 'Esse elevador de esteiras leva ao telhado. Lá em cima tem segredo... e marimbondo.'] },
    { t: 'javalim', x: 117, y: 15, patrulha: [112, 126] },
    { t: 'arma', id: 'capacete', x: 110, y: 15 },
    { t: 'painel-maquina', x: 130.5, y: 15, alvo: 'serras-salao' },
    { t: 'serra-gigante', x: 136, y: 12, path: [[136, 11.5], [136, 15.8]], vel: 150, tag: 'serras-salao' },
    { t: 'serra-gigante', x: 143, y: 15, path: [[143, 15.8], [143, 11.5]], vel: 170, tag: 'serras-salao' },
    { t: 'serra-gigante', x: 150, y: 12, path: [[150, 11.5], [150, 15.8]], vel: 190, tag: 'serras-salao' },
    { t: 'javalim', x: 139.5, y: 15, patrulha: [138, 141] },
    { t: 'javalim', x: 146.5, y: 15, patrulha: [145, 148], dir: -1 },
    { t: 'marimbondo', x: 138, y: 4, rota: 'vaivem', raio: 3 },
    { t: 'marimbondo', x: 150, y: 3.5, rota: 'circulo', raio: 1.6 },
    { t: 'porta-bonus', x: 145, y: 6, room: '4-1-b1', oculta: true },
    { t: 'serrote', x: 163, y: 12, amp: 1.5, freq: 0.5, alcance: 3 },
    { t: 'serrote', x: 172, y: 11, amp: 1.2, freq: 0.7, alcance: 3 },
    { t: 'javalim', x: 167.5, y: 15, patrulha: [165.5, 168.5] },
    { t: 'arma', id: 'panela', x: 166, y: 12 },
    { t: 'painel-maquina', x: 179.5, y: 15, alvo: 'linha-final', esteiras: [182, 205] },
    { t: 'serra-gigante', x: 188, y: 12, path: [[188, 12], [188, 17]], vel: 140, tag: 'linha-final' },
    { t: 'serra-gigante', x: 197, y: 17, path: [[197, 17], [197, 12]], vel: 160, tag: 'linha-final' },
    { t: 'javalim', x: 192, y: 15, patrulha: [191, 196] },
    { t: 'javalim', x: 202, y: 15, patrulha: [200, 205], arma: 'chave' },
    { t: 'marimbondo', x: 203, y: 10, rota: 'oito', raio: 2 },
    { t: 'javalao', x: 216, y: 15, patrulha: [212, 222] },
    { t: 'porta-bonus', x: 230.5, y: 15, room: '4-1-b2', oculta: true },
  ],
  coins: [
    { path: [[5, 13.6], [9, 13.6]] },
    { path: [[14.5, 10.2], [18, 10.2]] },
    { path: [[28, 13.6], [36, 13.6], [40, 11.5], [44, 13]], step: 0.9 },
    { path: [[43, 16.5], [43.5, 17.5]] },
    { path: [[54, 11.2], [56, 11.2]] },
    { path: [[58, 8.2], [62, 8.2]] },
    { path: [[71, 11.2], [73, 11.2]] },
    { path: [[73, 8.2], [75, 8.2]], cacho: true },
    { path: [[80, 13.6], [86, 13.6]] },
    { path: [[109, 11], [112, 11]] },
    { path: [[110.5, 7.8], [114, 7.8]] },
    { path: [[119, 5.2], [120, 5.2]] },
    { path: [[122, 5.2], [124.5, 5.2]] },
    { path: [[129, 5.2], [155, 5.2]], step: 1.3 },
    { path: [[132, 13.6], [154, 13.6]], step: 1.1 },
    { path: [[160, 13.6], [163, 12.2], [166, 13.6]] },
    { path: [[168, 13.6], [171, 12.2], [174, 13.6]] },
    { path: [[166, 11], [169, 11]] },
    { path: [[183, 13.6], [187, 11.6], [191, 13.6]] },
    { path: [[192, 13.6], [196, 11.6], [200, 13.6]] },
    { path: [[189, 11], [191, 11]] },
    { path: [[195.5, 8], [198.5, 8]] },
    { path: [[203, 11], [205, 11]] },
    { path: [[212, 13.6], [220, 13.6]] },
  ],
  cameraZones: [
    { x0: 78, x1: 104, zoom: 1.04 },
    { x0: 128, x1: 156, zoom: 0.94 },
    { x0: 180, x1: 210, zoom: 0.88, tiltY: -3 },
  ],
  decor: [
    { d: 'fabrica/cerca-arame', x: 2, y: 15 },
    { d: 'fabrica/placa-javarda', x: 6, y: 15 },
    { d: 'fabrica/toco-cortado', x: 11, y: 15 },
    { d: 'fabrica/barril-oleo', x: 20.5, y: 15, front: true },
    { d: 'fabrica/chamine-p', x: 23, y: 15 },
    { d: 'fabrica/engrenagem', x: 30, y: 15, s: 0.9 },
    { d: 'fabrica/cano', x: 41, y: 15 },
    { d: 'fabrica/corrente', x: 39.5, y: 0 },
    { d: 'fabrica/tubo-vapor', x: 47, y: 15 },
    { d: 'fabrica/painel', x: 49, y: 15, s: 0.8 },
    { d: 'fabrica/engrenagem', x: 60, y: 15, s: 1.4 },
    { d: 'fabrica/corrente', x: 64, y: 0, flip: true },
    { d: 'fabrica/caixa-metal', x: 77, y: 15 },
    { d: 'fabrica/placa-javarda', x: 80, y: 15 },
    { d: 'fabrica/caixa-metal', x: 84, y: 15, s: 0.7 },
    { d: 'fabrica/barril-oleo', x: 99, y: 15, s: 0.8 },
    { d: 'fabrica/tubo-vapor', x: 103, y: 15 },
    { d: 'fabrica/engrenagem', x: 113, y: 15, s: 1.2 },
    { d: 'fabrica/chamine-p', x: 125.5, y: 15 },
    { d: 'fabrica/painel', x: 128.5, y: 15 },
    { d: 'fabrica/cano', x: 134, y: 15, front: true, s: 0.7 },
    { d: 'fabrica/chamine-p', x: 131, y: 6 },
    { d: 'fabrica/caixa-metal', x: 145, y: 6, front: true },
    { d: 'fabrica/tubo-vapor', x: 153, y: 6 },
    { d: 'fabrica/corrente', x: 162, y: 0 },
    { d: 'fabrica/barril-oleo', x: 178, y: 15 },
    { d: 'fabrica/painel', x: 181, y: 15, s: 0.8 },
    { d: 'fabrica/engrenagem', x: 193, y: 15, s: 1.5 },
    { d: 'fabrica/corrente', x: 199, y: 0, flip: true },
    { d: 'fabrica/caixa-metal', x: 211, y: 15 },
    { d: 'fabrica/placa-javarda', x: 224, y: 15 },
    { d: 'fabrica/caixa-metal', x: 230.5, y: 15, front: true, s: 1.1 },
    { d: 'fabrica/chamine-p', x: 233, y: 15, flip: true },
  ],
};
export default nivel;
