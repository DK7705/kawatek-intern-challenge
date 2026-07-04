export default function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-start justify-center pt-24">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <svg
          className="w-16 h-16 text-red-400 mb-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Failed to Load Patient Data
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-clinical-500 hover:bg-clinical-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311V15.5a.75.75 0 01-1.5 0v-4.25a.75.75 0 01.75-.75h4.25a.75.75 0 010 1.5H7.378l.313.312a4 4 0 006.693-1.794.75.75 0 011.428.456zM4.688 8.576a5.5 5.5 0 019.201-2.466l.312.311V4.5a.75.75 0 011.5 0v4.25a.75.75 0 01-.75.75h-4.25a.75.75 0 010-1.5h1.921l-.312-.312a4 4 0 00-6.694 1.794.75.75 0 01-1.428-.456z"
              clipRule="evenodd"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}
