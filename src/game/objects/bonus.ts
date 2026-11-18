/**
 * Controles das salas bônus "Câmara de Cristal" (seção 8.4). O World não cria nada sozinho: cada sala
 * coloca o seu controle na lista de entidades.
 *  - `coletar-controle`: quando não resta castanha, revela o balão-prêmio ({premio: true}) ou entrega o prêmio.
 *  - `chuva-controle` {ondas: number[][]}: castanhas caem em ondas autorais (colunas em tiles); no fim do tempo completa.
 *  - `achar-controle` {itens?: string[], trocas?: [a,b][]}: mostra o prêmio, embaralha as cabaças, a dupla escolhe.
 *  - `catapulta-premio` {premio?}: prêmio no fim da sequência de flores-catapulta.
 * O prêmio da sala (LevelDef.bonus.premio, ex. 'vida:1') é entregue ao completar.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Hero } from '../hero';
import { Sprite } from '../../render/sprite';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { grantPrize, prizeVisual, heroTouching } from '../pickups/common';
import type { Balao } from '../pickups/coletaveis';
import { ensureObjectCss } from './css';

/** Base: conclui a sala com fanfarra, entrega o prêmio e chama world.complete() após uma pausa. */
abstract class Controle extends Entity {
  protected endT = -1;
  protected outcome: 'ok' | 'falhou' = 'ok';
  constructor(w: World, s: EntitySpawn) { super(w, s); this.persistent = true; this.team = 'neutral'; this.w = 10; this.h = 10; }
  get premio(): string { return String(this.spawn.premio ?? this.world.level.bonus?.premio ?? ''); }
  protected concluir(premio = this.premio) {
    if (this.endT >= 0) return;
    this.endT = 1.5; this.outcome = 'ok';
    // trava o cronômetro da sala enquanto a fanfarra toca
    this.world.finished = true;
    if (premio && premio !== 'castanhas:0') grantPrize(this.world, premio);
    const L = this.world.duo.leader;
    this.world.sfx('letras-completas');
    this.world.text('SALA COMPLETA!', L.x, L.y - L.h - 40);
    this.world.duo.celebrate();
    bus.emit('bonus-ok', { id: this.world.level.id, premio });
  }
  protected falhar(msg = 'QUE PENA!') {
    if (this.endT >= 0) return;
    this.endT = 1.6; this.outcome = 'falhou';
    this.world.finished = true;
    const L = this.world.duo.leader;
    this.world.sfx('ui-erro');
    this.world.text(msg, L.x, L.y - L.h - 40);
  }
  /** chame no início do update; retorna true se a sala está encerrando */
  protected encerrando(dt: number) {
    if (this.endT < 0) return false;
    this.endT -= dt;
    if (this.endT <= 0) {
      this.endT = Infinity;
      this.world.finished = false;
      if (this.outcome === 'ok') this.world.complete();
      else { this.world.finished = true; this.world.hooks.onExitBonus?.(false); }
    }
    return true;
  }
}

/* ------------------------------------------------------------------ */
export class ColetarControle extends Controle {
  private visto = 0;
  private aguardandoBalao = false;
  private t = 0;
  update(dt: number) {
    if (this.encerrando(dt)) return;
    if (this.aguardandoBalao) return;
    this.t += dt;
    let n = 0;
    for (const e of this.world.entities) if (!e.dead && (e.spawn.t === 'castanha' || e.spawn.t === 'cacho')) n++;
    this.visto = Math.max(this.visto, n);
    // (ao reentrar na sala, castanhas já pegas nesta tentativa não voltam)
    if ((this.visto > 0 || this.t > 0.5) && n === 0) {
      const baloes = this.world.entities.filter((e) => !e.dead && e.spawn.t === 'balao' && e.spawn.premio) as Balao[];
      if (baloes.length) {
        this.aguardandoBalao = true;
        const L = this.world.duo.leader;
        this.world.text('PEGUE O PRÊMIO!', L.x, L.y - L.h - 40);
        for (const b of baloes) { b.onPremio = () => this.concluir(); b.reveal(); }
      } else this.concluir();
    }
  }
}

