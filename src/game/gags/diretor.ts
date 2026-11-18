/**
 * Diretor de gags globais (valem em TODAS as fases, sem spawn):
 *  - gag_parceiro_preso: quando o parceiro é perdido ('hero-lost'), ele aparece numa camada de fundo
 *    (DOM atrás do mundo, entre o parallax e a fase) preso numa GAIOLA carregada por 2 Javalins,
 *    acenando e fazendo careta, até 'partner-back'.
 *  - gag_morte_comica: as mortes 'queimado', 'esmagado' e 'afogado' (hero.ts) contam como gag.
 *  - gag_barao_disfarce: o chefe final emite 'barao-disfarce' {on: true} ao se disfarçar e
 *    'barao-disfarce' {on: false} (ou 'barao-revela') ao se revelar; um 'boss-hit' {id: 'barao-javardo'}
 *    nesse intervalo (ou com {disfarce: true}) ativa a gag (medalha secreta).
 *  - Clima 18.1: chuva visual (camadas de gotas animadas em CSS sobre o elemento .rain do World,
 *    usando o sprite fx-chuva quando renderizado), relâmpagos com trovão, e POÇAS no chão das
 *    regiões `chuva: true`; a Jaca (arma no chão ou arremessada) afunda nelas.
 *    Eventos: bus 'chuva' {on: boolean} ao ligar/desligar e {evento: 'jaca-afundou', x, y}.
 *
 * O diretor é uma entidade persistente criada automaticamente na primeira atualização de cada World.
 */
import { Entity } from '../entity';
import { TILE } from '../types';
import { World } from '../world';
import { T, isSolid } from '../physics';
import type { HeroId } from '../types';
import { Sprite } from '../../render/sprite';
import { VIEW_W, VIEW_H, PERSPECTIVE } from '../../render/stage';
import { anim as atlasAnim } from '../../core/assets';
import { bus } from '../../core/events';
import { gagDone, gagCss, animOf, domEl, place } from './common';

/* ------------------------------------------------------------------ */
/* Cortejo da gaiola (camada de fundo)                                  */
/* ------------------------------------------------------------------ */
const Z_FUNDO = -150;

