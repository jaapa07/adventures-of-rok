/** Persistência em localStorage com try/catch e fallback em memória. */
import type { Options, SaveSlot, LevelProgress } from '../game/types';
import { DEFAULT_KEYS, setKeymap } from './input';

const mem = new Map<string, string>();
function get(k: string): string | null { try { return localStorage.getItem(k); } catch { return mem.get(k) ?? null; } }
function set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { mem.set(k, v); } }
function del(k: string) { try { localStorage.removeItem(k); } catch { mem.delete(k); } }

const OPT = 'sumauma:opcoes';
const SLOT = (i: number) => `sumauma:save${i}`;

export const defaultOptions = (): Options => ({ musica: 0.7, sfx: 0.85, ambiente: 0.6, qualidade: 'alta', tremor: true, assistencia: false, teclas: { ...DEFAULT_KEYS } });

export function loadOptions(): Options {
  try { const o = { ...defaultOptions(), ...JSON.parse(get(OPT) ?? '{}') } as Options; setKeymap(o.teclas); return o; } catch { return defaultOptions(); }
}
export function saveOptions(o: Options) { set(OPT, JSON.stringify(o)); setKeymap(o.teclas); }

export function newSlot(): SaveSlot {
  return {
    version: 1, created: Date.now(), playTime: 0, vidas: 5, castanhas: 0, banco: 0, parafusos: 0,
    levels: {}, unlocked: ['1-1'], mapPos: '1-1', upgrades: {},
    album: { fotos: [], cartas: {}, figurinos: ['tama:base', 'lili:base'] },
    figurino: { tama: 'base', lili: 'base' }, desafios: {}, desafiosOk: [], totals: {},
  };
}
export function loadSlot(i: number): SaveSlot | null {
  try { const s = get(SLOT(i)); return s ? { ...newSlot(), ...JSON.parse(s) } : null; } catch { return null; }
}
export function writeSlot(i: number, s: SaveSlot) { set(SLOT(i), JSON.stringify(s)); }
export function deleteSlot(i: number) { del(SLOT(i)); }

export function levelProgress(s: SaveSlot, id: string): LevelProgress {
  return (s.levels[id] ??= { done: false, letras: false, moeda: false, bonus: [], medals: {} });
}

/** Estado global da sessão. */
export const game = {
  options: loadOptions(),
  slotIndex: 0,
  save: newSlot(),
  persist() { writeSlot(this.slotIndex, this.save); },
};

/** Porcentagem de conclusão (fases, letras, moedas, bônus, medalhas). */
export function completion(s: SaveSlot, allLevels: { id: string; bonusRooms?: string[] }[]): number {
  let total = 0, got = 0;
  for (const l of allLevels) {
    const p = s.levels[l.id];
    total += 3 + (l.bonusRooms?.length ?? 0);
    if (!p) continue;
    got += (p.done ? 1 : 0) + (p.letras ? 1 : 0) + (p.moeda ? 1 : 0) + p.bonus.length;
  }
  return total ? Math.round((got / total) * 100) : 0;
}
