import type { Editor, Range } from '@tiptap/core'
import type { Component } from 'vue'
import type { EditorPluginContext } from '../types'

export interface CommandActionContext {
  editor: Editor
  range: Range
  pluginContext: EditorPluginContext
}

export interface CommandMenuItem {
  id: string
  icon: Component
  command: string
  label: string
  description: string
  keywords: readonly string[]
  action: (ctx: CommandActionContext) => void | Promise<void>
}
