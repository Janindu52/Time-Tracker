import React from 'react';
import { Target, Flame, FileSpreadsheet } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  streakDays: number;
  dailyGoalHours: number;
  onOpenGoalModal: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  streakDays,
  dailyGoalHours,
  onOpenGoalModal,
  onExportData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-black text-xs text-emerald-400 group-hover:border-emerald-500/50 transition shadow-lg shadow-emerald-500/5">
            A/L
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white block leading-tight">
              A/L Study Tracker
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium hidden sm:block">
              Advanced Level Focus Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation (Hidden on mobile where bottom nav is used) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            History & Logs
          </button>
        </nav>

        {/* Zone 3: Actions & Streaks */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak pill */}
          <div
            title={`${streakDays} Day Study Streak`}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-amber-400 text-xs font-extrabold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streakDays}d</span>
          </div>

          {/* Goal Trigger */}
          <button
            onClick={onOpenGoalModal}
            title="Set Daily Target"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{dailyGoalHours}h Goal</span>
          </button>

          {/* Export / Backup trigger */}
          <button
            onClick={onExportData}
            title="Export CSV / JSON Backup"
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
