import React, { useState, useRef, useEffect } from 'react';
import { User, Award, ShieldCheck, PlusCircle, ChevronDown, BookOpen, Sparkles, Share2, Lock, DollarSign, Bot } from 'lucide-react';
import { UserProfile, NationalLanguage } from '../types';
import { OpenAILogo } from './ChatAssistantSection';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenContributeModal: () => void;
  onOpenPromoModal?: () => void;
  onOpenMonetizationModal?: () => void;
  isAdmin?: boolean;
  setIsAdmin?: (val: boolean) => void;
  adminToken?: string | null;
  languages?: NationalLanguage[];
  onSelectDictionaryLanguage?: (code: string) => void;
  onlineUsersCount?: number;
  isRealtimeConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onOpenProfile,
  onOpenContributeModal,
  onOpenPromoModal,
  onOpenMonetizationModal,
  isAdmin = true,
  setIsAdmin,
  adminToken = null,
  languages = [],
  onSelectDictionaryLanguage,
  onlineUsersCount = 1,
  isRealtimeConnected = true,
}) => {
  const [isDictDropdownOpen, setIsDictDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDictDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    if (onSelectDictionaryLanguage) {
      onSelectDictionaryLanguage(code);
    }
    setCurrentTab('dicionario');
    setIsDictDropdownOpen(false);
  };

  const nationalLangs = languages.filter(l => l.code !== 'pt' && l.isActive);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 samakaka-border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab('inicio')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-amber-500 to-stone-900 flex items-center justify-center shadow-md border border-amber-400/40">
              <span className="text-white font-bold text-base tracking-tighter">AO</span>
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
              Tradutor Nacional de Angola
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-300">
          <button
            onClick={() => setCurrentTab('inicio')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'inicio' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentTab('tradutor')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'tradutor' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Tradutor
          </button>
          <button
            onClick={() => setCurrentTab('linguas')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'linguas' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Línguas
          </button>

          {/* Dicionário with Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDictDropdownOpen(!isDictDropdownOpen)}
              className={`transition-colors whitespace-nowrap hover:text-white flex items-center gap-1.5 py-1 ${
                currentTab === 'dicionario' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <span>Dicionário</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDictDropdownOpen ? 'rotate-180 text-amber-400' : 'text-stone-400'}`} />
            </button>

            {isDictDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl py-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-stone-800 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Dicionários de Línguas Nacionais</span>
                </div>
                
                <button
                  onClick={() => handleSelectLanguage('all')}
                  className="w-full text-left px-3.5 py-2 hover:bg-stone-800 flex items-center justify-between text-stone-200 hover:text-white transition-colors border-b border-stone-800/60"
                >
                  <span className="font-semibold">Ver Todo o Dicionário Nacional</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Todas</span>
                </button>

                <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                  {nationalLangs.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className="w-full text-left px-3.5 py-2 hover:bg-stone-800/80 flex items-center justify-between text-stone-300 hover:text-amber-300 transition-colors group"
                    >
                      <div>
                        <span className="font-medium text-stone-100 group-hover:text-amber-400">
                          {lang.name}
                        </span>
                        <span className="text-stone-500 text-[11px] ml-1.5">⇄ Português</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {lang.regions.split(',')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="px-3 pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Traduções verificadas & comunitárias</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentTab('musicas')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'musicas' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Músicas
          </button>

          <button
            onClick={() => setCurrentTab('comunidade')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'comunidade' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Comunidade
          </button>
          <button
            onClick={() => setCurrentTab('chat')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 hover:text-white ${
              currentTab === 'chat' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            <OpenAILogo className="w-4 h-4 text-emerald-400" />
            <span>ChatGPT</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/30">OpenAI</span>
          </button>
          <button
            onClick={() => setCurrentTab('sobre')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              currentTab === 'sobre' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Sobre
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'admin'
                ? 'text-red-400 font-semibold'
                : adminToken
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-stone-400 hover:text-amber-300'
            }`}
            title={adminToken ? 'Painel Administrativo Autenticado' : 'Painel Administrativo (Requer Senha)'}
          >
            {adminToken ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Painel Admin</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Realtime Status Pill */}
          <div
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-xs transition-colors ${
              isRealtimeConnected
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
            }`}
            title={
              isRealtimeConnected
                ? 'Sincronização em tempo real ativa: alterações de utilizadores e administradores são refletidas instantaneamente.'
                : 'A restabelecer ligação em tempo real...'
            }
          >
            <span className="relative flex h-2 w-2">
              {isRealtimeConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold text-[10px] tracking-wide uppercase">
              {isRealtimeConnected ? 'Em Direto' : 'Reconectando'}
            </span>
            <span className="text-emerald-400/80 font-mono text-[10px]">
              · {onlineUsersCount} online
            </span>
          </div>

          {onOpenMonetizationModal && (
            <button
              onClick={onOpenMonetizationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              title="Sugestões de monetização e espaços publicitários"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Monetizar</span>
              <span className="lg:hidden">Anúncios</span>
            </button>
          )}

          {onOpenPromoModal && (
            <button
              onClick={onOpenPromoModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-stone-800/90 hover:bg-stone-700/90 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              title="Copiar textos prontos para divulgar nas redes e WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Divulgar</span>
            </button>
          )}

          <button
            onClick={onOpenContributeModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Contribuir
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-stone-200 transition-colors"
            title="Ver meu perfil e conquistas"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400/30">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-stone-100 max-w-[110px] truncate leading-tight">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-mono">
                <Award className="w-2.5 h-2.5" />
                {user.points} pts
              </span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`p-1.5 text-xs rounded border transition-colors flex items-center gap-1 ${
              currentTab === 'admin'
                ? 'bg-red-950/80 border-red-700 text-red-300'
                : adminToken
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-amber-300 hover:border-amber-500/30'
            }`}
            title={adminToken ? 'Painel Administrativo Autenticado (Base de Dados)' : 'Painel Administrativo (Requer Senha)'}
          >
            {adminToken ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-500" />}
          </button>
        </div>

      </div>

      {/* Mobile subnavigation bar with horizontal scroll */}
      <div className="lg:hidden flex items-center overflow-x-auto py-2 px-4 gap-4 border-t border-stone-800/80 text-xs text-stone-300 scrollbar-none">
        <button
          onClick={() => setCurrentTab('inicio')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'inicio' ? 'text-amber-400 font-bold' : ''}`}
        >
          Início
        </button>
        <button
          onClick={() => setCurrentTab('tradutor')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'tradutor' ? 'text-amber-400 font-bold' : ''}`}
        >
          Tradutor
        </button>
        <button
          onClick={() => setCurrentTab('linguas')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'linguas' ? 'text-amber-400 font-bold' : ''}`}
        >
          Línguas
        </button>
        <button
          onClick={() => setCurrentTab('dicionario')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'dicionario' ? 'text-amber-400 font-bold' : ''}`}
        >
          Dicionário Nacional
        </button>
        <button
          onClick={() => setCurrentTab('musicas')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'musicas' ? 'text-amber-400 font-bold' : ''}`}
        >
          Músicas
        </button>
        <button
          onClick={() => setCurrentTab('comunidade')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'comunidade' ? 'text-amber-400 font-bold' : ''}`}
        >
          Comunidade
        </button>
        <button
          onClick={() => setCurrentTab('chat')}
          className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 ${currentTab === 'chat' ? 'text-emerald-400 font-bold' : ''}`}
        >
          <OpenAILogo className="w-3.5 h-3.5 text-emerald-400" />
          <span>ChatGPT</span>
        </button>
        <button
          onClick={() => setCurrentTab('sobre')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'sobre' ? 'text-amber-400 font-bold' : ''}`}
        >
          Sobre
        </button>
        {onOpenMonetizationModal && (
          <button
            onClick={onOpenMonetizationModal}
            className="whitespace-nowrap shrink-0 text-emerald-300 font-semibold flex items-center gap-1"
          >
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Monetizar</span>
          </button>
        )}
        {onOpenPromoModal && (
          <button
            onClick={onOpenPromoModal}
            className="whitespace-nowrap shrink-0 text-amber-300 font-semibold flex items-center gap-1"
          >
            <Share2 className="w-3 h-3 text-amber-400" />
            <span>Divulgar</span>
          </button>
        )}
        <button
          onClick={() => setCurrentTab('admin')}
          className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${
            currentTab === 'admin'
              ? 'text-red-400 font-bold'
              : adminToken
              ? 'text-emerald-400 font-semibold'
              : 'text-stone-400'
          }`}
        >
          {adminToken ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-500" />}
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

