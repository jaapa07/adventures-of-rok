/**
 * Liga os sistemas incrementais ao barramento de eventos: Desafios do Tucano, cartas do bestiário,
 * medalhas (evento 'medalha'), arma do Brinde na próxima fase.
 * Emite 'desafio-ok' {id, titulo} e 'carta-ok' {id} para o HUD.
 */
import { bus } from '../core/events';
import { game } from '../core/save';
import { DESAFIOS, type RunState } from '../data/desafios';
import { CARTAS } from '../data/album';
import { avancarDesafio, registrarDerrota, extra } from '../game/progress';
import { WEAPONS } from '../game/weapons/types';
import { LEVELS } from '../data/levels/index';
import { screens } from './screens/manager';
import type { World } from '../game/world';

const run: RunState = { level: '', cocoHits: 0, lamparina: false, bonus: false };
/** desafios que avançaram na tentativa atual: id → progresso antes da fase */
export const avancoNaFase = new Map<string, number>();

const byEvent = new Map<string, typeof DESAFIOS>();
for (const d of DESAFIOS) for (const e of d.ev) (byEvent.get(e) ?? byEvent.set(e, []).get(e)!).push(d);

function onAny(ev: string, data: unknown) {
  const list = byEvent.get(ev);
  if (!list) return;
  for (const d of list) {
    if (game.save.desafiosOk.includes(d.id)) continue;
    const n = d.conta(ev, data, { run });
    if (n > 0) {
      if (!avancoNaFase.has(d.id)) avancoNaFase.set(d.id, game.save.desafios[d.id] ?? 0);
      if (avancarDesafio(d.id, n)) { bus.emit('desafio-ok', { id: d.id, titulo: d.titulo }); bus.emit('sfx', { id: 'desafio-ok', pan: 0, vol: 1 }); game.persist(); }
    }
  }
}

function currentWorld(): World | null {
  for (let i = screens.stack.length - 1; i >= 0; i--) { const w = (screens.stack[i] as { world?: World | null }).world; if (w) return w; }
  return null;
}

let ligado = false;
export function startSystems() {
  if (ligado) return;
  ligado = true;
  bus.on('*', ({ ev, data }) => onAny(ev, data));
  bus.on('level-start', (d) => {
    const L = LEVELS[d?.id];
    const bonus = !!d?.bonus || L?.tipo === 'bonus';
    if (!bonus && d?.id !== run.level) {
      run.level = d.id; run.cocoHits = 0; run.lamparina = false; run.perdeu = false;
      avancoNaFase.clear();
    }
    run.bonus = bonus;
    // arma do Brinde do Bem-te-vi: entra na mão na próxima fase
    const x = extra();
    if (!bonus && x.brindeArma) {
      const def = WEAPONS[x.brindeArma];
      const id = x.brindeArma;
      setTimeout(() => {
        const w = currentWorld();
        if (!w || !def) return;
        w.duo.leader.equip({ def, usos: def.usos });
        w.toast(`Brinde do Bem-te-vi: ${def.nome}!`, 'presente');
        delete x.brindeArma;
        game.persist();
        bus.emit('held', { id, usos: def.usos });
      }, 400);
    }
  });
  bus.on('enemy-kill', (d) => {
    if (!d?.type) return;
    const k = `kill-${d.type}`;
    game.save.totals[k] = (game.save.totals[k] ?? 0) + 1;
    if (d.weapon) game.save.totals[`arma-${d.weapon}`] = (game.save.totals[`arma-${d.weapon}`] ?? 0) + 1;
    if (registrarDerrota(d.type, d.how ?? 'outro')) {
      const c = CARTAS.find((x) => x.id === d.type);
      bus.emit('carta-ok', { id: d.type, nome: c?.nome });
    }
  });
}
