/** Mixer: canais música / sfx / ambiente, compressor master, ducking, filtro "submerso" e reverb. */
import { ganho } from './core';
import { impulso, PRESETS_REVERB, type PresetReverb } from './reverb';

export interface Mixer {
  c: AudioContext;
  musica: GainNode;   // entrada do canal de música
  sfx: GainNode;      // entrada do canal de efeitos
  amb: GainNode;      // entrada do canal de ambiente
  envioMusica: GainNode; // envio de reverb da música (ajustado por faixa)
  envioSfx: GainNode;
  volMusica: GainNode; volSfx: GainNode; volAmb: GainNode;
  duck: GainNode;
  lpMundo: BiquadFilterNode; lpSfx: BiquadFilterNode;
  convA: ConvolverNode; convB: ConvolverNode; gA: GainNode; gB: GainNode;
  ladoA: boolean;
  retorno: GainNode;
  preset: PresetReverb;
  /** envio extra de reverb para SFX que pedem mais ambiência (segue o volume de SFX) */
  sfxRev: GainNode;
  /** envio de reverb dos eventos de ambiente (segue o volume de ambiente) */
  ambRev: GainNode;
}

let mx: Mixer | null = null;

export function mixer(c: AudioContext): Mixer {
  if (mx && mx.c === c) return mx;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.22;
  const master = ganho(c, 0.92, c.destination);
  comp.connect(master);

  const lpMundo = c.createBiquadFilter();
  lpMundo.type = 'lowpass'; lpMundo.frequency.value = 20000; lpMundo.Q.value = 0.7;
  lpMundo.connect(comp);
  const lpSfx = c.createBiquadFilter();
  lpSfx.type = 'lowpass'; lpSfx.frequency.value = 20000; lpSfx.Q.value = 0.5;
  lpSfx.connect(comp);

  const volMusica = ganho(c, 0.8, lpMundo);
  const duck = ganho(c, 1, volMusica);
  const musica = ganho(c, 0.6, duck);
  const volAmb = ganho(c, 0.7, lpMundo);
  const amb = ganho(c, 1, volAmb);
  const volSfx = ganho(c, 0.9, lpSfx);
  const sfx = ganho(c, 1, volSfx);

  const retorno = ganho(c, PRESETS_REVERB.mata.ret, lpMundo);
  const gA = ganho(c, 1, retorno);
  const gB = ganho(c, 0, retorno);
  const convA = c.createConvolver(); convA.buffer = impulso(c, 'mata'); convA.connect(gA);
  const convB = c.createConvolver(); convB.connect(gB);
  const entradaRev = c.createGain();
  entradaRev.connect(convA); entradaRev.connect(convB);
  const envioMusica = ganho(c, 0.3, entradaRev);
  volMusica.connect(envioMusica);
  const envioSfx = ganho(c, 0.16, entradaRev);
  volSfx.connect(envioSfx);
  const envioAmb = ganho(c, 0.2, entradaRev);
  volAmb.connect(envioAmb);

  const sfxRev = ganho(c, 0.9, entradaRev);
  const ambRev = ganho(c, 0.7, entradaRev);
  mx = { c, musica, sfx, amb, envioMusica, envioSfx, volMusica, volSfx, volAmb, duck, lpMundo, lpSfx, convA, convB, gA, gB, ladoA: true, retorno, preset: 'mata', sfxRev, ambRev };
  return mx;
}

export function trocaReverb(m: Mixer, p: PresetReverb): void {
  if (m.preset === p) return;
  m.preset = p;
  const t = m.c.currentTime;
  const novo = m.ladoA ? m.convB : m.convA;
  const gNovo = m.ladoA ? m.gB : m.gA;
  const gVelho = m.ladoA ? m.gA : m.gB;
  novo.buffer = impulso(m.c, p);
  gNovo.gain.cancelScheduledValues(t);
  gVelho.gain.cancelScheduledValues(t);
  gNovo.gain.setValueAtTime(gNovo.gain.value, t);
  gVelho.gain.setValueAtTime(gVelho.gain.value, t);
  gNovo.gain.linearRampToValueAtTime(1, t + 0.6);
  gVelho.gain.linearRampToValueAtTime(0, t + 0.6);
  m.retorno.gain.setTargetAtTime(PRESETS_REVERB[p].ret, t, 0.2);
  m.ladoA = !m.ladoA;
}

export function submerso(m: Mixer, on: boolean): void {
  const t = m.c.currentTime;
  m.lpMundo.frequency.cancelScheduledValues(t);
  m.lpSfx.frequency.cancelScheduledValues(t);
  m.lpMundo.frequency.setValueAtTime(m.lpMundo.frequency.value, t);
  m.lpSfx.frequency.setValueAtTime(m.lpSfx.frequency.value, t);
  m.lpMundo.frequency.exponentialRampToValueAtTime(on ? 620 : 20000, t + (on ? 0.25 : 0.45));
  m.lpSfx.frequency.exponentialRampToValueAtTime(on ? 1700 : 20000, t + (on ? 0.25 : 0.45));
  m.lpMundo.Q.setTargetAtTime(on ? 2.2 : 0.7, t, 0.1);
}

export function abaixaMusica(m: Mixer, ms: number): void {
  const t = m.c.currentTime;
  const g = m.duck.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.setTargetAtTime(0.2, t, 0.04);
  g.setTargetAtTime(1, t + Math.max(0.05, ms / 1000), 0.3);
}

export function volumes(m: Mixer, v: { musica: number; sfx: number; ambiente: number }): void {
  const t = m.c.currentTime;
  const cl = (x: number) => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
  const curva = (x: number) => cl(x) * cl(x) * 0.25 + cl(x) * 0.75;
  m.volMusica.gain.setTargetAtTime(curva(v.musica) * 0.8, t, 0.05);
  m.volSfx.gain.setTargetAtTime(curva(v.sfx) * 0.9, t, 0.05);
  m.sfxRev.gain.setTargetAtTime(curva(v.sfx) * 0.9, t, 0.05);
  m.volAmb.gain.setTargetAtTime(curva(v.ambiente) * 0.7, t, 0.05);
  m.ambRev.gain.setTargetAtTime(curva(v.ambiente) * 0.7, t, 0.05);
}
