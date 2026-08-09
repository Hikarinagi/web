import { onBeforeUnmount, onMounted, provide, shallowRef, type Ref, type ShallowRef } from 'vue'
import { Extension, type Editor as CoreEditor, type EditorOptions } from '@tiptap/core'
import { dropCursor } from '@tiptap/pm/dropcursor'
import { Editor } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import type { EmojiSetDisplay } from '~/components/hikari-content/composables/useContentEmojiSets'
import type { EntitySummaries } from '~/components/hikari-content/composables/useContentSummaries'
import { useEditorOverlays } from './useEditorOverlays'
import {
  EDITOR_PLUGIN_CONTEXT_KEY,
  type EditorPlugin,
  type EditorPluginContext,
} from '../plugins/types'

const DropCursor = Extension.create({
  name: 'drop_cursor',
  addProseMirrorPlugins() {
    return [dropCursor({ width: 2, color: false, class: 'hikari-drop-cursor' })]
  },
})

export interface UseTiptapOptions {
  plugins: EditorPlugin[]
  summariesRef: Ref<EntitySummaries>
  documentEmojiSetsRef: Ref<EmojiSetDisplay[]>
  initialContent?: unknown
  editable?: boolean
  placeholder?: string
  editorProps?: EditorOptions['editorProps']
  onUpdate?: (ctx: { json: object; isEmpty: boolean; charCount: number }) => void
  onSelectionUpdate?: (ctx: { editor: CoreEditor }) => void
}

interface CountableNode {
  type?: string
  text?: string
  content?: CountableNode[]
}

function countChars(node: CountableNode): number {
  let n = 0
  if (node.type === 'text' && typeof node.text === 'string') {
    for (const _ of node.text) n++
  }
  if (node.type === 'mention_user' || node.type === 'emoji_inline') n += 1
  if (Array.isArray(node.content)) {
    for (const child of node.content) n += countChars(child)
  }
  return n
}

export interface UseTiptapReturn {
  editor: ShallowRef<Editor | null>
  isReady: Ref<boolean>
  pluginContext: EditorPluginContext
}

export function useTiptap(options: UseTiptapOptions): UseTiptapReturn {
  const editor: ShallowRef<Editor | null> = shallowRef(null)
  const isReady = shallowRef(false)

  const { openOverlay, closeOverlay } = useEditorOverlays()
  const ownerId = Symbol('hikari-editor-owner')
  const pluginContext: EditorPluginContext = {
    ownerId,
    openOverlay: (id, anchor, props) => openOverlay(id, anchor, props, ownerId),
    closeOverlay,
    summariesRef: options.summariesRef,
    documentEmojiSetsRef: options.documentEmojiSetsRef,
  }
  provide(EDITOR_PLUGIN_CONTEXT_KEY, pluginContext)

  const seen = new Set<string>()
  const pluginExtensions: NonNullable<ReturnType<NonNullable<EditorPlugin['extensions']>>> = []
  for (const p of options.plugins) {
    for (const ext of p.extensions?.(pluginContext) ?? []) {
      if (seen.has(ext.name)) continue
      seen.add(ext.name)
      pluginExtensions.push(ext)
    }
  }

  onMounted(() => {
    editor.value = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        // Node name must be snake_case to match the storage / pipeline-validation
        // / hikari-content renderer convention (hard_break). The Tiptap default
        // is camelCase (hardBreak), which fails pipeline validation on save and
        // isn't recognized when loading stored content.
        HardBreak.extend({ name: 'hard_break' }),
        History,
        Gapcursor,
        DropCursor,
        Placeholder.configure({ placeholder: options.placeholder ?? '' }),
        ...pluginExtensions,
      ],
      content: (options.initialContent as Editor['options']['content']) ?? '',
      editable: options.editable ?? true,
      editorProps: options.editorProps ?? {},
      onUpdate({ editor: ed }) {
        const json = ed.getJSON()
        options.onUpdate?.({
          json,
          isEmpty: ed.isEmpty,
          charCount: countChars(json as CountableNode),
        })
      },
      onSelectionUpdate({ editor: ed }) {
        options.onSelectionUpdate?.({ editor: ed })
      },
      onCreate() {
        isReady.value = true
      },
    })
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
    editor.value = null
  })

  return { editor, isReady, pluginContext }
}
