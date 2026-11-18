/**
 * 4-3 LAGARTA-TRATOR — fase de PERSEGUIÇÃO. Ideia própria: CORRER À FRENTE DA DESTRUIÇÃO.
 * Na borda da mata devastada, a LAGARTA-TRATOR gigante acorda (gag_lagarta): a câmera inclina em CSS 3D
 * e mostra a máquina chegando pela camada de trás; daí em diante a tela ROLA SOZINHA e a dupla corre
 * por buracos, rampa, ponte de tábuas, toras e o túnel do cano, sem poder parar. Tudo o que fica para
 * trás vira destroço. Quando a perseguição termina, a Lagarta encalha — mas a sua irmã menor, a
 * LAGARTA-TRATOR de verdade, fecha a saída: só para com TRÊS CABAÇAS arremessadas (clímax).
 * Rota alta: tábuas e a rampa (letras); rota baixa: chão e o túnel do cano.
 * Segmentos (coluna inicial): T1 0 · T2 30 · T3 60 · T4 90 · T5 120 · T6 150 · T7 180 · T8 210 · T9 240
 * Altura 18; chão na linha 12.
 */
import type { LevelDef } from '../../game/types';
import { stitch, vazio, cheio } from './util';

const V = (w: number, n: number) => Array.from({ length: n }, () => vazio(w));
const C = (w: number, n: number) => Array.from({ length: n }, () => cheio(w));
const R = (row: string, n: number) => Array.from({ length: n }, () => row);

// T1 — a borda da mata derrubada: calmaria antes da máquina; no alto da copa, a Moeda-Folha
const T1 = [...V(30, 8), '..=====.......................', ...V(30, 3), ...C(30, 6)];
// T2 — começa a fuga: um degrau, um buraco de 3 e Javalins atrapalhando
const T2 = [...V(30, 11), '....................##########', ...R('############...###############', 6)];
// T3 — a rampa até o platô e a ponte de tábuas; depois desce de volta ao chão
const T3 = [
  ...V(30, 8),
  '........./######====..........',
  '......../#######..............',
  '......./########..............',
  '....../#########..............',
  ...R('################......########', 6),
];
// T4 — o Totem de Cipó no meio da corrida; tábuas com castanhas por cima
const T4 = [...V(30, 9), '....=====.........=====.......', ...V(30, 2), ...C(30, 6)];
// T5 — três buracos seguidos (ritmo: pula, pula, pula)
const T5 = [...V(30, 12), ...R('#####...#####...#####...######', 6)];
// T6 — o túnel do cano: teto baixo, uma serra no meio (o painel antes do túnel a desliga)
const T6 = [...R('......##################......', 9), ...V(30, 3), ...C(30, 6)];
// T7 — o último salto de 4 antes de a Lagarta encalhar (coluna 202)
const T7 = [...V(30, 12), ...R('##########....################', 6)];
// T8 — clímax: a Lagarta-Trator menor fecha a saída; cabaças nas tábuas e no chão
const T8 = [...V(30, 9), '....=====...........=====.....', ...V(30, 2), ...C(30, 6)];
// T9 — Totem de Saída na clareira que sobrou
const T9 = [...V(20, 12), ...C(20, 6)];

