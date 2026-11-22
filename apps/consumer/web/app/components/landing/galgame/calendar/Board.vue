<script setup lang="ts">
  import { Inline, Link } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { groupByDay, useAlignTo } from '~/features/landing/stage'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingGalgameCalendarBoard' })
  const props = defineProps<{ items: ScheduleItem[]; today: string }>()

  const days = computed(() =>
    groupByDay(props.items, item => item.release_date?.slice(0, 10), props.today),
  )
  const upcoming = computed(() => days.value.findIndex(day => !day.past))
  const row = useTemplateRef<{ $el: HTMLElement }>('row')
  useAlignTo(
    () => row.value?.$el,
    () => row.value?.$el.querySelector<HTMLElement>('[data-upcoming]'),
    'x',
  )
</script>

<template>
  <LandingSection title="发售日历">
    <template #actions>
      <Link
        :as="NuxtLink"
        to="/galgames/calendar"
        tone="neutral"
        class="inline-flex items-center gap-0.5 text-sm text-muted"
      >
        完整日历
        <ChevronRight class="size-4" />
      </Link>
    </template>
    <Inline
      ref="row"
      gap="xl"
      align="start"
      :wrap="false"
      class="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pb-2 lg:-mx-6 lg:px-6"
    >
      <LandingGalgameCalendarDay
        v-for="(day, position) in days"
        :key="day.date"
        :day="day"
        :today="today"
        :data-upcoming="position === upcoming || undefined"
      />
    </Inline>
  </LandingSection>
</template>
