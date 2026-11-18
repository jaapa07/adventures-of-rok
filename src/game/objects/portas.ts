/**
 * Portas das salas bônus "Câmara de Cristal": `porta-bonus` {room, oculta?} e `saida-bonus`.
 * A porta oculta só aparece quando a parede rachada da frente cai (ou com Batida no chão por perto,
 * se não houver parede). Entrar: ↑ ou ação encostado na porta.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { TILE } from '../types';
import { input, promptFor } from '../../core/input';
import { bus } from '../../core/events';
import { current } from '../session';
import { faroSpark } from '../pickups/common';
import { ensureObjectCss } from './css';

export class PortaBonus extends Entity {
  room: string;
  oculta: boolean;
  revelada: boolean;
  saida: boolean;
  private el: HTMLDivElement;
  private dica: HTMLDivElement;
  private checked = false;
  private off?: () => void;
  private used = false;
  constructor(w: World, s: EntitySpawn, saida = false) {
    super(w, s);
    ensureObjectCss();
    this.saida = saida;
    this.room = String(s.room ?? '');
    this.oculta = !!s.oculta;
    this.revelada = !this.oculta;
    this.w = 100; this.h = 158; this.z = 14; this.team = 'neutral';
    this.persistent = false;
    this.el = document.createElement('div');
    this.el.className = 'porta-bonus' + (saida ? ' saida' : '');
    this.dica = document.createElement('div');
    this.dica.className = 'dica';
    this.el.append(this.dica);
    w.stage.entities.append(this.el);
  }
  init() {
    if (this.oculta) this.off = bus.on('pound', (d: { x: number; y: number }) => {
      if (!this.revelada && !this.paredeNaFrente() && Math.abs(d.x - this.x) < TILE * 4 && Math.abs(d.y - this.y) < TILE * 2) this.revelar();
    });
  }
  private paredeNaFrente() { return this.world.entities.some((e) => !e.dead && e.spawn.t === 'parede-rachada' && !(e as unknown as { broken?: boolean }).broken && Math.abs(e.x - this.x) < TILE * 2.5 && Math.abs(e.y - this.y) < TILE * 2); }
  private paredeQuebradaNaSessao() {
    const ses = current.session;
    if (!ses) return false;
    for (const k of ses.collected) {
      if (!k.startsWith('parede-rachada@')) continue;
      const [qx, qy] = k.slice(15).split(',').map(Number);
      if (Math.abs(qx / 4 - this.x / TILE) < 2.5 && Math.abs(qy / 4 - this.y / TILE) < 2) return true;
    }
    return false;
  }
  get feita() { return !this.saida && !!current.session?.bonusDone.has(this.room); }
  revelar() {
    if (this.revelada) return;
    this.revelada = true;
    this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.5, { scale: 1.6, z: 70 });
    this.sfx('porta-bonus', 0.6);
    this.world.text('PASSAGEM SECRETA!', this.x, this.y - this.h - 20, 'small');
    bus.emit('secret', { kind: 'porta-bonus', room: this.room });
  }
  update(dt: number) {
    if (!this.checked) {
      this.checked = true;
      // voltou da sala com a parede (desta porta) já quebrada nesta tentativa
      if (this.oculta && !this.paredeNaFrente() && this.paredeQuebradaNaSessao()) this.revelada = true;
    }
    if (!this.revelada) {
      if (faroSpark(this, dt)) this.world.spawnFx('fx-brilho', 'castanha', this.x, this.y - this.h * 0.4, { scale: 0.7, alpha: 0.7, z: 70 });
      return;
    }
    const L = this.world.duo.leader;
    const perto = Math.abs(L.x - this.x) < 56 && Math.abs(L.y - this.y) < 40 && L.state === 'normal';
    this.el.classList.toggle('perto', perto);
    this.dica.textContent = this.feita ? 'Sala concluída' : `${promptFor('up') === 'Up' ? '↑' : promptFor('up')} entrar`;
    if (perto && input.pressed('up')) this.entrar();
  }
  onInteract() { if (!this.revelada) return false; return this.entrar(); }
  entrar(): boolean {
    if (this.used) return false;
    if (this.feita) { this.world.sfx('ui-erro', this.x, 0.6); return true; }
    this.used = true;
    const L = this.world.duo.leader;
    L.setState('cutscene'); L.b.vx = 0;
    this.world.spawnFx('fx-brilho', 'letra', this.x, this.y - this.h * 0.5, { scale: 1.8, z: 70 });
    if (this.saida) {
      this.sfx('porta-bonus');
      this.world.finished = true;
      this.world.hooks.onExitBonus?.(false);
    } else {
      this.world.hooks.onEnterBonus?.(this.room, [this.x / TILE, this.y / TILE]);
    }
    return true;
  }
  render() {
    this.el.style.display = this.revelada ? '' : 'none';
    this.el.classList.toggle('fechada', this.feita);
    this.el.style.transform = `translate3d(${(this.x - this.w / 2).toFixed(0)}px, ${(this.y - this.h).toFixed(0)}px, 0)`;
    this.el.style.zIndex = String(this.z);
  }
  destroy() { super.destroy(); this.el.remove(); this.off?.(); }
}

register('porta-bonus', (w, s) => new PortaBonus(w, s));
register('saida-bonus', (w, s) => new PortaBonus(w, s, true));
