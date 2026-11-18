# Contrato de modelos 3D (pipeline de pré-renderização)

Leia `GAME_SPEC_PLATAFORMA.md` (raiz) para o contexto do jogo. Este documento define **como** os modelos são feitos e **quais ids/animações** o código do jogo espera.

## Pipeline

- Modelos em `tools/models/<categoria>/<id>.ts`, exportando um `ModelDef` (`tools/render/types.ts`) e registrados no `index.ts` da categoria.
- Ferramentas de escultura: `tools/render/sculpt.ts` (`blob`, `limb`, `lathe`, `tube`, `slab`, `roundBox`, `ring`, `spike`, `eye`, deformadores `taper/bulge/pull/bend/wobble/flattenBelow`, classe `Rig` com `bone/add/anchor`).
- Materiais: `mat(kind, cor, opts)` de `tools/render/materials.ts` (texturas SVG autorais + rim light). Tipos: fur, shortFur, skin, wood, bark, stone, rock, leaf, grass, metal, rust, cloth, leather, shell, scale, water, crystal, gourd, plastic, glow, rubber, earth, sand, coral, paint, glass.
- Animações: `tools/render/anim.ts` — keyframes por osso (`r` graus somados à pose de repouso, `p` translação, `s` escala; `t` de 0 a 1). Ossos opcionais com prefixo `?`.
- **Referência de qualidade obrigatória:** `tools/models/heroes/tama.ts` + `tools/anims/biped.ts`. Siga o mesmo nível de detalhe (formas orgânicas esculpidas, olhos com íris/brilho/pálpebra, acessórios, ≥ 20 malhas para inimigos, ≥ 30 para heróis/chefes).
- Render de teste: `npx tsx tools/render-sprites.ts <id> --preset=selva --anim=idle` → `public/assets/sprites/<id>/…webp`. Converta para PNG e **olhe a imagem** (`ffmpeg -v error -y -i arquivo.webp -update 1 /caminho/saida.png`) antes de seguir. Se parecer bloco de primitivas, refine.
- **Proibido** `Math.random` (use valores fixos escritos à mão). Proibido as palavras TODO/FIXME/placeholder/lorem.

## Convenções de espaço

- 1 unidade ≈ 1 metro. Personagem olha para **+X**, +Y para cima, +Z para a câmera. Origem = ponto de apoio (pés / base).
- Lado **R** do personagem = +Z (perto da câmera). A mão direita (perto) segura armas: crie `rig.anchor('hand', 'handR', [...])`.
- **Escala global: 104 px de tela por unidade.** Portanto `height = cell[1] / 104`. Tamá mede ~1.6 u (≈165 px). Javalim ~1.3 u, Javalão ~2.1 u, chefes 3–5 u (células grandes).
- `cell` = tamanho da célula em px de tela; deixe folga para animações (pulos, golpes). `pivot` = posição dos pés dentro da célula.
- Câmera padrão: ortográfica com guinada 12° e inclinação −8°. Itens de chão podem usar `camera: { pitch: -18 }`.
- `presets`: inclua os mundos onde o modelo aparece (`selva` mundo 1, `caverna` mundo 2, `recife` mundo 3, `fabrica` mundo 4, `bonus` salas bônus) **e sempre `neutro`** (UI/álbum). Heróis também `por-do-sol`.

## Contrato de animações por categoria (nomes exatos usados pelo código)

### Heróis (`hero`) — já existe a biblioteca `tools/anims/biped.ts` (use-a, ajustando o estilo)
idle, tedio, tedio-jokenpo, tedio-folha, tedio-arroto, andar, correr, pulo, apice, queda, aterrissar, rolar, especial, pegar, pegar-pesado, carregar, carregar-parado, arremessar, arremessar-cima, golpe1, golpe2, golpe3, escalar, pendurar, nadar, dano, morte, morte-queimado, morte-esmagado, morte-afogado, vitoria, troca, montar, montado, agachar, olhar-cima, batida, planar, surfar, preso.
Âncoras: `hand` (mão direita), `handL`, `head` (topo da cabeça).

### Montarias (`mount`)
Todas: idle, andar, ataque, pulo, dano, desmontar. Âncora **`sela`** (onde o herói senta; o jogo desenha o herói na animação `montado` nesse ponto, quadro a quadro).
- `pirarucu`: + nadar, investida
- `ema`: + correr, chute
- `tatu`: + rolar, cavar

### Inimigos (`enemy`)
Todos: idle, andar, ataque, dano, morte, tonto (atordoado, loop).
Extras por id:
- `javalim`: susto (pula de susto e cai sentado), selfie (loop, de costas tirando foto), cair (caindo do penhasco gritando), domino (sentado jogando, loop), dancar (loop), correr-banheiro (corre segurando a barriga, loop), ir-embora (anda de costas com marmita, loop), pegar-arma, ataque-arma, remar (loop, na canoa), desarmado. Âncora `hand`.
- `javalim-escudo`: + escudo (bloqueando), virar
- `javalao`: + pisao
- `cascavel`: + enrolar, saltar
- `lagarto`: + correr
- `morcego`: + mergulho, pendurado
- `piranha`, `agua-viva`: idle=nadar
- `baiacu`: + inflar, inflado, desinflar
- `caranguejo`: + conga (loop), prender
- `lagarta-trator`: (enorme, célula larga) idle=avançar, + parar
- `serrote`, `marimbondo`: idle = voar
- `bau-boca`: (baú-inimigo do naufrágio) + perseguir, morder, comer-peixe

