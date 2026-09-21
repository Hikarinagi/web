<script setup lang="ts">
  import { Empty, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { Sticker } from '@lucide/vue'
  import { useMySubscriptions } from '~/features/emoji/composables/useMySubscriptions'
  import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'

  defineOptions({ name: 'EmojiSubscriptionList' })

  const store = useEmojiManageStore()
  const { subscriptions, loaded, refresh, remove } = useMySubscriptions()
  const { refresh: refreshCatalog } = useUserEmojiCatalog()
  const { confirm } = useHikariConfirm()
  const unsubscribingId = ref<number | null>(null)

  watch(
    () => store.open,
    next => {
      if (next) void refresh()
    },
  )

  async function performUnsubscribe(setId: number) {
    if (unsubscribingId.value !== null) return
    unsubscribingId.value = setId
    try {
      await hikariRequest<'/api/v3/emoji/my-subscriptions/{emojiSetId}', 'delete'>(
        '/api/v3/emoji/my-subscriptions/{emojiSetId}',
        { method: 'delete', path: { emojiSetId: setId } },
      )
      remove(setId)
      void refreshCatalog()
    } finally {
      unsubscribingId.value = null
    }
  }

  function onUnsubscribeRequest(id: number, name: string) {
    confirm({
      title: '取消订阅',
      description: `确认取消订阅「${name}」？取消后该贴纸包将不再出现在编辑器中。`,
      confirmText: '取消订阅',
      cancelText: '保留',
      onConfirm: () => performUnsubscribe(id),
    })
  }
</script>

<template>
  <Stack gap="none" class="gap-3">
    <Text as="p" size="sm" tone="muted">你订阅的他人公开贴纸包，取消订阅后将从编辑器中移除。</Text>

    <Stack v-if="!loaded" gap="sm">
      <Skeleton class="h-16" />
      <Skeleton class="h-16" />
    </Stack>

    <Empty
      v-else-if="subscriptions.length === 0"
      size="sm"
      title="还没有订阅任何贴纸包"
      description="在文章/图文里 hover 别人的贴纸即可订阅"
      class="rounded-lg border border-dashed border-line py-10"
    >
      <template #icon><Sticker /></template>
    </Empty>

    <EmojiSubscriptionItem
      v-for="sub in subscriptions"
      v-else
      :key="sub.id"
      :sub="sub"
      :unsubscribing="unsubscribingId === sub.id"
      @unsubscribe-request="onUnsubscribeRequest"
    />
  </Stack>
</template>