class Cortejo {
  root: HTMLElement;
  box: HTMLElement;
  jav: Sprite[] = [];
  gaiola: Sprite;
  preso: Sprite;
  vara: HTMLElement;
  barras?: HTMLElement;
  fala: HTMLElement;
  t = 0;
  sx = VIEW_W + 140; // posição na tela
  dir: 1 | -1 = -1;
  falaT = 0;
  idx = 0;
  saindo = -1;
  groundY = VIEW_H * 0.7;
  constructor(public w: World, public hid: HeroId) {
    gagCss();
    this.root = document.createElement('div');
    this.root.className = 'gag-fundo';
    this.box = document.createElement('div');
    this.box.className = 'gag-cortejo';
    this.root.append(this.box);
    w.stage.rig.insertBefore(this.root, w.stage.world);
    const preset = w.preset;
    this.jav.push(new Sprite('javalim', preset, 'base', this.box));
    this.vara = document.createElement('div'); this.vara.className = 'gag-vara'; this.box.append(this.vara);
    this.preso = new Sprite(hid, preset, 'base', this.box);
    this.gaiola = new Sprite('gaiola', preset, 'base', this.box);
    this.jav.push(new Sprite('javalim', preset, 'base', this.box));
    this.jav.forEach((j) => j.play('andar'));
    this.gaiola.play('idle');
    this.preso.play('preso');
    if (!this.gaiola.entry) {
      // gaiola de varas desenhada em CSS enquanto o modelo não foi renderizado
      this.barras = document.createElement('div');
      this.barras.style.cssText = 'position:absolute;left:0;top:0;width:96px;height:104px;border:5px solid #5a3b1c;border-radius:10px 10px 4px 4px;background:repeating-linear-gradient(90deg,transparent 0 14px,#6e4a24 14px 19px);pointer-events:none';
      this.box.append(this.barras);
    }
    this.fala = document.createElement('div');
    this.fala.className = 'gag-fala';
    this.fala.style.opacity = '0';
    this.box.append(this.fala);
    this.groundY = Math.min(VIEW_H - 90, w.duo.leader.y - w.camY - 60);
  }
  update(dt: number) {
    this.t += dt;
    const L = this.w.duo.leader;
    const gy = Math.min(VIEW_H - 90, Math.max(VIEW_H * 0.4, L.y - this.w.camY - 60));
    this.groundY += (gy - this.groundY) * Math.min(1, dt * 1.5);
    this.sx += this.dir * 80 * dt;
    if (this.saindo < 0) {
      if (this.dir < 0 && this.sx < -260) this.dir = 1;
      else if (this.dir > 0 && this.sx > VIEW_W + 260) this.dir = -1;
    }
    // o parceiro alterna: preso → acena → careta
    this.falaT -= dt;
    if (this.falaT <= 0) {
      const passo = this.idx++ % 3;
      const nomeL = this.hid === 'tama' ? 'tama' : 'lili';
      if (passo === 0) { this.preso.play('preso'); this.falar(''); this.falaT = 2.4; }
      else if (passo === 1) { this.preso.play('vitoria', { restart: true }); this.falar(this.hid === 'tama' ? 'Ei! Aqui! Me tira daqui!' : 'Socorroooo! Aqui atrás!'); bus.emit('babble', { voice: nomeL, text: 'Me tira daqui!' }); this.falaT = 1.8; }
      else { this.preso.play('tedio-folha', { restart: true }); this.falar('Bleeeh! :P'); this.falaT = 1.6; }
    }
    for (const j of this.jav) j.update(dt);
    this.preso.update(dt); this.gaiola.update(dt);
    if (this.saindo >= 0) this.saindo += dt;
  }
  private falar(s: string) { this.fala.textContent = s; this.fala.style.opacity = s ? '1' : '0'; }
  render() {
    const f = PERSPECTIVE / (PERSPECTIVE - Z_FUNDO);
    const X = VIEW_W / 2 + (this.sx - VIEW_W / 2) / f;
    const Y = VIEW_H / 2 + (this.groundY - VIEW_H / 2) / f;
    const a = this.saindo >= 0 ? Math.max(0, 1 - this.saindo / 0.6) : Math.min(1, this.t / 0.5);
    this.root.style.transform = `translate3d(0, 0, ${Z_FUNDO}px)`;
    this.box.style.transform = `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, 0) scale(0.72)`;
    this.box.style.opacity = a.toFixed(2);
    const flip = this.dir < 0;
    const bob = (k: number) => Math.abs(Math.sin(this.t * 7 + k)) * -6;
    const [j1, j2] = this.jav;
    j1.x = -125; j1.y = bob(0); j2.x = 125; j2.y = bob(1.6);
    for (const j of this.jav) { j.flip = flip; j.z = 2; j.render(); }
    const varaY = -112 + (bob(0) + bob(1.6)) / 2;
    this.vara.style.width = '290px';
    place(this.vara, -145, varaY, `rotate(${((bob(1.6) - bob(0)) / 4).toFixed(2)}deg)`);
    this.vara.style.zIndex = '3';
    const swing = Math.sin(this.t * 3.1) * 6;
    this.gaiola.x = 0; this.gaiola.y = varaY + 120; this.gaiola.rot = swing; this.gaiola.sx = this.gaiola.sy = 0.8; this.gaiola.z = 5; this.gaiola.render();
    this.preso.x = Math.sin(this.t * 3.1) * 4; this.preso.y = varaY + 112; this.preso.sx = this.preso.sy = 0.55; this.preso.flip = !flip; this.preso.z = 4; this.preso.render();
    if (this.barras) { place(this.barras, -48, varaY + 10, `rotate(${swing.toFixed(1)}deg)`); this.barras.style.zIndex = '6'; }
    place(this.fala, 0, varaY - 10, 'translate(-50%, -100%)');
    this.fala.style.zIndex = '7';
  }
  sair() { if (this.saindo < 0) this.saindo = 0; }
  get acabou() { return this.saindo > 0.6; }
  destroy() { this.root.remove(); }
}

