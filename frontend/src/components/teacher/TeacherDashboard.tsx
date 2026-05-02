import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useFetch } from '../../hooks/useFetch'
import { useSocket } from '../../hooks/useSocket'
import { api } from '../../services/api'
import { StatCard } from '../shared/StatCard'
import { DataTable, Column } from '../shared/DataTable'
import { Tabs } from '../shared/Tabs'
import { PageHeader } from '../shared/PageHeader'
import { Loader, ErrorMsg } from '../shared/Feedback'
import { ScoreDistributionBar } from '../shared/Charts'
import { BadgeChip } from '../shared/BadgeChip'
import type { SessionOverview, StudentRow, QuestionStat, Achievement } from '../../types'

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: '📊' },
  { id: 'leaderboard',  label: 'Leaderboard',  icon: '🏆' },
  { id: 'questions',    label: 'Questions',    icon: '❓' },
  { id: 'achievements', label: 'Achievements', icon: '🏅' },
]

export function TeacherDashboard() {
  const { sessionId, userId } = useApp()
  const [tab,      setTab]      = useState('overview')
  const [students, setStudents] = useState<StudentRow[]>([])

  const { data: overview, loading: ol, error: oe } = useFetch<SessionOverview>(
    () => sessionId ? api.teacher.sessionOverview(sessionId) as Promise<SessionOverview> : Promise.resolve(null),
    [sessionId],
  )

  const { data: qStats, loading: ql } = useFetch<QuestionStat[]>(
    () => sessionId ? api.teacher.questionStats(sessionId) as Promise<QuestionStat[]> : Promise.resolve(null),
    [sessionId],
  )

  // Fetch students — drives leaderboard tab + score distribution
  useFetch<StudentRow[]>(
    () => sessionId
      ? api.teacher.studentTable(sessionId).then(d => {
          setStudents(d as StudentRow[])
          return d as StudentRow[]
        })
      : Promise.resolve(null),
    [sessionId],
  )

  const { data: achievements } = useFetch<Achievement[]>(
    () => sessionId ? api.teacher.achievements(sessionId) as Promise<Achievement[]> : Promise.resolve(null),
    [sessionId],
  )

  // Live leaderboard updates via WebSocket
  useSocket(sessionId, 'teacher', userId, {
    onLeaderboard: (e: any) => setStudents(e.leaderboard),
  })

  // Score distribution built from real student accuracy buckets
  const scoreDistribution: number[] = (() => {
    if (!students.length) return [0, 0, 0, 0, 0]
    const buckets = [0, 0, 0, 0, 0]
    for (const s of students) {
      const bucket = Math.min(4, Math.floor((s.accuracy ?? 0) / 20))
      buckets[bucket] += 1
    }
    return buckets
  })()

  // ── Question columns ────────────────────────────────────────────────────────
  const questionColumns: Column<QuestionStat>[] = [
    {
      key: 'questionId',
      header: 'Q#',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)' }}>
          {r.questionId}
        </span>
      ),
    },
    {
      key: 'text' as any,
      header: 'Question',
      render: (r: any) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
          {r.text ? (r.text.length > 60 ? r.text.slice(0, 60) + '…' : r.text) : '—'}
        </span>
      ),
    },
    {
      key: 'difficulty' as any,
      header: 'Difficulty',
      render: (r: any) => {
        const colors: Record<string, string> = {
          easy:   'var(--green)',
          medium: 'var(--amber)',
          hard:   'var(--red)',
        }
        return (
          <span style={{
            color: colors[r.difficulty] ?? 'var(--text-muted)',
            fontSize: '0.75rem',
            textTransform: 'capitalize',
          }}>
            {r.difficulty ?? '—'}
          </span>
        )
      },
    },
    { key: 'responseCount',     header: 'Responses', align: 'right', sortable: true },
    {
      key: 'correctnessPercent', header: 'Correct %', align: 'right', sortable: true,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{
              width: `${r.correctnessPercent}%`, height: '100%',
              background: r.correctnessPercent < 40 ? 'var(--red)' : 'var(--green)',
              borderRadius: 99,
            }} />
          </div>
          <span>{r.correctnessPercent}%</span>
        </div>
      ),
    },
    {
      key: 'avgTime', header: 'Avg Time', align: 'right', sortable: true,
      render: r => `${r.avgTime}s`,
    },
    {
      key: 'isLowEngagement', header: 'Flags',
      render: r => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {r.isLowEngagement  && <span className="tag tag-amber">Low Engagement</span>}
          {r.isHighDifficulty && <span className="tag tag-red">High Difficulty</span>}
        </div>
      ),
    },
  ]

  // ── Leaderboard columns ─────────────────────────────────────────────────────
  const leaderboardColumns: Column<StudentRow>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: r => (
        <span style={{
          fontWeight: 700, fontFamily: 'var(--font-mono)',
          color: r.rank === 1 ? 'var(--amber)'
               : r.rank === 2 ? '#94a3b8'
               : r.rank === 3 ? '#b47a3c'
               : 'var(--text-muted)',
        }}>
          {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Student',
      render: r => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{r.name}</span>
      ),
    },
    { key: 'totalPoints',     header: 'Score',    align: 'right', sortable: true },
    {
      key: 'accuracy', header: 'Accuracy', align: 'right', sortable: true,
      render: r => (
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: r.accuracy >= 80 ? 'var(--green)'
               : r.accuracy >= 50 ? 'var(--amber)'
               : 'var(--red)',
        }}>
          {r.accuracy}%
        </span>
      ),
    },
    {
      key: 'avgResponseTime', header: 'Avg Time', align: 'right', sortable: true,
      render: r => `${r.avgResponseTime}s`,
    },
    { key: 'correct',   header: 'Correct',   align: 'right', sortable: true },
    { key: 'attempted', header: 'Attempted', align: 'right', sortable: true },
  ]

  return (
    <div className="fade-up">
      
      <PageHeader
        title="Teacher Dashboard"
        subtitle={`Session: ${sessionId}`}
        status="live"
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <>
          {ol ? <Loader /> : oe ? <ErrorMsg message={oe} /> : overview && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: '1.5rem',
              }}>
                <StatCard label="Students"      value={overview.totalStudents}  icon="👥" accent="var(--accent)" />
                <StatCard label="Questions"     value={overview.totalQuestions} icon="❓" accent="var(--accent-2)" />
                <StatCard label="Avg Score"     value={overview.avgScore}       icon="📈" accent="var(--green)"  sub="points" />
                <StatCard label="Highest Score" value={overview.highestScore}   icon="🏆" accent="var(--amber)" />
                <StatCard label="Lowest Score"  value={overview.lowestScore}    icon="📉" accent="var(--red)" />
              </div>

              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                  marginBottom: '0.25rem', color: 'var(--text-secondary)',
                }}>
                  Score Distribution
                </h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {students.length} students · grouped by accuracy bucket
                </p>
                <div style={{ height: 300 }}>
                  <ScoreDistributionBar data={scoreDistribution} />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Leaderboard ── */}
      {tab === 'leaderboard' && (
        <div className="card">
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.9rem',
            marginBottom: '0.25rem', color: 'var(--text-secondary)',
          }}>
            Live Leaderboard
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {students.length} students · ranked by score · updates live
          </p>
          <DataTable
            columns={leaderboardColumns}
            data={[...students].sort((a, b) => a.rank - b.rank)}
            keyField="studentId"
            searchKey="name"
          />
        </div>
      )}

      {/* ── Questions ── */}
      {tab === 'questions' && (
        <div className="card">
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.9rem',
            marginBottom: '0.25rem', color: 'var(--text-secondary)',
          }}>
            Question Analytics
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {qStats ? `${qStats.length} questions` : 'Loading…'}
          </p>
          {ql ? <Loader /> : qStats && (
            <DataTable columns={questionColumns} data={qStats} keyField="questionId" />
          )}
        </div>
      )}

      {/* ── Achievements ── */}
      {tab === 'achievements' && (
        <div className="card">
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.9rem',
            marginBottom: '1.25rem', color: 'var(--text-secondary)',
          }}>
            Achievements Earned This Session
          </h3>
          {achievements?.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No achievements yet</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {achievements?.map(a => (
              <div key={a._id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '0.75rem',
                background: 'var(--bg)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                minWidth: 90,
              }}>
                <BadgeChip badge={a.badge} size="lg" />
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}>
                  {(a.student as any)?.name || 'Student'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
