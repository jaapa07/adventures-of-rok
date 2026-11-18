/**
 * Herói jogável (Tamá ou Lili). Sensação firme e pesada: pulo variável, coyote time, buffer,
 * corrida, especial, pisão, armas de mão com combo de 3 golpes e arremesso direcional,
 * cipós, cordas, natação, montarias, dano com fuga e mortes cômicas.
 */
import { Entity, type HitInfo } from './entity';
import { TILE, type HeroId } from './types';
import { makeBody, moveBody, T, type Body } from './physics';
import { Sprite } from '../render/sprite';
import { input } from '../core/input';
import { bus } from '../core/events';
import { game } from '../core/save';
import { WEAPONS, type WeaponDef, type ThrowMode } from './weapons/types';
import { upgradeLevel } from './progress';
import type { World } from './world';
import type { Light } from '../render/lighting';

export interface Rideable extends Entity {
  ride(hero: Hero): void;
  controlUpdate(dt: number, hero: Hero): void;
  dismount(hero: Hero, hurt: boolean): void;
  saddle(): [number, number];
  riderZ(): number;
}

export type HeroState = 'normal' | 'climb' | 'hang' | 'swim' | 'especial' | 'pound' | 'attack' | 'throw' | 'pickup' | 'hurt' | 'dead' | 'mounted' | 'swap' | 'pinned' | 'launched' | 'cutscene' | 'carryPartner';
export type DeathKind = 'normal' | 'queimado' | 'esmagado' | 'afogado' | 'queda';

interface Stats { walk: number; run: number; jump: number; w: number; h: number; heavy: boolean }
const STATS: Record<HeroId, Stats> = {
  tama: { walk: 300, run: 470, jump: 1060, w: 62, h: 128, heavy: true },
  lili: { walk: 345, run: 540, jump: 1170, w: 46, h: 104, heavy: false },
};
const GRAV = 2400, MAX_FALL = 900, COYOTE = 6 / 60, BUFFER = 6 / 60;

export interface Held { def: WeaponDef; usos: number }

export class Hero extends Entity {
  stats: Stats;
  state: HeroState = 'normal';
  stateT = 0;
  coyote = 0;
  jumpBuf = 0;
  jumpHeld = false;
  invuln = 0;
  held: Held | null = null;
  pocket: Held | null = null;
  heldSprite?: Sprite;
  combo = 0;
  comboWindow = 0;
  attackHitDone = false;
  climbing = false;
  swimming = false;
  mount: Rideable | null = null;
  glideT = 0;
  landT = 0;
  stepT = 0;
  idleT = 0;
  hitWall = 0;
  pinT = 0;
  pinAnim = 'preso';
  helmet = 0; // panela na cabeça (golpes extras)
  disguiseT = 0; // capacete de javalim
  resist = 0; // Coração de Sumaúma
  deathKind: DeathKind = 'normal';
  ropeY = 0;
  onDeathDone?: () => void;
  lastGroundY = 0;

  constructor(world: World, public hid: HeroId, x: number, y: number) {
    super(world, { t: hid, x: x / TILE, y: y / TILE });
    this.team = 'hero';
    this.stats = STATS[hid];
    this.persistent = true;
    this.body = makeBody(x, y, this.stats.w, this.stats.h);
    this.w = this.stats.w; this.h = this.stats.h;
    this.sprite = new Sprite(hid, world.preset, game.save.figurino[hid] ?? 'base', world.stage.entities, { shadow: true });
    this.sprite.play('idle');
    this.z = 40;
    this.resist = upgradeLevel('coracao');
    this.lastGroundY = y;
  }

  get isTama() { return this.hid === 'tama'; }
  get b(): Body { return this.body!; }
  get heavyHeld() { return this.held?.def.pega === 'cabeca'; }
  setState(s: HeroState) { this.state = s; this.stateT = 0; }
  setPreset(p: string) { this.sprite!.setPreset(p); this.heldSprite?.setPreset(p); }

  /* =============================== UPDATE (líder) =============================== */
  control(dt: number) {
    this.stateT += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.disguiseT > 0) this.disguiseT -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt;
    const b = this.b;
    const ax = input.axisX();
    if (input.pressed('jump')) this.jumpBuf = BUFFER; else this.jumpBuf -= dt;

    switch (this.state) {
      case 'mounted': this.mount?.controlUpdate(dt, this); this.syncFromMount(); return;
      case 'dead': this.updateDead(dt); return;
      case 'cutscene': this.physicsStep(dt, 0); this.animGround(); return;
      case 'pinned':
        this.pinT -= dt; b.vx *= 0.8;
        if (this.pinT <= 0) this.setState('normal');
        this.physicsStep(dt, 0); this.sprite!.play(this.pinAnim); return;
      case 'launched':
        this.physicsStep(dt, b.vx, 0.5); // mantém o impulso horizontal da flor-catapulta
        this.sprite!.play('rolar');
        this.stompCheck();
        for (const e of this.world.hitArea({ x: this.x, y: this.y, w: this.w + 20, h: this.h }, { kind: 'rolar', dmg: 1, dir: Math.sign(b.vx) || 1, x: this.x, y: this.y, source: this }, (e) => e.team === 'enemy')) if (e.dead) this.world.enemyKilled(e, 'rolar');
        if (b.onGround || b.hitWall || this.stateT > 2.5 || b.inWater) this.setState('normal');
        return;
    }

