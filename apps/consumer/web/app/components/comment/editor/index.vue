<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { Trash2 } from '@lucide/vue'
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import { useEditorHost } from './composables/useEditorHost'
  import EditorToolbarDropdown from '~/components/hikari-editor/toolbar/Dropdown.vue'
  import type { ToolbarDropdownItem } from '~/components/hikari-editor/plugins/types'
  import type { EmojiSetDisplay } from '~/components/hikari-content/composables/useContentEmojiSets'
  import type { EntitySummaries } from '~/components/hikari-content/composables/useContentSummaries'
  import type { MediaValue } from '~/components/media-library/types'
  import { EASE, TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'CommentEditor' })

  const props = withDefaults(
    defineProps<{
      initialContent?: EditorDocument
      documentEmojiSets?: EmojiSetDisplay[]
      initialSummaries?: EntitySummaries
      placeholder?: string
      submitting?: boolean
      submitLabel?: string
      cancelLabel?: string
      showCancel?: boolean
      autofocus?: boolean
      collapsible?: boolean
      replyToName?: string | null
      initialAttachments?: MediaValue[]
      rows?: number
      // overlay(贴纸/提及浮层)host 是否渲染。overlay 状态是模块级单例,同页多个编辑器实例
      // 会有多个 host 抢同一份状态(失活 host 的 mousedown 会抢先关掉浮层)。调用方需保证
      // 同一时刻只有一个编辑器开启 overlay(见 CommentSection:顶部仅在 !showDock 时开启)。
      overlayEnabled?: boolean
    }>(),
    {
      placeholder: '说点什么…',
      submitLabel: '评论',
      cancelLabel: '取消',
      showCancel: false,
      autofocus: false,
      collapsible: false,
      replyToName: null,
      initialAttachments: () => [],
      rows: 3,
      overlayEnabled: true,
    },
  )

  const emit = defineEmits<{
    submit: [
      content_json: EditorDocument,
      emojiSets: EmojiSetDisplay[],
      attachments: MediaValue[],
      summaries: EntitySummaries,
    ]
    cancel: []
  }>()

  const {
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
  } = useEditorHost({
    initialContent: props.initialContent,
    documentEmojiSets: () => props.documentEmojiSets,
    initialSummaries: () => props.initialSummaries,
    placeholder: props.placeholder,
    autofocus: props.autofocus,
    isSubmitting: () => props.submitting ?? false,
    initialAttachments: () => props.initialAttachments,
    onSubmit: (json, sets, atts, summaries) => emit('submit', json, sets, atts, summaries),
  })

  const WORK_CARD_IDS = ['galgame', 'light_novel', 'light_novel_volume']
  const workCardItems: ToolbarDropdownItem[] = (
    plugins.find(p => p.id === 'entity-card')?.toolbarItem?.dropdownItems ?? []
  ).filter(d => WORK_CARD_IDS.includes(d.id))
  const workDropdown = useTemplateRef<InstanceType<typeof EditorToolbarDropdown>>('workDropdown')
  function onWorkCardClick(event: MouseEvent) {
    const trigger = event.currentTarget as HTMLElement | null
    if (!trigger) return
    workDropdown.value?.open(workCardItems, trigger, event)
  }

  const boxRef = ref<HTMLElement>()
  const { focused } = useFocusWithin(boxRef)
  const opened = ref(!props.collapsible)
  watch(focused, f => {
    if (f) opened.value = true
  })
  // 点「回复」(reply-to-name 由空变为有)时主动聚焦:autofocus 只在编辑器创建时触发,dock
  // 已挂载(滚动已显示)时不会重新创建,需在此补焦点。仅非空时触发,避免取消(变 null)抢焦点。
  watch(
    () => props.replyToName,
    name => {
      if (!name) return
      opened.value = true
      editor.value?.commands.focus()
    },
  )
  const active = computed(
    () =>
      opened.value || !isEmpty.value || props.replyToName !== null || attachments.value.length > 0,
  )
  // 触发态(激活/聚焦)显示行数 → 输入区 min-height;初始/未激活恒 1 行。
  // 每行 = 14px 字号 × 1.5 行高 = 21px。注入给真实 surface(ProseMirror)和 SSR 占位 <p>。
  const inputMinH = computed(() => `${(active.value ? props.rows : 1) * 21}px`)
  function reset() {
    opened.value = false
    editor.value?.commands.clearContent()
    clearAttachments()
    ;(document.activeElement as HTMLElement | null)?.blur()
  }
  function focus() {
    opened.value = true
    editor.value?.commands.focus()
  }
  function onCancel() {
    reset()
    emit('cancel')
  }

  defineExpose({ focus, reset })
