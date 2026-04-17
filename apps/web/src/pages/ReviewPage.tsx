import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { getAllEntries } from '../repositories/entryRepository'
import {
  getMoodDistribution,
  getProgressTrend,
  getRecentMoodTimeline,
  getThisMonthCount,
  getTopTags,
  getWritingStreak,
} from '../services/statistics'
import type { DiaryEntry } from '../types'

export function ReviewPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setEntries(await getAllEntries())
      setLoading(false)
    })()
  }, [])

  const monthCount = getThisMonthCount(entries)
  const streak = getWritingStreak(entries)
  const moodDistribution = useMemo(() => getMoodDistribution(entries), [entries])
  const progressTrend = useMemo(() => getProgressTrend(entries), [entries])
  const recentMoodTimeline = useMemo(() => getRecentMoodTimeline(entries), [entries])
  const topTags = useMemo(() => getTopTags(entries), [entries])

  if (loading) {
    return (
      <Panel>
        <p className="text-sm text-slate-500">正在整理回顾数据…</p>
      </Panel>
    )
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="还没有足够的数据用于回顾"
        description="当你开始持续写日记之后，这里会慢慢变成一张属于自己的情绪与成长地图。"
      />
    )
  }

  return (
    <div className="space-y-6">
      <Panel className="space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Review</p>
        <h2 className="text-3xl font-semibold text-slate-900">回顾这段时间，你是怎样一步步走过来的</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-500">
          统计页只做基础可视化，尽量保持轻盈，便于你以后继续扩展成周报和月报。
        </p>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm text-slate-500">本月日记数量</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">{monthCount}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500">连续写作天数</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">{streak}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500">累计记录篇数</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">{entries.length}</p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">各类心情统计</p>
            <p className="mt-2 text-sm text-slate-500">看看最近一段时间，哪种情绪出现得更多。</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {moodDistribution.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">进步值趋势</p>
            <p className="mt-2 text-sm text-slate-500">最近 10 次记录中，你给自己的进步评分变化。</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressTrend}>
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="progress" stroke="#475569" fill="url(#progressFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">最近 7 天心情变化</p>
            <p className="mt-2 text-sm text-slate-500">用 1 到 5 的情绪分值粗略观察最近一周的波动。</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentMoodTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2.5} dot={{ fill: '#0f172a', r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">高频标签</p>
            <p className="mt-2 text-sm text-slate-500">哪些关键词在这段时间里反复出现。</p>
          </div>
          <div className="space-y-3">
            {topTags.length > 0 ? (
              topTags.map((item) => (
                <div key={item.tag}>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>#{item.tag}</span>
                    <span>{item.count} 次</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-slate-700"
                      style={{ width: `${Math.max(12, (item.count / topTags[0].count) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">还没有足够的标签数据。</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
