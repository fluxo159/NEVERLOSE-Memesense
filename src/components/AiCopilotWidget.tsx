import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, X, Shield, FileText, MapPin, BarChart3, Coins, User, ArrowUpRight, Search, Zap } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  lang: 'ru' | 'uz';
  onHighlightMahallas?: (mahallas: string[]) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenYouthModal?: (youthId: string) => void;
  onSelectMahalla?: (mahalla: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: any;
}

export const AiCopilotWidget: React.FC<Props> = ({
  lang,
  onHighlightMahallas,
  onNavigateTab,
  onOpenYouthModal,
  onSelectMahalla
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getWelcomeText = (l: 'ru' | 'uz') => {
    if (l === 'uz') {
      return `<b>Ассалому алайкум! Мен Мирзо Улуғбек тумани Ҳокимиятининг суверен ИИ-Аналитигиман.</b>\n\n` +
        `Мен ёпиқ локал контурда (On-Premise) ишлайман ва ёшлар бандлиги бўйича жонли базани реал вақтда таҳлил қиламан.\n\n` +
        `<b>Менинг асосий имкониятларим:</b>\n` +
        `• <b>Маҳаллалар ва NEET таҳлили:</b> муаммоли ҳудудларни аниқлайман, бандлик даражасини ҳисоблайман ва харитада кўрсатаман.\n` +
        `• <b>Ҳокимга расмий билдиришнома:</b> туман кўрсаткичлари бўйича тайёр хизмат хати ва ҳисобот шакллантираман.\n` +
        `• <b>Субсидия квоталарини тақсимлаш:</b> «Ёшлар дафтари» жамғармаси квоталарини (Мономарказ, IT-грантлар, 25 млн сўмлик субсидиялар) ҳисоблаб бераман.\n` +
        `• <b>Мутахассислар ва фуқароларни излаш:</b> Ф.И.О, ID, касби ёки кўникмалари (1С, Python, таъмирлаш) бўйича топиб, профилини очаман.\n` +
        `• <b>NEET триаж ва хавф омиллари:</b> ишсизлик сабабларини таҳлил қиламан ва етакчиларга кўрсатма бераман.\n` +
        `• <b>ЗРУ-547 хавфсизлик стандарти:</b> шахсга доир маълумотлар ҳимояси бўйича тушунтириш бераман.\n\n` +
        `<i>Юқоридаги тезкор тугмалардан бирини танланг ёки саволингизни қуйидаги сатрга ёзинг.</i>`;
    }
    return `<b>Здравствуйте! Я локальный суверенный ИИ-Аналитик Хокимията Мирзо-Улугбекского района.</b>\n\n` +
      `Я работаю на базе закрытого контура (On-Premise) и анализирую актуальный реестр молодёжи в реальном времени.\n\n` +
      `<b>Что я умею делать:</b>\n` +
      `• <b>Анализ махаллей и очагов NEET:</b> выявляю проблемные зоны, рассчитываю уровень занятости и подсвечиваю махалли на карте.\n` +
      `• <b>Служебная записка Хокиму:</b> автоматически формирую официальный отчёт установленного образца с ключевыми метриками района.\n` +
      `• <b>Распределение субсидий:</b> рассчитываю квоты фонда «Ёшлар Дафтари» (Моноцентр, IT-гранты, инструмент до 25 млн).\n` +
      `• <b>Поиск граждан и специалистов:</b> нахожу людей в базе по Ф.И.О, ID, специальности или навыкам (1С, Python, автоэлектрика) и открываю их карточки.\n` +
      `• <b>Факторный NEET-триаж:</b> провожу глубокий скоринг причин безработицы и даю рекомендации лидерам махаллей.\n` +
      `• <b>Справка по ЗРУ-547:</b> консультирую по защите персональных данных и локальной безопасности.\n\n` +
      `<i>Выберите быструю кнопку сверху или задайте любой интересующий вас вопрос в поле ввода ниже.</i>`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: getWelcomeText(lang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Click outside and ESC key listeners to close chat
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Update initial message if language changes and chat hasn't started yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm1') {
        return [{
          ...prev[0],
          text: getWelcomeText(lang)
        }];
      }
      return prev;
    });
  }, [lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAi(q, lang);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: res.action
      };
      setMessages(prev => [...prev, aiMsg]);

      // Automatically execute actions if needed
      if (res.action) {
        if (res.action.type === 'HIGHLIGHT_MAHALLAS' && res.action.mahallas && onHighlightMahallas) {
          onHighlightMahallas(res.action.mahallas);
        }
        if (res.action.mahalla && onSelectMahalla) {
          onSelectMahalla(res.action.mahalla);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: lang === 'uz'
            ? 'Сервер билан алоқа ўрнатишда хатолик юз берди.'
            : 'Ошибка связи с локальным ИИ-сервером.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = lang === 'uz' ? [
    { icon: BarChart3, label: 'Маҳаллалар таҳлили', query: 'Қайси маҳаллаларда NEET хавфи энг юқори?' },
    { icon: FileText, label: 'Ҳокимга ҳисобот', query: 'Ҳокимга расмий хизмат хати ва ҳисобот шакллантириш' },
    { icon: Coins, label: 'Субсидия квоталари', query: 'Ёшлар дафтари бўйича қандай чоралар тавсия этилади?' },
    { icon: Zap, label: 'NEET Триаж', query: 'NEET хавф гуруҳи омиллари ва демографиясини таҳлил қил' },
    { icon: Search, label: 'IT мутахассислари', query: 'Тизимдан IT ва дастурлаш кўникмасига эга ёшларни топ' },
    { icon: Shield, label: 'ЗРУ-547 хавфсизлик', query: 'Тизимда шахсга доир маълумотлар ва ЗРУ-547 талаблари қандай ҳимояланган?' }
  ] : [
    { icon: BarChart3, label: 'Анализ махаллей', query: 'В каких махаллях самый высокий уровень риска NEET?' },
    { icon: FileText, label: 'Служебная записка', query: 'Сформировать служебную записку для хокима района' },
    { icon: Coins, label: 'Квоты субсидий', query: 'Какие программы поддержки приоритетны для выделения бюджета?' },
    { icon: Zap, label: 'NEET Триаж', query: 'Глубокий анализ группы риска NEET и ключевые факторы' },
    { icon: Search, label: 'Поиск: IT / 1C', query: 'Найди в базе специалистов со знанием Python, 1C или сервиса' },
    { icon: Shield, label: 'Безопасность ЗРУ-547', query: 'Как обеспечивается защита персональных данных по закону ЗРУ-547?' }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 p-1.5 pr-3 bg-surface-1/95 hover:bg-surface-2 text-slate-200 hover:text-white rounded-xl border border-white/[0.12] hover:border-white/[0.22] backdrop-blur-xl shadow-surface-card hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 ease-out group cursor-pointer ${
          isOpen ? 'opacity-0 scale-75 pointer-events-none translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-surface-2 border border-white/[0.08] flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <Bot className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
        </div>
        <span className="font-semibold text-xs text-slate-200 group-hover:text-white transition-colors">
          {lang === 'uz' ? 'AI-Маслаҳатчи' : 'AI-Советник'}
        </span>
        <span className="text-[10px] bg-surface-2 text-slate-400 border border-white/[0.08] px-1.5 py-0.5 rounded font-mono">
          On-Premise
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      </button>

      {/* Chat Window with Click-Outside Ref and Smooth Animations */}
      <div
        ref={chatRef}
        className={`fixed bottom-6 right-6 z-50 w-96 sm:w-[460px] h-[580px] bg-surface-1/98 border border-white/[0.12] backdrop-blur-2xl rounded-2xl shadow-surface-modal flex flex-col overflow-hidden ring-1 ring-white/10 transition-all duration-300 ease-out origin-bottom-right transform ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto shadow-2xl'
            : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
        }`}
      >
          {/* Header */}
          <div className="p-3.5 bg-surface-2/90 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-surface-3 border border-white/[0.08] rounded-xl text-indigo-400 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-xs text-white">
                    {lang === 'uz' ? 'AI-Советник Ҳокимияти' : 'AI-Советник Хокимията'}
                  </h3>
                  <span className="flex items-center text-[10px] text-emerald-400 bg-surface-3 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                    <Shield className="w-2.5 h-2.5 mr-0.5" /> ЗРУ-547
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {lang === 'uz' ? 'Локал суверен интеллект (RAG & NLP)' : 'Локальный суверенный ИИ (RAG & NLP)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-3 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-surface-2/40 border-b border-white/[0.06] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="text-[11px] font-medium text-slate-300 hover:text-white bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 group cursor-pointer"
                >
                  <IconComp className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-surface-2 text-slate-200 border border-white/[0.08] rounded-bl-none shadow-sm'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>') }}
                  />

                  {/* Interactive Action Triggers */}
                  {m.action && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center flex-wrap gap-2">
                      {m.action.type === 'HIGHLIGHT_MAHALLAS' && onHighlightMahallas && (
                        <button
                          onClick={() => onHighlightMahallas(m.action.mahallas || [])}
                          className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1.5 bg-surface-3 hover:bg-indigo-600/30 border border-white/[0.12] px-2.5 py-1 rounded-lg transition-all"
                        >
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{lang === 'uz' ? 'Харитада кўрсатиш' : 'Показать на карте'}</span>
                        </button>
                      )}

                      {m.action.type === 'OPEN_YOUTH' && m.action.youthId && onOpenYouthModal && (
                        <button
                          onClick={() => onOpenYouthModal(m.action.youthId)}
                          className="text-xs text-emerald-300 hover:text-white flex items-center space-x-1.5 bg-surface-3 hover:bg-emerald-600/30 border border-white/[0.12] px-2.5 py-1 rounded-lg transition-all"
                        >
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>{lang === 'uz' ? 'Фуқаро профилини очиш' : 'Открыть карточку гражданина'}</span>
                        </button>
                      )}

                      {m.action.tab && onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab(m.action.tab)}
                          className="text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 bg-surface-3 hover:bg-surface-4 border border-white/[0.12] px-2.5 py-1 rounded-lg transition-all"
                        >
                          <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                          <span>{lang === 'uz' ? 'Бўлимга ўтиш' : 'Перейти в раздел'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2.5 bg-surface-2/60 rounded-xl border border-white/[0.06] animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{lang === 'uz' ? 'Локал ИИ маълумотларни таҳлил қилмоқда...' : 'Локальный ИИ анализирует базу данных...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-surface-2/60 border-t border-white/[0.08]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'uz' ? 'Савол, қидирув ёки буйруқни ёзинг...' : 'Задайте вопрос, запрос поиска или команду...'}
                className="flex-1 bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
    </>
  );
};
