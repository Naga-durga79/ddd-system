import React from 'react'

interface Props {
  title:    string
  subtitle?: string
  status?:  'live' | 'done' | 'waiting'
}

export function PageHeader({ title, subtitle, status }: Props) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        {status === 'live' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="live-dot" />
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--green)',
              letterSpacing: '0.1em',
            }}>
              LIVE
            </span>
          </div>
        )}
        {status === 'done' && (
          <span className="pill pill-done">completed</span>
        )}
        {status === 'waiting' && (
          <span className="pill pill-wait">waiting</span>
        )}
      </div>
      {subtitle && (
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
