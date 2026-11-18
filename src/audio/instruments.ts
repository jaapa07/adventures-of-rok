/** Instrumentos sintetizados (melódicos e percussão). Cada nota cria seus próprios nós e se desliga sozinha. */
import type { InstId, PecaId } from '../data/music/types';
import { curvaDist, envPerc, envSus, filtro, fonteRuido, ganho, inicia, mtof, oscilador } from './core';

export type Instrumento = (c: AudioContext, out: AudioNode, t: number, midi: number, dur: number, vel: number) => void;

function vibrato(c: AudioContext, alvo: AudioParam[], t: number, fim: number, taxa: number, cents: number, atraso: number): OscillatorNode {
  const lfo = c.createOscillator();
  lfo.frequency.value = taxa;
  const prof = c.createGain();
  prof.gain.setValueAtTime(0, t);
  prof.gain.linearRampToValueAtTime(cents, t + atraso);
  lfo.connect(prof);
  for (const a of alvo) prof.connect(a);
  lfo.start(t); lfo.stop(fim + 0.05);
  return lfo;
}

// ---------------------------------------------------------------- melódicos
const marimba: Instrumento = (c, out, t, m, _d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const queda = Math.min(1.4, 0.25 + 90 / f);
  envPerc(g.gain, t, 0.55 * v, 0.003, queda);
  const o1 = oscilador(c, 'sine', f, g);
  const g2 = ganho(c, 0, out); envPerc(g2.gain, t, 0.16 * v, 0.002, queda * 0.25);
  const o2 = oscilador(c, 'sine', f * 3.93, g2);
  const g3 = ganho(c, 0, out); envPerc(g3.gain, t, 0.05 * v, 0.001, 0.05);
  const o3 = oscilador(c, 'sine', f * 9.24, g3);
  inicia([o1, o2, o3], t, t + queda + 0.02);
};

const berimbau: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = t + Math.min(Math.max(d, 0.25), 1.1);
  envPerc(g.gain, t, 0.42 * v, 0.004, fim - t);
  // a cabaça abre e fecha contra a barriga: filtro passa-baixa em "uá"
  const lp = filtro(c, 'lowpass', 700, 6, g);
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.exponentialRampToValueAtTime(2600, t + 0.09);
  lp.frequency.exponentialRampToValueAtTime(750, t + 0.32);
  const o1 = oscilador(c, 'sawtooth', f, lp);
  const o2 = oscilador(c, 'triangle', f * 2.005, lp);
  // o dobrão encosta no arame: pequena subida de altura no ataque
  for (const o of [o1, o2]) { o.detune.setValueAtTime(-40, t); o.detune.linearRampToValueAtTime(0, t + 0.04); }
  // chiado da baqueta no arame
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.12 * v, 0.001, 0.03);
  const n = fonteRuido(c, 'branco', filtro(c, 'bandpass', 3800, 1.5, gn), m * 0.013);
  inicia([o1, o2, n], t, fim);
};

const cordas: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.13 * v, 0.09, d, 0.85, 0.32);
  const lp = filtro(c, 'lowpass', 1600 + v * 1800, 0.6, g);
  const os = [-9, 0, 8].map((dt) => { const o = oscilador(c, 'sawtooth', f, lp); o.detune.value = dt; return o; });
  const lfo = vibrato(c, os.map((o) => o.detune), t, fim, 5.3, 7, 0.35);
  inicia(os, t, fim);
  void lfo;
};

const flauta: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.3 * v, 0.05, d, 0.8, 0.14);
  const lp = filtro(c, 'lowpass', f * 5, 0.5, g);
  const o1 = oscilador(c, 'sine', f, lp);
  const g2 = ganho(c, 0.12, lp);
  const o2 = oscilador(c, 'triangle', f * 2, g2);
  vibrato(c, [o1.detune, o2.detune], t, fim, 5.1, 12, 0.28);
  // sopro: ruído no formante da nota + "chiff" no ataque
  const gs = ganho(c, 0, out); envSus(gs.gain, t, 0.05 * v, 0.03, d, 0.45, 0.1);
  const s = fonteRuido(c, 'branco', filtro(c, 'bandpass', f * 2, 3, gs), m * 0.017);
  const gc = ganho(c, 0, out); envPerc(gc.gain, t, 0.08 * v, 0.004, 0.05);
  const ch = fonteRuido(c, 'branco', filtro(c, 'highpass', 2500, 0.7, gc), m * 0.021);
  inicia([o1, o2, s, ch], t, fim);
};

