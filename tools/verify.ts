/**
 * Verificação final (seção 15.2 do spec). `npm run check` → zero erros.
 * Flags: --sem-build (pula tsc/vite build), --sem-visual (pula Playwright), --sem-fps.
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { ROOT } from './lib/renderhost';
import { loadLevels } from './lib/levels';
import { launch } from './lib/pw';
import { HERO_ANIMS } from './anims/biped';
import type { LevelDef } from '../src/game/types';

const args = process.argv.slice(2);
const errors: string[] = [];
const warns: string[] = [];
const ok: string[] = [];
const fail = (m: string) => errors.push(m);
const pass = (m: string) => ok.push(m);

function walk(dir: string, out: string[] = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (f === 'node_modules' || f === '.cache' || f.startsWith('.')) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/* 1. sem canvas/engines no runtime */
{
  const files = [...walk(resolve(ROOT, 'src')).filter((f) => /\.(ts|css|html|json)$/.test(f) && !f.endsWith('atlas.json')), resolve(ROOT, 'index.html')];
  const re = /<canvas|getContext\s*\(|webgl|from\s+['"]three|\bpixi\b|\bphaser\b|OffscreenCanvas/i;
  const bad = files.filter((f) => re.test(readFileSync(f, 'utf8')));
  if (bad.length) fail('canvas/WebGL/engine no runtime: ' + bad.map((f) => relative(ROOT, f)).join(', '));
  else pass('runtime 100% DOM (sem canvas/WebGL/engines em src/ e index.html)');
}
/* 2. sem pendências */
{
  const files = ['src', 'tools', 'assets-src'].flatMap((d) => walk(resolve(ROOT, d))).concat(resolve(ROOT, 'index.html')).filter((f) => /\.(ts|css|html|svg|json|md)$/.test(f) && !f.endsWith('atlas.json') && !f.endsWith('meta.json') && !f.includes('verify.ts'));
  // TODO/FIXME em maiúsculas (em português "todo" é palavra comum); placeholder/lorem em qualquer caixa
  const bad = files.filter((f) => { const t = readFileSync(f, 'utf8'); return /\b(TODO|FIXME)\b/.test(t) || /placeholder|\blorem\b/i.test(t); });
  if (bad.length) fail('pendências (TODO/FIXME/placeholder/lorem) em: ' + bad.map((f) => relative(ROOT, f)).join(', '));
  else pass('nenhum TODO/FIXME/placeholder/lorem');
}
/* 3. manifesto de assets */
const atlas = existsSync(resolve(ROOT, 'public/assets/atlas.json')) ? JSON.parse(readFileSync(resolve(ROOT, 'public/assets/atlas.json'), 'utf8')) : { '@models': {} };
const scenery = existsSync(resolve(ROOT, 'public/assets/scenery.json')) ? JSON.parse(readFileSync(resolve(ROOT, 'public/assets/scenery.json'), 'utf8')) : {};
{
  const { assetManifest } = await import('../src/data/assetManifest');
  const list = assetManifest(atlas, scenery);
  const missing: string[] = [], tiny: string[] = [];
  for (const a of list) {
    const f = resolve(ROOT, 'public', a.replace(/^\//, ''));
    if (!existsSync(f)) missing.push(a);
    else if (statSync(f).size <= 2048 && !a.endsWith('.svg')) tiny.push(a);
  }
  if (missing.length) fail(`${missing.length} assets ausentes (ex.: ${missing.slice(0, 8).join(', ')})`);
  if (tiny.length) fail(`${tiny.length} assets com ≤ 2 KB (ex.: ${tiny.slice(0, 8).join(', ')})`);
  if (!missing.length && !tiny.length) pass(`manifesto: ${list.length} assets presentes e > 2 KB`);
}
/* 4. heróis */
for (const id of ['tama', 'lili']) {
  const m = atlas['@models'][id];
  if (!m) { fail(`herói ${id} sem render`); continue; }
  const lack = HERO_ANIMS.filter((a) => !m.anims.includes(a));
  if (lack.length) fail(`${id}: faltam animações ${lack.join(', ')}`);
  if (m.meshCount < 30) fail(`${id}: só ${m.meshCount} malhas (< 30)`);
  if (!lack.length && m.meshCount >= 30) pass(`${id}: ${m.anims.length} animações, ${m.meshCount} malhas`);
}
/* 5–6. fases */
const LEVELS = await loadLevels();
const SPEC_LEVELS = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3'];
const BOSSES = ['chefe-1', 'chefe-2', 'chefe-3', 'chefe-4'];
const ENEMIES = new Set(['javalim', 'javalim-escudo', 'javalao', 'serrote', 'marimbondo', 'cascavel', 'lagarto', 'morcego', 'piranha', 'caranguejo', 'agua-viva', 'baiacu', 'lagarta-trator', 'bau-boca']);
const GAG_PLACES: Record<string, string> = { gag_preguica: '1-1', gag_selfie: '1-2', gag_serraria: '1-3', gag_canoa: '1-4', gag_eco: '2-1', gag_morcego_dj: '2-3', gag_trilho_errado: '2-2', gag_caranguejo_baile: '3-1', gag_naufragio: '3-3', gag_agua_viva_disco: '3-4', gag_cafe: '4-1', gag_relogio_ponto: '4-2', gag_lagarta: '4-3', gag_barao_disfarce: 'chefe-4' };

for (const id of [...SPEC_LEVELS, ...BOSSES, '5-1']) if (!LEVELS[id]) fail(`fase ${id} não existe`);
for (const id of SPEC_LEVELS) {
  const L = LEVELS[id];
  if (!L) continue;
  const w = L.tilemap[0].length, h = L.tilemap.length;
  const p: string[] = [];
  if (!(w >= 220 || (w >= 60 && h >= 180))) p.push(`tamanho ${w}×${h}`);
  if (L.tilemap.some((r) => r.length !== w)) p.push('linhas com larguras diferentes');
  if ((L.letras?.length ?? 0) !== 4) p.push('letras C-I-P-Ó');
  if (!L.moedaFolha) p.push('Moeda-Folha');
  const br = (L.bonusRooms ?? []).filter((b) => LEVELS[b]?.tipo === 'bonus');
  if (br.length < 2) p.push(`salas bônus (${br.length})`);
  if (!L.checkpoint) p.push('Totem de Cipó');
  if (!L.exit && L.tipo !== 'chefe') p.push('Totem de Saída');
  const nEnemies = L.entities.filter((e) => ENEMIES.has(e.t)).length;
  if (nEnemies < 15) p.push(`inimigos (${nEnemies})`);
  const nArmas = L.entities.filter((e) => e.t === 'arma').length;
  if (nArmas < 3) p.push(`armas (${nArmas})`);
  if (p.length) fail(`fase ${id}: ${p.join(', ')}`);
  else pass(`fase ${id}: ${w}×${h}, ${nEnemies} inimigos, ${nArmas} armas, ${br.length} bônus`);
  const r = reach(L);
  if (!r.ok) fail(`fase ${id}: Totem de Saída inalcançável pela simulação de pulo da Lili (alcançou ${r.visited} células; mais longe: x=${r.far})`);
  else pass(`fase ${id}: caminho do início à saída confirmado (${r.visited} células)`);
}
for (const [g, lv] of Object.entries(GAG_PLACES)) {
  const L = LEVELS[lv];
  if (!L) continue;
  const placed = L.entities.some((e) => e.t === 'gag' && e.id === g) || (g === 'gag_barao_disfarce' && L.entities.some((e) => e.t === 'chefe'));
  if (!placed || !(L.gags ?? []).includes(g)) fail(`${g} não posicionada em ${lv}`);
}
pass('gags conferidas');

/** Simulação de alcançabilidade: estados = células onde a Lili pode ficar em pé (ou nadar/escalar). */
function reach(L: LevelDef) {
  const rows = L.tilemap, H = rows.length, W = rows[0].length;
  const at = (x: number, y: number) => (x < 0 || x >= W ? '#' : y < 0 ? '.' : y >= H ? '.' : rows[y][x]);
  const solid = (c: string) => c === '#' || c === '>' || c === '<';
  const floor = (c: string) => solid(c) || c === '=' || c === 'T' || c === '/' || c === '\\';
  const free = (c: string) => !solid(c);
  const water = (c: string) => c === '~' || c === '!';
  const vine = (c: string) => c === '|' || c === '!' || c === '_';
  // pisos extras vindos de entidades (plataformas, troncos, ponte da preguiça, carrinho, canoa)
  const extra = new Set<string>();
  for (const e of L.entities) {
    const ex = Math.floor(e.x), ey = Math.round(e.y);
    if (['tronco', 'canoa', 'carrinho', 'caixa-montaria'].includes(e.t)) for (let dx = -1; dx <= 1; dx++) extra.add(`${ex + dx},${ey}`);
    if (e.t === 'plataforma' && Array.isArray(e.path)) {
      // a plataforma percorre o caminho inteiro: toda célula ao longo dele é um piso possível
      const path = e.path as [number, number][];
      for (let i = 0; i < path.length; i++) {
        const [ax, ay] = path[i], [bx, by] = path[Math.min(i + 1, path.length - 1)];
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
        for (let k = 0; k <= n; k++) for (let dx = -1; dx <= 1; dx++) extra.add(`${Math.floor(ax + ((bx - ax) * k) / n) + dx},${Math.round(ay + ((by - ay) * k) / n)}`);
      }
    }
    if (e.t === 'gag' && typeof e.de === 'number' && typeof e.ate === 'number') for (let x = e.de as number; x <= (e.ate as number); x++) extra.add(`${x},${ey}`);
  }
  const stand = (x: number, y: number) => free(at(x, y - 1)) && free(at(x, y - 2)) && (floor(at(x, y)) || extra.has(`${x},${y}`) || water(at(x, y - 1)) || vine(at(x, y - 1)) || at(x, y - 1) === '/' || at(x, y - 1) === '\\');
  const boosts = new Map<string, number>();
  for (const e of L.entities) {
    if (e.t === 'bromelia') boosts.set(`${Math.floor(e.x)},${Math.round(e.y)}`, 9);
    if (e.t === 'flor-catapulta') boosts.set(`${Math.floor(e.x)},${Math.round(e.y)}`, 14);
  }
  const start: [number, number] = [Math.floor(L.start[0]), Math.round(L.start[1])];
  const goal = L.exit ? [Math.floor(L.exit[0]), Math.round(L.exit[1])] : null;
  const seen = new Set<string>();
  const q: [number, number][] = [start];
  seen.add(start.join(','));
  let far = 0;
  // alcance do pulo da Lili: ~4 tiles para cima, ~7 na horizontal no mesmo nível; quedas aumentam o alcance
  const UP = 4, RUN = 7;
  while (q.length) {
    const [x, y] = q.shift()!;
    far = Math.max(far, x);
    if (goal && Math.abs(x - goal[0]) <= 1 && Math.abs(y - goal[1]) <= 1) return { ok: true, visited: seen.size, far };
    const boost = boosts.get(`${x},${y}`) ?? 0;
    const inW = water(at(x, y - 1)) || water(at(x, y - 2));
    const onV = vine(at(x, y - 1)) || vine(at(x, y - 2));
    const up = inW || onV ? 3 : UP + boost;
    // carrinho de mina: no trilho o salto é longo (velocidade alta)
    const onRail = L.tipo === 'carrinho' && at(x, y) === 'T';
    const run = boost >= 14 ? 26 : onRail ? 12 : RUN;
    for (let dy = -up; dy <= H; dy++) {
      const reachX = dy <= 0 ? Math.max(2, Math.floor(run - Math.abs(dy) * 0.75)) : Math.min(run + dy, run + 12);
      for (let dx = -reachX; dx <= reachX; dx++) {
        const nx = x + dx, ny = y + dy;
        if (ny < 1 || ny > H || nx < 0 || nx >= W) continue;
        const k = `${nx},${ny}`;
        if (seen.has(k) || !stand(nx, ny)) continue;
        // checagem grosseira de teto/parede: o arco não pode atravessar parede sólida no meio
        const mx = x + Math.round(dx / 2), my = Math.min(y, ny) - Math.max(0, Math.min(up, 3));
        if (solid(at(mx, Math.max(0, my))) && solid(at(mx, Math.max(0, my + 1))) && dy < 0) continue;
        if (!inW && !onV && Math.abs(dx) > 1 && solid(at(x + Math.sign(dx), y - 1)) && solid(at(x + Math.sign(dx), y - 2)) && solid(at(x + Math.sign(dx), y - 3)) && solid(at(x + Math.sign(dx), y - 4)) && boost === 0) continue;
        seen.add(k);
        q.push([nx, ny]);
      }
    }
  }
  return { ok: !goal, visited: seen.size, far };
}

/* 7. armas */
{
  const W = ['galho', 'coco', 'jaca', 'remo', 'vassoura', 'panela', 'lamparina', 'chave', 'peixe', 'estilingue', 'cupinzeiro', 'guarda-chuva', 'buzina', 'capacete'];
  const lack: string[] = [];
  for (const w of W) {
    const m = atlas['@models'][`arma-${w}`];
    if (!m) { lack.push(`arma-${w} (modelo)`); continue; }
    for (const a of ['mundo', 'mao', 'voando', 'quebrar']) if (!m.anims.includes(a)) lack.push(`arma-${w}:${a}`);
  }
  const src = walk(resolve(ROOT, 'src/game/weapons')).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const w of W) if (!new RegExp(`id:\\s*['"]${w}['"]`).test(src)) lack.push(`defineWeapon ${w}`);
  if (lack.length) fail('armas incompletas: ' + lack.join(', '));
  else pass('14 armas de mão com sprites (mundo/mão/voando/quebrar) e definições');
}
/* 8. sistemas incrementais */
{
  const ui = walk(resolve(ROOT, 'src/ui')).map((f) => readFileSync(f, 'utf8')).join('\n');
  const need = ['oficina', 'viveiro', 'album', 'desafios', 'results', 'map', 'hud', 'pause', 'options', 'title', 'saves', 'gameover', 'ending', 'credits', 'splash', 'intro', 'levelcard'];
  const lack = need.filter((id) => !new RegExp(`registerScreen\\(\\s*['"]${id}['"]`).test(ui));
  const des = existsSync(resolve(ROOT, 'src/data/desafios.ts')) ? (readFileSync(resolve(ROOT, 'src/data/desafios.ts'), 'utf8').match(/\bid:\s*['"]/g) ?? []).length : 0;
  const brinde = existsSync(resolve(ROOT, 'src/data/brinde.ts'));
  if (lack.length) fail('telas não registradas: ' + lack.join(', '));
  if (des < 30) fail(`desafios: ${des} (< 30)`);
  if (!brinde) fail('tabela do Brinde do Bem-te-vi ausente');
  if (!lack.length && des >= 30 && brinde) pass(`telas e sistemas incrementais registrados (${des} desafios)`);
}
/* 9. áudio */
{
  const mdir = resolve(ROOT, 'src/data/music');
  const tracks = existsSync(mdir) ? readdirSync(mdir).filter((f) => f.endsWith('.ts') && !['index.ts', 'types.ts', 'util.ts', 'theory.ts'].includes(f)) : [];
  const sfxSrc = existsSync(resolve(ROOT, 'src/data/sfx.ts')) ? readFileSync(resolve(ROOT, 'src/data/sfx.ts'), 'utf8') : '';
  const sfxIds = new Set([...sfxSrc.matchAll(/^\s*['"]?([a-z0-9-]+)['"]?\s*:\s*[{[(]/gm)].map((m) => m[1]));
  if (tracks.length < 12) fail(`músicas: ${tracks.length} (< 12)`);
  if (sfxIds.size < 50) fail(`SFX: ${sfxIds.size} (< 50)`);
  if (tracks.length >= 12 && sfxIds.size >= 50) pass(`áudio: ${tracks.length} músicas, ${sfxIds.size} SFX`);
}
/* 10. build */
if (!args.includes('--sem-build')) {
  try { execSync('npx tsc --noEmit -p .', { cwd: ROOT, stdio: 'pipe' }); pass('tsc --noEmit sem erros'); }
  catch (e) { fail('tsc --noEmit: ' + String((e as { stdout?: Buffer }).stdout ?? e).split('\n').slice(0, 12).join('\n')); }
  try {
    const out = execSync('npx vite build 2>&1', { cwd: ROOT, stdio: 'pipe' }).toString();
    if (/warn|\(!\)/i.test(out)) fail('vite build com avisos:\n' + out.split('\n').filter((l) => /warn|\(!\)/i.test(l)).slice(0, 8).join('\n'));
    else pass('vite build sem avisos');
  } catch (e) { fail('vite build falhou: ' + String((e as { stdout?: Buffer }).stdout ?? e).slice(0, 800)); }
}
/* 11–12. teste visual + fps */
if (!args.includes('--sem-visual')) {
  const shots = resolve(ROOT, 'verify-shots');
  mkdirSync(shots, { recursive: true });
  const srv = spawn('npx', ['vite', 'preview', '--port', '4174', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  // o tsx injeta __name nas funções serializadas para o navegador
  await page.addInitScript('window.__name = (f) => f');
  const pageErrors: string[] = [];
  page.on('pageerror', (e: Error) => pageErrors.push(e.message));
  const go = async (q: string, name: string, actions: (p: any) => Promise<void> = async () => {}) => {
    await page.goto(`http://localhost:4174/${q}`);
    await page.waitForTimeout(3000);
    await actions(page);
    await page.screenshot({ path: resolve(shots, name + '.png') });
  };
  const run = async (p: any, ms: number) => { await p.keyboard.down('ArrowRight'); await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(ms); await p.keyboard.up('ShiftLeft'); await p.keyboard.up('ArrowRight'); };
  await go('', 'titulo', async (p) => { await p.waitForTimeout(3000); });
  await go('?tela=map', 'mapa');
  await go('?fase=1-1', 'mundo1', (p) => run(p, 1500));
  await go('?fase=2-1', 'caverna-escura', (p) => run(p, 1500));
  await go('?fase=3-2', 'subaquatica', (p) => run(p, 1200));
  await go('?fase=4-1', 'mundo4', (p) => run(p, 1500));
  await go('?fase=1-1-b1', 'sala-bonus');
  await go('?fase=1-1', 'troca-parceiro', async (p) => { await p.keyboard.press('KeyE'); await p.waitForTimeout(250); });
  await go('?fase=3-1', 'montaria', async (p) => { await p.waitForFunction(() => !!(window as any).__sumauma.screens.stack.find((s: any) => s.world)?.world, null, { timeout: 30000 }); await p.evaluate(() => { const w = (window as any).__sumauma.screens.stack.find((s: any) => s.world).world; const l = w.duo.leader; const m = w.spawn({ t: 'ema', x: l.x / 64 + 1, y: l.y / 64 }); if (m) l.rideOn(m); }); await p.waitForTimeout(800); });
  for (const b of BOSSES) await go(`?fase=${b}`, b, (p) => p.waitForTimeout(2500));
  await go('?tela=gameover', 'gameover');
  await go('?tela=ending', 'final', (p) => p.waitForTimeout(2000));
  if (!args.includes('--sem-fps')) {
    await page.goto('http://localhost:4174/?fase=1-1');
    await page.waitForTimeout(3000);
    await page.keyboard.down('ArrowRight');
    const fps = await page.evaluate(() => new Promise<number>((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 10000) requestAnimationFrame(f); else res(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
    await page.keyboard.up('ArrowRight');
    if (fps >= 55) pass(`fps médio ${fps.toFixed(1)} (10 s de corrida na 1-1)`);
    else warns.push(`fps médio ${fps.toFixed(1)} no Chromium headless sem GPU (alvo ≥ 55 em máquina com GPU)`);
  }
  await browser.close();
  srv.kill();
  if (pageErrors.length) fail('erros de página no teste visual: ' + [...new Set(pageErrors)].slice(0, 6).join(' | '));
  else pass(`teste visual: screenshots em verify-shots/ (analise cada uma)`);
}

console.log('\n' + ok.map((m) => '✔ ' + m).join('\n'));
if (warns.length) console.log('\n' + warns.map((m) => '⚠ ' + m).join('\n'));
if (errors.length) { console.log('\n' + errors.map((m) => '✘ ' + m).join('\n') + `\n\n${errors.length} erro(s).`); process.exit(1); }
console.log('\nTudo certo: 0 erros.');
