import type { SceneDef } from '../../scenery/types';
import { ABERTURA } from './abertura';
import { FINAL, TELAS } from './final';
export const CINE_SCENES: SceneDef[] = [...ABERTURA, ...FINAL, ...TELAS];
