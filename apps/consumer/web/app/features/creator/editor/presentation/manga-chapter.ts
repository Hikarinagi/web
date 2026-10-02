import type { EditorPresentation } from './types'

export const mangaChapterPresentation: EditorPresentation = {
  fields: {
    chapter_type: {
      label: '类型',
      control: 'select',
      options: [
        { value: 'SERIALIZATION', label: '连载' },
        { value: 'EXTRA', label: '番外' },
        { value: 'ONESHOT', label: '单篇' },
        { value: 'VOLUME', label: '整卷' },
      ],
    },
    chapter_number: { label: '话数' },
    name: { label: '标题' },
    name_cn: { label: '中文标题' },
    volume_id: { label: '所属卷' },
    publication_date: { label: '发表日期' },
  },
}
