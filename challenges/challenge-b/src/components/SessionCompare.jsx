import { useState, useEffect, useRef } from 'react';
import { formatDate, computeDeltas } from '../utils/dataHelpers';

export default function SessionCompare({ sessions, selectedIds, isOpen, onClose }) {
  const [localIds, setLocalIds] = useState([
    selectedIds[0] ?? null,
    selectedIds[1] ?? null,
  ]);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    setLocalIds([
      selectedIds[0] ?? null,
      selectedIds[1] ?? null,
    ]);
  }, [selectedIds]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const sessionA = sessions.find((s) => s.session_id === localIds[0]);
  const sessionB = sessions.find((s) => s.session_id === localIds[1]);
  const hasBoth = sessionA && sessionB;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Session Comparison"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
            Session Comparison
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close comparison"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[0, 1].map((idx) => (
              <div key={idx}>
                <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  Session {idx === 0 ? 'A' : 'B'}
                </label>
                <select
                  value={localIds[idx] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setLocalIds((prev) => {
                      const next = [...prev];
                      next[idx] = val;
                      return next;
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-500"
                >
                  <option value="">Select session…</option>
                  {sessions.map((s) => (
                    <option key={s.session_id} value={s.session_id}>
                      Session {s.session_id} — {formatDate(s.date)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {hasBoth && <ComparisonView sessionA={sessionA} sessionB={sessionB} />}
        </div>
      </div>
    </div>
  );
}

function DeltaArrow({ value, invertBetter }) {
  if (value === 0) return <span className="text-slate-400">—</span>;
  const isPositive = value > 0;
  const isGood = invertBetter ? !isPositive : isPositive;
  return (
    <span className={`font-mono text-xs font-medium ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}
    </span>
  );
}

function ComparisonView({ sessionA, sessionB }) {
  const deltas = computeDeltas(sessionA, sessionB);

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <OverviewCard session={sessionA} label="Session A" />
        <div className="flex flex-col items-center justify-center text-sm space-y-2">
          <DeltaRow label="Progress" value={sessionB.overall_progress_percent - sessionA.overall_progress_percent} unit="%" />
          <DeltaRow label="Duration" value={sessionB.duration_minutes - sessionA.duration_minutes} unit="min" />
          <DeltaRow label="EMG" value={sessionB.emg_quality_score - sessionA.emg_quality_score} unit="" decimals={2} />
        </div>
        <OverviewCard session={sessionB} label="Session B" />
      </div>

      <h4 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
        Exercise Comparison
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left py-2 pr-3">Exercise</th>
              <th className="text-right py-2 px-2">A Accuracy</th>
              <th className="text-right py-2 px-2">A Fatigue</th>
              <th className="text-center py-2 px-2">Δ Accuracy</th>
              <th className="text-center py-2 px-2">Δ Fatigue</th>
              <th className="text-right py-2 px-2">B Accuracy</th>
              <th className="text-right py-2 pl-2">B Fatigue</th>
            </tr>
          </thead>
          <tbody>
            {deltas.map((d) => (
              <tr key={d.name} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                <td className="py-2 pr-3 font-medium text-slate-800 dark:text-slate-200">{d.name}</td>
                <td className="py-2 px-2 text-right font-mono">
                  {d.accuracyA !== null ? `${d.accuracyA}%` : '—'}
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  {d.fatigueA !== null ? d.fatigueA.toFixed(2) : '—'}
                </td>
                <td className="py-2 px-2 text-center">
                  {d.accuracyDelta !== null ? <DeltaArrow value={d.accuracyDelta} /> : '—'}
                </td>
                <td className="py-2 px-2 text-center">
                  {d.fatigueDelta !== null ? <DeltaArrow value={d.fatigueDelta} invertBetter /> : '—'}
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  {d.accuracyB !== null ? `${d.accuracyB}%` : '—'}
                </td>
                <td className="py-2 pl-2 text-right font-mono">
                  {d.fatigueB !== null ? d.fatigueB.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OverviewCard({ session, label }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2">
        {label}
      </p>
      <p className="text-lg font-mono font-semibold text-slate-900 dark:text-slate-100">
        #{session.session_id}
      </p>
      <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
        <p>{formatDate(session.date)}</p>
        <p>{session.duration_minutes} minutes</p>
        <p>Progress: {session.overall_progress_percent}%</p>
        <p>EMG: {session.emg_quality_score.toFixed(2)}</p>
      </div>
    </div>
  );
}

function DeltaRow({ label, value, unit, decimals = 0 }) {
  const formatted = decimals > 0 ? value.toFixed(decimals) : value;
  const isPositive = value > 0;
  const color = value === 0 ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-500 dark:text-slate-400 text-xs">{label}:</span>
      <span className={`font-mono text-xs font-medium ${color}`}>
        {isPositive ? '+' : ''}{formatted}{unit}
      </span>
    </div>
  );
}
