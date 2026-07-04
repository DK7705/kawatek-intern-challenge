import {
  computeLinearRegression,
  getExerciseNames,
  getExerciseHistory,
  getLatestSession,
  getSessionAverageAccuracy,
} from '../utils/dataHelpers';

function checkMasteryProgression(sessions, exerciseName, history) {
  if (history.length < 3) return null;

  const lastThree = history.slice(-3);
  const allAbove80 = lastThree.every(h => h.accuracy_percent > 80);
  if (!allAbove80) return null;

  const points = history.map((h, i) => ({ x: i, y: h.accuracy_percent }));
  const regression = computeLinearRegression(points);
  const predicted = Math.min(100, regression.predict(history.length));

  return {
    id: `mastery-${exerciseName}`,
    priority: 'info',
    title: `${exerciseName}: Mastery Level Reached`,
    body: `Accuracy exceeded 80% for the last 3 sessions (${lastThree.map(h => `${h.accuracy_percent}%`).join(', ')}). Regression predicts ${predicted.toFixed(1)}% for next session. Consider advancing difficulty or introducing new exercise variants.`,
    exercise: exerciseName,
    type: 'ml',
  };
}

function checkFatigueAlert(sessions, exerciseName, history) {
  const latest = history[history.length - 1];
  if (!latest) return null;

  const points = history.map((h, i) => ({ x: i, y: h.fatigue_index }));
  const regression = computeLinearRegression(points);
  const predicted = regression.predict(history.length);

  if (latest.fatigue_index > 0.6 || predicted > 0.65) {
    const currentValue = latest.fatigue_index.toFixed(2);
    const predictedValue = predicted.toFixed(2);
    return {
      id: `fatigue-${exerciseName}`,
      priority: 'high',
      title: `${exerciseName}: High Fatigue Warning`,
      body: `Current fatigue index is ${currentValue}${predicted > 0.65 ? ` with predicted trend to ${predictedValue}` : ''}. Consider reducing repetitions or extending rest periods to prevent overexertion.`,
      exercise: exerciseName,
      type: 'ml',
    };
  }
  return null;
}

function checkNewExerciseRampUp(sessions, exerciseName, history) {
  if (history.length >= 4) return null;

  const latest = history[history.length - 1];
  if (latest.accuracy_percent >= 60) return null;

  const progression = history.map(h => `${h.accuracy_percent}%`).join(' → ');
  return {
    id: `rampup-${exerciseName}`,
    priority: 'medium',
    title: `${exerciseName}: New Exercise Needs Attention`,
    body: `Only ${history.length} session${history.length > 1 ? 's' : ''} recorded with accuracy progression: ${progression}. Latest accuracy at ${latest.accuracy_percent}% is below 60% threshold. Additional guided practice recommended.`,
    exercise: exerciseName,
    type: 'ml',
  };
}

function checkResponseTimeImprovement(sessions, exerciseName, history) {
  if (history.length < 2) return null;

  const first = history[0];
  const latest = history[history.length - 1];
  const change = ((first.avg_response_time_ms - latest.avg_response_time_ms) / first.avg_response_time_ms) * 100;

  if (change > 40) {
    return {
      id: `response-${exerciseName}`,
      priority: 'info',
      title: `${exerciseName}: Significant Response Time Improvement`,
      body: `Response time decreased from ${first.avg_response_time_ms}ms to ${latest.avg_response_time_ms}ms (${change.toFixed(1)}% improvement). This indicates strong neuromuscular adaptation.`,
      exercise: exerciseName,
      type: 'ml',
    };
  }
  return null;
}

function checkPlateauDetection(sessions, exerciseName, history) {
  if (history.length < 3) return null;

  const latest = history[history.length - 1];
  if (latest.accuracy_percent < 60 || latest.accuracy_percent > 80) return null;

  const points = history.map((h, i) => ({ x: i, y: h.accuracy_percent }));
  const regression = computeLinearRegression(points);
  const currentPredicted = regression.predict(history.length - 1);
  const nextPredicted = regression.predict(history.length);
  const predictedGain = nextPredicted - currentPredicted;

  if (predictedGain < 2) {
    return {
      id: `plateau-${exerciseName}`,
      priority: 'medium',
      title: `${exerciseName}: Performance Plateau Detected`,
      body: `Current accuracy at ${latest.accuracy_percent}% with predicted gain of only ${predictedGain.toFixed(1)}% per session. Consider varying exercise parameters or introducing new challenges to break through the plateau.`,
      exercise: exerciseName,
      type: 'ml',
    };
  }
  return null;
}

function checkEmgQualityTrend(sessions) {
  if (sessions.length < 2) return null;

  const points = sessions.map((s, i) => ({ x: i, y: s.emg_quality_score }));
  const regression = computeLinearRegression(points);
  const startValue = sessions[0].emg_quality_score;
  const endValue = sessions[sessions.length - 1].emg_quality_score;

  const priority = regression.slope > 0 ? 'info' : 'medium';
  const trend = regression.slope > 0 ? 'improving' : 'declining';

  return {
    id: 'emg-quality-trend',
    priority,
    title: `EMG Signal Quality: ${trend.charAt(0).toUpperCase() + trend.slice(1)} Trend`,
    body: `EMG quality score progressed from ${startValue.toFixed(2)} to ${endValue.toFixed(2)} (R² = ${regression.rSquared.toFixed(3)}). ${regression.slope > 0 ? 'Signal acquisition is improving, indicating better electrode placement and muscle engagement.' : 'Review electrode placement and skin preparation procedures.'}`,
    exercise: null,
    type: 'ml',
  };
}

const PRIORITY_ORDER = { high: 0, medium: 1, info: 2 };

export function generateRecommendations(sessions) {
  if (!sessions || sessions.length === 0) return [];

  const recommendations = [];
  const exerciseNames = getExerciseNames(sessions);

  for (const name of exerciseNames) {
    const history = getExerciseHistory(sessions, name);

    const mastery = checkMasteryProgression(sessions, name, history);
    if (mastery) recommendations.push(mastery);

    const fatigue = checkFatigueAlert(sessions, name, history);
    if (fatigue) recommendations.push(fatigue);

    const rampUp = checkNewExerciseRampUp(sessions, name, history);
    if (rampUp) recommendations.push(rampUp);

    const responseTime = checkResponseTimeImprovement(sessions, name, history);
    if (responseTime) recommendations.push(responseTime);

    const plateau = checkPlateauDetection(sessions, name, history);
    if (plateau) recommendations.push(plateau);
  }

  const emgTrend = checkEmgQualityTrend(sessions);
  if (emgTrend) recommendations.push(emgTrend);

  recommendations.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return recommendations;
}
