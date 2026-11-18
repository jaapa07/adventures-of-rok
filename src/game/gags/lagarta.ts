/**
 * gag_lagarta (4-3) — A LAGARTA-TRATOR.
 * Ao passar da coluna `x`, a câmera roteirizada (world.scriptCam) recua e INCLINA em CSS 3D mostrando
 * a Lagarta-Trator gigante na camada de trás, ainda pequena e enevoada, avançando até a pista da
 * dupla (2,4 s de cena, herói parado). Começa a perseguição: ela anda a `vel` px/s destruindo tudo
 * atrás (explosões, lascas, poeira, tremor, faixa de destroços fumegantes), a câmera segue à frente
 * do herói ainda inclinada. Encostar nela = morte "esmagado". Chegar à coluna `ate` encerra: ela
 * trava e solta fumaça (gag ativada).
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_lagarta', x, y, ate, vel?, atras?, frente? }
 *   - x: coluna-gatilho; y: linha do chão da perseguição; ate: coluna onde a perseguição termina
 *   - vel: px/s (padrão 250, a Tamá corre a 470); atras: tiles atrás do herói onde ela surge (padrão 9)
 *   - frente: px do centro do sprite até o para-choque (padrão 190)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, gagDone, say, Ator, num, px, domEl, place, fx } from './common';

type Estado = 'espera' | 'cena' | 'caca' | 'fim';
const CENA = 2.4;

class Lagarta extends Entity {
  estado: Estado = 'espera';
  maq: Ator | null = null;
  t = 0; somT = 0; fxT = 0; fxI = 0;
  ate: number; vel: number; atras: number; frente: number; chao: number;
  rastro?: HTMLElement;
  x0 = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.chao = px(s.y);
    this.ate = px(num(s.ate, s.x + 80));
    this.vel = num(s.vel, 250);
    this.atras = px(num(s.atras, 9));
    this.frente = num(s.frente, 190);
    this.persistent = true;
  }
  private comecar() {
    const w = this.world, L = w.duo.leader;
    this.estado = 'cena'; this.t = 0;
    this.x0 = L.x - this.atras;
    this.maq = w.add(new Ator(w, 'lagarta-trator', this.x0, this.chao, { anim: 'idle', t: 'lagarta-trator', team: 'enemy', w: 380, h: 300, z: 6 }));
    this.maq.persistent = true;
    this.maq.dir = 1;
    this.rastro = domEl(w, 'gag-rastro');
    this.rastro.style.cssText += ';position:absolute;left:0;top:0;height:300px;z-index:4;pointer-events:none;background:linear-gradient(180deg,rgba(40,30,30,0) 0%,rgba(50,40,36,.55) 45%,rgba(26,18,14,.9) 100%);border-radius:0 120px 0 0;';
    L.setState('cutscene');
    w.sfx('chefe-rugido', this.x0);
    say(w, L, L.hid, L.isTama ? 'Que barulho é esse…?' : 'Tamá… olha pra trás…', L.h + 40);
  }
  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader;
    if (this.estado === 'espera') { if (L.x > this.x && Math.abs(L.y - this.chao) < 500 && L.state !== 'dead') this.comecar(); return; }
    const M = this.maq!;
    if (this.estado === 'fim') { if (this.t > 2) w.scriptCam = null; return; }
    if (L.state === 'dead') { this.estado = 'fim'; this.t = 0; M.play('parar'); return; }
    this.somT -= dt;
    if (this.somT <= 0) { this.somT = 1.1; w.sfx('trator-motor', M.x, 0.9); }

    if (this.estado === 'cena') {
      const k = Math.max(0, 1 - this.t / CENA); // 1 = longe, 0 = na pista
      M.scale = 0.42 + 0.58 * (1 - k);
      M.oy = -k * 190;
      M.filter = `brightness(${(0.5 + 0.5 * (1 - k)).toFixed(2)}) blur(${(k * 2.5).toFixed(1)}px)`;
      M.x = this.x0 + (1 - k) * 60;
      w.scriptCam = { x: (M.x + L.x) / 2, y: L.y - 230, zoom: 0.8, tilt: [11, -18] };
      w.shake(2 + (1 - k) * 4, 120);
      if (this.t > CENA) {
        this.estado = 'caca'; this.t = 0;
        M.scale = 1; M.oy = 0; M.filter = ''; M.touchHurts = false;
        if (L.state === 'cutscene') L.setState('normal');
        w.text('CORRE!!!', L.x, L.y - 220);
        say(w, L, L.hid, 'CORREEEE!', L.h + 40, 'grito');
      }
    } else if (this.estado === 'caca') {
      const dist = L.x - M.x;
      const v = this.vel * (dist > 1000 ? 1.35 : 1);
      M.x += v * dt;
      M.rot = Math.sin(this.t * 9) * 0.8;
      w.scriptCam = { x: L.x + 170, y: L.y - 150, zoom: 0.92, tilt: [6, -9] };
      w.shake(3, 100);
      // destrói o cenário atrás (sempre na frente da máquina, sequência fixa de efeitos)
      this.fxT -= dt;
      if (this.fxT <= 0) {
        this.fxT = 0.3;
        const fx0 = M.x + this.frente - 30, i = this.fxI++;
        if (i % 3 === 0) fx(w, 'fx-explosao', ['pequena'], fx0, this.chao - 40 - (i % 2) * 70);
        if (i % 3 === 1) fx(w, 'fx-lascas', [i % 2 ? 'madeira' : 'pedra'], fx0, this.chao - 60, { scale: 1.3 });
        if (i % 3 === 2) fx(w, 'fx-folhas', ['folha' + ((i % 6) + 1)], fx0, this.chao - 160, { vx: -120, vy: -200, gravity: 300, life: 1.4, fade: 0.5, loop: true });
        fx(w, 'fx-poeira', ['aterrissar'], M.x - 120, this.chao, { scale: 1.6 });
        if (i % 4 === 0) w.sfx(i % 8 === 0 ? 'madeira-quebrar' : 'pedra-quebrar', fx0, 0.7);
      }
      // esmaga quem encostar no para-choque
      if (L.x - L.w / 2 < M.x + this.frente && Math.abs(L.y - this.chao) < 260) {
        L.die('esmagado');
        w.shake(10, 400);
      }
      if (L.x >= this.ate) {
        this.estado = 'fim'; this.t = 0;
        M.play('parar', { restart: true });
        w.sfx('chefe-explosao', M.x);
        for (let k = 0; k < 4; k++) fx(w, 'fx-fumaca', ['derrota'], M.x - 120 + k * 80, this.chao - 160 - (k % 2) * 60, { scale: 1.6 });
        w.text('CRÉC… PUFF!', M.x, this.chao - 340);
        say(w, L, L.hid, 'Ufa! Ficou entalada!', L.h + 40);
        gagDone(w, 'gag_lagarta');
      }
    }
  }
  render() {
    if (this.rastro && this.maq) {
      const x1 = this.maq.x - 100;
      const x0 = Math.min(x1, this.x0 - 200);
      this.rastro.style.width = Math.max(0, x1 - x0).toFixed(0) + 'px';
      place(this.rastro, x0, this.chao - 300);
      this.rastro.style.opacity = this.estado === 'cena' ? '0' : '1';
    }
  }
  destroy() { this.rastro?.remove(); if (this.estado !== 'espera' && this.estado !== 'fim') this.world.scriptCam = null; }
}

defineGag('gag_lagarta', (w, s) => new Lagarta(w, s));
