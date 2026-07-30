import type { components } from '@hikarinagi/api-contract/v3'
import { MentionUserExtension } from '@hikarinagi/editor-schema'
import type { Editor, Range } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion, { exitSuggestion, type SuggestionOptions } from '@tiptap/suggestion'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { ref } from 'vue'
import { useEditorSummariesMerge } from '../../composables/useEditorSummaries'
import type { EditorPlugin } from '../types'
import MentionUserNodeView from './MentionUserNodeView.vue'
import { createMentionSuggestionRender } from './composables/useMentionSuggestion'

// schema 的 MentionUserExtension 是纯数据模型(backend 也用),@ 触发器在编辑器侧挂。
type UserRefDto = components['schemas']['UserRefDto']
const mentionSuggestionKey = new PluginKey('hikariMentionSuggestion')

const MentionUser = MentionUserExtension.extend<{
  suggestion: Omit<SuggestionOptions, 'editor'>
}>({
  addOptions() {
    return {
      suggestion: { char: '@', allowSpaces: false },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        pluginKey: mentionSuggestionKey,
      }),
    ]
  },
  addNodeView() {
    return VueNodeViewRenderer(MentionUserNodeView)
  },
})

export const mention: EditorPlugin = {
  id: 'mention',
  group: null,
  order: 0,
  extensions: ctx => {
    const loadingRef = ref(false)
    const resolvedRef = ref(false)
    let searchSeq = 0
    const { mergeMentionUser } = useEditorSummariesMerge(ctx.summariesRef)

    const fetchUsers = async (query: string): Promise<UserRefDto[] | null> => {
      try {
        const res = await hikariRequest<'/api/v3/user'>('/api/v3/user', {
          query: { search: query, page: 1, page_size: 6 },
          toast: false,
        })
        return res.items
      } catch {
        return null
      }
    }

    const debouncedFetch = useDebounceFn(fetchUsers, 250)

    return [
      MentionUser.configure({
        suggestion: {
          shouldShow: ({ editor }) => !editor.view.composing,
          items: async ({ query }: { query: string }) => {
            const search = query.trim()
            const seq = ++searchSeq
            if (!search) {
              loadingRef.value = false
              resolvedRef.value = false
              return []
            }
            loadingRef.value = true
            resolvedRef.value = false
            try {
              const result = await debouncedFetch(search)
              if (seq !== searchSeq) return []
              if (Array.isArray(result)) {
                resolvedRef.value = true
                return result
              }
              return []
            } finally {
              if (seq === searchSeq) {
                loadingRef.value = false
              }
            }
          },
          render: createMentionSuggestionRender(loadingRef, resolvedRef, mentionSuggestionKey),
          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor
            range: Range
            props: UserRefDto
          }) => {
            mergeMentionUser(props)
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                { type: 'mention_user', attrs: { mention_user_id: props.id } },
                { type: 'text', text: ' ' },
              ])
              .run()
            exitSuggestion(editor.view, mentionSuggestionKey)
          },
        },
      }),
    ]
  },
}
