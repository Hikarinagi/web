<script setup lang="ts">
  import {
    Button,
    IconButton,
    Inline,
    ScrollArea,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tag,
    Text,
  } from '@hina-ui/vue'
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
  <Tabs
    :model-value="state.type"
    variant="soft"
    size="sm"
    class="h-full min-h-0"
    @update:model-value="value => update({ type: value as MessageTab })"
  >
    <Inline as="header" gap="sm" :wrap="false" class="h-14 shrink-0 border-b border-line px-3">
      <IconButton
        label="返回"
        :tooltip="false"
        pill
        class="shrink-0 lg:hidden"
        @click="emit('back')"
      >
        <ArrowLeft />
      </IconButton>

      <TabsList label="消息分类" class="min-w-0 flex-1">
        <TabsTrigger v-for="t in MESSAGE_TABS" :key="t.key" :value="t.key">
          {{ t.label }}
          <Tag v-if="tabBadge(t.key) > 0" tone="danger" size="sm">{{ tabBadge(t.key) }}</Tag>
        </TabsTrigger>
      </TabsList>

      <Button
        v-if="summary.total > 0"
        variant="ghost"
        tone="neutral"
        size="sm"
        :disabled="marking"
        class="shrink-0"
        @click="markAll"
      >
        <template #icon><CheckCheck aria-hidden="true" /></template>
        <Text as="span" size="sm" class="hidden sm:inline">全部已读</Text>
      </Button>
    </Inline>

    <TabsContent :value="state.type" class="flex min-h-0 flex-1 flex-col">
      <ScrollArea ref="listScroll" :shadow="false" class="min-h-0 flex-1">
        <Stack gap="none" class="px-3 py-3">
          <Stack v-if="page.items.length" gap="xs" class="relative">
            <NotificationsItem v-for="m in page.items" :key="m.id" :item="m" />
            <LoadingOverlay :visible="pending" />
          </Stack>
          <CreatorEmpty v-else :icon="BellOff" text="还没有消息" />
        </Stack>
      </ScrollArea>
    </TabsContent>

    <Stack
      v-if="page.meta.total_items > page.meta.page_size"
      as="footer"
      gap="none"
      class="shrink-0 border-t border-line px-3 py-2"
    >
      <Paginator
        :meta="page.meta"
        :loading="pending"
        route="push"
        align="center"
        :scroll-target="listScroll?.viewport"
      />
    </Stack>
  </Tabs>
</template>
