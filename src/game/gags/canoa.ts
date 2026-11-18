/**
 * gag_canoa (1-4) — CORRIDA DE CANOA.
 * Dois Javalins remam ("remar") numa canoa rival. Quando o líder chega perto da largada, eles partem
 * rumo à chegada. Um golpe (ou pisão) num remador ROUBA O REMO: o herói recebe a arma `remo` (ou ela
 * cai ao lado, se as mãos estiverem ocupadas), o Javalim fica "desarmado" e a canoa perde metade da
 * força. Sem remos, a canoa fica à deriva, girando na correnteza. A canoa é um sólido atravessável
 * por baixo (dá para pular nela). Se chegarem primeiro, comemoram dançando.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_canoa', x, y, ate, vel?, largada? }
 *   - x: coluna inicial da canoa; y: linha da SUPERFÍCIE da água (linha do primeiro '~')
 *   - ate: coluna da chegada; vel: px/s com os 2 remos (padrão 210)
 *   - largada: distância em tiles do líder até a canoa para começar (padrão 6)
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import type { Solid } from '../physics';
import type { World } from '../world';
import type { Hero } from '../hero';
import { WEAPONS } from '../weapons/types';
import { bus } from '../../core/events';
import { TILE } from '../types';
import { defineGag, gagDone, say, Ator, num, px, fx } from './common';

type Estado = 'espera' | 'corrida' | 'deriva' | 'venceu';

class Canoa extends Entity {
  canoa!: Ator;
  remadores: Ator[] = [];
  remos = [true, true];
  sol!: Solid;
  estado: Estado = 'espera';
  chegada: number; vel: number; largada: number; agua: number;
  v = 0; t = 0; provocaT = 0.5;
  sentido: 1 | -1;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.agua = px(s.y);
    this.chegada = px(num(s.ate, s.x + 60));
    this.vel = num(s.vel, 210);
    this.largada = px(num(s.largada, 6));
    this.sentido = this.chegada >= this.x ? 1 : -1;
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.canoa = w.add(new Ator(w, 'canoa', this.x, this.agua + 6, { anim: 'idle', t: 'canoa', w: 260, h: 40, z: 21 }));
    this.sol = w.addSolid({ x: this.x - 125, y: this.agua - 22, w: 250, h: 24, oneway: true, owner: this });
    for (const k of [0, 1]) {
      const j = w.add(new Ator(w, 'javalim', this.x, this.agua - 8, { anim: 'idle', t: 'javalim', team: 'enemy', w: 60, h: 90, z: 19 + k }));
      j.stompable = true;
      j.hitFn = (h) => this.roubar(k, h);
      j.stompFn = (hero) => { this.roubar(k, { kind: 'pisao', dmg: 1, dir: hero.dir, x: hero.x, y: hero.y }); return 'bounce'; };
      this.remadores.push(j);
    }
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader;
    const n = this.remos.filter(Boolean).length;
    switch (this.estado) {
      case 'espera':
        this.provocaT -= dt;
        if (this.provocaT <= 0 && Math.abs(L.x - this.x) < 900) { this.provocaT = 99; say(w, this.remadores[0], 'javalim', 'Aposto meu almoço que a gente chega antes!', 120); }
        if (Math.abs(L.x - this.x) < this.largada) {
          this.estado = 'corrida';
          say(w, this.remadores[1], 'javalim', 'Rema! Rema! REMA!', 120, 'grito');
          w.text('JÁ!', this.x, this.agua - 220);
          w.sfx('ui-confirmar', this.x);
        }
        break;
      case 'corrida': {
        const alvo = this.vel * (n / 2);
        this.v += (alvo - this.v) * Math.min(1, dt * 1.5);
        if (n === 0) { this.estado = 'deriva'; say(w, this.remadores[0], 'javalim', 'E agora?! Rema com a mão!', 120); }
        if ((this.chegada - this.x) * this.sentido <= 0) {
          this.estado = 'venceu';
          say(w, this.remadores[0], 'javalim', 'Ganhamos! Ganhamos!', 120, 'grito');
        }
        break;
      }
      case 'deriva':
        this.v += (-28 - this.v) * Math.min(1, dt * 0.8);
        break;
      case 'venceu':
        this.v *= Math.pow(0.2, dt);
        break;
    }
    const sentido = this.sentido;
    this.x += sentido * this.v * dt;
    // a deriva para nas margens (água acaba)
    const g = w.grid;
    if (g.atPx(this.x + sentido * 140, this.agua + 8) !== g.atPx(this.x, this.agua + 8)) { this.x -= sentido * this.v * dt; this.v = 0; }
    const C = this.canoa;
    C.x = this.x; C.y = this.agua + 6 + Math.sin(this.t * 2.2) * 3;
    C.rot = this.estado === 'deriva' ? Math.sin(this.t * 1.3) * 6 : Math.sin(this.t * 2.2) * 1.5;
    C.dir = sentido as 1 | -1;
    C.play(this.estado === 'corrida' && n > 0 ? 'remar' : 'idle');
    this.sol.x = this.x - 125; this.sol.y = C.y - 28; this.sol.vx = sentido * this.v;
    this.remadores.forEach((j, k) => {
      j.x = this.x + (k === 0 ? -62 : 58) * sentido; j.y = C.y - 4; j.dir = sentido as 1 | -1;
      j.rot = C.rot;
      if (this.estado === 'venceu') j.play('dancar');
      else if (!this.remos[k]) j.play(this.estado === 'deriva' ? 'tonto' : 'desarmado');
      else j.play(this.estado === 'corrida' ? 'remar' : 'idle');
    });
    if (this.estado === 'corrida' && Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) w.spawnFx('fx-agua', 'respingo', this.x - sentido * 130, this.agua, { scale: 0.6 });
  }

  private roubar(k: number, h: HitInfo) {
    if (!this.remos[k]) return false;
    const w = this.world, j = this.remadores[k], L = w.duo.leader as Hero;
    this.remos[k] = false;
    j.play('susto', { restart: true });
    j.sfx('javali-susto');
    w.text('ROUBEI!', j.x, j.y - 150);
    fx(w, 'fx-faisca', ['impacto'], j.x, j.y - 60);
    const def = WEAPONS['remo'];
    if (def && !L.held && L.state !== 'mounted') {
      L.equip({ def, usos: def.usos });
      bus.emit('weapon-pick', { id: 'remo' });
      w.sfx('arma-pegar', L.x);
    } else {
      w.spawn({ t: 'arma', id: 'remo', x: (L.x - L.dir * 50) / TILE, y: (h.kind === 'pisao' ? this.agua - 22 : L.y) / TILE });
    }
    say(w, j, 'javalim', k === 0 ? 'Meu remo! Devolve!' : 'Ô! Isso é patrimônio da Javarda!', 120);
    gagDone(w, 'gag_canoa');
    return true;
  }
  destroy() { this.world.removeSolid(this.sol); }
}

defineGag('gag_canoa', (w, s) => new Canoa(w, s));
