import React, { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { api } from '../../services/api'
import { StatCard } from '../shared/StatCard'
import { DataTable, Column } from '../shared/DataTable'
import { Tabs } from '../shared/Tabs'
import { PageHeader } from '../shared/PageHeader'
import { Loader, ErrorMsg } from '../shared/Feedback'
import { ScoreDistributionBar, SessionScoreLine } from '../shared/Charts'
import type { QuizAnalytics, QuizLeaderEntry, Quiz } from '../../types'

const TABS = [
  { id: 'metrics',     label: 'Metrics',     icon: '📊' },
  { id: 'leaderboard', label: 'Top Performers', icon: '🏆' },
  { id: 'charts',      label: 'Charts',      icon: '📈' },
]

export function QuizDashboard() {
  const [tab,    setTab]    = useState('metrics')
  const [quizId, setQuizId] = useState<string>('')

  const { data: quizzes } = useFetch<Quiz[]>(() => api.quiz.list(), [])
  const { data, loading, error } = useFetch<QuizAnalytics>(
    quizId ? () => api.quiz.analytics(quizId) : null,
    [quizId]
  )

  const lbColumns: Column<QuizLeaderEntry>[] = [
    {
      key: 'rank', header: '#', align: 'center',
      render: r => <span style={{ fontWeight: 700, color: r.rank <= 3 ? ['#f59e0b','#9ca3af','#cd7f32'][r.rank-1] : 'var(--text-muted)' }}>
        {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank-1] : r.rank}
      </span>
    },
    { key: 'name',     header: 'Student', render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{r.name[0]}</div>{r.name}</div> },
    { key: 'points',   header: 'Points',  align: 'right', sortable: true, render: r => <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{r.points}</span> },
    { key: 'accuracy', header: 'Accuracy', align: 'right', sortable: true, render: r => <span style={{ color: r.accuracy >= 70 ? 'var(--green)' : 'var(--amber)' }}>{r.accuracy}%</span> },
    { key: 'avgTime',  header: 'Avg Time', align: 'right', sortable: true, render: r => `${r.avgTime}s` },
  ]

  return (
    <div className="fade-up">
      <PageHeader title="Quiz Dashboard" subtitle="Per-quiz performance and rankings" />

      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select
          value={quizId} onChange={e => setQuizId(e.target.value)}
          style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer', minWidth: 240 }}
        >
          <option value="">— Select a Quiz —</option>
          {quizzes?.map(q => (
            <option key={q._id} value={q._id}>{q.title}</option>
          ))}
        </select>
        {quizId && <Tabs tabs={TABS} active={tab} onChange={setTab} />}
      </div>

      {!quizId && <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Select a quiz to view analytics</div>}
      {loading && <Loader />}
      {error && <ErrorMsg message={error} />}

      {data && (
        <>
          {/* ── Metrics ── */}
          {tab === 'metrics' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
                <StatCard label="Attempts"       value={data.totalAttempts}            icon="📝" accent="var(--accent)" />
                <StatCard label="Unique Students" value={data.uniqueStudents}           icon="👥" accent="var(--accent-2)" />
                <StatCard label="Avg Mastery"    value={`${data.avgMastery}%`}         icon="🎯" accent="var(--green)" />
                <StatCard label="1st Attempt ✅" value={`${data.firstAttemptSuccessRate}%`} icon="⚡" accent="var(--amber)" />
                <StatCard label="Avg Engagement" value={data.avgEngagement}            icon="🔥" accent="var(--red)" sub="questions answered" />
              </div>

              {/* Efficiency score card */}
              <div className="card-elevated" style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Efficiency Score</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                    {Math.round((data.avgMastery * 0.6 + data.firstAttemptSuccessRate * 0.4))}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>60% mastery + 40% first-attempt success</p>
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>Score Distribution</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['🔴','🟠','🟡','🟢','🔵'].map((e, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.scoreDistribution[i] ?? 0}</div>
                        <div style={{ fontSize: 12 }}>{e}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Leaderboard ── */}
          {tab === 'leaderboard' && (
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Top Performers</h3>
              <DataTable columns={lbColumns} data={data.leaderboard} keyField="rank" />
            </div>
          )}

          {/* ── Charts ── */}
          {tab === 'charts' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Score Distribution</h3>
                <div style={{ height: 200 }}>
                  <ScoreDistributionBar data={data.scoreDistribution} />
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Points Progression (Top 8)</h3>
                <div style={{ height: 200 }}>
                  <SessionScoreLine
                    sessions={data.leaderboard.slice(0, 8).map(l => l.name.split(' ')[0])}
                    scores={data.leaderboard.slice(0, 8).map(l => l.points)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
