<script setup lang="ts">
  import { Empty, Inline, ScrollArea, Stack, Text, toast } from '@hina-ui/vue'
  import type { ItemsPageData } from '~~/server/api/pages/me/items.get'
  import {
    MAKE_UP_CARD_IMAGE,
    MAKE_UP_CARD_NAME,
    makeUpCardItem,
  } from '~/features/items/make-up-card'
  import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'

  defineOptions({ name: 'MeItemMakeUpCard' })

  const props = defineProps<{
    card: ItemsPageData['make_up_card']
    points: number
    refresh: () => Promise<unknown>
  }>()

  const purchaseDialog = usePurchaseDialog()

  const soldOut = computed(() => props.card.purchased >= props.card.purchase_limit)
  const item = computed(() => makeUpCardItem(props.card, props.card.window_days))

  const expiryLabel = (value: string) =>
    new Date(value).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  const expiryGroups = computed(() => {
    const counts = new Map<string, number>()
    for (const item of props.card.items) {
      const label = expiryLabel(item.expires_at)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts].map(([label, count]) => ({ label, count }))
  })

  function purchase() {
    if (soldOut.value) return
    purchaseDialog.open({
      ...item.value,
      title: `购买${MAKE_UP_CARD_NAME}`,
      balance: props.points,
      onConfirm: async () => {
        await hikariRequest<'/api/v3/user/me/check-ins/make-up-cards', 'post'>(
          '/api/v3/user/me/check-ins/make-up-cards',
          { method: 'POST' },
        )
        await props.refresh()
        toast.success('补签卡已加入道具库')
      },
    })
  }
</script>

<template>
  <MeItemEntry
    :name="MAKE_UP_CARD_NAME"
    :image="MAKE_UP_CARD_IMAGE.src"
    :description="item.description"
    :available="card.available"
    :purchased="card.purchased"
    :limit="card.purchase_limit"
    :price="card.next_price"
    :validity="`有效期 ${card.valid_days} 天`"
    action="购买"
    @purchase="purchase"
  >
    <Empty
      v-if="!expiryGroups.length"
      description="暂无补签卡"
      :icon="false"
      size="sm"
      class="items-start p-0"
    />
    <ScrollArea v-else class="max-h-44 min-w-0 rounded-lg bg-subtle">
      <Stack gap="none" class="divide-y divide-line px-4">
        <Inline
          v-for="group in expiryGroups"
          :key="group.label"
          justify="between"
          align="center"
          class="py-2.5"
        >
          <Inline as="span" gap="xs" align="center">
            <MakeUpCard class="h-5" aria-hidden="true" />
            <Text as="span" size="sm">{{ group.label }} 到期</Text>
          </Inline>
          <Text as="span" size="sm" tone="muted">{{ group.count }} 张</Text>
        </Inline>
      </Stack>
    </ScrollArea>
  </MeItemEntry>
</template>
