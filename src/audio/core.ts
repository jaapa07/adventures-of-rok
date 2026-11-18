/** Núcleo do motor: contexto de áudio, buffers de ruído e utilidades de envelope. */
import { mulberry32 } from './rng';

let ctx: AudioContext | null = null;

export function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const C = W.AudioContext ?? W.webkitAudioContext;
  if (!C) return null;
  ctx = new C({ latencyHint: 'interactive' });
  return ctx;
}

export function ativo(): AudioContext | null {
  return ctx && ctx.state === 'running' ? ctx : null;
}

export const mtof = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

export type CorRuido = 'branco' | 'rosa' | 'marrom';
const ruidos = new Map<string, AudioBuffer>();

/** Buffers de ruído gerados com semente fixa (determinísticos). */
export function ruido(c: AudioContext, cor: CorRuido, segundos = 2): AudioBuffer {
  const chave = cor + segundos;
  const pronto = ruidos.get(chave);
  if (pronto) return pronto;
  const n = Math.floor(c.sampleRate * segundos);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  const r = mulberry32(cor === 'branco' ? 101 : cor === 'rosa' ? 202 : 303);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, ult = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    if (cor === 'branco') d[i] = w;
    else if (cor === 'rosa') {
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    } else {
      ult = (ult + 0.02 * w) / 1.02;
      d[i] = ult * 3.5;
    }
  }
  // costura suave nas pontas para laços sem estalo
  const borda = Math.min(512, n >> 4);
  for (let i = 0; i < borda; i++) {
    const k = i / borda;
    d[n - borda + i] = d[n - borda + i] * (1 - k) + d[i] * k;
  }
  ruidos.set(chave, buf);
  return buf;
}

const curvas = new Map<number, Float32Array>();
/** Curva de saturação para WaveShaper. */
export function curvaDist(k: number): Float32Array {
  const pronta = curvas.get(k);
  if (pronta) return pronta;
  const n = 1024;
  const cv = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    cv[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  curvas.set(k, cv);
  return cv;
}

export function ganho(c: AudioContext, v: number, dest?: AudioNode | AudioParam): GainNode {
  const g = c.createGain();
  g.gain.value = v;
  if (dest instanceof AudioParam) g.connect(dest);
  else if (dest) g.connect(dest);
  return g;
}

export function oscilador(c: AudioContext, tipo: OscillatorType, f: number, dest: AudioNode): OscillatorNode {
  const o = c.createOscillator();
  o.type = tipo;
  o.frequency.value = f;
  o.connect(dest);
  return o;
}

export function filtro(c: AudioContext, tipo: BiquadFilterType, f: number, q: number, dest: AudioNode): BiquadFilterNode {
  const b = c.createBiquadFilter();
  b.type = tipo;
  b.frequency.value = f;
  b.Q.value = q;
  b.connect(dest);
  return b;
}

/** Fonte de ruído tocando um trecho aleatório-determinístico do buffer. */
export function fonteRuido(c: AudioContext, cor: CorRuido, dest: AudioNode, offset = 0): AudioBufferSourceNode {
  const s = c.createBufferSource();
  s.buffer = ruido(c, cor);
  s.loop = true;
  s.loopStart = 0;
  s.loopEnd = s.buffer.duration;
  s.connect(dest);
  (s as AudioBufferSourceNode & { _off?: number })._off = offset % s.buffer.duration;
  return s;
}

/** Envelope percussivo: ataque linear e queda exponencial. */
export function envPerc(p: AudioParam, t: number, pico: number, ataque: number, queda: number): void {
  p.setValueAtTime(0.0001, t);
  p.linearRampToValueAtTime(Math.max(0.0002, pico), t + ataque);
  p.exponentialRampToValueAtTime(0.0001, t + ataque + queda);
}

/** Envelope sustentado (ADSR simplificado). Retorna o instante final. */
export function envSus(p: AudioParam, t: number, pico: number, ataque: number, dur: number, sustain: number, release: number): number {
  const fimAt = t + Math.min(ataque, dur);
  p.setValueAtTime(0.0001, t);
  p.linearRampToValueAtTime(Math.max(0.0002, pico), fimAt);
  const sus = Math.max(0.0002, pico * sustain);
  p.setTargetAtTime(sus, fimAt, Math.max(0.01, ataque * 0.6));
  const fimNota = Math.max(fimAt + 0.005, t + dur);
  p.setValueAtTime(sus, fimNota);
  p.exponentialRampToValueAtTime(0.0001, fimNota + release);
  return fimNota + release;
}

export function inicia(nos: (OscillatorNode | AudioBufferSourceNode)[], t: number, fim: number): void {
  for (const n of nos) {
    const off = (n as AudioBufferSourceNode & { _off?: number })._off;
    if (off !== undefined) (n as AudioBufferSourceNode).start(t, off);
    else n.start(t);
    n.stop(fim + 0.05);
  }
}
