/**
 * CHEFE 2 — RAINHA MORCEGA-LÂMPADA, no salão mais fundo das Grutas Âmbar.
 * Arena de 32 × 12 (entre as paredes) sob um teto de estalactites. Ela apaga a arena e só se vê pelas lâmpadas
 * dela; os dois braseiros nas pontas acendem as cabaças que a derrubam. As duas saliências servem para
 * arremessar de cima quando ela dá rasantes baixos.
 */
import type { LevelDef } from '../../game/types';

const nivel: LevelDef = {
  id: 'chefe-2',
  nome: 'Rainha Morcega-Lâmpada',
  mundo: 2,
  tipo: 'chefe',
  tileset: 'gruta',
  parallax: 'gruta',
  preset: 'caverna',
  music: 'chefe',
  ambience: 'amb-gruta',
  boss: 'rainha-morcega',
  tilemap: [
    '####################################',
    '####################################',
    '##....####........####.......####.##',
    '##................................##',
    '##................................##',
    '##................................##',
    '##.....=====............=====.....##',
    '##................................##',
    '##................................##',
    '##................................##',
    '####################################',
    '####################################',
  ],
  start: [4.5, 10],
  entities: [
    // os braseiros onde as cabaças pegam fogo — antes da chefe, que os procura ao iniciar
    { t: 'braseiro-chefe', x: 4, y: 10 },
    { t: 'braseiro-chefe', x: 32, y: 10 },
    { t: 'chefe', id: 'rainha-morcega', x: 18, y: 10, arena: [2, 34] },
  ],
  coins: [
    { path: [[7.5, 5.4], [11.5, 5.4]] },
    { path: [[24.5, 5.4], [28.5, 5.4]] },
  ],
  decor: [
    { d: 'gruta/estalactite', x: 9, y: 2 },
    { d: 'gruta/estalactite', x: 14, y: 2, flip: true },
    { d: 'gruta/estalactite', x: 24.5, y: 2 },
    { d: 'gruta/estalactite', x: 28, y: 3, flip: true },
    { d: 'gruta/coluna', x: 2.5, y: 10 },
    { d: 'gruta/coluna', x: 33.5, y: 10 },
    { d: 'gruta/estalagmite-g', x: 10, y: 10 },
    { d: 'gruta/estalagmite-p', x: 13, y: 10, front: true },
    { d: 'gruta/cristal-ambar', x: 18, y: 10 },
    { d: 'gruta/estalagmite-g', x: 26, y: 10, flip: true },
    { d: 'gruta/estalagmite-p', x: 23, y: 10, front: true, flip: true },
    { d: 'gruta/cogumelo-brilho', x: 6, y: 10, front: true },
    { d: 'gruta/cogumelo-brilho', x: 30, y: 10, front: true },
    { d: 'gruta/lamparina-parede', x: 8, y: 4 },
    { d: 'gruta/lamparina-parede', x: 28, y: 4 },
  ],
  cameraZones: [{ x0: 0, x1: 36, zoom: 0.92, lockY: 6 }],
};
export default nivel;
