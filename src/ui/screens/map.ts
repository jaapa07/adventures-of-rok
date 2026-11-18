/**
 * Mapa da Ilha Sumaúma (seção 10.5 + 19.2): imagem pré-renderizada em perspectiva CSS 3D,
 * caminhos que se desenham ao liberar fases, a dupla andando entre os nós, nome da fase no topo,
 * medalhas/letras/moeda por fase, regiões que voltam a ficar verdes e os pontos especiais.
 */
import { registerScreen } from './registry';
import { UiScreen, go } from './base';
import { screens } from './manager';
import { PlayScreen } from './play';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { game, levelProgress } from '../../core/save';
import { sceneryMeta, anim, preload } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { carved } from '../components/carved';
import { h, img, prompt, sfx, Menu, fmtTime } from '../components/ui';
import { MAP, WORLD_NAMES } from '../../data/world';
import { LEVELS } from '../../data/levels/index';
import { MEDALHAS } from '../../data/textos';
import { extra, regioesVerdes, moedasPlantadas, aplicarMarcosViveiro, brindeDisponivel, receberBrinde } from '../../game/progress';
import { dialog } from './dialog';

const PW = 2400, PH = 1350; // tamanho do plano do mapa (px)
const TILT = 34; // inclinação do plano (graus)

/** Posições autorais dos nós (fração do mapa). O manifesto do cenário pode sobrepor com `map.nodes` em px da imagem. */
const LAYOUT: Record<string, [number, number]> = {
  '1-1': [0.335, 0.70], '1-2': [0.255, 0.615], '1-3': [0.185, 0.50], '1-4': [0.225, 0.37], 'chefe-1': [0.315, 0.29],
  '2-1': [0.405, 0.205], '2-2': [0.50, 0.15], '2-3': [0.595, 0.205], 'chefe-2': [0.665, 0.29],
  '3-1': [0.755, 0.37], '3-2': [0.815, 0.48], '3-3': [0.80, 0.60], '3-4': [0.73, 0.70], 'chefe-3': [0.645, 0.765],
  '4-1': [0.555, 0.70], '4-2': [0.515, 0.585], '4-3': [0.575, 0.47], 'chefe-4': [0.50, 0.40],
  '5-1': [0.425, 0.48],
  'bem-te-vi': [0.25, 0.80], oficina: [0.40, 0.825], viveiro: [0.335, 0.885],
  'tucano-1': [0.43, 0.70], 'tucano-2': [0.36, 0.17], 'tucano-3': [0.85, 0.36], 'tucano-4': [0.60, 0.78],
};
type SpecialId = 'bem-te-vi' | 'oficina' | 'viveiro' | 'tucano-1' | 'tucano-2' | 'tucano-3' | 'tucano-4';
interface SpecialDef { id: SpecialId; nome: string; desc: string; icon: string; mundo?: number }
const SPECIALS: SpecialDef[] = [
  { id: 'bem-te-vi', nome: 'Save do Bem-te-vi', desc: 'O Bem-te-vi anota tudo num bilhetinho e guarda o jogo.', icon: 'mapa/bem-te-vi.svg' },
  { id: 'oficina', nome: 'Barraca do Vô Bugio', desc: 'Oficina de melhorias e dicas sobre os segredos da ilha.', icon: 'mapa/barraca-bugio.svg' },
  { id: 'viveiro', nome: 'Viveiro da Semente-Mãe', desc: 'Plante as Moedas-Folha e veja a ilha renascer.', icon: 'mapa/viveiro.svg' },
  ...[1, 2, 3, 4].map((m): SpecialDef => ({ id: `tucano-${m}` as SpecialId, nome: 'Voo do Tucano', desc: 'Viagem rápida entre os mundos já liberados.', icon: 'mapa/voo-tucano.svg', mundo: m })),
];
const isSpecial = (id: string) => SPECIALS.some((s) => s.id === id);
/** Animais que aparecem quando cada região volta a ficar verde. */
const BICHOS: { regiao: number; m: string; a: string; x: number; y: number; flip?: boolean }[] = [
  { regiao: 1, m: 'tucano', a: 'voar', x: 0.2, y: 0.45 }, { regiao: 1, m: 'preguica', a: 'dormir', x: 0.28, y: 0.55 },
  { regiao: 2, m: 'quati', a: 'idle', x: 0.55, y: 0.24, flip: true }, { regiao: 3, m: 'tucano', a: 'voar', x: 0.78, y: 0.55, flip: true },
  { regiao: 4, m: 'bem-te-vi', a: 'voar', x: 0.56, y: 0.62 },
];

