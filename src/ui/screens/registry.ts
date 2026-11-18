/**
 * Fábricas de telas registradas pela camada de UI (desacopla o jogo das telas).
 * A UI registra: splash, intro, title, saves, map, hud, pause, options, results, gameover, ending, credits,
 * oficina, album, desafios, viveiro, levelcard, dialog.
 */
import type { Screen } from './manager';
type Factory = (args?: any) => Screen;
const F = new Map<string, Factory>();
export function registerScreen(id: string, f: Factory) { F.set(id, f); }
export function makeScreen(id: string, args?: any): Screen | null { const f = F.get(id); return f ? f(args) : null; }
export function hasScreen(id: string) { return F.has(id); }
