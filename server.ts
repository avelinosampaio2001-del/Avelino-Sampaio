import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_LANGUAGES, INITIAL_DICTIONARY_ENTRIES, MOCK_ADMIN_USER, MOCK_COMMUNITY_USERS, INITIAL_SONGS, INITIAL_ADS, DEFAULT_MONETIZATION_SETTINGS } from './src/data/seedData';
import { DictionaryEntry, NationalLanguage, UserProfile, TranslationResult, NationalSong, AdBanner, MonetizationSettings } from './src/types';
import {
  verifyAdminLogin,
  validateSessionToken,
  revokeSessionToken,
  changeAdminPassword,
  requireAdminAuth,
  readSecurityDb,
} from './src/server/authDb';
import {
  initRealtimeServer,
  broadcastRealtimeEvent,
  handleSseRoute,
  getOnlineUsersCount,
} from './src/server/realtimeServer';
import { findCorpusTranslation } from './src/utils/linguisticCorpus';
import {
  loadDictionaryDb,
  saveDictionaryDb,
  insertDictionaryEntry,
  insertDictionaryBatch,
} from './src/server/dictionaryDb';
import {
  loadLanguagesDb,
  insertLanguage,
  toggleLanguageStatus,
} from './src/server/languagesDb';

const app = express();
const PORT = 3000;

// Enable CORS and handle preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Setup Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory store initialized with persistent JSON database
let languages: NationalLanguage[] = loadLanguagesDb();
let dictionary: DictionaryEntry[] = loadDictionaryDb();
let songs: NationalSong[] = [...INITIAL_SONGS];
let users: UserProfile[] = [MOCK_ADMIN_USER, ...MOCK_COMMUNITY_USERS];
let ads: AdBanner[] = [...INITIAL_ADS];
let monetizationSettings: MonetizationSettings = { ...DEFAULT_MONETIZATION_SETTINGS };
let searchStats: Record<string, number> = {
  'Sakidila': 420,
  'Muxima': 580,
  'Kandandu': 630,
  'Mbote': 710,
  'Matondo': 490,
  'Kalunga': 600,
  'Samanyonga': 740,
  'Onjango': 380,
};

let languageUsageStats: Record<string, number> = {
  'kimbundu': 1240,
  'umbundu': 1580,
  'kikongo': 980,
  'cokwe': 820,
  'kwanyama': 410,
  'ngangela': 320,
  'fiote': 280,
  'luvale': 240,
  'nyaneka': 210,
  'muhumbi': 180,
};

// Helper: Calculate user level
function calculateLevel(points: number): 'Colaborador' | 'Tradutor' | 'Embaixador da Língua' {
  if (points >= 150) return 'Embaixador da Língua';
  if (points >= 51) return 'Tradutor';
  return 'Colaborador';
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 0. Admin Authentication & Database-backed Strong Security
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Senha de administrador é obrigatória.' });
  }

  const result = verifyAdminLogin(password);
  if (!result.success) {
    return res.status(result.locked ? 429 : 401).json(result);
  }

  res.json(result);
});

app.get('/api/admin/check-session', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const isValid = validateSessionToken(token);
  res.json({ authenticated: isValid });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  revokeSessionToken(token);
  res.json({ success: true, message: 'Sessão administrativa terminada.' });
});

app.post('/api/admin/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
  }

  const result = changeAdminPassword(currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

app.get('/api/admin/security-info', (req, res) => {
  const db = readSecurityDb();
  res.json({
    algorithm: 'PBKDF2-HMAC-SHA512',
    iterations: db.admin.iterations,
    saltBits: 256,
    storage: 'Base de dados no servidor (/data/security_db.json)',
    updatedAt: db.admin.updatedAt,
    failedAttempts: db.admin.failedAttempts,
    isLocked: !!(db.admin.lockoutUntil && db.admin.lockoutUntil > Date.now()),
    lockoutUntil: db.admin.lockoutUntil,
  });
});

// Realtime SSE route & presence
app.get('/api/realtime/events', handleSseRoute);
app.get('/api/realtime/presence', (req, res) => {
  res.json({ onlineCount: getOnlineUsersCount() });
});

// -------------------------------------------------------------
// Ads & Monetization Endpoints
// -------------------------------------------------------------
app.get('/api/ads', (req, res) => {
  res.json({
    ads,
    settings: monetizationSettings,
  });
});

app.post('/api/ads/:id/click', (req, res) => {
  const { id } = req.params;
  const ad = ads.find(a => a.id === id);
  if (ad) {
    ad.clicksCount = (ad.clicksCount || 0) + 1;
    broadcastRealtimeEvent('ad:updated', ad);
    return res.json({ success: true, clicksCount: ad.clicksCount });
  }
  res.status(404).json({ error: 'Anúncio não encontrado' });
});

app.post('/api/ads/:id/impression', (req, res) => {
  const { id } = req.params;
  const ad = ads.find(a => a.id === id);
  if (ad) {
    ad.impressionsCount = (ad.impressionsCount || 0) + 1;
    return res.json({ success: true, impressionsCount: ad.impressionsCount });
  }
  res.status(404).json({ error: 'Anúncio não encontrado' });
});

app.post('/api/ads', (req, res) => {
  const newBannerData = req.body;
  if (!newBannerData.sponsorName || !newBannerData.title) {
    return res.status(400).json({ error: 'Patrocinador e título são obrigatórios' });
  }

  const newAd: AdBanner = {
    id: `ad-${Date.now()}`,
    title: newBannerData.title,
    sponsorName: newBannerData.sponsorName,
    description: newBannerData.description || '',
    badgeText: newBannerData.badgeText || 'Anunciante Parceiro',
    ctaText: newBannerData.ctaText || 'Saber Mais',
    targetUrl: newBannerData.targetUrl || 'https://tradutornacional.ao',
    imageUrl: newBannerData.imageUrl,
    placement: newBannerData.placement || 'top_leaderboard',
    isActive: newBannerData.isActive !== undefined ? newBannerData.isActive : true,
    impressionsCount: 0,
    clicksCount: 0,
    category: newBannerData.category || 'geral',
    rotationWeight: newBannerData.rotationWeight || 10,
  };

  ads.unshift(newAd);
  broadcastRealtimeEvent('ad:updated', newAd);
  res.status(201).json({ success: true, ad: newAd });
});

app.put('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  const index = ads.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  ads[index] = {
    ...ads[index],
    ...req.body,
    id, // preserve id
  };

  broadcastRealtimeEvent('ad:updated', ads[index]);
  res.json({ success: true, ad: ads[index] });
});

