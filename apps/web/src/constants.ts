import dayjs from 'dayjs'

import type { AppSettings, DiaryEntryFormData, MoodType, WeatherType } from './types'

export const APP_TITLE = '留白日记'
export const EXPORT_VERSION = 1

export const MOOD_OPTIONS: Array<{
  value: MoodType
  emoji: string
  label: string
  score: number
  accent: string
}> = [
  { value: 'calm', emoji: '😌', label: '平静', score: 4, accent: 'bg-emerald-100 text-emerald-700' },
  { value: 'happy', emoji: '😊', label: '开心', score: 5, accent: 'bg-amber-100 text-amber-700' },
  { value: 'tired', emoji: '🥱', label: '疲惫', score: 2, accent: 'bg-slate-200 text-slate-700' },
  { value: 'anxious', emoji: '😵‍💫', label: '焦虑', score: 1, accent: 'bg-rose-100 text-rose-700' },
  { value: 'fulfilled', emoji: '🌿', label: '满足', score: 5, accent: 'bg-teal-100 text-teal-700' },
  { value: 'low', emoji: '🌧️', label: '低落', score: 1, accent: 'bg-indigo-100 text-indigo-700' },
]

export const WEATHER_OPTIONS: Array<{
  value: WeatherType
  icon: string
  label: string
}> = [
  { value: 'sunny', icon: '☀️', label: '晴朗' },
  { value: 'cloudy', icon: '☁️', label: '多云' },
  { value: 'rainy', icon: '🌧️', label: '下雨' },
  { value: 'windy', icon: '🍃', label: '有风' },
  { value: 'snowy', icon: '❄️', label: '下雪' },
  { value: 'foggy', icon: '🌫️', label: '有雾' },
]

export const DEFAULT_SETTINGS: AppSettings = {
  aiEnabled: true,
  aiBaseUrl: '/api',
  exportVersion: EXPORT_VERSION,
  themePreference: 'light',
}

export const DEFAULT_FILTERS = {
  search: '',
  mood: 'all',
  weather: 'all',
  tag: 'all',
} as const

export const EMPTY_FORM: DiaryEntryFormData = {
  title: '',
  date: dayjs().format('YYYY-MM-DD'),
  content: '',
  mood: 'calm',
  weather: 'sunny',
  harvest: '',
  progressScore: 5,
  problems: '',
  tomorrowFocus: '',
  tags: [],
}

export const WRITING_PROMPTS = [
  '今天想替自己留下些什么？',
  '不必完整，只要诚实地写下此刻。',
  '把今天真正重要的感受留给明天的自己。',
  '哪怕只写一句，也是在认真陪伴自己。',
]
