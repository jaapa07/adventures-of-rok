/**
 * CHEFE 1 — MAJOR MOTOSSERRA, na clareira que ele mesmo abriu no fim do Rio das Toras.
 * Arena plana de 32 × 12 (entre as paredes) com duas sumaúmas (arvore-chefe) onde a serra dele fica presa: é aí
 * que ele fica vulnerável. Palmeiras enormes ao fundo, dois galhos altos no meio para escapar das investidas.
 */
import type { LevelDef } from '../../game/types';

const nivel: LevelDef = {
  id: 'chefe-1',
  nome: 'Major Motosserra',
  mundo: 1,
  tipo: 'chefe',
  tileset: 'mata',
  parallax: 'mata-tarde',
  preset: 'por-do-sol',
  music: 'chefe',
  ambience: 'amb-mata',
  boss: 'major-motosserra',
  tilemap: [
    '##................................##',
    '##................................##',
    '##................................##',
    '##................................##',
    '##................................##',
    '##..........====....====..........##',
    '##................................##',
    '##................................##',
    '##................................##',
    '##................................##',
    '####################################',
    '####################################',
  ],
  start: [5, 10],
  entities: [
    // as duas sumaúmas onde a serra do Major fica presa (uma perto de cada parede) — antes do chefe, que as procura pela tag
    { t: 'arvore-chefe', x: 6.5, y: 10, altura: 6 },
    { t: 'arvore-chefe', x: 29.5, y: 10, altura: 6 },
    { t: 'chefe', id: 'major-motosserra', x: 27, y: 10, dir: -1, arena: [2, 34] },
  ],
  coins: [
    { path: [[12.5, 4.4], [15.5, 4.4]] },
    { path: [[20.5, 4.4], [23.5, 4.4]] },
  ],
  decor: [
    { d: 'mata/palmeira-jovem', x: 10.5, y: 10, s: 1.7 },
    { d: 'mata/palmeira-jovem', x: 18, y: 10, s: 2.1, flip: true },
    { d: 'mata/palmeira-jovem', x: 25.5, y: 10, s: 1.7 },
    { d: 'mata/raiz', x: 6.5, y: 10, s: 1.5 },
    { d: 'mata/raiz', x: 18, y: 10, s: 1.5, flip: true },
    { d: 'mata/raiz', x: 29.5, y: 10, s: 1.5, flip: true },
    { d: 'mata/toco', x: 4, y: 10 },
    { d: 'mata/pilha-toras', x: 31, y: 10, flip: true },
    { d: 'mata/maquina-serraria', x: 22.5, y: 10, s: 0.8 },
    { d: 'mata/placa-serraria', x: 13, y: 10 },
    { d: 'mata/samambaia', x: 3, y: 10, front: true },
    { d: 'mata/samambaia', x: 32.5, y: 10, front: true, flip: true },
    { d: 'mata/cipo-pendente', x: 6.5, y: 0 },
    { d: 'mata/cipo-pendente', x: 29.5, y: 0, flip: true },
    { d: 'mata/heliconia', x: 14.5, y: 10, front: true },
  ],
  cameraZones: [{ x0: 0, x1: 36, zoom: 0.92, lockY: 6 }],
};
export default nivel;
