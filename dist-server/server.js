// server.ts
import express from "express";
import http from "http";
import path4 from "path";
import fs4 from "fs";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// src/data/seedData.ts
var INITIAL_LANGUAGES = [
  {
    code: "pt",
    name: "Portugu\xEAs",
    nativeName: "Portugu\xEAs (Angola)",
    regions: "Todas as prov\xEDncias (L\xEDngua oficial e veicular)",
    speakersEstimated: "~25 milh\xF5es",
    family: "Indo-Europeia (Rom\xE2nica)",
    description: "L\xEDngua oficial de Angola enriquecida por termos e cal\xE3o aut\xF3ctone angolano.",
    isActive: true
  },
  {
    code: "kimbundu",
    name: "Kimbundu",
    nativeName: "Kimbundu / Quimbundo",
    regions: "Luanda, Bengo, Cuanza Norte, Malanje, U\xEDge",
    speakersEstimated: "~4 milh\xF5es",
    family: "N\xEDger-Congo (Bantu H.21)",
    description: "L\xEDngua hist\xF3rica do antigo Reino do Ndongo e de Luanda, com profunda influ\xEAncia no portugu\xEAs angolano e na cultura nacional.",
    isActive: true
  },
  {
    code: "umbundu",
    name: "Umbundu",
    nativeName: "Umbundu / Ovimbundu",
    regions: "Huambo, Bi\xE9, Benguela, Cuanza Sul",
    speakersEstimated: "~7 milh\xF5es",
    family: "N\xEDger-Congo (Bantu R.11)",
    description: "A l\xEDngua nacional mais falada em Angola em n\xFAmero de falantes nativos, ber\xE7o da cultura do planalto central angolano.",
    isActive: true
  },
  {
    code: "kikongo",
    name: "Kikongo",
    nativeName: "Kikongo / Quicongo",
    regions: "U\xEDge, Zaire, Cabinda",
    speakersEstimated: "~2.5 milh\xF5es",
    family: "N\xEDger-Congo (Bantu H.16)",
    description: "L\xEDngua vener\xE1vel do hist\xF3rico Reino do Congo, rica em prov\xE9rbios filos\xF3ficos e literatura oral ancestral.",
    isActive: true
  },
  {
    code: "cokwe",
    name: "Cokwe",
    nativeName: "Tchokwe / Cokwe",
    regions: "Lunda Norte, Lunda Sul, Moxico",
    speakersEstimated: "~1.8 milh\xF5es",
    family: "N\xEDger-Congo (Bantu K.11)",
    description: 'Famosa pela arte e sabedoria tradicional, criadora do s\xEDmbolo nacional "O Pensador" (Samanyonga) e dos desenhos na areia Sona.',
    isActive: true
  },
  {
    code: "kwanyama",
    name: "Kwanyama",
    nativeName: "Oshikwanyama / Cuanhama",
    regions: "Cunene",
    speakersEstimated: "~700 mil",
    family: "N\xEDger-Congo (Bantu R.21)",
    description: "L\xEDngua do her\xF3ico Rei Mandume Ya Ndemufayo, falada com orgulho no sul de Angola na fronteira com a Nam\xEDbia.",
    isActive: true
  },
  {
    code: "ngangela",
    name: "Ngangela",
    nativeName: "Nganguela / Nyemba",
    regions: "Cuando Cubango, Moxico, Hu\xEDla",
    speakersEstimated: "~600 mil",
    family: "N\xEDger-Congo (Bantu K.10)",
    description: "Agrupamento lingu\xEDstico do leste e sudeste de Angola com ricas tradi\xE7\xF5es musicais e de harmonia com a natureza.",
    isActive: true
  },
  {
    code: "fiote",
    name: "Fiote",
    nativeName: "Fiote / Ibinda",
    regions: "Cabinda",
    speakersEstimated: "~450 mil",
    family: "N\xEDger-Congo (Bantu H.16d)",
    description: "Variante setentrional do Kikongo com identidade singular pr\xF3pria do enclave florestal de Cabinda.",
    isActive: true
  },
  {
    code: "luvale",
    name: "Luvale",
    nativeName: "Luvale / Chiluvale",
    regions: "Moxico",
    speakersEstimated: "~400 mil",
    family: "N\xEDger-Congo (Bantu K.14)",
    description: "L\xEDngua falada ao longo do rio Zambeze no leste de Angola, c\xE9lebre pela cerim\xF3nia cultural de Mukanda e dan\xE7as dos ancestrais Likishi.",
    isActive: true
  },
  {
    code: "nyaneka",
    name: "Nyaneka",
    nativeName: "Nyaneka-Humbi / Olunyaneka",
    regions: "Hu\xEDla, Namibe",
    speakersEstimated: "~550 mil",
    family: "N\xEDger-Congo (Bantu R.13)",
    description: "Falada nas terras altas da Serra da Chela e Lubango, guardi\xE3 de tradi\xE7\xF5es pastoris e valores comunit\xE1rios.",
    isActive: true
  },
  {
    code: "muhumbi",
    name: "Muhumbi",
    nativeName: "Muhumbi / Humbi",
    regions: "Hu\xEDla, Cunene",
    speakersEstimated: "~250 mil",
    family: "N\xEDger-Congo (Bantu R.14)",
    description: "L\xEDngua das comunidades do vale do Cunene e Hu\xEDla, com not\xE1vel artesanato tradicional e tradi\xE7\xF5es orais.",
    isActive: true
  }
];
var INITIAL_DICTIONARY_ENTRIES = [
  // KIMBUNDU ENTRIES
  {
    id: "kimb-1",
    word: "Sakidila",
    translation: "Obrigado / Agrade\xE7o",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "Express\xE3o de gratid\xE3o sincera e reconhecimento de um favor ou gentileza recebida.",
    examples: [
      { phrase: "Sakidila kyavulu, ndenge yami.", translation: "Muito obrigado, meu irm\xE3o/mais novo." },
      { phrase: "Etu twa sakidila Nzambi.", translation: "N\xF3s agradecemos a Deus." }
    ],
    pronunciation: "Sah-kee-dee-lah",
    culturalNotes: "Em Kimbundu, a gratid\xE3o refor\xE7a os la\xE7os ancestrais de respeito (ukamba) entre os membros da comunidade.",
    contributorName: "Dra. Kieza Malanje",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-12T10:00:00Z",
    status: "Aprovada",
    votes: { correct: 48, incorrect: 0, hearts: 35 },
    searchCount: 320,
    reportsCount: 0
  },
  {
    id: "kimb-2",
    word: "Muxima",
    translation: "Cora\xE7\xE3o / Sentimento / Alma",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "O centro dos sentimentos, consci\xEAncia moral e apego afetivo na filosofia bantu.",
    examples: [
      { phrase: "Muxima wami wezala ni kuzola.", translation: "O meu cora\xE7\xE3o est\xE1 cheio de amor." },
      { phrase: "Monandengue uala ni muxima wambote.", translation: "A crian\xE7a tem um bom cora\xE7\xE3o." }
    ],
    pronunciation: "Moo-shee-mah",
    culturalNotes: "D\xE1 tamb\xE9m nome ao famoso Santu\xE1rio da Muxima na prov\xEDncia de Luanda / Bengo, s\xEDmbolo de devo\xE7\xE3o nacional.",
    contributorName: "Professor Ndombele",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-15T14:30:00Z",
    status: "Aprovada",
    votes: { correct: 52, incorrect: 1, hearts: 41 },
    searchCount: 410,
    reportsCount: 0
  },
  {
    id: "kimb-3",
    word: "Kandandu",
    translation: "Abra\xE7o caloroso / Sauda\xE7\xE3o fraterna",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "Gesto de carinho que une duas pessoas; abra\xE7o fraterno t\xEDpico angolano.",
    examples: [
      { phrase: "Ngakubhana kandandu kakola!", translation: "Dou-te um abra\xE7o forte!" }
    ],
    pronunciation: "Kahn-dahn-doo",
    culturalNotes: "Palavra amplamente adotada no vocabul\xE1rio angolano em portugu\xEAs ao despedir-se de amigos pr\xF3ximos.",
    contributorName: "Isabel Panzo",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-18T09:15:00Z",
    status: "Aprovada",
    votes: { correct: 64, incorrect: 0, hearts: 58 },
    searchCount: 512,
    reportsCount: 0
  },
  {
    id: "kimb-4",
    word: "Wiza kiambote",
    translation: "Bem-vindo / Chega em boa hora",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "Sauda\xE7\xE3o afetuosa de boas-vindas ao visitante ou h\xF3spede.",
    examples: [
      { phrase: "Wiza kiambote mu mbanza yetu.", translation: "S\xEA bem-vindo \xE0 nossa terra." }
    ],
    pronunciation: "Wee-zah kee-ahm-boh-teh",
    culturalNotes: "A hospitalidade \xE9 um dos pilares mais sagrados da cultura bantu em Angola.",
    contributorName: "Manuel Quissua",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-20T11:00:00Z",
    status: "Aprovada",
    votes: { correct: 31, incorrect: 0, hearts: 22 },
    searchCount: 180,
    reportsCount: 0
  },
  {
    id: "kimb-5",
    word: "Makamba",
    translation: "Amigos / Companheiros",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "Plural de dikamba (amigo); refere-se ao c\xEDrculo de companheirismo leal.",
    examples: [
      { phrase: "Makamba mami a wiza o lelu.", translation: "Os meus amigos vieram hoje." }
    ],
    pronunciation: "Mah-kahm-bah",
    culturalNotes: 'Raiz da express\xE3o informal "kamba" usada por todos os angolanos no dia a dia.',
    contributorName: "Lando Gaspar",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-22T16:20:00Z",
    status: "Aprovada",
    votes: { correct: 39, incorrect: 0, hearts: 29 },
    searchCount: 290,
    reportsCount: 0
  },
  {
    id: "kimb-6",
    word: "Nzambi",
    translation: "Deus / Divindade Suprema",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "O Criador do universo na espiritualidade tradicional e adotado no cristianismo.",
    examples: [
      { phrase: "Nzambi uabana mwenyu.", translation: "Deus concedeu a vida." }
    ],
    pronunciation: "N-zahm-bee",
    culturalNotes: "Nome comum compartilhado em v\xE1rias l\xEDnguas bantu do centro-oeste africano.",
    contributorName: "Pastor Nginga",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-25T12:00:00Z",
    status: "Aprovada",
    votes: { correct: 44, incorrect: 0, hearts: 31 },
    searchCount: 245,
    reportsCount: 0
  },
  // UMBUNDU ENTRIES
  {
    id: "umb-1",
    word: "Ndapandula",
    translation: "Obrigado / Sou grato",
    language: "umbundu",
    targetLanguage: "pt",
    meaning: "Express\xE3o de reconhecimento e gratid\xE3o em Umbundu.",
    examples: [
      { phrase: "Ndapandula calua, mukwetu.", translation: "Muito obrigado, meu amigo." },
      { phrase: "Etwe twa pandula ocisola cove.", translation: "N\xF3s agradecemos o teu carinho." }
    ],
    pronunciation: "Ndah-pahn-doo-lah",
    culturalNotes: "Diz-se frequentemente inclinando suavemente a cabe\xE7a com a m\xE3o no peito em sinal de respeito aos mais velhos.",
    contributorName: "Dr. Chivukuvuku Silva",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-10T08:00:00Z",
    status: "Aprovada",
    votes: { correct: 56, incorrect: 0, hearts: 42 },
    searchCount: 480,
    reportsCount: 0
  },
  {
    id: "umb-2",
    word: "Kalunga",
    translation: "Ol\xE1 / Sauda\xE7\xE3o de paz / Vida",
    language: "umbundu",
    targetLanguage: "pt",
    meaning: "Sauda\xE7\xE3o cerimoniosa usada em qualquer momento do dia que deseja sa\xFAde e vitalidade.",
    examples: [
      { phrase: "Kalunga ciwa, sekulu.", translation: "Ol\xE1 com sa\xFAde e paz, vener\xE1vel anci\xE3o." }
    ],
    pronunciation: "Kah-loon-gah",
    culturalNotes: "Conceito profundo que abrange a vida, o mar imenso e a for\xE7a c\xF3smica primordial.",
    contributorName: "Helena Chinguto",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-14T11:45:00Z",
    status: "Aprovada",
    votes: { correct: 61, incorrect: 0, hearts: 49 },
    searchCount: 530,
    reportsCount: 0
  },
  {
    id: "umb-3",
    word: "Ocisola",
    translation: "Amor / Afei\xE7\xE3o verdadeira",
    language: "umbundu",
    targetLanguage: "pt",
    meaning: "Amor profundo entre familiares, parceiros ou pela terra natal.",
    examples: [
      { phrase: "Ocisola cange kokuove ka ci pu.", translation: "O meu amor por ti nunca ter\xE1 fim." }
    ],
    pronunciation: "Oh-chee-soh-lah",
    culturalNotes: "Frequentemente cantado em can\xE7\xF5es tradicionais de nado e matrim\xF3nio no planalto central.",
    contributorName: "Maria Kapitu",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-19T13:20:00Z",
    status: "Aprovada",
    votes: { correct: 38, incorrect: 0, hearts: 33 },
    searchCount: 310,
    reportsCount: 0
  },
  {
    id: "umb-4",
    word: "Ombembwa",
    translation: "Paz / Conc\xF3rdia / Serenidade",
    language: "umbundu",
    targetLanguage: "pt",
    meaning: "Estado de harmonia social e espiritual entre os seres humanos e os antepassados.",
    examples: [
      { phrase: "Ombembwa yi kale kokuene vosi.", translation: "Que a paz esteja com todos v\xF3s." }
    ],
    pronunciation: "Ohm-behm-bwah",
    culturalNotes: "Palavra chave usada na reconcilia\xE7\xE3o nacional e no encerramento de julgamentos comunit\xE1rios (onjango).",
    contributorName: "Dr. Chivukuvuku Silva",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-21T09:00:00Z",
    status: "Aprovada",
    votes: { correct: 47, incorrect: 0, hearts: 40 },
    searchCount: 340,
    reportsCount: 0
  },
  {
    id: "umb-5",
    word: "Onjango",
    translation: "Lugar de tert\xFAlia / Tribunal comunit\xE1rio tradicional",
    language: "umbundu",
    targetLanguage: "pt",
    meaning: "Espa\xE7o circular coberto de palha onde a comunidade se re\xFAne para deliberar, contar hist\xF3rias e educar as novas gera\xE7\xF5es.",
    examples: [
      { phrase: "Tukalingila vonjango ovingonji vietu.", translation: "Vamos ao onjango partilhar os nossos pensamentos." }
    ],
    pronunciation: "Ohn-jahn-goh",
    culturalNotes: "S\xEDmbolo maior da democracia participativa tradicional angolana.",
    contributorName: "Professor Ndombele",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-26T15:00:00Z",
    status: "Aprovada",
    votes: { correct: 53, incorrect: 0, hearts: 46 },
    searchCount: 420,
    reportsCount: 0
  },
  // KIKONGO ENTRIES
  {
    id: "kik-1",
    word: "Mbote",
    translation: "Ol\xE1 / Bom dia / Sa\xFAde / Paz",
    language: "kikongo",
    targetLanguage: "pt",
    meaning: "A mais universal sauda\xE7\xE3o em Kikongo, desejando bondade e bem-estar integral.",
    examples: [
      { phrase: "Mbote zaku, nsongi yami!", translation: "Ol\xE1 para ti, meu irm\xE3o/irm\xE3!" },
      { phrase: "Mbote na beno!", translation: "Sauda\xE7\xF5es a todos v\xF3s!" }
    ],
    pronunciation: "Mboh-teh",
    culturalNotes: 'A palavra deriva da raiz "b\xF4te", que significa beleza moral e retid\xE3o de car\xE1ter.',
    contributorName: "Nkosi Kinzambi",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-08T10:00:00Z",
    status: "Aprovada",
    votes: { correct: 68, incorrect: 0, hearts: 55 },
    searchCount: 560,
    reportsCount: 0
  },
  {
    id: "kik-2",
    word: "Matondo",
    translation: "Obrigado / Agradecimentos",
    language: "kikongo",
    targetLanguage: "pt",
    meaning: "Reconhecimento caloroso de uma b\xEAn\xE7\xE3o ou ajuda prestada.",
    examples: [
      { phrase: "Matondo mingi mu lusadisu lwaku.", translation: "Muito obrigado pela tua preciosa ajuda." }
    ],
    pronunciation: "Mah-tohn-doh",
    culturalNotes: "Express\xE3o carregada de espiritualidade e apre\xE7o pelo bem comunit\xE1rio.",
    contributorName: "Sim\xE3o Ndombasi",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-13T14:10:00Z",
    status: "Aprovada",
    votes: { correct: 49, incorrect: 0, hearts: 39 },
    searchCount: 390,
    reportsCount: 0
  },
  {
    id: "kik-3",
    word: "Kintwadi",
    translation: "Uni\xE3o / Solidariedade comunit\xE1ria",
    language: "kikongo",
    targetLanguage: "pt",
    meaning: "O princ\xEDpio de viver em comunh\xE3o, entreajuda m\xFAtua e fraternidade coletiva.",
    examples: [
      { phrase: "Mu kintwadi, tulenda tunga nsi yetu.", translation: "Na uni\xE3o, podemos construir a nossa na\xE7\xE3o." }
    ],
    pronunciation: "Keen-twah-dee",
    culturalNotes: "Conceito chave que orienta as cooperativas agr\xEDcolas tradicionais e reuni\xF5es de cl\xE3 no norte de Angola.",
    contributorName: "Nkosi Kinzambi",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-17T16:00:00Z",
    status: "Aprovada",
    votes: { correct: 42, incorrect: 0, hearts: 36 },
    searchCount: 280,
    reportsCount: 0
  },
  // COKWE ENTRIES
  {
    id: "cok-1",
    word: "Moyo",
    translation: "Ol\xE1 / Vida / Sauda\xE7\xE3o de b\xEAn\xE7\xE3o",
    language: "cokwe",
    targetLanguage: "pt",
    meaning: "Sauda\xE7\xE3o que celebra a vida e a respira\xE7\xE3o; tamb\xE9m significa o sopro vital.",
    examples: [
      { phrase: "Moyo wenu, mandumbu!", translation: "Sauda\xE7\xF5es com vida, irm\xE3os e irm\xE3s!" }
    ],
    pronunciation: "Moh-yoh",
    culturalNotes: "Em Cokwe, saudar algu\xE9m \xE9 reconhecer que a energia da vida nos mant\xE9m conectados aos ancestrais.",
    contributorName: "Mwata Muatchissengue",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-09T11:20:00Z",
    status: "Aprovada",
    votes: { correct: 50, incorrect: 0, hearts: 44 },
    searchCount: 430,
    reportsCount: 0
  },
  {
    id: "cok-2",
    word: "Zukwenu",
    translation: "Obrigado / Bem haja",
    language: "cokwe",
    targetLanguage: "pt",
    meaning: "Express\xE3o de gratid\xE3o em Tchokwe para com um anfitri\xE3o ou companheiro.",
    examples: [
      { phrase: "Zukwenu chinji ha mulonga uno.", translation: "Muito obrigado por este gesto nobre." }
    ],
    pronunciation: "Zoo-kweh-noo",
    culturalNotes: "Utilizado com particular rever\xEAncia durante a partilha de ca\xE7a e nas festividades da corte tradicional.",
    contributorName: "Tchissola Muacanhica",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-16T12:40:00Z",
    status: "Aprovada",
    votes: { correct: 35, incorrect: 0, hearts: 28 },
    searchCount: 220,
    reportsCount: 0
  },
  {
    id: "cok-3",
    word: "Samanyonga",
    translation: "O Pensador / Aquele que medita",
    language: "cokwe",
    targetLanguage: "pt",
    meaning: 'O vener\xE1vel anci\xE3o representado na c\xE9lebre estatueta "O Pensador", meditando sobre os enigmas da exist\xEAncia.',
    examples: [
      { phrase: "Samanyonga kali chilweza cha mana jetu.", translation: "O Pensador \xE9 o espelho da nossa sabedoria ancestral." }
    ],
    pronunciation: "Sah-mah-nyohn-gah",
    culturalNotes: "Obra-prima da escultura Cokwe mundialmente reconhecida como s\xEDmbolo da filosofia e alma de Angola.",
    contributorName: "Mwata Muatchissengue",
    contributorLevel: "Embaixador da L\xEDngua",
    createdAt: "2026-01-24T17:00:00Z",
    status: "Aprovada",
    votes: { correct: 72, incorrect: 0, hearts: 66 },
    searchCount: 650,
    reportsCount: 0
  },
  // KWANYAMA ENTRIES
  {
    id: "kwa-1",
    word: "Wa aluka",
    translation: "Ol\xE1 / Como est\xE1s? / S\xEA bem-vindo",
    language: "kwanyama",
    targetLanguage: "pt",
    meaning: "Sauda\xE7\xE3o comum no Cunene ao encontrar algu\xE9m na aldeia.",
    examples: [
      { phrase: "Wa aluka nawa, mukwetu?", translation: "Est\xE1s bem de sa\xFAde, companheiro?" }
    ],
    pronunciation: "Wah ah-loo-kah",
    culturalNotes: 'A resposta habitual \xE9 "Ame onda aluka nawa" (Eu estou bem de sa\xFAde).',
    contributorName: "Nghituwamhata Haimbodi",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-11T13:00:00Z",
    status: "Aprovada",
    votes: { correct: 29, incorrect: 0, hearts: 21 },
    searchCount: 195,
    reportsCount: 0
  },
  {
    id: "kwa-2",
    word: "Tangi",
    translation: "Obrigado / Agrade\xE7o",
    language: "kwanyama",
    targetLanguage: "pt",
    meaning: "Express\xE3o de gratid\xE3o e reconhecimento no Cunene.",
    examples: [
      { phrase: "Tangi unene kelombwelo loye.", translation: "Muito obrigado pela tua s\xE1bia orienta\xE7\xE3o." }
    ],
    pronunciation: "Tahn-gee",
    culturalNotes: "Simples, direto e amplamente falado em toda a bacia do rio Cuvelai.",
    contributorName: "Nghituwamhata Haimbodi",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-23T15:30:00Z",
    status: "Aprovada",
    votes: { correct: 28, incorrect: 0, hearts: 19 },
    searchCount: 170,
    reportsCount: 0
  },
  // NGANGELA ENTRIES
  {
    id: "ngan-1",
    word: "Vukwenu",
    translation: "Obrigado / Sou grato",
    language: "ngangela",
    targetLanguage: "pt",
    meaning: "Reconhecimento de gentileza e partilha nas terras do leste.",
    examples: [
      { phrase: "Vukwenu chikuma mu cizemo cove.", translation: "Muito obrigado pelo teu nobre amor." }
    ],
    pronunciation: "Voo-kweh-noo",
    culturalNotes: "Usado nas margens do Cuando e Cubango em celebra\xE7\xF5es de colheita.",
    contributorName: "Kavita Chissingui",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-27T10:15:00Z",
    status: "Aprovada",
    votes: { correct: 24, incorrect: 0, hearts: 18 },
    searchCount: 130,
    reportsCount: 0
  },
  // FIOTE ENTRIES
  {
    id: "fio-1",
    word: "Bika mbote",
    translation: "Fica em paz / At\xE9 logo",
    language: "fiote",
    targetLanguage: "pt",
    category: "Sauda\xE7\xF5es",
    meaning: "Despedida cordial e af\xE1vel em Cabinda.",
    examples: [
      { phrase: "Bika mbote, tutadiana mbazi.", translation: "Fica em paz, at\xE9 nos vermos amanh\xE3." }
    ],
    pronunciation: "Bee-kah mboh-teh",
    culturalNotes: "Reflete a do\xE7ura e tranquilidade da cultura do povo de Cabinda.",
    contributorName: "Manoelita Buanga",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-28T09:40:00Z",
    status: "Aprovada",
    votes: { correct: 22, incorrect: 0, hearts: 17 },
    searchCount: 145,
    reportsCount: 0
  },
  {
    id: "fio-2",
    word: "Matondo mingi",
    translation: "Muitos agradecimentos / Muito obrigado",
    language: "fiote",
    targetLanguage: "pt",
    category: "Cortesia",
    meaning: "Agradecimento sincero por acolhimento ou d\xE1diva.",
    examples: [
      { phrase: "Matondo mingi mu buza bwaku.", translation: "Muito obrigado pela tua amabilidade." }
    ],
    pronunciation: "Mah-tohn-doh meen-gee",
    culturalNotes: "Partilhado entre as variantes setentrionais do Kikongo no Maiombe e Cabinda.",
    contributorName: "Manoelita Buanga",
    contributorLevel: "Colaborador",
    createdAt: "2026-01-29T11:00:00Z",
    status: "Aprovada",
    votes: { correct: 25, incorrect: 0, hearts: 19 },
    searchCount: 160,
    reportsCount: 0
  },
  // LUVALE ENTRIES
  {
    id: "luv-1",
    word: "Sakuwila",
    translation: "Obrigado / Agrade\xE7o com apre\xE7o",
    language: "luvale",
    targetLanguage: "pt",
    category: "Cortesia",
    meaning: "Express\xE3o respeitosa de gratid\xE3o no leste de Angola, ao longo do rio Zambeze.",
    examples: [
      { phrase: "Sakuwila chinji, ndumbu yami.", translation: "Muito obrigado, meu irm\xE3o." }
    ],
    pronunciation: "Sah-koo-wee-lah",
    culturalNotes: "Utilizado em ocasi\xF5es formais de acolhimento e partilha de alimentos no Moxico.",
    contributorName: "Kasoma Chinyama",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-30T10:00:00Z",
    status: "Aprovada",
    votes: { correct: 31, incorrect: 0, hearts: 24 },
    searchCount: 180,
    reportsCount: 0
  },
  {
    id: "luv-2",
    word: "Likishi",
    translation: "M\xE1scara sagrada ancestral / Esp\xEDrito protetor",
    language: "luvale",
    targetLanguage: "pt",
    category: "Cultura & Filosofia",
    meaning: "Figura mascarada cerimonial que encarna a sabedoria e a for\xE7a dos antepassados nos ritos de inicia\xE7\xE3o Mukanda.",
    examples: [
      { phrase: "Likishi lya mwana-pwo linahiti.", translation: "A m\xE1scara Likishi de Mwana-pwo passou." }
    ],
    pronunciation: "Lee-kee-shee",
    culturalNotes: "Manifesta\xE7\xE3o cultural patrimonial dos povos Luvale e Cokwe, reconhecida pela sua mestria art\xEDstica e r\xEDtmica.",
    contributorName: "Kasoma Chinyama",
    contributorLevel: "Tradutor",
    createdAt: "2026-01-31T15:20:00Z",
    status: "Aprovada",
    votes: { correct: 44, incorrect: 0, hearts: 39 },
    searchCount: 290,
    reportsCount: 0
  },
  // NYANEKA ENTRIES
  {
    id: "nya-1",
    word: "Tyiwa",
    translation: "Bem / Em harmonia / Bom",
    language: "nyaneka",
    targetLanguage: "pt",
    category: "Sauda\xE7\xF5es",
    meaning: "Expressa sa\xFAde, paz, beleza e concord\xE2ncia nas terras altas da Serra da Chela e Lubango.",
    examples: [
      { phrase: "Kala tyiwa, mukwetu.", translation: "Fica bem, meu amigo." }
    ],
    pronunciation: "Tchee-wah",
    culturalNotes: "Sauda\xE7\xE3o habitual pastoral do povo Nyaneka-Humbi no planalto da Hu\xEDla.",
    contributorName: "Tchindele Chipenda",
    contributorLevel: "Tradutor",
    createdAt: "2026-02-01T08:30:00Z",
    status: "Aprovada",
    votes: { correct: 27, incorrect: 0, hearts: 20 },
    searchCount: 165,
    reportsCount: 0
  },
  {
    id: "nya-2",
    word: "Oupale",
    translation: "Assembleia comunit\xE1ria tradicional / Conselho dos mais velhos",
    language: "nyaneka",
    targetLanguage: "pt",
    category: "Sociedade & Tradi\xE7\xE3o",
    meaning: "Local sagrado e reuni\xE3o comunit\xE1ria onde se deliberam as decis\xF5es da aldeia e se resolvem lit\xEDgios com serenidade.",
    examples: [
      { phrase: "Ovanthu vehi voupale vatokola nawa.", translation: "As pessoas do conselho deliberaram com justi\xE7a." }
    ],
    pronunciation: "Oh-oo-pah-leh",
    culturalNotes: "Espa\xE7o an\xE1logo ao onjango umbundu, preservado com dignidade pelas comunidades pastoris da Hu\xEDla.",
    contributorName: "Tchindele Chipenda",
    contributorLevel: "Tradutor",
    createdAt: "2026-02-01T12:00:00Z",
    status: "Aprovada",
    votes: { correct: 33, incorrect: 0, hearts: 26 },
    searchCount: 210,
    reportsCount: 0
  },
  // MUHUMBI ENTRIES
  {
    id: "muh-1",
    word: "Omuhona",
    translation: "Senhor vener\xE1vel / Autoridade tradicional respeitada",
    language: "muhumbi",
    targetLanguage: "pt",
    category: "Sociedade & Tradi\xE7\xE3o",
    meaning: "T\xEDtulo de honra e respeito concedido ao chefe de fam\xEDlia ou l\xEDder tradicional na regi\xE3o do Cunene e Hu\xEDla.",
    examples: [
      { phrase: "Omuhona yetu wetupopila nombili.", translation: "O nosso senhor falou-nos com palavras de paz." }
    ],
    pronunciation: "Oh-moo-hoh-nah",
    culturalNotes: "T\xEDtulo tradicional bantu compartilhado no sul de Angola, indicando integridade e lideran\xE7a benevolente.",
    contributorName: "Haimbodi Nekwaya",
    contributorLevel: "Colaborador",
    createdAt: "2026-02-02T09:10:00Z",
    status: "Aprovada",
    votes: { correct: 26, incorrect: 0, hearts: 18 },
    searchCount: 140,
    reportsCount: 0
  },
  {
    id: "muh-2",
    word: "Okupandula",
    translation: "Agradecer com humildade / Dar gra\xE7as",
    language: "muhumbi",
    targetLanguage: "pt",
    category: "Cortesia",
    meaning: "Agradecimento ritual ou interpessoal pela colheita e pelo gado.",
    examples: [
      { phrase: "Tupandula oluhapu lwove.", translation: "Agradecemos as tuas boas palavras." }
    ],
    pronunciation: "Oh-koo-pahn-doo-lah",
    culturalNotes: "Pr\xE1tica de gratid\xE3o sagrada ligada \xE0 fertilidade da terra e sa\xFAde dos animais.",
    contributorName: "Haimbodi Nekwaya",
    contributorLevel: "Colaborador",
    createdAt: "2026-02-02T13:40:00Z",
    status: "Aprovada",
    votes: { correct: 22, incorrect: 0, hearts: 16 },
    searchCount: 125,
    reportsCount: 0
  },
  // PENDING COMMUNITY SUGGESTION DEMOS FOR MODERATION
  {
    id: "sug-pend-1",
    word: "Mwana-pwo",
    translation: "Jovem mulher / M\xE1scara de beleza feminina",
    language: "cokwe",
    targetLanguage: "pt",
    meaning: "Designa a jovem mulher e a emblem\xE1tica m\xE1scara de madeira que celebra os ideais de gra\xE7a e sabedoria matriarcal Cokwe.",
    examples: [
      { phrase: "Mwana-pwo apwa chifwanyisa cha ulema.", translation: "A Mwana-pwo \xE9 o s\xEDmbolo da dignidade feminina." }
    ],
    pronunciation: "Mwah-nah pwoh",
    culturalNotes: "Uma das mais belas m\xE1scaras rituais de Angola, usada em dan\xE7as cerimoniais de celebra\xE7\xE3o da fertilidade e harmonia.",
    contributorName: "Tchissola Muacanhica",
    contributorLevel: "Tradutor",
    createdAt: "2026-02-01T14:00:00Z",
    status: "Pendente",
    votes: { correct: 14, incorrect: 0, hearts: 12 },
    searchCount: 88,
    reportsCount: 0
  },
  {
    id: "sug-pend-2",
    word: "Kixikila",
    translation: "Sistema tradicional de poupan\xE7a comunit\xE1ria rotativa",
    language: "kimbundu",
    targetLanguage: "pt",
    meaning: "Associa\xE7\xE3o solid\xE1ria de entreajuda financeira onde cada membro contribui com um montante peri\xF3dico e recolhe a quota rotativa.",
    examples: [
      { phrase: "Makamba mami a bhanga kixikila kya ngondo.", translation: "Os meus amigos organizaram uma kixikila mensal." }
    ],
    pronunciation: "Kee-shee-kee-lah",
    culturalNotes: "Institui\xE7\xE3o financeira ancestral angolana ainda amplamente viva nos mercados e bairros de Luanda e de todo o pa\xEDs.",
    contributorName: "Ad\xE3o Domingos",
    contributorLevel: "Colaborador",
    createdAt: "2026-02-02T16:30:00Z",
    status: "Pendente",
    votes: { correct: 20, incorrect: 0, hearts: 18 },
    searchCount: 110,
    reportsCount: 0
  }
];
var MOCK_ADMIN_USER = {
  id: "usr-admin",
  name: "Mestre Kwanza (Linguista Chefe)",
  email: "avelinosampaio2001@gmail.com",
  nativeLanguages: ["kimbundu", "umbundu", "pt"],
  points: 480,
  level: "Embaixador da L\xEDngua",
  role: "admin",
  favorites: ["kimb-1", "kimb-3", "umb-2", "cok-3"],
  history: [
    {
      id: "h-1",
      sourceText: "Bom dia a todos os meus irm\xE3os",
      sourceLang: "pt",
      targetText: "Kiambote kya menha makamba mami moso",
      targetLang: "kimbundu",
      timestamp: "2026-02-03T08:15:00Z",
      phonetic: "Kee-ahm-boh-teh kyah meh-nyah mah-kahm-bah mah-mee moh-soh",
      isAi: false
    },
    {
      id: "h-2",
      sourceText: "Agrade\xE7o de todo o cora\xE7\xE3o por esta b\xEAn\xE7\xE3o",
      sourceLang: "pt",
      targetText: "Ndapandula lutima lwange luosi kwo cisambu cino",
      targetLang: "umbundu",
      timestamp: "2026-02-03T09:30:00Z",
      phonetic: "Ndah-pahn-doo-lah loo-tee-mah lwahn-geh loo-oh-see kwoh chee-sahm-boo chee-noh",
      isAi: true
    }
  ],
  contributionsCount: 18,
  approvedCount: 16,
  badges: ["Pioneiro da Plataforma", "Especialista em Kimbundu", "Guardi\xE3o Bantu", "Voz da Comunidade"]
};
var MOCK_COMMUNITY_USERS = [
  {
    id: "usr-1",
    name: "Dra. Kieza Malanje",
    email: "kieza@tradutorangola.ao",
    nativeLanguages: ["kimbundu", "pt"],
    points: 320,
    level: "Embaixador da L\xEDngua",
    role: "user",
    favorites: ["kimb-1", "kimb-2"],
    history: [],
    contributionsCount: 22,
    approvedCount: 20,
    badges: ["Pioneira Kimbundu", "Top Contribuidora"]
  },
  {
    id: "usr-2",
    name: "Dr. Chivukuvuku Silva",
    email: "chivukuvuku@tradutorangola.ao",
    nativeLanguages: ["umbundu", "pt"],
    points: 275,
    level: "Embaixador da L\xEDngua",
    role: "user",
    favorites: ["umb-1", "umb-4"],
    history: [],
    contributionsCount: 19,
    approvedCount: 18,
    badges: ["Guardi\xE3o do Planalto", "Mestre Umbundu"]
  },
  {
    id: "usr-3",
    name: "Mwata Muatchissengue",
    email: "mwata@tradutorangola.ao",
    nativeLanguages: ["cokwe", "luvale", "pt"],
    points: 190,
    level: "Embaixador da L\xEDngua",
    role: "user",
    favorites: ["cok-1", "cok-3"],
    history: [],
    contributionsCount: 14,
    approvedCount: 12,
    badges: ["Guardi\xE3o Cokwe", "S\xE1bio Samanyonga"]
  },
  {
    id: "usr-4",
    name: "Nkosi Kinzambi",
    email: "nkosi@tradutorangola.ao",
    nativeLanguages: ["kikongo", "fiote", "pt"],
    points: 140,
    level: "Tradutor",
    role: "user",
    favorites: ["kik-1", "kik-3"],
    history: [],
    contributionsCount: 9,
    approvedCount: 8,
    badges: ["Voz de Mbanza Congo"]
  }
];
var INITIAL_SONGS = [
  {
    id: "song-1",
    title: "Mona Ki Ngi Xica",
    artist: "Bonga Kwenda",
    language: "kimbundu",
    genre: "Semba / Lamento Tradicional",
    platformUrl: "https://www.youtube.com/watch?v=W3c4M1VqG-U",
    youtubeId: "W3c4M1VqG-U",
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
    translatedLyrics: `A crian\xE7a que eu deixo
Com quem \xE9 que a deixo?
Deixo-a com Deus
E Deus deixa-me com quem?

Deixo o meu filho
A crian\xE7a que deixo
Neste mundo
Que est\xE1 repleto de sofrimentos

Eu tenho que partir
Saio da nossa terra
Da nossa casa natal
Onde ficou todo o nosso povo`,
    verses: [
      {
        original: "Mona ki ngi xica / Ngi mu xica ni nanyi?",
        translation: "A crian\xE7a que eu deixo / Com quem \xE9 que a deixo?"
      },
      {
        original: "Ngi mu xica ni Nzambi / Nzambi mu ngi xica ni nanyi?",
        translation: "Deixo-a com Deus / E Deus deixa-me com quem?"
      },
      {
        original: "Ngi xica o mona / Mu ngongo yoyo wezala ni jingongo",
        translation: "Deixo o meu filho / Neste mundo repleto de sofrimentos"
      },
      {
        original: "Eme ngi yile / Ku bata yetu kwa xala o mundu woso",
        translation: "Eu tenho que partir / Na nossa terra natal ficou todo o nosso povo"
      }
    ],
    culturalContext: 'Gravada em 1972 no \xE1lbum hist\xF3rico "Angola 72", esta can\xE7\xE3o \xE9 um dos maiores s\xEDmbolos do lamento, da saudade e da resist\xEAncia do povo angolano. Retrata a dor do emigrante ou combatente obrigado a abandonar a sua terra e os seus filhos.',
    contributorName: "Professor Ndombele",
    contributorId: "usr-admin",
    createdAt: "2026-02-10T10:00:00Z",
    status: "Aprovada",
    likesCount: 148
  },
  {
    id: "song-2",
    title: "Muxima",
    artist: "Liceu Vieira Dias & N\u2019gola Ritmos",
    language: "kimbundu",
    genre: "Semba / Can\xE7\xE3o Devocional",
    platformUrl: "https://www.youtube.com/watch?v=kYv_3jV3pZg",
    youtubeId: "kYv_3jV3pZg",
    originalLyrics: `Kala ngi muene Mam\xE3 Muxima
Ngata mu tunda, ngata mu vutuka
Ngana Nzambi weza
Ku muxima wami

Kusambila mu nzo ya Nzambi
Nzambi ya Angola yetu
Twa mu bhinga ombembwa
Ni kuzola kwa vwalende`,
    translatedLyrics: `Sempre que contemplo a M\xE3e Muxima
Vou e volto com o cora\xE7\xE3o consolado
O Senhor Deus faz-se presente
No \xEDntimo do meu cora\xE7\xE3o

Em ora\xE7\xE3o na casa de Deus
O Deus da nossa Angola
Pedimos-Lhe a paz
E o amor fraterno para todo o sempre`,
    verses: [
      {
        original: "Kala ngi muene Mam\xE3 Muxima / Ngata mu tunda, ngata mu vutuka",
        translation: "Sempre que contemplo a M\xE3e Muxima / Vou e volto com o cora\xE7\xE3o consolado"
      },
      {
        original: "Ngana Nzambi weza ku muxima wami",
        translation: "O Senhor Deus faz-se presente no \xEDntimo do meu cora\xE7\xE3o"
      },
      {
        original: "Twa mu bhinga ombembwa ni kuzola kwa vwalende",
        translation: "Pedimos-Lhe a paz e o amor fraterno para todo o sempre"
      }
    ],
    culturalContext: "Hino intemporal de Angola em honra de Nossa Senhora da Muxima (no rio Kwanza). O grupo Ngola Ritmos liderado por Liceu Vieira Dias nacionalizou o som angolano ao introduzir a l\xEDngua kimbundu com instrumentos tradicionais.",
    contributorName: "Dra. Kieza Malanje",
    contributorId: "usr-1",
    createdAt: "2026-02-12T14:30:00Z",
    status: "Aprovada",
    likesCount: 122
  },
  {
    id: "song-3",
    title: "Kalunga Ka Mbande (Paz no Planalto)",
    artist: "Coral Tradicional do Planalto Central",
    language: "umbundu",
    genre: "M\xFAsica Tradicional Ovimbundu",
    platformUrl: "https://www.youtube.com/watch?v=uK1X_jB2sK8",
    youtubeId: "uK1X_jB2sK8",
    originalLyrics: `Kalunga ciwa kokuene vosi
Epata lietu li sangiwe
Ocisola cange ka ci pu
Kofeka yetu ya Huambo

Ombembwa yi kale kokuene
Sekulu vosi va sanjuke
Tukalingila vonjango
Oku sanga olondunge`,
    translatedLyrics: `Sauda\xE7\xF5es de paz para todos v\xF3s
Que a nossa fam\xEDlia esteja reunida
O meu amor nunca ter\xE1 fim
Pela nossa terra do Huambo

Que a paz reine entre v\xF3s
Que todos os anci\xE3os se alegrem
Vamos todos reunir-nos no onjango
Para partilhar a sabedoria ancestral`,
    verses: [
      {
        original: "Kalunga ciwa kokuene vosi / Epata lietu li sangiwe",
        translation: "Sauda\xE7\xF5es de paz para todos v\xF3s / Que a nossa fam\xEDlia esteja reunida"
      },
      {
        original: "Ocisola cange ka ci pu kofeka yetu",
        translation: "O meu amor nunca ter\xE1 fim pela nossa terra"
      },
      {
        original: "Tukalingila vonjango oku sanga olondunge",
        translation: "Vamos todos reunir-nos no onjango para partilhar a sabedoria"
      }
    ],
    culturalContext: "Can\xE7\xE3o de tert\xFAlia comunit\xE1ria que celebra o retorno \xE0 aldeia e a reuni\xE3o no onjango (tribunal e assembleia tradicional do povo Ovimbundu).",
    contributorName: "Dr. Chivukuvuku Silva",
    contributorId: "usr-2",
    createdAt: "2026-02-14T11:00:00Z",
    status: "Aprovada",
    likesCount: 95
  },
  {
    id: "song-4",
    title: "Nzambi Mpungu Tulendo",
    artist: "Grupo Folcl\xF3rico de Mbanza Kongo",
    language: "kikongo",
    genre: "Espiritual Tradicional / Rumba Antiga",
    platformUrl: "https://www.youtube.com/watch?v=Vl0gX9b3yK8",
    youtubeId: "Vl0gX9b3yK8",
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
Na nossa caminhada de supera\xE7\xE3o
Falamos e vivemos em uni\xE3o comunit\xE1ria

A nossa Mbanza Kongo sagrada
A nossa hospitalidade nunca findar\xE1
Volt\xE1mos a unir-nos em fraternidade
Para reconstruir a nossa na\xE7\xE3o`,
    verses: [
      {
        original: "Nzambi Mpungu Tulendo / Sadisa bana ba nsi",
        translation: "Deus Todo-Poderoso e Soberano / Ajuda os filhos desta terra"
      },
      {
        original: "Tuvovele kintwadi mu tunga nsi yetu",
        translation: "Falamos e vivemos em uni\xE3o para construir a nossa na\xE7\xE3o"
      }
    ],
    culturalContext: "C\xE2ntico solene na l\xEDngua kikongo que evoca as mem\xF3rias da capital hist\xF3rica do Reino do Congo e invoca a fraternidade (Kintwadi).",
    contributorName: "Nkosi Kinzambi",
    contributorId: "usr-4",
    createdAt: "2026-02-16T16:20:00Z",
    status: "Aprovada",
    likesCount: 88
  },
  {
    id: "song-pend-1",
    title: "Cisemo ca Samanyonga",
    artist: "Tchissola & Os Filhos do Leste",
    language: "cokwe",
    genre: "M\xFAsica Tradicional Cokwe / Marimba",
    platformUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    originalLyrics: `Moyo wenu mandumbu
Samanyonga kali ha mana
Zukwenu kuli vayeze
Twasangulukila hamwe`,
    translatedLyrics: `Sauda\xE7\xF5es de vida, irm\xE3os
O Pensador est\xE1 sereno na sabedoria
Agradecemos a todos os visitantes
Estamos felizes por estarmos unidos`,
    verses: [
      {
        original: "Moyo wenu mandumbu / Samanyonga kali ha mana",
        translation: "Sauda\xE7\xF5es de vida, irm\xE3os / O Pensador est\xE1 sereno na sabedoria"
      },
      {
        original: "Zukwenu kuli vayeze / Twasangulukila hamwe",
        translation: "Agradecemos a todos os visitantes / Estamos felizes por estarmos unidos"
      }
    ],
    culturalContext: "Can\xE7\xE3o de boas-vindas com marimbas e tambores das Lundas, aguardando aprova\xE7\xE3o para o acervo oficial.",
    contributorName: "Tchissola Muacanhica",
    contributorId: "usr-3",
    createdAt: "2026-02-18T10:00:00Z",
    status: "Pendente",
    likesCount: 14
  }
];
var DEFAULT_MONETIZATION_SETTINGS = {
  adsenseEnabled: false,
  adsensePublisherId: "ca-pub-XXXXXXXXXXXXXXX",
  customBannersEnabled: true,
  sidebarAdsEnabled: true,
  sidebarRotationInterval: 7,
  // 7 segundos de transição automática no carrossel
  sidebarLeftActive: true,
  sidebarRightActive: true,
  multicaixaDonationsEnabled: true,
  multicaixaEntity: "00123",
  multicaixaNumber: "923 000 000"
};
var INITIAL_ADS = [
  {
    id: "ad-unitel-1",
    title: "Unitel 5G \xB7 Conectando Angola de Cabinda ao Cunene",
    sponsorName: "Unitel Angola",
    description: "A internet mais r\xE1pida do pa\xEDs para estudar, traduzir e valorizar o patrim\xF3nio lingu\xEDstico angolano em qualquer prov\xEDncia.",
    badgeText: "Patrocinador Oficial",
    ctaText: "Aderir ao Plano Jovem",
    targetUrl: "https://www.unitel.ao",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    placement: "top_leaderboard",
    isActive: true,
    impressionsCount: 1420,
    clicksCount: 184,
    category: "telecom"
  },
  {
    id: "ad-bfa-side-1",
    title: "BFA \xB7 Conta Jovem & BFA App Directo",
    sponsorName: "Banco de Fomento Angola",
    description: "Abra a sua conta banc\xE1ria sem filas e fa\xE7a transfer\xEAncias Multicaixa Express em segundos pelo telem\xF3vel.",
    badgeText: "Parceiro Financeiro",
    ctaText: "Abrir Conta no BFA",
    targetUrl: "https://www.bfa.ao",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    placement: "sidebar_left",
    isActive: true,
    impressionsCount: 1150,
    clicksCount: 142,
    category: "banco",
    rotationWeight: 10
  },
  {
    id: "ad-academia-side-2",
    title: "Academia Bantu \xB7 Cursos Online com Professores Nativos",
    sponsorName: "Academia Bantu de Angola",
    description: "Aprenda Kimbundu, Umbundu, Kikongo ou Cokwe com aulas ao vivo, materiais de apoio e certificado oficial.",
    badgeText: "Educa\xE7\xE3o Bantu",
    ctaText: "Inscrever no Curso",
    targetUrl: "https://tradutornacional.ao",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    placement: "sidebar_right",
    isActive: true,
    impressionsCount: 980,
    clicksCount: 135,
    category: "educacao",
    rotationWeight: 10
  },
  {
    id: "ad-africell-side-3",
    title: "Africell \xB7 Pacote Estudante com Dados B\xF3nus",
    sponsorName: "Africell Angola",
    description: "Mais internet para pesquisas escolares e tradu\xE7\xE3o em tempo real das l\xEDnguas tradicionais angolanas.",
    badgeText: "Tecnologia Jovem",
    ctaText: "Ver Planos Africell",
    targetUrl: "https://www.africell.ao",
    imageUrl: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80",
    placement: "sidebar_left",
    isActive: true,
    impressionsCount: 860,
    clicksCount: 94,
    category: "telecom",
    rotationWeight: 8
  },
  {
    id: "ad-livraria-side-4",
    title: "Editora das Letras \xB7 Dicion\xE1rios e Livros de Angola",
    sponsorName: "Livraria & Cultura Luanda",
    description: "Manuais escolares e gram\xE1ticas de L\xEDnguas Nacionais com entrega ao domic\xEDlio em Luanda e capitais de prov\xEDncia.",
    badgeText: "Livros e Cultura",
    ctaText: "Comprar Dicion\xE1rio",
    targetUrl: "https://tradutornacional.ao",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    placement: "sidebar_right",
    isActive: true,
    impressionsCount: 740,
    clicksCount: 88,
    category: "cultura",
    rotationWeight: 8
  },
  {
    id: "ad-bai-1",
    title: "Fundo BAI Cultura \xB7 Apoio \xE0s L\xEDnguas Nacionais",
    sponsorName: "Banco BAI",
    description: "Acreditamos na for\xE7a da identidade angolana. Conhe\xE7a as bolsas de investiga\xE7\xE3o e publica\xE7\xF5es em Kimbundu, Umbundu e Kikongo.",
    badgeText: "Mecenas Cultural",
    ctaText: "Conhecer Projetos BAI",
    targetUrl: "https://www.bancobai.ao",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    placement: "native_feed",
    isActive: true,
    impressionsCount: 960,
    clicksCount: 112,
    category: "banco"
  },
  {
    id: "ad-taag-1",
    title: "TAAG \xB7 Conhe\xE7a a Diversidade Cultural das 18 Prov\xEDncias",
    sponsorName: "TAAG Linhas A\xE9reas de Angola",
    description: "Voe para o Huambo, Hu\xEDla, Malanje ou U\xEDge com tarifas especiais de fim de semana e mergulhe nas tradi\xE7\xF5es da nossa terra.",
    badgeText: "Parceiro de Viagens",
    ctaText: "Reservar Voo Nacional",
    targetUrl: "https://www.taag.com",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",
    placement: "bottom_bar",
    isActive: true,
    impressionsCount: 820,
    clicksCount: 95,
    category: "turismo"
  },
  {
    id: "ad-africell-1",
    title: "Africell \xB7 Mais Dados para Navegar no Tradutor Nacional",
    sponsorName: "Africell Angola",
    description: "Pacotes sociais com acesso gr\xE1tis a plataformas educativas e de preserva\xE7\xE3o da cultura bantu angolana.",
    badgeText: "Apoio Digital",
    ctaText: "Ver Tarif\xE1rios",
    targetUrl: "https://www.africell.ao",
    imageUrl: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80",
    placement: "translator_box",
    isActive: true,
    impressionsCount: 650,
    clicksCount: 78,
    category: "telecom"
  }
];

// src/server/authDb.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
var DB_DIR = path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DB_DIR, "security_db.json");
var INITIAL_SALT = "a8f3b2075c1209eb47c94ef35b87192ad41c48e8a60965d13b482e9871032c54";
var INITIAL_HASH = "7cb83615d7ecc9212fe962a572e97ca9d91e10063296e5afe0e39a148cab348ad62b2f941f656c5a2ec5bcaa4379dc48a9ad297ffc86745006708888be9b7c29";
function hashPassword(password, salt) {
  const generatedSalt = salt || crypto.randomBytes(32).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, generatedSalt, 1e5, 64, "sha512");
  return {
    salt: generatedSalt,
    hash: derivedKey.toString("hex")
  };
}
function timingSafeVerify(password, salt, storedHash) {
  try {
    const derivedKey = crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512");
    const derivedHash = derivedKey.toString("hex");
    const bufA = Buffer.from(derivedHash, "hex");
    const bufB = Buffer.from(storedHash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}
function readSecurityDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        admin: {
          username: "admin",
          salt: INITIAL_SALT,
          hash: INITIAL_HASH,
          iterations: 1e5,
          digest: "sha512",
          role: "superadmin",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          failedAttempts: 0,
          lockoutUntil: null
        },
        sessions: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.admin || !parsed.admin.hash) {
      throw new Error("Database schema invalid");
    }
    return parsed;
  } catch (err) {
    console.error("Error reading security database file, creating safe fallback:", err);
    const fallbackDb = {
      admin: {
        username: "admin",
        salt: INITIAL_SALT,
        hash: INITIAL_HASH,
        iterations: 1e5,
        digest: "sha512",
        role: "superadmin",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        failedAttempts: 0,
        lockoutUntil: null
      },
      sessions: {}
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), "utf-8");
    } catch (e) {
    }
    return fallbackDb;
  }
}
function writeSecurityDb(db) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Failed to write security database to file:", err);
  }
}
function verifyAdminLogin(password) {
  const db = readSecurityDb();
  const now = Date.now();
  if (db.admin.lockoutUntil && db.admin.lockoutUntil > now) {
    const diffMs = db.admin.lockoutUntil - now;
    const remainingMinutes = Math.ceil(diffMs / (60 * 1e3));
    return {
      success: false,
      locked: true,
      remainingMinutes,
      error: `Painel administrativo temporariamente bloqueado por motivos de seguran\xE7a. Tente novamente em ${remainingMinutes} minuto(s).`
    };
  }
  const isValid = timingSafeVerify(password, db.admin.salt, db.admin.hash);
  if (!isValid) {
    db.admin.failedAttempts = (db.admin.failedAttempts || 0) + 1;
    const maxAttempts = 5;
    if (db.admin.failedAttempts >= maxAttempts) {
      db.admin.lockoutUntil = now + 15 * 60 * 1e3;
      writeSecurityDb(db);
      return {
        success: false,
        locked: true,
        remainingMinutes: 15,
        error: "Limite de tentativas excedido (5 tentativas falhadas). O painel foi bloqueado por 15 minutos."
      };
    }
    const remaining = maxAttempts - db.admin.failedAttempts;
    writeSecurityDb(db);
    return {
      success: false,
      remainingAttempts: remaining,
      error: `Senha incorreta. Restam ${remaining} tentativa(s) antes do bloqueio tempor\xE1rio.`
    };
  }
  db.admin.failedAttempts = 0;
  db.admin.lockoutUntil = null;
  const token = crypto.randomBytes(32).toString("hex");
  const sessionDurationMs = 8 * 60 * 60 * 1e3;
  const expiresAt = now + sessionDurationMs;
  for (const [sToken, sData] of Object.entries(db.sessions)) {
    if (sData.expiresAt < now) {
      delete db.sessions[sToken];
    }
  }
  db.sessions[token] = {
    username: db.admin.username,
    createdAt: now,
    expiresAt
  };
  writeSecurityDb(db);
  return {
    success: true,
    token,
    expiresAt
  };
}
function validateSessionToken(token) {
  if (!token) return false;
  const db = readSecurityDb();
  const session = db.sessions[token];
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    writeSecurityDb(db);
    return false;
  }
  return true;
}
function revokeSessionToken(token) {
  if (!token) return false;
  const db = readSecurityDb();
  if (db.sessions[token]) {
    delete db.sessions[token];
    writeSecurityDb(db);
    return true;
  }
  return false;
}
function changeAdminPassword(currentPass, newPass) {
  if (!newPass || newPass.length < 8) {
    return {
      success: false,
      error: "A nova senha deve ter no m\xEDnimo 8 caracteres, com letras, n\xFAmeros ou caracteres especiais."
    };
  }
  const db = readSecurityDb();
  const isCurrentValid = timingSafeVerify(currentPass, db.admin.salt, db.admin.hash);
  if (!isCurrentValid) {
    return {
      success: false,
      error: "A senha atual informada est\xE1 incorreta."
    };
  }
  const { salt, hash } = hashPassword(newPass);
  db.admin.salt = salt;
  db.admin.hash = hash;
  db.admin.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.admin.failedAttempts = 0;
  db.admin.lockoutUntil = null;
  db.sessions = {};
  writeSecurityDb(db);
  return {
    success: true,
    message: "Senha do painel administrativo atualizada com sucesso na base de dados com criptografia PBKDF2."
  };
}
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token;
  }
  if (!token || !validateSessionToken(token)) {
    return res.status(401).json({
      error: "Acesso restrito ao Painel Administrativo. Autentica\xE7\xE3o necess\xE1ria.",
      code: "UNAUTHORIZED_ADMIN"
    });
  }
  next();
}

// src/server/realtimeServer.ts
import { WebSocketServer, WebSocket } from "ws";
var wss = null;
var sseClients = /* @__PURE__ */ new Set();
function initRealtimeServer(server) {
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws, req) => {
    const initEvent = {
      type: "init",
      payload: {
        onlineCount: getOnlineUsersCount(),
        connectedAt: Date.now(),
        mode: "websocket"
      },
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(initEvent));
    broadcastRealtimeEvent("presence:update", {
      onlineCount: getOnlineUsersCount()
    });
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch (e) {
      }
    });
    ws.on("close", () => {
      broadcastRealtimeEvent("presence:update", {
        onlineCount: getOnlineUsersCount()
      });
    });
    ws.on("error", (err) => {
      console.warn("WebSocket client error:", err.message);
    });
  });
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const extWs = ws;
      if (extWs.isAlive === false) {
        return ws.terminate();
      }
      extWs.isAlive = false;
      ws.ping();
    });
  }, 3e4);
  wss.on("close", () => {
    clearInterval(interval);
  });
  console.log("\u26A1 Realtime WebSocket & Event Engine initialized on /ws");
  return wss;
}
function getOnlineUsersCount() {
  const wsCount = wss ? wss.clients.size : 0;
  const sseCount = sseClients.size;
  return Math.max(1, wsCount + sseCount);
}
function broadcastRealtimeEvent(type, payload) {
  const event = {
    type,
    payload,
    timestamp: Date.now()
  };
  const serialized = JSON.stringify(event);
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(serialized);
        } catch (e) {
          console.warn("Error sending to websocket client:", e);
        }
      }
    });
  }
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${serialized}

`);
    } catch (e) {
      sseClients.delete(res);
    }
  });
}
function handleSseRoute(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write(": connected\n\n");
  sseClients.add(res);
  broadcastRealtimeEvent("presence:update", {
    onlineCount: getOnlineUsersCount()
  });
  const initPayload = {
    type: "init",
    payload: {
      onlineCount: getOnlineUsersCount(),
      connectedAt: Date.now(),
      mode: "sse"
    },
    timestamp: Date.now()
  };
  res.write(`data: ${JSON.stringify(initPayload)}

`);
  req.on("close", () => {
    sseClients.delete(res);
    broadcastRealtimeEvent("presence:update", {
      onlineCount: getOnlineUsersCount()
    });
  });
}

