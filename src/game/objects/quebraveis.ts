/**
 * Obstáculos quebráveis e de cenário: Parede Rachada, Terra Mole (só o tatu cava), Bloco de Madeira (cupins),
 * Teia (a lamparina queima), Fogueira (acende/reacende a lamparina) e Painel de Máquina (a Chave Inglesa desliga).
 */
import { Entity, register, type HitInfo } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { T, type Solid } from '../physics';
import { bus } from '../../core/events';
import { WEAPONS } from '../weapons/types';
import { faroFilter, jitter } from '../pickups/common';

const VARIANTE: Record<string, string> = { mata: 'mata', gruta: 'gruta', recife: 'recife', fabrica: 'fabrica', cristal: 'gruta', copa: 'mata' };

/** Base: um bloco sólido com sprite que some ao ser destruído. */
abstract class Bloco extends Entity {
  broken = false;
  protected sol: Solid;
  constructor(w: World, s: EntitySpawn, bw: number, bh: number) {
    super(w, s);
    this.w = bw; this.h = bh; this.team = 'neutral'; this.z = 22;
    this.sol = w.addSolid({ x: this.x - bw / 2, y: this.y - bh, w: bw, h: bh, owner: this });
    this.solid = this.sol;
    this.tag = s.tag as string | undefined;
  }
  update(dt: number) {
    this.sprite?.update(dt);
    if (this.broken && (!this.sprite?.entry || this.sprite.ended)) this.kill();
  }
  protected abrir(anim: string, once = true) {
    if (this.broken) return false;
    this.broken = true;
    this.world.removeSolid(this.sol);
    this.solid = undefined;
    if (once) this.world.collect(this);
    this.sprite?.play(anim, { restart: true });
    return true;
  }
  destroy() { this.sprite?.destroy(); this.world.removeSolid(this.sol); }
}

/* ------------------------------------------------------------------ */
export class ParedeRachada extends Bloco {
  private off?: () => void;
  constructor(w: World, s: EntitySpawn) { super(w, s, TILE, TILE * 3); }
  init() {
    const v = String(this.spawn.variante ?? VARIANTE[this.world.level.tileset] ?? 'mata');
    this.makeSprite('parede-rachada', 'idle', { variant: v });
    this.off = bus.on('pound', (d: { x: number; y: number }) => { if (Math.abs(d.x - this.x) < TILE * 3.5 && Math.abs(d.y - this.y) < TILE * 1.5) this.quebrar('batida'); });
  }
  onHit(h: HitInfo): boolean {
    if (this.broken) return false;
    const def = h.weapon ? WEAPONS[h.weapon] : undefined;
    const forte = h.weapon === 'cabaca-pedra' || h.weapon === 'chave' || h.kind === 'explosao' || (h.kind === 'arma' && !!h.heavy && def?.peso === 'pesado') || (h.kind === 'montaria' && !!h.heavy);
    if (forte) { this.quebrar(h.weapon ?? h.kind); return true; }
    if (h.kind === 'arma' || h.kind === 'arremesso') {
      this.sfx('golpe-acerto', 0.5);
      this.world.text('TOC', h.x + (this.x - h.x) * 0.7, this.y - this.h * 0.6, 'small');
      if (this.sprite) { this.sprite.sx = 1.04; }
      return true;
    }
    return false;
  }
  quebrar(por: string) {
    if (!this.abrir('quebrar')) return;
    this.sfx('pedra-quebrar');
    this.world.shake(6, 220);
    for (let k = 0; k < 3; k++) this.world.spawnFx('fx-lascas', 'pedra', this.x + (k - 1) * 12, this.y - this.h * (0.2 + k * 0.3), { scale: jitter(1.1) });
    this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 1.6 });
    for (const e of this.world.entities) {
      if (e.dead || e.spawn.t !== 'porta-bonus' || Math.abs(e.x - this.x) > TILE * 2.5 || Math.abs(e.y - this.y) > TILE * 2) continue;
      (e as unknown as { revelar?: () => void }).revelar?.();
    }
    bus.emit('secret', { kind: 'parede', por });
  }
  render(a: number) {
    if (this.sprite) {
      this.sprite.sx += (1 - this.sprite.sx) * 0.3;
      this.sprite.extraFilter = this.broken ? '' : faroFilter(this);
    }
    super.render(a);
  }
  destroy() { super.destroy(); this.off?.(); }
}

