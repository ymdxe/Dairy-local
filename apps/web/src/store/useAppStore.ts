import { create } from 'zustand'

import { DEFAULT_FILTERS, DEFAULT_SETTINGS } from '../constants'
import { mergeSettings } from '../lib/utils'
import type { AIHealthStatus, AppSettings, EntryFilters, ToastMessage } from '../types'

type AppState = {
  filters: EntryFilters
  settings: AppSettings
  settingsLoaded: boolean
  aiStatus: AIHealthStatus
  aiModel: string | null
  toasts: ToastMessage[]
  setFilters: (filters: Partial<EntryFilters>) => void
  resetFilters: () => void
  setSettings: (settings: AppSettings) => void
  setSettingsLoaded: (loaded: boolean) => void
  setAIStatus: (status: AIHealthStatus, model?: string | null) => void
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,
  aiStatus: 'checking',
  aiModel: null,
  toasts: [],
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSettings: (settings) =>
    set({
      settings: mergeSettings(settings),
    }),
  setSettingsLoaded: (settingsLoaded) => set({ settingsLoaded }),
  setAIStatus: (aiStatus, aiModel = null) => set({ aiStatus, aiModel }),
  pushToast: (toast) => {
    const id = crypto.randomUUID()

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        get().removeToast(id)
      }, 3200)
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
