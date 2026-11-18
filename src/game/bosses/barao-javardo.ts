/**
 * BARÃO JAVARDO (chefe final, Mundo 4): robô-escavadeira gigante em 3 estágios. Começa disfarçado
 * de árvore (gag_barao_disfarce: atacá-lo antes de se revelar rende a medalha secreta). A câmera
 * inclina em CSS 3D a cada estágio e a fábrica desmonta ao fundo.
 * Estágio 1: pá + cabine aberta. 2: + chuva de sucata. 3: + reforços de Javalins.
 */
import { factoryFor, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { bus } from '../../core/events';
import type { World } from '../world';
import { Boss, Projectile, screenFlash } from './base';

const PATTERNS: string[][] = [
  ['pa'],
  ['pa', 'sucata'],
  ['sucata', 'pa', 'reforcos'],
];
const TILTS: [number, number][] = [[0, 0], [5, -3], [9, 5]];
const ZOOMS = [1, 0.95, 0.9];
/** pontos da fábrica ao fundo que desabam (fração da arena, tiles acima do chão) */
const FACTORY: [number, number][] = [[0.15, 7], [0.8, 8.5], [0.45, 9], [0.3, 6.5], [0.65, 7.5], [0.92, 6], [0.05, 8.8], [0.55, 6.2]];

export class BaraoJavardo extends Boss {
  revealed = false;
  fired = 0;
  collapseT = 3;
  collapseI = 0;
  slamDone = false;
  nearT = 0;
  constructor(w: World, s: EntitySpawn) {
    super(w, s, 9);
    this.music = 'chefe-final';
    this.touchHurts = false;
    this.camYOff = -230;
  }
  init() {
    this.makeSprite('barao-javardo', 'disfarce', { shadow: true });
    this.makeBody(260, 300);
    bus.emit('barao-disfarce', { on: true, x: this.x, y: this.y });
  }
  render(a: number) { if (this.sprite) this.sprite.groundY = this.y; super.render(a); }
  waiting(dt: number) { this.vx = 0; this.physics(dt); this.play('disfarce'); }

  activate() {
    // a luta começa, mas ele continua "disfarçado" até o herói chegar perto
    super.activate();
    this.setState('disfarce');
    this.play('disfarce');
    this.touchHurts = false;
  }

  reveal(early: boolean) {
    if (this.revealed) return;
    this.revealed = true;
    bus.emit('barao-disfarce', { on: false });
    this.setState('revelar');
    this.play('revelar', { restart: true });
    this.sfx('chefe-rugido');
    this.world.shake(12, 700);
    this.world.spawnFx('fx-folhas', 'folha1', this.x - 60, this.y - this.h, { vy: 120, vx: -60, life: 1.6, fade: 0.5, loop: true });
    this.world.spawnFx('fx-folhas', 'folha3', this.x + 50, this.y - this.h * 0.8, { vy: 100, vx: 70, life: 1.6, fade: 0.5, loop: true });
    this.world.text(early ? 'AI! MEU BIGODE!' : 'HÁ! ERA EU!', this.x, this.y - this.h - 30);
  }

  think(dt: number) {
    this.camTilt = TILTS[this.phase - 1];
    this.camZoom = ZOOMS[this.phase - 1];
    if (this.phase >= 2) this.dismantle(dt);
    switch (this.state) {
      case 'disfarce':
        this.vx = 0; this.physics(dt); this.play('disfarce');
        // revela-se quando o herói fica um tempinho ao lado dele (ou cansa de esperar): dá tempo de atacá-lo antes
        if (Math.abs(this.heroDx()) < 3 * TILE && this.hero.b.onGround) this.nearT += dt;
        if (this.nearT > 0.9 || this.st > 7) this.reveal(false);
        return;
      case 'revelar':
        this.vx = 0; this.physics(dt);
        if (this.st > 1.8) { this.touchHurts = true; this.setState('idle'); }
        return;
      case 'furia':
        this.vx = 0; this.physics(dt);
        if (this.st > 1.6) this.setState('idle');
        return;
      case 'idle': {
        this.faceHero();
        const dx = this.heroDx();
        this.vx = Math.abs(dx) > 260 ? this.dir * 70 : 0;
        this.physics(dt);
        this.clampArena(this.w / 2 + 10);
        this.play(this.phase === 1 ? 'idle' : this.phase === 2 ? 'estagio2' : 'estagio3');
        if (this.vx && Math.floor(this.st * 1.6) !== Math.floor((this.st - dt) * 1.6)) { this.sfx('robo-passo'); this.world.shake(3, 150); }
        if (this.st > [1.8, 1.4, 1.0][this.phase - 1]) {
          const p = PATTERNS[this.phase - 1];
          const n = p[this.seq++ % p.length];
          this.fired = 0; this.slamDone = false;
          this.setState(n);
          this.play(n === 'pa' ? 'ataque1' : n === 'sucata' ? 'ataque2' : 'ataque3', { restart: true });
        }
        return;
      }
      case 'pa': return this.shovel(dt);
      case 'sucata': return this.scrap(dt);
      case 'reforcos': return this.reinforce(dt);
      case 'aberto':
        this.vx = 0; this.physics(dt);
        this.play('vulneravel');
        if (this.st > [2.6, 2.2, 1.8][this.phase - 1]) { this.touchHurts = true; this.setState('idle'); }
        return;
    }
  }

  shovel(dt: number) {
    this.vx = 0; this.physics(dt);
    if (!this.slamDone && this.st >= 0.7) {
      this.slamDone = true;
      this.world.shake(14, 450);
      this.sfx('pisao-forte'); this.sfx('clank');
      this.world.spawnFx('fx-poeira', 'aterrissar', this.x + this.dir * 200, this.y, { scale: 1.8 });
      this.hitHero({ x: this.x + this.dir * 210, y: this.y, w: 200, h: 130 });
      const waves = this.phase >= 3 ? [-1, 1] : [this.dir];
      for (const d of waves) this.world.add(new Projectile(this.world, { x: this.x + d * 240, y: this.y, vx: d * 560, vy: 0, g: 2400, w: 54, h: 40, life: 1.8, ground: 'roll', trail: ['fx-poeira', 'corrida'] }));
    }
    if (this.st > 1.3) this.openCockpit();
  }
  scrap(dt: number) {
    this.vx = 0; this.physics(dt);
    const offs = [-170, 0, 170];
    // aviso no chão, depois a sucata cai
    if (this.fired === 0 && this.st > 0.2) {
      this.fired = 1;
      for (const o of offs) this.world.spawnFx('fx-poeira', 'corrida', this.hero.x + o, this.floorY, { scale: 1.2 });
      this.scrapX = this.hero.x;
    }
    if (this.fired === 1 && this.st > 0.8) {
      this.fired = 2;
      for (const o of offs) this.world.add(new Projectile(this.world, {
        model: 'bloco-madeira', anim: 'idle', scale: 0.8, spin: 120,
        x: this.scrapX + o, y: this.world.camY - 40, vx: 0, vy: 200, g: 1800, w: 70, h: 64, life: 3, ground: 'die',
      }));
      this.sfx('clank');
    }
    if (this.st > 1.7) this.openCockpit();
  }
  scrapX = 0;
  reinforce(dt: number) {
    this.vx = 0; this.physics(dt);
    if (this.fired === 0 && this.st > 0.6) {
      this.fired = 1;
      const alive = this.world.entities.filter((e) => !e.dead && e.spawn.t === 'javalim' && e.x > this.arena[0] && e.x < this.arena[1]).length;
      if (factoryFor('javalim')) for (let i = alive; i < 2; i++) {
        const x = this.x + this.dir * (150 + i * 90);
        this.world.spawn({ t: 'javalim', x: x / TILE, y: this.floorY / TILE, dir: this.dir, patrulha: [this.arena[0] / TILE + 1, this.arena[1] / TILE - 1] });
        this.world.spawnFx('fx-fumaca', 'derrota', x, this.floorY - 40);
      }
      this.sfx('sirene-longe');
    }
    if (this.st > 1.4) this.setState('idle');
  }
  openCockpit() {
    this.setState('aberto');
    this.touchHurts = false;
    this.play('vulneravel', { restart: true });
    this.sfx('vapor');
  }

  /** a fábrica desmonta ao fundo */
  dismantle(dt: number) {
    this.collapseT -= dt;
    if (this.collapseT > 0) return;
    this.collapseT = this.phase >= 3 ? 2 : 3;
    this.collapsePiece(1);
  }
  collapsePiece(scale: number) {
    const [fx, fy] = FACTORY[this.collapseI++ % FACTORY.length];
    const x = this.arena[0] + (this.arena[1] - this.arena[0]) * fx, y = this.floorY - fy * TILE;
    this.world.spawnFx('fx-explosao', 'pequena', x, y, { scale: 1.4 * scale, z: 2 });
    this.world.spawnFx('fx-fumaca', 'derrota', x, y + 40, { scale: 1.6 * scale, z: 1, vy: 40 });
    this.world.spawnFx('fx-lascas', 'pedra', x, y, { vy: 160, gravity: 900, life: 2, fade: 0.5, z: 2 });
    this.world.shake(5 * scale, 500);
    this.sfx(this.collapseI % 2 ? 'clank' : 'vapor', 0.7);
    this.sfx('chefe-explosao', 0.35);
  }
  onPhase(p: number) {
    // estágio novo: um pedaço grande da fábrica vem abaixo
    for (let i = 0; i < 3; i++) this.collapsePiece(1.6);
    screenFlash(this.world, 300, '#ffd9a0');
    this.touchHurts = true;
    this.world.toast(p === 2 ? 'O Barão ligou o modo turbo!' : 'Estágio final: a fábrica está desmoronando!');
  }

  /* ---------------- dano ---------------- */
  takeHit(h?: HitInfo): boolean {
    if (this.state === 'disfarce' && !this.revealed) {
      bus.emit('gag', { id: 'gag_barao_disfarce' });
      this.world.gagsDone.add('gag_barao_disfarce');
      this.world.text('SEGREDO!', this.x, this.y - this.h - 70, 'small');
      this.reveal(true);
      this.invulnT = 0;
      this.hurtBoss(1, h);
      this.setState('revelar');
      return true;
    }
    if (this.state === 'aberto') { this.hurtBoss(h?.heavy || h?.weapon === 'chave' ? 2 : 1, h); if (!this.defeated && this.state === 'aberto') { this.touchHurts = true; this.setState('idle'); } return true; }
    return false;
  }
  onStomp(): 'kill' | 'bounce' | 'hurt' {
    if (this.defeated) return 'bounce';
    if (!this.active) this.activate();
    if (this.takeHit()) return 'bounce';
    return this.revealed ? 'hurt' : 'bounce';
  }
  onHit(h: HitInfo): boolean {
    if (this.defeated) return false;
    if (!this.active) this.activate();
    if (h.kind === 'outro' && h.dmg <= 0 && this.revealed) return false;
    if (this.takeHit(h)) return true;
    this.sfx('clank', 0.7);
    this.world.spawnFx('fx-faisca', 'impacto', h.x + (this.x - h.x) * 0.5, this.y - this.h * 0.5);
    return true;
  }
  defeatMotion(dt: number) { this.vx = 0; this.physics(dt); }
  onExploded() { for (let i = 0; i < 4; i++) this.collapsePiece(2); }
}
