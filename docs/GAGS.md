# Gags — situações divertidas roteirizadas (seção 18)

Código em `src/game/gags/` (um arquivo por gag; registro em `index.ts`). Toda gag de fase é uma entidade
`{ t: 'gag', id: 'gag_…', x, y, …parâmetros }` em `LevelDef.entities`, e o id também vai em `LevelDef.gags`.
Coordenadas em **tiles** (`y` = linha do chão onde o pé fica, como nas demais entidades).
Quando o jogador ativa a gag, ela emite `bus.emit('gag', { id })` uma vez por tentativa (medalha Brincalhona).
As falas aparecem em balões DOM e emitem `bus.emit('babble', { voice, text })` para a voz balbuciada.

Os atores das gags (Javalins de cena, preguiça, canoa, baú, caranguejos…) são criados pela própria gag: **não**
coloque inimigos separados para eles.

## Gags de fase

| id | fase | spawn (tiles) | o que dispara a gag |
|---|---|---|---|
| `gag_preguica` | 1-1 | `{ t:'gag', id:'gag_preguica', x, y, de, ate, castanhas? }` — `de`/`ate`: colunas das bordas do vão (ponte de `de*64` a `ate*64`); `y`: linha do chão das bordas; `x`: centro visual; `castanhas` (8) | barulho perto: `'pound'`, `'hero-shout'`, buzina (`'weapon-hit'` id `buzina` ou golpe de buzina nela). Com o herói em cima: abraço de 3 s + castanhas (1ª vez) |
| `gag_selfie` | 1-2 | `{ t:'gag', id:'gag_selfie', x, y, dir? }` — pés do Javalim na beira; `dir` = lado do penhasco (1 direita, padrão) | golpe, pisão ou empurrão o derruba; pegar o celular (ação/J) dá a FOTO (`current.session.foto = true`) e ativa a gag |
| `gag_serraria` | 1-3 | `{ t:'gag', id:'gag_serraria', x, y, de, intervalo?, vel? }` — `x`: coluna da serra; `y`: topo da esteira; `de`: coluna onde nascem as toras; `intervalo` (4.5 s); `vel` (120 px/s) | subir numa tora e pular no último segundo → escultura da Tamá. Ficar em cima = `hero.die('normal')` |
| `gag_canoa` | 1-4 | `{ t:'gag', id:'gag_canoa', x, y, ate, vel?, largada? }` — `y`: linha da superfície da água; `ate`: coluna de chegada; `vel` (210); `largada` (6 tiles) | golpe/pisão num remador rouba o remo (o herói recebe a arma `remo`); sem remos a canoa fica à deriva |
| `gag_eco` | 2-1 | `{ t:'gag', id:'gag_eco', x, y, x0, x1, y0?, y1?, pontos? }` — área do salão; `pontos`: `[[x,y],…]` onde o eco bate (padrão: a cada 5 colunas). A escuridão vem de `regions: [{ …, escuro: true }]` | segurar a troca dentro da área (a gag liga `duo.shoutMode`) → `'hero-shout'` → luzes grandes por 2 s + fx-eco |
| `gag_trilho_errado` | 2-2 | `{ t:'gag', id:'gag_trilho_errado', x, y, sala:[x0,x1], mesa:[x,y], javalins:[[x,y],…], abre?:[[tx,ty],…], fecha?:[[tx,ty],…], aviso?, perseguir? }` — placa em `x,y`; `abre` vira vazio e `fecha` vira trilho `T` (só colisão: desenhe os dois trilhos); `aviso` (4 tiles); `perseguir` (30 tiles além da sala) | o líder chega na placa (ela vira) e entra na sala → mesa virada, dominó voando, perseguição |
| `gag_morcego_dj` | 2-3 | `{ t:'gag', id:'gag_morcego_dj', x, y, x0, x1, javalins:[[x,y],…] }` — DJ em `x,y`; pista `x0..x1` (acende na linha do 1º javalim) | derrubar um dançarino NO COMPASSO (onBeat da música; sem áudio 120 BPM). Fora do ritmo todos acordam e atacam |
| `gag_caranguejo_baile` | 3-1 | `{ t:'gag', id:'gag_caranguejo_baile', x, y, de, ate, n?, castanhas? }` — fila passeia entre as colunas `de..ate`; `n` (10); `castanhas` (30) | pisar na fila inteira sem tocar o chão (combo de `n`) → chuva de castanhas |
| `gag_naufragio` | 3-3 | `{ t:'gag', id:'gag_naufragio', x, y, x0, x1, y0?, y1? }` — baú em `x,y`; limites da sala | jogar/largar o Peixe Seco na sala (`arremessado`/`arma` id `peixe`), tapa de peixe nele, ou `bus 'peixe-isca' {x,y}` → ele come 5 s |
| `gag_agua_viva_disco` | 3-4 | `{ t:'gag', id:'gag_agua_viva_disco', x, y, x0, x1, linhas:[y,…], passo?, faixas? }` — `linhas`: faixas de águas-vivas; `passo` (2 colunas); `faixas`: faixa segura (apagada) por compasso (`[0,1,2,1]`; use faixas vizinhas — a próxima apaga 2 tempos antes e a anterior reacende 1 tempo depois, para dar tempo de trocar nadando) | atravessar o corredor (`x0` → `x1`) |
| `gag_cafe` | 4-1 | `{ t:'gag', id:'gag_cafe', x, y, javalins:[[x,y],…], porta:[x,y], alerta? }` — garrafa em `x,y`; `porta` do banheiro (desenhada pela gag, no chão dos javalins); `alerta` (2.5 tiles: mais perto que isso eles atacam) — deixe a garrafa alcançável sem passar por eles | interagir (ação/J) com a garrafa → suco de jaca → todos correm para o banheiro |
| `gag_relogio_ponto` | 4-2 | `{ t:'gag', id:'gag_relogio_ponto', x, y, javalins:[[x,y,'arma'?],…], saida:[x,y], duracao? }` — relógio em `x,y`; arma padrão `'chave'`; `duracao` (10 s) | interagir ou golpear o relógio → sirene; armas caem no chão (entidades `arma`), eles vão embora e voltam desarmados |
| `gag_lagarta` | 4-3 | `{ t:'gag', id:'gag_lagarta', x, y, ate, vel?, atras?, frente? }` — `x`: coluna-gatilho; `y`: chão da perseguição; `ate`: fim; `vel` (250 px/s); `atras` (9 tiles); `frente` (190 px) | sobreviver até a coluna `ate` (encostar = `die('esmagado')`) |
| `gag_barao_disfarce` | chefe-4 | opcional: `{ t:'gag', id:'gag_barao_disfarce', x, y }` (o líder comenta a "árvore de bigode") | o chefe emite `'barao-disfarce' {on:true, x?, y?}` ao se disfarçar e `{on:false}` (ou `'barao-revela'`) ao se revelar; `'boss-hit' {id:'barao-javardo'}` nesse intervalo (ou com `disfarce:true`) ativa a gag + toast de medalha secreta |

## Gags globais (sem spawn)

| id | onde | comportamento |
|---|---|---|
| `gag_parceiro_preso` | todas | em `'hero-lost'` o parceiro aparece numa camada de fundo (DOM entre o parallax e a fase), preso numa gaiola carregada por 2 Javalins, acenando e fazendo careta, até `'partner-back'` |
| `gag_morte_comica` | todas | `'death'` com `kind` `queimado`, `esmagado` ou `afogado` (animações em `hero.ts`) conta a gag |
| `gag_tedio` | todas | já em `duo.ts` (15 s parado) |

## Clima (18.1)

`regions: [{ x0, x1, chuva: true }]` liga a chuva do World; as gags decoram o `.rain` com camadas de gotas
animadas em CSS (usa o sprite `fx-chuva` quando renderizado), névoa e relâmpagos com `trovao`, e criam **poças**
nos trechos planos do chão da região (posições derivadas do tilemap). A Jaca (no chão ou arremessada) afunda nelas.
Eventos: `bus 'chuva' {on}` ao ligar/desligar e `{evento:'jaca-afundou', x, y}`.
