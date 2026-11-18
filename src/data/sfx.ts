/**
 * SFX autorais da Selva Sumaúma: cada preset é uma pilha de camadas com parâmetros escritos à mão.
 * Frequências em Hz, tempos em segundos, volumes lineares. `f2` = alvo do glissando ao fim da camada.
 * `rep: [n, intervalo]` repete a camada; `trem: [Hz, profundidade]` modula o volume; `sus` sustenta antes de soltar.
 */
export type Onda = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type Cor = 'branco' | 'rosa' | 'marrom';
export interface Filt { t: BiquadFilterType; f: number; f2?: number; q?: number }
interface Base { ini?: number; dur: number; at?: number; vol: number; sus?: boolean; trem?: [number, number]; rep?: [number, number]; pan?: number; vib?: [number, number] }
export interface COsc extends Base { k: 'osc'; onda: Onda; f: number; f2?: number; lin?: boolean; filt?: Filt; dist?: number }
export interface CRuido extends Base { k: 'ruido'; cor?: Cor; filt: Filt; f0?: number }
export interface CFm extends Base { k: 'fm'; f: number; f2?: number; razao: number; ind: number; ind2?: number; onda?: Onda; filt?: Filt }
export interface CNotas extends Base { k: 'notas'; onda: Onda; base: number; seq: (number | null)[]; passo: number; filt?: Filt }
export interface CVoz extends Base { k: 'voz'; f: number; f2?: number; vogais: string; formante?: number; aspero?: number; onda?: Onda }
export type Camada = COsc | CRuido | CFm | CNotas | CVoz;
export interface Sfx { c: Camada[]; vol?: number; rev?: number; var?: number }

// construtores curtos (apenas açúcar de escrita; cada número abaixo foi escolhido à mão)
const o = (onda: Onda, f: number, f2: number | undefined, dur: number, vol: number, x: Partial<COsc> = {}): COsc => ({ k: 'osc', onda, f, f2, dur, vol, ...x });
const r = (t: BiquadFilterType, f: number, f2: number | undefined, q: number, dur: number, vol: number, x: Partial<CRuido> = {}): CRuido => ({ k: 'ruido', filt: { t, f, f2, q }, dur, vol, ...x });
const fm = (f: number, f2: number | undefined, razao: number, ind: number, dur: number, vol: number, x: Partial<CFm> = {}): CFm => ({ k: 'fm', f, f2, razao, ind, dur, vol, ...x });
const ns = (onda: Onda, base: number, seq: (number | null)[], passo: number, dur: number, vol: number, x: Partial<CNotas> = {}): CNotas => ({ k: 'notas', onda, base, seq, passo, dur, vol, ...x });
const vz = (f: number, f2: number | undefined, vogais: string, dur: number, vol: number, x: Partial<CVoz> = {}): CVoz => ({ k: 'voz', f, f2, vogais, dur, vol, ...x });
const lp = (f: number, f2?: number, q = 1): Filt => ({ t: 'lowpass', f, f2, q });
const bp = (f: number, f2?: number, q = 1): Filt => ({ t: 'bandpass', f, f2, q });
const hp = (f: number, f2?: number, q = 0.7): Filt => ({ t: 'highpass', f, f2, q });

