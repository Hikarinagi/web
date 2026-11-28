<script setup lang="ts">
  import { Divider, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { BackendLotteryPrize } from '~/features/lottery/lottery'

  const props = defineProps<{ prizes: BackendLotteryPrize[] }>()

  const { t } = useLocaleText()
  const total = computed(() => props.prizes.reduce((sum, prize) => sum + prize.quantity, 0))
  const items = computed(() =>
    props.prizes.map(prize => {
      const value = prize.value === null ? '' : t('lottery.prize.value', { value: prize.value })
      const ended = !prize.note || /\p{Sentence_Terminal}$/u.test(prize.note)
      const note = ended ? prize.note : t('lottery.prize.note', { note: prize.note })
      const delivery = t(`lottery.prize.delivery.${prize.kind}`)
      return { prize, detail: t('lottery.prize.detail', { delivery, value, note }) }
    }),
  )
</script>

<template>
  <Stack as="section" gap="md">
    <Inline align="baseline" justify="between">
      <Heading :level="2" size="lg">{{ t('lottery.prize.heading') }}</Heading>
      <Text as="span" size="sm" tone="muted">{{ t('lottery.prize.count', { total }) }}</Text>
    </Inline>
    <Stack gap="md">
      <template v-for="({ prize, detail }, index) in items" :key="prize.id">
        <Divider v-if="index > 0" />
        <Inline gap="md" align="center" :wrap="false">
          <LotteryPrizeImage :prize="prize" class="size-20" />
          <Stack gap="none" class="min-w-0 flex-1 gap-1">
            <Inline gap="sm" align="center">
              <Tag tone="accent">{{ prize.tier }}</Tag>
              <Text as="span" size="sm" tone="muted">
                {{ t('lottery.prize.quantity', { quantity: prize.quantity }) }}
              </Text>
            </Inline>
            <Text as="span" weight="semibold">{{ prize.name }}</Text>
            <Text as="p" size="xs" tone="muted" class="m-0! leading-relaxed">{{ detail }}</Text>
          </Stack>
        </Inline>
      </template>
    </Stack>
  </Stack>
</template>
