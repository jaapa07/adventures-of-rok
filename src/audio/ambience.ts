/** Ambientes em laço: leitos de ruído filtrado, zumbidos e eventos agendados com semente fixa. */
import { fonteRuido, ganho } from './core';
import { mulberry32 } from './rng';
import { tocaPreset } from './sfxEngine';
import { AMBIENTES, SONS_AMB } from '../data/sfx';

interface Ativo {
  id: string;
  saida: GainNode;
  fontes: (OscillatorNode | AudioBufferSourceNode)[];
  proximos: number[];
  rng: () => number;
}

let atual: Ativo | null = null;
let relogio: ReturnType<typeof setInterval> | null = null;

const entre = (rng: () => number, [a, b]: [number, number]) => a + (b - a) * rng();

export function tocaAmbiente(c: AudioContext, dest: AudioNode, envio: AudioNode, id: string | null): void {
  if (atual && atual.id === id) return;
  const t = c.currentTime;
  if (atual) {
    const velho = atual;
    velho.saida.gain.cancelScheduledValues(t);
    velho.saida.gain.setValueAtTime(velho.saida.gain.value, t);
    velho.saida.gain.linearRampToValueAtTime(0, t + 1.2);
    for (const f of velho.fontes) f.stop(t + 1.3);
    setTimeout(() => { try { velho.saida.disconnect(); } catch { /* já desligado */ } }, 2000);
    atual = null;
  }
  if (!id) return;
  const def = AMBIENTES[id];
  if (!def) { console.warn('[audio] ambiente desconhecido:', id); return; }
  const saida = ganho(c, 0, dest);
  saida.gain.setValueAtTime(0, t);
  saida.gain.linearRampToValueAtTime(1, t + 1.5);
  const fontes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  def.leitos.forEach((l, i) => {
    const g = ganho(c, l.vol, saida);
    let alvo: AudioNode = g;
    if (l.pan) { const sp = c.createStereoPanner(); sp.pan.value = l.pan; g.disconnect(); g.connect(sp); sp.connect(saida); alvo = g; }
    const f = c.createBiquadFilter();
    f.type = l.filt.t; f.frequency.value = l.filt.f; f.Q.value = l.filt.q ?? 1;
    f.connect(alvo);
    const s = fonteRuido(c, l.cor, f, i * 0.53);
    fontes.push(s);
    if (l.lfo) {
      const lfo = c.createOscillator(); lfo.frequency.value = l.lfo[0];
      lfo.connect(ganho(c, l.lfo[1], f.frequency));
      fontes.push(lfo);
    }
  });
  for (const z of def.zumbidos ?? []) {
    const g = ganho(c, z.vol, saida);
    let entrada: AudioNode = g;
    if (z.filt) { const f = c.createBiquadFilter(); f.type = z.filt.t; f.frequency.value = z.filt.f; f.Q.value = z.filt.q ?? 1; f.connect(g); entrada = f; }
    const osc = c.createOscillator(); osc.type = z.onda; osc.frequency.value = z.f; osc.connect(entrada);
    fontes.push(osc);
    if (z.trem) {
      const lfo = c.createOscillator(); lfo.frequency.value = z.trem[0];
      lfo.connect(ganho(c, z.vol * z.trem[1], g.gain));
      fontes.push(lfo);
    }
  }
  for (const f of fontes) {
    const off = (f as AudioBufferSourceNode & { _off?: number })._off;
    if (off !== undefined) (f as AudioBufferSourceNode).start(t, off); else f.start(t);
  }
  const rng = mulberry32(def.semente);
  atual = { id, saida, fontes, rng, proximos: def.eventos.map((e) => t + 0.5 + entre(rng, e.cada) * 0.5) };
  if (!relogio) {
    relogio = setInterval(() => bombear(c, envio), 100);
  }
}

function bombear(c: AudioContext, envio: AudioNode): void {
  if (!atual || c.state !== 'running') return;
  const def = AMBIENTES[atual.id];
  const agora = c.currentTime;
  def.eventos.forEach((e, i) => {
    if (!atual) return;
    if (atual.proximos[i] < agora - 2) atual.proximos[i] = agora; // aba suspensa
    while (atual.proximos[i] <= agora + 0.15) {
      const som = SONS_AMB[e.som];
      if (som) tocaPreset(c, som, atual.saida, envio, { vol: entre(atual.rng, e.vol), pitch: entre(atual.rng, e.pitch), pan: entre(atual.rng, e.pan) }, 0);
      atual.proximos[i] += Math.max(0.03, entre(atual.rng, e.cada));
    }
  });
}