export const SFX: Record<string, Sfx> = {
  // ------------------------------------------------------------------ interface
  'ui-navegar': { c: [o('triangle', 880, 990, 0.06, 0.22), o('sine', 1760, undefined, 0.03, 0.06)] },
  'ui-confirmar': { c: [ns('triangle', 72, [0, 7, 12], 0.05, 0.14, 0.22), o('sine', 2093, undefined, 0.18, 0.05, { ini: 0.1 })] },
  'ui-voltar': { c: [ns('triangle', 76, [0, -5], 0.06, 0.12, 0.2)] },
  'ui-erro': { c: [o('square', 180, 150, 0.12, 0.13, { filt: lp(1200), rep: [2, 0.1] })] },
  'ui-pausa': { c: [ns('sine', 79, [0, -12, 7], 0.07, 0.3, 0.2), o('triangle', 392, undefined, 0.4, 0.05, { ini: 0.14 })] },
  'ui-tick': { vol: 1.5, c: [o('square', 2400, undefined, 0.015, 0.07, { filt: hp(1500) })] },

  // ------------------------------------------------------------------ passos
  'passo-terra': { var: 0.08, c: [r('lowpass', 900, 500, 0.8, 0.07, 0.32, { cor: 'rosa' }), o('sine', 90, 60, 0.05, 0.18)] },
  'passo-pedra': { vol: 1.5, var: 0.08, c: [r('bandpass', 2200, 1600, 1.2, 0.05, 0.26), o('triangle', 300, 200, 0.03, 0.1)] },
  'passo-madeira': { var: 0.07, c: [o('triangle', 420, 300, 0.06, 0.26), r('bandpass', 1200, undefined, 2, 0.04, 0.14)] },
  'passo-metal': { var: 0.06, c: [fm(520, 500, 1.41, 3, 0.14, 0.13), r('highpass', 4000, undefined, 0.7, 0.03, 0.1)] },

  // ------------------------------------------------------------------ heróis
  'pulo-tama': { var: 0.04, c: [o('square', 160, 320, 0.14, 0.15, { filt: lp(1200) }), vz(140, 190, 'hu', 0.12, 0.13, { aspero: 0.2, formante: 0.85 })] },
  'pulo-lili': { var: 0.04, c: [o('square', 420, 900, 0.1, 0.12, { filt: lp(2500) }), vz(380, 520, 'i', 0.08, 0.1, { formante: 1.35 })] },
  'aterrissar-tama': { c: [o('sine', 110, 45, 0.18, 0.5), r('lowpass', 700, 300, 1, 0.12, 0.32, { cor: 'marrom' })] },
  'aterrissar-lili': { c: [o('sine', 220, 110, 0.08, 0.26), r('lowpass', 1800, 900, 1, 0.06, 0.18)] },
  rolar: { c: [r('bandpass', 400, 900, 1.5, 0.35, 0.3, { trem: [22, 0.7] }), o('sine', 80, 70, 0.35, 0.18, { trem: [22, 0.7] })] },
  cambalhota: { vol: 3, c: [r('bandpass', 800, 3000, 2, 0.18, 0.25), r('bandpass', 900, 3200, 2, 0.16, 0.2, { ini: 0.12 })] },
  planar: { vol: 2, c: [r('bandpass', 1200, 700, 3, 0.6, 0.2, { at: 0.12, sus: true }), o('triangle', 600, 500, 0.6, 0.04, { sus: true, vib: [5, 0.3] })] },
  'batida-chao': { rev: 0.3, c: [o('sine', 120, 35, 0.4, 0.75), r('lowpass', 1200, 200, 1, 0.35, 0.45, { cor: 'marrom' }), r('bandpass', 3000, undefined, 1, 0.05, 0.2)] },
  troca: { c: [ns('triangle', 74, [0, 4, 7, 12], 0.035, 0.1, 0.18), r('highpass', 3000, 8000, 0.7, 0.2, 0.07)] },
  'voz-tama-ok': { var: 0.05, c: [vz(140, 175, 'ao', 0.2, 0.32, { aspero: 0.15, formante: 0.85 }), vz(175, 150, 'u', 0.14, 0.26, { ini: 0.2, formante: 0.85 })] },
  'voz-tama-dor': { var: 0.05, c: [vz(220, 120, 'ou', 0.3, 0.38, { aspero: 0.3, vib: [9, 0.4], formante: 0.85 })] },
  'voz-lili-ok': { var: 0.05, c: [vz(520, 700, 'ie', 0.14, 0.26, { formante: 1.35 }), vz(700, 760, 'i', 0.1, 0.22, { ini: 0.15, formante: 1.35 })] },
  'voz-lili-dor': { var: 0.05, c: [vz(820, 450, 'ai', 0.25, 0.32, { vib: [12, 0.5], formante: 1.35 })] },
  arroto: { c: [vz(95, 70, 'oa', 0.5, 0.42, { aspero: 0.6, trem: [28, 0.8], onda: 'square', formante: 0.8 })] },
  espirro: { c: [vz(400, 600, 'aai', 0.3, 0.22, { formante: 1.1 }), r('highpass', 2500, 4000, 0.7, 0.25, 0.45, { ini: 0.32 }), vz(600, 300, 'u', 0.12, 0.25, { ini: 0.32 })] },
  bocejo: { c: [vz(240, 170, 'aaou', 1.1, 0.3, { aspero: 0.25, at: 0.2, sus: true, formante: 0.9 })] },
  'grito-eco': {
    rev: 0.8,
    c: [
      vz(300, 330, 'eo', 0.4, 0.42, { formante: 1.0 }),
      vz(300, 330, 'eo', 0.4, 0.22, { ini: 0.33, formante: 0.9 }),
      vz(300, 330, 'eo', 0.4, 0.11, { ini: 0.66, formante: 0.8 }),
      vz(300, 330, 'eo', 0.4, 0.05, { ini: 0.99, formante: 0.7 }),
    ],
  },
  dano: { c: [o('square', 600, 150, 0.18, 0.18, { filt: lp(2000) }), r('bandpass', 1500, undefined, 1, 0.1, 0.22)] },
  morte: { rev: 0.4, c: [ns('square', 72, [0, -1, -2, -3, -4, -5, -7, -12], 0.1, 0.14, 0.13, { filt: lp(1800) }), o('sine', 300, 60, 1, 0.13, { ini: 0.2 })] },
  escalar: { vol: 2, var: 0.06, c: [r('bandpass', 1800, undefined, 2, 0.07, 0.18, { rep: [2, 0.11] }), o('triangle', 500, 400, 0.04, 0.07, { rep: [2, 0.11] })] },
  bracada: { vol: 2.5, var: 0.06, c: [r('bandpass', 600, 300, 1, 0.35, 0.32, { at: 0.05, cor: 'rosa' }), o('sine', 150, 90, 0.3, 0.09), o('sine', 600, 1500, 0.05, 0.08, { ini: 0.2, rep: [2, 0.07] })] },
  bolha: { var: 0.15, c: [o('sine', 400, 1300, 0.07, 0.22), o('sine', 600, 1700, 0.06, 0.12, { ini: 0.05 })] },
  'agua-entrar': { c: [r('lowpass', 2500, 300, 1, 0.6, 0.5, { cor: 'rosa' }), o('sine', 200, 60, 0.35, 0.36), o('sine', 500, 1500, 0.05, 0.1, { ini: 0.15, rep: [4, 0.07] })] },
  'agua-sair': { c: [r('highpass', 800, 3000, 0.7, 0.4, 0.32), o('sine', 900, 1800, 0.04, 0.1, { ini: 0.1, rep: [3, 0.09] })] },
  pisao: { var: 0.05, c: [o('square', 220, 70, 0.1, 0.25, { filt: lp(1200) }), o('sine', 140, 50, 0.15, 0.38), r('lowpass', 800, undefined, 1, 0.05, 0.18)] },
  'pisao-forte': { c: [o('square', 260, 60, 0.14, 0.28, { filt: lp(1500) }), o('sine', 160, 40, 0.25, 0.5), fm(180, 90, 2.3, 6, 0.12, 0.15), r('bandpass', 2000, 800, 1, 0.12, 0.25)] },
  'inimigo-derrota': { c: [ns('square', 76, [0, -5, 7, 12], 0.05, 0.08, 0.1, { filt: lp(3000) }), r('highpass', 3000, undefined, 0.7, 0.15, 0.12), r('bandpass', 1000, 400, 1, 0.25, 0.18, { ini: 0.18 })] },
  'lata-quebra': { c: [fm(700, 500, 2.3, 5, 0.25, 0.18), r('highpass', 3500, undefined, 0.7, 0.2, 0.25), o('square', 900, 400, 0.08, 0.06, { rep: [3, 0.05] })] },

  // ------------------------------------------------------------------ inimigos
  'javali-grunhido': { var: 0.08, c: [vz(110, 90, 'ou', 0.3, 0.38, { aspero: 0.7, trem: [30, 0.9], onda: 'square', formante: 0.8 })] },
  'javali-susto': { c: [vz(300, 700, 'i', 0.25, 0.36, { aspero: 0.4, vib: [14, 0.6] }), o('square', 500, 1200, 0.2, 0.06, { filt: lp(2500) })] },
  'serrote-zumbido': { c: [o('sawtooth', 180, 170, 0.8, 0.14, { sus: true, trem: [45, 0.6], filt: bp(1800, undefined, 2) }), o('square', 360, undefined, 0.8, 0.04, { sus: true })] },
  'marimbondo-zumbido': { vol: 3, c: [o('sawtooth', 210, 230, 0.9, 0.12, { sus: true, vib: [11, 0.5], filt: bp(900, undefined, 3), trem: [60, 0.3] })] },
  'cascavel-chocalho': { c: [r('bandpass', 6000, undefined, 2, 0.8, 0.3, { sus: true, trem: [38, 0.95] })] },
  'morcego-guincho': { c: [o('sine', 3200, 4200, 0.08, 0.18, { rep: [3, 0.1], vib: [40, 0.6] }), o('square', 2600, 3400, 0.06, 0.04, { rep: [3, 0.1], filt: hp(2000) })] },
  'caranguejo-clique': { vol: 1.8, var: 0.1, c: [o('square', 1800, undefined, 0.015, 0.18, { filt: bp(2500, undefined, 4), rep: [2, 0.06] }), r('highpass', 5000, undefined, 0.7, 0.02, 0.12, { rep: [2, 0.06] })] },
  'baiacu-inflar': { c: [o('sine', 180, 520, 0.45, 0.32, { vib: [18, 0.4] }), r('bandpass', 500, 1500, 1, 0.45, 0.14, { at: 0.2 })] },
  'trator-motor': { c: [o('sawtooth', 55, 62, 1.2, 0.28, { sus: true, trem: [14, 0.7], filt: lp(600), dist: 8 }), r('lowpass', 300, undefined, 1, 1.2, 0.2, { sus: true, trem: [14, 0.5], cor: 'marrom' })] },
  'bau-mordida': { c: [o('square', 300, 120, 0.12, 0.26, { filt: lp(1500) }), fm(160, 120, 1.5, 4, 0.2, 0.28), r('bandpass', 1200, undefined, 1, 0.06, 0.26)] },

  // ------------------------------------------------------------------ cabaça e objetos
  'cabaca-pegar': { c: [o('triangle', 520, 700, 0.08, 0.22), o('sine', 1040, undefined, 0.05, 0.08)] },
  arremesso: { vol: 2.5, var: 0.05, c: [r('bandpass', 700, 2600, 2.5, 0.2, 0.28), o('triangle', 300, 600, 0.12, 0.06)] },
  'cabaca-rolar': { c: [o('triangle', 300, 280, 0.5, 0.18, { trem: [12, 0.8], filt: lp(900) }), r('bandpass', 800, undefined, 1, 0.5, 0.13, { trem: [12, 0.8] })] },
  'cabaca-quebrar': { c: [o('triangle', 380, 180, 0.12, 0.32), r('bandpass', 1800, 900, 0.8, 0.25, 0.32), o('square', 900, 500, 0.03, 0.07, { rep: [4, 0.04] })] },
  'pedra-quebrar': { rev: 0.3, c: [r('lowpass', 2500, 500, 1, 0.4, 0.45, { cor: 'marrom' }), r('bandpass', 3000, undefined, 1, 0.08, 0.26, { rep: [3, 0.05] }), o('sine', 90, 40, 0.3, 0.36)] },
  'madeira-quebrar': { c: [o('triangle', 600, 250, 0.08, 0.3, { rep: [3, 0.04] }), r('bandpass', 1400, 700, 1.5, 0.3, 0.36), fm(240, 180, 1.7, 3, 0.15, 0.12)] },
  'bromelia-mola': { c: [o('triangle', 200, 600, 0.4, 0.36, { vib: [18, 1] }), o('sine', 400, 1200, 0.3, 0.1)] },
  'flor-sugar': { vol: 1.8, c: [r('bandpass', 3000, 500, 3, 0.55, 0.32, { at: 0.3 }), o('sine', 900, 300, 0.5, 0.09, { at: 0.2 })] },
  'flor-disparo': { c: [o('sine', 300, 100, 0.15, 0.45), r('bandpass', 900, 3000, 1, 0.25, 0.35), o('square', 150, undefined, 0.03, 0.26, { filt: lp(800) })] },
  'ninho-quebrar': { c: [r('bandpass', 2500, undefined, 1, 0.05, 0.22, { rep: [5, 0.035] }), ns('triangle', 79, [0, 4, 7, 12, 16], 0.05, 0.2, 0.18, { ini: 0.15 })] },
  'totem-acender': { rev: 0.6, c: [ns('sine', 67, [0, 7, 12, 16, 19, 24], 0.07, 0.6, 0.16), r('highpass', 2000, 6000, 0.7, 0.8, 0.08, { at: 0.3 }), o('sine', 98, undefined, 1, 0.22, { sus: true, at: 0.1 })] },
  'totem-girar': { vol: 2, c: [r('bandpass', 400, 1200, 3, 0.7, 0.28, { trem: [10, 0.6] }), o('triangle', 200, 400, 0.7, 0.13, { trem: [10, 0.6] })] },
  'caixa-quebrar': { c: [o('triangle', 300, 150, 0.1, 0.28), r('bandpass', 1500, undefined, 1, 0.3, 0.36), r('highpass', 3500, undefined, 0.7, 0.04, 0.18, { rep: [4, 0.05] })] },
  'carrinho-trilho': { c: [o('square', 90, undefined, 0.9, 0.1, { sus: true, filt: lp(400), trem: [8, 0.6] }), fm(900, 880, 1.5, 2, 0.04, 0.13, { rep: [4, 0.22] }), r('bandpass', 2500, undefined, 1, 0.9, 0.06, { sus: true, trem: [16, 0.5] })] },
  'lamparina-acender': { vol: 1.6, c: [r('bandpass', 3000, 1500, 1, 0.12, 0.28), r('lowpass', 800, undefined, 1, 0.5, 0.2, { ini: 0.08, at: 0.1 }), o('sine', 160, 240, 0.4, 0.13, { ini: 0.08 })] },
  fogo: { c: [r('lowpass', 900, undefined, 0.7, 1, 0.28, { sus: true, at: 0.1, trem: [7, 0.4] }), r('highpass', 4000, undefined, 0.7, 0.01, 0.22, { rep: [8, 0.11] })] },
  'teia-queimar': { c: [r('highpass', 2500, 5000, 0.7, 0.6, 0.22, { trem: [25, 0.6] }), r('lowpass', 700, undefined, 1, 0.7, 0.18, { at: 0.1 }), o('sine', 1200, 600, 0.5, 0.05)] },
  'painel-desligar': { c: [o('sawtooth', 440, 55, 0.7, 0.18, { filt: lp(2000, 300) }), o('square', 60, undefined, 0.3, 0.08), o('square', 2000, undefined, 0.01, 0.18)] },

  // ------------------------------------------------------------------ coletáveis
  castanha: { c: [o('sine', 1568, undefined, 0.25, 0.22), o('sine', 2349, undefined, 0.3, 0.17, { ini: 0.04 }), o('sine', 6230, undefined, 0.02, 0.05)] },
  cacho: { c: [ns('triangle', 84, [0, 4, 7, 12, 16], 0.03, 0.25, 0.18), o('sine', 3136, undefined, 0.4, 0.05, { ini: 0.15 })] },
  letra: { rev: 0.4, c: [ns('sine', 79, [0, 5, 9, 12], 0.08, 0.35, 0.22), o('triangle', 1568, undefined, 0.5, 0.05, { ini: 0.24 })] },
  'letras-completas': { rev: 0.4, c: [ns('square', 72, [0, 4, 7, 12, 7, 12, 16, 19, 24], 0.09, 0.2, 0.12, { filt: lp(3500) }), ns('triangle', 60, [0, 7, 12], 0.27, 0.6, 0.18)] },
  vida: { rev: 0.3, c: [ns('triangle', 76, [0, 4, 7, 12, 16, 19, 24], 0.07, 0.3, 0.2), ns('sine', 64, [0, 7, 12], 0.2, 0.5, 0.15)] },
  'moeda-folha': { rev: 0.6, c: [ns('sine', 81, [0, 7, 12, 19, 24], 0.06, 0.8, 0.18), r('highpass', 6000, undefined, 0.7, 0.9, 0.05, { trem: [12, 0.6] }), fm(1760, undefined, 3.5, 2, 1.2, 0.07, { ini: 0.3 })] },
  ficha: { vol: 2, c: [o('square', 1300, undefined, 0.04, 0.1, { filt: bp(1300, undefined, 3) }), o('sine', 2600, undefined, 0.15, 0.1, { ini: 0.04 })] },
  parafuso: { c: [fm(1200, 1100, 2.7, 2, 0.2, 0.13), o('square', 2400, undefined, 0.02, 0.06)] },
  'balao-estouro': { c: [r('highpass', 800, 3000, 0.7, 0.08, 0.5), o('sine', 300, 80, 0.07, 0.25)] },

  // ------------------------------------------------------------------ armas de mão (seção 17)
  'arma-pegar': { c: [o('triangle', 300, 500, 0.07, 0.22), r('bandpass', 2000, undefined, 1, 0.04, 0.16)] },
  'golpe-leve': { vol: 2.5, var: 0.07, c: [r('bandpass', 1500, 3500, 2, 0.1, 0.28)] },
  'golpe-pesado': { var: 0.05, c: [r('bandpass', 500, 1500, 1.5, 0.22, 0.32), o('sine', 120, 60, 0.2, 0.13)] },
  'golpe-acerto': { var: 0.06, c: [o('square', 200, 70, 0.08, 0.3, { filt: lp(1500) }), r('bandpass', 1200, undefined, 1, 0.06, 0.36), o('sine', 90, 50, 0.12, 0.32)] },
  'arma-quebrar': { c: [r('highpass', 2000, undefined, 0.7, 0.25, 0.26), o('triangle', 700, 200, 0.2, 0.18), r('bandpass', 2600, undefined, 1, 0.03, 0.15, { rep: [4, 0.045], ini: 0.05 })] },
  pooin: { rev: 0.3, c: [o('sine', 330, 260, 0.7, 0.32, { vib: [7, 0.3] }), fm(330, 300, 1.47, 3, 0.5, 0.17), o('triangle', 165, undefined, 0.4, 0.17)] },
  plaft: { c: [r('lowpass', 1800, 400, 1, 0.15, 0.45), o('sine', 250, 100, 0.08, 0.26), r('bandpass', 3000, undefined, 1, 0.05, 0.18)] },
  foom: { rev: 0.4, c: [o('sawtooth', 110, 104, 0.6, 0.18, { sus: true, filt: lp(600, 1400), dist: 6 }), o('sawtooth', 139, 131, 0.6, 0.14, { sus: true, filt: lp(700, 1500) }), r('lowpass', 400, undefined, 1, 0.6, 0.18, { at: 0.02 })] },
  estilingue: { c: [o('sine', 140, 520, 0.09, 0.18), r('bandpass', 2000, 4000, 1, 0.08, 0.26, { ini: 0.02 }), o('triangle', 330, 300, 0.2, 0.13, { vib: [30, 0.5] })] },
  cupins: { vol: 2, c: [r('lowpass', 800, undefined, 1, 0.3, 0.28), r('bandpass', 3500, undefined, 3, 1, 0.18, { trem: [33, 0.8], sus: true, ini: 0.1 }), o('sawtooth', 600, undefined, 1, 0.03, { vib: [17, 1], ini: 0.1, sus: true })] },
  'guarda-chuva-abrir': { vol: 1.6, c: [r('bandpass', 1000, 4000, 1.5, 0.18, 0.32), o('triangle', 400, 800, 0.12, 0.09), o('sine', 200, undefined, 0.05, 0.18, { ini: 0.17 })] },
  'remo-surf': { c: [r('bandpass', 900, 600, 0.8, 0.9, 0.28, { at: 0.2, sus: true, trem: [3, 0.4] }), r('highpass', 4000, undefined, 0.7, 0.9, 0.09, { sus: true })] },
  'vassoura-varrer': { c: [r('bandpass', 3500, 2000, 1, 0.3, 0.32, { at: 0.05 }), r('bandpass', 3000, undefined, 1, 0.25, 0.22, { ini: 0.3 })] },
  'jaca-splat': { c: [r('lowpass', 1500, 300, 1, 0.3, 0.55, { cor: 'marrom' }), o('sine', 180, 70, 0.2, 0.36), r('bandpass', 900, undefined, 1, 0.2, 0.18, { ini: 0.05, trem: [20, 0.6] })] },
  'coco-quique': { c: [o('sine', 380, 300, 0.1, 0.36), fm(380, 320, 1.6, 2, 0.08, 0.1), o('sine', 380, 300, 0.1, 0.22, { ini: 0.28 }), o('sine', 380, 300, 0.1, 0.13, { ini: 0.48 })] },
  'galho-bumerangue': { vol: 2.5, c: [r('bandpass', 1200, undefined, 4, 0.8, 0.28, { trem: [9, 0.9] }), o('triangle', 200, 220, 0.8, 0.05, { trem: [9, 0.9] })] },
  'chave-desmontar': { c: [fm(800, 600, 2.1, 6, 0.3, 0.18), o('square', 1500, undefined, 0.02, 0.1, { rep: [5, 0.05], ini: 0.1, filt: bp(2500, undefined, 2) }), r('highpass', 3000, undefined, 0.7, 0.2, 0.15)] },
  'capacete-cabecada': { c: [fm(260, 180, 1.4, 4, 0.2, 0.26), o('sine', 120, 60, 0.15, 0.3)] },
  'coco-agua': { vol: 2, c: [r('lowpass', 2000, 600, 1, 0.5, 0.3, { cor: 'rosa' }), o('sine', 700, 1600, 0.05, 0.08, { rep: [5, 0.06] })] },

  // ------------------------------------------------------------------ montarias
  montar: { c: [ns('triangle', 67, [0, 5, 7, 12], 0.05, 0.16, 0.18), o('sine', 120, 70, 0.15, 0.3, { ini: 0.18 })] },
  desmontar: { vol: 1.6, c: [ns('triangle', 79, [0, -5, -7, -12], 0.05, 0.14, 0.16), r('bandpass', 700, 2500, 2, 0.18, 0.18)] },
  'pirarucu-investida': { c: [r('lowpass', 600, 2000, 1, 0.5, 0.4, { cor: 'marrom' }), o('sine', 90, 150, 0.4, 0.22), o('sine', 500, 1400, 0.05, 0.08, { ini: 0.2, rep: [4, 0.06] })] },
  'ema-corrida': { c: [o('sine', 140, 90, 0.06, 0.36, { rep: [6, 0.09] }), r('lowpass', 700, undefined, 1, 0.05, 0.18, { rep: [6, 0.09] })] },
  'ema-chute': { c: [o('sine', 200, 60, 0.12, 0.45), r('bandpass', 1800, undefined, 1, 0.06, 0.32), vz(900, 600, 'a', 0.12, 0.18, { onda: 'square', formante: 1.3 })] },
  'tatu-rolar': { c: [r('lowpass', 500, undefined, 0.7, 0.8, 0.36, { sus: true, trem: [18, 0.5] }), o('square', 70, undefined, 0.8, 0.09, { trem: [18, 0.5], filt: lp(300), sus: true })] },
  'tatu-cavar': { c: [r('lowpass', 1200, 400, 1, 0.1, 0.42, { cor: 'marrom', rep: [4, 0.12] }), r('bandpass', 2500, undefined, 1, 0.03, 0.14, { rep: [4, 0.12] })] },

  // ------------------------------------------------------------------ chefes e máquinas
  'chefe-rugido': { rev: 0.5, c: [vz(85, 70, 'aou', 1.2, 0.48, { aspero: 0.7, vib: [7, 0.8], formante: 0.75 }), o('sawtooth', 42, 40, 1.2, 0.26, { sus: true, filt: lp(300) })] },
  'chefe-dano': { c: [o('square', 400, 120, 0.3, 0.26, { filt: lp(2500) }), vz(180, 260, 'ai', 0.3, 0.32, { aspero: 0.4 }), r('bandpass', 2000, undefined, 1, 0.1, 0.26)] },
  'chefe-explosao': { rev: 0.5, c: [r('lowpass', 3000, 150, 1, 2.2, 0.65, { cor: 'marrom' }), o('sine', 70, 25, 1.5, 0.55), r('bandpass', 1500, 600, 1, 0.5, 0.36, { rep: [3, 0.35] })] },
  'serra-gigante': { c: [o('sawtooth', 120, 135, 1.2, 0.18, { sus: true, trem: [50, 0.5], filt: bp(1400, undefined, 2), dist: 5 }), o('square', 2400, 2600, 1.2, 0.04, { sus: true, filt: hp(2000) }), r('highpass', 5000, undefined, 0.7, 1.2, 0.08, { sus: true })] },
  motosserra: { c: [o('sawtooth', 85, 140, 1.0, 0.22, { sus: true, trem: [38, 0.6], filt: lp(2200), dist: 10 }), r('bandpass', 3000, undefined, 1, 1, 0.09, { sus: true })] },
  draga: { c: [o('sawtooth', 48, 46, 1.4, 0.26, { sus: true, filt: lp(400), dist: 6, trem: [6, 0.5] }), r('lowpass', 900, undefined, 1, 1.4, 0.22, { cor: 'marrom', sus: true }), o('sine', 400, 1200, 0.06, 0.08, { ini: 0.3, rep: [5, 0.17] })] },
  'robo-passo': { var: 0.04, c: [fm(140, 120, 1.41, 6, 0.25, 0.36), r('highpass', 3000, undefined, 0.7, 0.05, 0.22), o('sine', 60, 40, 0.2, 0.36), o('square', 500, 700, 0.12, 0.04, { ini: 0.08, filt: lp(1500) })] },
  alarme: { c: [o('square', 880, undefined, 0.25, 0.13, { rep: [4, 0.5], filt: lp(3000), sus: true }), o('square', 660, undefined, 0.25, 0.13, { ini: 0.25, rep: [4, 0.5], filt: lp(3000), sus: true })] },
  explosao: { rev: 0.4, c: [r('lowpass', 2500, 200, 1, 1.2, 0.65, { cor: 'marrom' }), o('sine', 80, 30, 0.8, 0.55), r('bandpass', 3000, undefined, 1, 0.2, 0.26)] },

  // ------------------------------------------------------------------ gags (seção 18)
  'preguica-ronco': { c: [vz(70, 65, 'oo', 1, 0.32, { aspero: 0.8, at: 0.5, sus: true, formante: 0.7 }), vz(90, 70, 'ah', 0.8, 0.3, { ini: 1.1, aspero: 0.7, formante: 0.7 }), o('sine', 900, 1300, 0.5, 0.04, { ini: 1.2 })] },
  'selfie-click': { vol: 1.4, c: [r('highpass', 3000, undefined, 0.7, 0.02, 0.36), r('bandpass', 2000, undefined, 1, 0.03, 0.26, { ini: 0.08 }), o('sine', 2637, undefined, 0.06, 0.06, { ini: 0.16 })] },
  'sirene-ponto': { rev: 0.4, c: [o('square', 500, 900, 0.7, 0.14, { lin: true, rep: [3, 0.7], filt: lp(2500), sus: true }), o('sawtooth', 250, 450, 0.7, 0.06, { lin: true, rep: [3, 0.7], filt: lp(1200), sus: true })] },
  descarga: { c: [r('lowpass', 1500, 400, 1, 1.8, 0.42, { at: 0.2, cor: 'marrom', trem: [5, 0.3] }), o('sine', 300, 120, 1.5, 0.09, { vib: [6, 0.5] }), o('sine', 200, 500, 0.1, 0.12, { ini: 0.5, rep: [6, 0.2] })] },
  'domino-mesa': { c: [r('bandpass', 2500, undefined, 1, 0.04, 0.36, { rep: [8, 0.045] }), o('triangle', 500, undefined, 0.03, 0.18, { rep: [8, 0.045] }), o('sine', 120, 60, 0.3, 0.45, { ini: 0.35 }), r('lowpass', 800, undefined, 1, 0.3, 0.36, { ini: 0.35 })] },
  conga: { c: [o('sine', 330, 260, 0.2, 0.45), r('bandpass', 1800, undefined, 1, 0.03, 0.22), o('sine', 260, 200, 0.2, 0.36, { ini: 0.15 })] },
  'dj-scratch': { vol: 1.8, c: [r('bandpass', 600, 2800, 4, 0.12, 0.36), r('bandpass', 2800, 500, 4, 0.12, 0.36, { ini: 0.12 }), o('sawtooth', 150, 400, 0.12, 0.09, { filt: lp(1200) }), o('sawtooth', 400, 140, 0.12, 0.09, { ini: 0.12, filt: lp(1200) })] },
  sos: { c: [ns('sine', 86, [0, 0, 0], 0.12, 0.07, 0.16), ns('sine', 86, [0, 0, 0], 0.3, 0.22, 0.16, { ini: 0.45 }), ns('sine', 86, [0, 0, 0], 0.12, 0.07, 0.16, { ini: 1.4 }), o('sine', 400, 1200, 0.06, 0.06, { rep: [6, 0.3] })] },
  'tick-contagem': { vol: 1.5, c: [o('square', 1500, undefined, 0.03, 0.12, { filt: bp(2000, undefined, 2) }), o('sine', 3000, undefined, 0.02, 0.05)] },
  medalha: { rev: 0.5, c: [ns('triangle', 72, [0, 4, 7, 12, 16, 19, 24, 28], 0.06, 0.4, 0.17), fm(2093, undefined, 3.5, 2, 1.2, 0.12, { ini: 0.45 }), r('highpass', 7000, undefined, 0.7, 1, 0.04, { ini: 0.45, trem: [14, 0.7] })] },
  'desafio-ok': { c: [ns('square', 79, [0, 7, 12], 0.09, 0.2, 0.1, { filt: lp(3000) }), ns('triangle', 67, [0, 4, 7], 0.09, 0.3, 0.16)] },
  brinde: { rev: 0.4, c: [o('sine', 2400, 3200, 0.12, 0.18), o('sine', 3000, 2200, 0.2, 0.18, { ini: 0.15 }), ns('triangle', 84, [0, 4, 7, 11, 14], 0.05, 0.25, 0.14, { ini: 0.4 })] },
  combo: { c: [ns('square', 76, [0, 7], 0.05, 0.09, 0.11, { filt: lp(4000) }), o('sine', 1318, undefined, 0.12, 0.08)] },
  checkpoint: { rev: 0.5, c: [ns('triangle', 67, [0, 7, 12, 16, 19], 0.08, 0.5, 0.18), o('sine', 3136, undefined, 0.6, 0.06, { ini: 0.4 }), r('highpass', 6000, undefined, 0.7, 0.6, 0.04, { ini: 0.3 })] },
  'porta-bonus': { rev: 0.7, c: [o('sine', 200, 1600, 0.8, 0.18, { vib: [8, 0.4] }), ns('sine', 84, [0, 3, 7, 10, 14, 17], 0.07, 0.4, 0.13, { ini: 0.3 }), r('bandpass', 3000, 8000, 1, 1, 0.08)] },
  'relogio-tic': { vol: 2, c: [o('square', 2200, undefined, 0.012, 0.13, { filt: bp(2500, undefined, 5) }), o('square', 1700, undefined, 0.012, 0.1, { ini: 0.5, filt: bp(2000, undefined, 5) })] },
};

