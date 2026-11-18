/**
 * gag_morcego_dj (2-3) — O MORCEGO DJ.
 * Um morcego de fones toca ("tocar") e os Javalins da pista dançam ("dancar") no ritmo da música
 * (batida da faixa via onBeat; sem áudio, um relógio próprio de 120 BPM). A pista acende a cada
 * batida e notas musicais sobem do toca-discos. Atacar (golpe ou pisão) NO COMPASSO derruba o
 * dançarino; fora do ritmo o DJ arranha o disco e todos acordam bravos e atacam.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_morcego_dj', x, y, x0, x1, javalins: [[x, y], …] }
 *   - x, y: pés do morcego DJ (atrás do toca-discos)
 *   - x0..x1: colunas da pista de dança (iluminada no chão, na linha do primeiro javalim)
 *   - javalins: posições (tiles, y = linha do chão) dos dançarinos
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, gagDone, say, Ator, JavaliCena, Batida, num, px, pares, domEl, place, fx } from './common';

const CORES = ['#ff3d9a', '#3dd6ff', '#ffe03d', '#7dff6a', '#b06bff'];

class MorcegoDJ extends Entity {
  dj!: Ator;
  dancers: JavaliCena[] = [];
  beat!: Batida;
  pista?: HTMLElement;
  celulas: HTMLElement[] = [];
  x0: number; x1: number; chao: number;
  bravos = false;
  fim = false;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.x0 = px(num(s.x0, s.x - 6)); this.x1 = px(num(s.x1, s.x + 6));
    const jv = pares(s.javalins);
    this.chao = jv.length ? px(jv[0][1]) : this.y;
    this.activeMargin = (this.x1 - this.x0) / 2 + 800;
    this.x = (this.x0 + this.x1) / 2;
  }
  init() {
    const w = this.world;
    this.beat = new Batida(w);
    this.dj = w.add(new Ator(w, 'morcego-dj', px(this.spawn.x), px(this.spawn.y), { anim: 'tocar', t: 'npc', w: 90, h: 120, z: 19 }));
    this.dj.activeMargin = 1200;
    for (const [x, y] of pares(this.spawn.javalins)) {
      const j = w.add(new JavaliCena(w, px(x), px(y), 'dancar'));
      j.dir = (x * 64 < this.dj.x ? 1 : -1) as 1 | -1;
      j.stompable = true;
      j.limites = [this.x0 - 400, this.x1 + 400];
      j.aoGolpeCena = () => {
        if (this.beat.noTempo(0.3, 0.16)) {
          w.text('NO RITMO!', j.x, j.y - 160);
          if (gagDone(w, 'gag_morcego_dj')) say(w, this.dj, 'javalim', 'Isso! Sente a batida!', 140);
          return false; // deixa derrotar
        }
        this.acordar(j);
        return true;
      };
      j.aoDerrotar = () => { this.dancers = this.dancers.filter((d) => d !== j); };
      this.dancers.push(j);
    }
    this.pista = domEl(w, 'gag-pista');
    const n = Math.max(1, Math.round((this.x1 - this.x0) / 64));
    for (let i = 0; i < n; i++) { const c = document.createElement('i'); this.pista.append(c); this.celulas.push(c); }
    this.pista.style.zIndex = '6';
  }
  private acordar(quem: JavaliCena) {
    const w = this.world;
    if (!this.bravos) {
      this.bravos = true;
      w.sfx('dj-scratch', this.dj.x);
      w.text('FORA DO RITMO!', quem.x, quem.y - 160);
      say(w, this.dj, 'javalim', 'Ei! Atravessou o ritmo!', 140, 'grito');
    }
    for (const d of this.dancers) d.enfurecer(true);
  }
  update(dt: number) {
    const w = this.world;
    const b = this.beat;
    if (b.bateu()) {
      const n = b.num;
      this.dj.pulse(0.6);
      for (const d of this.dancers) if (!d.hostil) d.pulse(1);
      this.celulas.forEach((c, i) => {
        const on = (i + n) % 3 === 0 || (n % 4 === 0 && i % 2 === 0);
        c.classList.toggle('on', on);
        c.style.color = CORES[(i + n) % CORES.length];
      });
      if (n % 2 === 0) fx(w, 'fx-notas', ['notas', 'idle'], this.dj.x + 20, this.dj.y - 130, { vy: -40, life: 1.6, fade: 0.5 });
      if (n % 8 === 0 && !this.bravos && Math.abs(w.duo.leader.x - this.dj.x) < 900) w.sfx('dj-scratch', this.dj.x, 0.5);
    }
    if (b.fase > 0.45) this.celulas.forEach((c) => c.classList.remove('on'));
    for (const d of this.dancers) if (!d.hostil) { d.play('dancar'); d.touchHurts = false; }
    if (!this.fim && this.dancers.length === 0) {
      this.fim = true;
      say(w, this.dj, 'javalim', this.bravos ? 'Pista vazia… bora de lenta.' : 'Valeu, plateia! Tá contratado!', 140);
    }
  }
  render() {
    if (this.pista) place(this.pista, this.x0 + 2, this.chao - 8);
  }
  destroy() { this.beat?.destroy(); this.pista?.remove(); }
}

defineGag('gag_morcego_dj', (w, s) => new MorcegoDJ(w, s));
