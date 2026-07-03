export const EXERCISE_COLORS = {
  'Power Grip Training': '#0d9488',
  'Pinch Control': '#6366f1',
  'Lateral Grip': '#f59e0b',
  'Point Control': '#ef4444',
  'Combined Grip Sequence': '#8b5cf6',
};

export function getThemeColors(isDark) {
  return isDark
    ? {
        axis: '#94a3b8',
        grid: '#334155',
        text: '#e2e8f0',
        background: '#1e293b',
        tooltip: '#0f172a',
        tooltipText: '#f8fafc',
      }
    : {
        axis: '#64748b',
        grid: '#e2e8f0',
        text: '#1e293b',
        background: '#ffffff',
        tooltip: '#1e293b',
        tooltipText: '#f8fafc',
      };
}

export const FATIGUE_ZONES = [
  { label: 'Low', min: 0, max: 0.3, color: 'rgba(34,197,94,0.08)', darkColor: 'rgba(34,197,94,0.12)' },
  { label: 'Moderate', min: 0.3, max: 0.6, color: 'rgba(245,158,11,0.08)', darkColor: 'rgba(245,158,11,0.12)' },
  { label: 'High', min: 0.6, max: 1.0, color: 'rgba(239,68,68,0.08)', darkColor: 'rgba(239,68,68,0.12)' },
];

export function createResponsiveChart(containerRef, renderFn) {
  const container = containerRef.current;
  if (!container) return () => {};

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        renderFn(width, height);
      }
    }
  });

  observer.observe(container);

  const rect = container.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    renderFn(rect.width, rect.height);
  }

  return () => observer.disconnect();
}