/** Sons usados pelos ambientes (não aparecem em listSfx). */
export const SONS_AMB: Record<string, Sfx> = {
  'sabia': { c: [o('sine', 2800, 3600, 0.1, 0.15, { vib: [30, 0.3] }), o('sine', 3600, 2600, 0.14, 0.12, { ini: 0.12 }), o('sine', 3100, 3300, 0.08, 0.1, { ini: 0.3 })] },
  'tucano-longe': { c: [vz(600, 500, 'a', 0.12, 0.1, { aspero: 0.3, onda: 'square', rep: [3, 0.16], formante: 1.2 })] },
  'sapo': { c: [o('square', 200, 180, 0.08, 0.1, { trem: [40, 0.8], rep: [2, 0.15], filt: bp(600, undefined, 2) })] },
  'grilo': { c: [o('sine', 4500, undefined, 0.4, 0.04, { trem: [28, 1], sus: true })] },
  'cigarra': { c: [r('bandpass', 5500, 5200, 6, 2, 0.06, { sus: true, trem: [45, 0.7], at: 0.5 })] },
  'macaco-longe': { c: [vz(500, 800, 'u', 0.2, 0.08, { rep: [3, 0.25], formante: 1.2 })] },
  'folhas': { c: [r('bandpass', 3000, 2000, 1, 0.5, 0.05, { at: 0.2, cor: 'rosa' })] },
  'gota': { c: [o('sine', 700, 1800, 0.07, 0.16)] },
  'gota-eco': { rev: 1, c: [o('sine', 520, 1500, 0.08, 0.18), o('sine', 520, 1500, 0.08, 0.06, { ini: 0.24 })] },
  'morcego-longe': { c: [o('sine', 3800, 4600, 0.05, 0.04, { rep: [4, 0.07] })] },
  'pedrinhas': { c: [r('bandpass', 2600, undefined, 2, 0.03, 0.08, { rep: [5, 0.09] })] },
  'onda': { c: [r('lowpass', 500, 1800, 0.8, 3.2, 0.2, { at: 1.4, cor: 'rosa' }), r('highpass', 3000, undefined, 0.7, 1.5, 0.05, { ini: 1.4, at: 0.3 })] },
  'gaivota': { c: [vz(1200, 900, 'ea', 0.3, 0.07, { onda: 'square', formante: 1.6, rep: [2, 0.35] })] },
  'bolhas': { c: [o('sine', 500, 1400, 0.05, 0.08, { rep: [4, 0.08] })] },
  'canto-fundo': { rev: 1, c: [o('sine', 300, 520, 2, 0.06, { at: 0.6, vib: [3, 0.4] }), o('sine', 520, 380, 1.5, 0.04, { ini: 1.8, at: 0.4 })] },
  'estalo-coral': { c: [r('highpass', 5000, undefined, 0.7, 0.01, 0.06, { rep: [3, 0.03] })] },
  'clank': { rev: 0.8, c: [fm(420, 400, 2.31, 5, 0.6, 0.08), r('highpass', 3000, undefined, 0.7, 0.04, 0.06)] },
  'vapor': { c: [r('highpass', 3000, 2400, 0.6, 1.1, 0.06, { at: 0.08 })] },
  'martelo': { rev: 0.8, c: [fm(900, 880, 1.41, 3, 0.25, 0.07, { rep: [3, 0.42] })] },
  'sirene-longe': { rev: 1, c: [o('square', 400, 600, 1.5, 0.025, { lin: true, filt: lp(1200), sus: true })] },
  'pingos': { c: [o('sine', 2200, 1400, 0.02, 0.05)] },
  'trovao': { rev: 0.6, c: [r('lowpass', 400, 90, 1, 3.5, 0.32, { cor: 'marrom', at: 0.15 }), r('lowpass', 900, 200, 1, 0.4, 0.15)] },
  'pipira': { c: [o('sine', 4200, 5000, 0.04, 0.08, { rep: [6, 0.06] })] },
  'cristal-tinido': { rev: 1, c: [fm(2637, undefined, 3.73, 1.5, 1.4, 0.05)] },
  'cristal-acorde': { rev: 1, c: [ns('sine', 84, [0, 7, 14, 19, 23], 0.18, 1.8, 0.04)] },
};

