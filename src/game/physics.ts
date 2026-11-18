/**
 * Colisão por tilemap autoral + sólidos dinâmicos (caixas, paredes rachadas, plataformas móveis).
 * Corpo: (x,y) = centro da base (pés), w×h. Tiles de 64 px.
 */
import { TILE } from './types';

export const enum T {
  EMPTY = 0, SOLID = 1, ONEWAY = 2, SLOPE_R = 3, SLOPE_L = 4, SPIKE = 5, WATER = 6, VINE = 7, ROPE = 8,
  BELT_R = 9, BELT_L = 10, RAIL = 11, WATER_VINE = 12,
}

export const LEGEND: Record<string, T> = {
  '.': T.EMPTY, ' ': T.EMPTY, '#': T.SOLID, '=': T.ONEWAY, '/': T.SLOPE_R, '\\': T.SLOPE_L, '^': T.SPIKE,
  '~': T.WATER, '|': T.VINE, '_': T.ROPE, '>': T.BELT_R, '<': T.BELT_L, 'T': T.RAIL, '!': T.WATER_VINE,
};

export class Grid {
  w: number; h: number;
  cells: Uint8Array;
  constructor(public rows: string[]) {
    this.h = rows.length;
    this.w = Math.max(...rows.map((r) => r.length));
    this.cells = new Uint8Array(this.w * this.h);
    rows.forEach((r, y) => { for (let x = 0; x < this.w; x++) this.cells[y * this.w + x] = LEGEND[r[x] ?? '.'] ?? T.EMPTY; });
  }
  at(tx: number, ty: number): T {
    if (tx < 0 || tx >= this.w) return T.SOLID; // bordas laterais são paredes
    if (ty < 0) return T.EMPTY;
    if (ty >= this.h) return T.EMPTY; // abismo
    return this.cells[ty * this.w + tx] as T;
  }
  set(tx: number, ty: number, t: T) { if (tx >= 0 && ty >= 0 && tx < this.w && ty < this.h) this.cells[ty * this.w + tx] = t; }
  atPx(x: number, y: number) { return this.at(Math.floor(x / TILE), Math.floor(y / TILE)); }
  get pxW() { return this.w * TILE; }
  get pxH() { return this.h * TILE; }
}

export const isSolid = (t: T) => t === T.SOLID || t === T.BELT_R || t === T.BELT_L;
export const isFloorish = (t: T) => isSolid(t) || t === T.ONEWAY || t === T.RAIL;

/** Sólido dinâmico registrado no mundo. */
export interface Solid {
  x: number; y: number; w: number; h: number; // retângulo (x,y = canto sup. esq.)
  oneway?: boolean;
  vx?: number; vy?: number; // carrega quem está em cima
  owner?: unknown;
}

export interface Body {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  onGround: boolean;
  onSlope: boolean;
  inWater: boolean;
  hitWall: number; // -1 esquerda, 1 direita, 0 nada
  hitCeil: boolean;
  dropThrough: number; // s restantes atravessando plataformas
  groundSolid?: Solid | null;
  groundTile?: T;
  stepH?: number;
}

export function makeBody(x: number, y: number, w: number, h: number): Body {
  return { x, y, w, h, vx: 0, vy: 0, onGround: false, onSlope: false, inWater: false, hitWall: 0, hitCeil: false, dropThrough: 0, groundSolid: null, stepH: 30 };
}

function slopeSurface(t: T, tx: number, ty: number, x: number): number {
  const lx = Math.min(Math.max(x - tx * TILE, 0), TILE);
  return t === T.SLOPE_R ? ty * TILE + (TILE - lx) : ty * TILE + lx;
}

/** Altura do chão sob o ponto x, procurando entre y0 e y1 (px). Retorna null se nada. */
export function floorAt(g: Grid, solids: Solid[], x: number, y0: number, y1: number, b: Body | null, center: boolean): { y: number; tile: T; slope: boolean; solid: Solid | null } | null {
  const tx = Math.floor(x / TILE);
  type FB = { y: number; tile: T; slope: boolean; solid: Solid | null };
  let best = null as FB | null;
  for (let ty = Math.floor(y0 / TILE); ty <= Math.floor(y1 / TILE); ty++) {
    const t = g.at(tx, ty);
    let top: number | null = null, slope = false;
    if (isSolid(t)) top = ty * TILE;
    else if ((t === T.ONEWAY || t === T.RAIL) && !(b && b.dropThrough > 0)) { if (ty * TILE >= y0 - 1) top = ty * TILE; }
    else if ((t === T.SLOPE_R || t === T.SLOPE_L) && center) { top = slopeSurface(t, tx, ty, x); slope = true; }
    if (top !== null && top >= y0 - (slope ? TILE : 0) && top <= y1) {
      if (!best || top < best.y) best = { y: top, tile: t, slope, solid: null };
      break;
    }
  }
  for (const s of solids) {
    if (x < s.x || x > s.x + s.w) continue;
    if (s.oneway && b && b.dropThrough > 0) continue;
    if (s.y >= y0 - 1 && s.y <= y1 && (!best || s.y < best.y)) best = { y: s.y, tile: T.SOLID, slope: false, solid: s };
  }
  return best;
}

