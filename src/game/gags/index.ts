/**
 * Registro das gags (seção 18). O tipo de entidade `gag` despacha por `spawn.id`.
 * Parâmetros de cada gag: comentário no topo de cada arquivo e docs/GAGS.md.
 */
import { register } from '../entity';
import { GAGS, GagInerte, gagCss } from './common';
import './diretor';
import './preguica';
import './selfie';
import './serraria';
import './canoa';
import './eco';
import './morcego-dj';
import './trilho-errado';
import './caranguejo-baile';
import './naufragio';
import './agua-viva-disco';
import './cafe';
import './relogio-ponto';
import './lagarta';
import './barao-disfarce';

register('gag', (w, s) => {
  gagCss();
  const f = GAGS[String(s.id)];
  return f ? f(w, s) : new GagInerte(w, s);
});
