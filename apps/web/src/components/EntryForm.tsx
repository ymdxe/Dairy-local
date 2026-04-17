import type { ReactNode } from 'react'

import { MOOD_OPTIONS, WEATHER_OPTIONS } from '../constants'
import { cn } from '../lib/utils'
import type { DiaryEntryFormData, MoodType, WeatherType } from '../types'
import { Button } from './ui/Button'

type EntryFormProps = {
  formData: DiaryEntryFormData
  tagsText: string
  errors: Partial<Record<keyof DiaryEntryFormData, string>>
  draftHint: string
  submitting: boolean
  onFieldChange: <K extends keyof DiaryEntryFormData>(field: K, value: DiaryEntryFormData[K]) => void
  onTagsChange: (value: string) => void
  onSubmit: () => void
}

const inputClassName =
  'w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200'

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {error ? (
          <span className="text-xs text-rose-500">{error}</span>
        ) : hint ? (
          <span className="text-xs text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  )
}

export function EntryForm({
  formData,
  tagsText,
  errors,
  draftHint,
  submitting,
  onFieldChange,
  onTagsChange,
  onSubmit,
}: EntryFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="标题" error={errors.title}>
          <input
            className={inputClassName}
            value={formData.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="今天想给这篇日记起什么名字？"
          />
        </Field>
        <Field label="日期" error={errors.date}>
          <input
            type="date"
            className={inputClassName}
            value={formData.date}
            onChange={(event) => onFieldChange('date', event.target.value)}
          />
        </Field>
      </div>

      <Field label="正文" hint={draftHint} error={errors.content}>
        <textarea
          className={`${inputClassName} min-h-[260px] resize-y leading-8`}
          value={formData.content}
          onChange={(event) => onFieldChange('content', event.target.value)}
          placeholder="今天发生了什么？你最在意的感受是什么？"
        />
      </Field>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Field label="今日心情">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left transition',
                  formData.mood === option.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-white/70 bg-white/75 text-slate-700 hover:bg-white',
                )}
                onClick={() => onFieldChange('mood', option.value as MoodType)}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="mt-2 text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </Field>

        <div className="space-y-5">
          <Field label="天气">
            <select
              className={inputClassName}
              value={formData.weather}
              onChange={(event) => onFieldChange('weather', event.target.value as WeatherType)}
            >
              {WEATHER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="今日进步了多少" hint="0 到 10">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>给今天的自己打个分</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-800">
                  {formData.progressScore}
                </span>
              </div>
              <input
                className="mt-4 w-full accent-slate-700"
                type="range"
                min={0}
                max={10}
                step={1}
                value={formData.progressScore}
                onChange={(event) => onFieldChange('progressScore', Number(event.target.value))}
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="今天收获了什么">
          <textarea
            className={`${inputClassName} min-h-28 resize-y leading-7`}
            value={formData.harvest}
            onChange={(event) => onFieldChange('harvest', event.target.value)}
            placeholder="哪怕只有一点点，也值得记下来。"
          />
        </Field>
        <Field label="今天遇到了什么问题">
          <textarea
            className={`${inputClassName} min-h-28 resize-y leading-7`}
            value={formData.problems}
            onChange={(event) => onFieldChange('problems', event.target.value)}
            placeholder="卡住你的，可能也是之后回看的线索。"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="明天最重要的一件事">
          <textarea
            className={`${inputClassName} min-h-24 resize-y leading-7`}
            value={formData.tomorrowFocus}
            onChange={(event) => onFieldChange('tomorrowFocus', event.target.value)}
            placeholder="只留一件最重要的事，给明天减负。"
          />
        </Field>
        <Field label="标签" hint="用逗号分隔">
          <input
            className={inputClassName}
            value={tagsText}
            onChange={(event) => onTagsChange(event.target.value)}
            placeholder="例如：工作，阅读，家庭"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-4">
        <p className="text-sm text-slate-500">保存后会进入详情页，未保存内容会自动保留为本地草稿。</p>
        <Button size="lg" onClick={onSubmit} disabled={submitting}>
          {submitting ? '保存中…' : '保存这篇日记'}
        </Button>
      </div>
    </div>
  )
}
