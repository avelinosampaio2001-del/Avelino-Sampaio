import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Instagram, 
  Twitter, 
  Radio, 
  Smartphone, 
  Sparkles,
  Heart,
  Globe,
  ExternalLink
} from 'lucide-react';

interface PromoCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

interface PromoCopyItem {
  id: string;
  category: string;
  channelName: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  copyText: string;
  hashtags?: string;
  shareUrlType?: 'whatsapp' | 'twitter';
}

export const PromoCopyModal: React.FC<PromoCopyModalProps> = ({
  isOpen,
  onClose,
  appUrl = window.location.origin || 'https://tradutornacional.ao',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('whatsapp');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copies: PromoCopyItem[] = [
    {
      id: 'whatsapp-geral',
      category: 'whatsapp',
      channelName: 'WhatsApp & Grupos',
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
      title: 'Mensagem para Grupos de Família e Amigos',
      description: 'Ideal para partilhar em grupos do WhatsApp, vizinhos, colegas e conterrâneos em Angola e na diáspora.',
      copyText: `🇦🇴 *OLÁ FAMÍLIA! JÁ CONHECEM O NOVO TRADUTOR NACIONAL DE ANGOLA?* 🇦🇴

"A nossa língua, a nossa identidade." ✨

Acabou de ser lançada uma plataforma incrível e 100% gratuita dedicada a valorizar e preservar as línguas nacionais de Angola! 

Agora já podes:
✅ Traduzir por texto ou por voz entre Português e Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Ngangela, Fiote, Luvale e muito mais!
✅ Consultar o Dicionário Nacional oficial com significados culturais e pronúncia áudio.
✅ Ouvir Músicas Nacionais com a respetiva letra e tradução em Português no YouTube!
✅ Contribuir com novas palavras e expressões da tua terra para ensinar as próximas gerações.

📲 *Experimenta agora e divulga aos teus:*
👉 ${appUrl}

_De Cabinda ao Cunene, um só povo, muitas vozes! Passa a mensagem nos teus grupos._ ✊🏾❤️💛🖤`,
      shareUrlType: 'whatsapp',
    },
    {
      id: 'redes-sociais',
      category: 'redes',
      channelName: 'Instagram, Facebook & LinkedIn',
      icon: <Instagram className="w-4 h-4 text-pink-500" />,
      title: 'Publicação Completa para Redes Sociais',
      description: 'Post longo com estrutura épica de storytelling cultural, engajamento e valorização do património.',
      copyText: `🇦🇴 A NOSSA LÍNGUA. A NOSSA CULTURA. A NOSSA IDENTIDADE. 🇦🇴

Durante muito tempo sonhámos com uma ferramenta que unisse a tecnologia à riqueza das nossas línguas maternas. Hoje esse sonho é realidade com o lançamento do *Tradutor Nacional de Angola*.

Quantas vezes já quiseste saber o verdadeiro significado de uma expressão dos nossos mais velhos? Ou ensinar os teus filhos e amigos as palavras da tua província?

O Tradutor Nacional de Angola nasceu para resgatar, ensinar e celebrar a nossa herança bantu:

📖 *Dicionário de Línguas Nacionais*: Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Ngangela, Fiote, Luvale, Nyaneka e muito mais.
🎙️ *Tradução de Voz e Texto*: Ouve a pronúncia e aprende com notas de sabedoria ancestral.
🎵 *Músicas Nacionais com Tradução*: Ouve os clássicos angolanos no YouTube enquanto entendes verso por verso na tua língua!
🤝 *Comunidade Viva*: Qualquer cidadão pode sugerir termos e votar na precisão das traduções.

Visita agora e junta-te a este movimento de orgulho cultural:
🔗 ${appUrl}

Qual é a primeira palavra que vais traduzir hoje? Deixa nos comentários na tua língua nacional! 👇🏾

#Angola #LinguasNacionais #CulturaAngolana #Kimbundu #Umbundu #Kikongo #Cokwe #Kwanyama #OrgulhoAngolano #TradutorNacional`,
      hashtags: '#Angola #LinguasNacionais #CulturaAngolana',
    },
    {
      id: 'twitter-x',
      category: 'x-twitter',
      channelName: 'X (Twitter) & Threads',
      icon: <Twitter className="w-4 h-4 text-sky-400" />,
      title: 'Post Direto para X / Twitter',
      description: 'Texto conciso, forte e feito para viralizar e gerar retweets.',
      copyText: `🇦🇴 Conhecem o Tradutor Nacional de Angola?

Uma plataforma moderna para traduzir, aprender e preservar as línguas nacionais (Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, etc.).

Tem tradução por voz, dicionário colaborativo e letras de músicas traduzidas! 

🔗 ${appUrl}

RT para apoiar a nossa cultura! ✊🏾✨`,
      shareUrlType: 'twitter',
    },
    {
      id: 'imprensa-institucional',
      category: 'imprensa',
      channelName: 'Imprensa, Rádios & Escolas',
      icon: <Radio className="w-4 h-4 text-amber-500" />,
      title: 'Nota de Imprensa e Divulgação Institucional',
      description: 'Texto formal para radialistas, jornalistas, professores, estudantes universitários e ministérios.',
      copyText: `COMUNICADO DE IMPRENSA / DIVULGAÇÃO INSTITUCIONAL

ASSUNTO: LANÇAMENTO DA PLATAFORMA DIGITAL "TRADUTOR NACIONAL DE ANGOLA"

Luanda, Angola — Apresenta-se ao público o "Tradutor Nacional de Angola", uma iniciativa cívica e tecnológica orientada para a salvaguarda, tradução e difusão das línguas nacionais angolanas.

Com o lema "A nossa língua, a nossa identidade", o portal reúne um motor de tradução bidirecional (texto e voz), um repositório lexicográfico abrangente das variantes linguísticas (Kimbundu, Umbundu, Kikongo, Cokwe, Kwanyama, Ngangela, Fiote, Luvale e afins), bem como uma vertente inovadora de etnomusicologia com letras de canções históricas transcritas e traduzidas.

A plataforma privilegia a validação comunitária por especialistas, anciãos e falantes nativos através de um rigoroso sistema de moderação, garantindo fidelidade fonética e respeito pelo património etnolinguístico.

Convidam-se todos os órgãos de comunicação social, instituições de ensino superior, investigadores e cidadãos a conhecer e colaborar ativamente:
Endereço digital: ${appUrl}
Email de contacto: contacto@tradutornacional.ao

Pela preservação viva da identidade linguística angolana.`,
    },
    {
      id: 'status-stories',
      category: 'status',
      channelName: 'Status & Stories (Curto)',
      icon: <Smartphone className="w-4 h-4 text-indigo-400" />,
      title: 'Texto Rápido para Status de WhatsApp e Stories',
      description: 'Ideal para colocar na bio, no status de 24h ou em sticker de texto nos Stories.',
      copyText: `🇦🇴 Já podes traduzir Kimbundu, Umbundu, Kikongo, Cokwe e outras línguas de Angola no telemóvel!

👉 Entra no Tradutor Nacional: ${appUrl}
Valoriza a nossa língua e a nossa cultura! ❤️💛🖤`,
      shareUrlType: 'whatsapp',
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleShareWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleShareTwitter = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  };

  const activeItem = copies.find(c => c.category === activeCategory) || copies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 flex flex-col">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-stone-800 flex items-start justify-between gap-4 bg-stone-900/90 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Share2 className="w-4 h-4" />
              <span>Divulgação do Tradutor Nacional</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif-heading font-semibold text-white">
              Textos Prontos para Divulgar o Aplicativo
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Copie o texto ideal com um clique ou partilhe diretamente no WhatsApp e Redes Sociais.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none bg-stone-950/40">
          {copies.map((item) => (
            <button
              key={item.category}
              onClick={() => setActiveCategory(item.category)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === item.category
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.channelName}</span>
            </button>
          ))}
        </div>

        {/* Active Copy Card View */}
        <div className="p-6 space-y-5 flex-1">
          <div className="bg-stone-950/80 rounded-xl p-5 border border-stone-800 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>{activeItem.title}</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {activeItem.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeItem.id, activeItem.copyText)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    copiedId === activeItem.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                  }`}
                >
                  {copiedId === activeItem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                {activeItem.shareUrlType === 'whatsapp' && (
                  <button
                    onClick={() => handleShareWhatsApp(activeItem.copyText)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                    title="Partilhar diretamente no WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}

                {activeItem.shareUrlType === 'twitter' && (
                  <button
                    onClick={() => handleShareTwitter(activeItem.copyText)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 transition-colors"
                    title="Publicar no X"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Publicar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="relative">
              <pre className="w-full text-xs font-sans text-stone-200 bg-stone-900/90 p-4 rounded-lg border border-stone-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
                {activeItem.copyText}
              </pre>
            </div>

            {/* Quick tips */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Partilhar ajuda a preservar a língua e a cultura dos nossos antepassados.</span>
              </span>
              <span className="font-mono text-amber-400/80">Angola unida</span>
            </div>

          </div>

          {/* Quick link box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-stone-800/40 rounded-xl border border-stone-800 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Link Oficial do Aplicativo:</span>
              <code className="text-amber-300 font-mono bg-stone-900 px-2 py-0.5 rounded">
                {appUrl}
              </code>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(appUrl);
                setCopiedId('url-only');
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="text-stone-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold"
            >
              {copiedId === 'url-only' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Link copiado!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copiar apenas o link
                </span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
