import { TranslationResult, DictionaryEntry } from '../types';

/**
 * Mapeamento dos códigos de línguas para o Google Tradutor e DuckDuckGo / fontes web
 */
export const GOOGLE_LANG_CODES: Record<string, string> = {
  pt: 'pt',
  kikongo: 'kg', // Kikongo / Kongo oficial no Google Tradutor
  fiote: 'kg',   // Fiote (Ibinda) é variante de Kikongo
  lingala: 'ln', // Lingala oficial no Google Tradutor
  swahili: 'sw', // Kiswahili
};

/**
 * Consulta direta aos serviços web do Google Tradutor pelo frontend (funciona 100% no Netlify, Vercel ou qualquer hosting estático sem backend)
 */
export async function queryGoogleTranslateWeb(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; source: string } | null> {
  const clean = text.trim();
  if (!clean) return null;

  // 1. Tentar código específico do Google Tradutor se suportado (ex: Kikongo -> kg, Português -> pt)
  const targetCode = GOOGLE_LANG_CODES[targetLang] || (targetLang === 'pt' ? 'pt' : null);
  const sourceCode = GOOGLE_LANG_CODES[sourceLang] || (sourceLang === 'pt' ? 'pt' : 'auto');

  if (targetCode && targetCode !== sourceCode) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const translated = String(data[0][0][0]).trim();
          if (translated && translated.toLowerCase() !== clean.toLowerCase()) {
            return {
              text: translated,
              source: 'Google Tradutor (Web)',
            };
          }
        }
      }
    } catch (e) {
      // Ignora e continua para o motor inteligente
    }
  }

  // 2. Consulta automática de sugestões no Google (Google AutoComplete / Linguistic Knowledge)
  try {
    const query = `tradução ${clean} ${targetLang === 'pt' ? 'português' : targetLang} angola`;
    const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const res = await fetch(suggestUrl, { mode: 'cors' });
    if (res.ok) {
      const data = await res.json();
      const suggestions: string[] = data[1] || [];
      for (const item of suggestions) {
        const lowerItem = item.toLowerCase();
        // Verificar se contém tradução direta
        if (lowerItem.includes('significa') || lowerItem.includes('quer dizer') || lowerItem.includes('traducao')) {
          const parts = item.split(/significa|quer dizer|traducao|:/i);
          if (parts[1]) {
            const candidate = parts[1].replace(/["'.]/g, '').trim();
            if (candidate && candidate.length > 1) {
              return {
                text: candidate,
                source: 'Google Busca & Redes',
              };
            }
          }
        }
      }
    }
  } catch (e) {
    // Continuar
  }

  return null;
}

/**
 * Consulta de vocabulário e padrões fonéticos das línguas de Angola (disponível offline no Netlify)
 */
export function lookupAngolanLinguisticRules(
  text: string,
  sourceLang: string,
  targetLang: string
): { targetText: string; pronunciation: string; explanation: string } | null {
  const norm = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Dicionário etimológico e de raízes Bantu essenciais
  const BANTU_COMMON_ROOTS: Record<string, Record<string, { trans: string; pron: string; note: string }>> = {
    kimbundu: {
      'paz': { trans: 'Kutululuka / Wimbu', pron: 'koo-too-loo-loo-kah', note: 'Estado de harmonia e serenidade na comunidade.' },
      'amor': { trans: 'Kuzola', pron: 'koo-zoh-lah', note: 'O afeto, dedicação e união entre os seres humanos.' },
      'vida': { trans: 'Mwenyu', pron: 'mweh-nyoo', note: 'O sopro vital e a existência concedida pelos antepassados e por Nzambi.' },
      'força': { trans: 'Ngolo', pron: 'n-goh-loh', note: 'A energia moral, física e espiritual do guerreiro e do trabalhador.' },
      'amigo': { trans: 'Kamba', pron: 'kahm-bah', note: 'Irmão de alma e companheiro leal.' },
      'irmão': { trans: 'Pange', pron: 'pahn-geh', note: 'Laço fraternal de sangue ou de comunidade.' },
      'mãe': { trans: 'Mama', pron: 'mah-mah', note: 'Figura venerada de respeito e acolhimento na família bantu.' },
      'pai': { trans: 'Tata', pron: 'tah-tah', note: 'Patriarca e guardião dos costumes.' },
      'filho': { trans: 'Mona', pron: 'moh-nah', note: 'Descendente e continuador da linhagem familiar.' },
      'trabalho': { trans: 'Kálakalu', pron: 'kah-lah-kah-loo', note: 'Ação diária produtiva em prol do sustento familiar.' },
      'caminho': { trans: 'Njila', pron: 'n-jee-lah', note: 'Estrada física ou rumo moral a seguir.' },
      'estudante': { trans: 'Mulongoki', pron: 'moo-lohn-goh-kee', note: 'Aquele que aprende e assimila o saber.' },
      'professor': { trans: 'Mulongi', pron: 'moo-lohn-gee', note: 'O mestre que transmite sabedoria aos mais novos.' },
      'escola': { trans: 'Xikola', pron: 'shee-koh-lah', note: 'Lugar de instrução e formação.' },
      'falar': { trans: 'Kuzwela', pron: 'koo-zweh-lah', note: 'A arte do diálogo e da palavra viva.' },
      'alegria': { trans: 'Kusanguluka', pron: 'koo-sahn-goo-loo-kah', note: 'Júbilo coletivo, festa e dança na comunidade.' },
    },
    umbundu: {
      'paz': { trans: 'Ombembwa', pron: 'ohm-behm-bwah', note: 'Paz profunda e concórdia no seio dos Ovimbundu.' },
      'amor': { trans: 'Ocisola', pron: 'oh-chee-soh-lah', note: 'Sentimento nobre de carinho e generosidade.' },
      'vida': { trans: 'Omuenyo', pron: 'oh-mweh-nyoh', note: 'Princípio vital presente em todos os viventes.' },
      'força': { trans: 'Ongusu', pron: 'ohn-goo-soo', note: 'Vigor corporal e firmeza de espírito.' },
      'amigo': { trans: 'Ekamba', pron: 'eh-kahm-bah', note: 'Companheiro fiel de jornada.' },
      'mãe': { trans: 'Ina', pron: 'ee-nah', note: 'A matriarca e esteio do lar.' },
      'pai': { trans: 'Tate', pron: 'tah-teh', note: 'Pai de família digno de consideração.' },
      'filho': { trans: 'Omõla', pron: 'oh-moh-lah', note: 'A semente da família Ovimbundu.' },
      'trabalho': { trans: 'Upange', pron: 'oo-pahn-geh', note: 'Labor cotidiano nas lavras e ofícios.' },
      'caminho': { trans: 'Onjila', pron: 'ohn-jee-lah', note: 'Caminho entre as aldeias.' },
      'estudante': { trans: 'Ulongiwa', pron: 'oo-lohn-gee-wah', note: 'Aprendiz do conhecimento.' },
      'escola': { trans: 'Osikola', pron: 'oh-see-koh-lah', note: 'Espaço de aprendizagem.' },
      'falar': { trans: 'Okuvanga', pron: 'oh-koo-vahn-gah', note: 'Pronunciar o verbo e partilhar a fala.' },
      'alegria': { trans: 'Esanju', pron: 'eh-sahn-joo', note: 'Felicidade e regozijo compartilhado.' },
    },
    kikongo: {
      'paz': { trans: 'Ngemba', pron: 'n-gehm-bah', note: 'A paz divina e social no histórico Reino do Congo.' },
      'amor': { trans: 'Zola', pron: 'zoh-lah', note: 'O amor puro que conecta os corações.' },
      'vida': { trans: 'Moyo', pron: 'moh-yoh', note: 'A vida, a alma e o fôlego existencial.' },
      'força': { trans: 'Ngolo', pron: 'n-goh-loh', note: 'A força e firmeza moral.' },
      'amigo': { trans: 'Nkundi', pron: 'n-koon-dee', note: 'O companheiro de confiança mútua.' },
      'mãe': { trans: 'Ngudi', pron: 'n-goo-dee', note: 'Mãe amada e venerada.' },
      'pai': { trans: 'Se', pron: 'seh', note: 'Pai e líder familiar tradicional.' },
      'filho': { trans: 'Mwana', pron: 'mwah-nah', note: 'Criança ou filho querido.' },
      'trabalho': { trans: 'Salú', pron: 'sah-loo', note: 'Trabalho honrado com esforço e dedicação.' },
      'caminho': { trans: 'Nzila', pron: 'n-zee-lah', note: 'Vereda que conduz à sabedoria.' },
      'falar': { trans: 'Vova', pron: 'voh-vah', note: 'Proferir a verdade e dialogar.' },
      'alegria': { trans: 'Kiese', pron: 'kee-eh-seh', note: 'Alegria radiante no rosto do povo.' },
    },
    cokwe: {
      'paz': { trans: 'Sambkeno', pron: 'sahm-bkeh-noh', note: 'Harmonia e tranquilidade na terra Tchokwe.' },
      'amor': { trans: 'Zango', pron: 'zahn-goh', note: 'União fraternal e afeto profundo.' },
      'vida': { trans: 'Mwono', pron: 'mwoh-noh', note: 'A energia vital protegida pelos ritos sagrados.' },
      'amigo': { trans: 'Muka-wetu', pron: 'moo-kah-weh-too', note: 'Irmão de coração e companheiro de caça.' },
      'pensador': { trans: 'Samanyonga', pron: 'sah-mah-nyohn-gah', note: 'O filósofo ancestral que medita com sabedoria.' },
      'trabalho': { trans: 'Mulimo', pron: 'moo-lee-moh', note: 'O labor das mãos que esculpe a arte.' },
    }
  };

  // 1. Português -> Língua Nacional
  if (sourceLang === 'pt') {
    const langRoots = BANTU_COMMON_ROOTS[targetLang];
    if (langRoots && langRoots[norm]) {
      const match = langRoots[norm];
      return {
        targetText: match.trans,
        pronunciation: match.pron,
        explanation: match.note,
      };
    }
  }

  // 2. Língua Nacional -> Português (Reverso)
  if (targetLang === 'pt') {
    const langRoots = BANTU_COMMON_ROOTS[sourceLang];
    if (langRoots) {
      for (const [ptKey, val] of Object.entries(langRoots)) {
        const normTrans = val.trans.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normTrans.includes(norm) || norm === normTrans) {
          return {
            targetText: ptKey.charAt(0).toUpperCase() + ptKey.slice(1),
            pronunciation: val.pron,
            explanation: val.note,
          };
        }
      }
    }
  }

  return null;
}
