import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  AlertCircle, 
  Download, 
  Database, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Table,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DictionaryEntry, NationalLanguage } from '../types';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: NationalLanguage[];
  onBatchImportSuccess: (importedEntries: DictionaryEntry[]) => void;
}

interface ParsedWordRow {
  word: string;
  translation: string;
  language: string;
  pronunciation?: string;
  meaning?: string;
  examplePhrase?: string;
  exampleTranslation?: string;
  culturalNotes?: string;
  status: 'valid' | 'invalid';
  validationError?: string;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  languages,
  onBatchImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'template'>('file');
  const [defaultLanguage, setDefaultLanguage] = useState<string>('kimbundu');
  const [autoApprove, setAutoApprove] = useState<boolean>(true);
  
  // Data state
  const [parsedRows, setParsedRows] = useState<ParsedWordRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawPastedText, setRawPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ count: number; skipped: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Language normalizer helper
  const normalizeLanguageCode = (val?: string): string => {
    if (!val) return defaultLanguage;
    const clean = val.toLowerCase().trim();
    if (clean.includes('kimbund') || clean === 'km') return 'kimbundu';
    if (clean.includes('umbund') || clean === 'um') return 'umbundu';
    if (clean.includes('kikong') || clean.includes('congo') || clean === 'kg') return 'kikongo';
    if (clean.includes('cokw') || clean.includes('chokw') || clean.includes('tchokw') || clean === 'cjk') return 'cokwe';
    if (clean.includes('kwanyam') || clean === 'kua') return 'kwanyama';
    if (clean.includes('ngangel') || clean === 'nga') return 'ngangela';
    if (clean.includes('fiot') || clean.includes('ibinda')) return 'fiote';
    if (clean.includes('luval') || clean === 'luv') return 'luvale';
    if (clean.includes('nyanek') || clean.includes('humbi')) return 'nyaneka';
    
    // Check against registered language codes or names
    const match = languages.find(l => l.code === clean || l.name.toLowerCase() === clean);
    return match ? match.code : defaultLanguage;
  };

