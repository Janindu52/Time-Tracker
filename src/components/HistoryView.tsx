import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Inbox,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { StudySession, SubjectType } from '../types';
import { formatMinutes } from '../utils/date';
import { STANDARD_SUBJECTS, getSubjectColor } from '../utils/subjects';

interface HistoryViewProps {
  sessions: StudySession[];
  onOpenManualModal: () => void;
  onDeleteSession: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onOpenManualModal,
  onDeleteSession,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    const matchesSubject =
      selectedSubjectFilter === 'all' || s.subject === selectedSubjectFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q || s.topic.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
    return matchesSubject && matchesQuery;
  });

  // Calculate totals
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
  const totalCount = filteredSessions.length;

  // Group by date
  const grouped: { [dateStr: string]: StudySession[] } = {};
  filteredSessions.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Header title & add button */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 shrink-0" /> Study History
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate">
            Filter and manage your study sessions
          </p>
        </div>
        <button
          onClick={onOpenManualModal}
          className="px-3 py-2 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Total Tracked
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight tabular-nums">
              {formatMinutes(totalMinutes)}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">
            <span className="font-bold">⏱</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
              Total Sessions
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight tabular-nums">
              {totalCount}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs shrink-0">
            <span className="font-bold">✓</span>
          </div>
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 shadow-lg space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics, questions, or subjects..."
            className="w-full pl-9 pr-4 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 text-xs font-bold ${
              selectedSubjectFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All Subjects
          </button>
          {STANDARD_SUBJECTS.map(sub => {
            const isSelected = selectedSubjectFilter === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubjectFilter(sub.name)}
                className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 text-xs font-bold ${
                  isSelected
                    ? `${sub.accentBg} text-white shadow-sm`
                    : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sub.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Timeline */}
      {filteredSessions.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-8 text-center space-y-2 shadow-xl">
          <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-xs font-bold text-zinc-300">No matching study sessions found</p>
          <p className="text-[10px] text-zinc-400">
            Try adjusting your search query or subject filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(dateStr => {
            const parts = dateStr.split('-');
            const dateObj = new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10)
            );
            const dateLabel = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={dateStr} className="space-y-2">
                <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>{dateLabel}</span>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {grouped[dateStr].length}{' '}
                    {grouped[dateStr].length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="space-y-2">
                  {grouped[dateStr].map(sess => {
                    const color = getSubjectColor(sess.subject);
                    const isConfirming = confirmDeleteId === sess.id;

                    return (
                      <div
                        key={sess.id}
                        className="bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-2.5 sm:p-3.5 shadow-md flex items-center justify-between gap-2 sm:gap-3 transition"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className="w-2 sm:w-2.5 h-9 sm:h-10 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-extrabold text-white truncate">
                              {sess.topic || sess.subject}
                            </h4>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] text-zinc-400">
                              <span className="font-bold text-zinc-300 truncate">
                                {sess.subject}
                              </span>
                              <span>•</span>
                              <span className="text-zinc-400 shrink-0">
                                {sess.timeRange || `${sess.minutes}m`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className="text-[11px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-xl border border-emerald-500/20 font-mono tabular-nums">
                            {formatMinutes(sess.minutes)}
                          </span>

                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteSession(sess.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold transition active:scale-95"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-bold transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(sess.id)}
                              className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition flex items-center justify-center text-xs active:scale-95"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
