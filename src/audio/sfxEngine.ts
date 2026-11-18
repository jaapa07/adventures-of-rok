/** Toca presets de SFX descritos em dados (camadas de osciladores, ruído, FM, notas e vozes). */
import { curvaDist, filtro, fonteRuido, ganho, inicia, mtof } from './core';
import type { Camada, Filt, Sfx } from '../data/sfx';

export interface OpcSfx { vol?: number; pitch?: number; pan?: number }

const FORMANTES: Record<string, [number, number]> = {
  a: [800, 1150], e: [500, 1750], i: [300, 2250], o: [520, 860], u: [320, 760], h: [600, 1400], m: [280, 900], r: [450, 1300],
};

function aplicaFiltro(c: AudioContext, f: Filt | undefined, t: number, dur: number, p: number, dest: AudioNode): AudioNode {
  if (!f) return dest;
  const b = filtro(c, f.t, f.f * p, f.q ?? 1, dest);
  if (f.f2) {
    b.frequency.setValueAtTime(f.f * p, t);
    b.frequency.exponentialRampToValueAtTime(Math.max(20, f.f2 * p), t + dur);
  }
  return b;
}

function envelope(g: GainNode, cam: Camada, t: number, vol: number): number {
  const at = cam.at ?? 0.004;
  const dur = Math.max(at + 0.005, cam.dur);
  const p = g.gain;
  p.setValueAtTime(0.0001, t);
  p.linearRampToValueAtTime(Math.max(0.0002, vol), t + at);
  if (cam.sus) {
    p.setValueAtTime(vol, t + Math.max(at, dur * 0.78));
    p.exponentialRampToValueAtTime(0.0001, t + dur);
  } else {
    p.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  return t + dur;
}

function tremolo(c: AudioContext, g: GainNode, cam: Camada, t: number, fim: number): OscillatorNode | null {
  if (!cam.trem) return null;
  const [taxa, prof] = cam.trem;
  const lfo = c.createOscillator();
  lfo.frequency.value = taxa;
  lfo.type = 'square';
  const gp = ganho(c, prof * 0.5, g.gain);
  lfo.connect(gp);
  void fim;
  return lfo;
}

function camadaUnica(c: AudioContext, cam: Camada, t: number, p: number, dest: AudioNode): void {
  const nos: (OscillatorNode | AudioBufferSourceNode)[] = [];
  const g = ganho(c, 0, dest);
  if (cam.pan !== undefined) {
    g.disconnect();
    const sp = c.createStereoPanner(); sp.pan.value = cam.pan; sp.connect(dest); g.connect(sp);
  }
  // para tremolo, o envelope fica num ganho e a modulação em outro
  let alvo: AudioNode = g;
  if (cam.trem) {
    const gt = ganho(c, 1 - cam.trem[1] * 0.5, g);
    const lfo = tremolo(c, gt, cam, t, t + cam.dur);
    if (lfo) nos.push(lfo);
    alvo = gt;
  }
  const fim = envelope(g, cam, t, cam.vol);
  if (cam.k === 'osc') {
    let entrada = aplicaFiltro(c, cam.filt, t, cam.dur, p, alvo);
    if (cam.dist) {
      const ws = c.createWaveShaper(); ws.curve = curvaDist(cam.dist); ws.connect(entrada); entrada = ws;
    }
    const o = c.createOscillator();
    o.type = cam.onda;
    o.frequency.setValueAtTime(cam.f * p, t);
    if (cam.f2) {
      if (cam.lin) o.frequency.linearRampToValueAtTime(cam.f2 * p, t + cam.dur);
      else o.frequency.exponentialRampToValueAtTime(Math.max(1, cam.f2 * p), t + cam.dur);
    }
    if (cam.vib) {
      const l = c.createOscillator(); l.frequency.value = cam.vib[0];
      const lg = ganho(c, cam.vib[1] * 100, o.detune); l.connect(lg); nos.push(l);
    }
    o.connect(entrada);
    nos.push(o);
  } else if (cam.k === 'ruido') {
    const entrada = aplicaFiltro(c, cam.filt, t, cam.dur, p, alvo);
    nos.push(fonteRuido(c, cam.cor ?? 'branco', entrada, (cam.f0 ?? 0) + t * 0.37));
  } else if (cam.k === 'fm') {
    const car = c.createOscillator(); car.type = cam.onda ?? 'sine';
    const mod = c.createOscillator();
    const f = cam.f * p;
    car.frequency.setValueAtTime(f, t);
    mod.frequency.setValueAtTime(f * cam.razao, t);
    if (cam.f2) {
      car.frequency.exponentialRampToValueAtTime(cam.f2 * p, t + cam.dur);
      mod.frequency.exponentialRampToValueAtTime(cam.f2 * p * cam.razao, t + cam.dur);
    }
    const idx = c.createGain();
    idx.gain.setValueAtTime(cam.ind * f, t);
    idx.gain.exponentialRampToValueAtTime(Math.max(1, (cam.ind2 ?? cam.ind * 0.1) * f), t + cam.dur);
    mod.connect(idx); idx.connect(car.frequency);
    car.connect(aplicaFiltro(c, cam.filt, t, cam.dur, p, alvo));
    nos.push(car, mod);
  } else if (cam.k === 'notas') {
    // arpejo/jingle: um oscilador por nota, cada um ligado ao mesmo ganho mestre
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(cam.vol, t);
    const total = cam.passo * (cam.seq.length - 1) + cam.dur;
    g.gain.setValueAtTime(cam.vol, t + total);
    g.gain.linearRampToValueAtTime(0.0001, t + total + 0.05);
    const entrada = aplicaFiltro(c, cam.filt, t, total, p, alvo);
    const sobe = 12 * Math.log2(p);
    cam.seq.forEach((n, i) => {
      if (n === null) return;
      const ti = t + i * cam.passo;
      const gn = ganho(c, 0, entrada);
      gn.gain.setValueAtTime(0.0001, ti);
      gn.gain.linearRampToValueAtTime(1, ti + 0.004);
      gn.gain.exponentialRampToValueAtTime(0.0001, ti + cam.dur);
      const o = c.createOscillator(); o.type = cam.onda;
      o.frequency.value = mtof(cam.base + n + sobe);
      o.connect(gn);
      o.start(ti); o.stop(ti + cam.dur + 0.02);
    });
    return;
  } else if (cam.k === 'voz') {
    const f = cam.f * p;
    const src = c.createOscillator(); src.type = cam.onda ?? 'sawtooth';
    src.frequency.setValueAtTime(f, t);
    if (cam.f2) src.frequency.exponentialRampToValueAtTime(cam.f2 * p, t + cam.dur);
    if (cam.vib) {
      const l = c.createOscillator(); l.frequency.value = cam.vib[0];
      const lg = ganho(c, cam.vib[1] * 100, src.detune); l.connect(lg); nos.push(l);
    }
    const esc = (cam.formante ?? 1) * Math.sqrt(p);
    const f1 = filtro(c, 'bandpass', 700, 6, alvo);
    const f2 = filtro(c, 'bandpass', 1200, 9, ganho(c, 0.6, alvo));
    const pre = ganho(c, 2.2, f1); pre.connect(f2);
    src.connect(pre);
    const vs = cam.vogais.split('');
    vs.forEach((v, i) => {
      const [a, b] = FORMANTES[v] ?? FORMANTES.a;
      const ti = t + (cam.dur * i) / vs.length;
      if (i === 0) { f1.frequency.setValueAtTime(a * esc, ti); f2.frequency.setValueAtTime(b * esc, ti); }
      else { f1.frequency.linearRampToValueAtTime(a * esc, ti + 0.03); f2.frequency.linearRampToValueAtTime(b * esc, ti + 0.03); }
    });
    nos.push(src);
    if (cam.aspero) {
      const n = fonteRuido(c, 'rosa', filtro(c, 'bandpass', 1200 * esc, 0.8, ganho(c, cam.aspero, alvo)), t * 0.7);
      nos.push(n);
    }
  }
  inicia(nos, t, fim);
}

export function tocaPreset(c: AudioContext, def: Sfx, dest: AudioNode, envio: AudioNode, o: OpcSfx, pitchVar: number): void {
  const t = c.currentTime + 0.005;
  const p = Math.max(0.05, (o.pitch ?? 1) * (1 + pitchVar));
  const saida = ganho(c, (def.vol ?? 1) * (o.vol ?? 1));
  if (o.pan) {
    const sp = c.createStereoPanner();
    sp.pan.value = Math.max(-1, Math.min(1, o.pan));
    saida.connect(sp); sp.connect(dest);
    if (def.rev) sp.connect(ganho(c, def.rev, envio));
  } else {
    saida.connect(dest);
    if (def.rev) saida.connect(ganho(c, def.rev, envio));
  }
  let fimMax = 0;
  for (const cam of def.c) {
    const reps = cam.rep ? cam.rep[0] : 1;
    for (let r = 0; r < reps; r++) {
      const ti = t + (cam.ini ?? 0) + (cam.rep ? r * cam.rep[1] : 0);
      camadaUnica(c, cam, ti, p, saida);
      fimMax = Math.max(fimMax, ti - t + cam.dur + (cam.k === 'notas' ? cam.passo * cam.seq.length : 0));
    }
  }
  setTimeout(() => { try { saida.disconnect(); } catch { /* já desligado */ } }, (fimMax + 4) * 1000);
}
