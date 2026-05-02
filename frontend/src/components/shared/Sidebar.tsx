import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const NAV_TEACHER = [
  { to: '/teacher',  icon: '📊', label: 'Session' },
  { to: '/module',   icon: '📦', label: 'Module'  },
  { to: '/quiz',     icon: '📝', label: 'Quiz'    },
  { to: '/section',  icon: '📋', label: 'Section' },
]

const NAV_STUDENT = [
  { to: '/student', icon: '🎯', label: 'My Dashboard' },
]

export function Sidebar() {
  const { role, userName, logout } = useApp()
  const navigate = useNavigate()
  const nav = role === 'student' ? NAV_STUDENT : NAV_TEACHER

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      width: 220, minHeight: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1.25rem 1.25rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}>
          <span style={{ color: 'var(--accent)' }}>D³</span>
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: '0.7rem',
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontWeight: 400,
            marginTop: 1,
          }}>
            Dopamine Driven
          </span>
        </div>
      </div>

      {/* Logged-in user chip */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px',
          background: 'var(--bg)',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 16 }}>
            {role === 'teacher' ? '👩‍🏫' : role === 'cohost' ? '🎙️' : '🎓'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.7rem', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {userName || role}
            </p>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, padding: '0.75rem' }}>
        <p style={{
          fontSize: '0.6rem', color: 'var(--text-muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '0 0.5rem', marginBottom: 6,
        }}>
          Dashboards
        </p>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              borderRadius: 'var(--r-sm)',
              textDecoration: 'none',
              marginBottom: 2,
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              background:  isActive ? 'var(--accent-glow)' : 'transparent',
              color:       isActive ? 'var(--accent)'      : 'var(--text-secondary)',
              borderLeft:  isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout + version */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '6px 0',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--red)'
            e.currentTarget.style.color = 'var(--red)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          ⎋ logout
        </button>
        <p style={{
          fontSize: '0.62rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', textAlign: 'center',
        }}>
          v1.0.0 · DDD System
        </p>
      </div>
    </nav>
  )
}