</script>

<template>
  <div
    ref="boxRef"
    class="flex flex-col rounded-(--editor-chrome-radius) border bg-surface-0 transition-[border-color,box-shadow] duration-200 dark:bg-surface-900"
    :class="
      focused
        ? 'border-hikari-primary-400 ring-2 ring-hikari-primary-100 dark:border-hikari-primary-500 dark:ring-hikari-primary-900/40'
        : 'border-surface-200 dark:border-surface-700'
    "
    :style="{ '--editor-input-min-h': inputMinH }"
  >
    <div class="comment-editor-input max-h-[200px] overflow-y-auto px-3 py-[9px]">
      <p
        v-if="!editor"
        class="text-sm leading-normal text-(--editor-placeholder-color)"
        :style="{ minHeight: 'var(--editor-input-min-h)' }"
      >
        {{ placeholder }}
      </p>
      <HikariEditor v-else :editor="editor" />
    </div>

    <AnimatePresence>
      <motion.div
        v-if="attachments.length"
        key="attachments"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <ScrollArea axis="x" class="px-3 pb-2">
          <div class="flex gap-2">
            <div
              v-for="m in attachments"
              :key="m.id"
              class="group/thumb relative size-16 shrink-0 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700"
            >
              <HikariImage
                :src="m.src"
                alt=""
                preset="small"
                class="size-full"
                image-class="size-full object-cover"
              >
                <template #empty><span /></template>
                <template #error><span /></template>
              </HikariImage>
              <div class="absolute top-1 right-1">
                <Button
                  unstyled
                  aria-label="移除"
                  class="flex size-5 items-center justify-center rounded-md bg-surface-900/60 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover/thumb:opacity-100 md:focus-visible:opacity-100"
                  @click.stop="removeAttachment(m.id)"
                >
                  <template #icon><Trash2 :size="12" /></template>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>

    <HikariEditorOverlayHost v-if="overlayEnabled" :plugins="plugins" />
    <EditorToolbarDropdown ref="workDropdown" :editor="editor" :context="pluginContext" />

    <AnimatePresence>
      <motion.div
        v-if="active"
        key="footer"
        :initial="{ height: 0 }"
        :animate="{ height: 'auto' }"
        :exit="{ height: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <motion.div
          :initial="{ opacity: 0, y: 4 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.18, delay: 0.04, ease: EASE }"
        >
          <CommentEditorFooter
            :submitting="submitting"
            :submit-label="submitLabel"
            :cancel-label="cancelLabel"
            :show-cancel="showCancel"
            :is-empty="isEmpty && attachments.length === 0"
            :image-full="attachmentsFull"
            :char-count="charCount"
            :char-limit="charLimit"
            :over-limit="overLimit"
            :selection-empty="selectionEmpty"
            :spoiler-active="spoilerActive"
            @emoji-click="openEmojiPicker"
            @mention-click="openMentionPicker"
            @spoiler-click="toggleSpoiler"
            @image-click="openMediaLibrary"
            @work-card-click="onWorkCardClick"
            @submit="trySubmit"
            @cancel="onCancel"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
  .comment-editor-input :deep(.hikari-editor-surface) {
    font-size: 14px;
    line-height: 1.5;
  }
  .comment-editor-input :deep(.ProseMirror) {
    min-height: var(--editor-input-min-h);
    transition: min-height 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .comment-editor-input :deep(.ProseMirror p) {
    margin: 0;
  }
  .comment-editor-input :deep(.ProseMirror p + p) {
    margin-top: 0.85em;
  }
</style>
