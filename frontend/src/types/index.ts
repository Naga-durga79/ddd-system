// ─── Core Entities ────────────────────────────────────────────────────────────
export type Role          = 'student' | 'teacher' | 'cohost'
export type SessionStatus = 'waiting' | 'live' | 'completed' | 'in_progress'
export type Difficulty    = 'easy' | 'medium' | 'hard'
export type Rarity        = 'common' | 'rare' | 'epic' | 'legendary'

export interface User {
  _id:         string
  name:        string
  email:       string
  role:        Role
  avatar?:     string
  totalPoints: number
  streak:      number
  badges:      Badge[]
}

export interface Badge {
  _id:         string
  name:        string
  description: string
  icon:        string
  color:       string
  category:    string
  rarity:      Rarity
}

export interface Achievement {
  _id:      string
  student:  User
  badge:    Badge
  earnedAt: string
}

export interface Module {
  _id:        string
  title:      string
  description: string
  coverColor: string
  sections:   Section[]
}

export interface Section {
  _id:    string
  title:  string
  module: string
  order:  number
  quizzes: Quiz[]
}

export interface Quiz {
  _id:       string
  title:     string
  section:   string | Section
  maxPoints: number
  timeLimit: number
}

// ─── Analytics Types ──────────────────────────────────────────────────────────
export interface SessionOverview {
  totalStudents:  number
  totalQuestions: number
  avgScore:       number
  highestScore:   number
  lowestScore:    number
}

export interface StudentRow {
  studentId:       string
  name:            string
  avatar?:         string
  attempted:       number
  correct:         number
  accuracy:        number
  avgResponseTime: number
  totalPoints:     number
  rank:            number
}

export interface QuestionStat {
  questionId:        string
  _id?:              string
  text?:             string
  difficulty?:       Difficulty
  responseCount:     number
  correctnessPercent: number
  avgTime:           number
  isLowEngagement:   boolean
  isHighDifficulty:  boolean
}

export interface SectionStat {
  sectionId:      string
  title:          string
  avgMastery:     number
  totalAttempts:  number
  uniqueLearners: number
}

export interface ModuleAnalytics {
  moduleId:      string
  title:         string
  overallMastery: number
  totalLearners:  number
  completedAll:   number
  totalAttempts:  number
  sectionStats:   SectionStat[]
  leaderboard:    LeaderboardEntry[]
}

export interface LeaderboardEntry {
  rank:          number
  student:       { name: string; avatar?: string }
  totalPoints:   number
  totalAttempts: number
  avgAccuracy:   number
}

export interface QuizAnalytics {
  quizId:                  string
  title?:                  string
  totalAttempts:           number
  uniqueStudents:          number
  avgMastery:              number
  avgEngagement:           number
  firstAttemptSuccessRate: number
  leaderboard:             QuizLeaderEntry[]
  scoreDistribution:       number[]
}

export interface QuizLeaderEntry {
  rank:     number
  name:     string
  avatar?:  string
  points:   number
  accuracy: number
  avgTime:  number
}

export interface StudentDashboard {
  studentId:      string
  name:           string
  totalPoints:    number
  avgAccuracy:    number
  avgResponseTime: number
  totalAttempts:  number
  moduleRank:     number
  sessionHistory: SessionHistory[]
}

export interface SessionHistory {
  quizId?:      string
  quizTitle:    string
  sectionTitle?: string
  points:       number
  accuracy:     number
  avgTime:      number
  date:         string
  status:       SessionStatus
}

export interface SectionAnalytics {
  sectionId:      string
  title:          string
  avgMastery:     number
  totalAttempts:  number
  uniqueLearners: number
  quizBreakdown:  QuizBreakdown[]
  leaderboard:    SectionLeaderEntry[]
}

export interface QuizBreakdown {
  quizId:         string
  title:          string
  avgMastery:     number
  totalAttempts:  number
  uniqueStudents: number
}

export interface SectionLeaderEntry {
  rank:     number
  name:     string
  points:   number
  accuracy: number
  avgTime:  number
}

// ─── WebSocket Event Types ────────────────────────────────────────────────────
export interface ScoreUpdateEvent {
  studentId:    string
  questionId:   string
  isCorrect:    boolean
  pointsEarned: number
  timestamp:    string
}

export interface LeaderboardUpdateEvent {
  leaderboard: StudentRow[]
}

export interface AchievementEvent {
  studentId: string
  badge:     Badge
  timestamp: string
}