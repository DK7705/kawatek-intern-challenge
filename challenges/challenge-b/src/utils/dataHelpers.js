export function getAverageAccuracy(sessions) {
  const allAccuracies = sessions.flatMap(s =>
    s.exercises.map(e => e.accuracy_percent)
  );
  if (allAccuracies.length === 0) return 0;
  return allAccuracies.reduce((sum, v) => sum + v, 0) / allAccuracies.length;
}

export function getLatestSession(sessions) {
  return sessions[sessions.length - 1];
}

export function getExerciseNames(sessions) {
  const seen = new Set();
  const names = [];
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!seen.has(exercise.name)) {
        seen.add(exercise.name);
        names.push(exercise.name);
      }
    }
  }
  return names;
}

export function getExerciseHistory(sessions, exerciseName) {
  return sessions
    .filter(s => s.exercises.some(e => e.name === exerciseName))
    .map(s => {
      const exercise = s.exercises.find(e => e.name === exerciseName);
      return {
        sessionId: s.session_id,
        date: s.date,
        ...exercise,
      };
    });
}

export function getSessionAverageAccuracy(session) {
  const exercises = session.exercises;
  if (exercises.length === 0) return 0;
  return exercises.reduce((sum, e) => sum + e.accuracy_percent, 0) / exercises.length;
}

export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${day}`;
}

export function computeLinearRegression(points) {
  const n = points.length;

  if (n === 0) {
    return { slope: 0, intercept: 0, rSquared: 0, predict: () => 0 };
  }

  if (n === 1) {
    const y = points[0].y;
    return { slope: 0, intercept: y, rSquared: 1, predict: () => y };
  }

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const meanY = sumY / n;

  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    return { slope: 0, intercept: meanY, rSquared: 0, predict: () => meanY };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    slope,
    intercept,
    rSquared,
    predict: (x) => slope * x + intercept,
  };
}

export function computeDeltas(sessionA, sessionB) {
  const namesA = new Set(sessionA.exercises.map(e => e.name));
  const namesB = new Set(sessionB.exercises.map(e => e.name));
  const allNames = Array.from(new Set([...namesA, ...namesB]));

  return allNames.map(name => {
    const exA = sessionA.exercises.find(e => e.name === name);
    const exB = sessionB.exercises.find(e => e.name === name);

    const accuracyA = exA ? exA.accuracy_percent : null;
    const fatigueA = exA ? exA.fatigue_index : null;
    const accuracyB = exB ? exB.accuracy_percent : null;
    const fatigueB = exB ? exB.fatigue_index : null;

    const accuracyDelta = (exA && exB) ? (exB.accuracy_percent - exA.accuracy_percent) : null;
    const fatigueDelta = (exA && exB) ? (exB.fatigue_index - exA.fatigue_index) : null;

    return {
      name,
      accuracyA,
      fatigueA,
      accuracyB,
      fatigueB,
      accuracyDelta,
      fatigueDelta,
    };
  });
}

