export type MoodType = 'calm' | 'happy' | 'tired' | 'anxious' | 'fulfilled' | 'low'

export type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'windy'
  | 'snowy'
  | 'foggy'

export type ThemePreference = 'light'

export type AIHealthStatus = 'checking' | 'available' | 'unavailable' | 'disabled'

export interface AIAnalysisResult {
  summary: string
  stressors: string[]
  positiveSignals: string[]
  encouragement: string
  tomorrowSuggestion: string
  createdAt: string
  sourceModel: string
  cacheKey: string
}

export interface DiaryEntry {
  id: string
  title: string
  date: string
  content: string
  mood: MoodType
  weather: WeatherType
  harvest: string
  progressScore: number
  problems: string
  tomorrowFocus: string
  tags: string[]
  createdAt: string
  updatedAt: string
  analysis?: AIAnalysisResult
  extra?: Record<string, unknown>
}

export interface DiaryEntryFormData {
  title: string
  date: string
  content: string
  mood: MoodType
  weather: WeatherType
  harvest: string
  progressScore: number
  problems: string
  tomorrowFocus: string
  tags: string[]
}

export interface DraftState {
  entryId?: string
  formData: DiaryEntryFormData
  updatedAt: string
}

export interface AppSettings {
  aiEnabled: boolean
  aiBaseUrl: string
  lastHealthCheckAt?: string
  themePreference?: ThemePreference
  exportVersion: number
}

export interface DiaryExportFile {
  version: number
  exportedAt: string
  entries: DiaryEntry[]
  settings?: AppSettings
}

export interface EntryFilters {
  search: string
  mood: MoodType | 'all'
  weather: WeatherType | 'all'
  tag: string | 'all'
}

export interface ToastMessage {
  id: string
  title: string
  description?: string
  tone?: 'success' | 'error' | 'info'
}

export interface AIHealthResponse {
  ok: boolean
  providerConfigured: boolean
  model: string | null
}
