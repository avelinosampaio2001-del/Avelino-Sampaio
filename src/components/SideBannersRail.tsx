import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Megaphone, 
  Sparkles, 
  X, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  ShieldCheck,
  Building2,
  ChevronDown,
  Pause,
  Play
} from 'lucide-react';
import { AdBanner, MonetizationSettings } from '../types';

interface SideBannersRailProps {
  side: 'left' | 'right';
  ads: AdBanner[];
  settings: MonetizationSettings;
  onOpenMonetizationModal: () => void;
  onAdClick?: (bannerId: string) => void;
}

export const SideBannersRail: React.FC<SideBannersRailProps> = ({
  side,
  ads,
  settings,
  onOpenMonetizationModal,
  onAdClick,
}) => {
  // Check if side banners are globally enabled and this specific side is active
  const isSideEnabled = side === 'left' ? settings.sidebarLeftActive : settings.sidebarRightActive;
  if (!settings.sidebarAdsEnabled || !isSideEnabled) {
    return null;
  }

  // Filter ads designated for this side or for both
  const sidePlacement = side === 'left' ? 'sidebar_left' : 'sidebar_right';
  const eligibleAds = ads.filter(
    (a) => a.isActive && (a.placement === sidePlacement || a.placement === 'sidebar_both')
  );

  // If no specific side ads exist, fallback to other active ads (or show high-converting "Anuncie Aqui" card)
  const displayAds = eligibleAds.length > 0 ? eligibleAds : ads.filter(a => a.isActive);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const intervalSeconds = Math.max(4, settings.sidebarRotationInterval || 7);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation effect with smooth progress bar
  useEffect(() => {
    if (isPaused || isCollapsed || displayAds.length <= 1) {
      return;
    }

    const stepMs = 100;
    const totalSteps = (intervalSeconds * 1000) / stepMs;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const pct = Math.min(100, (currentStep / totalSteps) * 100);
      setProgress(pct);

      if (currentStep >= totalSteps) {
        currentStep = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % displayAds.length);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, isCollapsed, displayAds.length, intervalSeconds, currentIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, displayAds.length));
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + displayAds.length) % Math.max(1, displayAds.length));
  };

  const currentAd = displayAds[currentIndex];

  const handleLinkClick = (e: React.MouseEvent) => {
    if (currentAd && onAdClick) {
      onAdClick(currentAd.id);
    }
  };

  // If user collapsed the side rail, show a discreet floating pill tab
  if (isCollapsed) {
    return (
      <div 
        className={`fixed top-28 z-40 hidden 2xl:flex flex-col items-center transition-all ${
          side === 'left' ? 'left-2' : 'right-2'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          title="Ver Publicidades e Parceiros"
          className="group flex items-center gap-1.5 py-3 px-2 rounded-xl bg-stone-900/90 hover:bg-stone-900 text-amber-300 text-[11px] font-semibold shadow-lg border border-stone-700/80 backdrop-blur-xs transition-all hover:scale-105 [writing-mode:vertical-lr]"
        >
          <Megaphone className="w-3.5 h-3.5 [writing-mode:horizontal-tb] rotate-90 text-amber-400 group-hover:animate-bounce" />
          <span>Publicidades {side === 'left' ? '←' : '→'}</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-24 z-30 hidden 2xl:flex flex-col w-56 xl:w-60 transition-all duration-300 ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
      aria-label={`Publicidades laterais ${side === 'left' ? 'esquerda' : 'direita'}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-stone-200/90 shadow-lg hover:shadow-xl transition-all flex flex-col">
        
        {/* Top Header Strip with rotation controls and dismiss */}
        <div className="bg-stone-900 text-white px-3 py-2 flex items-center justify-between text-[11px] border-b border-stone-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-[10px] tracking-wider uppercase text-amber-300">
              Patrocinadores
            </span>
          </div>

          <div className="flex items-center gap-1 text-stone-400">
            {displayAds.length > 1 && (
              <span className="text-[10px] font-mono text-stone-300 mr-1">
                {currentIndex + 1}/{displayAds.length}
              </span>
            )}

            {displayAds.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Anúncio anterior"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Próximo anúncio"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors ml-0.5"
              title="Minimizar barra lateral"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress bar for auto-rotation */}
        {displayAds.length > 1 && (
          <div className="h-0.5 w-full bg-stone-100 overflow-hidden">
            <div 
              className="h-full bg-amber-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Banner Content Body */}
        {currentAd ? (
          <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
            {/* Image / Logo */}
            {currentAd.imageUrl ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 group">
                <img
                  src={currentAd.imageUrl}
                  alt={currentAd.sponsorName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                  {currentAd.badgeText || 'Destaque'}
                </div>
              </div>
            ) : (
              <div className="w-full h-24 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-400 flex items-center justify-center font-bold text-xs">
                <Building2 className="w-6 h-6 mb-1 text-amber-400" />
              </div>
            )}

            {/* Texts */}
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide truncate">
                  {currentAd.sponsorName}
                </span>
                {currentAd.category && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                    {currentAd.category}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-stone-900 leading-snug line-clamp-2">
                {currentAd.title}
              </h4>

              <p className="text-[11px] text-stone-600 mt-1 line-clamp-3 leading-relaxed">
                {currentAd.description}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <a
                href={currentAd.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs shadow-xs hover:shadow-sm transition-all"
              >
                <span>{currentAd.ctaText || 'Saber Mais'}</span>
                <ExternalLink className="w-3 h-3 text-stone-950" />
              </a>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                <span className="flex items-center gap-1 text-stone-400">
                  <Eye className="w-3 h-3" />
                  {currentAd.impressionsCount || 0}
                </span>
                <button
                  onClick={onOpenMonetizationModal}
                  className="text-amber-800 hover:text-amber-950 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Anuncie Aqui
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Empty / Slot available invitation */
          <div className="p-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                Espaço Lateral Disponível
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                A sua empresa pode aparecer neste espaço e alcançar milhares de leitores em Angola.
              </p>
            </div>
            <button
              onClick={onOpenMonetizationModal}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-amber-300 text-xs font-semibold shadow-xs transition-colors"
            >
              Ver Planos de Anúncio
            </button>
          </div>
        )}

        {/* Bottom invitation bar */}
        <div className="bg-stone-50 px-3 py-1.5 border-t border-stone-200/80 flex items-center justify-between text-[10px]">
          <span className="text-stone-500">Gestão Admin</span>
          <button
            onClick={onOpenMonetizationModal}
            className="text-stone-700 hover:text-amber-700 font-semibold transition-colors"
          >
            Tabela de Preços
          </button>
        </div>

      </div>
    </aside>
  );
};
