<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { groupByDay, useAlignTo } from '~/features/landing/stage'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingGalgameCalendarBoard' })
  const props = defineProps<{ items: ScheduleItem[]; today: string }>()

  const days = computed(() =>
    groupByDay(props.items, item => item.release_date?.slice(0, 10), props.today),
  )
  const upcoming = computed(() => days.value.findIndex(day => !day.past))
  const rail = useTemplateRef<{ viewport?: HTMLElement | null }>('rail')
  useAlignTo(
    () => rail.value?.viewport,
    () => rail.value?.viewport?.querySelector<HTMLElement>('[data-upcoming]'),
    'x',
  )
</script>

<template>
  <LandingSection title="发售日历">
    <template #actions>
      <ViewAllLink to="/galgames/calendar">完整日历</ViewAllLink>
    </template>
    <ScrollRail ref="rail" class="-mx-4 lg:-mx-6">
      <Inline
        gap="none"
        align="start"
        :wrap="false"
        class="w-max gap-x-8 px-4 pb-2 lg:gap-x-10 lg:px-6"
      >
        <LandingGalgameCalendarDay
          v-for="(day, position) in days"
          :key="day.date"
          :day="day"
          :today="today"
          :data-upcoming="position === upcoming || undefined"
        />
      </Inline>
    </ScrollRail>
  </LandingSection>
</template>
