import type { SceneDef } from './types';
import { tilesetScenes } from './tiles/common';
import { mataTheme } from './tiles/mata';
import { grutaTheme } from './tiles/gruta';
import { recifeTheme } from './tiles/recife';
import { fabricaTheme } from './tiles/fabrica';
import { cristalTheme } from './tiles/cristal';
import { copaTheme } from './tiles/copa';
import { MATA_SCENES } from './parallax/mata';
import { OTHER_PARALLAX } from './parallax/sets';
import { MAP_SCENES } from './map/ilha';
import { MATA_DECOR_SCENES } from './decor/mata';
import { GRUTA_DECOR_SCENES } from './decor/gruta';
import { RECIFE_DECOR_SCENES } from './decor/recife';
import { FABRICA_DECOR_SCENES } from './decor/fabrica';
import { CRISTAL_DECOR_SCENES, COPA_DECOR_SCENES } from './decor/cristal-copa';
export type { SceneDef };
export const SCENES: SceneDef[] = [
  ...[mataTheme, grutaTheme, recifeTheme, fabricaTheme, cristalTheme, copaTheme].flatMap(tilesetScenes),
  ...MATA_SCENES,
  ...OTHER_PARALLAX,
  ...MAP_SCENES,
  ...MATA_DECOR_SCENES,
  ...GRUTA_DECOR_SCENES,
  ...RECIFE_DECOR_SCENES,
  ...FABRICA_DECOR_SCENES,
  ...CRISTAL_DECOR_SCENES,
  ...COPA_DECOR_SCENES,
];