/* ------------------------------------------------------------------ */
export class TerraMole extends Bloco {
  private off?: () => void;
  private avisoT = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s, TILE * Number(s.w ?? 1), TILE * Number(s.h ?? 1)); }
  init() {
    this.makeSprite('terra-mole', 'idle');
    if (this.sprite) { this.sprite.sx = this.w / 70; this.sprite.sy = this.h / 41; }
    this.off = bus.on('tatu-cavar', (d: { x: number; y: number; r?: number }) => { if (Math.hypot(d.x - this.x, d.y - (this.y - this.h / 2)) < (d.r ?? 110) + this.w / 2) this.cavar(); });
  }
  cavar() {
    if (!this.abrir('cavar')) return;
    this.sfx('passo-terra');
    this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 1.3 });
    bus.emit('terra-cavada', { x: this.x, y: this.y });
  }
  onHit(h: HitInfo): boolean {
    if (this.broken) return false;
    if (h.source?.spawn.t === 'tatu' || h.weapon === 'tatu') { this.cavar(); return true; }
    if ((h.kind === 'arma' || h.kind === 'arremesso') && this.world.time > this.avisoT) {
      this.avisoT = this.world.time + 2;
      this.world.text('Só o tatu cava!', this.x, this.y - this.h - 10, 'small');
      return true;
    }
    return false;
  }
  update(dt: number) {
    super.update(dt);
    // o tatu cavando encosta e abre caminho
    if (!this.broken) {
      const tatu = this.world.find((e) => e.spawn.t === 'tatu' && !e.dead && Math.abs(e.x - this.x) < this.w / 2 + 60 && Math.abs(e.y - this.y) < this.h + 20 && e.sprite?.animName === 'cavar');
      if (tatu) this.cavar();
    }
  }
  destroy() { super.destroy(); this.off?.(); }
}

/* ------------------------------------------------------------------ */
export class BlocoMadeira extends Bloco {
  constructor(w: World, s: EntitySpawn) { super(w, s, TILE * Number(s.w ?? 1), TILE * Number(s.h ?? 1)); }
  init() { this.makeSprite('bloco-madeira', 'idle'); if (this.sprite) { this.sprite.sx = this.w / 75; this.sprite.sy = this.h / 74; } }
  comer() {
    if (!this.abrir('comido')) return;
    this.sfx('madeira-quebrar');
    this.sfx('cupins', 0.6);
    this.world.spawnFx('fx-lascas', 'madeira', this.x, this.y - this.h / 2);
    bus.emit('madeira-comida', { x: this.x, y: this.y });
  }
}

/* ------------------------------------------------------------------ */
export class Teia extends Bloco {
  constructor(w: World, s: EntitySpawn) { super(w, s, TILE * Number(s.w ?? 1), TILE * Number(s.h ?? 2)); }
  init() { this.makeSprite('teia', 'idle'); }
  queimar() {
    if (!this.abrir('queimar', false)) return;
    this.sfx('teia-queimar');
    this.sfx('fogo', 0.6);
    this.world.spawnFx('fx-explosao', 'pequena', this.x, this.y - this.h * 0.4, { scale: 0.8 });
    this.world.text('FSSS!', this.x, this.y - this.h, 'small');
    bus.emit('teia-queimada', { x: this.x, y: this.y });
  }
  onHit(h: HitInfo): boolean {
    if (this.broken) return false;
    if (h.weapon === 'lamparina') { this.queimar(); return true; }
    if (h.kind === 'arma') { this.world.text('GRUDA…', this.x, this.y - this.h, 'small'); return true; }
    return false;
  }
}

