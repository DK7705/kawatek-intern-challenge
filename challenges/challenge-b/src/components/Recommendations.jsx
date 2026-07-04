const PRIORITY_STYLES = {
  high: {
    border: '#ef4444',
    pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    border: '#f59e0b',
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  info: {
    border: '#0d9488',
    pill: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  },
};

export default function Recommendations({ recommendations }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-clinical-500">
          <path d="M10 1l2.39 4.845 5.346.777-3.868 3.77.913 5.325L10 13.347l-4.781 2.37.913-5.324L2.264 6.622l5.346-.777L10 1z" />
        </svg>
        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
          AI Recommendations
        </h3>
      </div>
      <div className="max-h-[600px] overflow-y-auto space-y-3 print:max-h-none print:overflow-visible">
        {recommendations === null
          ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          : recommendations.map((rec) => <RecommendationCard key={rec.id} rec={rec} />)}
      </div>
    </section>
  );
}

function RecommendationCard({ rec }) {
  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.info;

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
      style={{ borderLeft: `4px solid ${style.border}` }}
    >
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${style.pill}`}>
          {rec.priority}
        </span>
        <span className="bg-clinical-500/10 text-clinical-500 text-xs px-1.5 py-0.5 rounded font-mono">
          ML
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">{rec.title}</p>
      <p
        className="text-sm text-slate-600 dark:text-slate-300 mt-1"
        dangerouslySetInnerHTML={{ __html: rec.body }}
      />
      {rec.exercise && (
        <span className="bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 px-2 py-1 rounded mt-2 inline-block">
          {rec.exercise}
        </span>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
}
