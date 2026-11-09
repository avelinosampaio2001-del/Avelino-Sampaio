import { NationalLanguage, DictionaryEntry, UserProfile, NationalSong, AdBanner, MonetizationSettings } from '../types';

export const INITIAL_LANGUAGES: NationalLanguage[] = [
  {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português (Angola)',
    regions: 'Todas as províncias (Língua oficial e veicular)',
    speakersEstimated: '~25 milhões',
    family: 'Indo-Europeia (Românica)',
    description: 'Língua oficial de Angola enriquecida por termos e calão autóctone angolano.',
    isActive: true,
  },
  {
    code: 'kimbundu',
    name: 'Kimbundu',
    nativeName: 'Kimbundu / Quimbundo',
    regions: 'Luanda, Bengo, Cuanza Norte, Malanje, Uíge',
    speakersEstimated: '~4 milhões',
    family: 'Níger-Congo (Bantu H.21)',
    description: 'Língua histórica do antigo Reino do Ndongo e de Luanda, com profunda influência no português angolano e na cultura nacional.',
    isActive: true,
  },
  {
    code: 'umbundu',
    name: 'Umbundu',
    nativeName: 'Umbundu / Ovimbundu',
    regions: 'Huambo, Bié, Benguela, Cuanza Sul',
    speakersEstimated: '~7 milhões',
    family: 'Níger-Congo (Bantu R.11)',
    description: 'A língua nacional mais falada em Angola em número de falantes nativos, berço da cultura do planalto central angolano.',
    isActive: true,
  },
  {
    code: 'kikongo',
    name: 'Kikongo',
    nativeName: 'Kikongo / Quicongo',
    regions: 'Uíge, Zaire, Cabinda',
    speakersEstimated: '~2.5 milhões',
    family: 'Níger-Congo (Bantu H.16)',
    description: 'Língua venerável do histórico Reino do Congo, rica em provérbios filosóficos e literatura oral ancestral.',
    isActive: true,
  },
  {
    code: 'cokwe',
    name: 'Cokwe',
    nativeName: 'Tchokwe / Cokwe',
    regions: 'Lunda Norte, Lunda Sul, Moxico',
    speakersEstimated: '~1.8 milhões',
    family: 'Níger-Congo (Bantu K.11)',
    description: 'Famosa pela arte e sabedoria tradicional, criadora do símbolo nacional "O Pensador" (Samanyonga) e dos desenhos na areia Sona.',
    isActive: true,
  },
  {
    code: 'kwanyama',
    name: 'Kwanyama',
    nativeName: 'Oshikwanyama / Cuanhama',
    regions: 'Cunene',
    speakersEstimated: '~700 mil',
    family: 'Níger-Congo (Bantu R.21)',
    description: 'Língua do heróico Rei Mandume Ya Ndemufayo, falada com orgulho no sul de Angola na fronteira com a Namíbia.',
    isActive: true,
  },
  {
    code: 'ngangela',
    name: 'Ngangela',
    nativeName: 'Nganguela / Nyemba',
    regions: 'Cuando Cubango, Moxico, Huíla',
    speakersEstimated: '~600 mil',
    family: 'Níger-Congo (Bantu K.10)',
    description: 'Agrupamento linguístico do leste e sudeste de Angola com ricas tradições musicais e de harmonia com a natureza.',
    isActive: true,
  },
  {
    code: 'fiote',
    name: 'Fiote',
    nativeName: 'Fiote / Ibinda',
    regions: 'Cabinda',
    speakersEstimated: '~450 mil',
    family: 'Níger-Congo (Bantu H.16d)',
    description: 'Variante setentrional do Kikongo com identidade singular própria do enclave florestal de Cabinda.',
    isActive: true,
  },
  {
    code: 'luvale',
    name: 'Luvale',
    nativeName: 'Luvale / Chiluvale',
    regions: 'Moxico',
    speakersEstimated: '~400 mil',
    family: 'Níger-Congo (Bantu K.14)',
    description: 'Língua falada ao longo do rio Zambeze no leste de Angola, célebre pela cerimónia cultural de Mukanda e danças dos ancestrais Likishi.',
    isActive: true,
  },
  {
    code: 'nyaneka',
    name: 'Nyaneka',
    nativeName: 'Nyaneka-Humbi / Olunyaneka',
    regions: 'Huíla, Namibe',
    speakersEstimated: '~550 mil',
    family: 'Níger-Congo (Bantu R.13)',
    description: 'Falada nas terras altas da Serra da Chela e Lubango, guardiã de tradições pastoris e valores comunitários.',
    isActive: true,
  },
  {
    code: 'muhumbi',
    name: 'Muhumbi',
    nativeName: 'Muhumbi / Humbi',
    regions: 'Huíla, Cunene',
    speakersEstimated: '~250 mil',
    family: 'Níger-Congo (Bantu R.14)',
    description: 'Língua das comunidades do vale do Cunene e Huíla, com notável artesanato tradicional e tradições orais.',
    isActive: true,
  },
];

