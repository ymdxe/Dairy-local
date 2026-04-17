import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { WRITING_PROMPTS } from '../constants'
import { EntryCard } from '../components/EntryCard'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'
import { getMoodMeta } from '../lib/utils'
import { getAllEntries, saveEntryAnalysis } from '../repositories/entryRepository'
import { analyzeDiaryEntry } from '../services/aiClient'
import { getThisMonthCount, getWritingStreak } from '../services/statistics'
import { useAppStore } from '../store/useAppStore'
import type { DiaryEntry } from '../types'

export function DashboardPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  const aiStatus = useAppStore((state) => state.aiStatus)
  const settings = useAppStore((state) => state.settings)
  const pushToast = useAppStore((state) => state.pushToast)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const allEntries = await getAllEntries()
      setEntries(allEntries)
      setLoading(false)
    })()
  }, [])

  const today = dayjs().format('YYYY-MM-DD')
  const todayEntry = useMemo(() => entries.find((entry) => entry.date === today), [entries, today])
  const recentEntries = entries.slice(0, 4)
  const streak = getWritingStreak(entries)
  const monthCount = getThisMonthCount(entries)
  const moodOverview = entries.slice(0, 7)
  const guide = WRITING_PROMPTS[dayjs().date() % WRITING_PROMPTS.length]

  const handleAnalyzeToday = async () => {
    if (!todayEntry) {
      pushToast({
        title: '先写下今天的一篇日记吧',
        description: '创建今日日记后，就可以手动分析今天的状态。',
        tone: 'info',
      })
      return
    }

    try {
      setAnalyzing(true)
      const result = await analyzeDiaryEntry(todayEntry, settings.aiBaseUrl)

      if (!result.cached) {
        const updated = await saveEntryAnalysis(todayEntry.id, result.analysis)
        setEntries((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)))
      }

      pushToast({
        title: result.cached ? '已使用本地缓存的分析结果' : '今天的状态分析已更新',
        description: '你可以前往详情页查看完整分析卡片。',
        tone: 'success',
      })
    } catch (error) {
      pushToast({
        title: 'AI 分析暂时不可用',
        description: error instanceof Error ? error.message : '请稍后再试。',
        tone: 'error',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Dashboard</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">今天，想先从哪一句开始？</h2>
            <p className="max-w-2xl text-sm leading-8 text-slate-500">{guide}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={todayEntry ? `/entries/${todayEntry.id}/edit` : '/entries/new'} className={buttonStyles({ size: 'lg' })}>
                {todayEntry ? '继续写今日日记' : '快速创建今日日记'}
              </Link>
              <Link to="/entries" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
                查看全部日记
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
              <p className="text-sm text-slate-500">本月已记录</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{monthCount}</p>
              <p className="mt-2 text-sm text-slate-500">篇日记</p>
            </div>
            <div className="rounded-[1.75rem] bg-emerald-50 px-5 py-5">
              <p className="text-sm text-emerald-700">连续写作</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">{streak}</p>
              <p className="mt-2 text-sm text-emerald-700">天</p>
            </div>
            <div className="rounded-[1.75rem] bg-sky-50 px-5 py-5">
              <p className="text-sm text-sky-700">今天日期</p>
              <p className="mt-2 text-xl font-semibold text-sky-900">{dayjs().format('M 月 D 日')}</p>
              <p className="mt-2 text-sm text-sky-700">{dayjs().format('dddd')}</p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">最近几篇</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">回看离现在最近的生活片段</h3>
            </div>
            <Link to="/entries" className={buttonStyles({ variant: 'ghost' })}>
              查看更多
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">正在读取本地日记…</p>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              title="这里还没有任何日记"
              description="第一篇不需要完整，只要愿意开始写，就已经很好。"
            >
              <Link to="/entries/new" className={buttonStyles({ size: 'lg' })}>
                写下第一篇
              </Link>
            </EmptyState>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">最近心情概览</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">过去几次记录里，你大概处在什么状态</h3>
              </div>
              {moodOverview.length > 0 ? <StatusBadge label={`最近 ${moodOverview.length} 篇`} /> : null}
            </div>
            {moodOverview.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {moodOverview.map((entry) => {
                  const mood = getMoodMeta(entry.mood)

                  return (
                    <div key={entry.id} className="rounded-2xl bg-white/70 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`rounded-full px-3 py-1 text-sm ${mood.accent}`}>
                          {mood.emoji} {mood.label}
                        </span>
                        <span className="text-xs text-slate-400">{dayjs(entry.date).format('M/D')}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{entry.title}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-500">开始记录后，这里会慢慢出现属于你的情绪轨迹。</p>
            )}
          </Panel>

          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">AI 状态</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">今天的状态分析</h3>
              </div>
              <StatusBadge
                label={aiStatus === 'available' ? '可用' : aiStatus === 'disabled' ? '已关闭' : '未启用'}
                tone={aiStatus === 'available' ? 'success' : 'neutral'}
              />
            </div>

            {aiStatus === 'available' ? (
              <div className="space-y-3">
                <p className="text-sm leading-7 text-slate-500">
                  只有在你手动触发时，系统才会把今天的日记发送给本地 AI 代理进行辅助分析。
                </p>
                <Button onClick={handleAnalyzeToday} disabled={analyzing}>
                  {analyzing ? '分析中…' : '分析今天状态'}
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                当前未连接可用的本地 AI 服务。前端仍可完整记录、回顾和导出日记，不会因为后端缺失而中断。
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
