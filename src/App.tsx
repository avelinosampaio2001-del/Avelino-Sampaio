import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TranslatorBox } from './components/TranslatorBox';
import { LanguagesSection } from './components/LanguagesSection';
import { DictionarySection } from './components/DictionarySection';
import { ContributeSection } from './components/ContributeSection';
import { AboutSection } from './components/AboutSection';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { SongsSection } from './components/SongsSection';
import { PromoCopyModal } from './components/PromoCopyModal';
import { AdBanner } from './components/AdBanner';
import { SideBannersRail } from './components/SideBannersRail';
import { MonetizationModal } from './components/MonetizationModal';
import { Footer } from './components/Footer';
import { ChatAssistantSection, OpenAILogo } from './components/ChatAssistantSection';

import { NationalLanguage, DictionaryEntry, UserProfile, NationalSong, AdBanner as AdBannerType, MonetizationSettings } from './types';
import { INITIAL_LANGUAGES, INITIAL_DICTIONARY_ENTRIES, MOCK_ADMIN_USER, INITIAL_SONGS, INITIAL_ADS, DEFAULT_MONETIZATION_SETTINGS } from './data/seedData';
import { Award, CheckCircle2, X, Bot } from 'lucide-react';
import { useRealtime } from './hooks/useRealtime';
import { realtimeClient } from './services/realtimeClient';

