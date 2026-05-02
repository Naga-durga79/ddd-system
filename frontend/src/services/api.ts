const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

async function get<T>(path: string): Promise<T | null> {
  try {
    const res  = await fetch(`${BASE}${path}`)
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
    const json = await res.json()
    return (json.data ?? json) as T
  } catch (err) {
    console.error(`GET ${BASE}${path} failed:`, err)
    return null
  }
}

export const api = {
  teacher: {
    sessionOverview: (sessionId: string) =>
      get(`/teacher/session/${sessionId}/overview`),
    studentTable: (sessionId: string) =>
      get(`/teacher/session/${sessionId}/students`),
    questionStats: (sessionId: string) =>
      get(`/teacher/session/${sessionId}/questions`),
    achievements: (sessionId: string) =>
      get(`/teacher/session/${sessionId}/achievements`),
  },
  student: {
    dashboard: (studentId: string) =>
      get(`/student/${studentId}/dashboard`),
    achievements: (studentId: string) =>
      get(`/student/${studentId}/achievements`),
  },
  module: {
    list: () =>
      get(`/modules`),
    analytics: (moduleId: string) =>
      get(`/module/${moduleId}/analytics`),
    leaderboard: (moduleId: string) =>
      get(`/module/${moduleId}/leaderboard`),
  },
  section: {
    analytics: (sectionId: string) =>
      get(`/section/${sectionId}/analytics`),
    leaderboard: (sectionId: string) =>
      get(`/section/${sectionId}/leaderboard`),
  },
  quiz: {
    list: () =>
      get(`/quizzes`),
    analytics: (quizId: string) =>
      get(`/quiz/${quizId}/analytics`),
  },
}