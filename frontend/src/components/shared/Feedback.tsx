import React from 'react'

export function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: '3rem',
      color: 'var(--text-secondary)',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{label}</span>
    </div>
  )
}

export function ErrorMsg({ message }: { message: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(244,63,94,0.08)',
      border: '1px solid rgba(244,63,94,0.3)',
      borderRadius: 'var(--r-md)',
      color: 'var(--red)',
      fontSize: '0.8rem',
      fontFamily: 'var(--font-mono)',
    }}>
      ⚠ {message}
    </div>
  )
}

export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div style={{
      padding: '3rem', textAlign: 'center',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.85rem',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
      {message}
    </div>
  )
}
