/**
 * Base dos chefes (seção 7.3): arena autoral travada (paredes + câmera roteirizada), entrada com
 * música, 3 fases de padrão por vida, barra de vida via bus 'boss-hit' {id, hp, max}, derrota com
 * explosão grande + flash de tela, comemoração da dupla e world.complete().
 * Também os projéteis e peças de arena compartilhados (árvore, braseiro).
 */
import { hasAnim } from '../../core/assets';
import { Entity, register, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Solid } from '../physics';
import type { Light } from '../../render/lighting';
import { bus } from '../../core/events';
import { VIEW_W } from '../../render/stage';
import type { Hero } from '../hero';
import type { World } from '../world';

export function screenFlash(w: World, ms = 380, color = '#fff') {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:0;top:0;width:100%;height:100%;background:${color};opacity:0.9;pointer-events:none;transition:opacity ${ms}ms ease-out;z-index:50`;
  w.stage.overlay.append(el);
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '0'; }));
  window.setTimeout(() => el.remove(), ms + 80);
}

export abstract class Boss extends Entity {
  bid: string;
  maxHp: number;
  phase = 1;
  state = 'espera';
  st = 0;
  invulnT = 0;
  active = false;
  defeated = false;
  defeatT = 0;
  arena: [number, number];
  floorY: number;
  walls: Solid[] = [];
  music = 'chefe';
  camZoom = 1;
  camTilt: [number, number] = [0, 0];
  camYOff = -250;
  seq = 0;
  private boomI = 0;
  private celebrated = false;

  constructor(w: World, s: EntitySpawn, hp: number) {
    super(w, s);
    this.bid = String(s.id ?? s.t);
    this.team = 'enemy';
    this.stompable = true;
    this.touchHurts = true;
    this.persistent = true;
    this.maxHp = hp; this.hp = hp;
    this.z = 30;
    const a = s.arena as [number, number] | undefined;
    this.arena = a ? [a[0] * TILE, a[1] * TILE] : [this.x - 9 * TILE, this.x + 9 * TILE];
    this.floorY = this.y;
    if (s.dir === undefined) this.dir = -1;
  }

  get hero(): Hero { return this.world.duo.leader; }
  get cxArena() { return (this.arena[0] + this.arena[1]) / 2; }
  setState(s: string) { this.state = s; this.st = 0; }
  play(a: string, o: { restart?: boolean; speed?: number; onEnd?: () => void } = {}) { this.sprite?.play(a, o); }

  update(dt: number) {
    this.st += dt;
    if (this.invulnT > 0) this.invulnT -= dt;
    if (this.sprite) {
      this.sprite.sx += (1 - this.sprite.sx) * Math.min(1, dt * 8);
      this.sprite.sy += (1 - this.sprite.sy) * Math.min(1, dt * 8);
      this.sprite.update(dt);
      this.sprite.alpha = this.invulnT > 0 && !this.defeated && Math.floor(this.invulnT * 16) % 2 === 0 ? 0.6 : 1;
    }
    if (this.defeated) { this.updateDefeat(dt); return; }
    if (!this.active) {
      this.waiting(dt);
      const L = this.hero;
      if (L.x > this.arena[0] + TILE && L.x < this.arena[1] - TILE && Math.abs(L.y - this.floorY) < 8 * TILE) this.activate();
      return;
    }
    this.updateCam();
    this.think(dt);
  }

  /** antes de a luta começar */
  waiting(_dt: number) { this.play('idle'); }
  abstract think(dt: number): void;
  /** mudou de fase (2 ou 3) */
  onPhase(_p: number) {}

  activate() {
    this.active = true;
    const H = this.world.grid.pxH;
    this.walls = [
      this.world.addSolid({ x: this.arena[0] - TILE, y: -4 * TILE, w: TILE, h: H + 8 * TILE, owner: this }),
      this.world.addSolid({ x: this.arena[1], y: -4 * TILE, w: TILE, h: H + 8 * TILE, owner: this }),
    ];
    bus.emit('music', this.music);
    bus.emit('boss-hit', { id: this.bid, hp: this.hp, max: this.maxHp });
    this.setState('entrada');
    this.play('entrada', { restart: true });
    this.sfx('chefe-rugido');
    this.world.shake(10, 600);
    this.updateCam();
  }
  /** câmera roteirizada: arena estreita = centralizada; arena larga = segue o herói dentro dos limites */
  updateCam() {
    const half = VIEW_W / 2 / this.camZoom;
    const a = this.arena[0] - TILE * 0.5 + half, b = this.arena[1] + TILE * 0.5 - half;
    const x = a >= b ? this.cxArena : Math.max(a, Math.min(b, this.hero.x));
    this.world.scriptCam = { x, y: this.floorY + this.camYOff, zoom: this.camZoom, tilt: this.camTilt };
  }
  releaseArena() {
    for (const w of this.walls) this.world.removeSolid(w);
    this.walls = [];
    this.world.scriptCam = null;
  }

  phaseFor(hp: number) { return Math.min(3, 1 + Math.floor(((this.maxHp - hp) * 3) / this.maxHp)); }

  /** aplica dano ao chefe; retorna true se tirou vida */
  hurtBoss(n = 1, h?: HitInfo): boolean {
    if (this.invulnT > 0 || this.defeated || !this.active) return false;
    this.hp = Math.max(0, this.hp - n);
    this.invulnT = 1.1;
    this.sprite?.flash(0.14);
    this.sfx('chefe-dano');
    this.world.shake(14, 380);
    this.world.hitstop(140);
    this.world.spawnFx('fx-faisca', 'impacto', h?.x ?? this.x, this.y - this.h * 0.6, { scale: 1.6 });
    bus.emit('boss-hit', { id: this.bid, hp: this.hp, max: this.maxHp });
    if (this.hp <= 0) { this.defeat(); return true; }
    const p = this.phaseFor(this.hp);
    if (p > this.phase) {
      this.phase = p;
      this.seq = 0;
      this.setState('furia');
      this.play('furia', { restart: true });
      this.sfx('chefe-rugido');
      this.onPhase(p);
    } else this.play('dano', { restart: true });
    return true;
  }

  defeat() {
    this.defeated = true; this.defeatT = 0;
    this.touchHurts = false; this.stompable = false;
    this.vx = 0;
    this.play('derrota', { restart: true });
    this.sfx('chefe-rugido');
    bus.emit('boss-defeat', { id: this.bid });
    this.onDefeat();
    // limpa projéteis e lacaios da arena
    for (const e of this.world.entities) {
      if (e === this || e.dead) continue;
      if (e instanceof Projectile) e.kill();
      else if (e.team === 'enemy' && e.x > this.arena[0] - TILE && e.x < this.arena[1] + TILE) {
        this.world.spawnFx('fx-fumaca', 'derrota', e.x, e.y - e.h * 0.3);
        e.kill();
      }
    }
  }
  onDefeat() {}

  updateDefeat(dt: number) {
    const t0 = this.defeatT;
    this.defeatT += dt;
    this.defeatMotion(dt);
    // sequência de explosões (posições fixas sobre o corpo)
    const spots: [number, number][] = [[-0.3, 0.7], [0.25, 0.4], [0, 0.85], [-0.15, 0.25], [0.35, 0.75], [-0.35, 0.45], [0.1, 0.6]];
    if (this.defeatT < 2.2 && Math.floor(this.defeatT / 0.3) !== Math.floor(t0 / 0.3)) {
      const [ox, oy] = spots[this.boomI++ % spots.length];
      this.world.spawnFx('fx-explosao', 'pequena', this.x + ox * this.w, this.y - oy * this.h, { scale: 1.3, z: this.z + 5 });
      this.sfx('chefe-explosao', 0.6);
      this.world.shake(8, 250);
    }
    if (t0 < 2.2 && this.defeatT >= 2.2) {
      this.world.spawnFx('fx-explosao', 'grande', this.x, this.y - this.h * 0.4, { scale: 2.2, z: this.z + 6 });
      this.sfx('chefe-explosao');
      this.world.shake(18, 900);
      this.world.hitstop(200);
      screenFlash(this.world, 600);
      if (this.sprite) this.sprite.visible = false;
      this.onExploded();
    }
    if (!this.celebrated && this.defeatT >= 3.4) {
      this.celebrated = true;
      this.releaseArena();
      this.world.duo.celebrate();
    }
    if (this.defeatT >= 6) { this.world.complete(); this.dead = true; }
  }
  defeatMotion(_dt: number) {}
  onExploded() {}

  /* ---------------- utilidades ---------------- */
  heroDx() { return this.hero.x - this.x; }
  faceHero() { const dx = this.heroDx(); if (Math.abs(dx) > 12) this.dir = dx < 0 ? -1 : 1; }
  hitHero(area: { x: number; y: number; w: number; h: number }, kind: HitInfo['kind'] = 'outro'): boolean {
    const L = this.hero;
    if (L.state === 'dead') return false;
    if (Math.abs(L.x - area.x) < (L.w + area.w) / 2 && L.y - L.h < area.y && L.y > area.y - area.h)
      return L.hurt({ kind, dmg: 1, dir: Math.sign(L.x - this.x) || this.dir, x: this.x, y: this.y, source: this });
    return false;
  }
  clampArena(margin: number) {
    const a = this.arena[0] + margin, b = this.arena[1] - margin;
    if (this.x < a) { this.x = a; if (this.body) this.body.x = a; return -1; }
    if (this.x > b) { this.x = b; if (this.body) this.body.x = b; return 1; }
    return 0;
  }
  destroy() { super.destroy(); if (this.walls.length) this.releaseArena(); }
}

/* ======================================================================= */
/* Projéteis de chefe                                                      */
/* ======================================================================= */
export interface ProjOpts {
  model?: string; anim?: string; scale?: number; spin?: number;
  x: number; y: number; vx: number; vy: number; g?: number;
  w?: number; h?: number; life?: number;
  /** ao tocar o chão: some, rola, explode ou para */
  ground?: 'die' | 'roll' | 'explode' | 'stop';
  walls?: number; // ricochetes na parede antes de sumir
  homing?: number; // aceleração em direção ao herói (px/s²)
  explodeR?: number;
  /** pode ser destruído por golpes (fica no time inimigo) */
  breakable?: boolean;
  trail?: [string, string]; // fx deixado pelo caminho
  light?: number;
  stickTo?: (p: Projectile) => boolean; // devolve true para parar (ex.: serra presa na árvore)
}

export class Projectile extends Entity {
  o: ProjOpts; life: number; t = 0; trailT = 0; stuck = false;
  constructor(w: World, o: ProjOpts) {
    super(w, { t: 'projetil-chefe', x: o.x / TILE, y: o.y / TILE });
    this.o = o;
    this.x = o.x; this.y = o.y; this.vx = o.vx; this.vy = o.vy;
    this.life = o.life ?? 4;
    this.team = o.breakable ? 'enemy' : 'projectile';
    this.persistent = true;
    this.z = 45;
    this.dir = o.vx < 0 ? -1 : 1;
  }
  init() {
    if (this.o.model) { const s = this.makeSprite(this.o.model, this.o.anim ?? 'idle'); s.sx = s.sy = this.o.scale ?? 1; }
    this.makeBody(this.o.w ?? 48, this.o.h ?? 48);
  }
  update(dt: number) {
    this.t += dt; this.life -= dt;
    const o = this.o;
    if (o.homing && !this.stuck) {
      const L = this.world.duo.leader;
      const dx = L.x - this.x, dy = L.y - L.h / 2 - (this.y - this.h / 2), d = Math.hypot(dx, dy) || 1;
      this.vx += (dx / d) * o.homing * dt; this.vy += (dy / d) * o.homing * dt;
      const sp = Math.hypot(this.vx, this.vy), max = 260;
      if (sp > max) { this.vx *= max / sp; this.vy *= max / sp; }
    }
    if (!this.stuck) {
      if (o.ground === undefined && !o.g) { this.x += this.vx * dt; this.y += this.vy * dt; this.body!.x = this.x; this.body!.y = this.y; }
      else {
        const vx = this.vx;
        this.physics(dt, o.g ?? 0, 1400);
        if (this.body!.hitWall) {
          if ((o.walls ?? 0) > 0) { o.walls = (o.walls ?? 0) - 1; this.vx = -vx; this.dir = (this.dir * -1) as 1 | -1; this.sfx('clank', 0.5); }
          else { this.burst(); return; }
        } else this.vx = vx;
        if (this.body!.onGround) {
          if (o.ground === 'die') { this.burst(); return; }
          if (o.ground === 'explode') { this.explode(); return; }
          if (o.ground === 'stop') { this.vx = 0; }
        }
      }
      if (o.stickTo?.(this)) { this.stuck = true; this.vx = 0; this.vy = 0; }
    }
    if (o.spin && this.sprite) this.sprite.rot += o.spin * dt * this.dir;
    if (o.trail) { this.trailT -= dt; if (this.trailT <= 0) { this.trailT = 0.07; this.world.spawnFx(o.trail[0], o.trail[1], this.x, this.y, { scale: 0.8, flip: this.dir < 0 }); } }
    this.sprite?.update(dt);
    // acerta o herói (também montado)
    const L = this.world.duo.leader;
    if (!this.stuck && L.state !== 'dead' && Math.abs(L.x - this.x) < (L.w + this.w) / 2 - 6 && L.y - L.h < this.y - 4 && L.y > this.y - this.h + 6) {
      L.hurt({ kind: 'outro', dmg: 1, dir: Math.sign(L.x - this.x) || this.dir, x: this.x, y: this.y, source: this });
      if (o.ground === 'explode') { this.explode(); return; }
    }
    if (this.life <= 0 || this.y > this.world.grid.pxH + 100) this.burst();
  }
  burst() {
    if (this.dead) return;
    this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y - this.h / 2);
    this.kill();
  }
  explode() {
    if (this.dead) return;
    const r = this.o.explodeR ?? 90;
    this.world.spawnFx('fx-explosao', 'pequena', this.x, this.y, { scale: r / 90 });
    this.sfx('chefe-explosao', 0.5);
    this.world.shake(5, 200);
    const L = this.world.duo.leader;
    if (Math.hypot(L.x - this.x, L.y - L.h / 2 - this.y) < r + L.w / 2) L.hurt({ kind: 'explosao', dmg: 1, dir: Math.sign(L.x - this.x) || 1, x: this.x, y: this.y, source: this });
    this.kill();
  }
  onHit(h: HitInfo) {
    if (!this.o.breakable || this.dead) return false;
    if (this.o.ground === 'explode' || this.o.explodeR) this.explode(); else this.burst();
    void h;
    return true;
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' { return 'hurt'; }
  light(): Light | null { return this.o.light ? { x: this.x, y: this.y - this.h / 2, r: this.o.light, flicker: 0.15 } : null; }
}

/* ======================================================================= */
/* Peças de arena                                                          */
/* ======================================================================= */
/** Árvore da arena (tag 'arvore'): onde a serra do Major prende. Tronco em CSS. */
export class ArvoreChefe extends Entity {
  el = document.createElement('div');
  shakeT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.tag = 'arvore'; this.team = 'neutral';
    this.w = 96; this.h = ((s.altura as number) ?? 6) * TILE;
    this.persistent = true; this.z = 8;
  }
  init() {
    // modelo 3D pré-renderizado da árvore (tools/models/props/arvore-chefe.ts)
    if (hasAnim('arvore-chefe', 'idle')) { this.makeSprite('arvore-chefe', 'idle', { shadow: false }); this.sprite!.z = this.z; return; }
    const el = this.el;
    el.className = 'arvore-chefe';
    el.style.cssText = `position:absolute;left:0;top:0;width:${this.w}px;height:${this.h}px;pointer-events:none;` +
      'border-radius:40% 40% 8px 8px / 10% 10% 4px 4px;' +
      'background:repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 6px, transparent 6px 19px, rgba(255,230,180,0.08) 19px 23px, transparent 23px 31px),' +
      'linear-gradient(90deg, #3b2414 0%, #6b4426 30%, #7d5530 52%, #4a2d18 80%, #2e1b0e 100%);' +
      'box-shadow: inset -10px 0 18px rgba(0,0,0,0.35), 0 6px 0 -2px #23140a;';
    const crown = document.createElement('div');
    crown.style.cssText = 'position:absolute;left:-90px;top:-130px;width:276px;height:190px;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 40%, #5f9a3a 0 22%, transparent 23%), radial-gradient(circle at 68% 35%, #4f8a30 0 26%, transparent 27%),' +
      'radial-gradient(circle at 50% 60%, #3d7326 0 40%, transparent 41%), radial-gradient(circle at 20% 65%, #2f5f1f 0 22%, transparent 23%), radial-gradient(circle at 82% 66%, #2f5f1f 0 20%, transparent 21%);';
    el.append(crown);
    this.world.stage.entities.append(el);
  }
  update(dt: number) { if (this.shakeT > 0) this.shakeT -= dt; this.sprite?.update(dt); }
  hit() { this.shakeT = 0.4; this.sprite?.play('tremer', { restart: true, onEnd: () => this.sprite?.play('idle') }); this.world.spawnFx('fx-lascas', 'madeira', this.x, this.y - this.h * 0.35, { scale: 1.2 }); this.world.spawnFx('fx-folhas', 'folha2', this.x - 40, this.y - this.h + 20, { vy: 60, life: 1.6, fade: 0.5, loop: true }); }
  render() {
    if (this.sprite) { this.sprite.x = this.x; this.sprite.y = this.y; this.sprite.z = this.z; this.sprite.render(); return; }
    const k = this.shakeT > 0 ? Math.sin(this.shakeT * 70) * 6 * this.shakeT : 0;
    this.el.style.transform = `translate3d(${(this.x - this.w / 2 + k).toFixed(1)}px, ${(this.y - this.h).toFixed(1)}px, 0)`;
    this.el.style.zIndex = String(this.z);
  }
  destroy() { super.destroy(); this.el.remove(); }
}

/** Braseiro da arena da Rainha (onde se acendem as cabaças) — usa o modelo `fogueira`. */
export class Braseiro extends Entity {
  sparkT = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.tag = 'fogueira'; this.team = 'neutral'; this.persistent = true; this.w = 80; this.h = 70; this.z = 12; }
  init() { this.makeSprite('fogueira', 'acesa', { shadow: true }); }
  update(dt: number) {
    this.sprite?.update(dt);
    this.sparkT -= dt;
    if (this.sparkT <= 0) { this.sparkT = 0.25; this.world.spawnFx('fx-faisca', 'impacto', this.x + Math.sin(this.world.time * 7) * 14, this.y - 50, { vy: -90, scale: 0.4, life: 0.5, fade: 0.3 }); }
  }
  light(): Light { return { x: this.x, y: this.y - 40, r: 170, flicker: 0.12 }; }
}

register('arvore-chefe', (w, s) => new ArvoreChefe(w, s));
register('braseiro-chefe', (w, s) => new Braseiro(w, s));