export const INITIAL_DICTIONARY_ENTRIES: DictionaryEntry[] = [
  // KIMBUNDU ENTRIES
  {
    id: 'kimb-1',
    word: 'Sakidila',
    translation: 'Obrigado / Agradeço',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'Expressão de gratidão sincera e reconhecimento de um favor ou gentileza recebida.',
    examples: [
      { phrase: 'Sakidila kyavulu, ndenge yami.', translation: 'Muito obrigado, meu irmão/mais novo.' },
      { phrase: 'Etu twa sakidila Nzambi.', translation: 'Nós agradecemos a Deus.' }
    ],
    pronunciation: 'Sah-kee-dee-lah',
    culturalNotes: 'Em Kimbundu, a gratidão reforça os laços ancestrais de respeito (ukamba) entre os membros da comunidade.',
    contributorName: 'Dra. Kieza Malanje',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-12T10:00:00Z',
    status: 'Aprovada',
    votes: { correct: 48, incorrect: 0, hearts: 35 },
    searchCount: 320,
    reportsCount: 0,
  },
  {
    id: 'kimb-2',
    word: 'Muxima',
    translation: 'Coração / Sentimento / Alma',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'O centro dos sentimentos, consciência moral e apego afetivo na filosofia bantu.',
    examples: [
      { phrase: 'Muxima wami wezala ni kuzola.', translation: 'O meu coração está cheio de amor.' },
      { phrase: 'Monandengue uala ni muxima wambote.', translation: 'A criança tem um bom coração.' }
    ],
    pronunciation: 'Moo-shee-mah',
    culturalNotes: 'Dá também nome ao famoso Santuário da Muxima na província de Luanda / Bengo, símbolo de devoção nacional.',
    contributorName: 'Professor Ndombele',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-15T14:30:00Z',
    status: 'Aprovada',
    votes: { correct: 52, incorrect: 1, hearts: 41 },
    searchCount: 410,
    reportsCount: 0,
  },
  {
    id: 'kimb-3',
    word: 'Kandandu',
    translation: 'Abraço caloroso / Saudação fraterna',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'Gesto de carinho que une duas pessoas; abraço fraterno típico angolano.',
    examples: [
      { phrase: 'Ngakubhana kandandu kakola!', translation: 'Dou-te um abraço forte!' }
    ],
    pronunciation: 'Kahn-dahn-doo',
    culturalNotes: 'Palavra amplamente adotada no vocabulário angolano em português ao despedir-se de amigos próximos.',
    contributorName: 'Isabel Panzo',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-18T09:15:00Z',
    status: 'Aprovada',
    votes: { correct: 64, incorrect: 0, hearts: 58 },
    searchCount: 512,
    reportsCount: 0,
  },
  {
    id: 'kimb-4',
    word: 'Wiza kiambote',
    translation: 'Bem-vindo / Chega em boa hora',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'Saudação afetuosa de boas-vindas ao visitante ou hóspede.',
    examples: [
      { phrase: 'Wiza kiambote mu mbanza yetu.', translation: 'Sê bem-vindo à nossa terra.' }
    ],
    pronunciation: 'Wee-zah kee-ahm-boh-teh',
    culturalNotes: 'A hospitalidade é um dos pilares mais sagrados da cultura bantu em Angola.',
    contributorName: 'Manuel Quissua',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-20T11:00:00Z',
    status: 'Aprovada',
    votes: { correct: 31, incorrect: 0, hearts: 22 },
    searchCount: 180,
    reportsCount: 0,
  },
  {
    id: 'kimb-5',
    word: 'Makamba',
    translation: 'Amigos / Companheiros',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'Plural de dikamba (amigo); refere-se ao círculo de companheirismo leal.',
    examples: [
      { phrase: 'Makamba mami a wiza o lelu.', translation: 'Os meus amigos vieram hoje.' }
    ],
    pronunciation: 'Mah-kahm-bah',
    culturalNotes: 'Raiz da expressão informal "kamba" usada por todos os angolanos no dia a dia.',
    contributorName: 'Lando Gaspar',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-22T16:20:00Z',
    status: 'Aprovada',
    votes: { correct: 39, incorrect: 0, hearts: 29 },
    searchCount: 290,
    reportsCount: 0,
  },
  {
    id: 'kimb-6',
    word: 'Nzambi',
    translation: 'Deus / Divindade Suprema',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'O Criador do universo na espiritualidade tradicional e adotado no cristianismo.',
    examples: [
      { phrase: 'Nzambi uabana mwenyu.', translation: 'Deus concedeu a vida.' }
    ],
    pronunciation: 'N-zahm-bee',
    culturalNotes: 'Nome comum compartilhado em várias línguas bantu do centro-oeste africano.',
    contributorName: 'Pastor Nginga',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-25T12:00:00Z',
    status: 'Aprovada',
    votes: { correct: 44, incorrect: 0, hearts: 31 },
    searchCount: 245,
    reportsCount: 0,
  },

  // UMBUNDU ENTRIES
  {
    id: 'umb-1',
    word: 'Ndapandula',
    translation: 'Obrigado / Sou grato',
    language: 'umbundu',
    targetLanguage: 'pt',
    meaning: 'Expressão de reconhecimento e gratidão em Umbundu.',
    examples: [
      { phrase: 'Ndapandula calua, mukwetu.', translation: 'Muito obrigado, meu amigo.' },
      { phrase: 'Etwe twa pandula ocisola cove.', translation: 'Nós agradecemos o teu carinho.' }
    ],
    pronunciation: 'Ndah-pahn-doo-lah',
    culturalNotes: 'Diz-se frequentemente inclinando suavemente a cabeça com a mão no peito em sinal de respeito aos mais velhos.',
    contributorName: 'Dr. Chivukuvuku Silva',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-10T08:00:00Z',
    status: 'Aprovada',
    votes: { correct: 56, incorrect: 0, hearts: 42 },
    searchCount: 480,
    reportsCount: 0,
  },
  {
    id: 'umb-2',
    word: 'Kalunga',
    translation: 'Olá / Saudação de paz / Vida',
    language: 'umbundu',
    targetLanguage: 'pt',
    meaning: 'Saudação cerimoniosa usada em qualquer momento do dia que deseja saúde e vitalidade.',
    examples: [
      { phrase: 'Kalunga ciwa, sekulu.', translation: 'Olá com saúde e paz, venerável ancião.' }
    ],
    pronunciation: 'Kah-loon-gah',
    culturalNotes: 'Conceito profundo que abrange a vida, o mar imenso e a força cósmica primordial.',
    contributorName: 'Helena Chinguto',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-14T11:45:00Z',
    status: 'Aprovada',
    votes: { correct: 61, incorrect: 0, hearts: 49 },
    searchCount: 530,
    reportsCount: 0,
  },
  {
    id: 'umb-3',
    word: 'Ocisola',
    translation: 'Amor / Afeição verdadeira',
    language: 'umbundu',
    targetLanguage: 'pt',
    meaning: 'Amor profundo entre familiares, parceiros ou pela terra natal.',
    examples: [
      { phrase: 'Ocisola cange kokuove ka ci pu.', translation: 'O meu amor por ti nunca terá fim.' }
    ],
    pronunciation: 'Oh-chee-soh-lah',
    culturalNotes: 'Frequentemente cantado em canções tradicionais de nado e matrimónio no planalto central.',
    contributorName: 'Maria Kapitu',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-19T13:20:00Z',
    status: 'Aprovada',
    votes: { correct: 38, incorrect: 0, hearts: 33 },
    searchCount: 310,
    reportsCount: 0,
  },
  {
    id: 'umb-4',
    word: 'Ombembwa',
    translation: 'Paz / Concórdia / Serenidade',
    language: 'umbundu',
    targetLanguage: 'pt',
    meaning: 'Estado de harmonia social e espiritual entre os seres humanos e os antepassados.',
    examples: [
      { phrase: 'Ombembwa yi kale kokuene vosi.', translation: 'Que a paz esteja com todos vós.' }
    ],
    pronunciation: 'Ohm-behm-bwah',
    culturalNotes: 'Palavra chave usada na reconciliação nacional e no encerramento de julgamentos comunitários (onjango).',
    contributorName: 'Dr. Chivukuvuku Silva',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-21T09:00:00Z',
    status: 'Aprovada',
    votes: { correct: 47, incorrect: 0, hearts: 40 },
    searchCount: 340,
    reportsCount: 0,
  },
  {
    id: 'umb-5',
    word: 'Onjango',
    translation: 'Lugar de tertúlia / Tribunal comunitário tradicional',
    language: 'umbundu',
    targetLanguage: 'pt',
    meaning: 'Espaço circular coberto de palha onde a comunidade se reúne para deliberar, contar histórias e educar as novas gerações.',
    examples: [
      { phrase: 'Tukalingila vonjango ovingonji vietu.', translation: 'Vamos ao onjango partilhar os nossos pensamentos.' }
    ],
    pronunciation: 'Ohn-jahn-goh',
    culturalNotes: 'Símbolo maior da democracia participativa tradicional angolana.',
    contributorName: 'Professor Ndombele',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-26T15:00:00Z',
    status: 'Aprovada',
    votes: { correct: 53, incorrect: 0, hearts: 46 },
    searchCount: 420,
    reportsCount: 0,
  },

  // KIKONGO ENTRIES
  {
    id: 'kik-1',
    word: 'Mbote',
    translation: 'Olá / Bom dia / Saúde / Paz',
    language: 'kikongo',
    targetLanguage: 'pt',
    meaning: 'A mais universal saudação em Kikongo, desejando bondade e bem-estar integral.',
    examples: [
      { phrase: 'Mbote zaku, nsongi yami!', translation: 'Olá para ti, meu irmão/irmã!' },
      { phrase: 'Mbote na beno!', translation: 'Saudações a todos vós!' }
    ],
    pronunciation: 'Mboh-teh',
    culturalNotes: 'A palavra deriva da raiz "bôte", que significa beleza moral e retidão de caráter.',
    contributorName: 'Nkosi Kinzambi',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-08T10:00:00Z',
    status: 'Aprovada',
    votes: { correct: 68, incorrect: 0, hearts: 55 },
    searchCount: 560,
    reportsCount: 0,
  },
  {
    id: 'kik-2',
    word: 'Matondo',
    translation: 'Obrigado / Agradecimentos',
    language: 'kikongo',
    targetLanguage: 'pt',
    meaning: 'Reconhecimento caloroso de uma bênção ou ajuda prestada.',
    examples: [
      { phrase: 'Matondo mingi mu lusadisu lwaku.', translation: 'Muito obrigado pela tua preciosa ajuda.' }
    ],
    pronunciation: 'Mah-tohn-doh',
    culturalNotes: 'Expressão carregada de espiritualidade e apreço pelo bem comunitário.',
    contributorName: 'Simão Ndombasi',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-13T14:10:00Z',
    status: 'Aprovada',
    votes: { correct: 49, incorrect: 0, hearts: 39 },
    searchCount: 390,
    reportsCount: 0,
  },
  {
    id: 'kik-3',
    word: 'Kintwadi',
    translation: 'União / Solidariedade comunitária',
    language: 'kikongo',
    targetLanguage: 'pt',
    meaning: 'O princípio de viver em comunhão, entreajuda mútua e fraternidade coletiva.',
    examples: [
      { phrase: 'Mu kintwadi, tulenda tunga nsi yetu.', translation: 'Na união, podemos construir a nossa nação.' }
    ],
    pronunciation: 'Keen-twah-dee',
    culturalNotes: 'Conceito chave que orienta as cooperativas agrícolas tradicionais e reuniões de clã no norte de Angola.',
    contributorName: 'Nkosi Kinzambi',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-17T16:00:00Z',
    status: 'Aprovada',
    votes: { correct: 42, incorrect: 0, hearts: 36 },
    searchCount: 280,
    reportsCount: 0,
  },

  // COKWE ENTRIES
  {
    id: 'cok-1',
    word: 'Moyo',
    translation: 'Olá / Vida / Saudação de bênção',
    language: 'cokwe',
    targetLanguage: 'pt',
    meaning: 'Saudação que celebra a vida e a respiração; também significa o sopro vital.',
    examples: [
      { phrase: 'Moyo wenu, mandumbu!', translation: 'Saudações com vida, irmãos e irmãs!' }
    ],
    pronunciation: 'Moh-yoh',
    culturalNotes: 'Em Cokwe, saudar alguém é reconhecer que a energia da vida nos mantém conectados aos ancestrais.',
    contributorName: 'Mwata Muatchissengue',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-09T11:20:00Z',
    status: 'Aprovada',
    votes: { correct: 50, incorrect: 0, hearts: 44 },
    searchCount: 430,
    reportsCount: 0,
  },
  {
    id: 'cok-2',
    word: 'Zukwenu',
    translation: 'Obrigado / Bem haja',
    language: 'cokwe',
    targetLanguage: 'pt',
    meaning: 'Expressão de gratidão em Tchokwe para com um anfitrião ou companheiro.',
    examples: [
      { phrase: 'Zukwenu chinji ha mulonga uno.', translation: 'Muito obrigado por este gesto nobre.' }
    ],
    pronunciation: 'Zoo-kweh-noo',
    culturalNotes: 'Utilizado com particular reverência durante a partilha de caça e nas festividades da corte tradicional.',
    contributorName: 'Tchissola Muacanhica',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-16T12:40:00Z',
    status: 'Aprovada',
    votes: { correct: 35, incorrect: 0, hearts: 28 },
    searchCount: 220,
    reportsCount: 0,
  },
  {
    id: 'cok-3',
    word: 'Samanyonga',
    translation: 'O Pensador / Aquele que medita',
    language: 'cokwe',
    targetLanguage: 'pt',
    meaning: 'O venerável ancião representado na célebre estatueta "O Pensador", meditando sobre os enigmas da existência.',
    examples: [
      { phrase: 'Samanyonga kali chilweza cha mana jetu.', translation: 'O Pensador é o espelho da nossa sabedoria ancestral.' }
    ],
    pronunciation: 'Sah-mah-nyohn-gah',
    culturalNotes: 'Obra-prima da escultura Cokwe mundialmente reconhecida como símbolo da filosofia e alma de Angola.',
    contributorName: 'Mwata Muatchissengue',
    contributorLevel: 'Embaixador da Língua',
    createdAt: '2026-01-24T17:00:00Z',
    status: 'Aprovada',
    votes: { correct: 72, incorrect: 0, hearts: 66 },
    searchCount: 650,
    reportsCount: 0,
  },

  // KWANYAMA ENTRIES
  {
    id: 'kwa-1',
    word: 'Wa aluka',
    translation: 'Olá / Como estás? / Sê bem-vindo',
    language: 'kwanyama',
    targetLanguage: 'pt',
    meaning: 'Saudação comum no Cunene ao encontrar alguém na aldeia.',
    examples: [
      { phrase: 'Wa aluka nawa, mukwetu?', translation: 'Estás bem de saúde, companheiro?' }
    ],
    pronunciation: 'Wah ah-loo-kah',
    culturalNotes: 'A resposta habitual é "Ame onda aluka nawa" (Eu estou bem de saúde).',
    contributorName: 'Nghituwamhata Haimbodi',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-11T13:00:00Z',
    status: 'Aprovada',
    votes: { correct: 29, incorrect: 0, hearts: 21 },
    searchCount: 195,
    reportsCount: 0,
  },
  {
    id: 'kwa-2',
    word: 'Tangi',
    translation: 'Obrigado / Agradeço',
    language: 'kwanyama',
    targetLanguage: 'pt',
    meaning: 'Expressão de gratidão e reconhecimento no Cunene.',
    examples: [
      { phrase: 'Tangi unene kelombwelo loye.', translation: 'Muito obrigado pela tua sábia orientação.' }
    ],
    pronunciation: 'Tahn-gee',
    culturalNotes: 'Simples, direto e amplamente falado em toda a bacia do rio Cuvelai.',
    contributorName: 'Nghituwamhata Haimbodi',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-23T15:30:00Z',
    status: 'Aprovada',
    votes: { correct: 28, incorrect: 0, hearts: 19 },
    searchCount: 170,
    reportsCount: 0,
  },

  // NGANGELA ENTRIES
  {
    id: 'ngan-1',
    word: 'Vukwenu',
    translation: 'Obrigado / Sou grato',
    language: 'ngangela',
    targetLanguage: 'pt',
    meaning: 'Reconhecimento de gentileza e partilha nas terras do leste.',
    examples: [
      { phrase: 'Vukwenu chikuma mu cizemo cove.', translation: 'Muito obrigado pelo teu nobre amor.' }
    ],
    pronunciation: 'Voo-kweh-noo',
    culturalNotes: 'Usado nas margens do Cuando e Cubango em celebrações de colheita.',
    contributorName: 'Kavita Chissingui',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-27T10:15:00Z',
    status: 'Aprovada',
    votes: { correct: 24, incorrect: 0, hearts: 18 },
    searchCount: 130,
    reportsCount: 0,
  },

  // FIOTE ENTRIES
  {
    id: 'fio-1',
    word: 'Bika mbote',
    translation: 'Fica em paz / Até logo',
    language: 'fiote',
    targetLanguage: 'pt',
    category: 'Saudações',
    meaning: 'Despedida cordial e afável em Cabinda.',
    examples: [
      { phrase: 'Bika mbote, tutadiana mbazi.', translation: 'Fica em paz, até nos vermos amanhã.' }
    ],
    pronunciation: 'Bee-kah mboh-teh',
    culturalNotes: 'Reflete a doçura e tranquilidade da cultura do povo de Cabinda.',
    contributorName: 'Manoelita Buanga',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-28T09:40:00Z',
    status: 'Aprovada',
    votes: { correct: 22, incorrect: 0, hearts: 17 },
    searchCount: 145,
    reportsCount: 0,
  },
  {
    id: 'fio-2',
    word: 'Matondo mingi',
    translation: 'Muitos agradecimentos / Muito obrigado',
    language: 'fiote',
    targetLanguage: 'pt',
    category: 'Cortesia',
    meaning: 'Agradecimento sincero por acolhimento ou dádiva.',
    examples: [
      { phrase: 'Matondo mingi mu buza bwaku.', translation: 'Muito obrigado pela tua amabilidade.' }
    ],
    pronunciation: 'Mah-tohn-doh meen-gee',
    culturalNotes: 'Partilhado entre as variantes setentrionais do Kikongo no Maiombe e Cabinda.',
    contributorName: 'Manoelita Buanga',
    contributorLevel: 'Colaborador',
    createdAt: '2026-01-29T11:00:00Z',
    status: 'Aprovada',
    votes: { correct: 25, incorrect: 0, hearts: 19 },
    searchCount: 160,
    reportsCount: 0,
  },

  // LUVALE ENTRIES
  {
    id: 'luv-1',
    word: 'Sakuwila',
    translation: 'Obrigado / Agradeço com apreço',
    language: 'luvale',
    targetLanguage: 'pt',
    category: 'Cortesia',
    meaning: 'Expressão respeitosa de gratidão no leste de Angola, ao longo do rio Zambeze.',
    examples: [
      { phrase: 'Sakuwila chinji, ndumbu yami.', translation: 'Muito obrigado, meu irmão.' }
    ],
    pronunciation: 'Sah-koo-wee-lah',
    culturalNotes: 'Utilizado em ocasiões formais de acolhimento e partilha de alimentos no Moxico.',
    contributorName: 'Kasoma Chinyama',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-30T10:00:00Z',
    status: 'Aprovada',
    votes: { correct: 31, incorrect: 0, hearts: 24 },
    searchCount: 180,
    reportsCount: 0,
  },
  {
    id: 'luv-2',
    word: 'Likishi',
    translation: 'Máscara sagrada ancestral / Espírito protetor',
    language: 'luvale',
    targetLanguage: 'pt',
    category: 'Cultura & Filosofia',
    meaning: 'Figura mascarada cerimonial que encarna a sabedoria e a força dos antepassados nos ritos de iniciação Mukanda.',
    examples: [
      { phrase: 'Likishi lya mwana-pwo linahiti.', translation: 'A máscara Likishi de Mwana-pwo passou.' }
    ],
    pronunciation: 'Lee-kee-shee',
    culturalNotes: 'Manifestação cultural patrimonial dos povos Luvale e Cokwe, reconhecida pela sua mestria artística e rítmica.',
    contributorName: 'Kasoma Chinyama',
    contributorLevel: 'Tradutor',
    createdAt: '2026-01-31T15:20:00Z',
    status: 'Aprovada',
    votes: { correct: 44, incorrect: 0, hearts: 39 },
    searchCount: 290,
    reportsCount: 0,
  },

  // NYANEKA ENTRIES
  {
    id: 'nya-1',
    word: 'Tyiwa',
    translation: 'Bem / Em harmonia / Bom',
    language: 'nyaneka',
    targetLanguage: 'pt',
    category: 'Saudações',
    meaning: 'Expressa saúde, paz, beleza e concordância nas terras altas da Serra da Chela e Lubango.',
    examples: [
      { phrase: 'Kala tyiwa, mukwetu.', translation: 'Fica bem, meu amigo.' }
    ],
    pronunciation: 'Tchee-wah',
    culturalNotes: 'Saudação habitual pastoral do povo Nyaneka-Humbi no planalto da Huíla.',
    contributorName: 'Tchindele Chipenda',
    contributorLevel: 'Tradutor',
    createdAt: '2026-02-01T08:30:00Z',
    status: 'Aprovada',
    votes: { correct: 27, incorrect: 0, hearts: 20 },
    searchCount: 165,
    reportsCount: 0,
  },
  {
    id: 'nya-2',
    word: 'Oupale',
    translation: 'Assembleia comunitária tradicional / Conselho dos mais velhos',
    language: 'nyaneka',
    targetLanguage: 'pt',
    category: 'Sociedade & Tradição',
    meaning: 'Local sagrado e reunião comunitária onde se deliberam as decisões da aldeia e se resolvem litígios com serenidade.',
    examples: [
      { phrase: 'Ovanthu vehi voupale vatokola nawa.', translation: 'As pessoas do conselho deliberaram com justiça.' }
    ],
    pronunciation: 'Oh-oo-pah-leh',
    culturalNotes: 'Espaço análogo ao onjango umbundu, preservado com dignidade pelas comunidades pastoris da Huíla.',
    contributorName: 'Tchindele Chipenda',
    contributorLevel: 'Tradutor',
    createdAt: '2026-02-01T12:00:00Z',
    status: 'Aprovada',
    votes: { correct: 33, incorrect: 0, hearts: 26 },
    searchCount: 210,
    reportsCount: 0,
  },

  // MUHUMBI ENTRIES
  {
    id: 'muh-1',
    word: 'Omuhona',
    translation: 'Senhor venerável / Autoridade tradicional respeitada',
    language: 'muhumbi',
    targetLanguage: 'pt',
    category: 'Sociedade & Tradição',
    meaning: 'Título de honra e respeito concedido ao chefe de família ou líder tradicional na região do Cunene e Huíla.',
    examples: [
      { phrase: 'Omuhona yetu wetupopila nombili.', translation: 'O nosso senhor falou-nos com palavras de paz.' }
    ],
    pronunciation: 'Oh-moo-hoh-nah',
    culturalNotes: 'Título tradicional bantu compartilhado no sul de Angola, indicando integridade e liderança benevolente.',
    contributorName: 'Haimbodi Nekwaya',
    contributorLevel: 'Colaborador',
    createdAt: '2026-02-02T09:10:00Z',
    status: 'Aprovada',
    votes: { correct: 26, incorrect: 0, hearts: 18 },
    searchCount: 140,
    reportsCount: 0,
  },
  {
    id: 'muh-2',
    word: 'Okupandula',
    translation: 'Agradecer com humildade / Dar graças',
    language: 'muhumbi',
    targetLanguage: 'pt',
    category: 'Cortesia',
    meaning: 'Agradecimento ritual ou interpessoal pela colheita e pelo gado.',
    examples: [
      { phrase: 'Tupandula oluhapu lwove.', translation: 'Agradecemos as tuas boas palavras.' }
    ],
    pronunciation: 'Oh-koo-pahn-doo-lah',
    culturalNotes: 'Prática de gratidão sagrada ligada à fertilidade da terra e saúde dos animais.',
    contributorName: 'Haimbodi Nekwaya',
    contributorLevel: 'Colaborador',
    createdAt: '2026-02-02T13:40:00Z',
    status: 'Aprovada',
    votes: { correct: 22, incorrect: 0, hearts: 16 },
    searchCount: 125,
    reportsCount: 0,
  },

  // PENDING COMMUNITY SUGGESTION DEMOS FOR MODERATION
  {
    id: 'sug-pend-1',
    word: 'Mwana-pwo',
    translation: 'Jovem mulher / Máscara de beleza feminina',
    language: 'cokwe',
    targetLanguage: 'pt',
    meaning: 'Designa a jovem mulher e a emblemática máscara de madeira que celebra os ideais de graça e sabedoria matriarcal Cokwe.',
    examples: [
      { phrase: 'Mwana-pwo apwa chifwanyisa cha ulema.', translation: 'A Mwana-pwo é o símbolo da dignidade feminina.' }
    ],
    pronunciation: 'Mwah-nah pwoh',
    culturalNotes: 'Uma das mais belas máscaras rituais de Angola, usada em danças cerimoniais de celebração da fertilidade e harmonia.',
    contributorName: 'Tchissola Muacanhica',
    contributorLevel: 'Tradutor',
    createdAt: '2026-02-01T14:00:00Z',
    status: 'Pendente',
    votes: { correct: 14, incorrect: 0, hearts: 12 },
    searchCount: 88,
    reportsCount: 0,
  },
  {
    id: 'sug-pend-2',
    word: 'Kixikila',
    translation: 'Sistema tradicional de poupança comunitária rotativa',
    language: 'kimbundu',
    targetLanguage: 'pt',
    meaning: 'Associação solidária de entreajuda financeira onde cada membro contribui com um montante periódico e recolhe a quota rotativa.',
    examples: [
      { phrase: 'Makamba mami a bhanga kixikila kya ngondo.', translation: 'Os meus amigos organizaram uma kixikila mensal.' }
    ],
    pronunciation: 'Kee-shee-kee-lah',
    culturalNotes: 'Instituição financeira ancestral angolana ainda amplamente viva nos mercados e bairros de Luanda e de todo o país.',
    contributorName: 'Adão Domingos',
    contributorLevel: 'Colaborador',
    createdAt: '2026-02-02T16:30:00Z',
    status: 'Pendente',
    votes: { correct: 20, incorrect: 0, hearts: 18 },
    searchCount: 110,
    reportsCount: 0,
  }
];

