/**
 * Javalins: o soldado comum (patrulha, pega armas do chão, é desarmado por golpe nas costas,
 * cai sentado com a buzina), o Escudeiro (escudo de lata frontal) e o Javalão (pesado: a Lili quica,
 * a Tamá derruba; o pisão dele faz o chão tremer).
 */
import { register, type Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { Sprite } from '../../render/sprite';
import { pickableWeaponNear, takeWeapon, spawnFlyingWeapon } from '../weapons/util';
import type { World } from '../world';
import type { WeaponGround } from '../weapons/arma';
import { Enemy, isHero } from './base';

/** golpes que, vindos de trás, desarmam o javalim */
const DISARM_KINDS = new Set(['arma', 'arremesso', 'rolar']);

export class Javalim extends Enemy {
  arma: string | null;
  weaponSprite?: Sprite;
  limits: [number, number] | null;
  speed = 90;
  atkCd = 0;
  atkDone = false;
  target: WeaponGround | null = null;
  armaUsos: number | undefined = undefined;
  lookT = 0;
  turns = 0;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.arma = typeof s.arma === 'string' ? s.arma : null;
    const p = s.patrulha as [number, number] | undefined;
    this.limits = p ? [Math.min(p[0], p[1]) * TILE, Math.max(p[0], p[1]) * TILE] : null;
  }
  init() {
    this.makeSprite(this.model, 'andar', { shadow: true });
    this.makeBody(56, 100);
    if (this.arma) this.equipWeapon(this.arma);
  }

  equipWeapon(id: string) {
    this.arma = id;
    this.weaponSprite?.destroy();
    this.weaponSprite = new Sprite(`arma-${id}`, this.world.preset, 'base', this.world.stage.entities);
    this.weaponSprite.play('mao');
  }
  /** a arma voa e cai como entidade `arma` */
  dropWeapon(vx: number, vy: number) {
    if (!this.arma) return;
    const id = this.arma;
    this.arma = null;
    this.weaponSprite?.destroy(); this.weaponSprite = undefined;
    spawnFlyingWeapon(this.world, id, this.x, this.y - this.h * 0.7, vx, vy, this.armaUsos);
    this.world.spawnFx(`arma-${id}`, 'voando', this.x, this.y - this.h * 0.7, { vx: vx * 0.25, vy: vy * 0.25, life: 0.25, fade: 0.2 });
  }

  think(dt: number) {
    if (this.atkCd > 0) this.atkCd -= dt;
    switch (this.state) {
      case 'buscar': return this.seek(dt);
      case 'pegar': return this.pickUp(dt);
      case 'ataque': return this.attack(dt);
      case 'desarmado':
        this.vx *= Math.pow(0.02, dt); this.move(dt); this.play('desarmado');
        if (this.st > 1.0) this.setState('idle');
        return;
      default: return this.patrol(dt);
    }
  }

  patrol(dt: number) {
    // procura armas soltas por perto
    this.lookT -= dt;
    if (!this.arma && this.lookT <= 0 && this.onGround) {
      this.lookT = 0.4;
      const e = pickableWeaponNear(this.world, this.x, this.y, 5 * TILE);
      if (e && !e.dead && Math.abs(e.y - this.y) < 80) { this.target = e; this.setState('buscar'); this.sfx('javali-grunhido', 0.6); return; }
    }
    if (this.arma && this.atkCd <= 0 && this.heroInFront(140, 80)) {
      this.setState('ataque'); this.atkDone = false; this.vx = 0;
      this.play('ataque-arma', { restart: true });
      this.sfx('javali-grunhido');
      return;
    }
    const L = this.limits;
    if (this.onGround) {
      let turn = false;
      if (L && this.x < L[0] && this.dir < 0) turn = true;
      else if (L && this.x > L[1] && this.dir > 0) turn = true;
      else if (this.wallAhead(this.dir) || !this.floorAhead(this.dir)) turn = true;
      if (turn) {
        this.dir = (this.dir * -1) as 1 | -1;
        if (++this.turns % 3 === 0) this.sfx('javali-grunhido', 0.5);
      }
    }
    this.vx = this.dir * (this.arma ? this.speed * 1.15 : this.speed);
    this.move(dt);
    if (this.body?.hitWall) this.dir = (this.dir * -1) as 1 | -1;
    this.play('andar');
  }

  seek(dt: number) {
    const t = this.target;
    if (!t || t.dead || !this.onGround && this.st > 2 || this.st > 4) { this.target = null; this.setState('idle'); return; }
    const dx = t.x - this.x;
    this.dir = dx < 0 ? -1 : 1;
    if (Math.abs(dx) < 28) { this.vx = 0; this.setState('pegar'); this.play('pegar-arma', { restart: true }); return; }
    if (!this.floorAhead(this.dir) || this.wallAhead(this.dir)) { this.target = null; this.setState('idle'); return; }
    this.vx = this.dir * this.speed * 1.4;
    this.move(dt);
    this.play('andar', { speed: 1.3 });
  }

  pickUp(dt: number) {
    this.vx = 0; this.move(dt);
    const t = this.target;
    if (t && this.st >= 0.3) {
      const got = takeWeapon(t);
      if (got) { this.equipWeapon(got.id); this.armaUsos = got.usos; }
      this.target = null;
    }
    if (this.st > 0.65 || (this.sprite?.ended && this.st > 0.3)) this.setState('idle');
  }

  attack(dt: number) {
    this.vx = 0; this.move(dt);
    if (!this.atkDone && this.st >= 0.24) {
      this.atkDone = true;
      this.sfx('golpe-leve', 0.8);
      this.hitHero({ x: this.x + this.dir * 70, y: this.y, w: 100, h: 110 }, this.arma ?? undefined);
    }
    if (this.st > 0.62) { this.atkCd = 1.1; this.setState('idle'); }
  }

  onHit(h: HitInfo): boolean {
    if (this.dead) return false;
    // golpe nas costas: a arma voa
    if (this.arma && h.dir === this.dir && DISARM_KINDS.has(h.kind) && this.stunT <= 0) {
      this.dropWeapon(h.dir * 160, -620);
      this.sprite?.flash(0.08);
      this.world.text('PÁ!', this.x, this.y - this.h);
      this.sfx('golpe-acerto');
      this.vx = h.dir * 200;
      this.setState('desarmado');
      this.play('desarmado', { restart: true });
      return true;
    }
    return super.onHit(h);
  }

  scare(h: HitInfo) {
    this.stun(2.4);
    this.setState('susto');
    this.play('susto', { restart: true });
    this.sfx('javali-susto');
    this.vy = -420; this.vx = h.dir * 120;
    if (this.arma) this.dropWeapon(h.dir * 120, -700);
  }
  onRecover() { this.setState('idle'); }

  onDeath(h: HitInfo) { if (this.arma) this.dropWeapon((h.dir || 1) * 140, -560); }

  render(a: number) {
    super.render(a);
    const ws = this.weaponSprite;
    if (ws && this.sprite) {
      const an = this.sprite.anchor('hand');
      ws.x = an?.[0] ?? this.x + this.dir * 34; ws.y = an?.[1] ?? this.y - this.h * 0.5;
      ws.rot = an?.[2] ?? 0; ws.flip = this.dir < 0; ws.z = this.z + 1;
      ws.alpha = this.sprite.alpha;
      ws.render();
    }
  }
  destroy() { super.destroy(); this.weaponSprite?.destroy(); }
}

