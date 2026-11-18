/** Sequenciador por compassos: agenda à frente, laço sem emenda e troca de andamento ao vivo. */
import { ganho } from './core';
import { BATERIA, INSTRUMENTOS } from './instruments';
import type { Compilada } from './notation';
import type { Parte } from '../data/music/types';

const ANTECIPA = 0.14; // segundos agendados à frente
const PADRAO_VOL: Record<Parte, number> = { melodia: 0.9, contra: 0.6, baixo: 0.85, harmonia: 0.55, bateria: 0.8 };

export type OuvinteBatida = (beat: number) => void;

export class Tocador {
  readonly saida: GainNode;
  private partes: Record<Parte, GainNode>;
  private eco: { d: DelayNode; fb: GainNode } | null = null;
  private passo = 0;
  private proximo: number;
  private batida = 0;
  parado = false;
  terminou = false;

  constructor(private c: AudioContext, private comp: Compilada, destino: AudioNode, inicio: number, private tempo: () => number, private aoBater: (b: number) => void) {
    this.saida = ganho(c, 0, destino);
    const f = comp.faixa;
    const vol = { ...PADRAO_VOL, ...(f.vol ?? {}) };
    this.partes = {
      melodia: ganho(c, vol.melodia, this.saida),
      contra: ganho(c, vol.contra, this.saida),
      baixo: ganho(c, vol.baixo, this.saida),
      harmonia: ganho(c, vol.harmonia, this.saida),
      bateria: ganho(c, vol.bateria, this.saida),
    };
    if (f.eco) {
      const d = c.createDelay(4);
      d.delayTime.value = this.durPasso() * f.eco.passos;
      const fb = ganho(c, f.eco.fb, d);
      d.connect(fb);
      const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2400;
      d.connect(filt);
      filt.connect(ganho(c, f.eco.mix, this.saida));
      this.partes.melodia.connect(d);
      this.partes.harmonia.connect(d);
      this.eco = { d, fb };
    }
    this.proximo = inicio;
  }

  durPasso(): number {
    return 60 / (this.comp.faixa.bpm * this.tempo()) / 4;
  }

  atualizaTempo(): void {
    if (this.eco && this.comp.faixa.eco) this.eco.d.delayTime.setTargetAtTime(this.durPasso() * this.comp.faixa.eco.passos, this.c.currentTime, 0.05);
  }

  /** Chamado periodicamente: agenda cada passo até o horizonte. */
  bombear(): void {
    if (this.parado || this.terminou) return;
    const agora = this.c.currentTime;
    if (this.proximo < agora - 0.25) this.proximo = agora + 0.02; // aba em segundo plano: retoma sem rajada
    const f = this.comp.faixa;
    while (this.proximo < agora + ANTECIPA) {
      const dp = this.durPasso();
      const swing = f.swing && this.passo % 2 === 1 ? f.swing * dp : 0;
      const t = this.proximo + swing;
      for (const e of this.comp.porPasso[this.passo]) {
        const ti = t + (e.passo - Math.floor(e.passo)) * dp;
        const destino = this.partes[e.parte];
        const fn = e.parte === 'bateria' ? BATERIA[e.inst as keyof typeof BATERIA] : INSTRUMENTOS[e.inst as keyof typeof INSTRUMENTOS];
        if (fn) fn(this.c, destino, ti, e.midi, e.dur * dp, e.vel);
      }
      if (this.passo % 4 === 0) {
        const b = this.batida++;
        const atraso = Math.max(0, (t - agora) * 1000);
        setTimeout(() => { if (!this.parado) this.aoBater(b); }, atraso);
      }
      this.proximo += dp;
      this.passo++;
      if (this.passo >= this.comp.total) {
        if (f.loop) this.passo = 0;
        else { this.terminou = true; break; }
      }
    }
  }

  fadeIn(seg: number): void {
    const t = this.c.currentTime;
    this.saida.gain.setValueAtTime(0.0001, t);
    if (seg <= 0.01) this.saida.gain.setValueAtTime(1, t);
    else this.saida.gain.exponentialRampToValueAtTime(1, t + seg);
  }

  parar(seg: number): void {
    this.parado = true;
    const t = this.c.currentTime;
    const g = this.saida.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.0001, g.value), t);
    g.exponentialRampToValueAtTime(0.0001, t + Math.max(0.02, seg));
    setTimeout(() => { try { this.saida.disconnect(); } catch { /* já desligado */ } }, (seg + 3) * 1000);
  }
}
