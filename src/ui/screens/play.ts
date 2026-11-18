/**
 * Tela de jogo: cria o World da fase, HUD, pausa, salas bônus, morte/respawn, fim de fase.
 */
import type { Screen } from './manager';
import { screens } from './manager';
import { makeScreen } from './registry';
import { World } from '../../game/world';
import { LEVELS } from '../../data/levels/index';
import type { LevelDef } from '../../game/types';
import { Session, current } from '../../game/session';
import { finishLevel } from '../../game/progress';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game } from '../../core/save';
import { preloadModel, sceneryMeta, preload } from '../../core/assets';

export interface PlayArgs { level: string; fromBonus?: { room: string; ok: boolean } }

export class PlayScreen implements Screen {
  el = document.createElement('div');
  world: World | null = null;
  hud: Screen | null = null;
  main: LevelDef;
  cur: LevelDef;
  session: Session;
  private ending = false;
  private bonusTimer = 0;
  private offs: (() => void)[] = [];

  constructor(public args: PlayArgs) {
    this.el.className = 'play-screen';
    this.main = LEVELS[args.level];
    if (!this.main) throw new Error('fase inexistente ' + args.level);
    this.cur = this.main;
    this.session = new Session(this.main.id);
    current.session = this.session;
  }

  async enter() {
    this.hud = makeScreen('hud', { play: this });
    if (this.hud) { this.el.append(this.hud.el); this.hud.enter?.(); }
    await this.load(this.main);
    const card = makeScreen('levelcard', { level: this.main });
    if (card) screens.push(card);
    this.offs.push(bus.on('coin', () => { this.session.castanhas++; }));
    this.offs.push(bus.on('parafuso', (d) => { this.session.parafusos += d?.n ?? 1; }));
    this.offs.push(bus.on('hero-lost', () => { this.session.partnerLostEver = true; }));
    this.offs.push(bus.on('gag', (d) => { if (d?.id) this.session.gags.add(d.id); }));
  }

  async load(L: LevelDef, start?: [number, number]) {
    this.world?.destroy();
    // sem mundo durante o carregamento: evita que update() rode o mundo destruído com o cronômetro da sala nova
    this.world = null;
    this.cur = L;
    const sc = sceneryMeta();
    await Promise.all([
      preloadModel('tama', L.preset, game.save.figurino.tama, ['idle', 'andar', 'correr', 'pulo', 'apice', 'queda']),
      preloadModel('lili', L.preset, game.save.figurino.lili, ['idle', 'andar', 'correr', 'pulo', 'apice', 'queda']),
      ...((sc.parallax?.[L.parallax] ?? []) as { src: string }[]).map((p) => preload(p.src)),
    ]);
    this.world = new World(screens.stage, L, {
      onComplete: (t) => this.complete(t),
      onDeath: () => this.died(),
      onEnterBonus: (room) => this.enterBonus(room),
      onExitBonus: (ok) => this.exitBonus(ok),
    }, start);
    bus.emit('level-start', { id: L.id, bonus: L.tipo === 'bonus' });
    bus.emit('music', L.music);
    bus.emit('ambience', L.ambience ?? null);
    if (L.tipo === 'bonus') this.bonusTimer = L.bonus?.tempo ?? 20;
  }

  enterBonus(room: string) {
    const L = LEVELS[room];
    if (!L) return;
    bus.emit('bonus-enter', { id: room });
    bus.emit('sfx', { id: 'porta-bonus' });
    screens.curtain(true).then(async () => { await this.load(L); screens.curtain(false); });
  }
  exitBonus(ok: boolean) {
    const B = this.cur;
    if (ok) this.session.bonusDone.add(B.id);
    bus.emit('bonus-end', { id: B.id, ok });
    const back = B.bonus?.retorno;
    screens.curtain(true).then(async () => { await this.load(this.main, back ? [back[1], back[2]] : undefined); if (this.world) this.world.duo.leader.invuln = 1.5; screens.curtain(false); });
  }

  died() {
    this.session.deaths++;
    if (game.save.vidas <= 0) {
      game.save.vidas = game.options.assistencia ? 7 : 5;
      game.persist();
      const go = makeScreen('gameover', { level: this.main.id });
      if (go) screens.replace(go);
      return;
    }
    game.persist();
    const cp = game.save.lastCheckpoint;
    screens.curtain(true).then(async () => {
      await this.load(this.cur.tipo === 'bonus' ? this.main : this.cur, cp && cp.level === this.main.id ? [cp.x, cp.y] : undefined);
      // fôlego ao renascer: inimigos perto do totem não acertam a dupla ainda atrás da cortina
      if (this.world) this.world.duo.leader.invuln = 2.2;
      screens.curtain(false);
    });
  }

  complete(_t: number) {
    if (this.ending) return;
    if (this.cur.tipo === 'bonus') { this.exitBonus(true); return; }
    this.ending = true;
    this.world!.duo.celebrate();
    bus.emit('music', 'vitoria');
    const result = finishLevel(this.main, this.session);
    setTimeout(() => {
      const r = makeScreen('results', { level: this.main, result, session: this.session });
      if (r) screens.replace(r);
      else { const m = makeScreen('map', {}); if (m) screens.replace(m); }
    }, 2600);
  }

  update(dt: number) {
    if (!this.world) return;
    if (input.pressed('pause') && !this.ending && !screens.busy) {
      const p = makeScreen('pause', { play: this });
      if (p) { screens.push(p); return; }
    }
    this.world.update(dt);
    // o cronômetro da tentativa soma só o tempo na fase principal e não zera ao renascer nem ao voltar de sala bônus
    if (this.cur.tipo !== 'bonus' && !this.world.finished) this.session.time += dt;
    game.save.playTime += dt;
    if (this.cur.tipo === 'bonus' && !this.world.finished) {
      this.bonusTimer -= dt;
      bus.emit('bonus-timer', { t: Math.max(0, this.bonusTimer) });
      if (this.bonusTimer <= 0) { this.world.finished = true; this.exitBonus(false); }
    }
    this.hud?.update?.(dt);
  }
  render(alpha: number, frameDt: number) { this.world?.render(alpha); this.hud?.render?.(alpha, frameDt); }
  exit() {
    this.offs.forEach((f) => f());
    this.world?.destroy(); this.world = null;
    this.hud?.exit?.();
    screens.stage.clearWorld();
    current.session = null;
  }
}
