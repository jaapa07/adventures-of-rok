/** Registro de todas as fases (normais, chefes, bônus e extra). */
import type { LevelDef } from '../../game/types';
const mods = import.meta.glob('./*.ts', { eager: true }) as Record<string, { default?: LevelDef }>;
export const LEVELS: Record<string, LevelDef> = {};
for (const [path, m] of Object.entries(mods)) {
  if (!m.default || path.includes('index') || path.includes('util')) continue;
  LEVELS[m.default.id] = m.default;
}
