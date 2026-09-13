<script setup lang="ts">
  import { useComposer, type ComposerTopic } from './composables/useComposer'

  defineOptions({ name: 'FeedComposerEditor' })

  const props = defineProps<{ topic?: ComposerTopic; sectionId?: number }>()

  const auth = useAuthStore()
  const confirm = useConfirm()
  const host = useComposer({ topic: props.topic, sectionId: props.sectionId })
  const {
    editor,
    plugins,
    title,
    covers,
    charCount,
    charLimit,
    overLimit,
    titleOverLimit,
    selectionEmpty,
    spoilerActive,
    hasPoll,
    pollDef,
    submitting,
    canPublish,
    coversFull,
    hasContent,
    topics,
    topicsFull,
    addTopic,
    removeTopic,
    createTopic,
    relatedWorks,
    relatedWorksFull,
    addWork,
    removeWork,
    entityCardItems,
    openCoverLibrary,
    openEmojiPicker,
    openMentionPicker,
    toggleSpoiler,
    openPoll,
    removePoll,
    openEntityCard,
    publish,
    reset,
  } = host

  const boxRef = ref<HTMLElement>()
  const { focused } = useFocusWithin(boxRef)
  const expanded = ref(false)
  watch(focused, f => {
    if (f) expanded.value = true
  })

  function onShellClick(event: MouseEvent) {
    if (!editor.value) return
    const target = event.target as HTMLElement
    if (target.closest('button, input, a, [contenteditable], [data-pc-section]')) return
    editor.value.commands.focus()
  }
  function removeCover(id: number) {
    covers.value = covers.value.filter(m => m.id !== id)
  }
  function collapse() {
    editor.value?.commands.blur()
    expanded.value = false
  }
  function onSwitchArticle() {
    navigateTo('/articles/new')
  }
  function onClear() {
    confirm.require({
      group: 'app-shell',
      header: '清空草稿',
      message: '会清掉当前正文、图片和本地草稿，确定吗？',
      acceptLabel: '清空',
      rejectLabel: '取消',
      onAccept: ({ close }: { close: () => void }) => {
        close()
        reset()
        collapse()
      },
    })
  }
  async function onPublish() {
    if (await publish()) collapse()
  }
</script>

<template>
  <div ref="boxRef" class="cursor-text" @click="onShellClick">
    <div class="flex items-start gap-3 px-4 py-4">
      <Avatar :user="auth.user" shape="circle" class="size-9! shrink-0" />
      <FeedComposerBody
        v-model:title="title"
        :editor="editor"
        :expanded="expanded"
        :title-over-limit="titleOverLimit"
      />
      <FeedComposerControls
        :expanded="expanded"
        :has-content="hasContent"
        @clear="onClear"
        @collapse="collapse"
        @switch-article="onSwitchArticle"
      />
    </div>

    <FeedComposerCovers
      :show="expanded && covers.length > 0"
      :covers="covers"
      :covers-full="coversFull"
      @add="openCoverLibrary"
      @remove="removeCover"
    />

    <FeedComposerTopics
      :show="expanded"
      :topics="topics"
      :topics-full="topicsFull"
      @add="addTopic"
      @remove="removeTopic"
      @create="createTopic"
    />

    <FeedComposerRelatedWorks
      :show="expanded"
      :works="relatedWorks"
      :full="relatedWorksFull"
      @add="addWork"
      @remove="removeWork"
    />

    <FeedComposerPollAttachment
      v-if="pollDef"
      :poll="pollDef"
      @edit="openPoll"
      @remove="removePoll"
    />

    <FeedComposerToolbar
      :show="expanded"
      :submitting="submitting"
      :can-publish="canPublish"
      :char-count="charCount"
      :char-limit="charLimit"
      :over-limit="overLimit"
      :covers-full="coversFull"
      :selection-empty="selectionEmpty"
      :spoiler-active="spoilerActive"
      :has-poll="hasPoll"
      :entity-items="entityCardItems"
      @emoji-click="openEmojiPicker"
      @image-click="openCoverLibrary"
      @mention-click="openMentionPicker"
      @spoiler-click="toggleSpoiler"
      @poll-click="openPoll"
      @entity-select="openEntityCard"
      @publish="onPublish"
    />

    <HikariEditorOverlayHost :plugins="plugins" />
  </div>
</template>
