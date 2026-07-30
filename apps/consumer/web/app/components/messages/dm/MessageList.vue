<script setup lang="ts">
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
  <div class="relative min-h-0 flex-1">
    <div v-if="pending" class="absolute inset-0 flex items-center justify-center text-muted-color">
      <Spinner :size="32" />
    </div>
    <div
      v-else
      ref="scroller"
      class="dm-thread-scroll flex h-full flex-col-reverse gap-1 overflow-y-auto overscroll-contain px-4 py-3"
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
        <div v-if="startsDay(ordered, i)" class="flex justify-center py-1">
          <span
            class="rounded-full bg-surface-100 px-2.5 py-0.5 text-[11px] text-muted-color dark:bg-surface-800"
          >
            {{ dayLabel(m.sent_at) }}
          </span>
        </div>
      </template>

      <div
        v-if="!messages.length"
        class="flex flex-1 items-center justify-center text-[13px] text-muted-color"
      >
        给TA发点什么
      </div>
    </div>

    <div
      v-if="loadingOlder"
      class="pointer-events-none absolute inset-x-0 top-2 flex justify-center"
    >
      <div class="rounded-full bg-surface-0/90 p-1.5 shadow-sm dark:bg-surface-800/90">
        <Spinner :size="18" />
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="translate-y-2 opacity-0"
    >
      <Button
        v-if="newCount > 0"
        rounded
        size="small"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md"
        @click="toBottom(true)"
      >
        <template #icon><ChevronDown class="size-4" /></template>
        {{ newCount }} 条新消息
      </Button>
    </Transition>
  </div>
</template>

<style scoped>
  .dm-thread-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--p-surface-300) transparent;
  }
  :global(.dark) .dm-thread-scroll {
    scrollbar-color: var(--p-surface-600) transparent;
  }
</style>
