/**
 * Voadores: Serrote (drone-motosserra em senoide, não pode ser pisado), Marimbondo-de-Lata
 * (rota autoral: círculo, vaivém ou oito) e Morcego-Lanterna (pendurado no teto, mergulha
 * quando o herói passa embaixo e apaga as luzes próximas).
 */
import { register, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { isSolid } from '../physics';
import { bus } from '../../core/events';
import type { World } from '../world';
import { Enemy } from './base';

/** Serrote {amp?: tiles, freq?: Hz, alcance?: tiles}: patrulha horizontal com senoide vertical. */
class Serrote extends Enemy {
  x0: number; y0: number; amp: number; freq: number; range: number; t = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.flying = true;
    this.x0 = this.x; this.y0 = this.y;
    this.amp = ((s.amp as number) ?? 1.5) * TILE;
    this.freq = (s.freq as number) ?? 0.5;
    this.range = ((s.alcance as number) ?? 4) * TILE;
  }
  init() { this.makeSprite(this.model, 'idle'); this.makeBody(70, 56); }
  think(dt: number) {
    this.t += dt;
    if ((this.x > this.x0 + this.range && this.dir > 0) || (this.x < this.x0 - this.range && this.dir < 0) || isSolid(this.world.grid.atPx(this.x + this.dir * 44, this.y - 28))) this.dir = (this.dir * -1) as 1 | -1;
    this.vx = this.dir * 120;
    const ty = this.y0 + Math.sin(this.t * this.freq * Math.PI * 2) * this.amp;
    this.vy = (ty - this.y) / Math.max(dt, 1e-3);
    this.move(dt);
    this.play('idle');
    this.sfxEvery('serrote-zumbido', 1.2, 0.5);
  }
  // lâminas em cima: pisar machuca
  onStomp(): 'kill' | 'bounce' | 'hurt' { this.sfx('clank', 0.6); return 'hurt'; }
  onHit(h: HitInfo) {
    if (this.dead) return false;
    if (h.kind === 'outro' && h.dmg <= 0) return false;
    if (h.weapon === 'coco' || h.weapon === 'panela') return this.damage(h);
    return super.onHit(h);
  }
  onRecover() { this.setState('idle'); this.y0 = this.y; }
}

/** Marimbondo-de-Lata {rota: 'circulo'|'vaivem'|'oito', raio?: tiles, vel?: rad/s}. Pisável. */
class Marimbondo extends Enemy {
  ox: number; oy: number; raio: number; rota: string; vel: number; t = 0; lastX: number;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.flying = true;
    this.ox = this.x; this.oy = this.y;
    this.raio = ((s.raio as number) ?? 2) * TILE;
    this.rota = (s.rota as string) ?? 'circulo';
    this.vel = (s.vel as number) ?? 1.5;
    this.lastX = this.x;
    this.t = (s.fase as number) ?? 0;
  }
  init() { this.makeSprite(this.model, 'idle'); this.makeBody(56, 50); }
  pathAt(t: number): [number, number] {
    const r = this.raio;
    switch (this.rota) {
      case 'vaivem': return [this.ox + Math.sin(t) * r, this.oy + Math.sin(t * 4) * 8];
      case 'oito': return [this.ox + Math.sin(t) * r, this.oy + Math.sin(t * 2) * r * 0.45];
      default: return [this.ox + Math.cos(t) * r, this.oy + Math.sin(t) * r];
    }
  }
  think(dt: number) {
    this.t += dt * this.vel * (this.rota === 'vaivem' ? 0.8 : 1);
    const [tx, ty] = this.pathAt(this.t);
    this.vx = (tx - this.x) / Math.max(dt, 1e-3); this.vy = (ty - this.y) / Math.max(dt, 1e-3);
    this.move(dt);
    if (Math.abs(this.x - this.lastX) > 0.5) this.dir = this.x > this.lastX ? 1 : -1;
    this.lastX = this.x;
    this.play('idle');
    this.sfxEvery('marimbondo-zumbido', 1.4, 0.45);
  }
  onRecover() {
    // volta para a rota a partir de onde está
    this.setState('idle');
    const [px, py] = this.pathAt(this.t);
    this.ox += this.x - px; this.oy += this.y - py;
  }
  move(dt: number) {
    if (this.stunT > 0) { this.vy = Math.min(this.vy + 900 * dt, 220); }
    super.move(dt);
  }
}

