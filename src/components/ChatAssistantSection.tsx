import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  Volume2, 
  Copy, 
  Check, 
  Loader2, 
  Mic, 
  MicOff, 
  ExternalLink,
  Globe,
  Share2,
  Lightbulb
} from 'lucide-react';
import { NationalLanguage, UserProfile } from '../types';
import { speakTextWithWebSpeech } from '../utils/audio';

// Official OpenAI ChatGPT Logo SVG
export const OpenAILogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4021-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.1416-1.5244l2.552-1.4722 2.552 1.4722v2.9444l-2.552 1.4722-2.552-1.4722z"/>
  </svg>
);

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  model?: string;
  timestamp: string;
}

interface ChatAssistantSectionProps {
  languages: NationalLanguage[];
  user: UserProfile;
  onStartTranslating?: (word: string, sourceLang: string, targetLang: string) => void;
}

export const ChatAssistantSection: React.FC<ChatAssistantSectionProps> = ({
  languages,
  user,
  onStartTranslating,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-chatgpt-1',
    role: 'assistant',
    provider: 'OpenAI ChatGPT',
    model: 'ChatGPT 4o',
    content: `Olá, **${user.name}**! 👋 Sou o **ChatGPT**, integrado diretamente no **Tradutor Nacional de Angola**.

Estou configurado como o teu parceiro de inteligência artificial da OpenAI especializado nas **Línguas Nacionais e Cultura de Angola** (Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Fiote, Ngangela, Nyaneka e Luvale).

**Podes interagir comigo para:**
• **Traduções e Análise Linguística**: desdobramento de frases, tempos verbais e concordância Bantu.
• **Prática de Diálogos**: simulação de conversas bilaterais para aprenderes a falar com fluência.
• **Provérbios & Tradições**: significado cultural, cosmovisão e sabedoria ancestral.
• **Redação & Criação**: compor textos, saudações formais ou discursos nas nossas línguas.

Como posso ajudar o teu estudo ou tradução hoje?`,
    timestamp: new Date().toISOString(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ao_chatgpt_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [initialWelcomeMessage];
  });

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ao_chatgpt_history', JSON.stringify(messages.slice(-30)));
    } catch (e) {}
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Saudações em Kimbundu', prompt: 'ChatGPT, ensina-me as saudações essenciais em Kimbundu com escrita correta e pronúncia fonética.' },
    { label: 'Diálogo em Umbundu', prompt: 'ChatGPT, simula um diálogo de apresentação em Umbundu entre duas pessoas com tradução em português.' },
    { label: 'Análise de "Kandandu"', prompt: 'ChatGPT, explica a origem e o significado cultural da palavra "Kandandu" em Angola.' },
    { label: 'Provérbios em Kikongo', prompt: 'ChatGPT, apresenta 3 provérbios tradicionais em Kikongo, as suas traduções e o ensinamento moral.' },
    { label: 'Gramática do Cokwe', prompt: 'ChatGPT, como funcionam os prefixos nominais e a concordância na língua Cokwe?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payloadMessages = newHistory.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          currentLanguage: selectedLanguage !== 'all' ? selectedLanguage : undefined,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: Não foi possível conectar ao ChatGPT`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Peço desculpa, o ChatGPT não conseguiu gerar a resposta. Tente novamente.',
        provider: data.provider || 'ChatGPT',
        model: data.model || selectedModel,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erro no ChatGPT:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        provider: 'ChatGPT',
        content: `Ocorreu um erro na ligação ao ChatGPT: ${err?.message || 'Por favor tente novamente.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Deseja reiniciar a conversa no ChatGPT?')) {
      setMessages([initialWelcomeMessage]);
      localStorage.removeItem('ao_chatgpt_history');
    }
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = async (msg: ChatMessage) => {
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(msg.id);
    const cleanText = msg.content
      .replace(/[*_#`[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      await speakTextWithWebSpeech(cleanText);
    } catch (e) {
      console.warn('Speech error:', e);
    } finally {
      setSpeakingId(null);
    }
  };

  // Open conversation on official ChatGPT web (chatgpt.com)
  const handleOpenInChatGPTWeb = (customText?: string) => {
    const lastUserMsg = customText || messages.filter(m => m.role === 'user').slice(-1)[0]?.content || 'Ajuda-me a traduzir e praticar línguas nacionais de Angola';
    const url = `https://chatgpt.com/?q=${encodeURIComponent(lastUserMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('O seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-AO';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      {/* Official OpenAI ChatGPT Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#0b1320] to-[#0f172a] text-white rounded-2xl p-5 border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#10a37f] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/40 shrink-0">
            <OpenAILogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                ChatGPT
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                OpenAI Integrado
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                {selectedModel.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Interação direta com o ChatGPT para análise linguística, gramática e conversação em Angola.
            </p>
          </div>
        </div>

        {/* Header Controls: Model, Language, ChatGPT.com, Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Target Language Focus */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-stone-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-stone-900 text-white">Todas as Línguas</option>
              {languages.filter(l => l.code !== 'pt' && l.isActive).map(l => (
                <option key={l.code} value={l.code} className="bg-stone-900 text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-stone-300">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-mono"
            >
              <option value="gpt-4o" className="bg-stone-900 text-white">GPT-4o</option>
              <option value="gpt-4o-mini" className="bg-stone-900 text-white">GPT-4o mini</option>
            </select>
          </div>

          {/* Direct link to official chatgpt.com */}
          <button
            onClick={() => handleOpenInChatGPTWeb()}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Abrir no site oficial do ChatGPT (chatgpt.com)"
          >
            <OpenAILogo className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">chatgpt.com</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors border border-stone-800"
            title="Limpar e reiniciar conversa no ChatGPT"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main ChatGPT Interface Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[620px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-left ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center shrink-0 shadow-xs border border-emerald-300/40 mt-1">
                    <OpenAILogo className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-2xs ${
                      isUser
                        ? 'bg-stone-900 text-stone-100 rounded-tr-xs'
                        : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Actions under Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 pl-1 flex-wrap">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                        {msg.model || 'ChatGPT'}
                      </span>

                      <span>·</span>

                      <button
                        onClick={() => handleSpeakMessage(msg)}
                        className="hover:text-stone-700 flex items-center gap-1 transition-colors"
                        title="Ouvir áudio com pronúncia"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${speakingId === msg.id ? 'text-emerald-600 animate-pulse' : ''}`} />
                        <span>{speakingId === msg.id ? 'Ouvindo...' : 'Ouvir'}</span>
                      </button>

                      <span>·</span>

                      <button
                        onClick={() => handleCopyMessage(msg)}
                        className="hover:text-stone-700 flex items-center gap-1 transition-colors"
                        title="Copiar resposta do ChatGPT"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      <span>·</span>

                      <button
                        onClick={() => handleOpenInChatGPTWeb(msg.content)}
                        className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                        title="Continuar esta pergunta no chatgpt.com"
                      >
                        <span>Abrir no chatgpt.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-left justify-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#10a37f] text-white flex items-center justify-center shrink-0 shadow-xs">
                <OpenAILogo className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-stone-600 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>O ChatGPT está a processar os dados linguísticos...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 3 && (
          <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-stone-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 text-[10px] pl-1">
              <Lightbulb className="w-3 h-3 text-emerald-500" />
              Perguntas sugeridas ao ChatGPT:
            </span>
            {quickPrompts.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip.prompt)}
                className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 text-stone-700 rounded-lg whitespace-nowrap transition-colors shrink-0 border border-stone-200/70"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-end gap-2">
          <div className="flex-1 bg-stone-50 border border-stone-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl p-2 transition-all flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao ChatGPT sobre qualquer palavra, gramática, provérbio ou tradução..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none max-h-32 py-1 scrollbar-thin"
            />

            <button
              onClick={toggleSpeechRecognition}
              className={`p-1.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200'
              }`}
              title="Falar por voz"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-[#10a37f] hover:bg-[#0e8e6e] disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Enviar mensagem ao ChatGPT"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
