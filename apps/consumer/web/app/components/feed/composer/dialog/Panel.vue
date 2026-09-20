<script setup lang="ts">
  import { useComposer } from '../composables/useComposer'
  import { usePostComposerDialog } from '../composables/usePostComposerDialog'

  defineOptions({ name: 'FeedComposerDialogPanel' })

  const route = useRoute()
  const auth = useAuthStore()
  const { editId, submitting: dialogSubmitting, close } = usePostComposerDialog()
  const host = useComposer({ editId: editId.value ?? undefined })
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
    load,
    publish,
  } = host

  watch(submitting, v => (dialogSubmitting.value = v), { immediate: true })
  onBeforeUnmount(() => (dialogSubmitting.value = false))

  const loading = ref(editId.value != null)
  const submitLabel = computed(() => (editId.value != null ? '保存' : '发布'))
  onMounted(async () => {
    if (editId.value == null) return
    try {
      const detail = await hikariRequest<'/api/v3/posts/{id}'>('/api/v3/posts/{id}', {
        path: { id: editId.value },
        query: { preview: true },
      })
      load(detail)
    } finally {
      loading.value = false
    }
  })

  function removeCover(id: number) {
    covers.value = covers.value.filter(m => m.id !== id)
  }
  async function onPublish() {
    if (!(await publish())) return
    const id = editId.value
    const onDetail = id != null && route.path === `/posts/${id}`
    close()
    if (onDetail) await refreshNuxtData()
  }
</script>

<template>
  <div class="flex max-h-[80vh] flex-col">
    <div class="flex shrink-0 items-center justify-between border-b border-surface px-3 py-2.5">
      <Button
        label="取消"
        text
        severity="secondary"
        size="small"
        :disabled="submitting"
        @click="close"
      />
      <Button
        :label="submitLabel"
        size="small"
        :loading="submitting"
        :disabled="!canPublish"
        @click="onPublish"
      />
    </div>

    <div v-if="loading" class="grid h-40 place-items-center">
      <Spinner :size="32" />
    </div>
    <ScrollArea v-show="!loading" class="max-h-[calc(80vh-6rem)]" shadow="none">
      <div class="flex items-start gap-3 px-4 py-4">
        <Avatar :user="auth.user" shape="circle" class="size-9! shrink-0" />
        <FeedComposerBody
          v-model:title="title"
          :editor="editor"
          :expanded="true"
          fullscreen
          :title-over-limit="titleOverLimit"
        />
      </div>

      <FeedComposerCovers
        :show="covers.length > 0"
        :covers="covers"
        :covers-full="coversFull"
        @add="openCoverLibrary"
        @remove="removeCover"
      />

      <FeedComposerTopics
        :show="!loading"
        :topics="topics"
        :topics-full="topicsFull"
        @add="addTopic"
        @remove="removeTopic"
        @create="createTopic"
      />

      <FeedComposerRelatedWorks
        :show="!loading"
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
    </ScrollArea>

    <div class="shrink-0">
      <FeedComposerToolbar
        :show="true"
        hide-publish
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
      />
    </div>

    <HikariEditorOverlayHost :plugins="plugins" />
  </div>
</template>
