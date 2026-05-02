import React, { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import * as d3 from 'd3'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend, Filler,
)

const CHART_DEFAULTS = {
  plugins: {
    legend: {
      labels: { color: '#7c85a2', font: { family: 'Space Mono', size: 11 } },
    },
  },
  scales: {
    x: {
      ticks: { color: '#7c85a2', font: { family: 'Space Mono', size: 10 } },
      grid:  { color: '#1e2333' },
    },
    y: {
      ticks: { color: '#7c85a2', font: { family: 'Space Mono', size: 10 } },
      grid:  { color: '#1e2333' },
    },
  },
}

// ─── Score Distribution Bar ────────────────────────────────────────────────────
export function ScoreDistributionBar({ data }: { data: number[] }) {
  const labels = ['0–20%', '21–40%', '41–60%', '61–80%', '81–100%']
  const colors = ['#f43f5e', '#f97316', '#f59e0b', '#22d3a0', '#5b8af5']
  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'Students',
          data,
          backgroundColor: colors,
          borderRadius: 6,
        }],
      }}
      options={{
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
      }}
    />
  )
}

// ─── Session Score Line ────────────────────────────────────────────────────────
export function SessionScoreLine({
  sessions,
  scores,
}: {
  sessions: string[]
  scores:   number[]
}) {
  return (
    <Line
      data={{
        labels: sessions,
        datasets: [{
          label: 'Score',
          data: scores,
          borderColor: '#5b8af5',
          backgroundColor: 'rgba(91,138,245,0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#5b8af5',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        }],
      }}
      options={{
        ...CHART_DEFAULTS,
        responsive: true,
        maintainAspectRatio: false,
      }}
    />
  )
}

// ─── Section Mastery Doughnut ──────────────────────────────────────────────────
export function MasteryDoughnut({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  const palette = ['#5b8af5', '#a78bfa', '#22d3a0', '#f59e0b', '#f43f5e', '#22d3ee']
  return (
    <Doughnut
      data={{
        labels,
       datasets: [{
  data: values,
          backgroundColor: palette.slice(0, values.length),
          borderWidth: 2,
          borderColor: '#08090c',
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#7c85a2',
              font: { family: 'Space Mono', size: 11 },
              padding: 12,
            },
          },
        },
        cutout: '65%',
      }}
    />
  )
}

// ─── Accuracy Bar (horizontal progress) ───────────────────────────────────────
export function AccuracyBar({
  label,
  value,
  color = '#5b8af5',
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.75rem', color: 'var(--text-secondary)',
        marginBottom: 4, fontFamily: 'var(--font-mono)',
      }}>
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div style={{
        height: 6, background: 'var(--border)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: color, borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ─── D3 Mastery Heatmap ────────────────────────────────────────────────────────
interface HeatCell { section: string; quiz: string; value: number }

export function MasteryHeatmap({ cells }: { cells: HeatCell[] }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !cells.length) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const sections = [...new Set(cells.map(c => c.section))]
    const quizzes  = [...new Set(cells.map(c => c.quiz))]
    const margin   = { top: 20, right: 20, bottom: 60, left: 80 }
    const W      = svgRef.current.clientWidth - margin.left - margin.right
    const H      = Math.max(120, quizzes.length * 36)
    const cellW  = W / sections.length
    const cellH  = H / quizzes.length

    svg.attr('height', H + margin.top + margin.bottom)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const color = d3.scaleSequential([0, 100], d3.interpolate('#1e2333', '#5b8af5'))

    cells.forEach(c => {
      const x = sections.indexOf(c.section) * cellW
      const y = quizzes.indexOf(c.quiz) * cellH
      g.append('rect')
        .attr('x', x + 2).attr('y', y + 2)
        .attr('width', cellW - 4).attr('height', cellH - 4)
        .attr('fill', color(c.value))
        .attr('rx', 4)
      g.append('text')
        .attr('x', x + cellW / 2).attr('y', y + cellH / 2 + 4)
        .attr('text-anchor', 'middle').attr('fill', '#e8eaf0')
        .attr('font-size', '10px').attr('font-family', 'Space Mono')
        .text(`${c.value}%`)
    })

    sections.forEach((s, i) => {
      g.append('text')
        .attr('x', i * cellW + cellW / 2).attr('y', H + 18)
        .attr('text-anchor', 'middle').attr('fill', '#7c85a2')
        .attr('font-size', '10px').attr('font-family', 'Space Mono')
        .text(s.length > 10 ? s.slice(0, 10) + '…' : s)
    })
    quizzes.forEach((q, i) => {
      g.append('text')
        .attr('x', -6).attr('y', i * cellH + cellH / 2 + 4)
        .attr('text-anchor', 'end').attr('fill', '#7c85a2')
        .attr('font-size', '10px').attr('font-family', 'Space Mono')
        .text(q.length > 12 ? q.slice(0, 12) + '…' : q)
    })
  }, [cells])

  return <svg ref={svgRef} style={{ width: '100%' }} />
}
