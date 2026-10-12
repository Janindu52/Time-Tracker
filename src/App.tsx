import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StudySession, TabType, DashboardSubTab } from './types';
import {
  loadSavedSessions,
  saveSessions,
  loadDailyGoal,
  saveDailyGoal,
} from './utils/storage';
import { getTodayDateString } from './utils/date';
import { useStudyTimer } from './hooks/useStudyTimer';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { HistoryView } from './components/HistoryView';
import { TimerModal } from './components/TimerModal';
import { MiniTimerBar } from './components/MiniTimerBar';
import { BottomNav } from './components/BottomNav';
import { ManualLogModal } from './components/ManualLogModal';
import { GoalModal } from './components/GoalModal';
import { ExportModal } from './components/ExportModal';
import { CompletionModal } from './components/CompletionModal';

export default function App() {
  const [sessions, setSessions] = useState<StudySession[]>(() => loadSavedSessions());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState<DashboardSubTab>('today');
  const [selectedTodayDate, setSelectedTodayDate] = useState<string>(() => getTodayDateString());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => loadDailyGoal());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Swipe gesture handling between Today and Week views
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Detect horizontal swipe: deltaX magnitude > 45px and predominantly horizontal
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped Left -> show Week
        if (dashboardSubTab === 'today') {
          setSlideDirection('right');
          setDashboardSubTab('week');
        }
      } else {
        // Swiped Right -> show Today
        if (dashboardSubTab === 'week') {
          setSlideDirection('left');
          setDashboardSubTab('today');
        }
      }
    }
  };

  const switchToToday = () => {
    setSlideDirection('left');
    setDashboardSubTab('today');
  };

  const switchToWeek = () => {
    setSlideDirection('right');
    setDashboardSubTab('week');
  };

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualModalDefaultDate, setManualModalDefaultDate] = useState<string | undefined>(undefined);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Handler when a focus session or pomodoro completes
  const handleSessionComplete = useCallback((newSessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...newSessionData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
  }, []);

  // Timer engine hook
  const {
    timerState,
    displaySeconds,
    isTimerModalOpen,
    setIsTimerModalOpen,
    isCompletedModalOpen,
    setIsCompletedModalOpen,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSave,
    resetTimer,
    setMode,
    setSubject,
    setTopic,
    setTargetDuration,
    toggleKeepAwake,
    toggleSound,
  } = useStudyTimer({ onSessionComplete: handleSessionComplete });

  // Calculate study streak in days
  const streakDays = useMemo(() => {
    const datesWithStudy = new Set(
      sessions
        .filter(s => (Number(s.minutes) || 0) > 0)
        .map(s => s.date)
    );
    let streak = 0;
    const checkDate = new Date();
    const todayStr = getTodayDateString();

    if (!datesWithStudy.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      if (datesWithStudy.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }, [sessions]);

  // Open manual log modal
  const handleOpenManualModal = (date?: string) => {
    setManualModalDefaultDate(date || selectedTodayDate);
    setIsManualModalOpen(true);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Save updated daily goal
  const handleSaveGoal = (minutes: number) => {
    setDailyGoalMinutes(minutes);
    saveDailyGoal(minutes);
  };

  // Import sessions backup
  const handleImportSessions = (imported: StudySession[]) => {
    setSessions(imported);
  };

  return (
    <div className="bg-black text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-zinc-800 selection:text-white pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        streakDays={streakDays}
        dailyGoalHours={dailyGoalMinutes / 60}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onExportData={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-3 sm:px-6 pt-1.5 pb-2 space-y-2.5">
        {/* DASHBOARD TAB (Swipeable between Today & Week) */}
        {activeTab === 'dashboard' && (
          <div
            className="space-y-2 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Minimal AMOLED Page Dots Indicator (No bulky text buttons) */}
            <div className="flex items-center justify-center gap-2 py-0.5">
              <button
                onClick={switchToToday}
                className="group py-0.5 px-1 focus:outline-none"
                aria-label="Today View"
                title="Today View (Swipe Right)"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dashboardSubTab === 'today'
                      ? 'w-6 bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'w-2 bg-zinc-700 group-hover:bg-zinc-500'
                  }`}
                />
              </button>
              <button
                onClick={switchToWeek}
                className="group py-0.5 px-1 focus:outline-none"
                aria-label="Week View"
                title="Week View (Swipe Left)"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dashboardSubTab === 'week'
                      ? 'w-6 bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'w-2 bg-zinc-700 group-hover:bg-zinc-500'
                  }`}
                />
              </button>
            </div>

            {/* Dashboard Subtab Content with smooth directional slide animation */}
            <div
              key={dashboardSubTab}
              className={slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
            >
              {dashboardSubTab === 'today' ? (
                <TodayView
                  selectedDate={selectedTodayDate}
                  onSelectDate={setSelectedTodayDate}
                  sessions={sessions}
                  dailyGoalMinutes={dailyGoalMinutes}
                  onOpenManualModal={handleOpenManualModal}
                />
              ) : (
                <WeekView
                  sessions={sessions}
                  weekOffset={weekOffset}
                  onWeekOffsetChange={setWeekOffset}
                />
              )}
            </div>
          </div>
        )}

        {/* HISTORY & LOGS TAB */}
        {activeTab === 'logs' && (
          <HistoryView
            sessions={sessions}
            onOpenManualModal={() => handleOpenManualModal()}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      {/* Floating Mini Timer Player (Visible when timer is running or paused while inspecting charts) */}
      <MiniTimerBar
        timerState={timerState}
        displaySeconds={displaySeconds}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStopAndSave={stopAndSave}
      />

      {/* Floating Bottom Nav (Dashboard, Center Floating + Button, History) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timerState={timerState}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
      />

      {/* Full AMOLED Focus Timer Studio Modal */}
      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timerState={timerState}
        displaySeconds={displaySeconds}
        onStart={startTimer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStopAndSave={stopAndSave}
        onReset={resetTimer}
        onSetMode={setMode}
        onSetSubject={setSubject}
        onSetTopic={setTopic}
        onSetTargetDuration={setTargetDuration}
        onToggleKeepAwake={toggleKeepAwake}
        onToggleSound={toggleSound}
      />

      {/* Manual Add Session Modal */}
      <ManualLogModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultDate={manualModalDefaultDate}
        onSaveSession={handleSessionComplete}
      />

      {/* Daily Goal Target Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoalMinutes={dailyGoalMinutes}
        onSaveGoal={handleSaveGoal}
      />

      {/* Export / Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sessions={sessions}
        onImportSessions={handleImportSessions}
      />

      {/* Pomodoro Completion Celebratory Modal */}
      <CompletionModal
        isOpen={isCompletedModalOpen}
        onClose={() => setIsCompletedModalOpen(false)}
        onViewHistory={() => setActiveTab('logs')}
      />
    </div>
  );
}
