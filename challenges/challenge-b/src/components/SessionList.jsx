import { useState, useCallback } from 'react';
import { formatDate } from '../utils/dataHelpers';

function accuracyColor(val) {
  if (val >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (val >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function fatigueColor(val) {
  if (val <= 0.3) return 'text-emerald-600 dark:text-emerald-400';
  if (val <= 0.6) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function SessionList({ sessions, onCompareSelect, selectedCompareIds = [] }) {
  const [expandedIds, setExpandedIds] = useState(new Set());


  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sorted = [...sessions].reverse();

  return (
    <section>
      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Session History
      </h3>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2 print:hidden">
        {sorted.map((session) => {
          const isExpanded = expandedIds.has(session.session_id);
          const isSimulated = session.simulated === true;

          return (
            <div
              key={session.session_id}
              className={`border rounded-lg overflow-hidden ${
                isSimulated
                  ? 'border-dashed border-clinical-500/50'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggleExpand(session.session_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(session.session_id);
                  }
                }}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-clinical-500">
                    #{session.session_id}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {formatDate(session.date)}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                    {session.duration_minutes}min
                  </span>
                  {isSimulated && (
                    <span className="flex items-center gap-1 text-xs text-clinical-500 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clinical-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-clinical-500" />
                      </span>
                      SIMULATED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-clinical-500 rounded-full"
                      style={{ width: `${session.overall_progress_percent}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-200">
                    {session.overall_progress_percent}%
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
                  <table className="w-full text-sm mt-3">
                    <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="text-left py-2 pr-4">Exercise</th>
                        <th className="text-right py-2 px-2">Reps</th>
                        <th className="text-right py-2 px-2">Accuracy</th>
                        <th className="text-right py-2 px-2">Resp. Time</th>
                        <th className="text-right py-2 pl-2">Fatigue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.exercises.map((ex) => (
                        <tr
                          key={ex.name}
                          className="border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                        >
                          <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200">
                            {ex.name}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-600 dark:text-slate-300">
                            {ex.repetitions}
                          </td>
                          <td className={`py-2 px-2 text-right font-mono ${accuracyColor(ex.accuracy_percent)}`}>
                            {ex.accuracy_percent}%
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-600 dark:text-slate-300">
                            {ex.avg_response_time_ms}ms
                          </td>
                          <td className={`py-2 pl-2 text-right font-mono ${fatigueColor(ex.fatigue_index)}`}>
                            {ex.fatigue_index.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>EMG Quality:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                        {session.emg_quality_score.toFixed(2)}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-clinical-500 rounded-full"
                          style={{ width: `${session.emg_quality_score * 100}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareSelect(session.session_id);
                      }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
                        selectedCompareIds.includes(session.session_id)
                          ? 'bg-clinical-500 text-white border-clinical-500 hover:bg-clinical-600'
                          : 'text-clinical-500 border-clinical-500/30 hover:bg-clinical-500/10'
                      }`}
                    >
                      {selectedCompareIds.includes(session.session_id) ? '✓ Selected' : 'Select for Compare'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Print-only Session History Table */}
      <div className="hidden print:block mt-2">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="border-b border-slate-300 font-mono text-[8px] uppercase tracking-wider text-slate-500 text-left">
              <th className="py-1 pr-2">Session</th>
              <th className="py-1 px-2">Date</th>
              <th className="py-1 px-2 text-right">Duration</th>
              <th className="py-1 px-2 text-right">Avg Accuracy</th>
              <th className="py-1 px-2 text-right">Progress</th>
              <th className="py-1 pl-2 text-right">EMG Quality</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const avgAccuracy = s.exercises.length === 0
                ? 0
                : s.exercises.reduce((sum, e) => sum + e.accuracy_percent, 0) / s.exercises.length;
              return (
                <tr key={s.session_id} className="border-b border-slate-100 last:border-0">
                  <td className="py-1 pr-2 font-mono font-bold text-slate-900">#{s.session_id}</td>
                  <td className="py-1 px-2 text-slate-700">{s.date}</td>
                  <td className="py-1 px-2 text-right text-slate-700">{s.duration_minutes}m</td>
                  <td className="py-1 px-2 text-right font-mono text-slate-900">{avgAccuracy.toFixed(1)}%</td>
                  <td className="py-1 px-2 text-right font-mono text-slate-900">{s.overall_progress_percent}%</td>
                  <td className="py-1 pl-2 text-right font-mono text-slate-900">{s.emg_quality_score.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

