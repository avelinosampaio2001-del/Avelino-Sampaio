import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'security_db.json');

export interface AdminSecurityRecord {
  username: string;
  salt: string;
  hash: string;
  iterations: number;
  digest: string;
  role: string;
  updatedAt: string;
  failedAttempts: number;
  lockoutUntil: number | null;
}

export interface SecurityDatabase {
  admin: AdminSecurityRecord;
  sessions: Record<string, {
    username: string;
    createdAt: number;
    expiresAt: number;
  }>;
}

// Initial fallback seed (Password: Angola@2026#Admin)
const INITIAL_SALT = 'a8f3b2075c1209eb47c94ef35b87192ad41c48e8a60965d13b482e9871032c54';
const INITIAL_HASH = '7cb83615d7ecc9212fe962a572e97ca9d91e10063296e5afe0e39a148cab348ad62b2f941f656c5a2ec5bcaa4379dc48a9ad297ffc86745006708888be9b7c29';

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const generatedSalt = salt || crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512');
  return {
    salt: generatedSalt,
    hash: derivedKey.toString('hex'),
  };
}

export function timingSafeVerify(password: string, salt: string, storedHash: string): boolean {
  try {
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    const derivedHash = derivedKey.toString('hex');
    const bufA = Buffer.from(derivedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

export function readSecurityDb(): SecurityDatabase {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: SecurityDatabase = {
        admin: {
          username: 'admin',
          salt: INITIAL_SALT,
          hash: INITIAL_HASH,
          iterations: 100000,
          digest: 'sha512',
          role: 'superadmin',
          updatedAt: new Date().toISOString(),
          failedAttempts: 0,
          lockoutUntil: null,
        },
        sessions: {},
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: SecurityDatabase = JSON.parse(content);
    if (!parsed.admin || !parsed.admin.hash) {
      throw new Error('Database schema invalid');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading security database file, creating safe fallback:', err);
    const fallbackDb: SecurityDatabase = {
      admin: {
        username: 'admin',
        salt: INITIAL_SALT,
        hash: INITIAL_HASH,
        iterations: 100000,
        digest: 'sha512',
        role: 'superadmin',
        updatedAt: new Date().toISOString(),
        failedAttempts: 0,
        lockoutUntil: null,
      },
      sessions: {},
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(fallbackDb, null, 2), 'utf-8');
    } catch (e) {}
    return fallbackDb;
  }
}

export function writeSecurityDb(db: SecurityDatabase): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write security database to file:', err);
  }
}

export function verifyAdminLogin(password: string): {
  success: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
  locked?: boolean;
  remainingMinutes?: number;
  remainingAttempts?: number;
} {
  const db = readSecurityDb();
  const now = Date.now();

  // 1. Check if locked out
  if (db.admin.lockoutUntil && db.admin.lockoutUntil > now) {
    const diffMs = db.admin.lockoutUntil - now;
    const remainingMinutes = Math.ceil(diffMs / (60 * 1000));
    return {
      success: false,
      locked: true,
      remainingMinutes,
      error: `Painel administrativo temporariamente bloqueado por motivos de segurança. Tente novamente em ${remainingMinutes} minuto(s).`,
    };
  }

  // 2. Verify password with PBKDF2 SHA-512 timing-safe comparison
  const isValid = timingSafeVerify(password, db.admin.salt, db.admin.hash);

  if (!isValid) {
    db.admin.failedAttempts = (db.admin.failedAttempts || 0) + 1;
    const maxAttempts = 5;

    if (db.admin.failedAttempts >= maxAttempts) {
      db.admin.lockoutUntil = now + 15 * 60 * 1000; // 15 minutes lockout
      writeSecurityDb(db);
      return {
        success: false,
        locked: true,
        remainingMinutes: 15,
        error: 'Limite de tentativas excedido (5 tentativas falhadas). O painel foi bloqueado por 15 minutos.',
      };
    }

    const remaining = maxAttempts - db.admin.failedAttempts;
    writeSecurityDb(db);
    return {
      success: false,
      remainingAttempts: remaining,
      error: `Senha incorreta. Restam ${remaining} tentativa(s) antes do bloqueio temporário.`,
    };
  }

  // 3. Reset failed attempts upon successful login
  db.admin.failedAttempts = 0;
  db.admin.lockoutUntil = null;

  // 4. Generate high-entropy session token (256-bit)
  const token = crypto.randomBytes(32).toString('hex');
  const sessionDurationMs = 8 * 60 * 60 * 1000; // 8 hours
  const expiresAt = now + sessionDurationMs;

  // Clean expired sessions
  for (const [sToken, sData] of Object.entries(db.sessions)) {
    if (sData.expiresAt < now) {
      delete db.sessions[sToken];
    }
  }

  db.sessions[token] = {
    username: db.admin.username,
    createdAt: now,
    expiresAt,
  };

  writeSecurityDb(db);

  return {
    success: true,
    token,
    expiresAt,
  };
}

export function validateSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const db = readSecurityDb();
  const session = db.sessions[token];
  if (!session) return false;

  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    writeSecurityDb(db);
    return false;
  }

  return true;
}

export function revokeSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const db = readSecurityDb();
  if (db.sessions[token]) {
    delete db.sessions[token];
    writeSecurityDb(db);
    return true;
  }
  return false;
}

export function changeAdminPassword(currentPass: string, newPass: string): {
  success: boolean;
  error?: string;
  message?: string;
} {
  if (!newPass || newPass.length < 8) {
    return {
      success: false,
      error: 'A nova senha deve ter no mínimo 8 caracteres, com letras, números ou caracteres especiais.',
    };
  }

  const db = readSecurityDb();
  const isCurrentValid = timingSafeVerify(currentPass, db.admin.salt, db.admin.hash);

  if (!isCurrentValid) {
    return {
      success: false,
      error: 'A senha atual informada está incorreta.',
    };
  }

  // Generate new cryptographically secure salt and 100k iteration hash
  const { salt, hash } = hashPassword(newPass);
  db.admin.salt = salt;
  db.admin.hash = hash;
  db.admin.updatedAt = new Date().toISOString();
  db.admin.failedAttempts = 0;
  db.admin.lockoutUntil = null;

  // Invalidate previous sessions for safety
  db.sessions = {};

  writeSecurityDb(db);

  return {
    success: true,
    message: 'Senha do painel administrativo atualizada com sucesso na base de dados com criptografia PBKDF2.',
  };
}

// Middleware to protect admin routes
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token || !validateSessionToken(token)) {
    return res.status(401).json({
      error: 'Acesso restrito ao Painel Administrativo. Autenticação necessária.',
      code: 'UNAUTHORIZED_ADMIN',
    });
  }

  next();
}
