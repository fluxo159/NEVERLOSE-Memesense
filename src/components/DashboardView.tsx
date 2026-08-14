import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { AlertTriangle, TrendingUp, CheckCircle, ArrowRight, ShieldCheck, HelpCircle, FileText, UserCheck } from 'lucide-react';

interface DashboardViewProps {
  youthList: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onNavigateTab: (tab: any) => void;
  onOpenProfile: (youth: YouthProfile) => void;
}

const COLORS = {
  employed: '#10B981',     // emerald
  studying: '#06B6D4',     // cyan
  unemployed: '#F59E0B',   // amber
  training: '#3B82F6',     // blue
  business: '#8B5CF6',     // purple
  unspecified: '#64748B',  // slate
  neet: '#F43F5E',         // rose
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  youthList,
  selectedMakhalla,
  userRole,
  lang,
  onNavigateTab,
  onOpenProfile
}) => {
  // Status breakdown data for Donut chart
  const statusCounts = {
    'Заняты (найм)': youthList.filter(y => y.employment_status === 'занят').length,
    'Предприниматели / ИП': youthList.filter(y => y.employment_status === 'предприниматель').length,
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

  const donutColors = ['#10B981', '#8B5CF6', '#06B6D4', '#3B82F6', '#F59E0B', '#F43F5E', '#64748B'];

  // Sector Breakdown
  const sectorMap: { [key: string]: number } = {};
  youthList.forEach(y => {
    if (y.activity_type && y.activity_type !== 'нет деятельности' && y.activity_type !== 'неизвестно') {
      const mainCat = y.activity_type.split(' ')[0];
      sectorMap[mainCat] = (sectorMap[mainCat] || 0) + 1;
    }
  });

  const sectorData = Object.entries(sectorMap).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Mahalla Comparison Data
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

  // Recent Attention Required Profiles
  const attentionRequired = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Context for Officials */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-gradient-to-r from-gov-950/90 via-slate-900/90 to-gov-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {lang === 'ru' ? 'Оперативный ситуационный центр занятости' : 'Бандлик бўйича тезкор вазият маркази'}
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedMakhalla === 'all' ? (lang === 'ru' ? 'Весь район' : 'Туман') : selectedMakhalla}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'ru'
                ? 'Платформа объединяет данные налоговой службы, органов махалли, ВУЗов и Центров занятости для адресной маршрутизации молодых граждан.'
                : 'Платформа ёшларни манзилли йўналтириш учун солиқ, маҳалла, ОЎЮ ва бандлик марказлари маълумотларини бирлаштиради.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => onNavigateTab('triage')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-900/30 border border-rose-400/30 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Перейти к NEET верификации' : 'NEET текширувга ўтиш'}</span>
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Status Breakdown (Donut) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-700/60 bg-slate-900/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ru' ? 'Структура занятости молодёжи' : 'Ёшлар бандлиги таркиби'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Распределение по текущим статусам' : 'Ҳозирги ҳолатлар бўйича тақсимот'}
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">100% выборка</span>
          </div>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} stroke="rgba(15,23,42,0.8)" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(56, 189, 248, 0.4)', 
                    borderRadius: '12px', 
                    color: '#ffffff', 
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                    padding: '8px 12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{youthList.length}</span>
              <span className="text-[10px] text-slate-400">{lang === 'ru' ? 'профилей' : 'профил'}</span>
            </div>
          </div>

          {/* Custom Mini Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-xs">
            {donutData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: donutColors[idx % donutColors.length] }}></span>
                  <span className="truncate text-[11px]">{entry.name}</span>
                </div>
                <span className="font-bold text-white ml-1">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Mahalla Comparative Bar Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-700/60 bg-slate-900/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ru' ? 'Мониторинг занятости по махаллям' : 'Маҳаллалар кесимида мониторинг'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'Сравнение долей занятых, обучающихся и NEET' : 'Банд, ўқувчи ва NEET улуши'}
              </p>
            </div>
            <button 
              onClick={() => onNavigateTab('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>{lang === 'ru' ? 'Открыть ГИС-карту' : 'Харитада кўриш'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mahallaBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip 
                  itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(56, 189, 248, 0.4)', 
                    borderRadius: '12px', 
                    color: '#ffffff', 
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                    padding: '8px 12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="заняты" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} name={lang === 'ru' ? 'Заняты' : 'Банд'} />
                <Bar dataKey="обучаются" fill="#06B6D4" stackId="a" radius={[0, 0, 0, 0]} name={lang === 'ru' ? 'Обучаются' : 'Ўқишда'} />
                <Bar dataKey="neet" fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} name="NEET (Риск)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Row: Action Items & Fast Attention Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Urgent NEET attention queue */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-rose-500/20 bg-slate-900/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'ru' ? 'Кандидаты NEET, требующие проверки сотрудником' : 'Ходим текширувини кутаётган NEET номзодлар'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('triage')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <span>{lang === 'ru' ? 'Все на проверке' : 'Барчаси'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {attentionRequired.map(youth => (
              <div
                key={youth.id}
                onClick={() => onOpenProfile(youth)}
                className="glass-card p-3.5 rounded-xl border border-slate-700/60 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm">
                    {youth.age}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white hover:text-cyan-400 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-cyan-400">📍 {youth.makhalla}</span>
                      <span>•</span>
                      <span>{youth.education}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                    {lang === 'ru' ? 'Требует верификации' : 'Текширувда'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: State Routing Matrix Shortcuts */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-700/60 bg-slate-900/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              {lang === 'ru' ? 'Актуальные траектории маршрутизации' : 'Йўналтиришнинг асосий йўналишлари'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ru' ? 'Государственные каналы содействия занятости' : 'Бандликни таъминлаш бўйича давлат дастурлари'}
            </p>

            <div className="space-y-2.5">
              
              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-white">Моноцентр «Ишга Мархамат»</div>
                    <div className="text-[10px] text-slate-400">Технические и рабочие специальности (3 мес.)</div>
                  </div>
                </div>
                <span className="text-cyan-400 font-semibold text-[11px]">Бесплатно</span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-white">IT-Park & «IT-Bilim»</div>
                    <div className="text-[10px] text-slate-400">Курсы программирования + субсидия на ноутбук</div>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">IT-Ваучер</span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-purple-500/40 cursor-pointer flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-white">Субсидии «Ёшлар Дафтари»</div>
                    <div className="text-[10px] text-slate-400">Оборудование для самозанятых (до 10 млн сум)</div>
                  </div>
                </div>
                <span className="text-purple-400 font-semibold text-[11px]">Грант</span>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Интеграция: Soliq / ABKM / Yoshlar</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> API Sync OK
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
