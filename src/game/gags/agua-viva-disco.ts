/**
 * gag_agua_viva_disco (3-4) — A PISTA DAS ÁGUAS-VIVAS-NÉON.
 * Um corredor de águas-vivas em faixas horizontais piscando no ritmo da música (onBeat; sem áudio,
 * 120 BPM). Aceso = queima ao encostar. No compasso (primeira metade de cada batida), as águas-vivas
 * da FAIXA SEGURA apagam e dá para passar por elas; a faixa segura muda a cada compasso (4 batidas)
 * e a próxima pisca na última batida como aviso. Luzes de boate varrem o corredor.
 * Atravessar o corredor inteiro ativa a gag.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_agua_viva_disco', x, y, x0, x1, linhas: [y, …], passo?, faixas? }
 *   - x0..x1: colunas do corredor; linhas: linhas (tiles) das faixas de águas-vivas, de cima para baixo
 *   - passo: colunas entre águas-vivas na faixa (padrão 2)
 *   - faixas: sequência de índices da faixa segura por compasso (padrão [0, 1, 2, 1] limitada às linhas)
 *   - x, y: referência (centro do corredor)
 */
import { Entity } from '../entity';
import type { EntitySpawn } from '../types';
import type { World } from '../world';
import { defineGag, gagDone, say, Ator, Batida, num, px, domEl, place } from './common';

const CORES = ['#ff3d9a', '#3dd6ff', '#ffe03d', '#b06bff'];
const HUE = [300, 190, 50, 260];

class DiscoAguaViva extends Entity {
  beat!: Batida;
  faixas: Ator[][] = [];
  seq: number[];
  x0: number; x1: number; topo: number; base: number;
  luzes: HTMLElement[] = [];
  entrou = false;
  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.x0 = px(num(s.x0, s.x - 10)); this.x1 = px(num(s.x1, s.x + 10));
    const linhas = (Array.isArray(s.linhas) ? s.linhas : [s.y - 4, s.y - 2.5, s.y - 1]).filter((v): v is number => typeof v === 'number');
    this.spawn.linhas = linhas;
    const nf = Math.max(1, linhas.length);
    const pad = (Array.isArray(s.faixas) ? s.faixas : [0, 1, 2, 1]).filter((v): v is number => typeof v === 'number');
    this.seq = (pad.length ? pad : [0]).map((v) => Math.max(0, Math.min(nf - 1, Math.round(v))));
    this.topo = px(Math.min(...linhas)) - 120; this.base = px(Math.max(...linhas)) + 40;
    this.x = (this.x0 + this.x1) / 2;
    this.activeMargin = (this.x1 - this.x0) / 2 + 600;
  }
  init() {
    const w = this.world;
    this.beat = new Batida(w);
    const passo = Math.max(1, num(this.spawn.passo, 2));
    (this.spawn.linhas as number[]).forEach((ly, r) => {
      const faixa: Ator[] = [];
      for (let c = this.x0 / 64 + 1 + (r % 2) * (passo / 2); c * 64 < this.x1 - 32; c += passo) {
        const a = w.add(new Ator(w, 'agua-viva', c * 64 + 32, px(ly), { anim: 'idle', t: 'agua-viva', team: 'enemy', w: 46, h: 54, z: 23 }));
        a.activeMargin = 1500;
        a.touchHurts = true;
        a.luz = () => (a.touchHurts ? { x: a.x, y: a.y - 32, r: 120 } : null);
        faixa.push(a);
      }
      this.faixas.push(faixa);
    });
    for (let i = 0; i < 3; i++) {
      const el = domEl(w, 'gag-disco', true);
      el.style.width = '360px'; el.style.height = (this.base - this.topo) + 'px';
      this.luzes.push(el);
    }
  }
  update(dt: number) {
    const w = this.world, L = w.duo.leader, b = this.beat;
    const n = b.num, fase = b.fase;
    const compasso = Math.floor(n / 4);
    const segura = this.seq[compasso % this.seq.length];
    const proxima = this.seq[(compasso + 1) % this.seq.length];
    const anterior = this.seq[(compasso + this.seq.length - 1) % this.seq.length];
    const tempo = ((n % 4) + 4) % 4;
    const bateu = b.bateu();
    this.faixas.forEach((faixa, r) => {
      for (const a of faixa) {
        // a faixa segura fica apagada o compasso inteiro; a próxima apaga dois tempos antes e a anterior só
        // reacende depois do 1º tempo: sobra 1,5 s com as duas apagadas para a dupla trocar de faixa nadando
        const entre = (a0: number, a1: number) => r >= Math.min(a0, a1) && r <= Math.max(a0, a1);
        const apaga = r === segura || (tempo >= 2 && entre(segura, proxima)) || (tempo === 0 && entre(anterior, segura));
        a.touchHurts = !apaga;
        if (bateu) a.pulse(0.7);
        const aviso = tempo === 1 && r === proxima && r !== segura && Math.floor(fase * 8) % 2 === 0;
        a.filter = apaga ? 'brightness(0.35) saturate(0.4)' : `brightness(${aviso ? 1.8 : 1.25}) saturate(1.6) hue-rotate(${HUE[(n + r) % HUE.length]}deg)`;
        a.alpha = apaga ? 0.55 : 1;
        a.oy = Math.sin(w.time * 2.4 + a.x * 0.02) * 8;
      }
    });
    // luzes de boate varrendo o corredor
    this.luzes.forEach((el, i) => {
      const k = (b.pos / 4 + i / 3) % 1;
      const x = this.x0 + k * (this.x1 - this.x0 - 360);
      el.style.background = `radial-gradient(ellipse at 50% 50%, ${CORES[(n + i) % CORES.length]}66, transparent 65%)`;
      el.style.opacity = (0.5 + (1 - fase) * 0.5).toFixed(2);
      place(el, x, this.topo);
    });
    if (bateu && n % 4 === 0 && Math.abs(L.x - this.x) < (this.x1 - this.x0) / 2 + 300) w.sfx('cristal-tinido', this.x, 0.35);
    // atravessar o corredor
    if (L.x > this.x0 && L.x < this.x0 + 192) this.entrou = true;
    if (this.entrou && L.x > this.x1 - 64) {
      this.entrou = false;
      if (gagDone(w, 'gag_agua_viva_disco')) { w.text('QUE PASSINHO!', L.x, L.y - 200); say(w, L, L.hid, L.isTama ? 'Eu nasci pra dançar!' : 'Um, dois, três… passei!', L.h + 40); }
    }
  }
  destroy() { this.beat?.destroy(); this.luzes.forEach((l) => l.remove()); }
}

defineGag('gag_agua_viva_disco', (w, s) => new DiscoAguaViva(w, s));
