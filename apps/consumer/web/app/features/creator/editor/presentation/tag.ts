import type { EditorPresentation } from './types'

export const tagPresentation: EditorPresentation = {
  fields: {
    name: { label: '名称' },
    aliases: { label: '别名' },
    description: { label: '描述', control: 'textarea' },
  },
}
