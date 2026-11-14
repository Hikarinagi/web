<script setup lang="ts">
  import { Section, Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { groupByDay, useAutoplay, useStagePick } from '~/features/landing/stage'

  type StageVolume = ApiData<'/api/v3/landing/light-novels', 'get'>['volumes'][number]

  defineOptions({ name: 'LandingVolumeStage' })
  const props = defineProps<{ volumes: StageVolume[]; today: string }>()

  const days = computed(() => groupByDay(props.volumes, volume => volume.release_date, props.today))
  const upcoming = days.value.filter(day => !day.past).flatMap(day => day.items)
  const initial =
    upcoming.find(volume => volume.intro && volume.series.bunko) ??
    upcoming[0] ??
    props.volumes.at(-1)
  const { selected, pick } = useStagePick(initial!)
  const stage = useTemplateRef<{ $el: HTMLElement }>('stage')
  const { running, paused } = useAutoplay(() => stage.value?.$el)

  function advance() {
    const list = days.value.flatMap(day => day.items)
    pick(list[(list.indexOf(selected.value) + 1) % list.length] ?? selected.value)
  }
</script>

<template>
  <Section ref="stage" class="relative isolate">
    <LandingBackdrop :id="selected.id" :hash="selected.cover?.thumb_hash" />
    <Stack
      gap="lg"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-(--landing-stage-top) pb-12 lg:px-6"
    >
      <VisuallyHidden as="h2">新卷与即将发售</VisuallyHidden>
      <LandingVolumeFeature :volume="selected" />
      <LandingVolumeStrip
        :days="days"
        :selected="selected.id"
        :running="running"
        :paused="paused"
        @pick="pick"
        @advance="advance"
      />
    </Stack>
  </Section>
</template>
