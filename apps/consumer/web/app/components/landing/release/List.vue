<script setup lang="ts">
  import { Divider, Inline, Ripple, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel, weekdayLabel } from '~/features/landing/labels'
  import { useAlignTo, useReveal, type LandingDay } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseList' })
  const props = defineProps<{ days: LandingDay<ScheduleItem>[]; today: string; selected: number }>()
  const emit = defineEmits<{ pick: [item: ScheduleItem] }>()

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
  useReveal(
    () => area.value?.viewport,
    () => props.selected,
    'y',
  )
</script>

<template>
  <ScrollArea ref="area" class="absolute inset-0" auto-hide="leave">
    <Stack gap="none" class="pb-3">
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
          class="px-4 pt-3 pb-1.5 tabular-nums"
        >
          {{ dayLabel(day.date) }}{{ weekdayLabel(day.date) }}
        </Text>
        <Inline
          v-for="{ item, work } in day.entries"
          :key="item.id"
          :data-stage-item="item.id"
          :as="item.images.length ? 'button' : NuxtLink"
          :type="item.images.length ? 'button' : undefined"
          :to="item.images.length ? undefined : work.to"
          :aria-pressed="item.images.length ? item.id === selected : undefined"
          gap="md"
          align="center"
          :wrap="false"
          class="hn-state-layer relative isolate mx-2 hn-interactive rounded-lg px-2 py-1.5 text-start"
          @click="item.images.length && emit('pick', item)"
        >
          <Ripple />
          <Stack
            gap="none"
            aria-hidden="true"
            :class="
              cn(
                'pointer-events-none absolute inset-0 -z-10 rounded-lg bg-accent-soft transition-opacity duration-300',
                item.id === selected ? 'opacity-100' : 'opacity-0',
              )
            "
          />
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
              :class="
                cn(
                  'line-clamp-2 leading-snug transition-colors duration-300',
                  item.id === selected && 'text-accent-text',
                )
              "
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
