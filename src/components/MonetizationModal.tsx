import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Globe2, 
  BookOpen, 
  HeartHandshake, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  Sparkles, 
  Copy, 
  Sliders, 
  Smartphone, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { AdBanner, MonetizationSettings, AdPlacement } from '../types';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ads: AdBanner[];
  activeBannerId?: string;
  onSelectActiveBanner?: (bannerId: string) => void;
  onSaveCustomBanner?: (banner: Partial<AdBanner>) => Promise<void>;
  isAdmin?: boolean;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  ads,
  activeBannerId,
  onSelectActiveBanner,
  onSaveCustomBanner,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'sugestoes' | 'tabela' | 'gestor' | 'contacto'>('sugestoes');
  const [selectedBanner, setSelectedBanner] = useState<string>(activeBannerId || (ads[0]?.id ?? 'ad-unitel-1'));
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Custom banner form
  const [customSponsor, setCustomSponsor] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customPlacement, setCustomPlacement] = useState<AdPlacement>('top_leaderboard');
  const [customCta, setCustomCta] = useState('Saber Mais');
  const [customUrl, setCustomUrl] = useState('');
  const [customImage, setCustomImage] = useState('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleApplyBanner = async (bannerId: string) => {
    setSelectedBanner(bannerId);
    if (onSelectActiveBanner) {
      onSelectActiveBanner(bannerId);
    }
    setSaveSuccessMessage('Banner ativado com sucesso na plataforma!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSponsor || !customTitle || !customUrl) return;

    setIsSavingCustom(true);
    try {
      const newBanner: Partial<AdBanner> = {
        sponsorName: customSponsor.trim(),
        title: customTitle.trim(),
        description: customDesc.trim() || 'Apoie o património linguístico angolano.',
        ctaText: customCta.trim() || 'Saber Mais',
        targetUrl: customUrl.trim(),
        imageUrl: customImage.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        badgeText: 'Anunciante Parceiro',
        placement: customPlacement,
        isActive: true,
      };

      if (onSaveCustomBanner) {
        await onSaveCustomBanner(newBanner);
      }
      setSaveSuccessMessage('Novo banner criado e ativado com sucesso!');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCustom(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    'Olá equipa do Tradutor Nacional de Angola! Gostaria de obter informações sobre espaços publicitários e parcerias para anunciar a minha empresa na plataforma.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden text-stone-900">
        
        {/* Modal Top Header with Samakaka decorative accent */}
        <div className="relative p-5 sm:p-6 bg-stone-900 text-white shrink-0 samakaka-border-b">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Guia de Monetização & Publicidade
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">
              Especial Angola & Diáspora
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-white">
            Como Monetizar o Tradutor Nacional
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Consulte sugestões práticas e comprovadas para gerar receitas sustentáveis em Kwanzas e Moeda Estrangeira, ou teste e ative os banners de anúncios agora.
          </p>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 mt-5 overflow-x-auto no-scrollbar border-b border-stone-800 pb-0.5">
            <button
              onClick={() => setActiveTab('sugestoes')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'sugestoes'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/80'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              1. Sugestões de Monetização
            </button>

            <button
              onClick={() => setActiveTab('tabela')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'tabela'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/80'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              2. Tabela de Preços & Planos (Kz)
            </button>

            <button
              onClick={() => setActiveTab('gestor')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'gestor'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/80'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <Sliders className="w-4 h-4" />
              3. Gestor & Simulador de Banners
            </button>

            <button
              onClick={() => setActiveTab('contacto')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${
                activeTab === 'contacto'
                  ? 'border-amber-400 text-amber-300 bg-stone-800/80'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              4. Contactar Anunciante
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-stone-50/60">

          {saveSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-bounce-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: SUGESTÕES ESTRATÉGICAS DE MONETIZAÇÃO */}
          {activeTab === 'sugestoes' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-200 rounded-2xl p-4.5 text-stone-800 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-stone-900 block font-semibold mb-0.5">
                    Como rentabilizar plataformas culturais e educativas em Angola:
                  </strong>
                  Ao contrário de outros nichos onde o Google AdSense paga centavos por clique em África, o valor mais alto em Angola provém de <strong>patrocínios institucionais diretos</strong> com operadoras, bancos e empresas de consumo, pagos por transferência em Kwanzas (AOA).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pilar 1 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        1. Patrocínio Direto com Marcas Angolanas
                      </h4>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Mais Rentável em Angola ★★★★★
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Quem abordar:</strong> Telecomunicações (Unitel, Africell), Bancos (BAI, BFA, BIC), Universidades (UCAN, Agostinho Neto) e Seguradoras (ENSA).
                  </p>
                  <div className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-stone-700">
                    💡 <strong>Argumento de Venda:</strong> Apresente a plataforma como ação de <em>Responsabilidade Social & Educação Cívica</em>. As marcas ganham prestígio ao associar o seu logo à preservação das línguas maternas de Angola.
                  </div>
                </div>

                {/* Pilar 2 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        2. Google AdSense & Anúncios Programáticos
                      </h4>
                      <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        Receita Passiva Internacional ★★★★☆
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Como funciona:</strong> Adicione o código do Google AdSense no cabeçalho. Os anúncios são exibidos automaticamente para utilizadores na Europa, Brasil e EUA.
                  </p>
                  <div className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-stone-700">
                    💡 <strong>Dica de Ouro:</strong> Os acessos vindos da diáspora angolana (Portugal, Reino Unido, França) têm um CPM (custo por mil) muito superior, gerando receita em euros e dólares.
                  </div>
                </div>

                {/* Pilar 3 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        3. Cursos de Línguas Bantu & Manuais
                      </h4>
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                        Afiliados & Infoprodutos ★★★★☆
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>O que vender:</strong> Cursos online intensivos de Kimbundu e Umbundu, manuais de gramática em PDF, dicionários físicos e aulas particulares com mestres locais.
                  </p>
                  <div className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-stone-700">
                    💡 <strong>Margem:</strong> Cada aluno angolano ou estrangeiro paga entre 10.000 a 25.000 Kz por curso. Parcerias com professores locais pagam 30% a 50% de comissão direta.
                  </div>
                </div>

                {/* Pilar 4 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">
                        4. Apoio Comunitário & Multicaixa Express
                      </h4>
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Crowdfunding Cívico ★★★☆☆
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Como implementar:</strong> Disponibilize um número Multicaixa Express / IBAN angolano para pequenas doações voluntárias (500 Kz a 5.000 Kz) para pagar servidores.
                  </p>
                  <div className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-stone-700">
                    💡 <strong>Transparência:</strong> Mostre uma meta pública ("Custos do Servidor deste Mês: 85% Apoiados"). O público angolano apoia com gosto causas culturais autênticas.
                  </div>
                </div>

              </div>

              {/* Botão de ação rápida */}
              <div className="p-4 bg-stone-900 rounded-2xl text-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Quer ver como fica o banner no site?</h4>
                  <p className="text-xs text-stone-300">Teste presets reais de marcas como Unitel, Banco BAI e TAAG no simulador.</p>
                </div>
                <button
                  onClick={() => setActiveTab('gestor')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-xl transition-all shadow-xs shrink-0"
                >
                  Abrir Simulador de Banners
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TABELA DE PREÇOS SUGERIDOS */}
          {activeTab === 'tabela' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-serif-heading font-semibold text-stone-900">
                  Tabela de Preços de Publicidade Recomendada (Kwanzas / Mês)
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Preços de referência para apresentar a empresas, patrocinadores e anunciantes em Luanda e províncias.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Plano 1 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      Plano Básico
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-stone-900">25.000</span>
                      <span className="text-xs text-stone-500 font-medium">Kz / mês</span>
                    </div>
                    <p className="text-xs text-stone-600">
                      Ideal para pequenas empresas, artesãos, livreiros e eventos culturais locais.
                    </p>
                    <ul className="text-xs text-stone-700 space-y-2 pt-2 border-t border-stone-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Banner Nativo no Dicionário
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Link direto para WhatsApp ou Site
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Relatório básico de cliques
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('contacto')}
                    className="mt-6 w-full py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-colors"
                  >
                    Propor Plano Básico
                  </button>
                </div>

                {/* Plano 2 */}
                <div className="bg-white rounded-2xl p-5 border-2 border-amber-400 relative flex flex-col justify-between shadow-md">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-stone-950 shadow-xs">
                    Mais Recomendado
                  </div>
                  <div className="space-y-3">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800">
                      Plano Destaque
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-stone-900">60.000</span>
                      <span className="text-xs text-stone-500 font-medium">Kz / mês</span>
                    </div>
                    <p className="text-xs text-stone-600">
                      Banner de alto impacto posicionado logo abaixo da caixa de tradução e na Página Inicial.
                    </p>
                    <ul className="text-xs text-stone-700 space-y-2 pt-2 border-t border-stone-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Top Leaderboard em todas as traduções
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Badge "Patrocinador em Destaque"
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Alta taxa de cliques (CTR comprovado)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Até 2 alterações de criativo por mês
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('contacto')}
                    className="mt-6 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold transition-colors shadow-xs"
                  >
                    Propor Plano Destaque
                  </button>
                </div>

                {/* Plano 3 */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white">
                      Patrocinador Master
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-stone-900">150.000</span>
                      <span className="text-xs text-stone-500 font-medium">Kz / mês</span>
                    </div>
                    <p className="text-xs text-stone-600">
                      Para grandes empresas, bancos e operadoras que desejam exclusividade de marca.
                    </p>
                    <ul className="text-xs text-stone-700 space-y-2 pt-2 border-t border-stone-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Exclusividade no cabeçalho e navbar
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Apoio oficial a todas as 11+ línguas
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Mencionado nas partilhas sociais
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Isenção de outros concorrentes
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('contacto')}
                    className="mt-6 w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors"
                  >
                    Propor Plano Master
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: GESTOR & SIMULADOR DE BANNERS */}
          {activeTab === 'gestor' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-serif-heading font-semibold text-stone-900">
                  Simulador & Gestão de Banners em Tempo Real
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Escolha um patrocinador existente para ver como se integra na interface ou cadastre um anúncio personalizado.
                </p>
              </div>

              {/* Lista de presets existentes */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase text-stone-500 tracking-wider block">
                  Selecione um Patrocinador Ativo:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ads.map((ad) => {
                    const isSelected = selectedBanner === ad.id;
                    return (
                      <div
                        key={ad.id}
                        onClick={() => handleApplyBanner(ad.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {ad.imageUrl && (
                            <img
                              src={ad.imageUrl}
                              alt={ad.sponsorName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-900 truncate">
                              {ad.sponsorName}
                            </div>
                            <div className="text-[11px] text-stone-600 truncate">
                              {ad.title}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Ativo
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-[11px] text-stone-500 hover:text-stone-900 px-2 py-1 rounded-lg border border-stone-200 bg-stone-50"
                            >
                              Ativar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formulário para Anúncio Personalizado */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-semibold text-stone-900">
                    Criar Anúncio ou Parceria Personalizada
                  </h4>
                </div>
                <form onSubmit={handleCreateCustom} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                        Nome da Empresa / Patrocinador
                      </label>
                      <input
                        type="text"
                        value={customSponsor}
                        onChange={(e) => setCustomSponsor(e.target.value)}
                        placeholder="Ex: Livraria Luanda / BFA"
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                        Título Chamativo do Banner
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ex: Aprenda Kimbundu com 20% de Desconto"
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                      Texto Descritivo
                    </label>
                    <input
                      type="text"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Ex: Cursos certificados com professores nativos online e em Luanda."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                        Texto do Botão (CTA)
                      </label>
                      <input
                        type="text"
                        value={customCta}
                        onChange={(e) => setCustomCta(e.target.value)}
                        placeholder="Ex: Inscrever Agora"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                        Link de Destino (URL ou WhatsApp)
                      </label>
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://suaempresa.ao ou https://wa.me/244..."
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                        URL da Imagem / Logo
                      </label>
                      <input
                        type="url"
                        value={customImage}
                        onChange={(e) => setCustomImage(e.target.value)}
                        placeholder="https://exemplo.com/logo.jpg"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingCustom}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs transition-colors shadow-xs flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isSavingCustom ? 'A Guardar...' : 'Guardar e Ativar Banner'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: CONTACTAR ANUNCIANTE & PARCERIAS */}
          {activeTab === 'contacto' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-serif-heading font-semibold text-stone-900">
                  Fale com a Nossa Equipa Comercial & Parcerias
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Estamos prontos para desenhar campanhas personalizadas para a sua marca ou projeto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Canal WhatsApp */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">Atendimento Via WhatsApp</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Fale diretamente com os responsáveis comerciais para receber o Media Kit e fechar anúncios rapidamente.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/244923000000?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Abrir Conversa WhatsApp (+244)
                  </a>
                </div>

                {/* Canal E-mail */}
                <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900">Proposta por Correio Eletrónico</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Envie o seu pedido formal com logotipo e requisitos para formalização contratual.
                    </p>
                  </div>
                  <a
                    href="mailto:parcerias@tradutornacional.ao?subject=Proposta%20de%20Publicidade%20-%20Tradutor%20Nacional"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs shadow-xs transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Enviar E-mail Comercial
                  </a>
                </div>

              </div>

              {/* Mensagem pronta para copiar */}
              <div className="bg-white rounded-2xl p-4.5 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Mensagem Modelo para Proposta a Empresas:
                  </span>
                  <button
                    onClick={() => handleCopy(
                      'Prezada Direção de Marketing,\n\nApresentamos a oportunidade de patrocinar o Tradutor Nacional de Angola, a principal plataforma digital de preservação e tradução das línguas nacionais (Kimbundu, Umbundu, Kikongo, Cokwe, etc.).\n\nA sua marca terá exposição de destaque perante milhares de cidadãos angolanos e membros da diáspora que valorizam a nossa identidade cultural.\n\nPlanos a partir de 25.000 Kz/mês. Podemos agendar uma breve conversa?',
                      'modelo'
                    )}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                  >
                    {copiedText === 'modelo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedText === 'modelo' ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
                <div className="text-xs text-stone-600 italic bg-stone-50 p-3 rounded-xl border border-stone-100">
                  "Prezada Direção de Marketing, apresentamos a oportunidade de patrocinar o Tradutor Nacional de Angola... A sua marca terá exposição perante milhares de angolanos..."
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Monetização Ética & Respeito pela Cultura Angolana</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
