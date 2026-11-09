export interface NationalLanguage {
  code: string;
  name: string;
  nativeName?: string;
  regions: string;
  speakersEstimated?: string;
  family: string;
  flagEmblem?: string;
  description: string;
  isActive: boolean;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  translation: string;
  language: string; // e.g., 'kimbundu'
  targetLanguage: string; // e.g., 'pt'
  meaning: string;
  examples: Array<{
    phrase: string;
    translation: string;
  }>;
  pronunciation: string;
  category?: string;
  audioUrl?: string;
  audioData?: string; // base64 if recorded
  culturalNotes?: string;
  contributorName: string;
  contributorId?: string;
  contributorLevel?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
  votes: {
    correct: number;
    incorrect: number;
    hearts: number;
  };
  userVotes?: Record<string, 'correct' | 'incorrect' | 'heart'>;
  searchCount: number;
  reportsCount: number;
  moderationComment?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  nativeLanguages: string[];
  points: number;
  level: 'Colaborador' | 'Tradutor' | 'Embaixador da Língua';
  role: 'user' | 'admin';
  favorites: string[]; // dictionary ids or translations
  history: Array<{
    id: string;
    sourceText: string;
    sourceLang: string;
    targetText: string;
    targetLang: string;
    timestamp: string;
    phonetic?: string;
    isAi: boolean;
  }>;
  contributionsCount: number;
  approvedCount: number;
  badges: string[];
}

export interface TranslationResult {
  sourceText: string;
  sourceLang: string;
  targetText: string;
  targetLang: string;
  pronunciation?: string;
  culturalNote?: string;
  breakdown?: Array<{ term: string; meaning: string }>;
  isConfident: boolean;
  isAi: boolean;
  dictionaryMatch?: DictionaryEntry;
  suggestImprovementNeeded: boolean;
  isGoogleSuggestion?: boolean;
  isAutoSavedToDb?: boolean;
  autoSavedEntryId?: string;
  googleSuggestion?: {
    text: string;
    source: string;
    searchUrl: string;
    explanation?: string;
  };
}

export interface NationalSong {
  id: string;
  title: string;
  artist: string;
  language: string;
  genre: string;
  platformUrl: string;
  youtubeId?: string;
  originalLyrics: string;
  translatedLyrics: string;
  verses?: Array<{ original: string; translation: string }>;
  culturalContext?: string;
  contributorName: string;
  contributorId?: string;
  createdAt: string;
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
  likesCount: number;
  moderationComment?: string;
}

export type RealtimeEventType = 
  | 'init'
  | 'presence:update'
  | 'dictionary:created'
  | 'dictionary:moderated'
  | 'dictionary:voted'
  | 'dictionary:reported'
  | 'song:created'
  | 'song:moderated'
  | 'song:deleted'
  | 'song:liked'
  | 'language:created'
  | 'language:updated'
  | 'stats:updated'
  | 'user:updated'
  | 'ad:updated'
  | 'ad:deleted';

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: number;
}

export type AdPlacement = 
  | 'top_leaderboard' 
  | 'native_feed' 
  | 'bottom_bar' 
  | 'translator_box' 
  | 'sidebar_left' 
  | 'sidebar_right' 
  | 'sidebar_both';

export interface AdBanner {
  id: string;
  title: string;
  sponsorName: string;
  description: string;
  badgeText?: string;
  ctaText: string;
  targetUrl: string;
  imageUrl?: string;
  placement: AdPlacement;
  isActive: boolean;
  impressionsCount: number;
  clicksCount: number;
  category?: string;
  isAdSense?: boolean;
  adsenseSlotId?: string;
  rotationWeight?: number;
}

export interface MonetizationSettings {
  adsenseEnabled: boolean;
  adsensePublisherId: string;
  customBannersEnabled: boolean;
  sidebarAdsEnabled: boolean;
  sidebarRotationInterval: number; // segundos de transição automática
  sidebarLeftActive: boolean;
  sidebarRightActive: boolean;
  multicaixaDonationsEnabled: boolean;
  multicaixaNumber?: string;
  multicaixaEntity?: string;
}