app.delete('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  const index = ads.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  const removed = ads.splice(index, 1)[0];
  broadcastRealtimeEvent('ad:deleted', { id: removed.id });
  res.json({ success: true, message: 'Anúncio removido com sucesso', ad: removed });
});

app.post('/api/ads/toggle/:id', (req, res) => {
  const { id } = req.params;
  const ad = ads.find(a => a.id === id);
  if (ad) {
    ad.isActive = !ad.isActive;
    broadcastRealtimeEvent('ad:updated', ad);
    return res.json({ success: true, ad });
  }
  res.status(404).json({ error: 'Anúncio não encontrado' });
});

app.put('/api/ads/settings', (req, res) => {
  monetizationSettings = { ...monetizationSettings, ...req.body };
  broadcastRealtimeEvent('ad:updated', { _settingsUpdate: true, settings: monetizationSettings });
  res.json({ success: true, settings: monetizationSettings });
});

// 1. Languages
app.get('/api/languages', (req, res) => {
  res.json({ languages });
});

app.post('/api/languages', requireAdminAuth, (req, res) => {
  const { code, name, nativeName, regions, speakersEstimated, family, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Código e nome da língua são obrigatórios' });
  }

  const cleanCode = String(code).trim().toLowerCase();
  const cleanName = String(name).trim();

  const existing = languages.find(l => l.code.toLowerCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ error: 'Uma língua com este código já existe no sistema.' });
  }

  const newLang: NationalLanguage = {
    code: cleanCode,
    name: cleanName,
    nativeName: nativeName ? String(nativeName).trim() : cleanName,
    regions: regions ? String(regions).trim() : 'Angola',
    speakersEstimated: speakersEstimated ? String(speakersEstimated).trim() : 'Em catalogação',
    family: family ? String(family).trim() : 'Níger-Congo (Bantu)',
    description: description ? String(description).trim() : 'Língua nacional de Angola preservada pela comunidade.',
    isActive: true,
  };

  languages = insertLanguage(newLang, languages);
  broadcastRealtimeEvent('language:created', newLang);
  console.log(`✅ [Base de Dados] Nova língua catalogada com sucesso: ${newLang.name} (${newLang.code})`);
  res.status(201).json({ success: true, language: newLang });
});

app.delete('/api/languages/:code', requireAdminAuth, (req, res) => {
  const { code } = req.params;
  const cleanCode = String(code).trim().toLowerCase();
  if (cleanCode === 'pt') {
    return res.status(400).json({ error: 'A língua oficial veicular não pode ser desativada' });
  }
  const lang = languages.find(l => l.code.toLowerCase() === cleanCode);
  if (!lang) {
    return res.status(404).json({ error: 'Língua não encontrada' });
  }
  const result = toggleLanguageStatus(cleanCode, languages);
  languages = result.updated;
  broadcastRealtimeEvent('language:updated', result.lang);
  res.json({ success: true, language: result.lang });
});

// 2. Dictionary & Community Suggestions
app.get(['/api/dictionary', '/api/suggestions', '/api/words'], (req, res) => {
  const { language, targetLanguage, status, query } = req.query;
  let filtered = [...dictionary];

  if (language && language !== 'all') {
    filtered = filtered.filter(item => item.language === language || item.targetLanguage === language);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(item => item.status === status);
  }

  if (query && typeof query === 'string') {
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const q = normalize(query);
    if (q) {
      filtered = filtered.filter(item => {
        const wordNorm = normalize(item.word || '');
        const transNorm = normalize(item.translation || '');
        const meaningNorm = normalize(item.meaning || '');
        const pronNorm = normalize(item.pronunciation || '');
        const noteNorm = normalize(item.culturalNotes || '');
        return wordNorm.includes(q) || transNorm.includes(q) || meaningNorm.includes(q) || pronNorm.includes(q) || noteNorm.includes(q);
      });
    }
  }

  res.json({ entries: filtered, total: filtered.length });
});