const pad: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.09 * v, 0.55, d, 0.9, 1.1);
  const lp = filtro(c, 'lowpass', 900, 0.8, g);
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(1300, t + Math.min(d, 2));
  const a = oscilador(c, 'sawtooth', f, lp); a.detune.value = -11;
  const b = oscilador(c, 'sawtooth', f, lp); b.detune.value = 12;
  const s = oscilador(c, 'triangle', f / 2, lp);
  inicia([a, b, s], t, fim);
};

const padBrilho: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.08 * v, 0.4, d, 0.85, 1.6);
  const lp = filtro(c, 'lowpass', 3200, 2, g);
  const a = oscilador(c, 'triangle', f, lp); a.detune.value = -6;
  const b = oscilador(c, 'square', f, ganho(c, 0.25, lp)); b.detune.value = 7;
  const s = oscilador(c, 'sine', f * 2, ganho(c, 0.35, lp));
  vibrato(c, [a.detune, b.detune], t, fim, 0.7, 9, 0.6);
  inicia([a, b, s], t, fim);
};

const baixo: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.5 * v, 0.006, d * 0.95, 0.6, 0.08);
  const lp = filtro(c, 'lowpass', 900, 3, g);
  lp.frequency.setValueAtTime(1100, t);
  lp.frequency.exponentialRampToValueAtTime(260, t + 0.18);
  const o1 = oscilador(c, 'sine', f, g);
  const o2 = oscilador(c, 'square', f, ganho(c, 0.35, lp));
  inicia([o1, o2], t, fim);
};

const baixoSub: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.55 * v, 0.12, d, 0.85, 0.6);
  const o1 = oscilador(c, 'sine', f, g);
  const lp = filtro(c, 'lowpass', 240, 1, g);
  const o2 = oscilador(c, 'triangle', f * 2, ganho(c, 0.25, lp));
  inicia([o1, o2], t, fim);
};

const baixoDist: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.2 * v, 0.004, d * 0.9, 0.7, 0.06);
  const lp = filtro(c, 'lowpass', 1400, 2, g);
  lp.frequency.setValueAtTime(2400, t);
  lp.frequency.exponentialRampToValueAtTime(700, t + 0.2);
  const ws = c.createWaveShaper();
  ws.curve = curvaDist(28);
  ws.oversample = '2x';
  ws.connect(lp);
  const pre = ganho(c, 0.6, ws);
  const o1 = oscilador(c, 'sawtooth', f, pre);
  const o2 = oscilador(c, 'square', f / 2, ganho(c, 0.6, pre));
  const sub = oscilador(c, 'sine', f, ganho(c, 0.9, g));
  inicia([o1, o2, sub], t, fim);
};

const guitarra: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = t + Math.min(Math.max(d, 0.2), 1.4);
  envPerc(g.gain, t, 0.22 * v, 0.003, fim - t);
  const bp = filtro(c, 'peaking', 1300, 3, g); bp.gain.value = 9;
  const lp = filtro(c, 'lowpass', 3800, 4, bp);
  lp.frequency.setValueAtTime(4200, t);
  lp.frequency.exponentialRampToValueAtTime(900, t + 0.35);
  const o = oscilador(c, 'sawtooth', f, lp);
  o.detune.setValueAtTime(14, t); o.detune.exponentialRampToValueAtTime(1, t + 0.06);
  const o2 = oscilador(c, 'square', f, ganho(c, 0.2, lp));
  vibrato(c, [o.detune, o2.detune], t, fim, 6.2, 9, 0.25);
  inicia([o, o2], t, fim);
};

const violao: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = t + Math.min(Math.max(d, 0.25), 1.3);
  envPerc(g.gain, t, 0.24 * v, 0.002, fim - t);
  const lp = filtro(c, 'lowpass', 2600, 1.2, g);
  lp.frequency.setValueAtTime(3000, t);
  lp.frequency.exponentialRampToValueAtTime(650, t + 0.5);
  const o1 = oscilador(c, 'triangle', f, lp);
  const o2 = oscilador(c, 'sawtooth', f, ganho(c, 0.3, lp));
  const gp = ganho(c, 0, out); envPerc(gp.gain, t, 0.05 * v, 0.001, 0.02);
  const p = fonteRuido(c, 'branco', filtro(c, 'bandpass', 2800, 1, gp), m * 0.03);
  inicia([o1, o2, p], t, fim);
};

