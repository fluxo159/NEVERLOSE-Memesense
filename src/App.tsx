import React, { useState, useEffect } from 'react';
import { UserRole, YouthProfile, EmploymentStatus, SupportProgram } from './types';
import { INITIAL_YOUTH_DATA } from './data/mockYouthData';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { StatsOverview } from './components/StatsOverview';
import { DashboardView } from './components/DashboardView';
import { NeetTriageView } from './components/NeetTriageView';
import { YouthRegistryView } from './components/YouthRegistryView';
import { DistrictMapView } from './components/DistrictMapView';
import { SupportProgramsView } from './components/SupportProgramsView';
import { YouthModalCard } from './components/YouthModalCard';
import { SupportProgramRoutingModal } from './components/SupportProgramRoutingModal';
import { NewYouthModal } from './components/NewYouthModal';
import { NewProgramModal } from './components/NewProgramModal';
import { ExportModal } from './components/ExportModal';
import { SUPPORT_PROGRAMS } from './data/supportPrograms';
import { ImportModal } from './components/ImportModal';
import { PitchGuideModal } from './components/PitchGuideModal';
import { LiveToast, ToastMessage } from './components/LiveToast';
import { AiCopilotWidget } from './components/AiCopilotWidget';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { api } from './services/api';

export const App: React.FC = () => {
  const [youthList, setYouthList] = useState<YouthProfile[]>(INITIAL_YOUTH_DATA);
  const [selectedRole, setSelectedRole] = useState<UserRole>('district_officer');
  const [selectedMakhalla, setSelectedMakhalla] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<'ru' | 'uz'>('ru');
  const [supportPrograms, setSupportPrograms] = useState<SupportProgram[]>(SUPPORT_PROGRAMS);
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  // Initial load from backend database
  useEffect(() => {
    api.getYouth().then((data) => {
      if (data && data.length > 0) {
        setYouthList(data);
      }
    }).catch(() => {});
  }, []);

  // Real-Time WebSocket Listener (Telegram Bot & Backend events)
  const { isConnected } = useRealtimeSync({
    onLiveUpdate: (newYouthList, event) => {
      setYouthList(newYouthList);
      setCurrentToast(event);
    }
  });

  useEffect(() => {
    document.title = lang === 'ru' 
      ? 'Ёшлар Бандлиги — Система мониторинга занятости и маршрутизации молодёжи'
      : 'Yoshlar Bandligi — Yoshlar bandligi monitoringi va yo‘naltirish tizimi';
  }, [lang]);

  // Modals & Drawers state
  const [selectedYouthForModal, setSelectedYouthForModal] = useState<YouthProfile | null>(null);
  const [youthForRouting, setYouthForRouting] = useState<YouthProfile | null>(null);
  const [showNewYouthModal, setShowNewYouthModal] = useState<boolean>(false);
  const [showNewProgramModal, setShowNewProgramModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showPitchGuide, setShowPitchGuide] = useState<boolean>(false);
  const [registryInitialFilter, setRegistryInitialFilter] = useState<string>('all');

  // Centralized body scroll lock when any modal is active
  const isAnyModalOpen = Boolean(
    selectedYouthForModal || 
    youthForRouting || 
    showNewYouthModal || 
    showNewProgramModal || 
    showExportModal || 
    showImportModal || 
    showPitchGuide
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.removeProperty('overflow');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.removeProperty('overflow');
    };
  }, [isAnyModalOpen]);

  // Handle ESC key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedYouthForModal(null);
        setYouthForRouting(null);
        setShowNewYouthModal(false);
        setShowNewProgramModal(false);
        setShowExportModal(false);
        setShowImportModal(false);
        setShowPitchGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered dataset based on currently chosen Makhalla
  const currentScopedList = selectedMakhalla === 'all'
    ? youthList
    : youthList.filter(y => y.makhalla === selectedMakhalla);

  const neetPendingCount = currentScopedList.filter(y => y.is_neet && y.neet_verification === 'pending_verification').length;

  // Real-time Action Handlers
  const handleVerifyNeet = (id: string, isNeetConfirmed: boolean, comment: string) => {
    const today = new Date().toISOString().split('T')[0];
    const officerName = selectedRole === 'mahalla_leader' ? 'Лидер махалли («Ёшлар етакчиси»)' : 'Инспектор Хокимията';

    setYouthList(prev => prev.map(item => {
      if (item.id === id) {
        const newVerification = isNeetConfirmed ? 'verified' : 'rejected';
        const newStatus: EmploymentStatus = isNeetConfirmed ? 'безработный' : 'занят';

        return {
          ...item,
          is_neet: isNeetConfirmed,
          neet_verification: newVerification,
          neet_verified_by: officerName,
          neet_verified_at: today,
          employment_status: newStatus,
          last_updated: today,
          notes: `${item.notes || ''} | [${today}] ${officerName}: ${comment}`,
          status_history: [
            ...item.status_history,
            {
              date: today,
              status: newStatus,
              comment: `Верификация NEET: ${isNeetConfirmed ? 'Подтверждён' : 'Отклонён'}. ${comment}`,
              officer: officerName
            }
          ]
        };
      }
      return item;
    }));

    // Update opened modal if viewing
    if (selectedYouthForModal?.id === id) {
      setSelectedYouthForModal(prev => prev ? {
        ...prev,
        is_neet: isNeetConfirmed,
        neet_verification: isNeetConfirmed ? 'verified' : 'rejected'
      } : null);
    }
    // Call Backend API in background
    api.verifyTriage(id, isNeetConfirmed ? 'verified' : 'rejected', officerName, isNeetConfirmed ? 'безработный' : 'занят', comment).catch(() => {});
  };

  const handleUpdateStatus = (id: string, newStatus: EmploymentStatus, comment: string) => {
    const today = new Date().toISOString().split('T')[0];
    const officerName = selectedRole === 'mahalla_leader' ? 'Лидер махалли' : 'Хокимият';

    setYouthList(prev => prev.map(item => {
      if (item.id === id) {
        const isStillNeet = (newStatus === 'безработный' || newStatus === 'не уточнено');

        return {
          ...item,
          employment_status: newStatus,
          is_neet: isStillNeet,
          last_updated: today,
          status_history: [
            ...item.status_history,
            {
              date: today,
              status: newStatus,
              comment: comment || `Статус изменен на «${newStatus}»`,
              officer: officerName
            }
          ]
        };
      }
      return item;
    }));

    if (selectedYouthForModal?.id === id) {
      setSelectedYouthForModal(prev => prev ? {
        ...prev,
        employment_status: newStatus,
        last_updated: today
      } : null);
    }

    // Call Backend API in background
    api.updateStatus(id, newStatus, officerName, comment).catch(() => {});
  };

  const handleAssignProgram = (youthId: string, program: SupportProgram, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const officerName = selectedRole === 'employment_center' ? 'Центр занятости (ЦЗН)' : 'Лидер махалли';

    setYouthList(prev => prev.map(item => {
      if (item.id === youthId) {
        return {
          ...item,
          assigned_program: program,
          assigned_at: today,
          assigned_officer: officerName,
          employment_status: 'направлен на обучение',
          is_neet: false,
          neet_verification: 'verified',
          last_updated: today,
          status_history: [
            ...item.status_history,
            {
              date: today,
              status: 'направлен на обучение',
              comment: `Направлен в программу: «${program.title}». ${notes || ''}`,
              officer: officerName
            }
          ]
        };
      }
      return item;
    }));

    if (selectedYouthForModal?.id === youthId) {
      setSelectedYouthForModal(prev => prev ? {
        ...prev,
        assigned_program: program,
        employment_status: 'направлен на обучение',
        last_updated: today
      } : null);
    }

    setYouthForRouting(null);

    // Call Backend API in background
    api.assignProgram(youthId, program, officerName).catch(() => {});
  };

  const handleAddYouth = (newYouth: YouthProfile) => {
    setYouthList(prev => [newYouth, ...prev]);
    api.createYouth(newYouth).catch(() => {});
  };

  // Demo step trigger from Pitch Deck
  const handleRunDemoStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        setActiveTab('dashboard');
        setSelectedMakhalla('all');
        break;
      case 2:
        setActiveTab('triage');
        setSelectedMakhalla('all');
        break;
      case 3:
        setActiveTab('registry');
        setRegistryInitialFilter('all');
        if (currentScopedList.length > 0) {
          setSelectedYouthForModal(currentScopedList[0]);
        }
        break;
      case 4:
        setActiveTab('map');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col font-sans selection:bg-brand selection:text-white">
      
      {/* Sticky Header & Navigation Container */}
      <div className="sticky top-0 z-50 shadow-2xl backdrop-blur-xl border-b border-white/[0.08]">
        <Header
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          selectedMakhalla={selectedMakhalla}
          onSelectMakhalla={setSelectedMakhalla}
          onOpenPitchGuide={() => setShowPitchGuide(true)}
          lang={lang}
          onToggleLang={() => setLang(prev => prev === 'ru' ? 'uz' : 'ru')}
          isRealtimeActive={isConnected}
        />

        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          neetPendingCount={neetPendingCount}
          totalYouthCount={currentScopedList.length}
          lang={lang}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-0 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Stats Strip */}
        <StatsOverview
          youthList={currentScopedList}
          selectedMakhalla={selectedMakhalla}
          lang={lang}
          onNavigateTriage={() => setActiveTab('triage')}
          onFilterStatus={(status) => {
            setRegistryInitialFilter(status);
            setActiveTab('registry');
          }}
        />

        {/* Tab Views with Smooth Micro-Transition */}
        <div key={activeTab} className="view-transition">
          {activeTab === 'dashboard' && (
            <DashboardView
              youthList={currentScopedList}
              allYouthList={youthList}
              selectedMakhalla={selectedMakhalla}
              userRole={selectedRole}
              lang={lang}
              onNavigateTab={setActiveTab}
              onOpenProfile={setSelectedYouthForModal}
            />
          )}

          {activeTab === 'triage' && (
            <NeetTriageView
              youthList={youthList}
              supportPrograms={supportPrograms}
              selectedMakhalla={selectedMakhalla}
              onSelectMakhalla={setSelectedMakhalla}
              userRole={selectedRole}
              lang={lang}
              onVerifyNeet={handleVerifyNeet}
              onOpenProfile={setSelectedYouthForModal}
              onRouteProgram={setYouthForRouting}
            />
          )}

          {activeTab === 'registry' && (
            <YouthRegistryView
              youthList={youthList}
              selectedMakhalla={selectedMakhalla}
              onSelectMakhalla={setSelectedMakhalla}
              userRole={selectedRole}
              lang={lang}
              onOpenProfile={setSelectedYouthForModal}
              onOpenNewYouth={() => setShowNewYouthModal(true)}
              onOpenExport={() => setShowExportModal(true)}
              onOpenImport={() => setShowImportModal(true)}
              initialFilterStatus={registryInitialFilter}
            />
          )}

          {activeTab === 'map' && (
            <DistrictMapView
              youthList={youthList}
              selectedMakhalla={selectedMakhalla}
              onSelectMakhalla={setSelectedMakhalla}
              lang={lang}
              onNavigateRegistry={() => setActiveTab('registry')}
              onOpenProfile={(youth) => setSelectedYouthForModal(youth)}
            />
          )}

          {activeTab === 'programs' && (
            <SupportProgramsView
              youthList={currentScopedList}
              supportPrograms={supportPrograms}
              lang={lang}
              onNavigateRegistryWithFilter={(f) => {
                setRegistryInitialFilter(f);
                setActiveTab('registry');
              }}
              onOpenNewProgram={() => setShowNewProgramModal(true)}
            />
          )}
        </div>

      </main>

      {/* Modals & Dialogs */}
      {selectedYouthForModal && (
        <YouthModalCard
          youth={selectedYouthForModal}
          supportPrograms={supportPrograms}
          onClose={() => setSelectedYouthForModal(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignProgram={(yId, prog) => handleAssignProgram(yId, prog)}
          userRole={selectedRole}
          lang={lang}
        />
      )}

      {youthForRouting && (
        <SupportProgramRoutingModal
          youth={youthForRouting}
          supportPrograms={supportPrograms}
          onClose={() => setYouthForRouting(null)}
          onConfirmRouting={handleAssignProgram}
          lang={lang}
        />
      )}

      {showNewYouthModal && (
        <NewYouthModal
          supportPrograms={supportPrograms}
          onClose={() => setShowNewYouthModal(false)}
          onAddYouth={handleAddYouth}
          selectedMakhalla={selectedMakhalla}
          lang={lang}
        />
      )}

      {showNewProgramModal && (
        <NewProgramModal
          onClose={() => setShowNewProgramModal(false)}
          onAddProgram={(prog) => setSupportPrograms(prev => [prog, ...prev])}
          lang={lang}
        />
      )}

      {showExportModal && (
        <ExportModal
          youthList={currentScopedList}
          onClose={() => setShowExportModal(false)}
          lang={lang}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImportProfiles={(imported) => {
            setYouthList(prev => [...imported, ...prev]);
          }}
          lang={lang}
        />
      )}

      {showPitchGuide && (
        <PitchGuideModal
          onClose={() => setShowPitchGuide(false)}
          onRunDemoStep={handleRunDemoStep}
          lang={lang}
        />
      )}

      {/* Live Telegram WebSocket Toast Notification */}
      <LiveToast
        toast={currentToast}
        lang={lang}
        onClose={() => setCurrentToast(null)}
      />

      {/* Local GovTech AI Copilot Widget */}
      <AiCopilotWidget
        lang={lang}
        onHighlightMahallas={(mahallas) => {
          if (mahallas.length > 0) {
            setSelectedMakhalla(mahallas[0]);
            setActiveTab('map');
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab as any);
        }}
        onSelectMahalla={(mahalla) => {
          setSelectedMakhalla(mahalla);
        }}
        onOpenYouthModal={(youthId) => {
          const found = youthList.find(y => y.id === youthId);
          if (found) {
            setSelectedYouthForModal(found);
          }
        }}
      />

    </div>
  );
};
