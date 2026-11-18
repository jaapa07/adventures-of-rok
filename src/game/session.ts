/** Estado de uma tentativa de fase (sobrevive à troca para sala bônus e aos respawns). */
import { TILE } from './types';
export class Session {
  collected = new Set<string>();
  letras = [false, false, false, false];
  moeda = false;
  bonusDone = new Set<string>();
  gags = new Set<string>();
  time = 0;
  partnerLostEver = false;
  castanhas = 0;
  parafusos = 0;
  deaths = 0;
  foto = false;
  constructor(public levelId: string) {}
  key(t: string, x: number, y: number) { return `${t}@${Math.round(x / TILE * 4)},${Math.round(y / TILE * 4)}`; }
}
export const current: { session: Session | null } = { session: null };
