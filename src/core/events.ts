/** Barramento de eventos global (HUD, áudio, desafios e conquistas escutam o jogo por aqui). */
type Fn = (data?: any) => void;
const map = new Map<string, Set<Fn>>();
export const bus = {
  on(ev: string, fn: Fn) { (map.get(ev) ?? map.set(ev, new Set()).get(ev)!).add(fn); return () => map.get(ev)?.delete(fn); },
  off(ev: string, fn: Fn) { map.get(ev)?.delete(fn); },
  emit(ev: string, data?: any) { map.get(ev)?.forEach((f) => f(data)); map.get('*')?.forEach((f) => f({ ev, data })); },
};
/*
 Eventos padronizados (payload):
  'coin' {n}                 'letra' {i}               'vida' {n}             'moeda-folha'
  'parafuso' {n}             'enemy-kill' {type, how: 'pisao'|'arma'|'arremesso'|'rolar'|'montaria'|'outro', weapon?}
  'hero-hurt' {hero}         'hero-lost' {hero}        'hero-swap' {hero}     'partner-back'
  'weapon-pick' {id}         'weapon-break' {id}       'weapon-hit' {id, target}
  'checkpoint'               'level-start' {id}        'level-end' {id, time} 'death' {kind}
  'gag' {id}                 'bonus-enter' {id}        'bonus-end' {id, ok}   'boss-hit' {id, hp}
  'boss-defeat' {id}         'mount' {id}              'dismount' {id}        'secret' {kind}
  'combo' {n}                'sfx' {id, x?}            'music' {id}           'shake' {amp, ms}
  'hitstop' {ms}             'toast' {text, icon?}
*/
