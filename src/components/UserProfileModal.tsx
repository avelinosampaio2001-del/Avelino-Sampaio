import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Star, 
  History, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { UserProfile, DictionaryEntry } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  dictionaryEntries: DictionaryEntry[];
  onSelectTranslation: (sourceText: string, sourceLang: string, targetLang: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  dictionaryEntries,
  onSelectTranslation,
}) => {
  const [activeTab, setActiveTab] = useState<'contribuicoes' | 'favoritos' | 'historico' | 'perfil'>('contribuicoes');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user.name);

  if (!isOpen) return null;

  // Calculate level progress
  let nextThreshold = 51;
  let prevThreshold = 0;
  if (user.points >= 150) {
    prevThreshold = 150;
    nextThreshold = 300;
  } else if (user.points >= 51) {
    prevThreshold = 51;
    nextThreshold = 150;
  }

  const progressPercent = Math.min(100, Math.max(0, ((user.points - prevThreshold) / (nextThreshold - prevThreshold)) * 100));

  // User's contributions
  const userContributions = dictionaryEntries.filter(
    (e) => e.contributorId === user.id || e.contributorName.toLowerCase() === user.name.toLowerCase()
  );

  // User's favorites
  const favoriteEntries = dictionaryEntries.filter((e) => user.favorites.includes(e.id));

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    onUpdateUser({
      ...user,
      name: nameInput.trim(),
    });
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        
        {/* Header with Level & Points Banner */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border-b border-stone-800 flex items-start justify-between relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {user.level}
              </span>
              {user.role === 'admin' && (
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Administrador
                </span>
              )}
            </div>

            {/* User Name */}
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-stone-800 text-white text-lg font-serif-heading font-semibold px-2 py-1 rounded border border-stone-700"
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-xs bg-amber-400 text-stone-950 font-bold px-2.5 py-1 rounded"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-white">
                    {user.name}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-stone-400 hover:text-white p-1"
                    title="Editar nome"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Points & Progress Bar */}
            <div className="pt-2 max-w-sm">
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span>Pontuação: <strong className="text-amber-400 font-mono">{user.points} pts</strong></span>
                <span className="text-stone-400">Próximo nível: {nextThreshold} pts</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('contribuicoes')}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'contribuicoes'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Minhas Contribuições ({userContributions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favoritos')}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'favoritos'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favoritos ({favoriteEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'historico'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico ({user.history?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'perfil'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Níveis & Conquistas</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          
          {/* 1. Contributions */}
          {activeTab === 'contribuicoes' && (
            <div className="space-y-4">
              {userContributions.length === 0 ? (
                <div className="text-center py-10 text-stone-500">
                  <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Ainda não enviou nenhuma sugestão.</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Partilhe expressões na secção "Contribuir" para ganhar pontos e alcançar o estatuto de Embaixador da Língua!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userContributions.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-stone-900 text-base">
                            {item.word}
                          </h4>
                          <span className="text-xs text-stone-400">→</span>
                          <span className="text-sm text-stone-700">{item.translation}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Língua: <strong>{item.language}</strong> · Submetida em {new Date(item.createdAt).toLocaleDateString('pt-AO')}
                        </p>
                        {item.moderationComment && (
                          <div className="text-xs text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5">
                            Nota do moderador: {item.moderationComment}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {item.status === 'Aprovada' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aprovada (+25 pts)
                          </span>
                        )}
                        {item.status === 'Pendente' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Em Análise
                          </span>
                        )}
                        {item.status === 'Rejeitada' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Favorites */}
          {activeTab === 'favoritos' && (
            <div className="space-y-4">
              {favoriteEntries.length === 0 ? (
                <div className="text-center py-10 text-stone-500">
                  <Star className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Nenhuma tradução guardada nos favoritos.</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Ao traduzir uma expressão, clique no ícone da estrela para guardá-la aqui.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[11px] text-amber-700 font-semibold uppercase">
                          {item.language}
                        </div>
                        <div className="font-semibold text-stone-900 text-base mt-0.5">
                          {item.word}
                        </div>
                        <div className="text-xs text-stone-600 mt-1">
                          {item.translation}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onSelectTranslation(item.word, item.language, 'pt');
                          onClose();
                        }}
                        className="mt-3 text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 self-start"
                      >
                        <span>Abrir no Tradutor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. History */}
          {activeTab === 'historico' && (
            <div className="space-y-3">
              {(!user.history || user.history.length === 0) ? (
                <div className="text-center py-10 text-stone-500">
                  <History className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Sem histórico de traduções recente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.history.map((hist) => (
                    <div
                      key={hist.id}
                      onClick={() => {
                        onSelectTranslation(hist.sourceText, hist.sourceLang, hist.targetLang);
                        onClose();
                      }}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-stone-900">
                          "{hist.sourceText}" → "{hist.targetText}"
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {hist.sourceLang.toUpperCase()} para {hist.targetLang.toUpperCase()} · {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Gamification & Badges */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              
              {/* Level Tiers Explained */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Níveis de Reconhecimento Comunitário
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className={`p-3.5 rounded-xl border ${user.level === 'Colaborador' ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-white'}`}>
                    <div className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-stone-500" />
                      Colaborador
                    </div>
                    <div className="text-xs text-stone-500 mt-1">0 a 50 pontos</div>
                    <p className="text-[11px] text-stone-600 mt-2">
                      Inicia a jornada de partilha de palavras e sugestões.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${user.level === 'Tradutor' ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-white'}`}>
                    <div className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Tradutor
                    </div>
                    <div className="text-xs text-stone-500 mt-1">51 a 150 pontos</div>
                    <p className="text-[11px] text-stone-600 mt-2">
                      Contribuidor ativo com várias palavras e provérbios validados.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${user.level === 'Embaixador da Língua' ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-white'}`}>
                    <div className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-red-600" />
                      Embaixador da Língua
                    </div>
                    <div className="text-xs text-stone-500 mt-1">150+ pontos</div>
                    <p className="text-[11px] text-stone-600 mt-2">
                      Voz de referência na preservação e consultoria do património nacional.
                    </p>
                  </div>

                </div>
              </div>

              {/* Badges */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                  Distintivos & Reconhecimentos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(user.badges || ['Pioneiro da Plataforma', 'Voz da Comunidade']).map((badge, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-medium text-stone-800 flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
