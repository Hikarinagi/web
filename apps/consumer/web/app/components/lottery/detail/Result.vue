<script setup lang="ts">
  import { Callout, Link, Text, Time } from '@hina-ui/vue'
  import { Gift } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendLottery, BackendLotteryPrize } from '~/features/lottery/lottery'

  const props = defineProps<{
    lottery: BackendLottery
    result: NonNullable<BackendLottery['viewer']['result']>
    prize: BackendLotteryPrize | null
  }>()

  const { t } = useLocaleText()
  const reason = computed(() =>
    props.result.exclusion
      ? t(`lottery.exclusion.${props.result.exclusion}`, {
          days: props.lottery.min_account_days,
          preset: props.lottery.preset_label,
        })
      : '',
  )
</script>

<template>
  <Callout
    v-if="result.kind === 'WON' && prize"
    tone="accent"
    :title="t('lottery.result.won', { tier: prize.tier, name: prize.name })"
  >
    <template #icon><Gift /></template>
    <Text v-if="result.status === 'PENDING' && result.claim_by" as="p" size="sm" class="m-0!">
      <LocaleMessage keypath="lottery.result.claimBy">
        <template #time><Time :value="result.claim_by" /></template>
      </LocaleMessage>
    </Text>
    <Text v-else-if="result.status === 'SUBMITTED'" as="p" size="sm" class="m-0!">
      {{ t('lottery.result.submitted') }}
    </Text>
    <Text v-else-if="result.status === 'FORFEITED'" as="p" size="sm" class="m-0!">
      {{ t('lottery.result.forfeited') }}
    </Text>
    <Text v-else-if="prize.kind === 'CODE'" as="p" size="sm" class="m-0!">
      <LocaleMessage keypath="lottery.result.codeClaimed">
        <template #link>
          <Link :as="NuxtLink" to="/me/prizes">{{ t('lottery.myPrizes') }}</Link>
        </template>
      </LocaleMessage>
    </Text>
    <Text v-else as="p" size="sm" class="m-0!">{{ t('lottery.result.delivered') }}</Text>
  </Callout>
  <Callout
    v-else-if="result.kind === 'STANDBY'"
    tone="neutral"
    :title="t('lottery.result.standby', { rank: result.standby_rank })"
  >
    <template v-if="lottery.refill">{{ t('lottery.result.refill') }}</template>
  </Callout>
  <Callout
    v-else-if="result.kind === 'EXCLUDED'"
    tone="warning"
    :title="t('lottery.result.excluded')"
  >
    {{ reason }}
  </Callout>
  <Callout v-else-if="result.kind === 'REVOKED'" tone="danger" :title="t('lottery.result.revoked')">
    {{ result.revoke_note }}
  </Callout>
  <Text v-else as="p" size="sm" tone="muted" class="m-0!">
    {{ t('lottery.result.lost') }}
  </Text>
</template>
