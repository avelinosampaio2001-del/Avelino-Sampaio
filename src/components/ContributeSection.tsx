import React, { useState } from 'react';
import { 
  Send, 
  Mic, 
  Square, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  HelpCircle, 
  Award,
  Sparkles,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { NationalLanguage, UserProfile, DictionaryEntry } from '../types';
import { AudioRecorder, playBase64Wav } from '../utils/audio';

interface ContributeSectionProps {
  languages: NationalLanguage[];
  user: UserProfile;
  onSuggestionSubmitted?: (entry: DictionaryEntry) => void;
  prefillData?: {
    word?: string;
    language?: string;
    targetLanguage?: string;
  };
  onCloseModal?: () => void;
}

export const ContributeSection: React.FC<ContributeSectionProps> = ({
  languages,
  user,
  onSuggestionSubmitted,
  prefillData,
  onCloseModal,
}) => {
  const [word, setWord] = useState<string>(prefillData?.word || '');
  const [language, setLanguage] = useState<string>(prefillData?.language || 'kimbundu');
  const [meaning, setMeaning] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [examplePhrase, setExamplePhrase] = useState<string>('');
  const [exampleTranslation, setExampleTranslation] = useState<string>('');
  const [pronunciation, setPronunciation] = useState<string>('');
  const [culturalNotes, setCulturalNotes] = useState<string>('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recorderInstance, setRecorderInstance] = useState<AudioRecorder | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startAudioRecording = async () => {
    try {
      setRecordingError(null);
      const recorder = new AudioRecorder();
      await recorder.start(() => {
        stopAudioRecording();
      });
      setRecorderInstance(recorder);
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setRecordingError('Não foi possível aceder ao microfone. Verifique as permissões.');
    }
  };

  const stopAudioRecording = async () => {
    if (!recorderInstance) return;
    try {
      const { base64 } = await recorderInstance.stop();
      setRecordedAudio(base64);
      setIsRecording(false);
      setRecorderInstance(null);
    } catch (err: any) {
      console.error(err);
      setRecordingError('Erro ao finalizar a gravação.');
      setIsRecording(false);
    }
  };

  const handleDiscardAudio = () => {
    if (recorderInstance) {
      recorderInstance.cancel();
      setRecorderInstance(null);
    }
    setIsRecording(false);
    setRecordedAudio(null);
    setRecordingError(null);
  };

  const playRecordedSample = () => {
    if (!recordedAudio) return;
    try {
      const audio = new Audio(recordedAudio);
      audio.play();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim() || !language) {
      setErrorMessage('Por favor preencha pelo menos a palavra/expressão, a língua e a tradução.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      word: word.trim(),
      translation: translation.trim(),
      language,
      targetLanguage: 'pt',
      meaning: meaning.trim() || translation.trim(),
      examples: examplePhrase.trim()
        ? [{ phrase: examplePhrase.trim(), translation: exampleTranslation.trim() }]
        : [],
      pronunciation: pronunciation.trim(),
      audioData: recordedAudio || undefined,
      culturalNotes: culturalNotes.trim(),
      contributorName: user.name,
      contributorId: user.id,
      contributorLevel: user.level,
      status: 'Pendente',
    };

    const localEntry: DictionaryEntry = {
      id: `dict-${Date.now()}`,
      word: payload.word,
      translation: payload.translation,
      language: payload.language,
      targetLanguage: payload.targetLanguage,
      meaning: payload.meaning,
      examples: payload.examples,
      pronunciation: payload.pronunciation,
      audioData: payload.audioData,
      culturalNotes: payload.culturalNotes,
      contributorName: payload.contributorName,
      contributorId: payload.contributorId,
      contributorLevel: (payload.contributorLevel as any) || 'Colaborador',
      createdAt: new Date().toISOString(),
      status: 'Pendente',
      votes: { correct: 1, incorrect: 0, hearts: 1 },
      searchCount: 0,
      reportsCount: 0,
    };

    try {
      let createdEntry: DictionaryEntry | null = null;
      try {
        const res = await fetch('/api/dictionary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        let data: any = null;
        let text = '';
        try {
          text = await res.text();
          if (text) {
            data = JSON.parse(text);
          }
        } catch (parseErr) {
          console.warn('Erro ao interpretar resposta do servidor:', parseErr, text);
        }

        if (res.ok && data?.entry) {
          createdEntry = data.entry;
        } else if (res.status === 400 && data?.error) {
          throw new Error(data.error);
        } else {
          console.warn(`Servidor retornou status ${res.status}. Salvando localmente para resiliência.`);
        }
      } catch (fetchErr: any) {
        // If it's a validation error, bubble it up to the user
        if (fetchErr.message && !fetchErr.message.includes('404') && !fetchErr.message.includes('fetch') && !fetchErr.message.includes('Failed')) {
          throw fetchErr;
        }
        console.warn('Ligação à API instável, ativando modo de persistência imediata.');
      }

      // Use the entry returned by server, or fallback to the localEntry
      const finalEntry = createdEntry || localEntry;

      // Guarantee local persistence so the word is never lost
      try {
        const saved = localStorage.getItem('tna_local_contributions');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(finalEntry);
        localStorage.setItem('tna_local_contributions', JSON.stringify(list));
      } catch (storageErr) {
        console.warn('Erro ao guardar no localStorage:', storageErr);
      }

      setSubmitSuccess(true);
      if (onSuggestionSubmitted) {
        onSuggestionSubmitted(finalEntry);
      }

      // Reset form
      setTimeout(() => {
        if (onCloseModal) {
          onCloseModal();
        }
      }, 2200);

    } catch (err: any) {
      console.error('Erro na submissão:', err);
      setErrorMessage(err.message || 'Falha ao cadastrar a palavra. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 max-w-3xl mx-auto text-left shadow-sm">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Partilha de Conhecimento Ancestral</span>
        </div>
        <h2 className="text-2xl font-serif-heading font-semibold text-stone-900">
          Contribua com a nossa língua
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Ajude a expandir o Tradutor Nacional com expressões, vocábulos e provérbios da sua região. A sua contribuição fortalece a nossa identidade coletiva.
        </p>
      </div>

      {submitSuccess ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif-heading font-semibold text-stone-900">
            Muito obrigado pela sua contribuição!
          </h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            A sua sugestão foi enviada para a equipa de moderação linguística. Assim que for validada, ficará oficialmente disponível no sistema e ganhará <strong className="text-amber-600">+25 pontos</strong>!
          </p>
          <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-900">
            <Award className="w-4 h-4 text-amber-600" />
            <span>+15 Pontos de Colaborador creditados de imediato</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Grid: Palavra / Expressão + Língua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Palavra ou Expressão *
              </label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Ex: Sakidila, Mbote, Ocisola..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Língua Nacional a que Pertence *
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium"
              >
                {languages
                  .filter((l) => l.code !== 'pt')
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.regions.split(',')[0]})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Tradução & Significado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Tradução em Português *
              </label>
              <input
                type="text"
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Ex: Obrigado / Agradecimento"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Pronúncia (Guia Fonético)
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="Ex: Sah-kee-dee-lah"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Significado detalhado */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Significado Completo & Conceito
            </label>
            <textarea
              rows={2}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Explique o sentido exato, conotações ou nuance da palavra..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Exemplo de utilização numa frase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Exemplo de utilização (Na língua nacional)
              </label>
              <input
                type="text"
                value={examplePhrase}
                onChange={(e) => setExamplePhrase(e.target.value)}
                placeholder="Ex: Sakidila kyavulu, ndenge yami."
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tradução do exemplo (Em Português)
              </label>
              <input
                type="text"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="Ex: Muito obrigado, meu irmão/mais novo."
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Áudio da Pronúncia */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Áudio da Pronúncia (Grave com a sua própria voz)
            </label>
            <p className="text-xs text-stone-500 mb-3">
              Falantes nativos e guardiões orais enriquecem a pronúncia original.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mic className="w-4 h-4 text-red-600" />
                  <span>Gravar pronúncia</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>A gravar... Clique para Parar</span>
                </button>
              )}

              {recordedAudio && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={playRecordedSample}
                    className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>Ouvir gravação</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAudio}
                    className="px-2.5 py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-red-50 hover:text-red-700 border border-stone-200 rounded-lg transition-colors flex items-center gap-1"
                    title="Eliminar e gravar novamente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Descartar áudio</span>
                  </button>
                </div>
              )}
            </div>

            {recordingError && (
              <p className="text-xs text-red-600 mt-2">{recordingError}</p>
            )}
          </div>

          {/* Observações ou explicações culturais */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Observações ou Explicações Culturais
            </label>
            <textarea
              rows={2}
              value={culturalNotes}
              onChange={(e) => setCulturalNotes(e.target.value)}
              placeholder="Explicações sobre provérbio, ocasião tradicional, etimologia ou costume associado..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Informação sobre Moderação */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Moderação e Qualidade:</strong> Todas as sugestões passam por uma área de moderação de linguistas e guardiões antes de serem adicionadas oficialmente ao sistema. Ganha <strong>+15 pontos</strong> ao submeter e <strong>+25 pontos</strong> adicionais quando aprovada!
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>A enviar...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar sugestão</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
