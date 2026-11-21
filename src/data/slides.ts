/* =====================================================================
   RETROSPECTIVA 2026 — TODO o conteúdo da apresentação fica aqui.
   Edite os textos, imagens, legendas e fundos sem mexer em componente.

   Imagens: use o NOME do arquivo que está em src/assets (sem extensão),
   ex.: 'gato-clt' acha src/assets/memes/gato-clt.jpg (ou .png/.webp/.avif).
   ===================================================================== */

/** Tintas de cor aplicadas por cima do fundo (veja .tint-* em global.css) */
export type Tint = 'violet' | 'magenta' | 'sunset' | 'coral' | 'night';

export interface Background {
  /** nome do arquivo em src/assets */
  image: string;
  /** ponto focal do recorte (CSS object-position) */
  focus?: string;
  /** zoom do recorte (1 = imagem inteira) */
  zoom?: number;
  /** espelhar horizontalmente */
  flip?: boolean;
  /** variação de cor (graus) */
  hue?: number;
  saturate?: number;
  brightness?: number;
  tint?: Tint;
}

/**
 * Animação de entrada do meme:
 * - 'drop'  : polaroid caindo e girando até assentar
 * - 'rise'  : recorte subindo de baixo (encostado no rodapé)
 * - 'run'   : recorte entrando correndo de lado
 */
export type MemeEntrance = 'drop' | 'rise' | 'run';

export interface Meme {
  image: string;
  alt: string;
  /** 'polaroid' = foto com moldura e legenda; 'cutout' = PNG recortado sem fundo */
  style: 'polaroid' | 'cutout';
  entrance: MemeEntrance;
  /** legenda escrita na polaroid */
  caption?: string;
  /** adesivo amarelo que entra como carimbo */
  sticker?: string;
  /** frase do meme escrita em cima do recorte (ex.: "peace was never an option") */
  quote?: string;
  /** posição do adesivo (CSS), ex.: "top:380px;right:520px" */
  stickerAt?: string;
  /** profundidade do parallax (1.6 a 2.2) */
  depth?: number;
  /** inclinação da polaroid em graus */
  tilt?: number;
  /** ponto focal do recorte da foto na polaroid (CSS object-position) */
  focus?: string;
  /**
   * Segunda imagem em polaroid menor, que entra 400ms depois da principal.
   * 'behind' = atrás da polaroid principal, inclinada pro outro lado;
   * 'corner' = por cima, no canto superior (usado com recorte).
   */
  extra?: {
    image: string; alt: string; caption?: string; tilt?: number; focus?: string; place: 'behind' | 'corner';
    /** foto em pé (retrato) */
    portrait?: boolean;
    /** posição própria (CSS), ex.: "left:1010px;top:500px" */
    at?: string;
  };
  /** polaroid principal em pé (retrato) — bom pra foto/vídeo de celular */
  portrait?: boolean;
  /** imagem recortada que entra como carimbo (ex.: emoji) */
  badge?: { image: string; alt: string; at: string };
}

interface BaseSlide {
  background: Background;
}

export interface TitleSlide extends BaseSlide {
  kind: 'title';
  big: string; // "26"
  name: string; // "HENRIQUE"
  subtitle: string; // "RETROSPECTIVA 2026"
}

export interface Stat {
  label: string;
  value: number; // porcentagem; acima de 100 a barra estoura
}

export interface CharacterSlide extends BaseSlide {
  kind: 'character';
  eyebrow: string;
  title: string;
  cardName: string;
  cardClass: string;
  stats: Stat[];
  overflowLabel: string;
  meme: Meme;
}

export interface ChapterSlide extends BaseSlide {
  kind: 'chapter';
  number: string; // "01"
  /** use \n pra quebrar o título em linhas */
  title: string;
  lead: string;
  text: string;
  meme: Meme;
  /** contador gigante opcional (ex.: TCC 0 → 99%) que trava com glitch */
  counter?: { to: number; suffix: string };
}

export interface Post {
  text: string;
  date: string;
  likes: number;
  comment: { author: string; text: string; avatar?: string };
  /** foto/meme anexado ao post (nome do arquivo em src/assets) */
  image?: string;
}

export interface FeedSlide extends BaseSlide {
  kind: 'feed';
  eyebrow: string;
  title: string;
  handle: string;
  posts: Post[];
}