const metais: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.15 * v, 0.035, d, 0.75, 0.14);
  const lp = filtro(c, 'lowpass', 600, 1.5, g);
  lp.frequency.setValueAtTime(400, t);
  lp.frequency.exponentialRampToValueAtTime(1800 + 1800 * v, t + 0.07);
  lp.frequency.exponentialRampToValueAtTime(1300 + 600 * v, t + 0.3);
  const os = [-6, 5].map((dt) => { const o = oscilador(c, 'sawtooth', f, lp); o.detune.setValueAtTime(dt - 35, t); o.detune.linearRampToValueAtTime(dt, t + 0.05); return o; });
  vibrato(c, os.map((o) => o.detune), t, fim, 5.6, 6, 0.4);
  inicia(os, t, fim);
};

const sino: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const fim = t + Math.max(1.2, Math.min(d * 2, 3));
  const parciais: [number, number, number][] = [[1, 0.3, 1], [2.76, 0.12, 0.5], [5.4, 0.06, 0.25], [8.93, 0.03, 0.12]];
  const os = parciais.map(([r, a, q]) => {
    const g = ganho(c, 0, out);
    envPerc(g.gain, t, a * v, 0.002, (fim - t) * q);
    return oscilador(c, 'sine', f * r, g);
  });
  inicia(os, t, fim);
};

const pizz: Instrumento = (c, out, t, m, _d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  envPerc(g.gain, t, 0.3 * v, 0.003, 0.28);
  const lp = filtro(c, 'lowpass', 1800, 1, g);
  lp.frequency.setValueAtTime(2600, t);
  lp.frequency.exponentialRampToValueAtTime(500, t + 0.2);
  const o1 = oscilador(c, 'triangle', f, lp);
  const o2 = oscilador(c, 'sawtooth', f, ganho(c, 0.4, lp));
  inicia([o1, o2], t, t + 0.32);
};

const lead: Instrumento = (c, out, t, m, d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out);
  const fim = envSus(g.gain, t, 0.1 * v, 0.01, d * 0.92, 0.7, 0.07);
  const lp = filtro(c, 'lowpass', 2400, 3, g);
  lp.frequency.setValueAtTime(3800, t);
  lp.frequency.exponentialRampToValueAtTime(1500, t + 0.15);
  const a = oscilador(c, 'square', f, lp); a.detune.value = -5;
  const b = oscilador(c, 'sawtooth', f, ganho(c, 0.6, lp)); b.detune.value = 6;
  vibrato(c, [a.detune, b.detune], t, fim, 6, 10, 0.3);
  inicia([a, b], t, fim);
};

const kalimba: Instrumento = (c, out, t, m, _d, v) => {
  const f = mtof(m);
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.35 * v, 0.002, 0.9);
  const o1 = oscilador(c, 'sine', f, g);
  const g2 = ganho(c, 0, out); envPerc(g2.gain, t, 0.08 * v, 0.001, 0.12);
  const o2 = oscilador(c, 'sine', f * 5.95, g2);
  const g3 = ganho(c, 0, out); envPerc(g3.gain, t, 0.06 * v, 0.001, 0.3);
  const o3 = oscilador(c, 'triangle', f * 2, g3);
  inicia([o1, o2, o3], t, t + 0.95);
};

// ---------------------------------------------------------------- percussão
const bumbo: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.95 * v, 0.002, 0.42);
  const o = oscilador(c, 'sine', 150, g);
  o.frequency.setValueAtTime(155, t);
  o.frequency.exponentialRampToValueAtTime(46, t + 0.13);
  const gc = ganho(c, 0, out); envPerc(gc.gain, t, 0.25 * v, 0.0005, 0.012);
  const k = fonteRuido(c, 'branco', filtro(c, 'lowpass', 3500, 0.7, gc), 0.1);
  inicia([o, k], t, t + 0.45);
};