/* ------------------------------------------------------------------ */
/* Poças da chuva                                                       */
/* ------------------------------------------------------------------ */
class Poca extends Entity {
  el: HTMLElement;
  larg: number;
  constructor(w: World, x: number, y: number, larg: number) {
    super(w, { t: 'gag-poca', x: x / TILE, y: y / TILE });
    this.x = x; this.y = y; this.larg = larg;
    this.persistent = true;
    this.el = domEl(w, 'gag-poca');
    this.el.style.width = larg + 'px';
    this.el.style.opacity = '0';
  }
  update() {
    const chove = !!this.world.regionFlags.chuva;
    this.el.classList.toggle('seca', !chove);
    this.el.style.opacity = chove ? '1' : '0.55';
    for (const e of this.world.entities) {
      if (e.dead || e === this) continue;
      const id = e.spawn.id as string | undefined;
      if (id !== 'jaca' || (e.spawn.t !== 'arma' && e.spawn.t !== 'arremessado')) continue;
      if (Math.abs(e.x - this.x) < this.larg / 2 && Math.abs(e.y - this.y) < 26 && e.vy >= 0) this.afundar(e);
    }
  }
  private afundar(e: Entity) {
    const w = this.world;
    e.kill();
    w.spawnFx('arma-jaca', 'mundo', e.x, this.y + 4, { vy: 26, life: 1.4, fade: 1.2, loop: true, z: 14 });
    w.spawnFx('fx-agua', 'respingo', e.x, this.y);
    w.sfx('agua-entrar', e.x, 0.7);
    w.text('GLUB…', e.x, this.y - 40, 'small');
    bus.emit('chuva', { evento: 'jaca-afundou', x: e.x, y: this.y });
  }
  render() { place(this.el, this.x - this.larg / 2, this.y - 9); }
  destroy() { this.el.remove(); }
}

/* ------------------------------------------------------------------ */
/* Diretor                                                              */
/* ------------------------------------------------------------------ */
const TROVOES = [9, 13, 7, 11, 15];

/** estado do disfarce do Barão (lido por gag_barao_disfarce) */
export const estadoBarao = { disfarce: false, x: 0, y: 0 };

export class Diretor extends Entity {
  cortejo: Cortejo | null = null;
  disfarce = false;
  private offs: (() => void)[] = [];
  private chuvaDecorada = false;
  private chovendo = false;
  private pocas = false;
  private relampago?: HTMLElement;
  private trovaoT = 6;
  private trovaoI = 0;
  private flashT = 0;

  constructor(w: World) {
    super(w, { t: 'gag-diretor', x: 0, y: 0 });
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.offs.push(bus.on('hero-lost', (d) => {
      this.cortejo?.destroy();
      this.cortejo = new Cortejo(w, (d?.hero as HeroId) ?? (w.duo.leader.hid === 'tama' ? 'lili' : 'tama'));
      gagDone(w, 'gag_parceiro_preso');
    }));
    this.offs.push(bus.on('partner-back', () => this.cortejo?.sair()));
    this.offs.push(bus.on('death', (d) => { if (d?.kind === 'queimado' || d?.kind === 'esmagado' || d?.kind === 'afogado') gagDone(w, 'gag_morte_comica'); }));
    estadoBarao.disfarce = false;
    this.offs.push(bus.on('barao-disfarce', (d) => {
      this.disfarce = estadoBarao.disfarce = !(d && (d.on === false || d.ativo === false));
      if (typeof d?.x === 'number') { estadoBarao.x = d.x; estadoBarao.y = d.y ?? 0; }
    }));
    this.offs.push(bus.on('barao-revela', () => { this.disfarce = estadoBarao.disfarce = false; }));
    this.offs.push(bus.on('barao-revelar', () => { this.disfarce = estadoBarao.disfarce = false; }));
    this.offs.push(bus.on('boss-hit', (d) => {
      if (d?.id !== 'barao-javardo') return;
      if (this.disfarce || d.disfarce === true) {
        if (gagDone(w, 'gag_barao_disfarce')) { w.toast('Medalha secreta: bateu na árvore de bigode!', 'medalha'); w.text('ÁRVORE DE BIGODE?!', d.x ?? w.duo.leader.x, (d.y ?? w.duo.leader.y) - 200, 'small'); }
      }
    }));
  }

