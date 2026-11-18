import type { ModelDef } from '../render/types';
import { models as heroes } from './heroes/index';
import { models as mounts } from './mounts/index';
import { models as enemies } from './enemies/index';
import { models as bosses } from './bosses/index';
import { models as npcs } from './npcs/index';
import { models as props } from './props/index';
import { models as weapons } from './weapons/index';
import { models as pickups } from './pickups/index';
import { models as fx } from './fx/index';

export const MODELS: ModelDef[] = [...heroes, ...mounts, ...enemies, ...bosses, ...npcs, ...props, ...weapons, ...pickups, ...fx];