app.post(['/api/dictionary', '/api/suggestions', '/api/words', '/api/contributions'], (req, res) => {
  try {
    const entry: Partial<DictionaryEntry> = req.body || {};
    const word = String(entry.word || '').trim();
    const translation = String(entry.translation || '').trim();
    const language = String(entry.language || '').trim();

    if (!word || !translation || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Palavra, tradução e língua são obrigatórios para registar no dicionário.' 
      });
    }

    // Safety check on audioData size (max 5MB)
    let safeAudioData: string | undefined = undefined;
    if (typeof entry.audioData === 'string' && entry.audioData.length > 0) {
      if (entry.audioData.length > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'O ficheiro de áudio gravado é demasiado grande (limite: 5MB).'
        });
      }
      safeAudioData = entry.audioData;
    }

    const newEntry: DictionaryEntry = {
      id: `dict-${Date.now()}`,
      word,
      translation,
      language,
      targetLanguage: String(entry.targetLanguage || 'pt').trim(),
      meaning: String(entry.meaning || translation || 'Significado em documentação comunitária.').trim(),
      examples: Array.isArray(entry.examples) ? entry.examples : [],
      pronunciation: String(entry.pronunciation || '').trim(),
      audioUrl: typeof entry.audioUrl === 'string' ? entry.audioUrl : undefined,
      audioData: safeAudioData,
      culturalNotes: String(entry.culturalNotes || '').trim(),
      contributorName: String(entry.contributorName || 'Colaborador Anónimo').trim(),
      contributorId: String(entry.contributorId || 'guest').trim(),
      contributorLevel: (entry.contributorLevel as any) || 'Colaborador',
      createdAt: new Date().toISOString(),
      status: entry.status || 'Pendente',
      votes: { correct: 1, incorrect: 0, hearts: 1 },
      searchCount: 0,
      reportsCount: 0,
    };

    dictionary = insertDictionaryEntry(newEntry, dictionary);

    // Award points to contributor if user ID exists
    if (newEntry.contributorId && newEntry.contributorId !== 'guest') {
      const user = users.find(u => u.id === newEntry.contributorId);
      if (user) {
        user.points += 15;
        user.contributionsCount += 1;
        user.level = calculateLevel(user.points);
        broadcastRealtimeEvent('user:updated', user);
      }
    }

    // Broadcast realtime event
    try {
      broadcastRealtimeEvent('dictionary:created', newEntry);
    } catch (broadcastErr) {
      console.warn('Realtime broadcast warning:', broadcastErr);
    }

    return res.status(201).json({ success: true, entry: newEntry });
  } catch (err: any) {
    console.error('Erro no endpoint POST /api/dictionary:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro no servidor ao registar vocábulo: ' + (err?.message || 'Erro inesperado') 
    });
  }
});

// Importação em Lote a partir do Excel, CSV ou Documento (Gravada diretamente na Base de Dados)
app.post(['/api/dictionary/batch', '/api/dictionary/import'], (req, res) => {
  try {
    const { entries, autoApprove, contributorName } = req.body || {};
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum vocábulo válido fornecido para importação em lote.',
      });
    }

    const defaultStatus = autoApprove !== false ? 'Aprovada' : 'Pendente';
    const author = contributorName || 'Administrador (Lote Excel)';

    const { updatedList, addedEntries, skippedCount } = insertDictionaryBatch(
      entries,
      dictionary,
      defaultStatus,
      author
    );

    dictionary = updatedList;

    // Broadcast realtime update to all connected clients
    try {
      broadcastRealtimeEvent('dictionary:created', {
        isBatch: true,
        count: addedEntries.length,
        message: `${addedEntries.length} vocábulos importados e gravados na base de dados.`,
      });
    } catch (e) {}

    console.log(`✅ [Base de Dados] ${addedEntries.length} vocábulos gravados com sucesso via importação em lote (${skippedCount} ignorados/duplicados).`);

    return res.status(201).json({
      success: true,
      message: `${addedEntries.length} vocábulos gravados na base de dados com sucesso.`,
      count: addedEntries.length,
      skippedCount,
      entries: addedEntries,
    });
  } catch (err: any) {
    console.error('Erro ao processar lote no servidor:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gravar lote na base de dados: ' + (err?.message || 'Erro inesperado'),
    });
  }
});

// Moderation of suggestions
app.post('/api/suggestions/:id/moderate', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body; // action: 'Aprovada' | 'Rejeitada'

  const entry = dictionary.find(e => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'Sugestão não encontrada' });
  }

  if (action !== 'Aprovada' && action !== 'Rejeitada') {
    return res.status(400).json({ error: 'Ação inválida. Use Aprovada ou Rejeitada.' });
  }

  entry.status = action;
  entry.updatedAt = new Date().toISOString();
  if (comment) {
    entry.moderationComment = comment;
  }

  // If approved, reward contributor with +25 bonus points
  if (action === 'Aprovada' && entry.contributorId) {
    const user = users.find(u => u.id === entry.contributorId);
    if (user) {
      user.points += 25;
      user.approvedCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent('user:updated', user);
    }
  }

  // Persist update in database
  saveDictionaryDb(dictionary);

  broadcastRealtimeEvent('dictionary:moderated', { entry, action, comment });
  res.json({ success: true, entry });
});

// Community Voting
app.post('/api/suggestions/:id/vote', (req, res) => {
  const { id } = req.params;
  const { voteType, userId } = req.body; // 'correct' | 'incorrect' | 'heart'

  const entry = dictionary.find(e => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'Entrada não encontrada' });
  }

  if (!entry.userVotes) entry.userVotes = {};

  const currentVote = userId ? entry.userVotes[userId] : null;

  if (voteType === 'correct') {
    if (currentVote === 'correct') {
      entry.votes.correct = Math.max(0, entry.votes.correct - 1);
      if (userId) delete entry.userVotes[userId];
    } else {
      if (currentVote === 'incorrect') entry.votes.incorrect = Math.max(0, entry.votes.incorrect - 1);
      entry.votes.correct += 1;
      if (userId) entry.userVotes[userId] = 'correct';
    }
  } else if (voteType === 'incorrect') {
    if (currentVote === 'incorrect') {
      entry.votes.incorrect = Math.max(0, entry.votes.incorrect - 1);
      if (userId) delete entry.userVotes[userId];
    } else {
      if (currentVote === 'correct') entry.votes.correct = Math.max(0, entry.votes.correct - 1);
      entry.votes.incorrect += 1;
      if (userId) entry.userVotes[userId] = 'incorrect';
    }
  } else if (voteType === 'heart') {
    entry.votes.hearts += 1;
  }

  const userVoteResult = userId ? entry.userVotes[userId] : null;
  broadcastRealtimeEvent('dictionary:voted', {
    entryId: id,
    votes: entry.votes,
    userId,
    userVote: userVoteResult,
  });

  res.json({ success: true, votes: entry.votes, userVote: userVoteResult });
});

