<script setup lang="ts">
  import { Grid, Ripple, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { monthLength } from '~/features/galgame/calendar'
  import { weekdayLabel } from '~/features/landing/labels'
  import { useAlignTo } from '~/features/landing/stage'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameCalendarStrip' })
  const props = defineProps<{
    month: string
    today: string
    counts: Map<string, number>
    picked: string | null
  }>()
  const emit = defineEmits<{ pick: [date: string] }>()

  const area = useTemplateRef<{ viewport?: HTMLElement | null }>('area')
  useAlignTo(
    () => area.value?.viewport,
    () => area.value?.viewport?.querySelector<HTMLElement>('[data-today]'),
    'x',
  )

  const cells = computed(() => [
    ...Array.from({ length: monthLength(props.month) }, (_, offset) => {
      const date = `${props.month}-${String(offset + 1).padStart(2, '0')}`
      const weekday = weekdayLabel(date).slice(1)
      return {
        date,
        top: weekday,
        label: String(offset + 1),
        name: `${offset + 1} 日`,
        tone: weekday === '六' ? 'text-info-text' : weekday === '日' ? 'text-danger-text' : '',
        count: props.counts.get(date) ?? 0,
        now: date === props.today,
      }
    }),
    ...(props.counts.get('')
      ? [
          {
            date: '',
            top: '',
            label: '未定',
            name: '日期未定',
            tone: '',
            count: props.counts.get('') ?? 0,
            now: false,
          },
        ]
      : []),
  ])
</script>

<template>
  <ScrollArea ref="area" direction="horizontal" :wheel-redirect="false">
    <Grid
      gap="none"
      role="group"
      aria-label="本月每天发售的作品数"
      class="auto-cols-(--calendar-day-col) grid-flow-col grid-cols-none gap-0.5 py-1"
    >
      <Stack
        v-for="cell in cells"
        :key="cell.date"
        :data-today="cell.now || undefined"
        :as="cell.count ? 'button' : 'div'"
        :type="cell.count ? 'button' : undefined"
        :aria-label="cell.count ? `${cell.name}，${cell.count} 部作品` : undefined"
        :aria-pressed="cell.count ? picked === cell.date : undefined"
        gap="none"
        align="center"
        :class="
          cn(
            'relative isolate rounded-lg py-1.5 leading-tight',
            cell.count && 'hn-state-layer hn-interactive hn-press-lg',
            cell.now && 'bg-accent-soft',
            picked === cell.date && !cell.now && 'bg-subtle',
          )
        "
        @click="cell.count && emit('pick', cell.date)"
      >
        <Ripple v-if="cell.count" />
        <Text as="span" size="xs" :class="cn('h-4', cell.tone || 'text-faint')">
          {{ cell.now ? '今天' : cell.top }}
        </Text>
        <Text
          as="span"
          :weight="cell.count ? 'semibold' : 'normal'"
          :class="
            cn(
              'tabular-nums',
              cell.now ? 'text-accent-text' : cell.count ? 'text-fg' : 'text-disabled',
              !cell.top && 'text-sm',
            )
          "
        >
          {{ cell.label }}
        </Text>
        <Text as="span" size="xs" weight="medium" class="h-4 text-accent-text tabular-nums">
          {{ cell.count || '' }}
        </Text>
      </Stack>
    </Grid>
  </ScrollArea>
</template>
