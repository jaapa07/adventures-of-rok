/**
 * Entidade genérica `arremessado` {id, dir, modo, forca}: tudo o que o herói (ou um inimigo, com `inimigo: true`)
 * arremessa. Voa com a animação 'voando', sofre gravidade, acerta inimigos (kind 'arremesso') e reage
 * conforme a arma: cabaça rola, pedra quebra parede rachada e afunda, coco quica 3 vezes, galho volta
 * como bumerangue torto, jaca vira poça, cupinzeiro vira nuvem, lamparina acende fogueiras, remo vira prancha…
 * Também o tiro do estilingue (`tiro-estilingue`).
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import type { Hero } from '../hero';
import { T, isSolid } from '../physics';
import { WEAPONS, type WeaponDef, type ThrowMode } from './types';
import { bus } from '../../core/events';
import { giveHelmet, stun } from './efeitos';
import { jitter } from '../pickups/common';

type Fase = 'voo' | 'rolar' | 'volta' | 'preso' | 'canhao' | 'engolido' | 'lancada' | 'afundar';

const LASCAS: Record<string, string> = { cabaca: 'cabaca', 'cabaca-pedra': 'pedra', jaca: 'cabaca', coco: 'cabaca', galho: 'madeira', remo: 'madeira', vassoura: 'madeira', cupinzeiro: 'pedra', panela: 'pedra', estilingue: 'madeira', bromelia: 'cabaca' };

let galhosPresos = 0;

export class Thrown extends Entity {
  wid: string;
  def: WeaponDef;
  modo: ThrowMode;
  forca: number;
  usos = 1;
  fase: Fase = 'voo';
  t = 0;
  bounces = 0;
  hits = 0;
  inimigo: boolean;
  thrower: Hero | null = null;
  private hitCd = new Map<number, number>();
  private rollSfx = 0;
  private lastVy = 0;
  private gravK = 1;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.wid = String(s.id ?? 'galho');
    this.def = WEAPONS[this.wid] ?? WEAPONS.galho;
    this.modo = (s.modo as ThrowMode) ?? 'frente';
    this.forca = Number(s.forca ?? 1);
    this.inimigo = !!s.inimigo;
    this.team = this.inimigo ? 'projectile' : 'hero';
    this.persistent = true;
    this.z = 45;
    if (typeof s.usos === 'number') this.usos = s.usos;
  }

  init() {
    const carregavel = this.def.pega === 'cabeca';
    this.makeSprite(this.def.model, carregavel ? (this.wid === 'bromelia' ? 'idle' : 'rolar') : 'voando', { shadow: true });
    this.makeBody(carregavel ? 50 : 36, carregavel ? 50 : 32);
    if (!this.inimigo) this.thrower = this.world.duo.leader;
    const lili = this.thrower?.hid === 'lili' && carregavel ? 1.2 : 1;
    const k = this.forca * lili;
    const base = this.def.peso === 'pesado' ? 560 : this.def.peso === 'medio' ? 680 : 780;
    if (this.modo === 'cima') { this.vx = this.wid === 'panela' ? -this.dir * 32 : this.dir * 130; this.vy = -1150 * Math.sqrt(k); }
    else if (this.modo === 'baixo') { this.vx = this.dir * 60; this.vy = 320; }
    else { this.vx = this.dir * base * k; this.vy = carregavel ? -380 : -240; }
    if (typeof this.spawn.vx === 'number') this.vx = this.spawn.vx as number;
    if (typeof this.spawn.vy === 'number') this.vy = this.spawn.vy as number;
    if (this.wid === 'galho' && this.modo === 'frente') { this.fase = 'volta'; this.sfx('galho-bumerangue'); }
    this.gravK = this.wid === 'remo' ? 0.4 : this.wid === 'chave' ? 0.3 : this.wid === 'coco' ? 0.9 : 1;
  }

  /* ------------------------------------------------------------------ */
  update(dt: number) {
    this.t += dt;
    this.sprite?.update(dt);
    if (this.t > 9 || this.y > this.world.grid.pxH + 200) { this.kill(); return; }
    switch (this.fase) {
      case 'engolido': return; // dentro da flor-catapulta
      case 'volta': this.updateBumerangue(dt); return;
      case 'preso': this.updatePreso(dt); return;
      case 'afundar': this.updateAfundar(dt); return;
      case 'rolar': this.updateRolar(dt); return;
      default: this.updateVoo(dt);
    }
  }

  private updateVoo(dt: number) {
    const b = this.body!;
    const g = this.fase === 'canhao' && this.t < 1 ? 0 : 2000 * this.gravK;
    this.lastVy = this.vy;
    this.physics(dt, g, 1100);
    // interações especiais no ar
    if (this.wid === 'coco' && this.fase === 'voo') {
      const flor = this.world.find((e) => e.spawn.t === 'flor-catapulta' && !e.dead && Math.abs(e.x - this.x) < 60 && this.y < e.y && this.y > e.y - 180);
      if (flor && (flor as unknown as { engolirCoco?: (t: Thrown) => boolean }).engolirCoco?.(this)) return;
    }
    if (this.wid === 'jaca' && this.fase === 'voo' && this.vy > 0) {
      const brom = this.world.find((e) => e.spawn.t === 'bromelia' && !e.dead && Math.abs(e.x - this.x) < 50 && Math.abs(e.y - 40 - this.y) < 40);
      if (brom) {
        (brom as unknown as { mola?: () => void }).mola?.();
        this.fase = 'lancada'; this.vx = 0; this.vy = -1550; b.onGround = false;
        this.world.text('BOING!', this.x, this.y - 40, 'small');
        bus.emit('jaca-bromelia');
        return;
      }
    }
    if (this.wid === 'chave') this.cortarCorda();
    if (this.hitStuff()) return;
    if (this.modo === 'cima' && this.wid === 'panela' && this.vy > 0 && !this.inimigo) {
      for (const h of [this.world.duo.leader, this.world.duo.partner]) {
        if (h && Math.abs(h.x - this.x) < 64 && Math.abs((h.y - h.h) - this.y) < 56) { giveHelmet(this.world, h); this.kill(); return; }
      }
    }
    if (b.inWater) { this.naAgua(); return; }
    if (b.hitWall) { this.naParede(); return; }
    if (b.onGround) this.noChao();
  }

  /** acerta inimigos e objetos; retorna true se a entidade deixou de voar */
  private hitStuff(): boolean {
    const area = { x: this.x, y: this.y + 6, w: this.w + 16, h: this.h + 16 };
    const dmg = this.fase === 'lancada' ? 3 : this.def.peso === 'pesado' ? 2 : 1;
    if (this.inimigo) {
      for (const h of [this.world.duo.leader]) {
        if (Math.abs(h.x - this.x) < (h.w + this.w) / 2 && h.y - h.h < this.y && h.y > this.y - this.h) {
          h.hurt({ kind: 'arremesso', dmg: 1, dir: Math.sign(this.vx) || 1, x: this.x, y: this.y, weapon: this.wid, source: this });
          this.quebrar(); return true;
        }
      }
      return false;
    }
    const fresh = (e: Entity) => (this.hitCd.get(e.id) ?? 0) <= this.world.time;
    const hits = this.world.hitArea(area, { kind: 'arremesso', dmg, dir: Math.sign(this.vx) || this.dir, x: this.x, y: this.y, weapon: this.wid, source: this, heavy: this.def.peso === 'pesado' || this.def.pega === 'cabeca' }, (e) => (e.team === 'enemy' || e.team === 'neutral') && fresh(e));
    if (!hits.length) return false;
    let enemy = false;
    for (const e of hits) {
      this.hitCd.set(e.id, this.world.time + 0.5);
      if (e.team === 'enemy') {
        enemy = true; this.hits++;
        if (e.dead) this.world.enemyKilled(e, 'arremesso', this.wid);
        bus.emit('weapon-hit', { id: this.wid, target: e.spawn.t, thrown: true });
        if (this.wid === 'coco' && !e.dead) stun(this.world, e, 1.5);
      }
    }
    this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y - this.h / 2, { scale: 0.8 });
    this.world.sfx('golpe-acerto', this.x);
    if (enemy) this.world.hitstop(40);
    // quem atravessa e quem para
    switch (this.wid) {
      case 'cabaca': case 'cabaca-pedra': case 'galho': case 'chave': case 'bromelia': return false;
      case 'coco': this.vx = -this.vx * 0.5; this.vy = -420; this.contarQuique(); return false;
      case 'jaca': this.splat(); return true;
      case 'cupinzeiro': this.nuvem(); return true;
      case 'lamparina': this.fogo(); return true;
    }
    if (this.fase === 'canhao' || this.fase === 'lancada') return false;
    // armas comuns: ricocheteiam e caem no chão (gastam 1 uso)
    this.vx = -this.vx * 0.25; this.vy = -380;
    return false;
  }

  private noChao() {
    switch (this.wid) {
      case 'cabaca': case 'cabaca-pedra':
        this.fase = 'rolar';
        this.vx = (Math.sign(this.vx) || this.dir) * (this.wid === 'cabaca' ? 470 : 380);
        this.dir = this.vx > 0 ? 1 : -1;
        this.sprite?.play('rolar');
        this.world.spawnFx('fx-poeira', 'aterrissar', this.x, this.y, { scale: 0.7 });
        this.sfx(this.wid === 'cabaca' ? 'cabaca-rolar' : 'pedra-quebrar', 0.5);
        return;
      case 'coco':
        if (this.bounces < 3) { this.vy = -(Math.abs(this.lastVy) * 0.62 + 160); this.body!.onGround = false; this.contarQuique(); }
        else this.quebrarCoco();
        return;
      case 'jaca': this.splat(); return;
      case 'cupinzeiro': this.nuvem(); return;
      case 'lamparina': this.fogo(); return;
      case 'bromelia': this.virar('bromelia'); return;
      default: this.pousar();
    }
  }
  private contarQuique() {
    this.bounces++;
    this.sfx('coco-quique', 0.8);
    if (this.bounces > 3) this.quebrarCoco();
  }

  private naParede() {
    const b = this.body!;
    const parede = this.paredeRachada();
    switch (this.wid) {
      case 'cabaca':
        this.quebrar(); return;
      case 'cabaca-pedra':
        if (parede) { (parede as unknown as { quebrar: (por: string) => void }).quebrar('cabaca-pedra'); this.vx *= 0.5; this.fase = this.fase === 'rolar' ? 'rolar' : 'voo'; return; }
        this.quebrar(); return;
      case 'coco': this.vx = -b.vx || -this.dir * 200; this.contarQuique(); return;
      case 'galho': this.prender(); return;
      case 'jaca': this.splat(); return;
      case 'cupinzeiro': this.nuvem(); return;
      case 'lamparina': this.fogo(); return;
      default:
        this.vx = -this.dir * 120; this.vy = Math.min(this.vy, 0);
        if (this.fase === 'canhao') this.quebrar();
    }
  }
  private paredeRachada(): Entity | undefined {
    return this.world.find((e) => e.spawn.t === 'parede-rachada' && !e.dead && Math.abs(e.x - this.x) < e.w / 2 + this.w / 2 + 12 && this.y > e.y - e.h && this.y - this.h < e.y);
  }

  private naAgua() {
    this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - 10, { scale: 0.8 });
    this.sfx('agua-entrar', 0.6);
    switch (this.wid) {
      case 'cabaca-pedra': this.fase = 'afundar'; this.sprite?.play('idle'); return;
      case 'remo': {
        const ty = this.superficie();
        if (ty !== null) {
          const p = this.world.spawn({ t: 'prancha', x: this.x / TILE, y: ty / TILE });
          if (p) bus.emit('remo-prancha', { x: this.x, y: ty });
          this.kill(); return;
        }
        this.kill(); return;
      }
      case 'peixe': bus.emit('peixe-isca', { x: this.x, y: this.y, entity: this, agua: true }); this.fase = 'afundar'; return;
      case 'coco': this.vy = -260; this.vx *= 0.5; this.contarQuique(); return;
      default: this.fase = 'afundar';
    }
  }
  private superficie(): number | null {
    const tx = Math.floor(this.x / TILE);
    for (let ty = Math.floor(this.y / TILE); ty > Math.floor(this.y / TILE) - 4; ty--) {
      const t = this.world.grid.at(tx, ty), up = this.world.grid.at(tx, ty - 1);
      if ((t === T.WATER || t === T.WATER_VINE) && up !== T.WATER && up !== T.WATER_VINE) return ty * TILE + 4;
    }
    return null;
  }

  /** a chave giratória corta cordas (cipós horizontais) por onde passa */
  private cortarCorda() {
    const g = this.world.grid;
    for (const dy of [-16, -48]) {
      const tx = Math.floor(this.x / TILE), ty = Math.floor((this.y + dy) / TILE);
      if (g.at(tx, ty) !== T.ROPE) continue;
      g.set(tx, ty, T.EMPTY);
      this.sfx('golpe-leve', 0.8);
      this.world.text('TEC!', this.x, this.y - 40, 'small');
      bus.emit('corda-cortada', { tx, ty });
    }
  }

  /* ---------------- fases ---------------- */
  private updateRolar(dt: number) {
    const b = this.body!;
    const sp = this.wid === 'cabaca' ? 470 : 380;
    this.vx = this.dir * sp;
    this.physics(dt, 2000, 900);
    if (this.sprite) this.sprite.speed = 1.3;
    this.rollSfx -= dt;
    if (this.rollSfx <= 0 && b.onGround) { this.rollSfx = 0.35; this.sfx('cabaca-rolar', 0.45); }
    this.hitStuff();
    if (b.inWater) { this.naAgua(); return; }
    if (b.hitWall) { this.naParede(); return; }
    if (this.t > 7) this.quebrar();
  }
  private updateBumerangue(dt: number) {
    const th = this.thrower;
    const out = 0.55;
    if (this.t < out) {
      this.vx = this.dir * 900 * this.forca * (1 - this.t / out * 0.9);
      this.vy = Math.sin(this.t * 9) * 160 - 60; // trajetória torta
    } else {
      const tx = th ? th.x : this.x, ty = th ? th.y - th.h * 0.6 : this.y;
      const d = Math.hypot(tx - this.x, ty - this.y) || 1;
      const sp = Math.min(820, 300 + (this.t - out) * 900);
      this.vx = ((tx - this.x) / d) * sp + Math.cos(this.t * 8) * 140;
      this.vy = ((ty - this.y) / d) * sp;
      if (th && d < 50 && th.state !== 'dead') { this.pegarDeVolta(th); return; }
      if (this.t > 3.2) { this.fase = 'voo'; this.vx = 0; this.vy = 0; return; }
    }
    const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
    if (this.t < out && isSolid(this.world.grid.atPx(nx, ny - 16))) { this.prender(); return; }
    this.x = nx; this.y = ny;
    if (this.body) { this.body.x = nx; this.body.y = ny; }
    this.hitStuff();
  }
  private pegarDeVolta(h: Hero) {
    const usos = this.usos - 1;
    if (usos <= 0) { this.quebrar(); return; }
    if (!h.held) { h.equip({ def: this.def, usos }); this.sfx('arma-pegar', 0.7); this.world.text('PEGOU!', h.x, h.y - h.h - 10, 'small'); this.kill(); }
    else { this.fase = 'voo'; this.vx = 0; this.vy = -200; }
  }
  /** galho preso numa árvore/parede: balança e cai (de vez em quando derruba um ninho de vespas) */
  private prender() {
    this.fase = 'preso'; this.t = 0; this.vx = 0; this.vy = 0;
    this.sfx('golpe-leve', 0.6);
    this.world.text('TOC!', this.x, this.y - 30, 'small');
    galhosPresos++;
    if (galhosPresos % 3 === 0) {
      const e = this.world.spawn({ t: 'marimbondo', x: this.x / TILE, y: (this.y - 30) / TILE, rota: 'circulo', raio: 1.2 });
      if (e) { this.world.text('ZZZZ!', this.x, this.y - 70); bus.emit('vespas', { x: this.x, y: this.y }); }
    }
  }
  private updatePreso(dt: number) {
    if (this.sprite) this.sprite.rot = Math.sin(this.t * 30) * 12 * Math.max(0, 1 - this.t);
    if (this.t > 0.6) {
      this.fase = 'voo'; this.t = 1; this.vx = -this.dir * 60; this.vy = 0;
      if (this.sprite) this.sprite.rot = 0;
      if (this.body) { this.body.x = this.x; this.body.y = this.y; }
    }
    void dt;
  }
  private updateAfundar(dt: number) {
    const b = this.body!;
    this.vx *= 0.9;
    this.physics(dt, 300, 90);
    if (this.wid === 'peixe' && Math.floor(this.t * 1.2) !== Math.floor((this.t - dt) * 1.2)) bus.emit('peixe-isca', { x: this.x, y: this.y, entity: this, agua: true });
    if (Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) this.world.spawnFx('fx-agua', 'bolha-p', this.x, this.y - 20, { vy: -60, life: 1, fade: 0.4, loop: true });
    if (b.onGround) {
      if (this.wid === 'cabaca-pedra') this.virar('cabaca-pedra');
      else if (this.wid === 'peixe') { if (this.t > 6) this.kill(); }
      else this.kill();
    }
    if (this.t > 8) this.kill();
  }

  /* ---------------- desfechos ---------------- */
  /** a arma para no chão: vira `arma` de novo (gasta 1 uso) ou quebra */
  private pousar() {
    const usos = this.def.usos === Infinity ? Infinity : this.usos - 1;
    if (usos <= 0) { this.quebrar(); return; }
    const e = this.world.spawn({ t: 'arma', id: this.wid, x: this.x / TILE, y: this.y / TILE });
    if (e) (e as unknown as { usos: number }).usos = usos;
    if (this.wid === 'peixe') bus.emit('peixe-isca', { x: this.x, y: this.y, entity: e });
    this.sfx('golpe-leve', 0.4);
    this.kill();
  }
  private virar(t: string) {
    const e = this.world.spawn({ t, x: this.x / TILE, y: this.y / TILE });
    if (e && this.usos) (e as unknown as { usos: number }).usos = this.usos;
    this.kill();
  }
  quebrar() {
    const model = this.def.model;
    this.world.spawnFx(model, 'quebrar', this.x, this.y, { flip: this.dir < 0 });
    this.world.spawnFx('fx-lascas', LASCAS[this.wid] ?? 'madeira', this.x, this.y - this.h / 2);
    this.sfx(this.wid === 'cabaca' || this.wid === 'coco' || this.wid === 'jaca' ? 'cabaca-quebrar' : this.wid === 'cabaca-pedra' || this.wid === 'panela' ? 'pedra-quebrar' : 'arma-quebrar');
    if (this.wid !== 'cabaca' && this.wid !== 'cabaca-pedra') bus.emit('weapon-break', { id: this.wid, thrown: true });
    if (this.wid === 'coco') bus.emit('coco-hits', { n: this.hits });
    this.kill();
  }
  private quebrarCoco() {
    // a água do coco molha quem está perto: escorregam
    this.world.spawnFx('fx-agua', 'respingo', this.x, this.y - 10, { scale: 1.2 });
    for (const e of this.world.enemiesNear(this.x, this.y, 150)) {
      (e as unknown as { molhadoT: number }).molhadoT = 3;
      e.onHit({ kind: 'outro', dmg: 0, dir: e.x > this.x ? 1 : -1, x: this.x, y: this.y, weapon: 'coco', source: this });
      stun(this.world, e, 1.2);
    }
    bus.emit('molhado', { x: this.x, y: this.y });
    this.quebrar();
  }
  private splat() {
    this.world.sfx('jaca-splat', this.x);
    this.world.shake(4, 160);
    this.world.spawnFx('fx-lascas', 'cabaca', this.x, this.y - 20, { scale: 1.2 });
    const hits = this.world.hitArea({ x: this.x, y: this.y + 10, w: 150, h: 120 }, { kind: 'arremesso', dmg: 2, dir: this.dir, x: this.x, y: this.y, weapon: 'jaca', source: this, heavy: true }, (e) => e.team === 'enemy');
    for (const e of hits) if (e.dead) this.world.enemyKilled(e, 'arremesso', 'jaca');
    const gy = this.chaoAbaixo();
    if (gy !== null) this.world.spawn({ t: 'poca', x: this.x / TILE, y: gy / TILE });
    this.world.text('SPLOFT!', this.x, this.y - 40);
    bus.emit('weapon-break', { id: 'jaca', thrown: true });
    this.kill();
  }
  private chaoAbaixo(): number | null {
    if (this.body?.onGround) return this.y;
    const tx = Math.floor(this.x / TILE);
    for (let ty = Math.floor(this.y / TILE); ty < Math.floor(this.y / TILE) + 6; ty++) {
      const t = this.world.grid.at(tx, ty);
      if (t === T.SOLID || t === T.ONEWAY || t === T.RAIL) return ty * TILE;
      if (t === T.WATER) return null;
    }
    return null;
  }
  private nuvem() {
    this.world.spawnFx('fx-lascas', 'pedra', this.x, this.y - 20);
    this.world.sfx('cupins', this.x);
    this.world.spawn({ t: 'nuvem-cupins', x: this.x / TILE, y: (this.y - 20) / TILE });
    this.world.text('BZZZZ!', this.x, this.y - 50);
    bus.emit('weapon-break', { id: 'cupinzeiro', thrown: true });
    this.kill();
  }
  private fogo() {
    this.world.sfx('fogo', this.x);
    this.world.spawnFx('fx-explosao', 'pequena', this.x, this.y);
    for (const e of this.world.entities) {
      if (e.dead || Math.hypot(e.x - this.x, e.y - this.y) > 190) continue;
      if (e.spawn.t === 'fogueira') (e as unknown as { acender?: () => void }).acender?.();
      if (e.spawn.t === 'teia') (e as unknown as { queimar?: () => void }).queimar?.();
    }
    for (const e of this.world.enemiesNear(this.x, this.y, 140)) {
      const ok = e.onHit({ kind: 'arremesso', dmg: 1, dir: e.x > this.x ? 1 : -1, x: this.x, y: this.y, weapon: 'lamparina', source: this });
      if (ok && e.dead) this.world.enemyKilled(e, 'arremesso', 'lamparina');
    }
    this.quebrar();
  }

  /* ---------------- flor-catapulta (coco canhão) ---------------- */
  engolir() { this.fase = 'engolido'; if (this.sprite) this.sprite.visible = false; }
  disparar(x: number, y: number, vx: number, vy: number) {
    this.fase = 'canhao'; this.t = 0; this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    if (this.body) { this.body.x = x; this.body.y = y; this.body.vx = vx; this.body.vy = vy; this.body.onGround = false; }
    if (this.sprite) this.sprite.visible = true;
    this.bounces = 0;
    this.hitCd.clear();
  }

  render(a: number) {
    if (this.sprite) {
      this.sprite.groundY = this.fase === 'rolar' ? this.y : null;
      if (this.fase === 'canhao') this.sprite.sx = this.sprite.sy = 1.15;
    }
    super.render(a);
  }
}

