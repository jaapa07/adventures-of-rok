/** Carrega todas as fases de src/data/levels (no Node, sem import.meta.glob). */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { LevelDef } from '../../src/game/types';
import { ROOT } from './renderhost';

export async function loadLevels(): Promise<Record<string, LevelDef>> {
  const dir = resolve(ROOT, 'src/data/levels');
  const out: Record<string, LevelDef> = {};
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.ts') || f === 'index.ts' || f === 'util.ts') continue;
    const m = (await import(pathToFileURL(resolve(dir, f)).href)) as { default?: LevelDef };
    if (m.default) out[m.default.id] = m.default;
  }
  return out;
}
