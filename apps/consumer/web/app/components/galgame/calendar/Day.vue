<script setup lang="ts">
  import { Heading, Inline, SimpleGrid, Stack, Tag, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { dayLabel, daysBetween, weekdayLabel } from '~/features/landing/labels'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarDay' })
  const props = defineProps<{ date: string; list: Item[]; today: string }>()

  const left = computed(() => (props.date ? daysBetween(props.today, props.date) : null))
</script>

<template>
  <Stack
    :id="date ? `day-${date}` : 'day-undated'"
    as="section"
    gap="md"
    class="scroll-mt-(--calendar-anchor)"
  >
    <Inline gap="sm" align="baseline" :wrap="false">
      <Heading :level="2" class="text-xl leading-tight font-semibold tabular-nums">
        {{ date ? dayLabel(date) : '日期未定' }}
      </Heading>
      <Text v-if="date" tone="muted">{{ weekdayLabel(date) }}</Text>
      <Tag v-if="left === 0" tone="accent" class="self-center">今天</Tag>
      <Text v-else-if="left !== null && left > 0" size="sm" class="text-accent-text tabular-nums">
        还有 {{ left }} 天
      </Text>
      <Text v-else-if="left !== null" size="sm" tone="faint">已发售</Text>
      <Text size="sm" tone="faint" class="ml-auto shrink-0 tabular-nums">
        {{ list.length }} 部
      </Text>
    </Inline>
    <SimpleGrid min="10rem" gap="lg">
      <GalgameCalendarItem v-for="item in list" :key="item.id" :item="item" />
    </SimpleGrid>
  </Stack>
</template>
