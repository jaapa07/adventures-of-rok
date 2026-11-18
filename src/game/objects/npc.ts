/**
 * NPC genérico `npc` {id, falas?, anim?}: tucano, quati, Vô Bugio, bem-te-vi, preguiça, morcego DJ.
 * Fala ao se aproximar (balão em DOM na camada da frente, com a fonte do jogo) e balbucia pelo bus
 * ('babble' {voice, text}). Ação perto do NPC passa para a próxima fala.
 */
import { Entity, register } from '../entity';
import type { World } from '../world';
import type { EntitySpawn } from '../types';
import { bus } from '../../core/events';
import { ensureObjectCss } from './css';

const NOMES: Record<string, string> = { tucano: 'Tucano', 'vo-bugio': 'Vô Bugio', quati: 'Quati', 'bem-te-vi': 'Bem-te-vi', preguica: 'Preguiça', 'morcego-dj': 'Morcego DJ' };
const FALAS: Record<string, string[]> = {
  tucano: ['Tuc-tuc! Vi tudo lá de cima: tem segredo atrás daquela moita!', 'Javalim de capacete não amassa fácil. Chame a Tamá!', 'Eu comentaria mais, mas meu bico é só enfeite.'],
  'vo-bugio': ['No meu tempo a gente pulava em Javalim descalço, hehe!', 'Parede rachada? Batida no chão, Tamá. Confie no velho Bugio.', 'Traga parafusos para a Oficina que eu dou um jeito em tudo!'],
  quati: ['Psiu! Castanha boa, castanha baratinha!', 'Hoje tô sem troco. Aceito parafuso, aceito abraço.', 'Não fui eu que comi as castanhas do Barão. Foi o primo.'],
  'bem-te-vi': ['Bem-te-vi! Bem-te-vi te viu, viu?', 'Trouxe um presentinho no bico. Volte amanhã que tem mais!'],
  preguica: ['Zzz… hã? …zzz.', 'Calma… devagarinho… também se chega… lá…'],
  'morcego-dj': ['Tum-tsss, tum-tsss! Ataca no compasso que eles nem percebem!', 'Esse é o som da caverna, meu povo! Mãos pra cima! Ou asas!'],
};
const VOZ: Record<string, string> = { 'morcego-dj': 'quati' };

export class Npc extends Entity {
  nid: string;
  falas: string[];
  private idx = 0;
  private falandoT = 0;
  private perto = false;
  private fila = 0; // falas restantes nesta aproximação
  private el: HTMLDivElement;
  private txt: HTMLSpanElement;
  private animBase: string;

  constructor(w: World, s: EntitySpawn) {
    super(w, s);
    ensureObjectCss();
    this.nid = String(s.id ?? 'tucano');
    this.falas = Array.isArray(s.falas) && s.falas.length ? (s.falas as string[]) : FALAS[this.nid] ?? ['…'];
    this.animBase = String(s.anim ?? 'idle');
    this.w = 90; this.h = 130; this.z = 16; this.team = 'neutral';
    this.tag = s.tag as string | undefined;
    this.el = document.createElement('div');
    this.el.className = 'npc-fala';
    const quem = document.createElement('span');
    quem.className = 'quem';
    quem.textContent = NOMES[this.nid] ?? this.nid;
    this.txt = document.createElement('span');
    this.el.append(quem, this.txt);
    w.stage.chunksFront.append(this.el);
  }
  init() { this.makeSprite(this.nid, this.animBase, { shadow: true }); }

  /** fala a linha i (ou a próxima) */
  falar(texto?: string) {
    const t = texto ?? this.falas[this.idx % this.falas.length];
    if (!texto) this.idx++;
    this.txt.textContent = t;
    this.el.classList.remove('on');
    void this.el.offsetWidth; // reinicia a animação de "pop"
    this.el.classList.add('on');
    this.falandoT = 1.4 + t.length * 0.05;
    if (this.sprite?.has('falar')) this.sprite.play('falar', { restart: true });
    bus.emit('babble', { voice: VOZ[this.nid] ?? this.nid, text: t });
    bus.emit('npc-fala', { id: this.nid, text: t });
  }
  calar() { this.el.classList.remove('on'); this.falandoT = 0; this.sprite?.play(this.animBase); }

  onInteract() { this.fila = 0; this.falar(); return true; }

  update(dt: number) {
    this.sprite?.update(dt);
    const L = this.world.duo.leader;
    const near = Math.abs(L.x - this.x) < 230 && Math.abs(L.y - this.y) < 180;
    if (near) this.dir = L.x >= this.x ? 1 : -1;
    if (near && !this.perto) { this.fila = this.falas.length - 1; this.falar(); }
    this.perto = near;
    if (this.falandoT > 0) {
      this.falandoT -= dt;
      if (this.falandoT <= 0) {
        if (near && this.fila > 0) { this.fila--; this.falar(); }
        else this.calar();
      }
    }
    if (!near && this.falandoT > 0.5 && Math.abs(L.x - this.x) > 520) this.calar();
  }
  render(a: number) {
    super.render(a);
    if (!this.el.classList.contains('on')) return;
    const b = this.sprite?.entry ? this.sprite.box() : null;
    const top = b && b[3] > 0 ? b[1] : this.y - this.h;
    const pos = `translate3d(${this.x.toFixed(0)}px, ${(top - 14).toFixed(0)}px, 0) translate(-50%, -100%)`;
    this.el.style.setProperty('--pos', pos);
    this.el.style.transform = pos;
  }
  destroy() { super.destroy(); this.el.remove(); }
}

register('npc', (w, s) => new Npc(w, s));
