<script setup lang="ts">
  import { Card, Divider, Inline, Stack, Tag, Text, Time } from '@hina-ui/vue'
  import type { BackendLottery } from '~/features/lottery/lottery'
  import { useLotteryEntry } from '~/features/lottery/useLotteryEntry'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  const props = defineProps<{ initial: BackendLottery; winners: LotteryPageData['winners'] }>()

  const { t } = useLocaleText()
  const winnerCount = computed(
    () => props.winners?.reduce((sum, group) => sum + group.users.length, 0) ?? 0,
  )

  const auth = useAuthStore()
  const entry = useLotteryEntry(() => props.initial)
  const { lottery, ineligible, flagged, joining, following, join, follow, refresh } = entry

  const claimOpen = ref(false)
  const result = computed(() => lottery.value.viewer.result)
  const prize = computed(() =>
    result.value?.kind === 'WON'
      ? (lottery.value.prizes.find(item => item.id === result.value?.prize_id) ?? null)
      : null,
  )
  const claimable = computed(
    () =>
      (prize.value?.kind === 'CODE' && result.value?.status !== 'FORFEITED') ||
      (prize.value?.kind === 'ACCOUNT' &&
        (result.value?.status === 'PENDING' || result.value?.status === 'SUBMITTED')),
  )
  const checking = computed(
    () => lottery.value.phase === 'OPEN' && Boolean(auth.user) && !lottery.value.viewer.joined,
  )
</script>

<template>
  <Card>
    <Stack gap="md">
      <Inline gap="md" align="center" justify="between" :wrap="false">
        <Stack gap="none" class="min-w-0 gap-0.5">
          <Text as="span" size="xs" tone="muted">{{ t('lottery.drawTime') }}</Text>
          <Text as="span" size="xl" weight="semibold"><Time :value="lottery.draws_at" /></Text>
          <Text v-if="lottery.phase === 'SCHEDULED'" as="span" size="sm" tone="muted">
            <LocaleMessage keypath="lottery.phase.scheduled">
              <template #time><Time :value="lottery.starts_at" /></template>
            </LocaleMessage>
          </Text>
          <Text v-else-if="lottery.phase === 'OPEN'" as="span" size="sm" tone="muted">
            <LocaleMessage
              keypath="lottery.phase.open"
              :params="{ count: lottery.participant_count }"
            >
              <template #time><Time :value="lottery.draws_at" format="relative" /></template>
            </LocaleMessage>
          </Text>
          <Text v-else-if="lottery.phase === 'DRAWING'" as="span" size="sm" tone="muted">
            <LocaleMessage keypath="lottery.phase.drawing">
              <template #time><Time :value="lottery.announce_by" /></template>
            </LocaleMessage>
          </Text>
          <Text v-else as="span" size="sm" tone="muted">
            {{
              t('lottery.phase.summary', {
                count: lottery.participant_count,
                winners: winnerCount,
              })
            }}
          </Text>
        </Stack>

        <Stack gap="none" class="shrink-0">
          <Button v-if="claimable" size="lg" @click="claimOpen = true">
            {{ prize?.kind === 'CODE' ? t('lottery.viewCode') : t('lottery.fillAccount') }}
          </Button>
          <Tag
            v-else-if="lottery.phase === 'OPEN' && lottery.viewer.joined"
            tone="success"
            size="lg"
          >
            {{ t('lottery.joined') }}
          </Tag>
          <Button
            v-else-if="lottery.phase === 'OPEN' && !lottery.viewer.ineligible"
            size="lg"
            login-required
            :loading="joining"
            @click="join"
          >
            {{ t('lottery.joinTitle') }}
          </Button>
        </Stack>
      </Inline>

      <template v-if="checking">
        <Divider />
        <LotteryConditions
          :lottery="lottery"
          :flagged="flagged"
          :following="following"
          @follow="follow"
        />
        <Text v-if="ineligible" as="p" size="sm" tone="danger" class="m-0!">
          {{ ineligible }}
        </Text>
      </template>
      <Text
        v-else-if="lottery.phase === 'OPEN' && lottery.viewer.joined"
        as="p"
        size="sm"
        tone="muted"
        class="m-0!"
      >
        {{ t('lottery.recheck') }}
      </Text>

      <LotteryDetailResult v-if="result" :lottery="lottery" :result="result" :prize="prize" />
    </Stack>

    <LotteryCodeDialog
      v-if="prize?.kind === 'CODE' && result?.winner_id"
      v-model:open="claimOpen"
      :winner-id="result.winner_id"
      :prize="prize"
      :lottery-title="lottery.title"
      @claimed="refresh"
    />
    <LotteryAccountDialog
      v-else-if="prize?.kind === 'ACCOUNT' && result?.winner_id"
      v-model:open="claimOpen"
      :winner-id="result.winner_id"
      :prize="prize"
      @submitted="refresh"
    />
  </Card>
</template>
