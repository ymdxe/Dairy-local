import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { EMPTY_FORM } from '../constants'
import { EntryForm } from '../components/EntryForm'
import { EmptyState } from '../components/ui/EmptyState'
import { Panel } from '../components/ui/Panel'
import { createFormDataFromEntry, parseTags } from '../lib/utils'
import { clearDraft, getDraft, saveDraft } from '../repositories/draftRepository'
import { getEntryById, upsertEntry } from '../repositories/entryRepository'
import { useAppStore } from '../store/useAppStore'
import type { DiaryEntryFormData } from '../types'

function validate(formData: DiaryEntryFormData) {
  const errors: Partial<Record<keyof DiaryEntryFormData, string>> = {}

  if (!formData.title.trim()) {
    errors.title = '请写一个标题'
  }

  if (!formData.date) {
    errors.date = '请选择日期'
  }

  if (!formData.content.trim()) {
    errors.content = '正文不能为空'
  }

  return errors
}

export function EntryEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)

  const [formData, setFormData] = useState<DiaryEntryFormData>(EMPTY_FORM)
  const [tagsText, setTagsText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [draftHint, setDraftHint] = useState('草稿会自动保存到本地浏览器')
  const [errors, setErrors] = useState<Partial<Record<keyof DiaryEntryFormData, string>>>({})
  const [missingEntry, setMissingEntry] = useState(false)
  const initializedRef = useRef(false)

  const isEditMode = Boolean(id)

  useEffect(() => {
    void (async () => {
      initializedRef.current = false
      setMissingEntry(false)
      setLoading(true)

      if (id) {
        const [entry, draft] = await Promise.all([getEntryById(id), getDraft(id)])

        if (!entry) {
          setMissingEntry(true)
          setLoading(false)
          return
        }

        const nextForm = draft?.formData ?? createFormDataFromEntry(entry)
        setFormData(nextForm)
        setTagsText(nextForm.tags.join('，'))
        if (draft) {
          setDraftHint(`已恢复 ${dayjs(draft.updatedAt).format('M 月 D 日 HH:mm')} 的本地草稿`)
        }
      } else {
        const draft = await getDraft()
        const nextForm = draft?.formData ?? { ...EMPTY_FORM, date: dayjs().format('YYYY-MM-DD') }
        setFormData(nextForm)
        setTagsText(nextForm.tags.join('，'))
        if (draft) {
          setDraftHint(`已恢复 ${dayjs(draft.updatedAt).format('M 月 D 日 HH:mm')} 的本地草稿`)
        }
      }

      setErrors({})
      setLoading(false)
      initializedRef.current = true
    })()
  }, [id])

  useEffect(() => {
    if (!initializedRef.current) {
      return
    }

    const handle = window.setTimeout(async () => {
      await saveDraft(id, {
        ...formData,
        tags: parseTags(tagsText),
      })
      setDraftHint(`草稿已于 ${dayjs().format('HH:mm')} 自动保存`)
    }, 700)

    return () => window.clearTimeout(handle)
  }, [formData, id, tagsText])

  const pageTitle = useMemo(() => (isEditMode ? '编辑这篇日记' : '写一篇新的日记'), [isEditMode])

  const handleFieldChange = <K extends keyof DiaryEntryFormData>(field: K, value: DiaryEntryFormData[K]) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    const normalizedForm = {
      ...formData,
      tags: parseTags(tagsText),
    }
    const validationErrors = validate(normalizedForm)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      pushToast({
        title: '还有内容需要补充',
        description: '请先完成标题、日期和正文。',
        tone: 'error',
      })
      return
    }

    try {
      setSubmitting(true)
      const savedEntry = await upsertEntry(normalizedForm, id)
      await clearDraft(id)
      if (!id) {
        await clearDraft()
      }

      pushToast({
        title: '日记已保存',
        description: '内容已经写入本地浏览器存储。',
        tone: 'success',
      })
      navigate(`/entries/${savedEntry.id}`)
    } catch {
      pushToast({
        title: '保存失败',
        description: '请稍后再试。',
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Panel>
        <p className="text-sm text-slate-500">正在准备编辑器…</p>
      </Panel>
    )
  }

  if (missingEntry) {
    return (
      <EmptyState title="找不到要编辑的日记" description="它可能已经被删除，或者当前链接已经失效。">
        <Link to="/entries" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
          返回日记列表
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-6">
      <Panel className="space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{isEditMode ? 'Edit entry' : 'New entry'}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{pageTitle}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-500">
          用比较慢的节奏，把今天记下来。这里优先服务“写得舒服”和“以后好回看”。
        </p>
      </Panel>

      <Panel>
        <EntryForm
          formData={formData}
          tagsText={tagsText}
          errors={errors}
          draftHint={draftHint}
          submitting={submitting}
          onFieldChange={handleFieldChange}
          onTagsChange={setTagsText}
          onSubmit={handleSubmit}
        />
      </Panel>
    </div>
  )
}
