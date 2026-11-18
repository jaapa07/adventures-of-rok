/**
 * gag_trilho_errado (2-2) — O TRILHO ERRADO.
 * Quando o carrinho (o líder) se aproxima, a placa-trilho vira sozinha ("CLEC!") e troca o trilho:
 * as células `abre` deixam de ser trilho e as `fecha` viram trilho, desviando o carrinho para a sala
 * dos Javalins jogando dominó. Ao entrarem na sala, eles se assustam, VIRAM A MESA (peças voando,
 * sfx domino-mesa) e perseguem o carrinho até cansar.
 * Observação: a troca altera só a colisão; desenhe os dois trilhos no tilemap/decor para a arte.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_trilho_errado', x, y, sala: [x0, x1], javalins: [[x, y], …], mesa: [x, y],
 *     abre?: [[tx, ty], …], fecha?: [[tx, ty], …], aviso?, perseguir? }
 *   - x, y: pés da placa-trilho
 *   - aviso: distância em tiles do líder até a placa para ela virar (padrão 4)
 *   - sala: colunas da sala do dominó; mesa: pés da mesa; javalins: jogadores sentados
 *   - perseguir: quantos tiles além da sala eles correm atrás do carrinho (padrão 30)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { T } from '../physics';
import { defineGag, gagDone, say, Ator, JavaliCena, num, px, pares, domEl, place } from './common';

interface Peca { el: HTMLElement; x: number; y: number; vx: number; vy: number; r: number; vr: number }

class TrilhoErrado extends Entity {
  placa!: Ator;
  virou = false;
  invadida = false;
  jogadores: JavaliCena[] = [];
  mesa?: HTMLElement;
  mesaXY: [number, number];
  mesaV = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 };
  pecas: Peca[] = [];
  sala: [number, number];
  aviso: number;
  perseguir: number;
  t = 0; caçaT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    const sala = pares([s.sala])[0] ?? [s.x + 10, s.x + 22];
    this.sala = [px(sala[0]), px(sala[1])];
    const m = pares([s.mesa])[0] ?? [(sala[0] + sala[1]) / 2, s.y];
    this.mesaXY = [px(m[0]), px(m[1])];
    this.aviso = px(num(s.aviso, 4));
    this.perseguir = px(num(s.perseguir, 30));
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.placa = w.add(new Ator(w, 'placa-trilho', this.x, this.y, { anim: 'esquerda', t: 'placa-trilho', w: 60, h: 140, z: 16 }));
    this.mesa = domEl(w, 'gag-mesa');
    this.mesa.style.zIndex = '21';
    this.mesaV.x = this.mesaXY[0]; this.mesaV.y = this.mesaXY[1];
    // peças do dominó em cima da mesa (posições fixas)
    for (let i = 0; i < 7; i++) {
      const el = domEl(w, 'gag-peca'); el.style.zIndex = '22';
      this.pecas.push({ el, x: this.mesaXY[0] - 60 + i * 19, y: this.mesaXY[1] - 64 - 14, vx: 0, vy: 0, r: 90, vr: 0 });
    }
    for (const [x, y] of pares(this.spawn.javalins)) {
      const j = w.add(new JavaliCena(w, px(x), px(y), 'domino'));
      j.dir = (px(x) < this.mesaXY[0] ? 1 : -1) as 1 | -1;
      j.vel = 330; j.alcance = 2400;
      j.limites = [this.sala[0] - 200, this.sala[1] + this.perseguir];
      j.persistent = true;
      j.aoGolpeCena = () => { this.invadir(); return false; };
      this.jogadores.push(j);
    }
  }
  private trocar() {
    const w = this.world;
    this.virou = true;
    this.placa.play('direita', { restart: true });
    w.sfx('clank', this.placa.x);
    w.text('CLEC!', this.placa.x, this.placa.y - 170);
    for (const [tx, ty] of pares(this.spawn.abre)) w.grid.set(Math.floor(tx), Math.floor(ty), T.EMPTY);
    for (const [tx, ty] of pares(this.spawn.fecha)) w.grid.set(Math.floor(tx), Math.floor(ty), T.RAIL);
    const L = w.duo.leader;
    say(w, L, L.hid, L.isTama ? 'Ih… trilho errado!' : 'Era pra esquerda!!', L.h + 50);
  }
  private invadir() {
    if (this.invadida) return;
    const w = this.world;
    this.invadida = true;
    w.sfx('domino-mesa', this.mesaXY[0]);
    w.shake(4, 220);
    const L = w.duo.leader;
    const lado = Math.sign(this.mesaXY[0] - L.x) || 1;
    this.mesaV.vx = lado * 260; this.mesaV.vy = -620; this.mesaV.vr = lado * 520;
    this.pecas.forEach((p, i) => { p.vx = (i - 3) * 90 + lado * 60; p.vy = -560 - (i % 3) * 120; p.vr = (i % 2 ? 1 : -1) * 720; });
    say(w, this.jogadores[0] ?? this.placa, 'javalim', 'A PARTIDA!! Eu ia bater!', 150, 'grito');
    this.jogadores.forEach((j) => j.enfurecer(true));
    gagDone(w, 'gag_trilho_errado');
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader;
    if (!this.virou && Math.abs(L.x - this.placa.x) < this.aviso && Math.abs(L.y - this.placa.y) < 500) this.trocar();
    if (!this.invadida && L.x > this.sala[0] && L.x < this.sala[1] && Math.abs(L.y - this.mesaXY[1]) < 400) this.invadir();
    for (const j of this.jogadores) if (!j.hostil) j.play('domino');
    if (this.invadida) {
      this.caçaT += dt;
      const m = this.mesaV;
      m.vy += 1900 * dt; m.x += m.vx * dt; m.y += m.vy * dt; m.r += m.vr * dt;
      if (m.y > this.mesaXY[1] && m.vy > 0) { m.y = this.mesaXY[1]; m.vy = 0; m.vx *= 0.5; m.vr = 0; m.r = 180; }
      for (const p of this.pecas) {
        p.vy += 1900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > this.mesaXY[1] - 7 && p.vy > 0) { p.y = this.mesaXY[1] - 7; p.vy = -p.vy * 0.3; p.vx *= 0.6; p.vr *= 0.5; }
      }
      if (this.caçaT > 9) for (const j of this.jogadores) if (j.alcance > 0) { j.alcance = 0; say(w, j, 'javalim', 'Ufa… volta aqui… seu…', 140); break; }
    }
  }
  render() {
    const m = this.mesaV;
    if (this.mesa) place(this.mesa, m.x - 85, m.y - 64, `rotate(${m.r.toFixed(1)}deg)`);
    for (const p of this.pecas) place(p.el, p.x - 7, p.y - 13, `rotate(${p.r.toFixed(0)}deg)`);
  }
  destroy() { this.mesa?.remove(); this.pecas.forEach((p) => p.el.remove()); }
}

defineGag('gag_trilho_errado', (w, s) => new TrilhoErrado(w, s));
