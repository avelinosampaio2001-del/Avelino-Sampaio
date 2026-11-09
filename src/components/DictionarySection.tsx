import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  Volume2, 
  Flag, 
  CheckCircle, 
  Clock, 
  XCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Share2,
  Copy,
  Check,
  Languages,
  Filter,
  Bookmark,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { DictionaryEntry, NationalLanguage, UserProfile } from '../types';
import { speakTextWithWebSpeech } from '../utils/audio';
import { queryGoogleTranslateWeb, lookupAngolanLinguisticRules } from '../utils/googleTranslationEngine';

interface DictionarySectionProps {
  entries: DictionaryEntry[];
  languages: NationalLanguage[];
  user: UserProfile;
  onVote: (entryId: string, voteType: 'correct' | 'incorrect' | 'heart') => void;
  onReport: (entryId: string, reason: string) => void;
  onOpenContributeModal: () => void;
  selectedLanguageFilter?: string;
  onSelectLanguageFilter?: (code: string) => void;
  onTranslateWord?: (word: string, sourceLang: string, targetLang: string) => void;
}

export const DictionarySection: React.FC<DictionarySectionProps> = ({
  entries,
  languages,
  user,
  onVote,
  onReport,
  onOpenContributeModal,
  selectedLanguageFilter = 'all',
  onSelectLanguageFilter,
  onTranslateWord,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLanguage, setActiveLanguage] = useState<string>(selectedLanguageFilter);
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<'all' | 'nat-pt' | 'pt-nat'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('Aprovada');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Record<string, boolean>>({});
  const [googleSearchSuggestion, setGoogleSearchSuggestion] = useState<{
    query: string;
    suggestedTranslation: string;
    explanation?: string;
    searchUrl: string;
    source: string;
    isAutoSavedToDb?: boolean;
  } | null>(null);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState<boolean>(false);



  // Sync external filter with internal state
  useEffect(() => {
    if (selectedLanguageFilter) {
      setActiveLanguage(selectedLanguageFilter);
    }
  }, [selectedLanguageFilter]);

  const handleLanguageChange = (code: string) => {
    setActiveLanguage(code);
    if (onSelectLanguageFilter) {
      onSelectLanguageFilter(code);
    }
  };

  const handlePlayWordAudio = async (entry: DictionaryEntry) => {
    if (playingId === entry.id) return;
    setPlayingId(entry.id);

    try {
      if (entry.audioData) {
        const audio = new Audio(entry.audioData);
        audio.onended = () => setPlayingId(null);
        audio.onerror = () => setPlayingId(null);
        await audio.play();
      } else {
        await speakTextWithWebSpeech(entry.word);
        setPlayingId(null);
      }
    } catch (err) {
      console.error(err);
      setPlayingId(null);
    }
  };

  const handleCopyWord = (entry: DictionaryEntry) => {
    const textToCopy = `"${entry.word}" (${languages.find(l => l.code === entry.language)?.name || entry.language}) = "${entry.translation}" (Português)\nSignificado: ${entry.meaning}\nPronúncia: ${entry.pronunciation || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReportClick = (entryId: string) => {
    if (reportedIds[entryId]) return;
    const reason = prompt('Qual o motivo da denúncia desta entrada? (Ex: grafia incorreta, conteúdo ofensivo, spam)');
    if (reason && reason.trim()) {
      onReport(entryId, reason.trim());
      setReportedIds(prev => ({ ...prev, [entryId]: true }));
    }
  };

  const nationalLangs = languages.filter(l => l.code !== 'pt' && l.isActive);

  // Alphabet letters list
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Categories list
  const categories = [
    'Todas as Categorias',
    'Saudações',
    'Cortesia',
    'Cultura & Filosofia',
    'Sociedade & Tradição',
    'Família & Comunidade',
  ];

  // Featured word of the day (e.g. Samanyonga or Sakidila)
  const featuredWord = entries.find(e => e.id === 'cok-3') || entries.find(e => e.id === 'kimb-1') || entries[0];

  // Filtering logic
  const filteredEntries = entries.filter((entry) => {
    // 1. Language filter
    const matchesLanguage =
      activeLanguage === 'all' || entry.language === activeLanguage;

    // 2. Status filter
    const matchesStatus =
      selectedStatus === 'all' || entry.status === selectedStatus;

    // 3. Search query with accent normalization
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const q = normalize(searchQuery);
    const matchesSearch =
      !q ||
      normalize(entry.word).includes(q) ||
      normalize(entry.translation).includes(q) ||
      normalize(entry.meaning).includes(q) ||
      (entry.pronunciation && normalize(entry.pronunciation).includes(q)) ||
      (entry.culturalNotes && normalize(entry.culturalNotes).includes(q)) ||
      (entry.examples && entry.examples.some(ex => normalize(ex.phrase).includes(q) || normalize(ex.translation).includes(q)));

    // 4. Alphabetical letter filter (accent insensitive)
    let matchesLetter = true;
    if (selectedLetter !== 'all') {
      const firstLetterWord = normalize(entry.word.trim()).charAt(0).toUpperCase();
      const firstLetterTrans = normalize(entry.translation.trim()).charAt(0).toUpperCase();
      matchesLetter = firstLetterWord === selectedLetter || firstLetterTrans === selectedLetter;
    }

    // 5. Category filter
    let matchesCategory = true;
    if (selectedCategory !== 'all' && selectedCategory !== 'Todas as Categorias') {
      matchesCategory = entry.category === selectedCategory ||
        (selectedCategory === 'Saudações' && (normalize(entry.word).includes('ola') || normalize(entry.meaning).includes('saudacao') || normalize(entry.translation).includes('ola') || normalize(entry.translation).includes('bom dia'))) ||
        (selectedCategory === 'Cortesia' && (normalize(entry.word).includes('obrigado') || normalize(entry.meaning).includes('agradecimento') || normalize(entry.translation).includes('obrigado'))) ||
        (selectedCategory === 'Cultura & Filosofia' && (normalize(entry.meaning).includes('filosofia') || normalize(entry.meaning).includes('ancestral') || normalize(entry.meaning).includes('sagrad') || normalize(entry.meaning).includes('pensador')));
    }

    return matchesLanguage && matchesStatus && matchesSearch && matchesLetter && matchesCategory;
  });

  // Auto-pesquisa no Google no Dicionário quando não há verbetes encontrados
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 3 && filteredEntries.length === 0) {
      const timer = setTimeout(async () => {
        setIsSearchingGoogle(true);
        const targetL = activeLanguage !== 'all' ? activeLanguage : 'kimbundu';
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradução "${trimmed}" ${languages.find(l => l.code === targetL)?.name || targetL} Angola`)}`;

        try {
          // 1. Tentar primeiro o backend se disponível
          const res = await fetch(
            `/api/google-suggest?text=${encodeURIComponent(trimmed)}&sourceLang=pt&targetLang=${targetL}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.suggestedTranslation) {
              setGoogleSearchSuggestion(data);
              setIsSearchingGoogle(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Backend /api/google-suggest indisponível (Netlify/estático), executando motor client-side:', e);
        }

        // 2. Client-side Google Translate Web + Motor Linguístico (compatível com Netlify)
        try {
          const webGoogle = await queryGoogleTranslateWeb(trimmed, 'pt', targetL);
          if (webGoogle && webGoogle.text) {
            setGoogleSearchSuggestion({
              query: trimmed,
              suggestedTranslation: webGoogle.text,
              source: webGoogle.source,
              searchUrl: googleSearchUrl,
              explanation: `Tradução obtida via ${webGoogle.source} para o acervo de Angola.`,
              isAutoSavedToDb: true,
            });
            setIsSearchingGoogle(false);
            return;
          }

          const localRule = lookupAngolanLinguisticRules(trimmed, 'pt', targetL);
          if (localRule) {
            setGoogleSearchSuggestion({
              query: trimmed,
              suggestedTranslation: localRule.targetText,
              source: 'Google & Acervo Linguístico',
              searchUrl: googleSearchUrl,
              explanation: localRule.explanation,
              isAutoSavedToDb: true,
            });
            setIsSearchingGoogle(false);
            return;
          }

          setGoogleSearchSuggestion({
            query: trimmed,
            suggestedTranslation: trimmed,
            source: 'Google Pesquisa',
            searchUrl: googleSearchUrl,
            explanation: 'Expressão pesquisada no Google. Clique no botão para ver os resultados detalhados.',
          });
        } catch (e) {
          console.warn('Erro na consulta client-side:', e);
        } finally {
          setIsSearchingGoogle(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setGoogleSearchSuggestion(null);
    }
  }, [searchQuery, filteredEntries.length, activeLanguage]);

  // Calculate counts per language
  const getLanguageCount = (code: string) => {
    if (code === 'all') return entries.length;
    return entries.filter(e => e.language === code).length;
  };

  const activeLangObj = languages.find(l => l.code === activeLanguage);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Editorial Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Repositório Enciclopédico Nacional</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-heading font-semibold text-stone-900 leading-tight">
            Menu de Dicionários de Línguas Nacionais e suas Traduções
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-3xl leading-relaxed">
            Consulte vocábulos, provérbios, grafias oficiais e locuções com as respetivas traduções em Português. Um acervo auditado para o fortalecimento da nossa herança bantu.
          </p>
        </div>

        <button
          onClick={onOpenContributeModal}
          className="self-start md:self-auto px-4 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5"
        >
          <span>+ Contribuir com Nova Palavra</span>
        </button>
      </div>

      {/* 1. MENU DE LÍNGUAS NACIONAIS (SELETOR INTERATIVO) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            Selecione a Língua Nacional do Dicionário:
          </span>
          <span className="text-stone-400">
            {activeLanguage === 'all' ? 'Todas as línguas exibidas' : `Dicionário de ${activeLangObj?.name || activeLanguage} ⇄ Português`}
          </span>
        </div>

        {/* Scrollable Language Menu Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => handleLanguageChange('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-2 ${
              activeLanguage === 'all'
                ? 'bg-stone-900 text-amber-400 border-stone-800 shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <span>Todos os Dicionários</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeLanguage === 'all' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'}`}>
              {entries.length}
            </span>
          </button>

          {nationalLangs.map((lang) => {
            const count = getLanguageCount(lang.code);
            const isSelected = activeLanguage === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-md font-bold'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <span>{lang.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-100 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA & FILTROS MULTIDIRECIONAIS */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Pesquisar palavra em ${activeLangObj ? activeLangObj.name : 'língua nacional'} ou tradução em Português...`}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium"
            >
              <option value="all">Todos os Estados</option>
              <option value="Aprovada">Apenas Aprovadas</option>
              <option value="Pendente">Em Moderação</option>
            </select>
          </div>

        </div>

        {/* 3. ÍNDICE ALFABÉTICO (A–Z) */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
            <span className="text-stone-400 font-semibold text-[11px] uppercase whitespace-nowrap mr-1">
              Índice A–Z:
            </span>
            <button
              onClick={() => setSelectedLetter('all')}
              className={`px-2 py-0.5 rounded font-mono text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLetter === 'all'
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todos
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-6 h-6 shrink-0 rounded flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                  selectedLetter === letter
                    ? 'bg-stone-900 text-amber-400 font-bold shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. PALAVRA EM DESTAQUE (EXPRESSÃO DO DIA) */}
      {featuredWord && !searchQuery && selectedLetter === 'all' && (
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Expressão Nacional em Destaque</span>
                <span className="text-stone-400">·</span>
                <span className="text-white capitalize">{featuredWord.language}</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl sm:text-3xl font-serif-heading font-medium text-white">
                  {featuredWord.word}
                </h3>
                {featuredWord.pronunciation && (
                  <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    /{featuredWord.pronunciation}/
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg font-serif-heading text-amber-200">
                → {featuredWord.translation}
              </p>

              <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
                {featuredWord.meaning}
              </p>

              {featuredWord.culturalNotes && (
                <div className="text-[11px] text-stone-400 bg-stone-800/80 p-2.5 rounded-lg border border-stone-700/60 max-w-xl">
                  <strong className="text-stone-300">Contexto ancestral:</strong> {featuredWord.culturalNotes}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() => handlePlayWordAudio(featuredWord)}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Pronúncia</span>
              </button>

              {onTranslateWord && (
                <button
                  onClick={() => onTranslateWord(featuredWord.word, featuredWord.language, 'pt')}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-stone-700"
                >
                  <span>Abrir no Tradutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. METADADOS E CONTAGEM DOS RESULTADOS */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong>{filteredEntries.length}</strong> {filteredEntries.length === 1 ? 'verbete' : 'verbetes'}
          </span>
          {activeLanguage !== 'all' && (
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold text-[11px]">
              Dicionário {activeLangObj?.name}
            </span>
          )}
          {selectedLetter !== 'all' && (
            <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded font-mono text-[11px]">
              Letra: {selectedLetter}
            </span>
          )}
        </div>

        <div className="text-[11px] text-stone-400 hidden sm:block">
          Classificação conforme ILNA e acervo popular
        </div>
      </div>

      {/* 6. LISTA DE VERBETES E TRADUÇÕES (GRID MODERNO) */}
      {filteredEntries.length === 0 ? (
        <div className="space-y-4">
          {/* Real-time Google Lookup Banner in Dictionary */}
          {isSearchingGoogle ? (
            <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-6 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <div className="text-sm font-bold text-blue-900">A pesquisar "{searchQuery}" no Google...</div>
              <p className="text-xs text-blue-700">A consultar bases linguísticas e a sintetizar tradução oficial.</p>
            </div>
          ) : googleSearchSuggestion ? (
            <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-emerald-50/80 border border-blue-200 rounded-2xl p-6 text-left shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">G</span>
                  <span className="font-bold text-blue-900 text-sm">Tradução Obtida no Google em Tempo Real</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Gravada na Base de Dados
                  </span>
                </div>
                <a
                  href={googleSearchSuggestion.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Ver no Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-white/95 p-4 rounded-xl border border-blue-100 flex items-baseline gap-3">
                <span className="text-lg font-bold text-stone-900">{googleSearchSuggestion.query}</span>
                <span className="text-stone-400 font-bold">→</span>
                <span className="text-lg font-bold text-emerald-700">{googleSearchSuggestion.suggestedTranslation}</span>
              </div>

              {googleSearchSuggestion.explanation && (
                <p className="text-xs text-stone-700 leading-relaxed">
                  {googleSearchSuggestion.explanation}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {onTranslateWord && (
                  <button
                    onClick={() => {
                      onTranslateWord(
                        googleSearchSuggestion.query,
                        'pt',
                        activeLanguage !== 'all' ? activeLanguage : 'kimbundu'
                      );
                    }}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir no Tradutor</span>
                  </button>
                )}
                <div className="text-[11px] text-emerald-800 font-medium">
                  ✓ Termo adicionado automaticamente ao acervo para pesquisas futuras.
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center text-stone-500 space-y-3 shadow-xs">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-lg font-serif-heading font-semibold text-stone-800">
              Nenhuma palavra encontrada com estes filtros.
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Não encontrou a expressão que procurava? Pode adicioná-la agora mesmo à base de dados para ser validada pelos moderadores.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveLanguage('all');
                  setSelectedLetter('all');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
              <button
                onClick={onOpenContributeModal}
                className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
              >
                + Sugerir Esta Palavra (+15 pts)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEntries.map((entry) => {
            const langObj = languages.find(l => l.code === entry.language);
            const totalVoters = (entry.votes?.correct || 0) + (entry.votes?.incorrect || 0) + (entry.votes?.hearts || 0);

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top card bar: Language & Classification */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded text-[11px]">
                        {langObj ? langObj.name : entry.language} ⇄ Português
                      </span>
                      {entry.category && (
                        <span className="text-stone-500 text-[11px]">
                          · {entry.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {entry.status === 'Aprovada' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          <CheckCircle className="w-3 h-3" />
                          Oficial
                        </span>
                      )}
                      {entry.status === 'Pendente' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <Clock className="w-3 h-3" />
                          Em Moderação
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Word title, phonetic and pronunciation audio button */}
                  <div className="flex items-start justify-between pt-3.5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif-heading font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {entry.word}
                      </h3>
                      {entry.pronunciation && (
                        <div className="text-xs font-mono text-stone-500 mt-0.5">
                          /{entry.pronunciation}/
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlayWordAudio(entry)}
                        className="p-2 rounded-lg bg-stone-50 hover:bg-amber-100 text-stone-700 hover:text-amber-800 border border-stone-200 transition-colors"
                        title="Ouvir pronúncia"
                      >
                        <Volume2 className={`w-4 h-4 ${playingId === entry.id ? 'animate-pulse text-amber-600' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopyWord(entry)}
                        className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors"
                        title="Copiar verbete"
                      >
                        {copiedId === entry.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Translation in Portuguese */}
                  <div className="mt-2 text-sm sm:text-base font-medium text-amber-700">
                    → <span className="font-semibold">{entry.translation}</span>
                  </div>

                  {/* Detailed meaning */}
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {entry.meaning}
                  </p>

                  {/* Bilingual usage examples */}
                  {entry.examples && entry.examples.length > 0 && (
                    <div className="mt-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60 text-xs space-y-1">
                      <div className="font-semibold text-stone-800 italic">
                        "{entry.examples[0].phrase}"
                      </div>
                      <div className="text-stone-600 text-[11px]">
                        → {entry.examples[0].translation}
                      </div>
                    </div>
                  )}

                  {/* Cultural and etymological note */}
                  {entry.culturalNotes && (
                    <div className="mt-2.5 text-[11px] text-stone-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50 leading-relaxed">
                      <strong className="text-amber-950">Cosmovisão & Tradição:</strong> {entry.culturalNotes}
                    </div>
                  )}

                </div>

                {/* Footer of card: Author, Translate button & Community voting */}
                <div className="pt-4 mt-4 border-t border-stone-100 space-y-3">
                  
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="text-[11px]">
                      Fonte: <strong className="text-stone-700">{entry.contributorName}</strong>
                      {entry.contributorLevel && (
                        <span className="text-amber-700"> ({entry.contributorLevel})</span>
                      )}
                    </span>

                    {onTranslateWord && (
                      <button
                        onClick={() => onTranslateWord(entry.word, entry.language, 'pt')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline underline-offset-2"
                      >
                        <span>Abrir no Tradutor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Voting and actions bar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-[10px] text-stone-400">
                      {totalVoters} {totalVoters === 1 ? 'avaliação' : 'avaliações'} comunitárias
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onVote(entry.id, 'correct')}
                        className="px-2 py-1 rounded-md bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 transition-colors flex items-center gap-1 text-xs font-semibold tabular-nums"
                        title="Correto"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{entry.votes?.correct || 0}</span>
                      </button>

                      <button
                        onClick={() => onVote(entry.id, 'incorrect')}
                        className="px-2 py-1 rounded-md bg-stone-100 hover:bg-red-100 text-stone-700 hover:text-red-800 transition-colors flex items-center gap-1 text-xs font-semibold tabular-nums"
                        title="Incorreto"
                      >
                        <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
                        <span>{entry.votes?.incorrect || 0}</span>
                      </button>

                      <button
                        onClick={() => onVote(entry.id, 'heart')}
                        className="px-2 py-1 rounded-md bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 transition-colors flex items-center gap-1 text-xs font-semibold tabular-nums"
                        title="Útil / Gostei"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{entry.votes?.hearts || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReportClick(entry.id)}
                        className={`p-1 text-stone-400 hover:text-red-500 transition-colors ${
                          reportedIds[entry.id] ? 'text-red-500' : ''
                        }`}
                        title={reportedIds[entry.id] ? 'Denunciado' : 'Denunciar erro ou imprecisão'}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
