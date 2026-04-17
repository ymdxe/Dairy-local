import dayjs from 'dayjs'

import { MOOD_OPTIONS } from '../constants'
import { getMoodScore } from '../lib/utils'
import type { DiaryEntry, EntryFilters } from '../types'

export function filterEntries(entries: DiaryEntry[], filters: EntryFilters) {
  const search = filters.search.trim().toLowerCase()

  return entries.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.title.toLowerCase().includes(search) ||
      entry.content.toLowerCase().includes(search)

    const matchesMood = filters.mood === 'all' || entry.mood === filters.mood
    const matchesWeather = filters.weather === 'all' || entry.weather === filters.weather
    const matchesTag = filters.tag === 'all' || entry.tags.includes(filters.tag)

    return matchesSearch && matchesMood && matchesWeather && matchesTag
  })
}

export function getThisMonthCount(entries: DiaryEntry[]) {
  const monthStart = dayjs().startOf('month')
  const monthEnd = dayjs().endOf('month')

  return entries.filter((entry) => {
    const entryDate = dayjs(entry.date)
    return entryDate.isAfter(monthStart.subtract(1, 'day')) && entryDate.isBefore(monthEnd.add(1, 'day'))
  }).length
}

export function getWritingStreak(entries: DiaryEntry[]) {
  const dates = Array.from(new Set(entries.map((entry) => entry.date))).sort((left, right) =>
    right.localeCompare(left),
  )

  if (dates.length === 0) {
    return 0
  }

  let streak = 0
  let cursor = dayjs()

  if (dates[0] !== cursor.format('YYYY-MM-DD')) {
    cursor = cursor.subtract(1, 'day')
    if (dates[0] !== cursor.format('YYYY-MM-DD')) {
      return 0
    }
  }

  for (const date of dates) {
    if (date === cursor.format('YYYY-MM-DD')) {
      streak += 1
      cursor = cursor.subtract(1, 'day')
    } else {
      break
    }
  }

  return streak
}

export function getMoodDistribution(entries: DiaryEntry[]) {
  return MOOD_OPTIONS.map((option) => ({
    name: `${option.emoji} ${option.label}`,
    value: entries.filter((entry) => entry.mood === option.value).length,
    fill: option.accent.includes('rose')
      ? '#fda4af'
      : option.accent.includes('amber')
        ? '#fcd34d'
        : option.accent.includes('teal')
          ? '#5eead4'
          : option.accent.includes('indigo')
            ? '#a5b4fc'
            : option.accent.includes('slate')
              ? '#cbd5e1'
              : '#86efac',
  })).filter((item) => item.value > 0)
}

export function getProgressTrend(entries: DiaryEntry[]) {
  return [...entries]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-10)
    .map((entry) => ({
      date: dayjs(entry.date).format('M/D'),
      progress: entry.progressScore,
      title: entry.title,
    }))
}

export function getRecentMoodTimeline(entries: DiaryEntry[]) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]))

  return Array.from({ length: 7 }, (_, index) => {
    const date = dayjs().subtract(6 - index, 'day').format('YYYY-MM-DD')
    const matched = byDate.get(date)

    return {
      date: dayjs(date).format('M/D'),
      score: matched ? getMoodScore(matched.mood) : null,
      mood: matched?.mood ?? null,
    }
  })
}

export function getTopTags(entries: DiaryEntry[]) {
  const counter = new Map<string, number>()

  for (const entry of entries) {
    for (const tag of entry.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }))
}
