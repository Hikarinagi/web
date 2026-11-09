<script setup lang="ts">
  import { Divider, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel, volumeLabel, weekdayLabel } from '~/features/landing/labels'
  import { useAlignTo, type LandingDay } from '~/features/landing/stage'
  import { novelWork } from '~/features/landing/works'

  type StageVolume = ApiData<'/api/v3/landing/light-novels', 'get'>['volumes'][number]

  defineOptions({ name: 'LandingVolumeStrip' })
  const props = defineProps<{ days: LandingDay<StageVolume>[]; today: string; selected: number }>()
  const emit = defineEmits<{
    hover: [volume: StageVolume]
    leave: []
    tap: [event: MouseEvent, volume: StageVolume]
  }>()

  const firstUpcoming = computed(() => props.days.findIndex(day => !day.past))
  const groups = computed(() =>
    props.days.map(day => ({
      ...day,
      entries: day.items.map(volume => ({
        volume,
        label: `${novelWork(volume.series).title}${volumeLabel(volume)}`,
      })),
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
  <ScrollRail ref="track" class="-mx-4 lg:-mx-6" @mouseleave="emit('leave')">
    <Inline gap="lg" :wrap="false" align="start" class="min-w-max px-4 pt-2 pb-3 lg:px-6">
      <template v-for="(day, index) in groups" :key="day.date">
        <Stack
          v-if="index === firstUpcoming"
          ref="marker"
          gap="sm"
          align="center"
          class="shrink-0 self-stretch"
        >
          <Text size="xs" weight="semibold" class="text-accent-text">今天</Text>
          <Divider orientation="vertical" class="flex-1 border-accent/40" />
        </Stack>
        <Stack gap="sm" class="shrink-0">
          <Text
            size="xs"
            weight="semibold"
            :tone="day.past ? 'muted' : undefined"
            class="tabular-nums"
          >
            {{ dayLabel(day.date) }}{{ weekdayLabel(day.date) }}
          </Text>
          <Inline gap="sm" :wrap="false">
            <NuxtLink
              v-for="{ volume, label } in day.entries"
              :key="volume.id"
              :to="`/light-novel-volumes/${volume.id}`"
              :aria-label="label"
              :class="
                cn(
                  'block w-(--landing-strip-cover) hn-interactive rounded-md',
                  volume.id === selected && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                )
              "
              @mouseenter="emit('hover', volume)"
              @click.capture="emit('tap', $event, volume)"
            >
              <EntryBookCover :media="volume.cover" :alt="label" :width="240" />
            </NuxtLink>
          </Inline>
        </Stack>
      </template>
    </Inline>
  </ScrollRail>
</template>
