/** Leitura da notação das faixas para eventos na grade de passos. */
import type { EstiloHarmonia, Faixa, InstId, Parte, PecaId } from '../data/music/types';

export interface Evento { passo: number; dur: number; midi: number; vel: number; inst: InstId | PecaId; parte: Parte }

const NOTAS: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export function notaMidi(s: string): number {
  const l = s[0].toLowerCase();
  let i = 1;
  let ac = 0;
  while (i < s.length - 1 && (s[i] === '#' || s[i] === 'b')) { ac += s[i] === '#' ? 1 : -1; i++; }
  const oct = Number(s.slice(i));
  if (!(l in NOTAS) || !Number.isFinite(oct)) throw new Error('nota inválida: ' + s);
  return NOTAS[l] + ac + (oct + 1) * 12;
}

const QUAL: Record<string, number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus2: [0, 2, 7], sus4: [0, 5, 7],
  dim: [0, 3, 6], aug: [0, 4, 8], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14], '9': [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], '5': [0, 7, 12],
};

export function acorde(sim: string, oitava: number): number[] {
  const semBaixo = sim.split('/')[0];
  const m = /^([A-G])(#|b)?(.*)$/.exec(semBaixo);
  if (!m) throw new Error('acorde inválido: ' + sim);
  const q = QUAL[m[3]];
  if (!q) throw new Error('qualidade inválida: ' + sim);
  let raiz = NOTAS[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  raiz = ((raiz % 12) + 12) % 12;
  // fundamental perto do centro da oitava pedida (voicing fechado, sem saltos grandes)
  let base = raiz + (oitava + 1) * 12;
  if (raiz > 7) base -= 12;
  return q.map((iv) => base + iv);
}

/** Converte uma parte melódica (compassos com `|`) em eventos. */
export function lerParte(texto: string, passoInicial: number, passosCompasso: number, parte: Parte, inst: InstId, eventos: Evento[], ultimo: { ev: Evento | null; dur: number }): number {
  const compassos = texto.split('|');
  let p = passoInicial;
  for (const comp of compassos) {
    const fichas = comp.trim().split(/\s+/).filter(Boolean);
    const ini = p;
    if (fichas.length === 1 && fichas[0] === '-') { ultimo.ev = null; p += passosCompasso; continue; }
    for (const f of fichas) {
      let s = f;
      let vel = 0.8;
      if (s.endsWith('!')) { vel = 1; s = s.slice(0, -1); } else if (s.endsWith('?')) { vel = 0.5; s = s.slice(0, -1); }
      const [nome, durTxt] = s.split(':');
      if (durTxt) ultimo.dur = Number(durTxt);
      const dur = ultimo.dur;
      if (nome === 'r') { ultimo.ev = null; }
      else if (nome === '_') { if (ultimo.ev) ultimo.ev.dur += dur; }
      else {
        const ev: Evento = { passo: p, dur, midi: notaMidi(nome), vel, inst, parte };
        eventos.push(ev);
        ultimo.ev = ev;
      }
      p += dur;
    }
    // compasso incompleto é completado com pausa; compasso estourado mantém a grade
    p = ini + passosCompasso;
  }
  return p;
}

export function lerAcordes(texto: string, passoInicial: number, pc: number, estilo: EstiloHarmonia, inst: InstId, eventos: Evento[], anterior: { a: string }): void {
  const compassos = texto.split('|');
  let p = passoInicial;
  const oit = estilo.oitava ?? 4;
  // primeiro coleta acordes com início e duração (acordes iguais seguidos viram um só no pad)
  const lista: { sim: string; passo: number; dur: number }[] = [];
  for (const comp of compassos) {
    const sims = comp.trim().split(/\s+/).filter(Boolean);
    const n = Math.max(1, sims.length);
    const fatia = pc / n;
    sims.forEach((s0, i) => {
      const s = s0 === '%' ? anterior.a : s0;
      if (s !== '-') anterior.a = s;
      lista.push({ sim: s, passo: p + Math.round(i * fatia), dur: Math.round((i + 1) * fatia) - Math.round(i * fatia) });
    });
    p += pc;
  }
  for (const a of lista) {
    if (a.sim === '-') continue;
    const notas = acorde(a.sim, oit);
    if (estilo.tipo === 'pad') {
      for (const m of notas) eventos.push({ passo: a.passo, dur: a.dur, midi: m, vel: 0.75, inst, parte: 'harmonia' });
    } else if (estilo.tipo === 'arpejo') {
      const pad = estilo.padrao ?? [0, 1, 2, 1];
      const st = estilo.passo ?? 2;
      let k = 0;
      for (let q = 0; q < a.dur; q += st, k++) {
        const idx = pad[k % pad.length];
        const m = notas[idx % notas.length] + 12 * Math.floor(idx / notas.length);
        eventos.push({ passo: a.passo + q, dur: st * 2, midi: m, vel: k % 4 === 0 ? 0.85 : 0.65, inst, parte: 'harmonia' });
      }
    } else {
      const grade = estilo.grade ?? 'x...x...x...x...';
      const curto = estilo.tipo === 'stab';
      for (let q = 0; q < a.dur; q++) {
        const ch = grade[(a.passo + q - passoInicial) % grade.length];
        if (ch !== 'x' && ch !== 'X') continue;
        let prox = q + 1;
        while (prox < a.dur && grade[(a.passo + prox - passoInicial) % grade.length] === '.') prox++;
        const dur = curto ? 1 : Math.max(1, prox - q);
        notas.forEach((m, i) => eventos.push({ passo: a.passo + q + i * 0.12, dur, midi: m, vel: ch === 'X' ? 0.9 : 0.7, inst, parte: 'harmonia' }));
      }
    }
  }
}

const VEL: Record<string, number> = { X: 1, x: 0.75, o: 0.38 };

export interface Compilada {
  faixa: Faixa;
  total: number;
  pc: number;
  porPasso: Evento[][];
  compassos: number;
}

export function compilar(f: Faixa): Compilada {
  const pc = f.passos ?? 16;
  const eventos: Evento[] = [];
  let p = 0;
  const ult = { melodia: { ev: null as Evento | null, dur: 4 }, contra: { ev: null as Evento | null, dur: 4 }, baixo: { ev: null as Evento | null, dur: 4 } };
  const ant = { a: 'C' };
  let compassos = 0;
  for (const id of f.ordem) {
    const s = f.secoes[id];
    if (!s) throw new Error(`seção ${id} ausente em ${f.id}`);
    const n = s.acordes.split('|').length;
    const inst = { ...f.inst, ...(s.inst ?? {}) };
    lerParte(s.melodia, p, pc, 'melodia', inst.melodia, eventos, ult.melodia);
    lerParte(s.contra, p, pc, 'contra', inst.contra, eventos, ult.contra);
    lerParte(s.baixo, p, pc, 'baixo', inst.baixo, eventos, ult.baixo);
    lerAcordes(s.acordes, p, pc, s.estilo ?? f.estilo, inst.harmonia, eventos, ant);
    const pads = s.bateria.trim().split(/\s+/);
    for (let b = 0; b < n; b++) {
      const pid = pads[b % pads.length];
      if (pid === '-') continue;
      const padrao = f.bateria[pid];
      if (!padrao) throw new Error(`padrão ${pid} ausente em ${f.id}`);
      for (const [peca, grade] of Object.entries(padrao) as [PecaId, string][]) {
        for (let q = 0; q < pc && q < grade.length; q++) {
          const v = VEL[grade[q]];
          if (v) eventos.push({ passo: p + b * pc + q, dur: 1, midi: 60, vel: v, inst: peca, parte: 'bateria' });
        }
      }
    }
    p += n * pc;
    compassos += n;
  }
  const total = p;
  const porPasso: Evento[][] = Array.from({ length: total }, () => []);
  for (const e of eventos) {
    const i = Math.floor(e.passo);
    if (i >= 0 && i < total) porPasso[i].push(e);
  }
  return { faixa: f, total, pc, porPasso, compassos };
}
