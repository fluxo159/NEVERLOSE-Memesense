import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { ArrowRight } from 'lucide-react';
import { t } from '../data/translations';

interface DashboardViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onNavigateTab: (tab: any) => void;
  onOpenProfile: (youth: YouthProfile) => void;
}

const statusColors = ['#10B981', '#8B5CF6', '#06B6D4', '#3B82F6', '#F59E0B', '#F43F5E', '#64748B'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  youthList,
  selectedMakhalla,
  userRole,
  lang,
  onNavigateTab,
  onOpenProfile
}) => {
  const tr = t[lang];

  const statusCounts = {
    [tr.dashLegendEmployed]: youthList.filter(y => y.employment_status === 'занят').length,
    [tr.dashLegendBusiness]: youthList.filter(y => y.employment_status === 'предприниматель').length,
    [tr.dashLegendStudy]: youthList.filter(y => y.employment_status === 'обучается').length,
    [tr.dashLegendCourses]: youthList.filter(y => y.employment_status === 'направлен на обучение').length,
    [tr.dashLegendUnemployed]: youthList.filter(y => y.employment_status === 'безработный' && !y.is_neet).length,
    [tr.dashLegendNeetPending]: youthList.filter(y => y.is_neet).length,
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
      [tr.dashChartEmployed]: listInM.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length,
      [tr.dashChartStudying]: listInM.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length,
      [tr.dashChartNeet]: listInM.filter(y => y.is_neet).length,
      total: listInM.length
    };
  });

  const priorityVisitProfiles = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Status Breakdown Donut */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">
                {tr.dashEmploymentStructure}
              </h3>
              <span className="text-xs text-cyan-300 font-semibold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                {youthList.length} {tr.dashInRegistry}
              </span>
            </div>

            <div className="h-72 relative my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} stroke="rgba(15,23,42,0.9)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}
                    contentStyle={{ 
                      backgroundColor: '#151922', 
                      borderColor: 'rgba(255, 255, 255, 0.08)', 
                      borderRadius: '12px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{youthList.length}</span>
                <span className="text-xs text-slate-400">{tr.dashPersonShort}</span>
              </div>
            </div>
          </div>

          {/* Clean Human Legend */}
          <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs">
            {donutData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[idx % statusColors.length] }}></span>
                  <span className="truncate text-xs">{entry.name}</span>
                </div>
                <span className="font-bold text-white ml-2">{entry.value} {tr.kpiPersons}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Mahalla Comparative Bar Chart */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl px-6 pt-6 pb-8 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">
                  {tr.dashMakhallaSituation}
                </h3>
                <span className="hidden sm:inline-block text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {tr.dashAvgEmployment}
                </span>
              </div>
              <button 
                onClick={() => onNavigateTab('map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors shrink-0"
              >
                <span>{tr.dashOpenMap}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 min-h-[256px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mahallaBarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#cbd5e1" 
                    fontSize={12} 
                    fontWeight={500} 
                    interval={0} 
                    angle={-25} 
                    textAnchor="end"
                    tick={{ fill: '#cbd5e1' }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    labelStyle={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}
                    contentStyle={{ 
                      backgroundColor: '#151922', 
                      borderColor: 'rgba(255, 255, 255, 0.08)', 
                      borderRadius: '12px', 
                      color: '#ffffff', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }} />
                  <Bar dataKey={tr.dashChartEmployed} fill="#10B981" stackId="a" />
                  <Bar dataKey={tr.dashChartStudying} fill="#06B6D4" stackId="a" />
                  <Bar dataKey={tr.dashChartNeet} fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Action Row: Priority visits & quick route */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Priority Visits */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-base font-bold text-white">
                {lang === 'ru' ? 'Кого необходимо посетить в первую очередь' : 'Биринчи навбатда ўрганиладиган ёшлар'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('triage')}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <span>{lang === 'ru' ? 'Все на проверке' : 'Барчаси'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityVisitProfiles.map(youth => (
              <div
                key={youth.id}
                onClick={() => onOpenProfile(youth)}
                className="bg-surface-2 p-4 rounded-xl border border-white/[0.08] hover:border-rose-500/30 cursor-pointer flex items-center justify-between gap-3 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-3 border border-white/[0.04] flex items-center justify-center font-bold text-sm text-cyan-400 flex-shrink-0">
                    {youth.age}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-slate-300">📍 {youth.makhalla}</span>
                      <span>•</span>
                      <span>{youth.education}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold whitespace-nowrap">
                    {lang === 'ru' ? 'Требует визита' : 'Кўрик зарур'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Where to route */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {lang === 'ru' ? 'Куда можно направить человека' : 'Қайси дастурларга йўналтириш мумкин'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ru' ? 'Бесплатные государственные возможности' : 'Бепул давлат ёрдами имкониятлари'}
            </p>

            <div className="space-y-3">
              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="text-sm font-bold text-white">{lang === 'ru' ? 'Моноцентр «Ишга Мархамат»' : '«Ишга марҳамат» мономаркази'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lang === 'ru' ? '24 рабочие специальности + стипендия' : '24 та касб-ҳунар + стипендия'}</div>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {lang === 'ru' ? 'Обучение' : 'Таълим'}
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="text-sm font-bold text-white">IT-Park & IT-Bilim</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lang === 'ru' ? 'Курсы веб-разработки + субсидия на ноутбук' : 'IT-курслар + ноутбук учун субсидия'}</div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {lang === 'ru' ? 'IT-Ваучер' : 'IT-Ваучер'}
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="text-sm font-bold text-white">{lang === 'ru' ? 'Фонд «Ёшлар Дафтари»' : '«Ёшлар дафтари» жамғармаси'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lang === 'ru' ? 'Гранты на оборудование для открытия своего дела' : 'Тадбиркорлик ва ускуналар учун грантлар'}</div>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  {lang === 'ru' ? 'Субсидия' : 'Субсидия'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
