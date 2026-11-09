import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  X, 
  Megaphone, 
  DollarSign, 
  Eye, 
  MousePointerClick, 
  ChevronRight,
  ShieldCheck,
  Building2,
  PhoneCall
} from 'lucide-react';
import { AdBanner as AdBannerType, AdPlacement } from '../types';

interface AdBannerProps {
  banner?: AdBannerType;
  placement: AdPlacement;
  onOpenMonetizationModal: () => void;
  onAdClick?: (bannerId: string) => void;
  className?: string;
  allowDismiss?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  banner,
  placement,
  onOpenMonetizationModal,
  onAdClick,
  className = '',
  allowDismiss = true,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  // If no banner is provided or it is inactive, display the high-conversion "Anuncie Aqui" banner
  if (!banner || !banner.isActive) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${className}`}>
        {/* Subtle decorative pattern accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/40 mt-0.5">
              <Megaphone className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-200 text-amber-900 border border-amber-300">
                  <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                  Espaço Publicitário Disponível
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Alcance milhares de angolanos e a diáspora
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-stone-900 mt-1">
                Monetize esta plataforma ou anuncie a sua marca em Angola
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
                Empresas, telecomunicações, bancos e projetos culturais: promova os seus produtos no Tradutor Nacional de Angola com planos a partir de <strong className="text-amber-800 font-semibold">25.000 Kz/mês</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={onOpenMonetizationModal}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Ver Planos & Sugestões
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {allowDismiss && (
              <button
                onClick={() => setIsDismissed(true)}
                title="Ocultar aviso"
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-black/5 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle click on active sponsor ad
  const handleClick = (e: React.MouseEvent) => {
    if (onAdClick) {
      onAdClick(banner.id);
    }
  };

  // Variant: Top Leaderboard (Horizontal Strip)
  if (placement === 'top_leaderboard') {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all hover:border-amber-300 hover:shadow-md ${className}`}>
        {/* Top subtle ribbon indicating sponsored content */}
        <div className="h-1 bg-gradient-to-r from-red-600 via-amber-400 to-stone-900" />
        
        <div className="p-3.5 sm:p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {banner.imageUrl ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.sponsorName} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                  <ShieldCheck className="w-2.5 h-2.5 text-amber-600" />
                  {banner.badgeText || 'Patrocinador Oficial'}
                </span>
                <span className="text-[11px] font-semibold text-amber-800">
                  {banner.sponsorName}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate mt-0.5">
                {banner.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-1 mt-0.5">
                {banner.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <a
              href={banner.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs font-medium transition-all shadow-xs"
            >
              <span>{banner.ctaText}</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>

            <button
              onClick={onOpenMonetizationModal}
              title="Saber como anunciar ou monetizar"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] text-amber-800 hover:text-amber-900 hover:bg-amber-50 border border-amber-200 transition-colors"
            >
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">Anuncie</span>
            </button>

            {allowDismiss && (
              <button
                onClick={() => setIsDismissed(true)}
                title="Fechar anúncio"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variant: Native / In-Feed Card (Medium Rectangle or Feed card)
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            {banner.badgeText || 'Publicidade Parceira'}
          </span>
          <span className="text-xs font-semibold text-stone-600">
            {banner.sponsorName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400">
          <button
            onClick={onOpenMonetizationModal}
            className="text-[11px] text-stone-500 hover:text-amber-700 transition-colors underline"
          >
            Anuncie Aqui
          </button>
          {allowDismiss && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Ocultar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {banner.imageUrl && (
          <div className="w-full sm:w-28 h-28 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-stone-100 bg-stone-50">
            <img 
              src={banner.imageUrl} 
              alt={banner.sponsorName} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-stone-900">
            {banner.title}
          </h4>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {banner.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-stone-400" />
            {banner.impressionsCount || 0} visualizações
          </span>
          <span className="flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-stone-400" />
            {banner.clicksCount || 0} cliques
          </span>
        </div>

        <a
          href={banner.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold transition-all shadow-xs hover:shadow-sm"
        >
          <span>{banner.ctaText}</span>
          <ExternalLink className="w-3 h-3 text-stone-900" />
        </a>
      </div>
    </div>
  );
};
