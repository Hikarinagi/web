<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { dayLabel, volumeLabel, weekdayLabel } from '~/features/landing/labels'
  import { useCentered, type LandingDay } from '~/features/landing/stage'
  import { novelWork } from '~/features/landing/works'

  type StageVolume = ApiData<'/api/v3/landing/light-novels', 'get'>['volumes'][number]

  defineOptions({ name: 'LandingVolumeStrip' })
  const props = defineProps<{
    days: LandingDay<StageVolume>[]
    selected: number
    running: boolean
    paused: boolean
  }>()
  const emit = defineEmits<{ pick: [volume: StageVolume]; advance: [] }>()

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

  useCentered(
    () => track.value?.viewport,
    () => props.selected,
  )
</script>

<template>
  <ScrollRail ref="track" class="-mx-4 lg:-mx-6">
    <Inline gap="lg" :wrap="false" align="start" class="min-w-max px-4 pt-2 pb-4 lg:px-6">
      <Stack v-for="day in groups" :key="day.date" gap="sm" class="shrink-0">
        <Text
          size="xs"
          weight="semibold"
          :tone="day.past ? 'muted' : undefined"
          class="tabular-nums"
        >
          {{ dayLabel(day.date) }}{{ weekdayLabel(day.date) }}
        </Text>
        <Inline gap="md" :wrap="false">
          <Stack
            v-for="{ volume, label } in day.entries"
            :key="volume.id"
            :data-stage-item="volume.id"
            as="button"
            type="button"
            gap="none"
            :aria-label="label"
            :aria-pressed="volume.id === selected"
            class="w-(--landing-strip-cover) hn-interactive rounded-md"
            @click="emit('pick', volume)"
          >
            <Stack
              gap="none"
              :class="
                cn(
                  'relative transition-transform duration-300',
                  volume.id === selected && 'scale-108',
                )
              "
            >
              <EntryBookCover :media="volume.cover" :alt="label" :width="240" />
              <Transition
                enter-active-class="transition-opacity duration-300"
                enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-300"
                leave-to-class="opacity-0"
              >
                <Stack
                  v-if="volume.id === selected"
                  gap="none"
                  class="pointer-events-none absolute -inset-1"
                >
                  <LandingPickRing
                    :running="running"
                    :paused="paused"
                    :cycle="volume.id"
                    round="var(--radius-xl)"
                    @done="emit('advance')"
                  />
                </Stack>
              </Transition>
            </Stack>
          </Stack>
        </Inline>
      </Stack>
    </Inline>
  </ScrollRail>
</template>
