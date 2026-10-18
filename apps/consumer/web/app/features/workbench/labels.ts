type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export const PROJECT_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: '进行中', tone: 'accent' },
  ACTIVE: { label: '进行中', tone: 'accent' },
  REVIEW: { label: '审核中', tone: 'warning' },
  PUBLISHED: { label: '已发布', tone: 'success' },
  STALE: { label: '已停滞', tone: 'danger' },
  ARCHIVED: { label: '已归档', tone: 'neutral' },
}

export const PROJECT_MODE_LABEL: Record<string, string> = {
  ENTRY: '录入',
  TRANSLATION: '翻译',
}

export const PROJECT_ROLE_LABEL: Record<string, string> = {
  OWNER: '发起人',
  MANAGER: '管理',
  TRANSLATOR: '译者',
  PROOFREADER: '校对',
  REVIEWER: '审稿',
}

export const MEMBER_ROLE_OPTIONS = [
  { value: 'MANAGER', label: '管理' },
  { value: 'TRANSLATOR', label: '译者' },
  { value: 'PROOFREADER', label: '校对' },
  { value: 'REVIEWER', label: '审稿' },
]

export const SOURCE_TAG_LABEL: Record<string, string> = {
  emphasis: '着重号',
  tcy: '纵中横',
  link: '链接',
  anchor: '锚点',
  image: '图片',
  ruby: '注音',
  break: '换行',
  style: '样式',
  other: '其他标记',
}

export const SEGMENT_STATE_META: Record<number, { label: string; tone: Tone }> = {
  0: { label: '未译', tone: 'neutral' },
  10: { label: '需修改', tone: 'danger' },
  20: { label: '已译', tone: 'accent' },
  30: { label: '已定稿', tone: 'success' },
}

export const TRANSLATION_QUALITY_LABEL: Record<string, string> = {
  HUMAN: '人工翻译',
  MACHINE_EDITED: '机翻润色',
  MACHINE: '机翻',
}

export const PRETRANSLATION_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: '排队中', tone: 'neutral' },
  RUNNING: { label: '翻译中', tone: 'accent' },
  DONE: { label: '已完成', tone: 'success' },
  FAILED: { label: '失败', tone: 'danger' },
  CANCELLED: { label: '已取消', tone: 'neutral' },
}

export const MODERATION_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: '等待审核', tone: 'neutral' },
  RUNNING: { label: '机器审核中', tone: 'accent' },
  PASSED: { label: '已通过', tone: 'success' },
  REJECTED: { label: '已驳回', tone: 'danger' },
  NEEDS_HUMAN: { label: '待人工审核', tone: 'warning' },
  FAILED: { label: '审核出错', tone: 'danger' },
}

export const MANGA_CHAPTER_TYPE_OPTIONS = [
  { value: 'SERIALIZATION', label: '连载' },
  { value: 'EXTRA', label: '番外' },
  { value: 'ONESHOT', label: '单篇' },
]