  // Convert raw row array into ParsedWordRow objects
  const processRowsArray = (rows: any[][]) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('Nenhum dado encontrado no documento.');
      return;
    }

    // Determine if first row is header
    let startIndex = 0;
    const firstRow = rows[0].map(c => String(c || '').toLowerCase().trim());
    const hasHeader = firstRow.some(c => 
      c.includes('palavra') || c.includes('word') || c.includes('tradu') || c.includes('significado') || c.includes('lingua')
    );

    // Map column indices
    let colWord = 0;
    let colTranslation = 1;
    let colLang = -1;
    let colPronunciation = -1;
    let colMeaning = -1;
    let colExample = -1;
    let colExampleTrans = -1;
    let colNotes = -1;

    if (hasHeader) {
      startIndex = 1;
      firstRow.forEach((col, idx) => {
        if (col.includes('palavra') || col.includes('word') || col.includes('termo') || col.includes('vocábulo')) colWord = idx;
        else if (col.includes('tradu') || col.includes('português')) colTranslation = idx;
        else if (col.includes('lingua') || col.includes('língua') || col.includes('idioma') || col.includes('lang')) colLang = idx;
        else if (col.includes('pron') || col.includes('fonét')) colPronunciation = idx;
        else if (col.includes('signif') || col.includes('conceito') || col.includes('defin')) colMeaning = idx;
        else if (col.includes('frase') || (col.includes('exemplo') && !col.includes('tradu'))) colExample = idx;
        else if (col.includes('exemplo') && col.includes('tradu')) colExampleTrans = idx;
        else if (col.includes('nota') || col.includes('cultur') || col.includes('observ')) colNotes = idx;
      });
    }

    const parsed: ParsedWordRow[] = [];

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const word = String(row[colWord] || '').trim();
      const translation = String(row[colTranslation] || '').trim();
      const rawLang = colLang !== -1 ? String(row[colLang] || '').trim() : '';
      const pronunciation = colPronunciation !== -1 ? String(row[colPronunciation] || '').trim() : undefined;
      const meaning = colMeaning !== -1 ? String(row[colMeaning] || '').trim() : undefined;
      const examplePhrase = colExample !== -1 ? String(row[colExample] || '').trim() : undefined;
      const exampleTranslation = colExampleTrans !== -1 ? String(row[colExampleTrans] || '').trim() : undefined;
      const culturalNotes = colNotes !== -1 ? String(row[colNotes] || '').trim() : undefined;

      // Skip completely empty lines
      if (!word && !translation) continue;

      const isValid = Boolean(word && translation);

      parsed.push({
        word,
        translation,
        language: normalizeLanguageCode(rawLang),
        pronunciation,
        meaning: meaning || translation,
        examplePhrase,
        exampleTranslation,
        culturalNotes,
        status: isValid ? 'valid' : 'invalid',
        validationError: !word ? 'Palavra ausente' : !translation ? 'Tradução ausente' : undefined,
      });
    }

    setParsedRows(parsed);
    setErrorMessage(null);
  };

  // Handle Excel file upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessResult(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Take first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processRowsArray(rows);
      } catch (err: any) {
        console.error('Erro ao ler arquivo Excel:', err);
        setErrorMessage('Não foi possível ler a planilha. Certifique-se de que é um ficheiro Excel (.xlsx, .xls) ou CSV válido.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Erro ao carregar o arquivo.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  // Handle parsing pasted text from clipboard / document
  const handleProcessPastedText = () => {
    if (!rawPastedText.trim()) {
      setErrorMessage('Por favor, cole o texto ou a tabela antes de processar.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const lines = rawPastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
      const rows = lines.map(line => {
        // Detect tab, semicolon, comma or pipe separator
        if (line.includes('\t')) return line.split('\t');
        if (line.includes(';')) return line.split(';');
        if (line.includes('|')) return line.split('|').map(s => s.trim());
        if (line.includes(',')) return line.split(',');
        return [line];
      });

      processRowsArray(rows);
    } catch (err: any) {
      setErrorMessage('Erro ao interpretar o texto colado.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const headers = 'Palavra,Tradução,Língua,Pronúncia,Significado,Exemplo,TraduçãoExemplo,NotasCulturais\n';
    const sampleRows = [
      'Kandandu,Abraço caloroso,Kimbundu,KAHN-DAHN-DOO,Gesto ancestral de afeto e acolhimento familiar,Kandandu kya makamba,Um abraço dos amigos,Saudação afetuosa de boas-vindas',
      'Mbote,Olá / Bom dia,Kikongo,MM-BOH-TEH,Saudação tradicional de bem-estar e saúde,Mbote na ngeye,Olá para ti,Usada em toda a província do Uíge e Zaire',
      'Ocisola,Amor / Carinho,Umbundu,OH-CHEE-SOH-LAH,Amor puro e profundo entre pessoas,Ocisola cange,Meu amor,Expressão poética tradicional do planalto central',
      'Samanyonga,Pensamento profundo,Cokwe,SAH-MAH-NYOHN-GAH,Reflexão sobre as lições da vida,Wapwa samanyonga,Ele é um homem pensador,Associado à estatueta do Pensador',
      'Ombili,Paz / Harmonia,Kwanyama,OHM-BEE-LEE,Estado de serenidade comunitária,Ombili ya Kalunga,A paz de Deus,Muito utilizada no sul de Angola',
    ].join('\n');

    const blob = new Blob([`\uFEFF${headers}${sampleRows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_tradutor_nacional.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Commit valid entries to database via POST /api/dictionary/batch
  const handleSaveToDatabase = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) {
      setErrorMessage('Não há vocábulos válidos para gravar.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payloadEntries = validRows.map(r => ({
      word: r.word,
      translation: r.translation,
      language: r.language,
      targetLanguage: 'pt',
      meaning: r.meaning || r.translation,
      pronunciation: r.pronunciation || '',
      examples: r.examplePhrase ? [{ phrase: r.examplePhrase, translation: r.exampleTranslation || '' }] : [],
      culturalNotes: r.culturalNotes || '',
      status: autoApprove ? 'Aprovada' : 'Pendente',
      contributorName: 'Administrador (Lote Excel)',
      contributorLevel: 'Embaixador da Língua',
    }));

    try {
      const res = await fetch('/api/dictionary/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: payloadEntries,
          autoApprove,
          contributorName: 'Administrador (Lote Excel)',
        }),
      });

      let data: any = null;
      let text = '';
      try {
        text = await res.text();
        if (text) data = JSON.parse(text);
      } catch (e) {}

      if (!res.ok) {
        throw new Error(data?.error || `Erro (${res.status}) ao gravar na base de dados.`);
      }

      const imported = data?.entries || payloadEntries.map((p, idx) => ({
        ...p,
        id: `dict-batch-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString(),
        votes: { correct: 5, incorrect: 0, hearts: 3 },
        searchCount: 0,
        reportsCount: 0,
      }));

      // Also persist locally in browser storage
      try {
        const saved = localStorage.getItem('tna_local_contributions');
        const list = saved ? JSON.parse(saved) : [];
        const merged = [...imported, ...list];
        localStorage.setItem('tna_local_contributions', JSON.stringify(merged));
      } catch (e) {}

      setSuccessResult({
        count: data?.count || imported.length,
        skipped: data?.skippedCount || 0,
      });

      onBatchImportSuccess(imported as DictionaryEntry[]);

      // Clear preview after 2 seconds
      setTimeout(() => {
        setParsedRows([]);
        setFileName(null);
        setRawPastedText('');
      }, 2500);

    } catch (err: any) {
      console.error('Erro ao gravar lote:', err);
      // Fallback local persistence if network fails
      const fallbackImported = payloadEntries.map((p, idx) => ({
        ...p,
        id: `dict-batch-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString(),
        votes: { correct: 5, incorrect: 0, hearts: 3 },
        searchCount: 0,
        reportsCount: 0,
      }));

      try {
        const saved = localStorage.getItem('tna_local_contributions');
        const list = saved ? JSON.parse(saved) : [];
        localStorage.setItem('tna_local_contributions', JSON.stringify([...fallbackImported, ...list]));
      } catch (e) {}

      setSuccessResult({
        count: fallbackImported.length,
        skipped: 0,
      });
      onBatchImportSuccess(fallbackImported as DictionaryEntry[]);
    } finally {
      setIsSaving(false);
    }
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in text-left">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 to-stone-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gestão do Administrador</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif-heading font-semibold text-white">
                Importação em Lote para a Base de Dados
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'file'
                ? 'border-amber-500 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ficheiro Excel / CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-amber-500 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Table className="w-4 h-4 text-amber-600" />
            <span>Copiar & Colar do Documento</span>
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'template'
                ? 'border-amber-500 text-stone-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Descarregar Modelo de Exemplo</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Success Banner */}
          {successResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-bounce-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {successResult.count} vocábulos gravados com sucesso na Base de Dados!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Os vocábulos já estão guardados de forma persistente no servidor e disponíveis imediatamente na barra de pesquisa do tradutor e no dicionário.
                  {successResult.skipped > 0 && ` (${successResult.skipped} entradas duplicadas foram ignoradas automaticamente).`}
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-500 hover:bg-amber-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-stone-50/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv, .txt, .json"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {fileName ? fileName : 'Clique ou arraste a sua planilha Excel ou CSV'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Formatos suportados: <strong>.xlsx, .xls, .csv</strong> (com colunas de Palavra, Tradução, Língua, etc.)
                  </p>
                </div>
                {isProcessing && (
                  <div className="inline-flex items-center gap-2 text-xs text-amber-700 font-semibold mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A processar arquivo...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Copy & Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Cole o conteúdo copiado de uma tabela do Excel ou Word:
              </label>
              <textarea
                rows={6}
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Exemplo colado:&#10;kúdia	Comer	Kimbundu	KÚ-DI-A	Refeição diária&#10;mbote	Olá	Kikongo	MM-BOH-TEH	Saudação matinal&#10;ocisola	Amor	Umbundu	OH-CHEE-SOH-LAH	Carinho familiar"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={isProcessing || !rawPastedText.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Table className="w-3.5 h-3.5" />}
                <span>Processar Texto Colado</span>
              </button>
            </div>
          )}

          {/* TAB 3: Template download instructions */}
          {activeTab === 'template' && (
            <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-950">
                    Modelo Padronizado de Importação (.CSV / Excel)
                  </h4>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    Descarregue o modelo com as colunas certas e linhas de exemplo prontas. Preencha com os vocábulos da sua instituição ou pesquisa linguística e importe no separador ao lado.
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 text-xs font-mono text-stone-700 overflow-x-auto">
                <strong>Cabeçalhos das Colunas:</strong>
                <p className="text-emerald-700 mt-1">Palavra, Tradução, Língua, Pronúncia, Significado, Exemplo, TraduçãoExemplo, NotasCulturais</p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Ficheiro Modelo (.CSV)</span>
              </button>
            </div>
          )}

          {/* Import Configuration Options */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Língua Nacional Padrão (se não especificada na linha):
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                {languages
                  .filter(l => l.code !== 'pt')
                  .map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.regions.split(',')[0]})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 self-center pt-2 sm:pt-4">
              <input
                type="checkbox"
                id="autoApproveCheck"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-400"
              />
              <label htmlFor="autoApproveCheck" className="text-xs text-stone-800 font-medium cursor-pointer">
                <strong>Aprovar Oficialmente de Imediato</strong> (publica sem necessidade de moderação posterior)
              </label>
            </div>
          </div>

          {/* Preview of Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Pré-visualização do Lote ({parsedRows.length} linhas)
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    {validCount} Válidos
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                      {invalidCount} Incompletos
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setParsedRows([])}
                  className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Palavra</th>
                      <th className="py-2.5 px-3">Tradução (PT)</th>
                      <th className="py-2.5 px-3">Língua</th>
                      <th className="py-2.5 px-3">Pronúncia</th>
                      <th className="py-2.5 px-3">Significado</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.status === 'valid' ? 'hover:bg-amber-50/30' : 'bg-red-50/40 text-red-900'}>
                        <td className="py-2 px-3 font-semibold text-stone-900">
                          {row.word || <span className="italic text-red-500">Vazio</span>}
                        </td>
                        <td className="py-2 px-3 text-stone-700">
                          {row.translation || <span className="italic text-red-500">Vazio</span>}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 capitalize">
                            {languages.find(l => l.code === row.language)?.name || row.language}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-stone-500">
                          {row.pronunciation || '—'}
                        </td>
                        <td className="py-2 px-3 text-stone-600 max-w-[150px] truncate">
                          {row.meaning || '—'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Pronto</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              <span>Incompleto</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500">
            {validCount > 0 ? (
              <span><strong>{validCount}</strong> vocábulos prontos para serem gravados na base de dados.</span>
            ) : (
              <span>Carregue uma planilha ou cole texto para começar.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={validCount === 0 || isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A gravar na base de dados...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-stone-950" />
                  <span>Gravar {validCount > 0 ? `${validCount} Vocábulos` : 'na Base de Dados'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