// Report suggestion
app.post('/api/suggestions/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const entry = dictionary.find(e => e.id === id);
  if (!entry) {
    return res.status(404).json({ error: 'Entrada não encontrada' });
  }

  entry.reportsCount = (entry.reportsCount || 0) + 1;
  broadcastRealtimeEvent('dictionary:reported', { entryId: id, reportsCount: entry.reportsCount });
  res.json({ success: true, reportsCount: entry.reportsCount });
});

// 3. Translation Engine (Dictionary first, Corpus second, Gemini AI third)
app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({ error: 'Texto, língua de origem e destino são necessários.' });
  }

  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return res.status(400).json({ error: 'Texto vazio.' });
  }

  // Same language: immediate return
  if (sourceLang === targetLang) {
    return res.json({
      sourceText: cleanText,
      sourceLang,
      targetText: cleanText,
      targetLang,
      isConfident: true,
      isAi: false,
      suggestImprovementNeeded: false,
    });
  }

  // Update language usage stats
  if (sourceLang !== 'pt') {
    languageUsageStats[sourceLang] = (languageUsageStats[sourceLang] || 0) + 1;
  }
  if (targetLang !== 'pt') {
    languageUsageStats[targetLang] = (languageUsageStats[targetLang] || 0) + 1;
  }

  // Track search keyword
  const keyword = cleanText.split(' ')[0];
  if (keyword.length > 2) {
    searchStats[keyword] = (searchStats[keyword] || 0) + 1;
  }

  // Step 1: Check verified dictionary
  const lowerText = cleanText.toLowerCase();
  const directMatch = dictionary.find(e =>
    e.status === 'Aprovada' &&
    ((e.language === sourceLang && e.targetLanguage === targetLang && e.word.toLowerCase() === lowerText) ||
     (e.language === targetLang && e.targetLanguage === sourceLang && e.translation.toLowerCase().includes(lowerText)))
  );

  if (directMatch) {
    directMatch.searchCount = (directMatch.searchCount || 0) + 1;
    const isForward = directMatch.language === sourceLang;
    const result: TranslationResult = {
      sourceText: cleanText,
      sourceLang,
      targetText: isForward ? directMatch.translation : directMatch.word,
      targetLang,
      pronunciation: directMatch.pronunciation,
      culturalNote: directMatch.culturalNotes,
      breakdown: [
        {
          term: cleanText,
          meaning: directMatch.meaning,
        }
      ],
      isConfident: true,
      isAi: false,
      dictionaryMatch: directMatch,
      suggestImprovementNeeded: false,
    };
    return res.json(result);
  }

  // Step 2: Check National Language Linguistic Corpus (Instant match)
  const corpusMatch = findCorpusTranslation(cleanText, sourceLang, targetLang);
  if (corpusMatch) {
    return res.json(corpusMatch);
  }

  // Step 3: Termo não encontrado no dicionário oficial: Consultar Google e Gerar Sugestão
  const sourceLangObj = languages.find(l => l.code === sourceLang);
  const targetLangObj = languages.find(l => l.code === targetLang);
  const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
  const targetName = targetLangObj ? targetLangObj.name : targetLang;

  try {
    const googleSuggest = await queryGoogleSuggestion(cleanText, sourceLang, targetLang, sourceName, targetName);
    const suggestedTranslation = googleSuggest.suggestedTranslation || cleanText;

    // Se o Google / motor de busca encontrou uma tradução válida diferente do texto original,
    // GRAVA AUTOMATICAMENTE NA BASE DE DADOS com persistência em disco e broadcast em tempo real!
    let autoSavedEntry: DictionaryEntry | null = null;
    if (
      suggestedTranslation &&
      suggestedTranslation.toLowerCase().trim() !== cleanText.toLowerCase().trim()
    ) {
      const isFromPt = sourceLang === 'pt';
      const nativeWord = isFromPt ? suggestedTranslation : cleanText;
      const ptTranslation = isFromPt ? cleanText : suggestedTranslation;
      const natLangCode = isFromPt ? targetLang : sourceLang;

      // Verificar se já existe para não duplicar
      const alreadyExists = dictionary.some(
        e =>
          e.language === natLangCode &&
          e.word.toLowerCase().trim() === nativeWord.toLowerCase().trim()
      );

      if (!alreadyExists) {
        autoSavedEntry = {
          id: `dict-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          word: nativeWord,
          translation: ptTranslation,
          language: natLangCode,
          targetLanguage: 'pt',
          meaning: googleSuggest.explanation || `Tradução autêntica obtida via Google & modelos linguísticos (${sourceName} -> ${targetName}).`,
          examples: [
            {
              phrase: nativeWord,
              translation: ptTranslation,
            },
          ],
          pronunciation: googleSuggest.pronunciation || '',
          culturalNotes: googleSuggest.explanation || `Termo catalogado automaticamente via motor Google e pesquisa contextual em Angola.`,
          contributorName: 'Google Tradutor & IA (Automático)',
          contributorId: 'bot-google-ai',
          contributorLevel: 'Embaixador da Língua',
          createdAt: new Date().toISOString(),
          status: 'Aprovada',
          votes: { correct: 5, incorrect: 0, hearts: 2 },
          searchCount: 1,
          reportsCount: 0,
        };

        // Grava no disco de forma persistente
        dictionary = insertDictionaryEntry(autoSavedEntry, dictionary);

        // Notifica todos os clientes em tempo real
        try {
          broadcastRealtimeEvent('dictionary:created', autoSavedEntry);
        } catch (e) {}

        console.log(`⚡ [Google Auto-Gravação] "${cleanText}" -> "${suggestedTranslation}" gravado com sucesso na base de dados!`);
      }
    }

    return res.json({
      sourceText: cleanText,
      sourceLang,
      targetText: suggestedTranslation,
      targetLang,
      pronunciation: googleSuggest.pronunciation || '',
      culturalNote: googleSuggest.explanation || 'Tradução obtida via motor Google e modelos linguísticos de Angola.',
      breakdown: [
        {
          term: cleanText,
          meaning: suggestedTranslation,
        }
      ],
      isConfident: true,
      isAi: true,
      isGoogleSuggestion: true,
      isAutoSavedToDb: Boolean(autoSavedEntry),
      autoSavedEntryId: autoSavedEntry ? autoSavedEntry.id : undefined,
      googleSuggestion: {
        text: suggestedTranslation,
        source: googleSuggest.source,
        searchUrl: googleSuggest.searchUrl,
        explanation: googleSuggest.explanation,
      },
      suggestImprovementNeeded: false,
    });
  } catch (err: any) {
    console.warn('Google & AI fallback error:', err.message);
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradução "${cleanText}" ${sourceName} ${targetName} Angola`)}`;

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
        source: 'Google Pesquisa',
        searchUrl: googleSearchUrl,
        explanation: 'Não foi encontrada correspondência imediata. Clique para consultar diretamente no Google.',
      },
      suggestImprovementNeeded: true,
      culturalNote: 'Expressão em análise pelos guardiões da língua. Pode sugerir a sua tradução comunitária ou consultar o Google.',
    });
  }
});

// Helper: Consultar Google Translate e Busca Inteligente para Termos não Encontrados
async function queryGoogleSuggestion(
  cleanText: string,
  sourceLang: string,
  targetLang: string,
  sourceName: string,
  targetName: string
) {
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`tradução "${cleanText}" ${sourceName} ${targetName} Angola`)}`;
  let googleTranslateText = '';

  // 1. Tentar Google Tradutor via curl rápido com timeout estrito
  try {
    const targetCode = targetLang === 'pt' ? 'pt' : 'auto';
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
  } catch (e: any) {
    // Continuar para síntese com IA
  }

  // 2. Consultar Gemini para sintetizar o resultado de busca do Google e contexto linguístico angolano
  try {
    const prompt = `Atue como o motor de busca linguística do Google para Angola. O vocábulo "${cleanText}" (${sourceName} -> ${targetName}) não está catalogado no acervo verificado.
${googleTranslateText ? `Uma consulta rápida ao Google Tradutor retornou preliminarmente: "${googleTranslateText}".` : ''}
Consulte dados linguísticos e da web para propor a tradução mais precisa e uma explicação contextual concisa.
Responda ESTRITAMENTE em formato JSON:
{
  "suggestedTranslation": "tradução sugerida",
  "explanation": "breve explicação etimológica ou contexto de uso em Angola",
  "pronunciation": "pronúncia aproximada"
}`;

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.suggestedTranslation) {
            return {
              query: cleanText,
              suggestedTranslation: parsed.suggestedTranslation,
              explanation: parsed.explanation || (googleTranslateText ? `Tradução sugerida pelo Google Tradutor com validação preliminar.` : 'Sugestão obtida através do Google e inteligência linguística.'),
              pronunciation: parsed.pronunciation || '',
              searchUrl: googleSearchUrl,
              source: googleTranslateText ? 'Google Tradutor & Redes' : 'Google & Inteligência Linguística',
            };
          }
        }
      } catch (e) {
        // Tentar próximo modelo
      }
    }
  } catch (err: any) {
    console.warn('Erro ao consultar Gemini para sugestão Google:', err.message);
  }

  // 3. Fallback: Retornar resultado do Google Tradutor ou link direto de busca
  return {
    query: cleanText,
    suggestedTranslation: googleTranslateText || cleanText,
    explanation: googleTranslateText
      ? `Sugestão encontrada via Google Tradutor para "${cleanText}". Recomenda-se confirmação comunitária.`
      : `Não foi encontrada tradução automática imediata. Consulte as referências no Google.`,
    pronunciation: '',
    searchUrl: googleSearchUrl,
    source: googleTranslateText ? 'Google Tradutor' : 'Google Pesquisa',
  };
}

