import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { getExerciseNames, getExerciseHistory } from '../utils/dataHelpers';
import { EXERCISE_COLORS, getThemeColors, FATIGUE_ZONES, createResponsiveChart } from '../utils/chartHelpers';

export default function FatigueChart({ sessions, isDark }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!sessions?.length || !containerRef.current) return;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      d3.select(container).selectAll('svg').remove();
      d3.select(container).selectAll('.chart-tooltip').remove();

      const colors = getThemeColors(isDark);
      const exerciseNames = getExerciseNames(sessions);
      const width = container.clientWidth;
      const height = Math.min(400, width * 0.45);
      const margin = { top: 20, right: 80, bottom: 50, left: 50 };

      const labels = sessions.map((_, i) => `S${i + 1}`);
      const x = d3.scalePoint().domain(labels).range([margin.left, width - margin.right]);
      const y = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

      const svg = d3
        .select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto')
        .attr('role', 'img')
        .attr('aria-label', 'Fatigue analysis chart showing fatigue index trends by exercise');

      FATIGUE_ZONES.forEach((zone) => {
        const yTop = y(zone.max);
        const yBottom = y(zone.min);
        svg
          .append('rect')
          .attr('x', margin.left)
          .attr('width', width - margin.left - margin.right)
          .attr('y', yTop)
          .attr('height', yBottom - yTop)
          .attr('fill', zone.color)
          .attr('opacity', 0.08);

        svg
          .append('text')
          .attr('x', width - margin.right + 6)
          .attr('y', (yTop + yBottom) / 2 + 4)
          .attr('fill', colors.text)
          .attr('font-size', '10px')
          .attr('opacity', 0.6)
          .text(zone.label);
      });

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
        .call((g) => g.select('.domain').attr('stroke', colors.grid))
        .selectAll('text')
        .attr('fill', colors.text)
        .attr('font-size', '11px');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
        .call((g) => g.select('.domain').attr('stroke', colors.grid))
        .selectAll('text')
        .attr('fill', colors.text)
        .attr('font-size', '11px');

      const tooltip = d3
        .select(container)
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('background', isDark ? '#1e293b' : '#fff')
        .style('border', `1px solid ${isDark ? '#334155' : '#e2e8f0'}`)
        .style('border-radius', '8px')
        .style('padding', '8px 12px')
        .style('font-size', '12px')
        .style('color', isDark ? '#e2e8f0' : '#1e293b')
        .style('box-shadow', '0 4px 12px rgba(0,0,0,0.15)')
        .style('z-index', '10');

      const lineGen = d3.line().curve(d3.curveMonotoneX);

      exerciseNames.forEach((name) => {
        const history = getExerciseHistory(sessions, name);
        const points = [];

        sessions.forEach((session, idx) => {
          const entry = history.find((h) => h.sessionId === session.session_id);
          if (entry) {
            points.push({ x: labels[idx], y: entry.fatigue_index, session, idx });
          }
        });

        if (points.length < 2) return;

        const color = EXERCISE_COLORS[name] || '#0d9488';

        svg
          .append('path')
          .datum(points)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', lineGen.x((d) => x(d.x)).y((d) => y(d.y)));

        svg
          .selectAll(`.dot-${name.replace(/\s/g, '')}`)
          .data(points)
          .join('circle')
          .attr('cx', (d) => x(d.x))
          .attr('cy', (d) => y(d.y))
          .attr('r', 3.5)
          .attr('fill', color)
          .style('cursor', 'pointer')
          .on('mouseenter', (event, d) => {
            tooltip
              .style('opacity', 1)
              .html(
                `<strong>${name}</strong><br/>Session ${d.idx + 1}<br/>Fatigue: ${d.y.toFixed(2)}`
              );
          })
          .on('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            tooltip
              .style('left', `${event.clientX - rect.left + 12}px`)
              .style('top', `${event.clientY - rect.top - 10}px`);
          })
          .on('mouseleave', () => {
            tooltip.style('opacity', 0);
          });
      });
    };

    render();
    const cleanup = createResponsiveChart(containerRef.current, render);
    return cleanup;
  }, [sessions, isDark]);

  const exerciseNames = sessions?.length ? getExerciseNames(sessions) : [];

  return (
    <section>
      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Fatigue Analysis
      </h3>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div ref={containerRef} className="relative" />
        <div className="flex flex-wrap gap-4 mt-4 px-2">
          {exerciseNames.map((name) => (
            <div key={name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: EXERCISE_COLORS[name] || '#0d9488' }}
              />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
