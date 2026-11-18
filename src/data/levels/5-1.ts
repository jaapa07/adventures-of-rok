/**
 * 5-1 COPA DA SUMAÚMA — fase extra (liberada com as 14 Moedas-Folha). Vertical, 64 × 190: a escalada
 * da árvore gigante, das raízes até a flor onde a Semente-Mãe volta a brilhar.
 * Ideia própria: OS OCOS DO TRONCO. O tronco (colunas 28–35) divide a árvore em dois lados; a cada
 * andar a dupla atravessa o tronco por um oco e sobe pelo outro lado, e cada andar tem um desafio:
 *  - Raízes: degraus de raiz (e, à direita, a porta escondida da sala bônus secreta).
 *  - Galhos: ziguezague longo com os últimos Javalins do Barão patrulhando galhos estreitos.
 *  - Ninhos: marimbondos em volta dos ninhos; uma bromélia joga a dupla até o galho secreto do balão.
 *  - Cipós: corrente de cipó, oco, corda comprida sobre o vazio e outro cipó.
 *  - Flores: degraus longos ou o atalho das flores-catapulta (para quem tem coragem).
 *  - Espinhos: galhos curtos entre tufos de espinhos e serrotes perdidos.
 *  - Copa: galhos abertos, o Totem de Saída junto da flor da sumaúma e, na ponta direita, a Moeda-Folha.
 * Sem letras nem salas obrigatórias: é o desafio final de plataforma, com segredos para quem explora.
 * Linhas (de cima para baixo): Copa 0–17 · Espinhos 18–49 · Flores 50–79 · Cipós 80–109 · Ninhos 110–139 ·
 * Galhos 140–169 · Raízes 170–189.
 */
import type { LevelDef } from '../../game/types';
import { vazio, cheio } from './util';

const R = (row: string, n: number) => Array.from({ length: n }, () => row);
/** linha com os trechos [coluna, texto] desenhados à mão sobre o céu */
function L(...trechos: [number, string][]): string {
  const r = vazio(64).split('');
  for (const [c, s] of trechos) for (let i = 0; i < s.length; i++) r[c + i] = s[i];
  return r.join('');
}
/** linha com o TRONCO (colunas 28–35) e os trechos à mão */
const T = (...trechos: [number, string][]) => L([28, '########'], ...trechos);
const G6 = '======', G8 = '========';
/** andar do oco: galho dos dois lados do tronco na mesma linha */
const OCO = T([20, G8], [36, G8]);

// COPA (0–17): sem tronco; galhos abertos até a flor (Totem de Saída) e a ponta secreta da direita
const COPA = [
  ...R(L(), 6), L([54, G6]), ...R(L(), 2), L([8, '================'], [47, G6]), ...R(L(), 2),
  L([20, G8], [39, G6]), ...R(L(), 2), L([28, G8]), ...R(L(), 2),
];

// ESPINHOS (18–49): galhos curtos entre tufos de espinhos
const ESPINHOS = [
  T([36, G6]), T(), T(), T([44, G6]), T([58, '^^^^']), T(), T([52, G6]), T(), T([60, '^^^^']),
  L([44, G6]), L(), L(), OCO, T(), T(), T([12, G6]), T([0, '^^']), T(), T([4, G6]), T(), T([2, '^^']),
  L([12, G6]), L(), L(), OCO, T(), T(), T([44, G6]), T([60, '^^^']), T(), T([52, G6]), T(),
];

// FLORES (50–79): degraus longos de um lado e do outro; as flores-catapulta são o atalho
const FLORES = [
  T(), T([44, G6]), T(), T(), T([52, G6]), T(), T(), L([44, G6]), L(), L(), OCO, T(), T(), T([12, G6]), T(), T(),
  T([4, G6]), T(), T(), L([12, G6]), L(), L(), OCO, T(), T(), T([44, G6]), T(), T(), T([52, G6]), T([58, '|']),
];

// CIPÓS (80–109): cipó da direita (vem da corda), corda sobre o vazio, oco e o cipó da esquerda
const CIPOS = [
  ...R(T([58, '|']), 12), T([44, '_______________'], [60, '====']), T(), L(), L(), L(),
  T([22, G6], [36, G8]), ...R(T([20, '|']), 12),
];

// NINHOS (110–139): ziguezague com ninhos e marimbondos; galho secreto à direita (bromélia)
const NINHOS = [
  T(), T([12, G6]), T(), T(), T([4, G6]), T(), T([57, '=======']), L([12, G6]), L(), L(), OCO, T(), T(),
  T([44, G6]), T(), T(), T([52, G6]), T(), T(), L([44, G6]), L(), L(), OCO, T(), T(), T([12, G6]), T(), T(),
  T([4, G6]), T(),
];

