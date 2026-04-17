import { DEFAULT_SETTINGS } from '../constants'
import { diaryDb } from '../db/indexedDb'
import { mergeSettings } from '../lib/utils'
import type { AppSettings } from '../types'

const SETTINGS_KEY = 'app-settings'

export async function getSettings() {
  const database = await diaryDb
  const settings = await database.get('settings', SETTINGS_KEY)
  return mergeSettings(settings ?? DEFAULT_SETTINGS)
}

export async function saveSettings(settings: AppSettings) {
  const database = await diaryDb
  await database.put('settings', settings, SETTINGS_KEY)
  return settings
}
