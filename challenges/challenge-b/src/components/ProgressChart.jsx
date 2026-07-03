import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { getSessionAverageAccuracy, formatDate } from '../utils/dataHelpers';
import { getThemeColors, createResponsiveChart } from '../utils/chartHelpers';

export default function ProgressChart({ sessions, isDark }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!sessions?.length || !containerRef.current) return;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      d3.select(container).selectAll('svg').remove();
      d3.select(container).selectAll('.chart-tooltip').remove();

      const width = container.clientWidth;
      const height = Math.min(400, width * 0.45);
      const margin = { top: 24, right: 60, bottom: 40, left: 50 };
      const colors = getThemeColors(isDark);

      const labels = sessions.map((s) => formatDate(s.date));
      const accuracyData = sessions.map((s) => getSessionAverageAccuracy(s));
      const progressData = sessions.map((s) => s.overall_progress_percent);

      const x = d3.scalePoint().domain(labels).range([margin.left, width - margin.right]);
      const y = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

      const svg = d3
        .select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto')
        .attr('role', 'img')
        .attr('aria-label', 'Progress over time chart showing accuracy and overall progress');

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
        .attr('font-size', '11px')
        .attr('transform', labels.length > 10 ? 'rotate(-45)' : null)
        .style('text-anchor', labels.length > 10 ? 'end' : 'middle');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((d) => `${d}%`)
            .tickSize(0)
            .tickPadding(8)
        )
        .call((g) => g.select('.domain').attr('stroke', colors.grid))
        .selectAll('text')
        .attr('fill', colors.text)
        .attr('font-size', '11px');

      const line = d3
        .line()
        .x((_, i) => x(labels[i]))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);

      const progressLineColor = isDark ? '#64748b' : '#94a3b8';

      svg
        .append('path')
        .datum(progressData)
        .attr('fill', 'none')
        .attr('stroke', progressLineColor)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,3')
        .attr('d', line);

      svg
        .append('path')
        .datum(accuracyData)
        .attr('fill', 'none')
        .attr('stroke', '#0d9488')
        .attr('stroke-width', 2.5)
        .attr('d', line);

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

      sessions.forEach((session, i) => {
        const isSimulated = session.simulated === true;

        svg
          .append('circle')
          .attr('cx', x(labels[i]))
          .attr('cy', y(progressData[i]))
          .attr('r', 4)
          .attr('fill', progressLineColor)
          .attr('opacity', isSimulated ? 0.5 : 1)
          .attr('stroke-dasharray', isSimulated ? '2,2' : 'none');

        svg
          .append('circle')
          .attr('cx', x(labels[i]))
          .attr('cy', y(accuracyData[i]))
          .attr('r', 4)
          .attr('fill', '#0d9488')
          .attr('opacity', isSimulated ? 0.5 : 1)
          .attr('stroke-dasharray', isSimulated ? '2,2' : 'none')
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            tooltip
              .style('opacity', 1)
              .html(
                `<strong>Session ${session.session_id}</strong><br/>` +
                  `${formatDate(session.date)}<br/>` +
                  `Accuracy: ${accuracyData[i].toFixed(1)}%<br/>` +
                  `Progress: ${progressData[i]}%`
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

      const legendX = width - margin.right - 10;
      const legendY = margin.top;

      svg.append('line').attr('x1', legendX - 50).attr('x2', legendX - 30).attr('y1', legendY).attr('y2', legendY).attr('stroke', '#0d9488').attr('stroke-width', 2.5);
      svg.append('text').attr('x', legendX - 25).attr('y', legendY + 4).text('Accuracy').attr('fill', colors.text).attr('font-size', '11px');

      svg.append('line').attr('x1', legendX - 50).attr('x2', legendX - 30).attr('y1', legendY + 18).attr('y2', legendY + 18).attr('stroke', progressLineColor).attr('stroke-width', 2).attr('stroke-dasharray', '6,3');
      svg.append('text').attr('x', legendX - 25).attr('y', legendY + 22).text('Progress').attr('fill', colors.text).attr('font-size', '11px');
    };

    render();
    const cleanup = createResponsiveChart(containerRef.current, render);
    return cleanup;
  }, [sessions, isDark]);

  return (
    <section>
      <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Progress Over Time
      </h3>
      <div
        ref={containerRef}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 relative"
      />
    </section>
  );
}