function solidRectHit(g: Grid, solids: Solid[], x0: number, y0: number, x1: number, y1: number): boolean {
  for (let ty = Math.floor(y0 / TILE); ty <= Math.floor((y1 - 0.01) / TILE); ty++)
    for (let tx = Math.floor(x0 / TILE); tx <= Math.floor((x1 - 0.01) / TILE); tx++)
      if (isSolid(g.at(tx, ty))) return true;
  for (const s of solids) if (!s.oneway && x1 > s.x && x0 < s.x + s.w && y1 > s.y && y0 < s.y + s.h) return true;
  return false;
}

/** Move o corpo com colisão. `snap` mantém o corpo grudado no chão em descidas. */
export function moveBody(b: Body, g: Grid, solids: Solid[], dt: number, snap = true) {
  const wasGround = b.onGround;
  b.hitWall = 0; b.hitCeil = false;
  if (b.dropThrough > 0) b.dropThrough -= dt;

  // carregado por sólido em movimento
  if (wasGround && b.groundSolid) { b.x += (b.groundSolid.vx ?? 0) * dt; b.y += (b.groundSolid.vy ?? 0) * dt; }
  if (wasGround && (b.groundTile === T.BELT_R || b.groundTile === T.BELT_L)) b.x += (b.groundTile === T.BELT_R ? 110 : -110) * dt;

  // ---- eixo X (caixa com o pé erguido em stepH para subir rampas/degraus) ----
  const hw = b.w / 2;
  // numa rampa de 45° a frente do corpo encontra o bloco de cima meia largura acima dos pés:
  // o degrau precisa cobrir essa meia largura, senão corpos largos (Tamá, Javalão) empacam no meio da subida
  const step = wasGround ? Math.max(b.stepH ?? 30, b.onSlope ? hw + 8 : 0) : 4;
  let nx = b.x + b.vx * dt;
  const top = b.y - b.h + 2, bot = b.y - step;
  if (b.vx !== 0) {
    const edge = nx + Math.sign(b.vx) * hw;
    if (solidRectHit(g, solids, Math.min(edge, edge - Math.sign(b.vx)), top, Math.max(edge, edge - Math.sign(b.vx)) + 0.01, bot)) {
      // encosta na parede
      if (b.vx > 0) { const tx = Math.floor(edge / TILE); nx = Math.min(nx, tx * TILE - hw - 0.01); for (const s of solids) if (!s.oneway && edge > s.x && b.x + hw <= s.x + 1 && bot > s.y && top < s.y + s.h) nx = Math.min(nx, s.x - hw - 0.01); }
      else { const tx = Math.floor(edge / TILE); nx = Math.max(nx, (tx + 1) * TILE + hw + 0.01); for (const s of solids) if (!s.oneway && edge < s.x + s.w && b.x - hw >= s.x + s.w - 1 && bot > s.y && top < s.y + s.h) nx = Math.max(nx, s.x + s.w + hw + 0.01); }
      if (solidRectHit(g, solids, nx - hw, top, nx + hw, bot)) nx = b.x;
      b.hitWall = Math.sign(b.vx);
      b.vx = 0;
    }
  }
  b.x = nx;

  // ---- eixo Y ----
  const ny = b.y + b.vy * dt;
  b.onGround = false; b.onSlope = false; b.groundSolid = null;
  if (b.vy >= 0) {
    const probes = [b.x, b.x - hw + 6, b.x + hw - 6];
    const y0 = b.y - step, y1 = Math.max(ny, b.y) + (wasGround && snap ? 18 : 0.5);
    type F = { y: number; tile: T; slope: boolean; solid: Solid | null };
    let best: F | null = null;
    for (let i = 0; i < probes.length; i++) {
      const f = floorAt(g, solids, probes[i], y0, y1, b, i === 0);
      if (f && (!best || f.y < best.y)) best = f;
    }
    // se o centro está sobre rampa, a rampa manda (e, descendo, gruda nela mesmo quando as pontas já saíram do plano)
    const c = floorAt(g, solids, b.x, y0, wasGround && snap ? Math.max(y1, b.y + hw + 14) : y1, b, true);
    if (c && c.slope && (!best || best.y >= c.y - 2)) best = c;
    // `snap`: quem estava no chão e achou piso dentro da faixa de busca desce grudado nele (rampas, degrauzinhos)
    if (best && (ny >= best.y - 0.5 || (wasGround && snap))) {
      const f: F = best;
      b.y = f.y; b.vy = 0; b.onGround = true; b.onSlope = f.slope; b.groundSolid = f.solid; b.groundTile = f.tile;
    } else b.y = ny;
  } else {
    if (solidRectHit(g, solids, b.x - hw + 4, ny - b.h, b.x + hw - 4, ny - b.h + 4)) {
      const ty = Math.floor((ny - b.h) / TILE);
      b.y = Math.max(ny, (ty + 1) * TILE + b.h);
      b.vy = 0; b.hitCeil = true;
    } else b.y = ny;
  }
  const mid = g.atPx(b.x, b.y - b.h * 0.55);
  b.inWater = mid === T.WATER || mid === T.WATER_VINE;
}

/** Tile sob um ponto. */
export function tileAt(g: Grid, x: number, y: number) { return g.atPx(x, y); }

/** Linha de visão simples (sem tiles sólidos entre os pontos). */
export function lineOfSight(g: Grid, x0: number, y0: number, x1: number, y1: number) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 24);
  for (let i = 1; i < n; i++) if (isSolid(g.atPx(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n))) return false;
  return true;
}

export const aabb = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x - a.w / 2 < b.x + b.w / 2 && a.x + a.w / 2 > b.x - b.w / 2 && a.y - a.h < b.y && a.y > b.y - b.h;