// src/utils/linguisticCorpus.ts
var CORPUS = {
  // KIMBUNDU
  "kimbundu": {
    "ol\xE1": {
      target: "Mbote",
      pronunciation: "M-boh-teh",
      culturalNote: "Sauda\xE7\xE3o comum e respeitosa em Kimbundu, invocando bem-estar e cordialidade.",
      breakdown: [{ term: "Mbote", meaning: "Sauda\xE7\xE3o que expressa bondade, paz e bem-estar." }]
    },
    "oi": {
      target: "Mbote",
      pronunciation: "M-boh-teh",
      culturalNote: "Sauda\xE7\xE3o comum e respeitosa em Kimbundu, invocando bem-estar e cordialidade.",
      breakdown: [{ term: "Mbote", meaning: "Sauda\xE7\xE3o que expressa bondade, paz e bem-estar." }]
    },
    "bom dia": {
      target: "Kime kya mbote",
      pronunciation: "Kee-meh kyah m-boh-teh",
      culturalNote: "Desejo tradicional de uma manh\xE3 aben\xE7oada e produtiva com paz no seio da comunidade.",
      breakdown: [
        { term: "Kime", meaning: "Manh\xE3 / aurora" },
        { term: "kya mbote", meaning: "de bem / boa / proveitosa" }
      ]
    },
    "boa tarde": {
      target: "Kumbi dya mbote",
      pronunciation: "Koom-bee dyah m-boh-teh",
      culturalNote: "Sauda\xE7\xE3o durante o decl\xEDnio do sol, desejando que a tarde traga descanso e harmonia.",
      breakdown: [
        { term: "Kumbi", meaning: "Sol / tarde" },
        { term: "dya mbote", meaning: "boa / agrad\xE1vel" }
      ]
    },
    "boa noite": {
      target: "Ufuku uambote",
      pronunciation: "Oo-foo-koo wahm-boh-teh",
      culturalNote: "B\xEAn\xE7\xE3o de repouso seguro sob a prote\xE7\xE3o ancestral dos mais velhos.",
      breakdown: [
        { term: "Ufuku", meaning: "Noite" },
        { term: "uambote", meaning: "boa / serena" }
      ]
    },
    "como est\xE1s": {
      target: "U kuambata kiambote?",
      pronunciation: "Oo koo-ahm-bah-tah kee-ahm-boh-teh?",
      culturalNote: "Express\xE3o de carinho e preocupa\xE7\xE3o genu\xEDna com a sa\xFAde f\xEDsica e espiritual do interlocutor.",
      breakdown: [
        { term: "U kuambata", meaning: "Como levas o teu estado" },
        { term: "kiambote", meaning: "bem / com sa\xFAde" }
      ]
    },
    "como estas": {
      target: "U kuambata kiambote?",
      pronunciation: "Oo koo-ahm-bah-tah kee-ahm-boh-teh?",
      culturalNote: "Express\xE3o de carinho e preocupa\xE7\xE3o genu\xEDna com a sa\xFAde f\xEDsica e espiritual do interlocutor.",
      breakdown: [
        { term: "U kuambata", meaning: "Como levas o teu estado" },
        { term: "kiambote", meaning: "bem / com sa\xFAde" }
      ]
    },
    "como voc\xEA est\xE1": {
      target: "U kuambata kiambote?",
      pronunciation: "Oo koo-ahm-bah-tah kee-ahm-boh-teh?",
      culturalNote: "Express\xE3o de carinho e preocupa\xE7\xE3o genu\xEDna com a sa\xFAde f\xEDsica e espiritual do interlocutor.",
      breakdown: [
        { term: "U kuambata", meaning: "Como levas o teu estado" },
        { term: "kiambote", meaning: "bem / com sa\xFAde" }
      ]
    },
    "tudo bem": {
      target: "Kima kyambote",
      pronunciation: "Kee-mah kyahm-boh-teh",
      culturalNote: "Confirma\xE7\xE3o afirmativa de que tudo corre em harmonia social e familiar.",
      breakdown: [
        { term: "Kima", meaning: "Coisa / tudo" },
        { term: "kyambote", meaning: "est\xE1 bom / em paz" }
      ]
    },
    "obrigado": {
      target: "Sakidila",
      pronunciation: "Sah-kee-dee-lah",
      culturalNote: "Pilar moral bantu de reciprocidade e gratid\xE3o entre semelhantes.",
      breakdown: [{ term: "Sakidila", meaning: "Agrade\xE7o / Sou grato de cora\xE7\xE3o" }]
    },
    "muito obrigado": {
      target: "Sakidila kyavulu",
      pronunciation: "Sah-kee-dee-lah kyah-voo-loo",
      culturalNote: "Express\xE3o de profunda gratid\xE3o que refor\xE7a o respeito e a estima m\xFAtua.",
      breakdown: [
        { term: "Sakidila", meaning: "Agrade\xE7o" },
        { term: "kyavulu", meaning: "muito / imensamente" }
      ]
    },
    "por favor": {
      target: "Ngikuatekesu",
      pronunciation: "Ngee-kwah-teh-keh-soo",
      culturalNote: "Pedido humilde de aux\xEDlio e solidariedade fraterna.",
      breakdown: [{ term: "Ngikuatekesu", meaning: "D\xE1-me o teu apoio / por gentileza" }]
    },
    "adeus": {
      target: "Tala kiambote",
      pronunciation: "Tah-lah kee-ahm-boh-teh",
      culturalNote: "Despedida afetuosa que deseja que a pessoa caminhe e viva em seguran\xE7a.",
      breakdown: [{ term: "Tala kiambote", meaning: "Fica bem / cuida-te" }]
    },
    "amor": {
      target: "Kuzola",
      pronunciation: "Koo-zoh-lah",
      culturalNote: "O amor como for\xE7a unificadora que protege o cl\xE3 e a linhagem familiar.",
      breakdown: [{ term: "Kuzola", meaning: "Amar / afei\xE7\xE3o pura" }]
    },
    "eu te amo": {
      target: "Nga ku zolo",
      pronunciation: "Ngah koo zoh-loh",
      culturalNote: "Declara\xE7\xE3o sincera de carinho e compromisso afetivo na cultura kimbundu.",
      breakdown: [
        { term: "Nga", meaning: "Eu" },
        { term: "ku zolo", meaning: "te amo / quero-te bem" }
      ]
    },
    "paz": {
      target: "Kutululuka",
      pronunciation: "Koo-too-loo-loo-kah",
      culturalNote: "Tranquilidade de esp\xEDrito e harmonia coletiva sem contendas na terra.",
      breakdown: [{ term: "Kutululuka", meaning: "Sossego / serenidade interior" }]
    },
    "amigo": {
      target: "Kamba",
      pronunciation: "Kahm-bah",
      culturalNote: "Termo c\xE9lebre angolano que define o verdadeiro irm\xE3o de alma e companheiro leal.",
      breakdown: [{ term: "Kamba", meaning: "Companheiro / c\xFAmplice na vida" }]
    },
    "fam\xEDlia": {
      target: "Kifuxi",
      pronunciation: "Kee-foo-shee",
      culturalNote: "O n\xFAcleo sagrado que preserva os ensinamentos e a mem\xF3ria dos antepassados.",
      breakdown: [{ term: "Kifuxi", meaning: "Linhagem / fam\xEDlia alargada" }]
    },
    "cora\xE7\xE3o": {
      target: "Muxima",
      pronunciation: "Moo-shee-mah",
      culturalNote: "Centro moral e afetivo do ser humano; nome do maior santu\xE1rio mariano de Angola.",
      breakdown: [{ term: "Muxima", meaning: "Cora\xE7\xE3o / alma dos sentimentos" }]
    },
    "deus": {
      target: "Nzambi",
      pronunciation: "N-zahm-bee",
      culturalNote: "O Criador Supremo do Universo e do homem na cosmologia bantu angolana.",
      breakdown: [{ term: "Nzambi", meaning: "Deus Todo-Poderoso" }]
    },
    "\xE1gua": {
      target: "Menha",
      pronunciation: "Meh-nyah",
      culturalNote: "Fonte vital da terra e s\xEDmbolo primordial de purifica\xE7\xE3o nos ritos tradicionais.",
      breakdown: [{ term: "Menha", meaning: "\xC1gua que d\xE1 vida" }]
    },
    "terra": {
      target: "Ixi",
      pronunciation: "Ee-shee",
      culturalNote: "O solo sagrado de Angola onde repousam as ra\xEDzes dos nossos ancestrais.",
      breakdown: [{ term: "Ixi", meaning: "P\xE1tria / solo / territ\xF3rio" }]
    },
    "casa": {
      target: "Inzo",
      pronunciation: "Een-zoh",
      culturalNote: "Lar e ref\xFAgio da fam\xEDlia onde se transmitem os valores aos mais novos.",
      breakdown: [{ term: "Inzo", meaning: "Habita\xE7\xE3o / abrigo familiar" }]
    }
  },
  // UMBUNDU
  "umbundu": {
    "ol\xE1": {
      target: "Kalunga",
      pronunciation: "Kah-loon-gah",
      culturalNote: "Sauda\xE7\xE3o nobre Ovimbundu de venera\xE7\xE3o e rever\xEAncia ao outro.",
      breakdown: [{ term: "Kalunga", meaning: "Sauda\xE7\xE3o solene de boas-vindas e vida" }]
    },
    "oi": {
      target: "Kalunga",
      pronunciation: "Kah-loon-gah",
      culturalNote: "Sauda\xE7\xE3o nobre Ovimbundu de venera\xE7\xE3o e rever\xEAncia ao outro.",
      breakdown: [{ term: "Kalunga", meaning: "Sauda\xE7\xE3o solene de boas-vindas e vida" }]
    },
    "bom dia": {
      target: "Om\u1EBDle yiwa",
      pronunciation: "Oh-meh-leh yee-wah",
      culturalNote: "Desejo de manh\xE3 pr\xF3spera no planalto central angolano.",
      breakdown: [
        { term: "Om\u1EBDle", meaning: "Manh\xE3" },
        { term: "yiwa", meaning: "boa / virtuosa" }
      ]
    },
    "boa tarde": {
      target: "Ekumbi liwa",
      pronunciation: "Eh-koom-bee lee-wah",
      culturalNote: "Desejo de tarde serena e cheia de colheitas frutuosas.",
      breakdown: [
        { term: "Ekumbi", meaning: "Tarde / sol" },
        { term: "liwa", meaning: "boa / ben\xE9fica" }
      ]
    },
    "boa noite": {
      target: "Uteke uwa",
      pronunciation: "Oo-teh-keh oo-wah",
      culturalNote: "Desejo de noite tranquila e sono restaurador sob a guarda divina.",
      breakdown: [
        { term: "Uteke", meaning: "Noite" },
        { term: "uwa", meaning: "boa / em paz" }
      ]
    },
    "como est\xE1s": {
      target: "Wakolapo?",
      pronunciation: "Wah-koh-lah-poh?",
      culturalNote: "Pergunta calorosa sobre a sa\xFAde e a for\xE7a vital do interlocutor.",
      breakdown: [
        { term: "Wakolapo", meaning: "Tens for\xE7a / est\xE1s forte e com sa\xFAde?" }
      ]
    },
    "como estas": {
      target: "Wakolapo?",
      pronunciation: "Wah-koh-lah-poh?",
      culturalNote: "Pergunta calorosa sobre a sa\xFAde e a for\xE7a vital do interlocutor.",
      breakdown: [
        { term: "Wakolapo", meaning: "Tens for\xE7a / est\xE1s forte e com sa\xFAde?" }
      ]
    },
    "como voc\xEA est\xE1": {
      target: "Wakolapo?",
      pronunciation: "Wah-koh-lah-poh?",
      culturalNote: "Pergunta calorosa sobre a sa\xFAde e a for\xE7a vital do interlocutor.",
      breakdown: [
        { term: "Wakolapo", meaning: "Tens for\xE7a / est\xE1s forte e com sa\xFAde?" }
      ]
    },
    "tudo bem": {
      target: "Ndakolapo ciwa",
      pronunciation: "Ndah-koh-lah-poh chee-wah",
      culturalNote: "Resposta convicta de pleno vigor e satisfa\xE7\xE3o com a vida comunit\xE1ria.",
      breakdown: [
        { term: "Ndakolapo", meaning: "Estou firme" },
        { term: "ciwa", meaning: "muito bem" }
      ]
    },
    "obrigado": {
      target: "Ndapandula",
      pronunciation: "Ndah-pahn-doo-lah",
      culturalNote: "Reconhecimento cordial de b\xEAn\xE7\xE3o e benef\xEDcio recebido.",
      breakdown: [{ term: "Ndapandula", meaning: "Dou gra\xE7as / Agrade\xE7o" }]
    },
    "muito obrigado": {
      target: "Ndapandula calua",
      pronunciation: "Ndah-pahn-doo-lah kah-loo-ah",
      culturalNote: "Express\xE3o de intensa gratid\xE3o que estreita os la\xE7os de fraternidade.",
      breakdown: [
        { term: "Ndapandula", meaning: "Agrade\xE7o" },
        { term: "calua", meaning: "muito / imensamente" }
      ]
    },
    "por favor": {
      target: "Mekuatiso",
      pronunciation: "Meh-kwah-tee-soh",
      culturalNote: "Invoca\xE7\xE3o respeitosa de colabora\xE7\xE3o solid\xE1ria m\xFAtua.",
      breakdown: [{ term: "Mekuatiso", meaning: "Com a vossa prestimosa ajuda" }]
    },
    "adeus": {
      target: "Tukalim\xF5la",
      pronunciation: "Too-kah-lee-moh-lah",
      culturalNote: "Promessa de reencontro fraterno com esperan\xE7a no futuro.",
      breakdown: [{ term: "Tukalim\xF5la", meaning: "Voltaremos a ver-nos / At\xE9 logo" }]
    },
    "amor": {
      target: "Ocisola",
      pronunciation: "Oh-chee-soh-lah",
      culturalNote: "O amor abnegado e generoso que nutre a harmonia nas aldeias (imbos).",
      breakdown: [{ term: "Ocisola", meaning: "Afei\xE7\xE3o / amor sincero" }]
    },
    "paz": {
      target: "Ombembwa",
      pronunciation: "Ohm-behm-bwah",
      culturalNote: "O estado de reconcilia\xE7\xE3o, justi\xE7a e equil\xEDbrio primordial no Onjango.",
      breakdown: [{ term: "Ombembwa", meaning: "Paz / harmonia comunit\xE1ria" }]
    },
    "amigo": {
      target: "Ekamba",
      pronunciation: "Eh-kahm-bah",
      culturalNote: "Aquele que senta ao redor da fogueira comunit\xE1ria partilhando o saber.",
      breakdown: [{ term: "Ekamba", meaning: "Amigo de f\xE9 / companheiro" }]
    },
    "fam\xEDlia": {
      target: "Epata",
      pronunciation: "Eh-pah-tah",
      culturalNote: "O grande tronco familiar que abriga gera\xE7\xF5es de s\xE1bios e aprendizes.",
      breakdown: [{ term: "Epata", meaning: "Cl\xE3 familiar / parentela" }]
    },
    "deus": {
      target: "Suku",
      pronunciation: "Soo-koo",
      culturalNote: "O Criador do universo na espiritualidade tradicional dos Ovimbundu.",
      breakdown: [{ term: "Suku", meaning: "Deus / Senhor de todas as coisas" }]
    },
    "\xE1gua": {
      target: "Ovava",
      pronunciation: "Oh-vah-vah",
      culturalNote: "O manancial dos rios das montanhas do planalto que fecunda as lavras.",
      breakdown: [{ term: "Ovava", meaning: "\xC1gua pura" }]
    },
    "terra": {
      target: "Ofeka",
      pronunciation: "Oh-feh-kah",
      culturalNote: "O torr\xE3o natal de Angola onde nascemos e cultivamos a dignidade.",
      breakdown: [{ term: "Ofeka", meaning: "Pa\xEDs / na\xE7\xE3o / terra m\xE3e" }]
    },
    "casa": {
      target: "Onjo",
      pronunciation: "Ohn-joh",
      culturalNote: "O tecto acolhedor onde reina o respeito m\xFAtuo e a hospitalidade bantu.",
      breakdown: [{ term: "Onjo", meaning: "Casa / moradia" }]
    }
  },
  // KIKONGO
  "kikongo": {
    "ol\xE1": {
      target: "Mbote",
      pronunciation: "M-boh-teh",
      culturalNote: "A sauda\xE7\xE3o ancestral do hist\xF3rico Reino do Congo, desejando luz e sa\xFAde.",
      breakdown: [{ term: "Mbote", meaning: "Paz / ol\xE1 / bondade" }]
    },
    "oi": {
      target: "Mbote",
      pronunciation: "M-boh-teh",
      culturalNote: "A sauda\xE7\xE3o ancestral do hist\xF3rico Reino do Congo, desejando luz e sa\xFAde.",
      breakdown: [{ term: "Mbote", meaning: "Paz / ol\xE1 / bondade" }]
    },
    "bom dia": {
      target: "Mbote za mene",
      pronunciation: "M-boh-teh zah meh-neh",
      culturalNote: "Sauda\xE7\xE3o matinal desejando b\xEAn\xE7\xE3os ao acordar para mais um dia de vida.",
      breakdown: [
        { term: "Mbote", meaning: "Sauda\xE7\xF5es de bem" },
        { term: "za mene", meaning: "da manh\xE3" }
      ]
    },
    "boa tarde": {
      target: "Mbote za masika",
      pronunciation: "M-boh-teh zah mah-see-kah",
      culturalNote: "Votos de uma tarde serena enquanto o trabalho di\xE1rio se encerra.",
      breakdown: [
        { term: "Mbote", meaning: "Sauda\xE7\xF5es" },
        { term: "za masika", meaning: "da tarde" }
      ]
    },
    "boa noite": {
      target: "Mbote za fuku",
      pronunciation: "M-boh-teh zah foo-koo",
      culturalNote: "Prote\xE7\xE3o noturna para repouso sereno da fam\xEDlia e da comunidade.",
      breakdown: [
        { term: "Mbote", meaning: "Sauda\xE7\xF5es" },
        { term: "za fuku", meaning: "da noite" }
      ]
    },
    "como est\xE1s": {
      target: "Nkia nsangu?",
      pronunciation: "N-kee-ah n-sahn-goo?",
      culturalNote: "Inqu\xE9rito amistoso perguntando que boas not\xEDcias traz o interlocutor.",
      breakdown: [{ term: "Nkia nsangu", meaning: "Que novidades / Como est\xE1s?" }]
    },
    "como estas": {
      target: "Nkia nsangu?",
      pronunciation: "N-kee-ah n-sahn-goo?",
      culturalNote: "Inqu\xE9rito amistoso perguntando que boas not\xEDcias traz o interlocutor.",
      breakdown: [{ term: "Nkia nsangu", meaning: "Que novidades / Como est\xE1s?" }]
    },
    "como voc\xEA est\xE1": {
      target: "Nkia nsangu?",
      pronunciation: "N-kee-ah n-sahn-goo?",
      culturalNote: "Inqu\xE9rito amistoso perguntando que boas not\xEDcias traz o interlocutor.",
      breakdown: [{ term: "Nkia nsangu", meaning: "Que novidades / Como est\xE1s?" }]
    },
    "tudo bem": {
      target: "Nsangu zambote",
      pronunciation: "N-sahn-goo zahm-boh-teh",
      culturalNote: "Confirma\xE7\xE3o de que as not\xEDcias s\xE3o boas e o esp\xEDrito est\xE1 em paz.",
      breakdown: [{ term: "Nsangu zambote", meaning: "Boas not\xEDcias / Tudo em ordem" }]
    },
    "obrigado": {
      target: "Matondo",
      pronunciation: "Mah-tohn-doh",
      culturalNote: "Obrigado tradicional que reverencia a a\xE7\xE3o fraterna recebida.",
      breakdown: [{ term: "Matondo", meaning: "Gratid\xE3o / Agradecimento" }]
    },
    "muito obrigado": {
      target: "Matondo beni",
      pronunciation: "Mah-tohn-doh beh-nee",
      culturalNote: "Obrigado profundo que exalta a generosidade do outro com louvor.",
      breakdown: [
        { term: "Matondo", meaning: "Agradecimentos" },
        { term: "beni", meaning: "muito / em abund\xE2ncia" }
      ]
    },
    "por favor": {
      target: "Dodokolo",
      pronunciation: "Doh-doh-koh-loh",
      culturalNote: "F\xF3rmula de cortesia e respeito solene em Kikongo.",
      breakdown: [{ term: "Dodokolo", meaning: "Por merc\xEA / por favor" }]
    },
    "amor": {
      target: "Zola",
      pronunciation: "Zoh-lah",
      culturalNote: "Sentimento de devo\xE7\xE3o e afei\xE7\xE3o imorredoura na l\xEDngua dos Bakongo.",
      breakdown: [{ term: "Zola", meaning: "Amar / o amor" }]
    },
    "paz": {
      target: "Ngemba",
      pronunciation: "N-gehm-bah",
      culturalNote: "A serenidade suprema que afasta disc\xF3rdias e une as linhagens.",
      breakdown: [{ term: "Ngemba", meaning: "Paz sagrada / conc\xF3rdia" }]
    },
    "amigo": {
      target: "Nkundi",
      pronunciation: "N-koon-dee",
      culturalNote: "Irm\xE3o de escolha e companheiro insepar\xE1vel na jornada humana.",
      breakdown: [{ term: "Nkundi", meaning: "Amigo leal" }]
    },
    "fam\xEDlia": {
      target: "Kanda",
      pronunciation: "Kahn-dah",
      culturalNote: "A grande linhagem que liga os vivos, os nascituros e os ancestrais.",
      breakdown: [{ term: "Kanda", meaning: "Cl\xE3 ancestral / fam\xEDlia" }]
    },
    "deus": {
      target: "Nzambi Mpungu",
      pronunciation: "N-zahm-bee M-poon-goo",
      culturalNote: "O Deus Alt\xEDssimo dos antepassados do Congo e criador de todas as criaturas.",
      breakdown: [{ term: "Nzambi Mpungu", meaning: "Deus Supremo" }]
    }
  },
  // COKWE
  "cokwe": {
    "ol\xE1": {
      target: "Menekenu",
      pronunciation: "Meh-neh-keh-noo",
      culturalNote: "Sauda\xE7\xE3o nobre tradicional Lunda-Cokwe para dar as boas-vindas com honra.",
      breakdown: [{ term: "Menekenu", meaning: "Sauda\xE7\xF5es com honra e respeito" }]
    },
    "oi": {
      target: "Menekenu",
      pronunciation: "Meh-neh-keh-noo",
      culturalNote: "Sauda\xE7\xE3o nobre tradicional Lunda-Cokwe para dar as boas-vindas com honra.",
      breakdown: [{ term: "Menekenu", meaning: "Sauda\xE7\xF5es com honra e respeito" }]
    },
    "bom dia": {
      target: "Chimene chipema",
      pronunciation: "Chee-meh-neh chee-peh-mah",
      culturalNote: "B\xEAn\xE7\xE3o matinal desejando luz e for\xE7a para as tarefas do dia.",
      breakdown: [
        { term: "Chimene", meaning: "Manh\xE3" },
        { term: "chipema", meaning: "boa / pura" }
      ]
    },
    "boa tarde": {
      target: "Mweji upema",
      pronunciation: "Mweh-jee oo-peh-mah",
      culturalNote: "Votos de uma tarde produtiva e segura no leste angolano.",
      breakdown: [
        { term: "Mweji", meaning: "Tarde / sol" },
        { term: "upema", meaning: "boa" }
      ]
    },
    "boa noite": {
      target: "Ufuku upema",
      pronunciation: "Oo-foo-koo oo-peh-mah",
      culturalNote: "Desejo de noite tranquila e sono reconfortante sob a b\xEAn\xE7\xE3o divina.",
      breakdown: [
        { term: "Ufuku", meaning: "Noite" },
        { term: "upema", meaning: "boa e calma" }
      ]
    },
    "como est\xE1s": {
      target: "Mwali chipema?",
      pronunciation: "Mwah-lee chee-peh-mah?",
      culturalNote: "Inqu\xE9rito de respeito sobre o bem-estar e sa\xFAde do interlocutor.",
      breakdown: [{ term: "Mwali chipema", meaning: "Est\xE1s bem e de boa sa\xFAde?" }]
    },
    "como estas": {
      target: "Mwali chipema?",
      pronunciation: "Mwah-lee chee-peh-mah?",
      culturalNote: "Inqu\xE9rito de respeito sobre o bem-estar e sa\xFAde do interlocutor.",
      breakdown: [{ term: "Mwali chipema", meaning: "Est\xE1s bem e de boa sa\xFAde?" }]
    },
    "obrigado": {
      target: "Sakwilenu",
      pronunciation: "Sah-kwee-leh-noo",
      culturalNote: "Agradecimento solene que celebra a alian\xE7a de respeito entre falantes.",
      breakdown: [{ term: "Sakwilenu", meaning: "Agradecemos de cora\xE7\xE3o" }]
    },
    "muito obrigado": {
      target: "Twasakwilila chinene",
      pronunciation: "Twah-sah-kwee-lee-lah chee-neh-neh",
      culturalNote: "Express\xE3o profunda de apre\xE7o e reconhecimento coletivo na arte Cokwe.",
      breakdown: [
        { term: "Twasakwilila", meaning: "N\xF3s agradecemos" },
        { term: "chinene", meaning: "grandemente / com fervor" }
      ]
    },
    "amor": {
      target: "Zango",
      pronunciation: "Zahn-goh",
      culturalNote: "Sentimento nobre e criativo que inspira a arte Sona e a sabedoria dos mais velhos.",
      breakdown: [{ term: "Zango", meaning: "Amor fraterno e leal" }]
    },
    "paz": {
      target: "Sambokeno",
      pronunciation: "Sahm-boh-keh-noh",
      culturalNote: "A serenidade que floresce quando a sabedoria e a justi\xE7a reinam.",
      breakdown: [{ term: "Sambokeno", meaning: "Paz / sossego social" }]
    },
    "pensador": {
      target: "Samanyonga",
      pronunciation: "Sah-mah-nyohn-gah",
      culturalNote: "S\xEDmbolo maior da cultura e identidade nacional de Angola, esculpido na madeira.",
      breakdown: [{ term: "Samanyonga", meaning: "Aquele que pondera / O Pensador" }]
    },
    "cora\xE7\xE3o": {
      target: "Muchima",
      pronunciation: "Moo-chee-mah",
      culturalNote: "A morada da intui\xE7\xE3o e dos sentimentos mais profundos na filosofia bantu.",
      breakdown: [{ term: "Muchima", meaning: "Cora\xE7\xE3o / mente do sentimento" }]
    }
  }
};
function normalizeText(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[?!.,;:'"()]/g, "").trim();
}
function findCorpusTranslation(text, sourceLang, targetLang) {
  const norm = normalizeText(text);
  if (!norm) return null;
  if (sourceLang === "pt") {
    const langDict = CORPUS[targetLang];
    if (langDict) {
      for (const [key, item] of Object.entries(langDict)) {
        const normKey = normalizeText(key);
        if (normKey === norm) {
          return {
            sourceText: text,
            sourceLang,
            targetText: item.target,
            targetLang,
            pronunciation: item.pronunciation,
            culturalNote: item.culturalNote,
            breakdown: item.breakdown,
            isConfident: true,
            isAi: false,
            suggestImprovementNeeded: false
          };
        }
      }
      const words = norm.split(/\s+/);
      for (const [key, item] of Object.entries(langDict)) {
        const normKey = normalizeText(key);
        if (normKey.includes(" ") && norm.includes(normKey)) {
          return {
            sourceText: text,
            sourceLang,
            targetText: item.target,
            targetLang,
            pronunciation: item.pronunciation,
            culturalNote: item.culturalNote,
            breakdown: item.breakdown,
            isConfident: true,
            isAi: false,
            suggestImprovementNeeded: false
          };
        } else if (!normKey.includes(" ") && normKey.length >= 3 && words.includes(normKey) && words.length <= 3) {
          return {
            sourceText: text,
            sourceLang,
            targetText: item.target,
            targetLang,
            pronunciation: item.pronunciation,
            culturalNote: item.culturalNote,
            breakdown: item.breakdown,
            isConfident: true,
            isAi: false,
            suggestImprovementNeeded: false
          };
        }
      }
    }
  }
  if (targetLang === "pt") {
    const langDict = CORPUS[sourceLang];
    if (langDict) {
      for (const [ptPhrase, item] of Object.entries(langDict)) {
        const normTarget = normalizeText(item.target);
        if (normTarget === norm) {
          return {
            sourceText: text,
            sourceLang,
            targetText: ptPhrase.charAt(0).toUpperCase() + ptPhrase.slice(1),
            targetLang,
            pronunciation: item.pronunciation,
            culturalNote: item.culturalNote,
            breakdown: item.breakdown,
            isConfident: true,
            isAi: false,
            suggestImprovementNeeded: false
          };
        }
      }
    }
  }
  return null;
}

// src/server/dictionaryDb.ts
import fs2 from "fs";
import path2 from "path";
var DB_DIR2 = path2.resolve(process.cwd(), "data");
var DICT_DB_FILE = path2.join(DB_DIR2, "dictionary_db.json");
function ensureDbDir() {
  if (!fs2.existsSync(DB_DIR2)) {
    fs2.mkdirSync(DB_DIR2, { recursive: true });
  }
}
function loadDictionaryDb() {
  try {
    ensureDbDir();
    if (!fs2.existsSync(DICT_DB_FILE)) {
      console.log("\u{1F4E6} Inicializando base de dados de voc\xE1bulos com sementes padr\xE3o...");
      saveDictionaryDb(INITIAL_DICTIONARY_ENTRIES);
      return [...INITIAL_DICTIONARY_ENTRIES];
    }
    const raw = fs2.readFileSync(DICT_DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveDictionaryDb(INITIAL_DICTIONARY_ENTRIES);
    return [...INITIAL_DICTIONARY_ENTRIES];
  } catch (err) {
    console.error("Erro ao ler dictionary_db.json:", err);
    return [...INITIAL_DICTIONARY_ENTRIES];
  }
}
function saveDictionaryDb(entries) {
  try {
    ensureDbDir();
    const tempFile = `${DICT_DB_FILE}.tmp`;
    const serialized = JSON.stringify(entries, null, 2);
    fs2.writeFileSync(tempFile, serialized, "utf-8");
    fs2.renameSync(tempFile, DICT_DB_FILE);
  } catch (err) {
    console.error("Erro ao salvar dictionary_db.json:", err);
  }
}
function insertDictionaryEntry(newEntry, currentEntries) {
  const updated = [newEntry, ...currentEntries.filter((e) => e.id !== newEntry.id)];
  saveDictionaryDb(updated);
  return updated;
}
function insertDictionaryBatch(newEntries, currentEntries, defaultStatus = "Aprovada", contributorName = "Administrador (Importa\xE7\xE3o em Lote)") {
  const existingKeys = new Set(
    currentEntries.map((e) => `${e.word.toLowerCase().trim()}_${e.language.toLowerCase().trim()}`)
  );
  const addedEntries = [];
  let skippedCount = 0;
  for (const raw of newEntries) {
    const word = String(raw.word || "").trim();
    const translation = String(raw.translation || "").trim();
    const language = String(raw.language || "kimbundu").toLowerCase().trim();
    if (!word || !translation) {
      skippedCount++;
      continue;
    }
    const key = `${word.toLowerCase()}_${language}`;
    if (existingKeys.has(key)) {
      skippedCount++;
      continue;
    }
    existingKeys.add(key);
    const entry = {
      id: raw.id || `dict-batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word,
      translation,
      language,
      targetLanguage: raw.targetLanguage || "pt",
      meaning: String(raw.meaning || translation || "Registado via importa\xE7\xE3o de acervo.").trim(),
      examples: Array.isArray(raw.examples) ? raw.examples : raw.examples ? [raw.examples] : [],
      pronunciation: String(raw.pronunciation || "").trim(),
      audioUrl: raw.audioUrl,
      audioData: raw.audioData,
      culturalNotes: String(raw.culturalNotes || "").trim(),
      contributorName: raw.contributorName || contributorName,
      contributorId: raw.contributorId || "usr-admin",
      contributorLevel: raw.contributorLevel || "Embaixador da L\xEDngua",
      createdAt: raw.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      status: raw.status || defaultStatus,
      votes: raw.votes || { correct: 5, incorrect: 0, hearts: 3 },
      searchCount: 0,
      reportsCount: 0
    };
    addedEntries.push(entry);
  }
  const updatedList = [...addedEntries, ...currentEntries];
  saveDictionaryDb(updatedList);
  return {
    updatedList,
    addedEntries,
    skippedCount
  };
}

// src/server/languagesDb.ts
import fs3 from "fs";
import path3 from "path";
var DB_DIR3 = path3.resolve(process.cwd(), "data");
var LANG_DB_FILE = path3.join(DB_DIR3, "languages_db.json");
function ensureDbDir2() {
  if (!fs3.existsSync(DB_DIR3)) {
    fs3.mkdirSync(DB_DIR3, { recursive: true });
  }
}
function loadLanguagesDb() {
  try {
    ensureDbDir2();
    if (!fs3.existsSync(LANG_DB_FILE)) {
      saveLanguagesDb(INITIAL_LANGUAGES);
      return [...INITIAL_LANGUAGES];
    }
    const raw = fs3.readFileSync(LANG_DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveLanguagesDb(INITIAL_LANGUAGES);
    return [...INITIAL_LANGUAGES];
  } catch (err) {
    console.error("Erro ao ler languages_db.json:", err);
    return [...INITIAL_LANGUAGES];
  }
}
function saveLanguagesDb(languages2) {
  try {
    ensureDbDir2();
    const tempFile = `${LANG_DB_FILE}.tmp`;
    fs3.writeFileSync(tempFile, JSON.stringify(languages2, null, 2), "utf-8");
    fs3.renameSync(tempFile, LANG_DB_FILE);
  } catch (err) {
    console.error("Erro ao salvar languages_db.json:", err);
  }
}
function insertLanguage(newLang, currentLanguages) {
  const existingIdx = currentLanguages.findIndex((l) => l.code.toLowerCase() === newLang.code.toLowerCase());
  let updated;
  if (existingIdx >= 0) {
    updated = [...currentLanguages];
    updated[existingIdx] = { ...updated[existingIdx], ...newLang };
  } else {
    updated = [...currentLanguages, newLang];
  }
  saveLanguagesDb(updated);
  return updated;
}
function toggleLanguageStatus(code, currentLanguages) {
  const updated = currentLanguages.map((l) => {
    if (l.code.toLowerCase() === code.toLowerCase()) {
      return { ...l, isActive: !l.isActive };
    }
    return l;
  });
  saveLanguagesDb(updated);
  const lang = updated.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return { updated, lang };
}

// server.ts
var app = express();
var PORT = 3e3;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var languages = loadLanguagesDb();
var dictionary = loadDictionaryDb();
var songs = [...INITIAL_SONGS];
var users = [MOCK_ADMIN_USER, ...MOCK_COMMUNITY_USERS];
var ads = [...INITIAL_ADS];
var monetizationSettings = { ...DEFAULT_MONETIZATION_SETTINGS };
var searchStats = {
  "Sakidila": 420,
  "Muxima": 580,
  "Kandandu": 630,
  "Mbote": 710,
  "Matondo": 490,
  "Kalunga": 600,
  "Samanyonga": 740,
  "Onjango": 380
};
var languageUsageStats = {
  "kimbundu": 1240,
  "umbundu": 1580,
  "kikongo": 980,
  "cokwe": 820,
  "kwanyama": 410,
  "ngangela": 320,
  "fiote": 280,
  "luvale": 240,
  "nyaneka": 210,
  "muhumbi": 180
};
function calculateLevel(points) {
  if (points >= 150) return "Embaixador da L\xEDngua";
  if (points >= 51) return "Tradutor";
  return "Colaborador";
}
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Senha de administrador \xE9 obrigat\xF3ria." });
  }
  const result = verifyAdminLogin(password);
  if (!result.success) {
    return res.status(result.locked ? 429 : 401).json(result);
  }
  res.json(result);
});
app.get("/api/admin/check-session", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : void 0;
  const isValid = validateSessionToken(token);
  res.json({ authenticated: isValid });
});
app.post("/api/admin/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : void 0;
  revokeSessionToken(token);
  res.json({ success: true, message: "Sess\xE3o administrativa terminada." });
});
app.post("/api/admin/change-password", requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Senha atual e nova senha s\xE3o obrigat\xF3rias." });
  }
  const result = changeAdminPassword(currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});
app.get("/api/admin/security-info", (req, res) => {
  const db = readSecurityDb();
  res.json({
    algorithm: "PBKDF2-HMAC-SHA512",
    iterations: db.admin.iterations,
    saltBits: 256,
    storage: "Base de dados no servidor (/data/security_db.json)",
    updatedAt: db.admin.updatedAt,
    failedAttempts: db.admin.failedAttempts,
    isLocked: !!(db.admin.lockoutUntil && db.admin.lockoutUntil > Date.now()),
    lockoutUntil: db.admin.lockoutUntil
  });
});
app.get("/api/realtime/events", handleSseRoute);
app.get("/api/realtime/presence", (req, res) => {
  res.json({ onlineCount: getOnlineUsersCount() });
});
app.get("/api/ads", (req, res) => {
  res.json({
    ads,
    settings: monetizationSettings
  });
});
app.post("/api/ads/:id/click", (req, res) => {
  const { id } = req.params;
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.clicksCount = (ad.clicksCount || 0) + 1;
    broadcastRealtimeEvent("ad:updated", ad);
    return res.json({ success: true, clicksCount: ad.clicksCount });
  }
  res.status(404).json({ error: "An\xFAncio n\xE3o encontrado" });
});
app.post("/api/ads/:id/impression", (req, res) => {
  const { id } = req.params;
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.impressionsCount = (ad.impressionsCount || 0) + 1;
    return res.json({ success: true, impressionsCount: ad.impressionsCount });
  }
  res.status(404).json({ error: "An\xFAncio n\xE3o encontrado" });
});
app.post("/api/ads", (req, res) => {
  const newBannerData = req.body;
  if (!newBannerData.sponsorName || !newBannerData.title) {
    return res.status(400).json({ error: "Patrocinador e t\xEDtulo s\xE3o obrigat\xF3rios" });
  }
  const newAd = {
    id: `ad-${Date.now()}`,
    title: newBannerData.title,
    sponsorName: newBannerData.sponsorName,
    description: newBannerData.description || "",
    badgeText: newBannerData.badgeText || "Anunciante Parceiro",
    ctaText: newBannerData.ctaText || "Saber Mais",
    targetUrl: newBannerData.targetUrl || "https://tradutornacional.ao",
    imageUrl: newBannerData.imageUrl,
    placement: newBannerData.placement || "top_leaderboard",
    isActive: newBannerData.isActive !== void 0 ? newBannerData.isActive : true,
    impressionsCount: 0,
    clicksCount: 0,
    category: newBannerData.category || "geral",
    rotationWeight: newBannerData.rotationWeight || 10
  };
  ads.unshift(newAd);
  broadcastRealtimeEvent("ad:updated", newAd);
  res.status(201).json({ success: true, ad: newAd });
});
app.put("/api/ads/:id", (req, res) => {
  const { id } = req.params;
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "An\xFAncio n\xE3o encontrado" });
  }
  ads[index] = {
    ...ads[index],
    ...req.body,
    id
    // preserve id
  };
  broadcastRealtimeEvent("ad:updated", ads[index]);
  res.json({ success: true, ad: ads[index] });
});
app.delete("/api/ads/:id", (req, res) => {
  const { id } = req.params;
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "An\xFAncio n\xE3o encontrado" });
  }
  const removed = ads.splice(index, 1)[0];
  broadcastRealtimeEvent("ad:deleted", { id: removed.id });
  res.json({ success: true, message: "An\xFAncio removido com sucesso", ad: removed });
});
app.post("/api/ads/toggle/:id", (req, res) => {
  const { id } = req.params;
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.isActive = !ad.isActive;
    broadcastRealtimeEvent("ad:updated", ad);
    return res.json({ success: true, ad });
  }
  res.status(404).json({ error: "An\xFAncio n\xE3o encontrado" });
});
app.put("/api/ads/settings", (req, res) => {
  monetizationSettings = { ...monetizationSettings, ...req.body };
  broadcastRealtimeEvent("ad:updated", { _settingsUpdate: true, settings: monetizationSettings });
  res.json({ success: true, settings: monetizationSettings });
});
app.get("/api/languages", (req, res) => {
  res.json({ languages });
});
app.post("/api/languages", requireAdminAuth, (req, res) => {
  const { code, name, nativeName, regions, speakersEstimated, family, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: "C\xF3digo e nome da l\xEDngua s\xE3o obrigat\xF3rios" });
  }
  const cleanCode = String(code).trim().toLowerCase();
  const cleanName = String(name).trim();
  const existing = languages.find((l) => l.code.toLowerCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ error: "Uma l\xEDngua com este c\xF3digo j\xE1 existe no sistema." });
  }
  const newLang = {
    code: cleanCode,
    name: cleanName,
    nativeName: nativeName ? String(nativeName).trim() : cleanName,
    regions: regions ? String(regions).trim() : "Angola",
    speakersEstimated: speakersEstimated ? String(speakersEstimated).trim() : "Em cataloga\xE7\xE3o",
    family: family ? String(family).trim() : "N\xEDger-Congo (Bantu)",
    description: description ? String(description).trim() : "L\xEDngua nacional de Angola preservada pela comunidade.",
    isActive: true
  };
  languages = insertLanguage(newLang, languages);
  broadcastRealtimeEvent("language:created", newLang);
  console.log(`\u2705 [Base de Dados] Nova l\xEDngua catalogada com sucesso: ${newLang.name} (${newLang.code})`);
  res.status(201).json({ success: true, language: newLang });
});
app.delete("/api/languages/:code", requireAdminAuth, (req, res) => {
  const { code } = req.params;
  const cleanCode = String(code).trim().toLowerCase();
  if (cleanCode === "pt") {
    return res.status(400).json({ error: "A l\xEDngua oficial veicular n\xE3o pode ser desativada" });
  }
  const lang = languages.find((l) => l.code.toLowerCase() === cleanCode);
  if (!lang) {
    return res.status(404).json({ error: "L\xEDngua n\xE3o encontrada" });
  }
  const result = toggleLanguageStatus(cleanCode, languages);
  languages = result.updated;
  broadcastRealtimeEvent("language:updated", result.lang);
  res.json({ success: true, language: result.lang });
});
app.get(["/api/dictionary", "/api/suggestions", "/api/words"], (req, res) => {
  const { language, targetLanguage, status, query } = req.query;
  let filtered = [...dictionary];
  if (language && language !== "all") {
    filtered = filtered.filter((item) => item.language === language || item.targetLanguage === language);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((item) => item.status === status);
  }
  if (query && typeof query === "string") {
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const q = normalize(query);
    if (q) {
      filtered = filtered.filter((item) => {
        const wordNorm = normalize(item.word || "");
        const transNorm = normalize(item.translation || "");
        const meaningNorm = normalize(item.meaning || "");
        const pronNorm = normalize(item.pronunciation || "");
        const noteNorm = normalize(item.culturalNotes || "");
        return wordNorm.includes(q) || transNorm.includes(q) || meaningNorm.includes(q) || pronNorm.includes(q) || noteNorm.includes(q);
      });
    }
  }
  res.json({ entries: filtered, total: filtered.length });
});
app.post(["/api/dictionary", "/api/suggestions", "/api/words", "/api/contributions"], (req, res) => {
  try {
    const entry = req.body || {};
    const word = String(entry.word || "").trim();
    const translation = String(entry.translation || "").trim();
    const language = String(entry.language || "").trim();
    if (!word || !translation || !language) {
      return res.status(400).json({
        success: false,
        error: "Palavra, tradu\xE7\xE3o e l\xEDngua s\xE3o obrigat\xF3rios para registar no dicion\xE1rio."
      });
    }
    let safeAudioData = void 0;
    if (typeof entry.audioData === "string" && entry.audioData.length > 0) {
      if (entry.audioData.length > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: "O ficheiro de \xE1udio gravado \xE9 demasiado grande (limite: 5MB)."
        });
      }
      safeAudioData = entry.audioData;
    }
    const newEntry = {
      id: `dict-${Date.now()}`,
      word,
      translation,
      language,
      targetLanguage: String(entry.targetLanguage || "pt").trim(),
      meaning: String(entry.meaning || translation || "Significado em documenta\xE7\xE3o comunit\xE1ria.").trim(),
      examples: Array.isArray(entry.examples) ? entry.examples : [],
      pronunciation: String(entry.pronunciation || "").trim(),
      audioUrl: typeof entry.audioUrl === "string" ? entry.audioUrl : void 0,
      audioData: safeAudioData,
      culturalNotes: String(entry.culturalNotes || "").trim(),
      contributorName: String(entry.contributorName || "Colaborador An\xF3nimo").trim(),
      contributorId: String(entry.contributorId || "guest").trim(),
      contributorLevel: entry.contributorLevel || "Colaborador",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: entry.status || "Pendente",
      votes: { correct: 1, incorrect: 0, hearts: 1 },
      searchCount: 0,
      reportsCount: 0
    };
    dictionary = insertDictionaryEntry(newEntry, dictionary);
    if (newEntry.contributorId && newEntry.contributorId !== "guest") {
      const user = users.find((u) => u.id === newEntry.contributorId);
      if (user) {
        user.points += 15;
        user.contributionsCount += 1;
        user.level = calculateLevel(user.points);
        broadcastRealtimeEvent("user:updated", user);
      }
    }
    try {
      broadcastRealtimeEvent("dictionary:created", newEntry);
    } catch (broadcastErr) {
      console.warn("Realtime broadcast warning:", broadcastErr);
    }
    return res.status(201).json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Erro no endpoint POST /api/dictionary:", err);
    return res.status(500).json({
      success: false,
      error: "Erro no servidor ao registar voc\xE1bulo: " + (err?.message || "Erro inesperado")
    });
  }
});
app.post(["/api/dictionary/batch", "/api/dictionary/import"], (req, res) => {
  try {
    const { entries, autoApprove, contributorName } = req.body || {};
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Nenhum voc\xE1bulo v\xE1lido fornecido para importa\xE7\xE3o em lote."
      });
    }
    const defaultStatus = autoApprove !== false ? "Aprovada" : "Pendente";
    const author = contributorName || "Administrador (Lote Excel)";
    const { updatedList, addedEntries, skippedCount } = insertDictionaryBatch(
      entries,
      dictionary,
      defaultStatus,
      author
    );
    dictionary = updatedList;
    try {
      broadcastRealtimeEvent("dictionary:created", {
        isBatch: true,
        count: addedEntries.length,
        message: `${addedEntries.length} voc\xE1bulos importados e gravados na base de dados.`
      });
    } catch (e) {
    }
    console.log(`\u2705 [Base de Dados] ${addedEntries.length} voc\xE1bulos gravados com sucesso via importa\xE7\xE3o em lote (${skippedCount} ignorados/duplicados).`);
    return res.status(201).json({
      success: true,
      message: `${addedEntries.length} voc\xE1bulos gravados na base de dados com sucesso.`,
      count: addedEntries.length,
      skippedCount,
      entries: addedEntries
    });
  } catch (err) {
    console.error("Erro ao processar lote no servidor:", err);
    return res.status(500).json({
      success: false,
      error: "Erro ao gravar lote na base de dados: " + (err?.message || "Erro inesperado")
    });
  }
});
app.post("/api/suggestions/:id/moderate", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body;
  const entry = dictionary.find((e) => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: "Sugest\xE3o n\xE3o encontrada" });
  }
  if (action !== "Aprovada" && action !== "Rejeitada") {
    return res.status(400).json({ error: "A\xE7\xE3o inv\xE1lida. Use Aprovada ou Rejeitada." });
  }
  entry.status = action;
  entry.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (comment) {
    entry.moderationComment = comment;
  }
  if (action === "Aprovada" && entry.contributorId) {
    const user = users.find((u) => u.id === entry.contributorId);
    if (user) {
      user.points += 25;
      user.approvedCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent("user:updated", user);
    }
  }
  saveDictionaryDb(dictionary);
  broadcastRealtimeEvent("dictionary:moderated", { entry, action, comment });
  res.json({ success: true, entry });
});
app.post("/api/suggestions/:id/vote", (req, res) => {
  const { id } = req.params;
  const { voteType, userId } = req.body;
  const entry = dictionary.find((e) => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: "Entrada n\xE3o encontrada" });
  }
  if (!entry.userVotes) entry.userVotes = {};
  const currentVote = userId ? entry.userVotes[userId] : null;
  if (voteType === "correct") {
    if (currentVote === "correct") {
      entry.votes.correct = Math.max(0, entry.votes.correct - 1);
      if (userId) delete entry.userVotes[userId];
    } else {
      if (currentVote === "incorrect") entry.votes.incorrect = Math.max(0, entry.votes.incorrect - 1);
      entry.votes.correct += 1;
      if (userId) entry.userVotes[userId] = "correct";
    }
  } else if (voteType === "incorrect") {
    if (currentVote === "incorrect") {
      entry.votes.incorrect = Math.max(0, entry.votes.incorrect - 1);
      if (userId) delete entry.userVotes[userId];
    } else {
      if (currentVote === "correct") entry.votes.correct = Math.max(0, entry.votes.correct - 1);
      entry.votes.incorrect += 1;
      if (userId) entry.userVotes[userId] = "incorrect";
    }
  } else if (voteType === "heart") {
    entry.votes.hearts += 1;
  }
  const userVoteResult = userId ? entry.userVotes[userId] : null;
  broadcastRealtimeEvent("dictionary:voted", {
    entryId: id,
    votes: entry.votes,
    userId,
    userVote: userVoteResult
  });
  res.json({ success: true, votes: entry.votes, userVote: userVoteResult });
});
app.post("/api/suggestions/:id/report", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const entry = dictionary.find((e) => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: "Entrada n\xE3o encontrada" });
  }
  entry.reportsCount = (entry.reportsCount || 0) + 1;
  broadcastRealtimeEvent("dictionary:reported", { entryId: id, reportsCount: entry.reportsCount });
  res.json({ success: true, reportsCount: entry.reportsCount });
});
app.post("/api/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({ error: "Texto, l\xEDngua de origem e destino s\xE3o necess\xE1rios." });
  }
  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return res.status(400).json({ error: "Texto vazio." });
  }
  if (sourceLang === targetLang) {
    return res.json({
      sourceText: cleanText,
      sourceLang,
      targetText: cleanText,
      targetLang,
      isConfident: true,
      isAi: false,
      suggestImprovementNeeded: false
    });
  }
  if (sourceLang !== "pt") {
    languageUsageStats[sourceLang] = (languageUsageStats[sourceLang] || 0) + 1;
  }
  if (targetLang !== "pt") {
    languageUsageStats[targetLang] = (languageUsageStats[targetLang] || 0) + 1;
  }
  const keyword = cleanText.split(" ")[0];
  if (keyword.length > 2) {
    searchStats[keyword] = (searchStats[keyword] || 0) + 1;
  }
  const lowerText = cleanText.toLowerCase();
  const directMatch = dictionary.find(
    (e) => e.status === "Aprovada" && (e.language === sourceLang && e.targetLanguage === targetLang && e.word.toLowerCase() === lowerText || e.language === targetLang && e.targetLanguage === sourceLang && e.translation.toLowerCase().includes(lowerText))
  );
  if (directMatch) {
    directMatch.searchCount = (directMatch.searchCount || 0) + 1;
    const isForward = directMatch.language === sourceLang;
    const result = {
      sourceText: cleanText,
      sourceLang,
      targetText: isForward ? directMatch.translation : directMatch.word,
      targetLang,
      pronunciation: directMatch.pronunciation,
      culturalNote: directMatch.culturalNotes,
      breakdown: [
        {
          term: cleanText,
          meaning: directMatch.meaning
        }
      ],
      isConfident: true,
      isAi: false,
      dictionaryMatch: directMatch,
      suggestImprovementNeeded: false
    };
    return res.json(result);
  }
  const corpusMatch = findCorpusTranslation(cleanText, sourceLang, targetLang);
  if (corpusMatch) {
    return res.json(corpusMatch);
  }
  const sourceLangObj = languages.find((l) => l.code === sourceLang);
  const targetLangObj = languages.find((l) => l.code === targetLang);
  const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
  const targetName = targetLangObj ? targetLangObj.name : targetLang;
  try {
    const googleSuggest = await queryGoogleSuggestion(cleanText, sourceLang, targetLang, sourceName, targetName);
    const suggestedTranslation = googleSuggest.suggestedTranslation || cleanText;
    let autoSavedEntry = null;
    if (suggestedTranslation && suggestedTranslation.toLowerCase().trim() !== cleanText.toLowerCase().trim()) {
      const isFromPt = sourceLang === "pt";
      const nativeWord = isFromPt ? suggestedTranslation : cleanText;
      const ptTranslation = isFromPt ? cleanText : suggestedTranslation;
      const natLangCode = isFromPt ? targetLang : sourceLang;
      const alreadyExists = dictionary.some(
        (e) => e.language === natLangCode && e.word.toLowerCase().trim() === nativeWord.toLowerCase().trim()
      );
      if (!alreadyExists) {
        autoSavedEntry = {
          id: `dict-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          word: nativeWord,
          translation: ptTranslation,
          language: natLangCode,
          targetLanguage: "pt",
          meaning: googleSuggest.explanation || `Tradu\xE7\xE3o aut\xEAntica obtida via Google & modelos lingu\xEDsticos (${sourceName} -> ${targetName}).`,
          examples: [
            {
              phrase: nativeWord,
              translation: ptTranslation
            }
          ],
          pronunciation: googleSuggest.pronunciation || "",
          culturalNotes: googleSuggest.explanation || `Termo catalogado automaticamente via motor Google e pesquisa contextual em Angola.`,
          contributorName: "Google Tradutor & IA (Autom\xE1tico)",
          contributorId: "bot-google-ai",
          contributorLevel: "Embaixador da L\xEDngua",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "Aprovada",
          votes: { correct: 5, incorrect: 0, hearts: 2 },
          searchCount: 1,
          reportsCount: 0
        };
        dictionary = insertDictionaryEntry(autoSavedEntry, dictionary);
        try {
          broadcastRealtimeEvent("dictionary:created", autoSavedEntry);
        } catch (e) {
        }
        console.log(`\u26A1 [Google Auto-Grava\xE7\xE3o] "${cleanText}" -> "${suggestedTranslation}" gravado com sucesso na base de dados!`);
      }
    }
    return res.json({
      sourceText: cleanText,
      sourceLang,
      targetText: suggestedTranslation,
      targetLang,
      pronunciation: googleSuggest.pronunciation || "",
      culturalNote: googleSuggest.explanation || "Tradu\xE7\xE3o obtida via motor Google e modelos lingu\xEDsticos de Angola.",
      breakdown: [
        {
          term: cleanText,
          meaning: suggestedTranslation
        }
      ],
      isConfident: true,
      isAi: true,
      isGoogleSuggestion: true,
      isAutoSavedToDb: Boolean(autoSavedEntry),
      autoSavedEntryId: autoSavedEntry ? autoSavedEntry.id : void 0,
      googleSuggestion: {
        text: suggestedTranslation,
        source: googleSuggest.source,
        searchUrl: googleSuggest.searchUrl,
        explanation: googleSuggest.explanation
      },
      suggestImprovementNeeded: false
    });
  } catch (err) {
    console.warn("Google & AI fallback error:", err.message);
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradu\xE7\xE3o "${cleanText}" ${sourceName} ${targetName} Angola`)}`;
    res.json({
      sourceText: cleanText,
      sourceLang,
      targetText: cleanText,
      targetLang,
      isConfident: false,
      isAi: false,
      isGoogleSuggestion: true,
      googleSuggestion: {
        text: cleanText,
        source: "Google Pesquisa",
        searchUrl: googleSearchUrl,
        explanation: "N\xE3o foi encontrada correspond\xEAncia imediata. Clique para consultar diretamente no Google."
      },
      suggestImprovementNeeded: true,
      culturalNote: "Express\xE3o em an\xE1lise pelos guardi\xF5es da l\xEDngua. Pode sugerir a sua tradu\xE7\xE3o comunit\xE1ria ou consultar o Google."
    });
  }
});
async function queryGoogleSuggestion(cleanText, sourceLang, targetLang, sourceName, targetName) {
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradu\xE7\xE3o "${cleanText}" ${sourceName} ${targetName} Angola`)}`;
  let googleTranslateText = "";
  try {
    const targetCode = targetLang === "pt" ? "pt" : "auto";
    const encoded = encodeURIComponent(cleanText);
    const cmd = `curl -s -m 2 "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encoded}"`;
    const out = execSync(cmd, { timeout: 2500 }).toString();
    const parsed = JSON.parse(out);
    if (parsed && parsed[0] && parsed[0][0] && parsed[0][0][0]) {
      const translated = String(parsed[0][0][0]).trim();
      if (translated && translated.toLowerCase() !== cleanText.toLowerCase()) {
        googleTranslateText = translated;
      }
    }
  } catch (e) {
  }
  try {
    const prompt = `Atue como o motor de busca lingu\xEDstica do Google para Angola. O voc\xE1bulo "${cleanText}" (${sourceName} -> ${targetName}) n\xE3o est\xE1 catalogado no acervo verificado.
${googleTranslateText ? `Uma consulta r\xE1pida ao Google Tradutor retornou preliminarmente: "${googleTranslateText}".` : ""}
Consulte dados lingu\xEDsticos e da web para propor a tradu\xE7\xE3o mais precisa e uma explica\xE7\xE3o contextual concisa.
Responda ESTRITAMENTE em formato JSON:
{
  "suggestedTranslation": "tradu\xE7\xE3o sugerida",
  "explanation": "breve explica\xE7\xE3o etimol\xF3gica ou contexto de uso em Angola",
  "pronunciation": "pron\xFAncia aproximada"
}`;
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.suggestedTranslation) {
            return {
              query: cleanText,
              suggestedTranslation: parsed.suggestedTranslation,
              explanation: parsed.explanation || (googleTranslateText ? `Tradu\xE7\xE3o sugerida pelo Google Tradutor com valida\xE7\xE3o preliminar.` : "Sugest\xE3o obtida atrav\xE9s do Google e intelig\xEAncia lingu\xEDstica."),
              pronunciation: parsed.pronunciation || "",
              searchUrl: googleSearchUrl,
              source: googleTranslateText ? "Google Tradutor & Redes" : "Google & Intelig\xEAncia Lingu\xEDstica"
            };
          }
        }
      } catch (e) {
      }
    }
  } catch (err) {
    console.warn("Erro ao consultar Gemini para sugest\xE3o Google:", err.message);
  }
  return {
    query: cleanText,
    suggestedTranslation: googleTranslateText || cleanText,
    explanation: googleTranslateText ? `Sugest\xE3o encontrada via Google Tradutor para "${cleanText}". Recomenda-se confirma\xE7\xE3o comunit\xE1ria.` : `N\xE3o foi encontrada tradu\xE7\xE3o autom\xE1tica imediata. Consulte as refer\xEAncias no Google.`,
    pronunciation: "",
    searchUrl: googleSearchUrl,
    source: googleTranslateText ? "Google Tradutor" : "Google Pesquisa"
  };
}
app.get("/api/google-suggest", async (req, res) => {
  try {
    const text = String(req.query.text || req.query.q || "").trim();
    const sourceLang = String(req.query.sourceLang || "kimbundu");
    const targetLang = String(req.query.targetLang || "pt");
    if (!text) {
      return res.status(400).json({ error: "Texto n\xE3o fornecido para busca." });
    }
    const sourceLangObj = languages.find((l) => l.code === sourceLang);
    const targetLangObj = languages.find((l) => l.code === targetLang);
    const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
    const targetName = targetLangObj ? targetLangObj.name : targetLang;
    const suggestion = await queryGoogleSuggestion(text, sourceLang, targetLang, sourceName, targetName);
    const suggestedTranslation = suggestion.suggestedTranslation || text;
    let autoSavedEntry = null;
    if (suggestedTranslation && suggestedTranslation.toLowerCase().trim() !== text.toLowerCase().trim()) {
      const isFromPt = sourceLang === "pt";
      const nativeWord = isFromPt ? suggestedTranslation : text;
      const ptTranslation = isFromPt ? text : suggestedTranslation;
      const natLangCode = isFromPt ? targetLang : sourceLang;
      const alreadyExists = dictionary.some(
        (e) => e.language === natLangCode && e.word.toLowerCase().trim() === nativeWord.toLowerCase().trim()
      );
      if (!alreadyExists) {
        autoSavedEntry = {
          id: `dict-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          word: nativeWord,
          translation: ptTranslation,
          language: natLangCode,
          targetLanguage: "pt",
          meaning: suggestion.explanation || `Tradu\xE7\xE3o aut\xEAntica obtida via Google & modelos lingu\xEDsticos (${sourceName} -> ${targetName}).`,
          examples: [{ phrase: nativeWord, translation: ptTranslation }],
          pronunciation: suggestion.pronunciation || "",
          culturalNotes: suggestion.explanation || `Termo catalogado automaticamente via motor Google e pesquisa contextual em Angola.`,
          contributorName: "Google Tradutor & IA (Autom\xE1tico)",
          contributorId: "bot-google-ai",
          contributorLevel: "Embaixador da L\xEDngua",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "Aprovada",
          votes: { correct: 5, incorrect: 0, hearts: 2 },
          searchCount: 1,
          reportsCount: 0
        };
        dictionary = insertDictionaryEntry(autoSavedEntry, dictionary);
        try {
          broadcastRealtimeEvent("dictionary:created", autoSavedEntry);
        } catch (e) {
        }
        console.log(`\u26A1 [Google Suggest Auto-Grava\xE7\xE3o] "${text}" -> "${suggestedTranslation}" gravado com sucesso na base de dados!`);
      }
    }
    return res.json({
      success: true,
      ...suggestion,
      isAutoSavedToDb: Boolean(autoSavedEntry),
      autoSavedEntry: autoSavedEntry || void 0
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao pesquisar sugest\xE3o no Google: " + (err?.message || "Inesperado")
    });
  }
});
app.post(["/api/chat", "/api/chatgpt"], async (req, res) => {
  try {
    const { messages, currentLanguage, model: requestedModel } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Nenhuma mensagem fornecida para o ChatGPT." });
    }
    const targetLangObj = currentLanguage ? languages.find((l) => l.code === currentLanguage) : null;
    const langContext = targetLangObj ? `O utilizador est\xE1 a focar os seus estudos na l\xEDngua ${targetLangObj.name} (${targetLangObj.regions}).` : "O utilizador tem interesse nas l\xEDnguas nacionais de Angola e cultura angolana.";
    const systemInstruction = `\xC9s o ChatGPT (desenvolvido pela OpenAI), operando como especialista lingu\xEDstico e cultural no Tradutor Nacional de Angola. O teu objetivo \xE9 auxiliar em todas as d\xFAvidas, di\xE1logos e tradu\xE7\xF5es das L\xEDnguas Nacionais de Angola (Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Fiote, Ngangela, Nyaneka, Luvale e outras) e Portugu\xEAs Angolano.

Diretrizes:
- Identifica-te como ChatGPT quando oportuno e responde com cordialidade, rigor lingu\xEDstico e respeito pela ancestralidade angolana.
- ${langContext}
- Quando ensinares ou traduzires palavras ou express\xF5es:
  1. Fornece a palavra/frase grafada corretamente na l\xEDngua nacional;
  2. Fornece a tradu\xE7\xE3o clara em Portugu\xEAs;
  3. Adiciona a pron\xFAncia fon\xE9tica intuitiva entre par\xEAnteses (ex: [pron\xFAncia]);
  4. Quando relevante, explica o contexto cultural, etimol\xF3gico ou de cosmovis\xE3o angolana.
- Podes conduzir di\xE1logos interactivos nessas l\xEDnguas para ajudar o utilizador a praticar sauda\xE7\xF5es, frases cotidianas, prov\xE9rbios e can\xE7\xF5es.
- Responde em portugu\xEAs claro, acess\xEDvel e caloroso.`;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiPayload = {
          model: requestedModel || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: String(m.content || "")
            }))
          ],
          temperature: 0.7
        };
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(openaiPayload)
        });
        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const reply = openAiData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              success: true,
              reply,
              role: "assistant",
              provider: "OpenAI ChatGPT (Oficial)",
              model: openAiData.model || "gpt-4o-mini",
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        } else {
          console.warn("OpenAI API retornou status:", openAiRes.status);
        }
      } catch (err) {
        console.warn("Erro ao chamar OpenAI API, utilizando motor inteligente de fallback:", err.message);
      }
    }
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    for (const modelName of candidateModels) {
      try {
        const fetchPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction
          }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3500));
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            role: "assistant",
            provider: "ChatGPT (OpenAI Engine)",
            model: "ChatGPT 4o",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      } catch (e) {
      }
    }
    const lastUserMessage = messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
    const cleanQuery = lastUserMessage.toLowerCase();
    let replyFallback = `Ol\xE1! Sou o **ChatGPT** integrado no Tradutor Nacional de Angola.

`;
    if (cleanQuery.includes("ol\xE1") || cleanQuery.includes("bom dia") || cleanQuery.includes("boa tarde") || cleanQuery.includes("sauda")) {
      replyFallback += `Aqui tens as principais formas de saudar nas nossas l\xEDnguas:

\u2022 **Kimbundu:** *Sakidila* [sa-ki-di-la] (Obrigado), *Wimbu* (Paz), *Mavunzu* (Bom dia).
\u2022 **Umbundu:** *Ndapandula* [nda-pan-du-la] (Agrade\xE7o), *Valapo* (Ol\xE1 / Passa bem).
\u2022 **Kikongo:** *Mbote* [m-bo-te] (Ol\xE1 / Paz), *Mbote zaku* (Tudo bem contigo).
\u2022 **Cokwe:** *Menekeno* (Sauda\xE7\xF5es), *Samanyonga* (Com licen\xE7a / Respeito).

Sobre qual l\xEDngua nacional ou express\xE3o gostarias de conversar mais?`;
    } else if (cleanQuery.includes("kandandu") || cleanQuery.includes("abra\xE7o")) {
      replyFallback += `**Kandandu** \xE9 um dos voc\xE1bulos mais carinhosos e profundos da cultura angolana.

\u2022 **Significado:** Abra\xE7o fraterno, acolhimento afetuoso, voto de bem-estar.
\u2022 **Origem:** Kimbundu (*kandandu* = abra\xE7ar com alma e calor).
\u2022 **Uso:** Utiliza-se em despedidas calorosas: *"Um grande kandandu para ti e para a fam\xEDlia!"*`;
    } else if (cleanQuery.includes("k\xFAdia") || cleanQuery.includes("kudia") || cleanQuery.includes("comer") || cleanQuery.includes("comida")) {
      replyFallback += `**K\xFAdia** (ou *Kudia*):

\u2022 **L\xEDngua:** Kimbundu.
\u2022 **Significado:** Comer (verbo) ou Comida / Refei\xE7\xE3o (substantivo).
\u2022 **Exemplo:** *"Twa m\xFA kuenda k\xFAdia"* (Vamos comer).
\u2022 **Nota Cultural:** Em Angola, o termo foi amplamente adotado no falar cotidiano e nas m\xFAsicas semba e kuduro.`;
    } else {
      replyFallback += `Recebi a tua quest\xE3o sobre: **"${lastUserMessage}"**.

Como assistente ChatGPT especializado em Angola, posso ajudar-te a:
1. Traduzir e decompor palavras em Kimbundu, Umbundu, Kikongo, Cokwe, Fiote, Ngangela, Kwanyama e Nyaneka.
2. Explicar a pron\xFAncia fon\xE9tica e regras gramaticais Bantu.
3. Interpretar prov\xE9rbios e contexto cultural tradicional.

\u{1F4A1} *Dica:* Podes tamb\xE9m clicar em **"chatgpt.com \u2197"** no topo para abrir esta conversa diretamente no site oficial da OpenAI com todas as funcionalidades online.`;
    }
    return res.json({
      success: true,
      reply: replyFallback,
      role: "assistant",
      provider: "ChatGPT (OpenAI)",
      model: "ChatGPT 4o",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Erro na rota /api/chat:", err);
    return res.status(500).json({
      success: false,
      error: "Erro no ChatGPT: " + (err?.message || "Inesperado")
    });
  }
});
app.post("/api/chatgpt/query-word", async (req, res) => {
  try {
    const { word, sourceLang, targetLang } = req.body || {};
    if (!word) {
      return res.status(400).json({ error: "Palavra ou express\xE3o n\xE3o fornecida." });
    }
    const cleanWord = String(word).trim();
    const sourceLangObj = languages.find((l) => l.code === sourceLang);
    const targetLangObj = languages.find((l) => l.code === targetLang);
    const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
    const targetName = targetLangObj ? targetLangObj.name : targetLang;
    const chatgptWebUrl = `https://chatgpt.com/?q=${encodeURIComponent(`Como tradutor especialista em l\xEDnguas de Angola, analisa o termo "${cleanWord}" na l\xEDngua ${sourceName} e a sua tradu\xE7\xE3o/significado para ${targetName}. Fornece escrita, pron\xFAncia fon\xE9tica, contexto cultural e exemplos de uso.`)}`;
    const prompt = `Analise com profundidade como o ChatGPT a seguinte express\xE3o entre ${sourceName} e ${targetName} no contexto de Angola: "${cleanWord}".
Responda em formato estruturado:
1. Tradu\xE7\xE3o direta mais precisa
2. Pron\xFAncia fon\xE9tica recomendada
3. Desdobramento morfol\xF3gico ou etimologia
4. Exemplo pr\xE1tico de frase no dia a dia
5. Nota cultural e etiqueta tradicional`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "\xC9s o ChatGPT especializado em L\xEDnguas Nacionais de Angola e lingu\xEDstica bantu."
      }
    });
    return res.json({
      success: true,
      word: cleanWord,
      analysis: response.text || "An\xE1lise gerada com sucesso.",
      chatgptWebUrl,
      source: "ChatGPT (OpenAI)"
    });
  } catch (err) {
    return res.status(500).json({
      error: "Erro ao consultar ChatGPT: " + (err?.message || "Inesperado")
    });
  }
});
app.post("/api/tts", async (req, res) => {
  const { text, language } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texto n\xE3o fornecido para s\xEDntese vocal" });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Pronuncie de forma natural, calorosa e com pron\xFAncia aut\xEAntica em l\xEDngua nacional de Angola ou portugu\xEAs angolano: "${text}".`,
              speechMetadata: {
                style: "Natural, warm, dignified African narrator with respectful intonation"
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, format: "audio/wav" });
    }
    res.status(500).json({ error: "N\xE3o foi poss\xEDvel gerar \xE1udio" });
  } catch (err) {
    console.warn("TTS error (falling back to client speech synthesis):", err.message);
    res.json({ fallback: true, message: "Use browser speech synthesis" });
  }
});
app.get("/api/stats", (req, res) => {
  const totalTranslations = Object.values(languageUsageStats).reduce((a, b) => a + b, 0);
  const approvedWords = dictionary.filter((d) => d.status === "Aprovada").length;
  const pendingWords = dictionary.filter((d) => d.status === "Pendente").length;
  const topSearches = Object.entries(searchStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, count]) => ({ word, count }));
  const topLanguages = Object.entries(languageUsageStats).map(([code, count]) => {
    const lang = languages.find((l) => l.code === code);
    return { code, name: lang ? lang.name : code, count };
  }).sort((a, b) => b.count - a.count);
  const topContributors = users.map((u) => ({
    id: u.id,
    name: u.name,
    points: u.points,
    level: u.level,
    contributionsCount: u.contributionsCount,
    approvedCount: u.approvedCount
  })).sort((a, b) => b.points - a.points);
  res.json({
    totalTranslations,
    approvedWords,
    pendingWords,
    totalLanguages: languages.filter((l) => l.isActive).length,
    topSearches,
    topLanguages,
    topContributors
  });
});
app.get("/api/users", (req, res) => {
  res.json({ users });
});
app.post("/api/users/profile", (req, res) => {
  const profile = req.body;
  if (!profile.id) {
    return res.status(400).json({ error: "ID de utilizador necess\xE1rio" });
  }
  let user = users.find((u) => u.id === profile.id);
  if (!user) {
    user = {
      id: profile.id,
      name: profile.name || "Novo Guardi\xE3o",
      email: profile.email || "",
      nativeLanguages: profile.nativeLanguages || ["pt"],
      points: profile.points || 15,
      level: calculateLevel(profile.points || 15),
      role: "user",
      favorites: profile.favorites || [],
      history: profile.history || [],
      contributionsCount: 0,
      approvedCount: 0,
      badges: ["Rec\xE9m-Chegado"]
    };
    users.push(user);
  } else {
    if (profile.name) user.name = profile.name;
    if (profile.nativeLanguages) user.nativeLanguages = profile.nativeLanguages;
    if (profile.favorites) user.favorites = profile.favorites;
    if (profile.history) user.history = profile.history;
    if (profile.points !== void 0) {
      user.points = profile.points;
      user.level = calculateLevel(user.points);
    }
  }
  broadcastRealtimeEvent("user:updated", user);
  res.json({ success: true, user });
});
function extractYoutubeId(url) {
  if (!url) return void 0;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=[&]*|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : void 0;
}
app.get("/api/songs", (req, res) => {
  const { language, status, query } = req.query;
  let filtered = [...songs];
  if (language && language !== "all") {
    filtered = filtered.filter((s) => s.language === language);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((s) => s.status === status);
  }
  if (query && typeof query === "string") {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.originalLyrics.toLowerCase().includes(q) || s.translatedLyrics.toLowerCase().includes(q) || s.culturalContext && s.culturalContext.toLowerCase().includes(q)
    );
  }
  res.json({ songs: filtered });
});
app.post("/api/songs", (req, res) => {
  const {
    title,
    artist,
    language,
    genre,
    platformUrl,
    originalLyrics,
    translatedLyrics,
    culturalContext,
    contributorName,
    contributorId
  } = req.body;
  if (!title || !artist || !language || !platformUrl || !originalLyrics || !translatedLyrics) {
    return res.status(400).json({ error: "T\xEDtulo, artista, l\xEDngua, link, letra original e tradu\xE7\xE3o s\xE3o obrigat\xF3rios." });
  }
  const youtubeId = extractYoutubeId(platformUrl);
  const origLines = originalLyrics.split("\n").filter((l) => l.trim().length > 0);
  const transLines = translatedLyrics.split("\n").filter((l) => l.trim().length > 0);
  const verses = origLines.map((orig, idx) => ({
    original: orig,
    translation: transLines[idx] || ""
  }));
  const newSong = {
    id: `song-${Date.now()}`,
    title: title.trim(),
    artist: artist.trim(),
    language,
    genre: genre?.trim() || "Semba / M\xFAsica Tradicional",
    platformUrl: platformUrl.trim(),
    youtubeId,
    originalLyrics: originalLyrics.trim(),
    translatedLyrics: translatedLyrics.trim(),
    verses: verses.slice(0, 20),
    culturalContext: culturalContext?.trim() || "",
    contributorName: contributorName || "Ouvinte Colaborador",
    contributorId: contributorId || "guest",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "Pendente",
    // Administrator has to approve everything!
    likesCount: 1
  };
  songs.unshift(newSong);
  if (contributorId) {
    const user = users.find((u) => u.id === contributorId);
    if (user) {
      user.points += 20;
      user.contributionsCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent("user:updated", user);
    }
  }
  broadcastRealtimeEvent("song:created", newSong);
  res.status(201).json({ success: true, song: newSong });
});
app.post("/api/songs/:id/moderate", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body;
  const song = songs.find((s) => s.id === id);
  if (!song) {
    return res.status(404).json({ error: "M\xFAsica n\xE3o encontrada." });
  }
  if (action !== "Aprovada" && action !== "Rejeitada") {
    return res.status(400).json({ error: "A\xE7\xE3o inv\xE1lida. Use Aprovada ou Rejeitada." });
  }
  song.status = action;
  if (comment) song.moderationComment = comment;
  if (action === "Aprovada" && song.contributorId) {
    const user = users.find((u) => u.id === song.contributorId);
    if (user) {
      user.points += 30;
      user.approvedCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent("user:updated", user);
    }
  }
  broadcastRealtimeEvent("song:moderated", { song, action, comment });
  res.json({ success: true, song });
});
app.delete("/api/songs/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "M\xFAsica n\xE3o encontrada." });
  }
  songs.splice(index, 1);
  broadcastRealtimeEvent("song:deleted", { songId: id });
  res.json({ success: true });
});
app.post("/api/songs/:id/like", (req, res) => {
  const { id } = req.params;
  const song = songs.find((s) => s.id === id);
  if (!song) {
    return res.status(404).json({ error: "M\xFAsica n\xE3o encontrada." });
  }
  song.likesCount = (song.likesCount || 0) + 1;
  broadcastRealtimeEvent("song:liked", { songId: id, likesCount: song.likesCount });
  res.json({ success: true, likesCount: song.likesCount });
});
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint da API n\xE3o encontrado: ${req.method} ${req.originalUrl}`
  });
});
app.use((err, req, res, next) => {
  console.error("Express request error:", err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Ocorreu um erro no servidor ao processar o pedido."
  });
});
async function startServer() {
  const server = http.createServer(app);
  initRealtimeServer(server);
  const distPath = path4.resolve("dist");
  const hasDist = fs4.existsSync(distPath) && fs4.existsSync(path4.resolve(distPath, "index.html"));
  if (process.env.NODE_ENV === "production" && hasDist) {
    console.log("Serving production build from dist/");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path4.resolve(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Tradutor Nacional de Angola server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
