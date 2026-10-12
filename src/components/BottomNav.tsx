import React from 'react';
import { LayoutDashboard, History, Plus, Play, Pause } from 'lucide-react';
import { ActiveTimerState, TabType } from '../types';
import { getSubjectColor } from '../utils/subjects';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  timerState: ActiveTimerState;
  onOpenTimerModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  timerState,
  onOpenTimerModal,
}) => {
  const isTimerActive = timerState.status !== 'idle';
  const subjectColor = getSubjectColor(timerState.subject);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] left-1/2 -translate-x-1/2 z-50 w-auto pointer-events-auto">
      {/* Sleek, ultra-compact AMOLED Floating Navigation Dock */}
      <nav
        aria-label="Bottom Navigation"
        className="relative bg-black/92 backdrop-blur-2xl border border-zinc-800/80 rounded-full py-1.5 px-2 shadow-[0_16px_36px_rgba(0,0,0,0.95)] flex items-center gap-1.5 ring-1 ring-white/10"
      >
        {/* Left Tab: Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          aria-label="Dashboard"
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-300 active:scale-95 ${
            activeTab === 'dashboard'
              ? 'bg-zinc-900/90 text-white border border-zinc-700/60 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <LayoutDashboard
              className={`w-3.5 h-3.5 transition-colors ${
                activeTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            />
            {activeTab === 'dashboard' && (
              <span className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            )}
          </div>
          <span
            className={`text-[11px] font-semibold tracking-tight transition-colors ${
              activeTab === 'dashboard' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Dashboard
          </span>
        </button>

        {/* Center: Signature Floating Orbital Timer Action Button */}
        <div className="px-0.5 shrink-0 flex items-center justify-center">
          <button
            onClick={onOpenTimerModal}
            title={isTimerActive ? 'Open Active Timer Studio' : 'Start Focus Timer'}
            aria-label={isTimerActive ? 'Open Active Timer Studio' : 'Start Focus Timer'}
            className={`group relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-300 active:scale-90 ${
              isTimerActive
                ? 'bg-zinc-950 text-white border-2'
                : 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/30'
            }`}
            style={{
              borderColor: isTimerActive ? subjectColor : undefined,
              boxShadow: isTimerActive
                ? `0 0 16px ${subjectColor}40`
                : '0 4px 14px rgba(16, 185, 129, 0.45)',
            }}
          >
            {isTimerActive ? (
              <div className="flex flex-col items-center justify-center">
                {timerState.status === 'running' ? (
                  <Pause className="w-3 h-3 fill-white animate-pulse" />
                ) : (
                  <Play className="w-3 h-3 fill-amber-400 text-amber-400 ml-0.5" />
                )}
                <span
                  className="w-1 h-1 rounded-full mt-0.5 animate-ping"
                  style={{ backgroundColor: subjectColor }}
                />
              </div>
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[2.75] text-black group-hover:rotate-90 transition-transform duration-300" />
            )}

            {/* Glowing ambient pulse ring when timer is actively running */}
            {timerState.status === 'running' && (
              <span
                className="absolute -inset-1 rounded-full animate-ping opacity-30 pointer-events-none"
                style={{ backgroundColor: subjectColor }}
              />
            )}
          </button>
        </div>

        {/* Right Tab: History */}
        <button
          onClick={() => onTabChange('logs')}
          aria-label="Study History"
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-300 active:scale-95 ${
            activeTab === 'logs'
              ? 'bg-zinc-900/90 text-white border border-zinc-700/60 shadow-inner'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <History
              className={`w-3.5 h-3.5 transition-colors ${
                activeTab === 'logs' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            />
            {activeTab === 'logs' && (
              <span className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            )}
          </div>
          <span
            className={`text-[11px] font-semibold tracking-tight transition-colors ${
              activeTab === 'logs' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            History
          </span>
        </button>
      </nav>
    </div>
  );
};
