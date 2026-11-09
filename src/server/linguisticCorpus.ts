import { TranslationResult } from '../types';

interface PhraseMap {
  target: string;
  pronunciation: string;
  culturalNote: string;
  breakdown: Array<{ term: string; meaning: string }>;
}

// Master phrase corpus for Angolan National Languages
const CORPUS: Record<string, Record<string, PhraseMap>> = {
  // KIMBUNDU
  'kimbundu': {
    'olá': {
      target: 'Mbote',
      pronunciation: 'M-boh-teh',
      culturalNote: 'Saudação comum e respeitosa em Kimbundu, invocando bem-estar e cordialidade.',
      breakdown: [{ term: 'Mbote', meaning: 'Saudação que expressa bondade, paz e bem-estar.' }]
    },
    'oi': {
      target: 'Mbote',
      pronunciation: 'M-boh-teh',
      culturalNote: 'Saudação comum e respeitosa em Kimbundu, invocando bem-estar e cordialidade.',
      breakdown: [{ term: 'Mbote', meaning: 'Saudação que expressa bondade, paz e bem-estar.' }]
    },
    'bom dia': {
      target: 'Kime kya mbote',
      pronunciation: 'Kee-meh kyah m-boh-teh',
      culturalNote: 'Desejo tradicional de uma manhã abençoada e produtiva com paz no seio da comunidade.',
      breakdown: [
        { term: 'Kime', meaning: 'Manhã / aurora' },
        { term: 'kya mbote', meaning: 'de bem / boa / proveitosa' }
      ]
    },
    'boa tarde': {
      target: 'Kumbi dya mbote',
      pronunciation: 'Koom-bee dyah m-boh-teh',
      culturalNote: 'Saudação durante o declínio do sol, desejando que a tarde traga descanso e harmonia.',
      breakdown: [
        { term: 'Kumbi', meaning: 'Sol / tarde' },
        { term: 'dya mbote', meaning: 'boa / agradável' }
      ]
    },
    'boa noite': {
      target: 'Ufuku uambote',
      pronunciation: 'Oo-foo-koo wahm-boh-teh',
      culturalNote: 'Bênção de repouso seguro sob a proteção ancestral dos mais velhos.',
      breakdown: [
        { term: 'Ufuku', meaning: 'Noite' },
        { term: 'uambote', meaning: 'boa / serena' }
      ]
    },
    'como estás': {
      target: 'U kuambata kiambote?',
      pronunciation: 'Oo koo-ahm-bah-tah kee-ahm-boh-teh?',
      culturalNote: 'Expressão de carinho e preocupação genuína com a saúde física e espiritual do interlocutor.',
      breakdown: [
        { term: 'U kuambata', meaning: 'Como levas o teu estado' },
        { term: 'kiambote', meaning: 'bem / com saúde' }
      ]
    },
    'como você está': {
      target: 'U kuambata kiambote?',
      pronunciation: 'Oo koo-ahm-bah-tah kee-ahm-boh-teh?',
      culturalNote: 'Expressão de carinho e preocupação genuína com a saúde física e espiritual do interlocutor.',
      breakdown: [
        { term: 'U kuambata', meaning: 'Como levas o teu estado' },
        { term: 'kiambote', meaning: 'bem / com saúde' }
      ]
    },
    'tudo bem': {
      target: 'Kima kyambote',
      pronunciation: 'Kee-mah kyahm-boh-teh',
      culturalNote: 'Confirmação afirmativa de que tudo corre em harmonia social e familiar.',
      breakdown: [
        { term: 'Kima', meaning: 'Coisa / tudo' },
        { term: 'kyambote', meaning: 'está bom / em paz' }
      ]
    },
    'obrigado': {
      target: 'Sakidila',
      pronunciation: 'Sah-kee-dee-lah',
      culturalNote: 'Pilar moral bantu de reciprocidade e gratidão entre semelhantes.',
      breakdown: [{ term: 'Sakidila', meaning: 'Agradeço / Sou grato de coração' }]
    },
    'muito obrigado': {
      target: 'Sakidila kyavulu',
      pronunciation: 'Sah-kee-dee-lah kyah-voo-loo',
      culturalNote: 'Expressão de profunda gratidão que reforça o respeito e a estima mútua.',
      breakdown: [
        { term: 'Sakidila', meaning: 'Agradeço' },
        { term: 'kyavulu', meaning: 'muito / imensamente' }
      ]
    },
    'por favor': {
      target: 'Ngikuatekesu',
      pronunciation: 'Ngee-kwah-teh-keh-soo',
      culturalNote: 'Pedido humilde de auxílio e solidariedade fraterna.',
      breakdown: [{ term: 'Ngikuatekesu', meaning: 'Dá-me o teu apoio / por gentileza' }]
    },
    'adeus': {
      target: 'Tala kiambote',
      pronunciation: 'Tah-lah kee-ahm-boh-teh',
      culturalNote: 'Despedida afetuosa que deseja que a pessoa caminhe e viva em segurança.',
      breakdown: [{ term: 'Tala kiambote', meaning: 'Fica bem / cuida-te' }]
    },
    'amor': {
      target: 'Kuzola',
      pronunciation: 'Koo-zoh-lah',
      culturalNote: 'O amor como força unificadora que protege o clã e a linhagem familiar.',
      breakdown: [{ term: 'Kuzola', meaning: 'Amar / afeição pura' }]
    },
    'eu te amo': {
      target: 'Nga ku zolo',
      pronunciation: 'Ngah koo zoh-loh',
      culturalNote: 'Declaração sincera de carinho e compromisso afetivo na cultura kimbundu.',
      breakdown: [
        { term: 'Nga', meaning: 'Eu' },
        { term: 'ku zolo', meaning: 'te amo / quero-te bem' }
      ]
    },
    'paz': {
      target: 'Kutululuka',
      pronunciation: 'Koo-too-loo-loo-kah',
      culturalNote: 'Tranquilidade de espírito e harmonia coletiva sem contendas na terra.',
      breakdown: [{ term: 'Kutululuka', meaning: 'Sossego / serenidade interior' }]
    },
    'amigo': {
      target: 'Kamba',
      pronunciation: 'Kahm-bah',
      culturalNote: 'Termo célebre angolano que define o verdadeiro irmão de alma e companheiro leal.',
      breakdown: [{ term: 'Kamba', meaning: 'Companheiro / cúmplice na vida' }]
    },
    'família': {
      target: 'Kifuxi',
      pronunciation: 'Kee-foo-shee',
      culturalNote: 'O núcleo sagrado que preserva os ensinamentos e a memória dos antepassados.',
      breakdown: [{ term: 'Kifuxi', meaning: 'Linhagem / família alargada' }]
    },
    'coração': {
      target: 'Muxima',
      pronunciation: 'Moo-shee-mah',
      culturalNote: 'Centro moral e afetivo do ser humano; nome do maior santuário mariano de Angola.',
      breakdown: [{ term: 'Muxima', meaning: 'Coração / alma dos sentimentos' }]
    },
    'deus': {
      target: 'Nzambi',
      pronunciation: 'N-zahm-bee',
      culturalNote: 'O Criador Supremo do Universo e do homem na cosmologia bantu angolana.',
      breakdown: [{ term: 'Nzambi', meaning: 'Deus Todo-Poderoso' }]
    },
    'água': {
      target: 'Menha',
      pronunciation: 'Meh-nyah',
      culturalNote: 'Fonte vital da terra e símbolo primordial de purificação nos ritos tradicionais.',
      breakdown: [{ term: 'Menha', meaning: 'Água que dá vida' }]
    },
    'terra': {
      target: 'Ixi',
      pronunciation: 'Ee-shee',
      culturalNote: 'O solo sagrado de Angola onde repousam as raízes dos nossos ancestrais.',
      breakdown: [{ term: 'Ixi', meaning: 'Pátria / solo / território' }]
    },
    'casa': {
      target: 'Inzo',
      pronunciation: 'Een-zoh',
      culturalNote: 'Lar e refúgio da família onde se transmitem os valores aos mais novos.',
      breakdown: [{ term: 'Inzo', meaning: 'Habitação / abrigo familiar' }]
    },
  },

  // UMBUNDU
  'umbundu': {
    'olá': {
      target: 'Kalunga',
      pronunciation: 'Kah-loon-gah',
      culturalNote: 'Saudação nobre Ovimbundu de veneração e reverência ao outro.',
      breakdown: [{ term: 'Kalunga', meaning: 'Saudação solene de boas-vindas e vida' }]
    },
    'oi': {
      target: 'Kalunga',
      pronunciation: 'Kah-loon-gah',
      culturalNote: 'Saudação nobre Ovimbundu de veneração e reverência ao outro.',
      breakdown: [{ term: 'Kalunga', meaning: 'Saudação solene de boas-vindas e vida' }]
    },
    'bom dia': {
      target: 'Omẽle yiwa',
      pronunciation: 'Oh-meh-leh yee-wah',
      culturalNote: 'Desejo de manhã próspera no planalto central angolano.',
      breakdown: [
        { term: 'Omẽle', meaning: 'Manhã' },
        { term: 'yiwa', meaning: 'boa / virtuosa' }
      ]
    },
    'boa tarde': {
      target: 'Ekumbi liwa',
      pronunciation: 'Eh-koom-bee lee-wah',
      culturalNote: 'Desejo de tarde serena e cheia de colheitas frutuosas.',
      breakdown: [
        { term: 'Ekumbi', meaning: 'Tarde / sol' },
        { term: 'liwa', meaning: 'boa / benéfica' }
      ]
    },
    'boa noite': {
      target: 'Uteke uwa',
      pronunciation: 'Oo-teh-keh oo-wah',
      culturalNote: 'Desejo de noite tranquila e sono restaurador sob a guarda divina.',
      breakdown: [
        { term: 'Uteke', meaning: 'Noite' },
        { term: 'uwa', meaning: 'boa / em paz' }
      ]
    },
    'como estás': {
      target: 'Wakolapo?',
      pronunciation: 'Wah-koh-lah-poh?',
      culturalNote: 'Pergunta calorosa sobre a saúde e a força vital do interlocutor.',
      breakdown: [
        { term: 'Wakolapo', meaning: 'Tens força / estás forte e com saúde?' }
      ]
    },
    'como você está': {
      target: 'Wakolapo?',
      pronunciation: 'Wah-koh-lah-poh?',
      culturalNote: 'Pergunta calorosa sobre a saúde e a força vital do interlocutor.',
      breakdown: [
        { term: 'Wakolapo', meaning: 'Tens força / estás forte e com saúde?' }
      ]
    },
    'tudo bem': {
      target: 'Ndakolapo ciwa',
      pronunciation: 'Ndah-koh-lah-poh chee-wah',
      culturalNote: 'Resposta convicta de pleno vigor e satisfação com a vida comunitária.',
      breakdown: [
        { term: 'Ndakolapo', meaning: 'Estou firme' },
        { term: 'ciwa', meaning: 'muito bem' }
      ]
    },
    'obrigado': {
      target: 'Ndapandula',
      pronunciation: 'Ndah-pahn-doo-lah',
      culturalNote: 'Reconhecimento cordial de bênção e benefício recebido.',
      breakdown: [{ term: 'Ndapandula', meaning: 'Dou graças / Agradeço' }]
    },
    'muito obrigado': {
      target: 'Ndapandula calua',
      pronunciation: 'Ndah-pahn-doo-lah kah-loo-ah',
      culturalNote: 'Expressão de intensa gratidão que estreita os laços de fraternidade.',
      breakdown: [
        { term: 'Ndapandula', meaning: 'Agradeço' },
        { term: 'calua', meaning: 'muito / imensamente' }
      ]
    },
    'por favor': {
      target: 'Mekuatiso',
      pronunciation: 'Meh-kwah-tee-soh',
      culturalNote: 'Invocação respeitosa de colaboração solidária mútua.',
      breakdown: [{ term: 'Mekuatiso', meaning: 'Com a vossa prestimosa ajuda' }]
    },
    'adeus': {
      target: 'Tukalimõla',
      pronunciation: 'Too-kah-lee-moh-lah',
      culturalNote: 'Promessa de reencontro fraterno com esperança no futuro.',
      breakdown: [{ term: 'Tukalimõla', meaning: 'Voltaremos a ver-nos / Até logo' }]
    },
    'amor': {
      target: 'Ocisola',
      pronunciation: 'Oh-chee-soh-lah',
      culturalNote: 'O amor abnegado e generoso que nutre a harmonia nas aldeias (imbos).',
      breakdown: [{ term: 'Ocisola', meaning: 'Afeição / amor sincero' }]
    },
    'paz': {
      target: 'Ombembwa',
      pronunciation: 'Ohm-behm-bwah',
      culturalNote: 'O estado de reconciliação, justiça e equilíbrio primordial no Onjango.',
      breakdown: [{ term: 'Ombembwa', meaning: 'Paz / harmonia comunitária' }]
    },
    'amigo': {
      target: 'Ekamba',
      pronunciation: 'Eh-kahm-bah',
      culturalNote: 'Aquele que senta ao redor da fogueira comunitária partilhando o saber.',
      breakdown: [{ term: 'Ekamba', meaning: 'Amigo de fé / companheiro' }]
    },
    'família': {
      target: 'Epata',
      pronunciation: 'Eh-pah-tah',
      culturalNote: 'O grande tronco familiar que abriga gerações de sábios e aprendizes.',
      breakdown: [{ term: 'Epata', meaning: 'Clã familiar / parentela' }]
    },
    'deus': {
      target: 'Suku',
      pronunciation: 'Soo-koo',
      culturalNote: 'O Criador do universo na espiritualidade tradicional dos Ovimbundu.',
      breakdown: [{ term: 'Suku', meaning: 'Deus / Senhor de todas as coisas' }]
    },
    'água': {
      target: 'Ovava',
      pronunciation: 'Oh-vah-vah',
      culturalNote: 'O manancial dos rios das montanhas do planalto que fecunda as lavras.',
      breakdown: [{ term: 'Ovava', meaning: 'Água pura' }]
    },
    'terra': {
      target: 'Ofeka',
      pronunciation: 'Oh-feh-kah',
      culturalNote: 'O torrão natal de Angola onde nascemos e cultivamos a dignidade.',
      breakdown: [{ term: 'Ofeka', meaning: 'País / nação / terra mãe' }]
    },
    'casa': {
      target: 'Onjo',
      pronunciation: 'Ohn-joh',
      culturalNote: 'O tecto acolhedor onde reina o respeito mútuo e a hospitalidade bantu.',
      breakdown: [{ term: 'Onjo', meaning: 'Casa / moradia' }]
    },
  },

  // KIKONGO
  'kikongo': {
    'olá': {
      target: 'Mbote',
      pronunciation: 'M-boh-teh',
      culturalNote: 'A saudação ancestral do histórico Reino do Congo, desejando luz e saúde.',
      breakdown: [{ term: 'Mbote', meaning: 'Paz / olá / bondade' }]
    },
    'oi': {
      target: 'Mbote',
      pronunciation: 'M-boh-teh',
      culturalNote: 'A saudação ancestral do histórico Reino do Congo, desejando luz e saúde.',
      breakdown: [{ term: 'Mbote', meaning: 'Paz / olá / bondade' }]
    },
    'bom dia': {
      target: 'Mbote za mene',
      pronunciation: 'M-boh-teh zah meh-neh',
      culturalNote: 'Saudação matinal desejando bênçãos ao acordar para mais um dia de vida.',
      breakdown: [
        { term: 'Mbote', meaning: 'Saudações de bem' },
        { term: 'za mene', meaning: 'da manhã' }
      ]
    },
    'boa tarde': {
      target: 'Mbote za masika',
      pronunciation: 'M-boh-teh zah mah-see-kah',
      culturalNote: 'Votos de uma tarde serena enquanto o trabalho diário se encerra.',
      breakdown: [
        { term: 'Mbote', meaning: 'Saudações' },
        { term: 'za masika', meaning: 'da tarde' }
      ]
    },
    'boa noite': {
      target: 'Mbote za fuku',
      pronunciation: 'M-boh-teh zah foo-koo',
      culturalNote: 'Proteção noturna para repouso sereno da família e da comunidade.',
      breakdown: [
        { term: 'Mbote', meaning: 'Saudações' },
        { term: 'za fuku', meaning: 'da noite' }
      ]
    },
    'como estás': {
      target: 'Nkia nsangu?',
      pronunciation: 'N-kee-ah n-sahn-goo?',
      culturalNote: 'Inquérito amistoso perguntando que boas notícias traz o interlocutor.',
      breakdown: [{ term: 'Nkia nsangu', meaning: 'Que novidades / Como estás?' }]
    },
    'como você está': {
      target: 'Nkia nsangu?',
      pronunciation: 'N-kee-ah n-sahn-goo?',
      culturalNote: 'Inquérito amistoso perguntando que boas notícias traz o interlocutor.',
      breakdown: [{ term: 'Nkia nsangu', meaning: 'Que novidades / Como estás?' }]
    },
    'tudo bem': {
      target: 'Nsangu zambote',
      pronunciation: 'N-sahn-goo zahm-boh-teh',
      culturalNote: 'Confirmação de que as notícias são boas e o espírito está em paz.',
      breakdown: [{ term: 'Nsangu zambote', meaning: 'Boas notícias / Tudo em ordem' }]
    },
    'obrigado': {
      target: 'Matondo',
      pronunciation: 'Mah-tohn-doh',
      culturalNote: 'Obrigado tradicional que reverencia a ação fraterna recebida.',
      breakdown: [{ term: 'Matondo', meaning: 'Gratidão / Agradecimento' }]
    },
    'muito obrigado': {
      target: 'Matondo beni',
      pronunciation: 'Mah-tohn-doh beh-nee',
      culturalNote: 'Obrigado profundo que exalta a generosidade do outro com louvor.',
      breakdown: [
        { term: 'Matondo', meaning: 'Agradecimentos' },
        { term: 'beni', meaning: 'muito / em abundância' }
      ]
    },
    'por favor': {
      target: 'Dodokolo',
      pronunciation: 'Doh-doh-koh-loh',
      culturalNote: 'Fórmula de cortesia e respeito solene em Kikongo.',
      breakdown: [{ term: 'Dodokolo', meaning: 'Por mercê / por favor' }]
    },
    'amor': {
      target: 'Zola',
      pronunciation: 'Zoh-lah',
      culturalNote: 'Sentimento de devoção e afeição imorredoura na língua dos Bakongo.',
      breakdown: [{ term: 'Zola', meaning: 'Amar / o amor' }]
    },
    'paz': {
      target: 'Ngemba',
      pronunciation: 'N-gehm-bah',
      culturalNote: 'A serenidade suprema que afasta discórdias e une as linhagens.',
      breakdown: [{ term: 'Ngemba', meaning: 'Paz sagrada / concórdia' }]
    },
    'amigo': {
      target: 'Nkundi',
      pronunciation: 'N-koon-dee',
      culturalNote: 'Irmão de escolha e companheiro inseparável na jornada humana.',
      breakdown: [{ term: 'Nkundi', meaning: 'Amigo leal' }]
    },
    'família': {
      target: 'Kanda',
      pronunciation: 'Kahn-dah',
      culturalNote: 'A grande linhagem que liga os vivos, os nascituros e os ancestrais.',
      breakdown: [{ term: 'Kanda', meaning: 'Clã ancestral / família' }]
    },
    'deus': {
      target: 'Nzambi Mpungu',
      pronunciation: 'N-zahm-bee M-poon-goo',
      culturalNote: 'O Deus Altíssimo dos antepassados do Congo e criador de todas as criaturas.',
      breakdown: [{ term: 'Nzambi Mpungu', meaning: 'Deus Supremo' }]
    },
  },

  // COKWE
  'cokwe': {
    'olá': {
      target: 'Menekenu',
      pronunciation: 'Meh-neh-keh-noo',
      culturalNote: 'Saudação nobre tradicional Lunda-Cokwe para dar as boas-vindas com honra.',
      breakdown: [{ term: 'Menekenu', meaning: 'Saudações com honra e respeito' }]
    },
    'oi': {
      target: 'Menekenu',
      pronunciation: 'Meh-neh-keh-noo',
      culturalNote: 'Saudação nobre tradicional Lunda-Cokwe para dar as boas-vindas com honra.',
      breakdown: [{ term: 'Menekenu', meaning: 'Saudações com honra e respeito' }]
    },
    'bom dia': {
      target: 'Chimene chipema',
      pronunciation: 'Chee-meh-neh chee-peh-mah',
      culturalNote: 'Bênção matinal desejando luz e força para as tarefas do dia.',
      breakdown: [
        { term: 'Chimene', meaning: 'Manhã' },
        { term: 'chipema', meaning: 'boa / pura' }
      ]
    },
    'boa tarde': {
      target: 'Mweji upema',
      pronunciation: 'Mweh-jee oo-peh-mah',
      culturalNote: 'Votos de uma tarde produtiva e segura no leste angolano.',
      breakdown: [
        { term: 'Mweji', meaning: 'Tarde / sol' },
        { term: 'upema', meaning: 'boa' }
      ]
    },
    'boa noite': {
      target: 'Ufuku upema',
      pronunciation: 'Oo-foo-koo oo-peh-mah',
      culturalNote: 'Desejo de noite tranquila e sono reconfortante sob a bênção divina.',
      breakdown: [
        { term: 'Ufuku', meaning: 'Noite' },
        { term: 'upema', meaning: 'boa e calma' }
      ]
    },
    'como estás': {
      target: 'Mwali chipema?',
      pronunciation: 'Mwah-lee chee-peh-mah?',
      culturalNote: 'Inquérito de respeito sobre o bem-estar e saúde do interlocutor.',
      breakdown: [{ term: 'Mwali chipema', meaning: 'Estás bem e de boa saúde?' }]
    },
    'obrigado': {
      target: 'Sakwilenu',
      pronunciation: 'Sah-kwee-leh-noo',
      culturalNote: 'Agradecimento solene que celebra a aliança de respeito entre falantes.',
      breakdown: [{ term: 'Sakwilenu', meaning: 'Agradecemos de coração' }]
    },
    'muito obrigado': {
      target: 'Twasakwilila chinene',
      pronunciation: 'Twah-sah-kwee-lee-lah chee-neh-neh',
      culturalNote: 'Expressão profunda de apreço e reconhecimento coletivo na arte Cokwe.',
      breakdown: [
        { term: 'Twasakwilila', meaning: 'Nós agradecemos' },
        { term: 'chinene', meaning: 'grandemente / com fervor' }
      ]
    },
    'amor': {
      target: 'Zango',
      pronunciation: 'Zahn-goh',
      culturalNote: 'Sentimento nobre e criativo que inspira a arte Sona e a sabedoria dos mais velhos.',
      breakdown: [{ term: 'Zango', meaning: 'Amor fraterno e leal' }]
    },
    'paz': {
      target: 'Sambokeno',
      pronunciation: 'Sahm-boh-keh-noh',
      culturalNote: 'A serenidade que floresce quando a sabedoria e a justiça reinam.',
      breakdown: [{ term: 'Sambokeno', meaning: 'Paz / sossego social' }]
    },
    'pensador': {
      target: 'Samanyonga',
      pronunciation: 'Sah-mah-nyohn-gah',
      culturalNote: 'Símbolo maior da cultura e identidade nacional de Angola, esculpido na madeira.',
      breakdown: [{ term: 'Samanyonga', meaning: 'Aquele que pondera / O Pensador' }]
    },
    'coração': {
      target: 'Muchima',
      pronunciation: 'Moo-chee-mah',
      culturalNote: 'A morada da intuição e dos sentimentos mais profundos na filosofia bantu.',
      breakdown: [{ term: 'Muchima', meaning: 'Coração / mente do sentimento' }]
    },
  },
};

// Normalize string for fuzzy lookup (strip accents, punctuation, lowercase)
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[?!.,;:'"()]/g, '')
    .trim();
}

export function findCorpusTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
): TranslationResult | null {
  const norm = normalizeText(text);
  if (!norm) return null;

  // 1. Direct match: Portuguese -> National Language
  if (sourceLang === 'pt') {
    const langDict = CORPUS[targetLang];
    if (langDict) {
      // Exact match first
      if (langDict[norm]) {
        const item = langDict[norm];
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
          suggestImprovementNeeded: false,
        };
      }

      // Check substring match
      for (const [key, item] of Object.entries(langDict)) {
        if (norm.includes(key) || key.includes(norm)) {
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
            suggestImprovementNeeded: false,
          };
        }
      }
    }
  }

  // 2. Reverse match: National Language -> Portuguese
  if (targetLang === 'pt') {
    const langDict = CORPUS[sourceLang];
    if (langDict) {
      for (const [ptPhrase, item] of Object.entries(langDict)) {
        const normTarget = normalizeText(item.target);
        if (normTarget === norm || norm.includes(normTarget) || normTarget.includes(norm)) {
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
            suggestImprovementNeeded: false,
          };
        }
      }
    }
  }

  return null;
}