export interface GallerySlide extends BaseSlide {
  kind: 'gallery';
  eyebrow: string;
  title: string;
  /** até 5 polaroids espalhadas; focus = ponto focal da foto */
  items: { image: string; alt: string; caption: string; tilt: number; focus?: string }[];
}

/** Números do ano (estilo retrospectiva de streaming): blocos coloridos com número gigante contando */
export interface StatsSlide extends BaseSlide {
  kind: 'stats';
  eyebrow: string;
  title: string;
  tiles: {
    /** rótulo de cima, ex.: "Copos de café" */
    label: string;
    value: number;
    /** texto depois do número, ex.: "%" */
    suffix?: string;
    /** casas decimais (ex.: 3 pra 0,002) */
    decimals?: number;
    /** linha de baixo com a piada/conta */
    note: string;
    color: 'orange' | 'turquoise' | 'magenta' | 'violet';
  }[];
}

/** Conquistas estilo videogame (notificação de troféu) */
export interface AchievementsSlide extends BaseSlide {
  kind: 'achievements';
  eyebrow: string;
  title: string;
  items: {
    icon: string;
    name: string;
    description: string;
    /** ex.: "Raro · 12% dos jogadores" */
    rarity: string;
    points: number;
    /** bloqueada: mostra cadeado e barra de progresso parada */
    locked?: { progress: number };
    /** 'diamond' = ícone especial de diamante */
    tier?: 'diamond';
  }[];
}

export interface GoalsSlide extends BaseSlide {
  kind: 'goals';
  eyebrow: string;
  title: string;
  goals: { emoji: string; label: string }[];
}

export interface FinalSlide extends BaseSlide {
  kind: 'final';
  title: string;
  stopAt: number; // a barra para aqui (97)
  tip: string;
  /** meme dançando no canto (pode ser WebP animado em src/assets/anim) */
  dancer?: { image: string; alt: string };
}

export type Slide = TitleSlide | CharacterSlide | ChapterSlide | FeedSlide | StatsSlide | GallerySlide | AchievementsSlide | GoalsSlide | FinalSlide;

/* ------------------------------------------------------------------ */

export const owner = 'Henrique';

