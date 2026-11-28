<script setup lang="ts">
  import { Time, Timeline } from '@hina-ui/vue'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  const props = defineProps<{ lottery: LotteryPageData['lottery'] }>()

  const { t } = useLocaleText()
  const steps = computed(() => {
    const l = props.lottery
    const reached = { SCHEDULED: 0, OPEN: 1, DRAWING: 2, ANNOUNCED: 3 }[l.phase]
    return [
      { id: 'start', title: t('lottery.schedule.start'), at: l.starts_at, note: '' },
      { id: 'draw', title: t('lottery.schedule.draw'), at: l.draws_at, note: '' },
      {
        id: 'announce',
        title: t('lottery.schedule.announce'),
        at: null,
        note: t('lottery.schedule.announceWithin', { hours: l.announce_hours }),
      },
      {
        id: 'claim',
        title: t('lottery.schedule.claim'),
        at: null,
        note: t('lottery.schedule.claimWithin', { days: l.claim_days }),
      },
    ].map((step, index) => ({ ...step, tone: index < reached ? 'accent' : 'neutral' }) as const)
  })
</script>

<template>
  <Timeline :items="steps" size="sm" time-position="opposite">
    <template #time="{ item }">
      <Time v-if="item.at" :value="item.at" />
      <template v-else>{{ item.note }}</template>
    </template>
  </Timeline>
</template>
