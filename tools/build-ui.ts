/**
 * Build da UI: copia/otimiza os SVGs autorais de assets-src/ui para public/assets/ui,
 * monta o sprite da fonte "Sumaúma Entalhada" (glifos base + acentuados compostos)
 * e gera a camada de texto entalhado da logo ADVENTURES OF ROK a partir dos próprios glifos.
 * Uso: tsx tools/build-ui.ts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carvedDefs, carvedLayers, GLYPH_PAD, SPACE_W, type CarvedTone } from '../src/ui/components/carved-style';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'assets-src/ui');
const OUT = resolve(ROOT, 'public/assets/ui');

function minify(svg: string) {
  return svg
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
}
function write(file: string, text: string) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); }

/* ---------------- fonte ---------------- */
interface Glyph { ch: string; w: number; d: string }
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const fontSrc = readFileSync(resolve(SRC, 'fonte/sumauma-entalhada.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const glyphs = new Map<string, Glyph>();
const accents = new Map<string, string>();
for (const m of fontSrc.matchAll(/<path\s+([^>]*?)\/>/g)) {
  const attrs = Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
  if (attrs['data-ch'] !== undefined) glyphs.set(decode(attrs['data-ch']), { ch: decode(attrs['data-ch']), w: Number(attrs['data-w']), d: attrs.d });
  else if (attrs['data-accent']) accents.set(attrs['data-accent'], attrs.d);
}
/** Desloca um path com comandos absolutos M/L/Q/T (pares x,y). */
function shift(d: string, dx: number, dy: number) {
  return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(+x + dx).toFixed(1)} ${+(+y + dy).toFixed(1)}`);
}
const COMPOSE: [string, string, string, number?][] = [
  ['Á', 'A', 'agudo'], ['À', 'A', 'grave'], ['Ã', 'A', 'til'], ['Â', 'A', 'circunflexo'],
  ['É', 'E', 'agudo'], ['Ê', 'E', 'circunflexo'], ['Í', 'I', 'agudo'], ['Ó', 'O', 'agudo'], ['Ô', 'O', 'circunflexo'],
  ['Õ', 'O', 'til'], ['Ú', 'U', 'agudo'], ['Ç', 'C', 'cedilha', 0],
];
for (const [ch, base, acc, cx] of COMPOSE) {
  const b = glyphs.get(base)!;
  const ax = cx ?? b.w / 2;
  const accX = acc === 'cedilha' ? b.w * 0.55 : ax;
  glyphs.set(ch, { ch, w: b.w, d: `${b.d} ${shift(accents.get(acc)!, accX, 0)}` });
}
const cp = (ch: string) => ch.codePointAt(0)!.toString(16);
let sprite = `<svg xmlns="http://www.w3.org/2000/svg" data-font="Sumauma Entalhada"><defs>${carvedDefs('ce')}`;
for (const g of glyphs.values()) sprite += `<path id="g-${cp(g.ch)}" data-w="${g.w}" d="${g.d}"/>`;
sprite += '</defs></svg>';
write(resolve(OUT, 'fonte.svg'), sprite);

/* ---------------- texto entalhado estático (logo) ---------------- */
function carvedStatic(text: string, tone: CarvedTone, cx: number, cy: number, scale: number, tilts: number[], prefix: string) {
  const items: { g: Glyph | null; x: number; w: number }[] = [];
  let x = 0;
  for (const ch of text) {
    if (ch === ' ') { x += SPACE_W; items.push({ g: null, x, w: 0 }); continue; }
    const g = glyphs.get(ch)!;
    items.push({ g, x: x + GLYPH_PAD, w: g.w });
    x += g.w + GLYPH_PAD * 2;
  }
  const W = x;
  const tx = cx - (W * scale) / 2, ty = cy - 75 * scale;
  let gi = 0;
  const glyphPaths = items.filter((i) => i.g).map((i) => {
    const rot = tilts[gi++ % tilts.length];
    return `<path transform="translate(${i.x} 0) rotate(${rot} ${i.w / 2} 75)" d="${i.g!.d}"/>`;
  }).join('');
  const layers = carvedLayers(tone, prefix).map((L) => `<g transform="translate(${L.dx} ${L.dy})" stroke="${L.stroke}" stroke-width="${L.w}" opacity="${L.op}">${glyphPaths}</g>`).join('');
  return `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale})" fill="none" stroke-linecap="round" stroke-linejoin="round">${layers}</g>`;
}
function widthOf(text: string) { let x = 0; for (const ch of text) x += ch === ' ' ? SPACE_W : glyphs.get(ch)!.w + GLYPH_PAD * 2; return x; }
const topS = Math.min(0.56, 540 / widthOf('ADVENTURES OF'));
const logoText = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="440" viewBox="0 0 900 440"><defs>${carvedDefs('lg')}</defs>` +
  carvedStatic('ADVENTURES OF', 'creme', 450, 82, topS, [-2, 1, -1, 2, 0, -2, 1, 2, -1, 0, 1, -2], 'lg') +
  carvedStatic('ROK', 'ouro', 450, 262, Math.min(1.85, 480 / widthOf('ROK')), [-5, 2, 6], 'lg') + '</svg>';
write(resolve(OUT, 'logo/texto.svg'), logoText);

/* ---------------- cópia dos SVGs autorais ---------------- */
let n = 0;
for (const f of walk(SRC)) {
  if (!f.endsWith('.svg') || f.includes('/fonte/')) continue;
  write(resolve(OUT, relative(SRC, f)), minify(readFileSync(f, 'utf8')));
  n++;
}
console.log(`UI: ${glyphs.size} glifos, ${n} SVGs copiados, logo gerada.`);
