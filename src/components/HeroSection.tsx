import React from 'react';
import { ArrowRight, BookMarked, Users, Sparkles, Heart, Share2 } from 'lucide-react';
import heroImage from '../assets/images/hero_angola_culture_1791198959479.jpg';
import pensadorImage from '../assets/images/pensador_angola_1791198985378.jpg';

interface HeroSectionProps {
  onStartTranslating: () => void;
  onExploreLanguages: () => void;
  onContribute: () => void;
  onOpenPromoModal?: () => void;
  stats: {
    totalTranslations: number;
    approvedWords: number;
    totalLanguages: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartTranslating,
  onExploreLanguages,
  onContribute,
  onOpenPromoModal,
  stats,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      
      {/* Background visual texture with measured contrast scrim */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src={heroImage}
          alt="Cultura e paisagem de Angola"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/90 to-stone-900/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Brand Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Plataforma Oficial Colaborativa</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-medium tracking-tight text-stone-100 leading-tight">
              A nossa língua, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-red-400">
                a nossa identidade.
              </span>
            </h1>

            {/* Brand core message & subheadline */}
            <p className="text-base sm:text-lg text-stone-300 max-w-xl leading-relaxed">
              Conheça, aprenda e preserve as línguas nacionais de Angola. Um espaço comunitário e tecnológico que une Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama e todo o património linguístico angolano.
            </p>

            {/* Motto ribbon */}
            <div className="text-xs sm:text-sm text-stone-400 flex items-center gap-2 font-medium">
              <span>A nossa língua</span>
              <span className="text-amber-500">·</span>
              <span>A nossa cultura</span>
              <span className="text-red-500">·</span>
              <span>A nossa identidade</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartTranslating}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 whitespace-nowrap"
              >
                <span>Traduzir agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreLanguages}
                className="px-5 py-3 rounded-lg text-sm font-medium text-stone-200 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 transition-colors whitespace-nowrap"
              >
                Explorar línguas
              </button>

              <button
                onClick={onContribute}
                className="px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Heart className="w-4 h-4 text-red-500" />
                <span>Contribuir</span>
              </button>

              {onOpenPromoModal && (
                <button
                  onClick={onOpenPromoModal}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-amber-300 hover:text-amber-200 bg-stone-800/40 hover:bg-stone-800/80 border border-amber-500/20 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title="Ver e copiar textos prontos para divulgar nas redes"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Divulgar App</span>
                </button>
              )}
            </div>

            {/* Claim to Proof Adjacency Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-800/80 text-stone-300">
              <div>
                <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                  {stats.totalLanguages}+
                </div>
                <div className="text-xs text-stone-400">Línguas Nacionais</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                  {stats.approvedWords}+
                </div>
                <div className="text-xs text-stone-400">Expressões Aprovadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                  30M+
                </div>
                <div className="text-xs text-stone-400">Falantes Representados</div>
              </div>
            </div>

          </div>

          {/* Right Column: Cultural Focal Anchor with "O Pensador" */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-stone-700/80 shadow-2xl bg-stone-800/60 backdrop-blur-xs">
              
              <div className="relative aspect-square overflow-hidden bg-stone-900">
                <img
                  src={pensadorImage}
                  alt="O Pensador Cokwe (Samanyonga) - Símbolo de sabedoria ancestral de Angola"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-3 left-4 right-4 text-left">
                  <div className="text-[11px] font-mono tracking-wider text-amber-400 uppercase">
                    Sabedoria Ancestral · Cokwe
                  </div>
                  <div className="text-base font-serif-heading font-medium text-stone-100">
                    O Pensador (Samanyonga)
                  </div>
                </div>
              </div>

              <div className="p-4 text-xs text-stone-300 text-left border-t border-stone-700/60 bg-stone-900/90">
                <p className="leading-relaxed text-stone-300">
                  "Um povo que conhece e fala as suas línguas preserva a sua alma e transmite a sua história para as futuras gerações."
                </p>
                <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
                  Património Histórico & Cultural de Angola
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
