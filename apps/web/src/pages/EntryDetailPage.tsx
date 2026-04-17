import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AnalysisCard } from '../components/AnalysisCard'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { formatDateLabel, getMoodMeta, getWeatherMeta } from '../lib/utils'
import { deleteEntry, getEntryById, saveEntryAnalysis } from '../repositories/entryRepository'
import { analyzeDiaryEntry } from '../services/aiClient'
import { useAppStore } from '../store/useAppStore'
import type { DiaryEntry } from '../types'

export function EntryDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const aiStatus = useAppStore((state) => state.aiStatus)
  const settings = useAppStore((state) => state.settings)
  const pushToast = useAppStore((state) => state.pushToast)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const matched = await getEntryById(id)
      setEntry(matched ?? null)
      setLoading(false)
    })()
  }, [id])

  const handleAnalyze = async () => {
    if (!entry) {
      return
    }

    try {
      setAnalyzing(true)
      const result = await analyzeDiaryEntry(entry, settings.aiBaseUrl)
      const updated = result.cached ? entry : await saveEntryAnalysis(entry.id, result.analysis)
      setEntry(updated)

      pushToast({
        title: result.cached ? '已展示缓存中的分析结果' : 'AI 分析已更新',
        description: '仅供辅助参考，请结合自己的真实感受理解。',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'AI 分析失败',
        description: error instanceof Error ? error.message : '请稍后再试。',
        tone: 'error',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) {
      return
    }

    try {
      setDeleting(true)
      await deleteEntry(entry.id)
      pushToast({
        title: '日记已删除',
        description: '如果之后需要恢复，可以导入此前导出的 JSON 备份。',
        tone: 'success',
      })
      navigate('/entries')
    } catch {
      pushToast({
        title: '删除失败',
        description: '请稍后再试。',
        tone: 'error',
      })
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <Panel>
        <p className="text-sm text-slate-500">正在读取这篇日记…</p>
      </Panel>
    )
  }

  if (!entry) {
    return (
      <EmptyState title="这篇日记不存在" description="它可能已被删除，或者当前链接不再有效。">
        <Link to="/entries" className={buttonStyles({ size: 'lg' })}>
          返回日记列表
        </Link>
      </EmptyState>
    )
  }

  const mood = getMoodMeta(entry.mood)
  const weather = getWeatherMeta(entry.weather)

  return (
    <div className="space-y-6">
      <Panel className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{formatDateLabel(entry.date)}</p>
            <h2 className="text-3xl font-semibold text-slate-900">{entry.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-sm ${mood.accent}`}>
                {mood.emoji} {mood.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {weather.icon} {weather.label}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-slate-700">
                进步值 {entry.progressScore}/10
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={`/entries/${entry.id}/edit`} className={buttonStyles({ variant: 'secondary' })}>
              编辑
            </Link>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              删除
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white/70 px-5 py-5">
          <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">{entry.content}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-900">今日收获</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{entry.harvest || '今天还没特别写下收获。'}</p>
          </div>
          <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-900">今日问题</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{entry.problems || '今天没有额外记录问题。'}</p>
          </div>
          <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-900">明日重点</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{entry.tomorrowFocus || '明天的重点还没写下。'}</p>
          </div>
          <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-900">标签</p>
            {entry.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-sm text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">这篇日记还没有标签。</p>
            )}
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">AI 分析只会在你点击按钮后触发，不会自动上传。</p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing || aiStatus !== 'available'}>
            {analyzing ? '分析中…' : aiStatus === 'available' ? '手动分析今天状态' : 'AI 分析未启用'}
          </Button>
        </div>
        <AnalysisCard analysis={entry.analysis} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="确定删除这篇日记吗？"
        description="删除后不会出现在本地列表里。为了更安心，建议你先去设置页导出一份 JSON 备份。"
        confirmLabel="确认删除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  )
}
