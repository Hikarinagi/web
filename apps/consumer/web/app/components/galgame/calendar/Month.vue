<script setup lang="ts">
  import { Button, MonthGrid, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameCalendarMonth' })
  defineProps<{
    month: string
    today: string
    firstYear: number
    lastYear: number
    counts: Map<string, number>
  }>()
  const emit = defineEmits<{ update: [month: string]; pick: [date: string] }>()
</script>

<template>
  <MonthGrid
    :month="month"
    :today="today"
    :min="`${firstYear}-01-01`"
    :max="`${lastYear}-12-31`"
    :show-outside-days="false"
    :day-padding="2"
    day-class="min-h-10 lg:min-h-12"
    size="sm"
    label="发售日历"
    @update:month="value => value && emit('update', value)"
  >
    <template #day="{ date, dayLabel, label, isToday, isOutside }">
      <Button
        v-if="!isOutside && counts.has(date)"
        size="sm"
        :variant="isToday ? 'solid' : 'soft'"
        class="h-full w-full min-w-0 flex-1 px-0 hn-press-none"
        :aria-label="`${label}，${counts.get(date)} 部作品发售`"
        @click="emit('pick', date)"
      >
        <Stack gap="none" align="center">
          <Text
            as="time"
            :datetime="date"
            :aria-current="isToday ? 'date' : undefined"
            size="sm"
            weight="medium"
            class="leading-tight text-current tabular-nums"
          >
            {{ dayLabel }}
          </Text>
          <Text
            as="span"
            size="xs"
            class="leading-tight text-current tabular-nums opacity-70 max-lg:hidden"
          >
            {{ counts.get(date) }} 部
          </Text>
        </Stack>
      </Button>
      <Text
        v-else-if="!isOutside"
        as="time"
        :datetime="date"
        :aria-current="isToday ? 'date' : undefined"
        size="sm"
        :tone="isToday ? 'accent' : 'default'"
        :weight="isToday ? 'semibold' : 'normal'"
        class="flex flex-1 items-center justify-center tabular-nums"
      >
        {{ dayLabel }}
      </Text>
    </template>
  </MonthGrid>
</template>
