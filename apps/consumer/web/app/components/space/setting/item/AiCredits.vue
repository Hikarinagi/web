<script setup lang="ts">
  import {
    AI_CREDITS_DESCRIPTION,
    AI_CREDITS_IMAGE,
    AI_CREDITS_NAME,
    useAiCredits,
  } from '~/features/items/ai-credits'
  import type { ItemsPageData } from '~~/server/api/pages/setting/items.get'

  const props = defineProps<{
    credits: ItemsPageData['ai_credits']
    refresh: () => Promise<unknown>
  }>()

  const { credits: current, purchase } = useAiCredits()
  watch(
    () => props.credits,
    next => (current.value = next),
    { immediate: true },
  )
</script>

<template>
  <SpaceSettingItemEntry
    :name="AI_CREDITS_NAME"
    :image="AI_CREDITS_IMAGE.src"
    :description="AI_CREDITS_DESCRIPTION"
    :purchased="credits.purchased"
    :price="credits.pack_price"
    unit="积分"
    validity="长期有效"
    action="购买"
    @purchase="purchase(() => refresh())"
  >
    <AiCreditAmount
      :balance="credits.balance"
      :free="credits.free_left"
      class="text-2xl font-semibold tracking-tight"
    />
  </SpaceSettingItemEntry>
</template>
