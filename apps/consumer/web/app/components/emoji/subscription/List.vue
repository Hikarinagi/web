<script setup lang="ts">
  import { useMySubscriptions } from '~/features/emoji/composables/useMySubscriptions'
  import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'

  defineOptions({ name: 'EmojiSubscriptionList' })

  const store = useEmojiManageStore()
  const { subscriptions, loaded, refresh, remove } = useMySubscriptions()
  const { refresh: refreshCatalog } = useUserEmojiCatalog()
  const confirm = useConfirm()
  const unsubscribingId = ref<number | null>(null)

  watch(
    () => store.open,
    next => {
      if (next) void refresh()
    },
  )

  async function performUnsubscribe(setId: number, close?: () => void) {
    if (unsubscribingId.value !== null) return
    unsubscribingId.value = setId
    try {
      await hikariRequest<'/api/v3/emoji/my-subscriptions/{emojiSetId}', 'delete'>(
        '/api/v3/emoji/my-subscriptions/{emojiSetId}',
        { method: 'delete', path: { emojiSetId: setId } },
      )
      close?.()
      remove(setId)
      void refreshCatalog()
    } finally {
      unsubscribingId.value = null
    }
  }

  function onUnsubscribeRequest(id: number, name: string) {
    confirm.require({
      group: 'app-shell',
      header: '取消订阅',
      message: `确认取消订阅「${name}」？取消后该贴纸包将不再出现在编辑器中。`,
      acceptLabel: '取消订阅',
      rejectLabel: '保留',
      closeOnEscape: false,
      loading: () => unsubscribingId.value === id,
      onAccept: ({ close }) => void performUnsubscribe(id, close).catch(() => {}),
    })
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm text-muted-color">你订阅的他人公开贴纸包,取消订阅后将从编辑器中移除。</p>

    <div v-if="!loaded" class="flex flex-col gap-2">
      <Skeleton height="4rem" />
      <Skeleton height="4rem" />
    </div>

    <div
      v-else-if="subscriptions.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-200 py-10 text-center dark:border-surface-700"
    >
      <p class="text-sm text-muted-color">还没有订阅任何贴纸包</p>
      <p class="text-xs text-muted-color">在文章/图文里 hover 别人的贴纸即可订阅</p>
    </div>

    <EmojiSubscriptionItem
      v-for="sub in subscriptions"
      v-else
      :key="sub.id"
      :sub="sub"
      :unsubscribing="unsubscribingId === sub.id"
      @unsubscribe-request="onUnsubscribeRequest"
    />
  </div>
</template>
