import { Link } from 'react-router-dom'

import { getMoodMeta, getWeatherMeta, toExcerpt } from '../lib/utils'
import type { DiaryEntry } from '../types'

type EntryCardProps = {
  entry: DiaryEntry
  compact?: boolean
}

export function EntryCard({ entry, compact = false }: EntryCardProps) {
  const mood = getMoodMeta(entry.mood)
  const weather = getWeatherMeta(entry.weather)

  return (
    <Link
      to={`/entries/${entry.id}`}
      className="group block rounded-[1.75rem] border border-white/60 bg-white/70 p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{entry.date}</p>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">{entry.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
          <span className={`rounded-full px-3 py-1 ${mood.accent}`}>
            {mood.emoji} {mood.label}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {weather.icon} {weather.label}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{toExcerpt(entry.content, compact ? 72 : 128)}</p>
      {entry.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.slice(0, compact ? 2 : 4).map((tag) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-slate-600">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}
