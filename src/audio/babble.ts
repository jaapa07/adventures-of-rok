/** Fala "balbuciada": cada personagem tem timbre, altura e ritmo próprios; o texto define vogais, consoantes e entonação. */
import { fonteRuido, ganho } from './core';
import { hashTexto } from './rng';

interface VozDef {
  f: number;            // altura média (Hz)
  varia: number;        // faixa de variação melódica (semitons)
  sil: number;          // duração média da sílaba (s)
  onda: OscillatorType;
  formante: number;     // escala dos formantes (tamanho do "trato vocal")
  aspero: number;       // mistura de ruído (rouquidão)
  vib: [number, number];// vibrato [Hz, semitons]
  vol: number;
  assobio?: boolean;    // sem formantes: canto assobiado
}

export const VOZES: Record<string, VozDef> = {
  tama: { f: 128, varia: 3, sil: 0.13, onda: 'sawtooth', formante: 0.85, aspero: 0.12, vib: [5, 0.15], vol: 0.32 },
  lili: { f: 430, varia: 5, sil: 0.075, onda: 'sawtooth', formante: 1.38, aspero: 0.04, vib: [7, 0.2], vol: 0.24 },
  'vo-bugio': { f: 108, varia: 4, sil: 0.155, onda: 'sawtooth', formante: 0.8, aspero: 0.35, vib: [6.5, 0.6], vol: 0.3 },
  tucano: { f: 290, varia: 6, sil: 0.1, onda: 'square', formante: 1.15, aspero: 0.1, vib: [4, 0.1], vol: 0.17 },
  quati: { f: 370, varia: 4, sil: 0.062, onda: 'square', formante: 1.25, aspero: 0.15, vib: [9, 0.25], vol: 0.16 },
  'bem-te-vi': { f: 1350, varia: 7, sil: 0.085, onda: 'sine', formante: 2, aspero: 0, vib: [12, 0.3], vol: 0.16, assobio: true },
  preguica: { f: 92, varia: 2, sil: 0.27, onda: 'triangle', formante: 0.75, aspero: 0.3, vib: [3, 0.2], vol: 0.4 },
  javalim: { f: 118, varia: 3, sil: 0.1, onda: 'square', formante: 0.85, aspero: 0.55, vib: [25, 0.4], vol: 0.2 },
  barao: { f: 88, varia: 5, sil: 0.145, onda: 'sawtooth', formante: 0.74, aspero: 0.25, vib: [5.5, 0.5], vol: 0.3 },
};

const VOG: Record<string, [number, number]> = { a: [800, 1150], e: [500, 1750], i: [300, 2250], o: [520, 860], u: [320, 760], y: [300, 2250] };
const FRIC = new Set(['s', 'f', 'x', 'z', 'j', 'v', 'h']);
const PLOS = new Set(['p', 't', 'k', 'b', 'd', 'g', 'q', 'c']);
const NAS = new Set(['m', 'n']);

interface Silaba { v: string; cons: string; pausa: number; fim: '' | '?' | '!' | '.' }

function silabas(texto: string): Silaba[] {
  const s = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const out: Silaba[] = [];
  let cons = '';
  for (const ch of s) {
    if (ch in VOG) { out.push({ v: ch, cons, pausa: 0, fim: '' }); cons = ''; }
    else if (/[a-z]/.test(ch)) cons += ch;
    else if (ch === ' ') { if (out.length) out[out.length - 1].pausa = Math.max(out[out.length - 1].pausa, 0.35); }
    else if (ch === ',' || ch === ';' || ch === ':') { if (out.length) out[out.length - 1].pausa = 0.8; }
    else if (ch === '.' || ch === '!' || ch === '?') {
      if (out.length) { const u = out[out.length - 1]; u.pausa = 1.3; if (u.fim !== '?' && u.fim !== '!') u.fim = ch as '.' | '!' | '?'; }
    }
    if (out.length >= 60) break;
  }
  return out;
}

const ativos = new Map<string, { g: GainNode; fontes: (OscillatorNode | AudioBufferSourceNode)[] }>();

