# API do motor (runtime, `src/`)

Leia junto: `GAME_SPEC_PLATAFORMA.md`, `docs/LEVEL_FORMAT.md`, `docs/MODELS.md`. Proibido no runtime: `<canvas>`, WebGL, Three.js. Proibido `Math.random` exceto variação de partículas (±10%), falas e a roleta autoral do Brinde. Proibido TODO/FIXME/placeholder/lorem.

## Rodar e testar
- `npx vite --port 5173` (já pode estar rodando). Abrir `http://localhost:5173/?fase=1-1` vai direto para a fase; `&debug` desenha a colisão do tilemap.
- Teste automatizado: script Playwright (`require('/opt/node-tools/node_modules/playwright')`), teclado (`ArrowRight`, `Space` pular, `ShiftLeft`/`KeyJ` ação, `KeyE` troca, `KeyC` largar, `Escape` pausa) e screenshots; leia os PNGs com a ferramenta de imagem.
- `window.__sumauma = { screens, stage }` para inspeção no console. `screens.top.world` é o `World` da fase.

## Núcleo
- `core/loop.ts`: passo fixo 60 Hz; `hitStop(ms)`.
- `core/input.ts`: `input.down/pressed/released/held(action)`, `input.axisX()`, `promptFor(action)` (texto da tecla/botão para a UI), `lastDevice`, `onDeviceChange`. Actions: left right up down jump action swap drop pocket pause confirm back. `captureNextKey` para remapear.
- `core/events.ts`: `bus.on(ev, fn)` / `bus.emit(ev, data)`. Lista de eventos no topo do arquivo. Também: `'held' {id, usos} | null`, `'pocket'`, `'pound' {x,y}`, `'hero-shout' {x,y}`, `'bonus-timer' {t}`, `'ambience' id|null`, `'music' id`, `'sfx' {id, pan, vol}`.
- `core/save.ts`: `game.save` (SaveSlot, ver `game/types.ts`), `game.options`, `game.persist()`, `levelProgress(save, id)`, `loadSlot/writeSlot/newSlot/deleteSlot`, `loadOptions/saveOptions`, `completion()`.
- `core/assets.ts`: `anim(model, nome, preset, variante)`, `modelMeta(id)`, `sceneryMeta()` (scenery.json), `preload(url)`, `preloadModel(...)`.

## Render
- `render/stage.ts`: `Stage` (palco 1280×720; camadas `chunksBack`, `entities`, `chunksFront`, `overlay`, `hud`, `screens`).
- `render/sprite.ts`: `new Sprite(model, preset, variant, parentEl, { shadow })` → `.play(anim, { restart, speed, onEnd, from })`, `.update(dt)`, `.render()`, `.x/.y` (pés, px de mundo), `.flip`, `.sx/.sy` (squash), `.rot`, `.alpha`, `.z`, `.flash()`, `.extraFilter`, `.anchor('hand' | 'sela' | 'head')` → `[x, y, ângulo]`, `.box()`, `.has(anim)`, `.ended`, `.destroy()`.
- `render/fx.ts` via `world.spawnFx(model, anim, x, y, { flip, scale, vx, vy, gravity, life, z, front, rot, spin, alpha, fade, loop, follow })` e `world.text('PÓÓIN!', x, y)`.

## Entidades (`game/entity.ts`)
```ts
class MeuInimigo extends Entity {
  constructor(w: World, s: EntitySpawn) { super(w, s); this.team = 'enemy'; this.stompable = true; this.touchHurts = true; }
  init() { this.makeSprite('javalim', 'andar', { shadow: true }); this.makeBody(56, 100); }
  update(dt: number) { /* IA */ this.physics(dt); this.sprite!.update(dt); }
  onStomp(hero, heavyHero) { return 'kill' | 'bounce' | 'hurt'; }
  onHit(h: HitInfo) { /* h.kind: pisao|arma|arremesso|rolar|montaria|explosao|outro; h.dmg; h.dir; h.weapon */ return true; }
}
register('meu-tipo', (w, s) => new MeuInimigo(w, s));
```
- Campos: `x, y` (pés, px), `w, h`, `vx, vy`, `dir`, `dead`, `team` ('hero'|'enemy'|'neutral'|'pickup'|'projectile'), `sprite`, `body`, `solid` (sólido dinâmico; registre com `world.addSolid({x,y,w,h,oneway?,vx?,vy?})`), `z`, `stompable`, `touchHurts`, `grabbable` (id de WeaponDef → o herói pega com J), `armored`, `hp`, `persistent`, `activeMargin`, `tag`.
- `onTouch(hero)` é chamado por quem quiser (coletáveis devem checar sobreposição com `world.duo.leader` no próprio update). `onInteract(hero)` é chamado quando o herói aperta ação perto (retorne true se consumiu).
- `physics(dt, gravidade?, quedaMax?)` usa `this.body`. Helpers: `distTo`, `kill()`, `sfx(id)`.
- Ao derrotar inimigo: `world.enemyKilled(e, how, weapon?)` (combo e eventos — o herói já chama nos casos de pisão/arma/rolamento; chame você nos demais).
- Coletáveis/quebráveis que não devem reaparecer na mesma tentativa: chame `world.collect(this)` antes de `kill()`.
- Cada módulo registra seus tipos ao ser importado; garanta o import no `index.ts` da pasta (`src/game/<pasta>/index.ts`), que é importado por `src/game/register.ts`.