export interface Leito { cor: Cor; filt: Filt; vol: number; lfo?: [number, number]; pan?: number }
export interface Zumbido { onda: Onda; f: number; vol: number; filt?: Filt; trem?: [number, number] }
export interface EventoAmb { som: string; cada: [number, number]; vol: [number, number]; pitch: [number, number]; pan: [number, number] }
export interface Ambiente { leitos: Leito[]; zumbidos?: Zumbido[]; eventos: EventoAmb[]; semente: number }

export const AMBIENTES: Record<string, Ambiente> = {
  'amb-mata': {
    semente: 1101,
    leitos: [{ cor: 'rosa', filt: bp(1800, undefined, 0.5), vol: 0.05, lfo: [0.07, 600] }, { cor: 'marrom', filt: lp(400), vol: 0.06 }],
    eventos: [
      { som: 'sabia', cada: [1.5, 4], vol: [0.4, 1], pitch: [0.9, 1.15], pan: [-0.8, 0.8] },
      { som: 'tucano-longe', cada: [6, 12], vol: [0.5, 1], pitch: [0.9, 1.1], pan: [-0.9, 0.9] },
      { som: 'cigarra', cada: [8, 15], vol: [0.4, 0.9], pitch: [0.95, 1.05], pan: [-0.6, 0.6] },
      { som: 'grilo', cada: [3, 6], vol: [0.4, 0.8], pitch: [0.9, 1.1], pan: [-1, 1] },
      { som: 'sapo', cada: [5, 10], vol: [0.5, 1], pitch: [0.85, 1.2], pan: [-0.7, 0.7] },
      { som: 'macaco-longe', cada: [12, 25], vol: [0.5, 1], pitch: [0.9, 1.1], pan: [-1, 1] },
      { som: 'folhas', cada: [3, 7], vol: [0.5, 1], pitch: [0.8, 1.2], pan: [-0.9, 0.9] },
    ],
  },
  'amb-gruta': {
    semente: 2203,
    leitos: [{ cor: 'marrom', filt: lp(200), vol: 0.08, lfo: [0.04, 60] }, { cor: 'rosa', filt: bp(600, undefined, 3), vol: 0.02, lfo: [0.05, 200] }],
    eventos: [
      { som: 'gota', cada: [0.7, 2.2], vol: [0.4, 1], pitch: [0.8, 1.3], pan: [-0.9, 0.9] },
      { som: 'gota-eco', cada: [3, 6], vol: [0.5, 1], pitch: [0.85, 1.1], pan: [-0.6, 0.6] },
      { som: 'morcego-longe', cada: [8, 16], vol: [0.4, 1], pitch: [0.9, 1.1], pan: [-1, 1] },
      { som: 'pedrinhas', cada: [10, 20], vol: [0.5, 1], pitch: [0.8, 1.1], pan: [-0.8, 0.8] },
    ],
  },
  'amb-recife': {
    semente: 3307,
    leitos: [{ cor: 'marrom', filt: lp(350), vol: 0.1, lfo: [0.1, 150] }, { cor: 'rosa', filt: bp(900, undefined, 2), vol: 0.02, lfo: [0.13, 300] }],
    eventos: [
      { som: 'bolhas', cada: [1, 3], vol: [0.4, 1], pitch: [0.8, 1.3], pan: [-0.8, 0.8] },
      { som: 'canto-fundo', cada: [12, 22], vol: [0.5, 1], pitch: [0.8, 1.1], pan: [-0.5, 0.5] },
      { som: 'estalo-coral', cada: [0.3, 1], vol: [0.3, 0.9], pitch: [0.9, 1.2], pan: [-1, 1] },
    ],
  },
  'amb-praia': {
    semente: 4409,
    leitos: [{ cor: 'rosa', filt: lp(1200), vol: 0.05, lfo: [0.15, 500] }, { cor: 'branco', filt: hp(5000), vol: 0.01, lfo: [0.09, 1500] }],
    eventos: [
      { som: 'onda', cada: [4, 6.5], vol: [0.6, 1], pitch: [0.9, 1.1], pan: [-0.4, 0.4] },
      { som: 'gaivota', cada: [5, 10], vol: [0.5, 1], pitch: [0.9, 1.15], pan: [-1, 1] },
      { som: 'estalo-coral', cada: [4, 9], vol: [0.5, 1], pitch: [0.6, 0.8], pan: [-0.8, 0.8] },
      { som: 'sabia', cada: [6, 12], vol: [0.3, 0.6], pitch: [1, 1.2], pan: [-1, 1] },
    ],
  },
  'amb-fabrica': {
    semente: 5501,
    leitos: [{ cor: 'marrom', filt: lp(120), vol: 0.12 }, { cor: 'rosa', filt: bp(900, undefined, 2), vol: 0.025, lfo: [1.6, 250] }],
    zumbidos: [{ onda: 'square', f: 50, vol: 0.012, filt: lp(300) }, { onda: 'sine', f: 100, vol: 0.01 }],
    eventos: [
      { som: 'clank', cada: [1.5, 4], vol: [0.5, 1], pitch: [0.7, 1.2], pan: [-0.9, 0.9] },
      { som: 'vapor', cada: [3, 7], vol: [0.5, 1], pitch: [0.9, 1.1], pan: [-0.8, 0.8] },
      { som: 'martelo', cada: [2, 5], vol: [0.5, 1], pitch: [0.85, 1.1], pan: [-1, 1] },
      { som: 'sirene-longe', cada: [20, 40], vol: [0.6, 1], pitch: [0.9, 1.05], pan: [-0.5, 0.5] },
    ],
  },
  'amb-copa': {
    semente: 6607,
    leitos: [{ cor: 'rosa', filt: bp(2500, undefined, 0.5), vol: 0.05, lfo: [0.05, 1200] }, { cor: 'branco', filt: hp(6000), vol: 0.008, lfo: [0.08, 2000] }],
    eventos: [
      { som: 'sabia', cada: [1, 3], vol: [0.5, 1], pitch: [0.95, 1.25], pan: [-1, 1] },
      { som: 'pipira', cada: [3, 7], vol: [0.5, 1], pitch: [0.9, 1.1], pan: [-1, 1] },
      { som: 'folhas', cada: [2, 5], vol: [0.6, 1], pitch: [0.9, 1.3], pan: [-0.9, 0.9] },
      { som: 'tucano-longe', cada: [8, 15], vol: [0.6, 1], pitch: [0.95, 1.1], pan: [-1, 1] },
    ],
  },
  'amb-chuva': {
    semente: 7703,
    leitos: [{ cor: 'rosa', filt: lp(6000), vol: 0.12, lfo: [0.11, 1500] }, { cor: 'branco', filt: bp(4000, undefined, 0.8), vol: 0.04 }, { cor: 'marrom', filt: lp(300), vol: 0.05 }],
    eventos: [
      { som: 'pingos', cada: [0.05, 0.25], vol: [0.3, 1], pitch: [0.7, 1.4], pan: [-1, 1] },
      { som: 'trovao', cada: [15, 30], vol: [0.5, 1], pitch: [0.8, 1.1], pan: [-0.6, 0.6] },
      { som: 'sapo', cada: [6, 12], vol: [0.4, 0.8], pitch: [0.8, 1], pan: [-0.8, 0.8] },
    ],
  },
  'amb-cristal': {
    semente: 8807,
    leitos: [{ cor: 'rosa', filt: hp(6000), vol: 0.01, lfo: [0.2, 2000] }],
    zumbidos: [{ onda: 'sine', f: 523.25, vol: 0.01, trem: [0.3, 0.5] }, { onda: 'sine', f: 783.99, vol: 0.007, trem: [0.23, 0.6] }],
    eventos: [
      { som: 'cristal-tinido', cada: [0.8, 2.5], vol: [0.4, 1], pitch: [0.75, 1.5], pan: [-1, 1] },
      { som: 'cristal-acorde', cada: [6, 10], vol: [0.6, 1], pitch: [0.89, 1.12], pan: [-0.5, 0.5] },
    ],
  },
};