    // ---- água ----
    if (b.inWater && this.state !== 'swim' && this.state !== 'hurt') { this.setState('swim'); b.vy = Math.min(b.vy, 320); this.world.sfx('agua-entrar', this.x); this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - this.h * 0.5); this.dropHeld(); }
    if (this.state === 'swim') { this.updateSwim(dt, ax); return; }

    if (this.state === 'climb') { this.updateClimb(dt, ax); return; }
    if (this.state === 'hang') { this.updateHang(dt, ax); return; }
    if (this.state === 'hurt') { this.physicsStep(dt, b.vx * 0.98); this.sprite!.play('dano'); if (b.onGround && this.stateT > 0.35) this.setState('normal'); return; }

    // ---- ações que travam o controle ----
    if (this.state === 'pickup') { this.physicsStep(dt, 0); if (this.sprite!.ended) this.setState('normal'); return; }
    if (this.state === 'throw') { this.physicsStep(dt, b.vx * 0.85); if (this.sprite!.ended) this.setState('normal'); return; }
    if (this.state === 'attack') { this.updateAttack(dt); return; }
    if (this.state === 'especial') { this.updateEspecial(dt, ax); return; }
    if (this.state === 'pound') { this.updatePound(dt); return; }
    if (this.state === 'swap' || this.state === 'carryPartner') { this.physicsStep(dt, 0); return; }

    // ---- movimento normal ----
    const running = input.down('action') && !this.held;
    const weightK = this.held ? (this.held.def.peso === 'pesado' ? 0.8 : this.held.def.peso === 'medio' ? 0.92 : 1) : 1;
    const maxV = (running ? this.stats.run : this.stats.walk) * weightK;
    const accel = b.onGround ? (running ? maxV / 0.35 : 2600) : 1700;
    const fric = b.onGround ? (this.world.regionFlags.chuva ? 900 : 3200) : 600;
    let vx = b.vx;
    const crouch = b.onGround && input.down('down') && Math.abs(vx) < 40;
    if (ax !== 0 && !crouch) {
      if (Math.sign(vx) !== ax && Math.abs(vx) > 120 && b.onGround) this.world.spawnFx('fx-poeira', 'corrida', this.x - ax * 20, this.y, { flip: ax < 0, scale: 0.8 });
      // acima da velocidade máxima (impulso de rolamento, quique, chuva) só desacelera; nunca acelera além dela
      if (Math.sign(vx) === ax && Math.abs(vx) > maxV) vx = ax * Math.max(maxV, Math.abs(vx) - fric * dt);
      else { vx += ax * accel * dt; if (Math.sign(vx) === ax && Math.abs(vx) > maxV) vx = ax * maxV; }
      this.dir = ax as 1 | -1;
    } else {
      const d = fric * dt;
      vx = Math.abs(vx) <= d ? 0 : vx - Math.sign(vx) * d;
    }

    // pulo
    if (b.onGround) { this.coyote = COYOTE; this.glideT = 0; } else this.coyote -= dt;
    if (this.jumpBuf > 0 && this.coyote > 0) {
      if (crouch && this.isOnOneway()) { b.dropThrough = 0.25; b.y += 2; this.jumpBuf = 0; }
      else this.doJump(this.stats.jump * (this.held?.def.peso === 'pesado' ? 0.85 : 1));
    }
    if (!input.down('jump') && b.vy < 0 && this.jumpHeld) { b.vy *= 0.45; this.jumpHeld = false; }

    // planada da Lili (cauda) e guarda-chuva
    let maxFall = MAX_FALL;
    const canGlide = (this.hid === 'lili' || this.held?.def.id === 'guarda-chuva') && !b.onGround && b.vy > 0 && input.down('jump');
    const glideMax = 0.7 * (1 + 0.4 * upgradeLevel('cauda'));
    if (canGlide && (this.held?.def.id === 'guarda-chuva' || this.glideT < glideMax)) { this.glideT += dt; maxFall = 150; }

    // ações
    if (input.pressed('drop') && this.held) this.dropHeld(true);
    if (input.pressed('pocket') && upgradeLevel('bolso') > 0) this.swapPocket();
    if (input.pressed('action')) {
      if (this.held) this.useHeld();
      else if (!this.tryGrab() && !this.tryInteract()) {
        if (crouch && this.isTama) this.startPound();
        else if (this.isTama ? b.onGround : true) this.startEspecial();
      }
      // a ação trocou o estado (pegar, golpe, arremesso, especial, batida, montar): não deixe anim() sobrescrever a animação
      if (this.state !== 'normal') return;
    }
    // escalar cipó / pegar corda
    const vineHere = this.world.grid.atPx(this.x, this.y - this.h * 0.6);
    if ((vineHere === T.VINE) && (input.down('up') || !b.onGround) && !this.heavyHeld && this.stateT > 0.15) { this.startClimb(); return; }
    if (!b.onGround && b.vy > -100 && !this.heavyHeld) {
      const ty = Math.floor((this.y - this.h - 6) / TILE);
      if (this.world.grid.at(Math.floor(this.x / TILE), ty) === T.ROPE) { this.startHang(ty); return; }
    }

    const wasGround = b.onGround;
    const fallV = b.vy;
    this.physicsStep(dt, vx, 1, maxFall);
    if (!wasGround && b.onGround) this.onLand(fallV);
    if (b.onGround) this.lastGroundY = this.y;
    this.stompCheck();
    this.hazards();
    this.anim(dt, running, crouch);
  }

  private isOnOneway() { const t = this.world.grid.atPx(this.x, this.y + 2); return t === T.ONEWAY || t === T.RAIL || (this.b.groundSolid?.oneway ?? false); }

  doJump(v: number) {
    const b = this.b;
    b.vy = -v; this.jumpBuf = 0; this.coyote = 0; this.jumpHeld = true;
    b.onGround = false;
    this.sprite!.play('pulo', { restart: true });
    this.sprite!.sx = 0.88; this.sprite!.sy = 1.14;
    this.world.sfx(this.isTama ? 'pulo-tama' : 'pulo-lili', this.x);
    this.world.spawnFx('fx-poeira', 'pulo', this.x, this.y, { scale: 0.9 });
  }
  /** quique externo (bromélia, pisão) */
  bounce(v: number, fromStomp = false) {
    const b = this.b;
    const extra = input.down('jump') ? 1.25 : 1;
    b.vy = -v * extra; this.jumpHeld = input.down('jump'); b.onGround = false; this.coyote = 0;
    if (this.state !== 'mounted') { this.setState('normal'); this.sprite!.play('pulo', { restart: true }); }
    this.sprite!.sx = 0.85; this.sprite!.sy = 1.18;
    if (!fromStomp) this.world.spawnFx('fx-poeira', 'pulo', this.x, this.y);
  }
  launch(vx: number, vy: number) {
    this.b.vx = vx; this.b.vy = vy; this.b.onGround = false; this.setState('launched'); this.dir = vx >= 0 ? 1 : -1;
  }
  pin(sec: number, anim = 'preso') { if (this.state === 'dead') return; this.pinT = sec; this.pinAnim = anim; this.setState('pinned'); }

  private onLand(fallV: number) {
    this.sprite!.sx = 1.16; this.sprite!.sy = 0.84;
    if (fallV > 500) {
      this.landT = 0.12;
      this.world.sfx(this.isTama ? 'aterrissar-tama' : 'aterrissar-lili', this.x);
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y);
      if (this.isTama && fallV > 850) this.world.shake(3, 120);
    }
  }

  physicsStep(dt: number, vx: number, gravK = 1, maxFall = MAX_FALL) {
    const b = this.b;
    b.vx = vx;
    b.vy = Math.min(b.vy + GRAV * gravK * dt, maxFall);
    moveBody(b, this.world.grid, this.world.solids, dt);
    this.x = b.x; this.y = b.y; this.vx = b.vx; this.vy = b.vy;
    this.hitWall = b.hitWall;
    if (this.y > this.world.grid.pxH + 160 && this.state !== 'dead') this.die('queda');
  }

  /* =============================== animação =============================== */
  private anim(dt: number, running: boolean, crouch: boolean) {
    const s = this.sprite!, b = this.b;
    s.sx += (1 - s.sx) * Math.min(1, dt * 12);
    s.sy += (1 - s.sy) * Math.min(1, dt * 12);
    if (this.landT > 0) this.landT -= dt;
    const heavy = this.heavyHeld;
    if (b.onGround) {
      const sp = Math.abs(b.vx);
      if (this.landT > 0 && sp < 60) { s.play('aterrissar'); return; }
      if (sp < 12) {
        this.idleT += dt;
        if (heavy) s.play('carregar-parado');
        else if (crouch) s.play('agachar');
        else if (input.down('up')) s.play('olhar-cima');
        else if (s.animName.startsWith('tedio') && !s.ended) { /* deixa terminar */ }
        else s.play('idle');
      } else {
        this.idleT = 0;
        if (heavy) s.play('carregar', { speed: Math.max(0.6, sp / this.stats.walk) });
        else if (running && sp > this.stats.walk * 1.05) s.play('correr', { speed: Math.max(0.8, sp / this.stats.run) });
        else s.play('andar', { speed: Math.max(0.6, sp / this.stats.walk) });
        this.stepT -= dt * (sp / 300);
        if (this.stepT <= 0) { this.stepT = 0.32; this.world.sfx(this.footstep(), this.x, 0.5); }
      }
    } else {
      this.idleT = 0;
      if (heavy) s.play('carregar-parado');
      else if (this.glideT > 0 && b.vy > 0 && b.vy <= 160 && this.hid === 'lili' && !this.held) s.play('planar');
      else if (b.vy < -250) s.play('pulo');
      else if (b.vy < 250) s.play('apice');
      else s.play('queda');
    }
  }
  private animGround() { const b = this.b; this.sprite!.play(b.onGround ? (Math.abs(b.vx) > 20 ? 'andar' : 'idle') : 'queda'); }
  footstep() {
    const t = this.world.grid.atPx(this.x, this.y + 4);
    if (t === T.ONEWAY || this.b.groundSolid) return 'passo-madeira';
    return ({ mata: 'passo-terra', gruta: 'passo-pedra', recife: 'passo-terra', fabrica: 'passo-metal', cristal: 'passo-pedra', copa: 'passo-madeira' } as Record<string, string>)[this.world.level.tileset] ?? 'passo-terra';
  }

  /* =============================== pisão e perigos =============================== */
  stompCheck() {
    const b = this.b;
    if (b.vy <= 60 && this.state !== 'launched') return;
    for (const e of this.world.entities) {
      if (e.dead || !e.stompable) continue;
      const top = e.y - e.h;
      if (Math.abs(e.x - this.x) < (e.w + this.w) / 2 - 6 && this.y >= top - 6 && this.y <= top + Math.max(26, b.vy * 0.04)) {
        const r = e.onStomp(this, this.isTama || this.state === 'mounted');
        if (r === 'kill') {
          this.world.sfx(this.isTama ? 'pisao-forte' : 'pisao', e.x);
          this.world.spawnFx('fx-faisca', 'impacto', e.x, top);
          this.world.hitstop(60);
          this.y = top; b.y = top;
          this.bounce(720, true);
          this.world.enemyKilled(e, 'pisao');
        } else if (r === 'bounce') {
          this.world.sfx('pisao', e.x, 0.7);
          this.y = top; b.y = top;
          this.bounce(620, true);
        } else this.hurt({ kind: 'outro', dmg: 1, dir: Math.sign(this.x - e.x) || 1, x: e.x, y: e.y, source: e });
        return;
      }
    }
  }
  private hazards() {
    const b = this.b;
    if (this.invuln > 0) return;
    const t1 = this.world.grid.atPx(this.x - this.w / 3, this.y - 4), t2 = this.world.grid.atPx(this.x + this.w / 3, this.y - 4), t3 = this.world.grid.atPx(this.x, this.y + 2);
    if ((t1 === T.SPIKE || t2 === T.SPIKE || (t3 === T.SPIKE && b.vy >= 0))) { this.hurt({ kind: 'outro', dmg: 1, dir: -this.dir, x: this.x, y: this.y }); return; }
    for (const e of this.world.entities) {
      if (e.dead || !e.touchHurts) continue;
      if (Math.abs(e.x - this.x) < (e.w + this.w) / 2 - 8 && this.y - this.h < e.y - 6 && this.y > e.y - e.h + 10) {
        if (this.disguiseT > 0 && e.team === 'enemy') continue;
        this.hurt({ kind: 'outro', dmg: 1, dir: Math.sign(this.x - e.x) || 1, x: e.x, y: e.y, source: e });
        return;
      }
    }
  }

  /* =============================== dano e morte =============================== */
  /** Retorna true se o herói foi de fato atingido. */
  hurt(h: HitInfo, kind: DeathKind = 'normal'): boolean {
    if (this.invuln > 0 || this.state === 'dead') return false;
    if (this.state === 'mounted' && this.mount) { this.mount.dismount(this, true); this.invuln = 1.2; return true; }
    if (this.state === 'especial' && this.isTama && h.kind !== 'explosao') return false;
    if (this.helmet > 0) {
      this.helmet--; this.invuln = 1;
      this.world.text('PÓÓIN!', this.x, this.y - this.h);
      this.world.sfx('pooin', this.x);
      if (this.helmet === 0) this.world.spawnFx('arma-panela', 'quebrar', this.x, this.y - this.h);
      return true;
    }
    if (this.resist > 0 && this.world.duo.resistUsed < this.resist) {
      this.world.duo.resistUsed++;
      this.invuln = 1.2; this.b.vx = h.dir * 260; this.b.vy = -420; this.setState('hurt');
      this.world.sfx(this.isTama ? 'voz-tama-dor' : 'voz-lili-dor', this.x);
      this.sprite!.flash(0.1);
      return true;
    }
    this.world.hitstop(120);
    this.world.shake(6, 220);
    this.sprite!.flash(0.12);
    this.world.sfx('dano', this.x);
    this.world.sfx(this.isTama ? 'voz-tama-dor' : 'voz-lili-dor', this.x);
    bus.emit('hero-hurt', { hero: this.hid });
    this.dropHeld();
    this.world.duo.leaderHit(this, h, kind);
    return true;
  }

  die(kind: DeathKind) {
    if (this.state === 'dead') return;
    this.deathKind = kind;
    this.dropHeld();
    // qualquer morte (inclusive queda no abismo) termina em perda de vida, salvo se alguém já definiu o desfecho
    if (!this.onDeathDone) this.onDeathDone = () => this.world.heroDied();
    if (kind === 'queda' && this.world.duo.leader === this) { const p = this.world.duo.partner; if (p) p.sprite!.visible = false; }
    this.setState('dead');
    this.b.vx = 0;
    if (kind === 'queda') { this.b.vy = 0; this.sprite!.visible = false; }
    else if (kind === 'afogado') this.b.vy = 0;
    else this.b.vy = -700;
    this.sprite!.play(kind === 'normal' || kind === 'queda' ? 'morte' : `morte-${kind}`, { restart: true });
    if (kind === 'queimado') this.sprite!.extraFilter = 'brightness(0.25) contrast(1.4)';
    if (kind === 'afogado') this.world.spawnFx('fx-bolhas-sos', 'idle', this.x, this.y - this.h, { follow: this });
    this.world.sfx('morte', this.x);
    bus.emit('death', { kind });
  }
  private updateDead(dt: number) {
    const b = this.b;
    if (this.deathKind === 'esmagado' || this.deathKind === 'queimado') { /* fica no lugar */ }
    else { b.vy = Math.min(b.vy + GRAV * 0.7 * dt, MAX_FALL); this.y += b.vy * dt; b.y = this.y; }
    if (this.stateT > 2.0 && this.onDeathDone) { const f = this.onDeathDone; this.onDeathDone = undefined; f(); }
  }

  /* =============================== cipó, corda, água =============================== */
  private startClimb() {
    this.setState('climb'); this.climbing = true;
    this.x = Math.floor(this.x / TILE) * TILE + TILE / 2; this.b.x = this.x; this.b.vx = 0; this.b.vy = 0;
    this.world.sfx('escalar', this.x);
  }
  private updateClimb(dt: number, ax: number) {
    const b = this.b;
    const up = (input.down('up') ? -1 : 0) + (input.down('down') ? 1 : 0);
    const ny = this.y + up * 200 * dt;
    const t = this.world.grid.atPx(this.x, ny - this.h * 0.6);
    if (t === T.VINE || up > 0) { this.y = ny; b.y = ny; }
    const still = this.world.grid.atPx(this.x, this.y - this.h * 0.6) === T.VINE;
    this.sprite!.play(up !== 0 ? 'escalar' : 'pendurar', { speed: up !== 0 ? 1 : 0.6 });
    if (ax) this.dir = ax as 1 | -1;
    if (this.jumpBuf > 0) { this.climbing = false; this.setState('normal'); b.vx = ax * this.stats.walk; this.doJump(this.stats.jump * 0.85); return; }
    if (!still) { this.climbing = false; this.setState('normal'); }
    moveBody(b, this.world.grid, this.world.solids, 0);
    if (b.onGround && up > 0) { this.climbing = false; this.setState('normal'); }
  }
  private startHang(ty: number) {
    this.setState('hang'); this.ropeY = (ty + 1) * TILE - 8; this.b.vy = 0;
    this.world.sfx('escalar', this.x);
  }
  private updateHang(dt: number, ax: number) {
    const b = this.b;
    b.vx = ax * 220;
    this.x += b.vx * dt; b.x = this.x;
    this.y = this.ropeY + this.h; b.y = this.y; b.vy = 0;
    if (ax) this.dir = ax as 1 | -1;
    this.sprite!.play('pendurar', { speed: ax ? 1.6 : 0.6 });
    const onRope = this.world.grid.at(Math.floor(this.x / TILE), Math.floor((this.ropeY - 4) / TILE)) === T.ROPE;
    if (input.pressed('down') || !onRope) { this.setState('normal'); b.vy = 60; return; }
    if (this.jumpBuf > 0) { this.setState('normal'); this.doJump(this.stats.jump * 0.75); }
  }
  private updateSwim(dt: number, ax: number) {
    const b = this.b;
    this.swimming = true;
    const ay = (input.down('down') ? 1 : 0) - (input.down('up') ? 1 : 0);
    b.vx += (ax * 360 - b.vx) * Math.min(1, dt * 3);
    if (this.jumpBuf > 0) {
      this.jumpBuf = 0;
      const surface = !this.isWaterAt(this.x, this.y - this.h - 8);
      if (surface) { this.swimming = false; this.setState('normal'); this.doJump(this.stats.jump); this.jumpHeld = false; /* pulo cheio (sem corte ao soltar o botão): alcança margens 2 tiles acima da linha d'água */ this.world.sfx('agua-sair', this.x); this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - this.h * 0.5); return; }
      b.vy = -300; this.world.sfx('bracada', this.x);
      this.world.spawnFx('fx-agua', 'bolha-p', this.x + this.dir * 30, this.y - this.h * 0.8, { vy: -60, life: 1.2, fade: 0.4, loop: true });
    }
    b.vy += (ay * 180 + 40 - b.vy) * Math.min(1, dt * 1.2);
    const corr = this.world.regionFlags.correnteza ?? 0;
    const ovx = b.vx;
    b.vx += corr;
    moveBody(b, this.world.grid, this.world.solids, dt, false);
    b.vx = ovx;
    // boia na superfície: a braçada não joga o herói para fora d'água (sair é com o pulo, de cabeça de fora)
    const mid = b.y - this.h * 0.55;
    if (b.vy < 0 && this.isWaterAt(b.x, mid + 8) && !this.isWaterAt(b.x, mid - 6) && this.world.grid.atPx(b.x, mid - 6) === T.EMPTY) {
      b.y = Math.floor((mid + 8) / TILE) * TILE + this.h * 0.55 + 4; b.vy = 0;
      const m2 = this.world.grid.atPx(b.x, b.y - this.h * 0.55);
      b.inWater = m2 === T.WATER || m2 === T.WATER_VINE;
    }
    this.x = b.x; this.y = b.y;
    if (ax) this.dir = ax as 1 | -1;
    this.sprite!.play('nadar', { speed: 0.7 + Math.abs(b.vx) / 400 });
    if (!b.inWater) { this.swimming = false; this.setState('normal'); this.world.sfx('agua-sair', this.x); }
    if (Math.floor(this.world.time * 1.3) !== Math.floor((this.world.time - dt) * 1.3)) this.world.spawnFx('fx-agua', 'bolha-p', this.x + this.dir * 34, this.y - this.h * 0.85, { vy: -70, life: 1.4, fade: 0.4, loop: true });
    this.stompCheck();
    this.hazards();
  }
  private isWaterAt(x: number, y: number) { const t = this.world.grid.atPx(x, y); return t === T.WATER || t === T.WATER_VINE; }

  /* =============================== especiais =============================== */
  private startEspecial() {
    const b = this.b;
    this.setState('especial');
    this.sprite!.play('especial', { restart: true });
    if (this.isTama) { b.vx = this.dir * 620; this.world.sfx('rolar', this.x); }
    else { b.vx = this.dir * Math.max(Math.abs(b.vx), 420); if (b.onGround) b.vy = -520; this.world.sfx('cambalhota', this.x); }
  }
  private updateEspecial(dt: number, ax: number) {
    const b = this.b;
    const dur = this.isTama ? 0.62 : 0.6;
    // pular durante o rolamento (salto longo típico do gênero, inclusive saindo de bordas)
    if (this.jumpBuf > 0 && (b.onGround || this.coyote > 0)) { this.setState('normal'); this.doJump(this.stats.jump * 0.95); b.vx = this.dir * this.stats.run * 1.1; return; }
    if (b.onGround) this.coyote = COYOTE; else this.coyote -= dt;
    const vx = this.isTama ? this.dir * (620 - this.stateT * 300) : b.vx + ax * 400 * dt;
    this.physicsStep(dt, vx);
    const hits = this.world.hitArea({ x: this.x + this.dir * 10, y: this.y, w: this.w + 28, h: this.h * 0.7 }, { kind: 'rolar', dmg: 1, dir: this.dir, x: this.x, y: this.y, source: this, heavy: this.isTama }, (e) => e.team === 'enemy');
    for (const e of hits) if (e.dead) this.world.enemyKilled(e, 'rolar');
    if (!this.isTama) this.stompCheck();
    if (this.stateT >= dur || b.hitWall) { this.setState('normal'); if (b.hitWall) { this.world.shake(3, 100); this.world.sfx('pisao', this.x, 0.5); } }
    this.hazards();
  }
  private startPound() {
    this.setState('pound');
    this.sprite!.play('batida', { restart: true });
    this.attackHitDone = false;
  }
  private updatePound(dt: number) {
    this.physicsStep(dt, 0);
    if (!this.attackHitDone && this.sprite!.frame >= Math.floor(this.sprite!.entry!.n * 0.55)) {
      this.attackHitDone = true;
      this.world.sfx('batida-chao', this.x);
      this.world.shake(8, 260);
      this.world.hitstop(50);
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x - 30, this.y, { flip: true });
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x + 30, this.y);
      bus.emit('pound', { x: this.x, y: this.y });
      this.world.hitArea({ x: this.x, y: this.y, w: 320, h: 80 }, { kind: 'outro', dmg: 0, dir: 0, x: this.x, y: this.y, source: this, heavy: true }, (e) => e.team !== 'hero');
    }
    if (this.sprite!.ended) this.setState('normal');
  }

  /* =============================== armas de mão =============================== */
  tryGrab(): boolean {
    for (const e of this.world.entities) {
      if (e.dead || !e.grabbable) continue;
      if (Math.abs(e.x - this.x) < 70 + e.w / 2 && Math.abs(e.y - this.y) < 60) {
        const def = WEAPONS[e.grabbable];
        if (!def) continue;
        if ((def.soTama || def.peso === 'pesado') && !this.isTama) { this.world.text('PESADO!', this.x, this.y - this.h - 10, 'small'); this.world.sfx('ui-erro', this.x); return true; }
        const usos = (e as unknown as { usos?: number }).usos ?? def.usos + (def.usos !== Infinity ? upgradeLevel('maos') : 0);
        e.kill();
        this.equip({ def, usos });
        this.setState('pickup');
        this.sprite!.play(def.pega === 'cabeca' ? 'pegar-pesado' : 'pegar', { restart: true });
        this.world.sfx(def.id.startsWith('cabaca') ? 'cabaca-pegar' : 'arma-pegar', this.x);
        bus.emit('weapon-pick', { id: def.id });
        return true;
      }
    }
    return false;
  }
  tryInteract(): boolean {
    for (const e of this.world.entities) {
      if (e.dead || !e.onInteract) continue;
      if (Math.abs(e.x - this.x) < 80 + e.w / 2 && Math.abs(e.y - this.y) < 90 && e.onInteract(this)) return true;
    }
    return false;
  }
  equip(h: Held) {
    this.held = h;
    this.heldSprite?.destroy();
    this.heldSprite = new Sprite(h.def.model, this.world.preset, 'base', this.world.stage.entities);
    this.heldSprite.play(h.def.pega === 'cabeca' ? (this.heldSprite.has('idle') ? 'idle' : 'mundo') : 'mao');
    bus.emit('held', { id: h.def.id, usos: h.usos });
  }
  dropHeld(place = false) {
    if (!this.held) return;
    const h = this.held;
    this.held = null;
    this.heldSprite?.destroy(); this.heldSprite = undefined;
    bus.emit('held', null);
    if (place) {
      const e = this.world.spawn({ t: h.def.id.startsWith('cabaca') || h.def.id === 'bromelia' ? h.def.id : 'arma', id: h.def.id, x: (this.x + this.dir * 50) / TILE, y: this.y / TILE });
      if (e) (e as unknown as { usos: number }).usos = h.usos;
    }
  }
  private swapPocket() {
    const a = this.held, p = this.pocket;
    this.pocket = a;
    this.heldSprite?.destroy(); this.heldSprite = undefined; this.held = null;
    if (p) this.equip(p); else bus.emit('held', null);
    bus.emit('pocket', this.pocket ? { id: this.pocket.def.id } : null);
    this.world.sfx('arma-pegar', this.x, 0.6);
  }
  private useHeld() {
    const h = this.held!;
    const mode: ThrowMode | null = input.down('up') ? 'cima' : input.down('down') ? 'baixo' : input.axisX() !== 0 || !h.def.golpe ? 'frente' : null;
    if (mode) { this.throwHeld(mode); return; }
    this.startAttack();
  }
  throwHeld(mode: ThrowMode) {
    const h = this.held!;
    if (mode === 'baixo' && !h.def.arremessar) { this.dropHeld(true); return; }
    this.held = null;
    this.heldSprite?.destroy(); this.heldSprite = undefined;
    bus.emit('held', null);
    this.setState('throw');
    this.sprite!.play(mode === 'cima' ? 'arremessar-cima' : 'arremessar', { restart: true });
    this.world.sfx('arremesso', this.x);
    const forca = 1 + 0.15 * upgradeLevel('braco');
    // armas de mão saem da altura do braço (o arremesso reto da Tamá passava por cima dos Javalins próximos); o que vai na cabeça sai do alto
    const alt = h.def.pega === 'cabeca' || mode === 'cima' ? 0.8 : 0.6;
    const e = h.def.arremessar?.(this.world, this, mode) ?? this.world.spawn({ t: 'arremessado', id: h.def.id, x: (this.x + this.dir * 40) / TILE, y: (this.y - this.h * alt) / TILE, dir: this.dir, modo: mode, forca });
    if (e) { (e as unknown as { usos: number }).usos = h.usos; (e as unknown as { forca: number }).forca = forca; }
  }
  private startAttack() {
    const g = this.held!.def.golpe;
    if (!g) return;
    this.combo = this.comboWindow > 0 ? (this.combo % 3) + 1 : 1;
    this.setState('attack');
    this.attackHitDone = false;
    this.sprite!.play(`golpe${this.combo}`, { restart: true, speed: this.held!.def.peso === 'pesado' ? 0.85 : 1.15 });
    this.world.sfx(g.som, this.x);
  }
  private updateAttack(dt: number) {
    const s = this.sprite!;
    const b = this.b;
    this.physicsStep(dt, b.onGround ? b.vx * 0.8 : b.vx);
    if (!this.held) { this.setState('normal'); return; }
    const g = this.held.def.golpe!;
    const hitFrame = Math.floor((s.entry?.n ?? 8) * (this.combo === 3 ? 0.6 : 0.55));
    if (!this.attackHitDone && s.frame >= hitFrame) {
      this.attackHitDone = true;
      const area = { x: this.x + this.dir * (g.alcance / 2 + this.w * 0.3), y: this.y + 4, w: g.alcance, h: g.altura };
      const hits = this.world.hitArea(area, { kind: 'arma', dmg: g.dmg * (this.combo === 3 ? 2 : 1), dir: this.dir, x: this.x, y: this.y, weapon: this.held.def.id, source: this, heavy: this.combo === 3 || this.held.def.peso === 'pesado' });
      if (hits.length) {
        this.world.hitstop(this.combo === 3 ? 110 : 60);
        if (g.acerto) this.world.sfx(g.acerto, area.x);
        else this.world.sfx('golpe-acerto', area.x);
        if (g.onomato) this.world.text(g.onomato, area.x, this.y - this.h);
        this.world.spawnFx('fx-faisca', 'impacto', area.x, this.y - this.h * 0.55);
        for (const e of hits) {
          if (g.empurra) e.vx = this.dir * g.empurra * (this.combo === 3 ? 1.6 : 1);
          if (e.dead && e.team === 'enemy') this.world.enemyKilled(e, 'arma', this.held.def.id);
          bus.emit('weapon-hit', { id: this.held.def.id, target: e.spawn.t });
        }
      }
      g.especial?.(this.world, this, hits[0] ?? null, this.combo);
      if (this.held && this.held.def.usos !== Infinity) {
        this.held.usos--;
        bus.emit('held', { id: this.held.def.id, usos: this.held.usos });
        if (this.held.usos <= 0) this.breakHeld();
      }
    }
    if (s.ended) { this.comboWindow = 18 / 60; this.setState('normal'); }
  }
  breakHeld() {
    const h = this.held!;
    this.world.spawnFx(h.def.model, 'quebrar', this.x + this.dir * 40, this.y - this.h * 0.5, { flip: this.dir < 0 });
    this.world.sfx('arma-quebrar', this.x);
    h.def.aoQuebrar?.(this.world, this);
    bus.emit('weapon-break', { id: h.def.id });
    this.held = null; this.heldSprite?.destroy(); this.heldSprite = undefined;
    bus.emit('held', null);
  }

  /* =============================== montaria =============================== */
  rideOn(m: Rideable) {
    this.dropHeld();
    this.mount = m;
    this.setState('mounted');
    this.sprite!.play('montar', { restart: true, onEnd: () => this.sprite!.play('montado') });
    m.ride(this);
    this.world.sfx('montar', this.x);
    bus.emit('mount', { id: m.spawn.t });
  }
  leaveMount() {
    if (!this.mount) return;
    const m = this.mount;
    this.mount = null;
    this.setState('normal');
    this.b.x = this.x; this.b.y = this.y; this.b.vy = -600; this.b.vx = 0;
    this.world.sfx('desmontar', this.x);
    bus.emit('dismount', { id: m.spawn.t });
  }
  private syncFromMount() {
    if (!this.mount) return;
    const [sx, sy] = this.mount.saddle();
    this.x = sx; this.y = sy; this.b.x = sx; this.b.y = sy;
    this.dir = this.mount.dir;
    this.z = this.mount.riderZ();
    if (!this.sprite!.animName.startsWith('mont')) this.sprite!.play('montado');
  }

  /* =============================== render =============================== */
  render() {
    const s = this.sprite!;
    s.x = this.x; s.y = this.y; s.flip = this.dir < 0; s.z = this.z;
    s.alpha = this.invuln > 0 && this.state !== 'dead' && Math.floor(this.invuln * 20) % 2 === 0 ? 0.45 : 1;
    s.groundY = this.state === 'dead' || this.state === 'mounted' ? null : this.groundBelow();
    s.extraFilter = this.state === 'dead' && this.deathKind === 'queimado' ? 'brightness(0.25) contrast(1.4)' : this.disguiseT > 0 ? 'sepia(0.3)' : '';
    s.render();
    if (this.heldSprite && this.held) {
      const hs = this.heldSprite;
      if (this.held.def.pega === 'cabeca') {
        const a = s.anchor('head');
        hs.x = (a?.[0] ?? this.x) + this.dir * 4; hs.y = (a?.[1] ?? this.y - this.h) + (hs.entry ? hs.entry.ch - hs.entry.py : 0) * 0 - 6;
        hs.rot = 0; hs.flip = this.dir < 0; hs.z = this.z + 2;
      } else {
        const a = s.anchor('hand');
        hs.x = a?.[0] ?? this.x + this.dir * 30; hs.y = a?.[1] ?? this.y - this.h * 0.5;
        hs.flip = this.dir < 0; hs.rot = a?.[2] ?? 0; hs.sx = 1; hs.sy = 1;
        hs.z = this.z + (this.state === 'climb' ? -2 : 2);
      }
      hs.render();
    }
  }
  tick(dt: number) { this.sprite!.update(dt); this.heldSprite?.update(dt); this.held?.def.segurando?.(this.world, this, dt); }
  groundBelow(): number | null {
    if (this.b.onGround) return this.y;
    const tx = Math.floor(this.x / TILE);
    for (let ty = Math.floor(this.y / TILE); ty < Math.floor(this.y / TILE) + 8; ty++) {
      const t = this.world.grid.at(tx, ty);
      if (t === T.SOLID || t === T.ONEWAY || t === T.BELT_L || t === T.BELT_R || t === T.RAIL) return ty * TILE;
    }
    return null;
  }
  light(): Light { return { x: this.x, y: this.y - this.h * 0.55, r: this.held?.def.id === 'lamparina' ? 300 : 150 }; }

  destroy() { this.sprite?.destroy(); this.heldSprite?.destroy(); }
}