interface MapImages { base: string; verde: string[]; nodes?: Record<string, [number, number]>; w?: number; h?: number }
function mapImages(): MapImages {
  const sc = sceneryMeta();
  const m = sc.map as { w?: number; h?: number; devastada?: string; regioes?: string[] } | undefined;
  if (m?.devastada) return { base: m.devastada, verde: m.regioes ?? [], nodes: sc.mapNodes, w: m.w, h: m.h };
  return { base: 'assets/map/ilha-devastada.webp', verde: [1, 2, 3, 4].map((n) => `assets/map/regiao-${n}-verde.webp`) };
}

const isLevel = (id: string) => MAP.some((n) => n.id === id);

class MapScreen extends UiScreen {
  private view = h('div', 'map-view');
  private cam = h('div', 'map-cam');
  private plane = h('div', 'map-plane');
  private svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  private pos: Record<string, [number, number]> = {};
  private nodeEls: Record<string, HTMLElement> = {};
  private paths: Record<string, SVGPathElement> = {};
  private header = h('div', 'map-header');
  private info = h('div', 'map-info');
  private cur: string;
  private walk: { path: SVGPathElement; len: number; d: number; rev: boolean; to: string } | null = null;
  private heroX = 0; private heroY = 0;
  private camX = 0; private camY = 0;
  private heroes = h('div', 'map-heroes');
  private tama: Sprite | null = null;
  private lili: Sprite | null = null;
  private trail: [number, number][] = [];
  private tamaPos: [number, number] = [0, 0];
  private liliPos: [number, number] = [0, 0];
  private bichos: Sprite[] = [];
  private busyUi = false;
  private imgs = mapImages();

  constructor() {
    super('map');
    const s = game.save;
    this.cur = this.pos[s.mapPos] || LAYOUT[s.mapPos] ? s.mapPos : '1-1';
    this.svg.setAttribute('class', 'map-paths');
    this.svg.setAttribute('viewBox', `0 0 ${PW} ${PH}`);
    this.svg.setAttribute('width', String(PW)); this.svg.setAttribute('height', String(PH));
    this.plane.style.width = PW + 'px'; this.plane.style.height = PH + 'px';
    // imagens: ilha devastada + regiões renascidas
    const base = h('div', 'map-img'); base.style.backgroundImage = `url(${this.imgs.base})`;
    this.plane.append(h('div', 'map-sea'), base);
    const verdes = regioesVerdes();
    const vistos = extra().verdeVisto ?? 0;
    this.imgs.verde.forEach((src, i) => {
      const v = h('div', 'map-img verde'); v.style.backgroundImage = `url(${src})`;
      if (i < verdes) v.classList.add(i < vistos ? 'on' : 'grow');
      this.plane.append(v);
    });
    extra().verdeVisto = verdes;
    this.plane.append(this.svg);
    this.layoutNodes();
    this.buildPaths();
    this.buildNodes();
    this.cam.append(this.plane);
    this.view.append(this.cam, this.heroes);
    this.el.append(h('div', 'map-sky'), this.view, h('div', 'map-vignette'), this.header, this.info,
      h('div', 'prompts-bar', prompt('left', 'Andar'), prompt('confirm', 'Entrar'), prompt('swap', 'Voo do Tucano'), prompt('pause', 'Menu')));
    preload(this.imgs.base);
    // heróis
    this.tama = new Sprite('tama', 'neutro', s.figurino.tama, this.billboard());
    this.lili = new Sprite('lili', 'neutro', s.figurino.lili, this.billboard());
    for (const sp of [this.tama, this.lili]) { sp.play('idle'); sp.sx = sp.sy = 0.6; }
    [this.heroX, this.heroY] = this.pos[this.cur];
    this.camX = this.heroX; this.camY = this.heroY;
    for (let i = 0; i < 30; i++) this.trail.push([this.heroX - 30, this.heroY]);
    // bichos das regiões renascidas
    for (const b of BICHOS) if (b.regiao <= verdes && anim(b.m, b.a, 'neutro')) {
      const wrap = this.billboard();
      this.anchors.push({ el: wrap, x: b.x * PW, y: b.y * PH });
      const sp = new Sprite(b.m, 'neutro', 'base', wrap);
      sp.play(b.a); sp.flip = !!b.flip; sp.sx = sp.sy = 0.45;
      this.bichos.push(sp);
    }
    this.onBack = null;
  }

