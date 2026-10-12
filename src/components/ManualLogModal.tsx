import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { StudySession, SubjectType } from '../types';
import { STANDARD_SUBJECTS } from '../utils/subjects';
import {
  getTodayDateString,
  getOffsetDateString,
  formatDateLabel,
  shiftDateString,
} from '../utils/date';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onSaveSession: (session: Omit<StudySession, 'id'>) => void;
}

const MONTHS = [
  { value: '01', name: 'Jan - 01' },
  { value: '02', name: 'Feb - 02' },
  { value: '03', name: 'Mar - 03' },
  { value: '04', name: 'Apr - 04' },
  { value: '05', name: 'May - 05' },
  { value: '06', name: 'Jun - 06' },
  { value: '07', name: 'Jul - 07' },
  { value: '08', name: 'Aug - 08' },
  { value: '09', name: 'Sep - 09' },
  { value: '10', name: 'Oct - 10' },
  { value: '11', name: 'Nov - 11' },
  { value: '12', name: 'Dec - 12' },
];

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  onSaveSession,
}) => {
  const [subject, setSubject] = useState<SubjectType>('Combined Mathematics');
  const [topic, setTopic] = useState<string>('');
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(45);
  const [date, setDate] = useState<string>(() => defaultDate || getTodayDateString());
  const [inputDay, setInputDay] = useState<string>('01');
  const [inputMonth, setInputMonth] = useState<string>('01');
  const [inputYear, setInputYear] = useState<string>('2026');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  // Keep date synced whenever modal opens or defaultDate changes
  useEffect(() => {
    if (isOpen) {
      const activeDate = defaultDate || date || getTodayDateString();
      setDate(activeDate);
      const parts = activeDate.split('-');
      if (parts.length === 3) {
        setInputYear(parts[0]);
        setInputMonth(parts[1]);
        setInputDay(parts[2]);
      }
    }
  }, [isOpen, defaultDate]);

  // Keep day/month/year components synced when date changes internally
  useEffect(() => {
    const parts = (date || getTodayDateString()).split('-');
    if (parts.length === 3) {
      setInputYear(parts[0]);
      setInputMonth(parts[1]);
      setInputDay(parts[2]);
    }
  }, [date]);

  const updateDateComponents = (y: string, m: string, d: string) => {
    const yearNum = parseInt(y, 10);
    const monthNum = parseInt(m, 10);
    const dayNum = parseInt(d, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return;
    const clampedYear = Math.max(2000, Math.min(2100, yearNum));
    const clampedMonth = Math.max(1, Math.min(12, monthNum));
    const maxDays = new Date(clampedYear, clampedMonth, 0).getDate();
    const clampedDay = Math.max(1, Math.min(maxDays, dayNum));

    const newDateStr = `${clampedYear}-${String(clampedMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    setDate(newDateStr);
  };

  if (!isOpen) return null;

  const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  const todayStr = getTodayDateString();
  const yesterdayStr = getOffsetDateString(1);
  const twoDaysAgoStr = getOffsetDateString(2);
  const threeDaysAgoStr = getOffsetDateString(3);

  const QUICK_DURATIONS = [
    { label: '30m', h: 0, m: 30 },
    { label: '45m', h: 0, m: 45 },
    { label: '1h', h: 1, m: 0 },
    { label: '1h 30m', h: 1, m: 30 },
    { label: '2h', h: 2, m: 0 },
    { label: '3h', h: 3, m: 0 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    if (totalMinutes <= 0) {
      alert('Please enter a duration greater than 0.');
      return;
    }

    onSaveSession({
      subject,
      topic: topic.trim(),
      minutes: totalMinutes,
      timeRange: 'Manual Entry',
      date: date || getTodayDateString(),
      createdAt: Date.now(),
    });

    onClose();
    setTopic('');
    setHours(0);
    setMinutes(45);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Add Study Session</h3>
            <p className="text-xs text-zinc-400">Manually log offline study or past lectures</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {STANDARD_SUBJECTS.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Topic / Paper / Exercises
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Integration by Parts Past Exam"
              className="w-full px-3.5 py-2.5 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Duration in Hours and Minutes (No mental math required!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Duration</span>
              <span className="text-emerald-400 font-mono text-xs">
                Total: {hours > 0 ? `${hours}h ` : ''}{minutes}m ({totalMinutes} mins)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={e => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-3 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none">
                  Hours
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={e => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-3 pr-10 py-2.5 bg-black border border-zinc-800 rounded-xl text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none">
                  Mins
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {QUICK_DURATIONS.map(dur => (
                <button
                  key={dur.label}
                  type="button"
                  onClick={() => {
                    setHours(dur.h);
                    setMinutes(dur.m);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition shrink-0 ${
                    hours === dur.h && minutes === dur.m
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Date & Month
              </span>
              <span className="text-emerald-400 font-mono text-xs font-semibold">
                {formatDateLabel(date)}
              </span>
            </div>

            {/* Direct Keyboard Inputs (Day, Month, Year) */}
            <div className="grid grid-cols-12 gap-1.5 items-center">
              {/* Day Input - opens keyboard on tap */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                  Day
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="DD"
                  value={inputDay}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setInputDay(val);
                    if (val && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 31) {
                      updateDateComponents(inputYear, inputMonth, val);
                    }
                  }}
                  onBlur={() => {
                    if (inputDay) {
                      const num = Math.max(1, Math.min(31, parseInt(inputDay, 10) || 1));
                      const formatted = String(num).padStart(2, '0');
                      setInputDay(formatted);
                      updateDateComponents(inputYear, inputMonth, formatted);
                    }
                  }}
                  className="w-full text-center py-2 bg-black border border-zinc-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Month Selector - 1-tap change all 12 months */}
              <div className="col-span-5">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                  Month
                </label>
                <select
                  value={inputMonth}
                  onChange={e => {
                    const val = e.target.value;
                    setInputMonth(val);
                    updateDateComponents(inputYear, val, inputDay);
                  }}
                  className="w-full py-2 px-2 bg-black border border-zinc-800 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value} className="bg-zinc-900 text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Input - opens keyboard on tap */}
              <div className="col-span-4">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                  Year
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="YYYY"
                  value={inputYear}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setInputYear(val);
                    if (val.length === 4) {
                      updateDateComponents(val, inputMonth, inputDay);
                    }
                  }}
                  onBlur={() => {
                    if (inputYear.length === 4) {
                      updateDateComponents(inputYear, inputMonth, inputDay);
                    } else {
                      setInputYear(date.split('-')[0] || '2026');
                    }
                  }}
                  className="w-full text-center py-2 bg-black border border-zinc-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Steppers & Calendar Mode Toggle */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDate(shiftDateString(date, -1))}
                  className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center gap-0.5 transition"
                  title="Shift -1 Day"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>-1d</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDate(shiftDateString(date, 1))}
                  className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-bold flex items-center gap-0.5 transition"
                  title="Shift +1 Day"
                >
                  <span>+1d</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1.5 ${
                    showCalendar
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{showCalendar ? 'Hide Calendar' : 'Calendar Grid'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      nativeDateRef.current?.showPicker?.();
                    } catch {
                      nativeDateRef.current?.focus();
                    }
                  }}
                  className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                  title="Open OS Calendar Picker"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={nativeDateRef}
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Expandable Visual Calendar Grid */}
            {showCalendar && (
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      let m = parseInt(inputMonth, 10) - 1;
                      let y = parseInt(inputYear, 10);
                      if (m < 1) {
                        m = 12;
                        y -= 1;
                      }
                      const mStr = String(m).padStart(2, '0');
                      const yStr = String(y);
                      setInputMonth(mStr);
                      setInputYear(yStr);
                      updateDateComponents(yStr, mStr, inputDay);
                    }}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-white font-mono">
                    {new Date(parseInt(inputYear, 10) || 2026, (parseInt(inputMonth, 10) || 1) - 1).toLocaleDateString(
                      'en-US',
                      { month: 'long', year: 'numeric' }
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      let m = parseInt(inputMonth, 10) + 1;
                      let y = parseInt(inputYear, 10);
                      if (m > 12) {
                        m = 1;
                        y += 1;
                      }
                      const mStr = String(m).padStart(2, '0');
                      const yStr = String(y);
                      setInputMonth(mStr);
                      setInputYear(yStr);
                      updateDateComponents(yStr, mStr, inputDay);
                    }}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({
                    length: new Date(
                      parseInt(inputYear, 10) || 2026,
                      (parseInt(inputMonth, 10) || 1) - 1,
                      1
                    ).getDay(),
                  }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-6" />
                  ))}
                  {Array.from({
                    length: new Date(
                      parseInt(inputYear, 10) || 2026,
                      parseInt(inputMonth, 10) || 1,
                      0
                    ).getDate(),
                  }, (_, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = parseInt(inputDay, 10) === dayNum;
                    const cellDateStr = `${inputYear}-${inputMonth}-${String(dayNum).padStart(2, '0')}`;
                    const isToday = cellDateStr === todayStr;

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => {
                          const dStr = String(dayNum).padStart(2, '0');
                          setInputDay(dStr);
                          updateDateComponents(inputYear, inputMonth, dStr);
                        }}
                        className={`h-6 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center relative ${
                          isSelected
                            ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {dayNum}
                        {isToday && !isSelected && (
                          <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`flex-1 py-1 px-1.5 rounded-lg border text-[11px] font-bold transition text-center ${
                  date === todayStr
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterdayStr)}
                className={`flex-1 py-1 px-1.5 rounded-lg border text-[11px] font-bold transition text-center ${
                  date === yesterdayStr
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setDate(twoDaysAgoStr)}
                className={`flex-1 py-1 px-1.5 rounded-lg border text-[11px] font-bold transition text-center ${
                  date === twoDaysAgoStr
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                2d Ago
              </button>
              <button
                type="button"
                onClick={() => setDate(threeDaysAgoStr)}
                className={`flex-1 py-1 px-1.5 rounded-lg border text-[11px] font-bold transition text-center ${
                  date === threeDaysAgoStr
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                3d Ago
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
            >
              Save Session Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
