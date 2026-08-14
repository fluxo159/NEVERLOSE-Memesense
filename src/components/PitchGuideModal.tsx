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
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 bg-gov-950/60 rounded-2xl border border-cyan-500/30">
            <h4 className="font-bold text-cyan-300 text-sm mb-1">🎯 Ключевой посыл для жюри:</h4>
            <p className="leading-relaxed">
              Мы создали не просто статистический дашборд, а <strong>полноценный управленческий инструмент</strong> для хокимията района и лидеров махаллей («Ёшлар етакчиси»), закрывающий цикл от <em>выявления скрытой безработицы</em> до <em>гарантированного трудоустройства через Моноцентры</em>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> 30% Соответствие проблеме
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Единая база 18–30 лет, ликвидация разрозненности данных махалли и ЦЗН.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> 30% Внедряемость
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Готов к интеграции с Soliq.uz, Mehnat.uz и моноцентрами «Ишга мархамат».
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-purple-400 font-bold text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 25% Качество прототипа
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                100% рабочий интерактив, живой таймлайн, карточки, фильтры, экспорт.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-yellow-400 font-bold text-xs flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> 15% Инновации
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                ГИС-тепловая карта района + Human-in-the-Loop предиктивный NEET триаж.
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
          <p>
            <strong>Что говорить жюри:</strong> «При входе руководство района сразу видит объективную картину занятости: общее число молодёжи, долю официально занятых (найм/ИП), студентов и зону риска. Графики показывают распределение по отраслям экономики района».
          </p>
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-[11px] space-y-1">
            <div className="text-cyan-300 font-bold">✓ Закрывает требование ТЗ №2:</div>
            <div>Обобщённый мониторинг по махалле и району, агрегированная картина.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(1);
              onClose();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-gov-600 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Play className="w-4 h-4" />
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
          <p>
            <strong>Что говорить жюри:</strong> «Система автоматически помечает молодых людей без налоговых отчислений как кандидатов в NEET. Но согласно требованию GovTech, система <em>НЕ выносит автоматических решений</em> — статус верифицируется лидером махалли («Ёшлар етакчиси») после выездного обследования».
          </p>
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40 text-[11px] space-y-1 text-rose-200">
            <div className="text-rose-300 font-bold">✓ Закрывает требование ТЗ №3 и Ограничения:</div>
            <div>Статус «NEET» — это рекомендация к проверке, верификация через протокол в 1 клик.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(2);
              onClose();
            }}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Play className="w-4 h-4" />
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
            <strong>Что говорить жюри:</strong> «Для каждого безработного рекомендательный модуль подбирает государственные меры: Моноцентр «Ишга Мархамат», IT-Park, субсидии «Ёшлар Дафтари». При назначении программы система сохраняет полную хронологию статусов в таймлайне профиля».
          </p>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-[11px] space-y-1 text-emerald-200">
            <div className="text-emerald-300 font-bold">✓ Закрывает требования ТЗ №4 и №5:</div>
            <div>Модуль умных рекомендаций + история жизненного цикла статусов.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(3);
              onClose();
            }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Play className="w-4 h-4" />
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
          <p>
            <strong>Что говорить жюри:</strong> «Бонусный модуль: интерактивная схема махаллей Мирзо-Улугбекского района. Цветовая индикация сразу подсвечивает проблемные секторы с повышенной плотностью NEET (например, Олий Ҳиммат), позволяя адресно направлять ресурсы района».
          </p>
          <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/40 text-[11px] space-y-1 text-cyan-200">
            <div className="text-cyan-300 font-bold">✓ Закрывает бонусное требование ТЗ №6:</div>
            <div>Агрегированная пространственная визуализация состояния занятости.</div>
          </div>
          <button
            onClick={() => {
              onRunDemoStep(4);
              onClose();
            }}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Play className="w-4 h-4" />
            <span>Открыть Интерактивную Карту</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
                {slides[currentSlide].badge}
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                {slides[currentSlide].title}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Slide Body */}
        <div>
          <div className="text-xs text-slate-400 mb-3">{slides[currentSlide].subtitle}</div>
          {slides[currentSlide].content}
        </div>

        {/* Navigation Dots & Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => prev - 1)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(prev => prev + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-500 font-semibold flex items-center gap-1 shadow"
          >
            <span>Вперёд</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
