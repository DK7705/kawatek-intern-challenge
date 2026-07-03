import { getAverageAccuracy, getLatestSession, getSessionAverageAccuracy, formatDate } from '../utils/dataHelpers';

export default function SummaryCards({ sessions }) {
  if (!sessions?.length) return null;

  const latest = getLatestSession(sessions);
  const first = sessions[0];
  const avgAccuracy = getAverageAccuracy(sessions);
  const latestAccuracy = getSessionAverageAccuracy(latest);
  const progressDelta = latest.overall_progress_percent - first.overall_progress_percent;
  const emgImproving = latest.emg_quality_score >= first.emg_quality_score;

  const cards = [
    {
      label: 'Total Sessions',
      value: sessions.length,
      sub: `${formatDate(first.date)} – ${formatDate(latest.date)}`,
    },
    {
      label: 'Avg Accuracy',
      value: `${avgAccuracy.toFixed(1)}%`,
      sub: `Latest: ${latestAccuracy.toFixed(1)}%`,
    },
    {
      label: 'Current Progress',
      value: `${latest.overall_progress_percent}%`,
      sub: `+${progressDelta}% from start`,
    },
    {
      label: 'EMG Quality',
      value: latest.emg_quality_score.toFixed(2),
      sub: `${emgImproving ? '▲' : '▼'} from ${first.emg_quality_score.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5"
          style={{ borderLeft: '4px solid #0d9488' }}
        >
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium">
            {card.label}
          </p>
          <p className="text-3xl font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1">
            {card.value}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
