import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { NationalLanguage } from '../types';
import linguistsImage from '../assets/images/community_linguists_1791198974134.jpg';

interface LanguagesSectionProps {
  languages: NationalLanguage[];
  onSelectLanguageForTranslation: (langCode: string) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  languages,
  onSelectLanguageForTranslation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const nationalLangs = languages.filter(l => l.code !== 'pt');

  const filtered = nationalLangs.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.regions.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Editorial Headline & Image Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-stone-200 pb-8 mb-8">
        
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            <span>Mapeamento Linguístico de Angola</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-heading font-semibold text-stone-900 leading-tight">
            Línguas Nacionais: As Vozes da Nossa Terra
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
            Angola é abençoada por uma vasta pluralidade linguística de raiz bantu e khoisan. Cada língua carrega séculos de filosofia, cantos de colheita, provérbios morais e sabedoria comunitária.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{nationalLangs.length} Línguas Catalogadas</span>
            <span>·</span>
            <span>Estrutura aberta para novas adições</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200 aspect-4/3">
            <img
              src={linguistsImage}
              alt="Linguistas e anciãos a arquivar a tradição oral angolana"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-stone-200">
              <span className="font-semibold text-white">Transmissão Intergeracional:</span> Guardiões da tradição oral e jovens investigadores unidos pela língua.
            </div>
          </div>
        </div>

      </div>

      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar língua por nome ou província..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((lang) => (
          <div
            key={lang.code}
            className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-400/90 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-serif-heading font-semibold text-stone-900">
                    {lang.name}
                  </h3>
                  {lang.nativeName && lang.nativeName !== lang.name && (
                    <span className="text-xs text-amber-800 font-medium">
                      {lang.nativeName}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {lang.code.toUpperCase()}
                </span>
              </div>

              {/* Regions & Speakers */}
              <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span><strong>Províncias:</strong> {lang.regions}</span>
                </div>
                {lang.speakersEstimated && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>Falantes estimados:</strong> {lang.speakersEstimated}</span>
                  </div>
                )}
                {lang.family && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="text-stone-500"><strong>Família:</strong> {lang.family}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                {lang.description}
              </p>
            </div>

            {/* Action: Translate in this language */}
            <div className="pt-4 mt-4 border-t border-stone-100">
              <button
                onClick={() => onSelectLanguageForTranslation(lang.code)}
                className="w-full py-2 px-3 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-amber-400 hover:text-stone-950 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Traduzir em {lang.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
