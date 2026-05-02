import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export type Role = 'teacher' | 'student' | 'cohost'

interface BootstrapData {
  sessionId:   string
  studentId:   string
  studentName: string
}

interface AppContextValue {
  role:      Role
  setRole:   (r: Role) => void
  sessionId: string
  userId:    string
  userName:  string
  ready:     boolean
  loggedIn:  boolean
  login:     (role: Role, userId?: string, userName?: string, sessionId?: string) => void
  logout:    () => void
  bootstrap: BootstrapData | null
}

const AppContext = createContext<AppContextValue>({
  role:      'student',
  setRole:   () => {},
  sessionId: '',
  userId:    '',
  userName:  '',
  ready:     false,
  loggedIn:  false,
  login:     () => {},
  logout:    () => {},
  bootstrap: null,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [role,      setRole]      = useState<Role>('student')
  const [sessionId, setSessionId] = useState('')
  const [userId,    setUserId]    = useState('')
  const [userName,  setUserName]  = useState('')
  const [ready,     setReady]     = useState(false)
  const [loggedIn,  setLoggedIn]  = useState(false)
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null)

  // Fetch real MongoDB IDs from backend on mount
  useEffect(() => {
    fetch(`${BASE}/bootstrap`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setBootstrap(json.data)
          setSessionId(json.data.sessionId)
        } else {
          console.error('Bootstrap failed:', json.error)
        }
      })
      .catch(e => console.error('Bootstrap request failed:', e))
      .finally(() => setReady(true))
  }, [])

  const login = (
    selectedRole: Role,
    overrideUserId?:    string,
    overrideUserName?:  string,
    overrideSessionId?: string,
  ) => {
    setRole(selectedRole)
    if (overrideSessionId) setSessionId(overrideSessionId)
    if (selectedRole === 'student' || selectedRole === 'cohost') {
      setUserId(overrideUserId     ?? bootstrap?.studentId   ?? '')
      setUserName(overrideUserName ?? bootstrap?.studentName ?? '')
    } else {
      setUserId(overrideUserId ?? '')
      setUserName(overrideUserName ?? 'Dr. Priya Iyer')
    }
    setLoggedIn(true)
  }

  const logout = () => {
    setLoggedIn(false)
    setUserId('')
    setUserName('')
    setRole('student')
  }

  return (
    <AppContext.Provider value={{
      role, setRole,
      sessionId, userId, userName,
      ready, loggedIn,
      login, logout,
      bootstrap,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
