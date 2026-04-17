import { openDB } from 'idb'
import type { DBSchema } from 'idb'

import type { AppSettings, DiaryEntry, DraftState } from '../types'

interface DiaryDB extends DBSchema {
  entries: {
    key: string
    value: DiaryEntry
    indexes: {
      'by-date': string
      'by-mood': string
      'by-weather': string
    }
  }
  drafts: {
    key: string
    value: DraftState
  }
  settings: {
    key: string
    value: AppSettings
  }
}

export const diaryDb = openDB<DiaryDB>('dairy-local-db', 1, {
  upgrade(database) {
    if (!database.objectStoreNames.contains('entries')) {
      const entryStore = database.createObjectStore('entries', { keyPath: 'id' })
      entryStore.createIndex('by-date', 'date')
      entryStore.createIndex('by-mood', 'mood')
      entryStore.createIndex('by-weather', 'weather')
    }

    if (!database.objectStoreNames.contains('drafts')) {
      database.createObjectStore('drafts')
    }

    if (!database.objectStoreNames.contains('settings')) {
      database.createObjectStore('settings')
    }
  },
})
