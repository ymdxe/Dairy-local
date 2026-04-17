import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

type AnalyzeEntryPayload = {
  title: string
  date: string
  content: string
  mood: string
  weather: string
  harvest: string
  progressScore: number
  problems: string
  tomorrowFocus: string
  tags: string[]
}

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>
    }
  }>
}

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const getServerConfig = () => {
  const apiKey = process.env.AI_API_KEY?.trim() || ''
  const baseUrl = process.env.AI_BASE_URL?.trim().replace(/\/$/, '') || ''
  const model = process.env.AI_MODEL?.trim() || ''

  return {
    apiKey,
    baseUrl,
    model,
    providerConfigured: Boolean(apiKey && baseUrl && model),
  }
}

const jsonTemplate = {
  summary: '今天整体情绪与状态的简短总结',
  stressors: ['最多 3 条可能的压力来源'],
  positiveSignals: ['最多 3 条今天出现的积极信号'],
  encouragement: '一句温和鼓励',
  tomorrowSuggestion: '一句明天可执行的小建议',
}

function extractAssistantContent(payload: OpenAICompatibleResponse): string {
  const content = payload.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text || '')
      .join('\n')
      .trim()
  }

  return ''
}

function extractJsonObject(content: string) {
  const match = content.match(/\{[\s\S]*\}/)

  if (!match) {
    throw new Error('AI 返回内容中未找到 JSON 对象。')
  }

  return JSON.parse(match[0]) as typeof jsonTemplate
}

function buildPrompt(entry: AnalyzeEntryPayload) {
  return [
    '你是一个温和、克制、不过度解读的日记辅助分析助手。',
    '你的任务是基于用户今天的日记，输出一份简洁、支持性的中文分析。',
    '不要使用专业诊断措辞，不要夸张，不要恐吓，不要给医疗建议。',
    '请严格输出 JSON，不要输出 Markdown，不要输出解释文字。',
    `JSON 结构示例：${JSON.stringify(jsonTemplate)}`,
    `日记内容：${JSON.stringify(entry)}`,
  ].join('\n')
}

app.get('/api/health', (_request, response) => {
  const { providerConfigured, model } = getServerConfig()

  response.json({
    ok: true,
    providerConfigured,
    model: model || null,
  })
})

app.post('/api/analyze-entry', async (request, response) => {
  const entry = request.body as AnalyzeEntryPayload
  const { apiKey, baseUrl, model, providerConfigured } = getServerConfig()

  if (!providerConfigured) {
    response.status(503).json({
      ok: false,
      error: 'AI 服务尚未配置，请检查 AI_API_KEY、AI_BASE_URL、AI_MODEL。',
    })
    return
  }

  if (!entry || typeof entry !== 'object' || !entry.title || !entry.content || !entry.date) {
    response.status(400).json({
      ok: false,
      error: '请求缺少必要的日记字段。',
    })
    return
  }

  try {
    const result = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              '你是一位日记陪伴助手。请根据用户内容给出支持性分析，并严格返回 JSON。',
          },
          {
            role: 'user',
            content: buildPrompt(entry),
          },
        ],
      }),
    })

    if (!result.ok) {
      const message = await result.text()
      response.status(502).json({
        ok: false,
        error: `上游模型接口调用失败：${result.status} ${message}`,
      })
      return
    }

    const payload = (await result.json()) as OpenAICompatibleResponse
    const content = extractAssistantContent(payload)
    const parsed = extractJsonObject(content)

    response.json({
      ok: true,
      data: {
        summary: parsed.summary,
        stressors: parsed.stressors ?? [],
        positiveSignals: parsed.positiveSignals ?? [],
        encouragement: parsed.encouragement,
        tomorrowSuggestion: parsed.tomorrowSuggestion,
        createdAt: new Date().toISOString(),
        sourceModel: model,
      },
    })
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'AI 分析失败。',
    })
  }
})

app.listen(port, () => {
  console.log(`Diary AI proxy running at http://localhost:${port}`)
})
