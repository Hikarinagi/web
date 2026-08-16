export interface EditorSelectOption {
  value: string
  label: string
}

export interface EditorFieldPresentation {
  label: string
  // 'select' / 'multiselect':后端按自由字符串(string / string[])存储,但编辑器用固定选项呈现,
  // 选项 value+label 由前端 options 提供(非 Prisma 枚举字段)。
  control?: 'textarea' | 'select' | 'multiselect' | 'labels'
  options?: EditorSelectOption[]
  help?: string
  enableWhen?: (values: Record<string, unknown>) => boolean
  requireWhen?: (values: Record<string, unknown>) => boolean
}

export interface EditorPresentation {
  fields: Record<string, EditorFieldPresentation>
}
