import React from 'react';
import { YouthProfile, UserRole } from '../types';
import { MAKHALLAS_LIST } from '../data/mahallasData';
import { ArrowRight, MapPin } from 'lucide-react';
import { t, getMahallaName, getEducationName } from '../data/translations';
import { AnimatedDonutChart, DonutDataItem } from './charts/AnimatedDonutChart';
import { AnimatedStackedBarChart, MahallaBarItem } from './charts/AnimatedStackedBarChart';

interface DashboardViewProps {
  youthList: YouthProfile[];
  allYouthList?: YouthProfile[];
  selectedMakhalla: string;
  userRole: UserRole;
  lang: 'ru' | 'uz';
  onNavigateTab: (tab: any) => void;
  onOpenProfile: (youth: YouthProfile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  youthList,
  allYouthList,
  selectedMakhalla,
  lang,
  onNavigateTab,
  onOpenProfile
}) => {
  const tr = t[lang];
  const listForBars = allYouthList || youthList;

  const donutData: DonutDataItem[] = [
    { name: tr.dashLegendEmployed, value: youthList.filter(y => y.employment_status === 'занят').length, color: '#10B981' },
    { name: tr.dashLegendBusiness, value: youthList.filter(y => y.employment_status === 'предприниматель').length, color: '#8B5CF6' },
    { name: tr.dashLegendStudy, value: youthList.filter(y => y.employment_status === 'обучается').length, color: '#06B6D4' },
    { name: tr.dashLegendCourses, value: youthList.filter(y => y.employment_status === 'направлен на обучение').length, color: '#3B82F6' },
    { name: tr.dashLegendUnemployed, value: youthList.filter(y => y.employment_status === 'безработный' && !y.is_neet).length, color: '#F59E0B' },
    { name: tr.dashLegendNeetPending, value: youthList.filter(y => y.is_neet).length, color: '#F43F5E' },
  ].filter(d => d.value > 0);

  const mahallaBarData: MahallaBarItem[] = MAKHALLAS_LIST.map(m => {
    const listInM = listForBars.filter(y => y.makhalla === m.name);
    const mName = getMahallaName(m.name, lang);
    const shortName = lang === 'ru' 
      ? m.name.replace('Буюк Ипак Йўли', 'Б. Ипак').replace('Олий Ҳиммат', 'Олий Ҳ.')
      : mName.replace('Buyuk Ipak Yo‘li', 'B. Ipak').replace('Oliy Himmat', 'Oliy H.');

    return {
      name: shortName,
      fullName: mName,
      employed: listInM.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length,
      studying: listInM.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length,
      neet: listInM.filter(y => y.is_neet).length,
      total: listInM.length
    };
  });

  const priorityVisitProfiles = youthList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Status Breakdown Donut with Sequential Drawing Animation */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <AnimatedDonutChart
            key={selectedMakhalla}
            data={donutData}
            total={youthList.length}
            title={tr.dashEmploymentStructure}
            inRegistryLabel={tr.dashInRegistry}
            unitLabel={tr.dashPersonShort}
          />
        </div>

        {/* 2. Mahalla Comparative Bar Chart with Cascading Staggered Animation */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <AnimatedStackedBarChart
            data={mahallaBarData}
            title={tr.dashMakhallaSituation}
            avgEmploymentLabel={tr.dashAvgEmployment}
            openMapLabel={tr.dashOpenMap}
            labels={{
              employed: tr.dashChartEmployed,
              studying: tr.dashChartStudying,
              neet: tr.dashChartNeet
            }}
            onOpenMap={() => onNavigateTab('map')}
          />
        </div>

      </div>

      {/* Action Row: Priority visits & quick route */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Priority Visits */}
        <div className="lg:col-span-7 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <h3 className="text-base font-bold text-white">
                {tr.dashPriorityTitle}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('triage')}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
            >
              <span>{tr.dashAllPending}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityVisitProfiles.map(youth => (
              <div 
                key={youth.id}
                onClick={() => onOpenProfile(youth)}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-3 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-slate-300 group-hover:text-white transition-colors">
                    {youth.full_name_demo.split(' ')[0][0]}{youth.full_name_demo.split(' ')[1] ? youth.full_name_demo.split(' ')[1][0] : ''}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {youth.full_name_demo}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {getMahallaName(youth.makhalla, lang)}
                      </span>
                      <span>•</span>
                      <span>{getEducationName(youth.education, lang)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-surface-3 text-slate-300 border border-white/[0.08] font-medium whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80"></span>
                    <span>{tr.dashNeedsVisit}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Where to route */}
        <div className="lg:col-span-5 bg-surface-1 rounded-2xl p-6 border border-white/[0.08] shadow-surface-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {tr.dashWhereToRouteTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {tr.dashWhereToRouteSubtitle}
            </p>

            <div className="space-y-3">
              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{tr.dashMonoCenterTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tr.dashMonoCenterDesc}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-surface-3 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
                  <span>{tr.dashMonoCenterTag}</span>
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{tr.dashItParkTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tr.dashItParkDesc}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-surface-3 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
                  <span>{tr.dashItParkTag}</span>
                </span>
              </div>

              <div 
                onClick={() => onNavigateTab('programs')}
                className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] cursor-pointer flex items-center justify-between transition-all shadow-sm group"
              >
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{tr.dashYoshlarDaftariTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tr.dashYoshlarDaftariDesc}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-surface-3 px-2.5 py-1 rounded-lg border border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80"></span>
                  <span>{tr.dashYoshlarDaftariTag}</span>
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