/* ------------------------------------------------------------------ */
export class ChuvaControle extends Controle {
  private ondas: number[][];
  private feitas = 0;
  private tempo: number;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.ondas = Array.isArray(s.ondas) ? (s.ondas as number[][]) : [];
    this.tempo = w.level.bonus?.tempo ?? 15;
  }
  update(dt: number) {
    if (this.encerrando(dt)) return;
    const t = this.world.time;
    const n = this.ondas.length;
    const passo = n ? (this.tempo - 3.5) / n : 1;
    while (this.feitas < n && t >= 1 + this.feitas * passo) {
      for (const x of this.ondas[this.feitas]) {
        this.world.spawn({ t: 'castanha', x, y: this.spawn.y + this.feitas * 0.26, vx: 0, vy: 40, chuva: this.feitas });
        this.world.spawnFx('fx-brilho', 'castanha', x * TILE, this.spawn.y * TILE, { scale: 0.6, z: 70 });
      }
      this.world.sfx('castanha', this.x, 0.5);
      this.feitas++;
    }
    if (t >= this.tempo - 1) this.concluir();
  }
}

/* ------------------------------------------------------------------ */
const TROCAS: [number, number][] = [[0, 1], [1, 2], [0, 2], [1, 0], [2, 1], [0, 1], [1, 2]];
export class AcharControle extends Controle {
  private itens: string[];
  private trocas: [number, number][];
  private vel: number;
  private cab: { s: Sprite; slot: number; item: string; x: number; y: number }[] = [];
  private fase: 'mostrar' | 'embaralhar' | 'escolher' | 'revelar' = 'mostrar';
  private t = 0;
  private troca = 0;
  private premioSprite?: Sprite;
  private rotulo?: HTMLDivElement;
  private slots: number[] = [];
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.itens = Array.isArray(s.itens) && s.itens.length ? (s.itens as string[]) : ['premio', 'vazio', 'vazio'];
    this.trocas = Array.isArray(s.trocas) ? (s.trocas as [number, number][]) : TROCAS;
    this.vel = Number(s.vel ?? 0.42);
    this.w = this.itens.length * 3 * TILE; this.h = 100;
  }
  init() {
    const n = this.itens.length;
    const gap = 3 * TILE;
    for (let i = 0; i < n; i++) this.slots.push(this.x + (i - (n - 1) / 2) * gap);
    this.itens.forEach((item, i) => {
      const s = new Sprite('cabaca', this.world.preset, 'base', this.world.stage.entities, { shadow: true });
      s.play('idle');
      this.cab.push({ s, slot: i, item, x: this.slots[i], y: this.y });
    });
    const pi = Math.max(0, this.itens.indexOf('premio'));
    const v = prizeVisual(this.premio || 'castanhas:10');
    this.premioSprite = new Sprite(v.model, this.world.preset, v.variant ?? 'base', this.world.stage.entities);
    this.premioSprite.play(v.anim);
    this.premioSprite.x = this.slots[pi]; this.premioSprite.y = this.y - 170; this.premioSprite.z = 60;
    ensureObjectCss();
    this.rotulo = document.createElement('div');
    this.rotulo.className = 'achar-premio';
    this.rotulo.textContent = v.label;
    this.rotulo.style.transform = `translate3d(${this.slots[pi]}px, ${this.y - 250}px, 0) translateX(-50%)`;
    this.world.stage.chunksFront.append(this.rotulo);
    this.world.text('OLHE BEM ONDE ESTÁ O PRÊMIO!', this.x, this.y - 260, 'small');
  }
  update(dt: number) {
    for (const c of this.cab) c.s.update(dt);
    this.premioSprite?.update(dt);
    if (this.encerrando(dt)) return;
    this.t += dt;
    if (this.fase === 'mostrar') {
      const ps = this.premioSprite!;
      if (this.t > 1.6) ps.y = Math.min(this.y - 40, ps.y + 260 * dt);
      if (this.t > 2.4) { ps.visible = false; this.rotulo?.remove(); this.fase = 'embaralhar'; this.t = 0; this.sfx('cabaca-rolar'); }
      return;
    }
    if (this.fase === 'embaralhar') {
      const [a, b] = this.trocas[this.troca % this.trocas.length];
      const k = Math.min(1, this.t / this.vel);
      const ca = this.cab.find((c) => c.slot === a)!, cb = this.cab.find((c) => c.slot === b)!;
      const xa = this.slots[a], xb = this.slots[b];
      const e = k * k * (3 - 2 * k);
      ca.x = xa + (xb - xa) * e; ca.y = this.y - Math.sin(Math.PI * k) * 70;
      cb.x = xb + (xa - xb) * e; cb.y = this.y + Math.sin(Math.PI * k) * 6;
      ca.s.play('rolar'); cb.s.play('rolar');
      if (k >= 1) {
        ca.slot = b; cb.slot = a; ca.y = cb.y = this.y;
        ca.s.play('idle'); cb.s.play('idle');
        this.troca++; this.t = 0;
        this.sfx('cabaca-rolar', 0.5);
        if (this.troca >= this.trocas.length) { this.fase = 'escolher'; this.world.text('QUAL DELAS?', this.x, this.y - 220); }
      }
      return;
    }
    if (this.fase === 'escolher') {
      const L = this.world.duo.leader;
      // pulo em cima também escolhe
      if (L.b.vy > 60) for (const c of this.cab) if (Math.abs(L.x - c.x) < 46 && L.y >= c.y - 76 && L.y <= c.y - 30) { L.bounce(560); this.escolher(c); return; }
      if (input.pressed('down')) { const c = this.maisPerto(L); if (c) this.escolher(c); }
    }
  }
  private maisPerto(h: Hero) {
    let best: (typeof this.cab)[number] | null = null, bd = 70;
    for (const c of this.cab) { const d = Math.abs(c.x - h.x); if (d < bd) { bd = d; best = c; } }
    return best;
  }
  onInteract(h: Entity) {
    if (this.fase !== 'escolher' || this.endT >= 0) return false;
    const c = this.maisPerto(h as Hero);
    if (!c) return false;
    this.escolher(c);
    return true;
  }
  private escolher(c: (typeof this.cab)[number]) {
    this.fase = 'revelar';
    for (const o of this.cab) {
      o.s.play('quebrar', { restart: true });
      const v = o.item === 'premio' ? prizeVisual(this.premio || 'castanhas:10') : o.item === 'vazio' ? null : prizeVisual(o.item);
      if (v) this.world.spawnFx(v.model, v.anim, o.x, o.y - 40, { vy: -60, life: 1.5, fade: 0.4, loop: true, z: 60, scale: o === c ? 1.3 : 0.8 });
    }
    this.sfx('cabaca-quebrar');
    this.world.spawnFx('fx-lascas', 'cabaca', c.x, c.y - 30);
    if (c.item === 'premio') this.concluir();
    else if (c.item !== 'vazio') { grantPrize(this.world, c.item); this.falhar('QUASE!'); }
    else this.falhar('VAZIA!');
  }
  destroy() { super.destroy(); for (const c of this.cab) c.s.destroy(); this.premioSprite?.destroy(); this.rotulo?.remove(); }
  render() {
    for (const c of this.cab) { c.s.x = c.x; c.s.y = c.y; c.s.z = 30; c.s.groundY = this.y; c.s.render(); }
    this.premioSprite?.render();
  }
}

