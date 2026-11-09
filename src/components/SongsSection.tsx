import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  ExternalLink, 
  Heart, 
  PlusCircle, 
  Search, 
  Sparkles, 
  Youtube, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  X,
  Volume2,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { NationalSong, NationalLanguage, UserProfile } from '../types';

interface SongsSectionProps {
  songs: NationalSong[];
  languages: NationalLanguage[];
  user: UserProfile;
  onLikeSong: (id: string) => void;
  onSubmitSong: (songData: Partial<NationalSong>) => Promise<void>;
  onTranslateText?: (text: string, sourceLang: string, targetLang: string) => void;
}

export const SongsSection: React.FC<SongsSectionProps> = ({
  songs,
  languages,
  user,
  onLikeSong,
  onSubmitSong,
  onTranslateText,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSongForModal, setActiveSongForModal] = useState<NationalSong | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Submission Form State
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [language, setLanguage] = useState<string>('kimbundu');
  const [genre, setGenre] = useState<string>('Semba');
  const [platformUrl, setPlatformUrl] = useState<string>('');
  const [originalLyrics, setOriginalLyrics] = useState<string>('');
  const [translatedLyrics, setTranslatedLyrics] = useState<string>('');
  const [culturalContext, setCulturalContext] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const nationalLangs = languages.filter(l => l.code !== 'pt' && l.isActive);

  // Filter approved songs for public view (plus pending songs submitted by current user so they can see their status)
  const visibleSongs = songs.filter(s => {
    const isApprovedOrOwner = s.status === 'Aprovada' || s.contributorId === user.id || user.role === 'admin';
    const matchesLang = selectedLanguage === 'all' || s.language === selectedLanguage;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.originalLyrics.toLowerCase().includes(q) ||
      s.translatedLyrics.toLowerCase().includes(q);

    return isApprovedOrOwner && matchesLang && matchesSearch;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !platformUrl.trim() || !originalLyrics.trim() || !translatedLyrics.trim()) {
      setSubmitError('Por favor preencha todos os campos obrigatórios (título, artista, link, letra original e tradução).');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmitSong({
        title: title.trim(),
        artist: artist.trim(),
        language,
        genre: genre.trim() || 'Música Tradicional',
        platformUrl: platformUrl.trim(),
        originalLyrics: originalLyrics.trim(),
        translatedLyrics: translatedLyrics.trim(),
        culturalContext: culturalContext.trim(),
        contributorName: user.name,
        contributorId: user.id,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        // Clear form
        setTitle('');
        setArtist('');
        setPlatformUrl('');
        setOriginalLyrics('');
        setTranslatedLyrics('');
        setCulturalContext('');
      }, 2500);

    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao submeter a música.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1">
            <Music className="w-4 h-4" />
            <span>Música Nacional & Poética Bantu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-heading font-semibold text-stone-900 leading-tight">
            Músicas Nacionais com Tradução
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-3xl leading-relaxed">
            A música é a maior guardiã das línguas nacionais de Angola. Ouça temas icónicos no YouTube e acompanhe cada verso original com a respetiva tradução em Português.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="self-start md:self-auto px-4 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Adicionar Música Nacional</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título da música, artista ou trecho da letra..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium"
            >
              <option value="all">Todas as Línguas</option>
              {nationalLangs.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Informative pill */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <span>{visibleSongs.length} {visibleSongs.length === 1 ? 'música disponível' : 'músicas disponíveis'}</span>
          <span className="text-[11px] text-amber-800 font-medium">
            Todas as submissões dos ouvintes passam por aprovação do administrador
          </span>
        </div>
      </div>

      {/* Songs Grid */}
      {visibleSongs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 space-y-3 shadow-xs">
          <Music className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-lg font-serif-heading font-semibold text-stone-800">
            Nenhuma música encontrada com estes filtros.
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Conhece uma música na sua língua nacional favorita? Seja o primeiro a partilhá-la com a tradução!
          </p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="mt-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Adicionar esta música
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleSongs.map((song) => {
            const langObj = languages.find(l => l.code === song.language);

            return (
              <div
                key={song.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-amber-400/90 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Song Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {langObj ? langObj.name : song.language}
                        </span>
                        <span className="text-xs text-stone-500">
                          {song.genre}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif-heading font-semibold text-stone-900 mt-1.5">
                        {song.title}
                      </h3>
                      <p className="text-sm font-medium text-stone-600">
                        {song.artist}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {song.status === 'Pendente' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Aguardando Aprovação
                        </span>
                      )}
                      {song.status === 'Aprovada' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Aprovada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platform Audio / Video link button */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={song.platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>Ouvir Música no YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <button
                      onClick={() => setActiveSongForModal(song)}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                      <span>Ver Letra Completa & Tradução</span>
                    </button>
                  </div>

                  {/* Embedded YouTube preview if ID exists */}
                  {song.youtubeId && (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-stone-200 bg-stone-900 shadow-inner">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${song.youtubeId}`}
                        title={song.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Bilingual Verses Preview (Side by Side or Line by Line) */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>Excerto da Letra Bilíngue</span>
                      <span className="text-amber-800">{langObj?.name || 'Nativo'} ⇄ Português</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(song.verses || []).slice(0, 3).map((verse, idx) => (
                        <div key={idx} className="border-l-2 border-amber-400 pl-3 py-0.5">
                          <p className="font-semibold text-stone-900">
                            "{verse.original}"
                          </p>
                          <p className="text-stone-600 text-[11px] mt-0.5">
                            → {verse.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Context */}
                  {song.culturalContext && (
                    <div className="text-xs text-stone-600 bg-amber-50/40 p-3 rounded-xl border border-amber-200/40 leading-relaxed">
                      <strong className="text-stone-800">História & Significado Cultural:</strong> {song.culturalContext}
                    </div>
                  )}

                </div>

                {/* Footer: Contributor & Like button */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-[11px]">
                    Submetida por <strong className="text-stone-700">{song.contributorName}</strong> em {new Date(song.createdAt).toLocaleDateString('pt-AO')}
                  </span>

                  <button
                    onClick={() => onLikeSong(song.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 transition-colors font-medium text-xs tabular-nums"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span>{song.likesCount || 0}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: FULL LYRICS VIEWER */}
      {activeSongForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-left">
            
            {/* Modal Header */}
            <div className="p-6 bg-stone-900 text-white flex items-start justify-between border-b border-stone-800">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400">
                  {languages.find(l => l.code === activeSongForModal.language)?.name || activeSongForModal.language} · {activeSongForModal.genre}
                </span>
                <h3 className="text-2xl font-serif-heading font-semibold text-white mt-1">
                  {activeSongForModal.title}
                </h3>
                <p className="text-sm text-stone-300">
                  {activeSongForModal.artist}
                </p>
              </div>

              <button
                onClick={() => setActiveSongForModal(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
              
              {/* YouTube Link Banner */}
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-900">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>Ouvir gravação original na íntegra</span>
                </div>
                <a
                  href={activeSongForModal.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 flex items-center gap-1"
                >
                  <span>Abrir no YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Side-by-side lyrics columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original lyrics */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                    Letra Original ({languages.find(l => l.code === activeSongForModal.language)?.name || 'Língua Nacional'})
                  </h4>
                  <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-stone-800 p-2 bg-stone-50 rounded border border-stone-200">
                    {activeSongForModal.originalLyrics}
                  </pre>
                </div>

                {/* Translated lyrics */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 bg-stone-100 p-2 rounded border border-stone-200">
                    Tradução em Português
                  </h4>
                  <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-stone-800 p-2 bg-stone-50 rounded border border-stone-200">
                    {activeSongForModal.translatedLyrics}
                  </pre>
                </div>

              </div>

              {activeSongForModal.culturalContext && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
                  <strong className="text-stone-900 block mb-1">Contexto Cultural & Histórico:</strong>
                  {activeSongForModal.culturalContext}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setActiveSongForModal(null)}
                className="px-5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW SONG (OUVINTES ADICIONAM MÚSICA) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-stone-900 to-stone-850 text-white flex items-start justify-between border-b border-stone-800">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-400">
                  Participação da Comunidade Musical
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-heading font-semibold text-white mt-0.5">
                  Adicionar Música Nacional com Tradução
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Partilhe uma música na língua nacional e a sua respetiva tradução para o acervo de todos os angolanos.
                </p>
              </div>

              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {submitSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif-heading font-semibold text-stone-900">
                    Música Submetida com Sucesso!
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    A sua canção foi enviada para a fila de moderação. <strong>O administrador irá validar o link e a fidelidade da tradução</strong> antes da publicação oficial.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>+20 Pontos creditados de imediato (+30 ao ser aprovada!)</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Informative notice about Admin Approval */}
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Moderação Obrigatória:</strong> Todas as músicas enviadas passam pela análise do administrador para verificação do link de reprodução e precisão da tradução da língua nacional.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                        Título da Música *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Mona Ki Ngi Xica"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                        Artista ou Grupo *
                      </label>
                      <input
                        type="text"
                        required
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Ex: Bonga, Liceu Vieira Dias..."
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                        Língua Nacional Utilizada *
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium"
                      >
                        {nationalLangs.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                        Gênero Musical
                      </label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Ex: Semba, Kilapanga, Rebita, Kizomba..."
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* YouTube / Platform Link */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Link da Música (YouTube, Spotify ou Plataforma de Áudio) *
                    </label>
                    <input
                      type="url"
                      required
                      value={platformUrl}
                      onChange={(e) => setPlatformUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Se for um link do YouTube, o vídeo poderá ser reproduzido diretamente no leitor da plataforma.
                    </p>
                  </div>

                  {/* Original Lyrics */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Letra Original na Língua Nacional *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={originalLyrics}
                      onChange={(e) => setOriginalLyrics(e.target.value)}
                      placeholder="Escreva os versos na língua nacional..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  {/* Translated Lyrics */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      Tradução Completa em Português *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={translatedLyrics}
                      onChange={(e) => setTranslatedLyrics(e.target.value)}
                      placeholder="Escreva a tradução dos versos em português..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  {/* Cultural Context */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      História ou Significado Cultural da Canção
                    </label>
                    <textarea
                      rows={2}
                      value={culturalContext}
                      onChange={(e) => setCulturalContext(e.target.value)}
                      placeholder="Ex: Gravada em 1972, canção de protesto que fala sobre a saudade da terra..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {isSubmitting ? 'A enviar...' : 'Enviar Música para Aprovação'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