export const MOCK_ADMIN_USER: UserProfile = {
  id: 'usr-admin',
  name: 'Mestre Kwanza (Linguista Chefe)',
  email: 'avelinosampaio2001@gmail.com',
  nativeLanguages: ['kimbundu', 'umbundu', 'pt'],
  points: 480,
  level: 'Embaixador da Língua',
  role: 'admin',
  favorites: ['kimb-1', 'kimb-3', 'umb-2', 'cok-3'],
  history: [
    {
      id: 'h-1',
      sourceText: 'Bom dia a todos os meus irmãos',
      sourceLang: 'pt',
      targetText: 'Kiambote kya menha makamba mami moso',
      targetLang: 'kimbundu',
      timestamp: '2026-02-03T08:15:00Z',
      phonetic: 'Kee-ahm-boh-teh kyah meh-nyah mah-kahm-bah mah-mee moh-soh',
      isAi: false,
    },
    {
      id: 'h-2',
      sourceText: 'Agradeço de todo o coração por esta bênção',
      sourceLang: 'pt',
      targetText: 'Ndapandula lutima lwange luosi kwo cisambu cino',
      targetLang: 'umbundu',
      timestamp: '2026-02-03T09:30:00Z',
      phonetic: 'Ndah-pahn-doo-lah loo-tee-mah lwahn-geh loo-oh-see kwoh chee-sahm-boo chee-noh',
      isAi: true,
    }
  ],
  contributionsCount: 18,
  approvedCount: 16,
  badges: ['Pioneiro da Plataforma', 'Especialista em Kimbundu', 'Guardião Bantu', 'Voz da Comunidade'],
};

