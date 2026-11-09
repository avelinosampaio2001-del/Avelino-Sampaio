import fs from 'fs';
import path from 'path';
import { NationalLanguage } from '../types';
import { INITIAL_LANGUAGES } from '../data/seedData';

const DB_DIR = path.resolve(process.cwd(), 'data');
const LANG_DB_FILE = path.join(DB_DIR, 'languages_db.json');

function ensureDbDir(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

/**
 * Loads all national languages from persistent storage.
 * Bootstraps with INITIAL_LANGUAGES if not found.
 */
export function loadLanguagesDb(): NationalLanguage[] {
  try {
    ensureDbDir();
    if (!fs.existsSync(LANG_DB_FILE)) {
      saveLanguagesDb(INITIAL_LANGUAGES);
      return [...INITIAL_LANGUAGES];
    }
    const raw = fs.readFileSync(LANG_DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveLanguagesDb(INITIAL_LANGUAGES);
    return [...INITIAL_LANGUAGES];
  } catch (err) {
    console.error('Erro ao ler languages_db.json:', err);
    return [...INITIAL_LANGUAGES];
  }
}

/**
 * Saves languages atomically to disk.
 */
export function saveLanguagesDb(languages: NationalLanguage[]): void {
  try {
    ensureDbDir();
    const tempFile = `${LANG_DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(languages, null, 2), 'utf-8');
    fs.renameSync(tempFile, LANG_DB_FILE);
  } catch (err) {
    console.error('Erro ao salvar languages_db.json:', err);
  }
}

/**
 * Inserts or updates a language and persists to database.
 */
export function insertLanguage(newLang: NationalLanguage, currentLanguages: NationalLanguage[]): NationalLanguage[] {
  const existingIdx = currentLanguages.findIndex(l => l.code.toLowerCase() === newLang.code.toLowerCase());
  let updated: NationalLanguage[];
  if (existingIdx >= 0) {
    updated = [...currentLanguages];
    updated[existingIdx] = { ...updated[existingIdx], ...newLang };
  } else {
    updated = [...currentLanguages, newLang];
  }
  saveLanguagesDb(updated);
  return updated;
}

/**
 * Toggles language active status and persists.
 */
export function toggleLanguageStatus(code: string, currentLanguages: NationalLanguage[]): { updated: NationalLanguage[]; lang?: NationalLanguage } {
  const updated = currentLanguages.map(l => {
    if (l.code.toLowerCase() === code.toLowerCase()) {
      return { ...l, isActive: !l.isActive };
    }
    return l;
  });
  saveLanguagesDb(updated);
  const lang = updated.find(l => l.code.toLowerCase() === code.toLowerCase());
  return { updated, lang };
}
