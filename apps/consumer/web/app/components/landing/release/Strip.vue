<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { dayLabel, weekdayLabel } from '~/features/landing/labels'
  import { useAlignTo, type LandingDay } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseStrip' })
  const props = defineProps<{ days: LandingDay<ScheduleItem>[]; selected: number }>()
  const emit = defineEmits<{ pick: [item: ScheduleItem] }>()

  const firstUpcoming = computed(() => props.days.findIndex(day => !day.past))
  const groups = computed(() =>
    props.days.map(day => ({
      ...day,
      entries: day.items.map(item => ({ item, work: galgameWork(item) })),
    })),
  )
  const track = useTemplateRef<{ viewport?: HTMLElement | null }>('track')
  const marker = useTemplateRef<{ $el: HTMLElement }[]>('marker')

  useAlignTo(
    () => track.value?.viewport,
    () => marker.value?.[0]?.$el,
    'x',
  )
</script>

<template>
  <ScrollRail ref="track" class="-mx-4">
    <Inline gap="lg" :wrap="false" align="start" class="min-w-max px-4 pt-2 pb-3">
      <Stack
        v-for="(day, index) in groups"
        :key="day.date"
        :ref="index === firstUpcoming ? 'marker' : undefined"
        gap="sm"
        class="shrink-0"
      >
        <Text
          size="xs"
          weight="semibold"
          :tone="day.past ? 'muted' : undefined"
          class="tabular-nums"
        >
          {{ dayLabel(day.date) }}{{ weekdayLabel(day.date) }}
        </Text>
        <Inline gap="sm" :wrap="false" align="start">
          <Stack
            v-for="{ item, work } in day.entries"
            :key="item.id"
            as="button"
            type="button"
            gap="xs"
            :aria-pressed="item.id === selected"
            class="w-(--landing-strip-cover) hn-interactive rounded-md text-start"
            @click="emit('pick', item)"
          >
            <HikariImage
              :src="work.cover"
              :alt="work.title"
              :ratio="3 / 4"
              :processing="{ width: 200, quality: 82, fit: 'cover' }"
              :class="
                cn(
                  'w-full overflow-hidden rounded-lg bg-subtle',
                  item.id === selected && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                )
              "
              image-class="object-cover"
            />
            <Text
              size="xs"
              :class="cn('line-clamp-2 leading-snug', item.id === selected && 'text-accent-text')"
            >
              {{ work.title }}
            </Text>
          </Stack>
        </Inline>
      </Stack>
    </Inline>
  </ScrollRail>
</template>
