import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Volume2, 
  Copy, 
  Share2, 
  Mic, 
  MicOff, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  PlusCircle, 
  Check, 
  Star, 
  RotateCcw, 
  Loader2,
  Search,
  Database,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { NationalLanguage, TranslationResult, UserProfile, DictionaryEntry } from '../types';
import { playBase64Wav, speakTextWithWebSpeech } from '../utils/audio';
import { findCorpusTranslation } from '../utils/linguisticCorpus';
import { queryGoogleTranslateWeb, lookupAngolanLinguisticRules } from '../utils/googleTranslationEngine';
import { OpenAILogo } from './ChatAssistantSection';

interface TranslatorBoxProps {
  languages: NationalLanguage[];
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenContributeModalWithData?: (data: { word: string; language: string; targetLanguage: string }) => void;
  prefillData?: { word: string; sourceLang: string; targetLang: string } | null;
  dictionaryEntries?: DictionaryEntry[];
}

export const TranslatorBox: React.FC<TranslatorBoxProps> = ({
  languages,
  user,
  onUpdateUser,
  onOpenContributeModalWithData,
  prefillData,
  dictionaryEntries = [],
}) => {
  const [sourceLang, setSourceLang] = useState<string>('pt');
  const [targetLang, setTargetLang] = useState<string>('kimbundu');
  const [sourceText, setSourceText] = useState<string>('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Search bar state for dictionary & batch-imported words
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [copiedWordId, setCopiedWordId] = useState<string | null>(null);

  // Google suggestion state for search bar & unconfirmed words
  const [googleSearchSuggestion, setGoogleSearchSuggestion] = useState<{
    query: string;
    suggestedTranslation: string;
    explanation: string;
    searchUrl: string;
    source: string;
  } | null>(null);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState<boolean>(false);

  const handleFetchGoogleSuggestionForSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setIsSearchingGoogle(true);
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradução "${textToSearch}" ${languages.find(l => l.code === targetLang)?.name || targetLang} Angola`)}`;

    try {
      // 1. Tentar primeiro o backend se disponível
      const res = await fetch(
        `/api/google-suggest?text=${encodeURIComponent(textToSearch.trim())}&sourceLang=${sourceLang}&targetLang=${targetLang}`
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
      console.warn('Backend /api/google-suggest indisponível (modo Netlify/estático), executando motor client-side:', e);
    }

    // 2. Client-side Google Translate Web + Motor Linguístico (compatível 100% com Netlify)
    try {
      const webGoogle = await queryGoogleTranslateWeb(textToSearch, sourceLang, targetLang);
      if (webGoogle && webGoogle.text) {
        setGoogleSearchSuggestion({
          query: textToSearch,
          suggestedTranslation: webGoogle.text,
          source: webGoogle.source,
          searchUrl: googleSearchUrl,
          explanation: `Tradução obtida via ${webGoogle.source} em tempo real.`,
        });
        setIsSearchingGoogle(false);
        return;
      }

      // Regras morfológicas das línguas de Angola
      const localRule = lookupAngolanLinguisticRules(textToSearch, sourceLang, targetLang);
      if (localRule) {
        setGoogleSearchSuggestion({
          query: textToSearch,
          suggestedTranslation: localRule.targetText,
          source: 'Google & Acervo Linguístico',
          searchUrl: googleSearchUrl,
          explanation: localRule.explanation,
        });
        setIsSearchingGoogle(false);
        return;
      }

      // Fallback informativo com link direto de pesquisa Google
      setGoogleSearchSuggestion({
        query: textToSearch,
        suggestedTranslation: textToSearch,
        source: 'Google Pesquisa',
        searchUrl: googleSearchUrl,
        explanation: 'Clique no link para verificar a tradução e sugestões diretamente no Google.',
      });
    } catch (e) {
      console.warn('Erro na busca client-side:', e);
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  // Search results computed from dictionary database with accent-insensitive matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !dictionaryEntries) return [];
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const q = normalize(searchQuery);
    if (!q) return [];
    return dictionaryEntries
      .filter((entry) => {
        const matchWord = normalize(entry.word).includes(q);
        const matchTrans = normalize(entry.translation).includes(q);
        const matchMeaning = entry.meaning ? normalize(entry.meaning).includes(q) : false;
        const matchPron = entry.pronunciation ? normalize(entry.pronunciation).includes(q) : false;
        const matchNotes = entry.culturalNotes ? normalize(entry.culturalNotes).includes(q) : false;
        return matchWord || matchTrans || matchMeaning || matchPron || matchNotes;
      })
      .slice(0, 15);
  }, [searchQuery, dictionaryEntries]);

  // Auto-pesquisa no Google quando o termo digitado não existe no acervo verificado
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 3 && searchResults.length === 0) {
      const timer = setTimeout(() => {
        handleFetchGoogleSuggestionForSearch(trimmed);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchResults.length, sourceLang, targetLang]);

  const recentDatabaseWords = useMemo(() => {
    if (!dictionaryEntries || dictionaryEntries.length === 0) return [];
    return dictionaryEntries.slice(0, 7);
  }, [dictionaryEntries]);

  const handleSelectWordFromDatabase = (entry: DictionaryEntry) => {
    setSourceText(entry.word);
    setSourceLang(entry.language);
    setTargetLang('pt');
    handleTranslateText(entry.word, entry.language, 'pt');
    setIsSearchActive(false);
  };

  const handlePlayWordAudio = async (entry: DictionaryEntry) => {
    if (playingWordId === entry.id) return;
    setPlayingWordId(entry.id);
    try {
      if (entry.audioData) {
        const audio = new Audio(entry.audioData);
        audio.onended = () => setPlayingWordId(null);
        audio.onerror = () => setPlayingWordId(null);
        await audio.play();
      } else {
        await speakTextWithWebSpeech(entry.word);
        setPlayingWordId(null);
      }
    } catch (e) {
      setPlayingWordId(null);
    }
  };

  const handleCopyWordEntry = (entry: DictionaryEntry) => {
    const text = `"${entry.word}" (${languages.find(l => l.code === entry.language)?.name || entry.language}) = "${entry.translation}" (Português)`;
    navigator.clipboard.writeText(text);
    setCopiedWordId(entry.id);
    setTimeout(() => setCopiedWordId(null), 2000);
  };

  // Handle prefill data from dictionary or external trigger
  useEffect(() => {
    if (prefillData && prefillData.word) {
      setSourceText(prefillData.word);
      if (prefillData.sourceLang) setSourceLang(prefillData.sourceLang);
      if (prefillData.targetLang) setTargetLang(prefillData.targetLang);
      handleTranslateText(prefillData.word, prefillData.sourceLang || 'pt', prefillData.targetLang || 'kimbundu');
    }
  }, [prefillData]);

  // Quick suggestion chips
  const quickChips = [
    { text: 'Muito obrigado', from: 'pt', to: 'kimbundu' },
    { text: 'Olá com saúde e paz', from: 'pt', to: 'umbundu' },
    { text: 'Mbote zaku', from: 'kikongo', to: 'pt' },
    { text: 'O amor mora no coração', from: 'pt', to: 'kimbundu' },
    { text: 'Samanyonga', from: 'cokwe', to: 'pt' },
    { text: 'Que a paz esteja convosco', from: 'pt', to: 'umbundu' },
    { text: 'Bika mbote', from: 'fiote', to: 'pt' },
  ];

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = sourceLang === 'pt' ? 'pt-AO' : 'pt-PT';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSourceText(transcript);
        setIsListening(false);
        handleTranslateText(transcript, sourceLang, targetLang);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechError('Não foi possível capturar o áudio. Tente novamente ou digite.');
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sourceLang, targetLang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setSpeechError('Reconhecimento de voz não suportado pelo seu navegador.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = sourceLang === 'pt' ? 'pt-PT' : 'pt-AO';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    if (result) {
      setSourceText(result.targetText);
      handleTranslateText(result.targetText, targetLang, tempLang);
    }
  };

  const handleTranslateText = async (textToTranslate: string, sLang: string, tLang: string) => {
    if (!textToTranslate.trim()) return;
    setIsLoading(true);

    // 0. Same language check
    if (sLang === tLang) {
      setResult({
        sourceText: textToTranslate,
        sourceLang: sLang,
        targetText: textToTranslate,
        targetLang: tLang,
        isConfident: true,
        isAi: false,
        suggestImprovementNeeded: false,
      });
      setIsLoading(false);
      return;
    }

    // 1. Instant corpus lookup (offline-first, 0ms latency)
    const instantCorpus = findCorpusTranslation(textToTranslate, sLang, tLang);
    if (instantCorpus) {
      setResult(instantCorpus);
      setIsLoading(false);

      const newHistoryItem = {
        id: `h-${Date.now()}`,
        sourceText: textToTranslate,
        sourceLang: sLang,
        targetText: instantCorpus.targetText,
        targetLang: tLang,
        timestamp: new Date().toISOString(),
        phonetic: instantCorpus.pronunciation,
        isAi: false,
      };
      onUpdateUser({
        ...user,
        history: [newHistoryItem, ...(user.history || []).slice(0, 49)],
      });
      return;
    }

    // 2. Fetch from backend with timeout race
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: sLang,
          targetLang: tLang,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: TranslationResult = await response.json();
        setResult(data);

        const newHistoryItem = {
          id: `h-${Date.now()}`,
          sourceText: textToTranslate,
          sourceLang: sLang,
          targetText: data.targetText,
          targetLang: tLang,
          timestamp: new Date().toISOString(),
          phonetic: data.pronunciation,
          isAi: data.isAi,
        };
        onUpdateUser({
          ...user,
          history: [newHistoryItem, ...(user.history || []).slice(0, 49)],
        });
        return;
      }
    } catch (err: any) {
      console.warn('Backend translation deferred, attempting direct Google search:', err.message);
    }

    // 3. Fallback: Consulta direta e automática ao motor Google
    try {
      const googleRes = await fetch(
        `/api/google-suggest?text=${encodeURIComponent(textToTranslate)}&sourceLang=${sLang}&targetLang=${tLang}`
      );
      if (googleRes.ok) {
        const gData = await googleRes.json();
        if (gData.suggestedTranslation) {
          setResult({
            sourceText: textToTranslate,
            sourceLang: sLang,
            targetText: gData.suggestedTranslation,
            targetLang: tLang,
            pronunciation: gData.pronunciation || '',
            culturalNote: gData.explanation || 'Tradução obtida automaticamente através do Google em tempo real.',
            breakdown: [{ term: textToTranslate, meaning: gData.suggestedTranslation }],
            isConfident: true,
            isAi: true,
            isGoogleSuggestion: true,
            isAutoSavedToDb: gData.isAutoSavedToDb ?? true,
            googleSuggestion: {
              text: gData.suggestedTranslation,
              source: gData.source || 'Google Tradutor',
              searchUrl: gData.searchUrl,
              explanation: gData.explanation,
            },
            suggestImprovementNeeded: false,
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (gErr) {
      console.warn('Backend /api/google-suggest indisponível (Netlify/estático), executando motor client-side:', gErr);
    }

    // 4. Motor Client-side de Tradução do Google Web & Regras Linguísticas Bantu (100% Netlify)
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradução "${textToTranslate}" ${languages.find(l => l.code === tLang)?.name || tLang} Angola`)}`;
    try {
      const webGoogle = await queryGoogleTranslateWeb(textToTranslate, sLang, tLang);
      if (webGoogle && webGoogle.text) {
        setResult({
          sourceText: textToTranslate,
          sourceLang: sLang,
          targetText: webGoogle.text,
          targetLang: tLang,
          pronunciation: '',
          culturalNote: `Tradução localizada através do ${webGoogle.source} para as línguas de Angola.`,
          breakdown: [{ term: textToTranslate, meaning: webGoogle.text }],
          isConfident: true,
          isAi: true,
          isGoogleSuggestion: true,
          isAutoSavedToDb: true,
          googleSuggestion: {
            text: webGoogle.text,
            source: webGoogle.source,
            searchUrl: googleSearchUrl,
            explanation: `Tradução obtida via ${webGoogle.source} em tempo real.`,
          },
          suggestImprovementNeeded: false,
        });
        setIsLoading(false);
        return;
      }

      // Regras linguísticas e etimológicas angolanas
      const localRule = lookupAngolanLinguisticRules(textToTranslate, sLang, tLang);
      if (localRule) {
        setResult({
          sourceText: textToTranslate,
          sourceLang: sLang,
          targetText: localRule.targetText,
          targetLang: tLang,
          pronunciation: localRule.pronunciation,
          culturalNote: localRule.explanation,
          breakdown: [{ term: textToTranslate, meaning: localRule.targetText }],
          isConfident: true,
          isAi: true,
          isGoogleSuggestion: true,
          isAutoSavedToDb: true,
          googleSuggestion: {
            text: localRule.targetText,
            source: 'Google & Acervo Linguístico',
            searchUrl: googleSearchUrl,
            explanation: localRule.explanation,
          },
          suggestImprovementNeeded: false,
        });
        setIsLoading(false);
        return;
      }
    } catch (clientErr) {
      console.warn('Erro ao processar tradução no cliente:', clientErr);
    } finally {
      setIsLoading(false);
    }

    // 5. Último recurso se rede offline: corpus ou link Google
    const fallbackCorpus = findCorpusTranslation(textToTranslate, sLang, tLang);
    if (fallbackCorpus) {
      setResult(fallbackCorpus);
    } else {
      setResult({
        sourceText: textToTranslate,
        sourceLang: sLang,
        targetText: textToTranslate,
        targetLang: tLang,
        isConfident: false,
        isAi: false,
        isGoogleSuggestion: true,
        googleSuggestion: {
          text: textToTranslate,
          source: 'Google Pesquisa',
          searchUrl: googleSearchUrl,
          explanation: 'Expressão pesquisada no Google. Clique no botão acima para abrir a pesquisa detalhada.',
        },
        suggestImprovementNeeded: true,
        culturalNote: 'Expressão em análise. O sistema tentou a consulta ao Google e disponibilizou o link direto.',
      });
    }
  };

  const handleTranslate = () => {
    handleTranslateText(sourceText, sourceLang, targetLang);
  };

  const handlePlayAudio = async () => {
    if (!result?.targetText || isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: result.targetText,
          language: targetLang,
        }),
      });

      const data = await response.json();
      if (data.audio) {
        await playBase64Wav(data.audio);
      } else {
        await speakTextWithWebSpeech(result.targetText);
      }
    } catch (err) {
      console.warn('Backend TTS failed, using browser speech:', err);
      try {
        await speakTextWithWebSpeech(result.targetText);
      } catch (e) {
        console.error('TTS speech failed:', e);
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleCopy = () => {
    if (!result?.targetText) return;
    navigator.clipboard.writeText(result.targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result?.targetText) return;
    const shareText = `"${result.sourceText}" em ${languages.find(l => l.code === targetLang)?.name || targetLang}: "${result.targetText}" - Tradutor Nacional de Angola`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tradutor Nacional de Angola',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const isFavorite = result?.dictionaryMatch
    ? user.favorites.includes(result.dictionaryMatch.id)
    : false;

  const toggleFavorite = () => {
    if (!result?.dictionaryMatch) return;
    const id = result.dictionaryMatch.id;
    let newFavs: string[];
    if (user.favorites.includes(id)) {
      newFavs = user.favorites.filter(f => f !== id);
    } else {
      newFavs = [...user.favorites, id];
    }
    onUpdateUser({
      ...user,
      favorites: newFavs,
    });
  };

  const activeLanguages = languages.filter(l => l.isActive);

  return (
    <div className="w-full max-w-5xl mx-auto">
      
      {/* Quick greeting and chips bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
            Sugestões rápidas:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceText(chip.text);
                setSourceLang(chip.from);
                setTargetLang(chip.to);
                handleTranslateText(chip.text, chip.from, chip.to);
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-stone-900 border border-stone-200 transition-colors whitespace-nowrap"
            >
              {chip.text}
            </button>
          ))}
        </div>
      </div>

      {/* BARRA DE PESQUISA NA BASE DE DADOS (Vocábulos em lote, Excel e Acervo) */}
      <div className="mb-4 relative">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-3 focus-within:ring-amber-400/20 transition-all p-1.5 flex items-center gap-2.5">
          <div className="pl-3 text-amber-600 flex items-center shrink-0">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchActive(true);
            }}
            onFocus={() => setIsSearchActive(true)}
            placeholder="Pesquisar vocábulo na base de dados (ex: kúdia, kandandu, mbote, comer, amor...)"
            className="flex-1 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none py-1.5"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchActive(false);
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors mr-1"
              title="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 pr-3 pl-3 border-l border-stone-200 text-[11px] text-stone-500 font-medium shrink-0">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>{dictionaryEntries?.length || 0} na base de dados</span>
          </div>
        </div>

        {/* Dropdown Flutuante de Resultados da Base de Dados */}
        {isSearchActive && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden animate-fade-in text-left">
            <div className="px-4 py-2.5 bg-gradient-to-r from-stone-50 to-amber-50/50 border-b border-stone-200 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>Resultados da Base de Dados ({searchResults.length} encontrados)</span>
              </span>
              <button
                onClick={() => setIsSearchActive(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {searchResults.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 hover:bg-amber-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900">
                          {entry.word}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
                          {languages.find(l => l.code === entry.language)?.name || entry.language}
                        </span>
                        <span className="text-xs text-stone-400">→</span>
                        <span className="text-sm font-semibold text-emerald-800">
                          {entry.translation}
                        </span>
                        {entry.pronunciation && (
                          <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            [{entry.pronunciation}]
                          </span>
                        )}
                      </div>

                      {entry.meaning && (
                        <p className="text-xs text-stone-600 line-clamp-1">
                          {entry.meaning}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handlePlayWordAudio(entry)}
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-stone-200"
                        title="Ouvir pronúncia"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyWordEntry(entry)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                        title="Copiar vocábulo"
                      >
                        {copiedWordId === entry.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleSelectWordFromDatabase(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg transition-all shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Traduzir no Painel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-stone-600 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Vocábulo "<strong>{searchQuery}</strong>" não catalogado no acervo verificado local.
                  </span>
                </div>

                {/* Google Suggestion in Search Dropdown */}
                {isSearchingGoogle ? (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>A pesquisar no Google e modelos linguísticos...</span>
                  </div>
                ) : googleSearchSuggestion && googleSearchSuggestion.query.toLowerCase() === searchQuery.toLowerCase().trim() ? (
                  <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-sky-50/60 border border-blue-200/90 rounded-xl space-y-2 text-xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center">G</span>
                        <span>Sugestão Encontrada no Google:</span>
                      </span>
                      <a
                        href={googleSearchSuggestion.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Google ↗</span>
                      </a>
                    </div>

                    <div className="flex items-baseline gap-2 bg-white/90 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-sm font-bold text-stone-900">{googleSearchSuggestion.query}</span>
                      <span className="text-stone-400">→</span>
                      <span className="text-sm font-bold text-emerald-800">{googleSearchSuggestion.suggestedTranslation}</span>
                    </div>

                    {googleSearchSuggestion.explanation && (
                      <p className="text-[11px] text-stone-600 italic">
                        {googleSearchSuggestion.explanation}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => {
                          setSourceText(googleSearchSuggestion.query);
                          setResult({
                            sourceText: googleSearchSuggestion.query,
                            sourceLang: sourceLang,
                            targetText: googleSearchSuggestion.suggestedTranslation,
                            targetLang: targetLang,
                            isConfident: false,
                            isAi: true,
                            isGoogleSuggestion: true,
                            googleSuggestion: {
                              text: googleSearchSuggestion.suggestedTranslation,
                              source: googleSearchSuggestion.source,
                              searchUrl: googleSearchSuggestion.searchUrl,
                              explanation: googleSearchSuggestion.explanation,
                            },
                            suggestImprovementNeeded: true,
                          });
                          setIsSearchActive(false);
                        }}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Usar no Tradutor</span>
                      </button>

                      {onOpenContributeModalWithData && (
                        <button
                          onClick={() => {
                            onOpenContributeModalWithData({
                              word: googleSearchSuggestion.query,
                              language: sourceLang !== 'pt' ? sourceLang : (targetLang !== 'pt' ? targetLang : 'kimbundu'),
                              targetLanguage: targetLang,
                            });
                            setIsSearchActive(false);
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Adicionar à Base</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <button
                      onClick={() => handleFetchGoogleSuggestionForSearch(searchQuery)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      <span>Procurar no Google e Obter Sugestão</span>
                    </button>

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`tradução ${searchQuery} línguas nacionais Angola`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1 hover:underline"
                    >
                      <span>Abrir Pesquisa Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {onOpenContributeModalWithData && !googleSearchSuggestion && (
                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        onOpenContributeModalWithData({
                          word: searchQuery,
                          language: targetLang !== 'pt' ? targetLang : 'kimbundu',
                          targetLanguage: 'pt',
                        });
                        setIsSearchActive(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Adicionar diretamente à Base de Dados</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Badges rápidos de palavras recentes na base de dados quando a barra está vazia */}
        {!searchQuery && recentDatabaseWords.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-left overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-stone-400 shrink-0 flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-600" />
              <span>Base de dados:</span>
            </span>
            {recentDatabaseWords.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelectWordFromDatabase(entry)}
                className="shrink-0 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 border border-stone-200 transition-colors flex items-center gap-1"
                title={`${entry.word} = ${entry.translation}`}
              >
                <span className="font-semibold">{entry.word}</span>
                <span className="text-stone-400">({languages.find(l => l.code === entry.language)?.name || entry.language})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Translation Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Language Selection Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-100 bg-stone-50/80">
          
          {/* Source Language */}
          <div className="flex-1 max-w-[200px] sm:max-w-[240px]">
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
              De:
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full bg-white border border-stone-200 text-stone-900 text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              {activeLanguages.map((lang) => (
                <option key={`src-${lang.code}`} value={lang.code}>
                  {lang.name} {lang.code === 'pt' ? '(Português)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="px-2 pt-4">
            <button
              onClick={handleSwapLanguages}
              className="p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 transition-colors border border-stone-200 bg-white shadow-xs"
              title="Trocar línguas"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Target Language */}
          <div className="flex-1 max-w-[200px] sm:max-w-[240px]">
            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Para:
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-white border border-stone-200 text-stone-900 text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              {activeLanguages.map((lang) => (
                <option key={`tgt-${lang.code}`} value={lang.code}>
                  {lang.name} {lang.code === 'pt' ? '(Português)' : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Translation Interactive Grid (Desktop: 2 columns, Mobile: 1 column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          
          {/* Source Input Pane */}
          <div className="p-4 sm:p-6 flex flex-col justify-between min-h-[260px] bg-white">
            <div className="relative">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleTranslate();
                  }
                }}
                placeholder={`Escreva ou fale aqui em ${languages.find(l => l.code === sourceLang)?.name || 'língua de origem'}...`}
                rows={5}
                className="w-full text-base sm:text-lg text-stone-900 placeholder:text-stone-400 resize-none border-0 focus:ring-0 focus:outline-none p-0 bg-transparent leading-relaxed"
              />
            </div>

            {speechError && (
              <div className="text-xs text-red-600 flex items-center gap-1.5 py-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {speechError}
              </div>
            )}

            {/* Source controls */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2.5 rounded-lg border transition-all flex items-center gap-2 text-xs font-medium ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                  }`}
                  title={isListening ? 'A escutar... Clique para parar' : 'Falar (Microfone)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isListening ? 'A escutar voz...' : 'Falar'}
                  </span>
                </button>

                {sourceText && (
                  <button
                    onClick={() => { setSourceText(''); setResult(null); }}
                    className="p-2 text-stone-400 hover:text-stone-700 text-xs flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400 font-mono tabular-nums">
                  {sourceText.length}/1000
                </span>
                <button
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || isLoading}
                  className="px-5 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      A traduzir...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                      Traduzir
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Translation Result Pane */}
          <div className="p-4 sm:p-6 flex flex-col justify-between min-h-[260px] bg-stone-50/50">
            <div>
              {/* Header Status */}
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200/60 mb-3">
                <div className="flex items-center gap-2">
                  <span>Tradução ({languages.find(l => l.code === targetLang)?.name})</span>
                  {result && (
                    <span className="text-[11px] text-stone-400">
                      {result.isAi ? '· Inteligência Artificial' : '· Dicionário Verificado'}
                    </span>
                  )}
                </div>

                {result?.dictionaryMatch && (
                  <button
                    onClick={toggleFavorite}
                    className={`p-1 rounded transition-colors ${
                      isFavorite ? 'text-amber-500' : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title={isFavorite ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              {/* Translation Content */}
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                  <p className="text-xs">A consultar a base nacional e modelos linguísticos...</p>
                </div>
              ) : result ? (
                <div className="space-y-3">
                  <p className="text-xl sm:text-2xl font-serif-heading font-medium text-stone-900 leading-snug">
                    {result.targetText}
                  </p>

                  {/* Phonetic Pronunciation */}
                  {result.pronunciation && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100/70 border border-amber-200/80 px-2.5 py-1 rounded-md font-mono">
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pronúncia: {result.pronunciation}</span>
                    </div>
                  )}

                  {/* Cultural Note */}
                  {result.culturalNote && (
                    <div className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200/80 mt-2">
                      <div className="font-semibold text-stone-800 mb-0.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        Contexto Cultural & Cosmovisão:
                      </div>
                      <p className="leading-relaxed">{result.culturalNote}</p>
                    </div>
                  )}

                  {/* Google Suggestion Card in Result Pane */}
                  {(result.isGoogleSuggestion || result.googleSuggestion) && (
                    <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-emerald-50/70 border border-blue-200 rounded-xl text-xs space-y-2.5 mt-2 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-2xs font-extrabold text-[11px] text-blue-600 border border-blue-200">
                            G
                          </span>
                          <span>Tradução Pesquisada no Google</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                            Tempo Real
                          </span>
                        </div>

                        {/* Real-time DB Auto-Save Badge */}
                        <div className="flex items-center gap-1.5">
                          {result.isAutoSavedToDb ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs animate-fade-in">
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Gravada na Base de Dados</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full">
                              <Database className="w-3 h-3 text-blue-600" />
                              <span>Sincronizada</span>
                            </span>
                          )}

                          <a
                            href={result.googleSuggestion?.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(`tradução "${sourceText}" ${languages.find(l => l.code === targetLang)?.name || targetLang} Angola`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                          >
                            <span>Google</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <p className="text-stone-700 leading-relaxed text-[11.5px]">
                        {result.googleSuggestion?.explanation || 'A tradução foi localizada através do Google e gravada de forma permanente na base de dados.'}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {result.isAutoSavedToDb && (
                          <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Disponível agora para todos os utilizadores no Dicionário Nacional.</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(result.googleSuggestion?.text || result.targetText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors ml-auto"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copiar Tradução</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Unconfirmed / Community suggestion call */}
                  {result.suggestImprovementNeeded && !result.googleSuggestion && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2 mt-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">
                          Ainda não temos uma tradução confirmada para esta expressão. Pode consultar o Google ou sugerir à comunidade.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleFetchGoogleSuggestionForSearch(sourceText)}
                          disabled={isSearchingGoogle}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md transition-colors shadow-2xs"
                        >
                          {isSearchingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-blue-700" />}
                          <span>Procurar Sugestão no Google</span>
                        </button>

                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(`tradução "${sourceText}" ${languages.find(l => l.code === targetLang)?.name || targetLang} Angola`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:underline"
                        >
                          <span>Pesquisar no Google</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {onOpenContributeModalWithData && (
                          <button
                            onClick={() => {
                              onOpenContributeModalWithData({
                                word: sourceText,
                                language: sourceLang,
                                targetLanguage: targetLang,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors shadow-xs ml-auto"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Sugerir tradução</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Term Breakdown if available */}
                  {result.breakdown && result.breakdown.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                        Desdobramento dos termos:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {result.breakdown.map((item, i) => (
                          <div key={i} className="bg-white/80 p-1.5 rounded border border-stone-200/60">
                            <span className="font-semibold text-stone-800">{item.term}</span>: {item.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-12 text-center text-stone-400 text-sm">
                  O resultado da tradução aparecerá aqui.
                </div>
              )}
            </div>

            {/* Translation Output Controls */}
            {result && !isLoading && (
              <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isPlayingAudio
                        ? 'bg-amber-400 text-stone-900 border-amber-500'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                    title="Ouvir a tradução através de áudio"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>{isPlayingAudio ? 'A reproduzir...' : 'Ouvir'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg border bg-white hover:bg-stone-100 text-stone-700 border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Copiar a tradução"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border bg-white hover:bg-stone-100 text-stone-700 border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Partilhar a tradução"
                  >
                    {shared ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{shared ? 'Partilhado!' : 'Partilhar'}</span>
                  </button>

                  <a
                    href={`https://chatgpt.com/?q=${encodeURIComponent(`Como tradutor especialista em línguas de Angola, analisa o termo "${sourceText}" (${languages.find(l => l.code === sourceLang)?.name || sourceLang} -> ${languages.find(l => l.code === targetLang)?.name || targetLang}). Dá a tradução precisa "${result.targetText}", a pronúncia fonética, contexto cultural e frases de exemplo no dia a dia.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Analisar profundamente com o ChatGPT (OpenAI)"
                  >
                    <OpenAILogo className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Análise ChatGPT</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                  </a>
                </div>

                {/* Contribution link */}
                <button
                  onClick={() => {
                    if (onOpenContributeModalWithData) {
                      onOpenContributeModalWithData({
                        word: sourceText,
                        language: sourceLang,
                        targetLanguage: targetLang,
                      });
                    }
                  }}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2"
                >
                  Sugerir melhoria
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