  update(dt: number) {
    if (this.cortejo) {
      this.cortejo.update(dt);
      if (this.cortejo.acabou) { this.cortejo.destroy(); this.cortejo = null; }
    }
    this.updateChuva(dt);
  }

  render() { this.cortejo?.render(); }

  /* ---------------- chuva ---------------- */
  private updateChuva(dt: number) {
    const w = this.world;
    const el = w.rainEl;
    if (el && !this.chuvaDecorada) this.decorarChuva(el);
    const on = !!el && el.classList.contains('on');
    if (on !== this.chovendo) {
      this.chovendo = on;
      bus.emit('chuva', { on });
      if (on && !this.pocas) { this.pocas = true; this.criarPocas(); }
    }
    if (on) {
      this.trovaoT -= dt;
      if (this.trovaoT <= 0) {
        this.trovaoT = TROVOES[this.trovaoI++ % TROVOES.length];
        this.flashT = 0.45;
        window.setTimeout(() => { if (!this.dead) w.sfx('trovao'); }, 600);
      }
    }
    if (this.relampago) {
      this.flashT = Math.max(0, this.flashT - dt);
      const k = this.flashT > 0.3 ? 0.8 : this.flashT > 0.2 ? 0.1 : this.flashT > 0.08 ? 0.55 : this.flashT * 4;
      this.relampago.style.opacity = k.toFixed(2);
    }
  }

  private decorarChuva(el: HTMLElement) {
    this.chuvaDecorada = true;
    gagCss();
    el.style.backgroundImage = 'none';
    const nevoa = document.createElement('div'); nevoa.className = 'gag-nevoa';
    el.append(nevoa);
    const gota = atlasAnim('fx-chuva', animOf('fx-chuva', ['gota', 'cair', 'chuva', 'idle']), 'neutro');
    if (gota) {
      // a folha de quadros da gota vira uma trama de gotas repetida e animada
      const s = document.createElement('div');
      s.className = 'gag-gotas sprite';
      s.style.backgroundImage = `url(${gota.src})`;
      s.style.backgroundSize = `${gota.cw * gota.cols * 0.6}px ${gota.ch * Math.ceil(gota.n / gota.cols) * 0.6}px`;
      el.append(s);
    }
    for (const c of ['css1', 'css2']) { const d = document.createElement('div'); d.className = 'gag-gotas ' + c; el.append(d); }
    this.relampago = document.createElement('div'); this.relampago.className = 'gag-relampago';
    el.append(this.relampago);
  }

  /** Poças em trechos planos do chão das regiões de chuva (posições derivadas do tilemap, sem sorteio). */
  private criarPocas() {
    const w = this.world, g = w.grid;
    let n = 0;
    for (const r of w.level.regions ?? []) {
      if (!r.chuva) continue;
      let ultimo = -99;
      const y0 = Math.max(1, Math.floor(r.y0 ?? 0)), y1 = Math.min(g.h - 1, Math.ceil(r.y1 ?? g.h - 1));
      for (let tx = Math.ceil(r.x0) + 2; tx <= Math.floor(r.x1) - 2 && n < 14; tx++) {
        if (tx - ultimo < 7) continue;
        for (let ty = y0; ty <= y1; ty++) {
          const chao = (x: number) => isSolid(g.at(x, ty)) && g.at(x, ty - 1) === T.EMPTY && g.at(x, ty - 2) === T.EMPTY;
          if (chao(tx - 1) && chao(tx) && chao(tx + 1)) {
            w.add(new Poca(w, tx * TILE + TILE / 2, ty * TILE, 150 + (tx % 3) * 22));
            ultimo = tx; n++;
            break;
          }
          if (g.at(tx, ty) !== T.EMPTY) break;
        }
      }
    }
  }

  destroy() {
    this.offs.forEach((f) => f());
    this.cortejo?.destroy();
  }
}

/* ------------------------------------------------------------------ */
/* Instala o diretor em cada World (sem tocar no motor)                 */
/* ------------------------------------------------------------------ */
const DIRETORES = new WeakSet<World>();
const origUpdate = World.prototype.update;
World.prototype.update = function (this: World, dt: number) {
  if (!DIRETORES.has(this)) { DIRETORES.add(this); this.add(new Diretor(this)); }
  origUpdate.call(this, dt);
};
