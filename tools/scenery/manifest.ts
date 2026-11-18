/** Partes determinísticas de public/assets/scenery.json (roda no Node, sem DOM). */
import { WATER_COLOR, SKY, PARALLAX_SETS, TILESETS, WATER_FRAME, LAYER_SIZE } from './data';
import { mapNodesPx, MAP_SIZE } from './map/layout';

export function sceneryManifestBase() {
  const parallax: Record<string, { src: string; w: number; h: number }[]> = {};
  for (const set of PARALLAX_SETS) {
    parallax[set] = [1, 2, 3, 4, 5].map((n) => ({ src: `assets/parallax/${set}/${n}.webp`, w: LAYER_SIZE[0], h: LAYER_SIZE[1] }));
  }
  const water: Record<string, { color: string; surface: string; sw: number; sh: number }> = {};
  for (const ts of TILESETS) water[ts] = { color: WATER_COLOR[ts], surface: `tiles/${ts}/water-surface.webp`, sw: WATER_FRAME[0], sh: WATER_FRAME[1] };
  return {
    parallax,
    sky: { ...SKY },
    water,
    map: {
      w: MAP_SIZE[0], h: MAP_SIZE[1],
      devastada: 'assets/map/ilha-devastada.webp',
      renascida: 'assets/map/ilha-renascida.webp',
      regioes: [1, 2, 3, 4].map((r) => `assets/map/regiao-${r}-verde.webp`),
    },
    mapNodes: mapNodesPx(),
  };
}