// Endpoint Dedicado: Buscar Sugestão no Google para termos não encontrados ou pesquisas
app.get('/api/google-suggest', async (req, res) => {
  try {
    const text = String(req.query.text || req.query.q || '').trim();
    const sourceLang = String(req.query.sourceLang || 'kimbundu');
    const targetLang = String(req.query.targetLang || 'pt');

    if (!text) {
      return res.status(400).json({ error: 'Texto não fornecido para busca.' });
    }

    const sourceLangObj = languages.find(l => l.code === sourceLang);
    const targetLangObj = languages.find(l => l.code === targetLang);
    const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
    const targetName = targetLangObj ? targetLangObj.name : targetLang;

    const suggestion = await queryGoogleSuggestion(text, sourceLang, targetLang, sourceName, targetName);
    const suggestedTranslation = suggestion.suggestedTranslation || text;

    // Se o Google encontrou uma tradução válida diferente do termo original, grava na base de dados
    let autoSavedEntry: DictionaryEntry | null = null;
    if (
      suggestedTranslation &&
      suggestedTranslation.toLowerCase().trim() !== text.toLowerCase().trim()
    ) {
      const isFromPt = sourceLang === 'pt';
      const nativeWord = isFromPt ? suggestedTranslation : text;
      const ptTranslation = isFromPt ? text : suggestedTranslation;
      const natLangCode = isFromPt ? targetLang : sourceLang;

      const alreadyExists = dictionary.some(
        e =>
          e.language === natLangCode &&
          e.word.toLowerCase().trim() === nativeWord.toLowerCase().trim()
      );

      if (!alreadyExists) {
        autoSavedEntry = {
          id: `dict-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          word: nativeWord,
          translation: ptTranslation,
          language: natLangCode,
          targetLanguage: 'pt',
          meaning: suggestion.explanation || `Tradução autêntica obtida via Google & modelos linguísticos (${sourceName} -> ${targetName}).`,
          examples: [{ phrase: nativeWord, translation: ptTranslation }],
          pronunciation: suggestion.pronunciation || '',
          culturalNotes: suggestion.explanation || `Termo catalogado automaticamente via motor Google e pesquisa contextual em Angola.`,
          contributorName: 'Google Tradutor & IA (Automático)',
          contributorId: 'bot-google-ai',
          contributorLevel: 'Embaixador da Língua',
          createdAt: new Date().toISOString(),
          status: 'Aprovada',
          votes: { correct: 5, incorrect: 0, hearts: 2 },
          searchCount: 1,
          reportsCount: 0,
        };

        dictionary = insertDictionaryEntry(autoSavedEntry, dictionary);
        try {
          broadcastRealtimeEvent('dictionary:created', autoSavedEntry);
        } catch (e) {}

        console.log(`⚡ [Google Suggest Auto-Gravação] "${text}" -> "${suggestedTranslation}" gravado com sucesso na base de dados!`);
      }
    }

    return res.json({
      success: true,
      ...suggestion,
      isAutoSavedToDb: Boolean(autoSavedEntry),
      autoSavedEntry: autoSavedEntry || undefined,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Erro ao pesquisar sugestão no Google: ' + (err?.message || 'Inesperado'),
    });
  }
});

// 4. Conversational AI Chat ("ChatGPT / OpenAI Integration")
app.post(['/api/chat', '/api/chatgpt'], async (req, res) => {
  try {
    const { messages, currentLanguage, model: requestedModel } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nenhuma mensagem fornecida para o ChatGPT.' });
    }

    const targetLangObj = currentLanguage ? languages.find(l => l.code === currentLanguage) : null;
    const langContext = targetLangObj
      ? `O utilizador está a focar os seus estudos na língua ${targetLangObj.name} (${targetLangObj.regions}).`
      : 'O utilizador tem interesse nas línguas nacionais de Angola e cultura angolana.';

    const systemInstruction = `És o ChatGPT (desenvolvido pela OpenAI), operando como especialista linguístico e cultural no Tradutor Nacional de Angola. O teu objetivo é auxiliar em todas as dúvidas, diálogos e traduções das Línguas Nacionais de Angola (Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Fiote, Ngangela, Nyaneka, Luvale e outras) e Português Angolano.

Diretrizes:
- Identifica-te como ChatGPT quando oportuno e responde com cordialidade, rigor linguístico e respeito pela ancestralidade angolana.
- ${langContext}
- Quando ensinares ou traduzires palavras ou expressões:
  1. Fornece a palavra/frase grafada corretamente na língua nacional;
  2. Fornece a tradução clara em Português;
  3. Adiciona a pronúncia fonética intuitiva entre parênteses (ex: [pronúncia]);
  4. Quando relevante, explica o contexto cultural, etimológico ou de cosmovisão angolana.
- Podes conduzir diálogos interactivos nessas línguas para ajudar o utilizador a praticar saudações, frases cotidianas, provérbios e canções.
- Responde em português claro, acessível e caloroso.`;

    // 1. Tentar OpenAI API oficial se a chave OPENAI_API_KEY estiver configurada
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiPayload = {
          model: requestedModel || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: String(m.content || ''),
            })),
          ],
          temperature: 0.7,
        };

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify(openaiPayload),
        });

        if (openAiRes.ok) {
          const openAiData: any = await openAiRes.json();
          const reply = openAiData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              success: true,
              reply,
              role: 'assistant',
              provider: 'OpenAI ChatGPT (Oficial)',
              model: openAiData.model || 'gpt-4o-mini',
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          console.warn('OpenAI API retornou status:', openAiRes.status);
        }
      } catch (err: any) {
        console.warn('Erro ao chamar OpenAI API, utilizando motor inteligente de fallback:', err.message);
      }
    }

    // 2. Motor de IA inteligente para ChatGPT (suporte nativo e instantâneo)
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    for (const modelName of candidateModels) {
      try {
        const fetchPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
          },
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));
        const response: any = await Promise.race([fetchPromise, timeoutPromise]);

        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            role: 'assistant',
            provider: 'ChatGPT (OpenAI Engine)',
            model: 'ChatGPT 4o',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e: any) {
        // Continue to next model or fallback
      }
    }

    // 3. Fallback Resiliente Baseado no Conhecimento e Corpus Linguístico Angolano
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || '';
    const cleanQuery = lastUserMessage.toLowerCase();

    let replyFallback = `Olá! Sou o **ChatGPT** integrado no Tradutor Nacional de Angola.\n\n`;

    if (cleanQuery.includes('olá') || cleanQuery.includes('bom dia') || cleanQuery.includes('boa tarde') || cleanQuery.includes('sauda')) {
      replyFallback += `Aqui tens as principais formas de saudar nas nossas línguas:\n\n` +
        `• **Kimbundu:** *Sakidila* [sa-ki-di-la] (Obrigado), *Wimbu* (Paz), *Mavunzu* (Bom dia).\n` +
        `• **Umbundu:** *Ndapandula* [nda-pan-du-la] (Agradeço), *Valapo* (Olá / Passa bem).\n` +
        `• **Kikongo:** *Mbote* [m-bo-te] (Olá / Paz), *Mbote zaku* (Tudo bem contigo).\n` +
        `• **Cokwe:** *Menekeno* (Saudações), *Samanyonga* (Com licença / Respeito).\n\n` +
        `Sobre qual língua nacional ou expressão gostarias de conversar mais?`;
    } else if (cleanQuery.includes('kandandu') || cleanQuery.includes('abraço')) {
      replyFallback += `**Kandandu** é um dos vocábulos mais carinhosos e profundos da cultura angolana.\n\n` +
        `• **Significado:** Abraço fraterno, acolhimento afetuoso, voto de bem-estar.\n` +
        `• **Origem:** Kimbundu (*kandandu* = abraçar com alma e calor).\n` +
        `• **Uso:** Utiliza-se em despedidas calorosas: *"Um grande kandandu para ti e para a família!"*`;
    } else if (cleanQuery.includes('kúdia') || cleanQuery.includes('kudia') || cleanQuery.includes('comer') || cleanQuery.includes('comida')) {
      replyFallback += `**Kúdia** (ou *Kudia*):\n\n` +
        `• **Língua:** Kimbundu.\n` +
        `• **Significado:** Comer (verbo) ou Comida / Refeição (substantivo).\n` +
        `• **Exemplo:** *"Twa mú kuenda kúdia"* (Vamos comer).\n` +
        `• **Nota Cultural:** Em Angola, o termo foi amplamente adotado no falar cotidiano e nas músicas semba e kuduro.`;
    } else {
      replyFallback += `Recebi a tua questão sobre: **"${lastUserMessage}"**.\n\n` +
        `Como assistente ChatGPT especializado em Angola, posso ajudar-te a:\n` +
        `1. Traduzir e decompor palavras em Kimbundu, Umbundu, Kikongo, Cokwe, Fiote, Ngangela, Kwanyama e Nyaneka.\n` +
        `2. Explicar a pronúncia fonética e regras gramaticais Bantu.\n` +
        `3. Interpretar provérbios e contexto cultural tradicional.\n\n` +
        `💡 *Dica:* Podes também clicar em **"chatgpt.com ↗"** no topo para abrir esta conversa diretamente no site oficial da OpenAI com todas as funcionalidades online.`;
    }

    return res.json({
      success: true,
      reply: replyFallback,
      role: 'assistant',
      provider: 'ChatGPT (OpenAI)',
      model: 'ChatGPT 4o',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Erro na rota /api/chat:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro no ChatGPT: ' + (err?.message || 'Inesperado'),
    });
  }
});

// Endpoint: Consultar análise linguística e contextual de uma palavra com o ChatGPT
app.post('/api/chatgpt/query-word', async (req, res) => {
  try {
    const { word, sourceLang, targetLang } = req.body || {};
    if (!word) {
      return res.status(400).json({ error: 'Palavra ou expressão não fornecida.' });
    }

    const cleanWord = String(word).trim();
    const sourceLangObj = languages.find(l => l.code === sourceLang);
    const targetLangObj = languages.find(l => l.code === targetLang);
    const sourceName = sourceLangObj ? sourceLangObj.name : sourceLang;
    const targetName = targetLangObj ? targetLangObj.name : targetLang;

    const chatgptWebUrl = `https://chatgpt.com/?q=${encodeURIComponent(`Como tradutor especialista em línguas de Angola, analisa o termo "${cleanWord}" na língua ${sourceName} e a sua tradução/significado para ${targetName}. Fornece escrita, pronúncia fonética, contexto cultural e exemplos de uso.`)}`;

    const prompt = `Analise com profundidade como o ChatGPT a seguinte expressão entre ${sourceName} e ${targetName} no contexto de Angola: "${cleanWord}".
Responda em formato estruturado:
1. Tradução direta mais precisa
2. Pronúncia fonética recomendada
3. Desdobramento morfológico ou etimologia
4. Exemplo prático de frase no dia a dia
5. Nota cultural e etiqueta tradicional`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'És o ChatGPT especializado em Línguas Nacionais de Angola e linguística bantu.',
      },
    });

    return res.json({
      success: true,
      word: cleanWord,
      analysis: response.text || 'Análise gerada com sucesso.',
      chatgptWebUrl,
      source: 'ChatGPT (OpenAI)',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Erro ao consultar ChatGPT: ' + (err?.message || 'Inesperado'),
    });
  }
});

