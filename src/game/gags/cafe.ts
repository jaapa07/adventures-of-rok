/**
 * gag_cafe (4-1) — A SALA DE DESCANSO.
 * Javalins em pausa para o café bloqueiam o caminho (se o herói chegar perto sem fazer nada, eles
 * levantam bravos e atacam). Interagir (ação/J) com a GARRAFA TÉRMICA troca o café por suco de jaca:
 * eles bebem, a barriga ronca e todos saem correndo para o banheiro ("correr-banheiro"), entrando um
 * de cada vez pela porta (descarga!), liberando a passagem.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_cafe', x, y, javalins: [[x, y], …], porta: [x, y], alerta? }
 *   - x, y: pés da garrafa-cafe; javalins: posições (y = chão) de quem está na pausa
 *   - porta: pés da porta do banheiro (desenhada pela gag); de preferência no mesmo chão dos javalins
 *   - alerta: distância (tiles) em que eles percebem o herói e atacam (padrão 2.5)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, gagDone, say, Ator, JavaliCena, num, px, pares, domEl, place } from './common';

interface Corredor { j: JavaliCena; atraso: number; dentro: number }

const PAPO = ['Segunda-feira de novo…', 'Esse café tá fraco.', 'O Barão disse que hoje tem hora extra.', 'Mais um golinho e eu volto pro posto.'];

class Cafe extends Entity {
  garrafa!: Ator;
  javs: JavaliCena[] = [];
  porta?: HTMLElement;
  portaXY: [number, number];
  trocou = false;
  t = 0; papoT = 2; papoI = 0;
  corredores: Corredor[] = [];
  portaAberta = 0;
  alerta: number;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    const p = pares([s.porta])[0] ?? [s.x + 8, s.y];
    this.portaXY = [px(p[0]), px(p[1])];
    this.alerta = px(num(s.alerta, 2.5));
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.garrafa = w.add(new Ator(w, 'garrafa-cafe', this.x, this.y, { anim: 'idle', t: 'garrafa-cafe', w: 50, h: 70, z: 26 }));
    this.garrafa.onInteract = () => this.trocar();
    this.porta = domEl(w, 'gag-porta');
    this.porta.style.zIndex = '12';
    pares(this.spawn.javalins).forEach(([x, y], i) => {
      const j = w.add(new JavaliCena(w, px(x), px(y), 'idle'));
      j.dir = (px(x) < this.x ? 1 : -1) as 1 | -1;
      j.persistent = true;
      j.aoDerrotar = () => { this.javs = this.javs.filter((o) => o !== j); };
      this.javs.push(j);
      void i;
    });
  }
  private trocar() {
    if (this.trocou) return false;
    const w = this.world, L = w.duo.leader;
    this.trocou = true; this.t = 0;
    this.garrafa.play('trocar', { restart: true });
    w.sfx('arma-pegar', this.x);
    w.text('SUCO DE JACA!', this.x, this.y - 120, 'small');
    say(w, L, L.hid, L.isTama ? 'Hehe… cafezinho especial.' : 'Shhh… ninguém viu nada.', L.h + 40);
    gagDone(w, 'gag_cafe');
    return true;
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader;
    const calmos = this.javs.filter((j) => !j.hostil && !j.morto);
    if (!this.trocou) {
      this.papoT -= dt;
      if (this.papoT <= 0 && calmos.length && Math.abs(L.x - this.x) < 1000) { this.papoT = 4.5; say(w, calmos[this.papoI % calmos.length], 'javalim', PAPO[this.papoI++ % PAPO.length], 140); }
      // perceberam o herói: fim da pausa!
      if (calmos.some((j) => Math.abs(L.x - j.x) < this.alerta && Math.abs(L.y - j.y) < 160)) {
        say(w, calmos[0], 'javalim', 'Intruso na copa!', 140, 'grito');
        for (const j of calmos) j.enfurecer(true);
      }
      return;
    }
    // efeito do suco de jaca
    if (this.t > 1.1 && this.t - dt <= 1.1 && calmos[0]) say(w, calmos[0], 'javalim', 'Hmm… esse café tá com gosto de… jaca?', 140);
    if (this.t > 2.6 && this.t - dt <= 2.6) {
      calmos.forEach((j, i) => {
        this.corredores.push({ j, atraso: i * 0.35, dentro: -1 });
        w.sfx('javali-grunhido', j.x, 0.8);
      });
      if (calmos[1]) say(w, calmos[1], 'javalim', 'BANHEIROOO! SAI DA FRENTE!', 140, 'grito');
      w.text('GRRRLUB…', this.x, this.y - 170, 'small');
    }
    for (const c of this.corredores) {
      const j = c.j;
      if (j.dead || j.hostil) continue;
      if (this.t - 2.6 < c.atraso) { j.play('susto'); continue; }
      if (c.dentro < 0) {
        j.play('correr-banheiro');
        const dx = this.portaXY[0] - j.x;
        j.dir = dx > 0 ? 1 : -1;
        j.x += Math.sign(dx) * Math.min(Math.abs(dx), 300 * dt);
        if (Math.abs(dx) < 6) { c.dentro = 0; this.portaAberta = 0.5; j.sfx('clank', 0.5); }
      } else {
        c.dentro += dt;
        j.alpha = Math.max(0, 1 - c.dentro / 0.25);
        if (c.dentro > 0.25 && !j.dead) {
          j.kill();
          window.setTimeout(() => w.sfx('descarga', this.portaXY[0]), 700);
        }
      }
    }
    this.portaAberta = Math.max(0, this.portaAberta - dt);
    this.porta?.classList.toggle('aberta', this.portaAberta > 0);
  }
  render() {
    if (this.porta) place(this.porta, this.portaXY[0] - 46, this.portaXY[1] - 160);
  }
  destroy() { this.porta?.remove(); }
}

defineGag('gag_cafe', (w, s) => new Cafe(w, s));
