import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { MOOD_OPTIONS, WEATHER_OPTIONS } from '../constants'
import { EntryCard } from '../components/EntryCard'
import { Button } from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { getAllEntries } from '../repositories/entryRepository'
import { filterEntries } from '../services/statistics'
import { useAppStore } from '../store/useAppStore'
import type { DiaryEntry } from '../types'

export function EntriesPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const filters = useAppStore((state) => state.filters)
  const setFilters = useAppStore((state) => state.setFilters)
  const resetFilters = useAppStore((state) => state.resetFilters)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setEntries(await getAllEntries())
      setLoading(false)
    })()
  }, [])

  const deferredSearch = useDeferredValue(filters.search)
  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap((entry) => entry.tags))).sort((left, right) => left.localeCompare(right)),
    [entries],
  )
  const filteredEntries = useMemo(
    () => filterEntries(entries, { ...filters, search: deferredSearch }),
    [deferredSearch, entries, filters],
  )

  const updateFilters = (nextFilters: Partial<typeof filters>) => {
    startTransition(() => {
      setFilters(nextFilters)
    })
  }

  return (
    <div className="space-y-6">
      <Panel className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">日记列表</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">把过去的自己按时间整理好</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">支持搜索标题和正文，也可以按心情、天气、标签快速筛选。</p>
          </div>
          <Link to="/entries/new" className={buttonStyles({ size: 'lg' })}>
            新建日记
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200 xl:col-span-2"
            placeholder="搜索标题或正文"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
          <select
            className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            value={filters.mood}
            onChange={(event) => updateFilters({ mood: event.target.value as typeof filters.mood })}
          >
            <option value="all">全部心情</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            value={filters.weather}
            onChange={(event) => updateFilters({ weather: event.target.value as typeof filters.weather })}
          >
            <option value="all">全部天气</option>
            {WEATHER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            value={filters.tag}
            onChange={(event) => updateFilters({ tag: event.target.value })}
          >
            <option value="all">全部标签</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">当前共匹配到 {filteredEntries.length} 篇日记</p>
          <Button variant="ghost" onClick={() => resetFilters()}>
            清空筛选
          </Button>
        </div>
      </Panel>

      {loading ? (
        <Panel>
          <p className="text-sm text-slate-500">正在整理本地日记…</p>
        </Panel>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="没有找到符合条件的日记"
          description="试着放宽筛选条件，或者现在写下一篇新的日记。"
        >
          <Link to="/entries/new" className={buttonStyles({ size: 'lg' })}>
            写新日记
          </Link>
        </EmptyState>
      )}
    </div>
  )
}