export const slides: Slide[] = [
  /* 1 */ {
    kind: 'title',
    big: '26',
    name: 'HENRIQUE',
    subtitle: 'RETROSPECTIVA 2026',
    background: { image: 'palmeiras-gta6', focus: '50% 50%', zoom: 1.1, tint: 'violet' },
  },

  /* 2 */ {
    kind: 'character',
    eyebrow: 'Seleção de personagem',
    title: 'STATUS DO PLAYER',
    cardName: 'Henrique',
    cardClass: 'Classe: Dev CLT · Nível 26',
    stats: [
      { label: 'Programação', value: 90 },
      { label: 'Horas de sono', value: 15 },
      { label: 'Cansaço', value: 200 },
    ],
    overflowLabel: 'ESTOUROU ⚠',
    meme: {
      image: 'gato-clt',
      focus: '50% 28%',
      alt: 'Gato CLT cansado',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'nível CLT desbloqueado',
      depth: 1.8,
      tilt: 4,
    },
    background: { image: 'rodovia-gta6', focus: '20% 60%', zoom: 1.4, tint: 'magenta' },
  },

  /* 3 */ {
    kind: 'chapter',
    number: '01',
    title: 'EFETIVADO',
    lead: 'Novembro de 2025: estagiário. Março de 2026: carteira assinada.',
    text: 'Missão cumprida. Desbloqueei crachá, VR e o direito oficial de reclamar de segunda-feira.',
    meme: {
      image: 'dicaprio-recortado',
      alt: 'DiCaprio brindando',
      style: 'cutout',
      entrance: 'rise',
      sticker: 'eu vendo o crachá novo',
      stickerAt: 'top:70px;right:300px',
      depth: 2.0,
      extra: {
        image: 'arco-iris-escritorio',
        alt: 'Arco-íris visto da janela do escritório',
        caption: 'a vista do escritório',
        tilt: -6,
        focus: '50% 60%',
        place: 'corner',
        portrait: true,
        at: 'left:1000px;top:470px;right:auto',
      },
    },
    background: { image: 'palmeiras-gta6', focus: '80% 30%', zoom: 1.5, flip: true, tint: 'sunset' },
  },

  /* 4 */ {
    kind: 'chapter',
    number: '02',
    title: 'VOLTEI DE\nBIRIGUI',
    lead: 'Depois de anos no bate-volta, voltei de vez pra casa.',
    text: 'O plano era um ano de paz e tranquilidade. O ano tinha outros planos.',
    meme: {
      image: 'ganso-recortado',
      alt: 'Ganso: peace was never an option',
      style: 'cutout',
      quote: 'peace was\nnever an option',
      entrance: 'run',
      sticker: 'spoiler: não foi',
      stickerAt: 'top:250px;right:220px',
      depth: 2.2,
    },
    background: { image: 'rodovia-gta6', focus: '85% 70%', zoom: 1.6, tint: 'coral' },
  },

  /* 5 */ {
    kind: 'chapter',
    number: '03',
    title: 'TRABALHANDO\nREMOTO',
    lead: 'Escritório: meu quarto. Trânsito: 4 passos da cama.',
    text: 'Dress code: camisa em cima, bermuda embaixo. A câmera nunca vai saber.',
    meme: {
      image: 'cachorro-pc',
      alt: 'Cachorro no PC com headset',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'eu na daily às 9h',
      depth: 1.7,
      tilt: -4,
      extra: {
        image: 'amongus-duto',
        alt: 'Among Us amarelo entrando no duto',
        caption: 'eu saindo da daily de fininho',
        tilt: 5,
        place: 'behind',
      },
    },
    background: { image: 'palmeiras-gta6', focus: '20% 70%', zoom: 1.3, tint: 'night' },
  },

  /* 6 */ {
    kind: 'chapter',
    number: '04',
    title: 'O TCC',
    lead: 'Um sistema especialista. Pra família, é "aquele negócio de computador".',
    text: '99% pronto há meses. O GTA VI saiu antes dele.',
    counter: { to: 99, suffix: '%' },
    meme: {
      image: 'this-is-fine',
      focus: '100% 50%',
      alt: 'This is fine',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'eu vendo o prazo chegar',
      depth: 1.9,
      tilt: -4,
      extra: {
        image: 'gta6-tv',
        alt: 'PS na TV de tubo: pronto para jogar o GTA 6',
        caption: 'prioridades',
        tilt: 6,
        place: 'behind',
      },
    },
    background: { image: 'rodovia-gta6', focus: '50% 40%', zoom: 1.2, hue: -20, tint: 'violet' },
  },

  /* 7 */ {
    kind: 'chapter',
    number: '05',
    title: 'O VIOLÃOZINHO',
    lead: 'Realizei um sonho antigo: comprei meu violão.',
    text: 'Agora o quarto tem show ao vivo. Ingresso gratuito, vizinho na primeira fila.',
    meme: {
      image: 'gatinho-violao',
      focus: '72% 50%',
      alt: 'Gatinho tocando violão',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'como eu me imagino tocando',
      depth: 1.6,
      tilt: -3,
      extra: {
        image: 'henrique-violao',
        alt: 'Henrique tocando violão de verdade',
        caption: 'como eu realmente toco',
        tilt: 6,
        focus: '50% 60%',
        place: 'behind',
      },
    },
    background: { image: 'palmeiras-gta6', focus: '50% 20%', zoom: 1.8, tint: 'magenta', hue: 10 },
  },

  /* 8 */ {
    kind: 'chapter',
    number: '06',
    title: 'ACADEMIA',
    lead: 'Comecei a treinar de verdade.',
    text: 'O espelho ainda não percebeu, mas o shape tá em carregamento.',
    meme: {
      image: 'henrique-academia-punho',
      alt: 'Henrique mostrando o punho no espelho da academia',
      style: 'cutout',
      entrance: 'rise',
      sticker: 'o shape tá vindo (confia)',
      stickerAt: 'bottom:110px;right:90px;top:auto',
      depth: 2.0,
      extra: {
        image: 'cachorro-academia',
        alt: 'Cachorro no puxador da academia',
        caption: 'eu depois de 1 semana',
        tilt: -5,
        place: 'corner',
      },
    },
    background: { image: 'rodovia-gta6', focus: '30% 80%', zoom: 1.5, flip: true, tint: 'sunset' },
  },

  /* 9 */ {
    kind: 'chapter',
    number: '07',
    title: 'MONTEI\nMEU PC',
    lead: 'Peça por peça, parafuso por parafuso. Montei meu próprio PC.',
    text: 'Liga de primeira e ainda tem RGB. Todo mundo sabe que RGB dá +30 de FPS.',
    meme: {
      image: 'pc-rgb',
      alt: 'PC montado com luzes RGB mudando de cor',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'meu filho',
      portrait: true,
      focus: '50% 55%',
      sticker: 'RGB = +30 FPS',
      stickerAt: 'top:120px;right:90px',
      depth: 1.8,
      tilt: 3,
    },
    background: { image: 'palmeiras-gta6', focus: '30% 30%', zoom: 1.45, tint: 'night', hue: 20 },
  },

  /* 10 */ {
    kind: 'chapter',
    number: '08',
    title: 'A COLAÇÃO\nDA NATÁLIA',
    lead: 'Fui prestigiar a conquista da pessoa mais importante da minha vida.',
    text: 'Agora é doutora Natália. E eu, o mais orgulhoso da plateia.',
    meme: {
      image: 'colacao-natalia',
      alt: 'Colação de grau da Natália no palco',
      style: 'polaroid',
      entrance: 'drop',
      caption: 'o dia dela 🎓',
      portrait: true,
      focus: '50% 42%',
      badge: { image: 'emoji-rosa', alt: 'Emoji com uma rosa na boca', at: 'right:60px;top:650px' },
      depth: 1.8,
      tilt: -3,
    },
    background: { image: 'rodovia-gta6', focus: '60% 20%', zoom: 1.3, tint: 'magenta' },
  },

  /* 11 */ {
    kind: 'feed',
    eyebrow: 'Melhores momentos',
    title: 'FEED DO ANO',
    handle: '@henrique',
    posts: [
      { text: 'carteira assinada. oficialmente CLT 🙏📈', date: 'mar 2026', likes: 312, comment: { author: 'mãe', text: 'orgulho' }, image: 'paulin-bacana' },
      { text: 'voltei de Birigui. cadê a paz que me prometeram?', date: 'mai 2026', likes: 145, comment: { author: 'colega', text: 'nunca existiu' }, image: 'rato-ventilador' },
      { text: 'comprei meu violão 🎸 aceito pedidos', date: 'jul 2026', likes: 98, comment: { author: 'vizinho', text: 'toca Evidências', avatar: 'gato-serio' }, image: 'violao-loja' },
      { text: 'dia 1 de academia. amanhã eu já tô grande', date: 'set 2026', likes: 203, comment: { author: 'personal', text: 'kkkkkkk' }, image: 'biggie-cheese' },
    ],
    background: { image: 'palmeiras-gta6', focus: '40% 60%', zoom: 1.2, tint: 'night', hue: -10 },
  },

  /* 12 */ {
    kind: 'stats',
    eyebrow: 'Retrospectiva em números',
    title: 'SEU 2026 EM NÚMEROS',
    // contas até 18/11/2026: café = 4 copos × 322 dias; daily = 4 h × 11 semanas (desde setembro)
    tiles: [
      { label: 'Copos de café', value: 1288, note: '4 por dia, todo santo dia. Uns 258 litros.', color: 'orange' },
      { label: 'Minutos de daily', value: 2640, note: '44 horas desde setembro. Dava pra zerar o GTA V e ainda sobrava.', color: 'turquoise' },
      { label: 'Bugs criados', value: 1000000, note: 'Top 1 mundial em criação de bug. Ninguém chega perto.', color: 'magenta' },
      { label: 'Bugs resolvidos', value: 100000, note: 'Taxa de resolução: 10%. Eficiência.', color: 'violet' },
    ],
    background: { image: 'rodovia-gta6', focus: '50% 60%', zoom: 1.25, tint: 'night' },
  },

  /* 13 */ {
    kind: 'stats',
    eyebrow: 'Retrospectiva em números · parte 2',
    title: 'NÚMEROS QUE NINGUÉM PEDIU',
    tiles: [
      { label: '"Na minha máquina funciona"', value: 847, note: 'Vezes que eu disse. Na minha máquina funcionou todas.', color: 'magenta' },
      { label: 'Abas abertas no navegador', value: 100, note: 'Todas são "vou ler depois". Nenhuma foi lida.', color: 'turquoise' },
      { label: 'Deploys na sexta-feira', value: 3, note: 'Sobreviventes: 2. Que o terceiro descanse em paz.', color: 'orange' },
    ],
    background: { image: 'palmeiras-gta6', focus: '80% 55%', zoom: 1.3, tint: 'magenta', hue: -20 },
  },

  /* 14 */ {
    kind: 'gallery',
    eyebrow: 'Arquivo confidencial',
    title: 'MEMES DO ANO',
    items: [
      { image: 'quero-salario', alt: 'Boneco azul gritando: eu quero meu salário', caption: 'eu todo dia 5', tilt: -5 },
      { image: 'link-saldo', alt: 'Link: de que adianta ser rolê sábado à noite se saldo R$ 0,08', caption: 'sábado à noite, versão CLT', tilt: 3, focus: '50% 70%' },
      { image: 'hello-kitty', alt: 'Hello Kitty de jaqueta', caption: 'eu chegando em 2027', tilt: -2 },
      { image: 'e-vai-tomando', alt: 'Gambá: e vai tomando', caption: 'o ano comigo', tilt: 4, focus: '50% 100%' },
      { image: 'kurt-violao', alt: 'Kurt Cobain tocando violão', caption: 'a inspiração do violãozinho', tilt: -4, focus: '60% 50%' },
    ],
    background: { image: 'rodovia-gta6', focus: '70% 30%', zoom: 1.35, tint: 'sunset', hue: 10 },
  },

  /* 15 */ {
    kind: 'achievements',
    eyebrow: 'Troféus da temporada',
    title: 'CONQUISTAS 2026',
    items: [
      { icon: '💰', name: 'Primeiro salário CLT', description: 'Caiu na conta. Saiu da conta. No mesmo dia.', rarity: 'Comum · 87%', points: 100 },
      { icon: '🖥️', name: 'Ligou de primeira', description: 'Montou o PC e ligou sem sair fumaça.', rarity: 'Raro · 9%', points: 150 },
      { icon: '🎸', name: 'Primeira música', description: 'Tocou uma música inteira no violão.', rarity: 'Raro · 14%', points: 100 },
      { icon: '🏠', name: 'De volta pra casa', description: 'Saiu de Birigui. Birigui não saiu dele.', rarity: 'Comum · 52%', points: 50 },
      { icon: '☕', name: 'Barista', description: 'Mais de 1.000 copos de café no ano.', rarity: 'Épico · 3%', points: 200 },
      { icon: '🐀', name: 'Rato de academia', description: 'Foi 30 dias. Não seguidos, mas foi.', rarity: 'Raro · 11%', points: 150 },
      { icon: '🔥', name: 'Sexta-feira perigosa', description: '3 deploys na sexta. 2 sobreviveram.', rarity: 'Épico · 2%', points: 250 },
      { icon: '💐', name: 'Plateia VIP', description: 'Prestigiou a colação da Natália.', rarity: 'Lendário · 1%', points: 300 },
      { icon: '💎', name: 'Caçador de bugs: Diamante', description: '1 milhão achados. 100 mil resolvidos.', rarity: 'Lendário · 0,5%', points: 500, tier: 'diamond' },
      { icon: '🔒', name: 'Terminar o TCC', description: 'Conquista secreta.', rarity: 'Lendário · 0,1%', points: 1000, locked: { progress: 99 } },
    ],
    background: { image: 'palmeiras-gta6', focus: '20% 40%', zoom: 1.45, tint: 'violet', hue: -10 },
  },

  /* 16 */ {
    kind: 'goals',
    eyebrow: 'Próxima temporada',
    title: 'METAS 2027',
    goals: [
      { emoji: '✈️', label: 'Viajar' },
      { emoji: '💪', label: 'Botar o shape' },
      { emoji: '🌴', label: 'Conseguir viver' },
    ],
    background: { image: 'rodovia-gta6', focus: '60% 50%', zoom: 1.15, tint: 'coral' },
  },

  /* 17 */ {
    kind: 'final',
    title: 'CARREGANDO 2027...',
    stopAt: 97,
    tip: 'Dica: se travar, tente desligar e ligar o ano de novo.',
    dancer: { image: 'rato-dancando', alt: 'Rato dançando' },
    background: { image: 'palmeiras-gta6', focus: '40% 45%', zoom: 1.3, tint: 'violet', brightness: 0.8 },
  },
];
