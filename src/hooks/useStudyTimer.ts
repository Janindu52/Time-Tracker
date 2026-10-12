import { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveTimerState, StudySession, SubjectType, TimerMode } from '../types';
import { loadActiveTimerState, saveActiveTimerState } from '../utils/storage';
import { playTimerChime, playStartSound } from '../utils/audio';
import { requestWakeLock, releaseWakeLock } from '../utils/wakeLock';
import confetti from 'canvas-confetti';

interface UseStudyTimerProps {
  onSessionComplete: (session: Omit<StudySession, 'id'>) => void;
}

export function useStudyTimer({ onSessionComplete }: UseStudyTimerProps) {
  const [timerState, setTimerState] = useState<ActiveTimerState>(() => loadActiveTimerState());
  const [displaySeconds, setDisplaySeconds] = useState<number>(() => {
    const s = loadActiveTimerState();
    if (s.mode === 'pomodoro') {
      if (s.status === 'idle') return s.targetDurationSeconds;
      const elapsed = s.status === 'paused'
        ? s.elapsedBeforeLastStart
        : s.elapsedBeforeLastStart + (s.startTimestamp ? Math.floor((Date.now() - s.startTimestamp) / 1000) : 0);
      return Math.max(0, s.targetDurationSeconds - elapsed);
    } else {
      if (s.status === 'idle') return 0;
      return s.status === 'paused'
        ? s.elapsedBeforeLastStart
        : s.elapsedBeforeLastStart + (s.startTimestamp ? Math.floor((Date.now() - s.startTimestamp) / 1000) : 0);
    }
  });

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const completedSessionRef = useRef<boolean>(false);

  // Sync state to localStorage whenever timerState changes
  useEffect(() => {
    saveActiveTimerState(timerState);
  }, [timerState]);

  // Screen Wake Lock management based on timer status and user preference
  useEffect(() => {
    if (timerState.status === 'running' && timerState.keepAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [timerState.status, timerState.keepAwake]);

  // Helper to compute exact live seconds based on hardware clock Date.now()
  const computeCurrentTimes = useCallback(() => {
    if (timerState.status === 'idle') {
      return {
        elapsed: 0,
        remaining: timerState.targetDurationSeconds,
      };
    }

    const elapsedNow = timerState.status === 'paused'
      ? timerState.elapsedBeforeLastStart
      : timerState.elapsedBeforeLastStart + (timerState.startTimestamp ? Math.floor((Date.now() - timerState.startTimestamp) / 1000) : 0);

    const remainingNow = Math.max(0, timerState.targetDurationSeconds - elapsedNow);
    return {
      elapsed: elapsedNow,
      remaining: remainingNow,
    };
  }, [timerState]);

  // Main tick loop & background wake-up resync
  useEffect(() => {
    const updateTick = () => {
      const { elapsed, remaining } = computeCurrentTimes();

      if (timerState.mode === 'pomodoro') {
        setDisplaySeconds(remaining);
        if (timerState.status === 'running' && remaining <= 0 && !completedSessionRef.current) {
          completedSessionRef.current = true;
          handlePomodoroFinished(elapsed);
        }
      } else {
        setDisplaySeconds(elapsed);
      }
    };

    updateTick();

    let intervalId: NodeJS.Timeout | null = null;
    if (timerState.status === 'running') {
      intervalId = setInterval(updateTick, 500); // 500ms for smooth sync
    }

    // Critical handler: when mobile phone screen turns back on or tab regains visibility
    const handleVisibilityOrFocus = () => {
      updateTick();
      if (timerState.status === 'running' && timerState.keepAwake && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
    };
  }, [timerState, computeCurrentTimes]);

  const handlePomodoroFinished = (totalElapsedSeconds: number) => {
    // Play sound and trigger confetti
    if (timerState.soundEnabled) {
      playTimerChime();
    }

    // Trigger system notification if screen is off or in background
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Session Completed! 🎉', {
          body: `Great job! Your ${timerState.subject} session has been saved to your history.`,
        });
      }
    } catch {
      // ignore
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Capped at the target Pomodoro duration (so if the user wakes their phone after 1 hour, it accurately records the scheduled Pomodoro block)
    const minutesSpent = Math.max(1, Math.round(timerState.targetDurationSeconds / 60));
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    onSessionComplete({
      subject: timerState.subject,
      topic: timerState.topic.trim() || `${timerState.subject} Pomodoro Focus`,
      minutes: minutesSpent,
      timeRange: 'Pomodoro Completed',
      date: dateStr,
      createdAt: Date.now(),
    });

    setTimerState(prev => ({
      ...prev,
      status: 'idle',
      startTimestamp: null,
      elapsedBeforeLastStart: 0,
      pausedTimestamp: null,
    }));
    setDisplaySeconds(timerState.targetDurationSeconds);
    completedSessionRef.current = false;
    setIsCompletedModalOpen(true);
  };

  const startTimer = () => {
    completedSessionRef.current = false;
    if (timerState.soundEnabled) {
      playStartSound();
    }

    // Request notification permission if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission().catch(() => {});
      } catch {
        // ignore
      }
    }

    setTimerState(prev => ({
      ...prev,
      status: 'running',
      startTimestamp: Date.now(),
      pausedTimestamp: null,
    }));
  };

  const pauseTimer = () => {
    if (timerState.status !== 'running') return;
    const now = Date.now();
    const currentRunSeconds = prevStart(timerState.startTimestamp, now);
    const totalElapsed = timerState.elapsedBeforeLastStart + currentRunSeconds;

    setTimerState(prev => ({
      ...prev,
      status: 'paused',
      startTimestamp: null,
      elapsedBeforeLastStart: totalElapsed,
      pausedTimestamp: now,
    }));
  };

  const resumeTimer = () => {
    if (timerState.status !== 'paused') return;
    if (timerState.soundEnabled) {
      playStartSound();
    }
    setTimerState(prev => ({
      ...prev,
      status: 'running',
      startTimestamp: Date.now(),
      pausedTimestamp: null,
    }));
  };

  const stopAndSave = () => {
    const { elapsed } = computeCurrentTimes();
    const minutes = Math.max(1, Math.round(elapsed / 60));

    if (timerState.soundEnabled) {
      playTimerChime();
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    onSessionComplete({
      subject: timerState.subject,
      topic: timerState.topic.trim() || `${timerState.subject} Focus Session`,
      minutes,
      timeRange: timerState.mode === 'pomodoro' ? 'Pomodoro Session' : 'Stopwatch Session',
      date: dateStr,
      createdAt: Date.now(),
    });

    resetTimer();
    setIsTimerModalOpen(false);
  };

  const resetTimer = () => {
    completedSessionRef.current = false;
    setTimerState(prev => ({
      ...prev,
      status: 'idle',
      startTimestamp: null,
      elapsedBeforeLastStart: 0,
      pausedTimestamp: null,
    }));
    if (timerState.mode === 'pomodoro') {
      setDisplaySeconds(timerState.targetDurationSeconds);
    } else {
      setDisplaySeconds(0);
    }
  };

  const setMode = (mode: TimerMode) => {
    if (timerState.status === 'running') {
      pauseTimer();
    }
    setTimerState(prev => ({
      ...prev,
      mode,
      status: 'idle',
      startTimestamp: null,
      elapsedBeforeLastStart: 0,
      pausedTimestamp: null,
    }));
    if (mode === 'pomodoro') {
      setDisplaySeconds(timerState.targetDurationSeconds);
    } else {
      setDisplaySeconds(0);
    }
  };

  const setSubject = (subject: SubjectType) => {
    setTimerState(prev => ({ ...prev, subject }));
  };

  const setTopic = (topic: string) => {
    setTimerState(prev => ({ ...prev, topic }));
  };

  const setTargetDuration = (seconds: number) => {
    if (timerState.status === 'running') return;
    setTimerState(prev => ({
      ...prev,
      targetDurationSeconds: seconds,
      elapsedBeforeLastStart: 0,
    }));
    if (timerState.mode === 'pomodoro') {
      setDisplaySeconds(seconds);
    }
  };

  const toggleKeepAwake = () => {
    setTimerState(prev => ({ ...prev, keepAwake: !prev.keepAwake }));
  };

  const toggleSound = () => {
    setTimerState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return {
    timerState,
    displaySeconds,
    isTimerModalOpen,
    setIsTimerModalOpen,
    isCompletedModalOpen,
    setIsCompletedModalOpen,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSave,
    resetTimer,
    setMode,
    setSubject,
    setTopic,
    setTargetDuration,
    toggleKeepAwake,
    toggleSound,
  };
}

function prevStart(startTimestamp: number | null, now: number): number {
  if (!startTimestamp) return 0;
  return Math.floor((now - startTimestamp) / 1000);
}
