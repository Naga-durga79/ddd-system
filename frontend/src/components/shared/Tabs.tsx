import React from 'react'

interface Tab { id: string; label: string; icon?: string }

interface Props {
  tabs:     Tab[]
  active:   string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '4px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      width: 'fit-content',
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--r-sm)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.03em',
            transition: 'all 0.18s ease',
            background: active === t.id ? 'var(--accent)' : 'transparent',
            color:      active === t.id ? '#fff'          : 'var(--text-secondary)',
          }}
        >
          {t.icon && <span style={{ marginRight: 5 }}>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  )
}
