import { diaryDb } from '../db/indexedDb'
import { createAnalysisCacheKey } from '../lib/utils'
import type { AIAnalysisResult, DiaryEntry, DiaryEntryFormData } from '../types'

function sortEntries(entries: DiaryEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date === right.date) {
      return right.updatedAt.localeCompare(left.updatedAt)
    }

    return right.date.localeCompare(left.date)
  })
}

export async function getAllEntries() {
  const database = await diaryDb
  const entries = await database.getAll('entries')
  return sortEntries(entries)
}

export async function getRecentEntries(limit = 5) {
  const entries = await getAllEntries()
  return entries.slice(0, limit)
}

export async function getEntryById(id: string) {
  const database = await diaryDb
  return database.get('entries', id)
}

export async function getEntryByDate(date: string) {
  const entries = await getAllEntries()
  return entries.find((entry) => entry.date === date)
}

export async function upsertEntry(formData: DiaryEntryFormData, entryId?: string) {
  const database = await diaryDb
  const existing = entryId ? await database.get('entries', entryId) : undefined
  const now = new Date().toISOString()
  const cacheKey = createAnalysisCacheKey(formData)
  const preservedAnalysis =
    existing?.analysis && existing.analysis.cacheKey === cacheKey ? existing.analysis : undefined

  const entry: DiaryEntry = {
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    analysis: preservedAnalysis,
    extra: existing?.extra,
    ...formData,
  }

  await database.put('entries', entry)
  return entry
}

export async function saveEntryAnalysis(entryId: string, analysis: AIAnalysisResult) {
  const database = await diaryDb
  const entry = await database.get('entries', entryId)

  if (!entry) {
    throw new Error('未找到对应日记，无法保存 AI 分析结果。')
  }

  const updatedEntry: DiaryEntry = {
    ...entry,
    analysis,
    updatedAt: new Date().toISOString(),
  }

  await database.put('entries', updatedEntry)
  return updatedEntry
}

export async function deleteEntry(id: string) {
  const database = await diaryDb
  await database.delete('entries', id)
}

export async function replaceAllEntries(entries: DiaryEntry[]) {
  const database = await diaryDb
  const transaction = database.transaction('entries', 'readwrite')
  await transaction.store.clear()

  for (const entry of entries) {
    await transaction.store.put(entry)
  }

  await transaction.done
}
