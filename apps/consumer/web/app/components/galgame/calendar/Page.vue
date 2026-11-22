<script setup lang="ts">
  import { Empty, Heading, Inline, Stack } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { calendarDays } from '~/features/galgame/calendar'

  type Calendar = GalgamesCalendarPageData['calendar']

  defineOptions({ name: 'GalgameCalendarPage' })
  const props = defineProps<{ calendar: Calendar; month: string; pending?: boolean }>()
  const emit = defineEmits<{ update: [month: string] }>()

  const picked = ref<string | null>(null)
  const days = computed(() => calendarDays(props.calendar.items))
  const counts = computed(() => new Map(days.value.map(day => [day.date, day.list.length])))

  watch(
    () => props.month,
    () => (picked.value = null),
  )

  function pick(date: string) {
    picked.value = date
    document
      .getElementById(date ? `day-${date}` : 'day-undated')
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
</script>

<template>
  <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 pt-6 pb-16 lg:px-6">
    <Inline gap="md" align="center" justify="between">
      <Heading :level="1" class="text-3xl leading-tight font-bold max-sm:text-2xl">
        Galgame 发售日历
      </Heading>
      <GalgameCalendarSwitcher
        :calendar="calendar"
        :month="month"
        @update="emit('update', $event)"
      />
    </Inline>
    <Stack
      gap="none"
      class="sticky top-(--app-header-height) z-10 -mx-4 bg-canvas/90 px-4 backdrop-blur lg:-mx-6 lg:px-6"
    >
      <GalgameCalendarStrip
        :month="month"
        :today="calendar.today"
        :counts="counts"
        :picked="picked"
        @pick="pick"
      />
    </Stack>
    <Stack gap="none" class="relative gap-10">
      <Empty v-if="!days.length" title="这个月没有发售的作品" />
      <GalgameCalendarDay
        v-for="day in days"
        :key="day.date"
        :date="day.date"
        :list="day.list"
        :today="calendar.today"
      />
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