### Chefes (`boss`)
idle, entrada, ataque1, ataque2, ataque3, vulneravel, dano, furia, derrota.
Ids: `major-motosserra`, `rainha-morcega`, `polvo-draga`, `barao-javardo` (este também `disfarce` = vestido de árvore, `revelar`, e `estagio2`, `estagio3` como variações de idle).

### NPCs (`npc`)
idle, falar. Extras:
- `preguica`: dormir (loop), acordar, bocejar, abracar (loop)
- `vo-bugio`: martelar (loop), apontar
- `tucano`: voar, comentar
- `quati`: vender
- `bem-te-vi`: voar, entregar
- `morcego-dj`: tocar (loop)
- `relogio-ponto`: idle, tocar (prop animado, pode ser `prop`)

### Props / objetos (`prop`)
- `cabaca`, `cabaca-pedra`: idle (parado), rolar (loop), quebrar
- `bromelia`: idle, mola
- `flor-catapulta`: idle, engolir, mirar (loop), disparar
- `ninho`: idle, quebrar
- `totem-cipo`: apagado, acender, aceso (loop)
- `totem-saida`: idle, girar
- `caixa-montaria`: idle, quebrar (variantes `pirarucu`, `ema`, `tatu` via `variants` mostrando o rosto entalhado)
- `tronco`: idle, afundar
- `carrinho`: idle, andar
- `parede-rachada`: idle, quebrar (variants por mundo: mata, gruta, recife, fabrica)
- `terra-mole`: idle, cavar
- `bloco-madeira`: idle, comido
- `fogueira`: apagada, acesa (loop)
- `teia`: idle, queimar
- `painel-maquina`: ligado (loop), desligado
- `garrafa-cafe`: idle, trocar
- `celular`: idle (no chão, com brilho)
- `canoa`: idle, remar
- `gaiola`: idle (parceiro preso; o jogo desenha o parceiro dentro)
- `semente-mae`: idle (brilho, loop)
- `placa-trilho`: esquerda, direita
- `serra-gigante`: girar (loop)

### Armas de mão (`weapon`) — ids `arma-<id>`
galho, coco, jaca, remo, vassoura, panela, lamparina, chave, peixe, estilingue, cupinzeiro, guarda-chuva, buzina, capacete — e os carregáveis `cabaca`, `cabaca-pedra` e `bromelia` usam os modelos de props.
Animações: `mundo` (1 quadro, deitada no chão), `mao` (1 quadro; **pivot = ponto de empunhadura**; desenhada olhando para +X, cabo na origem), `voando` (8 quadros girando, loop), `quebrar` (8 quadros, pedaços se separando). `panela` também `capacete` (na cabeça). `guarda-chuva` também `aberto`. Use `camera: { yaw: 0, pitch: 0 }` em `mao` se ajudar a leitura.

### Coletáveis (`pickup`)
`castanha` (girar, 8 quadros), `cacho` (girar), `letra-c`, `letra-i`, `letra-p`, `letra-o` (girar; letras entalhadas em madeira dourada — a letra Ó tem acento), `moeda-folha` (girar, 12 quadros), `ficha` (variants pirarucu/ema/tatu), `parafuso` (girar), `balao-tucano` (flutuar; variants 1, 2, 3), `pena` (genérico de vida extra no HUD).

### Efeitos (`fx`) — animações não-loop salvo indicação
`fx-poeira` (corrida 6, pulo 6, aterrissar 6), `fx-faisca` (impacto 6), `fx-estrelas` (tonto 8 loop), `fx-fumaca` (derrota 10, com pedaços de lata), `fx-lascas` (cabaca 8, madeira 8, pedra 8), `fx-agua` (respingo 8, bolha-p 4, bolha-m 4, bolha-g 4), `fx-brilho` (castanha 6, letra 10, totem 8), `fx-folhas` (6 tipos: folha1…folha6, 8 quadros loop cada), `fx-vagalume` (loop 4), `fx-gota` (5), `fx-raio-luz` (mata, mar, gruta — 3 variações loop), `fx-rastro` (6), `fx-explosao` (grande 16, pequena 8), `fx-cupins` (nuvem loop 8), `fx-ondas-som` (buzina 8), `fx-poca` (jaca grudenta loop 6), `fx-chuva` (gota caindo 4), `fx-eco` (onda de luz 10), `fx-notas` (notas musicais loop 8), `fx-bolhas-sos` (8, bolhas formando S.O.S.), `fx-coracao` (abraço 8).
