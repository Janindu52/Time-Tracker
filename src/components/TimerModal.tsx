import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronDown,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ActiveTimerState, SubjectType, TimerMode } from '../types';
import { STANDARD_SUBJECTS, getSubjectColor } from '../utils/subjects';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerState: ActiveTimerState;
  displaySeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStopAndSave: () => void;
  onReset: () => void;
  onSetMode: (mode: TimerMode) => void;
  onSetSubject: (subject: SubjectType) => void;
  onSetTopic: (topic: string) => void;
  onSetTargetDuration: (seconds: number) => void;
  onToggleKeepAwake: () => void;
  onToggleSound: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  timerState,
  displaySeconds,
  onStart,
  onPause,
  onResume,
  onStopAndSave,
  onReset,
  onSetMode,
  onSetSubject,
  onSetTopic,
  onSetTargetDuration,
  onToggleKeepAwake,
  onToggleSound,
}) => {
  const [isDeskMode, setIsDeskMode] = useState<boolean>(false);

  if (!isOpen) return null;

  // Format digital time display
  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentSubjectColor = getSubjectColor(timerState.subject);

  const POMODORO_PRESETS = [
    { label: '25m', seconds: 25 * 60 },
    { label: '45m', seconds: 45 * 60 },
    { label: '50m', seconds: 50 * 60 },
    { label: '60m', seconds: 60 * 60 },
    { label: '90m', seconds: 90 * 60 },
  ];

  const TOPIC_SUGGESTIONS = [
    'Past Paper Practice',
    'Theory Revision',
    'Structure Questions',
    'Mechanics Problems',
    'Organic Synthesis',
    'Wave Optics Formulas',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
      {/* Background ambient subtle glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${currentSubjectColor}44 0%, transparent 60%)`,
        }}
      />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/90 rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-3.5 sm:space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: currentSubjectColor }}
            />
            <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
              Focus Studio
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Screen Wake Lock toggle */}
            <button
              onClick={onToggleKeepAwake}
              title={timerState.keepAwake ? 'Screen Wake Lock ON (Screen stays awake)' : 'Screen Wake Lock OFF'}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition border ${
                timerState.keepAwake
                  ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              title={timerState.soundEnabled ? 'Chime ON' : 'Chime Muted'}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition border ${
                timerState.soundEnabled
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              {timerState.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Desk Stand Fullscreen Toggle */}
            <button
              onClick={() => setIsDeskMode(!isDeskMode)}
              title="Desk Stand AMOLED Mode"
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition border ${
                isDeskMode
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {isDeskMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Minimize / Close */}
            <button
              onClick={onClose}
              title="Minimize to Floating Bar"
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-zinc-800"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desk Mode Minimal View */}
        {isDeskMode ? (
          <div className="py-8 sm:py-12 space-y-5 text-center">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              {timerState.subject} · {timerState.mode.toUpperCase()}
            </div>
            <div
              className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-wider tabular-nums select-none"
              style={{ color: currentSubjectColor }}
            >
              {formattedTime}
            </div>
            <p className="text-xs text-zinc-400 font-medium px-2 truncate">
              {timerState.topic || 'Deep Work Session'}
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
              {timerState.status === 'idle' && (
                <button
                  onClick={onStart}
                  className="py-2.5 px-6 sm:py-3 sm:px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95"
                >
                  Start
                </button>
              )}
              {timerState.status === 'running' && (
                <button
                  onClick={onPause}
                  className="py-2.5 px-6 sm:py-3 sm:px-8 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95"
                >
                  Pause
                </button>
              )}
              {timerState.status === 'paused' && (
                <button
                  onClick={onResume}
                  className="py-2.5 px-6 sm:py-3 sm:px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95"
                >
                  Resume
                </button>
              )}
              <button
                onClick={() => setIsDeskMode(false)}
                className="py-2.5 px-4 bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs rounded-2xl transition border border-zinc-800 active:scale-95"
              >
                Exit Desk Mode
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Selector (Pomodoro vs Stopwatch) */}
            <div className="flex items-center justify-center p-1 bg-black rounded-2xl border border-zinc-800/90 max-w-xs mx-auto">
              <button
                onClick={() => onSetMode('pomodoro')}
                className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                  timerState.mode === 'pomodoro'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => onSetMode('stopwatch')}
                className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                  timerState.mode === 'stopwatch'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Stopwatch
              </button>
            </div>

            {/* Subject Selector Buttons */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Focus Subject
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {STANDARD_SUBJECTS.map(sub => {
                  const isSelected = timerState.subject === sub.name;
                  return (
                    <button
                      key={sub.name}
                      onClick={() => onSetSubject(sub.name)}
                      className={`py-2 px-1.5 sm:px-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? `${sub.bgTint} ${sub.borderColor} text-white shadow-md`
                          : 'bg-black border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="truncate">{sub.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pomodoro Presets (Only when in Pomodoro mode and idle) */}
            {timerState.mode === 'pomodoro' && timerState.status === 'idle' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Target Duration</span>
                  <span className="text-zinc-300 font-mono">
                    {Math.round(timerState.targetDurationSeconds / 60)}m
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {POMODORO_PRESETS.map(preset => {
                    const isSelected = timerState.targetDurationSeconds === preset.seconds;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => onSetTargetDuration(preset.seconds)}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold font-mono transition border shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Topic Input with Suggestions */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                What are you working on?
              </label>
              <input
                type="text"
                value={timerState.topic}
                onChange={e => onSetTopic(e.target.value)}
                placeholder="e.g. Mechanics Paper 2 / Organic Synthesis"
                className="w-full px-3 py-2 bg-black border border-zinc-800/90 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {/* Quick suggestions pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-0.5 scrollbar-none">
                {TOPIC_SUGGESTIONS.map(sugg => (
                  <button
                    key={sugg}
                    onClick={() => onSetTopic(sugg)}
                    className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 whitespace-nowrap transition shrink-0"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* AMOLED Digital Timer Readout */}
            <div className="py-4 sm:py-6 px-3 bg-black rounded-3xl border border-zinc-800/90 shadow-inner text-center relative overflow-hidden group">
              <div
                className="text-5xl sm:text-6xl md:text-7xl font-black tracking-wider font-mono select-none tabular-nums transition-colors"
                style={{
                  color: timerState.status === 'running' ? currentSubjectColor : '#ffffff',
                }}
              >
                {formattedTime}
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    timerState.status === 'running'
                      ? 'animate-pulse bg-emerald-400'
                      : timerState.status === 'paused'
                      ? 'bg-amber-400'
                      : 'bg-zinc-600'
                  }`}
                />
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-extrabold uppercase tracking-widest truncate">
                  {timerState.status === 'running'
                    ? `Deep Focus · ${timerState.subject}`
                    : timerState.status === 'paused'
                    ? 'Session Paused'
                    : 'Ready to Focus'}
                </p>
              </div>

              {timerState.keepAwake && timerState.status === 'running' && (
                <div className="text-[9px] sm:text-[10px] text-zinc-400 mt-1 font-medium">
                  Screen Wake Lock Active
                </div>
              )}
            </div>

            {/* Controls Actions */}
            <div className="pt-0.5">
              {timerState.status === 'idle' && (
                <button
                  onClick={onStart}
                  className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus</span>
                </button>
              )}

              {timerState.status === 'running' && (
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={onPause}
                    className="py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </button>

                  <button
                    onClick={onStopAndSave}
                    className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                    title="Stop and Save to History"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}

              {timerState.status === 'paused' && (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
                  <button
                    onClick={onResume}
                    className="py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume</span>
                  </button>

                  <button
                    onClick={onStopAndSave}
                    className="py-3 px-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-1 active:scale-95"
                    title="Stop and Save Session"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={onReset}
                    className="py-3 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-2xl transition border border-zinc-800 active:scale-95 flex items-center justify-center gap-1"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Note on background / screen off */}
            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              💡 Hardware clock keeps timing accurately even if your phone screen turns off.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
