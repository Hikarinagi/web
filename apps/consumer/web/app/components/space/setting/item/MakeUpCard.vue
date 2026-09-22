<script setup lang="ts">
  import { Button, Divider, Inline, Panel, ScrollArea, Stack, Text, toast } from '@hina-ui/vue'
  import type { ItemsPageData } from '~~/server/api/pages/setting/items.get'
  import {
    MAKE_UP_CARD_IMAGE,
    MAKE_UP_CARD_NAME,
    makeUpCardSummary,
  } from '~/features/items/make-up-card'
  import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'

  defineOptions({ name: 'SpaceSettingItemMakeUpCard' })

  const props = defineProps<{
    card: ItemsPageData['make_up_card']
    points: number
    refresh: () => Promise<unknown>
  }>()

  const purchaseDialog = usePurchaseDialog()

  const soldOut = computed(() => props.card.purchased >= props.card.purchase_limit)

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
      title: `购买${MAKE_UP_CARD_NAME}`,
      confirmLabel: '购买',
      name: MAKE_UP_CARD_NAME,
      description: makeUpCardSummary({
        windowDays: props.card.window_days,
        validDays: props.card.valid_days,
        purchased: props.card.purchased,
        purchaseLimit: props.card.purchase_limit,
      }),
      image: MAKE_UP_CARD_IMAGE,
      price: props.card.next_price,
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
  <Panel :title="MAKE_UP_CARD_NAME">
    <template #actions>
      <Button
        v-tooltip="soldOut ? '本月已达购买上限，下月可继续购买' : undefined"
        :disabled="soldOut"
        @click="purchase"
      >
        <template v-if="soldOut">已达购买上限</template>
        <template v-else>
          <Text as="span">购买</Text>
          <HikariPoint class="size-3.5" aria-hidden="true" />
          <Text as="span">{{ card.next_price }}</Text>
        </template>
      </Button>
    </template>

    <Inline gap="lg" align="start" :wrap="false">
      <MakeUpCard class="h-28" :alt="MAKE_UP_CARD_NAME" />

      <Stack gap="md" class="min-w-0 flex-1">
        <Stack gap="xs">
          <Text size="sm">
            用于补签本月配额之外或更早的漏签日，可补签范围为最近 {{ card.window_days }} 天。
          </Text>
          <Inline gap="md" class="gap-y-1">
            <Text as="span" size="xs" tone="muted">持有 {{ card.available }} 张</Text>
            <Text as="span" size="xs" tone="muted">
              本月已购买 {{ card.purchased }} / {{ card.purchase_limit }} 张
            </Text>
            <Text as="span" size="xs" tone="muted">有效期 {{ card.valid_days }} 天</Text>
          </Inline>
        </Stack>

        <Divider />

        <Text v-if="!expiryGroups.length" size="sm" tone="muted">暂无补签卡</Text>
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
      </Stack>
    </Inline>
  </Panel>
</template>
