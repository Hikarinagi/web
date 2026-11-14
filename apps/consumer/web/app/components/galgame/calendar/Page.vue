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

  watch(
    () => props.month,
    () => (picked.value = null),
  )

  function pick(date: string) {
    picked.value = date
    document.getElementById(`day-${date}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
</script>

<template>
  <Stack gap="xl" class="mx-auto w-full max-w-(--entry-container) px-4 pt-6 pb-16 lg:px-6">
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
    <Stack gap="xl" class="relative">
      <GalgameCalendarRuler
        :month="month"
        :today="calendar.today"
        :days="days"
        :picked="picked"
        @pick="pick"
      />
      <Stack gap="none">
        <Empty v-if="!days.length" title="这个月没有发售的作品" />
        <GalgameCalendarDay
          v-for="day in days"
          :key="day.date"
          :date="day.date"
          :list="day.list"
          :today="calendar.today"
        />
      </Stack>
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>
