import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Target, CheckCircle2, ArrowRight, Award, 
  Layers, Map, Users, AlertTriangle, ArrowLeft, Play, Zap, Cpu
} from 'lucide-react';

interface PitchGuideModalProps {
  onClose: () => void;
  onRunDemoStep: (stepNumber: number) => void;
  lang: 'ru' | 'uz';
}

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({
  onClose,
  onRunDemoStep,
  lang
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: "Питч для Жюри: Хакатон NEXUS30 (GovTech Кейс A)",
      subtitle: "«Система мониторинга занятости и маршрутизации молодёжи»",
      badge: "3-минутный сценарий защиты",
      content: (
        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3 bg-surface-2 rounded-xl border border-indigo-500/30">
            <h4 className="font-bold text-indigo-300 text-xs mb-1">🎯 Ключевой посыл для жюри:</h4>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Мы создали не просто статистический дашборд, а <strong>полноценный управленческий инструмент</strong> для хокимията района и лидеров махаллей («Ёшлар етакчиси»), закрывающий цикл от <em>выявления скрытой безработицы</em> до <em>гарантированного трудоустройства через Моноцентры</em>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-surface-2/80 border border-white/[0.06]">
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> 30% Соответствие проблеме
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Единая база 18–30 лет, ликвидация разрозненности данных махалли и ЦЗН.
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-2/80 border border-white/[0.06]">
              <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 30% Внедряемость
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Готов к интеграции с Soliq.uz, Mehnat.uz и моноцентрами «Ишга мархамат».
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-2/80 border border-white/[0.06]">
              <div className="text-indigo-400 font-bold text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 25% Качество прототипа
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                100% рабочий интерактив, живой таймлайн, карточки, фильтры, экспорт.
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-2/80 border border-white/[0.06]">
              <div className="text-yellow-400 font-bold text-xs flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> 15% Инновации
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ГИС Leaflet карта + Human-in-the-Loop предиктивный NEET триаж.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Шаг 1: Ситуационный дашборд района",
      subtitle: "Сводный мониторинг для Хокимията и Центра содействия занятости",
      badge: "Демо-шаг 1",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="text-[11px] leading-relaxed">
            <strong>Что говорить жюри:</strong> «При входе руководство района сразу видит объективную картину занятости: общее число молодёжи, долю официально занятых (найм/ИП), студентов и зону риска. Графики показывают распределение по отраслям экономики района».
          </p>
          <div className="p-2.5 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-0.5">
            <div className="text-indigo-300 font-bold">✓ Закрывает требование ТЗ №2:</div>
            <div className="text-slate-400">Обобщённый мониторинг по махалле и району, агрегированная картина.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(1);
              onClose();
            }}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-brand-linear hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-glow-brand transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Перейти к экрану Дашборда</span>
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
          <p className="text-[11px] leading-relaxed">
            <strong>Что говорить жюри:</strong> «Система автоматически помечает молодых людей без налоговых отчислений как кандидатов в NEET. Но согласно требованию GovTech, система <em>НЕ выносит автоматических решений</em> — статус верифицируется лидером махалли («Ёшлар етакчиси») после выездного обследования».
          </p>
          <div className="p-2.5 bg-rose-950/20 rounded-xl border border-rose-500/30 text-[11px] space-y-0.5 text-rose-200">
            <div className="text-rose-300 font-bold">✓ Закрывает требование ТЗ №3 и Ограничения:</div>
            <div className="text-slate-400">Статус «NEET» — это рекомендация к проверке, верификация через протокол в 1 клик.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(2);
              onClose();
            }}
            className="w-full py-2 bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
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
          <p className="text-[11px] leading-relaxed">
            <strong>Что говорить жюри:</strong> «Для каждого безработного рекомендательный модуль подбирает государственные меры: Моноцентр «Ишга Мархамат», IT-Park, субсидии «Ёшлар Дафтари». При назначении программы система сохраняет полную хронологию статусов в таймлайне профиля».
          </p>
          <div className="p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-[11px] space-y-0.5 text-emerald-200">
            <div className="text-emerald-300 font-bold">✓ Закрывает требования ТЗ №4 и №5:</div>
            <div className="text-slate-400">Модуль умных рекомендаций + история жизненного цикла статусов.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(3);
              onClose();
            }}
            className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Открыть Единый Реестр и Карточку</span>
          </button>
        </div>
      )
    },
    {
      title: "Шаг 4: ГИС-карта занятости района",
      subtitle: "Территориальная тепловая визуализация без раскрытия ПДн",
      badge: "Демо-шаг 4 (Бонус)",
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p className="text-[11px] leading-relaxed">
            <strong>Что говорить жюри:</strong> «Бонусный модуль: интерактивная Leaflet ГИС-карта махаллей Мирзо-Улугбекского района. Цветовая индикация сразу подсвечивает проблемные секторы с повышенной плотностью NEET (например, Олий Ҳиммат), позволяя адресно направлять ресурсы района».
          </p>
          <div className="p-2.5 bg-surface-2 rounded-xl border border-white/[0.08] text-[11px] space-y-0.5">
            <div className="text-indigo-300 font-bold">✓ Закрывает бонусное требование ТЗ №6:</div>
            <div className="text-slate-400">Агрегированная пространственная визуализация состояния занятости.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(4);
              onClose();
            }}
            className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Открыть Интерактивную ГИС Карту</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-1 w-full max-w-2xl rounded-2xl border border-white/[0.14] shadow-surface-modal p-5 space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">
                {slides[currentSlide].badge}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {slides[currentSlide].title}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-surface-3 transition-colors">✕</button>
        </div>

        {/* Slide Body */}
        <div>
          <div className="text-xs text-slate-400 mb-2.5 font-medium">{slides[currentSlide].subtitle}</div>
          {slides[currentSlide].content}
        </div>

        {/* Navigation Dots & Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
          
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => prev - 1)}
            className="px-3 py-1.5 rounded-lg bg-surface-2 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 border border-white/[0.08] flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Назад</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-indigo-400 w-5' : 'bg-surface-3 hover:bg-slate-600 w-1.5'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(prev => prev + 1)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 disabled:opacity-30 disabled:cursor-not-allowed font-semibold flex items-center gap-1 text-xs"
          >
            <span>Вперёд</span>
            <ArrowRight className="w-3 h-3" />
          </button>

        </div>

      </div>
    </div>
  );
};
