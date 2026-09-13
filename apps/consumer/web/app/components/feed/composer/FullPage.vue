<script setup lang="ts">
  import { motion } from 'motion-v'
  import { useComposer } from './composables/useComposer'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'FeedComposerFullPage' })

  const props = defineProps<{ editId?: number }>()

  const auth = useAuthStore()
  const router = useRouter()
  const host = useComposer({ editId: props.editId })
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

  const visible = ref(false)
  const loading = ref(props.editId != null)
  const submitLabel = computed(() => (props.editId != null ? '保存' : '发布'))
  onMounted(async () => {
    visible.value = true
    if (props.editId != null) {
      try {
        const detail = await hikariRequest<'/api/v3/posts/{id}'>('/api/v3/posts/{id}', {
          path: { id: props.editId },
          query: { preview: true },
        })
        load(detail)
      } finally {
        loading.value = false
      }
    }
  })

  function leave() {
    if (window.history.state?.back) router.back()
    else navigateTo('/')
  }
  function removeCover(id: number) {
    covers.value = covers.value.filter(m => m.id !== id)
  }
  async function onPublish() {
    if (await publish()) navigateTo(props.editId != null ? `/posts/${props.editId}` : '/')
  }
</script>

<template>
  <motion.div
    class="fixed inset-0 z-60 flex flex-col bg-surface-0 dark:bg-surface-950"
    :initial="{ y: '100%' }"
    :animate="{ y: visible ? 0 : '100%' }"
    :transition="TRANSITION"
  >
    <div class="border-b border-surface-200 dark:border-surface-800">
      <div class="mx-auto flex max-w-2xl items-center justify-between px-3 py-2.5">
        <Button
          label="取消"
          text
          severity="secondary"
          size="small"
          :disabled="submitting"
          @click="leave"
        />
        <Button
          :label="submitLabel"
          size="small"
          :loading="submitting"
          :disabled="!canPublish"
          @click="onPublish"
        />
      </div>
    </div>

    <div v-if="loading" class="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
      <Spinner :size="32" />
    </div>
    <div v-show="!loading" class="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto">
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

      <div class="mt-auto">
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
      </div>
    </div>

    <div class="mx-auto w-full max-w-2xl">
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
  </motion.div>

  <HikariEditorOverlayHost :plugins="plugins" />
</template>
