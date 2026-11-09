<script setup lang="ts">
  import { Section, Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { groupByDay, useStagePick } from '~/features/landing/stage'

  type StageVolume = ApiData<'/api/v3/landing/light-novels', 'get'>['volumes'][number]

  defineOptions({ name: 'LandingVolumeStage' })
  const props = defineProps<{ volumes: StageVolume[]; today: string }>()

  const days = computed(() => groupByDay(props.volumes, volume => volume.release_date, props.today))
  const upcoming = days.value.filter(day => !day.past).flatMap(day => day.items)
  const initial =
    upcoming.find(volume => volume.intro && volume.series.bunko) ??
    upcoming[0] ??
    props.volumes.at(-1)
  const { selected, hover, leave, tap } = useStagePick(initial!)
</script>

<template>
  <Section class="relative isolate">
    <LandingBackdrop :id="selected.id" :hash="selected.cover?.thumb_hash" />
    <Stack
      gap="lg"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-(--landing-stage-top) pb-12 lg:px-6"
    >
      <slot name="lead" />
      <VisuallyHidden as="h2">新卷与即将发售</VisuallyHidden>
      <LandingVolumeFeature :volume="selected" />
      <LandingVolumeStrip
        :days="days"
        :selected="selected.id"
        @hover="hover"
        @leave="leave"
        @tap="(event, volume) => tap(event, volume, volume.id === selected.id)"
      />
    </Stack>
  </Section>
</template>
