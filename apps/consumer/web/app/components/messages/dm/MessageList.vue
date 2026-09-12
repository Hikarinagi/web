<script setup lang="ts">
  import { Button, Card, Center, Spinner, Stack, Tag } from '@hina-ui/vue'
  import { ChevronDown } from '@lucide/vue'
  import type { DmEmojiSet, ThreadMessage } from '~/features/messages/dm'
  import { dayLabel, isContinuation, showsMeta, startsDay } from '~/features/messages/dm'
  import { useThreadScroll } from './composables/useThreadScroll'

  defineOptions({ name: 'MessagesDmMessageList' })
  const props = defineProps<{
    messages: ThreadMessage[]
    emojiSets: DmEmojiSet[]
    pending: boolean
    hasMore: boolean
    loadingOlder: boolean
    peerId: number | null
  }>()
  const emit = defineEmits<{ loadOlder: []; retry: [message: ThreadMessage] }>()

  const ordered = computed(() => props.messages.slice().reverse())
  const { scroller, newCount, onScroll, toBottom } = useThreadScroll({
    messages: () => props.messages,
    hasMore: () => props.hasMore,
    loadingOlder: () => props.loadingOlder,
    peerId: () => props.peerId,
    loadOlder: () => emit('loadOlder'),
  })
</script>

<template>
  <Stack gap="none" class="relative min-h-0 flex-1">
    <Center v-if="pending" class="absolute inset-0 text-muted">
      <Spinner size="lg" />
    </Center>
    <Stack
      v-else
      ref="scroller"
      gap="none"
      class="dm-thread-scroll h-full flex-col-reverse gap-1 overflow-y-auto overscroll-contain px-4 py-3"
      @scroll="onScroll"
    >
      <template v-for="(m, i) in ordered" :key="m.id">
        <MessagesDmBubble
          :message="m"
          :emoji-sets="emojiSets"
          :show-meta="showsMeta(ordered, i)"
          :class="{ 'mt-2.5': !isContinuation(ordered, i) && !startsDay(ordered, i) }"
          @retry="emit('retry', m)"
        />
        <Center v-if="startsDay(ordered, i)" class="py-1">
          <Tag size="sm" pill>{{ dayLabel(m.sent_at) }}</Tag>
        </Center>
      </template>

      <Center v-if="!messages.length" class="flex-1 text-xs text-muted">给TA发点什么</Center>
    </Stack>

    <Center v-if="loadingOlder" class="pointer-events-none absolute inset-x-0 top-2">
      <Card
        :padded="false"
        class="flex items-center justify-center rounded-full bg-surface/90 p-1.5"
      >
        <Spinner />
      </Card>
    </Center>

    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="translate-y-2 opacity-0"
    >
      <Button
        v-if="newCount > 0"
        pill
        size="sm"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md"
        @click="toBottom(true)"
      >
        <template #icon><ChevronDown /></template>
        {{ newCount }} 条新消息
      </Button>
    </Transition>
  </Stack>
</template>

<style scoped>
  .dm-thread-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--hn-border-strong) transparent;
  }
</style>
