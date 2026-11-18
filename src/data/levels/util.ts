/** Junta segmentos de tilemap desenhados à mão (cada segmento: lista de linhas de mesma largura). */
export function stitch(...segs: string[][]): string[] {
  const h = segs[0].length;
  segs.forEach((s, i) => {
    if (s.length !== h) throw new Error(`segmento ${i} tem ${s.length} linhas (esperado ${h})`);
    const w = s[0].length;
    s.forEach((r, j) => { if (r.length !== w) throw new Error(`segmento ${i}, linha ${j}: largura ${r.length} (esperado ${w})`); });
  });
  return Array.from({ length: h }, (_, y) => segs.map((s) => s[y]).join(''));
}
/** linha vazia de largura w */
export const vazio = (w: number) => '.'.repeat(w);
export const cheio = (w: number) => '#'.repeat(w);
