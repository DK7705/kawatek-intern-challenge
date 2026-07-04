import { useState, useRef, useCallback } from 'react';
import { computeLinearRegression, getExerciseHistory, getExerciseNames } from '../utils/dataHelpers';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function predictValue(sessions, accessor, clampMin, clampMax) {
  const points = sessions.map((s, i) => ({ x: i, y: accessor(s) }));
  const regression = computeLinearRegression(points);
  return clamp(regression.predict(sessions.length), clampMin, clampMax);
}

function buildSimulatedSession(sessions) {
  const lastSession = sessions[sessions.length - 1];
  const exerciseNames = getExerciseNames(sessions);

  const exercises = exerciseNames.map((name) => {
    const history = getExerciseHistory(sessions, name);

    const accPoints = history.map((h, i) => ({ x: i, y: h.accuracy_percent }));
    const rtPoints = history.map((h, i) => ({ x: i, y: h.avg_response_time_ms }));
    const fatPoints = history.map((h, i) => ({ x: i, y: h.fatigue_index }));
    const repPoints = history.map((h, i) => ({ x: i, y: h.repetitions }));

    return {
      name,
      accuracy_percent: Math.round(clamp(computeLinearRegression(accPoints).predict(history.length), 0, 100)),
      avg_response_time_ms: Math.round(clamp(computeLinearRegression(rtPoints).predict(history.length), 100, Infinity)),
      fatigue_index: parseFloat(clamp(computeLinearRegression(fatPoints).predict(history.length), 0, 1).toFixed(2)),
      repetitions: Math.max(1, Math.round(computeLinearRegression(repPoints).predict(history.length))),
    };
  });

  return {
    session_id: sessions.length + 1,
    date: addDays(lastSession.date, 3),
    duration_minutes: Math.round(predictValue(sessions, s => s.duration_minutes, 10, 120)),
    emg_quality_score: parseFloat(predictValue(sessions, s => s.emg_quality_score, 0, 1).toFixed(2)),
    overall_progress_percent: Math.round(predictValue(sessions, s => s.overall_progress_percent, 0, 100)),
    simulated: true,
    exercises,
  };
}

export function useSimulation(sessions) {
  const [simulatedSession, setSimulatedSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setSimulatedSession(null);
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    if (!sessions || sessions.length === 0) return;

    stop();
    setIsRunning(true);

    const fullSession = buildSimulatedSession(sessions);
    const allExercises = fullSession.exercises;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setSimulatedSession(fullSession);
      setProgress(100);
      setIsRunning(false);
      return;
    }

    let currentIndex = 0;
    setSimulatedSession({ ...fullSession, exercises: [] });
    setProgress(0);

    intervalRef.current = setInterval(() => {
      currentIndex++;
      const visibleExercises = allExercises.slice(0, currentIndex);
      setSimulatedSession({ ...fullSession, exercises: visibleExercises });
      setProgress(Math.round((currentIndex / allExercises.length) * 100));

      if (currentIndex >= allExercises.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, 1500);
  }, [sessions, stop]);

  return { isRunning, simulatedSession, start, stop, progress };
}
