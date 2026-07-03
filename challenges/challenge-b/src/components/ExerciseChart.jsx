import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getLatestSession } from '../utils/dataHelpers';
import { EXERCISE_COLORS, getThemeColors, createResponsiveChart } from '../utils/chartHelpers';

const METRICS = [
  { key: 'accuracy', label: 'Accuracy', field: 'accuracy_percent', domain: [0, 100], suffix: '%' },
  { key: 'responseTime', label: 'Response Time', field: 'avg_response_time_ms', suffix: 'ms' },
  { key: 'fatigue', label: 'Fatigue', field: 'fatigue_index', domain: [0, 1], suffix: '' },
];

export default function ExerciseChart({ sessions, isDark }) {
  const containerRef = useRef(null);
  const [metric, setMetric] = useState('accuracy');

  useEffect(() => {
    if (!sessions?.length || !containerRef.current) return;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      d3.select(container).selectAll('svg').remove();

      const latest = getLatestSession(sessions);
      const exercises = latest.exercises;
      const metricConfig = METRICS.find((m) => m.key === metric);
      const colors = getThemeColors(isDark);

      const width = container.clientWidth;
      const height = container.clientHeight || Math.min(350, width * 0.5);
      const margin = { top: 20, right: 20, bottom: 60, left: 50 };

      const values = exercises.map((ex) => ex[metricConfig.field]);
      const domainMax = metricConfig.domain
        ? metricConfig.domain[1]
        : d3.max(values) + (metricConfig.key === 'responseTime' ? 100 : 0);

      const x = d3.scaleBand().domain(exercises.map((ex) => ex.name)).range([margin.left, width - margin.right]).padding(0.3);
      const y = d3.scaleLinear().domain([0, domainMax]).range([height - margin.bottom, margin.top]);

      const svg = d3
        .select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', '100%')
        .attr('role', 'img')
        .attr('aria-label', `Exercise breakdown bar chart showing ${metricConfig.label}`);

      svg
        .selectAll('.grid-line')
        .data(y.ticks(5))
        .join('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))
        .attr('stroke', colors.grid)
        .attr('stroke-width', 1);

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
        .call((g) => g.select('.domain').attr('stroke', colors.grid))
        .selectAll('text')
        .attr('fill', colors.text)
        .attr('font-size', '10px')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-25)');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((d) => `${d}${metricConfig.suffix}`)
            .tickSize(0)
            .tickPadding(8)
        )
        .call((g) => g.select('.domain').attr('stroke', colors.grid))
        .selectAll('text')
        .attr('fill', colors.text)
        .attr('font-size', '11px');

      svg
        .selectAll('.bar')
        .data(exercises)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.name))
        .attr('width', x.bandwidth())
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .attr('fill', (d) => EXERCISE_COLORS[d.name] || '#0d9488')
        .attr('rx', 4)
        .transition()
        .duration(500)
        .attr('y', (d) => y(d[metricConfig.field]))
        .attr('height', (d) => height - margin.bottom - y(d[metricConfig.field]));

      svg
        .selectAll('.label')
        .data(exercises)
        .join('text')
        .attr('class', 'label')
        .attr('x', (d) => x(d.name) + x.bandwidth() / 2)
        .attr('y', (d) => y(d[metricConfig.field]) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .text((d) => {
          const val = d[metricConfig.field];
          return metricConfig.key === 'fatigue' ? val.toFixed(2) : `${val}${metricConfig.suffix}`;
        });
    };

    render();
    const cleanup = createResponsiveChart(containerRef.current, render);
    return cleanup;
  }, [sessions, isDark, metric]);

  const latest = sessions?.length ? getLatestSession(sessions) : null;

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
          Exercise Breakdown{latest ? ` — Session ${latest.session_id}` : ''}
        </h3>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                metric === m.key
                  ? 'bg-clinical-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex-1 w-full min-h-[300px]"
      />
    </section>
  );
}