// GALHOS (140–169): o ziguezague longo do lado direito, com Javalins nos galhos
const GALHOS = [
  T(), L([12, G6]), L(), L(), OCO, T(), T(), T([44, G6]), T(), T(), T([52, G6]), T(), T(), T([44, G6]), T(), T(),
  T([36, G6]), T(), T(), T([44, G6]), T(), T(), T([52, G6]), T(), T(), L([44, G6]), L(), L(), T([20, G8], [36, G8]), T(),
];

// RAÍZES (170–189): o chão das raízes; à esquerda o caminho, à direita a escadinha da porta secreta
const RAIZES = [
  T(), T([12, G6]), T(), T(), T([4, G6], [50, G6]), T(), T(), T([12, G6], [58, G6]), T(), T(),
  T([20, G8], [50, G6]), T(), T(), T([12, G6], [42, G6]), T(), T(),
  ...R(cheio(64), 4),
];

const nivel: LevelDef = {
  id: '5-1',
  nome: 'Copa da Sumaúma',
  mundo: 5,
  tipo: 'vertical',
  tileset: 'copa',
  parallax: 'copa',
  preset: 'selva',
  music: 'copa',
  ambience: 'amb-copa',
  tilemap: [...COPA, ...ESPINHOS, ...FLORES, ...CIPOS, ...NINHOS, ...GALHOS, ...RAIZES],
  start: [8, 186],
  checkpoint: [24, 120],
  exit: [13, 9],
  moedaFolha: [57, 5.4],
  bonusRooms: ['5-1-b1'],
  targetTime: 300,
  gags: ['gag_tedio', 'gag_parceiro_preso', 'gag_morte_comica'],
  totemPrizes: ['vida:3', 'castanhas:50', 'parafusos:50', 'ficha'],
  entities: [
    { t: 'npc', id: 'vo-bugio', x: 4, y: 186, falas: ['Quatorze folhas plantadas! A sumaúma acordou e abriu a escada dela.', 'Lá no alto está a flor da Semente-Mãe. Subam pelos ocos do tronco, de um lado para o outro.', 'Eu espero aqui embaixo. Alguém tem que segurar a árvore.'] },
    { t: 'arma', id: 'galho', x: 12, y: 186 },
    { t: 'bromelia', x: 22, y: 186 },
    { t: 'porta-bonus', x: 52.5, y: 174, room: '5-1-b1', oculta: true },
    { t: 'cacho', x: 61, y: 176 },
    { t: 'marimbondo', x: 16, y: 175.5, rota: 'vaivem', raio: 4 },
    { t: 'javalim', x: 23.5, y: 168, patrulha: [20.5, 26.5] },
    { t: 'javalim', x: 40, y: 168, patrulha: [36.5, 43] },
    { t: 'marimbondo', x: 52, y: 160, rota: 'oito', raio: 2.5 },
    { t: 'javalim-escudo', x: 46.5, y: 153, patrulha: [44.5, 49] },
    { t: 'cascavel', x: 54.5, y: 150 },
    { t: 'arma', id: 'coco', x: 38, y: 144 },
    { t: 'javalim', x: 23.5, y: 144, patrulha: [20.5, 26.5], arma: 'galho' },
    { t: 'marimbondo', x: 10, y: 136.5, rota: 'circulo', raio: 1.8 },
    { t: 'ninho', x: 6.5, y: 138 },
    { t: 'marimbondo', x: 48, y: 126, rota: 'vaivem', raio: 3 },
    { t: 'bromelia', x: 46, y: 123, forca: 1750 },
    { t: 'balao', x: 60, y: 114.5, n: 3 },
    { t: 'marimbondo', x: 16, y: 115.5, rota: 'oito', raio: 2.2 },
    { t: 'arma', id: 'guarda-chuva', x: 6.5, y: 114 },
    { t: 'plataforma', x: 47, y: 107, w: 3, path: [[47, 107], [47, 98]], vel: 70 },
    { t: 'marimbondo', x: 51, y: 89, rota: 'vaivem', raio: 4, vel: 1.2 },
    { t: 'marimbondo', x: 40, y: 85, rota: 'circulo', raio: 2 },
    { t: 'flor-catapulta', x: 54.5, y: 78, ang: -118, forca: 1550 },
    { t: 'flor-catapulta', x: 6.5, y: 66, ang: -55, forca: 1450, gira: true },
    { t: 'serrote', x: 14, y: 60, amp: 1.2, freq: 0.5, alcance: 5 },
    { t: 'serrote', x: 50, y: 34, amp: 1, freq: 0.6, alcance: 5 },
    { t: 'marimbondo', x: 8, y: 31, rota: 'vaivem', raio: 3 },
    { t: 'serrote', x: 48, y: 19.5, amp: 0.8, freq: 0.7, alcance: 4 },
    { t: 'npc', id: 'tucano', x: 20, y: 9, falas: ['Olhem lá embaixo! A ilha inteira está verde de novo.', 'A Semente-Mãe brilha nesta flor. Toquem o totem — vocês merecem a vista.'] },
  ],
  coins: [
    { path: [[13, 181.6], [17, 181.6]] },
    { path: [[21, 178.6], [27, 178.6]] },
    { path: [[5, 172.6], [9, 172.6]] },
    { path: [[43, 181.6], [47, 181.6], [51, 178.6], [55, 178.6]], step: 1 },
    { path: [[21, 166.6], [27, 166.6]] },
    { path: [[29, 166.6], [35, 166.6]], step: 1 },
    { path: [[53, 160.6], [57, 160.6]] },
    { path: [[37, 154.6], [41, 154.6]] },
    { path: [[45, 145.6], [49, 145.6]] },
    { path: [[29, 142.6], [35, 142.6]], step: 1 },
    { path: [[5, 136.6], [9, 136.6]] },
    { path: [[21, 130.6], [27, 130.6]] },
    { path: [[53, 124.6], [57, 124.6]] },
    { path: [[46, 121], [52, 117], [58, 115.6]], step: 1 },
    { path: [[29, 118.6], [35, 118.6]], step: 1 },
    { path: [[20.5, 108], [20.5, 100]], step: 1 },
    { path: [[47, 105], [47, 99]], step: 1.2 },
    { path: [[29, 94.6], [35, 94.6]], step: 1 },
    { path: [[45, 93.6], [57, 93.6]], step: 1.2 },
    { path: [[58.5, 90], [58.5, 81]], step: 1.2 },
    { path: [[53, 76.6], [57, 76.6]] },
    { path: [[50, 72], [44, 62], [40, 55]], step: 1.1 },
    { path: [[29, 70.6], [35, 70.6]], step: 1 },
    { path: [[5, 64.6], [9, 64.6]] },
    { path: [[29, 58.6], [35, 58.6]], step: 1 },
    { path: [[45, 49.6], [49, 49.6]] },
    { path: [[29, 40.6], [35, 40.6]], step: 1 },
    { path: [[5, 34.6], [9, 34.6]] },
    { path: [[29, 28.6], [35, 28.6]], step: 1 },
    { path: [[53, 22.6], [57, 22.6]] },
    { path: [[29, 13.6], [35, 13.6]] },
    { path: [[40, 10.6], [44, 10.6]] },
    { path: [[48, 7.6], [52, 7.6]] },
    { path: [[9, 7.6], [22, 7.6]], step: 1, cacho: true },
  ],
  cameraZones: [
    { x0: 0, x1: 64, zoom: 0.88 },
  ],
  decor: [
    { d: 'copa/galho-g', x: 6, y: 186 },
    { d: 'copa/folha-gigante', x: 17, y: 186, front: true },
    { d: 'copa/ninho-aves', x: 14.5, y: 183, s: 0.7 },
    { d: 'copa/folha-gigante', x: 52.5, y: 174, front: true, s: 1.1 },
    { d: 'copa/flor-sumauma', x: 46, y: 186 },
    { d: 'copa/galho-g', x: 58, y: 186, flip: true },
    { d: 'copa/semente-luz', x: 24, y: 168 },
    { d: 'copa/folha-gigante', x: 55, y: 162 },
    { d: 'copa/ninho-aves', x: 38.5, y: 156 },
    { d: 'copa/galho-g', x: 46, y: 147, s: 0.8 },
    { d: 'copa/ninho-aves', x: 7, y: 138, s: 0.9 },
    { d: 'copa/folha-gigante', x: 15, y: 135 },
    { d: 'copa/ninho-aves', x: 55, y: 126 },
    { d: 'copa/flor-sumauma', x: 60, y: 116 },
    { d: 'copa/semente-luz', x: 24, y: 120 },
    { d: 'copa/folha-gigante', x: 7, y: 114, front: true },
    { d: 'copa/galho-g', x: 39, y: 97 },
    { d: 'copa/folha-gigante', x: 62, y: 92 },
    { d: 'copa/flor-sumauma', x: 54.5, y: 78, s: 0.8 },
    { d: 'copa/ninho-aves', x: 40, y: 72 },
    { d: 'copa/semente-luz', x: 7, y: 66 },
    { d: 'copa/folha-gigante', x: 24, y: 60 },
    { d: 'copa/galho-g', x: 54, y: 54, flip: true },
    { d: 'copa/ninho-aves', x: 23, y: 42 },
    { d: 'copa/folha-gigante', x: 6, y: 36, front: true },
    { d: 'copa/semente-luz', x: 40, y: 30 },
    { d: 'copa/ninho-aves', x: 54.5, y: 24 },
    { d: 'copa/galho-g', x: 39, y: 18 },
    { d: 'copa/flor-sumauma', x: 31.5, y: 15, s: 1.2 },
    { d: 'copa/folha-gigante', x: 22, y: 12, front: true },
    { d: 'copa/flor-sumauma', x: 11, y: 9, s: 2.2 },
    { d: 'copa/semente-luz', x: 13, y: 9, s: 1.6 },
    { d: 'copa/folha-gigante', x: 57, y: 6, front: true, s: 1.3 },
    { d: 'copa/galho-g', x: 50, y: 9, flip: true },
  ],
};
export default nivel;