/** Morcego-Lanterna: pendurado no teto; mergulha quando o herói passa embaixo; apaga luzes. */
class Morcego extends Enemy {
  homeX: number; homeY: number;
  tx = 0; ty = 0; cd = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.flying = true;
    this.homeX = this.x; this.homeY = this.y;
  }
  init() {
    this.makeSprite(this.model, 'pendurado'); this.makeBody(54, 52);
    // procura o teto acima do ponto de spawn
    const tx = Math.floor(this.x / TILE);
    for (let ty = Math.floor((this.y - 1) / TILE); ty > Math.floor(this.y / TILE) - 8 && ty >= 0; ty--) {
      if (isSolid(this.world.grid.at(tx, ty))) { this.homeY = (ty + 1) * TILE + this.h; break; }
    }
    this.y = this.homeY; this.body!.y = this.y;
    if (this.spawn.voando) this.setState('mergulho');
    else this.setState('pendurado');
    this.tx = this.x; this.ty = this.y + 4 * TILE;
  }
  think(dt: number) {
    this.cd -= dt;
    if (this.state === 'pendurado') {
      this.vx = 0; this.vy = 0;
      this.play('pendurado');
      const dx = this.heroDx(), dy = this.heroDy();
      if (this.cd <= 0 && !this.heroHidden && Math.abs(dx) < 110 && dy > 0 && dy < 9 * TILE) {
        this.setState('mergulho');
        this.tx = this.hero.x; this.ty = this.hero.y - this.hero.h * 0.5;
        this.sfx('morcego-guincho');
      }
      return;
    }
    if (this.state === 'mergulho') {
      if (this.st < 0.05 && this.spawn.voando) { this.tx = this.hero.x; this.ty = this.hero.y - this.hero.h * 0.5; }
      const dx = this.tx - this.x, dy = this.ty - this.y, d = Math.hypot(dx, dy);
      const sp = 520;
      this.vx = (dx / (d || 1)) * sp; this.vy = (dy / (d || 1)) * sp;
      this.dir = dx < 0 ? -1 : 1;
      this.play('mergulho');
      this.douseLights();
      this.move(dt);
      if (d < 20 || this.st > 1.3 || isSolid(this.world.grid.atPx(this.x, this.y + 4))) { this.setState('subir'); this.vx = this.dir * 160; }
      return;
    }
    // subir: arco de volta ao poleiro
    const dx = this.homeX - this.x, dy = this.homeY - this.y, d = Math.hypot(dx, dy);
    this.vx = (dx / (d || 1)) * 260 + Math.sin(this.st * 6) * 60; this.vy = (dy / (d || 1)) * 260;
    if (Math.abs(dx) > 4) this.dir = dx < 0 ? -1 : 1;
    this.play('idle');
    this.move(dt);
    if (d < 12) { this.x = this.homeX; this.y = this.homeY; this.setState('pendurado'); this.cd = 1.2; }
  }
  /** apaga luzes extras do mundo perto do mergulho e avisa lamparinas/fogueiras */
  douseLights() {
    const r = 200;
    const L = this.world.lights;
    for (let i = L.length - 1; i >= 0; i--) {
      if (Math.hypot(L[i].x - this.x, L[i].y - this.y) < r) { L.splice(i, 1); this.sfx('morcego-guincho', 0.6); }
    }
    if (Math.floor(this.st * 6) !== Math.floor((this.st - 1 / 60) * 6)) bus.emit('apagar-luz', { x: this.x, y: this.y, r });
  }
  onHit(h: HitInfo) {
    if (this.dead) return false;
    // a luz da lamparina espanta: foge para o poleiro e demora a voltar (arremessada, ainda machuca)
    if (h.weapon === 'lamparina' && h.kind !== 'arremesso') { this.setState('subir'); this.cd = 4; this.vx = Math.sign(this.x - h.x || 1) * 300; this.sfx('morcego-guincho'); this.sprite?.flash(0.06); return true; }
    return super.onHit(h);
  }
  onRecover() { this.setState('subir'); }
  move(dt: number) {
    if (this.stunT > 0) this.vy = Math.min(this.vy + 900 * dt, 240);
    super.move(dt);
  }
  light() { return this.state === 'pendurado' ? { x: this.x, y: this.y - 10, r: 46, flicker: 0.1 } : null; }
}

register('serrote', (w, s) => new Serrote(w, s));
register('marimbondo', (w, s) => new Marimbondo(w, s));
register('morcego', (w, s) => new Morcego(w, s));
