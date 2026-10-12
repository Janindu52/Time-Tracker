import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, PieChart as PieIcon, ListChecks, Plus, CheckCircle2 } from 'lucide-react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { StudySession } from '../types';
import { formatDateLabel, formatMinutes, getTodayDateString, shiftDateString } from '../utils/date';
import { STANDARD_SUBJECTS } from '../utils/subjects';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface TodayViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  sessions: StudySession[];
  dailyGoalMinutes: number;
  onOpenManualModal: (date?: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  selectedDate,
  onSelectDate,
  sessions,
  dailyGoalMinutes,
  onOpenManualModal,
}) => {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Filter sessions for selected date
  const daySessions = sessions.filter(s => s.date === selectedDate);
  const totalDayMins = daySessions.reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
  const sessionsCount = daySessions.length;

  // Calculate per subject minutes & sessions
  const subjectStats = STANDARD_SUBJECTS.map(subj => {
    const subjSessions = daySessions.filter(s => s.subject === subj.name);
    const mins = subjSessions.reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
    const count = subjSessions.length;
    const percentage = totalDayMins > 0 ? Math.round((mins / totalDayMins) * 100) : 0;
    return {
      ...subj,
      mins,
      count,
      percentage,
    };
  });

  // Render Chart.js Donut
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const mathsMins = subjectStats.find(s => s.name === 'Combined Mathematics')?.mins || 0;
    const physMins = subjectStats.find(s => s.name === 'Physics')?.mins || 0;
    const chemMins = subjectStats.find(s => s.name === 'Chemistry')?.mins || 0;

    if (totalDayMins === 0) {
      chartInstanceRef.current = new Chart(chartCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['No Focus Time Recorded'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#18181b'],
              borderColor: ['#27272a'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          cutout: '76%',
        },
      });
      return;
    }

    chartInstanceRef.current = new Chart(chartCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Chemistry', 'Combined Maths', 'Physics'],
        datasets: [
          {
            data: [chemMins, mathsMins, physMins],
            backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
            borderColor: '#000000',
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#d4d4d8',
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: 'bold',
              },
              boxWidth: 8,
              boxHeight: 8,
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#ffffff',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 12,
            callbacks: {
              label: context => {
                const mins = Number(context.raw) || 0;
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                const pct = totalDayMins > 0 ? Math.round((mins / totalDayMins) * 100) : 0;
                return ` ${context.label}: ${h}h ${String(m).padStart(2, '0')}m (${pct}%)`;
              },
            },
          },
        },
        cutout: '74%',
      },
      plugins: [
        {
          id: 'centerTextPlugin',
          afterDraw: chart => {
            const { ctx, width, height } = chart;
            ctx.save();
            const totalHours = (totalDayMins / 60).toFixed(1);

            ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
            ctx.fillStyle = '#71717a';
            ctx.textAlign = 'center';
            ctx.fillText('TOTAL FOCUS', width / 2, height / 2 - 12);

            ctx.font = '800 24px JetBrains Mono, monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`${totalHours}h`, width / 2, height / 2 + 16);
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [totalDayMins, selectedDate]);

  const goalProgressPct = Math.min(100, Math.round((totalDayMins / dailyGoalMinutes) * 100));
  const isGoalReached = totalDayMins >= dailyGoalMinutes;

  return (
    <div className="space-y-3 max-w-xl mx-auto">
      {/* Date Navigator Bar */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl py-1.5 px-3 sm:py-2 sm:px-4 shadow-xl flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectDate(shiftDateString(selectedDate, -1))}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95 text-xs shrink-0"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center flex items-center gap-1.5 sm:gap-2 min-w-0 justify-center">
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
            {formatDateLabel(selectedDate)}
          </span>
          {!isToday && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition shadow-sm shrink-0"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => onSelectDate(shiftDateString(selectedDate, 1))}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95 text-xs shrink-0"
          title="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Focus Time & Goal Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Focus Time
            </span>
            {isGoalReached ? (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Met
              </span>
            ) : (
              <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                {goalProgressPct}%
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight tabular-nums">
              {formatMinutes(totalDayMins)}
            </h3>
            <div className="mt-1.5 w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${goalProgressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 flex flex-col sm:flex-row sm:justify-between gap-0.5 leading-tight">
              <span>Goal {formatMinutes(dailyGoalMinutes)}</span>
              <span className="text-zinc-500 font-mono text-[9px] sm:text-[10px]">
                {totalDayMins >= dailyGoalMinutes
                  ? `+${formatMinutes(totalDayMins - dailyGoalMinutes)}`
                  : `${formatMinutes(dailyGoalMinutes - totalDayMins)} left`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Sessions
            </span>
            <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight tabular-nums">
              {sessionsCount}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {sessionsCount === 1 ? '1 focus block' : `${sessionsCount} focus blocks`}
            </p>
            <button
              onClick={() => onOpenManualModal(selectedDate)}
              className="mt-1.5 w-full py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3 h-3 text-emerald-400" /> Log Session
            </button>
          </div>
        </div>
      </div>

      {/* Subject Daily Work Time Boxes */}
      <div className="space-y-2">
        {subjectStats.map(sub => (
          <div
            key={sub.name}
            className={`bg-zinc-950/90 border ${sub.borderColor} rounded-2xl p-3.5 shadow-lg space-y-2 transition`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <span
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color: sub.color }}
                >
                  {sub.name}
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-300 font-mono tabular-nums">
                {sub.percentage}%
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div className="text-xl font-black text-white font-mono tracking-tight tabular-nums">
                {formatMinutes(sub.mins)}
              </div>
              <div className="text-[11px] font-semibold text-zinc-400">
                {sub.count} {sub.count === 1 ? 'session' : 'sessions'}
              </div>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${sub.percentage}%`,
                  backgroundColor: sub.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Circular Donut Chart Card */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-5 shadow-2xl space-y-4">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 tracking-tight">
            <PieIcon className="w-4 h-4 text-emerald-400" /> Subject Breakdown Distribution
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Proportion distribution across studied subjects
          </p>
        </div>

        <div className="relative w-full h-[250px] sm:h-[300px] flex items-center justify-center">
          <canvas ref={chartCanvasRef} />
        </div>
      </div>
    </div>
  );
};
