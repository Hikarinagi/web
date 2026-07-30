import { COMMENT_PRESET, type EditorDocument } from '@hikarinagi/editor-schema'
import { useTiptap } from '~/components/hikari-editor/composables/useTiptap'
import { emptyEditorSummaries } from '~/components/hikari-editor/composables/useEditorSummaries'
import { useEditorPlugins } from '~/components/hikari-editor/plugins'
import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'
import {
  buildContentEmojiIndex,
  provideContentEmojiSets,
  type EmojiSetDisplay,
} from '~/components/hikari-content/composables/useContentEmojiSets'
import {
  provideContentSummaries,
  type EntitySummaries,
} from '~/components/hikari-content/composables/useContentSummaries'
import { COMMENT_MAX_ATTACHMENTS, mergeEmojiSets } from '~/features/comment/comment'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import type { MediaValue } from '~/components/media-library/types'

export interface UseEditorHostOptions {
  initialContent?: EditorDocument
  documentEmojiSets?: () => EmojiSetDisplay[] | undefined
  initialSummaries?: () => EntitySummaries | undefined
  placeholder?: string
  autofocus?: boolean
  isSubmitting?: () => boolean
  initialAttachments?: () => MediaValue[]
  onSubmit: (
    content_json: EditorDocument,
    emojiSets: EmojiSetDisplay[],
    attachments: MediaValue[],
    summaries: EntitySummaries,
  ) => void
}

export function useEditorHost(opts: UseEditorHostOptions) {
  const summariesRef = ref(opts.initialSummaries?.() ?? emptyEditorSummaries())
  provideContentSummaries(() => summariesRef.value)

  const documentEmojiSetsRef = ref<EmojiSetDisplay[]>(opts.documentEmojiSets?.() ?? [])
  if (opts.documentEmojiSets) {
    // 合并而非覆盖:picker 已 push 进来的本地快照(尚未保存的新选表情)不能被
    // thread.emojiSets 的并发重写冲掉——编辑中途 loadMore(滚动)/ expandReplies 都会
    // 触发 absorb() 重新赋值该 ref,hard-overwrite 会丢掉本地快照导致保存后贴纸无 src。
    watch(opts.documentEmojiSets, next => {
      documentEmojiSetsRef.value = mergeEmojiSets(next ?? [], documentEmojiSetsRef.value)
    })
  }
  const { sets: userCatalogSets } = useUserEmojiCatalog()
  const emojiIndex = computed(() =>
    buildContentEmojiIndex({
      documentSets: documentEmojiSetsRef.value,
      userCatalogSets: userCatalogSets.value,
    }),
  )
  provideContentEmojiSets(() => emojiIndex.value)

  const plugins = useEditorPlugins('comment')
  const isEmpty = ref(true)
  const charCount = ref(0)
  const charLimit = COMMENT_PRESET.limits.max_plain_text_chars
  const overLimit = computed(() => charCount.value > charLimit)
  const selectionEmpty = ref(true)
  const spoilerActive = ref(false)

  const { open: openLibrary } = useMediaLibrary()
  const attachments = ref<MediaValue[]>(opts.initialAttachments?.() ?? [])
  const attachmentsFull = computed(() => attachments.value.length >= COMMENT_MAX_ATTACHMENTS)
  async function openMediaLibrary() {
    const remaining = COMMENT_MAX_ATTACHMENTS - attachments.value.length
    if (remaining <= 0) return
    const picks = await openLibrary({ mode: 'multiple', max: remaining })
    if (!picks.length) return
    const known = new Set(attachments.value.map(m => m.id))
    attachments.value = [...attachments.value, ...picks.filter(m => !known.has(m.id))].slice(
      0,
      COMMENT_MAX_ATTACHMENTS,
    )
  }
  function removeAttachment(id: number) {
    attachments.value = attachments.value.filter(m => m.id !== id)
  }
  function clearAttachments() {
    attachments.value = []
  }

  function trySubmit(): boolean {
    if (opts.isSubmitting?.()) return true
    const ed = editor.value
    if (!ed || (ed.isEmpty && attachments.value.length === 0)) return true
    if (overLimit.value) return true
    opts.onSubmit(
      ed.getJSON() as unknown as EditorDocument,
      documentEmojiSetsRef.value,
      attachments.value,
      summariesRef.value,
    )
    return true
  }

  const { editor, pluginContext } = useTiptap({
    plugins,
    summariesRef,
    documentEmojiSetsRef,
    initialContent: opts.initialContent,
    placeholder: opts.placeholder,
    editorProps: {
      handleKeyDown(_view, event) {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return trySubmit()
        return false
      },
    },
    onUpdate({ isEmpty: empty, charCount: count }) {
      isEmpty.value = empty
      charCount.value = count
      updateInlineState()
    },
    onSelectionUpdate() {
      updateInlineState()
    },
  })

  watch(editor, ed => {
    if (!ed) return
    updateInlineState()
    if (opts.autofocus) ed.commands.focus()
  })

  function updateInlineState() {
    const ed = editor.value
    if (!ed) {
      selectionEmpty.value = true
      spoilerActive.value = false
      return
    }
    selectionEmpty.value = ed.state.selection.empty
    spoilerActive.value = ed.isActive('spoiler')
  }

  const emojiPlugin = plugins.find(p => p.id === 'emoji')
  function openEmojiPicker(event: MouseEvent) {
    const ed = editor.value
    const anchor = event.currentTarget as HTMLElement | null
    if (!ed || !anchor || !emojiPlugin?.toolbarItem?.onClick) return
    emojiPlugin.toolbarItem.onClick(ed, pluginContext, anchor)
  }

  function openMentionPicker() {
    const ed = editor.value
    if (!ed) return
    ed.chain().focus().insertContent('@').run()
  }

  function toggleSpoiler() {
    const ed = editor.value
    if (!ed || selectionEmpty.value) return
    ed.chain().focus().toggleMark('spoiler').run()
    updateInlineState()
  }

  return {
    editor,
    plugins,
    pluginContext,
    isEmpty,
    charCount,
    charLimit,
    overLimit,
    trySubmit,
    openEmojiPicker,
    openMentionPicker,
    toggleSpoiler,
    selectionEmpty,
    spoilerActive,
    attachments,
    attachmentsFull,
    openMediaLibrary,
    removeAttachment,
    clearAttachments,
  }
}