/* ------------------------------------------------------------------ */
export class Fogueira extends Entity {
  acesa: boolean;
  private crepita = 0;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.acesa = !!s.acesa; this.w = 90; this.h = 80; this.team = 'neutral'; this.z = 20; }
  init() { this.makeSprite('fogueira', this.acesa ? 'acesa' : 'apagada', { shadow: true }); }
  acender() {
    if (this.acesa) return;
    this.acesa = true;
    this.sprite?.play('acesa');
    this.sfx('lamparina-acender');
    this.sfx('fogo', 0.7);
    this.world.spawnFx('fx-explosao', 'pequena', this.x, this.y - 30, { scale: 0.7 });
    bus.emit('fogueira-acesa', { x: this.x, tag: this.tag });
  }
  onHit(h: HitInfo) { if (h.weapon === 'lamparina') { this.acender(); return true; } return false; }
  update(dt: number) {
    this.sprite?.update(dt);
    const L = this.world.duo.leader;
    const perto = Math.abs(L.x - this.x) < 120 && Math.abs(L.y - this.y) < 100;
    if (!this.acesa && perto && L.held?.def.id === 'lamparina') this.acender();
    if (this.acesa) {
      this.crepita -= dt;
      if (this.crepita <= 0) { this.crepita = 2.6; this.sfx('fogo', 0.25); }
    }
  }
  light() { return this.acesa ? { x: this.x, y: this.y - 50, r: 300, flicker: 0.08 } : null; }
}

/* ------------------------------------------------------------------ */
export class PainelMaquina extends Entity {
  alvo: string;
  ligado = true;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.alvo = String(s.alvo ?? ''); this.w = 90; this.h = 130; this.team = 'neutral'; this.z = 18; this.tag = s.tag as string | undefined; }
  init() { this.makeSprite('painel-maquina', 'ligado', { shadow: true }); }
  update(dt: number) { this.sprite?.update(dt); }
  onHit(h: HitInfo): boolean {
    if (!this.ligado) return false;
    if (h.weapon === 'chave' || h.weapon === 'estilingue') { this.desligar(); return true; }
    if (h.kind === 'arma' || h.kind === 'arremesso') { this.sfx('golpe-acerto', 0.5); this.world.text('Precisa de ferramenta!', this.x, this.y - this.h - 10, 'small'); return true; }
    return false;
  }
  desligar() {
    if (!this.ligado) return;
    this.ligado = false;
    this.sprite?.play('desligado');
    this.sfx('painel-desligar');
    this.world.text('CLUNK!', this.x, this.y - this.h);
    this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y - this.h * 0.6);
    // máquinas com a tag do alvo
    for (const e of this.world.entities) {
      if (e.dead || !this.alvo || e.tag !== this.alvo) continue;
      const m = e as unknown as { desligar?: () => void; desligado?: boolean };
      if (m.desligar) m.desligar(); else m.desligado = true;
    }
    // esteiras: colunas [x0, x1] (tiles) param `esteiras`
    const est = this.spawn.esteiras as [number, number] | undefined;
    if (est) {
      const g = this.world.grid;
      for (let x = Math.floor(est[0]); x <= Math.floor(est[1]); x++) for (let y = 0; y < g.h; y++) {
        const t = g.at(x, y);
        if (t === T.BELT_L || t === T.BELT_R) g.set(x, y, T.SOLID);
      }
    }
    bus.emit('painel-desligado', { alvo: this.alvo });
    bus.emit('maquina-desligada', { alvo: this.alvo });
  }
}

register('parede-rachada', (w, s) => new ParedeRachada(w, s));
register('terra-mole', (w, s) => new TerraMole(w, s));
register('bloco-madeira', (w, s) => new BlocoMadeira(w, s));
register('teia', (w, s) => new Teia(w, s));
register('fogueira', (w, s) => new Fogueira(w, s));
register('painel-maquina', (w, s) => new PainelMaquina(w, s));
