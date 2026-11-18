/**
 * gag_preguica (1-1) — A PREGUIÇA-PONTE.
 * Uma preguiça gigante dorme pendurada no galho comprido que atravessa o abismo; o galho verga com o
 * peso dela e sobe e desce com a respiração, e é a ponte (sólidos oneway). Barulho perto (batida no
 * chão, buzina, grito do eco) a acorda: ela boceja; se o herói estiver em cima, ela solta uma mão,
 * puxa o herói para um abraço de 3 s (hero.pin 'preso', fx-coracao) e castanhas pulam da bolsinha
 * dela (só no primeiro abraço); depois devolve o herói ao galho e volta a roncar.
 *
 * Spawn (tiles):
 *   { t: 'gag', id: 'gag_preguica', x, y, de, ate, castanhas? }
 *   - de / ate: colunas das bordas do vão (a ponte vai de de*64 a ate*64 px)
 *   - y: linha do chão das bordas (o topo da ponte fica rente a ele)
 *   - x: centro visual (normalmente (de+ate)/2)
 *   - castanhas: quantas caem no abraço (padrão 8)
 */
import { Entity, type HitInfo } from '../entity';
import type { EntitySpawn } from '../types';
import type { Solid } from '../physics';
import type { World } from '../world';
import { bus } from '../../core/events';
import { defineGag, gagDone, say, num, px, domEl, place, onSolid, chuvaCastanhas, fx, gagCss } from './common';

const N = 10; // segmentos de sólido
const SAG = 16; // px de barriga no meio

type Estado = 'dorme' | 'acorda' | 'boceja' | 'abraca' | 'olha' | 'volta';