const caixa: Instrumento = (c, out, t, _m, _d, v) => {
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.42 * v, 0.001, 0.17);
  const n = fonteRuido(c, 'branco', filtro(c, 'bandpass', 2600, 0.6, gn), 0.33);
  const gt = ganho(c, 0, out); envPerc(gt.gain, t, 0.35 * v, 0.001, 0.08);
  const o = oscilador(c, 'triangle', 200, gt); o.frequency.exponentialRampToValueAtTime(165, t + 0.06);
  inicia([n, o], t, t + 0.2);
};

const aro: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.3 * v, 0.0005, 0.035);
  const o = oscilador(c, 'square', 830, filtro(c, 'bandpass', 1700, 3, g));
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.15 * v, 0.0005, 0.03);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 2500, 1, gn), 0.51);
  inicia([o, n], t, t + 0.06);
};

const chimbal: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.16 * v, 0.0008, 0.045);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 7500, 0.8, g), 0.71);
  inicia([n], t, t + 0.07);
};

const aberto: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.14 * v, 0.002, 0.32);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 6800, 0.6, g), 0.93);
  inicia([n], t, t + 0.36);
};

const prato: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.2 * v, 0.003, 1.6);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 4800, 0.5, g), 1.17);
  const g2 = ganho(c, 0, out); envPerc(g2.gain, t, 0.07 * v, 0.002, 0.9);
  const n2 = fonteRuido(c, 'rosa', filtro(c, 'bandpass', 9000, 1.2, g2), 0.4);
  inicia([n, n2], t, t + 1.65);
};

const surdo: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.8 * v, 0.004, 0.7);
  const o = oscilador(c, 'sine', 95, g); o.frequency.exponentialRampToValueAtTime(68, t + 0.25);
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.2 * v, 0.001, 0.06);
  const n = fonteRuido(c, 'marrom', filtro(c, 'lowpass', 500, 1, gn), 0.2);
  inicia([o, n], t, t + 0.75);
};

const tom: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.6 * v, 0.002, 0.33);
  const o = oscilador(c, 'sine', 190, g); o.frequency.exponentialRampToValueAtTime(118, t + 0.2);
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.12 * v, 0.001, 0.04);
  const n = fonteRuido(c, 'rosa', filtro(c, 'bandpass', 900, 1, gn), 0.66);
  inicia([o, n], t, t + 0.36);
};

function agogo(f: number): Instrumento {
  return (c, out, t, _m, _d, v) => {
    const g = ganho(c, 0, out); envPerc(g.gain, t, 0.16 * v, 0.001, 0.38);
    const o1 = oscilador(c, 'sine', f, g);
    const g2 = ganho(c, 0, out); envPerc(g2.gain, t, 0.08 * v, 0.001, 0.18);
    const o2 = oscilador(c, 'sine', f * 2.37, g2);
    const g3 = ganho(c, 0, out); envPerc(g3.gain, t, 0.05 * v, 0.0005, 0.03);
    const o3 = oscilador(c, 'square', f * 1.5, filtro(c, 'highpass', 2000, 1, g3));
    inicia([o1, o2, o3], t, t + 0.4);
  };
}

const pandeiro: Instrumento = (c, out, t, _m, _d, v) => {
  const nos: (OscillatorNode | AudioBufferSourceNode)[] = [];
  for (let i = 0; i < 3; i++) {
    const ti = t + i * 0.008;
    const g = ganho(c, 0, out); envPerc(g.gain, ti, (0.13 - i * 0.03) * v, 0.001, 0.1);
    nos.push(fonteRuido(c, 'branco', filtro(c, 'bandpass', 7200 + i * 700, 2.2, g), 0.2 + i * 0.37));
  }
  const gp = ganho(c, 0, out); envPerc(gp.gain, t, 0.22 * v * v, 0.001, 0.07);
  const o = oscilador(c, 'sine', 240, gp); o.frequency.exponentialRampToValueAtTime(180, t + 0.05);
  nos.push(o);
  inicia(nos, t, t + 0.14);
};

const ganza: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.09 * v, 0.018, 0.06);
  const n = fonteRuido(c, 'branco', filtro(c, 'bandpass', 5200, 1.4, g), 0.88);
  inicia([n], t, t + 0.09);
};

const caxixi: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.12 * v, 0.006, 0.05);
  const n = fonteRuido(c, 'branco', filtro(c, 'bandpass', 4300, 2, g), 1.33);
  inicia([n], t, t + 0.07);
};

