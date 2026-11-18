/**
 * Marcos da fase: Ninho do Reencontro, Totem de Cipó (checkpoint), Totem de Saída (roleta autoral de prêmios)
 * e Caixa da Montaria.
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { game } from '../../core/save';
import { bus } from '../../core/events';
import { heroTouching, grantPrize, prizeVisual, jitter } from '../pickups/common';
import { burst } from '../pickups/coletaveis';

/* ------------------------------------------------------------------ */
export class Ninho extends Entity {
  broken = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'neutral'; this.stompable = true; this.w = 110; this.h = 100; this.z = 26; }
  init() { this.makeSprite('ninho', 'idle', { shadow: true }); }
  update(dt: number) { this.sprite?.update(dt); if (this.broken && this.sprite?.ended) this.kill(); }
  onStomp() { this.quebrar(); return 'bounce' as const; }
  onHit(h: HitInfo) { if (h.kind === 'outro' && !h.weapon) return false; this.quebrar(); return true; }
  onInteract() { if (this.broken) return false; this.quebrar(); return true; }
  quebrar() {
    if (this.broken) return;
    this.broken = true;
    this.stompable = false;
    this.world.collect(this);
    this.sprite?.play('quebrar', { restart: true });
    this.sfx('ninho-quebrar');
    this.world.spawnFx('fx-lascas', 'madeira', this.x, this.y - 50);
    for (let k = 0; k < 4; k++) this.world.spawnFx('fx-folhas', `folha${k + 3 > 6 ? 1 : k + 3}`, this.x, this.y - 60, { vx: jitter((k - 1.5) * 110), vy: jitter(-280), gravity: 420, life: 1.3, fade: 0.5, loop: true });
    const d = this.world.duo;
    if (d.recoverPartner(this.x, this.y - 30)) {
      this.world.text('JUNTOS DE NOVO!', this.x, this.y - this.h - 20);
      this.world.spawnFx('fx-coracao', 'abraco', this.x, this.y - 120, { z: 70 });
      bus.emit('ninho', { recuperou: true });
    } else {
      burst(this.world, 'castanha', this.x, this.y - 40, 5);
      bus.emit('ninho', { recuperou: false });
    }
  }
}

/* ------------------------------------------------------------------ */
export class TotemCipo extends Entity {
  lit = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'neutral'; this.w = 80; this.h = 170; this.z = 18; }
  init() {
    const cp = game.save.lastCheckpoint;
    this.lit = !!cp && cp.level === this.world.level.id && Math.abs(cp.x - this.spawn.x) < 0.6 && Math.abs(cp.y - this.spawn.y) < 0.6;
    this.makeSprite('totem-cipo', this.lit ? 'aceso' : 'apagado', { shadow: true });
  }
  update(dt: number) {
    this.sprite?.update(dt);
    if (!this.lit && heroTouching(this, 6, true)) this.acender();
    if (this.lit && Math.floor(this.world.time * 2) !== Math.floor((this.world.time - dt) * 2)) {
      this.world.spawnFx('fx-brilho', 'totem', this.x + Math.sin(this.world.time * 3) * 14, this.y - this.h * 0.85, { vy: -40, scale: 0.45, life: 0.8, fade: 0.4, z: 19 });
    }
  }
  acender() {
    this.lit = true;
    this.world.setCheckpoint(this.x, this.y);
    this.sprite?.play('acender', { restart: true, onEnd: () => this.sprite?.play('aceso') });
    this.sfx('totem-acender');
    this.sfx('checkpoint');
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k - 3.5) * 0.28;
      this.world.spawnFx('fx-brilho', 'totem', this.x, this.y - this.h * 0.75, { vx: jitter(Math.cos(a) * 240), vy: jitter(Math.sin(a) * 380), gravity: 500, life: 1.1, fade: 0.5, scale: 0.6, z: 70 });
    }
    this.world.text('CHECKPOINT!', this.x, this.y - this.h - 10, 'small');
  }
  light() { return this.lit ? { x: this.x, y: this.y - this.h * 0.7, r: 220, flicker: 0.06 } : null; }
}

