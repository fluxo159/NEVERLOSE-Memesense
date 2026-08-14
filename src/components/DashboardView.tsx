import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { AlertTriangle, ArrowRight, ShieldCheck, CheckCircle, Sparkles, MapPin, Building, GraduationCap, Briefcase } from 'lucide-react';

interface DashboardViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onNavigateTab: (tab: any) => void;
  onOpenProfile: (youth: YouthProfile) => void;
}

const donutColors = ['#10B981', '#6366F1', '#06B6D4', '#8B5CF6', '#F59E0B', '#F43F5E', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  youthList,
  selectedMakhalla,
  userRole,
  lang,
  onNavigateTab,
  onOpenProfile
}) => {
  const statusCounts = {
    'Заняты (найм)': youthList.filter(y => y.employment_status === 'занят').length,
    'Бизнес / ИП': youthList.filter(y => y.employment_status === 'предприниматель').length,
    'Обучаются (ВУЗ/Колледж)': youthList.filter(y => y.employment_status === 'обучается').length,
    'Направлены на обучение': youthList.filter(y => y.employment_status === 'направлен на обучение').length,
    'Безработные': youthList.filter(y => y.employment_status === 'безработный' && !y.is_neet).length,
    'NEET (Зона риска)': youthList.filter(y => y.is_neet).length,
    'Не уточнено': youthList.filter(y => y.employment_status === 'не уточнено').length,
  };

  const donutData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  })).filter(d => d.value > 0);

  const mahallaBarData = MAKHALLAS_LIST.map(m => {
    const listInM = youthList.filter(y => y.makhalla === m.name);
    return {
      name: m.name.replace('Буюк Ипак Йўли', 'Б. Ипак').replace('Олий Ҳиммат', 'Олий Ҳ.'),
      fullName: m.name,
      заняты: listInM.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length,
      обучаются: listInM.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length,
      neet: listInM.filter(y => y.is_neet).length,
      total: listInM.length
    };
  });

  const attentionRequired = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Context for Officials */}
      <div className="bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-surface-1 via-surface-2 to-surface-1">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Оперативный ситуационный дашборд' : 'Тезкор вазият дашборди'}
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {selectedMakhalla === 'all' ? (lang === 'ru' ? 'Весь район' : 'Туман бўйича') : selectedMakhalla}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ru'
                ? 'Единая база данных для координации занятости, предиктивного выявления категории NEET и адресной помощи молодёжи.'
                : 'Ёшлар бандлиги мониторинги ва давлат дастурларига йўналтиришнинг ягона платформаси.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('triage')}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex-shrink-0 shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{lang === 'ru' ? 'К проверке NEET' : 'NEET текширувга ўтиш'}</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Status Breakdown (Donut) */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {lang === 'ru' ? 'Структура занятости' : 'Бандлик таркиби'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ru' ? 'Распределение всей молодёжи по статусам' : 'Ҳолатлар бўйича тақсимот'}
                </p>
              </div>
              <span className="text-[11px] text-slate-300 font-semibold bg-surface-2 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                {youthList.length} {lang === 'ru' ? 'профилей' : 'профил'}
              </span>
            </div>

            <div className="h-60 relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} stroke="#08090C" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                    labelStyle={{ color: '#818cf8', fontWeight: 700, marginBottom: '2px' }}
                    contentStyle={{ 
                      backgroundColor: '#0E1117', 
                      borderColor: 'rgba(255, 255, 255, 0.12)', 
                      borderRadius: '12px', 
                      color: '#ffffff', 
                      fontSize: '11px',
                      boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.8)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white tracking-tight">{youthList.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">{lang === 'ru' ? 'человек' : 'киши'}</span>
              </div>
            </div>
          </div>

          {/* Clean Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] text-xs">
            {donutData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-300 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: donutColors[idx % donutColors.length] }}></span>
                  <span className="truncate text-slate-400">{entry.name}</span>
                </div>
                <span className="font-bold text-white ml-2">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Mahalla Comparative Bar Chart */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {lang === 'ru' ? 'Мониторинг по махаллям' : 'Маҳаллалар кесимида'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ru' ? 'Соотношение занятых, учащихся и группы риска' : 'Бандлик ва хавф гуруҳи'}
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('map')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>{lang === 'ru' ? 'Открыть ГИС' : 'Харита'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mahallaBarData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <RechartsTooltip 
                    itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                    labelStyle={{ color: '#818cf8', fontWeight: 700, marginBottom: '2px' }}
                    contentStyle={{ 
                      backgroundColor: '#0E1117', 
                      borderColor: 'rgba(255, 255, 255, 0.12)', 
                      borderRadius: '12px', 
                      color: '#ffffff', 
                      fontSize: '11px',
                      boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.8)',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="заняты" fill="#10B981" stackId="a" name={lang === 'ru' ? 'Заняты' : 'Банд'} />
                  <Bar dataKey="обучаются" fill="#06B6D4" stackId="a" name={lang === 'ru' ? 'Обучаются' : 'Ўқишда'} />
                  <Bar dataKey="neet" fill="#F43F5E" stackId="a" radius={[3, 3, 0, 0]} name="NEET (Риск)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Мирзо-Улугбекский район: 8 секторов</span>
            <span className="text-emerald-400 font-semibold">Средняя занятость: 87.2%</span>
          </div>
        </div>

      </div>

      {/* Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Urgent NEET feed */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-5 border border-rose-500/20 shadow-surface-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {lang === 'ru' ? 'Очередь выездной верификации NEET' : 'Текширув кутаётган номзодлар'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('triage')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{lang === 'ru' ? 'Все на проверке' : 'Барчаси'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {attentionRequired.map(youth => (
              <div
                key={youth.id}
                onClick={() => onOpenProfile(youth)}
                className="bg-surface-2 hover:bg-surface-3 p-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-3 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-indigo-400 flex-shrink-0">
                    {youth.age}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-slate-300">📍 {youth.makhalla}</span>
                      <span>•</span>
                      <span>{youth.education}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                    {lang === 'ru' ? 'На проверке' : 'Текширувда'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Routing Shortcuts */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-5 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">
              {lang === 'ru' ? 'Государственные каналы поддержки' : 'Давлат дастурлари'}
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              {lang === 'ru' ? 'Программы маршрутизации безработной молодёжи' : 'Ишсиз ёшларни йўналтириш йўналишлари'}
            </p>

            <div className="space-y-2.5">
              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">Моноцентр «Ишга Мархамат»</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">3-месячные курсы рабочих специальностей</div>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  WorldSkills
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">IT-Park & «IT-Bilim»</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Курсы веб-разработки + субсидия на технику</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  IT-Ваучер
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">Фонд «Ёшлар Дафтари»</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Субсидия на оборудование и инструменты</div>
                </div>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                  Грант
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex justify-between items-center text-[10px] text-slate-500">
            <span>Интеграция: Soliq.uz / Mehnat.uz</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> API Sync OK
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