export function balbuciar(c: AudioContext, dest: AudioNode, voz: string, texto: string): void {
  const v = VOZES[voz] ?? VOZES.tama;
  const sil = silabas(texto);
  if (!sil.length) return;
  const t0 = c.currentTime + 0.02;
  const anterior = ativos.get(voz);
  if (anterior) {
    anterior.g.gain.cancelScheduledValues(t0);
    anterior.g.gain.setTargetAtTime(0, t0, 0.02);
    for (const f of anterior.fontes) { try { f.stop(t0 + 0.1); } catch { /* já parado */ } }
  }
  const mestre = ganho(c, 1, dest);
  const amp = ganho(c, 0, mestre);
  const src = c.createOscillator();
  src.type = v.onda;
  src.frequency.setValueAtTime(v.f, t0);
  const lfo = c.createOscillator();
  lfo.frequency.value = v.vib[0];
  lfo.connect(ganho(c, v.vib[1] * 100, src.detune));
  let f1: BiquadFilterNode | null = null;
  let f2: BiquadFilterNode | null = null;
  if (v.assobio) src.connect(amp);
  else {
    f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5; f1.connect(amp);
    f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8; f2.connect(ganho(c, 0.7, amp));
    const pre = ganho(c, 2.4, f1); pre.connect(f2);
    src.connect(pre);
  }
  // ruído: consoantes e rouquidão
  const ruidoG = ganho(c, 0, mestre);
  const ruidoF = c.createBiquadFilter(); ruidoF.type = 'highpass'; ruidoF.frequency.value = 3000; ruidoF.connect(ruidoG);
  const ruido = fonteRuido(c, 'branco', ruidoF, hashTexto(texto) % 997 / 500);
  const rouco = ganho(c, 0, amp);
  const roucoF = c.createBiquadFilter(); roucoF.type = 'bandpass'; roucoF.frequency.value = 1200 * v.formante; roucoF.Q.value = 0.8; roucoF.connect(rouco);
  ruido.connect(roucoF);
  rouco.gain.value = v.aspero * 0.8;

  let t = t0;
  const n = sil.length;
  sil.forEach((s, i) => {
    const h = hashTexto(voz + s.cons + s.v + i) / 4294967296;
    const dur = v.sil * (0.8 + 0.45 * h) * (s.cons.length > 1 ? 1.15 : 1);
    // consoante
    let atrasoVogal = 0;
    const c0 = s.cons[s.cons.length - 1] ?? '';
    if (FRIC.has(c0)) {
      ruidoF.frequency.setValueAtTime(c0 === 's' || c0 === 'z' ? 4500 : c0 === 'x' || c0 === 'j' ? 2600 : 1800, t);
      ruidoG.gain.setValueAtTime(0.0001, t);
      ruidoG.gain.linearRampToValueAtTime(v.vol * 0.5, t + 0.015);
      ruidoG.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      atrasoVogal = 0.04;
    } else if (PLOS.has(c0)) {
      ruidoF.frequency.setValueAtTime(1500, t);
      ruidoG.gain.setValueAtTime(v.vol * 0.6, t);
      ruidoG.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
      atrasoVogal = 0.018;
    }
    const tv = t + atrasoVogal;
    let semi = Math.round((h * 2 - 1) * v.varia) - (i / n) * 2;
    if (i === 0) semi += 1.5;
    if (s.fim === '!') semi += 2;
    const fv = v.f * Math.pow(2, semi / 12);
    src.frequency.setTargetAtTime(fv, tv, 0.015);
    if (s.fim === '?') src.frequency.setTargetAtTime(fv * 1.45, tv + dur * 0.3, dur * 0.4);
    if (v.assobio) src.frequency.setTargetAtTime(fv * (h > 0.5 ? 1.18 : 0.86), tv + dur * 0.4, dur * 0.3);
    if (f1 && f2) {
      const [a, b] = NAS.has(c0) ? [280, 900] : VOG[s.v];
      f1.frequency.setTargetAtTime(a * v.formante, t, 0.01);
      f2.frequency.setTargetAtTime(b * v.formante, t, 0.01);
      if (NAS.has(c0) || c0 === 'l' || c0 === 'r') {
        const [va, vb] = VOG[s.v];
        f1.frequency.setTargetAtTime(va * v.formante, t + 0.04, 0.015);
        f2.frequency.setTargetAtTime(vb * v.formante, t + 0.04, 0.015);
      }
    }
    const vol = v.vol * (s.fim === '!' ? 1.3 : 1) * (0.85 + 0.3 * h);
    amp.gain.setTargetAtTime(NAS.has(c0) ? vol * 0.5 : 0.0001, t, 0.008);
    amp.gain.setTargetAtTime(vol, tv, 0.012);
    amp.gain.setTargetAtTime(0.0001, tv + dur * 0.8, 0.02);
    t = tv + dur + s.pausa * v.sil;
  });
  const fim = t + 0.3;
  src.start(t0); lfo.start(t0); ruido.start(t0, (ruido as AudioBufferSourceNode & { _off?: number })._off ?? 0);
  src.stop(fim); lfo.stop(fim); ruido.stop(fim);
  const reg = { g: mestre, fontes: [src, lfo, ruido] };
  ativos.set(voz, reg);
  setTimeout(() => { if (ativos.get(voz) === reg) ativos.delete(voz); try { mestre.disconnect(); } catch { /* já desligado */ } }, (fim - c.currentTime + 1) * 1000);
}
