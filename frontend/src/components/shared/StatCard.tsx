import React from 'react'

interface Props {
  label:   string
  value:   string | number
  sub?:    string
  accent?: string
  icon?:   string
  flash?:  boolean
}

export function StatCard({ label, value, sub, accent = 'var(--accent)', icon, flash }: Props) {
  return (
    <div className="card" style={{ borderColor: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
      {/* left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 3, height: '100%',
        background: accent,
        borderRadius: '3px 0 0 3px',
      }} />
      <div style={{ paddingLeft: '0.75rem' }}>
        <p style={{
          fontSize: '0.68rem', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          fontFamily: 'var(--font-mono)',
        }}>
          {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
          {label}
        </p>
        <p
          className={flash ? 'num-flash' : ''}
          style={{
            fontSize: '2rem', fontFamily: 'var(--font-display)',
            fontWeight: 800, color: 'var(--text-primary)',
            lineHeight: 1.1, marginTop: 4,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 3 }}>{sub}</p>
        )}
      </div>
    </div>
  )
}
