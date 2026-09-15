<script setup lang="ts">
  import { Button, Center, Flex, Inline, Spinner, Stack } from '@hina-ui/vue'
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
  <Stack gap="none" class="max-h-[80vh]">
    <Inline justify="between" class="shrink-0 border-b border-line px-3 py-2.5">
      <Button variant="ghost" tone="neutral" size="sm" :disabled="submitting" @click="close">
        取消
      </Button>
      <Button size="sm" :loading="submitting" :disabled="!canPublish" @click="onPublish">
        {{ submitLabel }}
      </Button>
    </Inline>

    <Center v-if="loading" class="h-40">
      <Spinner size="lg" />
    </Center>
    <ScrollArea v-show="!loading" class="max-h-[calc(80vh-6rem)]" shadow="none">
      <Flex gap="md" align="start" class="px-4 py-4">
        <Avatar :user="auth.user" class="size-9! shrink-0" />
        <FeedComposerBody
          v-model:title="title"
          :editor="editor"
          :expanded="true"
          fullscreen
          :title-over-limit="titleOverLimit"
        />
      </Flex>

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

    <Stack gap="none" class="shrink-0">
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
    </Stack>

    <HikariEditorOverlayHost :plugins="plugins" />
  </Stack>
</template>
