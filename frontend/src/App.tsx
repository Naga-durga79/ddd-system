import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { LoginPage } from './components/auth/LoginPage'
import { Sidebar } from './components/shared/Sidebar'
import { TeacherDashboard } from './components/teacher/TeacherDashboard'
import { StudentDashboard } from './components/student/StudentDashboard'
import { ModuleDashboard } from './components/module/ModuleDashboard'
import { QuizDashboard } from './components/quiz/QuizDashboard'
import { SectionDashboard } from './components/section/SectionDashboard'
import { Loader } from './components/shared/Feedback'

const App: React.FC = () => {
  const { ready, loggedIn, role } = useApp()

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <Loader />
      </div>
    )
  }

  if (!loggedIn) return <LoginPage />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,            /* prevents flex child overflow — critical fix */
        padding: '1.75rem 2rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <Routes>

  {/* Default redirect */}
  <Route
    path="/"
    element={<Navigate to={role === 'student' ? '/student' : '/teacher'} replace />}
  />

  {/* 🧑‍🎓 Student routes */}
  <Route
    path="/student"
    element={
      role === 'student'
        ? <StudentDashboard />
        : <Navigate to="/teacher" replace />
    }
  />

  {/* 👩‍🏫 Teacher / Cohost routes */}
  <Route
    path="/teacher"
    element={
      role !== 'student'
        ? <TeacherDashboard />
        : <Navigate to="/student" replace />
    }
  />

  <Route
    path="/module"
    element={
      role !== 'student'
        ? <ModuleDashboard />
        : <Navigate to="/student" replace />
    }
  />

  <Route
    path="/quiz"
    element={
      role !== 'student'
        ? <QuizDashboard />
        : <Navigate to="/student" replace />
    }
  />

  <Route
    path="/section"
    element={
      role !== 'student'
        ? <SectionDashboard />
        : <Navigate to="/student" replace />
    }
  />

  {/* fallback */}
  <Route
    path="*"
    element={<Navigate to={role === 'student' ? '/student' : '/teacher'} replace />}
  />

</Routes>
      </main>
    </div>
  )
}

export default App
