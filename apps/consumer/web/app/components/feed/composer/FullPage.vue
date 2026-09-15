<script setup lang="ts">
  import { Button, Center, Flex, Inline, Spinner, Stack } from '@hina-ui/vue'
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
    class="fixed inset-0 z-60 flex flex-col bg-canvas"
    :initial="{ y: '100%' }"
    :animate="{ y: visible ? 0 : '100%' }"
    :transition="TRANSITION"
  >
    <Stack as="header" gap="none" class="border-b border-line">
      <Inline justify="between" :wrap="false" class="mx-auto w-full max-w-2xl px-3 py-2.5">
        <Button variant="ghost" tone="neutral" size="sm" :disabled="submitting" @click="leave">
          取消
        </Button>
        <Button size="sm" :loading="submitting" :disabled="!canPublish" @click="onPublish">
          {{ submitLabel }}
        </Button>
      </Inline>
    </Stack>

    <Center v-if="loading" class="mx-auto w-full max-w-2xl flex-1">
      <Spinner size="lg" />
    </Center>
    <Stack v-show="!loading" gap="none" class="mx-auto w-full max-w-2xl flex-1 overflow-y-auto">
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

      <Stack gap="none" class="mt-auto">
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
      </Stack>
    </Stack>

    <Stack gap="none" class="mx-auto w-full max-w-2xl">
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
  </motion.div>

  <HikariEditorOverlayHost :plugins="plugins" />
</template>
