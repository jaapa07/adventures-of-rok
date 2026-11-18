/**
 * Coletáveis (seção 5.3 / 6): castanha, cacho, letras C-I-P-Ó, Moeda-Folha, fichas de montaria,
 * parafusos e balões-tucano. Todos giram/flutuam, brilham ao serem pegos e não reaparecem na tentativa.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import type { Hero } from '../hero';
import { bus } from '../../core/events';
import { current } from '../session';
import { upgradeLevel } from '../progress';
import { heroTouching, addCastanhas, addVidas, addParafusos, addFicha, faroFilter, jitter } from './common';

export abstract class Pickup extends Entity {
  protected bob = 0;
  protected phase: number;
  protected popT = 0; // < 0.25 s após saltar: ainda não coletável
  protected popping = false;
  protected magnetic = false;
  taken = false;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.team = 'pickup';
    this.w = 40; this.h = 44;
    this.phase = (s.x * 1.7 + s.y * 0.9) % 6.28;
    this.activeMargin = 300;
    if (typeof s.vx === 'number' || typeof s.vy === 'number') {
      this.popping = true;
      this.vx = (s.vx as number) ?? 0; this.vy = (s.vy as number) ?? -500;
    }
  }
  protected spriteFor(model: string, anim: string, variant?: string) {
    this.makeSprite(model, anim, { variant });
    if (this.popping) this.makeBody(this.w * 0.7, this.h * 0.6);
  }
  update(dt: number) {
    if (this.taken) return;
    this.popT += dt;
    if (this.popping && this.body) {
      const wasGround = this.body.onGround;
      this.physics(dt, 1700, 800);
      if (this.body.onGround) {
        this.vx *= 0.8;
        if (!wasGround && this.popT < 1.2) { this.vy = -Math.abs(this.vy) * 0.35 - 120; this.body.onGround = false; }
        if (Math.abs(this.vx) < 10) { this.popping = false; this.vx = 0; }
      }
      if (this.y > this.world.grid.pxH + 200) this.kill();
    } else if (this.magnetic || this.wantsMagnet()) {
      const l = this.world.duo.leader;
      const tx = l.x, ty = l.y - l.h * 0.5 + this.h / 2;
      const d = Math.hypot(tx - this.x, ty - this.y) || 1;
      const sp = Math.min(d / dt, 620);
      this.x += ((tx - this.x) / d) * sp * dt; this.y += ((ty - this.y) / d) * sp * dt;
      this.magnetic = true;
    } else this.bob = Math.sin(this.world.time * 3 + this.phase) * 4;
    this.sprite?.update(dt);
    if (this.popT > 0.25) {
      const h = heroTouching(this, 4);
      if (h) this.take(h);
    }
  }
  /** Ímã de Castanha (só castanhas e cachos). */
  protected wantsMagnet() { return false; }
  render(a: number) {
    if (this.sprite) {
      this.sprite.x = this.x; this.sprite.y = this.y + this.bob; this.sprite.z = 30;
      this.sprite.extraFilter = this.secret ? faroFilter(this) : '';
      this.sprite.render();
    }
    void a;
  }
  /** segredos brilham com o Faro de Tamanduá */
  protected secret = false;
  take(h: Hero | null) {
    if (this.taken) return;
    this.taken = true;
    this.world.collect(this);
    this.give(h);
    this.kill();
  }
  protected abstract give(h: Hero | null): void;
  protected sparkle(anim = 'castanha', scale = 1) {
    this.world.spawnFx('fx-brilho', anim, this.x, this.y + this.bob - this.h * 0.2, { scale: jitter(scale), z: 70 });
  }
}

function magnetRange() { return [0, 170, 290][upgradeLevel('ima')] ?? 0; }

export class Castanha extends Pickup {
  init() { this.spriteFor('castanha', 'girar'); if (this.sprite) this.sprite.speed = 0.9 + ((this.phase * 10) % 3) * 0.1; }
  protected wantsMagnet() {
    const r = magnetRange();
    if (!r) return false;
    const l = this.world.duo.leader;
    return Math.hypot(l.x - this.x, l.y - l.h * 0.5 - (this.y - this.h / 2)) < r;
  }
  protected give() { addCastanhas(this.world, 1); this.world.sfx('castanha', this.x, 0.8); this.sparkle('castanha'); }
}

export class Cacho extends Pickup {
  init() { this.w = 56; this.h = 60; this.spriteFor('cacho', 'girar'); }
  protected wantsMagnet() { const r = magnetRange(); const l = this.world.duo.leader; return r > 0 && Math.hypot(l.x - this.x, l.y - this.y) < r; }
  protected give() {
    addCastanhas(this.world, 10);
    this.world.sfx('cacho', this.x);
    this.sparkle('castanha', 1.6);
    this.world.text('+10', this.x, this.y - this.h, 'small');
  }
}

const LETRAS = ['c', 'i', 'p', 'o'];
export class Letra extends Pickup {
  i: number;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.i = Number(s.i ?? 0) % 4; this.w = 56; this.h = 64; this.secret = true; }
  init() { this.spriteFor(`letra-${LETRAS[this.i]}`, 'girar'); }
  protected give() {
    const w = this.world;
    w.letras[this.i] = true;
    const ses = current.session;
    if (ses) ses.letras[this.i] = true;
    w.sfx('letra', this.x);
    w.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.3, { scale: 1.3, z: 70 });
    w.text(['C', 'I', 'P', 'Ó'][this.i], this.x, this.y - this.h);
    bus.emit('letra', { i: this.i });
    const all = (ses ? ses.letras : w.letras).every(Boolean);
    if (all) {
      window.setTimeout(() => {
        w.sfx('letras-completas');
        bus.emit('letras-completas');
        addVidas(w, 1, 'letras');
      }, 450);
    }
  }
}

