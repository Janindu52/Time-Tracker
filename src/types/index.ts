export type SubjectType = 'Combined Mathematics' | 'Physics' | 'Chemistry' | string;

export interface StudySession {
  id: string;
  subject: SubjectType;
  topic: string;
  minutes: number;
  timeRange?: string;
  date: string; // YYYY-MM-DD format
  createdAt?: number;
}

export type TabType = 'dashboard' | 'logs';
export type DashboardSubTab = 'today' | 'week';
export type TimerMode = 'pomodoro' | 'stopwatch';

export interface ActiveTimerState {
  mode: TimerMode;
  subject: SubjectType;
  topic: string;
  status: 'idle' | 'running' | 'paused';
  targetDurationSeconds: number; // e.g. 1500 (25 min)
  startTimestamp: number | null; // Date.now() when running segment started
  elapsedBeforeLastStart: number; // seconds accumulated before current running segment
  pausedTimestamp: number | null;
  keepAwake: boolean;
  soundEnabled: boolean;
}

export interface SubjectConfig {
  name: SubjectType;
  shortName: string;
  color: string;
  borderColor: string;
  bgTint: string;
  accentBg: string;
}

