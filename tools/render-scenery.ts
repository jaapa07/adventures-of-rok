/**
 * Renderiza cenas autorais (tiles, parallax, decor, mapa, cinemáticas) e escreve o manifesto
 * public/assets/scenery.json (mesclando o existente).
 * Uso: tsx tools/render-scenery.ts [prefixo-id ...]   (sem argumentos: tudo)
 *      tsx tools/render-scenery.ts --manifest           (só reescreve o manifesto)
 */
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { openRenderPage, writeDataUrl, readJson, ROOT } from './lib/renderhost';
import { sceneryManifestBase } from './scenery/manifest';

const args = process.argv.slice(2);
const onlyManifest = args.includes('--manifest');
const ids = args.filter((a) => !a.startsWith('--'));
const MANIFEST = resolve(ROOT, 'public/assets/scenery.json');
const manifest = readJson<Record<string, any>>(MANIFEST, {});
manifest.decor ??= {};

const t0 = Date.now();
let n = 0;
if (!onlyManifest) {
  const { SCENES } = await import('./scenery/index');
  const metaById = new Map(SCENES.map((s) => [s.id, s.meta]));
  const { browser, page } = await openRenderPage();
  const scenes = (await page.evaluate(() => window.listScenes())) as { id: string; out: string; w: number; h: number }[];
  const fila = scenes.filter((s) => !ids.length || ids.some((p) => s.id.startsWith(p)));
  if (ids.length && !fila.length) console.error('nenhuma cena para', ids.join(', '));
  for (const s of fila) {
    const r = (await page.evaluate((id: string) => window.renderScene(id), s.id)) as { dataUrl: string; out: string };
    const meta = metaById.get(s.id);
    let dataUrl = r.dataUrl;
    let ox = 0, oy = 0, w = s.w, h = s.h;
    if (meta?.crop) {
      const c = (await page.evaluate(async (url: string) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        const x = cv.getContext('2d', { willReadFrequently: true })!;
        x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, cv.width, cv.height).data;
        let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
        for (let j = 0; j < cv.height; j++) for (let i = 0; i < cv.width; i++) if (d[(j * cv.width + i) * 4 + 3] > 6) {
          if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j;
        }
        if (x1 < 0) return { dataUrl: url, x: 0, y: 0, w: cv.width, h: cv.height, empty: true };
        x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(cv.width - 1, x1 + 2); y1 = Math.min(cv.height - 1, y1 + 2);
        const o = document.createElement('canvas');
        o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
        o.getContext('2d')!.drawImage(cv, -x0, -y0);
        const touches = x0 === 0 || y0 === 0 || x1 === cv.width - 1 || y1 === cv.height - 1;
        return { dataUrl: o.toDataURL('image/webp', 0.9), x: x0, y: y0, w: o.width, h: o.height, touches };
      }, r.dataUrl)) as { dataUrl: string; x: number; y: number; w: number; h: number; empty?: boolean; touches?: boolean };
      if (c.empty) console.error(`⚠ ${s.id}: imagem vazia`);
      if (c.touches) console.warn(`⚠ ${s.id}: conteúdo encosta na borda da tela de render (pode estar cortado)`);
      dataUrl = c.dataUrl; ox = c.x; oy = c.y; w = c.w; h = c.h;
    }
    writeDataUrl(resolve(ROOT, 'public/assets', r.out), dataUrl);
    if (meta?.kind === 'decor' && meta.key) {
      const [ax, ay] = meta.anchor ?? [w / 2, h];
      manifest.decor[meta.key] = { src: `assets/${r.out}`, w, h, ax: Math.round(ax - ox), ay: Math.round(ay - oy) };
    }
    n++;
  }
  await browser.close();
}

// partes determinísticas do manifesto (parallax, céu, água, nós do mapa)
Object.assign(manifest, sceneryManifestBase());
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`${n} cenas em ${((Date.now() - t0) / 1000).toFixed(1)}s · manifesto: ${Object.keys(manifest.decor).length} decor, ${Object.keys(manifest.parallax ?? {}).length} parallax, ${Object.keys(manifest.mapNodes ?? {}).length} nós do mapa`);
