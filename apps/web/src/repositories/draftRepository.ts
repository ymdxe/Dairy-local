import { diaryDb } from '../db/indexedDb'
import type { DiaryEntryFormData, DraftState } from '../types'

const getDraftKey = (entryId?: string) => entryId ?? 'new-entry'

export async function getDraft(entryId?: string) {
  const database = await diaryDb
  return database.get('drafts', getDraftKey(entryId))
}

export async function saveDraft(entryId: string | undefined, formData: DiaryEntryFormData) {
  const database = await diaryDb
  const draft: DraftState = {
    entryId,
    formData,
    updatedAt: new Date().toISOString(),
  }

  await database.put('drafts', draft, getDraftKey(entryId))
  return draft
}

export async function clearDraft(entryId?: string) {
  const database = await diaryDb
  await database.delete('drafts', getDraftKey(entryId))
}
