/**
 * gag_caranguejo_baile (3-1) — A CONGA DOS CARANGUEJOS.
 * Uma fila de caranguejos dança conga ("conga") indo e voltando na praia. Cada pisão achata um
 * caranguejo (o herói quica); pular na FILA INTEIRA em sequência, sem tocar o chão, fecha o combo
 * (10 com a fila completa) e faz CHOVER CASTANHAS. Se a sequência quebrar, os achatados se levantam
 * e voltam para a fila — dá para tentar de novo. Golpes de arma derrotam de vez (a fila encolhe).
 * Encostar de lado machuca, como qualquer caranguejo.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_caranguejo_baile', x, y, de, ate, n?, castanhas? }
 *   - y: linha do chão; de..ate: colunas onde a fila passeia; x: início da cabeça da fila
 *   - n: tamanho da fila (padrão 10); castanhas: quantas chovem (padrão 30)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, gagDone, Ator, CastanhaCaindo, num, px } from './common';

const ESPACO = 60;

interface Cara { a: Ator; achatado: boolean; reviveT: number }

class CongaCaranguejos extends Entity {
  fila: Cara[] = [];
  de: number; ate: number; chao: number;
  u: number; vel = 78;
  cadeia = 0;
  chaoT = 0;
  feito = false;
  castanhas: number;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.de = px(num(s.de, s.x - 8)); this.ate = px(num(s.ate, s.x + 8));
    this.chao = px(s.y);
    this.u = this.x - this.de;
    this.castanhas = num(s.castanhas, 30);
    this.activeMargin = (this.ate - this.de) / 2 + 700;
  }
  init() {
    const w = this.world;
    const n = Math.max(3, Math.round(num(this.spawn.n, 10)));
    for (let i = 0; i < n; i++) {
      const a = w.add(new Ator(w, 'caranguejo', this.x - i * ESPACO, this.chao, { anim: 'conga', t: 'caranguejo', team: 'enemy', w: 54, h: 44, z: 24 + (i % 2), shadow: true }));
      a.stompable = true; a.touchHurts = true; a.activeMargin = 1400;
      const c: Cara = { a, achatado: false, reviveT: 0 };
      a.stompFn = () => this.pisar(c);
      a.hitFn = (h) => {
        if (h.dmg <= 0) return false;
        w.spawnFx('caranguejo', 'morte', a.x, a.y, { flip: a.dir < 0, vx: h.dir * 140, vy: -360, gravity: 1800, life: 1.1, fade: 0.4 });
        a.sfx('inimigo-derrota');
        this.fila = this.fila.filter((f) => f !== c);
        a.kill();
        return true;
      };
      this.fila.push(c);
    }
  }
  private pisar(c: Cara): 'kill' | 'bounce' {
    if (c.achatado || this.feito) return 'bounce';
    const w = this.world;
    c.achatado = true; c.reviveT = 0;
    c.a.touchHurts = false;
    c.a.play('tonto', { restart: true });
    c.a.sfx('caranguejo-clique');
    this.cadeia++;
    this.chaoT = 0;
    w.text(String(this.cadeia), c.a.x, c.a.y - 70, 'small');
    if (this.cadeia >= this.fila.length) this.festa();
    return 'kill';
  }
  private festa() {
    const w = this.world;
    this.feito = true;
    const n = this.cadeia;
    w.text(`COMBO ${n}!`, w.duo.leader.x, w.duo.leader.y - 220);
    w.toast('Chuva de castanhas!', 'castanha');
    w.sfx('letras-completas', w.duo.leader.x);
    for (const c of this.fila) {
      w.spawnFx('caranguejo', 'morte', c.a.x, c.a.y, { vy: -300, gravity: 1600, life: 1, fade: 0.4 });
      c.a.kill();
    }
    this.fila = [];
    const largura = this.ate - this.de;
    for (let i = 0; i < this.castanhas; i++) {
      const k = (i * 7) % this.castanhas / this.castanhas; // espalha sem sorteio
      w.add(new CastanhaCaindo(w, this.de + 40 + k * (largura - 80), this.chao - 620 - (i % 5) * 90, 0, 0));
    }
    gagDone(w, 'gag_caranguejo_baile');
  }
  /** posição em vaivém: u cresce sempre; a fila "reflete" nas pontas */
  private pos(u: number): [number, 1 | -1] {
    const L = this.ate - this.de;
    const m = ((u % (2 * L)) + 2 * L) % (2 * L);
    return m <= L ? [this.de + m, 1] : [this.de + 2 * L - m, -1];
  }
  update(dt: number) {
    const w = this.world, L = w.duo.leader;
    // a sequência quebra quando o herói pisa no chão
    if (this.cadeia > 0 && !this.feito) {
      if (L.b.onGround) this.chaoT += dt; else this.chaoT = 0;
      if (this.chaoT > 0.1) {
        if (this.cadeia >= 3) w.text('Ahh… de novo!', L.x, L.y - L.h - 30, 'small');
        this.cadeia = 0;
        for (const c of this.fila) if (c.achatado) c.reviveT = 0.001;
      }
    }
    if (!this.feito) this.u += this.vel * dt;
    this.fila.forEach((c, i) => {
      const [x, d] = this.pos(this.u - i * ESPACO);
      const a = c.a;
      a.x = x; a.dir = d;
      if (c.achatado) {
        a.scale = 1; a.oy = 0;
        a.squash = 0.6;
        if (c.reviveT > 0) {
          c.reviveT += dt;
          if (c.reviveT > 1.1) { c.achatado = false; c.reviveT = 0; a.touchHurts = true; a.play('conga'); }
        }
      } else {
        a.play('conga');
        a.oy = -Math.abs(Math.sin(w.time * 7 + i * 0.9)) * 10;
        a.rot = Math.sin(w.time * 7 + i * 0.9) * 6;
      }
    });
  }
}

defineGag('gag_caranguejo_baile', (w, s) => new CongaCaranguejos(w, s));
