/**
 * Palco DOM + CSS 3D. Profundidade REAL: as camadas de parallax ficam em translateZ dentro de um
 * contêiner com perspective; o deslocamento mais lento das camadas distantes vem da própria projeção.
 *
 * Hierarquia:
 *  #viewport (1280×720 escalado)
 *    .scene3d (perspective)         ← recebe zoom/inclinação da câmera
 *      .rig (preserve-3d)
 *        .parallax.l1 … l4 (translateZ negativo)
 *        .world (z = 0)  → .chunks-back, .entities, .chunks-front
 *        .parallax.l5 (translateZ positivo, primeiro plano escuro)
 *    .overlay   (escuridão, chuva, água, flashes — espaço de tela)
 *    .hud
 *    .screens
 */
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const PERSPECTIVE = 1200;
export const LAYER_Z = [-2400, -1400, -600, -180, 300];

export interface ParallaxLayerDef { src: string; w: number; h: number; z?: number; y?: number; fill?: string }

class ParallaxLayer {
  el = document.createElement('div');
  constructor(public def: ParallaxLayerDef, public z: number) {
    this.el.className = 'parallax';
    this.el.style.backgroundImage = `url(${def.src})`;
    this.el.style.backgroundSize = `${def.w}px ${def.h}px`;
    this.el.style.width = `${def.w * Math.ceil((VIEW_W * 2.2) / def.w + 1)}px`;
    this.el.style.height = `${def.h}px`;
  }
  /** f = fator de projeção da camada (quanto do movimento da câmera chega à tela). */
  get f() { return PERSPECTIVE / (PERSPECTIVE - this.z); }
  /**
   * Um ponto (u,v) do elemento com transform translate3d(X,Y,z) scale(1/f) é projetado em
   * tela = centro + (X - centro)·f + u. Escolhemos X,Y para que o conteúdo role na razão f
   * (parallax real) e deslocamos o elemento em múltiplos do período da imagem para cobrir a vista.
   */
  update(camX: number, camY: number, levelH: number) {
    const f = this.f, w = this.def.w, h = this.def.h;
    const u0 = Math.floor((camX * f - VIEW_W * 0.6) / w) * w;
    const X = VIEW_W / 2 + (u0 - camX * f - VIEW_W / 2) / f;
    const Y = VIEW_H / 2 + ((levelH - camY) * f + VIEW_H * (1 - f) - h + (this.def.y ?? 0) - VIEW_H / 2) / f;
    this.el.style.transform = `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, ${this.z}px) scale(${(1 / f).toFixed(5)})`;
  }
}

export class Stage {
  viewport: HTMLElement;
  scene3d = div('scene3d');
  rig = div('rig');
  world = div('world');
  chunksBack = div('chunks-back');
  entities = div('entities');
  chunksFront = div('chunks-front');
  overlay = div('overlay');
  hud = div('hud');
  screens = div('screens');
  sky = div('sky');
  private layers: ParallaxLayer[] = [];
  camX = 0; camY = 0; zoom = 1; tiltX = 0; tiltY = 0;
  shakeX = 0; shakeY = 0;
  levelH = VIEW_H;

  constructor(root: HTMLElement) {
    this.viewport = root;
    this.world.append(this.chunksBack, this.entities, this.chunksFront);
    this.rig.append(this.world);
    this.scene3d.append(this.sky, this.rig);
    root.append(this.scene3d, this.overlay, this.hud, this.screens);
    this.fit();
    addEventListener('resize', () => this.fit());
  }

  /** Escala o viewport lógico 1280×720 para a janela mantendo 16:9 (letterbox decorado no CSS). */
  fit() {
    const s = Math.min(innerWidth / VIEW_W, innerHeight / VIEW_H);
    this.viewport.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  setParallax(defs: ParallaxLayerDef[], sky: string) {
    for (const l of this.layers) l.el.remove();
    this.layers = defs.map((d, i) => new ParallaxLayer(d, d.z ?? LAYER_Z[i] ?? -600));
    this.sky.style.background = sky;
    for (const l of this.layers) {
      if (l.z > 0) this.rig.append(l.el);
      else this.rig.insertBefore(l.el, this.world);
    }
  }
  setQuality(q: 'alta' | 'media') {
    this.layers.forEach((l, i) => (l.el.style.display = q === 'media' && i === 1 ? 'none' : ''));
    this.viewport.classList.toggle('q-media', q === 'media');
  }
  clearWorld() {
    this.chunksBack.replaceChildren();
    this.entities.replaceChildren();
    this.chunksFront.replaceChildren();
    this.overlay.replaceChildren();
    for (const l of this.layers) l.el.remove();
    this.layers = [];
  }

  render() {
    const x = this.camX + this.shakeX, y = this.camY + this.shakeY;
    this.world.style.transform = `translate3d(${(-x).toFixed(1)}px, ${(-y).toFixed(1)}px, 0)`;
    for (const l of this.layers) l.update(x, y, this.levelH);
    this.rig.style.transform = `scale(${this.zoom.toFixed(4)}) rotateX(${this.tiltX.toFixed(2)}deg) rotateY(${this.tiltY.toFixed(2)}deg)`;
  }
}

export function div(cls: string, parent?: HTMLElement) {
  const d = document.createElement('div');
  d.className = cls;
  parent?.append(d);
  return d;
}
