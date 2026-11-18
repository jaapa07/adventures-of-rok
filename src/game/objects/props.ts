/**
 * Props interativos usados pelas gags: placa de trilho, garrafa de café, relógio de ponto, celular da selfie
 * e gaiola do parceiro. Eles só animam e avisam pelo bus; quem roteiriza a cena é a gag.
 *  'placa-trilho' {tag, estado}   'cafe-trocado' {tag, x}   'ponto-tocou' {tag, x}   'celular-pego' {tag, level}
 *  'gaiola-hit' {tag}
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import type { Hero } from '../hero';
import { Sprite } from '../../render/sprite';
import { bus } from '../../core/events';
import { current } from '../session';
import { heroTouching } from '../pickups/common';

abstract class Prop extends Entity {
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'neutral'; this.tag = s.tag as string | undefined; this.z = 20; }
  update(dt: number) { this.sprite?.update(dt); }
}

/* ------------------------------------------------------------------ */
export class PlacaTrilho extends Prop {
  estado: 'esquerda' | 'direita';
  private cd = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.estado = s.estado === 'direita' ? 'direita' : 'esquerda'; this.w = 70; this.h = 120; }
  init() { this.makeSprite('placa-trilho', this.estado, { shadow: true }); }
  trocar() {
    if (this.cd > 0) return;
    this.cd = 0.4;
    this.estado = this.estado === 'esquerda' ? 'direita' : 'esquerda';
    this.sprite?.play(this.estado);
    this.sfx('carrinho-trilho', 0.7);
    this.world.text('CLAC!', this.x, this.y - this.h, 'small');
    bus.emit('placa-trilho', { tag: this.tag, estado: this.estado });
  }
  onInteract() { this.trocar(); return true; }
  onHit(h: HitInfo) { if (h.kind === 'arma' || h.kind === 'arremesso') { this.trocar(); return true; } return false; }
  update(dt: number) { super.update(dt); if (this.cd > 0) this.cd -= dt; }
}

/* ------------------------------------------------------------------ */
export class GarrafaCafe extends Prop {
  trocado = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 50; this.h = 80; }
  init() { this.makeSprite('garrafa-cafe', 'idle', { shadow: true }); }
  onInteract(h: Entity) {
    if (this.trocado) return false;
    const hero = h as Hero;
    this.trocado = true;
    const comJaca = hero.held?.def.id === 'jaca';
    if (comJaca) hero.dropHeld();
    this.sprite?.play('trocar', { restart: true });
    this.sfx('arma-pegar');
    this.world.text('SUCO DE JACA!', this.x, this.y - this.h - 10, 'small');
    bus.emit('cafe-trocado', { tag: this.tag, x: this.x, jaca: comJaca });
    return true;
  }
}

/* ------------------------------------------------------------------ */
export class RelogioPonto extends Prop {
  private cd = 0;
  private tic = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 70; this.h = 140; }
  init() { this.makeSprite('relogio-ponto', 'idle', { shadow: true }); }
  tocar() {
    if (this.cd > 0) return false;
    this.cd = Number(this.spawn.recarga ?? 12);
    this.sprite?.play('tocar', { restart: true, onEnd: () => this.sprite?.play('idle') });
    this.sfx('relogio-tic');
    this.world.text('TRRRIIIM!', this.x, this.y - this.h - 10);
    this.world.shake(2, 300);
    bus.emit('ponto-tocou', { tag: this.tag, x: this.x });
    return true;
  }
  onInteract() { return this.tocar(); }
  onHit(h: HitInfo) { if (h.kind === 'arma' || h.kind === 'arremesso') return this.tocar(); return false; }
  update(dt: number) {
    super.update(dt);
    if (this.cd > 0) this.cd -= dt;
    this.tic -= dt;
    const L = this.world.duo.leader;
    if (this.tic <= 0 && Math.abs(L.x - this.x) < 500) { this.tic = 1; this.sfx('relogio-tic', 0.15); }
  }
}

/* ------------------------------------------------------------------ */
export class Celular extends Prop {
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 50; this.h = 30; this.team = 'pickup'; }
  init() { this.makeSprite('celular', 'idle'); }
  update(dt: number) {
    super.update(dt);
    if (heroTouching(this, 6)) {
      const ses = current.session;
      if (ses) ses.foto = true;
      this.world.collect(this);
      this.sfx('ficha');
      this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - 20, { z: 70 });
      this.world.text('FOTO PARA O ÁLBUM!', this.x, this.y - 60, 'small');
      this.world.toast('Foto engraçada guardada no Álbum da Selva!', 'foto');
      bus.emit('celular-pego', { tag: this.tag, level: this.world.level.id });
      bus.emit('foto', { level: this.world.level.id });
      this.kill();
    }
  }
  render(a: number) { if (this.sprite) this.sprite.extraFilter = `drop-shadow(0 0 ${6 + 4 * Math.sin(this.world.time * 5)}px rgba(160,220,255,0.9))`; super.render(a); }
}

/* ------------------------------------------------------------------ */
/** Gaiola com o parceiro preso dentro (desenhado por cima, animação 'preso'). */
export class Gaiola extends Prop {
  private dentro?: Sprite;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 120; this.h = 150; this.z = Number(s.z ?? 20); }
  init() {
    const quem = String(this.spawn.heroi ?? (this.world.duo.leader.hid === 'tama' ? 'lili' : 'tama'));
    this.dentro = new Sprite(quem, this.world.preset, 'base', this.world.stage.entities);
    this.dentro.play('preso');
    this.makeSprite('gaiola', 'idle', { shadow: true });
  }
  onHit(h: HitInfo) { if (h.kind === 'arma' || h.kind === 'arremesso') { this.sfx('golpe-acerto', 0.6); bus.emit('gaiola-hit', { tag: this.tag }); return true; } return false; }
  update(dt: number) { super.update(dt); this.dentro?.update(dt); }
  render(a: number) {
    if (this.dentro) {
      this.dentro.x = this.x; this.dentro.y = this.y - 8; this.dentro.z = this.z - 1;
      this.dentro.flip = this.dir < 0;
      this.dentro.visible = this.spawn.heroi !== undefined || this.world.partnerLost || !!this.spawn.sempre;
      this.dentro.render();
    }
    super.render(a);
  }
  destroy() { super.destroy(); this.dentro?.destroy(); }
}

register('placa-trilho', (w, s) => new PlacaTrilho(w, s));
register('garrafa-cafe', (w, s) => new GarrafaCafe(w, s));
register('relogio-ponto', (w, s) => new RelogioPonto(w, s));
register('celular', (w, s) => new Celular(w, s));
register('gaiola', (w, s) => new Gaiola(w, s));
