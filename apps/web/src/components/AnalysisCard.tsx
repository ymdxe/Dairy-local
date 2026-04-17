import dayjs from 'dayjs'

import type { AIAnalysisResult } from '../types'
import { Panel } from './ui/Panel'
import { StatusBadge } from './ui/StatusBadge'

export function AnalysisCard({ analysis }: { analysis?: AIAnalysisResult }) {
  return (
    <Panel className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">AI 辅助分析</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">今天状态的温和解读</h2>
        </div>
        <StatusBadge label="仅供辅助参考" tone="warning" />
      </div>

      {analysis ? (
        <div className="space-y-5">
          <p className="rounded-2xl bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-700">{analysis.summary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-medium text-slate-900">可能的压力来源</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {analysis.stressors.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-medium text-slate-900">今天的积极信号</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {analysis.positiveSignals.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
              <p className="font-medium">一句鼓励</p>
              <p className="mt-2">{analysis.encouragement}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-4 text-sm leading-7 text-sky-900">
              <p className="font-medium">明天的小建议</p>
              <p className="mt-2">{analysis.tomorrowSuggestion}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            最近更新于 {dayjs(analysis.createdAt).format('M 月 D 日 HH:mm')} · 模型 {analysis.sourceModel}
          </p>
        </div>
      ) : (
        <p className="text-sm leading-7 text-slate-500">
          这里会在你手动触发后展示情绪总结、压力来源、积极信号和温和建议。它只作为辅助陪伴，不替代专业意见。
        </p>
      )}
    </Panel>
  )
}
