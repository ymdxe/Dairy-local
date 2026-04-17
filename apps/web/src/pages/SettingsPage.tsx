import dayjs from 'dayjs'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'
import { mergeSettings } from '../lib/utils'
import { getAllEntries, replaceAllEntries } from '../repositories/entryRepository'
import { getSettings, saveSettings } from '../repositories/settingsRepository'
import { getAIHealth } from '../services/aiClient'
import { downloadDiaryExport, parseDiaryImport } from '../services/exportService'
import { useAppStore } from '../store/useAppStore'

export function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const settings = useAppStore((state) => state.settings)
  const setSettings = useAppStore((state) => state.setSettings)
  const aiStatus = useAppStore((state) => state.aiStatus)
  const aiModel = useAppStore((state) => state.aiModel)
  const setAIStatus = useAppStore((state) => state.setAIStatus)
  const pushToast = useAppStore((state) => state.pushToast)

  useEffect(() => {
    void (async () => {
      const latest = await getSettings()
      setSettings(latest)
    })()
  }, [setSettings])

  const refreshHealth = async (baseUrl: string, enabled: boolean) => {
    if (!enabled) {
      setAIStatus('disabled')
      return
    }

    setAIStatus('checking')
    const result = await getAIHealth(baseUrl)
    setAIStatus(result.status, result.model)
  }

  const persistSettings = async (partial: Partial<typeof settings>) => {
    try {
      setSaving(true)
      const nextSettings = mergeSettings({
        ...settings,
        ...partial,
        lastHealthCheckAt: new Date().toISOString(),
      })
      await saveSettings(nextSettings)
      setSettings(nextSettings)
      await refreshHealth(nextSettings.aiBaseUrl, nextSettings.aiEnabled)
      pushToast({
        title: '设置已保存',
        description: '新的本地设置已经生效。',
        tone: 'success',
      })
    } catch {
      pushToast({
        title: '设置保存失败',
        description: '请稍后再试。',
        tone: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    const entries = await getAllEntries()
    downloadDiaryExport(entries, settings)
    pushToast({
      title: '导出成功',
      description: 'JSON 备份已经开始下载。',
      tone: 'success',
    })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setImporting(true)
      const text = await file.text()
      const parsed = parseDiaryImport(text)

      if (parsed.entries.length === 0) {
        throw new Error('导入文件中没有可恢复的日记数据。')
      }

      await replaceAllEntries(parsed.entries)

      if (parsed.settings) {
        const nextSettings = mergeSettings(parsed.settings)
        await saveSettings(nextSettings)
        setSettings(nextSettings)
        await refreshHealth(nextSettings.aiBaseUrl, nextSettings.aiEnabled)
      }

      pushToast({
        title: '导入成功',
        description: `已恢复 ${parsed.entries.length} 篇日记。`,
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '请检查 JSON 文件格式。',
        tone: 'error',
      })
    } finally {
      setImporting(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <Panel className="space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Settings</p>
        <h2 className="text-3xl font-semibold text-slate-900">把数据、AI 和备份方式交代清楚</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-500">
          这里的设置都尽量保持简单：导入导出、AI 开关、服务状态，以及必要的隐私说明。
        </p>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Panel className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-900">备份与恢复</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">建议定期导出 JSON，这样即使更换浏览器或清理本地数据，也能重新导入恢复。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>导出全部日记为 JSON</Button>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={importing}>
              {importing ? '导入中…' : '导入 JSON 恢复数据'}
            </Button>
            <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </div>
        </Panel>

        <Panel className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">AI 服务状态</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">前端单独部署到 GitHub Pages 时，这里可能显示未启用，这是预期行为。</p>
            </div>
            <StatusBadge
              label={
                aiStatus === 'available'
                  ? '可用'
                  : aiStatus === 'checking'
                    ? '检测中'
                    : aiStatus === 'disabled'
                      ? '已关闭'
                      : '未启用'
              }
              tone={aiStatus === 'available' ? 'success' : aiStatus === 'checking' ? 'warning' : 'neutral'}
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">启用 AI 分析</p>
                <p className="mt-1 text-sm text-slate-500">关闭后，前端不会主动进行 AI 健康检查。</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-slate-800"
                checked={settings.aiEnabled}
                onChange={(event) => void persistSettings({ aiEnabled: event.target.checked })}
                disabled={saving}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">AI 服务地址</span>
              <input
                className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                value={settings.aiBaseUrl}
                onChange={(event) => setSettings({ ...settings, aiBaseUrl: event.target.value })}
                onBlur={() => void persistSettings({ aiBaseUrl: settings.aiBaseUrl })}
                placeholder="/api 或 http://127.0.0.1:8787/api"
              />
              <p className="text-xs leading-6 text-slate-400">
                如果你通过 GitHub Pages 访问前端，但仍想连本地 AI 代理，可以填 `http://127.0.0.1:8787/api`。
              </p>
            </label>

            <div className="rounded-2xl bg-white/70 px-4 py-4 text-sm leading-7 text-slate-600">
              <p>当前模型：{aiModel ?? '尚未检测到'}</p>
              <p>上次检查：{settings.lastHealthCheckAt ? dayjs(settings.lastHealthCheckAt).format('M 月 D 日 HH:mm') : '尚未记录'}</p>
            </div>

            <Button variant="secondary" onClick={() => void refreshHealth(settings.aiBaseUrl, settings.aiEnabled)}>
              重新检测 AI 服务
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="space-y-3">
        <p className="text-sm font-medium text-slate-900">隐私说明</p>
        <p className="text-sm leading-8 text-slate-500">
          日记默认保存在当前浏览器本地。AI 分析只有在你手动点击时才会发送给本地代理接口，代理再通过环境变量里的 API key 调用模型。
          分析结果只是辅助陪伴，不构成医疗、心理或其他专业建议。
        </p>
      </Panel>
    </div>
  )
}