export const MOCK_COMMUNITY_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Dra. Kieza Malanje',
    email: 'kieza@tradutorangola.ao',
    nativeLanguages: ['kimbundu', 'pt'],
    points: 320,
    level: 'Embaixador da Língua',
    role: 'user',
    favorites: ['kimb-1', 'kimb-2'],
    history: [],
    contributionsCount: 22,
    approvedCount: 20,
    badges: ['Pioneira Kimbundu', 'Top Contribuidora'],
  },
  {
    id: 'usr-2',
    name: 'Dr. Chivukuvuku Silva',
    email: 'chivukuvuku@tradutorangola.ao',
    nativeLanguages: ['umbundu', 'pt'],
    points: 275,
    level: 'Embaixador da Língua',
    role: 'user',
    favorites: ['umb-1', 'umb-4'],
    history: [],
    contributionsCount: 19,
    approvedCount: 18,
    badges: ['Guardião do Planalto', 'Mestre Umbundu'],
  },
  {
    id: 'usr-3',
    name: 'Mwata Muatchissengue',
    email: 'mwata@tradutorangola.ao',
    nativeLanguages: ['cokwe', 'luvale', 'pt'],
    points: 190,
    level: 'Embaixador da Língua',
    role: 'user',
    favorites: ['cok-1', 'cok-3'],
    history: [],
    contributionsCount: 14,
    approvedCount: 12,
    badges: ['Guardião Cokwe', 'Sábio Samanyonga'],
  },
  {
    id: 'usr-4',
    name: 'Nkosi Kinzambi',
    email: 'nkosi@tradutorangola.ao',
    nativeLanguages: ['kikongo', 'fiote', 'pt'],
    points: 140,
    level: 'Tradutor',
    role: 'user',
    favorites: ['kik-1', 'kik-3'],
    history: [],
    contributionsCount: 9,
    approvedCount: 8,
    badges: ['Voz de Mbanza Congo'],
  }
];

