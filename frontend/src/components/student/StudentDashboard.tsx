import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useFetch } from '../../hooks/useFetch'
import { useSocket } from '../../hooks/useSocket'
import { api } from '../../services/api'
import { StatCard } from '../shared/StatCard'
import { BadgeChip } from '../shared/BadgeChip'
import { Tabs } from '../shared/Tabs'
import { PageHeader } from '../shared/PageHeader'
import { Loader, ErrorMsg } from '../shared/Feedback'
import { SessionScoreLine } from '../shared/Charts'
import type { StudentDashboard as SDash, Achievement, Badge, SessionHistory } from '../../types'

const TABS = [
  { id: 'overview',     label: 'Overview',       icon: '🎯' },
  { id: 'history',      label: 'Session History', icon: '📅' },
  { id: 'achievements', label: 'Achievements',    icon: '🏅' },
]

export function StudentDashboard() {
  const { userId, sessionId } = useApp()
  const [tab, setTab]               = useState('overview')
  const [livePoints, setLivePoints] = useState<number | null>(null)

  // ── FIX: guard fetch — don't run with empty userId ────────────────────────
  const { data, loading, error } = useFetch<SDash>(
    () => {
      if (!userId) return Promise.resolve(null)
      return api.student.dashboard(userId) as Promise<SDash>
    },
    [userId]
  )

  const { data: achData } = useFetch<{ earned: Achievement[]; upcoming: Badge[] }>(
    () => {
      if (!userId) return Promise.resolve(null)
      return api.student.achievements(userId) as Promise<{ earned: Achievement[]; upcoming: Badge[] }>
    },
    [userId]
  )

  useSocket(sessionId, 'student', userId, {
    onScoreUpdate: (e: any) => {
      if (e.studentId === userId) setLivePoints(p => (p ?? 0) + e.pointsEarned)
    },
  })

  const totalPoints = livePoints ?? data?.totalPoints ?? 0

  // Show spinner while bootstrap hasn't set userId yet
  if (!userId) return <Loader />

  return (
    <div className="fade-up">
      <PageHeader
        title="My Dashboard"
        subtitle={data?.name ? `Welcome back, ${data.name}` : `Student ID: ${userId}`}
        status="live"
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {loading && <Loader />}
      {error   && <ErrorMsg message={error} />}

      {/* ── Overview ── */}
      {tab === 'overview' && !loading && (
        data ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: '1.5rem',
            }}>
              <StatCard
                label="Total Points"
                value={totalPoints}
                icon="⭐"
                accent="var(--amber)"
                flash={livePoints !== null}
              />
              <StatCard
                label="Accuracy"
                value={`${data.avgAccuracy}%`}
                icon="🎯"
                accent="var(--green)"
              />
              <StatCard
                label="Avg Response"
                value={`${data.avgResponseTime}s`}
                icon="⚡"
                accent="var(--accent)"
              />
              <StatCard
                label="Total Attempts"
                value={data.totalAttempts}
                icon="📝"
                accent="var(--accent-2)"
              />
              {/* ── FIX: moduleRank — template literal is valid as string value ── */}
              <StatCard
                label="Global Rank"
                value={`#${data.moduleRank ?? '—'}`}
                icon="🏆"
                accent="var(--accent)"
              />
            </div>

            {data.sessionHistory.length > 0 ? (
              <div className="card">
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)',
                }}>
                  Score Trend
                </h3>
                <div style={{ height: 200 }}>
                  <SessionScoreLine
                    sessions={data.sessionHistory.slice(0, 8).map((_, i) => `S${i + 1}`).reverse()}
                    scores={data.sessionHistory.slice(0, 8).map(s => s.points).reverse()}
                  />
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No quiz attempts yet. Join a session to get started! 🚀
                </p>
              </div>
            )}
          </>
        ) : !error ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No data found for this student.
            </p>
          </div>
        ) : null
      )}

      {/* ── History ── */}
      {tab === 'history' && !loading && data && (
        <div className="card">
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
          }}>
            Session History
          </h3>

          {data.sessionHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No sessions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.sessionHistory.map((s: SessionHistory, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                    }}>
                      {s.quizTitle || 'Quiz'}
                    </p>

                    {/* ── FIX: ternary guards optional string for TS strict mode ── */}
                    {s.sectionTitle ? (
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {s.sectionTitle}
                      </p>
                    ) : null}

                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(s.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Accuracy</p>
                      <p style={{
                        color: s.accuracy >= 70 ? 'var(--green)' : 'var(--amber)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                      }}>
                        {s.accuracy}%
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Points</p>
                      <p style={{
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}>
                        {s.points}
                      </p>
                    </div>

                    {/* ── FIX: status 'in_progress' maps to pill-live label 'live'
                             status 'completed' | 'waiting' maps to pill-done label 'done' ── */}
                    <span className={`pill ${
                      s.status === 'live' || s.status === 'in_progress'
                        ? 'pill-live'
                        : 'pill-done'
                    }`}>
                      {s.status === 'live' || s.status === 'in_progress' ? 'live' : 'done'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Achievements ── */}
      {tab === 'achievements' && achData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card">
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              color: 'var(--green)',
            }}>
              🏅 Earned
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {achData.earned.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No badges yet — keep going!</p>
                : achData.earned.map(a => <BadgeChip key={a._id} badge={a.badge} size="md" />)
              }
            </div>
          </div>

          <div className="card">
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
            }}>
              🔒 Upcoming
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              opacity: 0.5,
              filter: 'grayscale(0.6)',
            }}>
              {achData.upcoming.map(b => <BadgeChip key={b._id} badge={b} size="md" />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