/* ------------------------------------------------------------------ */
/* Estilingue: cada tiro gasta 1 castanha; acerta letras e interruptores */
/* ------------------------------------------------------------------ */
export class TiroEstilingue extends Entity {
  usos = 1;
  seco: boolean;
  private life = 1.3;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.team = 'hero'; this.persistent = true; this.w = 22; this.h = 22; this.z = 46;
    this.seco = !!s.seco;
    const up = s.modo === 'cima';
    this.vx = up ? this.dir * 150 : this.dir * 1150; this.vy = up ? -1150 : -60;
  }
  init() {
    // o estilingue continua na mão (o herói o soltou para "arremessar")
    const h = this.world.duo.leader;
    const def = WEAPONS.estilingue;
    const restam = this.seco ? this.usos : this.usos - 1;
    if (!h.held && restam > 0) h.equip({ def, usos: restam });
    else if (restam <= 0) { this.world.spawnFx(def.model, 'quebrar', h.x + h.dir * 30, h.y - h.h * 0.5); this.world.sfx('arma-quebrar', h.x); bus.emit('weapon-break', { id: 'estilingue' }); }
    if (this.seco) { this.kill(); return; }
    this.makeSprite('castanha', 'girar');
    if (this.sprite) { this.sprite.sx = this.sprite.sy = 0.6; }
  }
  update(dt: number) {
    if (this.dead) return;
    this.life -= dt;
    this.vy += 500 * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.sprite?.update(dt);
    if (this.life <= 0 || isSolid(this.world.grid.atPx(this.x, this.y - 10))) { this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y - 10, { scale: 0.5 }); this.kill(); return; }
    // letras C-I-P-Ó distantes
    const letra = this.world.find((e) => e.spawn.t === 'letra' && !e.dead && Math.abs(e.x - this.x) < 40 && Math.abs(e.y - e.h / 2 - this.y) < 50);
    if (letra) { (letra as unknown as { take: (h: null) => void }).take(null); bus.emit('estilingue-letra'); this.kill(); return; }
    const hits = this.world.hitArea({ x: this.x, y: this.y + 11, w: 30, h: 30 }, { kind: 'arremesso', dmg: 1, dir: Math.sign(this.vx) || 1, x: this.x, y: this.y, weapon: 'estilingue', source: this });
    if (hits.length) {
      for (const e of hits) { if (e.dead && e.team === 'enemy') this.world.enemyKilled(e, 'arremesso', 'estilingue'); bus.emit('weapon-hit', { id: 'estilingue', target: e.spawn.t }); }
      this.world.sfx('golpe-acerto', this.x, 0.7);
      this.world.spawnFx('fx-faisca', 'impacto', this.x, this.y, { scale: jitter(0.6) });
      this.kill();
    }
  }
  render(a: number) { if (this.sprite) this.sprite.rot = (this.world.time * 900) % 360; super.render(a); }
}

register('arremessado', (w, s) => new Thrown(w, s));
register('tiro-estilingue', (w, s) => new TiroEstilingue(w, s));
