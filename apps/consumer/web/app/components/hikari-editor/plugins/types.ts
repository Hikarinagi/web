import type { Component, InjectionKey, Ref } from 'vue'
import type { Editor, Extension, Mark, Node } from '@tiptap/core'
import type { EmojiSetDisplay } from '~/components/hikari-content/composables/useContentEmojiSets'
import type { EntitySummaries } from '~/components/hikari-content/composables/useContentSummaries'

export type ToolbarGroup = 'format-inline' | 'format-block' | 'insert-media' | 'insert-link'

export interface EditorPluginContext {
  ownerId: symbol
  openOverlay: (id: string, anchor: HTMLElement, props?: Record<string, unknown>) => void
  closeOverlay: (id: string) => void
  summariesRef: Ref<EntitySummaries>
  documentEmojiSetsRef: Ref<EmojiSetDisplay[]>
}

export interface ToolbarDropdownItem {
  id: string
  icon: Component
  label: string
  onClick: (editor: Editor, context: EditorPluginContext, trigger: HTMLElement) => void
}

export interface ToolbarItem {
  icon: Component
  tooltip: string
  isActive?: (editor: Editor) => boolean
  isDisabled?: (editor: Editor) => boolean
  // variant 'dropdown' 时 onClick 由 Toolbar 接管打开 dropdownItems 菜单；可省略
  onClick?: (editor: Editor, context: EditorPluginContext, trigger: HTMLElement) => void
  variant?: 'button' | 'dropdown'
  dropdownItems?: ToolbarDropdownItem[]
}

export interface EditorPlugin {
  id: string
  group: ToolbarGroup | null
  order: number
  extensions?: (ctx: EditorPluginContext) => Array<Extension | Node | Mark>
  toolbarItem?: ToolbarItem | null
  overlays?: Record<string, Component>
  shortcut?: string | null
  description?: string
}

export type EditorProfile = 'community' | 'comment' | 'post' | 'private_message'

export const EDITOR_PLUGIN_CONTEXT_KEY: InjectionKey<EditorPluginContext> = Symbol(
  'hikari-editor-plugin-ctx',
)