/* ------------------------------------------------------------------ */
export class TotemSaida extends Entity {
  private spinning = false;
  private t = 0;
  private premio: string | null = null;
  private shown = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'neutral'; this.w = 90; this.h = 200; this.z = 18; }
  init() { this.makeSprite('totem-saida', 'idle', { shadow: true }); }
  update(dt: number) {
    this.sprite?.update(dt);
    if (!this.spinning) {
      if (heroTouching(this, 0, true) && !this.world.finished) this.girar();
      return;
    }
    this.t += dt;
    if (this.t < 1.3 && Math.floor(this.t * 10) !== Math.floor((this.t - dt) * 10)) this.sfx('relogio-tic', 0.5);
    if (!this.shown && this.t >= 1.3) {
      this.shown = true;
      if (this.premio) {
        const v = prizeVisual(this.premio);
        this.world.spawnFx(v.model, v.anim, this.x, this.y - this.h - 10, { vy: -70, life: 1.8, fade: 0.5, loop: true, z: 75, scale: 1.3 });
        this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h - 30, { scale: 1.5, z: 74 });
        this.world.text(v.label.toUpperCase(), this.x, this.y - this.h - 70);
        grantPrize(this.world, this.premio);
        bus.emit('totem-premio', { premio: this.premio });
      }
    }
    if (this.t >= 2.3) this.world.complete();
  }
  girar() {
    this.spinning = true;
    const prizes = this.world.level.totemPrizes ?? [];
    // índice determinístico pela hora do jogo: a tabela é autoral, a parada depende do momento do toque
    this.premio = prizes.length ? prizes[Math.floor(this.world.time * 10) % prizes.length] : null;
    this.sprite?.play('girar', { restart: true });
    this.sfx('totem-girar');
    const L = this.world.duo.leader;
    if (L.state !== 'mounted') { L.setState('cutscene'); L.b.vx = 0; }
    bus.emit('totem-saida', { level: this.world.level.id });
  }
}

/* ------------------------------------------------------------------ */
export class CaixaMontaria extends Entity {
  m: string;
  broken = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.m = String(s.m ?? 'ema'); this.team = 'neutral'; this.stompable = true; this.w = 120; this.h = 110; this.z = 26; }
  init() { this.makeSprite('caixa-montaria', 'idle', { shadow: true, variant: this.m }); }
  update(dt: number) { this.sprite?.update(dt); if (this.broken && this.sprite?.ended) this.kill(); }
  onStomp() { this.quebrar(); return 'bounce' as const; }
  onHit(h: HitInfo) { if (h.kind === 'outro' && !h.weapon) return false; this.quebrar(); return true; }
  onInteract() { if (this.broken) return false; this.quebrar(); return true; }
  quebrar() {
    if (this.broken) return;
    this.broken = true; this.stompable = false;
    this.world.collect(this);
    this.sprite?.play('quebrar', { restart: true });
    this.sfx('caixa-quebrar');
    this.world.shake(4, 160);
    this.world.spawnFx('fx-lascas', 'madeira', this.x, this.y - 60, { scale: 1.3 });
    this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 1.4 });
    const e = this.world.spawn({ t: this.m, x: this.spawn.x, y: this.spawn.y, dir: this.dir });
    if (!e) this.world.toast(`A montaria ${this.m} ainda não pode sair da caixa.`);
    this.world.text(this.m.toUpperCase() + '!', this.x, this.y - this.h - 10);
    bus.emit('caixa-montaria', { m: this.m });
  }
}

register('ninho', (w, s) => new Ninho(w, s));
register('totem-cipo', (w, s) => new TotemCipo(w, s));
register('totem-saida', (w, s) => new TotemSaida(w, s));
register('caixa-montaria', (w, s) => new CaixaMontaria(w, s));