/** Escudeiro: escudo de lata na frente — só cai com pulo em cima ou golpe/arremesso por trás. */
export class JavalimEscudo extends Javalim {
  guardT = 0;
  behindT = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.arma = null; this.speed = 70; }
  init() { this.makeSprite(this.model, 'andar', { shadow: true }); this.makeBody(64, 104); }

  think(dt: number) {
    if (this.state === 'virar') {
      this.vx = 0; this.move(dt); this.play('virar');
      if (this.st > 0.35) { this.dir = (this.dir * -1) as 1 | -1; this.setState('idle'); }
      return;
    }
    if (this.guardT > 0) {
      this.guardT -= dt;
      this.vx = 0; this.move(dt); this.play('escudo');
      return;
    }
    // herói atrás por um tempo: vira
    const dx = this.heroDx();
    if (!this.heroHidden && Math.sign(dx) === -this.dir && Math.abs(dx) < 3 * TILE && Math.abs(this.heroDy()) < 100) {
      this.behindT += dt;
      if (this.behindT > 0.7) { this.behindT = 0; this.setState('virar'); this.play('virar', { restart: true }); return; }
    } else this.behindT = 0;
    if (this.heroInFront(2.5 * TILE, 90)) { this.vx = 0; this.move(dt); this.play('escudo'); return; }
    this.patrol(dt);
  }
  patrol(dt: number) {
    // o escudeiro não pega armas
    const L = this.limits;
    if (this.onGround && ((L && this.x < L[0] && this.dir < 0) || (L && this.x > L[1] && this.dir > 0) || this.wallAhead(this.dir) || !this.floorAhead(this.dir))) this.dir = (this.dir * -1) as 1 | -1;
    this.vx = this.dir * this.speed;
    this.move(dt);
    this.play('andar');
  }

  onHit(h: HitInfo): boolean {
    if (this.dead) return false;
    const front = h.dir === -this.dir || (h.dir === 0 && Math.sign(h.x - this.x) === this.dir);
    if (front && (h.kind === 'arma' || h.kind === 'arremesso' || h.kind === 'rolar') && h.weapon !== 'buzina') {
      this.guardT = 0.5;
      this.play('escudo', { restart: true });
      this.sfx('clank');
      this.world.spawnFx('fx-faisca', 'impacto', this.x + this.dir * 34, this.y - this.h * 0.55);
      this.vx = -this.dir * 90;
      if (h.kind === 'rolar' && isHero(h.source)) { h.source.b.vx = -h.dir * 320; h.source.b.vy = -380; }
      return true;
    }
    return super.onHit(h);
  }
}

