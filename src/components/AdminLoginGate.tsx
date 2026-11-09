import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Database, 
  Cpu, 
  ShieldAlert,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';

interface AdminLoginGateProps {
  onLoginSuccess: (token: string) => void;
  onCancel?: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);
  const [securityInfo, setSecurityInfo] = useState<any>(null);

  // Fetch security metadata from database endpoint on mount
  useEffect(() => {
    fetch('/api/admin/security-info')
      .then(res => res.json())
      .then(data => {
        setSecurityInfo(data);
        if (data.isLocked) {
          setIsLocked(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Por favor, introduza a senha de administrador.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.locked) {
          setIsLocked(true);
          setLockoutMinutes(data.remainingMinutes || 15);
        }
        setErrorMessage(data.error || 'Credenciais inválidas. Acesso recusado.');
        return;
      }

      // Success
      if (data.token) {
        sessionStorage.setItem('tna_admin_token', data.token);
        onLoginSuccess(data.token);
      }
    } catch (err: any) {
      setErrorMessage('Erro de comunicação com o servidor de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 text-left">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 border-b border-stone-800 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-red-600/10 pointer-events-none blur-2xl" />
          <div className="absolute right-12 top-6 w-20 h-20 rounded-full bg-amber-400/10 pointer-events-none blur-xl" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold tracking-wide uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Acesso Restrito · Instituto de Línguas Nacionais</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-white tracking-tight">
              Painel Administrativo
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Autentique-se com a sua credencial mestra para moderar conteúdos, gerir línguas nacionais e validar o repositório.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Database & Cryptography Protection Badge */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Proteção Criptográfica na Base de Dados</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hash PBKDF2-SHA512 (100k ciclos)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Salt criptográfico de 256 bits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Anti-Brute Force (5 tentativas máx)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                <span>Armazenada em <code className="font-mono text-stone-800">/data/security_db.json</code></span>
              </div>
            </div>
          </div>

          {/* Error / Lockout Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block font-semibold">Falha de Autenticação:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Senha de Administrador
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isLocked}
                  placeholder="Introduza a senha de administrador..."
                  className="w-full pl-10 pr-11 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all font-mono disabled:opacity-50"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked || !password.trim()}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md hover:shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A validar criptografia na base de dados...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Desbloquear Painel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Initial credentials hint for owner / administrator */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-amber-950">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Credenciais Iniciais Configuradas na Base de Dados:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Senha padrão inicial na base de dados: <code className="bg-amber-100/80 px-2 py-0.5 rounded font-mono font-bold text-amber-950">Angola@2026#Admin</code>
            </p>
            <p className="text-[11px] text-stone-500">
              * Por segurança, pode alterar esta senha para uma nova personalizada a qualquer momento no interior do painel após o login.
            </p>
          </div>

          {onCancel && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
              >
                Voltar à página inicial
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
