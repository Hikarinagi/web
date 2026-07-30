import { PRIVATE_MESSAGE_PRESET, type EditorDocument } from '@hikarinagi/editor-schema'
import { useTiptap } from '~/components/hikari-editor/composables/useTiptap'
import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
import { useEditorPlugins } from '~/components/hikari-editor/plugins'
import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'
import {
  buildContentEmojiIndex,
  provideContentEmojiSets,
  type EmojiSetDisplay,
} from '~/components/hikari-content/composables/useContentEmojiSets'
import { provideContentSummaries } from '~/components/hikari-content/composables/useContentSummaries'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import type { MediaValue } from '~/components/media-library/types'

const MAX_ATTACHMENTS = 9

export interface UseDmComposerOptions {
  isSubmitting?: () => boolean
  onSubmit: (
    contentJson: EditorDocument,
    attachments: MediaValue[],
    emojiSets: EmojiSetDisplay[],
  ) => void
}

export function useDmComposer(opts: UseDmComposerOptions) {
  const summariesRef = ref(emptyEditorSummaries())
  provideContentSummaries(() => summariesRef.value)

  const documentEmojiSetsRef = ref<EmojiSetDisplay[]>([])
  const { sets: userCatalogSets } = useUserEmojiCatalog()
  const emojiIndex = computed(() =>
    buildContentEmojiIndex({
      documentSets: documentEmojiSetsRef.value,
      userCatalogSets: userCatalogSets.value,
    }),
  )
  provideContentEmojiSets(() => emojiIndex.value)

  const plugins = useEditorPlugins('private_message')
  const charCount = ref(0)
  const charLimit = PRIVATE_MESSAGE_PRESET.limits.max_plain_text_chars
  const overLimit = computed(() => charCount.value > charLimit)

  const { open: openLibrary } = useMediaLibrary()
  const attachments = ref<MediaValue[]>([])
  const attachmentsFull = computed(() => attachments.value.length >= MAX_ATTACHMENTS)
  async function openMediaLibrary() {
    const remaining = MAX_ATTACHMENTS - attachments.value.length
    if (remaining <= 0) return
    const picks = await openLibrary({ mode: 'multiple', max: remaining })
    if (!picks.length) return
    const known = new Set(attachments.value.map(m => m.id))
    attachments.value = [...attachments.value, ...picks.filter(m => !known.has(m.id))].slice(
      0,
      MAX_ATTACHMENTS,
    )
  }
  function removeAttachment(id: number) {
    attachments.value = attachments.value.filter(m => m.id !== id)
  }

  function trySubmit(): boolean {
    if (opts.isSubmitting?.()) return true
    const ed = editor.value
    if (!ed || (ed.isEmpty && attachments.value.length === 0) || overLimit.value) return true
    opts.onSubmit(
      ed.getJSON() as unknown as EditorDocument,
      attachments.value,
      documentEmojiSetsRef.value,
    )
    ed.commands.clearContent(true)
    attachments.value = []
    return true
  }

  const { editor, pluginContext } = useTiptap({
    plugins,
    summariesRef,
    documentEmojiSetsRef,
    placeholder: '发消息…',
    editorProps: {
      handleKeyDown(_view, event) {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.isComposing
        )
          return trySubmit()
        return false
      },
    },
    onUpdate({ charCount: count }) {
      charCount.value = count
    },
  })

  const emojiPlugin = plugins.find(p => p.id === 'emoji')
  function openEmojiPicker(event: MouseEvent) {
    const ed = editor.value
    const anchor = event.currentTarget as HTMLElement | null
    if (!ed || !anchor || !emojiPlugin?.toolbarItem?.onClick) return
    emojiPlugin.toolbarItem.onClick(ed, pluginContext, anchor)
  }

  return {
    editor,
    plugins,
    trySubmit,
    openEmojiPicker,
    attachments,
    attachmentsFull,
    openMediaLibrary,
    removeAttachment,
  }
}
