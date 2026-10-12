import React from 'react';
import { Play, Pause, Save, Maximize2 } from 'lucide-react';
import { ActiveTimerState } from '../types';
import { getSubjectColor, getSubjectShortName } from '../utils/subjects';

interface MiniTimerBarProps {
  timerState: ActiveTimerState;
  displaySeconds: number;
  onOpenTimerModal: () => void;
  onPause: () => void;
  onResume: () => void;
  onStopAndSave: () => void;
}

export const MiniTimerBar: React.FC<MiniTimerBarProps> = ({
  timerState,
  displaySeconds,
  onOpenTimerModal,
  onPause,
  onResume,
  onStopAndSave,
}) => {
  // Only show floating mini bar if timer is active (running or paused)
  if (timerState.status === 'idle') return null;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const subjColor = getSubjectColor(timerState.subject);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[320px] pointer-events-none">
      <div className="pointer-events-auto bg-black/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-2.5 ring-1 ring-white/10 animate-fade-in">
        {/* Tapping expands modal */}
        <div
          onClick={onOpenTimerModal}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
        >
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              timerState.status === 'running' ? 'animate-pulse' : ''
            }`}
            style={{ backgroundColor: subjColor }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-white truncate">
                {timerState.topic || getSubjectShortName(timerState.subject)}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                · {timerState.mode}
              </span>
            </div>
            <div
              className="text-sm font-black font-mono tracking-tight tabular-nums"
              style={{ color: subjColor }}
            >
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Quick inline controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {timerState.status === 'running' ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onPause();
              }}
              className="w-8 h-8 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition active:scale-95"
              title="Pause Timer"
            >
              <Pause className="w-3.5 h-3.5 fill-amber-300" />
            </button>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onResume();
              }}
              className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition active:scale-95"
              title="Resume Timer"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
            </button>
          )}

          <button
            onClick={e => {
              e.stopPropagation();
              onStopAndSave();
            }}
            className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center justify-center transition active:scale-95"
            title="Stop & Save"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenTimerModal}
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition"
            title="Expand Timer Studio"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