## World (`game/world.ts`)
`world.grid` (Grid: `at(tx,ty)`, `atPx(x,y)`, `set`, `pxW/pxH`; tipos em `physics.ts` enum `T`), `world.entities`, `world.solids`, `world.duo` (Duo), `world.level` (LevelDef), `world.preset`, `world.time`, `world.camX/camY`, `world.scriptCam = { x, y, zoom?, tilt? } | null` (câmera roteirizada), `world.lights` (luzes extras), `world.regionFlags`, `world.spawn(spawn)`, `world.add(entity)`, `world.addSolid/removeSolid`, `world.hitArea(area, hit, filtro?)`, `world.enemiesNear(x,y,r)`, `world.find(pred)`, `world.byTag(tag)`, `world.sfx(id, x?, vol?)`, `world.shake(amp, ms)`, `world.hitstop(ms)`, `world.toast(texto, ícone?)`, `world.setCheckpoint(x,y)`, `world.complete()` (fim de fase/sala bônus com sucesso), `world.hooks.onEnterBonus(room)` / `world.hooks.onExitBonus(ok)`, `world.setRain(on)`, `world.setSunset(on)`, `world.partnerLost`, `world.letras`.
Entidades podem expor `light(): { x, y, r } | null` para iluminar cavernas escuras.

## Heróis (`game/hero.ts`, `game/duo.ts`)
- `world.duo.leader` / `world.duo.partner` (Hero | null), `duo.heroes.tama/lili`, `duo.swap()`, `duo.recoverPartner(x, y)` (Ninho), `duo.celebrate()`, `duo.shoutMode`.
- Hero: `hid` ('tama'|'lili'), `isTama`, `state`, `b` (body), `dir`, `held` ({ def, usos } | null), `equip(held)`, `dropHeld(place?)`, `throwHeld(modo)`, `bounce(v)` (bromélia/pisão), `launch(vx, vy)` (flor-catapulta), `pin(seg, anim)` (preso: abraço, caranguejo, rede), `hurt(hit, deathKind?)`, `die(kind)` ('normal'|'queimado'|'esmagado'|'afogado'|'queda'), `rideOn(mount)`, `leaveMount()`, `helmet` (golpes absorvidos pela panela), `disguiseT` (capacete de javalim), `sprite`.
- Montarias implementam `Rideable` (hero.ts): `ride(hero)`, `controlUpdate(dt, hero)` (lê `input` e move a montaria), `dismount(hero, hurt)`, `saddle()` → [x, y] (use a âncora `sela` do sprite), `riderZ()`.

## Armas (`game/weapons/types.ts`)
`defineWeapon({ id, nome, peso, usos, model, pega: 'mao'|'cabeca', golpe: { alcance, altura, dmg, som, acerto?, onomato?, empurra?, especial? } | null, arremessar?(world, hero, modo), segurando?(world, hero, dt), aoQuebrar?, soTama? })`.
O herói faz o combo de 3 golpes (golpe1/2/3), consome usos, quebra e emite eventos. Sem `arremessar`, o herói cria a entidade genérica `'arremessado'` com `{ id, dir, modo, forca }` — ela precisa ser registrada (pickups/objetos).
Carregáveis: `cabaca`, `cabaca-pedra`, `bromelia` também são WeaponDefs (pega 'cabeca') e suas entidades no chão têm `grabbable`.

## Telas (`ui/screens`)
- `screens.push(s)`, `screens.pop()`, `screens.replace(s)` (cortina de listras), `screens.curtain(close)`, `screens.top`, `screens.stage`.
- `registerScreen(id, factory)` / `makeScreen(id, args)`. Ids esperados: splash, intro, title, saves, map, hud (args { play }), pause (args { play }), options, results (args { level, result, session }), gameover (args { level }), ending, credits, oficina, album, desafios, viveiro, levelcard (args { level }), dialog.
- `ui/screens/play.ts`: `new PlayScreen({ level })` (tela de jogo). `game/progress.ts`: `UPGRADES`, `upgradeLevel`, `buyUpgrade`, `finishLevel`.
- `ui/index.ts` importa os módulos de tela.
