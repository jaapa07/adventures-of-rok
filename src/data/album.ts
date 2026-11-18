/** Álbum da Selva (seção 19.3): fotos engraçadas, cartas do bestiário e figurinos da dupla. */

export interface Pose { m: string; a: string; f?: number; x: number; y: number; flip?: boolean; s?: number; v?: string }
export interface FotoDef { level: string; titulo: string; legenda: string; dica: string; fundo: string; poses: Pose[] }

/** Uma foto por fase. A pose é montada com os sprites pré-renderizados sobre o fundo da fase. */
export const FOTOS: FotoDef[] = [
  { level: '1-1', titulo: 'Abraço de preguiça', legenda: 'A Tamá jura que não estava com medo. A Lili tirou a foto rindo.', dica: 'Acorde a preguiça e passe por ela de novo.', fundo: 'mata',
    poses: [{ m: 'tama', a: 'preso', f: 6, x: 150, y: 196 }, { m: 'lili', a: 'vitoria', f: 18, x: 250, y: 196, flip: true }] },
  { level: '1-2', titulo: 'Selfie interrompida', legenda: 'O último registro do celular do Javalim antes do tombo.', dica: 'Um empurrão na beira do penhasco.', fundo: 'mata',
    poses: [{ m: 'lili', a: 'vitoria', f: 10, x: 130, y: 200 }, { m: 'tama', a: 'olhar-cima', f: 4, x: 230, y: 200 }, { m: 'javalim', a: 'cair', f: 6, x: 330, y: 150, s: 0.8 }] },
  { level: '1-3', titulo: 'Escultura de tora', legenda: 'A serra da serraria esculpiu uma Tamá de madeira. Ficou parecida até no nariz.', dica: 'Pule da tora no último segundo.', fundo: 'serraria',
    poses: [{ m: 'tama', a: 'idle', f: 0, x: 140, y: 200 }, { m: 'tama', a: 'vitoria', f: 20, x: 260, y: 200, flip: true, v: 'base' }] },
  { level: '1-4', titulo: 'Remo roubado', legenda: 'Os Javalins remaram em círculos por dez minutos depois disso.', dica: 'Roube o remo da canoa adversária.', fundo: 'rio',
    poses: [{ m: 'lili', a: 'arremessar-cima', f: 3, x: 160, y: 200 }, { m: 'javalim', a: 'remar', f: 2, x: 300, y: 210, flip: true }] },
  { level: '2-1', titulo: 'Eco na escuridão', legenda: 'A Tamá gritou tão alto que a gruta respondeu em três tons.', dica: 'Grite no salão escuro.', fundo: 'gruta',
    poses: [{ m: 'tama', a: 'batida', f: 8, x: 200, y: 200 }] },
  { level: '2-2', titulo: 'Dominó interrompido', legenda: 'Ninguém sabe quem estava ganhando.', dica: 'Siga a placa errada nos trilhos.', fundo: 'mina',
    poses: [{ m: 'javalim', a: 'domino', f: 4, x: 140, y: 205 }, { m: 'javalim', a: 'susto', f: 6, x: 250, y: 205, flip: true }, { m: 'lili', a: 'apice', f: 1, x: 330, y: 150 }] },
  { level: '2-3', titulo: 'Baile dos morcegos', legenda: 'O DJ pediu bis. Os Javalins dançaram até amanhecer.', dica: 'Ataque no compasso da música.', fundo: 'gruta',
    poses: [{ m: 'javalim', a: 'dancar', f: 3, x: 150, y: 205 }, { m: 'javalim', a: 'dancar', f: 9, x: 250, y: 205, flip: true }, { m: 'lili', a: 'vitoria', f: 26, x: 340, y: 205 }] },
  { level: '3-1', titulo: 'Fila de conga', legenda: 'Dez caranguejos, dez pisões, uma chuva de castanhas.', dica: 'Pule na fila inteira de caranguejos.', fundo: 'praia',
    poses: [{ m: 'tama', a: 'pulo', f: 3, x: 200, y: 160 }, { m: 'lili', a: 'vitoria', f: 12, x: 320, y: 205, flip: true }] },
  { level: '3-2', titulo: 'Carona de pirarucu', legenda: 'O Pirarucu fez pose. A Lili, nem tanto.', dica: 'Atravesse o recife montada no Pirarucu sem descer.', fundo: 'recife',
    poses: [{ m: 'pirarucu', a: 'nadar', f: 4, x: 220, y: 200 }, { m: 'lili', a: 'nadar', f: 6, x: 140, y: 140 }] },
  { level: '3-3', titulo: 'Baú guloso', legenda: 'O Baú-Boca preferiu o peixe seco. Sorte da Tamá.', dica: 'Distraia o Baú-Boca com o Peixe Seco.', fundo: 'naufragio',
    poses: [{ m: 'tama', a: 'arremessar', f: 4, x: 140, y: 205 }, { m: 'bau-boca', a: 'comer-peixe', f: 4, x: 300, y: 205, flip: true }] },
  { level: '3-4', titulo: 'Pista de dança', legenda: 'As Águas-Vivas-Néon acenderam no ritmo e a dupla atravessou sambando.', dica: 'Atravesse o corredor néon sem levar choque.', fundo: 'recife',
    poses: [{ m: 'agua-viva', a: 'idle', f: 2, x: 120, y: 120 }, { m: 'lili', a: 'nadar', f: 2, x: 230, y: 170 }, { m: 'agua-viva', a: 'idle', f: 6, x: 330, y: 110 }] },
  { level: '4-1', titulo: 'Fila do banheiro', legenda: 'Suco de jaca no lugar do café. A fila dobrou o corredor.', dica: 'Troque a garrafa térmica da sala de descanso.', fundo: 'fabrica',
    poses: [{ m: 'javalim', a: 'correr-banheiro', f: 2, x: 140, y: 205 }, { m: 'javalim', a: 'correr-banheiro', f: 7, x: 230, y: 205 }, { m: 'tama', a: 'vitoria', f: 30, x: 330, y: 205, flip: true }] },
  { level: '4-2', titulo: 'Fim de expediente', legenda: 'Marmita na mão, crachá no bolso e nenhuma vontade de lutar.', dica: 'Faça a sirene do relógio de ponto tocar.', fundo: 'fabrica',
    poses: [{ m: 'javalim', a: 'ir-embora', f: 3, x: 180, y: 205 }, { m: 'lili', a: 'carregar-parado', f: 4, x: 320, y: 205, flip: true }] },
  { level: '4-3', titulo: 'Fuga da Lagarta', legenda: 'Ninguém olhou para trás. Exceto a câmera.', dica: 'Chegue ao fim da perseguição sem perder o parceiro.', fundo: 'fabrica',
    poses: [{ m: 'tama', a: 'correr', f: 3, x: 250, y: 205 }, { m: 'lili', a: 'correr', f: 8, x: 340, y: 205 }] },
];

