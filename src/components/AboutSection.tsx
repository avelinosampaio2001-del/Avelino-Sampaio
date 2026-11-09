import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Sparkles, 
  Globe, 
  Compass,
  ArrowRight
} from 'lucide-react';
import pensadorImage from '../assets/images/pensador_angola_1791198985378.jpg';
import heroImage from '../assets/images/hero_angola_culture_1791198959479.jpg';

interface AboutSectionProps {
  onStartTranslating: () => void;
  onOpenContributeModal: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onStartTranslating,
  onOpenContributeModal,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-12">
      
      {/* Editorial Header */}
      <div className="border-b border-stone-200 pb-8 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          <span>Manifesto Institucional & Cultural</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-heading font-semibold text-stone-900 leading-tight">
          A nossa língua. A nossa cultura. A nossa identidade.
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl">
          O <strong>Tradutor Nacional de Angola</strong> nasce com o propósito histórico de aproximar os angolanos, salvaguardar a riqueza das nossas tradições orais e elevar as línguas nacionais ao patamar da tecnologia contemporânea.
        </p>
      </div>

      {/* 5 Pillars Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif-heading font-semibold text-stone-900">
          Os Nossos 5 Pilares Fundamentais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              Valorização das Línguas Nacionais
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dar visibilidade, prestígio e dignidade documental ao Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama e a todas as línguas maternas de Angola.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              Preservação do Património Cultural
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Registar provérbios, cantares, conceitos filosóficos bantu e terminologias ancestrais antes que a erosão do tempo apague as memórias orais dos mais velhos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              Comunicação Entre Comunidades
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Encurtar distâncias entre o litoral e o interior, entre o norte e o sul, permitindo que cidadãos de diferentes províncias se compreendam com facilidade e afeto.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              Incentivo aos Jovens
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Oferecer uma interface digital moderna, áudio com pronúncia e inteligência artificial que estimule as novas gerações a aprender e falar as línguas dos seus avós.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2 md:col-span-2 lg:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm">
              05
            </div>
            <h3 className="font-semibold text-stone-900 text-base">
              Base de Conhecimento Comunitária
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Construir uma plataforma viva e participativa onde cada angolano é guardião da sua língua, submetendo vocábulos e votando na fidelidade das traduções sob moderação rigorosa.
            </p>
          </div>

        </div>
      </div>

      {/* Technology & Human Wisdom Section */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inteligência Artificial & Tradição Bantu</span>
          </div>

          <h3 className="text-2xl font-serif-heading font-medium text-stone-100">
            A IA como Instrumento de Apoio, a Sabedoria Humana como Guia
          </h3>

          <p className="text-sm text-stone-300 leading-relaxed">
            Reconhecemos que nenhuma máquina substitui a vivência de um falante nativo. O nosso sistema utiliza modelos linguísticos de ponta (Google Gemini) para sugerir pontes de tradução e contexto gramatical, mas o coração do sistema reside no <strong>Dicionário Verificado</strong>, moderado por especialistas e auditado pela comunidade.
          </p>

          <p className="text-xs text-stone-400 italic">
            Quando não há uma tradução confirmada, a plataforma é transparente: convida o utilizador a sugerir a expressão correta, garantindo que o conhecimento nunca seja inventado.
          </p>
        </div>
      </div>

      {/* Security & Quality Governance */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-lg font-serif-heading font-semibold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Segurança, Qualidade e Salvaguarda dos Dados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
          <div>
            <h4 className="font-semibold text-stone-800 mb-1">Moderação Prévia</h4>
            <p>Todas as novas palavras passam pela aprovação de moderadores antes da integração no vocabulário público.</p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-800 mb-1">Sistema de Denúncias</h4>
            <p>Mecanismo ativo para sinalizar spam, imprecisões ortográficas ou expressões impróprias.</p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-800 mb-1">Auditoria Histórica</h4>
            <p>Registo completo das alterações feitas em cada verbete para assegurar a rastreabilidade etimológica.</p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4 space-y-4">
        <h3 className="text-xl font-serif-heading font-semibold text-stone-900">
          Faça parte desta grande missão cultural
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartTranslating}
            className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
          >
            Experimentar o Tradutor
          </button>
          <button
            onClick={onOpenContributeModal}
            className="px-5 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Enviar Nova Palavra
          </button>
        </div>
      </div>

    </div>
  );
};