export default function App() {
  const { isConnected, onlineCount } = useRealtime();
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [languages, setLanguages] = useState<NationalLanguage[]>(INITIAL_LANGUAGES);
  const [dictionaryEntries, setDictionaryEntries] = useState<DictionaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tna_local_contributions');
      if (saved) {
        const localList = JSON.parse(saved);
        if (Array.isArray(localList) && localList.length > 0) {
          const initialIds = new Set(INITIAL_DICTIONARY_ENTRIES.map(e => e.id));
          const uniqueLocal = localList.filter((e: any) => !initialIds.has(e.id));
          return [...uniqueLocal, ...INITIAL_DICTIONARY_ENTRIES];
        }
      }
    } catch (e) {}
    return INITIAL_DICTIONARY_ENTRIES;
  });
  const [songs, setSongs] = useState<NationalSong[]>(INITIAL_SONGS);
  const [ads, setAds] = useState<AdBannerType[]>(INITIAL_ADS);
  const [monetizationSettings, setMonetizationSettings] = useState<MonetizationSettings>(DEFAULT_MONETIZATION_SETTINGS);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState<boolean>(false);
  const [activeBannerId, setActiveBannerId] = useState<string>(INITIAL_ADS[0]?.id || 'ad-unitel-1');
  
  // Local user profile state with local persistence
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('tna_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_ADMIN_USER;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('tna_admin_token');
    } catch (e) {
      return null;
    }
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState<boolean>(false);
  const [contributePrefill, setContributePrefill] = useState<{ word?: string; language?: string; targetLanguage?: string } | undefined>(undefined);
  const [selectedDictionaryLanguage, setSelectedDictionaryLanguage] = useState<string>('all');
  const [translatorPrefill, setTranslatorPrefill] = useState<{ word: string; sourceLang: string; targetLang: string } | null>(null);
  
  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'points' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'points' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch languages from backend
  const fetchLanguages = async () => {
    try {
      const res = await fetch('/api/languages');
      if (res.ok) {
        const data = await res.json();
        if (data.languages && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      }
    } catch (err) {
      console.warn('Using offline initial languages fallback');
    }
  };

  // Fetch dictionary from backend
  const fetchDictionary = async () => {
    try {
      const res = await fetch('/api/dictionary');
      if (res.ok) {
        const data = await res.json();
        if (data.entries && data.entries.length > 0) {
          // Merge with any local user contributions so they are never lost
          try {
            const saved = localStorage.getItem('tna_local_contributions');
            if (saved) {
              const localList: DictionaryEntry[] = JSON.parse(saved);
              const serverIds = new Set(data.entries.map((e: any) => e.id));
              const uniqueLocal = localList.filter(e => !serverIds.has(e.id));
              setDictionaryEntries([...uniqueLocal, ...data.entries]);
              return;
            }
          } catch (e) {}
          setDictionaryEntries(data.entries);
        }
      }
    } catch (err) {
      console.warn('Using offline initial dictionary fallback');
    }
  };

  // Fetch songs from backend
  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      if (res.ok) {
        const data = await res.json();
        if (data.songs && data.songs.length > 0) {
          setSongs(data.songs);
        }
      }
    } catch (err) {
      console.warn('Using offline initial songs fallback');
    }
  };

  // Fetch ads and monetization from backend
  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        if (data.ads && data.ads.length > 0) {
          setAds(data.ads);
        }
        if (data.settings) {
          setMonetizationSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('Using offline initial ads fallback');
    }
  };

  useEffect(() => {
    fetchLanguages();
    fetchDictionary();
    fetchSongs();
    fetchAds();
  }, []);

  // Real-time synchronization: listen to community and admin events live
  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe('*', (event) => {
      switch (event.type) {
        case 'dictionary:created': {
          const newEntry: DictionaryEntry = event.payload;
          setDictionaryEntries(prev => {
            if (prev.some(e => e.id === newEntry.id)) return prev;
            return [newEntry, ...prev];
          });
          if (newEntry.contributorId !== user.id) {
            showToast('Novo Vocábulo em Direto!', `"${newEntry.word}" foi adicionado pela comunidade.`, 'points');
          }
          break;
        }
        case 'dictionary:moderated': {
          const { entry, action } = event.payload;
          setDictionaryEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...entry } : e));
          showToast(
            action === 'Aprovada' ? 'Vocábulo Aprovado!' : 'Vocábulo Moderado',
            `"${entry.word}" foi ${action.toLowerCase()} em direto pelo administrador.`
          );
          break;
        }
        case 'dictionary:voted': {
          const { entryId, votes } = event.payload;
          setDictionaryEntries(prev => prev.map(e => e.id === entryId ? { ...e, votes } : e));
          break;
        }
        case 'dictionary:reported': {
          const { entryId, reportsCount } = event.payload;
          setDictionaryEntries(prev => prev.map(e => e.id === entryId ? { ...e, reportsCount } : e));
          break;
        }
        case 'song:created': {
          const newSong: NationalSong = event.payload;
          setSongs(prev => {
            if (prev.some(s => s.id === newSong.id)) return prev;
            return [newSong, ...prev];
          });
          if (newSong.contributorId !== user.id) {
            showToast('Nova Música Submetida!', `"${newSong.title}" (${newSong.artist}) adicionada para moderação.`);
          }
          break;
        }
        case 'song:moderated': {
          const { song, action } = event.payload;
          setSongs(prev => prev.map(s => s.id === song.id ? { ...s, ...song } : s));
          showToast(
            action === 'Aprovada' ? 'Música Aprovada em Direto!' : 'Música Moderada',
            `"${song.title}" de ${song.artist} está ${action === 'Aprovada' ? 'disponível no catálogo' : 'rejeitada'}.`
          );
          break;
        }
        case 'song:deleted': {
          const { songId } = event.payload;
          setSongs(prev => prev.filter(s => s.id !== songId));
          break;
        }
        case 'song:liked': {
          const { songId, likesCount } = event.payload;
          setSongs(prev => prev.map(s => s.id === songId ? { ...s, likesCount } : s));
          break;
        }
        case 'language:created': {
          const newLang: NationalLanguage = event.payload;
          setLanguages(prev => {
            if (prev.some(l => l.code === newLang.code)) return prev;
            return [...prev, newLang];
          });
          showToast('Nova Língua Catalogada!', `${newLang.name} foi catalogada com sucesso.`);
          break;
        }
        case 'language:updated': {
          const lang: NationalLanguage = event.payload;
          setLanguages(prev => prev.map(l => l.code === lang.code ? lang : l));
          break;
        }
        case 'user:updated': {
          const updatedUser: UserProfile = event.payload;
          if (updatedUser.id === user.id) {
            setUser(updatedUser);
            try {
              localStorage.setItem('tna_user_profile', JSON.stringify(updatedUser));
            } catch (e) {}
          }
          break;
        }
        case 'ad:updated': {
          const payload: any = event.payload;
          if (payload._settingsUpdate && payload.settings) {
            setMonetizationSettings(payload.settings);
            break;
          }
          const updatedAd: AdBannerType = payload;
          setAds(prev => {
            const exists = prev.some(a => a.id === updatedAd.id);
            if (exists) {
              return prev.map(a => a.id === updatedAd.id ? updatedAd : a);
            }
            return [updatedAd, ...prev];
          });
          break;
        }
        case 'ad:deleted': {
          const { id } = event.payload;
          setAds(prev => prev.filter(a => a.id !== id));
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [user.id]);

  // Validate admin session with backend database
  useEffect(() => {
    if (adminToken) {
      fetch('/api/admin/check-session', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then(res => res.json())
        .then(data => {
          if (!data.authenticated) {
            setAdminToken(null);
            sessionStorage.removeItem('tna_admin_token');
          }
        })
        .catch(() => {});
    }
  }, [adminToken]);

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    try {
      sessionStorage.setItem('tna_admin_token', token);
    } catch (e) {}
    showToast('Acesso Concedido', 'Painel administrativo desbloqueado com sucesso.', 'success');
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (e) {}
    }
    setAdminToken(null);
    try {
      sessionStorage.removeItem('tna_admin_token');
    } catch (e) {}
    showToast('Sessão Encerrada', 'O painel administrativo foi bloqueado com sucesso.');
  };

  const handleChangeAdminPassword = async (currentPass: string, newPass: string) => {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Senha Atualizada', 'A nova senha foi gravada com sucesso na base de dados.', 'success');
    }
    return data;
  };

  // Update user in state and localStorage
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('tna_user_profile', JSON.stringify(updatedUser));
    } catch (e) {}

    // sync with backend
    fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    }).catch(() => {});
  };

  // Music handlers
  const handleLikeSong = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSongs(prev => prev.map(s => s.id === songId ? { ...s, likesCount: data.likesCount } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSong = async (songData: Partial<NationalSong>) => {
    const res = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    let data: any = null;
    let text = '';
    try {
      text = await res.text();
      if (text) data = JSON.parse(text);
    } catch (e) {}
    if (!res.ok) {
      throw new Error(data?.error || `Erro (${res.status}): Não foi possível submeter a música.`);
    }
    setSongs(prev => [data.song, ...prev]);

    // Award +20 points
    const newPoints = user.points + 20;
    const newLevel = newPoints >= 150 ? 'Embaixador da Língua' : newPoints >= 51 ? 'Tradutor' : 'Colaborador';
    handleUpdateUser({
      ...user,
      points: newPoints,
      level: newLevel as any,
      contributionsCount: user.contributionsCount + 1,
    });

    showToast('Música Submetida!', 'A sua música foi enviada e aguarda aprovação pelo administrador.', 'points');
  };

  const handleModerateSong = async (id: string, action: 'Aprovada' | 'Rejeitada', comment?: string) => {
    try {
      const res = await fetch(`/api/songs/${id}/moderate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken(null);
          showToast('Acesso Restrito', 'Autentique-se com a senha de administrador da base de dados.');
          return;
        }
        throw new Error(data.error || 'Erro ao moderar música');
      }
      if (data.success) {
        setSongs(prev => prev.map(s => s.id === id ? { ...s, status: action, moderationComment: comment } : s));
        showToast(
          action === 'Aprovada' ? 'Música Aprovada!' : 'Música Rejeitada',
          action === 'Aprovada' ? 'A música já está disponível no catálogo público de Músicas Nacionais.' : 'A música foi marcada como rejeitada.'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro de Moderação', err.message || 'Falha ao moderar música.');
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      const res = await fetch(`/api/songs/${id}`, { 
        method: 'DELETE',
        headers: {
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken(null);
          showToast('Acesso Restrito', 'Autentique-se com a senha de administrador.');
          return;
        }
        throw new Error(data.error || 'Erro ao eliminar música');
      }
      if (data.success) {
        setSongs(prev => prev.filter(s => s.id !== id));
        showToast('Música Removida', 'A música foi eliminada do acervo.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro', err.message || 'Não foi possível remover a música.');
    }
  };

  // Community voting handler
  const handleVote = async (entryId: string, voteType: 'correct' | 'incorrect' | 'heart') => {
    try {
      const res = await fetch(`/api/suggestions/${entryId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, userId: user.id }),
      });
      const data = await res.json();
      if (data.success && data.votes) {
        setDictionaryEntries(prev =>
          prev.map(e => (e.id === entryId ? { ...e, votes: data.votes } : e))
        );
        showToast('Voto Registado!', 'A sua avaliação fortalece a precisão do repositório nacional.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Report handler
  const handleReport = async (entryId: string, reason: string) => {
    try {
      const res = await fetch(`/api/suggestions/${entryId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Denúncia Enviada', 'A entrada foi sinalizada para a equipa de moderação.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Suggestion submission callback
  const handleSuggestionSubmitted = (newEntry: DictionaryEntry) => {
    setDictionaryEntries(prev => [newEntry, ...prev]);
    // update user points (+15 pts)
    const newPoints = user.points + 15;
    const newLevel = newPoints >= 150 ? 'Embaixador da Língua' : newPoints >= 51 ? 'Tradutor' : 'Colaborador';
    const updated = {
      ...user,
      points: newPoints,
      level: newLevel as any,
      contributionsCount: user.contributionsCount + 1,
    };
    handleUpdateUser(updated);
    showToast('Contribuição Submetida!', '+15 Pontos creditados na sua conta de Colaborador.', 'points');
  };

  // Admin moderation handler
  const handleModerateSuggestion = async (id: string, action: 'Aprovada' | 'Rejeitada', comment?: string) => {
    try {
      const res = await fetch(`/api/suggestions/${id}/moderate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({ action, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken(null);
          showToast('Acesso Restrito', 'Autenticação necessária na base de dados.');
          return;
        }
        throw new Error(data.error || 'Erro ao moderar sugestão.');
      }
      if (data.success) {
        setDictionaryEntries(prev =>
          prev.map(e => (e.id === id ? { ...e, status: action, moderationComment: comment } : e))
        );
        showToast(
          action === 'Aprovada' ? 'Sugestão Aprovada!' : 'Sugestão Rejeitada',
          action === 'Aprovada'
            ? 'A expressão agora faz parte do Dicionário Nacional oficial.'
            : 'O autor foi notificado com a sua recomendação.'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro', err.message || 'Falha na moderação.');
    }
  };

  // Admin add language handler
  const handleAddLanguage = async (newLang: Partial<NationalLanguage>) => {
    try {
      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify(newLang),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken(null);
          showToast('Acesso Restrito', 'Autentique-se com a senha de administrador.');
          return;
        }
        throw new Error(data.error || 'Erro ao catalogar nova língua.');
      }
      if (data.success) {
        setLanguages(prev => [...prev, data.language]);
        showToast('Nova Língua Adicionada', `${data.language.name} foi catalogada com sucesso.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro', err.message || 'Não foi possível adicionar a língua.');
    }
  };

  // Admin toggle language
  const handleToggleLanguage = async (code: string) => {
    try {
      const res = await fetch(`/api/languages/${code}`, {
        method: 'DELETE',
        headers: {
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAdminToken(null);
          showToast('Acesso Restrito', 'Autentique-se com a senha de administrador.');
          return;
        }
        throw new Error(data.error || 'Erro ao alterar estado da língua.');
      }
      if (data.success) {
        setLanguages(prev => prev.map(l => (l.code === code ? data.language : l)));
        showToast('Estado Atualizado', `A língua foi ${data.language.isActive ? 'reativada' : 'desativada'}.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro', err.message || 'Não foi possível alterar o estado da língua.');
    }
  };

  // Admin add official word
  const handleAddNewWord = async (newEntry: Partial<DictionaryEntry>) => {
    const fallbackEntry: DictionaryEntry = {
      id: `dict-${Date.now()}`,
      word: String(newEntry.word || '').trim(),
      translation: String(newEntry.translation || '').trim(),
      language: String(newEntry.language || 'kimbundu'),
      targetLanguage: String(newEntry.targetLanguage || 'pt'),
      meaning: String(newEntry.meaning || newEntry.translation || '').trim(),
      examples: newEntry.examples || [],
      pronunciation: String(newEntry.pronunciation || '').trim(),
      culturalNotes: String(newEntry.culturalNotes || '').trim(),
      contributorName: newEntry.contributorName || 'Administrador ILNA',
      contributorId: newEntry.contributorId || 'usr-admin',
      contributorLevel: (newEntry.contributorLevel as any) || 'Embaixador da Língua',
      createdAt: new Date().toISOString(),
      status: 'Aprovada',
      votes: { correct: 5, incorrect: 0, hearts: 3 },
      searchCount: 0,
      reportsCount: 0,
    };

    let savedEntry: DictionaryEntry = fallbackEntry;

    try {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      let data: any = null;
      let text = '';
      try {
        text = await res.text();
        if (text) data = JSON.parse(text);
      } catch (parseErr) {}

      if (res.ok && data?.entry) {
        savedEntry = data.entry;
      }
    } catch (err: any) {
      console.warn('Backend indisponível ao adicionar vocábulo oficial, usando salvamento local.');
    }

    // Persist locally
    try {
      const saved = localStorage.getItem('tna_local_contributions');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(savedEntry);
      localStorage.setItem('tna_local_contributions', JSON.stringify(list));
    } catch (e) {}

    setDictionaryEntries(prev => [savedEntry, ...prev.filter(e => e.id !== savedEntry.id)]);
    showToast('Vocábulo Registado', `"${savedEntry.word}" publicado oficialmente no dicionário.`);
  };

  // Quick action from unconfirmed translation
  const handleOpenContributeWithData = (data: { word: string; language: string; targetLanguage: string }) => {
    setContributePrefill(data);
    setIsContributeModalOpen(true);
  };

  const handleSelectLanguageFromExplorer = (langCode: string) => {
    setCurrentTab('tradutor');
  };

  // Ads & Monetization handlers
  const handleSelectActiveBanner = (bannerId: string) => {
    setActiveBannerId(bannerId);
    showToast('Banner Ativado', 'O banner selecionado agora está em exibição principal.');
  };

  const handleSaveCustomBanner = async (newBannerData: Partial<AdBannerType>) => {
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBannerData),
      });
      const data = await res.json();
      if (data.success && data.ad) {
        setAds(prev => [data.ad, ...prev]);
        setActiveBannerId(data.ad.id);
        showToast('Anúncio Publicado', `"${data.ad.sponsorName}" foi ativado no topo da aplicação.`);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro', 'Não foi possível cadastrar o banner.');
    }
  };

  const handleToggleAd = async (id: string) => {
    try {
      const res = await fetch(`/api/ads/toggle/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.ad) {
        setAds(prev => prev.map(a => a.id === id ? data.ad : a));
        showToast('Banner Atualizado', `O banner foi ${data.ad.isActive ? 'ativado' : 'pausado'}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdClick = async (bannerId: string) => {
    try {
      await fetch(`/api/ads/${bannerId}/click`, { method: 'POST' });
      setAds(prev => prev.map(a => a.id === bannerId ? { ...a, clicksCount: (a.clicksCount || 0) + 1 } : a));
    } catch (err) {}
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAds(prev => prev.filter(a => a.id !== id));
        showToast('Publicidade Removida', 'O anúncio foi excluído do sistema.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro', 'Não foi possível remover o anúncio.');
    }
  };

  const handleUpdateAdSettings = async (newSettings: Partial<MonetizationSettings>) => {
    try {
      const res = await fetch('/api/ads/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setMonetizationSettings(data.settings);
        showToast('Definições Gravadas', 'As opções das barras laterais foram salvas.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro', 'Não foi possível salvar as definições.');
    }
  };

  // Active banners
  const topBanner = ads.find(a => a.id === activeBannerId && a.isActive) || ads.find(a => a.placement === 'top_leaderboard' && a.isActive) || ads[0];
  const nativeBanner = ads.find(a => a.placement === 'native_feed' && a.isActive) || ads[1] || ads[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-900">
      
      {/* Top Navbar with Dictionary Dropdown Menu */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenContributeModal={() => {
          setContributePrefill(undefined);
          setIsContributeModalOpen(true);
        }}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
        onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        adminToken={adminToken}
        languages={languages}
        onSelectDictionaryLanguage={(code) => {
          setSelectedDictionaryLanguage(code);
          setCurrentTab('dicionario');
        }}
        onlineUsersCount={onlineCount}
        isRealtimeConnected={isConnected}
      />

      {/* Side Banners: Left & Right Rotating Company Ads */}
      <SideBannersRail
        side="left"
        ads={ads}
        settings={monetizationSettings}
        onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
        onAdClick={handleAdClick}
      />
      <SideBannersRail
        side="right"
        ads={ads}
        settings={monetizationSettings}
        onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
        onAdClick={handleAdClick}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        
        {/* TAB: INÍCIO */}
        {currentTab === 'inicio' && (
          <div>
            <HeroSection
              onStartTranslating={() => setCurrentTab('tradutor')}
              onExploreLanguages={() => setCurrentTab('linguas')}
              onContribute={() => {
                setContributePrefill(undefined);
                setIsContributeModalOpen(true);
              }}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
              stats={{
                totalTranslations: 1840,
                approvedWords: dictionaryEntries.filter(e => e.status === 'Aprovada').length,
                totalLanguages: languages.filter(l => l.isActive && l.code !== 'pt').length,
              }}
            />

            {/* Embedded Translator on Home for seamless instant access */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-8">
              <TranslatorBox
                languages={languages}
                user={user}
                onUpdateUser={handleUpdateUser}
                onOpenContributeModalWithData={handleOpenContributeWithData}
                prefillData={translatorPrefill}
              />
            </div>

            {/* Espaço Publicitário & Monetização: Top Leaderboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
              <AdBanner
                banner={topBanner}
                placement="top_leaderboard"
                onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
                onAdClick={handleAdClick}
              />
            </div>

            {/* Community Teaser Banner */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-12 text-left">
              <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-amber-400 font-semibold">
                    A Força da Comunidade Angolana
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif-heading font-semibold text-white">
                    Conhece um provérbio ou palavra que ainda não está aqui?
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                    Partilhe com todos os angolanos a sabedoria da sua terra. Cada contribuição é recompensada com pontos de reputação e prestígio cultural.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setContributePrefill(undefined);
                    setIsContributeModalOpen(true);
                  }}
                  className="px-6 py-3 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-md shrink-0"
                >
                  Contribuir Agora (+15 pts)
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB: TRADUTOR */}
        {currentTab === 'tradutor' && (
          <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-left mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Tradução Bidirecional Instantânea
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-stone-900">
                Tradutor Nacional de Angola
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Traduza expressões por texto ou voz com pronúncia fonética e notas socioculturais.
              </p>
            </div>

            {/* Espaço Publicitário & Monetização: Leaderboard no Tradutor */}
            <div className="mb-6">
              <AdBanner
                banner={topBanner}
                placement="top_leaderboard"
                onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
                onAdClick={handleAdClick}
              />
            </div>

            <TranslatorBox
              languages={languages}
              user={user}
              onUpdateUser={handleUpdateUser}
              onOpenContributeModalWithData={handleOpenContributeWithData}
              prefillData={translatorPrefill}
            />
          </div>
        )}

        {/* TAB: LÍNGUAS */}
        {currentTab === 'linguas' && (
          <LanguagesSection
            languages={languages}
            onSelectLanguageForTranslation={handleSelectLanguageFromExplorer}
          />
        )}

        {/* TAB: DICIONÁRIO (MENU DE DICIONÁRIO DE LÍNGUAS NACIONAIS E SUAS TRADUÇÕES) */}
        {currentTab === 'dicionario' && (
          <div>
            {/* Banner Nativo no Dicionário */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <AdBanner
                banner={nativeBanner}
                placement="native_feed"
                onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
                onAdClick={handleAdClick}
              />
            </div>
            <DictionarySection
              entries={dictionaryEntries}
              languages={languages}
              user={user}
              onVote={handleVote}
              onReport={handleReport}
              onOpenContributeModal={() => {
                setContributePrefill(undefined);
                setIsContributeModalOpen(true);
              }}
              selectedLanguageFilter={selectedDictionaryLanguage}
              onSelectLanguageFilter={setSelectedDictionaryLanguage}
              onTranslateWord={(word, sourceLang, targetLang) => {
                setTranslatorPrefill({ word, sourceLang, targetLang });
                setCurrentTab('tradutor');
              }}
            />
          </div>
        )}

        {/* TAB: MÚSICAS NACIONAIS COM TRADUÇÃO */}
        {currentTab === 'musicas' && (
          <div>
            {/* Banner Nativo em Músicas Nacionais */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <AdBanner
                banner={ads.find(a => a.category === 'turismo') || nativeBanner}
                placement="native_feed"
                onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
                onAdClick={handleAdClick}
              />
            </div>
            <SongsSection
              songs={songs}
              languages={languages}
              user={user}
              onLikeSong={handleLikeSong}
              onSubmitSong={handleSubmitSong}
              onTranslateText={(text, sLang, tLang) => {
                setTranslatorPrefill({ word: text, sourceLang: sLang, targetLang: tLang });
                setCurrentTab('tradutor');
              }}
            />
          </div>
        )}

        {/* TAB: COMUNIDADE */}
        {currentTab === 'comunidade' && (
          <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <ContributeSection
              languages={languages}
              user={user}
              onSuggestionSubmitted={handleSuggestionSubmitted}
            />
          </div>
        )}

        {/* TAB: SOBRE */}
        {currentTab === 'sobre' && (
          <AboutSection
            onStartTranslating={() => setCurrentTab('tradutor')}
            onOpenContributeModal={() => {
              setContributePrefill(undefined);
              setIsContributeModalOpen(true);
            }}
          />
        )}

        {/* TAB: CHAT IA (ESTILO CHATGPT / MESTRE BANTU) */}
        {currentTab === 'chat' && (
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
            <ChatAssistantSection
              languages={languages}
              user={user}
              onStartTranslating={(word, sLang, tLang) => {
                setTranslatorPrefill({ word, sourceLang: sLang, targetLang: tLang });
                setCurrentTab('tradutor');
              }}
            />
          </div>
        )}

        {/* TAB: ADMIN (PAINEL ADMINISTRATIVO COM PROTEÇÃO CRIPTOGRÁFICA) */}
        {currentTab === 'admin' && (
          <AdminDashboard
            adminToken={adminToken}
            onLoginSuccess={handleAdminLoginSuccess}
            onLogoutAdmin={handleAdminLogout}
            onChangeAdminPassword={handleChangeAdminPassword}
            languages={languages}
            onAddLanguage={handleAddLanguage}
            onToggleLanguage={handleToggleLanguage}
            entries={dictionaryEntries}
            onModerateSuggestion={handleModerateSuggestion}
            onAddNewWord={handleAddNewWord}
            onBatchImportSuccess={(importedEntries) => {
              setDictionaryEntries(prev => [...importedEntries, ...prev]);
            }}
            songs={songs}
            onModerateSong={handleModerateSong}
            onDeleteSong={handleDeleteSong}
            ads={ads}
            onToggleAd={handleToggleAd}
            onDeleteAd={handleDeleteAd}
            onAddNewAd={handleSaveCustomBanner}
            settings={monetizationSettings}
            onUpdateAdSettings={handleUpdateAdSettings}
            onOpenMonetizationGuide={() => setIsMonetizationModalOpen(true)}
          />
        )}

      </main>

      {/* Institutional Footer */}
      <Footer
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
        onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
      />

      {/* Floating ChatGPT Trigger button */}
      {currentTab !== 'chat' && (
        <button
          onClick={() => setCurrentTab('chat')}
          className="fixed bottom-6 right-6 z-40 bg-[#10a37f] hover:bg-[#0e8e6e] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white/80 group cursor-pointer"
          title="Abrir ChatGPT (OpenAI) para Línguas de Angola"
        >
          <OpenAILogo className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-xs font-bold pr-1">ChatGPT OpenAI</span>
        </button>
      )}

      {/* Promotional Copy Sharing Modal */}
      <PromoCopyModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />

      {/* Monetization & Advertising Modal */}
      <MonetizationModal
        isOpen={isMonetizationModalOpen}
        onClose={() => setIsMonetizationModalOpen(false)}
        ads={ads}
        activeBannerId={activeBannerId}
        onSelectActiveBanner={handleSelectActiveBanner}
        onSaveCustomBanner={handleSaveCustomBanner}
        isAdmin={isAdmin}
      />

      {/* User Profile & Gamification Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        dictionaryEntries={dictionaryEntries}
        onSelectTranslation={(sourceText, sourceLang, targetLang) => {
          setCurrentTab('tradutor');
        }}
      />

      {/* Community Contribution Modal */}
      {isContributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setIsContributeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ContributeSection
              languages={languages}
              user={user}
              prefillData={contributePrefill}
              onSuggestionSubmitted={(entry) => {
                handleSuggestionSubmitted(entry);
                setIsContributeModalOpen(false);
              }}
              onCloseModal={() => setIsContributeModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-stone-800 flex items-start gap-3 animate-bounce-in">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            {toastMessage.type === 'points' ? <Award className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <h4 className="text-xs font-semibold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
        </div>
      )}

    </div>
  );
}
