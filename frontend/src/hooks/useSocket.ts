import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ScoreUpdateEvent, LeaderboardUpdateEvent, AchievementEvent } from '../types'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001'

interface Handlers {
  onScoreUpdate?:   (e: ScoreUpdateEvent)                           => void
  onLeaderboard?:   (e: LeaderboardUpdateEvent)                     => void
  onAchievement?:   (e: AchievementEvent)                           => void
  onSessionChange?: (e: { action: string })                         => void
  onQuestionBcast?: (e: { question: any; questionIndex: number })   => void
}

export function useSocket(
  sessionId: string | null,
  role:      string,
  userId:    string,
  handlers:  Handlers,
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const socket = io(WS_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_session', { sessionId, role, userId })
    })

    if (handlers.onScoreUpdate)   socket.on('score_update',          handlers.onScoreUpdate)
    if (handlers.onLeaderboard)   socket.on('leaderboard_update',    handlers.onLeaderboard)
    if (handlers.onAchievement)   socket.on('achievement_event',     handlers.onAchievement)
    if (handlers.onSessionChange) socket.on('session_status_change', handlers.onSessionChange)
    if (handlers.onQuestionBcast) socket.on('question_broadcast',    handlers.onQuestionBcast)

    return () => { socket.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { emit }
}