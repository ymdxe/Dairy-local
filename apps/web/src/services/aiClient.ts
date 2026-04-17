import { createAnalysisCacheKey } from '../lib/utils'
import type { AIAnalysisResult, AIHealthResponse, DiaryEntry } from '../types'

type AnalyzeApiResponse = {
  ok: boolean
  data?: Omit<AIAnalysisResult, 'cacheKey'>
  error?: string
}

function buildUrl(apiBaseUrl: string, path: string) {
  const normalizedBase = apiBaseUrl.trim().replace(/\/$/, '')

  if (!normalizedBase || normalizedBase === '/api') {
    return `/api${path}`
  }

  if (normalizedBase.endsWith('/api')) {
    return `${normalizedBase}${path}`
  }

  return `${normalizedBase}/api${path}`
}

export async function getAIHealth(apiBaseUrl: string) {
  try {
    const response = await fetch(buildUrl(apiBaseUrl, '/health'))

    if (!response.ok) {
      return {
        status: 'unavailable' as const,
        model: null,
      }
    }

    const payload = (await response.json()) as AIHealthResponse

    return {
      status: payload.ok && payload.providerConfigured ? ('available' as const) : ('unavailable' as const),
      model: payload.model,
    }
  } catch {
    return {
      status: 'unavailable' as const,
      model: null,
    }
  }
}

export async function analyzeDiaryEntry(entry: DiaryEntry, apiBaseUrl: string) {
  const cacheKey = createAnalysisCacheKey(entry)

  if (entry.analysis && entry.analysis.cacheKey === cacheKey) {
    return {
      analysis: entry.analysis,
      cached: true,
    }
  }

  const response = await fetch(buildUrl(apiBaseUrl, '/analyze-entry'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })

  const payload = (await response.json()) as AnalyzeApiResponse

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error || 'AI 分析失败，请稍后再试。')
  }

  return {
    cached: false,
    analysis: {
      ...payload.data,
      cacheKey,
    },
  }
}
