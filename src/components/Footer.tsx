import React from 'react';
import { Heart, Share2, DollarSign } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPromoModal?: () => void;
  onOpenMonetizationModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPromoModal, onOpenMonetizationModal }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-8 mt-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top footer row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 via-amber-500 to-stone-900 flex items-center justify-center font-bold text-white text-xs">
                AO
              </div>
              <span className="text-base font-serif-heading font-semibold text-white">
                Tradutor Nacional de Angola
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Plataforma dedicada à tradução, valorização e preservação das línguas nacionais angolanas. A tecnologia a serviço da nossa ancestralidade.
            </p>
            <div className="text-xs text-amber-400/90 font-medium">
              "A nossa língua. A nossa cultura. A nossa identidade."
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Navegação
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-stone-400">
              <button onClick={() => onNavigate('inicio')} className="hover:text-white text-left transition-colors">
                Início
              </button>
              <button onClick={() => onNavigate('tradutor')} className="hover:text-white text-left transition-colors">
                Tradutor
              </button>
              <button onClick={() => onNavigate('linguas')} className="hover:text-white text-left transition-colors">
                Línguas Nacionais
              </button>
              <button onClick={() => onNavigate('dicionario')} className="hover:text-white text-left transition-colors">
                Dicionário
              </button>
              <button onClick={() => onNavigate('musicas')} className="hover:text-white text-left transition-colors">
                Músicas Nacionais
              </button>
              <button onClick={() => onNavigate('comunidade')} className="hover:text-white text-left transition-colors">
                Comunidade
              </button>
              <button onClick={() => onNavigate('sobre')} className="hover:text-white text-left transition-colors">
                Sobre o Projeto
              </button>
              {onOpenPromoModal && (
                <button
                  onClick={onOpenPromoModal}
                  className="text-amber-400 hover:text-amber-300 text-left font-semibold transition-colors flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Divulgar App (Textos de Copy)</span>
                </button>
              )}
              {onOpenMonetizationModal && (
                <button
                  onClick={onOpenMonetizationModal}
                  className="text-emerald-400 hover:text-emerald-300 text-left font-semibold transition-colors flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>Anúncios & Monetização</span>
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs text-stone-400">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Línguas em Destaque
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Kimbundu · Umbundu · Kikongo · Cokwe · Kwanyama · Ngangela · Fiote · Luvale · Nyaneka · Muhumbi
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-stone-400">
                Alinhado com as diretrizes do Instituto de Línguas Nacionais de Angola (ILNA).
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span>Tradutor Nacional de Angola © {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Todos os direitos reservados à cultura nacional</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Desenvolvido com respeito pelo património linguístico</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};
