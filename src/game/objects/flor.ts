/**
 * Flor-catapulta {ang, gira?, forca?, auto?}: planta carnívora que engole o herói, mira (fixa ou girando)
 * e dispara com o pulo (ou sozinha, se `auto`). Interação 17.3: cospe cocos como canhão.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import type { Hero } from '../hero';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { ensureObjectCss } from './css';

interface CocoLike { engolir(): void; disparar(x: number, y: number, vx: number, vy: number): void; dead: boolean }

export class FlorCatapulta extends Entity {
  base: number; // graus (0 = direita, negativo = para cima)
  gira: boolean;
  auto: boolean;
  forca: number;
  ang: number;
  hero: Hero | null = null;
  coco: CocoLike | null = null;
  private t = 0;
  private cd = 0;
  private ignore: Hero | null = null;
  private mira: HTMLDivElement;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    ensureObjectCss();
    this.base = Number(s.ang ?? -45);
    this.ang = this.base;
    this.gira = !!s.gira;
    this.auto = !!s.auto;
    this.forca = Number(s.forca ?? 1500);
    this.w = 110; this.h = 150; this.z = 30;
    this.team = 'neutral';
    this.mira = document.createElement('div');
    this.mira.className = 'flor-mira';
    this.mira.style.display = 'none';
    w.stage.chunksFront.append(this.mira);
  }
  init() { this.makeSprite('flor-catapulta', 'idle', { shadow: true }); }
  get mouthX() { return this.x; }
  get mouthY() { return this.y - 110; }

  private aimNow() {
    return this.gira ? this.base + Math.sin(this.t * 2.2) * 55 : this.base;
  }

  update(dt: number) {
    this.sprite?.update(dt);
    if (this.cd > 0) this.cd -= dt;
    const L = this.world.duo.leader;
    if (this.ignore && (Math.abs(this.ignore.x - this.x) > 110 || this.ignore.y < this.y - 260)) this.ignore = null;
    if (!this.hero && !this.coco && this.cd <= 0 && L !== this.ignore) {
      const st = L.state;
      if (st !== 'dead' && st !== 'mounted' && st !== 'cutscene' && st !== 'swim' && Math.abs(L.x - this.x) < 56 && L.y > this.y - 190 && L.y <= this.y + 4 && (L.b.vy >= 0 || st === 'launched')) this.engolirHeroi(L);
    }
    if (this.hero) {
      const h = this.hero;
      this.t += dt;
      this.ang = this.aimNow();
      h.x = this.mouthX; h.y = this.mouthY + 40; h.b.x = h.x; h.b.y = h.y; h.b.vx = 0; h.b.vy = 0;
      if (h.state !== 'cutscene') { this.soltar(); return; }
      const fire = (this.t > 0.25 && input.pressed('jump')) || (this.auto && this.t > 0.75);
      if (fire) this.dispararHeroi();
    } else if (this.coco) {
      this.t += dt;
      this.ang = this.aimNow();
      if (this.coco.dead) { this.coco = null; return; }
      if (this.t > 0.55) {
        const a = (this.ang * Math.PI) / 180;
        this.coco.disparar(this.mouthX + Math.cos(a) * 60, this.mouthY + Math.sin(a) * 60, Math.cos(a) * 1400, Math.sin(a) * 1400);
        this.coco = null;
        this.sprite?.play('disparar', { restart: true, onEnd: () => this.sprite?.play('idle') });
        this.sfx('flor-disparo');
        this.world.text('PUM!', this.mouthX, this.mouthY - 30);
        this.world.shake(3, 120);
        this.cd = 0.4;
        bus.emit('flor-coco');
      }
    } else if (this.gira) { this.t += dt; this.ang = this.aimNow(); }
  }

  private engolirHeroi(h: Hero) {
    this.hero = h; this.t = 0;
    this.persistent = true;
    if (h.held) h.dropHeld(true);
    h.setState('cutscene');
    h.sprite!.visible = false;
    this.sprite?.play('engolir', { restart: true, onEnd: () => this.sprite?.play('mirar') });
    this.sfx('flor-sugar');
    bus.emit('flor-engoliu', { hero: h.hid });
  }
  private soltar() {
    if (this.hero) this.hero.sprite!.visible = true;
    this.hero = null;
    this.persistent = false;
    this.sprite?.play('idle');
  }
  private dispararHeroi() {
    const h = this.hero!;
    const a = (this.ang * Math.PI) / 180;
    h.sprite!.visible = true;
    h.setState('normal');
    h.x = this.mouthX + Math.cos(a) * 50; h.y = this.mouthY + 40 + Math.sin(a) * 50; h.b.x = h.x; h.b.y = h.y;
    h.launch(Math.cos(a) * this.forca, Math.sin(a) * this.forca);
    this.hero = null;
    this.persistent = false;
    this.ignore = h;
    this.cd = 0.5;
    this.sprite?.play('disparar', { restart: true, onEnd: () => this.sprite?.play('idle') });
    this.sfx('flor-disparo');
    this.world.spawnFx('fx-folhas', 'folha1', this.mouthX, this.mouthY, { vx: -Math.cos(a) * 120, vy: -120, gravity: 300, life: 1, fade: 0.5, loop: true });
    bus.emit('flor-disparo', { hero: h.hid });
  }

  /** coco arremessado entrou na boca: a flor cospe como canhão */
  engolirCoco(c: CocoLike): boolean {
    if (this.hero || this.coco || this.cd > 0) return false;
    this.coco = c; this.t = 0;
    c.engolir();
    this.sprite?.play('engolir', { restart: true, onEnd: () => this.sprite?.play('mirar') });
    this.sfx('flor-sugar', 0.7);
    return true;
  }

  render(a: number) {
    if (this.sprite) {
      const c = Math.cos((this.ang * Math.PI) / 180);
      const m = c < 0 ? -180 - this.ang : this.ang;
      this.dir = c < 0 ? -1 : 1;
      this.sprite.rot = this.hero || this.coco || this.gira ? (m + 90) * 0.18 : 0;
    }
    super.render(a);
    const show = !!this.hero || this.gira;
    this.mira.style.display = show ? '' : 'none';
    if (show) {
      this.mira.style.opacity = this.hero ? '1' : '0.45';
      this.mira.style.transform = `translate3d(${this.mouthX}px, ${this.mouthY - 7}px, 0) rotate(${this.ang.toFixed(1)}deg) translateX(40px)`;
    }
  }
  destroy() { super.destroy(); this.mira.remove(); }
}

register('flor-catapulta', (w, s) => new FlorCatapulta(w, s));
