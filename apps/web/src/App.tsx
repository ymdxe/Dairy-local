import { lazy, Suspense, useEffect, useEffectEvent } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from './components/layout/AppShell'
import { ToastViewport } from './components/ui/ToastViewport'
import { getSettings, saveSettings } from './repositories/settingsRepository'
import { getAIHealth } from './services/aiClient'
import { useAppStore } from './store/useAppStore'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const EntriesPage = lazy(() => import('./pages/EntriesPage').then((module) => ({ default: module.EntriesPage })))
const EntryDetailPage = lazy(() =>
  import('./pages/EntryDetailPage').then((module) => ({ default: module.EntryDetailPage })),
)
const EntryEditorPage = lazy(() =>
  import('./pages/EntryEditorPage').then((module) => ({ default: module.EntryEditorPage })),
)
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((module) => ({ default: module.ReviewPage })))
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function AppBootstrap() {
  const settings = useAppStore((state) => state.settings)
  const settingsLoaded = useAppStore((state) => state.settingsLoaded)
  const setSettings = useAppStore((state) => state.setSettings)
  const setAIStatus = useAppStore((state) => state.setAIStatus)
  const setSettingsLoaded = useAppStore((state) => state.setSettingsLoaded)

  const refreshAIHealth = useEffectEvent(async (baseUrl: string, enabled: boolean) => {
    if (!enabled) {
      setAIStatus('disabled')
      return
    }

    setAIStatus('checking')
    const health = await getAIHealth(baseUrl)
    setAIStatus(health.status, health.model)
  })

  useEffect(() => {
    void (async () => {
      const storedSettings = await getSettings()
      setSettings(storedSettings)
      setSettingsLoaded(true)
      await refreshAIHealth(storedSettings.aiBaseUrl, storedSettings.aiEnabled)

      await saveSettings({
        ...storedSettings,
        lastHealthCheckAt: new Date().toISOString(),
      })
    })()
  }, [setSettings, setSettingsLoaded])

  useEffect(() => {
    if (!settingsLoaded) {
      return
    }

    void refreshAIHealth(settings.aiBaseUrl, settings.aiEnabled)
  }, [settings.aiBaseUrl, settings.aiEnabled, settingsLoaded])

  if (!settingsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
        <div className="rounded-[2rem] bg-white/75 px-8 py-6 text-center shadow-lg backdrop-blur">
          <p className="text-sm tracking-[0.24em] text-slate-400">LOADING</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">正在打开你的日记空间…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <HashRouter>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
              <div className="rounded-[2rem] bg-white/75 px-8 py-6 text-center shadow-lg backdrop-blur">
                <p className="text-sm tracking-[0.24em] text-slate-400">LOADING</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">正在展开这一页…</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="/entries" element={<EntriesPage />} />
              <Route path="/entries/new" element={<EntryEditorPage />} />
              <Route path="/entries/:id" element={<EntryDetailPage />} />
              <Route path="/entries/:id/edit" element={<EntryEditorPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
      <ToastViewport />
    </>
  )
}

export default AppBootstrap
