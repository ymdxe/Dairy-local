import dayjs from 'dayjs'

import { DEFAULT_SETTINGS, MOOD_OPTIONS, WEATHER_OPTIONS } from '../constants'
import type {
  AIAnalysisResult,
  AppSettings,
  DiaryEntry,
  DiaryEntryFormData,
  MoodType,
  WeatherType,
} from '../types'

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function parseTags(value: string) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function simpleHash(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

export function createAnalysisCacheKey(entry: Pick<
  DiaryEntryFormData,
  'title' | 'content' | 'mood' | 'weather' | 'progressScore' | 'tags'
>) {
  return simpleHash(
    JSON.stringify({
      title: entry.title.trim(),
      content: entry.content.trim(),
      mood: entry.mood,
      weather: entry.weather,
      progressScore: entry.progressScore,
      tags: [...entry.tags].sort(),
    }),
  )
}

export function getMoodMeta(mood: MoodType) {
  return MOOD_OPTIONS.find((item) => item.value === mood) ?? MOOD_OPTIONS[0]
}

export function getWeatherMeta(weather: WeatherType) {
  return WEATHER_OPTIONS.find((item) => item.value === weather) ?? WEATHER_OPTIONS[0]
}

export function getMoodScore(mood: MoodType) {
  return getMoodMeta(mood).score
}

export function formatDateLabel(date: string, template = 'YYYY 年 M 月 D 日') {
  return dayjs(date).format(template)
}

export function toExcerpt(content: string, length = 90) {
  return content.length > length ? `${content.slice(0, length).trim()}…` : content
}

function normalizeMood(mood: unknown): MoodType {
  return MOOD_OPTIONS.some((item) => item.value === mood) ? (mood as MoodType) : 'calm'
}

function normalizeWeather(weather: unknown): WeatherType {
  return WEATHER_OPTIONS.some((item) => item.value === weather)
    ? (weather as WeatherType)
    : 'sunny'
}

function normalizeProgress(value: unknown) {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.min(10, Math.max(0, parsed))
}

export function createFormDataFromEntry(entry: DiaryEntry): DiaryEntryFormData {
  return {
    title: entry.title,
    date: entry.date,
    content: entry.content,
    mood: entry.mood,
    weather: entry.weather,
    harvest: entry.harvest,
    progressScore: entry.progressScore,
    problems: entry.problems,
    tomorrowFocus: entry.tomorrowFocus,
    tags: entry.tags,
  }
}

export function mergeSettings(settings?: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  }
}

export function sanitizeImportedAnalysis(value: unknown): AIAnalysisResult | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const raw = value as Partial<AIAnalysisResult>

  if (!raw.summary || !raw.encouragement || !raw.tomorrowSuggestion) {
    return undefined
  }

  return {
    summary: String(raw.summary),
    stressors: Array.isArray(raw.stressors) ? raw.stressors.map(String) : [],
    positiveSignals: Array.isArray(raw.positiveSignals) ? raw.positiveSignals.map(String) : [],
    encouragement: String(raw.encouragement),
    tomorrowSuggestion: String(raw.tomorrowSuggestion),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    sourceModel: String(raw.sourceModel || 'unknown'),
    cacheKey: String(raw.cacheKey || ''),
  }
}

export function sanitizeImportedEntry(value: unknown): DiaryEntry | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Partial<DiaryEntry>

  if (!raw.title || !raw.date || !raw.content) {
    return null
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    title: String(raw.title),
    date: String(raw.date),
    content: String(raw.content),
    mood: normalizeMood(raw.mood),
    weather: normalizeWeather(raw.weather),
    harvest: String(raw.harvest || ''),
    progressScore: normalizeProgress(raw.progressScore),
    problems: String(raw.problems || ''),
    tomorrowFocus: String(raw.tomorrowFocus || ''),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || raw.createdAt || new Date().toISOString()),
    analysis: sanitizeImportedAnalysis(raw.analysis),
    extra: raw.extra && typeof raw.extra === 'object' ? raw.extra : undefined,
  }
}
