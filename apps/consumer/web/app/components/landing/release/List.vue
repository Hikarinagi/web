<script setup lang="ts">
  import { Divider, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel, weekdayLabel } from '~/features/landing/labels'
  import { useAlignTo, type LandingDay } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseList' })
  const props = defineProps<{ days: LandingDay<ScheduleItem>[]; today: string; selected: number }>()
  const emit = defineEmits<{
    hover: [item: ScheduleItem]
    leave: []
    tap: [event: MouseEvent, item: ScheduleItem]
  }>()

  const firstUpcoming = computed(() => props.days.findIndex(day => !day.past))
  const groups = computed(() =>
    props.days.map(day => ({
      ...day,
      entries: day.items.map(item => ({ item, work: galgameWork(item) })),
    })),
  )
  const area = useTemplateRef<InstanceType<typeof ScrollArea>>('area')
  const marker = useTemplateRef<{ $el: HTMLElement }[]>('marker')

  useAlignTo(
    () => area.value?.viewport,
    () => marker.value?.[0]?.$el,
    'y',
  )
</script>

<template>
  <ScrollArea ref="area" class="absolute inset-0" auto-hide="leave">
    <Stack gap="none" class="pb-3" @mouseleave="emit('leave')">
      <template v-for="(day, index) in groups" :key="day.date">
        <Inline
          v-if="index === firstUpcoming"
          ref="marker"
          gap="sm"
          align="center"
          :wrap="false"
          class="px-4 pt-4 pb-1"
        >
          <Text size="xs" weight="semibold" class="shrink-0 text-accent-text">今天</Text>
          <Text size="xs" weight="semibold" class="shrink-0 text-accent-text tabular-nums">
            {{ dayLabel(today) }}{{ weekdayLabel(today) }}
          </Text>
          <Divider class="flex-1 border-accent/40" />
        </Inline>
        <Text
          size="xs"
          weight="semibold"
          :tone="day.past ? 'muted' : undefined"
          class="sticky top-0 z-10 bg-surface px-4 pt-3 pb-1.5 tabular-nums"
        >
          {{ dayLabel(day.date) }}{{ weekdayLabel(day.date) }}
        </Text>
        <Inline
          v-for="{ item, work } in day.entries"
          :key="item.id"
          :as="NuxtLink"
          :to="work.to"
          gap="md"
          align="center"
          :wrap="false"
          :class="
            cn(
              'hn-state-layer mx-2 hn-interactive rounded-lg px-2 py-1.5',
              item.id === selected && 'bg-accent-soft',
            )
          "
          @mouseenter="emit('hover', item)"
          @click.capture="emit('tap', $event, item)"
        >
          <HikariImage
            :src="work.cover"
            :alt="work.title"
            :ratio="3 / 4"
            :processing="{ width: 120, quality: 82, fit: 'cover' }"
            class="w-11 shrink-0 overflow-hidden rounded-md bg-subtle"
            image-class="object-cover"
          />
          <Stack gap="none" class="min-w-0 gap-0.5">
            <Text
              size="sm"
              weight="medium"
              :class="cn('line-clamp-2 leading-snug', item.id === selected && 'text-accent-text')"
            >
              {{ work.title }}
            </Text>
            <Text size="xs" tone="muted" truncate>{{ work.sub }}</Text>
          </Stack>
        </Inline>
      </template>
    </Stack>
  </ScrollArea>
</template>
