/**
 * gag_barao_disfarce (chefe final) — A ÁRVORE DE BIGODE.
 * O chefe (Barão Javardo) cuida do disfarce e do ataque; o diretor de gags (diretor.ts) escuta:
 *   'barao-disfarce' {on: true, x?, y?}  → disfarçado (opcional x/y em px: onde está a "árvore")
 *   'barao-disfarce' {on: false} ou 'barao-revela' → revelado
 *   'boss-hit' {id: 'barao-javardo'} enquanto disfarçado (ou com {disfarce: true}) → gag + medalha secreta.
 * Este spawn é opcional: quando presente, o líder comenta a árvore suspeita ao chegar perto dela
 * enquanto o disfarce durar (dica para o jogador).
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_barao_disfarce', x, y }
 *   - x, y: onde fica a "árvore" (usado se o chefe não mandar x/y no evento)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, say } from './common';
import { estadoBarao } from './diretor';

class BaraoDisfarce extends Entity {
  comentou = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.persistent = true; }
  update() {
    if (this.comentou || !estadoBarao.disfarce) return;
    const w = this.world, L = w.duo.leader;
    const ax = estadoBarao.x || this.x;
    if (Math.abs(L.x - ax) < 420) {
      this.comentou = true;
      say(w, L, L.hid, L.isTama ? 'Essa árvore tem… bigode?' : 'Árvore não usa cartola, né?', L.h + 40);
    }
  }
}

defineGag('gag_barao_disfarce', (w, s) => new BaraoDisfarce(w, s));
