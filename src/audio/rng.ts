/** Gerador pseudo-aleatório determinístico (mulberry32) com semente fixa: o áudio nunca usa sorteio do navegador. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a de texto, usado para derivar sementes e alturas de forma estável. */
export function hashTexto(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Fluxo global de variação (sementes fixas): variações sutis de altura/volume em SFX repetidos. */
const fluxo = mulberry32(0x5e1a5a);
export function variar(amplitude: number): number {
  return (fluxo() * 2 - 1) * amplitude;
}
