/**
 * gag_serraria (1-3) — A ESTEIRA DE TORAS.
 * Toras nascem na coluna `de` e andam pela esteira até a serra-gigante. O herói pode subir numa tora
 * (sólido móvel que carrega quem está em cima). Quando a tora chega na serra:
 *  - se o herói ainda estiver em cima → morre (hero.die('normal'));
 *  - se ele estava em cima no último segundo e pulou a tempo → a serra corta a tora numa ESCULTURA
 *    DE MADEIRA DA TAMÁ, que fica exposta depois da serra (gag ativada);
 *  - tora vazia → vira lascas.
 * Um "!" pisca sobre o herói nos 1,6 s finais.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_serraria', x, y, de, intervalo?, vel? }
 *   - x: coluna da serra; y: linha do topo da esteira (as toras ficam sobre ela)
 *   - de: coluna onde as toras nascem (a esteira anda de `de` para `x`, em qualquer sentido)
 *   - intervalo: segundos entre toras (padrão 4.5); vel: px/s (padrão 120)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { Solid } from '../physics';
import type { World } from '../world';
import { defineGag, gagDone, say, Ator, num, px, onSolid, domEl, place, fx } from './common';

const LOG_W = 196, LOG_H = 46;

class Tora extends Ator {
  solidT!: Solid;
  montadoPerto = false;
  constructor(w: World, x: number, y: number, public sentido: 1 | -1, public vel: number) {
    super(w, 'tronco', x, y, { anim: 'idle', t: 'tronco', w: LOG_W, h: LOG_H, z: 18 });
    this.activeMargin = 1600;
  }
  init() {
    super.init();
    this.solidT = this.world.addSolid({ x: this.x - LOG_W / 2, y: this.y - LOG_H, w: LOG_W, h: 30, oneway: true, vx: this.sentido * this.vel, owner: this });
  }
  update(dt: number) {
    this.x += this.sentido * this.vel * dt;
    this.solidT.x = this.x - LOG_W / 2; this.solidT.vx = this.sentido * this.vel;
    // rola devagar na esteira
    this.oy = Math.sin(this.x * 0.05) * 1.5;
    super.update(dt);
  }
  destroy() { super.destroy(); this.world.removeSolid(this.solidT); }
}

class Serraria extends Entity {
  serraX: number; nasceX: number; topo: number;
  sentido: 1 | -1;
  intervalo: number; vel: number;
  toras: Tora[] = [];
  spawnT = 0;
  serra!: Ator;
  escultura: Ator | null = null;
  alerta?: HTMLElement;
  zumbidoT = 0;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.serraX = px(s.x); this.topo = px(s.y);
    this.nasceX = px(num(s.de, s.x - 12));
    this.sentido = this.serraX >= this.nasceX ? 1 : -1;
    this.intervalo = num(s.intervalo, 4.5);
    this.vel = num(s.vel, 120);
    this.x = (this.serraX + this.nasceX) / 2;
    this.activeMargin = Math.abs(this.serraX - this.nasceX) / 2 + 700;
  }
  init() {
    const w = this.world;
    this.serra = w.add(new Ator(w, 'serra-gigante', this.serraX, this.topo + 26, { anim: 'girar', t: 'serra-gigante', w: 120, h: 200, z: 30 }));
    this.serra.dir = this.sentido;
    this.alerta = domEl(w, 'gag-alerta', true);
    this.alerta.textContent = '!';
    this.alerta.style.opacity = '0';
  }
  update(dt: number) {
    const w = this.world, L = w.duo.leader;
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = this.intervalo;
      this.toras.push(w.add(new Tora(w, this.nasceX, this.topo, this.sentido, this.vel)));
    }
    this.zumbidoT -= dt;
    if (this.zumbidoT <= 0) { this.zumbidoT = 1.2; if (Math.abs(w.camX + 640 - this.serraX) < 900) w.sfx('serra-gigante', this.serraX, 0.55); }
    let alerta = false;
    for (let i = this.toras.length - 1; i >= 0; i--) {
      const t = this.toras[i];
      const d = (this.serraX - t.x) * this.sentido; // px até a serra
      const montado = onSolid(L, t.solidT);
      if (montado && d < this.vel * 1.25) t.montadoPerto = true;
      if (montado && d < this.vel * 1.6) alerta = true;
      if (d <= 0) {
        this.toras.splice(i, 1);
        this.cortar(t, montado);
      }
    }
    if (this.alerta) {
      this.alerta.style.opacity = alerta && Math.floor(w.time * 8) % 2 === 0 ? '1' : '0';
      place(this.alerta, L.x - 12, L.y - L.h - 70);
    }
  }
  private cortar(t: Tora, montado: boolean) {
    const w = this.world, L = w.duo.leader;
    w.sfx('serra-gigante', this.serraX, 1);
    w.sfx('madeira-quebrar', this.serraX);
    w.shake(5, 200);
    fx(w, 'fx-lascas', ['madeira'], this.serraX, this.topo - 30, { scale: 1.3 });
    fx(w, 'fx-poeira', ['aterrissar'], this.serraX + this.sentido * 40, this.topo);
    if (montado) {
      L.die('normal');
      w.text('ZZZRRRRT!', this.serraX, this.topo - 200);
    } else if (t.montadoPerto) {
      this.esculpir();
    }
    t.kill();
  }
  /** escultura de madeira da Tamá (sprite da heroína tingido de madeira, imóvel) */
  private esculpir() {
    const w = this.world;
    this.escultura?.kill();
    const x = this.serraX + this.sentido * 230;
    const e = w.add(new Ator(w, 'tama', x, this.topo, { anim: 'vitoria', t: 'escultura', w: 80, h: 150, z: 17, shadow: true }));
    e.dir = (-this.sentido) as 1 | -1;
    e.filter = 'sepia(1) saturate(2.2) hue-rotate(-14deg) brightness(0.72) contrast(1.35)';
    e.tick = () => { if (e.sprite) { e.sprite.play('vitoria', { from: 5 }); e.sprite.speed = 0; } };
    this.escultura = e;
    w.text('OBRA-PRIMA!', x, this.topo - 210);
    w.spawnFx('fx-brilho', 'totem', x, this.topo - 90);
    w.sfx('letras-completas', x, 0.7);
    say(w, w.duo.leader, w.duo.leader.hid, w.duo.leader.isTama ? 'Ei! Essa sou eu!' : 'Olha a Tamá de madeira!', w.duo.leader.h + 40);
    gagDone(w, 'gag_serraria');
  }
  destroy() { this.alerta?.remove(); }
}

defineGag('gag_serraria', (w, s) => new Serraria(w, s));