export interface CartaDef { id: string; nome: string; mundo: string; piada: string; formas: string[] }
/** Cartas do bestiário: derrote o inimigo das 3 formas indicadas para liberar a carta. */
export const CARTAS: CartaDef[] = [
  { id: 'javalim', nome: 'Javalim', mundo: 'Todos', piada: 'Bate ponto às 7h, desmata às 7h05 e reclama do calor às 7h06.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'javalim-escudo', nome: 'Javalim Escudeiro', mundo: 'Mata Alta e Recife', piada: 'O escudo é uma tampa de panela. A mãe dele ainda procura.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'javalao', nome: 'Javalão', mundo: 'Grutas e Recife', piada: 'Pesa o mesmo que três Javalins e uma geladeira.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'serrote', nome: 'Serrote', mundo: 'Mata Alta', piada: 'Drone-motosserra com bateria de 10 minutos e ego de 10 horas.', formas: ['arma', 'arremesso', 'rolar'] },
  { id: 'marimbondo', nome: 'Marimbondo-de-Lata', mundo: 'Mata Alta e Grutas', piada: 'Zumbe em lá bemol. Ninguém nunca pediu.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'cascavel', nome: 'Cascavel Mola', mundo: 'Mata Alta e Grutas', piada: 'Treinou salto em distância com uma bromélia-mola. Nunca devolveu.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'lagarto', nome: 'Teiú Atropelador', mundo: 'Grutas Âmbar', piada: 'Não sabe frear. Também não sabe virar. Mas corre muito.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'morcego', nome: 'Morcego-Lanterna', mundo: 'Grutas Âmbar', piada: 'Apaga as luzes dos outros e acende a própria barriga. Vaidade.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'piranha', nome: 'Piranha-Boia', mundo: 'Recife Bromélia', piada: 'Dentes afiados, boia de patinho. Ninguém leva a sério.', formas: ['arma', 'arremesso', 'montaria'] },
  { id: 'caranguejo', nome: 'Caranguejo-Alicate', mundo: 'Recife Bromélia', piada: 'Anda de lado porque perdeu a aposta da conga.', formas: ['pisao', 'arma', 'arremesso'] },
  { id: 'agua-viva', nome: 'Água-Viva-Néon', mundo: 'Recife Bromélia', piada: 'Pisca em 120 batidas por minuto. É a alma da festa.', formas: ['montaria', 'arremesso', 'arma'] },
  { id: 'baiacu', nome: 'Baiacu-Bomba', mundo: 'Recife Bromélia', piada: 'Infla quando fica nervoso. Fica nervoso o tempo todo.', formas: ['arma', 'arremesso', 'montaria'] },
  { id: 'lagarta-trator', nome: 'Lagarta-Trator', mundo: 'Fábrica Javarda', piada: 'Come árvores no café, almoço e janta. Nunca foi ao dentista.', formas: ['arremesso', 'arma', 'outro'] },
  { id: 'bau-boca', nome: 'Baú-Boca', mundo: 'Naufrágio Escuro', piada: 'Guardava o tesouro do navio. Comeu o tesouro. E o navio.', formas: ['pisao', 'arma', 'arremesso'] },
];
export const FORMA_NOME: Record<string, string> = { pisao: 'Pisão', arma: 'Arma de mão', arremesso: 'Arremesso', rolar: 'Tromba-giro', montaria: 'Montaria', outro: 'Esperteza', explosao: 'Explosão' };

export interface FigurinoDef { id: string; heroi: 'tama' | 'lili'; variante: string; nome: string; desc: string; preco: number }
/** Preço em castanhas do banco do Vô Bugio. Os figurinos raros também saem nos Desafios e no Brinde. */
export const FIGURINOS: FigurinoDef[] = [
  { id: 'tama:base', heroi: 'tama', variante: 'base', nome: 'Tamá de sempre', desc: 'Bolsa de palha e coragem de sobra.', preco: 0 },
  { id: 'tama:pescador', heroi: 'tama', variante: 'pescador', nome: 'Tamá Pescadora', desc: 'Chapéu de abas largas e colete de mil bolsos.', preco: 90 },
  { id: 'tama:bombeira', heroi: 'tama', variante: 'bombeira', nome: 'Tamá Bombeira', desc: 'Capacete vermelho para apagar as fogueiras do Barão.', preco: 120 },
  { id: 'tama:capoeira', heroi: 'tama', variante: 'capoeira', nome: 'Tamá Capoeirista', desc: 'Abadá branco e corda verde: ginga de tamanduá.', preco: 150 },
  { id: 'lili:base', heroi: 'lili', variante: 'base', nome: 'Lili de sempre', desc: 'Pochete, juba dourada e pressa.', preco: 0 },
  { id: 'lili:exploradora', heroi: 'lili', variante: 'exploradora', nome: 'Lili Exploradora', desc: 'Chapéu de explorar e mochila de mapas.', preco: 90 },
  { id: 'lili:surfista', heroi: 'lili', variante: 'surfista', nome: 'Lili Surfista', desc: 'Prancha nas costas, pronta para a onda do Recife.', preco: 120 },
  { id: 'lili:festa-junina', heroi: 'lili', variante: 'festa-junina', nome: 'Lili Junina', desc: 'Chapéu de palha e vestido de chita para o arraiá.', preco: 150 },
];