class PreguicaPonte extends Entity {
  xa: number; xb: number; top: number;
  segs: Solid[] = [];
  estado: Estado = 'dorme';
  t = 0; tt = 0;
  roncoT = 1.2;
  zzzT = 0;
  abracos = 0;
  extraSag = 0;
  castanhas: number;
  private offs: (() => void)[] = [];
  private pelo: HTMLElement[] = [];
  private cara!: HTMLElement;
  private zzz: { el: HTMLElement; t: number }[] = [];

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    this.xa = px(num(s.de, s.x - 9));
    this.xb = px(num(s.ate, s.x + 9));
    this.top = px(s.y) + 2;
    this.castanhas = num(s.castanhas, 8);
    this.x = (this.xa + this.xb) / 2;
    this.y = this.top + 50;
    this.w = this.xb - this.xa; this.h = 150;
    this.persistent = true;
    this.z = 18;
    this.tag = 'gag_preguica';
  }

  init() {
    gagCss();
    this.makeSprite('preguica', 'dormir');
    
    const segW = (this.xb - this.xa) / N;
    for (let i = 0; i < N; i++) this.segs.push(this.world.addSolid({ x: this.xa + i * segW, y: this.top, w: segW + 0.5, h: 28, oneway: true, owner: this }));
    for (let i = 0; i < N; i++) this.pelo.push(domEl(this.world, 'gag-galho'));
    this.cara = domEl(this.world, 'gag-cara');
    this.cara.innerHTML = '<b></b>';
    for (const el of [...this.pelo, this.cara]) el.style.zIndex = '17';
    this.cara.style.zIndex = '19';

    const perto = (x: number, y: number, r = 420) => x > this.xa - r && x < this.xb + r && Math.abs(y - this.top) < 420;
    this.offs.push(bus.on('pound', (d) => { if (d && perto(d.x, d.y)) this.acordar('pound'); }));
    this.offs.push(bus.on('hero-shout', (d) => { if (d && perto(d.x, d.y, 600)) this.acordar('grito'); }));
    this.offs.push(bus.on('weapon-hit', (d) => {
      const L = this.world.duo.leader;
      if (d?.id === 'buzina' && perto(L.x, L.y, 500)) this.acordar('buzina');
    }));
  }

  /** altura do topo da ponte numa posição relativa u ∈ [0,1] */
  surf(u: number) {
    const breath = this.estado === 'dorme' ? Math.sin(this.tt * 1.7) * 2.5 : 0;
    return this.top + (SAG + this.extraSag + breath) * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
  }

  onHit(h: HitInfo) {
    if (h.weapon === 'buzina' || h.kind === 'explosao' || (h.kind === 'outro' && h.heavy)) { this.acordar(h.weapon ?? h.kind); return true; }
    return false;
  }

  acordar(por: string) {
    if (this.estado !== 'dorme') return;
    this.set('acorda');
    this.sprite!.play('acordar', { restart: true });
    this.sfx('folhas');
    this.world.text(por === 'buzina' ? 'FOOM?!' : 'HÃ?!', this.x, this.top - 150, 'small');
    gagDone(this.world, 'gag_preguica');
  }

  private set(e: Estado) { this.estado = e; this.t = 0; }

  update(dt: number) {
    this.t += dt; this.tt += dt;
    const L = this.world.duo.leader;
    const emCima = this.segs.some((s) => onSolid(L, s));
    switch (this.estado) {
      case 'dorme': {
        this.sprite!.play('dormir');
        const cx = this.world.camX + 640;
        this.roncoT -= dt;
        if (this.roncoT <= 0) { this.roncoT = 3.4; if (Math.abs(cx - this.x) < 1100) this.sfx('preguica-ronco', 0.8); }
        this.zzzT -= dt;
        if (this.zzzT <= 0) { this.zzzT = 1.1; this.soltaZ(); }
        this.extraSag += (0 - this.extraSag) * Math.min(1, dt * 2);
        break;
      }
      case 'acorda':
        if (this.t > 0.9) {
          this.set('boceja');
          this.sprite!.play('bocejar', { restart: true });
          this.sfx('bocejo');
          say(this.world, this.cabeca(), 'preguica', 'Uaaaaahhh… quem… fez… barulho…?', 120, 'sono');
        }
        break;
      case 'boceja':
        if (this.t > 1.8) {
          if (emCima) this.abracar();
          else { this.set('olha'); this.sprite!.play('idle'); }
        }
        break;
      case 'olha':
        if (emCima && this.t > 0.3) { this.abracar(); break; }
        if (this.t > 1.6) { this.set('volta'); say(this.world, this.cabeca(), 'preguica', 'Hmm… sonhei… com… abraço…', 120, 'sono'); }
        break;
      case 'abraca': {
        this.extraSag += (26 - this.extraSag) * Math.min(1, dt * 4);
        // puxa o herói para o colo (no meio dos braços, abaixo do galho)
        if (L.state === 'pinned') {
          const a = this.sprite?.entry ? this.sprite.anchor('hand') : null;
          const tx = a ? a[0] : this.x + 70, ty = (a ? a[1] : this.surf(0.5) + 150) + L.h * 0.45;
          const k = Math.min(1, dt * 6);
          L.x += (tx - L.x) * k; L.y += (ty - L.y) * k;
          L.b.x = L.x; L.b.y = L.y; L.b.vy = 0; L.b.vx = 0; L.b.dropThrough = 0.2;
        }
        if (this.t > 2.95) {
          // devolve o herói em cima do galho
          if (L.state === 'pinned' || this.t < 3.1) {
            const u = (L.x - this.xa) / (this.xb - this.xa);
            L.y = L.b.y = this.surf(u) - 2; L.b.vy = -200; L.b.onGround = false; L.b.dropThrough = 0;
            L.pinT = 0; L.setState('normal');
          }
          this.set('volta'); say(this.world, this.cabeca(), 'preguica', 'Volta… sempre… zzz…', 120, 'sono');
        }
        break;
      }
      case 'volta':
        this.sprite!.play('dormir');
        if (this.t > 1.2) { this.set('dorme'); this.roncoT = 0.6; }
        break;
    }
    // ponte: posiciona segmentos (com velocidade vertical para carregar quem está em cima)
    const segW = (this.xb - this.xa) / N;
    for (let i = 0; i < N; i++) {
      const s = this.segs[i];
      const ny = this.surf((i + 0.5) / N);
      s.vy = dt > 0 ? (ny - s.y) / dt : 0;
      s.y = ny; s.x = this.xa + i * segW;
    }
    this.sprite!.update(dt);
    this.updateZ(dt);
  }

  private abracar() {
    const L = this.world.duo.leader;
    this.set('abraca');
    this.abracos++;
    this.sprite!.play('abracar', { restart: true });
    L.pin(3, 'preso');
    fx(this.world, 'fx-coracao', ['abraco', 'abraço', 'idle'], L.x, L.y - L.h - 10, { follow: L });
    say(this.world, this.cabeca(), 'preguica', this.abracos === 1 ? 'Abraaaço… de… preguiça!' : 'De… novo…? Abraaaço!', 120);
    this.sfx('bromelia-mola', 0.5);
    if (this.abracos === 1) {
      this.world.text('CASTANHAS!', this.x, this.top - 170, 'small');
      chuvaCastanhas(this.world, this.x, this.top - 60, this.castanhas, 150, 520);
    }
  }

  private cabeca() { return { x: this.x + 60, y: this.top + 40 }; }

  private soltaZ() {
    const el = domEl(this.world, 'gag-zzz', true);
    el.textContent = this.zzz.length % 2 ? 'z' : 'Z';
    this.zzz.push({ el, t: 0 });
  }
  private updateZ(dt: number) {
    for (let i = this.zzz.length - 1; i >= 0; i--) {
      const z = this.zzz[i];
      z.t += dt;
      if (z.t > 2.4 || this.estado !== 'dorme') { z.el.remove(); this.zzz.splice(i, 1); continue; }
      const k = z.t / 2.4;
      place(z.el, this.x + 50 + Math.sin(z.t * 3) * 14 + k * 40, this.top - 70 - k * 110, `scale(${(0.6 + k * 0.7).toFixed(2)})`);
      z.el.style.opacity = (1 - k).toFixed(2);
    }
  }

  render() {
    // corpo peludo em segmentos acompanhando a curva da ponte
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) { const u = i / N; pts.push([this.xa - 18 + u * (this.xb - this.xa + 36), this.surf(u) - 4]); }
    for (let i = 0; i < N; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0) + 4;
      const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
      const thick = 30 - Math.sin(Math.PI * (i + 0.5) / N) * 6; // galho afina no meio
      const el = this.pelo[i];
      el.style.width = len.toFixed(0) + 'px';
      el.style.height = thick.toFixed(0) + 'px';
      const r = (thick / 2).toFixed(0) + 'px';
      el.style.borderRadius = i === 0 ? `${r} 0 0 ${r}` : i === N - 1 ? `0 ${r} ${r} 0` : '0';
      place(el, x0 - 2, y0, `rotate(${ang.toFixed(2)}deg)`);
    }
    // rosto (sprite do modelo; sem render disponível, o rosto desenhado em CSS)
    const s = this.sprite!;
    const midY = this.surf(0.5);
    if (s.entry) {
      this.cara.style.display = 'none';
      // pivô do modelo = topo do galho em que ela se agarra
      s.x = this.x; s.y = midY - 2; s.z = 19;
      s.render();
    } else {
      this.cara.style.display = '';
      this.cara.className = 'gag-cara' + (this.estado === 'dorme' || this.estado === 'volta' ? '' : ' acordada') + (this.estado === 'boceja' ? ' boceja' : '');
      place(this.cara, this.x - 66, midY - 16);
    }
  }

  destroy() {
    super.destroy();
    for (const s of this.segs) this.world.removeSolid(s);
    for (const el of [...this.pelo, this.cara]) el?.remove();
    for (const z of this.zzz) z.el.remove();
    this.offs.forEach((f) => f());
  }
}

defineGag('gag_preguica', (w, s) => new PreguicaPonte(w, s));
