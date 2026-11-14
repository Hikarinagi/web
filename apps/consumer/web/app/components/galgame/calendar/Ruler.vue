<script setup lang="ts">
  import { Grid, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { monthLength } from '~/features/galgame/calendar'
  import { weekdayLabel } from '~/features/landing/labels'
  import { topVotedMedia } from '~/utils/media/image'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarRuler' })
  const props = defineProps<{
    month: string
    today: string
    days: { date: string; list: Item[] }[]
    picked: string | null
  }>()
  const emit = defineEmits<{ pick: [date: string] }>()

  const columns = computed(() => {
    const byDate = new Map(props.days.map(day => [day.date, day.list]))
    return Array.from({ length: monthLength(props.month) }, (_, offset) => {
      const date = `${props.month}-${String(offset + 1).padStart(2, '0')}`
      const list = byDate.get(date) ?? []
      const weekday = weekdayLabel(date).slice(1)
      return {
        date,
        day: offset + 1,
        weekday,
        tone: weekday === '六' ? 'text-info-text' : weekday === '日' ? 'text-danger-text' : '',
        rest: weekday === '六' || weekday === '日',
        covers: list.slice(0, 4).map(item => ({ id: item.id, media: topVotedMedia(item.covers) })),
        more: Math.max(0, list.length - 4),
        count: list.length,
        now: date === props.today,
      }
    })
  })
</script>

<template>
  <ScrollArea direction="horizontal" :wheel-redirect="false">
    <Grid
      gap="none"
      role="group"
      aria-label="本月每天的发售作品"
      class="h-(--calendar-ruler-height) auto-cols-(--calendar-ruler-col) grid-flow-col grid-cols-none items-end gap-1 pt-8"
    >
      <Stack
        v-for="column in columns"
        :key="column.date"
        :as="column.count ? 'button' : 'div'"
        :type="column.count ? 'button' : undefined"
        :aria-label="column.count ? `${column.day} 日，${column.count} 部作品发售` : undefined"
        :aria-pressed="column.count ? picked === column.date : undefined"
        gap="none"
        :class="
          cn(
            'relative h-full min-w-0 justify-end gap-1.5 rounded-md pb-0.5',
            column.rest && 'bg-subtle/70',
            column.count && 'hn-state-layer hn-interactive',
          )
        "
        @click="column.count && emit('pick', column.date)"
      >
        <Text
          v-if="column.now"
          as="span"
          size="xs"
          weight="semibold"
          class="absolute inset-x-0 -top-7 text-center whitespace-nowrap text-warning"
        >
          今天
        </Text>
        <Stack
          v-if="column.now"
          gap="none"
          aria-hidden="true"
          class="absolute top-0 bottom-9 left-1/2 border-s border-dashed border-warning"
        />
        <Stack
          v-if="column.count"
          gap="none"
          class="min-h-0 flex-col-reverse gap-1 overflow-hidden px-0.5"
        >
          <HikariImage
            v-for="cover in column.covers"
            :key="cover.id"
            :src="cover.media"
            alt=""
            :processing="{ width: 96, height: 54, fit: 'cover', gravity: 'top', quality: 80 }"
            class="aspect-video w-full shrink-0 overflow-hidden rounded-xs bg-subtle ring-1 ring-fg/10"
            image-class="object-cover object-top"
          />
          <Text
            v-if="column.more"
            as="span"
            size="xs"
            weight="semibold"
            tone="accent"
            class="text-center tabular-nums"
          >
            +{{ column.more }}
          </Text>
        </Stack>
        <Stack
          gap="none"
          align="center"
          :class="
            cn(
              'border-t-2 pt-1 leading-tight',
              column.now ? 'border-warning' : column.count ? 'border-accent' : 'border-line',
              picked === column.date && 'border-t-4 pt-0.5',
            )
          "
        >
          <Text
            as="span"
            size="sm"
            :weight="column.count || column.now ? 'semibold' : 'normal'"
            :class="
              cn(
                'font-mono tabular-nums',
                column.now ? 'text-warning' : column.count ? 'text-fg' : 'text-faint',
              )
            "
          >
            {{ column.day }}
          </Text>
          <Text as="span" size="xs" :class="column.tone || 'text-faint'">{{ column.weekday }}</Text>
        </Stack>
      </Stack>
    </Grid>
  </ScrollArea>
</template>
