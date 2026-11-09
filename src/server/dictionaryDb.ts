import fs from 'fs';
import path from 'path';
import { DictionaryEntry } from '../types';
import { INITIAL_DICTIONARY_ENTRIES } from '../data/seedData';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DICT_DB_FILE = path.join(DB_DIR, 'dictionary_db.json');

// Ensure database directory exists
function ensureDbDir(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

/**
 * Loads all dictionary entries from the persistent JSON database.
 * If the database file does not exist, it bootstraps with INITIAL_DICTIONARY_ENTRIES.
 */
export function loadDictionaryDb(): DictionaryEntry[] {
  try {
    ensureDbDir();
    if (!fs.existsSync(DICT_DB_FILE)) {
      console.log('📦 Inicializando base de dados de vocábulos com sementes padrão...');
      saveDictionaryDb(INITIAL_DICTIONARY_ENTRIES);
      return [...INITIAL_DICTIONARY_ENTRIES];
    }

    const raw = fs.readFileSync(DICT_DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Fallback if empty array
    saveDictionaryDb(INITIAL_DICTIONARY_ENTRIES);
    return [...INITIAL_DICTIONARY_ENTRIES];
  } catch (err) {
    console.error('Erro ao ler dictionary_db.json:', err);
    return [...INITIAL_DICTIONARY_ENTRIES];
  }
}

/**
 * Writes the entire dictionary to disk atomically to prevent corruption.
 */
export function saveDictionaryDb(entries: DictionaryEntry[]): void {
  try {
    ensureDbDir();
    const tempFile = `${DICT_DB_FILE}.tmp`;
    const serialized = JSON.stringify(entries, null, 2);
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DICT_DB_FILE);
  } catch (err) {
    console.error('Erro ao salvar dictionary_db.json:', err);
  }
}

/**
 * Inserts or prepends a single dictionary entry and persists it.
 */
export function insertDictionaryEntry(newEntry: DictionaryEntry, currentEntries: DictionaryEntry[]): DictionaryEntry[] {
  const updated = [newEntry, ...currentEntries.filter(e => e.id !== newEntry.id)];
  saveDictionaryDb(updated);
  return updated;
}

/**
 * Inserts a batch of dictionary entries (e.g. from Excel or CSV import).
 * Deduplicates by word + language.
 */
export function insertDictionaryBatch(
  newEntries: Partial<DictionaryEntry>[],
  currentEntries: DictionaryEntry[],
  defaultStatus: 'Aprovada' | 'Pendente' = 'Aprovada',
  contributorName: string = 'Administrador (Importação em Lote)'
): { updatedList: DictionaryEntry[]; addedEntries: DictionaryEntry[]; skippedCount: number } {
  const existingKeys = new Set(
    currentEntries.map(e => `${e.word.toLowerCase().trim()}_${e.language.toLowerCase().trim()}`)
  );

  const addedEntries: DictionaryEntry[] = [];
  let skippedCount = 0;

  for (const raw of newEntries) {
    const word = String(raw.word || '').trim();
    const translation = String(raw.translation || '').trim();
    const language = String(raw.language || 'kimbundu').toLowerCase().trim();

    if (!word || !translation) {
      skippedCount++;
      continue;
    }

    const key = `${word.toLowerCase()}_${language}`;
    if (existingKeys.has(key)) {
      skippedCount++;
      continue;
    }

    existingKeys.add(key);

    const entry: DictionaryEntry = {
      id: raw.id || `dict-batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word,
      translation,
      language,
      targetLanguage: raw.targetLanguage || 'pt',
      meaning: String(raw.meaning || translation || 'Registado via importação de acervo.').trim(),
      examples: Array.isArray(raw.examples) ? raw.examples : (raw.examples ? [raw.examples as any] : []),
      pronunciation: String(raw.pronunciation || '').trim(),
      audioUrl: raw.audioUrl,
      audioData: raw.audioData,
      culturalNotes: String(raw.culturalNotes || '').trim(),
      contributorName: raw.contributorName || contributorName,
      contributorId: raw.contributorId || 'usr-admin',
      contributorLevel: (raw.contributorLevel as any) || 'Embaixador da Língua',
      createdAt: raw.createdAt || new Date().toISOString(),
      status: (raw.status as any) || defaultStatus,
      votes: raw.votes || { correct: 5, incorrect: 0, hearts: 3 },
      searchCount: 0,
      reportsCount: 0,
    };

    addedEntries.push(entry);
  }

  const updatedList = [...addedEntries, ...currentEntries];
  saveDictionaryDb(updatedList);

  return {
    updatedList,
    addedEntries,
    skippedCount,
  };
}
