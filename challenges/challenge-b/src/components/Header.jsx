export default function Header({ patient, isDark, onToggleTheme, simulation, onPrint, onCompare, selectedCompareIds }) {
  const btnBase = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors';
  const hasCompareSelections = selectedCompareIds?.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-clinical-500" />
              <div>
                <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">ACTIVAI</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">Rehabilitation Dashboard</span>
              </div>
            </div>
            {patient && (
              <div className="flex items-center gap-2 flex-wrap">
                <Pill label={patient.id} />
                <Pill label={patient.device} />
                <Pill label={patient.therapist} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onToggleTheme}
              className={`${btnBase} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <button
              onClick={onCompare}
              className={`${btnBase} ${
                hasCompareSelections
                  ? 'bg-clinical-500/10 text-clinical-500 border border-clinical-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M2 4.5A2.5 2.5 0 014.5 2h11A2.5 2.5 0 0118 4.5v3a.5.5 0 01-1 0v-3A1.5 1.5 0 0015.5 3h-11A1.5 1.5 0 003 4.5v11A1.5 1.5 0 004.5 17h3a.5.5 0 010 1h-3A2.5 2.5 0 012 15.5v-11z" />
                <path d="M8 9.5A2.5 2.5 0 0110.5 7h5A2.5 2.5 0 0118 9.5v5a2.5 2.5 0 01-2.5 2.5h-5A2.5 2.5 0 018 14.5v-5zm2.5-1.5A1.5 1.5 0 009 9.5v5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0015.5 8h-5z" />
              </svg>
              <span className="hidden sm:inline">
                Compare {hasCompareSelections ? `(${selectedCompareIds.length}/2)` : ''}
              </span>
            </button>

            <button
              onClick={onPrint}
              className={`${btnBase} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>

            {simulation.isRunning ? (
              <button
                onClick={simulation.stop}
                className={`${btnBase} bg-clinical-500 text-white hover:bg-clinical-600`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                Stop
              </button>
            ) : (
              <button
                onClick={simulation.start}
                className={`${btnBase} border border-clinical-500 text-clinical-500 hover:bg-clinical-500/10`}
              >
                Start Live Session
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Pill({ label }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
      {label}
    </span>
  );
}
