# Formato de fases, tilesets, decor e parallax

Tipos em `src/game/types.ts` (`LevelDef`). Fases ficam em `src/data/levels/<id>.ts` exportando `default` um `LevelDef`, e são registradas em `src/data/levels/index.ts`.

## Unidades
- **TILE = 64 px.** Coordenadas de fase em tiles (`x` coluna, `y` linha; podem ser fracionárias). Para entidades, `y` é a **linha do chão** onde ela pisa (o pé fica no topo da linha `y`): uma entidade em pé sobre o chão `#` da linha 12 usa `y: 12`.
- Tela = 20 × 11,25 tiles. Herói Tamá ≈ 2,6 tiles de altura, pulo ≈ 3,5 tiles de altura e ≈ 6 tiles de distância correndo; Lili pula ≈ 4,2 tiles.

## Legenda do tilemap (uma string por linha, todas com a mesma largura)
| Char | Significado |
|---|---|
| `.` | vazio |
| `#` | terreno sólido (autotile) |
| `=` | plataforma atravessável por baixo (galho/tábua) |
| `/` | rampa 45° subindo para a direita (o tile à direita, na mesma linha, normalmente é `#`) |
| `\` | rampa 45° descendo para a direita |
| `^` | espinhos/perigo (espinheiro, estalagmite, ouriço, pregos — conforme o tileset) |
| `~` | água (nadar). A superfície é desenhada automaticamente onde a célula de cima não é água |
| `|` | cipó vertical (escalar) |
| `_` | corda/cipó horizontal (pendurar e atravessar) |
| `>` `<` | esteira (fábrica) — sólida, empurra para a direita/esquerda |
| `T` | trilho (mina) — superfície atravessável por baixo onde o carrinho corre |
| `!` | cipó dentro d'água |

Elementos quebráveis/dinâmicos (parede rachada, terra mole, bloco de madeira, plataformas móveis, troncos) **não** vão no tilemap: são entidades.

## Tilesets — `public/assets/tiles/<tileset>/<nome>.webp`
Tilesets: `mata`, `gruta`, `recife`, `fabrica`, `cristal`, `copa`. Cada imagem tem **96×96 px**: o tile ocupa o centro 64×64 e há 16 px de margem para decoração que transborda (grama, musgo, pedrinhas). O bake desenha em ordem de linha, de cima para baixo.
- `solid-<m>` para m = 0…15, máscara de vizinhos sólidos: 1 = cima, 2 = direita, 4 = baixo, 8 = esquerda. Topos expostos (sem bit 1) têm grama/musgo/coral/ferrugem conforme o mundo.
- `solid-15-b`, `solid-15-c` (variações do interior, escolhidas por `(x*7 + y*13) % 3`).
- `slope-r`, `slope-l` (rampas, preenchidas abaixo da diagonal).
- `plat-s`, `plat-l`, `plat-m`, `plat-r` (plataforma isolada / ponta esquerda / meio / ponta direita).
- `spike`, `vine-top`, `vine`, `vine-bottom`, `rope`, `belt` (só fabrica), `rail` (só gruta).
- `scenery.json → water[<tileset>]` = `{ color, surface: 'tiles/<ts>/water-surface.webp', sw, sh }` (faixa de ondas repetível, 4 quadros lado a lado).

## Decor — `public/assets/decor/<tileset>/<nome>.webp`
Usado em `LevelDef.decor` como `d: '<tileset>/<nome>'`. Manifesto em `scenery.json → decor['<tileset>/<nome>'] = { src, w, h, ax, ay }` (âncora = base do objeto). Itens que pendem do teto têm âncora no topo (`ay = 0`).
- **mata**: samambaia, bromelia-deco, tronco-caido, raiz, pedra-musgo, cogumelos, arbusto, heliconia, placa-javali, toco, cipo-pendente, palmeira-jovem, pilha-toras, maquina-serraria, placa-serraria
- **gruta**: estalagmite-p, estalagmite-g, cristal-ambar, coluna, lamparina-parede, trilho-quebrado, carrinho-velho, cogumelo-brilho, viga-mina, estalactite
- **recife**: coral-leque, coral-cerebro, anemona, alga-alta, concha, estrela-mar, ancora, barril-naufrago, coqueiro, guarda-sol, castelo-areia, timao, bau-velho
- **fabrica**: cano, chamine-p, engrenagem, barril-oleo, placa-javarda, painel, corrente, caixa-metal, tubo-vapor, toco-cortado, cerca-arame
- **cristal**: cristal-g, cristal-p, cristal-flutuante
- **copa**: galho-g, folha-gigante, ninho-aves, flor-sumauma, semente-luz

## Parallax — `public/assets/parallax/<set>/<n>.webp`, n = 1…5
Conjuntos: `mata`, `mata-tarde`, `serraria`, `rio`, `gruta`, `mina`, `praia`, `recife`, `naufragio`, `fabrica`, `cristal`, `copa`.
Camadas 1 (mais distante) a 4 (perto) ficam atrás do jogo; a camada 5 fica **na frente** (silhuetas escuras de folhas/rochas, majoritariamente transparente). Cada imagem é repetível na horizontal (largura 1600–2560) e tem altura 720–1200; a base da imagem alinha com a base da fase.
`scenery.json → parallax[<set>] = [{ src, w, h, y? }, …5]` e `sky[<set>] = '<CSS background>'` (gradiente atrás de tudo).

## Catálogo de entidades (`EntitySpawn.t`)
- Coletáveis: `castanha`, `cacho`, `letra` {i: 0..3}, `moeda-folha`, `ficha` {m}, `parafuso`, `balao` {n: 1|2|3}
- Armas soltas: `arma` {id: galho|coco|jaca|remo|vassoura|panela|lamparina|chave|peixe|estilingue|cupinzeiro|guarda-chuva|buzina|capacete}
- Objetos: `cabaca`, `cabaca-pedra`, `bromelia`, `flor-catapulta` {ang: graus, gira?: boolean, forca?: px/s, auto?: boolean}, `ninho`, `totem-cipo`, `totem-saida`, `caixa-montaria` {m: pirarucu|ema|tatu}, `tronco` {afunda?: boolean}, `plataforma` {path: [[x,y]…], vel?: px/s}, `carrinho`, `fogueira`, `parede-rachada`, `terra-mole`, `bloco-madeira`, `teia`, `painel-maquina` {alvo: string}, `serra-gigante` {path}, `porta-bonus` {room}, `saida-bonus`, `canoa`, `placa-trilho`, `garrafa-cafe`, `relogio-ponto`, `celular`, `gaiola`
- Inimigos: `javalim` {arma?, patrulha?: [x0,x1]}, `javalim-escudo`, `javalao`, `serrote` {amp?, freq?}, `marimbondo` {rota: 'circulo'|'vaivem'|'oito', raio?}, `cascavel`, `lagarto`, `morcego`, `piranha` {rota?}, `caranguejo`, `agua-viva` {amp?}, `baiacu`, `lagarta-trator`, `bau-boca`
- NPC: `npc` {id: preguica|vo-bugio|tucano|quati|bem-te-vi|morcego-dj, falas?: string[]}
- Gags: `gag` {id: 'gag_…', …parâmetros}
- Chefe: `chefe` {id}
