import { EXPORT_VERSION } from '../constants'
import { sanitizeImportedEntry } from '../lib/utils'
import type { AppSettings, DiaryExportFile, DiaryEntry } from '../types'

export function downloadDiaryExport(entries: DiaryEntry[], settings: AppSettings) {
  const payload: DiaryExportFile = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    settings,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateLabel = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `dairy-local-export-${dateLabel}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseDiaryImport(rawText: string) {
  const payload = JSON.parse(rawText) as Partial<DiaryExportFile>
  const entries = Array.isArray(payload.entries)
    ? payload.entries
        .map(sanitizeImportedEntry)
        .filter((entry): entry is DiaryEntry => entry !== null)
    : []

  return {
    version: Number(payload.version || 0),
    entries,
    settings: payload.settings,
  }
}
