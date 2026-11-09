import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Plus, 
  BarChart3, 
  Users, 
  Globe, 
  BookOpen, 
  AlertTriangle,
  Clock,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Music,
  ExternalLink,
  Play,
  Lock, 
  KeyRound, 
  LogOut, 
  ShieldAlert, 
  Check, 
  X, 
  Database, 
  Loader2,
  DollarSign, 
  Megaphone, 
  Eye, 
  MousePointerClick, 
  Sparkles, 
  SlidersHorizontal, 
  RotateCw,
  Sliders,
  Smartphone,
  Filter,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { DictionaryEntry, NationalLanguage, UserProfile, NationalSong, AdBanner as AdBannerType, MonetizationSettings, AdPlacement } from '../types';
import { AdminLoginGate } from './AdminLoginGate';
import { BatchImportModal } from './BatchImportModal';

interface AdminDashboardProps {
  adminToken: string | null;
  onLoginSuccess: (token: string) => void;
  onLogoutAdmin: () => void;
  onChangeAdminPassword?: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  languages: NationalLanguage[];
  onAddLanguage: (lang: Partial<NationalLanguage>) => Promise<void>;
  onToggleLanguage: (code: string) => Promise<void>;
  entries: DictionaryEntry[];
  onModerateSuggestion: (id: string, action: 'Aprovada' | 'Rejeitada', comment?: string) => Promise<void>;
  onAddNewWord: (entry: Partial<DictionaryEntry>) => Promise<void>;
  onBatchImportSuccess?: (importedEntries: DictionaryEntry[]) => void;
  songs?: NationalSong[];
  onModerateSong?: (id: string, action: 'Aprovada' | 'Rejeitada', comment?: string) => Promise<void>;
  onDeleteSong?: (id: string) => Promise<void>;
  ads?: AdBannerType[];
  onToggleAd?: (id: string) => Promise<void>;
  onDeleteAd?: (id: string) => Promise<void>;
  onAddNewAd?: (ad: Partial<AdBannerType>) => Promise<void>;
  settings?: MonetizationSettings;
  onUpdateAdSettings?: (newSettings: Partial<MonetizationSettings>) => Promise<void>;
  onOpenMonetizationGuide?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminToken,
  onLoginSuccess,
  onLogoutAdmin,
  onChangeAdminPassword,
  languages,
  onAddLanguage,
  onToggleLanguage,
  entries,
  onModerateSuggestion,
  onAddNewWord,
  onBatchImportSuccess,
  songs = [],
  onModerateSong,
  onDeleteSong,
  ads = [],
  onToggleAd,
  onDeleteAd,
  onAddNewAd,
  settings,
  onUpdateAdSettings,
  onOpenMonetizationGuide,
}) => {
  // If not authenticated with a valid token, show the secure AdminLoginGate
  if (!adminToken) {
    return <AdminLoginGate onLoginSuccess={onLoginSuccess} />;
  }

  const [activeTab, setActiveTab] = useState<'moderacao' | 'musicas' | 'linguas' | 'dicionario' | 'estatisticas' | 'monetizacao'>('moderacao');
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Batch import modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);

  // Change password modal state
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState<boolean>(false);
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState<boolean>(false);

  // New language form state
  const [newLangCode, setNewLangCode] = useState<string>('');
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangNative, setNewLangNative] = useState<string>('');
  const [newLangRegions, setNewLangRegions] = useState<string>('');
  const [newLangDesc, setNewLangDesc] = useState<string>('');

  // New word form state
  const [newWord, setNewWord] = useState<string>('');
  const [newTranslation, setNewTranslation] = useState<string>('');
  const [newLanguage, setNewLanguage] = useState<string>('kimbundu');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newPronunciation, setNewPronunciation] = useState<string>('');
  const [newCulturalNotes, setNewCulturalNotes] = useState<string>('');

  // Ad and Side Banners Admin State
  const [adsFilter, setAdsFilter] = useState<'all' | 'sidebars' | 'leaderboard' | 'feed'>('all');
  const [isCreateAdOpen, setIsCreateAdOpen] = useState<boolean>(false);
  const [adFormSponsor, setAdFormSponsor] = useState<string>('');
  const [adFormTitle, setAdFormTitle] = useState<string>('');
  const [adFormDesc, setAdFormDesc] = useState<string>('');
  const [adFormPlacement, setAdFormPlacement] = useState<AdPlacement>('sidebar_left');
  const [adFormBadge, setAdFormBadge] = useState<string>('Patrocinador Oficial');
  const [adFormCta, setAdFormCta] = useState<string>('Saber Mais');
  const [adFormTargetUrl, setAdFormTargetUrl] = useState<string>('https://');
  const [adFormImageUrl, setAdFormImageUrl] = useState<string>('');
  const [adFormCategory, setAdFormCategory] = useState<string>('telecom');
  const [isSubmittingAd, setIsSubmittingAd] = useState<boolean>(false);
  const [adSuccessMessage, setAdSuccessMessage] = useState<string | null>(null);

  // Local copy of side banner settings
  const [sideEnabled, setSideEnabled] = useState<boolean>(settings?.sidebarAdsEnabled ?? true);
  const [sideLeft, setSideLeft] = useState<boolean>(settings?.sidebarLeftActive ?? true);
  const [sideRight, setSideRight] = useState<boolean>(settings?.sidebarRightActive ?? true);
  const [sideInterval, setSideInterval] = useState<number>(settings?.sidebarRotationInterval ?? 7);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setSideEnabled(settings.sidebarAdsEnabled ?? true);
      setSideLeft(settings.sidebarLeftActive ?? true);
      setSideRight(settings.sidebarRightActive ?? true);
      setSideInterval(settings.sidebarRotationInterval ?? 7);
    }
  }, [settings]);

  // Fetch stats from backend
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const pendingEntries = entries.filter((e) => e.status === 'Pendente');
  const pendingSongs = songs.filter((s) => s.status === 'Pendente');

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode || !newLangName) return;

    await onAddLanguage({
      code: newLangCode.trim().toLowerCase(),
      name: newLangName.trim(),
      nativeName: newLangNative.trim() || newLangName.trim(),
      regions: newLangRegions.trim() || 'Angola',
      description: newLangDesc.trim() || 'Língua nacional de Angola.',
    });

    setNewLangCode('');
    setNewLangName('');
    setNewLangNative('');
    setNewLangRegions('');
    setNewLangDesc('');
  };

  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newTranslation) return;

    await onAddNewWord({
      word: newWord.trim(),
      translation: newTranslation.trim(),
      language: newLanguage,
      meaning: newMeaning.trim() || newTranslation.trim(),
      pronunciation: newPronunciation.trim(),
      culturalNotes: newCulturalNotes.trim(),
      status: 'Aprovada',
      contributorName: 'Equipa de Moderação ILNA',
      contributorLevel: 'Embaixador da Língua',
    });

    setNewWord('');
    setNewTranslation('');
    setNewMeaning('');
    setNewPronunciation('');
    setNewCulturalNotes('');
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPassError('Por favor, preencha a senha atual e a nova senha.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('A confirmação da senha não coincide com a nova senha.');
      return;
    }
    if (newPass.length < 8) {
      setPassError('A nova senha deve conter pelo menos 8 caracteres.');
      return;
    }

    setIsUpdatingPass(true);
    setPassError(null);
    setPassSuccess(null);

    try {
      if (onChangeAdminPassword) {
        const res = await onChangeAdminPassword(currentPass, newPass);
        if (!res.success) {
          setPassError(res.error || 'Falha ao alterar senha.');
          return;
        }
        setPassSuccess('Senha atualizada na base de dados com sucesso!');
        setTimeout(() => {
          setIsChangePassModalOpen(false);
          setCurrentPass('');
          setNewPass('');
          setConfirmPass('');
          setPassSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setPassError(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Security Status Bar */}
      <div className="mb-6 p-3.5 bg-emerald-950/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-800 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Sessão Administrativa Autenticada</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            Credenciais Protegidas em <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-[11px]">/data/security_db.json</code>
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setPassError(null);
              setPassSuccess(null);
              setIsChangePassModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Alterar senha do painel na base de dados"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Alterar Senha</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Encerrar sessão de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Painel de Gestão & Controlo Linguístico</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-stone-900">
            Administração Central do Tradutor
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Modere sugestões comunitárias, gerencie o catálogo de línguas e acompanhe as métricas de uso nacional.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoadingStats}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
          Atualizar Métricas
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderacao')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'moderacao'
              ? 'border-red-600 text-red-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Fila de Palavras ({pendingEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('musicas')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'musicas'
              ? 'border-red-600 text-red-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Moderar Músicas ({pendingSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('linguas')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'linguas'
              ? 'border-red-600 text-red-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Gestão de Línguas ({languages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dicionario')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'dicionario'
              ? 'border-red-600 text-red-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Adicionar Vocábulo Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'estatisticas'
              ? 'border-red-600 text-red-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Estatísticas & Utilizadores</span>
        </button>

        <button
          onClick={() => setActiveTab('monetizacao')}
          className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'monetizacao'
              ? 'border-amber-500 text-amber-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>Banners & Monetização ({ads.length})</span>
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'moderacao' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Sugestões pendentes aguardando validação de especialista</span>
            <span className="font-mono">{pendingEntries.length} pendentes</span>
          </div>

          {pendingEntries.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-base font-medium text-stone-800">
                A fila de moderação está limpa!
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Todas as sugestões da comunidade foram avaliadas e catalogadas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEntries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {languages.find(l => l.code === item.language)?.name || item.language}
                      </span>
                      <span className="text-base font-semibold text-stone-900">
                        "{item.word}"
                      </span>
                      <span className="text-xs text-stone-400">→</span>
                      <span className="text-sm font-medium text-stone-700">
                        "{item.translation}"
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong>Significado:</strong> {item.meaning}
                    </p>

                    {item.examples && item.examples.length > 0 && (
                      <p className="text-xs text-stone-500 italic">
                        Exemplo: "{item.examples[0].phrase}" ({item.examples[0].translation})
                      </p>
                    )}

                    {item.culturalNotes && (
                      <p className="text-xs text-stone-500">
                        <strong>Nota Cultural:</strong> {item.culturalNotes}
                      </p>
                    )}

                    <div className="text-[11px] text-stone-400 pt-1">
                      Submetido por: <strong className="text-stone-600">{item.contributorName}</strong> ({item.contributorLevel}) em {new Date(item.createdAt).toLocaleDateString('pt-AO')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => onModerateSuggestion(item.id, 'Aprovada')}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Aprovar (+25 pts)</span>
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt('Motivo da rejeição:');
                        onModerateSuggestion(item.id, 'Rejeitada', reason || undefined);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Music Moderation (Ouvintes adicionam músicas, administrador aprova tudo) */}
      {activeTab === 'musicas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Músicas Nacionais submetidas por ouvintes para avaliação e aprovação</span>
            <span className="font-mono font-semibold text-amber-700">{pendingSongs.length} aguardando aprovação</span>
          </div>

          {songs.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
              <Music className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-base font-medium text-stone-800">
                Nenhuma música catalogada ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col gap-4 ${
                    song.status === 'Pendente' ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {languages.find(l => l.code === song.language)?.name || song.language}
                      </span>
                      <h4 className="text-base font-semibold text-stone-900">
                        {song.title} — <span className="text-stone-600 font-normal">{song.artist}</span>
                      </h4>
                      <span className="text-xs text-stone-400">({song.genre})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        song.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-800' :
                        song.status === 'Pendente' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {song.status}
                      </span>

                      <a
                        href={song.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                      >
                        <span>Ouvir no YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                      <strong className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                        Letra Original ({languages.find(l => l.code === song.language)?.name || song.language})
                      </strong>
                      <p className="whitespace-pre-line text-stone-800 leading-relaxed font-mono text-[11px]">
                        {song.originalLyrics}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80">
                      <strong className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                        Tradução em Português
                      </strong>
                      <p className="whitespace-pre-line text-stone-800 leading-relaxed font-mono text-[11px]">
                        {song.translatedLyrics}
                      </p>
                    </div>
                  </div>

                  {song.culturalContext && (
                    <div className="text-xs text-stone-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                      <strong>Contexto cultural:</strong> {song.culturalContext}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                    <div className="text-stone-400 text-[11px]">
                      Submetida por: <strong className="text-stone-700">{song.contributorName}</strong> em {new Date(song.createdAt).toLocaleDateString('pt-AO')}
                      {song.moderationComment && (
                        <span className="block text-stone-500 mt-0.5">Nota de moderação: {song.moderationComment}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {song.status === 'Pendente' && onModerateSong && (
                        <>
                          <button
                            onClick={() => onModerateSong(song.id, 'Aprovada')}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aprovar Música (+30 pts)</span>
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt('Motivo da rejeição:');
                              onModerateSong(song.id, 'Rejeitada', reason || undefined);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejeitar</span>
                          </button>
                        </>
                      )}

                      {onDeleteSong && (
                        <button
                          onClick={() => {
                            if (confirm(`Tem a certeza que deseja eliminar a música "${song.title}"?`)) {
                              onDeleteSong(song.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                          title="Eliminar música"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Languages Management */}
      {activeTab === 'linguas' && (
        <div className="space-y-6">
          
          {/* Add new language form */}
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-600" />
              Adicionar Nova Língua Nacional ao Sistema
            </h3>
            
            <form onSubmit={handleCreateLanguage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Código Identificador * (ex: kuvale)</label>
                <input
                  type="text"
                  required
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  placeholder="ex: kuvale"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Nome da Língua *</label>
                <input
                  type="text"
                  required
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="ex: Kuvale"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Nome Autóctone / Nativo</label>
                <input
                  type="text"
                  value={newLangNative}
                  onChange={(e) => setNewLangNative(e.target.value)}
                  placeholder="ex: Olukuvale"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Províncias / Regiões</label>
                <input
                  type="text"
                  value={newLangRegions}
                  onChange={(e) => setNewLangRegions(e.target.value)}
                  placeholder="ex: Namibe, Huíla"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">Descrição / Contexto</label>
                <input
                  type="text"
                  value={newLangDesc}
                  onChange={(e) => setNewLangDesc(e.target.value)}
                  placeholder="ex: Língua dos povos pastores do sudoeste de Angola."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gravar e Ativar Língua</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Languages Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Língua</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Províncias</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {languages.map((lang) => (
                  <tr key={lang.code} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 font-semibold text-stone-900">{lang.name}</td>
                    <td className="py-3 px-4 font-mono text-stone-500">{lang.code}</td>
                    <td className="py-3 px-4 text-stone-600">{lang.regions}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${lang.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                        {lang.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lang.code !== 'pt' && (
                        <button
                          onClick={() => onToggleLanguage(lang.code)}
                          className="text-[11px] font-medium text-stone-600 hover:text-stone-900 underline"
                        >
                          {lang.isActive ? 'Desativar' : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: Dictionary Management */}
      {activeTab === 'dicionario' && (
        <div className="space-y-6 max-w-3xl">
          {/* Card de Importação em Lote a partir do Excel, CSV ou Documentos */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Importação em Lote (Excel, CSV ou Documento)
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Importe centenas de vocábulos e traduções em lote para gravar na base de dados.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-stone-600 pl-11">
                Suporta planilhas <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> ou colar texto copiado de documentos. As palavras importadas são gravadas de forma permanente na base de dados e ficam imediatamente prontas para busca no tradutor.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Importar Excel / Documento</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="text-base font-serif-heading font-semibold text-stone-900 mb-4">
              Registar Novo Vocábulo Oficialmente Aprovado (Individual)
            </h3>
            <form onSubmit={handleCreateWord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Palavra ou Expressão *</label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ex: Kalunga"
                  className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Língua *</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-medium"
                >
                  {languages.filter(l => l.code !== 'pt').map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Tradução em Português *</label>
              <input
                type="text"
                required
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                placeholder="Ex: Olá / Paz / Vida"
                className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Pronúncia Fonética</label>
              <input
                type="text"
                value={newPronunciation}
                onChange={(e) => setNewPronunciation(e.target.value)}
                placeholder="Ex: Kah-loon-gah"
                className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Significado / Contexto Cultural</label>
              <textarea
                rows={3}
                value={newCulturalNotes}
                onChange={(e) => setNewCulturalNotes(e.target.value)}
                placeholder="Explicação antropológica ou tradicional..."
                className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
            >
              Publicar no Dicionário
            </button>
          </form>
          </div>
        </div>
      )}

      {/* Tab 4: Statistics & Users */}
      {activeTab === 'estatisticas' && (
        <div className="space-y-6">
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Total de Traduções</div>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                {stats?.totalTranslations || 1580}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Palavras Aprovadas</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {stats?.approvedWords || entries.filter(e => e.status === 'Aprovada').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Fila Pendente</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {stats?.pendingWords || pendingEntries.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <div className="text-xs text-stone-500 uppercase font-semibold">Línguas Ativas</div>
              <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
                {languages.filter(l => l.isActive).length}
              </div>
            </div>
          </div>

          {/* Grids: Top Languages & Top Searches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Languages */}
            <div className="bg-white p-5 rounded-xl border border-stone-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                Línguas Mais Traduzidas
              </h4>
              <div className="space-y-2 text-xs">
                {(stats?.topLanguages || []).slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-stone-50">
                    <span className="font-semibold text-stone-800">{item.name}</span>
                    <span className="font-mono text-stone-500 tabular-nums">{item.count} consultas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Searches */}
            <div className="bg-white p-5 rounded-xl border border-stone-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                Termos Mais Pesquisados
              </h4>
              <div className="space-y-2 text-xs">
                {(stats?.topSearches || []).slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-stone-50">
                    <span className="font-semibold text-stone-800">"{item.word}"</span>
                    <span className="font-mono text-stone-500 tabular-nums">{item.count} pesquisas</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Contributors Leaderboard */}
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              Guardiões da Língua: Maiores Contribuidores
            </h4>
            <div className="divide-y divide-stone-100">
              {(stats?.topContributors || []).map((user: any, idx: number) => (
                <div key={user.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-400 w-5">#{idx + 1}</span>
                    <span className="font-semibold text-stone-900">{user.name}</span>
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                      {user.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">{user.approvedCount || 0} aprovadas</span>
                    <span className="font-mono font-bold text-amber-600">{user.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 6: Monetização & Gestão de Banners */}
      {activeTab === 'monetizacao' && (
        <div className="space-y-6 text-left">
          
          {/* Top Hero Card with Metrics and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Gestão Central de Publicidades & Monetização</span>
              </div>
              <h3 className="text-lg font-serif-heading font-semibold text-stone-900 mt-0.5">
                Painel do Administrador · Banners Laterais e de Topo
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-xl">
                Gerencie todos os anúncios das empresas parceiras que passam no site, controle o carrossel rotativo das barras laterais e consulte métricas em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setIsCreateAdOpen(!isCreateAdOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{isCreateAdOpen ? 'Fechar Formulário' : '+ Registar Nova Empresa'}</span>
              </button>

              {onOpenMonetizationGuide && (
                <button
                  onClick={onOpenMonetizationGuide}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs transition-all shadow-xs"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Tabela de Preços (Kz)</span>
                </button>
              )}
            </div>
          </div>

          {adSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-bounce-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{adSuccessMessage}</span>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-[11px] font-semibold uppercase text-stone-500 block">Total de Anúncios</span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">{ads.length}</span>
              <span className="text-[10px] text-stone-400">empresas cadastradas</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-[11px] font-semibold uppercase text-stone-500 block">Banners Ativos</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                {ads.filter(a => a.isActive).length}
              </span>
              <span className="text-[10px] text-stone-400">a circular no site</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-[11px] font-semibold uppercase text-stone-500 block">Banners Laterais</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {ads.filter(a => a.placement.startsWith('sidebar')).length}
              </span>
              <span className="text-[10px] text-stone-400">em rotação contínua</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <span className="text-[11px] font-semibold uppercase text-stone-500 block">Total de Cliques</span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">
                {ads.reduce((acc, a) => acc + (a.clicksCount || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400">conversões geradas</span>
            </div>
          </div>

          {/* CONTROLO DAS BARRAS LATERAIS ROTATIVAS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">
                    Controlo dos Banners Laterais Rotativos (Sidebars)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Configure a exibição e o tempo de passagem dos anúncios das empresas nas laterais do ecrã.
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (onUpdateAdSettings) {
                    setIsSavingSettings(true);
                    try {
                      await onUpdateAdSettings({
                        sidebarAdsEnabled: sideEnabled,
                        sidebarLeftActive: sideLeft,
                        sidebarRightActive: sideRight,
                        sidebarRotationInterval: sideInterval,
                      });
                      setAdSuccessMessage('Definições das barras laterais salvas com sucesso!');
                      setTimeout(() => setAdSuccessMessage(null), 3000);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }
                }}
                disabled={isSavingSettings}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSavingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Salvar Definições Laterais</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              {/* Toggle 1: Geral */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">Banners Laterais</span>
                  <span className="text-[11px] text-stone-500">Exibir no site</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSideEnabled(!sideEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    sideEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      sideEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Esquerda */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">Lado Esquerdo</span>
                  <span className="text-[11px] text-stone-500">Barra lateral esquerda</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSideLeft(!sideLeft)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    sideLeft ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      sideLeft ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Direita */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">Lado Direito</span>
                  <span className="text-[11px] text-stone-500">Barra lateral direita</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSideRight(!sideRight)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    sideRight ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      sideRight ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Tempo de Transição */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <span className="text-xs font-semibold text-stone-900">Tempo de Rotação</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {[5, 7, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSideInterval(sec)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                        sideInterval === sec
                          ? 'bg-amber-400 text-stone-950 border-amber-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO: REGISTAR NOVA EMPRESA OU ANÚNCIO (ADMIN ONLY) */}
          {isCreateAdOpen && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 p-5 sm:p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Registar Nova Empresa Patrocinadora
                    </h4>
                    <p className="text-xs text-stone-500">
                      Adicione os detalhes da publicidade que contratou o espaço no Tradutor Nacional.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateAdOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adFormSponsor || !adFormTitle) return;

                  setIsSubmittingAd(true);
                  try {
                    const newBannerPayload: Partial<AdBannerType> = {
                      sponsorName: adFormSponsor.trim(),
                      title: adFormTitle.trim(),
                      description: adFormDesc.trim() || 'Apoio cultural e serviços aos cidadãos de Angola.',
                      placement: adFormPlacement,
                      badgeText: adFormBadge.trim() || 'Patrocinador Oficial',
                      ctaText: adFormCta.trim() || 'Saber Mais',
                      targetUrl: adFormTargetUrl.trim() || 'https://tradutornacional.ao',
                      imageUrl: adFormImageUrl.trim() || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
                      category: adFormCategory.trim() || 'telecom',
                      isActive: true,
                    };

                    if (onAddNewAd) {
                      await onAddNewAd(newBannerPayload);
                    }
                    setAdSuccessMessage(`Publicidade de "${adFormSponsor}" cadastrada e ativada com sucesso!`);
                    setAdFormSponsor('');
                    setAdFormTitle('');
                    setAdFormDesc('');
                    setIsCreateAdOpen(false);
                    setTimeout(() => setAdSuccessMessage(null), 3500);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsSubmittingAd(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Empresa / Patrocinador *
                    </label>
                    <input
                      type="text"
                      value={adFormSponsor}
                      onChange={(e) => setAdFormSponsor(e.target.value)}
                      placeholder="Ex: Africell / Banco BAI / Unitel"
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Título do Anúncio *
                    </label>
                    <input
                      type="text"
                      value={adFormTitle}
                      onChange={(e) => setAdFormTitle(e.target.value)}
                      placeholder="Ex: Planos de Dados com Bónus Estudante"
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Posição de Exibição *
                    </label>
                    <select
                      value={adFormPlacement}
                      onChange={(e) => setAdFormPlacement(e.target.value as AdPlacement)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                    >
                      <option value="sidebar_left">Lateral Esquerda (Carrossel)</option>
                      <option value="sidebar_right">Lateral Direita (Carrossel)</option>
                      <option value="sidebar_both">Ambas as Laterais (Esquerda + Direita)</option>
                      <option value="top_leaderboard">Top Leaderboard (Topo Tradutor / Início)</option>
                      <option value="native_feed">No Feed (Dicionário / Músicas)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                    Texto Descritivo / Slogan
                  </label>
                  <input
                    type="text"
                    value={adFormDesc}
                    onChange={(e) => setAdFormDesc(e.target.value)}
                    placeholder="Ex: Acesso gratuito a conteúdos de valorização da cultura bantu angolana."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Link de Destino (Site / WhatsApp)
                    </label>
                    <input
                      type="url"
                      value={adFormTargetUrl}
                      onChange={(e) => setAdFormTargetUrl(e.target.value)}
                      placeholder="https://suaempresa.ao"
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      URL da Imagem / Logotipo
                    </label>
                    <input
                      type="url"
                      value={adFormImageUrl}
                      onChange={(e) => setAdFormImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/logo.jpg"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Texto do Botão (CTA)
                    </label>
                    <input
                      type="text"
                      value={adFormCta}
                      onChange={(e) => setAdFormCta(e.target.value)}
                      placeholder="Ex: Aderir Agora"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-stone-700 mb-1">
                      Selo de Destaque
                    </label>
                    <input
                      type="text"
                      value={adFormBadge}
                      onChange={(e) => setAdFormBadge(e.target.value)}
                      placeholder="Ex: Patrocinador Oficial"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateAdOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAd}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSubmittingAd ? 'A Publicar...' : 'Publicar Anúncio no Site'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CATÁLOGO E FILTROS DE PUBLICIDADES */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Todas as Empresas & Anúncios Registados ({ads.length})
                </h4>
                <p className="text-[11px] text-stone-500">
                  Controle a ativação, pausa ou exclusão de cada parceiro.
                </p>
              </div>

              {/* Filtro de Posição */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setAdsFilter('all')}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adsFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Todos ({ads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdsFilter('sidebars')}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adsFilter === 'sidebars'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Laterais ({ads.filter(a => a.placement.startsWith('sidebar')).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdsFilter('leaderboard')}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adsFilter === 'leaderboard'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Topo Leaderboard ({ads.filter(a => a.placement === 'top_leaderboard').length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdsFilter('feed')}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adsFilter === 'feed'
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  No Feed ({ads.filter(a => a.placement === 'native_feed').length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {ads
                .filter((ad) => {
                  if (adsFilter === 'sidebars') return ad.placement.startsWith('sidebar');
                  if (adsFilter === 'leaderboard') return ad.placement === 'top_leaderboard';
                  if (adsFilter === 'feed') return ad.placement === 'native_feed';
                  return true;
                })
                .map((ad) => (
                  <div key={ad.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {ad.imageUrl ? (
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.sponsorName} 
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-stone-900 text-amber-400 font-bold flex items-center justify-center shrink-0">
                          AO
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-900">
                            {ad.sponsorName}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            ad.placement.startsWith('sidebar')
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}>
                            {ad.placement === 'sidebar_left' && 'Lateral Esquerda'}
                            {ad.placement === 'sidebar_right' && 'Lateral Direita'}
                            {ad.placement === 'sidebar_both' && 'Ambas as Laterais'}
                            {ad.placement === 'top_leaderboard' && 'Topo Leaderboard'}
                            {ad.placement === 'native_feed' && 'No Feed Dicionário'}
                            {!['sidebar_left', 'sidebar_right', 'sidebar_both', 'top_leaderboard', 'native_feed'].includes(ad.placement) && ad.placement}
                          </span>
                          {ad.badgeText && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              {ad.badgeText}
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs sm:text-sm font-semibold text-stone-800 mt-0.5">
                          {ad.title}
                        </h5>
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          {ad.description}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-stone-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-stone-400" />
                            {ad.impressionsCount || 0} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3 text-stone-400" />
                            {ad.clicksCount || 0} cliques
                          </span>
                          <a 
                            href={ad.targetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-amber-800 hover:underline flex items-center gap-1"
                          >
                            <span>{ad.ctaText}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        ad.isActive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                      }`}>
                        {ad.isActive ? 'Ativo' : 'Pausado'}
                      </span>

                      {onToggleAd && (
                        <button
                          onClick={() => onToggleAd(ad.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            ad.isActive
                              ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {ad.isActive ? 'Pausar' : 'Ativar'}
                        </button>
                      )}

                      {onDeleteAd && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem a certeza que deseja remover a publicidade de "${ad.sponsorName}"?`)) {
                              onDeleteAd(ad.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir Anúncio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Dicas de Negociação para Angola */}
          <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl text-xs space-y-2 border border-stone-800">
            <div className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              Dica Estratégica para o Administrador em Angola:
            </div>
            <p className="leading-relaxed text-stone-300">
              Para formalizar patrocínios em Angola, elabore um contrato simples de prestação de serviços publicitários com fatura-recibo em Kwanzas (AOA). Apresente os números de visualizações e cliques acima à direção de marketing das empresas. As marcas valorizam relatórios mensais claros e o selo de apoio à cultura angolana.
            </p>
          </div>
        </div>
      )}
      {isChangePassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-left">
            <button
              onClick={() => setIsChangePassModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-700 mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-lg font-serif-heading font-semibold text-stone-900">
                Alterar Senha do Administrador
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              A nova senha será criptografada com PBKDF2 (100.000 iterações com Salt) e salva diretamente em <code className="text-stone-700 font-mono">/data/security_db.json</code>.
            </p>

            {passError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Introduza a senha atual..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nova Senha (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Introduza a nova senha forte..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repita a nova senha..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePassModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isUpdatingPass ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gravando na Base de Dados...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar na Base de Dados</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal de Importação em Lote (Excel, CSV ou Documento) */}
      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        languages={languages}
        onBatchImportSuccess={(imported) => {
          if (onBatchImportSuccess) {
            onBatchImportSuccess(imported);
          }
          setIsBatchModalOpen(false);
        }}
      />

    </div>
  );
};