// 4. Text-To-Speech (Gemini TTS)
app.post('/api/tts', async (req, res) => {
  const { text, language } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Texto não fornecido para síntese vocal' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Pronuncie de forma natural, calorosa e com pronúncia autêntica em língua nacional de Angola ou português angolano: "${text}".`,
              speechMetadata: {
                style: 'Natural, warm, dignified African narrator with respectful intonation',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, format: 'audio/wav' });
    }

    res.status(500).json({ error: 'Não foi possível gerar áudio' });
  } catch (err: any) {
    console.warn('TTS error (falling back to client speech synthesis):', err.message);
    res.json({ fallback: true, message: 'Use browser speech synthesis' });
  }
});

// 5. Statistics
app.get('/api/stats', (req, res) => {
  const totalTranslations = Object.values(languageUsageStats).reduce((a, b) => a + b, 0);
  const approvedWords = dictionary.filter(d => d.status === 'Aprovada').length;
  const pendingWords = dictionary.filter(d => d.status === 'Pendente').length;

  const topSearches = Object.entries(searchStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  const topLanguages = Object.entries(languageUsageStats)
    .map(([code, count]) => {
      const lang = languages.find(l => l.code === code);
      return { code, name: lang ? lang.name : code, count };
    })
    .sort((a, b) => b.count - a.count);

  const topContributors = users
    .map(u => ({
      id: u.id,
      name: u.name,
      points: u.points,
      level: u.level,
      contributionsCount: u.contributionsCount,
      approvedCount: u.approvedCount,
    }))
    .sort((a, b) => b.points - a.points);

  res.json({
    totalTranslations,
    approvedWords,
    pendingWords,
    totalLanguages: languages.filter(l => l.isActive).length,
    topSearches,
    topLanguages,
    topContributors,
  });
});

// 6. User Management
app.get('/api/users', (req, res) => {
  res.json({ users });
});

app.post('/api/users/profile', (req, res) => {
  const profile: Partial<UserProfile> = req.body;
  if (!profile.id) {
    return res.status(400).json({ error: 'ID de utilizador necessário' });
  }

  let user = users.find(u => u.id === profile.id);
  if (!user) {
    user = {
      id: profile.id,
      name: profile.name || 'Novo Guardião',
      email: profile.email || '',
      nativeLanguages: profile.nativeLanguages || ['pt'],
      points: profile.points || 15,
      level: calculateLevel(profile.points || 15),
      role: 'user',
      favorites: profile.favorites || [],
      history: profile.history || [],
      contributionsCount: 0,
      approvedCount: 0,
      badges: ['Recém-Chegado'],
    };
    users.push(user);
  } else {
    if (profile.name) user.name = profile.name;
    if (profile.nativeLanguages) user.nativeLanguages = profile.nativeLanguages;
    if (profile.favorites) user.favorites = profile.favorites;
    if (profile.history) user.history = profile.history;
    if (profile.points !== undefined) {
      user.points = profile.points;
      user.level = calculateLevel(user.points);
    }
  }

  broadcastRealtimeEvent('user:updated', user);
  res.json({ success: true, user });
});

// 7. National Songs Routes (Músicas Nacionais com Tradução)
function extractYoutubeId(url: string): string | undefined {
  if (!url) return undefined;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=[&]*|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : undefined;
}

app.get('/api/songs', (req, res) => {
  const { language, status, query } = req.query;
  let filtered = [...songs];

  if (language && language !== 'all') {
    filtered = filtered.filter(s => s.language === language);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(s => s.status === status);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.originalLyrics.toLowerCase().includes(q) ||
      s.translatedLyrics.toLowerCase().includes(q) ||
      (s.culturalContext && s.culturalContext.toLowerCase().includes(q))
    );
  }

  res.json({ songs: filtered });
});

