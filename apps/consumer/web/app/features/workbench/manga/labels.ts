import { LANGUAGE_LABELS } from '~/features/galgame/labels'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export const MANGA_MODE_LABEL: Record<string, string> = {
  UPLOAD: '上传',
  TRANSLATION: '翻译',
}

export function projectKind(project: {
  mode: string
  source_lang: string | null
  target_lang: string | null
}): string {
  const language = (code: string | null) =>
    code ? (LANGUAGE_LABELS[code as keyof typeof LANGUAGE_LABELS] ?? code) : ''
  return project.mode === 'TRANSLATION'
    ? `${MANGA_MODE_LABEL.TRANSLATION} · ${language(project.source_lang)} → ${language(project.target_lang)}`
    : `${MANGA_MODE_LABEL.UPLOAD} · ${language(project.source_lang)}`
}

export const MANGA_ROLE_LABEL: Record<string, string> = {
  OWNER: '发起人',
  MANAGER: '管理',
  TRANSLATOR: '译者',
  PROOFREADER: '校对',
  TYPESETTER: '嵌字',
  REDRAWER: '修图',
  REVIEWER: '审稿',
}

export const MANGA_MEMBER_ROLE_OPTIONS = [
  { value: 'MANAGER', label: '管理' },
  { value: 'TRANSLATOR', label: '译者' },
  { value: 'PROOFREADER', label: '校对' },
  { value: 'TYPESETTER', label: '嵌字' },
  { value: 'REDRAWER', label: '修图' },
  { value: 'REVIEWER', label: '审稿' },
]

export const MANGA_TASK_LABEL: Record<string, string> = {
  DETECT: '标出文本框',
  OCR: '识别原文',
  TRANSLATE: 'AI 预翻译',
  INPAINT: '擦除原文',
}

export const MANGA_TASK_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: '排队中', tone: 'neutral' },
  RUNNING: { label: '处理中', tone: 'accent' },
  DONE: { label: '已完成', tone: 'success' },
  FAILED: { label: '失败', tone: 'danger' },
  CANCELLED: { label: '已取消', tone: 'neutral' },
}

export const MANGA_PAGE_STATE_META: Record<number, { label: string; tone: Tone }> = {
  0: { label: '未标注', tone: 'neutral' },
  10: { label: '已标注', tone: 'warning' },
  20: { label: '已翻译', tone: 'accent' },
  30: { label: '已嵌字', tone: 'success' },
}

export const MANGA_POSITION_OPTIONS = [
  { value: 'INSIDE', label: '框内' },
  { value: 'OUTSIDE', label: '框外' },
]
