import { StudySession, ActiveTimerState } from '../types';
import { getOffsetDateString } from './date';

export const STORAGE_KEY = 'al_study_tracker_sessions_v2';
export const GOAL_STORAGE_KEY = 'al_study_tracker_goal_v1';
export const TIMER_STORAGE_KEY = 'al_active_timer_v1';

export const DEFAULT_TIMER_STATE: ActiveTimerState = {
  mode: 'pomodoro',
  subject: 'Combined Mathematics',
  topic: '',
  status: 'idle',
  targetDurationSeconds: 25 * 60,
  startTimestamp: null,
  elapsedBeforeLastStart: 0,
  pausedTimestamp: null,
  keepAwake: true,
  soundEnabled: true,
};

export function loadActiveTimerState(): ActiveTimerState {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_TIMER_STATE,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load active timer state', e);
  }
  return DEFAULT_TIMER_STATE;
}

export function saveActiveTimerState(state: ActiveTimerState): void {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save active timer state', e);
  }
}

export function getInitialSessions(): StudySession[] {
  return [
    {
      id: '1',
      subject: 'Combined Mathematics',
      topic: 'Pure Math - Calculus Past Paper',
      minutes: 180,
      timeRange: '18:30 – 21:30',
      date: getOffsetDateString(0),
      createdAt: Date.now() - 3600000,
    },
    {
      id: '2',
      subject: 'Chemistry',
      topic: 'Organic Name Reactions & Mechanism',
      minutes: 180,
      timeRange: '13:30 – 16:30',
      date: getOffsetDateString(0),
      createdAt: Date.now() - 18000000,
    },
    {
      id: '3',
      subject: 'Chemistry',
      topic: 'Inorganic Qualitative Analysis',
      minutes: 57,
      timeRange: '08:24 – 09:52',
      date: getOffsetDateString(0),
      createdAt: Date.now() - 36000000,
    },
    {
      id: '4',
      subject: 'Physics',
      topic: 'Wave Optics & Interference Experiments',
      minutes: 90,
      timeRange: '10:00 – 11:30',
      date: getOffsetDateString(1),
      createdAt: Date.now() - 86400000,
    },
    {
      id: '5',
      subject: 'Combined Mathematics',
      topic: 'Applied Math - Statics Equilibrium',
      minutes: 120,
      timeRange: '14:00 – 16:00',
      date: getOffsetDateString(2),
      createdAt: Date.now() - 172800000,
    },
    {
      id: '6',
      subject: 'Physics',
      topic: 'Electric Fields & Gauss Theorem',
      minutes: 150,
      timeRange: '09:00 – 11:30',
      date: getOffsetDateString(3),
      createdAt: Date.now() - 259200000,
    },
    {
      id: '7',
      subject: 'Chemistry',
      topic: 'Physical Chemistry - Equilibrium Constants',
      minutes: 135,
      timeRange: '19:00 – 21:15',
      date: getOffsetDateString(4),
      createdAt: Date.now() - 345600000,
    },
    {
      id: '8',
      subject: 'Combined Mathematics',
      topic: 'Complex Numbers Past Exam Questions',
      minutes: 105,
      timeRange: '15:30 – 17:15',
      date: getOffsetDateString(5),
      createdAt: Date.now() - 432000000,
    }
  ];
}

export function loadSavedSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved sessions', e);
  }
  const defaults = getInitialSessions();
  saveSessions(defaults);
  return defaults;
}

export function saveSessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function loadDailyGoal(): number {
  try {
    const val = localStorage.getItem(GOAL_STORAGE_KEY);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load daily goal', e);
  }
  return 360; // 6 hours
}

export function saveDailyGoal(minutes: number): void {
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, minutes.toString());
  } catch (e) {
    console.error('Failed to save daily goal', e);
  }
}
