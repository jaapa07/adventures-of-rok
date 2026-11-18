/**
 * gag_selfie (1-2) — O JAVALIM DA SELFIE.
 * Um Javalim de costas para o herói tira selfies na beira do penhasco ("selfie", loop; clique a cada
 * 2,6 s). Golpe, pisão ou um empurrão (encostar andando nele) o derruba gritando ("cair"); o celular
 * fica na borda. Pegar o celular (ação/J perto) revela a FOTO engraçada da dupla: vai para o Álbum
 * (current.session.foto = true) e conta como gag.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_selfie', x, y, dir? }
 *   - x, y: pés do Javalim na beira (y = linha do chão)
 *   - dir: lado do penhasco, para onde ele olha e cai (1 = direita, padrão; -1 = esquerda).
 *     O herói deve chegar pelo lado oposto.
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import type { Hero } from '../hero';
import { Sprite } from '../../render/sprite';
import { promptFor } from '../../core/input';
import { game } from '../../core/save';
import { current } from '../session';
import { defineGag, gagDone, say, Ator, domEl, place, gagCss } from './common';

class Selfie extends Entity {
  jav!: Ator;
  cel: Ator | null = null;
  caindo = false;
  t = 0;
  cliqueT = 1.4;
  cliques = 0;
  empurraT = 0;
  dica?: HTMLElement;
  pego = false;
  celVy = 0;
  celChao = 0;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.dir = s.dir === -1 ? -1 : 1;
    this.persistent = true;
  }
  init() {
    const w = this.world;
    this.jav = w.add(new Ator(w, 'javalim', this.x, this.y, { anim: 'selfie', t: 'javalim', team: 'enemy', w: 60, h: 100, shadow: true }));
    this.jav.dir = this.dir;
    this.jav.stompable = true;
    this.jav.hitFn = (h) => { if (this.caindo) return false; this.cair(h.kind === 'pisao' ? 'pisao' : h.kind, h.dir || this.dir); return true; };
    this.jav.stompFn = () => { if (!this.caindo) this.cair('pisao', this.dir); return 'bounce'; };
  }

  update(dt: number) {
    this.t += dt;
    const w = this.world, L = w.duo.leader;
    const J = this.jav;
    if (!this.caindo) {
      J.sprite?.play('selfie');
      this.cliqueT -= dt;
      if (this.cliqueT <= 0) {
        this.cliqueT = 2.6;
        this.cliques++;
        J.sfx('selfie-click', 0.8);
        w.spawnFx('fx-brilho', 'castanha', J.x + this.dir * 34, J.y - 128, { scale: 0.8 });
        const falas = ['Sorria, Javalim!', 'Ficou ótima… mais uma!', '#penhasco #aventura', 'Agora com bico!'];
        if (this.cliques % 2 === 1 && Math.abs(L.x - J.x) < 900) say(w, J, 'javalim', falas[(this.cliques >> 1) % falas.length], 150);
      }
      // empurrão: o líder encosta nele andando na direção do penhasco
      const encosta = Math.abs(L.x - J.x) < (L.w + J.w) / 2 + 4 && Math.abs(L.y - J.y) < 40;
      const empurra = encosta && Math.sign(J.x - L.x) === Math.sign(L.b.vx || L.dir) && Math.abs(L.b.vx) > 40;
      this.empurraT = empurra ? this.empurraT + dt : 0;
      if (this.empurraT > 0.18) this.cair('outro', Math.sign(J.x - L.x) || this.dir);
    } else if (!J.dead) {
      J.vy += 1900 * dt;
      J.x += J.vx * dt; J.y += J.vy * dt;
      J.rot += J.dir * 120 * dt;
      if (J.y > w.grid.pxH + 300 || J.y - this.y > 1400) J.kill();
    }
    // celular caindo até a borda e esperando ser pego
    const C = this.cel;
    if (C && !C.dead) {
      if (C.y < this.celChao) { this.celVy += 1600 * dt; C.y = Math.min(this.celChao, C.y + this.celVy * dt); if (C.y >= this.celChao) { C.sfx('selfie-click', 0.4); this.celVy = 0; } }
      C.rot = C.y < this.celChao ? C.rot + 540 * dt : 0;
      if (Math.floor(this.t * 1.2) !== Math.floor((this.t - dt) * 1.2)) w.spawnFx('fx-brilho', 'castanha', C.x + 10, C.y - 30, { scale: 0.5 });
      const perto = Math.abs(L.x - C.x) < 110 && Math.abs(L.y - C.y) < 90;
      if (!this.dica) { this.dica = domEl(w, 'gag-fala', true); this.dica.style.fontSize = '15px'; this.dica.style.padding = '4px 10px 6px'; }
      this.dica.textContent = `${promptFor('action')}  pegar celular`;
      this.dica.style.opacity = perto ? '1' : '0';
      place(this.dica, C.x, C.y - 60, 'translate(-50%, -100%)');
    } else if (this.dica) { this.dica.remove(); this.dica = undefined; }
  }

  private cair(how: HitInfo['kind'], dir: number) {
    if (this.caindo) return;
    const w = this.world, J = this.jav;
    this.caindo = true;
    J.play('cair', { restart: true });
    J.dir = (dir >= 0 ? 1 : -1);
    J.vx = J.dir * 170; J.vy = -480;
    J.z = 8; J.stompable = false; J.persistent = true;
    J.sfx('javali-susto');
    say(w, J, 'javalim', 'AAAAAAAIIIIII!', 150, 'grito');
    w.text('CLICK!', J.x, J.y - 170, 'small');
    w.enemyKilled(J, how);
    // o celular escapa da mão e fica na borda
    const cx = this.x - J.dir * 16;
    this.cel = w.add(new Ator(w, 'celular', cx, J.y - 120, { anim: 'idle', t: 'celular', w: 40, h: 30, z: 26 }));
    this.celChao = this.y; this.celVy = -300;
    this.cel.onInteract = (h) => this.pegar(h as Hero);
  }

  private pegar(h: Hero) {
    if (this.pego || !this.cel) return false;
    this.pego = true;
    const w = this.world;
    if (current.session) current.session.foto = true;
    gagDone(w, 'gag_selfie');
    w.sfx('selfie-click', h.x);
    w.sfx('ui-confirmar', h.x, 0.7);
    w.toast('Foto nova no Álbum da Selva!', 'foto');
    say(w, h, h.hid, h.isTama ? 'Hahaha! Que foto!' : 'Ficamos lindos!', h.h + 40);
    this.cel.kill();
    this.cel = null;
    mostrarFoto(w);
    return true;
  }

  destroy() { this.dica?.remove(); }
}

/** Polaroide da "foto" que o Javalim tirou sem querer: a dupla fazendo pose e ele caindo ao fundo. */
function mostrarFoto(w: World) {
  gagCss();
  const flash = document.createElement('div'); flash.className = 'gag-flash';
  const foto = document.createElement('div'); foto.className = 'gag-foto';
  const tela = document.createElement('div'); tela.className = 'tela';
  const leg = document.createElement('div'); leg.className = 'legenda'; leg.textContent = 'Selfie no penhasco!';
  foto.append(tela, leg);
  w.stage.hud.append(flash, foto);
  const fig = game.save.figurino;
  const pose = (model: string, anim: string, x: number, y: number, k: number, flip = false, variant = 'base') => {
    const s = new Sprite(model, 'neutro', variant, tela);
    s.play(anim, { from: 3 });
    s.x = x; s.y = y; s.sx = s.sy = k; s.flip = flip; s.z = 2;
    s.render();
    return s;
  };
  pose('javalim', 'cair', 215, 120, 0.42, true);
  pose('tama', 'vitoria', 95, 262, 0.82, false, fig.tama ?? 'base');
  pose('lili', 'vitoria', 185, 262, 0.82, true, fig.lili ?? 'base');
  requestAnimationFrame(() => { flash.style.opacity = '0.9'; foto.classList.add('on'); window.setTimeout(() => { flash.style.opacity = '0'; }, 120); });
  window.setTimeout(() => { foto.classList.remove('on'); }, 3200);
  window.setTimeout(() => { flash.remove(); foto.remove(); }, 3800);
}

defineGag('gag_selfie', (w, s) => new Selfie(w, s));
