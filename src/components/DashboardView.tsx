import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { AlertCircle, ArrowRight, CheckCircle, Sparkles, MapPin, Building, GraduationCap, Briefcase, UserCheck } from 'lucide-react';

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
  const statusCounts = {
    'Работают по найму': youthList.filter(y => y.employment_status === 'занят').length,
    'Свой бизнес / ИП': youthList.filter(y => y.employment_status === 'предприниматель').length,
    'Учатся (ВУЗ / техникум)': youthList.filter(y => y.employment_status === 'обучается').length,
    'Направлены на обучение': youthList.filter(y => y.employment_status === 'направлен на обучение').length,
    'Ищут работу': youthList.filter(y => y.employment_status === 'безработный' && !y.is_neet).length,
    'Требуют проверки (без работы/учёбы)': youthList.filter(y => y.is_neet).length,
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
      работают: listInM.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length,
      учатся: listInM.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length,
      на_проверке: listInM.filter(y => y.is_neet).length,
      total: listInM.length
    };
  });

  const priorityVisitProfiles = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Human-Centered Clean Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0e1c31] to-slate-900/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 flex-shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lang === 'ru' ? 'С чего начать работу сегодня?' : 'Бугунги иш режаси'}
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedMakhalla === 'all' ? (lang === 'ru' ? 'Весь район (8 махаллей)' : 'Туман бўйича') : `Махалля «${selectedMakhalla}»`}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ru'
                ? 'Проведите подворовой обход неработающей молодёжи, подтвердите их статус и направьте на бесплатные курсы в Моноцентр или субсидии IT-Park.'
                : 'Ишсиз ёшлар билан суҳбат ўтказиб, касб-ҳунар ўрганиш ёки бандлик дастурларига йўналтиринг.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('triage')}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/30 transition-all flex-shrink-0"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Перейти к списку на проверку' : 'Текширув рўйхатига ўтиш'}</span>
        </button>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Status Breakdown (Apple Clarity Donut) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'ru' ? 'Чем занята молодёжь' : 'Ёшлар бандлиги ҳолати'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ru' ? 'Общее распределение по статусам' : 'Ҳолатлар бўйича тақсимот'}
                </p>
              </div>
              <span className="text-xs text-cyan-300 font-semibold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                {youthList.length} {lang === 'ru' ? 'чел. в реестре' : 'киши'}
              </span>
            </div>

            <div className="h-64 relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
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
                <span className="text-3xl font-black text-white">{youthList.length}</span>
                <span className="text-xs text-slate-400">{lang === 'ru' ? 'человек' : 'киши'}</span>
              </div>
            </div>
          </div>

          {/* Clean Human Legend with Icons */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            {donutData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[idx % statusColors.length] }}></span>
                  <span className="truncate text-xs">{entry.name}</span>
                </div>
                <span className="font-bold text-white ml-2">{entry.value} чел.</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Mahalla Comparative Bar Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'ru' ? 'Ситуация по махаллям' : 'Маҳаллалар тақсимоти'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ru' ? 'Где больше всего молодёжи нуждается в помощи' : 'Қайси маҳаллада ёрдамга муҳтожлар кўп'}
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>{lang === 'ru' ? 'Открыть карту' : 'Харитани очиш'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mahallaBarData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-20} textAnchor="end" />
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
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="работают" fill="#10B981" stackId="a" name={lang === 'ru' ? 'Работают' : 'Ишлайди'} />
                  <Bar dataKey="учатся" fill="#06B6D4" stackId="a" name={lang === 'ru' ? 'Учатся' : 'Ўқийди'} />
                  <Bar dataKey="на_проверке" fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} name={lang === 'ru' ? 'Требуют проверки' : 'Текширувда'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Мирзо-Улугбекский район (8 махаллей)</span>
            <span className="text-emerald-400 font-semibold">Средняя занятость: 75%</span>
          </div>
        </div>

      </div>

      {/* Action Row: Whom to visit & where to route */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Priority Visits */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-rose-500/20 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h3 className="text-base font-bold text-white">
                {lang === 'ru' ? 'Кого необходимо посетить в первую очередь' : 'Биринчи навбатда кўриладиган ёшлар'}
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
                className="glass-card p-4 rounded-xl border border-slate-700/60 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-400 flex-shrink-0">
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
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold whitespace-nowrap">
                    {lang === 'ru' ? 'Требует визита' : 'Кўрик кутмоқда'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Where to route */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/80 shadow-lg flex flex-col justify-between">
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
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-sm font-bold text-white">Моноцентр «Ишга Мархамат»</div>
                  <div className="text-xs text-slate-400 mt-0.5">24 рабочие специальности + стипендия</div>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  Обучение
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-sm font-bold text-white">IT-Park & IT-Bilim</div>
                  <div className="text-xs text-slate-400 mt-0.5">Курсы веб-разработки + субсидия на ноутбук</div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  IT-Ваучер
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-purple-500/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-sm font-bold text-white">Фонд «Ёшлар Дафтари»</div>
                  <div className="text-xs text-slate-400 mt-0.5">Гранты на оборудование для открытия своего дела</div>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  Субсидия
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Интеграция: База налоговой и Минзанятости</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Данные синхронизированы
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
