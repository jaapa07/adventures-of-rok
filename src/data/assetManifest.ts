/**
 * Manifesto de assets obrigatórios (verificado por tools/verify.ts): cada caminho precisa existir em
 * public/ com mais de 2 KB. Montado a partir do contrato de modelos (docs/MODELS.md), tilesets, decor,
 * parallax, mapa, cinemáticas e UI.
 */
const MODELS: Record<string, string[]> = {
  tama: ['idle', 'andar', 'correr', 'pulo', 'golpe1', 'nadar', 'vitoria', 'morte'],
  lili: ['idle', 'andar', 'correr', 'pulo', 'golpe1', 'nadar', 'vitoria', 'planar'],
  pirarucu: ['idle', 'nadar', 'investida', 'ataque'], ema: ['idle', 'correr', 'chute'], tatu: ['idle', 'rolar', 'cavar'],
  javalim: ['idle', 'andar', 'ataque', 'dano', 'morte', 'tonto', 'susto', 'selfie', 'cair', 'domino', 'dancar', 'correr-banheiro', 'ir-embora', 'ataque-arma', 'remar'],
  'javalim-escudo': ['idle', 'andar', 'escudo', 'morte'], javalao: ['idle', 'andar', 'pisao', 'morte'], serrote: ['idle', 'morte'], marimbondo: ['idle', 'morte'],
  cascavel: ['idle', 'enrolar', 'saltar', 'morte'], lagarto: ['idle', 'correr', 'morte'], morcego: ['idle', 'mergulho', 'pendurado', 'morte'],
  piranha: ['idle', 'ataque', 'morte'], caranguejo: ['idle', 'andar', 'conga', 'prender', 'morte'], 'agua-viva': ['idle', 'morte'], baiacu: ['idle', 'inflado', 'morte'],
  'lagarta-trator': ['idle', 'parar'], 'bau-boca': ['idle', 'perseguir', 'morder', 'comer-peixe'],
  'major-motosserra': ['idle', 'entrada', 'ataque1', 'vulneravel', 'derrota'], 'rainha-morcega': ['idle', 'entrada', 'ataque1', 'vulneravel', 'derrota'],
  'polvo-draga': ['idle', 'entrada', 'ataque1', 'vulneravel', 'derrota'], 'barao-javardo': ['idle', 'disfarce', 'revelar', 'estagio2', 'estagio3', 'derrota'],
  preguica: ['dormir', 'acordar', 'abracar'], 'vo-bugio': ['idle', 'martelar'], tucano: ['idle', 'voar'], quati: ['idle', 'vender'], 'bem-te-vi': ['idle', 'entregar'], 'morcego-dj': ['tocar'],
  cabaca: ['idle', 'rolar', 'quebrar'], 'cabaca-pedra': ['idle', 'rolar'], bromelia: ['idle', 'mola'], 'flor-catapulta': ['idle', 'engolir', 'disparar'], ninho: ['idle', 'quebrar'],
  'totem-cipo': ['apagado', 'aceso'], 'totem-saida': ['idle', 'girar'], 'caixa-montaria': ['idle', 'quebrar'], tronco: ['idle'], carrinho: ['idle', 'andar'], 'parede-rachada': ['idle', 'quebrar'],
  castanha: ['girar'], 'letra-c': ['girar'], 'letra-i': ['girar'], 'letra-p': ['girar'], 'letra-o': ['girar'], 'moeda-folha': ['girar'], 'balao-tucano': ['flutuar'],
  'fx-poeira': ['corrida', 'pulo', 'aterrissar'], 'fx-faisca': ['impacto'], 'fx-fumaca': ['derrota'], 'fx-agua': ['respingo'], 'fx-explosao': ['grande'],
};
const WEAPONS = ['galho', 'coco', 'jaca', 'remo', 'vassoura', 'panela', 'lamparina', 'chave', 'peixe', 'estilingue', 'cupinzeiro', 'guarda-chuva', 'buzina', 'capacete'];
const TILESETS = ['mata', 'gruta', 'recife', 'fabrica', 'cristal', 'copa'];
const TILES = [...Array.from({ length: 16 }, (_, i) => `solid-${i}`), 'solid-15-b', 'solid-15-c', 'slope-r', 'slope-l', 'plat-s', 'plat-l', 'plat-m', 'plat-r', 'spike', 'vine-top', 'vine', 'vine-bottom', 'rope'];
const PARALLAX = ['mata', 'mata-tarde', 'serraria', 'rio', 'gruta', 'mina', 'praia', 'recife', 'naufragio', 'fabrica', 'cristal', 'copa'];

type Atlas = Record<string, { src?: string }> & { '@models': Record<string, { variants: string[]; presets: string[] }> };

export function assetManifest(atlas: Atlas, scenery: { decor?: Record<string, { src: string }> }): string[] {
  const out: string[] = [];
  const sheet = (id: string, anim: string) => {
    const meta = atlas['@models'][id];
    if (!meta) { out.push(`assets/sprites/${id}/(modelo-ausente)-${anim}.webp`); return; }
    for (const p of meta.presets) { const e = atlas[`${id}|base|${p}|${anim}`]; if (e?.src) { out.push(e.src); return; } }
    out.push(`assets/sprites/${id}/(animacao-ausente)-${anim}.webp`);
  };
  for (const [id, anims] of Object.entries(MODELS)) for (const a of anims) sheet(id, a);
  for (const w of WEAPONS) for (const a of ['mundo', 'mao', 'voando', 'quebrar']) sheet(`arma-${w}`, a);
  for (const t of TILESETS) for (const n of TILES) out.push(`assets/tiles/${t}/${n}.webp`);
  out.push('assets/tiles/fabrica/belt.webp', 'assets/tiles/gruta/rail.webp');
  for (const d of Object.values(scenery.decor ?? {})) out.push(d.src);
  for (const p of PARALLAX) for (let n = 1; n <= 5; n++) out.push(`assets/parallax/${p}/${n}.webp`);
  out.push('assets/map/ilha-devastada.webp', 'assets/map/ilha-renascida.webp', ...[1, 2, 3, 4].map((n) => `assets/map/regiao-${n}-verde.webp`));
  for (let i = 1; i <= 6; i++) out.push(`assets/cine/abertura-${i}.webp`);
  for (let i = 1; i <= 8; i++) out.push(`assets/cine/final-${i}.webp`);
  out.push('assets/cine/gameover.webp', 'assets/cine/titulo-fundo.webp', 'assets/ui/icone.svg', 'assets/ui/logo/texto.svg', 'assets/ui/logo/placa.svg', 'assets/ui/logo/folhas.svg', 'assets/ui/logo/cipos.svg', 'assets/ui/logo/semente.svg');
  return out.map((s) => s.replace(/^\/?/, ''));
}
