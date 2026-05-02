import React, { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { api } from '../../services/api'
import { StatCard } from '../shared/StatCard'
import { DataTable, Column } from '../shared/DataTable'
import { Tabs } from '../shared/Tabs'
import { PageHeader } from '../shared/PageHeader'
import { Loader, ErrorMsg } from '../shared/Feedback'
import { MasteryDoughnut, MasteryHeatmap, AccuracyBar } from '../shared/Charts'
import type { ModuleAnalytics, LeaderboardEntry, Module } from '../../types'

const TABS = [
  { id: 'overview',    label: 'Overview',    icon: '📦' },
  { id: 'sections',    label: 'Sections',    icon: '📋' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'heatmap',     label: 'Heatmap',     icon: '🔥' },
]

export function ModuleDashboard() {
  const [tab,      setTab]      = useState('overview')
  const [moduleId, setModuleId] = useState<string>('')

  const { data: modules } = useFetch<Module[]>(() => api.module.list(), [])
  const { data, loading, error } = useFetch<ModuleAnalytics>(
    moduleId ? () => api.module.analytics(moduleId) : null,
    [moduleId]
  )

  const lbColumns: Column<LeaderboardEntry>[] = [
    {
      key: 'rank', header: '#', align: 'center',
      render: r => <span style={{ fontWeight: 700, color: r.rank <= 3 ? ['#f59e0b','#9ca3af','#cd7f32'][r.rank-1] : 'var(--text-muted)' }}>
        {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank-1] : r.rank}
      </span>
    },
    { key: 'student', header: 'Student', render: r => r.student?.name || '—' },
    { key: 'totalPoints',  header: 'Points',   align: 'right', sortable: true, render: r => <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{r.totalPoints}</span> },
    { key: 'totalAttempts', header: 'Attempts', align: 'right', sortable: true },
    { key: 'avgAccuracy',  header: 'Avg Acc',  align: 'right', sortable: true, render: r => `${Math.round(r.avgAccuracy)}%` },
  ]

  // Heatmap dummy structure from sections
  const heatCells = data?.sectionStats.flatMap(s =>
    ['Basics', 'Advanced'].map(q => ({
      section: s.title,
      quiz: q,
      value: Math.round(s.avgMastery * (0.8 + Math.random() * 0.4))
    }))
  ) ?? []

  return (
    <div className="fade-up">
      <PageHeader title="Module Dashboard" subtitle="Cross-section analytics and rankings" />

      {/* Module selector */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          value={moduleId} onChange={e => setModuleId(e.target.value)}
          style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">— Select a Module —</option>
          {modules?.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {!moduleId && <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Select a module to view analytics</div>}
      {loading && <Loader />}
      {error && <ErrorMsg message={error} />}

      {data && (
        <>
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
                <StatCard label="Mastery"       value={`${data.overallMastery}%`} icon="🎯" accent="var(--green)" />
                <StatCard label="Learners"       value={data.totalLearners}        icon="👥" accent="var(--accent)" />
                <StatCard label="Completed All"  value={data.completedAll}         icon="✅" accent="var(--amber)" />
                <StatCard label="Total Attempts" value={data.totalAttempts}        icon="📝" accent="var(--accent-2)" />
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Section Mastery Breakdown</h3>
                <div style={{ maxWidth: 360, margin: '0 auto' }}>
                  <MasteryDoughnut
                    labels={data.sectionStats.map(s => s.title)}
                    values={data.sectionStats.map(s => s.avgMastery)}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Sections ── */}
          {tab === 'sections' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Section Comparison</h3>
              {data.sectionStats.map(s => (
                <div key={s.sectionId} style={{ marginBottom: '1rem', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.88rem' }}>{s.title}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.uniqueLearners} learners · {s.totalAttempts} attempts</span>
                  </div>
                  <AccuracyBar label="Mastery" value={s.avgMastery} color={s.avgMastery >= 70 ? 'var(--green)' : s.avgMastery >= 45 ? 'var(--amber)' : 'var(--red)'} />
                </div>
              ))}
            </div>
          )}

          {/* ── Leaderboard ── */}
          {tab === 'leaderboard' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Module Leaderboard</h3>
              <DataTable columns={lbColumns} data={data.leaderboard} keyField="rank" />
            </div>
          )}

          {/* ── Heatmap ── */}
          {tab === 'heatmap' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Mastery Heatmap (Section × Quiz)</h3>
              <MasteryHeatmap cells={heatCells} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