/** Javalão: grande e pesado. Só a Tamá derruba pulando; a Lili quica. Pisão faz tremor. */
export class Javalao extends Javalim {
  stompCd = 1.5;
  quakeDone = false;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.arma = null; this.speed = 60; this.hp = 3; this.armored = true; this.activeMargin = 420;
  }
  init() { this.makeSprite(this.model, 'andar', { shadow: true }); this.makeBody(92, 150); }

  think(dt: number) {
    this.stompCd -= dt;
    if (this.state === 'pisao') {
      this.vx = 0; this.move(dt);
      if (!this.quakeDone && this.st >= 0.45) {
        this.quakeDone = true;
        this.world.shake(4, 260);
        this.sfx('pisao-forte');
        this.world.spawnFx('fx-poeira', 'aterrissar', this.x - 50, this.y, { flip: true, scale: 1.3 });
        this.world.spawnFx('fx-poeira', 'aterrissar', this.x + 50, this.y, { scale: 1.3 });
        const L = this.hero;
        if (L.b.onGround && Math.abs(L.x - this.x) < 340 && Math.abs(L.y - this.y) < 60 && (L.state === 'normal' || L.state === 'attack')) {
          L.pin(0.45, 'aterrissar');
          L.b.vy = -220;
        }
        this.hitHero({ x: this.x + this.dir * 60, y: this.y, w: 90, h: 60 });
      }
      if (this.st > 1.0) { this.stompCd = 2.6; this.setState('idle'); }
      return;
    }
    if (this.stompCd <= 0 && this.onGround && this.heroNear(5 * TILE) && Math.abs(this.heroDy()) < 120) {
      this.dir = this.heroDx() < 0 ? -1 : 1;
      this.setState('pisao'); this.quakeDone = false;
      this.play('pisao', { restart: true });
      this.sfx('javali-grunhido', 1);
      return;
    }
    this.patrol(dt);
  }
  patrol(dt: number) {
    const L = this.limits;
    if (this.onGround && ((L && this.x < L[0] && this.dir < 0) || (L && this.x > L[1] && this.dir > 0) || this.wallAhead(this.dir) || !this.floorAhead(this.dir))) this.dir = (this.dir * -1) as 1 | -1;
    this.vx = this.dir * this.speed;
    this.move(dt);
    this.play('andar', { speed: 0.8 });
  }

  onStomp(_hero: Entity, heavy: boolean): 'kill' | 'bounce' | 'hurt' {
    if (heavy) { this.die({ kind: 'pisao', dmg: 2, dir: 0, x: this.x, y: this.y }, true); return 'kill'; }
    if (this.sprite) { this.sprite.sy = 0.86; this.sprite.sx = 1.1; }
    this.sfx('javali-grunhido', 0.8);
    return 'bounce';
  }
  onHit(h: HitInfo): boolean {
    if (this.dead) return false;
    if (h.kind === 'rolar' && !h.heavy) { // a cambalhota da Lili quica nele
      if (isHero(h.source)) { h.source.b.vx = -h.dir * 300; h.source.b.vy = -420; }
      this.sfx('pisao', 0.6);
      return true;
    }
    if (h.weapon === 'buzina') { this.vx = h.dir * 120; this.sfx('javali-grunhido'); return true; }
    if (h.kind === 'outro' && h.dmg <= 0) { this.stun(1.2); return true; }
    if (h.weapon === 'coco' || h.weapon === 'panela') { this.stun(1.6); this.sprite?.flash(0.08); return true; }
    return this.damage({ ...h, dmg: h.heavy || h.kind === 'explosao' || h.kind === 'montaria' ? 2 : 1 });
  }
  damage(h: HitInfo): boolean {
    const r = super.damage(h);
    if (!this.dead) { this.vx = (h.dir || -this.dir) * 140; this.vy = -180; }
    return r;
  }
}

register('javalim', (w, s) => new Javalim(w, s));
register('javalim-escudo', (w, s) => new JavalimEscudo(w, s));
register('javalao', (w, s) => new Javalao(w, s));