const nivel: LevelDef = {
  id: '4-3',
  nome: 'Lagarta-Trator',
  mundo: 4,
  tipo: 'perseguicao',
  tileset: 'fabrica',
  parallax: 'serraria',
  preset: 'fabrica',
  music: 'fabrica',
  ambience: 'amb-fabrica',
  tilemap: stitch(T1, T2, T3, T4, T5, T6, T7, T8, T9),
  start: [6, 12],
  checkpoint: [110, 12],
  exit: [252, 12],
  letras: [[43.5, 9.2], [78, 7.4], [165, 10.6], [232.5, 8.2]],
  moedaFolha: [4.5, 7.4],
  bonusRooms: ['4-3-b1', '4-3-b2'],
  targetTime: 150,
  gags: ['gag_lagarta', 'gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['parafusos:20', 'castanhas:30', 'ficha', 'parafusos:30', 'vida:1'],
  entities: [
    { t: 'npc', id: 'tucano', x: 3, y: 12, falas: ['Tá ouvindo esse ronco? Não sou eu, juro.', 'Quando a Lagarta-Trator aparecer: CORRAM. Segurem SHIFT e não olhem para trás!', 'Ela só para com três cabaças na fuça. Guardem fôlego pro final.'] },
    { t: 'arma', id: 'buzina', x: 10, y: 12 },
    { t: 'arma', id: 'capacete', x: 20, y: 12 },
    { t: 'porta-bonus', x: 15, y: 12, room: '4-3-b1', oculta: true },
    // a perseguição: ao passar da coluna 28 a Lagarta surge 9 tiles atrás e só encalha na coluna 202
    { t: 'gag', id: 'gag_lagarta', x: 28, y: 12, ate: 202, vel: 250, atras: 9 },
    { t: 'javalim', x: 37, y: 12, patrulha: [34, 41] },
    { t: 'javalim', x: 52, y: 11, patrulha: [50, 58], dir: -1 },
    { t: 'bloco-madeira', x: 47, y: 12 },
    { t: 'javalim', x: 64, y: 12, patrulha: [61, 66] },
    { t: 'marimbondo', x: 76, y: 5, rota: 'vaivem', raio: 3 },
    { t: 'javalim', x: 85, y: 12, patrulha: [83, 89], dir: -1 },
    { t: 'javalim', x: 98, y: 12, patrulha: [93, 103] },
    { t: 'serrote', x: 104, y: 8, amp: 1.2, freq: 0.6, alcance: 4 },
    { t: 'arma', id: 'chave', x: 112, y: 12 },
    { t: 'javalim', x: 116, y: 12, patrulha: [113, 119], arma: 'chave' },
    { t: 'javalim', x: 130, y: 12, patrulha: [128, 132] },
    { t: 'marimbondo', x: 138, y: 8.5, rota: 'circulo', raio: 1.6 },
    { t: 'javalim', x: 146, y: 12, patrulha: [144, 149], dir: -1 },
    { t: 'painel-maquina', x: 153, y: 12, alvo: 'serra-tunel' },
    { t: 'serra-gigante', x: 166, y: 12, path: [[166, 9.5], [166, 12.8]], vel: 120, tag: 'serra-tunel' },
    { t: 'javalim', x: 172, y: 12, patrulha: [169, 175] },
    { t: 'marimbondo', x: 177, y: 6, rota: 'oito', raio: 2 },
    { t: 'arma', id: 'panela', x: 186, y: 12 },
    { t: 'javalim', x: 197, y: 12, patrulha: [194, 205] },
    // clímax: a Lagarta-Trator menor vem da direita; três cabaças (e uma de reserva) para pará-la
    { t: 'cabaca', x: 214, y: 12 },
    { t: 'cabaca', x: 216, y: 9 },
    { t: 'cabaca', x: 218, y: 9 },
    { t: 'cabaca', x: 232, y: 9 },
    { t: 'lagarta-trator', x: 237, y: 12, dir: -1, vel: 70 },
    { t: 'javalim', x: 226, y: 12, patrulha: [222, 230] },
    { t: 'javalao', x: 248, y: 12, patrulha: [243, 250], dir: -1 },
    { t: 'npc', id: 'quati', x: 256, y: 12, falas: ['Vocês pararam a máquina com CABAÇAS? Vou começar a vender cabaça.', 'O Barão está logo ali, no pátio de montagem. Ele está... disfarçado. Muito mal.'] },
    { t: 'porta-bonus', x: 258.5, y: 12, room: '4-3-b2', oculta: true },
  ],
  coins: [
    { path: [[3, 7.4], [6, 7.4]] },
    { path: [[8, 10.6], [14, 10.6]] },
    { path: [[22, 10.6], [29, 10.6]] },
    { path: [[34, 10.6], [40.5, 10.6], [43.5, 9.2], [46.5, 10.6]], step: 0.9 },
    { path: [[50, 9.6], [58, 9.6]], step: 1 },
    { path: [[62, 10.6], [66, 9.6], [70, 6.6]], step: 1 },
    { path: [[72, 6.6], [79, 6.6]], step: 0.9 },
    { path: [[81, 8], [84, 10.6], [89, 10.6]], step: 1 },
    { path: [[94, 7.6], [98, 7.6]] },
    { path: [[108, 7.6], [112, 7.6]] },
    { path: [[121, 10.6], [124, 10.6]] },
    { path: [[125.5, 9.4], [126.5, 9.4]] },
    { path: [[133.5, 9.4], [134.5, 9.4]] },
    { path: [[141.5, 9.4], [142.5, 9.4]] },
    { path: [[150, 10.6], [155, 10.6]] },
    { path: [[157, 10.6], [164, 10.6]], step: 1 },
    { path: [[168, 10.6], [174, 10.6]], step: 1 },
    { path: [[181, 10.6], [189, 10.6], [192, 9], [195, 10.6]], step: 1 },
    { path: [[204, 10.6], [208, 10.6]] },
    { path: [[214.5, 7.6], [218.5, 7.6]] },
    { path: [[242, 10.6], [250, 10.6]], cacho: true },
  ],
  cameraZones: [
    { x0: 30, x1: 200, autoScroll: 235, zoom: 0.92 },
    { x0: 210, x1: 240, zoom: 0.9, lockY: 8.5 },
  ],
  decor: [
    { d: 'fabrica/toco-cortado', x: 2, y: 12 },
    { d: 'mata/palmeira-jovem', x: 4.5, y: 12, front: true, s: 1.6 },
    { d: 'mata/samambaia', x: 9, y: 12, front: true },
    { d: 'fabrica/placa-javarda', x: 17, y: 12 },
    { d: 'mata/arbusto', x: 15, y: 12, front: true },
    { d: 'fabrica/toco-cortado', x: 24, y: 12, flip: true },
    { d: 'mata/pilha-toras', x: 32, y: 12 },
    { d: 'fabrica/toco-cortado', x: 49, y: 11 },
    { d: 'mata/tronco-caido', x: 56, y: 11 },
    { d: 'fabrica/cerca-arame', x: 63, y: 12 },
    { d: 'fabrica/toco-cortado', x: 73, y: 8 },
    { d: 'mata/toco', x: 86, y: 12 },
    { d: 'fabrica/barril-oleo', x: 95, y: 12 },
    { d: 'mata/maquina-serraria', x: 102, y: 12, s: 0.8 },
    { d: 'fabrica/placa-javarda', x: 108, y: 12 },
    { d: 'mata/pilha-toras', x: 127, y: 12, flip: true },
    { d: 'fabrica/toco-cortado', x: 136, y: 12 },
    { d: 'fabrica/cano', x: 155, y: 12, s: 1.3 },
    { d: 'fabrica/tubo-vapor', x: 175, y: 12, flip: true },
    { d: 'fabrica/toco-cortado', x: 183, y: 12 },
    { d: 'mata/placa-serraria', x: 199, y: 12 },
    { d: 'fabrica/caixa-metal', x: 211, y: 12 },
    { d: 'fabrica/engrenagem', x: 228, y: 12, s: 1.2 },
    { d: 'mata/palmeira-jovem', x: 244, y: 12, s: 1.2 },
    { d: 'mata/heliconia', x: 254, y: 12, front: true },
    { d: 'mata/samambaia', x: 258.5, y: 12, front: true },
  ],
};
export default nivel;