export const INITIAL_SONGS: NationalSong[] = [
  {
    id: 'song-1',
    title: 'Mona Ki Ngi Xica',
    artist: 'Bonga Kwenda',
    language: 'kimbundu',
    genre: 'Semba / Lamento Tradicional',
    platformUrl: 'https://www.youtube.com/watch?v=W3c4M1VqG-U',
    youtubeId: 'W3c4M1VqG-U',
    originalLyrics: `Mona ki ngi xica
Ngi mu xica ni nanyi?
Ngi mu xica ni Nzambi
Nzambi mu ngi xica ni nanyi?

Ngi xica o mona
Mona ki ngi xica
Mu ngongo yoyo
Wezala ni jingongo

Eme ngi yile
Nga tunda ku mbanza
Ku bata yetu
Kwa xala o mundu woso`,
    translatedLyrics: `A criança que eu deixo
Com quem é que a deixo?
Deixo-a com Deus
E Deus deixa-me com quem?

Deixo o meu filho
A criança que deixo
Neste mundo
Que está repleto de sofrimentos

Eu tenho que partir
Saio da nossa terra
Da nossa casa natal
Onde ficou todo o nosso povo`,
    verses: [
      {
        original: 'Mona ki ngi xica / Ngi mu xica ni nanyi?',
        translation: 'A criança que eu deixo / Com quem é que a deixo?'
      },
      {
        original: 'Ngi mu xica ni Nzambi / Nzambi mu ngi xica ni nanyi?',
        translation: 'Deixo-a com Deus / E Deus deixa-me com quem?'
      },
      {
        original: 'Ngi xica o mona / Mu ngongo yoyo wezala ni jingongo',
        translation: 'Deixo o meu filho / Neste mundo repleto de sofrimentos'
      },
      {
        original: 'Eme ngi yile / Ku bata yetu kwa xala o mundu woso',
        translation: 'Eu tenho que partir / Na nossa terra natal ficou todo o nosso povo'
      }
    ],
    culturalContext: 'Gravada em 1972 no álbum histórico "Angola 72", esta canção é um dos maiores símbolos do lamento, da saudade e da resistência do povo angolano. Retrata a dor do emigrante ou combatente obrigado a abandonar a sua terra e os seus filhos.',
    contributorName: 'Professor Ndombele',
    contributorId: 'usr-admin',
    createdAt: '2026-02-10T10:00:00Z',
    status: 'Aprovada',
    likesCount: 148,
  },
  {
    id: 'song-2',
    title: 'Muxima',
    artist: 'Liceu Vieira Dias & N’gola Ritmos',
    language: 'kimbundu',
    genre: 'Semba / Canção Devocional',
    platformUrl: 'https://www.youtube.com/watch?v=kYv_3jV3pZg',
    youtubeId: 'kYv_3jV3pZg',
    originalLyrics: `Kala ngi muene Mamã Muxima
Ngata mu tunda, ngata mu vutuka
Ngana Nzambi weza
Ku muxima wami

Kusambila mu nzo ya Nzambi
Nzambi ya Angola yetu
Twa mu bhinga ombembwa
Ni kuzola kwa vwalende`,
    translatedLyrics: `Sempre que contemplo a Mãe Muxima
Vou e volto com o coração consolado
O Senhor Deus faz-se presente
No íntimo do meu coração

Em oração na casa de Deus
O Deus da nossa Angola
Pedimos-Lhe a paz
E o amor fraterno para todo o sempre`,
    verses: [
      {
        original: 'Kala ngi muene Mamã Muxima / Ngata mu tunda, ngata mu vutuka',
        translation: 'Sempre que contemplo a Mãe Muxima / Vou e volto com o coração consolado'
      },
      {
        original: 'Ngana Nzambi weza ku muxima wami',
        translation: 'O Senhor Deus faz-se presente no íntimo do meu coração'
      },
      {
        original: 'Twa mu bhinga ombembwa ni kuzola kwa vwalende',
        translation: 'Pedimos-Lhe a paz e o amor fraterno para todo o sempre'
      }
    ],
    culturalContext: 'Hino intemporal de Angola em honra de Nossa Senhora da Muxima (no rio Kwanza). O grupo Ngola Ritmos liderado por Liceu Vieira Dias nacionalizou o som angolano ao introduzir a língua kimbundu com instrumentos tradicionais.',
    contributorName: 'Dra. Kieza Malanje',
    contributorId: 'usr-1',
    createdAt: '2026-02-12T14:30:00Z',
    status: 'Aprovada',
    likesCount: 122,
  },
  {
    id: 'song-3',
    title: 'Kalunga Ka Mbande (Paz no Planalto)',
    artist: 'Coral Tradicional do Planalto Central',
    language: 'umbundu',
    genre: 'Música Tradicional Ovimbundu',
    platformUrl: 'https://www.youtube.com/watch?v=uK1X_jB2sK8',
    youtubeId: 'uK1X_jB2sK8',
    originalLyrics: `Kalunga ciwa kokuene vosi
Epata lietu li sangiwe
Ocisola cange ka ci pu
Kofeka yetu ya Huambo

Ombembwa yi kale kokuene
Sekulu vosi va sanjuke
Tukalingila vonjango
Oku sanga olondunge`,
    translatedLyrics: `Saudações de paz para todos vós
Que a nossa família esteja reunida
O meu amor nunca terá fim
Pela nossa terra do Huambo

Que a paz reine entre vós
Que todos os anciãos se alegrem
Vamos todos reunir-nos no onjango
Para partilhar a sabedoria ancestral`,
    verses: [
      {
        original: 'Kalunga ciwa kokuene vosi / Epata lietu li sangiwe',
        translation: 'Saudações de paz para todos vós / Que a nossa família esteja reunida'
      },
      {
        original: 'Ocisola cange ka ci pu kofeka yetu',
        translation: 'O meu amor nunca terá fim pela nossa terra'
      },
      {
        original: 'Tukalingila vonjango oku sanga olondunge',
        translation: 'Vamos todos reunir-nos no onjango para partilhar a sabedoria'
      }
    ],
    culturalContext: 'Canção de tertúlia comunitária que celebra o retorno à aldeia e a reunião no onjango (tribunal e assembleia tradicional do povo Ovimbundu).',
    contributorName: 'Dr. Chivukuvuku Silva',
    contributorId: 'usr-2',
    createdAt: '2026-02-14T11:00:00Z',
    status: 'Aprovada',
    likesCount: 95,
  },
  {
    id: 'song-4',
    title: 'Nzambi Mpungu Tulendo',
    artist: 'Grupo Folclórico de Mbanza Kongo',
    language: 'kikongo',
    genre: 'Espiritual Tradicional / Rumba Antiga',
    platformUrl: 'https://www.youtube.com/watch?v=Vl0gX9b3yK8',
    youtubeId: 'Vl0gX9b3yK8',
    originalLyrics: `Nzambi Mpungu Tulendo
Sadisa bana ba nsi
Mu luzingu lweto lua mpasi
Tuvovele kintwadi

Mbanza Kongo ya yetu
Kiyingi kieto ka kimani
Tuvutukidi mu kintwadi
Mu tunga nsi yetu`,
    translatedLyrics: `Deus Todo-Poderoso e Soberano
Ajuda os filhos desta terra
Na nossa caminhada de superação
Falamos e vivemos em união comunitária

A nossa Mbanza Kongo sagrada
A nossa hospitalidade nunca findará
Voltámos a unir-nos em fraternidade
Para reconstruir a nossa nação`,
    verses: [
      {
        original: 'Nzambi Mpungu Tulendo / Sadisa bana ba nsi',
        translation: 'Deus Todo-Poderoso e Soberano / Ajuda os filhos desta terra'
      },
      {
        original: 'Tuvovele kintwadi mu tunga nsi yetu',
        translation: 'Falamos e vivemos em união para construir a nossa nação'
      }
    ],
    culturalContext: 'Cântico solene na língua kikongo que evoca as memórias da capital histórica do Reino do Congo e invoca a fraternidade (Kintwadi).',
    contributorName: 'Nkosi Kinzambi',
    contributorId: 'usr-4',
    createdAt: '2026-02-16T16:20:00Z',
    status: 'Aprovada',
    likesCount: 88,
  },
  {
    id: 'song-pend-1',
    title: 'Cisemo ca Samanyonga',
    artist: 'Tchissola & Os Filhos do Leste',
    language: 'cokwe',
    genre: 'Música Tradicional Cokwe / Marimba',
    platformUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    originalLyrics: `Moyo wenu mandumbu
Samanyonga kali ha mana
Zukwenu kuli vayeze
Twasangulukila hamwe`,
    translatedLyrics: `Saudações de vida, irmãos
O Pensador está sereno na sabedoria
Agradecemos a todos os visitantes
Estamos felizes por estarmos unidos`,
    verses: [
      {
        original: 'Moyo wenu mandumbu / Samanyonga kali ha mana',
        translation: 'Saudações de vida, irmãos / O Pensador está sereno na sabedoria'
      },
      {
        original: 'Zukwenu kuli vayeze / Twasangulukila hamwe',
        translation: 'Agradecemos a todos os visitantes / Estamos felizes por estarmos unidos'
      }
    ],
    culturalContext: 'Canção de boas-vindas com marimbas e tambores das Lundas, aguardando aprovação para o acervo oficial.',
    contributorName: 'Tchissola Muacanhica',
    contributorId: 'usr-3',
    createdAt: '2026-02-18T10:00:00Z',
    status: 'Pendente',
    likesCount: 14,
  }
];

