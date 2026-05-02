import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Role } from '../../context/AppContext'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export function LoginPage() {
  const { login, ready } = useApp()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!ready || !email || !password) return
    setError('')
    setLoading(true)

    try {
      const res  = await fetch(`${BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const json = await res.json()

      if (!json.success) {
        setError(json.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      const { role, userId, userName, sessionId } = json.data
      login(role as Role, userId, userName, sessionId ?? undefined)
    } catch {
      setError('Could not reach server. Is the backend running?')
      setLoading(false)
    }
  }

  const canSubmit = email.trim() && password && ready && !loading

  return (
    <div style={s.root}>
      <div style={s.gridBg} aria-hidden="true" />
     

      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoWrap}>
            <span style={{ fontSize: 28 }}>⚡</span>
          </div>
          <h1 style={s.title}>DDD Analytics</h1>
          <p style={s.subtitle}>Sign in to continue</p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: '1.5rem' }}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="you@vibebootcamp.dev"
              autoFocus
              style={s.input}
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              style={s.input}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.78rem', color: 'var(--red)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            ...s.btn,
            background: canSubmit
              ? 'linear-gradient(135deg, #5b8af5, #a78bfa)'
              : 'var(--border)',
            color:   canSubmit ? '#fff' : 'var(--text-muted)',
            cursor:  canSubmit ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.8 : 1,
          }}
        >
          {!ready   ? '⏳  Connecting…'
          : loading ? '🚀  Signing in…'
          :           'Sign In →'}
        </button>

        <p style={s.footer}>
          Vibe Bootcamp · Analytics System · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
    background: 'var(--bg)',
    position: 'relative', overflow: 'hidden',
  },
  gridBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(91,138,245,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,138,245,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute', width: 380, height: 380,
    borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 420,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glow)',
    borderRadius: 20,
    padding: '2.5rem 2rem',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  logoWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 16,
    background: 'linear-gradient(135deg, #5b8af5, #a78bfa)',
    marginBottom: '1rem',
    boxShadow: '0 8px 24px rgba(91,138,245,0.35)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem', fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0, letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.82rem', color: 'var(--text-muted)',
    marginTop: '0.4rem', fontFamily: 'var(--font-mono)',
  },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: '0.72rem', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
  },
  input: {
    padding: '0.7rem 0.9rem', borderRadius: 8,
    fontSize: '0.88rem',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    outline: 'none', width: '100%',
    fontFamily: 'var(--font-mono)',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', padding: '0.85rem',
    border: 'none', borderRadius: 10,
    fontSize: '0.9rem', fontWeight: 700,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    marginBottom: '1.25rem',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.65rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', margin: 0,
  },
}