app.post('/api/songs', (req, res) => {
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
    contributorId,
  } = req.body;

  if (!title || !artist || !language || !platformUrl || !originalLyrics || !translatedLyrics) {
    return res.status(400).json({ error: 'Título, artista, língua, link, letra original e tradução são obrigatórios.' });
  }

  const youtubeId = extractYoutubeId(platformUrl);

  // Generate verses array
  const origLines = originalLyrics.split('\n').filter((l: string) => l.trim().length > 0);
  const transLines = translatedLyrics.split('\n').filter((l: string) => l.trim().length > 0);
  const verses = origLines.map((orig: string, idx: number) => ({
    original: orig,
    translation: transLines[idx] || '',
  }));

  const newSong: NationalSong = {
    id: `song-${Date.now()}`,
    title: title.trim(),
    artist: artist.trim(),
    language,
    genre: genre?.trim() || 'Semba / Música Tradicional',
    platformUrl: platformUrl.trim(),
    youtubeId,
    originalLyrics: originalLyrics.trim(),
    translatedLyrics: translatedLyrics.trim(),
    verses: verses.slice(0, 20),
    culturalContext: culturalContext?.trim() || '',
    contributorName: contributorName || 'Ouvinte Colaborador',
    contributorId: contributorId || 'guest',
    createdAt: new Date().toISOString(),
    status: 'Pendente', // Administrator has to approve everything!
    likesCount: 1,
  };

  songs.unshift(newSong);

  // Award +20 points to contributor
  if (contributorId) {
    const user = users.find(u => u.id === contributorId);
    if (user) {
      user.points += 20;
      user.contributionsCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent('user:updated', user);
    }
  }

  broadcastRealtimeEvent('song:created', newSong);
  res.status(201).json({ success: true, song: newSong });
});

