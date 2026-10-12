import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  CheckCheck,
  BarChart2,
  Compass,
  TrendingUp,
} from 'lucide-react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { StudySession } from '../types';
import { getTodayDateString } from '../utils/date';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  Filler
);

interface WeekViewProps {
  sessions: StudySession[];
  weekOffset: number;
  onWeekOffsetChange: (offset: number) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  sessions,
  weekOffset,
  onWeekOffsetChange,
}) => {
  const [showCourses, setShowCourses] = useState<boolean>(true);
  const [activeFilters, setActiveFilters] = useState<{ [subject: string]: boolean }>({
    Chemistry: true,
    'Combined Mathematics': true,
    Physics: true,
  });
  const [timeAnalysisMode, setTimeAnalysisMode] = useState<'curve' | 'radar'>('curve');

  const barChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = useRef<Chart | null>(null);

  const radarChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartInstanceRef = useRef<Chart | null>(null);

  // Compute 7 days for the selected week
  const today = new Date();
  today.setDate(today.getDate() - weekOffset * 7);

  const days: { date: Date; dateStr: string; dayName: string; formattedLabel: string }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    days.push({
      date: d,
      dateStr,
      dayName: dayNames[d.getDay()],
      formattedLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    });
  }

  const startDate = days[0].date;
  const endDate = days[6].date;
  const isCurrentWeek = weekOffset === 0;
  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const weekLabel = isCurrentWeek
    ? 'This Week'
    : `${startDate.toLocaleDateString('en-US', dateOpts)} – ${endDate.toLocaleDateString('en-US', dateOpts)}`;

  const todayStr = getTodayDateString();

  // Compute total weekly stats
  let totalWeeklyMins = 0;
  let totalWeeklySessions = 0;
  const subjWeeklyMins: { [subj: string]: number } = {
    'Combined Mathematics': 0,
    Physics: 0,
    Chemistry: 0,
  };

  days.forEach(day => {
    sessions.forEach(s => {
      if (s.date === day.dateStr) {
        const m = Number(s.minutes) || 0;
        totalWeeklyMins += m;
        totalWeeklySessions++;
        if (subjWeeklyMins[s.subject] !== undefined) {
          subjWeeklyMins[s.subject] += m;
        }
      }
    });
  });

  // Top Subject calculation
  let topSubjectName = 'Combined Mathematics';
  let topSubjectMins = 0;
  Object.keys(subjWeeklyMins).forEach(sub => {
    if (subjWeeklyMins[sub] > topSubjectMins) {
      topSubjectMins = subjWeeklyMins[sub];
      topSubjectName = sub;
    }
  });

  // Toggle filter
  const toggleSubject = (sub: string) => {
    setActiveFilters(prev => ({ ...prev, [sub]: !prev[sub] }));
  };

  // Stacked Bar Chart
  useEffect(() => {
    if (!barChartCanvasRef.current) return;
    if (barChartInstanceRef.current) {
      barChartInstanceRef.current.destroy();
      barChartInstanceRef.current = null;
    }

    const labels = days.map(d => d.formattedLabel);
    const chemData: number[] = [];
    const mathData: number[] = [];
    const physData: number[] = [];
    const totalData: number[] = [];

    days.forEach(day => {
      let c = 0;
      let m = 0;
      let p = 0;
      sessions.forEach(s => {
        if (s.date === day.dateStr) {
          const mins = Number(s.minutes) || 0;
          if (s.subject === 'Chemistry') c += mins;
          if (s.subject === 'Combined Mathematics') m += mins;
          if (s.subject === 'Physics') p += mins;
        }
      });

      const cHours = activeFilters['Chemistry'] ? Number((c / 60).toFixed(1)) : 0;
      const mHours = activeFilters['Combined Mathematics'] ? Number((m / 60).toFixed(1)) : 0;
      const pHours = activeFilters['Physics'] ? Number((p / 60).toFixed(1)) : 0;

      chemData.push(cHours);
      mathData.push(mHours);
      physData.push(pHours);
      totalData.push(Number(((cHours + mHours + pHours)).toFixed(1)));
    });

    const datasets = showCourses
      ? [
          {
            label: 'Chemistry',
            data: chemData,
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
          {
            label: 'Combined Maths',
            data: mathData,
            backgroundColor: '#ef4444',
            borderRadius: 4,
          },
          {
            label: 'Physics',
            data: physData,
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
        ]
      : [
          {
            label: 'Total Hours',
            data: totalData,
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
        ];

    barChartInstanceRef.current = new Chart(barChartCanvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: '#71717a',
              font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
            },
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(39, 39, 42, 0.4)' },
            ticks: {
              color: '#71717a',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: value => `${value}h`,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#ffffff',
            bodyColor: '#a1a1aa',
            borderColor: '#27272a',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 10,
            callbacks: {
              label: context => ` ${context.dataset.label}: ${context.raw}h`,
            },
          },
        },
      },
    });

    return () => {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
        barChartInstanceRef.current = null;
      }
    };
  }, [days, sessions, showCourses, activeFilters]);

  // Time Analysis Chart (Supports Timeline Wave and Clean Radial)
  const dayNamesOrdered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayHoursMap: number[] = [0, 0, 0, 0, 0, 0, 0];

  days.forEach(day => {
    let dayMins = 0;
    sessions.forEach(s => {
      if (s.date === day.dateStr) dayMins += Number(s.minutes) || 0;
    });
    const jsDay = day.date.getDay();
    const index = jsDay === 0 ? 6 : jsDay - 1; // Mon = 0, Sun = 6
    dayHoursMap[index] = Number((dayMins / 60).toFixed(1));
  });

  let peakDayIndex = 0;
  let peakHours = 0;
  dayHoursMap.forEach((hrs, idx) => {
    if (hrs > peakHours) {
      peakHours = hrs;
      peakDayIndex = idx;
    }
  });
  const peakDayName = dayNamesOrdered[peakDayIndex];
  const totalWeeklyHours = Number((totalWeeklyMins / 60).toFixed(1));
  const dailyAvgHours = Number((totalWeeklyHours / 7).toFixed(1));

  useEffect(() => {
    if (!radarChartCanvasRef.current) return;
    if (radarChartInstanceRef.current) {
      radarChartInstanceRef.current.destroy();
      radarChartInstanceRef.current = null;
    }

    if (timeAnalysisMode === 'curve') {
      radarChartInstanceRef.current = new Chart(radarChartCanvasRef.current, {
        type: 'line',
        data: {
          labels: dayNamesOrdered,
          datasets: [
            {
              label: 'Daily Hours',
              data: dayHoursMap,
              borderColor: '#3b82f6',
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              backgroundColor: context => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 220);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                return gradient;
              },
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4.5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 22,
              bottom: 4,
              left: 6,
              right: 6,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#a1a1aa',
                font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
              },
            },
            y: {
              beginAtZero: true,
              suggestedMax: Math.max(4, Math.ceil(peakHours * 1.25)),
              grid: { color: 'rgba(39, 39, 42, 0.4)' },
              ticks: {
                color: '#71717a',
                font: { family: 'JetBrains Mono', size: 10 },
                callback: val => `${val}h`,
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#09090b',
              titleColor: '#ffffff',
              bodyColor: '#a1a1aa',
              borderColor: '#27272a',
              borderWidth: 1,
              padding: 8,
              cornerRadius: 10,
              callbacks: {
                label: context => ` ${context.raw}h studied`,
              },
            },
          },
        },
        plugins: [
          {
            id: 'curveValueLabelsPlugin',
            afterDatasetsDraw: chart => {
              const { ctx } = chart;
              const meta = chart.getDatasetMeta(0);
              ctx.save();
              ctx.font = 'bold 10px JetBrains Mono, monospace';
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              meta.data.forEach((point, idx) => {
                const val = dayHoursMap[idx];
                if (val > 0) {
                  ctx.fillText(`${val}h`, point.x, point.y - 10);
                }
              });
              ctx.restore();
            },
          },
        ],
      });
    } else {
      // Radial view with clear perimeter day & hour labels, NO messy center overlap!
      const radarDetailedLabels = dayNamesOrdered.map((name, idx) => {
        const h = dayHoursMap[idx];
        return h > 0 ? `${name} · ${h}h` : name;
      });

      radarChartInstanceRef.current = new Chart(radarChartCanvasRef.current, {
        type: 'radar',
        data: {
          labels: radarDetailedLabels,
          datasets: [
            {
              label: 'Daily Hours',
              data: dayHoursMap,
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              borderColor: '#3b82f6',
              borderWidth: 2,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointRadius: 4.5,
              pointHoverRadius: 6.5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: Math.max(3, peakHours + 1),
              grid: { color: 'rgba(39, 39, 42, 0.6)' },
              angleLines: { color: 'rgba(39, 39, 42, 0.6)' },
              ticks: {
                display: true,
                color: '#71717a',
                backdropColor: 'transparent',
                font: { size: 9 },
                callback: v => `${v}h`,
                maxTicksLimit: 4,
              },
              pointLabels: {
                color: '#d4d4d8',
                font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#09090b',
              titleColor: '#ffffff',
              bodyColor: '#a1a1aa',
              borderColor: '#27272a',
              borderWidth: 1,
              callbacks: {
                label: context => ` ${context.raw}h studied`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (radarChartInstanceRef.current) {
        radarChartInstanceRef.current.destroy();
        radarChartInstanceRef.current = null;
      }
    };
  }, [days, sessions, totalWeeklyMins, timeAnalysisMode, peakHours]);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Week Navigator Bar */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl py-2.5 px-4 shadow-xl flex items-center justify-between">
        <button
          onClick={() => onWeekOffsetChange(weekOffset + 1)}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95 text-xs"
          title="Previous Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
            {weekLabel}
          </span>
          {!isCurrentWeek && (
            <button
              onClick={() => onWeekOffsetChange(0)}
              className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition shadow-sm"
            >
              Current
            </button>
          )}
        </div>

        <button
          onClick={() => onWeekOffsetChange(Math.max(0, weekOffset - 1))}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95 text-xs"
          title="Next Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Streaks Weekly Grid */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-3.5 shadow-xl">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center w-full">
          {days.map(day => {
            let dayMins = 0;
            sessions.forEach(s => {
              if (s.date === day.dateStr) dayMins += Number(s.minutes) || 0;
            });
            const hasWorked = dayMins > 0;
            const isToday = day.dateStr === todayStr && isCurrentWeek;

            let timeBadge = '0h';
            if (dayMins > 0) {
              const h = Math.floor(dayMins / 60);
              const m = dayMins % 60;
              if (h > 0 && m > 0) {
                timeBadge = `${h}.${Math.round((m / 60) * 10)}h`;
              } else if (h > 0) {
                timeBadge = `${h}h`;
              } else {
                timeBadge = `${m}m`;
              }
            }

            let badgeClasses = 'bg-red-500/10 border-red-500/50 text-red-400';
            if (hasWorked) {
              badgeClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
            } else if (isToday && !hasWorked) {
              badgeClasses = 'bg-zinc-900 border-zinc-700 text-zinc-400';
            }

            return (
              <div key={day.dateStr} className="flex flex-col items-center justify-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {day.dayName}
                </span>
                <div
                  className={`w-full aspect-square max-w-[34px] sm:max-w-[42px] mx-auto rounded-full flex items-center justify-center border transition-all shadow-md ${badgeClasses} ${
                    isToday ? 'ring-2 ring-emerald-500/50 scale-105' : ''
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] font-extrabold font-mono tracking-tighter tabular-nums">
                    {timeBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            <span>Weekly Focus</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight tabular-nums">
              {(totalWeeklyMins / 60).toFixed(1)} hrs
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">7 days total</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            <span>Top Subject</span>
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
              {topSubjectName === 'Combined Mathematics' ? 'Combined Maths' : topSubjectName}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono tabular-nums">
              {(topSubjectMins / 60).toFixed(1)} hrs total
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            <span>Sessions</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight tabular-nums">
              {totalWeeklySessions}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Completed runs</p>
          </div>
        </div>
      </div>

      {/* Stacked Weekly Bar Chart Card */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 tracking-tight">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> Study Time
            </h3>
            <p className="text-xs text-zinc-400">Daily breakdown for the selected 7 days</p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 hidden xs:inline">Breakdown</span>
            <button
              onClick={() => setShowCourses(!showCourses)}
              className={`w-8 h-4.5 rounded-full transition relative p-0.5 shadow-inner ${
                showCourses ? 'bg-emerald-600' : 'bg-zinc-800'
              }`}
              title="Toggle Subject Breakdown"
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow ${
                  showCourses ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="relative w-full h-[230px] sm:h-[270px] flex items-center justify-center pt-2">
          <canvas ref={barChartCanvasRef} />
        </div>

        {/* Small single row clickable subject legend filters */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[9px] font-bold flex-wrap">
          <button
            onClick={() => toggleSubject('Chemistry')}
            className={`flex items-center gap-1 transition px-2.5 py-1 rounded-lg border border-zinc-800 ${
              activeFilters['Chemistry']
                ? 'bg-zinc-900 text-zinc-200'
                : 'bg-black text-zinc-500 opacity-40 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Chemistry</span>
          </button>

          <button
            onClick={() => toggleSubject('Combined Mathematics')}
            className={`flex items-center gap-1 transition px-2.5 py-1 rounded-lg border border-zinc-800 ${
              activeFilters['Combined Mathematics']
                ? 'bg-zinc-900 text-zinc-200'
                : 'bg-black text-zinc-500 opacity-40 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Combined Maths</span>
          </button>

          <button
            onClick={() => toggleSubject('Physics')}
            className={`flex items-center gap-1 transition px-2.5 py-1 rounded-lg border border-zinc-800 ${
              activeFilters['Physics']
                ? 'bg-zinc-900 text-zinc-200'
                : 'bg-black text-zinc-500 opacity-40 line-through'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Physics</span>
          </button>
        </div>
      </div>

      {/* Time Analysis Card */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 tracking-tight">
              <Compass className="w-4 h-4 text-blue-400" /> Time Analysis
            </h3>
            <p className="text-[11px] text-zinc-400">7-day study distribution across the week</p>
          </div>

          {/* Toggle between Timeline Wave & Radial */}
          <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setTimeAnalysisMode('curve')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeAnalysisMode === 'curve'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Timeline Wave
            </button>
            <button
              onClick={() => setTimeAnalysisMode('radar')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeAnalysisMode === 'radar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Radial
            </button>
          </div>
        </div>

        {/* 3 Metric Pills: Total, Daily Avg, Peak Day */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Total Focus
            </span>
            <span className="text-sm font-black font-mono text-white tabular-nums">
              {totalWeeklyHours}h
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Daily Avg
            </span>
            <span className="text-sm font-black font-mono text-blue-400 tabular-nums">
              {dailyAvgHours}h/d
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Peak Day
            </span>
            <span className="text-sm font-extrabold text-amber-400 truncate block">
              {peakDayName} ({peakHours}h)
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center pt-1">
          <canvas ref={radarChartCanvasRef} />
        </div>

        {/* 7-Day Day Distribution Bar Strip */}
        <div className="grid grid-cols-7 gap-1 pt-2 border-t border-zinc-800/80">
          {dayNamesOrdered.map((name, idx) => {
            const hrs = dayHoursMap[idx];
            const isPeak = idx === peakDayIndex && hrs > 0;
            const maxVal = Math.max(1, peakHours);
            const heightPercent = Math.max(10, Math.round((hrs / maxVal) * 100));
            return (
              <div
                key={name}
                className={`flex flex-col items-center justify-between gap-1 py-1.5 px-0.5 rounded-xl border transition-all ${
                  isPeak
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-zinc-900/50 border-zinc-800/60'
                }`}
              >
                <span className={`text-[10px] font-bold ${isPeak ? 'text-amber-300' : 'text-zinc-400'}`}>
                  {name}
                </span>
                <div className="w-1.5 h-8 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      isPeak ? 'bg-amber-400' : hrs > 0 ? 'bg-blue-500' : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-black font-mono tabular-nums ${
                    isPeak ? 'text-amber-400' : hrs > 0 ? 'text-white' : 'text-zinc-600'
                  }`}
                >
                  {hrs}h
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