export const DEFAULT_MONETIZATION_SETTINGS: MonetizationSettings = {
  adsenseEnabled: false,
  adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXX',
  customBannersEnabled: true,
  sidebarAdsEnabled: true,
  sidebarRotationInterval: 7, // 7 segundos de transição automática no carrossel
  sidebarLeftActive: true,
  sidebarRightActive: true,
  multicaixaDonationsEnabled: true,
  multicaixaEntity: '00123',
  multicaixaNumber: '923 000 000',
};

export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-unitel-1',
    title: 'Unitel 5G · Conectando Angola de Cabinda ao Cunene',
    sponsorName: 'Unitel Angola',
    description: 'A internet mais rápida do país para estudar, traduzir e valorizar o património linguístico angolano em qualquer província.',
    badgeText: 'Patrocinador Oficial',
    ctaText: 'Aderir ao Plano Jovem',
    targetUrl: 'https://www.unitel.ao',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    placement: 'top_leaderboard',
    isActive: true,
    impressionsCount: 1420,
    clicksCount: 184,
    category: 'telecom',
  },
  {
    id: 'ad-bfa-side-1',
    title: 'BFA · Conta Jovem & BFA App Directo',
    sponsorName: 'Banco de Fomento Angola',
    description: 'Abra a sua conta bancária sem filas e faça transferências Multicaixa Express em segundos pelo telemóvel.',
    badgeText: 'Parceiro Financeiro',
    ctaText: 'Abrir Conta no BFA',
    targetUrl: 'https://www.bfa.ao',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    placement: 'sidebar_left',
    isActive: true,
    impressionsCount: 1150,
    clicksCount: 142,
    category: 'banco',
    rotationWeight: 10,
  },
  {
    id: 'ad-academia-side-2',
    title: 'Academia Bantu · Cursos Online com Professores Nativos',
    sponsorName: 'Academia Bantu de Angola',
    description: 'Aprenda Kimbundu, Umbundu, Kikongo ou Cokwe com aulas ao vivo, materiais de apoio e certificado oficial.',
    badgeText: 'Educação Bantu',
    ctaText: 'Inscrever no Curso',
    targetUrl: 'https://tradutornacional.ao',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    placement: 'sidebar_right',
    isActive: true,
    impressionsCount: 980,
    clicksCount: 135,
    category: 'educacao',
    rotationWeight: 10,
  },
  {
    id: 'ad-africell-side-3',
    title: 'Africell · Pacote Estudante com Dados Bónus',
    sponsorName: 'Africell Angola',
    description: 'Mais internet para pesquisas escolares e tradução em tempo real das línguas tradicionais angolanas.',
    badgeText: 'Tecnologia Jovem',
    ctaText: 'Ver Planos Africell',
    targetUrl: 'https://www.africell.ao',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80',
    placement: 'sidebar_left',
    isActive: true,
    impressionsCount: 860,
    clicksCount: 94,
    category: 'telecom',
    rotationWeight: 8,
  },
  {
    id: 'ad-livraria-side-4',
    title: 'Editora das Letras · Dicionários e Livros de Angola',
    sponsorName: 'Livraria & Cultura Luanda',
    description: 'Manuais escolares e gramáticas de Línguas Nacionais com entrega ao domicílio em Luanda e capitais de província.',
    badgeText: 'Livros e Cultura',
    ctaText: 'Comprar Dicionário',
    targetUrl: 'https://tradutornacional.ao',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    placement: 'sidebar_right',
    isActive: true,
    impressionsCount: 740,
    clicksCount: 88,
    category: 'cultura',
    rotationWeight: 8,
  },
  {
    id: 'ad-bai-1',
    title: 'Fundo BAI Cultura · Apoio às Línguas Nacionais',
    sponsorName: 'Banco BAI',
    description: 'Acreditamos na força da identidade angolana. Conheça as bolsas de investigação e publicações em Kimbundu, Umbundu e Kikongo.',
    badgeText: 'Mecenas Cultural',
    ctaText: 'Conhecer Projetos BAI',
    targetUrl: 'https://www.bancobai.ao',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    placement: 'native_feed',
    isActive: true,
    impressionsCount: 960,
    clicksCount: 112,
    category: 'banco',
  },
  {
    id: 'ad-taag-1',
    title: 'TAAG · Conheça a Diversidade Cultural das 18 Províncias',
    sponsorName: 'TAAG Linhas Aéreas de Angola',
    description: 'Voe para o Huambo, Huíla, Malanje ou Uíge com tarifas especiais de fim de semana e mergulhe nas tradições da nossa terra.',
    badgeText: 'Parceiro de Viagens',
    ctaText: 'Reservar Voo Nacional',
    targetUrl: 'https://www.taag.com',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
    placement: 'bottom_bar',
    isActive: true,
    impressionsCount: 820,
    clicksCount: 95,
    category: 'turismo',
  },
  {
    id: 'ad-africell-1',
    title: 'Africell · Mais Dados para Navegar no Tradutor Nacional',
    sponsorName: 'Africell Angola',
    description: 'Pacotes sociais com acesso grátis a plataformas educativas e de preservação da cultura bantu angolana.',
    badgeText: 'Apoio Digital',
    ctaText: 'Ver Tarifários',
    targetUrl: 'https://www.africell.ao',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80',
    placement: 'translator_box',
    isActive: true,
    impressionsCount: 650,
    clicksCount: 78,
    category: 'telecom',
  },
];