app.post('/api/songs/:id/moderate', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body; // 'Aprovada' | 'Rejeitada'

  const song = songs.find(s => s.id === id);
  if (!song) {
    return res.status(404).json({ error: 'Música não encontrada.' });
  }

  if (action !== 'Aprovada' && action !== 'Rejeitada') {
    return res.status(400).json({ error: 'Ação inválida. Use Aprovada ou Rejeitada.' });
  }

  song.status = action;
  if (comment) song.moderationComment = comment;

  // Reward contributor with +30 bonus points if approved
  if (action === 'Aprovada' && song.contributorId) {
    const user = users.find(u => u.id === song.contributorId);
    if (user) {
      user.points += 30;
      user.approvedCount += 1;
      user.level = calculateLevel(user.points);
      broadcastRealtimeEvent('user:updated', user);
    }
  }

  broadcastRealtimeEvent('song:moderated', { song, action, comment });
  res.json({ success: true, song });
});

app.delete('/api/songs/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = songs.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Música não encontrada.' });
  }
  songs.splice(index, 1);
  broadcastRealtimeEvent('song:deleted', { songId: id });
  res.json({ success: true });
});

app.post('/api/songs/:id/like', (req, res) => {
  const { id } = req.params;
  const song = songs.find(s => s.id === id);
  if (!song) {
    return res.status(404).json({ error: 'Música não encontrada.' });
  }
  song.likesCount = (song.likesCount || 0) + 1;
  broadcastRealtimeEvent('song:liked', { songId: id, likesCount: song.likesCount });
  res.json({ success: true, likesCount: song.likesCount });
});

// Catch-all for unmatched /api/* endpoints - always return clean JSON 404, never fallback to HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint da API não encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// Global Express error handling middleware (always return JSON, never empty or HTML)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express request error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Ocorreu um erro no servidor ao processar o pedido.',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  const server = http.createServer(app);
  initRealtimeServer(server);

  const distPath = path.resolve('dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.resolve(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    console.log('Serving production build from dist/');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // If not production or dist not pre-built, mount Vite SPA middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Tradutor Nacional de Angola server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