const palmas: Instrumento = (c, out, t, _m, _d, v) => {
  const nos: AudioBufferSourceNode[] = [];
  [0, 0.011, 0.023].forEach((dt, i) => {
    const g = ganho(c, 0, out); envPerc(g.gain, t + dt, 0.22 * v, 0.001, i === 2 ? 0.12 : 0.012);
    nos.push(fonteRuido(c, 'branco', filtro(c, 'bandpass', 1150, 1.1, g), 0.5 + i * 0.2));
  });
  inicia(nos, t, t + 0.16);
};

const metal: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.12 * v, 0.001, 0.38);
  const bp = filtro(c, 'bandpass', 2400, 1.6, g);
  const os = [317, 529, 811, 1197, 1673].map((f) => oscilador(c, 'square', f, bp));
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.2 * v, 0.0005, 0.05);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 3000, 1, gn), 0.77);
  inicia([...os, n], t, t + 0.4);
};

const bigorna: Instrumento = (c, out, t, _m, _d, v) => {
  const os: OscillatorNode[] = [];
  [[1830, 0.12, 0.9], [2710, 0.08, 0.6], [4130, 0.05, 0.35], [913, 0.06, 0.5]].forEach(([f, a, q]) => {
    const g = ganho(c, 0, out); envPerc(g.gain, t, a * v, 0.0008, q);
    os.push(oscilador(c, 'sine', f, g));
  });
  inicia(os, t, t + 0.95);
};

const vapor: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.1 * v, 0.03, 0.28);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 3200, 0.6, g), 1.71);
  inicia([n], t, t + 0.33);
};

const gota: Instrumento = (c, out, t, _m, _d, v) => {
  const f0 = 520 + v * 500;
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.25 * v, 0.001, 0.11);
  const o = oscilador(c, 'sine', f0, g);
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f0 * 2.6, t + 0.06);
  inicia([o], t, t + 0.13);
};

const tamborim: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.28 * v, 0.001, 0.09);
  const o = oscilador(c, 'sine', 690, g); o.frequency.exponentialRampToValueAtTime(560, t + 0.06);
  const gn = ganho(c, 0, out); envPerc(gn.gain, t, 0.1 * v, 0.0005, 0.02);
  const n = fonteRuido(c, 'branco', filtro(c, 'highpass', 4000, 1, gn), 1.9);
  inicia([o, n], t, t + 0.11);
};

const scratch: Instrumento = (c, out, t, _m, d, v) => {
  const dur = Math.min(0.24, Math.max(0.1, d));
  const g = ganho(c, 0, out); envPerc(g.gain, t, 0.2 * v, 0.005, dur);
  const bp = filtro(c, 'bandpass', 900, 4, g);
  bp.frequency.setValueAtTime(500, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.45);
  bp.frequency.exponentialRampToValueAtTime(700, t + dur);
  const n = fonteRuido(c, 'rosa', bp, 0.31);
  const o = oscilador(c, 'sawtooth', 160, filtro(c, 'lowpass', 1200, 1, ganho(c, 0.3, g)));
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(420, t + dur * 0.45); o.frequency.exponentialRampToValueAtTime(150, t + dur);
  inicia([n, o], t, t + dur + 0.02);
};

const bumboDj: Instrumento = (c, out, t, _m, _d, v) => {
  const g = ganho(c, 0, out); envPerc(g.gain, t, 1.0 * v, 0.002, 0.5);
  const ws = c.createWaveShaper(); ws.curve = curvaDist(4); ws.connect(g);
  const o = oscilador(c, 'sine', 160, ws);
  o.frequency.setValueAtTime(170, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  inicia([o], t, t + 0.52);
};

export const INSTRUMENTOS = {
  marimba, berimbau, cordas, flauta, pad, padBrilho, baixo, baixoSub, baixoDist, guitarra, violao, metais, sino, pizz, lead, kalimba,
} satisfies Record<InstId, Instrumento>;

export const BATERIA = {
  bumbo, caixa, aro, chimbal, aberto, prato, surdo, tom, agogoA: agogo(1180), agogoB: agogo(860), pandeiro, ganza, caxixi, palmas,
  metal, bigorna, vapor, gota, tamborim, scratch, bumboDj,
} satisfies Record<PecaId, Instrumento>;
