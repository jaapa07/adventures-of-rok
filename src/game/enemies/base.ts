/**
 * Base dos inimigos comuns (seção 7.1): estados com cronômetro, atordoamento ('tonto'), susto,
 * knockback + flash ao levar dano, morte com fumaça e pedaços de lata, contagem de combo nas
 * mortes que o herói não contabiliza, e utilidades de patrulha/visão.
 */
import { Entity, type HitInfo, type HitKind } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { floorAt, isSolid, T } from '../physics';
import type { World } from '../world';
import type { Hero } from '../hero';

/**
 * Convenção do motor: quem causa o golpe chama world.enemyKilled quando o alvo fica `dead`
 * (herói no pisão/arma/rolamento, arremessos, buzina, carrinho…). As mortes causadas pelos
 * próprios inimigos/montarias/chefes deste módulo são contadas por quem as causou (ver Mount.strike).
 */
export type { HitKind };

export function isHero(e: Entity | null | undefined): e is Hero {
  return !!e && e.team === 'hero' && 'hid' in e;
}

export abstract class Enemy extends Entity {
  state = 'idle';
  st = 0; // tempo no estado
  stunT = 0;
  hurtT = 0;
  flying = false;
  gravity = 2400;
  /** id do modelo (sprite); por padrão o tipo da entidade */
  model: string;
  /** reage a coco/panela/batida ficando tonto */
  canStun = true;
  /** inimigo de lata (pedaços voando ao morrer) */
  tin = true;
  private starFx: { life: number } | null = null;
  /** campos escritos pelas armas (contrato de src/game/weapons) */
  tontoT = 0;
  molhadoT = 0;
  grudadoT = 0;
  private slideVx = 0;
  protected sfxT = 0;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.team = 'enemy';
    this.stompable = true;
    this.touchHurts = true;
    this.activeMargin = 320;
    this.model = s.t;
    if (s.dir === undefined) this.dir = -1;
  }

  get hero(): Hero { return this.world.duo.leader; }
  /** herói disfarçado ou morto não é notado */
  get heroHidden() { const h = this.hero; return h.disguiseT > 0 || h.state === 'dead'; }
  get onGround() { return !!this.body?.onGround; }
  setState(s: string) { this.state = s; this.st = 0; }
  play(anim: string, o: { restart?: boolean; speed?: number } = {}) { this.sprite?.play(anim, o); }

  /* ---------------- ciclo ---------------- */
  update(dt: number) {
    this.st += dt;
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.sfxT > 0) this.sfxT -= dt;
    // efeitos escritos pelas armas (src/game/weapons): tonto, molhado (escorrega), grudado (poça de jaca)
    if (this.tontoT > 0) { if (this.canStun) { this.stunT = Math.max(this.stunT, this.tontoT); this.starFx = this.starFx ?? { life: this.tontoT }; this.play('tonto', { restart: true }); } this.tontoT = 0; }
    if (this.molhadoT > 0) { this.molhadoT -= dt; if (this.sprite) this.sprite.rot = this.molhadoT > 0 && this.onGround ? Math.sin(this.st * 14) * 6 : 0; }
    if (this.grudadoT > 0) {
      this.grudadoT -= dt;
      this.vx = 0;
      this.move(dt);
      this.play(this.stunT > 0 ? 'tonto' : 'dano');
      if (this.stunT > 0) this.stunT = Math.max(0, this.stunT - dt);
      this.sprite?.update(dt);
      return;
    }
    if (this.stunT > 0) {
      this.stunT -= dt;
      this.vx *= Math.pow(0.02, dt);
      this.move(dt);
      if (this.hurtT <= 0 && this.state !== 'susto') this.play('tonto');
      if (this.stunT <= 0) { this.stunT = 0; this.starFx = null; this.onRecover(); }
    } else if (this.hurtT > 0) {
      this.vx *= Math.pow(0.05, dt);
      this.move(dt);
    } else this.think(dt);
    if (this.sprite) {
      this.sprite.sx += (1 - this.sprite.sx) * Math.min(1, dt * 10);
      this.sprite.sy += (1 - this.sprite.sy) * Math.min(1, dt * 10);
      this.sprite.update(dt);
    }
    if (this.y > this.world.grid.pxH + 200) this.dead = true;
  }

  /** IA específica (chamada quando não está atordoado nem recuando de dano) */
  abstract think(dt: number): void;
  /** saiu do atordoamento */
  onRecover() { this.setState('idle'); }

  /** move com física (terrestre) ou por integração direta (voador) */
  move(dt: number) {
    // molhado: derrapa (a velocidade horizontal muda devagar)
    if (this.molhadoT > 0 && !this.flying && this.onGround) this.vx = this.slideVx + (this.vx - this.slideVx) * Math.min(1, dt * 1.5);
    this.slideVx = this.vx;
    if (this.flying || !this.body) { this.x += this.vx * dt; this.y += this.vy * dt; if (this.body) { this.body.x = this.x; this.body.y = this.y; } return; }
    this.physics(dt, this.gravity);
  }

  render(a: number) {
    if (this.sprite) this.sprite.groundY = this.flying ? null : this.y;
    super.render(a);
  }

  /* ---------------- dano ---------------- */
  onStomp(_hero: Entity, _heavy: boolean): 'kill' | 'bounce' | 'hurt' {
    this.die({ kind: 'pisao', dmg: 1, dir: 0, x: this.x, y: this.y }, true);
    return 'kill';
  }

  onHit(h: HitInfo): boolean {
    if (this.dead) return false;
    // batida no chão (dmg 0): atordoa quem está no chão por perto
    if (h.weapon === 'buzina') { this.scare(h); return true; }
    if ((h.weapon === 'coco' || h.weapon === 'panela') && this.canStun && this.stunT <= 0 && h.kind !== 'explosao') {
      this.stun(2.6);
      this.vx = h.dir * 180; if (!this.flying) this.vy = -280;
      this.sprite?.flash(0.08);
      return true;
    }
    if (h.kind === 'outro' && h.dmg <= 0) {
      if (this.canStun && (this.onGround || !this.flying)) { this.stun(1.8); if (!this.flying) this.vy = -260; }
      return true;
    }
    return this.damage(h);
  }

  /** aplica dano: knockback + flash; morre quando hp chega a zero */
  damage(h: HitInfo): boolean {
    this.hp -= Math.max(1, h.dmg);
    this.sprite?.flash(0.08);
    if (this.hp <= 0) { this.die(h); return true; }
    this.hurtT = 0.35;
    this.vx = (h.dir || -this.dir) * 280;
    if (!this.flying) this.vy = -320;
    this.play('dano', { restart: true });
    this.sfx('golpe-acerto', 0.7);
    return true;
  }

  stun(sec: number) {
    if (!this.canStun) return;
    this.stunT = Math.max(this.stunT, sec);
    this.play('tonto', { restart: true });
    if (!this.starFx) this.starFx = this.world.spawnFx('fx-estrelas', 'tonto', this.x, this.y - this.h - 6, { follow: this, life: sec, loop: true }) as { life: number } | null;
    else this.starFx.life = Math.max(this.starFx.life, sec);
  }

  /** susto (buzina): por padrão fica tonto */
  scare(h: HitInfo) { this.stun(2); this.vx = h.dir * 220; if (!this.flying) this.vy = -380; }

  /** derrota: fumaça + pedaços de lata e som (o combo é contado por quem causou o golpe) */
  die(h: HitInfo, viaStomp = false) {
    if (this.dead) return;
    this.dead = true;
    const fl = this.dir < 0;
    const cy = this.y - this.h * 0.5;
    if (viaStomp) this.world.spawnFx(this.model, 'morte', this.x, this.y, { flip: fl, life: 0.5, fade: 0.3 });
    else this.world.spawnFx(this.model, 'morte', this.x, this.y, { flip: fl, vx: (h.dir || -this.dir) * 260, vy: -560, gravity: 1900, spin: (h.dir || 1) * 240, life: 1.1, fade: 0.4 });
    this.world.spawnFx('fx-fumaca', 'derrota', this.x, cy + this.h * 0.4, { scale: Math.max(0.8, this.h / 110) });
    this.sfx('inimigo-derrota');
    if (this.tin) this.sfx('lata-quebra', 0.8);
    this.world.hitstop(60);
    this.onDeath(h);
  }
  onDeath(_h: HitInfo) {}

  /* ---------------- utilidades ---------------- */
  /** há chão logo à frente (para dar meia-volta nas bordas) */
  floorAhead(dir: number, dist = 6): boolean {
    const ax = this.x + dir * (this.w / 2 + dist);
    return !!floorAt(this.world.grid, this.world.solidsFor(this), ax, this.y - 8, this.y + 24, null, true);
  }
  wallAhead(dir: number): boolean {
    const ax = this.x + dir * (this.w / 2 + 4);
    return isSolid(this.world.grid.atPx(ax, this.y - this.h * 0.5)) || isSolid(this.world.grid.atPx(ax, this.y - 12));
  }
  /** dx/dy até o líder (pés) */
  heroDx() { return this.hero.x - this.x; }
  heroDy() { return this.hero.y - this.y; }
  /** líder à frente, dentro de `range` px e com diferença de altura até `dy` */
  heroInFront(range: number, dy = 90) {
    if (this.heroHidden) return false;
    const dx = this.heroDx();
    return Math.sign(dx) === this.dir && Math.abs(dx) < range && Math.abs(this.heroDy()) < dy;
  }
  heroNear(range: number) { return !this.heroHidden && Math.hypot(this.heroDx(), this.heroDy()) < range; }
  /** golpe na área à frente: machuca o líder se sobrepor */
  hitHero(area: { x: number; y: number; w: number; h: number }, weapon?: string): boolean {
    const L = this.hero;
    if (this.heroHidden || L.state === 'dead') return false;
    if (Math.abs(L.x - area.x) < (L.w + area.w) / 2 && L.y - L.h < area.y && L.y > area.y - area.h)
      return L.hurt({ kind: weapon ? 'arma' : 'outro', dmg: 1, dir: Math.sign(L.x - this.x) || this.dir, x: this.x, y: this.y, weapon, source: this });
    return false;
  }
  /** sobreposição com o líder */
  touchingHero(pad = 0) {
    const L = this.hero;
    return Math.abs(L.x - this.x) < (L.w + this.w) / 2 + pad && L.y - L.h < this.y + pad && L.y > this.y - this.h - pad;
  }
  isWater(x: number, y: number) { const t = this.world.grid.atPx(x, y); return t === T.WATER || t === T.WATER_VINE; }
  /** som com intervalo mínimo (zumbidos, chocalhos) */
  sfxEvery(id: string, sec: number, vol = 1) { if (this.sfxT <= 0 && this.onScreen()) { this.sfx(id, vol); this.sfxT = sec; } }
  onScreen(pad = 60) {
    const w = this.world;
    return this.x > w.camX - pad && this.x < w.camX + 1280 + pad && this.y > w.camY - pad && this.y - this.h < w.camY + 720 + pad;
  }
  tile(n: number) { return n * TILE; }
}