export class MoedaFolha extends Pickup {
  init() { this.w = 64; this.h = 72; this.secret = true; this.spriteFor('moeda-folha', 'girar'); }
  protected give() {
    const w = this.world;
    const ses = current.session;
    if (ses) ses.moeda = true;
    w.sfx('moeda-folha', this.x);
    w.hitstop(90);
    w.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.4, { scale: 1.8, z: 70 });
    for (let k = 0; k < 6; k++) w.spawnFx('fx-folhas', `folha${(k % 6) + 1}`, this.x, this.y - this.h * 0.5, { vx: jitter(Math.cos(k * 1.05) * 160), vy: jitter(-260 + Math.sin(k * 1.05) * 90), gravity: 380, life: 1.4, fade: 0.5, loop: true });
    w.text('MOEDA-FOLHA!', this.x, this.y - this.h - 10);
    w.toast('Moeda-Folha encontrada! Ela será plantada no Viveiro.', 'moeda-folha');
    bus.emit('moeda-folha', { level: w.level.id });
  }
}

export class Ficha extends Pickup {
  m: string;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.m = String(s.m ?? 'ema'); this.w = 52; this.h = 56; }
  init() { this.spriteFor('ficha', 'girar', this.m); }
  protected give() { addFicha(this.world, this.m); this.world.sfx('ficha', this.x); this.sparkle('letra', 0.8); }
}

export class Parafuso extends Pickup {
  init() { this.w = 32; this.h = 36; this.spriteFor('parafuso', 'girar'); }
  protected give() { addParafusos(this.world, 1); this.world.sfx('parafuso', this.x, 0.8); this.sparkle('castanha', 0.7); }
}

/** Balão-tucano: 1, 2 ou 3 vidas. Raro: se a dupla demorar perto dele, ele voa para longe. */
export class Balao extends Pickup {
  n: number;
  premio: boolean;
  hidden: boolean;
  private nearT = 0;
  private fleeing = false;
  onPremio?: () => void;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.n = Math.max(1, Math.min(3, Number(s.n ?? 1)));
    this.premio = !!s.premio;
    this.hidden = this.premio;
    this.w = 70; this.h = 110;
    this.persistent = this.premio;
  }
  init() { this.spriteFor('balao-tucano', 'flutuar', String(this.n)); }
  reveal() {
    if (!this.hidden) return;
    this.hidden = false;
    this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.5, { scale: 1.6, z: 70 });
    this.world.sfx('letras-completas', this.x);
  }
  update(dt: number) {
    if (this.hidden || this.taken) { this.sprite?.update(dt); return; }
    const l = this.world.duo.leader;
    const d = Math.hypot(l.x - this.x, l.y - this.y);
    if (this.premio) {
      // o prêmio da sala desce devagar ao encontro da dupla
      const ty = l.y - l.h * 0.3;
      if (d > 60) { this.x += ((l.x - this.x) / d) * 70 * dt; this.y += ((ty - this.y) / Math.max(1, d)) * 70 * dt; }
    } else if (this.fleeing) {
      this.x += 140 * dt; this.y -= 190 * dt;
      if (this.y < this.world.camY - 300) this.kill();
    } else if (d < 760) {
      this.nearT += dt;
      if (this.nearT > Number(this.spawn.tempo ?? 7)) { this.fleeing = true; this.world.sfx('balao-estouro', this.x, 0.3); this.world.text('TCHAU!', this.x, this.y - this.h, 'small'); }
    }
    super.update(dt);
  }
  render(a: number) { if (this.sprite) this.sprite.visible = !this.hidden; super.render(a); }
  protected give() {
    const w = this.world;
    w.sfx('balao-estouro', this.x);
    w.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.5, { scale: 1.4, z: 70 });
    for (let k = 0; k < 5; k++) w.spawnFx('fx-folhas', `folha${k + 1}`, this.x, this.y - this.h * 0.6, { vx: jitter((k - 2) * 90), vy: jitter(-220), gravity: 300, life: 1.2, fade: 0.4, loop: true });
    if (this.premio && this.onPremio) this.onPremio();
    else addVidas(w, this.n, 'balao');
  }
}

register('castanha', (w, s) => new Castanha(w, s));
register('cacho', (w, s) => new Cacho(w, s));
register('letra', (w, s) => new Letra(w, s));
register('moeda-folha', (w, s) => new MoedaFolha(w, s));
register('ficha', (w, s) => new Ficha(w, s));
register('parafuso', (w, s) => new Parafuso(w, s));
register('balao', (w, s) => new Balao(w, s));

/** Lança n parafusos/castanhas que pulam do ponto (robôs desmontados, ninho com a dupla completa). */
export function burst(w: World, t: string, x: number, y: number, n: number) {
  const TILEPX = 64;
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + ((k - (n - 1) / 2) * 0.5);
    w.spawn({ t, x: x / TILEPX, y: y / TILEPX, vx: Math.cos(a) * 260, vy: Math.sin(a) * 520 - 200, dyn: k });
  }
}