/* ------------------------------------------------------------------ */
export class CatapultaPremio extends Controle {
  private s?: Sprite;
  private pego = false;
  constructor(w: World, s: EntitySpawn) { super(w, s); this.w = 90; this.h = 90; }
  init() {
    const v = prizeVisual(this.premio || 'castanhas:10');
    this.s = new Sprite(v.model, this.world.preset, v.variant ?? 'base', this.world.stage.entities);
    this.s.play(v.anim);
    this.s.sx = this.s.sy = 1.4;
  }
  update(dt: number) {
    this.s?.update(dt);
    if (this.encerrando(dt)) return;
    if (Math.floor(this.world.time * 2) !== Math.floor((this.world.time - dt) * 2)) this.world.spawnFx('fx-brilho', 'castanha', this.x, this.y - 40, { scale: 0.8, z: 70 });
    // raio generoso: o prêmio é pego de raspão no voo da última flor
    if (!this.pego && heroTouching(this, 34)) {
      this.pego = true;
      if (this.s) this.s.visible = false;
      this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - 40, { scale: 1.8, z: 70 });
      this.concluir();
    }
  }
  render() { if (this.s) { this.s.x = this.x; this.s.y = this.y + Math.sin(this.world.time * 3) * 6; this.s.z = 50; this.s.render(); } }
  destroy() { super.destroy(); this.s?.destroy(); }
}

register('coletar-controle', (w, s) => new ColetarControle(w, s));
register('chuva-controle', (w, s) => new ChuvaControle(w, s));
register('achar-controle', (w, s) => new AcharControle(w, s));
register('catapulta-premio', (w, s) => new CatapultaPremio(w, s));