  /** Suporte em pé sobre o plano inclinado (o sprite fica de frente para a câmera). */
  private billboard() { const w = h('div', 'map-bb'); this.heroes.append(w); return w; }
  /** Elementos em pé (nós, heróis, bichos) ficam numa camada 2D por cima, na posição projetada do plano 3D. */
  private anchors: { el: HTMLElement; x: number; y: number }[] = [];
  private proj = new DOMMatrix();
  private project(x: number, y: number): [number, number, number] {
    const q = this.proj.transformPoint(new DOMPoint(x, y, 0));
    const P = 1100, ox = 640, oy = 216;
    const k = P / (P - q.z);
    return [ox + (q.x - ox) * k, oy + (q.y - oy) * k, k];
  }
  private placeAt(el: HTMLElement, x: number, y: number) {
    const [sx, sy, k] = this.project(x, y);
    el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${k.toFixed(3)})`;
    el.style.zIndex = String(Math.round(sy));
  }
  private placeBB(sp: Sprite, x: number, y: number) {
    this.placeAt(sp.el.parentElement as HTMLElement, x, y);
    sp.x = 0; sp.y = 0;
  }
  private layoutNodes() {
    const n = this.imgs.nodes;
    for (const [id, p] of Object.entries(LAYOUT)) this.pos[id] = [p[0] * PW, p[1] * PH];
    if (n && this.imgs.w && this.imgs.h) for (const [id, p] of Object.entries(n)) this.pos[id] = [(p[0] / this.imgs.w) * PW, (p[1] / this.imgs.h) * PH];
  }
  private edges(): [string, string][] {
    const e: [string, string][] = [];
    for (const n of MAP) for (const nx of n.next) e.push([n.id, nx]);
    e.push(['chefe-4', '5-1']);
    for (const sp of SPECIALS) {
      const [sx, sy] = this.pos[sp.id];
      let best = '1-1', bd = Infinity;
      for (const n of MAP) {
        if (n.id === '5-1' || (sp.mundo && n.mundo !== sp.mundo)) continue;
        const d = Math.hypot(this.pos[n.id][0] - sx, this.pos[n.id][1] - sy);
        if (d < bd) { bd = d; best = n.id; }
      }
      e.push([best, sp.id]);
    }
    return e;
  }
  private unlocked(id: string) {
    const sp = SPECIALS.find((s) => s.id === id);
    if (sp) return !sp.mundo || game.save.unlocked.includes(MAP.find((n) => n.mundo === sp.mundo)!.id);
    return game.save.unlocked.includes(id);
  }
  private curve(a: string, b: string) {
    const [x0, y0] = this.pos[a], [x1, y1] = this.pos[b];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = x1 - x0, dy = y1 - y0;
    const bendK = ((a.length * 7 + b.length * 3) % 5 - 2) * 0.12; // curvatura fixa por par
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${(mx - dy * bendK).toFixed(1)} ${(my + dx * bendK).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  private buildPaths() {
    const seen = new Set(extra().mapaVisto ?? []);
    const NS = 'http://www.w3.org/2000/svg';
    let delay = 0.6;
    for (const [a, b] of this.edges()) {
      if (!this.pos[a] || !this.pos[b]) continue;
      const d = this.curve(a, b);
      const under = document.createElementNS(NS, 'path');
      under.setAttribute('d', d); under.setAttribute('class', 'map-path-shadow');
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      const open = this.unlocked(a) && this.unlocked(b);
      p.setAttribute('class', 'map-path' + (open ? '' : ' locked') + (b === '5-1' ? ' secreta' : ''));
      this.svg.append(under, p);
      this.paths[`${a}>${b}`] = p;
      if (open && !seen.has(b)) {
        // caminho recém-liberado: desenha com stroke-dashoffset
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.style.setProperty('--len', String(len));
        p.style.animation = `desenha-caminho 1.6s ${delay}s ease-in-out forwards`;
        delay += 0.4;
        seen.add(b);
        setTimeout(() => sfx('ui-tick', 0.6), delay * 1000);
      }
      if (open) seen.add(b);
    }
    // trilha secreta do Viveiro (3 Moedas-Folha): pontilhado de castanhas perto da sumaúma
    if ((extra().marcosVistos ?? []).includes(3)) {
      const t = document.createElementNS(NS, 'path');
      t.setAttribute('d', `M${this.pos['1-1'][0]} ${this.pos['1-1'][1]} C${PW * 0.36} ${PH * 0.62} ${PW * 0.40} ${PH * 0.58} ${this.pos['5-1'][0]} ${this.pos['5-1'][1]}`);
      t.setAttribute('class', 'map-path-secreta');
      this.svg.append(t);
    }
    extra().mapaVisto = [...seen];
  }
  private buildNodes() {
    for (const n of MAP) {
      if (!this.pos[n.id]) continue;
      const open = this.unlocked(n.id);
      const p = game.save.levels[n.id];
      const el = h('div', 'map-node ' + n.tipo + (open ? '' : ' locked') + (p?.done ? ' done' : ''));
      const icon = !open ? 'mapa/node-trancado.svg' : n.tipo === 'chefe' ? 'mapa/node-chefe.svg' : 'mapa/node-fase.svg';
      const stand = h('div', 'map-stand', img(icon, 'map-node-img'));
      if (n.tipo !== 'chefe') stand.append(h('span', 'map-node-id', carved(n.id === '5-1' ? '★' : n.id, { tone: open ? 'creme' : 'madeira', size: 14 })));
      if (open && p) {
        const badges = h('div', 'map-badges');
        if (p.moeda) badges.append(img('hud/moeda-folha.svg', 'badge'));
        if (p.letras) badges.append(h('span', 'badge-cipo', 'CIPÓ'));
        const nm = Object.values(p.medals).filter(Boolean).length;
        if (nm) badges.append(h('span', 'badge-medal', `${nm}/4`));
        stand.append(badges);
      }
      el.append(stand);
      this.anchors.push({ el, x: this.pos[n.id][0], y: this.pos[n.id][1] });
      el.addEventListener('click', () => this.clickNode(n.id));
      this.nodeEls[n.id] = el;
      this.heroes.append(el);
    }
    for (const sp of SPECIALS) {
      const el = h('div', 'map-node especial', h('div', 'map-stand', img(sp.icon, 'map-node-img')));
      if (sp.id === 'bem-te-vi' && brindeDisponivel()) el.append(h('div', 'map-alert', img('mapa/presente.svg')));
      this.anchors.push({ el, x: this.pos[sp.id][0], y: this.pos[sp.id][1] });
      el.addEventListener('click', () => this.clickNode(sp.id));
      this.nodeEls[sp.id] = el;
      this.heroes.append(el);
    }
  }

  enter() {
    bus.emit('music', 'mapa');
    bus.emit('ambience', 'amb-mata');
    this.showInfo();
    void this.welcome();
  }
  resume() { this.showInfo(); }

  /** Sequência de chegada: marcos do Viveiro e Brinde do Bem-te-vi (uma vez por dia). */
  private async welcome() {
    this.busyUi = true;
    await new Promise((r) => setTimeout(r, 700));
    for (const m of aplicarMarcosViveiro()) {
      const txt = m === 3 ? 'Três Moedas-Folha plantadas! Uma trilha secreta de castanhas apareceu perto da sumaúma (+50 castanhas no banco).'
        : m === 7 ? 'Sete Moedas-Folha! Uma Câmara de Cristal especial brilha dentro do Viveiro.'
        : 'Catorze Moedas-Folha! A Copa da Sumaúma (fase 5-1) está aberta lá no alto da árvore gigante!';
      await dialog({ speaker: 'tucano', titulo: 'O Viveiro cresceu!', text: txt });
    }
    if (brindeDisponivel()) {
      sfx('brinde');
      const b = receberBrinde();
      if (b) await dialog({ speaker: 'bem-te-vi', titulo: 'Brinde do Bem-te-vi', text: b.fala, icone: b.tipo === 'arma' ? `armas/${b.valor}.svg` : b.tipo === 'castanhas' ? 'hud/castanha.svg' : b.tipo === 'parafusos' ? 'hud/parafuso.svg' : 'mapa/presente.svg' });
      this.nodeEls['bem-te-vi']?.querySelector('.map-alert')?.remove();
    }
    game.persist();
    this.busyUi = false;
  }

  private neighbors(id: string): string[] {
    const out = new Set<string>();
    for (const [a, b] of this.edges()) {
      if (a === id && this.unlocked(b)) out.add(b);
      if (b === id && this.unlocked(a)) out.add(a);
    }
    return [...out];
  }
  private tryMove(dx: number, dy: number) {
    const [x0, y0] = this.pos[this.cur];
    let best: string | null = null, bestDot = 0.35;
    for (const n of this.neighbors(this.cur)) {
      const [x1, y1] = this.pos[n];
      const vx = x1 - x0, vy = y1 - y0, L = Math.hypot(vx, vy) || 1;
      const dot = (vx * dx + vy * dy) / L;
      if (dot > bestDot) { bestDot = dot; best = n; }
    }
    if (best) this.walkTo(best); else if (dx || dy) sfx('ui-erro', 0.5);
  }
  private walkTo(to: string) {
    const fwd = this.paths[`${this.cur}>${to}`], back = this.paths[`${to}>${this.cur}`];
    const path = fwd ?? back;
    if (!path) return;
    this.walk = { path, len: path.getTotalLength(), d: 0, rev: !fwd, to };
    this.header.classList.remove('on');
    sfx('passo-terra', 0.5);
  }
  private clickNode(id: string) {
    if (this.walk || this.busyUi) return;
    if (id === this.cur) { this.activate(); return; }
    if (this.neighbors(this.cur).includes(id)) this.walkTo(id);
  }

  private showInfo() {
    const id = this.cur;
    this.header.replaceChildren();
    this.info.replaceChildren();
    const sp = SPECIALS.find((s) => s.id === id);
    if (sp) {
      this.header.append(carved(sp.nome, { tone: 'ouro', size: 34 }));
      const card = h('div', 'panel claro map-card', h('p', 'ui-text', sp.desc));
      if (sp.id === 'viveiro') card.append(h('p', 'ui-text map-sub', `Moedas-Folha plantadas: ${moedasPlantadas()} de 14`));
      this.info.append(card);
    } else {
      const node = MAP.find((n) => n.id === id)!;
      const p = game.save.levels[id];
      this.header.append(h('div', 'map-world', carved(WORLD_NAMES[node.mundo] ?? '', { tone: 'verde', size: 18 })), carved(node.nome, { tone: 'ouro', size: 40 }));
      const card = h('div', 'panel map-card');
      const medals = h('div', 'map-medals');
      for (const m of MEDALHAS) {
        const ok = !!p?.medals?.[m.id];
        medals.append(h('div', 'map-medal' + (ok ? ' ok' : ''), img(ok ? `medalhas/${m.id}.svg` : 'medalhas/vazia.svg'), h('span', '', m.nome)));
      }
      const L = LEVELS[id];
      const cipo = h('div', 'map-cipo');
      ['C', 'I', 'P', 'Ó'].forEach((c) => cipo.append(carved(c, { tone: p?.letras ? 'ouro' : 'madeira', size: 18 })));
      const extras = h('div', 'map-extras', cipo,
        h('span', 'coin-line' + (p?.moeda ? '' : ' apagado'), img('hud/moeda-folha.svg'), p?.moeda ? 'Moeda-Folha' : 'Moeda-Folha escondida'),
        h('span', 'coin-line', img('hud/relogio.svg'), p?.bestTime !== undefined ? fmtTime(p.bestTime) + (L?.targetTime ? ` / alvo ${fmtTime(L.targetTime)}` : '') : L?.targetTime ? `alvo ${fmtTime(L.targetTime)}` : '—'),
        L?.bonusRooms?.length ? h('span', 'coin-line', img('hud/relogio.svg', 'cristal'), `Câmaras ${p?.bonus.length ?? 0}/${L.bonusRooms.length}`) : null);
      card.append(medals, extras);
      if (id === '5-1' && !this.unlocked('5-1')) card.append(h('p', 'ui-text map-sub', `Precisa de 14 Moedas-Folha (${moedasPlantadas()}/14).`));
      this.info.append(card);
    }
    this.header.classList.remove('on'); void this.header.offsetWidth; this.header.classList.add('on');
    this.info.classList.remove('on'); void this.info.offsetWidth; this.info.classList.add('on');
  }

  private activate() {
    const id = this.cur;
    if (id === 'bem-te-vi') { game.persist(); sfx('brinde'); void dialog({ speaker: 'bem-te-vi', titulo: 'Jogo salvo!', text: 'Bem-te-vi! Anotei tudinho no bilhete: fases, castanhas, medalhas e até o tamanho do ronco da Tamá.' }); return; }
    if (id === 'oficina') { go('oficina', {}, 'push'); return; }
    if (id === 'viveiro') { go('viveiro', {}, 'push'); return; }
    if (id.startsWith('tucano-')) { this.voo(); return; }
    if (!this.unlocked(id)) { sfx('ui-erro'); return; }
    if (!LEVELS[id]) { sfx('ui-erro'); void dialog({ speaker: 'tucano', titulo: 'Trilha fechada', text: 'Os cipós ainda fecham esta trilha. Volte daqui a pouco!' }); return; }
    game.save.mapPos = id;
    game.persist();
    sfx('ui-confirmar');
    screens.replace(new PlayScreen({ level: id }));
  }

  /** Voo do Tucano: escolhe um mundo liberado e voa direto para a primeira fase dele. */
  private voo() {
    const mundos = [1, 2, 3, 4].filter((m) => game.save.unlocked.includes(MAP.find((n) => n.mundo === m)!.id));
    const items = mundos.map((m) => ({ label: WORLD_NAMES[m], onSelect: () => this.voar(`tucano-${m}`) }));
    items.push({ label: 'Sumaúma (início)', onSelect: () => this.voar('1-1') });
    if (game.save.unlocked.includes('5-1')) items.push({ label: 'Copa da Sumaúma', onSelect: () => this.voar('5-1') });
    void dialog({ speaker: 'tucano', titulo: 'Voo do Tucano', text: 'Segura firme no meu pescoço! Pra onde a gente voa?', items, cancel: true });
  }
  private voar(id: string) {
    sfx('flor-disparo');
    this.el.classList.add('voando');
    setTimeout(() => {
      this.cur = id;
      [this.heroX, this.heroY] = this.pos[id];
      this.trail = this.trail.map(() => [this.heroX - 30, this.heroY]);
      game.save.mapPos = id;
      this.showInfo();
      this.el.classList.remove('voando');
    }, 650);
  }

  private menuMapa() {
    void dialog({ speaker: 'bugio', titulo: 'Ilha Sumaúma', text: `Castanhas: ${game.save.castanhas} (+${game.save.banco} no banco) · Parafusos: ${game.save.parafusos} · Vidas: ${game.save.vidas}`, cancel: true, items: [
      { label: 'Álbum da Selva', onSelect: () => go('album', {}, 'push') },
      { label: 'Desafios do Tucano', onSelect: () => go('desafios', {}, 'push') },
      { label: 'Viveiro', onSelect: () => go('viveiro', {}, 'push') },
      { label: 'Oficina do Vô Bugio', onSelect: () => go('oficina', {}, 'push') },
      { label: 'Opções', onSelect: () => go('options', {}, 'push') },
      ...(game.save.finalVisto ? [{ label: 'Rever o final', onSelect: () => go('ending') }] : []),
      { label: 'Salvar e sair', onSelect: () => { game.persist(); go('title'); } },
    ] });
  }

  update(dt: number) {
    this.t += dt;
    if (screens.busy || this.busyUi || screens.top !== this) return;
    if (this.walk) {
      const w = this.walk;
      w.d = Math.min(w.len, w.d + dt * 380);
      const pt = w.path.getPointAtLength(w.rev ? w.len - w.d : w.d);
      this.heroX = pt.x; this.heroY = pt.y;
      if (w.d >= w.len) { this.cur = w.to; this.walk = null; game.save.mapPos = this.cur; this.showInfo(); sfx('passo-terra', 0.6); }
      return;
    }
    if (input.pressed('left')) this.tryMove(-1, 0);
    else if (input.pressed('right')) this.tryMove(1, 0);
    else if (input.pressed('up')) this.tryMove(0, -1);
    else if (input.pressed('down')) this.tryMove(0, 1);
    else if (input.pressed('confirm')) this.activate();
    else if (input.pressed('swap')) { sfx('ui-confirmar'); this.voo(); }
    else if (input.pressed('pause') || input.pressed('back')) { sfx('ui-pausa'); this.menuMapa(); }
  }

  render(_a: number, fd: number) {
    // câmera suave seguindo a dupla
    const k = Math.min(1, fd * 4);
    this.camX += (this.heroX - this.camX) * k;
    this.camY += (this.heroY - this.camY) * k;
    const cx = Math.max(560, Math.min(PW - 560, this.camX)), cy = Math.max(330, Math.min(PH - 260, this.camY));
    this.cam.style.transform = `translateY(40px) rotateX(${TILT}deg) translate3d(${(-cx).toFixed(1)}px, ${(-cy).toFixed(1)}px, 0)`;
    this.proj = new DOMMatrix().translate(640, 400).rotate(TILT, 0, 0).translate(-cx, -cy);
    for (const a of this.anchors) this.placeAt(a.el, a.x, a.y);
    // trilha: a Lili segue a Tamá com atraso
    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(last[0] - this.heroX, last[1] - this.heroY) > 2) { this.trail.push([this.heroX, this.heroY]); if (this.trail.length > 30) this.trail.shift(); }
    const moving = !!this.walk;
    const lp = this.trail[Math.max(0, this.trail.length - 14)];
    if (this.tama && this.lili) {
      this.tama.play(moving ? 'andar' : 'idle');
      const lm = Math.hypot(lp[0] - this.liliPos[0], lp[1] - this.liliPos[1]) > 0.5;
      this.lili.play(lm ? 'andar' : 'idle');
      if (moving && Math.abs(this.heroX - this.tamaPos[0]) > 0.3) this.tama.flip = this.heroX < this.tamaPos[0];
      if (lm && Math.abs(lp[0] - this.liliPos[0]) > 0.3) this.lili.flip = lp[0] < this.liliPos[0];
      this.placeBB(this.tama, this.heroX, this.heroY);
      this.placeBB(this.lili, lp[0], lp[1]);
      this.tamaPos = [this.heroX, this.heroY]; this.liliPos = [lp[0], lp[1]];
      for (const sp of [this.tama, this.lili]) { sp.update(fd); sp.render(); }
    }
    for (const b of this.bichos) { b.update(fd); b.render(); }
    for (const id in this.nodeEls) this.nodeEls[id].classList.toggle('cur', id === this.cur && !moving);
  }
  exit() { this.tama?.destroy(); this.lili?.destroy(); this.bichos.forEach((b) => b.destroy()); }
}
registerScreen('map', () => new MapScreen());
export { TILT as MAP_TILT };
