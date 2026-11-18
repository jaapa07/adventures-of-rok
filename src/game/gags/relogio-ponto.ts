/**
 * gag_relogio_ponto (4-2) — FIM DE EXPEDIENTE.
 * Javalins armados trabalham (e atacam) perto de um relógio de ponto. Interagir com o relógio (ação/J)
 * ou acertá-lo com um golpe toca a SIRENE de fim de expediente: todos largam as armas no chão
 * (entidades `arma` de verdade, que o herói pode recolher) e vão embora com a marmita ("ir-embora")
 * até a saída. Depois de `duracao` segundos voltam — desarmados e mal-humorados ("Hora extra?!").
 * O relógio só pode ser batido uma vez.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_relogio_ponto', x, y, javalins: [[x, y, 'arma'?], …], saida: [x, y], duracao? }
 *   - x, y: pés do relógio de ponto
 *   - javalins: posições (y = chão); o 3º item opcional é o id da arma que ele segura (padrão 'chave')
 *   - saida: para onde eles andam (somem ali); duracao: segundos fora (padrão 10)
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { Sprite } from '../../render/sprite';
import { TILE } from '../types';
import { defineGag, gagDone, say, Ator, JavaliCena, num, px, pares } from './common';

class JavaliArmado extends JavaliCena {
  armaSpr?: Sprite;
  constructor(w: World, x: number, y: number, public arma: string | null) { super(w, x, y, 'idle'); }
  init() {
    super.init();
    if (this.arma) { this.armaSpr = new Sprite('arma-' + this.arma, this.world.preset, 'base', this.world.stage.entities); this.armaSpr.play('mao'); }
  }
  soltar() {
    if (!this.arma) return;
    this.world.spawn({ t: 'arma', id: this.arma, x: (this.x + this.dir * 40) / TILE, y: this.y / TILE });
    this.armaSpr?.destroy(); this.armaSpr = undefined;
    this.arma = null;
  }
  render() {
    super.render();
    const s = this.sprite, a = this.armaSpr;
    if (!s || !a) return;
    const h = s.anchor('hand');
    a.visible = this.visible && this.alpha > 0.05;
    a.x = h?.[0] ?? this.x + this.dir * 34; a.y = h?.[1] ?? this.y - 60;
    a.rot = h?.[2] ?? 0; a.flip = this.dir < 0; a.z = this.z + 2; a.alpha = this.alpha;
    a.render();
  }
  derrota(how: HitInfo['kind'], dir: number, contar: boolean) {
    if (this.arma && !this.morto) this.soltar();
    super.derrota(how, dir, contar);
  }
  destroy() { super.destroy(); this.armaSpr?.destroy(); }
}

interface Posto { j: JavaliArmado; casa: [number, number] }

class RelogioPonto extends Entity {
  relogio!: Ator;
  postos: Posto[] = [];
  saida: [number, number];
  duracao: number;
  estado: 'trabalho' | 'saindo' | 'fora' | 'voltando' | 'fim' = 'trabalho';
  t = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    const sd = pares([s.saida])[0] ?? [s.x + 14, s.y];
    this.saida = [px(sd[0]), px(sd[1])];
    this.duracao = num(s.duracao, 10);
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.relogio = w.add(new Ator(w, 'relogio-ponto', this.x, this.y, { anim: 'idle', t: 'relogio-ponto', w: 60, h: 120, z: 18 }));
    this.relogio.onInteract = () => this.tocar();
    this.relogio.hitFn = (h) => (h.dmg > 0 ? this.tocar() : false);
    const lista = Array.isArray(this.spawn.javalins) ? (this.spawn.javalins as unknown[][]) : [];
    for (const p of lista) {
      if (!Array.isArray(p) || typeof p[0] !== 'number' || typeof p[1] !== 'number') continue;
      const arma = typeof p[2] === 'string' ? p[2] : 'chave';
      const j = w.add(new JavaliArmado(w, px(p[0]), px(p[1]), arma));
      j.persistent = true;
      j.limites = [px(p[0]) - 400, px(p[0]) + 400];
      j.enfurecer(false);
      j.aoGolpeCena = () => !j.visible;
      j.aoDerrotar = () => { this.postos = this.postos.filter((o) => o.j !== j); };
      this.postos.push({ j, casa: [px(p[0]), px(p[1])] });
    }
  }
  private tocar() {
    const w = this.world;
    if (this.estado !== 'trabalho') {
      if (this.estado === 'fim') w.text('PONTO JÁ BATIDO', this.x, this.y - 160, 'small');
      return this.estado === 'fim';
    }
    this.estado = 'saindo'; this.t = 0;
    this.relogio.play('tocar', { restart: true });
    w.sfx('sirene-ponto', this.x);
    w.text('FIM DO EXPEDIENTE!', this.x, this.y - 190);
    for (const { j } of this.postos) {
      j.hostil = false; j.touchHurts = false; j.vx = 0;
      j.soltar();
      j.play('ir-embora');
    }
    const p0 = this.postos[0]?.j;
    if (p0) say(w, p0, 'javalim', 'Opa! Bateu o ponto! Fui!', 140);
    gagDone(w, 'gag_relogio_ponto');
    return true;
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world;
    const andar = (j: JavaliArmado, x: number, vel: number) => {
      const dx = x - j.x;
      j.dir = dx > 0 ? 1 : -1;
      j.x += Math.sign(dx) * Math.min(Math.abs(dx), vel * dt);
      if (j.body) j.body.x = j.x;
      return Math.abs(dx) < 4;
    };
    switch (this.estado) {
      case 'saindo': {
        if (this.t > 1.6) this.relogio.play('idle');
        let todos = true;
        for (const { j } of this.postos) {
          j.play('ir-embora');
          if (andar(j, this.saida[0], 150)) { j.alpha = Math.max(0, j.alpha - dt * 4); } else todos = false;
          if (j.alpha > 0) todos = false;
        }
        if (todos || this.t > this.duracao) { this.estado = 'fora'; for (const { j } of this.postos) { j.visible = false; j.alpha = 0; } }
        if (this.t > this.duracao) { this.estado = 'voltando'; this.t = 0; }
        break;
      }
      case 'fora':
        if (this.t > this.duracao) { this.estado = 'voltando'; this.t = 0; }
        break;
      case 'voltando': {
        if (this.t < 0.1) { const p0 = this.postos[0]?.j; if (p0) { p0.visible = true; p0.alpha = 1; say(w, p0, 'javalim', 'Hora extra?! Ninguém merece…', 140); } }
        let todos = true;
        this.postos.forEach(({ j, casa }, i) => {
          if (this.t < i * 0.5) { todos = false; return; }
          j.visible = true; j.alpha = Math.min(1, j.alpha + dt * 4);
          j.play('andar');
          if (!andar(j, casa[0], 140)) todos = false;
        });
        if (todos) {
          this.estado = 'fim';
          for (const { j } of this.postos) { j.hostil = false; j.enfurecer(true); }
        }
        break;
      }
    }
  }
}

defineGag('gag_relogio_ponto', (w, s) => new RelogioPonto(w, s));
