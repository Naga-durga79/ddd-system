import React, { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { api } from '../../services/api'
import { StatCard } from '../shared/StatCard'
import { PageHeader } from '../shared/PageHeader'
import { Loader, ErrorMsg } from '../shared/Feedback'
import { AccuracyBar, MasteryDoughnut } from '../shared/Charts'
import { BadgeChip } from '../shared/BadgeChip'
import type { ModuleAnalytics, SectionStat, Module } from '../../types'

const CHAMPION_BADGE = {
  _id: 'champ', name: 'Section Champion', description: '', icon: '👑',
  color: '#f59e0b', category: 'score', rarity: 'legendary' as const
}

export function SectionDashboard() {
  const [moduleId, setModuleId] = useState('')
  const { data: modules } = useFetch<Module[]>(() => api.module.list(), [])
  const { data, loading, error } = useFetch<ModuleAnalytics>(
    moduleId ? () => api.module.analytics(moduleId) : null,
    [moduleId]
  )

  return (
    <div className="fade-up">
      <PageHeader title="Section Dashboard" subtitle="Section-level mastery, champions and engagement" />

      <div style={{ marginBottom: '1.5rem' }}>
        <select
          value={moduleId} onChange={e => setModuleId(e.target.value)}
          style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer', minWidth: 260 }}
        >
          <option value="">— Select a Module to view its Sections —</option>
          {modules?.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </div>

      {!moduleId && <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Select a module to explore its sections</div>}
      {loading && <Loader />}
      {error && <ErrorMsg message={error} />}

      {data && (
        <>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <StatCard label="Total Sections"  value={data.sectionStats.length}  icon="📋" accent="var(--accent)" />
            <StatCard label="Overall Mastery" value={`${data.overallMastery}%`} icon="🎯" accent="var(--green)" />
            <StatCard label="Total Learners"  value={data.totalLearners}         icon="👥" accent="var(--accent-2)" />
          </div>

          {/* Section cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {data.sectionStats.map((s, idx) => {
              const masteryColor = s.avgMastery >= 70 ? 'var(--green)' : s.avgMastery >= 45 ? 'var(--amber)' : 'var(--red)'
              const isChamp = idx === 0  // highest mastery section gets champion badge
              return (
                <div key={s.sectionId} className="card" style={{ borderColor: isChamp ? '#f59e0b44' : 'var(--border)', position: 'relative' }}>
                  {isChamp && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <BadgeChip badge={CHAMPION_BADGE} size="sm" showLabel={false} />
                    </div>
                  )}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{s.title}</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.uniqueLearners} learners · {s.totalAttempts} total attempts</p>
                  </div>

                  <AccuracyBar label="Mastery" value={s.avgMastery} color={masteryColor} />

                  {/* Completion estimate */}
                  <AccuracyBar
                    label="Engagement"
                    value={Math.min(100, Math.round((s.totalAttempts / Math.max(s.uniqueLearners, 1)) * 20))}
                    color="var(--accent)"
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mastery</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: masteryColor, lineHeight: 1 }}>{s.avgMastery}%</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Unique Learners</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)', lineHeight: 1 }}>{s.uniqueLearners}</p>
                    </div>
                  </div>

                  {isChamp && (
                    <div style={{ marginTop: 8, padding: '4px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-sm)', fontSize: '0.68rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                      👑 Top performing section
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Overall mastery donut */}
          {data.sectionStats.length > 1 && (
            <div className="card" style={{ marginTop: '1.25rem', maxWidth: 420,  height: 320 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Section Mastery Distribution</h3>
              <MasteryDoughnut
                labels={data.sectionStats.map(s => s.title)}
                values={data.sectionStats.map(s => s.avgMastery)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
