<script setup lang="ts">
  import { Button, CopyButton, Dialog, Inline, Spinner, Stack, Text } from '@hina-ui/vue'
  import type { BackendLotteryPrize } from '~/features/lottery/lottery'

  const props = defineProps<{
    winnerId: number
    prize: BackendLotteryPrize
    lotteryTitle: string
  }>()
  const emit = defineEmits<{ claimed: [] }>()

  const { t } = useLocaleText()
  const open = defineModel<boolean>('open', { required: true })
  const code = ref<{ code: string; redeem_hint: string | null } | null>(null)

  watch(open, async next => {
    if (!next || code.value) return
    try {
      code.value = await hikariRequest('/api/v3/user/me/lottery/prizes/{id}/code', {
        method: 'POST',
        path: { id: props.winnerId },
      })
      emit('claimed')
    } catch {
      open.value = false
    }
  })
</script>

<template>
  <Dialog v-model:open="open" :title="t('lottery.code.title')" size="sm">
    <template #content>
      <Stack gap="md">
        <Stack gap="none">
          <Text as="span" size="sm" weight="medium">
            {{ t('lottery.prize.title', { tier: prize.tier, name: prize.name }) }}
          </Text>
          <Text as="span" size="xs" tone="muted">{{ lotteryTitle }}</Text>
        </Stack>
        <Inline
          gap="sm"
          align="center"
          :wrap="false"
          class="min-h-12 rounded-lg border border-line bg-subtle px-3 py-2.5"
        >
          <template v-if="code">
            <Text
              as="span"
              size="lg"
              weight="medium"
              class="min-w-0 flex-1 font-mono tracking-wide"
            >
              {{ code.code }}
            </Text>
            <CopyButton :text="code.code" :label="t('lottery.code.copy')" tooltip />
          </template>
          <Spinner v-else size="sm" />
        </Inline>
        <Text v-if="code?.redeem_hint" as="p" size="sm" class="m-0!">
          {{ t('lottery.code.redeemHint', { hint: code.redeem_hint }) }}
        </Text>
        <Text v-if="prize.note" as="p" size="sm" class="m-0!">{{ prize.note }}</Text>
        <Text as="p" size="xs" tone="muted" class="m-0!">{{ t('lottery.code.private') }}</Text>
      </Stack>
    </template>
    <template #footer>
      <Button @click="open = false">{{ t('common.close') }}</Button>
    </template>
  </Dialog>
</template>
