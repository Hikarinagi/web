<script setup lang="ts">
  import { Card, Stack, Tag, Text, Time } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { BackendLottery } from '~/features/lottery/lottery'
  import { useLotteryEntry } from '~/features/lottery/useLotteryEntry'

  defineOptions({ name: 'LotteryCard' })

  const props = defineProps<{ initial: BackendLottery }>()

  const { t } = useLocaleText()
  const entry = useLotteryEntry(() => props.initial)
  const { lottery, joining, join } = entry

  const claimOpen = ref(false)
  const lead = computed(() => lottery.value.prizes[0] ?? null)
  const total = computed(() => lottery.value.prizes.reduce((sum, item) => sum + item.quantity, 0))
  const result = computed(() => lottery.value.viewer.result)
  const prize = computed(() =>
    result.value?.kind === 'WON'
      ? (lottery.value.prizes.find(item => item.id === result.value?.prize_id) ?? null)
      : null,
  )
  const claimable = computed(
    () =>
      prize.value &&
      (prize.value.kind === 'CODE' || prize.value.kind === 'ACCOUNT') &&
      result.value?.status === 'PENDING',
  )
  const reason = computed(() =>
    result.value?.exclusion
      ? t(`lottery.exclusion.${result.value.exclusion}`, {
          days: lottery.value.min_account_days,
          preset: lottery.value.preset_label,
        })
      : '',
  )
</script>

<template>
  <Card
    :padded="false"
    class="hn-state-layer relative flex hn-interactive items-center gap-3 rounded-xl p-3 shadow-xs hn-press-none"
  >
    <NuxtLink
      :to="`/lotteries/${lottery.id}`"
      class="absolute inset-0 rounded-xl"
      :aria-label="lottery.title"
    />

    <LotteryPrizeImage v-if="lead" :prize="lead" class="size-16" />

    <Stack gap="none" justify="between" class="min-w-0 flex-1 self-stretch">
      <Text as="p" size="sm" weight="semibold" truncate class="m-0!">{{ lottery.title }}</Text>
      <Text v-if="lead" as="p" size="xs" tone="muted" truncate class="m-0!">
        {{
          total > lead.quantity
            ? t('lottery.prize.summary', { name: lead.name, total })
            : t('lottery.prize.summaryOne', { name: lead.name, quantity: lead.quantity })
        }}
      </Text>
      <Text v-if="prize" as="p" size="xs" tone="accent" weight="medium" truncate class="m-0!">
        {{ t('lottery.result.wonTier', { tier: prize.tier }) }}
      </Text>
      <Text
        v-else-if="result?.kind === 'STANDBY'"
        as="p"
        size="xs"
        tone="muted"
        truncate
        class="m-0!"
      >
        {{ t('lottery.result.standby', { rank: result.standby_rank }) }}
      </Text>
      <Text
        v-else-if="result?.kind === 'EXCLUDED'"
        as="p"
        size="xs"
        tone="warning"
        truncate
        class="m-0!"
      >
        {{ t('lottery.result.excludedReason', { reason }) }}
      </Text>
      <Text
        v-else-if="result?.kind === 'REVOKED'"
        as="p"
        size="xs"
        tone="danger"
        truncate
        class="m-0!"
      >
        {{ t('lottery.result.revokedNote', { note: result.revoke_note }) }}
      </Text>
      <Text v-else-if="result?.kind === 'LOST'" as="p" size="xs" tone="faint" truncate class="m-0!">
        {{ t('lottery.result.lost') }}
      </Text>
      <Text
        v-else-if="lottery.phase === 'SCHEDULED'"
        as="p"
        size="xs"
        tone="faint"
        truncate
        class="m-0!"
      >
        <LocaleMessage keypath="lottery.phase.scheduled">
          <template #time><Time :value="lottery.starts_at" /></template>
        </LocaleMessage>
      </Text>
      <Text
        v-else-if="lottery.phase === 'OPEN'"
        as="p"
        size="xs"
        tone="faint"
        truncate
        class="m-0!"
      >
        <LocaleMessage keypath="lottery.phase.open" :params="{ count: lottery.participant_count }">
          <template #time><Time :value="lottery.draws_at" />{{ ' ' }}</template>
        </LocaleMessage>
      </Text>
      <Text
        v-else-if="lottery.phase === 'DRAWING'"
        as="p"
        size="xs"
        tone="faint"
        truncate
        class="m-0!"
      >
        <LocaleMessage keypath="lottery.phase.drawing">
          <template #time><Time :value="lottery.announce_by" /></template>
        </LocaleMessage>
      </Text>
      <Text v-else as="p" size="xs" tone="faint" truncate class="m-0!">
        {{ t('lottery.phase.announced') }}
      </Text>
    </Stack>

    <Stack gap="none" class="relative z-1 shrink-0">
      <Button v-if="claimable" size="sm" @click="claimOpen = true">{{ t('lottery.claim') }}</Button>
      <Tag v-else-if="lottery.phase === 'OPEN' && lottery.viewer.joined" tone="success">
        {{ t('lottery.joined') }}
      </Tag>
      <Button
        v-else-if="lottery.phase === 'OPEN' && !lottery.viewer.ineligible"
        size="sm"
        login-required
        :loading="joining"
        @click="join"
      >
        {{ t('lottery.join') }}
      </Button>
    </Stack>

    <LotteryJoinDialog v-if="lottery.phase === 'OPEN' && !lottery.viewer.joined" :entry="entry" />
    <LotteryCodeDialog
      v-if="claimable && prize?.kind === 'CODE' && result?.winner_id"
      v-model:open="claimOpen"
      :winner-id="result.winner_id"
      :prize="prize"
      :lottery-title="lottery.title"
      @claimed="entry.refresh"
    />
    <LotteryAccountDialog
      v-else-if="claimable && prize?.kind === 'ACCOUNT' && result?.winner_id"
      v-model:open="claimOpen"
      :winner-id="result.winner_id"
      :prize="prize"
      @submitted="entry.refresh"
    />
  </Card>
</template>
