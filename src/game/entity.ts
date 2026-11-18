/**
 * Base de entidades e registro por tipo. Inimigos, objetos, armas, coletáveis, NPCs, gags e chefes
 * herdam de Entity e se registram com `register('tipo', (world, spawn) => new Classe(world, spawn))`.
 */
import type { EntitySpawn } from './types';
import { TILE } from './types';
import { Sprite } from '../render/sprite';
import { makeBody, moveBody, type Body, type Solid } from './physics';
import type { World } from './world';

export type HitKind = 'pisao' | 'arma' | 'arremesso' | 'rolar' | 'montaria' | 'explosao' | 'outro';
export interface HitInfo {
  kind: HitKind;
  dmg: number;
  dir: number; // -1 | 1 direção do golpe
  x: number; y: number;
  weapon?: string;
  heavy?: boolean;
  source?: Entity | null;
}

export type Team = 'hero' | 'enemy' | 'neutral' | 'pickup' | 'projectile';

export abstract class Entity {
  static nextId = 1;
  id = Entity.nextId++;
  x: number; y: number; // px (pés)
  w = 48; h = 48;
  vx = 0; vy = 0;
  dir: 1 | -1 = 1;
  dead = false;
  /** atualiza sempre, mesmo fora da tela */
  persistent = false;
  /** distância extra (px) da câmera para continuar ativa */
  activeMargin = 400;
  team: Team = 'neutral';
  sprite?: Sprite;
  body?: Body;
  solid?: Solid;
  z = 20;
  /** o herói pode pisar (pular em cima) */
  stompable = false;
  /** encostar machuca o herói */
  touchHurts = false;
  /** pode ser pego pelo herói como arma/objeto carregável (id de WeaponDef) */
  grabbable?: string;
  /** precisa de força (Tamá) para pegar */
  heavy = false;
  /** inimigo considerado "pesado" para pisões (só Tamá derruba) */
  armored = false;
  hp = 1;
  /** id da gag/script para eventos */
  tag?: string;

  constructor(public world: World, public spawn: EntitySpawn) {
    this.x = spawn.x * TILE;
    this.y = spawn.y * TILE;
    this.dir = (spawn.dir as 1 | -1) ?? 1;
  }

  /** chamado depois de adicionado ao mundo */
  init(): void {}
  update(_dt: number): void {}
  render(_alpha: number): void {
    if (this.sprite) {
      this.sprite.x = this.x; this.sprite.y = this.y; this.sprite.flip = this.dir < 0; this.sprite.z = this.z;
      this.sprite.render();
    }
  }
  destroy(): void { this.sprite?.destroy(); if (this.solid) this.world.removeSolid(this.solid); }

  /* ---------- interações (padrões; sobrescreva) ---------- */
  /** herói caiu em cima. 'kill' = derrotado, 'bounce' = herói quica sem dano, 'hurt' = herói se machuca */
  onStomp(_hero: Entity, _heavyHero: boolean): 'kill' | 'bounce' | 'hurt' { return 'bounce'; }
  /** atingido por arma, arremesso, rolamento etc. Retorna true se reagiu. */
  onHit(_h: HitInfo): boolean { return false; }
  /** herói encostou (coletáveis, gatilhos) */
  onTouch(_hero: Entity): void {}
  /** herói interagiu (botão de ação perto) */
  onInteract?(_hero: Entity): boolean;

  /* ---------- utilidades ---------- */
  makeSprite(model: string, anim = 'idle', opts: { shadow?: boolean; variant?: string; front?: boolean } = {}) {
    const parent = opts.front ? this.world.stage.chunksFront : this.world.stage.entities;
    this.sprite = new Sprite(model, this.world.preset, opts.variant ?? 'base', parent, { shadow: opts.shadow });
    this.sprite.play(anim);
    return this.sprite;
  }
  makeBody(w: number, h: number) { this.w = w; this.h = h; this.body = makeBody(this.x, this.y, w, h); return this.body; }
  /** aplica gravidade e move com colisão (usa this.body) */
  physics(dt: number, gravity = 2400, maxFall = 900) {
    const b = this.body!;
    b.vx = this.vx; b.vy = Math.min(this.vy + gravity * dt, maxFall);
    moveBody(b, this.world.grid, this.world.solidsFor(this), dt);
    this.x = b.x; this.y = b.y; this.vx = b.vx; this.vy = b.vy;
  }
  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get cx() { return this.x; }
  get cy() { return this.y - this.h / 2; }
  distTo(e: { x: number; y: number }) { return Math.hypot(e.x - this.x, e.y - this.y); }
  kill() { this.dead = true; }
  sfx(id: string, vol = 1) { this.world.sfx(id, this.x, vol); }
}

export type Factory = (w: World, s: EntitySpawn) => Entity;
const REG = new Map<string, Factory>();
export function register(type: string, f: Factory) { REG.set(type, f); }
export function factoryFor(type: string) { return REG.get(type); }
export function registeredTypes() { return [...REG.keys()]; }
