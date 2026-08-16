import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Target, CheckCircle2, ArrowRight, Award, 
  ArrowLeft, Play, Pause, Zap, Cpu, MapPin, Building2, Layers,
  RotateCcw
} from 'lucide-react';

interface PitchGuideModalProps {
  onClose: () => void;
  onRunDemoStep: (stepNumber: number) => void;
  lang: 'ru' | 'uz';
}

const AUTOPLAY_DURATION_SEC = 8;

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({
  onClose,
  onRunDemoStep,
  lang
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slidesRu = [
    {
      title: "Питч для Жюри: Хакатон NEXUS30 (GovTech Кейс A)",
      subtitle: "«Система мониторинга занятости и маршрутизации молодёжи»",
      badge: "3-минутный сценарий защиты",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 bg-surface-2 rounded-2xl border border-indigo-500/30">
            <h4 className="font-bold text-indigo-300 text-sm mb-1 flex items-center gap-1.5">
              <span>🎯 Ключевой посыл для жюри:</span>
            </h4>
            <p className="leading-relaxed text-slate-200">
              Мы создали не просто статистический дашборд, а <strong>полноценный управленческий инструмент</strong> для хокимията района и лидеров махаллей («Ёшлар етакчиси»), закрывающий весь цикл: от <em>выявления скрытой безработицы</em> до <em>маршрутизации в Моноцентры WorldSkills и трудоустройства</em>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '50ms' }}>
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> 30% Соответствие проблеме
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Единая база 18–30 лет, ликвидация разрозненности данных махалли и ЦЗН.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '100ms' }}>
              <div className="text-indigo-400 font-bold text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 30% Внедряемость
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Интеграция с Моноцентрами «Ишга Мархамат», IT-Park, Soliq.uz и Mehnat.uz.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '150ms' }}>
              <div className="text-purple-400 font-bold text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 25% Качество прототипа
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                100% живой интерактив, таймлайн статусов, двуязычность (RU/UZ), экспорт в Excel.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '200ms' }}>
              <div className="text-sky-400 font-bold text-xs flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> 15% Инновации
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                ГИС-карта кадастра 8 махаллей + Human-in-the-Loop предиктивный триаж.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Шаг 1: Вкладка «Главная / Обзор»",
      subtitle: "Простой и наглядный сводный мониторинг без перегруза",
      badge: "Демо-шаг 1",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Что говорить жюри:</strong> «На главной вкладке руководство видит чёткую картину: сколько всего молодёжи, кто работает, кто учится, а кто требует внимания. Все метрики динамически распределены по 8 махаллям».
          </p>
          <p>
            «Особая фишка — <strong>динамическая умная карточка "Главная задача"</strong>. Если инспектору нужно проверить статус граждан, она сигнализирует фиолетовым бейджем. Но как только проверки завершены (Zero Inbox), она превращается в зелёную карточку успеха. Это снижает стресс госслужащих!»
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 bg-surface-2 border border-white/[0.08] rounded-xl text-slate-300 text-[11px] leading-tight animate-card-cascade" style={{ animationDelay: '50ms' }}>
              <div className="font-bold mb-1 flex items-center gap-1.5 text-white"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Фокус на действии</div>
              Карточка «Ожидают проверки» с переходом в 1 клик.
            </div>
            <div className="p-2.5 bg-surface-2 border border-white/[0.08] rounded-xl text-slate-300 text-[11px] leading-tight animate-card-cascade" style={{ animationDelay: '100ms' }}>
              <div className="font-bold mb-1 flex items-center gap-1.5 text-white"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Мотивация (Zero Inbox)</div>
              Зелёный индикатор успеха при полном закрытии задач.
            </div>
          </div>

          <button
            onClick={() => {
              onRunDemoStep(1);
              onClose();
            }}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Показать жюри экран Обзора</span>
          </button>
        </div>
      )
    },
    {
      title: "Шаг 2: Human-in-the-Loop NEET Триаж",
      subtitle: "Выявление скрытой безработицы без ошибочных ярлыков",
      badge: "Демо-шаг 2 (Критический)",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Что говорить жюри:</strong> «Система автоматически помечает молодых людей без отчислений как кандидатов в NEET. Но согласно требованию GovTech, система <em>НЕ выносит решений автоматически</em> — статус верифицируется лидером махалли («Ёшлар етакчиси») после выездного обследования».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-1 text-slate-300 animate-card-cascade">
            <div className="text-white font-bold">✓ Закрывает требование ТЗ №3 и Ограничения:</div>
            <div>Статус «NEET» — это рекомендация к проверке, верификация через протокол в 1 клик с моментальным обновлением реестра.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(2);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Перейти к экрану NEET Триажа</span>
          </button>
        </div>
      )
    },
    {
      title: "Шаг 3: Маршрутизация & История статусов",
      subtitle: "Персонализированная траектория выхода из безработицы",
      badge: "Демо-шаг 3",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Что говорить жюри:</strong> «Для каждого безработного рекомендательный AI-модуль подбирает государственные меры: Моноцентр «Ишга Мархамат», IT-Park буткемп, субсидии «Ёшлар Дафтари». При назначении программы система сохраняет полную хронологию статусов в таймлайне профиля».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-1 text-slate-300 animate-card-cascade">
            <div className="text-indigo-300 font-bold">✓ Закрывает требования ТЗ №4 и №5:</div>
            <div>Модуль умных рекомендаций + история жизненного цикла статусов с печатью направлений.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(3);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Открыть Единый Реестр и Карточку</span>
          </button>
        </div>
      )
    },
    {
      title: "Шаг 4: Интерактивная ГИС-карта района v2.0",
      subtitle: "Векторная картография 8 махаллей, POI-инфраструктура и кинематографичная камера",
      badge: "Демо-шаг 4 (Технологический прорыв)",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Что говорить жюри:</strong> «Мы разработали высокоточную ГИС-карту Мирзо-Улугбекского района: реальные границы 8 махаллей, переключаемые слои («NEET Риск», «Занятость %», «Поддержка %»), кинематографичная 3-фазная камера и объекты инфраструктуры (Моноцентр, IT-Park Hub, ЦЗН) с расчетом пешей доступности для молодёжи».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-indigo-500/30 text-[11px] space-y-1 text-slate-200 animate-card-cascade">
            <div className="text-indigo-300 font-bold">✓ Закрывает бонусное требование ТЗ №6:</div>
            <div>Пространственная аналитика территории без раскрытия персональных данных граждан.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(4);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Открыть Интерактивную ГИС-Карту</span>
          </button>
        </div>
      )
    }
  ];

  const slidesUz = [
    {
      title: "Hay’at a’zolari uchun Pitch: NEXUS30 Xakatoni (GovTech)",
      subtitle: "«Yoshlar bandligi monitoringi va yo‘naltirish tizimi»",
      badge: "3 daqiqalik himoya ssenariysi",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 bg-surface-2 rounded-2xl border border-indigo-500/30">
            <h4 className="font-bold text-indigo-300 text-sm mb-1 flex items-center gap-1.5">
              <span>🎯 Hay’at uchun asosiy g‘oya:</span>
            </h4>
            <p className="leading-relaxed text-slate-200">
              Biz shunchaki statistika dashbordini emas, balki tuman hokimligi va mahalla yetakchilari uchun <strong>to‘liq boshqaruv tizimini</strong> yaratdik. Tizim <em>yashirin ishsizlikni aniqlashdan</em> boshlab <em>Monomarkazlar orqali kafolatli band qilishgacha</em> bo‘lgan jarayonni qamrab oladi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '50ms' }}>
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> 30% Muammoga moslik
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                18–30 yosh yagona bazasi, mahalla va ABM ma’lumotlari tarqoqligini bartaraf etish.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '100ms' }}>
              <div className="text-indigo-400 font-bold text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 30% Joriy etish imkoniyati
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                «Ishga marhamat» monomarkazlari, IT-Park, Soliq.uz va Mehnat.uz bilan integratsiya.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '150ms' }}>
              <div className="text-purple-400 font-bold text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 25% Prototip sifati
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                100% ishlaydigan interaktivlik, taymlayn, ikki tillilik (RU/UZ), Excel eksport.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] animate-card-cascade" style={{ animationDelay: '200ms' }}>
              <div className="text-sky-400 font-bold text-xs flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> 15% Innovatsiya
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                8 ta mahalla GIS-kadastr xaritasi + Human-in-the-Loop NEET triaji.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1-Qadam: «Bosh sahifa / Tahlil» bo‘limi",
      subtitle: "Aniq va tushunarli umumiy monitoring",
      badge: "Demo 1-qadam",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Hay’atga nima deyiladi:</strong> «Bosh sahifada rahbariyat eng muhim ko‘rsatkichlarni ko‘radi: jami yoshlar soni, bandlar, o‘qiyotganlar va e’tibor talab qiladigan toifa. Barchasi 8 ta mahalla kesimida taqsimlangan».
          </p>
          <p>
            «Asosiy ustunlik — <strong>dinamik «Asosiy vazifa» kartochkasi</strong>. Agar tekshirish vazifasi bo‘lsa, u binafsha belgi bilan yonadi. Tekshiruvlar yakunlangach (Zero Inbox), u yashil muvaffaqiyat kartochkasiga aylanadi. Bu davlat xodimi stressini kamaytiradi!»
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 bg-surface-2 border border-white/[0.08] rounded-xl text-slate-300 text-[11px] leading-tight animate-card-cascade" style={{ animationDelay: '50ms' }}>
              <div className="font-bold mb-1 flex items-center gap-1.5 text-white"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Tezkor harakat</div>
              «Ko‘rik kutilmoqda» kartochkasi orqali 1 bosishda o‘tish.
            </div>
            <div className="p-2.5 bg-surface-2 border border-white/[0.08] rounded-xl text-slate-300 text-[11px] leading-tight animate-card-cascade" style={{ animationDelay: '100ms' }}>
              <div className="font-bold mb-1 flex items-center gap-1.5 text-white"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Rag‘bat (Zero Inbox)</div>
              Vazifalar yopilganda yashil muvaffaqiyat ko‘rsatkichi.
            </div>
          </div>

          <button
            onClick={() => {
              onRunDemoStep(1);
              onClose();
            }}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Hay’atga Tahlil sahifasini ko‘rsatish</span>
          </button>
        </div>
      )
    },
    {
      title: "2-Qadam: Human-in-the-Loop NEET Triaji",
      subtitle: "Yashirin ishsizlikni xatolarsiz aniqlash",
      badge: "Demo 2-qadam (Muhim)",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Hay’atga nima deyiladi:</strong> «Tizim soliq to‘lovi bo‘lmagan yoshlarni avtomatik ravishda NEET nomzodi deb belgilaydi. Ammo GovTech talabiga binoan tizim <em>avtomatik qaror chiqarmaydi</em> — holat mahalla yetakchisining xonadonbay suhbatidan so‘ng tasdiqlanadi».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-1 text-slate-300 animate-card-cascade">
            <div className="text-white font-bold">✓ TZ 3-talabi va cheklovlariga javob beradi:</div>
            <div>«NEET» maqomi — bu ko‘rik uchun tavsiya, verifikatsiya 1 bosishda amalga oshiriladi.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(2);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>NEET Triaj sahifasiga o‘tish</span>
          </button>
        </div>
      )
    },
    {
      title: "3-Qadam: Yo‘naltirish va Holatlar tarixi",
      subtitle: "Ishsizlikdan chiqarishning individual trayektoriyasi",
      badge: "Demo 3-qadam",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Hay’atga nima deyiladi:</strong> «Har bir ishsiz uchun tavsiya moduli davlat ko‘mak choralarini tanlab beradi: «Ishga marhamat» monomarkazi, IT-Park, «Yoshlar daftari» subsidiyalari. Dastur biriktirilganda profilda to‘liq o‘zgarishlar tarixi saqlanadi».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-1 text-slate-300 animate-card-cascade">
            <div className="text-indigo-300 font-bold">✓ TZ 4 va 5-talablarini yopadi:</div>
            <div>Aqlli tavsiyalar moduli + holatlar hayotiy sikli xronologiyasi va yo‘llanma chop etish.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(3);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Yoshlar ro‘yxati va Kartochkani ochish</span>
          </button>
        </div>
      )
    },
    {
      title: "4-Qadam: Tuman bandlik GIS-xaritasi v2.0",
      subtitle: "8 ta mahalla vektorli kartografiyasi, infratuzilma va kinematik kamera",
      badge: "Demo 4-qadam (Innovatsiya)",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Hay’atga nima deyiladi:</strong> «Biz Mirzo Ulug‘bek tumanining yuqori aniqlikdagi GIS-xaritasini ishlab chiqdik: 8 ta mahalla chegaralari, qatlamlar («NEET Xavfi», «Bandlik %», «Qo‘llab-quvvatlash»), 3-bosqichli kinematik kamera va yoshlar uchun piyoda masofani hisoblovchi davlat infratuzilmasi obyektlari (Monomarkaz, IT-Park Hub, ABKM)».
          </p>
          <div className="p-3 bg-surface-2 rounded-xl border border-indigo-500/30 text-[11px] space-y-1 text-slate-200 animate-card-cascade">
            <div className="text-indigo-300 font-bold">✓ TZ 6-bonus talabini bajaradi:</div>
            <div>Shaxsiy ma’lumotlarni oshkor qilmagan holda hududiy fazoviy tahlil.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(4);
              onClose();
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.99] group"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Interaktiv GIS-Xaritani ochish</span>
          </button>
        </div>
      )
    }
  ];

  const slides = lang === 'ru' ? slidesRu : slidesUz;

  // Slide navigation with direction handling
  const goToSlide = (newIndex: number) => {
    if (newIndex === currentSlide) return;
    setDirection(newIndex > currentSlide ? 'right' : 'left');
    setCurrentSlide(newIndex);
    setProgress(0);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else if (isAutoPlaying) {
      goToSlide(0);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  // Keyboard arrow listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isAutoPlaying]);

  // Autoplay timer with progress bar
  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(0);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const intervalMs = 100;
    const step = 100 / ((AUTOPLAY_DURATION_SEC * 1000) / intervalMs);

    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isAutoPlaying, currentSlide]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 w-full max-w-2xl rounded-2xl border border-white/[0.14] shadow-surface-modal p-6 space-y-4 cursor-default max-h-[92vh] flex flex-col justify-between relative overflow-hidden"
      >
        
        {/* Top Autoplay Progress Line Indicator */}
        {isAutoPlaying && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-3 overflow-hidden z-20">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">
                  {slides[currentSlide].badge}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({currentSlide + 1} / {slides.length})
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                {slides[currentSlide].title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Play Toggle Button */}
            <button
              onClick={() => setIsAutoPlaying(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAutoPlaying
                  ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-sm shadow-indigo-500/25'
                  : 'bg-surface-2 hover:bg-surface-3 text-slate-300 border-white/[0.08]'
              }`}
              title={lang === 'ru' ? 'Включить авто-воспроизведение слайдов' : 'Avtomatik taqdimotni yoqish'}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'ru' ? 'Пауза' : 'To‘xtatish'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'ru' ? 'Автоплей' : 'Avto'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-surface-3 border border-transparent hover:border-white/[0.08] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Animated Slide Content Box */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-xs text-slate-400 mb-3 font-medium">
            {slides[currentSlide].subtitle}
          </div>
          
          <div 
            key={`${currentSlide}-${lang}`}
            className={direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
          >
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs z-10">
          
          {/* Back Button */}
          <button
            disabled={currentSlide === 0}
            onClick={handlePrev}
            className="px-3.5 py-2 rounded-xl bg-surface-2 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 border border-white/[0.06] flex items-center gap-1.5 transition-colors font-medium active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Назад' : 'Orqaga'}</span>
          </button>

          {/* Interactive Slide Dots with Active Pill */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500 w-7 shadow-sm shadow-indigo-500/50' 
                      : 'bg-surface-3 w-2 hover:bg-slate-500'
                  }`}
                  title={`Слайд ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            disabled={currentSlide === slides.length - 1}
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-500 font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            <span>{lang === 'ru' ? 'Вперёд' : 'Oldinga'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
