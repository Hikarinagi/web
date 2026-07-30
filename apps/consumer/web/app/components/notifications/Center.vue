<script setup lang="ts">
  import { ArrowLeft, BellOff, CheckCheck } from '@lucide/vue'
  import type { MessagesPageData } from '~~/server/api/pages/messages.get'
  import { MESSAGE_TABS, type MessageTab } from '~/features/notifications/notifications'
  import { useMessagesResults } from '~/features/notifications/composables/useMessagesResults'
  import { useUnread } from '~/features/notifications/useUnread'

  defineOptions({ name: 'NotificationsCenter' })
  const props = defineProps<{ initial: MessagesPageData }>()
  const emit = defineEmits<{ back: [] }>()

  const { displayed, state, pending, update, reload } = useMessagesResults(props.initial)
  const { set: setUnread } = useUnread()
  const listScroll = useTemplateRef<{ viewport: HTMLElement | null }>('listScroll')
  watch(
    () => state.value.type,
    () => {
      void nextTick(() => listScroll.value?.viewport?.scrollTo({ top: 0, behavior: 'smooth' }))
    },
  )

  const summary = computed(() => displayed.value.summary)
  const page = computed(() => displayed.value.page)

  function tabBadge(key: MessageTab) {
    return key === 'all' ? summary.value.total : summary.value[key]
  }

  const marking = ref(false)
  async function markAll() {
    marking.value = true
    try {
      await hikariRequest('/api/v3/system-messages/read-all', { method: 'POST' })
      await reload()
      setUnread(summary.value)
    } finally {
      marking.value = false
    }
  }
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <header
      class="flex h-14 shrink-0 items-center gap-2 border-b border-surface-200 px-3 dark:border-surface-800"
    >
      <Button
        rounded
        text
        severity="secondary"
        aria-label="返回"
        class="size-9! shrink-0 p-0! lg:hidden!"
        @click="emit('back')"
      >
        <template #icon><ArrowLeft class="size-5" /></template>
      </Button>

      <ScrollArea axis="x" wheel-to-horizontal class="min-w-0 flex-1">
        <div class="flex items-center gap-1 px-1">
          <Button
            v-for="t in MESSAGE_TABS"
            :key="t.key"
            unstyled
            class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              state.type === t.key
                ? 'bg-primary/10 text-primary'
                : 'text-muted-color hover:text-color'
            "
            @click="update({ type: t.key })"
          >
            {{ t.label }}
            <Badge v-if="tabBadge(t.key) > 0" :value="String(tabBadge(t.key))" severity="danger" />
          </Button>
        </div>
      </ScrollArea>

      <Button
        v-if="summary.total > 0"
        unstyled
        aria-label="全部已读"
        :disabled="marking"
        class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-color transition-colors hover:bg-emphasis hover:text-color disabled:opacity-60"
        @click="markAll"
      >
        <CheckCheck class="size-4" aria-hidden="true" />
        <span class="hidden sm:inline">全部已读</span>
      </Button>
    </header>

    <ScrollArea ref="listScroll" shadow="none" class="min-h-0 flex-1">
      <div class="px-3 py-3">
        <LoadingOverlay
          v-if="page.items.length"
          :loading="pending"
          content-class="flex flex-col gap-1"
        >
          <NotificationsItem v-for="m in page.items" :key="m.id" :item="m" />
        </LoadingOverlay>
        <CreatorEmpty v-else :icon="BellOff" text="还没有消息" />
      </div>
    </ScrollArea>

    <footer
      v-if="page.meta.total_items > page.meta.page_size"
      class="shrink-0 border-t border-surface-200 px-3 py-2 dark:border-surface-800"
    >
      <Paginator
        :meta="page.meta"
        :loading="pending"
        route="push"
        align="center"
        :scroll-target="listScroll?.viewport"
      />
    </footer>
  </div>
</template>
