/** Reverb por convolução: respostas ao impulso geradas deterministicamente para cada mundo. */
import { mulberry32 } from './rng';

export type PresetReverb = 'mata' | 'gruta' | 'recife' | 'fabrica' | 'cristal' | 'copa' | 'seco';

interface DefReverb {
  dur: number;        // segundos de cauda
  decai: number;      // expoente da queda
  pre: number;        // pré-atraso (s)
  brilho: number;     // 0 = escuro (passa-baixa forte), 1 = brilhante
  reflexoes: [number, number][]; // [tempo s, ganho] reflexões iniciais escritas à mão
  metal?: number;     // ressonância de pente (s) para timbre metálico
  brilhoFinal?: number; // a cauda escurece ao longo do tempo (absorção do ar)
  ret: number;        // ganho de retorno sugerido
  semente: number;
}

export const PRESETS_REVERB: Record<PresetReverb, DefReverb> = {
  // Mata: folhagem absorve, cauda média e difusa
  mata: { dur: 1.7, decai: 3.2, pre: 0.012, brilho: 0.45, reflexoes: [[0.019, 0.35], [0.031, 0.22], [0.047, 0.18], [0.071, 0.1]], brilhoFinal: 0.15, ret: 0.55, semente: 11 },
  // Gruta: pedra dura, cauda longa e ecos discretos nas paredes
  gruta: { dur: 4.6, decai: 2.2, pre: 0.028, brilho: 0.7, reflexoes: [[0.043, 0.5], [0.089, 0.38], [0.151, 0.3], [0.233, 0.2], [0.347, 0.12]], brilhoFinal: 0.35, ret: 0.7, semente: 23 },
  // Recife: abafado e difuso como sob a água
  recife: { dur: 3.2, decai: 2.6, pre: 0.035, brilho: 0.25, reflexoes: [[0.061, 0.3], [0.113, 0.22], [0.177, 0.15]], brilhoFinal: 0.08, ret: 0.7, semente: 37 },
  // Fábrica: galpão de metal com ressonância de pente
  fabrica: { dur: 2.4, decai: 2.8, pre: 0.02, brilho: 0.8, reflexoes: [[0.027, 0.45], [0.054, 0.4], [0.081, 0.3], [0.108, 0.22]], metal: 0.0071, brilhoFinal: 0.4, ret: 0.55, semente: 41 },
  // Cristal: brilhante e muito longo (salas bônus)
  cristal: { dur: 5.2, decai: 2.0, pre: 0.015, brilho: 1.0, reflexoes: [[0.033, 0.3], [0.066, 0.25], [0.099, 0.2]], metal: 0.0023, brilhoFinal: 0.7, ret: 0.65, semente: 53 },
  // Copa: ar aberto no alto das árvores, curto e arejado
  copa: { dur: 1.2, decai: 3.6, pre: 0.006, brilho: 0.8, reflexoes: [[0.011, 0.2], [0.024, 0.12]], brilhoFinal: 0.5, ret: 0.45, semente: 67 },
  // Seco: quase nada (menus)
  seco: { dur: 0.35, decai: 5, pre: 0.002, brilho: 0.6, reflexoes: [[0.008, 0.15]], brilhoFinal: 0.4, ret: 0.3, semente: 79 },
};

const cache = new Map<string, AudioBuffer>();

export function impulso(c: AudioContext, p: PresetReverb): AudioBuffer {
  const pronto = cache.get(p);
  if (pronto) return pronto;
  const d = PRESETS_REVERB[p];
  const sr = c.sampleRate;
  const n = Math.floor(sr * (d.dur + d.pre));
  const buf = c.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) {
    const r = mulberry32(d.semente * 7 + ch * 1013);
    const out = buf.getChannelData(ch);
    const ini = Math.floor(d.pre * sr);
    let lp = 0;
    for (let i = ini; i < n; i++) {
      const k = (i - ini) / (n - ini);
      const env = Math.pow(1 - k, d.decai) * Math.exp(-k * 1.5);
      // filtro passa-baixa de 1 polo cujo corte cai com o tempo (o ar absorve agudos)
      const b = d.brilho * (1 - k) + (d.brilhoFinal ?? d.brilho) * k;
      const coef = 0.05 + b * 0.9;
      lp += coef * ((r() * 2 - 1) - lp);
      out[i] = lp * env;
    }
    for (const [tr, g] of d.reflexoes) {
      const j = ini + Math.floor((tr + (ch ? 0.0037 : 0)) * sr);
      if (j < n) { out[j] += g * (ch ? 0.9 : 1); if (j + 1 < n) out[j + 1] += g * 0.5; }
    }
    if (d.metal) {
      const atraso = Math.floor(d.metal * sr);
      for (let i = atraso; i < n; i++) out[i] += out[i - atraso] * 0.45;
    }
    // normaliza energia
    let soma = 0;
    for (let i = 0; i < n; i++) soma += out[i] * out[i];
    const norm = 1 / Math.sqrt(Math.max(1e-9, soma / sr) * 6);
    for (let i = 0; i < n; i++) out[i] *= norm;
  }
  cache.set(p, buf);
  return buf;
}
